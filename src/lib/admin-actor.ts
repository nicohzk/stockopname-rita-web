const STORAGE_KEY = "rita-admin-actor";

export function getAdminActor(): string {
  const stored = window.localStorage.getItem(STORAGE_KEY)?.trim();
  return stored || "admin-web";
}

export function saveAdminActor(name: string): string {
  const actor = name.trim().slice(0, 100) || "admin-web";
  window.localStorage.setItem(STORAGE_KEY, actor);
  return actor;
}
