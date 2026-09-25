export type Product = {
  id: number;
  plu: string;
  barcode: string;
  barcodes: string[];
  name: string;
  buyPrice: number;
  sellPrice: number;
  lastUpdate: string;
  department: string;
};

export type CreateProductRequest = {
  plu: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  departmentCode: string;
};

export type UpdateProductRequest = {
  plu?: string;
  name?: string;
  buyPrice?: number;
  sellPrice?: number;
  departmentCode?: string;
  barcodes?: string[];
};

export type ProductResponse = {
  id: number;
  plu: string;
  barcode: string;
  barcodes: string[];
  name: string;
  buy_price: number;
  sell_price: number;
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