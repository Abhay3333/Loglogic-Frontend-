import axios from "axios";
import { supabase } from "../lib/supabase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.access_token : "";
};

/**
 * Query logs with pagination, search, level filtering, and time ranges
 */
export const queryLogs = async (params = {}) => {
    const token = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/v1/logs/query`, params, {
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
