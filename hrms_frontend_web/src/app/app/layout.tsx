"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/auth/login");
  }, [isAuthenticated, router]);

  return <AppShell title="SmartHR Workspace">{children}</AppShell>;
}
