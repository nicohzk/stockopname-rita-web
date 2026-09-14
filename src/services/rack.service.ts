import { api, type ApiResponse } from "@/lib/api";
import type { Rack } from "@/types/rack";
type RackProgress = { rackAssigned: number; rackCompleted: number; total_items: number };
export async function getRackProgress(params: { sessionId?: number; coordinatorId?: number }) { const query = new URLSearchParams(); if (params.sessionId !== undefined) query.set("sessionId", String(params.sessionId)); if (params.coordinatorId !== undefined) query.set("coordinatorId", String(params.coordinatorId)); const response = await api<ApiResponse<RackProgress[]>>(`/stockopname/racks/progress?${query}`); return response.data ?? []; }

export async function getRacks(params: { sessionId?: number; coordinatorId?: number; inspectorId?: number }) {
	const query = new URLSearchParams();
	if (params.sessionId !== undefined) query.set("sessionId", String(params.sessionId));
	if (params.coordinatorId !== undefined) query.set("coordinatorId", String(params.coordinatorId));
	if (params.inspectorId !== undefined) query.set("inspectorId", String(params.inspectorId));
	const response = await api<ApiResponse<Rack[]>>(`/stockopname/racks?${query}`);
	return response.data ?? [];
}