import base64
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt


JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "reflex-development-secret-change-before-deployment",
)

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256",
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "480",
    )
)

JWT_ISSUER = "reflex-api"

PBKDF2_ITERATIONS = 250_000


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(
        value
    ).decode("utf-8")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(
        value.encode("utf-8")
    )


def hash_password(password: str) -> str:
    salt = os.urandom(16)

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )

    return (
        f"pbkdf2_sha256"
        f"${PBKDF2_ITERATIONS}"
        f"${_encode(salt)}"
        f"${_encode(digest)}"
    )


def verify_password(
    password: str,
    stored_hash: str,
) -> bool:
    try:
        algorithm, iterations, salt, expected = (
            stored_hash.split("$", 3)
        )

        if algorithm != "pbkdf2_sha256":
            return False

        digest = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            _decode(salt),
            int(iterations),
        )

        return hmac.compare_digest(
            digest,
            _decode(expected),
        )

    except (ValueError, TypeError):
        return False


def create_access_token(
    *,
    user_id: str,
    role: str,
    name: str,
) -> str:
    now = datetime.now(timezone.utc)

    expires = now + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload: dict[str, Any] = {
        "sub": user_id,
        "role": role,
        "name": name,
        "iat": now,
        "exp": expires,
        "iss": JWT_ISSUER,
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(
    token: str,
) -> dict[str, Any]:
    return jwt.decode(
        token,
        JWT_SECRET,
        algorithms=[JWT_ALGORITHM],
        issuer=JWT_ISSUER,
    )
