from sqlalchemy import func, select, text

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


def count_rows(
    db,
    model,
) -> int:
    return (
        db.scalar(
            select(
                func.count()
            ).select_from(model)
        )
        or 0
    )


def check_database() -> None:
    print()
    print("Reflex PostgreSQL Check")
    print("=" * 40)

    try:
        with SessionLocal() as db:
            db.execute(
                text("SELECT 1")
            )

            print(
                "✓ PostgreSQL connection successful"
            )

            print()
            print("Database records")
            print("-" * 40)

            tables = [
                (
                    "Users",
                    User,
                ),
                (
                    "Riders",
                    Rider,
                ),
                (
                    "Deliveries",
                    Delivery,
                ),
                (
                    "Assignments",
                    DeliveryAssignment,
                ),
                (
                    "Status history",
                    DeliveryStatusHistory,
                ),
                (
                    "Confirmations",
                    DeliveryConfirmation,
                ),
                (
                    "Notifications",
                    Notification,
                ),
                (
                    "Audit events",
                    AuditEvent,
                ),
            ]

            for label, model in tables:
                total = count_rows(
                    db,
                    model,
                )

                print(
                    f"✓ {label}: {total}"
                )

            print()
            print(
                "✓ Reflex database is ready."
            )

    except Exception as exc:
        print(
            "✗ Database check failed"
        )

        print()
        print(
            f"{type(exc).__name__}: {exc}"
        )

        raise


if __name__ == "__main__":
    check_database()
