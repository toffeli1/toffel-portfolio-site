// Dev-only: verify each thesis assembles with the charts we expect.
import { getThesis } from "../../data/thesis";
import { activeCompanies } from "../../data/companies";
for (const c of activeCompanies()) {
  const t = getThesis(c.ticker);
  if (!t) { console.log(`${c.ticker.padEnd(6)} NO THESIS`); continue; }
  console.log(
    `${c.ticker.padEnd(6)} sections=${t.sections.length} ` +
    `risk=${t.sections.filter(s=>s.weighsRisk).length} ` +
    `charts=${t.charts.length} [${t.charts.map(x=>x.label).join(", ")}] ` +
    `| ${t.dataThrough ?? "no data stamp"}`
  );
}
