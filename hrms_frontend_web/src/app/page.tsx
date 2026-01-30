import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container-shell">
        <section className="retro-card">
          <header className="retro-header">
            <h1 className="retro-title">SmartHR AI</h1>
            <p className="retro-subtitle">
              Retro-themed HRMS • role-based dashboards • approvals workflows
            </p>
          </header>
          <div className="retro-body flex flex-col gap-4">
            <p className="text-sm">
              Continue to the application workspace or sign in to your account.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link className="retro-btn retro-btn-primary" href="/auth/login">
                Sign in
              </Link>
              <Link className="retro-btn" href="/app">
                Go to app
              </Link>
            </div>
            <small>
              Configure backend at <code>NEXT_PUBLIC_API_BASE_URL</code> (see{" "}
              <code>.env.example</code>).
            </small>
          </div>
        </section>
      </div>
    </main>
  );
}
