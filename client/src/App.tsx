import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoalWizard } from "@/components/goal-wizard";
import { getClientById } from "@/lib/mockData";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AnalyticsPage from "@/pages/analytics";
import ClientsPage from "@/pages/clients";

function AppContent() {
  const [, setLocation] = useLocation();
  const [wizardMode, setWizardMode] = useState<{
    active: boolean;
    clientId?: string;
    isNewClient?: boolean;
  }>({ active: false });

  const handleCreateGoal = (clientId: string) => {
    setWizardMode({ active: true, clientId });
  };

  const handleAddNewClient = () => {
    setWizardMode({ active: true, isNewClient: true });
  };

  const handleWizardComplete = () => {
    if (wizardMode.clientId) {
      setLocation(`/clients/${wizardMode.clientId}`);
    } else {
      setLocation("/");
    }
    setWizardMode({ active: false });
  };

  if (wizardMode.active) {
    return (
      <div className="h-screen bg-background overflow-y-auto">
        <GoalWizard
          onComplete={handleWizardComplete}
          onCancel={() => setWizardMode({ active: false })}
          clientName={wizardMode.clientId ? getClientById(wizardMode.clientId)?.name : undefined}
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
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 p-2 border-b bg-background sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                Advisor Co-Pilot
              </span>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden">
            <Switch>
              <Route path="/">
                <ClientsPage onAddNewClient={handleAddNewClient} />
              </Route>
              <Route path="/clients/:id">
                <Dashboard onCreateGoal={handleCreateGoal} />
              </Route>
              <Route path="/insights" component={AnalyticsPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
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
