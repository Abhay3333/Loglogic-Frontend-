import { useEffect, useState } from 'react';
import { startSupportSession, endSupportSession, querySupportLogs } from '../api/platform';

export default function PlatformSupport({ orgId, name }) {
    const [session, setSession] = useState(null);
    const [reason, setReason] = useState('');
    const [search, setSearch] = useState('');
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [expired, setExpired] = useState(false);
    useEffect(() => {
        if (!session) return;
        const timer = setTimeout(() => { setSession(null); setResult(null); setExpired(true); },
            Math.max(0, Date.parse(session.expiresAt) - Date.now()));
        return () => clearTimeout(timer);
    }, [session]);
    async function start(event) {
        event.preventDefault(); setBusy(true); setError('');
        try { setSession(await startSupportSession(orgId, reason)); setReason(''); setExpired(false); }
        catch (error) { setError(error.message); }
        finally { setBusy(false); }
    }
    async function end() {
        setBusy(true); setError('');
        try { await endSupportSession(session.id); setSession(null); setResult(null); }
        catch (error) { setError(error.message); }
        finally { setBusy(false); }
    }
    async function query(page = 1) {
        setBusy(true); setError(''); setResult(null);
        try { setResult(await querySupportLogs(session.token, { search, page, limit: 25 })); }
        catch (error) {
            setError(error.message);
            if ([401, 403].includes(error.status)) setSession(null);
        } finally { setBusy(false); }
    }
    return <section className="border-t border-outline-variant pt-5 space-y-4">
        <h3 className="text-lg font-bold">Log in as workspace for support</h3>
        <p>Read-only access to {name}. Every log query is audited under your operator identity.</p>
        {expired && <p role="status">The support session expired.</p>}
        {error && <p role="alert" className="text-red-400">{error}</p>}
        {!session ? <form onSubmit={start} className="flex flex-wrap items-end gap-3">
            <label className="flex-1">Support reason<input required maxLength={256} value={reason} onChange={(event) => setReason(event.target.value)}
                className="block mt-2 w-full rounded bg-surface-container-high p-3" /></label>
            <button disabled={busy || !reason.trim()} className="rounded bg-primary text-on-primary px-4 py-3 disabled:opacity-50">Start read-only session</button>
        </form> : <>
            <div role="status" className="rounded border border-amber-500 p-3">Supporting {name} as a platform operator. Expires {new Date(session.expiresAt).toLocaleTimeString()}.
                <button disabled={busy} onClick={end} className="ml-4 underline">End support session</button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); query(); }} className="flex gap-3">
                <label className="flex-1">Search logs<input maxLength={256} value={search} onChange={(event) => setSearch(event.target.value)} className="block mt-2 rounded bg-surface-container-high p-3 w-full" /></label>
                <button disabled={busy} className="self-end rounded border border-outline-variant px-4 py-3">Read logs</button>
            </form>
            {result && <div className="space-y-3">
                {result.logs.length === 0 && <p>No matching logs.</p>}
                {result.logs.map((log, index) => <article key={log._id || index} className="rounded bg-surface-container-high p-3 break-words">
                    <p className="text-sm text-on-surface-variant">{log.timestamp} / {log.service} / {log.level}</p>
                    <pre className="whitespace-pre-wrap font-mono mt-2">{log.message}</pre>
                </article>)}
                <div className="flex items-center gap-4">
                    <button disabled={busy || result.pagination.page <= 1} onClick={() => query(result.pagination.page - 1)}>Previous</button>
                    <span>Page {result.pagination.page} of {result.pagination.totalPages}</span>
                    <button disabled={busy || result.pagination.page >= result.pagination.totalPages} onClick={() => query(result.pagination.page + 1)}>Next</button>
                </div>
            </div>}
        </>}
        {busy && <p role="status">Working...</p>}
    </section>;
}
