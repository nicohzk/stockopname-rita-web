import { api, type ApiResponse } from "@/lib/api";
import type { AuthState } from "@/types/auth";

/** Server selalu menjawab 200; cookie yang hilang berarti belum login. */
const UNAUTHENTICATED: AuthState = { authenticated: false, operator: "" };

export async function getAuthState(): Promise<AuthState> {
  const response = await api<ApiResponse<AuthState>>("/auth/me");
  return response.data ?? UNAUTHENTICATED;
}

export async function login(username: string, password: string): Promise<AuthState> {
  const response = await api<ApiResponse<AuthState>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return response.data ?? UNAUTHENTICATED;
}

export async function setOperator(name: string): Promise<AuthState> {
  const response = await api<ApiResponse<AuthState>>("/auth/operator", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return response.data ?? UNAUTHENTICATED;
}

export async function logout(): Promise<void> {
  await api<ApiResponse<AuthState>>("/auth/logout", { method: "POST" });
}
