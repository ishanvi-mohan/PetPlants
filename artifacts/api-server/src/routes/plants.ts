import { Router, type IRouter } from "express";
import { db, plantsTable, playerStatsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreatePlantBody,
  GetPlantParams,
  UpdatePlantParams,
  UpdatePlantBody,
  DeletePlantParams,
  GetPlantHistoryParams,
} from "@workspace/api-zod";
import {
  getAllComputedPlants,
  getComputedPlant,
  getPlantHistory,
} from "../lib/plantHelpers";
import { getLevelInfo, XP_ADD_PLANT } from "../lib/xp";

const router: IRouter = Router();

router.get("/plants", async (_req, res): Promise<void> => {
  const plants = await getAllComputedPlants();
  res.json(plants);
});

router.post("/plants", async (req, res): Promise<void> => {
  const parsed = CreatePlantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, species, frequencyDays, waterAmount, notes, location, emoticonStyle } = parsed.data;

  const [plant] = await db
    .insert(plantsTable)
    .values({
      name,
      species: species ?? null,
      frequencyDays,
      waterAmount: waterAmount ?? null,
      notes: notes ?? null,
      location: location ?? null,
      emoticonStyle: emoticonStyle ?? "leafy",
    })
    .returning();

  // Award XP for adding a plant
  const [stats] = await db.select().from(playerStatsTable).where(eq(playerStatsTable.id, 1));
  const newXp = (stats?.totalXp ?? 0) + XP_ADD_PLANT;
  const newLevelInfo = getLevelInfo(newXp);

  await db
    .update(playerStatsTable)
    .set({ totalXp: newXp, currentLevel: newLevelInfo.currentLevel })
    .where(eq(playerStatsTable.id, 1));

  const [updatedStats] = await db.select().from(playerStatsTable).where(eq(playerStatsTable.id, 1));
  const computedPlant = await getComputedPlant(plant.id);
  const levelInfo = getLevelInfo(updatedStats?.totalXp ?? 0);

  res.status(201).json({
    plant: computedPlant,
    xpAwarded: XP_ADD_PLANT,
    stats: {
      totalXp: updatedStats?.totalXp ?? 0,
      currentLevel: levelInfo.currentLevel,
      levelTitle: levelInfo.levelTitle,
      xpForCurrentLevel: levelInfo.xpForCurrentLevel,
      xpToNextLevel: levelInfo.xpToNextLevel,
      currentStreak: updatedStats?.currentStreak ?? 0,
      longestStreak: updatedStats?.longestStreak ?? 0,
    },
  });
});

router.get("/plants/:id", async (req, res): Promise<void> => {
  const params = GetPlantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const plant = await getComputedPlant(params.data.id);
  if (!plant) {
    res.status(404).json({ error: "Plant not found" });
    return;
  }

  res.json(plant);
});

router.put("/plants/:id", async (req, res): Promise<void> => {
  const params = UpdatePlantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePlantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.species !== undefined) updateData.species = parsed.data.species;
  if (parsed.data.frequencyDays !== undefined) updateData.frequencyDays = parsed.data.frequencyDays;
  if (parsed.data.waterAmount !== undefined) updateData.waterAmount = parsed.data.waterAmount;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.location !== undefined) updateData.location = parsed.data.location;
  if (parsed.data.emoticonStyle !== undefined) updateData.emoticonStyle = parsed.data.emoticonStyle;

  const [updated] = await db
    .update(plantsTable)
    .set(updateData)
    .where(eq(plantsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Plant not found" });
    return;
  }

  const plant = await getComputedPlant(updated.id);
  res.json(plant);
});

router.delete("/plants/:id", async (req, res): Promise<void> => {
  const params = DeletePlantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(plantsTable)
    .where(eq(plantsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Plant not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/plants/:id/history", async (req, res): Promise<void> => {
  const params = GetPlantHistoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plant] = await db
    .select()
    .from(plantsTable)
    .where(eq(plantsTable.id, params.data.id));

  if (!plant) {
    res.status(404).json({ error: "Plant not found" });
    return;
  }

  const history = await getPlantHistory(params.data.id, plant);
  res.json(history);
});

export default router;
