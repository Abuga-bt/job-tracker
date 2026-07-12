import re
import html

def sanitize_string(value: str) -> str:
    """Remove harmful characters and HTML tags from input"""
    if not value:
        return value
    # escape HTML special characters
    value = html.escape(value)
    # remove any script tags
    value = re.sub(r'<script.*?>.*?</script>', '', value, flags=re.IGNORECASE)
    # strip leading/trailing whitespace
    value = value.strip()
    return value

def sanitize_application(data: dict) -> dict:
    """Sanitize all string fields in an application"""
    string_fields = ["company_name", "job_title", "job_type", "notes", "feedback", "job_url"]
    for field in string_fields:
        if field in data and data[field]:
            data[field] = sanitize_string(data[field])
    return data