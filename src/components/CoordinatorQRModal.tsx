import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatCoordinatorQR } from "@/utils/coordinatorQr";

export type CoordinatorQRInfo = {
  id: number;
  code: string;
  status: string;
  sessionId: number;
  sessionCode?: string;
  sessionLocation?: string;
};

type CoordinatorQRFigureProps = {
  coordinator: CoordinatorQRInfo;
  size?: number;
  showMeta?: boolean;
};

export function CoordinatorQRFigure({
  coordinator,
  size = 256,
  showMeta = true,
}: CoordinatorQRFigureProps) {
  const qrValue = formatCoordinatorQR(coordinator.id);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/10 dark:ring-white/10">
        <QRCodeSVG
          value={qrValue}
          size={size}
          level="H"
          marginSize={2}
          bgColor="#FFFFFF"
          fgColor="#000000"
          role="img"
          aria-label={`QR koordinator ${coordinator.code}`}
        />
      </div>
      {showMeta && (
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-base font-semibold">{coordinator.code}</p>
          {coordinator.sessionCode && <p className="text-muted-foreground text-xs">{coordinator.sessionCode}{coordinator.sessionLocation ? ` · ${coordinator.sessionLocation}` : ""}</p>}
          <StatusBadge status={coordinator.status} />
        </div>
      )}
    </div>
  );
}

function openCoordinatorQRPrint(coordinator: CoordinatorQRInfo) {
  const url = `/stock-opname/sesi/${coordinator.sessionId}/print-qr?coordinatorId=${coordinator.id}&auto=1`;
  const win = window.open(url, "_blank");
  if (!win) throw new Error("Popup diblokir. Izinkan popup untuk mencetak.");
}

type CoordinatorQRModalProps = {
  coordinator: CoordinatorQRInfo | null;
  open: boolean;
  onClose: () => void;
};

export default function CoordinatorQRModal({
  coordinator,
  open,
  onClose,
}: CoordinatorQRModalProps) {
  const { showToast } = useToast();

  const handlePrint = () => {
    if (!coordinator) return;
    try {
      openCoordinatorQRPrint(coordinator);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal mencetak QR.",
        "error",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Koordinator</DialogTitle>
          <DialogDescription>
            Pindai dari HP untuk join.
          </DialogDescription>
        </DialogHeader>
        {coordinator && (
          <div className="flex flex-col items-center gap-4">
            <CoordinatorQRFigure
              coordinator={coordinator}
              size={256}
            />
            <div className="w-full">
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePrint}
              >
                <Printer />
                Cetak Label
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
