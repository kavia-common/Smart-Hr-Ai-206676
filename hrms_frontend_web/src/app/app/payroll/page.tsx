"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { listPayrollCycles, type PayrollCycleOut } from "@/lib/api/hrms";

type Row = {
  code: string;
  start: string;
  end: string;
  status: string;
};

export default function PayrollPage() {
  const { role, accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  const columns = useMemo(
    () => [
      { key: "code", label: "Cycle" },
      { key: "start", label: "Start" },
      { key: "end", label: "End" },
      { key: "status", label: "Status" },
    ],
    []
  );

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        setError(null);
        const cycles: PayrollCycleOut[] = await listPayrollCycles({ token: accessToken });
        setRows(
          cycles.map((c) => ({
            code: c.code,
            start: c.start_date,
            end: c.end_date,
            status: c.status,
          }))
        );
      } catch (e) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Failed to load payroll cycles.";
        setError(msg);
      }
    })();
  }, [accessToken]);

  if (role !== "admin" && role !== "hr") {
    return (
      <EmptyState
        title="Access restricted"
        description="Payroll module is available for Admin/HR roles."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Payroll" subtitle="Payroll cycles (API-backed: GET /payroll/cycles)">
        {error ? (
          <div className="retro-card retro-card--flat">
            <div className="retro-body text-[var(--danger)] font-bold">{error}</div>
          </div>
        ) : null}

        <Table
          columns={columns}
          rows={rows.map((r) => ({
            ...r,
            status: <span className="retro-chip">{r.status}</span>,
          }))}
        />

        <small className="block pt-3">Note: schema may not seed payroll cycles by default.</small>
      </Card>
    </div>
  );
}
