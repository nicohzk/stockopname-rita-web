import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-date";
import type { Session } from "@/types/session";

type SessionWithProgress = Session & { progress: number | null };

type DashboardSessionTableProps = {
  sessions: SessionWithProgress[];
};

function ProgressBadge({ progress }: { progress: number | null }) {
  if (progress === null) return <span className="text-muted-foreground">-</span>;

  const color = progress === 100
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${progress === 100 ? "bg-green-500" : "bg-yellow-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${color}`}>
        {progress}%
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: Session["status"] }) {
  const styles = {
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const labels = {
    IN_PROGRESS: "Proses",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function DashboardSessionTable({ sessions }: DashboardSessionTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Sesi Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada sesi.</p>
        ) : (
          <div className="max-h-[calc(100vh-23rem)] overflow-y-auto space-y-3 pr-1">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{session.code}</span>
                    <StatusBadge status={session.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{session.location}</p>
                  {session.startedAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(session.startedAt)}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {(session.status === "COMPLETED" || (session.status === "IN_PROGRESS" && session.progress !== null && session.progress > 0)) && (
                    <ProgressBadge progress={session.progress} />
                  )}
                  {session.status === "CANCELLED" && (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
