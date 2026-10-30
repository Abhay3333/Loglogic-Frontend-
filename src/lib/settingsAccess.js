import { can, normalizeRole } from './permissions.js';

export const SETTINGS_SECTIONS = [
  { id: 'workspace', label: 'Workspace', items: [
    { id: 'api-keys', label: 'API Keys' },
    { id: 'team', label: 'Team Members' },
    { id: 'requests', label: 'Access Requests' },
    { id: 'billing', label: 'Billing' },
    { id: 'general', label: 'Workspace & Ownership' },
    { id: 'activity', label: 'Workspace Activity' },
  ] },
  { id: 'security', label: 'Security & Compliance', items: [
    { id: 'audit', label: 'Audit Log' },
    { id: 'redaction', label: 'PII Redaction' },
    { id: 'privacy', label: 'Privacy Requests' },
    { id: 'sso', label: 'Single sign-on' },
  ] },
];

// UI policy only: server authorization is still required for every API call.
export function settingsAccess(org, accessExpired = false) {
  const role = normalizeRole(org?.role);
  const active = Boolean(org?.id) && !accessExpired && !org?.isExpired && !org?.ssoRequired;
  const admin = role === 'owner' || role === 'admin';
  const enterpriseAdmin = active && admin && org?.plan_tier === 'enterprise';
  return {
    'api-keys': active,
    team: active && admin && can(role, 'can_manage_members'),
    requests: active && admin && can(role, 'can_manage_members'),
    billing: active && can(role, 'can_edit_billing'),
    general: active && admin,
    // Match the current /access/activity requireRole list. Legacy editor is
    // accepted there; the literal developer/auditor roles are not yet accepted.
    activity: active && ['owner', 'admin', 'editor', 'viewer'].includes(String(org?.role).toLowerCase()),
    audit: active && admin && can(role, 'can_view_audit_trail'),
    redaction: enterpriseAdmin && can(role, 'can_manage_keys'),
    privacy: enterpriseAdmin && can(role, 'can_manage_privacy'),
    sso: enterpriseAdmin && can(role, 'can_manage_keys'),
  };
}

export function visibleSettingsSections(access) {
  return SETTINGS_SECTIONS.map((section) => ({ ...section, items: section.items.filter((item) => access[item.id] === true) }))
    .filter((section) => section.items.length > 0);
}

export function resolveSettingsTab(params, access) {
  const billingReturn = ['success', 'cancelled'].includes(params.get('billing'));
  const requested = params.get('tab') || (billingReturn ? 'billing' : 'api-keys');
  return { requested, activeTab: access[requested] === true ? requested : null };
}
