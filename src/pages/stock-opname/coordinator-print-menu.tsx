import { useState } from "react";
import { ChevronDown, FileText, Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { openCoordinatorReport } from "@/services/report.service";
import type { CoordinatorStatus } from "@/types/coordinator";

export default function CoordinatorPrintMenu({
  coordinatorId,
  status,
  onShowQR,
}: {
  coordinatorId: number;
  status: CoordinatorStatus;
  onShowQR: () => void;
}) {
  const [printing, setPrinting] = useState<"pdf" | "pdf-carton" | null>(null);
  const { showToast } = useToast();
  const qrEnabled = status === "IN_PROGRESS";

  const handlePrintPdf = async (includeCarton: boolean) => {
    if (printing) return;
    setPrinting(includeCarton ? "pdf-carton" : "pdf");
    try {
      await openCoordinatorReport(coordinatorId, includeCarton);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal membuat PDF.",
        "error",
      );
    } finally {
      setPrinting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <Printer />
            Cetak / QR
            <ChevronDown />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!qrEnabled} onClick={onShowQR}>
          <QrCode />
          Lihat QR
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={printing !== null}
          onClick={() => void handlePrintPdf(false)}
        >
          <FileText />
          {printing === "pdf" ? "Membuat PDF..." : "Cetak PDF"}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={printing !== null}
          onClick={() => void handlePrintPdf(true)}
        >
          <FileText />
          {printing === "pdf-carton" ? "Membuat PDF + Karton..." : "Cetak PDF + Karton"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
