import pytest
from fastapi import BackgroundTasks, HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.dependencies import get_current_user
from app.repository import InMemoryRepository
from app.routes.auth import login, register
from app.routes.realtime import serialize_delivery_snapshot
from app.schemas import (
    CreateDeliveryRequest,
    DeliveryResponse,
    LoginRequest,
    RegisterRequest,
)
from app.security import create_access_token, verify_password


def test_complete_delivery_workflow_and_frontend_contract() -> None:
    repository = InMemoryRepository()
    retailer = repository.get_user_by_email("retailer@reflex.co.ke")
    assert retailer is not None
    assert verify_password("Reflex@2026", retailer["password_hash"])

    payload = CreateDeliveryRequest.model_validate(
        {
            "customerName": "Jane Wanjiru",
            "customerPhone": "0712345678",
            "pickupLocation": "Westlands, Nairobi",
            "deliveryAddress": "Kilimani, Nairobi",
            "itemDescription": "Sealed electronics package",
            "deliveryNotes": "Call on arrival",
            "priority": "high",
        }
    )
    created = repository.create_delivery(
        retailer=retailer["organization"],
        payload=payload.model_dump(),
    )
    delivery_id = created["id"]
    assert created["status"] == "pending"

    assigned = repository.assign_rider(
        delivery_id=delivery_id,
        rider_id="RDR-001",
    )
    assert assigned["status"] == "assigned"
    assert assigned["rider"] == "David Mwangi"

    for next_status in ("picked_up", "in_transit", "delivered"):
        updated = repository.update_delivery_status(
            delivery_id=delivery_id,
            new_status=next_status,
        )
        assert updated["status"] == next_status

    code = repository.issue_confirmation_token(delivery_id)
    assert repository.validate_confirmation_token(delivery_id, code)
    assert not repository.validate_confirmation_token(
        delivery_id,
        "not-the-issued-token",
    )
    completed = repository.confirm_delivery(delivery_id, code)
    assert completed["status"] == "completed"
    assert completed["confirmation_status"] == "confirmed"
    assert not repository.validate_confirmation_token(delivery_id, code)

    frontend = DeliveryResponse.model_validate(completed).model_dump(by_alias=True)
    assert frontend["customerPhone"] == "0712345678"
    assert frontend["riderPhone"] == "0722 118 420"
    assert frontend["confirmationStatus"] == "confirmed"
    assert "customer_phone" not in frontend

    realtime = serialize_delivery_snapshot([completed])[0]
    assert realtime["createdAt"] == completed["created_at"]
    assert realtime["confirmationStatus"] == "confirmed"
    assert "created_at" not in realtime


def test_notification_read_state_is_persisted_by_repository() -> None:
    repository = InMemoryRepository()
    rider = repository.get_user_by_email("rider@reflex.co.ke")
    assert rider is not None

    notifications = repository.list_notifications(rider["id"])
    unread = [item for item in notifications if not item["read"]]
    assert unread

    first = unread[0]
    assert repository.mark_notification_read(
        user_id=rider["id"],
        notification_id=first["id"],
    )

    remaining = repository.mark_all_notifications_read(
        user_id=rider["id"]
    )
    assert remaining >= 0
    assert all(
        item["read"]
        for item in repository.list_notifications(rider["id"])
    )


def test_inactive_accounts_cannot_login_or_reuse_existing_tokens() -> None:
    repository = InMemoryRepository()
    retailer = repository.get_user_by_email("retailer@reflex.co.ke")
    assert retailer is not None
    retailer["is_active"] = False

    with pytest.raises(HTTPException) as login_error:
        login(
            LoginRequest(
                email=retailer["email"],
                password="Reflex@2026",
            ),
            repository,
        )
    assert login_error.value.status_code == 403

    token = create_access_token(
        user_id=retailer["id"],
        role=retailer["role"],
        name=retailer["name"],
    )
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )

    with pytest.raises(HTTPException) as token_error:
        get_current_user(credentials, repository)
    assert token_error.value.status_code == 403


def test_registration_requires_admin_approval_and_creates_rider_profile() -> None:
    repository = InMemoryRepository()
    admin = repository.create_initial_admin(
        name="Reflex Admin",
        email="admin@example.com",
        password="AdminPass2026",
    )

    retailer_result = register(
        RegisterRequest(
            name="Amina Hassan",
            email="AMINA@EXAMPLE.COM",
            password="StrongPass2026",
            role="retailer",
            organization="Amina Home Stores",
        ),
        BackgroundTasks(),
        repository,
    )
    assert retailer_result["user"]["role"] == "retailer"
    retailer = repository.get_user_by_email("amina@example.com")
    assert retailer is not None
    assert retailer["organization"] == "Amina Home Stores"
    assert verify_password("StrongPass2026", retailer["password_hash"])
    assert retailer["password_hash"] != "StrongPass2026"
    assert retailer["account_status"] == "pending"

    with pytest.raises(HTTPException) as pending_login:
        login(LoginRequest(email="amina@example.com", password="StrongPass2026"), repository)
    assert pending_login.value.status_code == 403

    repository.set_user_account_status(
        user_id=retailer["id"], account_status="active", actor_user_id=admin["id"]
    )
    assert login(LoginRequest(email="amina@example.com", password="StrongPass2026"), repository)["user"]["role"] == "retailer"

    rider_result = register(
        RegisterRequest(
            name="Peter Otieno",
            email="peter@example.com",
            password="RiderPass2026",
            role="rider",
            phone="0712 000 111",
        ),
        BackgroundTasks(),
        repository,
    )
    rider_user = repository.get_user_by_email("peter@example.com")
    assert rider_result["user"]["role"] == "rider"
    assert rider_user is not None
    assert not any(
        rider for rider in repository.riders if rider.get("user_id") == rider_user["id"]
    )
    repository.set_user_account_status(
        user_id=rider_user["id"], account_status="active", actor_user_id=admin["id"]
    )
    rider_profile = next(
        rider for rider in repository.riders if rider.get("user_id") == rider_user["id"]
    )
    assert rider_profile["name"] == "Peter Otieno"
    assert rider_profile["phone"] == "0712 000 111"
    assert rider_profile["active_deliveries"] == 0

    with pytest.raises(HTTPException) as duplicate_error:
        register(
            RegisterRequest(
                name="Duplicate Account",
                email="amina@example.com",
                password="AnotherPass2026",
                role="retailer",
                organization="Another Store",
            ),
            BackgroundTasks(),
            repository,
        )
    assert duplicate_error.value.status_code == 409

    dispatcher = repository.register_user(
        name="Dispatcher Applicant",
        email="dispatcher-applicant@example.com",
        password="DispatcherPass2026",
        role="dispatcher",
    )
    assert dispatcher["account_status"] == "pending"

    with pytest.raises(ValueError):
        repository.register_user(
            name="Unauthorized Admin",
            email="unsafe-admin@example.com",
            password="UnsafePass2026",
            role="admin",
        )
