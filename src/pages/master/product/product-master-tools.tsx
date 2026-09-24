import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { clearProducts, importProducts } from "@/services/product.service";
import type { ImportResult } from "@/types/product";

export function ProductImportCard() {
  const [produk, setProduk] = useState<File | null>(null);
  const [barcode, setBarcode] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produk || !barcode) {
      showToast("File PRODUK.DBF dan BARCODE.DBF wajib diisi.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await importProducts(produk, barcode, dryRun);
      setResult(res);
      showToast(dryRun ? "Validasi dry-run selesai." : "Master data berhasil diimpor.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal mengimpor master data.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Import Master (DBF)</CardTitle>
        <CardDescription>Upload PRODUK.DBF dan BARCODE.DBF. Centang dry-run untuk validasi tanpa menulis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="produk-file">PRODUK.DBF</Label>
            <Input id="produk-file" type="file" accept=".dbf,.DBF" onChange={(e) => setProduk(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barcode-file">BARCODE.DBF</Label>
            <Input id="barcode-file" type="file" accept=".dbf,.DBF" onChange={(e) => setBarcode(e.target.files?.[0] ?? null)} />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            Dry-run (validasi saja, tidak menulis)
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading || !produk || !barcode}>{loading ? "Memproses..." : dryRun ? "Validasi" : "Import"}</Button>
          </div>
        </form>
        {result && (
          <div className="mt-4 space-y-2 text-sm">
            <p>Inserted: <b>{result.products_inserted}</b> · Updated: <b>{result.products_updated}</b> · Unchanged: <b>{result.products_unchanged}</b></p>
            <p>Barcode ditambah: <b>{result.barcodes_added}</b> · dihapus: <b>{result.barcodes_removed}</b>{result.dry_run ? " · (dry-run)" : ""}</p>
            {result.invalid_rows.length > 0 && (
              <div>
                <p className="font-semibold">Baris invalid ({result.invalid_rows.length}):</p>
                <ul className="max-h-32 list-disc overflow-y-auto pl-5">
                  {result.invalid_rows.slice(0, 20).map((r, i) => <li key={i}>{r.file}:{r.line} [{r.plu}] {r.reason}</li>)}
                </ul>
              </div>
            )}
            {result.orphan_barcodes.length > 0 && <p className="text-muted-foreground">Orphan barcode: {result.orphan_barcodes.slice(0, 10).join(", ")}{result.orphan_barcodes.length > 10 ? "…" : ""}</p>}
            {result.products_without_barcode.length > 0 && <p className="text-muted-foreground">Tanpa barcode: {result.products_without_barcode.slice(0, 10).join(", ")}{result.products_without_barcode.length > 10 ? "…" : ""}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProductClearCard({ onCleared }: { onCleared: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await clearProducts();
      showToast("Master data berhasil dihapus. Riwayat SO tidak berubah.");
      onCleared();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menghapus master data.", "error");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Card className="mt-5 border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Hapus seluruh master produk + barcode. Riwayat stock opname tetap tersimpan (snapshot).</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setOpen(true)} disabled={loading}>Hapus Semua Master</Button>
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="Hapus seluruh master data?"
          description="Produk dan barcode akan dihapus permanen. Riwayat SO tidak berubah. Lanjut?"
          confirmLabel="Ya, hapus"
          destructive
          onConfirm={() => void handleConfirm()}
        />
      </CardContent>
    </Card>
  );
}
