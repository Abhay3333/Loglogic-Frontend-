import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import BillingSettings from '../components/BillingSettings';
import RedactionSettings from '../components/RedactionSettings';
import PrivacyRequests from '../components/PrivacyRequests';
import SsoSettings from '../components/SsoSettings';
import KeyPolicyEditor, { KeyPolicyFields } from '../components/KeyPolicyEditor';
import { parseCidrInput } from '../lib/keyPolicy';
import { getApiKeys, createApiKey, revokeApiKey } from '../api/apiKey';
import {
  getWorkspaceMembers,
  inviteMember,
  removeMember,
  cancelInvite,
  updateWorkspaceMember
} from '../api/team';
import {
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  transferOwnership,
  getWorkspaceActivity
} from '../api/access';
import { listAuditLogs, exportAuditCsv } from '../api/audit';
import { can as hasPermission, ASSIGNABLE_ROLES } from '../lib/permissions';
import {
  LuSettings,
  LuKey,
  LuUsers,
  LuCreditCard,
  LuPlus,
  LuTrash2,
  LuCopy,
  LuTriangleAlert,
  LuArrowLeft,
  LuCircleCheck,
  LuExternalLink,
  LuShieldAlert,
  LuX,
  LuLoader,
  LuBuilding2,
  LuMail,
  LuCalendar,
  LuCheck,
  LuLink,
  LuShieldCheck,
  LuClock,
  LuCrown,
  LuUserCheck,
  LuHistory,
  LuFilter,
  LuRefreshCw,
  LuPencil,
  LuCircleX,
  LuSend,
  LuChevronRight,
  LuFileText
} from 'react-icons/lu';

export default function SettingsPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const {
    user,
    organizations = [],
    currentOrg,
    isAccessExpired,
    refreshOrganizations,
    refreshAccessStatus
  } = outletContext;

  const [searchParams] = useSearchParams();
  const billingNotice = searchParams.get('billing');
  const openBilling = billingNotice === 'success' || billingNotice === 'cancelled' || searchParams.get('tab') === 'billing';
  const [activeTab, setActiveTab] = useState(openBilling ? 'billing' : 'api-keys');

  // API Keys State
  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [keysError, setKeysError] = useState(null);

  // Team State
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState(null);

  // Key Modals State
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState(['logs:ingest']);
  const [newKeyCidrs, setNewKeyCidrs] = useState('');
  const [policyKey, setPolicyKey] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const [deleteKeyModalOpen, setDeleteKeyModalOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState(null);

  // Team Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [isTemporaryAccess, setIsTemporaryAccess] = useState(false);
  const [accessExpiresAt, setAccessExpiresAt] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [generatedInviteLink, setGeneratedInviteLink] = useState(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  // Remove Member Modal State
  const [removeUserModalOpen, setRemoveUserModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [removingUser, setRemovingUser] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  // Edit Member Modal State
  const [editMemberModalOpen, setEditMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [editRole, setEditRole] = useState('developer');
  const [editHasExpiry, setEditHasExpiry] = useState(false);
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [savingMember, setSavingMember] = useState(false);
  const [editMemberError, setEditMemberError] = useState(null);

  // Access Requests State
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState(null);
  const [requestsFilter, setRequestsFilter] = useState('all'); // all | pending | approved | rejected

  // Approve Request Modal State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [approveRole, setApproveRole] = useState('developer');
  const [approveIsTemporary, setApproveIsTemporary] = useState(false);
  const [approveExpiresAt, setApproveExpiresAt] = useState('');
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState(null);

  // Reject Request Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  // Ownership Transfer State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [newOwnerUserId, setNewOwnerUserId] = useState('');
  const [demoteToRole, setDemoteToRole] = useState('admin');
  const [confirmWorkspaceName, setConfirmWorkspaceName] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Workspace Activity State
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState(null);
  const [activityFilter, setActivityFilter] = useState('all'); // all | requests | members | ownership

  // Audit Log State (Phase 15)
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [auditAction, setAuditAction] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [auditPagination, setAuditPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [auditExporting, setAuditExporting] = useState(false);

  const activeOrgId = currentOrg?.id || (organizations.length > 0 ? organizations[0].id : null);
  const activeOrgName = currentOrg?.name || (organizations.length > 0 ? organizations[0].name : 'Workspace');

  const activeOrg = currentOrg || (organizations.length > 0 ? organizations[0] : null);
  const userRole = (activeOrg?.role || 'viewer').toLowerCase();
  const isOwner = userRole === 'owner';
  const isAdmin = isOwner || userRole === 'admin';
  const canViewAudit = hasPermission(userRole, 'can_view_audit_trail');
  const canManagePrivacy = isAdmin && hasPermission(userRole, 'can_manage_privacy');
  const canManageKeys = hasPermission(userRole, 'can_manage_keys');

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  const localDateTimeMin = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
  };

  // Fetch API Keys
  const fetchKeys = useCallback(async () => {
    if (!activeOrgId) {
      setKeysLoading(false);
      return;
    }
    setKeysLoading(true);
    setKeysError(null);
    try {
      const data = await getApiKeys(activeOrgId);
      setKeys(data.keys || []);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setKeysError(err.response?.data?.error || err.message || 'Failed to fetch API keys');
    } finally {
      setKeysLoading(false);
    }
  }, [activeOrgId]);

  // Fetch Team Members & Invites
  const fetchTeam = useCallback(async () => {
    if (!activeOrgId) {
      setTeamLoading(false);
      return;
    }
    setTeamLoading(true);
    setTeamError(null);
    try {
      const data = await getWorkspaceMembers(activeOrgId);
      setMembers(data.members || []);
      setPendingInvites(data.pendingInvites || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setTeamError(err.response?.data?.error || err.message || 'Failed to fetch team members');
    } finally {
      setTeamLoading(false);
    }
  }, [activeOrgId]);

  // Fetch Access Requests (Owner / Admin)
  const fetchRequests = useCallback(async () => {
    if (!activeOrgId || !isAdmin) return;
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await getAccessRequests(activeOrgId);
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching access requests:', err);
      setRequestsError(err.response?.data?.error || err.message || 'Failed to fetch access requests');
    } finally {
      setRequestsLoading(false);
    }
  }, [activeOrgId, isAdmin]);

  // Fetch Activity Feed
  const fetchActivity = useCallback(async () => {
    if (!activeOrgId) return;
    setActivityLoading(true);
    setActivityError(null);
    try {
      const data = await getWorkspaceActivity(activeOrgId, 100);
      setActivity(data.activity || []);
    } catch (err) {
      console.error('Error fetching workspace activity:', err);
      setActivityError(err.response?.data?.error || err.message || 'Failed to fetch activity feed');
    } finally {
      setActivityLoading(false);
    }
  }, [activeOrgId]);

  useEffect(() => {
    fetchKeys();
    fetchTeam();
    if (isAdmin) {
      fetchRequests();
    }
    fetchActivity();
  }, [fetchKeys, fetchTeam, fetchRequests, fetchActivity, isAdmin]);

  // Fetch Audit Log (Owner / Admin), lazily when the tab is opened or filters change.
  const fetchAudit = useCallback(async () => {
    if (!activeOrgId || !canViewAudit) return;
    setAuditLoading(true);
    setAuditError(null);
    try {
      const filters = { page: auditPage, limit: 50 };
      if (auditAction) filters.action = auditAction;
      const data = await listAuditLogs(activeOrgId, filters);
      setAuditLogs(data.logs || []);
      setAuditPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching audit log:', err);
      setAuditError(err.response?.data?.error || err.message || 'Failed to fetch audit log');
    } finally {
      setAuditLoading(false);
    }
  }, [activeOrgId, canViewAudit, auditAction, auditPage]);

  useEffect(() => {
    if (activeTab === 'audit') fetchAudit();
  }, [activeTab, fetchAudit]);

  const handleAuditExport = async () => {
    if (!activeOrgId) return;
    setAuditExporting(true);
    try {
      const filters = auditAction ? { action: auditAction } : {};
      const blob = await exportAuditCsv(activeOrgId, filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loglogic_audit_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      setAuditError(err.message || 'Audit export failed.');
    } finally {
      setAuditExporting(false);
    }
  };

  // Handlers: API Keys
  const handleGenerateKey = async (e) => {
    if (e) e.preventDefault();
    if (!newKeyName.trim() || !activeOrgId) return;

    setGenerating(true);
    setGenerateError(null);
    try {
      const response = await createApiKey({
        orgId: activeOrgId,
        keyName: newKeyName.trim(),
        scopes: newKeyScopes,
        allowedCidrs: parseCidrInput(newKeyCidrs)
      });
      setGeneratedKey(response.rawKey);
      fetchKeys();
      fetchActivity();
    } catch (err) {
      console.error('Error generating API key:', err);
      setGenerateError(err.response?.data?.error || err.message || 'Failed to generate key');
    } finally {
      setGenerating(false);
    }
  };

  const copyGeneratedKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const confirmRevokeKey = async () => {
    if (!keyToDelete) return;
    setRevoking(true);
    setRevokeError(null);
    try {
      await revokeApiKey(keyToDelete.id, activeOrgId);
      setDeleteKeyModalOpen(false);
      setKeyToDelete(null);
      fetchKeys();
      fetchActivity();
    } catch (err) {
      console.error('Error revoking API key:', err);
      setRevokeError(err.response?.data?.error || err.message || 'Failed to revoke key');
    } finally {
      setRevoking(false);
    }
  };

  // Handlers: Team
  const handleSendInvite = async (e) => {
    if (e) e.preventDefault();
    if (!inviteEmail.trim() || !activeOrgId) return;

    setInviting(true);
    setInviteError(null);
    try {
      const payload = {
        orgId: activeOrgId,
        email: inviteEmail.trim(),
        role: inviteRole,
        accessExpiresAt: isTemporaryAccess && accessExpiresAt ? new Date(accessExpiresAt).toISOString() : null
      };
      const response = await inviteMember(payload);
      setGeneratedInviteLink(response.inviteLink);
      fetchTeam();
      fetchActivity();
    } catch (err) {
      console.error('Error sending invite:', err);
      setInviteError(err.response?.data?.error || err.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const copyInviteLink = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
  };

  const confirmRemoveMember = async () => {
    if (!userToRemove || !activeOrgId) return;
    setRemovingUser(true);
    setRemoveError(null);
    try {
      await removeMember(activeOrgId, userToRemove.userId);
      setRemoveUserModalOpen(false);
      setUserToRemove(null);
      fetchTeam();
      fetchActivity();
    } catch (err) {
      console.error('Error removing member:', err);
      setRemoveError(err.response?.data?.error || err.message || 'Failed to remove member');
    } finally {
      setRemovingUser(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!activeOrgId || !inviteId) return;
    try {
      await cancelInvite(activeOrgId, inviteId);
      fetchTeam();
      fetchActivity();
    } catch (err) {
      console.error('Error cancelling invite:', err);
    }
  };

  // Handlers: Edit Member
  const openEditMember = (member) => {
    setMemberToEdit(member);
    setEditRole(member.role === 'editor' ? 'developer' : (member.role || 'developer'));
    setEditHasExpiry(Boolean(member.accessExpiresAt));
    setEditExpiryDate(
      member.accessExpiresAt ? new Date(member.accessExpiresAt).toISOString().slice(0, 16) : ''
    );
    setEditMemberError(null);
    setEditMemberModalOpen(true);
  };

  const handleSaveMember = async (e) => {
    if (e) e.preventDefault();
    if (!memberToEdit || !activeOrgId) return;

    setSavingMember(true);
    setEditMemberError(null);
    try {
      await updateWorkspaceMember(memberToEdit.userId, {
        orgId: activeOrgId,
        role: editRole,
        accessExpiresAt: editHasExpiry && editExpiryDate ? new Date(editExpiryDate).toISOString() : null
      });
      setEditMemberModalOpen(false);
      setMemberToEdit(null);
      fetchTeam();
      fetchActivity();
    } catch (err) {
      console.error('Save member error:', err);
      setEditMemberError(err.response?.data?.error || err.message || 'Failed to update member permissions');
    } finally {
      setSavingMember(false);
    }
  };

  // Handlers: Access Requests
  const openApproveModal = (req) => {
    setRequestToApprove(req);
    setApproveRole(req.requestedRole === 'editor' ? 'developer' : (req.requestedRole || 'developer'));
    setApproveIsTemporary(false);
    setApproveExpiresAt('');
    setApproveError(null);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async (e) => {
    if (e) e.preventDefault();
    if (!requestToApprove || !activeOrgId) return;

    setApproving(true);
    setApproveError(null);
    try {
      await approveAccessRequest(requestToApprove.id, {
        orgId: activeOrgId,
        role: approveRole,
        accessExpiresAt: approveIsTemporary && approveExpiresAt ? new Date(approveExpiresAt).toISOString() : null
      });
      setApproveModalOpen(false);
      setRequestToApprove(null);
      fetchRequests();
      fetchTeam();
      fetchActivity();
      if (refreshAccessStatus) refreshAccessStatus();
    } catch (err) {
      console.error('Approve request error:', err);
      setApproveError(err.response?.data?.error || err.message || 'Failed to approve request');
    } finally {
      setApproving(false);
    }
  };

  const openRejectModal = (req) => {
    setRequestToReject(req);
    setRejectionReason('');
    setRejectError(null);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    if (e) e.preventDefault();
    if (!requestToReject || !activeOrgId) return;

    const trimmed = rejectionReason.trim();
    if (!trimmed) {
      setRejectError('A rejection reason is required so the user understands why access was declined.');
      return;
    }

    setRejecting(true);
    setRejectError(null);
    try {
      await rejectAccessRequest(requestToReject.id, {
        orgId: activeOrgId,
        reason: trimmed
      });
      setRejectModalOpen(false);
      setRequestToReject(null);
      setRejectionReason('');
      fetchRequests();
      fetchActivity();
      if (refreshAccessStatus) refreshAccessStatus();
    } catch (err) {
      console.error('Reject request error:', err);
      setRejectError(err.response?.data?.error || err.message || 'Failed to reject request');
    } finally {
      setRejecting(false);
    }
  };

  // Handlers: Ownership Transfer
  const handleConfirmTransfer = async (e) => {
    if (e) e.preventDefault();
    if (!activeOrgId || !newOwnerUserId) return;

    if (confirmWorkspaceName.trim() !== activeOrgName.trim()) {
      setTransferError(`Please type "${activeOrgName}" exactly to confirm.`);
      return;
    }

    setTransferring(true);
    setTransferError(null);
    try {
      await transferOwnership({
        orgId: activeOrgId,
        newOwnerUserId,
        demoteToRole
      });
      setTransferSuccess(true);
      if (refreshOrganizations) await refreshOrganizations();
      if (refreshAccessStatus) await refreshAccessStatus();
      fetchTeam();
      fetchActivity();
      setTimeout(() => {
        setTransferModalOpen(false);
        setTransferSuccess(false);
        setConfirmWorkspaceName('');
        setNewOwnerUserId('');
      }, 2000);
    } catch (err) {
      console.error('Transfer ownership error:', err);
      setTransferError(err.response?.data?.error || err.message || 'Failed to transfer ownership');
    } finally {
      setTransferring(false);
    }
  };

  // Modals
  const DeleteKeyModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/80 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md p-6 relative">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#f87171]/10 rounded-full flex-shrink-0">
            <LuTriangleAlert className="w-6 h-6 text-[#f87171]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f1f3fc]">Revoke API Key</h3>
            <p className="mt-2 text-sm text-[#a8abb3] leading-relaxed">
              Are you sure you want to revoke <strong className="text-[#f1f3fc]">{keyToDelete?.name}</strong>? Any servers or agents using this key will immediately lose access to log ingestion.
            </p>
            {revokeError && (
              <p className="mt-3 p-2 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded">
                {revokeError}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => { setDeleteKeyModalOpen(false); setRevokeError(null); }}
            disabled={revoking}
            className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] bg-[#0a0e14] border border-[#44484f]/40 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmRevokeKey}
            disabled={revoking}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#f87171] hover:bg-red-500 rounded-lg shadow-[0_0_15px_rgba(248,113,113,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {revoking && <LuLoader className="w-4 h-4 animate-spin" />}
            {revoking ? 'Revoking...' : 'Revoke Key'}
          </button>
        </div>
      </div>
    </div>
  );

  const RemoveUserModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/80 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md p-6 relative">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#f87171]/10 rounded-full flex-shrink-0">
            <LuTriangleAlert className="w-6 h-6 text-[#f87171]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f1f3fc]">Remove Team Member</h3>
            <p className="mt-2 text-sm text-[#a8abb3] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#f1f3fc]">{userToRemove?.fullName || userToRemove?.email}</strong> from this workspace? They will immediately lose access to all logs, telemetry streams, and keys.
            </p>
            {removeError && (
              <p className="mt-3 p-2 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded">
                {removeError}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => { setRemoveUserModalOpen(false); setRemoveError(null); }}
            disabled={removingUser}
            className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] bg-[#0a0e14] border border-[#44484f]/40 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmRemoveMember}
            disabled={removingUser}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#f87171] hover:bg-red-500 rounded-lg shadow-[0_0_15px_rgba(248,113,113,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {removingUser && <LuLoader className="w-4 h-4 animate-spin" />}
            {removingUser ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  );

  const GenerateKeyModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/80 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-lg p-6 relative">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#f1f3fc] flex items-center gap-2">
            <LuKey className="text-[#8ff5ff]" /> Generate New API Key
          </h3>
          <button
            onClick={() => { setGenerateModalOpen(false); setGeneratedKey(null); setNewKeyName(''); setGenerateError(null); }}
            className="text-[#7f8594] hover:text-[#f1f3fc] transition-colors cursor-pointer"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {!generatedKey ? (
          <form onSubmit={handleGenerateKey}>
            {generateError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded">
                {generateError}
              </div>
            )}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#a8abb3] mb-2">Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Server Ingestion"
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] block p-2.5 outline-none transition-colors"
                autoFocus
                required
              />
              <p className="text-[11px] text-[#7f8594] mt-1.5">
                Will be bound to workspace: <span className="text-[#8ff5ff] font-medium">{activeOrgName}</span>
              </p>
            </div>
            <KeyPolicyFields scopes={newKeyScopes} onScopesChange={setNewKeyScopes} cidrs={newKeyCidrs} onCidrsChange={setNewKeyCidrs} disabled={generating} />
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setGenerateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newKeyName.trim() || !newKeyScopes.length || generating || isAccessExpired}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#0a0e14] bg-[#00eefc] hover:bg-[#8ff5ff] rounded-lg shadow-[0_0_15px_rgba(0,238,252,0.3)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {generating && <LuLoader className="w-4 h-4 animate-spin text-[#0a0e14]" />}
                {generating ? 'Generating...' : 'Generate Key'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-amber-400/10 border border-amber-400/20 p-4 rounded-lg flex items-start gap-3">
              <LuTriangleAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-400/90 leading-relaxed">
                <strong>Please copy this key now.</strong> For security reasons, it will never be shown again.
              </p>
            </div>

            <div className="bg-[#0a0e14] border border-[#44484f]/40 p-4 rounded-lg flex items-center justify-between gap-4 group">
              <code className="text-[#8ff5ff] font-mono text-sm break-all select-all">{generatedKey}</code>
              <button
                onClick={copyGeneratedKey}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2027] hover:bg-[#252d3a] border border-[#44484f]/50 rounded-md text-[#f1f3fc] text-sm font-medium transition-colors flex-shrink-0 cursor-pointer"
              >
                {keyCopied ? <><LuCircleCheck className="text-[#22c55e]" /> Copied</> : <><LuCopy /> Copy</>}
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => { setGenerateModalOpen(false); setGeneratedKey(null); setNewKeyName(''); setGenerateError(null); }}
                className="px-6 py-2 text-sm font-bold text-[#0a0e14] bg-[#f1f3fc] hover:bg-white rounded-lg transition-all cursor-pointer"
              >
                I've copied it securely
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const InviteMemberModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/80 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-lg p-6 relative">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#f1f3fc] flex items-center gap-2">
            <LuUsers className="text-[#8ff5ff]" /> Invite Workspace Member
          </h3>
          <button
            onClick={() => { setInviteModalOpen(false); setGeneratedInviteLink(null); setInviteEmail(''); setInviteError(null); }}
            className="text-[#7f8594] hover:text-[#f1f3fc] transition-colors cursor-pointer"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {!generatedInviteLink ? (
          <form onSubmit={handleSendInvite} className="space-y-4">
            {inviteError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded">
                {inviteError}
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#a8abb3] mb-1.5">Colleague Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] p-2.5 outline-none transition-colors"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#a8abb3] mb-1.5">Assign Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] p-2.5 outline-none transition-colors"
              >
                <option value="admin">Admin — Manage members, keys, integrations & view audit trail</option>
                <option value="developer">Developer — View/export logs, manage integrations & alerts</option>
                <option value="viewer">Viewer — Read-only log search and analytics</option>
                <option value="auditor">Auditor — Read/export logs + view the audit trail</option>
              </select>
            </div>

            <div className="pt-2 border-t border-[#44484f]/20">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTemporaryAccess}
                  onChange={(e) => setIsTemporaryAccess(e.target.checked)}
                  className="rounded bg-[#0a0e14] border-[#44484f]/60 text-[#00eefc] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#f1f3fc]">Grant Temporary Contractor Access</span>
              </label>

              {isTemporaryAccess && (
                <div className="mt-3 pl-6 space-y-1.5">
                  <label className="block text-xs font-semibold text-[#a8abb3]">Access Expiration Date & Time</label>
                  <input
                    type="datetime-local"
                    min={localDateTimeMin()}
                    value={accessExpiresAt}
                    onChange={(e) => setAccessExpiresAt(e.target.value)}
                    required={isTemporaryAccess}
                    className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#8ff5ff] text-sm rounded-lg p-2.5 outline-none focus:border-[#8ff5ff]"
                  />
                  <p className="text-[11px] text-[#7f8594]">
                    Once this time passes, access is automatically locked and the user will see an expired access banner.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#44484f]/20">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!inviteEmail.trim() || inviting || (isTemporaryAccess && !accessExpiresAt) || isAccessExpired}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-[#0a0e14] bg-[#00eefc] hover:bg-[#8ff5ff] rounded-lg shadow-[0_0_15px_rgba(0,238,252,0.3)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {inviting && <LuLoader className="w-4 h-4 animate-spin text-[#0a0e14]" />}
                {inviting ? 'Sending Invite...' : 'Generate Invite Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-4 rounded-lg flex items-start gap-3">
              <LuCircleCheck className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#22c55e] leading-relaxed">
                An invitation has been generated and emailed to <strong>{inviteEmail}</strong>. You can also copy the link manually below:
              </p>
            </div>

            <div className="bg-[#0a0e14] border border-[#44484f]/40 p-3 rounded-lg flex items-center justify-between gap-4">
              <code className="text-[#8ff5ff] font-mono text-xs break-all select-all">{generatedInviteLink}</code>
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2027] hover:bg-[#252d3a] border border-[#44484f]/50 rounded-md text-[#f1f3fc] text-xs font-medium transition-colors flex-shrink-0 cursor-pointer"
              >
                {inviteLinkCopied ? <><LuCircleCheck className="text-[#22c55e]" /> Copied</> : <><LuCopy /> Copy</>}
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setInviteModalOpen(false); setGeneratedInviteLink(null); setInviteEmail(''); }}
                className="px-5 py-2 text-sm font-bold text-[#0a0e14] bg-[#f1f3fc] hover:bg-white rounded-lg transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const EditMemberModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/80 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md p-6 relative">
        <div className="flex items-center justify-between mb-4 border-b border-[#44484f]/30 pb-3">
          <h3 className="text-base font-bold text-[#f1f3fc] flex items-center gap-2">
            <LuPencil className="text-[#8ff5ff]" /> Edit Member Permissions
          </h3>
          <button
            onClick={() => setEditMemberModalOpen(false)}
            className="text-[#7f8594] hover:text-[#f1f3fc] transition-colors cursor-pointer"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveMember} className="space-y-4">
          {editMemberError && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded">
              {editMemberError}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase text-[#7f8594] font-semibold mb-1">User</label>
            <div className="p-2.5 bg-[#0a0e14] border border-[#44484f]/30 rounded-lg text-sm text-[#f1f3fc]">
              <div className="font-semibold">{memberToEdit?.fullName}</div>
              <div className="text-xs text-[#7f8594]">{memberToEdit?.email}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-[#7f8594] font-semibold mb-1.5">Workspace Role</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 outline-none focus:border-[#8ff5ff]"
            >
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>

          <div className="pt-2 border-t border-[#44484f]/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editHasExpiry}
                onChange={(e) => setEditHasExpiry(e.target.checked)}
                className="rounded bg-[#0a0e14] border-[#44484f]/60 text-[#00eefc]"
              />
              <span className="text-xs font-semibold text-[#f1f3fc]">Enforce Temporary Access Expiration</span>
            </label>

            {editHasExpiry && (
              <div className="mt-2.5">
                <input
                  type="datetime-local"
                  min={localDateTimeMin()}
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  required={editHasExpiry}
                  className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#8ff5ff] text-sm rounded-lg p-2.5 outline-none focus:border-[#8ff5ff]"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#44484f]/20">
            <button
              type="button"
              onClick={() => setEditMemberModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#a8abb3] hover:text-[#f1f3fc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingMember}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0a0e14] bg-[#00eefc] hover:bg-[#8ff5ff] rounded-lg shadow-[0_0_15px_rgba(0,238,252,0.3)] cursor-pointer disabled:opacity-50"
            >
              {savingMember && <LuLoader className="w-3.5 h-3.5 animate-spin" />}
              {savingMember ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ApproveRequestModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/85 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.6)] w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 border-b border-[#44484f]/30 pb-3">
          <h3 className="text-base font-bold text-[#f1f3fc] flex items-center gap-2">
            <LuCircleCheck className="text-[#22c55e]" /> Approve Access Request
          </h3>
          <button onClick={() => setApproveModalOpen(false)} className="text-[#7f8594] hover:text-[#f1f3fc]">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmApprove} className="space-y-4">
          {approveError && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded">
              {approveError}
            </div>
          )}

          <div className="p-3 bg-[#0a0e14] border border-[#44484f]/30 rounded-lg text-xs space-y-1">
            <div className="text-[#a8abb3]">Requester: <strong className="text-[#f1f3fc]">{requestToApprove?.user?.fullName || requestToApprove?.user?.email}</strong></div>
            <div className="text-[#7f8594]">Email: {requestToApprove?.user?.email}</div>
            {requestToApprove?.message && (
              <div className="mt-1 text-[#8ff5ff] italic">"{requestToApprove.message}"</div>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase text-[#7f8594] font-semibold mb-1.5">Grant Role</label>
            <select
              value={approveRole}
              onChange={(e) => setApproveRole(e.target.value)}
              className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 outline-none focus:border-[#8ff5ff]"
            >
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>

          <div className="pt-2 border-t border-[#44484f]/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={approveIsTemporary}
                onChange={(e) => setApproveIsTemporary(e.target.checked)}
                className="rounded bg-[#0a0e14] border-[#44484f]/60 text-[#00eefc]"
              />
              <span className="text-xs font-semibold text-[#f1f3fc]">Set Temporary Expiration Date</span>
            </label>

            {approveIsTemporary && (
              <div className="mt-2.5">
                <input
                  type="datetime-local"
                  min={localDateTimeMin()}
                  value={approveExpiresAt}
                  onChange={(e) => setApproveExpiresAt(e.target.value)}
                  required={approveIsTemporary}
                  className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#8ff5ff] text-sm rounded-lg p-2.5 outline-none focus:border-[#8ff5ff]"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#44484f]/20">
            <button
              type="button"
              onClick={() => setApproveModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#a8abb3] hover:text-[#f1f3fc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={approving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#0a0e14] bg-[#22c55e] hover:bg-emerald-400 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer disabled:opacity-50"
            >
              {approving && <LuLoader className="w-3.5 h-3.5 animate-spin text-[#0a0e14]" />}
              {approving ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const RejectRequestModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/85 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.6)] w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 border-b border-[#44484f]/30 pb-3">
          <h3 className="text-base font-bold text-[#f1f3fc] flex items-center gap-2">
            <LuCircleX className="text-[#f87171]" /> Decline Access Request
          </h3>
          <button onClick={() => setRejectModalOpen(false)} className="text-[#7f8594] hover:text-[#f1f3fc]">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmReject} className="space-y-4">
          {rejectError && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded">
              {rejectError}
            </div>
          )}

          <p className="text-xs text-[#a8abb3] leading-relaxed">
            Decline access for <strong className="text-[#f1f3fc]">{requestToReject?.user?.fullName || requestToReject?.user?.email}</strong>.
            A rejection reason is mandatory and will be emailed directly to the user.
          </p>

          <div>
            <label className="block text-xs uppercase text-[#7f8594] font-semibold mb-1.5">
              Reason for Rejection <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Project sprint completed, please check with team lead..."
              className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-3 outline-none focus:border-red-400 transition-colors placeholder:text-[#7f8594]"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#44484f]/20">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#a8abb3] hover:text-[#f1f3fc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!rejectionReason.trim() || rejecting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#f87171] hover:bg-red-500 rounded-lg shadow-[0_0_15px_rgba(248,113,113,0.3)] cursor-pointer disabled:opacity-50"
            >
              {rejecting && <LuLoader className="w-3.5 h-3.5 animate-spin" />}
              {rejecting ? 'Declining...' : 'Decline Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const TransferOwnershipModal = () => {
    const eligibleMembers = members.filter(m => m.userId !== user?.id);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/90 backdrop-blur-md px-4">
        <div className="bg-[#11161d] border border-amber-500/40 rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.2)] w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-4 border-b border-[#44484f]/30 pb-3">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <LuCrown className="w-5 h-5 text-amber-400" /> Transfer Workspace Ownership
            </h3>
            <button
              onClick={() => { if (!transferring) setTransferModalOpen(false); }}
              className="text-[#7f8594] hover:text-[#f1f3fc]"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>

          {transferSuccess ? (
            <div className="py-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <LuCircleCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Ownership Successfully Transferred</h4>
              <p className="text-xs text-[#a8abb3]">
                Both parties have been notified via confirmation email. Your new role is {demoteToRole.toUpperCase()}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              {transferError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded">
                  {transferError}
                </div>
              )}

              <div className="p-3.5 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-start gap-3">
                <LuTriangleAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong>Warning:</strong> You will surrender primary ownership of <strong className="text-white">{activeOrgName}</strong>. The selected user will gain complete control over billing, members, and deletion.
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#a8abb3] mb-1.5">
                  Select New Owner
                </label>
                {eligibleMembers.length === 0 ? (
                  <p className="p-3 bg-[#0a0e14] border border-[#44484f]/40 text-xs text-[#7f8594] rounded-lg">
                    No eligible members available. Please invite a team member to this workspace first.
                  </p>
                ) : (
                  <select
                    value={newOwnerUserId}
                    onChange={(e) => setNewOwnerUserId(e.target.value)}
                    required
                    className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 outline-none focus:border-amber-400"
                  >
                    <option value="">-- Choose an active member --</option>
                    {eligibleMembers.map(m => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName} ({m.email}) &mdash; {m.role}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#a8abb3] mb-1.5">
                  Your New Role after Transfer
                </label>
                <select
                  value={demoteToRole}
                  onChange={(e) => setDemoteToRole(e.target.value)}
                  className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 outline-none focus:border-amber-400"
                >
                  <option value="admin">Admin (Recommended — full operational access)</option>
                  <option value="developer">Developer</option>
                  <option value="viewer">Viewer</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#a8abb3] mb-1.5">
                  Type <span className="text-[#8ff5ff] font-bold">"{activeOrgName}"</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmWorkspaceName}
                  onChange={(e) => setConfirmWorkspaceName(e.target.value)}
                  placeholder={activeOrgName}
                  required
                  className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-white text-sm rounded-lg p-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#44484f]/20">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  disabled={transferring}
                  className="px-4 py-2 text-xs font-medium text-[#a8abb3] hover:text-[#f1f3fc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newOwnerUserId || confirmWorkspaceName.trim() !== activeOrgName.trim() || transferring}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#0a0e14] bg-amber-400 hover:bg-amber-300 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-40"
                >
                  {transferring && <LuLoader className="w-3.5 h-3.5 animate-spin text-[#0a0e14]" />}
                  {transferring ? 'Transferring...' : 'Transfer Ownership'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const filteredRequests = requests.filter(r => {
    if (requestsFilter === 'all') return true;
    return r.status === requestsFilter;
  });

  const filteredActivity = activity.filter(item => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'requests') return item.eventType.startsWith('access_');
    if (activityFilter === 'members') return item.eventType.startsWith('member_') || item.eventType.startsWith('invite_') || item.eventType === 'role_changed';
    if (activityFilter === 'ownership') return item.eventType === 'ownership_transferred';
    return true;
  });

  const getActivityIcon = (eventType) => {
    switch (eventType) {
      case 'member_invited':
        return <LuMail className="w-4 h-4 text-[#8ff5ff]" />;
      case 'invite_accepted':
        return <LuUserCheck className="w-4 h-4 text-emerald-400" />;
      case 'temp_access_granted':
        return <LuClock className="w-4 h-4 text-amber-400" />;
      case 'temp_access_expired':
        return <LuClock className="w-4 h-4 text-red-400" />;
      case 'access_requested':
        return <LuKey className="w-4 h-4 text-[#00eefc]" />;
      case 'access_approved':
      case 'access_restored':
        return <LuShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'access_rejected':
        return <LuShieldAlert className="w-4 h-4 text-red-400" />;
      case 'ownership_transferred':
        return <LuCrown className="w-4 h-4 text-amber-400" />;
      case 'member_removed':
        return <LuTrash2 className="w-4 h-4 text-red-400" />;
      case 'role_changed':
        return <LuSettings className="w-4 h-4 text-purple-400" />;
      default:
        return <LuHistory className="w-4 h-4 text-[#7f8594]" />;
    }
  };

  const formatActivityText = (item) => {
    const actorName = item.actor?.name || 'A user';
    const targetName = item.target?.name || item.metadata?.targetName || 'A member';
    const role = item.metadata?.role || item.metadata?.newRole || '';

    switch (item.eventType) {
      case 'member_invited':
        return `${actorName} invited ${item.metadata?.email || 'a user'} as ${item.metadata?.role || 'member'}`;
      case 'invite_accepted':
        return `${targetName} accepted the invitation to join ${activeOrgName}`;
      case 'temp_access_granted':
        return `Temporary access granted to ${targetName} as ${role}`;
      case 'access_requested':
        return `${actorName} requested workspace access (${item.metadata?.requestedRole || 'Editor'})`;
      case 'access_approved':
        return `${actorName} approved access for ${targetName} (${role})`;
      case 'access_rejected':
        return `${actorName} declined access request for ${targetName}`;
      case 'access_restored':
        return `Permanent access restored for ${targetName}`;
      case 'ownership_transferred':
        return `Ownership transferred from ${item.metadata?.fromName || actorName} to ${item.metadata?.toName || targetName}`;
      case 'member_removed':
        return `${actorName} removed ${targetName} from the workspace`;
      case 'role_changed':
        return `Role changed for ${targetName} to ${role}`;
      case 'invite_cancelled':
        return `${actorName} cancelled a pending invitation`;
      default:
        return `${actorName} performed workspace update (${item.eventType})`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] text-[#f1f3fc] font-sans pb-16">
      {/* Top Header */}
      <div className="border-b border-[#44484f]/20 bg-[#11161d]/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="flex items-center gap-1.5 text-xs text-[#a8abb3] hover:text-[#8ff5ff] transition-colors p-1.5 rounded-lg hover:bg-[#1a2027] cursor-pointer"
            >
              <LuArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <span className="text-[#44484f]">/</span>
            <div className="flex items-center gap-2">
              <LuSettings className="text-[#8ff5ff] w-4 h-4" />
              <h1 className="text-sm font-bold text-white tracking-wide">Workspace Settings</h1>
            </div>
          </div>
          <div className="text-xs font-mono text-[#7f8594]">
            Role: <span className="text-[#8ff5ff] uppercase font-semibold">{userRole}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-1">
            {isAdmin && canManageKeys && !isAccessExpired && <button onClick={() => setActiveTab('sso')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl cursor-pointer ${activeTab === 'sso' ? 'bg-[#00eefc]/10 text-[#8ff5ff]' : 'text-[#a8abb3]'}`}><LuShieldCheck className="w-4 h-4" />Single sign-on</button>}
            {canManagePrivacy && !isAccessExpired && <button onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl cursor-pointer ${activeTab === 'privacy' ? 'bg-[#00eefc]/10 text-[#8ff5ff]' : 'text-[#a8abb3]'}`}><LuShieldCheck className="w-4 h-4" />Privacy requests</button>}
            {canManageKeys && !isAccessExpired && (
              <button onClick={() => setActiveTab('redaction')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl cursor-pointer ${activeTab === 'redaction' ? 'bg-[#00eefc]/10 text-[#8ff5ff]' : 'text-[#a8abb3] hover:text-white'}`}>
                <LuShieldCheck className="w-4 h-4" /> PII Redaction
              </button>
            )}
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'api-keys'
                  ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/30 shadow-[0_0_15px_rgba(0,238,252,0.15)]'
                  : 'text-[#a8abb3] hover:text-[#f1f3fc] hover:bg-[#11161d]'
              }`}
            >
              <LuKey className="w-4 h-4" /> API Keys
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/30 shadow-[0_0_15px_rgba(0,238,252,0.15)]'
                  : 'text-[#a8abb3] hover:text-[#f1f3fc] hover:bg-[#11161d]'
              }`}
            >
              <LuUsers className="w-4 h-4" /> Team Members
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'requests'
                    ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/30 shadow-[0_0_15px_rgba(0,238,252,0.15)]'
                    : 'text-[#a8abb3] hover:text-[#f1f3fc] hover:bg-[#11161d]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LuShieldAlert className="w-4 h-4" /> Access Requests
                </div>
                {pendingRequestsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-[#0a0e14]">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/30 shadow-[0_0_15px_rgba(0,238,252,0.15)]'
                  : 'text-[#a8abb3] hover:text-[#f1f3fc] hover:bg-[#11161d]'
              }`}
            >
              <LuHistory className="w-4 h-4" /> Workspace Activity
            </button>

            {canViewAudit && (
              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/30 shadow-[0_0_15px_rgba(0,238,252,0.15)]'
                    : 'text-[#a8abb3] hover:text-[#f1f3fc] hover:bg-[#11161d]'
                }`}
              >
                <LuShieldCheck className="w-4 h-4" /> Audit Log
              </button>
            )}

            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/30 shadow-[0_0_15px_rgba(0,238,252,0.15)]'
                  : 'text-[#a8abb3] hover:text-[#f1f3fc] hover:bg-[#11161d]'
              }`}
            >
              <LuCreditCard className="w-4 h-4" /> Billing
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/30 shadow-[0_0_15px_rgba(0,238,252,0.15)]'
                  : 'text-[#a8abb3] hover:text-[#f1f3fc] hover:bg-[#11161d]'
              }`}
            >
              <LuBuilding2 className="w-4 h-4" /> Workspace & Ownership
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'sso' && isAdmin && canManageKeys && !isAccessExpired && activeOrgId && <SsoSettings key={activeOrgId} orgId={activeOrgId} />}
            {activeTab === 'privacy' && canManagePrivacy && !isAccessExpired && activeOrgId && <PrivacyRequests key={activeOrgId} orgId={activeOrgId} />}
            {activeTab === 'redaction' && canManageKeys && !isAccessExpired && activeOrgId && (
              <RedactionSettings key={activeOrgId} orgId={activeOrgId} />
            )}
            {/* TAB 1: API KEYS */}
            {activeTab === 'api-keys' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#f1f3fc]">API Keys</h2>
                    <p className="text-sm text-[#a8abb3] mt-1">Manage scoped API keys and source IP restrictions.</p>
                  </div>
                  {canManageKeys && (
                    <button
                      onClick={() => { setGenerateModalOpen(true); setGenerateError(null); setGeneratedKey(null); setNewKeyScopes(['logs:ingest']); setNewKeyCidrs(''); }}
                      disabled={isAccessExpired}
                      title={isAccessExpired ? 'Access expired' : 'Generate Key'}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#00eefc] hover:bg-[#8ff5ff] px-4 py-2.5 text-sm font-bold text-[#0a0e14] shadow-[0_0_15px_rgba(0,238,252,0.3)] transition-all cursor-pointer disabled:opacity-40"
                    >
                      <LuPlus className="w-4 h-4" /> Generate New Key
                    </button>
                  )}
                </div>

                {keysError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono rounded-lg">
                    {keysError}
                  </div>
                )}

                <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
                  {keysLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-[#7f8594] gap-3">
                      <LuLoader className="w-8 h-8 animate-spin text-[#8ff5ff]" />
                      <span className="text-xs font-mono">Loading API keys...</span>
                    </div>
                  ) : keys.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#1a2027] border border-[#44484f]/40 flex items-center justify-center mb-3">
                        <LuKey className="w-6 h-6 text-[#7f8594]" />
                      </div>
                      <h3 className="text-sm font-bold text-[#f1f3fc]">No API keys found</h3>
                      <p className="text-xs text-[#a8abb3] mt-1 max-w-sm">
                        Generate your first API key to start streaming and ingesting logs from your applications.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#0a0e14]/50 border-b border-[#44484f]/30 text-[#a8abb3]">
                          <tr>
                            <th scope="col" className="px-6 py-4 font-medium">Name</th>
                            <th scope="col" className="px-6 py-4 font-medium">Key Hint</th>
                            <th scope="col" className="px-6 py-4 font-medium">Scopes / Allowed IPs</th>
                            <th scope="col" className="px-6 py-4 font-medium">Created Date</th>
                            <th scope="col" className="px-6 py-4 font-medium">Status</th>
                            <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#44484f]/20">
                          {keys.map(keyObj => {
                            const isActive = keyObj.is_active !== false;
                            const formattedDate = keyObj.created_at
                              ? new Date(keyObj.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                              : 'Recent';
                            const displayKey = keyObj.key_hint ? `ll_prod_••••••••${keyObj.key_hint.replace(/^\.\.\./, '')}` : 'll_prod_••••••••••••';

                            return (
                              <tr key={keyObj.id} className="hover:bg-[#1a2027]/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-[#f1f3fc]">{keyObj.name}</td>
                                <td className="px-6 py-4 font-mono text-[#7f8594] text-xs">{displayKey}</td>
                                <td className="px-6 py-4 text-xs text-[#a8abb3] whitespace-normal max-w-xs">
                                  <div className="text-[#8ff5ff]">{(keyObj.scopes || ['logs:ingest']).join(', ')}</div>
                                  <div className="break-all mt-1">{keyObj.allowed_cidrs?.length ? keyObj.allowed_cidrs.join(', ') : 'Any source IP'}</div>
                                </td>
                                <td className="px-6 py-4 text-[#a8abb3]">{formattedDate}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    isActive ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20' : 'bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20'
                                  }`}>
                                    {isActive ? 'Active' : 'Revoked'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {isActive && !isAccessExpired && canManageKeys && (
                                    <button onClick={() => setPolicyKey(keyObj)} title="Edit key restrictions" className="text-[#7f8594] hover:text-[#8ff5ff] p-2 cursor-pointer"><LuPencil className="w-4 h-4" /></button>
                                  )}
                                  {isActive && !isAccessExpired && canManageKeys && (
                                    <button
                                      onClick={() => { setKeyToDelete(keyObj); setDeleteKeyModalOpen(true); }}
                                      className="text-[#7f8594] hover:text-[#f87171] p-2 hover:bg-[#f87171]/10 rounded transition-colors cursor-pointer"
                                      title="Revoke Key"
                                    >
                                      <LuTrash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TEAM MEMBERS */}
            {activeTab === 'team' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#f1f3fc]">Team Members & Access</h2>
                    <p className="text-sm text-[#a8abb3] mt-1">Manage RBAC roles and contractor access for <span className="text-white font-medium">{activeOrgName}</span>.</p>
                  </div>
                  <button
                    onClick={() => { setInviteModalOpen(true); setInviteError(null); setGeneratedInviteLink(null); }}
                    disabled={!isOwner || isAccessExpired}
                    title={isOwner ? 'Invite a new member' : 'Only the workspace owner can invite members'}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00eefc] hover:bg-[#8ff5ff] px-4 py-2.5 text-sm font-bold text-[#0a0e14] shadow-[0_0_15px_rgba(0,238,252,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <LuPlus className="w-4 h-4" /> Invite Member
                  </button>
                </div>

                {teamError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono rounded-lg">
                    {teamError}
                  </div>
                )}

                {/* Active Members Table */}
                <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
                  <div className="p-4 border-b border-[#44484f]/30 bg-[#0a0e14]/50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#f1f3fc] flex items-center gap-2">
                      <LuUsers className="text-[#8ff5ff]" /> Active Members ({members.length})
                    </h3>
                  </div>

                  {teamLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-[#7f8594] gap-3">
                      <LuLoader className="w-8 h-8 animate-spin text-[#8ff5ff]" />
                      <span className="text-xs font-mono">Loading team members...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#0a0e14]/30 border-b border-[#44484f]/30 text-[#a8abb3]">
                          <tr>
                            <th scope="col" className="px-6 py-3 font-medium">User</th>
                            <th scope="col" className="px-6 py-3 font-medium">Role</th>
                            <th scope="col" className="px-6 py-3 font-medium">Access Duration</th>
                            <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#44484f]/20">
                          {members.map(member => {
                            const isMemberOwner = member.role === 'owner';
                            const isCurrentUser = member.userId === user?.id;
                            const hasExpiry = Boolean(member.accessExpiresAt);
                            const memberExpired = hasExpiry && new Date(member.accessExpiresAt) < new Date();

                            return (
                              <tr key={member.userId} className="hover:bg-[#1a2027]/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {member.avatarUrl ? (
                                      <img src={member.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#44484f]/40" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-[#1a2027] border border-[#44484f]/50 flex items-center justify-center text-xs font-bold text-[#8ff5ff]">
                                        {member.fullName ? member.fullName.substring(0, 2).toUpperCase() : 'U'}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium text-[#f1f3fc] flex items-center gap-2">
                                        {member.fullName}
                                        {isCurrentUser && (
                                          <span className="text-[10px] bg-[#8ff5ff]/10 text-[#8ff5ff] px-1.5 py-0.2 rounded font-mono">You</span>
                                        )}
                                        {isMemberOwner && (
                                          <span className="text-[10px] bg-amber-400/15 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                                            <LuCrown className="w-3 h-3" /> Owner
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-[#7f8594]">{member.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium uppercase border ${
                                    member.role === 'owner' ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' :
                                    member.role === 'admin' ? 'bg-[#8ff5ff]/10 text-[#8ff5ff] border-[#8ff5ff]/30' :
                                    member.role === 'editor' ? 'bg-[#f1f3fc]/5 text-[#f1f3fc] border-[#44484f]/40' :
                                    'bg-transparent text-[#a8abb3] border-[#44484f]/30'
                                  }`}>
                                    {member.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  {hasExpiry ? (
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
                                      memberExpired ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                                    }`}>
                                      <LuClock className="w-3.5 h-3.5" />
                                      {memberExpired ? 'Access Expired' : `Expires ${new Date(member.accessExpiresAt).toLocaleDateString()}`}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-[#7f8594]">Permanent</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {isOwner && !isMemberOwner && !isAccessExpired && (
                                      <button
                                        onClick={() => openEditMember(member)}
                                        className="text-[#7f8594] hover:text-[#8ff5ff] p-2 hover:bg-[#8ff5ff]/10 rounded transition-colors cursor-pointer"
                                        title="Edit Role / Expiry"
                                      >
                                        <LuPencil className="w-4 h-4" />
                                      </button>
                                    )}
                                    {isAdmin && !isMemberOwner && !isCurrentUser && !isAccessExpired && (
                                      <button
                                        onClick={() => { setUserToRemove(member); setRemoveUserModalOpen(true); }}
                                        className="text-[#7f8594] hover:text-[#f87171] p-2 hover:bg-[#f87171]/10 rounded transition-colors cursor-pointer"
                                        title="Remove from Workspace"
                                      >
                                        <LuTrash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pending Invitations Section */}
                {pendingInvites.length > 0 && (
                  <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
                    <div className="p-4 border-b border-[#44484f]/30 bg-[#0a0e14]/50 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#f1f3fc] flex items-center gap-2">
                        <LuMail className="text-[#8ff5ff]" /> Pending Invitations ({pendingInvites.length})
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#0a0e14]/30 border-b border-[#44484f]/30 text-[#a8abb3]">
                          <tr>
                            <th scope="col" className="px-6 py-3 font-medium">Invitee Email</th>
                            <th scope="col" className="px-6 py-3 font-medium">Role</th>
                            <th scope="col" className="px-6 py-3 font-medium">Expires At</th>
                            <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#44484f]/20">
                          {pendingInvites.map(invite => (
                            <tr key={invite.id} className="hover:bg-[#1a2027]/50 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs text-[#f1f3fc]">{invite.email}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono uppercase bg-[#1a2027] border border-[#44484f]/40 text-[#a8abb3]">
                                  {invite.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-[#7f8594]">
                                {new Date(invite.expires_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isOwner && !isAccessExpired && (
                                  <button
                                    onClick={() => handleCancelInvite(invite.id)}
                                    className="text-[#7f8594] hover:text-[#f87171] p-1.5 hover:bg-[#f87171]/10 rounded transition-colors text-xs font-medium cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ACCESS REQUESTS (Owner / Admin) */}
            {activeTab === 'requests' && isAdmin && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#f1f3fc] flex items-center gap-2">
                      Access Requests
                      {pendingRequestsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-[#0a0e14]">
                          {pendingRequestsCount} pending
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-[#a8abb3] mt-1">Review requests from users seeking access restoration to <span className="text-white font-medium">{activeOrgName}</span>.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                      <button
                        key={f}
                        onClick={() => setRequestsFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                          requestsFilter === f
                            ? 'bg-[#00eefc] text-[#0a0e14] shadow-[0_0_12px_rgba(0,238,252,0.3)]'
                            : 'bg-[#11161d] border border-[#44484f]/40 text-[#a8abb3] hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                    <button
                      onClick={fetchRequests}
                      className="p-2 bg-[#11161d] border border-[#44484f]/40 rounded-lg text-[#a8abb3] hover:text-[#8ff5ff] transition-colors cursor-pointer"
                      title="Refresh requests"
                    >
                      <LuRefreshCw className={`w-3.5 h-3.5 ${requestsLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {requestsError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg">
                    {requestsError}
                  </div>
                )}

                <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
                  {requestsLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-[#7f8594] gap-3">
                      <LuLoader className="w-8 h-8 animate-spin text-[#8ff5ff]" />
                      <span className="text-xs font-mono">Loading access requests...</span>
                    </div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#1a2027] border border-[#44484f]/40 flex items-center justify-center mb-3">
                        <LuKey className="w-6 h-6 text-[#7f8594]" />
                      </div>
                      <h3 className="text-sm font-bold text-[#f1f3fc]">No {requestsFilter !== 'all' ? requestsFilter : ''} requests</h3>
                      <p className="text-xs text-[#a8abb3] mt-1 max-w-sm">
                        When users with expired access submit a request, they will appear here for review.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#44484f]/20">
                      {filteredRequests.map(req => {
                        const isPending = req.status === 'pending';
                        const isApproved = req.status === 'approved';
                        const isRejected = req.status === 'rejected';

                        return (
                          <div key={req.id} className="p-5 hover:bg-[#1a2027]/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-bold text-[#f1f3fc] text-sm">
                                  {req.user?.fullName || req.user?.email || 'User'}
                                </span>
                                <span className="text-xs text-[#7f8594]">({req.user?.email})</span>

                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                  isPending ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30' :
                                  isApproved ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                                  'bg-red-500/15 text-red-300 border border-red-500/30'
                                }`}>
                                  {req.status}
                                </span>

                                <span className="text-xs text-[#a8abb3]">
                                  Requested Role: <strong className="text-[#8ff5ff] uppercase">{req.requestedRole || 'Editor'}</strong>
                                </span>
                              </div>

                              {req.message && (
                                <p className="text-xs text-[#d1d5db] bg-[#0a0e14] border border-[#44484f]/30 p-2.5 rounded-lg italic">
                                  "{req.message}"
                                </p>
                              )}

                              {isRejected && req.rejectionReason && (
                                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-200">
                                  <span className="font-bold text-red-400">Rejection Reason:</span> "{req.rejectionReason}"
                                </div>
                              )}

                              <div className="text-[11px] text-[#7f8594]">
                                Submitted {new Date(req.createdAt).toLocaleString()}
                                {req.reviewedAt && ` &middot; Reviewed ${new Date(req.reviewedAt).toLocaleString()}`}
                              </div>
                            </div>

                            {/* Actions for Pending */}
                            {isPending && (
                              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
                                <button
                                  onClick={() => openRejectModal(req)}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-500/30 transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => openApproveModal(req)}
                                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#0a0e14] bg-[#22c55e] hover:bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all cursor-pointer"
                                >
                                  Grant Access
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: WORKSPACE ACTIVITY FEED */}
            {activeTab === 'activity' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#f1f3fc] flex items-center gap-2">
                      <LuHistory className="text-[#8ff5ff]" /> Workspace Activity
                    </h2>
                    <p className="text-sm text-[#a8abb3] mt-1">Audit trail and chronological event feed for <span className="text-white font-medium">{activeOrgName}</span>.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="bg-[#11161d] border border-[#44484f]/40 text-[#f1f3fc] text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                    >
                      <option value="all">All Events</option>
                      <option value="requests">Access Requests</option>
                      <option value="members">Team & Invitations</option>
                      <option value="ownership">Ownership Transfers</option>
                    </select>
                    <button
                      onClick={fetchActivity}
                      className="p-2 bg-[#11161d] border border-[#44484f]/40 rounded-lg text-[#a8abb3] hover:text-[#8ff5ff] transition-colors cursor-pointer"
                      title="Refresh Activity"
                    >
                      <LuRefreshCw className={`w-3.5 h-3.5 ${activityLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {activityError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg">
                    {activityError}
                  </div>
                )}

                <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
                  {activityLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-[#7f8594] gap-3">
                      <LuLoader className="w-8 h-8 animate-spin text-[#8ff5ff]" />
                      <span className="text-xs font-mono">Loading activity stream...</span>
                    </div>
                  ) : filteredActivity.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#1a2027] border border-[#44484f]/40 flex items-center justify-center mb-3">
                        <LuHistory className="w-6 h-6 text-[#7f8594]" />
                      </div>
                      <h3 className="text-sm font-bold text-[#f1f3fc]">No activity records</h3>
                      <p className="text-xs text-[#a8abb3] mt-1 max-w-sm">
                        As team events, invites, access approvals, and role updates occur, they are recorded here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#44484f]/20">
                      {filteredActivity.map(item => (
                        <div key={item.id} className="p-4 hover:bg-[#1a2027]/40 transition-colors flex items-start gap-3.5">
                          <div className="p-2 rounded-lg bg-[#0a0e14] border border-[#44484f]/30 flex-shrink-0 mt-0.5">
                            {getActivityIcon(item.eventType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-xs font-medium text-[#f1f3fc] leading-relaxed">
                                {formatActivityText(item)}
                              </p>
                              <span className="text-[11px] text-[#7f8594] font-mono flex-shrink-0">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {item.metadata?.reason && (
                              <div className="mt-1.5 p-2 rounded bg-red-950/40 border border-red-500/30 text-[11px] text-red-200">
                                <span className="font-semibold text-red-300">Reason:</span> "{item.metadata.reason}"
                              </div>
                            )}

                            {item.metadata?.message && (
                              <div className="mt-1.5 p-2 rounded bg-[#0a0e14] border border-[#44484f]/30 text-[11px] text-[#8ff5ff] italic">
                                Note: "{item.metadata.message}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <BillingSettings orgId={activeOrgId} isOwner={isOwner} notice={billingNotice} />
            )}

            {/* AUDIT LOG (Phase 15) */}
            {activeTab === 'audit' && canViewAudit && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-headline font-bold text-[#f1f3fc] flex items-center gap-2">
                      <LuShieldCheck className="w-5 h-5 text-[#8ff5ff]" /> Audit Log
                    </h2>
                    <p className="text-sm text-[#a8abb3] mt-1">Security events protected from updates, deletion and truncation by application credentials.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={auditAction}
                      onChange={(e) => { setAuditPage(1); setAuditAction(e.target.value); }}
                      className="bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#8ff5ff] cursor-pointer"
                    >
                      <option value="">All actions</option>
                      <option value="api_key.created">API key created</option>
                      <option value="api_key.revoked">API key revoked</option>
                      <option value="api_key.policy_updated">API key restrictions changed</option>
                      <option value="security.redaction_updated">Redaction settings changed</option>
                      <option value="privacy_request.requested">Privacy request opened</option>
                      <option value="privacy_request.confirmed">Privacy request confirmed</option>
                      <option value="privacy_request.completed">Privacy request completed</option>
                      <option value="privacy_request.failed">Privacy request failed</option>
                      <option value="member.invited">Member invited</option>
                      <option value="member.role_changed">Role changed</option>
                      <option value="member.removed">Member removed</option>
                      <option value="access.approved">Access approved</option>
                      <option value="access.rejected">Access rejected</option>
                      <option value="ownership.transferred">Ownership transferred</option>
                      <option value="integration.connected">Integration connected</option>
                      <option value="integration.removed">Integration removed</option>
                      <option value="logs.exported">Logs exported</option>
                      <option value="auth.login">Login</option>
                    </select>
                    <button onClick={fetchAudit} title="Refresh" className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors cursor-pointer">
                      <LuRefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin text-[#8ff5ff]' : ''}`} />
                    </button>
                    <button onClick={handleAuditExport} disabled={auditExporting} className="inline-flex items-center gap-2 rounded-lg border border-[#44484f]/40 px-3 py-2 text-sm text-[#a8abb3] hover:text-[#f1f3fc] hover:border-[#8ff5ff]/40 transition-colors cursor-pointer disabled:opacity-50">
                      <LuFileText className="w-4 h-4" /> {auditExporting ? 'Exporting…' : 'Export CSV'}
                    </button>
                  </div>
                </div>

                {auditError && (
                  <div className="rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{auditError}</div>
                )}

                <div className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
                  <div className="overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#0a0e14]/50 border-b border-[#44484f]/30 text-[#a8abb3]">
                        <tr>
                          <th className="px-4 py-3 font-medium">Time</th>
                          <th className="px-4 py-3 font-medium">Actor</th>
                          <th className="px-4 py-3 font-medium">Action</th>
                          <th className="px-4 py-3 font-medium">Target</th>
                          <th className="px-4 py-3 font-medium">IP</th>
                          <th className="px-4 py-3 font-medium">Request</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#44484f]/20">
                        {auditLoading ? (
                          <tr><td colSpan="6" className="px-4 py-12 text-center text-[#7f8594]">Loading audit log…</td></tr>
                        ) : auditLogs.length === 0 ? (
                          <tr><td colSpan="6" className="px-4 py-12 text-center text-[#7f8594]">No audit events recorded yet.</td></tr>
                        ) : (
                          auditLogs.map((row) => (
                            <tr key={row.id} className="hover:bg-[#1a2027]/50">
                              <td className="px-4 py-2.5 text-[#7f8594] font-mono text-xs">{new Date(row.created_at).toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-[#a8abb3]">{row.actor_email || <span className="text-[#586173]">system</span>}</td>
                              <td className="px-4 py-2.5">
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/20">{row.action}</span>
                              </td>
                              <td className="px-4 py-2.5 text-[#7f8594] font-mono text-xs">{row.target_type ? `${row.target_type}${row.target_id ? `:${String(row.target_id).slice(0, 8)}` : ''}` : '—'}</td>
                              <td className="px-4 py-2.5 text-[#7f8594] font-mono text-xs">{row.ip_address || '—'}</td>
                              <td className="px-4 py-2.5 text-[#586173] font-mono text-xs">{row.request_id ? String(row.request_id).slice(0, 8) : '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {auditPagination.total > 0 && (
                  <div className="flex items-center justify-between text-sm text-[#7f8594]">
                    <span>Page {auditPagination.page} of {auditPagination.totalPages} ({auditPagination.total.toLocaleString()} events)</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAuditPage((p) => Math.max(1, p - 1))} disabled={auditPage <= 1} className="px-3 py-1.5 rounded-md border border-[#44484f]/40 hover:text-[#f1f3fc] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Prev</button>
                      <button onClick={() => setAuditPage((p) => Math.min(auditPagination.totalPages, p + 1))} disabled={auditPage >= auditPagination.totalPages} className="px-3 py-1.5 rounded-md border border-[#44484f]/40 hover:text-[#f1f3fc] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Next</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: WORKSPACE DETAILS & OWNERSHIP */}
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-bold text-[#f1f3fc]">Workspace Details</h2>
                  <p className="text-sm text-[#a8abb3] mt-1">Tenant metadata and administrative ownership controls.</p>
                </div>

                <div className="bg-[#11161d] border border-[#44484f]/25 rounded-xl p-6 space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#7f8594] mb-1">Organization Name</label>
                    <input
                      type="text"
                      disabled
                      value={activeOrgName}
                      className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-white text-sm rounded-lg p-2.5 outline-none opacity-80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#7f8594] mb-1">Created</label>
                    <input
                      type="text"
                      disabled
                      value={
                        activeOrg?.created_at
                          ? new Date(activeOrg.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'
                      }
                      className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-white text-sm rounded-lg p-2.5 outline-none opacity-80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#7f8594] mb-1">Plan Tier</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#00eefc]/10 text-[#8ff5ff] border border-[#8ff5ff]/20 capitalize">
                      {activeOrg?.plan_tier || 'Free'}
                    </span>
                  </div>
                </div>

                {/* DANGER ZONE: OWNERSHIP TRANSFER */}
                {isOwner && (
                  <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#11161d] to-amber-950/20 p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                          <LuCrown className="w-5 h-5 text-amber-400" /> Transfer Workspace Ownership
                        </h3>
                        <p className="text-xs text-[#a8abb3] mt-1 max-w-xl leading-relaxed">
                          Relinquish workspace ownership to another active team member. The new owner will have sole authority over billing, deletion, and settings. Your role will be converted to Admin.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setConfirmWorkspaceName('');
                          setNewOwnerUserId('');
                          setTransferError(null);
                          setTransferSuccess(false);
                          setTransferModalOpen(true);
                        }}
                        disabled={isAccessExpired}
                        className="px-4 py-2.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-[#0a0e14] shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex-shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        Transfer Ownership
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render Modals */}
      {generateModalOpen && GenerateKeyModal()}
      {policyKey && policyKey.org_id === activeOrgId && canManageKeys && !isAccessExpired && (
        <KeyPolicyEditor key={policyKey.id} apiKey={policyKey} onClose={() => setPolicyKey(null)} onSaved={() => { setPolicyKey(null); fetchKeys(); }} />
      )}
      {deleteKeyModalOpen && <DeleteKeyModal />}
      {inviteModalOpen && <InviteMemberModal />}
      {removeUserModalOpen && <RemoveUserModal />}
      {editMemberModalOpen && <EditMemberModal />}
      {approveModalOpen && <ApproveRequestModal />}
      {rejectModalOpen && <RejectRequestModal />}
      {transferModalOpen && <TransferOwnershipModal />}
    </div>
  );
}
