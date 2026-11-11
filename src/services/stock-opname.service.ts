import { api, type ApiResponse } from "@/lib/api";
import type {
  Pagination,
  QtyFactorScope,
  SellSummaryResponse,
  SetQtyFactorRequest,
  SetQtyFactorResponse,
  StockOpname,
  StockOpnameCreateRequest,
  StockOpnameMoveRequest,
  StockOpnameMoveResponse,
  StockOpnameUpdateRequest,
} from "@/types/stock-opname";

type StockOpnameResponse = {
  id: number;
  barcode: string;
  plu: string;
  product_name: string;
  quantity: number;
  effective_quantity: number;
  qty_factor: number;
  rak_id: number;
  rak_name: string;
  coordinator_id: number;
  coor_code: string;
  updatedAt: string;
};

function mapResult(item: StockOpnameResponse): StockOpname {
  return {
    id: item.id,
    barcode: item.barcode,
    plu: item.plu,
    name: item.product_name,
    quantity: item.quantity,
    effectiveQuantity: item.effective_quantity ?? item.quantity * (item.qty_factor ?? 1),
    qtyFactor: (item.qty_factor ?? 1) as StockOpname["qtyFactor"],
    rackId: item.rak_id,
    rackName: item.rak_name,
    coordinatorId: item.coordinator_id,
    coordinator: item.coor_code,
    updatedAt: item.updatedAt,
  };
}

export async function getStockOpnames(params: { page?: number; limit?: number; search?: string; sessionId?: number; coordinatorId?: number; rakId?: number } = {}) {
  const query = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 6) });
  if (params.search) query.set("search", params.search);
  if (params.sessionId !== undefined) query.set("sessionId", String(params.sessionId));
  if (params.coordinatorId !== undefined) query.set("coordinatorId", String(params.coordinatorId));
  if (params.rakId !== undefined) query.set("rakId", String(params.rakId));
  const response = await api<ApiResponse<StockOpnameResponse[]> & { pagination: Pagination }>(`/stockopname/results?${query}`);
  return { data: (response.data ?? []).map(mapResult), pagination: response.pagination ?? { page: 1, limit: params.limit ?? 6, total_pages: 1, total_items: 0 } };
}

export function updateStockOpname(id: number, data: StockOpnameUpdateRequest) {
  return api<ApiResponse<StockOpnameResponse>>(`/stockopname/results/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteStockOpname(id: number) {
  return api<ApiResponse<null>>(`/stockopname/results/${id}`, { method: "DELETE" });
}

export function createStockOpname(data: StockOpnameCreateRequest) {
  return api<ApiResponse<StockOpnameResponse>>("/stockopname/results", {
    method: "POST",
    body: JSON.stringify({ quantity: data.quantity, barcode: data.barcode ?? "", plu: data.plu ?? "", rak_id: data.rackId, note: data.note ?? "" }),
  });
}

export function moveStockOpname(data: StockOpnameMoveRequest) {
  return api<ApiResponse<StockOpnameMoveResponse>>("/stockopname/results/move", {
    method: "POST",
    body: JSON.stringify({
      source_rak_id: data.sourceRakId,
      target_rak_id: data.targetRakId,
      result_ids: data.resultIds,
      note: data.note ?? "",
    }),
  });
}

export async function setQtyFactor(sessionId: number, data: SetQtyFactorRequest) {
  const body = {
    scope: data.scope,
    scope_id: data.scopeId,
    result_ids: data.resultIds,
    filter: data.filter
      ? {
          search: data.filter.search,
          coordinator_id: data.filter.coordinatorId,
          rak_id: data.filter.rakId,
        }
      : undefined,
    qty_factor: data.qtyFactor,
    note: data.note ?? "",
  };
  const response = await api<ApiResponse<SetQtyFactorResponse>>(`/stockopname/sessions/${sessionId}/qty-factor`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function getSellSummary(sessionId: number, groupBy: "session" | "coordinator" | "rack") {
  const response = await api<ApiResponse<SellSummaryResponse>>(
    `/stockopname/sessions/${sessionId}/sell-summary?groupBy=${groupBy}`,
  );
  return response.data;
}

export type { QtyFactorScope };
