import React, { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getApiKeys } from '../api/apiKey'
import { getLogStats } from '../api/logs'
import { getBilling } from '../api/billing'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  FiCalendar,
  FiChevronDown,
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiLogOut,
  FiSearch,
  FiUsers,
  FiKey,
  FiRefreshCw,
  FiActivity
} from 'react-icons/fi'

const defaultVolumeData = [
  { time: '00:00', INFO: 0, ERROR: 0 },
  { time: '04:00', INFO: 0, ERROR: 0 },
  { time: '08:00', INFO: 0, ERROR: 0 },
  { time: '12:00', INFO: 0, ERROR: 0 },
  { time: '16:00', INFO: 0, ERROR: 0 },
  { time: '20:00', INFO: 0, ERROR: 0 },
  { time: 'Now', INFO: 0, ERROR: 0 },
]

const recentAlerts = [
  {
    time: 'Live',
    threshold: 'Continuous monitoring active across registered microservices',
    type: 'Status'
  },
  {
    time: 'Buffer',
    threshold: 'High-throughput stream buffer draining to MongoDB Data Lake',
    type: 'Pipeline'
  }
]

const DashboardPage = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const outletContext = useOutletContext() || {}
  const { user, organizations = [], currentOrg } = outletContext
  const [profile, setProfile] = useState(null)
  const [apiKeys, setApiKeys] = useState([])
  const [keysLoading, setKeysLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [quota, setQuota] = useState({ written: 0, limit: null, loaded: false })

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(data)
          }
        })
    }
  }, [user])

  const activeOrgId = currentOrg?.id || (organizations.length > 0 ? organizations[0].id : null);
  const currentOrgName = currentOrg?.name || (organizations.length > 0 ? organizations[0].name : 'Workspace');

  const fetchDashboardData = () => {
    if (!activeOrgId) return;

    setKeysLoading(true);
    getApiKeys(activeOrgId)
      .then((data) => {
        setApiKeys(data.keys || [])
      })
      .catch((err) => console.error("Error loading API keys on dashboard:", err))
      .finally(() => setKeysLoading(false));

    setStatsLoading(true);
    getLogStats({ orgId: activeOrgId, timeRange: '24h' })
      .then((data) => {
        setStats(data)
      })
      .catch((err) => console.error("Error loading log stats:", err))
      .finally(() => setStatsLoading(false));

    getBilling(activeOrgId)
      .then((data) => {
        setQuota({
          written: data?.usage?.written || 0,
          limit: data?.usage?.limit ?? null,
          loaded: true
        })
      })
      .catch((err) => {
        console.error("Error loading plan quota:", err)
        setQuota((current) => ({ ...current, loaded: true }))
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeOrgId]);

  const activeKey = apiKeys.find((k) => k.is_active !== false) || apiKeys[0];
  const maskedApiKey = activeKey?.key_hint
    ? `ll_prod_••••••••${activeKey.key_hint.replace(/^\.\.\./, '')}`
    : activeKey
    ? 'll_prod_••••••••••••'
    : 'No active key';

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Operator';

  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user?.email ? user.email.substring(0, 2).toUpperCase() : 'AK';

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const periodLogs = quota.written || 0;
  const usageLimit = quota.limit;
  const usagePercent = useMemo(() => {
    if (!usageLimit) return 0;
    return Math.round((periodLogs / usageLimit) * 100) || 0;
  }, [periodLogs, usageLimit]);
  const usageBarClass = usagePercent > 80
    ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
    : 'bg-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.35)]';

  const errorCount = (stats?.countsByLevel?.error || 0) + (stats?.countsByLevel?.fatal || 0);
  const errorRate = stats?.errorRate !== undefined ? `${stats.errorRate}%` : '0.00%';

  const volumeData = (stats?.volumeTimeline && stats.volumeTimeline.length > 0)
    ? stats.volumeTimeline
    : defaultVolumeData;

  const errorTrendData = (stats?.volumeTimeline && stats.volumeTimeline.length > 0)
    ? stats.volumeTimeline.map(item => ({ value: item.ERROR || 0 }))
    : [{ value: 0 }, { value: 0 }];

  const handleCopyKeyHint = async () => {
    if (!activeKey) return;
    try {
      await navigator.clipboard.writeText(maskedApiKey)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error.message)
      return
    }
    localStorage.removeItem('loglogic_auth')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-background text-on-surface cyber-grid">
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      <header className="sticky top-0 z-30 border-b border-[#44484f]/20 bg-[#0a0e14]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <p className="text-sm text-[#a8abb3]"><span className="text-[#8ff5ff] font-medium">{currentOrgName}</span> / Dashboard</p>
          </div>

          <button 
            onClick={() => navigate('/app/logs')}
            className="flex min-w-55 items-center justify-between gap-3 rounded-lg border border-[#44484f]/30 bg-[#11161d] px-3 py-2 text-sm text-[#a8abb3] hover:border-[#8ff5ff]/40 hover:text-white transition-colors cursor-pointer" type="button"
          >
            <span className="flex items-center gap-2">
              <FiSearch className="text-[#7f8594]" />
              Search logs
            </span>
            <span className="rounded-md border border-[#44484f]/50 px-2 py-0.5 text-xs text-[#7f8594]">Cmd+K</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              title="Refresh Analytics"
              className="p-2 rounded-lg border border-[#44484f]/30 bg-[#11161d] text-[#a8abb3] hover:text-[#8ff5ff] hover:border-[#8ff5ff]/40 transition-colors cursor-pointer"
            >
              <FiRefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin text-[#8ff5ff]' : ''}`} />
            </button>

            <div className="relative">
              <button className="flex items-center gap-2 rounded-full border border-[#44484f]/40 bg-[#11161d] p-1.5 hover:border-[#8ff5ff]/40 transition-colors cursor-pointer" onClick={() => setMenuOpen((open) => !open)} type="button">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover border border-[#44484f]/30" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a2027] text-xs font-semibold text-[#f1f3fc]">{initials}</div>
                )}
                <FiChevronDown className="text-[#a8abb3]" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#44484f]/40 bg-[#11161d] p-2 shadow-xl z-50">
                  <div className="px-3 py-1.5 border-b border-[#44484f]/25 mb-1.5">
                    <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-[#a8abb3] truncate">{user?.email}</p>
                  </div>
                  <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#f1f3fc] hover:bg-[#1a2027] cursor-pointer" onClick={handleSignOut} type="button">
                    <FiLogOut />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <section className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-white">Overview</h1>
            <p className="text-sm text-[#a8abb3] mt-1">Real-time telemetry and error rate monitoring</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-4 py-2 text-sm text-[#8ff5ff] hover:bg-[#00eefc]/20" type="button">
            <FiCalendar className="text-[#8ff5ff]" />
            Last 24 Hours
          </button>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <p className="text-xs uppercase tracking-widest text-[#7f8594]">Total Ingested</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {!quota.loaded ? '...' : `${periodLogs.toLocaleString()} / ${usageLimit == null ? 'unlimited' : usageLimit.toLocaleString()} logs`}
            </p>
            <p className="mt-1 text-sm text-[#a8abb3]">Logs in this billing period</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1a2027]">
              <div className={`h-2 ${usageBarClass}`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#a8abb3]">{usagePercent}% of monthly quota</p>
          </article>

          <article className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <p className="text-xs uppercase tracking-widest text-[#7f8594]">Error Pulse</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-semibold text-[#f87171]">{statsLoading ? '...' : errorCount.toLocaleString()}</p>
              <p className="text-sm text-[#fca5a5] font-medium">{statsLoading ? '' : `Error Rate: ${errorRate}`}</p>
            </div>
            <p className="mt-1 text-sm text-[#a8abb3]">ERROR / CRITICAL logs in 24h</p>
            <div className="mt-4 h-14 w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                <LineChart data={errorTrendData}>
                  <Line dataKey="value" dot={false} stroke="#f87171" strokeWidth={2.25} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)] flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#7f8594]">Active Integration</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {activeKey ? (activeKey.name || 'Primary API Key') : 'Primary API Key'}
              </p>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-[#44484f]/35 bg-[#0a0e14] px-3 py-2">
                <span className="font-mono text-xs text-[#f1f3fc] truncate mr-2">
                  {keysLoading ? 'Loading keys...' : maskedApiKey}
                </span>
                {activeKey && (
                  <button 
                    className="rounded-md border border-[#44484f]/40 p-1.5 text-[#a8abb3] hover:border-[#8ff5ff]/40 hover:text-[#8ff5ff] transition-colors cursor-pointer" 
                    onClick={handleCopyKeyHint} 
                    type="button"
                    title="Copy Key Hint"
                  >
                    {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-[#a8abb3]">
                {copied ? 'Copied key hint to clipboard' : activeKey ? 'Active key identifier' : 'No active API key generated yet'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#44484f]/20 flex justify-end">
              <Link 
                to="/app/settings" 
                className="inline-flex items-center gap-1.5 text-xs text-[#8ff5ff] hover:underline"
              >
                <FiKey className="w-3.5 h-3.5" />
                {activeKey ? 'Manage API Keys' : 'Generate Key in Settings'} &rarr;
              </Link>
            </div>
          </article>
        </section>

        <section className="mb-8 rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 md:p-6 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold text-white">Log Ingestion Timeline</h2>
              <p className="text-xs text-[#a8abb3] mt-0.5">Time-series breakdown of telemetry stream</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#a8abb3]">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />INFO</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f87171]" />ERROR</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={1}>
              <AreaChart data={volumeData} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#2a3441" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#7f8594" tickLine={false} axisLine={false} />
                <YAxis stroke="#7f8594" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11161d', border: '1px solid #44484f', borderRadius: '10px' }}
                  itemStyle={{ color: '#f1f3fc' }}
                  labelStyle={{ color: '#a8abb3' }}
                />
                <Area dataKey="INFO" stackId="1" type="monotone" stroke="#22c55e" fill="#22c55e" fillOpacity={0.28} />
                <Area dataKey="ERROR" stackId="1" type="monotone" stroke="#f87171" fill="#f87171" fillOpacity={0.32} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 md:col-span-2 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-2xl font-bold text-white">Active Microservices</h2>
              <span className="text-xs text-[#8ff5ff] font-mono">{stats?.topServices?.length || 0} reporting services</span>
            </div>
            <div className="space-y-3">
              {stats?.topServices && stats.topServices.length > 0 ? (
                stats.topServices.map((svc) => (
                  <div className="rounded-xl border border-[#44484f]/30 bg-[#0a0e14] p-4 flex items-center justify-between" key={svc.service}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#00eefc]/10 border border-[#8ff5ff]/20 flex items-center justify-center text-[#8ff5ff]">
                        <FiActivity className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold text-white">{svc.service}</p>
                        <p className="text-xs text-[#a8abb3]">Emitting active telemetry</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#8ff5ff] bg-[#11161d] px-3 py-1.5 rounded-lg border border-[#44484f]/40">
                      {svc.count.toLocaleString()} logs
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-[#44484f]/30 bg-[#0a0e14] p-6 text-center">
                  <p className="text-sm text-[#a8abb3]">No active microservices logged yet in this window.</p>
                  <p className="text-xs text-[#7f8594] mt-1">Connect your applications using an API key from Settings to start tracking microservices.</p>
                </div>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="font-headline text-2xl font-bold text-white">Quick Links</h2>
            <div className="mt-5 space-y-3">
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40 transition-colors" to="/app/live">
                Jump to Live Tail
                <FiExternalLink className="text-[#7f8594]" />
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40 transition-colors" to="/app/logs">
                Search Historical Logs
                <FiSearch className="text-[#7f8594]" />
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40 transition-colors" to="/app/settings">
                Organization Settings & Keys
                <FiExternalLink className="text-[#7f8594]" />
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40 transition-colors" to="/app/integrations">
                Integrations & Webhooks
                <FiExternalLink className="text-[#7f8594]" />
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40 transition-colors" to="/app/incidents">
                Incident Timeline
                <FiExternalLink className="text-[#7f8594]" />
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40 transition-colors" to="/docs">
                View API Documentation
                <FiExternalLink className="text-[#7f8594]" />
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
