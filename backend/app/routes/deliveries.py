from fastapi import (
    APIRouter,
    BackgroundTasks,
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
from app.schemas import (
    AssignRiderRequest,
    ConfirmationRequest,
    ConfirmationResponse,
    CreateDeliveryRequest,
    DeliveryResponse,
    DeliveryStatus,
    UpdateDeliveryStatusRequest,
)
from app.services.geocoding_service import geocoding_service
from app.services.email_service import email_service


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

    if role in {"admin", "dispatcher"}:
        return

    if role == "retailer":
        if delivery.get("retailer_user_id") != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You cannot access another "
                    "retailer's delivery"
                ),
            )

        return

    if role == "rider":
        if delivery.get("rider_user_id") != current_user["id"]:
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

    if role in {"admin", "dispatcher"}:
        return deliveries

    if role == "retailer":
        return [
            delivery
            for delivery in deliveries
            if delivery.get("retailer_user_id") == current_user["id"]
        ]

    if role == "rider":
        return [
            delivery
            for delivery in deliveries
            if delivery.get("rider_user_id") == current_user["id"]
        ]

    return []


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

    coordinates = geocoding_service.geocode_route(
        pickup_address=payload.pickup_location,
        destination_address=payload.delivery_address,
    )
    delivery_payload = payload.model_dump()
    delivery_payload.update(coordinates)

    delivery = repository.create_delivery(
        retailer=organization,
        retailer_user_id=current_user["id"],
        payload=delivery_payload,
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
    background_tasks: BackgroundTasks,
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

    try:
        delivery = repository.assign_rider(
            delivery_id=delivery_id,
            rider_id=payload.rider_id,
            assigned_by_user_id=current_user["id"],
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

    retailer = repository.get_user_by_id(delivery.get("retailer_user_id"))
    rider_user = repository.get_user_by_id(delivery.get("rider_user_id"))
    if retailer:
        background_tasks.add_task(
            email_service.rider_assigned,
            delivery,
            retailer,
            rider_user,
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
    background_tasks: BackgroundTasks,
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

    if delivery.get("rider_user_id") != current_user["id"]:
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
                changed_by_user_id=current_user["id"],
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

    if updated_delivery["status"] == "delivered":
        retailer = repository.get_user_by_id(updated_delivery.get("retailer_user_id"))
        if retailer:
            background_tasks.add_task(
                email_service.delivery_delivered,
                updated_delivery,
                retailer,
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

    if not repository.validate_confirmation_token(
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
    background_tasks: BackgroundTasks,
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

    try:
        updated_delivery = (
            repository.confirm_delivery(
                delivery_id,
                payload.code,
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

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    retailer = repository.get_user_by_id(updated_delivery.get("retailer_user_id"))
    if retailer:
        background_tasks.add_task(
            email_service.delivery_completed,
            updated_delivery,
            retailer,
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
        "message": "Delivery confirmed successfully",
    }


# --------------------------------------------------
# Rider QR confirmation token
# --------------------------------------------------


@router.get(
    "/{delivery_id}/confirmation-code",
)
def get_confirmation_token(
    delivery_id: str,
    current_user: dict = Depends(
        require_roles("rider")
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """Issue a fresh token and invalidate any previously displayed QR."""

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

    try:
        token = repository.issue_confirmation_token(
            delivery_id
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

    return {
        "deliveryId": delivery_id,
        "code": token,
    }
