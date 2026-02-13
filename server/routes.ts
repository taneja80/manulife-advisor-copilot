import type { Express } from "express";
import type { Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertModelPortfolioSchema, insertClientSchema, insertGoalSchema } from "@shared/schema";
import { requireAuth } from "./middleware";
import { parseIntent, generateResponse } from "./dora";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ---- Client CRUD ----

  app.get("/api/clients", async (_req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.get("/api/clients/:id", async (req, res) => {
    const client = await storage.getClient(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  });

  app.post("/api/clients", async (req, res) => {
    const parsed = insertClientSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid client data", errors: parsed.error.errors });
    }
    const client = await storage.createClient(parsed.data);
    res.status(201).json(client);
  });

  app.patch("/api/clients/:id", async (req, res) => {
    const partial = insertClientSchema.partial().safeParse(req.body);
    if (!partial.success) {
      return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
    }
    const updated = await storage.updateClient(req.params.id, partial.data);
    if (!updated) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(updated);
  });

  app.delete("/api/clients/:id", async (req, res) => {
    const deleted = await storage.deleteClient(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json({ success: true });
  });

  // ---- Goal CRUD (nested under clients) ----

  app.post("/api/clients/:id/goals", async (req, res) => {
    const parsed = insertGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid goal data", errors: parsed.error.errors });
    }
    const goal = await storage.addGoal(req.params.id, parsed.data);
    if (!goal) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(201).json(goal);
  });

  app.patch("/api/clients/:id/goals/:goalId", async (req, res) => {
    const partial = insertGoalSchema.partial().safeParse(req.body);
    if (!partial.success) {
      return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
    }
    const goal = await storage.updateGoal(req.params.id, req.params.goalId, partial.data);
    if (!goal) {
      return res.status(404).json({ message: "Client or goal not found" });
    }
    res.json(goal);
  });

  app.delete("/api/clients/:id/goals/:goalId", async (req, res) => {
    const deleted = await storage.deleteGoal(req.params.id, req.params.goalId);
    if (!deleted) {
      return res.status(404).json({ message: "Client or goal not found" });
    }
    res.json({ success: true });
  });

  // ---- Model Portfolios ----

  app.get("/api/model-portfolios", async (_req, res) => {
    const portfolios = await storage.getModelPortfolios();
    res.json(portfolios);
  });

  app.get("/api/model-portfolios/risk/:riskProfile", async (req, res) => {
    const portfolios = await storage.getModelPortfoliosByRisk(req.params.riskProfile);
    res.json(portfolios);
  });

  app.get("/api/model-portfolios/:id", async (req, res) => {
    const portfolio = await storage.getModelPortfolio(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: "Model portfolio not found" });
    }
    res.json(portfolio);
  });

  app.post("/api/model-portfolios", async (req, res) => {
    const parsed = insertModelPortfolioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const totalWeight = parsed.data.funds.reduce((sum, f) => sum + f.weight, 0);
    if (totalWeight !== 100) {
      return res.status(400).json({ message: "Fund weights must sum to 100%" });
    }
    const portfolio = await storage.createModelPortfolio(parsed.data);
    res.status(201).json(portfolio);
  });

  app.patch("/api/model-portfolios/:id", async (req, res) => {
    const partial = insertModelPortfolioSchema.partial().safeParse(req.body);
    if (!partial.success) {
      return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
    }
    if (partial.data.funds) {
      const totalWeight = partial.data.funds.reduce((sum, f) => sum + f.weight, 0);
      if (totalWeight !== 100) {
        return res.status(400).json({ message: "Fund weights must sum to 100%" });
      }
    }
    const updated = await storage.updateModelPortfolio(req.params.id, partial.data);
    if (!updated) {
      return res.status(404).json({ message: "Model portfolio not found" });
    }
    res.json(updated);
  });

  app.delete("/api/model-portfolios/:id", async (req, res) => {
    const deleted = await storage.deleteModelPortfolio(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Model portfolio not found" });
    }
    res.json({ success: true });
  });

  // ---- Trade Execution ----

  app.post("/api/trade/execute", requireAuth, async (req, res) => {
    const tradeExecuteSchema = z.object({
      goalId: z.string(),
      clientName: z.string().min(1, "Client name is required"),
      portfolio: z.object({
        name: z.string().optional(),
        funds: z.array(z.object({
          fundId: z.string(),
          weight: z.number().min(0).max(100),
          amount: z.number().optional()
        })).min(1, "At least one fund required"),
        totalInvested: z.number().optional()
      })
    });

    const parsed = tradeExecuteSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid trade data", errors: parsed.error.errors });
    }

    const { goalId, clientName, portfolio } = parsed.data;

    const totalWeight = portfolio.funds.reduce((sum, f) => sum + f.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.1) {
      return res.status(400).json({ message: `Fund weights must sum to 100% (current: ${totalWeight}%)` });
    }

    console.log(`\n[EMAIL SIMULATION] ---------------------------------------------------`);
    console.log(`To: ${clientName} <client@example.com>`);
    console.log(`Subject: Action Required: Confirm your Portfolio Trade for Goal ${goalId}`);
    console.log(`\nDear ${clientName},`);
    console.log(`\nYour advisor has proposed a new portfolio allocation for your goal.`);
    console.log(`Please log in to your dashboard to review and confirm the trade execution.`);
    console.log(`\nPortfolio Details:`);
    console.log(JSON.stringify(portfolio, null, 2));
    console.log(`\n[EMAIL SIMULATION] ---------------------------------------------------\n`);

    res.json({ success: true, message: "Trade instructions sent to client" });
  });

  // ---- DORA Chat ----

  app.post("/api/dora/chat", async (req, res) => {
    const { message, clientId } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    const intent = parseIntent(message);
    const allClients = await storage.getClients();
    const client = clientId ? (await storage.getClient(clientId)) ?? null : null;
    const response = await generateResponse(intent, message, client, allClients);
    res.json({ response, intent });
  });

  app.get("/api/dora/alerts", async (_req, res) => {
    const { generateActionableInsights } = await import("./insights-engine");
    const insights = await generateActionableInsights();
    res.json(insights);
  });

  // ---- Compliance RAG ----

  app.post("/api/rag/chat", async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query is required" });
    }

    const { queryRAG } = await import("./rag");
    const result = await queryRAG(query);
    res.json(result);
  });

  return httpServer;
}
