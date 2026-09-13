import { api, type ApiResponse } from "@/lib/api";
import type { Category, CategoryRequest, CategoryUpdateRequest } from "@/types/category";
import type { Pagination } from "@/types/stock-opname";

export async function getCategories(page = 1, limit = 6, search = "") {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  const response = await api<ApiResponse<Category[]> & { pagination: Pagination }>(`/categories?${query}`);
  return { data: response.data ?? [], pagination: response.pagination ?? { page: 1, limit, total_pages: 1, total_items: 0 } };
}

export function createCategory(data: CategoryRequest) {
  return api<ApiResponse<Category>>("/categories", { method: "POST", body: JSON.stringify(data) }).then((response) => response.data);
}

export function deleteCategory(id: number) {
  return api<ApiResponse<null>>(`/categories/${id}`, { method: "DELETE" });
}

export function updateCategory(id: number, data: CategoryUpdateRequest) {
  return api<ApiResponse<Category>>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then((response) => response.data);
}