import React from "react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="retro-card retro-card--flat">
      <div className="retro-body flex flex-col gap-2">
        <div className="font-extrabold">{title}</div>
        {description ? <small>{description}</small> : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  );
}
