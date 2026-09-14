export type Product = {
  id: number;
  barcode: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  lastUpdate: string;
  category: string;
  department: string;
};

export type CreateProductRequest = {
  barcode: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  categoryId: number;
  departmentId: number;
};

export type UpdateProductRequest = {
  barcode?: string;
  name?: string;
  buyPrice?: number;
  sellPrice?: number;
  categoryId?: number;
  departmentId?: number;
};

export type ProductResponse = {
  id: number;
  barcode: string;
  name: string;
  buy_price: number;
  sell_price: number;
  date_created: string;
  date_updated: string;
  category_name: string;
  department_code: string;
};