import { api, type ApiResponse } from "@/lib/api";

type RackProgress = { rackAssigned: number; rackCompleted: number; total_items: number };
type RackResponse = { id: number; name: string; coordinator_id: number; uploaded_at: string };

export async function getRackProgress(params: { sessionId?: number; coordinatorId?: number }) { const query = new URLSearchParams(); if (params.sessionId !== undefined) query.set("sessionId", String(params.sessionId)); if (params.coordinatorId !== undefined) query.set("coordinatorId", String(params.coordinatorId)); const response = await api<ApiResponse<RackProgress[]>>(`/stockopname/racks/progress?${query}`); return response.data ?? []; }

export async function getRacks(params: { sessionId?: number; coordinatorId?: number }) {
	const query = new URLSearchParams();
	if (params.sessionId !== undefined) query.set("sessionId", String(params.sessionId));
	if (params.coordinatorId !== undefined) query.set("coordinatorId", String(params.coordinatorId));
	const response = await api<ApiResponse<RackResponse[]>>(`/stockopname/racks?${query}`);
	return (response.data ?? []).map((rack) => ({
		id: rack.id,
		name: rack.name,
		coordinatorId: rack.coordinator_id,
		uploadedAt: rack.uploaded_at ?? "",
	}));
}

export function deleteRack(id: number) {
	return api<ApiResponse<null>>(`/stockopname/racks/${id}`, { method: "DELETE" });
}
