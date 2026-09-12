import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { getInspectors } from "@/services/inspector.service";
import { getProducts } from "@/services/product.service";
import { getRacks } from "@/services/rack.service";
import type { Coordinator } from "@/types/coordinator";
import type { Inspector } from "@/types/inspector";
import type { Product } from "@/types/product";
import type { Rack } from "@/types/rack";
import type { StockOpnameCreateRequest } from "@/types/stock-opname";

type Option = { value: string; label: string };

export default function StockOpnameAddItemButton({ sessionId, coordinators, onSubmit, disabled = false }: { sessionId: number; coordinators: Coordinator[]; onSubmit: (data: StockOpnameCreateRequest) => Promise<void>; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [coordinator, setCoordinator] = useState<Option | null>(null);
  const [inspector, setInspector] = useState<Option | null>(null);
  const [rack, setRack] = useState<Option | null>(null);
  const [product, setProduct] = useState<Option | null>(null);
  const [quantity, setQuantity] = useState("");
  const [validationError, setValidationError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const resetForm = () => {
    setCoordinator(null);
    setInspector(null);
    setRack(null);
    setProduct(null);
    setQuantity("");
    setInspectors([]);
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
      void getProducts().then(setProducts).catch((error: unknown) => showToast(error instanceof Error ? error.message : "Failed to load products.", "error"));
    }
  }, [open, showToast]);

  useEffect(() => {
    setInspector(null); setRack(null); setInspectors([]); setRacks([]);
    if (coordinator) void getInspectors(Number(coordinator.value)).then(setInspectors).catch((error: unknown) => showToast(error instanceof Error ? error.message : "Failed to load inspectors.", "error"));
  }, [coordinator, showToast]);

  useEffect(() => {
    setRack(null); setRacks([]);
    if (inspector && coordinator) void getRacks({ sessionId, coordinatorId: Number(coordinator.value), inspectorId: Number(inspector.value) }).then(setRacks).catch((error: unknown) => showToast(error instanceof Error ? error.message : "Failed to load racks.", "error"));
  }, [inspector, coordinator, sessionId, showToast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product || !rack || !quantity || Number(quantity) <= 0) {
      const message = "Product, rack, and a positive quantity are required.";
      setValidationError(message);
      showToast(message, "error");
      return;
    }

    setValidationError(undefined);
    setSubmitting(true);
    try {
      await onSubmit({ productId: Number(product.value), rackId: Number(rack.value), quantity: Number(quantity) });
      resetForm();
      setOpen(false);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button disabled={disabled}>Add Item</Button>} />
      <DialogContent>
        <DialogHeader><DialogTitle>Add Item</DialogTitle><Separator /></DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2"><Label>Coordinator</Label><Combobox items={coordinators.map((item) => ({ value: String(item.id), label: item.code }))} value={coordinator} onValueChange={(value) => setCoordinator(value as Option | null)} itemToStringValue={(item: Option) => item.label}><ComboboxInput placeholder="Select a coordinator" /><ComboboxContent><ComboboxEmpty>No items found.</ComboboxEmpty><ComboboxList>{(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></div>
          <div className="space-y-2"><Label>Inspector</Label><Combobox items={inspectors.map((item) => ({ value: String(item.id), label: item.code }))} value={inspector} onValueChange={(value) => setInspector(value as Option | null)} disabled={!coordinator} itemToStringValue={(item: Option) => item.label}><ComboboxInput placeholder="Select an inspector" /><ComboboxContent><ComboboxEmpty>No items found.</ComboboxEmpty><ComboboxList>{(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></div>
          <div className="space-y-2"><Label>Rack</Label><Combobox items={racks.map((item) => ({ value: String(item.id), label: item.name }))} value={rack} onValueChange={(value) => setRack(value as Option | null)} disabled={!inspector} itemToStringValue={(item: Option) => item.label}><ComboboxInput placeholder="Select a rack" /><ComboboxContent><ComboboxEmpty>No items found.</ComboboxEmpty><ComboboxList>{(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></div>
          <div className="space-y-2"><Label>Product</Label><Combobox items={products.map((item) => ({ value: String(item.id), label: `${item.barcode} - ${item.name}` }))} value={product} onValueChange={(value) => setProduct(value as Option | null)} itemToStringValue={(item: Option) => item.label}><ComboboxInput placeholder="Select a product" /><ComboboxContent><ComboboxEmpty>No items found.</ComboboxEmpty><ComboboxList>{(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></div>
          <div className="space-y-2"><Label htmlFor="so-quantity">Quantity</Label><Input id="so-quantity" type="number" min="1" value={quantity} onChange={(event) => { setQuantity(event.target.value); setValidationError(undefined); }} />{validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}</div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Item"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
