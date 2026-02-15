import { apiFetch } from './client';

export const searchNumbers = async (areaCode: string) => {
    const data = await apiFetch(`/api/phone/search?areaCode=${areaCode}`);
    return data;
};

export const buyNumber = async (phoneNumber: string, agentId: string) => {
    const data = await apiFetch('/api/phone/buy', { method: 'POST', body: JSON.stringify({ phoneNumber, agentId }) });
    return data;
};

export const getAgentNumber = async (agentId: string) => {
    const data = await apiFetch(`/api/phone/${agentId}`);
    return data;
};

// Number Registry APIs
export const getNumberRegistry = async () => {
    const data = await apiFetch('/api/phone/registry/all');
    return data;
};

export const getAvailableNumbers = async () => {
    const data = await apiFetch('/api/phone/registry/available');
    return data;
};

export const assignNumber = async (phoneNumberId: string, userId: string) => {
    const data = await apiFetch('/api/phone/registry/assign', { 
        method: 'POST', 
        body: JSON.stringify({ phoneNumberId, userId }) 
    });
    return data;
};

export const unassignNumber = async (phoneNumberId: string) => {
    const data = await apiFetch('/api/phone/registry/unassign', { 
        method: 'POST', 
        body: JSON.stringify({ phoneNumberId }) 
    });
    return data;
};
