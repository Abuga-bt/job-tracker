from pydantic import BaseModel, EmailStr, field_validator, HttpUrl
from typing import Optional, Literal
from datetime import datetime
import re

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

    @field_validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 72:
            raise ValueError("Password cannot exceed 72 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("name")
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Name cannot exceed 100 characters")
        if not re.match(r"^[a-zA-Z\s]+$", v):
            raise ValueError("Name can only contain letters and spaces")
        return v.strip()

    @field_validator("phone")
    def validate_phone(cls, v):
        if v and not re.match(r"^\+?[\d\s\-]{7,15}$", v):
            raise ValueError("Invalid phone number format")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    job_type: str
    job_url: Optional[str] = None
    deadline: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("company_name")
    def validate_company(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Company name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Company name cannot exceed 100 characters")
        return v.strip()

    @field_validator("job_title")
    def validate_job_title(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Job title must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Job title cannot exceed 100 characters")
        return v.strip()

    @field_validator("job_url")
    def validate_url(cls, v):
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("Job URL must start with http:// or https://")
        return v

    @field_validator("notes")
    def validate_notes(cls, v):
        if v and len(v) > 1000:
            raise ValueError("Notes cannot exceed 1000 characters")
        return v

class ApplicationUpdate(BaseModel):
    status: Optional[Literal["Applied", "Interview", "Rejected", "Offered"]] = None
    feedback: Optional[str] = None
    notes: Optional[str] = None
    job_url: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None