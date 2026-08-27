
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database import Base


# ============================================================
# USERS
# ============================================================


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "role IN ('retailer', 'dispatcher', 'rider')",
            name="ck_users_role",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        index=True,
        nullable=False,
    )

    organization: Mapped[Optional[str]] = mapped_column(
        String(180),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ----------------------------
    # Relationships
    # ----------------------------

    rider_profile: Mapped[Optional["Rider"]] = relationship(
        back_populates="user",
        uselist=False,
    )

    created_deliveries: Mapped[list["Delivery"]] = relationship(
        back_populates="retailer_user",
        foreign_keys="Delivery.retailer_user_id",
    )

    assignments_created: Mapped[
        list["DeliveryAssignment"]
    ] = relationship(
        back_populates="assigned_by",
        foreign_keys=(
            "DeliveryAssignment.assigned_by_user_id"
        ),
    )

    status_changes: Mapped[
        list["DeliveryStatusHistory"]
    ] = relationship(
        back_populates="changed_by",
    )

    notifications: Mapped[
        list["Notification"]
    ] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


# ============================================================
# RIDERS
# ============================================================


class Rider(Base):
    __tablename__ = "riders"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
    )

    user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        unique=True,
        nullable=True,
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        index=True,
    )

    phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    active_deliveries: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ----------------------------
    # Relationships
    # ----------------------------

    user: Mapped[Optional["User"]] = relationship(
        back_populates="rider_profile",
    )

    assignments: Mapped[
        list["DeliveryAssignment"]
    ] = relationship(
        back_populates="rider",
    )


# ============================================================
# DELIVERIES
# ============================================================


class Delivery(Base):
    __tablename__ = "deliveries"

    __table_args__ = (
        CheckConstraint(
            (
                "status IN ("
                "'pending', "
                "'assigned', "
                "'picked_up', "
                "'in_transit', "
                "'delivered', "
                "'completed', "
                "'failed', "
                "'cancelled'"
                ")"
            ),
            name="ck_deliveries_status",
        ),
        CheckConstraint(
            (
                "priority IN ("
                "'normal', "
                "'high', "
                "'urgent'"
                ")"
            ),
            name="ck_deliveries_priority",
        ),
        CheckConstraint(
            (
                "confirmation_status IN ("
                "'not_ready', "
                "'awaiting_confirmation', "
                "'confirmed'"
                ")"
            ),
            name="ck_deliveries_confirmation_status",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
    )

    retailer_user_id: Mapped[str] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    # Snapshot of retailer/business name.
    # This keeps historical records understandable even if
    # account information changes later.
    retailer_name: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    customer_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    customer_phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    pickup_location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    delivery_address: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    item_description: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    delivery_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="pending",
        index=True,
        nullable=False,
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        default="normal",
        index=True,
        nullable=False,
    )

    confirmation_status: Mapped[str] = mapped_column(
        String(40),
        default="not_ready",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ----------------------------
    # Relationships
    # ----------------------------

    retailer_user: Mapped["User"] = relationship(
        back_populates="created_deliveries",
        foreign_keys=[retailer_user_id],
    )

    assignments: Mapped[
        list["DeliveryAssignment"]
    ] = relationship(
        back_populates="delivery",
        cascade="all, delete-orphan",
        order_by="DeliveryAssignment.assigned_at",
    )

    status_history: Mapped[
        list["DeliveryStatusHistory"]
    ] = relationship(
        back_populates="delivery",
        cascade="all, delete-orphan",
        order_by="DeliveryStatusHistory.created_at",
    )

    confirmation: Mapped[
        Optional["DeliveryConfirmation"]
    ] = relationship(
        back_populates="delivery",
        cascade="all, delete-orphan",
        uselist=False,
    )

    notifications: Mapped[
        list["Notification"]
    ] = relationship(
        back_populates="delivery",
    )


# ============================================================
# DELIVERY ASSIGNMENTS
# ============================================================


class DeliveryAssignment(Base):
    __tablename__ = "delivery_assignments"

    __table_args__ = (
        UniqueConstraint(
            "delivery_id",
            "rider_id",
            "assigned_at",
            name="uq_delivery_assignment_event",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    delivery_id: Mapped[str] = mapped_column(
        ForeignKey(
            "deliveries.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    rider_id: Mapped[str] = mapped_column(
        ForeignKey(
            "riders.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    assigned_by_user_id: Mapped[str] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    unassigned_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ----------------------------
    # Relationships
    # ----------------------------

    delivery: Mapped["Delivery"] = relationship(
        back_populates="assignments",
    )

    rider: Mapped["Rider"] = relationship(
        back_populates="assignments",
    )

    assigned_by: Mapped["User"] = relationship(
        back_populates="assignments_created",
        foreign_keys=[assigned_by_user_id],
    )


# ============================================================
# DELIVERY STATUS HISTORY
# ============================================================


class DeliveryStatusHistory(Base):
    __tablename__ = "delivery_status_history"

    __table_args__ = (
        CheckConstraint(
            (
                "status IN ("
                "'pending', "
                "'assigned', "
                "'picked_up', "
                "'in_transit', "
                "'delivered', "
                "'completed', "
                "'failed', "
                "'cancelled'"
                ")"
            ),
            name="ck_delivery_history_status",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    delivery_id: Mapped[str] = mapped_column(
        ForeignKey(
            "deliveries.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    changed_by_user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    note: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False,
    )

    # ----------------------------
    # Relationships
    # ----------------------------

    delivery: Mapped["Delivery"] = relationship(
        back_populates="status_history",
    )

    changed_by: Mapped[Optional["User"]] = relationship(
        back_populates="status_changes",
    )


# ============================================================
# DELIVERY CONFIRMATIONS
# ============================================================


class DeliveryConfirmation(Base):
    __tablename__ = "delivery_confirmations"

    __table_args__ = (
        CheckConstraint(
            (
                "status IN ("
                "'awaiting_confirmation', "
                "'confirmed'"
                ")"
            ),
            name="ck_delivery_confirmation_status",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    delivery_id: Mapped[str] = mapped_column(
        ForeignKey(
            "deliveries.id",
            ondelete="CASCADE",
        ),
        unique=True,
        nullable=False,
        index=True,
    )

    # Prototype confirmation token/code.
    # Production should store a strong hashed,
    # random, short-lived token instead.
    confirmation_code: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(40),
        default="awaiting_confirmation",
        nullable=False,
    )

    confirmed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ----------------------------
    # Relationship
    # ----------------------------

    delivery: Mapped["Delivery"] = relationship(
        back_populates="confirmation",
    )


# ============================================================
# NOTIFICATIONS
# ============================================================


class Notification(Base):
    __tablename__ = "notifications"

    __table_args__ = (
        CheckConstraint(
            (
                "type IN ("
                "'assignment', "
                "'status', "
                "'confirmation', "
                "'system'"
                ")"
            ),
            name="ck_notifications_type",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    delivery_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey(
            "deliveries.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False,
    )

    # ----------------------------
    # Relationships
    # ----------------------------

    user: Mapped["User"] = relationship(
        back_populates="notifications",
    )

    delivery: Mapped[Optional["Delivery"]] = relationship(
        back_populates="notifications",
    )
