from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional

class UserRegister(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str

    role: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_languages: Optional[List[str]] = []

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str):
        if (
            not any(c.isupper() for c in v)
            or not any(c.islower() for c in v)
            or not any(c.isdigit() for c in v)
        ):
            raise ValueError(
                "Password must contain uppercase, lowercase, and number"
            )
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info):
        password = info.data.get("password")
        if password and v != password:
            raise ValueError("Passwords do not match")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    role: Optional[str]
    experience_level: Optional[str]
    preferred_languages: Optional[List[str]]

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=8)
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, v: str):
        if (
            not any(c.isupper() for c in v)
            or not any(c.islower() for c in v)
            or not any(c.isdigit() for c in v)
        ):
            raise ValueError(
                "Password must contain uppercase, lowercase, and number"
            )
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info):
        if v != info.data.get("new_password"):
            raise ValueError("Passwords do not match")
        return v

class UpdateProfileRequest(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: EmailStr                   
    role: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_languages: Optional[List[str]] = []

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8)
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, v):
        if (
            not any(c.isupper() for c in v)
            or not any(c.islower() for c in v)
            or not any(c.isdigit() for c in v)
        ):
            raise ValueError("Password must contain uppercase, lowercase, and number")
        return v

    @field_validator("confirm_password")
    @classmethod
    def match(cls, v, info):
        if v != info.data.get("new_password"):
            raise ValueError("Passwords do not match")
        return v

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str
