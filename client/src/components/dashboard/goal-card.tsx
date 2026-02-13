import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Calendar,
    ChevronRight,
    Eye,
    LineChart,
    Settings2,
} from "lucide-react";
import {
    type Goal,
    getFundById,
    formatPHP,
    riskColors,
} from "@/lib/mockData";

// Lazy load potentially heavy components
const GoalPortfolioEditor = lazy(() => import("@/components/portfolio-builder").then(m => ({ default: m.GoalPortfolioEditor })));
const GoalSimulator = lazy(() => import("@/components/goal-simulator").then(m => ({ default: m.GoalSimulator })));

export type GoalTab = "overview" | "simulate" | "portfolio";

const tabItems: { key: GoalTab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: Eye },
    { key: "simulate", label: "Simulate", icon: LineChart },
    { key: "portfolio", label: "Portfolio", icon: Settings2 },
];

interface GoalCardProps {
    goal: Goal;
    index: number;
    expanded: boolean;
    activeTab: GoalTab;
    clientName: string;
    onToggle: () => void;
    onTabChange: (tab: GoalTab) => void;
}

export function GoalCard({ goal, index, expanded, activeTab, clientName, onToggle, onTabChange }: GoalCardProps) {
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
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-1 justify-center ${activeTab === tab.key ? "bg-background shadow-sm" : "text-muted-foreground"
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
                                        {/* Goal Progress - PRIMARY METRICS */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="text-center p-2 rounded-lg bg-[#00A758]/5 border border-[#00A758]/10">
                                                <p className="text-[10px] text-muted-foreground">Funded</p>
                                                <p className="text-sm font-bold text-[#00A758]" data-testid={`text-goal-funded-${goal.id}`}>
                                                    {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                                                </p>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-[#00A758]/5 border border-[#00A758]/10">
                                                <p className="text-[10px] text-muted-foreground">Monthly DCA</p>
                                                <p className={`text-sm font-bold ${goal.monthlyContribution > 0 ? "text-[#00A758]" : "text-[#D9534F]"}`} data-testid={`text-goal-dca-${goal.id}`}>
                                                    {goal.monthlyContribution > 0 ? formatPHP(goal.monthlyContribution) : "Not Set"}
                                                </p>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-muted/40">
                                                <p className="text-[10px] text-muted-foreground">Time Left</p>
                                                <p className="text-sm font-bold" data-testid={`text-goal-timeleft-${goal.id}`}>
                                                    {Math.max(0, parseInt(goal.targetDate) - 2026)} yrs
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contribution Gap Indicator */}
                                        <ContributionGap goal={goal} />

                                        {/* Portfolio Returns - SECONDARY */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="text-center p-1.5 rounded-lg bg-muted/30">
                                                <p className="text-[10px] text-muted-foreground">YTD Return</p>
                                                <p className="text-xs font-medium text-muted-foreground" data-testid={`text-goal-ytd-${goal.id}`}>+{goal.returns.ytd}%</p>
                                            </div>
                                            <div className="text-center p-1.5 rounded-lg bg-muted/30">
                                                <p className="text-[10px] text-muted-foreground">1-Year</p>
                                                <p className="text-xs font-medium text-muted-foreground" data-testid={`text-goal-1y-${goal.id}`}>+{goal.returns.oneYear}%</p>
                                            </div>
                                            <div className="text-center p-1.5 rounded-lg bg-muted/30">
                                                <p className="text-[10px] text-muted-foreground">3-Year</p>
                                                <p className="text-xs font-medium text-muted-foreground" data-testid={`text-goal-3y-${goal.id}`}>+{goal.returns.threeYear}%</p>
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
                                        <Suspense fallback={<div className="h-[300px] flex items-center justify-center"><Skeleton className="h-[280px] w-full" /></div>}>
                                            <GoalSimulator goal={goal} compact />
                                        </Suspense>
                                    </motion.div>
                                )}

                                {activeTab === "portfolio" && (
                                    <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <Suspense fallback={<div className="h-[300px] flex items-center justify-center"><Skeleton className="h-[280px] w-full" /></div>}>
                                            <GoalPortfolioEditor goal={goal} clientName={clientName} />
                                        </Suspense>
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

function ContributionGap({ goal }: { goal: Goal }) {
    const yearsLeft = Math.max(1, parseInt(goal.targetDate) - 2026);
    const gap = goal.targetAmount - goal.currentAmount;
    const requiredMonthly = Math.round(gap / (yearsLeft * 12));
    const actualMonthly = goal.monthlyContribution;
    const contributionGap = requiredMonthly - actualMonthly;
    const isOnTrack = contributionGap <= 0;
    const hasNoDCA = actualMonthly === 0;

    return (
        <div
            className={`p-2.5 rounded-lg text-xs leading-relaxed space-y-1 ${hasNoDCA
                    ? "bg-[#D9534F]/5 border border-[#D9534F]/15"
                    : isOnTrack
                        ? "bg-[#00A758]/5 border border-[#00A758]/15"
                        : "bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30"
                }`}
            data-testid={`contribution-gap-${goal.id}`}
        >
            {hasNoDCA ? (
                <>
                    <p className="font-semibold text-[#D9534F]">⚠ No Monthly Investment Set</p>
                    <p className="text-[11px] text-muted-foreground">
                        Setting up a monthly contribution of <span className="font-bold text-foreground">{formatPHP(requiredMonthly)}/mo</span> would
                        put this goal on track. DCA (Dollar Cost Averaging) reduces market timing risk.
                    </p>
                </>
            ) : isOnTrack ? (
                <>
                    <p className="font-semibold text-[#00A758]">✓ Contributions On Track</p>
                    <p className="text-[11px] text-muted-foreground">
                        Contributing {formatPHP(actualMonthly)}/mo (need {formatPHP(requiredMonthly)}/mo). Keep going!
                    </p>
                </>
            ) : (
                <>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                        ↑ Increase by {formatPHP(contributionGap)}/mo
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Currently {formatPHP(actualMonthly)}/mo — need {formatPHP(requiredMonthly)}/mo to reach target by {goal.targetDate}.
                    </p>
                </>
            )}
        </div>
    );
}

function GoalNextAction({ goal }: { goal: Goal }) {
    const actions: { text: string; severity: "warning" | "info" | "success" }[] = [];

    // DCA-specific action — highest priority
    if (goal.monthlyContribution === 0) {
        actions.push({
            text: `No monthly investment set up. Enrolling in DCA can improve goal probability by up to 15% through peso cost averaging.`,
            severity: "warning",
        });
    }

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
                    className={`p-2.5 rounded-lg text-[11px] leading-relaxed ${action.severity === "warning" ? "bg-[#D9534F]/5 text-[#D9534F]" :
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
