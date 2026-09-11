import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductTabs from "./product/product-tabs";
import { CategoryTabs } from "./category/category-tabs";
import DepartmentsTabs from "./department/department-tabs";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function MasterPage() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="p-4">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Master Data</h1>
        <p>Welcome to the master data page!</p>
        <Separator className="mt-2"/>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3" variant="line">
          <TabsTrigger className="text-md font-semibold " value="products">Products</TabsTrigger>
          <TabsTrigger className="text-md font-semibold" value="categories">Categories</TabsTrigger>
          <TabsTrigger className="text-md font-semibold" value="departments">Departments</TabsTrigger>
        </TabsList>
        <ProductTabs isActive={activeTab === "products"} />
        <CategoryTabs isActive={activeTab === "categories"} />
        <DepartmentsTabs isActive={activeTab === "departments"} />
      </Tabs>
    </div>
  );
}
