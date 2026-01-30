import React from "react";

export default function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-end justify-between gap-3">
        <span className="font-extrabold">{label}</span>
        {hint ? <small>{hint}</small> : null}
      </div>
      {children}
      {error ? (
        <div className="text-sm font-bold text-[var(--danger)]">{error}</div>
      ) : null}
    </label>
  );
}
