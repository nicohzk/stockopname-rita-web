import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SummaryCardsProps = {
  totalProducts: number;
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
};

export default function DashboardSummaryCards({ totalProducts, totalSessions, completedSessions, inProgressSessions }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </CardContent>
      </Card>
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
