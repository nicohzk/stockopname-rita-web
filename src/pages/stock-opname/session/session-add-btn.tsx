import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import SessionAddForm from "./session-add-form";
import { useState } from "react";
import type { ImportResult } from "@/types/product";
import type { SessionCreateRequest } from "@/types/session";
import type { ImportCallbacks } from "./product/use-import-job";

type SessionFiles = { produk: File; barcode: File };

export default function SessionAddBtn({
  onCreate,
  onImport,
  onFinished,
}: {
  onCreate: (data: SessionCreateRequest) => Promise<number>;
  onImport: (sessionId: number, files: SessionFiles, dryRun: boolean, callbacks: ImportCallbacks) => Promise<ImportResult>;
  onFinished: (sessionId: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Tambah Sesi</Button>} />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Sesi</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
        <SessionAddForm
          onCreate={onCreate}
          onImport={onImport}
          onFinished={(sessionId) => {
            setOpen(false);
            onFinished(sessionId);
          }}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
