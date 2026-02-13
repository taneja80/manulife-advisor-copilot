import { motion } from "framer-motion";
import { TrendingUp, Shield, CalendarCheck, Info } from "lucide-react";

interface DCABenefitCalloutProps {
    monthlyAmount?: number;
    years?: number;
    compact?: boolean;
}

const formatPHP = (n: number) =>
    `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;

export function DCABenefitCallout({ monthlyAmount, years, compact }: DCABenefitCalloutProps) {
    const projectedTotal = monthlyAmount && years ? monthlyAmount * 12 * years : null;
    const projectedWithReturns = projectedTotal ? Math.round(projectedTotal * 1.28) : null; // ~7% avg return compounded simply

    const benefits = [
        {
            icon: Shield,
            title: "Reduces Timing Risk",
            desc: "No need to guess the best time to invest — you invest consistently regardless of market conditions.",
        },
        {
            icon: TrendingUp,
            title: "Peso Cost Averaging",
            desc: "Buy more units when prices are low, fewer when high — your average cost is naturally optimized.",
        },
        {
            icon: CalendarCheck,
            title: "Builds Discipline",
            desc: "Automatic monthly investments turn wealth building into a habit, not a decision.",
        },
    ];

    if (compact) {
        return (
            <div className="rounded-lg border border-[#00A758]/20 bg-[#00A758]/5 p-3 space-y-2">
                <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#00A758]" />
                    <p className="text-xs font-semibold text-[#00A758]">Why Monthly Investing Works</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {benefits.map((b, i) => (
                        <div key={i} className="text-center">
                            <b.icon className="w-3.5 h-3.5 text-[#00A758] mx-auto mb-1" />
                            <p className="text-[10px] font-medium leading-tight">{b.title}</p>
                        </div>
                    ))}
                </div>
                {projectedTotal && projectedWithReturns && (
                    <p className="text-[10px] text-muted-foreground text-center">
                        {formatPHP(monthlyAmount!)}/mo × {years} years = {formatPHP(projectedTotal)} invested → est. {formatPHP(projectedWithReturns)} with returns
                    </p>
                )}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[#00A758]/20 bg-gradient-to-br from-[#00A758]/5 to-transparent p-4 space-y-3"
        >
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#00A758]/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#00A758]" />
                </div>
                <div>
                    <p className="text-sm font-bold">Dollar Cost Averaging (DCA)</p>
                    <p className="text-[11px] text-muted-foreground">The smartest way to build wealth over time</p>
                </div>
            </div>

            <div className="space-y-2.5">
                {benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-[#00A758]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <b.icon className="w-3.5 h-3.5 text-[#00A758]" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold">{b.title}</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{b.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {projectedTotal && projectedWithReturns && (
                <div className="rounded-lg bg-muted/40 p-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">
                        Investing <span className="font-bold text-foreground">{formatPHP(monthlyAmount!)}/mo</span> for{" "}
                        <span className="font-bold text-foreground">{years} years</span>
                    </p>
                    <p className="text-xs mt-0.5">
                        Total invested: {formatPHP(projectedTotal)} → Est. value:{" "}
                        <span className="font-bold text-[#00A758]">{formatPHP(projectedWithReturns)}</span>
                    </p>
                </div>
            )}
        </motion.div>
    );
}
