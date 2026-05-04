// ─── Position detail data — edit this file to update scenarios and risks ─────
//
// Each entry maps a ticker to its detail content.
// All fields are optional: missing sections are simply hidden on the position page.
//
// Scenario shape:
//   title       — short headline (4-8 words)
//   summary     — one sentence describing the outcome
//   assumptions — 3-4 supporting bullets

export interface Scenario {
  title: string;
  summary: string;
  assumptions: string[];
}

export interface TrimEvent {
  date: string;           // "YYYY-MM-DD"
  quantity?: number;      // shares sold/bought — internal, not displayed publicly
  amountUsd?: number;     // internal, not displayed publicly
  pricePerShare?: number; // shown publicly if present
  type: "partial_trim" | "add" | "recurring_add" | "pending_stop_loss";
  explanation: string;
  inferred?: boolean;
}

export interface PositionDetail {
  /** Optional chartSymbol override if the chart ticker differs (e.g., ADRs). */
  chartSymbol?: string;
  /** "Why I Own It" — position motivation, sizing rationale, portfolio role. */
  whyIOwnIt?: string;
  /** "Why This Sleeve" — why this holding belongs in its specific account. */
  whyThisSleeve?: string;
  /**
   * Investment thesis paragraph 1.
   * When set, this replaces the short `thesis` field from holdings.ts as the
   * first displayed paragraph in the Investment Thesis section.
   */
  longDescription?: string;
  /** Investment thesis paragraph 2 — shown directly below longDescription. */
  thesisP2?: string;
  bullCase?: Scenario;
  baseCase?: Scenario;
  bearCase?: Scenario;
  /** Key risks shown as a numbered list. */
  risks?: string[];
  /** "What I'm Watching" — forward monitoring checklist. */
  watchList?: string[];
  /** Documented partial position reductions (partial trims, not full exits). */
  trimEvents?: TrimEvent[];
}

export const positionDetails: Record<string, PositionDetail> = {

  // ─── AI ────────────────────────────────────────────────────────────────────

  MRVL: {
    whyIOwnIt:
      "The custom ASIC buildout for hyperscaler AI infrastructure is one of the most durable secular themes in semiconductors. Marvell has secured multi-year co-design relationships with Google, Amazon, and Microsoft to build the silicon running their proprietary AI training and inference workloads. These aren't one-time chip orders — they're embedded engineering partnerships where Marvell teams own the full design-to-production cycle, creating switching costs that are nearly impossible to replicate in a single product cycle. I sized the position to reflect both the transformational scale of the ASIC opportunity and the real customer-concentration risk that demands some restraint.",
    whyThisSleeve:
      "MRVL sits in the taxable retail portfolio because the position has significant institutional coverage that creates earnings-driven volatility — guidance revisions, hyperscaler capex commentary, and design-win announcements all move the stock. The taxable sleeve gives me flexibility to harvest losses during those drawdowns or trim on outsized moves, which doesn't fit the long-duration, low-touch orientation of the Roth IRA.",
    longDescription:
      "Marvell Technology has transformed itself from a broad-market semiconductor supplier into one of the most important custom silicon partners in the AI infrastructure stack. Its custom ASIC division — building application-specific processors to hyperscaler specifications — has become the dominant revenue growth engine, with multiple major cloud providers in active co-development programs. These chips run everything from large-scale AI training fabric interconnects to edge inference accelerators, and each program represents a multi-year revenue commitment once it reaches production volume.",
    thesisP2:
      "The networking ASIC and PAM4 DSP businesses add a second layer of AI infrastructure exposure that is less covered by consensus. As data centers evolve from individual GPU servers to rack-scale and pod-scale AI clusters, the bandwidth demands for inter-chip and inter-rack communication grow exponentially. Marvell's 800G PAM4 and coherent DSP chips sit at the center of that transition, and the shift to 1.6T creates another replacement cycle. The combination of custom silicon design wins and networking expansion is why AI revenue can compound meaningfully beyond what the current multiple implies.",
    bullCase: {
      title: "ASIC Wave Beats Consensus",
      summary:
        "Hyperscaler custom silicon wins expand well beyond current estimates, driving 40%+ AI revenue compounding.",
      assumptions: [
        "Google, Amazon, and Microsoft ASIC programs ramp ahead of schedule",
        "Total AI revenue exceeds $5B by FY2027 as new hyperscaler wins are announced",
        "Networking ASIC wins in next-generation switching fabric programs add incremental TAM",
      ],
    },
    baseCase: {
      title: "Design Wins Ramp on Schedule",
      summary:
        "Existing custom silicon engagements execute as planned, sustaining 25-30% AI segment growth.",
      assumptions: [
        "Two major hyperscaler ASIC programs deliver production volume through 2025-2026",
        "Networking ASICs maintain market share as 800G/1.6T transitions proceed",
        "Gross margins stabilize above 55% as AI mix improves",
      ],
    },
    bearCase: {
      title: "Customer Concentration Bites",
      summary:
        "Dependence on a small number of hyperscalers creates binary program risk that the market underweights.",
      assumptions: [
        "Single hyperscaler program delay or cancellation materially impairs FY2026 revenue",
        "Broadcom competition intensifies in the custom ASIC market",
        "Data center capex cycle turns down earlier than consensus expects",
      ],
    },
    risks: [
      "Revenue concentration in a small number of hyperscaler relationships — a single program shift is a material event.",
      "Execution risk on complex custom silicon design-to-production cycles spanning 18-24 months.",
      "Competitive pressure from Broadcom and potential in-house ASIC development by hyperscalers.",
      "Macro-driven slowdown in AI capital expenditure could delay program ramp timelines.",
    ],
    watchList: [
      "Hyperscaler capex guidance updates — any reduction signals near-term program risk.",
      "New custom ASIC customer announcements — additional hyperscaler wins would be materially positive for the TAM narrative.",
      "800G to 1.6T transition timeline from hyperscaler network teams.",
      "Gross margin trajectory as AI mix grows — targeting a move toward 60%+.",
      "Broadcom ASIC win disclosures — any socket that shifts away from Marvell is a direct signal.",
    ],
  },

  POET: {
    whyIOwnIt:
      "POET is a platform bet on a specific inflection in how AI data centers handle optical connectivity. The optical interposer is an attempt to solve a real and growing problem: as GPU clusters scale, the bandwidth and power constraints of traditional pluggable transceivers start to bite, and the industry is converging on co-packaged optics as the next architectural standard. POET's interposer integrates photonic and electronic components on a single substrate using standard wafer-scale semiconductor processes — which, if it works at volume, produces a dramatically smaller, lower-power optical engine than what discrete transceiver designs can achieve. The position is sized to reflect that this is an early-stage company with real technology and real design-win momentum, but not a proven revenue ramp. It's a high-conviction, high-risk allocation on a platform that could become critical infrastructure for next-generation AI clusters.",
    whyThisSleeve:
      "POET is in the taxable retail portfolio because it carries the binary risk profile of an early-stage technology company — the outcome distribution is wide, and active position management matters. If the interposer platform wins at Tier 1 customers, the position should be sized up; if key design-ins stall, there's a rational exit. That kind of dynamic management doesn't fit the long-duration, low-touch orientation of the Roth IRA.",
    longDescription:
      "POET Technologies is building an optical interposer platform that co-packages photonic and electronic devices on a single semiconductor substrate using standard III-V wafer processes. The core product — the POET Optical Engine — is a highly integrated 800G-capable module designed for AI data center connectivity, produced with a manufacturing process that eliminates the need for labor-intensive active alignment steps used in conventional transceiver assembly. The result is a smaller form factor, lower power consumption, and a cost structure that scales with semiconductor volume rather than skilled assembly labor.",
    thesisP2:
      "The strategic logic is that co-packaged optics will become the dominant interconnect architecture for next-generation AI infrastructure, and POET's interposer positions the company to be a substrate and optical engine supplier to the major module manufacturers rather than competing head-to-head as a transceiver vendor. The asset-light licensing model — partnering with established manufacturers for volume production while retaining IP royalties — creates the potential for high-margin revenue if the platform achieves broad adoption. Key partnerships with Mitsubishi Electric and Taiwanese module manufacturers validate the platform's technical merit, but the transition from design-win to volume production revenue is the critical execution milestone the position is underwriting.",
    bullCase: {
      title: "Co-Packaged Optics Platform Wins",
      summary:
        "POET's optical interposer becomes the preferred substrate for 800G and 1.6T co-packaged optics modules, generating royalty and component revenue across multiple Tier 1 manufacturers.",
      assumptions: [
        "Co-packaged optics adoption accelerates as AI cluster bandwidth demands exceed pluggable transceiver limits",
        "POET's wafer-scale process achieves cost parity with discrete transceiver assembly at volume",
        "Multiple Tier 1 module manufacturers qualify the POET Optical Engine for hyperscaler supply chains",
      ],
    },
    baseCase: {
      title: "Design-Wins Convert to Volume Revenue",
      summary:
        "Existing design-in partnerships ramp to meaningful production volumes, establishing POET as a credible optical engine supplier.",
      assumptions: [
        "Mitsubishi Electric partnership and POET-TEGAS manufacturing JV ramp 800G optical engine shipments",
        "Revenue transitions from development contracts to repeating component and licensing revenue",
        "POET secures at least one direct hyperscaler qualification via a Tier 1 module partner",
      ],
    },
    bearCase: {
      title: "Design-Win Delays and Platform Competition",
      summary:
        "Volume ramp stalls as hyperscaler qualification timelines extend, while better-capitalized competitors advance alternative co-packaged optics approaches.",
      assumptions: [
        "Key design-win conversions to production volume slip by 12-18 months",
        "Intel Silicon Photonics, Broadcom, or Ayar Labs advance competing CPO architectures with stronger hyperscaler relationships",
        "POET requires additional equity raises to fund operations through an extended ramp, diluting existing shareholders",
      ],
    },
    risks: [
      "Early-stage execution risk — POET has not yet demonstrated sustained high-volume revenue from its optical engine platform.",
      "Platform competition from larger, better-capitalized companies including Intel, Broadcom, and vertically integrated Asian photonics suppliers.",
      "Customer concentration — success depends heavily on a small number of key design-win partnerships advancing to production.",
      "Capital requirements — as a pre-scale company, POET may need additional financing that could be dilutive if the ramp timeline extends.",
    ],
    watchList: [
      "Purchase order announcements and revenue guidance for 800G optical engines from Mitsubishi and POET-TEGAS.",
      "Hyperscaler qualification progress via Tier 1 module partners — the gating milestone for volume revenue.",
      "Co-packaged optics adoption timeline at major AI infrastructure builds — the broader market signal.",
      "Competitive developments: Intel Silicon Photonics, Broadcom CPO, and Ayar Labs customer announcements.",
      "Cash runway and any equity or debt financing activity given the pre-scale operating model.",
    ],
  },

  MU: {
    whyIOwnIt:
      "Memory is the most cyclical subsector in semiconductors, and that cyclicality creates the opportunity. Micron is the only American company in the global DRAM oligopoly — a three-player market where scale, process technology, and capital intensity create near-impenetrable barriers to entry. HBM3E is transforming what was previously a pure commodity cycle business into something with real pricing power with AI customers. I bought the position mid-inventory correction, anticipating the HBM ramp would arrive before standard DRAM normalized, giving Micron a window of particularly favorable blended ASPs. The position reflects both the cyclical recovery thesis and the structural HBM narrative.",
    whyThisSleeve:
      "MU is in the taxable retail portfolio because memory semiconductors require active position management through cycles — adding during downturns and trimming during upcycles. That dynamic doesn't fit the long-duration, set-and-compound orientation of the Roth IRA. Tax loss harvesting during memory cycle troughs has also historically been valuable in this name.",
    longDescription:
      "Micron Technology is the US anchor in the global DRAM oligopoly, competing with SK Hynix and Samsung in a market where scale, process technology, and capital intensity create near-impenetrable barriers to entry. The traditional DRAM business — commodity server, PC, and mobile memory — remains deeply cyclical and subject to oversupply risk, but High Bandwidth Memory is creating a structurally different revenue layer. HBM3E, the fourth-generation stacked memory required by NVIDIA's AI accelerators, commands ASP premiums of 5-8x over standard DRAM, and demand from AI training infrastructure is growing faster than any of the three producers can add capacity.",
    thesisP2:
      "Micron's competitive position in HBM has improved dramatically. With HBM3E qualification at NVIDIA and growing supply into AI training clusters, Micron is capturing share in a market where the pricing dynamics are fundamentally different from commodity DRAM. The key question for the next 12-18 months is the pace of standard DRAM inventory normalization — if PC and mobile destocking completes on schedule, blended ASPs should rise sharply as the AI-driven product mix improves. That combination creates earnings leverage that is among the highest of any semiconductor company in a recovery cycle.",
    bullCase: {
      title: "HBM Shortage Creates Pricing Power",
      summary:
        "AI accelerator demand dramatically outpaces HBM3E supply, giving Micron exceptional pricing leverage through 2026.",
      assumptions: [
        "HBM3E supply remains constrained as AI training cluster buildout outpaces capacity additions",
        "Micron captures 30%+ of HBM market as SK Hynix demand from NVIDIA saturates",
        "DRAM mainstream segment stabilizes, reducing blended-ASP headwinds",
      ],
    },
    baseCase: {
      title: "HBM Ramp Improves Revenue Mix",
      summary:
        "Micron's HBM capacity grows alongside demand, with AI server memory meaningfully improving blended ASPs.",
      assumptions: [
        "HBM3E commands a 20-25% ASP premium over standard high-density DRAM",
        "Data center DRAM demand outgrows PC and mobile, shifting mix favorably",
        "Consumer DRAM inventory correction completes by mid-2025",
      ],
    },
    bearCase: {
      title: "Memory Cycle Turns Before HBM Ramps",
      summary:
        "DRAM oversupply outside AI and commoditization pressure dampen blended ASPs across the portfolio.",
      assumptions: [
        "Consumer PC and smartphone DRAM demand remains weak, depressing standard DRAM pricing",
        "HBM ramp is slower than expected, keeping mix weighted toward lower-ASP products",
        "Samsung and SK Hynix add capacity aggressively, flooding the standard DRAM market",
      ],
    },
    risks: [
      "Semiconductor memory is among the most cyclical subsectors — a downturn can erase multiple years of earnings rapidly.",
      "Samsung and SK Hynix aggressive capacity expansion could oversupply the DRAM market.",
      "Geopolitical risk including incremental export controls on sales to China.",
      "HBM customer concentration — primarily NVIDIA supply chain — creates binary dependency.",
    ],
    watchList: [
      "HBM3E qualification status and supply agreements at customers beyond NVIDIA.",
      "Standard DRAM spot price trends — the leading indicator for the commodity segment recovery.",
      "SK Hynix and Samsung capacity announcements across both HBM and standard DRAM.",
      "MU's quarterly guidance for HBM revenue mix as a percentage of total data center revenue.",
      "Export control developments affecting China DRAM and NAND sales.",
    ],
  },

  LITE: {
    whyIOwnIt:
      "Lumentum was deeply in a trough when I established the position — telecom capex depressed, transceiver inventory elevated, and the market pricing in structural impairment rather than cyclical discount. The AI data center buildout thesis applies here directly, and Lumentum adds something most optical infrastructure names don't: a VCSEL franchise used in Apple Face ID and future AR/VR 3D sensing that data center-focused investors consistently undervalue. The position is sized as a differentiated optical play — transceiver recovery plus consumer photonics optionality in the same name.",
    whyThisSleeve:
      "LITE is in the taxable retail portfolio because optical component stocks are notoriously volatile around earnings — transceiver surveys, inventory data, and hyperscaler capex revisions all move the sector. The taxable sleeve gives the flexibility to manage the position through cycle swings rather than locking it into a long-duration hold.",
    longDescription:
      "Lumentum Holdings is a precision photonics company with two distinct businesses at different cycle points. The datacom and telecom optical networking segment — transceivers, amplifiers, and ROADMs — is recovering from an extended inventory correction as AI data center buildout accelerates. The consumer and industrial segment is centered on VCSELs (vertical-cavity surface-emitting lasers), which power 3D sensing in every iPhone shipped since the iPhone X, and are positioned to benefit from growing demand in AR/VR devices and automotive LiDAR.",
    thesisP2:
      "The optical networking recovery is the near-term catalyst, but the VCSEL franchise is the long-duration optionality I don't think is well-priced. Apple's dependence on Lumentum's VCSEL technology for Face ID creates a strategic supply relationship, and next-generation AR/VR headsets from Apple and Meta will require more advanced and higher-volume 3D sensing. If AR/VR adoption accelerates on a 3-5 year horizon, VCSEL volumes could grow significantly beyond what the current multiple implies — making this a two-vector thesis: optical networking recovery near-term, VCSEL expansion long-term.",
    bullCase: {
      title: "Transceiver and VCSEL Supercycle",
      summary:
        "Datacom transceiver design wins and recovering VCSEL demand for 3D sensing deliver above-consensus revenue across both business segments.",
      assumptions: [
        "Lumentum secures 800G transceiver sockets across multiple hyperscaler supply chains",
        "VCSEL demand for AR/VR and 3D sensing recovers alongside consumer hardware cycles",
        "ROADM orders in telecom stabilize as carriers resume network investment",
      ],
    },
    baseCase: {
      title: "Optical Recovery Continues Gradually",
      summary:
        "Lumentum recovers from an extended inventory correction as data center buildout accelerates.",
      assumptions: [
        "Datacom transceiver inventory digestion completes, enabling new order flow",
        "Telecom ROADM orders stabilize at reduced but sustainable run-rate levels",
        "Gross margins recover toward 40%+ as higher-value product mix grows",
      ],
    },
    bearCase: {
      title: "Extended Destocking Across End Markets",
      summary:
        "Telecom weakness and excess inventory delay the recovery well beyond current consensus.",
      assumptions: [
        "Telecom capex remains depressed through 2025 as carriers defer network upgrades",
        "Hyperscaler transceiver inventory digestion takes longer than the market expects",
        "Vertically integrated Asian transceiver suppliers gain share at 800G, pressuring Lumentum's datacom revenue",
      ],
    },
    risks: [
      "Significant exposure to telecom optical networking, which remains in a multi-year capex downturn.",
      "Competition from vertically integrated Asian suppliers and co-packaged optics entrants across the transceiver market.",
      "Customer concentration in a handful of major network equipment providers and hyperscalers.",
      "Inventory overhang risk — optical components have historically experienced severe destocking cycles.",
    ],
    watchList: [
      "800G transceiver order rates and any 1.6T design-in announcements from datacom customers.",
      "Apple VCSEL volume guidance — seasonally important in Q1-Q2 ahead of the iPhone production ramp.",
      "Telecom ROADM orders as a signal of carrier capex recovery.",
      "Gross margin recovery trajectory — watching for inflection back above 37-38%.",
      "Competitive socket dynamics at 800G — share movements among Lumentum, Innolight, and co-packaged optics challengers.",
    ],
  },

  ALAB: {
    whyIOwnIt:
      "Astera Labs is the purest expression of the AI infrastructure connectivity thesis I could find as a public equity. The company makes retimers — chips that clean up and regenerate high-speed signals across PCIe, CXL, and Ethernet fabrics — and every rack-scale AI cluster needs them. Unlike GPU companies where NVIDIA dominates, or custom ASIC companies with multi-year cycles, retimers are a near-infrastructure necessity deployed in every rack. Astera has established design wins at the major AI hyperscaler customers with its ARIES product line. The position reflects conviction in both the near-term retimer cycle and the longer-term CXL memory pooling opportunity, where Astera is positioning itself as foundational infrastructure.",
    whyThisSleeve:
      "ALAB is in the taxable retail portfolio because it's a small-cap company carrying more binary risk than the Roth IRA positions. I want the Roth IRA weighted toward larger, more durable compounders — ALAB belongs in a sleeve where I'm actively monitoring a concentrated growth bet and can rebalance more efficiently when valuation or thesis milestones change.",
    longDescription:
      "Astera Labs is a fabless semiconductor company that designs connectivity chips for AI and cloud infrastructure. Its core product, the ARIES PCIe and CXL Retimer, extends signal integrity across the high-speed serial connections inside data center rack enclosures — a necessity as PCIe Gen 5 and Gen 6 speeds exceed what passive copper connectors can handle without signal degradation. Every GPU server rack, every switch, and every memory expander in a modern AI cluster requires retimers, and Astera's ARIES product line has established itself as the design-win leader at multiple hyperscaler customers.",
    thesisP2:
      "The longer-duration thesis is CXL memory pooling. CXL (Compute Express Link) is an emerging interconnect protocol that allows CPU-accessible memory to be disaggregated and shared across multiple processors — critical for AI inference workloads that need to load very large models into shared memory pools. Astera's ARIES CXL retimers are positioned at the foundation of this transition, and if CXL becomes standard in next-generation AI infrastructure, the TAM expands well beyond today's PCIe retimer market. The company's gross margins above 70% and asset-light model mean incremental TAM expansion flows largely to the bottom line.",
    bullCase: {
      title: "CXL Becomes the AI Cluster Standard",
      summary:
        "PCIe and CXL connectivity emerge as the default AI infrastructure fabric, with Astera winning sockets across all major platforms.",
      assumptions: [
        "CXL 3.0 adoption accelerates as AI training clusters require shared memory pooling",
        "Astera retimers are designed into next-generation NVIDIA rack-scale products",
        "Inference customer diversification grows revenue beyond the training cluster base",
      ],
    },
    baseCase: {
      title: "ARIES Design Wins Ramp Predictably",
      summary:
        "Existing retimer design wins at major cloud providers ramp steadily through 2025-2026.",
      assumptions: [
        "ARIES retimer sockets in top-tier AI training clusters achieve volume production",
        "PCIe Gen 6 transition drives a product refresh cycle that Astera is positioned to win",
        "Gross margins sustained above 70% reflecting sustained product differentiation",
      ],
    },
    bearCase: {
      title: "Hyperscalers Internalize Connectivity",
      summary:
        "Large cloud providers develop in-house retimer alternatives, reducing Astera's addressable market.",
      assumptions: [
        "Major hyperscalers internalize PCIe retimer development, directly reducing Astera's TAM",
        "NVIDIA integrates connectivity functions on-package, reducing the need for discrete retimers",
        "Price competition from Montage and other fabless connectivity providers intensifies",
      ],
    },
    risks: [
      "Revenue concentration in a small number of hyperscaler customers makes each design win a high-stakes event.",
      "Structural risk that hyperscalers vertically integrate retimer and connectivity components over time.",
      "NVIDIA supply chain dependency — changes in platform architecture directly impact demand.",
      "Small-cap valuation premium creates downside risk if growth disappoints relative to elevated expectations.",
    ],
    watchList: [
      "PCIe Gen 6 adoption timeline — the next-generation refresh is the most important near-term catalyst.",
      "CXL 3.0 deployment announcements at hyperscalers.",
      "NVIDIA platform architecture announcements — any retimer content specified in Blackwell rack-scale products.",
      "Gross margin sustainability above 70% as volumes scale.",
      "Competition from Montage Technology and any in-house retimer development programs at hyperscalers.",
    ],
  },

  AMKR: {
    whyIOwnIt:
      "Advanced packaging has become the critical bottleneck in AI chip production — not lithography or chip design, but the physical integration of chiplets into a finished, functioning package. Amkor is the only large independent advanced packaging house with meaningful CoWoS and fan-out capacity outside of TSMC's own lines. When TSMC's in-house packaging is fully allocated to its own customers, AI chip designers have to turn to Amkor. I sized the position to reflect real exposure to this structural supply constraint while acknowledging Amkor's capital intensity and customer concentration in the Apple and TSMC supply chains.",
    whyThisSleeve:
      "AMKR is in the taxable retail portfolio because packaging stocks carry significant earnings volatility from utilization rate swings and customer mix changes. Active management through those cycles — adding during trough utilization, trimming at peak — is better suited to a taxable account than the long-duration, low-touch orientation of the Roth IRA.",
    longDescription:
      "Amkor Technology is the largest US-headquartered outsourced semiconductor assembly and test (OSAT) company, providing the advanced packaging that converts bare chiplets and wafers into finished, functional devices. The AI infrastructure buildout has elevated packaging — specifically advanced formats like CoWoS (Chip-on-Wafer-on-Substrate) and SoIC (System on Integrated Chips) — from a commodity service to a critical supply chain bottleneck. Every NVIDIA GPU, every AMD accelerator, and every custom ASIC requires advanced packaging, and TSMC's own in-house capacity cannot meet the full demand from its AI-focused customers.",
    thesisP2:
      "Amkor's position in the TSMC supply chain — as the primary independent CoWoS packaging partner — makes it a direct beneficiary of constrained in-house capacity at the foundry. As AI chip volumes scale through 2025-2026, the share of packaging outsourced to Amkor rather than handled in-house by TSMC grows. Meanwhile, the consumer electronics packaging recovery in Vietnam and Malaysia provides a margin-improvement tailwind on the legacy business. The combination of advanced packaging mix growth and mainstream utilization recovery should drive EBITDA margin expansion over the next two years.",
    bullCase: {
      title: "Advanced Packaging Capacity Shortage",
      summary:
        "AI chipmaker demand dramatically exceeds advanced packaging supply, giving Amkor exceptional pricing power and utilization.",
      assumptions: [
        "CoWoS and SoIC capacity remains constrained through 2026 as AI chip volumes ramp",
        "Apple, NVIDIA, and AMD advanced packaging orders sustain high utilization",
        "Amkor captures incremental CoWoS volume displaced from TSMC's constrained in-house lines",
      ],
    },
    baseCase: {
      title: "AI Packaging Mix Improves Gradually",
      summary:
        "Advanced packaging wins in the TSMC supply chain ramp gradually, improving revenue mix and margins.",
      assumptions: [
        "Advanced packaging grows from ~25% to 35%+ of total revenue over two years",
        "Vietnam and Malaysia facility utilization improves as consumer electronics recovery proceeds",
        "EBITDA margins expand 100-150 bps as advanced mix grows",
      ],
    },
    bearCase: {
      title: "TSMC Insources Advanced Packaging",
      summary:
        "TSMC expands its own advanced packaging capacity aggressively, reducing the outsourced market opportunity.",
      assumptions: [
        "TSMC CoWoS-S and CoWoS-L expansion reduces reliance on outside packaging partners",
        "Consumer electronics packaging cycle remains in a trough, depressing mainstream revenue",
        "Customer pricing pressure intensifies as chiplet packaging becomes more commoditized",
      ],
    },
    risks: [
      "TSMC vertical integration into advanced packaging is the primary structural risk to Amkor's TAM.",
      "Capital intensity — advanced packaging requires significant ongoing capex that constrains free cash flow.",
      "Customer concentration with Apple and TSMC supply chain participants.",
      "Technology transition risk if new packaging architectures (e.g., 2.5D alternatives) bypass current Amkor capabilities.",
    ],
    watchList: [
      "TSMC CoWoS capacity expansion announcements — the more TSMC insources, the less flows to Amkor.",
      "Advanced packaging revenue as a percentage of total Amkor revenue each quarter.",
      "New AI customer wins beyond the existing TSMC supply chain.",
      "Vietnam and Malaysia utilization rates as a proxy for consumer electronics recovery.",
      "Any NVIDIA or AMD packaging supply chain commentary in earnings calls.",
    ],
  },

  VRT: {
    whyIOwnIt:
      "Vertiv is one of the clearest fundamental beneficiaries of the AI infrastructure buildout — and unlike semiconductor companies, it doesn't carry binary customer-concentration or design-win risk. Every GPU cluster requires power distribution and thermal management, and as rack power density grows from 20kW toward 100kW and beyond, the entire data center power infrastructure needs replacing. Vertiv sells the power systems and liquid cooling products that sit between the utility grid and the compute. With $7B+ of contracted backlog and margin expansion underway, the earnings visibility here is among the highest in the portfolio. I sized it as a core holding that benefits from AI spending without requiring AI spending to be concentrated in any particular vendor.",
    whyThisSleeve:
      "VRT is in the retail portfolio as a core, larger-cap infrastructure holding. The position doesn't require the tax-advantaged compounding structure of the Roth IRA — it's a straightforward multi-year backlog conversion story that earns its keep in the main sleeve.",
    longDescription:
      "Vertiv Holdings designs and manufactures power and thermal management infrastructure for data centers, communication networks, and industrial facilities. The AI infrastructure buildout has made Vertiv's product categories — uninterruptible power supplies, precision cooling, power distribution units, and liquid cooling systems — the center of a significant capital expenditure cycle. As AI GPU clusters consume 10-20x the power of legacy server racks, hyperscalers and colocation providers are replacing their entire power and cooling infrastructure, and Vertiv is the market leader in the equipment required to do that.",
    thesisP2:
      "The liquid cooling transition is the most important long-duration growth driver. Traditional air cooling cannot handle the thermal load of high-density GPU racks; liquid cooling (direct liquid cooling, rear-door heat exchangers, immersion) is increasingly mandatory for AI cluster deployments. Vertiv has been investing in liquid cooling product development and is positioned to capture a disproportionate share of the upgrade cycle as data center operators retrofit existing facilities and build new ones designed for high-density workloads. The combination of backlog conversion, margin expansion toward 20%+ operating margins, and liquid cooling growth creates a multi-year earnings compounding story.",
    bullCase: {
      title: "Data Center Power Infrastructure Super-Cycle",
      summary:
        "AI data center power density requirements drive a decade-long infrastructure buildout with Vertiv as the primary beneficiary.",
      assumptions: [
        "GPU cluster power density grows from 20kW to 100kW+ per rack, requiring a complete power infrastructure refresh",
        "Liquid cooling adoption accelerates, with Vertiv's thermal products commanding premium margins",
        "Backlog converts at above-trend margins due to pricing discipline and operating leverage",
      ],
    },
    baseCase: {
      title: "Backlog Executes with Margin Expansion",
      summary:
        "Vertiv converts its multi-year backlog while expanding margins through pricing and operational improvements.",
      assumptions: [
        "$7B+ backlog provides 18-24 months of forward revenue visibility",
        "Adjusted operating margins expand toward 20%+ by 2026 from low-teen levels in 2023",
        "Cooling product revenues double over three years as thermal management demand grows",
      ],
    },
    bearCase: {
      title: "Macro Slowdown Stalls Data Center Capex",
      summary:
        "A broader economic slowdown causes hyperscalers to pause or reduce data center capital expenditure.",
      assumptions: [
        "Data center capex cycle pauses as AI ROI uncertainty grows among enterprise customers",
        "Order flow slows materially; backlog coverage shrinks below 12 months",
        "Supply chain issues or integration execution challenges compress margins below guidance",
      ],
    },
    risks: [
      "Data center capex is discretionary and can be reduced rapidly in a macro downturn.",
      "Significant backlog creates execution risk — operational issues affect multiple delivery commitments simultaneously.",
      "Customer concentration in a small number of hyperscalers and colocation providers.",
      "Rising interest rates increase the hurdle rate for large data center infrastructure projects.",
    ],
    watchList: [
      "Quarterly order intake and backlog trend — the leading indicator for revenue 12-18 months forward.",
      "Liquid cooling revenue and order mix as a percentage of total thermal products.",
      "Adjusted operating margin progression toward the 20%+ target.",
      "Hyperscaler capex guidance — any pullback would immediately affect Vertiv's order flow.",
      "Supply chain lead times for power components — a constraint on backlog conversion pace.",
    ],
  },

  CRWV: {
    whyIOwnIt:
      "CoreWeave went public with a differentiated pitch: purpose-built GPU cloud for AI workloads, not a general-purpose cloud with GPUs bolted on. The architecture — bare-metal NVIDIA GPU access, InfiniBand fabric, low-latency storage tuned for AI training — delivers performance per dollar that AWS, Azure, and Google Cloud can't match with their generalist infrastructure. The Microsoft anchor relationship and $15B+ contracted backlog provide meaningful near-term revenue visibility, which matters for a capital-intensive business still in its early innings. I sized this as a higher-risk, higher-conviction bet on the structural shift of AI training and inference workloads toward purpose-built infrastructure.",
    whyThisSleeve:
      "CRWV is in the taxable retail portfolio because it's a recently IPO'd company that will have significant lock-up expiration volatility and needs ongoing capital to fund GPU fleet expansion. Active position management as the story evolves is important here — the IRA's long-duration orientation doesn't suit a business requiring frequent reassessment of capital structure and competitive dynamics.",
    longDescription:
      "CoreWeave is a specialized cloud provider purpose-built for GPU-intensive AI and machine learning workloads. Unlike the hyperscalers, which serve general-purpose enterprise computing, CoreWeave runs an infrastructure stack optimized exclusively for AI: NVIDIA H100 and H200 clusters connected via InfiniBand, with storage, networking, and orchestration specifically tuned for distributed training jobs. This architectural focus allows CoreWeave to deliver meaningfully better GPU utilization and performance per dollar than general-purpose cloud providers. The Microsoft relationship — which includes both a cloud partnership and a large contracted workload commitment — validates the differentiated positioning.",
    thesisP2:
      "The core thesis is that enterprises running serious AI training workloads will increasingly choose purpose-built GPU clouds over general-purpose alternatives, and CoreWeave is the clearest expression of that trend as a public equity. The contracted backlog provides revenue visibility that most growth companies at this stage don't have. The key risks — capital intensity and customer concentration — are real, but the market is pricing them at a discount to what I believe the long-term revenue trajectory supports. If CoreWeave executes on customer diversification beyond Microsoft and converts its pipeline to contracts, the multiple should expand meaningfully.",
    bullCase: {
      title: "Purpose-Built GPU Cloud Wins Enterprise",
      summary:
        "Enterprise AI workloads standardize on CoreWeave's optimized GPU cloud, capturing a structural share of the market from general-purpose clouds.",
      assumptions: [
        "Enterprise AI training workloads migrate from AWS/GCP/Azure to CoreWeave's optimized infrastructure",
        "NVIDIA partnership deepens, providing priority access to next-generation GPU generations",
        "Microsoft contract expands; additional hyperscaler partnerships announced",
      ],
    },
    baseCase: {
      title: "Contracted Backlog Executes on Schedule",
      summary:
        "CoreWeave's contracted pipeline converts to predictable revenue, with customer diversification proceeding.",
      assumptions: [
        "$15B+ contracted backlog delivers revenue through 2026 with high visibility",
        "Enterprise customer additions diversify revenue beyond hyperscaler anchor contracts",
        "GPU utilization rates sustain above 80%, supporting unit economics",
      ],
    },
    bearCase: {
      title: "Hyperscalers Commoditize GPU Cloud",
      summary:
        "AWS, Google, and Azure aggressively expand their own GPU capacity, undermining CoreWeave's differentiation and pricing.",
      assumptions: [
        "AWS Trainium and Google TPU deployments reduce demand for NVIDIA-based clusters",
        "General-purpose clouds leverage existing enterprise relationships to win AI workloads",
        "CoreWeave's capital intensity creates refinancing risk if revenue growth disappoints",
      ],
    },
    risks: [
      "Business model requires continuous large-scale capital raising against long-duration GPU leases, creating refinancing risk.",
      "Revenue highly concentrated in a small number of customers — Microsoft alone represents a large portion.",
      "Technology risk if NVIDIA GPU pricing or availability shifts materially.",
      "Competition from well-capitalized hyperscalers with existing enterprise relationships and bundled services.",
    ],
    watchList: [
      "Customer diversification — new enterprise customers and the Microsoft revenue concentration ratio.",
      "GPU utilization rates as a measure of asset efficiency against the capital deployed.",
      "New contracted backlog announcements — pipeline conversion is the key forward indicator.",
      "Debt structure and refinancing timeline — capital market conditions matter significantly here.",
      "Competitive GPU cloud pricing from AWS, Google, and Azure, which sets the ceiling on CoreWeave's rate card.",
    ],
  },

  PLAB: {
    whyIOwnIt:
      "Photronics is the most overlooked company in the AI semiconductor supply chain. Photomasks are the templates used to print every chip — every NVIDIA GPU, every custom ASIC, every memory chip — and photomask demand grows directly with semiconductor production volume at advanced nodes. Photronics holds roughly half the global advanced photomask market, and the barriers to entry are nearly insurmountable: an EUV-era mask shop requires hundreds of millions in infrastructure investment, years of process development, and foundry qualification. At the time of purchase, it was trading at a single-digit earnings multiple with a clean balance sheet and growing advanced node exposure. It's the most asymmetric risk/reward in the portfolio relative to the quality of the underlying business.",
    whyThisSleeve:
      "PLAB is in the taxable retail portfolio as a value-oriented semiconductor infrastructure play. It's not a high-growth compounder — it's a durable, cash-generative business with consistent free cash flow that benefits from higher AI chip volumes. The Roth IRA is reserved for positions with longer compounding runways; PLAB fits better as a steady earner in the main sleeve.",
    longDescription:
      "Photronics is one of only two significant independent manufacturers of photomasks — the precision glass plates used to transfer circuit patterns onto silicon wafers during chip fabrication. Every semiconductor chip, from AI accelerators to memory to processors, requires a set of photomasks to be manufactured. Advanced node masks (7nm and below) are technically demanding to produce and require EUV-compatible infrastructure that has effectively eliminated new entrants. Photronics holds approximately 50% of the advanced photomask market at leading foundries including TSMC and Samsung, which creates durable, recurring revenue tied directly to semiconductor production volumes.",
    thesisP2:
      "The AI chip volume ramp is a direct tailwind for photomask demand — more chips being manufactured at advanced nodes means more mask sets being ordered, at prices that have been rising with complexity. EUV adoption has actually been net positive for Photronics: while each EUV exposure step requires fewer masks than equivalent multi-patterning, the overall mask set prices have risen substantially as complexity increases. The company generates consistent free cash flow, has no debt, and trades at a significant discount to the broader semiconductor supply chain. The combination of earnings quality, balance sheet strength, and the market's tendency to overlook unsexy enablers is what attracted me to the position.",
    bullCase: {
      title: "Advanced Node Oligopoly Expands",
      summary:
        "Photomask demand grows with leading-edge AI chip production volumes, and Photronics captures expanding share in an oligopolistic market.",
      assumptions: [
        "7nm and below photomask demand grows 20%+ annually as AI chip volumes scale at TSMC and Samsung",
        "Photronics expands capacity in Singapore and Taiwan ahead of demand",
        "EUV mask complexity increases, raising barriers to entry and sustaining premium pricing",
      ],
    },
    baseCase: {
      title: "Steady Share Compounds at Advanced Nodes",
      summary:
        "Photronics maintains market share in advanced nodes, with volumes growing in line with semiconductor production.",
      assumptions: [
        "Advanced node market share sustains at ~50% for leading foundry customers",
        "China operations continue contributing despite export control headwinds",
        "EPS compounds driven by operating leverage as fixed costs are spread over growing revenue",
      ],
    },
    bearCase: {
      title: "EUV Reduces Photomask Layer Count",
      summary:
        "EUV adoption reduces total photomask layers required per chip, dampening demand growth below current expectations.",
      assumptions: [
        "High-NA EUV adoption reduces total mask set complexity over the 2-3 year horizon",
        "China business faces incremental export control restrictions",
        "Fab utilization in memory and logic remains below cycle highs, reducing mask demand",
      ],
    },
    risks: [
      "EUV technology evolution could reduce the total photomask count per chip over time.",
      "China business exposure subject to incremental U.S. export controls.",
      "Concentrated customer base in leading-edge foundries — TSMC, Samsung, and Intel each represent significant revenue.",
      "Semiconductor cycle sensitivity — photomask demand follows fab utilization rates with limited insulation.",
    ],
    watchList: [
      "Advanced node revenue growth and mix — the percentage from 7nm and below masks each quarter.",
      "TSMC and Samsung fab utilization commentary — a leading indicator for mask order rates.",
      "China revenue trends and any incremental export control disclosures.",
      "Free cash flow generation and capital allocation (buybacks, capacity investment).",
      "High-NA EUV adoption timeline — the next-generation lithography tool that will reshape mask complexity.",
    ],
  },

  // ─── Defense / Drone ───────────────────────────────────────────────────────

  AVEX: {
    whyIOwnIt:
      "AEVEX Aerospace is the largest position in the portfolio at 20%, and that concentration reflects a long-standing relationship and an information edge that goes beyond public market analysis. AEVEX builds autonomous unmanned aircraft systems for DoD customers — primarily long-endurance ISR (intelligence, surveillance, and reconnaissance) platforms that can operate in contested environments. Autonomous systems have proven decisive in active conflicts globally, and the DoD's programmatic shift toward attritable and autonomous ISR is accelerating on a timeline that aligns directly with AEVEX's capabilities. The conviction behind the position size reflects not just the macro tailwind but specific knowledge of the technology, the team, and the program pipeline.",
    whyThisSleeve:
      "AVEX is in the retail taxable portfolio because the position requires active monitoring and potential follow-on decisions as the company matures. Unlike a publicly traded stock, this holding may involve secondary market transactions, pro-rata rights, or other events that require flexibility — all of which are easier to manage in a taxable brokerage account than within the constraints of an IRA.",
    longDescription:
      "AEVEX Aerospace is a defense technology company specializing in autonomous unmanned aerial systems, sensor integration, and intelligence payloads for the U.S. Department of Defense and allied governments. The company's platforms are designed for persistent ISR — long-duration missions in denied or degraded environments where commercial off-the-shelf drones cannot operate. AEVEX's technology stack spans the full autonomous mission profile: airframe, flight control, sensor fusion, ground control, and data exploitation, giving it a systems integration capability that point-solution drone companies lack.",
    thesisP2:
      "The secular driver behind the position is the DoD's structural shift toward autonomous systems as a force multiplier. Autonomous ISR reduces the human cost of sustained surveillance missions, improves mission persistence in contested airspace, and generates intelligence at a fraction of the per-flight cost of manned platforms. Budget pressure to do more with less, combined with the demonstrated effectiveness of autonomous systems in recent conflicts, has moved this from a research priority to an operational procurement priority. AEVEX's existing program relationships, mission-proven platforms, and technical depth in long-endurance autonomous operations position it well within a defense procurement environment that is moving decisively toward unmanned systems.",
    bullCase: {
      title: "UAV Program Awards Accelerate",
      summary:
        "Government demand for autonomous unmanned systems accelerates sharply, with AEVEX capturing significant new DoD program awards.",
      assumptions: [
        "DoD autonomous systems budget expands materially as UAV warfare proves decisive in active conflicts",
        "AEVEX wins competitive awards beyond the existing program base",
        "Allied nation export sales open additional revenue streams beyond U.S. government",
      ],
    },
    baseCase: {
      title: "Existing Contracts Execute on Schedule",
      summary:
        "Current defense program deliveries proceed on schedule, with steady-state revenue and contract renewals.",
      assumptions: [
        "Active duty UAV programs deliver against existing contracts without program delays",
        "Contract renewals and follow-on awards maintain multi-year revenue visibility",
        "Margin improvement as early-stage program development costs burn off",
      ],
    },
    bearCase: {
      title: "Budget Risk and Program Delays",
      summary:
        "Continuing resolutions or program restructuring delay contract funding and new awards.",
      assumptions: [
        "Continuing resolutions limit new program starts and expanded contract orders",
        "Competitive pressure from Anduril, Shield AI, and traditional primes intensifies",
        "Technical challenges on advanced autonomy features cause program milestone delays",
      ],
    },
    risks: [
      "Defense contracts subject to appropriations risk — continuing resolutions and budget uncertainty affect program pace.",
      "Competition from well-capitalized autonomy-focused companies including Anduril and Shield AI.",
      "Sole-source or limited-competition contracts are subject to periodic recompete risk.",
      "Technology development risk on advanced autonomous capabilities required by next-generation programs.",
    ],
    watchList: [
      "DoD budget resolutions and autonomous systems program funding levels in each annual defense authorization.",
      "New program award announcements and contract scope expansions.",
      "Allied nation export sales — international demand is a meaningful incremental TAM.",
      "Competitive activity from Anduril and Shield AI in overlapping program categories.",
      "Technical milestone completions on next-generation autonomy features required for program advancement.",
    ],
  },

  // ─── Energy ────────────────────────────────────────────────────────────────

  COP: {
    whyIOwnIt:
      "Energy is an inflation hedge and a portfolio diversifier in a book that's otherwise heavily weighted toward AI and technology. ConocoPhillips is the best-managed independent E&P in the business — the lowest sustaining cost structure in its peer group, the most disciplined capital allocator, and the highest free cash flow yield among large-cap producers at mid-cycle prices. The thesis isn't a bet on oil prices rising; it's a bet that COP generates exceptional free cash flow across a wide range of commodity price outcomes and returns that capital to shareholders through buybacks and a growing variable dividend. It functions as the portfolio's commodity hedge and performs best precisely when AI infrastructure spending decelerates.",
    whyThisSleeve:
      "COP is in the retail portfolio as an energy sector allocation. Oil companies generate significant ordinary dividends and periodically large special dividends — managing the timing and tax treatment of those distributions alongside other income is easier in the taxable account than within the contribution constraints of the Roth IRA.",
    longDescription:
      "ConocoPhillips is the largest independent oil and gas exploration and production company in the world, with a cost structure and capital discipline that consistently generates free cash flow above its peers across commodity cycles. The company's asset base — concentrated in the Permian Basin, Eagle Ford, Alaska, and through its APLNG interest in Australia — is built around low-cost, long-duration reserves that generate competitive returns even at $50-60 per barrel. Unlike integrated majors, COP has a pure-play E&P focus that translates commodity price upside directly into shareholder returns.",
    thesisP2:
      "The capital return program is the primary value driver over a 3-5 year horizon. COP has committed to returning over 30% of operating cash flow to shareholders through the cycle, and that discipline has been consistent through the 2020 downturn and the subsequent recovery. The LNG Canada project — now in early production — adds a growing non-US revenue stream with long-term supply agreements. The combination of a low-cost base, a growing dividend, an active buyback, and energy's position as a structural inflation hedge makes COP a durable holding that earns its place in a diversified portfolio.",
    bullCase: {
      title: "Oil Structural Repricing Above Consensus",
      summary:
        "Supply discipline and AI-driven power demand create a structural oil price floor well above current consensus assumptions.",
      assumptions: [
        "OPEC+ discipline holds, keeping supply growth below demand growth through 2026",
        "AI data center power demand creates incremental oil and gas demand not modeled by consensus",
        "COP's low-cost Permian and Alaskan assets generate exceptional FCF above $85/bbl",
      ],
    },
    baseCase: {
      title: "Disciplined Capital Return Compounds",
      summary:
        "COP generates strong free cash flow at $70-80/bbl, systematically returning capital through buybacks and dividends.",
      assumptions: [
        "Oil price sustains in the $70-80 range, consistent with the current forward curve",
        "FCF yield of 8-10% funds a growing buyback and variable dividend program",
        "LNG Canada and other growth projects deliver on schedule and on budget",
      ],
    },
    bearCase: {
      title: "Energy Transition Impairs Long-Run Value",
      summary:
        "Faster-than-expected EV adoption and efficiency gains reduce long-run oil demand, impairing reserve valuations.",
      assumptions: [
        "EV adoption curve steepens beyond current forecasts, beginning to suppress gasoline demand by 2027",
        "Structural global oil demand growth slows materially after 2025",
        "Reserve replacement economics deteriorate under lower long-run price assumptions",
      ],
    },
    risks: [
      "Commodity price volatility is the primary earnings driver — oil at $50/bbl significantly impairs free cash flow.",
      "Energy transition acceleration from EV adoption and policy-driven efficiency mandates.",
      "Geopolitical disruption risk in key operating regions including Alaska and global LNG.",
      "Climate regulation and potential carbon taxation increasing the structural cost base over time.",
    ],
    watchList: [
      "Oil price and OPEC+ production discipline — the primary FCF determinant.",
      "Quarterly buyback pace and variable dividend declarations as signals of management confidence.",
      "LNG Canada production ramp and realized pricing.",
      "Permian and Alaska production guidance for cost-per-barrel trends.",
      "COP's break-even oil price disclosures — the key metric for assessing downside protection.",
    ],
  },

  BWXT: {
    whyIOwnIt:
      "BWXT is the most durable compounder in the portfolio — a regulated monopoly in naval nuclear propulsion with no realistic competition and no plausible path for a competitor to enter. Every nuclear-powered US Navy submarine and aircraft carrier requires BWXT components, and those ships are a core national security platform that gets funded in nearly every budget environment. The nuclear renaissance thesis — SMR programs, reactor restarts driven by AI data center power demand, and medical isotope applications — layers growth optionality on top of a business that would compound reliably without any of it. I hold it as the portfolio's defensive anchor: it performs in down markets, inflation environments, and periods when the rest of the book faces headwinds.",
    whyThisSleeve:
      "BWXT is in the retail portfolio as a steady, bond-like compounder with defense characteristics. Its consistent cash generation and multi-year contract visibility make it well-suited for the main sleeve — it doesn't need the Roth IRA's tax-free compounding to add value, and holding it in a taxable account allows me to take dividends and manage distributions as income.",
    longDescription:
      "BWX Technologies is the sole supplier of nuclear reactors, components, and fuel for the US Navy's submarine and aircraft carrier fleet — a monopoly position established over decades of classified nuclear engineering that no commercial competitor can replicate. Every naval nuclear propulsion program flows through BWXT, giving the company multi-year revenue visibility from DoD contracts that are among the most stable in the defense industry. Beyond the Navy business, BWXT operates nuclear fuel processing facilities for the Department of Energy and a growing radioisotope production business serving medical and industrial applications.",
    thesisP2:
      "The nuclear renaissance optionality is underappreciated by the market. AI data centers are creating an electricity demand surge that the grid cannot meet with intermittent renewable sources, and nuclear power is increasingly being positioned as the only viable baseload solution at the required scale. BWXT's advanced reactor programs — including portable and micro-reactor designs for DoD forward operating bases and remote industrial applications — put the company at the intersection of defense, energy, and AI infrastructure in a way that no other company can replicate. If even one of these commercial programs achieves scale, it would be transformational for a company already growing its core business at a steady double-digit rate.",
    bullCase: {
      title: "Nuclear Renaissance Expands BWXT's Mandate",
      summary:
        "AI data center power demand drives accelerated nuclear procurement, expanding BWXT's government monopoly into new commercial markets.",
      assumptions: [
        "DoD advanced naval nuclear propulsion orders increase as fleet modernization accelerates",
        "Micro-reactor programs receive expanded government funding for data center power applications",
        "BWXT's radioisotope programs win new medical and space applications contracts",
      ],
    },
    baseCase: {
      title: "Government Contracts Compound Steadily",
      summary:
        "Long-duration DoD and DoE contracts provide multi-year revenue certainty, with low-risk compounding.",
      assumptions: [
        "Navy nuclear propulsion contracts provide 3-5 year forward revenue visibility",
        "Uranium processing and medical isotope revenues add stable recurring income streams",
        "Steady margin improvement as program maturity and operating leverage increase",
      ],
    },
    bearCase: {
      title: "Defense Budget Sequestration Delays Programs",
      summary:
        "Across-the-board defense budget cuts or continuing resolutions slow the pace of DoD nuclear program spending.",
      assumptions: [
        "Continuing resolutions limit new program starts and delay contract award timelines",
        "Naval nuclear program restructuring reduces near-term revenue recognition",
        "Commercial nuclear reactor timeline extends beyond 2030 for advanced designs",
      ],
    },
    risks: [
      "Revenue highly concentrated in U.S. government contracts, subject to appropriations and budget risk.",
      "Nuclear regulatory risk — any safety incident in the broader nuclear industry affects political and regulatory sentiment.",
      "Talent and labor risk in a specialized nuclear engineering workforce with limited supply.",
      "Long contract cycles mean near-term revenue is visible but long-term growth requires successful new program wins.",
    ],
    watchList: [
      "Naval nuclear program funding levels in the defense authorization — the primary revenue driver.",
      "Advanced reactor and micro-reactor program awards and DoD funding commitments.",
      "Medical and industrial radioisotope revenue growth — an emerging diversification vector.",
      "DoE contract renewals and scope for uranium enrichment and fuel processing work.",
      "Any safety incidents in the broader commercial nuclear industry that could affect BWXT's regulatory environment.",
    ],
  },

  CCJ: {
    whyIOwnIt:
      "Cameco is the highest-quality uranium exposure available for a portfolio that wants to participate in the nuclear renaissance. The company is the second-largest uranium producer globally, with world-class low-cost assets at McArthur River and Cigar Lake in Saskatchewan — the highest-grade uranium deposits on earth. I own it because nuclear power is the only credible solution to AI data center baseload power demand at scale, the uranium supply side has structural constraints that the market has been slow to price, and Cameco is the cleanest way to own that thesis without the operational and financial risk of smaller uranium miners. The position is sized as a commodity exposure with meaningful upside if the utility long-term contracting cycle accelerates.",
    whyThisSleeve:
      "CCJ is in the retail portfolio as a commodity sector allocation. Uranium is a volatile commodity, and the position warrants active monitoring of spot price moves, utility contracting activity, and Kazatomprom production updates — that kind of dynamic management is better suited to the taxable account than the Roth IRA's long-hold orientation.",
    longDescription:
      "Cameco Corporation is the world's second-largest uranium producer, with flagship operations at McArthur River and Cigar Lake in the Athabasca Basin of Saskatchewan — the richest uranium deposits ever discovered. The company contracts a significant portion of its production under long-term agreements with utilities at prices negotiated above the spot market, providing earnings visibility across the commodity cycle. Cameco also holds a 40% stake in the Westinghouse nuclear fuel and services business through the Brookfield Renewable Partners joint acquisition, giving it downstream exposure to the nuclear fuel cycle beyond raw uranium mining.",
    thesisP2:
      "The structural supply-demand thesis is the core investment driver. The uranium market has been in a structural deficit since Fukushima-era reactor closures decimated the spot price and caused miners to shut in production. Kazatomprom — the world's largest producer, based in Kazakhstan — has faced persistent operational challenges (sulfuric acid shortages, labor and logistics constraints) that have limited its ability to ramp production back to nameplate capacity. Meanwhile, nuclear reactor restarts in Europe and Asia, new build programs in China and India, and the AI data center power demand narrative are all accelerating utility demand for long-term uranium supply contracts. Cameco's contracted book is repricing upward with each new agreement, and the uncontracted portion provides leverage to a continued spot price recovery.",
    bullCase: {
      title: "Uranium Supply Squeeze Reaches New Highs",
      summary:
        "Kazatomprom supply disruptions and accelerating reactor restarts drive spot uranium to new multi-decade highs.",
      assumptions: [
        "Kazatomprom production misses guidance due to persistent sulfuric acid and operational constraints",
        "Reactor restarts across Europe and Asia drive accelerating long-term contracting urgency",
        "Cameco's contracted book reprices significantly above $65/lb as utilities compete for supply",
      ],
    },
    baseCase: {
      title: "Long-Term Contracting Cycle Continues",
      summary:
        "Cameco adds multi-decade supply agreements at favorable prices as utilities gradually secure forward supply.",
      assumptions: [
        "Spot uranium sustains above $80/lb, enabling favorable long-term contract pricing",
        "CCJ's contracted volumes grow from ~30M lbs/year toward nameplate capacity",
        "McArthur River operations continue at elevated output under the higher price environment",
      ],
    },
    bearCase: {
      title: "Uranium Glut From Supply Recovery",
      summary:
        "Kazatomprom production recovery and secondary market supplies cause spot uranium to fall sharply.",
      assumptions: [
        "Kazatomprom resolves operational constraints and restores full production guidance",
        "Enrichment tails re-enrichment adds unexpected secondary supply to the spot market",
        "Spot uranium falls below $60/lb, impairing uncontracted revenue projections",
      ],
    },
    risks: [
      "Uranium spot price is highly volatile and directly determines the profitability of uncontracted production.",
      "Kazatomprom production recovery is the largest single downside risk to the supply-demand balance.",
      "Geopolitical risk — uranium is mined in politically complex jurisdictions including Kazakhstan and Namibia.",
      "Nuclear energy expansion timelines in key markets subject to regulatory and political risk.",
    ],
    watchList: [
      "Kazatomprom quarterly production updates and guidance revisions — the single most important supply variable.",
      "Uranium spot price and term market price trends.",
      "New long-term utility contracting announcements — the pace of the contracting cycle.",
      "Reactor restart and new build announcements in Europe, Japan, and Southeast Asia.",
      "Westinghouse earnings contribution and nuclear services demand as a proxy for the fuel cycle.",
    ],
  },

  CEG: {
    whyIOwnIt:
      "Constellation Energy operates the largest nuclear fleet in the United States — roughly 10% of US clean electricity generation — at a moment when the structural demand for always-on, carbon-free power has never been greater. AI data center buildouts require 24/7 baseload power that intermittent renewables cannot reliably deliver. Nuclear is the only zero-carbon source that runs at 90%+ capacity factors around the clock. Constellation has capitalized on this directly: the Microsoft agreement to restart Three Mile Island Unit 1 established a new pricing benchmark for nuclear power purchase agreements, and hyperscaler demand for clean firm power is accelerating across the fleet. The IRA's nuclear production tax credit adds a regulatory backstop to earnings that reduces downside risk significantly.",
    whyThisSleeve:
      "CEG belongs in the retail portfolio as a core infrastructure compounder with a clear near-term catalyst in AI data center PPAs. It is less speculative than the small-cap energy names in the sleeve — nuclear assets have 20-40 year operating lives and contracted revenues — but the re-rating from commodity power producer to premium clean energy infrastructure is still in early stages. The position size reflects both the conviction in the long-duration thesis and the reality that utility-adjacent stocks can de-rate sharply on policy surprises.",
    longDescription:
      "Constellation Energy is the largest producer of clean, carbon-free energy in the United States, operating a fleet of 21 nuclear power plants across 12 states. The company was spun off from Exelon in February 2022 and operates approximately 32,400 megawatts of generating capacity. Nuclear plants running at 90%+ capacity factors generate enormous free cash flow at today's power prices, and Constellation benefits disproportionately from any environment in which clean firm power commands a premium over intermittent renewables.",
    thesisP2:
      "The AI data center power thesis is the key re-rating driver. Hyperscalers — Microsoft, Google, Meta, and others — have made explicit commitments to 24/7 carbon-free energy, and wind and solar cannot meet that requirement without expensive storage. Nuclear power purchase agreements have emerged as the premium solution: locked-in, always-on, genuinely zero-carbon. Constellation's Three Mile Island restart (now Crane Clean Energy Center) for Microsoft validated that hyperscalers will pay a meaningful premium for nuclear PPAs. The pipeline of similar agreements across Constellation's broader fleet represents a multi-year earnings catalyst that is only partially reflected in consensus estimates.",
    bullCase: {
      title: "Nuclear PPA Wave Across the Fleet",
      summary:
        "Hyperscaler demand for 24/7 clean power drives a sustained wave of premium nuclear PPAs, re-rating Constellation from utility to clean infrastructure.",
      assumptions: [
        "Microsoft, Google, and other hyperscalers sign additional multi-GW PPAs at premium pricing across Constellation's fleet",
        "Nuclear production tax credit (IRA) provides a durable earnings floor, reducing commodity power price sensitivity",
        "Fleet life extensions (license renewals to 80 years) add decades of zero-capex generation value",
      ],
    },
    baseCase: {
      title: "Steady PPA Expansion with IRA Floor",
      summary:
        "Constellation converts its disclosed PPA pipeline at moderate pricing, with the nuclear PTC providing earnings stability.",
      assumptions: [
        "3-5 additional hyperscaler PPA agreements signed over 2025-2027 at premiums to market power prices",
        "Nuclear PTC remains intact, providing ~$15/MWh earnings floor across the fleet",
        "Power market prices remain constructive as natural gas prices stay elevated",
      ],
    },
    bearCase: {
      title: "Policy Reversal Pressures PTC",
      summary:
        "IRA nuclear production tax credit faces political risk; power prices soften as new renewable capacity floods the market.",
      assumptions: [
        "Legislative changes reduce or eliminate the nuclear production tax credit",
        "Rapid renewable deployment drives merchant power prices below Constellation's cost of capital",
        "Hyperscaler PPA pipeline stalls as carbon accounting standards shift away from nuclear",
      ],
    },
    risks: [
      "Nuclear production tax credit (IRA) is subject to legislative modification — partial or full elimination would compress earnings significantly.",
      "Unplanned reactor outages are low-probability but high-impact; any extended outage at a major plant would dent annual generation.",
      "Power price sensitivity: while PPAs provide partial insulation, a significant portion of output remains exposed to merchant market pricing.",
      "Capital intensity of life extensions and potential new capacity additions could weigh on free cash flow conversion.",
    ],
    watchList: [
      "New hyperscaler PPA announcements — volume, pricing, and duration relative to existing Microsoft agreement benchmarks.",
      "Nuclear production tax credit (IRA) legislative status — any policy changes affecting the ~$15/MWh earnings floor.",
      "Capacity factor and fleet reliability — unplanned outage trends across the 21-plant fleet.",
      "Power market pricing in PJM and other key markets — directional indicator for merchant revenue on uncontracted output.",
      "License renewal progress for plants approaching 60-year operating licenses — each renewal adds decades of asset life.",
    ],
  },

  // ─── Roth IRA — AI / Semiconductors ──────────────────────────────────────

  AMD: {
    whyIOwnIt:
      "AMD is the only credible challenger to NVIDIA in the AI GPU market, and its valuation reflects a significant discount to that positioning. I own it as a structural hedge within the AI hardware exposure: if NVIDIA continues to dominate, AMD's EPYC server CPU business and gaming GPU franchise still compound at a reasonable rate. If AI workloads diversify toward AMD's MI series GPUs — which is beginning to happen at enterprises and cloud customers seeking alternatives to CUDA lock-in — the earnings upside is substantial. The Roth IRA is the right home for this position because the GPU challenge thesis plays out over a multi-year horizon, and tax-free compounding on a long-duration investment is exactly what the account is designed for.",
    whyThisSleeve:
      "AMD is in the Roth IRA because the AI GPU narrative requires a 5-10 year timeframe to fully resolve — either AMD builds a viable alternative to CUDA or it doesn't — and that holding period makes the tax-free compounding of the Roth account significantly more valuable than managing it tactically in a taxable sleeve.",
    longDescription:
      "AMD's MI300X GPU has emerged as the primary challenger to NVIDIA's H100/H200 in AI training and inference workloads. The company's x86 CPU share gains in data center and the growing adoption of ROCm as a CUDA alternative in enterprise deployments add multiple vectors of upside beyond the core GPU thesis.",
    thesisP2:
      "AMD's EPYC server CPU business is a durable earnings engine that often gets overlooked in the AI GPU conversation. EPYC processors have taken meaningful share from Intel in cloud data center deployments — now running in Amazon EC2, Google Cloud, and Microsoft Azure instance families — generating consistent, growing revenue that provides financial ballast for AMD's GPU investments. Even in a scenario where AMD's GPU challenge stalls, the CPU trajectory alone supports a reasonable earnings multiple, which means the AI GPU optionality comes largely at no cost relative to current valuations.",
    bullCase: {
      title: "AI GPU Share Gains Accelerate",
      summary:
        "AMD captures 30%+ of the data center AI GPU market as MI300X adoption broadens and hyperscalers dual-source away from NVIDIA.",
      assumptions: [
        "MI300X and next-generation MI400 outperform NVIDIA H100 on key inference benchmarks",
        "Major hyperscalers formalize dual-sourcing strategies to reduce NVIDIA dependency",
        "ROCm software ecosystem matures, lowering switching costs for large AI labs",
        "Data center GPU revenue exceeds $12B by FY2026",
      ],
    },
    baseCase: {
      title: "Steady Market Share Gains",
      summary:
        "AMD grows data center GPU revenue at 40-50% annually while maintaining CPU share gains, supporting durable mid-teens EPS compounding.",
      assumptions: [
        "MI300X maintains 15-20% of the AI GPU addressable market",
        "EPYC CPU gains to 25-30% server market share by 2026",
        "Gaming GPU business stabilizes, reducing cyclical earnings drag",
        "Operating leverage drives margin expansion toward 30% non-GAAP operating margin",
      ],
    },
    bearCase: {
      title: "NVIDIA Widens the Software Moat",
      summary:
        "CUDA's entrenched ecosystem prevents meaningful AMD GPU adoption in AI, limiting AMD to a niche challenger position.",
      assumptions: [
        "NVIDIA's NVLink and CUDA ecosystem create switching costs that AMD cannot overcome",
        "AMD GPU market share plateaus below 10% in AI training",
        "PC/gaming market weakness extends, pressuring consumer GPU revenue",
        "China export restrictions further limit addressable market",
      ],
    },
    risks: [
      "CUDA ecosystem lock-in — the majority of AI training code is optimized for NVIDIA hardware, creating structural switching costs that AMD must overcome.",
      "Export restrictions on advanced chips to China remove a significant portion of AMD's addressable GPU market.",
      "NVIDIA's roadmap cadence (Blackwell, Rubin) may maintain a performance lead that neutralizes AMD's competitive positioning.",
      "Geopolitical tensions could disrupt TSMC manufacturing relationships critical for advanced-node chip production.",
    ],
    watchList: [
      "MI300X and MI400 market share estimates and enterprise adoption announcements from cloud providers.",
      "ROCm software ecosystem maturity — developer tooling adoption is the key to unlocking CUDA alternatives.",
      "EPYC CPU market share trajectory in cloud instance types each quarter.",
      "Quarterly data center GPU revenue as a percentage of total — the most direct thesis progress metric.",
      "NVIDIA Blackwell/Rubin performance benchmarks that set the competitive bar AMD must meet.",
    ],
    trimEvents: [
      {
        date: "2026-05-01",
        type: "partial_trim",
        explanation:
          "Trimmed AMD in the Roth Retirement Account on May 1, 2026 after a significant run to bring the position back toward my 10% max position-size discipline. This was not a thesis reversal. The core AMD thesis remains intact, but the trim reflected concentration control, risk management, and a preference to preserve gains after the position had outgrown its intended role.",
      },
      {
        date: "2026-04-30",
        quantity: 0.197783,
        amountUsd: 70.00,
        pricePerShare: 354.00,
        type: "partial_trim",
        explanation:
          "Trimmed AMD by 2% in the Roth IRA at $354 on April 30. The position had appreciated beyond my intended risk limit, so I reduced exposure to keep AMD near my 10% maximum position size. This was not a thesis reversal. The trim was a portfolio construction decision focused on position discipline, concentration control, and preserving gains after significant appreciation.",
        inferred: false,
      },
    ],
  },

  UNH: {
    whyIOwnIt:
      "UNH is in the portfolio because healthcare is one of the few sectors that compounds reliably through economic cycles, and UnitedHealth is the best-managed company in managed care by a significant margin. The Optum business is transforming UNH from a pure insurance underwriter into a vertically integrated healthcare technology and services platform — which makes the earnings quality more durable and less dependent on the actuarial volatility that defines traditional insurers. The regulatory risk is real and well-known, but the demographic tailwind of aging baby boomers entering Medicare Advantage is a multi-decade structural driver that offsets most policy risk over a long holding period.",
    whyThisSleeve:
      "UNH is in the Roth IRA because it's a multi-decade compounder that generates substantial capital appreciation over time — exactly the type of holding that benefits most from tax-free growth. Healthcare is also a sector where I want a long holding period without pressure to manage tax treatment around volatility events, and the Roth IRA provides that structural advantage.",
    longDescription:
      "UnitedHealth Group operates two interlocking businesses: UnitedHealthcare (insurance) and Optum (health services, pharmacy, and data analytics). Optum's growing revenue contribution creates diversified earnings streams that reduce reliance on pure insurance underwriting cycles, while also creating data network effects across the healthcare system.",
    thesisP2:
      "Optum is the more interesting business to model over a 5-10 year horizon. As it grows toward representing 60%+ of total UNH earnings, the earnings quality improves materially — health services revenue is less volatile than insurance underwriting, and the data network effects Optum has built across its 125+ million patient relationships are genuinely difficult to replicate. The combination of Medicare Advantage demographic tailwinds on the insurance side and Optum's services expansion creates a compounding earnings machine that should sustain double-digit EPS growth for years, making UNH one of the most predictable large-cap compounders in the portfolio.",
    bullCase: {
      title: "Optum Becomes the Healthcare Operating System",
      summary:
        "Optum's data and care delivery platform extends its reach across providers, payers, and employers, driving premium margins and durable compounding.",
      assumptions: [
        "Optum Health revenue reaches $100B+ as value-based care contracts scale",
        "OptumRx pharmacy services capture incremental share of specialty drug distribution",
        "Medicare Advantage enrollment continues to expand at double-digit rates",
        "Operating margin in UnitedHealthcare business stabilizes above 5%",
      ],
    },
    baseCase: {
      title: "Consistent Compounder",
      summary:
        "UNH sustains 12-15% EPS growth through a combination of enrollment growth, Optum expansion, and operational efficiency.",
      assumptions: [
        "Medicare Advantage enrollment grows 6-8% annually on favorable demographics",
        "Optum continues taking share in health services across pharmacy, behavioral health, and home care",
        "Medical cost ratios stabilize in the 83-85% range after pandemic-era volatility",
        "Share repurchases provide 2-3% annual EPS tailwind",
      ],
    },
    bearCase: {
      title: "Regulatory Pressure Compresses Margins",
      summary:
        "Congressional scrutiny of managed care profits and CMS reimbursement cuts structurally compress medical benefit ratios and earnings.",
      assumptions: [
        "CMS reduces Medicare Advantage reimbursement rates by 3-5% over two years",
        "Political pressure forces loss-ratio minimums, limiting underwriting flexibility",
        "DOJ antitrust investigation into Optum's market power results in forced divestitures",
        "Medical cost inflation accelerates, compressing margins before rate relief arrives",
      ],
    },
    risks: [
      "Regulatory and political risk — managed care profitability is under sustained scrutiny from Congress and state legislatures, with proposals to cap insurer margins.",
      "Medical cost inflation — unexpected utilization spikes (post-pandemic catch-up, GLP-1 drug adoption) can compress medical loss ratios faster than rate increases can compensate.",
      "DOJ antitrust exposure — Optum's scale in health services, pharmacy, and data analytics faces ongoing regulatory review.",
      "Reimbursement risk — CMS annual rate-setting for Medicare Advantage directly impacts a significant portion of UNH revenue and profit.",
    ],
    watchList: [
      "CMS Medicare Advantage rate announcement each February — the single most important annual event for the insurance segment.",
      "Medical loss ratio (MLR) trends quarter-over-quarter as an indicator of utilization normalization.",
      "Optum Health revenue growth and operating margin as the key long-term value driver.",
      "DOJ antitrust investigation status and any indication of settlement terms.",
      "GLP-1 drug coverage policy decisions and utilization trends affecting the pharmacy benefit.",
    ],
  },

  NBIS: {
    whyIOwnIt:
      "Nebius is the most asymmetric position in the Roth IRA — a small, early-revenue GPU cloud company with a genuinely differentiated positioning in European AI infrastructure. European enterprises face real constraints in using US hyperscalers for sensitive AI workloads: GDPR, data residency requirements, AI Act compliance, and sovereignty concerns all push them toward European-based alternatives. Nebius is the only pure-play European AI cloud with the technical capability to serve frontier AI customers at scale. The corporate structure is clean (Dutch holdco, listed on Nasdaq), and the founding team has deep infrastructure experience from building Yandex Cloud. I sized it small relative to the conviction level — the risk is high, but the potential upside if Nebius becomes the AWS of European AI is substantial.",
    whyThisSleeve:
      "NBIS is in the Roth IRA because it's a pre-profit, high-growth company that could compound at exceptional rates over a 5-7 year horizon if the European AI cloud thesis plays out. Capital gains on a successful speculative position compound most efficiently in a tax-free account, and the Roth IRA allows me to hold through the multiple capital raise cycles that a business like this will require without creating complex tax events.",
    longDescription:
      "Nebius Group emerged from a restructuring of the former Yandex after geopolitical pressures forced asset sales. The reconstituted Dutch company is now focused on building GPU cloud infrastructure for AI workloads in Europe and Israel, with data center capacity expanding rapidly. Its clean corporate structure and European focus differentiate it from hyperscaler alternatives.",
    thesisP2:
      "The data sovereignty angle is the key differentiator that makes Nebius more interesting than a generic GPU cloud startup. European AI regulation — the EU AI Act, country-specific data residency requirements, and government-sponsored digital sovereignty initiatives — is creating structural demand for AI infrastructure that keeps sensitive model training and inference data within European borders. US hyperscalers have European regions, but they're ultimately US companies subject to US legal process, which creates compliance friction that European enterprises and governments are increasingly unwilling to accept. Nebius is building toward being the infrastructure of choice for that compliance-driven demand, and the first-mover window in European AI cloud is still open.",
    bullCase: {
      title: "European AI Cloud Demand Surges",
      summary:
        "Nebius captures outsized share of European AI infrastructure demand as data sovereignty concerns drive enterprises away from US hyperscalers.",
      assumptions: [
        "European AI spending grows 60%+ annually through 2026, driven by regulatory preference for local data residency",
        "Nebius GPU cluster capacity expands to 10,000+ H100-equivalent GPUs within 18 months",
        "Two to three marquee European AI lab contracts are signed, establishing enterprise credibility",
        "Revenue run rate reaches $500M+ within three years",
      ],
    },
    baseCase: {
      title: "Steady AI Infrastructure Share Gains",
      summary:
        "Nebius grows its European cloud footprint at 40-60% annually, establishing a durable niche as a regional AI compute provider.",
      assumptions: [
        "GPU cloud capacity doubles annually over the next two years",
        "Gross margins expand as utilization rates improve on existing infrastructure",
        "New data center sites in Finland, Netherlands, or Germany are announced",
        "The company reaches operating breakeven within 18-24 months",
      ],
    },
    bearCase: {
      title: "Hyperscaler Competition Limits Differentiation",
      summary:
        "AWS, Azure, and Google Cloud's European infrastructure investments overwhelm Nebius' scale advantages, compressing pricing and utilization.",
      assumptions: [
        "US hyperscalers accelerate European data center buildout, neutralizing Nebius' regional advantage",
        "Capital intensity forces dilutive equity raises at unfavorable valuations",
        "Yandex legacy perception issues limit enterprise adoption despite clean corporate separation",
        "Utilization rates remain below 60%, preventing path to profitability",
      ],
    },
    risks: [
      "Capital intensity — building GPU cloud infrastructure requires continuous large capex investments, creating dilution risk if capital markets tighten.",
      "Corporate perception overhang — despite clean legal separation, Yandex legacy associations could create enterprise sales friction.",
      "Hyperscaler competitive pressure — AWS, Azure, and Google Cloud are all investing heavily in European AI infrastructure.",
      "Execution risk — scaling a GPU cloud business from startup to enterprise requires deep technical and operational expertise that is still being demonstrated.",
    ],
    watchList: [
      "Quarterly revenue growth and GPU cluster utilization rates — the primary progress metrics.",
      "New data center site announcements in Finland, Netherlands, or Germany.",
      "Marquee enterprise contract wins that establish commercial credibility beyond early customers.",
      "Capital raise terms and share dilution — the most important risk to monitor given pre-profit status.",
      "EU AI Act implementation guidance on data residency, which could directly accelerate enterprise demand.",
    ],
  },

  DLO: {
    whyIOwnIt:
      "dLocal is the most structurally differentiated fintech in the Roth IRA. Its value proposition is genuinely unique: building the payment processing infrastructure that lets global brands accept local payment methods and disburse funds in markets where standard card rails don't work. Uber can't pay Brazilian drivers in PIX, Amazon can't accept Boleto Bancário from Mexican buyers, and Spotify can't process MercadoPago subscriptions in Argentina without a solution like dLocal's. The emerging market digital payments penetration story is one of the longest-duration secular growth themes I can own, and dLocal is the infrastructure pick-and-shovel that benefits regardless of which merchants or platforms win in each market.",
    whyThisSleeve:
      "DLO is in the Roth IRA because emerging market fintech is a multi-decade structural growth theme that plays out over a 10+ year horizon. Tax-free compounding is the right structure for a position where the terminal value is substantial if the platform thesis plays out, and I don't want near-term FX or earnings volatility to drive tax-inefficient trading decisions.",
    longDescription:
      "dLocal operates a payment processing network in over 40 emerging markets across Latin America, Africa, and Asia. Its core value proposition is enabling global merchants (Uber, Amazon, Spotify) to accept local payment methods and disburse funds in markets where conventional card rails are insufficient or absent. The platform processes transactions in local currencies and handles regulatory complexity across dozens of jurisdictions.",
    thesisP2:
      "The network effects in dLocal's business are strong and underappreciated. Once a global merchant integrates dLocal for Brazil, they're likely to expand to Mexico, Argentina, Nigeria, and Southeast Asia through the same API — making dLocal a platform rather than a transactional service vendor. Each new market added to the platform increases the value to existing merchants, and each new merchant relationship validates the platform to future prospects. As the merchant base grows and the geographic footprint expands, revenue per merchant should increase significantly as customers adopt value-added services including FX hedging, instant payouts, and local compliance tooling.",
    bullCase: {
      title: "EM Digital Payments Penetration Accelerates",
      summary:
        "Rapidly growing merchant base and rising TPV per merchant drive revenue compounding as emerging market e-commerce and gig economy adoption expands.",
      assumptions: [
        "Total payment volume (TPV) grows above 40% annually through 2026",
        "New merchant wins in Africa and Southeast Asia diversify revenue beyond LatAm",
        "Take rate stabilizes above 1.1% as value-added services (FX, payouts, data) expand margins",
        "Profitability inflects as fixed cost leverage accrues with volume scale",
      ],
    },
    baseCase: {
      title: "Steady Volume and Merchant Growth",
      summary:
        "dLocal grows TPV at 25-35% annually while maintaining take rates, sustaining double-digit revenue compounding across its merchant network.",
      assumptions: [
        "Core LatAm markets (Brazil, Mexico, Argentina) continue growing 20-25% annually",
        "African and Asian markets contribute a growing share of new merchant additions",
        "Take rate remains in the 1.0-1.2% range as competitive pressures are offset by service expansion",
        "Operating cash flow turns consistently positive, reducing reliance on external capital",
      ],
    },
    bearCase: {
      title: "FX Volatility and Macro Headwinds Compress Margins",
      summary:
        "Currency devaluation in key markets reduces USD-reported revenue and creates working capital pressure, while competition erodes take rates.",
      assumptions: [
        "Argentine peso or Brazilian real weakness creates significant FX translation losses",
        "Stripe, Adyen, and local payment networks expand EM coverage, compressing dLocal take rates",
        "Regulatory changes in Brazil or Mexico restrict cross-border payment flows",
        "A single large merchant (representing 15%+ of revenue) churns to an in-house solution",
      ],
    },
    risks: [
      "FX and currency risk — a significant portion of TPV is in Latin American currencies subject to devaluation, creating USD-reported revenue and margin pressure.",
      "Customer concentration — a small number of large global merchants represent a disproportionate share of TPV; losing one could materially impact results.",
      "Regulatory fragmentation — operating across 40+ markets requires continuous compliance investment and exposes the company to country-specific regulatory changes.",
      "Competition from global and local players — Stripe, Adyen, and regional fintechs are all investing in similar emerging market infrastructure.",
    ],
    watchList: [
      "TPV growth rate and take rate trends — the two most important financial metrics each quarter.",
      "New market launches in Africa and Southeast Asia as indicators of platform expansion.",
      "Top 5 merchant retention — any disclosed churn from the largest customers is a significant signal.",
      "Argentine and Brazilian peso FX moves that flow through to USD-reported revenue.",
      "Stripe and Adyen EM market entry announcements that directly increase competitive pressure.",
    ],
  },

  GOOGL: {
    whyIOwnIt:
      "Alphabet is the portfolio's core technology compounding position — a business with durable near-monopoly economics in search advertising, a fast-growing cloud platform, and more AI infrastructure investment underway than nearly any other company. The AI disruption narrative around Search is real but overstated in the near term: the vast majority of advertising revenue ties to commercial intent queries where AI summaries can actually improve ad conversion rates by surfacing higher-quality intent signals. Meanwhile, Gemini's integration across the Google product suite is driving Cloud adoption and creating new monetization surfaces that didn't exist two years ago. I own GOOGL as the application-layer AI compounder — not just chips and inference, but the platform where AI value ultimately gets monetized.",
    whyThisSleeve:
      "GOOGL is in the Roth IRA because it's a large-cap compounder that benefits from holding through the AI transition cycle without pressure to trade around quarterly volatility. Alphabet's history of generating exceptional capital appreciation — and the multi-decade nature of the AI monetization thesis — makes the tax-free compounding of the Roth account significantly more valuable than managing it in a taxable sleeve.",
    longDescription:
      "Alphabet's durable moat combines Google Search's advertising network, YouTube's video monetization, and Google Cloud's enterprise infrastructure business. The AI transition presents both a threat (search disruption) and an opportunity (Gemini monetization across all products). Waymo's autonomous vehicle program provides long-duration optionality.",
    thesisP2:
      "Waymo is the most undervalued asset in Alphabet's portfolio and is effectively priced at zero in current valuations. Autonomous vehicles represent a potential multi-trillion-dollar market transformation, and Waymo has a measurable lead over competitors in miles driven, technology maturity, and regulatory approvals. The commercial launch in Phoenix, San Francisco, and Los Angeles has demonstrated the technology works at scale. If autonomous vehicle adoption accelerates over the next decade, Waymo alone could represent hundreds of billions in value — investors currently pay for Search and Cloud and receive that optionality at no additional cost.",
    bullCase: {
      title: "AI Augments Search Monetization",
      summary:
        "AI Overviews drive higher-quality ad clicks while Google Cloud's Gemini integration accelerates enterprise adoption, creating a compounding AI monetization cycle.",
      assumptions: [
        "AI Overviews maintain or improve advertiser CPMs as query quality improves",
        "Google Cloud reaches $50B revenue run rate by 2026, driven by Vertex AI adoption",
        "YouTube Shorts monetization gap to long-form closes, expanding overall YouTube revenue",
        "Gemini 2.0 achieves best-in-class performance, protecting Google's enterprise AI position",
      ],
    },
    baseCase: {
      title: "Durable Platform with AI Optionality",
      summary:
        "Alphabet sustains 10-15% revenue growth driven by advertising and cloud, while AI investments gradually improve monetization across products.",
      assumptions: [
        "Search advertising grows 8-12% annually as digital advertising remains structurally strong",
        "Google Cloud continues 25-30% annual revenue growth, narrowing margin gap to AWS and Azure",
        "Operating margins in the 28-31% range, balancing AI investment with cash generation",
        "YouTube maintains dominant video platform position against TikTok and competing services",
      ],
    },
    bearCase: {
      title: "AI Search Disrupts Core Monetization",
      summary:
        "LLM-based search assistants reduce click-through rates on Google Search ads, structurally eroding the advertising business that funds all other investments.",
      assumptions: [
        "OpenAI ChatGPT, Perplexity, and AI-native search capture 15-20% of Google's query volume",
        "Zero-click AI responses reduce advertiser CPMs as fewer searchers reach commercial intent",
        "DOJ-mandated separation of Google Search from Chrome/Android browser defaults is enforced",
        "Regulatory antitrust action forces Chrome or Android divestiture",
      ],
    },
    risks: [
      "Antitrust regulatory risk — DOJ has already won one antitrust case and is pursuing remedies including potential forced divestitures of Chrome, Android, or Google Search.",
      "AI search disruption — while Google is investing heavily in AI, the transition from ad-supported search to AI assistants could structurally compress margins.",
      "Competition in cloud — Google Cloud remains in third place behind AWS and Azure, and must continue investing heavily to close the gap.",
      "YouTube competition — TikTok and emerging short-form video platforms continue competing for attention, particularly among younger demographics.",
    ],
    watchList: [
      "AI Overviews advertiser CPM trends — the most direct measure of whether AI is helping or hurting search monetization.",
      "Google Cloud revenue growth rate and operating margin — the key long-term value creation engine.",
      "DOJ antitrust case developments and the scope of any proposed remedies.",
      "Gemini model benchmark performance relative to GPT and Claude — product quality matters for enterprise Cloud adoption.",
      "Waymo commercial launch expansion cities and monthly active rider data.",
    ],
    trimEvents: [
      {
        date: "2026-01-23",
        quantity: 1,
        amountUsd: 330.12,
        pricePerShare: 330.12,
        type: "partial_trim",
        explanation: "I trimmed one share at $330 after the position had grown beyond my target weighting following a significant re-rating. The core thesis — search durability through the AI transition and Google Cloud's operating leverage — remained intact. This was a sizing decision, not a change in conviction. I retained the remainder of the position.",
        inferred: false,
      },
    ],
  },

  FBTC: {
    whyIOwnIt:
      "FBTC is a deliberate, sized allocation to Bitcoin as a non-correlated store of value within a retirement account. Bitcoin's supply schedule is mathematically fixed — 21 million coins, hardcoded into the protocol, enforced by a decentralized network — which means it has a fundamentally different inflation profile from any fiat currency or commodity with elastic supply. I hold it because a fixed-supply, globally accessible, censorship-resistant monetary asset should be worth more over a 10-20 year horizon than it is today, and the ETF wrapper makes it practical to hold within the IRA without the operational complexity of self-custody, private keys, or hardware wallets.",
    whyThisSleeve:
      "The Roth IRA is the ideal home for FBTC specifically because of the tax structure. If Bitcoin appreciates significantly over a multi-decade holding period — which is the thesis — all gains compound entirely tax-free. Holding Bitcoin in a taxable account would create capital gains events on every rebalancing trade. The IRA wrapper is meaningfully more valuable here than for almost any other holding in the portfolio.",
    longDescription:
      "FBTC provides regulated, institutional-grade Bitcoin exposure through Fidelity's established custody and fund infrastructure. As a spot Bitcoin ETF, it offers direct price tracking without the operational complexity of self-custody. The ETF wrapper makes Bitcoin accessible within IRA and brokerage accounts with standard tax reporting.",
    thesisP2:
      "The spot ETF approval in January 2024 was the structural catalyst that institutionalized Bitcoin as an asset class. For the first time, pension funds, endowments, wealth managers, and individual retirement accounts can hold Bitcoin through standard brokerage infrastructure. The institutional onboarding cycle is still in early innings — BlackRock's IBIT and Fidelity's FBTC have attracted substantial flows, but institutional allocations as a percentage of total AUM remain tiny relative to where they could be over a 5-10 year adoption curve. Each basis point of institutional allocation globally translates into billions of dollars of demand against a supply that is structurally fixed.",
    risks: [
      "Bitcoin price volatility — Bitcoin regularly experiences 50-80% drawdowns from peak levels; position sizing should reflect this range of outcomes.",
      "Regulatory risk — potential shifts in SEC or Congressional treatment of spot Bitcoin ETFs could impact liquidity and fund structure.",
      "Macro sensitivity — Bitcoin has historically been correlated with risk assets during liquidity crises, reducing diversification benefits precisely when they're most needed.",
      "Technology and protocol risk — while remote, changes to the Bitcoin protocol or infrastructure vulnerabilities represent tail risks.",
    ],
    watchList: [
      "ETF flow data (FBTC, IBIT) as the clearest real-time signal of institutional demand trends.",
      "Bitcoin network hash rate and miner economics as indicators of long-term network security and miner sustainability.",
      "US Congressional and SEC regulatory developments — any legislation establishing a Bitcoin reserve or ETF framework clarity.",
      "Macro correlation patterns — how Bitcoin behaves during equity drawdowns as the position matures institutionally.",
      "Bitcoin halving cycle dynamics and miner sell pressure in the months following each halving.",
    ],
  },

  MELI: {
    whyIOwnIt:
      "MercadoLibre is the Amazon + PayPal + Shopify of Latin America, compounding faster than any of those US analogues did at the same stage of their growth. The flywheel is the most important thing to understand: the marketplace drives payment volume, payment volume funds lending, lending strengthens merchant relationships, merchant relationships deepen marketplace supply, and marketplace supply drives more consumer transactions. Each rotation increases the barriers to competitive disruption, and the Latin American market is still in early innings of digital commerce and financial services penetration. I own it as the flagship LatAm tech position in the Roth IRA — the best risk-adjusted compounding story I can find in consumer internet outside the US.",
    whyThisSleeve:
      "MELI is in the Roth IRA because it's a multi-decade compounding story that plays out over 10+ years as LatAm digital commerce and financial inclusion approach their potential penetration rates. Tax-free growth on that runway is significantly more valuable than managing it in a taxable account where FX volatility would create constant short-term noise.",
    longDescription:
      "MercadoLibre operates the dominant e-commerce marketplace (Mercado Libre) and a rapidly growing fintech platform (Mercado Pago) across Latin America. The two businesses create powerful flywheel dynamics: marketplace drives payment volume, payment volume funds lending, lending strengthens merchant relationships, and merchant relationships deepen marketplace supply. Advertising (Mercado Ads) is emerging as a high-margin third revenue stream.",
    thesisP2:
      "Mercado Ads is the most underappreciated growth driver in MELI's business. Advertising on marketplace platforms — where purchase intent is explicit and first-party transaction data is available — commands economics that are structurally different from social media advertising. Amazon built a $45B+ advertising business on the back of its marketplace, and MercadoLibre is following the identical playbook with a captive base of hundreds of millions of buyers across 18 countries. As advertising penetration grows from sub-3% of revenue toward 7-10%, the margin profile of the business improves dramatically, since advertising revenue carries near-100% gross margin. That transition is what converts MELI from a growth story into a cash flow machine.",
    bullCase: {
      title: "Fintech Flywheel Drives Superior Unit Economics",
      summary:
        "Mercado Pago's credit book and payments infrastructure compound into a dominant LatAm financial services platform, driving ARPU well beyond e-commerce expectations.",
      assumptions: [
        "Mercado Pago monthly active users exceed 80M as digital banking adoption accelerates",
        "Credit book grows 40%+ annually with loss rates manageable below 10%",
        "Mercado Ads revenue reaches $2B+, rivaling Amazon Ads as a high-margin business unit",
        "Brazil and Mexico GMV grows 25%+ despite macro headwinds",
      ],
    },
    baseCase: {
      title: "Steady LatAm Platform Compounding",
      summary:
        "MercadoLibre sustains 20-25% revenue growth as GMV and fintech volumes compound across its core markets.",
      assumptions: [
        "Brazil GMV grows 15-20% annually, driven by logistics network investments",
        "Fintech revenue grows 30%+ as take rates expand with new products (savings, insurance)",
        "Credit quality remains manageable with non-performing loan rates below 12%",
        "Operating leverage drives EBIT margin expansion toward 15%+",
      ],
    },
    bearCase: {
      title: "LatAm Macro Deterioration and Credit Losses",
      summary:
        "Currency devaluation, inflation, and elevated consumer credit losses in Brazil and Argentina compress MELI's reported margins and growth trajectory.",
      assumptions: [
        "Brazilian real or Argentine peso depreciates significantly, reducing USD-reported revenue",
        "Consumer credit loss rates spike above 15% in Brazil as unemployment rises",
        "Amazon's LatAm expansion accelerates, pressuring GMV and seller take rates",
        "US tariff policy impacts LatAm trade flows, reducing cross-border commerce",
      ],
    },
    risks: [
      "Currency risk — a significant portion of revenues and costs are denominated in Brazilian reais, Argentine pesos, and Mexican pesos, creating FX translation and economic exposure.",
      "Credit quality in fintech — MELI's buy-now-pay-later and consumer lending book is the largest in Latin America; an economic downturn could spike credit losses.",
      "Competition — Amazon has been investing in LatAm logistics and marketplace; increased competitive intensity could pressure GMV and take rates.",
      "Regulatory risk across multiple jurisdictions — operating in 18+ countries means exposure to country-specific financial and commerce regulations.",
    ],
    watchList: [
      "Brazil and Mexico GMV growth rates each quarter — the anchor markets that drive overall platform velocity.",
      "Fintech ARPU expansion and Mercado Pago credit quality metrics (NPL rates and provisioning trends).",
      "Mercado Ads revenue as a percentage of total revenue — the margin mix improvement signal.",
      "Mercado Envíos logistics penetration rate as a percentage of marketplace units shipped.",
      "BRL and MXN movements — the two most significant FX exposures to monitor for USD-reporting impact.",
    ],
  },

  NU: {
    whyIOwnIt:
      "Nubank is the most important banking disruption story in the world. The traditional Brazilian banking oligopoly operated with among the highest net interest margins and fees anywhere — and Nubank took over 100 million customers from those incumbents by offering a fundamentally better product: no fees, transparent pricing, and a mobile-first experience that the legacy banks simply cannot replicate given their cost structures and technology debt. What makes this a Roth IRA position rather than a trade is the second phase: converting those 100 million relationships into full-service financial platform customers with credit, investment, insurance, and premium products. That ARPU expansion story plays out over a decade.",
    whyThisSleeve:
      "NU is in the Roth IRA as a long-duration bet on financial inclusion and ARPU expansion in Latin America. The full thesis takes 7-10 years to play out as Nubank moves from customer acquisition to becoming the primary financial relationship for a large portion of its user base. Tax-free compounding on that trajectory is exactly what the Roth account is structured for.",
    longDescription:
      "Nu Holdings (Nubank) is the largest digital bank in the world by customer count, with over 100 million customers primarily in Brazil but expanding into Mexico, Colombia, and other Latin American markets. Its mobile-first, no-fee banking model has disrupted the Brazilian banking oligopoly. The company is moving up the value chain with premium products, investments, and insurance.",
    thesisP2:
      "The ARPU expansion story is the second and more important phase of the Nubank thesis. Phase one was customer acquisition — reaching 100M customers in Brazil required an exceptional product and disciplined growth spending. Phase two is monetization: converting those customers from free debit card users into full-service financial relationships with credit products, investment accounts, insurance, and premium tiers. Monthly ARPU is currently around $9; moving toward $14+ as premium product penetration grows would roughly double revenue per customer on the same acquisition base. That kind of operating leverage — more revenue without proportionate customer acquisition cost — is what drives the long-term margin story.",
    bullCase: {
      title: "LatAm Expansion Drives Multi-Country Scale",
      summary:
        "Mexico and Colombia growth accelerates, replicating Brazil's trajectory and driving a step-change in revenue and customer economics.",
      assumptions: [
        "Mexico customer base crosses 10M, establishing a second major revenue engine",
        "Premium 'Ultravioleta' credit card adoption lifts ARPU above $10/month per active customer",
        "Colombia and Peru expansions add 5M+ customers at low acquisition cost",
        "Operating leverage drives net margin expansion toward 25%+ in Brazil",
      ],
    },
    baseCase: {
      title: "Consistent Brazilian Compounding",
      summary:
        "Nu sustains 20-25% revenue growth driven by product cross-sell and ARPU expansion in its core Brazilian market.",
      assumptions: [
        "Brazilian ARPU grows from $9 to $14+ as credit, insurance, and investment products penetrate existing customers",
        "Credit quality remains stable with non-performing loan rates at 6-7%",
        "Mexico adds 2-3M customers annually, approaching breakeven within 18 months",
        "Continued cost efficiency drives operating leverage",
      ],
    },
    bearCase: {
      title: "Brazil Credit Cycle and FX Compression",
      summary:
        "Rising unemployment and interest rates in Brazil trigger consumer credit losses while BRL depreciation reduces USD-reported results.",
      assumptions: [
        "Brazil non-performing loan rates spike above 12% as consumer credit deteriorates",
        "Brazilian real depreciates 20%+ versus USD, compressing reported revenue",
        "Banco Central do Brasil raises reserve requirements, increasing Nu's funding costs",
        "Competition from incumbent banks' digital offerings intensifies, compressing Nu's customer acquisition advantage",
      ],
    },
    risks: [
      "Credit quality risk — Nu's consumer credit portfolio is the largest risk factor; an economic downturn in Brazil could generate outsized loan loss provisions.",
      "Brazil FX and macro exposure — the majority of revenue is BRL-denominated; peso/real depreciation directly impacts USD results.",
      "Regulatory risk — Banco Central do Brasil could impose more stringent capital, reserve, or credit requirements on digital banks.",
      "Competition from incumbents — Itaú, Bradesco, and Santander have all launched competitive digital banking products that could slow Nu's ARPU expansion.",
    ],
    watchList: [
      "Brazilian ARPU trajectory quarter-over-quarter — the single most important long-term value metric.",
      "Credit quality in Brazil: NPL rates and loan loss provisioning as a percentage of the credit book.",
      "Mexico customer count and unit economics progress toward breakeven in that market.",
      "BRL/USD exchange rate — most revenue is BRL-denominated, making FX a direct P&L input.",
      "Banco Central do Brasil regulatory actions on digital banks, capital requirements, or lending limits.",
    ],
  },

  IREN: {
    whyIOwnIt:
      "IREN sits at the intersection of two of the most important infrastructure build-outs in the current market cycle: Bitcoin mining and AI compute. The company's power infrastructure — large-scale renewable energy facilities optimized for high-density compute — translates directly from Bitcoin mining to AI GPU hosting, and that pivot is already underway. AI cloud services command 3-5x higher margins than Bitcoin mining at equivalent power capacity, and IREN is converting its infrastructure toward the higher-value use case. I own it as a leveraged play on purpose-built compute infrastructure: Bitcoin mining provides the base-case floor while the AI cloud pivot creates the upside that isn't currently priced in.",
    whyThisSleeve:
      "IREN is in the Roth IRA because the AI cloud pivot, if successful, generates substantial capital appreciation over a 3-5 year horizon. The binary quality of the outcome — either the pivot works or it doesn't — makes tax-free compounding on the upside meaningfully more valuable than managing it in a taxable account.",
    longDescription:
      "IREN (formerly Iris Energy) operates large-scale data centers powered by renewable energy, initially focused on Bitcoin mining but pivoting meaningfully into AI GPU cloud services. The company's power infrastructure and operational expertise translate directly into AI compute hosting, with a growing pipeline of GPU cloud contracts diversifying away from the cyclicality of Bitcoin mining economics.",
    thesisP2:
      "The power infrastructure is IREN's key strategic asset — and it's genuinely difficult to replicate. Long-term renewable power purchase agreements and high-density data center facilities built to mining specifications are equally well-suited for AI GPU clusters, and that infrastructure is already in place. Where Bitcoin mining generates $80-120/kW-day at current economics, AI cloud services can generate $300-500/kW-day at GPU cloud contract rates. The transition requires capital for GPU procurement and customer acquisition, but the underlying power and facility assets are already owned. If IREN executes the pivot successfully, it's effectively revaluing the same physical infrastructure at 3-4x the current implied multiple.",
    bullCase: {
      title: "AI Compute Pivot Drives Premium Valuation",
      summary:
        "GPU cloud revenue from AI workloads commands 3-5x higher margins than Bitcoin mining, driving a re-rating as IREN becomes primarily an AI infrastructure company.",
      assumptions: [
        "AI GPU cloud revenue grows to represent 50%+ of total revenue within 18 months",
        "Long-term GPU cloud contracts signed with AI labs at $2.5-3.50/GPU-hour blended rates",
        "Power capacity expands to 500MW+, supporting both mining and AI cloud at scale",
        "Margin profile improves significantly as high-margin AI contracts increase their share",
      ],
    },
    baseCase: {
      title: "Diversified Power Infrastructure Growth",
      summary:
        "IREN grows Bitcoin mining revenue alongside a nascent AI cloud business, with power infrastructure as the durable differentiator.",
      assumptions: [
        "Hash rate grows to 30-35 EH/s, maintaining competitive mining economics",
        "AI GPU cloud reaches $50-100M annual revenue run rate within 12 months",
        "Renewable energy infrastructure provides cost advantages and ESG positioning for enterprise customers",
        "Revenue diversification reduces earnings volatility relative to pure-play miners",
      ],
    },
    bearCase: {
      title: "Bitcoin Decline and AI Overcapacity",
      summary:
        "Bitcoin price falls below mining profitability thresholds while AI GPU supply glut depresses cloud compute prices, compressing margins across both business lines.",
      assumptions: [
        "Bitcoin falls below $40,000, pushing mining operations to break-even or loss",
        "GPU cloud compute market becomes oversupplied as NVIDIA H100 supply catches up to demand",
        "GPU cloud blended rates fall below $1.50/GPU-hour, reducing AI cloud margins",
        "Capital requirements for continued power infrastructure expansion require dilutive equity raises",
      ],
    },
    risks: [
      "Bitcoin price exposure — a large portion of current economics is still tied to Bitcoin mining profitability, which is highly sensitive to BTC price and network difficulty.",
      "AI compute market saturation — as GPU supply normalizes, cloud compute pricing could compress, reducing the margin premium IREN targets for its AI infrastructure.",
      "Capital intensity — building and expanding power infrastructure for both mining and AI hosting requires continuous large capital expenditures.",
      "Energy price sensitivity — while largely on renewable power purchase agreements, spot energy costs can impact economics during demand spikes.",
    ],
    watchList: [
      "AI GPU cloud revenue and signed contract announcements — the primary pivot progress metric.",
      "Revenue per GPU-hour from AI cloud contracts vs. Bitcoin mining revenue per kW as the margin comparison.",
      "Total power capacity under management and new site development announcements.",
      "Bitcoin network difficulty and miner profitability as the floor economics for the base business.",
      "Capital structure: equity raises, debt covenants, and GPU procurement financing given the transition investment requirements.",
    ],
    trimEvents: [
      {
        date: "2026-04-17",
        quantity: 5,
        amountUsd: 239.60,
        pricePerShare: 47.92,
        type: "partial_trim",
        explanation: "I reduced the position by approximately half after a 127% gain from my August 2025 entry near $21. At $47.92, the stock had moved well ahead of where I expected the AI pivot thesis to be priced at this stage, and the position size had grown beyond my intended weighting. I retained the remaining shares — the transition from Bitcoin mining toward AI cloud infrastructure is still in early execution, and the thesis remains intact.",
        inferred: false,
      },
    ],
  },

  META: {
    whyIOwnIt:
      "Meta is the most misunderstood AI infrastructure investment in the portfolio. While NVIDIA gets all the attention as the AI hardware beneficiary, Meta is spending $35-40B+ annually on AI not to compete in the cloud market but to make its own advertising products better — and better advertising products mean higher advertiser ROI, which means more advertiser spend, which means more revenue to fund more AI investment. The flywheel is self-reinforcing in a way that's different from any other AI spending story. I own Meta as the application-layer AI compounder where AI capital expenditure is directly accretive to the core business, not speculative on future monetization.",
    whyThisSleeve:
      "META is in the Roth IRA as a core large-cap compounder with a 5-10 year horizon. The combination of sustained EPS growth, aggressive buybacks, and AI-driven monetization expansion makes long-duration tax-free compounding significantly more valuable than active management in a taxable account.",
    longDescription:
      "Meta Platforms controls the world's largest social media ecosystem (Facebook, Instagram, WhatsApp, Threads) with 3.3 billion daily active users. Its advertising business is powered by an industry-leading targeting and measurement platform. Large-scale AI infrastructure investments (Llama models, AI assistants) are both improving ad relevance and creating direct monetization opportunities through Meta AI.",
    thesisP2:
      "The hardware optionality is underappreciated by the market. Meta's Ray-Ban AI glasses have become commercially successful in a way that few anticipated, and they represent the most plausible near-term form factor for ambient AI — voice-activated, passively aware, and socially acceptable to wear. If wearable AI becomes a mainstream category over the next five years, Meta has a first-mover advantage in both the hardware platform and the AI assistant (Meta AI is already over 500M monthly active users, making it arguably the largest deployed AI assistant by reach). That footprint creates monetization opportunities through premium subscriptions, enterprise products, and commerce integrations that are entirely absent from current revenue — and thus entirely absent from current valuations.",
    bullCase: {
      title: "AI Monetization Creates a New Revenue Layer",
      summary:
        "Meta AI assistant adoption drives incremental engagement and creates paid enterprise features, while AI-optimized ad targeting lifts advertiser ROI and CPMs.",
      assumptions: [
        "Meta AI reaches 1B+ monthly active users, becoming the largest AI assistant by reach",
        "AI-powered ad creative tools drive 20%+ lift in advertiser conversion rates, justifying CPM premium",
        "Ray-Ban AI glasses become a mainstream product category, generating hardware + services revenue",
        "Threads reaches 500M users, adding a new advertiser surface alongside Instagram and Facebook",
      ],
    },
    baseCase: {
      title: "Steady Platform Growth with AI Optionality",
      summary:
        "Meta sustains 15-20% revenue growth through advertising efficiency improvements and Reels monetization, while AI investments gradually compound into incremental value.",
      assumptions: [
        "Advertising revenue grows 14-18% annually as Reels and Stories monetization continues maturing",
        "Family of Apps daily active users grow 5-7% annually globally",
        "AI infrastructure investments improve ad targeting ROI, sustaining advertiser spend growth",
        "Operating margins sustain in the 38-42% range despite elevated AI capital expenditures",
      ],
    },
    bearCase: {
      title: "Regulatory Breakup and AI Cost Spiral",
      summary:
        "Forced divestiture of Instagram or WhatsApp significantly reduces Meta's advertising network advantage while AI investments fail to monetize on the expected timeline.",
      assumptions: [
        "FTC or EU regulators mandate divestiture of Instagram or WhatsApp as antitrust remedy",
        "AI capital expenditures ($35-40B annually) fail to generate proportionate revenue or efficiency gains",
        "Younger demographic engagement continues shifting to TikTok and emerging platforms",
        "EU data privacy enforcement significantly restricts personalized advertising in Europe",
      ],
    },
    risks: [
      "Antitrust and regulatory risk — the FTC's case to force Instagram and WhatsApp divestiture, if successful, would fundamentally alter Meta's competitive position.",
      "AI infrastructure spending cycle — Meta is committing $35-40B+ in annual capex to AI; if monetization lags, this will compress returns on capital.",
      "Generational engagement risk — Facebook's aging demographics and TikTok's dominance among Gen Z create a long-term engagement sustainability question.",
      "Privacy regulation — EU's GDPR and DSA enforcement, and potential US privacy legislation, could restrict data use for ad targeting, pressuring CPMs.",
    ],
    watchList: [
      "AI-powered ad conversion metrics — any disclosure of advertiser ROI improvement from Advantage+ and AI creative tools.",
      "Meta AI monthly active users and early monetization experiments (subscriptions, enterprise tools).",
      "Ray-Ban smart glasses unit sales and engagement metrics as a proxy for wearable AI market development.",
      "Operating margin sustainability in the 38-42% range despite elevated AI capex.",
      "FTC case developments and EU DMA enforcement actions against the family of apps.",
    ],
  },

  RKLB: {
    whyIOwnIt:
      "Rocket Lab is the best-managed small-to-medium launch company in the world that isn't SpaceX, and it has a business model that doesn't require Neutron to succeed to justify the position. Electron is already the second-most-frequently-launched US rocket, the space systems segment is growing rapidly with spacecraft bus and component contracts, and the company has an operational track record that very few aerospace startups can match. I own it for three distinct reasons: (1) the Electron business generates real, growing revenue today; (2) the space systems segment provides revenue diversification that pure-play launch companies don't have; and (3) Neutron represents asymmetric optionality on the medium-lift market that doesn't cost me anything if it misses schedule — it's either free or transformational.",
    whyThisSleeve:
      "RKLB is in the Roth IRA as a long-duration aerospace compounder. Neutron's full development and certification timeline extends through 2026-2028, and the complete commercial and national security launch thesis plays out over a decade. Tax-free compounding on a successful long-duration aerospace bet is far more valuable than the same return managed tactically in a taxable account.",
    longDescription:
      "Rocket Lab operates two complementary businesses: the Electron small-launch vehicle (the second most-frequently launched US rocket) and a space systems segment that manufactures spacecraft components and complete missions for government and commercial customers. Neutron, a medium-lift vehicle in development, targets the larger payload market currently dominated by SpaceX Falcon 9.",
    thesisP2:
      "The space systems segment is the underappreciated durability story within Rocket Lab. While Neutron gets all the headlines, the spacecraft manufacturing, components, and satellite bus business is growing at 30%+ annually and provides revenue that's entirely independent of launch cadence or Neutron's development timeline. As the commercial satellite market expands — constellation operators, national security payloads, deep space missions — demand for Rocket Lab's spacecraft services grows with it. The two-segment model means Rocket Lab's revenue is far less binary than pure-play launch companies, and the systems business alone can sustain growth through any period of launch vehicle development uncertainty.",
    bullCase: {
      title: "Neutron Rocket Opens Large-Payload Market",
      summary:
        "Successful Neutron development and launch certification creates a new multi-billion-dollar revenue stream competing directly with Falcon 9 for national security and commercial payloads.",
      assumptions: [
        "Neutron achieves first successful launch and certification by 2026-2027",
        "U.S. Space Force certifies Neutron for national security payloads, unlocking government launch contracts",
        "Electron cadence reaches 25 launches per year, demonstrating sustained manufacturing and operations",
        "Space systems segment secures a flagship satellite bus contract from a Tier-1 customer",
      ],
    },
    baseCase: {
      title: "Electron Scale and Space Systems Growth",
      summary:
        "Rocket Lab grows Electron launch frequency and space systems revenue while Neutron development progresses, sustaining 30-40% annual revenue growth.",
      assumptions: [
        "Electron reaches 20 launches per year, generating $200M+ in launch revenue",
        "Space systems segment grows 30%+ annually on spacecraft component and satellite bus demand",
        "Neutron development remains on schedule with first test launch in 2026",
        "New Electron launch site at Virginia adds launch slot capacity and government customer access",
      ],
    },
    bearCase: {
      title: "Neutron Delays and SpaceX Competition",
      summary:
        "Neutron development faces significant delays or cost overruns while SpaceX Falcon 9's cadence increases, limiting Electron's commercial addressable market.",
      assumptions: [
        "Neutron first launch slips to 2028+, delaying the large-payload revenue ramp by two or more years",
        "SpaceX Starship reduces launch costs further, making Falcon 9 pricing even more competitive",
        "Capital intensity of Neutron development requires dilutive equity raises",
        "Government launch contracts increasingly concentrate with SpaceX, limiting Rocket Lab's share",
      ],
    },
    risks: [
      "Neutron development risk — medium-lift rocket development is technically complex and capital-intensive; delays or failures would be significant setbacks.",
      "SpaceX competitive pressure — Falcon 9's proven reliability and low costs create a very high bar for Neutron to compete in the medium-lift market.",
      "Capital requirements — Rocket Lab has been cash-flow negative and requires continued access to capital markets to fund Neutron development.",
      "Launch vehicle reliability — a high-profile Electron failure could disrupt the launch cadence and customer confidence.",
    ],
    watchList: [
      "Electron launch cadence — tracking toward 20 launches/year; any meaningful deviation from the pace signals operational issues.",
      "Space systems revenue growth and backlog size each quarter.",
      "Neutron development milestones and any first-launch timeline revisions.",
      "US Space Force certification conversations — national security payload certification is the key to large government Neutron contracts.",
      "Cash position and capital raise timing relative to Neutron development spending requirements.",
    ],
  },

  ASTS: {
    whyIOwnIt:
      "AST SpaceMobile is the most speculative position in the Roth IRA and the one I find most compelling from a pure disruption standpoint. The company is attempting to do something that no one has successfully done at commercial scale: build a satellite network that connects to standard, unmodified smartphones without any special hardware. If the technology works as demonstrated, every mobile phone on earth becomes a satellite-enabled device, and every mobile carrier in the world becomes a potential AST customer. I sized it small relative to the risk profile — this is venture-stage risk in a public market wrapper — but the asymmetry is extraordinary. If it works, the payoff is transformational. If it doesn't, the position size limits the damage.",
    whyThisSleeve:
      "ASTS is in the Roth IRA because the potential upside, if realized over a 5-7 year horizon, is large enough that tax-free compounding matters enormously. A position that could compound 10-20x in a success case is far more valuable in a tax-free account than the same return in a taxable one.",
    longDescription:
      "AST SpaceMobile is building a direct-to-cell satellite network that enables standard mobile phones to connect directly to orbiting satellites without special hardware. Unlike Starlink terminals, AST's technology uses existing smartphone radios. Partnerships with AT&T, Verizon, and international carriers provide a path to commercial deployment. BlueBird satellites are the initial commercial constellation.",
    thesisP2:
      "The carrier partnership model is the structural genius of AST's business. Rather than selling directly to consumers, AST sells coverage to carriers who embed it in their existing plans as a premium or emergency connectivity feature. AT&T and Verizon have already signed agreements, and international carriers in Europe and Asia represent a substantial incremental TAM. The revenue sharing model means AST doesn't need to build a consumer brand or distribution network — if the technology works, the carriers handle customer acquisition at no additional cost to AST. The question is entirely one of technical execution: can the BlueBird constellation deliver the spectral efficiency required for commercially viable service quality at the price points carriers are willing to pay.",
    bullCase: {
      title: "Direct-to-Cell Network Achieves Commercial Scale",
      summary:
        "Carrier partnership revenue ramp and expanding BlueBird constellation establish AST as the infrastructure layer for global mobile coverage, driving a step-change in revenue.",
      assumptions: [
        "AT&T and Verizon activate the first commercial direct-to-cell services by mid-2025",
        "AST launches 60+ BlueBird satellites, providing meaningful global coverage",
        "International carrier agreements in Europe and Asia are signed, expanding the addressable market",
        "Revenue sharing agreements with carriers generate $500M+ annual revenue run rate by 2027",
      ],
    },
    baseCase: {
      title: "Gradual Commercial Deployment",
      summary:
        "AST achieves limited commercial launch with initial carrier partners while expanding the satellite constellation, establishing proof of concept for broader rollout.",
      assumptions: [
        "Initial commercial service launches in the US with AT&T and T-Mobile by end of 2025",
        "BlueBird constellation reaches 30 satellites, providing partial coverage",
        "Revenue generation is modest ($50-100M) but confirms the technology's commercial viability",
        "Additional equity raises fund expanded constellation deployment",
      ],
    },
    bearCase: {
      title: "Technical Execution and Funding Challenges",
      summary:
        "Satellite performance falls short of commercial specifications or capital requirements exceed current fundraising capacity, creating existential risk.",
      assumptions: [
        "BlueBird satellites underperform spectral efficiency targets, limiting service quality",
        "Carrier partners delay commercial agreements pending further technical validation",
        "Market conditions prevent equity raises at acceptable valuations, creating a funding gap",
        "Orbital slot and interference issues require costly regulatory resolution",
      ],
    },
    risks: [
      "Technical execution risk — direct-to-cell technology at commercial scale has not been proven; satellite performance must meet very specific spectral efficiency targets.",
      "Capital intensity — building a global satellite constellation requires hundreds of millions to billions of dollars in capital, with multiple potential funding rounds needed.",
      "Carrier dependency — AST's revenue model depends on revenue-sharing agreements with large carriers who have significant negotiating leverage.",
      "Competitive risk from Starlink and others — SpaceX's Starlink direct-to-cell and T-Mobile agreement represents direct competition with substantial capital advantages.",
    ],
    watchList: [
      "BlueBird satellite launch schedule and in-orbit performance data — the primary technical validation signal.",
      "Commercial service activation announcements from AT&T and Verizon with specific coverage and pricing details.",
      "International carrier agreement signings in Europe, Asia, or Africa that expand the addressable market.",
      "Spectral efficiency data and call quality reports from commercial pilots — the make-or-break technical metric.",
      "Capital raise terms and dilution — each equity offering is a signal of execution pace vs. funding needs.",
    ],
  },

  SATL: {
    whyIOwnIt:
      "Satellogic is the smallest position in the portfolio and represents a small bet on the Earth observation data market at a distressed valuation. The company's satellite manufacturing capability is genuinely differentiated — it can build and launch satellites at a fraction of the cost of traditional suppliers, which makes fleet refresh economically viable in a way that's not possible for most EO competitors. The government intelligence contract base provides revenue stability, and the commercial analytics market (precision agriculture, infrastructure monitoring, environmental applications) represents long-duration optionality that isn't priced in given the company's current capital constraints. I own it as a small, asymmetric position in the broader space theme alongside RKLB and ASTS.",
    whyThisSleeve:
      "SATL is in the Roth IRA alongside the other space and frontier positions as a diversified space sector allocation. The risk profile — small-cap, pre-profitability, capital-constrained — fits the Roth IRA's ability to hold speculative positions over a long horizon without creating complex tax events around volatility.",
    longDescription:
      "Satellogic operates a small satellite constellation providing high-frequency, high-resolution Earth observation imagery and analytics. The company focuses on government intelligence, agriculture, infrastructure monitoring, and environmental applications. Its satellite manufacturing capabilities provide a competitive advantage in fleet refresh economics.",
    thesisP2:
      "The cost advantage in satellite manufacturing is the key to understanding why Satellogic is interesting despite its constrained capital position. Traditional Earth observation satellites cost $50-100M+ each; Satellogic builds satellites at a fraction of that cost through vertical integration and standardized manufacturing. That means the constellation can be refreshed and expanded at a capital cost that doesn't require hundreds of millions in external equity, which is the challenge that has constrained most small EO companies. If government contracts provide a stable revenue floor while commercial analytics develops, Satellogic's manufacturing edge becomes the structural advantage that allows the business to sustain itself and eventually grow within its capital constraints.",
    bullCase: {
      title: "Government Contracts Drive Revenue Scale",
      summary:
        "Intelligence community and defense contracts provide durable, multi-year revenue that funds fleet expansion and commercial market penetration.",
      assumptions: [
        "US and allied government intelligence contracts expand significantly from current levels",
        "Fleet expands to 40+ satellites, increasing revisit frequency and coverage differentiation",
        "Commercial analytics platform gains traction in precision agriculture and infrastructure monitoring",
        "Revenue reaches $100M+, establishing a path toward positive operating cash flow",
      ],
    },
    baseCase: {
      title: "Steady Imagery and Analytics Growth",
      summary:
        "Satellogic sustains government and commercial imagery revenue growth while containing capital expenditures through efficient satellite manufacturing.",
      assumptions: [
        "Existing government contracts renew and expand modestly",
        "Commercial revenue grows 15-20% annually from agriculture and infrastructure monitoring",
        "Satellite manufacturing efficiency holds CAPEX to replacement cost only",
        "Operating losses narrow as revenue scale partially offsets fixed infrastructure costs",
      ],
    },
    bearCase: {
      title: "Capital Constraints Limit Fleet Expansion",
      summary:
        "Limited access to capital prevents fleet expansion, allowing better-funded competitors to widen their coverage and revisit frequency advantages.",
      assumptions: [
        "Capital markets remain unfavorable for small-cap space companies, preventing equity raises",
        "Planet Labs and Maxar expand their commercial satellite constellations significantly",
        "Government contract renewal uncertainty increases as intelligence community evaluates competing providers",
        "Satellite degradation without replacement reduces coverage, impacting contract renewals",
      ],
    },
    risks: [
      "Capital constraints — Satellogic has limited capital and must carefully manage satellite refresh and expansion within tight funding constraints.",
      "Competition from Planet and Maxar — better-capitalized competitors offer larger constellations with higher revisit rates.",
      "Government contract dependency — revenue is concentrated in government contracts which are subject to budget cycles, political priorities, and competitive re-bids.",
      "Satellite obsolescence — the constellation requires regular refresh investment; delays create coverage gaps that impact service quality.",
    ],
    watchList: [
      "Government contract renewals and any new intelligence community award announcements.",
      "Commercial analytics platform revenue from agriculture and infrastructure customers — the long-duration growth signal.",
      "Active satellite count and constellation health — the number of operational satellites determines service quality and contract eligibility.",
      "Capital raise needs and timeline — the single most critical risk factor for a capital-constrained business.",
      "Planet and Maxar competitive activity in government and commercial contract bids.",
    ],
  },

  // ─── SOAR ──────────────────────────────────────────────────────────────────
  SOAR: {
    trimEvents: [
      {
        date: "2026-04-28",
        type: "pending_stop_loss",
        explanation:
          "Placed a stop-loss sell order for SOAR on Apr 28, 2026 as part of risk management around a highly speculative aviation/mobility position.",
      },
    ],
  },

  // ─── SMH ───────────────────────────────────────────────────────────────────
  SMH: {
    trimEvents: [
      {
        date: "2026-05-01",
        quantity: 1,
        amountUsd: 509.50,
        pricePerShare: 509.50,
        type: "add",
        explanation:
          "Added to SMH on May 1, 2026 to increase broad semiconductor and AI infrastructure exposure within the Roth Retirement Account.",
      },
    ],
  },

  // ─── VOO ───────────────────────────────────────────────────────────────────
  VOO: {
    trimEvents: [
      {
        date: "2026-05-01",
        amountUsd: 50.00,
        type: "recurring_add",
        explanation:
          "Recurring VOO investment processed on May 1, 2026, continuing the account's core U.S. equity market exposure.",
      },
      {
        date: "2026-05-01",
        quantity: 2.707845,
        amountUsd: 1799.84,
        pricePerShare: 664.74,
        type: "add",
        explanation:
          "Added to VOO on May 1, 2026 to increase core U.S. equity market exposure within the Roth Retirement Account.",
      },
    ],
  },

  SCHD: {
    whyIOwnIt:
      "SCHD is the portfolio's income and stability allocation — the position that performs when the high-beta growth names are struggling. The ETF's methodology filters for dividend sustainability (payout ratios, balance sheet quality, earnings consistency) rather than raw yield, so it holds high-quality businesses generating durable free cash flow rather than distressed companies paying unsustainable dividends. It functions as a partial hedge to the AI infrastructure and growth technology exposure that dominates the rest of the book: when capex cycles turn, when rates rise, or when risk appetite falls, quality dividend equities tend to hold their value better than high-multiple growth names.",
    whyThisSleeve:
      "SCHD is in the ETFs sleeve because it's a passive, index-driven allocation that requires no active research or monitoring. The ETFs sleeve is the right home for systematic, factor-based exposures that provide portfolio structure rather than stock-specific conviction. Holding it alongside VOO and QQQM gives the sleeve a dividend income tilt that balances the pure growth exposure of the other two ETFs.",
    longDescription:
      "SCHD tracks the Dow Jones U.S. Dividend 100 Index, selecting 100 US stocks based on consistent dividend payment history, financial strength, and dividend yield. The fund's methodology screens for companies with sustainable payout ratios and balance sheet quality, making it a quality-tilted dividend ETF rather than a simple high-yield vehicle.",
    thesisP2:
      "The compounding mathematics of dividend reinvestment are more powerful here than they appear at current yields. SCHD's ~3.5-4% yield, reinvested on top of the constituent dividend growth rate (historically 8-10% annually), creates a total return profile that rivals growth equity in most market environments — with significantly lower volatility. The quality screen also means SCHD tends to hold up better during corrections than the broad market, since companies with strong free cash flow and sustainable dividends are less exposed to financing stress. In a portfolio otherwise dominated by high-beta technology, semiconductors, and pre-profitability growth, SCHD is the ballast that keeps aggregate portfolio volatility at a manageable level.",
    risks: [
      "Factor risk — dividend and value factors can underperform growth factors for extended periods, particularly during technology-driven bull markets.",
      "Sector concentration — SCHD is typically concentrated in financials, consumer staples, industrials, and healthcare; a sector-specific downturn can significantly impact returns.",
      "Interest rate sensitivity — dividend-paying equities are partially rate-sensitive; rising rates can compress relative valuations as bond yields become more competitive.",
      "Dividend cut risk — economic downturns can force constituent companies to reduce dividends, triggering index rebalancing and potential price declines.",
    ],
    watchList: [
      "Annual index rebalancing and constituent changes — particularly any significant sector allocation shifts.",
      "Dividend growth rate of the underlying index components as the compounding driver.",
      "Interest rate environment — the primary macro headwind for dividend equities relative to bonds.",
      "Quality factor performance relative to growth — the context for periods of relative underperformance.",
    ],
  },
};
