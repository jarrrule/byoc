import type { Party } from "@/types/party";

const STORAGE_KEY = "byoc-parties";

function readAll(): Record<string, Party> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Party>) : {};
  } catch {
    return {};
  }
}

function writeAll(parties: Record<string, Party>): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
}

export function saveParty(party: Party): void {
  const parties = readAll();
  parties[party.id] = party;
  writeAll(parties);
}

export function getParty(id: string): Party | null {
  return readAll()[id] ?? null;
}

export function updateParty(party: Party): void {
  saveParty(party);
}
