"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { listEmployees, type EmployeeOut } from "@/lib/api/hrms";

type Row = {
  id: string;
  name: string;
  email: string;
  department: string;
  manager: string;
  status: string;
};

export default function EmployeesPage() {
  const { role, accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  const columns = useMemo(
    () => [
      { key: "id", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "department", label: "Department" },
      { key: "manager", label: "Manager ID" },
      { key: "status", label: "Status" },
    ],
    []
  );

  useEffect(() => {
    if (!accessToken) return;

    (async () => {
      try {
        setError(null);
        const employees: EmployeeOut[] = await listEmployees({ token: accessToken, limit: 50, offset: 0 });
        setRows(
          employees.map((e) => ({
            id: e.employee_code || e.id,
            name: `${e.first_name}${e.last_name ? ` ${e.last_name}` : ""}`,
            email: e.work_email ?? "—",
            department: e.department ?? "—",
            manager: e.manager_employee_id ?? "—",
            status: e.status,
          }))
        );
      } catch (e) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Failed to load employees.";
        setError(msg);
      }
    })();
  }, [accessToken]);

  if (role === "employee") {
    return (
      <EmptyState
        title="Access restricted"
        description="Employees module is available for Admin/HR/Manager roles."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Employees" subtitle="Directory (API-backed: GET /employees)">
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

        <small className="block pt-3">
          Note: Create employee is available in backend (POST /employees) but not wired here yet.
        </small>
      </Card>
    </div>
  );
}
