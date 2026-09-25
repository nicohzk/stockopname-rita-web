import { api, apiForm, type ApiResponse } from "@/lib/api";
import type { CreateProductRequest, ImportResult, Product, ProductResponse, UpdateProductRequest } from "@/types/product";
import type { Pagination } from "@/types/stock-opname";

function mapProduct(product: ProductResponse): Product {
  return {
    id: product.id,
    plu: product.plu,
    barcode: product.barcode ?? "",
    barcodes: product.barcodes ?? [],
    name: product.name,
    buyPrice: product.buy_price,
    sellPrice: product.sell_price,
    lastUpdate: product.date_updated,
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
    body: JSON.stringify({ plu: data.plu, name: data.name, buy_price: data.buyPrice, sell_price: data.sellPrice, department_code: data.departmentCode }),
  });
  return mapProduct(response.data);
}

export async function updateProduct(
  id: number,
  data: UpdateProductRequest,
) {
  return api<ApiResponse<ProductResponse>>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ plu: data.plu, name: data.name, buy_price: data.buyPrice, sell_price: data.sellPrice, department_code: data.departmentCode, barcodes: data.barcodes }),
  });
}

export async function updateProductBarcodes(id: number, barcodes: string[]) {
  return updateProduct(id, { barcodes });
}

export async function importProducts(produk: File, barcode: File, dryRun = false) {
  const form = new FormData();
  form.append("produk", produk);
  form.append("barcode", barcode);
  const response = await apiForm<ApiResponse<ImportResult>>(`/products/import${dryRun ? "?dry_run=true" : ""}`, form);
  return response.data;
}

export async function clearProducts() {
  return api<ApiResponse<null>>("/products/clear?confirm=true", { method: "POST" });
}

export async function deleteProduct(id: number) {
  return api<ApiResponse<null>>(`/products/${id}`, {
    method: "DELETE",
  });
}