'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getClubTheme } from '@/lib/club-themes'

export default function ClubLoginPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const theme = getClubTheme(slug)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
    } else {
      router.push(`/club/${slug}`)
      router.refresh()
    }
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email above first.'); return }
    setResetLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/club/${slug}/login`,
    })
    setResetLoading(false)
    setResetSent(true)
  }

  if (!theme) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.primaryLight }}>

      {/* Header */}
      <div style={{ backgroundColor: theme.primary }} className="safe-top">
        <div className="px-6 py-5 flex justify-center">
          <img
            src={theme.logoPath}
            alt="Club logo"
            className="h-8 w-auto"
            style={theme.logoOnDark ? { filter: 'brightness(0) invert(1)' } : undefined}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            Member Sign In
          </h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back to your Birdie Chart</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 text-base"
              style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 text-base"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-opacity disabled:opacity-60"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {resetSent ? (
          <p className="text-center text-sm text-green-600 mt-6 font-medium">
            Password reset email sent — check your inbox.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="w-full text-center text-sm text-gray-400 mt-4 hover:text-gray-600 transition-colors"
          >
            {resetLoading ? 'Sending...' : 'Forgot password?'}
          </button>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          New member?{' '}
          <Link
            href={`/club/${slug}/signup`}
            className="font-semibold"
            style={{ color: theme.primary }}
          >
            Create your account
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-8">
          Powered by{' '}
          <a href="https://birdiechart.golf" className="underline">Birdie Chart</a>
        </p>
      </div>
    </div>
  )
}
