import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Singleton row (id = 1) holding the site owner's customizable content.
export const siteSettingsTable = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  recipientName: text("recipient_name")
    .notNull()
    .default(""),
  welcomeMessage: text("welcome_message")
    .notNull()
    .default("I've been wanting to ask you something for a long time..."),
  musicUrl: text("music_url"),
  galleryPhotos: jsonb("gallery_photos").notNull().$type<string[]>().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertSiteSettingsSchema = createInsertSchema(
  siteSettingsTable,
).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettingsRow = typeof siteSettingsTable.$inferSelect;
