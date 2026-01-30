import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <div className="container-shell">
        <section className="retro-card" role="alert" aria-live="assertive">
          <header className="retro-header">
            <h1 className="retro-title">404 – Page Not Found</h1>
            <p className="retro-subtitle">
              The page you’re looking for doesn’t exist.
            </p>
          </header>
          <div className="retro-body flex flex-wrap gap-2">
            <Link className="retro-btn retro-btn-primary" href="/">
              Go home
            </Link>
            <Link className="retro-btn" href="/app">
              Go to app
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
