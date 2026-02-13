# iFUNDS Advisor Co-Pilot — Product Roadmap 2026–2029

> **Author**: Product Management, iFUNDS  
> **Vision**: Turn every agent into a knowledgeable, trusted financial advisor who builds lifelong client relationships  
> **Date**: February 2026  

---

## Our North Star

> _"The best financial advisor is one who knows their client so well that the right recommendation feels obvious — and has the tools to act on it instantly."_

Today, our agents are stuck toggling between 5+ systems, manually crunching data, and spending 90 minutes preparing for a single meeting. The Co-Pilot exists to **give them back that time** — and fill it with deeper, smarter client conversations instead.

This roadmap is organized into **three horizons** aligned with our strategic priorities:

```
Year 1 (2026)     →  Foundation: Make agents 3× more productive
Year 2 (2027)     →  Intelligence: Make agents measurably smarter  
Year 3 (2028-29)  →  Ecosystem: Make the platform indispensable
```

---

## Year 1 (2026): Foundation — "3× Productivity"

### Strategic Focus
Replace manual work with automation. Every minute we save on admin is a minute the agent can spend with a client.

---

### Q1 2026 — Launch & Learn (Current)

| Feature | Status | Impact |
|---------|--------|--------|
| Advisor Home (Daily Briefing + Task Inbox) | ✅ Shipped | Eliminates morning system-hopping |
| Client Intelligence Panel (Talking Points / DORA / Actions) | ✅ Shipped | Meeting prep in 7 min vs 90 min |
| DORA AI Chat (client + research) | ✅ Shipped | Instant house views, portfolio answers |
| Floating DORA on all pages | ✅ Shipped | Always-available AI assistant |
| Trade Email with Preview | ✅ Shipped | End-to-end goal → email → trade flow |
| Portfolio Builder with Consent | ✅ Shipped | Compliance-first portfolio construction |
| Goal-Based Selling Design (progress-first UI, contribution gap) | ✅ Shipped | Advisors lead with goals, not fund returns |
| DCA Encouragement (wizard Investment Plan step, portfolio DCA section) | ✅ Shipped | Higher monthly contribution enrollment |

**KPI**: Pilot with 20 advisors in Philippines. Target: 50% reduction in self-reported meeting prep time.

---

### Q2 2026 — Data Goes Live

> **Theme**: Replace mock data with real iFUNDS data. The Co-Pilot becomes real.

| # | Feature | Description | Why It Matters |
|---|---------|-------------|---------------|
| 1 | **Live Portfolio Integration** | Connect to iFUNDS portfolio service for real-time NAVs, AUM, and holdings | Advisors stop cross-referencing spreadsheets |
| 2 | **Live Fund Pricing** | Daily NAV feed from fund admin systems | Accurate performance calculations |
| 3 | **CRM Sync** | Two-way sync with Salesforce/CRM for meeting notes, follow-ups, client preferences | Meeting history persists across systems |
| 4 | **SSO Integration** | SAML/OAuth with iFUNDS auth | Single login, no extra passwords |
| 5 | **Market Data Feed** | PSEi, BSP rate, USD/PHP, inflation — real-time via Bloomberg/Reuters API | Daily Briefing shows actual market data |

**KPI**: 100% of pilot advisors using live data. Zero fallback to iFUNDS legacy screens for daily tasks.

---

### Q3 2026 — AI Gets Real

> **Theme**: Replace prototype NLP with production-grade AI. DORA becomes truly intelligent.

| # | Feature | Description | Why It Matters |
|---|---------|-------------|---------------|
| 6 | **Azure OpenAI Integration** | Replace regex intent parser with GPT-4o classification + response generation | Natural conversation, not keyword matching |
| 7 | **RAG Pipeline with Real Docs** | Index actual Manulife house view PDFs, research reports, product factsheets via Azure AI Search | Advisors get real, current research — not mock data |
| 8 | **Compliance Auto-Review** | AI responses automatically tagged with compliance status (approved / needs review) | Reduces compliance burden, increases trust |
| 9 | **Conversation Memory** | Multi-turn chat with session history | "What did we discuss last time?" actually works |
| 10 | **DORA in Filipino/Tagalog** | Bilingual support for PH market | Agents can query in their natural language |

**KPI**: DORA answer accuracy > 90% (human-evaluated). Response time < 3 seconds.

---

### Q4 2026 — Advisor Workflows Go Digital

> **Theme**: Digitize the last paper-based workflows. Zero paper, zero dropped balls.

| # | Feature | Description | Why It Matters |
|---|---------|-------------|---------------|
| 11 | **Digital Consent & E-Signature** | Replace `window.confirm()` with OTP or e-signature for trade consent | Legally binding, audit-ready consent |
| 12 | **Real Email Delivery** | SendGrid/Azure Communication Services for trade emails, meeting summaries | Clients actually receive the emails |
| 13 | **Document Vault** | Upload/attach KYC docs, signed forms, IDs per client | One place for all client documents |
| 14 | **Automated KYC Reminders** | System tracks ID/document expiry and auto-alerts | Zero missed compliance deadlines |
| 15 | **Client Self-Service Portal** | Clients can view their goals, fund account, confirm trades online | Removes phone-tag from post-meeting execution |

**KPI**: 80% of trades executed within 48 hours of meeting (vs current 5-7 day average). 3× advisor capacity (clients per advisor).

---

## Year 2 (2027): Intelligence — "Measurably Smarter"

### Strategic Focus
AI doesn't just save time — it makes advisors demonstrably better at their job. The platform learns from every interaction and proactively identifies opportunities.

---

### H1 2027 — Predictive Intelligence

| # | Feature | Description | Why It Matters |
|---|---------|-------------|---------------|
| 16 | **Goal Probability Engine (Monte Carlo)** | Real Monte Carlo simulation for goal probability instead of static % | Clients see scientifically-modeled outcomes |
| 17 | **Client Health Score** | Composite score (0-100) combining goal progress, risk alignment, engagement, contribution consistency | Advisors instantly know who needs attention |
| 18 | **Churn Prediction Model** | ML model identifies clients at risk of leaving (missed contributions, low engagement, market losses) | Proactive retention before it's too late |
| 19 | **Life Event Detection** | AI detects life events from interactions (marriage, child, job change, inheritance) and triggers relevant goal suggestions | Right product at the right time |
| 20 | **Smart Meeting Scheduler** | AI recommends optimal meeting frequency per client based on portfolio complexity, life events, and goal proximity | High-value clients get more attention |

**KPI**: Churn prediction accuracy > 75%. Client retention rate +5pp. Average goal probability improvement of +8% across book.

---

### H2 2027 — Advisor Coaching & Growth

| # | Feature | Description | Why It Matters |
|---|---------|-------------|---------------|
| 21 | **Peer Benchmarking Dashboard** | Compare advisor's book performance, client satisfaction, and conversion rates vs anonymized peers | Healthy competition drives improvement |
| 22 | **AI Meeting Coach** | Post-meeting analysis: "You discussed 4 of 6 recommended talking points. Consider covering retirement gap next time." | Continuous advisor skill development |
| 23 | **Product Knowledge Engine** | DORA quizzes agents on new products, regulations, and market concepts. Gamified learning. | Agents become genuinely knowledgeable |
| 24 | **Client Sentiment Tracking** | NLP analysis of meeting notes over time to track client confidence, concerns, and satisfaction trajectory | Early warning system for unhappy clients |
| 25 | **Automated Rebalancing Proposals** | System detects drift, generates rebalancing proposal with 1-click advisor approval | Systematic portfolio maintenance at scale |
| 26 | **Tax-Loss Harvesting Alerts** | Identifies tax-loss harvesting opportunities in client portfolios (where applicable) | Adds real financial value for clients |

**KPI**: Advisor product knowledge quiz scores +30%. Client NPS +10. Rebalancing compliance rate > 95%.

---

## Year 3 (2028-29): Ecosystem — "Indispensable Platform"

### Strategic Focus
Expand beyond Philippines. Become the platform that advisors can't imagine working without — and that clients actively prefer.

---

### 2028 H1 — Pan-Asian Expansion

| # | Feature | Description | Why It Matters |
|---|---------|-------------|---------------|
| 27 | **Multi-Currency Support** | Full support for SGD, HKD, IDR, VND, THB, MYR alongside PHP | One platform for all ASEAN markets |
| 28 | **Multi-Regulatory Engine** | Compliance rules per jurisdiction (SEC Philippines, MAS Singapore, SFC Hong Kong, etc.) | Legal compliance without manual checking |
| 29 | **Localized House Views** | Region-specific research and recommendations | Relevant advice per market |
| 30 | **Multi-Language DORA** | English, Filipino, Bahasa, Vietnamese, Thai, Mandarin | Advisors everywhere use their own language |

---

### 2028 H2 — Advanced Client Engagement

| # | Feature | Description | Why It Matters |
|---|---------|-------------|---------------|
| 31 | **Client-Facing App** | Mobile app where clients see goals, portfolio, messages from advisor, and educational content | Clients stay engaged between meetings |
| 32 | **Goal-Based Investing Marketplace** | Browse and subscribe to model goals (e.g., "Save for child's college in 15 years") with pre-built portfolios | Makes investing accessible for new clients |
| 33 | **Video Meeting Integration** | Built-in video calls with screen-sharing, real-time Co-Pilot overlay, auto-transcription, and meeting summary | Remote advisory becomes first-class |
| 34 | **Family Wealth View** | Aggregate and visualize portfolios across family members (spouse, parents, children) | Holistic family financial planning |
| 35 | **Generational Wealth Planning** | Estate planning tools, inheritance scenarios, cross-generational goal modeling | Building relationships that span generations |

---

### 2029 — Platform Flywheel

| # | Feature | Description | Why It Matters |
|---|---------|-------------|---------------|
| 36 | **Advisor Marketplace** | Top-performing advisors get featured; clients can discover and connect with advisors | Network effects drive growth |
| 37 | **Open API for Partners** | Third-party integrations (tax software, insurance, banking) | Co-Pilot becomes the financial hub |
| 38 | **AI-Generated Financial Plans** | Full financial plan document auto-generated from client goals, risk profile, and market conditions | Professional-grade output in minutes |
| 39 | **Continuous Suitability Monitoring** | Real-time monitoring of portfolio suitability vs stated risk profile, with auto-alerts | Regulation-proof advisory at scale |
| 40 | **Advisor AI Agent** | Fully autonomous AI that can draft emails, schedule meetings, prepare proposals, and rebalance portfolios (with advisor approval) | The advisor focuses only on the relationship |

---

## Success Metrics by Year

| Metric | Today (Baseline) | Year 1 Target | Year 2 Target | Year 3 Target |
|--------|-----------------|---------------|---------------|---------------|
| **Meeting prep time** | 90 min | 15 min | 5 min | 0 min (auto-generated) |
| **Clients per advisor** | 80-100 | 200 | 350 | 500+ |
| **Trade execution time** (meeting to completion) | 5-7 days | 48 hours | Same-day | Real-time |
| **Client NPS** | 35 | 45 | 55 | 70+ |
| **Advisor retention** | 75% | 85% | 90% | 95% |
| **AUM per advisor** | ₱50M | ₱100M | ₱200M | ₱400M+ |
| **Markets supported** | Philippines | Philippines | PH + 2 markets | Pan-Asian (6+) |
| **DORA accuracy** | 70% (regex) | 90% (LLM) | 95% (fine-tuned) | 98% (adaptive) |
| **Goal achievement rate** | 55% | 65% | 75% | 85% |

---

## Investment & Team Requirements

### Year 1 (Foundation)
| Role | Headcount | Focus |
|------|-----------|-------|
| Full-Stack Engineers | 4 | iFUNDS integration, live data, SSO |
| AI/ML Engineer | 2 | Azure OpenAI, RAG pipeline, compliance |
| Product Manager | 1 | Roadmap execution, advisor feedback loop |
| UX Designer | 1 | Advisor workflows, mobile responsiveness |
| QA Engineer | 1 | Automated testing, security audit |
| **Total** | **9** | |

### Year 2 (Intelligence)
| Role | Headcount | Focus |
|------|-----------|-------|
| Additional ML Engineers | 2 | Predictive models (churn, health score) |
| Data Engineer | 2 | Data lake, ETL pipelines, training data |
| Compliance SME | 1 | Regulatory automation across markets |
| Additional Full-Stack | 2 | Client portal, mobile app |
| **Total** | **16** (cumulative) | |

### Year 3 (Ecosystem)
| Role | Headcount | Focus |
|------|-----------|-------|
| Localization Team | 3 | Multi-language, multi-currency, multi-regulation |
| Platform Engineers | 2 | API gateway, partner integrations |
| Growth/Marketing | 2 | Advisor marketplace, client acquisition |
| **Total** | **23** (cumulative) | |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Advisor resistance to AI** | High | High | Start with augmentation (not replacement). Frame DORA as "your assistant, not your replacement." Pilot with tech-forward agents first. |
| **Data quality from iFUNDS** | Medium | High | Invest in data cleansing sprint before Q2 2026 launch. Build validation layers. |
| **Regulatory pushback on AI advice** | Medium | High | All AI outputs are "suggestions to the advisor" — never direct to client. Keep human-in-the-loop always. |
| **LLM hallucination** | Medium | Critical | RAG-only answers for market views. No training-data-only responses. Compliance filter on every output. |
| **Scaling Azure costs** | Low | Medium | Start with GPT-4o-mini for classification. Use caching for repeated queries. Monitor token usage weekly. |
| **Competitor launches similar tool** | Medium | Medium | Our moat is iFUNDS data integration + Philippine market expertise. Speed of execution matters. |

---

## The 90-Day Commitment

If you approve this roadmap, here's what we ship in the first 90 days:

1. **Week 1-2**: Live data integration (portfolio + fund pricing APIs)
2. **Week 3-4**: SSO + CRM sync (Salesforce)
3. **Week 5-6**: Azure OpenAI deployment (replace regex DORA)
4. **Week 7-8**: RAG pipeline with first 50 house view documents
5. **Week 9-10**: Digital consent + real email delivery
6. **Week 11-12**: Philippines pilot expansion to 100 advisors
7. **Week 13**: First metrics review and iteration

**Budget ask**: ~$180K (team + Azure infrastructure for 90 days)  
**Expected ROI**: If we double clients-per-advisor from 100 → 200, each advisor generates an additional ~₱50M AUM. With 100 pilot advisors, that's **₱5B in incremental AUM under management**.

---

> _"Technology should make the human connection stronger, not replace it. The best advisor is one who spends 90% of their time understanding their client — and lets the technology handle the rest."_

---

*Prepared by Product Management, iFUNDS. For strategy review and approval.*
