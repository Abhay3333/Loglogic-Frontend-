import { supabase } from '../lib/supabase';
import { docsApiBase, playgroundOperations, redactDocsText } from '../lib/docsApi';

async function readBounded(response) {
    if (!response.body) return '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = '';
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > 1048576) throw new Error('Response exceeds 1 MiB. Narrow your query.');
            text += decoder.decode(value, { stream: true });
        }
        return text + decoder.decode();
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

export async function runPlayground({ operation, authMode, apiKey = '', body, orgId, signal }) {
    const endpoint = playgroundOperations[operation];
    if (!endpoint || !endpoint.auth.includes(authMode)) throw new Error('Choose a supported endpoint and authentication method.');
    const base = new URL(docsApiBase);
    if (base.username || base.password || base.search || base.hash
        || !(base.protocol === 'https:' || (base.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)))) {
        throw new Error('Configure an HTTPS backend or loopback HTTP API before sending credentials.');
    }
    if (new TextEncoder().encode(body).byteLength > 65536) throw new Error('Playground requests are limited to 64 KiB.');
    let payload;
    try { payload = JSON.parse(body); } catch { throw new Error('Enter valid JSON.'); }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('The playground expects a JSON object. Use the integration guides for array batches.');
    for (const name of ['startDate', 'endDate']) {
        if (payload[name] !== undefined && (typeof payload[name] !== 'string' || !Number.isFinite(Date.parse(payload[name])))) throw new Error('Use a valid ISO date for date filters.');
    }
    const headers = { 'Content-Type': 'application/json' };
    let sessionToken = '';
    if (authMode === 'key') {
        apiKey = apiKey.trim();
        if (!apiKey || apiKey.length > 256) throw new Error('Enter an API key with the required scope.');
        headers['X-API-KEY'] = apiKey;
    } else {
        let current;
        try { current = await supabase.auth.getSession(); }
        catch { throw new Error('Sign in before using your session.'); }
        const { data, error } = current;
        sessionToken = data?.session?.access_token || '';
        if (error || !sessionToken) throw new Error('Sign in before using your session.');
        if (!orgId) throw new Error('Choose your workspace.');
        payload.orgId = orgId;
        headers.Authorization = `Bearer ${sessionToken}`;
    }
    const started = performance.now();
    const combinedSignal = AbortSignal.any([AbortSignal.timeout(20000), ...(signal ? [signal] : [])]);
    try {
        combinedSignal.throwIfAborted();
        const response = await fetch(`${docsApiBase}${endpoint.path}`, {
            method: endpoint.method, headers, body: JSON.stringify(payload),
            redirect: 'error', credentials: 'omit', cache: 'no-store', signal: combinedSignal
        });
        const text = redactDocsText(await readBounded(response), [apiKey, sessionToken]);
        return { status: response.status, ok: response.ok, elapsedMs: Math.round(performance.now() - started),
            contentType: response.headers.get('content-type') || '', retryAfter: response.headers.get('retry-after'),
            requestId: response.headers.get('x-request-id'), text };
    } catch (error) {
        if (error.message.startsWith('Response exceeds')) throw error;
        if (combinedSignal.aborted) throw new Error('Request cancelled or timed out. A timed-out ingestion request may already have been accepted.');
        throw new Error('Request unavailable. Check the API connection and allowed frontend origin.');
    }
}
