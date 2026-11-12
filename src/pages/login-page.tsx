import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { errorMessage } from "@/lib/errors";
import { AuthLoading, AuthShell } from "@/pages/auth-shell";

export default function LoginPage() {
  const { state, ready, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!ready) {
    return <AuthLoading message="Memeriksa sesi..." />;
  }

  // Sesi yang masih berlaku tidak perlu login ulang.
  if (state.authenticated) {
    return <Navigate to={state.operator ? "/stock-opname" : "/operator"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError("");

    try {
      const next = await login(username.trim(), password);
      navigate(next.operator ? "/stock-opname" : "/operator", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Gagal masuk. Coba lagi."));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell title="Masuk" subtitle="Gunakan akun admin gudang untuk melanjutkan.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            disabled={pending}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            disabled={pending}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error !== "" && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={pending || username.trim() === "" || password === ""}
        >
          {pending ? "Memeriksa..." : "Masuk"}
        </Button>
      </form>
    </AuthShell>
  );
}
