import axios from 'axios';
import { supabase } from '../lib/supabase';

const base = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5000')
  .replace(/\/health\/?$/, '').replace(/\/+$/, '');

export async function redactionRequest(orgId, method = 'GET', data) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await axios({
    url: `${base}/v1/settings/redaction${method === 'PREVIEW' ? '/preview' : ''}`,
    method: method === 'PREVIEW' ? 'POST' : method,
    params: { orgId }, data,
    headers: { Authorization: `Bearer ${session?.access_token || ''}` },
    withCredentials: true,
  });
  return response.data;
}
