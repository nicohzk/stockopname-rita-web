import AuditTimeline from "./audit-timeline";

type AuditSectionProps = {
  refreshKey: number;
  onOpenResult: (term: string) => void;
} & (
  | { sessionId: number; coordinatorId?: never }
  | { coordinatorId: number; sessionId?: never }
);

/** Riwayat perubahan satu sesi atau satu koordinator. */
export default function AuditSection({
  sessionId,
  coordinatorId,
  refreshKey,
  onOpenResult,
}: AuditSectionProps) {
  const key = sessionId !== undefined ? `session-${sessionId}` : `coordinator-${coordinatorId}`;

  return (
    <AuditTimeline
      key={key}
      sessionId={sessionId}
      coordinatorId={coordinatorId}
      refreshKey={refreshKey}
      onOpenResult={onOpenResult}
    />
  );
}
