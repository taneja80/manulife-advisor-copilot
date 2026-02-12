import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Clock, Shield } from "lucide-react";
import { formatPHP, riskMultipliers, type Goal } from "@/lib/mockData";

const riskSteps = ["Conservative", "Balanced", "Growth", "Aggressive"];

interface GoalSimulatorProps {
  goal?: Goal;
  compact?: boolean;
  onSettingsChange?: (settings: {
    monthlySavings: number;
    timeHorizon: number;
    riskProfile: string;
    probability: number;
  }) => void;
}

export function GoalSimulator({ goal, compact, onSettingsChange }: GoalSimulatorProps) {
  const defaultSavings = goal?.monthlyContribution ?? 25000;
  const defaultHorizon = goal ? parseInt(goal.targetDate) : 2040;
  const defaultRiskIndex = goal ? riskSteps.indexOf(goal.riskProfile) : 1;
  const startingAmount = goal?.currentAmount ?? 2000000;
  const goalTarget = goal?.targetAmount ?? 15000000;

  const [monthlySavings, setMonthlySavings] = useState(defaultSavings);
  const [timeHorizon, setTimeHorizon] = useState(defaultHorizon);
  const [riskIndex, setRiskIndex] = useState(defaultRiskIndex >= 0 ? defaultRiskIndex : 1);

  const riskProfile = riskSteps[riskIndex];

  const chartData = useMemo(() => {
    const baseYear = 2026;
    const annualReturn = riskMultipliers[riskProfile] || 0.07;
    const volatility = annualReturn * 0.3;
    const data = [];
    let cumulative = startingAmount;

    for (let year = baseYear; year <= timeHorizon; year++) {
      const yearsSinceStart = year - baseYear;
      cumulative = cumulative * (1 + annualReturn) + monthlySavings * 12;
      const lower = cumulative * (1 - volatility * Math.sqrt(yearsSinceStart + 1));
      const upper = cumulative * (1 + volatility * Math.sqrt(yearsSinceStart + 1));
      const targetProgress = startingAmount + ((goalTarget - startingAmount) / (timeHorizon - baseYear)) * yearsSinceStart;

      data.push({
        year,
        projected: Math.round(cumulative),
        target: Math.round(targetProgress),
        lower: Math.round(Math.max(0, lower)),
        upper: Math.round(upper),
      });
    }
    return data;
  }, [monthlySavings, timeHorizon, riskProfile, startingAmount, goalTarget]);

  const probability = useMemo(() => {
    const annualReturn = riskMultipliers[riskProfile] || 0.07;
    const years = timeHorizon - 2026;
    let cumulative = startingAmount;
    for (let i = 0; i < years; i++) {
      cumulative = cumulative * (1 + annualReturn) + monthlySavings * 12;
    }
    const ratio = cumulative / goalTarget;
    return Math.min(99, Math.max(15, Math.round(ratio * 55 + years * 0.8)));
  }, [monthlySavings, timeHorizon, riskProfile, startingAmount, goalTarget]);

  useEffect(() => {
    onSettingsChange?.({ monthlySavings, timeHorizon, riskProfile, probability });
  }, [monthlySavings, timeHorizon, riskProfile, probability, onSettingsChange]);

  const isOnTrack = probability >= 75;
  const chartHeight = compact ? 200 : 320;

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
    return `₱${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-md">
          <p className="font-semibold text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatPHP(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold" data-testid="text-goal-simulator-title">
              {goal ? `Simulate: ${goal.name}` : "Goal Simulator"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Adjust the levers to see how they affect the projection
            </p>
          </div>
          <motion.div
            key={probability}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Badge
              variant={isOnTrack ? "default" : "destructive"}
              className={`text-sm px-4 py-1.5 ${isOnTrack ? "bg-[#00A758] border-[#00A758]" : ""}`}
              data-testid="badge-probability"
            >
              <Target className="w-3.5 h-3.5 mr-1.5" />
              Success: {probability}%
            </Badge>
          </motion.div>
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold">Projected Wealth</span>
          <Badge
            variant={isOnTrack ? "default" : "destructive"}
            className={`text-[10px] ${isOnTrack ? "bg-[#00A758] border-[#00A758]" : ""}`}
            data-testid="badge-probability-compact"
          >
            Success: {probability}%
          </Badge>
        </div>
      )}

      <div className={`w-full ${compact ? "" : ""}`} data-testid="chart-projected-wealth">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id={`projGrad-${goal?.id || "default"}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A758" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00A758" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={`boundsGrad-${goal?.id || "default"}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0C7143" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#0C7143" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="year" tick={{ fontSize: compact ? 10 : 12 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: compact ? 9 : 11 }} tickLine={false} axisLine={false} width={compact ? 50 : 65} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="upper" stackId="bounds" stroke="none" fill={`url(#boundsGrad-${goal?.id || "default"})`} name="Upper Bound" />
            <Area type="monotone" dataKey="lower" stackId="bounds-lower" stroke="none" fill="transparent" name="Lower Bound" />
            <Area type="monotone" dataKey="projected" stroke="#00A758" strokeWidth={2} fill={`url(#projGrad-${goal?.id || "default"})`} name="Projected" />
            <ReferenceLine y={goalTarget} stroke="#D9534F" strokeDasharray="8 4" strokeWidth={1.5}
              label={{ value: `Goal: ${formatYAxis(goalTarget)}`, position: "right", fill: "#D9534F", fontSize: compact ? 9 : 11, fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="target" stroke="#6B7280" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Target Path" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={`grid grid-cols-1 ${compact ? "gap-3" : "md:grid-cols-3 gap-4"}`}>
        <Card>
          <CardContent className={compact ? "p-3" : "p-5"}>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00A758]/10">
                <TrendingUp className="w-3.5 h-3.5 text-[#00A758]" />
              </div>
              <div>
                <p className="text-xs font-medium">Monthly Savings</p>
                <p className={`font-bold ${compact ? "text-sm" : "text-lg"}`} data-testid="text-monthly-savings">
                  {formatPHP(monthlySavings)}
                </p>
              </div>
            </div>
            <Slider
              value={[monthlySavings]}
              onValueChange={(v) => setMonthlySavings(v[0])}
              min={0}
              max={compact ? Math.max(200000, defaultSavings * 5) : 2500000}
              step={5000}
              data-testid="slider-monthly-savings"
            />
            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
              <span>₱0</span>
              <span>{formatPHP(compact ? Math.max(200000, defaultSavings * 5) : 2500000)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={compact ? "p-3" : "p-5"}>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0C7143]/10">
                <Clock className="w-3.5 h-3.5 text-[#0C7143]" />
              </div>
              <div>
                <p className="text-xs font-medium">Time Horizon</p>
                <p className={`font-bold ${compact ? "text-sm" : "text-lg"}`} data-testid="text-time-horizon">
                  {timeHorizon}
                </p>
              </div>
            </div>
            <Slider
              value={[timeHorizon]}
              onValueChange={(v) => setTimeHorizon(v[0])}
              min={2027}
              max={2055}
              step={1}
              data-testid="slider-time-horizon"
            />
            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
              <span>2027</span>
              <span>2055</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={compact ? "p-3" : "p-5"}>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0C7143]/10">
                <Shield className="w-3.5 h-3.5 text-[#0C7143]" />
              </div>
              <div>
                <p className="text-xs font-medium">Risk Profile</p>
                <p className={`font-bold ${compact ? "text-sm" : "text-lg"}`} data-testid="text-risk-profile">
                  {riskProfile}
                </p>
              </div>
            </div>
            <Slider
              value={[riskIndex]}
              onValueChange={(v) => setRiskIndex(v[0])}
              min={0}
              max={3}
              step={1}
              data-testid="slider-risk-profile"
            />
            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
              {riskSteps.map((step) => (
                <span key={step}>{step.slice(0, 4)}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
