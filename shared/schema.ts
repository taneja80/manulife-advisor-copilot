import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const modelPortfolioFundSchema = z.object({
  fundId: z.string(),
  weight: z.number().min(0).max(100),
});

export const modelPortfolioSchema = z.object({
  id: z.string(),
  name: z.string(),
  riskProfile: z.enum(["Conservative", "Moderate", "Aggressive"]),
  category: z.enum(["default", "low_volatility", "growth", "aggressive_growth"]),
  description: z.string(),
  funds: z.array(modelPortfolioFundSchema),
});

export const insertModelPortfolioSchema = modelPortfolioSchema.omit({ id: true });

export type ModelPortfolioFund = z.infer<typeof modelPortfolioFundSchema>;
export type ModelPortfolio = z.infer<typeof modelPortfolioSchema>;
export type InsertModelPortfolio = z.infer<typeof insertModelPortfolioSchema>;
