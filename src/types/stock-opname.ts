export type StockOpname = {
  id: number;
  barcode: string;
  name: string;
  quantity: number;
  updatedAt: string;
  rackName: string;
  inspector: string;
  coordinator: string;
};

export type StockOpnameUpdateRequest = { quantity: number };
export type StockOpnameCreateRequest = { quantity: number; productId: number; rackId: number };

export type Pagination = { page: number; limit: number; total_pages: number; total_items: number };
