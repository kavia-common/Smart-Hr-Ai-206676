"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { LogOut, Menu, Shield, User } from "lucide-react";
import { navItems, type Role } from "@/lib/routes";
import { useAuth } from "@/components/auth/AuthProvider";

function roleLabel(role: Role) {
  switch (role) {
    case "admin":
      return "Admin";
    case "hr":
      return "HR";
    case "manager":
      return "Manager";
    case "employee":
      return "Employee";
  }
}

export default function AppShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo(() => {
    if (!role) return [];
    return navItems.filter((n) => n.roles.includes(role));
  }, [role]);

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-20 border-b-2 border-black bg-[var(--surface)]">
        <div className="container-shell flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="retro-btn md:hidden"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle navigation"
            >
              <Menu size={18} />
              Menu
            </button>

            <Link href="/app" className="flex items-center gap-2">
              <span className="retro-chip">
                <Shield size={14} />
                SmartHR AI
              </span>
            </Link>

            {title ? (
              <div className="hidden md:block">
                <div className="font-extrabold">{title}</div>
                {description ? <small>{description}</small> : null}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <span className="retro-chip">
              <User size={14} />
              {role ? roleLabel(role) : "Guest"}
            </span>
            <button
              className="retro-btn"
              onClick={() => {
                signOut();
                router.push("/auth/login");
              }}
              aria-label="Sign out"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="container-shell grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside
          className={clsx(
            "retro-card h-fit md:sticky md:top-[88px]",
            mobileOpen ? "block" : "hidden md:block"
          )}
        >
          <div className="retro-header">
            <div className="retro-title">Navigation</div>
            <div className="retro-subtitle">
              Role-based modules and workflows
            </div>
          </div>
          <nav className="retro-body flex flex-col gap-2">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "retro-btn justify-start",
                    active && "retro-btn-primary"
                  )}
                >
                  <span className="font-extrabold">{item.label}</span>
                  <span className="ml-auto text-xs text-[var(--muted)]">
                    {active ? "Active" : ""}
                  </span>
                </Link>
              );
            })}
            {!items.length ? (
              <div className="text-sm text-[var(--muted)]">
                No navigation available. Please login.
              </div>
            ) : null}
          </nav>
        </aside>

        {/* Content */}
        <main className="retro-card">
          <div className="retro-header">
            <div className="retro-title">{title ?? "Workspace"}</div>
            {description ? (
              <div className="retro-subtitle">{description}</div>
            ) : (
              <div className="retro-subtitle">
                Mobile responsive retro UI • role-aware pages
              </div>
            )}
          </div>
          <div className="retro-body">{children}</div>
        </main>
      </div>
    </div>
  );
}
