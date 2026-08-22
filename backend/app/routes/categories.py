from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models import Category
from app.schemas import CategoryCreate, CategoryOut
from app.core.auth import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    """Lists all available categories."""
    return db.query(Category).all()

@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Dynamically creates a new category (available to all users)."""
    normalized_name = category_in.name.strip().title()
    if not normalized_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name cannot be empty"
        )
        
    existing = db.query(Category).filter(Category.name == normalized_name).first()
    if existing:
        return existing
        
    new_cat = Category(name=normalized_name)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat
