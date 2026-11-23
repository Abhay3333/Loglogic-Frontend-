import axios from 'axios';
import { supabase } from '../lib/supabase';
const BASE_URL = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5000').replace(/\/health\/?$/, '').replace(/\/+$/, '');
async function request(path, orgId, body, signal) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Sign in to use AI assistance.');
    const response = await axios.post(`${BASE_URL}/v1/ai/${path}`, { ...body, orgId }, {
        signal, timeout: 30000, headers: { Authorization: `Bearer ${session.access_token}` }
    });
    return response.data;
}
export const analyzeLog = (orgId, log, signal) => request('analyze', orgId, { log }, signal);
export const aiQuery = (orgId, query, signal) => request('query', orgId, { query }, signal);
export const generatePostMortem = (orgId, incidentId, signal) => request('post-mortem', orgId, { incidentId }, signal);
export function downloadMarkdown(markdown, incidentId) {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `post-mortem-${String(incidentId).replace(/[^a-zA-Z0-9-]/g, '')}.md`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
