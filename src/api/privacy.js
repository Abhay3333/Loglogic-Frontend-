import axios from 'axios';
import { supabase } from '../lib/supabase';
const base = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5000').replace(/\/health\/?$/, '').replace(/\/+$/, '');
export async function privacyRequest(orgId, action = '', data) {
  const { data: { session } } = await supabase.auth.getSession();
  const result = await axios({ url: `${base}/v1/privacy${action}`, method: data ? 'POST' : 'GET', params: { orgId }, data,
    headers: { Authorization: `Bearer ${session?.access_token || ''}` }, withCredentials: true });
  return result.data;
}
