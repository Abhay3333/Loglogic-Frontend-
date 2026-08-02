import axios from "axios";
import { supabase } from "../lib/supabase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const createOrganization = async (orgData) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session ? session.access_token : "";

    const response = await axios.post(`${BASE_URL}/api/organizations/create`, orgData, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
}

export const getOrganizations = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session ? session.access_token : "";

    const response = await axios.get(`${BASE_URL}/api/organizations/get`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
}