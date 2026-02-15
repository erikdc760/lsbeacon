import { apiFetch } from './client';

export const ownerApi = {
    getDashboardStats: async () => {
        return apiFetch('/api/owner/dashboard-stats');
    },
    getUsers: async () => {
        return apiFetch('/api/company/users');
    },
    createUser: async (userData: any) => {
        return apiFetch('/api/company/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    getTeamPerformance: async () => {
        return apiFetch('/api/owner/team-performance');
    },
    getLiveCalls: async () => {
        return apiFetch('/api/owner/live-calls');
    }
};
