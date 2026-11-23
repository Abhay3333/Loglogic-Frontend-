import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { verifyPlatformAccess } from '../api/platform';
import PlatformMfa from './PlatformMfa';

export default function PlatformAccessGate({ children }) {
    const [access, setAccess] = useState({ status: 'checking' });
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            setAccess({ status: 'checking' });
            setRevision((value) => value + 1);
        });
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        let active = true;
        async function verify() {
            try {
                await verifyPlatformAccess();
                if (active) setAccess({ status: 'allowed' });
            } catch (error) {
                if (active) setAccess({ status: error.code === 'mfa_required' ? 'mfa' : error.status === 401 ? 'unauth' : 'denied',
                    message: error.status === 403 ? error.message : 'Platform access verification is unavailable. Try again.' });
            }
        }
        verify();
        return () => { active = false; };
    }, [revision]);
    if (access.status === 'allowed') return children;
    if (access.status === 'unauth') return <Navigate to="/login" replace />;
    return <main className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-5 p-6">
        {access.status === 'checking' && <p role="status">Verifying platform access…</p>}
        {access.status === 'mfa' && <PlatformMfa onVerified={() => {
            setAccess({ status: 'checking' });
            setRevision((value) => value + 1);
        }} />}
        {access.status === 'denied' && <section className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold">Access denied</h1>
            <p role="alert">{access.message}</p>
            <button onClick={() => { setAccess({ status: 'checking' }); setRevision((value) => value + 1); }}
                className="rounded border border-outline-variant px-4 py-2">Retry</button>
        </section>}
        <Link to="/app/dashboard" className="text-primary underline">Return to workspace</Link>
    </main>;
}
