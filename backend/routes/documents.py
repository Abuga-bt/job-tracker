
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from routes.users import get_current_user
import models, os, shutil

router = APIRouter(prefix="/documents", tags=["Documents"])

# folder where files will be saved
UPLOAD_FOLDER = "uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # creates folder if it doesn't exist

# ===== UPLOAD DOCUMENT =====
@router.post("/")
def upload_document(
    file_type: str,                    # "CV", "Cover Letter", or "Resume"
    file: UploadFile = File(...),      # the actual file being uploaded
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # validate file type is one of the allowed types
    allowed_types = ["CV", "Cover Letter", "Resume"]
    if file_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # create a unique file name using user id and original filename
    file_name = f"{current_user.id}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    # save the file to the uploads folder
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # save file details to MySQL
    new_document = models.Document(
        user_id=current_user.id,
        file_name=file.filename,
        file_type=file_type,
        file_url=file_path
    )
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    return {"message": "Document uploaded successfully", "file": file_name}


# ===== GET ALL MY DOCUMENTS =====
@router.get("/")
def get_documents(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # only return documents belonging to current user
    documents = db.query(models.Document).filter(
        models.Document.user_id == current_user.id
    ).all()
    return documents


# ===== DELETE DOCUMENT =====
@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # find the document
    document = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # delete the actual file from the uploads folder
    if os.path.exists(document.file_url):
        os.remove(document.file_url)

    # delete from MySQL
    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully"}