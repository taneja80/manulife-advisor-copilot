import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Home,
  Palmtree,
  HeartPulse,
  ArrowRight,
  ArrowLeft,
  Check,
  Target,
  TrendingUp,
  PiggyBank,
  CircleDot,
  HelpCircle,
  Calculator,
  Sparkles,
  User,
  Shield,
  ClipboardList,
} from "lucide-react";
import { formatPHP, manulifeFunds } from "@/lib/mockData";
import type { ModelPortfolio } from "@shared/schema";

const INFLATION_RATE = 0.053;

const goalTypes = [
  { id: "retirement", label: "Retirement", icon: Palmtree, color: "#0C7143", desc: "Secure your golden years" },
  { id: "education", label: "Children's Education", icon: GraduationCap, color: "#00A758", desc: "Invest in their future" },
  { id: "property", label: "Buying Property", icon: Home, color: "#2E86AB", desc: "Your dream home or investment" },
  { id: "medical", label: "Medical Emergency", icon: HeartPulse, color: "#D9534F", desc: "Prepare for the unexpected" },
  { id: "growth", label: "Growth", icon: TrendingUp, color: "#8B5CF6", desc: "Grow your wealth aggressively" },
  { id: "saving", label: "Saving", icon: PiggyBank, color: "#F59E0B", desc: "Build a safety net" },
  { id: "miscellaneous", label: "Miscellaneous", icon: CircleDot, color: "#6B7280", desc: "Custom financial goal" },
];

const riskProfileQuestions = [
  {
    id: "q1",
    question: "How would you describe your investment experience?",
    options: [
      { label: "I'm new to investing and prefer guided options", score: 1 },
      { label: "I have some experience with mutual funds and stocks", score: 2 },
      { label: "I actively manage investments and understand market risks", score: 3 },
    ],
  },
  {
    id: "q2",
    question: "If your portfolio dropped 20% in one month, what would you do?",
    options: [
      { label: "Sell everything to prevent further losses", score: 1 },
      { label: "Hold steady and wait for recovery", score: 2 },
      { label: "Invest more to take advantage of lower prices", score: 3 },
    ],
  },
  {
    id: "q3",
    question: "What is your primary investment goal?",
    options: [
      { label: "Preserve my capital and earn stable returns", score: 1 },
      { label: "Grow my wealth steadily over time", score: 2 },
      { label: "Maximize returns even if it means higher risk", score: 3 },
    ],
  },
  {
    id: "q4",
    question: "How long do you plan to keep your money invested?",
    options: [
      { label: "Less than 3 years", score: 1 },
      { label: "3 to 7 years", score: 2 },
      { label: "More than 7 years", score: 3 },
    ],
  },
  {
    id: "q5",
    question: "What percentage of your monthly income can you set aside for investments?",
    options: [
      { label: "Less than 10% - I need most of my income for expenses", score: 1 },
      { label: "10-25% - I can comfortably save a portion", score: 2 },
      { label: "More than 25% - I have significant disposable income", score: 3 },
    ],
  },
  {
    id: "q6",
    question: "How do you feel about investments that fluctuate in value?",
    options: [
      { label: "I prefer stability even if returns are lower", score: 1 },
      { label: "I can accept some ups and downs for better returns", score: 2 },
      { label: "I'm comfortable with significant swings for potentially high returns", score: 3 },
    ],
  },
];

function calculateRiskProfile(answers: Record<string, number>): { profile: "Conservative" | "Moderate" | "Aggressive"; score: number; maxScore: number } {
  const totalScore = Object.values(answers).reduce((sum, s) => sum + s, 0);
  const maxScore = riskProfileQuestions.length * 3;
  let profile: "Conservative" | "Moderate" | "Aggressive" = "Moderate";
  if (totalScore <= 10) profile = "Conservative";
  else if (totalScore >= 15) profile = "Aggressive";
  return { profile, score: totalScore, maxScore };
}

const riskProfileColors: Record<string, string> = {
  Conservative: "#2E86AB",
  Moderate: "#00A758",
  Aggressive: "#D9534F",
};

const riskProfileDescriptions: Record<string, string> = {
  Conservative: "Focuses on capital preservation with lower-risk investments. Suitable for clients who prioritize stability and have shorter time horizons.",
  Moderate: "Balances growth and stability with a diversified mix of asset classes. Good for medium-term goals with moderate risk tolerance.",
  Aggressive: "Targets maximum growth through higher equity exposure. Best for long-term investors comfortable with market volatility.",
};

interface QuestionConfig {
  key: string;
  label: string;
  type: "slider" | "select" | "number";
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  suffix?: string;
  format?: "php" | "year" | "number";
  defaultValue: number | string;
}

function getQuestionsForGoal(goalId: string): QuestionConfig[] {
  switch (goalId) {
    case "retirement":
      return [
        { key: "currentAge", label: "Client's Current Age", type: "slider", min: 20, max: 65, step: 1, format: "number", defaultValue: 35 },
        { key: "retireAge", label: "Desired Retirement Age", type: "slider", min: 45, max: 70, step: 1, format: "number", defaultValue: 60 },
        { key: "monthlyExpense", label: "Monthly Lifestyle Expense in Retirement", type: "slider", min: 20000, max: 500000, step: 5000, format: "php", defaultValue: 80000 },
        { key: "pensionIncome", label: "Expected Monthly Pension / SSS Income", type: "slider", min: 0, max: 50000, step: 1000, format: "php", defaultValue: 10000 },
      ];
    case "education":
      return [
        { key: "childAge", label: "Child's Current Age", type: "slider", min: 0, max: 17, step: 1, format: "number", defaultValue: 5 },
        { key: "collegeAge", label: "Age When Entering College", type: "slider", min: 16, max: 20, step: 1, format: "number", defaultValue: 18 },
        {
          key: "schoolType", label: "Type of School", type: "select", options: [
            { value: "public", label: "State University (e.g., UP, PUP)" },
            { value: "private", label: "Private University (e.g., UST, Ateneo, La Salle)" },
            { value: "international", label: "International / Abroad" },
          ], defaultValue: "private"
        },
        { key: "yearsOfStudy", label: "Years of Study", type: "slider", min: 2, max: 8, step: 1, format: "number", defaultValue: 4 },
      ];
    case "property":
      return [
        {
          key: "propertyType", label: "Property Type", type: "select", options: [
            { value: "condo_studio", label: "Condo - Studio / 1BR" },
            { value: "condo_family", label: "Condo - 2BR / 3BR" },
            { value: "townhouse", label: "Townhouse" },
            { value: "house_lot", label: "House & Lot" },
          ], defaultValue: "condo_family"
        },
        {
          key: "location", label: "Location", type: "select", options: [
            { value: "metro_manila", label: "Metro Manila" },
            { value: "nearby_provinces", label: "Cavite / Laguna / Bulacan / Rizal" },
            { value: "cebu_davao", label: "Cebu / Davao" },
            { value: "provincial", label: "Other Provincial Areas" },
          ], defaultValue: "metro_manila"
        },
        { key: "yearsToTarget", label: "When Do You Plan to Buy? (Years from now)", type: "slider", min: 1, max: 20, step: 1, format: "number", defaultValue: 5 },
      ];
    case "medical":
      return [
        { key: "familyMembers", label: "Number of Family Members to Cover", type: "slider", min: 1, max: 10, step: 1, format: "number", defaultValue: 4 },
        { key: "monthlyIncome", label: "Household Monthly Income", type: "slider", min: 20000, max: 1000000, step: 5000, format: "php", defaultValue: 80000 },
        { key: "coverageMonths", label: "Months of Coverage Needed", type: "slider", min: 3, max: 24, step: 1, format: "number", defaultValue: 6 },
      ];
    case "growth":
      return [
        { key: "currentSavings", label: "Current Savings / Investment Amount", type: "slider", min: 0, max: 50000000, step: 100000, format: "php", defaultValue: 1000000 },
        {
          key: "targetMultiplier", label: "Growth Target (Multiply by)", type: "select", options: [
            { value: "2", label: "2x (Double)" },
            { value: "3", label: "3x (Triple)" },
            { value: "5", label: "5x" },
            { value: "10", label: "10x" },
          ], defaultValue: "3"
        },
        { key: "yearsToGrow", label: "Investment Horizon (Years)", type: "slider", min: 3, max: 30, step: 1, format: "number", defaultValue: 10 },
      ];
    case "saving":
      return [
        { key: "monthlyIncome", label: "Client's Monthly Income", type: "slider", min: 15000, max: 1000000, step: 5000, format: "php", defaultValue: 60000 },
        { key: "savingsTarget", label: "Target Months of Savings", type: "slider", min: 3, max: 36, step: 1, format: "number", defaultValue: 12 },
        { key: "savingsRate", label: "Monthly Savings Rate (%)", type: "slider", min: 5, max: 50, step: 1, suffix: "%", format: "number", defaultValue: 20 },
      ];
    case "miscellaneous":
      return [
        { key: "estimatedCost", label: "Estimated Cost Today", type: "slider", min: 50000, max: 50000000, step: 50000, format: "php", defaultValue: 1000000 },
        { key: "yearsToTarget", label: "Years Until You Need This", type: "slider", min: 1, max: 30, step: 1, format: "number", defaultValue: 5 },
      ];
    default:
      return [];
  }
}

function inflate(amount: number, years: number): number {
  return Math.round(amount * Math.pow(1 + INFLATION_RATE, years));
}

function calculateBaseTarget(goalId: string, answers: Record<string, number | string>): { baseAmount: number; defaultYears: number; breakdown: (years: number, inflatedAmount: number) => string } {
  switch (goalId) {
    case "retirement": {
      const currentAge = Number(answers.currentAge) || 35;
      const retireAge = Number(answers.retireAge) || 60;
      const monthlyExpense = Number(answers.monthlyExpense) || 80000;
      const pensionIncome = Number(answers.pensionIncome) || 10000;
      const yearsToRetire = retireAge - currentAge;
      const retirementYears = 25;
      const monthlyGap = monthlyExpense - pensionIncome;
      const baseTotal = monthlyGap * 12 * retirementYears;
      return {
        baseAmount: baseTotal,
        defaultYears: yearsToRetire,
        breakdown: (years, inflatedAmount) => {
          const inflatedMonthly = inflate(monthlyGap, years);
          return `${formatPHP(monthlyGap)}/mo gap today becomes ${formatPHP(inflatedMonthly)}/mo in ${years} years at ${(INFLATION_RATE * 100).toFixed(1)}% inflation. Covering ${retirementYears} years of retirement. Target: ${formatPHP(inflatedAmount)}.`;
        },
      };
    }
    case "education": {
      const childAge = Number(answers.childAge) || 5;
      const collegeAge = Number(answers.collegeAge) || 18;
      const yearsUntilCollege = collegeAge - childAge;
      const yearsOfStudy = Number(answers.yearsOfStudy) || 4;
      const schoolType = String(answers.schoolType) || "private";
      let annualTuition = 80000;
      if (schoolType === "private") annualTuition = 250000;
      if (schoolType === "international") annualTuition = 800000;
      const livingExpenses = schoolType === "international" ? 600000 : 180000;
      const annualCost = annualTuition + livingExpenses;
      const baseTotal = annualCost * yearsOfStudy;
      return {
        baseAmount: baseTotal,
        defaultYears: yearsUntilCollege,
        breakdown: (years, inflatedAmount) =>
          `Annual cost of ${formatPHP(annualCost)} today (tuition + living) will be ${formatPHP(inflate(annualCost, years))} by college entry in ${years} years. Total for ${yearsOfStudy} years: ${formatPHP(inflatedAmount)}.`,
      };
    }
    case "property": {
      const propertyType = String(answers.propertyType) || "condo_family";
      const location = String(answers.location) || "metro_manila";
      const yearsToTarget = Number(answers.yearsToTarget) || 5;
      let basePrice = 3000000;
      if (propertyType === "condo_studio") basePrice = location === "metro_manila" ? 3500000 : 2000000;
      if (propertyType === "condo_family") basePrice = location === "metro_manila" ? 7000000 : 4000000;
      if (propertyType === "townhouse") basePrice = location === "metro_manila" ? 5500000 : 3500000;
      if (propertyType === "house_lot") basePrice = location === "metro_manila" ? 12000000 : 5000000;
      if (location === "cebu_davao") basePrice = Math.round(basePrice * 0.8);
      if (location === "provincial") basePrice = Math.round(basePrice * 0.5);
      const downPaymentBase = Math.round(basePrice * 0.2);
      return {
        baseAmount: downPaymentBase,
        defaultYears: yearsToTarget,
        breakdown: (years, inflatedAmount) => {
          const futurePrice = inflate(basePrice, years);
          return `Property value: ${formatPHP(basePrice)} today, ${formatPHP(futurePrice)} in ${years} years at ${(INFLATION_RATE * 100).toFixed(1)}% inflation. 20% down payment: ${formatPHP(inflatedAmount)}.`;
        },
      };
    }
    case "medical": {
      const familyMembers = Number(answers.familyMembers) || 4;
      const monthlyIncome = Number(answers.monthlyIncome) || 80000;
      const coverageMonths = Number(answers.coverageMonths) || 6;
      const baseEmergency = monthlyIncome * coverageMonths;
      const medicalBuffer = familyMembers * 100000;
      const baseTotal = baseEmergency + medicalBuffer;
      return {
        baseAmount: baseTotal,
        defaultYears: 2,
        breakdown: (years, inflatedAmount) =>
          `${coverageMonths} months of income (${formatPHP(monthlyIncome)}/mo) + ${formatPHP(medicalBuffer)} medical buffer for ${familyMembers} members. Adjusted for ${(INFLATION_RATE * 100).toFixed(1)}% inflation over ${years} years: ${formatPHP(inflatedAmount)}.`,
      };
    }
    case "growth": {
      const currentSavings = Number(answers.currentSavings) || 1000000;
      const targetMultiplier = Number(answers.targetMultiplier) || 3;
      const yearsToGrow = Number(answers.yearsToGrow) || 10;
      const baseTotal = currentSavings * targetMultiplier;
      return {
        baseAmount: baseTotal,
        defaultYears: yearsToGrow,
        breakdown: (years, inflatedAmount) =>
          `Growing ${formatPHP(currentSavings)} by ${targetMultiplier}x = ${formatPHP(baseTotal)} nominal. Inflation-adjusted over ${years} years: ${formatPHP(inflatedAmount)}.`,
      };
    }
    case "saving": {
      const monthlyIncome = Number(answers.monthlyIncome) || 60000;
      const savingsTarget = Number(answers.savingsTarget) || 12;
      const baseTotal = monthlyIncome * savingsTarget;
      return {
        baseAmount: baseTotal,
        defaultYears: 3,
        breakdown: (years, inflatedAmount) =>
          `${savingsTarget} months of income at ${formatPHP(monthlyIncome)}/mo = ${formatPHP(baseTotal)} today. Inflation-adjusted over ${years} years at ${(INFLATION_RATE * 100).toFixed(1)}%: ${formatPHP(inflatedAmount)}.`,
      };
    }
    case "miscellaneous": {
      const estimatedCost = Number(answers.estimatedCost) || 1000000;
      const yearsToTarget = Number(answers.yearsToTarget) || 5;
      return {
        baseAmount: estimatedCost,
        defaultYears: yearsToTarget,
        breakdown: (years, inflatedAmount) =>
          `Today's cost of ${formatPHP(estimatedCost)} adjusted for ${(INFLATION_RATE * 100).toFixed(1)}% inflation over ${years} years: ${formatPHP(inflatedAmount)}.`,
      };
    }
    default:
      return { baseAmount: 3000000, defaultYears: 5, breakdown: () => "" };
  }
}

interface GoalWizardProps {
  onComplete: (data: any) => void;
  onCancel?: () => void;
  clientName?: string;
  isNewClient?: boolean;
}

export function GoalWizard({ onComplete, onCancel, clientName, isNewClient }: GoalWizardProps) {
  const [step, setStep] = useState(0);

  const [clientInfo, setClientInfo] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    monthlyIncome: "",
  });
  const [riskAnswers, setRiskAnswers] = useState<Record<string, number>>({});
  const [calculatedRisk, setCalculatedRisk] = useState<{ profile: "Conservative" | "Moderate" | "Aggressive"; score: number; maxScore: number } | null>(null);

  const [selectedGoal, setSelectedGoal] = useState("");
  const [knowsTarget, setKnowsTarget] = useState<boolean | null>(null);
  const [manualTarget, setManualTarget] = useState(3000000);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, number | string>>({});
  const [timeHorizon, setTimeHorizon] = useState(2035);
  const [selectedRisk, setSelectedRisk] = useState("Moderate");
  const [customTarget, setCustomTarget] = useState<number | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  const [assignedPortfolio, setAssignedPortfolio] = useState<ModelPortfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const currentYear = 2026;
  const yearsFromNow = timeHorizon - currentYear;

  const questions = useMemo(() => getQuestionsForGoal(selectedGoal), [selectedGoal]);

  const baseResult = useMemo(() => {
    if (selectedGoal && !knowsTarget && Object.keys(questionAnswers).length > 0) {
      return calculateBaseTarget(selectedGoal, questionAnswers);
    }
    return null;
  }, [selectedGoal, knowsTarget, questionAnswers]);

  const inflatedAmount = useMemo(() => {
    if (baseResult) {
      return inflate(baseResult.baseAmount, yearsFromNow > 0 ? yearsFromNow : baseResult.defaultYears);
    }
    return 3000000;
  }, [baseResult, yearsFromNow]);

  const breakdownText = useMemo(() => {
    if (baseResult) {
      const years = yearsFromNow > 0 ? yearsFromNow : baseResult.defaultYears;
      const displayAmount = customTarget ?? inflatedAmount;
      return baseResult.breakdown(years, displayAmount);
    }
    return "";
  }, [baseResult, yearsFromNow, customTarget, inflatedAmount]);

  const displayTarget = customTarget ?? inflatedAmount;
  const finalTarget = knowsTarget ? manualTarget : displayTarget;

  const newClientStepOffset = isNewClient ? 3 : 0;

  const getGoalStepCount = () => (knowsTarget === false ? 5 : 4);
  const totalSteps = newClientStepOffset + getGoalStepCount();

  const getStepLabels = () => {
    const clientSteps = isNewClient
      ? [
        { title: "Client Information", subtitle: "Enter your client's basic details" },
        { title: "Risk Assessment", subtitle: "6 questions to determine investment profile" },
        { title: "Risk Profile Result", subtitle: "Based on the assessment" },
      ]
      : [];

    const goalSteps =
      knowsTarget === false
        ? [
          { title: "Choose Your Goal", subtitle: "What is your client saving for?" },
          { title: "Target Amount", subtitle: "Does your client have a target in mind?" },
          { title: "Let's Calculate", subtitle: "Answer a few questions to estimate the target" },
          { title: "Your Target", subtitle: "Here's the inflation-adjusted amount" },
          { title: "Summary", subtitle: "Review and confirm the goal" },
        ]
        : [
          { title: "Choose Your Goal", subtitle: "What is your client saving for?" },
          { title: "Target Amount", subtitle: "Does your client have a target in mind?" },
          { title: "Set Your Target", subtitle: "Enter the target amount and timeline" },
          { title: "Summary", subtitle: "Review and confirm the goal" },
        ];

    return [...clientSteps, ...goalSteps];
  };

  const stepLabels = getStepLabels();

  const handleAnswerChange = (key: string, value: number | string) => {
    setQuestionAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const initializeDefaults = () => {
    const defaults: Record<string, number | string> = {};
    questions.forEach((q) => {
      defaults[q.key] = q.defaultValue;
    });
    setQuestionAnswers(defaults);
  };

  const allRiskQuestionsAnswered = Object.keys(riskAnswers).length === riskProfileQuestions.length;

  const isClientInfoValid = () => {
    return (
      clientInfo.name.trim().length >= 2 &&
      clientInfo.age.trim() !== "" &&
      Number(clientInfo.age) >= 18 &&
      Number(clientInfo.age) <= 100
    );
  };

  const canProceed = () => {
    if (isNewClient) {
      if (step === 0) return isClientInfoValid();
      if (step === 1) return allRiskQuestionsAnswered;
      if (step === 2) return calculatedRisk !== null;
    }

    const goalStep = step - newClientStepOffset;
    if (goalStep === 0) return selectedGoal !== "";
    if (goalStep === 1) return knowsTarget !== null;
    if (knowsTarget === false) {
      if (goalStep === 2) return Object.keys(questionAnswers).length > 0;
      if (goalStep === 3) return true;
      if (goalStep === 4) return true;
    } else {
      if (goalStep === 2) return manualTarget > 0;
      if (goalStep === 3) return true;
    }
    return false;
  };

  const handleNext = () => {
    if (isNewClient && step === 1 && allRiskQuestionsAnswered) {
      const result = calculateRiskProfile(riskAnswers);
      setCalculatedRisk(result);
      setSelectedRisk(result.profile);

      setPortfolioLoading(true);
      fetch(`/api/model-portfolios/risk/${result.profile}`)
        .then((r) => {
          if (!r.ok) throw new Error("Failed to fetch");
          return r.json();
        })
        .then((portfolios: ModelPortfolio[]) => {
          const defaultPortfolio = portfolios.find((p) => p.category === "default") || portfolios[0];
          if (defaultPortfolio) setAssignedPortfolio(defaultPortfolio);
        })
        .catch(() => {
          setAssignedPortfolio(null);
        })
        .finally(() => setPortfolioLoading(false));
    }

    const goalStep = step - newClientStepOffset;
    if (goalStep === 0 && knowsTarget === false) {
      initializeDefaults();
    }
    if (goalStep === 1 && knowsTarget === false && baseResult) {
      setTimeHorizon(currentYear + baseResult.defaultYears);
      setCustomTarget(null);
      setIsEditingTarget(false);
    }
    setStep(step + 1);
  };

  const handleTimeHorizonChange = (year: number) => {
    setTimeHorizon(year);
    setCustomTarget(null);
    setIsEditingTarget(false);
  };

  const isLastStep = step === totalSteps - 1;

  const formatValue = (q: QuestionConfig, val: number | string) => {
    if (q.format === "php") return formatPHP(Number(val));
    if (q.suffix) return `${val}${q.suffix}`;
    return String(val);
  };

  const renderClientInfoStep = () => (
    <motion.div
      key="step-client-info"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client-name">Full Name *</Label>
          <Input
            id="client-name"
            placeholder="e.g., Juan Dela Cruz"
            value={clientInfo.name}
            onChange={(e) => setClientInfo((p) => ({ ...p, name: e.target.value }))}
            data-testid="input-client-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-age">Age *</Label>
          <Input
            id="client-age"
            type="number"
            placeholder="e.g., 35"
            min={18}
            max={100}
            value={clientInfo.age}
            onChange={(e) => setClientInfo((p) => ({ ...p, age: e.target.value }))}
            data-testid="input-client-age"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-email">Email</Label>
          <Input
            id="client-email"
            type="email"
            placeholder="e.g., juan@email.com"
            value={clientInfo.email}
            onChange={(e) => setClientInfo((p) => ({ ...p, email: e.target.value }))}
            data-testid="input-client-email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-phone">Phone Number</Label>
          <Input
            id="client-phone"
            type="tel"
            placeholder="e.g., +63 917 123 4567"
            value={clientInfo.phone}
            onChange={(e) => setClientInfo((p) => ({ ...p, phone: e.target.value }))}
            data-testid="input-client-phone"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="client-income">Monthly Income</Label>
          <Input
            id="client-income"
            type="number"
            placeholder="e.g., 80000"
            value={clientInfo.monthlyIncome}
            onChange={(e) => setClientInfo((p) => ({ ...p, monthlyIncome: e.target.value }))}
            data-testid="input-client-income"
          />
          {clientInfo.monthlyIncome && (
            <p className="text-xs text-muted-foreground">{formatPHP(Number(clientInfo.monthlyIncome))}</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderRiskAssessmentStep = () => (
    <motion.div
      key="step-risk-assessment"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="w-4 h-4 text-[#00A758]" />
        <p className="text-sm text-muted-foreground">
          {Object.keys(riskAnswers).length} of {riskProfileQuestions.length} answered
        </p>
      </div>
      {riskProfileQuestions.map((q, qIndex) => (
        <div key={q.id} className="space-y-3">
          <p className="text-sm font-medium">
            {qIndex + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, optIndex) => {
              const isSelected = riskAnswers[q.id] === opt.score;
              return (
                <button
                  key={optIndex}
                  onClick={() => setRiskAnswers((prev) => ({ ...prev, [q.id]: opt.score }))}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${isSelected
                      ? "border-[#00A758] bg-[#00A758]/5 font-medium"
                      : "border-border"
                    }`}
                  data-testid={`option-${q.id}-${optIndex}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );

  const renderRiskResultStep = () => {
    if (!calculatedRisk) return null;
    const profileColor = riskProfileColors[calculatedRisk.profile];
    const portfolioFundNames = assignedPortfolio
      ? assignedPortfolio.funds.map((f) => {
        const fund = manulifeFunds.find((mf) => mf.id === f.fundId);
        return { name: fund?.name || f.fundId, weight: f.weight, category: fund?.category || "" };
      })
      : [];

    return (
      <motion.div
        key="step-risk-result"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center p-6 rounded-lg border" style={{ borderColor: `${profileColor}40` }}>
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: `${profileColor}15` }}
          >
            <Shield className="w-8 h-8" style={{ color: profileColor }} />
          </div>
          <h3 className="text-xl font-bold mb-1" data-testid="text-risk-profile-result">
            {calculatedRisk.profile}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Score: {calculatedRisk.score} / {calculatedRisk.maxScore}
          </p>
          <div className="w-full bg-muted rounded-full h-2 mb-4 max-w-xs mx-auto">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${(calculatedRisk.score / calculatedRisk.maxScore) * 100}%`,
                backgroundColor: profileColor,
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {riskProfileDescriptions[calculatedRisk.profile]}
          </p>
        </div>

        {portfolioLoading && (
          <div className="flex items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Loading recommended portfolio...</p>
          </div>
        )}

        {!portfolioLoading && assignedPortfolio && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00A758]" />
              <h4 className="text-sm font-semibold">Recommended Model Portfolio</h4>
            </div>
            <p className="text-xs text-muted-foreground">{assignedPortfolio.description}</p>
            <div className="space-y-2">
              {portfolioFundNames.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.category}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{f.weight}%</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderGoalStep = () => {
    const goalStep = step - newClientStepOffset;

    if (goalStep === 0) {
      return (
        <motion.div
          key="step-goal"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {goalTypes.map((goal) => (
            <button
              key={goal.id}
              onClick={() => {
                setSelectedGoal(goal.id);
                setKnowsTarget(null);
                setQuestionAnswers({});
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${selectedGoal === goal.id
                  ? "border-[#00A758] bg-[#00A758]/5"
                  : "border-border"
                }`}
              data-testid={`button-goal-${goal.id}`}
            >
              <goal.icon className="w-7 h-7" style={{ color: goal.color }} />
              <span className="text-xs font-medium text-center">{goal.label}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{goal.desc}</span>
            </button>
          ))}
        </motion.div>
      );
    }

    if (goalStep === 1) {
      return (
        <motion.div
          key="step-knows"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <p className="text-sm text-center text-muted-foreground mb-6">
            Does your client already have a specific target amount for their{" "}
            <span className="font-semibold text-foreground">
              {goalTypes.find((g) => g.id === selectedGoal)?.label}
            </span>{" "}
            goal?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setKnowsTarget(true)}
              className={`flex flex-col items-center gap-3 p-6 rounded-lg border transition-all ${knowsTarget === true
                  ? "border-[#00A758] bg-[#00A758]/5"
                  : "border-border"
                }`}
              data-testid="button-knows-target-yes"
            >
              <Target className="w-8 h-8 text-[#00A758]" />
              <div className="text-center">
                <p className="text-sm font-semibold">Yes, I have a target</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Client already knows how much they need
                </p>
              </div>
            </button>

            <button
              onClick={() => setKnowsTarget(false)}
              className={`flex flex-col items-center gap-3 p-6 rounded-lg border transition-all ${knowsTarget === false
                  ? "border-[#00A758] bg-[#00A758]/5"
                  : "border-border"
                }`}
              data-testid="button-knows-target-no"
            >
              <HelpCircle className="w-8 h-8 text-[#2E86AB]" />
              <div className="text-center">
                <p className="text-sm font-semibold">Help me calculate</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll ask a few questions and compute an inflation-adjusted target
                </p>
              </div>
            </button>
          </div>
        </motion.div>
      );
    }

    if (goalStep === 2 && knowsTarget === true) {
      return (
        <motion.div
          key="step-manual"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm font-medium">Target Amount</p>
              <Badge variant="outline" className="text-sm font-bold" data-testid="badge-manual-target">
                {formatPHP(manualTarget)}
              </Badge>
            </div>
            <Slider
              value={[manualTarget]}
              onValueChange={(v) => setManualTarget(v[0])}
              min={100000}
              max={100000000}
              step={100000}
              className="mb-2"
              data-testid="slider-manual-target"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{formatPHP(100000)}</span>
              <span>{formatPHP(100000000)}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm font-medium">Target Year</p>
              <Badge variant="outline" className="text-sm font-bold">
                {timeHorizon} ({timeHorizon - currentYear} years)
              </Badge>
            </div>
            <Slider
              value={[timeHorizon]}
              onValueChange={(v) => setTimeHorizon(v[0])}
              min={2027}
              max={2060}
              step={1}
              className="mb-2"
              data-testid="slider-time-horizon"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>2027</span>
              <span>2060</span>
            </div>
          </div>
        </motion.div>
      );
    }

    if (goalStep === 2 && knowsTarget === false) {
      return (
        <motion.div
          key="step-questions"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-2 p-3 rounded-lg bg-[#00A758]/5 border border-[#00A758]/10">
            <Calculator className="w-4 h-4 text-[#00A758] shrink-0" />
            <p className="text-xs text-muted-foreground">
              Answer these questions and we'll compute an inflation-adjusted target at the current BSP rate of {(INFLATION_RATE * 100).toFixed(1)}%.
            </p>
          </div>
          {questions.map((q) => (
            <div key={q.key}>
              {q.type === "slider" && (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-medium">{q.label}</p>
                    <Badge variant="outline" className="text-xs font-semibold shrink-0">
                      {formatValue(q, questionAnswers[q.key] ?? q.defaultValue)}
                    </Badge>
                  </div>
                  <Slider
                    value={[Number(questionAnswers[q.key] ?? q.defaultValue)]}
                    onValueChange={(v) => handleAnswerChange(q.key, v[0])}
                    min={q.min}
                    max={q.max}
                    step={q.step}
                    className="mb-1"
                    data-testid={`slider-${q.key}`}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{formatValue(q, q.min ?? 0)}</span>
                    <span>{formatValue(q, q.max ?? 100)}</span>
                  </div>
                </div>
              )}
              {q.type === "select" && q.options && (
                <div>
                  <p className="text-sm font-medium mb-2">{q.label}</p>
                  <Select
                    value={String(questionAnswers[q.key] ?? q.defaultValue)}
                    onValueChange={(v) => handleAnswerChange(q.key, v)}
                  >
                    <SelectTrigger data-testid={`select-${q.key}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {q.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      );
    }

    if (goalStep === 3 && knowsTarget === false) {
      return (
        <motion.div
          key="step-target-result"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="text-center p-6 rounded-lg bg-[#00A758]/5 border border-[#00A758]/10">
            <Sparkles className="w-8 h-8 text-[#00A758] mx-auto mb-3" />
            {isEditingTarget ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Enter your custom target</p>
                <Input
                  type="number"
                  value={customTarget ?? inflatedAmount}
                  onChange={(e) => setCustomTarget(Number(e.target.value))}
                  className="text-center text-lg font-bold max-w-xs mx-auto"
                  data-testid="input-custom-target"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTarget(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold mb-1" data-testid="text-calculated-target">
                  {formatPHP(displayTarget)}
                </p>
                <p className="text-sm text-muted-foreground">Inflation-adjusted target</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsEditingTarget(true)}
                  data-testid="button-edit-target"
                >
                  Adjust target
                </Button>
              </>
            )}
          </div>

          {breakdownText && (
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground">{breakdownText}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm font-medium">Target Year</p>
              <Badge variant="outline" className="text-sm font-bold">
                {timeHorizon} ({yearsFromNow} years)
              </Badge>
            </div>
            <Slider
              value={[timeHorizon]}
              onValueChange={(v) => handleTimeHorizonChange(v[0])}
              min={currentYear + 1}
              max={2060}
              step={1}
              className="mb-1"
              data-testid="slider-time-horizon"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{currentYear + 1}</span>
              <span>2060</span>
            </div>
          </div>
        </motion.div>
      );
    }

    const lastGoalStep = knowsTarget === false ? 4 : 3;
    if (goalStep === lastGoalStep) {
      const riskProfile = isNewClient && calculatedRisk ? calculatedRisk.profile : selectedRisk;
      const portfolioFundNames = assignedPortfolio
        ? assignedPortfolio.funds.map((f) => {
          const fund = manulifeFunds.find((mf) => mf.id === f.fundId);
          return { name: fund?.name || f.fundId, weight: f.weight };
        })
        : [];

      return (
        <motion.div
          key="step-summary"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-5"
        >
          {isNewClient && (
            <div className="p-4 rounded-lg border space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[#00A758]" />
                <h4 className="text-sm font-semibold">Client Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Name</span>
                  <p className="font-medium">{clientInfo.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Age</span>
                  <p className="font-medium">{clientInfo.age}</p>
                </div>
                {clientInfo.email && (
                  <div>
                    <span className="text-muted-foreground text-xs">Email</span>
                    <p className="font-medium">{clientInfo.email}</p>
                  </div>
                )}
                {clientInfo.phone && (
                  <div>
                    <span className="text-muted-foreground text-xs">Phone</span>
                    <p className="font-medium">{clientInfo.phone}</p>
                  </div>
                )}
                {clientInfo.monthlyIncome && (
                  <div>
                    <span className="text-muted-foreground text-xs">Monthly Income</span>
                    <p className="font-medium">{formatPHP(Number(clientInfo.monthlyIncome))}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-xs">Risk Profile</span>
                  <Badge
                    variant="outline"
                    className="mt-1 border-current"
                    style={{ color: riskProfileColors[riskProfile] }}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {riskProfile}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg border space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-[#00A758]" />
              <h4 className="text-sm font-semibold">Goal Details</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Goal Type</span>
                <p className="font-medium">{goalTypes.find((g) => g.id === selectedGoal)?.label}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Target Amount</span>
                <p className="font-medium">{formatPHP(finalTarget)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Target Year</span>
                <p className="font-medium">{timeHorizon}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Risk Profile</span>
                <Badge
                  variant="outline"
                  className="mt-1 border-current"
                  style={{ color: riskProfileColors[riskProfile] || "#00A758" }}
                >
                  {riskProfile}
                </Badge>
              </div>
            </div>
          </div>

          {assignedPortfolio && portfolioFundNames.length > 0 && (
            <div className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#00A758]" />
                <h4 className="text-sm font-semibold">Assigned Model Portfolio</h4>
              </div>
              <p className="text-xs text-muted-foreground">{assignedPortfolio.name}</p>
              <div className="space-y-1.5">
                {portfolioFundNames.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{f.name}</span>
                    <span className="font-medium">{f.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isNewClient && (
            <div className="p-4 rounded-lg border space-y-3">
              <h4 className="text-sm font-semibold mb-2">Investment Style</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(["Conservative", "Moderate", "Aggressive"] as const).map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setSelectedRisk(risk)}
                    className={`p-3 rounded-lg border text-center transition-all ${selectedRisk === risk
                        ? "border-[#00A758] bg-[#00A758]/5"
                        : "border-border"
                      }`}
                    data-testid={`button-risk-${risk.toLowerCase()}`}
                  >
                    <Shield className="w-5 h-5 mx-auto mb-1" style={{ color: riskProfileColors[risk] }} />
                    <p className="text-xs font-medium">{risk}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
    }

    return null;
  };

  const renderStep = () => {
    if (isNewClient && step === 0) return renderClientInfoStep();
    if (isNewClient && step === 1) return renderRiskAssessmentStep();
    if (isNewClient && step === 2) return renderRiskResultStep();
    return renderGoalStep();
  };

  const handleFinalSubmit = () => {
    // Construct the goal object
    const riskProfile = isNewClient && calculatedRisk ? calculatedRisk.profile : selectedRisk;

    // We'll calculate a simple initial portfolio breakdown based on the assigned model
    // In a real app, this would be more granular
    const newGoal = {
      name: `${goalTypes.find(g => g.id === selectedGoal)?.label || "New"} Goal`,
      type: selectedGoal,
      targetAmount: finalTarget,
      currentAmount: 0, // Initial amount could be gathered
      targetDate: String(timeHorizon),
      probability: 85, // Default high probability for new plan
      status: "on-track",
      riskProfile: riskProfile,
      monthlyContribution: 0, // Could be gathered
      portfolio: assignedPortfolio ? {
        totalInvested: 0,
        funds: assignedPortfolio.funds.map(f => ({
          fundId: f.fundId,
          weight: f.weight,
          amount: 0
        }))
      } : { totalInvested: 0, funds: [] },
      returns: { ytd: 0, oneYear: 0, threeYear: 0 }
    };

    if (isNewClient) {
      // Return full client structure
      const newClient = {
        name: clientInfo.name,
        age: Number(clientInfo.age),
        // email: clientInfo.email,
        // phone: clientInfo.phone,
        monthlyIncome: Number(clientInfo.monthlyIncome || 0),
        riskProfile: riskProfile,
        totalPortfolio: 0,
        cashHoldings: 0,
        returns: { ytd: 0, oneYear: 0, threeYear: 0 },
        needsAction: false,
        joinedDate: new Date().toISOString().split('T')[0],
        goals: [newGoal]
      };
      onComplete(newClient);
    } else {
      // Just return the goal
      onComplete(newGoal);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {onCancel && (
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={onCancel} data-testid="button-wizard-cancel">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[#00A758]">
            {isNewClient ? <User className="w-5 h-5 text-white" /> : <Target className="w-5 h-5 text-white" />}
          </div>
        </div>
        <h1 className="text-2xl font-bold" data-testid="text-wizard-title">
          {isNewClient ? "New Client Onboarding" : "Create New Goal"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isNewClient
            ? "Complete the risk assessment and set up their first goal"
            : clientName
              ? `Add a new goal for ${clientName}`
              : "Build a personalized wealth plan for your client"}
        </p>
      </div>

      <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
        {stepLabels.map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${i <= step
                  ? "bg-[#00A758] text-white"
                  : "bg-muted text-muted-foreground"
                }`}
              data-testid={`step-indicator-${i}`}
            >
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 ${i < step ? "bg-[#00A758]" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{stepLabels[step]?.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{stepLabels[step]?.subtitle}</p>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              data-testid="button-wizard-back"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            {isLastStep ? (
              <Button
                className="bg-[#00A758] border-[#00A758]"
                onClick={handleFinalSubmit}
                data-testid="button-wizard-complete"
              >
                <Check className="w-4 h-4 mr-1" />
                {isNewClient ? "Complete Onboarding" : "Create Goal"}
              </Button>
            ) : (
              <Button
                className="bg-[#00A758] border-[#00A758]"
                onClick={handleNext}
                disabled={!canProceed()}
                data-testid="button-wizard-next"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
