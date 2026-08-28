import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = os.getenv("APP_NAME", "Reflex API")
    APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000",
    )

    API_PREFIX = "/api"
    ADMIN_SETUP_TOKEN = os.getenv("ADMIN_SETUP_TOKEN", "")
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "").strip()
    SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD", "")
    EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "LightM Candle").strip()
    EMAIL_ENABLED = os.getenv("EMAIL_ENABLED", "true").strip().lower() in {
        "1", "true", "yes", "on"
    }
    GEOCODING_ENABLED = os.getenv("GEOCODING_ENABLED", "true").strip().lower() in {
        "1", "true", "yes", "on"
    }
    GEOCODING_BASE_URL = os.getenv(
        "GEOCODING_BASE_URL",
        "https://nominatim.openstreetmap.org",
    ).rstrip("/")
    GEOCODING_USER_AGENT = os.getenv(
        "GEOCODING_USER_AGENT",
        "Reflex-Delivery-Management/1.0",
    ).strip()
    GEOCODING_EMAIL = os.getenv("GEOCODING_EMAIL", "").strip()
    GEOCODING_TIMEOUT_SECONDS = float(os.getenv("GEOCODING_TIMEOUT_SECONDS", "5"))

    @property
    def allowed_origins(self) -> list[str]:
        origins = [
            origin.strip()
            for origin in self.FRONTEND_URL.split(",")
            if origin.strip()
        ]

        return origins

settings = Settings()
