import { Router, type IRouter } from "express";
import { db, wateringLogTable, playerStatsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAllComputedPlants } from "../lib/plantHelpers.js";
import { getLevelInfo } from "../lib/xp.js";
import { getGardenContext } from "../lib/gardenContext.js";

const router: IRouter = Router();

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

router.get("/dashboard", async (req, res): Promise<void> => {
  const ctx = getGardenContext(req, res);
  if (!ctx) return;

  const today = toIsoDate(new Date());
  let plants;
  try {
    plants = await getAllComputedPlants(ctx.gardenId);
  } catch (err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err));
    const cause = (e as NodeJS.ErrnoException).cause;
    console.error("[dashboard] getAllComputedPlants failed:", e.message, cause ? `cause: ${String(cause)}` : "");
    res.status(500).json({ error: e.message, cause: String(cause) });
    return;
  }

  plants.sort((a, b) => {
    if (a.dueToday && !b.dueToday) return -1;
    if (!a.dueToday && b.dueToday) return 1;
    return 0;
  });

  const plantsDueCount = plants.filter((p) => p.dueToday).length;

  const todayLogs = await db
    .select()
    .from(wateringLogTable)
    .where(eq(wateringLogTable.logDate, today));

  const wateredTodayIds = new Set(
    todayLogs.filter((l) => l.status === "watered").map((l) => l.plantId)
  );
  const plantsWateredToday = wateredTodayIds.size;

  const [stats] = await db
    .select()
    .from(playerStatsTable)
    .where(eq(playerStatsTable.memberId, ctx.memberId));
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
