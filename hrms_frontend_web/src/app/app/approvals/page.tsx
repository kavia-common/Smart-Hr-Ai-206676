"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { decideLeave, listLeaveRequests, type LeaveRequestOut } from "@/lib/api/hrms";

type ApprovalRow = {
  id: string;
  employee: string;
  from: string;
  to: string;
  status: string;
};

export default function ApprovalsPage() {
  const { role, accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rows, setRows] = useState<ApprovalRow[]>([]);

  const columns = useMemo(
    () => [
      { key: "id", label: "Request ID" },
      { key: "employee", label: "Employee ID" },
      { key: "from", label: "From" },
      { key: "to", label: "To" },
      { key: "status", label: "Status" },
      { key: "actions", label: "Actions" },
    ],
    []
  );

  const isRestricted = !role || role === "employee";

  function mapRow(r: LeaveRequestOut): ApprovalRow {
    return {
      id: r.id,
      employee: r.employee_id,
      from: r.start_date,
      to: r.end_date,
      status: r.status,
    };
  }

  async function refresh() {
    if (!accessToken) return;
    const pending = await listLeaveRequests({ token: accessToken, status: "pending" });
    setRows(pending.map(mapRow));
  }

  useEffect(() => {
    setError(null);
    if (!accessToken) return;
    refresh().catch((e) => {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Failed to load approvals.";
      setError(msg);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (isRestricted) {
    return (
      <EmptyState
        title="Approvals unavailable"
        description="Only Managers/HR/Admin can approve or reject requests."
      />
    );
  }

  async function act(id: string, decision: "approved" | "rejected") {
    if (!accessToken) return;
    setBusyId(id);
    setError(null);
    try {
      await decideLeave({ token: accessToken, leaveRequestId: id, decision });
      await refresh();
    } catch (e) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Decision failed.";
      setError(msg);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Approvals" subtitle="Pending leave approvals (API-backed)">
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
            actions: (
              <div className="flex flex-wrap gap-2">
                <button
                  className="retro-btn retro-btn-primary"
                  disabled={busyId === r.id}
                  onClick={() => act(r.id, "approved")}
                >
                  Approve
                </button>
                <button
                  className="retro-btn retro-btn-danger"
                  disabled={busyId === r.id}
                  onClick={() => act(r.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            ),
          }))}
        />

        <small className="block pt-3">
          Backend rule: approver must be mapped to an employee (seeded admin is mapped).
        </small>
      </Card>
    </div>
  );
}
