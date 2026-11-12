import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";

/** Layar penuh untuk halaman yang belum boleh menampilkan sidebar. */
export function AuthLoading({ message }: { message: string }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4 dark:bg-black">
      <LoadingSpinner message={message} />
    </main>
  );
}

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

/** Bingkai dua halaman sebelum aplikasi: login dan layar operator. */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4 py-10 dark:bg-black">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-600/20">
            <img
              src="/logoritapasaraya_mini.png"
              alt="Logo Rita Pasaraya"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400/90">
              RITA
            </p>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-neutral-400">{subtitle}</p>
        </div>

        <Card className="border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <CardContent>{children}</CardContent>
        </Card>

        <p className="mt-6 text-center text-[11px] text-slate-500 dark:text-neutral-500">
          Rita Stock Opname v.1.0
        </p>
      </div>
    </main>
  );
}
