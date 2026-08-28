from datetime import datetime, timedelta
import json
from typing import Optional
from uuid import uuid4

from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import func, select, text
from sqlalchemy.orm import selectinload

from app.confirmation import (
    generate_confirmation_token,
    hash_confirmation_token,
    is_valid_confirmation_token,
)
from app.database import SessionLocal
from app.models import (
    AuditEvent,
    Delivery,
    DeliveryAssignment,
    DeliveryConfirmation,
    DeliveryStatusHistory,
    Notification,
    Rider,
    User,
)
from app.security import hash_password


class PostgreSQLRepository:
    # ========================================================
    # USERS
    # ========================================================

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
        normalized_name = name.strip()
        normalized_organization = organization.strip() if organization else None
        normalized_phone = phone.strip() if phone else None

        if role_value == "retailer" and not normalized_organization:
            raise ValueError("Retailer registration requires a business name")
        if role_value == "rider" and not normalized_phone:
            raise ValueError("Rider registration requires a phone number")

        with SessionLocal.begin() as db:
            existing = db.scalar(
                select(User).where(User.email == normalized_email)
            )
            if existing:
                raise ValueError("An account with this email already exists")

            account_status = "active" if allow_dispatcher else "pending"
            user = User(
                id=str(uuid4()),
                name=normalized_name,
                email=normalized_email,
                password_hash=hash_password(password),
                role=role_value,
                organization=(
                    normalized_organization
                    if role_value == "retailer"
                    else "Reflex Riders"
                    if role_value == "rider"
                    else "Reflex Dispatch"
                ),
                phone=normalized_phone,
                account_status=account_status,
                is_active=account_status == "active",
            )
            db.add(user)
            db.flush()

            if role_value == "rider" and account_status == "active":
                db.add(
                    Rider(
                        id=str(uuid4()),
                        user_id=user.id,
                        name=user.name,
                        phone=normalized_phone,
                        available=True,
                        active_deliveries=0,
                    )
                )
                db.flush()

            self._audit(
                db,
                actor_user_id=user.id,
                action="account.registered",
                entity_type="user",
                entity_id=user.id,
                metadata={"requested_role": role_value},
            )

            if account_status == "pending":
                admins = db.scalars(
                    select(User).where(
                        User.role == "admin",
                        User.account_status == "active",
                        User.is_active.is_(True),
                    )
                ).all()
                for admin in admins:
                    db.add(
                        Notification(
                            user_id=admin.id,
                            title="New account approval",
                            message=f"{user.name} requested {role_value} access.",
                            type="system",
                            read=False,
                        )
                    )

            return self._user_to_dict(user)

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

    def update_user_profile(
        self,
        *,
        user_id: str,
        name: str,
        phone: str | None,
        organization: str | None,
    ) -> dict:
        with SessionLocal.begin() as db:
            user = db.scalar(
                select(User).where(User.id == user_id).with_for_update()
            )
            if not user:
                raise KeyError("User not found")
            if user.role == "retailer" and not organization:
                raise ValueError("Retailer profiles require a business name")
            if user.role != "retailer" and organization is not None:
                raise ValueError("Only Retailers can update a business name")
            if user.role == "rider" and not phone:
                raise ValueError("Rider profiles require a phone number")

            updates = {"name": name, "phone": phone}
            if user.role == "retailer":
                updates["organization"] = organization
            changed_fields = [
                field for field, value in updates.items()
                if getattr(user, field) != value
            ]
            for field, value in updates.items():
                setattr(user, field, value)

            if user.role == "rider":
                rider = db.scalar(select(Rider).where(Rider.user_id == user.id))
                if rider:
                    rider.name = name
                    rider.phone = phone

            if changed_fields:
                self._audit(
                    db,
                    actor_user_id=user.id,
                    action="profile.updated",
                    entity_type="user",
                    entity_id=user.id,
                    metadata={"changed_fields": changed_fields},
                )
            db.flush()
            return self._user_to_dict(user)

    def admin_exists(self) -> bool:
        with SessionLocal() as db:
            return bool(db.scalar(select(func.count()).select_from(User).where(User.role == "admin")))

    def create_initial_admin(self, *, name: str, email: str, password: str) -> dict:
        with SessionLocal.begin() as db:
            db.execute(text("SELECT pg_advisory_xact_lock(82471389)"))
            if db.scalar(select(User.id).where(User.role == "admin")):
                raise ValueError("Reflex Admin setup has already been completed")
            normalized_email = email.strip().lower()
            if db.scalar(select(User.id).where(User.email == normalized_email)):
                raise ValueError("An account with this email already exists")
            admin = User(
                id=str(uuid4()),
                name=name.strip(),
                email=normalized_email,
                password_hash=hash_password(password),
                role="admin",
                organization="Reflex Platform",
                account_status="active",
                is_active=True,
                approved_at=datetime.now().astimezone(),
            )
            db.add(admin)
            db.flush()
            self._audit(
                db,
                actor_user_id=admin.id,
                action="admin.initialized",
                entity_type="user",
                entity_id=admin.id,
                metadata={"role": "admin"},
            )
            return self._user_to_dict(admin)

    def list_users(self, *, account_status: str | None = None, role: str | None = None) -> list[dict]:
        with SessionLocal() as db:
            query = select(User).order_by(User.created_at.desc())
            if account_status:
                query = query.where(User.account_status == account_status)
            if role:
                query = query.where(User.role == role)
            return [self._user_to_dict(user) for user in db.scalars(query).all()]

    def set_user_account_status(self, *, user_id: str, account_status: str, actor_user_id: str) -> dict:
        if account_status not in {"active", "rejected", "suspended"}:
            raise ValueError("Unsupported account status")
        with SessionLocal.begin() as db:
            user = db.scalar(select(User).where(User.id == user_id).with_for_update())
            if not user:
                raise KeyError("User not found")
            if user.role == "admin" and user.id == actor_user_id and account_status != "active":
                raise ValueError("Administrators cannot suspend or reject their own account")
            previous_status = user.account_status
            user.account_status = account_status
            user.is_active = account_status == "active"
            if account_status == "active":
                user.approved_by_user_id = actor_user_id
                user.approved_at = datetime.now().astimezone()
                if user.role == "rider":
                    rider = db.scalar(select(Rider).where(Rider.user_id == user.id))
                    if not rider:
                        if not user.phone:
                            raise ValueError("Rider account is missing a phone number")
                        db.add(Rider(
                            id=str(uuid4()), user_id=user.id, name=user.name,
                            phone=user.phone, available=True, active_deliveries=0,
                        ))
                    else:
                        rider.available = True
            elif user.role == "rider":
                rider = db.scalar(select(Rider).where(Rider.user_id == user.id))
                if rider:
                    rider.available = False
            action = {
                "active": "account.approved" if previous_status == "pending" else "account.activated",
                "rejected": "account.rejected",
                "suspended": "account.suspended",
            }[account_status]
            self._audit(
                db,
                actor_user_id=actor_user_id,
                action=action,
                entity_type="user",
                entity_id=user.id,
                metadata={"role": user.role, "previous_status": previous_status},
            )
            db.flush()
            return self._user_to_dict(user)

    def admin_stats(self) -> dict:
        with SessionLocal() as db:
            users = db.scalars(select(User)).all()
            deliveries = db.scalars(select(Delivery)).all()
            riders = db.scalars(select(Rider)).all()
            return {
                "total_retailers": sum(user.role == "retailer" for user in users),
                "total_riders": sum(user.role == "rider" for user in users),
                "active_riders": sum(rider.available for rider in riders),
                "total_dispatchers": sum(user.role == "dispatcher" for user in users),
                "pending_approvals": sum(user.account_status == "pending" for user in users),
                "active_deliveries": sum(delivery.status not in {"completed", "cancelled", "failed"} for delivery in deliveries),
                "completed_deliveries": sum(delivery.status == "completed" for delivery in deliveries),
                "total_users": len(users),
            }

    def list_audit_events(self, *, limit: int = 100) -> list[dict]:
        with SessionLocal() as db:
            events = db.scalars(select(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit)).all()
            actor_ids = {event.actor_user_id for event in events if event.actor_user_id}
            actors = {
                user.id: user.name
                for user in db.scalars(select(User).where(User.id.in_(actor_ids))).all()
            } if actor_ids else {}
            return [{
                "id": event.id,
                "actor_name": actors.get(event.actor_user_id),
                "action": event.action,
                "entity_type": event.entity_type,
                "entity_id": event.entity_id,
                "metadata": json.loads(event.metadata_json) if event.metadata_json else {},
                "created_at": self._format_datetime(event.created_at),
            } for event in events]

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
        retailer_user_id: str | None = None,
        payload: dict,
    ) -> dict:
        with SessionLocal.begin() as db:
            retailer_user = (
                db.get(User, retailer_user_id)
                if retailer_user_id
                else db.scalar(
                    select(User).where(
                        User.role == "retailer",
                        User.organization == retailer,
                        User.is_active.is_(True),
                    )
                )
            )

            if not (
                retailer_user
                and retailer_user.role == "retailer"
                and retailer_user.is_active
                and retailer_user.organization == retailer
            ):
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
                pickup_latitude=payload.get("pickup_latitude"),
                pickup_longitude=payload.get("pickup_longitude"),
                destination_latitude=payload.get("destination_latitude"),
                destination_longitude=payload.get("destination_longitude"),
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

            self._audit(
                db,
                actor_user_id=retailer_user.id,
                action="delivery.created",
                entity_type="delivery",
                entity_id=delivery.id,
                metadata={"priority": priority},
            )

            dispatchers = db.scalars(
                select(User).where(
                    User.role == "dispatcher",
                    User.account_status == "active",
                    User.is_active.is_(True),
                )
            ).all()
            for dispatcher in dispatchers:
                db.add(
                    Notification(
                        user_id=dispatcher.id,
                        delivery_id=delivery.id,
                        title="New delivery request",
                        message=f"{delivery.id} is ready for rider assignment.",
                        type="system",
                        read=False,
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
        assigned_by_user_id: str | None = None,
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

            rider_user = db.get(User, rider.user_id) if rider.user_id else None
            if not (
                rider_user
                and rider_user.role == "rider"
                and rider_user.account_status == "active"
                and rider_user.is_active
            ):
                raise ValueError("Rider account is not active")

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

            dispatcher = (
                db.get(User, assigned_by_user_id)
                if assigned_by_user_id
                else db.scalar(
                    select(User).where(
                        User.role == "dispatcher",
                        User.is_active.is_(True),
                    )
                )
            )

            if not (
                dispatcher
                and dispatcher.role == "dispatcher"
                and dispatcher.is_active
            ):
                raise ValueError(
                    "Active dispatcher account "
                    "was not found"
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

            self._audit(
                db,
                actor_user_id=dispatcher.id,
                action="delivery.rider_assigned",
                entity_type="delivery",
                entity_id=delivery.id,
                metadata={"rider_id": rider.id},
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
        changed_by_user_id: str | None = None,
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
                            confirmation_token_hash=None,
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

            self._audit(
                db,
                actor_user_id=changed_by_user_id or rider_user_id,
                action="delivery.status_changed",
                entity_type="delivery",
                entity_id=delivery.id,
                metadata={"status": new_status},
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
    # CUSTOMER CONFIRMATION TOKENS
    # ========================================================

    def issue_confirmation_token(
        self,
        delivery_id: str,
    ) -> str:
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

            if delivery.status != "delivered":
                raise ValueError(
                    "Confirmation is only "
                    "available after delivery"
                )

            confirmation = db.scalar(
                select(
                    DeliveryConfirmation
                ).where(
                    DeliveryConfirmation
                    .delivery_id
                    == delivery_id
                )
            )

            if not confirmation:
                confirmation = (
                    DeliveryConfirmation(
                        delivery_id=delivery_id,
                        confirmation_token_hash=None,
                        confirmation_token_expires_at=None,
                        status=(
                            "awaiting_"
                            "confirmation"
                        ),
                    )
                )
                db.add(confirmation)

            token = (
                generate_confirmation_token()
            )
            confirmation.confirmation_token_hash = (
                hash_confirmation_token(
                    token
                )
            )
            confirmation.confirmation_token_expires_at = (
                datetime.now().astimezone()
                + timedelta(minutes=30)
            )
            confirmation.status = (
                "awaiting_confirmation"
            )

            db.flush()
            return token

    def validate_confirmation_token(
        self,
        delivery_id: str,
        token: str,
    ) -> bool:
        with SessionLocal() as db:
            confirmation = db.scalar(
                select(
                    DeliveryConfirmation
                ).where(
                    DeliveryConfirmation
                    .delivery_id
                    == delivery_id,
                    DeliveryConfirmation.status
                    == "awaiting_confirmation",
                )
            )

            return bool(
                confirmation
                and confirmation
                .confirmation_token_hash
                and confirmation
                .confirmation_token_expires_at
                and confirmation
                .confirmation_token_expires_at
                > datetime.now().astimezone()
                and is_valid_confirmation_token(
                    token,
                    confirmation
                    .confirmation_token_hash,
                )
            )

    # ========================================================
    # CONFIRM DELIVERY
    # ========================================================

    def confirm_delivery(
        self,
        delivery_id: str,
        token: str,
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

            confirmation = db.scalar(
                select(
                    DeliveryConfirmation
                ).where(
                    DeliveryConfirmation
                    .delivery_id
                    == delivery.id
                ).with_for_update()
            )

            if not (
                confirmation
                and confirmation.status
                == "awaiting_confirmation"
                and confirmation
                .confirmation_token_hash
                and confirmation
                .confirmation_token_expires_at
                and confirmation
                .confirmation_token_expires_at
                > datetime.now().astimezone()
                and is_valid_confirmation_token(
                    token,
                    confirmation
                    .confirmation_token_hash,
                )
            ):
                raise PermissionError(
                    "Invalid or expired "
                    "confirmation token"
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
            confirmation.confirmation_token_hash = (
                None
            )
            confirmation.confirmation_token_expires_at = (
                None
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

            self._audit(
                db,
                actor_user_id=None,
                action="delivery.confirmed",
                entity_type="delivery",
                entity_id=delivery.id,
                metadata={"status": "completed"},
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
                select(Rider)
                .join(User, Rider.user_id == User.id)
                .where(
                    User.account_status == "active",
                    User.is_active.is_(True),
                )
                .order_by(
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

    def mark_notification_read(
        self,
        *,
        user_id: str,
        notification_id: int,
    ) -> bool:
        with SessionLocal.begin() as db:
            notification = db.scalar(
                select(Notification).where(
                    Notification.id == notification_id,
                    Notification.user_id == user_id,
                )
            )

            if not notification:
                return False

            notification.read = True
            db.flush()
            return True

    def mark_all_notifications_read(
        self,
        *,
        user_id: str,
    ) -> int:
        with SessionLocal.begin() as db:
            notifications = db.scalars(
                select(Notification).where(
                    Notification.user_id == user_id,
                    Notification.read.is_(False),
                )
            ).all()

            for notification in notifications:
                notification.read = True

            db.flush()
            return len(notifications)

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
            "phone": user.phone,
            "account_status": user.account_status,
            "is_active":
                user.is_active,
            "created_at": PostgreSQLRepository._format_datetime(user.created_at),
            "approved_at": PostgreSQLRepository._format_datetime(user.approved_at),
        }

    @staticmethod
    def _audit(
        db,
        *,
        actor_user_id: str | None,
        action: str,
        entity_type: str,
        entity_id: str,
        metadata: dict | None = None,
    ) -> None:
        db.add(
            AuditEvent(
                actor_user_id=actor_user_id,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                metadata_json=json.dumps(metadata or {}, sort_keys=True),
            )
        )

    @staticmethod
    def _rider_to_dict(
        rider: Rider,
    ) -> dict:
        return {
            "id": rider.id,
            "user_id": rider.user_id,
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
            "retailer_user_id":
                delivery.retailer_user_id,
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
            "pickup_latitude":
                delivery.pickup_latitude,
            "pickup_longitude":
                delivery.pickup_longitude,
            "destination_latitude":
                delivery.destination_latitude,
            "destination_longitude":
                delivery.destination_longitude,
            "item":
                delivery.item_description,
            "delivery_notes":
                delivery.delivery_notes,

            "rider":
                rider.name
                if rider
                else None,

            "rider_user_id":
                rider.user_id
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
