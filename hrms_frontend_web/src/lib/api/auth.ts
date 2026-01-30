

const API_Base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export interface TokenPair {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface MeResponse {
    user_id: string;
    org_id: string;
    roles: string[];
    permissions: string[];
    employee_id: string | null;
}

export interface LoginParams {
    orgSlug: string;
    email: string;
    password: string;
}

export async function login(params: LoginParams): Promise<TokenPair> {
    const res = await fetch(`${API_Base}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            org_slug: params.orgSlug,
            email: params.email,
            password: params.password,
        }),
    });

    if (!res.ok) {
        let msg = "Login failed";
        try {
            const errorData = await res.json();
            msg = errorData.detail || msg;
        } catch {
            // ignore
        }
        throw new Error(msg);
    }

    return res.json();
}

export async function me(token: string): Promise<MeResponse> {
    const res = await fetch(`${API_Base}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch user context");
    }

    return res.json();
}
