from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from schemas import ApplicationCreate, ApplicationUpdate
from routes.users import get_current_user
import models

router = APIRouter(prefix="/applications", tags=["Applications"])

# ===== ADD NEW APPLICATION =====
from sanitize import sanitize_application

# in create_application route add this before saving:
@router.post("/")
def create_application(
    app_data: ApplicationCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # sanitize input data
    sanitized = sanitize_application({
        "company_name": app_data.company_name,
        "job_title": app_data.job_title,
        "job_type": app_data.job_type,
        "job_url": app_data.job_url,
        "notes": app_data.notes,
    })

    new_application = models.Application(
        user_id=current_user.id,
        company_name=sanitized["company_name"],
        job_title=sanitized["job_title"],
        job_type=sanitized["job_type"],
        job_url=sanitized["job_url"],
        deadline=app_data.deadline,
        notes=sanitized["notes"],
        status="Applied"
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return {"message": "Application added successfully"}
# ===== GET ALL MY APPLICATIONS =====
@router.get("/")
def get_applications(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # filter applications by current user's id
    # so users only see THEIR applications, not everyone's
    applications = db.query(models.Application).filter(
        models.Application.user_id == current_user.id
    ).all()                            # .all() returns a list
    return applications


# ===== GET ONE SPECIFIC APPLICATION =====
@router.get("/{application_id}")
def get_application(
    application_id: int,               # id from the URL e.g. /applications/3
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # find the application by id AND user_id
    # user_id check ensures you can't access someone else's application
    application = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id
    ).first()

    # if not found, return 404 error
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    return application


# ===== UPDATE APPLICATION =====
@router.put("/{application_id}")
def update_application(
    application_id: int,
    update_data: ApplicationUpdate,    # data coming in from frontend
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # find the application first
    application = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # update only the fields that were provided
    # if a field is None, we leave it unchanged
    if update_data.status:
        application.status = update_data.status
    if update_data.feedback:
        application.feedback = update_data.feedback
    if update_data.notes:
        application.notes = update_data.notes
    if update_data.job_url:
        application.job_url = update_data.job_url

    db.commit()                        # save changes to MySQL
    return {"message": "Application updated successfully"}


# ===== DELETE APPLICATION =====
@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # find the application
    application = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)             # delete from database
    db.commit()                        # save changes
    return {"message": "Application deleted successfully"}