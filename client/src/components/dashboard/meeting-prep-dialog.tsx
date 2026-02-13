import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FileText,
    Zap,
    Target,
    Layers,
    AlertTriangle,
    CheckCircle2,
    Printer,
    Clock,
    Plus,
    Save,
    ClipboardList,
    CalendarDays,
    ListChecks,
} from "lucide-react";
import {
    type Client,
    type MeetingNote,
} from "@shared/schema";
import {
    getClientWeightedReturns,
    getClientRiskMetrics,
    getClientFeeAnalysis,
    getClientBenchmarkComparison,
    getClientPortfolioDrift,
    formatPHP,
    riskColors,
} from "@/lib/mockData";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// ---- Agenda Item Types ----

interface AgendaItem {
    id: string;
    title: string;
    description: string;
    duration: number; // minutes
    priority: "high" | "medium" | "low";
    checked: boolean;
}

interface FollowUpTask {
    task: string;
    done: boolean;
}

// ---- Component ----

export function MeetingPrepDialog({ client }: { client: Client }) {
    const { toast } = useToast();
    const weightedReturns = getClientWeightedReturns(client);
    const riskMetrics = getClientRiskMetrics(client);
    const feeAnalysis = getClientFeeAnalysis(client);
    const benchmark = getClientBenchmarkComparison(client);
    const driftData = getClientPortfolioDrift(client);
    const goalsOnTrack = client.goals.filter((g) => g.status !== "off-track").length;
    const offTrackGoals = client.goals.filter((g) => g.status === "off-track");
    const aheadGoals = client.goals.filter((g) => g.status === "ahead");
    const totalContributions = client.goals.reduce((s, g) => s + g.monthlyContribution, 0);
    const cashPct = ((client.cashHoldings / client.totalPortfolio) * 100);

    const [activeTab, setActiveTab] = useState<"agenda" | "factsheet" | "notes">("agenda");
    const [meetingNotes, setMeetingNotes] = useState("");
    const [followUps, setFollowUps] = useState<FollowUpTask[]>([]);
    const [newFollowUp, setNewFollowUp] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // ---- Auto-Generated Agenda ----

    const agenda = useMemo(() => {
        const items: AgendaItem[] = [];
        let id = 0;

        // Always: Welcome & overview
        items.push({
            id: `a-${id++}`,
            title: "Welcome & Relationship Check-In",
            description: `Review ${client.name}'s current situation, life changes, and priorities since last meeting.`,
            duration: 5,
            priority: "medium",
            checked: false,
        });

        // Off-track goals (high priority, first)
        if (offTrackGoals.length > 0) {
            items.push({
                id: `a-${id++}`,
                title: `Off-Track Goals Review (${offTrackGoals.length})`,
                description: offTrackGoals.map((g) => `${g.name}: ${g.probability}% probability — discuss contribution increase or timeline extension`).join(". "),
                duration: 10,
                priority: "high",
                checked: false,
            });
        }

        // Portfolio drift
        if (driftData.status !== "aligned") {
            items.push({
                id: `a-${id++}`,
                title: `Portfolio Rebalancing (${driftData.overallDrift}% drift)`,
                description: `Portfolio has drifted from ${driftData.modelName} model. Review fund allocation and discuss rebalancing.`,
                duration: 10,
                priority: driftData.status === "significant-drift" ? "high" : "medium",
                checked: false,
            });
        }

        // Performance review
        items.push({
            id: `a-${id++}`,
            title: "Performance Review",
            description: `YTD return +${weightedReturns.ytd}%, 1Y +${weightedReturns.oneYear}%. ${benchmark.outperformsIndex ? `Outperforming PSEi by ${benchmark.vsIndex}%` : `Trailing PSEi by ${Math.abs(benchmark.vsIndex)}%`}. Sharpe ratio: ${riskMetrics.sharpeRatio.toFixed(2)}.`,
            duration: 10,
            priority: "medium",
            checked: false,
        });

        // Cash management
        if (cashPct > 15) {
            items.push({
                id: `a-${id++}`,
                title: `Cash Management (${cashPct.toFixed(0)}%)`,
                description: `${formatPHP(client.cashHoldings)} idle in cash. Discuss DCA plan to deploy into goal allocations.`,
                duration: 5,
                priority: cashPct > 25 ? "high" : "medium",
                checked: false,
            });
        }

        // Ahead goals / surplus redeployment
        if (aheadGoals.length > 0) {
            items.push({
                id: `a-${id++}`,
                title: `Surplus Review (${aheadGoals.length} goal${aheadGoals.length > 1 ? "s" : ""} ahead)`,
                description: `${aheadGoals.map((g) => g.name).join(", ")} ahead of schedule. Discuss de-risking or redirecting contributions.`,
                duration: 5,
                priority: "low",
                checked: false,
            });
        }

        // Fee review
        if (feeAnalysis.weightedExpenseRatio > 1.2) {
            items.push({
                id: `a-${id++}`,
                title: "Fee & Expense Review",
                description: `Weighted expense ratio at ${feeAnalysis.weightedExpenseRatio}% (${formatPHP(feeAnalysis.annualFeeCost)}/yr). Review lower-cost alternatives.`,
                duration: 5,
                priority: "low",
                checked: false,
            });
        }

        // Next steps
        items.push({
            id: `a-${id++}`,
            title: "Action Items & Next Steps",
            description: "Summarize agreed actions, set follow-up date, and confirm next quarterly review.",
            duration: 5,
            priority: "medium",
            checked: false,
        });

        return items;
    }, [client, offTrackGoals, driftData, weightedReturns, benchmark, riskMetrics, cashPct, aheadGoals, feeAnalysis]);

    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(agenda);

    const totalDuration = agendaItems.reduce((s, a) => s + a.duration, 0);

    // ---- Auto-suggested follow-ups ----

    const suggestedFollowUps = useMemo(() => {
        const suggestions: string[] = [];
        if (offTrackGoals.length > 0) {
            suggestions.push(`Increase monthly contribution for ${offTrackGoals[0].name}`);
        }
        if (driftData.status !== "aligned") {
            suggestions.push("Execute rebalancing trade to align with model portfolio");
        }
        if (cashPct > 20) {
            suggestions.push("Set up DCA schedule for idle cash deployment");
        }
        if (client.riskProfile === "Aggressive" && client.age > 50) {
            suggestions.push("Schedule risk profile review — consider de-risking");
        }
        suggestions.push("Schedule next quarterly review meeting");
        return suggestions;
    }, [client, offTrackGoals, driftData, cashPct]);

    // ---- Talking Points ----

    const talkingPoints = useMemo(() => {
        const points: { text: string; type: "success" | "warning" | "info" }[] = [];
        if (benchmark.outperformsIndex) {
            points.push({ text: `Portfolio outperforming PSEi by ${benchmark.vsIndex}% YTD — strong positioning`, type: "success" });
        } else {
            points.push({ text: `Portfolio trailing PSEi by ${Math.abs(benchmark.vsIndex)}% YTD — discuss reallocation`, type: "warning" });
        }
        if (offTrackGoals.length > 0) {
            points.push({ text: `${offTrackGoals.length} goal(s) off-track: ${offTrackGoals.map(g => g.name).join(", ")}`, type: "warning" });
        }
        if (driftData.status !== "aligned") {
            points.push({ text: `Portfolio drift: ${driftData.overallDrift}% from ${driftData.modelName} model`, type: driftData.status === "significant-drift" ? "warning" : "info" });
        }
        if (cashPct > 15) {
            points.push({ text: `Cash holdings at ${cashPct.toFixed(0)}% — discuss deploying idle funds via DCA`, type: "info" });
        }
        points.push({ text: `BSP inflation at 5.3% — all goal projections should factor in purchasing power erosion`, type: "info" });
        if (client.age > 55 && client.riskProfile === "Aggressive") {
            points.push({ text: `Client is ${client.age} with Aggressive profile — consider de-risking`, type: "warning" });
        }
        return points;
    }, [benchmark, offTrackGoals, driftData, cashPct, client]);

    const addFollowUp = () => {
        if (newFollowUp.trim()) {
            setFollowUps([...followUps, { task: newFollowUp.trim(), done: false }]);
            setNewFollowUp("");
        }
    };

    const addSuggestedFollowUp = (suggestion: string) => {
        if (!followUps.some((f) => f.task === suggestion)) {
            setFollowUps([...followUps, { task: suggestion, done: false }]);
        }
    };

    const toggleFollowUp = (idx: number) => {
        setFollowUps((prev) => prev.map((f, i) => (i === idx ? { ...f, done: !f.done } : f)));
    };

    const saveNotes = async () => {
        setIsSaving(true);
        try {
            const note: MeetingNote = {
                date: new Date().toISOString().slice(0, 10),
                notes: meetingNotes,
                followUps,
            };
            const existing = client.meetingNotes || [];
            await apiRequest("PATCH", `/api/clients/${client.id}`, {
                meetingNotes: [...existing, note],
            });
            toast({
                title: "Meeting Notes Saved",
                description: `Notes and ${followUps.length} follow-up(s) saved to ${client.name}'s record.`,
            });
        } catch {
            toast({
                title: "Save Failed",
                description: "Could not save meeting notes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const priorityColor = (p: string) => {
        switch (p) {
            case "high": return "text-[#D9534F] bg-[#D9534F]/10 border-[#D9534F]/30";
            case "medium": return "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30";
            default: return "text-[#00A758] bg-[#00A758]/10 border-[#00A758]/30";
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-meeting-prep">
                    <FileText className="w-4 h-4 mr-1.5" />
                    Prep Meeting
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <FileText className="w-5 h-5 text-[#00A758]" />
                            Meeting Prep: {client.name}
                        </DialogTitle>
                        <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Print
                        </Button>
                    </div>
                </DialogHeader>

                {/* Client Snapshot (always visible) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    <div className="p-3 rounded-lg bg-muted/40 text-center">
                        <p className="text-[10px] text-muted-foreground">Total AUM</p>
                        <p className="text-sm font-bold">{formatPHP(client.totalPortfolio)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 text-center">
                        <p className="text-[10px] text-muted-foreground">YTD Return</p>
                        <p className="text-sm font-bold text-[#00A758]">+{weightedReturns.ytd}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 text-center">
                        <p className="text-[10px] text-muted-foreground">Goals On Track</p>
                        <p className="text-sm font-bold">{goalsOnTrack}/{client.goals.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 text-center">
                        <p className="text-[10px] text-muted-foreground">Monthly DCA</p>
                        <p className="text-sm font-bold">{formatPHP(totalContributions)}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mt-3 border-b pb-0 print:hidden">
                    {[
                        { id: "agenda" as const, label: "Agenda", icon: ClipboardList },
                        { id: "factsheet" as const, label: "Fact Sheet", icon: CalendarDays },
                        { id: "notes" as const, label: "Notes & Follow-ups", icon: ListChecks },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? "border-[#00A758] text-[#00A758]"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            data-testid={`tab-${tab.id}`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ---- AGENDA TAB ---- */}
                {activeTab === "agenda" && (
                    <div className="space-y-3 mt-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    Estimated duration: <strong className="text-foreground">{totalDuration} min</strong>
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <Badge variant="outline" className="text-[9px] text-[#D9534F] border-[#D9534F]/30">High</Badge>
                                <Badge variant="outline" className="text-[9px] text-[#F59E0B] border-[#F59E0B]/30">Medium</Badge>
                                <Badge variant="outline" className="text-[9px] text-[#00A758] border-[#00A758]/30">Low</Badge>
                            </div>
                        </div>

                        {agendaItems.map((item, idx) => (
                            <Card key={item.id} className={`transition-colors ${item.checked ? "opacity-50" : ""}`}>
                                <CardContent className="p-3 flex items-start gap-3">
                                    <Checkbox
                                        checked={item.checked}
                                        onCheckedChange={(checked) => {
                                            setAgendaItems((prev) =>
                                                prev.map((a, i) => (i === idx ? { ...a, checked: !!checked } : a))
                                            );
                                        }}
                                        className="mt-0.5"
                                        data-testid={`agenda-check-${idx}`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className={`text-xs font-semibold ${item.checked ? "line-through" : ""}`}>
                                                {item.title}
                                            </p>
                                            <Badge variant="outline" className={`text-[9px] shrink-0 ${priorityColor(item.priority)}`}>
                                                {item.duration}m
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ---- FACT SHEET TAB ---- */}
                {activeTab === "factsheet" && (
                    <div className="space-y-4 mt-3 print-section">
                        {/* Key Metrics */}
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-[#F59E0B]" />
                                Key Metrics
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded-lg bg-muted/30 text-center">
                                    <p className="text-[10px] text-muted-foreground">Risk Profile</p>
                                    <p className="text-xs font-semibold" style={{ color: riskColors[client.riskProfile] }}>{client.riskProfile}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 text-center">
                                    <p className="text-[10px] text-muted-foreground">Sharpe Ratio</p>
                                    <p className="text-xs font-semibold">{riskMetrics.sharpeRatio.toFixed(2)}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 text-center">
                                    <p className="text-[10px] text-muted-foreground">Expense Ratio</p>
                                    <p className="text-xs font-semibold">{feeAnalysis.weightedExpenseRatio}%</p>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 text-center">
                                    <p className="text-[10px] text-muted-foreground">Cash %</p>
                                    <p className={`text-xs font-semibold ${cashPct > 20 ? "text-[#D9534F]" : ""}`}>{cashPct.toFixed(1)}%</p>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 text-center">
                                    <p className="text-[10px] text-muted-foreground">Drift</p>
                                    <p className={`text-xs font-semibold ${driftData.status !== "aligned" ? "text-[#F59E0B]" : "text-[#00A758]"}`}>{driftData.overallDrift}%</p>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 text-center">
                                    <p className="text-[10px] text-muted-foreground">Annual Fees</p>
                                    <p className="text-xs font-semibold">{formatPHP(feeAnalysis.annualFeeCost)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Goal Summary */}
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-[#00A758]" />
                                Goal Summary
                            </h3>
                            <div className="space-y-2">
                                {client.goals.map((goal) => (
                                    <div key={goal.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30" data-testid={`meeting-goal-${goal.id}`}>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold">{goal.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 rounded-full bg-muted/50 max-w-[120px]">
                                                    <div
                                                        className={`h-full rounded-full ${goal.status === "off-track" ? "bg-[#D9534F]" : goal.status === "ahead" ? "bg-[#00A758]" : "bg-[#0C7143]"}`}
                                                        style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatPHP(goal.currentAmount)} / {formatPHP(goal.targetAmount)} · {goal.targetDate}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={goal.status === "off-track" ? "destructive" : "default"}
                                            className={`text-[10px] shrink-0 ${goal.status === "ahead" ? "bg-[#00A758] border-[#00A758]" : goal.status === "on-track" ? "bg-[#0C7143] border-[#0C7143]" : ""}`}
                                        >
                                            {goal.probability}%
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Talking Points */}
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                <Layers className="w-4 h-4 text-[#2E86AB]" />
                                Talking Points
                            </h3>
                            <div className="space-y-2">
                                {talkingPoints.map((tp, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-2 p-2.5 rounded-lg text-[11px] leading-relaxed ${tp.type === "warning" ? "bg-[#D9534F]/5" :
                                            tp.type === "success" ? "bg-[#00A758]/5" :
                                                "bg-[#2E86AB]/5"
                                            }`}
                                        data-testid={`meeting-point-${idx}`}
                                    >
                                        {tp.type === "warning" ? (
                                            <AlertTriangle className="w-3.5 h-3.5 text-[#D9534F] shrink-0 mt-0.5" />
                                        ) : tp.type === "success" ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A758] shrink-0 mt-0.5" />
                                        ) : (
                                            <Zap className="w-3.5 h-3.5 text-[#2E86AB] shrink-0 mt-0.5" />
                                        )}
                                        <span>{tp.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---- NOTES & FOLLOW-UPS TAB ---- */}
                {activeTab === "notes" && (
                    <div className="space-y-4 mt-3">
                        {/* Meeting Notes */}
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-[#0C7143]" />
                                Meeting Notes
                            </h3>
                            <Textarea
                                value={meetingNotes}
                                onChange={(e) => setMeetingNotes(e.target.value)}
                                placeholder="Capture key discussion points, client feedback, and decisions made..."
                                className="min-h-[120px] text-xs"
                                data-testid="meeting-notes-textarea"
                            />
                        </div>

                        {/* Follow-up Tasks */}
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                <ListChecks className="w-4 h-4 text-[#F59E0B]" />
                                Follow-up Tasks
                            </h3>

                            {/* Existing follow-ups */}
                            <div className="space-y-1.5 mb-3">
                                {followUps.map((fu, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                        <Checkbox
                                            checked={fu.done}
                                            onCheckedChange={() => toggleFollowUp(idx)}
                                            data-testid={`followup-check-${idx}`}
                                        />
                                        <span className={`text-xs flex-1 ${fu.done ? "line-through text-muted-foreground" : ""}`}>
                                            {fu.task}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Add new follow-up */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newFollowUp}
                                    onChange={(e) => setNewFollowUp(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addFollowUp()}
                                    placeholder="Add a follow-up task..."
                                    className="flex-1 text-xs bg-muted/40 border border-border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#00A758]/50"
                                    data-testid="followup-input"
                                />
                                <Button size="sm" variant="outline" onClick={addFollowUp} disabled={!newFollowUp.trim()}>
                                    <Plus className="w-3.5 h-3.5" />
                                </Button>
                            </div>

                            {/* Suggested follow-ups */}
                            {suggestedFollowUps.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">AI-Suggested:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {suggestedFollowUps.map((s, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => addSuggestedFollowUp(s)}
                                                disabled={followUps.some((f) => f.task === s)}
                                                className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${followUps.some((f) => f.task === s)
                                                    ? "border-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                                    : "border-[#00A758]/30 text-[#00A758] hover:bg-[#00A758]/10 cursor-pointer"
                                                    }`}
                                                data-testid={`suggestion-${idx}`}
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        <Button
                            onClick={saveNotes}
                            disabled={isSaving || (!meetingNotes.trim() && followUps.length === 0)}
                            className="w-full bg-[#00A758] hover:bg-[#0C7143] text-white"
                            data-testid="save-meeting-notes"
                        >
                            {isSaving ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="w-3.5 h-3.5" />
                                    Save Notes & Follow-ups
                                </span>
                            )}
                        </Button>

                        {/* Previous Notes */}
                        {client.meetingNotes && client.meetingNotes.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                    Previous Notes
                                </h3>
                                <div className="space-y-2">
                                    {[...client.meetingNotes].reverse().map((note, idx) => (
                                        <Card key={idx}>
                                            <CardContent className="p-3">
                                                <p className="text-[10px] text-muted-foreground mb-1">{note.date}</p>
                                                <p className="text-xs">{note.notes}</p>
                                                {note.followUps.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {note.followUps.map((fu, fIdx) => (
                                                            <div key={fIdx} className="flex items-center gap-1.5 text-[11px]">
                                                                {fu.done ? (
                                                                    <CheckCircle2 className="w-3 h-3 text-[#00A758]" />
                                                                ) : (
                                                                    <div className="w-3 h-3 rounded-full border border-muted-foreground/50" />
                                                                )}
                                                                <span className={fu.done ? "line-through text-muted-foreground" : ""}>{fu.task}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
