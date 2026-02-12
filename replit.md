# Manulife Advisor Co-Pilot

## Overview
A financial advisor dashboard built with React, Recharts, and Framer Motion for Manulife Philippines. Uses Philippine Peso (PHP) currency and Filipino names throughout. Integrated client-centric workflow where advisors start from the client list, navigate to client-specific dashboards, and manage goals with inline simulation and portfolio editing.

## Architecture
- **Frontend**: React + TypeScript, Vite, TailwindCSS, Shadcn UI components
- **Animations**: Framer Motion
- **Charts**: Recharts (AreaChart, PieChart, BarChart)
- **Routing**: Wouter
- **Backend**: Express with in-memory storage for model portfolios, client-side mock data for clients/goals

## Key Features
1. **Clients Page** (Landing Page `/`) - Summary stat cards (Total Clients, Total AUM, Active Goals, AUM-weighted Avg YTD Return), dropdown search bar with instant results, action-needed clients prioritized on top, client cards with risk profile badges, Vol/Sharpe mini-metrics, "Add New Client" button opens Goal Wizard
2. **Client Dashboard** (`/clients/:id`) - Titled "{Name}'s Portfolio Health Check". Hero section with 2 rows: Returns (Total Portfolio, YTD, 1Y, 3Y) + Risk Metrics (Volatility, Max Drawdown, Sharpe Ratio, Goals On Track). Expandable goal cards with tabbed interface (Overview/Simulate/Portfolio), per-goal next-best-action recommendations, and AI Copilot sidebar
3. **Goal Tabs (Integrated)** - Each expanded goal card has 3 tabs:
   - **Overview**: Returns, fund list, next-best-action recommendations
   - **Simulate**: Embedded GoalSimulator with goal-specific parameters (current amount, target, monthly contribution, risk profile)
   - **Portfolio**: Inline GoalPortfolioEditor with fund weight sliders, add/remove funds, 100% validation
4. **AI Copilot** - Right sidebar on dashboard with three categories: Priority Actions (critical alerts with specific remedies), Portfolio Performance (weighted YTD return vs BSP inflation), Meeting Talking Points (inflation, DCA, retirement). Detects concentration risk, cash drag, risk-age mismatch.
5. **New Client Onboarding (Goal Wizard)** - Multi-step wizard:
   - Step 1: Client info (Name, Age, Email, Phone, Monthly Income)
   - Step 2: 6-question risk profiling assessment (scored 1-3 per question)
   - Step 3: Risk Profile Result (Conservative/Moderate/Aggressive) with auto-assigned model portfolio
   - Steps 4+: Goal type selection, target calculation, summary
   - For existing clients, skips Steps 1-3 and goes straight to goal creation
6. **Model Portfolio System** - Backend API (`/api/model-portfolios`) with CRUD operations. 6 default portfolios across 3 risk profiles (Conservative, Moderate, Aggressive) and 4 categories (default, low_volatility, growth, aggressive_growth). Auto-assigned to new clients based on risk assessment.
7. **Insights Hub** (`/insights`) - Cross-client intelligence: summary metrics, priority alerts, funding gap analysis, AUM allocation charts, client performance comparison, per-client AI recommendations
8. **Dark Mode** - Full light/dark theme support

## Risk Profiling
- 6 multiple-choice questions scored 1-3 (conservative to aggressive)
- Score 6-10 = Conservative, 11-14 = Moderate, 15-18 = Aggressive
- Auto-fetches matching model portfolio from backend API

## Navigation
- Sidebar: Clients, Insights
- Goal Simulator and Portfolio Builder are embedded in client dashboard tabs (not standalone pages)
- Branding: "Manulife Advisor Co-Pilot"

## Data Model
- **Client** - id, name, age, riskProfile, joinedDate, totalPortfolio, cashHoldings, monthlyIncome, returns (ytd/1Y/3Y), goals[], needsAction, actionReason
- **Goal** - id, name, type (7 types), targetAmount, currentAmount, targetDate, status, probability, riskProfile, returns, portfolio, monthlyContribution
- **GoalPortfolio** - totalInvested, funds[] (GoalFundAllocation with fundId, weight, amount)
- **Fund** - id, name, category, returnRate, expenseRatio, volatility, maxDrawdown, sharpeRatio (from manulifeFunds array)
- **ModelPortfolio** - id, name, riskProfile (Conservative/Moderate/Aggressive), category (default/low_volatility/growth/aggressive_growth), description, funds[]
- BSP Inflation Rate: 5.3%

## API Endpoints
- `GET /api/model-portfolios` - All model portfolios
- `GET /api/model-portfolios/risk/:riskProfile` - Filter by risk profile
- `GET /api/model-portfolios/:id` - Single portfolio
- `POST /api/model-portfolios` - Create new (validates 100% weight)
- `PATCH /api/model-portfolios/:id` - Update existing
- `DELETE /api/model-portfolios/:id` - Delete

## Project Structure
- `client/src/components/` - Reusable components (goal-simulator, portfolio-builder, ai-copilot, app-sidebar, goal-wizard, theme-provider, theme-toggle)
- `client/src/pages/` - Page components (dashboard, analytics/insights, clients)
- `client/src/lib/mockData.ts` - Mock data with 5 Filipino clients, Philippine-specific fund names, PHP currency formatting
- `server/routes.ts` - Model portfolio REST API
- `server/storage.ts` - In-memory storage with default model portfolios
- `shared/schema.ts` - Zod schemas for ModelPortfolio

## Brand Colors
- Primary Green: #0C7143 (Headers/Sidebars)
- Action Green: #00A758 (Buttons/Highlights)
- Alert Red: #D9534F (Off-track goals)
- Warning: #F59E0B
- Font: Inter (sans-serif)

## Running
- `npm run dev` starts both Express backend and Vite frontend on port 5000
