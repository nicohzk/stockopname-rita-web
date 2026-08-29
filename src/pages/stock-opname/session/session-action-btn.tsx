import { Button } from "@/components/ui/button";
import type { Session } from "@/types/session";
import { useNavigate } from "react-router-dom";

export function SessionActionButton({ session }: { session: Session }) {
  const navigate = useNavigate();
  const isActive = session.status === "IN_PROGRESS";

  return (
    <Button variant={isActive ? "outline" : "secondary"} size="sm"
    onClick={() => navigate(`/stock-opname/${session.id}`)}>
      {isActive ? "Masuk Sesi" : "Lihat Detail"}
    </Button>
  );
}
