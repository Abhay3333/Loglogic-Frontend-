import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FaCheck, FaGithub, FaGoogle, FaHubspot, FaTerminal } from 'react-icons/fa'
import { supabase } from '../lib/supabase'

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Where to send the user after auth (e.g. back to a pending /invite link).
  const redirectTarget = searchParams.get('redirect') || '/app/dashboard'
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (email, password) => {
    setErrorMsg("")
    setSuccessMsg("")
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false)

    if (error) {
      console.error("Login failed:", error.message);
      setErrorMsg(error.message);
      return;
    }

    console.log("Logged in successfully!", data);
    setSuccessMsg("Logged in successfully! Redirecting...");
    
    // Set localStorage auth
    localStorage.setItem('loglogic_auth', 'true')

    setTimeout(() => {
      navigate(redirectTarget)
    }, 1000)
  };

  const handleSubmit = (event) => {
    event.preventDefault()
    handleLogin(email, password)
  }

  const handleOAuthLogin = async (providerName) => {
    setErrorMsg("")
    setSuccessMsg("")
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: providerName,
      options: {
        redirectTo: `${window.location.origin}${redirectTarget}`
      }
    });

    if (error) {
      console.error(`${providerName} login failed:`, error.message);
      setErrorMsg(error.message);
    }
  };

  return (
    <div>
  <meta charSet="utf-8" />
  <meta content="width=device-width, initial-scale=1.0" name="viewport" />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style dangerouslySetInnerHTML={{__html: "\n        .cyber-grid {\n            background-image: \n                linear-gradient(to right, rgba(143, 245, 255, 0.05) 1px, transparent 1px),\n                linear-gradient(to bottom, rgba(143, 245, 255, 0.05) 1px, transparent 1px);\n            background-size: 40px 40px;\n        }\n        .glow-primary {\n            box-shadow: 0 0 15px rgba(0, 238, 252, 0.2);\n        }\n        .glow-text-primary {\n            text-shadow: 0 0 8px rgba(143, 245, 255, 0.5);\n        }\n    " }} />
  <main className="min-h-screen flex flex-col md:flex-row">
    {/* Left Side: Auth Form */}
    <section className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-surface">
      {/* Logo Area */}
      <div className="mb-12">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-primary">
            <FaTerminal className="text-on-primary-container text-xl" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-primary-fixed">LogLogic</span>
        </Link>
      </div>
      {/* Welcome Header */}
      <div className="mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-2">Welcome back.</h1>
        <p className="text-on-surface-variant font-medium tracking-wide">Enter your credentials to access the command center.</p>
      </div>
      {/* OAuth Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => handleOAuthLogin('github')}
          className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-high hover:bg-surface-bright border border-outline-variant/20 rounded-lg transition-all duration-200 group"
        >
          <FaGithub className="text-xl group-hover:text-primary transition-colors" />
          <span className="font-medium text-sm text-on-surface">Continue with GitHub</span>
        </button>
        <button 
          onClick={() => handleOAuthLogin('google')}
          className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-high hover:bg-surface-bright border border-outline-variant/20 rounded-lg transition-all duration-200 group"
        >
          <FaGoogle className="text-xl text-[#EA4335]" />
          <span className="font-medium text-sm text-on-surface">Continue with Google</span>
        </button>
      </div>
      {/* Divider */}
      <div className="relative flex items-center mb-8">
        <div className="grow border-t border-outline-variant/20" />
        <span className="shrink mx-4 text-[10px] uppercase tracking-[0.2em] font-bold text-outline">or continue with email</span>
        <div className="grow border-t border-outline-variant/20" />
      </div>
      {/* Form */}
      <form className="space-y-6 mb-8" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="text-error text-xs font-mono p-3 bg-red-950/20 border border-red-500/20 rounded">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="text-secondary text-xs font-mono p-3 bg-emerald-950/20 border border-emerald-500/20 rounded">
            {successMsg}
          </div>
        )}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-outline-variant" htmlFor="email">Work Email</label>
          <input 
            className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant py-3 px-4 text-on-surface placeholder:text-outline focus:ring-0 focus:border-primary focus:bg-surface-bright transition-all font-mono text-sm" 
            id="email" 
            placeholder="operator@loglogic.io" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-outline-variant" htmlFor="password">Security Key</label>
            <a className="text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary-fixed transition-colors" href="#">Forgot Password?</a>
          </div>
          <input 
            className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant py-3 px-4 text-on-surface placeholder:text-outline focus:ring-0 focus:border-primary focus:bg-surface-bright transition-all font-mono text-sm" 
            id="password" 
            placeholder="••••••••••••" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          className="w-full bg-linear-to-r from-[#71d9e4] to-[#1adcf2] text-[#0a4e63] py-4 rounded-lg text-on-primary-container font-headline font-bold text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      {/* Footer */}
      <p className="text-sm text-center text-on-surface-variant font-medium">
        Don't have an account?
        <Link className="text-secondary-fixed hover:text-secondary-dim font-bold transition-colors ml-1" to={`/signup${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`}>Sign up</Link>
      </p>
    </section>
    {/* Right Side: Marketing/Visual */}
    <section className="hidden md:flex flex-col flex-1 relative bg-background overflow-hidden cyber-grid">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none">
        <FaHubspot className="text-[12rem] text-primary" />
      </div>
      <div className="h-full flex flex-col justify-center px-16 lg:px-24 max-w-4xl relative z-10">
        {/* Terminal Graphic */}
        <div className="mb-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-surface-container-high px-4 py-3 flex items-center gap-2 border-b border-outline-variant/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-error-dim/40" />
              <div className="w-3 h-3 rounded-full bg-secondary-dim/40" />
              <div className="w-3 h-3 rounded-full bg-primary-dim/40" />
            </div>
            <div className="ml-4 text-[10px] font-mono text-outline uppercase tracking-widest">ingestion_stream:8080</div>
          </div>
          <div className="p-6 font-mono text-xs space-y-2 max-h-75 overflow-hidden">
            <div className="flex gap-4">
              <span className="text-outline">12:04:11.23</span>
              <span className="text-secondary">[OK]</span>
              <span className="text-on-surface-variant">GET /api/v1/telemetry 200 (4.2ms)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-outline">12:04:11.89</span>
              <span className="text-primary">[LOG]</span>
              <span className="text-on-surface-variant">Redis connected: worker_pool_04</span>
            </div>
            <div className="flex gap-4">
              <span className="text-outline">12:04:12.45</span>
              <span className="text-error">[ERR]</span>
              <span className="text-on-surface">Stack trace: user_auth_service.js:45:12</span>
            </div>
            <div className="flex gap-4 animate-pulse">
              <span className="text-outline">12:04:13.01</span>
              <span className="text-tertiary-fixed">[MSG]</span>
              <span className="text-on-surface-variant italic">Injecting telemetry packet from node-east-1...</span>
            </div>
            <div className="flex gap-4">
              <span className="text-outline">12:04:13.12</span>
              <span className="text-secondary">[OK]</span>
              <span className="text-on-surface-variant">Websocket handshaking complete.</span>
            </div>
          </div>
        </div>
        {/* Headline */}
        <h2 className="font-headline text-5xl font-extrabold text-on-surface mb-8 leading-[1.1] tracking-tighter">
          Stop guessing why your <span className="text-primary glow-text-primary underline decoration-primary/30 underline-offset-8">servers crashed.</span>
        </h2>
        {/* Checklist */}
        <ul className="space-y-5 mb-12">
          <li className="flex items-center gap-4 group">
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <FaCheck className="text-secondary text-base" />
            </div>
            <span className="text-on-surface-variant font-medium group-hover:text-on-surface transition-colors">Instant API Key generation</span>
          </li>
          <li className="flex items-center gap-4 group">
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <FaCheck className="text-secondary text-base" />
            </div>
            <span className="text-on-surface-variant font-medium group-hover:text-on-surface transition-colors">Sub-50ms log ingestion via Node.js/Redis</span>
          </li>
          <li className="flex items-center gap-4 group">
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <FaCheck className="text-secondary text-base" />
            </div>
            <span className="text-on-surface-variant font-medium group-hover:text-on-surface transition-colors">Real-time WebSocket live-tailing</span>
          </li>
        </ul>
        {/* Testimonial */}
        <div className="bg-surface-container-high/40 p-8 rounded-xl border-l-4 border-primary backdrop-blur-sm">
          <p className="text-lg text-on-surface italic mb-4 font-light leading-relaxed">
            "LogLogic saved us four hours of forensic debugging on day one. The real-time visibility is unlike anything else in the stack."
          </p>
          <div className="flex items-center gap-3">
            <img alt="Alex K." className="w-10 h-10 rounded-full grayscale hover:grayscale-0 transition-all cursor-pointer" data-alt="Professional headshot of a senior software engineer with a neutral expression and corporate office lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjHhXGmx3dGCx-OuusOJyjmHS61OW4l4fDZrsofPViSJFrH5Il0CCcsnL3NCl7GtjwZqlVqEYNO5NtGijSqnV-N7QyrgL7xq2wyyLhoVcGWqilYoIhZtL8sY_WLE9T5vO9w5vWRYd68mIAnxnNKpJSu9NI6cRAUc174NTrIzLQxlQCT7dZ1ZW7D5W1frusYpzeDHupLmyE_5sHXrbRU-f-yYq_S7lLkTTlEh_PSrS_d6qvqAD7XMeLad5jKbxzlrXBwyfhlIBkXowM" />
            <div>
              <p className="text-sm font-bold text-on-surface">Alex K.</p>
              <p className="text-[10px] uppercase tracking-wider text-outline">Lead Backend Engineer @ StreamLine</p>
            </div>
          </div>
        </div>
      </div>
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCzT5l1WUDkD1_52Vg3RaP-6QFP4ygd9F8v9oG0ZVtnmHPWg8oIoYT6COtFaezehcPSO8BrEw3kHJEgouHSfVB6vhfGN4FnnvpIvREXrNfhL4aPnWljlEftTVutP-8s-3fLYcky9X3qEtOG5Zfatk_EfVXdzcFzLK5l9HjbQLzWRbcu5vvOX6uJxLkCPtcOSMvQtbxqG3MkDLGgL6ijatvCJk0yQ3P8WJ9na2dr3vzqVJjWtxq5VRVe85_oD1lZVFYg50V3xEdSbE3q")'}} />
    </section>
  </main>
</div>

  )
}

export default Login
