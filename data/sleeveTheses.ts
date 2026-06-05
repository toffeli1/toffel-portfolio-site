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
      "Micron gives the 2028 Roth Fund direct exposure to memory, storage, and AI infrastructure demand. My thesis is that AI workloads increase the need for high-performance memory, and Micron can benefit if memory pricing and demand remain favorable.",
    whyIOwnIt:
      "I own MU because memory is a key part of the AI hardware stack, but it is different from owning the GPU leaders directly. The upside case depends on stronger memory demand, better pricing, and the role of high-bandwidth memory in AI systems.",
    keyRisks: [
      "Memory is cyclical and can move from shortage to oversupply.",
      "Margins can fall quickly if pricing weakens.",
      "AI-related demand may not be enough to offset broader cycle pressure.",
      "The stock can be volatile around cycle expectations.",
    ],
    whatIAmWatching: [
      "DRAM and NAND pricing",
      "High-bandwidth memory demand",
      "Data center memory demand",
      "Inventory levels and margin trends",
    ],
    sizingView:
      "This is a high-upside cyclical AI infrastructure position, so sizing should reflect the volatility of the memory cycle.",
  },

  OUST_2028_ROTH_FUND: {
    ticker: "OUST",
    name: "Ouster",
    sleeve: "2028 Roth Fund",
    roleInPortfolio: "Lidar and autonomy infrastructure exposure",
    thesis:
      "Ouster gives the 2028 Roth Fund exposure to lidar, autonomy, robotics, industrial automation, and spatial sensing. I view it as an early-stage infrastructure bet on machines needing better perception over time.",
    whyIOwnIt:
      "My thesis is that lidar adoption can expand beyond passenger vehicles into industrial, robotics, mapping, smart infrastructure, and security use cases. Ouster is higher risk, but it gives the sleeve exposure to a market that could grow if autonomy and automation continue to develop.",
    keyRisks: [
      "Lidar adoption has taken longer than many expected.",
      "The company may face execution, margin, and funding risk.",
      "Customer timing can be uneven.",
      "The stock can be highly volatile because the business is still early-stage.",
    ],
    whatIAmWatching: [
      "Revenue growth",
      "Gross margin improvement",
      "Customer wins",
      "Cash burn and balance sheet risk",
      "Evidence that lidar demand is broadening beyond auto",
    ],
    sizingView:
      "This is a speculative growth position and should be sized below core holdings unless execution improves materially.",
  },

  PENG_2028_ROTH_FUND: {
    ticker: "PENG",
    name: "Penguin Solutions",
    sleeve: "2028 Roth Fund",
    roleInPortfolio: "AI infrastructure and compute deployment exposure",
    thesis:
      "Penguin Solutions gives the 2028 Roth Fund exposure to AI compute infrastructure, memory-intensive workloads, and specialized deployment needs. I view it as a higher-risk way to express AI infrastructure demand beyond the mega-cap platform companies.",
    whyIOwnIt:
      "My thesis is that AI infrastructure demand can broaden beyond hyperscalers and create opportunities for companies involved in integration, memory, compute systems, and deployment. This is not a core anchor position, but it fits the sleeve as a research-driven AI infrastructure holding.",
    keyRisks: [
      "The position depends on AI infrastructure spending staying strong.",
      "Execution risk is higher than with larger platform companies.",
      "Customer timing and project-based demand can create volatility.",
      "The market may punish smaller AI infrastructure names if sentiment cools.",
    ],
    whatIAmWatching: [
      "AI infrastructure demand",
      "Customer concentration",
      "Revenue growth and margin trends",
      "Backlog or project timing",
      "Whether the thesis is supported by actual operating results",
    ],
    sizingView:
      "This should remain a speculative position with sizing tied to execution and confidence in the AI infrastructure cycle.",
  },

  NVTS_2028_ROTH_FUND: {
    ticker: "NVTS",
    name: "Navitas Semiconductor",
    sleeve: "2028 Roth Fund",
    roleInPortfolio: "Power semiconductor and electrification exposure",
    thesis:
      "Navitas gives the 2028 Roth Fund exposure to power semiconductors, especially around efficiency, fast charging, electrification, and higher-performance power conversion. I view it as a speculative small-cap semiconductor position.",
    whyIOwnIt:
      "My thesis is that demand for more efficient power systems can grow across data centers, EVs, industrial systems, consumer electronics, and renewable infrastructure. Navitas is higher risk, but it gives the sleeve exposure to a part of the semiconductor market focused on power efficiency rather than only compute.",
    keyRisks: [
      "The company is smaller and more execution-sensitive than established semiconductor peers.",
      "Adoption of newer power semiconductor technologies may take longer than expected.",
      "Revenue growth, margins, and cash burn need to be monitored closely.",
      "The stock may trade with high volatility.",
    ],
    whatIAmWatching: [
      "Design wins",
      "Revenue growth",
      "Gross margin progress",
      "Cash burn",
      "Adoption in data center, EV, and industrial end markets",
    ],
    sizingView:
      "This should be treated as speculative semiconductor exposure, not a core position.",
  },

  FLY_2028_ROTH_FUND: {
    ticker: "FLY",
    name: "Firefly Aerospace Inc.",
    sleeve: "2028 Roth Fund",
    roleInPortfolio: "Space, launch, and defense-adjacent growth exposure",
    thesis:
      "Firefly gives the 2028 Roth Fund exposure to space infrastructure, launch services, and defense-adjacent demand. I view it as a speculative position tied to the long-term commercialization and strategic importance of space.",
    whyIOwnIt:
      "My thesis is that launch, satellites, lunar infrastructure, and defense-related space capabilities can become increasingly important over time. Firefly is not a mature compounder yet, but it gives the sleeve exposure to a high-upside aerospace theme.",
    keyRisks: [
      "Space companies can be capital intensive and execution-heavy.",
      "Launch delays, mission failures, or contract timing can hurt sentiment.",
      "The company may be volatile because the market is still developing.",
      "This is a speculative position and should not be treated like a core ETF.",
    ],
    whatIAmWatching: [
      "Launch cadence",
      "Mission success",
      "Government and commercial contracts",
      "Cash needs",
      "Progress toward durable revenue",
    ],
    sizingView:
      "This is a high-risk thematic position, so sizing should stay controlled unless execution becomes more proven.",
  },
};

export function getSleeveThesis(sourceKey: string): SleeveThesis | undefined {
  return sleeveTheses[sourceKey];
}
