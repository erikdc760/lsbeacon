import { apiFetch } from './client';

export const getQueue = async () => {
    const data = await apiFetch('/api/agent/queue');
    return data;
};

export const initiateCall = async (contactId: string) => {
    const data = await apiFetch('/api/phone/call', { method: 'POST', body: JSON.stringify({ contactId }) });
    return data;
};

export const sendSms = async (contactId: string, text: string) => {
    const data = await apiFetch('/api/phone/sms', { method: 'POST', body: JSON.stringify({ contactId, text }) });
    return data;
};

export const getInteractions = async (contactId: string) => {
    const data = await apiFetch(`/api/agent/interactions/${contactId}`);
    return data;
};
