from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserUpdate
import models, auth

router = APIRouter(prefix="/users", tags=["Users"])

# This reads the token from the request header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# This verifies the token and returns current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # check if token is blacklisted
    blacklisted = db.query(models.BlacklistedToken).filter(
        models.BlacklistedToken.token == token
    ).first()
    if blacklisted:
        raise HTTPException(status_code=401, detail="Token has been invalidated. Please log in again.")

    user_id = auth.verify_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user


@router.get("/me")
def get_profile(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }

@router.put("/me")
def update_profile(
    update_data : UserUpdate,
    current_user =Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.name:
        current_user.name = update_data.name
    if update_data.phone:
            current_user.phone = update_data.phone
    db.commit()
    return {"detail": "Profile updated successfully"}
        

@router.delete("/me")
def delete_account(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"detail": "Account deleted successfully"}

# add logout route
@router.post("/logout")
def logout(
    token: str = Depends(oauth2_scheme),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # add token to blacklist
    blacklisted = models.BlacklistedToken(token=token)
    db.add(blacklisted)
    db.commit()
    return {"message": "Logged out successfully"}