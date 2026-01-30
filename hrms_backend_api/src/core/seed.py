from __future__ import annotations

import os
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from src.core.security import hash_password

# Deterministic IDs aligned with schema.sql (avoids duplicates across restarts).
_DEMO_ORG_ID = UUID("00000000-0000-0000-0000-000000000001")
_ADMIN_ROLE_ID = UUID("00000000-0000-0000-0000-000000000101")
_ADMIN_USER_ID = UUID("00000000-0000-0000-0000-000000000201")


def _env(name: str, default: str) -> str:
    val = os.getenv(name)
    return val.strip() if isinstance(val, str) and val.strip() else default


# PUBLIC_INTERFACE
def seed_demo_admin(db: Session) -> dict[str, object]:
    """Ensure demo org and an admin user exist (idempotent).

    This supports local previews and first-run deployments where the schema is present
    but the seed data may be missing or partially applied.

    Environment variables (optional):
      - SEED_DEMO_ORG_SLUG (default: "demo")
      - SEED_DEMO_ORG_NAME (default: "SmartHR Demo Org")
      - SEED_ADMIN_EMAIL (default: "admin@demo.local")
      - SEED_ADMIN_PASSWORD (default: "admin123")

    Notes:
      - If the admin user already exists (org + email), password is not changed.
      - If DB schema is missing, the caller should handle exceptions.

    Returns:
        dict: summary of what was created/ensured.
    """
    org_slug = _env("SEED_DEMO_ORG_SLUG", "demo")
    org_name = _env("SEED_DEMO_ORG_NAME", "SmartHR Demo Org")
    admin_email = _env("SEED_ADMIN_EMAIL", "admin@demo.local")
    admin_password = _env("SEED_ADMIN_PASSWORD", "admin123")

    now = datetime.now(tz=timezone.utc)

    created = {"organization": False, "admin_role": False, "admin_user": False, "admin_user_role": False}

    # Organization
    org_row = db.execute(text("SELECT id FROM organizations WHERE slug = :slug LIMIT 1"), {"slug": org_slug}).fetchone()
    if not org_row:
        db.execute(
            text(
                """
                INSERT INTO organizations (id, name, slug, status, created_at, updated_at)
                VALUES (:id, :name, :slug, 'active', :now, :now)
                """
            ),
            {"id": str(_DEMO_ORG_ID), "name": org_name, "slug": org_slug, "now": now},
        )
        created["organization"] = True
        org_id = _DEMO_ORG_ID
    else:
        org_id = UUID(org_row[0])

    # Admin role
    role_row = db.execute(
        text("SELECT id FROM roles WHERE org_id = :org_id AND lower(name)=lower('Admin') LIMIT 1"),
        {"org_id": str(org_id)},
    ).fetchone()
    if not role_row:
        db.execute(
            text(
                """
                INSERT INTO roles (id, org_id, name, description, is_system, created_at, updated_at)
                VALUES (:id, :org_id, 'Admin', 'System administrator with full access', true, :now, :now)
                """
            ),
            {"id": str(_ADMIN_ROLE_ID), "org_id": str(org_id), "now": now},
        )
        created["admin_role"] = True
        role_id = _ADMIN_ROLE_ID
    else:
        role_id = UUID(role_row[0])

    # Admin user
    user_row = db.execute(
        text("SELECT id FROM users WHERE org_id = :org_id AND lower(email)=lower(:email) LIMIT 1"),
        {"org_id": str(org_id), "email": admin_email},
    ).fetchone()
    if not user_row:
        db.execute(
            text(
                """
                INSERT INTO users (id, org_id, email, password_hash, is_active, must_change_password, created_at, updated_at)
                VALUES (:id, :org_id, :email, :password_hash, true, true, :now, :now)
                """
            ),
            {
                "id": str(_ADMIN_USER_ID),
                "org_id": str(org_id),
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "now": now,
            },
        )
        created["admin_user"] = True
        user_id = _ADMIN_USER_ID
    else:
        user_id = UUID(user_row[0])

    # Ensure role assignment
    link_row = db.execute(
        text("SELECT 1 FROM user_roles WHERE user_id = :user_id AND role_id = :role_id LIMIT 1"),
        {"user_id": str(user_id), "role_id": str(role_id)},
    ).fetchone()
    if not link_row:
        db.execute(
            text("INSERT INTO user_roles (user_id, role_id, created_at) VALUES (:user_id, :role_id, :now)"),
            {"user_id": str(user_id), "role_id": str(role_id), "now": now},
        )
        created["admin_user_role"] = True

    db.commit()
    return {"org_id": str(org_id), "admin_email": admin_email, "created": created}
