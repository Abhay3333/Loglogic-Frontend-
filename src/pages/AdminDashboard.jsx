import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { FaTerminal } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Mock data for the chart
const chartData = [
  { name: '1', mrr: 12000, cost: 3000 },
  { name: '5', mrr: 12500, cost: 3100 },
  { name: '10', mrr: 13200, cost: 3400 },
  { name: '15', mrr: 13800, cost: 3500 },
  { name: '20', mrr: 14500, cost: 3800 },
  { name: '25', mrr: 14900, cost: 4200 },
  { name: '30', mrr: 15200, cost: 4100 },
];

const topOrgs = [
  { id: 1, name: 'Acme Corp', plan: 'Enterprise', logCount: '45.2M' },
  { id: 2, name: 'Globex Inc', plan: 'Enterprise', logCount: '38.7M' },
  { id: 3, name: 'Soylent Ltd', plan: 'Pro', logCount: '12.4M' },
  { id: 4, name: 'Initech', plan: 'Pro', logCount: '8.9M' },
  { id: 5, name: 'Umbrella Corp', plan: 'Startup', logCount: '2.1M' },
];

const AdminDashboard = () => {
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(prev => (prev < 59 ? prev + 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-zinc-800">
      {/* Header & Global Controls */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
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
          <div className="flex items-center space-x-2 bg-zinc-900/50 px-3 py-1.5 rounded border border-zinc-800/80">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="font-mono text-green-400 font-medium tracking-wide text-xs">ALL SYSTEMS OPERATIONAL</span>
          </div>
          <div className="flex items-center text-zinc-500 font-mono text-xs">
            <FiRefreshCw className={`mr-2 ${lastUpdated === 0 ? 'animate-spin text-zinc-300' : ''}`} />
            Last updated: {lastUpdated}s ago
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-[#09090b] border-b border-zinc-800/80 px-6 flex space-x-6 sticky top-[73px] z-10 backdrop-blur-md">
        <Link to="/admin/dashboard" className="py-3 text-sm font-medium border-b-2 border-zinc-100 text-zinc-100">Dashboard</Link>
        <Link to="/admin/queues" className="py-3 text-sm font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition-colors">Infrastructure</Link>
        <Link to="/admin/billing" className="py-3 text-sm font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition-colors">Financials & Security</Link>
      </div>

      <main className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded flex flex-col justify-between shadow-sm">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Total Active MRR (Stripe)</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-mono text-zinc-100 tracking-tight">$15,200</span>
              <span className="text-green-400 font-mono text-xs bg-green-500/10 px-2 py-1 rounded border border-green-500/20">+3.1% MoM</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded flex flex-col justify-between shadow-sm">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">New Signups Today</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-mono text-zinc-100 tracking-tight">42</span>
              <span className="text-zinc-400 font-mono text-xs bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700/50">Paid Conversions: <span className="text-zinc-200">2</span></span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Global Ingestion Rate (All Nodes)</h3>
            <div className="flex items-end justify-between relative z-10">
              <span className="text-3xl font-mono text-zinc-100 tracking-tight">8,450</span>
              <span className="text-amber-500 font-mono text-xs bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">High Load</span>
            </div>
            {/* Ambient glow effect for high load */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Overall Mongo Storage Utilization</h3>
            </div>
            <div className="mt-auto">
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-mono text-zinc-100 tracking-tight">2.1 TB</span>
                <span className="text-zinc-500 font-mono text-xs">/ 10.0 TB</span>
              </div>
              <div className="w-full bg-zinc-900 border border-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: '21%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Visualization Panel */}
        <div className="bg-[#0f0f11] border border-zinc-800/80 rounded p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-zinc-200 font-medium text-sm tracking-wide">System Efficiency: Revenue vs. Compute Cost (Last 30 Days)</h2>
            <div className="flex space-x-5 text-xs font-mono text-zinc-400">
              <div className="flex items-center"><div className="w-3 h-3 bg-green-500/20 border border-green-500/50 mr-2 rounded-sm"></div> MRR (Stripe)</div>
              <div className="flex items-center"><div className="w-3 h-0.5 bg-blue-500 mr-2"></div> Infra Cost (AWS)</div>
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Day ${val}`} dy={10} />
                <YAxis yAxisId="left" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
                <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} dx={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                  cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="mrr" stroke="#22c55e" fillOpacity={1} fill="url(#colorMrr)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#18181b', strokeWidth: 2, stroke: '#3b82f6' }} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#18181b' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Organizations by Usage */}
        <div className="bg-[#0f0f11] border border-zinc-800/80 rounded overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-800/80 flex justify-between items-center bg-[#09090b]/50">
            <h2 className="text-zinc-200 font-medium text-sm tracking-wide">Top Organizations by Usage (Current Month)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#09090b] text-zinc-500 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-800/80">
                <tr>
                  <th className="px-5 py-3 font-medium">Org Name</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Monthly Log Count</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {topOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-5 py-4 font-medium text-zinc-300">{org.name}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                        org.plan === 'Enterprise' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                        org.plan === 'Pro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-zinc-400">{org.logCount}</td>
                    <td className="px-5 py-4 text-right">
                      <button className="inline-flex items-center px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold bg-zinc-950 border border-red-900/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all rounded shadow-sm opacity-80 group-hover:opacity-100">
                        <FiAlertTriangle className="mr-1.5 w-3 h-3" /> Suspend API Key
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
