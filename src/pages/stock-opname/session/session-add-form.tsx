import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useState, type SubmitEvent } from "react";
import type { ImportResult } from "@/types/product";
import type { SessionCreateRequest } from "@/types/session";
import { ImportProgressPanel } from "./product/import-progress";
import { useImportJob, type ImportCallbacks, type ImportPhase } from "./product/use-import-job";

type SessionFiles = { produk: File; barcode: File };

function submitLabel(phase: ImportPhase, sessionId: number | null, dryRun: boolean): string {
  if (phase === "uploading") return "Mengunggah…";
  if (phase === "processing") return "Memproses…";
  if (sessionId !== null) return "Coba Impor Lagi";
  return dryRun ? "Buat Sesi & Validasi" : "Buat Sesi";
}

export default function SessionAddForm({
  onCreate,
  onImport,
  onFinished,
  onClose,
}: {
  onCreate: (data: SessionCreateRequest) => Promise<number>;
  onImport: (sessionId: number, files: SessionFiles, dryRun: boolean, callbacks: ImportCallbacks) => Promise<ImportResult>;
  onFinished: (sessionId: number) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<SessionCreateRequest>({
    code: "",
    location: "",
    coordinators: [{ code: "", rackStart: 1, rackEnd: 1 }],
  });
  const [produk, setProduk] = useState<File | null>(null);
  const [barcode, setBarcode] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [validationError, setValidationError] = useState<string>();
  const job = useImportJob();
  const { showToast } = useToast();

  const files: SessionFiles | null = produk && barcode ? { produk, barcode } : null;

  const handleNext = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = step1.code.trim();
    const location = step1.location.trim();
    const coordinators = step1.coordinators
      .map((coordinator) => ({
        code: coordinator.code.trim(),
        rackStart: coordinator.rackStart,
        rackEnd: coordinator.rackEnd,
      }))
      .filter((coordinator) => coordinator.code !== "");

    const invalidRange = coordinators.some(
      (coordinator) =>
        !Number.isInteger(coordinator.rackStart) ||
        !Number.isInteger(coordinator.rackEnd) ||
        coordinator.rackStart < 1 ||
        coordinator.rackEnd < coordinator.rackStart ||
        coordinator.rackEnd - coordinator.rackStart + 1 > 200,
    );

    if (!code || !location || coordinators.length === 0 || invalidRange) {
      const message =
        "Kode, lokasi, minimal satu koordinator, dan range rak yang valid (1–200 rak) wajib diisi.";
      setValidationError(message);
      showToast(message, "error");
      return;
    }

    setValidationError(undefined);
    setStep1({ code, location, coordinators });
    setStep(2);
  };

  // Sesi harus ada lebih dulu: validasi impor di backend membaca sesi yang
  // bersangkutan, jadi dry-run tidak bisa dijalankan pada sesi yang belum lahir.
  const createAndRun = async (dryRunMode: boolean) => {
    if (!files) return;

    job.start();
    try {
      const id = await onCreate(step1);
      setSessionId(id);
      const res = await onImport(id, files, dryRunMode, job.callbacks);
      setResult(res);
      if (dryRunMode) {
        showToast("Validasi selesai. Sesi dibuat tanpa produk.");
      } else {
        onFinished(id);
      }
    } catch {
      // onCreate/onImport sudah menampilkan toast-nya sendiri.
    } finally {
      job.stop();
    }
  };

  const runImport = async (id: number, dryRunMode: boolean) => {
    if (!files) return;

    job.start();
    try {
      const res = await onImport(id, files, dryRunMode, job.callbacks);
      setResult(res);
      if (!dryRunMode) onFinished(id);
    } catch {
      // Toast dari onImport.
    } finally {
      job.stop();
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files) {
      const message = "File PRODUK.DBF dan BARCODE.DBF wajib diisi.";
      setValidationError(message);
      showToast(message, "error");
      return;
    }

    setValidationError(undefined);
    if (sessionId !== null) {
      await runImport(sessionId, dryRun);
      return;
    }
    await createAndRun(dryRun);
  };

  const handleImportNow = () => {
    if (sessionId !== null) void runImport(sessionId, false);
  };

  return (
    <form className="space-y-4" onSubmit={step === 1 ? handleNext : (e) => void handleSubmit(e)} aria-busy={job.busy}>
      {step === 1 ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="code">Kode</Label>
            <Input id="code" value={step1.code} onChange={(e) => setStep1({ ...step1, code: e.target.value })} maxLength={20} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input id="location" value={step1.location} onChange={(e) => setStep1({ ...step1, location: e.target.value })} maxLength={100} required />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-60">
            <Label>Koordinator &amp; Range Rak</Label>
            <p className="text-muted-foreground text-xs">
              Nama rak boleh sama antar koordinator; setiap koordinator memiliki rak sendiri.
            </p>
            {step1.coordinators.map((coordinator, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Kode koordinator ${index + 1}`}
                  maxLength={20}
                  value={coordinator.code}
                  onChange={(e) => {
                    const next = [...step1.coordinators];
                    next[index] = { ...next[index], code: e.target.value };
                    setStep1({ ...step1, coordinators: next });
                  }}
                />
                <Input
                  type="number"
                  min={1}
                  className="w-32 shrink-0"
                  placeholder="Dari"
                  value={coordinator.rackStart}
                  onChange={(e) => {
                    const next = [...step1.coordinators];
                    next[index] = { ...next[index], rackStart: Number(e.target.value) };
                    setStep1({ ...step1, coordinators: next });
                  }}
                />
                <Input
                  type="number"
                  min={coordinator.rackStart}
                  className="w-32 shrink-0"
                  placeholder="Sampai"
                  value={coordinator.rackEnd}
                  onChange={(e) => {
                    const next = [...step1.coordinators];
                    next[index] = { ...next[index], rackEnd: Number(e.target.value) };
                    setStep1({ ...step1, coordinators: next });
                  }}
                />
                {step1.coordinators.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep1({ ...step1, coordinators: step1.coordinators.filter((_, i) => i !== index) })}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep1({ ...step1, coordinators: [...step1.coordinators, { code: "", rackStart: 1, rackEnd: 1 }] })}
            >
              + Tambah Koordinator
            </Button>
          </div>

          {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}

          <Button type="submit" className="w-full">
            Lanjut
          </Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            {sessionId === null
              ? `Sesi ${step1.code} siap dibuat. Import produk wajib untuk membuat sesi bisa dipakai.`
              : `Sesi ${step1.code} sudah dibuat dan belum punya produk.`}
          </p>

          {result === null && (
            <>
              <div className="space-y-2">
                <Label htmlFor="produk-file">PRODUK.DBF</Label>
                <Input id="produk-file" type="file" accept=".dbf,.DBF" disabled={job.busy} onChange={(e) => setProduk(e.target.files?.[0] ?? null)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode-file">BARCODE.DBF</Label>
                <Input id="barcode-file" type="file" accept=".dbf,.DBF" disabled={job.busy} onChange={(e) => setBarcode(e.target.files?.[0] ?? null)} required />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={dryRun} disabled={job.busy} onChange={(e) => setDryRun(e.target.checked)} />
                Dry-run (validasi saja, tidak menulis)
              </label>
            </>
          )}

          <ImportProgressPanel phase={job.phase} progress={job.progress} loaded={job.bytes.loaded} total={job.bytes.total} elapsed={job.elapsed} />

          {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}

          {result === null ? (
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={job.busy}>
                Kembali
              </Button>
              <Button type="submit" className="flex-1" disabled={job.busy}>
                {submitLabel(job.phase, sessionId, dryRun)}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
                <p>
                  Inserted: <b>{result.products_inserted}</b> · Updated: <b>{result.products_updated}</b> · Unchanged: <b>{result.products_unchanged}</b>
                </p>
                <p>
                  Barcode ditambah: <b>{result.barcodes_added}</b> · dihapus: <b>{result.barcodes_removed}</b>
                </p>
                {result.invalid_rows.length > 0 && <p className="text-destructive">{result.invalid_rows.length} baris invalid</p>}
                {result.orphan_barcodes.length > 0 && <p className="text-muted-foreground">{result.orphan_barcodes.length} barcode tanpa PLU</p>}
                {result.products_without_barcode.length > 0 && <p className="text-muted-foreground">{result.products_without_barcode.length} produk tanpa barcode</p>}
              </div>

              <p className="text-xs text-muted-foreground">
                Angka di atas belum menulis apa pun. Klik "Impor Sekarang" untuk menyimpannya, atau "Tutup" lalu impor nanti dari halaman Master Produk.
              </p>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={job.busy}>
                  Tutup
                </Button>
                <Button type="button" className="flex-1" onClick={handleImportNow} disabled={job.busy}>
                  {job.busy ? "Mengimpor…" : "Impor Sekarang"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </form>
  );
}
