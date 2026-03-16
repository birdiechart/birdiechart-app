import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link href="/chart" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to app
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 16, 2025</p>

        <div className="prose prose-sm text-gray-700 space-y-6">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. Agreement</h2>
            <p>By creating an account and using Birdie Chart, you agree to these Terms of Service. Birdie Chart is operated by <strong>Write Avenue Corp</strong>. If you do not agree, please do not use the app.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. The Service</h2>
            <p>Birdie Chart is a free golf tracking application that allows users to log scores (birdies, eagles, pars) hole-by-hole across any course they play, track their progress, and optionally participate in club leaderboards.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. Your Account</h2>
            <p>You are responsible for maintaining the confidentiality of your account. You must provide accurate information when signing up. One account per person — creating multiple accounts is not permitted.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the app for any unlawful purpose.</li>
              <li>Attempt to access other users&apos; data without authorization.</li>
              <li>Reverse engineer, copy, or redistribute any part of Birdie Chart.</li>
              <li>Enter false or misleading score data in club leaderboards.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">5. Newsletter & Affiliate Content</h2>
            <p>Birdie Chart offers a free newsletter. The newsletter may contain affiliate links, meaning we may earn a commission if you purchase products or services through those links, at no additional cost to you. Affiliate relationships will be disclosed in the relevant content.</p>
            <p className="mt-2">You can unsubscribe from the newsletter at any time without losing access to the app.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">6. White Label & Club Plans</h2>
            <p>Birdie Chart offers private club and white label arrangements for country clubs and golf organizations. These are subject to separate agreements. Contact us at <a href="mailto:birdiechart@gmail.com" className="text-green-700 underline">birdiechart@gmail.com</a> for details.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">7. Intellectual Property</h2>
            <p>All content, branding, and code within Birdie Chart is owned by Write Avenue Corp. Your personal data (your scores, your course list) belongs to you.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">8. Disclaimer of Warranties</h2>
            <p>Birdie Chart is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted availability or that the app will be error-free.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">9. Limitation of Liability</h2>
            <p>Write Avenue Corp shall not be liable for any indirect, incidental, or consequential damages arising from your use of Birdie Chart.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">10. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">11. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the app after changes are posted constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">12. Contact</h2>
            <p>Questions about these Terms? Email us: <a href="mailto:birdiechart@gmail.com" className="text-green-700 underline">birdiechart@gmail.com</a></p>
          </section>

        </div>
      </div>
    </div>
  )
}
