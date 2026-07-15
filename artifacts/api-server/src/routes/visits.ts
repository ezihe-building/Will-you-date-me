import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, visitsTable } from "@workspace/db";
import { RecordVisitResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/visits", async (req, res): Promise<void> => {
  await db.insert(visitsTable).values({});

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(visitsTable);

  req.log.info({ totalVisitors: count }, "Recorded visit");
  res.status(201).json(RecordVisitResponse.parse({ totalVisitors: count }));
});

export default router;
