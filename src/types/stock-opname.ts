export type StockOpname = {
  id: number;
  barcode: string;
  plu: string;
  name: string;
  quantity: number;
  updatedAt: string;
  rackId: number;
  rackName: string;
  coordinatorId: number;
  coordinator: string;
};

export type StockOpnameUpdateRequest = { quantity: number; note?: string };
export type StockOpnameCreateRequest = { quantity: number; barcode?: string; plu?: string; rackId: number; note?: string };
export type StockOpnameMoveRequest = { sourceRakId: number; targetRakId: number; resultIds?: number[]; note?: string };
export type StockOpnameMoveResponse = { moved_count: number; merged_count: number };

export type Pagination = { page: number; limit: number; total_pages: number; total_items: number };
