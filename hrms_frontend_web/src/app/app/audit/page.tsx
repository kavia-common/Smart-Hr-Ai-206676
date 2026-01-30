"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { listAuditLogs, type AuditLogOut } from "@/lib/api/hrms";

type Row = {
  at: string;
  action: string;
  entity: string;
  actorUser: string;
};

export default function AuditPage() {
  const { role, accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  const columns = useMemo(
    () => [
      { key: "at", label: "Timestamp" },
      { key: "actorUser", label: "Actor" },
      { key: "action", label: "Action" },
      { key: "entity", label: "Entity" },
    ],
    []
  );

  useEffect(() => {
    if (!accessToken) return;

    (async () => {
      try {
        setError(null);
        const logs: AuditLogOut[] = await listAuditLogs({ token: accessToken, limit: 200 });
        setRows(
          logs.map((l) => ({
            at: new Date(l.created_at).toLocaleString(),
            action: l.action,
            entity: `${l.entity_type}${l.entity_id ? `:${l.entity_id}` : ""}`,
            actorUser: l.actor_user_id ?? "—",
          }))
        );
      } catch (e) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Failed to load audit logs.";
        setError(msg);
      }
    })();
  }, [accessToken]);

  if (role !== "admin") {
    return (
      <EmptyState
        title="Access restricted"
        description="Audit logs are available for Admin only."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Audit Logs" subtitle="Security + activity trail (API-backed: GET /audit/logs)">
        {error ? (
          <div className="retro-card retro-card--flat">
            <div className="retro-body text-[var(--danger)] font-bold">{error}</div>
          </div>
        ) : null}
        <Table columns={columns} rows={rows} />
      </Card>
    </div>
  );
}
