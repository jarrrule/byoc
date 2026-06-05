const STORAGE_KEY = "byoc-guest-name";

export function getGuestName(partyId: string): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return "";
    const map = JSON.parse(raw) as Record<string, string>;
    return map[partyId] ?? "";
  } catch {
    return "";
  }
}

export function setGuestName(partyId: string, name: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    const trimmed = name.trim();
    if (trimmed) {
      map[partyId] = trimmed;
    } else {
      delete map[partyId];
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}
