import secrets
from datetime import datetime, timedelta
from app.auth.security import hash_password

def generate_otp():
    otp = f"{secrets.randbelow(10**6):06}"
    return otp

def otp_expiry(minutes=10):
    return datetime.utcnow() + timedelta(minutes=minutes)
