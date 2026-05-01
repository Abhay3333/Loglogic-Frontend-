import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiCopy,
  FiPause,
  FiPlay,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi'

const LEVELS = ['ERROR', 'WARN', 'INFO']
const SERVICES = ['api-gateway', 'auth-worker', 'billing-service', 'ingest-worker', 'socket-bridge']

const seedLogs = [
  {
    id: 1,
    timestamp: '14:12:03.109',
    level: 'INFO',
    service: 'api-gateway',
    message: 'Request accepted path=/v1/ingest status=202 latency_ms=14',
    meta: {
      request_id: 'req_8e3114',
      org_id: 'org_82a1',
      host: 'edge-01',
      method: 'POST',
      status: 202,
    },
  },
  {
    id: 2,
    timestamp: '14:12:03.338',
    level: 'WARN',
    service: 'auth-worker',
    message: 'JWT refresh drift detected for session sess_4af2 (delta=4s)',
    meta: {
      org_id: 'org_82a1',
      session_id: 'sess_4af2',
      worker: 'auth-worker-2',
      skew_seconds: 4,
    },
  },
  {
    id: 3,
    timestamp: '14:12:03.559',
    level: 'ERROR',
    service: 'billing-service',
    message: 'MongoWriteError E11000 duplicate key error on invoice_index',
    meta: {
      org_id: 'org_82a1',
      invoice_id: 'inv_22f90',
      duplicate_field: 'invoice_number',
      shard: 'mongo-shard-03',
      retryable: false,
      stack: 'MongoWriteError: E11000 duplicate key error collection billing.invoices index invoice_number dup key...',
    },
  },
]

const formatTimestamp = () => {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  const ms = String(now.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

const randomLevel = () => {
  const roll = Math.random()
  if (roll < 0.13) return 'ERROR'
  if (roll < 0.28) return 'WARN'
  return 'INFO'
}

const randomService = () => SERVICES[Math.floor(Math.random() * SERVICES.length)]

const messageByLevel = {
  INFO: [
    'WebSocket subscriber count updated shard=us-east-1 count=287',
    'Redis queue push accepted topic=logs:stream batch_size=25',
    'Python alert worker heartbeat ok cycle_ms=90',
    'Ingestion pipeline flush complete writes=124 errors=0',
  ],
  WARN: [
    'Queue depth rising on ingest-worker depth=1832 throttle=enabled',
    'Alert rule eval lag exceeded threshold lag_ms=240',
    'Retry budget approaching limit for webhook target=slack-main',
  ],
  ERROR: [
    'Unhandled exception in parser stage=normalize type=TypeError',
    'Redis timeout exceeded while reserving batch lock wait_ms=600',
    'Mongo transient transaction abort maxRetriesExceeded=true',
  ],
}

const getLevelPillClass = (level) => {
  if (level === 'ERROR') return 'bg-red-500/15 text-red-300 border border-red-500/30'
  if (level === 'WARN') return 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
  return 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
}

const serviceColorClass = (service) => {
  if (service.includes('auth')) return 'text-cyan-300'
  if (service.includes('billing')) return 'text-violet-300'
  if (service.includes('socket')) return 'text-teal-300'
  if (service.includes('api')) return 'text-sky-300'
  return 'text-emerald-300'
}

const JsonLine = ({ k, v }) => {
  const valueString = typeof v === 'string' ? `"${v}"` : JSON.stringify(v)
  return (
    <div className="font-mono text-xs leading-5">
      <span className="text-blue-300">"{k}"</span>
      <span className="text-zinc-500">: </span>
      <span className="text-emerald-300">{valueString}</span>
    </div>
  )
}

const LiveTailPage = () => {
  const feedRef = useRef(null)
  const nextIdRef = useRef(4)

  const [isStreaming, setIsStreaming] = useState(true)
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('All')
  const [serviceFilter, setServiceFilter] = useState('All')
  const [logs, setLogs] = useState(seedLogs)
  const [expandedId, setExpandedId] = useState(3)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    if (!isStreaming) return undefined

    const streamInterval = window.setInterval(() => {
      const level = randomLevel()
      const service = randomService()
      const templates = messageByLevel[level]
      const message = templates[Math.floor(Math.random() * templates.length)]

      const newLog = {
        id: nextIdRef.current,
        timestamp: formatTimestamp(),
        level,
        service,
        message,
        meta: {
          org_id: 'org_82a1',
          request_id: `req_${Math.random().toString(36).slice(2, 8)}`,
          host: `node-${Math.floor(Math.random() * 8) + 1}`,
          queue_depth: Math.floor(Math.random() * 4000),
          shard: `redis-${Math.floor(Math.random() * 3) + 1}`,
        },
      }

      nextIdRef.current += 1
      setLogs((prev) => [...prev.slice(-699), newLog])
    }, 140)

    return () => window.clearInterval(streamInterval)
  }, [isStreaming])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const levelMatch = levelFilter === 'All' || log.level === levelFilter
      const serviceMatch = serviceFilter === 'All' || log.service === serviceFilter
      const textMatch = !query || `${log.message} ${log.service} ${log.level}`.toLowerCase().includes(query.toLowerCase())
      return levelMatch && serviceMatch && textMatch
    })
  }, [logs, levelFilter, serviceFilter, query])

  useEffect(() => {
    if (!feedRef.current) return
    if (!isStreaming) return
    feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [filteredLogs, isStreaming])

  const clearTerminal = () => {
    setLogs([])
    setExpandedId(null)
  }

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const copyJson = async (id, meta) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(meta, null, 2))
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 1400)
    } catch {
      setCopiedId(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-425 flex-wrap items-center gap-2 px-4 py-2.5 md:gap-3">
          <button
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isStreaming
                ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-600'
                : 'border-emerald-600/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'
            }`}
            onClick={() => setIsStreaming((prev) => !prev)}
            type="button"
          >
            {isStreaming ? <FiPause /> : <FiPlay />}
            {isStreaming ? 'Pause Stream' : 'Resume Stream'}
          </button>

          <label className="relative min-w-70 flex-1">
            <FiSearch className="pointer-events-none absolute left-2.5 top-2 text-zinc-500" />
            <input
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-8 pr-16 text-xs text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter logs by text"
              value={query}
            />
            <span className="pointer-events-none absolute right-2.5 top-1.5 rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500">Cmd+F /</span>
          </label>

          <select
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-600"
            onChange={(event) => setLevelFilter(event.target.value)}
            value={levelFilter}
          >
            <option value="All">Log Level: All</option>
            <option value="ERROR">Log Level: Error</option>
            <option value="WARN">Log Level: Warn</option>
            <option value="INFO">Log Level: Info</option>
          </select>

          <select
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-600"
            onChange={(event) => setServiceFilter(event.target.value)}
            value={serviceFilter}
          >
            <option value="All">Service: All</option>
            {SERVICES.map((service) => (
              <option key={service} value={service}>Service: {service}</option>
            ))}
          </select>

          <button
            className="rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
            onClick={clearTerminal}
            title="Clear terminal"
            type="button"
          >
            <FiTrash2 />
          </button>

          <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.65)]" />
            Live
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-425 px-3 py-3 md:px-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="font-mono text-[11px] text-zinc-500">/app/live - Stream {isStreaming ? 'running' : 'paused'} - {filteredLogs.length} rows</p>
          <Link className="text-[11px] text-zinc-500 hover:text-zinc-300" to="/app/dashboard">Back to Dashboard</Link>
        </div>

        <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="grid grid-cols-[132px_88px_164px_1fr] border-b border-zinc-800 bg-zinc-900/40 px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-zinc-500">
            <span>Timestamp</span>
            <span>Level</span>
            <span>Service</span>
            <span>Message</span>
          </div>

          <div className="max-h-[72vh] overflow-auto" ref={feedRef}>
            {filteredLogs.map((log) => {
              const expanded = expandedId === log.id
              return (
                <div className="border-b border-zinc-900/90" key={log.id}>
                  <button
                    className="grid w-full grid-cols-[132px_88px_164px_1fr] items-start gap-2 px-3 py-1.5 text-left hover:bg-zinc-900/60"
                    onClick={() => toggleExpand(log.id)}
                    type="button"
                  >
                    <span className="font-mono text-[12px] text-zinc-500">{log.timestamp}</span>
                    <span className={`w-fit rounded px-2 py-0.5 font-mono text-[11px] font-semibold ${getLevelPillClass(log.level)}`}>
                      {log.level}
                    </span>
                    <span className={`font-mono text-[12px] ${serviceColorClass(log.service)}`}>{log.service}</span>
                    <span className="font-mono text-[12px] text-zinc-200">{log.message}</span>
                  </button>

                  {expanded && (
                    <div className="border-t border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">JSON payload</p>
                        <button
                          className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
                          onClick={() => copyJson(log.id, log.meta)}
                          type="button"
                        >
                          <FiCopy />
                          {copiedId === log.id ? 'Copied' : 'Copy JSON'}
                        </button>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                        <div className="font-mono text-xs text-zinc-500">{'{'}</div>
                        <div className="pl-4">
                          {Object.entries(log.meta).map(([k, v]) => (
                            <JsonLine k={k} key={`${log.id}-${k}`} v={v} />
                          ))}
                        </div>
                        <div className="font-mono text-xs text-zinc-500">{'}'}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredLogs.length === 0 && (
              <div className="px-4 py-10 text-center">
                <p className="font-mono text-xs text-zinc-500">No logs match the current filter.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default LiveTailPage
