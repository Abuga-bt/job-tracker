from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserRegister , UserLogin
import models
import auth

router = APIRouter(prefix = "/auth", tags=["Authentication"])

@router.post("/register")
def register(user: UserRegister, db:Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.hash_password(user.password)
    new_user = models.User(
        email=user.email, 
        password=hashed_password,
        name=user.name,
        phone=user.phone
        )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}  

    
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    #check if user exists and password is correct
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user :
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    #password verification
    password_match = auth.verify_password(user.password, db_user.password)
    if not password_match:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Step 3 - create JWT token
    access_token = auth.create_access_token(data={"user_id": db_user.id})
    
    # Step 4 - return token
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": db_user.name 
        }