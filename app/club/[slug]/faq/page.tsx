'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { getClubTheme } from '@/lib/club-themes'
import ClubNavigation from '@/components/ClubNavigation'

const generalFaqs = [
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
    a: 'A hole is complete once you\'ve recorded a birdie (or eagle) on it. Pars and bogeys are tracked but don\'t count toward your facility progress goal.',
  },
  {
    q: 'Do eagles count toward my goal?',
    a: 'By default yes, but you can turn this off in Settings → Goal Tracking. Some golfers prefer to only count birdies — it\'s your call.',
  },
  {
    q: 'Can I delete a score?',
    a: 'Yes. Tap the hole, then in the score history panel tap the trash icon next to any entry to remove it. Your progress updates immediately.',
  },
  {
    q: 'Can I track courses outside the club?',
    a: 'Yes — use the Away tab in the bottom navigation. Away courses are tracked separately and don\'t affect the club leaderboard.',
  },
  {
    q: 'Is my data private?',
    a: 'Your scores are visible to fellow club members for the leaderboard. No one outside your club can see your data.',
  },
]

function clubFaqs(clubName: string) {
  return [
    {
      q: `What is the ${clubName} Birdie Chart?`,
      a: `This is a private, branded version of Birdie Chart built exclusively for ${clubName} members. It tracks your progress across all the club's courses and lets you compete with fellow members on a shared leaderboard.`,
    },
    {
      q: 'How is this different from the regular Birdie Chart app?',
      a: `The ${clubName} version is pre-loaded with all the club's courses and tee options, so there's nothing to set up. It also has a club leaderboard showing how all members are progressing across the facility. The regular Birdie Chart app is open to any golfer and lets you track any course anywhere — you can access it at birdiechart.golf.`,
    },
    {
      q: 'What does the leaderboard track?',
      a: 'The leaderboard ranks members by the number of unique holes birdied across all club courses. It counts birdies only — eagles don\'t count on the leaderboard regardless of your personal settings, so the ranking is fair for everyone.',
    },
    {
      q: 'How do I change which tees I play?',
      a: 'Go to Settings (the gear icon in the top right of your chart). You can switch tees at any time — this updates the yardages shown on your chart going forward.',
    },
    {
      q: 'Can I track the same hole from multiple tee boxes?',
      a: 'Each tee is tracked separately. If you normally play the Tournament tees but occasionally play from the Club tees, those are counted independently on your chart.',
    },
    {
      q: 'How do I leave the club?',
      a: 'Go to Settings → Leave Club. Your scores and account are preserved — you can rejoin anytime with the member code from the golf shop.',
    },
    {
      q: 'Who do I contact if something isn\'t working?',
      a: 'Email us at birdiechart@gmail.com and we\'ll get back to you quickly.',
    },
  ]
}

interface FaqItemProps {
  q: string
  a: string
  primaryColor: string
}

function FaqItem({ q, a, primaryColor }: FaqItemProps) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left border-b border-gray-100 pb-4 last:border-0"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{q}</p>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 mt-0.5 transition-transform"
          style={{ color: primaryColor, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
      {open && (
        <p className="text-sm text-gray-600 leading-relaxed mt-2 text-left">{a}</p>
      )}
    </button>
  )
}

export default function ClubFAQPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const theme = getClubTheme(slug)

  if (!theme) return null

  const clubSpecific = clubFaqs(theme.clubName || 'Your Club')

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: theme.primaryLight }}>

      {/* Header */}
      <div style={{ backgroundColor: theme.primary }} className="safe-top">
        <div className="px-4 pt-3 pb-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div>
            <img
              src={theme.logoPath}
              alt={theme.clubName}
              className="h-6 w-auto"
              style={theme.logoOnDark ? { filter: 'brightness(0) invert(1)' } : undefined}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
          FAQ
        </h1>
        <p className="text-sm text-gray-500 mb-6">Frequently asked questions about your Birdie Chart.</p>

        {/* Club-specific section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: theme.primary }}>
            About Your Club App
          </h2>
          <div className="space-y-4">
            {clubSpecific.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} primaryColor={theme.primary} />
            ))}
          </div>
        </div>

        {/* General section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
            General
          </h2>
          <div className="space-y-4">
            {generalFaqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} primaryColor={theme.primary} />
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <p className="text-sm text-gray-500 mb-3">Still have questions?</p>
          <a
            href="mailto:birdiechart@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: theme.primary }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 8 L12 14 L22 8"/>
            </svg>
            birdiechart@gmail.com
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 mb-2">
          Powered by{' '}
          <a href="https://birdiechart.golf" className="underline">Birdie Chart</a>
        </p>

      </div>

      <ClubNavigation slug={slug} theme={theme} />
    </div>
  )
}
