from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from database import engine, Base
import models
from routes import auth as auth_router
from routes import users as users_router
from routes import applications as applications_router
from routes import documents as documents_router
from routes import password as password_router
from routes import ai as ai_router

# ── Rate Limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI()

# attach limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error handler ───────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."}
    )

# ── Tables ────────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Routes ───────────────────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(applications_router.router)
app.include_router(documents_router.router)
app.include_router(password_router.router)
app.include_router(ai_router.router)

@app.get("/")
def root():
    return {"message": "Job Tracker API is running"}