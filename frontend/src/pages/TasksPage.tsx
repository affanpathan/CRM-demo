import { useEffect, useState } from "react";
import { contactsApi, dealsApi, tasksApi } from "../api/resources";
import { TASK_STATUSES } from "../types";
import type { Contact, Deal, Task, TaskStatus } from "../types";

const emptyForm = {
  title: "",
  due_date: "",
  contact_id: "",
  deal_id: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [t, c, d] = await Promise.all([
        tasksApi.list(),
        contactsApi.list(),
        dealsApi.list(),
      ]);
      setTasks(t);
      setContacts(c);
      setDeals(d);
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

  const contactName = (id: number | null) => {
    const c = contacts.find((c) => c.id === id);
    return c ? `${c.first_name} ${c.last_name}` : "—";
  };
  const dealTitle = (id: number | null) => deals.find((d) => d.id === id)?.title ?? "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await tasksApi.create({
      title: form.title,
      description: null,
      status: "open",
      due_date: form.due_date || null,
      contact_id: form.contact_id ? Number(form.contact_id) : null,
      deal_id: form.deal_id ? Number(form.deal_id) : null,
    });
    setForm(emptyForm);
    load();
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    await tasksApi.update(task.id, { status });
    load();
  };

  const handleDelete = async (id: number) => {
    await tasksApi.remove(id);
    load();
  };

  return (
    <div>
      <h1>Tasks</h1>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <input
          placeholder="Title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
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
        <select
          value={form.deal_id}
          onChange={(e) => setForm({ ...form, deal_id: e.target.value })}
        >
          <option value="">No deal</option>
          {deals.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        <button type="submit">Add Task</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Due</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Deal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.due_date ?? "—"}</td>
                <td>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t, e.target.value as TaskStatus)}
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{contactName(t.contact_id)}</td>
                <td>{dealTitle(t.deal_id)}</td>
                <td>
                  <button className="link-danger" onClick={() => handleDelete(t.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No tasks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
