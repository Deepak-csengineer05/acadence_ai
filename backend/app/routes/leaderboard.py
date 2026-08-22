from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict

from app.db.session import get_db
from app.models import User, Achievement
from app.core.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard & Badges"])

@router.get("/rankings")
def get_rankings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieves student contribution rankings and their unlocked badges."""
    # We query active student records sorted by contribution_points
    results = db.query(User).filter(User.role == "student").order_by(User.contribution_points.desc()).all()
    
    rankings = []
    for rank, s in enumerate(results, 1):
        # Fetch unlocked badges
        badges = [a.badge_type for a in db.query(Achievement).filter(Achievement.user_id == s.id).all()]
        
        rankings.append({
            "rank": rank,
            "id": s.id,
            "full_name": s.full_name,
            "academic_year": s.academic_year,
            "contribution_points": s.contribution_points,
            "streak_count": s.streak_count,
            "badges": badges
        })
        
    return rankings

@router.get("/achievements/my")
def get_my_achievements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieves list of badges unlocked by the currently logged-in student."""
    achievements = db.query(Achievement).filter(Achievement.user_id == current_user.id).all()
    return [{"badge_type": a.badge_type, "unlocked_at": a.unlocked_at} for a in achievements]
