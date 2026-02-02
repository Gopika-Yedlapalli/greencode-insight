from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import ContactRequest
from app.utils.email import send_contact_email

router = APIRouter(prefix="/contact", tags=["Contact"])

@router.post("", status_code=status.HTTP_200_OK)
def send_contact_message(
    data: ContactRequest,
    current_user: User | None = Depends(get_current_user),
):
    if current_user and current_user.email != data.email:
        raise HTTPException(
            status_code=403,
            detail="Email does not match logged-in user"
        )

    send_contact_email(
        name=data.name.strip(),
        email=data.email.lower(),
        message=data.message.strip(),
    )

    return {"message": "Message sent successfully"}
