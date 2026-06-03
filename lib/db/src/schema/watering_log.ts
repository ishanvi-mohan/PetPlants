import { pgTable, serial, integer, text, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wateringLogTable = pgTable("watering_log", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull(),
  logDate: date("log_date").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  xpAwarded: integer("xp_awarded").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWateringLogSchema = createInsertSchema(wateringLogTable).omit({ id: true, createdAt: true });
export type InsertWateringLog = z.infer<typeof insertWateringLogSchema>;
export type WateringLog = typeof wateringLogTable.$inferSelect;
