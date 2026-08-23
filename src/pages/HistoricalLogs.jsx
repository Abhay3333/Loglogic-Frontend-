import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { queryLogs, getOrgServices } from '../api/logs';
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
  LuArrowLeft,
  LuRefreshCw,
  LuCheck
} from 'react-icons/lu';

// Helper components
const LevelBadge = ({ level }) => {
  const norm = String(level || 'info').toUpperCase();
  switch (norm) {
    case 'FATAL':
    case 'CRITICAL':
    case 'ERROR':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20">
          <LuCircleAlert className="w-3.5 h-3.5" /> {norm}
        </span>
      );
    case 'WARN':
    case 'WARNING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
          <LuTriangleAlert className="w-3.5 h-3.5" /> WARN
        </span>
      );
    case 'INFO':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
          <LuInfo className="w-3.5 h-3.5" /> {norm}
        </span>
      );
  }
};

export default function HistoricalLogs() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const { organizations = [], currentOrg } = outletContext;

  const [selectedLog, setSelectedLog] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedLevels, setSelectedLevels] = useState(['ERROR', 'WARN', 'INFO', 'DEBUG']);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');

  // Pagination & data
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  const activeOrgId = currentOrg?.id || (organizations.length > 0 ? organizations[0].id : null);
  const currentOrgName = currentOrg?.name || (organizations.length > 0 ? organizations[0].name : 'Workspace');

  // Fetch available services
  useEffect(() => {
    if (activeOrgId) {
      getOrgServices(activeOrgId)
        .then(data => setAvailableServices(data.services || []))
        .catch(err => console.error("Error loading services:", err));
    }
  }, [activeOrgId]);

  // Fetch logs
  const fetchLogs = useCallback(async (pageToFetch = 1) => {
    if (!activeOrgId) return;
    setIsLoading(true);

    try {
      let startDate = null;
      const now = new Date();
      if (timeRange === '15m') startDate = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
      else if (timeRange === '1h') startDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      else if (timeRange === '24h') startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      else if (timeRange === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      else if (timeRange === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await queryLogs({
        orgId: activeOrgId,
        levels: selectedLevels.map(l => l.toLowerCase()),
        service: selectedService || undefined,
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        page: pageToFetch,
        limit: 50
      });

      setLogs(response.logs || []);
      setPagination(response.pagination || { page: pageToFetch, limit: 50, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Error querying logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrgId, timeRange, selectedLevels, selectedService, searchQuery]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setIsPanelOpen(true);
  };

  const handleSearch = () => {
    fetchLogs(1);
  };

  const toggleLevel = (level) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? (prev.length > 1 ? prev.filter(l => l !== level) : prev)
        : [...prev, level]
    );
  };

  const handleCopyJson = () => {
    if (!selectedLog) return;
    const exportData = {
      id: selectedLog._id || selectedLog.id,
      timestamp: selectedLog.timestamp,
      level: selectedLog.level,
      service: selectedLog.service,
      message: selectedLog.message,
      metadata: selectedLog.metadata
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Level', 'Service', 'Message'];
    const rows = logs.map(l => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.level}"`,
      `"${l.service}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `loglogic_${activeOrgId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                className="p-1.5 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors cursor-pointer"
                title="Back to Dashboard"
              >
                <LuArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-headline font-bold text-[#f1f3fc] flex items-center gap-2 tracking-tight">
                  Historical Log Search
                </h1>
                <p className="text-xs text-[#a8abb3]">{currentOrgName} / Telemetry Explorer</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={exportCSV}
                className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors cursor-pointer" 
                title="Export current view to CSV"
              >
                <LuDownload className="w-5 h-5" />
              </button>
              <button
                onClick={() => fetchLogs(pagination.page)}
                title="Refresh logs"
                className="p-2 text-[#7f8594] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/10 rounded-md transition-colors cursor-pointer"
              >
                <LuRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#8ff5ff]' : ''}`} />
              </button>
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 rounded-lg border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-4 py-2 text-sm text-[#8ff5ff] hover:bg-[#00eefc]/20 transition-colors shadow-[0_0_15px_rgba(0,238,252,0.1)] cursor-pointer"
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
                <option value="1h">Last 1 Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Text Search */}
            <div className="flex-1 relative min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuSearch className="w-4 h-4 text-[#7f8594]" />
              </div>
              <input
                type="text"
                placeholder="Search log messages or microservice..."
                className="bg-[#11161d] border border-[#44484f]/30 text-[#f1f3fc] text-sm rounded-md focus:border-[#8ff5ff]/50 focus:ring-1 focus:ring-[#8ff5ff]/50 focus:outline-none block w-full pl-10 p-2 placeholder-[#7f8594] transition-colors hover:border-[#44484f]/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Multi-Select: Level */}
            <div className="relative group">
              <button className="bg-[#11161d] border border-[#44484f]/30 text-[#f1f3fc] text-sm rounded-md px-3 py-2 flex items-center gap-2 hover:border-[#44484f]/60 transition-colors cursor-pointer">
                <LuFilter className="w-4 h-4 text-[#7f8594]" />
                Levels ({selectedLevels.length})
              </button>
              <div className="absolute top-full right-0 lg:left-0 mt-2 w-48 bg-[#11161d] border border-[#44484f]/40 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] p-2 hidden group-hover:block z-50">
                {['ERROR', 'WARN', 'INFO', 'DEBUG'].map(level => (
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

            {/* Service Filter */}
            <div className="relative">
              <select
                className="bg-[#11161d] border border-[#44484f]/30 text-[#f1f3fc] text-sm rounded-md px-3 py-2 focus:border-[#8ff5ff]/50 focus:outline-none appearance-none cursor-pointer hover:border-[#44484f]/60 transition-colors"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">All Microservices</option>
                {availableServices.map(svc => (
                  <option key={svc} value={svc}>{svc}</option>
                ))}
              </select>
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
                    [...Array(8)].map((_, i) => (
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
                        <p className="text-base font-medium text-[#a8abb3]">No telemetry logs found</p>
                        <p className="mt-1 text-sm text-[#7f8594]">Connect your applications using an API key from Settings to start recording telemetry.</p>
                      </td>
                    </tr>
                  ) : (
                    // Data Rows
                    logs.map((log) => {
                      const logId = log._id || log.id;
                      return (
                        <tr
                          key={logId}
                          onClick={() => handleRowClick(log)}
                          className={`hover:bg-[#1a2027] cursor-pointer transition-colors ${selectedLog?._id === log._id ? 'bg-[#1a2027]/80' : ''}`}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Pagination */}
          {!isLoading && pagination.total > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-[#7f8594] px-1">
              <div>
                Page <span className="font-medium text-[#a8abb3]">{pagination.page}</span> of <span className="font-medium text-[#a8abb3]">{pagination.totalPages}</span> ({pagination.total.toLocaleString()} total logs)
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-md hover:bg-[#1a2027] text-[#7f8594] hover:text-[#f1f3fc] border border-transparent hover:border-[#44484f]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <LuChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-1.5 rounded-md hover:bg-[#1a2027] text-[#7f8594] hover:text-[#f1f3fc] border border-transparent hover:border-[#44484f]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <LuChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. "Log Details" Slide-over Panel */}
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
                Log Record Details
              </h2>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-1.5 text-[#7f8594] hover:text-[#f1f3fc] hover:bg-[#1a2027] rounded-md transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Header Info */}
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-[#7f8594] uppercase tracking-widest mb-1.5 font-medium">Timestamp (UTC)</div>
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

              {/* JSON Metadata Payload Area */}
              <div>
                <div className="flex items-center justify-between mb-2 mt-2">
                  <div className="text-xs text-[#7f8594] uppercase tracking-widest font-medium">Structured Metadata</div>
                  <button
                    className="flex items-center gap-1.5 text-xs text-[#8ff5ff] hover:text-[#00eefc] transition-colors bg-[#00eefc]/10 hover:bg-[#00eefc]/20 px-2.5 py-1.5 rounded-md border border-[#8ff5ff]/20 cursor-pointer"
                    onClick={handleCopyJson}
                  >
                    {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-400" /> : <LuCopy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <div className="bg-[#050d1b] rounded-lg border border-[#44484f]/30 overflow-hidden relative group shadow-inner">
                  <pre className="p-4 text-[13px] font-mono text-[#a8abb3] overflow-x-auto leading-relaxed custom-scrollbar">
                    <code>
                      {JSON.stringify(selectedLog.metadata || {}, null, 2)}
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
