import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChartIcon } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from "recharts";
import { type FundExposure } from "@/lib/mockData";

export const CHART_COLORS = ["#00A758", "#0C7143", "#2E86AB", "#F59E0B", "#D9534F", "#8B5CF6", "#EC4899", "#14B8A6"];

export function PortfolioAllocationChart({ exposure }: { exposure: FundExposure[] }) {
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
