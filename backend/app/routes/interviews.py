import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models import User, InterviewExperience, DocumentChunk, Upvote, Notification
from app.schemas import InterviewExperienceCreate, InterviewExperienceOut
from app.core.auth import get_current_user, get_current_admin
from app.services.rag_service import RAGService
from app.services.vector_service import VectorService
from app.routes.documents import check_and_award_points_badges

router = APIRouter(prefix="/interviews", tags=["Interview Experiences"])

@router.post("/", response_model=InterviewExperienceOut, status_code=status.HTTP_201_CREATED)
def create_interview_experience(
    payload: InterviewExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Creates a new interview experience record in PENDING state."""
    new_experience = InterviewExperience(
        uploader_id=current_user.id,
        company_name=payload.company_name,
        role=payload.role,
        aptitude_questions=payload.aptitude_questions,
        coding_questions=payload.coding_questions,
        hr_questions=payload.hr_questions,
        technical_questions=payload.technical_questions,
        timeline=payload.timeline,
        student_experience=payload.student_experience,
        selected=payload.selected,
        prep_resources=payload.prep_resources,
        status="PENDING"
    )
    db.add(new_experience)
    db.commit()
    db.refresh(new_experience)
    return new_experience

@router.get("/", response_model=List[InterviewExperienceOut])
def list_interviews(status_filter: Optional[str] = "APPROVED", db: Session = Depends(get_db)):
    """Lists interview experiences based on moderation status."""
    query = db.query(InterviewExperience)
    if status_filter:
        query = query.filter(InterviewExperience.status == status_filter)
    return query.all()

@router.get("/my", response_model=List[InterviewExperienceOut])
def list_my_interviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lists interview experiences posted by the logged-in user."""
    return db.query(InterviewExperience).filter(InterviewExperience.uploader_id == current_user.id).all()

@router.post("/approve/{interview_id}", response_model=InterviewExperienceOut)
def approve_interview(interview_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """Approves an interview experience and chunks/indexes its details in Qdrant."""
    exp = db.query(InterviewExperience).filter(InterviewExperience.id == interview_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Interview experience not found")
        
    if exp.status == "APPROVED":
        return exp
        
    exp.status = "APPROVED"
    db.commit()
    
    try:
        # Compile all questions and details into a single text representation
        content = (
            f"Company: {exp.company_name}\n"
            f"Role: {exp.role}\n"
            f"Timeline: {exp.timeline or 'N/A'}\n"
            f"Selected Status: {'Selected' if exp.selected else 'Not Selected'}\n"
            f"Aptitude Questions:\n{exp.aptitude_questions or 'None'}\n"
            f"Coding Questions:\n{exp.coding_questions or 'None'}\n"
            f"Technical Questions:\n{exp.technical_questions or 'None'}\n"
            f"HR Questions:\n{exp.hr_questions or 'None'}\n"
            f"Detailed Experience:\n{exp.student_experience or 'None'}\n"
            f"Preparation Resources:\n{exp.prep_resources or 'None'}"
        )
        
        chunks = RAGService.split_into_chunks(content)
        vector_chunks = []
        for idx, text_chunk in enumerate(chunks):
            v_id = str(uuid.uuid4())
            
            # Save chunk in DB
            db_chunk = DocumentChunk(
                interview_id=exp.id,
                chunk_index=idx,
                text_content=text_chunk,
                vector_id=v_id
            )
            db.add(db_chunk)
            
            vector_chunks.append({
                "id": v_id,
                "text": text_chunk,
                "metadata": {
                    "interview_id": exp.id,
                    "company_name": exp.company_name,
                    "title": f"Interview Experience at {exp.company_name} ({exp.role})",
                    "uploader_name": exp.uploader.full_name,
                    "course_id": None,
                    "course_code": None,
                    "category_id": None,
                    "is_project": False,
                    "is_interview": True
                }
            })
            
        if vector_chunks:
            VectorService.add_document_chunks(vector_chunks)
            
        # Award uploader +20 contribution points
        uploader = exp.uploader
        uploader.contribution_points += 20
        db.add(uploader)
        
        # Notify
        approve_notif = Notification(
            user_id=uploader.id,
            content=f"📈 Your interview experience at **'{exp.company_name}'** was approved! +20 contribution points."
        )
        db.add(approve_notif)
        
        check_and_award_points_badges(uploader, db)
        db.commit()
        db.refresh(exp)
    except Exception as e:
        exp.status = "PENDING"
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to chunk interview data: {e}"
        )
        
    return exp

@router.post("/reject/{interview_id}", response_model=InterviewExperienceOut)
def reject_interview(interview_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """Rejects an interview experience submission."""
    exp = db.query(InterviewExperience).filter(InterviewExperience.id == interview_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Interview experience not found")
        
    exp.status = "REJECTED"
    
    reject_notif = Notification(
        user_id=exp.uploader.id,
        content=f"⚠️ Your interview experience at **'{exp.company_name}'** was rejected by the admin team."
    )
    db.add(reject_notif)
    db.commit()
    db.refresh(exp)
    return exp

@router.post("/upvote/{interview_id}")
def upvote_interview(interview_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Upvotes an interview experience. Toggles the vote status."""
    exp = db.query(InterviewExperience).filter(InterviewExperience.id == interview_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Interview experience not found")
        
    existing_upvote = db.query(Upvote).filter(
        Upvote.user_id == current_user.id,
        Upvote.interview_id == exp.id
    ).first()
    
    uploader = exp.uploader
    
    if existing_upvote:
        db.delete(existing_upvote)
        exp.upvotes = max(0, exp.upvotes - 1)
        if uploader.id != current_user.id:
            uploader.contribution_points = max(0, uploader.contribution_points - 10)
        message = "Upvote removed"
    else:
        new_upvote = Upvote(user_id=current_user.id, interview_id=exp.id)
        db.add(new_upvote)
        exp.upvotes += 1
        if uploader.id != current_user.id:
            uploader.contribution_points += 10
            upvote_notif = Notification(
                user_id=uploader.id,
                content=f"❤️ A student upvoted your interview experience at **'{exp.company_name}'**! +10 contribution points."
            )
            db.add(upvote_notif)
        message = "Upvoted successfully"
        
    db.commit()
    
    check_and_award_points_badges(uploader, db)
    check_and_award_points_badges(current_user, db)
    db.commit()
    
    return {"message": message, "upvotes": exp.upvotes, "uploader_points": uploader.contribution_points}

@router.post("/view/{interview_id}")
def record_view(interview_id: int, db: Session = Depends(get_db)):
    """Records a view check on the interview post."""
    exp = db.query(InterviewExperience).filter(InterviewExperience.id == interview_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Interview experience not found")
    exp.views += 1
    db.commit()
    return {"views": exp.views}

@router.delete("/{interview_id}")
def delete_interview_admin(
    interview_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Librarian endpoint: Delete interview experience and revoke contribution points."""
    exp = db.query(InterviewExperience).filter(InterviewExperience.id == interview_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Interview experience not found")

    if exp.status == "APPROVED" and exp.uploader:
        uploader = exp.uploader
        uploader.contribution_points = max(0, uploader.contribution_points - 20)
        db.add(uploader)
        check_and_award_points_badges(uploader, db)

    db.delete(exp)
    db.commit()
    return {"message": f"Interview experience #{interview_id} deleted permanently."}
