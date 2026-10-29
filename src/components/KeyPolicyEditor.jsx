import { useState } from 'react';
import { updateApiKeyPolicy } from '../api/apiKey';
import { parseCidrInput } from '../lib/keyPolicy';

export function KeyPolicyFields({ scopes, onScopesChange, cidrs, onCidrsChange, disabled }) {
  return <div className="space-y-4 text-sm text-[#a8abb3]">
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="mb-2 font-medium">Key scopes</legend>
      {Object.entries({ 'logs:ingest': 'Write logs', 'logs:query': 'Read historical logs and statistics' }).map(([scope, label]) =>
        <label key={scope} className="flex gap-2 items-center">
          <input type="checkbox" checked={scopes.includes(scope)} onChange={(event) => onScopesChange(event.target.checked ? [...scopes, scope] : scopes.filter((value) => value !== scope))} />
          {label} <code className="text-xs text-[#8ff5ff]">{scope}</code>
        </label>)}
    </fieldset>
    <label className="block space-y-2">Allowed IP addresses or CIDRs
      <textarea aria-label="Allowed IP addresses or CIDRs" rows={3} value={cidrs} disabled={disabled}
        onChange={(event) => onCidrsChange(event.target.value)} placeholder={'203.0.113.10/32\n2001:db8::/32'}
        className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-white rounded-lg p-2.5 font-mono text-xs" />
    </label>
    <p className="text-xs text-[#7f8594]">Leave empty to allow any source IP. Separate entries with commas or whitespace (up to 50). IP restrictions apply to both scopes. Query access excludes exports, live tail and administration.</p>
  </div>;
}

export default function KeyPolicyEditor({ apiKey, onClose, onSaved }) {
  const [scopes, setScopes] = useState(apiKey.scopes || ['logs:ingest']);
  const [cidrs, setCidrs] = useState((apiKey.allowed_cidrs || []).join('\n'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await updateApiKeyPolicy(apiKey.id, { scopes, allowedCidrs: parseCidrInput(cidrs) });
      onSaved();
    } catch (err) { setError(err.response?.data?.error || 'Could not save key restrictions.'); }
    finally { setBusy(false); }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/80 px-4" role="dialog" aria-modal="true" aria-labelledby="key-policy-title">
    <form onSubmit={save} className="w-full max-w-lg p-6 rounded-xl bg-[#11161d] border border-[#44484f]/40 space-y-5">
      <h3 id="key-policy-title" className="text-lg text-white font-bold">Restrictions: {apiKey.name}</h3>
      <KeyPolicyFields scopes={scopes} onScopesChange={setScopes} cidrs={cidrs} onCidrsChange={setCidrs} disabled={busy} />
      <p className="text-xs text-[#7f8594]">Changes apply to subsequent key validations. The raw key stays the same.</p>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" disabled={busy} onClick={onClose} className="text-sm text-white">Cancel</button>
        <button disabled={busy || scopes.length === 0} className="px-4 py-2 rounded-lg bg-[#8ff5ff] text-[#0a0e14] disabled:opacity-50">{busy ? 'Saving…' : 'Save restrictions'}</button>
      </div>
    </form>
  </div>;
}
