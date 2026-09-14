export type DashboardSummary = {
  totalProducts: number;
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
};

export type ProductLastSession = {
  id: number;
  barcode: string;
  name: string;
  lastSessionDate: string;
  lastSessionCode: string;
};
