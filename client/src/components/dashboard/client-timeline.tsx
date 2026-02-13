import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Phone,
    Mail,
    FileText,
    TrendingUp,
    CheckCircle,
    Clock,
    Users,
    ChevronRight,
    Plus
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { MeetingNote } from "@shared/schema";

interface ClientTimelineProps {
    notes?: MeetingNote[];
    compact?: boolean;
    onAddEvent?: () => void;
}

const eventTypeConfig: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
    meeting: { icon: Users, color: "bg-blue-500", label: "Meeting" },
    call: { icon: Phone, color: "bg-green-500", label: "Call" },
    email: { icon: Mail, color: "bg-purple-500", label: "Email" },
    portfolio_change: { icon: TrendingUp, color: "bg-orange-500", label: "Portfolio" },
    document: { icon: FileText, color: "bg-gray-500", label: "Document" },
    action_taken: { icon: CheckCircle, color: "bg-emerald-500", label: "Action" },
};

export function ClientTimeline({ notes = [], compact = false, onAddEvent }: ClientTimelineProps) {
    // Sort notes by date desc
    const sortedNotes = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedNotes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Client Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No interactions recorded yet</p>
                        {onAddEvent && (
                            <Button variant="outline" className="mt-4" onClick={onAddEvent}>
                                <Plus className="h-4 w-4 mr-2" />
                                Log First Interaction
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Client Timeline
                    </CardTitle>
                    {onAddEvent && (
                        <Button variant="outline" size="sm" onClick={onAddEvent}>
                            <Plus className="h-4 w-4 mr-2" />
                            Log Event
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className={compact ? "h-[300px]" : "h-[500px]"}>
                    <div className="relative pr-4">
                        <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-border" />

                        <div className="space-y-6">
                            {sortedNotes.map((note, index) => (
                                <TimelineItem
                                    key={index}
                                    note={note}
                                    isFirst={index === 0}
                                    compact={compact}
                                />
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function TimelineItem({ note, isFirst, compact }: { note: MeetingNote; isFirst: boolean; compact: boolean }) {
    const config = eventTypeConfig["meeting"]; // Default to meeting for now as notes are usually meetings
    const Icon = config.icon;

    const formattedDate = format(new Date(note.date), "MMM d, yyyy");
    const relativeTime = formatDistanceToNow(new Date(note.date), { addSuffix: true });

    const completedTasks = note.followUps.filter(t => t.done).length;
    const totalTasks = note.followUps.length;

    return (
        <div className="relative pl-10">
            <div className={`absolute left-0 w-9 h-9 rounded-full flex items-center justify-center ${config.color} text-white shadow-sm ring-4 ring-background z-10`}>
                <Icon className="h-4 w-4" />
            </div>

            <div className={`bg-muted/30 border rounded-lg p-4 hover:bg-muted/50 transition-colors ${isFirst ? 'border-primary/30 shadow-sm bg-card' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm truncate">Client Meeting</h4>
                            <Badge variant="outline" className="text-xs font-normal">
                                {formattedDate}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{relativeTime}</span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {note.notes}
                </p>

                {note.followUps.length > 0 && (
                    <div className="bg-background rounded p-2 border">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground">Follow-ups</p>
                            <span className="text-[10px] text-muted-foreground">{completedTasks}/{totalTasks} done</span>
                        </div>
                        <div className="space-y-1">
                            {note.followUps.slice(0, 3).map((task, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${task.done ? "bg-green-500 border-green-500" : "border-muted-foreground"}`}>
                                        {task.done && <CheckCircle className="w-2 h-2 text-white" />}
                                    </div>
                                    <span className={task.done ? "line-through text-muted-foreground" : ""}>{task.task}</span>
                                </div>
                            ))}
                            {note.followUps.length > 3 && (
                                <p className="text-[10px] text-muted-foreground italic">+ {note.followUps.length - 3} more...</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
