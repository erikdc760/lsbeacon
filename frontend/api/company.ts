import { apiFetch } from './client';

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'company_owner' | string;
  supervisor_id?: string | null;
  company_id?: string;
  created_at?: string;
}

export type HierarchyResponse = {
  owner: CompanyUser | null;
  agents: CompanyUser[];
  unassignedAgents: CompanyUser[];
};

export async function listUsers(role: 'all' | 'agent' | 'company_owner' = 'all') {
  const q = role === 'all' ? '' : `?role=${encodeURIComponent(role)}`;
  return apiFetch<{ users: CompanyUser[] }>(`/api/company/users${q}`);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: 'agent';
}) {
  return apiFetch('/api/company/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getHierarchy() {
  return apiFetch<HierarchyResponse>('/api/company/hierarchy');
}

export async function assignAgent(agentId: string, supervisorId: string | null) {
  return apiFetch('/api/company/assign-agent', {
    method: 'POST',
    body: JSON.stringify({ agentId, supervisorId }),
  });
}

export async function deleteUser(userId: string) {
  return apiFetch(`/api/company/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function transferOwnership(newOwnerId: string) {
  return apiFetch('/api/company/transfer-ownership', {
    method: 'POST',
    body: JSON.stringify({ newOwnerId }),
  });
}
