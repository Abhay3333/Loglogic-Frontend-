import { Link } from 'react-router-dom'
import { PLANS, PLAN_COMPARISON } from '../content/plans'

const PricingPage = () => {
  return (
    <main className="pt-32 pb-24 bg-[#0a0e14] text-[#f1f3fc]">
      <section className="max-w-4xl mx-auto text-center px-6 mb-16">
        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight mb-4 text-white">
          Pricing
        </h1>
        <p className="text-[#a8abb3] text-lg max-w-2xl mx-auto">
          Free, Pro, and Enterprise. Sign in and choose a plan from Upgrade when you are ready to change a workspace.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {PLANS.map((plan) => (
          <article
            key={plan.code}
            className={`bg-[#0a0e14] p-8 rounded-lg flex flex-col ${
              plan.recommended
                ? 'border-2 border-[#8ff5ff] shadow-2xl shadow-[#8ff5ff]/10'
                : 'border border-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <h2 className="font-headline text-xl font-bold text-white">{plan.name}</h2>
                <p className="text-[#a8abb3] text-sm mt-1">{plan.blurb}</p>
              </div>
              {plan.recommended && (
                <span className="bg-[#8ff5ff] text-[#005359] px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded">Recommended</span>
              )}
            </div>
            <p className="mb-8">
              <span className="font-headline text-5xl font-bold text-white">{plan.price}</span>
              <span className="text-[#a8abb3] font-mono">{plan.period}</span>
            </p>
            <ul className="flex flex-col gap-3">
              {plan.features.map((feature) => (
                <li key={feature} className="text-sm text-[#f1f3fc]">{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-6 mb-16">
        <h2 className="font-headline text-3xl font-bold mb-8 text-center text-white">What each plan includes</h2>
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

      <section className="max-w-3xl mx-auto px-6 text-center">
        <Link to="/signup" className="inline-flex px-6 py-3 rounded-lg bg-[#00eefc] text-[#0a0e14] font-headline font-bold">
          Create an account
        </Link>
      </section>
    </main>
  )
}

export default PricingPage
