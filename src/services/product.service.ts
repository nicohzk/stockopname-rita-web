import { api, apiForm, type ApiResponse } from "@/lib/api";
import type { CreateProductRequest, ImportResult, Product, ProductResponse, UpdateProductRequest } from "@/types/product";
import type { Pagination } from "@/types/stock-opname";

function mapProduct(product: ProductResponse): Product {
  return {
    id: product.id,
    plu: product.plu,
    barcodes: product.barcodes ?? [],
    name: product.name,
    buyPrice: product.buy_price,
    sellPrice: product.sell_price,
    lastUpdate: product.date_updated,
    department: product.department_code,
  };
}

export async function getProducts(sessionId: number, page = 1, limit = 6, search = "") {
  const query = new URLSearchParams({ sessionId: String(sessionId), page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  const response = await api<ApiResponse<ProductResponse[]> & { pagination: Pagination }>(`/products?${query}`);
  return { data: (response.data ?? []).map(mapProduct), pagination: response.pagination ?? { page: 1, limit, total_pages: 1, total_items: 0 } };
}

export async function getProductCount(sessionId: number) {
  const { pagination } = await getProducts(sessionId, 1, 1, "");
  return pagination.total_items;
}

export async function createProduct(sessionId: number, data: CreateProductRequest) {
  const response = await api<ApiResponse<ProductResponse>>("/products", {
    method: "POST",
    body: JSON.stringify({ sesi_id: sessionId, plu: data.plu, name: data.name, buy_price: data.buyPrice, sell_price: data.sellPrice, department_code: data.departmentCode, barcodes: data.barcodes }),
  });
  return mapProduct(response.data);
}

export async function updateProduct(
  id: number,
  sessionId: number,
  data: UpdateProductRequest,
) {
  return api<ApiResponse<ProductResponse>>(`/products/${id}?sessionId=${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({ plu: data.plu, name: data.name, buy_price: data.buyPrice, sell_price: data.sellPrice, department_code: data.departmentCode, barcodes: data.barcodes }),
  });
}

export async function importProducts(produk: File, barcode: File, sessionId: number, dryRun = false) {
  const form = new FormData();
  form.append("produk", produk);
  form.append("barcode", barcode);
  const query = new URLSearchParams({ sessionId: String(sessionId) });
  if (dryRun) query.set("dry_run", "true");
  const response = await apiForm<ApiResponse<ImportResult>>(`/products/import?${query}`, form);
  return response.data;
}

export async function clearProducts(sessionId: number) {
  return api<ApiResponse<null>>(`/products/clear?sessionId=${sessionId}&confirm=true`, { method: "POST" });
}

export async function deleteProduct(id: number, sessionId: number) {
  return api<ApiResponse<null>>(`/products/${id}?sessionId=${sessionId}`, {
    method: "DELETE",
  });
}
