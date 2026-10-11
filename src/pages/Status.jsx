import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5000'

const Row = ({ label, state }) => (
  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
    <span className="text-sm text-zinc-200">{label}</span>
    <span className={`text-xs font-semibold uppercase tracking-wide ${state === 'up' ? 'text-emerald-300' : 'text-red-300'}`}>
      {state === 'up' ? 'Up' : 'Down'}
    </span>
  </div>
)

export default function StatusPage() {
  const [api, setApi] = useState('down')
  const [ingestion, setIngestion] = useState('down')
  const [checkedAt, setCheckedAt] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch(`${BASE_URL}/health/ready`)
        const body = await response.json().catch(() => ({}))
        if (!active) return
        setApi('up')
        const mongo = body.checks?.mongo === 'ok'
        const redis = body.checks?.redis === 'ok'
        setIngestion(mongo && redis ? 'up' : 'down')
        setCheckedAt(new Date().toISOString())
      } catch {
        if (!active) return
        setApi('down')
        setIngestion('down')
        setCheckedAt(new Date().toISOString())
      }
    }
    load()
    const timer = setInterval(load, 30000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0e14] text-[#f1f3fc] px-6 py-16">
      <div className="mx-auto max-w-lg">
        <p className="text-xs uppercase tracking-widest text-[#8ff5ff]">LogLogic</p>
        <h1 className="mt-2 text-3xl font-semibold">System status</h1>
        <p className="mt-2 text-sm text-[#a8abb3]">Live check of the API, the ingestion path, and this dashboard.</p>
        <div className="mt-8 space-y-3">
          <Row label="API" state={api} />
          <Row label="Ingestion" state={ingestion} />
          <Row label="Dashboard" state="up" />
        </div>
        {checkedAt && (
          <p className="mt-4 text-xs text-zinc-500">Last check {new Date(checkedAt).toLocaleString()}</p>
        )}
      </div>
    </main>
  )
}
