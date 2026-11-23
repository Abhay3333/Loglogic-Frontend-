import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function harness(base = 'http://localhost:5000') {
    const requests = [];
    let token = 'session-token';
    let response = () => new Response('{"status":"accepted"}', { status: 202 });
    const context = {
        URL, AbortSignal, AbortController, TextEncoder, TextDecoder, performance,
        env: { VITE_API_LOCAL_URL: base },
        supabase: { auth: { getSession: async () => ({ data: { session: token ? { access_token: token } : null } }) } },
        fetch: async (url, options) => { requests.push({ url, options }); return response(); }
    };
    vm.createContext(context);
    const helpers = fs.readFileSync(new URL('../src/lib/docsApi.js', import.meta.url), 'utf8')
        .replaceAll('import.meta.env', 'env').replaceAll('export const ', 'const ').replaceAll('export function ', 'function ');
    const api = fs.readFileSync(new URL('../src/api/playground.js', import.meta.url), 'utf8')
        .replace(/^import .*;\r?\n/gm, '').replace('export async function ', 'async function ');
    vm.runInContext(helpers + '\n' + api + '\nglobalThis.api = { runPlayground, docsCurl, redactDocsText };', context);
    return { ...context.api, requests, setToken(value) { token = value; }, setResponse(value) { response = value; } };
}

test('playground pins endpoints, uses one header credential, rejects redirects and uses the current workspace/session', async () => {
    const h = harness();
    await h.runPlayground({ operation: 'ingest', authMode: 'key', apiKey: 'fixture-key', body: '{"service":"demo","level":"info","message":"hello"}' });
    assert.equal(h.requests[0].url, 'http://localhost:5000/v1/ingest');
    assert.equal(h.requests[0].options.headers['X-API-KEY'], 'fixture-key');
    assert.equal(h.requests[0].options.headers.Authorization, undefined);
    assert.equal(h.requests[0].options.redirect, 'error');
    assert.equal(h.requests[0].options.credentials, 'omit');
    assert.ok(!h.requests[0].url.includes('fixture-key'));
    h.setToken('new-session');
    await h.runPlayground({ operation: 'query', authMode: 'session', body: '{"orgId":"forged","limit":25}', orgId: 'selected' });
    assert.equal(h.requests[1].options.headers.Authorization, 'Bearer new-session');
    assert.equal(h.requests[1].options.headers['X-API-KEY'], undefined);
    assert.equal(JSON.parse(h.requests[1].options.body).orgId, 'selected');
    await assert.rejects(h.runPlayground({ operation: 'https://other.example', authMode: 'key', body: '{}' }));
    await assert.rejects(h.runPlayground({ operation: 'ingest', authMode: 'session', body: '{}' }));
    h.setToken('');
    await assert.rejects(h.runPlayground({ operation: 'query', authMode: 'session', body: '{}', orgId: 'selected' }), /Sign in/);
    assert.equal(h.requests.length, 2);
});

test('playground bounds request/response sizes, redacts echoed credentials and preserves retry diagnostics', async () => {
    const h = harness();
    const request = { operation: 'query', authMode: 'key', apiKey: 'fixture-key', body: '{}' };
    for (const body of ['bad json', '[]', 'null', 'x'.repeat(65537), '{"startDate":"undefined"}']) {
        await assert.rejects(h.runPlayground({ ...request, body }));
    }
    assert.equal(h.requests.length, 0);
    h.setResponse(() => new Response('fixture-key Bearer some-token', { status: 429, headers: { 'Retry-After': '5', 'X-Request-Id': 'request-1' } }));
    const result = await h.runPlayground(request);
    assert.equal(result.status, 429); assert.equal(result.retryAfter, '5'); assert.equal(result.requestId, 'request-1');
    assert.ok(!result.text.includes('fixture-key')); assert.ok(!result.text.includes('some-token'));
    h.setResponse(() => new Response('x'.repeat(1048577)));
    await assert.rejects(h.runPlayground(request), /1 MiB/);
    const controller = new AbortController(); controller.abort();
    const before = h.requests.length;
    await assert.rejects(h.runPlayground({ ...request, signal: controller.signal }), /cancelled/);
    assert.equal(h.requests.length, before);
});

test('playground refuses credential-bearing URLs and non-loopback plaintext; copy templates keep secrets in environment variables', async () => {
    for (const url of ['http://example.com', 'https://user:password@example.com', 'https://example.com?token=bad']) {
        const h = harness(url);
        await assert.rejects(h.runPlayground({ operation: 'ingest', authMode: 'key', apiKey: 'fixture-key', body: '{}' }));
        assert.equal(h.requests.length, 0);
    }
    const h = harness();
    const secret = 'll_prod_' + 'a'.repeat(64);
    const copied = h.docsCurl('ingest', JSON.stringify({ message: "a'b $(whoami)", metadata: { accidentalKey: secret } }), 'key');
    assert.ok(!copied.includes(secret));
    assert.ok(copied.includes('$LOGLOGIC_API_KEY'));
    assert.ok(copied.includes("'\\''"));
    assert.ok(!h.docsCurl('query', '{}', 'session').includes('session-token'));
});
