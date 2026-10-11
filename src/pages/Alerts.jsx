import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  LuBell,
  LuPlus,
  LuTrash2,
  LuPen,
  LuX,
  LuSend,
  LuWebhook,
  LuArrowLeft,
  LuCircleCheck,
  LuCircleAlert,
  LuMail,
  LuPlug
} from 'react-icons/lu';
import { FaSlack } from 'react-icons/fa';
import { getOrgServices } from '../api/logs';
import { listIntegrations } from '../api/integrations';
import {
  acknowledgeAlert,
  createAlertRule,
  deleteAlertRule,
  listAlertHistory,
  listAlertRules,
  muteAlertRule,
  testAlertRule,
  updateAlertRule
} from '../api/alerts';

const EMPTY_FORM = {
  name: '',
  level: 'ERROR',
  service: '',
  threshold_count: 5,
  time_window_minutes: 5,
  email: true,
  destination: 'none',
  webhook_url: '',
  integration_ids: []
};

const errorMessage = (err, fallback) =>
  err?.response?.data?.error || fallback;

const formatWhen = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';
  return date.toLocaleString();
};

const destinationOf = (rule) => {
  const channels = Array.isArray(rule.channels) ? rule.channels : [];
  if (channels.includes('slack')) return 'slack';
  if (channels.includes('webhook')) return 'webhook';
  return 'none';
};

const Toggle = ({ enabled, onChange, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8ff5ff] focus:ring-offset-2 focus:ring-offset-[#0a0e14] disabled:opacity-40 disabled:cursor-not-allowed ${
      enabled ? 'bg-[#00eefc]' : 'bg-[#44484f]/50'
    }`}
    role="switch"
    aria-checked={enabled}
    onClick={onChange}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

export default function AlertsPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const { organizations = [], currentOrg } = outletContext;
  const activeOrg = currentOrg || organizations[0] || null;
  const orgId = activeOrg?.id || null;
  const canManage = activeOrg?.role === 'owner' || activeOrg?.role === 'admin';

  const [rules, setRules] = useState([]);
  const [history, setHistory] = useState([]);
  const [services, setServices] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [revealedSecret, setRevealedSecret] = useState('');

  const load = useCallback(async () => {
    if (!orgId) {
      setRules([]);
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setPageError('');
    try {
      const [ruleRes, historyRes, serviceRes] = await Promise.all([
        listAlertRules(orgId),
        listAlertHistory(orgId),
        getOrgServices(orgId).catch(() => ({ services: [] }))
      ]);
      setRules(ruleRes.rules || []);
      setHistory(historyRes.history || []);
      setServices(serviceRes.services || []);
      // Integrations are optional (tables may not be migrated yet).
      listIntegrations(orgId)
        .then((res) => setIntegrations(res.integrations || []))
        .catch(() => setIntegrations([]));
    } catch (err) {
      setPageError(errorMessage(err, 'Could not load alert rules.'));
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const openBuilder = (rule = null) => {
    setFormError('');
    setRevealedSecret('');
    if (rule) {
      setEditingRuleId(rule.id);
      setFormData({
        name: rule.name || '',
        level: String(rule.level || 'ERROR').toUpperCase(),
        service: rule.service || '',
        threshold_count: rule.threshold_count || 5,
        time_window_minutes: rule.time_window_minutes || 5,
        email: !rule.channels || rule.channels.includes('email'),
        destination: destinationOf(rule),
        webhook_url: rule.webhook_url || '',
        integration_ids: Array.isArray(rule.integration_ids) ? rule.integration_ids : []
      });
    } else {
      setEditingRuleId(null);
      setFormData(EMPTY_FORM);
    }
    setIsPanelOpen(true);
  };

  const buildPayload = () => {
    const channels = [];
    if (formData.email) channels.push('email');
    if (formData.destination === 'slack') channels.push('slack');
    if (formData.destination === 'webhook') channels.push('webhook');
    return {
      name: formData.name.trim(),
      level: formData.level,
      service: formData.service || null,
      threshold_count: Number(formData.threshold_count),
      time_window_minutes: Number(formData.time_window_minutes),
      channels,
      webhook_url: formData.destination === 'none' ? null : formData.webhook_url.trim(),
      integration_ids: formData.integration_ids
    };
  };

  const handleSave = async () => {
    if (!canManage || !orgId) return;
    const payload = buildPayload();
    if (!payload.name) {
      setFormError('Rule name is required.');
      return;
    }
    if (payload.channels.length === 0 && payload.integration_ids.length === 0) {
      setFormError('Choose email, Slack, a webhook, or at least one integration.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingRuleId) {
        await updateAlertRule(orgId, editingRuleId, payload);
        setIsPanelOpen(false);
      } else {
        const created = await createAlertRule(orgId, payload);
        setRevealedSecret(created.rule?.webhook_secret || '');
        setEditingRuleId(created.rule?.id || null);
      }
      await load();
    } catch (err) {
      setFormError(errorMessage(err, 'Could not save this rule.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleRuleActive = async (rule) => {
    if (!canManage) return;
    try {
      await updateAlertRule(orgId, rule.id, { is_active: !rule.is_active });
      await load();
    } catch (err) {
      setPageError(errorMessage(err, 'Could not update this rule.'));
    }
  };

  const removeRule = async (rule) => {
    if (!canManage) return;
    if (!window.confirm(`Delete “${rule.name}”? Any owner or admin in this workspace can delete it.`)) return;
    try {
      await deleteAlertRule(orgId, rule.id);
      await load();
    } catch (err) {
      setPageError(errorMessage(err, 'Could not delete this rule.'));
    }
  };

  const muteRule = async (rule, duration) => {
    if (!canManage || !duration) return;
    try {
      await muteAlertRule(orgId, rule.id, duration);
      await load();
    } catch (err) {
      setPageError(errorMessage(err, 'Could not mute this rule.'));
    }
  };

  const sendTest = async (rule) => {
    if (!canManage) return;
    setTestingId(rule.id);
    try {
      await testAlertRule(orgId, rule.id);
      await load();
    } catch (err) {
      setPageError(errorMessage(err, 'Test trigger failed.'));
    } finally {
      setTestingId(null);
    }
  };

  const acknowledge = async (entry) => {
    if (!canManage) return;
    try {
      await acknowledgeAlert(orgId, entry.id);
      await load();
    } catch (err) {
      setPageError(errorMessage(err, 'Could not acknowledge this alert.'));
    }
  };

  const ruleName = (ruleId) => rules.find((rule) => rule.id === ruleId)?.name || 'Deleted rule';

  return (
    <div className="flex flex-col h-screen bg-[#0a0e14] text-[#f1f3fc] font-sans overflow-hidden cyber-grid">
      <header className="flex-none bg-[#0a0e14]/95 backdrop-blur border-b border-[#44484f]/20 p-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="p-1.5 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors"
              title="Back to Dashboard"
              type="button"
            >
              <LuArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-headline font-bold text-[#f1f3fc] flex items-center gap-2">
                <LuBell className="w-6 h-6 text-[#8ff5ff]" />
                Alert Rules
              </h1>
              <p className="text-sm text-[#a8abb3] mt-1">
                Email, Slack, or a signed webhook when a log threshold is crossed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs uppercase tracking-widest text-[#7f8594]">Active</span>
              <span className="text-sm font-medium text-[#a8abb3]">
                <span className="text-[#f1f3fc]">{rules.filter((rule) => rule.is_active).length}</span> rules
              </span>
            </div>
            {canManage && (
              <button
                onClick={() => openBuilder()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00eefc] px-4 py-2 text-sm font-semibold text-[#0a0e14] hover:bg-[#8ff5ff] transition-all shadow-[0_0_15px_rgba(0,238,252,0.3)]"
                type="button"
              >
                <LuPlus className="w-4 h-4" />
                Create New Alert
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-4">
          {pageError && (
            <div className="rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5] flex items-start gap-2">
              <LuCircleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{pageError}</span>
            </div>
          )}

          {loading ? (
            <p className="text-sm text-[#a8abb3]">Loading alert rules…</p>
          ) : rules.length === 0 ? (
            <div className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-12 text-center shadow-[0_0_20px_rgba(0,0,0,0.2)]">
              <LuBell className="w-10 h-10 mx-auto text-[#44484f] mb-4" />
              <h3 className="text-lg font-medium text-[#f1f3fc]">No alert rules configured</h3>
              <p className="text-[#a8abb3] mt-2 mb-6 max-w-sm mx-auto">Get notified when matching logs cross a count inside a time window.</p>
              {canManage && (
                <button
                  onClick={() => openBuilder()}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-4 py-2 text-sm font-medium text-[#8ff5ff] hover:bg-[#00eefc]/20 transition-colors"
                  type="button"
                >
                  <LuPlus className="w-4 h-4" /> Create your first rule
                </button>
              )}
            </div>
          ) : (
            rules.map((rule) => {
              const channels = Array.isArray(rule.channels) ? rule.channels : [];
              const muted = rule.muted_until && new Date(rule.muted_until).getTime() > Date.now();
              return (
                <div
                  key={rule.id}
                  className="rounded-xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_15px_rgba(0,0,0,0.15)] hover:border-[#44484f]/50 transition-colors flex flex-col gap-4"
                >
                  <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="text-base font-semibold text-[#f1f3fc]">{rule.name}</h3>
                        <span className="text-xs text-[#7f8594] font-mono bg-[#0a0e14] px-2 py-0.5 rounded border border-[#44484f]/30">
                          Last triggered: {formatWhen(rule.last_triggered_at)}
                        </span>
                        {muted && (
                          <span className="text-xs text-amber-300 font-mono">Muted until {formatWhen(rule.muted_until)}</span>
                        )}
                      </div>
                      <div className="inline-flex flex-wrap items-center gap-2 bg-[#0a0e14] border border-[#44484f]/40 rounded-lg px-3 py-1.5 text-sm font-mono text-[#f1f3fc]">
                        <span className="text-[#8ff5ff]">IF</span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-[#f87171]/20 text-[#f87171]">{String(rule.level || 'ERROR').toUpperCase()}</span>
                        <span className="text-[#8ff5ff]">&gt;</span>
                        <span className="font-bold">{rule.threshold_count}</span>
                        <span className="text-[#7f8594]">in</span>
                        <span className="text-[#a8abb3]">{rule.time_window_minutes} min</span>
                        <span className="text-[#7f8594]">in</span>
                        <span className="text-[#a8abb3]">{rule.service || 'all services'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end">
                      <div className="flex items-center gap-2 text-sm text-[#a8abb3]">
                        {channels.includes('email') && <LuMail className="w-4 h-4 text-[#8ff5ff]" title="Email" />}
                        {channels.includes('slack') && <FaSlack className="w-4 h-4 text-[#e01e5a]" title="Slack" />}
                        {channels.includes('webhook') && <LuWebhook className="w-4 h-4 text-[#8ff5ff]" title="Webhook" />}
                        {Array.isArray(rule.integration_ids) && rule.integration_ids.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-[#8ff5ff]" title="Routed integrations">
                            <LuPlug className="w-4 h-4" />{rule.integration_ids.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium uppercase tracking-wider ${rule.is_active ? 'text-[#00eefc]' : 'text-[#7f8594]'}`}>
                          {rule.is_active ? 'Active' : 'Paused'}
                        </span>
                        <Toggle enabled={Boolean(rule.is_active)} disabled={!canManage} onChange={() => toggleRuleActive(rule)} />
                      </div>
                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => sendTest(rule)} disabled={testingId === rule.id} className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md" title="Send test">
                            <LuSend className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => openBuilder(rule)} className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md" title="Edit rule">
                            <LuPen className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => removeRule(rule)} className="p-2 text-[#7f8594] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-md" title="Delete rule">
                            <LuTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-[#7f8594]">Mute</span>
                      {['15m', '1h', '24h', 'off'].map((duration) => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => muteRule(rule, duration)}
                          className="rounded-md border border-[#44484f]/40 px-2 py-1 text-[#a8abb3] hover:text-[#f1f3fc] hover:border-[#8ff5ff]/40"
                        >
                          {duration === 'off' ? 'Unmute' : duration}
                        </button>
                      ))}
                      {rule.webhook_secret && (
                        <span className="ml-auto font-mono text-[11px] text-[#7f8594]" title="Webhook signing secret">
                          secret {rule.webhook_secret.slice(0, 8)}…
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          <section className="pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#a8abb3] mb-3">Trigger history</h2>
            {history.length === 0 ? (
              <p className="text-sm text-[#7f8594]">No alerts have fired yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => {
                  const samples = Array.isArray(entry.sample_messages) ? entry.sample_messages : [];
                  const isTest = samples.some((sample) => sample && sample.test);
                  return (
                    <div key={entry.id} className="rounded-lg border border-[#44484f]/25 bg-[#11161d] px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{ruleName(entry.rule_id)}</span>
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${entry.status === 'acknowledged' ? 'bg-[#22c55e]/15 text-[#86efac]' : 'bg-[#f87171]/15 text-[#fca5a5]'}`}>
                            {entry.status}
                          </span>
                          {isTest && <span className="text-[10px] uppercase tracking-wider text-[#8ff5ff]">test</span>}
                        </div>
                        <p className="text-xs text-[#7f8594] mt-1">
                          {formatWhen(entry.triggered_at)} · {entry.log_count} logs
                          {samples[0]?.message ? ` · ${samples[0].message}` : ''}
                        </p>
                      </div>
                      {canManage && entry.status === 'triggered' && (
                        <button
                          type="button"
                          onClick={() => acknowledge(entry)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#44484f]/40 px-3 py-1.5 text-xs text-[#a8abb3] hover:text-[#f1f3fc]"
                        >
                          <LuCircleCheck className="w-3.5 h-3.5" />
                          Acknowledge
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-[#0a0e14]/70 backdrop-blur-sm z-30"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-[#11161d] border-l border-[#44484f]/30 shadow-[-15px_0_40px_rgba(0,0,0,0.6)] transform transition-transform duration-300 ease-in-out flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-[#44484f]/25">
          <h2 className="font-headline text-xl font-bold text-[#f1f3fc]">
            {editingRuleId ? 'Edit Alert Rule' : 'Create New Alert'}
          </h2>
          <button type="button" onClick={() => setIsPanelOpen(false)} className="p-1.5 text-[#7f8594] hover:text-[#f1f3fc] rounded-md">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {formError && <p className="text-sm text-[#fca5a5]">{formError}</p>}
          {revealedSecret && (
            <div className="rounded-lg border border-[#00eefc]/30 bg-[#00eefc]/10 p-3 text-xs text-[#d7fbff]">
              <p className="font-semibold mb-1">Webhook signing secret</p>
              <p className="font-mono break-all">{revealedSecret}</p>
              <p className="mt-2 text-[#a8abb3]">Owners and admins can see this again on the rule. It signs the `X-LogLogic-Signature` header.</p>
            </div>
          )}

          <label className="block text-sm text-[#a8abb3]">
            Rule name
            <input
              className="mt-1.5 w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 outline-none focus:border-[#8ff5ff]"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            />
          </label>

          <div className="bg-[#0a0e14] border border-[#44484f]/30 rounded-xl p-5 flex flex-wrap items-center gap-3 font-mono text-sm">
            <span className="text-[#8ff5ff] font-bold">IF</span>
            <select className="bg-[#11161d] border border-[#44484f]/50 rounded-md px-2 py-1" value={formData.level} onChange={(event) => setFormData({ ...formData, level: event.target.value })}>
              <option value="ERROR">ERROR</option>
              <option value="FATAL">FATAL</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
            </select>
            <span className="text-[#7f8594]">in</span>
            <select className="bg-[#11161d] border border-[#44484f]/50 rounded-md px-2 py-1" value={formData.service} onChange={(event) => setFormData({ ...formData, service: event.target.value })}>
              <option value="">All services</option>
              {services.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            <span className="text-[#8ff5ff] font-bold">exceeds</span>
            <input
              type="number"
              min="1"
              className="bg-[#11161d] border border-[#44484f]/50 text-[#00eefc] rounded-md px-2 py-1 w-20 text-center"
              value={formData.threshold_count}
              onChange={(event) => setFormData({ ...formData, threshold_count: Number(event.target.value) })}
            />
            <span className="text-[#7f8594]">in</span>
            <select className="bg-[#11161d] border border-[#44484f]/50 rounded-md px-2 py-1" value={formData.time_window_minutes} onChange={(event) => setFormData({ ...formData, time_window_minutes: Number(event.target.value) })}>
              <option value={1}>1 min</option>
              <option value={5}>5 min</option>
              <option value={15}>15 min</option>
              <option value={60}>1 hour</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-[#a8abb3]">
              <input type="checkbox" checked={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.checked })} />
              Email owners and admins
            </label>
            <label className="block text-sm text-[#a8abb3]">
              Also send to
              <select
                className="mt-1.5 w-full bg-[#0a0e14] border border-[#44484f]/40 rounded-lg p-2.5"
                value={formData.destination}
                onChange={(event) => setFormData({ ...formData, destination: event.target.value })}
              >
                <option value="none">Email only</option>
                <option value="slack">Slack incoming webhook</option>
                <option value="webhook">Generic webhook (HMAC)</option>
              </select>
            </label>
            {formData.destination !== 'none' && (
              <input
                type="url"
                placeholder={formData.destination === 'slack' ? 'https://hooks.slack.com/services/...' : 'https://example.com/hooks/loglogic'}
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 font-mono outline-none focus:border-[#8ff5ff]"
                value={formData.webhook_url}
                onChange={(event) => setFormData({ ...formData, webhook_url: event.target.value })}
              />
            )}

            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="block text-sm text-[#a8abb3]">Route to integrations</span>
                <button type="button" onClick={() => navigate('/app/integrations')} className="text-xs text-[#8ff5ff] hover:underline">Manage</button>
              </div>
              {integrations.length === 0 ? (
                <p className="text-xs text-[#7f8594] mt-1.5">No integrations connected yet. Connect Slack, PagerDuty, a webhook and more on the Integrations page.</p>
              ) : (
                <div className="mt-2 space-y-1.5 max-h-44 overflow-auto custom-scrollbar">
                  {integrations.map((integration) => {
                    const checked = formData.integration_ids.includes(integration.id);
                    return (
                      <label key={integration.id} className="flex items-center gap-2 text-sm text-[#f1f3fc] rounded-md border border-[#44484f]/30 bg-[#0a0e14] px-3 py-2 cursor-pointer hover:border-[#8ff5ff]/30">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            const next = event.target.checked
                              ? [...formData.integration_ids, integration.id]
                              : formData.integration_ids.filter((id) => id !== integration.id);
                            setFormData({ ...formData, integration_ids: next });
                          }}
                        />
                        <span className="flex-1 truncate">{integration.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-[#7f8594]">{integration.type}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#44484f]/25 p-5 flex justify-end gap-3">
          <button type="button" onClick={() => setIsPanelOpen(false)} className="px-5 py-2 text-sm text-[#a8abb3]">Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving || !canManage} className="px-6 py-2 bg-[#00eefc] hover:bg-[#8ff5ff] text-[#0a0e14] text-sm font-bold rounded-lg disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}
