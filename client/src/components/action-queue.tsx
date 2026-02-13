import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    ArrowRight,
    Banknote,
    Calendar,
    CheckCircle2,
    TrendingUp,
    ShieldAlert,
    Clock // Use Clock instead of Hourglass for compatibility
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface Insight {
    id: string;
    clientId: string;
    clientName: string;
    title: string;
    description: string;
    type: "opportunity" | "risk" | "service" | "compliance";
    priority: number;
    actionType: "rebalance" | "contact" | "review" | "tax_harvest";
    actionLabel: string;
    actionUrl: string;
    tags: string[];
}

export function ActionQueue() {
    const [, setLocation] = useLocation();
    const { data: insights, isLoading } = useQuery<Insight[]>({
        queryKey: ["/api/dora/alerts"],
    });

    if (isLoading) {
        return <div className="flex gap-4 overflow-hidden mb-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-[350px] shrink-0 rounded-xl" />)}
        </div>;
    }

    if (!insights || insights.length === 0) return null;

    const topInsights = insights.slice(0, 5); // Show top 5

    const getIcon = (type: string) => {
        switch (type) {
            case "opportunity": return <TrendingUp className="w-5 h-5 text-[#00A758]" />;
            case "risk": return <ShieldAlert className="w-5 h-5 text-red-500" />;
            case "service": return <Clock className="w-5 h-5 text-blue-500" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: number) => {
        if (priority >= 9) return "bg-red-100 text-red-700 border-red-200";
        if (priority >= 7) return "bg-amber-100 text-amber-700 border-amber-200";
        return "bg-blue-100 text-blue-700 border-blue-200";
    };

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#00A758]" />
                        Next Best Actions
                    </h2>
                    <p className="text-sm text-muted-foreground">Prioritized recommendations for your clients based on real-time data.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                    {insights.length} Actions Pending
                </Badge>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {topInsights.map((insight) => (
                    <div
                        key={insight.id}
                        className="w-[380px] shrink-0 bg-card rounded-xl border shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        {/* Priority Indicator */}
                        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold border-l border-b ${getPriorityColor(insight.priority)}`}>
                            Priority {insight.priority}/10
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-background rounded-full border shadow-sm mt-1">
                                    {getIcon(insight.type)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base leading-tight pr-16">{insight.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{insight.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {insight.clientName}
                                </Badge>
                                {insight.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs text-muted-foreground font-normal">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                {insight.actionType.replace("_", " ")}
                            </span>
                            <Button
                                size="sm"
                                className="group-hover:bg-[#00A758] transition-colors"
                                onClick={() => setLocation(insight.actionUrl)}
                            >
                                {insight.actionLabel}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
