import { api, type ApiResponse } from "@/lib/api";
import type { Department, DepartmentRequest, DepartmentUpdateRequest } from "@/types/department";

export function getDepartments() {
  return api<ApiResponse<Department[]>>("/departments").then((response) => response.data ?? []);
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