import { useEffect, useState } from "react";
import { companiesApi, contactsApi } from "../api/resources";
import type { Company, Contact } from "../types";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  title: "",
  company_id: "",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, co] = await Promise.all([contactsApi.list(), companiesApi.list()]);
      setContacts(c);
      setCompanies(co);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    await contactsApi.create({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      phone: form.phone || null,
      title: form.title || null,
      notes: null,
      company_id: form.company_id ? Number(form.company_id) : null,
    });
    setForm(emptyForm);
    load();
  };

  const handleDelete = async (id: number) => {
    await contactsApi.remove(id);
    load();
  };

  return (
    <div>
      <h1>Contacts</h1>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <input
          placeholder="First name *"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          required
        />
        <input
          placeholder="Last name *"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
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
        <button type="submit">Add Contact</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Title</th>
              <th>Company</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.first_name} {c.last_name}
                </td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.title}</td>
                <td>{companyName(c.company_id)}</td>
                <td>
                  <button className="link-danger" onClick={() => handleDelete(c.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No contacts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
