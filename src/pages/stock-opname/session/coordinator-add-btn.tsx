import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createCoordinator } from "@/services/coordinator.service";

export default function CoordinatorAddButton({
  sessionId,
  disabled = false,
  onCreated,
}: {
  sessionId: number;
  disabled?: boolean;
  onCreated: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [rackStart, setRackStart] = useState("1");
  const [rackEnd, setRackEnd] = useState("1");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const resetForm = () => {
    setCode("");
    setRackStart("1");
    setRackEnd("1");
    setError(undefined);
    setSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) resetForm();
    setOpen(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const start = Number(rackStart);
    const end = Number(rackEnd);
    if (!code.trim()) {
      setError("Kode koordinator wajib diisi.");
      return;
    }
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end - start + 1 > 200) {
      setError("Range rak harus valid dan maksimal 200 rak.");
      return;
    }

    setSubmitting(true);
    setError(undefined);
    try {
      await createCoordinator({ sessionId, code: code.trim(), rackStart: start, rackEnd: end });
      await onCreated();
      showToast("Koordinator berhasil ditambahkan.");
      setOpen(false);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Gagal menambahkan koordinator.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" disabled={disabled}><Plus />Tambah Koordinator</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Koordinator</DialogTitle>
          <DialogDescription>
            Koordinator baru mendapat rak sendiri. Nama rak boleh sama dengan koordinator lain.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="new-coordinator-code">Kode Koordinator</Label>
            <Input
              id="new-coordinator-code"
              value={code}
              maxLength={20}
              onChange={(event) => { setCode(event.target.value); setError(undefined); }}
              placeholder="Contoh: KOR-03"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="new-coordinator-start">Rak dari</Label>
              <Input
                id="new-coordinator-start"
                type="number"
                min={1}
                value={rackStart}
                onChange={(event) => { setRackStart(event.target.value); setError(undefined); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-coordinator-end">Rak sampai</Label>
              <Input
                id="new-coordinator-end"
                type="number"
                min={1}
                value={rackEnd}
                onChange={(event) => { setRackEnd(event.target.value); setError(undefined); }}
              />
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menambahkan..." : "Tambah Koordinator"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
