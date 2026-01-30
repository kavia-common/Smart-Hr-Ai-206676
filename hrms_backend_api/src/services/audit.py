from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session


def _audit_metadata_column(db: Session) -> str:
    """
    Determine which JSONB column name is present for audit log metadata.

    Some iterations of the project used `event_metadata` (SQLAlchemy model),
    while the SQL schema uses `metadata`. To keep login/audit logging from
    breaking due to drift, we detect the available column at runtime.
    """
    row = db.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'audit_logs'
              AND column_name IN ('metadata', 'event_metadata')
            ORDER BY CASE column_name WHEN 'metadata' THEN 1 ELSE 2 END
            LIMIT 1
            """
        )
    ).fetchone()
    return str(row[0]) if row else "metadata"


# PUBLIC_INTERFACE
def write_audit_log(
    db: Session,
    *,
    org_id: UUID | None,
    actor_user_id: UUID | None,
    actor_employee_id: UUID | None,
    action: str,
    entity_type: str,
    entity_id: UUID | None,
    ip: str | None = None,
    user_agent: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    """Persist an audit log entry to the database.

    We intentionally use a direct SQL INSERT to:
    - rely on database defaults (created_at)
    - avoid ORM model mismatches if the schema evolves

    This helper is intentionally resilient to DB schema drift: it supports both
    `metadata` and legacy `event_metadata` column naming.
    """
    meta_col = _audit_metadata_column(db)

    # NOTE: Column name is interpolated after strict allow-listing in
    # `_audit_metadata_column()`. All values remain parameterized.
    db.execute(
        text(
            f"""
            INSERT INTO audit_logs (
              id, org_id, actor_user_id, actor_employee_id, action, entity_type, entity_id,
              ip, user_agent, {meta_col}, created_at
            )
            VALUES (
              gen_random_uuid(), :org_id, :actor_user_id, :actor_employee_id, :action, :entity_type, :entity_id,
              :ip, :user_agent, :metadata, :created_at
            )
            """
        ),
        {
            "org_id": str(org_id) if org_id else None,
            "actor_user_id": str(actor_user_id) if actor_user_id else None,
            "actor_employee_id": str(actor_employee_id) if actor_employee_id else None,
            "action": action,
            "entity_type": entity_type,
            "entity_id": str(entity_id) if entity_id else None,
            "ip": ip,
            "user_agent": user_agent,
            "metadata": metadata or {},
            "created_at": datetime.now(tz=timezone.utc),
        },
    )
    db.commit()
