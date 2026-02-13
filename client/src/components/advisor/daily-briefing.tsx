import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Sun, CloudSun } from "lucide-react";

export function DailyBriefing() {
    const today = new Date();
    const userName = "Abhis"; // This would come from auth context

    // Mock Market Data (Philippines context)
    const marketStats = [
        { label: "PSEi", value: "6,850.42", change: "+1.2%", trend: "up" },
        { label: "USD/PHP", value: "56.20", change: "-0.15", trend: "down" }, // PHP strengthening (good)
        { label: "10Y Treasury", value: "6.12%", change: "+0.05", trend: "up" },
    ];

    return (
        <div className="space-y-4">
            {/* Greeting Banner */}
            <div className="rounded-xl bg-gradient-to-r from-[#00A758] to-[#0C7143] p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Sun className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">{format(today, "EEEE, MMMM do")}</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Good morning, {userName}</h1>
                    <p className="text-sm text-green-50 opacity-90 max-w-md">
                        You have <strong>3 meetings</strong> scheduled today. The market is looking bullish with PSEi up by 1.2%.
                    </p>
                </div>

                {/* Decorative Background Pattern */}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 translate-x-10"></div>
                <div className="absolute right-20 top-0 h-full w-20 bg-white/5 skew-x-12"></div>
            </div>

            {/* Market Pulse Ticker */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {marketStats.map((stat, i) => (
                    <Card key={i} className="bg-card/50 border-input/40 shadow-sm hover:bg-card transition-colors">
                        <CardContent className="p-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">{stat.label}</p>
                                <p className="text-sm font-bold">{stat.value}</p>
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
