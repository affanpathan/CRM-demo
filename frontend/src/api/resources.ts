import { apiClient } from "./client";
import type { Company, Contact, Deal, Task } from "../types";

function makeResource<T, TCreate>(path: string) {
  return {
    list: async (): Promise<T[]> => (await apiClient.get(path)).data,
    create: async (payload: TCreate): Promise<T> =>
      (await apiClient.post(path, payload)).data,
    update: async (id: number, payload: Partial<TCreate>): Promise<T> =>
      (await apiClient.put(`${path}/${id}`, payload)).data,
    remove: async (id: number): Promise<void> => {
      await apiClient.delete(`${path}/${id}`);
    },
  };
}

export const companiesApi = makeResource<Company, Omit<Company, "id" | "created_at">>(
  "/api/companies"
);
export const contactsApi = makeResource<Contact, Omit<Contact, "id" | "created_at">>(
  "/api/contacts"
);
export const dealsApi = makeResource<Deal, Omit<Deal, "id" | "created_at">>(
  "/api/deals"
);
export const tasksApi = makeResource<Task, Omit<Task, "id" | "created_at">>(
  "/api/tasks"
);
