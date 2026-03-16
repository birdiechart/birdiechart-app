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
  const [adding, setAdding] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [pendingResult, setPendingResult] = useState<SearchResult | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
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
    try {
      const firstWord = searchQuery.trim().split(/\s+/)[0]
      const needsSecondGolfSearch = firstWord.toLowerCase() !== searchQuery.trim().toLowerCase()

      const [googleRes, golfRes, golfRes2] = await Promise.allSettled([
        fetch(`/api/courses/search?q=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
        fetch(`/api/courses/search-golf?q=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
        ...(needsSecondGolfSearch
          ? [fetch(`/api/courses/search-golf?q=${encodeURIComponent(firstWord)}`).then(r => r.json())]
          : [Promise.resolve({ results: [] })]),
      ])

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

      // Prefer GolfAPI results (they have par data) — drop Google results that overlap
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
    setPendingResult(null)
    const supabase = createClient()

    // Check if already in DB
    let { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('name', result.name)
      .single()

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

      // No hole data and no holeCount — ask user
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
      await supabase.from('user_courses').upsert({
        user_id: userId,
        course_id: course.id,
        added_at: new Date().toISOString(),
      })
      onCourseAdded(course)
    }
    setAdding(null)
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
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Search Results</p>
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

        {!query.trim() && !results.length && (
          <p className="text-sm text-gray-400 text-center pt-8">Search for any golf course above</p>
        )}
      </div>

      {/* Holes count modal */}
      {pendingResult && (
        <>
          <div className="absolute inset-0 bg-black/40 z-10" onClick={() => setPendingResult(null)} />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
              How many holes?
            </h3>
            <p className="text-sm text-gray-500 mb-5">{pendingResult.name}</p>
            <div className="flex gap-3">
              <button
                onClick={() => addCourse(pendingResult, 9)}
                className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-lg font-bold text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors"
              >
                9
              </button>
              <button
                onClick={() => addCourse(pendingResult, 18)}
                className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-lg font-bold text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors"
              >
                18
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
