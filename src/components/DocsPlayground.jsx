import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getOrganizations } from '../api/organization';
import { runPlayground } from '../api/playground';
import { docsApiBase, playgroundOperations, docsCurl, redactDocsText } from '../lib/docsApi';
import DocsCode from './DocsCode';

export default function DocsPlayground() {
    const [operation, setOperation] = useState('ingest');
    const [authMode, setAuthMode] = useState('key');
    const [apiKey, setApiKey] = useState('');
    const [body, setBody] = useState(JSON.stringify(playgroundOperations.ingest.sample, null, 2));
    const [userId, setUserId] = useState('');
    const [workspaces, setWorkspaces] = useState([]);
    const [orgId, setOrgId] = useState('');
    const [workspaceError, setWorkspaceError] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const request = useRef(null);
    const clearRequest = useCallback(() => {
        request.current?.abort(); request.current = null;
        setBusy(false); setResult(null); setError('');
    }, []);
    useEffect(() => {
        let active = true;
        const update = (session) => {
            if (!active) return;
            clearRequest(); setApiKey(''); setUserId(session?.user?.id || '');
        };
        supabase.auth.getSession().then(({ data }) => update(data?.session)).catch(() => update(null));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => update(session));
        return () => { active = false; subscription.unsubscribe(); request.current?.abort(); };
    }, [clearRequest]);
    useEffect(() => {
        let active = true;
        const load = userId ? getOrganizations() : Promise.resolve({ organizations: [] });
        load.then(({ organizations = [] }) => {
            if (!active) return;
            setWorkspaces(organizations); setOrgId(organizations[0]?.id || ''); setWorkspaceError('');
        }).catch(() => { if (active) { setWorkspaces([]); setOrgId(''); setWorkspaceError('Unable to load workspaces. Sign in again or retry after reloading.'); } });
        return () => { active = false; };
    }, [userId]);
    const endpoint = playgroundOperations[operation];
    async function send(event) {
        event.preventDefault(); clearRequest(); setBusy(true);
        const controller = new AbortController(); request.current = controller;
        try {
            const response = await runPlayground({ operation, authMode, apiKey, body, orgId, signal: controller.signal });
            if (request.current === controller) setResult(response);
        } catch (error) { if (request.current === controller) setError(error.message); }
        finally { if (request.current === controller) { request.current = null; setBusy(false); } }
    }
    let responseText = result?.text || '';
    try { responseText = JSON.stringify(JSON.parse(responseText), null, 2); } catch { /* Plain-text errors stay readable. */ }
    let previewBody = body;
    try {
        if (authMode === 'session') previewBody = JSON.stringify({ ...JSON.parse(body), orgId }, null, 2);
    } catch { /* Invalid JSON remains visible for correction. */ }
    const preview = docsCurl(operation, redactDocsText(previewBody, [apiKey.trim()]), authMode);
    const input = 'block w-full mt-2 rounded border border-outline-variant bg-surface-container-high p-3';
    return <section id="playground" className="scroll-mt-28 rounded-xl border border-outline-variant p-5 md:p-7 space-y-4">
        <h2 className="text-2xl font-bold">API playground</h2>
        <p>Requests go to <span className="font-mono break-all">{docsApiBase}</span>. Ingestion sends a real event and uses your workspace quota.</p>
        <form onSubmit={send} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <label>Endpoint<select value={operation} className={input} onChange={(event) => {
                    const id = event.target.value; clearRequest(); setApiKey(''); setOperation(id);
                    setAuthMode(playgroundOperations[id].auth[0]); setBody(JSON.stringify(playgroundOperations[id].sample, null, 2));
                }}>{Object.entries(playgroundOperations).map(([id, value]) => <option key={id} value={id}>{value.method} {value.path}</option>)}</select></label>
                <label>Authentication<select value={authMode} className={input} onChange={(event) => { clearRequest(); setApiKey(''); setAuthMode(event.target.value); }}>
                    {endpoint.auth.map((mode) => <option key={mode} value={mode}>{mode === 'key' ? 'Scoped API key' : 'Current signed-in session'}</option>)}
                </select></label>
            </div>
            {authMode === 'key' ? <label className="block">API key ({operation === 'ingest' ? 'logs:ingest' : 'logs:query'} required)
                <input type="password" disabled={busy} autoComplete="off" maxLength={256} value={apiKey} className={input} onChange={(event) => setApiKey(event.target.value)} required />
            </label> : <div className="space-y-3">
                {!userId && <p><Link to="/login" className="text-primary underline">Sign in</Link> to use your session, or select an API key.</p>}
                {workspaceError && <p role="alert" className="text-red-400">{workspaceError}</p>}
                <label className="block">Workspace<select value={orgId} className={input} onChange={(event) => { clearRequest(); setOrgId(event.target.value); }} disabled={!userId}>
                    <option value="">Choose a workspace</option>{workspaces.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
                </select></label>
            </div>}
            <label className="block">JSON body<textarea rows={9} disabled={busy} spellCheck="false" className={`${input} font-mono text-sm`} value={body} onChange={(event) => setBody(event.target.value)} /></label>
            <p className="text-sm text-on-surface-variant">Pasted API keys stay in memory and request headers. Request previews use environment-variable placeholders. Requests are capped at 64 KiB and responses at 1 MiB. Cancellation or timeout can follow server acceptance; check logs before resending.</p>
            <div className="flex gap-4">
                <button disabled={busy || (authMode === 'session' && (!userId || !orgId))} className="rounded bg-primary text-on-primary px-5 py-2 disabled:opacity-50">{busy ? 'Sending...' : 'Send request'}</button>
                <button type="button" onClick={() => { clearRequest(); setApiKey(''); }} className="rounded border border-outline-variant px-4 py-2">{busy ? 'Cancel and clear' : 'Clear credentials and response'}</button>
            </div>
        </form>
        {error && <p role="alert" className="text-red-400">{error}</p>}
        {result && <div aria-label="API response" className="space-y-2">
            <p role="status">HTTP {result.status} / {result.elapsedMs} ms / {result.contentType}</p>
            {result.requestId && <p className="font-mono break-all">Request ID {result.requestId}</p>}
            {result.retryAfter && <p>Retry after {result.retryAfter} seconds.</p>}
            <pre className="max-h-96 overflow-auto bg-background rounded p-4 whitespace-pre-wrap text-sm">{responseText}</pre>
            {operation === 'ingest' && result.status === 202 && <p>Buffered. Verify persistence in Historical Logs or Live Tail after processing.</p>}
        </div>}
        <details><summary className="cursor-pointer text-primary">Copy a request template</summary><DocsCode label="Request template" code={preview} /></details>
    </section>;
}
