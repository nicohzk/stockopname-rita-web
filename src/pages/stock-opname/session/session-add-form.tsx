import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useState, type SubmitEvent } from "react";
import type { SessionCreateRequest } from "@/types/session";

export default function SessionAddForm({ onSubmit }: { onSubmit: (data: SessionCreateRequest) => Promise<void> }) {
  const [coordinatorCodes, setCoordinatorCodes] = useState<string[]>([""]);
  const [validationError, setValidationError] = useState<string>();
  const { showToast } = useToast();
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = String(formData.get("code")).trim();
    const location = String(formData.get("location")).trim();
    const codes = coordinatorCodes.map((c) => c.trim()).filter(Boolean);
    if (!code || !location || codes.length === 0) {
      const message = "Kode, lokasi, dan minimal satu kode koordinator wajib diisi.";
      setValidationError(message);
      showToast(message, "error");
      return;
    }
    setValidationError(undefined);
    await onSubmit({ code, location, coordinatorCodes: codes });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="code">Kode</Label>
        <Input id="code" name="code" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Lokasi</Label>
        <Input id="location" name="location" required />
      </div>

      <div className="space-y-2 overflow-y-auto max-h-60">
        <Label htmlFor="coordinatorCodes">Kode Koordinator</Label>

        {coordinatorCodes.map((code, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Kode koordinator ${index + 1}`}
              value={code}
              onChange={(e) => {
                const newCodes = [...coordinatorCodes];
                newCodes[index] = e.target.value;
                setCoordinatorCodes(newCodes);
              }}
            />

            {coordinatorCodes.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCoordinatorCodes(
                    coordinatorCodes.filter((_, i) => i !== index),
                  );
                }}
              >
                Hapus
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => setCoordinatorCodes([...coordinatorCodes, ""])}
        >
          + Tambah Koordinator
        </Button>
      </div>

      {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}

      <Button type="submit" className="w-full">
        Tambah Sesi
      </Button>
    </form>
  );
}
