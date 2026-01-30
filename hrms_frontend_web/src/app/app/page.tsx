"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Role } from "@/lib/routes";
import { listHolidays, myLeaveBalances } from "@/lib/api/hrms";

function dashboardCopy(role: Role) {
  switch (role) {
    case "admin":
      return {
        title: "Admin Dashboard",
        desc: "System oversight, RBAC, audit visibility, and global controls.",
      };
    case "hr":
      return {
        title: "HR Dashboard",
        desc: "Employee lifecycle, leaves, holidays, payroll, and compliance workflows.",
      };
    case "manager":
      return {
        title: "Manager Dashboard",
        desc: "Team attendance, leave approvals, and quick team insights.",
      };
    case "employee":
      return {
        title: "Employee Dashboard",
        desc: "Clock in/out, request leave, and view balances & holidays.",
      };
  }
}

export default function AppHome() {
  const { role, accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const [leaveBalanceTotal, setLeaveBalanceTotal] = useState<number | null>(null);
  const [upcomingHoliday, setUpcomingHoliday] = useState<string | null>(null);

  const copy = useMemo(() => (role ? dashboardCopy(role) : null), [role]);

  useEffect(() => {
    if (!accessToken || !role) return;

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    const end = new Date(today);
    end.setDate(end.getDate() + 60);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    (async () => {
      try {
        setError(null);
        const [balances, holidays] = await Promise.all([
          myLeaveBalances({ token: accessToken }),
          listHolidays({ token: accessToken, startDate: fmt(start), endDate: fmt(end) }),
        ]);

        const total = balances.reduce((acc, b) => acc + (Number.isFinite(b.balance) ? b.balance : 0), 0);
        setLeaveBalanceTotal(total);

        const upcoming = holidays
          .map((h) => ({ date: h.holiday_date, name: h.name }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .find((h) => h.date >= fmt(today));

        setUpcomingHoliday(upcoming ? `${upcoming.date} • ${upcoming.name}` : null);
      } catch (e) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Failed to load dashboard data.";
        setError(msg);
      }
    })();
  }, [accessToken, role]);

  if (!role || !copy) return null;

  return (
    <div className="flex flex-col gap-4">
      <Card title={copy.title} subtitle={copy.desc}>
        {error ? (
          <div className="retro-card retro-card--flat mb-3">
            <div className="retro-body text-[var(--danger)] font-bold">{error}</div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="retro-card retro-card--flat">
            <div className="retro-body flex flex-col gap-2">
              <div className="font-extrabold">Quick Actions</div>
              <div className="flex flex-wrap gap-2">
                <Link className="retro-btn retro-btn-primary" href="/app/attendance">
                  Attendance
                </Link>
                <Link className="retro-btn" href="/app/leaves">
                  Leaves
                </Link>
                {role !== "employee" ? (
                  <Link className="retro-btn" href="/app/employees">
                    Employees
                  </Link>
                ) : null}
              </div>
              <small>These modules are backed by the FastAPI endpoints.</small>
            </div>
          </div>

          <div className="retro-card retro-card--flat">
            <div className="retro-body flex flex-col gap-2">
              <div className="font-extrabold">Leave Balance (Total)</div>
              <div className="text-3xl font-black">{leaveBalanceTotal ?? "—"}</div>
              <small>Fetched from /leaves/balances/me</small>
            </div>
          </div>

          <div className="retro-card retro-card--flat">
            <div className="retro-body flex flex-col gap-2">
              <div className="font-extrabold">Next Holiday</div>
              <div className="text-sm font-black">{upcomingHoliday ?? "—"}</div>
              <small>Fetched from /holidays</small>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
