import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_PAYLOAD = "date-with-me-admin";

function getSessionSecret(): string {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is required but was not provided.",
    );
  }
  return secret;
}

export function signAdminSession(): string {
  return createHmac("sha256", getSessionSecret())
    .update(SESSION_PAYLOAD)
    .digest("hex");
}

export function isValidAdminSession(cookieValue: unknown): boolean {
  if (typeof cookieValue !== "string" || cookieValue.length === 0) {
    return false;
  }

  const expected = signAdminSession();
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(cookieValue, "hex");

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, actualBuf);
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env["ADMIN_PASSWORD"]);
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) {
    logger.warn(
      "ADMIN_PASSWORD is not configured; owner dashboard login will always fail.",
    );
    return false;
  }

  // Guard against accidental leading/trailing whitespace in either the stored
  // secret or the user's input. Use constant-time comparison after normalizing.
  const expectedBuf = Buffer.from(expected.trim());
  const actualBuf = Buffer.from(password.trim());

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, actualBuf);
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const cookieValue = req.cookies?.[ADMIN_SESSION_COOKIE];

  if (!isValidAdminSession(cookieValue)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  next();
}

const isProduction = process.env.NODE_ENV === "production";

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "none" as const,
  secure: isProduction,
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  path: "/",
};
