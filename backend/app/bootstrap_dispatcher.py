import os

from dotenv import load_dotenv

from app.repository import get_repository


load_dotenv()


def bootstrap_dispatcher() -> None:
    email = os.getenv("DISPATCHER_BOOTSTRAP_EMAIL", "").strip().lower()
    password = os.getenv("DISPATCHER_BOOTSTRAP_PASSWORD", "")
    name = os.getenv("DISPATCHER_BOOTSTRAP_NAME", "").strip()

    if not email or not password or not name:
        raise RuntimeError(
            "Set DISPATCHER_BOOTSTRAP_EMAIL, "
            "DISPATCHER_BOOTSTRAP_PASSWORD, and "
            "DISPATCHER_BOOTSTRAP_NAME before running this command"
        )

    repository = get_repository()
    existing = repository.get_user_by_email(email)
    if existing:
        if existing["role"] != "dispatcher":
            raise RuntimeError(
                "The bootstrap email already belongs to a non-dispatcher account"
            )
        print("✓ Dispatcher account already exists")
        return

    repository.register_user(
        name=name,
        email=email,
        password=password,
        role="dispatcher",
        allow_dispatcher=True,
    )
    print("✓ Dispatcher account created")


if __name__ == "__main__":
    bootstrap_dispatcher()
