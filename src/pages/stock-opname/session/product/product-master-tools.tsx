import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { clearProducts, importProducts } from "@/services/product.service";
import type { ImportResult } from "@/types/product";

type ImportPhase = "idle" | "uploading" | "processing";

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / 1024 ** exponent;

  return `${size.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function submitLabel(phase: ImportPhase, progress: number, dryRun: boolean): string {
  if (phase === "uploading") return progress >= 0 ? `Mengunggah ${progress}%` : "Mengunggah…";
  if (phase === "processing") return "Memproses…";
  return dryRun ? "Validasi" : "Import";
}

export function ProductImportCard({ sessionId, onImported }: { sessionId: number; onImported: () => void }) {
  const [produk, setProduk] = useState<File | null>(null);
  const [barcode, setBarcode] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(false);
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [bytes, setBytes] = useState({ loaded: 0, total: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { showToast } = useToast();

  const busy = phase !== "idle";

  // Setelah unggahan selesai, server masih mengolah puluhan ribu baris tanpa
  // mengirim kabar apa pun. Detik berjalan inilah tanda bahwa aplikasi hidup.
  useEffect(() => {
    if (!busy) return;

    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);

    return () => window.clearInterval(timer);
  }, [busy]);

  // Impor besar bisa berjalan menit-menitan; jangan biarkan tab tertutup tanpa
  // peringatan.
  useEffect(() => {
    if (!busy) return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!produk || !barcode) {
      showToast("File PRODUK.DBF dan BARCODE.DBF wajib diisi.", "error");
      return;
    }

    setResult(null);
    setProgress(0);
    setElapsed(0);
    setBytes({ loaded: 0, total: 0 });
    setPhase("uploading");

    try {
      const res = await importProducts(produk, barcode, sessionId, dryRun, {
        onUploadProgress: (next) => {
          setBytes({ loaded: next.loaded, total: next.total });
          if (next.percent >= 0) setProgress(next.percent);
          // Sebagian browser tidak memicu onUploadComplete; persen 100 dipakai
          // sebagai penanda yang sama.
          if (next.percent >= 100) setPhase("processing");
        },
        onUploadComplete: () => setPhase("processing"),
      });
      setResult(res);
      showToast(dryRun ? "Validasi dry-run selesai." : "Master data berhasil diimpor.");
      if (!dryRun) onImported();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal mengimpor master data.", "error");
    } finally {
      setPhase("idle");
    }
  };

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Import Master (DBF)</CardTitle>
        <CardDescription>Upload PRODUK.DBF dan BARCODE.DBF. Centang dry-run untuk validasi tanpa menulis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} aria-busy={busy}>
          <div className="space-y-2">
            <Label htmlFor="produk-file">PRODUK.DBF</Label>
            <Input id="produk-file" type="file" accept=".dbf,.DBF" disabled={busy} onChange={(e) => setProduk(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barcode-file">BARCODE.DBF</Label>
            <Input id="barcode-file" type="file" accept=".dbf,.DBF" disabled={busy} onChange={(e) => setBarcode(e.target.files?.[0] ?? null)} />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={dryRun} disabled={busy} onChange={(e) => setDryRun(e.target.checked)} />
            Dry-run (validasi saja, tidak menulis)
          </label>

          {busy && (
            <div className="space-y-2 rounded-lg border bg-muted/40 p-4 sm:col-span-2">
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
                  ? `${formatBytes(bytes.loaded)} dari ${formatBytes(bytes.total)}`
                  : "Jangan tutup atau muat ulang halaman. Impor puluhan ribu baris bisa berjalan beberapa menit."}
              </p>
            </div>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy || !produk || !barcode}>
              {submitLabel(phase, progress, dryRun)}
            </Button>
          </div>
        </form>
        {result && (
          <div className="mt-4 space-y-2 text-sm">
            <p>Inserted: <b>{result.products_inserted}</b> · Updated: <b>{result.products_updated}</b> · Unchanged: <b>{result.products_unchanged}</b></p>
            <p>Barcode ditambah: <b>{result.barcodes_added}</b> · dihapus: <b>{result.barcodes_removed}</b>{result.dry_run ? " · (dry-run)" : ""}</p>
            {result.invalid_rows.length > 0 && (
              <div>
                <p className="font-semibold">Baris invalid ({result.invalid_rows.length}):</p>
                <ul className="max-h-32 list-disc overflow-y-auto pl-5">
                  {result.invalid_rows.slice(0, 20).map((r, i) => <li key={i}>{r.file}:{r.line} [{r.plu}] {r.reason}</li>)}
                </ul>
              </div>
            )}
            {result.orphan_barcodes.length > 0 && <p className="text-muted-foreground">Orphan barcode: {result.orphan_barcodes.slice(0, 10).join(", ")}{result.orphan_barcodes.length > 10 ? "…" : ""}</p>}
            {result.products_without_barcode.length > 0 && <p className="text-muted-foreground">Tanpa barcode: {result.products_without_barcode.slice(0, 10).join(", ")}{result.products_without_barcode.length > 10 ? "…" : ""}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProductClearCard({ sessionId, onCleared }: { sessionId: number; onCleared: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await clearProducts(sessionId);
      showToast("Master produk sesi ini berhasil dihapus. Riwayat SO tidak berubah.");
      onCleared();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menghapus master data.", "error");
      throw err; // dialog tetap terbuka supaya bisa dicoba lagi
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-5 border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Hapus seluruh master produk + barcode untuk sesi ini. Riwayat stock opname tetap tersimpan (snapshot). Sesi menjadi belum siap sampai ada produk lagi.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setOpen(true)} disabled={loading}>Hapus Semua Produk Sesi Ini</Button>
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="Hapus seluruh master produk sesi ini?"
          description="Produk dan barcode sesi ini akan dihapus permanen. Riwayat SO tidak berubah. Lanjut?"
          confirmLabel="Ya, hapus"
          pendingLabel="Menghapus..."
          destructive
          onConfirm={handleConfirm}
        />
      </CardContent>
    </Card>
  );
}
