export interface Company {
  id: number;
  name: string;
  website: string | null;
  industry: string | null;
  notes: string | null;
  created_at: string;
}

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  notes: string | null;
  company_id: number | null;
  created_at: string;
}

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export const DEAL_STAGES: DealStage[] = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export interface Deal {
  id: number;
  title: string;
  value: string | null;
  stage: DealStage;
  expected_close_date: string | null;
  notes: string | null;
  company_id: number | null;
  contact_id: number | null;
  created_at: string;
}

export type TaskStatus = "open" | "in_progress" | "done";

export const TASK_STATUSES: TaskStatus[] = ["open", "in_progress", "done"];

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  contact_id: number | null;
  deal_id: number | null;
  created_at: string;
}
