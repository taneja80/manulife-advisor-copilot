import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { type PortfolioDrift } from "@/lib/mockData";

export function PortfolioDriftSection({ drift, clientRiskProfile }: { drift: PortfolioDrift; clientRiskProfile: string }) {
    const statusColor = drift.status === "aligned" ? "#00A758" : drift.status === "minor-drift" ? "#F59E0B" : "#D9534F";
    const statusLabel = drift.status === "aligned" ? "Well Aligned" : drift.status === "minor-drift" ? "Minor Drift" : "Significant Drift";

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card data-testid="card-portfolio-drift">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#0C7143]" />
                        Portfolio Drift from Model
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="text-[10px] border-current"
                        style={{ color: statusColor }}
                    >
                        {statusLabel}
                    </Badge>
                </CardHeader>
                <CardContent className="pb-4 space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 flex-wrap">
                        <div className="flex-1 min-w-[140px]">
                            <p className="text-[11px] text-muted-foreground">Recommended Model</p>
                            <p className="text-sm font-semibold">{drift.modelName}</p>
                            <p className="text-[11px] text-muted-foreground">
                                Based on {clientRiskProfile} risk profile
                            </p>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-2xl font-bold" style={{ color: statusColor }} data-testid="text-overall-drift">
                                {drift.overallDrift}%
                            </p>
                            <p className="text-[10px] text-muted-foreground">Overall Drift</p>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {drift.fundDrifts.map((fd) => {
                            const globalMax = Math.max(...drift.fundDrifts.map(d => Math.max(d.actualWeight, d.modelWeight)), 1);
                            const barScale = 100 / (globalMax * 1.15);
                            return (
                                <div key={fd.fundId} className="space-y-1" data-testid={`drift-fund-${fd.fundId}`}>
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium truncate">{fd.fundName}</p>
                                            <p className="text-[10px] text-muted-foreground">{fd.category}</p>
                                        </div>
                                        {fd.direction !== "match" && (
                                            <Badge
                                                variant={fd.direction === "over" ? "destructive" : "outline"}
                                                className="text-[10px] shrink-0"
                                            >
                                                {fd.direction === "over" ? "+" : ""}{fd.drift}%
                                            </Badge>
                                        )}
                                        {fd.direction === "match" && (
                                            <Badge variant="outline" className="text-[10px] shrink-0 text-[#00A758] border-[#00A758]">
                                                Aligned
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground w-12 shrink-0">Actual</span>
                                            <div className="flex-1 h-3 rounded-sm bg-muted/50 overflow-hidden">
                                                <div
                                                    className="h-full rounded-sm"
                                                    style={{
                                                        width: `${fd.actualWeight * barScale}%`,
                                                        backgroundColor: fd.direction === "over" ? "#D9534F" : fd.direction === "under" ? "#F59E0B" : "#00A758",
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-medium w-10 text-right shrink-0">{fd.actualWeight}%</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground w-12 shrink-0">Model</span>
                                            <div className="flex-1 h-3 rounded-sm bg-muted/50 overflow-hidden">
                                                <div
                                                    className="h-full rounded-sm bg-[#0C7143]/60"
                                                    style={{ width: `${fd.modelWeight * barScale}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-medium w-10 text-right shrink-0">{fd.modelWeight}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
