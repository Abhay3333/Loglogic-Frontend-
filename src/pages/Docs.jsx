import React from 'react'

const curlExample = `curl -X POST https://api.loglogic.io/v1/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: YOUR_LOGLOGIC_API_KEY" \\
  -d '{
    "level": "INFO",
    "service": "billing-service",
    "message": "Invoice generated successfully",
    "meta": {
      "requestId": "req_01J9XZ...",
      "userId": "usr_4831",
      "latencyMs": 42
    }
  }'`

const nodeExample = `const apiKey = process.env.LOGLOGIC_API_KEY;

const payload = {
  level: 'INFO',
  service: 'billing-service',
  message: 'Invoice generated successfully',
  meta: {
    requestId: 'req_01J9XZ...',
    userId: 'usr_4831',
    latencyMs: 42,
  },
};

const response = await fetch('https://api.loglogic.io/v1/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey,
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  console.error('LogLogic ingest failed:', response.status, await response.text());
}`

const pythonExample = `import os
import requests

api_key = os.environ.get("LOGLOGIC_API_KEY")

payload = {
    "level": "INFO",
    "service": "billing-service",
    "message": "Invoice generated successfully",
    "meta": {
        "requestId": "req_01J9XZ...",
        "userId": "usr_4831",
        "latencyMs": 42
    }
}

response = requests.post(
    "https://api.loglogic.io/v1/ingest",
    headers={
        "Content-Type": "application/json",
        "X-API-KEY": api_key
    },
    json=payload,
    timeout=5,
)

if response.status_code != 202:
    print("LogLogic ingest failed:", response.status_code, response.text)`

const DocsPage = () => {
  return (
    <div>
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: "\n        body { font-family: 'Inter', sans-serif; background-color: #0a0e14; color: #f1f3fc; }\n        .font-headline { font-family: 'Space Grotesk', sans-serif; }\n        .font-mono { font-family: 'JetBrains Mono', monospace; }\n      " }} />

      <main className="pt-28 pb-24 px-6 bg-[#0a0e14]">
        <section className="max-w-6xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8ff5ff] font-semibold mb-4">Developer Docs</p>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">LogLogic Ingestion API</h1>
          <p className="text-[#a8abb3] max-w-3xl leading-relaxed text-base md:text-lg">
            High-performance, centralized logging for modern services. This page gets you from API key to first live log event in under a minute.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#00eefc]/30 bg-[#00eefc]/10 px-4 py-1.5 font-mono text-xs text-[#8ff5ff] uppercase tracking-widest">
            Endpoint: POST /v1/ingest
          </div>
        </section>

        <section className="max-w-6xl mx-auto space-y-8">
          <article className="rounded-2xl border border-white/10 bg-[#11161d] p-6 md:p-8">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-6">1. Quick Start Guide (The "Time to Value" Section)</h2>
            <ol className="space-y-6 text-[#d3d6dd] leading-relaxed">
              <li>
                <p className="font-semibold text-white mb-2">Step 1: Get your API Key.</p>
                <p>
                  In your LogLogic dashboard, open <span className="font-mono text-[#8ff5ff]">Settings -&gt; API Keys</span> and create a key for your environment
                  (for example: development, staging, production).
                </p>
              </li>
              <li>
                <p className="font-semibold text-white mb-2">Step 2: Make your first request.</p>
                <p>
                  Send a JSON log payload to <span className="font-mono text-[#8ff5ff]">https://api.loglogic.io/v1/ingest</span> using the
                  <span className="font-mono text-[#8ff5ff]"> X-API-KEY</span> header.
                </p>
              </li>
              <li>
                <p className="font-semibold text-white mb-2">Step 3: View it on the Live-Tail dashboard.</p>
                <p>
                  Open <span className="font-mono text-[#8ff5ff]">Live-Tail</span> in your dashboard and filter by your
                  <span className="font-mono text-[#8ff5ff]"> service</span> field to verify ingestion in real time.
                </p>
              </li>
            </ol>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#11161d] p-6 md:p-8">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-4">2. Authentication</h2>
            <p className="text-[#d3d6dd] leading-relaxed mb-4">
              Authenticate every ingestion request with your API key in the <span className="font-mono text-[#8ff5ff]">X-API-KEY</span> header.
            </p>
            <pre className="rounded-xl bg-[#0a0e14] border border-white/10 p-4 overflow-x-auto text-sm font-mono text-[#c6f8ff]">
              <code>{`X-API-KEY: YOUR_LOGLOGIC_API_KEY`}</code>
            </pre>
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200 leading-relaxed">
              Security warning: never commit API keys to public repositories. Store them in environment variables or your secret manager.
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#11161d] p-6 md:p-8">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-4">3. API Reference: The Ingestion Endpoint</h2>
            <p className="text-[#d3d6dd] leading-relaxed mb-4">
              <span className="font-mono text-[#8ff5ff]">POST https://api.loglogic.io/v1/ingest</span>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4 text-left text-[#8ff5ff] font-semibold">Field</th>
                    <th className="py-3 pr-4 text-left text-[#8ff5ff] font-semibold">Type</th>
                    <th className="py-3 pr-4 text-left text-[#8ff5ff] font-semibold">Required</th>
                    <th className="py-3 text-left text-[#8ff5ff] font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-[#d3d6dd]">
                  <tr>
                    <td className="py-3 pr-4 font-mono">level</td>
                    <td className="py-3 pr-4">String</td>
                    <td className="py-3 pr-4">Yes</td>
                    <td className="py-3">Must be one of: <span className="font-mono">INFO</span>, <span className="font-mono">WARN</span>, <span className="font-mono">ERROR</span>, <span className="font-mono">DEBUG</span>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono">service</td>
                    <td className="py-3 pr-4">String</td>
                    <td className="py-3 pr-4">Yes</td>
                    <td className="py-3">The microservice name sending the log (for example: <span className="font-mono">auth-service</span>).</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono">message</td>
                    <td className="py-3 pr-4">String</td>
                    <td className="py-3 pr-4">Yes</td>
                    <td className="py-3">The core log message.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono">meta</td>
                    <td className="py-3 pr-4">Object</td>
                    <td className="py-3 pr-4">No</td>
                    <td className="py-3">Flexible JSON object for custom fields such as user IDs, latency, region, and stack traces.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#11161d] p-6 md:p-8">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-6">4. Code Examples (Crucial)</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-2">Raw cURL</h3>
                <pre className="rounded-xl bg-[#0a0e14] border border-white/10 p-4 overflow-x-auto text-sm font-mono text-[#c6f8ff]">
                  <code>{curlExample}</code>
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Node.js (using fetch)</h3>
                <pre className="rounded-xl bg-[#0a0e14] border border-white/10 p-4 overflow-x-auto text-sm font-mono text-[#c6f8ff]">
                  <code>{nodeExample}</code>
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Python (using requests library)</h3>
                <pre className="rounded-xl bg-[#0a0e14] border border-white/10 p-4 overflow-x-auto text-sm font-mono text-[#c6f8ff]">
                  <code>{pythonExample}</code>
                </pre>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#11161d] p-6 md:p-8">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-4">5. Response Codes &amp; Error Handling</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4 text-left text-[#8ff5ff] font-semibold">Status</th>
                    <th className="py-3 text-left text-[#8ff5ff] font-semibold">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-[#d3d6dd]">
                  <tr>
                    <td className="py-3 pr-4 font-mono">202 Accepted</td>
                    <td className="py-3">Log successfully queued for processing.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono">401 Unauthorized</td>
                    <td className="py-3">Missing API key or invalid API key.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono">429 Too Many Requests</td>
                    <td className="py-3">Rate limit exceeded for your project or API key.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono">413 Payload Too Large</td>
                    <td className="py-3">Request body exceeds the 1MB JSON payload limit.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#11161d] p-6 md:p-8">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-4">6. Best Practices</h2>
            <ul className="list-disc pl-6 text-[#d3d6dd] space-y-3 leading-relaxed">
              <li>Send logs asynchronously so ingestion does not block your main app thread or request lifecycle.</li>
              <li>Keep your <span className="font-mono text-[#8ff5ff]">meta</span> object structure consistent across services for easier filtering, aggregation, and alert rules.</li>
              <li>Use stable field names (for example: <span className="font-mono">requestId</span>, <span className="font-mono">userId</span>, <span className="font-mono">latencyMs</span>) to improve query performance and team-wide readability.</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  )
}

export default DocsPage
