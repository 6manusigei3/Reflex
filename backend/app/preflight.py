import os
import sys

from dotenv import load_dotenv
from sqlalchemy import inspect, text

from app.database import engine


load_dotenv()


REQUIRED_TABLES = {
    "users",
    "riders",
    "deliveries",
    "delivery_assignments",
    "delivery_status_history",
    "delivery_confirmations",
    "notifications",
    "audit_events",
    "alembic_version",
}


def check_environment() -> None:
    print("Checking environment...")

    database_url = os.getenv(
        "DATABASE_URL"
    )

    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is not configured"
        )

    jwt_secret = os.getenv(
        "JWT_SECRET"
    )

    if not jwt_secret:
        raise RuntimeError(
            "JWT_SECRET is not configured"
        )

    if not os.getenv("ADMIN_SETUP_TOKEN"):
        raise RuntimeError("ADMIN_SETUP_TOKEN is not configured")

    unsafe_secrets = {
        "change-this-secret-before-deployment",
        (
            "reflex-development-secret-"
            "change-before-deployment"
        ),
    }

    environment = os.getenv(
        "ENVIRONMENT",
        "development",
    ).lower()

    if (
        environment == "production"
        and jwt_secret in unsafe_secrets
    ):
        raise RuntimeError(
            "Production cannot use the "
            "default JWT secret"
        )

    print("✓ Environment configuration")


def check_database_connection() -> None:
    print(
        "Checking PostgreSQL connection..."
    )

    with engine.connect() as connection:
        connection.execute(
            text("SELECT 1")
        )

    print(
        "✓ PostgreSQL connection"
    )


def check_database_schema() -> None:
    print(
        "Checking Reflex database schema..."
    )

    inspector = inspect(engine)

    existing_tables = set(
        inspector.get_table_names()
    )

    missing_tables = (
        REQUIRED_TABLES
        - existing_tables
    )

    if missing_tables:
        missing = ", ".join(
            sorted(missing_tables)
        )

        raise RuntimeError(
            "Database migrations are "
            f"incomplete. Missing: {missing}"
        )

    print(
        "✓ Database schema"
    )


def run_preflight() -> None:
    print()
    print(
        "Reflex Backend Preflight"
    )
    print("=" * 42)

    check_environment()
    check_database_connection()
    check_database_schema()

    print("=" * 42)
    print(
        "✓ Reflex backend is ready"
    )
    print()


if __name__ == "__main__":
    try:
        run_preflight()

    except Exception as exc:
        print()
        print(
            "✗ Reflex preflight failed"
        )

        print(
            f"{type(exc).__name__}: {exc}"
        )

        print()

        sys.exit(1)
