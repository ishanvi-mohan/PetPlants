import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gardensRouter from "./gardens";
import plantsRouter from "./plants";
import logRouter from "./log";
import statsRouter from "./stats";
import dashboardRouter from "./dashboard";
const router: IRouter = Router();

router.use(healthRouter);
router.use(gardensRouter);
router.use(plantsRouter);
router.use(logRouter);
router.use(statsRouter);
router.use(dashboardRouter);

export default router;
