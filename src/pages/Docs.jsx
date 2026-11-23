import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DocsCode from '../components/DocsCode';
import DocsReference from '../components/DocsReference';
import DocsPlayground from '../components/DocsPlayground';
import { docsApiBase } from '../lib/docsApi';
import { guides } from '../docs/guides';

function GuideFiles({ guide }) {
    const [files, setFiles] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        Promise.all(guide.files.map(async (name) => {
            const response = await fetch(`${import.meta.env.BASE_URL}guides/${name}`, { credentials: 'omit', signal: controller.signal });
            if (!response.ok) throw new Error('Example unavailable');
            return { name, text: await response.text() };
        })).then(setFiles).catch(() => { if (!controller.signal.aborted) setError('Unable to load example files. Reload to retry.'); });
        return () => controller.abort();
    }, [guide]);
    return <div>{error && <p role="alert">{error}</p>}{!files && !error && <p role="status">Loading examples...</p>}
        {files?.map(({ name, text }) => <div key={name}>
            <a href={`${import.meta.env.BASE_URL}guides/${name}`} download={name} className="text-primary underline">Download {name}</a>
            <DocsCode label={name} code={text} />
        </div>)}
    </div>;
}

export default function DocsPage() {
    const [params, setParams] = useSearchParams();
    const guide = guides.find((item) => item.id === params.get('guide')) || guides[0];
    const sample = JSON.stringify({ service: 'docs-demo', level: 'info', message: 'Hello from LogLogic', metadata: { source: 'quickstart' } }, null, 2);
    const env = `LOGLOGIC_URL=${docsApiBase}\nLOGLOGIC_API_KEY=<your-ingestion-key>`;
    const curl = `curl --max-time 5 -X POST "$LOGLOGIC_URL/v1/ingest" -H "Content-Type: application/json" -H "X-API-KEY: $LOGLOGIC_API_KEY" --data '${sample}'`;
    const powershell = `Invoke-RestMethod -Method Post -Uri "$env:LOGLOGIC_URL/v1/ingest" -Headers @{"X-API-KEY"=$env:LOGLOGIC_API_KEY} -ContentType "application/json" -Body '${sample}'`;
    return <main className="min-h-screen pt-28 pb-20 px-4 md:px-8 bg-background text-on-surface">
        <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] gap-10">
            <aside className="mb-8 lg:mb-0"><nav aria-label="Documentation" className="lg:sticky lg:top-24 flex lg:flex-col flex-wrap gap-4 text-sm">
                <a href="#quickstart" className="text-primary">Quickstart</a><a href="#authentication">Authentication</a>
                <a href="#guides">Integration guides</a><a href="#reference">API reference</a><a href="#playground">Playground</a><a href="#troubleshooting">Troubleshooting</a>
            </nav></aside>
            <div className="min-w-0 space-y-12">
                <header><h1 className="text-4xl md:text-5xl font-bold">Developer documentation</h1><p className="mt-4 text-on-surface-variant">Send your first event, integrate your service and explore the API.</p></header>
                <section id="quickstart" className="scroll-mt-28 space-y-4">
                    <h2 className="text-2xl font-bold">Quickstart</h2>
                    <ol className="list-decimal pl-6 space-y-3">
                        <li><Link to="/app/onboarding" className="text-primary underline">Create a workspace</Link> or open your existing workspace.</li>
                        <li>Open <Link to="/app/settings?tab=api-keys" className="text-primary underline">Settings / API Keys</Link> and create an ingestion-scoped key. The raw key is shown once.</li>
                        <li>Set these environment values on your server. Use your deployed HTTPS backend or localhost for local development.</li>
                    </ol>
                    <DocsCode label="Server environment" code={env} />
                    <p>In a POSIX shell, export the variables. In PowerShell use <code>$env:LOGLOGIC_URL</code> and <code>$env:LOGLOGIC_API_KEY</code>. Keep the values in a private environment file or secret manager.</p>
                    <details open><summary className="text-primary cursor-pointer">Send with curl (POSIX shell)</summary><DocsCode label="curl" code={curl} /></details>
                    <details><summary className="text-primary cursor-pointer">Send with PowerShell</summary><DocsCode label="PowerShell" code={powershell} /></details>
                    <p>After HTTP 202, open <Link to="/app/logs" className="text-primary underline">Historical Logs</Link> and search for service <code>docs-demo</code>. <Link to="/app/live" className="text-primary underline">Live Tail</Link> requires Pro or Enterprise and log-view permission.</p>
                </section>
                <section id="authentication" className="scroll-mt-28 space-y-4">
                    <h2 className="text-2xl font-bold">Authentication and delivery</h2>
                    <ul className="list-disc pl-5 space-y-3">
                        <li><code>X-API-KEY</code> with <code>logs:ingest</code> sends events. <code>logs:query</code> grants query/statistics reads. The key fixes the tenant. Optional CIDRs restrict the requesting IP.</li>
                        <li>Bearer sessions use workspace membership, permissions, temporary-access expiry and SSO policy. Query/statistics accept either method. Key management, saved queries, CSV exports and live streams require sessions.</li>
                        <li>Use exactly one authentication method. Keep keys server-side. Playground inputs stay in memory and are cleared when the endpoint, authentication method or session changes.</li>
                        <li>Send <code>metadata</code> for structured attributes. Logs require service, level and message. See the schema for accepted levels, timestamps and batch formats.</li>
                        <li>HTTP 202 acknowledges the buffer. It includes any privacy-suppressed count. Verify persisted events after the worker processes them. Delivery retries can duplicate a newly submitted request after an ambiguous timeout.</li>
                    </ul>
                </section>
                <section id="guides" className="scroll-mt-28 space-y-5">
                    <h2 className="text-2xl font-bold">Integration guides</h2>
                    <label className="block">Platform<select value={guide.id} onChange={(event) => setParams({ guide: event.target.value })} className="block mt-2 w-full rounded border border-outline-variant bg-surface-container-high p-3">
                        {guides.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                    </select></label>
                    <article className="rounded-xl border border-outline-variant p-5 md:p-7 space-y-4">
                        <h3 className="text-xl font-bold">{guide.title}</h3><p>{guide.requirement}</p>
                        <p className="text-sm text-on-surface-variant">Commands use a POSIX shell, including WSL or Git Bash on Windows. The Quickstart includes a PowerShell request.</p>
                        <ol className="list-decimal pl-6 space-y-3">{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                        <DocsCode label="Setup and run" code={guide.command} />
                        <p className="text-sm text-on-surface-variant">{guide.note}</p>
                        <a href={guide.source} target="_blank" rel="noreferrer" className="text-primary underline">Official platform reference</a>
                        <GuideFiles key={guide.id} guide={guide} />
                    </article>
                </section>
                <DocsReference />
                <DocsPlayground />
                <section id="troubleshooting" className="scroll-mt-28 space-y-4">
                    <h2 className="text-2xl font-bold">Troubleshooting</h2>
                    <dl className="space-y-4">
                        <div><dt className="font-bold">400 / 413</dt><dd>Check field names, JSON, ISO dates and body size. A batch allows up to 1,000 logs, while Kafka also limits the serialized record to 900,000 bytes. Split large batches.</dd></div>
                        <div><dt className="font-bold">401 / 403 / 402</dt><dd>Check credentials, key scope/CIDRs, workspace permissions, expiry, SSO enforcement and ingestion suspension. A 402 on Live Tail indicates a plan requirement.</dd></div>
                        <div><dt className="font-bold">429</dt><dd>Queue backpressure includes Retry-After 5. Monthly quota rejection needs a plan or cap change. Inspect the response code before retrying.</dd></div>
                        <div><dt className="font-bold">503 or browser connection error</dt><dd>Check dependency readiness and the configured frontend origin in backend CORS. The playground uses the same API configuration as the application. A browser-blocked response can follow server acceptance.</dd></div>
                        <div><dt className="font-bold">Accepted event is missing</dt><dd>Check the selected workspace, service, date filters, worker readiness, queue lag and privacy-suppressed count. Query totals reflect retained data. Statistics can be cached for up to 60 seconds.</dd></div>
                    </dl>
                    <p>Team/access, billing, alerting, integrations, audit/privacy/SSO and platform administration retain their application-specific permissions. Configure those features through Workspace Settings or the platform console.</p>
                </section>
            </div>
        </div>
    </main>;
}
