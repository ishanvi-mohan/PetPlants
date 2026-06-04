import { db, plantsTable, wateringLogTable } from "@workspace/db";
import { eq, desc, and, gte } from "drizzle-orm";

export type PlantState = "happy" | "thirsty" | "resting" | "postponed";

export interface ComputedPlant {
  id: number;
  name: string;
  species: string | null;
  frequencyDays: number;
  waterAmount: string | null;
  notes: string | null;
  location: string | null;
  emoticonStyle: string;
  createdAt: string;
  nextWaterDate: string | null;
  lastWateredDate: string | null;
  state: PlantState;
  dueToday: boolean;
  totalXp: number;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeNextWaterDate(
  lastWateredDate: string | null,
  frequencyDays: number,
  createdAt?: Date
): string | null {
  if (!lastWateredDate) {
    // Never been watered — due on the day it was added
    return createdAt ? toIsoDate(createdAt) : null;
  }
  const base = new Date(lastWateredDate + "T00:00:00Z");
  base.setUTCDate(base.getUTCDate() + frequencyDays);
  return toIsoDate(base);
}

export async function getComputedPlant(plantId: number): Promise<ComputedPlant | null> {
  const [plant] = await db
    .select()
    .from(plantsTable)
    .where(eq(plantsTable.id, plantId));
  if (!plant) return null;
  return computePlant(plant);
}

async function computePlant(plant: typeof plantsTable.$inferSelect): Promise<ComputedPlant> {
  const today = toIsoDate(new Date());

  // Get all log entries for this plant, ordered by date desc
  const logs = await db
    .select()
    .from(wateringLogTable)
    .where(eq(wateringLogTable.plantId, plant.id))
    .orderBy(desc(wateringLogTable.logDate));

  // Find last watered date
  const lastWateredEntry = logs.find((l) => l.status === "watered");
  const lastWateredDate = lastWateredEntry?.logDate ?? null;

  // Find the most recent postponed entry after the last watered date (or any postpone if never watered)
  const relevantPostpones = lastWateredDate
    ? logs.filter((l) => l.status === "postponed" && l.logDate > lastWateredDate)
    : logs.filter((l) => l.status === "postponed");
  const latestPostpone = relevantPostpones.length > 0
    ? relevantPostpones.reduce((a, b) => (a.logDate >= b.logDate ? a : b))
    : null;

  let nextWaterDate: string | null;
  if (latestPostpone) {
    // Skip shifts next date to the day after the most recent skip
    const base = new Date(latestPostpone.logDate + "T00:00:00Z");
    base.setUTCDate(base.getUTCDate() + 1);
    nextWaterDate = toIsoDate(base);
  } else {
    nextWaterDate = computeNextWaterDate(lastWateredDate, plant.frequencyDays, plant.createdAt);
  }

  // Determine state
  const todayLog = logs.find((l) => l.logDate === today);
  let state: PlantState = "happy";

  if (todayLog?.status === "watered") {
    state = "resting";
  } else if (todayLog?.status === "postponed") {
    state = "postponed";
  } else if (nextWaterDate && nextWaterDate < today) {
    state = "thirsty";
  } else if (nextWaterDate === today) {
    state = "happy";
  } else {
    state = "happy";
  }

  // Due today: next water date is today or overdue, and not already logged today
  const dueToday =
    !todayLog &&
    nextWaterDate !== null &&
    nextWaterDate <= today;

  // Total XP earned from this plant
  const totalXp = logs.reduce((sum, l) => sum + (l.xpAwarded ?? 0), 0);

  return {
    id: plant.id,
    name: plant.name,
    species: plant.species ?? null,
    frequencyDays: plant.frequencyDays,
    waterAmount: plant.waterAmount ?? null,
    notes: plant.notes ?? null,
    location: plant.location ?? null,
    emoticonStyle: plant.emoticonStyle,
    createdAt: plant.createdAt.toISOString(),
    nextWaterDate,
    lastWateredDate: lastWateredDate ?? null,
    state,
    dueToday,
    totalXp,
  };
}

export async function getAllComputedPlants(): Promise<ComputedPlant[]> {
  const plants = await db.select().from(plantsTable).orderBy(plantsTable.createdAt);
  return Promise.all(plants.map(computePlant));
}

export async function getPlantHistory(
  plantId: number,
  plant: typeof plantsTable.$inferSelect
): Promise<Array<{
  date: string;
  status: string | null;
  xpAwarded: number | null;
  notes: string | null;
}>> {
  const todayStr = toIsoDate(new Date());

  // Fetch all logs for this plant (entire history, for schedule replay)
  const allLogs = await db
    .select()
    .from(wateringLogTable)
    .where(eq(wateringLogTable.plantId, plantId))
    .orderBy(wateringLogTable.logDate);

  const results = [];

  for (let i = 9; i >= 0; i--) {
    const d = new Date(todayStr + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = toIsoDate(d);

    const logEntry = allLogs.find((l) => l.logDate === dateStr);

    let status: string | null = logEntry?.status ?? null;

    // For past days with no log entry, check if the plant was due (= missed)
    if (!status && dateStr < todayStr) {
      const logsUpToDay = allLogs.filter((l) => l.logDate <= dateStr);
      const lastWatered = [...logsUpToDay].reverse().find((l) => l.status === "watered");
      const lastWateredDate = lastWatered?.logDate ?? null;

      const relevantPostpones = lastWateredDate
        ? logsUpToDay.filter((l) => l.status === "postponed" && l.logDate > lastWateredDate)
        : logsUpToDay.filter((l) => l.status === "postponed");
      const latestPostpone = relevantPostpones.length > 0
        ? relevantPostpones.reduce((a, b) => (a.logDate >= b.logDate ? a : b))
        : null;

      let dueDateAsOf: string | null;
      if (latestPostpone) {
        const base = new Date(latestPostpone.logDate + "T00:00:00Z");
        base.setUTCDate(base.getUTCDate() + 1);
        dueDateAsOf = toIsoDate(base);
      } else if (lastWateredDate) {
        const base = new Date(lastWateredDate + "T00:00:00Z");
        base.setUTCDate(base.getUTCDate() + plant.frequencyDays);
        dueDateAsOf = toIsoDate(base);
      } else {
        dueDateAsOf = toIsoDate(plant.createdAt);
      }

      if (dueDateAsOf !== null && dueDateAsOf <= dateStr) {
        status = "missed";
      }
    }

    results.push({
      date: dateStr,
      status,
      xpAwarded: logEntry?.xpAwarded ?? null,
      notes: logEntry?.notes ?? null,
    });
  }

  return results;
}
