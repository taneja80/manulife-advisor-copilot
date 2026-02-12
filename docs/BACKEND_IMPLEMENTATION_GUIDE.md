# Manulife Advisor Co-Pilot — Backend Implementation Guide

**Version:** 1.0
**Date:** February 2026
**Target Platform:** Microsoft Azure
**Currency:** Philippine Peso (PHP)
**Locale:** Philippines (en-PH)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Data Model & Entity Definitions](#2-data-model--entity-definitions)
3. [REST API Contracts](#3-rest-api-contracts)
4. [Business Logic & Algorithms](#4-business-logic--algorithms)
5. [AI Copilot Engine](#5-ai-copilot-engine)
6. [Risk Profiling System](#6-risk-profiling-system)
7. [Goal Target Calculator](#7-goal-target-calculator)
8. [Analytics & Computed Metrics](#8-analytics--computed-metrics)
9. [Azure Architecture Recommendations](#9-azure-architecture-recommendations)
10. [Database Schema (SQL)](#10-database-schema-sql)
11. [Security Considerations](#11-security-considerations)
12. [Constants & Configuration](#12-constants--configuration)

---

## 1. System Overview

The Manulife Advisor Co-Pilot is a wealth management dashboard for financial advisors in the Philippines. It provides:

- **Client Management** — CRUD operations for clients and their financial profiles
- **Goal-Based Planning** — 7 goal types with inflation-adjusted target calculations
- **Portfolio Management** — Fund allocation tracking with rebalancing alerts
- **Model Portfolios** — Pre-built portfolio templates by risk profile
- **AI Copilot** — Rule-based advisory engine generating actionable insights
- **Analytics** — Performance tracking, benchmark comparison, fee analysis, contribution tracking

### Architecture Pattern

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│         Charts | Forms | Dashboard | Wizard          │
└─────────────────────┬────────────────────────────────┘
                      │ REST API (JSON)
┌─────────────────────▼────────────────────────────────┐
│                 API Layer (Express/ASP.NET)           │
│         Validation | Auth | Rate Limiting            │
├──────────────────────────────────────────────────────┤
│                  Service Layer                        │
│     Business Logic | Calculations | AI Engine        │
├──────────────────────────────────────────────────────┤
│                  Data Access Layer                    │
│           ORM / Repository Pattern                   │
├──────────────────────────────────────────────────────┤
│               Azure SQL / Cosmos DB                  │
└──────────────────────────────────────────────────────┘
```

---

## 2. Data Model & Entity Definitions

### 2.1 Fund

The master product catalog. Each fund has performance metrics and fee data.

```typescript
interface Fund {
  id: string;                // Primary key (e.g., "f1")
  name: string;              // e.g., "Manulife Global Franchise Fund"
  category: string;          // e.g., "Global Equity", "Philippine Equity", "Money Market", "Balanced", "Real Estate", "Greater China Equity"
  returnRate: string;        // Annualized return as display string (e.g., "12.5%")
  risk: string;              // Risk label: "Low" | "Moderate" | "Moderate-High" | "High"
  allocation: number;        // Default allocation weight (legacy, used in product baskets)
  ytdReturn: number;         // Year-to-date return as numeric (e.g., 12.5)
  expenseRatio: number;      // Annual expense ratio as percentage (e.g., 1.75 means 1.75%)
  volatility: number;        // Annualized volatility (e.g., 14.2)
  maxDrawdown: number;       // Maximum drawdown as negative percentage (e.g., -18.5)
  sharpeRatio: number;       // Risk-adjusted return metric (e.g., 0.88)
}
```

**Seed Data — 6 Manulife Funds:**

| ID | Name | Category | YTD Return | Expense Ratio | Volatility | Max Drawdown | Sharpe |
|----|------|----------|------------|---------------|------------|--------------|--------|
| f1 | Manulife Global Franchise Fund | Global Equity | 12.5% | 1.75% | 14.2 | -18.5% | 0.88 |
| f2 | Manulife Asia Pacific REIT Fund | Real Estate | 7.2% | 1.50% | 11.8 | -15.2% | 0.61 |
| f3 | Manulife Philippine Equity Fund | Philippine Equity | 9.8% | 2.00% | 19.5 | -28.3% | 0.50 |
| f4 | Manulife Dragon Growth Fund | Greater China Equity | 11.3% | 1.85% | 22.1 | -32.6% | 0.51 |
| f5 | Manulife Peso Money Market Fund | Money Market | 3.5% | 0.50% | 1.2 | -0.8% | 2.92 |
| f6 | Manulife Income Builder Fund | Balanced | 6.8% | 1.25% | 8.5 | -12.1% | 0.80 |

### 2.2 Client

```typescript
interface Client {
  id: string;                // Primary key (e.g., "c1")
  name: string;              // Full name (Filipino names)
  age: number;               // Current age
  riskProfile: string;       // "Conservative" | "Balanced" | "Growth" | "Aggressive"
  totalPortfolio: number;    // Total AUM in PHP (includes invested + cash)
  cashHoldings: number;      // Uninvested cash in PHP
  monthlyIncome: number;     // Gross monthly income in PHP
  goals: Goal[];             // Array of financial goals (see 2.4)
  returns: ClientReturns;    // Portfolio-level returns (see 2.3)
  needsAction: boolean;      // Flag: advisor attention required
  actionReason?: string;     // Reason text when needsAction is true
  joinedDate: string;        // ISO date of client onboarding (e.g., "2022-03-15")
}
```

### 2.3 ClientReturns / GoalReturns

```typescript
interface ClientReturns {
  ytd: number;      // Year-to-date return percentage (e.g., 8.3)
  oneYear: number;  // Trailing 1-year return percentage
  threeYear: number; // Trailing 3-year annualized return percentage
}

// Same structure used at goal level
interface GoalReturns {
  ytd: number;
  oneYear: number;
  threeYear: number;
}
```

### 2.4 Goal

Each client has 1+ financial goals. Goals are the core unit of the advisory workflow.

```typescript
interface Goal {
  id: string;                       // Primary key (e.g., "g1")
  name: string;                     // Display name (e.g., "Child's Education (UST Tuition)")
  type: string;                     // Goal type enum (see 2.5)
  targetAmount: number;             // Inflation-adjusted target in PHP
  currentAmount: number;            // Current value in PHP
  targetDate: string;               // Target year as string (e.g., "2032")
  probability: number;              // Goal achievement probability 0-100
  status: "on-track" | "off-track" | "ahead";
  riskProfile: string;              // Goal-level risk: "Conservative" | "Balanced" | "Growth" | "Aggressive"
  portfolio: GoalPortfolio;         // Fund allocations for this goal (see 2.6)
  returns: GoalReturns;             // Goal-level returns
  monthlyContribution: number;      // Monthly DCA contribution in PHP
}
```

### 2.5 Goal Types (7 Types)

| Type ID | Label | Description |
|---------|-------|-------------|
| `retirement` | Retirement | Long-term retirement planning |
| `education` | Children's Education | College/university funding |
| `property` | Buying Property | Real estate down payment |
| `medical` | Medical Emergency | Health emergency fund |
| `growth` | Growth | Aggressive wealth accumulation |
| `saving` | Saving | General savings/emergency fund |
| `miscellaneous` | Miscellaneous | Custom financial goal |

### 2.6 GoalPortfolio & GoalFundAllocation

```typescript
interface GoalPortfolio {
  funds: GoalFundAllocation[];  // Array of fund allocations
  totalInvested: number;        // Sum of all fund amounts in PHP
}

interface GoalFundAllocation {
  fundId: string;   // FK to Fund.id
  weight: number;   // Target allocation weight (0-100, must sum to 100 across goal)
  amount: number;   // Current PHP amount invested in this fund
}
```

**Invariant:** `sum(funds[].weight) == 100` for each goal portfolio.
**Note:** `amount` may drift from `weight * totalInvested / 100` over time due to market movements — this drift triggers rebalancing alerts.

### 2.7 ModelPortfolio

Pre-configured portfolio templates assigned to new clients based on risk assessment.

```typescript
interface ModelPortfolio {
  id: string;                // Primary key (e.g., "mp1")
  name: string;              // Display name (e.g., "Conservative Default")
  riskProfile: "Conservative" | "Moderate" | "Aggressive";
  category: "default" | "low_volatility" | "growth" | "aggressive_growth";
  description: string;       // Text description of strategy
  funds: ModelPortfolioFund[];
}

interface ModelPortfolioFund {
  fundId: string;   // FK to Fund.id
  weight: number;   // Allocation weight 0-100
}
```

**Invariant:** `sum(funds[].weight) == 100` — validated on create/update.

**Seed Data — 6 Default Model Portfolios:**

| ID | Name | Risk Profile | Category | Fund Allocations |
|----|------|-------------|----------|-----------------|
| mp1 | Conservative Default | Conservative | default | f5: 45%, f6: 35%, f2: 20% |
| mp2 | Moderate Default | Moderate | default | f1: 30%, f6: 25%, f2: 25%, f5: 20% |
| mp3 | Aggressive Default | Aggressive | default | f3: 30%, f4: 30%, f1: 25%, f2: 15% |
| mp4 | Conservative Low Volatility | Conservative | low_volatility | f5: 60%, f6: 30%, f2: 10% |
| mp5 | Moderate Growth | Moderate | growth | f1: 35%, f3: 25%, f6: 20%, f2: 20% |
| mp6 | Aggressive Growth | Aggressive | aggressive_growth | f3: 35%, f4: 35%, f1: 30% |

---

## 3. REST API Contracts

### 3.1 Model Portfolios API

#### GET /api/model-portfolios
Returns all model portfolios.

**Response:** `200 OK`
```json
[
  {
    "id": "mp1",
    "name": "Conservative Default",
    "riskProfile": "Conservative",
    "category": "default",
    "description": "Capital preservation with stable income focus...",
    "funds": [
      { "fundId": "f5", "weight": 45 },
      { "fundId": "f6", "weight": 35 },
      { "fundId": "f2", "weight": 20 }
    ]
  }
]
```

#### GET /api/model-portfolios/risk/:riskProfile
Filter model portfolios by risk profile.

**Path Params:** `riskProfile` — "Conservative" | "Moderate" | "Aggressive"
**Response:** `200 OK` — Array of matching ModelPortfolio objects

#### GET /api/model-portfolios/:id
Get a single model portfolio by ID.

**Response:** `200 OK` — Single ModelPortfolio object
**Error:** `404 Not Found` — `{ "message": "Model portfolio not found" }`

#### POST /api/model-portfolios
Create a new model portfolio.

**Request Body:**
```json
{
  "name": "My Custom Portfolio",
  "riskProfile": "Moderate",
  "category": "growth",
  "description": "Custom growth portfolio",
  "funds": [
    { "fundId": "f1", "weight": 50 },
    { "fundId": "f3", "weight": 50 }
  ]
}
```

**Validation Rules:**
1. All fields required (name, riskProfile, category, description, funds)
2. `riskProfile` must be one of: "Conservative", "Moderate", "Aggressive"
3. `category` must be one of: "default", "low_volatility", "growth", "aggressive_growth"
4. `funds[].weight` must be 0-100 per fund
5. **`sum(funds[].weight)` must equal exactly 100** — returns 400 if not

**Response:** `201 Created` — Created ModelPortfolio with generated `id`
**Errors:**
- `400 Bad Request` — `{ "message": "Invalid data", "errors": [...] }` (Zod validation)
- `400 Bad Request` — `{ "message": "Fund weights must sum to 100%" }`

#### PATCH /api/model-portfolios/:id
Update an existing model portfolio (partial update).

**Request Body:** Partial ModelPortfolio fields (any subset)
**Validation:** If `funds` array is provided, weights must sum to 100.
**Response:** `200 OK` — Updated ModelPortfolio
**Error:** `404 Not Found`

#### DELETE /api/model-portfolios/:id
Delete a model portfolio.

**Response:** `200 OK` — `{ "success": true }`
**Error:** `404 Not Found`

### 3.2 Clients API (To Be Implemented)

The prototype uses client-side mock data. For enterprise, implement these endpoints:

#### GET /api/clients
List all clients for the authenticated advisor.

**Query Params:**
- `search` (optional) — Filter by name (case-insensitive partial match)
- `needsAction` (optional) — Boolean filter for clients needing attention

**Response:** `200 OK`
```json
[
  {
    "id": "c1",
    "name": "Maria Santos",
    "age": 35,
    "riskProfile": "Balanced",
    "totalPortfolio": 5200000,
    "cashHoldings": 1300000,
    "monthlyIncome": 120000,
    "needsAction": false,
    "joinedDate": "2022-03-15",
    "returns": { "ytd": 8.3, "oneYear": 10.1, "threeYear": 7.4 },
    "goalCount": 4,
    "totalGoalsOnTrack": 2,
    "totalGoalsOffTrack": 1,
    "totalGoalsAhead": 1
  }
]
```

#### GET /api/clients/:id
Full client detail including all goals and portfolio data.

#### POST /api/clients
Create new client (from Goal Wizard Step 1).

**Request Body:**
```json
{
  "name": "Juan Dela Cruz",
  "age": 30,
  "email": "juan@email.com",
  "phone": "+63 917 123 4567",
  "monthlyIncome": 80000,
  "riskProfile": "Moderate"
}
```

#### POST /api/clients/:id/goals
Add a new goal to an existing client.

**Request Body:**
```json
{
  "name": "Retirement Fund",
  "type": "retirement",
  "targetAmount": 15000000,
  "currentAmount": 500000,
  "targetDate": "2055",
  "riskProfile": "Growth",
  "monthlyContribution": 15000,
  "portfolio": {
    "totalInvested": 500000,
    "funds": [
      { "fundId": "f1", "weight": 35, "amount": 175000 },
      { "fundId": "f3", "weight": 30, "amount": 150000 },
      { "fundId": "f4", "weight": 20, "amount": 100000 },
      { "fundId": "f5", "weight": 15, "amount": 75000 }
    ]
  }
}
```

#### PATCH /api/clients/:id/goals/:goalId/portfolio
Update goal portfolio allocations (from inline Portfolio Editor).

**Validation:** Fund weights must sum to 100%.

### 3.3 Analytics API (To Be Implemented)

#### GET /api/clients/:id/fund-exposure
Returns aggregated fund exposure across all goals. See [Section 8.1](#81-fund-exposure-aggregation).

#### GET /api/clients/:id/fee-analysis
Returns fee impact analysis. See [Section 8.2](#82-fee-impact-analysis).

#### GET /api/clients/:id/portfolio-drift
Returns portfolio drift from recommended model portfolio. See [Section 8.3](#83-portfolio-drift-from-model).

#### GET /api/clients/:id/performance-history
Returns monthly performance points. See [Section 8.4](#84-performance-history-generation).

#### GET /api/clients/:id/benchmark-comparison
Returns benchmark comparison data. See [Section 8.5](#85-benchmark-comparison).

#### GET /api/clients/:id/insights
Returns AI Copilot insights. See [Section 5](#5-ai-copilot-engine).

---

## 4. Business Logic & Algorithms

### 4.1 Weighted Risk Metrics Aggregation

Risk metrics roll up from fund level to goal level to client level using investment-weighted averages.

#### Goal-Level Risk Metrics

```
For each goal:
  totalWeight = sum(goal.portfolio.funds[].weight)
  
  For each fund allocation in goal:
    w = fundAllocation.weight / totalWeight
    weightedVolatility    += fund.volatility    * w
    weightedMaxDrawdown   += fund.maxDrawdown   * w
    weightedSharpeRatio   += fund.sharpeRatio   * w
  
  Result: { volatility, maxDrawdown, sharpeRatio } (rounded to 2 decimal places)
```

#### Client-Level Risk Metrics

```
totalInvested = sum(client.goals[].portfolio.totalInvested)

For each goal:
  goalMetrics = calculateGoalRiskMetrics(goal)
  w = goal.portfolio.totalInvested / totalInvested
  
  clientVolatility    += goalMetrics.volatility    * w
  clientMaxDrawdown   += goalMetrics.maxDrawdown   * w
  clientSharpeRatio   += goalMetrics.sharpeRatio   * w

Result: { volatility, maxDrawdown, sharpeRatio } (rounded to 2 decimal places)
```

### 4.2 Weighted Returns Calculation

#### Goal-Level Weighted Returns

```
For each goal:
  totalWeight = sum(goal.portfolio.funds[].weight)
  
  For each fund allocation:
    w = fundAllocation.weight / totalWeight
    weightedYtd      += fund.ytdReturn                * w
    weightedOneYear   += parseFloat(fund.returnRate)   * w    // Uses annualized returnRate
    weightedThreeYear += fund.ytdReturn * 0.85         * w    // Approximation: 85% of YTD

  Result: { ytd, oneYear, threeYear } (rounded to 1 decimal place)
```

#### Client-Level Weighted Returns

```
totalInvested = sum(client.goals[].portfolio.totalInvested)

For each goal:
  w = goal.portfolio.totalInvested / totalInvested
  clientYtd       += goal.returns.ytd       * w
  clientOneYear   += goal.returns.oneYear   * w
  clientThreeYear += goal.returns.threeYear * w

Result: { ytd, oneYear, threeYear } (rounded to 1 decimal place)
```

### 4.3 Goal Projection (Monte Carlo Simplified)

Projects future value of goal with confidence bands.

```
Parameters:
  monthlySavings: number    // Monthly DCA amount
  timeHorizon: number       // Target year
  riskProfile: string       // Determines base return

Risk Return Multipliers:
  Conservative: 4% annual
  Balanced:     7% annual
  Growth:      10% annual
  Aggressive:  14% annual

Volatility = annualReturn * 0.30

Algorithm:
  startingAmount = currentAmount (or 2,000,000 for simulator default)
  goalTarget = targetAmount (or 15,000,000 for simulator default)
  
  For each year from baseYear (2026) to timeHorizon:
    yearsSinceStart = year - baseYear
    cumulative = cumulative * (1 + annualReturn) + monthlySavings * 12
    lower = cumulative * (1 - volatility * sqrt(yearsSinceStart + 1))
    upper = cumulative * (1 + volatility * sqrt(yearsSinceStart + 1))
    targetProgress = startingAmount + ((goalTarget - startingAmount) / (timeHorizon - baseYear)) * yearsSinceStart
    
    Output per year: { year, projected, target, lower, upper }
```

### 4.4 Probability Calculation

```
annualReturn = riskMultipliers[riskProfile]
years = timeHorizon - 2026

cumulative = startingAmount
For each year:
  cumulative = cumulative * (1 + annualReturn) + monthlySavings * 12

ratio = cumulative / goalTarget
probability = min(99, max(15, round(ratio * 55 + years * 0.8)))
```

### 4.5 PHP Currency Formatting

```
Format: Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0, maximumFractionDigits: 0 })
Example output: "₱5,200,000"
```

---

## 5. AI Copilot Engine

The AI Copilot generates rule-based insights organized into three categories. This is a deterministic engine, not an LLM — implement as a service with configurable rules.

### 5.1 Insight Data Structure

```typescript
interface Insight {
  id: string;
  severity: "critical" | "warning" | "info" | "success";
  category: "action" | "performance" | "talking-point";
  title: string;
  message: string;
}
```

### 5.2 Priority Action Rules

#### Rule 1: Off-Track Goal Alert (severity: critical)
```
Trigger: goal.status === "off-track"

For each off-track goal:
  gap = goal.targetAmount - goal.currentAmount
  yearsLeft = parseInt(goal.targetDate) - currentYear
  additionalMonthly = (gap / (yearsLeft * 12)) - goal.monthlyContribution

  If additionalMonthly > 0:
    Message: "Increase monthly contribution by {additionalMonthly} or extend target to improve {probability}% probability."
  Else:
    Message: "Review allocation - current {riskProfile} profile may need adjustment to reach {targetAmount} by {targetDate}."
```

#### Rule 2: Excess Cash Holdings (severity: warning)
```
Trigger: (client.cashHoldings / client.totalPortfolio) * 100 > 20

cashPercentage = (cashHoldings / totalPortfolio) * 100
annualErosion = cashHoldings * 0.053   // BSP inflation rate

Message: "{cashPercentage}% ({cashHoldings}) in cash. BSP inflation at 5.3% erodes {annualErosion}/yr in purchasing power. Deploy via DCA."
```

#### Rule 3: Risk-Age Mismatch (severity: warning)
```
Trigger: client.riskProfile === "Aggressive" AND client.age > 50

Message: "At age {age}, aggressive allocation carries higher sequence-of-returns risk. Suggest transitioning 30-40% to balanced/conservative funds."
```

#### Rule 4: Concentration Risk (severity: warning)
```
Compute fund exposure across all goals:
  For each goal → for each fund allocation → aggregate amount by fundId
  
Find max single-fund exposure:
  maxFundAmount = max(aggregatedAmounts)
  totalInvested = sum(all goal portfolio totalInvested)

Trigger: maxFundAmount / totalInvested > 0.35

Message: "{percentage}% of portfolio concentrated in a single fund. Consider diversifying across more asset classes."
```

### 5.3 Performance Insights

#### Rule 5: Portfolio Performance vs Inflation (severity: success if YTD > 7%, else info)
```
weightedReturn = sum(goal.returns.ytd * (goal.portfolio.totalInvested / totalInvested))

If weightedReturn > 5.3 (BSP inflation):
  Message: "YTD weighted return: +{return}%. Outpacing BSP inflation (5.3%) by {delta}pp - real returns are positive."
Else:
  Message: "YTD weighted return: +{return}%. Below BSP inflation (5.3%) - consider increasing equity exposure to preserve purchasing power."
```

#### Rule 6: Ahead-of-Schedule Goals (severity: success)
```
Trigger: any goals with status === "ahead"

Message: "{goalNames}. Consider de-risking or redirecting surplus contributions to off-track goals."
```

#### Rule 7: Strong Overall Position (severity: success)
```
avgProbability = avg(client.goals[].probability)

Trigger: avgProbability >= 75 AND offTrackGoals.count === 0

Message: "Average goal probability at {avgProb}%. All goals on track or ahead. Maintain current strategy."
```

### 5.4 Meeting Talking Points

#### Rule 8: Inflation Talking Point (always generated)
```
Message: "BSP inflation at 5.3%. {clientName}'s goals need real returns above this threshold. Show how DCA and equity allocation protect against inflation erosion."
```

#### Rule 9: DCA Opportunity (always generated)
```
totalMonthly = sum(client.goals[].monthlyContribution)

Message: "Current monthly commitment: {totalMonthly}. Peso-cost averaging reduces drawdown risk by ~30%. Ideal for volatile PH equity positions."
```

#### Rule 10: Retirement Planning (conditional)
```
Trigger: client has a goal with type === "retirement"

retirementGoal = first goal of type "retirement"
retAge = parseInt(retirementGoal.targetDate) - (currentYear - client.age)

If retirementGoal.probability >= 75:
  Message: "Planned retirement at age ~{retAge}. On track - discuss lifestyle expectations and income replacement ratio (target: 70-80% of current income)."
Else:
  Message: "Planned retirement at age ~{retAge}. Needs attention - discuss lifestyle expectations and income replacement ratio (target: 70-80% of current income)."
```

---

## 6. Risk Profiling System

### 6.1 Questionnaire (6 Questions)

Each question has 3 options scored 1 (conservative) to 3 (aggressive).

| # | Question | Option A (Score: 1) | Option B (Score: 2) | Option C (Score: 3) |
|---|----------|--------------------|--------------------|---------------------|
| 1 | How would you describe your investment experience? | I'm new to investing and prefer guided options | I have some experience with mutual funds and stocks | I actively manage investments and understand market risks |
| 2 | If your portfolio dropped 20% in one month, what would you do? | Sell everything to prevent further losses | Hold steady and wait for recovery | Invest more to take advantage of lower prices |
| 3 | What is your primary investment goal? | Preserve my capital and earn stable returns | Grow my wealth steadily over time | Maximize returns even if it means higher risk |
| 4 | How long do you plan to keep your money invested? | Less than 3 years | 3 to 7 years | More than 7 years |
| 5 | What percentage of your monthly income can you set aside for investments? | Less than 10% - I need most of my income for expenses | 10-25% - I can comfortably save a portion | More than 25% - I have significant disposable income |
| 6 | How do you feel about investments that fluctuate in value? | I prefer stability even if returns are lower | I can accept some ups and downs for better returns | I'm comfortable with significant swings for potentially high returns |

### 6.2 Scoring Algorithm

```
totalScore = sum of all 6 question scores (range: 6-18)
maxScore = 18

Mapping:
  Score  6-10  → Conservative
  Score 11-14  → Moderate
  Score 15-18  → Aggressive
```

### 6.3 Profile Descriptions

| Profile | Description |
|---------|-------------|
| Conservative | Focuses on capital preservation with lower-risk investments. Suitable for clients who prioritize stability and have shorter time horizons. |
| Moderate | Balances growth and stability with a diversified mix of asset classes. Good for medium-term goals with moderate risk tolerance. |
| Aggressive | Targets maximum growth through higher equity exposure. Best for long-term investors comfortable with market volatility. |

### 6.4 Auto-Assignment Flow

After risk profiling, the system:
1. Determines risk profile from score
2. Calls `GET /api/model-portfolios/risk/{riskProfile}`
3. Assigns the "default" category portfolio to the new client's first goal
4. Portfolio funds and weights come from the model portfolio template

---

## 7. Goal Target Calculator

All targets are inflation-adjusted using the BSP inflation rate of **5.3%**.

### 7.1 Inflation Formula

```
inflatedAmount = baseAmount * (1 + 0.053) ^ years
```

### 7.2 Target Calculation by Goal Type

#### Retirement
```
Inputs:
  currentAge: number (20-65)
  retireAge: number (45-70)
  monthlyExpense: number (₱20,000-₱500,000)
  pensionIncome: number (₱0-₱50,000)

Calculation:
  yearsToRetire = retireAge - currentAge
  retirementYears = 25 (assumed post-retirement period)
  monthlyGap = monthlyExpense - pensionIncome
  baseTarget = monthlyGap * 12 * retirementYears
  inflatedTarget = baseTarget * (1.053 ^ yearsToRetire)
```

#### Education
```
Inputs:
  childAge: number (0-17)
  collegeAge: number (16-20)
  schoolType: "public" | "private" | "international"
  yearsOfStudy: number (2-8)

Annual Tuition Rates:
  public:        ₱80,000/year
  private:       ₱250,000/year
  international: ₱800,000/year

Living Expenses:
  international: ₱600,000/year
  others:        ₱180,000/year

Calculation:
  yearsUntilCollege = collegeAge - childAge
  annualCost = annualTuition + livingExpenses
  baseTarget = annualCost * yearsOfStudy
  inflatedTarget = baseTarget * (1.053 ^ yearsUntilCollege)
```

#### Property
```
Inputs:
  propertyType: "condo_studio" | "condo_family" | "townhouse" | "house_lot"
  location: "metro_manila" | "nearby_provinces" | "cebu_davao" | "provincial"
  yearsToTarget: number (1-20)

Base Prices (Metro Manila):
  condo_studio:  ₱3,500,000
  condo_family:  ₱7,000,000
  townhouse:     ₱5,500,000
  house_lot:     ₱12,000,000

Location Multipliers:
  metro_manila:     1.0x
  nearby_provinces: Specific per-type lower values (see data)
  cebu_davao:       0.8x of Metro Manila
  provincial:       0.5x of Metro Manila

Calculation:
  adjustedPrice = basePrice * locationMultiplier
  downPayment = adjustedPrice * 0.20   // 20% down payment
  inflatedTarget = downPayment * (1.053 ^ yearsToTarget)
```

#### Medical Emergency
```
Inputs:
  familyMembers: number (1-10)
  monthlyIncome: number (₱20,000-₱1,000,000)
  coverageMonths: number (3-24)

Calculation:
  baseEmergency = monthlyIncome * coverageMonths
  medicalBuffer = familyMembers * ₱100,000
  baseTarget = baseEmergency + medicalBuffer
  inflatedTarget = baseTarget * (1.053 ^ 2)   // Default 2 years
```

#### Growth
```
Inputs:
  currentSavings: number (₱0-₱50,000,000)
  targetMultiplier: 2 | 3 | 5 | 10
  yearsToGrow: number (3-30)

Calculation:
  baseTarget = currentSavings * targetMultiplier
  inflatedTarget = baseTarget * (1.053 ^ yearsToGrow)
```

#### Saving
```
Inputs:
  monthlyIncome: number (₱15,000-₱1,000,000)
  savingsTarget: number (3-36 months)
  savingsRate: number (5-50%)

Calculation:
  baseTarget = monthlyIncome * savingsTarget
  inflatedTarget = baseTarget * (1.053 ^ 3)   // Default 3 years
```

#### Miscellaneous
```
Inputs:
  estimatedCost: number (₱50,000-₱50,000,000)
  yearsToTarget: number (1-30)

Calculation:
  inflatedTarget = estimatedCost * (1.053 ^ yearsToTarget)
```

---

## 8. Analytics & Computed Metrics

### 8.1 Fund Exposure Aggregation

Aggregates fund allocation amounts across all client goals to show total portfolio composition.

```
Algorithm:
  1. Initialize fundMap: Map<fundId, totalAmount>
  2. For each goal → for each fundAllocation:
       fundMap[fundId] += fundAllocation.amount
  3. totalInvested = sum(fundMap.values)
  4. For each entry in fundMap:
       weight = (amount / totalInvested) * 100
       Lookup fund metadata (name, category, expenseRatio)
  5. Sort by weight descending
```

**Output:**
```typescript
interface FundExposure {
  fundId: string;
  fundName: string;
  category: string;
  totalAmount: number;     // Total PHP invested across all goals
  weight: number;          // Percentage of total portfolio (rounded to 1 decimal)
  expenseRatio: number;
}
```

### 8.2 Fee Impact Analysis

Calculates weighted expense ratio and fee drag projection.

```
Algorithm:
  1. Get fund exposure (from 8.1)
  2. weightedER = sum(exposure[i].expenseRatio * (exposure[i].amount / totalInvested))
  3. annualFeeCost = totalInvested * (weightedER / 100)
  4. monthlyFeeCost = annualFeeCost / 12
  5. tenYearFeeDrag = annualFeeCost * 10 * 1.5   // 1.5x multiplier for compounding effect

Per-fund breakdown:
  annualCost = fundAmount * (expenseRatio / 100)
```

**Output:**
```typescript
interface FeeAnalysis {
  totalInvested: number;
  weightedExpenseRatio: number;   // Percentage (e.g., 1.52)
  annualFeeCost: number;          // PHP
  monthlyFeeCost: number;         // PHP
  tenYearFeeDrag: number;         // PHP (projected cumulative fee impact)
  feeBreakdown: {
    fundName: string;
    weight: number;
    expenseRatio: number;
    annualCost: number;
  }[];
}
```

### 8.3 Portfolio Drift from Model

Compares client's actual aggregated fund allocation across all goals against the model portfolio recommended for their risk profile. This is a holistic, strategic view of portfolio alignment.

**Risk Profile to Model Portfolio Mapping:**
```
Client Risk Profile  →  Model Portfolio Profile
Conservative         →  Conservative
Balanced             →  Moderate
Moderate             →  Moderate
Growth               →  Moderate
Aggressive           →  Aggressive
```

```
Algorithm:
  1. Map client.riskProfile to model portfolio profile using mapping above
  2. Look up the "default" category model portfolio for that profile
  3. Get client's actual fund exposure (aggregated across all goals, see 8.1)
  4. Build union of all fund IDs (from both actual and model)
  5. For each fund:
       actualWeight = client's actual aggregated weight (0 if fund not held)
       modelWeight  = model portfolio target weight (0 if fund not in model)
       drift = actualWeight - modelWeight
       direction = abs(drift) < 1 ? "match" : drift > 0 ? "over" : "under"
  6. overallDrift = sum(abs(drift)) / 2   // Halved because over+under cancel out
  7. Status thresholds:
       overallDrift ≤ 5%  → "aligned"
       overallDrift ≤ 15% → "minor-drift"
       overallDrift > 15% → "significant-drift"
  8. Sort fund drifts by abs(drift) descending
```

**Output:**
```typescript
interface PortfolioDriftFund {
  fundId: string;
  fundName: string;
  category: string;
  actualWeight: number;     // Client's actual allocation percentage
  modelWeight: number;      // Model portfolio target percentage
  drift: number;            // Signed difference (positive = overweight vs model)
  direction: "over" | "under" | "match";  // "match" when abs(drift) < 1%
}

interface PortfolioDrift {
  modelName: string;              // e.g., "Moderate Default"
  modelRiskProfile: string;       // e.g., "Moderate"
  overallDrift: number;           // Overall drift score (0-100%)
  status: "aligned" | "minor-drift" | "significant-drift";
  fundDrifts: PortfolioDriftFund[];  // Per-fund breakdown sorted by drift magnitude
}
```

### 8.4 Performance History Generation

Generates monthly indexed performance data points comparing portfolio vs benchmarks.

```
Benchmarks:
  PSEi Annual Return: 9.2% (Philippine Stock Exchange Index)
  Balanced Fund Annual Return: 6.8%

Algorithm:
  annualReturn = client.returns.ytd / 100
  monthlyReturn = annualReturn / 12
  pseiMonthly = 0.092 / 12
  balancedMonthly = 0.068 / 12

  // Determine time range
  joinDate = client.joinedDate
  monthsTotal = months between joinDate and current date
  monthsToShow = min(monthsTotal, 36)   // Cap at 36 months

  // Initialize at 100 (indexed)
  portfolioVal = 100
  benchmarkVal = 100
  balancedVal = 100

  // Deterministic noise seed from client ID for reproducibility
  seed = client.id.charCodeAt(1) * 17

  For month i = 0 to monthsToShow:
    noise1 = sin(seed + i * 0.7) * 0.008         // Portfolio noise
    noise2 = sin(seed + i * 1.3 + 2) * 0.012     // PSEi noise
    noise3 = sin(seed + i * 0.9 + 4) * 0.006     // Balanced noise

    If i > 0:
      portfolioVal *= (1 + monthlyReturn + noise1)
      benchmarkVal *= (1 + pseiMonthly + noise2)
      balancedVal  *= (1 + balancedMonthly + noise3)

    Add point: { date, month, portfolio, benchmark, balanced }
    // date format: "YYYY-MM"
    // month format: "Mon YY" (e.g., "Jan 26")
    // values rounded to 2 decimal places
```

**Output:**
```typescript
interface PerformancePoint {
  date: string;       // "2024-03"
  month: string;      // "Mar 24"
  portfolio: number;  // Indexed value (starts at 100)
  benchmark: number;  // PSEi indexed value
  balanced: number;   // Balanced benchmark indexed value
}
```

**Note for Enterprise:** In production, replace with actual NAV (Net Asset Value) data from the fund pricing service. The prototype uses deterministic simulation.

### 8.5 Benchmark Comparison

Compares client YTD return against market benchmarks.

```
PSEi YTD: 9.2%
Balanced Fund YTD: 6.8%

Output:
  clientYtd: client.returns.ytd
  pseiYtd: 9.2
  balancedYtd: 6.8
  vsIndex: clientYtd - pseiYtd        // Positive = outperforms
  vsBalanced: clientYtd - balancedYtd
  outperformsIndex: clientYtd > pseiYtd
  outperformsBalanced: clientYtd > balancedYtd
```

**Output:**
```typescript
interface BenchmarkComparison {
  clientYtd: number;
  pseiYtd: number;
  balancedYtd: number;
  vsIndex: number;           // Difference in percentage points
  vsBalanced: number;
  outperformsIndex: boolean;
  outperformsBalanced: boolean;
}
```

### 8.6 Contribution Tracking

Track DCA (Dollar/Peso Cost Averaging) metrics per client.

```
Algorithm:
  totalMonthly = sum(client.goals[].monthlyContribution)
  totalAnnual = totalMonthly * 12
  totalInvested = sum(client.goals[].portfolio.totalInvested)
  dcaToIncomeRatio = (totalMonthly / client.monthlyIncome) * 100

Per-goal breakdown:
  For each goal:
    monthlyContribution
    totalInvested = goal.portfolio.totalInvested
    progress = (goal.currentAmount / goal.targetAmount) * 100
```

---

## 9. Azure Architecture Recommendations

### 9.1 Recommended Azure Services

| Component | Azure Service | SKU/Tier |
|-----------|--------------|----------|
| **API Backend** | Azure App Service or Azure Container Apps | Standard S1+ (App Service) or Consumption (Container Apps) |
| **Database** | Azure SQL Database | Standard S2 or General Purpose |
| **Authentication** | Azure AD B2C or Azure AD | Standard |
| **API Gateway** | Azure API Management | Developer or Basic |
| **Caching** | Azure Cache for Redis | Basic C0 |
| **File Storage** | Azure Blob Storage | Standard LRS |
| **Monitoring** | Azure Application Insights | Pay-as-you-go |
| **Key Vault** | Azure Key Vault | Standard |
| **CDN** | Azure CDN | Standard Microsoft |
| **CI/CD** | Azure DevOps Pipelines | Basic |

### 9.2 Architecture Diagram

```
                    ┌─────────────────┐
                    │   Azure CDN     │
                    │  (Static React) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  API Management │
                    │   (Gateway)     │
                    └────────┬────────┘
                             │
              ┌──────────────▼──────────────┐
              │    Azure App Service         │
              │    (Node.js / .NET API)      │
              │  ┌────────────────────────┐  │
              │  │ Service Layer          │  │
              │  │ - Client Service       │  │
              │  │ - Goal Service         │  │
              │  │ - Portfolio Service    │  │
              │  │ - Analytics Service   │  │
              │  │ - AI Copilot Engine   │  │
              │  │ - Risk Profiler       │  │
              │  └────────────────────────┘  │
              └──────────┬──────────┬────────┘
                         │          │
              ┌──────────▼──┐  ┌───▼──────────┐
              │  Azure SQL  │  │ Azure Cache  │
              │  Database   │  │ for Redis    │
              └─────────────┘  └──────────────┘
```

### 9.3 Environment Configuration

```
# Azure SQL Connection
DB_HOST=your-server.database.windows.net
DB_PORT=1433
DB_NAME=manulife_advisor_copilot
DB_USER=app_user
DB_PASSWORD=<from Key Vault>

# Application Settings
BSP_INFLATION_RATE=0.053
PSEI_YTD_RETURN=9.2
BALANCED_YTD_RETURN=6.8
REBALANCE_DRIFT_THRESHOLD=5
CASH_DRAG_THRESHOLD=20
CONCENTRATION_RISK_THRESHOLD=35
RISK_AGE_MISMATCH_AGE=50

# Azure AD B2C
AZURE_AD_TENANT_ID=<tenant-id>
AZURE_AD_CLIENT_ID=<client-id>
AZURE_AD_CLIENT_SECRET=<from Key Vault>
```

### 9.4 Caching Strategy

| Data | Cache TTL | Invalidation |
|------|-----------|-------------|
| Fund master data | 24 hours | On fund data update |
| Model portfolios | 1 hour | On CRUD operations |
| Client list | 5 minutes | On client update |
| Client detail + goals | 2 minutes | On goal/portfolio update |
| Analytics computations | 5 minutes | On portfolio change |
| Benchmark data | 24 hours | Daily refresh |

---

## 10. Database Schema (SQL)

### Azure SQL / SQL Server Schema

```sql
-- =============================================
-- FUND MASTER TABLE
-- =============================================
CREATE TABLE Funds (
    Id              NVARCHAR(50)    PRIMARY KEY,
    Name            NVARCHAR(200)   NOT NULL,
    Category        NVARCHAR(100)   NOT NULL,
    ReturnRate      NVARCHAR(20)    NOT NULL,       -- Display string e.g. "12.5%"
    Risk            NVARCHAR(50)    NOT NULL,        -- "Low", "Moderate", "High"
    YtdReturn       DECIMAL(8,2)    NOT NULL,        -- e.g. 12.50
    ExpenseRatio    DECIMAL(5,2)    NOT NULL,        -- e.g. 1.75
    Volatility      DECIMAL(8,2)    NOT NULL,        -- e.g. 14.20
    MaxDrawdown     DECIMAL(8,2)    NOT NULL,        -- e.g. -18.50
    SharpeRatio     DECIMAL(5,2)    NOT NULL,        -- e.g. 0.88
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- ADVISOR TABLE
-- =============================================
CREATE TABLE Advisors (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AzureAdObjectId NVARCHAR(100)   NOT NULL UNIQUE,  -- Azure AD B2C object ID
    Name            NVARCHAR(200)   NOT NULL,
    Email           NVARCHAR(200)   NOT NULL,
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- CLIENT TABLE
-- =============================================
CREATE TABLE Clients (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AdvisorId       UNIQUEIDENTIFIER NOT NULL REFERENCES Advisors(Id),
    Name            NVARCHAR(200)   NOT NULL,
    Age             INT             NOT NULL,
    Email           NVARCHAR(200)   NULL,
    Phone           NVARCHAR(50)    NULL,
    RiskProfile     NVARCHAR(50)    NOT NULL,         -- "Conservative", "Balanced", "Growth", "Aggressive"
    TotalPortfolio  DECIMAL(18,2)   NOT NULL DEFAULT 0,
    CashHoldings    DECIMAL(18,2)   NOT NULL DEFAULT 0,
    MonthlyIncome   DECIMAL(18,2)   NOT NULL DEFAULT 0,
    NeedsAction     BIT             NOT NULL DEFAULT 0,
    ActionReason    NVARCHAR(500)   NULL,
    JoinedDate      DATE            NOT NULL DEFAULT GETUTCDATE(),
    -- Denormalized returns (updated by batch job or on portfolio change)
    YtdReturn       DECIMAL(8,2)    NOT NULL DEFAULT 0,
    OneYearReturn   DECIMAL(8,2)    NOT NULL DEFAULT 0,
    ThreeYearReturn DECIMAL(8,2)    NOT NULL DEFAULT 0,
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Clients_AdvisorId ON Clients(AdvisorId);
CREATE INDEX IX_Clients_NeedsAction ON Clients(AdvisorId, NeedsAction) WHERE NeedsAction = 1;

-- =============================================
-- GOAL TABLE
-- =============================================
CREATE TABLE Goals (
    Id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ClientId            UNIQUEIDENTIFIER NOT NULL REFERENCES Clients(Id) ON DELETE CASCADE,
    Name                NVARCHAR(200)   NOT NULL,
    Type                NVARCHAR(50)    NOT NULL,       -- "retirement", "education", "property", "medical", "growth", "saving", "miscellaneous"
    TargetAmount        DECIMAL(18,2)   NOT NULL,
    CurrentAmount       DECIMAL(18,2)   NOT NULL DEFAULT 0,
    TargetDate          NVARCHAR(10)    NOT NULL,        -- Year string e.g. "2032"
    Probability         INT             NOT NULL DEFAULT 50,
    Status              NVARCHAR(20)    NOT NULL DEFAULT 'on-track',  -- "on-track", "off-track", "ahead"
    RiskProfile         NVARCHAR(50)    NOT NULL,
    MonthlyContribution DECIMAL(18,2)   NOT NULL DEFAULT 0,
    TotalInvested       DECIMAL(18,2)   NOT NULL DEFAULT 0,
    -- Denormalized returns
    YtdReturn           DECIMAL(8,2)    NOT NULL DEFAULT 0,
    OneYearReturn       DECIMAL(8,2)    NOT NULL DEFAULT 0,
    ThreeYearReturn     DECIMAL(8,2)    NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Goals_ClientId ON Goals(ClientId);
CREATE INDEX IX_Goals_Status ON Goals(ClientId, Status);

-- =============================================
-- GOAL FUND ALLOCATION TABLE
-- =============================================
CREATE TABLE GoalFundAllocations (
    Id          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    GoalId      UNIQUEIDENTIFIER NOT NULL REFERENCES Goals(Id) ON DELETE CASCADE,
    FundId      NVARCHAR(50)    NOT NULL REFERENCES Funds(Id),
    Weight      DECIMAL(5,2)    NOT NULL,       -- Target weight 0-100
    Amount      DECIMAL(18,2)   NOT NULL,       -- Current PHP amount
    CreatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_GoalFund UNIQUE (GoalId, FundId),
    CONSTRAINT CK_Weight CHECK (Weight >= 0 AND Weight <= 100)
);

CREATE INDEX IX_GoalFundAllocations_GoalId ON GoalFundAllocations(GoalId);
CREATE INDEX IX_GoalFundAllocations_FundId ON GoalFundAllocations(FundId);

-- =============================================
-- MODEL PORTFOLIO TABLE
-- =============================================
CREATE TABLE ModelPortfolios (
    Id          NVARCHAR(50)    PRIMARY KEY,
    Name        NVARCHAR(200)   NOT NULL,
    RiskProfile NVARCHAR(50)    NOT NULL,         -- "Conservative", "Moderate", "Aggressive"
    Category    NVARCHAR(50)    NOT NULL,          -- "default", "low_volatility", "growth", "aggressive_growth"
    Description NVARCHAR(1000)  NOT NULL,
    IsActive    BIT             NOT NULL DEFAULT 1,
    CreatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT CK_RiskProfile CHECK (RiskProfile IN ('Conservative', 'Moderate', 'Aggressive')),
    CONSTRAINT CK_Category CHECK (Category IN ('default', 'low_volatility', 'growth', 'aggressive_growth'))
);

-- =============================================
-- MODEL PORTFOLIO FUND TABLE
-- =============================================
CREATE TABLE ModelPortfolioFunds (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PortfolioId     NVARCHAR(50)    NOT NULL REFERENCES ModelPortfolios(Id) ON DELETE CASCADE,
    FundId          NVARCHAR(50)    NOT NULL REFERENCES Funds(Id),
    Weight          DECIMAL(5,2)    NOT NULL,

    CONSTRAINT UQ_PortfolioFund UNIQUE (PortfolioId, FundId),
    CONSTRAINT CK_MPWeight CHECK (Weight >= 0 AND Weight <= 100)
);

-- =============================================
-- RISK ASSESSMENT TABLE
-- =============================================
CREATE TABLE RiskAssessments (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ClientId        UNIQUEIDENTIFIER NOT NULL REFERENCES Clients(Id),
    Q1Score         INT NOT NULL CHECK (Q1Score BETWEEN 1 AND 3),
    Q2Score         INT NOT NULL CHECK (Q2Score BETWEEN 1 AND 3),
    Q3Score         INT NOT NULL CHECK (Q3Score BETWEEN 1 AND 3),
    Q4Score         INT NOT NULL CHECK (Q4Score BETWEEN 1 AND 3),
    Q5Score         INT NOT NULL CHECK (Q5Score BETWEEN 1 AND 3),
    Q6Score         INT NOT NULL CHECK (Q6Score BETWEEN 1 AND 3),
    TotalScore      INT NOT NULL,      -- Computed: sum of Q1-Q6
    ResultProfile   NVARCHAR(50) NOT NULL,  -- "Conservative", "Moderate", "Aggressive"
    AssessedAt      DATETIME2   NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_RiskAssessments_ClientId ON RiskAssessments(ClientId);

-- =============================================
-- PERFORMANCE HISTORY TABLE (for real NAV data)
-- =============================================
CREATE TABLE PerformanceHistory (
    Id          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ClientId    UNIQUEIDENTIFIER NOT NULL REFERENCES Clients(Id),
    RecordDate  DATE            NOT NULL,
    PortfolioValue DECIMAL(18,2) NOT NULL,    -- Indexed value or actual NAV
    PseiBenchmark  DECIMAL(18,2) NOT NULL,
    BalancedBenchmark DECIMAL(18,2) NOT NULL,

    CONSTRAINT UQ_ClientDate UNIQUE (ClientId, RecordDate)
);

CREATE INDEX IX_PerfHistory_ClientId ON PerformanceHistory(ClientId, RecordDate);
```

### Seed Data Script

```sql
-- Insert default funds
INSERT INTO Funds (Id, Name, Category, ReturnRate, Risk, YtdReturn, ExpenseRatio, Volatility, MaxDrawdown, SharpeRatio)
VALUES
('f1', 'Manulife Global Franchise Fund', 'Global Equity', '12.5%', 'Moderate-High', 12.5, 1.75, 14.2, -18.5, 0.88),
('f2', 'Manulife Asia Pacific REIT Fund', 'Real Estate', '7.2%', 'Moderate', 7.2, 1.50, 11.8, -15.2, 0.61),
('f3', 'Manulife Philippine Equity Fund', 'Philippine Equity', '9.8%', 'High', 9.8, 2.00, 19.5, -28.3, 0.50),
('f4', 'Manulife Dragon Growth Fund', 'Greater China Equity', '11.3%', 'High', 11.3, 1.85, 22.1, -32.6, 0.51),
('f5', 'Manulife Peso Money Market Fund', 'Money Market', '3.5%', 'Low', 3.5, 0.50, 1.2, -0.8, 2.92),
('f6', 'Manulife Income Builder Fund', 'Balanced', '6.8%', 'Moderate', 6.8, 1.25, 8.5, -12.1, 0.80);

-- Insert default model portfolios
INSERT INTO ModelPortfolios (Id, Name, RiskProfile, Category, Description)
VALUES
('mp1', 'Conservative Default', 'Conservative', 'default', 'Capital preservation with stable income focus. Heavy allocation to money market and balanced funds.'),
('mp2', 'Moderate Default', 'Moderate', 'default', 'Balanced growth and income. Mix of equity, balanced, and fixed income funds.'),
('mp3', 'Aggressive Default', 'Aggressive', 'default', 'Maximum growth potential. Heavy equity allocation across global and Philippine markets.'),
('mp4', 'Conservative Low Volatility', 'Conservative', 'low_volatility', 'Ultra-low volatility with money market dominance for near-term goals.'),
('mp5', 'Moderate Growth', 'Moderate', 'growth', 'Growth-tilted moderate portfolio with higher equity exposure.'),
('mp6', 'Aggressive Growth', 'Aggressive', 'aggressive_growth', 'Concentrated high-growth equity portfolio for long-term wealth accumulation.');

-- Insert model portfolio fund allocations
INSERT INTO ModelPortfolioFunds (PortfolioId, FundId, Weight) VALUES
('mp1', 'f5', 45), ('mp1', 'f6', 35), ('mp1', 'f2', 20),
('mp2', 'f1', 30), ('mp2', 'f6', 25), ('mp2', 'f2', 25), ('mp2', 'f5', 20),
('mp3', 'f3', 30), ('mp3', 'f4', 30), ('mp3', 'f1', 25), ('mp3', 'f2', 15),
('mp4', 'f5', 60), ('mp4', 'f6', 30), ('mp4', 'f2', 10),
('mp5', 'f1', 35), ('mp5', 'f3', 25), ('mp5', 'f6', 20), ('mp5', 'f2', 20),
('mp6', 'f3', 35), ('mp6', 'f4', 35), ('mp6', 'f1', 30);
```

---

## 11. Security Considerations

### 11.1 Authentication & Authorization

- Use **Azure AD B2C** for advisor authentication (SSO with Manulife enterprise AD)
- Implement role-based access: `Advisor`, `Senior Advisor`, `Branch Manager`, `Admin`
- Each advisor can only access their own clients (row-level security)
- API endpoints must validate `AdvisorId` matches authenticated user's advisor record

### 11.2 Data Protection

- All API connections over HTTPS/TLS 1.2+
- Store connection strings and secrets in **Azure Key Vault**
- Enable **Transparent Data Encryption (TDE)** on Azure SQL
- Enable **Azure SQL Auditing** for compliance
- PII fields (name, email, phone) should be encrypted at rest
- Implement data masking for non-privileged queries

### 11.3 API Security

- Rate limiting via Azure API Management (100 requests/minute per advisor)
- Input validation on all endpoints using schema validation (Zod or FluentValidation)
- CORS restricted to known frontend domains
- Request/response logging via Application Insights (mask PII in logs)

### 11.4 Compliance

- BSP (Bangko Sentral ng Pilipinas) data privacy regulations
- Philippine Data Privacy Act of 2012 (RA 10173)
- National Privacy Commission guidelines for financial data
- Audit trail for all client data modifications

---

## 12. Constants & Configuration

All configurable values used across the system. Store these as application settings, not hard-coded.

```
# Market & Economic Constants
BSP_INFLATION_RATE          = 0.053       # 5.3% annual
PSEI_ANNUAL_RETURN          = 0.092       # 9.2% PSEi benchmark
PSEI_YTD_DISPLAY            = 9.2         # Display value
BALANCED_ANNUAL_RETURN      = 0.068       # 6.8% balanced benchmark
BALANCED_YTD_DISPLAY        = 6.8         # Display value

# Risk Profile Return Assumptions
RETURN_CONSERVATIVE         = 0.04        # 4% annual
RETURN_BALANCED             = 0.07        # 7% annual
RETURN_GROWTH               = 0.10        # 10% annual
RETURN_AGGRESSIVE           = 0.14        # 14% annual

# Volatility Factor (for projection bands)
VOLATILITY_FACTOR           = 0.30        # 30% of annual return

# Alert Thresholds
REBALANCE_DRIFT_THRESHOLD   = 5           # 5% weight drift triggers alert
CASH_DRAG_THRESHOLD         = 20          # >20% cash triggers warning
CONCENTRATION_RISK_PCT      = 35          # >35% single fund triggers warning
RISK_AGE_MISMATCH_AGE       = 50          # Aggressive + age > 50 triggers warning

# Goal Defaults
RETIREMENT_YEARS            = 25          # Post-retirement coverage period
PROPERTY_DOWN_PAYMENT_PCT   = 0.20        # 20% down payment
MEDICAL_BUFFER_PER_PERSON   = 100000      # ₱100,000 per family member

# Education Tuition Rates (Annual)
TUITION_PUBLIC              = 80000       # ₱80,000
TUITION_PRIVATE             = 250000      # ₱250,000
TUITION_INTERNATIONAL       = 800000      # ₱800,000
LIVING_EXPENSE_DOMESTIC     = 180000      # ₱180,000/year
LIVING_EXPENSE_INTERNATIONAL = 600000     # ₱600,000/year

# Property Base Prices (Metro Manila)
PRICE_CONDO_STUDIO          = 3500000
PRICE_CONDO_FAMILY          = 7000000
PRICE_TOWNHOUSE             = 5500000
PRICE_HOUSE_LOT             = 12000000

# Location Multipliers
LOC_CEBU_DAVAO_MULTIPLIER   = 0.80
LOC_PROVINCIAL_MULTIPLIER   = 0.50

# Performance History
MAX_MONTHS_DISPLAY          = 36          # Cap performance chart at 36 months

# Fee Projection
TEN_YEAR_FEE_COMPOUNDING    = 1.50        # Multiplier for 10-year fee drag

# Currency
LOCALE                      = "en-PH"
CURRENCY                    = "PHP"
```

---

## Appendix A: Client Summary View (Clients Page)

The landing page shows aggregated stats across all advisor's clients:

| Metric | Calculation |
|--------|-------------|
| Total Clients | Count of active clients |
| Total AUM | Sum of all clients' `totalPortfolio` |
| Active Goals | Sum of all clients' goal counts |
| Avg YTD Return | AUM-weighted average: `sum(client.totalPortfolio * client.returns.ytd) / sum(client.totalPortfolio)` |

Clients with `needsAction = true` are sorted to the top of the list.

## Appendix B: Meeting Prep Summary

The meeting prep dialog generates a one-page client summary containing:

1. **Client Profile**: Name, age, risk profile, join date
2. **AUM Summary**: Total portfolio, cash holdings, total invested
3. **Returns**: YTD, 1Y, 3Y with vs-benchmark indicators
4. **Goals Status**: Each goal with name, type, status, probability, current/target amounts
5. **Risk Metrics**: Volatility, max drawdown, Sharpe ratio (client-level weighted)
6. **Expense Summary**: Weighted expense ratio, annual fee cost
7. **AI Talking Points**: Top insights from AI Copilot engine (see Section 5)

## Appendix C: Insights Hub (Cross-Client Analytics)

The `/insights` page provides advisor-level intelligence across all clients:

| Metric | Calculation |
|--------|-------------|
| Total AUM | Sum of all clients' totalPortfolio |
| Avg Probability | Average of all goals' probability across all clients |
| Priority Alerts | Count of clients where needsAction = true |
| Off-Track Goals | Count of goals with status = "off-track" across all clients |
| Funding Gaps | For each off-track goal: targetAmount - currentAmount |
| AUM by Risk Profile | Group clients by riskProfile, sum totalPortfolio per group |
| Client Performance Ranking | Sort clients by returns.ytd descending |

---

*End of Backend Implementation Guide*
