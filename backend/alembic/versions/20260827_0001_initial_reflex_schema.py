"""Initial Reflex database schema

Revision ID: 20260827_0001
Revises:
Create Date: 2026-08-27
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260827_0001"

down_revision: Union[
    str,
    None,
] = None

branch_labels: Union[
    str,
    Sequence[str],
    None,
] = None

depends_on: Union[
    str,
    Sequence[str],
    None,
] = None


def upgrade() -> None:
    # ========================================================
    # USERS
    # ========================================================

    op.create_table(
        "users",
        sa.Column(
            "id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "email",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "password_hash",
            sa.String(length=500),
            nullable=False,
        ),
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "organization",
            sa.String(length=180),
            nullable=True,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            (
                "role IN "
                "('retailer', "
                "'dispatcher', "
                "'rider')"
            ),
            name="ck_users_role",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=False,
    )

    op.create_index(
        "ix_users_role",
        "users",
        ["role"],
        unique=False,
    )

    # ========================================================
    # RIDERS
    # ========================================================

    op.create_table(
        "riders",
        sa.Column(
            "id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.String(length=36),
            nullable=True,
        ),
        sa.Column(
            "name",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "phone",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "available",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "active_deliveries",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_index(
        "ix_riders_name",
        "riders",
        ["name"],
        unique=False,
    )

    op.create_index(
        "ix_riders_available",
        "riders",
        ["available"],
        unique=False,
    )

    # ========================================================
    # DELIVERIES
    # ========================================================

    op.create_table(
        "deliveries",
        sa.Column(
            "id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "retailer_user_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "retailer_name",
            sa.String(length=180),
            nullable=False,
        ),
        sa.Column(
            "customer_name",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "customer_phone",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "pickup_location",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "delivery_address",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "item_description",
            sa.String(length=500),
            nullable=False,
        ),
        sa.Column(
            "delivery_notes",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.String(length=30),
            server_default="pending",
            nullable=False,
        ),
        sa.Column(
            "priority",
            sa.String(length=20),
            server_default="normal",
            nullable=False,
        ),
        sa.Column(
            "confirmation_status",
            sa.String(length=40),
            server_default="not_ready",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
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
        sa.CheckConstraint(
            (
                "priority IN ("
                "'normal', "
                "'high', "
                "'urgent'"
                ")"
            ),
            name="ck_deliveries_priority",
        ),
        sa.CheckConstraint(
            (
                "confirmation_status IN ("
                "'not_ready', "
                "'awaiting_confirmation', "
                "'confirmed'"
                ")"
            ),
            name=(
                "ck_deliveries_"
                "confirmation_status"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["retailer_user_id"],
            ["users.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_deliveries_retailer_user_id",
        "deliveries",
        ["retailer_user_id"],
        unique=False,
    )

    op.create_index(
        "ix_deliveries_status",
        "deliveries",
        ["status"],
        unique=False,
    )

    op.create_index(
        "ix_deliveries_priority",
        "deliveries",
        ["priority"],
        unique=False,
    )

    op.create_index(
        "ix_deliveries_created_at",
        "deliveries",
        ["created_at"],
        unique=False,
    )

    # ========================================================
    # DELIVERY ASSIGNMENTS
    # ========================================================

    op.create_table(
        "delivery_assignments",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "delivery_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "rider_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "assigned_by_user_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "assigned_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "unassigned_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["assigned_by_user_id"],
            ["users.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["delivery_id"],
            ["deliveries.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["rider_id"],
            ["riders.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "delivery_id",
            "rider_id",
            "assigned_at",
            name=(
                "uq_delivery_"
                "assignment_event"
            ),
        ),
    )

    op.create_index(
        "ix_delivery_assignments_delivery_id",
        "delivery_assignments",
        ["delivery_id"],
        unique=False,
    )

    op.create_index(
        "ix_delivery_assignments_rider_id",
        "delivery_assignments",
        ["rider_id"],
        unique=False,
    )

    op.create_index(
        "ix_delivery_assignments_active",
        "delivery_assignments",
        ["active"],
        unique=False,
    )

    # ========================================================
    # DELIVERY STATUS HISTORY
    # ========================================================

    op.create_table(
        "delivery_status_history",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "delivery_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "changed_by_user_id",
            sa.String(length=36),
            nullable=True,
        ),
        sa.Column(
            "note",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
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
            name=(
                "ck_delivery_history_status"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["changed_by_user_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["delivery_id"],
            ["deliveries.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        (
            "ix_delivery_status_history_"
            "delivery_id"
        ),
        "delivery_status_history",
        ["delivery_id"],
        unique=False,
    )

    op.create_index(
        (
            "ix_delivery_status_history_"
            "created_at"
        ),
        "delivery_status_history",
        ["created_at"],
        unique=False,
    )

    # ========================================================
    # DELIVERY CONFIRMATIONS
    # ========================================================

    op.create_table(
        "delivery_confirmations",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "delivery_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "confirmation_code",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=40),
            server_default=(
                "awaiting_confirmation"
            ),
            nullable=False,
        ),
        sa.Column(
            "confirmed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            (
                "status IN ("
                "'awaiting_confirmation', "
                "'confirmed'"
                ")"
            ),
            name=(
                "ck_delivery_"
                "confirmation_status"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["delivery_id"],
            ["deliveries.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "delivery_id"
        ),
    )

    op.create_index(
        (
            "ix_delivery_confirmations_"
            "delivery_id"
        ),
        "delivery_confirmations",
        ["delivery_id"],
        unique=False,
    )

    # ========================================================
    # NOTIFICATIONS
    # ========================================================

    op.create_table(
        "notifications",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "delivery_id",
            sa.String(length=36),
            nullable=True,
        ),
        sa.Column(
            "title",
            sa.String(length=180),
            nullable=False,
        ),
        sa.Column(
            "message",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "type",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "read",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
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
        sa.ForeignKeyConstraint(
            ["delivery_id"],
            ["deliveries.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_notifications_user_id",
        "notifications",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        "ix_notifications_delivery_id",
        "notifications",
        ["delivery_id"],
        unique=False,
    )

    op.create_index(
        "ix_notifications_read",
        "notifications",
        ["read"],
        unique=False,
    )

    op.create_index(
        "ix_notifications_created_at",
        "notifications",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_notifications_created_at",
        table_name="notifications",
    )

    op.drop_index(
        "ix_notifications_read",
        table_name="notifications",
    )

    op.drop_index(
        "ix_notifications_delivery_id",
        table_name="notifications",
    )

    op.drop_index(
        "ix_notifications_user_id",
        table_name="notifications",
    )

    op.drop_table(
        "notifications"
    )

    op.drop_index(
        (
            "ix_delivery_confirmations_"
            "delivery_id"
        ),
        table_name=(
            "delivery_confirmations"
        ),
    )

    op.drop_table(
        "delivery_confirmations"
    )

    op.drop_index(
        (
            "ix_delivery_status_history_"
            "created_at"
        ),
        table_name=(
            "delivery_status_history"
        ),
    )

    op.drop_index(
        (
            "ix_delivery_status_history_"
            "delivery_id"
        ),
        table_name=(
            "delivery_status_history"
        ),
    )

    op.drop_table(
        "delivery_status_history"
    )

    op.drop_index(
        "ix_delivery_assignments_active",
        table_name=(
            "delivery_assignments"
        ),
    )

    op.drop_index(
        "ix_delivery_assignments_rider_id",
        table_name=(
            "delivery_assignments"
        ),
    )

    op.drop_index(
        (
            "ix_delivery_assignments_"
            "delivery_id"
        ),
        table_name=(
            "delivery_assignments"
        ),
    )

    op.drop_table(
        "delivery_assignments"
    )

    op.drop_index(
        "ix_deliveries_created_at",
        table_name="deliveries",
    )

    op.drop_index(
        "ix_deliveries_priority",
        table_name="deliveries",
    )

    op.drop_index(
        "ix_deliveries_status",
        table_name="deliveries",
    )

    op.drop_index(
        "ix_deliveries_retailer_user_id",
        table_name="deliveries",
    )

    op.drop_table(
        "deliveries"
    )

    op.drop_index(
        "ix_riders_available",
        table_name="riders",
    )

    op.drop_index(
        "ix_riders_name",
        table_name="riders",
    )

    op.drop_table(
        "riders"
    )

    op.drop_index(
        "ix_users_role",
        table_name="users",
    )

    op.drop_index(
        "ix_users_email",
        table_name="users",
    )

    op.drop_table(
        "users"
    )
