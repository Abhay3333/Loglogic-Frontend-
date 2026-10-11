import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  LuArrowLeft, LuSiren, LuCircleAlert, LuCircleCheck, LuMessageSquarePlus,
  LuBell, LuTriangleAlert, LuFileText, LuExternalLink, LuRefreshCw
} from 'react-icons/lu';
import {
  listIncidents, getIncident, addIncidentNote, updateIncidentStatus
} from '../api/integrations';

const errorMessage = (err, fallback) => err?.response?.data?.error || fallback;

const formatWhen = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const STATUS_STYLE = {
  open: 'bg-[#f87171]/15 text-[#fca5a5]',
  acknowledged: 'bg-amber-500/15 text-amber-300',
  resolved: 'bg-[#22c55e]/15 text-[#86efac]'
};

const EVENT_META = {
  alert_triggered: { Icon: LuTriangleAlert, color: 'text-[#fca5a5]', label: 'Alert triggered' },
  notification: { Icon: LuBell, color: 'text-[#8ff5ff]', label: 'Notifications sent' },
  note: { Icon: LuFileText, color: 'text-[#a8abb3]', label: 'Note' },
  status_change: { Icon: LuCircleCheck, color: 'text-[#86efac]', label: 'Status change' },
  issue_created: { Icon: LuExternalLink, color: 'text-[#8ff5ff]', label: 'Issue created' },
  ack: { Icon: LuCircleCheck, color: 'text-[#86efac]', label: 'Acknowledged' }
};

export default function IncidentsPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const { organizations = [], currentOrg } = outletContext;
  const activeOrg = currentOrg || organizations[0] || null;
  const orgId = activeOrg?.id || null;
  const canManage = activeOrg?.role === 'owner' || activeOrg?.role === 'admin';

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const loadList = useCallback(async () => {
    if (!orgId) { setIncidents([]); setLoading(false); return; }
    setLoading(true);
    setPageError('');
    try {
      const res = await listIncidents(orgId);
      setIncidents(res.incidents || []);
    } catch (err) {
      setPageError(errorMessage(err, 'Could not load incidents.'));
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { loadList(); }, [loadList]);

  const openDetail = useCallback(async (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await getIncident(orgId, id);
      setDetail(res);
    } catch (err) {
      setPageError(errorMessage(err, 'Could not load this incident.'));
    } finally {
      setDetailLoading(false);
    }
  }, [orgId]);

  const refreshDetail = () => selectedId && openDetail(selectedId);

  const submitNote = async () => {
    if (!note.trim() || !selectedId) return;
    setBusy(true);
    try {
      await addIncidentNote(orgId, selectedId, note.trim());
      setNote('');
      await openDetail(selectedId);
    } catch (err) {
      setPageError(errorMessage(err, 'Could not add note.'));
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status) => {
    if (!selectedId) return;
    setBusy(true);
    try {
      await updateIncidentStatus(orgId, selectedId, status);
      await Promise.all([openDetail(selectedId), loadList()]);
    } catch (err) {
      setPageError(errorMessage(err, 'Could not update incident.'));
    } finally {
      setBusy(false);
    }
  };

  const incident = detail?.incident;
  const events = detail?.events || [];

  return (
    <div className="flex flex-col h-screen bg-[#0a0e14] text-[#f1f3fc] font-sans overflow-hidden cyber-grid">
      <header className="flex-none bg-[#0a0e14]/95 backdrop-blur border-b border-[#44484f]/20 p-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/app/dashboard')} className="p-1.5 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors" title="Back to Dashboard" type="button">
            <LuArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-headline font-bold text-[#f1f3fc] flex items-center gap-2">
              <LuSiren className="w-6 h-6 text-[#8ff5ff]" /> Incidents
            </h1>
            <p className="text-sm text-[#a8abb3] mt-1">Error spikes grouped into a chronological investigation timeline.</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 md:grid-cols-[20rem_1fr] gap-0 md:gap-6 p-6">
          {/* List */}
          <aside className="overflow-auto custom-scrollbar space-y-2 md:border-r md:border-[#44484f]/20 md:pr-4">
            {pageError && <div className="rounded-lg border border-[#f87171]/40 bg-[#f87171]/10 px-3 py-2 text-xs text-[#fca5a5]">{pageError}</div>}
            {loading ? (
              <p className="text-sm text-[#a8abb3]">Loading…</p>
            ) : incidents.length === 0 ? (
              <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] p-6 text-center">
                <LuSiren className="w-8 h-8 mx-auto text-[#44484f] mb-2" />
                <p className="text-sm text-[#a8abb3]">No incidents yet.</p>
              </div>
            ) : (
              incidents.map((inc) => (
                <button key={inc.id} onClick={() => openDetail(inc.id)} type="button"
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${selectedId === inc.id ? 'border-[#8ff5ff]/40 bg-[#00eefc]/5' : 'border-[#44484f]/25 bg-[#11161d] hover:border-[#44484f]/50'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${STATUS_STYLE[inc.status] || ''}`}>{inc.status}</span>
                    <span className="text-[10px] text-[#7f8594] uppercase">{inc.severity}</span>
                  </div>
                  <p className="text-sm font-medium text-[#f1f3fc] mt-1.5 line-clamp-2">{inc.title}</p>
                  <p className="text-[11px] text-[#7f8594] mt-1">{formatWhen(inc.opened_at)}</p>
                </button>
              ))
            )}
          </aside>

          {/* Detail */}
          <section className="overflow-auto custom-scrollbar">
            {!selectedId ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-sm text-[#7f8594]">Select an incident to see its timeline.</p>
              </div>
            ) : detailLoading ? (
              <p className="text-sm text-[#a8abb3]">Loading incident…</p>
            ) : incident ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${STATUS_STYLE[incident.status] || ''}`}>{incident.status}</span>
                        <span className="text-[10px] text-[#7f8594] uppercase">{incident.severity} · {incident.source}</span>
                      </div>
                      <h2 className="text-lg font-semibold text-[#f1f3fc]">{incident.title}</h2>
                      <p className="text-xs text-[#7f8594] mt-1">Opened {formatWhen(incident.opened_at)}
                        {incident.resolved_at ? ` · Resolved ${formatWhen(incident.resolved_at)}` : ''}</p>
                    </div>
                    <button onClick={refreshDetail} className="p-2 text-[#7f8594] hover:text-[#8ff5ff] rounded-md" title="Refresh" type="button">
                      <LuRefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  {canManage && incident.status !== 'resolved' && (
                    <div className="flex items-center gap-2 mt-4">
                      {incident.status !== 'acknowledged' && (
                        <button onClick={() => changeStatus('acknowledged')} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md border border-[#44484f]/40 px-3 py-1.5 text-xs text-[#a8abb3] hover:text-[#f1f3fc] hover:border-[#8ff5ff]/40 disabled:opacity-50" type="button">
                          <LuCircleCheck className="w-3.5 h-3.5" /> Acknowledge
                        </button>
                      )}
                      <button onClick={() => changeStatus('resolved')} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-[#22c55e]/15 border border-[#22c55e]/30 px-3 py-1.5 text-xs text-[#86efac] hover:bg-[#22c55e]/25 disabled:opacity-50" type="button">
                        <LuCircleCheck className="w-3.5 h-3.5" /> Resolve
                      </button>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-[#a8abb3] mb-3">Timeline</h3>
                  <div className="space-y-3 border-l border-[#44484f]/30 pl-5 ml-1">
                    {events.length === 0 ? (
                      <p className="text-sm text-[#7f8594]">No events recorded.</p>
                    ) : events.map((ev) => {
                      const m = EVENT_META[ev.kind] || EVENT_META.note;
                      const Icon = m.Icon;
                      const url = ev.metadata?.url;
                      return (
                        <div key={ev.id} className="relative">
                          <span className={`absolute -left-[1.65rem] top-0.5 bg-[#0a0e14] rounded-full p-0.5 ${m.color}`}><Icon className="w-4 h-4" /></span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[#f1f3fc]">{m.label}</span>
                            <span className="text-[11px] text-[#7f8594]">{formatWhen(ev.created_at)}</span>
                          </div>
                          {ev.message && <p className="text-xs text-[#a8abb3] mt-0.5">{ev.message}</p>}
                          {url && <a href={url} target="_blank" rel="noreferrer" className="text-xs text-[#8ff5ff] hover:underline inline-flex items-center gap-1 mt-0.5">{url} <LuExternalLink className="w-3 h-3" /></a>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add note */}
                {canManage && (
                  <div className="rounded-xl border border-[#44484f]/25 bg-[#11161d] p-4">
                    <label className="block text-xs text-[#a8abb3] mb-2 flex items-center gap-1.5"><LuMessageSquarePlus className="w-4 h-4" /> Add an investigation note</label>
                    <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you find?"
                      className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg p-2.5 outline-none focus:border-[#8ff5ff]" />
                    <div className="flex justify-end mt-2">
                      <button onClick={submitNote} disabled={busy || !note.trim()} className="px-4 py-1.5 bg-[#00eefc] hover:bg-[#8ff5ff] text-[#0a0e14] text-xs font-bold rounded-lg disabled:opacity-50" type="button">Add note</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#7f8594]">Incident not found.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
