import React from 'react';
import { LuShieldAlert, LuClock, LuKey, LuRotateCcw, LuCircleCheck, LuCircleX } from 'react-icons/lu';

export default function AccessExpiredBanner({
  orgName = 'Workspace',
  accessExpiresAt,
  latestRequest,
  onRequestAccess
}) {
  const isPending = latestRequest?.status === 'pending';
  const isRejected = latestRequest?.status === 'rejected';

  return (
    <div className="w-full bg-gradient-to-r from-red-950/80 via-[#1a0f12] to-amber-950/60 border-b border-red-500/40 px-6 py-3.5 shadow-[0_4px_25px_rgba(239,68,68,0.15)] relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <LuShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Your access to this workspace has expired.
              </h3>
              {isPending && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  <LuClock className="w-3.5 h-3.5 animate-pulse" /> Request Pending Review
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                  <LuCircleX className="w-3.5 h-3.5" /> Request Declined
                </span>
              )}
            </div>
            <p className="text-xs text-[#d1d5db] mt-1 leading-relaxed">
              Temporary access to <strong className="text-white">{orgName}</strong> ended
              {accessExpiresAt ? ` on ${new Date(accessExpiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}.
              All workspace actions, API key creation, and live log querying are restricted.
            </p>

            {isRejected && latestRequest?.rejectionReason && (
              <div className="mt-2 p-2.5 rounded-lg bg-red-950/60 border border-red-500/30 text-xs text-red-200">
                <span className="font-semibold text-red-300">Owner's Reason:</span> "{latestRequest.rejectionReason}"
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-auto">
          {isPending ? (
            <div className="text-xs font-mono text-amber-300/90 bg-amber-950/50 border border-amber-500/30 px-3 py-2 rounded-lg">
              Owner notified &middot; Awaiting decision
            </div>
          ) : (
            <button
              onClick={onRequestAccess}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00eefc] hover:bg-[#8ff5ff] px-4 py-2 text-xs font-bold text-[#0a0e14] shadow-[0_0_20px_rgba(0,238,252,0.35)] transition-all cursor-pointer active:scale-95"
            >
              <LuKey className="w-3.5 h-3.5" />
              {isRejected ? 'Request Access Again' : 'Request Access'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
