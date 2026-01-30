"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Card from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import { useAuth } from "@/components/auth/AuthProvider";
import { login, me } from "@/lib/api/auth";
import type { Role } from "@/lib/routes";

const schema = z.object({
  orgSlug: z.string().min(1, "Org slug is required"),
  email: z.string().email(),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type FormValues = z.infer<typeof schema>;

function roleFromBackendRoles(roles: string[]): Role {
  const normalized = roles.map((r) => r.toLowerCase());
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("hr")) return "hr";
  if (normalized.includes("manager")) return "manager";
  return "employee";
}

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { orgSlug: "demo", email: "admin@demo.local", password: "admin123" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setBusy(true);

    try {
      const tokens = await login({
        orgSlug: values.orgSlug,
        email: values.email,
        password: values.password,
      });

      const meResp = await me(tokens.access_token);
      const role = roleFromBackendRoles(meResp.roles);

      auth.signIn({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        role,
        email: values.email,
      });

      router.push("/app");
    } catch (e) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Login failed. Please try again.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="container-shell">
        <Card
          title="Sign in"
          subtitle="Uses the real backend /auth/login endpoint. Default demo: admin@demo.local / admin123 (org: demo)."
        >
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Field label="Org slug" error={form.formState.errors.orgSlug?.message}>
              <input className="retro-input" {...form.register("orgSlug")} />
            </Field>

            <Field label="Email" error={form.formState.errors.email?.message}>
              <input className="retro-input" type="email" {...form.register("email")} />
            </Field>

            <Field label="Password" error={form.formState.errors.password?.message}>
              <input className="retro-input" type="password" {...form.register("password")} />
            </Field>

            {error ? (
              <div className="retro-card retro-card--flat">
                <div className="retro-body text-[var(--danger)] font-bold">{error}</div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button className="retro-btn retro-btn-primary" type="submit" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </button>
              <button className="retro-btn" type="button" onClick={() => router.push("/auth/register")}>
                Create account
              </button>
            </div>

            <small>
              Configure backend at <code>NEXT_PUBLIC_API_BASE_URL</code> (see <code>.env.example</code>).
            </small>
          </form>
        </Card>
      </div>
    </main>
  );
}
