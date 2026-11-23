import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

// Exercise the actual React components with explicit external-service adapters.
test('Stage 1 console interactions verify MFA, controls and scoped support', async (t) => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' });
    globalThis.window = dom.window; globalThis.document = dom.window.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const { createElement, act } = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { MemoryRouter } = await import('react-router-dom');
    const root = createRoot(document.getElementById('root'));
    const calls = [];
    let invalidCode = true, granted = false;
    const tenant = { organization: { name: 'Fixture workspace' }, controls: { suspended: false, monthly_log_limit: null, revision: 3 },
        usage: { admit: 4, written: 3 }, storedLogs: 3, apiKeys: [], activity: [] };
    globalThis.__platformSupabase = { auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
        mfa: {
            listFactors: async () => ({ data: { totp: [] } }),
            enroll: async (input) => { calls.push(['enroll', input]); return { data: { id: 'factor', totp: { secret: 'setup-secret', qr_code: '<svg xmlns="http://www.w3.org/2000/svg"/>' } } }; },
            challengeAndVerify: async (input) => {
                calls.push(['verify', input]);
                if (invalidCode) return { error: new Error('Invalid code') };
                granted = true; return { data: {} };
            }
        }
    } };
    globalThis.__platformApi = {
        verifyPlatformAccess: async () => { if (!granted) throw Object.assign(new Error('MFA'), { status: 403, code: 'mfa_required' }); return {}; },
        getPlatformTenant: async () => tenant,
        setPlatformControls: async (id, body) => { calls.push(['controls', id, body]); return {}; },
        startSupportSession: async (id, reason) => { calls.push(['start', id, reason]); return { id: 'support', token: 'private-support-token', orgId: id, expiresAt: new Date(Date.now() + 60000).toISOString() }; },
        endSupportSession: async (id) => { calls.push(['end', id]); return {}; },
        querySupportLogs: async (token, body) => { calls.push(['query', token, body]); return { logs: [{ _id: 'log', service: 'fixture', level: 'info', message: '<script>unsafe()</script>' }], pagination: { page: 1, totalPages: 1 } }; }
    };
    const server = await createServer({ cacheDir: fileURLToPath(new URL('../../.gravitas/sessions/phase17-docs/vite-cache/platform-ui', import.meta.url)), configFile: false, plugins: [{
        name: 'platform-service-fixtures', enforce: 'pre',
        resolveId(id) {
            if (id.endsWith('/lib/supabase')) return '\0platform-supabase';
            if (id.endsWith('/api/platform')) return '\0platform-api';
        },
        load(id) {
            if (id === '\0platform-supabase') return 'export const supabase = globalThis.__platformSupabase;';
            if (id === '\0platform-api') return Object.keys(globalThis.__platformApi).map((key) => `export const ${key} = (...args) => globalThis.__platformApi.${key}(...args);`).join('\n');
        }
    }, react()], server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
    t.after(async () => {
        await act(async () => root.unmount()); await server.close(); dom.window.close();
        delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT;
        delete globalThis.__platformApi; delete globalThis.__platformSupabase;
    });
    async function render(Component, props) {
        await act(async () => root.render(createElement(MemoryRouter, {}, createElement(Component, props))));
    }
    async function click(element) { assert.ok(element); await act(async () => element.click()); }
    async function fill(element, value) {
        assert.ok(element);
        await act(async () => {
            const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set;
            setter.call(element, value);
            element.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
        });
    }
    async function submit(form) { await act(async () => form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))); }
    const button = (text) => [...document.querySelectorAll('button')].find((element) => element.textContent.includes(text));
    const { default: Gate } = await server.ssrLoadModule('/src/components/PlatformAccessGate.jsx');
    await render(Gate, { children: createElement('p', {}, 'Protected platform data') });
    assert.match(document.body.textContent, /Verify your identity/);
    assert.doesNotMatch(document.body.textContent, /Protected platform data/);
    await click(button('Set up authenticator'));
    assert.match(document.querySelector('img').src, /^data:image\/svg/);
    assert.equal(calls.filter(([name]) => name === 'enroll').length, 1);
    await fill(document.getElementById('mfa-code'), '123456');
    await submit(document.querySelector('form'));
    assert.match(document.body.textContent, /Verification failed/);
    assert.doesNotMatch(document.body.textContent, /Protected platform data/);
    invalidCode = false;
    await fill(document.getElementById('mfa-code'), '654321');
    await submit(document.querySelector('form'));
    assert.match(document.body.textContent, /Protected platform data/);
    assert.doesNotMatch(document.body.textContent, /setup-secret/);

    const { default: Tenant } = await server.ssrLoadModule('/src/components/PlatformTenant.jsx');
    await render(Tenant, { orgId: 'tenant-id' });
    await click(document.querySelector('input[type="checkbox"]'));
    await fill(document.querySelector('input[type="number"]'), '0');
    await fill(document.querySelector('form input[maxlength="256"]'), 'verified ticket');
    await submit(document.querySelector('form'));
    const saved = calls.find(([name]) => name === 'controls');
    assert.equal(saved[1], 'tenant-id');
    assert.deepEqual(saved[2], { suspended: true, monthlyLogLimit: 0, revision: 3, reason: 'verified ticket' });
    const supportForm = [...document.querySelectorAll('form')].at(-1);
    await fill(supportForm.querySelector('input'), 'support ticket');
    await submit(supportForm);
    assert.match(document.body.textContent, /Supporting Fixture workspace as a platform operator/);
    assert.doesNotMatch(document.body.textContent, /private-support-token/);
    await submit([...document.querySelectorAll('form')].at(-1));
    assert.equal(calls.find(([name]) => name === 'query')[1], 'private-support-token');
    assert.match(document.body.textContent, /<script>unsafe/);
    assert.equal(document.querySelectorAll('script').length, 0);
    await click(button('End support session'));
    assert.deepEqual(calls.find(([name]) => name === 'end'), ['end', 'support']);
    assert.doesNotMatch(document.body.textContent, /unsafe/);
});
