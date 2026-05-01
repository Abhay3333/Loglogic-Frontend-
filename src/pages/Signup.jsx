import { Link, useNavigate } from "react-router-dom"
import { FaCheck, FaGithub, FaGoogle, FaTerminal } from "react-icons/fa"
const Signup = () => {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    localStorage.setItem('loglogic_auth', 'true')
    navigate('/app/dashboard')
  }

  return (
    <div>
  <meta charSet="utf-8" />
  <meta content="width=device-width, initial-scale=1.0" name="viewport" />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style dangerouslySetInnerHTML={{__html: "\n        .terminal-glow {\n            box-shadow: 0 0 20px rgba(0, 238, 252, 0.1);\n        }\n        .custom-scrollbar::-webkit-scrollbar {\n            width: 4px;\n        }\n        .custom-scrollbar::-webkit-scrollbar-track {\n            background: #0f141a;\n        }\n        .custom-scrollbar::-webkit-scrollbar-thumb {\n            background: #44484f;\n            border-radius: 2px;\n        }\n    " }} />
  <main className="min-h-screen flex flex-col md:flex-row">
    {/* Left Side: Authentication Flow */}
    <section className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-surface">
      {/* Brand Anchor */}
      <div className="mb-12">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-primary">
            <FaTerminal className="text-on-primary-container text-xl" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-primary-fixed">LogLogic</span>
        </Link>
      </div>
      <div className="max-w-md w-full">
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-8">Start logging in seconds.</h1>
        {/* OAuth Actions */}
        <div className="space-y-4 mb-8">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm font-medium hover:bg-surface-bright transition-all group">
            <FaGithub className="w-5 h-5" />
            <span>Continue with GitHub</span>
          </button>
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-container-high border border-outline-variant/30 rounded-lg text-sm font-medium hover:bg-surface-bright transition-all group">
            <FaGoogle className="w-5 h-5 text-[#EA4335]" />
            <span>Continue with Google</span>
          </button>
        </div>
        {/* Divider */}
        <div className="relative flex items-center mb-8">
          <div className="grow border-t border-outline-variant/20" />
          <span className="shrink mx-4 text-xs font-label uppercase tracking-widest text-on-surface-variant">or continue with email</span>
          <div className="grow border-t border-outline-variant/20" />
        </div>
        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant" htmlFor="email">Email Address</label>
            <input className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant/30 text-on-surface focus:ring-0 focus:border-primary transition-all font-mono py-3 pl-2.5 rounded" id="email" placeholder="name@company.com" type="email" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant" htmlFor="password">Password</label>
            <input className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant/30 text-on-surface focus:ring-0 focus:border-primary transition-all font-mono py-3 pl-2.5 rounded" id="password" placeholder="••••••••" type="password" />
          </div>
          <button className="w-full bg-linear-to-r from-[#71d9e4] to-[#1adcf2] text-[#0a4e63] font-headline font-bold py-4 rounded-md shadow-[0_0_15px_rgba(0,238,252,0.2)] hover:from-[#82e3ec] hover:to-[#33e4f7] hover:shadow-[0_0_25px_rgba(0,238,252,0.4)] transition-all active:scale-[0.98]" type="submit">
            Create Account
          </button>
        </form>
        <footer className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Already have an account? <Link className="text-primary hover:underline font-medium" to="/login">Log in</Link>
          </p>
          <p className="mt-12 text-[10px] leading-relaxed text-outline uppercase tracking-tight max-w-xs mx-auto">
            By clicking continue, you agree to our <Link className="underline hover:text-on-surface" to="/terms">Terms of Service</Link> and <Link className="underline hover:text-on-surface" to="/privacy">Privacy Policy</Link>.
          </p>
        </footer>
      </div>
    </section>
    {/* Right Side: Marketing/Visual Shell */}
    <section className="hidden md:flex w-1/2 bg-surface-container-low flex-col justify-center items-center relative overflow-hidden px-16">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#44484f 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
      <div className="relative z-10 w-full max-w-lg">
        {/* Terminal Graphic */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl terminal-glow mb-12 overflow-hidden flex flex-col aspect-video shadow-2xl">
          <div className="bg-surface-variant/50 px-4 py-2 border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-error-dim/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-secondary-dim/40" />
            </div>
            <div className="text-[10px] font-mono text-outline">ingest_node_01.sh</div>
          </div>
          <div className="p-6 font-mono text-[11px] leading-relaxed custom-scrollbar overflow-y-auto h-full space-y-1">
            <div className="text-secondary-dim flex gap-2">
              <span className="text-outline">14:02:11</span>
              <span className="font-bold">[SUCCESS]</span>
              <span>Connection established: Redis:6379</span>
            </div>
            <div className="text-on-surface-variant flex gap-2">
              <span className="text-outline">14:02:12</span>
              <span className="font-bold">[INFO]</span>
              <span>Ingesting 1,429 logs/sec...</span>
            </div>
            <div className="text-primary flex gap-2">
              <span className="text-outline">14:02:12</span>
              <span className="font-bold">[LIVE]</span>
              <span>GET /api/v1/auth/callback 200 (42ms)</span>
            </div>
            <div className="text-error flex gap-2 animate-pulse">
              <span className="text-outline">14:02:13</span>
              <span className="font-bold">[CRITICAL]</span>
              <span>Memory leak detected in Worker #4</span>
            </div>
            <div className="text-tertiary flex gap-2">
              <span className="text-outline">14:02:13</span>
              <span className="font-bold">[AI-HEAL]</span>
              <span>Re-routing traffic to redundant node...</span>
            </div>
            <div className="text-on-surface-variant flex gap-2">
              <span className="text-outline">14:02:14</span>
              <span className="font-bold">[INFO]</span>
              <span>Latency normalized: 14ms</span>
            </div>
          </div>
        </div>
        {/* Headline */}
        <h2 className="font-headline text-3xl font-bold tracking-tight mb-8">Stop guessing why your servers crashed.</h2>
        {/* Checklist */}
        <ul className="space-y-4 mb-12">
          <li className="flex items-center gap-3">
            <div className="shrink-0 w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center">
              <FaCheck className="text-[12px] text-secondary-fixed" />
            </div>
            <span className="text-on-surface-variant font-medium">Instant API Key generation</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="shrink-0 w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center">
              <FaCheck className="text-[12px] text-secondary-fixed" />
            </div>
            <span className="text-on-surface-variant font-medium">Sub-50ms log ingestion via Node.js/Redis</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="shrink-0 w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center">
              <FaCheck className="text-[12px] text-secondary-fixed" />
            </div>
            <span className="text-on-surface-variant font-medium">Real-time WebSocket live-tailing</span>
          </li>
        </ul>
        {/* Testimonial */}
        <div className="bg-surface-container-high/40 backdrop-blur-xl p-6 rounded-xl border border-white/5">
          <p className="text-on-surface italic text-sm leading-relaxed mb-4">
            "LogLogic saved us four hours of forensic debugging on day one. The real-time insight into our distributed cluster was exactly what we needed to scale our ingestion pipeline."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary/20">
              <img className="w-full h-full object-cover" data-alt="Portrait of a focused software engineer with glasses in a dimly lit workstation with blue light reflecting on his face" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjrB9Zx05ey7sZ29rsY5CvoeapuX2CQOZdSumLkeYO2UzYvIyuHrzoQA8c0_Xe0XmioX25pRFq14KsxVudylDXTP-tWLwtc476n1zD3Y6YnkJWvZMJYooldckywz_whblPow3tAB0jIJEMv5NuoB7KIL6_5m6SJ2QkY89VVsY2lQ4A-kgVsXnNhaLLo9nm_LjyILkKfcKiG-_Y4KlSABGzulqDGXYPj2Wbmao25dYIIs00KOtXlYSvEEkmG7WX4SilrwXkpwR1N1Rz" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Alex K.</p>
              <p className="text-[10px] text-outline uppercase tracking-widest">Lead Backend Engineer @ StreamLine</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</div>

  )
}

export default Signup
