import { pgTable, text, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gardenMembersTable } from "./garden_members";

export const playerStatsTable = pgTable("player_stats", {
  memberId: text("member_id").primaryKey().references(() => gardenMembersTable.id),
  totalXp: integer("total_xp").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActionDate: date("last_action_date"),
});

export const insertPlayerStatsSchema = createInsertSchema(playerStatsTable);
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
export type PlayerStats = typeof playerStatsTable.$inferSelect;
