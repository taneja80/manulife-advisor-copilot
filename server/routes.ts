import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertModelPortfolioSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  return httpServer;
}
