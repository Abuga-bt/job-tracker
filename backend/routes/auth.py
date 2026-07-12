from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserRegister, UserLogin
import models
import auth

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/register")
@limiter.limit("5/minute")  # max 5 registrations per minute per IP
async def register(request: Request, user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.hash_password(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Account created successfully"}


@router.post("/login")
@limiter.limit("5/minute")  # max 5 login attempts per minute per IP
async def login(request: Request, user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    password_match = auth.verify_password(user.password, db_user.password)
    if not password_match:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = auth.create_access_token(data={"user_id": db_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": db_user.name
    }