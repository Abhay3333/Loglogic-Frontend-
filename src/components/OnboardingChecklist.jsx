import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiCheck, FiCheckCircle, FiCopy, FiKey, FiRefreshCw, FiTerminal, FiX } from 'react-icons/fi';
import { getOnboarding, sendTestEvent, confirmDashboard } from '../api/onboarding';
import { createApiKey } from '../api/apiKey';

// Mount with key={orgId}: credentials and in-flight results cannot cross workspace changes.
export default function OnboardingChecklist({ orgId, dashboard = false, onDelivered }) {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const [rawKey, setRawKey] = useState('');
    const [eventId, setEventId] = useState('');
    const [refresh, setRefresh] = useState(0);
    const lifecycle = useRef(null);
    const notified = useRef('');

    useEffect(() => {
        const controller = new AbortController();
        lifecycle.current = controller;
        let timer, attempts = 0;
        async function poll() {
            try {
                const result = await getOnboarding(orgId, controller.signal, eventId);
                if (controller.signal.aborted) return;
                setStatus(result);
                setError('');
                if (result.firstLog) {
                    if (eventId) setNotice('Your test event is persisted and ready to view.');
                    if (dashboard && notified.current !== result.firstLog.id) {
                        notified.current = result.firstLog.id;
                        onDelivered?.();
                    }
                } else if (eventId) {
                    // Only a submitted test event needs repeated persistence checks.
                    // Ordinary page loads and refreshes read status once.
                    if (++attempts < 30) timer = setTimeout(poll, 2000);
                    else setNotice('Still waiting for persistence. Check worker health, then refresh setup.');
                }
            } catch {
                if (!controller.signal.aborted) setError('Could not load setup progress. Check workspace access and backend setup, then retry.');
            }
        }
        poll();
        return () => { controller.abort(); clearTimeout(timer); };
    }, [orgId, refresh, eventId, dashboard, onDelivered]);

    useEffect(() => {
        if (!rawKey) return;
        const timer = setTimeout(() => setRawKey(''), 120000);
        return () => clearTimeout(timer);
    }, [rawKey]);

    async function action(kind) {
        const controller = lifecycle.current;
        if (!controller || controller.signal.aborted || busy) return;
        setBusy(true); setError(''); setNotice('');
        try {
            if (kind === 'key') {
                const result = await createApiKey({ orgId, keyName: 'Onboarding integration', scopes: ['logs:ingest'] });
                if (controller.signal.aborted) return;
                setRawKey(result.rawKey);
            } else if (kind === 'send') {
                const result = await sendTestEvent(orgId, controller.signal);
                if (controller.signal.aborted) return;
                if (result.privacySuppressedCount) {
                    setNotice('The test event was suppressed by a privacy policy. Review the policy before retrying.');
                    return;
                }
                if (!result.eventId) throw new Error('Missing event correlation');
                setStatus(null);
                setEventId(result.eventId);
                setNotice('Test event queued. Waiting for MongoDB persistence…');
            } else {
                await confirmDashboard(orgId, status.firstLog.id, controller.signal);
                if (controller.signal.aborted) return;
                setNotice('Dashboard delivery confirmed. Setup complete.');
            }
            setRefresh(value => value + 1);
        } catch (err) {
            if (!controller.signal.aborted) setError(err.response?.status === 429
                ? 'Please wait before retrying. Check your workspace quota if the limit persists.'
                : 'The action failed. Check permissions and pipeline health, then retry.');
        } finally {
            if (!controller.signal.aborted) setBusy(false);
        }
    }

    const steps = status?.steps || {};
    const complete = Object.values(steps).length === 4 && Object.values(steps).every(Boolean);
    const stepItems = [
        { key: 'workspace', label: 'Create workspace' },
        { key: 'key', label: 'Generate API key' },
        { key: 'firstLog', label: 'Send first log' },
        { key: 'dashboard', label: 'View in dashboard' },
    ];
    const completedCount = stepItems.filter(item => steps[item.key]).length;
    const nextStep = stepItems.findIndex(item => !steps[item.key]);
    const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#8ff5ff] px-3.5 py-2 text-xs font-semibold text-[#062b32] transition-colors hover:bg-[#b3f9ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ff5ff] disabled:cursor-not-allowed disabled:opacity-50';
    const quietButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-[#44484f]/40 px-3 py-2 text-xs font-medium text-[#a8abb3] transition-colors hover:border-[#8ff5ff]/30 hover:bg-white/5 hover:text-[#f1f3fc] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ff5ff] disabled:cursor-not-allowed disabled:opacity-50';
    return <section aria-label="Workspace setup" className="mb-6 overflow-hidden rounded-2xl border border-[#44484f]/25 bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.15)]">
        <div className="px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${complete ? 'border-emerald-400/15 bg-emerald-400/5 text-emerald-300' : 'border-[#8ff5ff]/15 bg-[#8ff5ff]/5 text-[#8ff5ff]'}`}>
                        {complete ? <FiCheckCircle size={17} aria-hidden="true" /> : <FiTerminal size={17} aria-hidden="true" />}
                    </div>
                    <div>
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7f8594]">{complete ? 'Ready to ingest' : 'Getting started'}</p>
                        <h2 className="font-headline text-base font-semibold tracking-tight text-[#f1f3fc] sm:text-lg">{complete ? 'Workspace setup complete' : 'Connect your first application'}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-[#a8abb3]">
                            {complete ? 'Your workspace is connected and ready for application logs.' : 'A few quick steps to get your logs flowing into LogLogic.'}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    {status && !complete && <span className="hidden rounded-full border border-[#44484f]/30 bg-[#0a0e14] px-2.5 py-1 text-[11px] text-[#a8abb3] sm:inline-flex">
                        <span className="mr-1 font-medium text-[#f1f3fc]">{completedCount}/4</span> complete
                    </span>}
                    <button type="button" className="rounded-lg p-2 text-[#7f8594] transition-colors hover:bg-white/5 hover:text-[#8ff5ff] focus-visible:outline-2 focus-visible:outline-[#8ff5ff] disabled:opacity-40" disabled={busy} title="Refresh setup" onClick={() => setRefresh(value => value + 1)}>
                        <FiRefreshCw size={15} className={busy ? 'animate-spin' : ''} aria-hidden="true" /><span className="sr-only">Refresh setup</span>
                    </button>
                </div>
            </div>
            {error && <p role="alert" className="mt-4 rounded-lg border border-red-400/15 bg-red-400/5 px-3 py-2 text-xs leading-relaxed text-red-300">{error}</p>}
            {notice && <p role="status" className="mt-4 rounded-lg border border-[#8ff5ff]/10 bg-[#8ff5ff]/5 px-3 py-2 text-xs leading-relaxed text-[#8ff5ff]">{notice}</p>}
            {!status && !error && <p role="status" className="mt-4 flex items-center gap-2 text-xs text-[#7f8594]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8ff5ff]" />Checking server progress…</p>}
            {!complete && <ol className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((item, index) => {
                    const done = Boolean(steps[item.key]);
                    const current = Boolean(status) && index === nextStep;
                    return <li key={item.key} aria-current={current ? 'step' : undefined} className={`flex min-w-0 items-center gap-2.5 rounded-lg border px-3 py-3 ${current ? 'border-[#8ff5ff]/25 bg-[#8ff5ff]/[0.04]' : 'border-transparent bg-[#0a0e14]/60'}`}>
                        <span aria-label={done ? 'Complete' : 'Pending'} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${done ? 'bg-emerald-400/10 text-emerald-300' : current ? 'border border-[#8ff5ff]/40 bg-[#8ff5ff]/10 text-[#8ff5ff]' : 'border border-[#44484f]/40 text-[#7f8594]'}`}>
                            {done ? <FiCheck size={13} aria-hidden="true" /> : String(index + 1).padStart(2, '0')}
                        </span>
                        <span className={`text-xs font-medium ${current ? 'text-[#f1f3fc]' : done ? 'text-[#a8abb3]' : 'text-[#7f8594]'}`}>{item.label}</span>
                    </li>;
                })}
            </ol>}
            {rawKey && <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.03] p-4">
                <p className="text-xs font-medium text-amber-200">Save your ingestion key</p>
                <p className="mt-1 text-xs leading-relaxed text-[#a8abb3]">Shown once. Copy it to your application environment before it is hidden in two minutes.</p>
                <code className="my-3 block select-all break-all rounded-lg border border-[#44484f]/30 bg-[#0a0e14] p-3 font-mono text-xs text-[#f1f3fc]">{rawKey}</code>
                <div className="flex flex-wrap gap-2">
                    <button type="button" className={quietButton} onClick={async () => {
                        try { await navigator.clipboard.writeText(rawKey); setNotice('Key copied. Store it in your application environment.'); }
                        catch { setError('Copy failed. Select the key and copy it manually.'); }
                    }}><FiCopy size={13} aria-hidden="true" />Copy key</button>
                    <button type="button" className={quietButton} onClick={() => setRawKey('')}><FiX size={13} aria-hidden="true" />Hide key</button>
                </div>
            </div>}
            {dashboard && status?.firstLog && !steps.dashboard && <div className="mt-4 overflow-hidden rounded-xl border border-[#44484f]/35 bg-[#0a0e14]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#44484f]/25 px-4 py-3">
                    <h3 className="flex items-center gap-2 text-xs font-medium text-[#f1f3fc]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Persisted log in your workspace</h3>
                    <span className="font-mono text-[10px] text-[#7f8594]">{new Date(status.firstLog.timestamp).toLocaleString()}</span>
                </div>
                <div className="p-4">
                    <p className="flex flex-wrap items-center gap-2 font-mono text-[11px]"><span className="rounded bg-[#8ff5ff]/10 px-1.5 py-0.5 text-[#8ff5ff]">{status.firstLog.level}</span><span className="text-[#a8abb3]">{status.firstLog.service}</span></p>
                    <pre className="mt-3 whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-[#d5d9e2]">{status.firstLog.message}</pre>
                </div>
            </div>}
        </div>
        {status && !complete && <div className="flex flex-col gap-3 border-t border-[#44484f]/25 bg-[#0d1219] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs leading-relaxed text-[#7f8594]">{!status.canManageKeys ? 'Ask a workspace key manager to generate a key or send a test event.' : !steps.key ? 'Create an ingestion key to connect your application.' : !steps.firstLog ? 'Send a test event to verify your connection.' : 'Your log is stored. Confirm delivery to finish setup.'}</p>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
                <Link className="inline-flex items-center gap-1 text-xs font-medium text-[#a8abb3] transition-colors hover:text-[#8ff5ff]" to="/docs">Integration guide<FiArrowUpRight size={14} aria-hidden="true" /></Link>
                {status.canManageKeys && !steps.key && <button type="button" className={primaryButton} disabled={busy} onClick={() => action('key')}><FiKey size={13} aria-hidden="true" />Generate ingestion key</button>}
                {status.canManageKeys && steps.key && !steps.firstLog && <button type="button" className={primaryButton} disabled={busy} onClick={() => action('send')}><FiTerminal size={13} aria-hidden="true" />Send Test Event</button>}
                {!dashboard && steps.firstLog && <Link className={primaryButton} to="/app/dashboard">View in dashboard<FiArrowUpRight size={14} aria-hidden="true" /></Link>}
                {dashboard && status.firstLog && !steps.dashboard && <button type="button" className={primaryButton} disabled={busy} onClick={() => action('view')}><FiCheck size={14} aria-hidden="true" />Confirm dashboard delivery</button>}
            </div>
        </div>}
    </section>;
}
