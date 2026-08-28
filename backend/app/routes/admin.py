from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status

from app.dependencies import require_roles
from app.repository import InMemoryRepository, get_repository
from app.schemas import AdminStatsResponse, AdminUserResponse, AuditEventResponse
from app.services.email_service import email_service


router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    current_user: dict = Depends(require_roles("admin")),
    repository: InMemoryRepository = Depends(get_repository),
):
    del current_user
    return repository.admin_stats()


@router.get("/users", response_model=list[AdminUserResponse])
def list_users(
    account_status: str | None = Query(default=None, alias="status"),
    role: str | None = Query(default=None),
    current_user: dict = Depends(require_roles("admin")),
    repository: InMemoryRepository = Depends(get_repository),
):
    del current_user
    if account_status and account_status not in {"pending", "active", "rejected", "suspended"}:
        raise HTTPException(status_code=422, detail="Invalid account status")
    if role and role not in {"admin", "retailer", "dispatcher", "rider"}:
        raise HTTPException(status_code=422, detail="Invalid user role")
    return repository.list_users(account_status=account_status, role=role)


@router.get("/approvals", response_model=list[AdminUserResponse])
def list_pending_approvals(
    current_user: dict = Depends(require_roles("admin")),
    repository: InMemoryRepository = Depends(get_repository),
):
    del current_user
    return repository.list_users(account_status="pending")


def update_status(user_id: str, new_status: str, current_user: dict, repository) -> dict:
    try:
        return repository.set_user_account_status(
            user_id=user_id,
            account_status=new_status,
            actor_user_id=current_user["id"],
        )
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc.args[0])) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.patch("/users/{user_id}/approve", response_model=AdminUserResponse)
def approve_user(user_id: str, background_tasks: BackgroundTasks, current_user: dict = Depends(require_roles("admin")), repository: InMemoryRepository = Depends(get_repository)):
    before = repository.get_user_by_id(user_id)
    before_status = before.get("account_status") if before else None
    updated = update_status(user_id, "active", current_user, repository)
    if before_status == "pending":
        background_tasks.add_task(email_service.account_approved, updated)
    return updated


@router.patch("/users/{user_id}/reject", response_model=AdminUserResponse)
def reject_user(user_id: str, current_user: dict = Depends(require_roles("admin")), repository: InMemoryRepository = Depends(get_repository)):
    return update_status(user_id, "rejected", current_user, repository)


@router.patch("/users/{user_id}/suspend", response_model=AdminUserResponse)
def suspend_user(user_id: str, current_user: dict = Depends(require_roles("admin")), repository: InMemoryRepository = Depends(get_repository)):
    return update_status(user_id, "suspended", current_user, repository)


@router.patch("/users/{user_id}/activate", response_model=AdminUserResponse)
def activate_user(user_id: str, current_user: dict = Depends(require_roles("admin")), repository: InMemoryRepository = Depends(get_repository)):
    return update_status(user_id, "active", current_user, repository)


@router.get("/audit", response_model=list[AuditEventResponse])
def list_audit_events(
    limit: int = Query(default=100, ge=1, le=250),
    current_user: dict = Depends(require_roles("admin")),
    repository: InMemoryRepository = Depends(get_repository),
):
    del current_user
    return repository.list_audit_events(limit=limit)
