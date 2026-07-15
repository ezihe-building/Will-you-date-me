import { Router, type IRouter } from "express";
import { LoginBody, LoginResponse, LogoutResponse, GetAuthStatusResponse } from "@workspace/api-zod";
import {
  ADMIN_COOKIE_OPTIONS,
  ADMIN_SESSION_COOKIE,
  checkAdminPassword,
  isValidAdminSession,
  signAdminSession,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!checkAdminPassword(parsed.data.password)) {
    req.log.warn("Failed owner dashboard login attempt");
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.cookie(ADMIN_SESSION_COOKIE, signAdminSession(), ADMIN_COOKIE_OPTIONS);
  res.json(LoginResponse.parse({ authenticated: true }));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  res.clearCookie(ADMIN_SESSION_COOKIE, { path: "/" });
  res.json(LogoutResponse.parse({ authenticated: false }));
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const cookieValue = req.cookies?.[ADMIN_SESSION_COOKIE];
  res.json(
    GetAuthStatusResponse.parse({
      authenticated: isValidAdminSession(cookieValue),
    }),
  );
});

export default router;
