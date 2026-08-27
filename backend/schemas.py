from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(
        word.capitalize() for word in parts[1:]
    )


class APIModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        use_enum_values=True,
    )


class UserRole(str, Enum):
    RETAILER = "retailer"
    DISPATCHER = "dispatcher"
    RIDER = "rider"


class DeliveryStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DeliveryPriority(str, Enum):
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class ConfirmationStatus(str, Enum):
    NOT_READY = "not_ready"
    AWAITING_CONFIRMATION = "awaiting_confirmation"
    CONFIRMED = "confirmed"


# -------------------------
# Authentication
# -------------------------

class LoginRequest(APIModel):
    email: str
    password: str


class UserPublic(APIModel):
    id: str
    name: str
    email: str
    role: UserRole
    organization: Optional[str] = None


class TokenResponse(APIModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPublic


# -------------------------
# Deliveries
# -------------------------

class CreateDeliveryRequest(APIModel):
    customer_name: str = Field(min_length=2, max_length=120)
    customer_phone: str = Field(min_length=9, max_length=20)

    pickup_location: str = Field(min_length=2, max_length=255)
    delivery_address: str = Field(min_length=2, max_length=255)

    item_description: str = Field(min_length=2, max_length=500)
    delivery_notes: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    priority: DeliveryPriority = DeliveryPriority.NORMAL


class DeliveryResponse(APIModel):
    id: str

    retailer: str

    customer: str

    # Kept because the Retailer frontend currently uses "phone".
    phone: str

    # Kept as well because the Rider frontend uses "customerPhone".
    customer_phone: str

    pickup: str
    destination: str
    item: str

    delivery_notes: Optional[str] = None

    rider: Optional[str] = None
    rider_phone: Optional[str] = None

    status: DeliveryStatus
    priority: DeliveryPriority

    created_at: str
    updated_at: str

    # Rider UI already uses this field.
    assigned_at: Optional[str] = None

    confirmation_status: ConfirmationStatus


class AssignRiderRequest(APIModel):
    rider_id: str


class UpdateDeliveryStatusRequest(APIModel):
    status: DeliveryStatus


class ConfirmationRequest(APIModel):
    code: str = Field(min_length=4, max_length=64)


class ConfirmationResponse(APIModel):
    delivery_id: str
    status: DeliveryStatus
    confirmation_status: ConfirmationStatus
    message: str


# -------------------------
# Riders
# -------------------------

class RiderResponse(APIModel):
    id: str
    name: str
    phone: str
    available: bool
    active_deliveries: int


# -------------------------
# Notifications
# -------------------------

class NotificationType(str, Enum):
    ASSIGNMENT = "assignment"
    STATUS = "status"
    CONFIRMATION = "confirmation"
    SYSTEM = "system"


class NotificationResponse(APIModel):
    id: int
    title: str
    message: str
    time: str
    type: NotificationType
    read: bool
    delivery_id: Optional[str] = None
