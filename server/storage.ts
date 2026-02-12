import { type User, type InsertUser, type ModelPortfolio, type InsertModelPortfolio } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getModelPortfolios(): Promise<ModelPortfolio[]>;
  getModelPortfoliosByRisk(riskProfile: string): Promise<ModelPortfolio[]>;
  getModelPortfolio(id: string): Promise<ModelPortfolio | undefined>;
  createModelPortfolio(portfolio: InsertModelPortfolio): Promise<ModelPortfolio>;
  updateModelPortfolio(id: string, portfolio: Partial<InsertModelPortfolio>): Promise<ModelPortfolio | undefined>;
  deleteModelPortfolio(id: string): Promise<boolean>;
}

const defaultModelPortfolios: ModelPortfolio[] = [
  {
    id: "mp1",
    name: "Conservative Default",
    riskProfile: "Conservative",
    category: "default",
    description: "Capital preservation with stable income focus. Heavy allocation to money market and balanced funds.",
    funds: [
      { fundId: "f5", weight: 45 },
      { fundId: "f6", weight: 35 },
      { fundId: "f2", weight: 20 },
    ],
  },
  {
    id: "mp2",
    name: "Moderate Default",
    riskProfile: "Moderate",
    category: "default",
    description: "Balanced growth and income. Mix of equity, balanced, and fixed income funds.",
    funds: [
      { fundId: "f1", weight: 30 },
      { fundId: "f6", weight: 25 },
      { fundId: "f2", weight: 25 },
      { fundId: "f5", weight: 20 },
    ],
  },
  {
    id: "mp3",
    name: "Aggressive Default",
    riskProfile: "Aggressive",
    category: "default",
    description: "Maximum growth potential. Heavy equity allocation across global and Philippine markets.",
    funds: [
      { fundId: "f3", weight: 30 },
      { fundId: "f4", weight: 30 },
      { fundId: "f1", weight: 25 },
      { fundId: "f2", weight: 15 },
    ],
  },
  {
    id: "mp4",
    name: "Conservative Low Volatility",
    riskProfile: "Conservative",
    category: "low_volatility",
    description: "Ultra-low volatility with money market dominance for near-term goals.",
    funds: [
      { fundId: "f5", weight: 60 },
      { fundId: "f6", weight: 30 },
      { fundId: "f2", weight: 10 },
    ],
  },
  {
    id: "mp5",
    name: "Moderate Growth",
    riskProfile: "Moderate",
    category: "growth",
    description: "Growth-tilted moderate portfolio with higher equity exposure.",
    funds: [
      { fundId: "f1", weight: 35 },
      { fundId: "f3", weight: 25 },
      { fundId: "f6", weight: 20 },
      { fundId: "f2", weight: 20 },
    ],
  },
  {
    id: "mp6",
    name: "Aggressive Growth",
    riskProfile: "Aggressive",
    category: "aggressive_growth",
    description: "Concentrated high-growth equity portfolio for long-term wealth accumulation.",
    funds: [
      { fundId: "f3", weight: 35 },
      { fundId: "f4", weight: 35 },
      { fundId: "f1", weight: 30 },
    ],
  },
];

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private modelPortfolios: Map<string, ModelPortfolio>;

  constructor() {
    this.users = new Map();
    this.modelPortfolios = new Map();
    defaultModelPortfolios.forEach((mp) => {
      this.modelPortfolios.set(mp.id, mp);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getModelPortfolios(): Promise<ModelPortfolio[]> {
    return Array.from(this.modelPortfolios.values());
  }

  async getModelPortfoliosByRisk(riskProfile: string): Promise<ModelPortfolio[]> {
    return Array.from(this.modelPortfolios.values()).filter(
      (mp) => mp.riskProfile === riskProfile,
    );
  }

  async getModelPortfolio(id: string): Promise<ModelPortfolio | undefined> {
    return this.modelPortfolios.get(id);
  }

  async createModelPortfolio(portfolio: InsertModelPortfolio): Promise<ModelPortfolio> {
    const id = `mp_${randomUUID().slice(0, 8)}`;
    const mp: ModelPortfolio = { ...portfolio, id };
    this.modelPortfolios.set(id, mp);
    return mp;
  }

  async updateModelPortfolio(id: string, updates: Partial<InsertModelPortfolio>): Promise<ModelPortfolio | undefined> {
    const existing = this.modelPortfolios.get(id);
    if (!existing) return undefined;
    const updated: ModelPortfolio = { ...existing, ...updates };
    this.modelPortfolios.set(id, updated);
    return updated;
  }

  async deleteModelPortfolio(id: string): Promise<boolean> {
    return this.modelPortfolios.delete(id);
  }
}

export const storage = new MemStorage();
