import { storage } from "./storage";
import type { Client, Goal } from "@shared/schema";

export interface Insight {
    id: string;
    clientId: string;
    clientName: string;
    title: string;
    description: string;
    type: "opportunity" | "risk" | "service" | "compliance";
    priority: number; // 1-10, 10 being highest
    actionType: "rebalance" | "contact" | "review" | "tax_harvest";
    actionLabel: string;
    actionUrl: string;
    tags: string[];
    generatedAt: Date;
}

const SEASONALITY_RULES = [
    {
        month: 9, // October (0-indexed)
        title: "Year-End Tax Planning",
        description: "Review portfolio for tax-loss harvesting opportunities before year-end.",
        actionType: "tax_harvest",
        priority: 8,
        tags: ["Tax", "Seasonal"]
    },
    {
        month: 0, // January
        title: "TFSA/RRSP Contribution Room",
        description: "New contribution room available for the new year. Suggest top-up.",
        actionType: "contact",
        priority: 7,
        tags: ["Contribution", "Seasonal"]
    }
];

export async function generateActionableInsights(): Promise<Insight[]> {
    const clients = await storage.getClients();
    const insights: Insight[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();

    for (const client of clients) {
        // 1. Lifecycle Rules
        // Mock age check (in real app, birthdate would be in schema)
        // Assuming 'Retirement' goal target date is approaching
        const retirementGoal = client.goals.find(g => g.name.toLowerCase().includes("retirement"));
        if (retirementGoal) {
            const yearsToRetirement = new Date(retirementGoal.targetDate).getFullYear() - today.getFullYear();
            if (yearsToRetirement === 1) {
                insights.push({
                    id: `lifecycle-retire-${client.id}`,
                    clientId: client.id,
                    clientName: client.name,
                    title: "Approaching Retirement",
                    description: "Client is 1 year away from target retirement date. Schedule income strategy review.",
                    type: "service",
                    priority: 10,
                    actionType: "contact",
                    actionLabel: "Schedule Review",
                    actionUrl: `/clients/${client.id}`,
                    tags: ["Lifecycle", "Retirement"],
                    generatedAt: new Date()
                });
            }
        }

        // 2. Market/Portfolio Rules
        const riskMetrics = { sharpeRatio: 0.4 }; // Mock calculation
        if (riskMetrics.sharpeRatio < 0.5 && client.riskProfile !== "Conservative") {
            insights.push({
                id: `risk-sharpe-${client.id}`,
                clientId: client.id,
                clientName: client.name,
                title: "Portfolio Efficiency Alert",
                description: "Portfolio Sharpe ratio has dropped below 0.5. Consider rebalancing to improve risk-adjusted returns.",
                type: "risk",
                priority: 9,
                actionType: "rebalance",
                actionLabel: "Rebalance Portfolio",
                actionUrl: `/clients/${client.id}`,
                tags: ["Risk", "Market"],
                generatedAt: new Date()
            });
        }

        // 3. Seasonality Rules
        const seasonalRule = SEASONALITY_RULES.find(r => r.month === currentMonth);
        if (seasonalRule && client.totalPortfolio > 100000) { // Only for larger accounts
            insights.push({
                id: `seasonal-${currentMonth}-${client.id}`,
                clientId: client.id,
                clientName: client.name,
                title: seasonalRule.title,
                description: seasonalRule.description,
                type: "opportunity",
                priority: seasonalRule.priority,
                actionType: seasonalRule.actionType as any,
                actionLabel: "Review Opportunities",
                actionUrl: `/clients/${client.id}`,
                tags: seasonalRule.tags,
                generatedAt: new Date()
            });
        }

        // 4. Legacy "Needs Action" Flag
        if (client.needsAction) {
            insights.push({
                id: `legacy-action-${client.id}`,
                clientId: client.id,
                clientName: client.name,
                title: "Advisor Flagged Action",
                description: client.actionReason || "Manual follow-up required.",
                type: "service",
                priority: 5,
                actionType: "contact",
                actionLabel: "View Client",
                actionUrl: `/clients/${client.id}`,
                tags: ["Manual"],
                generatedAt: new Date()
            });
        }
    }

    // 5. Sort by Priority (Desc)
    return insights.sort((a, b) => b.priority - a.priority);
}
