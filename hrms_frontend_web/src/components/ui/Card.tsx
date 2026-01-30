import React from "react";
import clsx from "clsx";

export default function Card({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("retro-card retro-card--flat", className)}>
      {(title || subtitle) && (
        <header className="retro-header">
          {title ? <div className="retro-title">{title}</div> : null}
          {subtitle ? <div className="retro-subtitle">{subtitle}</div> : null}
        </header>
      )}
      <div className="retro-body">{children}</div>
    </section>
  );
}
