import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrganization } from '../api/organization';
import { FaTerminal } from 'react-icons/fa';

export default function Onboarding() {
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createOrganization({ orgName });
      
      // Update local storage auth check to refresh states
      localStorage.setItem('loglogic_auth', 'true');
      
      // Navigate to the dashboard
      navigate('/app/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-6 py-12 cyber-grid">
      <div className="mb-8 flex items-center gap-2 group">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-primary">
          <FaTerminal className="text-on-primary-container text-xl" />
        </div>
        <span className="font-headline text-2xl font-bold tracking-tighter text-primary-fixed">LogLogic</span>
      </div>

      <div className="w-full max-w-md p-8 bg-surface-container-high/60 backdrop-blur-xl border border-outline-variant/30 rounded-xl shadow-2xl">
        <h2 className="font-headline text-2xl font-bold text-white mb-2 tracking-tight">Create Workspace</h2>
        <p className="text-on-surface-variant mb-6 text-sm">
          Let's set up your first workspace. This is where your API keys, alerts, and servers' telemetry logs will live.
        </p>
        
        <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-950/20 border border-red-500/20 text-error text-xs font-mono rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-outline-variant">
              Workspace / Company Name
            </label>
            <input 
              type="text" 
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant/30 text-on-surface focus:ring-0 focus:border-primary transition-all font-mono py-3 px-4 rounded text-sm placeholder:text-outline"
              placeholder="e.g. Acme Corp Production"
              required
              minLength={2}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || orgName.length < 2}
            className="w-full bg-linear-to-r from-[#71d9e4] to-[#1adcf2] text-[#0a4e63] font-headline font-bold py-4 rounded-md shadow-[0_0_15px_rgba(0,238,252,0.2)] hover:from-[#82e3ec] hover:to-[#33e4f7] hover:shadow-[0_0_25px_rgba(0,238,252,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
