import { useState, useEffect, useCallback } from 'react';
import { privacyRequest } from '../api/privacy';
export default function PrivacyRequests({ orgId }) {
  const [field, setField] = useState('metadata.userId');
  const [value, setValue] = useState('');
  const [preview, setPreview] = useState(null);
  const [phrase, setPhrase] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const refresh = useCallback(async () => {
    try { const result = await privacyRequest(orgId); setRows(result.requests); }
    catch { setMessage('Could not load privacy requests.'); }
  }, [orgId]);
  useEffect(() => { let active = true; const load = async () => {
    try { const result = await privacyRequest(orgId); if (active) setRows(result.requests); }
    catch { if (active) setMessage('Could not load privacy requests.'); }
  }; load(); const timer = setInterval(load, 5000); return () => { active = false; clearInterval(timer); }; }, [orgId]);
  async function createPreview(event) {
    event.preventDefault(); setBusy(true); setMessage(''); setPreview(null); setPhrase(''); setAcknowledged(false);
    try { setPreview(await privacyRequest(orgId, '/preview', { subject: { field, value } })); await refresh(); }
    catch (error) { setMessage(error.response?.data?.code || 'Preview unavailable.'); }
    finally { setBusy(false); }
  }
  async function confirm() {
    setBusy(true); setMessage('');
    try {
      await privacyRequest(orgId, `/${preview.request.id}/confirm`, { confirmationToken: preview.confirmationToken, confirmationPhrase: phrase });
      setPreview(null); setValue(''); setPhrase(''); setMessage('Confirmed. Primary cleanup is queued; follow-up remains required.'); await refresh();
    } catch (error) { setMessage(error.response?.data?.code || 'Confirmation unavailable.'); }
    finally { setBusy(false); }
  }
  const input = 'w-full rounded-lg border border-[#44484f] bg-[#0a0e14] text-white px-3 py-2 text-sm';
  return <section className="space-y-5 text-[#f1f3fc]">
    <h2 className="text-xl font-bold">Privacy requests</h2>
    <p className="text-sm text-[#a8abb3]">Match one exact, case-sensitive string identifier in stored metadata. Preview counts MongoDB logs only. Redacted, encoded or unstructured identifiers cannot be discovered through this form.</p>
    <div className="rounded-lg p-4 border border-amber-400/30 text-sm text-amber-200 space-y-2">
      <p>Confirmation permanently deletes matching primary logs and suppresses future matching logs. It cannot be undone here.</p>
      <p>Incident samples, integration retries, downloaded exports, external providers, live browser buffers and backups require separate review. Primary cleanup completion does not mean all copies have been erased.</p>
    </div>
    {message && <p role="status" className="text-sm text-[#8ff5ff]">{message}</p>}
    <form onSubmit={createPreview} className="space-y-3">
      <label className="block text-sm">Subject field<select disabled={busy} className={input} value={field} onChange={(event) => { setField(event.target.value); setPreview(null); }}>
        {['metadata.userId', 'metadata.user_id', 'metadata.email', 'metadata.customerId'].map((name) => <option key={name}>{name}</option>)}
      </select></label>
      <label className="block text-sm">Exact subject value<input required maxLength={256} autoComplete="off" disabled={busy} className={input} value={value} onChange={(event) => { setValue(event.target.value); setPreview(null); }} /></label>
      <button disabled={busy || !value.trim()} className="px-4 py-2 rounded-lg bg-[#8ff5ff] text-[#0a0e14] disabled:opacity-50">Preview only</button>
    </form>
    {preview && <div className="space-y-3 rounded-lg p-4 border border-[#44484f]">
      <p>{preview.request.matchedCount} primary logs currently match. The count can change before execution. Preview expires at {new Date(preview.expiresAt).toLocaleString()}.</p>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />I understand deletion, ongoing suppression, and the required follow-up for other copies.</label>
      <label className="block text-sm">Type <strong>{preview.confirmationPhrase}</strong><input autoComplete="off" disabled={busy} className={input} value={phrase} onChange={(event) => setPhrase(event.target.value)} /></label>
      <button onClick={confirm} disabled={busy || !acknowledged || phrase !== preview.confirmationPhrase} className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">Confirm deletion and suppression</button>
    </div>}
    <div className="space-y-3">
      <div className="flex justify-between"><h3 className="font-semibold">Recent requests</h3><button onClick={refresh} className="text-sm text-[#8ff5ff]">Refresh</button></div>
      {rows.map((row) => <article key={row.id} className="border border-[#44484f]/40 rounded-lg p-3 text-sm space-y-1">
        <p className="font-mono break-all">{row.id}</p><p>{row.field} · {row.status === 'primary_cleanup_complete' ? 'Primary cleanup complete — follow-up required' : row.status}</p>
        <p>Preview: {row.matchedCount} · Deleted: {row.deletedCount}{row.failureCode ? ` · ${row.failureCode}` : ''}</p>
      </article>)}
      {!rows.length && <p className="text-sm text-[#a8abb3]">No privacy requests in this workspace.</p>}
    </div>
  </section>;
}
