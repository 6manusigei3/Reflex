from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from app.confirmation import (
    get_confirmation_code,
    is_valid_confirmation_code,
)
from app.dependencies import (
    get_current_user,
    require_roles,
)
from app.repository import (
    InMemoryRepository,
    get_repository,
)
from app.schemas import (
    AssignRiderRequest,
    ConfirmationRequest,
    ConfirmationResponse,
    CreateDeliveryRequest,
    DeliveryResponse,
    DeliveryStatus,
    UpdateDeliveryStatusRequest,
)


router = APIRouter(
    prefix="/deliveries",
    tags=["Deliveries"],
)


# --------------------------------------------------
# Helpers
# --------------------------------------------------


def ensure_delivery_access(
    delivery: dict,
    current_user: dict,
) -> None:
    """
    Ensures that users only access deliveries that
    belong to their role/workspace.

    Dispatcher:
        May access every delivery.

    Retailer:
        May access deliveries belonging to their
        organization.

    Rider:
        May access deliveries assigned to them.
    """

    role = current_user["role"]

    if role == "dispatcher":
        return

    if role == "retailer":
        organization = current_user.get(
            "organization"
        )

        if delivery["retailer"] != organization:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You cannot access another "
                    "retailer's delivery"
                ),
            )

        return

    if role == "rider":
        if (
            delivery.get("rider")
            != current_user["name"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "This delivery is not "
                    "assigned to you"
                ),
            )

        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied",
    )


def filter_deliveries_for_user(
    deliveries: list[dict],
    current_user: dict,
) -> list[dict]:
    role = current_user["role"]

    if role == "dispatcher":
        return deliveries

    if role == "retailer":
        organization = current_user.get(
            "organization"
        )

        return [
            delivery
            for delivery in deliveries
            if delivery["retailer"]
            == organization
        ]

    if role == "rider":
        return [
            delivery
            for delivery in deliveries
            if delivery.get("rider")
            == current_user["name"]
        ]

    return []


def find_rider_by_name(
    repository: InMemoryRepository,
    rider_name: str | None,
) -> dict | None:
    if not rider_name:
        return None

    return next(
        (
            rider
            for rider
            in repository.list_riders()
            if rider["name"]
            == rider_name
        ),
        None,
    )


# --------------------------------------------------
# Create delivery
# --------------------------------------------------


@router.post(
    "",
    response_model=DeliveryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_delivery(
    payload: CreateDeliveryRequest,
    current_user: dict = Depends(
        require_roles("retailer")
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Retailer creates a delivery request.

    A newly-created delivery starts as Pending
    and does not yet have a rider.
    """

    organization = current_user.get(
        "organization"
    )

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Retailer account does not have "
                "an organization"
            ),
        )

    delivery = repository.create_delivery(
        retailer=organization,
        payload=payload.model_dump(),
    )

    return delivery


# --------------------------------------------------
# List deliveries
# --------------------------------------------------


@router.get(
    "",
    response_model=list[DeliveryResponse],
)
def list_deliveries(
    delivery_status: DeliveryStatus | None = Query(
        default=None,
        alias="status",
    ),
    current_user: dict = Depends(
        get_current_user
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Returns deliveries based on the logged-in role.

    Retailer:
        Only their own organization's deliveries.

    Dispatcher:
        All deliveries.

    Rider:
        Only deliveries assigned to them.
    """

    deliveries = repository.list_deliveries()

    deliveries = filter_deliveries_for_user(
        deliveries,
        current_user,
    )

    if delivery_status:
        status_value = (
            delivery_status.value
            if hasattr(
                delivery_status,
                "value",
            )
            else delivery_status
        )

        deliveries = [
            delivery
            for delivery in deliveries
            if delivery["status"]
            == status_value
        ]

    return deliveries


# --------------------------------------------------
# Get one delivery
# --------------------------------------------------


@router.get(
    "/{delivery_id}",
    response_model=DeliveryResponse,
)
def get_delivery(
    delivery_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    delivery = repository.get_delivery(
        delivery_id
    )

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    ensure_delivery_access(
        delivery,
        current_user,
    )

    return delivery


# --------------------------------------------------
# Dispatcher assigns rider
# --------------------------------------------------


@router.post(
    "/{delivery_id}/assign",
    response_model=DeliveryResponse,
)
def assign_rider(
    delivery_id: str,
    payload: AssignRiderRequest,
    current_user: dict = Depends(
        require_roles("dispatcher")
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Dispatcher assigns an available rider to a
    pending delivery.
    """

    del current_user

    try:
        delivery = repository.assign_rider(
            delivery_id=delivery_id,
            rider_id=payload.rider_id,
        )

    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc.args[0]),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    return delivery


# --------------------------------------------------
# Rider updates status
# --------------------------------------------------


@router.patch(
    "/{delivery_id}/status",
    response_model=DeliveryResponse,
)
def update_delivery_status(
    delivery_id: str,
    payload: UpdateDeliveryStatusRequest,
    current_user: dict = Depends(
        require_roles("rider")
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Rider moves a delivery through the approved
    workflow:

    Assigned
        ↓
    Picked Up
        ↓
    In Transit
        ↓
    Delivered
    """

    delivery = repository.get_delivery(
        delivery_id
    )

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    if (
        delivery.get("rider")
        != current_user["name"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You cannot update a delivery "
                "assigned to another rider"
            ),
        )

    new_status = (
        payload.status.value
        if hasattr(payload.status, "value")
        else payload.status
    )

    try:
        updated_delivery = (
            repository.update_delivery_status(
                delivery_id=delivery_id,
                new_status=new_status,
            )
        )

    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    return updated_delivery


# --------------------------------------------------
# Public QR confirmation information
# --------------------------------------------------


@router.get(
    "/{delivery_id}/confirmation",
)
def get_confirmation_information(
    delivery_id: str,
    code: str = Query(...),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Public endpoint used after a customer scans a QR
    code.

    Only limited delivery information is returned.
    Sensitive rider/account information is not
    exposed.
    """

    delivery = repository.get_delivery(
        delivery_id
    )

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    if not is_valid_confirmation_code(
        delivery_id,
        code,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid confirmation code",
        )

    if delivery["status"] not in (
        "delivered",
        "completed",
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Delivery has not reached "
                "the confirmation stage"
            ),
        )

    return {
        "deliveryId": delivery["id"],
        "customer": delivery["customer"],
        "retailer": delivery["retailer"],
        "destination": delivery[
            "destination"
        ],
        "item": delivery["item"],
        "status": delivery["status"],
        "confirmationStatus": delivery[
            "confirmation_status"
        ],
    }


# --------------------------------------------------
# Customer confirms delivery
# --------------------------------------------------


@router.post(
    "/{delivery_id}/confirm",
    response_model=ConfirmationResponse,
)
def confirm_delivery(
    delivery_id: str,
    payload: ConfirmationRequest,
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Public customer confirmation endpoint.

    The QR confirmation code is required.
    """

    delivery = repository.get_delivery(
        delivery_id
    )

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    if not is_valid_confirmation_code(
        delivery_id,
        payload.code,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid confirmation code",
        )

    if delivery["status"] == "completed":
        return {
            "delivery_id": delivery["id"],
            "status": delivery["status"],
            "confirmation_status": delivery[
                "confirmation_status"
            ],
            "message": (
                "Delivery was already confirmed"
            ),
        }

    try:
        updated_delivery = (
            repository.confirm_delivery(
                delivery_id
            )
        )

    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    rider = find_rider_by_name(
        repository,
        updated_delivery.get("rider"),
    )

    return {
        "delivery_id":
            updated_delivery["id"],
        "status":
            updated_delivery["status"],
        "confirmation_status":
            updated_delivery[
                "confirmation_status"
            ],
        "message": (
            "Delivery confirmed successfully"
            if rider
            else "Delivery confirmed successfully"
        ),
    }


# --------------------------------------------------
# Demo QR code helper
# --------------------------------------------------


@router.get(
    "/{delivery_id}/confirmation-code",
)
def get_demo_confirmation_code(
    delivery_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Returns the temporary QR confirmation code.

    This is deliberately included only for the
    capstone prototype.

    Production Reflex would never expose a
    predictable confirmation code like this.
    """

    delivery = repository.get_delivery(
        delivery_id
    )

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    ensure_delivery_access(
        delivery,
        current_user,
    )

    if delivery["status"] not in (
        "delivered",
        "completed",
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Confirmation is not available "
                "for this delivery yet"
            ),
        )

    return {
        "deliveryId": delivery_id,
        "code": get_confirmation_code(
            delivery_id
        ),
    }
