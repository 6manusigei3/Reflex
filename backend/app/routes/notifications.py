from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.dependencies import (
    get_current_user,
)
from app.repository import (
    InMemoryRepository,
    get_repository,
)
from app.schemas import (
    NotificationResponse,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# --------------------------------------------------
# Current user's notifications
# --------------------------------------------------


@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_notifications(
    unread_only: bool = False,
    current_user: dict = Depends(
        get_current_user
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Returns notifications belonging to the
    currently authenticated user.

    Optional:
        ?unread_only=true
    """

    notifications = (
        repository.list_notifications(
            current_user["id"]
        )
    )

    if unread_only:
        notifications = [
            notification
            for notification
            in notifications
            if not notification["read"]
        ]

    return [
        {
            "id": notification["id"],
            "title":
                notification["title"],
            "message":
                notification["message"],
            "time":
                notification["time"],
            "type":
                notification["type"],
            "read":
                notification["read"],
            "delivery_id":
                notification.get(
                    "delivery_id"
                ),
        }
        for notification
        in notifications
    ]


@router.patch(
    "/read-all",
)
def mark_all_notifications_read(
    current_user: dict = Depends(
        get_current_user
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    updated = (
        repository.mark_all_notifications_read(
            user_id=current_user["id"]
        )
    )

    return {
        "updated": updated,
    }


@router.patch(
    "/{notification_id}/read",
)
def mark_notification_read(
    notification_id: int,
    current_user: dict = Depends(
        get_current_user
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    updated = repository.mark_notification_read(
        user_id=current_user["id"],
        notification_id=notification_id,
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    return {
        "updated": True,
    }


# --------------------------------------------------
# Notification summary
# --------------------------------------------------


@router.get(
    "/summary",
)
def get_notification_summary(
    current_user: dict = Depends(
        get_current_user
    ),
    repository: InMemoryRepository = Depends(
        get_repository
    ),
):
    """
    Small endpoint suitable for the notification
    badge in the Reflex top bar.
    """

    notifications = (
        repository.list_notifications(
            current_user["id"]
        )
    )

    unread = sum(
        1
        for notification
        in notifications
        if not notification["read"]
    )

    return {
        "total":
            len(notifications),
        "unread":
            unread,
    }
