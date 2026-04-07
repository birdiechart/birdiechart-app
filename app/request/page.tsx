'use client'

import { useState } from 'react'
import BirdieLogo from '@/components/BirdieLogo'

export default function RequestCoursePage() {
  const [courseName, setCourseName] = useState('')
  const [location, setLocation] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/course-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_name: courseName.trim(), location: location.trim(), email: email.trim() }),
      })
    } catch { /* non-fatal */ }
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-8 pb-4 flex justify-center">
        <BirdieLogo iconOnly className="w-12 h-12" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full">
        {submitted ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D6B3B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
              Request received!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              We&apos;ll add <strong>{courseName}</strong> and email you at <strong>{email}</strong> when it&apos;s live — usually within 24 hours.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                Request a Course
              </h1>
              <p className="text-sm text-gray-500">
                Don&apos;t see your course? We&apos;ll add it within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course name</label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Augusta National Golf Club"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-gray-50"
                  style={{ '--tw-ring-color': '#1D6B3B' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Augusta, GA"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-gray-50"
                  style={{ '--tw-ring-color': '#1D6B3B' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-gray-50"
                  style={{ '--tw-ring-color': '#1D6B3B' } as React.CSSProperties}
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">So we can notify you when it&apos;s added</p>
              </div>

              <button
                type="submit"
                disabled={submitting || !courseName.trim() || !email.trim()}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 mt-2"
                style={{ backgroundColor: '#1D6B3B' }}
              >
                {submitting ? 'Submitting...' : 'Submit request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
