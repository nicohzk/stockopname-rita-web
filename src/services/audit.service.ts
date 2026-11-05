import { api, type ApiResponse } from "@/lib/api";
import type { AuditEntry } from "@/types/audit";
import type { Pagination } from "@/types/stock-opname";

export async function getAudits(params: {
  sessionId?: number;
  coordinatorId?: number;
  resultId?: number;
  page?: number;
  limit?: number;
} = {}) {
  const query = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 10) });
  if (params.sessionId !== undefined) query.set("sessionId", String(params.sessionId));
  if (params.coordinatorId !== undefined) query.set("coordinatorId", String(params.coordinatorId));
  if (params.resultId !== undefined) query.set("resultId", String(params.resultId));
  const response = await api<ApiResponse<AuditEntry[]> & { pagination: Pagination }>(`/stockopname/audits?${query}`);
  return {
    data: response.data ?? [],
    pagination: response.pagination ?? { page: 1, limit: params.limit ?? 10, total_pages: 1, total_items: 0 },
  };
}
