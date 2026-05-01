import React from 'react'

const TermsPage = () => {
  return (
    <div className="bg-[#0a0e14] text-[#f1f3fc] min-h-screen">
      <main className="pt-32 pb-24 px-6">
        <section className="max-w-5xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8ff5ff] font-semibold mb-4">Legal</p>
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">Terms of Service</h1>
          <p className="text-[#a8abb3] text-sm md:text-base leading-relaxed">
            Effective Date: [Effective Date]
            <br />
            Company: [Company Name]
            <br />
            Contact Email: [Contact Email]
          </p>
        </section>

        <section className="max-w-5xl mx-auto bg-[#11161d] border border-white/10 rounded-2xl p-6 md:p-10 space-y-10">
          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of the LogLogic platform, website, APIs, and related services (collectively, the "Service").
              By creating an account, accessing, or using the Service, you agree to these Terms on behalf of yourself or the legal entity you represent.
              If you do not agree, do not use the Service.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">2. Eligibility and Account Responsibilities</h2>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>You must be legally authorized to enter into these Terms.</li>
              <li>You are responsible for all activity under your account, API keys, and team workspaces.</li>
              <li>You must maintain accurate account and billing information.</li>
              <li>You must promptly notify us at [Contact Email] of any unauthorized access or security incident.</li>
              <li>You are responsible for configuring your own data handling and access controls before sending data to the Service.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">3. Service Description</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              LogLogic is a centralized logging and alerting platform for developers and businesses. Features may include ingestion APIs, search, dashboards,
              retention controls, alerting workflows, and integration endpoints. We may modify, improve, or discontinue features from time to time.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">4. Acceptable Use Policy</h2>
            <p className="text-[#c7cad1] leading-relaxed mb-3">
              You may not use the Service in a way that violates law, infringes rights, or compromises platform security and reliability.
              In particular, you agree that you will not submit, upload, or transmit prohibited sensitive data into LogLogic, including:
            </p>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>Full payment card numbers (PAN), CVV, magnetic stripe data, or equivalent cardholder data.</li>
              <li>Protected health information (PHI), medical records, or clinical diagnostic data regulated under healthcare privacy laws unless explicitly agreed in writing.</li>
              <li>Highly sensitive personally identifiable information (PII), such as government ID numbers, passport numbers, driver’s license numbers, or biometric identifiers.</li>
              <li>Credentials in plaintext, private keys, or secrets that are not redacted.</li>
              <li>Any content that is unlawful, harmful, infringing, defamatory, or intended to exploit vulnerabilities.</li>
            </ul>
            <p className="text-[#a8abb3] mt-4 text-sm leading-relaxed">
              We reserve the right to remove prohibited content, suspend ingestion, or terminate accounts for violations.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">5. API Usage, Rate Limits, and Fair Use</h2>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>You must use the ingestion API in accordance with published documentation and technical limits.</li>
              <li>We may enforce request, throughput, storage, and concurrency limits per plan.</li>
              <li>We may throttle, queue, or reject requests that threaten platform stability.</li>
              <li>We may suspend or terminate accounts that abuse the API, attempt denial-of-service behavior, evade limits, or intentionally attempt to crash the Service.</li>
              <li>You are responsible for retry logic, backoff handling, and key rotation in your integrations.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">6. Payments, Subscriptions, and Refunds</h2>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>Paid plans are billed in advance on a recurring subscription basis through Stripe.</li>
              <li>Subscriptions automatically renew unless canceled before the next billing date.</li>
              <li>You may cancel at any time; cancellation takes effect at the end of the current billing period.</li>
              <li>No retroactive or prorated refunds are provided for partial months, unused usage, or downgrades, unless required by law.</li>
              <li>You authorize us and our payment processor to charge the selected payment method for applicable fees and taxes.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">7. Data Retention</h2>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>Free tier logs are retained for 3 days and then hard-deleted.</li>
              <li>Pro tier logs are retained for 30 days and then deleted according to our retention workflow.</li>
              <li>You are responsible for exporting data you need before your retention window expires.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">8. Suspension and Termination</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              We may suspend or terminate your access for non-payment, breach of these Terms, legal compliance requirements, or conduct that presents a security or
              operational risk. You may stop using the Service at any time. Sections that by nature should survive termination remain in effect.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">9. Intellectual Property</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              We retain all rights, title, and interest in and to the Service, including software, branding, documentation, and underlying technology. Subject to these
              Terms, we grant you a limited, non-exclusive, non-transferable right to use the Service during an active subscription period.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">10. Disclaimer of Warranties</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular
              purpose, non-infringement, uninterrupted availability, or error-free operation.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">11. Limitation of Liability</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              To the maximum extent permitted by law, [Company Name] and its affiliates, officers, employees, and suppliers will not be liable for indirect, incidental,
              special, consequential, exemplary, or punitive damages, or for loss of profits, revenues, data, goodwill, or business interruption. Our aggregate liability
              arising out of or related to the Service will not exceed the total amount paid by you to us for the Service during the 12 months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">12. Indemnification</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              You agree to defend, indemnify, and hold harmless [Company Name] from and against claims, liabilities, damages, losses, and expenses (including reasonable
              legal fees) arising from your use of the Service, your submitted data, or your violation of these Terms or applicable law.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">13. Governing Law and Disputes</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              These Terms are governed by the laws of [Governing Law Jurisdiction], excluding conflict-of-law rules. Any dispute arising under these Terms will be resolved
              in the courts located in [Venue], unless otherwise required by applicable law.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">14. Changes to These Terms</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              We may update these Terms from time to time. If we make material changes, we will update the Effective Date above and provide notice as required by law.
              Continued use of the Service after the effective date of updated Terms constitutes acceptance.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">15. Contact</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              For questions about these Terms, contact [Contact Email] or [Company Address].
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default TermsPage
