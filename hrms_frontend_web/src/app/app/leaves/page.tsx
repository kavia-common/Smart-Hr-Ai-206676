"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Field from "@/components/ui/Field";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  applyLeave,
  listLeaveRequests,
  myLeaveBalances,
  type LeaveBalanceOut,
  type LeaveRequestOut,
} from "@/lib/api/hrms";

type LeaveRow = {
  id: string;
  from: string;
  to: string;
  qty: number;
  status: string;
  reason: string;
};

export default function LeavesPage() {
  const { role, accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Demo leave_type_ids seeded in schema.sql
  const leaveTypes = [
    { id: "00000000-0000-0000-0000-000000003001", label: "Casual Leave (CL)" },
    { id: "00000000-0000-0000-0000-000000003002", label: "Sick Leave (SL)" },
    { id: "00000000-0000-0000-0000-000000003003", label: "Loss of Pay (LOP)" },
  ];

  const [balances, setBalances] = useState<LeaveBalanceOut[]>([]);
  const [rows, setRows] = useState<LeaveRow[]>([]);
  const [form, setForm] = useState({
    leaveTypeId: leaveTypes[0].id,
    from: "",
    to: "",
    quantity: 1,
    reason: "",
  });

  const columns = useMemo(
    () => [
      { key: "id", label: "Request ID" },
      { key: "from", label: "From" },
      { key: "to", label: "To" },
      { key: "qty", label: "Qty" },
      { key: "status", label: "Status" },
      { key: "reason", label: "Reason" },
    ],
    []
  );

  function mapLeaveRow(r: LeaveRequestOut): LeaveRow {
    return {
      id: r.id,
      from: r.start_date,
      to: r.end_date,
      qty: r.quantity,
      status: r.status,
      reason: r.reason ?? "—",
    };
  }

  async function refresh() {
    if (!accessToken) return;
    const [b, reqs] = await Promise.all([
      myLeaveBalances({ token: accessToken }),
      listLeaveRequests({ token: accessToken }),
    ]);
    setBalances(b);
    setRows(reqs.map(mapLeaveRow));
  }

  useEffect(() => {
    setError(null);
    refresh().catch((e) => {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Failed to load leaves.";
      setError(msg);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function onSubmit() {
    if (!accessToken) return;
    setBusy(true);
    setError(null);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const start = form.from || today;
      const end = form.to || start;

      await applyLeave({
        token: accessToken,
        leaveTypeId: form.leaveTypeId,
        startDate: start,
        endDate: end,
        quantity: form.quantity,
        reason: form.reason || null,
      });
      setForm({ leaveTypeId: leaveTypes[0].id, from: "", to: "", quantity: 1, reason: "" });
      await refresh();
    } catch (e) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Failed to apply leave.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const balanceTotal = balances.reduce((acc, b) => acc + b.balance, 0);

  return (
    <div className="flex flex-col gap-4">
      <Card title="Leaves" subtitle="Apply, view requests, balances (API-backed)">
        {error ? (
          <div className="retro-card retro-card--flat">
            <div className="retro-body text-[var(--danger)] font-bold">{error}</div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
          <div className="retro-card retro-card--flat">
            <div className="retro-body flex flex-col gap-3">
              <div className="font-extrabold">New leave request</div>

              <Field label="Leave type">
                <select
                  className="retro-input"
                  value={form.leaveTypeId}
                  onChange={(e) => setForm((s) => ({ ...s, leaveTypeId: e.target.value }))}
                >
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="From">
                <input
                  className="retro-input"
                  type="date"
                  value={form.from}
                  onChange={(e) => setForm((s) => ({ ...s, from: e.target.value }))}
                />
              </Field>

              <Field label="To">
                <input
                  className="retro-input"
                  type="date"
                  value={form.to}
                  onChange={(e) => setForm((s) => ({ ...s, to: e.target.value }))}
                />
              </Field>

              <Field label="Quantity">
                <input
                  className="retro-input"
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={form.quantity}
                  onChange={(e) => setForm((s) => ({ ...s, quantity: Number(e.target.value || 1) }))}
                />
              </Field>

              <Field label="Reason">
                <input
                  className="retro-input"
                  value={form.reason}
                  onChange={(e) => setForm((s) => ({ ...s, reason: e.target.value }))}
                />
              </Field>

              <button className="retro-btn retro-btn-primary" onClick={onSubmit} disabled={busy}>
                {busy ? "Submitting..." : "Submit request"}
              </button>

              <small>
                Role: <strong>{role}</strong> • Balances total: <strong>{balanceTotal.toFixed(2)}</strong>
              </small>
            </div>
          </div>

          <div className="retro-card retro-card--flat">
            <div className="retro-body flex flex-col gap-3">
              <div className="font-extrabold">Requests</div>
              <Table
                columns={columns}
                rows={rows.map((r) => ({
                  ...r,
                  status: <span className="retro-chip">{r.status}</span>,
                }))}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
