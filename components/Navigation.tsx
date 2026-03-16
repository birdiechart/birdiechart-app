'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavProps {
  showLeaderboard?: boolean
}

export default function Navigation({ showLeaderboard = false }: NavProps) {
  const pathname = usePathname()

  const tabs = [
    {
      href: '/chart',
      label: 'My Chart',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D6B3B' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M5 20 Q12 13 19 20"/>
          <circle cx="12" cy="8" r="1.5" fill={active ? '#1D6B3B' : '#9ca3af'} stroke="none"/>
        </svg>
      ),
    },
    ...(showLeaderboard ? [{
      href: '/leaderboard',
      label: 'Leaderboard',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D6B3B' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="14" width="4" height="7" rx="1"/>
          <rect x="9" y="9" width="4" height="12" rx="1"/>
          <rect x="16" y="4" width="4" height="17" rx="1"/>
          <path d="M18 4l-2-2 2-2 2 2"/>
        </svg>
      ),
    }] : []),
    {
      href: '/courses',
      label: 'Find Courses',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D6B3B' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/>
          <line x1="16.5" y1="16.5" x2="21" y2="21"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
        </svg>
      ),
    },
    {
      href: '/stats',
      label: 'Stats',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D6B3B' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="12" width="4" height="9" rx="1"/>
          <rect x="9" y="7" width="4" height="14" rx="1"/>
          <rect x="16" y="3" width="4" height="18" rx="1"/>
        </svg>
      ),
    },
    {
      href: '/newsletter',
      label: 'Newsletter',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D6B3B' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M2 8 L12 14 L22 8"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 min-h-[56px] transition-colors"
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? '#1D6B3B' : '#9ca3af' }}
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
