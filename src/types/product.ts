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