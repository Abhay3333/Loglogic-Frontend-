import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LuX
} from 'react-icons/lu';

// Mock Data
const MOCK_KEYS = [
  { id: 'key-1', name: 'Production Server', key: 'log_live_••••••••••a1b2', created: 'Oct 12, 2025', status: 'Active' },
  { id: 'key-2', name: 'Staging Environment', key: 'log_live_••••••••••c3d4', created: 'Nov 05, 2025', status: 'Active' },
  { id: 'key-3', name: 'Old Auth Worker', key: 'log_live_••••••••••e5f6', created: 'Jan 22, 2025', status: 'Revoked' }
];

const MOCK_TEAM = [
  { id: 'usr-1', name: 'Alex Knight', email: 'alex@acme.io', role: 'Admin', joined: 'Oct 01, 2025', avatar: 'AK' },
  { id: 'usr-2', name: 'Sarah Chen', email: 'sarah@acme.io', role: 'Editor', joined: 'Nov 15, 2025', avatar: 'SC' },
  { id: 'usr-3', name: 'Mike Johnson', email: 'mike@acme.io', role: 'Viewer', joined: 'Feb 10, 2026', avatar: 'MJ' }
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('api-keys');

  // State
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [team, setTeam] = useState(MOCK_TEAM);

  // Modal States
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const [deleteKeyModalOpen, setDeleteKeyModalOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null);

  const [removeUserModalOpen, setRemoveUserModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  // Team Invite State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');

  // Handlers: API Keys
  const handleGenerateKey = () => {
    if (!newKeyName.trim()) return;
    const actualKey = `log_live_${Math.random().toString(36).substring(2, 15).toUpperCase()}${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
    const newEntry = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: `log_live_••••••••••${actualKey.slice(-4)}`,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Active'
    };
    setKeys([newEntry, ...keys]);
    setGeneratedKey(actualKey);
  };

  const copyGeneratedKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const confirmDeleteKey = () => {
    setKeys(keys.filter(k => k.id !== keyToDelete.id));
    setDeleteKeyModalOpen(false);
    setKeyToDelete(null);
  };

  // Handlers: Team
  const handleInviteUser = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return;
    const newEntry = {
      id: `usr-${Date.now()}`,
      name: 'Pending Invite',
      email: inviteEmail,
      role: inviteRole,
      joined: 'Pending',
      avatar: inviteEmail.charAt(0).toUpperCase()
    };
    setTeam([...team, newEntry]);
    setInviteEmail('');
  };

  const confirmRemoveUser = () => {
    setTeam(team.filter(u => u.id !== userToRemove.id));
    setRemoveUserModalOpen(false);
    setUserToRemove(null);
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
              This action cannot be undone and will immediately break any applications using this key for log ingestion.
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setDeleteKeyModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] bg-[#0a0e14] border border-[#44484f]/40 hover:border-[#44484f] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteKey}
            className="px-4 py-2 text-sm font-bold text-white bg-[#f87171] hover:bg-red-500 rounded-lg shadow-[0_0_15px_rgba(248,113,113,0.4)] transition-all"
          >
            Yes, Revoke Key
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
            <h3 className="text-lg font-bold text-[#f1f3fc]">Remove User</h3>
            <p className="mt-2 text-sm text-[#a8abb3] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#f1f3fc]">{userToRemove?.email}</strong> from this organization? They will immediately lose all access to logs and alerts.
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setRemoveUserModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] bg-[#0a0e14] border border-[#44484f]/40 hover:border-[#44484f] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmRemoveUser}
            className="px-4 py-2 text-sm font-bold text-white bg-[#f87171] hover:bg-red-500 rounded-lg shadow-[0_0_15px_rgba(248,113,113,0.4)] transition-all"
          >
            Remove User
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
          <button onClick={() => { setGenerateModalOpen(false); setGeneratedKey(null); setNewKeyName(''); }} className="text-[#7f8594] hover:text-[#f1f3fc] transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {!generatedKey ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#a8abb3] mb-2">Key Name (e.g. Production US-East)</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Name your key..."
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] block p-2.5 outline-none transition-colors"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setGenerateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] transition-colors">Cancel</button>
              <button
                onClick={handleGenerateKey}
                disabled={!newKeyName.trim()}
                className="px-4 py-2 text-sm font-bold text-[#0a0e14] bg-[#00eefc] hover:bg-[#8ff5ff] rounded-lg shadow-[0_0_15px_rgba(0,238,252,0.3)] disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Generate Key
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-amber-400/10 border border-amber-400/20 p-4 rounded-lg flex items-start gap-3">
              <LuTriangleAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-400/90 leading-relaxed">
                <strong>Please copy this key now.</strong> For security reasons, it will never be shown again. If you lose it, you will need to generate a new one.
              </p>
            </div>

            <div className="bg-[#0a0e14] border border-[#44484f]/40 p-4 rounded-lg flex items-center justify-between gap-4 group">
              <code className="text-[#8ff5ff] font-mono text-sm break-all">{generatedKey}</code>
              <button
                onClick={copyGeneratedKey}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2027] hover:bg-[#252d3a] border border-[#44484f]/50 rounded-md text-[#f1f3fc] text-sm font-medium transition-colors flex-shrink-0"
              >
                {keyCopied ? <><LuCircleCheck className="text-[#22c55e]" /> Copied</> : <><LuCopy /> Copy</>}
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => { setGenerateModalOpen(false); setGeneratedKey(null); setNewKeyName(''); }}
                className="px-6 py-2 text-sm font-bold text-[#0a0e14] bg-[#f1f3fc] hover:bg-white rounded-lg transition-all"
              >
                I've copied it securely
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
            className="p-1.5 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors"
            title="Back to Dashboard"
          >
            <LuArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-headline font-bold text-[#f1f3fc] flex items-center gap-2">
              <LuSettings className="w-6 h-6 text-[#8ff5ff]" />
              Organization Settings
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

          {/* Vertical Navigation */}
          <nav className="w-full md:w-64 flex-shrink-0 space-y-1">
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'api-keys'
                  ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/20'
                  : 'text-[#a8abb3] hover:bg-[#11161d] hover:text-[#f1f3fc]'
                }`}
            >
              <LuKey className="w-4 h-4" /> API Keys
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'team'
                  ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/20'
                  : 'text-[#a8abb3] hover:bg-[#11161d] hover:text-[#f1f3fc]'
                }`}
            >
              <LuUsers className="w-4 h-4" /> Team Members
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'billing'
                  ? 'bg-[#00eefc]/10 text-[#8ff5ff] border border-[#00eefc]/20'
                  : 'text-[#a8abb3] hover:bg-[#11161d] hover:text-[#f1f3fc]'
                }`}
            >
              <LuCreditCard className="w-4 h-4" /> Billing & Usage
            </button>
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">

            {/* Tab 1: API Keys */}
            {activeTab === 'api-keys' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#f1f3fc]">API Keys</h2>
                    <p className="text-sm text-[#a8abb3] mt-1">Manage the keys used to authenticate your log ingestion.</p>
                  </div>
                  <button
                    onClick={() => setGenerateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00eefc] px-4 py-2 text-sm font-bold text-[#0a0e14] hover:bg-[#8ff5ff] transition-all shadow-[0_0_15px_rgba(0,238,252,0.3)]"
                  >
                    <LuPlus className="w-4 h-4" /> Generate New Key
                  </button>
                </div>

                <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#0a0e14]/50 border-b border-[#44484f]/30 text-[#a8abb3]">
                        <tr>
                          <th scope="col" className="px-6 py-4 font-medium">Name</th>
                          <th scope="col" className="px-6 py-4 font-medium">Key</th>
                          <th scope="col" className="px-6 py-4 font-medium">Created Date</th>
                          <th scope="col" className="px-6 py-4 font-medium">Status</th>
                          <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#44484f]/20">
                        {keys.map(keyObj => (
                          <tr key={keyObj.id} className="hover:bg-[#1a2027]/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-[#f1f3fc]">{keyObj.name}</td>
                            <td className="px-6 py-4 font-mono text-[#7f8594]">{keyObj.key}</td>
                            <td className="px-6 py-4 text-[#a8abb3]">{keyObj.created}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${keyObj.status === 'Active' ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20' : 'bg-[#7f8594]/10 text-[#7f8594] border border-[#7f8594]/20'
                                }`}>
                                {keyObj.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {keyObj.status === 'Active' && (
                                <button
                                  onClick={() => { setKeyToDelete(keyObj); setDeleteKeyModalOpen(true); }}
                                  className="text-[#7f8594] hover:text-[#f87171] p-2 hover:bg-[#f87171]/10 rounded transition-colors"
                                  title="Revoke Key"
                                >
                                  <LuTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Team Members */}
            {activeTab === 'team' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-[#f1f3fc]">Team Members</h2>
                  <p className="text-sm text-[#a8abb3] mt-1">Manage who has access to your LogLogic workspace.</p>
                </div>

                {/* Invite Bar */}
                <div className="bg-[#11161d] border border-[#44484f]/30 p-4 rounded-xl flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="colleague@acme.io"
                    className="flex-1 bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] block px-4 py-2.5 outline-none transition-colors"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <select
                    className="bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] block px-4 py-2.5 outline-none transition-colors cursor-pointer"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button
                    onClick={handleInviteUser}
                    disabled={!inviteEmail}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-6 py-2.5 text-sm font-semibold text-[#8ff5ff] hover:bg-[#00eefc]/20 transition-all disabled:opacity-50"
                  >
                    Invite User
                  </button>
                </div>

                <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#0a0e14]/50 border-b border-[#44484f]/30 text-[#a8abb3]">
                        <tr>
                          <th scope="col" className="px-6 py-4 font-medium">User</th>
                          <th scope="col" className="px-6 py-4 font-medium">Role</th>
                          <th scope="col" className="px-6 py-4 font-medium">Joined Date</th>
                          <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#44484f]/20">
                        {team.map(user => (
                          <tr key={user.id} className="hover:bg-[#1a2027]/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#1a2027] border border-[#44484f]/50 flex items-center justify-center text-xs font-bold text-[#8ff5ff]">
                                  {user.avatar}
                                </div>
                                <div>
                                  <div className="font-medium text-[#f1f3fc]">{user.name}</div>
                                  <div className="text-xs text-[#7f8594]">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${user.role === 'Admin' ? 'bg-[#8ff5ff]/10 text-[#8ff5ff] border-[#8ff5ff]/20' :
                                  user.role === 'Editor' ? 'bg-[#f1f3fc]/5 text-[#f1f3fc] border-[#44484f]/30' :
                                    'bg-transparent text-[#a8abb3] border-[#44484f]/30'
                                }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#a8abb3]">
                              <span className={user.joined === 'Pending' ? 'italic text-[#7f8594]' : ''}>{user.joined}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {user.role !== 'Admin' && (
                                <button
                                  onClick={() => { setUserToRemove(user); setRemoveUserModalOpen(true); }}
                                  className="text-[#7f8594] hover:text-[#f87171] p-2 hover:bg-[#f87171]/10 rounded transition-colors"
                                  title="Remove User"
                                >
                                  <LuTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Billing & Usage */}
            {activeTab === 'billing' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-[#f1f3fc]">Billing & Usage</h2>
                  <p className="text-sm text-[#a8abb3] mt-1">Manage your subscription plan and monitor ingestion limits.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                  {/* Current Plan Card */}
                  <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] p-6 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                    <div className="text-xs uppercase tracking-widest text-[#7f8594] mb-4">Current Plan</div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-headline font-bold text-white">Pro Tier</span>
                    </div>
                    <div className="text-[#a8abb3] mb-8">
                      <span className="text-[#f1f3fc] font-medium">$29</span> / month
                    </div>
                    <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a2027] border border-[#44484f]/50 px-4 py-2.5 text-sm font-medium text-[#f1f3fc] hover:bg-[#252d3a] hover:border-[#8ff5ff]/40 transition-colors">
                      <LuExternalLink className="w-4 h-4 text-[#8ff5ff]" />
                      Manage Billing in Stripe
                    </button>
                  </div>

                  {/* Usage Card */}
                  <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] p-6 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                    <div className="text-xs uppercase tracking-widest text-[#7f8594] mb-4">Current Billing Cycle Usage</div>

                    <div className="mb-2 flex justify-between items-end">
                      <span className="text-2xl font-bold text-[#f1f3fc]">842,010</span>
                      <span className="text-sm text-[#7f8594]">/ 1,000,000 logs</span>
                    </div>

                    <div className="h-2 w-full bg-[#0a0e14] rounded-full overflow-hidden border border-[#44484f]/20">
                      <div className="h-full bg-[#8ff5ff] shadow-[0_0_10px_rgba(143,245,255,0.5)]" style={{ width: '84.2%' }}></div>
                    </div>

                    <p className="mt-3 text-xs text-[#a8abb3]">
                      You have used <strong className="text-[#f1f3fc]">84%</strong> of your monthly limit. Cycle resets in 12 days.
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Render Modals */}
      {generateModalOpen && <GenerateKeyModal />}
      {deleteKeyModalOpen && <DeleteKeyModal />}
      {removeUserModalOpen && <RemoveUserModal />}

    </div>
  );
}
