import React, { useState } from 'react';
import { requestAccess } from '../api/access';
import { LuKey, LuSend, LuX, LuLoader, LuShieldAlert, LuCircleCheck } from 'react-icons/lu';

export default function RequestAccessModal({
  isOpen,
  onClose,
  orgId,
  orgName = 'Workspace',
  userEmail = '',
  currentRole = 'member',
  onSubmitted
}) {
  const [requestedRole, setRequestedRole] = useState('editor');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await requestAccess({
        orgId,
        message: message.trim(),
        requestedRole
      });
      setSuccess(true);
      if (onSubmitted) {
        onSubmitted(res.request || { status: 'pending', requestedRole, message });
      }
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Submit access request error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to submit access request';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/85 backdrop-blur-sm px-4">
      <div className="bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.6)] w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5 border-b border-[#44484f]/25 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00eefc]/10 border border-[#00eefc]/30 flex items-center justify-center">
              <LuKey className="w-4 h-4 text-[#8ff5ff]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f1f3fc]">Request Workspace Access</h3>
              <p className="text-xs text-[#7f8594]">Submit access renewal to the owner of <span className="text-[#8ff5ff] font-medium">{orgName}</span></p>
            </div>
          </div>
          <button
            onClick={() => { if (!submitting) onClose(); }}
            className="text-[#7f8594] hover:text-[#f1f3fc] transition-colors p-1 rounded-md hover:bg-[#1a2027] cursor-pointer"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
              <LuCircleCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-[#f1f3fc]">Access Request Submitted</h4>
            <p className="text-xs text-[#a8abb3] max-w-sm">
              The workspace owner has been notified via email and dashboard. You will receive an email once your request is reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2">
                <LuShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#a8abb3] mb-1.5">
                Requested Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestedRole('editor')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    requestedRole === 'editor'
                      ? 'bg-[#00eefc]/10 border-[#00eefc]/50 text-[#8ff5ff]'
                      : 'bg-[#0a0e14] border-[#44484f]/40 text-[#a8abb3] hover:border-[#44484f]'
                  }`}
                >
                  <div className="text-xs font-bold uppercase">Editor</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Read & stream logs, manage alerts</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRequestedRole('viewer')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    requestedRole === 'viewer'
                      ? 'bg-[#00eefc]/10 border-[#00eefc]/50 text-[#8ff5ff]'
                      : 'bg-[#0a0e14] border-[#44484f]/40 text-[#a8abb3] hover:border-[#44484f]'
                  }`}
                >
                  <div className="text-xs font-bold uppercase">Viewer</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Read-only log inspection</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#a8abb3] mb-1.5">
                Message to Workspace Owner <span className="text-[#7f8594] font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Need access extended for the production audit sprint until Friday..."
                className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-[#f1f3fc] text-sm rounded-lg focus:border-[#8ff5ff] focus:ring-1 focus:ring-[#8ff5ff] p-3 outline-none transition-colors placeholder:text-[#7f8594]"
              />
            </div>

            <div className="pt-3 border-t border-[#44484f]/25 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-[#a8abb3] hover:text-[#f1f3fc] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00eefc] hover:bg-[#8ff5ff] px-5 py-2 text-sm font-bold text-[#0a0e14] shadow-[0_0_15px_rgba(0,238,252,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSend className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
