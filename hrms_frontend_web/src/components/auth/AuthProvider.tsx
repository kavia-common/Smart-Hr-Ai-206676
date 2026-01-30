"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "@/lib/auth/token";
import type { Role } from "@/lib/routes";

type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  email?: string;
};

type AuthContextValue = AuthState & {
  // PUBLIC_INTERFACE
  signIn: (payload: {
    accessToken: string;
    refreshToken: string;
    role: Role;
    email?: string;
  }) => void;
  // PUBLIC_INTERFACE
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// PUBLIC_INTERFACE
export function useAuth(): AuthContextValue {
  /** Hook for accessing auth state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = typeof window === "undefined" ? null : getStoredAuth();
  const [state, setState] = useState<AuthState>(() => ({
    isAuthenticated: Boolean(initial?.accessToken),
    accessToken: initial?.accessToken ?? null,
    refreshToken: initial?.refreshToken ?? null,
    role: (initial?.role as Role) ?? null,
  }));

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      signIn: ({ accessToken, refreshToken, role, email }) => {
        setStoredAuth({ accessToken, refreshToken, role });
        setState({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          role,
          email,
        });
      },
      signOut: () => {
        clearStoredAuth();
        setState({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          role: null,
        });
      },
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
