export type Product = {
  id: number;
  plu: string;
  barcodes: string[];
  name: string;
  buyPrice: number;
  sellPrice: number;
  perCarton: number;
  lastUpdate: string;
  department: string;
};

export type CreateProductRequest = {
  plu: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  departmentCode: string;
  perCarton?: number;
  barcodes?: string[];
};

export type UpdateProductRequest = {
  plu?: string;
  name?: string;
  buyPrice?: number;
  sellPrice?: number;
  departmentCode?: string;
  perCarton?: number;
  barcodes?: string[];
};

export type ProductResponse = {
  id: number;
  plu: string;
  barcodes: string[];
  name: string;
  buy_price: number;
  sell_price: number;
  per_carton: number;
  date_created: string;
  date_updated: string;
  department_code: string;
};

export type ImportInvalidRow = { file: string; line: number; plu: string; reason: string };

export type ImportResult = {
  products_inserted: number;
  products_updated: number;
  products_unchanged: number;
  barcodes_added: number;
  barcodes_removed: number;
  invalid_rows: ImportInvalidRow[];
  orphan_barcodes: string[];
  products_without_barcode: string[];
  dry_run: boolean;
};