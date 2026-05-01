import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  FiExternalLink,
  FiLogOut,
  FiSearch,
  FiUsers,
} from 'react-icons/fi'

const volumeData = [
  { time: '00:00', INFO: 10420, ERROR: 420 },
  { time: '03:00', INFO: 13280, ERROR: 510 },
  { time: '06:00', INFO: 11860, ERROR: 470 },
  { time: '09:00', INFO: 15600, ERROR: 730 },
  { time: '12:00', INFO: 18810, ERROR: 980 },
  { time: '15:00', INFO: 17540, ERROR: 860 },
  { time: '18:00', INFO: 16230, ERROR: 790 },
  { time: '21:00', INFO: 14890, ERROR: 640 },
]

const errorTrendData = [
  { value: 28 },
  { value: 30 },
  { value: 26 },
  { value: 33 },
  { value: 37 },
  { value: 35 },
  { value: 39 },
  { value: 42 },
  { value: 41 },
]

const recentAlerts = [
  {
    time: '2 min ago',
    threshold: 'ERROR spike > 120 events / 5 min in auth-service',
  },
  {
    time: '16 min ago',
    threshold: 'p95 latency anomaly detected in ingest-worker (> 230ms)',
  },
  {
    time: '42 min ago',
    threshold: 'Unhandled exception ratio exceeded 3% in billing-service',
  },
]

const DashboardPage = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const usageCurrent = 842010
  const usageLimit = 1000000
  const usagePercent = useMemo(() => Math.round((usageCurrent / usageLimit) * 100), [usageCurrent, usageLimit])
  const usageBarClass = usagePercent > 80
    ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
    : 'bg-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.35)]'

  const errorCount = 1384
  const errorChange = '+12% from yesterday'

  const maskedApiKey = 'log_live_••••••••••'
  const fullApiKey = 'log_live_26E5F92A2C98BD6FA103'

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(fullApiKey)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('loglogic_auth')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background text-on-surface cyber-grid">
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      <header className="sticky top-0 z-30 border-b border-[#44484f]/20 bg-[#0a0e14]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm text-[#a8abb3]"><span className="text-[#8ff5ff] font-medium">Acme Corp</span> / Dashboard</p>
          </div>

          <button 
            onClick={() => navigate('/app/logs')}
            className="flex min-w-55 items-center justify-between gap-3 rounded-lg border border-[#44484f]/30 bg-[#11161d] px-3 py-2 text-sm text-[#a8abb3] hover:border-[#8ff5ff]/40 hover:text-white transition-colors" type="button"
          >
            <span className="flex items-center gap-2">
              <FiSearch className="text-[#7f8594]" />
              Search logs
            </span>
            <span className="rounded-md border border-[#44484f]/50 px-2 py-0.5 text-xs text-[#7f8594]">Cmd+K</span>
          </button>

          <div className="relative">
            <button className="flex items-center gap-2 rounded-full border border-[#44484f]/40 bg-[#11161d] px-2 py-1.5 hover:border-[#8ff5ff]/40 transition-colors" onClick={() => setMenuOpen((open) => !open)} type="button">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a2027] text-xs font-semibold text-[#f1f3fc]">AK</div>
              <FiChevronDown className="text-[#a8abb3]" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#44484f]/40 bg-[#11161d] p-2 shadow-xl">
                <p className="px-3 py-2 text-sm text-[#a8abb3]">alex@acme.io</p>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#f1f3fc] hover:bg-[#1a2027]" onClick={handleSignOut} type="button">
                  <FiLogOut />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <section className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-white">Overview</h1>
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-4 py-2 text-sm text-[#8ff5ff] hover:bg-[#00eefc]/20" type="button">
            <FiCalendar className="text-[#8ff5ff]" />
            Last 24 Hours
          </button>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <p className="text-xs uppercase tracking-widest text-[#7f8594]">Usage Quota</p>
            <p className="mt-3 text-2xl font-semibold text-white">{usageCurrent.toLocaleString()} / {usageLimit.toLocaleString()} logs</p>
            <p className="mt-1 text-sm text-[#a8abb3]">Monthly ingestion usage</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1a2027]">
              <div className={`h-2 ${usageBarClass}`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#a8abb3]">{usagePercent}% of plan capacity</p>
          </article>

          <article className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <p className="text-xs uppercase tracking-widest text-[#7f8594]">Error Pulse</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-semibold text-[#f87171]">{errorCount.toLocaleString()}</p>
              <p className="text-sm text-[#fca5a5]">{errorChange}</p>
            </div>
            <p className="mt-1 text-sm text-[#a8abb3]">ERROR logs in the last 24h</p>
            <div className="mt-4 h-14 w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                <LineChart data={errorTrendData}>
                  <Line dataKey="value" dot={false} stroke="#f87171" strokeWidth={2.25} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <p className="text-xs uppercase tracking-widest text-[#7f8594]">Active Integration</p>
            <p className="mt-3 text-2xl font-semibold text-white">Primary API Key</p>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-[#44484f]/35 bg-[#0a0e14] px-3 py-2">
              <span className="font-mono text-sm text-[#f1f3fc]">{maskedApiKey}</span>
              <button className="rounded-md border border-[#44484f]/40 p-1.5 text-[#a8abb3] hover:border-[#8ff5ff]/40 hover:text-[#8ff5ff]" onClick={handleCopyKey} type="button">
                <FiCopy />
              </button>
            </div>
            <p className="mt-2 text-xs text-[#a8abb3]">{copied ? 'Copied to clipboard' : 'Click icon to copy key'}</p>
          </article>
        </section>

        <section className="mb-8 rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 md:p-6 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold text-white">Log Volume</h2>
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
            <h2 className="font-headline text-2xl font-bold text-white">Recent Alerts</h2>
            <div className="mt-5 space-y-3">
              {recentAlerts.map((alert) => (
                <div className="rounded-xl border border-[#44484f]/30 bg-[#0a0e14] p-4" key={alert.time}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-[#7f8594]">{alert.time}</p>
                    <span className="rounded-full border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-2 py-1 text-xs text-[#8ff5ff]">Slack</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#f1f3fc]">{alert.threshold}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#44484f]/25 bg-[#11161d] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="font-headline text-2xl font-bold text-white">Quick Links</h2>
            <div className="mt-5 space-y-3">
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40" to="/app/live">
                Jump to Live Tail
                <FiExternalLink className="text-[#7f8594]" />
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40" to="/app/logs">
                Search Historical Logs
                <FiSearch className="text-[#7f8594]" />
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40" to="/app/alerts">
                Manage Alert Rules
                <FiExternalLink className="text-[#7f8594]" />
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40" to="/docs">
                View API Documentation
                <FiExternalLink className="text-[#7f8594]" />
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40" to="/app/settings">
                Organization Settings
                <FiExternalLink className="text-[#7f8594]" />
              </Link>
              <button className="flex w-full items-center justify-between rounded-lg border border-[#44484f]/40 bg-[#0a0e14] px-3 py-2 text-sm text-[#f1f3fc] hover:border-[#8ff5ff]/40" type="button">
                Invite Team Members
                <FiUsers className="text-[#7f8594]" />
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
