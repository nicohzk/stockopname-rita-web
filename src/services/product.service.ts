import { api } from "@/lib/api";
import type { CreateProductRequest, Product, UpdateProductRequest,  } from "@/types/product";

export async function getProducts() {
  return api<Product[]>("/products");
}

export async function createProduct(data: CreateProductRequest) {
  return api<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: number,
  data: UpdateProductRequest,
) {
  return api<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: number) {
  return api<void>(`/products/${id}`, {
    method: "DELETE",
  });
}