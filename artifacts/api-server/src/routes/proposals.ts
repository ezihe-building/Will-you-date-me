import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  CreateProposalBody,
  CreateProposalResponse,
  DeleteProposalResponse,
  GetProposalResponse,
  ListProposalsResponse,
  ResetProposalResponse,
  VerifyProposalBody,
  VerifyProposalResponse,
} from "@workspace/api-zod";
import { db, bookingsTable, proposalsTable, visitorResponsesTable } from "@workspace/db";

const router: IRouter = Router();

function slugifyRecipientName(recipientName: string): string {
  return recipientName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;

  while (true) {
    const [existing] = await db
      .select({ id: proposalsTable.id })
      .from(proposalsTable)
      .where(eq(proposalsTable.slug, slug));

    if (!existing) {
      return slug;
    }

    const suffix = Math.random().toString(36).slice(2, 6);
    slug = `${baseSlug}-${suffix}`;
  }
}

router.get("/proposals", async (_req, res): Promise<void> => {
  const proposals = await db.select().from(proposalsTable).orderBy(desc(proposalsTable.createdAt));
  res.json(ListProposalsResponse.parse(proposals));
});

router.post("/proposals", async (req, res): Promise<void> => {
  const parsed = CreateProposalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const recipientName = parsed.data.recipientName.trim();
  if (!recipientName) {
    res.status(400).json({ error: "recipientName is required" });
    return;
  }

  const slug = parsed.data.slug?.trim() || (await generateUniqueSlug(slugifyRecipientName(recipientName)));

  const [created] = await db
    .insert(proposalsTable)
    .values({
      slug,
      recipientName,
      welcomeMessage: parsed.data.welcomeMessage ?? null,
    })
    .returning();

  res.status(201).json(CreateProposalResponse.parse(created));
});

router.get("/proposals/:slug", async (req, res): Promise<void> => {
  const [proposal] = await db
    .select({
      slug: proposalsTable.slug,
      welcomeMessage: proposalsTable.welcomeMessage,
      isActive: proposalsTable.isActive,
    })
    .from(proposalsTable)
    .where(and(eq(proposalsTable.slug, req.params.slug), eq(proposalsTable.isActive, true)));

  if (!proposal) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(GetProposalResponse.parse(proposal));
});

router.post("/proposals/:slug/verify", async (req, res): Promise<void> => {
  const parsed = VerifyProposalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [proposal] = await db.select().from(proposalsTable).where(eq(proposalsTable.slug, req.params.slug));

  if (!proposal || !proposal.isActive) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (proposal.recipientName.trim().toLowerCase() !== parsed.data.name.trim().toLowerCase()) {
    res.status(403).json({ error: "That's not the right name" });
    return;
  }

  res.json(VerifyProposalResponse.parse(proposal));
});

router.delete("/proposals/:slug", async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [deleted] = await db.delete(proposalsTable).where(eq(proposalsTable.slug, slug)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(DeleteProposalResponse.parse(deleted));
});

router.post("/proposals/:slug/reset", async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [proposal] = await db.select().from(proposalsTable).where(eq(proposalsTable.slug, slug));
  if (!proposal) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db.delete(visitorResponsesTable).where(eq(visitorResponsesTable.proposalId, proposal.id));
  await db.delete(bookingsTable).where(eq(bookingsTable.proposalId, proposal.id));

  res.json(ResetProposalResponse.parse(proposal));
});

export default router;
