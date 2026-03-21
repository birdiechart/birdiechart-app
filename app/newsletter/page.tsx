'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Navigation from '@/components/Navigation'

const NEWSLETTER_ISSUES = [
  {
    id: 1,
    title: 'The Art of the Birdie',
    date: 'March 2026',
    preview: 'What separates weekend golfers who occasionally birdie from those who do it consistently? We dig into the habits, mindset, and approach shots that make the difference.',
    url: 'https://beehiiv.com',
  },
  {
    id: 2,
    title: 'Course Management for More Birdies',
    date: 'February 2026',
    preview: 'Playing smart golf means knowing when to attack and when to lay up. This month we break down how to set up birdie opportunities on every hole you play.',
    url: 'https://beehiiv.com',
  },
  {
    id: 3,
    title: 'The Short Game is Everything',
    date: 'January 2026',
    preview: 'More birdies start from 100 yards and in. We explore the wedge game fundamentals that will have you sticking it close and rolling in more birdies.',
    url: 'https://beehiiv.com',
  },
]

function NewsletterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromClub = searchParams.get('from')
  const [hasClub, setHasClub] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('club_id').eq('id', user.id).single()
      setHasClub(!!profile?.club_id)
    }
    init()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm safe-top">
        <div className="px-4 py-4 flex items-center gap-3">
          {fromClub && (
            <Link
              href={`/club/${fromClub}/settings`}
              className="p-1.5 rounded-lg bg-gray-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Newsletter
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Tips, stories, and birdie inspiration</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Subscribe banner */}
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #1D6B3B, #134d2a)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">Birdie Chart</p>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
            The Birdie Report
          </h2>
          <p className="text-sm opacity-80 mb-4 leading-relaxed">
            Weekly tips, course strategy, and stories from golfers on the same quest — making a birdie on every hole at every course they play.
          </p>
          <div className="text-xs font-medium opacity-60">
            You&apos;re subscribed as a Birdie Chart member
          </div>
        </div>

        {/* Latest issues */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Latest Issues</p>

        {NEWSLETTER_ISSUES.map((issue) => (
          <a
            key={issue.id}
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">{issue.date}</p>
                <h3 className="font-bold text-gray-900 text-base leading-snug mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {issue.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{issue.preview}</p>
              </div>
              <div className="flex-shrink-0 mt-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs font-semibold" style={{ color: '#1D6B3B' }}>Read full issue →</span>
            </div>
          </a>
        ))}
      </div>

      <Navigation />
    </div>
  )
}

export default function NewsletterPage() {
  return (
    <Suspense>
      <NewsletterContent />
    </Suspense>
  )
}
