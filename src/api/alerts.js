import axios from "axios";
import { supabase } from "../lib/supabase";

const BASE_URL = import.meta.env.VITE_API_LOCAL_URL || "http://localhost:5000";

const authHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${session ? session.access_token : ""}` };
};

export const listAlertRules = async (orgId) => {
    const headers = await authHeaders();
    const response = await axios.get(`${BASE_URL}/v1/alerts/rules`, {
        headers,
        params: { orgId },
        withCredentials: true
    });
    return response.data;
};

export const createAlertRule = async (orgId, rule) => {
    const headers = await authHeaders();
    const response = await axios.post(`${BASE_URL}/v1/alerts/rules`, { orgId, ...rule }, {
        headers,
        withCredentials: true
    });
    return response.data;
};

export const updateAlertRule = async (orgId, ruleId, patch) => {
    const headers = await authHeaders();
    const response = await axios.patch(`${BASE_URL}/v1/alerts/rules/${ruleId}`, { orgId, ...patch }, {
        headers,
        withCredentials: true
    });
    return response.data;
};

export const deleteAlertRule = async (orgId, ruleId) => {
    const headers = await authHeaders();
    const response = await axios.delete(`${BASE_URL}/v1/alerts/rules/${ruleId}`, {
        headers,
        params: { orgId },
        withCredentials: true
    });
    return response.data;
};

export const muteAlertRule = async (orgId, ruleId, duration) => {
    const headers = await authHeaders();
    const response = await axios.post(`${BASE_URL}/v1/alerts/rules/${ruleId}/mute`, { orgId, duration }, {
        headers,
        withCredentials: true
    });
    return response.data;
};

export const testAlertRule = async (orgId, ruleId) => {
    const headers = await authHeaders();
    const response = await axios.post(`${BASE_URL}/v1/alerts/rules/${ruleId}/test`, { orgId }, {
        headers,
        withCredentials: true
    });
    return response.data;
};

export const listAlertHistory = async (orgId) => {
    const headers = await authHeaders();
    const response = await axios.get(`${BASE_URL}/v1/alerts/history`, {
        headers,
        params: { orgId },
        withCredentials: true
    });
    return response.data;
};

export const acknowledgeAlert = async (orgId, historyId) => {
    const headers = await authHeaders();
    const response = await axios.patch(`${BASE_URL}/v1/alerts/history/${historyId}`, {
        orgId,
        status: "acknowledged"
    }, {
        headers,
        withCredentials: true
    });
    return response.data;
};
