import { useState, useCallback } from "react";
import { GoalSimulator } from "@/components/goal-simulator";
import { DoraChat } from "@/components/dora-chat";
import { useClients } from "@/hooks/useClients";

export default function SimulatorPage() {
  const [simulatorSettings, setSimulatorSettings] = useState({
    monthlySavings: 25000,
    timeHorizon: 2040,
    riskProfile: "Balanced",
    probability: 72,
  });

  const handleSettingsChange = useCallback(
    (settings: typeof simulatorSettings) => {
      setSimulatorSettings(settings);
    },
    []
  );

  const { data: clients = [] } = useClients();
  const defaultClient = clients[0];

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <GoalSimulator onSettingsChange={handleSettingsChange} />
      </div>
      {defaultClient && (
        <div className="hidden xl:block w-[320px] border-l p-4 overflow-y-auto bg-card/50 shrink-0">
          <DoraChat
            clientId={defaultClient.id}
            clientName={defaultClient.name}
          />
        </div>
      )}
    </div>
  );
}
