"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { listHolidays, type HolidayOut } from "@/lib/api/hrms";

type HolidayRow = {
  date: string;
  name: string;
  type: string;
};

export default function HolidaysPage() {
  const { role, accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<HolidayRow[]>([]);

  const columns = useMemo(
    () => [
      { key: "date", label: "Date" },
      { key: "name", label: "Holiday" },
      { key: "type", label: "Type" },
    ],
    []
  );

  useEffect(() => {
    if (!accessToken) return;

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    const end = new Date(today);
    end.setDate(end.getDate() + 180);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    (async () => {
      try {
        setError(null);
        const hols: HolidayOut[] = await listHolidays({
          token: accessToken,
          startDate: fmt(start),
          endDate: fmt(end),
        });
        setRows(
          hols.map((h) => ({
            date: h.holiday_date,
            name: h.name,
            type: h.type,
          }))
        );
      } catch (e) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Failed to load holidays.";
        setError(msg);
      }
    })();
  }, [accessToken]);

  if (role !== "admin" && role !== "hr") {
    return (
      <EmptyState
        title="Access restricted"
        description="Holiday management is available for Admin/HR roles."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Holidays" subtitle="Holiday calendar (API-backed: GET /holidays)">
        {error ? (
          <div className="retro-card retro-card--flat">
            <div className="retro-body text-[var(--danger)] font-bold">{error}</div>
          </div>
        ) : null}

        <Table columns={columns} rows={rows} />

        <small className="block pt-3">
          Note: Backend currently exposes read-only holidays list endpoint (no create/delete).
        </small>
      </Card>
    </div>
  );
}
