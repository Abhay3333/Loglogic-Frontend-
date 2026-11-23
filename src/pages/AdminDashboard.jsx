import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PlatformReports from '../components/PlatformReports';
import PlatformTenant from '../components/PlatformTenant';
import { getPlatformOverview } from '../api/platform';

const number = (value) => value == null ? 'Unavailable' : value.toLocaleString();

export default function AdminDashboard() {
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [snapshot, setSnapshot] = useState(null);
    const [page, setPage] = useState(1);
    const [revision, setRevision] = useState(0);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        let active = true;
        getPlatformOverview(page).then((data) => {
            if (active) { setSnapshot(data); setError(''); }
        }).catch((error) => {
            if (active) { setSnapshot(null); setError(error.message); }
        }).finally(() => { if (active) setBusy(false); });
        return () => { active = false; };
    }, [page, revision]);
    const organizations = snapshot?.organizations.status === 'ok' ? snapshot.organizations.data : null;
    const logs = snapshot?.logs.status === 'ok' ? snapshot.logs.data : null;
    const billing = snapshot?.billing.status === 'ok' ? snapshot.billing.data : null;
    const health = snapshot?.infrastructure.status === 'ok' ? snapshot.infrastructure.data : null;
    const changePage = (next) => { setBusy(true); setPage(next); };
    const button = 'rounded border border-outline-variant px-4 py-2 hover:bg-surface-container-high disabled:opacity-50';
    return <main className="min-h-screen bg-background text-on-surface p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div><h1 className="text-3xl font-bold">Platform administration</h1>
                    {snapshot && <p className="mt-2 text-sm text-on-surface-variant">Updated {new Date(snapshot.generatedAt).toLocaleString()}</p>}
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/app/dashboard" className="text-primary underline">Workspace</Link>
                    <button disabled={busy} className={button} onClick={() => { setBusy(true); setRevision((value) => value + 1); }}>Refresh</button>
                </div>
            </header>
            {busy && <p role="status">Loading platform dataâ€¦</p>}
            {error && <p role="alert" className="text-red-400">{error}</p>}
            {!busy && snapshot && <>
                <PlatformReports />
                {selectedTenant && <PlatformTenant key={selectedTenant} orgId={selectedTenant} />}
                <section aria-label="Platform metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Workspaces', organizations?.total],
                        ['Stored logs (estimate)', logs?.storedEstimate],
                        ['Logs received in 24 hours', logs?.receivedLast24Hours],
                        ['Tenants with logs in 24 hours', logs?.activeTenantsLast24Hours]
                    ].map(([label, value]) => <div key={label} className="rounded-xl border border-outline-variant bg-surface-container p-5">
                        <p className="text-sm text-on-surface-variant">{label}</p><p className="mt-3 text-3xl font-bold">{number(value)}</p>
                    </div>)}
                </section>
                <section className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-outline-variant p-5">
                        <h2 className="text-xl font-bold">Infrastructure</h2>
                        {health ? <><p className="my-3">Readiness â€” {health.status}</p><ul className="space-y-2">
                            {Object.entries(health.checks).map(([name, status]) => <li key={name} className="flex justify-between gap-4">
                                <span>{name}</span><span className={status === 'ok' ? 'text-green-400' : 'text-red-400'}>{status}</span>
                            </li>)}
                        </ul></> : <p className="mt-3">Health checks are unavailable.</p>}
                    </div>
                    <div className="rounded-xl border border-outline-variant p-5">
                        <h2 className="text-xl font-bold">Subscription status</h2>
                        <p className="my-3 text-sm text-on-surface-variant">Current subscription states stored by billing synchronization.</p>
                        {billing ? <ul className="space-y-2">{[['Active', billing.active], ['Trialing', billing.trialing], ['Past due', billing.pastDue]].map(([label, value]) =>
                            <li key={label} className="flex justify-between"><span>{label}</span><span>{number(value)}</span></li>)}</ul>
                            : <p>Subscription counts are unavailable.</p>}
                    </div>
                </section>
                <section className="rounded-xl border border-outline-variant p-5">
                    <h2 className="text-xl font-bold mb-4">Workspaces</h2>
                    {organizations ? <>
                        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
                            <thead><tr className="border-b border-outline-variant">{['Workspace', 'ID', 'Plan', 'Subscription'].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead>
                            <tbody>{organizations.items.map((org) => <tr key={org.id} className="border-b border-outline-variant/40">
                                <td className="p-3"><button className="text-primary underline" onClick={() => setSelectedTenant(org.id)}>{org.name}</button></td><td className="p-3 font-mono">{org.id}</td><td className="p-3">{org.plan_tier}</td><td className="p-3">{org.subscription_status || 'Unspecified'}</td>
                            </tr>)}</tbody>
                        </table></div>
                        {organizations.items.length === 0 && <p className="py-4">No workspaces on this page.</p>}
                        <div className="mt-4 flex gap-4 items-center">
                            <button disabled={page <= 1} className={button} onClick={() => changePage(page - 1)}>Previous</button>
                            <span>Page {page}</span>
                            <button disabled={page * organizations.limit >= organizations.total} className={button} onClick={() => changePage(page + 1)}>Next</button>
                        </div>
                    </> : <p>Workspace data is unavailable.</p>}
                </section>
            </>}
        </div>
    </main>;
}
