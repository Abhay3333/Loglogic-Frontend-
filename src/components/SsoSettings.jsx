import { useEffect, useState } from 'react';
import { ssoSettings } from '../api/sso';

export default function SsoSettings({ orgId }) {
  const [form, setForm] = useState({ domain: '', providerId: '', enforced: false });
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    ssoSettings(orgId).then((data) => {
      if (active) setForm({ domain: data.sso_domain || '', providerId: data.sso_provider || '', enforced: data.sso_enforced });
    }).catch(() => { if (active) setMessage('SSO settings are unavailable.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [orgId]);
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      await ssoSettings(orgId, form);
      setMessage('SSO settings saved.');
    } catch (error) {
      const code = error.response?.data?.code;
      setMessage(code === 'sso_required' ? 'Sign in using this SSO connection before enabling enforcement.'
        : code === 'connection_not_verified' ? 'Ask the operator to verify this domain and provider mapping first.' : 'Could not save SSO settings.');
    } finally { setBusy(false); }
  }
  return <section className="max-w-2xl space-y-5 text-[#f1f3fc]">
    <h2 className="text-xl font-semibold">Enterprise single sign-on</h2>
    <p className="text-sm text-[#a8abb3]">Use your organization’s SAML identity provider. The operator must verify the domain and configure its Supabase connection first.</p>
    <p className="text-sm text-amber-200">Enforcement blocks password and social sessions for this workspace, including existing sessions. Test an administrator SSO login first. Emergency recovery requires your database operator. Existing accounts are not linked by email.</p>
    <form onSubmit={save} className="space-y-4">
      <label className="block text-sm">Work email domain
        <input required value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })} placeholder="company.com" className="block w-full mt-2 rounded bg-[#161b28] p-3" />
      </label>
      <label className="block text-sm">Supabase SAML connection ID
        <input required value={form.providerId} onChange={(event) => setForm({ ...form, providerId: event.target.value })} placeholder="Connection UUID" className="block w-full mt-2 rounded bg-[#161b28] p-3 font-mono" />
      </label>
      <label className="flex gap-3 text-sm"><input type="checkbox" checked={form.enforced} onChange={(event) => setForm({ ...form, enforced: event.target.checked })} />Require SSO for workspace access</label>
      <button disabled={busy} className="rounded bg-cyan-300 px-4 py-2 text-black disabled:opacity-50">{busy ? 'Loading…' : 'Save SSO settings'}</button>
    </form>
    {message && <p role="status" className="text-sm">{message}</p>}
    <p className="text-xs text-[#a8abb3]">SCIM provisioning is pending. This setting does not revoke workspace API keys or sign users out of other workspaces.</p>
  </section>;
}
