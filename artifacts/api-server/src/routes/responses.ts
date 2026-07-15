import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, visitorResponsesTable } from "@workspace/db";
import { CreateResponseBody, CreateResponseResponse, ListResponsesResponse } from "@workspace/api-zod";
const router: IRouter = Router();

const VALID_RESPONSES = new Set(["yes", "maybe", "not_now"]);

router.get("/responses", async (_req, res): Promise<void> => {
  const proposalId = _req.query.proposalId == null ? undefined : Number(_req.query.proposalId);
  const responses = await db
    .select()
    .from(visitorResponsesTable)
    .where(proposalId == null || Number.isNaN(proposalId) ? undefined : eq(visitorResponsesTable.proposalId, proposalId))
    .orderBy(desc(visitorResponsesTable.createdAt));

  res.json(ListResponsesResponse.parse(responses));
});

router.post("/responses", async (req, res): Promise<void> => {
  const parsed = CreateResponseBody.safeParse(req.body);
  if (!parsed.success || !VALID_RESPONSES.has(parsed.data.response)) {
    res.status(400).json({ error: "Invalid response value" });
    return;
  }

  const [created] = await db
    .insert(visitorResponsesTable)
    .values({ response: parsed.data.response, proposalId: parsed.data.proposalId ?? null })
    .returning();

  req.log.info({ response: parsed.data.response }, "Recorded visitor response");
  res.status(201).json(CreateResponseResponse.parse(created));
});

export default router;
