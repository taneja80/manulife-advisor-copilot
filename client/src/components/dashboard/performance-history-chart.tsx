import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from "recharts";
import { type PerformancePoint } from "@/lib/mockData";

export function PerformanceHistoryChart({ data }: { data: PerformancePoint[] }) {
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
