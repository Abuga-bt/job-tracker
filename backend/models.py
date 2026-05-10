from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())

    applications = relationship("Application", back_populates="owner")
    documents = relationship("Document", back_populates="owner")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(100), nullable=False)
    job_title = Column(String(100), nullable=False)
    job_type = Column(String(50))
    status = Column(Enum("Applied", "Interview", "Rejected", "Offered"), default="Applied")
    date_applied = Column(DateTime, default=func.now())
    deadline = Column(DateTime, nullable=True)
    job_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

    owner = relationship("User", back_populates="applications")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(Enum("CV", "Cover Letter", "Resume"), nullable=False)
    file_url = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=func.now())

    owner = relationship("User", back_populates="documents")

   