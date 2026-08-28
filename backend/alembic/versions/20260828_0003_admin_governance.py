"""Add Admin governance, account approvals, and platform audit events.

Revision ID: 20260828_0003
Revises: 20260827_0002
Create Date: 2026-08-28
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260828_0003"
down_revision: Union[str, None] = "20260827_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('admin', 'retailer', 'dispatcher', 'rider')",
    )
    op.add_column("users", sa.Column("phone", sa.String(length=30), nullable=True))
    op.add_column(
        "users",
        sa.Column(
            "account_status",
            sa.String(length=20),
            server_default="active",
            nullable=False,
        ),
    )
    op.add_column(
        "users",
        sa.Column("approved_by_user_id", sa.String(length=36), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_check_constraint(
        "ck_users_account_status",
        "users",
        "account_status IN ('pending', 'active', 'rejected', 'suspended')",
    )
    op.create_index("ix_users_account_status", "users", ["account_status"])
    op.create_foreign_key(
        "fk_users_approved_by_user_id_users",
        "users",
        "users",
        ["approved_by_user_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.alter_column("users", "account_status", server_default=None)

    op.create_table(
        "audit_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("actor_user_id", sa.String(length=36), nullable=True),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("entity_id", sa.String(length=100), nullable=False),
        sa.Column("metadata_json", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_events_actor_user_id", "audit_events", ["actor_user_id"])
    op.create_index("ix_audit_events_action", "audit_events", ["action"])
    op.create_index("ix_audit_events_entity_id", "audit_events", ["entity_id"])
    op.create_index("ix_audit_events_created_at", "audit_events", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_events")
    op.drop_constraint("fk_users_approved_by_user_id_users", "users", type_="foreignkey")
    op.drop_index("ix_users_account_status", table_name="users")
    op.drop_constraint("ck_users_account_status", "users", type_="check")
    op.drop_column("users", "approved_at")
    op.drop_column("users", "approved_by_user_id")
    op.drop_column("users", "account_status")
    op.drop_column("users", "phone")
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('retailer', 'dispatcher', 'rider')",
    )
