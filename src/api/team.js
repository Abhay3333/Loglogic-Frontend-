import axios from "axios";
import { supabase } from "../lib/supabase";

const BASE_URL = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || "http://localhost:5000").replace(/\/health\/?$/, "").replace(/\/+$/, "");

const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.access_token : "";
};

/**
 * Fetch all members and pending invites for an organization
 */
export const getWorkspaceMembers = async (orgId) => {
    const token = await getAuthToken();

    const response = await axios.get(`${BASE_URL}/v1/organizations/members?orgId=${encodeURIComponent(orgId)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Generate a new team invite
 */
export const inviteMember = async ({ orgId, email, role, accessExpiresAt }) => {
    const token = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/v1/organizations/invites`, {
        orgId,
        email,
        role,
        accessExpiresAt: accessExpiresAt || null
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Validate an invite token (public check for /invite landing page)
 */
export const validateInvite = async (token) => {
    const response = await axios.get(`${BASE_URL}/v1/organizations/invites/validate?token=${encodeURIComponent(token)}`, {
        withCredentials: true
    });
    return response.data;
};

/**
 * Accept invite and join workspace
 */
export const acceptInvite = async (token) => {
    const authToken = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/v1/organizations/invites/accept`, { token }, {
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Remove a member from the workspace
 */
export const removeMember = async (orgId, userId) => {
    const token = await getAuthToken();

    const response = await axios.delete(`${BASE_URL}/v1/organizations/members/${encodeURIComponent(userId)}?orgId=${encodeURIComponent(orgId)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Cancel a pending invitation
 */
export const cancelInvite = async (orgId, inviteId) => {
    const token = await getAuthToken();

    const response = await axios.delete(`${BASE_URL}/v1/organizations/invites/${encodeURIComponent(inviteId)}?orgId=${encodeURIComponent(orgId)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Update an active member's role and/or temporary access expiry
 */
export const updateWorkspaceMember = async (userId, { orgId, role, accessExpiresAt }) => {
    const token = await getAuthToken();

    const response = await axios.patch(`${BASE_URL}/v1/organizations/members/${encodeURIComponent(userId)}`, {
        orgId,
        role,
        accessExpiresAt
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

