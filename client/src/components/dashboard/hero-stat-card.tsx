import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function HeroStatCard({ label, value, icon: Icon, sub, index, valueColor }: {
    label: string; value: string; icon: any; sub?: string; index: number; valueColor?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
        >
            <Card className="h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs text-muted-foreground font-medium">{label}</span>
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00A758]/10 shrink-0">
                            <Icon className="w-3.5 h-3.5 text-[#00A758]" />
                        </div>
                    </div>
                    <p
                        className="text-lg font-bold"
                        style={valueColor ? { color: valueColor } : undefined}
                        data-testid={`text-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                        {value}
                    </p>
                    {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
                </CardContent>
            </Card>
        </motion.div>
    );
}
