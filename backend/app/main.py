from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.health import router as health_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Backend API for the Reflex delivery "
        "management platform."
    ),
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    health_router,
    prefix=settings.API_PREFIX,
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Reflex API",
        "docs": "/docs",
        "health": "/api/health",
    }
