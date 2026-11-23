import { supabase } from '../lib/supabase';

async function platformRequest(path, { method = 'GET', body, supportToken } = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const base = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5000').replace(/\/health\/?$/, '').replace(/\/+$/, '');
    const response = await fetch(`${base}/v1/platform${path}`, {
        method,
        headers: { Authorization: `Bearer ${session?.access_token || ''}`,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(supportToken ? { 'X-Support-Session': supportToken } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
        cache: 'no-store', signal: AbortSignal.timeout(30000)
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.error || 'Platform access verification failed.');
        error.code = data.code;
        error.status = response.status;
        throw error;
    }
    return data;
}

export const verifyPlatformAccess = () => platformRequest('/session');
export const getPlatformOverview = (page = 1) => platformRequest(`/overview?page=${encodeURIComponent(page)}`);

export const getPlatformQueues = () => platformRequest('/queues');
export const getPlatformRevenue = () => platformRequest('/revenue');
export const getPlatformTenant = (id) => platformRequest(`/tenants/${encodeURIComponent(id)}`);
export const setPlatformControls = (id, body) => platformRequest(`/tenants/${encodeURIComponent(id)}/controls`, { method: 'PATCH', body });
export const startSupportSession = (id, reason) => platformRequest(`/tenants/${encodeURIComponent(id)}/support-sessions`, { method: 'POST', body: { reason } });
export const endSupportSession = (id) => platformRequest(`/support-sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const querySupportLogs = (supportToken, body) => platformRequest('/support/query', { method: 'POST', body, supportToken });
