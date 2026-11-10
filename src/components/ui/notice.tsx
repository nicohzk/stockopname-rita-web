import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Non-blocking message above page content. Dipakai saat aksi sudah berhasil
 * tetapi pemuatan ulang daftar gagal, supaya halaman tidak diganti layar error.
 */
export function Notice({
  tone = "warning",
  message,
  action,
}: {
  tone?: "warning" | "error";
  message: string;
  action?: ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";

  return (
    <div
      role="status"
      className={`mb-3 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2 text-sm ${styles}`}
    >
      <span className="min-w-0 flex-1">{message}</span>
      {action}
    </div>
  );
}

export function RetryButton({
  onRetry,
  retrying = false,
}: {
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
      {retrying ? "Memuat..." : "Muat ulang"}
    </Button>
  );
}

/**
 * Full-block error state for a page or a table that has nothing to show yet.
 * Unlike Notice, it replaces the area instead of sitting above it.
 */
export function ErrorState({
  message,
  onRetry,
  retrying = false,
}: {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry ? <RetryButton onRetry={onRetry} retrying={retrying} /> : null}
    </div>
  );
}
