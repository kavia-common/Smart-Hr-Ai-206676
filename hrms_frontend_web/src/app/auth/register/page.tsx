"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Card from "@/components/ui/Card";
import Field from "@/components/ui/Field";

const schema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email(),
    password: z.string().min(4),
    confirmPassword: z.string().min(4),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit() {
    /**
     * Backend auth/register endpoint not available yet in OpenAPI.
     * For now: show success and route to login.
     */
    setDone(true);
    setTimeout(() => router.push("/auth/login"), 700);
  }

  return (
    <main className="min-h-screen">
      <div className="container-shell">
        <Card
          title="Create account"
          subtitle="Not implemented in backend yet (only /auth/login, /auth/refresh, /auth/me)."
        >
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Field label="Full name" error={form.formState.errors.name?.message}>
              <input className="retro-input" {...form.register("name")} />
            </Field>

            <Field label="Email" error={form.formState.errors.email?.message}>
              <input className="retro-input" type="email" {...form.register("email")} />
            </Field>

            <Field label="Password" error={form.formState.errors.password?.message}>
              <input className="retro-input" type="password" {...form.register("password")} />
            </Field>

            <Field
              label="Confirm password"
              error={form.formState.errors.confirmPassword?.message}
            >
              <input className="retro-input" type="password" {...form.register("confirmPassword")} />
            </Field>

            {done ? (
              <div className="retro-card retro-card--flat">
                <div className="retro-body font-bold text-[var(--success)]">
                  Account created (demo). Redirecting to login…
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button className="retro-btn retro-btn-primary" type="submit">
                Create account
              </button>
              <button className="retro-btn" type="button" onClick={() => router.push("/auth/login")}>
                Back to login
              </button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
