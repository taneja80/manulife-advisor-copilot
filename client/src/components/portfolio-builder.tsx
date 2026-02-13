import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Info,
  ChevronDown,
  Layers,
  Plus,
  Trash2,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  productBaskets,
  manulifeFunds,
  formatPHP,
  getFundById,
  type ProductBasket,
  type Fund,
  type Goal,
  type GoalFundAllocation,
} from "@/lib/mockData";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface GoalPortfolioEditorProps {
  goal: Goal;
  clientName: string;
  onUpdate?: (goalId: string, funds: GoalFundAllocation[]) => void;
}

export function GoalPortfolioEditor({ goal, clientName, onUpdate }: GoalPortfolioEditorProps) {
  const { toast } = useToast();
  const [funds, setFunds] = useState<GoalFundAllocation[]>(
    goal.portfolio.funds.map((f) => ({ ...f }))
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const totalWeight = funds.reduce((sum, f) => sum + f.weight, 0);
  const isValid = totalWeight === 100;

  const availableFunds = manulifeFunds.filter(
    (mf) => !funds.some((f) => f.fundId === mf.id)
  );

  const handleWeightChange = (fundId: string, newWeight: number) => {
    setFunds((prev) =>
      prev.map((f) =>
        f.fundId === fundId
          ? { ...f, weight: newWeight, amount: Math.round((newWeight / 100) * goal.portfolio.totalInvested) }
          : f
      )
    );
    setHasChanges(true);
    setConsentGiven(false); // Reset consent on change
  };

  const handleAddFund = (fundId: string) => {
    setFunds((prev) => [
      ...prev,
      { fundId, weight: 0, amount: 0 },
    ]);
    setHasChanges(true);
    setConsentGiven(false);
  };

  const handleRemoveFund = (fundId: string) => {
    setFunds((prev) => prev.filter((f) => f.fundId !== fundId));
    setHasChanges(true);
    setConsentGiven(false);
  };

  const handleReset = () => {
    setFunds(goal.portfolio.funds.map((f) => ({ ...f })));
    setHasChanges(false);
    setConsentGiven(false);
  };

  const handleSave = () => {
    onUpdate?.(goal.id, funds);
    setHasChanges(false);
  };

  const handleGetConsent = () => {
    if (hasChanges) {
      toast({
        title: "Save Changes First",
        description: "Please save your portfolio changes before getting consent.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this might trigger a digital signature flow
    if (window.confirm(`Confirm that you have discussed the "${goal.name}" portfolio with ${clientName} and received their verbal/written consent?`)) {
      setConsentGiven(true);
      toast({
        title: "Consent Recorded",
        description: `Consent recorded for ${clientName}. You may now execute the trade.`,
      });
    }
  };

  const handleExecuteTrade = async () => {
    setIsExecuting(true);
    try {
      await apiRequest("POST", "/api/trade/execute", {
        goalId: goal.id,
        clientName,
        portfolio: {
          name: goal.name,
          funds,
          totalInvested: goal.portfolio.totalInvested
        }
      });

      toast({
        title: "Trade Instructions Sent",
        description: `Email sent to ${clientName} with trade details for execution.`,
        variant: "default", // Using default variant with a success icon styling if needed, or check if 'success' variant exists in toast
      });
      setConsentGiven(false); // Reset
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "Failed to send trade instructions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card data-testid={`card-portfolio-editor-${goal.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant={goal.status === "off-track" ? "destructive" : "default"}
                className={`text-[10px] ${goal.status === "ahead" ? "bg-[#00A758] border-[#00A758]" : goal.status === "on-track" ? "bg-[#0C7143] border-[#0C7143]" : ""}`}
              >
                {goal.status === "off-track" ? "Off Track" : goal.status === "ahead" ? "Ahead" : "On Track"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatPHP(goal.portfolio.totalInvested)} invested · Target: {goal.targetDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!consentGiven ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGetConsent}
                className="gap-1.5"
                disabled={hasChanges} // Force save first
              >
                <Check className="w-3.5 h-3.5" />
                Get Consent
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-[#00A758] hover:bg-[#008a47] gap-1.5"
                onClick={handleExecuteTrade}
                disabled={isExecuting || hasChanges}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {isExecuting ? "Sending..." : "Execute Trade"}
              </Button>
            )}
            <div className="text-right ml-2 border-l pl-2">
              <p className="text-lg font-bold">{goal.probability}%</p>
              <p className="text-[11px] text-muted-foreground">Probability</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Fund Allocation</span>
            <Badge
              variant={isValid ? "outline" : "destructive"}
              className="text-[10px]"
            >
              {totalWeight}% / 100%
            </Badge>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                data-testid={`button-reset-portfolio-${goal.id}`}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                className="bg-[#00A758] border-[#00A758]"
                disabled={!isValid}
                onClick={handleSave}
                data-testid={`button-save-portfolio-${goal.id}`}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {funds.map((fa) => {
            const fund = getFundById(fa.fundId);
            if (!fund) return null;
            return (
              <div
                key={fa.fundId}
                className="p-3 rounded-lg bg-muted/30 space-y-2"
                data-testid={`row-portfolio-fund-${goal.id}-${fa.fundId}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{fund.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {fund.category} · YTD: {fund.returnRate} · ER: {fund.expenseRatio}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold w-12 text-right">{fa.weight}%</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFund(fa.fundId)}
                      className="text-muted-foreground"
                      data-testid={`button-remove-fund-${goal.id}-${fa.fundId}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[fa.weight]}
                    onValueChange={(v) => handleWeightChange(fa.fundId, v[0])}
                    min={0}
                    max={100}
                    step={5}
                    data-testid={`slider-fund-weight-${goal.id}-${fa.fundId}`}
                  />
                  <span className="text-xs text-muted-foreground w-20 text-right shrink-0">
                    {formatPHP(Math.round((fa.weight / 100) * goal.portfolio.totalInvested))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {availableFunds.length > 0 && (
          <div className="flex items-center gap-2">
            <Select onValueChange={handleAddFund}>
              <SelectTrigger className="flex-1" data-testid={`select-add-fund-${goal.id}`}>
                <SelectValue placeholder="Add a fund..." />
              </SelectTrigger>
              <SelectContent>
                {availableFunds.map((fund) => (
                  <SelectItem key={fund.id} value={fund.id} data-testid={`option-add-fund-${fund.id}`}>
                    {fund.name} ({fund.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!isValid && hasChanges && (
          <p className="text-xs text-[#D9534F]">
            Total allocation must equal 100%. Currently at {totalWeight}%.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ProductCard({ basket }: { basket: ProductBasket }) {
  const [dcaEnabled, setDcaEnabled] = useState(false);

  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-[#00A758]/10">
              <Layers className="w-5 h-5 text-[#00A758]" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold" data-testid={`text-basket-title-${basket.id}`}>
                {basket.title}
              </CardTitle>
              <Badge variant="outline" className="mt-1 text-[11px]">
                {basket.riskLevel}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00A758]" />
          <span className="text-2xl font-bold" data-testid={`text-target-return-${basket.id}`}>
            {basket.targetReturn}
          </span>
          <span className="text-sm text-muted-foreground">Target Return p.a.</span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {basket.description}
        </p>

        <div className="flex items-center justify-between gap-3 py-3 border-t border-b">
          <div className="flex items-center gap-2">
            <Switch
              checked={dcaEnabled}
              onCheckedChange={setDcaEnabled}
              data-testid={`switch-dca-${basket.id}`}
            />
            <span className="text-sm font-medium">Enable DCA</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]">
                <p className="text-xs">
                  Automatic Monthly Investment (DCA) reduces volatility risk by 30% through peso cost averaging.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <AnimatePresence>
            {dcaEnabled && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <Badge variant="default" className="text-[11px] bg-[#00A758] border-[#00A758]">
                  Volatility -30%
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="holdings" className="border-0">
            <AccordionTrigger
              className="text-sm py-2 hover:no-underline"
              data-testid={`button-view-holdings-${basket.id}`}
            >
              <div className="flex items-center gap-1.5">
                <ChevronDown className="w-3.5 h-3.5 invisible" />
                View Underlying Holdings
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1">
                {basket.funds.map((fund) => (
                  <div
                    key={fund.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50"
                    data-testid={`row-fund-${fund.id}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{fund.name}</p>
                      <p className="text-xs text-muted-foreground">{fund.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#00A758]">
                        {fund.returnRate}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        ER: {fund.expenseRatio}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function PortfolioBuilder() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" data-testid="text-portfolio-title">
          Portfolio Builder
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose an investment basket that aligns with your financial goals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {productBaskets.map((basket) => (
          <motion.div
            key={basket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProductCard basket={basket} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
