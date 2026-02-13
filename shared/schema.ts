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

export interface Fund {
  id: string;
  name: string;
  category: string;
  returnRate: string;
  risk: string;
  allocation: number;
  ytdReturn: number;
  expenseRatio: number;
  volatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface GoalFundAllocation {
  fundId: string;
  weight: number;
  amount: number;
}

export interface GoalPortfolio {
  funds: GoalFundAllocation[];
  totalInvested: number;
}

export interface GoalReturns {
  ytd: number;
  oneYear: number;
  threeYear: number;
}

export interface Goal {
  id: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  probability: number;
  status: "on-track" | "off-track" | "ahead";
  riskProfile: string;
  portfolio: GoalPortfolio;
  returns: GoalReturns;
  monthlyContribution: number;
}

export interface ClientReturns {
  ytd: number;
  oneYear: number;
  threeYear: number;
}

export interface MeetingNote {
  date: string;
  notes: string;
  followUps: { task: string; done: boolean }[];
}

export interface Client {
  id: string;
  name: string;
  age: number;
  riskProfile: string;
  totalPortfolio: number;
  cashHoldings: number;
  monthlyIncome: number;
  goals: Goal[];
  returns: ClientReturns;
  needsAction: boolean;
  actionReason?: string;
  joinedDate: string;
  meetingNotes?: MeetingNote[];
}

export interface ProductBasket {
  id: string;
  title: string;
  targetReturn: string;
  riskLevel: string;
  description: string;
  funds: Fund[];
}

export interface RiskMetrics {
  volatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface FundExposure {
  fundId: string;
  fundName: string;
  category: string;
  totalAmount: number;
  weight: number;
  expenseRatio: number;
}

export interface FeeAnalysis {
  totalInvested: number;
  weightedExpenseRatio: number;
  annualFeeCost: number;
  monthlyFeeCost: number;
  feeBreakdown: { fundName: string; weight: number; expenseRatio: number; annualCost: number }[];
  tenYearFeeDrag: number;
}

// --- Insert schemas for CRUD ---

export const goalFundAllocationSchema = z.object({
  fundId: z.string(),
  weight: z.number().min(0).max(100),
  amount: z.number().min(0),
});

export const goalPortfolioSchema = z.object({
  funds: z.array(goalFundAllocationSchema),
  totalInvested: z.number().min(0),
});

export const goalReturnsSchema = z.object({
  ytd: z.number(),
  oneYear: z.number(),
  threeYear: z.number(),
});

export const insertGoalSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  targetAmount: z.number().min(0),
  currentAmount: z.number().min(0),
  targetDate: z.string().min(1),
  probability: z.number().min(0).max(100),
  status: z.enum(["on-track", "off-track", "ahead"]),
  riskProfile: z.string().min(1),
  portfolio: goalPortfolioSchema,
  returns: goalReturnsSchema,
  monthlyContribution: z.number().min(0),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;

export const clientReturnsSchema = z.object({
  ytd: z.number(),
  oneYear: z.number(),
  threeYear: z.number(),
});

export const insertClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  age: z.number().int().min(18).max(120),
  riskProfile: z.string().min(1),
  totalPortfolio: z.number().min(0),
  cashHoldings: z.number().min(0),
  monthlyIncome: z.number().min(0),
  returns: clientReturnsSchema,
  needsAction: z.boolean(),
  actionReason: z.string().optional(),
  joinedDate: z.string().min(1),
  goals: z.array(insertGoalSchema).optional(),
});

export type InsertClient = z.infer<typeof insertClientSchema>;
