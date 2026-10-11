import axios from "axios";
import { supabase } from "../lib/supabase";

const BASE_URL = import.meta.env.VITE_API_LOCAL_URL || "http://localhost:5000";

const authHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${session ? session.access_token : ""}` };
};

export const listAuditLogs = async (orgId, filters = {}) => {
    const headers = await authHeaders();
    const response = await axios.get(`${BASE_URL}/v1/audit`, {
        headers,
        params: { orgId, ...filters },
        withCredentials: true
    });
    return response.data;
};

// Record a client-origin security event (auth.login / auth.logout). The server
// stamps the trusted IP / user-agent / request-id — the client cannot forge them.
export const recordAuditEvent = async (orgId, action) => {
    const headers = await authHeaders();
    const response = await axios.post(`${BASE_URL}/v1/audit/events`, { orgId, action }, {
        headers,
        withCredentials: true
    });
    return response.data;
};

// Returns a CSV Blob for the current filter.
export const exportAuditCsv = async (orgId, filters = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session ? session.access_token : "";
    const query = new URLSearchParams({ orgId, ...filters }).toString();
    const response = await fetch(`${BASE_URL}/v1/audit/export?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
    });
    if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.error || "Audit export failed.");
    }
    return response.blob();
};
