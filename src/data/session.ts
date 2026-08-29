import type { Session } from "@/types/session";

export const sessionsDummy: Session[] = [
  {
    id: 1,
    code: "SO-15-08-2026-01",
    location: "Gudang Utama",
    status: "IN_PROGRESS",
    startedAt: "28 Agustus 2026 09:30",
  },
  {
    id: 2,
    code: "SO-14-08-2026-02",
    location: "Gudang Pendingin",
    status: "COMPLETED",
    startedAt: "27 Agustus 2026 08:00",
    endedAt: "27 Agustus 2026 15:45",
  },
  {
    id: 3,
    code: "SO-13-08-2026-01",
    location: "Toko Depan",
    status: "CANCELLED",
    startedAt: "25 Agustus 2026 10:00",
    endedAt: "25 Agustus 2026 10:12",
  },
];
