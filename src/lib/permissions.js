// Frontend mirror of the backend RBAC matrix (src/config/permissions.js).
// Keep the two in sync. Used only to show/hide UI; the backend is the real gate.

const allTrue = (flags) => flags.reduce((a, f) => { a[f] = true; return a; }, {});

export const FLAGS = [
  'can_view_logs',
  'can_export_logs',
  'can_manage_keys',
  'can_edit_billing',
  'can_view_audit_trail',
  'can_manage_members',
  'can_manage_integrations',
  'can_manage_alerts'
];

const ROLE_PERMISSIONS = {
  owner: allTrue(FLAGS),
  admin: {
    can_view_logs: true, can_export_logs: true, can_manage_keys: true, can_edit_billing: false,
    can_view_audit_trail: true, can_manage_members: true, can_manage_integrations: true, can_manage_alerts: true
  },
  developer: {
    can_view_logs: true, can_export_logs: true, can_manage_keys: false, can_edit_billing: false,
    can_view_audit_trail: false, can_manage_members: false, can_manage_integrations: true, can_manage_alerts: true
  },
  viewer: {
    can_view_logs: true, can_export_logs: false, can_manage_keys: false, can_edit_billing: false,
    can_view_audit_trail: false, can_manage_members: false, can_manage_integrations: false, can_manage_alerts: false
  },
  auditor: {
    can_view_logs: true, can_export_logs: true, can_manage_keys: false, can_edit_billing: false,
    can_view_audit_trail: true, can_manage_members: false, can_manage_integrations: false, can_manage_alerts: false
  }
};

export const normalizeRole = (role) => {
  const r = String(role || 'viewer').toLowerCase();
  if (r === 'editor') return 'developer';
  return ROLE_PERMISSIONS[r] ? r : 'viewer';
};

export const permissionsForRole = (role) => ({ ...ROLE_PERMISSIONS[normalizeRole(role)] });

export const can = (role, flag) => Boolean(permissionsForRole(role)[flag]);

// Roles an owner/admin can assign (owner only via transfer).
export const ASSIGNABLE_ROLES = ['admin', 'developer', 'viewer', 'auditor'];
