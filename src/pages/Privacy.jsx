import React from 'react'

const PrivacyPage = () => {
  return (
    <div className="bg-[#0a0e14] text-[#f1f3fc] min-h-screen">
      <main className="pt-32 pb-24 px-6">
        <section className="max-w-5xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8ff5ff] font-semibold mb-4">Legal</p>
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">Privacy Policy</h1>
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
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">1. Scope</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              This Privacy Policy explains how [Company Name] ("LogLogic," "we," "us," or "our") collects, uses, stores, and shares personal information and service
              data when you use our website, APIs, dashboard, integrations, and related services (collectively, the "Service"). LogLogic is designed for business and
              developer use, including centralized logging, search, monitoring, and alerting.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="text-[#c7cad1] leading-relaxed mb-4">We collect information in the following categories:</p>
            <h3 className="font-semibold text-white mb-2">A. Account Data</h3>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>Name, work email address, company details, and account credentials.</li>
              <li>OAuth profile data from identity providers (for example, GitHub and Google), such as user ID, profile name, email, and avatar.</li>
              <li>Billing metadata, subscription tier, invoices, and transaction identifiers provided by Stripe. We do not store raw payment card numbers.</li>
            </ul>
            <h3 className="font-semibold text-white mt-5 mb-2">B. Log Data ("App Data")</h3>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>Raw JSON logs, traces, and related event payloads submitted through our ingestion API, SDKs, or integrations.</li>
              <li>Metadata associated with logs, such as timestamps, source identifiers, tags, and environment labels.</li>
            </ul>
            <h3 className="font-semibold text-white mt-5 mb-2">C. Usage and Technical Data</h3>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>API request volume, error rates, and service performance telemetry.</li>
              <li>Device and browser metadata, IP address, and security logs used for fraud detection and abuse prevention.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">3. How We Use Information</h2>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>Provide, operate, maintain, and secure the Service.</li>
              <li>Process log ingestion, indexing, search, dashboards, and alert delivery.</li>
              <li>Authenticate users and manage accounts.</li>
              <li>Process subscriptions, invoices, and related billing events through Stripe.</li>
              <li>Monitor reliability, detect abuse, enforce platform limits, and prevent unauthorized access.</li>
              <li>Communicate service notices, billing updates, security alerts, and support responses.</li>
              <li>Comply with legal obligations and enforce our contractual terms.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">4. Third-Party Subprocessors</h2>
            <p className="text-[#c7cad1] leading-relaxed mb-4">We use carefully selected subprocessors to provide infrastructure and core functionality:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4 text-[#8ff5ff]">Provider</th>
                    <th className="py-3 pr-4 text-[#8ff5ff]">Purpose</th>
                    <th className="py-3 text-[#8ff5ff]">Data Categories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-[#c7cad1]">
                  <tr>
                    <td className="py-3 pr-4">Supabase (PostgreSQL/Auth)</td>
                    <td className="py-3 pr-4">Authentication and account/billing metadata storage</td>
                    <td className="py-3">Account Data</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">MongoDB Atlas</td>
                    <td className="py-3 pr-4">Primary storage and indexing for ingested logs</td>
                    <td className="py-3">Log Data</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Stripe</td>
                    <td className="py-3 pr-4">Payment processing, subscription management, invoicing</td>
                    <td className="py-3">Billing metadata (no raw card data stored by us)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Google and GitHub OAuth</td>
                    <td className="py-3 pr-4">Single sign-on and identity verification</td>
                    <td className="py-3">OAuth profile data</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[#a8abb3] mt-4 text-sm leading-relaxed">
              We may update subprocessors from time to time and will maintain this policy accordingly.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">5. Data Retention and Deletion</h2>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>Free tier log data is hard-deleted after 3 days.</li>
              <li>Pro tier log data is retained for 30 days, then deleted according to our deletion workflow.</li>
              <li>Account and billing records are retained while your account is active and for a limited period thereafter as required for legal, tax, fraud, or audit purposes.</li>
              <li>Backups may persist for a limited rolling period before secure deletion.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">6. Data Sharing and Disclosure</h2>
            <p className="text-[#c7cad1] leading-relaxed mb-3">We do not sell personal information. We may disclose data only in the following circumstances:</p>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>To subprocessors and service providers acting on our instructions.</li>
              <li>To comply with applicable law, regulation, legal process, or enforceable governmental request.</li>
              <li>To investigate or prevent security incidents, fraud, or abuse of the Service.</li>
              <li>As part of a merger, acquisition, financing, or asset sale, subject to appropriate confidentiality protections.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">7. International Data Transfers</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              Your information may be processed in countries other than your own. Where required, we use appropriate contractual and organizational safeguards for cross-border
              transfers.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">8. Security</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              We implement technical and organizational safeguards designed to protect data against unauthorized access, loss, misuse, and alteration. No method of transmission
              or storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">9. Your Privacy Rights</h2>
            <p className="text-[#c7cad1] leading-relaxed mb-3">
              Depending on your location, you may have rights under applicable laws (including GDPR and CCPA/CPRA), such as:
            </p>
            <ul className="list-disc pl-6 text-[#c7cad1] space-y-2 leading-relaxed">
              <li>Right to access, correct, or delete personal information.</li>
              <li>Right to object to or restrict certain processing activities.</li>
              <li>Right to data portability for information you provided to us.</li>
              <li>Right to withdraw consent where processing is based on consent.</li>
              <li>Right not to receive discriminatory treatment for exercising your rights.</li>
            </ul>
            <p className="text-[#a8abb3] mt-4 text-sm leading-relaxed">
              To submit a request, contact [Contact Email]. We may need to verify your identity before fulfilling requests.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">10. Children’s Privacy</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              The Service is intended for business and developer use and is not directed to children under 16. We do not knowingly collect personal information from children.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">11. Changes to This Privacy Policy</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              We may update this Privacy Policy from time to time. If we make material changes, we will update the Effective Date above and provide notice as required by law.
            </p>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">12. Contact Us</h2>
            <p className="text-[#c7cad1] leading-relaxed">
              If you have questions or requests regarding this Privacy Policy, contact us at [Contact Email] or by mail at [Company Address].
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PrivacyPage
