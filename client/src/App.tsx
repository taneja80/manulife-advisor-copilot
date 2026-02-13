import { useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoalWizard } from "@/components/goal-wizard";
import { useClient } from "@/hooks/useClients";
import NotFound from "@/pages/not-found";
import { DoraChat } from "@/components/dora-chat";
import { CommandMenu } from "@/components/command-menu";
import { NotificationCenter } from "@/components/notification-center";
import { Sparkles, X } from "lucide-react";
import Dashboard from "@/pages/dashboard";
import AnalyticsPage from "@/pages/analytics";
import ClientsPage from "@/pages/clients";
import SettingsPage from "@/pages/settings";
import { MeetingDebrief } from "@/components/advisor/meeting-debrief";

const SimulatorPage = lazy(() => import("@/pages/simulator"));
const PortfolioPage = lazy(() => import("@/pages/portfolio"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const AdvisorHome = lazy(() => import("@/pages/advisor-home"));

function AppContent() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [doraOpen, setDoraOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);

  const [wizardMode, setWizardMode] = useState<{
    active: boolean;
    clientId?: string;
    isNewClient?: boolean;
  }>({ active: false });

  const handleCreateGoal = (clientId: string) => {
    setWizardMode({ active: true, clientId });
  };

  const handleAddNewClient = () => {
    setLocation("/onboarding");
  };

  const createGoalMutation = useMutation({
    mutationFn: async ({ clientId, goal }: { clientId: string; goal: any }) => {
      const res = await apiRequest("POST", `/api/clients/${clientId}/goals`, goal);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Goal Created",
        description: "The new financial goal has been added to the client's profile.",
      });
      setWizardMode({ active: false });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Goal",
        description: "There was an error saving the goal.",
        variant: "destructive",
      });
      console.error("Create goal error:", error);
    }
  });

  const handleWizardComplete = (data: any) => {
    if (wizardMode.clientId) {
      createGoalMutation.mutate({ clientId: wizardMode.clientId, goal: data });
    } else {
      setLocation("/clients-list");
      setWizardMode({ active: false });
    }
  };

  const togglePresentationMode = () => {
    if (isPresentationMode) {
      // Exiting mode - show debrief
      setShowDebrief(true);
    }
    setIsPresentationMode(!isPresentationMode);
  };

  const { data: wizardClient } = useClient(wizardMode.clientId);

  if (wizardMode.active) {
    return (
      <div className="h-screen bg-background overflow-y-auto">
        <GoalWizard
          onComplete={handleWizardComplete}
          onCancel={() => setWizardMode({ active: false })}
          clientName={wizardClient?.name}
          isNewClient={wizardMode.isNewClient}
        />
      </div>
    );
  }

  const style = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full transition-all duration-300">
        {!isPresentationMode && <AppSidebar />}
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 p-2 border-b bg-background sticky top-0 z-40">
            <div className="flex items-center gap-2">
              {!isPresentationMode && <SidebarTrigger data-testid="button-sidebar-toggle" />}
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline mr-2">
                Advisor Co-Pilot
              </span>
              {!isPresentationMode && <CommandMenu />}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isPresentationMode ? "default" : "outline"}
                size="sm"
                onClick={togglePresentationMode}
                className={isPresentationMode ? "bg-[#00A758]" : ""}
              >
                {isPresentationMode ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Exit Client View
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Client View
                  </>
                )}
              </Button>
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            <Switch>
              <Route path="/">
                <Suspense fallback={<div className="p-6">Loading Dashboard...</div>}>
                  <AdvisorHome />
                </Suspense>
              </Route>
              <Route path="/clients-list">
                <ClientsPage onAddNewClient={handleAddNewClient} />
              </Route>
              <Route path="/clients/:id">
                <Dashboard onCreateGoal={handleCreateGoal} isPresentationMode={isPresentationMode} />
              </Route>
              <Route path="/insights" component={AnalyticsPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route path="/simulator">
                <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
                  <SimulatorPage />
                </Suspense>
              </Route>
              <Route path="/portfolios">
                <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
                  <PortfolioPage />
                </Suspense>
              </Route>
              <Route path="/onboarding">
                <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
                  <OnboardingPage />
                </Suspense>
              </Route>
              <Route path="/settings" component={SettingsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>

      <MeetingDebrief
        isOpen={showDebrief}
        onClose={() => setShowDebrief(false)}
        clientName="Client"
      />

      {/* Persistent Floating DORA Chatbox — available on ALL pages */}
      <>
        <button
          onClick={() => setDoraOpen(!doraOpen)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#00A758] to-[#0C7143] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center ${!doraOpen ? "animate-pulse" : ""
            }`}
          data-testid="dora-fab"
          title="Ask DORA"
        >
          {doraOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {doraOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-[380px] h-[560px] rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden flex flex-col"
              style={{ backdropFilter: "blur(12px)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#00A758] to-[#0C7143] text-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">DORA</h3>
                    <p className="text-[9px] opacity-80">AI Research & Advisory Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setDoraOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Chat Body */}
              <div className="flex-1 overflow-hidden flex flex-col p-3">
                <DoraChat />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </SidebarProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
