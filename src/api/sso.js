import axios from 'axios';
import { supabase } from '../lib/supabase';
const base = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5000').replace(/\/health\/?$/, '').replace(/\/+$/, '');
export async function startSso(email) {
  const { data } = await axios.post(`${base}/v1/sso/start`, { email });
  return data;
}
export async function ssoSettings(orgId, settings) {
  const { data: { session } } = await supabase.auth.getSession();
  const { data } = await axios({ url: `${base}/v1/sso/settings`, method: settings ? 'PUT' : 'GET', params: { orgId }, data: settings,
    headers: { Authorization: `Bearer ${session?.access_token || ''}` } });
  return data.settings;
}
