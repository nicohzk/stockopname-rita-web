import { useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { getAdminActor, saveAdminActor } from "@/lib/admin-actor";

export default function AdminActorButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(getAdminActor());
  const { showToast } = useToast();

  const handleSave = () => {
    const actor = saveAdminActor(name);
    setName(actor);
    setOpen(false);
    showToast(`Nama admin disimpan: ${actor}`);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        onClick={() => {
          setName(getAdminActor());
          setOpen(true);
        }}
      >
        <UserRound />
        {getAdminActor()}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nama Admin</DialogTitle>
            <DialogDescription>
              Nama ini dikirim sebagai aktor pada setiap perubahan hasil SO.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="admin-actor">Nama</Label>
            <Input
              id="admin-actor"
              value={name}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Niko"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
