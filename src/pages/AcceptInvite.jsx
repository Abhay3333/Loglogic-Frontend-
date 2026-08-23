import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { validateInvite, acceptInvite } from '../api/team';
import { supabase } from '../lib/supabase';
import {
  LuTerminal,
  LuBuilding2,
  LuShieldCheck,
  LuCalendar,
  LuMail,
  LuCircleCheck,
  LuTriangleAlert,
  LuArrowRight,
  LuLoader
} from 'react-icons/lu';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check authentication state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
      }
    });

    if (!token) {
      setError('Missing invitation token. Please check the invitation link.');
      setLoading(false);
      return;
    }

    validateInvite(token)
      .then((data) => {
        setInvite(data.invite);
      })
      .catch((err) => {
        console.error('Validation error:', err);
        setError(err.response?.data?.error || err.message || 'Invalid or expired invitation link.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!currentUser) {
      // Store redirect target and send to login
      navigate(`/login?redirect=/invite?token=${encodeURIComponent(token)}`);
      return;
    }

    setAccepting(true);
    setError(null);
    try {
      await acceptInvite(token);
      setSuccess(true);
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Accept invite error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex flex-col justify-center items-center font-mono text-[#00eefc] cyber-grid">
        <div className="w-12 h-12 border-4 border-[#00eefc] border-t-transparent rounded-full animate-spin mb-4" />
        <span>[VALIDATING WORKSPACE INVITATION...]</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0a0e14] px-6 py-12 cyber-grid font-sans text-[#f1f3fc]">
      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-2 group">
        <div className="w-9 h-9 bg-[#00eefc] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,238,252,0.4)]">
          <LuTerminal className="text-[#0a0e14] text-xl font-bold" />
        </div>
        <span className="font-headline text-2xl font-bold tracking-tight text-white">LogLogic</span>
      </div>

      <div className="w-full max-w-lg p-8 bg-[#11161d]/90 backdrop-blur-xl border border-[#44484f]/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)]">
        {error ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <LuTriangleAlert className="w-7 h-7" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-white mb-2">Invitation Unavailable</h2>
            <p className="text-sm text-[#a8abb3] mb-6 leading-relaxed">
              {error}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1a2027] hover:bg-[#252d3a] border border-[#44484f]/50 text-white font-medium text-sm transition-colors"
            >
              Go to Sign In &rarr;
            </Link>
          </div>
        ) : success ? (
          <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LuCircleCheck className="w-8 h-8" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-white mb-2">Welcome to {invite?.orgName}!</h2>
            <p className="text-sm text-[#a8abb3] mb-4">You have joined the workspace. Redirecting to your dashboard...</p>
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#00eefc]/10 border border-[#8ff5ff]/30 flex items-center justify-center text-[#8ff5ff]">
                <LuBuilding2 className="w-6 h-6" />
              </div>
              <h2 className="font-headline text-2xl font-bold text-white tracking-tight">
                Team Workspace Invitation
              </h2>
              <p className="text-sm text-[#a8abb3] mt-1">
                You've been invited to join <strong className="text-white">{invite?.orgName}</strong>
              </p>
            </div>

            {/* Invite Details Card */}
            <div className="bg-[#0a0e14] border border-[#44484f]/30 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7f8594] flex items-center gap-1.5 font-medium">
                  <LuMail className="w-3.5 h-3.5" /> Invited Email
                </span>
                <span className="font-mono text-white font-medium">{invite?.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7f8594] flex items-center gap-1.5 font-medium">
                  <LuShieldCheck className="w-3.5 h-3.5 text-[#8ff5ff]" /> Assigned Role
                </span>
                <span className="font-mono uppercase px-2 py-0.5 rounded bg-[#00eefc]/10 text-[#8ff5ff] border border-[#8ff5ff]/20 text-[11px] font-bold">
                  {invite?.role}
                </span>
              </div>
              {invite?.accessExpiresAt && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#44484f]/20">
                  <span className="text-amber-400/90 flex items-center gap-1.5 font-medium">
                    <LuCalendar className="w-3.5 h-3.5" /> Temporary Access Until
                  </span>
                  <span className="font-mono text-amber-300">
                    {new Date(invite.accessExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {currentUser ? (
              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-linear-to-r from-[#71d9e4] to-[#1adcf2] text-[#0a4e63] font-headline font-bold py-3.5 rounded-lg shadow-[0_0_20px_rgba(0,238,252,0.3)] hover:shadow-[0_0_30px_rgba(0,238,252,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {accepting ? (
                    <>
                      <LuLoader className="w-4 h-4 animate-spin" />
                      Joining Workspace...
                    </>
                  ) : (
                    <>
                      Accept & Join Workspace <LuArrowRight />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#7f8594]">
                  Signed in as <span className="text-[#f1f3fc] font-medium">{currentUser.email}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/login?redirect=/invite?token=${encodeURIComponent(token)}`)}
                  className="w-full bg-[#00eefc] hover:bg-[#8ff5ff] text-[#0a0e14] font-headline font-bold py-3.5 rounded-lg shadow-[0_0_20px_rgba(0,238,252,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Sign In to Accept &rarr;
                </button>
                <button
                  onClick={() => navigate(`/signup?redirect=/invite?token=${encodeURIComponent(token)}`)}
                  className="w-full bg-[#1a2027] hover:bg-[#252d3a] border border-[#44484f]/50 text-white font-headline font-bold py-3.5 rounded-lg transition-colors cursor-pointer"
                >
                  Create New Account
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
