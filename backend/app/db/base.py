# Import all the models so that Base has them before being imported by migration tools or main app.
from app.db.session import Base
from app.models import User, Achievement, Notification, Course, Category, Document, InterviewExperience, DocumentChunk, Upvote, SearchLog, Announcement

