import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductTabs from "./product/product-tabs";
import { CategoriesTabs } from "./category/categories-tabs";
import DepartmentsTabs from "./department/department-tabs";
import { Separator } from "@/components/ui/separator";

export default function MasterPage() {
  return (
    <div className="p-4">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Master Data</h1>
        <p>Welcome to the master data page!</p>
        <Separator className="mt-2"/>
      </div>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className="text-base font-semibold" value="products">Products</TabsTrigger>
          <TabsTrigger className="text-base font-semibold" value="categories">Categories</TabsTrigger>
          <TabsTrigger className="text-base font-semibold" value="departments">Departments</TabsTrigger>
        </TabsList>
        <ProductTabs/>
        <CategoriesTabs/>
        <DepartmentsTabs/>
      </Tabs>
    </div>
  );
}
