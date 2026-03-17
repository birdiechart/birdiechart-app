'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getClubTheme } from '@/lib/club-themes'
import { LANDINGS_COURSES, TEE_OPTIONS, TeeOption } from '@/lib/landings-data'

// Reference yardages shown during tee selection (use Palmetto as the example)
const PALMETTO = LANDINGS_COURSES.find((c) => c.name === 'Palmetto')!
function totalYardage(tee: TeeOption) {
  return PALMETTO.holes.reduce((sum, h) => sum + h.tees[tee], 0)
}

const TEE_DESCRIPTIONS: Record<TeeOption, string> = {
  championship: 'Tournament / scratch players',
  tournament:   'Low-to-mid handicap men',
  club:         'Mid handicap / senior men',
  medal:        'High handicap / forward tees',
  course:       'Forward / senior forward tees',
  island:       'Short / beginner tees',
  skidaway:     'Shortest available tees',
}

export default function ClubSignupPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const theme = getClubTheme(slug)

  const [step, setStep] = useState<'account' | 'tee'>('account')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupCode, setSignupCode] = useState('')
  const [selectedTee, setSelectedTee] = useState<TeeOption>('tournament')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Verify signup code
    const supabase = createClient()
    const { data: club } = await supabase
      .from('clubs')
      .select('id, signup_code')
      .eq('slug', slug)
      .single()

    if (!club) {
      setError('Club not found.')
      setLoading(false)
      return
    }

    if (club.signup_code.toUpperCase() !== signupCode.trim().toUpperCase()) {
      setError('Invalid member code. Contact your golf shop for the correct code.')
      setLoading(false)
      return
    }

    setLoading(false)
    setStep('tee')
  }

  async function handleSignup() {
    setError('')
    setLoading(true)
    const supabase = createClient()

    // Create auth user
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, club_slug: slug } },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const userId = data.user.id

    // Wait for DB trigger to create profile
    await new Promise((r) => setTimeout(r, 600))

    // Get club
    const { data: club } = await supabase
      .from('clubs')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!club) { setError('Club not found.'); setLoading(false); return }

    // Set selected tee on profile
    await supabase
      .from('users')
      .update({ selected_tee: selectedTee, club_id: club.id })
      .eq('id', userId)

    // Join club
    await supabase
      .from('user_clubs')
      .upsert({ user_id: userId, club_id: club.id })

    // Auto-enroll in all 6 Landings courses
    for (const landingsCourse of LANDINGS_COURSES) {
      // Find or create the course
      let { data: existing } = await supabase
        .from('courses')
        .select('id')
        .eq('name', landingsCourse.name)
        .eq('is_landings', true)
        .single()

      if (!existing) {
        const { data: newCourse } = await supabase
          .from('courses')
          .insert({
            name: landingsCourse.name,
            location: landingsCourse.location,
            holes: 18,
            is_landings: true,
          })
          .select('id')
          .single()

        if (newCourse) {
          existing = newCourse
          // Insert hole details for all tees
          const holeRows = landingsCourse.holes.flatMap((h) =>
            TEE_OPTIONS.map((t) => ({
              course_id: newCourse.id,
              hole_number: h.hole_number,
              par: h.par,
              yardage: h.tees[t.value],
              tee_name: t.value,
            }))
          )
          await supabase.from('hole_details').insert(holeRows)
        }
      }

      if (existing) {
        await supabase
          .from('user_courses')
          .upsert({ user_id: userId, course_id: existing.id })
      }
    }

    router.push(`/club/${slug}`)
    router.refresh()
  }

  if (!theme) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.primaryLight }}>

      {/* Header */}
      <div style={{ backgroundColor: theme.primary }} className="safe-top">
        <div className="px-6 py-5 flex justify-center">
          <img
            src="/landings-logo.svg"
            alt="The Landings"
            className="h-8 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['account', 'tee'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: step === s || (s === 'account' && step === 'tee') ? theme.primary : '#e5e7eb',
                  color: step === s || (s === 'account' && step === 'tee') ? '#fff' : '#9ca3af',
                }}
              >
                {s === 'account' && step === 'tee' ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium" style={{ color: step === s ? theme.primary : '#9ca3af' }}>
                {s === 'account' ? 'Account' : 'Your Tees'}
              </span>
              {i === 0 && <div className="w-6 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {step === 'account' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                Create Your Account
              </h1>
              <p className="text-sm text-gray-500 mt-1">Members only — you&apos;ll need your member code</p>
            </div>

            <form onSubmit={handleAccountStep} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none text-base"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none text-base"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none text-base"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Code</label>
                <input
                  type="text"
                  required
                  value={signupCode}
                  onChange={(e) => setSignupCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none text-base tracking-widest font-mono"
                  placeholder="XXXXXX"
                  maxLength={8}
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">Available from the golf shop</p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-base disabled:opacity-60"
                style={{ backgroundColor: theme.primary }}
              >
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href={`/club/${slug}/login`} className="font-semibold" style={{ color: theme.primary }}>
                Sign in
              </Link>
            </p>
          </>
        )}

        {step === 'tee' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                Which tees do you play?
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Yardages shown are for Palmetto. You can change this anytime in settings.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {TEE_OPTIONS.map((tee) => {
                const yards = totalYardage(tee.value)
                const isSelected = selectedTee === tee.value
                return (
                  <button
                    key={tee.value}
                    type="button"
                    onClick={() => setSelectedTee(tee.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 bg-white text-left transition-all"
                    style={{
                      borderColor: isSelected ? theme.primary : '#e5e7eb',
                      boxShadow: isSelected ? `0 0 0 1px ${theme.primary}` : 'none',
                    }}
                  >
                    {/* Tee color dot */}
                    <div
                      className="w-5 h-5 rounded-full shrink-0"
                      style={{ backgroundColor: tee.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{tee.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{TEE_DESCRIPTIONS[tee.value]}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: isSelected ? theme.primary : '#6b7280' }}>
                        {yards.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400">yards</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: theme.primary }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base disabled:opacity-60"
              style={{ backgroundColor: theme.primary }}
            >
              {loading ? 'Setting up your chart...' : 'Start My Birdie Chart'}
            </button>

            <button
              onClick={() => { setStep('account'); setError('') }}
              className="w-full text-center text-sm text-gray-400 mt-4 py-2"
            >
              ← Back
            </button>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Powered by{' '}
          <a href="https://birdiechart.golf" className="underline">Birdie Chart</a>
        </p>
      </div>
    </div>
  )
}
