import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('platform API preserves MFA errors and uses the current session for overview pages', async () => {
    let allowed = false, request;
    const context = {
        supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'session' } } }) } },
        env: { VITE_API_LOCAL_URL: 'http://localhost:5000/health' }, AbortSignal,
        fetch: async (url, options) => {
            request = { url, options };
            return allowed ? { ok: true, json: async () => ({}) }
                : { ok: false, status: 403, json: async () => ({ code: 'mfa_required', error: 'Complete MFA' }) };
        }
    };
    const code = fs.readFileSync(new URL('../src/api/platform.js', import.meta.url), 'utf8')
        .replace(/^import .*;$/m, '').replaceAll('import.meta.env', 'env').replaceAll('export const ', 'globalThis.');
    vm.runInNewContext(code, context);
    await assert.rejects(context.verifyPlatformAccess(), (error) => error.code === 'mfa_required' && error.status === 403);
    assert.equal(request.options.headers.Authorization, 'Bearer session');
    assert.equal(request.options.cache, 'no-store');
    assert.equal(request.url, 'http://localhost:5000/v1/platform/session');
    allowed = true;
    await context.getPlatformOverview(2);
    assert.equal(request.url, 'http://localhost:5000/v1/platform/overview?page=2');
    await context.setPlatformControls('tenant', { suspended: true, monthlyLogLimit: 0, revision: 2, reason: 'ticket' });
    assert.equal(request.options.method, 'PATCH');
    assert.equal(JSON.parse(request.options.body).monthlyLogLimit, 0);
    await context.querySupportLogs('private-support-token', { search: 'fixture' });
    assert.equal(request.url, 'http://localhost:5000/v1/platform/support/query');
    assert.equal(request.options.headers['X-Support-Session'], 'private-support-token');
    assert.ok(!request.url.includes('private-support-token'));
    await context.endSupportSession('session-id');
    assert.equal(request.options.method, 'DELETE');
    assert.equal(request.options.headers['X-Support-Session'], undefined);
});
