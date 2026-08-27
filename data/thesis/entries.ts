// ─── Thesis content ───────────────────────────────────────────────────────────
// Current-state research documents, one per holding. See ./types.ts for the two
// rules this file exists to honour: no shared analytical template, and no
// bolt-on risk section — the counter-argument sits inside the section that
// raises the opportunity.
//
// SOURCING RULE: the investment reasoning here is the portfolio owner's own,
// recorded from their notes. Business context (what a segment does, what a
// metric measures) is added for readability, but no additional *reasons to own*
// have been introduced. Where a view is deliberately cautious about sizing or
// competition, that caution is the owner's, not editorial hedging.
//
// Sections are ordered so the substantive analysis comes first. There is no
// generic "Why I Own It" opener — the spec asks the page to get into the
// business quickly.

import type { CompanyThesis } from "./types";

// Keyed by ticker, so each entry omits it — getThesis() injects it.
export const thesisEntries: Record<string, Omit<CompanyThesis, "ticker">> = {
  // ══ Cloud & compute platforms ═══════════════════════════════════════════

  AMZN: {
    headline: "Owned for AWS; the retail and logistics businesses are the ballast.",
    sections: [
      {
        heading: "AWS is the position",
        body: [
          "The central thesis is AWS. Cloud and compute demand should continue compounding, and AWS is one of the largest and highest-quality infrastructure businesses in the world. It sells capacity on a consumption basis to a customer base that spans startups through governments, which makes its revenue both recurring in practice and expandable as workloads grow.",
          "The reason this matters more now than it did three years ago is that AI workloads are additive to existing cloud migration rather than a substitute for it. Training consumes capacity in large contracted blocks; inference consumes it continuously once a model is deployed. Both land on the same infrastructure Amazon already operates at scale.",
        ],
      },
      {
        heading: "Retail, logistics and the optionality underneath",
        body: [
          "Beyond AWS, Amazon holds a dominant e-commerce position and logistics scale that few competitors can replicate. Robotics and longer-term automation are optionality. Neither is required for the thesis to work.",
          "Consolidated margins are the honest place to look for whether this is working. Retail is structurally lower-margin than cloud, so blended operating margin understates AWS while the capital spending for AI capacity runs through the same statements. Comparing Amazon's margin profile to a pure-play software business compares two different objects.",
        ],
        weighsRisk: true,
      },
      {
        heading: "Entry and what would change the view",
        body: [
          "I initiated the position on a pullback rather than earlier. That framing carries an obvious risk: buying a large-cap on weakness only works if the weakness was about price rather than about the business. The combination that would falsify it is AWS growth decelerating while capital spending stays elevated, which would mean the company is building into demand that is not arriving.\n\nSizing has to account for what else the book already owns. AWS, Google Cloud and Meta's data-center build are all funded out of the same AI capital-spending cycle, so the correlation between these holdings is higher than their different end markets suggest.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  GOOGL: {
    headline: "Search economics funding a cloud and AI infrastructure build, at a valuation that still looks reasonable.",
    sections: [
      {
        heading: "Search and Cloud are an unusually strong combination",
        body: [
          "Google Cloud and Search together are an unusually strong pairing. Search remains a highly profitable core business, generating the cash that funds infrastructure investment elsewhere in the company. Cloud's improving profitability and large compute demand and backlog support continued investment in that infrastructure.",
          "The two reinforce each other. Search throws off cash without needing much incremental capital, while Cloud consumes capital but now contributes operating income rather than only absorbing it. That shift from loss-making to profitable is what changed the investment case.",
        ],
      },
      {
        heading: "AI infrastructure spending and the demand behind it",
        body: [
          "Capital expenditure has risen sharply to build AI compute capacity. The defensible version of that spend is that it is backed by compute demand and contracted backlog rather than speculative capacity-building. The bear version is that the industry is collectively over-building, and that depreciation on this capacity lands in operating expenses before the revenue does.",
          "Both readings are live. What separates them is whether Cloud revenue and contracted backlog keep pace with the spending, not whether the spending itself is large.",
        ],
        weighsRisk: true,
      },
      {
        heading: "YouTube and Waymo as optionality",
        body: [
          "YouTube is a large advertising and subscription business in its own right, and I count it in the base case. Waymo I do not. It is a real option on autonomous mobility, but its value is not something I can underwrite with any precision, so the thesis does not lean on it.",
        ],
      },
      {
        heading: "Valuation and a deliberate cap on sizing",
        body: [
          "The valuation is considered reasonable relative to the quality and cash generation of the business, which is the main reason this is one of the larger positions in the book.",
          "I do not want it to grow much further. The portfolio already carries heavy exposure to hyperscalers, AI infrastructure and mega-cap technology, and Alphabet correlates with several other holdings. Capping it is a construction decision, not a judgment about the company. A position can be a good investment and still be the wrong size.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  META: {
    headline: "Buying operating earnings at a discount created by uncertainty over how the compute build gets monetized.",
    sections: [
      {
        heading: "Scale, operating earnings and the advertising engine",
        body: [
          "Meta can continue increasing its scale and competitive position. The advertising business converts an enormous user base into operating earnings at high margin, and that engine is what makes the rest of the story affordable.",
          "Advertising revenue decomposes into impressions delivered and price per impression. AI-driven ranking and targeting has been lifting the second of those, which is a measurable mechanism rather than a narrative.",
        ],
      },
      {
        heading: "The compute buildout and the monetization question",
        body: [
          "The market has punished the stock partly because management has been unclear about exactly how its large compute buildout will be monetized. That criticism is fair. The capital being committed is large and the return path has not been specified.",
          "The view taken here is that compute is becoming such an important resource that the infrastructure will prove valuable over time, even where the specific product route is currently undefined. The risk in holding that view is obvious. It argues from scarcity rather than from a demonstrated revenue line, and if monetization stays vague while depreciation accumulates, margins compress before any benefit appears.",
        ],
        weighsRisk: true,
      },
      {
        heading: "Valuation and sizing discipline",
        body: [
          "The valuation has been attractive relative to the quality of the business, which is the entry argument.",
          "Sizing stays controlled regardless, because the portfolio already has substantial mega-cap technology and compute exposure. Meta, Alphabet and Amazon share sensitivity to the same AI capex cycle, so treating them as three independent positions would understate the concentration actually being run.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  // ══ Enterprise software ═════════════════════════════════════════════════

  NOW: {
    headline: "Priced as an AI casualty; more plausibly an AI beneficiary.",
    sections: [
      {
        heading: "The discount and what is causing it",
        body: [
          "ServiceNow has been hit alongside software generally, because investors increasingly view AI agents as a threat to traditional software. The concern is coherent: if an agent can perform the work a seat-based subscription used to mediate, then seat counts and pricing power both come under pressure.",
          "The weakness looks more like a valuation discount than a deterioration in the opportunity. That distinction is the entire position, and it is also the risk: a re-rating driven by a structural fear does not reverse until results disprove the fear. Agents could also compress seat-based pricing outright, which would change the economics rather than just the multiple.",
        ],
        weighsRisk: true,
      },
      {
        heading: "Why agentic AI may work in ServiceNow's favor",
        body: [
          "ServiceNow could instead become one of the major beneficiaries of agentic AI. Workflows and enterprise automation become more valuable when software agents can actually execute them, not less. An agent needs a system of record, a permission model and an auditable process to act inside. That is what the platform already is.",
          "The measurable version of this argument is subscription revenue growth and margin, since a platform genuinely capturing agent workloads should show expansion rather than seat erosion.",
        ],
      },
    ],
    charts: [],
  },

  // ══ Payments ════════════════════════════════════════════════════════════

  MA: {
    headline: "Deliberate exposure away from AI and compute: a toll on payment volume.",
    sections: [
      {
        heading: "Diversification, on purpose",
        body: [
          "Mastercard gives the portfolio exposure away from the AI and compute theme. That is the primary reason it is here. Most of the book's risk is tied to one capex cycle, and a business whose revenue tracks consumer and commercial payment volume is driven by something largely unrelated.",
        ],
      },
      {
        heading: "Network economics and payment volume",
        body: [
          "The appeal is margins, network economics, and the long-term ability to compound alongside increasing total payment volume. Mastercard takes a small fee on volume crossing its network and carries almost no incremental cost per transaction, which is why operating margin sits where it does.",
          "Cross-border volume carries materially better economics than domestic transactions and is the most cyclical part of the mix, since it moves with travel and global commerce. Switched volume growth is the line that shows whether the network is gaining or losing share of spend.",
        ],
        weighsRisk: true,
      },
      {
        heading: "What the risk actually is",
        body: [
          "The network itself is genuinely hard to replicate, so competitive displacement isn't the real bear case. The real risk is regulatory pressure on interchange and scheme fees, plus the slow emergence of account-to-account rails that bypass card networks. Neither moves quickly, but both compress the toll rather than the volume. That's why operating margin, not payment volume, is the line to watch.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  // ══ Emerging markets ════════════════════════════════════════════════════

  MELI: {
    headline: "The portfolio's emerging-markets exposure, held as a long-term compounder.",
    sections: [
      {
        heading: "Structural growth in Latin America",
        body: [
          "MercadoLibre is the portfolio's only meaningful exposure outside the United States, and its economics are driven by household formation, credit access and payment adoption in Latin America rather than by enterprise technology budgets. That makes it one of the few holdings whose results do not depend on the AI capital-spending cycle.\n\nI considered the valuation reasonable relative to the growth and the quality of the franchise when I built the position.",
          "The business is two reinforcing engines: a commerce marketplace and a payments and credit operation built on top of it. Payments started as a way to make the marketplace work and became a large business in its own right.",
        ],
      },
      {
        heading: "Where the risk sits",
        body: [
          "The credit book is the part that deserves the most attention. Lending into Latin American consumer and small-business segments produces attractive yields precisely because the credit risk is real, and provisioning moves with local conditions. Currency is the second factor. Results are earned locally and reported in dollars, so devaluation can obscure genuine operating progress.",
          "Neither undermines the compounding argument, but both mean reported figures need reading in constant-currency terms to see the business underneath.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  // ══ Healthcare ══════════════════════════════════════════════════════════

  UNH: {
    headline: "A high-quality compounder bought after a severe drawdown.",
    sections: [
      {
        heading: "Quality, and why it was available",
        body: [
          "UnitedHealth is a high-quality compounder that has been heavily beaten down. Long-term demand for US healthcare should remain substantial, and the insurance model can generate attractive economics at scale. Premium revenue is recurring, and scale confers real advantages in cost of care and in data.",
          "The drawdown is the opportunity and the warning at the same time. Insurers de-rate when medical cost trend runs ahead of pricing, and that gap cannot close within a quarter because premiums are set annually in advance.",
        ],
        weighsRisk: true,
      },
      {
        heading: "Position history: reassessment and re-entry",
        body: [
          "There was a short period during which I sold the position and later rebuilt it. That sequence is best described as a reassessment followed by a re-entry: I exited the holding, re-examined the situation, and re-established the position.",
        ],
      },
      {
        heading: "What determines the outcome",
        body: [
          "The variable that matters is whether the medical loss ratio stabilises. Revenue growth is not the question for an insurer of this size. Margin is. Operating margin recovering toward its historical band would confirm the thesis; continued deterioration alongside further reserve strengthening would break it.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  OSCR: {
    headline: "A speculative position on growth plus genuine AI use inside insurance operations.",
    sections: [
      {
        heading: "Growth and the technology angle",
        body: [
          "This is a more speculative healthcare position. The appeal is strong growth combined with significant use of AI inside the insurance operation itself, applied to claims handling, utilization review and administrative cost rather than used as a marketing layer.",
          "For a smaller insurer that matters more than it would for an incumbent, because administrative expense is a larger share of the cost base. It is not sufficient on its own: underwriting still has to price medical cost correctly.",
        ],
      },
      {
        heading: "Why the position stays small",
        body: [
          "Oscar's revenue is concentrated in the ACA marketplace, which makes it directly exposed to subsidy policy and to annual risk-pool composition. A single unfavorable enrolment year, or a change to subsidy structure, moves the economics considerably.",
          "Reported earnings are also early and volatile, swinging on reserve development. Policy sensitivity plus thin, unstable margins is why I hold this small and treat it as speculative.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  // ══ Power ═══════════════════════════════════════════════════════════════

  CEG: {
    headline: "Relatively pure nuclear exposure to structurally rising electricity demand.",
    sections: [
      {
        heading: "Why nuclear, and why this vehicle",
        body: [
          "Constellation was preferred because it had pulled back, is more established, provides relatively pure exposure to the nuclear thesis, and has stronger underlying metrics than more speculative alternatives.",
          "The operational distinction that matters is availability. A reactor runs continuously, so it can serve loads that cannot tolerate interruption, and that is a different product from intermittent generation regardless of what either costs per megawatt-hour.",
        ],
      },
      {
        heading: "Data-center electricity demand and contracted volumes",
        body: [
          "The demand argument is that AI and data-center load is growing faster than new generation can be built. Constellation's existing fleet is already operating, which places it on the favorable side of that imbalance. Capacity that exists today is worth more than capacity that requires a decade of permitting.",
          "The value of that position depends on how much output is contracted and at what price. Long-term agreements convert a commodity generator into something closer to a contracted infrastructure business, but they also cap the upside if power prices rise faster than contracts reset.",
        ],
        weighsRisk: true,
      },
      {
        heading: "Generation economics and the honest downside",
        body: [
          "A generator earns a spread. Revenue moves with power prices while much of the cost base is fixed, so the leverage works in both directions and quarterly results are lumpy. A weak quarter often reflects power prices and outage scheduling rather than any change in the asset base.",
          "The real risks are an unplanned extended outage at a major unit, and power prices falling while the fixed cost of running a nuclear fleet does not.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  // ══ AI infrastructure ═══════════════════════════════════════════════════

  NBIS: {
    headline: "Scarce GPU capacity is converting into real revenue. I size it for the chance that hyperscalers still win.",
    sections: [
      {
        heading: "What the earnings result changed",
        body: [
          "I added to the position after earnings strengthened my conviction that scarce GPU compute demand is translating into real financial growth. That is the specific thing the report confirmed: not that demand exists, which was already visible, but that it is arriving as revenue.",
          "The thesis centers on very strong compute revenue growth, large contracted demand and backlog, scarce GPU capacity, strong utilization, and pricing power. Those are connected. Scarcity produces the pricing power, utilization turns installed capacity into revenue, and backlog makes the next period visible in advance.",
        ],
      },
      {
        heading: "Utilisation, pricing power and infrastructure intensity",
        body: [
          "The economics depend on keeping expensive hardware busy. A GPU fleet depreciates from the day it is installed, so utilization is the difference between an attractive return and a poor one. Pricing power holds only while capacity remains scarce relative to demand.",
          "This is an extremely capital-intensive business. Growth requires continuous investment in hardware, power and data-center space, which has to be financed before the revenue it generates arrives. Cost of capital is therefore a first-order variable rather than a financial detail.",
        ],
        weighsRisk: true,
      },
      {
        heading: "Competition from hyperscalers, and why sizing stays controlled",
        body: [
          "I keep it small because Nebius is extremely volatile and competes against hyperscalers with cheaper financing, larger balance sheets, greater infrastructure scale, and the ability to access capital at better rates. Every one of those is a durable advantage in a business where the constraint is capital and power rather than software.",
          "There is no assumption here that independent GPU cloud providers automatically win the long-term compute market. It is entirely possible that hyperscalers ultimately dominate compute, and that independents end up serving overflow demand at thinner margins. That possibility is why I keep it small rather than why I avoid it. The return if scarcity persists is large enough to justify a controlled allocation against a real chance of being wrong.",
        ],
        weighsRisk: true,
      },
      {
        heading: "Valuation basis",
        body: [
          "Earnings are not the right lens yet. The comparable basis against other neoclouds is a revenue multiple, and the peers worth comparing against are the other independent AI-infrastructure businesses, with CoreWeave the closest match on business model and capital structure. The hyperscalers compete hard for the same workloads, but a diversified platform's multiple describes a different financial object and should not be averaged in.",
        ],
      },
      // TODO(isaac): NBIS is +174.77% and dominates the account's excess
      // return. The sections above cover the original thesis in depth, but
      // not whether the size of the gain has changed the sizing decision.
      // Write one or two sentences: have you trimmed this position given how
      // large the move has been, or do you intend to, and why or why not?
      {
        heading: "Trim status",
        body: [
          "PLACEHOLDER: one or two sentences on whether NBIS has been trimmed given the size of the gain, or whether that's intended, and why.",
        ],
        isPlaceholder: true,
      },
    ],
    charts: [],
  },

  CBRS: {
    headline: "A direct, higher-risk expression of the view that agentic AI drives inference demand.",
    sections: [
      {
        heading: "The inference thesis",
        body: [
          "This is a higher-risk direct expression of the agentic-AI thesis. The underlying belief is that widespread deployment of AI agents will materially increase inference demand. Agents run continuously and call models repeatedly, which is a different and larger consumption pattern than occasional human prompting.",
          "Cerebras offers unusually direct exposure to that possibility through an architecture built for fast inference, rather than through a diversified platform where the effect would be diluted. The demand increase is a hypothesis, not an established trend.",
        ],
      },
      {
        heading: "Concentration, competition and why this is high-risk",
        body: [
          "The position is explicitly high-risk. Cerebras competes against NVIDIA, whose software ecosystem is the default for AI workloads, and against hyperscalers designing their own accelerators with guaranteed internal demand. Displacing an entrenched toolchain is much harder than beating it on any single benchmark.",
          "Revenue is also early and concentrated among a small number of customers, so the loss or deferral of one relationship moves reported results substantially. Reported quarters should be read with that fragility in mind rather than extrapolated.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  // ══ Semiconductors ══════════════════════════════════════════════════════

  SMH: {
    headline: "Compute exposure without picking a single winner in the semiconductor stack.",
    sections: [
      {
        heading: "Why a basket rather than a name",
        body: [
          "SMH holds the compute thesis without requiring a choice of a single winner. Design, manufacturing and equipment are different businesses with different economics, and the view here is about compute demand rather than about which layer of the stack captures it.\n\nThere is a tension worth naming. This portfolio moved away from index products on purpose, so holding a fund needs a reason beyond convenience. The reason is that semiconductor outcomes turn on process nodes, customer concentration and capital cycles I do not think I can handicap reliably at the single-name level. Where I cannot rank the companies, I would rather own the demand than guess the winner.",
        ],
      },
      {
        heading: "What holding the basket actually means",
        body: [
          "The fund is concentrated rather than diversified. A handful of the largest semiconductor companies dominate its weighting, so it behaves more like a leveraged position on a few names than a broad sector holding. Buying the basket avoids single-name selection risk. It does not avoid concentration.",
          "Semiconductors are also cyclical. The industry has always alternated between shortage and glut, and an AI-driven cycle is not exempt from that pattern.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  // ══ Space ═══════════════════════════════════════════════════════════════

  RKLB: {
    headline: "Electron generating revenue today, Neutron carrying the upside and the execution risk.",
    sections: [
      {
        heading: "Electron and launch cadence",
        body: [
          "Electron is the operating business. It launches regularly and generates revenue, which distinguishes Rocket Lab from most companies with comparable ambitions. Launch cadence is the metric that matters. Each launch is revenue, and a rising rate is the evidence that manufacturing and operations are working.",
        ],
      },
      {
        heading: "Neutron is where the upside is, and the risk",
        body: [
          "Neutron is the larger vehicle in development and carries most of the potential value. It is also the main risk. Development is progressing, but new launch vehicles are historically late and expensive, and a first flight is a binary event. Neutron matters enough to the upside case that schedule slippage or a materially more expensive development path would change the economics of the position.",
          "The recent selloff appeared larger than the underlying developments justified, which was the entry argument. The upside is substantial, but execution risk remains real, and I keep it relatively small precisely because the outcome remains high-risk.",
        ],
        weighsRisk: true,
      },
      {
        heading: "Backlog, revenue growth and the path to profitability",
        body: [
          "Backlog gives some visibility into future revenue, spanning launch contracts and the space-systems business that manufactures satellite components and spacecraft. That second segment is the less-discussed half of the company and currently the larger revenue contributor.",
          "The company is not profitable, and revenue growth is being funded by investment in Neutron. Gross margin trend and cash burn matter more here than revenue growth on its own. Growth that consumes more capital than it returns is not yet a business model.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  ASTS: {
    headline: "Asymmetric upside on direct-to-device connectivity, sized for a wide range of outcomes.",
    sections: [
      {
        heading: "Why confidence increased",
        body: [
          "This is an asymmetric-upside position. Orbital deployment has increased my confidence that the technical story is progressing. Moving from design to operating hardware in orbit removes a category of doubt that no amount of modeling could resolve.",
        ],
      },
      {
        heading: "The addressable market, and what stands between here and it",
        body: [
          "The theoretical addressable market is enormous, because direct-to-device connectivity could eventually reach phones globally without requiring new handsets. Working with mobile carriers rather than against them is what makes that distribution plausible.",
          "The word doing the work there is theoretical, and I do not treat that market as forecast revenue. Reaching any of it requires a full constellation, which requires sustained financing and a launch campaign in which every satellite is funded before it earns anything. Spectrum and regulatory clearance are needed market by market.",
        ],
        weighsRisk: true,
      },
      {
        heading: "Sizing against the downside",
        body: [
          "The downside and execution risks remain significant, so position sizing stays small. The range of outcomes here is genuinely wide. A working constellation and a failed deployment are both realistic, and the allocation reflects that rather than the attractiveness of the upside case alone.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  // ══ Defensive / portfolio-role holdings ═════════════════════════════════

  SGOV: {
    headline: "The portfolio's cash allocation: liquid, productive, and waiting for a better price somewhere else.",
    sections: [
      {
        heading: "Role in the portfolio",
        body: [
          "This is effectively the cash allocation. It keeps capital liquid and productive while waiting for attractive opportunities during a choppy market, and can be redeployed when individual holdings or the broader market create better entry points.",
          "Very short-dated Treasury bills carry almost no interest-rate sensitivity and no credit risk worth modeling. The trade-off is deliberate. This allocation is not expected to compound at an equity rate; it exists so a market dislocation can be acted on without selling something else on someone else's schedule.",
        ],
      },
      {
        heading: "The cost of holding it",
        body: [
          "The real cost is opportunity cost. In a rising market it lags, and its yield falls as short-term rates fall. That is the accepted price of holding the option to act.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  GLDM: {
    headline: "Gold as a stabiliser against a growth-heavy book, and a source of funds if equities fall.",
    sections: [
      {
        heading: "Why gold, and why now",
        body: [
          "Gold exposure was added for a period expected to remain uncertain. The market is still working through AI capex, monetization expectations, macroeconomic conditions, and geopolitical risk including conflict in the Middle East.",
          "The intended function is to provide stabilising exposure against a growth-heavy portfolio. Most of the book sits in equities sensitive to the same set of factors, and gold responds to largely different ones.",
        ],
      },
      {
        heading: "A funding source as much as a hedge",
        body: [
          "It can also be sold if equity-market weakness creates more attractive opportunities. That makes it closer to a second reserve than a permanent allocation.",
          "Gold produces no cash flow, so it cannot be valued on fundamentals and its price is set by what others will pay. It is also not a reliable hedge in every drawdown, since there are stretches when gold falls alongside equities. I hold it as diversification, not insurance, and I do not claim it compounds better than equities over time.",
        ],
        weighsRisk: true,
      },
    ],
    charts: [],
  },

  // ══ Historical / exited ═════════════════════════════════════════════════
  // Reachable through the Decision Log only. Kept as a record of the reasoning
  // at the time, not maintained as current research.

  VOO: {
    historical: true,
    sections: [
      {
        heading: "Exited as part of the strategy shift",
        body: [
          "I exited this position as part of the broader move away from broad S&P 500 indexing. The reasoning is recorded in the Portfolio Strategy note at the top of the Decision Log rather than as a company-specific view. Nothing about the fund itself prompted the sale.",
        ],
      },
    ],
    charts: [],
  },

  AMD: {
    historical: true,
    sections: [
      {
        heading: "Exited on valuation and relative preference",
        body: [
          "I exited the position because the narrative had moved ahead of the underlying story, and valuation had become less attractive, particularly relative to NVIDIA.",
          "After a very large move the odds of a consolidation period looked high, and the same capital seemed better used elsewhere. The company did not become worse; the expected return at that price did.",
        ],
      },
      {
        heading: "What the trims got right and wrong",
        body: [
          "The trims did what they were supposed to do. AMD hit 11.45% in May 2026, above my band, and I cut it back over several sessions on size rather than on view. That is the policy working, and AMD still ended up the largest realized contributor in the account.",
          "The part I would question is the gap between May and July. In May I said explicitly that the trim was not a thesis reversal. By late July I exited the rest on valuation. If the thesis was intact in May, something should have changed in the two months between, and I cannot point to what did. The honest read is that the July exit was partly a reaction to a position that had already been shrinking.",
        ],
      },
    ],
    charts: [],
  },

  CRWD: {
    historical: true,
    sections: [
      {
        heading: "Exited on valuation and narrative saturation",
        body: [
          "CrowdStrike is still considered a great business. The issue was valuation and narrative saturation rather than execution.",
          "The security thesis had become consensus and the business traded at a demanding valuation. When a story is that widely understood, there is little left for me to be early about.",
        ],
      },
    ],
    charts: [],
  },

  PENG: {
    historical: true,
    sections: [
      {
        heading: "Exited on dilution and risk/reward",
        body: [
          "This was always a speculative photonics position. Dilution concerns and a valuation that got harder to defend weakened the risk and reward, and I closed it rather than let a speculative holding grow into a thesis the fundamentals did not support.",
        ],
      },
    ],
    charts: [],
  },

  GEV: {
    historical: true,
    sections: [
      {
        heading: "Exited in favor of more focused nuclear exposure",
        body: [
          "This was never a large position. Constellation was preferred as a more direct way to hold the same view.",
          "GE Vernova sells equipment across several generation technologies, so a view specifically about nuclear economics arrives diluted. Rotating into an operator of existing reactors expressed that view without the rest.",
        ],
      },
    ],
    charts: [],
  },

  FBTC: {
    historical: true,
    sections: [
      {
        heading: "Exited because the position could not be justified",
        body: [
          "The original Bitcoin purchase was largely driven by FOMO, made as a less experienced investor.",
          "I could not explain Bitcoin's intrinsic value or defend why it deserved an allocation. Every position should have a reason behind it, and this one did not meet that standard.",
          "Weakening momentum reinforced the timing, but that was not the reason. The reason was that I could not articulate the case.",
        ],
      },
    ],
    charts: [],
  },
};
