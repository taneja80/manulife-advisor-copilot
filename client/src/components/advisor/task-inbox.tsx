import { useMemo } from "react";
import { useClients } from "@/hooks/useClients";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Clock, Calendar, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export interface TaskItem {
    id: string;
    type: "compliance" | "client_action" | "meeting" | "admin";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    due: string; // ISO date or "Today"
    relatedClientId?: string;
}

export function TaskInbox() {
    const { data: clients = [] } = useClients();
    const [, setLocation] = useLocation();

    const tasks = useMemo(() => {
        const items: TaskItem[] = [];

        // 1. Generate tasks from "Needs Action" clients
        clients.forEach(c => {
            if (c.needsAction) {
                items.push({
                    id: `action-${c.id}`,
                    type: "client_action",
                    title: `Portfolio Action Required: ${c.name}`,
                    description: c.actionReason || "Review portfolio performance",
                    priority: "high",
                    due: "Today",
                    relatedClientId: c.id
                });
            }
        });

        // 2. Mock Compliance Tasks
        items.push({
            id: "comp-1",
            type: "compliance",
            title: "KYC Refresh: Ricardo Garcia",
            description: "Update identification documents (expired)",
            priority: "medium",
            due: "Tomorrow"
        });

        // 3. Mock Upcoming Meetings (that need prep)
        items.push({
            id: "meet-1",
            type: "meeting",
            title: "Prep for: Ana Dela Cruz",
            description: "Review quarterly performance before 2pm call",
            priority: "high",
            due: "2:00 PM",
            relatedClientId: "c3" // Assuming Ana is c3
        });

        return items.sort((a, b) => (a.priority === "high" ? -1 : 1));
    }, [clients]);

    const getIcon = (type: TaskItem["type"]) => {
        switch (type) {
            case "compliance": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case "client_action": return <Clock className="w-4 h-4 text-blue-500" />;
            case "meeting": return <Calendar className="w-4 h-4 text-purple-500" />;
            default: return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold">Action Inbox</CardTitle>
                        <CardDescription>{tasks.length} tasks require attention</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {tasks.filter(t => t.priority === "high").length} High Priority
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-2">
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer"
                            onClick={() => task.relatedClientId && setLocation(`/clients/${task.relatedClientId}`)}
                        >
                            <div className="mt-1 shrink-0">{getIcon(task.type)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-medium truncate leading-none">{task.title}</h4>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${task.priority === 'high' ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {task.due}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                    {task.description}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 self-center" />
                        </div>
                    ))}

                    {tasks.length === 0 && (
                        <div className="pt-8 text-center text-muted-foreground text-sm">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>All caught up! Great job.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
