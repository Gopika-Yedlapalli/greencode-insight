from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import os, uuid
from app.database.deps import get_db
from app.models.analysis import CodeAnalysis
from app.services.analysis_service import analyze_codebase
from app.core.config import settings
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.post("/upload")
async def analyze_upload(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if len(files) > settings.MAX_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.MAX_FILES} files allowed"
        )

    for file in files:
        if not any(file.filename.endswith(ext) for ext in settings.SUPPORTED_EXTENSIONS):
            raise HTTPException(
                status_code=400,
                detail="Only .py and .java files are supported"
            )

    analysis_id = str(uuid.uuid4())
    base_path = os.path.join(settings.BASE_ANALYSIS_PATH, analysis_id)
    os.makedirs(base_path, exist_ok=True)

    for file in files:
        content = await file.read()
        with open(os.path.join(base_path, file.filename), "wb") as f:
            f.write(content)

    result = analyze_codebase(base_path)

    record = CodeAnalysis(
        source_type="upload",
        source_ref="manual",
        language="mixed",
        result=result,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "analysis_id": record.id,
        "status": "success"
    }
