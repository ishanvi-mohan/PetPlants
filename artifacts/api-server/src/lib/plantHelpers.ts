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
  postponedDaysAfter: number,
  createdAt?: Date
): string | null {
  // Never been watered — due on the day it was added, shifted by any skips
  if (!lastWateredDate) {
    if (!createdAt) return null;
    const base = new Date(toIsoDate(createdAt) + "T00:00:00Z");
    base.setUTCDate(base.getUTCDate() + postponedDaysAfter);
    return toIsoDate(base);
  }
  const base = new Date(lastWateredDate + "T00:00:00Z");
  base.setUTCDate(base.getUTCDate() + frequencyDays + postponedDaysAfter);
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

  // Count postponed entries logged AFTER the last watered date (or all of them if never watered)
  let postponedAfterWatered = 0;
  if (lastWateredDate) {
    postponedAfterWatered = logs.filter(
      (l) => l.status === "postponed" && l.logDate > lastWateredDate
    ).length;
  } else {
    postponedAfterWatered = logs.filter((l) => l.status === "postponed").length;
  }

  const nextWaterDate = computeNextWaterDate(lastWateredDate, plant.frequencyDays, postponedAfterWatered, plant.createdAt);

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

export async function getPlantHistory(plantId: number): Promise<Array<{
  date: string;
  status: string | null;
  xpAwarded: number | null;
  notes: string | null;
}>> {
  const today = new Date();
  const results = [];

  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = toIsoDate(d);

    const [logEntry] = await db
      .select()
      .from(wateringLogTable)
      .where(
        and(
          eq(wateringLogTable.plantId, plantId),
          eq(wateringLogTable.logDate, dateStr)
        )
      );

    results.push({
      date: dateStr,
      status: logEntry?.status ?? null,
      xpAwarded: logEntry?.xpAwarded ?? null,
      notes: logEntry?.notes ?? null,
    });
  }

  return results;
}
