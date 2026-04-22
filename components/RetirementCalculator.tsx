"use client";

import { useState, useMemo, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  compute,
  getRothLimit,
  ROTH_LIMIT_UNDER_50,
  ROTH_LIMIT_50_PLUS,
  ANNUAL_REALIZATION_RATE,
  LTCG_RATE_AT_WITHDRAWAL,
  type CalcResult,
} from "@/lib/retirementCalc";

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULTS = {
  startingBalance: 5_000,
  currentAge: 25,
  retirementAge: 65,
  returnPct: 7,
  taxRatePct: 24,
  contribution: ROTH_LIMIT_UNDER_50,
  maximize: true,
  contribGrowthPct: 0,
};

// ── Formatting ────────────────────────────────────────────────────────────────

function fmtDollar(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

function fmtYAxis(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({
  children,
  note,
}: {
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8b2bd]">
        {children}
      </span>
      {note && (
        <span className="font-mono text-[9px] text-[#c8d0d8]">{note}</span>
      )}
    </div>
  );
}

const inputBase: React.CSSProperties = {
  background: "#faf7f2",
  borderColor: "rgba(15,30,53,0.12)",
  color: "#0f1e35",
};

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px]"
          style={{ color: "#7a8799" }}
        >
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        className="w-full rounded border py-2 font-mono text-[12px] outline-none transition-colors focus:border-[#1a4a2e] disabled:opacity-40"
        style={{
          ...inputBase,
          paddingLeft: prefix ? "1.5rem" : "0.75rem",
          paddingRight: "0.75rem",
        }}
      />
    </div>
  );
}

function RangeInput({
  value,
  onChange,
  min,
  max,
  step = 0.5,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-0.5 cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(to right, #1a4a2e ${((value - min) / (max - min)) * 100}%, rgba(15,30,53,0.12) 0%)`,
          accentColor: "#1a4a2e",
        }}
      />
      <span
        className="w-14 shrink-0 text-right font-mono text-[12px] font-semibold tabular-nums"
        style={{ color: "#0f1e35" }}
      >
        {format(value)}
      </span>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded border px-3 py-2.5 text-left transition-all"
      style={{
        background: active ? "rgba(26,74,46,0.05)" : "transparent",
        borderColor: active ? "rgba(26,74,46,0.28)" : "rgba(15,30,53,0.12)",
        color: active ? "#1a4a2e" : "#7a8799",
      }}
    >
      {/* Checkbox indicator */}
      <span
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm"
        style={{
          background: active ? "#1a4a2e" : "transparent",
          border: `1.5px solid ${active ? "#1a4a2e" : "rgba(15,30,53,0.25)"}`,
        }}
      >
        {active && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path
              d="M1 3L3 5L7 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="font-mono text-[10px]">{children}</span>
    </button>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  payload: { age: number };
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const age = payload[0]?.payload?.age;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.10)",
        borderRadius: 6,
        padding: "8px 12px",
        boxShadow: "0 2px 10px rgba(15,30,53,0.08)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 9,
          color: "#7a8799",
          marginBottom: 5,
        }}
      >
        Age {age}
      </p>
      {[...payload].reverse().map((item) => (
        <div
          key={item.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 20,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 9,
              color: item.color,
            }}
          >
            {item.name}
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 11,
              fontWeight: 600,
              color: "#0f1e35",
            }}
          >
            {fmtCompact(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Summary metric card ───────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  accent,
  large,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  large?: boolean;
}) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: "rgba(15,30,53,0.08)" }}
    >
      <p
        className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em]"
        style={{ color: "#a8b2bd" }}
      >
        {label}
      </p>
      <p
        className="font-mono font-semibold leading-none tabular-nums"
        style={{
          color: accent ?? "#0f1e35",
          fontSize: large ? "clamp(1.6rem,3vw,2.2rem)" : "clamp(1.1rem,2vw,1.4rem)",
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-1.5 font-mono text-[9px]" style={{ color: "#a8b2bd" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RetirementCalculator() {
  const [startingBalance, setStartingBalance] = useState(DEFAULTS.startingBalance);
  const [currentAge,      setCurrentAge]      = useState(DEFAULTS.currentAge);
  const [retirementAge,   setRetirementAge]   = useState(DEFAULTS.retirementAge);
  const [returnPct,       setReturnPct]       = useState(DEFAULTS.returnPct);
  const [taxRatePct,      setTaxRatePct]      = useState(DEFAULTS.taxRatePct);
  const [contribution,    setContribution]    = useState(DEFAULTS.contribution);
  const [maximize,        setMaximize]        = useState(DEFAULTS.maximize);
  const [contribGrowthPct, setContribGrowthPct] = useState(DEFAULTS.contribGrowthPct);

  const result: CalcResult = useMemo(
    () =>
      compute({
        startingBalance,
        currentAge,
        annualContribution: contribution,
        retirementAge,
        returnRate: returnPct / 100,
        marginalTaxRate: taxRatePct / 100,
        maximizeContributions: maximize,
        contributionGrowthRate: contribGrowthPct / 100,
      }),
    [
      startingBalance, currentAge, retirementAge, returnPct,
      taxRatePct, contribution, maximize, contribGrowthPct,
    ]
  );

  const reset = useCallback(() => {
    setStartingBalance(DEFAULTS.startingBalance);
    setCurrentAge(DEFAULTS.currentAge);
    setRetirementAge(DEFAULTS.retirementAge);
    setReturnPct(DEFAULTS.returnPct);
    setTaxRatePct(DEFAULTS.taxRatePct);
    setContribution(DEFAULTS.contribution);
    setMaximize(DEFAULTS.maximize);
    setContribGrowthPct(DEFAULTS.contribGrowthPct);
  }, []);

  const effectiveContribution = maximize
    ? getRothLimit(currentAge)
    : contribution;

  const tooltipContent = useCallback(
    (props: object) => <ChartTooltip {...(props as { active?: boolean; payload?: TooltipPayloadItem[] })} />,
    []
  );

  return (
    <div>
      {/* ── Section header ──────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
          Calculator
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[#0f1e35]">
          Long-Term Compounding Calculator
        </h2>
        <p className="mt-2 max-w-xl text-[13px] leading-[1.75] text-[#5a6e82]">
          Estimate the long-term effect of disciplined contributions and
          tax-free compounding — and how much the Roth structure changes
          the outcome versus a taxable account.
        </p>
      </div>

      {/* ── Two-column layout ───────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">

        {/* ── Left: Inputs ────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Account basics */}
          <div>
            <p
              className="mb-4 border-b pb-2 font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{ color: "#c8d0d8", borderColor: "rgba(15,30,53,0.07)" }}
            >
              Account
            </p>
            <div className="space-y-4">
              <div>
                <FieldLabel note="after-tax dollars">Starting Balance</FieldLabel>
                <NumberInput
                  value={startingBalance}
                  onChange={setStartingBalance}
                  min={0}
                  step={500}
                  prefix="$"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Current Age</FieldLabel>
                  <NumberInput
                    value={currentAge}
                    onChange={setCurrentAge}
                    min={16}
                    max={79}
                    step={1}
                  />
                </div>
                <div>
                  <FieldLabel>Retirement Age</FieldLabel>
                  <NumberInput
                    value={retirementAge}
                    onChange={setRetirementAge}
                    min={currentAge + 1}
                    max={90}
                    step={1}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Returns & taxes */}
          <div>
            <p
              className="mb-4 border-b pb-2 font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{ color: "#c8d0d8", borderColor: "rgba(15,30,53,0.07)" }}
            >
              Returns &amp; Taxes
            </p>
            <div className="space-y-5">
              <div>
                <FieldLabel note="gross annual">Expected Return</FieldLabel>
                <RangeInput
                  value={returnPct}
                  onChange={setReturnPct}
                  min={1}
                  max={15}
                  step={0.5}
                  format={(v) => `${v.toFixed(1)}%`}
                />
              </div>
              <div>
                <FieldLabel note="ordinary income">Marginal Tax Rate</FieldLabel>
                <RangeInput
                  value={taxRatePct}
                  onChange={setTaxRatePct}
                  min={10}
                  max={45}
                  step={1}
                  format={(v) => `${v}%`}
                />
              </div>
            </div>
          </div>

          {/* Contributions */}
          <div>
            <p
              className="mb-4 border-b pb-2 font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{ color: "#c8d0d8", borderColor: "rgba(15,30,53,0.07)" }}
            >
              Contributions
            </p>
            <div className="space-y-4">
              <ToggleButton active={maximize} onClick={() => setMaximize(!maximize)}>
                Maximize contributions{" "}
                <span style={{ opacity: 0.55 }}>
                  (${ROTH_LIMIT_UNDER_50.toLocaleString()} · ${ROTH_LIMIT_50_PLUS.toLocaleString()} at 50+)
                </span>
              </ToggleButton>

              {!maximize && (
                <>
                  <div>
                    <FieldLabel note="per year">Annual Contribution</FieldLabel>
                    <NumberInput
                      value={contribution}
                      onChange={setContribution}
                      min={0}
                      max={ROTH_LIMIT_50_PLUS}
                      step={100}
                      prefix="$"
                    />
                  </div>
                  <div>
                    <FieldLabel note="optional">Annual Contribution Growth</FieldLabel>
                    <RangeInput
                      value={contribGrowthPct}
                      onChange={setContribGrowthPct}
                      min={0}
                      max={10}
                      step={0.5}
                      format={(v) => `${v.toFixed(1)}%`}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            className="font-mono text-[9px] text-[#b0bac5] transition-colors hover:text-[#5a6e82]"
          >
            Reset to defaults
          </button>
        </div>

        {/* ── Right: Output + chart ────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Primary output */}
          <MetricCard
            label={`Roth IRA at age ${retirementAge}`}
            value={fmtDollar(result.rothFinal)}
            sub={`${result.yearsToRetirement}yr horizon · ${fmtDollar(effectiveContribution)}/yr contribution · ${returnPct}% gross return`}
            accent="#1a4a2e"
            large
          />

          {/* Secondary metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Taxable account"
              value={fmtDollar(result.taxableFinal)}
              sub="after annual drag + exit LTCG"
            />
            <MetricCard
              label="Tax-free advantage"
              value={`+${fmtDollar(result.advantage)}`}
              sub="Roth vs. taxable equivalent"
              accent={result.advantage > 0 ? "#1a4a2e" : "#8b2530"}
            />
          </div>

          {/* Contributions note */}
          <div
            className="flex items-baseline justify-between rounded border px-4 py-3"
            style={{ borderColor: "rgba(15,30,53,0.07)", background: "rgba(26,74,46,0.03)" }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8b2bd]">
              Total contributions
            </span>
            <span className="font-mono text-[11px] font-semibold text-[#3d4f66]">
              {fmtDollar(result.totalContributions)}
            </span>
          </div>

          {/* Chart */}
          <div
            className="rounded-xl border pt-5 pr-4 pb-4 pl-2"
            style={{
              borderColor: "rgba(15,30,53,0.08)",
              background: "#ffffff",
            }}
          >
            <p
              className="mb-4 px-3 font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{ color: "#a8b2bd" }}
            >
              Balance over time
            </p>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={result.yearlyData}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rothGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1a4a2e" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#1a4a2e" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="taxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7a8799" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#7a8799" stopOpacity={0.01} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="rgba(15,30,53,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="age"
                  tick={{ fill: "#a8b2bd", fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tickFormatter={fmtYAxis}
                  tick={{ fill: "#a8b2bd", fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />

                {/* Vertical line at retirement age */}
                <ReferenceLine
                  x={retirementAge}
                  stroke="rgba(15,30,53,0.18)"
                  strokeDasharray="3 4"
                  label={{
                    value: `Retire ${retirementAge}`,
                    position: "insideTopRight",
                    fill: "#a8b2bd",
                    fontSize: 8,
                    fontFamily: "var(--font-geist-mono)",
                    dy: 4,
                  }}
                />

                <Tooltip content={tooltipContent} />

                {/* Taxable drawn first (behind Roth) */}
                <Area
                  type="monotone"
                  dataKey="taxable"
                  name="Taxable"
                  stroke="#a8b2bd"
                  strokeWidth={1.5}
                  fill="url(#taxGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="roth"
                  name="Roth IRA"
                  stroke="#1a4a2e"
                  strokeWidth={2}
                  fill="url(#rothGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-5 px-3">
              {[
                { label: "Roth IRA", color: "#1a4a2e" },
                { label: "Taxable Account", color: "#a8b2bd" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 2,
                      borderRadius: 1,
                      backgroundColor: color,
                    }}
                  />
                  <span
                    className="font-mono text-[9px]"
                    style={{ color: "#7a8799" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Methodology note ────────────────────────────────────────────────── */}
      <div
        className="mt-8 rounded-lg border px-5 py-4"
        style={{ borderColor: "rgba(15,30,53,0.07)", background: "rgba(15,30,53,0.015)" }}
      >
        <p
          className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em]"
          style={{ color: "#c8d0d8" }}
        >
          Methodology &amp; Assumptions
        </p>
        <p className="font-mono text-[10px] leading-[1.8]" style={{ color: "#a8b2bd" }}>
          Roth IRA compounds at the gross return rate tax-free. The taxable account
          applies an annual tax drag — {(ANNUAL_REALIZATION_RATE * 100).toFixed(0)}% of annual gains are
          assumed realized each year (dividends &amp; turnover) and taxed at your
          marginal rate; remaining unrealized gains are taxed at a flat{" "}
          {(LTCG_RATE_AT_WITHDRAWAL * 100).toFixed(0)}% LTCG rate at retirement. Contributions are
          identical in both accounts. Roth limits: ${ROTH_LIMIT_UNDER_50.toLocaleString()}/yr under 50,{" "}
          ${ROTH_LIMIT_50_PLUS.toLocaleString()}/yr at 50+. Compounding is annual.
          Illustrative only — not financial advice. Simplified assumptions; actual
          results will differ.
        </p>
      </div>
    </div>
  );
}
