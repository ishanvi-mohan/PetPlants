import { Router, type IRouter } from "express";
import { db, playerStatsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getLevelInfo } from "../lib/xp";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [stats] = await db.select().from(playerStatsTable).where(eq(playerStatsTable.id, 1));

  if (!stats) {
    res.json({
      totalXp: 0,
      currentLevel: 1,
      levelTitle: "Seedling",
      currentStreak: 0,
      longestStreak: 0,
      xpToNextLevel: 100,
      xpForCurrentLevel: 0,
    });
    return;
  }

  const levelInfo = getLevelInfo(stats.totalXp);
  res.json({
    totalXp: stats.totalXp,
    currentLevel: stats.currentLevel,
    levelTitle: levelInfo.levelTitle,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    xpToNextLevel: levelInfo.xpToNextLevel,
    xpForCurrentLevel: levelInfo.xpForCurrentLevel,
  });
});

export default router;
