import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getApiKeys, createApiKey, revokeApiKey } from '../api/apiKey';
import {
  getWorkspaceMembers,
  inviteMember,
  removeMember,
  cancelInvite
} from '../api/team';
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
  LuClock
} from 'react-icons/lu';

export default function SettingsPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const { user, organizations = [], currentOrg } = outletContext;

  const [activeTab, setActiveTab] = useState('api-keys');

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
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const [deleteKeyModalOpen, setDeleteKeyModalOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState(null);

  // Team Invite Modal & Actions State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [isTemporaryAccess, setIsTemporaryAccess] = useState(false);
  const [accessExpiresAt, setAccessExpiresAt] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [generatedInviteLink, setGeneratedInviteLink] = useState(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  const [removeUserModalOpen, setRemoveUserModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [removingUser, setRemovingUser] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  const activeOrgId = currentOrg?.id || (organizations.length > 0 ? organizations[0].id : null);
  const activeOrgName = currentOrg?.name || (organizations.length > 0 ? organizations[0].name : 'Workspace');

  // Only the workspace owner can send invitations (matches backend RBAC).
  const activeOrg = currentOrg || (organizations.length > 0 ? organizations[0] : null);
  const isOwner = activeOrg?.role === 'owner';

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

  useEffect(() => {
    fetchKeys();
    fetchTeam();
  }, [fetchKeys, fetchTeam]);

  // Handlers: API Keys
  const handleGenerateKey = async (e) => {
    if (e) e.preventDefault();
    if (!newKeyName.trim() || !activeOrgId) return;

    setGenerating(true);
    setGenerateError(null);
    try {
      const response = await createApiKey({
        orgId: activeOrgId,
        keyName: newKeyName.trim()
      });

      // Show the rawKey in the modal
      setGeneratedKey(response.rawKey);

      // Refresh list
      fetchKeys();
    } catch (err) {
      console.error('Error creating API key:', err);
      setGenerateError(err.response?.data?.error || err.message || 'Failed to generate API key');
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

  const confirmDeleteKey = async () => {
    if (!keyToDelete) return;
    setRevoking(true);
    setRevokeError(null);
    try {
      await revokeApiKey(keyToDelete.id);
      setDeleteKeyModalOpen(false);
      setKeyToDelete(null);
      fetchKeys();
    } catch (err) {
      console.error('Error revoking API key:', err);
      setRevokeError(err.response?.data?.error || err.message || 'Failed to revoke API key');
    } finally {
      setRevoking(false);
    }
  };

  // Handlers: Team Management
  const handleSendInvite = async (e) => {
    if (e) e.preventDefault();
    if (!inviteEmail.trim() || !activeOrgId) return;

    setInviting(true);
    setInviteError(null);
    try {
      const response = await inviteMember({
        orgId: activeOrgId,
        email: inviteEmail.trim(),
        role: inviteRole,
        accessExpiresAt: isTemporaryAccess && accessExpiresAt ? accessExpiresAt : null
      });

      setGeneratedInviteLink(response.inviteLink);
      fetchTeam();
    } catch (err) {
      console.error('Error creating invite:', err);
      setInviteError(err.response?.data?.error || err.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const copyInviteLink = (link) => {
    navigator.clipboard.writeText(link);
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
    } catch (err) {
      console.error('Error cancelling invite:', err);
    }
  };

  // Modals JSX
  const DeleteKeyModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/80 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#f87171]/30 rounded-xl shadow-[0_0_40px_rgba(248,113,113,0.15)] w-full max-w-md p-6 relative">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#f87171]/10 rounded-full flex-shrink-0">
            <LuShieldAlert className="w-6 h-6 text-[#f87171]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f1f3fc]">Revoke API Key</h3>
            <p className="mt-2 text-sm text-[#a8abb3] leading-relaxed">
              Are you sure you want to revoke the key <strong className="text-[#f1f3fc]">"{keyToDelete?.name}"</strong>?
              This action cannot be undone and will immediately block ingestion for servers using this key.
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
            className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] bg-[#0a0e14] border border-[#44484f]/40 hover:border-[#44484f] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteKey}
            disabled={revoking}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#f87171] hover:bg-red-500 rounded-lg shadow-[0_0_15px_rgba(248,113,113,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {revoking && <LuLoader className="w-4 h-4 animate-spin" />}
            {revoking ? 'Revoking...' : 'Yes, Revoke Key'}
          </button>
        </div>
      </div>
    </div>
  );

  const RemoveUserModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/80 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#f87171]/30 rounded-xl shadow-[0_0_40px_rgba(248,113,113,0.15)] w-full max-w-md p-6 relative">
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
            className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] bg-[#0a0e14] border border-[#44484f]/40 hover:border-[#44484f] rounded-lg transition-colors cursor-pointer"
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
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setGenerateModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newKeyName.trim() || generating}
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
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] block p-2.5 outline-none transition-colors"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#a8abb3] mb-1.5">Role Permission</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] block p-2.5 outline-none transition-colors cursor-pointer"
              >
                <option value="admin">Admin — Can manage API keys, team members, and alerts</option>
                <option value="editor">Editor — Can view all logs, tail live streams, and configure alerts</option>
                <option value="viewer">Viewer — Read-only access to historical logs and dashboards</option>
              </select>
            </div>

            {/* Temporary Contractor Access Checkbox */}
            <div className="pt-2 border-t border-[#44484f]/25">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTemporaryAccess}
                  onChange={(e) => setIsTemporaryAccess(e.target.checked)}
                  className="rounded bg-[#0a0e14] border-[#44484f]/50 text-[#00eefc] focus:ring-[#00eefc]"
                />
                <span className="text-sm font-medium text-[#f1f3fc] flex items-center gap-1.5">
                  <LuClock className="w-4 h-4 text-amber-400" /> Temporary Contractor / Guest Access
                </span>
              </label>

              {isTemporaryAccess && (
                <div className="mt-3 p-3 bg-[#0a0e14] border border-[#44484f]/30 rounded-lg">
                  <label className="block text-xs text-[#a8abb3] mb-1.5">Access Expiration Date</label>
                  <input
                    type="date"
                    value={accessExpiresAt}
                    onChange={(e) => setAccessExpiresAt(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required={isTemporaryAccess}
                    className="w-full bg-[#11161d] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-md p-2 outline-none focus:border-[#8ff5ff]"
                  />
                  <p className="text-[11px] text-[#7f8594] mt-1">
                    Member's access to this workspace will automatically terminate on this date.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setInviteModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!inviteEmail.trim() || inviting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#0a0e14] bg-[#00eefc] hover:bg-[#8ff5ff] rounded-lg shadow-[0_0_15px_rgba(0,238,252,0.3)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {inviting && <LuLoader className="w-4 h-4 animate-spin text-[#0a0e14]" />}
                {inviting ? 'Generating...' : 'Generate Invite Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg flex items-start gap-3">
              <LuCircleCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-300 font-semibold">Invitation Generated!</p>
                <p className="text-xs text-[#a8abb3] mt-1">
                  Share this magic link with <strong className="text-white">{inviteEmail}</strong>. Valid for 7 days.
                </p>
              </div>
            </div>

            <div className="bg-[#0a0e14] border border-[#44484f]/40 p-3.5 rounded-lg flex items-center justify-between gap-3">
              <span className="text-[#8ff5ff] font-mono text-xs truncate select-all">{generatedInviteLink}</span>
              <button
                onClick={() => copyInviteLink(generatedInviteLink)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2027] hover:bg-[#252d3a] border border-[#44484f]/50 rounded-md text-[#f1f3fc] text-xs font-medium transition-colors flex-shrink-0 cursor-pointer"
              >
                {inviteLinkCopied ? <><LuCheck className="text-emerald-400 w-3.5 h-3.5" /> Copied</> : <><LuCopy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => { setInviteModalOpen(false); setGeneratedInviteLink(null); setInviteEmail(''); setInviteError(null); }}
                className="px-6 py-2 text-sm font-bold text-[#0a0e14] bg-[#f1f3fc] hover:bg-white rounded-lg transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#0a0e14] text-[#f1f3fc] font-sans overflow-hidden cyber-grid">

      {/* Header */}
      <header className="flex-none bg-[#0a0e14]/95 backdrop-blur border-b border-[#44484f]/20 p-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-lg transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <LuArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-headline font-bold text-[#f1f3fc] flex items-center gap-2">
              <LuSettings className="text-[#8ff5ff]" /> Workspace Settings
            </h1>
            <p className="text-xs text-[#a8abb3] mt-0.5">
              Managing configuration for <span className="text-[#8ff5ff] font-semibold">{activeOrgName}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

          {/* Sidebar Nav */}
          <div className="w-full md:w-64 flex-none space-y-1">
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
              <LuUsers className="w-4 h-4" /> Team Members & RBAC
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/30 shadow-[0_0_15px_rgba(0,238,252,0.15)]'
                  : 'text-[#a8abb3] hover:text-[#f1f3fc] hover:bg-[#11161d]'
              }`}
            >
              <LuBuilding2 className="w-4 h-4" /> Workspace Details
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">

            {/* TAB 1: API KEYS */}
            {activeTab === 'api-keys' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#f1f3fc]">API Keys</h2>
                    <p className="text-sm text-[#a8abb3] mt-1">Manage ingestion keys for your backend applications and servers.</p>
                  </div>
                  <button
                    onClick={() => { setGenerateModalOpen(true); setGenerateError(null); setGeneratedKey(null); }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00eefc] hover:bg-[#8ff5ff] px-4 py-2.5 text-sm font-bold text-[#0a0e14] shadow-[0_0_15px_rgba(0,238,252,0.3)] transition-all cursor-pointer"
                  >
                    <LuPlus className="w-4 h-4" /> Generate New Key
                  </button>
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
                      <button
                        onClick={() => { setGenerateModalOpen(true); setGenerateError(null); setGeneratedKey(null); }}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#00eefc]/10 border border-[#00eefc]/30 px-4 py-2 text-xs font-bold text-[#8ff5ff] hover:bg-[#00eefc]/20 transition-all cursor-pointer"
                      >
                        <LuPlus className="w-3.5 h-3.5" /> Generate Key
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#0a0e14]/50 border-b border-[#44484f]/30 text-[#a8abb3]">
                          <tr>
                            <th scope="col" className="px-6 py-4 font-medium">Name</th>
                            <th scope="col" className="px-6 py-4 font-medium">Key Identifier</th>
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
                                <td className="px-6 py-4 text-[#a8abb3]">{formattedDate}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    isActive ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20' : 'bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20'
                                  }`}>
                                    {isActive ? 'Active' : 'Revoked'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {isActive && (
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

            {/* TAB 2: TEAM MEMBERS & RBAC */}
            {activeTab === 'team' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#f1f3fc]">Team Members & Access</h2>
                    <p className="text-sm text-[#a8abb3] mt-1">Manage RBAC roles and contractor access for <span className="text-white font-medium">{activeOrgName}</span>.</p>
                  </div>
                  <button
                    onClick={() => { setInviteModalOpen(true); setInviteError(null); setGeneratedInviteLink(null); }}
                    disabled={!isOwner}
                    title={isOwner ? 'Invite a new member' : 'Only the workspace owner can invite members'}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00eefc] hover:bg-[#8ff5ff] px-4 py-2.5 text-sm font-bold text-[#0a0e14] shadow-[0_0_15px_rgba(0,238,252,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
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
                            const isOwner = member.role === 'owner';
                            const isCurrentUser = member.userId === user?.id;
                            const hasExpiry = Boolean(member.accessExpiresAt);
                            const isExpired = hasExpiry && new Date(member.accessExpiresAt) < new Date();

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
                                      isExpired ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                                    }`}>
                                      <LuClock className="w-3.5 h-3.5" />
                                      {isExpired ? 'Expired' : `Expires ${new Date(member.accessExpiresAt).toLocaleDateString()}`}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-[#7f8594]">Permanent</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {!isOwner && !isCurrentUser && (
                                    <button
                                      onClick={() => { setUserToRemove(member); setRemoveUserModalOpen(true); }}
                                      className="text-[#7f8594] hover:text-[#f87171] p-2 hover:bg-[#f87171]/10 rounded transition-colors cursor-pointer"
                                      title="Remove from Workspace"
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

                {/* Pending Invitations Section */}
                {pendingInvites.length > 0 && (
                  <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
                    <div className="p-4 border-b border-[#44484f]/30 bg-[#0a0e14]/50 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#f1f3fc] flex items-center gap-2">
                        <LuMail className="text-[#8ff5ff]" /> Pending Invitations ({pendingInvites.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-[#44484f]/20">
                      {pendingInvites.map(invite => {
                        const link = `${window.location.origin}/invite?token=${invite.token}`;
                        return (
                          <div key={invite.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-[#1a2027]/30 transition-colors">
                            <div>
                              <div className="font-medium text-white text-sm">{invite.email}</div>
                              <div className="flex items-center gap-3 text-xs text-[#7f8594] mt-1">
                                <span className="uppercase text-[#8ff5ff] font-mono">{invite.role}</span>
                                <span>&bull;</span>
                                <span>Expires {new Date(invite.expires_at).toLocaleDateString()}</span>
                                {invite.access_expires_at && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="text-amber-300">Temp access until {new Date(invite.access_expires_at).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyInviteLink(link)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0e14] border border-[#44484f]/40 hover:border-[#8ff5ff]/40 text-xs text-[#f1f3fc] transition-colors cursor-pointer"
                              >
                                <LuLink className="w-3.5 h-3.5 text-[#8ff5ff]" /> Copy Link
                              </button>
                              <button
                                onClick={() => handleCancelInvite(invite.id)}
                                className="p-1.5 text-[#7f8594] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-lg transition-colors cursor-pointer"
                                title="Revoke Invite"
                              >
                                <LuX className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: WORKSPACE DETAILS */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-[#f1f3fc]">Workspace Details</h2>
                  <p className="text-sm text-[#a8abb3] mt-1">Information regarding your current tenant space.</p>
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
                    <label className="block text-xs uppercase font-semibold text-[#7f8594] mb-1">Organization UUID</label>
                    <code className="block w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#8ff5ff] font-mono text-xs rounded-lg p-2.5 select-all">
                      {activeOrgId || 'N/A'}
                    </code>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#7f8594] mb-1">Plan Tier</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#00eefc]/10 text-[#8ff5ff] border border-[#8ff5ff]/20">
                      Developer Pro
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Render Modals */}
      {generateModalOpen && <GenerateKeyModal />}
      {deleteKeyModalOpen && <DeleteKeyModal />}
      {inviteModalOpen && <InviteMemberModal />}
      {removeUserModalOpen && <RemoveUserModal />}

    </div>
  );
}
