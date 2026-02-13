import { useState, useMemo, lazy, Suspense } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Added Sheet
import {
  getClientRiskMetrics,
  getClientWeightedReturns,
  getClientFundExposure,
  getClientPerformanceHistory,
  getClientBenchmarkComparison,
  getClientPortfolioDrift,
  formatPHP,
} from "@/lib/mockData";
import { useClient } from "@/hooks/useClients";
import {
  Wallet,
  TrendingUp,
  Target,
  ArrowLeft,
  BarChart3,
  Activity,
  ArrowDownRight,
  Gauge,
  Sparkles, // Added Sparkles
  MessageSquare // Added MessageSquare
} from "lucide-react";

// Extensive imports
import { ClientHeader } from "@/components/dashboard/client-header";
import { HeroStatCard } from "@/components/dashboard/hero-stat-card";
import { GoalCard, type GoalTab } from "@/components/dashboard/goal-card";
import { ChartSkeleton } from "@/components/dashboard/skeletons";

// Dynamic Imports for Heavy Components
const ClientIntelligencePanel = lazy(() => import("@/components/dashboard/client-intelligence-panel").then(m => ({ default: m.ClientIntelligencePanel })));
const PortfolioAllocationChart = lazy(() => import("@/components/dashboard/portfolio-allocation-chart").then(m => ({ default: m.PortfolioAllocationChart })));
const PerformanceHistoryChart = lazy(() => import("@/components/dashboard/performance-history-chart").then(m => ({ default: m.PerformanceHistoryChart })));
const BenchmarkComparisonCard = lazy(() => import("@/components/dashboard/benchmark-comparison").then(m => ({ default: m.BenchmarkComparisonCard })));
const ContributionTracker = lazy(() => import("@/components/dashboard/contribution-tracker").then(m => ({ default: m.ContributionTracker })));
const PortfolioDriftSection = lazy(() => import("@/components/dashboard/portfolio-drift").then(m => ({ default: m.PortfolioDriftSection })));
const ClientTimeline = lazy(() => import("@/components/dashboard/client-timeline").then(m => ({ default: m.ClientTimeline })));
const PeerComparisonChart = lazy(() => import("@/components/dashboard/peer-comparison").then(m => ({ default: m.PeerComparisonChart })));
const AttributionBreakdown = lazy(() => import("@/components/dashboard/attribution-breakdown").then(m => ({ default: m.AttributionBreakdown })));

interface DashboardProps {
  onCreateGoal?: (clientId: string) => void;
  isPresentationMode?: boolean;
}

export default function Dashboard({ onCreateGoal, isPresentationMode = false }: DashboardProps) {
  const [, params] = useRoute("/clients/:id");
  const [, setLocation] = useLocation();
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [goalTabs, setGoalTabs] = useState<Record<string, GoalTab>>({});
  const [mobileDoraOpen, setMobileDoraOpen] = useState(false); // Mobile state

  const clientId = params?.id;
  const { data: client, isLoading } = useClient(clientId);

  const fundExposure = useMemo(() => client ? getClientFundExposure(client) : [], [client]);
  const portfolioDrift = useMemo(() => client ? getClientPortfolioDrift(client) : null, [client]);
  const perfHistory = useMemo(() => client ? getClientPerformanceHistory(client) : [], [client]);
  const benchmarkData = useMemo(() => client ? getClientBenchmarkComparison(client) : null, [client]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

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
    <div className="flex h-full relative"> {/* Added relative for FAB positioning if needed, though fixed is better */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24"> {/* Added pb-24 for mobile FAB clearance */}
        <ClientHeader client={client} onCreateGoal={onCreateGoal} />

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
          <Suspense fallback={<ChartSkeleton />}>
            <PortfolioAllocationChart exposure={fundExposure} />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <PerformanceHistoryChart data={perfHistory} />
          </Suspense>
        </div>

        {/* New Attribution Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Suspense fallback={<ChartSkeleton />}>
            <AttributionBreakdown />
          </Suspense>
          {portfolioDrift && (
            <Suspense fallback={<ChartSkeleton />}>
              <PortfolioDriftSection drift={portfolioDrift} clientRiskProfile={client.riskProfile} />
            </Suspense>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {benchmarkData && (
            <Suspense fallback={<ChartSkeleton />}>
              <BenchmarkComparisonCard benchmark={benchmarkData} clientName={client.name} />
            </Suspense>
          )}
          <Suspense fallback={<ChartSkeleton />}>
            <ContributionTracker goals={client.goals} client={client} />
          </Suspense>
        </div>

        <Suspense fallback={<ChartSkeleton />}>
          <PeerComparisonChart currentClient={client} />
        </Suspense>

        {!isPresentationMode && (
          <div className="grid grid-cols-1">
            <Suspense fallback={<ChartSkeleton />}>
              <ClientTimeline notes={client.meetingNotes} compact={true} onAddEvent={() => { }} />
            </Suspense>
          </div>
        )}

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
              clientName={client.name}
              onToggle={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
              onTabChange={(tab) => setGoalTab(goal.id, tab)}
            />
          ))}
        </div>
      </div>

      {/* Desktop Intelligence Panel */}
      {!isPresentationMode && (
        <div className="hidden xl:block w-[360px] border-l overflow-hidden bg-card/50 shrink-0">
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center space-y-4 flex-col p-4"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>}>
            <ClientIntelligencePanel clientId={client.id} clientName={client.name} client={client} />
          </Suspense>
        </div>
      )}

      {/* Mobile Intelligence Panel FAB & Sheet */}
      {!isPresentationMode && (
        <div className="xl:hidden">
          <Sheet open={mobileDoraOpen} onOpenChange={setMobileDoraOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-[#00A758] hover:bg-[#008a47] z-50"
              >
                <Sparkles className="h-6 w-6 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[100%] sm:w-[400px] p-0 border-l pt-10">
              <div className="h-full flex flex-col">
                <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
                  <ClientIntelligencePanel clientId={client.id} clientName={client.name} client={client} />
                </Suspense>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}
