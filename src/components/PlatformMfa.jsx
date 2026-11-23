import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function PlatformMfa({ onVerified }) {
    const [factors, setFactors] = useState([]);
    const [factorId, setFactorId] = useState('');
    const [enrollment, setEnrollment] = useState(null);
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        let active = true;
        supabase.auth.mfa.listFactors().then(({ data, error }) => {
            if (!active) return;
            if (error) throw error;
            const available = data.totp.filter((factor) => factor.status === 'verified');
            setFactors(available);
            setFactorId(available[0]?.id || '');
            setLoaded(true);
        }).catch(() => { if (active) setError('Unable to load authenticator factors. Reload to try again.'); })
            .finally(() => { if (active) setBusy(false); });
        return () => { active = false; };
    }, []);

    async function enroll() {
        setBusy(true);
        setError('');
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp', friendlyName: `LogLogic platform ${Date.now()}`
            });
            if (error) throw error;
            setEnrollment(data);
            setFactorId(data.id);
        } catch {
            setError('Authenticator setup failed. Check your Supabase MFA settings or existing factors and try again.');
        } finally { setBusy(false); }
    }

    async function verify(event) {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
            if (error) throw error;
            setEnrollment(null);
            setCode('');
            onVerified();
        } catch {
            setCode('');
            setError('Verification failed. Enter a fresh code from your authenticator.');
        } finally { setBusy(false); }
    }

    return <section className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container p-6">
        <h1 className="text-2xl font-bold">Verify your identity</h1>
        <p className="mt-3 text-on-surface-variant">Platform administration requires an authenticator code.</p>
        {error && <p role="alert" className="mt-4 text-red-400">{error}</p>}
        {busy && <p role="status" className="mt-3">Working…</p>}
        {loaded && factors.length === 0 && !enrollment && <button disabled={busy} onClick={enroll}
            className="mt-5 rounded bg-primary px-4 py-2 text-on-primary disabled:opacity-50">Set up authenticator</button>}
        {enrollment && <div className="mt-5 space-y-3">
            <p>Scan this QR code in your authenticator app, then enter the six-digit code.</p>
            <img className="h-48 w-48 bg-white p-2" alt="Authenticator enrollment QR code"
                src={enrollment.totp.qr_code.startsWith('data:') ? enrollment.totp.qr_code : `data:image/svg+xml;utf8,${encodeURIComponent(enrollment.totp.qr_code)}`} />
            <details><summary>Enter setup key manually</summary><code className="block break-all mt-2 select-all">{enrollment.totp.secret}</code></details>
        </div>}
        {factorId && <form onSubmit={verify} className="mt-5 space-y-4">
            {factors.length > 1 && !enrollment && <label className="block">Authenticator
                <select value={factorId} onChange={(event) => setFactorId(event.target.value)} disabled={busy}
                    className="mt-2 w-full rounded bg-surface-container-high p-3">
                    {factors.map((factor) => <option key={factor.id} value={factor.id}>{factor.friendly_name || factor.id}</option>)}
                </select>
            </label>}
            <label className="block" htmlFor="mfa-code">Authenticator code</label>
            <input id="mfa-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required
                className="w-full rounded border border-outline-variant bg-surface-container-high p-3" />
            <button disabled={busy || code.length !== 6} className="rounded bg-primary px-4 py-2 text-on-primary disabled:opacity-50">Verify and continue</button>
        </form>}
    </section>;
}
