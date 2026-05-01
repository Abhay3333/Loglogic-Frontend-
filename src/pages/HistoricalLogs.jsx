import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuSearch,
  LuDownload,
  LuX,
  LuCopy,
  LuCircleAlert,
  LuTriangleAlert,
  LuInfo,
  LuChevronLeft,
  LuChevronRight,
  LuClock,
  LuFilter,
  LuCalendar,
  LuArrowLeft
} from 'react-icons/lu';

// Mock Data
const MOCK_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-04-30T15:19:45.123Z',
    level: 'ERROR',
    service: 'payment-api',
    message: 'Stripe API connection timeout during charge creation.',
    meta: {
      customerId: 'cus_xyz123',
      amount: 4900,
      currency: 'USD',
      error_code: 'timeout',
      stack: 'Error: timeout\n    at Request._callback (/app/node_modules/stripe/...)'
    }
  },
  {
    id: 'log-2',
    timestamp: '2026-04-30T15:19:42.051Z',
    level: 'WARN',
    service: 'auth-worker',
    message: 'High latency detected during JWT signature verification.',
    meta: {
      userId: 'usr_abc890',
      latency_ms: 850,
      threshold_ms: 500
    }
  },
  {
    id: 'log-3',
    timestamp: '2026-04-30T15:19:40.992Z',
    level: 'INFO',
    service: 'user-service',
    message: 'User profile updated successfully.',
    meta: {
      userId: 'usr_abc890',
      updatedFields: ['email', 'preferences']
    }
  },
  {
    id: 'log-4',
    timestamp: '2026-04-30T15:19:35.400Z',
    level: 'ERROR',
    service: 'payment-api',
    message: 'Invalid payment method provided.',
    meta: {
      customerId: 'cus_req999',
      error_code: 'invalid_payment_method'
    }
  },
  {
    id: 'log-5',
    timestamp: '2026-04-30T15:19:10.001Z',
    level: 'INFO',
    service: 'auth-worker',
    message: 'New session created for user.',
    meta: {
      userId: 'usr_def456',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0...'
    }
  },
];

// Add more to show scroll
for (let i = 6; i <= 25; i++) {
  MOCK_LOGS.push({
    id: `log-${i}`,
    timestamp: new Date(Date.now() - i * 10000).toISOString(),
    level: i % 7 === 0 ? 'ERROR' : i % 4 === 0 ? 'WARN' : 'INFO',
    service: i % 2 === 0 ? 'payment-api' : 'user-service',
    message: `Sample log message ${i} for testing layout and pagination.`,
    meta: { index: i, note: 'Generated mock log' }
  });
}

// Helper components
const LevelBadge = ({ level }) => {
  switch (level) {
    case 'ERROR':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20">
          <LuCircleAlert className="w-3.5 h-3.5" /> ERROR
        </span>
      );
    case 'WARN':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
          <LuTriangleAlert className="w-3.5 h-3.5" /> WARN
        </span>
      );
    case 'INFO':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
          <LuInfo className="w-3.5 h-3.5" /> INFO
        </span>
      );
  }
};

export default function HistoricalLogs() {
  const navigate = useNavigate();
  const [selectedLog, setSelectedLog] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('15m');
  const [selectedLevels, setSelectedLevels] = useState(['ERROR', 'WARN', 'INFO']);
  const [selectedServices, setSelectedServices] = useState(['payment-api', 'auth-worker', 'user-service']);

  const [logs, setLogs] = useState(MOCK_LOGS);

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setIsPanelOpen(true);
  };

  const handleSearch = () => {
    setIsLoading(true);
    // Mock network request
    setTimeout(() => {
      const filtered = MOCK_LOGS.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = selectedLevels.includes(log.level);
        const matchesService = selectedServices.includes(log.service);
        return matchesSearch && matchesLevel && matchesService;
      });
      setLogs(filtered);
      setIsLoading(false);
    }, 600);
  };

  const toggleLevel = (level) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedLog.meta, null, 2));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3,
      hour12: false
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0e14] text-[#f1f3fc] font-sans overflow-hidden cyber-grid">
      
      {/* 1. Query & Filter Bar (Sticky Top) */}
      <header className="flex-none bg-[#0a0e14]/95 backdrop-blur border-b border-[#44484f]/20 p-4 sticky top-0 z-20">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/app/dashboard')}
                className="p-1.5 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors"
                title="Back to Dashboard"
              >
                <LuArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-headline font-bold text-[#f1f3fc] flex items-center gap-2 tracking-tight">
                Historical Search
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors" title="Export to CSV">
                <LuDownload className="w-5 h-5" />
              </button>
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 rounded-lg border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-4 py-2 text-sm text-[#8ff5ff] hover:bg-[#00eefc]/20 transition-colors shadow-[0_0_15px_rgba(0,238,252,0.1)]"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-[#8ff5ff]/20 border-t-[#8ff5ff] rounded-full animate-spin" />
                ) : (
                  <LuSearch className="w-4 h-4" />
                )}
                Search Logs
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Time Range Picker */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuClock className="w-4 h-4 text-[#7f8594]" />
              </div>
              <select
                className="bg-[#11161d] border border-[#44484f]/30 text-[#f1f3fc] text-sm rounded-md focus:border-[#8ff5ff]/50 focus:ring-1 focus:ring-[#8ff5ff]/50 focus:outline-none block w-full pl-9 pr-8 py-2 appearance-none cursor-pointer hover:border-[#44484f]/60 transition-colors"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="15m">Last 15 Minutes</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>

            {/* Text Search */}
            <div className="flex-1 relative min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuSearch className="w-4 h-4 text-[#7f8594]" />
              </div>
              <input
                type="text"
                placeholder="Search log messages or raw JSON..."
                className="bg-[#11161d] border border-[#44484f]/30 text-[#f1f3fc] text-sm rounded-md focus:border-[#8ff5ff]/50 focus:ring-1 focus:ring-[#8ff5ff]/50 focus:outline-none block w-full pl-10 p-2 placeholder-[#7f8594] transition-colors hover:border-[#44484f]/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Multi-Select: Level */}
            <div className="relative group">
              <button className="bg-[#11161d] border border-[#44484f]/30 text-[#f1f3fc] text-sm rounded-md px-3 py-2 flex items-center gap-2 hover:border-[#44484f]/60 transition-colors">
                <LuFilter className="w-4 h-4 text-[#7f8594]" />
                Levels ({selectedLevels.length})
              </button>
              <div className="absolute top-full right-0 lg:left-0 mt-2 w-48 bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] p-2 hidden group-hover:block z-50">
                {['ERROR', 'WARN', 'INFO'].map(level => (
                  <label key={level} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#1a2027] rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded bg-[#0a0e14] border-[#44484f]/50 text-[#00eefc] focus:ring-[#00eefc]"
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleLevel(level)}
                    />
                    <span className="text-sm text-[#a8abb3]">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Multi-Select: Service */}
            <div className="relative group">
              <button className="bg-[#11161d] border border-[#44484f]/30 text-[#f1f3fc] text-sm rounded-md px-3 py-2 flex items-center gap-2 hover:border-[#44484f]/60 transition-colors">
                <LuFilter className="w-4 h-4 text-[#7f8594]" />
                Services ({selectedServices.length})
              </button>
              <div className="absolute top-full right-0 lg:left-0 mt-2 w-56 bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] p-2 hidden group-hover:block z-50">
                {['payment-api', 'auth-worker', 'user-service'].map(service => (
                  <label key={service} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#1a2027] rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded bg-[#0a0e14] border-[#44484f]/50 text-[#00eefc] focus:ring-[#00eefc]"
                      checked={selectedServices.includes(service)}
                      onChange={() => toggleService(service)}
                    />
                    <span className="text-sm font-mono text-[#a8abb3]">{service}</span>
                  </label>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </header>

      {/* 2. Main Data Table */}
      <main className="flex-1 overflow-auto relative custom-scrollbar p-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="rounded-2xl border border-[#44484f]/25 overflow-hidden bg-[#11161d] shadow-[0_0_20px_rgba(0,0,0,0.2)] flex-1 flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#11161d] border-b border-[#44484f]/30 sticky top-0 z-10 text-[#a8abb3]">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium flex items-center gap-1 cursor-pointer hover:text-[#f1f3fc] transition-colors group">
                      Timestamp <span className="text-xs text-[#7f8594] group-hover:text-[#8ff5ff]">↓</span>
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">Level</th>
                    <th scope="col" className="px-4 py-3 font-medium">Service</th>
                    <th scope="col" className="px-4 py-3 font-medium w-full">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#44484f]/20">
                  {isLoading ? (
                    // Skeleton Loading State
                    [...Array(10)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3.5"><div className="h-4 bg-[#1a2027] rounded w-32"></div></td>
                        <td className="px-4 py-3.5"><div className="h-5 bg-[#1a2027] rounded w-16"></div></td>
                        <td className="px-4 py-3.5"><div className="h-4 bg-[#1a2027] rounded w-24"></div></td>
                        <td className="px-4 py-3.5"><div className="h-4 bg-[#1a2027] rounded w-3/4"></div></td>
                      </tr>
                    ))
                  ) : logs.length === 0 ? (
                    // Empty State
                    <tr>
                      <td colSpan="4" className="px-4 py-20 text-center text-[#7f8594]">
                        <LuSearch className="w-8 h-8 mx-auto mb-3 text-[#586173]" />
                        <p className="text-base font-medium text-[#a8abb3]">No logs found for this filter</p>
                        <p className="mt-1 text-sm">Try adjusting your search terms or date range.</p>
                      </td>
                    </tr>
                  ) : (
                    // Data Rows
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => handleRowClick(log)}
                        className={`hover:bg-[#1a2027] cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-[#1a2027]/80' : ''}`}
                      >
                        <td className="px-4 py-2.5 text-[#7f8594] font-mono text-xs">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-4 py-2.5">
                          <LevelBadge level={log.level} />
                        </td>
                        <td className="px-4 py-2.5 text-[#a8abb3] font-mono text-xs">
                          {log.service}
                        </td>
                        <td className="px-4 py-2.5 text-[#f1f3fc] font-mono text-sm truncate max-w-[300px] sm:max-w-[400px] lg:max-w-[600px]" title={log.message}>
                          {log.message}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Pagination & Data Navigation */}
          {!isLoading && logs.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-[#7f8594] px-1">
              <div>
                Showing <span className="font-medium text-[#a8abb3]">1</span> to <span className="font-medium text-[#a8abb3]">{logs.length}</span> of <span className="font-medium text-[#a8abb3]">2,402</span> logs
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-md hover:bg-[#1a2027] text-[#7f8594] hover:text-[#f1f3fc] border border-transparent hover:border-[#44484f]/30 disabled:opacity-50 transition-colors" disabled>
                  <LuChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-[#1a2027] text-[#7f8594] hover:text-[#f1f3fc] border border-transparent hover:border-[#44484f]/30 transition-colors">
                  <LuChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. "Log Details" Slide-over Panel */}
      {/* Backdrop */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-[#0a0e14]/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[#11161d] border-l border-[#44484f]/30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {selectedLog && (
          <>
            <div className="flex items-center justify-between p-5 border-b border-[#44484f]/25 bg-[#11161d]">
              <h2 className="font-headline text-lg font-bold text-[#f1f3fc] flex items-center gap-2">
                <LuInfo className="w-5 h-5 text-[#8ff5ff]" />
                Log Details
              </h2>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-1.5 text-[#7f8594] hover:text-[#f1f3fc] hover:bg-[#1a2027] rounded-md transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Header Info */}
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-[#7f8594] uppercase tracking-widest mb-1.5 font-medium">Timestamp</div>
                  <div className="text-sm font-mono text-[#a8abb3] bg-[#0a0e14] p-2.5 rounded-lg border border-[#44484f]/30 flex items-center gap-2">
                    <LuCalendar className="w-4 h-4 text-[#586173]" />
                    {formatDate(selectedLog.timestamp)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[#7f8594] uppercase tracking-widest mb-1.5 font-medium">Level</div>
                    <div><LevelBadge level={selectedLog.level} /></div>
                  </div>
                  <div>
                    <div className="text-xs text-[#7f8594] uppercase tracking-widest mb-1.5 font-medium">Service</div>
                    <div className="text-sm font-mono text-[#a8abb3] bg-[#0a0e14] px-2.5 py-1 rounded-md border border-[#44484f]/30 inline-block">
                      {selectedLog.service}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#7f8594] uppercase tracking-widest mb-1.5 font-medium">Message</div>
                  <div className="text-sm text-[#f1f3fc] leading-relaxed font-mono bg-[#0a0e14] p-3.5 rounded-lg border border-[#44484f]/30 break-words">
                    {selectedLog.message}
                  </div>
                </div>
              </div>

              {/* JSON Payload Area */}
              <div>
                <div className="flex items-center justify-between mb-2 mt-2">
                  <div className="text-xs text-[#7f8594] uppercase tracking-widest font-medium">Metadata Payload</div>
                  <button
                    className="flex items-center gap-1.5 text-xs text-[#8ff5ff] hover:text-[#00eefc] transition-colors bg-[#00eefc]/10 hover:bg-[#00eefc]/20 px-2.5 py-1.5 rounded-md border border-[#8ff5ff]/20"
                    onClick={handleCopyJson}
                  >
                    <LuCopy className="w-3.5 h-3.5" /> Copy JSON
                  </button>
                </div>
                <div className="bg-[#050d1b] rounded-lg border border-[#44484f]/30 overflow-hidden relative group shadow-inner">
                  <pre className="p-4 text-[13px] font-mono text-[#a8abb3] overflow-x-auto leading-relaxed custom-scrollbar">
                    <code className="language-json">
                      {JSON.stringify(selectedLog.meta, null, 2)}
                    </code>
                  </pre>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

    </div>
  );
}
