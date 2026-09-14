import { api, type ApiResponse } from "@/lib/api";
import type { CreateProductRequest, Product, ProductResponse, UpdateProductRequest } from "@/types/product";
import type { Pagination } from "@/types/stock-opname";

function mapProduct(product: ProductResponse): Product {
  return {
    id: product.id,
    barcode: product.barcode,
    name: product.name,
    buyPrice: product.buy_price,
    sellPrice: product.sell_price,
    lastUpdate: product.date_updated,
    category: product.category_name,
    department: product.department_code,
  };
}

export async function getProducts(page = 1, limit = 6, search = "") {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  const response = await api<ApiResponse<ProductResponse[]> & { pagination: Pagination }>(`/products?${query}`);
  return { data: (response.data ?? []).map(mapProduct), pagination: response.pagination ?? { page: 1, limit, total_pages: 1, total_items: 0 } };
}

export async function createProduct(data: CreateProductRequest) {
  const response = await api<ApiResponse<ProductResponse>>("/products", {
    method: "POST",
    body: JSON.stringify({ barcode: data.barcode, name: data.name, buy_price: data.buyPrice, sell_price: data.sellPrice, category_id: data.categoryId, department_id: data.departmentId }),
  });
  return mapProduct(response.data);
}

export async function updateProduct(
  id: number,
  data: UpdateProductRequest,
) {
  return api<ApiResponse<ProductResponse>>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ barcode: data.barcode, name: data.name, buy_price: data.buyPrice, sell_price: data.sellPrice, category_id: data.categoryId, department_id: data.departmentId }),
  });
}

export async function deleteProduct(id: number) {
  return api<ApiResponse<null>>(`/products/${id}`, {
    method: "DELETE",
  });
}