from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routes import auth as auth_router
from routes import users as users_router
from routes import applications as applications_router
from routes import documents as documents_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)

app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(applications_router.router)
app.include_router(documents_router.router)

@app.get("/")
def root():
    return {"message": "Job Tracker API is running"}
