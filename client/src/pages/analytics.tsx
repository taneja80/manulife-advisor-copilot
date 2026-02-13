import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  formatPHP,
  riskColors,
  getFundById,
  type Goal,
} from "@/lib/mockData";
import { useClients } from "@/hooks/useClients";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  Target,
  Banknote,
  RefreshCw,
  ArrowRight,
  BarChart3,
  PieChartIcon,
  Lightbulb,
  ChevronRight,
} from "lucide-react";

const COLORS = ["#00A758", "#0C7143", "#2E86AB", "#F59E0B", "#8B5CF6", "#D9534F"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-md">
        <p className="font-semibold text-sm mb-1">{label || payload[0]?.name}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color || COLORS[index] }}>
            {entry.name}: {typeof entry.value === "number" && entry.value > 1000 ? formatPHP(entry.value) : `${entry.value}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [, setLocation] = useLocation();
  const { data: clients = [], isLoading } = useClients();

  const analytics = useMemo(() => {
    if (clients.length === 0) return null;

    const allGoals: Goal[] = clients.flatMap((c) => c.goals);
    const totalAUM = clients.reduce((sum, c) => sum + c.totalPortfolio, 0);
    const totalInvested = allGoals.reduce((sum, g) => sum + g.portfolio.totalInvested, 0);
    const offTrackGoals = allGoals.filter((g) => g.status === "off-track");
    const aheadGoals = allGoals.filter((g) => g.status === "ahead");
    const avgProbability = allGoals.length > 0
      ? Math.round(allGoals.reduce((sum, g) => sum + g.probability, 0) / allGoals.length)
      : 0;

    const fundExposure: Record<string, { name: string; amount: number; category: string }> = {};
    allGoals.forEach((g) => {
      g.portfolio.funds.forEach((f) => {
        const fund = getFundById(f.fundId);
        if (fund) {
          if (!fundExposure[f.fundId]) {
            fundExposure[f.fundId] = { name: fund.name.replace("Manulife ", ""), amount: 0, category: fund.category };
          }
          fundExposure[f.fundId].amount += f.amount;
        }
      });
    });

    const allocationData = Object.values(fundExposure)
      .sort((a, b) => b.amount - a.amount)
      .map((f) => ({
        name: f.name.replace(" Fund", ""),
        value: totalInvested > 0 ? Math.round((f.amount / totalInvested) * 100) : 0,
        amount: f.amount,
        category: f.category,
      }));

    const clientPerformance = clients.map((c) => ({
      name: c.name.split(" ")[0],
      ytd: c.returns.ytd,
      oneYear: c.returns.oneYear,
      threeYear: c.returns.threeYear,
      portfolio: c.totalPortfolio,
    }));

    const fundingGaps = allGoals
      .filter((g) => {
        const yearsLeft = parseInt(g.targetDate) - 2026;
        if (yearsLeft <= 0) return false;
        const needed = (g.targetAmount - g.currentAmount) / (yearsLeft * 12);
        return needed > g.monthlyContribution;
      })
      .map((g) => {
        const yearsLeft = parseInt(g.targetDate) - 2026;
        const needed = Math.round((g.targetAmount - g.currentAmount) / (yearsLeft * 12));
        const gap = needed - g.monthlyContribution;
        const client = clients.find((c) => c.goals.some((cg) => cg.id === g.id));
        return { goal: g, client, needed, gap, yearsLeft };
      })
      .sort((a, b) => b.gap - a.gap);

    const rebalancingOpps = clients.filter((c) => {
      const cashPct = (c.cashHoldings / c.totalPortfolio) * 100;
      return cashPct > 20 || c.needsAction;
    });

    return {
      allGoals, totalAUM, totalInvested, offTrackGoals, aheadGoals, avgProbability,
      allocationData, clientPerformance, fundingGaps, rebalancingOpps,
    };
  }, [clients]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const {
    allGoals, totalAUM, offTrackGoals, aheadGoals, avgProbability,
    allocationData, clientPerformance, fundingGaps, rebalancingOpps,
  } = analytics;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-analytics-title">Advisor Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cross-client intelligence, risk alerts, and actionable recommendations
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Total AUM" value={formatPHP(totalAUM)} icon={Banknote} index={0} />
        <SummaryCard label="Active Clients" value={String(clients.length)} icon={Users} index={1} />
        <SummaryCard label="Total Goals" value={String(allGoals.length)} icon={Target} index={2} />
        <SummaryCard label="Avg Probability" value={`${avgProbability}%`} icon={TrendingUp} index={3}
          accent={avgProbability >= 75 ? "#00A758" : avgProbability >= 60 ? "#F59E0B" : "#D9534F"} />
        <SummaryCard label="Off Track" value={String(offTrackGoals.length)} icon={AlertTriangle} index={4} accent="#D9534F" />
        <SummaryCard label="Ahead" value={String(aheadGoals.length)} icon={TrendingUp} index={5} accent="#00A758" />
      </div>

      {(offTrackGoals.length > 0 || rebalancingOpps.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D9534F]" />
                Priority Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {offTrackGoals.map((g) => {
                const client = clients.find((c) => c.goals.some((cg) => cg.id === g.id));
                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#D9534F]/5 cursor-pointer"
                    onClick={() => client && setLocation(`/clients/${client.id}`)}
                    data-testid={`alert-offtrack-${g.id}`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-[#D9534F] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client?.name} · {g.probability}% probability · Target: {g.targetDate}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                );
              })}
              {rebalancingOpps.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#F59E0B]/5 cursor-pointer"
                  onClick={() => setLocation(`/clients/${c.id}`)}
                  data-testid={`alert-rebalance-${c.id}`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <RefreshCw className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.actionReason || `Cash at ${((c.cashHoldings / c.totalPortfolio) * 100).toFixed(0)}% - rebalancing opportunity`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {fundingGaps.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#F59E0B]" />
                Funding Gaps
              </CardTitle>
              <p className="text-xs text-muted-foreground">Goals where current monthly contributions fall short of what's needed</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {fundingGaps.slice(0, 5).map(({ goal, client, needed, gap, yearsLeft }) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer"
                  onClick={() => client && setLocation(`/clients/${client.id}`)}
                  data-testid={`gap-${goal.id}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {client?.name} · {yearsLeft}yr left · Currently {formatPHP(goal.monthlyContribution)}/mo
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#D9534F]">+{formatPHP(gap)}/mo</p>
                    <p className="text-[10px] text-muted-foreground">shortfall</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                AUM Allocation by Fund
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]" data-testid="chart-allocation">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                      {allocationData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {allocationData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground truncate">{entry.name}</span>
                    <span className="font-medium ml-auto">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Client YTD Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]" data-testid="chart-returns">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientPerformance} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ytd" fill="#00A758" radius={[0, 4, 4, 0]} name="YTD Return" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#00A758]" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.map((c) => {
              const clientOffTrack = c.goals.filter((g) => g.status === "off-track");
              const cashPct = (c.cashHoldings / c.totalPortfolio) * 100;
              const recommendations: string[] = [];

              if (clientOffTrack.length > 0) {
                recommendations.push(`${clientOffTrack.length} off-track goal${clientOffTrack.length > 1 ? "s" : ""} - schedule review meeting`);
              }
              if (cashPct > 20) {
                recommendations.push(`Deploy ${formatPHP(Math.round(c.cashHoldings * 0.5))} via DCA to combat 5.3% inflation`);
              }
              if (c.riskProfile === "Aggressive" && c.age > 50) {
                recommendations.push("Reduce equity exposure - age/risk mismatch detected");
              }
              if (c.returns.ytd > 10) {
                recommendations.push("Strong YTD performance - consider taking profits on volatile positions");
              }
              if (recommendations.length === 0) {
                recommendations.push("Portfolio on track - maintain current strategy");
              }

              return (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-muted/30 cursor-pointer"
                  onClick={() => setLocation(`/clients/${c.id}`)}
                  data-testid={`recommendation-${c.id}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{c.name}</p>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-current"
                        style={{ color: riskColors[c.riskProfile] }}
                      >
                        {c.riskProfile}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <ul className="space-y-1">
                    {recommendations.map((r, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-[#00A758]" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, index, accent }: {
  label: string; value: string; icon: any; index: number; accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
            <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ backgroundColor: `${accent || "#00A758"}15` }}>
              <Icon className="w-3 h-3" style={{ color: accent || "#00A758" }} />
            </div>
          </div>
          <p className="text-lg font-bold" style={accent ? { color: accent } : undefined} data-testid={`text-insight-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            {value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
