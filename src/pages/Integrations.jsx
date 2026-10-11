import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  LuArrowLeft, LuPlus, LuTrash2, LuPen, LuSend, LuX, LuWebhook, LuSiren,
  LuCircleCheck, LuCircleAlert, LuPlug
} from 'react-icons/lu';
import { FaSlack, FaDiscord, FaMicrosoft } from 'react-icons/fa';
import { SiPagerduty, SiOpsgenie, SiJira, SiLinear, SiGithub } from 'react-icons/si';
import {
  listIntegrations, createIntegration, updateIntegration, deleteIntegration, testIntegration
} from '../api/integrations';

// Per-type metadata: display + the config fields the drawer renders.
const TYPE_META = {
  slack:      { label: 'Slack',            kind: 'chat',    Icon: FaSlack,    color: '#e01e5a',
    fields: [{ key: 'webhook_url', label: 'Incoming Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...', required: true }] },
  discord:    { label: 'Discord',          kind: 'chat',    Icon: FaDiscord,  color: '#5865f2',
    fields: [{ key: 'webhook_url', label: 'Channel Webhook URL', type: 'url', placeholder: 'https://discord.com/api/webhooks/...', required: true }] },
  teams:      { label: 'Microsoft Teams',  kind: 'chat',    Icon: FaMicrosoft, color: '#6264a7',
    fields: [{ key: 'webhook_url', label: 'Incoming Webhook URL', type: 'url', placeholder: 'https://outlook.office.com/webhook/...', required: true }] },
  pagerduty:  { label: 'PagerDuty',        kind: 'paging',  Icon: SiPagerduty, color: '#06ac38',
    fields: [{ key: 'routing_key', label: 'Events API v2 Integration Key', type: 'text', placeholder: 'R0XXXXXXXXXXXXXXXXXXXX', required: true, secret: true }] },
  opsgenie:   { label: 'Opsgenie',         kind: 'paging',  Icon: SiOpsgenie, color: '#172b4d',
    fields: [
      { key: 'api_key', label: 'API Integration Key', type: 'text', placeholder: 'xxxxxxxx-xxxx-...', required: true, secret: true },
      { key: 'region', label: 'Region', type: 'select', options: ['us', 'eu'] }
    ] },
  incidentio: { label: 'incident.io',      kind: 'paging',  Icon: LuSiren,    color: '#f25533',
    fields: [
      { key: 'webhook_url', label: 'HTTP Alert Source URL', type: 'url', placeholder: 'https://api.incident.io/v2/alert_events/http/...', required: true },
      { key: 'token', label: 'Bearer Token (optional)', type: 'text', placeholder: 'secret token', secret: true }
    ] },
  webhook:    { label: 'Custom Webhook',   kind: 'webhook', Icon: LuWebhook,  color: '#8ff5ff',
    fields: [
      { key: 'webhook_url', label: 'Endpoint URL', type: 'url', placeholder: 'https://example.com/hooks/loglogic', required: true },
      { key: 'template', label: 'JSON body template (optional, {{token}} vars)', type: 'textarea', placeholder: '{"text":"{{ruleName}}: {{logCount}} in {{timeWindowMinutes}}m"}' }
    ] },
  jira:       { label: 'Jira',             kind: 'issue',   Icon: SiJira,     color: '#2684ff',
    fields: [
      { key: 'base_url', label: 'Site URL', type: 'url', placeholder: 'https://your-domain.atlassian.net', required: true },
      { key: 'email', label: 'Account Email', type: 'text', placeholder: 'you@company.com', required: true },
      { key: 'api_token', label: 'API Token', type: 'text', placeholder: 'Atlassian API token', required: true, secret: true },
      { key: 'project_key', label: 'Project Key', type: 'text', placeholder: 'OPS', required: true },
      { key: 'issue_type', label: 'Issue Type', type: 'text', placeholder: 'Task' }
    ] },
  linear:     { label: 'Linear',           kind: 'issue',   Icon: SiLinear,   color: '#5e6ad2',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'text', placeholder: 'lin_api_...', required: true, secret: true },
      { key: 'team_id', label: 'Team ID', type: 'text', placeholder: 'team UUID', required: true }
    ] },
  github:     { label: 'GitHub Issues',    kind: 'issue',   Icon: SiGithub,   color: '#f1f3fc',
    fields: [
      { key: 'token', label: 'Personal Access Token', type: 'text', placeholder: 'github_pat_...', required: true, secret: true },
      { key: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo', required: true }
    ] }
};

const TYPE_ORDER = ['slack', 'discord', 'teams', 'pagerduty', 'opsgenie', 'incidentio', 'webhook', 'jira', 'linear', 'github'];

const KIND_LABEL = { chat: 'ChatOps', paging: 'On-call paging', webhook: 'Webhook', issue: 'Issue tracker' };

const errorMessage = (err, fallback) => err?.response?.data?.error || fallback;

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const { organizations = [], currentOrg } = outletContext;
  const activeOrg = currentOrg || organizations[0] || null;
  const orgId = activeOrg?.id || null;
  const canManage = activeOrg?.role === 'owner' || activeOrg?.role === 'admin';

  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draftType, setDraftType] = useState('slack');
  const [draftName, setDraftName] = useState('');
  const [draftConfig, setDraftConfig] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState('');
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const load = useCallback(async () => {
    if (!orgId) { setIntegrations([]); setLoading(false); return; }
    setLoading(true);
    setPageError('');
    try {
      const res = await listIntegrations(orgId);
      setIntegrations(res.integrations || []);
    } catch (err) {
      setPageError(errorMessage(err, 'Could not load integrations.'));
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = (type) => {
    setEditingId(null);
    setDraftType(type);
    setDraftName(TYPE_META[type].label);
    setDraftConfig(type === 'opsgenie' ? { region: 'us' } : {});
    setFormError('');
    setRevealedSecret('');
    setIsPanelOpen(true);
  };

  const openEdit = (integration) => {
    setEditingId(integration.id);
    setDraftType(integration.type);
    setDraftName(integration.name || '');
    // Non-secret config comes back usable; secret fields are left blank to keep.
    const meta = TYPE_META[integration.type];
    const config = {};
    for (const field of meta.fields) {
      if (!field.secret && integration.config?.[field.key] && integration.config[field.key] !== 'configured') {
        config[field.key] = integration.config[field.key];
      }
    }
    if (integration.type === 'opsgenie') config.region = integration.config?.region || 'us';
    setDraftConfig(config);
    setFormError('');
    setRevealedSecret('');
    setIsPanelOpen(true);
  };

  const meta = TYPE_META[draftType];

  const handleSave = async () => {
    if (!canManage || !orgId) return;
    if (!draftName.trim()) { setFormError('Give this integration a name.'); return; }
    // On create, enforce required fields client-side; on edit, blanks keep existing.
    if (!editingId) {
      for (const field of meta.fields) {
        if (field.required && !String(draftConfig[field.key] || '').trim()) {
          setFormError(`${field.label} is required.`);
          return;
        }
      }
    }
    const config = {};
    for (const [key, value] of Object.entries(draftConfig)) {
      if (String(value || '').trim() !== '') config[key] = value;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updateIntegration(orgId, editingId, { name: draftName.trim(), config });
        setIsPanelOpen(false);
      } else {
        const created = await createIntegration(orgId, { type: draftType, name: draftName.trim(), config });
        if (created.integration?.signing_secret && meta.kind === 'webhook') {
          setRevealedSecret(created.integration.signing_secret);
          setEditingId(created.integration.id);
        } else {
          setIsPanelOpen(false);
        }
      }
      await load();
    } catch (err) {
      setFormError(errorMessage(err, 'Could not save this integration.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (integration) => {
    if (!canManage) return;
    if (!window.confirm(`Remove “${integration.name}”? Alert rules routing to it will stop delivering there.`)) return;
    try {
      await deleteIntegration(orgId, integration.id);
      await load();
    } catch (err) {
      setPageError(errorMessage(err, 'Could not remove this integration.'));
    }
  };

  const runTest = async (integration) => {
    if (!canManage) return;
    setTestingId(integration.id);
    setTestResult(null);
    try {
      const res = await testIntegration(orgId, integration.id);
      setTestResult({ id: integration.id, ok: res.ok, message: res.ok ? 'Test sent.' : (res.error || 'Delivery failed.') });
      await load();
    } catch (err) {
      setTestResult({ id: integration.id, ok: false, message: errorMessage(err, 'Test failed.') });
    } finally {
      setTestingId(null);
    }
  };

  const grouped = useMemo(() => {
    const map = {};
    for (const integration of integrations) {
      (map[integration.type] = map[integration.type] || []).push(integration);
    }
    return map;
  }, [integrations]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0e14] text-[#f1f3fc] font-sans overflow-hidden cyber-grid">
      <header className="flex-none bg-[#0a0e14]/95 backdrop-blur border-b border-[#44484f]/20 p-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/app/dashboard')} className="p-1.5 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors" title="Back to Dashboard" type="button">
              <LuArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-headline font-bold text-[#f1f3fc] flex items-center gap-2">
                <LuPlug className="w-6 h-6 text-[#8ff5ff]" />
                Integrations
              </h1>
              <p className="text-sm text-[#a8abb3] mt-1">Connect ChatOps, on-call, and issue trackers. Route alerts from the Alerts page.</p>
            </div>
          </div>
          <button onClick={() => navigate('/app/incidents')} className="inline-flex items-center gap-2 rounded-lg border border-[#44484f]/40 px-4 py-2 text-sm text-[#a8abb3] hover:text-[#f1f3fc] hover:border-[#8ff5ff]/40 transition-colors" type="button">
            <LuSiren className="w-4 h-4" /> View Incidents
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          {pageError && (
            <div className="rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5] flex items-start gap-2">
              <LuCircleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{pageError}</span>
            </div>
          )}

          {/* Connect grid */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#a8abb3] mb-3">Connect a destination</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {TYPE_ORDER.map((type) => {
                const m = TYPE_META[type];
                const Icon = m.Icon;
                const count = (grouped[type] || []).length;
                return (
                  <button
                    key={type}
                    onClick={() => canManage && openCreate(type)}
                    disabled={!canManage}
                    className="group rounded-xl border border-[#44484f]/25 bg-[#11161d] p-4 text-left hover:border-[#8ff5ff]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <Icon className="w-6 h-6 mb-2" style={{ color: m.color }} />
                    <p className="text-sm font-semibold text-[#f1f3fc]">{m.label}</p>
                    <p className="text-[11px] text-[#7f8594]">{KIND_LABEL[m.kind]}{count ? ` · ${count} connected` : ''}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Connected list */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#a8abb3] mb-3">Connected</h2>
            {loading ? (
              <p className="text-sm text-[#a8abb3]">Loading integrations…</p>
            ) : integrations.length === 0 ? (
              <div className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-10 text-center shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                <LuPlug className="w-10 h-10 mx-auto text-[#44484f] mb-4" />
                <p className="text-[#a8abb3]">No integrations connected yet. Pick a destination above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {integrations.map((integration) => {
                  const m = TYPE_META[integration.type] || {};
                  const Icon = m.Icon || LuWebhook;
                  const isIssue = m.kind === 'issue';
                  return (
                    <div key={integration.id} className="rounded-xl border border-[#44484f]/25 bg-[#11161d] p-4 flex items-center justify-between gap-4 hover:border-[#44484f]/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-6 h-6 flex-shrink-0" style={{ color: m.color || '#8ff5ff' }} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#f1f3fc] truncate">{integration.name}</p>
                            <span className="text-[10px] uppercase tracking-wider text-[#7f8594] border border-[#44484f]/40 rounded px-1.5 py-0.5">{m.label || integration.type}</span>
                            {integration.is_active === false && <span className="text-[10px] uppercase tracking-wider text-amber-300">disabled</span>}
                          </div>
                          <p className="text-xs text-[#7f8594] mt-0.5 flex items-center gap-1.5">
                            {integration.last_status === 'ok' && <span className="inline-flex items-center gap-1 text-[#86efac]"><LuCircleCheck className="w-3 h-3" /> healthy</span>}
                            {integration.last_status === 'failed' && <span className="inline-flex items-center gap-1 text-[#fca5a5]"><LuCircleAlert className="w-3 h-3" /> last delivery failed</span>}
                            {!integration.last_status && <span>never used</span>}
                            {testResult?.id === integration.id && (
                              <span className={testResult.ok ? 'text-[#86efac]' : 'text-[#fca5a5]'}>· {testResult.message}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!isIssue && (
                            <button type="button" onClick={() => runTest(integration)} disabled={testingId === integration.id} className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md disabled:opacity-50" title="Send test">
                              <LuSend className="w-4 h-4" />
                            </button>
                          )}
                          <button type="button" onClick={() => openEdit(integration)} className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md" title="Edit">
                            <LuPen className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => remove(integration)} className="p-2 text-[#7f8594] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-md" title="Remove">
                            <LuTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {isPanelOpen && <div className="fixed inset-0 bg-[#0a0e14]/70 backdrop-blur-sm z-30" onClick={() => setIsPanelOpen(false)} />}

      <div className={`fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-[#11161d] border-l border-[#44484f]/30 shadow-[-15px_0_40px_rgba(0,0,0,0.6)] transform transition-transform duration-300 ease-in-out flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-[#44484f]/25">
          <h2 className="font-headline text-xl font-bold text-[#f1f3fc] flex items-center gap-2">
            {meta && <meta.Icon className="w-5 h-5" style={{ color: meta.color }} />}
            {editingId ? 'Edit' : 'Connect'} {meta?.label}
          </h2>
          <button type="button" onClick={() => setIsPanelOpen(false)} className="p-1.5 text-[#7f8594] hover:text-[#f1f3fc] rounded-md"><LuX className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {formError && <p className="text-sm text-[#fca5a5]">{formError}</p>}
          {revealedSecret && (
            <div className="rounded-lg border border-[#00eefc]/30 bg-[#00eefc]/10 p-3 text-xs text-[#d7fbff]">
              <p className="font-semibold mb-1">Signing secret (shown once)</p>
              <p className="font-mono break-all">{revealedSecret}</p>
              <p className="mt-2 text-[#a8abb3]">Verify the <code>X-LogLogic-Signature</code> header (HMAC-SHA256 of the body) with this secret.</p>
            </div>
          )}

          <label className="block text-sm text-[#a8abb3]">
            Name
            <input className="mt-1.5 w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 outline-none focus:border-[#8ff5ff]"
              value={draftName} onChange={(e) => setDraftName(e.target.value)} />
          </label>

          {meta?.fields.map((field) => (
            <label key={field.key} className="block text-sm text-[#a8abb3]">
              {field.label}
              {field.type === 'select' ? (
                <select className="mt-1.5 w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 outline-none focus:border-[#8ff5ff]"
                  value={draftConfig[field.key] || field.options[0]} onChange={(e) => setDraftConfig({ ...draftConfig, [field.key]: e.target.value })}>
                  {field.options.map((opt) => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea rows={4} className="mt-1.5 w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 font-mono outline-none focus:border-[#8ff5ff]"
                  placeholder={field.placeholder} value={draftConfig[field.key] || ''} onChange={(e) => setDraftConfig({ ...draftConfig, [field.key]: e.target.value })} />
              ) : (
                <input type={field.type === 'url' ? 'url' : 'text'}
                  className="mt-1.5 w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 font-mono outline-none focus:border-[#8ff5ff]"
                  placeholder={editingId && field.secret ? 'Leave blank to keep current' : field.placeholder}
                  value={draftConfig[field.key] || ''} onChange={(e) => setDraftConfig({ ...draftConfig, [field.key]: e.target.value })} />
              )}
            </label>
          ))}
        </div>

        <div className="border-t border-[#44484f]/25 p-5 flex justify-end gap-3">
          <button type="button" onClick={() => setIsPanelOpen(false)} className="px-5 py-2 text-sm text-[#a8abb3]">Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving || !canManage} className="px-6 py-2 bg-[#00eefc] hover:bg-[#8ff5ff] text-[#0a0e14] text-sm font-bold rounded-lg disabled:opacity-50">
            {saving ? 'Saving…' : (editingId ? 'Save' : 'Connect')}
          </button>
        </div>
      </div>
    </div>
  );
}
