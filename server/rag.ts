import { z } from "zod";

// Comprehensive "House View" knowledge base covering sectors, countries, currencies, asset classes, and strategies
const HOUSE_VIEW_DOCS = [
    // ─── Sectors ───
    {
        id: "sec-tech",
        topic: "technology",
        keywords: ["tech", "technology", "ai", "software", "semiconductor", "cloud"],
        content: "Manulife Investment Management remains **constructive on Technology**, particularly in AI infrastructure and cloud computing. We favor companies with strong free cash flow and defensible moats. Key picks: semiconductor leaders and enterprise SaaS providers. Valuations are elevated but justified by earnings growth.",
        complianceNote: "Approved for client use.",
        source: "Sector Research: Technology — Q1 2025"
    },
    {
        id: "sec-health",
        topic: "healthcare",
        keywords: ["healthcare", "health", "pharma", "biotech", "medical"],
        content: "Healthcare remains a **defensive play** with attractive valuations. We see opportunity in GLP-1 drug manufacturers, medtech innovation, and aging-population beneficiaries across Asia. Biotech is high-risk/high-reward — suitable only for aggressive risk profiles.",
        complianceNote: "Approved for client use.",
        source: "Sector Research: Healthcare — Q4 2024"
    },
    {
        id: "sec-financials",
        topic: "financials",
        keywords: ["financials", "banks", "banking", "insurance", "finance"],
        content: "We are **neutral on global financials** but **overweight ASEAN banks**, which benefit from strong net interest margins and rising credit demand. Philippine banks (BPI, BDO) offer attractive dividend yields at 4-5%. Insurance sector benefits from rising awareness post-pandemic.",
        complianceNote: "Approved for client use. Regional bias disclosure required.",
        source: "Sector Strategy: Financials — 2025 Outlook"
    },
    {
        id: "sec-energy",
        topic: "energy",
        keywords: ["energy", "oil", "gas", "renewable", "clean energy", "solar"],
        content: "We maintain a **barbell approach**: traditional energy for cash flow (oil majors yielding 5-6%) and clean energy for long-term growth. OPEC+ discipline supports Brent at $75-85 range. Solar and wind capacity additions in Asia present compelling growth stories.",
        complianceNote: "Approved for client use.",
        source: "Commodity & Energy Outlook — 2025"
    },
    {
        id: "sec-realestate",
        topic: "real estate",
        keywords: ["real estate", "reit", "reits", "property", "housing"],
        content: "Asian REITs are offering **attractive entry points** with yields of 5-7%. We favor logistics and data center REITs over retail. Philippine property developers face headwinds from oversupply in office space, but residential demand remains stable. Singapore REITs offer the best risk-adjusted returns in the region.",
        complianceNote: "Approved for client use.",
        source: "Asia Pacific REIT Strategy — 2025"
    },
    {
        id: "sec-consumer",
        topic: "consumer",
        keywords: ["consumer", "retail", "spending", "discretionary", "staples"],
        content: "We are **overweight Consumer Staples** in emerging markets as a defensive hedge. Consumer Discretionary is selectively attractive — focus on companies leveraging e-commerce penetration in Southeast Asia. Philippine remittance-driven consumption supports domestic consumer names.",
        complianceNote: "Approved for client use.",
        source: "Consumer Sector Analysis — ASEAN Focus"
    },
    // ─── Countries / Regions ───
    {
        id: "geo-ph",
        topic: "philippines",
        keywords: ["philippines", "philippine", "psei", "manila", "ph market", "pinoy"],
        content: "The Philippine market offers **value opportunity** with PSEi trading at ~13x forward P/E, below historical average. BSP rate cuts (expected 75-100bps in 2025) are a catalyst. Top picks: banks (BDO, BPI), property (SMPH), and consumer (JFC). Key risk: peso depreciation and fiscal deficit.",
        complianceNote: "Approved for client use. Country concentration risk disclosure required.",
        source: "Philippines Market Outlook — 2025"
    },
    {
        id: "geo-us",
        topic: "united states",
        keywords: ["us", "usa", "america", "american", "s&p", "nasdaq", "wall street", "fed"],
        content: "US equities remain the **global anchor allocation**. S&P 500 earnings growth projected at 10-12% for 2025. The Fed is on a rate-cutting path which supports multiples. We favor quality large-caps but flag concentration risk in Magnificent 7. Small-caps offer catch-up potential.",
        complianceNote: "Approved for client use.",
        source: "US Equity Strategy — 2025"
    },
    {
        id: "geo-china",
        topic: "china",
        keywords: ["china", "chinese", "csi", "hang seng", "beijing", "shanghai", "hsi"],
        content: "China is a **tactical opportunity** after significant de-rating. Policy stimulus (rate cuts, property support, tech regulation easing) is underappreciated. We prefer H-shares over A-shares for valuation margin of safety. Key risks: geopolitics, property sector restructuring, and deflation pressure.",
        complianceNote: "Approved for client use. Geopolitical risk disclosure required.",
        source: "China Investment Outlook — 2025"
    },
    {
        id: "geo-india",
        topic: "india",
        keywords: ["india", "indian", "nifty", "sensex", "mumbai", "bse"],
        content: "India is our **top structural overweight** in Asia. Demographics, digitalization, and manufacturing reshoring (PLI schemes) support multi-year growth. Nifty trades at premium (22x) but justified by 15%+ earnings growth. SIP flows remain strong. Focus: financials, IT services, and industrials.",
        complianceNote: "Approved for client use. Valuation premium disclosure required.",
        source: "India Strategy: Structural Growth Story — 2025"
    },
    {
        id: "geo-japan",
        topic: "japan",
        keywords: ["japan", "japanese", "nikkei", "topix", "boj", "yen"],
        content: "Japan equities are benefiting from **corporate governance reforms** (improved buybacks, unwinding cross-shareholdings). BOJ normalization is gradual and well-communicated. Weak yen supports exporters. We favor value names in financials and trading companies.",
        complianceNote: "Approved for client use.",
        source: "Japan Equity Outlook — 2025"
    },
    {
        id: "geo-asean",
        topic: "asean",
        keywords: ["asean", "southeast asia", "sea", "emerging", "vietnam", "indonesia", "thailand"],
        content: "ASEAN markets offer **diversification benefits** with low correlation to DM. Indonesia (domestic demand + nickel) and Vietnam (FDI + manufacturing) are standout markets. Thailand faces political uncertainty. Regional central banks have room for rate cuts, supporting equity multiples.",
        complianceNote: "Approved for client use.",
        source: "ASEAN Market Strategy — 2025"
    },
    // ─── Currencies ───
    {
        id: "fx-usdphp",
        topic: "usd-php",
        keywords: ["usd/php", "usd php", "peso", "dollar peso", "php", "currency", "fx"],
        content: "We expect the **PHP to range 55-57 vs USD** in 2025. BSP rate cuts may pressure the peso, but strong OFW remittances ($38B+) and tourism recovery provide support. For peso-denominated portfolios, we recommend maintaining 30-40% USD-hedged allocation to manage currency risk.",
        complianceNote: "Approved for client use. Currency risk disclaimer required.",
        source: "FX Strategy: USD/PHP — 2025"
    },
    {
        id: "fx-cny",
        topic: "cny",
        keywords: ["cny", "yuan", "renminbi", "rmb", "chinese currency"],
        content: "The **CNY faces mild depreciation pressure** (target: 7.3-7.5 vs USD) as PBOC maintains accommodative policy. Capital outflows remain a concern. For portfolios with China exposure, CNH-hedged share classes are recommended for non-USD clients.",
        complianceNote: "Approved for client use.",
        source: "FX Outlook: Asian Currencies — 2025"
    },
    {
        id: "fx-jpy",
        topic: "jpy",
        keywords: ["jpy", "yen", "japanese yen"],
        content: "The **JPY is expected to strengthen** modestly as BOJ continues gradual rate hikes. Target: 140-148 vs USD. This represents a headwind for unhedged Japan equity allocations but benefits JPY-denominated bond portfolios.",
        complianceNote: "Approved for client use.",
        source: "FX Outlook: Asian Currencies — 2025"
    },
    // ─── Asset Classes ───
    {
        id: "ac-equity",
        topic: "equity",
        keywords: ["equity", "equities", "stocks", "stock market", "shares"],
        content: "Global equities should deliver **mid-to-high single digit returns** in 2025. We recommend a balanced approach: 60% DM / 40% EM allocation for moderate risk profiles. Quality factor over momentum. Dividend-paying stocks provide downside cushion in volatile markets.",
        complianceNote: "Approved for client use.",
        source: "Global Equity Strategy — 2025"
    },
    {
        id: "ac-fi",
        topic: "fixed income",
        keywords: ["fixed income", "bonds", "bond", "yield", "interest rate", "treasury", "duration"],
        content: "Fixed income is **increasingly attractive** as central banks cut rates. We favor intermediate duration (3-5Y) corporate bonds (IG) for yield pickup. EM local currency bonds offer ~6-8% yields. Avoid long-duration in volatile rate environments. Philippine government bonds (5Y @ 6.1%) offer solid real yields.",
        complianceNote: "Approved for client use.",
        source: "Fixed Income Strategy — 2025"
    },
    {
        id: "ac-commodities",
        topic: "commodities",
        keywords: ["commodities", "commodity", "gold", "silver", "metals", "copper"],
        content: "**Gold is our top commodity conviction** — targeting $2,500-2,800/oz on central bank buying and geopolitical hedging demand. Copper benefits from electrification and data center buildout. We recommend 5-8% portfolio allocation to commodities for diversification.",
        complianceNote: "Approved for client use.",
        source: "Commodity Outlook — 2025"
    },
    // ─── Strategies ───
    {
        id: "str-esg",
        topic: "esg",
        keywords: ["esg", "sustainable", "sustainability", "green", "responsible", "impact"],
        content: "ESG integration continues to demonstrate **no performance penalty** over medium-to-long horizons. We recommend ESG-aware funds for client portfolios — particularly those with governance screens. ASEAN green bonds are a growing opportunity with tax incentives in several markets.",
        complianceNote: "Approved for client use. ESG methodology disclosure required.",
        source: "Sustainable Investing Framework — Manulife IM"
    },
    {
        id: "str-dividend",
        topic: "dividend",
        keywords: ["dividend", "income", "yield", "payout", "distribution"],
        content: "Dividend strategies are **well-suited for retirees and conservative profiles**. Asian dividend yields (3-5%) exceed global averages. Focus on companies with sustainable payout ratios below 60% and growing free cash flow. Dividend reinvestment significantly compounds long-term wealth.",
        complianceNote: "Approved for client use.",
        source: "Income Strategy: Asia Dividend — 2025"
    },
    {
        id: "str-dca",
        topic: "dca",
        keywords: ["dca", "dollar cost", "averaging", "regular investment", "systematic", "sip"],
        content: "Dollar-cost averaging remains our **recommended approach for lump-sum averse clients**. Historical analysis shows DCA outperforms lump-sum investing 40% of the time and significantly reduces regret risk. Monthly investment plans in diversified funds are the easiest way to implement.",
        complianceNote: "Approved for client use. General educational content.",
        source: "Behavioural Finance: DCA vs Lump Sum"
    },
    // ─── Macro ───
    {
        id: "macro-inflation",
        topic: "inflation",
        keywords: ["inflation", "cpi", "price", "cost of living"],
        content: "Global inflation is moderating toward central bank targets. We expect US CPI to average 2.3% in 2025, allowing the Fed to continue easing. Philippine CPI is under control at 3-4%, supporting BSP rate cuts. Portfolios should maintain inflation hedges through REITs, TIPS, and commodities.",
        complianceNote: "Approved for client use. Expiry: 2025-12-31.",
        source: "Global Macro Outlook — 2025"
    },
    {
        id: "macro-rates",
        topic: "interest rates",
        keywords: ["interest rate", "rate cut", "monetary policy", "central bank", "bsp", "fed rate"],
        content: "The global rate-cutting cycle is **firmly underway**. Fed funds target: 3.75-4.00% by year-end 2025. BSP has room for 75-100bps of cuts. Lower rates support equity valuations, compress bond yields (capital gains for existing holders), and reduce mortgage costs. Duration extension is warranted.",
        complianceNote: "Approved for client use.",
        source: "Monetary Policy Monitor — 2025"
    },
    {
        id: "str-retirement",
        topic: "retirement",
        keywords: ["retirement", "retire", "pension", "bucket strategy", "decumulation"],
        content: "For clients nearing retirement, we recommend a **'bucket strategy'**: allocate 2 years of living expenses to cash equivalents, 3-5 years to bonds, and the remainder to growth assets. This mitigates sequence-of-returns risk. Safe withdrawal rate: 3.5-4% adjusted for Philippine cost of living.",
        complianceNote: "General educational content only. Not specific advice.",
        source: "Retirement Planning Guide — 2025"
    },
    {
        id: "str-tax",
        topic: "tax",
        keywords: ["tax", "tax-loss", "harvesting", "capital gains", "tax efficiency"],
        content: "Tax-loss harvesting should be considered for non-registered accounts where unrealized losses exceed ₱250,000. For Philippine clients, long-term capital gains on listed securities are tax-exempt. Recommend maximizing PERA contributions (₱100,000/year) for tax-deferred growth.",
        complianceNote: "Tax advice disclaimer required.",
        source: "Tax Efficiency Whitepaper — Philippines"
    },
];

export interface RAGResult {
    answer: string;
    sources: { title: string; snippet: string }[];
    complianceBadge: "approved" | "needs_review" | "informational";
    disclaimers: string[];
}

export async function queryRAG(query: string): Promise<RAGResult> {
    const lowercaseQuery = query.toLowerCase();

    // Enhanced matching: check topic, keywords, and content
    const matchedDocs = HOUSE_VIEW_DOCS.filter(doc => {
        // Direct topic match
        if (lowercaseQuery.includes(doc.topic)) return true;
        // Keyword match
        if (doc.keywords.some(kw => lowercaseQuery.includes(kw))) return true;
        // Content word match (for broad queries)
        const contentWords = doc.content.toLowerCase().split(/\s+/);
        const queryWords = lowercaseQuery.split(/\s+/).filter(w => w.length > 4);
        const matchCount = queryWords.filter(qw => contentWords.some(cw => cw.includes(qw))).length;
        return matchCount >= 2; // At least 2 significant words match
    });

    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency

    if (matchedDocs.length === 0) {
        return {
            answer: "I couldn't find specific House View guidance on this topic in our approved research library. Please consult the full research portal or your team lead for the latest view. You can ask me about: **sectors** (tech, healthcare, energy), **countries** (PH, US, China, India), **currencies** (USD/PHP), or **strategies** (ESG, dividends, retirement).",
            sources: [],
            complianceBadge: "needs_review",
            disclaimers: []
        };
    }

    // Rank by relevance (keyword matches score higher)
    const scored = matchedDocs.map(doc => {
        let score = 0;
        if (lowercaseQuery.includes(doc.topic)) score += 10;
        doc.keywords.forEach(kw => { if (lowercaseQuery.includes(kw)) score += 5; });
        return { doc, score };
    }).sort((a, b) => b.score - a.score);

    const topDocs = scored.slice(0, 3).map(s => s.doc);
    const mainDoc = topDocs[0];

    let answer = `**${mainDoc.source}:**\n\n${mainDoc.content}`;

    if (topDocs.length > 1) {
        answer += `\n\n---\n\n**Related — ${topDocs[1].source}:**\n${topDocs[1].content}`;
    }

    const sources = topDocs.map(d => ({ title: d.source, snippet: d.content.substring(0, 120) + "..." }));

    let badge: RAGResult["complianceBadge"] = "approved";
    const disclaimers: string[] = [];

    if (topDocs.some(d => d.complianceNote.includes("disclaimer"))) {
        disclaimers.push("This information is for educational purposes only and does not constitute specific financial, tax, or legal advice.");
    }
    if (topDocs.some(d => d.complianceNote.includes("General educational"))) {
        badge = "informational";
    }

    return { answer, sources, complianceBadge: badge, disclaimers };
}
