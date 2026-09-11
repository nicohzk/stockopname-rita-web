const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = API_URL.replace(/\/$/, "");

export async function api<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiBlob(endpoint: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.blob();
}

export type ApiResponse<T> = {
  message: string;
  data: T;
};