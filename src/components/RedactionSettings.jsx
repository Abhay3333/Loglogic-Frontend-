import { useEffect, useState } from 'react';
import { redactionRequest } from '../api/redaction';

const initialSample = JSON.stringify({
  message: 'Payment 4111 1111 1111 1111; AWS AKIAIOSFODNN7EXAMPLE',
  metadata: { password: 'example-password' },
}, null, 2);

export default function RedactionSettings({ orgId }) {
  const [settings, setSettings] = useState(null);
  const [rules, setRules] = useState('[]');
  const [sample, setSample] = useState(initialSample);
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    redactionRequest(orgId).then((data) => {
      if (!cancelled) { setSettings(data.settings); setRules(JSON.stringify(data.settings.customRules, null, 2)); }
    }).catch(() => { if (!cancelled) setStatus('Could not load redaction settings.'); });
    return () => { cancelled = true; };
  }, [orgId]);

  async function submit(mode) {
    setBusy(true); setStatus(''); setPreview('');
    try {
      const config = { ...settings, customRules: JSON.parse(rules) };
      const result = await redactionRequest(orgId, mode, {
        settings: config, ...(mode === 'PREVIEW' ? { sample: JSON.parse(sample) } : {}),
      });
      if (mode === 'PREVIEW') setPreview(JSON.stringify(result.sample, null, 2));
      else { setSettings(result.settings); setStatus('Saved. Changes apply to future ingestion.'); }
    } catch (error) {
      setStatus(error.response?.data?.error || 'Check the JSON input and try again.');
    } finally { setBusy(false); }
  }
  const inputClass = 'w-full bg-[#0a0e14] border border-[#44484f] rounded-lg p-3 text-sm text-white font-mono';
  return <section className="space-y-5 text-[#f1f3fc]">
    <h2 className="text-xl font-bold">PII Redaction</h2>
    <p className="text-sm text-[#a8abb3]">Sensitive log content is replaced with [REDACTED] before storage. Changes affect future logs; historical data is unchanged. Disabling a detector permits that type of sensitive content.</p>
    {status && <p role="status" className="text-sm text-[#8ff5ff]">{status}</p>}
    {settings && <>
      {Object.entries({ cards: 'Payment card numbers (checksum validated)', ssns: 'SSN-shaped values', credentials: 'Credentials, bearer tokens, AWS keys and sensitive fields' }).map(([field, label]) =>
        <label key={field} className="flex gap-3 items-center text-sm">
          <input type="checkbox" checked={settings[field]} disabled={busy} onChange={(event) => setSettings({ ...settings, [field]: event.target.checked })} />{label}
        </label>)}
      <label className="block space-y-2 text-sm">Custom regex rules (JSON array; up to 10)
        <textarea aria-label="Custom regex rules" className={inputClass} rows={5} value={rules} disabled={busy} onChange={(event) => setRules(event.target.value)} spellCheck={false} />
      </label>
      <p className="text-xs text-[#a8abb3]">Example: {JSON.stringify([{ name: 'Internal ID', pattern: 'customer_[0-9]+' }])}. Matching is global and case sensitive. Rules that exceed execution limits cause ingestion to be rejected until corrected.</p>
      <button disabled={busy} onClick={() => submit('PUT')} className="px-4 py-2 rounded-lg bg-[#8ff5ff] text-[#0a0e14] disabled:opacity-50">Save settings</button>
      <label className="block space-y-2 text-sm">Sample log (JSON; use synthetic data)
        <textarea aria-label="Sample log" className={inputClass} rows={6} value={sample} disabled={busy} onChange={(event) => setSample(event.target.value)} spellCheck={false} />
      </label>
      <p className="text-xs text-[#a8abb3]">Preview uses unsaved settings. The sample is sent for processing and is not saved. It stays in this tab until you leave.</p>
      <button disabled={busy} onClick={() => submit('PREVIEW')} className="px-4 py-2 border border-[#44484f] rounded-lg disabled:opacity-50">Preview redaction</button>
      {preview && <pre aria-label="Redacted preview" className={`${inputClass} whitespace-pre-wrap break-all`}>{preview}</pre>}
    </>}
  </section>;
}
