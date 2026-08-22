import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import httpx

from app.db.session import get_db
from app.models import User, Document, InterviewExperience, SearchLog, Announcement, Category, Course, ContactSubmission
from app.core.auth import get_current_admin
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin Operations"], dependencies=[Depends(get_current_admin)])

# --- User Management ---
@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    """Lists all registered users in the database."""
    return db.query(User).all()

@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, role: str, db: Session = Depends(get_db)):
    """Promotes/demotes a user role (student <-> admin)."""
    if role not in ["student", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role value")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = role
    db.commit()
    return {"message": f"User role updated to {role}", "user_id": user_id}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Deletes a user account from the system."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully", "user_id": user_id}

from sqlalchemy.orm import joinedload

# --- Resource Management (Moderation) ---
@router.get("/resources/pending")
def get_pending_resources(db: Session = Depends(get_db)):
    """Retrieves all pending document and interview submissions awaiting moderation."""
    docs = db.query(Document).options(
        joinedload(Document.uploader),
        joinedload(Document.category),
        joinedload(Document.course)
    ).filter(Document.status == "PENDING").all()
    
    interviews = db.query(InterviewExperience).options(
        joinedload(InterviewExperience.uploader)
    ).filter(InterviewExperience.status == "PENDING").all()
    
    enriched_docs = []
    for d in docs:
        enriched_docs.append({
            "id": d.id,
            "type": "document",
            "title": d.title,
            "uploader_name": d.uploader.full_name if d.uploader else "Unknown",
            "uploader_year": d.uploader.academic_year if d.uploader else None,
            "category_name": d.category.name if d.category else "General",
            "course_code": d.course.code if d.course else "GENERAL",
            "created_at": d.created_at
        })
        
    enriched_interviews = []
    for i in interviews:
        enriched_interviews.append({
            "id": i.id,
            "type": "interview",
            "title": f"Interview Experience at {i.company_name} ({i.role})",
            "uploader_name": i.uploader.full_name if i.uploader else "Unknown",
            "uploader_year": i.uploader.academic_year if i.uploader else None,
            "category_name": "Interview Experience",
            "course_code": None,
            "created_at": i.created_at
        })
        
    return enriched_docs + enriched_interviews

# --- AI Monitoring Dashboard ---
@router.get("/ai-monitoring/stats")
def get_ai_monitoring_stats(db: Session = Depends(get_db)):
    """Retrieves analytics logs for AI chatbot usage, tokens, failed queries, and knowledge gaps."""
    # 1. Token Usage
    token_sum = db.query(func.sum(SearchLog.tokens_used)).scalar() or 0
    
    # 2. Total & chatbot logs count
    total_logs = db.query(SearchLog).count()
    chatbot_logs_count = db.query(SearchLog).filter(SearchLog.was_chatbot == True).count()
    
    # 3. Search Accuracy
    successful_count = db.query(SearchLog).filter(SearchLog.was_successful == True).count()
    accuracy_ratio = (successful_count / total_logs) * 100 if total_logs > 0 else 100.0
    
    # 4. Most Asked / Popular chatbot Questions
    popular_queries = db.query(
        SearchLog.query, func.count(SearchLog.id).label("count")
    ).filter(SearchLog.was_chatbot == True).group_by(SearchLog.query).order_by(func.count(SearchLog.id).desc()).limit(5).all()
    
    # 5. Failed Queries & Knowledge Gaps (Failed queries where no relevant contexts exist)
    failed_queries = db.query(SearchLog.query, func.count(SearchLog.id).label("count")).filter(
        SearchLog.was_successful == False
    ).group_by(SearchLog.query).order_by(func.count(SearchLog.id).desc()).limit(10).all()
    
    return {
        "total_tokens_used": token_sum,
        "total_queries_logged": total_logs,
        "chatbot_queries_logged": chatbot_logs_count,
        "search_accuracy_percentage": round(accuracy_ratio, 1),
        "popular_queries": [{"query": q[0], "count": q[1]} for q in popular_queries],
        "failed_queries": [{"query": q[0], "count": q[1]} for q in failed_queries],
        "knowledge_gaps": [{"query": q[0], "count": q[1]} for q in failed_queries if q[1] > 1]
    }

# --- Reports Generator ---
@router.get("/reports/generate")
def generate_reports(db: Session = Depends(get_db)):
    """Generates contribution metrics, monthly resource growths, and placement stats."""
    # 1. Total Counts
    total_students = db.query(User).filter(User.role == "student").count()
    approved_docs = db.query(Document).filter(Document.status == "APPROVED").count()
    approved_interviews = db.query(InterviewExperience).filter(InterviewExperience.status == "APPROVED").count()
    
    # 2. Placement Statistics
    total_placed = db.query(InterviewExperience).filter(
        InterviewExperience.status == "APPROVED",
        InterviewExperience.selected == True
    ).count()
    
    # 3. Monthly growth (past 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    monthly_uploads = db.query(Document).filter(
        Document.created_at >= thirty_days_ago
    ).count() + db.query(InterviewExperience).filter(
        InterviewExperience.created_at >= thirty_days_ago
    ).count()
    
    # 4. Contribution Report (points by student)
    contribution_leaders = db.query(User.full_name, User.academic_year, User.contribution_points).filter(
        User.role == "student"
    ).order_by(User.contribution_points.desc()).limit(10).all()
    
    # 5. Course uploads metrics
    course_breakdown = db.query(
        Course.code, func.count(Document.id)
    ).join(Document).filter(Document.status == "APPROVED").group_by(Course.code).all()
    
    return {
        "summary": {
            "total_students": total_students,
            "approved_documents": approved_docs,
            "approved_interviews": approved_interviews,
            "monthly_resource_growth": monthly_uploads,
            "placement_success_count": total_placed
        },
        "contribution_details": [
            {"student_name": c[0], "academic_year": c[1], "points": c[2]} for c in contribution_leaders
        ],
        "resource_distribution": [
            {"course_code": cb[0], "uploads_count": cb[1]} for cb in course_breakdown
        ]
    }

# --- System Status ---
@router.get("/system-status")
async def get_system_status(db: Session = Depends(get_db)):
    """Retrieves server connectivity, DB storage size, and Ollama/Qdrant health logs."""
    # 1. SQLite Database Size
    db_size_bytes = 0
    db_file = settings.DATA_DIR / "database.db"
    if db_file.exists():
        db_size_bytes = os.path.getsize(db_file)
        
    # 2. Check Ollama API
    ollama_online = False
    pulled_models = []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=2.0)
            if resp.status_code == 200:
                ollama_online = True
                pulled_models = [m["name"] for m in resp.json().get("models", [])]
    except Exception:
        pass
        
    # 3. Check Qdrant (Count indexed points)
    qdrant_online = False
    vectors_count = 0
    try:
        from app.services.vector_service import qdrant_client, COLLECTION_NAME
        if qdrant_client.collection_exists(COLLECTION_NAME):
            qdrant_online = True
            coll_info = qdrant_client.get_collection(COLLECTION_NAME)
            vectors_count = coll_info.vectors_count or 0
    except Exception:
        pass

    return {
        "sqlite_db_size_kb": round(db_size_bytes / 1024, 2),
        "ollama": {
            "online": ollama_online,
            "url": settings.OLLAMA_BASE_URL,
            "target_model": settings.OLLAMA_MODEL,
            "available_models": pulled_models
        },
        "qdrant": {
            "online": qdrant_online,
            "collection": COLLECTION_NAME,
            "indexed_vectors_count": vectors_count
        },
        "system": {
            "environment": "Local Offline",
            "cpu_architecture": "x86_64/Windows Host"
        }
    }

# --- Announcements Creator ---
@router.post("/announcements")
def create_announcement(title: str, content: str, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """Posts a global banner announcement visible to all students."""
    new_banner = Announcement(
        title=title,
        content=content,
        uploader_id=current_admin.id
    )
    db.add(new_banner)
    db.commit()
    db.refresh(new_banner)
    return new_banner

@router.get("/announcements")
def list_announcements(db: Session = Depends(get_db)):
    """Retrieves all global announcements (available to students too)."""
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()

# --- Support & Contact Messages ---
@router.get("/support-messages")
def get_support_messages(db: Session = Depends(get_db)):
    """Retrieves all student contact submissions and platform feedback for Admin inbox."""
    messages = db.query(ContactSubmission).order_by(ContactSubmission.created_at.desc()).all()
    return messages

@router.put("/support-messages/{sub_id}/status")
def update_support_status(sub_id: int, status: str, db: Session = Depends(get_db)):
    sub = db.query(ContactSubmission).filter(ContactSubmission.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.status = status
    db.commit()
    return {"message": "Status updated successfully", "id": sub_id, "status": status}

@router.delete("/support-messages/{sub_id}")
def delete_support_message(sub_id: int, db: Session = Depends(get_db)):
    sub = db.query(ContactSubmission).filter(ContactSubmission.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    db.delete(sub)
    db.commit()
    return {"message": "Message deleted successfully", "id": sub_id}

