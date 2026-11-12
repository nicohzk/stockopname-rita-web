import { cn } from "@/lib/utils";
import type { ImportPhase } from "./use-import-job";

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / 1024 ** exponent;

  return `${size.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/**
 * Indikator satu pekerjaan impor. Fase unggah punya persentase nyata; fase olah
 * di server tidak bisa dipersentasekan karena hanya satu request yang baru
 * menjawab ketika selesai, jadi yang ditampilkan detik berjalan.
 */
export function ImportProgressPanel({
  phase,
  progress,
  loaded,
  total,
  elapsed,
  className,
}: {
  phase: ImportPhase;
  progress: number;
  loaded: number;
  total: number;
  elapsed: number;
  className?: string;
}) {
  if (phase === "idle") return null;

  return (
    <div className={cn("space-y-2 rounded-lg border bg-muted/40 p-4", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">
          {phase === "uploading" ? "Mengunggah berkas…" : "Memproses di server…"}
        </span>
        <span className="tabular-nums text-muted-foreground">{elapsed}s</span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Progres impor master data"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={phase === "uploading" && progress >= 0 ? progress : undefined}
      >
        <div
          className={
            phase === "uploading"
              ? "h-full rounded-full bg-primary transition-[width] duration-200"
              : "h-full w-1/3 animate-pulse rounded-full bg-primary"
          }
          style={phase === "uploading" ? { width: `${Math.max(progress, 5)}%` } : undefined}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {phase === "uploading"
          ? `${formatBytes(loaded)} dari ${formatBytes(total)}`
          : "Jangan tutup atau muat ulang halaman. Impor puluhan ribu baris bisa berjalan beberapa menit."}
      </p>
    </div>
  );
}
