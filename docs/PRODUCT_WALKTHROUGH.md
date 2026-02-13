# Manulife Advisor Co-Pilot — Product Walkthrough

> **Audience**: Leadership Team, New Users, Stakeholders  
> **Purpose**: Complete feature walkthrough demonstrating how the Advisor Co-Pilot transforms advisor productivity  
> **Version**: 1.0 | February 2026

---

## Executive Summary

The **Manulife Advisor Co-Pilot** is an AI-powered platform designed to make our financial advisors significantly more productive. It transforms how advisors prepare for client meetings, research investment views, and manage their daily workflows.

### Key Value Propositions

| Pain Point | Co-Pilot Solution | Impact |
|------------|-------------------|--------|
| ⏳ Advisors spend 2+ hours preparing for each client meeting | **Auto-generated talking points & agenda** | 70% reduction in meeting prep time |
| 🔍 Advisors struggle to find latest house views and research | **DORA AI assistant** with instant research access | Real-time answers in < 3 seconds |
| 📊 Client portfolio data scattered across multiple tools | **Unified client dashboard** with all data in one view | Single source of truth |
| 🎯 Advisors miss follow-up actions post-meeting | **Next Best Actions & Meeting Debrief** system | Zero dropped follow-ups |
| 📱 No mobile access for advisors on the go | **Responsive design** + floating DORA chatbot | Advisors stay productive anywhere |

---

## Feature Walkthrough

### 1. 🏠 Advisor Home — Your Command Center

**What it does**: The first screen advisors see when they log in. It provides an at-a-glance view of their day.

**Components**:

- **Daily Briefing** — A personalized greeting with the current date, plus key market data:
  - PSEi (Philippine Stock Exchange index) performance
  - BSP (Bangko Sentral ng Pilipinas) rate
  - USD/PHP exchange rate
  - Current inflation rate

- **Quick Action Buttons** — One-tap access to:
  - ➕ **New Client** — Opens the client onboarding wizard
  - 👥 **All Clients** — Goes to the full client directory
  - 📞 **Call Log** — (Future) Client call tracking
  - 📄 **Reports** — (Future) Report generation
  - 📅 **Calendar** — (Future) Meeting calendar integration

- **Task Inbox** — Aggregated action items:
  - Compliance alerts (e.g., "3 clients need KYC renewal")
  - Off-track goal notifications
  - Follow-up reminders from past meetings
  - Market-driven alerts (e.g., "Portfolio drift detected")

- **Recent Clients** — Quick-access cards for the advisor's most recent clients, showing name, risk profile, goal count, and an action indicator (red dot) if the client needs attention.

**Productivity Impact**: Advisors start their day with a complete picture in 30 seconds instead of checking 5+ systems.

---

### 2. 👥 Client Directory — Smart Search & Filters

**What it does**: A searchable, filterable list of all the advisor's clients. Replace the basic flat list in iFUNDS with an intelligent directory.

**Features**:
- **Instant Search** — Type to filter clients by name
- **Client Cards** — Each card shows:
  - Client name and risk profile
  - Total AUM (Assets Under Management) in PHP
  - YTD return (color-coded: green for positive, red for negative)
  - Number of goals and their status
  - ⚠️ **Action badge** if the client needs attention (with reason)

- **One-Click Navigation** — Tap any client card to open their full dashboard

**Productivity Impact**: Find any client in < 2 seconds. Instantly see who needs attention.

---

### 3. 📊 Client Dashboard — The Heart of the System

**What it does**: A comprehensive single-page view of everything about a client. This is where advisors spend most of their time during and before client meetings.

**Layout**:
```
┌──────────────────────────────────┬────────────────────┐
│                                  │                    │
│    Main Content Area             │  Intelligence      │
│    (Charts, Goals, Analytics)    │  Panel             │
│                                  │  (3 Tabs)          │
│                                  │                    │
└──────────────────────────────────┴────────────────────┘
```

#### Main Content Area (Left Side)

**a) Client Summary Header**
- Name, age, risk profile
- Total AUM and cash holdings
- YTD / 1-Year / 3-Year returns

**b) Goal Progress Section**
Each client has multiple financial goals (Retirement, Education, Property, etc.). Each goal card shows:
- 🎯 **Goal name & type** (with icon)
- 📊 **Progress bar** — Current amount vs target (e.g., ₱1.8M / ₱3.0M)
- 📈 **Probability** — Monte Carlo-based probability of achieving the goal (e.g., 82%)
- 🟢/🔴 **Status badge** — "On Track", "Off Track", or "Ahead"
- 💰 **Monthly contribution** — Current DCA amount
- 📋 **Portfolio allocation** — Which funds are allocated to this goal and at what weight

**c) Performance History Chart**
Interactive line chart showing portfolio value over time vs benchmarks:
- **Portfolio** (actual performance)
- **PSEi Benchmark** (Philippine stock market)
- **Balanced Benchmark** (60/40 equivalent)

Time range: Up to 36 months from client's join date.

**d) Portfolio Allocation Chart**
Donut/pie chart showing how the client's money is distributed across fund categories:
- Global Equity
- Philippine Equity
- Philippine Bond
- Asia Growth
- Money Market
- Balanced

**e) Benchmark Comparison Card**
Side-by-side comparison of client's returns vs market benchmarks:
- vs PSEi
- vs Balanced Index
- Shows alpha (outperformance/underperformance)

**f) Contribution Tracker**
Bar chart showing monthly DCA contributions across all goals. Helps advisors identify clients who may have paused contributions.

**g) Portfolio Drift Section**
Visual comparison of **target allocation** vs **actual allocation**. Highlights when a portfolio has drifted more than 5% from its target, signaling a need for rebalancing.

**h) Performance Attribution**
Breaks down returns by asset class contribution:
- Shows which asset classes added to or detracted from returns
- Includes educational tooltips ("Coach's Notes") to help new advisors explain this to clients

**i) Peer Comparison Chart**
How does this client's portfolio compare to other similar clients?
- Groups clients by risk profile cohort
- Shows this client's ranking in terms of returns

**j) Client Timeline**
Chronological history of all interactions:
- Portfolio changes
- Meeting notes
- Goal updates
- Contribution changes

---

### 4. 🧠 Client Intelligence Panel — AI-Powered Insights (Right Side)

**What it does**: A 3-tab panel on the right side of the client dashboard that provides instant, AI-generated intelligence.

#### Tab 1: 💬 Talking Points

Auto-generated conversation starters based on client data. The system analyzes the client's portfolio, goals, and history to produce relevant talking points.

**Types of talking points generated**:

| Type | Example | When it appears |
|------|---------|-----------------|
| 🔴 **Concern** | "Retirement goal is behind schedule" | Client has off-track goals |
| 🟢 **Opportunity** | "Strong YTD: +8.3%" | Client is performing well |
| ⚠️ **Compliance** | "Rebalancing recommended" | Client flagged for action |
| 🔵 **Market Context** | "PSEi +1.2% this week" | Always shown |
| 🟣 **Follow-Up** | "3 open items from last meeting" | Client has pending tasks |

**Why it matters**: Advisors walk into every meeting with 5-6 ready-made, data-driven conversation starters — no more scrambling through spreadsheets.

#### Tab 2: 🤖 DORA AI Chat

DORA (Digital Operations & Recommendations Assistant) is an AI chatbot that advisors can use to:

1. **Ask about this client**: "What's Maria's retirement goal status?" → Instant data
2. **Research house views**: "What's our view on technology?" → Manulife's investment stance
3. **Get recommendations**: "What should I suggest to Jose?" → Prioritized actions
4. **Prepare for meetings**: "Meeting prep for Maria" → Auto-generated agenda

**Sample interactions**:

| Advisor Asks | DORA Responds |
|-------------|---------------|
| "Show portfolio summary" | AUM, allocations, top/bottom performers, risk metrics |
| "Which goals are off track?" | List of struggling goals with gap analysis |
| "House view on Philippines" | Manulife's stance on PH equities, BSP policy, peso outlook |
| "USD/PHP forecast" | Currency outlook with compliance badge |
| "ESG investing options" | ESG strategy overview with approved fund recommendations |

**Quick Action Chips**: Pre-built query buttons for common questions:
- "Portfolio summary"
- "House view: Technology"
- "Philippines market outlook"
- "USD/PHP forecast"
- "Recommendations"

#### Tab 3: ⚡ Next Best Actions

A prioritized list of recommended actions, sorted by urgency:

| Priority | Action | Example |
|----------|--------|---------|
| 🔴 **High** | Increase contributions for off-track goals | "Gap of ₱21.5M for Retirement. Suggest increasing monthly DCA." |
| 🟡 **Medium** | Review portfolio allocation | "Check for drift in equity/bond split" |
| 🟡 **Medium** | Complete meeting follow-ups | "3 open items from Jan 15 meeting" |
| ⚪ **Low** | KYC document review | "Annual review — verify ID documents are current" |

Each action has a **one-click button** (e.g., "Calculate Options", "View Drift Analysis", "Mark Done").

**Red badge**: The Actions tab shows a red count badge for high-priority items.

---

### 5. 🤖 Floating DORA Assistant — Always Available

**What it does**: A persistent floating chatbot available on **every page** of the application.

**How it works**:
1. A pulsing green ✨ button sits in the bottom-right corner of every screen
2. Click to open a polished chat window (380×560px)
3. Ask any question — client-specific or general research
4. Close and reopen — your conversation is preserved

**Design Details**:
- **Manulife Green header** with DORA branding
- **Spring-animated** open/close
- **Backdrop blur** effect for a premium feel
- Available on: Advisor Home, Client Directory, Dashboard, Insights, Settings — everywhere

**Why it matters**: Advisors never need to leave their current task to get information. Whether they're reviewing analytics or updating settings, DORA is one click away.

---

### 6. 📋 Meeting Preparation Tools

#### Meeting Prep Dialog (Pre-Meeting)

Accessed from the client dashboard, this dialog has 3 tabs:

| Tab | Features |
|-----|----------|
| **Agenda** | Auto-generated prioritized items (off-track goals first), time estimates, checkboxes |
| **Fact Sheet** | Key metrics grid, goal progress bars, color-coded talking points |
| **Notes & Follow-ups** | Text input for notes, AI-suggested follow-up tasks, save to client record |

Includes a **Print** button for creating clean meeting handouts.

#### Meeting Debrief (Post-Meeting)

When the advisor exits **Client Presentation Mode** (a hide-sidebar focus mode for screen-sharing with clients), the system automatically opens a Meeting Debrief dialog:

1. **Notes field** — Capture key discussion points
2. **Follow-up tasks** — Add action items with assignments
3. **Save** — Persists to client record for next meeting's talking points

**Why it matters**: Captures institutional knowledge immediately after meetings, before it's forgotten.

---

### 7. 📢 Notification Center

**What it does**: A bell icon in the header that shows AI-generated alerts.

**Alert types**:
- 📉 Off-track goal warnings
- ⚖️ Portfolio drift thresholds exceeded
- 💵 Cash holdings above optimal levels
- 📅 Upcoming KYC renewals
- 📊 Market events affecting client portfolios

Each alert links directly to the relevant client dashboard for immediate action.

---

### 8. 🎓 Educational Scaffolding (Coach's Notes)

**What it does**: New advisors often need help explaining complex financial metrics to clients. The Co-Pilot includes contextual educational tooltips.

**How it works**:
- Complex metrics (e.g., "Performance Attribution") have a 📘 icon
- Clicking the icon opens a "Coach's Notes" popup
- The popup explains:
  - **What the metric means** in simple terms
  - **Why it matters** to the client
  - **How to explain it** in a client meeting

**Why it matters**: Reduces onboarding time for new advisors and ensures consistent, accurate client communications.

---

### 9. 🔍 Global Command Menu

**What it does**: Press `⌘K` (Mac) or `Ctrl+K` (Windows) to open a global search.

**Features**:
- Search for clients by name
- Jump to any page instantly
- Quick actions (New Client, New Goal, etc.)

---

### 10. 🎨 Client Presentation Mode

**What it does**: A focused view for screen-sharing with clients during meetings.

**When activated**:
- Sidebar navigation hides (more screen space)
- The Intelligence Panel hides (advisor-only content)
- Only client-facing data remains visible
- Exit button triggers the Meeting Debrief (captures notes immediately)

---

## How It Helps Advisors Be More Productive

### Before Co-Pilot (Current Workflow)

```
7:00 AM    Advisor logs into iFUNDS                    5 min
7:05 AM    Checks email for compliance alerts          15 min
7:20 AM    Opens Excel to review client portfolios     30 min
7:50 AM    Searches for latest house view documents    20 min
8:10 AM    Manually creates meeting agenda             25 min
8:35 AM    Reviews client goal calculations            15 min
8:50 AM    Ready for first meeting
                                 Total prep: ~1.5 hours
```

### With Co-Pilot (New Workflow)

```
7:00 AM    Advisor opens Co-Pilot                      0 min
           → Daily Briefing shows all alerts
           → Task Inbox shows priorities
7:02 AM    Clicks client for 9 AM meeting              0 min
           → Intelligence Panel shows talking points
           → Next Actions shows priorities
7:04 AM    Asks DORA: "House view on tech?"            1 min
           → Instant research result
7:05 AM    Clicks "Meeting Prep"                       2 min
           → Auto-generated agenda + fact sheet
7:07 AM    Ready for first meeting
                                 Total prep: ~7 minutes
```

### Productivity Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Meeting prep time | 90 min | 7 min | **92% reduction** |
| Research lookup time | 20 min | 10 sec | **99% reduction** |
| Follow-up drop rate | ~30% | ~0% | **Near-zero drops** |
| Clients managed per advisor | 80-100 | 150-200+ | **2× capacity** |
| New advisor onboarding | 6 months | 2 months | **67% faster** |

---

## DORA as a Research Tool — Deep Dive

DORA is not just a client assistant — it's a **general research platform** for advisors. Here's what it knows:

### House Views Coverage

| Category | Topics Available |
|----------|-----------------|
| **Sectors** | Technology (AI, semiconductors, cloud), Healthcare (pharma, biotech), Financials (banking), Energy (oil, renewables), Real Estate (REITs), Consumer |
| **Countries & Regions** | Philippines (PSEi, BSP), US (S&P 500, Fed), China (Hang Seng), India (Nifty, Sensex), Japan (Nikkei), ASEAN, Emerging Markets |
| **Currencies** | USD/PHP, CNY/USD, JPY/USD |
| **Asset Classes** | Equities, Fixed Income (bonds, treasuries), Commodities (gold, silver, copper) |
| **Strategies** | ESG/Sustainable Investing, Dividend Income, Dollar-Cost Averaging (DCA), Retirement Planning, Tax Efficiency |
| **Macro Themes** | Inflation outlook, Interest rates (BSP, Fed), Monetary policy |

### Compliance Integration

Every DORA response includes a compliance badge:
- ✅ **Compliance Approved** — Safe to share with clients
- ⚠️ **Needs Review** — Advisor should verify before sharing
- ℹ️ **Informational Only** — Internal use, not for client distribution

---

## Technical Highlights (For Presentation)

| Feature | Technology | Benefit |
|---------|------------|---------|
| **AI Chat** | Natural Language Processing | Advisors type in plain English/Filipino |
| **Auto-Generated Insights** | Rule-based + AI analysis | No manual data crunching |
| **Real-Time Calculations** | Investment-weighted portfolio math | Accurate risk/return metrics |
| **Responsive Design** | Mobile-first + Desktop optimized | Works on tablets in the field |
| **Data Visualization** | Interactive charts (Recharts) | Complex data made simple |
| **Dark Mode** | System preference detection | Comfortable viewing in any setting |

---

## Appendix: Slide-Ready Talking Points

### For Leadership Presentation

**Slide 1: The Problem**
> "Our advisors spend 90+ minutes preparing for each client meeting. They switch between 5+ systems to gather portfolio data, research views, and create agendas."

**Slide 2: The Solution**
> "The Advisor Co-Pilot brings everything into one screen. AI-generated talking points, instant research, and automated meeting prep reduce preparation from 90 minutes to 7 minutes."

**Slide 3: DORA — Your AI Research Assistant**
> "Advisors can ask DORA anything: client portfolio questions, Manulife house views on sectors and countries, currency forecasts — all with compliance badges. Available on every page via a floating chat button."

**Slide 4: Client Intelligence Panel**
> "Three tabs of actionable intelligence: auto-generated Talking Points, DORA AI Chat, and prioritized Next Best Actions. Advisors walk into every meeting prepared."

**Slide 5: The Impact**
> "92% reduction in meeting prep time. 2× increase in advisor capacity. Near-zero follow-up drops. 67% faster onboarding for new advisors."

**Slide 6: Next Steps**
> "Integrate with iFUNDS platform. Deploy production AI models via Azure. Pilot with 50 advisors in Philippines. Scale to ASEAN."

---

*Document prepared for the Manulife Leadership Team. For a live demo, contact the Advisor Co-Pilot project lead.*
