import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CoordinatorDetailButton({
  sessionId,
  coordinatorId,
}: {
  sessionId: string;
  coordinatorId: number;
}) {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate(`/stock-opname/sesi/${sessionId}/coordinator/${coordinatorId}`)}>
      Detail
    </Button>
  );
}
