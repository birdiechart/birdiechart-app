'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import BirdieLogo from '@/components/BirdieLogo'

interface SearchResult {
  id: string
  name: string
  formatted_address: string
  club_name?: string
  source: 'google' | 'golfapi'
  prefetchedHoles?: { hole_number: number; par: number; yardage: number }[]
  totalHoles?: number
}

interface Suggestion {
  place_id: string
  name: string
  address: string
}

export default function CoursesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [resultsLabel, setResultsLabel] = useState('')
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set())
  const [pendingResult, setPendingResult] = useState<SearchResult | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Autocomplete
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Request form
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestCourseName, setRequestCourseName] = useState('')
  const [requestLocation, setRequestLocation] = useState('')
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const acDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Init: auth + added courses + geolocation
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: userCourses } = await supabase
        .from('user_courses')
        .select('courses(name)')
        .eq('user_id', user.id)
      if (userCourses) {
        setAddedNames(new Set(
          userCourses
            .map((uc: { courses: unknown }) => {
              const c = Array.isArray(uc.courses) ? uc.courses[0] : uc.courses as { name: string } | null
              return c?.name || ''
            })
            .filter(Boolean)
        ))
      }
    }
    init()

    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently ignore if denied
      )
    }
  }, [router])

  // Load nearby courses once location is available and no query typed yet
  useEffect(() => {
    if (!location || query) return
    loadNearby()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  async function loadNearby() {
    setSearching(true)
    try {
      const { lat, lng } = location!
      const res = await fetch(`/api/courses/search?q=golf+course&lat=${lat}&lng=${lng}`)
      const data = await res.json()
      const nearby: SearchResult[] = (data.results || []).map((p: { place_id: string; name: string; formatted_address: string }) => ({
        id: p.place_id,
        name: p.name,
        formatted_address: p.formatted_address,
        source: 'google' as const,
      }))
      setResults(nearby)
      setResultsLabel('Nearby Courses')
    } catch { /* ignore */ }
    setSearching(false)
  }

  // Autocomplete as-you-type
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      if (!query && location) loadNearby()
      return
    }
    if (acDebounceRef.current) clearTimeout(acDebounceRef.current)
    acDebounceRef.current = setTimeout(async () => {
      const params = new URLSearchParams({ q: query })
      if (location) { params.set('lat', String(location.lat)); params.set('lng', String(location.lng)) }
      const res = await fetch(`/api/courses/autocomplete?${params}`)
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      setShowSuggestions((data.suggestions || []).length > 0)
    }, 200)
    return () => { if (acDebounceRef.current) clearTimeout(acDebounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Dismiss suggestions on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!suggestionsRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function selectSuggestion(s: Suggestion) {
    setQuery(s.name)
    setSuggestions([])
    setShowSuggestions(false)
    await runSearch(s.name)
  }

  async function runSearch(searchQuery: string) {
    if (!searchQuery.trim()) return
    setShowSuggestions(false)
    setSearching(true)
    setResultsLabel('Results')
    try {
      const firstWord = searchQuery.trim().split(/\s+/)[0]
      const needsSecondGolfSearch = firstWord.toLowerCase() !== searchQuery.trim().toLowerCase()
      const locParams = location ? `&lat=${location.lat}&lng=${location.lng}` : ''

      const [googleRes, golfRes, golfRes2] = await Promise.allSettled([
        fetch(`/api/courses/search?q=${encodeURIComponent(searchQuery)}${locParams}`).then(r => r.json()),
        fetch(`/api/courses/search-golf?q=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
        ...(needsSecondGolfSearch
          ? [fetch(`/api/courses/search-golf?q=${encodeURIComponent(firstWord)}`).then(r => r.json())]
          : [Promise.resolve({ results: [] })]),
      ])

      const googleResults: SearchResult[] = googleRes.status === 'fulfilled'
        ? (googleRes.value.results || []).map((p: { place_id: string; name: string; formatted_address: string }) => ({
            id: p.place_id, name: p.name, formatted_address: p.formatted_address, source: 'google' as const,
          }))
        : []

      type GolfRaw = { golfapi_id: number; name: string; club_name: string; formatted_address: string; holes: { hole_number: number; par: number; yardage: number }[]; total_holes: number }
      const mergedGolfRaw: GolfRaw[] = []
      const seenIds = new Set<number>()
      for (const res of [golfRes, golfRes2]) {
        if (res?.status === 'fulfilled') {
          for (const r of (res.value.results || []) as GolfRaw[]) {
            if (!seenIds.has(r.golfapi_id)) { seenIds.add(r.golfapi_id); mergedGolfRaw.push(r) }
          }
        }
      }

      const golfApiResults: SearchResult[] = mergedGolfRaw.map((r) => ({
        id: `golfapi_${r.golfapi_id}`, name: r.name, club_name: r.club_name,
        formatted_address: r.formatted_address, source: 'golfapi' as const,
        prefetchedHoles: r.holes, totalHoles: r.total_holes || r.holes?.length || 18,
      }))

      const filteredGoogleResults = googleResults.filter(g => {
        const gName = g.name.toLowerCase().trim()
        return !mergedGolfRaw.some(r => {
          const rName = r.name.toLowerCase().trim()
          return gName.includes(rName) || rName.includes(gName)
        })
      })

      setResults([...golfApiResults, ...filteredGoogleResults])
    } catch {
      setResults([])
    }
    setSearching(false)
  }

  async function addCourse(result: SearchResult, holeCount?: number) {
    setAdding(result.id)
    setPendingResult(null)
    const supabase = createClient()

    let { data: course } = await supabase.from('courses').select('*').eq('name', result.name).single()

    if (!course) {
      let holes = result.prefetchedHoles || []

      if (holes.length === 0 && result.source === 'google') {
        try {
          const holesRes = await fetch(`/api/courses/holes?name=${encodeURIComponent(result.name)}`)
          const holesData = await holesRes.json()
          if (holesData.holes?.length > 0) holes = holesData.holes
        } catch { /* ignore */ }
      }

      if (holes.length === 0 && !holeCount) {
        setPendingResult(result)
        setAdding(null)
        return
      }

      const totalHoles = holes.length || holeCount || 18
      const { data: newCourse } = await supabase
        .from('courses')
        .insert({ name: result.name, location: result.formatted_address, holes: totalHoles, is_landings: false })
        .select()
        .single()

      if (newCourse) {
        course = newCourse
        if (holes.length > 0) {
          await supabase.from('hole_details').insert(
            holes.map(h => ({ course_id: newCourse.id, hole_number: h.hole_number, par: h.par, yardage: h.yardage }))
          )
        }
      }
    }

    if (course) {
      await supabase.from('user_courses').upsert({ user_id: userId, course_id: course.id, added_at: new Date().toISOString() })
      router.push('/chart')
    }
    setAdding(null)
  }

  function openRequestForm() {
    setRequestCourseName(query)
    setRequestLocation('')
    setRequestSubmitted(false)
    setShowRequestForm(true)
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!requestCourseName.trim()) return
    setRequestSubmitting(true)
    try {
      await fetch('/api/course-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, course_name: requestCourseName.trim(), location: requestLocation.trim() }),
      })
    } catch { /* non-fatal */ }
    setRequestSubmitted(true)
    setRequestSubmitting(false)
  }

  // Suppress unused warning
  void debounceRef

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white safe-top" style={{ boxShadow: '0 1px 0 0 #e5e7eb' }}>
        <div className="px-4 pt-3 pb-3 flex items-center gap-2.5">
          <BirdieLogo iconOnly className="w-8 h-8" />
          <div>
            <h1 className="text-base font-bold leading-tight" style={{ color: '#1D6B3B', fontFamily: 'var(--font-playfair)' }}>Find Courses</h1>
            <p className="text-[11px] text-gray-400 leading-tight">Add any course to track your birdies</p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setShowSuggestions(false); runSearch(query) } if (e.key === 'Escape') setShowSuggestions(false) }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search by name or location..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-gray-50"
                autoComplete="off"
              />
              <button
                onClick={() => runSearch(query)}
                disabled={searching || !query.trim()}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ backgroundColor: '#1D6B3B' }}
              >
                {searching ? '...' : 'Search'}
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} className="absolute top-full left-0 right-12 z-30 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.place_id}
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s) }}
                    className="w-full flex flex-col px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    {s.address && <span className="text-xs text-gray-400 mt-0.5">{s.address}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {results.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{resultsLabel}</p>
              {query.length >= 2 && !searching && (
                <button onClick={openRequestForm} className="text-xs text-green-700 font-medium underline underline-offset-2">
                  Not listed? Request it
                </button>
              )}
            </div>
            <div className="space-y-2">
              {results.map((result) => {
                const added = addedNames.has(result.name)
                return (
                  <div key={result.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-semibold text-gray-900 text-sm">{result.name}</p>
                      {result.club_name && result.club_name !== result.name && (
                        <p className="text-xs text-gray-500 mt-0.5">{result.club_name}</p>
                      )}
                      {result.formatted_address && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{result.formatted_address}</p>
                      )}
                    </div>
                    {added ? (
                      <span className="text-xs font-semibold text-green-600 flex items-center gap-1 shrink-0">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6 L5 9 L10 3"/></svg>
                        Added
                      </span>
                    ) : (
                      <button onClick={() => addCourse(result)} disabled={adding === result.id}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60 shrink-0"
                        style={{ backgroundColor: '#1D6B3B' }}>
                        {adding === result.id ? '...' : 'Add'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          !searching && !location && (
            <p className="text-sm text-gray-400 text-center pt-16">Search for any golf course above</p>
          )
        )}
        {searching && (
          <p className="text-sm text-gray-400 text-center pt-16">Searching...</p>
        )}
      </div>

      {/* Holes count modal */}
      {pendingResult && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setPendingResult(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>How many holes?</h3>
            <p className="text-sm text-gray-500 mb-5">{pendingResult.name}</p>
            <div className="flex gap-3">
              <button onClick={() => addCourse(pendingResult, 9)}
                className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-lg font-bold text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors">9</button>
              <button onClick={() => addCourse(pendingResult, 18)}
                className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-lg font-bold text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors">18</button>
            </div>
          </div>
        </>
      )}

      {/* Course request modal */}
      {showRequestForm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => !requestSubmitting && setShowRequestForm(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-auto">
            {requestSubmitted ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D6B3B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Request received!</h3>
                <p className="text-sm text-gray-500 mb-5">We&apos;ll add <strong>{requestCourseName}</strong> and email you when it&apos;s ready.</p>
                <button onClick={() => setShowRequestForm(false)} className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: '#1D6B3B' }}>Done</button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>Request a course</h3>
                <p className="text-sm text-gray-400 mb-5">We&apos;ll add it within 24 hours and email you when it&apos;s live.</p>
                <form onSubmit={submitRequest} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Course name</label>
                    <input type="text" required value={requestCourseName} onChange={(e) => setRequestCourseName(e.target.value)}
                      placeholder="e.g. Augusta National Golf Club"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">City / location</label>
                    <input type="text" value={requestLocation} onChange={(e) => setRequestLocation(e.target.value)}
                      placeholder="e.g. Augusta, GA"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setShowRequestForm(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
                    <button type="submit" disabled={requestSubmitting || !requestCourseName.trim()}
                      className="flex-1 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                      style={{ backgroundColor: '#1D6B3B' }}>
                      {requestSubmitting ? 'Sending...' : 'Submit request'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </>
      )}

      <Navigation />
    </div>
  )
}
