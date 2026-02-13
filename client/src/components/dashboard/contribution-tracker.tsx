import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";
import { type Goal, type Client, formatPHP } from "@/lib/mockData";

export function ContributionTracker({ goals, client }: { goals: Goal[]; client: Client }) {
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
