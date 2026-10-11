import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getBilling, openBillingPortal, addSeats } from '../api/billing'
import { LuCreditCard, LuLoader } from 'react-icons/lu'

const money = (cents) => {
  if (cents == null) return 'Custom'
  return `$${(Number(cents) / 100).toFixed(Number(cents) % 100 === 0 ? 0 : 2)}`
}

const when = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function BillingSettings({ orgId, isOwner, notice }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(notice === 'cancelled' ? 'Checkout was cancelled.' : '')
  const [busy, setBusy] = useState(false)
  const [seatModal, setSeatModal] = useState(false)
  const [addCount, setAddCount] = useState(5)

  const load = async () => {
    if (!orgId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setSummary(await getBilling(orgId, sessionId))
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load billing.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [orgId, sessionId])

  useEffect(() => {
    if (notice === 'cancelled') setToast('Checkout was cancelled.')
    if (notice === 'success') setToast('Checkout returned. Plan updates when Stripe confirms the subscription.')
  }, [notice])

  const go = async (action) => {
    setBusy(true)
    setError(null)
    try {
      const result = await action()
      if (result?.url) window.location.assign(result.url)
    } catch (err) {
      setError(err.response?.data?.error || 'Billing request failed.')
    } finally {
      setBusy(false)
    }
  }

  const submitSeats = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const result = await addSeats(orgId, Number(addCount))
      setSeatModal(false)
      const charged = result?.amount_paid ? ` Charged ${money(result.amount_paid)}.` : ''
      setToast(`Added ${addCount} seats.${charged}`)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add seats.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#a8abb3]">
        <LuLoader className="w-4 h-4 animate-spin" /> Loading billing
      </div>
    )
  }

  const plan = summary?.plan
  const usage = summary?.usage || { written: 0, limit: null }
  const seats = summary?.seats || { used: 0, included: null, allowance: null }
  const limit = usage.limit
  const ratio = limit ? Math.min(100, Math.round((usage.written / limit) * 100)) : 0
  const atSeatLimit = summary?.plan_tier === 'free' && seats.allowance != null && seats.used >= seats.allowance

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#f1f3fc]">Billing</h2>
        <p className="text-sm text-[#a8abb3] mt-1">Plan, seats, usage for this Stripe period, and invoices.</p>
      </div>

      {toast && (
        <div className="rounded-lg border border-[#8ff5ff]/30 bg-[#00eefc]/10 px-4 py-3 text-sm text-[#8ff5ff]">
          {toast}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="bg-[#11161d] border border-[#44484f]/25 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase font-semibold text-[#7f8594]">Plan</p>
            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#00eefc]/10 text-[#8ff5ff] border border-[#8ff5ff]/20 capitalize">
              {summary?.plan_tier || 'free'}
            </span>
            {summary?.subscription_status === 'canceling' && summary?.period_end && (
              <p className="text-xs text-[#f1f3fc] mt-3">Subscription cancelled. This plan stays valid until {when(summary.cancels_at || summary.period_end)}. The owner was emailed.</p>
            )}
            {summary?.subscription_status === 'active' && summary?.has_subscription && summary?.period_end && (
              <p className="text-xs text-[#a8abb3] mt-3">Valid until {when(summary.period_end)}. Paid invoices are emailed to the owner.</p>
            )}
            {summary?.subscription_status === 'canceled' && summary?.retention_hold_until && (
              <p className="text-xs text-[#f1f3fc] mt-3">Subscription ended. Logs from the paid plan stay until {when(summary.retention_hold_until)}.</p>
            )}
          </div>
          <p className="text-sm text-[#f1f3fc]">
            {plan?.monthly_price_cents ? `${money(plan.monthly_price_cents)}/month` : money(plan?.monthly_price_cents)}
          </p>
        </div>

        <div>
          <div className="flex justify-between text-xs text-[#a8abb3] mb-1">
            <span>Logs this period</span>
            <span>{usage.written.toLocaleString()}{limit ? ` / ${limit.toLocaleString()}` : ''}</span>
          </div>
          <div className="h-2 rounded-full bg-[#0a0e14] overflow-hidden">
            <div className="h-full bg-[#00eefc]" style={{ width: `${limit ? ratio : 0}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <div>
            <p className="text-xs uppercase font-semibold text-[#7f8594]">Seats</p>
            <p className="text-[#f1f3fc] mt-1">
              {seats.used} / {seats.included == null ? 'unlimited' : seats.allowance}
            </p>
          </div>
          {summary?.subscription_status === 'grandfathered' && !summary?.has_subscription && (
            <p className="text-xs text-[#a8abb3]">Complimentary Pro until {summary.grace_until ? new Date(summary.grace_until).toLocaleDateString() : 'the grace date'}. Use Upgrade plan and the test card to start a paid subscription. Invoices show up after that.</p>
          )}
          {isOwner && summary?.has_subscription && (
            <button
              type="button"
              onClick={() => setSeatModal(true)}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-[#00eefc] text-[#0a0e14] cursor-pointer"
            >
              Add seats
            </button>
          )}
          {isOwner && atSeatLimit && (
            <button
              type="button"
              onClick={() => navigate('/app/pricing')}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-[#00eefc] text-[#0a0e14] cursor-pointer"
            >
              Upgrade
            </button>
          )}
        </div>

        {isOwner && (
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/app/pricing')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#11161d] border border-[#8ff5ff]/40 text-[#8ff5ff] cursor-pointer"
            >
              <LuCreditCard className="inline w-3.5 h-3.5 mr-1" /> Upgrade plan
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => go(() => openBillingPortal(orgId))}
              className="px-4 py-2 rounded-lg text-xs font-bold border border-[#44484f] text-[#f1f3fc] cursor-pointer disabled:opacity-50"
            >
              Manage billing
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#11161d] border border-[#44484f]/25 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#44484f]/25 text-sm font-semibold text-[#f1f3fc]">Invoices</div>
        {(summary?.invoices || []).length === 0 ? (
          <p className="px-6 py-4 text-sm text-[#a8abb3]">No invoices yet.</p>
        ) : (
          <ul className="divide-y divide-[#44484f]/20">
            {summary.invoices.map((invoice) => (
              <li key={invoice.id} className="px-6 py-3 flex items-center justify-between text-sm">
                <span className="text-[#f1f3fc]">{invoice.number || invoice.id}</span>
                <span className="text-[#a8abb3]">
                  {money(invoice.amount_paid || invoice.amount_due || 0)} · <span className="capitalize">{invoice.status}</span>
                  {invoice.period_end ? ` · valid till ${when(invoice.period_end)}` : ''}
                </span>
                {invoice.hosted_invoice_url && (
                  <a href={invoice.hosted_invoice_url} className="text-[#8ff5ff]" target="_blank" rel="noreferrer">View</a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {seatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <form onSubmit={submitSeats} className="w-full max-w-sm rounded-xl border border-[#44484f]/40 bg-[#11161d] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#f1f3fc]">Add seats</h3>
            <p className="text-xs text-[#a8abb3]">Each extra seat is {money(plan?.extra_seat_price_cents || 1000)} per month, prorated.</p>
            <input
              type="number"
              min="1"
              max="100"
              value={addCount}
              onChange={(event) => setAddCount(event.target.value)}
              className="w-full bg-[#0a0e14] border border-[#44484f]/40 text-white text-sm rounded-lg p-2.5 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setSeatModal(false)} className="px-3 py-2 text-xs text-[#a8abb3] cursor-pointer">Cancel</button>
              <button type="submit" disabled={busy} className="px-3 py-2 rounded-lg text-xs font-bold bg-[#00eefc] text-[#0a0e14] cursor-pointer disabled:opacity-50">
                Add {addCount || ''}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
