from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router
from app.routes.deliveries import router as deliveries_router
from app.routes.health import router as health_router
from app.routes.notifications import router as notifications_router
from app.routes.riders import router as riders_router
from app.routes.realtime import router as realtime_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Reflex is a delivery management platform "
        "connecting retailers, dispatchers and riders."
    ),
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API Routes
# --------------------------------------------------

app.include_router(
    health_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    auth_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    admin_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    deliveries_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    riders_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    notifications_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    realtime_router,
    prefix=settings.API_PREFIX,
)

# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get(
    "/",
    tags=["System"],
)
async def root():
    return {
        "service": "Reflex API",
        "status": "running",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get(
    "/api",
    tags=["System"],
)
async def api_information():
    return {
        "name": "Reflex API",
        "version": settings.APP_VERSION,
        "resources": {
            "authentication": "/api/auth",
            "administration": "/api/admin",
            "deliveries": "/api/deliveries",
            "riders": "/api/riders",
            "notifications": "/api/notifications",
        },
    }
