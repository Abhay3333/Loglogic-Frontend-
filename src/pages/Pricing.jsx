import React from 'react'

const PricingPage = () => {
  return (
    <div>
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: "\n        body { font-family: 'Inter', sans-serif; background-color: #0a0e14; color: #f1f3fc; }\n        .font-headline { font-family: 'Space Grotesk', sans-serif; }\n        .font-mono { font-family: 'JetBrains Mono', monospace; }\n        .material-symbols-outlined {\n            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;\n        }\n        .gradient-text { background: linear-gradient(to right, #8ff5ff, #00eefc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n        .cta-glow { box-shadow: 0 0 15px rgba(143, 245, 255, 0.2); }\n        .cyber-grid {\n            background-image: linear-gradient(to right, rgba(68, 72, 79, 0.1) 1px, transparent 1px),\n                              linear-gradient(to bottom, rgba(68, 72, 79, 0.1) 1px, transparent 1px);\n            background-size: 40px 40px;\n        }\n    " }} />
      
      <main className="pt-32 pb-24 cyber-grid">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-6 mb-20">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6 gradient-text">
            Predictable Pricing for Unpredictable Logs
          </h1>
          <p className="text-[#a8abb3] text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto">
            No seat-based penalties. No ingest surprises. Just high-performance observability scaled to your architecture.
          </p>
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className="font-mono text-sm uppercase tracking-widest text-[#a8abb3]">Monthly</span>
            <button className="w-14 h-7 rounded-full bg-[#1a2027] border border-white/10 p-1 flex items-center justify-end relative">
              <div className="w-5 h-5 rounded-full bg-[#8ff5ff] shadow-[0_0_10px_rgba(69,254,201,0.5)]" />
            </button>
            <span className="font-mono text-sm uppercase tracking-widest text-[#00F0FF] flex items-center gap-2">
              Annual <span className="bg-[#8ff5ff]/10 text-[#8ff5ff] px-2 py-0.5 rounded text-[10px] border border-[#8ff5ff]/20">SAVE 20%</span>
            </span>
          </div>
        </section>
        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {/* Basic Plan */}
          <div className="bg-[#0a0e14] border border-white/10 p-8 rounded-lg flex flex-col hover:bg-[#11161d] transition-colors group">
            <div className="mb-8">
              <h3 className="font-headline text-xl font-bold mb-1 text-white">Developer</h3>
              <p className="text-[#a8abb3] text-sm font-mono uppercase tracking-tighter">Small Scale Side-Projects</p>
            </div>
            <div className="mb-8">
              <span className="font-headline text-5xl font-bold text-white">$0</span>
              <span className="text-[#a8abb3] font-mono">/mo</span>
            </div>
            <ul className="flex flex-col gap-4 mb-12 flex-grow">
              <li className="flex items-start gap-3 text-sm text-[#f1f3fc]">
                <span className="material-symbols-outlined text-[#00F0FF] text-lg" data-icon="check_circle">check_circle</span>
                <span>5GB Daily Ingestion</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#f1f3fc]">
                <span className="material-symbols-outlined text-[#00F0FF] text-lg" data-icon="check_circle">check_circle</span>
                <span>3 Day Retention</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#f1f3fc]">
                <span className="material-symbols-outlined text-[#00F0FF] text-lg" data-icon="check_circle">check_circle</span>
                <span>Single Project Workspace</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#a8abb3]">
                <span className="material-symbols-outlined opacity-30 text-lg" data-icon="cancel">cancel</span>
                <span>No API Access</span>
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg border border-white/20 text-white font-headline font-bold hover:bg-white/5 transition-all">
              Start Free
            </button>
          </div>
          {/* Pro Plan (High-Conversion Focus) */}
          <div className="relative bg-[#0a0e14] border-2 border-[#8ff5ff] p-8 rounded-lg flex flex-col shadow-2xl shadow-[#8ff5ff]/10 scale-105 z-10 overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#8ff5ff] text-[#005359] px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl">RECOMMENDED</div>
            <div className="mb-8">
              <h3 className="font-headline text-xl font-bold mb-1 text-white">Pro Team</h3>
              <p className="text-[#a8abb3] text-sm font-mono uppercase tracking-tighter">Production Scale &amp; Monitoring</p>
            </div>
            <div className="mb-8">
              <span className="font-headline text-5xl font-bold text-white">$99</span>
              <span className="text-[#a8abb3] font-mono">/mo</span>
            </div>
            <ul className="flex flex-col gap-4 mb-12 flex-grow">
              <li className="flex items-start gap-3 text-sm text-white font-semibold">
                <span className="material-symbols-outlined text-[#8ff5ff] text-lg" data-icon="check_circle" style={{fontVariationSettings: '"FILL" 1'}}>check_circle</span>
                <span>Unlimited Monthly Ingestion</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white font-medium">
                <span className="material-symbols-outlined text-[#8ff5ff] text-lg" data-icon="check_circle" style={{fontVariationSettings: '"FILL" 1'}}>check_circle</span>
                <span>30 Day Log Retention</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white font-medium">
                <span className="material-symbols-outlined text-[#8ff5ff] text-lg" data-icon="check_circle" style={{fontVariationSettings: '"FILL" 1'}}>check_circle</span>
                <span>Multi-Region High Availability</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white font-medium">
                <span className="material-symbols-outlined text-[#8ff5ff] text-lg" data-icon="check_circle" style={{fontVariationSettings: '"FILL" 1'}}>check_circle</span>
                <span>Real-time Alerting (Webhooks)</span>
              </li>
            </ul>
            <button className="w-full py-4 rounded-lg bg-gradient-to-r from-[#8ff5ff] to-[#00eefc] text-[#005359] font-headline font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-[0.98] cta-glow">
              Scale Now
            </button>
          </div>
          {/* Enterprise Plan */}
          <div className="bg-[#0a0e14] border border-white/10 p-8 rounded-lg flex flex-col hover:bg-[#11161d] transition-colors group">
            <div className="mb-8">
              <h3 className="font-headline text-xl font-bold mb-1 text-white">Enterprise</h3>
              <p className="text-[#a8abb3] text-sm font-mono uppercase tracking-tighter">Security &amp; Global Compliance</p>
            </div>
            <div className="mb-8">
              <span className="font-headline text-5xl font-bold text-white">Custom</span>
            </div>
            <ul className="flex flex-col gap-4 mb-12 flex-grow">
              <li className="flex items-start gap-3 text-sm text-[#f1f3fc]">
                <span className="material-symbols-outlined text-[#00F0FF] text-lg" data-icon="verified">verified</span>
                <span>SOC2 &amp; HIPAA Compliance</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#f1f3fc]">
                <span className="material-symbols-outlined text-[#00F0FF] text-lg" data-icon="verified">verified</span>
                <span>SSO / SAML Authentication</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#f1f3fc]">
                <span className="material-symbols-outlined text-[#00F0FF] text-lg" data-icon="verified">verified</span>
                <span>Dedicated Solution Engineer</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#f1f3fc]">
                <span className="material-symbols-outlined text-[#00F0FF] text-lg" data-icon="verified">verified</span>
                <span>Unlimited Retention Tiers</span>
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg border border-white/20 text-white font-headline font-bold hover:bg-white/5 transition-all">
              Contact Sales
            </button>
          </div>
        </section>
        {/* Comparison Matrix */}
        <section className="max-w-5xl mx-auto px-6 mb-32">
          <h2 className="font-headline text-3xl font-bold mb-12 text-center text-white">Technical Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-white/10">
                  <th className="py-4 px-6 text-[#a8abb3] font-medium">Feature</th>
                  <th className="py-4 px-6 text-[#00F0FF]">Developer</th>
                  <th className="py-4 px-6 text-[#00F0FF]">Pro Team</th>
                  <th className="py-4 px-6 text-[#00F0FF]">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-[#1a2027] transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Latency SLA</td>
                  <td className="py-4 px-6 text-[#f1f3fc]">Best Effort</td>
                  <td className="py-4 px-6 text-white">&lt; 50ms</td>
                  <td className="py-4 px-6 text-white">&lt; 10ms (Contracted)</td>
                </tr>
                <tr className="hover:bg-[#1a2027] transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Max Ingest Rate</td>
                  <td className="py-4 px-6 text-[#f1f3fc]">100 req/s</td>
                  <td className="py-4 px-6 text-white">50,000 req/s</td>
                  <td className="py-4 px-6 text-white">Uncapped</td>
                </tr>
                <tr className="hover:bg-[#1a2027] transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Cold Storage (S3/GCS)</td>
                  <td className="py-4 px-6 text-red-400">No</td>
                  <td className="py-4 px-6 text-white">Included</td>
                  <td className="py-4 px-6 text-white">Automated Tiering</td>
                </tr>
                <tr className="hover:bg-[#1a2027] transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Query Concurrency</td>
                  <td className="py-4 px-6 text-[#f1f3fc]">2</td>
                  <td className="py-4 px-6 text-white">25</td>
                  <td className="py-4 px-6 text-white">Custom</td>
                </tr>
                <tr className="hover:bg-[#1a2027] transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">API Integrations</td>
                  <td className="py-4 px-6 text-red-400">Limited</td>
                  <td className="py-4 px-6 text-white">All Public SDKs</td>
                  <td className="py-4 px-6 text-white">Private VPC Peering</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-6 mb-32">
          <h2 className="font-headline text-3xl font-bold mb-12 text-center text-white">Engineered for Transparency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-headline font-bold text-[#00F0FF]">How do you count ingestion?</h4>
              <p className="text-[#a8abb3] text-sm leading-relaxed">We calculate the raw payload size of your JSON logs. We don't charge for the metadata we add for indexing. What you send is what you pay for.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-headline font-bold text-[#00F0FF]">Can I change plans mid-cycle?</h4>
              <p className="text-[#a8abb3] text-sm leading-relaxed">Yes. Upgrades are immediate and pro-rated. Downgrades happen at the end of your billing cycle to ensure data integrity.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-headline font-bold text-[#00F0FF]">What happens if I spike?</h4>
              <p className="text-[#a8abb3] text-sm leading-relaxed">We won't drop your logs. Our "Pro" plan includes an elastic buffer. We only talk about overages if you exceed your average daily ingest for 3 consecutive days.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-headline font-bold text-[#00F0FF]">Is there a setup fee?</h4>
              <p className="text-[#a8abb3] text-sm leading-relaxed">No. LogLogic is self-serve by design. You can be ingesting production traffic in under 4 minutes with our CLI.</p>
            </div>
          </div>
        </section>
        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="bg-[#11161d] p-12 rounded-lg border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#00F0FF]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-headline text-3xl font-bold mb-4 text-white">Start your trial of LogLogic Pro.</h2>
              <p className="text-[#a8abb3] max-w-md">Get full access to all features for 14 days. No credit card required. Deploy in seconds.</p>
            </div>
            <div className="relative z-10 flex gap-4">
              <button className="bg-[#00eefc] text-[#005359] px-8 py-4 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all font-headline text-sm">Get Started</button>
              <button className="border border-white/20 text-white px-8 py-4 rounded-lg font-bold hover:bg-[#1a2027] transition-all font-headline text-sm">Read the Docs</button>
            </div>
          </div>
        </section>
      </main>
      
    </div>
  )
}

export default PricingPage