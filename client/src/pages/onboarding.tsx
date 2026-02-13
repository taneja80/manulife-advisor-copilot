import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GoalWizard } from "@/components/goal-wizard";

export default function OnboardingPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const createClientMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/clients", data);
            return res.json();
        },
        onSuccess: (newClient) => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            toast({
                title: "Client Onboarded",
                description: `${newClient.name} has been successfully added with their initial goal.`,
            });
            // Redirect to the new client's dashboard (assuming route exists)
            // Or back to clients list
            setLocation("/");
        },
        onError: (error) => {
            toast({
                title: "Onboarding Failed",
                description: "There was an error creating the client profile.",
                variant: "destructive",
            });
            console.error("Onboarding error:", error);
        }
    });

    const handleComplete = (data: any) => {
        createClientMutation.mutate(data);
    };

    const handleCancel = () => {
        setLocation("/");
    };

    return (
        <div className="h-screen bg-background overflow-y-auto">
            <GoalWizard
                onComplete={handleComplete}
                onCancel={handleCancel}
                isNewClient={true}
            />
        </div>
    );
}
