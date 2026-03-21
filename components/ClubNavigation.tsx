'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClubTheme } from '@/lib/club-themes'

interface Tab {
  href: string
  label: string
  away?: boolean
  icon: (active: boolean) => React.ReactNode
}

interface ClubNavProps {
  slug: string
  theme: ClubTheme
}

export default function ClubNavigation({ slug, theme }: ClubNavProps) {
  const pathname = usePathname()

  const tabs = [
    {
      href: `/club/${slug}`,
      label: 'My Chart',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? theme.primary : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      href: `/club/${slug}/stats`,
      label: 'My Stats',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? theme.primary : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="12" width="4" height="9" rx="1"/>
          <rect x="9" y="7" width="4" height="14" rx="1"/>
          <rect x="16" y="3" width="4" height="18" rx="1"/>
        </svg>
      ),
    },
    {
      href: `/club/${slug}/leaderboard`,
      label: 'Leaderboard',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? theme.primary : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 21V12M12 21V3M16 21V8"/>
          <path d="M10 6l2-3 2 3"/>
        </svg>
      ),
    },
    {
      href: `/club/${slug}/away`,
      label: 'Away',
      away: true,
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D6B3B' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-40 safe-bottom" style={{ boxShadow: '0 -1px 0 0 #e5e7eb' }}>
      <div className="flex items-stretch max-w-lg mx-auto">
        {(tabs as Tab[]).map((tab) => {
          const active = pathname === tab.href
          const activeColor = tab.away ? '#1D6B3B' : theme.primary
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 min-h-[56px] transition-colors relative"
            >
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
                  style={{ backgroundColor: activeColor }}
                />
              )}
              {tab.icon(active)}
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? activeColor : '#9ca3af' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
