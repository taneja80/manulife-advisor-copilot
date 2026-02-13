import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    MessageSquare,
    Sparkles,
    Zap,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CalendarCheck,
    Target,
    RotateCcw,
    PiggyBank,
    ShieldCheck,
    ChevronRight,
    FileText,
    ArrowRight,
} from "lucide-react";
import { DoraChat } from "@/components/dora-chat";
import type { Client } from "@shared/schema"; // We'll use the Client type
import { useClients } from "@/hooks/useClients";

// ─── Types ───
interface TalkingPoint {
    id: string;
    icon: React.ReactNode;
    title: string;
    detail: string;
    type: "opportunity" | "concern" | "info" | "compliance";
    badge?: string;
}

interface NextAction {
    id: string;
    icon: React.ReactNode;
    title: string;
    detail: string;
    priority: "high" | "medium" | "low";
    actionLabel: string;
}

// ─── Talking Points Generator ───
function generateTalkingPoints(client: Client): TalkingPoint[] {
    const points: TalkingPoint[] = [];

    // 1. Off-track goals
    const offTrack = client.goals.filter(g => g.status === "off-track");
    offTrack.forEach(g => {
        points.push({
            id: `tp-goal-${g.id}`,
            icon: <Target className="w-4 h-4 text-red-500" />,
            title: `${g.name} is behind schedule`,
            detail: `Goal is off-track. Current: ₱${(g.currentAmount / 1000).toFixed(0)}K / Target: ₱${(g.targetAmount / 1000).toFixed(0)}K. Consider discussing a contribution increase or timeline adjustment.`,
            type: "concern",
            badge: "Action Needed",
        });
    });

    // 2. Strong performing goals
    const onTrack = client.goals.filter(g => g.status === "on-track");
    if (onTrack.length > 0) {
        points.push({
            id: "tp-ontracksummary",
            icon: <TrendingUp className="w-4 h-4 text-green-500" />,
            title: `${onTrack.length} goal${onTrack.length > 1 ? "s" : ""} performing well`,
            detail: `Reassure the client that their ${onTrack.map(g => g.name).join(", ")} ${onTrack.length > 1 ? "goals are" : "goal is"} on track. Positive reinforcement builds trust.`,
            type: "opportunity",
        });
    }

    // 3. Portfolio performance
    if (client.returns.ytd > 5) {
        points.push({
            id: "tp-perf-good",
            icon: <TrendingUp className="w-4 h-4 text-green-500" />,
            title: `Strong YTD: +${client.returns.ytd}%`,
            detail: "Portfolio is outperforming. This is a good opportunity to discuss staying invested and potentially increasing allocation to growth assets.",
            type: "opportunity",
        });
    } else if (client.returns.ytd < 0) {
        points.push({
            id: "tp-perf-weak",
            icon: <TrendingDown className="w-4 h-4 text-red-500" />,
            title: `YTD Return: ${client.returns.ytd}%`,
            detail: "The client may be concerned. Focus on long-term perspective, remind them about dollar-cost averaging benefits, and review if the allocation still matches their risk profile.",
            type: "concern",
        });
    }

    // 4. Needs action flag
    if (client.needsAction) {
        points.push({
            id: "tp-needsaction",
            icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
            title: client.actionReason || "Review Required",
            detail: "This client has been flagged for action. Address this item early in the meeting.",
            type: "compliance",
            badge: "Priority",
        });
    }

    // 5. Market context (always include)
    points.push({
        id: "tp-market",
        icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
        title: "Market Context: PSEi +1.2% this week",
        detail: "Markets are trending positively. The Philippine economy shows resilience with BSP maintaining supportive policy. A good time to discuss staying invested.",
        type: "info",
    });

    // 6. Meeting reminder
    if (client.meetingNotes && client.meetingNotes.length > 0) {
        const lastMeeting = client.meetingNotes[client.meetingNotes.length - 1];
        const openTasks = lastMeeting.followUps.filter(t => !t.done);
        if (openTasks.length > 0) {
            points.push({
                id: "tp-followup",
                icon: <CalendarCheck className="w-4 h-4 text-violet-500" />,
                title: `${openTasks.length} open items from last meeting`,
                detail: `Follow up on: ${openTasks.map(t => t.task).join("; ")}`,
                type: "info",
            });
        }
    }

    return points;
}

// ─── Next Best Actions Generator ───
function generateNextActions(client: Client): NextAction[] {
    const actions: NextAction[] = [];

    // 1. Rebalancing
    const riskLevel = client.riskProfile;
    actions.push({
        id: "nba-rebalance",
        icon: <RotateCcw className="w-4 h-4" />,
        title: "Review Portfolio Allocation",
        detail: `${client.name}'s risk profile is "${riskLevel}". Ensure current allocation aligns with target weights. Check for drift in equity/bond split.`,
        priority: "medium",
        actionLabel: "View Drift Analysis",
    });

    // 2. Off-track goal contributions
    const offTrack = client.goals.filter(g => g.status === "off-track");
    offTrack.forEach(g => {
        const gap = g.targetAmount - g.currentAmount;
        actions.push({
            id: `nba-contrib-${g.id}`,
            icon: <PiggyBank className="w-4 h-4" />,
            title: `Increase contributions for ${g.name}`,
            detail: `Gap of ₱${(gap / 1000).toFixed(0)}K. Suggest increasing monthly contribution or extending timeline.`,
            priority: "high",
            actionLabel: "Calculate Options",
        });
    });

    // 3. Compliance
    actions.push({
        id: "nba-kyc",
        icon: <ShieldCheck className="w-4 h-4" />,
        title: "KYC Document Review",
        detail: "Verify that identification documents are current and risk questionnaire is up to date (annual review).",
        priority: "low",
        actionLabel: "Check Documents",
    });

    // 4. Meeting follow-ups
    if (client.meetingNotes && client.meetingNotes.length > 0) {
        const lastMeeting = client.meetingNotes[client.meetingNotes.length - 1];
        const openTasks = lastMeeting.followUps.filter(t => !t.done);
        openTasks.forEach((task, i) => {
            actions.push({
                id: `nba-task-${i}`,
                icon: <FileText className="w-4 h-4" />,
                title: task.task,
                detail: `From meeting on ${new Date(lastMeeting.date).toLocaleDateString()}`,
                priority: "medium",
                actionLabel: "Mark Done",
            });
        });
    }

    return actions.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
    });
}

// ─── Badge Colors ───
const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const typeColors: Record<string, string> = {
    opportunity: "border-l-green-500",
    concern: "border-l-red-500",
    info: "border-l-blue-500",
    compliance: "border-l-amber-500",
};

// ─── Main Component ───
interface ClientIntelligencePanelProps {
    clientId: string;
    clientName: string;
    client: Client;
}

export function ClientIntelligencePanel({ clientId, clientName, client }: ClientIntelligencePanelProps) {
    const [activeTab, setActiveTab] = useState("talking-points");

    const talkingPoints = useMemo(() => generateTalkingPoints(client), [client]);
    const nextActions = useMemo(() => generateNextActions(client), [client]);

    return (
        <div className="flex flex-col h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <TabsList className="grid grid-cols-3 mx-1 mt-1 mb-2 shrink-0">
                    <TabsTrigger value="talking-points" className="text-xs gap-1 data-[state=active]:bg-[#00A758]/10 data-[state=active]:text-[#00A758]">
                        <MessageSquare className="w-3 h-3" />
                        <span className="hidden sm:inline">Talk</span> Points
                    </TabsTrigger>
                    <TabsTrigger value="dora" className="text-xs gap-1 data-[state=active]:bg-[#00A758]/10 data-[state=active]:text-[#00A758]">
                        <Sparkles className="w-3 h-3" />
                        DORA
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="text-xs gap-1 data-[state=active]:bg-[#00A758]/10 data-[state=active]:text-[#00A758]">
                        <Zap className="w-3 h-3" />
                        Actions
                        {nextActions.filter(a => a.priority === "high").length > 0 && (
                            <span className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
                                {nextActions.filter(a => a.priority === "high").length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ─── Talking Points Tab ─── */}
                <TabsContent value="talking-points" className="flex-1 overflow-y-auto px-1 space-y-2 mt-0">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider px-1 mb-2">
                        Prepared for {clientName}
                    </p>
                    {talkingPoints.map((tp) => (
                        <div
                            key={tp.id}
                            className={`p-3 rounded-lg border-l-[3px] bg-card/80 hover:bg-card transition-colors shadow-sm ${typeColors[tp.type]}`}
                        >
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 shrink-0">{tp.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-semibold">{tp.title}</span>
                                        {tp.badge && (
                                            <Badge variant="outline" className="text-[8px] px-1 py-0 shrink-0">
                                                {tp.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{tp.detail}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <Separator className="my-3" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground hover:text-primary"
                        onClick={() => setActiveTab("dora")}
                    >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Ask DORA for more insights
                        <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </TabsContent>

                {/* ─── DORA Chat Tab ─── */}
                <TabsContent value="dora" className="flex-1 overflow-hidden mt-0">
                    <DoraChat clientId={clientId} clientName={clientName} />
                </TabsContent>

                {/* ─── Next Best Actions Tab ─── */}
                <TabsContent value="actions" className="flex-1 overflow-y-auto px-1 space-y-2 mt-0">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider px-1 mb-2">
                        Recommended Actions
                    </p>
                    {nextActions.map((action) => (
                        <Card key={action.id} className="shadow-sm bg-card/80 hover:bg-card transition-colors">
                            <CardContent className="p-3">
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 shrink-0 w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                                        {action.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-semibold">{action.title}</span>
                                            <span className={`text-[8px] px-1.5 py-0 rounded-full font-medium ${priorityColors[action.priority]}`}>
                                                {action.priority}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{action.detail}</p>
                                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                                            {action.actionLabel}
                                            <ChevronRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
