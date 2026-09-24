import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TruncatedText } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/types/product";

export default function ProductBarcodeTable({ products, onUpdateBarcodes }: { products: Product[]; onUpdateBarcodes: (id: number, barcodes: string[]) => Promise<void> }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const [newBarcode, setNewBarcode] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.plu.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.barcodes.some((b) => b.toLowerCase().includes(q)));
  }, [products, search]);

  const openEdit = (p: Product) => {
    setEditing(p);
    setDraft([...p.barcodes]);
    setNewBarcode("");
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await onUpdateBarcodes(editing.id, draft);
      showToast("Barcode berhasil diperbarui.");
      setEditing(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal memperbarui barcode.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Barcode</CardTitle>
        <CardDescription>Kelola barcode per produk. Disimpan via produk (replace full set).</CardDescription>
      </CardHeader>
      <CardContent>
        <Input placeholder="Cari PLU / nama / barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-3 w-full sm:max-w-sm" />
        <div className="rounded-md border">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "110px" }}>PLU</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead style={{ width: "130px" }}>Utama</TableHead>
                <TableHead>Semua Barcode</TableHead>
                <TableHead style={{ width: "90px" }}>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Tidak ada data.</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><TruncatedText>{p.plu}</TruncatedText></TableCell>
                  <TableCell><TruncatedText>{p.name}</TruncatedText></TableCell>
                  <TableCell><TruncatedText>{p.barcode || "-"}</TruncatedText></TableCell>
                  <TableCell><TruncatedText>{p.barcodes.length ? p.barcodes.join(", ") : "-"}</TruncatedText></TableCell>
                  <TableCell><Button variant="outline" size="sm" onClick={() => openEdit(p)}>Kelola</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Dialog open={editing !== null} onOpenChange={(o) => { if (!o) setEditing(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Kelola Barcode — {editing?.plu}</DialogTitle><Separator /></DialogHeader>
            <div className="space-y-2">
              {draft.length === 0 && <p className="text-muted-foreground text-sm">Belum ada barcode.</p>}
              {draft.map((b) => (
                <div key={b} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
                  <span className="truncate text-sm">{b}</span>
                  <Button variant="ghost" size="sm" onClick={() => setDraft(draft.filter((x) => x !== b))}>Hapus</Button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-barcode">Tambah barcode</Label>
              <div className="flex gap-2">
                <Input id="new-barcode" value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} placeholder="Scan / ketik barcode" />
                <Button type="button" variant="secondary" onClick={() => { const v = newBarcode.trim(); if (v && !draft.includes(v)) setDraft([...draft, v]); setNewBarcode(""); }}>Tambah</Button>
              </div>
            </div>
            <Button onClick={() => void handleSave()} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Barcode"}</Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
