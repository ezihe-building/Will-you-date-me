import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { proposalsTable } from "./proposals";

export const visitorResponsesTable = pgTable("visitor_responses", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => proposalsTable.id, {
    onDelete: "cascade",
  }),
  response: text("response").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertVisitorResponseSchema = createInsertSchema(
  visitorResponsesTable,
).omit({
  id: true,
  createdAt: true,
});
export type InsertVisitorResponse = z.infer<typeof insertVisitorResponseSchema>;
export type VisitorResponseRow = typeof visitorResponsesTable.$inferSelect;
