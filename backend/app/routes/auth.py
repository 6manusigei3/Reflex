from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.dependencies import (
    get_current_user,
)
from app.repository import (
    InMemoryRepository,
    get_repository,
)
from app.schemas import (
    LoginRequest,
    TokenResponse,
    UserPublic,
)
from app.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: LoginRequest,
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    user = repository.get_user_by_email(
        payload.email
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(
        payload.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        user_id=user["id"],
        role=user["role"],
        name=user["name"],
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in":
            ACCESS_TOKEN_EXPIRE_MINUTES
            * 60,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "organization": user.get(
                "organization"
            ),
        },
    }


@router.get(
    "/me",
    response_model=UserPublic,
)
def get_me(
    current_user: dict = Depends(
        get_current_user
    ),
):
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "organization": current_user.get(
            "organization"
        ),
    }
