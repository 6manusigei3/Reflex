import logging
import math
from threading import Lock
import time

import httpx

from app.config import settings


logger = logging.getLogger(__name__)


class GeocodingService:
    """Rate-limited, fail-open address lookup through Nominatim."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._last_request_at = 0.0
        self._cache: dict[str, tuple[float, float]] = {}

    def geocode_route(
        self,
        *,
        pickup_address: str,
        destination_address: str,
    ) -> dict[str, float | None]:
        pickup = self.geocode(pickup_address)
        destination = self.geocode(destination_address)
        return {
            "pickup_latitude": pickup[0] if pickup else None,
            "pickup_longitude": pickup[1] if pickup else None,
            "destination_latitude": destination[0] if destination else None,
            "destination_longitude": destination[1] if destination else None,
        }

    def geocode(self, address: str) -> tuple[float, float] | None:
        if not settings.GEOCODING_ENABLED:
            return None
        cache_key = " ".join(address.lower().split())
        if not cache_key:
            return None

        with self._lock:
            cached = self._cache.get(cache_key)
            if cached:
                return cached

            wait_seconds = 1.0 - (time.monotonic() - self._last_request_at)
            if wait_seconds > 0:
                time.sleep(wait_seconds)

            params = {"q": address, "format": "jsonv2", "limit": 1}
            if settings.GEOCODING_EMAIL:
                params["email"] = settings.GEOCODING_EMAIL

            try:
                response = httpx.get(
                    f"{settings.GEOCODING_BASE_URL}/search",
                    params=params,
                    headers={"User-Agent": settings.GEOCODING_USER_AGENT},
                    timeout=settings.GEOCODING_TIMEOUT_SECONDS,
                )
                response.raise_for_status()
                results = response.json()
                if not results:
                    return None
                latitude = float(results[0]["lat"])
                longitude = float(results[0]["lon"])
                if not (
                    math.isfinite(latitude)
                    and math.isfinite(longitude)
                    and -90 <= latitude <= 90
                    and -180 <= longitude <= 180
                ):
                    return None
                point = (latitude, longitude)
                self._cache[cache_key] = point
                return point
            except Exception:
                logger.warning(
                    "Delivery geocoding failed; creation will continue without map coordinates"
                )
                return None
            finally:
                self._last_request_at = time.monotonic()


geocoding_service = GeocodingService()
