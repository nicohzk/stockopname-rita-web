import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StockOpnameSummaryCardsProps = {
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
};

export default function StockOpnameSummaryCards({ totalSessions, completedSessions, inProgressSessions }: StockOpnameSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Sesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalSessions}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Selesai</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{completedSessions}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Proses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-yellow-600">{inProgressSessions}</p>
        </CardContent>
      </Card>
    </div>
  );
}
