import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GoalPortfolioEditor } from "@/components/portfolio-builder";
import { GoalSimulator } from "@/components/goal-simulator";
import { AICopilot } from "@/components/ai-copilot";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  getClientById,
  getFundById,
  formatPHP,
  riskColors,
  getClientRiskMetrics,
  getClientWeightedReturns,
  getClientFundExposure,
  getClientFeeAnalysis,
  getClientPerformanceHistory,
  getClientBenchmarkComparison,
  getClientPortfolioDrift,
  type Goal,
  type Client,
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
  PieChartIcon,
  DollarSign,
  AlertTriangle,
  FileText,
  Clock,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  Layers,
} from "lucide-react";

interface DashboardProps {
  onCreateGoal?: (clientId: string) => void;
}

type GoalTab = "overview" | "simulate" | "portfolio";

const CHART_COLORS = ["#00A758", "#0C7143", "#2E86AB", "#F59E0B", "#D9534F", "#8B5CF6", "#EC4899", "#14B8A6"];

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
  const fundExposure = useMemo(() => getClientFundExposure(client), [client]);
  const portfolioDrift = useMemo(() => getClientPortfolioDrift(client), [client]);
  const perfHistory = useMemo(() => getClientPerformanceHistory(client), [client]);
  const benchmarkData = useMemo(() => getClientBenchmarkComparison(client), [client]);

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
          <div className="flex items-center gap-2 flex-wrap">
            <MeetingPrepDialog client={client} />
            <Button
              className="bg-[#00A758] border-[#00A758]"
              onClick={() => onCreateGoal?.(client.id)}
              data-testid="button-create-goal"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Goal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <HeroStatCard label="Total Portfolio" value={formatPHP(client.totalPortfolio)} icon={Wallet} index={0} />
          <HeroStatCard label="YTD Return" value={`+${weightedReturns.ytd}%`} icon={TrendingUp} sub="Year to Date" index={1} valueColor="#00A758" />
          <HeroStatCard label="1-Year Return" value={`+${weightedReturns.oneYear}%`} icon={BarChart3} sub="Last 12 months" index={2} valueColor="#00A758" />
          <HeroStatCard label="3-Year Return" value={`+${weightedReturns.threeYear}%`} icon={BarChart3} sub="Annualized" index={3} valueColor="#00A758" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <HeroStatCard label="Volatility" value={`${riskMetrics.volatility.toFixed(1)}%`} icon={Activity} sub="Portfolio std dev" index={0} />
          <HeroStatCard label="Max Drawdown" value={`${riskMetrics.maxDrawdown.toFixed(1)}%`} icon={ArrowDownRight} sub="Worst peak-to-trough" index={1} valueColor="#D9534F" />
          <HeroStatCard label="Sharpe Ratio" value={riskMetrics.sharpeRatio.toFixed(2)} icon={Gauge} sub={riskMetrics.sharpeRatio >= 1 ? "Good risk-adjusted" : riskMetrics.sharpeRatio >= 0.5 ? "Moderate" : "Below average"} index={2} />
          <HeroStatCard label="Goals On Track" value={`${goalsOnTrack}/${client.goals.length}`} icon={Target} sub={client.goals.filter((g) => g.status === "off-track").length > 0 ? "Needs attention" : "All good"} index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PortfolioAllocationChart exposure={fundExposure} />
          <PerformanceHistoryChart data={perfHistory} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BenchmarkComparisonCard benchmark={benchmarkData} clientName={client.name} />
          <ContributionTracker goals={client.goals} client={client} />
        </div>

        <PortfolioDriftSection drift={portfolioDrift} clientRiskProfile={client.riskProfile} />

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

function PortfolioAllocationChart({ exposure }: { exposure: ReturnType<typeof getClientFundExposure> }) {
  const chartData = exposure.map((e) => ({
    name: e.fundName.length > 20 ? e.fundName.slice(0, 18) + "..." : e.fundName,
    fullName: e.fundName,
    value: e.totalAmount,
    weight: e.weight,
    category: e.category,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="h-full" data-testid="card-portfolio-allocation">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-[#00A758]" />
            Portfolio Allocation
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">{exposure.length} funds</Badge>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-[160px] h-[160px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border rounded-md p-2 shadow-md text-xs">
                          <p className="font-semibold">{d.fullName}</p>
                          <p className="text-muted-foreground">{d.category}</p>
                          <p className="font-bold mt-1">{d.weight}%</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              {exposure.slice(0, 5).map((e, idx) => (
                <div key={e.fundId} className="flex items-center gap-2" data-testid={`legend-fund-${e.fundId}`}>
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  <span className="text-[11px] truncate flex-1">{e.fundName}</span>
                  <span className="text-[11px] font-semibold shrink-0">{e.weight}%</span>
                </div>
              ))}
              {exposure.length > 5 && (
                <p className="text-[10px] text-muted-foreground pl-4">+{exposure.length - 5} more</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PerformanceHistoryChart({ data }: { data: ReturnType<typeof getClientPerformanceHistory> }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Card className="h-full" data-testid="card-performance-history">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <LineChart className="w-4 h-4 text-[#00A758]" />
            Performance History
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">vs Benchmarks</Badge>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00A758" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00A758" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(data.length / 6))} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover border rounded-md p-2 shadow-md text-xs space-y-1">
                        <p className="font-semibold">{label}</p>
                        {payload.map((p: any) => (
                          <div key={p.dataKey} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.stroke }} />
                            <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
                            <span className="font-semibold">{p.value?.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="portfolio" stroke="#00A758" strokeWidth={2} fill="url(#gradPortfolio)" name="Portfolio" />
                <Area type="monotone" dataKey="benchmark" stroke="#2E86AB" strokeWidth={1.5} fill="none" strokeDasharray="4 2" name="PSEi" />
                <Area type="monotone" dataKey="balanced" stroke="#F59E0B" strokeWidth={1.5} fill="none" strokeDasharray="2 2" name="Balanced" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-[#00A758] rounded" />
              <span className="text-[10px] text-muted-foreground">Portfolio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-[#2E86AB] rounded" style={{ borderTop: "1px dashed #2E86AB" }} />
              <span className="text-[10px] text-muted-foreground">PSEi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-[#F59E0B] rounded" />
              <span className="text-[10px] text-muted-foreground">Balanced</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BenchmarkComparisonCard({ benchmark, clientName }: { benchmark: ReturnType<typeof getClientBenchmarkComparison>; clientName: string }) {
  const barData = [
    { name: clientName.split(" ")[0], value: benchmark.clientYtd, fill: "#00A758" },
    { name: "PSEi", value: benchmark.pseiYtd, fill: "#2E86AB" },
    { name: "Balanced", value: benchmark.balancedYtd, fill: "#F59E0B" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="h-full" data-testid="card-benchmark-comparison">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00A758]" />
            Benchmark Comparison
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">YTD</Badge>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-[120px] mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-md p-2 shadow-md text-xs">
                        <p className="font-semibold">{d.name}</p>
                        <p>YTD Return: <span className="font-bold">{d.value}%</span></p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-muted/40 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">vs PSEi Index</p>
              <p className={`text-sm font-bold flex items-center justify-center gap-1 ${benchmark.outperformsIndex ? "text-[#00A758]" : "text-[#D9534F]"}`} data-testid="text-vs-psei">
                {benchmark.outperformsIndex ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {benchmark.vsIndex > 0 ? "+" : ""}{benchmark.vsIndex}%
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">vs Balanced Fund</p>
              <p className={`text-sm font-bold flex items-center justify-center gap-1 ${benchmark.outperformsBalanced ? "text-[#00A758]" : "text-[#D9534F]"}`} data-testid="text-vs-balanced">
                {benchmark.outperformsBalanced ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {benchmark.vsBalanced > 0 ? "+" : ""}{benchmark.vsBalanced}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ContributionTracker({ goals, client }: { goals: Goal[]; client: Client }) {
  const totalMonthlyDCA = goals.reduce((s, g) => s + g.monthlyContribution, 0);
  const annualDCA = totalMonthlyDCA * 12;
  const totalInvested = goals.reduce((s, g) => s + g.portfolio.totalInvested, 0);
  const dcaToIncomeRatio = client.monthlyIncome > 0 ? Math.round((totalMonthlyDCA / client.monthlyIncome) * 100) : 0;

  const goalContributions = goals
    .map((g) => ({
      id: g.id,
      name: g.name,
      monthly: g.monthlyContribution,
      invested: g.portfolio.totalInvested,
      share: totalMonthlyDCA > 0 ? Math.round((g.monthlyContribution / totalMonthlyDCA) * 100) : 0,
      status: g.status,
    }))
    .sort((a, b) => b.monthly - a.monthly);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="h-full" data-testid="card-contribution-tracker">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#00A758]" />
            Contribution Tracker
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">{dcaToIncomeRatio}% of income</Badge>
        </CardHeader>
        <CardContent className="pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground">Monthly DCA</p>
              <p className="text-sm font-bold text-[#00A758]" data-testid="text-monthly-dca">{formatPHP(totalMonthlyDCA)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground">Annual DCA</p>
              <p className="text-sm font-bold" data-testid="text-annual-dca">{formatPHP(annualDCA)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground">Total Invested</p>
              <p className="text-sm font-bold" data-testid="text-total-invested">{formatPHP(totalInvested)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground">DCA Breakdown by Goal</p>
            {goalContributions.map((gc) => (
              <div key={gc.id} className="flex items-center gap-2" data-testid={`row-contribution-${gc.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold truncate">{gc.name}</span>
                    <span className="text-[11px] font-semibold shrink-0">{formatPHP(gc.monthly)}/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${gc.share}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-[#00A758]"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{gc.share}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PortfolioDriftSection({ drift, clientRiskProfile }: { drift: ReturnType<typeof getClientPortfolioDrift>; clientRiskProfile: string }) {
  const statusColor = drift.status === "aligned" ? "#00A758" : drift.status === "minor-drift" ? "#F59E0B" : "#D9534F";
  const statusLabel = drift.status === "aligned" ? "Well Aligned" : drift.status === "minor-drift" ? "Minor Drift" : "Significant Drift";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card data-testid="card-portfolio-drift">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0C7143]" />
            Portfolio Drift from Model
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] border-current"
            style={{ color: statusColor }}
          >
            {statusLabel}
          </Badge>
        </CardHeader>
        <CardContent className="pb-4 space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <p className="text-[11px] text-muted-foreground">Recommended Model</p>
              <p className="text-sm font-semibold">{drift.modelName}</p>
              <p className="text-[11px] text-muted-foreground">
                Based on {clientRiskProfile} risk profile
              </p>
            </div>
            <div className="text-center px-4">
              <p className="text-2xl font-bold" style={{ color: statusColor }} data-testid="text-overall-drift">
                {drift.overallDrift}%
              </p>
              <p className="text-[10px] text-muted-foreground">Overall Drift</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {drift.fundDrifts.map((fd) => {
              const globalMax = Math.max(...drift.fundDrifts.map(d => Math.max(d.actualWeight, d.modelWeight)), 1);
              const barScale = 100 / (globalMax * 1.15);
              return (
                <div key={fd.fundId} className="space-y-1" data-testid={`drift-fund-${fd.fundId}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{fd.fundName}</p>
                      <p className="text-[10px] text-muted-foreground">{fd.category}</p>
                    </div>
                    {fd.direction !== "match" && (
                      <Badge
                        variant={fd.direction === "over" ? "destructive" : "outline"}
                        className="text-[10px] shrink-0"
                      >
                        {fd.direction === "over" ? "+" : ""}{fd.drift}%
                      </Badge>
                    )}
                    {fd.direction === "match" && (
                      <Badge variant="outline" className="text-[10px] shrink-0 text-[#00A758] border-[#00A758]">
                        Aligned
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-12 shrink-0">Actual</span>
                      <div className="flex-1 h-3 rounded-sm bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-sm"
                          style={{
                            width: `${fd.actualWeight * barScale}%`,
                            backgroundColor: fd.direction === "over" ? "#D9534F" : fd.direction === "under" ? "#F59E0B" : "#00A758",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium w-10 text-right shrink-0">{fd.actualWeight}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-12 shrink-0">Model</span>
                      <div className="flex-1 h-3 rounded-sm bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-sm bg-[#0C7143]/60"
                          style={{ width: `${fd.modelWeight * barScale}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium w-10 text-right shrink-0">{fd.modelWeight}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MeetingPrepDialog({ client }: { client: Client }) {
  const weightedReturns = getClientWeightedReturns(client);
  const riskMetrics = getClientRiskMetrics(client);
  const feeAnalysis = getClientFeeAnalysis(client);
  const benchmark = getClientBenchmarkComparison(client);
  const driftData = getClientPortfolioDrift(client);
  const goalsOnTrack = client.goals.filter((g) => g.status !== "off-track").length;
  const offTrackGoals = client.goals.filter((g) => g.status === "off-track");
  const totalContributions = client.goals.reduce((s, g) => s + g.monthlyContribution, 0);

  const talkingPoints = [];
  if (benchmark.outperformsIndex) {
    talkingPoints.push({ text: `Portfolio is outperforming PSEi by ${benchmark.vsIndex}% YTD - strong market positioning`, type: "success" as const });
  } else {
    talkingPoints.push({ text: `Portfolio is trailing PSEi by ${Math.abs(benchmark.vsIndex)}% YTD - discuss reallocation`, type: "warning" as const });
  }
  if (offTrackGoals.length > 0) {
    talkingPoints.push({ text: `${offTrackGoals.length} goal(s) off-track: ${offTrackGoals.map(g => g.name).join(", ")}`, type: "warning" as const });
  }
  if (driftData.status !== "aligned") {
    talkingPoints.push({ text: `Portfolio has ${driftData.overallDrift}% drift from ${driftData.modelName} model - review fund allocation alignment`, type: driftData.status === "significant-drift" ? "warning" as const : "info" as const });
  }
  if (feeAnalysis.weightedExpenseRatio > 1.2) {
    talkingPoints.push({ text: `Weighted expense ratio is ${feeAnalysis.weightedExpenseRatio}% - review lower cost fund options`, type: "info" as const });
  }
  if (client.cashHoldings > client.totalPortfolio * 0.15) {
    talkingPoints.push({ text: `Cash holdings of ${formatPHP(client.cashHoldings)} exceed 15% threshold - discuss deploying idle cash`, type: "info" as const });
  }
  talkingPoints.push({ text: `BSP inflation at 5.3% - ensure all goal projections factor in purchasing power erosion`, type: "info" as const });
  if (client.age > 55 && client.riskProfile === "Aggressive") {
    talkingPoints.push({ text: `Client is ${client.age} with Aggressive profile - consider de-risking as they approach retirement`, type: "warning" as const });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-meeting-prep">
          <FileText className="w-4 h-4 mr-1.5" />
          Prep Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-[#00A758]" />
            Meeting Prep: {client.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-[10px] text-muted-foreground">Total AUM</p>
              <p className="text-sm font-bold">{formatPHP(client.totalPortfolio)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-[10px] text-muted-foreground">YTD Return</p>
              <p className="text-sm font-bold text-[#00A758]">+{weightedReturns.ytd}%</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-[10px] text-muted-foreground">Goals On Track</p>
              <p className="text-sm font-bold">{goalsOnTrack}/{client.goals.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-[10px] text-muted-foreground">Monthly DCA</p>
              <p className="text-sm font-bold">{formatPHP(totalContributions)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              Key Metrics
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground">Risk Profile</p>
                <p className="text-xs font-semibold" style={{ color: riskColors[client.riskProfile] }}>{client.riskProfile}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground">Sharpe Ratio</p>
                <p className="text-xs font-semibold">{riskMetrics.sharpeRatio.toFixed(2)}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground">Expense Ratio</p>
                <p className="text-xs font-semibold">{feeAnalysis.weightedExpenseRatio}%</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#00A758]" />
              Goal Summary
            </h3>
            <div className="space-y-2">
              {client.goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30" data-testid={`meeting-goal-${goal.id}`}>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{goal.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatPHP(goal.currentAmount)} / {formatPHP(goal.targetAmount)} &middot; {goal.targetDate}
                    </p>
                  </div>
                  <Badge
                    variant={goal.status === "off-track" ? "destructive" : "default"}
                    className={`text-[10px] shrink-0 ${goal.status === "ahead" ? "bg-[#00A758] border-[#00A758]" : goal.status === "on-track" ? "bg-[#0C7143] border-[#0C7143]" : ""}`}
                  >
                    {goal.probability}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-[#2E86AB]" />
              Talking Points
            </h3>
            <div className="space-y-2">
              {talkingPoints.map((tp, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 p-2.5 rounded-lg text-[11px] leading-relaxed ${
                    tp.type === "warning" ? "bg-[#D9534F]/5" :
                    tp.type === "success" ? "bg-[#00A758]/5" :
                    "bg-[#2E86AB]/5"
                  }`}
                  data-testid={`meeting-point-${idx}`}
                >
                  {tp.type === "warning" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D9534F] shrink-0 mt-0.5" />
                  ) : tp.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00A758] shrink-0 mt-0.5" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-[#2E86AB] shrink-0 mt-0.5" />
                  )}
                  <span>{tp.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
