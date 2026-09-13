import { api, type ApiResponse } from "@/lib/api";
import type { Department, DepartmentRequest, DepartmentUpdateRequest } from "@/types/department";
import type { Pagination } from "@/types/stock-opname";

export async function getDepartments(page = 1, limit = 6, search = "") {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  const response = await api<ApiResponse<Department[]> & { pagination: Pagination }>(`/departments?${query}`);
  return { data: response.data ?? [], pagination: response.pagination ?? { page: 1, limit, total_pages: 1, total_items: 0 } };
}

export function createDepartment(data: DepartmentRequest) {
  return api<ApiResponse<Department>>("/departments", { method: "POST", body: JSON.stringify(data) }).then((response) => response.data);
}

export function deleteDepartment(id: number) {
  return api<ApiResponse<null>>(`/departments/${id}`, { method: "DELETE" });
}

export function updateDepartment(id: number, data: DepartmentUpdateRequest) {
  return api<ApiResponse<Department>>(`/departments/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then((response) => response.data);
}