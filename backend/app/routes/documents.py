import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db, SessionLocal
from app.models import User, Document, DocumentChunk, Category, Course, Upvote, Achievement, Notification
from app.schemas import DocumentOut
from app.core.auth import get_current_user, get_current_admin
from app.core.config import settings
from app.services.rag_service import RAGService
from app.services.vector_service import VectorService

router = APIRouter(prefix="/documents", tags=["Documents"])

async def run_ai_autotagging(doc_id: int):
    """Background task: Extracts text and runs AI auto-tagging without holding up user upload response."""
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc and doc.file_path:
            raw_text = RAGService.extract_text(doc.file_path)
            if raw_text:
                ai_tags = await RAGService.get_ai_tags(raw_text)
                existing_tags = [t.strip() for t in doc.tags.split(",") if t.strip()]
                new_tags = [t.strip() for t in ai_tags.split(",") if t.strip()]
                combined = list(set(existing_tags + new_tags))
                doc.tags = ", ".join(combined)
                db.commit()
    except Exception as e:
        print(f"[!] Background AI Auto-tagging failed: {e}")
    finally:
        db.close()

def check_and_award_points_badges(uploader: User, db: Session):
    """Utility to verify contribution points and count-based achievements for a student."""
    # Count approved uploads
    approved_count = db.query(Document).filter(
        Document.uploader_id == uploader.id,
        Document.status == "APPROVED"
    ).count()
    
    badges_to_award = []
    
    # 1. Upload count badges
    if approved_count >= 1:
        badges_to_award.append("first_contribution")
    if approved_count >= 5:
        badges_to_award.append("knowledge_overflow")
    if approved_count >= 10:
        badges_to_award.append("sage_of_acadence")
        
    # 2. Points-based badges
    if uploader.contribution_points >= 100:
        badges_to_award.append("best_senior")
    if uploader.contribution_points >= 500:
        badges_to_award.append("genius")
        
    # Check for friendly senior (at least 10 total files uploaded or upvotes given)
    upvotes_given = db.query(Upvote).filter(Upvote.user_id == uploader.id).count()
    if upvotes_given >= 10:
        badges_to_award.append("friendly_senior")
        
    for badge in badges_to_award:
        existing = db.query(Achievement).filter(
            Achievement.user_id == uploader.id,
            Achievement.badge_type == badge
        ).first()
        if not existing:
            new_badge = Achievement(user_id=uploader.id, badge_type=badge)
            db.add(new_badge)
            
            # Send notification
            badge_titles = {
                "first_contribution": "🎓 First Contribution Badge!",
                "knowledge_overflow": "📚 Knowledge Overflow Badge (5+ Uploads)!",
                "sage_of_acadence": "🧙‍♂️ Sage of Acadence Badge (10+ Uploads)!",
                "best_senior": "⭐ Best Senior Badge (100+ points)!",
                "genius": "🧠 Genius Badge (500+ points)!",
                "friendly_senior": "🤝 Friendly Senior Badge (10+ upvotes given)!"
            }
            title = badge_titles.get(badge, f"{badge.title()} Badge")
            new_notif = Notification(
                user_id=uploader.id,
                content=f"🎉 Milestone reached! You unlocked the **{title}**!"
            )
            db.add(new_notif)

from app.services.storage_service import StorageService

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB limit
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md", ".png", ".jpg", ".jpeg"}

def validate_upload_file(file: UploadFile):
    """Enforces 15MB file size limit and magic-byte MIME signature verification."""
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
        
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({round(file_size / (1024 * 1024), 2)}MB) exceeds maximum allowed limit of 15MB."
        )

    # Magic Bytes Signature check
    header = file.file.read(512)
    file.file.seek(0)
    
    if ext == ".pdf" and not header.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Corrupted file: Invalid PDF header signature.")
    elif ext == ".docx" and not header.startswith(b"PK\x03\x04"):
        raise HTTPException(status_code=400, detail="Corrupted file: Invalid DOCX archive signature.")
    elif ext == ".png" and not header.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(status_code=400, detail="Corrupted file: Invalid PNG image signature.")

@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    category_id: int = Form(...),
    course_id: Optional[int] = Form(None),
    is_project: bool = Form(False),
    tags: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Uploads a document in PENDING state and returns immediately while scheduling background AI tagging."""
    # Enforce file validation (15MB max size and magic byte MIME verification)
    validate_upload_file(file)

    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid Category ID")
        
    file_uuid = str(uuid.uuid4())
    safe_filename = f"{file_uuid}_{os.path.basename(file.filename)}"
    
    try:
        saved_file_path = StorageService.upload_file(
            file.file,
            safe_filename,
            content_type=file.content_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {e}"
        )
        
    new_doc = Document(
        title=title,
        file_path=saved_file_path,
        course_id=course_id,
        uploader_id=current_user.id,
        category_id=category_id,
        status="PENDING",
        is_project=is_project,
        tags=tags or ""
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    background_tasks.add_task(run_ai_autotagging, new_doc.id)
    return new_doc

@router.get("/", response_model=List[DocumentOut])
def list_documents(
    status_filter: Optional[str] = "APPROVED",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists uploaded documents for authenticated users."""
    query = db.query(Document)
    if status_filter:
        query = query.filter(Document.status == status_filter)
    return query.all()

@router.get("/my", response_model=List[DocumentOut])
def list_my_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lists documents uploaded by the currently logged-in student."""
    return db.query(Document).filter(Document.uploader_id == current_user.id).all()

@router.post("/approve/{doc_id}", response_model=DocumentOut)
def approve_document(doc_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """Moderator action: approves a document and triggers chunking/vector indexing."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.status == "APPROVED":
        return doc
        
    doc.status = "APPROVED"
    db.commit()
    
    # Process text, chunk, and index in Qdrant Vector DB
    try:
        text = RAGService.extract_text(doc.file_path)
        chunks = RAGService.split_into_chunks(text)
        
        vector_chunks = []
        for idx, text_chunk in enumerate(chunks):
            v_id = str(uuid.uuid4())
            
            # Save chunk metadata in DB
            db_chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=idx,
                text_content=text_chunk,
                vector_id=v_id
            )
            db.add(db_chunk)
            
            # Prepare payload for Qdrant
            vector_chunks.append({
                "id": v_id,
                "text": text_chunk,
                "metadata": {
                    "document_id": doc.id,
                    "title": doc.title,
                    "uploader_name": doc.uploader.full_name,
                    "course_id": doc.course_id,
                    "course_code": doc.course.code if doc.course else None,
                    "category_id": doc.category_id,
                    "is_project": doc.is_project,
                    "is_interview": False
                }
            })
            
        # Bulk index in Qdrant
        if vector_chunks:
            VectorService.add_document_chunks(vector_chunks)
            
        # Give points to uploader for contribution (+20 points)
        uploader = doc.uploader
        uploader.contribution_points += 20
        db.add(uploader)
        
        # Add notification
        approve_notif = Notification(
            user_id=uploader.id,
            content=f"📈 Your uploaded file **'{doc.title}'** was approved by the admin! +20 contribution points awarded."
        )
        db.add(approve_notif)
        
        # Check and award badges
        check_and_award_points_badges(uploader, db)
        
        db.commit()
        db.refresh(doc)
    except Exception as e:
        # Revert status if parsing fails entirely
        doc.status = "PENDING"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion pipeline error: {e}"
        )
        
    return doc

@router.post("/reject/{doc_id}", response_model=DocumentOut)
def reject_document(doc_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """Moderator action: rejects a document upload."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc.status = "REJECTED"
    
    # Notify uploader
    reject_notif = Notification(
        user_id=doc.uploader.id,
        content=f"⚠️ Your uploaded file **'{doc.title}'** was rejected by the admin team."
    )
    db.add(reject_notif)
    db.commit()
    db.refresh(doc)
    return doc

@router.post("/upvote/{doc_id}")
def upvote_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Upvotes a document. Toggles between upvoting and removing the upvote."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    existing_upvote = db.query(Upvote).filter(
        Upvote.user_id == current_user.id,
        Upvote.document_id == doc.id
    ).first()
    
    uploader = doc.uploader
    
    if existing_upvote:
        # Retract upvote
        db.delete(existing_upvote)
        doc.upvotes = max(0, doc.upvotes - 1)
        # Deduct points from uploader
        if uploader.id != current_user.id:
            uploader.contribution_points = max(0, uploader.contribution_points - 10)
        message = "Upvote removed"
    else:
        # Add upvote
        new_upvote = Upvote(user_id=current_user.id, document_id=doc.id)
        db.add(new_upvote)
        doc.upvotes += 1
        # Award points to uploader (+10 points)
        if uploader.id != current_user.id:
            uploader.contribution_points += 10
            
            # Send notification
            upvote_notif = Notification(
                user_id=uploader.id,
                content=f"❤️ A student upvoted your file **'{doc.title}'**! +10 contribution points."
            )
            db.add(upvote_notif)
        message = "Upvoted successfully"
        
    db.commit()
    
    # Recalculate uploader's badges since points might have changed
    check_and_award_points_badges(uploader, db)
    
    # Recalculate upvoter's friendly badge (friendly senior checks upvotes_given)
    check_and_award_points_badges(current_user, db)
    
    db.commit()
    
    return {"message": message, "upvotes": doc.upvotes, "uploader_points": uploader.contribution_points}

@router.post("/view/{doc_id}")
def record_view(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Increments the view counter for a document."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.views += 1
    db.commit()
    return {"views": doc.views}


# ============================================================
# ADMIN LIBRARIAN MANAGEMENT ENDPOINTS
# ============================================================
@router.get("/admin/all")
def get_all_documents_admin(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Librarian endpoint: Returns all documents across all statuses with full details."""
    docs = db.query(Document).options(
        joinedload(Document.category),
        joinedload(Document.course),
        joinedload(Document.uploader)
    ).order_by(Document.created_at.desc()).all()
    results = []
    for doc in docs:
        results.append({
            "id": doc.id,
            "title": doc.title,
            "category_id": doc.category_id,
            "category_name": doc.category.name if doc.category else "Uncategorized",
            "course_id": doc.course_id,
            "course_code": doc.course.code if doc.course else None,
            "course_name": doc.course.name if doc.course else None,
            "uploader_id": doc.uploader_id,
            "uploader_name": doc.uploader.full_name if doc.uploader else "Unknown",
            "uploader_year": doc.uploader.academic_year if doc.uploader else None,
            "status": doc.status,
            "upvotes": doc.upvotes,
            "views": doc.views,
            "downloads": doc.downloads,
            "is_project": doc.is_project,
            "tags": doc.tags or "",
            "file_path": doc.file_path,
            "created_at": doc.created_at
        })
    return results

@router.put("/{doc_id}")
def update_document_admin(
    doc_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Librarian endpoint: Edit document metadata (Title, Category, Course, Tags, Status, IsProject)."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if "title" in payload:
        doc.title = payload["title"]
    if "category_id" in payload:
        doc.category_id = int(payload["category_id"]) if payload["category_id"] else doc.category_id
    if "course_id" in payload:
        doc.course_id = int(payload["course_id"]) if payload["course_id"] else None
    if "tags" in payload:
        doc.tags = payload["tags"]
    if "is_project" in payload:
        doc.is_project = bool(payload["is_project"])
    if "status" in payload and payload["status"] in ["PENDING", "APPROVED", "REJECTED"]:
        doc.status = payload["status"]
        
    db.commit()
    db.refresh(doc)
    return {"message": "Document updated successfully", "id": doc.id}

@router.delete("/{doc_id}")
def delete_document_admin(
    doc_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Librarian endpoint: Delete document, purge vector embeddings, and remove physical file."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # 1. Purge vector chunks from Qdrant
    try:
        VectorService.delete_document_vectors(doc.id)
    except Exception as e:
        print(f"[!] Qdrant vector deletion warning: {e}")
        
    # 2. Delete file from S3 or local disk
    if doc.file_path:
        try:
            StorageService.delete_file(doc.file_path)
        except Exception as e:
            print(f"[!] Storage removal warning: {e}")
            
    # 3. Deduct awarded contribution points if the document was previously approved
    if doc.status == "APPROVED" and doc.uploader:
        uploader = doc.uploader
        uploader.contribution_points = max(0, uploader.contribution_points - 20)
        db.add(uploader)
        check_and_award_points_badges(uploader, db)

    # 4. Delete Document record from SQLite
    db.delete(doc)
    db.commit()
    return {"message": f"Document #{doc_id} deleted permanently from database, disk, and vector memory."}
