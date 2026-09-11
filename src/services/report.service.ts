import { apiBlob } from "@/lib/api";

export async function openSessionReport(id: number) {
  return openReport(`/stockopname/sessions/${id}/pdf`);
}

export async function openCoordinatorReport(id: number) {
  return openReport(`/stockopname/coordinators/${id}/pdf`);
}

async function openReport(endpoint: string) {
  const reportWindow = window.open("about:blank", "_blank");
  if (!reportWindow) throw new Error("The PDF tab was blocked by the browser.");

  try {
    const blob = await apiBlob(endpoint);
    const url = URL.createObjectURL(blob);
    reportWindow.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    reportWindow.close();
    throw error;
  }
}