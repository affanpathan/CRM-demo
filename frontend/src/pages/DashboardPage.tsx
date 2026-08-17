import { useEffect, useState } from "react";
import { companiesApi, contactsApi, dealsApi, tasksApi } from "../api/resources";

export default function DashboardPage() {
  const [counts, setCounts] = useState<{
    companies: number;
    contacts: number;
    deals: number;
    openTasks: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [companies, contacts, deals, tasks] = await Promise.all([
          companiesApi.list(),
          contactsApi.list(),
          dealsApi.list(),
          tasksApi.list(),
        ]);
        setCounts({
          companies: companies.length,
          contacts: contacts.length,
          deals: deals.length,
          openTasks: tasks.filter((t) => t.status !== "done").length,
        });
      } catch {
        setError("Could not reach the API. Is the backend running?");
      }
    })();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p className="error">{error}</p>}
      {counts && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{counts.companies}</div>
            <div className="stat-label">Companies</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{counts.contacts}</div>
            <div className="stat-label">Contacts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{counts.deals}</div>
            <div className="stat-label">Deals</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{counts.openTasks}</div>
            <div className="stat-label">Open Tasks</div>
          </div>
        </div>
      )}
    </div>
  );
}
