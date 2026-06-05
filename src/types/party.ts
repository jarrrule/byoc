export interface PartyItem {
  id: string;
  name: string;
  quantity: string;
  claimedBy?: string;
}

export interface Party {
  id: string;
  name: string;
  date: string;
  location: string;
  items: PartyItem[];
}
