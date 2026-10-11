import { useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { PLANS, PLAN_COMPARISON } from '../content/plans'
import { startCheckout } from '../api/billing'

const planFromQuery = (value) => PLANS.some((plan) => plan.code === value) ? value : 'pro'

export default function AppPricing() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { currentOrg } = useOutletContext() || {}
  const [selected, setSelected] = useState(planFromQuery(params.get('plan')))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(params.get('billing') === 'cancelled' ? 'Checkout was cancelled. Pick a plan to try again.' : '')
  const isOwner = currentOrg?.role === 'owner'

  const continueWithPlan = async (planCode) => {
    setError('')
    setNotice('')
    if (planCode === 'free') {
      navigate('/app/dashboard')
      return
    }
    if (!currentOrg?.id || !isOwner) {
      setError('Only the workspace owner can change the plan.')
      return
    }
    setBusy(true)
    try {
      const result = await startCheckout(currentOrg.id, planCode)
      if (result?.url) {
        window.location.assign(result.url)
        return
      }
      navigate('/app/settings?tab=billing&billing=success')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start checkout for that plan.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0e14] text-[#f1f3fc] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/app/settings?tab=billing')}
          className="text-sm text-[#8ff5ff] cursor-pointer mb-8"
        >
          Back to billing
        </button>
        <h1 className="font-headline text-4xl font-bold text-white">Choose a plan</h1>
        <p className="text-[#a8abb3] mt-2 mb-8">
          {currentOrg?.name ? `This updates ${currentOrg.name}.` : 'Pick the plan for this workspace.'}
        </p>

        {(notice || error) && (
          <div className="mb-6 space-y-3">
            {notice && <p className="rounded-lg border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-4 py-3 text-sm text-[#8ff5ff]">{notice}</p>}
            {error && <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PLANS.map((plan) => {
            const active = selected === plan.code
            return (
              <article
                key={plan.code}
                onClick={() => setSelected(plan.code)}
                className={`text-left bg-[#11161d] p-6 rounded-xl cursor-pointer flex flex-col ${
                  active ? 'border-2 border-[#8ff5ff]' : 'border border-[#44484f]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                    <p className="text-sm text-[#a8abb3] mt-1">{plan.blurb}</p>
                  </div>
                  {plan.recommended && (
                    <span className="bg-[#8ff5ff] text-[#005359] px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded">Recommended</span>
                  )}
                </div>
                <p className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-[#a8abb3]">{plan.period}</span>
                </p>
                <ul className="space-y-2 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm text-[#f1f3fc]">{feature}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={busy}
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelected(plan.code)
                    continueWithPlan(plan.code)
                  }}
                  className={`mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50 ${
                    active ? 'text-[#8ff5ff]' : 'text-[#7f8594]'
                  }`}
                >
                  {busy && active ? 'Opening' : 'Select'}
                  <span aria-hidden="true">&gt;</span>
                </button>
              </article>
            )
          })}
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">What each plan includes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-[#a8abb3] font-medium">Feature</th>
                  <th className="py-3 px-4 text-[#8ff5ff]">Free</th>
                  <th className="py-3 px-4 text-[#8ff5ff]">Pro</th>
                  <th className="py-3 px-4 text-[#8ff5ff]">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {PLAN_COMPARISON.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className={`py-3 px-4 ${index === 0 ? 'text-white font-semibold' : 'text-[#f1f3fc]'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
