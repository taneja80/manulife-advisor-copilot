import { type User, type InsertUser, type ModelPortfolio, type InsertModelPortfolio, type Client, type InsertClient, type Goal, type InsertGoal } from "@shared/schema";
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
  // Client CRUD
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(data: InsertClient): Promise<Client>;
  updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  // Goal CRUD
  addGoal(clientId: string, data: InsertGoal): Promise<Goal | undefined>;
  updateGoal(clientId: string, goalId: string, data: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(clientId: string, goalId: string): Promise<boolean>;
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

// Seed data — the 5 existing clients
const seedClients: Client[] = [
  {
    id: "c1",
    name: "Maria Santos",
    age: 35,
    riskProfile: "Balanced",
    totalPortfolio: 5200000,
    cashHoldings: 1300000,
    monthlyIncome: 120000,
    returns: { ytd: 8.3, oneYear: 10.1, threeYear: 7.4 },
    needsAction: false,
    joinedDate: "2022-03-15",
    goals: [
      {
        id: "g1", name: "Child's Education (UST Tuition)", type: "education",
        targetAmount: 3000000, currentAmount: 1800000, targetDate: "2032",
        probability: 82, status: "on-track", riskProfile: "Balanced", monthlyContribution: 15000,
        portfolio: {
          totalInvested: 1800000, funds: [
            { fundId: "f1", weight: 40, amount: 720000 },
            { fundId: "f2", weight: 30, amount: 540000 },
            { fundId: "f6", weight: 30, amount: 540000 },
          ]
        },
        returns: { ytd: 9.1, oneYear: 10.5, threeYear: 7.8 },
      },
      {
        id: "g2", name: "Retirement Fund", type: "retirement",
        targetAmount: 15000000, currentAmount: 3200000, targetDate: "2050",
        probability: 65, status: "off-track", riskProfile: "Growth", monthlyContribution: 20000,
        portfolio: {
          totalInvested: 3200000, funds: [
            { fundId: "f1", weight: 35, amount: 1120000 },
            { fundId: "f3", weight: 30, amount: 960000 },
            { fundId: "f4", weight: 20, amount: 640000 },
            { fundId: "f5", weight: 15, amount: 480000 },
          ]
        },
        returns: { ytd: 10.8, oneYear: 12.3, threeYear: 8.5 },
      },
      {
        id: "g3", name: "Buying Property (Tagaytay)", type: "property",
        targetAmount: 8000000, currentAmount: 5500000, targetDate: "2030",
        probability: 91, status: "ahead", riskProfile: "Balanced", monthlyContribution: 25000,
        portfolio: {
          totalInvested: 5500000, funds: [
            { fundId: "f2", weight: 40, amount: 2200000 },
            { fundId: "f6", weight: 35, amount: 1925000 },
            { fundId: "f5", weight: 25, amount: 1375000 },
          ]
        },
        returns: { ytd: 6.2, oneYear: 7.1, threeYear: 6.0 },
      },
      {
        id: "g4", name: "Medical Emergency Fund", type: "medical",
        targetAmount: 1000000, currentAmount: 720000, targetDate: "2027",
        probability: 88, status: "on-track", riskProfile: "Conservative", monthlyContribution: 10000,
        portfolio: {
          totalInvested: 720000, funds: [
            { fundId: "f5", weight: 60, amount: 432000 },
            { fundId: "f6", weight: 40, amount: 288000 },
          ]
        },
        returns: { ytd: 4.8, oneYear: 5.2, threeYear: 4.5 },
      },
    ],
  },
  {
    id: "c2",
    name: "Jose Reyes",
    age: 42,
    riskProfile: "Growth",
    totalPortfolio: 12500000,
    cashHoldings: 2000000,
    monthlyIncome: 250000,
    returns: { ytd: 11.2, oneYear: 13.8, threeYear: 9.6 },
    needsAction: true,
    actionReason: "Retirement goal off-track, rebalancing recommended",
    joinedDate: "2020-11-02",
    goals: [
      {
        id: "g5", name: "Retirement (Age 60)", type: "retirement",
        targetAmount: 30000000, currentAmount: 8500000, targetDate: "2044",
        probability: 58, status: "off-track", riskProfile: "Growth", monthlyContribution: 40000,
        portfolio: {
          totalInvested: 8500000, funds: [
            { fundId: "f1", weight: 30, amount: 2550000 },
            { fundId: "f3", weight: 25, amount: 2125000 },
            { fundId: "f4", weight: 25, amount: 2125000 },
            { fundId: "f2", weight: 20, amount: 1700000 },
          ]
        },
        returns: { ytd: 11.5, oneYear: 14.2, threeYear: 10.1 },
      },
      {
        id: "g6", name: "Children's Education (Ateneo)", type: "education",
        targetAmount: 5000000, currentAmount: 3200000, targetDate: "2030",
        probability: 85, status: "on-track", riskProfile: "Balanced", monthlyContribution: 20000,
        portfolio: {
          totalInvested: 3200000, funds: [
            { fundId: "f1", weight: 40, amount: 1280000 },
            { fundId: "f6", weight: 35, amount: 1120000 },
            { fundId: "f5", weight: 25, amount: 800000 },
          ]
        },
        returns: { ytd: 8.9, oneYear: 10.0, threeYear: 7.5 },
      },
      {
        id: "g7", name: "Investment Property (BGC Condo)", type: "property",
        targetAmount: 15000000, currentAmount: 6800000, targetDate: "2033",
        probability: 72, status: "on-track", riskProfile: "Growth", monthlyContribution: 30000,
        portfolio: {
          totalInvested: 6800000, funds: [
            { fundId: "f2", weight: 35, amount: 2380000 },
            { fundId: "f3", weight: 30, amount: 2040000 },
            { fundId: "f1", weight: 20, amount: 1360000 },
            { fundId: "f6", weight: 15, amount: 1020000 },
          ]
        },
        returns: { ytd: 9.8, oneYear: 11.5, threeYear: 8.2 },
      },
      {
        id: "g8", name: "Wealth Growth Fund", type: "growth",
        targetAmount: 20000000, currentAmount: 4500000, targetDate: "2040",
        probability: 68, status: "on-track", riskProfile: "Aggressive", monthlyContribution: 35000,
        portfolio: {
          totalInvested: 4500000, funds: [
            { fundId: "f3", weight: 35, amount: 1575000 },
            { fundId: "f4", weight: 35, amount: 1575000 },
            { fundId: "f1", weight: 30, amount: 1350000 },
          ]
        },
        returns: { ytd: 13.2, oneYear: 15.8, threeYear: 11.0 },
      },
    ],
  },
  {
    id: "c3",
    name: "Ana Dela Cruz",
    age: 28,
    riskProfile: "Aggressive",
    totalPortfolio: 1800000,
    cashHoldings: 400000,
    monthlyIncome: 85000,
    returns: { ytd: 14.5, oneYear: 16.2, threeYear: 11.8 },
    needsAction: false,
    joinedDate: "2023-07-20",
    goals: [
      {
        id: "g9", name: "Retirement (Age 55)", type: "retirement",
        targetAmount: 25000000, currentAmount: 800000, targetDate: "2053",
        probability: 72, status: "on-track", riskProfile: "Aggressive", monthlyContribution: 15000,
        portfolio: {
          totalInvested: 800000, funds: [
            { fundId: "f3", weight: 35, amount: 280000 },
            { fundId: "f4", weight: 35, amount: 280000 },
            { fundId: "f1", weight: 30, amount: 240000 },
          ]
        },
        returns: { ytd: 14.8, oneYear: 16.5, threeYear: 12.0 },
      },
      {
        id: "g10", name: "Emergency Savings", type: "saving",
        targetAmount: 500000, currentAmount: 420000, targetDate: "2027",
        probability: 95, status: "ahead", riskProfile: "Conservative", monthlyContribution: 8000,
        portfolio: {
          totalInvested: 420000, funds: [
            { fundId: "f5", weight: 70, amount: 294000 },
            { fundId: "f6", weight: 30, amount: 126000 },
          ]
        },
        returns: { ytd: 4.2, oneYear: 4.8, threeYear: 4.0 },
      },
    ],
  },
  {
    id: "c4",
    name: "Ricardo Garcia",
    age: 55,
    riskProfile: "Conservative",
    totalPortfolio: 25000000,
    cashHoldings: 5000000,
    monthlyIncome: 350000,
    returns: { ytd: 5.1, oneYear: 6.3, threeYear: 5.8 },
    needsAction: true,
    actionReason: "Portfolio review due, annual rebalancing needed",
    joinedDate: "2019-01-10",
    goals: [
      {
        id: "g11", name: "Retirement (2030)", type: "retirement",
        targetAmount: 40000000, currentAmount: 22000000, targetDate: "2030",
        probability: 78, status: "on-track", riskProfile: "Conservative", monthlyContribution: 50000,
        portfolio: {
          totalInvested: 22000000, funds: [
            { fundId: "f5", weight: 35, amount: 7700000 },
            { fundId: "f6", weight: 30, amount: 6600000 },
            { fundId: "f2", weight: 20, amount: 4400000 },
            { fundId: "f1", weight: 15, amount: 3300000 },
          ]
        },
        returns: { ytd: 5.5, oneYear: 6.8, threeYear: 6.0 },
      },
      {
        id: "g12", name: "Grandchildren's Education Trust", type: "education",
        targetAmount: 10000000, currentAmount: 3500000, targetDate: "2038",
        probability: 70, status: "on-track", riskProfile: "Balanced", monthlyContribution: 25000,
        portfolio: {
          totalInvested: 3500000, funds: [
            { fundId: "f1", weight: 35, amount: 1225000 },
            { fundId: "f6", weight: 30, amount: 1050000 },
            { fundId: "f2", weight: 20, amount: 700000 },
            { fundId: "f5", weight: 15, amount: 525000 },
          ]
        },
        returns: { ytd: 7.2, oneYear: 8.5, threeYear: 7.0 },
      },
    ],
  },
  {
    id: "c5",
    name: "Lourdes Bautista",
    age: 47,
    riskProfile: "Balanced",
    totalPortfolio: 8700000,
    cashHoldings: 1500000,
    monthlyIncome: 180000,
    returns: { ytd: 7.8, oneYear: 9.2, threeYear: 7.1 },
    needsAction: false,
    joinedDate: "2021-05-08",
    goals: [
      {
        id: "g13", name: "Retirement (Age 60)", type: "retirement",
        targetAmount: 20000000, currentAmount: 6200000, targetDate: "2039",
        probability: 74, status: "on-track", riskProfile: "Balanced", monthlyContribution: 30000,
        portfolio: {
          totalInvested: 6200000, funds: [
            { fundId: "f1", weight: 30, amount: 1860000 },
            { fundId: "f6", weight: 25, amount: 1550000 },
            { fundId: "f2", weight: 25, amount: 1550000 },
            { fundId: "f5", weight: 20, amount: 1240000 },
          ]
        },
        returns: { ytd: 7.5, oneYear: 8.8, threeYear: 7.0 },
      },
      {
        id: "g14", name: "Son's Wedding Fund", type: "saving",
        targetAmount: 2000000, currentAmount: 1500000, targetDate: "2028",
        probability: 90, status: "ahead", riskProfile: "Conservative", monthlyContribution: 15000,
        portfolio: {
          totalInvested: 1500000, funds: [
            { fundId: "f5", weight: 50, amount: 750000 },
            { fundId: "f6", weight: 50, amount: 750000 },
          ]
        },
        returns: { ytd: 5.0, oneYear: 5.8, threeYear: 5.2 },
      },
      {
        id: "g15", name: "Medical Emergency", type: "medical",
        targetAmount: 1500000, currentAmount: 1200000, targetDate: "2027",
        probability: 92, status: "ahead", riskProfile: "Conservative", monthlyContribution: 10000,
        portfolio: {
          totalInvested: 1200000, funds: [
            { fundId: "f5", weight: 70, amount: 840000 },
            { fundId: "f6", weight: 30, amount: 360000 },
          ]
        },
        returns: { ytd: 4.3, oneYear: 5.0, threeYear: 4.5 },
      },
    ],
  },
];

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private modelPortfolios: Map<string, ModelPortfolio>;
  private clients: Map<string, Client>;

  constructor() {
    this.users = new Map();
    this.modelPortfolios = new Map();
    this.clients = new Map();
    defaultModelPortfolios.forEach((mp) => {
      this.modelPortfolios.set(mp.id, mp);
    });
    seedClients.forEach((c) => {
      this.clients.set(c.id, c);
    });
  }

  // ---- Users ----

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

  // ---- Model Portfolios ----

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

  // ---- Clients ----

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(data: InsertClient): Promise<Client> {
    const id = `c_${randomUUID().slice(0, 8)}`;
    const goals: Goal[] = (data.goals || []).map((g) => ({
      ...g,
      id: `g_${randomUUID().slice(0, 8)}`,
    }));
    const client: Client = {
      id,
      name: data.name,
      age: data.age,
      riskProfile: data.riskProfile,
      totalPortfolio: data.totalPortfolio,
      cashHoldings: data.cashHoldings,
      monthlyIncome: data.monthlyIncome,
      returns: data.returns,
      needsAction: data.needsAction,
      actionReason: data.actionReason,
      joinedDate: data.joinedDate,
      goals,
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;
    // Don't let goals be overwritten via updateClient — use addGoal/updateGoal/deleteGoal
    const { goals: _, ...updates } = data;
    const updated: Client = { ...existing, ...updates };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  // ---- Goals ----

  async addGoal(clientId: string, data: InsertGoal): Promise<Goal | undefined> {
    const client = this.clients.get(clientId);
    if (!client) return undefined;
    const goal: Goal = {
      ...data,
      id: `g_${randomUUID().slice(0, 8)}`,
    };
    client.goals.push(goal);
    return goal;
  }

  async updateGoal(clientId: string, goalId: string, data: Partial<InsertGoal>): Promise<Goal | undefined> {
    const client = this.clients.get(clientId);
    if (!client) return undefined;
    const idx = client.goals.findIndex((g) => g.id === goalId);
    if (idx === -1) return undefined;
    client.goals[idx] = { ...client.goals[idx], ...data };
    return client.goals[idx];
  }

  async deleteGoal(clientId: string, goalId: string): Promise<boolean> {
    const client = this.clients.get(clientId);
    if (!client) return false;
    const before = client.goals.length;
    client.goals = client.goals.filter((g) => g.id !== goalId);
    return client.goals.length < before;
  }
}

export const storage = new MemStorage();
