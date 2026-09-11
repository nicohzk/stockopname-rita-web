import { api, type ApiResponse } from "@/lib/api";
import type { Category, CategoryRequest, CategoryUpdateRequest } from "@/types/category";

export function getCategories() {
  return api<ApiResponse<Category[]>>("/categories").then((response) => response.data ?? []);
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