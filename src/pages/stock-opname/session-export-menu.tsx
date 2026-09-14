import { useState } from "react";
import { ChevronDown, Database, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import {
  downloadSessionDbf,
  downloadSessionExcel,
  openSessionReport,
} from "@/services/report.service";

type ExportKind = "pdf" | "excel" | "dbf";

export default function SessionExportMenu({
  sessionId,
  sessionCode,
}: {
  sessionId: number;
  sessionCode: string;
}) {
  const [busy, setBusy] = useState<ExportKind | null>(null);
  const { showToast } = useToast();

  const handleExport = async (kind: ExportKind) => {
    if (busy) return;
    setBusy(kind);
    try {
      if (kind === "pdf") await openSessionReport(sessionId);
      else if (kind === "excel")
        await downloadSessionExcel(sessionId, `${sessionCode}.xlsx`);
      else await downloadSessionDbf(sessionId, `${sessionCode}.dbf`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal mengekspor laporan.",
        "error",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" disabled={busy !== null}>
            <Download />
            {busy ? "Menyiapkan..." : "Export"}
            <ChevronDown />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={busy !== null}
          onClick={() => void handleExport("pdf")}
        >
          <FileText />
          {busy === "pdf" ? "Membuat PDF..." : "Cetak PDF"}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={busy !== null}
          onClick={() => void handleExport("excel")}
        >
          <FileSpreadsheet />
          {busy === "excel" ? "Mengekspor Excel..." : "Export Excel"}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={busy !== null}
          onClick={() => void handleExport("dbf")}
        >
          <Database />
          {busy === "dbf" ? "Mengekspor DBF..." : "Export DBF"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
