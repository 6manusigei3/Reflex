import asyncio
import json
from hashlib import sha256

import jwt
from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)

from app.repository import get_repository
from app.security import decode_access_token


router = APIRouter(
    tags=["Real Time"],
)


POLL_INTERVAL_SECONDS = 2


def filter_deliveries_for_user(
    deliveries: list[dict],
    user: dict,
) -> list[dict]:
    """
    Apply the same role visibility rules used by
    the normal delivery API.

    Dispatcher:
        See every delivery.

    Retailer:
        See deliveries belonging to their
        organization.

    Rider:
        See only deliveries assigned to them.
    """

    role = user["role"]

    if role == "dispatcher":
        return deliveries

    if role == "retailer":
        organization = user.get(
            "organization"
        )

        return [
            delivery
            for delivery in deliveries
            if delivery["retailer"]
            == organization
        ]

    if role == "rider":
        return [
            delivery
            for delivery in deliveries
            if delivery.get("rider")
            == user["name"]
        ]

    return []


def snapshot_hash(
    deliveries: list[dict],
) -> str:
    """
    Generate a fingerprint of the current delivery
    state.

    A WebSocket update is sent only when the data
    actually changes.
    """

    payload = json.dumps(
        deliveries,
        sort_keys=True,
        default=str,
    ).encode("utf-8")

    return sha256(
        payload
    ).hexdigest()


async def authenticate_websocket(
    websocket: WebSocket,
) -> dict | None:
    """
    The client must send its JWT immediately after
    opening the WebSocket.

    Expected first message:

    {
        "type": "authenticate",
        "token": "JWT..."
    }
    """

    try:
        message = await asyncio.wait_for(
            websocket.receive_json(),
            timeout=10,
        )

    except (
        asyncio.TimeoutError,
        ValueError,
        WebSocketDisconnect,
    ):
        await websocket.close(
            code=1008,
            reason="Authentication required",
        )

        return None

    if (
        message.get("type")
        != "authenticate"
    ):
        await websocket.close(
            code=1008,
            reason=(
                "First message must "
                "authenticate"
            ),
        )

        return None

    token = message.get("token")

    if not token:
        await websocket.close(
            code=1008,
            reason="Missing access token",
        )

        return None

    try:
        payload = decode_access_token(
            token
        )

    except jwt.PyJWTError:
        await websocket.close(
            code=1008,
            reason=(
                "Invalid or expired token"
            ),
        )

        return None

    user_id = payload.get("sub")

    if not user_id:
        await websocket.close(
            code=1008,
            reason="Invalid token",
        )

        return None

    repository = get_repository()

    user = repository.get_user_by_id(
        user_id
    )

    if not user:
        await websocket.close(
            code=1008,
            reason=(
                "User account not found"
            ),
        )

        return None

    if not user.get(
        "is_active",
        True,
    ):
        await websocket.close(
            code=1008,
            reason=(
                "User account is inactive"
            ),
        )

        return user

    return user


@router.websocket(
    "/ws/deliveries"
)
async def delivery_updates(
    websocket: WebSocket,
):
    """
    Real-time Reflex delivery channel.

    Connection:
        /api/ws/deliveries

    After connecting, the client authenticates
    using its JWT.

    Reflex then pushes a fresh delivery snapshot
    whenever PostgreSQL data changes.
    """

    await websocket.accept()

    user = (
        await authenticate_websocket(
            websocket
        )
    )

    if not user:
        return

    await websocket.send_json(
        {
            "type": "connected",
            "message": (
                "Connected to Reflex "
                "real-time delivery updates"
            ),
            "role": user["role"],
            "user": user["name"],
        }
    )

    repository = get_repository()

    previous_hash: str | None = None

    try:
        while True:
            deliveries = (
                repository
                .list_deliveries()
            )

            visible_deliveries = (
                filter_deliveries_for_user(
                    deliveries,
                    user,
                )
            )

            current_hash = snapshot_hash(
                visible_deliveries
            )

            if (
                current_hash
                != previous_hash
            ):
                await websocket.send_json(
                    {
                        "type":
                            "delivery_snapshot",

                        "count":
                            len(
                                visible_deliveries
                            ),

                        "deliveries":
                            visible_deliveries,
                    }
                )

                previous_hash = (
                    current_hash
                )

            await asyncio.sleep(
                POLL_INTERVAL_SECONDS
            )

    except WebSocketDisconnect:
        return

    except Exception as exc:
        try:
            await websocket.send_json(
                {
                    "type": "error",
                    "message": (
                        "Real-time delivery "
                        "connection encountered "
                        "an error."
                    ),
                }
            )

            await websocket.close(
                code=1011
            )

        except Exception:
            pass

        print(
            "Reflex WebSocket error:",
            repr(exc),
        )
