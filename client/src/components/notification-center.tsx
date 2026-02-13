import { useState } from "react";
import {
    Bell,
    Check,
    AlertTriangle,
    Info,
    X,
    TrendingUp,
    FileText
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

type Notification = {
    id: string;
    title: string;
    description: string;
    type: "info" | "warning" | "success" | "alert";
    timestamp: Date;
    read: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        title: "Portfolio Rebalancing Needed",
        description: "Maria Santos's portfolio has drifted >5% from target allocation.",
        type: "alert",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        read: false,
    },
    {
        id: "2",
        title: "Meeting Prep Ready",
        description: "AI summary and agenda for John Doe's review are ready.",
        type: "success",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
    },
    {
        id: "3",
        title: "Goal Off-Track",
        description: "Miguel's Education Fund is projected to miss target by 15%.",
        type: "warning",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
    },
    {
        id: "4",
        title: "New Market Insight",
        description: "Manulife PHP Equity Fund monthly report is available.",
        type: "info",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true,
    },
];

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [open, setOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const clearNotification = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "alert":
                return <AlertTriangle className="h-4 w-4 text-[#D9534F]" />;
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case "success":
                return <Check className="h-4 w-4 text-[#00A758]" />;
            case "info":
                return <Info className="h-4 w-4 text-[#2E86AB]" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group" data-testid="button-notifications">
                    <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#D9534F] ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 text-muted-foreground hover:text-foreground"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground space-y-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative p-4 hover:bg-muted/50 transition-colors cursor-pointer group ${!notification.read ? "bg-muted/20" : ""
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0">{getIcon(notification.type)}</div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.description}
                                            </p>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <span className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-[#00A758]" />
                                    )}
                                    <button
                                        onClick={(e) => clearNotification(notification.id, e)}
                                        className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-background transition-opacity"
                                        title="Dismiss"
                                    >
                                        <X className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t bg-muted/20">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-8">
                        View all notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
