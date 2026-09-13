import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Link, useOutletContext, useNavigate } from 'react-router-dom'
import { queryLogs, getOrgServices } from '../api/logs'
import {
  FiCopy,
  FiPause,
  FiPlay,
  FiSearch,
  FiTrash2,
  FiArrowLeft,
  FiCheck,
  FiActivity
} from 'react-icons/fi'

const formatTimestamp = (dateValue) => {
  const d = dateValue ? new Date(dateValue) : new Date();
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

const getLevelPillClass = (level) => {
  const norm = String(level || 'info').toUpperCase();
  if (norm === 'ERROR' || norm === 'FATAL' || norm === 'CRITICAL') return 'bg-red-500/15 text-red-300 border border-red-500/30'
  if (norm === 'WARN' || norm === 'WARNING') return 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
  return 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
}

const serviceColorClass = (service = '') => {
  if (service.includes('auth')) return 'text-cyan-300'
  if (service.includes('billing') || service.includes('payment')) return 'text-violet-300'
  if (service.includes('socket') || service.includes('worker')) return 'text-teal-300'
  if (service.includes('api') || service.includes('gateway')) return 'text-sky-300'
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
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const { organizations = [], currentOrg, isAccessExpired } = outletContext;

  const feedRef = useRef(null);
  const seenIdsRef = useRef(new Set());

  const [isStreaming, setIsStreaming] = useState(!isAccessExpired);
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [availableServices, setAvailableServices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const activeOrgId = currentOrg?.id || (organizations.length > 0 ? organizations[0].id : null);
  const currentOrgName = currentOrg?.name || (organizations.length > 0 ? organizations[0].name : 'Workspace');

  // Load distinct services
  useEffect(() => {
    if (activeOrgId && !isAccessExpired) {
      getOrgServices(activeOrgId)
        .then(data => setAvailableServices(data.services || []))
        .catch(err => console.error("Error loading services for live tail:", err));
    }
  }, [activeOrgId, isAccessExpired]);

  // Live Tail Poller
  const fetchLiveLogs = useCallback(async () => {
    if (!activeOrgId || !isStreaming || isAccessExpired) return;

    try {
      const response = await queryLogs({
        orgId: activeOrgId,
        limit: 30,
        sort: 'desc'
      });

      const incomingLogs = (response.logs || []).reverse(); // oldest to newest for terminal view

      setLogs(prevLogs => {
        const newBatch = [];
        for (const log of incomingLogs) {
          const logId = log._id || log.id;
          if (!seenIdsRef.current.has(logId)) {
            seenIdsRef.current.add(logId);
            newBatch.push(log);
          }
        }

        if (newBatch.length === 0) return prevLogs;
        return [...prevLogs.slice(-499), ...newBatch];
      });

    } catch (err) {
      console.error("Live tail stream error:", err);
    }
  }, [activeOrgId, isStreaming]);

  useEffect(() => {
    fetchLiveLogs();
    const interval = setInterval(fetchLiveLogs, 2500);
    return () => clearInterval(interval);
  }, [fetchLiveLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const normLevel = String(log.level || '').toUpperCase();
      const levelMatch = levelFilter === 'All' || normLevel === levelFilter
      const serviceMatch = serviceFilter === 'All' || log.service === serviceFilter
      const textMatch = !query || `${log.message} ${log.service} ${normLevel}`.toLowerCase().includes(query.toLowerCase())
      return levelMatch && serviceMatch && textMatch
    })
  }, [logs, levelFilter, serviceFilter, query]);

  useEffect(() => {
    if (!feedRef.current) return
    if (!isStreaming) return
    feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [filteredLogs, isStreaming]);

  const clearTerminal = () => {
    seenIdsRef.current.clear();
    setLogs([]);
    setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const copyJson = async (id, meta) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(meta, null, 2));
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <button 
            onClick={() => navigate('/app/dashboard')}
            className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-zinc-900 rounded-md transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mr-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-sans text-xs font-bold text-white tracking-wide">LIVE TAIL:</span>
            <span className="text-xs text-cyan-300 truncate max-w-[140px]">{currentOrgName}</span>
          </div>

          <button
            disabled={isAccessExpired}
            title={isAccessExpired ? 'Workspace access expired' : (isStreaming ? 'Pause Stream' : 'Resume Stream')}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              isAccessExpired
                ? 'opacity-40 cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-500'
                : isStreaming
                ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-600'
                : 'border-emerald-600/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'
            }`}
            onClick={() => { if (!isAccessExpired) setIsStreaming((prev) => !prev); }}
            type="button"
          >
            {isStreaming && !isAccessExpired ? <FiPause /> : <FiPlay />}
            {isAccessExpired ? 'Stream Restricted' : (isStreaming ? 'Pause Stream' : 'Resume Stream')}
          </button>

          <label className="relative min-w-55 flex-1">
            <FiSearch className="pointer-events-none absolute left-2.5 top-2 text-zinc-500" />
            <input
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-8 pr-4 text-xs text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter live stream by keyword..."
              value={query}
            />
          </label>

          <select
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-600 cursor-pointer"
            onChange={(event) => setLevelFilter(event.target.value)}
            value={levelFilter}
          >
            <option value="All">Level: All</option>
            <option value="ERROR">Level: Error</option>
            <option value="WARN">Level: Warn</option>
            <option value="INFO">Level: Info</option>
            <option value="DEBUG">Level: Debug</option>
          </select>

          <select
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-600 cursor-pointer"
            onChange={(event) => setServiceFilter(event.target.value)}
            value={serviceFilter}
          >
            <option value="All">Service: All</option>
            {availableServices.map((service) => (
              <option key={service} value={service}>Service: {service}</option>
            ))}
          </select>

          <button
            className="rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 cursor-pointer"
            onClick={clearTerminal}
            title="Clear live buffer"
            type="button"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 custom-scrollbar" ref={feedRef}>
        <div className="mx-auto max-w-7xl space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="py-24 text-center text-zinc-600">
              <FiActivity className="w-8 h-8 mx-auto mb-3 opacity-40 animate-pulse text-cyan-400" />
              <p className="text-sm font-sans text-zinc-400">Listening for incoming live telemetry events...</p>
              <p className="text-xs text-zinc-600 mt-1 font-sans">
                Live telemetry emitted by your connected services will stream here in real time.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const logId = log._id || log.id;
              const normLevel = String(log.level || 'info').toUpperCase();
              const isExpanded = expandedId === logId;
              const meta = log.metadata || {};

              return (
                <div
                  className="group rounded border border-transparent px-2.5 py-1.5 hover:border-zinc-800 hover:bg-zinc-900/60 transition-colors"
                  key={logId}
                >
                  <div className="flex flex-wrap items-baseline gap-2 text-xs">
                    <span className="text-zinc-500">{formatTimestamp(log.timestamp)}</span>
                    <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${getLevelPillClass(normLevel)}`}>
                      {normLevel}
                    </span>
                    <span className={`font-semibold ${serviceColorClass(log.service)}`}>
                      [{log.service}]
                    </span>
                    <span className="flex-1 text-zinc-200">{log.message}</span>
                    
                    {meta && Object.keys(meta).length > 0 && (
                      <button
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-cyan-400 hover:underline cursor-pointer transition-opacity"
                        onClick={() => toggleExpand(logId)}
                      >
                        {isExpanded ? 'Collapse JSON' : 'Expand JSON'}
                      </button>
                    )}
                  </div>

                  {isExpanded && meta && Object.keys(meta).length > 0 && (
                    <div className="mt-2 rounded bg-black/70 border border-zinc-800 p-3 text-xs relative">
                      <button
                        className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-white cursor-pointer"
                        onClick={() => copyJson(logId, meta)}
                        title="Copy JSON"
                      >
                        {copiedId === logId ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                      </button>
                      <pre className="text-zinc-300 text-[11px] overflow-x-auto custom-scrollbar">
                        {JSON.stringify(meta, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  )
}

export default LiveTailPage
