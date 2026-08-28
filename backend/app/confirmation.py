import hashlib
import hmac
import secrets


TOKEN_BYTES = 18


def generate_confirmation_token() -> str:
    """Create an unpredictable URL-safe token for one customer confirmation."""

    return secrets.token_urlsafe(TOKEN_BYTES)


def hash_confirmation_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def is_valid_confirmation_token(
    token: str,
    expected_hash: str,
) -> bool:
    supplied_hash = hash_confirmation_token(token)
    return hmac.compare_digest(supplied_hash, expected_hash)
