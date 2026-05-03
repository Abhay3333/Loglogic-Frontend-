import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiAlertTriangle, FiTrash2, FiPlay, FiServer, FiActivity, FiX, FiCheck } from 'react-icons/fi';
import { FaTerminal } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const mockQueues = [
  { id: 'job_8f72a1b', orgId: 'org_x92mlk', payloadSize: '1.2 MB', status: 'Active', time: '120ms' },
  { id: 'job_9a3bc21', orgId: 'org_z18pqr', payloadSize: '450 KB', status: 'Waiting', time: '2s' },
  { id: 'job_4d21e9f', orgId: 'org_x92mlk', payloadSize: '2.1 MB', status: 'Failed', time: '5m' },
  { id: 'job_7c11a0b', orgId: 'org_m44stu', payloadSize: '890 KB', status: 'Delayed', time: '10s' },
  { id: 'job_2b99d4c', orgId: 'org_p71vwx', payloadSize: '1.8 MB', status: 'Active', time: '85ms' },
];

const mockWebhooks = [
  { timestamp: '2026-05-03T15:40:12Z', orgId: 'org_x92mlk', url: 'https://hooks.slack.com/services/T0...', status: 200, time: '142ms' },
  { timestamp: '2026-05-03T15:39:55Z', orgId: 'org_z18pqr', url: 'https://discord.com/api/webhooks/1...', status: 429, time: '1.2s' },
  { timestamp: '2026-05-03T15:38:22Z', orgId: 'org_m44stu', url: 'https://api.pagerduty.com/v2/enque...', status: 200, time: '210ms' },
  { timestamp: '2026-05-03T15:35:10Z', orgId: 'org_x92mlk', url: 'https://hooks.slack.com/services/T0...', status: 500, time: '3.4s' },
  { timestamp: '2026-05-03T15:31:05Z', orgId: 'org_p71vwx', url: 'https://custom-alert.endpoint.dev/...', status: 200, time: '89ms' },
];

const AdminInfrastructure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queues');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState(null);

  useEffect(() => {
    if (location.pathname.includes('/admin/alerts')) {
      setActiveTab('alerts');
    } else {
      setActiveTab('queues');
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  const openDrawer = (webhook) => {
    setSelectedPayload({
      webhook,
      payload: {
        "event": "high_error_rate",
        "description": "Error rate exceeded 5% threshold in last 5 minutes.",
        "org_id": webhook.orgId,
        "timestamp": webhook.timestamp,
        "details": {
          "current_rate": "6.2%",
          "affected_services": ["api-gateway", "auth-service"]
        }
      }
    });
    setIsDrawerOpen(true);
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
              onClick={() => handleTabChange('queues')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'queues' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Redis Queues (Ingestion)
            </button>
            <button 
              onClick={() => handleTabChange('alerts')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'alerts' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Python Engine (Webhooks)
            </button>
          </div>
          <div className="flex items-center text-zinc-500 font-mono text-xs">
            <div className="relative w-4 h-4 mr-2 flex items-center justify-center">
              <svg className="animate-spin w-3 h-3 text-zinc-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            Polling (3s)
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-[#09090b] border-b border-zinc-800/80 px-6 flex space-x-6 sticky top-[73px] z-10 backdrop-blur-md">
        <Link to="/admin/dashboard" className="py-3 text-sm font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition-colors">Dashboard</Link>
        <Link to="/admin/queues" className="py-3 text-sm font-medium border-b-2 border-zinc-100 text-zinc-100">Infrastructure</Link>
        <Link to="/admin/billing" className="py-3 text-sm font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition-colors">Financials & Security</Link>
      </div>

      <main className="p-6 max-w-[1600px] w-full mx-auto space-y-6 flex-1">
        {activeTab === 'queues' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-zinc-100">BullMQ Redis State</h2>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors rounded shadow-sm">
                  <FiPlay className="mr-2 w-3 h-3" /> Retry All Failed
                </button>
                <button 
                  onClick={() => setIsPurgeModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-950/30 border border-red-900/50 text-red-500 hover:bg-red-900/40 hover:border-red-500/50 transition-colors rounded shadow-sm"
                >
                  <FiTrash2 className="mr-2 w-3 h-3" /> Purge Queue
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded shadow-sm">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Active Jobs</h3>
                <span className="text-3xl font-mono text-zinc-100 tracking-tight">1,204</span>
              </div>
              <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded shadow-sm">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Waiting Jobs</h3>
                <span className="text-3xl font-mono text-zinc-100 tracking-tight">8,450</span>
              </div>
              <div className="bg-red-950/10 border border-red-900/30 p-5 rounded shadow-sm relative overflow-hidden">
                <h3 className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest mb-3">Failed Jobs</h3>
                <span className="text-3xl font-mono text-red-500 tracking-tight">23</span>
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
              </div>
              <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded shadow-sm">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Delayed</h3>
                <span className="text-3xl font-mono text-zinc-100 tracking-tight">412</span>
              </div>
            </div>

            <div className="bg-[#0f0f11] border border-zinc-800/80 rounded overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-zinc-800/80 bg-[#09090b]/50 flex justify-between items-center">
                <span className="text-xs font-mono text-zinc-500">LIVE QUEUE // top 50 entries</span>
              </div>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#09090b] text-zinc-500 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-800/80">
                  <tr>
                    <th className="px-5 py-3 font-medium">Job ID</th>
                    <th className="px-5 py-3 font-medium">Organization ID</th>
                    <th className="px-5 py-3 font-medium">Payload Size</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Time in Queue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {mockQueues.map((job, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/20 transition-colors font-mono text-xs">
                      <td className="px-5 py-3 text-zinc-300">{job.id}</td>
                      <td className="px-5 py-3 text-zinc-400">{job.orgId}</td>
                      <td className="px-5 py-3 text-zinc-400">{job.payloadSize}</td>
                      <td className="px-5 py-3">
                        <span className={`flex items-center w-fit px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                          job.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          job.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          job.status === 'Delayed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {job.status === 'Active' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></div>}
                          {job.status === 'Failed' && <FiAlertTriangle className="mr-1 w-2.5 h-2.5" />}
                          {job.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-500">{job.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-medium text-zinc-100">Python Alerting Engine State</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded shadow-sm">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Webhooks Sent (24h)</h3>
                <span className="text-3xl font-mono text-zinc-100 tracking-tight">142,890</span>
              </div>
              <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded shadow-sm flex flex-col justify-between">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Delivery Success Rate</h3>
                <div className="flex items-end space-x-3">
                  <span className="text-3xl font-mono text-green-400 tracking-tight">99.8%</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                    <div className="h-full bg-green-500 w-[99.8%]"></div>
                  </div>
                </div>
              </div>
              <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded shadow-sm">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">P99 Latency</h3>
                <div className="flex items-end space-x-2">
                  <span className="text-3xl font-mono text-zinc-100 tracking-tight">245</span>
                  <span className="text-zinc-500 font-mono mb-1">ms</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0f0f11] border border-zinc-800/80 rounded overflow-hidden shadow-sm">
               <div className="px-5 py-3 border-b border-zinc-800/80 bg-[#09090b]/50 flex justify-between items-center">
                <span className="text-xs font-mono text-zinc-500">OUTGOING HTTP LOG // tail -f alerts.log</span>
              </div>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#09090b] text-zinc-500 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-800/80">
                  <tr>
                    <th className="px-5 py-3 font-medium">Timestamp</th>
                    <th className="px-5 py-3 font-medium">Target Org</th>
                    <th className="px-5 py-3 font-medium">Destination URL</th>
                    <th className="px-5 py-3 font-medium">Status Code</th>
                    <th className="px-5 py-3 font-medium">Latency</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {mockWebhooks.map((hook, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/20 transition-colors font-mono text-xs">
                      <td className="px-5 py-3 text-zinc-500">{hook.timestamp}</td>
                      <td className="px-5 py-3 text-zinc-300">{hook.orgId}</td>
                      <td className="px-5 py-3 text-zinc-400 truncate max-w-[200px]">{hook.url}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          hook.status === 200 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          hook.status === 429 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {hook.status} {hook.status === 200 ? 'OK' : hook.status === 429 ? 'RATE_LIMIT' : 'ERR'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-500">{hook.time}</td>
                      <td className="px-5 py-3 text-right">
                        <button 
                          onClick={() => openDrawer(hook)}
                          className="px-3 py-1 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors rounded text-[10px] uppercase tracking-wider"
                        >
                          View Payload
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Purge Modal */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f0f11] border border-red-900/50 rounded-lg p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <div className="flex items-start mb-4">
              <div className="bg-red-500/10 p-3 rounded-full mr-4 text-red-500">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Purge Queue Backlog?</h3>
                <p className="text-sm text-zinc-400 mt-2">
                  This is a destructive action. All waiting and delayed jobs will be permanently deleted from Redis. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
              >
                Yes, Purge Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payload Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#09090b] border-l border-zinc-800 shadow-2xl h-full flex flex-col transform transition-transform duration-300">
            <div className="px-6 py-4 border-b border-zinc-800/80 flex justify-between items-center bg-[#0f0f11]">
              <div>
                <h3 className="text-lg font-medium text-zinc-100">Webhook Payload</h3>
                <p className="text-xs font-mono text-zinc-500 mt-1">{selectedPayload?.webhook?.timestamp || 'Delivery attempt'}</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors bg-zinc-900 rounded-md border border-zinc-800"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6 space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Destination</span>
                  <div className="font-mono text-xs text-zinc-300 bg-zinc-900 p-2 rounded border border-zinc-800/50 mt-1 break-all">
                    {selectedPayload?.webhook?.url}
                  </div>
                </div>
                <div className="flex space-x-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Status</span>
                    <div className="font-mono text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded border ${
                        selectedPayload?.webhook?.status === 200 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        selectedPayload?.webhook?.status === 429 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {selectedPayload?.webhook?.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Latency</span>
                    <div className="font-mono text-xs text-zinc-300 mt-1">
                      {selectedPayload?.webhook?.time}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">JSON Body</span>
                <button className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-200 font-bold">Copy</button>
              </div>
              <pre className="bg-zinc-950 border border-zinc-800 rounded p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selectedPayload?.payload, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-zinc-800 bg-[#0f0f11] flex justify-end">
               <button className="px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-white font-medium text-sm rounded transition-colors flex items-center">
                  <FiRefreshCw className="mr-2 w-4 h-4" /> Resend Webhook
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInfrastructure;
