from sqlalchemy import Column, Integer, String, Boolean, DateTime, ARRAY
from app.database.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    role = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    preferred_languages = Column(ARRAY(String), nullable=True)

    reset_otp_hash = Column(String, nullable=True)
    reset_otp_expires = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
