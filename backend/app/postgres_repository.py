from datetime import datetime
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.confirmation import (
    get_confirmation_code,
)
from app.database import SessionLocal
from app.models import (
    Delivery,
    DeliveryAssignment,
    DeliveryConfirmation,
    DeliveryStatusHistory,
    Notification,
    Rider,
    User,
)


class PostgreSQLRepository:
    # ========================================================
    # USERS
    # ========================================================

    def get_user_by_email(
        self,
        email: str,
    ) -> Optional[dict]:
        normalized_email = (
            email.strip().lower()
        )

        with SessionLocal() as db:
            user = db.scalar(
                select(User).where(
                    User.email
                    == normalized_email
                )
            )

            if not user:
                return None

            return self._user_to_dict(user)

    def get_user_by_id(
        self,
        user_id: str,
    ) -> Optional[dict]:
        with SessionLocal() as db:
            user = db.get(
                User,
                user_id,
            )

            if not user:
                return None

            return self._user_to_dict(user)

    # ========================================================
    # DELIVERIES
    # ========================================================

    def list_deliveries(
        self,
    ) -> list[dict]:
        with SessionLocal() as db:
            deliveries = (
                db.scalars(
                    select(Delivery)
                    .options(
                        selectinload(
                            Delivery.assignments
                        ).selectinload(
                            DeliveryAssignment.rider
                        )
                    )
                    .order_by(
                        Delivery.created_at.desc()
                    )
                )
                .unique()
                .all()
            )

            return [
                self._delivery_to_dict(
                    delivery
                )
                for delivery
                in deliveries
            ]

    def get_delivery(
        self,
        delivery_id: str,
    ) -> Optional[dict]:
        with SessionLocal() as db:
            delivery = db.scalar(
                select(Delivery)
                .options(
                    selectinload(
                        Delivery.assignments
                    ).selectinload(
                        DeliveryAssignment.rider
                    )
                )
                .where(
                    Delivery.id
                    == delivery_id
                )
            )

            if not delivery:
                return None

            return self._delivery_to_dict(
                delivery
            )

    def create_delivery(
        self,
        *,
        retailer: str,
        payload: dict,
    ) -> dict:
        with SessionLocal.begin() as db:
            retailer_user = db.scalar(
                select(User).where(
                    User.role == "retailer",
                    User.organization
                    == retailer,
                    User.is_active.is_(True),
                )
            )

            if not retailer_user:
                raise ValueError(
                    "Retailer organization "
                    "was not found"
                )

            delivery_id = (
                self._next_delivery_id(db)
            )

            priority = payload.get(
                "priority",
                "normal",
            )

            if hasattr(
                priority,
                "value",
            ):
                priority = priority.value

            delivery = Delivery(
                id=delivery_id,
                retailer_user_id=(
                    retailer_user.id
                ),
                retailer_name=retailer,
                customer_name=payload[
                    "customer_name"
                ],
                customer_phone=payload[
                    "customer_phone"
                ],
                pickup_location=payload[
                    "pickup_location"
                ],
                delivery_address=payload[
                    "delivery_address"
                ],
                item_description=payload[
                    "item_description"
                ],
                delivery_notes=payload.get(
                    "delivery_notes"
                ),
                status="pending",
                priority=priority,
                confirmation_status=(
                    "not_ready"
                ),
            )

            db.add(delivery)
            db.flush()

            db.add(
                DeliveryStatusHistory(
                    delivery_id=delivery.id,
                    status="pending",
                    changed_by_user_id=(
                        retailer_user.id
                    ),
                    note=(
                        "Delivery request "
                        "created"
                    ),
                )
            )

            db.flush()
            db.refresh(delivery)

            return self._delivery_to_dict(
                delivery
            )

    # ========================================================
    # ASSIGN RIDER
    # ========================================================

    def assign_rider(
        self,
        *,
        delivery_id: str,
        rider_id: str,
    ) -> dict:
        with SessionLocal.begin() as db:
            delivery = db.scalar(
                select(Delivery)
                .where(
                    Delivery.id
                    == delivery_id
                )
                .with_for_update()
            )

            if not delivery:
                raise KeyError(
                    "Delivery not found"
                )

            rider = db.scalar(
                select(Rider)
                .where(
                    Rider.id == rider_id
                )
                .with_for_update()
            )

            if not rider:
                raise KeyError(
                    "Rider not found"
                )

            if not rider.available:
                raise ValueError(
                    "Rider is not currently "
                    "available"
                )

            if delivery.status != "pending":
                raise ValueError(
                    "Only pending deliveries "
                    "can be assigned"
                )

            dispatcher = db.scalar(
                select(User).where(
                    User.role
                    == "dispatcher",
                    User.is_active.is_(
                        True
                    ),
                )
            )

            if not dispatcher:
                raise ValueError(
                    "No active dispatcher "
                    "account exists"
                )

            assignment = (
                DeliveryAssignment(
                    delivery_id=delivery.id,
                    rider_id=rider.id,
                    assigned_by_user_id=(
                        dispatcher.id
                    ),
                    active=True,
                )
            )

            db.add(assignment)

            delivery.status = "assigned"
            delivery.updated_at = (
                datetime.now()
                .astimezone()
            )

            rider.active_deliveries += 1

            db.flush()

            db.add(
                DeliveryStatusHistory(
                    delivery_id=delivery.id,
                    status="assigned",
                    changed_by_user_id=(
                        dispatcher.id
                    ),
                    note=(
                        f"Assigned to "
                        f"{rider.name}"
                    ),
                )
            )

            if rider.user_id:
                db.add(
                    Notification(
                        user_id=rider.user_id,
                        delivery_id=(
                            delivery.id
                        ),
                        title=(
                            "New delivery "
                            "assigned"
                        ),
                        message=(
                            f"Delivery "
                            f"{delivery.id} "
                            f"has been "
                            f"assigned to you."
                        ),
                        type="assignment",
                        read=False,
                    )
                )

            db.flush()

            # Load relationship before
            # leaving transaction.
            db.refresh(delivery)

            assignment.rider = rider
            delivery.assignments = [
                assignment
            ]

            return self._delivery_to_dict(
                delivery
            )

    # ========================================================
    # UPDATE DELIVERY STATUS
    # ========================================================

    def update_delivery_status(
        self,
        *,
        delivery_id: str,
        new_status: str,
    ) -> dict:
        with SessionLocal.begin() as db:
            delivery = db.scalar(
                select(Delivery)
                .options(
                    selectinload(
                        Delivery.assignments
                    ).selectinload(
                        DeliveryAssignment.rider
                    )
                )
                .where(
                    Delivery.id
                    == delivery_id
                )
                .with_for_update()
            )

            if not delivery:
                raise KeyError(
                    "Delivery not found"
                )

            valid_transitions = {
                "assigned":
                    "picked_up",
                "picked_up":
                    "in_transit",
                "in_transit":
                    "delivered",
            }

            expected_status = (
                valid_transitions.get(
                    delivery.status
                )
            )

            if (
                expected_status
                != new_status
            ):
                raise ValueError(
                    "Invalid status "
                    "transition: "
                    f"{delivery.status} "
                    f"→ {new_status}"
                )

            active_assignment = (
                self._active_assignment(
                    delivery
                )
            )

            rider_user_id = None

            if (
                active_assignment
                and active_assignment.rider
            ):
                rider_user_id = (
                    active_assignment
                    .rider
                    .user_id
                )

            delivery.status = new_status
            delivery.updated_at = (
                datetime.now()
                .astimezone()
            )

            if (
                new_status
                == "delivered"
            ):
                delivery.confirmation_status = (
                    "awaiting_confirmation"
                )

                confirmation = db.scalar(
                    select(
                        DeliveryConfirmation
                    ).where(
                        DeliveryConfirmation
                        .delivery_id
                        == delivery.id
                    )
                )

                if not confirmation:
                    db.add(
                        DeliveryConfirmation(
                            delivery_id=(
                                delivery.id
                            ),
                            confirmation_code=(
                                get_confirmation_code(
                                    delivery.id
                                )
                            ),
                            status=(
                                "awaiting_"
                                "confirmation"
                            ),
                        )
                    )

            db.add(
                DeliveryStatusHistory(
                    delivery_id=delivery.id,
                    status=new_status,
                    changed_by_user_id=(
                        rider_user_id
                    ),
                    note=(
                        "Delivery status "
                        f"updated to "
                        f"{new_status}"
                    ),
                )
            )

            retailer = db.get(
                User,
                delivery.retailer_user_id,
            )

            if retailer:
                db.add(
                    Notification(
                        user_id=retailer.id,
                        delivery_id=(
                            delivery.id
                        ),
                        title=(
                            "Delivery status "
                            "updated"
                        ),
                        message=(
                            f"{delivery.id} "
                            f"is now "
                            f"{self._status_label(new_status)}."
                        ),
                        type="status",
                        read=False,
                    )
                )

            db.flush()

            return self._delivery_to_dict(
                delivery
            )

    # ========================================================
    # CONFIRM DELIVERY
    # ========================================================

    def confirm_delivery(
        self,
        delivery_id: str,
    ) -> dict:
        with SessionLocal.begin() as db:
            delivery = db.scalar(
                select(Delivery)
                .options(
                    selectinload(
                        Delivery.assignments
                    ).selectinload(
                        DeliveryAssignment.rider
                    )
                )
                .where(
                    Delivery.id
                    == delivery_id
                )
                .with_for_update()
            )

            if not delivery:
                raise KeyError(
                    "Delivery not found"
                )

            if (
                delivery.status
                == "completed"
            ):
                return (
                    self._delivery_to_dict(
                        delivery
                    )
                )

            if (
                delivery.status
                != "delivered"
            ):
                raise ValueError(
                    "Delivery must be "
                    "marked Delivered "
                    "before confirmation"
                )

            confirmation = db.scalar(
                select(
                    DeliveryConfirmation
                ).where(
                    DeliveryConfirmation
                    .delivery_id
                    == delivery.id
                )
            )

            if not confirmation:
                confirmation = (
                    DeliveryConfirmation(
                        delivery_id=(
                            delivery.id
                        ),
                        confirmation_code=(
                            get_confirmation_code(
                                delivery.id
                            )
                        ),
                        status=(
                            "awaiting_"
                            "confirmation"
                        ),
                    )
                )

                db.add(confirmation)

            now = (
                datetime.now()
                .astimezone()
            )

            confirmation.status = (
                "confirmed"
            )
            confirmation.confirmed_at = (
                now
            )

            delivery.status = (
                "completed"
            )
            delivery.confirmation_status = (
                "confirmed"
            )
            delivery.updated_at = now

            db.add(
                DeliveryStatusHistory(
                    delivery_id=delivery.id,
                    status="completed",
                    changed_by_user_id=None,
                    note=(
                        "Customer confirmed "
                        "package received"
                    ),
                )
            )

            active_assignment = (
                self._active_assignment(
                    delivery
                )
            )

            rider = None

            if active_assignment:
                rider = (
                    active_assignment.rider
                )

                active_assignment.active = (
                    False
                )

                active_assignment.unassigned_at = (
                    now
                )

                if rider:
                    rider.active_deliveries = (
                        max(
                            0,
                            rider.active_deliveries
                            - 1,
                        )
                    )

            retailer = db.get(
                User,
                delivery.retailer_user_id,
            )

            if retailer:
                db.add(
                    Notification(
                        user_id=retailer.id,
                        delivery_id=(
                            delivery.id
                        ),
                        title=(
                            "Delivery confirmed"
                        ),
                        message=(
                            f"{delivery.id} "
                            "was confirmed "
                            "by the customer."
                        ),
                        type=(
                            "confirmation"
                        ),
                        read=False,
                    )
                )

            if rider and rider.user_id:
                db.add(
                    Notification(
                        user_id=(
                            rider.user_id
                        ),
                        delivery_id=(
                            delivery.id
                        ),
                        title=(
                            "Delivery confirmed"
                        ),
                        message=(
                            "The customer "
                            "confirmed receipt "
                            f"of {delivery.id}."
                        ),
                        type=(
                            "confirmation"
                        ),
                        read=False,
                    )
                )

            db.flush()

            return self._delivery_to_dict(
                delivery
            )

    # ========================================================
    # RIDERS
    # ========================================================

    def list_riders(
        self,
    ) -> list[dict]:
        with SessionLocal() as db:
            riders = db.scalars(
                select(Rider).order_by(
                    Rider.name.asc()
                )
            ).all()

            return [
                self._rider_to_dict(
                    rider
                )
                for rider
                in riders
            ]

    def get_rider(
        self,
        rider_id: str,
    ) -> Optional[dict]:
        with SessionLocal() as db:
            rider = db.get(
                Rider,
                rider_id,
            )

            if not rider:
                return None

            return self._rider_to_dict(
                rider
            )

    # ========================================================
    # NOTIFICATIONS
    # ========================================================

    def list_notifications(
        self,
        user_id: str,
    ) -> list[dict]:
        with SessionLocal() as db:
            notifications = (
                db.scalars(
                    select(Notification)
                    .where(
                        Notification.user_id
                        == user_id
                    )
                    .order_by(
                        Notification
                        .created_at
                        .desc()
                    )
                )
                .all()
            )

            return [
                {
                    "id":
                        notification.id,
                    "title":
                        notification.title,
                    "message":
                        notification.message,
                    "time":
                        self._format_datetime(
                            notification
                            .created_at
                        ),
                    "type":
                        notification.type,
                    "read":
                        notification.read,
                    "delivery_id":
                        notification
                        .delivery_id,
                }
                for notification
                in notifications
            ]

    # ========================================================
    # HELPERS
    # ========================================================

    @staticmethod
    def _user_to_dict(
        user: User,
    ) -> dict:
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "password_hash":
                user.password_hash,
            "role": user.role,
            "organization":
                user.organization,
            "is_active":
                user.is_active,
        }

    @staticmethod
    def _rider_to_dict(
        rider: Rider,
    ) -> dict:
        return {
            "id": rider.id,
            "name": rider.name,
            "phone": rider.phone,
            "available":
                rider.available,
            "active_deliveries":
                rider.active_deliveries,
        }

    def _delivery_to_dict(
        self,
        delivery: Delivery,
    ) -> dict:
        assignment = (
            self._active_assignment(
                delivery
            )
        )

        # Completed deliveries close their
        # assignment. For history pages we still
        # want to display the last rider.
        if (
            assignment is None
            and delivery.assignments
        ):
            assignment = (
                delivery.assignments[-1]
            )

        rider = (
            assignment.rider
            if (
                assignment
                and assignment.rider
            )
            else None
        )

        return {
            "id":
                delivery.id,
            "retailer":
                delivery.retailer_name,
            "customer":
                delivery.customer_name,

            # Kept for Member 2 frontend.
            "phone":
                delivery.customer_phone,

            # Kept for Member 3 frontend.
            "customer_phone":
                delivery.customer_phone,

            "pickup":
                delivery.pickup_location,
            "destination":
                delivery.delivery_address,
            "item":
                delivery.item_description,
            "delivery_notes":
                delivery.delivery_notes,

            "rider":
                rider.name
                if rider
                else None,

            "rider_phone":
                rider.phone
                if rider
                else None,

            "status":
                delivery.status,

            "priority":
                delivery.priority,

            "created_at":
                self._format_datetime(
                    delivery.created_at
                ),

            "updated_at":
                self._format_datetime(
                    delivery.updated_at
                ),

            "assigned_at":
                self._format_datetime(
                    assignment.assigned_at
                )
                if assignment
                else None,

            "confirmation_status":
                delivery
                .confirmation_status,
        }

    @staticmethod
    def _active_assignment(
        delivery: Delivery,
    ) -> Optional[
        DeliveryAssignment
    ]:
        assignments = (
            delivery.assignments
            or []
        )

        for assignment in reversed(
            assignments
        ):
            if assignment.active:
                return assignment

        return None

    @staticmethod
    def _next_delivery_id(
        db,
    ) -> str:
        delivery_ids = db.scalars(
            select(Delivery.id)
        ).all()

        numbers = []

        for delivery_id in delivery_ids:
            try:
                numbers.append(
                    int(
                        delivery_id
                        .split("-")[-1]
                    )
                )
            except (
                ValueError,
                IndexError,
            ):
                continue

        next_number = (
            max(numbers) + 1
            if numbers
            else 1001
        )

        return f"RFX-{next_number}"

    @staticmethod
    def _format_datetime(
        value: Optional[datetime],
    ) -> Optional[str]:
        if value is None:
            return None

        formatted = value.strftime(
            "%d %b %Y, %I:%M %p"
        )

        if formatted.startswith("0"):
            formatted = formatted[1:]

        return formatted

    @staticmethod
    def _status_label(
        value: str,
    ) -> str:
        return " ".join(
            word.capitalize()
            for word
            in value.split("_")
        )
