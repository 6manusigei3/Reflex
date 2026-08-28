from enum import Enum
import re
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


def to_camel(value: str) -> str:
    parts = value.split("_")

    return parts[0] + "".join(
        word.capitalize()
        for word in parts[1:]
    )


class APIModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        use_enum_values=True,
    )


# ============================================================
# ENUMS
# ============================================================


class UserRole(str, Enum):
    ADMIN = "admin"
    RETAILER = "retailer"
    DISPATCHER = "dispatcher"
    RIDER = "rider"


class RegistrationRole(str, Enum):
    RETAILER = "retailer"
    DISPATCHER = "dispatcher"
    RIDER = "rider"


class AccountStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


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
    AWAITING_CONFIRMATION = (
        "awaiting_confirmation"
    )
    CONFIRMED = "confirmed"


class NotificationType(str, Enum):
    ASSIGNMENT = "assignment"
    STATUS = "status"
    CONFIRMATION = "confirmation"
    SYSTEM = "system"


# ============================================================
# AUTHENTICATION
# ============================================================


class LoginRequest(APIModel):
    email: str
    password: str


class RegisterRequest(APIModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: RegistrationRole
    organization: Optional[str] = Field(default=None, max_length=180)
    phone: Optional[str] = Field(default=None, max_length=30)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Enter your full name")
        return normalized

    @field_validator("organization", "phone")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        local, separator, domain = normalized.partition("@")
        if not separator or not local or "." not in domain:
            raise ValueError("Enter a valid email address")
        return normalized

    @model_validator(mode="after")
    def validate_role_profile(self):
        if self.role == RegistrationRole.RETAILER and not self.organization:
            raise ValueError("Retailer registration requires a business name")
        if self.role == RegistrationRole.RIDER and not self.phone:
            raise ValueError("Rider registration requires a phone number")
        return self


class UserPublic(APIModel):
    id: str
    name: str
    email: str
    role: UserRole
    organization: Optional[str] = None
    phone: Optional[str] = None
    account_status: AccountStatus


class ProfileUpdate(APIModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        use_enum_values=True,
        extra="forbid",
    )

    name: str = Field(min_length=2, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=30)
    organization: Optional[str] = Field(default=None, max_length=180)

    @field_validator("name")
    @classmethod
    def normalize_profile_name(cls, value: str) -> str:
        normalized = " ".join(value.strip().split())
        if len(normalized) < 2:
            raise ValueError("Enter your full name")
        return normalized

    @field_validator("phone")
    @classmethod
    def validate_profile_phone(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        normalized = " ".join(value.strip().split())
        if not re.fullmatch(r"[0-9+().\- ]+", normalized):
            raise ValueError("Enter a valid phone number")
        digit_count = len(re.sub(r"\D", "", normalized))
        if digit_count < 7 or digit_count > 15:
            raise ValueError("Phone number must contain 7 to 15 digits")
        return normalized

    @field_validator("organization")
    @classmethod
    def normalize_profile_organization(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.strip().split())
        return normalized or None


class TokenResponse(APIModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPublic


class RegistrationResponse(APIModel):
    user: UserPublic
    message: str


class AdminSetupRequest(APIModel):
    setup_token: str = Field(min_length=8, max_length=500)
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def normalize_setup_name(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Enter the administrator's full name")
        return normalized

    @field_validator("email")
    @classmethod
    def normalize_setup_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        local, separator, domain = normalized.partition("@")
        if not separator or not local or "." not in domain:
            raise ValueError("Enter a valid email address")
        return normalized


class AdminSetupStatus(APIModel):
    setup_required: bool


class AdminUserResponse(UserPublic):
    created_at: str
    approved_at: Optional[str] = None


class AdminStatsResponse(APIModel):
    total_retailers: int
    total_riders: int
    active_riders: int
    total_dispatchers: int
    pending_approvals: int
    active_deliveries: int
    completed_deliveries: int
    total_users: int


class AuditEventResponse(APIModel):
    id: int
    actor_name: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    metadata: dict
    created_at: str


# ============================================================
# DELIVERIES
# ============================================================


class CreateDeliveryRequest(APIModel):
    customer_name: str = Field(
        min_length=2,
        max_length=120,
    )

    customer_phone: str = Field(
        min_length=9,
        max_length=20,
    )

    pickup_location: str = Field(
        min_length=2,
        max_length=255,
    )

    delivery_address: str = Field(
        min_length=2,
        max_length=255,
    )

    item_description: str = Field(
        min_length=2,
        max_length=500,
    )

    delivery_notes: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    priority: DeliveryPriority = (
        DeliveryPriority.NORMAL
    )


class DeliveryResponse(APIModel):
    id: str

    retailer: str
    customer: str

    # Retailer frontend compatibility
    phone: str

    # Rider frontend compatibility
    customer_phone: str

    pickup: str
    destination: str
    pickup_latitude: Optional[float] = None
    pickup_longitude: Optional[float] = None
    destination_latitude: Optional[float] = None
    destination_longitude: Optional[float] = None
    item: str

    delivery_notes: Optional[str] = None

    rider: Optional[str] = None
    rider_phone: Optional[str] = None

    status: DeliveryStatus
    priority: DeliveryPriority

    created_at: str
    updated_at: str
    assigned_at: Optional[str] = None

    confirmation_status: ConfirmationStatus


class AssignRiderRequest(APIModel):
    rider_id: str


class UpdateDeliveryStatusRequest(APIModel):
    status: DeliveryStatus


class ConfirmationRequest(APIModel):
    code: str = Field(
        min_length=4,
        max_length=64,
    )


class ConfirmationResponse(APIModel):
    delivery_id: str
    status: DeliveryStatus
    confirmation_status: ConfirmationStatus
    message: str


# ============================================================
# RIDERS
# ============================================================


class RiderResponse(APIModel):
    id: str
    name: str
    phone: str
    available: bool
    active_deliveries: int


# ============================================================
# NOTIFICATIONS
# ============================================================


class NotificationResponse(APIModel):
    id: int
    title: str
    message: str
    time: str
    type: NotificationType
    read: bool
    delivery_id: Optional[str] = None
