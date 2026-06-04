import { Router, type IRouter } from "express";
import healthRouter from "./health";
import plantsRouter from "./plants";
import logRouter from "./log";
import statsRouter from "./stats";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(plantsRouter);
router.use(logRouter);
router.use(statsRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
