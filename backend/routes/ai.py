from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from routes.users import get_current_user
from dotenv import load_dotenv
import os, requests

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print(f"🔍 Groq key loaded: {GROQ_API_KEY[:10] if GROQ_API_KEY else 'NOT FOUND'}")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

# ── Schemas ───────────────────────────────────────────────────────────────────
class TailorRequest(BaseModel):
    cv_text: str
    job_description: str

class ImportRequest(BaseModel):
    job_text: str

# ── Helper to call Groq ───────────────────────────────────────────────────────
def call_groq(system_prompt: str, user_prompt: str) -> str:
    print(f"🔍 Calling Groq with key: {GROQ_API_KEY[:10] if GROQ_API_KEY else 'NOT FOUND'}")

    response = requests.post(
        GROQ_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": GROQ_MODEL,
            "max_tokens": 1500,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        }
    )

    print(f"🔍 Groq status code: {response.status_code}")
    print(f"🔍 Groq response: {response.text[:200]}")

    data = response.json()
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"]["message"])
    return data["choices"][0]["message"]["content"]

# ── CV Tailor route ───────────────────────────────────────────────────────────
@router.post("/tailor-cv")
def tailor_cv(
    body: TailorRequest,
    current_user = Depends(get_current_user)
):
    print(f"🔍 Tailor CV called by user: {current_user.id}")

    try:
        result = call_groq(
            system_prompt="You are a professional CV writer.",
            user_prompt=f"""Rewrite this CV to be fully tailored for the job description below.
Keep all real experience and skills but reword and emphasize the most relevant parts.

CV:
{body.cv_text}

Job Description:
{body.job_description}

Output a COMPLETE rewritten CV ready to copy and use. Do not give suggestions or analysis. Just output the full rewritten CV with:
- Tailored professional summary at the top
- Reworded skills section emphasizing relevant skills first
- Reworded project descriptions highlighting relevant experience
- Same format as original CV
- Short note at the end explaining key changes made"""
        )
        print(f"🔍 Got result from Groq!")
        return {"result": result}
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Job Import route ──────────────────────────────────────────────────────────
@router.post("/import-job")
def import_job(
    body: ImportRequest,
    current_user = Depends(get_current_user)
):
    print(f"🔍 Import job called by user: {current_user.id}")

    try:
        result = call_groq(
            system_prompt="You are a job description parser. Extract job details and return ONLY a JSON object with no extra text, no markdown, no backticks.",
            user_prompt=f"""Extract the following details from this job posting and return ONLY a valid JSON object:
{{
  "company_name": "company name or empty string",
  "job_title": "job title or empty string",
  "job_type": "one of: Full Time, Part Time, Internship, Remote, Hybrid",
  "notes": "a brief 1-2 sentence summary of the role"
}}

Job posting:
{body.job_text}"""
        )
        print(f"🔍 Got result from Groq!")
        return {"result": result}
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))