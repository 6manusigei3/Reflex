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

    @property
    def allowed_origins(self) -> list[str]:
        origins = [
            origin.strip()
            for origin in self.FRONTEND_URL.split(",")
            if origin.strip()
        ]

        return origins

settings = Settings()
