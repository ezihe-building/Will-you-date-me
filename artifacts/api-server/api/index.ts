import type { VercelRequest, VercelResponse } from "@vercel/node";
// @ts-expect-error - dist/index.mjs is compiled JS and does not have type declarations
import app from "../dist/index.mjs";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
