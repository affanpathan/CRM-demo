import { useEffect, useState } from "react";
import { companiesApi, contactsApi, dealsApi } from "../api/resources";
import { DEAL_STAGES } from "../types";
import type { Company, Contact, Deal, DealStage } from "../types";

const emptyForm = {
  title: "",
  value: "",
  stage: "lead" as DealStage,
  expected_close_date: "",
  company_id: "",
  contact_id: "",
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [d, co, ct] = await Promise.all([
        dealsApi.list(),
        companiesApi.list(),
        contactsApi.list(),
      ]);
      setDeals(d);
      setCompanies(co);
      setContacts(ct);
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const companyName = (id: number | null) =>
    companies.find((c) => c.id === id)?.name ?? "—";
  const contactName = (id: number | null) => {
    const c = contacts.find((c) => c.id === id);
    return c ? `${c.first_name} ${c.last_name}` : "—";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await dealsApi.create({
      title: form.title,
      value: form.value || null,
      stage: form.stage,
      expected_close_date: form.expected_close_date || null,
      notes: null,
      company_id: form.company_id ? Number(form.company_id) : null,
      contact_id: form.contact_id ? Number(form.contact_id) : null,
    });
    setForm(emptyForm);
    load();
  };

  const handleStageChange = async (deal: Deal, stage: DealStage) => {
    await dealsApi.update(deal.id, { stage });
    load();
  };

  const handleDelete = async (id: number) => {
    await dealsApi.remove(id);
    load();
  };

  return (
    <div>
      <h1>Deals</h1>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <input
          placeholder="Title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          placeholder="Value"
          type="number"
          step="0.01"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
        />
        <select
          value={form.stage}
          onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })}
        >
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={form.expected_close_date}
          onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
        />
        <select
          value={form.company_id}
          onChange={(e) => setForm({ ...form, company_id: e.target.value })}
        >
          <option value="">No company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={form.contact_id}
          onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
        >
          <option value="">No contact</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.first_name} {c.last_name}
            </option>
          ))}
        </select>
        <button type="submit">Add Deal</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Value</th>
              <th>Stage</th>
              <th>Close Date</th>
              <th>Company</th>
              <th>Contact</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id}>
                <td>{d.title}</td>
                <td>{d.value ?? "—"}</td>
                <td>
                  <select
                    value={d.stage}
                    onChange={(e) => handleStageChange(d, e.target.value as DealStage)}
                  >
                    {DEAL_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{d.expected_close_date ?? "—"}</td>
                <td>{companyName(d.company_id)}</td>
                <td>{contactName(d.contact_id)}</td>
                <td>
                  <button className="link-danger" onClick={() => handleDelete(d.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {deals.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  No deals yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
