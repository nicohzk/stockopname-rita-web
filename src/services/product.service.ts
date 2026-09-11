import { api, type ApiResponse } from "@/lib/api";
import type { CreateProductRequest, Product, ProductResponse, UpdateProductRequest } from "@/types/product";

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

export async function getProducts() {
  const response = await api<ApiResponse<ProductResponse[]>>("/products");
  return (response.data ?? []).map(mapProduct);
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