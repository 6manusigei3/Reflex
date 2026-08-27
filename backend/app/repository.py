from copy import deepcopy
from datetime import datetime
from typing import Optional

from app.demo_data import (
    DEMO_DELIVERIES,
    DEMO_NOTIFICATIONS,
    DEMO_RIDERS,
    DEMO_USERS,
)


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

    # -------------------------
    # Users
    # -------------------------

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
        payload: dict,
    ) -> dict:
        delivery_id = (
            f"RFX-{self._next_delivery_number()}"
        )

        now = self._timestamp()

        delivery = {
            "id": delivery_id,
            "retailer": retailer,
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
            "item": payload[
                "item_description"
            ],
            "delivery_notes": payload.get(
                "delivery_notes"
            ),
            "rider": None,
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
    ) -> dict:
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
    ) -> dict:
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

    def confirm_delivery(
        self,
        delivery_id: str,
    ) -> dict:
        delivery = self._find_delivery_mutable(
            delivery_id
        )

        if not delivery:
            raise KeyError(
                "Delivery not found"
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


from app.postgres_repository import PostgreSQLRepository


repository = PostgreSQLRepository()


def get_repository() -> PostgreSQLRepository:
    return repository
