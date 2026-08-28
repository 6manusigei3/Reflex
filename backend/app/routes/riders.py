from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from app.dependencies import (
    get_current_user,
    require_roles,
)
from app.repository import (
    InMemoryRepository,
    get_repository,
)
from app.schemas import RiderResponse


router = APIRouter(
    prefix="/riders",
    tags=["Riders"],
)


# --------------------------------------------------
# List riders
# --------------------------------------------------


@router.get(
    "",
    response_model=list[RiderResponse],
)
def list_riders(
    available: bool | None = Query(
        default=None
    ),
    current_user: dict = Depends(
        require_roles("dispatcher")
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Dispatcher sees riders available for
    delivery assignment.

    Optional:
        ?available=true
        ?available=false
    """

    del current_user

    riders = repository.list_riders()

    if available is not None:
        riders = [
            rider
            for rider in riders
            if rider["available"]
            is available
        ]

    return riders


# --------------------------------------------------
# Dispatcher gets one rider
# --------------------------------------------------


@router.get(
    "/{rider_id}",
    response_model=RiderResponse,
)
def get_rider(
    rider_id: str,
    current_user: dict = Depends(
        require_roles("dispatcher")
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Dispatcher views one rider's details.
    """

    del current_user

    rider = repository.get_rider(
        rider_id
    )

    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rider not found",
        )

    return rider


# --------------------------------------------------
# Rider gets own rider profile
# --------------------------------------------------


@router.get(
    "/me/profile",
    response_model=RiderResponse,
)
def get_my_rider_profile(
    current_user: dict = Depends(
        require_roles("rider")
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Returns the rider profile linked to the
    authenticated Rider account.
    """

    riders = repository.list_riders()

    rider = next(
        (
            item
            for item in riders
            if item.get("user_id")
            == current_user["id"]
        ),
        None,
    )

    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Rider profile not found "
                "for this account"
            ),
        )

    return rider
