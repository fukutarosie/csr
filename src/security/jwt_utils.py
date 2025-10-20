"""
JWT Utilities for Access and Refresh Tokens
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import jwt, JWTError

# Settings (fallbacks provided, prefer .env variables)
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(subject: str, extra: Optional[Dict[str, Any]] = None, expires_minutes: Optional[int] = None) -> str:
    to_encode = {"sub": subject, "iat": int(_utcnow().timestamp())}
    if extra:
        to_encode.update(extra)
    expire = _utcnow() + timedelta(minutes=expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(subject: str, extra: Optional[Dict[str, Any]] = None, expires_days: Optional[int] = None) -> str:
    to_encode = {"sub": subject, "type": "refresh", "iat": int(_utcnow().timestamp())}
    if extra:
        to_encode.update(extra)
    expire = _utcnow() + timedelta(days=expires_days or REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


def get_token_subject(token: str) -> Optional[str]:
    payload = decode_token(token)
    if not payload:
        return None
    return payload.get("sub")
