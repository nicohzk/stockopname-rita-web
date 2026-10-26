import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type SubmitEvent } from "react";
import type { CreateProductRequest, Product } from "@/types/product";

export default function ProductAddForm({ onSubmit, initialData, submitLabel = "Tambah Produk" }: { onSubmit: (data: CreateProductRequest) => Promise<void>; initialData?: Product; submitLabel?: string }) {
  const [barcodes, setBarcodes] = useState<string[]>(initialData?.barcodes ?? []);
  const [newBarcode, setNewBarcode] = useState("");

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onSubmit({
      plu: String(formData.get("plu") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      departmentCode: String(formData.get("departmentCode") ?? "").trim(),
      buyPrice: Number(formData.get("buyPrice")),
      sellPrice: Number(formData.get("sellPrice")),
      barcodes,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="plu">PLU</Label>
        <Input id="plu" name="plu" defaultValue={initialData?.plu} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="departmentCode">Department Code</Label>
        <Input id="departmentCode" name="departmentCode" defaultValue={initialData?.department} placeholder="cth: RTD, FROZEN" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buyPrice">Harga Beli</Label>
          <Input id="buyPrice" name="buyPrice" type="number" min="0" step="any" defaultValue={initialData?.buyPrice} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellPrice">Harga Jual</Label>
          <Input id="sellPrice" name="sellPrice" type="number" min="0" step="any" defaultValue={initialData?.sellPrice} required />
        </div>
      </div>
      {initialData && (
        <div className="space-y-2">
          <Label>Barcode</Label>
          {barcodes.length === 0 && <p className="text-muted-foreground text-sm">Belum ada barcode.</p>}
          {barcodes.map((b) => (
            <div key={b} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
              <span className="truncate text-sm">{b}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setBarcodes(barcodes.filter((x) => x !== b))}>Hapus</Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} placeholder="Scan / ketik barcode" />
            <Button type="button" variant="secondary" onClick={() => { const v = newBarcode.trim(); if (v && !barcodes.includes(v)) setBarcodes([...barcodes, v]); setNewBarcode(""); }}>Tambah</Button>
          </div>
        </div>
      )}
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
