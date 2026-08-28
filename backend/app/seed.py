from datetime import datetime
from zoneinfo import ZoneInfo

from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import select

from app.database import SessionLocal
from app.demo_data import (
    DEMO_DELIVERIES,
    DEMO_RIDERS,
    DEMO_USERS,
)
from app.models import (
    Delivery,
    DeliveryAssignment,
    DeliveryConfirmation,
    DeliveryStatusHistory,
    Notification,
    Rider,
    User,
)
from app.security import hash_password


NAIROBI = ZoneInfo(
    "Africa/Nairobi"
)

DEMO_PASSWORD = "Reflex@2026"


# Additional retailer accounts are needed because
# our frontend demo deliveries include multiple
# Kenyan businesses.
ADDITIONAL_RETAILERS = [
    {
        "id": "USR-004",
        "name": "City Office Staff",
        "email":
            "cityoffice@reflex.co.ke",
        "role": "retailer",
        "organization":
            "City Office Supplies",
    },
    {
        "id": "USR-005",
        "name": "AfyaPlus Staff",
        "email":
            "afyaplus@reflex.co.ke",
        "role": "retailer",
        "organization":
            "AfyaPlus Pharmacy",
    },
    {
        "id": "USR-006",
        "name": "BuildRight Staff",
        "email":
            "buildright@reflex.co.ke",
        "role": "retailer",
        "organization":
            "BuildRight Hardware",
    },
]


def parse_datetime(
    value: str | None,
) -> datetime | None:
    if not value:
        return None

    parsed = datetime.strptime(
        value,
        "%d %b %Y, %I:%M %p",
    )

    return parsed.replace(
        tzinfo=NAIROBI
    )


def seed_users(
    db,
) -> None:
    users = [
        *DEMO_USERS,
        *[
            {
                **user,
                "password_hash":
                    hash_password(
                        DEMO_PASSWORD
                    ),
            }
            for user
            in ADDITIONAL_RETAILERS
        ],
    ]

    for data in users:
        existing = db.get(
            User,
            data["id"],
        )

        if existing:
            continue

        email_exists = db.scalar(
            select(User).where(
                User.email
                == data["email"]
            )
        )

        if email_exists:
            continue

        db.add(
            User(
                id=data["id"],
                name=data["name"],
                email=data["email"],
                password_hash=data[
                    "password_hash"
                ],
                role=data["role"],
                organization=data.get(
                    "organization"
                ),
                account_status="active",
                is_active=True,
            )
        )

    db.flush()


def seed_riders(
    db,
) -> None:
    david_user = db.scalar(
        select(User).where(
            User.email
            == "rider@reflex.co.ke"
        )
    )

    for data in DEMO_RIDERS:
        existing = db.get(
            Rider,
            data["id"],
        )

        if existing:
            continue

        user_id = None

        if (
            data["name"]
            == "David Mwangi"
            and david_user
        ):
            user_id = david_user.id

        db.add(
            Rider(
                id=data["id"],
                user_id=user_id,
                name=data["name"],
                phone=data["phone"],
                available=data[
                    "available"
                ],
                active_deliveries=data[
                    "active_deliveries"
                ],
            )
        )

    db.flush()


def get_retailer_user(
    db,
    organization: str,
) -> User:
    retailer = db.scalar(
        select(User).where(
            User.role == "retailer",
            User.organization
            == organization,
        )
    )

    if not retailer:
        raise RuntimeError(
            "Missing retailer user for "
            f"{organization}"
        )

    return retailer


def get_dispatcher(
    db,
) -> User:
    dispatcher = db.scalar(
        select(User).where(
            User.role == "dispatcher"
        )
    )

    if not dispatcher:
        raise RuntimeError(
            "Dispatcher account "
            "was not found"
        )

    return dispatcher


def seed_deliveries(
    db,
) -> None:
    for data in DEMO_DELIVERIES:
        existing = db.get(
            Delivery,
            data["id"],
        )

        if existing:
            continue

        retailer = get_retailer_user(
            db,
            data["retailer"],
        )

        created_at = parse_datetime(
            data["created_at"]
        )

        updated_at = parse_datetime(
            data["updated_at"]
        )

        delivery = Delivery(
            id=data["id"],
            retailer_user_id=(
                retailer.id
            ),
            retailer_name=(
                data["retailer"]
            ),
            customer_name=(
                data["customer"]
            ),
            customer_phone=(
                data["customer_phone"]
            ),
            pickup_location=(
                data["pickup"]
            ),
            delivery_address=(
                data["destination"]
            ),
            item_description=(
                data["item"]
            ),
            delivery_notes=data.get(
                "delivery_notes"
            ),
            status=data["status"],
            priority=data["priority"],
            confirmation_status=data[
                "confirmation_status"
            ],
            created_at=created_at,
            updated_at=updated_at,
        )

        db.add(delivery)

    db.flush()


def seed_assignments(
    db,
) -> None:
    dispatcher = get_dispatcher(db)

    riders_by_name = {
        rider.name: rider
        for rider
        in db.scalars(
            select(Rider)
        ).all()
    }

    for data in DEMO_DELIVERIES:
        rider_name = data.get(
            "rider"
        )

        if not rider_name:
            continue

        rider = riders_by_name.get(
            rider_name
        )

        if not rider:
            continue

        assignment_exists = db.scalar(
            select(
                DeliveryAssignment
            ).where(
                DeliveryAssignment
                .delivery_id
                == data["id"],
                DeliveryAssignment
                .rider_id
                == rider.id,
            )
        )

        if assignment_exists:
            continue

        assignment_is_active = (
            data["status"]
            not in (
                "completed",
                "cancelled",
                "failed",
            )
        )

        assigned_at = (
            parse_datetime(
                data.get(
                    "assigned_at"
                )
            )
            or parse_datetime(
                data["created_at"]
            )
        )

        unassigned_at = None

        if not assignment_is_active:
            unassigned_at = (
                parse_datetime(
                    data["updated_at"]
                )
            )

        db.add(
            DeliveryAssignment(
                delivery_id=data["id"],
                rider_id=rider.id,
                assigned_by_user_id=(
                    dispatcher.id
                ),
                active=(
                    assignment_is_active
                ),
                assigned_at=assigned_at,
                unassigned_at=(
                    unassigned_at
                ),
            )
        )

    db.flush()


def seed_status_history(
    db,
) -> None:
    dispatcher = get_dispatcher(db)

    riders_by_name = {
        rider.name: rider
        for rider
        in db.scalars(
            select(Rider)
        ).all()
    }

    for data in DEMO_DELIVERIES:
        existing = db.scalar(
            select(
                DeliveryStatusHistory
            ).where(
                DeliveryStatusHistory
                .delivery_id
                == data["id"]
            )
        )

        if existing:
            continue

        retailer = get_retailer_user(
            db,
            data["retailer"],
        )

        created_at = parse_datetime(
            data["created_at"]
        )

        db.add(
            DeliveryStatusHistory(
                delivery_id=data["id"],
                status="pending",
                changed_by_user_id=(
                    retailer.id
                ),
                note=(
                    "Delivery request "
                    "created"
                ),
                created_at=created_at,
            )
        )

        current_status = (
            data["status"]
        )

        assigned_at = (
            parse_datetime(
                data.get(
                    "assigned_at"
                )
            )
        )

        if (
            current_status
            != "pending"
            and assigned_at
        ):
            db.add(
                DeliveryStatusHistory(
                    delivery_id=(
                        data["id"]
                    ),
                    status="assigned",
                    changed_by_user_id=(
                        dispatcher.id
                    ),
                    note=(
                        "Rider assigned"
                    ),
                    created_at=(
                        assigned_at
                    ),
                )
            )

        if current_status not in (
            "pending",
            "assigned",
        ):
            rider = riders_by_name.get(
                data.get("rider")
            )

            changed_by = (
                rider.user_id
                if rider
                else None
            )

            db.add(
                DeliveryStatusHistory(
                    delivery_id=(
                        data["id"]
                    ),
                    status=(
                        current_status
                    ),
                    changed_by_user_id=(
                        changed_by
                    ),
                    note=(
                        "Current demo "
                        "delivery status"
                    ),
                    created_at=(
                        parse_datetime(
                            data[
                                "updated_at"
                            ]
                        )
                    ),
                )
            )

    db.flush()


def seed_confirmations(
    db,
) -> None:
    for data in DEMO_DELIVERIES:
        if data[
            "confirmation_status"
        ] == "not_ready":
            continue

        existing = db.scalar(
            select(
                DeliveryConfirmation
            ).where(
                DeliveryConfirmation
                .delivery_id
                == data["id"]
            )
        )

        if existing:
            continue

        confirmed = (
            data[
                "confirmation_status"
            ]
            == "confirmed"
        )

        db.add(
            DeliveryConfirmation(
                delivery_id=data["id"],
                confirmation_token_hash=None,
                confirmation_token_expires_at=None,
                status=(
                    "confirmed"
                    if confirmed
                    else (
                        "awaiting_"
                        "confirmation"
                    )
                ),
                confirmed_at=(
                    parse_datetime(
                        data["updated_at"]
                    )
                    if confirmed
                    else None
                ),
                created_at=(
                    parse_datetime(
                        data["updated_at"]
                    )
                ),
            )
        )

    db.flush()


def seed_notifications(
    db,
) -> None:
    rider_user = db.scalar(
        select(User).where(
            User.email
            == "rider@reflex.co.ke"
        )
    )

    if not rider_user:
        return

    notifications = [
        {
            "title":
                "New delivery assigned",
            "message": (
                "Delivery RFX-1013 has "
                "been assigned to you. "
                "Pickup is at CBD, "
                "Nairobi."
            ),
            "type": "assignment",
            "read": False,
            "delivery_id":
                "RFX-1013",
            "created_at": datetime(
                2026,
                8,
                27,
                18,
                30,
                tzinfo=NAIROBI,
            ),
        },
        {
            "title":
                "Delivery confirmed",
            "message": (
                "The customer confirmed "
                "receipt of delivery "
                "RFX-1003."
            ),
            "type": "confirmation",
            "read": True,
            "delivery_id":
                "RFX-1003",
            "created_at": datetime(
                2026,
                8,
                26,
                13,
                22,
                tzinfo=NAIROBI,
            ),
        },
        {
            "title":
                "Status successfully updated",
            "message": (
                "RFX-1008 was updated "
                "to In Transit."
            ),
            "type": "status",
            "read": True,
            "delivery_id":
                "RFX-1008",
            "created_at": datetime(
                2026,
                8,
                27,
                16,
                18,
                tzinfo=NAIROBI,
            ),
        },
        {
            "title":
                "Reflex rider account",
            "message": (
                "Your rider profile is "
                "active and available "
                "for delivery assignments."
            ),
            "type": "system",
            "read": True,
            "delivery_id": None,
            "created_at": datetime(
                2026,
                8,
                25,
                8,
                0,
                tzinfo=NAIROBI,
            ),
        },
    ]

    for data in notifications:
        existing = db.scalar(
            select(Notification).where(
                Notification.user_id
                == rider_user.id,
                Notification.title
                == data["title"],
                Notification.delivery_id
                == data[
                    "delivery_id"
                ],
            )
        )

        if existing:
            continue

        db.add(
            Notification(
                user_id=rider_user.id,
                delivery_id=data[
                    "delivery_id"
                ],
                title=data["title"],
                message=data["message"],
                type=data["type"],
                read=data["read"],
                created_at=data[
                    "created_at"
                ],
            )
        )

    db.flush()


def seed_database() -> None:
    print(
        "Seeding Reflex database..."
    )

    with SessionLocal.begin() as db:
        seed_users(db)

        print(
            "✓ Users"
        )

        seed_riders(db)

        print(
            "✓ Riders"
        )

        seed_deliveries(db)

        print(
            "✓ Deliveries"
        )

        seed_assignments(db)

        print(
            "✓ Assignments"
        )

        seed_status_history(db)

        print(
            "✓ Status history"
        )

        seed_confirmations(db)

        print(
            "✓ Confirmations"
        )

        seed_notifications(db)

        print(
            "✓ Notifications"
        )

    print(
        "✓ Reflex database seed complete."
    )


if __name__ == "__main__":
    seed_database()
