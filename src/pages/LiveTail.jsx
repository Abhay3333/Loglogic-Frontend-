import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { getOrgServices, openLogStream, queryLogs } from '../api/logs'
import { getBilling } from '../api/billing'
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

const MAX_LOGS = 800

const formatTimestamp = (dateValue) => {
  const d = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(d.getTime())) return '--:--:--.---'
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

const LiveTailPage = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const { organizations = [], currentOrg, isAccessExpired } = outletContext;

  const feedRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const seenOrderRef = useRef([]);
  const sourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const generationRef = useRef(0);
  const streamingRef = useRef(!isAccessExpired);
  const autoScrollRef = useRef(true);

  const [isStreaming, setIsStreaming] = useState(!isAccessExpired);
  const [connection, setConnection] = useState(isAccessExpired ? 'paused' : 'reconnecting');
  const [query, setQuery] = useState('');
  const [regexMode, setRegexMode] = useState(false);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [availableServices, setAvailableServices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [dropNotice, setDropNotice] = useState(null);
  const [transport, setTransport] = useState(null);

  const activeOrgId = currentOrg?.id || (organizations.length > 0 ? organizations[0].id : null);
  const currentOrgName = currentOrg?.name || (organizations.length > 0 ? organizations[0].name : 'Workspace');

  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

  useEffect(() => {
    if (activeOrgId && !isAccessExpired) {
      getOrgServices(activeOrgId)
        .then(data => setAvailableServices(data.services || []))
        .catch(err => console.error('Error loading services for live tail:', err));
    }
  }, [activeOrgId, isAccessExpired]);

  const remember = (id) => {
    if (!id || seenIdsRef.current.has(id)) return false;
    seenIdsRef.current.add(id);
    seenOrderRef.current.push(id);
    if (seenOrderRef.current.length > 2000) {
      const stale = seenOrderRef.current.splice(0, seenOrderRef.current.length - 2000);
      for (const oldId of stale) seenIdsRef.current.delete(oldId);
    }
    return true;
  };

  const appendLogs = useCallback((incoming) => {
    const batch = Array.isArray(incoming) ? incoming : [incoming];
    setLogs((prev) => {
      const next = prev.slice();
      for (const log of batch) {
        if (!log) continue;
        const logId = log.id || log._id;
        if (!remember(logId)) continue;
        next.push(log);
      }
      return next.slice(-MAX_LOGS);
    });
    setAvailableServices((prev) => {
      const seen = new Set(prev);
      let changed = false;
      for (const log of batch) {
        if (log?.service && !seen.has(log.service)) {
          seen.add(log.service);
          changed = true;
        }
      }
      return changed ? [...seen].sort() : prev;
    });
  }, []);

  const closeSource = useCallback(() => {
    const source = sourceRef.current;
    sourceRef.current = null;
    if (source) {
      source.onerror = null;
      source.close();
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback((delayMs) => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      if (streamingRef.current) {
        connectRef.current();
      }
    }, delayMs);
  }, []);

  const connectRef = useRef(() => {});

  const connect = useCallback(async () => {
    if (!activeOrgId || !streamingRef.current || isAccessExpired) return;
    const generation = ++generationRef.current;
    closeSource();
    setConnection('reconnecting');

    let source;
    try {
      source = await openLogStream(activeOrgId);
    } catch (err) {
      console.error('Live tail connect failed');
      if (generation !== generationRef.current || !streamingRef.current) return;
      setConnection('reconnecting');
      scheduleReconnect(5000);
      return;
    }

    if (generation !== generationRef.current || !streamingRef.current) {
      source.close();
      return;
    }

    sourceRef.current = source;

    source.onopen = () => {
      if (generation !== generationRef.current) return;
      setConnection('live');
    };

    source.addEventListener('logs', (event) => {
      if (generation !== generationRef.current) return;
      try {
        appendLogs(JSON.parse(event.data));
      } catch {
        // ignore a malformed frame
      }
    });

    source.addEventListener('dropped', (event) => {
      if (generation !== generationRef.current) return;
      try {
        const payload = JSON.parse(event.data);
        const count = Number(payload.count) || 0;
        if (count > 0) setDropNotice(`Dropped ${count} events while this tab was behind.`);
      } catch {
        setDropNotice('Dropped events while this tab was behind.');
      }
    });

    source.addEventListener('reconnect', () => {
      if (generation !== generationRef.current) return;
      closeSource();
      generationRef.current += 1;
      setConnection('reconnecting');
      scheduleReconnect(0);
    });

    source.addEventListener('shutdown', () => {
      if (generation !== generationRef.current) return;
      closeSource();
      generationRef.current += 1;
      setConnection('reconnecting');
      scheduleReconnect(Math.floor(Math.random() * 2000));
    });

    source.onerror = () => {
      if (generation !== generationRef.current) return;
      closeSource();
      generationRef.current += 1;
      if (!streamingRef.current) return;
      setConnection('reconnecting');
      scheduleReconnect(5000);
    };
  }, [activeOrgId, isAccessExpired, appendLogs, closeSource, scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (!activeOrgId) return undefined;
    let active = true;
    getBilling(activeOrgId)
      .then((data) => {
        if (!active) return;
        const tier = data?.plan_tier;
        setTransport(tier === 'pro' || tier === 'enterprise' ? 'sse' : 'poll');
      })
      .catch(() => {
        if (active) setTransport('poll');
      });
    return () => {
      active = false;
    };
  }, [activeOrgId]);

  useEffect(() => {
    streamingRef.current = Boolean(isStreaming && !isAccessExpired && activeOrgId && transport);
    if (!isStreaming || isAccessExpired || !activeOrgId || !transport) {
      closeSource();
      generationRef.current += 1;
      if (!isStreaming || isAccessExpired) setConnection('paused');
      return undefined;
    }
    if (transport === 'poll') {
      closeSource();
      setConnection('polling');
      let timer;
      const pull = async () => {
        try {
          const startDate = new Date(Date.now() - 60 * 1000).toISOString();
          const response = await queryLogs({ orgId: activeOrgId, startDate, page: 1, limit: 50 });
          appendLogs(response.logs || []);
        } catch (err) {
          console.error('Live tail poll failed', err);
        }
      };
      pull();
      timer = setInterval(pull, 2500);
      return () => {
        clearInterval(timer);
        generationRef.current += 1;
      };
    }
    connect();
    return () => {
      generationRef.current += 1;
      closeSource();
    };
  }, [isStreaming, isAccessExpired, activeOrgId, connect, closeSource, transport, appendLogs]);

  const serviceOptions = useMemo(() => {
    return [...new Set(availableServices.filter(Boolean))].sort();
  }, [availableServices]);

  const filteredLogs = useMemo(() => {
    let matcher = null;
    if (query && regexMode) {
      try {
        matcher = new RegExp(query, 'i');
      } catch {
        matcher = null;
      }
    }

    return logs.filter((log) => {
      const normLevel = String(log.level || '').toUpperCase();
      const levelMatch = levelFilter === 'ALL' || normLevel === levelFilter
      const serviceMatch = serviceFilter === 'ALL' || log.service === serviceFilter
      const haystack = `${log.message || ''} ${log.service || ''} ${normLevel}`
      let textMatch = true
      if (query) {
        if (regexMode && matcher) textMatch = matcher.test(haystack)
        else textMatch = haystack.toLowerCase().includes(query.toLowerCase())
      }
      return levelMatch && serviceMatch && textMatch
    })
  }, [logs, levelFilter, serviceFilter, query, regexMode]);

  useEffect(() => {
    if (!feedRef.current || !autoScroll) return
    feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [filteredLogs, autoScroll]);

  const onFeedScroll = () => {
    const el = feedRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48
    if (nearBottom !== autoScrollRef.current) setAutoScroll(nearBottom)
  }

  const clearTerminal = () => {
    seenIdsRef.current.clear();
    seenOrderRef.current = [];
    setLogs([]);
    setExpandedId(null);
    setDropNotice(null);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const copyText = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1400);
    } catch {
      setCopiedKey(null);
    }
  };

  const badge = isAccessExpired
    ? { dot: 'bg-red-400', label: 'Restricted' }
    : !isStreaming
      ? { dot: 'bg-amber-400', label: 'Paused' }
      : connection === 'polling'
        ? { dot: 'bg-amber-400', label: 'Polling' }
        : connection === 'live'
          ? { dot: 'bg-emerald-400 animate-pulse', label: 'Live' }
          : { dot: 'bg-red-400', label: 'Reconnecting' };

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
            <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
            <span className="font-sans text-xs font-bold text-white tracking-wide">{badge.label}</span>
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

          <button
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              autoScroll
                ? 'border-cyan-700/50 bg-cyan-500/10 text-cyan-200'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
            }`}
            onClick={() => setAutoScroll((prev) => !prev)}
            type="button"
            title="Stick to the bottom when new logs arrive"
          >
            {autoScroll ? 'Auto-scroll on' : 'Auto-scroll off'}
          </button>

          <label className="relative min-w-55 flex-1">
            <FiSearch className="pointer-events-none absolute left-2.5 top-2 text-zinc-500" />
            <input
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-8 pr-16 text-xs text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={regexMode ? 'Filter with a regular expression...' : 'Filter live stream by keyword...'}
              value={query}
            />
            <button
              type="button"
              onClick={() => setRegexMode((prev) => !prev)}
              className={`absolute right-1.5 top-1 rounded px-1.5 py-0.5 text-[10px] font-sans font-bold cursor-pointer ${
                regexMode ? 'bg-cyan-500/20 text-cyan-200' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              .*
            </button>
          </label>

          <select
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-600 cursor-pointer"
            onChange={(event) => setLevelFilter(event.target.value)}
            value={levelFilter}
          >
            <option value="ALL">Level: All</option>
            <option value="INFO">Level: Info</option>
            <option value="WARN">Level: Warn</option>
            <option value="ERROR">Level: Error</option>
            <option value="FATAL">Level: Fatal</option>
          </select>

          <select
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-600 cursor-pointer"
            onChange={(event) => setServiceFilter(event.target.value)}
            value={serviceFilter}
          >
            <option value="ALL">Service: All</option>
            {serviceOptions.map((service) => (
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
        {dropNotice && (
          <div className="mx-auto w-full max-w-7xl px-4 pb-2 text-[11px] font-sans text-amber-300">
            {dropNotice}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-auto p-4 custom-scrollbar" ref={feedRef} onScroll={onFeedScroll}>
        <div className="mx-auto max-w-7xl space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="py-24 text-center text-zinc-600">
              <FiActivity className="w-8 h-8 mx-auto mb-3 opacity-40 animate-pulse text-cyan-400" />
              <p className="text-sm font-sans text-zinc-400">
                {connection === 'live'
                  ? 'Listening for incoming live telemetry events...'
                  : connection === 'polling'
                    ? 'Checking for new logs every 2.5 seconds.'
                    : 'Connecting to the live stream...'}
              </p>
              <p className="text-xs text-zinc-600 mt-1 font-sans">
                Logs show up here as soon as they are stored, without a polling interval.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const logId = log.id || log._id;
              const normLevel = String(log.level || 'info').toUpperCase();
              const isExpanded = expandedId === logId;
              const meta = log.metadata || {};
              const hasMeta = meta && typeof meta === 'object' && Object.keys(meta).length > 0;

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

                    <button
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-zinc-400 hover:text-white cursor-pointer transition-opacity"
                      onClick={() => copyText(`${logId}:msg`, log.message || '')}
                      type="button"
                    >
                      {copiedKey === `${logId}:msg` ? 'Copied' : 'Copy message'}
                    </button>

                    {hasMeta && (
                      <button
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-cyan-400 hover:underline cursor-pointer transition-opacity"
                        onClick={() => toggleExpand(logId)}
                        type="button"
                      >
                        {isExpanded ? 'Collapse JSON' : 'Expand JSON'}
                      </button>
                    )}
                  </div>

                  {isExpanded && hasMeta && (
                    <div className="mt-2 rounded bg-black/70 border border-zinc-800 p-3 text-xs relative">
                      <button
                        className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-white cursor-pointer"
                        onClick={() => copyText(`${logId}:json`, JSON.stringify(meta, null, 2))}
                        title="Copy JSON"
                        type="button"
                      >
                        {copiedKey === `${logId}:json` ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
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
