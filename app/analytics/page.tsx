import { notFound } from "next/navigation";

// Analytics is vaulted for now. Removed from the nav and the route 404s.
// Restore from git history when re-enabling.
export default function AnalyticsPage() {
  notFound();
}
