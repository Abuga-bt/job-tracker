from typing import Optional, Literal
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from pydantic import field_validator

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin (BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 72:
            raise ValueError("Password cannot exceed 72 characters")
        return v

class ApplicationCreate (BaseModel):
    company_name: str
    job_title: str
    job_url:Optional [str] = None
    job_type: str
    deadline: Optional[datetime] = None
    notes: Optional [str] = None

class ApplicationUpdate (BaseModel):
     status: Optional[Literal["Applied", "Interview", "Rejected", "Offered"]] = None
     feedback: Optional[str] = None
     notes: Optional[str] = None
     job_url: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
