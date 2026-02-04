from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from git import Repo, GitCommandError
from urllib.parse import urlparse
import uuid, os

from app.database.deps import get_db
from app.models.analysis import CodeAnalysis
from app.services.analysis_service import analyze_codebase
from app.core.config import settings
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/github", tags=["GitHub"])


@router.post("/analyze")
def analyze_github(
    repo_url: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    parsed = urlparse(repo_url)

    if not parsed.scheme or not parsed.netloc:
        raise HTTPException(
            status_code=400,
            detail="invalid_url"
        )

    if "github.com" not in parsed.netloc.lower():
        raise HTTPException(
            status_code=400,
            detail="not_github"
        )

    analysis_id = str(uuid.uuid4())
    path = os.path.join(settings.BASE_ANALYSIS_PATH, analysis_id)

    try:
        Repo.clone_from(repo_url, path)
    except GitCommandError:
        raise HTTPException(
            status_code=400,
            detail="repo_not_accessible"
        )

    result = analyze_codebase(path)

    record = CodeAnalysis(
        source_type="github",
        source_ref=repo_url,
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
