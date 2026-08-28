from copy import deepcopy
from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4

from app.confirmation import (
    generate_confirmation_token,
    hash_confirmation_token,
    is_valid_confirmation_token,
)

from app.demo_data import (
    DEMO_DELIVERIES,
    DEMO_NOTIFICATIONS,
    DEMO_RIDERS,
    DEMO_USERS,
)
from app.security import hash_password


class InMemoryRepository:
    def __init__(self):
        self.users = deepcopy(DEMO_USERS)
        self.deliveries = deepcopy(
            DEMO_DELIVERIES
        )
        self.riders = deepcopy(DEMO_RIDERS)
        self.notifications = deepcopy(
            DEMO_NOTIFICATIONS
        )
        self.audit_events: list[dict] = []
        for user in self.users:
            user.setdefault("phone", None)
            user.setdefault("account_status", "active")
            user.setdefault("created_at", self._timestamp())
            user.setdefault("approved_at", self._timestamp())
        self.confirmation_token_hashes: dict[str, str] = {}
        self.confirmation_token_expires_at: dict[str, datetime] = {}

        for rider in self.riders:
            rider_user = next(
                (
                    user
                    for user in self.users
                    if user["role"] == "rider" and user["name"] == rider["name"]
                ),
                None,
            )
            rider["user_id"] = rider_user["id"] if rider_user else None

        for delivery in self.deliveries:
            delivery.setdefault("pickup_latitude", None)
            delivery.setdefault("pickup_longitude", None)
            delivery.setdefault("destination_latitude", None)
            delivery.setdefault("destination_longitude", None)
            retailer_user = next(
                (
                    user
                    for user in self.users
                    if user.get("organization") == delivery["retailer"]
                    and user["role"] == "retailer"
                ),
                None,
            )
            rider_user = next(
                (
                    user
                    for user in self.users
                    if user["name"] == delivery.get("rider")
                    and user["role"] == "rider"
                ),
                None,
            )
            delivery["retailer_user_id"] = (
                retailer_user["id"] if retailer_user else None
            )
            delivery["rider_user_id"] = rider_user["id"] if rider_user else None

    # -------------------------
    # Users
    # -------------------------

    def register_user(
        self,
        *,
        name: str,
        email: str,
        password: str,
        role: str,
        organization: str | None = None,
        phone: str | None = None,
        allow_dispatcher: bool = False,
    ) -> dict:
        role_value = role.value if hasattr(role, "value") else role
        allowed_roles = {"retailer", "dispatcher", "rider"}
        if role_value not in allowed_roles:
            raise ValueError("This account role cannot be requested")

        normalized_email = email.strip().lower()
        if self.get_user_by_email(normalized_email):
            raise ValueError("An account with this email already exists")
        if role_value == "retailer" and not organization:
            raise ValueError("Retailer registration requires a business name")
        if role_value == "rider" and not phone:
            raise ValueError("Rider registration requires a phone number")

        account_status = "active" if allow_dispatcher else "pending"
        user = {
            "id": str(uuid4()),
            "name": name.strip(),
            "email": normalized_email,
            "password_hash": hash_password(password),
            "role": role_value,
            "organization": (
                organization.strip()
                if role_value == "retailer" and organization
                else "Reflex Riders"
                if role_value == "rider"
                else "Reflex Dispatch"
            ),
            "phone": phone.strip() if phone else None,
            "account_status": account_status,
            "is_active": account_status == "active",
            "created_at": self._timestamp(),
            "approved_at": self._timestamp() if account_status == "active" else None,
        }
        self.users.append(user)

        if role_value == "rider" and account_status == "active":
            self.riders.append(
                {
                    "id": str(uuid4()),
                    "user_id": user["id"],
                    "name": user["name"],
                    "phone": phone.strip(),
                    "available": True,
                    "active_deliveries": 0,
                }
            )

        self._add_audit(user["id"], "account.registered", "user", user["id"], {"requested_role": role_value})

        return deepcopy(user)

    def get_user_by_email(
        self,
        email: str,
    ) -> Optional[dict]:
        normalized = email.strip().lower()

        return next(
            (
                user
                for user in self.users
                if user["email"].lower()
                == normalized
            ),
            None,
        )

    def get_user_by_id(
        self,
        user_id: str,
    ) -> Optional[dict]:
        return next(
            (
                user
                for user in self.users
                if user["id"] == user_id
            ),
            None,
        )

    def update_user_profile(
        self,
        *,
        user_id: str,
        name: str,
        phone: str | None,
        organization: str | None,
    ) -> dict:
        user = self.get_user_by_id(user_id)
        if not user:
            raise KeyError("User not found")
        if user["role"] == "retailer" and not organization:
            raise ValueError("Retailer profiles require a business name")
        if user["role"] != "retailer" and organization is not None:
            raise ValueError("Only Retailers can update a business name")
        if user["role"] == "rider" and not phone:
            raise ValueError("Rider profiles require a phone number")

        updates = {
            "name": name,
            "phone": phone,
        }
        if user["role"] == "retailer":
            updates["organization"] = organization

        changed_fields = [
            field for field, value in updates.items()
            if user.get(field) != value
        ]
        user.update(updates)

        if user["role"] == "rider":
            rider = next(
                (item for item in self.riders if item.get("user_id") == user_id),
                None,
            )
            if rider:
                rider["name"] = name
                rider["phone"] = phone

        if changed_fields:
            self._add_audit(
                user_id,
                "profile.updated",
                "user",
                user_id,
                {"changed_fields": changed_fields},
            )
        return deepcopy(user)

    def admin_exists(self) -> bool:
        return any(user["role"] == "admin" for user in self.users)

    def create_initial_admin(self, *, name: str, email: str, password: str) -> dict:
        if self.admin_exists():
            raise ValueError("Reflex Admin setup has already been completed")
        if self.get_user_by_email(email):
            raise ValueError("An account with this email already exists")
        admin = {
            "id": str(uuid4()), "name": name.strip(), "email": email.strip().lower(),
            "password_hash": hash_password(password), "role": "admin",
            "organization": "Reflex Platform", "phone": None,
            "account_status": "active", "is_active": True,
            "created_at": self._timestamp(), "approved_at": self._timestamp(),
        }
        self.users.append(admin)
        self._add_audit(admin["id"], "admin.initialized", "user", admin["id"], {"role": "admin"})
        return deepcopy(admin)

    def list_users(self, *, account_status: str | None = None, role: str | None = None) -> list[dict]:
        return [deepcopy(user) for user in self.users if (not account_status or user["account_status"] == account_status) and (not role or user["role"] == role)]

    def set_user_account_status(self, *, user_id: str, account_status: str, actor_user_id: str) -> dict:
        user = self.get_user_by_id(user_id)
        if not user:
            raise KeyError("User not found")
        if account_status not in {"active", "rejected", "suspended"}:
            raise ValueError("Unsupported account status")
        if user["role"] == "admin" and user_id == actor_user_id and account_status != "active":
            raise ValueError("Administrators cannot suspend or reject their own account")
        previous = user["account_status"]
        user["account_status"] = account_status
        user["is_active"] = account_status == "active"
        if account_status == "active":
            user["approved_at"] = self._timestamp()
            if user["role"] == "rider" and not any(r.get("user_id") == user_id for r in self.riders):
                self.riders.append({"id": str(uuid4()), "user_id": user_id, "name": user["name"], "phone": user["phone"], "available": True, "active_deliveries": 0})
            elif user["role"] == "rider":
                rider = next((r for r in self.riders if r.get("user_id") == user_id), None)
                if rider:
                    rider["available"] = True
        elif user["role"] == "rider":
            rider = next((r for r in self.riders if r.get("user_id") == user_id), None)
            if rider:
                rider["available"] = False
        action = "account.approved" if account_status == "active" and previous == "pending" else f"account.{account_status}"
        self._add_audit(actor_user_id, action, "user", user_id, {"role": user["role"], "previous_status": previous})
        return deepcopy(user)

    def admin_stats(self) -> dict:
        return {
            "total_retailers": sum(u["role"] == "retailer" for u in self.users),
            "total_riders": sum(u["role"] == "rider" for u in self.users),
            "active_riders": sum(r["available"] for r in self.riders),
            "total_dispatchers": sum(u["role"] == "dispatcher" for u in self.users),
            "pending_approvals": sum(u["account_status"] == "pending" for u in self.users),
            "active_deliveries": sum(d["status"] not in {"completed", "failed", "cancelled"} for d in self.deliveries),
            "completed_deliveries": sum(d["status"] == "completed" for d in self.deliveries),
            "total_users": len(self.users),
        }

    def list_audit_events(self, *, limit: int = 100) -> list[dict]:
        return deepcopy(list(reversed(self.audit_events[-limit:])))

    # -------------------------
    # Deliveries
    # -------------------------

    def list_deliveries(
        self,
    ) -> list[dict]:
        return deepcopy(self.deliveries)

    def get_delivery(
        self,
        delivery_id: str,
    ) -> Optional[dict]:
        return next(
            (
                deepcopy(delivery)
                for delivery
                in self.deliveries
                if delivery["id"]
                == delivery_id
            ),
            None,
        )

    def create_delivery(
        self,
        *,
        retailer: str,
        retailer_user_id: str | None = None,
        payload: dict,
    ) -> dict:
        delivery_id = (
            f"RFX-{self._next_delivery_number()}"
        )

        now = self._timestamp()

        delivery = {
            "id": delivery_id,
            "retailer": retailer,
            "retailer_user_id": retailer_user_id,
            "customer": payload[
                "customer_name"
            ],
            "phone": payload[
                "customer_phone"
            ],
            "customer_phone": payload[
                "customer_phone"
            ],
            "pickup": payload[
                "pickup_location"
            ],
            "destination": payload[
                "delivery_address"
            ],
            "pickup_latitude": payload.get("pickup_latitude"),
            "pickup_longitude": payload.get("pickup_longitude"),
            "destination_latitude": payload.get("destination_latitude"),
            "destination_longitude": payload.get("destination_longitude"),
            "item": payload[
                "item_description"
            ],
            "delivery_notes": payload.get(
                "delivery_notes"
            ),
            "rider": None,
            "rider_user_id": None,
            "rider_phone": None,
            "status": "pending",
            "priority": payload[
                "priority"
            ],
            "created_at": now,
            "updated_at": now,
            "assigned_at": None,
            "confirmation_status":
                "not_ready",
        }

        self.deliveries.insert(
            0,
            delivery,
        )

        return deepcopy(delivery)

    def assign_rider(
        self,
        *,
        delivery_id: str,
        rider_id: str,
        assigned_by_user_id: str | None = None,
    ) -> dict:
        del assigned_by_user_id

        delivery = self._find_delivery_mutable(
            delivery_id
        )

        rider = self._find_rider_mutable(
            rider_id
        )

        if not delivery:
            raise KeyError(
                "Delivery not found"
            )

        if not rider:
            raise KeyError(
                "Rider not found"
            )

        if not rider["available"]:
            raise ValueError(
                "Rider is not currently available"
            )

        if delivery["status"] != "pending":
            raise ValueError(
                "Only pending deliveries "
                "can be assigned"
            )

        now = self._timestamp()

        delivery["rider"] = rider["name"]
        delivery["rider_user_id"] = rider.get("user_id")
        delivery["rider_phone"] = (
            rider["phone"]
        )
        delivery["status"] = "assigned"
        delivery["assigned_at"] = now
        delivery["updated_at"] = now

        rider["active_deliveries"] += 1

        return deepcopy(delivery)

    def update_delivery_status(
        self,
        *,
        delivery_id: str,
        new_status: str,
        changed_by_user_id: str | None = None,
    ) -> dict:
        del changed_by_user_id
        delivery = self._find_delivery_mutable(
            delivery_id
        )

        if not delivery:
            raise KeyError(
                "Delivery not found"
            )

        valid_transitions = {
            "assigned": "picked_up",
            "picked_up": "in_transit",
            "in_transit": "delivered",
        }

        expected = valid_transitions.get(
            delivery["status"]
        )

        if expected != new_status:
            raise ValueError(
                f"Invalid status transition: "
                f"{delivery['status']} "
                f"→ {new_status}"
            )

        delivery["status"] = new_status
        delivery["updated_at"] = (
            self._timestamp()
        )

        if new_status == "delivered":
            delivery[
                "confirmation_status"
            ] = "awaiting_confirmation"

        return deepcopy(delivery)

    def issue_confirmation_token(
        self,
        delivery_id: str,
    ) -> str:
        delivery = self._find_delivery_mutable(
            delivery_id
        )

        if not delivery:
            raise KeyError("Delivery not found")

        if delivery["status"] != "delivered":
            raise ValueError(
                "Confirmation is only available "
                "after delivery"
            )

        token = generate_confirmation_token()
        self.confirmation_token_hashes[
            delivery_id
        ] = hash_confirmation_token(token)
        self.confirmation_token_expires_at[
            delivery_id
        ] = datetime.now().astimezone() + timedelta(minutes=30)
        return token

    def validate_confirmation_token(
        self,
        delivery_id: str,
        token: str,
    ) -> bool:
        delivery = self._find_delivery_mutable(
            delivery_id
        )
        expected_hash = (
            self.confirmation_token_hashes.get(
                delivery_id
            )
        )
        expires_at = (
            self.confirmation_token_expires_at.get(
                delivery_id
            )
        )

        return bool(
            delivery
            and delivery["status"] == "delivered"
            and expected_hash
            and expires_at
            and expires_at > datetime.now().astimezone()
            and is_valid_confirmation_token(
                token,
                expected_hash,
            )
        )

    def confirm_delivery(
        self,
        delivery_id: str,
        token: str,
    ) -> dict:
        delivery = self._find_delivery_mutable(
            delivery_id
        )

        if not delivery:
            raise KeyError(
                "Delivery not found"
            )

        if not self.validate_confirmation_token(
            delivery_id,
            token,
        ):
            raise PermissionError(
                "Invalid or expired confirmation token"
            )

        if delivery["status"] != "delivered":
            raise ValueError(
                "Delivery must be marked "
                "Delivered before confirmation"
            )

        delivery["status"] = "completed"
        delivery[
            "confirmation_status"
        ] = "confirmed"
        delivery["updated_at"] = (
            self._timestamp()
        )
        self.confirmation_token_hashes.pop(
            delivery_id,
            None,
        )
        self.confirmation_token_expires_at.pop(
            delivery_id,
            None,
        )

        return deepcopy(delivery)

    # -------------------------
    # Riders
    # -------------------------

    def list_riders(
        self,
    ) -> list[dict]:
        return deepcopy(self.riders)

    def get_rider(
        self,
        rider_id: str,
    ) -> Optional[dict]:
        rider = self._find_rider_mutable(
            rider_id
        )

        return (
            deepcopy(rider)
            if rider
            else None
        )

    # -------------------------
    # Notifications
    # -------------------------

    def list_notifications(
        self,
        user_id: str,
    ) -> list[dict]:
        return [
            deepcopy(notification)
            for notification
            in self.notifications
            if notification["user_id"]
            == user_id
        ]

    def mark_notification_read(
        self,
        *,
        user_id: str,
        notification_id: int,
    ) -> bool:
        notification = next(
            (
                item
                for item in self.notifications
                if item["id"] == notification_id
                and item["user_id"] == user_id
            ),
            None,
        )

        if not notification:
            return False

        notification["read"] = True
        return True

    def mark_all_notifications_read(
        self,
        *,
        user_id: str,
    ) -> int:
        updated = 0

        for notification in self.notifications:
            if (
                notification["user_id"] == user_id
                and not notification["read"]
            ):
                notification["read"] = True
                updated += 1

        return updated

    # -------------------------
    # Internal helpers
    # -------------------------

    def _find_delivery_mutable(
        self,
        delivery_id: str,
    ) -> Optional[dict]:
        return next(
            (
                delivery
                for delivery
                in self.deliveries
                if delivery["id"]
                == delivery_id
            ),
            None,
        )

    def _find_rider_mutable(
        self,
        rider_id: str,
    ) -> Optional[dict]:
        return next(
            (
                rider
                for rider in self.riders
                if rider["id"]
                == rider_id
            ),
            None,
        )

    def _next_delivery_number(
        self,
    ) -> int:
        numbers = [
            int(
                delivery["id"].split("-")[
                    -1
                ]
            )
            for delivery
            in self.deliveries
        ]

        return max(numbers) + 1

    @staticmethod
    def _timestamp() -> str:
        return datetime.now().strftime(
            "%d %b %Y, %I:%M %p"
        )

    def _add_audit(self, actor_user_id: str | None, action: str, entity_type: str, entity_id: str, metadata: dict) -> None:
        actor = self.get_user_by_id(actor_user_id) if actor_user_id else None
        self.audit_events.append({
            "id": len(self.audit_events) + 1,
            "actor_name": actor["name"] if actor else None,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "metadata": deepcopy(metadata),
            "created_at": self._timestamp(),
        })


from app.postgres_repository import PostgreSQLRepository


repository = PostgreSQLRepository()


def get_repository() -> PostgreSQLRepository:
    return repository
