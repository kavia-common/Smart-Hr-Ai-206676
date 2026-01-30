"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import { useAuth } from "@/components/auth/AuthProvider";
import { clockIn, clockOut, listAttendanceSessions } from "@/lib/api/hrms";

type AttendanceEntry = {
  date: string;
  inTime: string;
  outTime: string;
  hours: string;
  mode: string;
};

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export default function AttendancePage() {
  const { accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<string>("onsite");
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);

  const columns = useMemo(
    () => [
      { key: "date", label: "Date" },
      { key: "inTime", label: "In" },
      { key: "outTime", label: "Out" },
      { key: "hours", label: "Minutes Worked" },
      { key: "mode", label: "Mode" },
    ],
    []
  );

  async function refresh() {
    if (!accessToken) return;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const sessions = await listAttendanceSessions({
      token: accessToken,
      startDate: fmt(start),
      endDate: fmt(end),
    });

    setEntries(
      sessions.map((s) => ({
        date: s.session_date,
        inTime: fmtTime(s.clock_in_at),
        outTime: fmtTime(s.clock_out_at),
        hours: fmtHours(s.minutes_worked),
        mode: s.work_mode,
      }))
    );
  }

  useEffect(() => {
    setError(null);
    refresh().catch((e) => {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Failed to load attendance.";
      setError(msg);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function onClockIn() {
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    try {
      await clockIn({ token: accessToken, workMode: mode, source: "web" });
      await refresh();
    } catch (e) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Clock in failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function onClockOut() {
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    try {
      await clockOut({ token: accessToken });
      await refresh();
    } catch (e) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Clock out failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Attendance" subtitle="Clock in/out + sessions (API-backed)">
        {error ? (
          <div className="retro-card retro-card--flat">
            <div className="retro-body text-[var(--danger)] font-bold">{error}</div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="retro-input w-auto"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            aria-label="Work mode"
          >
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <button className="retro-btn retro-btn-primary" onClick={onClockIn} disabled={busy}>
            Clock in
          </button>
          <button className="retro-btn retro-btn-danger" onClick={onClockOut} disabled={busy}>
            Clock out
          </button>

          <button className="retro-btn" onClick={() => refresh()} disabled={busy}>
            Refresh
          </button>
        </div>

        <div className="pt-4">
          <Table columns={columns} rows={entries} />
        </div>
      </Card>
    </div>
  );
}
