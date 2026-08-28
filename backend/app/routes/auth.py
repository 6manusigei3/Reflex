from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    status,
)
from secrets import compare_digest

from app.config import settings
from app.dependencies import (
    get_current_user,
)
from app.repository import (
    InMemoryRepository,
    get_repository,
)
from app.schemas import (
    LoginRequest,
    ProfileUpdate,
    AdminSetupRequest,
    AdminSetupStatus,
    RegistrationResponse,
    RegisterRequest,
    TokenResponse,
    UserPublic,
)
from app.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    verify_password,
)
from app.services.email_service import email_service


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def build_token_response(user: dict) -> dict:
    token = create_access_token(
        user_id=user["id"],
        role=user["role"],
        name=user["name"],
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "organization": user.get("organization"),
            "phone": user.get("phone"),
            "account_status": user.get("account_status", "active"),
        },
    }


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

    account_status = user.get("account_status", "active")
    if account_status != "active" or not user.get("is_active", True):
        messages = {
            "pending": "Your account is awaiting administrator approval.",
            "rejected": "Your account request was not approved.",
            "suspended": "Your account has been suspended. Contact a Reflex administrator.",
        }
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=messages.get(account_status, "User account is inactive"),
        )

    return build_token_response(user)


@router.post(
    "/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    background_tasks: BackgroundTasks,
    repository: InMemoryRepository = Depends(get_repository),
):
    """Create a pending Retailer, Dispatcher, or Rider request."""

    try:
        user = repository.register_user(
            name=payload.name,
            email=payload.email,
            password=payload.password,
            role=payload.role,
            organization=payload.organization,
            phone=payload.phone,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    background_tasks.add_task(email_service.account_created, user)

    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "organization": user.get("organization"),
            "phone": user.get("phone"),
            "account_status": user["account_status"],
        },
        "message": "Your Reflex account has been created and is awaiting administrator approval.",
    }


@router.get("/admin-setup", response_model=AdminSetupStatus)
def admin_setup_status(repository: InMemoryRepository = Depends(get_repository)):
    return {"setup_required": not repository.admin_exists()}


@router.post("/admin-setup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def initialize_admin(
    payload: AdminSetupRequest,
    repository: InMemoryRepository = Depends(get_repository),
):
    if not settings.ADMIN_SETUP_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin setup is not configured",
        )
    if not compare_digest(payload.setup_token, settings.ADMIN_SETUP_TOKEN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Admin setup token",
        )
    try:
        admin = repository.create_initial_admin(
            name=payload.name,
            email=payload.email,
            password=payload.password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return build_token_response(admin)


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
        "phone": current_user.get("phone"),
        "account_status": current_user.get("account_status", "active"),
    }


@router.patch(
    "/me",
    response_model=UserPublic,
)
def update_me(
    payload: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    repository: InMemoryRepository = Depends(get_repository),
):
    """Update the authenticated user's safe profile fields."""
    try:
        return repository.update_user_profile(
            user_id=current_user["id"],
            name=payload.name,
            phone=payload.phone,
            organization=payload.organization,
        )
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc
