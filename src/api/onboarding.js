import axios from 'axios';
import { supabase } from '../lib/supabase';
const BASE_URL = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5000').replace(/\/health\/?$/, '').replace(/\/+$/, '');
async function request(orgId, suffix, method, body, signal) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Sign in again to continue onboarding.');
    const response = await axios({ url: `${BASE_URL}/v1/onboarding/${encodeURIComponent(orgId)}${suffix}`, method,
        data: body, signal, timeout: 10000, headers: { Authorization: `Bearer ${session.access_token}` } });
    return { ...response.data, ...(suffix === '/test-event' ? { eventId: response.headers['x-onboarding-event-id'] } : {}) };
}
export const getOnboarding = (orgId, signal, eventId) => request(orgId, eventId ? `?eventId=${encodeURIComponent(eventId)}` : '', 'GET', undefined, signal);
export const sendTestEvent = (orgId, signal) => request(orgId, '/test-event', 'POST', {}, signal);
export const confirmDashboard = (orgId, logId, signal) => request(orgId, '/dashboard-viewed', 'POST', { logId }, signal);
