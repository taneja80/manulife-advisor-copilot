import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from "recharts";
import { useClients } from "@/hooks/useClients";
import type { Client } from "@shared/schema";

interface PeerComparisonProps {
    currentClient: Client;
}

export function PeerComparisonChart({ currentClient }: PeerComparisonProps) {
    const { data: allClients = [] } = useClients();

    const metrics = useMemo(() => {
        if (!allClients.length) return null;

        // Calculate averages and percentiles
        const returns = allClients.map(c => c.returns.oneYear).sort((a, b) => a - b);
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

        // Find percentile of current client
        const rank = returns.findIndex(r => r >= currentClient.returns.oneYear);
        const percentile = Math.round(((rank + 1) / returns.length) * 100);

        // Mock category averages
        const peerGroupAvg = avgReturn;
        const topQuartile = returns[Math.floor(returns.length * 0.75)];

        return {
            percentile,
            data: [
                { name: "My Portfolio", value: currentClient.returns.oneYear, fill: "#00A758" }, // Manulife Green
                { name: "Peer Average", value: peerGroupAvg, fill: "#94a3b8" },
                { name: "Top Quartile", value: topQuartile, fill: "#3b82f6" },
                { name: "Market (PSEi)", value: 4.5, fill: "#f59e0b" } // Mock market benchmark
            ]
        };
    }, [allClients, currentClient]);

    if (!metrics) return null;

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold">Performance vs Peers</CardTitle>
                        <CardDescription>1-Year Return Comparison</CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-[#00A758]">{metrics.percentile}th</p>
                        <p className="text-xs text-muted-foreground">Percentile</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.data} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={85}
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => [`${value.toFixed(1)}%`, "Return"]}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0] as any} barSize={24} background={{ fill: '#f1f5f9', radius: [0, 4, 4, 0] as any }}>
                                {metrics.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    {currentClient.name} is performing better than {metrics.percentile}% of similar portfolios.
                </p>
            </CardContent>
        </Card>
    );
}
