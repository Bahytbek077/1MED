import type { User, Service, Plan, Message, Step, Alert } from "@shared/schema";

export type Role = 'patient' | 'doctor' | 'admin';
export type ServiceType = 'consultation' | 'test' | 'specialist';

export interface SubscriptionWithSteps {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string | null;
  doctorNotes: string | null;
  route: Step[];
}

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchJson<User>(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { name: string; email: string; password: string; role: string }) =>
      fetchJson<User>(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  users: {
    getAll: () => fetchJson<User[]>(`${API_BASE}/users`),
    get: (id: string) => fetchJson<User>(`${API_BASE}/users/${id}`),
    create: (data: Partial<User>) =>
      fetchJson<User>(`${API_BASE}/users`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<User>) =>
      fetchJson<User>(`${API_BASE}/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
      }),
  },

  services: {
    getAll: () => fetchJson<Service[]>(`${API_BASE}/services`),
    create: (data: { name: string; type: string }) =>
      fetchJson<Service>(`${API_BASE}/services`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Service>) =>
      fetchJson<Service>(`${API_BASE}/services/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`${API_BASE}/services/${id}`, {
        method: 'DELETE',
      }),
  },

  plans: {
    getAll: () => fetchJson<Plan[]>(`${API_BASE}/plans`),
    create: (data: Partial<Plan>) =>
      fetchJson<Plan>(`${API_BASE}/plans`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Plan>) =>
      fetchJson<Plan>(`${API_BASE}/plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`${API_BASE}/plans/${id}`, {
        method: 'DELETE',
      }),
  },

  subscriptions: {
    getAll: () => fetchJson<SubscriptionWithSteps[]>(`${API_BASE}/subscriptions`),
    get: (id: string) => fetchJson<SubscriptionWithSteps>(`${API_BASE}/subscriptions/${id}`),
    getByUser: (userId: string) => fetchJson<SubscriptionWithSteps[]>(`${API_BASE}/users/${userId}/subscriptions`),
    create: (data: { userId: string; planId: string; status?: string }) =>
      fetchJson<SubscriptionWithSteps>(`${API_BASE}/subscriptions`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<SubscriptionWithSteps>) =>
      fetchJson<SubscriptionWithSteps>(`${API_BASE}/subscriptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`${API_BASE}/subscriptions/${id}`, {
        method: 'DELETE',
      }),
  },

  steps: {
    create: (subscriptionId: string, data: Partial<Step>) =>
      fetchJson<Step>(`${API_BASE}/subscriptions/${subscriptionId}/steps`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Step>) =>
      fetchJson<Step>(`${API_BASE}/steps/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`${API_BASE}/steps/${id}`, {
        method: 'DELETE',
      }),
  },

  messages: {
    getAll: () => fetchJson<Message[]>(`${API_BASE}/messages`),
    getBetweenUsers: (userId1: string, userId2: string) =>
      fetchJson<Message[]>(`${API_BASE}/messages/${userId1}/${userId2}`),
    send: (data: { fromId: string; toId: string; content: string }) =>
      fetchJson<Message>(`${API_BASE}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  alerts: {
    getAll: () => fetchJson<Alert[]>(`${API_BASE}/alerts`),
    getByDoctor: (doctorId: string) => fetchJson<Alert[]>(`${API_BASE}/alerts/doctor/${doctorId}`),
    update: (id: string, data: Partial<Alert>) =>
      fetchJson<Alert>(`${API_BASE}/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
};
