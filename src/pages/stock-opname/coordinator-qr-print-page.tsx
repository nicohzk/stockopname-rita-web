import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Printer, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format-date";
import { getCoordinators } from "@/services/coordinator.service";
import { getSession } from "@/services/session.service";
import type { Coordinator } from "@/types/coordinator";
import type { Session } from "@/types/session";
import { formatCoordinatorQR } from "@/utils/coordinatorQr";

const printStyles = `
@page {
  size: 105mm 148mm;
  margin: 0;
}
.qr-label {
  width: 105mm;
  height: 148mm;
  padding: 7mm;
  box-sizing: border-box;
  background: #fff;
  color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
  page-break-after: always;
  break-after: page;
}
.qr-label:last-child {
  page-break-after: auto;
  break-after: auto;
}
.qr-label__brand {
  margin: 0;
  font-size: 12pt;
  font-weight: 700;
  letter-spacing: 1.5pt;
}
.qr-label__rule {
  width: 100%;
  border-top: 0.6mm solid #000;
  margin: 2mm 0 3mm;
}
.qr-label__session {
  margin: 0;
  font-size: 16pt;
  font-weight: 700;
}
.qr-label__location {
  margin: 1mm 0 0;
  font-size: 10pt;
}
.qr-label__qr {
  margin: 4mm 0 3mm;
}
.qr-label__qr svg {
  display: block;
  width: 62mm;
  height: 62mm;
}
.qr-label__code {
  margin: 0;
  font-size: 24pt;
  font-weight: 700;
  line-height: 1.1;
}
.qr-label__payload {
  margin: 1mm 0 0;
  font-family: "Courier New", monospace;
  font-size: 9pt;
  letter-spacing: 0.5pt;
}
.qr-label__hint {
  margin: 3mm 0 0;
  font-size: 9pt;
  line-height: 1.35;
}
.qr-label__printed {
  margin-top: auto;
  padding-top: 2mm;
  font-size: 7pt;
  color: #444;
}
@media screen {
  .print-preview {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    background: #e2e8f0;
    min-height: 100vh;
  }
  .qr-label {
    box-shadow: 0 1px 3px rgb(0 0 0 / 15%);
  }
}
@media print {
  html,
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-toolbar {
    display: none !important;
  }
  .print-preview {
    display: block;
    padding: 0;
    margin: 0;
    background: #fff;
    min-height: auto;
  }
  .qr-label {
    box-shadow: none;
    margin: 0;
  }
}
`;

function CoordinatorQRLabel({
  coordinator,
  session,
  printedAt,
}: {
  coordinator: Coordinator;
  session: Session;
  printedAt: string;
}) {
  const payload = formatCoordinatorQR(coordinator.id);
  return (
    <article className="qr-label">
      <p className="qr-label__brand">STOCK OPNAME RITA</p>
      <div className="qr-label__rule" />
      <p className="qr-label__session">{session.code}</p>
      <p className="qr-label__location">{session.location}</p>
      <div className="qr-label__qr">
        <QRCodeSVG
          value={payload}
          size={240}
          level="H"
          marginSize={2}
          bgColor="#FFFFFF"
          fgColor="#000000"
          role="img"
          aria-label={`QR koordinator ${coordinator.code}`}
        />
      </div>
      <p className="qr-label__code">{coordinator.code}</p>
      <p className="qr-label__payload">{payload}</p>
      <p className="qr-label__hint">
        Scan dari aplikasi
        <br />
        Stock Scanner Rita
      </p>
      <p className="qr-label__printed">Dicetak: {printedAt}</p>
    </article>
  );
}

export default function CoordinatorQRPrintPage() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const id = Number(sessionId);
  const coordinatorId = Number(searchParams.get("coordinatorId"));
  const all = searchParams.get("all") === "1";
  const shouldAutoPrint = searchParams.get("auto") === "1";

  const [session, setSession] = useState<Session>();
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [printedAt] = useState(() => formatDateTime(new Date().toISOString()));
  const printed = useRef(false);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setError("ID sesi tidak valid.");
      setLoading(false);
      return;
    }
    Promise.all([getSession(id), getCoordinators(id)])
      .then(([loadedSession, loadedCoordinators]) => {
        setSession(loadedSession);
        setCoordinators(loadedCoordinators);
      })
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat data sesi.",
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const labels = useMemo(() => {
    if (!session) return [];
    if (all) {
      return coordinators.filter((coordinator) => coordinator.status === "IN_PROGRESS");
    }
    return coordinators.filter(
      (coordinator) =>
        coordinator.id === coordinatorId && coordinator.status === "IN_PROGRESS",
    );
  }, [all, coordinatorId, coordinators, session]);

  useEffect(() => {
    if (!shouldAutoPrint || loading || error || labels.length === 0 || printed.current) return;
    printed.current = true;
    const timer = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(timer);
  }, [error, labels.length, loading, shouldAutoPrint]);

  const handlePrint = () => window.print();
  const handleClose = () => window.close();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm">
        Memuat label QR...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (labels.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-sm">
        QR hanya bisa dicetak untuk koordinator berstatus In Progress.
      </div>
    );
  }

  return (
    <>
      <style>{printStyles}</style>
      <div className="print-toolbar sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b bg-background px-4 py-3">
        <div>
          <p className="font-semibold">Label QR Koordinator</p>
          <p className="text-muted-foreground text-xs">
            {labels.length} label · ukuran A6 (105 × 148 mm)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            <X />
            Tutup
          </Button>
          <Button onClick={handlePrint}>
            <Printer />
            Cetak
          </Button>
        </div>
      </div>
      <div className="print-preview">
        {labels.map((coordinator) => (
          <CoordinatorQRLabel
            key={coordinator.id}
            coordinator={coordinator}
            session={session!}
            printedAt={printedAt}
          />
        ))}
      </div>
    </>
  );
}
