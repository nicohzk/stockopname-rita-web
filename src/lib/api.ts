const API_URL = import.meta.env.VITE_API_URL as string | undefined;
if (!API_URL) {
  throw new Error("VITE_API_URL belum diisi. Salin .env.example menjadi .env lalu isi URL API.");
}
const API_BASE_URL = API_URL.replace(/\/$/, "");

// Satu tempat yang tahu kapan sesi berakhir. Modul ini tidak boleh mengimpor
// React, jadi AuthProvider mendengarkan event ini alih-alih dipanggil langsung.
const UNAUTHORIZED_EVENT = "rita:unauthorized";

function notifyUnauthorized(endpoint: string) {
  // Login yang ditolak bukan sesi berakhir: form login yang menampilkan pesan
  // "username atau password salah", bukan pengalihan ke halaman yang sama.
  if (endpoint.startsWith("/auth/login")) return;
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export function onUnauthorized(handler: () => void): () => void {
  const listener = () => handler();
  window.addEventListener(UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, listener);
}

async function timedFetch(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("Permintaan timeout. Coba lagi.", { cause: error });
    }
    throw error;
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  let message = `API Error: ${response.status}`;
  try {
    const body = await response.json();
    if (body && typeof body.message === "string") {
      message = body.message;
    }
  } catch {
    // Body bukan JSON (mis. nginx error page) — pakai pesan generik di atas.
  }
  return message;
}

export async function api<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await timedFetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      // Cookie sesi harus ikut, termasuk saat API dibuka lewat proxy /api.
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    },
    15_000,
  );

  if (!response.ok) {
    if (response.status === 401) notifyUnauthorized(endpoint);
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

export async function apiBlob(endpoint: string): Promise<Blob> {
  const response = await timedFetch(
    `${API_BASE_URL}${endpoint}`,
    { credentials: "include" },
    30_000,
  );
  if (!response.ok) {
    if (response.status === 401) notifyUnauthorized(endpoint);
    throw new Error(await readErrorMessage(response));
  }
  return response.blob();
}

export async function apiForm<T>(endpoint: string, form: FormData, options?: RequestInit): Promise<T> {
  const response = await timedFetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      method: options?.method ?? "POST",
      body: form,
      credentials: "include",
      headers: { ...options?.headers },
    },
    120_000,
  );

  if (!response.ok) {
    if (response.status === 401) notifyUnauthorized(endpoint);
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

export type ApiResponse<T> = {
  message: string;
  data: T;
};
