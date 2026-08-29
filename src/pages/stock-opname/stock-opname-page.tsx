import { Separator } from "@/components/ui/separator";
import { columns } from "./session/session-table-column";
import { SessionTable } from "./session/session-table";
import { sessionsDummy } from "@/data/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StockOpnamePage() {
  return (
    <div className="p-4">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Stock Opname</h1>
        <p>Welcome to the stock opname page!</p>
        <Separator className="mt-2" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sesi Stock Opname</CardTitle>
          <CardDescription>
            Kelola sesi stock opname. Buat sesi baru, lihat sesi yang sudah ada,
            dan pantau progresnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionTable columns={columns} data={sessionsDummy} />
        </CardContent>
      </Card>
    </div>
  );
}
