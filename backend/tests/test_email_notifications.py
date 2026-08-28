import asyncio
from unittest.mock import MagicMock

import pytest
from fastapi import BackgroundTasks, HTTPException

from app.config import settings
from app.repository import InMemoryRepository
from app.routes.admin import approve_user
from app.routes.auth import register
from app.routes.deliveries import assign_rider, confirm_delivery, update_delivery_status
from app.schemas import (
    AssignRiderRequest,
    ConfirmationRequest,
    CreateDeliveryRequest,
    RegisterRequest,
    UpdateDeliveryStatusRequest,
)
from app.services import email_service as email_module


def run_background(tasks: BackgroundTasks) -> None:
    asyncio.run(tasks())


def configure_email(monkeypatch, *, failure: bool = False) -> tuple[MagicMock, MagicMock]:
    monkeypatch.setattr(settings, "EMAIL_ENABLED", True)
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setattr(settings, "SMTP_PORT", 587)
    monkeypatch.setattr(settings, "SMTP_USERNAME", "lightmcandle@example.com")
    monkeypatch.setattr(settings, "SMTP_APP_PASSWORD", "not-a-real-app-password")
    monkeypatch.setattr(settings, "EMAIL_FROM_NAME", "LightM Candle")
    smtp = MagicMock()
    smtp.__enter__.return_value = smtp
    if failure:
        smtp.starttls.side_effect = RuntimeError("SMTP unavailable")
    provider = MagicMock(return_value=smtp)
    monkeypatch.setattr(email_module.smtplib, "SMTP", provider)
    return provider, smtp


def register_pending(repository: InMemoryRepository, background: BackgroundTasks) -> dict:
    result = register(
        RegisterRequest(
            name="Amina Email",
            email="amina-email@example.com",
            password="StrongPass2026!",
            role="retailer",
            organization="Email Test Store",
        ),
        background,
        repository,
    )
    return repository.get_user_by_id(result["user"]["id"])


def create_and_assign_delivery(repository: InMemoryRepository, background: BackgroundTasks) -> tuple[dict, dict, dict]:
    retailer = repository.get_user_by_email("retailer@reflex.co.ke")
    dispatcher = repository.get_user_by_email("dispatcher@reflex.co.ke")
    rider = repository.get_user_by_email("rider@reflex.co.ke")
    assert retailer and dispatcher and rider
    payload = CreateDeliveryRequest.model_validate({
        "customerName": "Email Recipient",
        "customerPhone": "0712345678",
        "pickupLocation": "Westlands",
        "deliveryAddress": "Kilimani",
        "itemDescription": "Sealed parcel",
        "priority": "normal",
    })
    created = repository.create_delivery(
        retailer=retailer["organization"],
        retailer_user_id=retailer["id"],
        payload=payload.model_dump(),
    )
    assigned = assign_rider(
        created["id"],
        AssignRiderRequest(rider_id="RDR-001"),
        background,
        dispatcher,
        repository,
    )
    return assigned, retailer, rider


def test_all_transactional_email_triggers_and_single_use_confirmation(monkeypatch) -> None:
    provider, smtp = configure_email(monkeypatch)
    repository = InMemoryRepository()
    admin = repository.create_initial_admin(
        name="Email Admin", email="email-admin@example.com", password="AdminPass2026!"
    )

    created_tasks = BackgroundTasks()
    pending = register_pending(repository, created_tasks)
    assert pending["account_status"] == "pending"
    run_background(created_tasks)
    assert smtp.send_message.call_count == 1

    approval_tasks = BackgroundTasks()
    approved = approve_user(pending["id"], approval_tasks, admin, repository)
    assert approved["account_status"] == "active"
    run_background(approval_tasks)
    assert smtp.send_message.call_count == 2

    duplicate_approval_tasks = BackgroundTasks()
    approve_user(pending["id"], duplicate_approval_tasks, admin, repository)
    run_background(duplicate_approval_tasks)
    assert smtp.send_message.call_count == 2

    assignment_tasks = BackgroundTasks()
    delivery, retailer, rider = create_and_assign_delivery(repository, assignment_tasks)
    assert delivery["status"] == "assigned"
    run_background(assignment_tasks)
    assert smtp.send_message.call_count == 4

    for status_name in ("picked_up", "in_transit"):
        intermediate_tasks = BackgroundTasks()
        result = update_delivery_status(
            delivery["id"], UpdateDeliveryStatusRequest(status=status_name),
            intermediate_tasks, rider, repository,
        )
        assert result["status"] == status_name
        run_background(intermediate_tasks)
    assert smtp.send_message.call_count == 4

    delivered_tasks = BackgroundTasks()
    delivered = update_delivery_status(
        delivery["id"], UpdateDeliveryStatusRequest(status="delivered"),
        delivered_tasks, rider, repository,
    )
    assert delivered["status"] == "delivered"
    run_background(delivered_tasks)
    assert smtp.send_message.call_count == 5

    token = repository.issue_confirmation_token(delivery["id"])
    completion_tasks = BackgroundTasks()
    completed = confirm_delivery(
        delivery["id"], ConfirmationRequest(code=token), completion_tasks, repository
    )
    assert completed["status"] == "completed"
    run_background(completion_tasks)
    assert smtp.send_message.call_count == 6

    reused_tasks = BackgroundTasks()
    with pytest.raises(HTTPException) as reused:
        confirm_delivery(
            delivery["id"], ConfirmationRequest(code=token), reused_tasks, repository
        )
    assert reused.value.status_code == 403
    run_background(reused_tasks)
    assert smtp.send_message.call_count == 6

    messages = [call.args[0] for call in smtp.send_message.call_args_list]
    subjects = [message["Subject"] for message in messages]
    assert subjects == [
        "Welcome to Reflex — Account Awaiting Approval",
        "Your Reflex Account Has Been Approved",
        f"Rider Assigned — {delivery['id']}",
        f"New Reflex Delivery Assignment — {delivery['id']}",
        "Delivery Arrived — Awaiting Customer Confirmation",
        f"Delivery Completed Successfully — {delivery['id']}",
    ]
    keys = [message["X-Reflex-Idempotency-Key"] for message in messages]
    assert len(keys) == len(set(keys)) == 6
    assert all("token" not in key and "password" not in key for key in keys)
    recipients = [message["To"] for message in messages]
    assert recipients == [
        "amina-email@example.com",
        "amina-email@example.com",
        "retailer@reflex.co.ke",
        "rider@reflex.co.ke",
        "retailer@reflex.co.ke",
        "retailer@reflex.co.ke",
    ]
    assert all(message["From"] == "LightM Candle <lightmcandle@example.com>" for message in messages)
    provider.assert_called_with("smtp.gmail.com", 587, timeout=30)
    assert smtp.starttls.call_count == 6
    assert smtp.login.call_count == 6
    serialized_payloads = str(messages)
    assert "0712345678" not in serialized_payloads
    assert "StrongPass2026" not in serialized_payloads


def test_provider_failure_never_rolls_back_reflex_actions(monkeypatch) -> None:
    _, smtp = configure_email(monkeypatch, failure=True)
    repository = InMemoryRepository()
    admin = repository.create_initial_admin(
        name="Failure Admin", email="failure-admin@example.com", password="AdminPass2026!"
    )

    registration_tasks = BackgroundTasks()
    pending = register_pending(repository, registration_tasks)
    run_background(registration_tasks)
    assert pending["account_status"] == "pending"

    approval_tasks = BackgroundTasks()
    approved = approve_user(pending["id"], approval_tasks, admin, repository)
    run_background(approval_tasks)
    assert approved["account_status"] == "active"

    assignment_tasks = BackgroundTasks()
    delivery, _, rider = create_and_assign_delivery(repository, assignment_tasks)
    run_background(assignment_tasks)
    assert delivery["status"] == "assigned"

    for status_name in ("picked_up", "in_transit", "delivered"):
        tasks = BackgroundTasks()
        delivery = update_delivery_status(
            delivery["id"], UpdateDeliveryStatusRequest(status=status_name),
            tasks, rider, repository,
        )
        run_background(tasks)
    assert delivery["status"] == "delivered"

    token = repository.issue_confirmation_token(delivery["id"])
    completion_tasks = BackgroundTasks()
    completed = confirm_delivery(
        delivery["id"], ConfirmationRequest(code=token), completion_tasks, repository
    )
    run_background(completion_tasks)
    assert completed["status"] == "completed"
    assert smtp.send_message.call_count == 0
    assert smtp.starttls.call_count == 6


def test_disabled_email_is_skipped_without_provider_call(monkeypatch) -> None:
    provider, smtp = configure_email(monkeypatch)
    monkeypatch.setattr(settings, "EMAIL_ENABLED", False)
    result = asyncio.run(email_module.email_service.account_created({
        "id": "USR-DISABLED",
        "name": "Disabled Email",
        "email": "disabled@example.com",
        "role": "retailer",
    }))
    assert result is False
    provider.assert_not_called()
    smtp.send_message.assert_not_called()
