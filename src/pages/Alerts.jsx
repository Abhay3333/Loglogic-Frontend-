import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LuInfo
} from 'react-icons/lu';
import { FaSlack, FaDiscord } from 'react-icons/fa';

// Mock Data
const MOCK_RULES = [
  {
    id: 'rule-1',
    name: 'Critical Payment API Failures',
    description: 'Alerts when Stripe API or internal payment logic fails frequently.',
    condition: { level: 'ERROR', service: 'payment-api', threshold: 50, window: '5 mins' },
    destination: { type: 'slack', url: 'https://hooks.slack.com/services/T000.../B000.../XXX' },
    isActive: true,
    lastTriggered: '10 mins ago'
  },
  {
    id: 'rule-2',
    name: 'High Latency in Ingest Worker',
    description: 'Monitors processing delay in the log ingestion queue.',
    condition: { level: 'WARN', service: 'ingest-worker', threshold: 100, window: '15 mins' },
    destination: { type: 'discord', url: 'https://discord.com/api/webhooks/123.../YYY' },
    isActive: false,
    lastTriggered: 'Yesterday'
  },
  {
    id: 'rule-3',
    name: 'Auth Anomalies',
    description: 'Detects unusual spikes in login failures.',
    condition: { level: 'ERROR', service: 'auth-service', threshold: 20, window: '1 min' },
    destination: { type: 'slack', url: 'https://hooks.slack.com/services/T000.../B000.../ZZZ' },
    isActive: true,
    lastTriggered: 'Never'
  }
];

// Helper: Toggle Switch Component
const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8ff5ff] focus:ring-offset-2 focus:ring-offset-[#0a0e14] ${
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
  const [rules, setRules] = useState(MOCK_RULES);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'ERROR',
    service: 'payment-api',
    threshold: 50,
    window: '5 mins',
    webhookUrl: ''
  });
  
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState(null); // null | 'success' | 'error'
  const [webhookError, setWebhookError] = useState(false);

  const openBuilder = (rule = null) => {
    if (rule) {
      setEditingRuleId(rule.id);
      setFormData({
        name: rule.name,
        description: rule.description,
        level: rule.condition.level,
        service: rule.condition.service,
        threshold: rule.condition.threshold,
        window: rule.condition.window,
        webhookUrl: rule.destination.url
      });
    } else {
      setEditingRuleId(null);
      setFormData({
        name: '',
        description: '',
        level: 'ERROR',
        service: 'payment-api',
        threshold: 50,
        window: '5 mins',
        webhookUrl: ''
      });
    }
    setWebhookTestStatus(null);
    setWebhookError(false);
    setIsPanelOpen(true);
  };

  const toggleRuleActive = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const deleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return url.includes('slack.com') || url.includes('discord.com') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleTestWebhook = () => {
    if (!validateUrl(formData.webhookUrl)) {
      setWebhookError(true);
      return;
    }
    setWebhookError(false);
    setIsTestingWebhook(true);
    setWebhookTestStatus(null);
    
    // Mock network request
    setTimeout(() => {
      setIsTestingWebhook(false);
      setWebhookTestStatus('success');
    }, 1000);
  };

  const handleSave = () => {
    if (!formData.name || !validateUrl(formData.webhookUrl)) {
      if (!validateUrl(formData.webhookUrl)) setWebhookError(true);
      return;
    }

    const destType = formData.webhookUrl.includes('discord') ? 'discord' : formData.webhookUrl.includes('slack') ? 'slack' : 'webhook';

    const newRule = {
      id: editingRuleId || `rule-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      condition: {
        level: formData.level,
        service: formData.service,
        threshold: formData.threshold,
        window: formData.window
      },
      destination: { type: destType, url: formData.webhookUrl },
      isActive: true,
      lastTriggered: 'Never'
    };

    if (editingRuleId) {
      setRules(rules.map(r => r.id === editingRuleId ? newRule : r));
    } else {
      setRules([...rules, newRule]);
    }
    setIsPanelOpen(false);
  };

  const maskUrl = (url) => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      return `${parsed.origin}/.../${url.slice(-8)}`;
    } catch {
      return url.length > 20 ? `${url.substring(0, 15)}...` : url;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0e14] text-[#f1f3fc] font-sans overflow-hidden cyber-grid">
      
      {/* 1. Header & Overview Bar */}
      <header className="flex-none bg-[#0a0e14]/95 backdrop-blur border-b border-[#44484f]/20 p-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/app/dashboard')}
              className="p-1.5 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors"
              title="Back to Dashboard"
            >
              <LuArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-headline font-bold text-[#f1f3fc] flex items-center gap-2">
                <LuBell className="w-6 h-6 text-[#8ff5ff]" />
                Alert Rules
              </h1>
              <p className="text-sm text-[#a8abb3] mt-1">
                Configure automated webhooks when log thresholds are exceeded.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs uppercase tracking-widest text-[#7f8594]">Usage</span>
              <span className="text-sm font-medium text-[#a8abb3]">
                Active Rules: <span className="text-[#f1f3fc]">{rules.filter(r => r.isActive).length}</span> / 10
              </span>
            </div>
            <button
              onClick={() => openBuilder()}
              disabled={rules.filter(r => r.isActive).length >= 10}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00eefc] px-4 py-2 text-sm font-semibold text-[#0a0e14] hover:bg-[#8ff5ff] transition-all shadow-[0_0_15px_rgba(0,238,252,0.3)] disabled:opacity-50 disabled:shadow-none"
            >
              <LuPlus className="w-4 h-4" />
              Create New Alert
            </button>
          </div>
        </div>
      </header>

      {/* 2. "Active Rules" List */}
      <main className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-4">
          
          {rules.length === 0 ? (
            <div className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-12 text-center shadow-[0_0_20px_rgba(0,0,0,0.2)]">
              <LuBell className="w-10 h-10 mx-auto text-[#44484f] mb-4" />
              <h3 className="text-lg font-medium text-[#f1f3fc]">No alert rules configured</h3>
              <p className="text-[#a8abb3] mt-2 mb-6 max-w-sm mx-auto">Get notified immediately when critical errors or anomalies occur in your systems.</p>
              <button
                onClick={() => openBuilder()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-4 py-2 text-sm font-medium text-[#8ff5ff] hover:bg-[#00eefc]/20 transition-colors"
              >
                <LuPlus className="w-4 h-4" /> Create your first rule
              </button>
            </div>
          ) : (
            rules.map((rule) => (
              <div 
                key={rule.id} 
                className="rounded-xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_15px_rgba(0,0,0,0.15)] hover:border-[#44484f]/50 transition-colors flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-[#f1f3fc]">{rule.name}</h3>
                    <span className="text-xs text-[#7f8594] font-mono bg-[#0a0e14] px-2 py-0.5 rounded border border-[#44484f]/30">
                      Last Triggered: {rule.lastTriggered}
                    </span>
                  </div>
                  <p className="text-sm text-[#a8abb3] mb-3">{rule.description}</p>
                  
                  {/* Condition Badge */}
                  <div className="inline-flex items-center gap-2 bg-[#0a0e14] border border-[#44484f]/40 rounded-lg px-3 py-1.5 text-sm font-mono text-[#f1f3fc]">
                    <span className="text-[#8ff5ff]">IF</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      rule.condition.level === 'ERROR' ? 'bg-[#f87171]/20 text-[#f87171]' : 
                      rule.condition.level === 'WARN' ? 'bg-amber-400/20 text-amber-400' : 'bg-[#22c55e]/20 text-[#22c55e]'
                    }`}>
                      {rule.condition.level}
                    </span>
                    <span className="text-[#8ff5ff]">&gt;</span>
                    <span className="font-bold">{rule.condition.threshold}</span>
                    <span className="text-[#7f8594]">in</span>
                    <span className="text-[#a8abb3]">{rule.condition.window}</span>
                    {rule.condition.service !== 'All Services' && (
                      <>
                        <span className="text-[#7f8594]">in</span>
                        <span className="text-[#a8abb3]">{rule.condition.service}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Destination & Actions */}
                <div className="flex items-center gap-6 w-full md:w-auto md:justify-end border-t border-[#44484f]/20 md:border-t-0 pt-4 md:pt-0">
                  
                  {/* Webhook Dest */}
                  <div className="flex items-center gap-2 text-sm text-[#a8abb3] bg-[#0a0e14] px-3 py-1.5 rounded-lg border border-[#44484f]/30">
                    {rule.destination.type === 'slack' ? <FaSlack className="text-[#e01e5a] w-4 h-4" /> : 
                     rule.destination.type === 'discord' ? <FaDiscord className="text-[#5865F2] w-4 h-4" /> : 
                     <LuWebhook className="text-[#8ff5ff] w-4 h-4" />}
                    <span className="font-mono text-xs hidden sm:inline-block">{maskUrl(rule.destination.url)}</span>
                  </div>

                  {/* Toggle */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium uppercase tracking-wider ${rule.isActive ? 'text-[#00eefc]' : 'text-[#7f8594]'}`}>
                      {rule.isActive ? 'Active' : 'Paused'}
                    </span>
                    <Toggle enabled={rule.isActive} onChange={() => toggleRuleActive(rule.id)} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openBuilder(rule)}
                      className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors"
                      title="Edit Rule"
                    >
                      <LuPen className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 text-[#7f8594] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-md transition-colors"
                      title="Delete Rule"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* 3. "Create Rule" Slide-over */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-[#0a0e14]/70 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-[#11161d] border-l border-[#44484f]/30 shadow-[-15px_0_40px_rgba(0,0,0,0.6)] transform transition-transform duration-300 ease-in-out flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#44484f]/25 bg-[#11161d]">
          <h2 className="font-headline text-xl font-bold text-[#f1f3fc]">
            {editingRuleId ? 'Edit Alert Rule' : 'Create New Alert'}
          </h2>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="p-1.5 text-[#7f8594] hover:text-[#f1f3fc] hover:bg-[#1a2027] rounded-md transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section A: Alert Details */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#f1f3fc] uppercase tracking-widest mb-1">A. Alert Details</h3>
              <p className="text-xs text-[#a8abb3] mb-4">Basic information to identify this rule.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a8abb3] mb-1.5">Rule Name *</label>
              <input
                type="text"
                placeholder="e.g., API Rate Limit Exceeded"
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] block p-2.5 outline-none transition-colors"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a8abb3] mb-1.5">Description (Optional)</label>
              <textarea
                rows="2"
                placeholder="What does this alert mean?"
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] block p-2.5 outline-none transition-colors custom-scrollbar resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </section>

          <hr className="border-[#44484f]/20" />

          {/* Section B: Natural Language Builder */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#f1f3fc] uppercase tracking-widest mb-1">B. Trigger Condition</h3>
              <p className="text-xs text-[#a8abb3] mb-4">Define when this alert should fire using the builder below.</p>
            </div>

            <div className="bg-[#0a0e14] border border-[#44484f]/30 rounded-xl p-5 shadow-inner flex flex-wrap items-center gap-3 leading-loose font-mono text-sm">
              <span className="text-[#8ff5ff] font-bold">IF</span>
              
              <select 
                className="bg-[#11161d] border border-[#44484f]/50 text-[#f1f3fc] rounded-md px-2 py-1 outline-none focus:border-[#00eefc] cursor-pointer"
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
              >
                <option value="ERROR">ERROR</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
              </select>

              <span className="text-[#7f8594]">logs IN</span>

              <select 
                className="bg-[#11161d] border border-[#44484f]/50 text-[#f1f3fc] rounded-md px-2 py-1 outline-none focus:border-[#00eefc] cursor-pointer"
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
              >
                <option value="All Services">All Services</option>
                <option value="payment-api">payment-api</option>
                <option value="auth-worker">auth-worker</option>
                <option value="user-service">user-service</option>
                <option value="ingest-worker">ingest-worker</option>
              </select>

              <span className="text-[#8ff5ff] font-bold">EXCEEDS</span>

              <input 
                type="number" 
                min="1"
                className="bg-[#11161d] border border-[#44484f]/50 text-[#00eefc] font-bold rounded-md px-2 py-1 w-20 outline-none focus:border-[#00eefc] text-center"
                value={formData.threshold}
                onChange={(e) => setFormData({...formData, threshold: parseInt(e.target.value) || 0})}
              />

              <span className="text-[#7f8594]">occurrences WITHIN</span>

              <select 
                className="bg-[#11161d] border border-[#44484f]/50 text-[#f1f3fc] rounded-md px-2 py-1 outline-none focus:border-[#00eefc] cursor-pointer"
                value={formData.window}
                onChange={(e) => setFormData({...formData, window: e.target.value})}
              >
                <option value="1 min">1 min</option>
                <option value="5 mins">5 mins</option>
                <option value="15 mins">15 mins</option>
                <option value="1 hour">1 hour</option>
              </select>
            </div>
          </section>

          <hr className="border-[#44484f]/20" />

          {/* Section C: Action & Destination */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#f1f3fc] uppercase tracking-widest mb-1">C. Destination</h3>
              <p className="text-xs text-[#a8abb3] mb-4">Where should we send the JSON payload?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a8abb3] mb-1.5 flex items-center gap-2">
                <LuWebhook className="w-4 h-4 text-[#8ff5ff]" />
                Webhook URL (Slack, Discord, or Custom) *
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  className={`flex-1 bg-[#0a0e14] border ${webhookError ? 'border-[#f87171] focus:ring-[#f87171]' : 'border-[#44484f]/40 focus:border-[#8ff5ff] focus:ring-[#8ff5ff]'} text-[#f1f3fc] text-sm rounded-lg focus:ring-1 block p-2.5 outline-none transition-colors font-mono`}
                  value={formData.webhookUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, webhookUrl: e.target.value });
                    setWebhookError(false);
                  }}
                />
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={!formData.webhookUrl || isTestingWebhook}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#44484f]/50 bg-[#1a2027] px-4 py-2 text-sm font-medium text-[#f1f3fc] hover:bg-[#252d3a] hover:border-[#8ff5ff]/40 transition-colors disabled:opacity-50"
                >
                  {isTestingWebhook ? (
                    <span className="w-4 h-4 border-2 border-[#a8abb3]/30 border-t-[#f1f3fc] rounded-full animate-spin" />
                  ) : (
                    <LuSend className="w-4 h-4 text-[#8ff5ff]" />
                  )}
                  Test
                </button>
              </div>
              {webhookError && (
                <p className="text-xs text-[#f87171] mt-1.5 flex items-center gap-1">
                  <LuCircleAlert className="w-3.5 h-3.5" /> Please enter a valid Webhook URL starting with https://
                </p>
              )}
              {webhookTestStatus === 'success' && (
                <p className="text-xs text-[#22c55e] mt-1.5 flex items-center gap-1">
                  <LuCircleCheck className="w-3.5 h-3.5" /> Test payload sent successfully!
                </p>
              )}
            </div>
            
            {/* Contextual helper for destination */}
            <div className="bg-[#00eefc]/5 border border-[#00eefc]/10 rounded-lg p-3 flex items-start gap-3 mt-4">
              <LuInfo className="w-5 h-5 text-[#00eefc] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#a8abb3] leading-relaxed">
                LogLogic will automatically detect Slack and Discord webhook URLs and format the message payload specifically for those platforms. For custom URLs, a standard JSON payload will be sent.
              </div>
            </div>
          </section>

        </div>

        {/* Sticky Footer */}
        <div className="border-t border-[#44484f]/25 bg-[#11161d] p-5 flex justify-end gap-3">
          <button
            onClick={() => setIsPanelOpen(false)}
            className="px-5 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#00eefc] hover:bg-[#8ff5ff] text-[#0a0e14] text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(0,238,252,0.3)] transition-all"
          >
            Save Rule
          </button>
        </div>
      </div>

    </div>
  );
}
