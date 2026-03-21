import Link from 'next/link'
import BirdieLogo from '@/components/BirdieLogo'

const faqs = [
  {
    q: 'What is Birdie Chart?',
    a: 'Birdie Chart is a simple way to track your quest to birdie every hole at every course you play. Not your handicap, not your round scores — just a visual record of every hole you\'ve conquered over time.',
  },
  {
    q: 'How do I log a score?',
    a: 'Tap any hole on the grid. A panel slides up where you can record an eagle, birdie, par, or bogey. Your best score for that hole is always what\'s shown on the chart.',
  },
  {
    q: 'What does "completing" a hole mean?',
    a: 'A hole is considered complete once you\'ve recorded a birdie (or eagle) on it. Pars and bogeys are tracked but don\'t count toward your progress goal.',
  },
  {
    q: 'Do eagles count toward my goal?',
    a: 'By default yes, but you can turn this off in Settings → Goal Tracking. Some golfers prefer to only count birdies — it\'s a personal choice.',
  },
  {
    q: 'Can I track multiple courses?',
    a: 'Yes. Search for any course using the Find Courses tab and add it to your chart. Each course gets its own hole grid.',
  },
  {
    q: 'Can I delete a score?',
    a: 'Yes. Tap the hole, then in the score history panel tap the trash icon next to any entry to remove it. Your progress updates immediately.',
  },
  {
    q: 'Is there a leaderboard?',
    a: 'Leaderboards are exclusive to private club versions of Birdie Chart. If your club or course has a Birdie Chart partnership, members get access to a shared leaderboard ranked by unique holes birdied across the facility. The main Birdie Chart app is a personal tracking tool without social leaderboards.',
  },
  {
    q: 'My club or league is interested in Birdie Chart — how does that work?',
    a: 'We offer a private, branded version of Birdie Chart for golf clubs and leagues. Members get an app pre-loaded with your courses and tee options, plus a leaderboard to compete within your group. Reach out to birdiechart@gmail.com to learn more.',
  },
  {
    q: 'Is my data private?',
    a: 'Your scores are private by default. If you\'re a member of a club, your fellow members can see your scores for the purposes of the leaderboard — but no one outside your club can.',
  },
  {
    q: 'Can I use Birdie Chart at courses outside my home club?',
    a: 'Absolutely. The Away tab (in club apps) or Find Courses (in the main app) lets you track birdies anywhere you play. Away course scores are separate from your club leaderboard.',
  },
  {
    q: 'How do I reset and start a new season?',
    a: 'Season reset isn\'t automatic — your history is always preserved. If you want a fresh start, you can delete individual scores from the score history panel on each hole.',
  },
  {
    q: 'Who built this?',
    a: 'Birdie Chart is built by Write Avenue Corp. Questions or feedback? Email us at birdiechart@gmail.com.',
  },
]

export default function FAQPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 text-sm">Everything you need to know about Birdie Chart.</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
              <h2 className="text-sm font-bold text-gray-900 mb-2">{faq.q}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">Still have questions?</p>
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
  )
}
