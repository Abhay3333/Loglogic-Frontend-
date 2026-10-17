import axios from "axios";
import { supabase } from "../lib/supabase";

const BASE_URL = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || "http://localhost:5000").replace(/\/health\/?$/, "").replace(/\/+$/, "");

const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.access_token : "";
};

/**
 * Check the caller's own membership, expiry, and latest access request for an organization.
 * Works even if the user's temporary access is expired.
 */
export const getMyAccess = async (orgId) => {
    if (!orgId) return null;
    const token = await getAuthToken();

    const response = await axios.get(`${BASE_URL}/v1/access/status?orgId=${encodeURIComponent(orgId)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Submit an access request to the workspace owner (for expired or active members).
 */
export const requestAccess = async ({ orgId, message, requestedRole }) => {
    const token = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/v1/access/requests`, {
        orgId,
        message,
        requestedRole
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * List access requests for an organization (owner/admin only).
 */
export const getAccessRequests = async (orgId, status = '') => {
    const token = await getAuthToken();
    const query = status ? `&status=${encodeURIComponent(status)}` : '';

    const response = await axios.get(`${BASE_URL}/v1/access/requests?orgId=${encodeURIComponent(orgId)}${query}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Approve an access request (owner/admin only).
 */
export const approveAccessRequest = async (requestId, { orgId, role, accessExpiresAt }) => {
    const token = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/v1/access/requests/${encodeURIComponent(requestId)}/approve`, {
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

/**
 * Reject an access request with a required reason (owner/admin only).
 */
export const rejectAccessRequest = async (requestId, { orgId, reason }) => {
    const token = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/v1/access/requests/${encodeURIComponent(requestId)}/reject`, {
        orgId,
        reason
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Transfer workspace ownership to another member (owner only).
 */
export const transferOwnership = async ({ orgId, newOwnerUserId, demoteToRole = 'admin' }) => {
    const token = await getAuthToken();

    const response = await axios.post(`${BASE_URL}/v1/access/ownership/transfer`, {
        orgId,
        newOwnerUserId,
        demoteToRole
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};

/**
 * Fetch chronological workspace activity feed.
 */
export const getWorkspaceActivity = async (orgId, limit = 50) => {
    const token = await getAuthToken();

    const response = await axios.get(`${BASE_URL}/v1/access/activity?orgId=${encodeURIComponent(orgId)}&limit=${encodeURIComponent(limit)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    });
    return response.data;
};
