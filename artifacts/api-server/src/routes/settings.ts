import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";
import { GetSettingsResponse, UpdateSettingsBody, UpdateSettingsResponse } from "@workspace/api-zod";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { requireAdmin } from "../lib/auth";
const router: IRouter = Router();

const SETTINGS_ID = 1;

async function getOrCreateSettings() {
  const [existing] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.id, SETTINGS_ID));

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(siteSettingsTable)
    .values({ id: SETTINGS_ID })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  const [row] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.id, SETTINGS_ID));

  return row;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json(GetSettingsResponse.parse(settings));
});

router.put("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await getOrCreateSettings();

  const [updated] = await db
    .update(siteSettingsTable)
    .set({
      recipientName: parsed.data.recipientName,
      welcomeMessage: parsed.data.welcomeMessage,
      musicUrl: parsed.data.musicUrl ?? null,
      galleryPhotos: parsed.data.galleryPhotos,
    })
    .where(eq(siteSettingsTable.id, SETTINGS_ID))
    .returning();

  req.log.info("Updated site settings");
  res.json(UpdateSettingsResponse.parse(updated));
});

export default router;
