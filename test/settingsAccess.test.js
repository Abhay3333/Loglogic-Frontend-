import { test } from 'node:test';
import assert from 'node:assert/strict';
import { settingsAccess, visibleSettingsSections, resolveSettingsTab } from '../src/lib/settingsAccess.js';

const org = (role = 'owner', plan_tier = 'free') => ({ id: 'workspace', role, plan_tier });
const ids = (access) => visibleSettingsSections(access).flatMap((section) => section.items.map((item) => item.id));

test('audit is restricted to owners/admins while enterprise security requires the exact enterprise tier', () => {
  for (const role of ['owner', 'admin', 'developer', 'viewer', 'auditor', 'editor', 'unknown']) {
    for (const tier of ['free', 'pro', 'enterprise', 'Enterprise', undefined]) {
      const access = settingsAccess(org(role, tier));
      const admin = ['owner', 'admin'].includes(role);
      assert.equal(access.audit, admin, `${role}/${tier}: audit`);
      for (const tab of ['sso', 'privacy', 'redaction']) {
        assert.equal(access[tab], admin && tier === 'enterprise', `${role}/${tier}: ${tab}`);
      }
    }
  }
});

test('workspace items follow existing member management, billing and activity permissions', () => {
  assert.deepEqual(ids(settingsAccess(org('owner'))), ['api-keys', 'team', 'requests', 'billing', 'general', 'activity', 'audit']);
  assert.deepEqual(ids(settingsAccess(org('admin'))), ['api-keys', 'team', 'requests', 'general', 'activity', 'audit']);
  assert.deepEqual(ids(settingsAccess(org('developer', 'enterprise'))), ['api-keys']);
  assert.deepEqual(ids(settingsAccess(org('viewer', 'enterprise'))), ['api-keys', 'activity']);
  assert.deepEqual(ids(settingsAccess(org('auditor', 'enterprise'))), ['api-keys']);
  assert.deepEqual(ids(settingsAccess(org('editor'))), ['api-keys', 'activity']);
});

test('section labels/order are stable and empty Security & Compliance sections disappear', () => {
  const groups = visibleSettingsSections(settingsAccess(org('owner', 'enterprise')));
  assert.deepEqual(groups.map((group) => group.label), ['Workspace', 'Security & Compliance']);
  assert.deepEqual(groups[0].items.map((item) => item.id), ['api-keys', 'team', 'requests', 'billing', 'general', 'activity']);
  assert.deepEqual(groups[1].items.map((item) => item.id), ['audit', 'redaction', 'privacy', 'sso']);
  assert.deepEqual(visibleSettingsSections(settingsAccess(org('viewer'))).map((group) => group.id), ['workspace']);
});

test('URL-driven selection denies hidden tabs, unknown names and inherited property names', () => {
  const free = settingsAccess(org('owner'));
  for (const tab of ['privacy', 'sso', 'redaction', 'unknown', '__proto__', 'constructor']) {
    assert.equal(resolveSettingsTab(new URLSearchParams({ tab }), free).activeTab, null);
  }
  assert.equal(resolveSettingsTab(new URLSearchParams({ tab: 'audit' }), settingsAccess(org('viewer', 'enterprise'))).activeTab, null);
  assert.equal(resolveSettingsTab(new URLSearchParams({ tab: 'privacy' }), settingsAccess(org('admin', 'enterprise'))).activeTab, 'privacy');
  assert.equal(resolveSettingsTab(new URLSearchParams(), free).activeTab, 'api-keys');
});

test('billing return URLs and subsequent URL/history/context changes use current permissions', () => {
  assert.equal(resolveSettingsTab(new URLSearchParams('billing=success&session_id=fixture'), settingsAccess(org())).activeTab, 'billing');
  assert.equal(resolveSettingsTab(new URLSearchParams('billing=cancelled'), settingsAccess(org('admin'))).activeTab, null);
  assert.equal(resolveSettingsTab(new URLSearchParams('tab=api-keys&billing=success'), settingsAccess(org())).activeTab, 'api-keys');
  const params = new URLSearchParams('tab=privacy');
  assert.equal(resolveSettingsTab(params, settingsAccess(org('owner', 'enterprise'))).activeTab, 'privacy');
  assert.equal(resolveSettingsTab(params, settingsAccess(org('owner', 'pro'))).activeTab, null);
  assert.equal(resolveSettingsTab(params, settingsAccess(org('viewer', 'enterprise'))).activeTab, null);
  params.set('tab', 'api-keys');
  assert.equal(resolveSettingsTab(params, settingsAccess(org('viewer'))).activeTab, 'api-keys');
});

test('missing workspace, expired access and SSO-locked workspaces expose no settings panels', () => {
  for (const access of [settingsAccess(null), settingsAccess(org('owner', 'enterprise'), true),
    settingsAccess({ ...org('owner', 'enterprise'), isExpired: true }), settingsAccess({ ...org('owner', 'enterprise'), ssoRequired: true })]) {
    assert.deepEqual(ids(access), []);
    assert.equal(resolveSettingsTab(new URLSearchParams('tab=privacy'), access).activeTab, null);
  }
});

test('rendered dark-mode sidebar hides gated labels and marks the current tab', async () => {
  const { createServer } = await import('vite');
  const { default: react } = await import('@vitejs/plugin-react');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({ configFile: false, plugins: [react()],
    server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const { default: Sidebar } = await server.ssrLoadModule('/src/components/SettingsSidebar.jsx');
    const render = (role, tier, activeTab = 'api-keys') => renderToStaticMarkup(createElement(Sidebar, {
      access: settingsAccess(org(role, tier)), activeTab, onNavigate() {}, pendingRequestsCount: 3,
    }));
    const viewer = render('viewer', 'enterprise');
    assert.match(viewer, /Workspace Activity/); assert.match(viewer, /aria-current="page"/);
    for (const label of ['Security &amp; Compliance', 'Audit Log', 'Single sign-on', 'PII Redaction', 'Privacy Requests', 'Billing', 'Team Members']) assert.ok(!viewer.includes(label), label);
    const pro = render('admin', 'pro', 'audit');
    assert.match(pro, /Audit Log/); assert.doesNotMatch(pro, /Single sign-on|PII Redaction|Privacy Requests/);
    const enterprise = render('owner', 'enterprise', 'privacy');
    for (const label of ['Security &amp; Compliance', 'Audit Log', 'Single sign-on', 'PII Redaction', 'Privacy Requests', 'Billing', 'Team Members']) assert.ok(enterprise.includes(label), label);
    assert.match(enterprise, />3<\/span>/);
  } finally { await server.close(); }
});
