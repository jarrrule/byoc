import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { parties, partyClaims, partyItems } from "@/db/schema";
import type { ItemClaim, Party, PartyItem } from "@/types/party";

export interface CreatePartyInput {
  name: string;
  date: string;
  location: string;
  items: Array<{ name: string; quantityNeeded: number; unit: string }>;
}

type PartyResult = { party: Party } | { error: "not_found" | "insufficient_quantity" | "forbidden" };

function normalizeGuestName(name: string): string {
  return name.trim();
}

function toPartyItem(
  item: typeof partyItems.$inferSelect,
  claims: Array<typeof partyClaims.$inferSelect>
): PartyItem {
  return {
    id: item.id,
    name: item.name,
    unit: item.unit ?? "",
    quantityNeeded: item.quantityNeeded,
    quantityClaimed: item.quantityClaimed,
    claims: claims.map(
      (claim): ItemClaim => ({
        id: claim.id,
        guestName: claim.guestName,
        quantity: claim.quantity,
      })
    ),
  };
}

async function loadPartyRecord(id: string): Promise<Party | null> {
  const db = getDb();

  const [party] = await db.select().from(parties).where(eq(parties.id, id));
  if (!party) return null;

  const items = await db
    .select()
    .from(partyItems)
    .where(eq(partyItems.partyId, id))
    .orderBy(asc(partyItems.name));

  const claims = await db
    .select()
    .from(partyClaims)
    .where(eq(partyClaims.partyId, id))
    .orderBy(asc(partyClaims.claimedAt));

  const claimsByItem = new Map<string, Array<typeof partyClaims.$inferSelect>>();
  for (const claim of claims) {
    const list = claimsByItem.get(claim.itemId) ?? [];
    list.push(claim);
    claimsByItem.set(claim.itemId, list);
  }

  return {
    id: party.id,
    name: party.name,
    date: party.date ?? "",
    location: party.location ?? "",
    items: items.map((item) => toPartyItem(item, claimsByItem.get(item.id) ?? [])),
  };
}

export async function createParty(input: CreatePartyInput): Promise<Party> {
  const db = getDb();

  const [party] = await db
    .insert(parties)
    .values({
      name: input.name,
      date: input.date || null,
      location: input.location,
    })
    .returning();

  if (input.items.length > 0) {
    await db.insert(partyItems).values(
      input.items.map((item) => ({
        partyId: party.id,
        name: item.name,
        unit: item.unit,
        quantityNeeded: item.quantityNeeded,
        quantityClaimed: 0,
      }))
    );
  }

  const created = await loadPartyRecord(party.id);
  if (!created) {
    throw new Error("Failed to load created party");
  }

  return created;
}

export async function getPartyById(id: string): Promise<Party | null> {
  return loadPartyRecord(id);
}

export async function claimPartyItem(
  partyId: string,
  itemId: string,
  guestName: string,
  quantity: number
): Promise<PartyResult> {
  const db = getDb();
  const normalizedName = normalizeGuestName(guestName);

  if (!normalizedName || quantity < 1 || !Number.isInteger(quantity)) {
    return { error: "not_found" };
  }

  const claimResult = await db.transaction(async (tx) => {
    const [item] = await tx
      .select()
      .from(partyItems)
      .where(and(eq(partyItems.id, itemId), eq(partyItems.partyId, partyId)));

    if (!item) {
      return { error: "not_found" as const };
    }

    const remaining = item.quantityNeeded - item.quantityClaimed;
    if (quantity > remaining) {
      return { error: "insufficient_quantity" as const };
    }

    const [existingClaim] = await tx
      .select()
      .from(partyClaims)
      .where(
        and(eq(partyClaims.itemId, itemId), eq(partyClaims.guestName, normalizedName))
      );

    if (existingClaim) {
      await tx
        .update(partyClaims)
        .set({ quantity: existingClaim.quantity + quantity })
        .where(eq(partyClaims.id, existingClaim.id));
    } else {
      await tx.insert(partyClaims).values({
        partyId,
        itemId,
        guestName: normalizedName,
        quantity,
      });
    }

    await tx
      .update(partyItems)
      .set({ quantityClaimed: item.quantityClaimed + quantity })
      .where(eq(partyItems.id, itemId));

    return { ok: true as const };
  });

  if ("error" in claimResult && claimResult.error) {
    return { error: claimResult.error };
  }

  const party = await loadPartyRecord(partyId);
  if (!party) {
    return { error: "not_found" };
  }

  return { party };
}

export async function unclaimPartyItem(
  partyId: string,
  itemId: string,
  guestName: string
): Promise<PartyResult> {
  const db = getDb();
  const normalizedName = normalizeGuestName(guestName);

  if (!normalizedName) {
    return { error: "forbidden" };
  }

  const unclaimResult = await db.transaction(async (tx) => {
    const [claim] = await tx
      .select()
      .from(partyClaims)
      .where(
        and(
          eq(partyClaims.itemId, itemId),
          eq(partyClaims.partyId, partyId),
          eq(partyClaims.guestName, normalizedName)
        )
      );

    if (!claim) {
      return { error: "forbidden" as const };
    }

    const [item] = await tx
      .select()
      .from(partyItems)
      .where(and(eq(partyItems.id, itemId), eq(partyItems.partyId, partyId)));

    if (!item) {
      return { error: "not_found" as const };
    }

    await tx.delete(partyClaims).where(eq(partyClaims.id, claim.id));

    await tx
      .update(partyItems)
      .set({
        quantityClaimed: Math.max(0, item.quantityClaimed - claim.quantity),
      })
      .where(eq(partyItems.id, itemId));

    return { ok: true as const };
  });

  if ("error" in unclaimResult && unclaimResult.error) {
    return { error: unclaimResult.error };
  }

  const party = await loadPartyRecord(partyId);
  if (!party) {
    return { error: "not_found" };
  }

  return { party };
}
