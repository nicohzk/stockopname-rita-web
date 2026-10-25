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
  const [step1, setStep1] = useState<SessionCreateRequest>({ code: "", location: "", coordinatorCodes: [""] });
  const [produk, setProduk] = useState<File | null>(null);
  const [barcode, setBarcode] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>();
  const { showToast } = useToast();

  const handleNext = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = step1.code.trim();
    const location = step1.location.trim();
    const codes = step1.coordinatorCodes.map((c) => c.trim()).filter(Boolean);
    if (!code || !location || codes.length === 0) {
      const message = "Kode, lokasi, dan minimal satu kode koordinator wajib diisi.";
      setValidationError(message);
      showToast(message, "error");
      return;
    }
    setValidationError(undefined);
    setStep1({ code, location, coordinatorCodes: codes });
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
            <Label>Kode Koordinator</Label>
            {step1.coordinatorCodes.map((code, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Kode koordinator ${index + 1}`}
                  value={code}
                  onChange={(e) => {
                    const next = [...step1.coordinatorCodes];
                    next[index] = e.target.value;
                    setStep1({ ...step1, coordinatorCodes: next });
                  }}
                />
                {step1.coordinatorCodes.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep1({ ...step1, coordinatorCodes: step1.coordinatorCodes.filter((_, i) => i !== index) })}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep1({ ...step1, coordinatorCodes: [...step1.coordinatorCodes, ""] })}
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
