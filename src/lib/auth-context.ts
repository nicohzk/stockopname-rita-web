import { createContext, useContext } from "react";

import type { AuthState } from "@/types/auth";

export type AuthContextValue = {
  state: AuthState;
  /** false selama /auth/me masih di perjalanan. */
  ready: boolean;
  login: (username: string, password: string) => Promise<AuthState>;
  setOperator: (name: string) => Promise<AuthState>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  }
  return context;
}
