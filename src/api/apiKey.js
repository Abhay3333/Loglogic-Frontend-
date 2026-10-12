import axios from "axios";
import { supabase } from "../lib/supabase";

const BASE_URL = import.meta.env.VITE_API_LOCAL_URL || "http://localhost:5000";

const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.access_token : "";
};

export const createApiKey = async ({ orgId, keyName }) => {
    const token = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/api/keys/create`, { orgId, keyName }, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

export const getApiKeys = async (orgId) => {
    const token = await getAuthToken();
    const url = orgId ? `${BASE_URL}/api/keys?orgId=${encodeURIComponent(orgId)}` : `${BASE_URL}/api/keys`;

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

export const revokeApiKey = async (keyId, orgId) => {
    const token = await getAuthToken();

    const response = await axios.delete(`${BASE_URL}/api/keys/${encodeURIComponent(keyId)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: orgId ? { orgId } : undefined,
        withCredentials: true
    });
    return response.data;
};
