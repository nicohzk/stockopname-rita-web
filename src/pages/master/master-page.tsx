import ProductTabs from "./product/product-tabs";
import { Separator } from "@/components/ui/separator";

export default function MasterPage() {
  return (
    <div className="min-w-0 p-0 sm:p-2">
      <div className="mb-3">
        <h1 className="text-xl font-bold sm:text-2xl">Master Data</h1>
        <p>Kelola data produk yang digunakan dalam stock opname</p>
        <Separator className="mt-2"/>
      </div>
      <ProductTabs isActive />
    </div>
  );
}
