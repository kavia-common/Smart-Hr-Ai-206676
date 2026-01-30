from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routers import audit, attendance, auth, employees, health, holidays, leaves, payroll
from src.core.config import get_settings
from src.core.db import SessionLocal
from src.core.seed import seed_demo_admin

settings = get_settings()

openapi_tags = [
    {"name": "Health", "description": "Liveness, database connectivity, and readiness probes."},
    {"name": "Auth", "description": "Authentication and JWT token lifecycle."},
    {"name": "Employees", "description": "Employee directory, hierarchy and org people data."},
    {"name": "Attendance", "description": "Attendance clock-in/clock-out and session tracking."},
    {"name": "Leaves", "description": "Leave requests, approvals, and balances."},
    {"name": "Holidays", "description": "Holiday calendars and holiday lists."},
    {"name": "Payroll", "description": "Payroll metadata (cycles etc.)."},
    {"name": "Audit", "description": "Audit logs of security and HR operations."},
]

app = FastAPI(
    title="SmartHR AI Backend",
    description="FastAPI backend for SmartHR AI HRMS with PostgreSQL persistence, JWT auth, and RBAC.",
    version="0.1.0",
    openapi_tags=openapi_tags,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup_seed() -> None:
    """Seed demo org/admin if missing.

    This is intentionally idempotent and safe for previews. If the database is not reachable
    at startup, the API can still start; readiness endpoint will report DB issues.
    """
    try:
        db = SessionLocal()
        seed_demo_admin(db)
    except Exception:
        # Do not crash the app on seed failure; readiness will indicate DB problems.
        pass
    finally:
        try:
            db.close()
        except Exception:
            pass


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(leaves.router)
app.include_router(holidays.router)
app.include_router(payroll.router)
app.include_router(audit.router)
