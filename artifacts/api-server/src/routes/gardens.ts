import { Router, type IRouter } from "express";
import { db, gardensTable, gardenMembersTable, playerStatsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const CreateGardenBody = z.object({
  gardenName: z.string().min(1),
  memberName: z.string().min(1),
  deviceId: z.string().min(1),
});

const JoinGardenBody = z.object({
  joinCode: z.string().min(1),
  memberName: z.string().min(1),
  deviceId: z.string().min(1),
});

// Create a new garden
router.post("/gardens", async (req, res): Promise<void> => {
  const parsed = CreateGardenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { gardenName, memberName, deviceId } = parsed.data;

  // Generate unique join code
  let joinCode = generateJoinCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await db
      .select()
      .from(gardensTable)
      .where(eq(gardensTable.joinCode, joinCode));
    if (existing.length === 0) break;
    joinCode = generateJoinCode();
    attempts++;
  }

  const gardenId = crypto.randomUUID();
  const memberId = crypto.randomUUID();

  const [garden] = await db
    .insert(gardensTable)
    .values({ id: gardenId, name: gardenName, joinCode })
    .returning();

  const [member] = await db
    .insert(gardenMembersTable)
    .values({ id: memberId, gardenId, memberName, deviceId })
    .returning();

  // Initialize garden stats
  await db.insert(playerStatsTable).values({ memberId });

  res.status(201).json({
    gardenId: garden.id,
    gardenName: garden.name,
    joinCode: garden.joinCode,
    memberId: member.id,
    memberName: member.memberName,
  });
});

// Join an existing garden by code
router.post("/gardens/join", async (req, res): Promise<void> => {
  const parsed = JoinGardenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { joinCode, memberName, deviceId } = parsed.data;

  const [garden] = await db
    .select()
    .from(gardensTable)
    .where(eq(gardensTable.joinCode, joinCode.toUpperCase()));

  if (!garden) {
    res.status(404).json({ error: "No garden found with that code" });
    return;
  }

  // Check if device already in this garden
  const existing = await db
    .select()
    .from(gardenMembersTable)
    .where(eq(gardenMembersTable.gardenId, garden.id));

  const existingDevice = existing.find((m) => m.deviceId === deviceId);
  if (existingDevice) {
    res.json({
      gardenId: garden.id,
      gardenName: garden.name,
      joinCode: garden.joinCode,
      memberId: existingDevice.id,
      memberName: existingDevice.memberName,
    });
    return;
  }

  const memberId = crypto.randomUUID();
  const [member] = await db
    .insert(gardenMembersTable)
    .values({ id: memberId, gardenId: garden.id, memberName, deviceId })
    .returning();

  // Initialize stats for new member
  await db.insert(playerStatsTable).values({ memberId: member.id });

  res.status(201).json({
    gardenId: garden.id,
    gardenName: garden.name,
    joinCode: garden.joinCode,
    memberId: member.id,
    memberName: member.memberName,
  });
});

// Get garden info + members
router.get("/gardens/:id", async (req, res): Promise<void> => {
  const { id } = req.params;

  const [garden] = await db
    .select()
    .from(gardensTable)
    .where(eq(gardensTable.id, id));

  if (!garden) {
    res.status(404).json({ error: "Garden not found" });
    return;
  }

  const members = await db
    .select()
    .from(gardenMembersTable)
    .where(eq(gardenMembersTable.gardenId, id));

  res.json({
    gardenId: garden.id,
    gardenName: garden.name,
    joinCode: garden.joinCode,
    members: members.map((m) => ({ id: m.id, name: m.memberName })),
  });
});

export default router;
