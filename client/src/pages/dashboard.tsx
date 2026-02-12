import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoalPortfolioEditor } from "@/components/portfolio-builder";
import { GoalSimulator } from "@/components/goal-simulator";
import { AICopilot } from "@/components/ai-copilot";
import {
  getClientById,
  getFundById,
  formatPHP,
  riskColors,
  getClientRiskMetrics,
  getClientWeightedReturns,
  type Goal,
} from "@/lib/mockData";
import {
  Wallet,
  TrendingUp,
  Target,
  Shield,
  ArrowLeft,
  Plus,
  Calendar,
  ChevronRight,
  BarChart3,
  Settings2,
  LineChart,
  Eye,
  Activity,
  ArrowDownRight,
  Gauge,
} from "lucide-react";

interface DashboardProps {
  onCreateGoal?: (clientId: string) => void;
}

type GoalTab = "overview" | "simulate" | "portfolio";

export default function Dashboard({ onCreateGoal }: DashboardProps) {
  const [, params] = useRoute("/clients/:id");
  const [, setLocation] = useLocation();
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [goalTabs, setGoalTabs] = useState<Record<string, GoalTab>>({});

  const clientId = params?.id;
  const client = clientId ? getClientById(clientId) : undefined;

  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Client not found</p>
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const goalsOnTrack = client.goals.filter((g) => g.status !== "off-track").length;
  const riskMetrics = getClientRiskMetrics(client);
  const weightedReturns = getClientWeightedReturns(client);

  const getGoalTab = (goalId: string): GoalTab => goalTabs[goalId] || "overview";
  const setGoalTab = (goalId: string, tab: GoalTab) => {
    setGoalTabs((prev) => ({ ...prev, [goalId]: tab }));
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-1 text-xs text-muted-foreground mb-2"
              data-testid="button-back-clients"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Clients
            </button>
            <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
              {client.name}'s Portfolio Health Check
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-sm text-muted-foreground">Age {client.age}</span>
              <Badge
                variant="outline"
                className="border-current"
                style={{ color: riskColors[client.riskProfile] }}
                data-testid="badge-client-risk"
              >
                <Shield className="w-3.5 h-3.5 mr-1" />
                {client.riskProfile}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Client since {new Date(client.joinedDate).getFullYear()}
              </span>
            </div>
          </div>
          <Button
            className="bg-[#00A758] border-[#00A758]"
            onClick={() => onCreateGoal?.(client.id)}
            data-testid="button-create-goal"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Goal
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <HeroStatCard
            label="Total Portfolio"
            value={formatPHP(client.totalPortfolio)}
            icon={Wallet}
            index={0}
          />
          <HeroStatCard
            label="YTD Return"
            value={`+${weightedReturns.ytd}%`}
            icon={TrendingUp}
            sub="Year to Date"
            index={1}
            valueColor="#00A758"
          />
          <HeroStatCard
            label="1-Year Return"
            value={`+${weightedReturns.oneYear}%`}
            icon={BarChart3}
            sub="Last 12 months"
            index={2}
            valueColor="#00A758"
          />
          <HeroStatCard
            label="3-Year Return"
            value={`+${weightedReturns.threeYear}%`}
            icon={BarChart3}
            sub="Annualized"
            index={3}
            valueColor="#00A758"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <HeroStatCard
            label="Volatility"
            value={`${riskMetrics.volatility.toFixed(1)}%`}
            icon={Activity}
            sub="Portfolio std dev"
            index={0}
          />
          <HeroStatCard
            label="Max Drawdown"
            value={`${riskMetrics.maxDrawdown.toFixed(1)}%`}
            icon={ArrowDownRight}
            sub="Worst peak-to-trough"
            index={1}
            valueColor="#D9534F"
          />
          <HeroStatCard
            label="Sharpe Ratio"
            value={riskMetrics.sharpeRatio.toFixed(2)}
            icon={Gauge}
            sub={riskMetrics.sharpeRatio >= 1 ? "Good risk-adjusted" : riskMetrics.sharpeRatio >= 0.5 ? "Moderate" : "Below average"}
            index={2}
          />
          <HeroStatCard
            label="Goals On Track"
            value={`${goalsOnTrack}/${client.goals.length}`}
            icon={Target}
            sub={client.goals.filter((g) => g.status === "off-track").length > 0 ? "Needs attention" : "All good"}
            index={3}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold" data-testid="text-goals-heading">Goals</h2>
              <p className="text-sm text-muted-foreground">{client.goals.length} active goals</p>
            </div>
          </div>

          {client.goals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={index}
              expanded={expandedGoal === goal.id}
              activeTab={getGoalTab(goal.id)}
              onToggle={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
              onTabChange={(tab) => setGoalTab(goal.id, tab)}
            />
          ))}
        </div>
      </div>

      <div className="hidden xl:block w-[320px] border-l p-4 overflow-y-auto bg-card/50 shrink-0">
        <AICopilot client={client} />
      </div>
    </div>
  );
}

function HeroStatCard({ label, value, icon: Icon, sub, index, valueColor }: {
  label: string; value: string; icon: any; sub?: string; index: number; valueColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00A758]/10 shrink-0">
              <Icon className="w-3.5 h-3.5 text-[#00A758]" />
            </div>
          </div>
          <p
            className="text-lg font-bold"
            style={valueColor ? { color: valueColor } : undefined}
            data-testid={`text-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {value}
          </p>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const tabItems: { key: GoalTab; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: Eye },
  { key: "simulate", label: "Simulate", icon: LineChart },
  { key: "portfolio", label: "Portfolio", icon: Settings2 },
];

function GoalCard({ goal, index, expanded, activeTab, onToggle, onTabChange }: {
  goal: Goal; index: number; expanded: boolean; activeTab: GoalTab;
  onToggle: () => void; onTabChange: (tab: GoalTab) => void;
}) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const statusColor = goal.status === "off-track" ? "#D9534F" : goal.status === "ahead" ? "#00A758" : "#0C7143";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card data-testid={`card-goal-${goal.id}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={onToggle} data-testid={`button-toggle-goal-${goal.id}`}>
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <p className="text-sm font-semibold">{goal.name}</p>
              <Badge
                variant={goal.status === "off-track" ? "destructive" : "default"}
                className={`text-[10px] ${goal.status === "ahead" ? "bg-[#00A758] border-[#00A758]" : goal.status === "on-track" ? "bg-[#0C7143] border-[#0C7143]" : ""}`}
              >
                {goal.status === "off-track" ? "Off Track" : goal.status === "ahead" ? "Ahead" : "On Track"}
              </Badge>
              <Badge variant="outline" className="text-[10px] border-current" style={{ color: riskColors[goal.riskProfile] }}>
                {goal.riskProfile}
              </Badge>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold" data-testid={`text-goal-probability-${goal.id}`}>{goal.probability}%</span>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground flex-wrap">
            <span>{formatPHP(goal.currentAmount)} / {formatPHP(goal.targetAmount)}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Target: {goal.targetDate}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: statusColor }}
            />
          </div>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="pt-3 border-t space-y-4"
            >
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50">
                {tabItems.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-1 justify-center ${
                      activeTab === tab.key ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                    data-testid={`tab-${tab.key}-${goal.id}`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-lg bg-muted/40">
                        <p className="text-xs text-muted-foreground">YTD</p>
                        <p className="text-sm font-bold text-[#00A758]" data-testid={`text-goal-ytd-${goal.id}`}>+{goal.returns.ytd}%</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/40">
                        <p className="text-xs text-muted-foreground">1-Year</p>
                        <p className="text-sm font-bold text-[#00A758]" data-testid={`text-goal-1y-${goal.id}`}>+{goal.returns.oneYear}%</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/40">
                        <p className="text-xs text-muted-foreground">3-Year</p>
                        <p className="text-sm font-bold text-[#00A758]" data-testid={`text-goal-3y-${goal.id}`}>+{goal.returns.threeYear}%</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold mb-2">
                        Portfolio · {formatPHP(goal.portfolio.totalInvested)} invested · {formatPHP(goal.monthlyContribution)}/mo
                      </p>
                      <div className="space-y-2">
                        {goal.portfolio.funds.map((fa) => {
                          const fund = getFundById(fa.fundId);
                          if (!fund) return null;
                          return (
                            <div key={fa.fundId} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30" data-testid={`row-goal-fund-${goal.id}-${fa.fundId}`}>
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate">{fund.name}</p>
                                <p className="text-[11px] text-muted-foreground">{fund.category}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-semibold">{fa.weight}%</p>
                                <p className="text-[11px] text-muted-foreground">{formatPHP(fa.amount)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <GoalNextAction goal={goal} />
                  </motion.div>
                )}

                {activeTab === "simulate" && (
                  <motion.div key="simulate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GoalSimulator goal={goal} compact />
                  </motion.div>
                )}

                {activeTab === "portfolio" && (
                  <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GoalPortfolioEditor goal={goal} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function GoalNextAction({ goal }: { goal: Goal }) {
  const actions: { text: string; severity: "warning" | "info" | "success" }[] = [];

  if (goal.status === "off-track") {
    const gap = goal.targetAmount - goal.currentAmount;
    const yearsLeft = parseInt(goal.targetDate) - 2026;
    const additionalNeeded = yearsLeft > 0 ? Math.round(gap / (yearsLeft * 12)) - goal.monthlyContribution : 0;
    if (additionalNeeded > 0) {
      actions.push({
        text: `Increase monthly contribution by ${formatPHP(additionalNeeded)} to get back on track by ${goal.targetDate}`,
        severity: "warning",
      });
    }
  }

  if (goal.probability < 70) {
    actions.push({
      text: `Consider extending target date or switching to a higher-growth risk profile to improve ${goal.probability}% probability`,
      severity: "warning",
    });
  }

  if (goal.status === "ahead") {
    actions.push({
      text: "Goal is ahead of schedule. Consider reallocating excess to other goals or reducing risk exposure",
      severity: "success",
    });
  }

  if (goal.riskProfile === "Conservative" && parseInt(goal.targetDate) > 2035) {
    actions.push({
      text: "Long time horizon with conservative risk. Consider moving to Balanced to maximize returns",
      severity: "info",
    });
  }

  if (actions.length === 0) {
    actions.push({ text: "Goal is on track. Continue current contribution and allocation strategy", severity: "success" });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold">Next Best Action</p>
      {actions.slice(0, 2).map((action, i) => (
        <div
          key={i}
          className={`p-2.5 rounded-lg text-[11px] leading-relaxed ${
            action.severity === "warning" ? "bg-[#D9534F]/5 text-[#D9534F]" :
            action.severity === "success" ? "bg-[#00A758]/5 text-[#00A758]" :
            "bg-[#0C7143]/5 text-[#0C7143]"
          }`}
          data-testid={`text-next-action-${goal.id}-${i}`}
        >
          {action.text}
        </div>
      ))}
    </div>
  );
}
