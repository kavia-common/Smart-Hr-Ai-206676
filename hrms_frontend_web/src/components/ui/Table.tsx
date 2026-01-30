import React from "react";

export default function Table({
  columns,
  rows,
}: {
  columns: { key: string; label: string }[];
  rows: Record<string, React.ReactNode>[];
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="retro-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {columns.map((c) => (
                <td key={c.key}>{r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
