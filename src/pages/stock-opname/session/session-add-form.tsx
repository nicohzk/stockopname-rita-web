import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useState, type SubmitEvent } from "react";
import type { SessionCreateRequest } from "@/types/session";

export default function SessionAddForm({
  onSubmit,
}: {
  onSubmit: (data: SessionCreateRequest, produk: File, barcode: File) => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<SessionCreateRequest>({
    code: "",
    location: "",
    coordinators: [{ code: "", rackStart: 1, rackEnd: 1 }],
  });
  const [produk, setProduk] = useState<File | null>(null);
  const [barcode, setBarcode] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>();
  const { showToast } = useToast();

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
    const sorted = [...coordinators].sort((a, b) => a.rackStart - b.rackStart);
    const overlapping = sorted.some(
      (coordinator, index) =>
        index > 0 && coordinator.rackStart <= sorted[index - 1].rackEnd,
    );

    if (!code || !location || coordinators.length === 0 || invalidRange) {
      const message =
        "Kode, lokasi, minimal satu koordinator, dan range rak yang valid (1–200 rak) wajib diisi.";
      setValidationError(message);
      showToast(message, "error");
      return;
    }
    if (overlapping) {
      const message = "Range rak antar koordinator tidak boleh overlap.";
      setValidationError(message);
      showToast(message, "error");
      return;
    }
    setValidationError(undefined);
    setStep1({ code, location, coordinators });
    setStep(2);
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!produk || !barcode) {
      const message = "File PRODUK.DBF dan BARCODE.DBF wajib diisi.";
      setValidationError(message);
      showToast(message, "error");
      return;
    }
    setValidationError(undefined);
    await onSubmit(step1, produk, barcode);
  };

  return (
    <form className="space-y-4" onSubmit={step === 1 ? handleNext : (e) => void handleSubmit(e)}>
      {step === 1 ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="code">Kode</Label>
            <Input id="code" value={step1.code} onChange={(e) => setStep1({ ...step1, code: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input id="location" value={step1.location} onChange={(e) => setStep1({ ...step1, location: e.target.value })} required />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-60">
            <Label>Koordinator &amp; Range Rak</Label>
            {step1.coordinators.map((coordinator, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Kode koordinator ${index + 1}`}
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
                  className="w-24"
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
                  className="w-24"
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
            Sesi {step1.code} siap dibuat. Import produk wajib untuk membuat sesi bisa dipakai.
          </p>
          <div className="space-y-2">
            <Label htmlFor="produk-file">PRODUK.DBF</Label>
            <Input id="produk-file" type="file" accept=".dbf,.DBF" onChange={(e) => setProduk(e.target.files?.[0] ?? null)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barcode-file">BARCODE.DBF</Label>
            <Input id="barcode-file" type="file" accept=".dbf,.DBF" onChange={(e) => setBarcode(e.target.files?.[0] ?? null)} required />
          </div>

          {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Kembali
            </Button>
            <Button type="submit" className="flex-1">
              Buat Sesi
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
