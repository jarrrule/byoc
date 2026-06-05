export interface ItemClaim {
  id: string;
  guestName: string;
  quantity: number;
}

export interface PartyItem {
  id: string;
  name: string;
  unit: string;
  quantityNeeded: number;
  quantityClaimed: number;
  claims: ItemClaim[];
}

export interface Party {
  id: string;
  name: string;
  date: string;
  location: string;
  items: PartyItem[];
}

export function getRemainingQuantity(item: PartyItem): number {
  return Math.max(0, item.quantityNeeded - item.quantityClaimed);
}

export function isFullyClaimed(item: PartyItem): boolean {
  return item.quantityClaimed >= item.quantityNeeded;
}

export function formatQuantityLabel(item: PartyItem): string {
  const unit = item.unit.trim();
  const count = item.quantityNeeded;
  if (!unit) return `${count}`;
  return count === 1 ? `1 ${unit}` : `${count} ${unit}`;
}

export function getGuestClaim(item: PartyItem, guestName: string): ItemClaim | undefined {
  const normalized = guestName.trim().toLowerCase();
  return item.claims.find(
    (claim) => claim.guestName.trim().toLowerCase() === normalized
  );
}
