'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import BirdieLogo from '@/components/BirdieLogo'

interface StatCourse {
  id: string
  name: string
  totalHoles: number
  birdiedHoles: number
  eagledHoles: number
  completed: boolean
  isArchived: boolean
  archivedDate: string | null
}

interface ParDist {
  par: number
  count: number
  pct: number
}

interface TopHole {
  hole_number: number
  course_name: string
  count: number
}

interface MonthStat {
  month: string
  count: number
}

export default function StatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasClub, setHasClub] = useState(false)
  const [totalBirdies, setTotalBirdies] = useState(0)
  const [totalEagles, setTotalEagles] = useState(0)
  const [courseStats, setCourseStats] = useState<StatCourse[]>([])
  const [parDist, setParDist] = useState<ParDist[]>([])
  const [topHole, setTopHole] = useState<TopHole | null>(null)
  const [bestMonth, setBestMonth] = useState<MonthStat | null>(null)
  const [firstBirdie, setFirstBirdie] = useState<{ date: string; course: string; hole: number } | null>(null)
  const [latestBirdie, setLatestBirdie] = useState<{ date: string; course: string; hole: number } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }

      const { data: profile } = await supabase.from('users').select('club_id').eq('id', authUser.id).single()
      setHasClub(!!profile?.club_id)

      const { data: scores } = await supabase
        .from('hole_scores').select('*').eq('user_id', authUser.id).order('scored_at', { ascending: true })

      const { data: userCourses } = await supabase
        .from('user_courses').select('course_id, courses(*)').eq('user_id', authUser.id)

      const courseIds = (userCourses || []).map((uc: { course_id: string }) => uc.course_id)
      const { data: holeDetails } = courseIds.length > 0
        ? await supabase.from('hole_details').select('*').in('course_id', courseIds)
        : { data: [] }

      if (!scores || scores.length === 0) { setLoading(false); return }

      const birdiesAndEagles = scores.filter(s => s.score_type === 'birdie' || s.score_type === 'eagle')

      setTotalBirdies(scores.filter(s => s.score_type === 'birdie').length)
      setTotalEagles(scores.filter(s => s.score_type === 'eagle').length)

      // Load season history per course
      const seasonHistoryMap = new Map<string, { ended_at: string }[]>()
      const { data: seasonHistoryData } = await supabase
        .from('season_history')
        .select('course_id, ended_at')
        .eq('user_id', authUser.id)
        .order('ended_at', { ascending: true })
      if (seasonHistoryData) {
        for (const row of seasonHistoryData) {
          const existing = seasonHistoryMap.get(row.course_id) || []
          existing.push({ ended_at: row.ended_at })
          seasonHistoryMap.set(row.course_id, existing)
        }
      }

      // Course stats
      const courseMap = new Map<string, { name: string; holes: number }>()
      for (const uc of (userCourses || [])) {
        const course = Array.isArray(uc.courses) ? uc.courses[0] : uc.courses as { id: string; name: string; holes: number } | null
        if (course) courseMap.set(course.id, { name: course.name, holes: course.holes || 18 })
      }
      const cStats: StatCourse[] = []
      for (const [id, c] of courseMap) {
        const history = seasonHistoryMap.get(id) || [] // sorted ascending by ended_at
        const courseScores = birdiesAndEagles.filter(s => s.course_id === id)

        if (history.length === 0) {
          // No resets — just show all scores as current season
          if (courseScores.length > 0) {
            const birdied = new Set(courseScores.map(s => s.hole_number))
            const eagled = new Set(courseScores.filter(s => s.score_type === 'eagle').map(s => s.hole_number))
            cStats.push({
              id, name: c.name, totalHoles: c.holes,
              birdiedHoles: birdied.size, eagledHoles: eagled.size,
              completed: birdied.size >= c.holes,
              isArchived: false, archivedDate: null,
            })
          }
        } else {
          // Current season: scores after the last reset
          const latestCutoff = history[history.length - 1].ended_at
          const currScores = courseScores.filter(s => s.scored_at >= latestCutoff)
          const currBirdied = new Set(currScores.map(s => s.hole_number))
          const currEagled = new Set(currScores.filter(s => s.score_type === 'eagle').map(s => s.hole_number))
          cStats.push({
            id, name: c.name, totalHoles: c.holes,
            birdiedHoles: currBirdied.size, eagledHoles: currEagled.size,
            completed: currBirdied.size >= c.holes,
            isArchived: false, archivedDate: null,
          })

          // One entry per completed season, most recent first
          for (let i = history.length - 1; i >= 0; i--) {
            const periodEnd = history[i].ended_at
            const periodStart = i > 0 ? history[i - 1].ended_at : null
            const periodScores = periodStart
              ? courseScores.filter(s => s.scored_at >= periodStart && s.scored_at < periodEnd)
              : courseScores.filter(s => s.scored_at < periodEnd)
            const periodBirdied = new Set(periodScores.map(s => s.hole_number))
            const periodEagled = new Set(periodScores.filter(s => s.score_type === 'eagle').map(s => s.hole_number))
            if (periodBirdied.size > 0) {
              const seasonNum = i + 1
              const dateLabel = new Date(periodEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              cStats.push({
                id: `${id}_season_${i}`, name: c.name, totalHoles: c.holes,
                birdiedHoles: periodBirdied.size, eagledHoles: periodEagled.size,
                completed: periodBirdied.size >= c.holes,
                isArchived: true, archivedDate: `Season ${seasonNum} · ${dateLabel}`,
              })
            }
          }
        }
      }
      // Current entries first, archived below sorted most recent first (already added in order)
      setCourseStats(cStats.sort((a, b) => {
        if (a.isArchived !== b.isArchived) return a.isArchived ? 1 : -1
        return b.birdiedHoles - a.birdiedHoles
      }))

      // Par distribution — of all birdies made, what par were those holes?
      const parCount = new Map<number, number>()
      for (const s of birdiesAndEagles) {
        const detail = (holeDetails || []).find(
          (h: { course_id: string; hole_number: number }) => h.course_id === s.course_id && h.hole_number === s.hole_number
        )
        if (!detail) continue
        const p = (detail as { par: number }).par
        parCount.set(p, (parCount.get(p) || 0) + 1)
      }
      const totalWithPar = Array.from(parCount.values()).reduce((a, b) => a + b, 0)
      if (totalWithPar > 0) {
        const dist: ParDist[] = []
        for (const [par, count] of parCount) {
          dist.push({ par, count, pct: Math.round((count / totalWithPar) * 100) })
        }
        setParDist(dist.sort((a, b) => a.par - b.par))
      }

      // Top hole
      const holeCount = new Map<string, number>()
      for (const s of birdiesAndEagles) {
        const key = `${s.course_id}|${s.hole_number}`
        holeCount.set(key, (holeCount.get(key) || 0) + 1)
      }
      let topKey = '', topCount = 0
      for (const [key, count] of holeCount) {
        if (count > topCount) { topKey = key; topCount = count }
      }
      if (topKey) {
        const [cId, hNum] = topKey.split('|')
        const uc = (userCourses || []).find((u: { course_id: string; courses: unknown }) => u.course_id === cId)
        const courseName = uc ? (Array.isArray(uc.courses) ? (uc.courses[0] as { name: string })?.name : (uc.courses as { name: string })?.name) : 'Unknown'
        setTopHole({ hole_number: parseInt(hNum), course_name: courseName, count: topCount })
      }

      // Best month
      const monthMap = new Map<string, number>()
      for (const s of birdiesAndEagles) {
        const month = new Date(s.scored_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        monthMap.set(month, (monthMap.get(month) || 0) + 1)
      }
      let bestM = '', bestMCount = 0
      for (const [m, count] of monthMap) {
        if (count > bestMCount) { bestM = m; bestMCount = count }
      }
      if (bestM) setBestMonth({ month: bestM, count: bestMCount })

      // First + latest
      const sorted = [...birdiesAndEagles]
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const getCourseName = (cId: string) => {
        const uc = (userCourses || []).find((u: { course_id: string; courses: unknown }) => u.course_id === cId)
        return uc ? (Array.isArray(uc.courses) ? (uc.courses[0] as { name: string })?.name : (uc.courses as { name: string })?.name) ?? 'Unknown' : 'Unknown'
      }
      if (first) setFirstBirdie({ date: new Date(first.scored_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), course: getCourseName(first.course_id), hole: first.hole_number })
      if (last && last.id !== first?.id) setLatestBirdie({ date: new Date(last.scored_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), course: getCourseName(last.course_id), hole: last.hole_number })

      setLoading(false)
    }
    load()
  }, [router])

  const favoritePar = parDist.length > 0 ? parDist.reduce((a, b) => a.count > b.count ? a : b) : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#1D6B3B', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const hasData = totalBirdies > 0 || totalEagles > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white safe-top" style={{ boxShadow: '0 1px 0 0 #e5e7eb' }}>
        <div className="px-4 pt-3 pb-3 flex items-center gap-2.5">
          <BirdieLogo iconOnly className="w-8 h-8" />
          <h1 className="text-base font-bold" style={{ color: '#1D6B3B', fontFamily: 'var(--font-playfair)' }}>My Stats</h1>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>No stats yet</h2>
          <p className="text-gray-500 text-sm">Start logging birdies and your stats will show up here.</p>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-4">

          {/* Totals */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-4xl font-bold" style={{ color: '#1D6B3B' }}>{totalBirdies}</p>
              <p className="text-sm text-gray-500 mt-1">Total Birdies</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-4xl font-bold" style={{ color: '#134d2a' }}>{totalEagles}</p>
              <p className="text-sm text-gray-500 mt-1">Total Eagles</p>
            </div>
          </div>

          {/* Par distribution */}
          {favoritePar && (
            <div className="space-y-3">
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#1D6B3B' }}>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Your Sweet Spot</p>
                <p className="text-white text-2xl font-bold mb-0.5">Par {favoritePar.par}</p>
                <p className="text-white/80 text-sm">
                  {favoritePar.count} of your {totalBirdies + totalEagles} birdies came on par {favoritePar.par}s ({favoritePar.pct}%)
                </p>
              </div>
              {parDist.length > 1 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Birdies by Par</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {parDist.map((p) => (
                      <div key={p.par} className="rounded-xl p-3 text-center" style={{ backgroundColor: p.par === favoritePar.par ? '#dcfce7' : '#f9fafb' }}>
                        <p className="text-xs text-gray-500 mb-1">Par {p.par}</p>
                        <p className="text-xl font-bold" style={{ color: p.par === favoritePar.par ? '#1D6B3B' : '#374151' }}>{p.count}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.pct}% of total</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Course breakdown */}
          {courseStats.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-3">By Course</h3>
              <div className="space-y-4">
                {courseStats.map((c) => {
                  const pct = Math.round((c.birdiedHoles / c.totalHoles) * 100)
                  const barColor = c.isArchived ? '#d1d5db' : (c.completed ? '#134d2a' : '#1D6B3B')
                  const scoreColor = c.isArchived ? '#9ca3af' : '#1D6B3B'
                  return (
                    <div key={c.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {c.completed && <span className="text-base shrink-0">🏆</span>}
                          <span className={`text-sm font-medium truncate ${c.isArchived ? 'text-gray-400' : 'text-gray-800'}`}>{c.name}</span>
                          {c.isArchived && c.archivedDate && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 shrink-0 whitespace-nowrap">
                              {c.archivedDate}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold shrink-0 ml-2" style={{ color: scoreColor }}>{c.birdiedHoles}/{c.totalHoles}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                      {c.completed && !c.isArchived && (
                        <p className="text-xs font-semibold mt-1" style={{ color: '#134d2a' }}>Every hole birdied!</p>
                      )}
                      {c.completed && c.isArchived && (
                        <p className="text-xs text-gray-400 mt-1">Every hole birdied!</p>
                      )}
                      {!c.completed && !c.isArchived && c.eagledHoles > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{c.eagledHoles} eagle{c.eagledHoles > 1 ? 's' : ''}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Fun Facts */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Fun Facts</h3>
            <div className="space-y-3">
              {topHole && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">❤️</span>
                  <p className="text-sm text-gray-700">
                    Your favorite hole is <span className="font-semibold">Hole {topHole.hole_number} at {topHole.course_name}</span> — birdied {topHole.count} time{topHole.count > 1 ? 's' : ''}
                  </p>
                </div>
              )}
              {bestMonth && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔥</span>
                  <p className="text-sm text-gray-700">
                    Best month: <span className="font-semibold">{bestMonth.month}</span> with {bestMonth.count} birdie{bestMonth.count > 1 ? 's' : ''}
                  </p>
                </div>
              )}
              {firstBirdie && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">⭐</span>
                  <p className="text-sm text-gray-700">
                    First birdie: <span className="font-semibold">Hole {firstBirdie.hole} at {firstBirdie.course}</span> on {firstBirdie.date}
                  </p>
                </div>
              )}
              {latestBirdie && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">🟢</span>
                  <p className="text-sm text-gray-700">
                    Latest birdie: <span className="font-semibold">Hole {latestBirdie.hole} at {latestBirdie.course}</span> on {latestBirdie.date}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      <Navigation showLeaderboard={hasClub} />
    </div>
  )
}
