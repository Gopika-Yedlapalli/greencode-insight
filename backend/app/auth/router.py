from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.deps import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    ForgotPasswordRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
)
from app.auth.security import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.auth.dependencies import get_current_user
from app.auth.otp import generate_otp, otp_expiry
from app.utils.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", status_code=201)
def register(user: UserRegister, db: Session = Depends(get_db)):
    email = user.email.lower()

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = User(
        first_name=user.first_name.strip(),
        last_name=user.last_name.strip(),
        email=email,
        hashed_password=hash_password(user.password),
        role=user.role,
        experience_level=user.experience_level,
        preferred_languages=user.preferred_languages,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Account created successfully"}

@router.post("/login")
def login(
    credentials: UserLogin,
    response: Response,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == credentials.email.lower())
        .first()
    )

    if not user or not verify_password(
        credentials.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(str(user.id))

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60,
    )

    return {"message": "Login successful"}

@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email is not registered"
        )

    otp = generate_otp()
    user.reset_otp_hash = hash_password(otp)
    user.reset_otp_expires = otp_expiry()

    db.commit()

    send_otp_email(user.email, otp)

    return {"message": "OTP has been sent to your email"}

@router.post("/verify-otp")
def verify_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == data.email.lower()
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")

    if user.reset_otp_expires and datetime.utcnow() > user.reset_otp_expires:
        raise HTTPException(status_code=400, detail="OTP expired")

    if not user.reset_otp_hash:
        raise HTTPException(status_code=400, detail="Invalid request")

    if not verify_password(data.otp, user.reset_otp_hash):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == data.email.lower())
        .first()
    )

    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")

    if verify_password(data.new_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from old password",
        )

    user.hashed_password = hash_password(data.new_password)

    user.reset_otp_hash = None
    user.reset_otp_expires = None

    db.commit()

    return {"message": "Password reset successful"}

@router.put("/profile")
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.email.lower() != current_user.email:
        existing = (
            db.query(User)
            .filter(User.email == data.email.lower())
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=409,
                detail="Email already in use"
            )
        current_user.email = data.email.lower()

    current_user.first_name = data.first_name.strip()
    current_user.last_name = data.last_name.strip()
    current_user.role = data.role
    current_user.experience_level = data.experience_level
    current_user.preferred_languages = data.preferred_languages

    db.commit()
    return {"message": "Profile updated successfully"}

@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    if verify_password(data.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from old password"
        )

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}

@router.delete("/delete-account")
def delete_account(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.delete(current_user)
    db.commit()

    response.delete_cookie("access_token")

    return {"message": "Account deleted successfully"}