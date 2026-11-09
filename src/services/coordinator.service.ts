import { api, type ApiResponse } from "@/lib/api";
import type { Coordinator, CoordinatorStatus, CoordinatorUpdateRequest } from "@/types/coordinator";

type CoordinatorResponse = { id: number; code: string; rackAssigned: number; rackCompleted: number; status: string; sessionCode?: string; sessionLocation?: string };
function mapCoordinator(item: CoordinatorResponse): Coordinator { return { id: item.id, code: item.code, rackAssigned: item.rackAssigned, rackFinished: item.rackCompleted, status: item.status as CoordinatorStatus, sessionCode: item.sessionCode, sessionLocation: item.sessionLocation }; }
export async function getCoordinators(sessionId?: number) { const query = sessionId === undefined ? "" : `?sessionId=${sessionId}`; const response = await api<ApiResponse<CoordinatorResponse[]>>(`/stockopname/coordinators${query}`); return (response.data ?? []).map(mapCoordinator); }
export async function getCoordinator(id: number) { const response = await api<ApiResponse<CoordinatorResponse>>(`/stockopname/coordinators/${id}`); return mapCoordinator(response.data); }
export function updateCoordinator(id: number, data: CoordinatorUpdateRequest) { return api<ApiResponse<null>>(`/stockopname/coordinators/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }

export function createCoordinator(data: { sessionId: number; code: string; rackStart: number; rackEnd: number }) {
	return api<ApiResponse<CoordinatorResponse>>("/stockopname/coordinators", {
		method: "POST",
		body: JSON.stringify({
			session_id: data.sessionId,
			code: data.code,
			rack_start: data.rackStart,
			rack_end: data.rackEnd,
		}),
	}).then((response) => mapCoordinator(response.data));
}