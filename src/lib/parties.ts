import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { parties, partyItems } from "@/db/schema";
import type { Party, PartyItem } from "@/types/party";

export interface CreatePartyInput {
  name: string;
  date: string;
  location: string;
  items: Array<{ name: string; quantity: string }>;
}

function toParty(
  party: typeof parties.$inferSelect,
  items: Array<typeof partyItems.$inferSelect>
): Party {
  return {
    id: party.id,
    name: party.name,
    date: party.date ?? "",
    location: party.location ?? "",
    items: items.map(
      (item): PartyItem => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity ?? "",
        claimedBy: item.claimedBy ?? undefined,
      })
    ),
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
        quantity: item.quantity,
      }))
    );
  }

  const created = await getPartyById(party.id);
  if (!created) {
    throw new Error("Failed to load created party");
  }

  return created;
}

export async function getPartyById(id: string): Promise<Party | null> {
  const db = getDb();

  const [party] = await db.select().from(parties).where(eq(parties.id, id));
  if (!party) return null;

  const items = await db
    .select()
    .from(partyItems)
    .where(eq(partyItems.partyId, id))
    .orderBy(asc(partyItems.name));

  return toParty(party, items);
}

export async function claimPartyItem(
  partyId: string,
  itemId: string,
  guestName: string
): Promise<{ party: Party } | { error: "not_found" | "already_claimed" }> {
  const db = getDb();

  const [claimed] = await db
    .update(partyItems)
    .set({
      claimedBy: guestName,
      claimedAt: new Date(),
    })
    .where(
      and(
        eq(partyItems.id, itemId),
        eq(partyItems.partyId, partyId),
        isNull(partyItems.claimedBy)
      )
    )
    .returning();

  if (!claimed) {
    const [existing] = await db
      .select()
      .from(partyItems)
      .where(eq(partyItems.id, itemId));

    if (!existing || existing.partyId !== partyId) {
      return { error: "not_found" };
    }

    return { error: "already_claimed" };
  }

  const party = await getPartyById(partyId);
  if (!party) {
    return { error: "not_found" };
  }

  return { party };
}
