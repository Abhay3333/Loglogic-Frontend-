import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiAlertTriangle, FiShield, FiLock, FiDatabase, FiDollarSign, FiToggleRight, FiToggleLeft } from 'react-icons/fi';
import { FaTerminal } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const mockStripeEvents = [
  { id: 'evt_1P8a9', timestamp: '2026-05-03T21:30:12Z', type: 'invoice.payment_succeeded', orgId: 'org_x92mlk', amount: '$299.00', status: 'Processed' },
  { id: 'evt_1P8b2', timestamp: '2026-05-03T21:15:05Z', type: 'customer.subscription.deleted', orgId: 'org_z18pqr', amount: '$0.00', status: 'Processed' },
  { id: 'evt_1P8c7', timestamp: '2026-05-03T21:05:22Z', type: 'invoice.payment_failed', orgId: 'org_m44stu', amount: '$49.00', status: 'Failed' },
  { id: 'evt_1P8d4', timestamp: '2026-05-03T20:50:10Z', type: 'customer.subscription.updated', orgId: 'org_x92mlk', amount: '$299.00', status: 'Processed' },
  { id: 'evt_1P8e1', timestamp: '2026-05-03T20:12:05Z', type: 'invoice.payment_failed', orgId: 'org_p71vwx', amount: '$99.00', status: 'Failed' },
];

const AdminSecurityBilling = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('billing');
  
  // Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [rateLimitFree, setRateLimitFree] = useState(100);
  const [rateLimitPro, setRateLimitPro] = useState(5000);
  
  // Modal State
  const [authModal, setAuthModal] = useState({ isOpen: false, action: null, title: '', requiredPhrase: '', input: '' });

  useEffect(() => {
    if (location.pathname.includes('/admin/settings')) {
      setActiveTab('settings');
    } else {
      setActiveTab('billing');
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  const openAuthModal = (action, title, requiredPhrase) => {
    setAuthModal({
      isOpen: true,
      action,
      title,
      requiredPhrase,
      input: ''
    });
  };

  const handleAuthSubmit = () => {
    if (authModal.input === authModal.requiredPhrase) {
      // Execute action
      if (authModal.action === 'toggle_maintenance') {
        setMaintenanceMode(!maintenanceMode);
      } else if (authModal.action === 'deploy_limits') {
        // Mock deploy
      } else if (authModal.action === 'pause_mongo') {
        // Mock pause
      }
      setAuthModal({ ...authModal, isOpen: false });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-zinc-800 flex flex-col">
      {/* Header & Global Controls */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,238,252,0.2)]">
              <FaTerminal className="text-on-primary-container text-xl" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tighter text-primary-fixed">LogLogic</span>
          </Link>
          <div className="h-6 w-px bg-zinc-800/80 mx-2"></div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Admin <span className="text-zinc-600 font-normal ml-2">// Command Center</span></h1>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex bg-zinc-900/80 p-1 rounded border border-zinc-800/80">
            <button 
              onClick={() => handleTabChange('billing')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'billing' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Stripe Operations
            </button>
            <button 
              onClick={() => handleTabChange('settings')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${activeTab === 'settings' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <FiShield className="mr-1.5 w-3 h-3" /> Global Platform Settings
            </button>
          </div>
          <div className="flex items-center text-zinc-500 font-mono text-xs">
            <div className="relative w-4 h-4 mr-2 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
            SYSTEM SECURE
          </div>
        </div>
      </header>

      {/* Global Tabs */}
      <div className="bg-[#09090b] border-b border-zinc-800/80 px-6 flex space-x-6 sticky top-[73px] z-10 backdrop-blur-md">
        <Link to="/admin/dashboard" className="py-3 text-sm font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition-colors">Dashboard</Link>
        <Link to="/admin/queues" className="py-3 text-sm font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition-colors">Infrastructure</Link>
        <Link to="/admin/billing" className="py-3 text-sm font-medium border-b-2 border-zinc-100 text-zinc-100">Financials & Security</Link>
      </div>

      <main className="p-6 max-w-[1600px] w-full mx-auto space-y-6 flex-1">
        {activeTab === 'billing' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-zinc-100 flex items-center"><FiDollarSign className="mr-2" /> Stripe Webhook Operations</h2>
              <button className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-100 border border-transparent text-zinc-900 hover:bg-white transition-colors rounded shadow-sm">
                <FiRefreshCw className="mr-2 w-3 h-3" /> Force Global Stripe Sync
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded shadow-sm">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Last Sync Payload</h3>
                <span className="text-3xl font-mono text-zinc-100 tracking-tight">42s ago</span>
              </div>
              <div className="bg-amber-950/10 border border-amber-900/30 p-5 rounded shadow-sm relative overflow-hidden">
                <h3 className="text-amber-500/80 text-[10px] font-bold uppercase tracking-widest mb-3">Unresolved Payment Failures</h3>
                <span className="text-3xl font-mono text-amber-500 tracking-tight">2</span>
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
              </div>
              <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded shadow-sm">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Active Subscriptions</h3>
                <span className="text-3xl font-mono text-zinc-100 tracking-tight">1,842</span>
              </div>
            </div>

            <div className="bg-[#0f0f11] border border-zinc-800/80 rounded overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-zinc-800/80 bg-[#09090b]/50 flex justify-between items-center">
                <span className="text-xs font-mono text-zinc-500">WEBHOOK EVENT FEED // stripe_events</span>
              </div>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#09090b] text-zinc-500 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-800/80">
                  <tr>
                    <th className="px-5 py-3 font-medium">Timestamp</th>
                    <th className="px-5 py-3 font-medium">Event Type</th>
                    <th className="px-5 py-3 font-medium">Org ID</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {mockStripeEvents.map((evt, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/20 transition-colors font-mono text-xs">
                      <td className="px-5 py-4 text-zinc-500">{evt.timestamp}</td>
                      <td className="px-5 py-4 text-zinc-300 font-bold">{evt.type}</td>
                      <td className="px-5 py-4 text-zinc-400">{evt.orgId}</td>
                      <td className="px-5 py-4 text-zinc-300">{evt.amount}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          evt.status === 'Processed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors rounded text-[10px] uppercase tracking-wider font-bold">
                          Inspect Payload & Force Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center text-red-500 mb-6">
              <FiShield className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-bold uppercase tracking-widest">Emergency Levers</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 bg-[#0c0505] p-6 border border-red-900/30 rounded-lg shadow-[inset_0_0_50px_rgba(220,38,38,0.03)] relative overflow-hidden">
              {/* Subtle background warning stripes */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #dc2626, #dc2626 10px, transparent 10px, transparent 20px)' }}></div>

              {/* Section A: Maintenance Mode */}
              <div className="bg-[#0f0f11] border border-red-900/40 p-6 rounded relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-zinc-100 font-bold text-base flex items-center">
                    Enable Global Maintenance Mode
                  </h3>
                  <p className="text-zinc-500 text-sm mt-1 max-w-xl">
                    Routes all non-admin UI traffic to a 503 Maintenance page. Super Admins bypass this automatically.
                  </p>
                </div>
                <button 
                  onClick={() => openAuthModal('toggle_maintenance', 'Toggle Maintenance Mode', maintenanceMode ? 'DISABLE MAINTENANCE' : 'ENABLE MAINTENANCE')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#0f0f11] ${maintenanceMode ? 'bg-red-600' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Section B: Global Rate Limiting */}
              <div className="bg-[#0f0f11] border border-red-900/40 p-6 rounded relative z-10">
                <div className="mb-4">
                  <h3 className="text-zinc-100 font-bold text-base">Global Rate Limiting</h3>
                  <p className="text-zinc-500 text-sm mt-1">Configure Node.js API limiters on the fly.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Max Ingestion Rate (Free Tier)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={rateLimitFree}
                        onChange={(e) => setRateLimitFree(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2 font-mono text-sm text-zinc-100 focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                      <span className="absolute right-4 top-2.5 text-xs font-mono text-zinc-600">logs/sec</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Max Ingestion Rate (Pro Tier)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={rateLimitPro}
                        onChange={(e) => setRateLimitPro(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2 font-mono text-sm text-zinc-100 focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                      <span className="absolute right-4 top-2.5 text-xs font-mono text-zinc-600">logs/sec</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => openAuthModal('deploy_limits', 'Deploy Rate Limits', 'DEPLOY LIMITS')}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Deploy New Limits
                </button>
              </div>

              {/* Section C: Database Circuit Breaker */}
              <div className="bg-[#1a0b0b] border border-red-500/50 p-6 rounded relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-red-500 font-bold text-base flex items-center">
                      <FiDatabase className="mr-2" /> Database Circuit Breaker
                    </h3>
                    <p className="text-red-400/70 text-sm mt-1 max-w-xl">
                      Forces the Node.js ingestion API to hold all incoming logs in the Redis buffer. Use ONLY during Atlas cluster upgrades.
                    </p>
                  </div>
                  <button 
                    onClick={() => openAuthModal('pause_mongo', 'Pause MongoDB Writes', 'PAUSE DB WRITES')}
                    className="whitespace-nowrap px-6 py-3 bg-red-950/80 border border-red-600/80 text-red-500 hover:bg-red-900 hover:text-white font-bold text-sm uppercase tracking-wider rounded shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all"
                  >
                    Pause MongoDB Writes
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Security Auth Modal */}
      {authModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f11] border border-red-900 rounded-lg p-6 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            <div className="flex items-center mb-6">
              <div className="bg-red-500/10 p-3 rounded-full mr-4 text-red-500">
                <FiLock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">{authModal.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">Verification Required</p>
              </div>
            </div>
            
            <div className="mb-6 space-y-4">
              <div className="bg-red-950/20 border border-red-900/30 p-3 rounded text-sm text-red-400">
                This is a highly destructive or platform-altering action. Please type the exact phrase below to confirm your intent.
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Type <span className="font-mono text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded select-none">{authModal.requiredPhrase}</span> to confirm:
                </label>
                <input 
                  type="text" 
                  value={authModal.input}
                  onChange={(e) => setAuthModal({ ...authModal, input: e.target.value })}
                  placeholder={authModal.requiredPhrase}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-red-500 transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-zinc-800/80">
              <button 
                onClick={() => setAuthModal({ ...authModal, isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={authModal.input !== authModal.requiredPhrase}
                onClick={handleAuthSubmit}
                className={`px-4 py-2 text-sm font-bold rounded transition-colors ${authModal.input === authModal.requiredPhrase ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
              >
                Execute Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSecurityBilling;
