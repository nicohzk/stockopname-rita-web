import { api, type ApiResponse } from "@/lib/api";
import type { Coordinator, CoordinatorStatus, CoordinatorUpdateRequest } from "@/types/coordinator";

type CoordinatorResponse = { id: number; code: string; inspector: number; rackAssigned: number; rackCompleted: number; status: string };
function mapCoordinator(item: CoordinatorResponse): Coordinator { return { id: item.id, code: item.code, inspector: item.inspector, rackAssigned: item.rackAssigned, rackFinished: item.rackCompleted, status: item.status as CoordinatorStatus }; }
export async function getCoordinators(sessionId?: number) { const query = sessionId === undefined ? "" : `?sessionId=${sessionId}`; const response = await api<ApiResponse<CoordinatorResponse[]>>(`/stockopname/coordinators${query}`); return (response.data ?? []).map(mapCoordinator); }
export async function getCoordinator(id: number) { const response = await api<ApiResponse<CoordinatorResponse>>(`/stockopname/coordinators/${id}`); return mapCoordinator(response.data); }
export function updateCoordinator(id: number, data: CoordinatorUpdateRequest) { return api<ApiResponse<null>>(`/stockopname/coordinators/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }