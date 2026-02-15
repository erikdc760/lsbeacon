export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type ApiFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  /** default true: attach Bearer token from localStorage */
  auth?: boolean;
};

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const base = API_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${base}${cleanPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.auth !== false) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '');

  if (!res.ok) {
    const message = (body && (body.message || body.error)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body as T;
}

// ✅ keep old imports working: import { apiClient } from "./client";
export const apiClient = apiFetch;
