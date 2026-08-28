"""Add optional pickup and destination coordinates.

Revision ID: 20260828_0004
Revises: 20260828_0003
Create Date: 2026-08-28
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260828_0004"
down_revision: Union[str, None] = "20260828_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("deliveries", sa.Column("pickup_latitude", sa.Float(), nullable=True))
    op.add_column("deliveries", sa.Column("pickup_longitude", sa.Float(), nullable=True))
    op.add_column("deliveries", sa.Column("destination_latitude", sa.Float(), nullable=True))
    op.add_column("deliveries", sa.Column("destination_longitude", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("deliveries", "destination_longitude")
    op.drop_column("deliveries", "destination_latitude")
    op.drop_column("deliveries", "pickup_longitude")
    op.drop_column("deliveries", "pickup_latitude")
