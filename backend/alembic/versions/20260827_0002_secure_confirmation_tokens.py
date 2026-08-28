"""Store only hashed, single-use customer confirmation tokens.

Revision ID: 20260827_0002
Revises: 20260827_0001
Create Date: 2026-08-27
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260827_0002"
down_revision: Union[str, None] = "20260827_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "delivery_confirmations",
        sa.Column(
            "confirmation_token_hash",
            sa.String(length=64),
            nullable=True,
        ),
    )
    op.add_column(
        "delivery_confirmations",
        sa.Column(
            "confirmation_token_expires_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.drop_column(
        "delivery_confirmations",
        "confirmation_code",
    )


def downgrade() -> None:
    op.add_column(
        "delivery_confirmations",
        sa.Column(
            "confirmation_code",
            sa.String(length=255),
            server_default="disabled",
            nullable=False,
        ),
    )
    op.alter_column(
        "delivery_confirmations",
        "confirmation_code",
        server_default=None,
    )
    op.drop_column(
        "delivery_confirmations",
        "confirmation_token_expires_at",
    )
    op.drop_column(
        "delivery_confirmations",
        "confirmation_token_hash",
    )
