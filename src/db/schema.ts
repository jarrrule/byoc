import { relations } from "drizzle-orm";
import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
  quantity: text("quantity").default(""),
  claimedBy: text("claimed_by"),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
});

export const partiesRelations = relations(parties, ({ many }) => ({
  items: many(partyItems),
}));

export const partyItemsRelations = relations(partyItems, ({ one }) => ({
  party: one(parties, {
    fields: [partyItems.partyId],
    references: [parties.id],
  }),
}));
