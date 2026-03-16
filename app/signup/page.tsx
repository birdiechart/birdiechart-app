'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import BirdieLogo from '@/components/BirdieLogo'

interface CourseSuggestion {
  id: string
  name: string
  address: string
  source: 'google' | 'golfapi'
  prefetchedHoles?: { hole_number: number; par: number; yardage: number }[]
  totalHoles?: number
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clubSlug = searchParams.get('club')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [homeCourse, setHomeCourse] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<CourseSuggestion | null>(null)
  const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (homeCourse.length < 2 || selectedCourse) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const firstWord = homeCourse.trim().split(/\s+/)[0]
        const needsSecondSearch = firstWord.toLowerCase() !== homeCourse.trim().toLowerCase()

        const [googleRes, golfRes, golfRes2] = await Promise.allSettled([
          fetch(`/api/courses/autocomplete?q=${encodeURIComponent(homeCourse)}`).then(r => r.json()),
          fetch(`/api/courses/search-golf?q=${encodeURIComponent(homeCourse)}`).then(r => r.json()),
          ...(needsSecondSearch
            ? [fetch(`/api/courses/search-golf?q=${encodeURIComponent(firstWord)}`).then(r => r.json())]
            : [Promise.resolve({ results: [] })]),
        ])

        const googleSuggestions: CourseSuggestion[] = googleRes.status === 'fulfilled'
          ? (googleRes.value.suggestions || []).map((s: { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }; text?: { text: string } } }) => ({
              id: s.placePrediction?.placeId || '',
              name: s.placePrediction?.structuredFormat?.mainText?.text || s.placePrediction?.text?.text || '',
              address: s.placePrediction?.structuredFormat?.secondaryText?.text || '',
              source: 'google' as const,
            })).filter((s: CourseSuggestion) => s.name)
          : []

        type GolfRaw = { golfapi_id: number; name: string; club_name?: string; formatted_address: string; holes: { hole_number: number; par: number; yardage: number }[]; total_holes: number }
        const mergedGolfRaw: GolfRaw[] = []
        const seenIds = new Set<number>()
        for (const res of [golfRes, golfRes2]) {
          if (res?.status === 'fulfilled') {
            for (const r of (res.value.results || []) as GolfRaw[]) {
              if (!seenIds.has(r.golfapi_id)) {
                seenIds.add(r.golfapi_id)
                mergedGolfRaw.push(r)
              }
            }
          }
        }

        const golfSuggestions: CourseSuggestion[] = mergedGolfRaw.map(r => ({
          id: `golfapi_${r.golfapi_id}`,
          name: r.name,
          address: r.formatted_address,
          source: 'golfapi' as const,
          prefetchedHoles: r.holes,
          totalHoles: r.total_holes || r.holes?.length || 18,
        }))

        // Prefer GolfAPI — drop Google suggestions that overlap
        const filteredGoogle = googleSuggestions.filter(g => {
          const gName = g.name.toLowerCase()
          return !mergedGolfRaw.some(r => {
            const rName = r.name.toLowerCase()
            return gName.includes(rName) || rName.includes(gName)
          })
        })

        const merged = [...golfSuggestions, ...filteredGoogle].slice(0, 8)
        setSuggestions(merged)
        setShowSuggestions(merged.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [homeCourse, selectedCourse])

  function handleSuggestionSelect(s: CourseSuggestion) {
    setHomeCourse(s.name)
    setSelectedCourse(s)
    setSuggestions([])
    setShowSuggestions(false)
  }

  async function addHomeCourse(userId: string, course: CourseSuggestion) {
    const supabase = createClient()

    let { data: existing } = await supabase
      .from('courses')
      .select('*')
      .eq('name', course.name)
      .single()

    if (!existing) {
      let holes = course.prefetchedHoles || []

      if (holes.length === 0 && course.source === 'google') {
        try {
          const holesRes = await fetch(`/api/courses/holes?name=${encodeURIComponent(course.name)}`)
          const holesData = await holesRes.json()
          if (holesData.holes?.length > 0) holes = holesData.holes
        } catch { /* ignore */ }
      }

      const totalHoles = holes.length || course.totalHoles || 18

      const { data: newCourse } = await supabase
        .from('courses')
        .insert({ name: course.name, location: course.address, holes: totalHoles, is_landings: false })
        .select()
        .single()

      if (newCourse) {
        existing = newCourse
        if (holes.length > 0) {
          await supabase.from('hole_details').insert(
            holes.map((h: { hole_number: number; par: number; yardage: number }) => ({
              course_id: newCourse.id,
              hole_number: h.hole_number,
              par: h.par,
              yardage: h.yardage,
            }))
          )
        }
      }
    }

    if (existing) {
      await supabase.from('user_courses').upsert({
        user_id: userId,
        course_id: existing.id,
        added_at: new Date().toISOString(),
      })
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, home_course: homeCourse, club_slug: clubSlug },
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Wait for DB trigger to create profile
      await new Promise((r) => setTimeout(r, 500))

      // Add home course if selected
      if (selectedCourse) {
        await addHomeCourse(data.user.id, selectedCourse)
      }

      // Handle club membership
      if (clubSlug) {
        const { data: club } = await supabase
          .from('clubs')
          .select('id')
          .eq('slug', clubSlug)
          .single()

        if (club) {
          await supabase.from('user_clubs').insert({ user_id: data.user.id, club_id: club.id })
          await supabase.from('users').update({ club_id: club.id }).eq('id', data.user.id)
        }
      }

      router.push('/chart')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <BirdieLogo iconOnly className="w-14 h-14 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>Birdie Chart</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {clubSlug ? `Join as a club member` : 'Start your birdie quest'}
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-base"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-base"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-base"
              placeholder="Min. 8 characters"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Home Course</label>
            <input
              type="text"
              required
              value={homeCourse}
              onChange={(e) => { setHomeCourse(e.target.value); setSelectedCourse(null) }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-base"
              placeholder="Search your home course..."
              autoComplete="off"
            />
            {selectedCourse && (
              <p className="text-xs text-gray-400 mt-1 ml-1">{selectedCourse.address}</p>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSuggestionSelect(s)}
                    className="w-full flex flex-col px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    {s.address && <span className="text-xs text-gray-400 mt-0.5">{s.address}</span>}
                  </button>
                ))}
              </div>
            )}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold" style={{ color: '#1D6B3B' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignupForm />
    </Suspense>
  )
}
