import secrets
from datetime import date, timedelta, datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.db.session import get_db
from app.models import User, Achievement, Notification, VerificationCode
from app.schemas import UserCreate, UserOut, Token, GoogleAuthPayload, OnboardPayload, ForgotPasswordSend, ForgotPasswordVerify, EmailVerificationSend, EmailVerificationVerify, ChangePasswordPayload
from app.core.auth import get_password_hash, verify_password, create_access_token, verify_google_token, get_current_user
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

def update_streak_and_achievements(user: User, db: Session):
    """Helper to update a user's login streak and check for streak achievements."""
    today = date.today()
    
    if user.last_active_date is None:
        user.streak_count = 1
    elif user.last_active_date == today:
        # Already logged in today, do nothing to streak
        pass
    elif user.last_active_date == today - timedelta(days=1):
        # Active yesterday, increment streak
        user.streak_count += 1
    else:
        # Missed a day or first login after reset, reset streak to 1
        user.streak_count = 1
        
    user.last_active_date = today
    
    # Check for Streak Master achievement (streak of 7)
    if user.streak_count >= 7:
        streak_badge = db.query(Achievement).filter(
            Achievement.user_id == user.id,
            Achievement.badge_type == "streak_master"
        ).first()
        if not streak_badge:
            new_badge = Achievement(user_id=user.id, badge_type="streak_master")
            db.add(new_badge)
            
            # Send notification
            new_notif = Notification(
                user_id=user.id,
                content="🔥 Congratulations! You have unlocked the 'Streak Master' badge for logging in 7 days in a row!"
            )
            db.add(new_notif)
            
    db.commit()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new student user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
        
    # Enforce student role unconditionally for public self-registration (Security Fix)
    role = "student"
    
    hashed_pwd = get_password_hash(user_in.password) if user_in.password else None
    
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        academic_year=user_in.academic_year,
        department=user_in.department,
        role=role,
        is_google_user=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize streak
    update_streak_and_achievements(new_user, db)
    
    # Add a welcome notification
    welcome_notif = Notification(
        user_id=new_user.id,
        content=f"Welcome to Acadence AI, {new_user.full_name}! Browse documents, upload your notes, and chat with Senior AI."
    )
    db.add(welcome_notif)
    db.commit()
    
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Standard credential OAuth2 password flow login."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or user.is_google_user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    # Update login streak
    update_streak_and_achievements(user, db)
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=Token)
async def google_login(
    payload: Optional[GoogleAuthPayload] = None,
    id_token: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Sign up or log in via Google OAuth (supports JSON body or mock id_token query parameter)."""
    email = None
    full_name = None
    academic_year = "I"
    
    if payload:
        email = payload.email
        full_name = payload.full_name
        academic_year = payload.academic_year or "I"
    elif id_token:
        if id_token.startswith("mock_"):
            email = "google_student@college.edu"
            full_name = "Google Student"
        else:
            profile = await verify_google_token(id_token)
            if not profile:
                raise HTTPException(status_code=400, detail="Invalid Google token")
            email = profile["email"]
            full_name = profile["full_name"]
    else:
        raise HTTPException(status_code=400, detail="Missing authentication payload")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # First time login with Google: register user
        user = User(
            email=email,
            full_name=full_name,
            academic_year=academic_year,
            role="student",
            is_google_user=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Add welcome notification
        welcome_notif = Notification(
            user_id=user.id,
            content=f"Welcome to Acadence AI, {user.full_name}! Browse documents, upload your notes, and chat with Senior AI."
        )
        db.add(welcome_notif)
        db.commit()
        
    # Update login streak
    update_streak_and_achievements(user, db)
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieves current authenticated user's profile."""
    return current_user

@router.put("/profile", response_model=UserOut)
def update_user_profile(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates user's profile information (full_name, department, academic_year)."""
    if "full_name" in payload and payload["full_name"]:
        current_user.full_name = payload["full_name"]
    if "department" in payload and payload["department"]:
        current_user.department = payload["department"]
    if "academic_year" in payload and payload["academic_year"]:
        current_user.academic_year = payload["academic_year"]
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/verify-email/send")
def verify_email_send(payload: EmailVerificationSend, db: Session = Depends(get_db)):
    """Generates and stores a cryptographic 6-digit email verification code with 10-minute expiry."""
    code = f"{secrets.randbelow(900000) + 100000}"
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    v_code = VerificationCode(
        email=payload.email,
        code_hash=get_password_hash(code),
        purpose="VERIFY",
        expires_at=expires,
        is_used=False
    )
    db.add(v_code)
    db.commit()
    
    resp = {"status": "success", "message": "Verification code sent to email."}
    if settings.ENVIRONMENT.lower() in ["development", "dev", "test", "testing"]:
        resp["code"] = code
    return resp

@router.post("/verify-email/verify")
def verify_email_verify(payload: EmailVerificationVerify, db: Session = Depends(get_db)):
    """Verifies cryptographic 6-digit email code against stored database hash."""
    if not payload.code or len(payload.code) != 6:
        raise HTTPException(status_code=400, detail="Invalid verification code format. Code must be 6 digits.")
        
    now = datetime.now(timezone.utc)
    records = db.query(VerificationCode).filter(
        VerificationCode.email == payload.email,
        VerificationCode.purpose == "VERIFY",
        VerificationCode.is_used == False,
        VerificationCode.expires_at > now
    ).order_by(VerificationCode.created_at.desc()).all()
    
    matched = False
    for rec in records:
        if verify_password(payload.code, rec.code_hash):
            rec.is_used = True
            matched = True
            break
            
    if not matched:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
        
    db.commit()
    return {"status": "success", "message": "Email verified successfully."}

@router.post("/forgot-password/send")
def forgot_password_send(payload: ForgotPasswordSend, db: Session = Depends(get_db)):
    """Generates and stores a cryptographic 6-digit password reset code with 10-minute expiry."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found with this email.")
        
    code = f"{secrets.randbelow(900000) + 100000}"
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    v_code = VerificationCode(
        email=payload.email,
        code_hash=get_password_hash(code),
        purpose="RESET",
        expires_at=expires,
        is_used=False
    )
    db.add(v_code)
    db.commit()
    
    resp = {"status": "success", "message": "Password reset code sent to email."}
    if settings.ENVIRONMENT.lower() in ["development", "dev", "test", "testing"]:
        resp["code"] = code
    return resp

@router.post("/forgot-password/verify")
def forgot_password_verify(payload: ForgotPasswordVerify, db: Session = Depends(get_db)):
    """Verifies cryptographic reset code and updates user's password."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found with this email.")
        
    if not payload.code or len(payload.code) != 6:
        raise HTTPException(status_code=400, detail="Incorrect reset verification code format.")
        
    now = datetime.now(timezone.utc)
    records = db.query(VerificationCode).filter(
        VerificationCode.email == payload.email,
        VerificationCode.purpose == "RESET",
        VerificationCode.is_used == False,
        VerificationCode.expires_at > now
    ).order_by(VerificationCode.created_at.desc()).all()
    
    matched_record = None
    for rec in records:
        if verify_password(payload.code, rec.code_hash):
            matched_record = rec
            break
            
    if not matched_record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
        
    matched_record.is_used = True
    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully."}


@router.post("/onboard", response_model=UserOut)
def onboard_user(payload: OnboardPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Saves onboarding selections (interests, department, year) and flags user as onboarded."""
    current_user.department = payload.department
    current_user.academic_year = payload.academic_year
    current_user.interests = ",".join(payload.interests)
    current_user.onboarded = True
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    payload: ChangePasswordPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Changes the authenticated user's account password."""
    if current_user.is_google_user or not current_user.hashed_password:
        raise HTTPException(
            status_code=400,
            detail="Accounts registered via Google OAuth cannot change passwords."
        )
        
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect."
        )
        
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 6 characters long."
        )
        
    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully in database."}
