import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { onUnauthorized } from "@/lib/api";
import { AuthContext } from "@/lib/auth-context";
import { getAuthState, login as loginRequest, logout as logoutRequest, setOperator as setOperatorRequest } from "@/services/auth.service";
import type { AuthState } from "@/types/auth";

const UNAUTHENTICATED: AuthState = { authenticated: false, operator: "" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(UNAUTHENTICATED);
  const [ready, setReady] = useState(false);

  // Sesi hidup di cookie, bukan di localStorage: satu panggilan saat boot
  // menentukan apakah aplikasi boleh tampil.
  useEffect(() => {
    let active = true;

    getAuthState()
      .catch(() => UNAUTHENTICATED) // API belum terjangkau: tampilkan login, jangan layar kosong.
      .then((next) => {
        if (active) setState(next);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // api() mengirim event ini saat sebuah request dijawab 401.
  useEffect(() => onUnauthorized(() => setState(UNAUTHENTICATED)), []);

  const login = useCallback(async (username: string, password: string) => {
    const next = await loginRequest(username, password);
    setState(next);
    return next;
  }, []);

  const setOperator = useCallback(async (name: string) => {
    const next = await setOperatorRequest(name);
    setState(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      // Apa pun jawaban server, sesi di browser ini sudah tidak dipakai.
      setState(UNAUTHENTICATED);
    }
  }, []);

  const value = useMemo(
    () => ({ state, ready, login, setOperator, logout }),
    [state, ready, login, setOperator, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
