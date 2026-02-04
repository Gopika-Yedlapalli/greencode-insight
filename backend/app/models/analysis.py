from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database.database import Base

class CodeAnalysis(Base):
    __tablename__ = "code_analysis"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, nullable=False)
    source_ref = Column(String, nullable=False)
    language = Column(String, nullable=False)
    result = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
