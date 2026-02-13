import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import {
    TooltipProvider,
    Tooltip as UiTooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { MetricTooltip } from "@/components/metric-tooltip";

export function AttributionBreakdown() {
    // Mock Data - In a real app, this would come from the backend based on the client's portfolio holdings and fund performance
    const attributionData = [
        { name: "Equity", contribution: 8.5, color: "#10b981" }, // Green
        { name: "Fixed Income", contribution: 2.1, color: "#3b82f6" }, // Blue
        { name: "Money Market", contribution: 0.8, color: "#f59e0b" }, // Amber
        { name: "Fees", contribution: -1.2, color: "#ef4444" }, // Red
    ];

    const fundPerformance = [
        { name: "Manulife Global Fund", return: 12.4, contribution: 5.2, type: "contributor" },
        { name: "Philippine Equity Fund", return: 8.1, contribution: 3.3, type: "contributor" },
        { name: "Strategic Income Fund", return: 4.2, contribution: 1.5, type: "contributor" },
        { name: "Asia Pacific REIT", return: -2.1, contribution: -0.4, type: "detractor" },
        { name: "Cash Equivalent", return: 1.9, contribution: 0.6, type: "neutral" },
    ];

    const totalReturn = attributionData.reduce((acc, curr) => acc + curr.contribution, 0);

    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <MetricTooltip
                            label="Performance Attribution"
                            metric="Performance Attribution"
                            definition="Breakdown of portfolio returns by asset class and fund contribution (YTD)."
                            explanation="This helps explain WHY a portfolio is up or down. Use this to show clients that while one fund might be down, the overall strategy (Asset Allocation) is working."
                        >
                            Performance Attribution
                        </MetricTooltip>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">YTD Return Breakdown</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={totalReturn >= 0 ? "default" : "destructive"} className="font-mono">
                        {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {/* Waterfall / Bar Chart for Asset Allocation Contribution */}
                <div className="h-[200px] w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attributionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 11 }}
                                width={80}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => [`${value > 0 ? "+" : ""}${value}%`, "Contribution"]}
                            />
                            <ReferenceLine x={0} stroke="#e5e7eb" />
                            <Bar dataKey="contribution" radius={[0, 4, 4, 0]} barSize={20}>
                                {attributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Contributors / Detractors */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            Top Contributors
                        </h4>
                        <div className="space-y-2">
                            {fundPerformance
                                .filter(f => f.contribution > 0)
                                .sort((a, b) => b.contribution - a.contribution)
                                .slice(0, 3)
                                .map((fund, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="truncate max-w-[180px]" title={fund.name}>{fund.name}</span>
                                        <span className="font-mono text-green-600">+{fund.contribution.toFixed(2)}%</span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider flex items-center gap-2">
                            <TrendingDown className="w-3 h-3 text-red-500" />
                            Top Detractors
                        </h4>
                        <div className="space-y-2">
                            {fundPerformance
                                .filter(f => f.contribution < 0)
                                .sort((a, b) => a.contribution - b.contribution) // Most negative first
                                .slice(0, 3)
                                .map((fund, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="truncate max-w-[180px]" title={fund.name}>{fund.name}</span>
                                        <span className="font-mono text-red-600">{fund.contribution.toFixed(2)}%</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
