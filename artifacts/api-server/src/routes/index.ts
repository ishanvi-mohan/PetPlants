import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import gardensRouter from "./gardens.js";
import plantsRouter from "./plants.js";
import logRouter from "./log.js";
import statsRouter from "./stats.js";
import dashboardRouter from "./dashboard.js";
const router: IRouter = Router();

router.use(healthRouter);
router.use(gardensRouter);
router.use(plantsRouter);
router.use(logRouter);
router.use(statsRouter);
router.use(dashboardRouter);

export default router;
