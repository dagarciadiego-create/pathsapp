// Thin fetch wrapper around the REST API in src/app/api/**.
// The web UI uses this, but the same endpoints are meant to be consumed by
// a future companion mobile app.

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  createGoal: <T>(data: unknown) =>
    request<T>("/api/goals", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: <T>(id: string, data: unknown) =>
    request<T>(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteGoal: (id: string) => request(`/api/goals/${id}`, { method: "DELETE" }),

  // Shared contact directory (not tied to a single goal).
  createContact: <T>(data: unknown) =>
    request<T>("/api/contacts", { method: "POST", body: JSON.stringify(data) }),
  updateContact: <T>(id: string, data: unknown) =>
    request<T>(`/api/contacts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteContact: (id: string) => request(`/api/contacts/${id}`, { method: "DELETE" }),

  // Linking a directory contact to a specific goal.
  linkContact: <T>(goalId: string, data: unknown) =>
    request<T>(`/api/goals/${goalId}/contacts`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateGoalContact: <T>(goalContactId: string, data: unknown) =>
    request<T>(`/api/goal-contacts/${goalContactId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  unlinkContact: (goalContactId: string) =>
    request(`/api/goal-contacts/${goalContactId}`, { method: "DELETE" }),

  createSubtask: <T>(goalId: string, data: unknown) =>
    request<T>(`/api/goals/${goalId}/subtasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSubtask: <T>(id: string, data: unknown) =>
    request<T>(`/api/subtasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSubtask: (id: string) => request(`/api/subtasks/${id}`, { method: "DELETE" }),

  createIndicator: <T>(data: unknown) =>
    request<T>("/api/indicators", { method: "POST", body: JSON.stringify(data) }),
  updateIndicator: <T>(id: string, data: unknown) =>
    request<T>(`/api/indicators/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteIndicator: (id: string) => request(`/api/indicators/${id}`, { method: "DELETE" }),

  uploadAttachment: async <T>(subtaskId: string, file: File): Promise<T> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/subtasks/${subtaskId}/attachments`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? `Upload failed with status ${res.status}`);
    }
    return res.json();
  },
  deleteAttachment: (id: string) => request(`/api/attachments/${id}`, { method: "DELETE" }),
};
