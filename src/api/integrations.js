import axios from "axios";
import { supabase } from "../lib/supabase";

const BASE_URL = import.meta.env.VITE_API_LOCAL_URL || "http://localhost:5000";

const authHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${session ? session.access_token : ""}` };
};

// --- Integrations registry -------------------------------------------------

export const listIntegrations = async (orgId) => {
    const headers = await authHeaders();
    const response = await axios.get(`${BASE_URL}/v1/integrations`, {
        headers,
        params: { orgId },
        withCredentials: true
    });
    return response.data;
};

export const createIntegration = async (orgId, integration) => {
    const headers = await authHeaders();
    const response = await axios.post(`${BASE_URL}/v1/integrations`, { orgId, ...integration }, {
        headers,
        withCredentials: true
    });
    return response.data;
};

export const updateIntegration = async (orgId, id, patch) => {
    const headers = await authHeaders();
    const response = await axios.patch(`${BASE_URL}/v1/integrations/${id}`, { orgId, ...patch }, {
        headers,
        withCredentials: true
    });
    return response.data;
};

export const deleteIntegration = async (orgId, id) => {
    const headers = await authHeaders();
    const response = await axios.delete(`${BASE_URL}/v1/integrations/${id}`, {
        headers,
        params: { orgId },
        withCredentials: true
    });
    return response.data;
};

export const testIntegration = async (orgId, id) => {
    const headers = await authHeaders();
    const response = await axios.post(`${BASE_URL}/v1/integrations/${id}/test`, { orgId }, {
        headers,
        withCredentials: true
    });
    return response.data;
};

export const createIssueFromLog = async (orgId, { integrationId, logId, incidentId }) => {
    const headers = await authHeaders();
    const response = await axios.post(`${BASE_URL}/v1/integrations/issues`, {
        orgId, integrationId, logId, incidentId
    }, { headers, withCredentials: true });
    return response.data;
};

// --- Incidents -------------------------------------------------------------

export const listIncidents = async (orgId) => {
    const headers = await authHeaders();
    const response = await axios.get(`${BASE_URL}/v1/integrations/incidents`, {
        headers,
        params: { orgId },
        withCredentials: true
    });
    return response.data;
};

export const getIncident = async (orgId, id) => {
    const headers = await authHeaders();
    const response = await axios.get(`${BASE_URL}/v1/integrations/incidents/${id}`, {
        headers,
        params: { orgId },
        withCredentials: true
    });
    return response.data;
};

export const addIncidentNote = async (orgId, id, message) => {
    const headers = await authHeaders();
    const response = await axios.post(`${BASE_URL}/v1/integrations/incidents/${id}/notes`, { orgId, message }, {
        headers,
        withCredentials: true
    });
    return response.data;
};

export const updateIncidentStatus = async (orgId, id, status) => {
    const headers = await authHeaders();
    const response = await axios.patch(`${BASE_URL}/v1/integrations/incidents/${id}`, { orgId, status }, {
        headers,
        withCredentials: true
    });
    return response.data;
};
