import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import visitsRouter from "./visits";
import responsesRouter from "./responses";
import bookingsRouter from "./bookings";
import statsRouter from "./stats";
import proposalsRouter from "./proposals";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(visitsRouter);
router.use(responsesRouter);
router.use(bookingsRouter);
router.use(statsRouter);
router.use(proposalsRouter);
router.use(settingsRouter);

export default router;
