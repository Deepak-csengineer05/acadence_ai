from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Date, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # Nullable for Google OAuth users
    full_name = Column(String, nullable=False)
    academic_year = Column(String, nullable=True) # "I", "II", "III", "IV" or None for admins
    role = Column(String, default="student") # "student", "admin"
    contribution_points = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)
    is_google_user = Column(Boolean, default=False)
    department = Column(String, nullable=True)
    interests = Column(String, nullable=True)
    onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="uploader", cascade="all, delete-orphan")
    interviews = relationship("InterviewExperience", back_populates="uploader", cascade="all, delete-orphan")
    upvotes = relationship("Upvote", back_populates="user", cascade="all, delete-orphan")
    search_logs = relationship("SearchLog", back_populates="user", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="uploader", cascade="all, delete-orphan")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_type = Column(String, nullable=False) # e.g. "first_contribution", "rising_star", "sage_of_acadence", "streak_master", "helpful_senior", "genius", "knowledge_overflow"
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="achievements")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False) # e.g., CS301
    name = Column(String, nullable=False) # e.g., Database Systems
    department = Column(String, nullable=False) # e.g., CSE, ECE

    documents = relationship("Document", back_populates="course")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False) # e.g., Notes, Labs, Placement, Exam Prep, Projects, or custom categories

    documents = relationship("Document", back_populates="category")

class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (
        Index("idx_doc_status_cat_course", "status", "category_id", "course_id"),
        Index("idx_doc_uploader_status", "uploader_id", "status"),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    upvotes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    is_project = Column(Boolean, default=False) # true if it belongs in Project Hub
    tags = Column(String, nullable=True) # comma-separated tags
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="documents")
    uploader = relationship("User", back_populates="documents")
    category = relationship("Category", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    upvote_records = relationship("Upvote", back_populates="document", cascade="all, delete-orphan")

class InterviewExperience(Base):
    __tablename__ = "interview_experiences"
    __table_args__ = (
        Index("idx_interview_status_company", "status", "company_name"),
    )

    id = Column(Integer, primary_key=True, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String, nullable=False, index=True) # Zoho, TCS, etc.
    role = Column(String, nullable=False) # e.g., Software Engineer Intern
    aptitude_questions = Column(Text, nullable=True)
    coding_questions = Column(Text, nullable=True)
    hr_questions = Column(Text, nullable=True)
    technical_questions = Column(Text, nullable=True)
    timeline = Column(String, nullable=True) # e.g. "2 Rounds, June 2026"
    student_experience = Column(Text, nullable=True)
    selected = Column(Boolean, default=False)
    prep_resources = Column(Text, nullable=True)
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    upvotes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User", back_populates="interviews")
    chunks = relationship("DocumentChunk", back_populates="interview", cascade="all, delete-orphan")
    upvote_records = relationship("Upvote", back_populates="interview", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    interview_id = Column(Integer, ForeignKey("interview_experiences.id", ondelete="CASCADE"), nullable=True)
    chunk_index = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    vector_id = Column(String, nullable=False) # UUID linked to Qdrant

    document = relationship("Document", back_populates="chunks")
    interview = relationship("InterviewExperience", back_populates="chunks")

class Upvote(Base):
    __tablename__ = "upvotes"
    __table_args__ = (
        Index("idx_upvote_user_doc", "user_id", "document_id"),
        Index("idx_upvote_user_int", "user_id", "interview_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    interview_id = Column(Integer, ForeignKey("interview_experiences.id", ondelete="CASCADE"), nullable=True)

    user = relationship("User", back_populates="upvotes")
    document = relationship("Document", back_populates="upvote_records")
    interview = relationship("InterviewExperience", back_populates="upvote_records")

class SearchLog(Base):
    __tablename__ = "search_logs"
    __table_args__ = (
        Index("idx_searchlog_user_created", "user_id", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    was_chatbot = Column(Boolean, default=False)
    was_successful = Column(Boolean, default=True)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="search_logs")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User", back_populates="announcements")

class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    category = Column(String, default="general")
    message = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    code_hash = Column(String, nullable=False)
    purpose = Column(String, nullable=False) # "RESET" or "VERIFY"
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


