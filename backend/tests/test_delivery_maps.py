from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.config import settings
from app.repository import InMemoryRepository
from app.routes.deliveries import create_delivery, get_delivery
from app.schemas import CreateDeliveryRequest
from app.services.geocoding_service import GeocodingService, geocoding_service


def delivery_payload() -> CreateDeliveryRequest:
    return CreateDeliveryRequest.model_validate(
        {
            "customerName": "Map Recipient",
            "customerPhone": "0712345678",
            "pickupLocation": "Westlands, Nairobi",
            "deliveryAddress": "Kilimani, Nairobi",
            "itemDescription": "Mapped package",
            "priority": "normal",
        }
    )


def test_delivery_creation_stores_successful_geocoding(monkeypatch) -> None:
    repository = InMemoryRepository()
    retailer = repository.get_user_by_email("retailer@reflex.co.ke")
    assert retailer is not None
    coordinates = {
        "pickup_latitude": -1.2676,
        "pickup_longitude": 36.8108,
        "destination_latitude": -1.2921,
        "destination_longitude": 36.7839,
    }
    monkeypatch.setattr(geocoding_service, "geocode_route", MagicMock(return_value=coordinates))

    created = create_delivery(delivery_payload(), retailer, repository)
    persisted = repository.get_delivery(created["id"])
    assert persisted is not None
    assert {key: persisted[key] for key in coordinates} == coordinates


def test_failed_geocoding_does_not_block_delivery_creation(monkeypatch) -> None:
    repository = InMemoryRepository()
    retailer = repository.get_user_by_email("retailer@reflex.co.ke")
    assert retailer is not None
    unavailable = {
        "pickup_latitude": None,
        "pickup_longitude": None,
        "destination_latitude": None,
        "destination_longitude": None,
    }
    monkeypatch.setattr(geocoding_service, "geocode_route", MagicMock(return_value=unavailable))

    created = create_delivery(delivery_payload(), retailer, repository)
    assert created["status"] == "pending"
    assert all(created[field] is None for field in unavailable)


def test_map_coordinates_follow_existing_delivery_authorization(monkeypatch) -> None:
    repository = InMemoryRepository()
    owner = repository.get_user_by_email("retailer@reflex.co.ke")
    dispatcher = repository.get_user_by_email("dispatcher@reflex.co.ke")
    assert owner is not None and dispatcher is not None
    monkeypatch.setattr(
        geocoding_service,
        "geocode_route",
        MagicMock(
            return_value={
                "pickup_latitude": -1.2676,
                "pickup_longitude": 36.8108,
                "destination_latitude": -1.2921,
                "destination_longitude": 36.7839,
            }
        ),
    )
    created = create_delivery(delivery_payload(), owner, repository)
    other_retailer = repository.register_user(
        name="Other Retailer",
        email="other-retailer@example.com",
        password="StrongPass2026!",
        role="retailer",
        organization="Other Store",
        allow_dispatcher=True,
    )

    assert get_delivery(created["id"], dispatcher, repository)["pickup_latitude"] == -1.2676
    with pytest.raises(HTTPException) as denied:
        get_delivery(created["id"], other_retailer, repository)
    assert denied.value.status_code == 403


def test_nominatim_response_is_validated_and_identified(monkeypatch) -> None:
    service = GeocodingService()
    response = MagicMock()
    response.json.return_value = [{"lat": "-1.286389", "lon": "36.817223"}]
    request = MagicMock(return_value=response)
    monkeypatch.setattr("app.services.geocoding_service.httpx.get", request)
    monkeypatch.setattr(settings, "GEOCODING_ENABLED", True)
    monkeypatch.setattr(settings, "GEOCODING_USER_AGENT", "Reflex-Test/1.0")

    assert service.geocode("Nairobi, Kenya") == (-1.286389, 36.817223)
    request.assert_called_once()
    assert request.call_args.kwargs["headers"] == {"User-Agent": "Reflex-Test/1.0"}
