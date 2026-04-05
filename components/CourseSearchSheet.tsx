'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Course } from '@/lib/types'

interface CourseSearchSheetProps {
  userId: string
  onClose: () => void
  onCourseAdded: (course: Course) => void
}

interface Suggestion {
  place_id: string
  name: string
  address: string
}

interface SearchResult {
  id: string
  name: string
  formatted_address: string
  club_name?: string
  source: 'google' | 'golfapi'
  prefetchedHoles?: { hole_number: number; par: number; yardage: number }[]
  totalHoles?: number
}

export default function CourseSearchSheet({ userId, onClose, onCourseAdded }: CourseSearchSheetProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Course request state
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestCourseName, setRequestCourseName] = useState('')
  const [requestLocation, setRequestLocation] = useState('')
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      setHasSearched(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { runSearch(query) }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  async function runSearch(searchQuery: string) {
    setShowSuggestions(false)
    setSearching(true)
    setHasSearched(false)
    try {
      const supabase = createClient()
      const firstWord = searchQuery.trim().split(/\s+/)[0]
      const needsSecondGolfSearch = firstWord.toLowerCase() !== searchQuery.trim().toLowerCase()

      const [googleRes, golfRes, golfRes2, dbRes] = await Promise.allSettled([
        fetch(`/api/courses/search?q=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
        fetch(`/api/courses/search-golf?q=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
        ...(needsSecondGolfSearch
          ? [fetch(`/api/courses/search-golf?q=${encodeURIComponent(firstWord)}`).then(r => r.json())]
          : [Promise.resolve({ results: [] })]),
        supabase.from('courses').select('id, name, location').limit(200),
      ])

      // All DB courses — used for both display and dedup
      const allDbCourses: { id: string; name: string; location: string }[] =
        dbRes.status === 'fulfilled' && dbRes.value.data ? dbRes.value.data : []

      const skipWords = new Set(['golf', 'course', 'club', 'the', 'and', 'at', 'of', 'a'])
      function keyWords(s: string) {
        return s.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !skipWords.has(w))
      }

      // DB results to display: those with keyword overlap to the search query
      const searchWords = keyWords(searchQuery)
      const dbResults: SearchResult[] = allDbCourses
        .filter(c => {
          const cWords = keyWords(c.name)
          return searchWords.some(w => cWords.includes(w)) || cWords.some(w => searchWords.includes(w))
        })
        .map(c => ({
          id: `db_${c.id}`,
          name: c.name,
          formatted_address: c.location,
          source: 'golfapi' as const,
        }))

      // Use ALL DB courses for dedup — prevents Google/GolfAPI duplicates
      function overlapsDb(name: string) {
        const words = keyWords(name)
        return allDbCourses.some(c => {
          const dbWords = keyWords(c.name)
          return words.some(w => dbWords.includes(w)) || dbWords.some(w => words.includes(w))
        })
      }

      const googleResults: SearchResult[] = googleRes.status === 'fulfilled'
        ? (googleRes.value.results || []).map((p: { place_id: string; name: string; formatted_address: string }) => ({
            id: p.place_id,
            name: p.name,
            formatted_address: p.formatted_address,
            source: 'google' as const,
          }))
        : []

      type GolfRaw = { golfapi_id: number; name: string; club_name: string; formatted_address: string; holes: { hole_number: number; par: number; yardage: number }[]; total_holes: number }
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

      const golfApiResults: SearchResult[] = mergedGolfRaw.map((r) => ({
        id: `golfapi_${r.golfapi_id}`,
        name: r.name,
        club_name: r.club_name,
        formatted_address: r.formatted_address,
        source: 'golfapi' as const,
        prefetchedHoles: r.holes,
        totalHoles: r.total_holes || r.holes?.length || 18,
      }))

      const filteredGoogleResults = googleResults.filter(g => !overlapsDb(g.name))
      const filteredGolfApi = golfApiResults.filter(g => !overlapsDb(g.name))

      setResults([...dbResults, ...filteredGolfApi, ...filteredGoogleResults])
    } catch {
      setResults([])
    }
    setHasSearched(true)
    setSearching(false)
  }

  async function handleSuggestionSelect(suggestion: Suggestion) {
    setQuery(suggestion.name)
    await runSearch(suggestion.name)
  }

  async function searchCourses() {
    if (!query.trim()) return
    await runSearch(query)
  }

  async function addCourse(result: SearchResult, holeCount?: number) {
    setAdding(result.id)
    const supabase = createClient()

    // If result came from DB search, look up directly by ID
    if (result.id.startsWith('db_')) {
      const dbId = result.id.replace('db_', '')
      const { data: dbCourse } = await supabase.from('courses').select('*').eq('id', dbId).single()
      if (dbCourse) {
        await supabase.from('user_courses').upsert({ user_id: userId, course_id: dbCourse.id, added_at: new Date().toISOString() })
        onCourseAdded(dbCourse)
        setAdding(null)
        return
      }
    }

    // Check if already in DB — exact match first, then partial (handles renamed courses)
    let { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('name', result.name)
      .single()

    if (!course) {
      const { data: fuzzyMatch } = await supabase
        .from('courses')
        .select('*')
        .ilike('name', `%${result.name}%`)
        .limit(1)
      if (fuzzyMatch && fuzzyMatch.length > 0) course = fuzzyMatch[0]
    }

    if (!course) {
      let holes = result.prefetchedHoles || []

      // For Google results without prefetched holes, try GolfCourseAPI
      if (holes.length === 0 && result.source === 'google') {
        try {
          const holesRes = await fetch(`/api/courses/holes?name=${encodeURIComponent(result.name)}`)
          const holesData = await holesRes.json()
          if (holesData.holes?.length > 0) holes = holesData.holes
        } catch { /* ignore */ }
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
      await supabase.from('user_courses').upsert({
        user_id: userId,
        course_id: course.id,
        added_at: new Date().toISOString(),
      })
      onCourseAdded(course)
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
        body: JSON.stringify({
          user_id: userId,
          course_name: requestCourseName.trim(),
          location: requestLocation.trim(),
        }),
      })
      setRequestSubmitted(true)
    } catch {
      // Still show success — the request may have saved even if email failed
      setRequestSubmitted(true)
    }
    setRequestSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
          Add a Course
        </h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13"/>
            <line x1="13" y1="1" x2="1" y2="13"/>
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCourses()}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search any golf course..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#1D6B3B' } as React.CSSProperties}
            autoComplete="off"
          />
          <button
            onClick={searchCourses}
            disabled={searching}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: '#1D6B3B' }}
          >
            {searching ? '...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mb-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                onClick={() => handleSuggestionSelect(s)}
                className="w-full flex flex-col px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm font-medium text-gray-900">{s.name}</span>
                {s.address && <span className="text-xs text-gray-400 mt-0.5">{s.address}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Search results */}
        {results.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Search Results</p>
              {query.length >= 3 && !searching && (
                <button onClick={openRequestForm} className="text-xs text-green-700 font-medium underline underline-offset-2">
                  Not listed? Request it
                </button>
              )}
            </div>
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{result.name}</p>
                    </div>
                    {result.club_name && result.club_name !== result.name && (
                      <p className="text-xs text-gray-500 mt-0.5">{result.club_name}</p>
                    )}
                    {result.formatted_address && (
                      <p className="text-xs text-gray-400 mt-0.5">{result.formatted_address}</p>
                    )}
                  </div>
                  <button
                    onClick={() => addCourse(result)}
                    disabled={adding === result.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60 shrink-0"
                    style={{ backgroundColor: '#1D6B3B' }}
                  >
                    {adding === result.id ? '...' : 'Add'}
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}


        {!query.trim() && !results.length && !hasSearched && (
          <p className="text-sm text-gray-400 text-center pt-8">Search for any golf course above</p>
        )}
      </div>


      {/* Course request modal */}
      {showRequestForm && (
        <>
          <div className="absolute inset-0 bg-black/40 z-10" onClick={() => !requestSubmitting && setShowRequestForm(false)} />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 bg-white rounded-2xl p-6 shadow-2xl">
            {requestSubmitted ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D6B3B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Request received!
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  We&apos;ll add <strong>{requestCourseName}</strong> and send you an email when it&apos;s ready.
                </p>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ backgroundColor: '#1D6B3B' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Request a course
                </h3>
                <p className="text-sm text-gray-400 mb-5">We&apos;ll add it within 24 hours and email you when it&apos;s live.</p>
                <form onSubmit={submitRequest} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Course name</label>
                    <input
                      type="text"
                      required
                      value={requestCourseName}
                      onChange={(e) => setRequestCourseName(e.target.value)}
                      placeholder="e.g. Augusta National Golf Club"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#1D6B3B' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">City / location</label>
                    <input
                      type="text"
                      value={requestLocation}
                      onChange={(e) => setRequestLocation(e.target.value)}
                      placeholder="e.g. Augusta, GA"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#1D6B3B' } as React.CSSProperties}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={requestSubmitting || !requestCourseName.trim()}
                      className="flex-1 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                      style={{ backgroundColor: '#1D6B3B' }}
                    >
                      {requestSubmitting ? 'Sending...' : 'Submit request'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
