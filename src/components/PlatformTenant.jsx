import { useEffect, useState } from 'react';
import { getPlatformTenant, setPlatformControls } from '../api/platform';
import PlatformSupport from './PlatformSupport';

export default function PlatformTenant({ orgId }) {
    const [tenant, setTenant] = useState(null);
    const [suspended, setSuspended] = useState(false);
    const [limit, setLimit] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        getPlatformTenant(orgId).then((data) => {
            if (!active) return;
            setTenant(data); setSuspended(data.controls.suspended); setLimit(data.controls.monthly_log_limit ?? ''); setError('');
        }).catch((error) => { if (active) setError(error.message); })
            .finally(() => { if (active) setBusy(false); });
        return () => { active = false; };
    }, [orgId, revision]);
    async function save(event) {
        event.preventDefault(); setBusy(true); setError('');
        try {
            await setPlatformControls(orgId, { suspended, monthlyLogLimit: limit === '' ? null : Number(limit), revision: tenant.controls.revision, reason });
            setReason(''); setRevision((value) => value + 1);
        } catch (error) { setError(error.message); setBusy(false); }
    }
    return <section className="rounded-xl border border-primary/50 p-5 space-y-5">
        <h2 className="text-xl font-bold">Workspace operations</h2><p className="font-mono break-all">{orgId}</p>
        {error && <p role="alert" className="text-red-400">{error}</p>}
        {busy && <p role="status">Loading workspace...</p>}
        <button disabled={busy} onClick={() => { setBusy(true); setRevision((value) => value + 1); }} className="underline">Reload workspace</button>
        {tenant && <>
            <h3 className="font-bold">{tenant.organization.name}</h3>
            <p>{tenant.storedLogs.toLocaleString()} stored logs / {tenant.usage.admit.toLocaleString()} admitted / {tenant.usage.written.toLocaleString()} written this billing period</p>
            <form onSubmit={save} className="space-y-4">
                <label className="flex gap-3"><input type="checkbox" checked={suspended} onChange={(event) => setSuspended(event.target.checked)} disabled={busy} />Suspend new ingestion</label>
                <label className="block">Monthly log cap override (leave empty for plan behavior)
                    <input type="number" min="0" max="1000000000000" step="1" value={limit} onChange={(event) => setLimit(event.target.value)} disabled={busy}
                        className="mt-2 block rounded bg-surface-container-high p-3 w-full" />
                </label>
                <label className="block">Reason for change<input required maxLength={256} value={reason} onChange={(event) => setReason(event.target.value)} disabled={busy}
                    className="mt-2 block rounded bg-surface-container-high p-3 w-full" /></label>
                <button disabled={busy || !reason.trim()} className="rounded bg-primary text-on-primary px-4 py-2 disabled:opacity-50">Save audited controls</button>
            </form>
            <section><h3 className="font-bold mb-3">API key usage (first 100 keys)</h3>
                {tenant.apiKeys.length === 0 && <p>No keys.</p>}
                {tenant.apiKeys.map((key) => <p key={key.id} className="break-all">{key.name} / {key.key_hint} / {key.is_active ? 'Active' : 'Revoked'} / Last used {key.last_used_at || 'Never'}</p>)}
            </section>
            <section><h3 className="font-bold mb-3">Recent workspace activity (25 events)</h3>
                {tenant.activity.length === 0 && <p>No audit events.</p>}
                {tenant.activity.map((event) => <article key={event.id} className="py-2 border-b border-outline-variant/40">
                    <p className="break-all">{event.created_at} / {event.action} / Operator {event.actor_id || 'System'}</p>
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(event.metadata)}</pre>
                </article>)}
            </section>
            <PlatformSupport orgId={orgId} name={tenant.organization.name} />
        </>}
    </section>;
}
