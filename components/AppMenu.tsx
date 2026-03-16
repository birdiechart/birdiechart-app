'use client'

import { useState } from 'react'
import Link from 'next/link'

interface AppMenuProps {
  onSignOut: () => void
}

export default function AppMenu({ onSignOut }: AppMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
          <circle cx="5" cy="12" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="19" cy="12" r="2"/>
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 sheet-backdrop"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl slide-up" style={{ maxWidth: '100vw' }}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />

            <div className="px-4 pt-2 pb-6 space-y-1" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>

              <MenuItem
                href="/about"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                }
                label="About Birdie Chart"
                onClick={() => setOpen(false)}
              />

              <MenuItem
                href="/privacy"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                }
                label="Privacy Policy"
                onClick={() => setOpen(false)}
              />

              <MenuItem
                href="/terms"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="8" y1="13" x2="16" y2="13"/>
                    <line x1="8" y1="17" x2="16" y2="17"/>
                  </svg>
                }
                label="Terms of Service"
                onClick={() => setOpen(false)}
              />

              <MenuItem
                href="mailto:birdiechart@gmail.com"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 8 L12 14 L22 8"/>
                  </svg>
                }
                label="Contact Us"
                onClick={() => setOpen(false)}
              />

              <div className="pt-2 mt-2 border-t border-gray-100">
                <button
                  onClick={() => { setOpen(false); onSignOut() }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  )
}

function MenuItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  const isExternal = href.startsWith('mailto:')
  if (isExternal) {
    return (
      <a
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </a>
    )
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <span className="text-gray-400">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
