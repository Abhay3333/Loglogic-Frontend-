import axios from 'axios'
import { supabase } from '../lib/supabase'

const BASE_URL = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5000').replace(/\/health\/?$/, '').replace(/\/+$/, '')

const authHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return { Authorization: `Bearer ${session?.access_token || ''}` }
}

export const getBilling = async (orgId, sessionId) => {
  const headers = await authHeaders()
  const response = await axios.get(`${BASE_URL}/v1/billing`, {
    headers,
    params: { orgId, session_id: sessionId || undefined },
    withCredentials: true
  })
  return response.data
}

export const startCheckout = async (orgId, plan = 'pro') => {
  const headers = await authHeaders()
  const response = await axios.post(`${BASE_URL}/v1/billing/checkout`, { orgId, plan }, {
    headers,
    withCredentials: true
  })
  return response.data
}

export const openBillingPortal = async (orgId) => {
  const headers = await authHeaders()
  const response = await axios.post(`${BASE_URL}/v1/billing/portal`, { orgId }, {
    headers,
    withCredentials: true
  })
  return response.data
}

export const addSeats = async (orgId, add) => {
  const headers = await authHeaders()
  const response = await axios.post(`${BASE_URL}/v1/billing/seats`, { orgId, add }, {
    headers,
    withCredentials: true
  })
  return response.data
}
