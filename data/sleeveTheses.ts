// ─── Sleeve-scoped thesis blocks ──────────────────────────────────────────────
// One block per (ticker, sleeve) pair, keyed by sourceKey so the same ticker
// can live in multiple sleeves with different commentary. Surface the short
// `roleInPortfolio` line inside holdings tables; surface the full block on
// /positions/[ticker] when no positionDetails entry exists.
//
// Privacy: no dollar values, no price targets, no advice language.

export interface SleeveThesis {
  ticker: string;
  name: string;
  sleeve: string;
  /** One-line description shown next to the holding in the sleeve box. */
  roleInPortfolio: string;
  thesis: string;
  whyIOwnIt: string;
  keyRisks: string[];
  whatIAmWatching: string[];
  sizingView: string;
}

export const sleeveTheses: Record<string, SleeveThesis> = {
  // ─── 2027 Roth Fund ────────────────────────────────────────────────────────
  QQQM_2027_ROTH_FUND: {
    ticker: "QQQM",
    name: "Invesco NASDAQ 100 ETF",
    sleeve: "2027 Roth Fund",
    roleInPortfolio: "Large-cap growth and technology exposure",
    thesis:
      "QQQM gives the 2027 Roth Fund broad exposure to large-cap growth companies, with a heavy tilt toward technology, communication platforms, and scaled software businesses. I view it as a cleaner way to own the dominant public-market growth basket without making every decision company-specific.",
    whyIOwnIt:
      "My thesis is that the largest Nasdaq businesses still have durable earnings power, strong balance sheets, and exposure to long-term themes like AI, cloud software, digital advertising, and consumer platforms. QQQM also keeps the sleeve diversified instead of relying entirely on single-stock execution.",
    keyRisks: [
      "The ETF is concentrated in large-cap technology and growth stocks.",
      "Valuation compression could pressure returns even if the underlying companies continue to grow.",
      "The fund can overlap with other technology and AI-related holdings.",
    ],
    whatIAmWatching: [
      "Large-cap tech earnings durability",
      "AI capex and monetization trends",
      "Whether concentration in the top holdings becomes too high",
      "Relative performance versus broader market exposure",
    ],
    sizingView:
      "This is a core 2027 Roth Fund holding because it gives broad growth exposure without depending on one company.",
  },

  SMH_2027_ROTH_FUND: {
    ticker: "SMH",
    name: "VanEck Semiconductor ETF",
    sleeve: "2027 Roth Fund",
    roleInPortfolio: "Semiconductor and AI infrastructure exposure",
    thesis:
      "SMH gives the 2027 Roth Fund broad exposure to the semiconductor value chain. My thesis is that AI, cloud computing, data centers, autos, industrial automation, and advanced devices continue to require more compute, memory, and chip infrastructure over time.",
    whyIOwnIt:
      "I own SMH because it captures the semiconductor theme without forcing the sleeve to depend on one chip company. It gives exposure to the companies building the hardware layer behind AI and high-performance computing.",
    keyRisks: [
      "Semiconductors are cyclical and can sell off sharply when demand expectations reset.",
      "AI infrastructure sentiment could cool if spending grows faster than returns.",
      "The ETF may be concentrated in a few large semiconductor leaders.",
    ],
    whatIAmWatching: [
      "AI chip demand",
      "Data center capex trends",
      "Memory and foundry cycle signals",
      "Whether semiconductor valuations are pricing in too much growth",
    ],
    sizingView:
      "This is a high-conviction thematic holding, but it should not become the entire portfolio because the semiconductor cycle can turn quickly.",
  },

  VOO_2027_ROTH_FUND: {
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    sleeve: "2027 Roth Fund",
    roleInPortfolio: "Broad-market anchor",
    thesis:
      "VOO is the stabilizing core of the 2027 Roth Fund. It gives the sleeve broad exposure to the U.S. equity market and keeps the portfolio from becoming only a technology or AI-beta basket.",
    whyIOwnIt:
      "I own VOO because it gives diversified market exposure, lowers single-stock risk, and provides a baseline return profile. It helps balance the more aggressive positions in semiconductors, crypto-linked exposure, and thematic ETFs.",
    keyRisks: [
      "The S&P 500 still has meaningful concentration in large technology companies.",
      "Broad-market valuations can compress if rates rise or earnings expectations fall.",
      "VOO will not protect the sleeve from a full equity-market drawdown.",
    ],
    whatIAmWatching: [
      "S&P 500 earnings growth",
      "Market concentration in the largest companies",
      "Rate expectations",
      "Whether broad exposure remains large enough relative to thematic positions",
    ],
    sizingView:
      "This should remain one of the largest holdings because it is the broad-market anchor for the sleeve.",
  },

  FBTC_2027_ROTH_FUND: {
    ticker: "FBTC",
    name: "Fidelity Wise Origin Bitcoin Fund",
    sleeve: "2027 Roth Fund",
    roleInPortfolio: "Bitcoin-linked alternative exposure",
    thesis:
      "FBTC gives the 2027 Roth Fund Bitcoin exposure through an ETF structure. I view it as a small alternative sleeve that can behave differently from traditional equities, while still carrying high volatility.",
    whyIOwnIt:
      "My thesis is that Bitcoin can remain relevant as a scarce digital asset and a risk-on alternative store of value. Using FBTC keeps the exposure simple inside the brokerage sleeve instead of managing direct crypto custody.",
    keyRisks: [
      "Bitcoin is highly volatile and can draw down significantly.",
      "Crypto sentiment can change quickly.",
      "Regulatory changes, liquidity, and risk appetite can all impact performance.",
      "This position does not generate cash flow like an operating business.",
    ],
    whatIAmWatching: [
      "Bitcoin price trend",
      "ETF flows",
      "Risk appetite across crypto markets",
      "Correlation with growth equities",
    ],
    sizingView:
      "This should stay controlled because it is volatile and thesis-driven, not a core operating-business holding.",
  },

  QTUM_2027_ROTH_FUND: {
    ticker: "QTUM",
    name: "Defiance Quantum ETF",
    sleeve: "2027 Roth Fund",
    roleInPortfolio: "Quantum computing and emerging technology exposure",
    thesis:
      "QTUM gives the 2027 Roth Fund exposure to quantum computing, advanced computing, and related emerging technology themes. I view it as a speculative thematic position rather than a core holding.",
    whyIOwnIt:
      "My thesis is that quantum computing could become strategically important over time, even if commercialization is uncertain and the timeline is difficult to predict. The ETF structure spreads the risk across a basket instead of relying on one early-stage company.",
    keyRisks: [
      "Quantum computing may take longer to commercialize than expected.",
      "The ETF may include companies with only partial or indirect quantum exposure.",
      "The theme can trade on hype before fundamentals catch up.",
      "Smaller or speculative holdings can be volatile.",
    ],
    whatIAmWatching: [
      "Commercial progress in quantum computing",
      "Enterprise and government adoption signals",
      "Whether the ETF holdings actually match the intended theme",
      "Valuation and hype risk",
    ],
    sizingView:
      "This should remain a smaller thematic allocation because the opportunity is interesting but still early.",
  },

  // ─── 2028 Roth Fund ────────────────────────────────────────────────────────
  MU_2028_ROTH_FUND: {
    ticker: "MU",
    name: "Micron Technology",
    sleeve: "2028 Roth Fund",
    roleInPortfolio: "Memory cycle and AI infrastructure exposure",
    thesis:
      "Micron gives the 2028 Roth Fund direct exposure to one of the most important bottlenecks in the AI hardware stack: memory bandwidth. My thesis is that AI workloads are not only compute-intensive, but memory-intensive, especially as model sizes, inference workloads, and data center throughput requirements continue to grow. Micron benefits if high-bandwidth memory demand remains strong, DRAM pricing stays disciplined, and the memory cycle remains tighter than in past downturns.",
    whyIOwnIt:
      "I view MU as a cyclical AI infrastructure position rather than a traditional long-duration compounder. The setup is attractive because memory has historically been treated as a commodity cycle, but AI may create a higher-value mix shift toward specialized memory products. If Micron can expand its role in high-bandwidth memory while maintaining better pricing discipline across DRAM and NAND, earnings power could reset higher than the market expects.",
    keyRisks: [
      "Memory remains cyclical, and pricing can deteriorate quickly if supply growth exceeds demand.",
      "AI demand may not be enough to offset weakness in PCs, smartphones, or broader enterprise hardware.",
      "High-bandwidth memory growth could attract aggressive capacity additions and future margin pressure.",
      "The stock can re-rate sharply if investors believe the cycle is peaking.",
    ],
    whatIAmWatching: [
      "High-bandwidth memory revenue growth and customer adoption",
      "DRAM and NAND pricing trends",
      "Inventory levels across customers and competitors",
      "Gross margin recovery",
      "Whether management stays disciplined on capacity expansion",
    ],
    sizingView:
      "This can be one of the higher-conviction 2028 Roth Fund positions, but I need to treat it as cyclical. If memory pricing turns or AI demand expectations get too aggressive, the position should be reviewed quickly.",
  },

  OUST_2028_ROTH_FUND: {
    ticker: "OUST",
    name: "Ouster",
    sleeve: "2028 Roth Fund",
    roleInPortfolio: "Lidar, robotics, and spatial intelligence exposure",
    thesis:
      "Ouster gives the 2028 Roth Fund exposure to the broader idea that machines need better spatial awareness. My thesis is not simply that lidar will win in passenger vehicles. The more interesting case is that lidar adoption expands across robotics, industrial automation, mapping, smart infrastructure, security, and autonomous systems where perception quality matters. If these markets develop, Ouster could benefit from a broader sensing cycle beyond the original auto-focused lidar narrative.",
    whyIOwnIt:
      "I view Ouster as a speculative infrastructure position tied to automation and physical-world AI. As more machines interact with real-world environments, sensing and perception become more valuable. Ouster's opportunity depends on converting technical capability into durable customer adoption, improving unit economics, and showing that lidar demand is broadening across multiple end markets.",
    keyRisks: [
      "Lidar adoption has been slower and more uneven than early market expectations.",
      "The business is still execution-sensitive and may face margin, scale, and cash-flow pressure.",
      "Customer wins can take time to convert into meaningful revenue.",
      "The stock is likely to remain volatile because the market is still deciding how large the lidar opportunity really is.",
    ],
    whatIAmWatching: [
      "Revenue growth from non-auto markets",
      "Gross margin improvement",
      "Customer concentration and repeat orders",
      "Cash burn and balance sheet durability",
      "Evidence that lidar demand is becoming more recurring and less project-based",
    ],
    sizingView:
      "This is a speculative position. I want exposure to the theme, but the position should stay controlled until the company proves stronger revenue consistency and margin progress.",
  },

  PENG_2028_ROTH_FUND: {
    ticker: "PENG",
    name: "Penguin Solutions",
    sleeve: "2028 Roth Fund",
    roleInPortfolio: "AI infrastructure, integration, and compute deployment exposure",
    thesis:
      "Penguin Solutions gives the 2028 Roth Fund exposure to the less obvious parts of AI infrastructure: system integration, memory-intensive architectures, deployment complexity, and enterprise compute buildout. My thesis is that AI infrastructure demand will not only benefit the largest chip and cloud companies. As AI moves from experimentation into deployment, customers need help turning compute, memory, networking, and software into functioning systems.",
    whyIOwnIt:
      "I view PENG as a higher-risk way to express the second-order AI infrastructure trade. It is not a megacap platform company and it should not be treated like one. The attraction is that smaller infrastructure companies can benefit if AI demand broadens beyond hyperscalers and creates demand for specialized deployment, integration, and support. The risk is that this upside is more dependent on execution and customer timing.",
    keyRisks: [
      "AI infrastructure demand could slow if customers delay spending or struggle to earn returns on AI projects.",
      "Smaller infrastructure names can be punished quickly if revenue growth disappoints.",
      "Customer concentration, project timing, and margin variability could make results uneven.",
      "The stock may trade more on AI sentiment than on fundamentals in the short run.",
    ],
    whatIAmWatching: [
      "AI infrastructure revenue growth",
      "Customer wins and repeat demand",
      "Backlog quality and conversion",
      "Gross margin and operating leverage",
      "Whether the company can turn AI demand into durable earnings rather than one-time projects",
    ],
    sizingView:
      "This is a research-driven position, not a core anchor. I can justify owning it for upside exposure, but sizing should remain tied to evidence that the business is executing.",
  },

  NVTS_2028_ROTH_FUND: {
    ticker: "NVTS",
    name: "Navitas Semiconductor",
    sleeve: "2028 Roth Fund",
    roleInPortfolio: "Power semiconductors and electrification exposure",
    thesis:
      "Navitas gives the 2028 Roth Fund exposure to power semiconductors, a part of the chip market focused on efficiency rather than pure compute. My thesis is that power conversion becomes more important as data centers, EVs, industrial systems, consumer electronics, and energy infrastructure all require smaller, faster, and more efficient power systems. Navitas is a speculative way to express this theme through next-generation power semiconductor technology.",
    whyIOwnIt:
      "I view NVTS as a small-cap semiconductor position with asymmetric potential if its technology gains wider adoption. The company touches multiple end markets rather than a single one. The broader thesis is that higher power density and energy efficiency matter more as computing loads rise and electrification expands. If Navitas can translate design wins into scaled revenue, the business could become more strategically relevant.",
    keyRisks: [
      "Adoption of newer power semiconductor technologies may take longer than expected.",
      "The company is smaller and more execution-sensitive than established semiconductor peers.",
      "Revenue growth may not scale fast enough to offset operating losses or cash burn.",
      "Competition from larger power semiconductor companies could pressure margins and market share.",
    ],
    whatIAmWatching: [
      "Design wins converting into revenue",
      "Data center, EV, and industrial traction",
      "Gross margin progress",
      "Cash burn and balance sheet runway",
      "Evidence that customers are adopting the technology beyond pilot programs",
    ],
    sizingView:
      "This is a speculative semiconductor position. I want exposure to the power-efficiency theme, but the position should stay sized as high risk until revenue quality and profitability improve.",
  },

  FLY_2028_ROTH_FUND: {
    ticker: "FLY",
    name: "Firefly Aerospace Inc.",
    sleeve: "2028 Roth Fund",
    roleInPortfolio: "Space infrastructure and defense-adjacent growth exposure",
    thesis:
      "Firefly gives the 2028 Roth Fund exposure to space infrastructure, launch services, lunar missions, and defense-adjacent aerospace demand. My thesis is that space is becoming more strategically important across communications, national security, sensing, logistics, and orbital infrastructure. Firefly is a speculative position because the opportunity is large, but execution risk is also high.",
    whyIOwnIt:
      "I view FLY as a venture-style public-market position. The attraction is not current stability, but the possibility that launch capability, government contracts, and space infrastructure become more valuable over time. If the company can improve reliability, increase launch cadence, and win durable government or commercial work, the business could move from speculative theme to more credible aerospace platform.",
    keyRisks: [
      "Space companies are capital intensive and execution-heavy.",
      "Launch delays, mission failures, or contract timing can materially affect sentiment.",
      "Revenue visibility may be uneven, especially if contracts are lumpy.",
      "The stock can be highly volatile because the market is still learning how to value newer space infrastructure companies.",
    ],
    whatIAmWatching: [
      "Launch cadence and mission success",
      "Government and commercial contract wins",
      "Progress in lunar and orbital infrastructure opportunities",
      "Cash needs and financing risk",
      "Whether the company can build recurring demand rather than one-off milestones",
    ],
    sizingView:
      "This is one of the highest-risk positions in the sleeve. I want exposure to the theme, but it should be sized as speculative until execution becomes more proven.",
  },
};

export function getSleeveThesis(sourceKey: string): SleeveThesis | undefined {
  return sleeveTheses[sourceKey];
}
