import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

test('documentation navigation, guides, copy controls and authenticated playground work without credential persistence', async (t) => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/docs' });
    const originalFetch = globalThis.fetch;
    const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    globalThis.window = dom.window; globalThis.document = dom.window.document;
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
    const copied = [], requests = [];
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text) => copied.push(text) } });
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    let authChanged;
    const session = { user: { id: 'docs-user' }, access_token: 'private-session-token' };
    globalThis.__docsSupabase = { auth: { getSession: async () => ({ data: { session } }),
        onAuthStateChange: (callback) => { authChanged = callback; return { data: { subscription: { unsubscribe() {} } } }; } } };
    globalThis.fetch = async (url, options) => {
        if (String(url).includes('/guides/')) {
            const name = String(url).split('/guides/')[1];
            return new Response(fs.readFileSync(new URL(`../public/guides/${name}`, import.meta.url), 'utf8'));
        }
        requests.push({ url, options });
        return new Response(JSON.stringify({ status: 'accepted', echo: options.headers['X-API-KEY'] || 'private-session-token' }),
            { status: 202, headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'docs-fixture' } });
    };
    const { createElement, act } = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { MemoryRouter } = await import('react-router-dom');
    const root = createRoot(document.getElementById('root'));
    const server = await createServer({ cacheDir: fileURLToPath(new URL('../../.gravitas/sessions/phase17-docs/vite-cache/docs-ui', import.meta.url)), configFile: false, plugins: [{
        name: 'docs-auth-fixture', enforce: 'pre',
        resolveId(id) {
            if (id.endsWith('/lib/supabase')) return '\0docs-supabase';
            if (id.endsWith('/api/organization')) return '\0docs-organizations';
        },
        load(id) {
            if (id === '\0docs-supabase') return 'export const supabase = globalThis.__docsSupabase;';
            if (id === '\0docs-organizations') return 'export const getOrganizations = async () => ({organizations:[{id:"workspace-fixture",name:"Fixture workspace"}]});';
        }
    }, react()], server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
    t.after(async () => {
        await act(async () => root.unmount()); await server.close(); dom.window.close();
        globalThis.fetch = originalFetch;
        delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT; delete globalThis.__docsSupabase;
        if (navigatorDescriptor) Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
        else delete globalThis.navigator;
    });
    const { default: Docs } = await server.ssrLoadModule('/src/pages/Docs.jsx');
    await act(async () => root.render(createElement(MemoryRouter, { initialEntries: ['/docs'] }, createElement(Docs))));
    async function fill(input, value) {
        await act(async () => {
            const prototype = input.tagName === 'SELECT' ? dom.window.HTMLSelectElement.prototype : input.tagName === 'TEXTAREA' ? dom.window.HTMLTextAreaElement.prototype : dom.window.HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, value);
            input.dispatchEvent(new dom.window.Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
        });
    }
    async function click(element) { assert.ok(element); await act(async () => element.click()); }
    async function send() { await act(async () => document.querySelector('#playground form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))); }
    assert.equal(requests.length, 0);
    assert.match(document.getElementById('ingestLogs').textContent, /65536/);
    const guideSelect = document.querySelector('#guides select');
    assert.equal(guideSelect.options.length, 10);
    for (const option of [...guideSelect.options]) {
        await fill(guideSelect, option.value);
        assert.match(document.querySelector('#guides article h3').textContent, new RegExp(option.textContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        assert.ok(document.querySelectorAll('#guides a[download]').length >= 1);
        assert.ok(!document.querySelector('#guides').textContent.includes('api.loglogic.io'));
    }
    await click(document.querySelector('button[aria-label="Copy curl"]'));
    assert.ok(copied[0].includes('$LOGLOGIC_API_KEY'));
    await fill(document.querySelector('#playground input[type="password"]'), 'private-api-key');
    await send();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].options.headers['X-API-KEY'], 'private-api-key');
    assert.match(document.querySelector('[aria-label="API response"]').textContent, /HTTP 202/);
    assert.doesNotMatch(document.querySelector('[aria-label="API response"]').textContent, /private-api-key/);
    await click(document.querySelector('button[aria-label="Copy Request template"]'));
    assert.ok(!copied.at(-1).includes('private-api-key'));
    await fill(document.querySelector('#playground select'), 'query');
    assert.equal(document.querySelector('[aria-label="API response"]'), null);
    assert.equal(document.querySelector('#playground input[type="password"]'), null);
    await send();
    assert.equal(requests[1].options.headers.Authorization, 'Bearer private-session-token');
    assert.equal(requests[1].options.headers['X-API-KEY'], undefined);
    assert.equal(JSON.parse(requests[1].options.body).orgId, 'workspace-fixture');
    await fill(document.querySelector('#playground select'), 'ingest');
    assert.equal(document.querySelector('#playground input[type="password"]').value, '');
    await fill(document.querySelector('#playground textarea'), '{');
    await fill(document.querySelector('#playground input[type="password"]'), 'private-api-key');
    await send();
    assert.match(document.querySelector('#playground [role="alert"]').textContent, /valid JSON/);
    assert.equal(requests.length, 2);
    await act(async () => authChanged('SIGNED_OUT', null));
    assert.equal(document.querySelector('#playground input[type="password"]').value, '');
    await fill(document.querySelector('#reference input[type="search"]'), 'export');
    assert.equal(document.querySelectorAll('#reference > details').length, 1);
    assert.match(document.querySelector('#reference > details').textContent, /text\/csv/);
    assert.ok(document.querySelector('#reference a[download="loglogic-openapi.json"]'));
    assert.equal(dom.window.localStorage.length, 0);
    assert.equal(dom.window.sessionStorage.length, 0);
});
