import { ArrowLeft, Shield, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { type Client, riskColors } from "@/lib/mockData";
import { MeetingPrepDialog } from "./meeting-prep-dialog";

interface ClientHeaderProps {
    client: Client;
    onCreateGoal?: (clientId: string) => void;
}

export function ClientHeader({ client, onCreateGoal }: ClientHeaderProps) {
    const [, setLocation] = useLocation();

    return (
        <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
                <button
                    onClick={() => setLocation("/")}
                    className="flex items-center gap-1 text-xs text-muted-foreground mb-2"
                    data-testid="button-back-clients"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    All Clients
                </button>
                <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
                    {client.name}'s Portfolio Health Check
                </h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-sm text-muted-foreground">Age {client.age}</span>
                    <Badge
                        variant="outline"
                        className="border-current"
                        style={{ color: riskColors[client.riskProfile] }}
                        data-testid="badge-client-risk"
                    >
                        <Shield className="w-3.5 h-3.5 mr-1" />
                        {client.riskProfile}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        Client since {new Date(client.joinedDate).getFullYear()}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <MeetingPrepDialog client={client} />
                <Button
                    className="bg-[#00A758] border-[#00A758]"
                    onClick={() => onCreateGoal?.(client.id)}
                    data-testid="button-create-goal"
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create Goal
                </Button>
            </div>
        </div>
    );
}
