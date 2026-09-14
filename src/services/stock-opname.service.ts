import { api, type ApiResponse } from "@/lib/api";
import type { Pagination, StockOpname, StockOpnameCreateRequest, StockOpnameUpdateRequest } from "@/types/stock-opname";

type StockOpnameResponse = { id: number; barcode: string; product_name: string; quantity: number; rak_name: string; inspector_code: string; coor_code: string; updatedAt: string };
function mapResult(item: StockOpnameResponse): StockOpname {
  return { id: item.id, barcode: item.barcode, name: item.product_name, quantity: item.quantity, rackName: item.rak_name, inspector: item.inspector_code, coordinator: item.coor_code, updatedAt: item.updatedAt };
}

export async function getStockOpnames(params: { page?: number; limit?: number; search?: string; sessionId?: number; coordinatorId?: number } = {}) {
  const query = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 6) });
  if (params.search) query.set("search", params.search);
  if (params.sessionId !== undefined) query.set("sessionId", String(params.sessionId));
  if (params.coordinatorId !== undefined) query.set("coordinatorId", String(params.coordinatorId));
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
    body: JSON.stringify({ quantity: data.quantity, product_id: data.productId, rak_id: data.rackId }),
  });
}