import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const parties = pgTable("parties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  date: date("date"),
  location: text("location").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const partyItems = pgTable("party_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  partyId: uuid("party_id")
    .notNull()
    .references(() => parties.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  unit: text("unit").default(""),
  quantityNeeded: integer("quantity_needed").notNull().default(1),
  quantityClaimed: integer("quantity_claimed").notNull().default(0),
});

export const partyClaims = pgTable(
  "party_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    partyId: uuid("party_id")
      .notNull()
      .references(() => parties.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => partyItems.id, { onDelete: "cascade" }),
    guestName: text("guest_name").notNull(),
    quantity: integer("quantity").notNull(),
    claimedAt: timestamp("claimed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("party_claims_item_guest_unique").on(table.itemId, table.guestName)]
);

export const partiesRelations = relations(parties, ({ many }) => ({
  items: many(partyItems),
  claims: many(partyClaims),
}));

export const partyItemsRelations = relations(partyItems, ({ one, many }) => ({
  party: one(parties, {
    fields: [partyItems.partyId],
    references: [parties.id],
  }),
  claims: many(partyClaims),
}));

export const partyClaimsRelations = relations(partyClaims, ({ one }) => ({
  party: one(parties, {
    fields: [partyClaims.partyId],
    references: [parties.id],
  }),
  item: one(partyItems, {
    fields: [partyClaims.itemId],
    references: [partyItems.id],
  }),
}));
