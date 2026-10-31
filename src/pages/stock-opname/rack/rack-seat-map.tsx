import { useState } from "react";
import { CheckIcon, LayoutGridIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Rack } from "@/types/rack";

export function RackSeatMap({ racks }: { racks: Rack[] }) {
  const [open, setOpen] = useState(false);
  const uploaded = racks.filter((rack) => rack.uploadedAt).length;
  const sorted = [...racks].sort((a, b) =>
    a.name.localeCompare(b.name, "id", { numeric: true }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" disabled={racks.length === 0}>
            <LayoutGridIcon />
            Peta Rak
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Peta Rak</DialogTitle>
          <DialogDescription>
            {uploaded} dari {racks.length} rak terupload.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-emerald-500/40 bg-emerald-500/20" />
            Terupload
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-dashed border-border bg-muted" />
            Belum diupload
          </span>
        </div>

        <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5 md:grid-cols-6">
          {sorted.map((rack) => {
            const isUploaded = Boolean(rack.uploadedAt);

            return (
              <div
                key={rack.id}
                title={`${rack.name} — ${isUploaded ? "terupload" : "belum diupload"}`}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-medium",
                  isUploaded
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-dashed border-border bg-muted/40 text-muted-foreground",
                )}
              >
                {isUploaded ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <span className="size-4 rounded-full border border-dashed border-current" />
                )}
                <span className="w-full truncate px-1 text-center">{rack.name}</span>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
