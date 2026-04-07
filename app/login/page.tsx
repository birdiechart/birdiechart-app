'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import BirdieLogo from '@/components/BirdieLogo'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('return') || '/chart'
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(returnTo)
      router.refresh()
    }
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-sm mx-auto w-full">
          <div className="text-center mb-10">
            <BirdieLogo iconOnly className="w-14 h-14 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-900 mt-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              Welcome back
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-base"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-base"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#1D6B3B' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold" style={{ color: '#1D6B3B' }}>
              Sign up
            </Link>
          </p>
          <button
            onClick={() => setShowLogin(false)}
            className="text-center text-sm text-gray-400 mt-4 w-full"
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col px-6 pt-14 pb-8 max-w-lg mx-auto w-full">

        {/* Logo */}
        <div className="mb-10">
          <BirdieLogo iconOnly className="w-16 h-16 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Birdie Chart
          </h1>
          <p className="text-gray-400 text-sm mt-1 tracking-wide uppercase font-medium">One birdie at a time.</p>
        </div>

        {/* Headline */}
        <p
          className="text-xl font-semibold text-gray-700 leading-snug mb-5"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          A new reason to love every round.
        </p>

        <p className="text-gray-500 text-base leading-relaxed mb-5">
          Golf stats can feel heavy. Improvement takes time. Sometimes it&apos;s better to forget the numbers and just celebrate a birdie.
        </p>

        <p className="text-gray-700 font-medium text-base mb-6">
          That&apos;s what Birdie Chart is for.
        </p>

        <p className="text-gray-500 text-base leading-relaxed mb-5">
          Every hole on your course is laid out in a simple chart. Check them off one at a time until you&apos;ve birdied them all.
        </p>

        <p className="text-gray-500 text-base leading-relaxed mb-10">
          It started as a hand-drawn chart to keep my kids motivated on tough days. Knowing you&apos;ve birdied that hole before — or knowing you still can — is sometimes all you need to stay in the round and come back tomorrow.
        </p>

        {/* How it works */}
        <div className="space-y-4 mb-10">
          {[
            { icon: '⛳', text: 'Add any course and start your own birdie chart' },
            { icon: '🐦', text: 'Log a birdie the moment it happens — or a par if you want to track progress' },
            { icon: '📊', text: 'No complicated stats. Just a simple chart to track the holes you\'ve birdied' },
            { icon: '✅', text: 'Watch your chart fill up one box at a time' },
            { icon: '🏆', text: 'Race your friends to complete their chart first' },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{item.icon}</span>
              <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="space-y-3 mb-8">
          <Link
            href="/signup"
            className="block w-full py-3.5 rounded-xl text-white font-semibold text-base text-center"
            style={{ backgroundColor: '#1D6B3B' }}
          >
            Start Your Birdie Chart — Free
          </Link>
          <button
            onClick={() => setShowLogin(true)}
            className="block w-full py-3.5 rounded-xl font-semibold text-base text-center border border-gray-200 text-gray-700"
          >
            Sign In
          </button>
        </div>

        {/* Club CTA */}
        <div
          className="rounded-2xl p-5 mb-8"
          style={{ backgroundColor: '#f0faf4', borderLeft: '3px solid #1D6B3B' }}
        >
          <p className="text-sm font-semibold text-gray-900 mb-1">Want a Birdie Chart for your club?</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            We&apos;ll set up a private chart for your course with a leaderboard so your members can see who&apos;s closest to completing their birdie chart. Friendly competition, zero pressure.
          </p>
        </div>


      </div>
    </div>
  )
}
