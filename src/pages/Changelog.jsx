import React from 'react'

const ChangelogPage = () => {
  return (
    <div>
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: "\n        body { font-family: 'Inter', sans-serif; background-color: #0a0e14; color: #f1f3fc; }\n        .font-headline { font-family: 'Space Grotesk', sans-serif; }\n        .font-mono { font-family: 'JetBrains Mono', monospace; }\n      " }} />

      <main className="pt-28 pb-24 px-6 bg-[#0a0e14]">
        <section className="max-w-6xl mx-auto mb-12">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">What&apos;s New</h1>
          <p className="text-[#a8abb3] text-base md:text-lg max-w-3xl leading-relaxed">
            We ship fast, document every meaningful change, and keep developers unblocked with transparent release notes.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <a className="inline-flex items-center rounded-full border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-4 py-2 text-[#8ff5ff] hover:bg-[#00eefc]/20 transition-colors" href="#">
              Subscribe via RSS
            </a>
            <a className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-[#d3d6dd] hover:text-white hover:border-white/40 transition-colors" href="#">
              Follow us on Twitter
            </a>
          </div>
        </section>

        <section className="max-w-6xl mx-auto rounded-2xl border border-white/10 bg-[#11161d] p-6 md:p-8 mb-8">
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-5">2. Changelog Formatting Rules</h2>
          <ul className="list-disc pl-6 space-y-3 text-[#d3d6dd] leading-relaxed">
            <li>Every entry must include a Date (example: March 30, 2026).</li>
            <li>Every entry must include a clear Title.</li>
            <li>Every bullet point must start with one strict category tag: <span className="text-emerald-300">[Feature]</span>, <span className="text-cyan-300">[Improvement]</span>, <span className="text-amber-300">[Performance]</span>, or <span className="text-red-300">[Fix]</span>.</li>
          </ul>
        </section>

        <section className="max-w-6xl mx-auto rounded-2xl border border-white/10 bg-[#11161d] p-6 md:p-8 mb-8">
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-8">3. Release Entries</h2>

          <div className="relative pl-6 border-l border-white/10 space-y-10">
            <article className="relative">
              <span className="absolute -left-7.5 top-1 h-3 w-3 rounded-full bg-[#8ff5ff] shadow-[0_0_12px_rgba(143,245,255,0.5)]" />
              <p className="font-mono text-xs uppercase tracking-widest text-[#8ff5ff] mb-2">April 18, 2026 (Today)</p>
              <h3 className="font-headline text-2xl font-bold text-white mb-3">Automated Alerts and Slack Integrations are live.</h3>
              <p className="text-[#d3d6dd] leading-relaxed mb-4">
                We launched a Python-based background worker that continuously polls indexed logs, evaluates alert conditions, and triggers outbound webhooks for operational tooling such as Slack.
              </p>
              <ul className="space-y-2 text-[#d3d6dd] leading-relaxed">
                <li><span className="text-emerald-300 font-semibold">[Feature]</span> Added a Python alerting worker with cron-safe polling and deduplicated alert dispatch.</li>
                <li><span className="text-emerald-300 font-semibold">[Feature]</span> Added Slack webhook integration with channel-level routing and configurable severity mapping.</li>
                <li><span className="text-emerald-300 font-semibold">[Feature]</span> Added alert rule support for threshold windows and message templates backed by MongoDB rule metadata.</li>
              </ul>
            </article>

            <article className="relative">
              <span className="absolute -left-7.5 top-1 h-3 w-3 rounded-full bg-[#8ff5ff] shadow-[0_0_12px_rgba(143,245,255,0.5)]" />
              <p className="font-mono text-xs uppercase tracking-widest text-[#8ff5ff] mb-2">April 04, 2026 (Two weeks ago)</p>
              <h3 className="font-headline text-2xl font-bold text-white mb-3">Sub-50ms Ingestion with Redis BullMQ.</h3>
              <p className="text-[#d3d6dd] leading-relaxed mb-4">
                We migrated the Node.js ingestion path to Redis-backed BullMQ queues so traffic spikes no longer cause direct MongoDB contention or lockups during burst workloads.
              </p>
              <ul className="space-y-2 text-[#d3d6dd] leading-relaxed">
                <li><span className="text-amber-300 font-semibold">[Performance]</span> Reduced p95 ingest latency from 180ms to 47ms by introducing queued writes and batched MongoDB inserts.</li>
                <li><span className="text-amber-300 font-semibold">[Performance]</span> Improved backpressure handling with worker concurrency controls to maintain stable throughput under spike traffic.</li>
                <li><span className="text-red-300 font-semibold">[Fix]</span> Fixed stale API key cache invalidation in the auth middleware that could briefly reject newly rotated keys.</li>
              </ul>
            </article>

            <article className="relative">
              <span className="absolute -left-7.5 top-1 h-3 w-3 rounded-full bg-[#8ff5ff] shadow-[0_0_12px_rgba(143,245,255,0.5)]" />
              <p className="font-mono text-xs uppercase tracking-widest text-[#8ff5ff] mb-2">March 18, 2026 (One month ago)</p>
              <h3 className="font-headline text-2xl font-bold text-white mb-3">Real-time logging with WebSockets.</h3>
              <p className="text-[#d3d6dd] leading-relaxed mb-4">
                We released the first beta of Live-Tail in the React dashboard, streaming log events to connected clients over persistent Socket.io channels.
              </p>
              <ul className="space-y-2 text-[#d3d6dd] leading-relaxed">
                <li><span className="text-emerald-300 font-semibold">[Feature]</span> Added Socket.io Live-Tail channels for low-latency event streaming from the ingest pipeline to dashboard clients.</li>
                <li><span className="text-cyan-300 font-semibold">[Improvement]</span> Added server-side filtering by <span className="font-mono">org_id</span> to isolate tenant traffic and reduce noisy cross-project streams.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="max-w-6xl mx-auto rounded-2xl border border-white/10 bg-[#11161d] p-6 md:p-8">
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-5">4. Design &amp; UX Notes for the Developer</h2>
          <ul className="list-disc pl-6 space-y-3 text-[#d3d6dd] leading-relaxed">
            <li>Render changelog text from Markdown files so product and engineering can publish updates without frontend code edits.</li>
            <li>Use a vertical timeline layout with clear date anchors and card-like release blocks for fast chronological scanning.</li>
            <li>Color-code category tags consistently: <span className="text-emerald-300">[Feature] green</span>, <span className="text-cyan-300">[Improvement] cyan</span>, <span className="text-amber-300">[Performance] amber</span>, and <span className="text-red-300">[Fix] red</span>.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default ChangelogPage
