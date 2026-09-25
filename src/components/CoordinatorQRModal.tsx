import { useRef, useState, type Ref } from "react";
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
  sessionCode?: string;
  sessionLocation?: string;
};

type CoordinatorQRFigureProps = {
  coordinator: CoordinatorQRInfo;
  size?: number;
  svgRef?: Ref<SVGSVGElement>;
  showMeta?: boolean;
};

export function CoordinatorQRFigure({
  coordinator,
  size = 256,
  svgRef,
  showMeta = true,
}: CoordinatorQRFigureProps) {
  const qrValue = formatCoordinatorQR(coordinator.id);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/10 dark:ring-white/10">
        <QRCodeSVG
          ref={svgRef}
          value={qrValue}
          size={size}
          level="M"
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

function printCoordinatorQR(coordinator: CoordinatorQRInfo, svg: SVGSVGElement) {
  const svgHtml = new XMLSerializer().serializeToString(svg);
  const win = window.open("", "_blank", "width=480,height=640");
  if (!win) throw new Error("Popup diblokir. Izinkan popup untuk mencetak.");
  win.document.write(`<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>QR ${coordinator.code}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; display: flex; min-height: 100vh; align-items: center; justify-content: center; font-family: sans-serif; background: #fff; color: #000; }
  .wrap { text-align: center; padding: 24px; }
  svg { width: 320px; height: 320px; }
  h1 { font-size: 22px; margin: 16px 0 4px; }
  @media print { body { min-height: auto; } }
</style>
</head>
<body>
  <div class="wrap">
    ${svgHtml}
    <h1>${coordinator.code}</h1>
  </div>
</body>
</html>`);
  win.document.close();
  win.focus();
  // Tunggu SVG ter-render sebelum print.
  win.onload = () => {
    win.print();
  };
  window.setTimeout(() => {
    try {
      win.print();
    } catch {
      // Abaikan; user bisa print manual via Ctrl+P.
    }
  }, 500);
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
  const svgRef = useRef<SVGSVGElement>(null);
  const { showToast } = useToast();
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    if (!coordinator || !svgRef.current || printing) return;
    setPrinting(true);
    try {
      printCoordinatorQR(coordinator, svgRef.current);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal mencetak QR.",
        "error",
      );
    } finally {
      setPrinting(false);
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
              svgRef={svgRef}
            />
            <div className="w-full">
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePrint}
                disabled={printing}
              >
                <Printer />
                Print
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
