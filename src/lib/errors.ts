/** Pesan error yang aman ditampilkan ke admin. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  return fallback;
}

/**
 * Mutasi yang sudah tersimpan tidak boleh terlihat gagal hanya karena
 * pemuatan ulang daftar ikut gagal, jadi peringatan ini memisahkan keduanya.
 */
export function refreshWarningMessage(error: unknown): string {
  return `Perubahan sudah tersimpan, tetapi daftar gagal dimuat ulang: ${errorMessage(
    error,
    "koneksi bermasalah",
  )}. Klik "Muat ulang" untuk menyegarkan data.`;
}
