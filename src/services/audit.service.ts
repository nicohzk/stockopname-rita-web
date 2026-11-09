import { api, type ApiResponse } from "@/lib/api";
import type { AuditBatchSummary, AuditEntry } from "@/types/audit";
import type { Pagination } from "@/types/stock-opname";

export async function getAudits(params: {
  sessionId?: number;
  coordinatorId?: number;
  resultId?: number;
  batchId?: string;
  withoutBatch?: boolean;
  page?: number;
  limit?: number;
} = {}) {
  const query = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 10) });
  if (params.sessionId !== undefined) query.set("sessionId", String(params.sessionId));
  if (params.coordinatorId !== undefined) query.set("coordinatorId", String(params.coordinatorId));
  if (params.resultId !== undefined) query.set("resultId", String(params.resultId));
  if (params.batchId) query.set("batchId", params.batchId);
  if (params.withoutBatch) query.set("withoutBatch", "true");
  const response = await api<ApiResponse<AuditEntry[]> & { pagination: Pagination }>(`/stockopname/audits?${query}`);
  return {
    data: response.data ?? [],
    pagination: response.pagination ?? { page: 1, limit: params.limit ?? 10, total_pages: 1, total_items: 0 },
  };
}

export async function getAuditBatches(params: {
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
  const response = await api<ApiResponse<AuditBatchSummary[]> & { pagination: Pagination }>(`/stockopname/audits/batches?${query}`);
  return {
    data: response.data ?? [],
    pagination: response.pagination ?? { page: 1, limit: params.limit ?? 10, total_pages: 1, total_items: 0 },
  };
}
