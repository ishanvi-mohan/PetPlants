import { Router, type IRouter } from "express";
import { db, wateringLogTable, playerStatsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getAllComputedPlants } from "../lib/plantHelpers";
import { getLevelInfo } from "../lib/xp";

const router: IRouter = Router();

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

router.get("/dashboard", async (_req, res): Promise<void> => {
  const today = toIsoDate(new Date());

  const plants = await getAllComputedPlants();

  // Sort: due today first
  plants.sort((a, b) => {
    if (a.dueToday && !b.dueToday) return -1;
    if (!a.dueToday && b.dueToday) return 1;
    return 0;
  });

  const plantsDueCount = plants.filter((p) => p.dueToday).length;

  // Plants watered today
  const todayLogs = await db
    .select()
    .from(wateringLogTable)
    .where(eq(wateringLogTable.logDate, today));

  const wateredTodayIds = new Set(
    todayLogs.filter((l) => l.status === "watered").map((l) => l.plantId)
  );
  const plantsWateredToday = wateredTodayIds.size;

  // Player stats
  const [stats] = await db.select().from(playerStatsTable).where(eq(playerStatsTable.id, 1));
  const levelInfo = getLevelInfo(stats?.totalXp ?? 0);

  res.json({
    plants,
    summary: {
      plantsDueCount,
      plantsWateredToday,
      totalPlants: plants.length,
    },
    stats: {
      totalXp: stats?.totalXp ?? 0,
      currentLevel: stats?.currentLevel ?? 1,
      levelTitle: levelInfo.levelTitle,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      xpToNextLevel: levelInfo.xpToNextLevel,
      xpForCurrentLevel: levelInfo.xpForCurrentLevel,
    },
  });
});

export default router;
