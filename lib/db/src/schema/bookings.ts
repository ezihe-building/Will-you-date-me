import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { proposalsTable } from "./proposals";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => proposalsTable.id, {
    onDelete: "cascade",
  }),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  customLocation: text("custom_location"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
