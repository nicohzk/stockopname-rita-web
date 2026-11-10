export type QtyFactor = -1 | 0 | 1;

export type StockOpname = {
  id: number;
  barcode: string;
  plu: string;
  name: string;
  quantity: number;
  effectiveQuantity: number;
  qtyFactor: QtyFactor;
  updatedAt: string;
  rackId: number;
  rackName: string;
  coordinatorId: number;
  coordinator: string;
};

export type StockOpnameUpdateRequest = { quantity: number; note?: string };
export type StockOpnameCreateRequest = { quantity: number; barcode?: string; plu?: string; rackId: number; note?: string };
export type StockOpnameMoveRequest = { sourceRakId: number; targetRakId: number; resultIds?: number[]; note?: string };
export type StockOpnameMoveResponse = { moved_count: number; merged_count: number; reopened_rack_id?: number };

export type QtyFactorFilter = {
  search?: string;
  coordinatorId?: number;
  rakId?: number;
};

export type QtyFactorScope = "session" | "coordinator" | "rack" | "item" | "items" | "filter";

export type SetQtyFactorRequest = {
  scope: QtyFactorScope;
  scopeId?: number;
  resultIds?: number[];
  filter?: QtyFactorFilter;
  qtyFactor: QtyFactor;
  note?: string;
};

export type SetQtyFactorResponse = {
  updated_count: number;
  batch_id: string;
};

export type SellSummaryGroup = {
  key: string;
  label: string;
  item_count: number;
  total_qty: number;
  total_sell_original: number;
  total_sell_effective: number;
};

export type SellSummaryResponse = {
  group_by: "session" | "coordinator" | "rack";
  groups: SellSummaryGroup[];
};

export type ResultSelectionItem = Pick<StockOpname, "id" | "rackId" | "coordinatorId" | "qtyFactor">;

export type SelectionMode = "manual" | "filter";

export type Pagination = { page: number; limit: number; total_pages: number; total_items: number };
