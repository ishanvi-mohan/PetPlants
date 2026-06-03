import { Router, type IRouter } from "express";
import { db, plantsTable, wateringLogTable, playerStatsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { LogWateringBody } from "@workspace/api-zod";
import { getComputedPlant } from "../lib/plantHelpers";
import { calcWateringXp, getLevelInfo, XP_POSTPONE, XP_STREAK_3, XP_STREAK_7 } from "../lib/xp";

const router: IRouter = Router();

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

router.post("/log", async (req, res): Promise<void> => {
  const parsed = LogWateringBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { plantId, status, logDate } = parsed.data;
  const today = logDate ?? toIsoDate(new Date());

  // Check plant exists
  const [plant] = await db
    .select()
    .from(plantsTable)
    .where(eq(plantsTable.id, plantId));

  if (!plant) {
    res.status(404).json({ error: "Plant not found" });
    return;
  }

  // Get player stats
  const [stats] = await db.select().from(playerStatsTable).where(eq(playerStatsTable.id, 1));
  const currentXp = stats?.totalXp ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const longestStreak = stats?.longestStreak ?? 0;
  const lastActionDate = stats?.lastActionDate ?? null;

  let xpAwarded = 0;
  let streakBonus = 0;
  let noteText: string | null = null;

  if (status === "watered") {
    // Figure out how many days overdue
    const recentLogs = await db
      .select()
      .from(wateringLogTable)
      .where(eq(wateringLogTable.plantId, plantId))
      .orderBy(desc(wateringLogTable.logDate));

    const lastWatered = recentLogs.find((l) => l.status === "watered");
    const lastWateredDate = lastWatered?.logDate ?? null;

    let daysOverdue = 0;
    if (lastWateredDate) {
      const postponedAfter = recentLogs.filter(
        (l) => l.status === "postponed" && l.logDate > lastWateredDate
      ).length;
      const expectedDate = new Date(lastWateredDate + "T00:00:00Z");
      expectedDate.setUTCDate(expectedDate.getUTCDate() + plant.frequencyDays + postponedAfter);
      const todayDate = new Date(today + "T00:00:00Z");
      daysOverdue = Math.max(
        0,
        Math.floor((todayDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    xpAwarded = calcWateringXp(daysOverdue);

    // Streak update
    let newStreak = currentStreak;
    const yesterday = new Date(today + "T00:00:00Z");
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = toIsoDate(yesterday);

    if (lastActionDate === yesterday.toISOString().slice(0, 10) || lastActionDate === today) {
      newStreak = currentStreak + 1;
    } else if (lastActionDate !== today) {
      newStreak = 1;
    }

    // Streak bonuses
    if (newStreak % 7 === 0) {
      streakBonus = XP_STREAK_7;
    } else if (newStreak % 3 === 0) {
      streakBonus = XP_STREAK_3;
    }

    const totalXpGained = xpAwarded + streakBonus;
    const newTotalXp = currentXp + totalXpGained;
    const oldLevelInfo = getLevelInfo(currentXp);
    const newLevelInfo = getLevelInfo(newTotalXp);
    const leveledUp = newLevelInfo.currentLevel > oldLevelInfo.currentLevel;

    // Insert log
    await db.insert(wateringLogTable).values({
      plantId,
      logDate: today,
      status: "watered",
      notes: null,
      xpAwarded: totalXpGained,
    });

    // Update stats
    const newLongest = Math.max(longestStreak, newStreak);
    await db
      .update(playerStatsTable)
      .set({
        totalXp: newTotalXp,
        currentLevel: newLevelInfo.currentLevel,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActionDate: today,
      })
      .where(eq(playerStatsTable.id, 1));

    const [updatedStats] = await db.select().from(playerStatsTable).where(eq(playerStatsTable.id, 1));
    const computedPlant = await getComputedPlant(plantId);
    const finalLevelInfo = getLevelInfo(updatedStats?.totalXp ?? 0);

    res.json({
      xpAwarded: totalXpGained,
      streakBonus,
      leveledUp,
      plant: computedPlant,
      stats: {
        totalXp: updatedStats?.totalXp ?? 0,
        currentLevel: finalLevelInfo.currentLevel,
        levelTitle: finalLevelInfo.levelTitle,
        xpForCurrentLevel: finalLevelInfo.xpForCurrentLevel,
        xpToNextLevel: finalLevelInfo.xpToNextLevel,
        currentStreak: updatedStats?.currentStreak ?? 0,
        longestStreak: updatedStats?.longestStreak ?? 0,
      },
    });
  } else {
    // postponed
    noteText = `Shifted — soil moist on ${today}`;
    xpAwarded = XP_POSTPONE;

    const newTotalXp = currentXp + xpAwarded;
    const newLevelInfo = getLevelInfo(newTotalXp);

    await db.insert(wateringLogTable).values({
      plantId,
      logDate: today,
      status: "postponed",
      notes: noteText,
      xpAwarded,
    });

    await db
      .update(playerStatsTable)
      .set({
        totalXp: newTotalXp,
        currentLevel: newLevelInfo.currentLevel,
        lastActionDate: today,
      })
      .where(eq(playerStatsTable.id, 1));

    const [updatedStats] = await db.select().from(playerStatsTable).where(eq(playerStatsTable.id, 1));
    const computedPlant = await getComputedPlant(plantId);
    const finalLevelInfo2 = getLevelInfo(updatedStats?.totalXp ?? 0);

    res.json({
      xpAwarded,
      streakBonus: 0,
      leveledUp: false,
      plant: computedPlant,
      stats: {
        totalXp: updatedStats?.totalXp ?? 0,
        currentLevel: finalLevelInfo2.currentLevel,
        levelTitle: finalLevelInfo2.levelTitle,
        xpForCurrentLevel: finalLevelInfo2.xpForCurrentLevel,
        xpToNextLevel: finalLevelInfo2.xpToNextLevel,
        currentStreak: updatedStats?.currentStreak ?? 0,
        longestStreak: updatedStats?.longestStreak ?? 0,
      },
    });
  }
});

export default router;
