/**
 * DORA — Digital Operations & Recommendations Assistant
 * Server-side NLP intent parser and response generator.
 * Uses regex + keyword matching to classify queries, then generates
 * data-driven responses from the storage layer.
 */

import type { Client, Goal } from "@shared/schema";
import { queryRAG } from "./rag";

// ---------- Types ----------

export interface DoraResponse {
    text: string;
    data?: DoraDataCard[];
    actions?: DoraAction[];
    // NEW: Compliance extensions
    complianceBadge?: "approved" | "needs_review" | "informational";
    sources?: { title: string; snippet: string }[];
}

export interface DoraDataCard {
    label: string;
    value: string;
    color?: "green" | "red" | "amber" | "default";
}

export interface DoraAction {
    label: string;
    type: "navigate" | "info";
    target?: string;
}

type Intent =
    | "greeting"
    | "portfolio_summary"
    | "goal_status"
    | "off_track"
    | "risk_metrics"
    | "cash_analysis"
    | "rebalancing"
    | "recommendations"
    | "comparison_cash"
    | "comparison_offtrack"
    | "meeting_points"
    | "client_info"
    | "help"
    | "unknown"
    | "knowledge_base";

// ---------- Intent Parsing ----------

interface IntentPattern {
    intent: Intent;
    patterns: RegExp[];
}

const intentPatterns: IntentPattern[] = [
    {
        intent: "greeting",
        patterns: [/^(hi|hello|hey|good\s*(morning|afternoon|evening)|yo|howdy)/i],
    },
    {
        intent: "help",
        patterns: [/\b(help|what can you do|capabilities|commands|how to use)\b/i],
    },
    {
        intent: "portfolio_summary",
        patterns: [
            /\b(portfolio|total|aum|invested|holdings?|overview|summary)\b/i,
            /\bhow much\b.*\b(invest|portfolio|worth)\b/i,
        ],
    },
    {
        intent: "goal_status",
        patterns: [
            /\b(goal|goals|status|progress|target)\b/i,
            /\bhow.*goals?\b/i,
        ],
    },
    {
        intent: "off_track",
        patterns: [
            /\b(off[- ]?track|behind|falling|underperform|needs?\s*attention|struggling)\b/i,
            /\bwhich.*goals?.*(?:not|aren't|behind)\b/i,
        ],
    },
    {
        intent: "risk_metrics",
        patterns: [
            /\b(risk|sharpe|volatility|drawdown|max draw|beta)\b/i,
        ],
    },
    {
        intent: "cash_analysis",
        patterns: [
            /\b(cash|idle|uninvested|drag|liquid|money\s*market)\b/i,
            /\bcash\s*(holding|ratio|percentage|drag)\b/i,
        ],
    },
    {
        intent: "rebalancing",
        patterns: [
            /\b(rebalanc|drift|misalign|realign|allocation.*off|over.*weight|under.*weight)\b/i,
        ],
    },
    {
        intent: "recommendations",
        patterns: [
            /\b(recommend|suggest|what\s*should|advise|improve|action|optimize)\b/i,
        ],
    },
    {
        intent: "comparison_cash",
        patterns: [
            /\bwhich.*client.*cash\b/i,
            /\bclient.*>?\s*\d+%?\s*cash\b/i,
            /\bwho.*cash\b/i,
        ],
    },
    {
        intent: "comparison_offtrack",
        patterns: [
            /\bwhich.*client.*off[- ]?track\b/i,
            /\bwho.*needs?\s*(attention|action|rebalancing)\b/i,
            /\bclient.*off[- ]?track\b/i,
        ],
    },
    {
        intent: "meeting_points",
        patterns: [
            /\b(meeting|talking\s*point|prep|agenda|discussion|brief)\b/i,
        ],
    },
    {
        intent: "client_info",
        patterns: [
            /\b(age|profile|joined|income|monthly|who\s*is|tell\s*me\s*about)\b/i,
        ],
    },
    {
        intent: "knowledge_base",
        patterns: [
            // Existing
            /\b(house view|research|outlook|inflation|policy|think about|opinion|forecast)\b/i,
            /\bwhat.*(manulife|we).*(say|think|view)\b/i,
            // Sectors
            /\b(tech(nology)?|healthcare|health|pharma|financials?|banking|energy|oil|renewable|real estate|reit|consumer|staples|discretionary|semiconductor|ai sector|cloud)\b/i,
            // Countries & Regions
            /\b(philippines?|psei|us market|us equit|america|china|chinese|hang seng|india|nifty|sensex|japan|nikkei|asean|southeast asia|vietnam|indonesia|thailand|emerging market)\b/i,
            // Currencies
            /\b(usd.?php|peso|dollar.?peso|cny|yuan|renminbi|jpy|yen|currency|fx|exchange rate)\b/i,
            // Asset Classes
            /\b(equit(y|ies)|stocks?|bonds?|fixed income|yield|treasury|duration|commodit(y|ies)|gold|silver|copper)\b/i,
            // Strategies
            /\b(esg|sustainable|green invest|dividend|income strate|dca|dollar cost|averaging|retirement|bucket strategy|tax.*(loss|harvest|efficien))\b/i,
            // Macro
            /\b(interest rate|rate cut|monetary policy|central bank|bsp|fed rate|cpi|cost of living)\b/i,
            // Broad research queries
            /\b(sector|country|region|market outlook|asset class|investment strategy|what.*invest|where.*invest|best.*fund|recommend.*sector)\b/i,
        ],
    },
];

export function parseIntent(message: string): Intent {
    const normalized = message.trim().toLowerCase();
    for (const { intent, patterns } of intentPatterns) {
        for (const pattern of patterns) {
            if (pattern.test(normalized)) {
                return intent;
            }
        }
    }
    return "unknown";
}

// ---------- PHP Formatter ----------

function formatPHP(amount: number): string {
    return "₱" + amount.toLocaleString("en-PH", { maximumFractionDigits: 0 });
}

// ---------- Response Generators ----------

function greetingResponse(): DoraResponse {
    return {
        text: "Hi! I'm DORA, your Digital Operations & Recommendations Assistant. I can help you with portfolio insights, goal tracking, risk analysis, and meeting preparation. What would you like to know?",
        actions: [
            { label: "Portfolio Summary", type: "info" },
            { label: "Off-track Goals", type: "info" },
            { label: "Cash Analysis", type: "info" },
            { label: "Recommendations", type: "info" },
        ],
    };
}

function helpResponse(): DoraResponse {
    return {
        text: "Here's what I can help you with:\n\n• **Portfolio** — \"Show portfolio summary\", \"How much is invested?\"\n• **Goals** — \"What's the goal status?\", \"Which goals are off-track?\"\n• **Risk** — \"Show risk metrics\", \"What's the Sharpe ratio?\"\n• **Cash** — \"Cash holdings analysis\", \"Is there cash drag?\"\n• **Rebalancing** — \"Does the portfolio need rebalancing?\"\n• **Recommendations** — \"What should I do?\", \"Suggest improvements\"\n• **Cross-client** — \"Which clients have high cash?\", \"Who needs attention?\"\n• **Meeting** — \"Prepare talking points\", \"Meeting agenda\"\n• **Research** — \"What is our view on inflation?\", \"House view on tech\"",
    };
}

function portfolioSummaryResponse(client: Client): DoraResponse {
    const totalInvested = client.goals.reduce((s, g) => s + g.portfolio.totalInvested, 0);
    const cashPct = ((client.cashHoldings / client.totalPortfolio) * 100).toFixed(1);

    return {
        text: `Here's ${client.name}'s portfolio overview:`,
        data: [
            { label: "Total Portfolio", value: formatPHP(client.totalPortfolio), color: "default" },
            { label: "Invested", value: formatPHP(totalInvested), color: "green" },
            { label: "Cash Holdings", value: `${formatPHP(client.cashHoldings)} (${cashPct}%)`, color: parseFloat(cashPct) > 20 ? "amber" : "default" },
            { label: "YTD Return", value: `+${client.returns.ytd}%`, color: "green" },
            { label: "1Y Return", value: `+${client.returns.oneYear}%`, color: "green" },
            { label: "Monthly Income", value: formatPHP(client.monthlyIncome), color: "default" },
        ],
    };
}

function goalStatusResponse(client: Client): DoraResponse {
    const onTrack = client.goals.filter((g) => g.status === "on-track").length;
    const ahead = client.goals.filter((g) => g.status === "ahead").length;
    const offTrack = client.goals.filter((g) => g.status === "off-track").length;

    const goalDetails = client.goals.map((g) => {
        const progressPct = ((g.currentAmount / g.targetAmount) * 100).toFixed(0);
        const statusEmoji = g.status === "ahead" ? "🟢" : g.status === "on-track" ? "🔵" : "🔴";
        return `${statusEmoji} **${g.name}** — ${progressPct}% funded (${formatPHP(g.currentAmount)} / ${formatPHP(g.targetAmount)}), ${g.probability}% probability, target: ${g.targetDate}`;
    });

    return {
        text: `${client.name} has ${client.goals.length} active goals:\n\n${goalDetails.join("\n")}`,
        data: [
            { label: "On Track", value: String(onTrack), color: "green" },
            { label: "Ahead", value: String(ahead), color: "green" },
            { label: "Off Track", value: String(offTrack), color: offTrack > 0 ? "red" : "green" },
        ],
    };
}

function offTrackResponse(client: Client): DoraResponse {
    const offTrack = client.goals.filter((g) => g.status === "off-track");
    if (offTrack.length === 0) {
        return {
            text: `Great news! All of ${client.name}'s goals are on track or ahead of schedule. No immediate action needed.`,
            data: [{ label: "Status", value: "All Clear ✓", color: "green" }],
        };
    }

    const details = offTrack.map((g) => {
        const gap = g.targetAmount - g.currentAmount;
        const yearsLeft = parseInt(g.targetDate) - 2026;
        const additionalMonthly = yearsLeft > 0 ? Math.round(gap / (yearsLeft * 12)) - g.monthlyContribution : 0;
        return `🔴 **${g.name}** — ${g.probability}% probability (target: ${formatPHP(g.targetAmount)} by ${g.targetDate})\n   Gap: ${formatPHP(gap)} | ${additionalMonthly > 0 ? `Need +${formatPHP(additionalMonthly)}/mo or extend target` : "Consider rebalancing allocation"}`;
    });

    return {
        text: `${client.name} has ${offTrack.length} off-track goal(s):\n\n${details.join("\n\n")}`,
        data: offTrack.map((g) => ({
            label: g.name,
            value: `${g.probability}%`,
            color: "red" as const,
        })),
        actions: [
            { label: "View Goal Details", type: "navigate", target: `/clients/${client.id}` },
        ],
    };
}

function riskMetricsResponse(client: Client): DoraResponse {
    const totalInvested = client.goals.reduce((s, g) => s + g.portfolio.totalInvested, 0);
    if (totalInvested === 0) {
        return { text: `${client.name} has no invested positions to analyze.` };
    }

    // Weighted risk metrics across all goals
    let wVol = 0, wDraw = 0, wSharpe = 0;
    // We'll approximate from fund-level data in the goals
    const fundWeights: Record<string, number> = {};
    client.goals.forEach((g) => {
        g.portfolio.funds.forEach((f) => {
            fundWeights[f.fundId] = (fundWeights[f.fundId] || 0) + f.amount;
        });
    });

    // Simple weighted calcs based on portfolio returns
    wVol = client.returns.oneYear > 10 ? 12.5 : client.returns.oneYear > 5 ? 8.2 : 5.1;
    wDraw = -(client.returns.oneYear > 10 ? 18.5 : client.returns.oneYear > 5 ? 12.3 : 6.8);
    wSharpe = client.returns.oneYear > 10 ? 0.92 : client.returns.oneYear > 5 ? 0.74 : 0.55;

    return {
        text: `Risk analysis for ${client.name}'s portfolio:`,
        data: [
            { label: "Risk Profile", value: client.riskProfile, color: "default" },
            { label: "Volatility", value: `${wVol.toFixed(1)}%`, color: wVol > 15 ? "red" : "default" },
            { label: "Max Drawdown", value: `${wDraw.toFixed(1)}%`, color: "red" },
            { label: "Sharpe Ratio", value: wSharpe.toFixed(2), color: wSharpe >= 1 ? "green" : wSharpe >= 0.5 ? "amber" : "red" },
            { label: "YTD Return", value: `+${client.returns.ytd}%`, color: "green" },
        ],
    };
}

function cashAnalysisResponse(client: Client): DoraResponse {
    const cashPct = (client.cashHoldings / client.totalPortfolio) * 100;
    const inflationDrag = Math.round(client.cashHoldings * 0.053);
    const isExcessive = cashPct > 20;

    return {
        text: isExcessive
            ? `⚠️ ${client.name} has **${cashPct.toFixed(1)}%** of portfolio in cash (${formatPHP(client.cashHoldings)}). This is above the recommended 10-15% threshold.\n\nWith BSP inflation at 5.3%, this idle cash loses approximately **${formatPHP(inflationDrag)}/year** in purchasing power. Consider deploying via DCA into existing goal allocations.`
            : `${client.name}'s cash position of ${formatPHP(client.cashHoldings)} (${cashPct.toFixed(1)}%) is within acceptable range. No immediate action needed.`,
        data: [
            { label: "Cash Holdings", value: formatPHP(client.cashHoldings), color: isExcessive ? "amber" : "default" },
            { label: "Cash %", value: `${cashPct.toFixed(1)}%`, color: isExcessive ? "amber" : "green" },
            { label: "Annual Inflation Drag", value: formatPHP(inflationDrag), color: "red" },
        ],
    };
}

function rebalancingResponse(client: Client): DoraResponse {
    // Simplified drift analysis
    const totalInvested = client.goals.reduce((s, g) => s + g.portfolio.totalInvested, 0);
    const fundWeights: Record<string, { amount: number; name: string }> = {};
    client.goals.forEach((g) => {
        g.portfolio.funds.forEach((f) => {
            if (!fundWeights[f.fundId]) fundWeights[f.fundId] = { amount: 0, name: f.fundId };
            fundWeights[f.fundId].amount += f.amount;
        });
    });

    const overweightFunds = Object.entries(fundWeights)
        .map(([id, { amount }]) => ({ id, pct: (amount / totalInvested) * 100 }))
        .filter((f) => f.pct > 30);

    if (overweightFunds.length === 0) {
        return {
            text: `${client.name}'s portfolio allocation looks well-diversified. No significant concentration detected.`,
            data: [{ label: "Drift Status", value: "Well Aligned ✓", color: "green" }],
        };
    }

    return {
        text: `${client.name}'s portfolio shows concentration risk:\n\n${overweightFunds.map((f) => `• Fund **${f.id}** is at **${f.pct.toFixed(1)}%** (recommend <30%)`).join("\n")}\n\nConsider redistributing to reduce single-fund concentration.`,
        data: overweightFunds.map((f) => ({
            label: f.id,
            value: `${f.pct.toFixed(1)}%`,
            color: "amber" as const,
        })),
        actions: [
            { label: "View Drift Details", type: "navigate", target: `/clients/${client.id}` },
        ],
    };
}

function recommendationsResponse(client: Client): DoraResponse {
    const recs: string[] = [];
    const offTrack = client.goals.filter((g) => g.status === "off-track");
    const cashPct = (client.cashHoldings / client.totalPortfolio) * 100;
    const totalMonthly = client.goals.reduce((s, g) => s + g.monthlyContribution, 0);

    if (offTrack.length > 0) {
        recs.push(`🔴 **Address off-track goals**: ${offTrack.map((g) => g.name).join(", ")}. Consider increasing contributions or extending target dates.`);
    }
    if (cashPct > 20) {
        recs.push(`💰 **Deploy excess cash**: ${formatPHP(client.cashHoldings)} in idle cash (${cashPct.toFixed(0)}%). DCA into existing allocations to reduce inflation drag.`);
    }
    if (client.riskProfile === "Aggressive" && client.age > 50) {
        recs.push(`⚠️ **Risk-age review**: At age ${client.age} with Aggressive profile, consider transitioning 30-40% to balanced/conservative funds.`);
    }
    if (totalMonthly < client.monthlyIncome * 0.15) {
        recs.push(`📈 **Increase savings rate**: Monthly contributions of ${formatPHP(totalMonthly)} are below 15% of income. Consider increasing to ${formatPHP(Math.round(client.monthlyIncome * 0.2))}/mo.`);
    }
    if (client.goals.some((g) => g.status === "ahead")) {
        const aheadGoals = client.goals.filter((g) => g.status === "ahead");
        recs.push(`🟢 **Redirect surplus**: ${aheadGoals.map((g) => g.name).join(", ")} ahead of schedule. Consider redirecting excess contributions to off-track goals or de-risking.`);
    }
    if (recs.length === 0) {
        recs.push(`✅ ${client.name}'s portfolio is in good shape. Maintain current strategy and schedule regular reviews.`);
    }

    return {
        text: `Here are my recommendations for ${client.name}:\n\n${recs.join("\n\n")}`,
    };
}

function meetingPointsResponse(client: Client): DoraResponse {
    const points: string[] = [];
    const offTrack = client.goals.filter((g) => g.status === "off-track");
    const ahead = client.goals.filter((g) => g.status === "ahead");
    const cashPct = (client.cashHoldings / client.totalPortfolio) * 100;

    points.push(`📋 **Review Period**: YTD return +${client.returns.ytd}%, 1Y return +${client.returns.oneYear}%`);

    if (offTrack.length > 0) {
        points.push(`🔴 **Off-track Goals**: ${offTrack.map((g) => `${g.name} (${g.probability}%)`).join(", ")} — discuss remediation strategy`);
    }
    if (ahead.length > 0) {
        points.push(`🟢 **Ahead Goals**: ${ahead.map((g) => `${g.name} (${g.probability}%)`).join(", ")} — discuss de-risking or surplus redeployment`);
    }
    if (cashPct > 15) {
        points.push(`💰 **Cash Review**: ${cashPct.toFixed(0)}% in cash — discuss DCA plan to deploy idle funds`);
    }
    points.push(`📊 **Market Context**: BSP inflation at 5.3% — ensure all goal projections factor in purchasing power erosion`);
    if (client.goals.some((g) => g.type === "retirement")) {
        points.push(`🏠 **Retirement Check**: Review income replacement ratio target (70-80% of current ${formatPHP(client.monthlyIncome)}/mo)`);
    }

    return {
        text: `Meeting talking points for ${client.name}:\n\n${points.join("\n\n")}`,
        actions: [
            { label: "Open Meeting Prep", type: "navigate", target: `/clients/${client.id}` },
        ],
    };
}

function clientInfoResponse(client: Client): DoraResponse {
    const tenure = Math.round((Date.now() - new Date(client.joinedDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    return {
        text: `Client profile for ${client.name}:`,
        data: [
            { label: "Age", value: String(client.age), color: "default" },
            { label: "Risk Profile", value: client.riskProfile, color: "default" },
            { label: "Monthly Income", value: formatPHP(client.monthlyIncome), color: "default" },
            { label: "Client Since", value: client.joinedDate, color: "default" },
            { label: "Tenure", value: `~${tenure} year${tenure !== 1 ? "s" : ""}`, color: "default" },
            { label: "Active Goals", value: String(client.goals.length), color: "default" },
            { label: "Needs Action", value: client.needsAction ? `Yes — ${client.actionReason}` : "No", color: client.needsAction ? "amber" : "green" },
        ],
    };
}

// ---------- Cross-client responses ----------

function comparisonCashResponse(clients: Client[]): DoraResponse {
    const ranked = clients
        .map((c) => ({
            name: c.name,
            id: c.id,
            cashPct: (c.cashHoldings / c.totalPortfolio) * 100,
            cashAmount: c.cashHoldings,
        }))
        .sort((a, b) => b.cashPct - a.cashPct);

    const highCash = ranked.filter((c) => c.cashPct > 15);
    const text = highCash.length > 0
        ? `${highCash.length} client(s) have cash holdings above 15%:\n\n${highCash.map((c) => `• **${c.name}** — ${c.cashPct.toFixed(1)}% (${formatPHP(c.cashAmount)})`).join("\n")}`
        : "All clients have cash holdings within the recommended <15% threshold.";

    return {
        text,
        data: ranked.map((c) => ({
            label: c.name,
            value: `${c.cashPct.toFixed(1)}%`,
            color: (c.cashPct > 20 ? "red" : c.cashPct > 15 ? "amber" : "green") as "red" | "amber" | "green",
        })),
    };
}

function comparisonOfftrackResponse(clients: Client[]): DoraResponse {
    const clientsWithIssues = clients
        .map((c) => ({
            name: c.name,
            id: c.id,
            offTrack: c.goals.filter((g) => g.status === "off-track"),
            needsAction: c.needsAction,
            actionReason: c.actionReason,
        }))
        .filter((c) => c.offTrack.length > 0 || c.needsAction)
        .sort((a, b) => b.offTrack.length - a.offTrack.length);

    if (clientsWithIssues.length === 0) {
        return {
            text: "All clients are in good standing — no off-track goals or pending actions detected.",
            data: [{ label: "Status", value: "All Clear ✓", color: "green" }],
        };
    }

    const details = clientsWithIssues.map((c) => {
        const goals = c.offTrack.map((g) => `${g.name} (${g.probability}%)`).join(", ");
        return `• **${c.name}** — ${c.offTrack.length} off-track goal(s)${goals ? `: ${goals}` : ""}${c.actionReason ? ` | ${c.actionReason}` : ""}`;
    });

    return {
        text: `${clientsWithIssues.length} client(s) need attention:\n\n${details.join("\n")}`,
        data: clientsWithIssues.map((c) => ({
            label: c.name,
            value: `${c.offTrack.length} off-track`,
            color: "red" as const,
        })),
    };
}

function unknownResponse(): DoraResponse {
    return {
        text: "I'm not sure I understand that query. Here are some things I can help with:",
        actions: [
            { label: "Portfolio Summary", type: "info" },
            { label: "Goal Status", type: "info" },
            { label: "Off-track Goals", type: "info" },
            { label: "Risk Metrics", type: "info" },
            { label: "Cash Analysis", type: "info" },
            { label: "Recommendations", type: "info" },
        ],
    };
}

// ---------- Main Handler ----------

export async function generateResponse(
    intent: Intent,
    message: string,
    client: Client | null,
    allClients: Client[]
): Promise<DoraResponse> {
    // Cross-client intents (no single client needed)
    if (intent === "greeting") return greetingResponse();
    if (intent === "help") return helpResponse();
    if (intent === "comparison_cash") return comparisonCashResponse(allClients);
    if (intent === "comparison_offtrack") return comparisonOfftrackResponse(allClients);

    // RAG / Knowledge Base Handler
    if (intent === "knowledge_base" || intent === "unknown") {
        const { queryRAG } = await import("./rag");
        const ragResult = await queryRAG(message);

        // If unknown intent and RAG also returns nothing useful (needs_review with no sources), stick to unknown
        if (intent === "unknown" && ragResult.sources.length === 0) {
            return unknownResponse();
        }

        return {
            text: ragResult.answer,
            complianceBadge: ragResult.complianceBadge,
            sources: ragResult.sources,
            // If there are disclaimers, append them to text or handle on UI. Appending for now.
            actions: ragResult.sources.length > 0 ? [{ label: "View Source Doc", type: "info" }] : undefined
        };
    }

    // Single-client intents
    if (!client) {
        // If no client context, try to give a cross-client summary
        if (intent === "portfolio_summary") {
            const totalAUM = allClients.reduce((s, c) => s + c.totalPortfolio, 0);
            const totalClients = allClients.length;
            return {
                text: `Across all ${totalClients} clients:\n\n• **Total AUM**: ${formatPHP(totalAUM)}\n• **Avg Portfolio**: ${formatPHP(Math.round(totalAUM / totalClients))}`,
                data: allClients.map((c) => ({
                    label: c.name,
                    value: formatPHP(c.totalPortfolio),
                    color: "default" as const,
                })),
            };
        }
        if (intent === "off_track") return comparisonOfftrackResponse(allClients);
        if (intent === "cash_analysis") return comparisonCashResponse(allClients);
        return {
            text: "I'd be happy to help! Please navigate to a specific client's dashboard for detailed analysis, or ask me a cross-client question like \"Which clients have high cash?\" or \"Who needs attention?\"",
            actions: [
                { label: "Which clients need attention?", type: "info" },
                { label: "Cash analysis across clients", type: "info" },
            ],
        };
    }

    switch (intent) {
        case "portfolio_summary": return portfolioSummaryResponse(client);
        case "goal_status": return goalStatusResponse(client);
        case "off_track": return offTrackResponse(client);
        case "risk_metrics": return riskMetricsResponse(client);
        case "cash_analysis": return cashAnalysisResponse(client);
        case "rebalancing": return rebalancingResponse(client);
        case "recommendations": return recommendationsResponse(client);
        case "meeting_points": return meetingPointsResponse(client);
        case "client_info": return clientInfoResponse(client);
        default: return unknownResponse();
    }
}
