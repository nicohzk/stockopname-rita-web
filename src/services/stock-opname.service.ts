import { api, type ApiResponse } from "@/lib/api";
import type { Pagination, StockOpname, StockOpnameCreateRequest, StockOpnameMoveRequest, StockOpnameMoveResponse, StockOpnameUpdateRequest } from "@/types/stock-opname";

type StockOpnameResponse = { id: number; barcode: string; plu: string; product_name: string; quantity: number; rak_id: number; rak_name: string; coordinator_id: number; coor_code: string; updatedAt: string };
function mapResult(item: StockOpnameResponse): StockOpname {
  return { id: item.id, barcode: item.barcode, plu: item.plu, name: item.product_name, quantity: item.quantity, rackId: item.rak_id, rackName: item.rak_name, coordinatorId: item.coordinator_id, coordinator: item.coor_code, updatedAt: item.updatedAt };
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