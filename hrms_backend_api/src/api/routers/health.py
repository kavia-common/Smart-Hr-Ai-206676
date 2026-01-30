from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.core.db import get_db

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Basic service health check",
    description="Indicates that the API process is up. Does not validate database connectivity.",
    operation_id="health_basic",
)
# PUBLIC_INTERFACE
def health() -> dict[str, str]:
    """Basic liveness check.

    Returns:
        dict: `{"status": "ok"}` when the server process is responsive.
    """
    return {"status": "ok"}


@router.get(
    "/health/db",
    summary="Database connectivity check",
    description="Validates database connectivity by executing a lightweight SELECT 1.",
    operation_id="health_database",
)
# PUBLIC_INTERFACE
def health_db(db: Session = Depends(get_db)) -> dict[str, object]:
    """Database liveness check.

    Args:
        db: SQLAlchemy session injected by FastAPI dependency.

    Returns:
        dict: Connectivity status and minimal DB info.
    """
    db.execute(text("SELECT 1")).fetchone()
    return {"ok": True}


@router.get(
    "/ready",
    summary="Readiness check (DB + essential tables)",
    description=(
        "Readiness probe intended for deployments. Returns ready=false if the DB is unreachable "
        "or if essential tables are missing (schema not applied)."
    ),
    operation_id="health_readiness",
)
# PUBLIC_INTERFACE
def readiness(db: Session = Depends(get_db)) -> dict[str, object]:
    """Readiness probe.

    Checks:
      - DB connectivity
      - Presence of core tables: organizations, users, roles, user_roles

    Returns:
        dict: `{ready: bool, missing_tables: list[str]}`
    """
    required_tables = ["organizations", "users", "roles", "user_roles"]
    rows = db.execute(
        text(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ANY(:tables)
            """
        ),
        {"tables": required_tables},
    ).fetchall()
    existing = {r[0] for r in rows}
    missing = [t for t in required_tables if t not in existing]
    return {"ready": len(missing) == 0, "missing_tables": missing}
