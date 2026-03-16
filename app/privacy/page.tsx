import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link href="/chart" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to app
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 16, 2025</p>

        <div className="prose prose-sm text-gray-700 space-y-6">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. Who We Are</h2>
            <p>Birdie Chart is operated by <strong>Write Avenue Corp</strong>. If you have any questions about this Privacy Policy, contact us at <a href="mailto:birdiechart@gmail.com" className="text-green-700 underline">birdiechart@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. Information We Collect</h2>
            <p>We collect the following information when you use Birdie Chart:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account information:</strong> Your name and email address when you sign up.</li>
              <li><strong>Golf data:</strong> The courses you add, hole scores (birdies, eagles, pars), and dates those scores were recorded.</li>
              <li><strong>Club membership:</strong> If you join a private club leaderboard, we store your membership in that club.</li>
              <li><strong>Newsletter subscription:</strong> If you subscribe to our newsletter, we store your email for that purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide the Birdie Chart service — tracking your scores and showing your progress.</li>
              <li>To display leaderboards within clubs you have joined.</li>
              <li>To send you our newsletter, if you have subscribed. You can unsubscribe at any time.</li>
              <li>To respond to support requests sent to our contact email.</li>
            </ul>
            <p className="mt-2">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">4. Third-Party Services</h2>
            <p>Birdie Chart uses the following third-party services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Supabase</strong> — for authentication and database storage. Your data is stored on Supabase-managed infrastructure.</li>
              <li><strong>Google Places API</strong> — to search for golf courses by name or location. Search queries are sent to Google.</li>
              <li><strong>GolfAPI</strong> — to retrieve hole details (par, yardage) for courses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">5. Data Sharing</h2>
            <p>Your scores and progress are private by default. The only exception is club leaderboards: if you join a club, other members of that same club can see your birdie count and hole progress on the leaderboard. You can leave a club at any time.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you would like your account and data deleted, email us at <a href="mailto:birdiechart@gmail.com" className="text-green-700 underline">birdiechart@gmail.com</a> and we will process your request within 30 days.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">7. Children&apos;s Privacy</h2>
            <p>Birdie Chart is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify users of material changes by posting the updated policy in the app. Continued use of Birdie Chart after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">9. Contact</h2>
            <p>Questions or concerns? Email us: <a href="mailto:birdiechart@gmail.com" className="text-green-700 underline">birdiechart@gmail.com</a></p>
          </section>

        </div>
      </div>
    </div>
  )
}
