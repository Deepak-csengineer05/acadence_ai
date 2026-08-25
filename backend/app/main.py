from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, get_db
from app.db.base import Base
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import Category, Course, User


# Create Database tables on startup
Base.metadata.create_all(bind=engine)

def check_and_update_users_table():
    from sqlalchemy import text
    db = SessionLocal()
    try:
        columns_to_add = [
            ("department", "VARCHAR"),
            ("interests", "VARCHAR"),
            ("onboarded", "BOOLEAN DEFAULT 0")
        ]
        for col_name, col_type in columns_to_add:
            try:
                db.execute(text(f"SELECT {col_name} FROM users LIMIT 1"))
            except Exception:
                db.rollback()
                print(f"[*] Adding column {col_name} to users table...")
                db.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                db.commit()
    except Exception as e:
        print(f"[!] Altering users table failed: {e}")
    finally:
        db.close()

check_and_update_users_table()

# Seed default database values
def seed_default_data():
    db: Session = SessionLocal()
    try:
        # Seed admin user
        admin_user = db.query(User).filter(User.email == "adminAcad01").first()
        if not admin_user:
            from app.core.auth import get_password_hash
            db.add(User(
                email="adminAcad01",
                full_name="Administrator",
                hashed_password=get_password_hash("adminAcad01"),
                role="admin",
                academic_year=None,
                is_google_user=False
            ))

        # Seed categories
        default_cats = ["Notes", "Labs", "Placement", "Exam Prep", "Projects", "PYQs"]
        for cat_name in default_cats:
            existing = db.query(Category).filter(Category.name == cat_name).first()
            if not existing:
                db.add(Category(name=cat_name))
        
        # Seed courses
        default_courses = [
            {"code": "CS301", "name": "Database Systems", "department": "CSE"},
            {"code": "CS302", "name": "Operating Systems", "department": "CSE"},
            {"code": "CS401", "name": "Computer Networks", "department": "CSE"},
            {"code": "EC201", "name": "Digital Circuits", "department": "ECE"},
            {"code": "IT304", "name": "Web Technologies", "department": "IT"},
        ]
        for course in default_courses:
            existing = db.query(Course).filter(Course.code == course["code"]).first()
            if not existing:
                db.add(Course(**course))
        db.commit()
    except Exception as e:
        print(f"[!] Seeding default data failed: {e}")
    finally:
        db.close()

seed_default_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Offline-First College Knowledge Management System API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from app.routes import auth, categories, documents, interviews, search, leaderboard, notifications, admin

# Register routers under both /api/v1 and legacy/direct paths for fail-safe frontend VITE_API_BASE_URL compatibility
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix="/auth")  # Fallback for VITE_API_BASE_URL without /api/v1
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(interviews.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(leaderboard.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

# Global announcement route (publicly accessible)
@app.get(f"{settings.API_V1_STR}/announcements")
def get_global_announcements(db: Session = Depends(get_db)):
    from app.models import Announcement
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()

# Public Support & Feedback contact submission endpoint
from app.schemas import ContactSubmissionCreate

@app.post(f"{settings.API_V1_STR}/support/contact")
def submit_contact_message(payload: ContactSubmissionCreate, db: Session = Depends(get_db)):
    from app.models import ContactSubmission
    sub = ContactSubmission(
        name=payload.name,
        email=payload.email,
        category=payload.category or "general",
        message=payload.message,
        rating=payload.rating,
        status="PENDING"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return {"message": "Submitted successfully", "id": sub.id}


@app.get(f"{settings.API_V1_STR}/courses")
def get_global_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()


@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "api_prefix": settings.API_V1_STR
    }

@app.get(f"{settings.API_V1_STR}/health")
def api_health():
    return {
        "status": "online",
        "local_ollama_url": settings.OLLAMA_BASE_URL,
        "local_ollama_model": settings.OLLAMA_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

