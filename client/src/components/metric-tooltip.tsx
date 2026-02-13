import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface MetricTooltipProps {
    label: string;
    metric: string; // e.g. "Sharpe Ratio"
    definition: string;
    explanation: string; // Contextual "why it matters"
    children: React.ReactNode;
}

export function MetricTooltip({ label, metric, definition, explanation, children }: MetricTooltipProps) {
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild className="cursor-help decoration-dotted underline-offset-4 hover:underline">
                    <div className="flex items-center gap-1 group">
                        {children}
                        <HelpCircle className="w-3 h-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-4 bg-popover border-border shadow-xl">
                    <div className="space-y-2">
                        <div>
                            <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                                {metric}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">{definition}</p>
                        </div>

                        <div className="bg-muted p-2 rounded-md text-xs border-l-2 border-primary">
                            <span className="font-bold text-primary mr-1">💡 Coach's Note:</span>
                            {explanation}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
