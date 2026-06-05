import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gardensTable = pgTable("gardens", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  joinCode: text("join_code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGardenSchema = createInsertSchema(gardensTable);
export type InsertGarden = z.infer<typeof insertGardenSchema>;
export type Garden = typeof gardensTable.$inferSelect;
