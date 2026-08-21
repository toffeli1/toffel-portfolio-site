// Dev-only: print the computed peer sets so selection can be eyeballed.
// Run: npx tsx scripts/dev/inspectPeers.ts
import { selectPeers } from "../../lib/peerSelection";

for (const t of ["NBIS","CBRS","GOOGL","AMZN","META","NOW","MA","CEG","RKLB","ASTS","OSCR","UNH","MELI"]) {
  const p = selectPeers(t);
  console.log(`\n${t}`);
  console.log("  direct   :", p.direct.map(d => `${d.ticker} ${(d.score*100).toFixed(0)}%`).join("  |  ") || "—");
  console.log("  strategic:", p.strategic.map(d => `${d.ticker} ${(d.score*100).toFixed(0)}%`).join("  |  ") || "—");
}
