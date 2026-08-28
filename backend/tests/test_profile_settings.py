import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import ValidationError

from app.dependencies import get_current_user
from app.repository import InMemoryRepository
from app.routes.auth import get_me, login, update_me
from app.schemas import LoginRequest, ProfileUpdate
from app.security import create_access_token


@pytest.mark.parametrize(
    ("email", "payload", "expected_organization"),
    [
        (
            "retailer@reflex.co.ke",
            {
                "name": "Jane Kamau",
                "phone": "+254 712 345 678",
                "organization": "Kamau Home Stores",
            },
            "Kamau Home Stores",
        ),
        (
            "dispatcher@reflex.co.ke",
            {"name": "Alice Wanjala", "phone": "0712 222 333"},
            "Reflex Dispatch",
        ),
        (
            "rider@reflex.co.ke",
            {"name": "David Kiptoo", "phone": "0722 999 000"},
            "Reflex Riders",
        ),
    ],
)
def test_each_operational_role_updates_only_own_profile(
    email: str,
    payload: dict,
    expected_organization: str,
) -> None:
    repository = InMemoryRepository()
    user = repository.get_user_by_email(email)
    assert user is not None
    original_email = user["email"]
    original_role = user["role"]
    original_status = user["account_status"]

    updated = update_me(ProfileUpdate.model_validate(payload), user, repository)
    assert updated["name"] == payload["name"]
    assert updated["phone"] == payload["phone"]
    assert updated["organization"] == expected_organization

    refreshed_user = repository.get_user_by_id(user["id"])
    assert refreshed_user is not None
    refreshed = get_me(refreshed_user)
    assert refreshed["name"] == payload["name"]
    assert refreshed["phone"] == payload["phone"]
    assert refreshed["email"] == original_email
    assert refreshed["role"] == original_role
    assert refreshed["account_status"] == original_status
    logged_in = login(
        LoginRequest(email=original_email, password="Reflex@2026"),
        repository,
    )
    assert logged_in["user"]["name"] == payload["name"]
    assert logged_in["user"]["phone"] == payload["phone"]

    if original_role == "rider":
        rider = next(item for item in repository.riders if item["user_id"] == user["id"])
        assert rider["name"] == payload["name"]
        assert rider["phone"] == payload["phone"]

    audit = repository.audit_events[-1]
    assert audit["action"] == "profile.updated"
    assert set(audit["metadata"]["changed_fields"]) == set(payload)


def test_admin_updates_own_profile_and_forbidden_fields_are_rejected() -> None:
    repository = InMemoryRepository()
    admin = repository.create_initial_admin(
        name="Reflex Admin",
        email="admin@example.com",
        password="AdminPass2026!",
    )
    other_user = repository.get_user_by_email("retailer@reflex.co.ke")
    assert other_user is not None

    updated = update_me(
        ProfileUpdate(name="Grace Admin", phone="+254 700 123 456"),
        admin,
        repository,
    )
    assert updated["name"] == "Grace Admin"

    for forbidden in (
        {"email": "changed@example.com"},
        {"role": "admin"},
        {"accountStatus": "suspended"},
        {"userId": other_user["id"]},
    ):
        with pytest.raises(ValidationError):
            ProfileUpdate.model_validate(
                {"name": "Unsafe Change", "phone": None, **forbidden}
            )

    with pytest.raises(HTTPException) as business_name_change:
        update_me(
            ProfileUpdate(
                name="Grace Admin",
                phone="+254 700 123 456",
                organization="Unauthorized Business",
            ),
            repository.get_user_by_id(admin["id"]),
            repository,
        )
    assert business_name_change.value.status_code == 422

    unchanged_other = repository.get_user_by_id(other_user["id"])
    persisted_admin = repository.get_user_by_id(admin["id"])
    assert unchanged_other is not None and unchanged_other["name"] == other_user["name"]
    assert persisted_admin is not None
    assert persisted_admin["email"] == "admin@example.com"
    assert persisted_admin["role"] == "admin"
    assert persisted_admin["account_status"] == "active"


@pytest.mark.parametrize("account_status", ["pending", "suspended"])
def test_inactive_account_cannot_reach_profile_update(account_status: str) -> None:
    repository = InMemoryRepository()
    user = repository.get_user_by_email("dispatcher@reflex.co.ke")
    assert user is not None
    user["account_status"] = account_status
    user["is_active"] = False
    token = create_access_token(
        user_id=user["id"],
        role=user["role"],
        name=user["name"],
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    with pytest.raises(HTTPException) as blocked:
        get_current_user(credentials, repository)
    assert blocked.value.status_code == 403
    assert repository.get_user_by_id(user["id"])["name"] != "Blocked Update"
