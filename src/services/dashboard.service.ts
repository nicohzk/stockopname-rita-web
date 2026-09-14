import { api, type ApiResponse } from "@/lib/api";
import type { ProductLastSession } from "@/types/dashboard";

type ProductLastSessionResponse = {
  id: number;
  barcode: string;
  name: string;
  last_session_date: string;
  last_session_code: string;
};

function mapProductLastSession(item: ProductLastSessionResponse): ProductLastSession {
  return {
    id: item.id,
    barcode: item.barcode,
    name: item.name,
    lastSessionDate: item.last_session_date ?? "",
    lastSessionCode: item.last_session_code ?? "",
  };
}

export async function getProductsLastSession(limit = 20) {
  const query = new URLSearchParams({ limit: String(limit) });
  const response = await api<ApiResponse<ProductLastSessionResponse[]>>(`/products/last-session?${query}`);
  return (response.data ?? []).map(mapProductLastSession);
}
