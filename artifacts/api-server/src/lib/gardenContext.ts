import type { Request, Response } from "express";

export interface GardenContext {
  gardenId: string;
  memberId: string;
}

export function getGardenContext(req: Request, res: Response): GardenContext | null {
  const gardenId = req.headers["x-garden-id"];
  const memberId = req.headers["x-member-id"];

  if (!gardenId || !memberId || typeof gardenId !== "string" || typeof memberId !== "string") {
    res.status(401).json({ error: "Missing X-Garden-Id or X-Member-Id header" });
    return null;
  }

  return { gardenId, memberId };
}
