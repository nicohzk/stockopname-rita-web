const API_URL = import.meta.env.VITE_API_URL as string | undefined;
if (!API_URL) {
  throw new Error("VITE_API_URL belum diisi. Salin .env.example menjadi .env lalu isi URL API.");
}
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
    let message = `API Error: ${response.status}`;
    try {
      const body = await response.json();
      if (body && typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // Body bukan JSON (mis. nginx error page) — pakai pesan generik di atas.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function apiBlob(endpoint: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    let message = `API Error: ${response.status}`;
    try {
      const body = await response.json();
      if (body && typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // Body bukan JSON (mis. nginx error page) — pakai pesan generik di atas.
    }
    throw new Error(message);
  }
  return response.blob();
}

export async function apiForm<T>(endpoint: string, form: FormData, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, method: options?.method ?? "POST", body: form });

  if (!response.ok) {
    let message = `API Error: ${response.status}`;
    try {
      const body = await response.json();
      if (body && typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // Body bukan JSON (mis. nginx error page) — pakai pesan generik di atas.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export type ApiResponse<T> = {
  message: string;
  data: T;
};