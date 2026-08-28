import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Session,
    sessionmaker,
)


load_dotenv()


def normalize_database_url(value: str) -> str:
    """Use SQLAlchemy's installed psycopg 3 driver for PostgreSQL URLs."""

    if value.startswith("postgres://"):
        return value.replace(
            "postgres://",
            "postgresql+psycopg://",
            1,
        )

    if value.startswith("postgresql://"):
        return value.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1,
        )

    return value


DATABASE_URL = normalize_database_url(
    os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://localhost/reflex",
    )
)


class Base(DeclarativeBase):
    pass


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
    class_=Session,
)


def get_db() -> Generator[Session, None, None]:
    database = SessionLocal()

    try:
        yield database
    finally:
        database.close()
