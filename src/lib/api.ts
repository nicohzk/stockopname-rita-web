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

/**
 * Kegagalan sebelum server menjawab: DNS tidak menemukan host, koneksi ditolak
 * atau diputus, atau perangkat sedang offline. Berbeda dari error HTTP, di sini
 * tidak ada Response sama sekali — jadi tidak ada status yang bisa ditampilkan.
 */
export class NetworkError extends Error {
  readonly offline: boolean;

  constructor(message: string, offline: boolean, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "NetworkError";
    this.offline = offline;
  }
}

const NETWORK_MESSAGE = "Koneksi ke server terputus. Periksa jaringan, lalu coba lagi.";
const OFFLINE_MESSAGE = "Kamu sedang offline. Sambungkan internet, lalu coba lagi.";
const RETRY_DELAY_MS = 400;

function isIdempotent(method: string): boolean {
  const normalized = method.toUpperCase();
  return normalized === "GET" || normalized === "HEAD";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * fetch dengan batas waktu, ditambah satu percobaan ulang untuk GET/HEAD.
 *
 * Kegagalan jaringan sesaat — DNS yang tidak menjawab sekali, koneksi yang
 * direset Wi-Fi — tidak boleh menghapus satu halaman penuh. Mutasi sengaja
 * tidak diulang: kalau response-nya hilang, kita tidak tahu apakah server
 * sudah memprosesnya, dan mengulang POST bisa membuat data ganda.
 */
async function timedFetch(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  if (!navigator.onLine) {
    throw new NetworkError(OFFLINE_MESSAGE, true);
  }

  const attempts = isIdempotent(init.method ?? "GET") ? 2 : 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) await delay(RETRY_DELAY_MS);

    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new Error("Permintaan timeout. Coba lagi.", { cause: error });
      }

      // Hanya TypeError ("Failed to fetch") yang berarti jaringan; error lain
      // diteruskan apa adanya.
      if (!(error instanceof TypeError)) throw error;
      lastError = error;
    }
  }

  throw new NetworkError(NETWORK_MESSAGE, !navigator.onLine, lastError);
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

  // Error 5xx jarang dan biasanya dilaporkan pengguna; ID request membuat
  // laporan itu bisa langsung dicari di log backend.
  if (response.status >= 500) {
    const requestId = response.headers.get("x-request-id");
    if (requestId) {
      message = `${message} (id: ${requestId.slice(0, 8)})`;
    }
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

export type UploadProgress = {
  loaded: number;
  total: number;
  /** 0-100, atau -1 kalau browser tidak memberi tahu ukuran totalnya. */
  percent: number;
};

type UploadOptions = {
  timeoutMs?: number;
  onUploadProgress?: (progress: UploadProgress) => void;
  /** Dipanggil sekali saat semua byte sudah terkirim, sebelum server menjawab. */
  onUploadComplete?: () => void;
};

function messageFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const { message } = body as { message?: unknown };
    if (typeof message === "string" && message.trim() !== "") {
      return message;
    }
  }
  return fallback;
}

/**
 * apiForm dengan progres unggah. fetch() tidak melaporkan berapa byte yang
 * sudah terkirim, jadi jalur ini memakai XMLHttpRequest — satu-satunya cara
 * memberi tahu pengguna bahwa unggahan besar masih berjalan.
 *
 * Sengaja tanpa percobaan ulang: ini unggahan POST, dan mengulangnya bisa
 * menggandakan baris yang sudah tersimpan.
 */
export function apiFormWithProgress<T>(
  endpoint: string,
  form: FormData,
  options: UploadOptions = {},
): Promise<T> {
  const { timeoutMs = 300_000, onUploadProgress, onUploadComplete } = options;

  return new Promise<T>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${API_BASE_URL}${endpoint}`);
    request.timeout = timeoutMs;
    // Same-origin tetap mengirim cookie, tapi ini menjaga perilakunya sama
    // kalau API suatu saat dibuka di host lain.
    request.withCredentials = true;

    request.upload.onprogress = (event) => {
      if (!onUploadProgress) return;
      const percent = event.lengthComputable && event.total > 0
        ? Math.round((event.loaded / event.total) * 100)
        : -1;
      onUploadProgress({ loaded: event.loaded, total: event.total, percent });
    };

    if (onUploadComplete) {
      request.upload.onload = () => onUploadComplete();
    }

    request.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(request.responseText);
      } catch {
        // Bukan JSON (mis. halaman error nginx) — pesan generik di bawah.
      }

      if (request.status < 200 || request.status >= 300) {
        if (request.status === 401) notifyUnauthorized(endpoint);
        reject(new Error(messageFromBody(body, `API Error: ${request.status}`)));
        return;
      }

      resolve(body as T);
    };

    request.onerror = () => {
      reject(new NetworkError("Koneksi terputus saat mengunggah. Coba lagi.", !navigator.onLine));
    };
    request.ontimeout = () => reject(new Error("Permintaan timeout. Coba lagi."));

    request.send(form);
  });
}

export type ApiResponse<T> = {
  message: string;
  data: T;
};
