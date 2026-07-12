from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from dotenv import load_dotenv
from slowapi import Limiter
from slowapi.util import get_remote_address
import models, auth, os, secrets, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

router = APIRouter(prefix="/password", tags=["Password Reset"])
limiter = Limiter(key_func=get_remote_address)

# ── Send email helper ─────────────────────────────────────────────────────────
def send_reset_email(email: str, reset_token: str, user_name: str):
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"

    msg = MIMEMultipart()
    msg["From"] = os.getenv("MAIL_EMAIL")
    msg["To"] = email
    msg["Subject"] = "Job Tracker — Password Reset Request"

    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #378ADD;">Password Reset Request</h2>
        <p>Hi {user_name},</p>
        <p>Click the button below to reset your password.</p>
        <p>This link expires in <strong>30 minutes.</strong></p>
        <a href="{reset_link}"
           style="display: inline-block; background: #378ADD; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  margin: 20px 0;">
           Reset My Password
        </a>
        <p>If you didn't request this, ignore this email.</p>
        <p style="color: #888; font-size: 12px;">Job Tracker — Your career companion</p>
    </body>
    </html>
    """

    msg.attach(MIMEText(body, "html"))

    print(f"🔍 Connecting to Gmail...")
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(os.getenv("MAIL_EMAIL"), os.getenv("MAIL_PASSWORD"))
        server.sendmail(os.getenv("MAIL_EMAIL"), email, msg.as_string())
        print(f"✅ Email sent to {email}!")

# ── Schemas ───────────────────────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ── Request password reset ────────────────────────────────────────────────────
@router.post("/forgot-password")
@limiter.limit("3/hour")
async def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    print(f"🔍 Forgot password request for: {body.email}")

    user = db.query(models.User).filter(
        models.User.email == body.email
    ).first()

    print(f"🔍 User found: {user}")

    if not user:
        return {"message": "If this email exists you will receive a reset link shortly"}

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=30)

    # delete any existing tokens for this email
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.email == body.email
    ).delete()

    # save new token
    reset_token = models.PasswordResetToken(
        email=body.email,
        token=token,
        expires_at=expires_at
    )
    db.add(reset_token)
    db.commit()

    print(f"🔍 Token saved, attempting to send email...")

    try:
        send_reset_email(body.email, token, user.name)
    except Exception as e:
        print(f"❌ Email failed: {e}")
        raise HTTPException(status_code=500, detail=f"Email error: {str(e)}")

    return {"message": "If this email exists you will receive a reset link shortly"}

# ── Reset password ─────────────────────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    # find token
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == request.token,
        models.PasswordResetToken.used == "false"
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or already used reset link")

    # check expiry
    if datetime.utcnow() > reset_token.expires_at:
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    # find user
    user = db.query(models.User).filter(
        models.User.email == reset_token.email
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # update password
    user.password = auth.hash_password(request.new_password)

    # mark token as used
    reset_token.used = "true"
    db.commit()

    return {"message": "Password reset successfully! You can now log in."}