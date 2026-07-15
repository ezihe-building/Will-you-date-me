import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, bookingsTable } from "@workspace/db";
import { CreateBookingBody, CreateBookingResponse, ListBookingsResponse } from "@workspace/api-zod";
const router: IRouter = Router();

const VALID_LOCATIONS = new Set([
  "coffee_shop",
  "cinema",
  "restaurant",
  "beach",
  "park",
  "custom",
]);

router.get("/bookings", async (_req, res): Promise<void> => {
  const proposalId = _req.query.proposalId == null ? undefined : Number(_req.query.proposalId);
  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(proposalId == null || Number.isNaN(proposalId) ? undefined : eq(bookingsTable.proposalId, proposalId))
    .orderBy(desc(bookingsTable.createdAt));

  res.json(ListBookingsResponse.parse(bookings));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date, time, location, customLocation } = parsed.data;

  if (!VALID_LOCATIONS.has(location)) {
    res.status(400).json({ error: "Invalid location" });
    return;
  }

  if (location === "custom" && (customLocation == null || customLocation.trim() === "")) {
    res.status(400).json({ error: "customLocation is required when location is custom" });
    return;
  }

  const [created] = await db
    .insert(bookingsTable)
    .values({
      proposalId: parsed.data.proposalId ?? null,
      date,
      time,
      location,
      customLocation: location === "custom" ? customLocation : null,
    })
    .returning();

  req.log.info({ bookingId: created.id }, "Created booking");
  res.status(201).json(CreateBookingResponse.parse(created));
});

export default router;
