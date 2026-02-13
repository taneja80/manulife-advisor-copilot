import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Cell,
} from "recharts";
import { type BenchmarkComparison } from "@/lib/mockData";

export function BenchmarkComparisonCard({ benchmark, clientName }: { benchmark: BenchmarkComparison; clientName: string }) {
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
