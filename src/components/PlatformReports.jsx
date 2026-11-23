import { useState } from 'react';
import { getPlatformQueues, getPlatformRevenue } from '../api/platform';

export default function PlatformReports() {
    const [queues, setQueues] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    async function load(kind) {
        setBusy(true); setError('');
        try {
            if (kind === 'queues') setQueues(await getPlatformQueues());
            else setRevenue(await getPlatformRevenue());
        } catch (error) { setError(error.message); }
        finally { setBusy(false); }
    }
    return <section className="rounded-xl border border-outline-variant p-5 space-y-4">
        <h2 className="text-xl font-bold">Revenue and queues</h2>
        <div className="flex gap-3 flex-wrap">
            <button disabled={busy} onClick={() => load('revenue')} className="rounded border border-outline-variant px-4 py-2 disabled:opacity-50">Load Stripe revenue</button>
            <button disabled={busy} onClick={() => load('queues')} className="rounded border border-outline-variant px-4 py-2 disabled:opacity-50">Inspect queue depths</button>
        </div>
        {busy && <p role="status">Loading report...</p>}
        {error && <p role="alert" className="text-red-400">{error}</p>}
        {revenue && <div className="space-y-2">
            <h3 className="font-bold">Paid invoice amounts</h3><p>{revenue.basis}</p>
            <p>From {new Date(revenue.since).toLocaleString()} - {revenue.invoiceCount} invoices</p>
            {Object.entries(revenue.totalsMinorUnits).map(([currency, amount]) => <p key={currency}>{currency.toUpperCase()} - {amount.toLocaleString()} minor units</p>)}
            {revenue.invoiceCount === 0 && <p>No matching paid invoices.</p>}
            {!revenue.complete && <p role="status" className="text-amber-400">Partial report. The 500-invoice retrieval limit was reached.</p>}
        </div>}
        {queues && <div className="space-y-3"><p>Active ingestion mode - {queues.mode}</p>
            <p>API process uptime {queues.process.uptimeSeconds}s / RSS {Math.round(queues.process.rssBytes / 1048576)} MiB / Heap {Math.round(queues.process.heapUsedBytes / 1048576)} MiB</p>
            <p>Worker mode - {queues.process.workerStandalone ? 'Standalone workers' : 'Unified workers'}</p>
            {queues.kafka.map((row) => <p key={row.lane}>Kafka {row.lane} - {row.status === 'ok' ? `${row.lag} retained offset lag` : 'Unavailable'}</p>)}
            {queues.bullmq.map((row) => <div key={row.name}><h3 className="font-mono break-all">{row.name}</h3>
                {row.status === 'ok' ? <p>{Object.entries(row.counts).map(([key, value]) => `${key} ${value}`).join(' / ')}</p> : <p>Unavailable</p>}
            </div>)}
        </div>}
    </section>;
}
