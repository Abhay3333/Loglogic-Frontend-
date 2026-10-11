import React from 'react'
import { Link } from 'react-router-dom'
import { LuTerminal, LuImport, LuShare2, LuBellRing, LuDatabase, LuArrowLeftRight, LuCode, LuShieldCheck, LuCheck } from 'react-icons/lu'

const LandingPage = () => {
  return (
    <div>
  <meta charSet="utf-8" />
  <meta content="width=device-width, initial-scale=1.0" name="viewport" />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style dangerouslySetInnerHTML={{__html: "\nbody { font-family: 'Inter', sans-serif; background-color: #0a0e14; color: #f1f3fc; }\n.font-headline { font-family: 'Space Grotesk', sans-serif; }\n.font-mono { font-family: 'JetBrains Mono', monospace; }\n.glass-panel { background: rgba(32, 38, 47, 0.6); backdrop-filter: blur(24px); }\n.gradient-text { background: linear-gradient(to right, #8ff5ff, #00eefc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n.cta-glow { box-shadow: 0 0 15px rgba(143, 245, 255, 0.2); }\n" }} />
  {/* TopNavBar */}
  
  <main className="pt-24 overflow-hidden">
    {/* Hero Section */}
    <section className="relative px-8 py-20 lg:py-32 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00eefc]/10 border border-[#00eefc]/20 mb-6 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse" />
            <span className="text-xs text-[#00eefc] uppercase tracking-widest font-bold">v2.4.0 Engine Live</span>
          </div>
          <h1 className="font-headline text-5xl lg:text-7xl font-bold tracking-tighter leading-tight mb-6 text-white">
            Stop SSH-ing.<br />
            <span className="gradient-text">Start Solving.</span>
          </h1>
          <p className="text-[#a8abb3] text-lg lg:text-xl max-w-md mb-8 leading-relaxed">
            Precision-engineered log aggregation for high-frequency infrastructure. Real-time observability without the command-line friction.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-[#8ff5ff]/10 border-2 border-[#8ff5ff] text-[#8ff5ff] px-8 py-4 rounded-lg font-bold flex items-center gap-2 hover:bg-[#8ff5ff]/20 transition-all cta-glow">
              Deploy Instant Node
              <LuTerminal size={20} />
            </button>
            <button className="border border-white/20 text-white px-8 py-4 rounded-lg font-bold hover:bg-white/5 transition-all">
              View Documentation
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-[#8ff5ff]/5 blur-3xl rounded-full" />
          <div className="relative glass-panel rounded-xl border border-white/10 p-4 font-mono text-xs overflow-hidden shadow-2xl bg-[#0a0e14]/80">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[#a8abb3]">bash — log-stream --follow</span>
            </div>
            <div className="space-y-1.5 text-[#a8abb3]">
              <div className="flex gap-3"><span className="text-[#a8abb3] opacity-50">[2024-05-12 14:02:11]</span> <span className="text-[#00eefc]">INF</span> <span className="text-white">Ingesting packet: payload_id=9821</span></div>
              <div className="flex gap-3"><span className="text-[#a8abb3] opacity-50">[2024-05-12 14:02:12]</span> <span className="text-[#00eefc]">INF</span> <span className="text-white">Redis cluster heartbeat: healthy</span></div>
              <div className="flex gap-3"><span className="text-[#a8abb3] opacity-50">[2024-05-12 14:02:14]</span> <span className="text-red-400">WRN</span> <span className="text-red-400">Latency spike detected in us-east-1</span></div>
              <div className="flex gap-3"><span className="text-[#a8abb3] opacity-50">[2024-05-12 14:02:15]</span> <span className="text-blue-400">SYS</span> <span className="text-blue-200">Auto-scaling group: spinning up node_04</span></div>
              <div className="flex gap-3"><span className="text-[#a8abb3] opacity-50">[2024-05-12 14:02:16]</span> <span className="text-[#00eefc]">INF</span> <span className="text-white">Tenant isolation check: OK</span></div>
              <div className="flex gap-3"><span className="text-[#a8abb3] opacity-50">[2024-05-12 14:02:18]</span> <span className="text-[#00eefc]">INF</span> <span className="text-white">Websocket tunnel established</span></div>
              <div className="flex gap-3"><span className="text-[#a8abb3] opacity-50">[2024-05-12 14:02:19]</span> <span className="text-[#00eefc]">INF</span> <span className="text-white">Streaming to LogLogic dashboard...</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* Problem Section */}
    <section className="bg-[#11161d] py-24 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="max-w-2xl">
          <h2 className="font-headline text-3xl font-bold mb-6 text-white">Manual debugging is a liability.</h2>
          <p className="text-[#a8abb3] text-lg leading-relaxed mb-12">
            Your logs are trapped in a dozen ephemeral containers. When a production fire starts, you're wrestling with <code className="text-[#00eefc]">grep</code>, <code className="text-[#00eefc]">awk</code>, and expired SSH keys while your uptime bleeds. It’s slow, it’s fragmented, and it’s costing you engineering hours.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-[#0a0e14] border-l-2 border-red-500 rounded-r-lg">
              <h4 className="font-bold text-white mb-2">Scattered Context</h4>
              <p className="text-sm text-[#a8abb3]">Siloed data across regions makes tracing a single request across services impossible.</p>
            </div>
            <div className="p-6 bg-[#0a0e14] border-l-2 border-red-500 rounded-r-lg">
              <h4 className="font-bold text-white mb-2">The "Silent" Error</h4>
              <p className="text-sm text-[#a8abb3]">Critical exceptions lost in noise because your current system can't handle high throughput.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* How It Works Section */}
    <section className="py-24 max-w-7xl mx-auto px-8 bg-[#0a0e14]">
      <div className="text-center mb-20">
        <h2 className="font-headline text-4xl font-bold mb-4 text-white">Architected for Speed</h2>
        <div className="w-24 h-1 bg-[#00F0FF] mx-auto" />
      </div>
      <div className="grid md:grid-cols-3 gap-12 relative">
        {/* Connective Line (Desktop Only) */}
        <div className="hidden md:block absolute top-1/4 left-[10%] right-[10%] h-px bg-white/10 -z-10" />
        <div className="text-center group">
          <div className="w-16 h-16 rounded-lg bg-[#11161d] border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:border-[#00F0FF]/50 transition-colors">
            <LuImport className="text-[#00F0FF] text-3xl" />
          </div>
          <h3 className="font-headline text-xl font-bold mb-3 text-white">01. Integrate</h3>
          <p className="text-[#a8abb3] text-sm">Drop our agent or use our Redis-compatible endpoint. Support for all major stacks.</p>
        </div>
        <div className="text-center group">
          <div className="w-16 h-16 rounded-lg bg-[#11161d] border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:border-[#00F0FF]/50 transition-colors">
            <LuShare2 className="text-[#00F0FF] text-3xl" />
          </div>
          <h3 className="font-headline text-xl font-bold mb-3 text-white">02. Stream</h3>
          <p className="text-[#a8abb3] text-sm">Logs are processed, indexed, and visible in <span className="font-mono text-[#00eefc]">~50ms</span> across all instances.</p>
        </div>
        <div className="text-center group">
          <div className="w-16 h-16 rounded-lg bg-[#11161d] border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:border-[#00F0FF]/50 transition-colors">
            <LuBellRing className="text-[#00F0FF] text-3xl" />
          </div>
          <h3 className="font-headline text-xl font-bold mb-3 text-white">03. Alert</h3>
          <p className="text-[#a8abb3] text-sm">Python-powered triggers identify anomalies before they reach your end-users.</p>
        </div>
      </div>
    </section>
    {/* Features Bento Grid */}
    <section className="bg-[#11161d] py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <label className="text-xs font-mono text-[#8ff5ff] uppercase tracking-[0.2em] mb-2 block">Technical Specs</label>
          <h2 className="font-headline text-4xl font-bold text-white">Hardened infrastructure.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#1a2027] p-8 rounded-lg border border-white/5 hover:border-[#00F0FF]/30 transition-all">
            <div className="mb-6"><LuDatabase className="text-[#00F0FF]" size={28} /></div>
            <h4 className="font-headline text-lg font-bold mb-3 text-white">Redis Ingestion</h4>
            <p className="text-[#a8abb3] text-sm leading-relaxed">High-throughput ingestion layer capable of millions of events per second with zero backpressure.</p>
          </div>
          {/* Feature 2 */}
          <div className="bg-[#1a2027] p-8 rounded-lg border border-white/5 hover:border-[#00F0FF]/30 transition-all">
            <div className="mb-6"><LuArrowLeftRight className="text-[#00F0FF]" size={28} /></div>
            <h4 className="font-headline text-lg font-bold mb-3 text-white">WebSocket Tunnel</h4>
            <p className="text-[#a8abb3] text-sm leading-relaxed">Persistent binary streams provide low-latency log updates directly to your browser or CLI tool.</p>
          </div>
          {/* Feature 3 */}
          <div className="bg-[#1a2027] p-8 rounded-lg border border-white/5 hover:border-[#00F0FF]/30 transition-all">
            <div className="mb-6"><LuCode className="text-[#00F0FF]" size={28} /></div>
            <h4 className="font-headline text-lg font-bold mb-3 text-white">Python Alerts</h4>
            <p className="text-[#a8abb3] text-sm leading-relaxed">Programmable alerting logic using standard Python syntax for complex pattern matching.</p>
          </div>
          {/* Feature 4 */}
          <div className="bg-[#1a2027] p-8 rounded-lg border border-white/5 hover:border-[#00F0FF]/30 transition-all">
            <div className="mb-6"><LuShieldCheck className="text-[#00F0FF]" size={28} /></div>
            <h4 className="font-headline text-lg font-bold mb-3 text-white">Tenant Isolation</h4>
            <p className="text-[#a8abb3] text-sm leading-relaxed">Strict cryptographic separation for multi-tenant environments and sensitive data logging.</p>
          </div>
        </div>
      </div>
    </section>
    {/* Pricing Section */}
    <section className="py-24 max-w-7xl mx-auto px-8 bg-[#11161d]">
      <div className="text-center mb-16">
        <h2 className="font-headline text-4xl font-bold mb-4 text-white">Scalable Pricing</h2>
        <p className="text-[#a8abb3]">Choose the plan that fits your log volume.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Hobby */}
        <div className="p-8 rounded-lg border border-white/10 bg-[#0a0e14] flex flex-col">
          <h4 className="font-headline text-xl font-bold mb-2 text-white">Free</h4>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">$0</span>
            <span className="text-[#a8abb3] text-sm"> / month</span>
          </div>
          <ul className="space-y-4 mb-8 text-sm text-[#a8abb3] grow">
            <li className="flex items-center gap-2"><LuCheck className="text-[#00F0FF] text-lg" /> 50,000 logs / month</li>
            <li className="flex items-center gap-2"><LuCheck className="text-[#00F0FF] text-lg" /> 2 seats · 3-day retention</li>
            <li className="flex items-center gap-2"><LuCheck className="text-[#00F0FF] text-lg" /> 1 API key</li>
          </ul>
          <Link to="/pricing" className="w-full py-3 border border-white/20 text-white rounded font-bold hover:bg-white/5 transition-colors text-center">See pricing</Link>
        </div>
        {/* Pro */}
        <div className="p-8 rounded-lg border-2 border-[#8ff5ff] bg-[#0a0e14] flex flex-col relative transform lg:scale-105 shadow-2xl shadow-[#8ff5ff]/10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#8ff5ff] text-[#005359] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full">Recommended</div>
          <h4 className="font-headline text-xl font-bold mb-2 text-white">Pro</h4>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">$49</span>
            <span className="text-[#a8abb3] text-sm"> / month</span>
          </div>
          <ul className="space-y-4 mb-8 text-sm text-white grow font-medium">
            <li className="flex items-center gap-2"><LuCheck className="text-[#8ff5ff] text-lg" /> 2,000,000 logs / month</li>
            <li className="flex items-center gap-2"><LuCheck className="text-[#8ff5ff] text-lg" /> 12 seats, then $10 each</li>
            <li className="flex items-center gap-2"><LuCheck className="text-[#8ff5ff] text-lg" /> 30-day retention and alerts</li>
          </ul>
          <Link to="/pricing" className="w-full py-3 bg-linear-to-r from-[#8ff5ff] to-[#00eefc] text-[#005359] rounded font-bold hover:brightness-110 transition-colors cta-glow text-center">See pricing</Link>
        </div>
        {/* Enterprise */}
        <div className="p-8 rounded-lg border border-white/10 bg-[#0a0e14] flex flex-col">
          <h4 className="font-headline text-xl font-bold mb-2 text-white">Enterprise</h4>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">$299</span>
            <span className="text-[#a8abb3] text-sm"> / month</span>
          </div>
          <ul className="space-y-4 mb-8 text-sm text-[#a8abb3] grow">
            <li className="flex items-center gap-2"><LuCheck className="text-[#00F0FF] text-lg" /> Unlimited logs and seats</li>
            <li className="flex items-center gap-2"><LuCheck className="text-[#00F0FF] text-lg" /> 365-day retention</li>
            <li className="flex items-center gap-2"><LuCheck className="text-[#00F0FF] text-lg" /> Unlimited API keys</li>
          </ul>
          <Link to="/pricing" className="w-full py-3 border border-white/20 text-white rounded font-bold hover:bg-white/5 transition-colors text-center">See pricing</Link>
        </div>
      </div>
    </section>
    {/* Final CTA */}
    <section className="py-24 px-8 overflow-hidden relative bg-[#11161d]">
      <div className="max-w-4xl mx-auto border border-white/5 bg-[#1a2027] rounded-2xl p-12 lg:p-20 text-center relative shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <LuTerminal className="text-9xl text-white" />
        </div>
        <h2 className="font-headline text-4xl lg:text-5xl font-bold mb-6 text-white">Ready for precision logging?</h2>
        <p className="text-[#a8abb3] text-lg mb-10 max-w-xl mx-auto">
          Join over 4,000 developers who have ditched manual log files for a real-time, technical-first dashboard.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-linear-to-r from-[#8ff5ff] to-[#00eefc] text-[#005359] px-10 py-5 rounded-lg font-bold text-lg hover:scale-105 transition-transform cta-glow">
            Deploy LogLogic Now
          </button>
          <button className="bg-[#202832] text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-[#2a3441] transition-all border border-white/5">
            Talk to an Architect
          </button>
        </div>
        <p className="mt-8 text-xs font-mono text-[#a8abb3] uppercase tracking-widest">Free tier available • No Credit Card Required</p>
      </div>
    </section>
  </main>
  {/* Footer */}
  
</div>

  )
}

export default LandingPage
