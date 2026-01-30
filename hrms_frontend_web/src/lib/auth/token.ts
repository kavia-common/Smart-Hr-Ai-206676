import type { Role } from "../routes";

const STORAGE_KEY = "hrms_auth_tokens";

export interface StoredAuth {
    accessToken: string;
    refreshToken: string;
    role: Role;
}

export function getStoredAuth(): StoredAuth | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function setStoredAuth(auth: StoredAuth) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
}
