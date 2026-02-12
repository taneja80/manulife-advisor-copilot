import { useState, useCallback } from "react";
import { GoalSimulator } from "@/components/goal-simulator";
import { AICopilot } from "@/components/ai-copilot";
import { clients } from "@/lib/mockData";

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

  const defaultClient = clients[0];

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <GoalSimulator onSettingsChange={handleSettingsChange} />
      </div>
      <div className="hidden xl:block w-[300px] border-l p-4 overflow-y-auto bg-card/50">
        <AICopilot
          client={defaultClient}
          probability={simulatorSettings.probability}
          monthlySavings={simulatorSettings.monthlySavings}
          riskProfile={simulatorSettings.riskProfile}
        />
      </div>
    </div>
  );
}
