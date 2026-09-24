import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-date";
import { TruncatedText } from "@/components/ui/table";
import type { ProductLastSession } from "@/types/dashboard";

type DashboardOldProductsProps = {
  products: ProductLastSession[];
};

export default function DashboardOldProducts({ products }: DashboardOldProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Paling Lama Tidak Masuk Sesi</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada data.</p>
        ) : (
          <div className="max-h-[calc(100vh-23rem)] overflow-y-auto space-y-2 pr-1">
            {products.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg border">
                <span className="text-xs text-muted-foreground w-6 text-right shrink-0">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <TruncatedText className="font-medium">{product.name}</TruncatedText>
                    <span className="text-xs text-muted-foreground">{product.barcode}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {product.lastSessionDate === "" ? (
                    <span className="text-xs text-yellow-600 font-medium">Belum pernah</span>
                  ) : (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(product.lastSessionDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.lastSessionCode}</p>
                    </div>
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
