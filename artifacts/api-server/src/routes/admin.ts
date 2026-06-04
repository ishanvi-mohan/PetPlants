import { Router, type IRouter } from "express";
import { db, plantsTable, playerStatsTable } from "@workspace/db";
import { wateringLogTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/admin/reset", async (req, res) => {
  await db.execute(sql`TRUNCATE TABLE watering_log, plants RESTART IDENTITY CASCADE`);
  await db.delete(playerStatsTable);
  await db.insert(playerStatsTable).values({
    id: 1,
    totalXp: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActionDate: null,
  });
  res.json({ ok: true, message: "Data reset complete" });
});

export default router;
