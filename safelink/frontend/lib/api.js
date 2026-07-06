const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('safelink_token');
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem('safelink_token', token);
  else window.localStorage.removeItem('safelink_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { auth: true }),

  verifyImei: (imei) => request(`/verify?imei=${encodeURIComponent(imei)}`),

  listPhones: () => request('/phones', { auth: true }),
  registerPhone: (payload) => request('/phones', { method: 'POST', body: payload, auth: true }),
  deletePhone: (id) => request(`/phones/${id}`, { method: 'DELETE', auth: true }),

  listReports: () => request('/reports', { auth: true }),
  createReport: (payload) => request('/reports', { method: 'POST', body: payload, auth: true }),
  markRecovered: (phoneId) =>
    request('/reports/recover', { method: 'POST', body: { phoneId }, auth: true }),

  adminStats: () => request('/admin/stats', { auth: true }),
  adminListReports: (status) =>
    request(`/admin/reports${status ? `?status=${status}` : ''}`, { auth: true }),
  adminUpdateReport: (id, payload) =>
    request(`/admin/reports/${id}`, { method: 'PATCH', body: payload, auth: true }),
  adminListUsers: () => request('/admin/users', { auth: true }),
  adminSetUserActive: (id, isActive) =>
    request(`/admin/users/${id}/active`, { method: 'PATCH', body: { isActive }, auth: true }),
};
