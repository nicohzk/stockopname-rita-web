import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { getProducts } from "@/services/product.service";
import { getRacks } from "@/services/rack.service";
import type { Coordinator } from "@/types/coordinator";
import type { Product } from "@/types/product";
import type { Rack } from "@/types/rack";
import type { StockOpnameCreateRequest } from "@/types/stock-opname";

type Option = { value: string; label: string };

export default function StockOpnameAddItemButton({ sessionId, coordinators, onSubmit, disabled = false }: { sessionId: number; coordinators: Coordinator[]; onSubmit: (data: StockOpnameCreateRequest) => Promise<void>; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [coordinator, setCoordinator] = useState<Option | null>(null);
  const [rack, setRack] = useState<Option | null>(null);
  const [product, setProduct] = useState<Option | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [validationError, setValidationError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const resetForm = () => {
    setCoordinator(null);
    setRack(null);
    setProduct(null);
    setScannedBarcode("");
    setProductSearchInput("");
    setProductSearch("");
    setQuantity("");
    setRacks([]);
    setProducts([]);
    setValidationError(undefined);
    setSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    resetForm();
    setOpen(nextOpen);
  };

  useEffect(() => {
    if (open) {
      void getProducts(sessionId, 1, 20, productSearch).then((result) => setProducts(result.data)).catch((error: unknown) => showToast(error instanceof Error ? error.message : "Gagal memuat data produk.", "error"));
    }
  }, [open, productSearch, showToast, sessionId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProductSearch(productSearchInput);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [productSearchInput]);

  useEffect(() => {
    setRack(null); setRacks([]);
    if (coordinator) void getRacks({ sessionId, coordinatorId: Number(coordinator.value) }).then(setRacks).catch((error: unknown) => showToast(error instanceof Error ? error.message : "Gagal memuat data rak.", "error"));
  }, [coordinator, sessionId, showToast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const barcode = scannedBarcode.trim();
    const plu = product?.value.trim() ?? "";
    if (!rack || !quantity || Number(quantity) < 0 || (!barcode && !plu)) {
      const message = "Rak, jumlah valid, dan salah satu barcode / produk (PLU) wajib diisi.";
      setValidationError(message);
      showToast(message, "error");
      return;
    }

    setValidationError(undefined);
    setSubmitting(true);
    try {
      await onSubmit({ quantity: Number(quantity), barcode: barcode || undefined, plu: plu || undefined, rackId: Number(rack.value) });
      resetForm();
      setOpen(false);
    } catch {
      // Parent (session/coor page) sudah toast error + rethrow; di sini cukup aktifkan tombol lagi.
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button disabled={disabled}>Tambah Item</Button>} />
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Item</DialogTitle><Separator /></DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2"><Label>Koordinator</Label><Combobox items={coordinators.map((item) => ({ value: String(item.id), label: item.code }))} value={coordinator} onValueChange={(value) => setCoordinator(value as Option | null)} itemToStringValue={(item: Option) => item.label}><ComboboxInput placeholder="Pilih koordinator" /><ComboboxContent><ComboboxEmpty>Tidak ada data.</ComboboxEmpty><ComboboxList>{(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></div>
          <div className="space-y-2"><Label>Rak</Label><Combobox items={racks.map((item) => ({ value: String(item.id), label: item.name }))} value={rack} onValueChange={(value) => setRack(value as Option | null)} disabled={!coordinator} itemToStringValue={(item: Option) => item.label}><ComboboxInput placeholder="Pilih rak" /><ComboboxContent><ComboboxEmpty>Tidak ada data.</ComboboxEmpty><ComboboxList>{(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></div>
          <div className="space-y-2">
            <Label htmlFor="so-barcode">Scan Barcode</Label>
            <Input id="so-barcode" value={scannedBarcode} onChange={(e) => { setScannedBarcode(e.target.value); setValidationError(undefined); }} placeholder="Scan / ketik barcode…" autoFocus />
          </div>
          <div className="space-y-2"><Label>Produk (PLU)</Label><Combobox items={products.map((item) => ({ value: item.plu, label: `${item.plu} - ${item.name}` }))} value={product} onValueChange={(value) => { setProduct(value as Option | null); setValidationError(undefined); }} onInputValueChange={(value) => setProductSearchInput(value)} itemToStringValue={(item: Option) => item.label}><ComboboxInput placeholder="Ketik PLU / nama / barcode…" /><ComboboxContent><ComboboxEmpty>Tidak ada data.</ComboboxEmpty><ComboboxList>{(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>
            <p className="text-muted-foreground text-xs">Isi salah satu: barcode hasil scan atau produk PLU. Jika keduanya diisi, barcode diprioritaskan.</p>
          </div>
          <div className="space-y-2"><Label htmlFor="so-quantity">Jumlah</Label><Input id="so-quantity" type="number" step="0.01" min="0" value={quantity} onChange={(event) => { setQuantity(event.target.value); setValidationError(undefined); }} />{validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}</div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Batal</Button><Button type="submit" disabled={submitting}>{submitting ? "Menambahkan..." : "Tambah Item"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
