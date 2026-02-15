import { apiFetch } from './client';

export type CompanyOwner = {
  id: string;
  name: string;
  email: string;
};

export type Campaign = {
  companies: any;
  id: string;
  name: string;
  start_date: string;
  start_time: string;
  end_date?: string;
  is_ongoing: boolean;
  daily_budget: string;
  est_volume: string;
  source: string;
  lead_description: string;
  status: 'ACTIVE' | 'ENDED' | 'UPCOMING';
  company_id: string;
};

export type Company = {
  id: string;
  name: string;
  relations?: 'Affiliate' | 'Independent';
  agency_name?: string;
  size?: 'Small' | 'Medium' | 'Large';
  est_monthly_output?: string;
  notes?: string;
  created_at?: string;
  owners?: CompanyOwner[];
  campaigns?: Campaign[];
  counts?: { owners: number; agents: number; users: number };
};

export async function getCompanies(page = 1, limit = 20): Promise<{ companies: Company[]; total: number; page: number; limit: number }> {
  return apiFetch(`/api/admin/companies?page=${page}&limit=${limit}`);
}

export async function getCampaigns(page = 1, limit = 20): Promise<{ campaigns: Campaign[]; total: number; page: number; limit: number }> {
    return apiFetch(`/api/admin/campaigns?page=${page}&limit=${limit}`);
}

export async function createCompany(input: Partial<Company>): Promise<any> {
    return apiFetch('/api/admin/companies', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export async function removeCompany(id: string): Promise<any> {
    return apiFetch(`/api/admin/companies/${id}`, {
        method: 'DELETE',
    });
}

export async function createCampaign(input: Partial<Campaign>): Promise<any> {
    return apiFetch('/api/admin/campaigns', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export async function updateCampaign(id: string, input: Partial<Campaign>): Promise<any> {
    return apiFetch(`/api/admin/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
    });
}

export async function removeCampaign(id: string): Promise<any> {
    return apiFetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
    });
}

export async function createCompanyOwner(input: {
  name: string;
  email: string;
  password: string;
  companyName: string;
  relations?: string;
  agency_name?: string;
  size?: string;
  est_monthly_output?: string;
  notes?: string;
}): Promise<any> {
  return apiFetch('/api/admin/create-company-owner', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getLeadStats(): Promise<any> {
    return apiFetch('/api/admin/leads/stats');
}

export async function toggleLeadRule(id: number, active: boolean): Promise<any> {
    return apiFetch(`/api/admin/leads/rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ active }),
    });
}

export async function triggerRedistribution(): Promise<any> {
    return apiFetch('/api/admin/leads/distribute', {
        method: 'POST',
    });
}

export async function getDashboardAggregates(): Promise<any> {
    return apiFetch('/api/admin/dashboard/aggregates');
}

export async function getDashboardDirectives(): Promise<{ owner_name: string; quote: string; updated_at?: string }> {
    return apiFetch('/api/admin/dashboard/directives');
}

export async function updateDashboardDirectives(input: { owner_name: string; quote: string }): Promise<{ owner_name: string; quote: string; updated_at?: string }> {
    return apiFetch('/api/admin/dashboard/directives', {
        method: 'PUT',
        body: JSON.stringify(input),
    });
}

export async function getPhantomStats(companyId?: string): Promise<{ liveAgents: number; dailyDials: number }> {
    const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : '';
    return apiFetch(`/api/admin/phantom/stats${query}`);
}
