import { useCallback, useEffect, useMemo, useState } from "react";

import type { UploadProgress } from "@/lib/api";

export type ImportPhase = "idle" | "uploading" | "processing";

export type ImportCallbacks = {
  onUploadProgress: (progress: UploadProgress) => void;
  onUploadComplete: () => void;
};

/**
 * Melacak satu pekerjaan impor yang panjang: fase unggah, fase olah di server,
 * dan detik berjalan. Dipakai halaman Master Produk dan wizard Buat Sesi supaya
 * keduanya berperilaku sama.
 */
export function useImportJob() {
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [bytes, setBytes] = useState({ loaded: 0, total: 0 });
  const [elapsed, setElapsed] = useState(0);

  const busy = phase !== "idle";

  // Setelah unggahan selesai, server masih mengolah puluhan ribu baris tanpa
  // mengirim kabar apa pun. Detik berjalan inilah tanda bahwa aplikasi hidup.
  useEffect(() => {
    if (!busy) return;

    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);

    return () => window.clearInterval(timer);
  }, [busy]);

  // Impor besar bisa berjalan menit-menitan; jangan biarkan tab tertutup tanpa
  // peringatan.
  useEffect(() => {
    if (!busy) return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  const start = useCallback(() => {
    setProgress(0);
    setBytes({ loaded: 0, total: 0 });
    setElapsed(0);
    setPhase("uploading");
  }, []);

  const stop = useCallback(() => setPhase("idle"), []);

  const callbacks = useMemo<ImportCallbacks>(
    () => ({
      onUploadProgress: (next) => {
        setBytes({ loaded: next.loaded, total: next.total });
        if (next.percent >= 0) setProgress(next.percent);
        // Sebagian browser tidak memicu onUploadComplete; persen 100 dipakai
        // sebagai penanda yang sama.
        if (next.percent >= 100) setPhase("processing");
      },
      onUploadComplete: () => setPhase("processing"),
    }),
    [],
  );

  return { phase, progress, bytes, elapsed, busy, start, stop, callbacks };
}
