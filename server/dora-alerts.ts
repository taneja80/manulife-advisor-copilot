import { storage } from "./storage";
import type { Client, Goal } from "@shared/schema";

export interface DoraAlert {
    id: string;
    title: string;
    description: string;
    type: "info" | "warning" | "success" | "alert";
    timestamp: Date;
    read: boolean;
    clientId?: string;
    actionUrl?: string;
}

export async function generateDoraAlerts(): Promise<DoraAlert[]> {
    const clients = await storage.getClients();
    const alerts: DoraAlert[] = [];

    clients.forEach((client) => {
        // 1. Check for Needs Action flag
        if (client.needsAction) {
            alerts.push({
                id: `action-${client.id}`,
                title: "Action Required",
                description: `${client.name}: ${client.actionReason || "Review required"}`,
                type: "alert",
                timestamp: new Date(), // Real-time
                read: false,
                clientId: client.id,
                actionUrl: `/clients/${client.id}`,
            });
        }

        // 2. Check for Off-Track Goals
        const offTrackGoals = client.goals.filter((g) => g.status === "off-track");
        if (offTrackGoals.length > 0) {
            alerts.push({
                id: `goals-${client.id}`,
                title: "Goals Off-Track",
                description: `${client.name} has ${offTrackGoals.length} goal(s) requiring attention: ${offTrackGoals.map(g => g.name).join(", ")}.`,
                type: "warning",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                read: false,
                clientId: client.id,
                actionUrl: `/clients/${client.id}`,
            });
        }

        // 3. Portfolio Drift (Mock logic based on risk vs returns)
        // In a real app, this would compare target weights vs actual weights
        if (client.riskProfile === "Conservative" && client.returns.ytd < 0) {
            alerts.push({
                id: `drift-${client.id}`,
                title: "Portfolio Review Suggestion",
                description: `${client.name} (Conservative) has negative YTD returns. Consider reviewing fixed income allocation.`,
                type: "info",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                read: true,
                clientId: client.id,
                actionUrl: `/clients/${client.id}`,
            });
        }

        // 4. Meeting Follow-ups
        if (client.meetingNotes && client.meetingNotes.length > 0) {
            const lastMeeting = client.meetingNotes[client.meetingNotes.length - 1];
            const openTasks = lastMeeting.followUps.filter(t => !t.done);
            if (openTasks.length > 0) {
                alerts.push({
                    id: `tasks-${client.id}`,
                    title: "Open Follow-up Tasks",
                    description: `${client.name}: ${openTasks.length} pending tasks from last meeting.`,
                    type: "info",
                    timestamp: new Date(lastMeeting.date),
                    read: false,
                    clientId: client.id,
                    actionUrl: `/clients/${client.id}`,
                });
            }
        }
    });

    // 5. System wide alerts (Mock)
    alerts.push({
        id: "system-1",
        title: "Market Update",
        description: "PSEi closed up 1.2% today. Tech sector leading gains.",
        type: "success",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: true,
    });

    // Sort by timestamp desc
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
