import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gardensTable } from "./gardens";

export const gardenMembersTable = pgTable("garden_members", {
  id: text("id").primaryKey(),
  gardenId: text("garden_id").notNull().references(() => gardensTable.id),
  memberName: text("member_name").notNull(),
  deviceId: text("device_id").notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGardenMemberSchema = createInsertSchema(gardenMembersTable);
export type InsertGardenMember = z.infer<typeof insertGardenMemberSchema>;
export type GardenMember = typeof gardenMembersTable.$inferSelect;
