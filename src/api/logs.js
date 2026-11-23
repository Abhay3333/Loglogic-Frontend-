import axios from "axios";
import { supabase } from "../lib/supabase";

const BASE_URL = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || "http://localhost:5000").replace(/\/health\/?$/, "").replace(/\/+$/, "");

const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.access_token : "";
};

/**
 * Query logs with pagination, search, level filtering, and time ranges
 */
export const queryLogs = async (params = {}, signal) => {
    const token = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/v1/logs/query`, params, {
        signal,
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Fetch aggregated statistics, error rates, and volume time-series
 */
export const getLogStats = async ({ orgId, timeRange = '24h' } = {}) => {
    const token = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/v1/logs/stats`, { orgId, timeRange }, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Open a Server-Sent Events tail. Caller owns the EventSource and must close it.
 * A fresh Supabase access token is read on every call so reconnects are not stuck
 * on an expired query token.
 */
export const openLogStream = async (orgId) => {
    const token = await getAuthToken();
    const url = `${BASE_URL}/v1/logs/stream?orgId=${encodeURIComponent(orgId)}&token=${encodeURIComponent(token)}`;
    return new EventSource(url);
};

/**
 * Fetch distinct microservices list for filter dropdowns
 */
export const getOrgServices = async (orgId) => {
    const token = await getAuthToken();

    const response = await axios.get(`${BASE_URL}/v1/logs/services${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

// Saved Queries

export const getSavedQueries = async (orgId) => {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}/v1/logs/saved-queries${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const createSavedQuery = async (params) => {
    const token = await getAuthToken();
    const response = await axios.post(`${BASE_URL}/v1/logs/saved-queries`, params, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const deleteSavedQuery = async (queryId) => {
    const token = await getAuthToken();
    const response = await axios.delete(`${BASE_URL}/v1/logs/saved-queries/${encodeURIComponent(queryId)}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

// Download from S3, with support for the direct CSV fallback.
export const exportLogsCsv = async (params = {}) => {
    const token = await getAuthToken();
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '') continue;
        for (const item of Array.isArray(value) ? value : [value]) {
            query.append(key, item);
        }
    }
    const qs = query.toString();
    const response = await fetch(`${BASE_URL}/v1/logs/export?${qs}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        let errorMessage = `Export failed with status: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.message || errorData.error) errorMessage = errorData.message || errorData.error;
        } catch {
            // Ignore if not JSON
        }
        throw new Error(errorMessage);
    }
    
    if (response.headers.get('content-type')?.includes('application/json')) {
        const { url } = await response.json();
        if (!url) throw new Error('Export response is missing the download URL.');
        window.location.href = url;
        return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loglogic_${params.orgId || 'export'}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
