import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  TrendingUp,
  Banknote,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Zap,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { formatPHP, type Client } from "@/lib/mockData";

export interface AICopilotProps {
  client: Client;
  probability?: number;
  monthlySavings?: number;
  riskProfile?: string;
}

interface Insight {
  id: string;
  icon: any;
  severity: "critical" | "warning" | "info" | "success";
  category: "action" | "performance" | "talking-point";
  title: string;
  message: string;
}

export function AICopilot({ client }: AICopilotProps) {
  const totalInvested = client.goals.reduce((sum, g) => sum + g.portfolio.totalInvested, 0);
  const avgProb = Math.round(client.goals.reduce((sum, g) => sum + g.probability, 0) / client.goals.length);
  const offTrackGoals = client.goals.filter((g) => g.status === "off-track");
  const aheadGoals = client.goals.filter((g) => g.status === "ahead");
  const totalMonthly = client.goals.reduce((sum, g) => sum + g.monthlyContribution, 0);
  const cashPercentage = (client.cashHoldings / client.totalPortfolio) * 100;

  const weightedReturn = totalInvested > 0
    ? client.goals.reduce((sum, g) => {
      const weight = g.portfolio.totalInvested / totalInvested;
      return sum + g.returns.ytd * weight;
    }, 0)
    : 0;

  const insights: Insight[] = [];

  if (offTrackGoals.length > 0) {
    offTrackGoals.forEach((g) => {
      const gap = g.targetAmount - g.currentAmount;
      const yearsLeft = parseInt(g.targetDate) - 2026;
      const additionalMonthly = yearsLeft > 0 ? Math.round(gap / (yearsLeft * 12)) - g.monthlyContribution : 0;
      insights.push({
        id: `action-${g.id}`,
        icon: Zap,
        severity: "critical",
        category: "action",
        title: `Action: ${g.name}`,
        message: additionalMonthly > 0
          ? `Increase monthly contribution by ${formatPHP(additionalMonthly)} or extend target to improve ${g.probability}% probability.`
          : `Review allocation - current ${g.riskProfile} profile may need adjustment to reach ${formatPHP(g.targetAmount)} by ${g.targetDate}.`,
      });
    });
  }

  if (cashPercentage > 20) {
    insights.push({
      id: "cash-drag",
      icon: Banknote,
      severity: "warning",
      category: "action",
      title: "Excess Cash Holdings",
      message: `${cashPercentage.toFixed(0)}% (${formatPHP(client.cashHoldings)}) in cash. BSP inflation at 5.3% erodes ₱${formatPHP(Math.round(client.cashHoldings * 0.053))}/yr in purchasing power. Deploy via DCA.`,
    });
  }

  if (client.riskProfile === "Aggressive" && client.age > 50) {
    insights.push({
      id: "risk-mismatch",
      icon: AlertTriangle,
      severity: "warning",
      category: "action",
      title: "Risk-Age Mismatch",
      message: `At age ${client.age}, aggressive allocation carries higher sequence-of-returns risk. Suggest transitioning 30-40% to balanced/conservative funds.`,
    });
  }

  const fundExposure: Record<string, number> = {};
  client.goals.forEach((g) => {
    g.portfolio.funds.forEach((f) => {
      fundExposure[f.fundId] = (fundExposure[f.fundId] || 0) + f.amount;
    });
  });
  const maxFundId = Object.entries(fundExposure).sort((a, b) => b[1] - a[1])[0];
  if (maxFundId && maxFundId[1] / totalInvested > 0.35) {
    insights.push({
      id: "concentration",
      icon: RefreshCw,
      severity: "warning",
      category: "action",
      title: "Concentration Risk",
      message: `${((maxFundId[1] / totalInvested) * 100).toFixed(0)}% of portfolio concentrated in a single fund. Consider diversifying across more asset classes.`,
    });
  }

  insights.push({
    id: "performance",
    icon: BarChart3,
    severity: weightedReturn > 7 ? "success" : "info",
    category: "performance",
    title: "Portfolio Performance",
    message: `YTD weighted return: +${weightedReturn.toFixed(1)}%. ${weightedReturn > 5.3
        ? `Outpacing BSP inflation (5.3%) by ${(weightedReturn - 5.3).toFixed(1)}pp - real returns are positive.`
        : `Below BSP inflation (5.3%) - consider increasing equity exposure to preserve purchasing power.`
      }`,
  });

  if (aheadGoals.length > 0) {
    insights.push({
      id: "ahead-summary",
      icon: CheckCircle2,
      severity: "success",
      category: "performance",
      title: `${aheadGoals.length} Goal${aheadGoals.length > 1 ? "s" : ""} Ahead of Schedule`,
      message: `${aheadGoals.map((g) => g.name).join(", ")}. Consider de-risking or redirecting surplus contributions to off-track goals.`,
    });
  }

  if (avgProb >= 75 && offTrackGoals.length === 0) {
    insights.push({
      id: "all-good",
      icon: CheckCircle2,
      severity: "success",
      category: "performance",
      title: "Strong Overall Position",
      message: `Average goal probability at ${avgProb}%. All goals on track or ahead. Maintain current strategy.`,
    });
  }

  insights.push({
    id: "inflation-talk",
    icon: TrendingUp,
    severity: "info",
    category: "talking-point",
    title: "Inflation Talking Point",
    message: `BSP inflation at 5.3%. ${client.name}'s goals need real returns above this threshold. Show how DCA and equity allocation protect against inflation erosion.`,
  });

  insights.push({
    id: "dca-talk",
    icon: Lightbulb,
    severity: "info",
    category: "talking-point",
    title: "DCA Opportunity",
    message: `Current monthly commitment: ${formatPHP(totalMonthly)}. Peso-cost averaging reduces drawdown risk by ~30%. Ideal for volatile PH equity positions.`,
  });

  if (client.goals.some((g) => g.type === "retirement")) {
    const retGoal = client.goals.find((g) => g.type === "retirement");
    if (retGoal) {
      const retAge = parseInt(retGoal.targetDate) - (new Date().getFullYear() - client.age);
      insights.push({
        id: "retirement-talk",
        icon: Lightbulb,
        severity: "info",
        category: "talking-point",
        title: "Retirement Planning",
        message: `Planned retirement at age ~${retAge}. ${retGoal.probability >= 75 ? "On track" : "Needs attention"} - discuss lifestyle expectations and income replacement ratio (target: 70-80% of current income).`,
      });
    }
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical": return "border-l-[#D9534F] bg-[#D9534F]/8";
      case "warning": return "border-l-[#F59E0B] bg-[#F59E0B]/5";
      case "success": return "border-l-[#00A758] bg-[#00A758]/5";
      case "info": return "border-l-[#0C7143] bg-[#0C7143]/5";
      default: return "border-l-muted";
    }
  };

  const getIconColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-[#D9534F]";
      case "warning": return "text-[#F59E0B]";
      case "success": return "text-[#00A758]";
      case "info": return "text-[#0C7143]";
      default: return "text-muted-foreground";
    }
  };

  const actionInsights = insights.filter((i) => i.category === "action");
  const performanceInsights = insights.filter((i) => i.category === "performance");
  const talkingPoints = insights.filter((i) => i.category === "talking-point");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#00A758]/10">
          <MessageSquare className="w-4 h-4 text-[#00A758]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold" data-testid="text-copilot-title">AI Advisor Brief</h3>
          <p className="text-[11px] text-muted-foreground">For {client.name}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground">Avg Probability</p>
              <p className={`text-sm font-bold ${avgProb >= 75 ? "text-[#00A758]" : avgProb >= 60 ? "text-[#F59E0B]" : "text-[#D9534F]"}`}>{avgProb}%</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground">Monthly Commit</p>
              <p className="text-sm font-bold">{formatPHP(totalMonthly)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground">YTD Return</p>
              <p className="text-sm font-bold text-[#00A758]">+{weightedReturn.toFixed(1)}%</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground">Cash Ratio</p>
              <p className={`text-sm font-bold ${cashPercentage > 20 ? "text-[#D9534F]" : ""}`}>{cashPercentage.toFixed(0)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {actionInsights.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#D9534F]" />
            Priority Actions ({actionInsights.length})
          </p>
          <AnimatePresence mode="popLayout">
            {actionInsights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} getSeverityStyles={getSeverityStyles} getIconColor={getIconColor} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {performanceInsights.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-[#00A758]" />
            Performance
          </p>
          <AnimatePresence mode="popLayout">
            {performanceInsights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} getSeverityStyles={getSeverityStyles} getIconColor={getIconColor} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-[#0C7143]" />
          Meeting Talking Points
        </p>
        <AnimatePresence mode="popLayout">
          {talkingPoints.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} index={index} getSeverityStyles={getSeverityStyles} getIconColor={getIconColor} />
          ))}
        </AnimatePresence>
      </div>

      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-semibold">Goal Status</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-1.5">
          {client.goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between gap-1" data-testid={`row-goal-${goal.id}`}>
              <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">{goal.name}</span>
              <Badge
                variant={goal.status === "off-track" ? "destructive" : "default"}
                className={`text-[10px] px-1.5 py-0 ${goal.status === "ahead" ? "bg-[#00A758] border-[#00A758]" : goal.status === "on-track" ? "bg-[#0C7143] border-[#0C7143]" : ""}`}
              >
                {goal.probability}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InsightCard({ insight, index, getSeverityStyles, getIconColor }: {
  insight: Insight; index: number;
  getSeverityStyles: (s: string) => string; getIconColor: (s: string) => string;
}) {
  return (
    <motion.div
      key={insight.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      <Card className={`border-l-4 rounded-md ${getSeverityStyles(insight.severity)}`} data-testid={`card-insight-${insight.id}`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <insight.icon className={`w-4 h-4 mt-0.5 shrink-0 ${getIconColor(insight.severity)}`} />
            <div className="min-w-0">
              <p className="text-xs font-semibold mb-0.5">{insight.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
