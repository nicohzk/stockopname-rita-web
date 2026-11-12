import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { errorMessage } from "@/lib/errors";
import { AuthLoading, AuthShell } from "@/pages/auth-shell";

const MAX_NAME_LENGTH = 50;

export default function OperatorPage() {
  const { state, ready } = useAuth();

  if (!ready) {
    return <AuthLoading message="Memeriksa sesi..." />;
  }

  if (!state.authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Form dipasang setelah sesi diketahui supaya namanya bisa langsung terisi.
  return <OperatorForm initialName={state.operator} />;
}

function OperatorForm({ initialName }: { initialName: string }) {
  const { setOperator, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const editing = initialName !== "";
  const trimmed = name.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || trimmed === "") return;

    setPending(true);
    setError("");

    try {
      await setOperator(trimmed);
      navigate("/stock-opname", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Nama gagal disimpan. Coba lagi."));
    } finally {
      setPending(false);
    }
  }

  async function handleLeave() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <AuthShell
      title={editing ? "Ganti operator" : "Siapa yang bertugas?"}
      subtitle="Nama ini tercatat sebagai aktor pada setiap perubahan hasil stock opname."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="operator">Nama operator</Label>
          <Input
            id="operator"
            name="operator"
            autoFocus
            autoComplete="off"
            maxLength={MAX_NAME_LENGTH}
            placeholder="Contoh: Niko"
            value={name}
            disabled={pending}
            onChange={(event) => setName(event.target.value)}
          />
          <p className="text-xs text-slate-500 dark:text-neutral-500">
            Nama ini tidak diverifikasi, jadi tulis nama yang memang sedang bertugas.
          </p>
        </div>

        {error !== "" && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending || trimmed === ""}>
          {pending ? "Menyimpan..." : editing ? "Simpan nama" : "Mulai"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-slate-500 dark:text-neutral-400"
          disabled={pending}
          onClick={handleLeave}
        >
          Keluar saja
        </Button>
      </form>
    </AuthShell>
  );
}
