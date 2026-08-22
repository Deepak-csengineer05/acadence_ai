from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, date

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str
    academic_year: Optional[str] = Field(default=None, pattern="^(I|II|III|IV)$")

class UserCreate(UserBase):
    password: Optional[str] = None # Nullable if registering/logging in via Google
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleAuthPayload(BaseModel):
    email: str
    full_name: str
    # Under our new requirements, we can determine the academic year or pass it in later.
    # We will pass academic_year during google sign up if it's the first time.
    academic_year: Optional[str] = Field(default="I", pattern="^(I|II|III|IV)$")

class UserOut(UserBase):
    id: int
    role: str
    contribution_points: int
    streak_count: int
    last_active_date: Optional[date] = None
    is_google_user: bool
    department: Optional[str] = None
    interests: Optional[str] = None
    onboarded: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# --- New Auth Flow Schemas ---
class OnboardPayload(BaseModel):
    department: str
    academic_year: str
    interests: List[str]

class ForgotPasswordSend(BaseModel):
    email: str

class ForgotPasswordVerify(BaseModel):
    email: str
    code: str
    new_password: str

class ChangePasswordPayload(BaseModel):
    current_password: str
    new_password: str

class EmailVerificationSend(BaseModel):
    email: str

class EmailVerificationVerify(BaseModel):
    email: str
    code: str

# --- Achievement Schemas ---
class AchievementOut(BaseModel):
    id: int
    badge_type: str
    unlocked_at: datetime

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationOut(BaseModel):
    id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Course Schemas ---
class CourseBase(BaseModel):
    code: str
    name: str
    department: str

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: int

    class Config:
        from_attributes = True

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# --- Document Schemas ---
class DocumentBase(BaseModel):
    title: str
    course_id: Optional[int] = None
    category_id: int
    is_project: bool = False
    tags: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentOut(DocumentBase):
    id: int
    file_path: str
    uploader_id: int
    status: str
    upvotes: int
    views: int
    downloads: int
    created_at: datetime
    uploader_name: Optional[str] = None
    category_name: Optional[str] = None
    course_code: Optional[str] = None

    class Config:
        from_attributes = True

# --- Interview Experience Schemas ---
class InterviewExperienceBase(BaseModel):
    company_name: str
    role: str
    aptitude_questions: Optional[str] = None
    coding_questions: Optional[str] = None
    hr_questions: Optional[str] = None
    technical_questions: Optional[str] = None
    timeline: Optional[str] = None
    student_experience: Optional[str] = None
    selected: bool = False
    prep_resources: Optional[str] = None

class InterviewExperienceCreate(InterviewExperienceBase):
    pass

class InterviewExperienceOut(InterviewExperienceBase):
    id: int
    uploader_id: int
    uploader_name: Optional[str] = None
    status: str
    upvotes: int
    views: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Search & Chat Queries ---
class SearchQuery(BaseModel):
    query: str
    category_id: Optional[int] = None
    course_id: Optional[int] = None
    company_name: Optional[str] = None
    explore_by: Optional[str] = None # e.g. Subjects, Technologies, Companies, PYQs
    advanced_filters: Optional[dict] = None # e.g. {"department": "", "year": "", "semester": "", "branch": "", "tags": [], "difficulty": "", "trending": False}
    sort_by: Optional[str] = "date" # date, upvotes, views

class ChatQuery(BaseModel):
    query: str
    history: Optional[List[dict]] = []

# --- Announcement Schemas ---
class AnnouncementBase(BaseModel):
    title: str
    content: str

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementOut(AnnouncementBase):
    id: int
    uploader_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Support & Contact Schemas ---
class ContactSubmissionCreate(BaseModel):
    name: str
    email: str
    category: Optional[str] = "general"
    message: str
    rating: Optional[int] = None

class ContactSubmissionOut(BaseModel):
    id: int
    name: str
    email: str
    category: str
    message: str
    rating: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

