import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, bookingsTable, visitorResponsesTable, visitsTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";
const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const proposalId = req.query.proposalId == null ? undefined : Number(req.query.proposalId);
  const hasProposalId = proposalId != null && !Number.isNaN(proposalId);

  const responseFilter = hasProposalId
    ? eq(visitorResponsesTable.proposalId, proposalId)
    : undefined;
  const bookingFilter = hasProposalId
    ? eq(bookingsTable.proposalId, proposalId)
    : undefined;

  const [[{ totalVisitors }], [{ totalBookings }], [{ acceptedCount }], [{ maybeCount }], [{ declinedCount }], recentBookings, recentResponses] =
    await Promise.all([
      hasProposalId
        ? db.select({ totalVisitors: sql<number>`count(*)::int` }).from(visitorResponsesTable).where(responseFilter!)
        : db.select({ totalVisitors: sql<number>`count(*)::int` }).from(visitsTable),
      hasProposalId
        ? db.select({ totalBookings: sql<number>`count(*)::int` }).from(bookingsTable).where(bookingFilter!)
        : db.select({ totalBookings: sql<number>`count(*)::int` }).from(bookingsTable),
      db
        .select({ acceptedCount: sql<number>`count(*)::int` })
        .from(visitorResponsesTable)
        .where(
          responseFilter
            ? and(responseFilter, eq(visitorResponsesTable.response, "yes"))
            : eq(visitorResponsesTable.response, "yes"),
        ),
      db
        .select({ maybeCount: sql<number>`count(*)::int` })
        .from(visitorResponsesTable)
        .where(
          responseFilter
            ? and(responseFilter, eq(visitorResponsesTable.response, "maybe"))
            : eq(visitorResponsesTable.response, "maybe"),
        ),
      db
        .select({ declinedCount: sql<number>`count(*)::int` })
        .from(visitorResponsesTable)
        .where(
          responseFilter
            ? and(responseFilter, eq(visitorResponsesTable.response, "not_now"))
            : eq(visitorResponsesTable.response, "not_now"),
        ),
      db
        .select()
        .from(bookingsTable)
        .where(bookingFilter)
        .orderBy(desc(bookingsTable.createdAt))
        .limit(5),
      db
        .select()
        .from(visitorResponsesTable)
        .where(responseFilter)
        .orderBy(desc(visitorResponsesTable.createdAt))
        .limit(5),
    ]);

  res.json(
    GetStatsResponse.parse({
      totalVisitors,
      totalBookings,
      acceptedCount,
      maybeCount,
      declinedCount,
      recentBookings,
      recentResponses,
    }),
  );
});

export default router;
