import { PortfolioBuilder } from "@/components/portfolio-builder";
import { DoraChat } from "@/components/dora-chat";
import { useClients } from "@/hooks/useClients";

export default function PortfolioPage() {
  const { data: clients = [] } = useClients();
  const defaultClient = clients[0];

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <PortfolioBuilder />
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
