import Link from 'next/link'
import BirdieLogo from '@/components/BirdieLogo'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link href="/chart" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to app
        </Link>

        <div className="mb-8">
          <BirdieLogo className="h-10 w-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>One birdie at a time.</h1>
          <p className="text-gray-600 leading-relaxed">
            Birdie Chart was built for golfers who want a simple, satisfying way to track something most apps ignore — not your handicap, not your round scores, but your quest to birdie every single hole at every course you play.
          </p>
        </div>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">

          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">The idea</h2>
            <p>
              Every golfer knows the feeling of finally making birdie on a hole that&apos;s given them trouble for years. Birdie Chart is built around that feeling — giving you a visual record of every hole you&apos;ve conquered, at every course in your rotation.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">How it works</h2>
            <p>
              Add any course you play. Tap a hole after you make birdie or eagle. Watch your chart fill in over time. When every hole is checked off, you&apos;ve completed that course. Then start a new season and do it again.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Club leaderboards</h2>
            <p>
              Golf is better with friends. Join a club to compete with your regular playing partners on a shared leaderboard — ranked by unique holes birdied across all your courses.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Private clubs & white label</h2>
            <p>
              We work with private country clubs to offer a branded version of Birdie Chart for their members. If you&apos;re interested in bringing Birdie Chart to your club, reach out.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-gray-500">
              Built by <strong className="text-gray-700">Write Avenue Corp</strong>. Questions or feedback? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:birdiechart@gmail.com"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#1D6B3B' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 8 L12 14 L22 8"/>
              </svg>
              birdiechart@gmail.com
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
