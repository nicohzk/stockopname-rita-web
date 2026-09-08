import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { StockOpnameTable } from "./result/so-table";
import { columns as columnsStockOpname } from "./result/so-table-column";
import { stockOpnameDummy } from "@/data/stock-opname";
import { coordinatorDummy } from "@/data/coordinator";
import { inspectorDummy } from "@/data/inspector";
import { columns as columnsInspector } from "./inspector/inspector-table.column";
import { InspectorTable } from "./inspector/inspector-table";

export default function CoorPage() {
  const { sessionId } = useParams();
  const { coorId } = useParams();
  const coor = coordinatorDummy.find((coor) => coor.id === Number(coorId));
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="mb-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{coor?.code || "Unknown"}</h1>
            <p>{coor?.status || "Unknown Status"}</p>
          </div>
          <div className="flex gap-5">
            <div className="flex gap-2">
              <Button variant="default">Done</Button>
              <Button variant="destructive">Cancel</Button>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate(`/stock-opname/sesi/${sessionId}`)}
            >
              Back
            </Button>
          </div>
        </div>
        <Separator className="mt-2" />
      </div>
      <div className="grid gap-5 md:grid-cols-3 mb-5">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p>75%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Rak</CardTitle>
          </CardHeader>
          <CardContent>
            <p>35/47</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Barang</CardTitle>
          </CardHeader>
          <CardContent>
            <p>120</p>
          </CardContent>
        </Card>
      </div>
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Data Inspektur</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <InspectorTable columns={columnsInspector} data={inspectorDummy} />
        </CardContent>
      </Card>
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Data Barang Stock Opname</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <StockOpnameTable
            columns={columnsStockOpname}
            data={stockOpnameDummy}
          />
        </CardContent>
      </Card>
    </div>
  );
}
