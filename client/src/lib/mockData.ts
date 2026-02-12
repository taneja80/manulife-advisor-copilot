export interface Fund {
  id: string;
  name: string;
  category: string;
  returnRate: string;
  risk: string;
  allocation: number;
  ytdReturn: number;
  expenseRatio: number;
  volatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface GoalPortfolio {
  funds: GoalFundAllocation[];
  totalInvested: number;
}

export interface GoalFundAllocation {
  fundId: string;
  weight: number;
  amount: number;
}

export interface GoalReturns {
  ytd: number;
  oneYear: number;
  threeYear: number;
}

export interface Goal {
  id: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  probability: number;
  status: "on-track" | "off-track" | "ahead";
  riskProfile: string;
  portfolio: GoalPortfolio;
  returns: GoalReturns;
  monthlyContribution: number;
}

export interface ClientReturns {
  ytd: number;
  oneYear: number;
  threeYear: number;
}

export interface Client {
  id: string;
  name: string;
  age: number;
  riskProfile: string;
  totalPortfolio: number;
  cashHoldings: number;
  monthlyIncome: number;
  goals: Goal[];
  returns: ClientReturns;
  needsAction: boolean;
  actionReason?: string;
  joinedDate: string;
}

export interface ProductBasket {
  id: string;
  title: string;
  targetReturn: string;
  riskLevel: string;
  description: string;
  funds: Fund[];
}

export const manulifeFunds: Fund[] = [
  {
    id: "f1",
    name: "Manulife Global Franchise Fund",
    category: "Global Equity",
    returnRate: "12.5%",
    risk: "Moderate-High",
    allocation: 25,
    ytdReturn: 12.5,
    expenseRatio: 1.75,
    volatility: 14.2,
    maxDrawdown: -18.5,
    sharpeRatio: 0.88,
  },
  {
    id: "f2",
    name: "Manulife Asia Pacific REIT Fund",
    category: "Real Estate",
    returnRate: "7.2%",
    risk: "Moderate",
    allocation: 15,
    ytdReturn: 7.2,
    expenseRatio: 1.5,
    volatility: 11.8,
    maxDrawdown: -15.2,
    sharpeRatio: 0.61,
  },
  {
    id: "f3",
    name: "Manulife Philippine Equity Fund",
    category: "Philippine Equity",
    returnRate: "9.8%",
    risk: "High",
    allocation: 20,
    ytdReturn: 9.8,
    expenseRatio: 2.0,
    volatility: 19.5,
    maxDrawdown: -28.3,
    sharpeRatio: 0.50,
  },
  {
    id: "f4",
    name: "Manulife Dragon Growth Fund",
    category: "Greater China Equity",
    returnRate: "11.3%",
    risk: "High",
    allocation: 15,
    ytdReturn: 11.3,
    expenseRatio: 1.85,
    volatility: 22.1,
    maxDrawdown: -32.6,
    sharpeRatio: 0.51,
  },
  {
    id: "f5",
    name: "Manulife Peso Money Market Fund",
    category: "Money Market",
    returnRate: "3.5%",
    risk: "Low",
    allocation: 10,
    ytdReturn: 3.5,
    expenseRatio: 0.5,
    volatility: 1.2,
    maxDrawdown: -0.8,
    sharpeRatio: 2.92,
  },
  {
    id: "f6",
    name: "Manulife Income Builder Fund",
    category: "Balanced",
    returnRate: "6.8%",
    risk: "Moderate",
    allocation: 15,
    ytdReturn: 6.8,
    expenseRatio: 1.25,
    volatility: 8.5,
    maxDrawdown: -12.1,
    sharpeRatio: 0.80,
  },
];

export const productBaskets: ProductBasket[] = [
  {
    id: "b1",
    title: "Manulife Asia Growth Basket",
    targetReturn: "8-10%",
    riskLevel: "Moderate-High",
    description:
      "A diversified basket focused on high-growth Asian markets including Philippines, Greater China, and Southeast Asia equities.",
    funds: [manulifeFunds[0], manulifeFunds[2], manulifeFunds[3]],
  },
  {
    id: "b2",
    title: "Manulife Income & Stability Basket",
    targetReturn: "5-7%",
    riskLevel: "Moderate",
    description:
      "A balanced approach combining income-generating REITs with money market stability for steady peso returns.",
    funds: [manulifeFunds[1], manulifeFunds[4], manulifeFunds[5]],
  },
  {
    id: "b3",
    title: "Manulife Global Diversified Basket",
    targetReturn: "7-9%",
    riskLevel: "Moderate",
    description:
      "Broad global exposure across equity, fixed income, and real estate for long-term peso wealth accumulation.",
    funds: [manulifeFunds[0], manulifeFunds[1], manulifeFunds[5]],
  },
];

export const clients: Client[] = [
  {
    id: "c1",
    name: "Maria Santos",
    age: 35,
    riskProfile: "Balanced",
    totalPortfolio: 5200000,
    cashHoldings: 1300000,
    monthlyIncome: 120000,
    returns: { ytd: 8.3, oneYear: 10.1, threeYear: 7.4 },
    needsAction: false,
    joinedDate: "2022-03-15",
    goals: [
      {
        id: "g1",
        name: "Child's Education (UST Tuition)",
        type: "education",
        targetAmount: 3000000,
        currentAmount: 1800000,
        targetDate: "2032",
        probability: 82,
        status: "on-track",
        riskProfile: "Balanced",
        monthlyContribution: 15000,
        portfolio: {
          totalInvested: 1800000,
          funds: [
            { fundId: "f1", weight: 40, amount: 720000 },
            { fundId: "f2", weight: 30, amount: 540000 },
            { fundId: "f6", weight: 30, amount: 540000 },
          ],
        },
        returns: { ytd: 9.1, oneYear: 10.5, threeYear: 7.8 },
      },
      {
        id: "g2",
        name: "Retirement Fund",
        type: "retirement",
        targetAmount: 15000000,
        currentAmount: 3200000,
        targetDate: "2050",
        probability: 65,
        status: "off-track",
        riskProfile: "Growth",
        monthlyContribution: 20000,
        portfolio: {
          totalInvested: 3200000,
          funds: [
            { fundId: "f1", weight: 35, amount: 1120000 },
            { fundId: "f3", weight: 30, amount: 960000 },
            { fundId: "f4", weight: 20, amount: 640000 },
            { fundId: "f5", weight: 15, amount: 480000 },
          ],
        },
        returns: { ytd: 10.8, oneYear: 12.3, threeYear: 8.5 },
      },
      {
        id: "g3",
        name: "Buying Property (Tagaytay)",
        type: "property",
        targetAmount: 8000000,
        currentAmount: 5500000,
        targetDate: "2030",
        probability: 91,
        status: "ahead",
        riskProfile: "Balanced",
        monthlyContribution: 25000,
        portfolio: {
          totalInvested: 5500000,
          funds: [
            { fundId: "f2", weight: 40, amount: 2200000 },
            { fundId: "f6", weight: 35, amount: 1925000 },
            { fundId: "f5", weight: 25, amount: 1375000 },
          ],
        },
        returns: { ytd: 6.2, oneYear: 7.1, threeYear: 6.0 },
      },
      {
        id: "g4",
        name: "Medical Emergency Fund",
        type: "medical",
        targetAmount: 1000000,
        currentAmount: 720000,
        targetDate: "2027",
        probability: 88,
        status: "on-track",
        riskProfile: "Conservative",
        monthlyContribution: 10000,
        portfolio: {
          totalInvested: 720000,
          funds: [
            { fundId: "f5", weight: 60, amount: 432000 },
            { fundId: "f6", weight: 40, amount: 288000 },
          ],
        },
        returns: { ytd: 4.8, oneYear: 5.2, threeYear: 4.5 },
      },
    ],
  },
  {
    id: "c2",
    name: "Jose Reyes",
    age: 42,
    riskProfile: "Growth",
    totalPortfolio: 12500000,
    cashHoldings: 2000000,
    monthlyIncome: 250000,
    returns: { ytd: 11.2, oneYear: 13.8, threeYear: 9.6 },
    needsAction: true,
    actionReason: "Retirement goal off-track, rebalancing recommended",
    joinedDate: "2020-11-02",
    goals: [
      {
        id: "g5",
        name: "Retirement (Age 60)",
        type: "retirement",
        targetAmount: 30000000,
        currentAmount: 8500000,
        targetDate: "2044",
        probability: 58,
        status: "off-track",
        riskProfile: "Growth",
        monthlyContribution: 40000,
        portfolio: {
          totalInvested: 8500000,
          funds: [
            { fundId: "f1", weight: 30, amount: 2550000 },
            { fundId: "f3", weight: 25, amount: 2125000 },
            { fundId: "f4", weight: 25, amount: 2125000 },
            { fundId: "f2", weight: 20, amount: 1700000 },
          ],
        },
        returns: { ytd: 11.5, oneYear: 14.2, threeYear: 10.1 },
      },
      {
        id: "g6",
        name: "Children's Education (Ateneo)",
        type: "education",
        targetAmount: 5000000,
        currentAmount: 3200000,
        targetDate: "2030",
        probability: 85,
        status: "on-track",
        riskProfile: "Balanced",
        monthlyContribution: 20000,
        portfolio: {
          totalInvested: 3200000,
          funds: [
            { fundId: "f1", weight: 40, amount: 1280000 },
            { fundId: "f6", weight: 35, amount: 1120000 },
            { fundId: "f5", weight: 25, amount: 800000 },
          ],
        },
        returns: { ytd: 8.9, oneYear: 10.0, threeYear: 7.5 },
      },
      {
        id: "g7",
        name: "Investment Property (BGC Condo)",
        type: "property",
        targetAmount: 15000000,
        currentAmount: 6800000,
        targetDate: "2033",
        probability: 72,
        status: "on-track",
        riskProfile: "Growth",
        monthlyContribution: 30000,
        portfolio: {
          totalInvested: 6800000,
          funds: [
            { fundId: "f2", weight: 35, amount: 2380000 },
            { fundId: "f3", weight: 30, amount: 2040000 },
            { fundId: "f1", weight: 20, amount: 1360000 },
            { fundId: "f6", weight: 15, amount: 1020000 },
          ],
        },
        returns: { ytd: 9.8, oneYear: 11.5, threeYear: 8.2 },
      },
      {
        id: "g8",
        name: "Wealth Growth Fund",
        type: "growth",
        targetAmount: 20000000,
        currentAmount: 4500000,
        targetDate: "2040",
        probability: 68,
        status: "on-track",
        riskProfile: "Aggressive",
        monthlyContribution: 35000,
        portfolio: {
          totalInvested: 4500000,
          funds: [
            { fundId: "f3", weight: 35, amount: 1575000 },
            { fundId: "f4", weight: 35, amount: 1575000 },
            { fundId: "f1", weight: 30, amount: 1350000 },
          ],
        },
        returns: { ytd: 13.2, oneYear: 15.8, threeYear: 11.0 },
      },
    ],
  },
  {
    id: "c3",
    name: "Ana Dela Cruz",
    age: 28,
    riskProfile: "Aggressive",
    totalPortfolio: 1800000,
    cashHoldings: 400000,
    monthlyIncome: 85000,
    returns: { ytd: 14.5, oneYear: 16.2, threeYear: 11.8 },
    needsAction: false,
    joinedDate: "2023-07-20",
    goals: [
      {
        id: "g9",
        name: "Retirement (Age 55)",
        type: "retirement",
        targetAmount: 25000000,
        currentAmount: 800000,
        targetDate: "2053",
        probability: 72,
        status: "on-track",
        riskProfile: "Aggressive",
        monthlyContribution: 15000,
        portfolio: {
          totalInvested: 800000,
          funds: [
            { fundId: "f3", weight: 35, amount: 280000 },
            { fundId: "f4", weight: 35, amount: 280000 },
            { fundId: "f1", weight: 30, amount: 240000 },
          ],
        },
        returns: { ytd: 14.8, oneYear: 16.5, threeYear: 12.0 },
      },
      {
        id: "g10",
        name: "Emergency Savings",
        type: "saving",
        targetAmount: 500000,
        currentAmount: 420000,
        targetDate: "2027",
        probability: 95,
        status: "ahead",
        riskProfile: "Conservative",
        monthlyContribution: 8000,
        portfolio: {
          totalInvested: 420000,
          funds: [
            { fundId: "f5", weight: 70, amount: 294000 },
            { fundId: "f6", weight: 30, amount: 126000 },
          ],
        },
        returns: { ytd: 4.2, oneYear: 4.8, threeYear: 4.0 },
      },
    ],
  },
  {
    id: "c4",
    name: "Ricardo Garcia",
    age: 55,
    riskProfile: "Conservative",
    totalPortfolio: 25000000,
    cashHoldings: 5000000,
    monthlyIncome: 350000,
    returns: { ytd: 5.1, oneYear: 6.3, threeYear: 5.8 },
    needsAction: true,
    actionReason: "Portfolio review due, annual rebalancing needed",
    joinedDate: "2019-01-10",
    goals: [
      {
        id: "g11",
        name: "Retirement (2030)",
        type: "retirement",
        targetAmount: 40000000,
        currentAmount: 22000000,
        targetDate: "2030",
        probability: 78,
        status: "on-track",
        riskProfile: "Conservative",
        monthlyContribution: 50000,
        portfolio: {
          totalInvested: 22000000,
          funds: [
            { fundId: "f5", weight: 35, amount: 7700000 },
            { fundId: "f6", weight: 30, amount: 6600000 },
            { fundId: "f2", weight: 20, amount: 4400000 },
            { fundId: "f1", weight: 15, amount: 3300000 },
          ],
        },
        returns: { ytd: 5.5, oneYear: 6.8, threeYear: 6.0 },
      },
      {
        id: "g12",
        name: "Grandchildren's Education Trust",
        type: "education",
        targetAmount: 10000000,
        currentAmount: 3500000,
        targetDate: "2038",
        probability: 70,
        status: "on-track",
        riskProfile: "Balanced",
        monthlyContribution: 25000,
        portfolio: {
          totalInvested: 3500000,
          funds: [
            { fundId: "f1", weight: 35, amount: 1225000 },
            { fundId: "f6", weight: 30, amount: 1050000 },
            { fundId: "f2", weight: 20, amount: 700000 },
            { fundId: "f5", weight: 15, amount: 525000 },
          ],
        },
        returns: { ytd: 7.2, oneYear: 8.5, threeYear: 7.0 },
      },
    ],
  },
  {
    id: "c5",
    name: "Lourdes Bautista",
    age: 47,
    riskProfile: "Balanced",
    totalPortfolio: 8700000,
    cashHoldings: 1500000,
    monthlyIncome: 180000,
    returns: { ytd: 7.8, oneYear: 9.2, threeYear: 7.1 },
    needsAction: false,
    joinedDate: "2021-05-08",
    goals: [
      {
        id: "g13",
        name: "Retirement (Age 60)",
        type: "retirement",
        targetAmount: 20000000,
        currentAmount: 6200000,
        targetDate: "2039",
        probability: 74,
        status: "on-track",
        riskProfile: "Balanced",
        monthlyContribution: 30000,
        portfolio: {
          totalInvested: 6200000,
          funds: [
            { fundId: "f1", weight: 30, amount: 1860000 },
            { fundId: "f6", weight: 25, amount: 1550000 },
            { fundId: "f2", weight: 25, amount: 1550000 },
            { fundId: "f5", weight: 20, amount: 1240000 },
          ],
        },
        returns: { ytd: 7.5, oneYear: 8.8, threeYear: 7.0 },
      },
      {
        id: "g14",
        name: "Son's Wedding Fund",
        type: "saving",
        targetAmount: 2000000,
        currentAmount: 1500000,
        targetDate: "2028",
        probability: 90,
        status: "ahead",
        riskProfile: "Conservative",
        monthlyContribution: 15000,
        portfolio: {
          totalInvested: 1500000,
          funds: [
            { fundId: "f5", weight: 50, amount: 750000 },
            { fundId: "f6", weight: 50, amount: 750000 },
          ],
        },
        returns: { ytd: 5.0, oneYear: 5.8, threeYear: 5.2 },
      },
      {
        id: "g15",
        name: "Medical Emergency",
        type: "medical",
        targetAmount: 1500000,
        currentAmount: 1200000,
        targetDate: "2027",
        probability: 92,
        status: "ahead",
        riskProfile: "Conservative",
        monthlyContribution: 10000,
        portfolio: {
          totalInvested: 1200000,
          funds: [
            { fundId: "f5", weight: 70, amount: 840000 },
            { fundId: "f6", weight: 30, amount: 360000 },
          ],
        },
        returns: { ytd: 4.3, oneYear: 5.0, threeYear: 4.5 },
      },
    ],
  },
];

export function getClientById(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function getFundById(id: string): Fund | undefined {
  return manulifeFunds.find((f) => f.id === id);
}

export const riskMultipliers: Record<string, number> = {
  Conservative: 0.04,
  Balanced: 0.07,
  Growth: 0.10,
  Aggressive: 0.14,
};

export function generateChartData(
  monthlySavings: number,
  timeHorizon: number,
  riskProfile: string
): { year: number; projected: number; target: number; lower: number; upper: number }[] {
  const baseYear = 2026;
  const startingAmount = 2000000;
  const goalTarget = 15000000;
  const annualReturn = riskMultipliers[riskProfile] || 0.07;
  const volatility = annualReturn * 0.3;

  const data = [];
  let cumulative = startingAmount;

  for (let year = baseYear; year <= timeHorizon; year++) {
    const yearsSinceStart = year - baseYear;
    cumulative = cumulative * (1 + annualReturn) + monthlySavings * 12;
    const lower = cumulative * (1 - volatility * Math.sqrt(yearsSinceStart + 1));
    const upper = cumulative * (1 + volatility * Math.sqrt(yearsSinceStart + 1));
    const targetProgress = startingAmount + ((goalTarget - startingAmount) / (timeHorizon - baseYear)) * yearsSinceStart;

    data.push({
      year,
      projected: Math.round(cumulative),
      target: Math.round(targetProgress),
      lower: Math.round(Math.max(0, lower)),
      upper: Math.round(upper),
    });
  }

  return data;
}

export function calculateProbability(
  monthlySavings: number,
  timeHorizon: number,
  riskProfile: string
): number {
  const annualReturn = riskMultipliers[riskProfile] || 0.07;
  const years = timeHorizon - 2026;
  const startingAmount = 2000000;
  const goalTarget = 15000000;

  let cumulative = startingAmount;
  for (let i = 0; i < years; i++) {
    cumulative = cumulative * (1 + annualReturn) + monthlySavings * 12;
  }

  const ratio = cumulative / goalTarget;
  const probability = Math.min(99, Math.max(15, Math.round(ratio * 55 + years * 0.8)));
  return probability;
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const riskColors: Record<string, string> = {
  Conservative: "#2E86AB",
  Balanced: "#00A758",
  Growth: "#F59E0B",
  Aggressive: "#D9534F",
};

export interface RiskMetrics {
  volatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export function getGoalRiskMetrics(goal: Goal): RiskMetrics {
  const totalWeight = goal.portfolio.funds.reduce((s, f) => s + f.weight, 0);
  if (totalWeight === 0) return { volatility: 0, maxDrawdown: 0, sharpeRatio: 0 };

  let weightedVol = 0;
  let weightedDrawdown = 0;
  let weightedSharpe = 0;

  for (const fa of goal.portfolio.funds) {
    const fund = getFundById(fa.fundId);
    if (!fund) continue;
    const w = fa.weight / totalWeight;
    weightedVol += fund.volatility * w;
    weightedDrawdown += fund.maxDrawdown * w;
    weightedSharpe += fund.sharpeRatio * w;
  }

  return {
    volatility: Math.round(weightedVol * 100) / 100,
    maxDrawdown: Math.round(weightedDrawdown * 100) / 100,
    sharpeRatio: Math.round(weightedSharpe * 100) / 100,
  };
}

export function getClientRiskMetrics(client: Client): RiskMetrics {
  const totalInvested = client.goals.reduce((s, g) => s + g.portfolio.totalInvested, 0);
  if (totalInvested === 0) return { volatility: 0, maxDrawdown: 0, sharpeRatio: 0 };

  let weightedVol = 0;
  let weightedDrawdown = 0;
  let weightedSharpe = 0;

  for (const goal of client.goals) {
    const goalMetrics = getGoalRiskMetrics(goal);
    const w = goal.portfolio.totalInvested / totalInvested;
    weightedVol += goalMetrics.volatility * w;
    weightedDrawdown += goalMetrics.maxDrawdown * w;
    weightedSharpe += goalMetrics.sharpeRatio * w;
  }

  return {
    volatility: Math.round(weightedVol * 100) / 100,
    maxDrawdown: Math.round(weightedDrawdown * 100) / 100,
    sharpeRatio: Math.round(weightedSharpe * 100) / 100,
  };
}

export function getGoalWeightedReturns(goal: Goal): GoalReturns {
  const totalWeight = goal.portfolio.funds.reduce((s, f) => s + f.weight, 0);
  if (totalWeight === 0) return { ytd: 0, oneYear: 0, threeYear: 0 };

  let wYtd = 0, wOneYear = 0, wThreeYear = 0;
  for (const fa of goal.portfolio.funds) {
    const fund = getFundById(fa.fundId);
    if (!fund) continue;
    const w = fa.weight / totalWeight;
    wYtd += fund.ytdReturn * w;
    wOneYear += parseFloat(fund.returnRate) * w;
    wThreeYear += fund.ytdReturn * 0.85 * w;
  }

  return {
    ytd: Math.round(wYtd * 10) / 10,
    oneYear: Math.round(wOneYear * 10) / 10,
    threeYear: Math.round(wThreeYear * 10) / 10,
  };
}

export function getClientWeightedReturns(client: Client): ClientReturns {
  const totalInvested = client.goals.reduce((s, g) => s + g.portfolio.totalInvested, 0);
  if (totalInvested === 0) return { ytd: 0, oneYear: 0, threeYear: 0 };

  let wYtd = 0, wOneYear = 0, wThreeYear = 0;
  for (const goal of client.goals) {
    const w = goal.portfolio.totalInvested / totalInvested;
    wYtd += goal.returns.ytd * w;
    wOneYear += goal.returns.oneYear * w;
    wThreeYear += goal.returns.threeYear * w;
  }

  return {
    ytd: Math.round(wYtd * 10) / 10,
    oneYear: Math.round(wOneYear * 10) / 10,
    threeYear: Math.round(wThreeYear * 10) / 10,
  };
}
