import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductTabs from "./product/product-tabs";
import { CategoryTabs } from "./category/category-tabs";
import DepartmentsTabs from "./department/department-tabs";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function MasterPage() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="min-w-0 p-0 sm:p-2">
      <div className="mb-3">
        <h1 className="text-xl font-bold sm:text-2xl">Master Data</h1>
        <p>Kelola data produk, kategori, dan department yang digunakan dalam stock opname</p>
        <Separator className="mt-2"/>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3" variant="line">
          <TabsTrigger className="px-2 text-sm font-semibold sm:text-md" value="products">Produk</TabsTrigger>
          <TabsTrigger className="px-2 text-sm font-semibold sm:text-md" value="categories">Kategori</TabsTrigger>
          <TabsTrigger className="px-2 text-sm font-semibold sm:text-md" value="departments">Department</TabsTrigger>
        </TabsList>
        <ProductTabs isActive={activeTab === "products"} />
        <CategoryTabs isActive={activeTab === "categories"} />
        <DepartmentsTabs isActive={activeTab === "departments"} />
      </Tabs>
    </div>
  );
}
