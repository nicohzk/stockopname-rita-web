import { api, type ApiResponse } from "@/lib/api";
import type { Session, SessionCreateRequest, SessionStatus, SessionUpdateRequest } from "@/types/session";
import type { Pagination } from "@/types/stock-opname";

type SessionResponse = {
  id: number;
  code: string;
  location: string;
  status: string;
  startedat: string | null;
  endedat: string | null;
};

function mapSession(session: SessionResponse): Session {
  return {
    id: session.id,
    code: session.code,
    location: session.location,
    status: session.status as SessionStatus,
    startedAt: session.startedat ?? null,
    endedAt: session.endedat ?? null,
  };
}

export async function getSessions(page = 1, limit = 6, search = "") {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  const response = await api<ApiResponse<SessionResponse[]> & { pagination: Pagination }>(`/stockopname/sessions?${query}`);
  return { data: (response.data ?? []).map(mapSession), pagination: response.pagination ?? { page: 1, limit, total_pages: 1, total_items: 0 } };
}

export function createSession(data: SessionCreateRequest) {
  return api<ApiResponse<SessionResponse>>("/stockopname/sessions", {
    method: "POST",
    body: JSON.stringify({
      sesi_code: data.code,
      location: data.location,
      coor_code: data.coordinatorCodes,
    }),
  }).then((response) => mapSession(response.data));
}

export function getSession(id: number) {
  return api<ApiResponse<SessionResponse>>(`/stockopname/sessions/${id}`).then((response) => mapSession(response.data));
}

export function updateSession(id: number, data: SessionUpdateRequest) {
  return api<ApiResponse<null>>(`/stockopname/sessions/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}