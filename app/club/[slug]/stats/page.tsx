'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getClubTheme } from '@/lib/club-themes'
import { LANDINGS_COURSES } from '@/lib/landings-data'
import ClubNavigation from '@/components/ClubNavigation'

const TOTAL_FACILITY_HOLES = LANDINGS_COURSES.length * 18
const LANDINGS_NAMES = new Set(LANDINGS_COURSES.map((c) => c.name))

interface StatCourse {
  id: string
  name: string
  birdiedHoles: number
  eagledHoles: number
  totalHoles: number
}

interface StatsSection {
  totalBirdies: number
  totalEagles: number
  courses: StatCourse[]
  bestMonth: { month: string; count: number } | null
  firstScore: { date: string; course: string; hole: number } | null
}

function emptySectionStats(): StatsSection {
  return { totalBirdies: 0, totalEagles: 0, courses: [], bestMonth: null, firstScore: null }
}

function calcStats(
  scores: { course_id: string; hole_number: number; score_type: string; scored_at: string }[],
  courseList: { id: string; name: string; holes?: number }[],
  eaglesCount: boolean
): StatsSection {
  if (scores.length === 0) return emptySectionStats()

  const countsTowardGoal = (s: { score_type: string }) =>
    s.score_type === 'birdie' || (eaglesCount && s.score_type === 'eagle')

  const birdiesAndEagles = scores.filter((s) => s.score_type === 'birdie' || s.score_type === 'eagle')

  const courses: StatCourse[] = courseList.map((c) => {
    const birdied = new Set(scores.filter((s) => s.course_id === c.id && countsTowardGoal(s)).map((s) => s.hole_number))
    const eagled = new Set(scores.filter((s) => s.course_id === c.id && s.score_type === 'eagle').map((s) => s.hole_number))
    return { id: c.id, name: c.name, birdiedHoles: birdied.size, eagledHoles: eagled.size, totalHoles: c.holes || 18 }
  }).filter((c) => c.birdiedHoles > 0).sort((a, b) => b.birdiedHoles - a.birdiedHoles)

  const monthMap = new Map<string, number>()
  for (const s of birdiesAndEagles) {
    const month = new Date(s.scored_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    monthMap.set(month, (monthMap.get(month) || 0) + 1)
  }
  let bestM = '', bestMCount = 0
  for (const [m, count] of monthMap) {
    if (count > bestMCount) { bestM = m; bestMCount = count }
  }

  const sorted = [...birdiesAndEagles].sort((a, b) => new Date(a.scored_at).getTime() - new Date(b.scored_at).getTime())
  const first = sorted[0]
  const firstCourse = first ? courseList.find((c) => c.id === first.course_id) : null

  return {
    totalBirdies: scores.filter((s) => s.score_type === 'birdie').length,
    totalEagles: scores.filter((s) => s.score_type === 'eagle').length,
    courses,
    bestMonth: bestM ? { month: bestM, count: bestMCount } : null,
    firstScore: first ? {
      date: new Date(first.scored_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      course: firstCourse?.name || 'Unknown',
      hole: first.hole_number,
    } : null,
  }
}

export default function ClubStatsPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const theme = getClubTheme(slug)

  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'home' | 'away'>('home')
  const [userName, setUserName] = useState('')
  const [facilityHoles, setFacilityHoles] = useState(0)
  const [homeStats, setHomeStats] = useState<StatsSection>(emptySectionStats())
  const [awayStats, setAwayStats] = useState<StatsSection>(emptySectionStats())

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/club/${slug}/login`); return }

      const { data: profile } = await supabase.from('users').select('name, eagles_count_toward_goal').eq('id', user.id).single()
      setUserName(profile?.name?.split(' ')[0] || '')
      const eaglesCount = profile?.eagles_count_toward_goal ?? true

      // Load all user courses
      const { data: userCourses } = await supabase
        .from('user_courses')
        .select('course_id, courses(id, name, holes)')
        .eq('user_id', user.id)

      type RawCourse = { id: string; name: string; holes: number }
      const allCourses: RawCourse[] = (userCourses || [])
        .map((uc: { courses: RawCourse | RawCourse[] | null }) => Array.isArray(uc.courses) ? uc.courses[0] : uc.courses)
        .filter((c): c is RawCourse => c !== null)

      const homeCourses = allCourses.filter((c) => LANDINGS_NAMES.has(c.name))
      const awayCourses = allCourses.filter((c) => !LANDINGS_NAMES.has(c.name))
      const allIds = allCourses.map((c) => c.id)

      if (allIds.length === 0) { setLoading(false); return }

      // Load all scores in one query
      const { data: scores } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('user_id', user.id)
        .in('course_id', allIds)
        .order('scored_at', { ascending: true })

      const allScores = scores || []
      const homeIds = new Set(homeCourses.map((c) => c.id))
      const awayIds = new Set(awayCourses.map((c) => c.id))

      const homeScores = allScores.filter((s) => homeIds.has(s.course_id))
      const awayScores = allScores.filter((s) => awayIds.has(s.course_id))

      // Facility progress (home only, respects eagles setting)
      const countsTowardGoal = (s: { score_type: string }) =>
        s.score_type === 'birdie' || (eaglesCount && s.score_type === 'eagle')
      const facilitySet = new Set(homeScores.filter(countsTowardGoal).map((s) => `${s.course_id}-${s.hole_number}`))
      setFacilityHoles(facilitySet.size)

      setHomeStats(calcStats(homeScores, homeCourses, eaglesCount))
      setAwayStats(calcStats(awayScores, awayCourses, eaglesCount))
      setLoading(false)
    }
    load()
  }, [slug, router])

  if (!theme) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: theme.primary, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const facilityPct = Math.round((facilityHoles / TOTAL_FACILITY_HOLES) * 100)
  const active = tab === 'home' ? homeStats : awayStats
  const hasData = active.totalBirdies > 0 || active.totalEagles > 0
  const awayColor = '#1D6B3B'

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: theme.primaryLight }}>

      {/* Header */}
      <div style={{ backgroundColor: theme.primary }} className="safe-top">
        <div className="px-4 pt-3 pb-3">
          <p className="text-xs font-medium text-white/70">My Stats</p>
          <p className="text-sm font-bold text-white">{userName ? `${userName}'s Season` : 'My Season'}</p>
        </div>
      </div>

      {/* Home / Away toggle */}
      <div className="px-4 pt-4">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm mb-4">
          <button
            onClick={() => setTab('home')}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: tab === 'home' ? theme.primary : 'transparent',
              color: tab === 'home' ? '#fff' : '#9ca3af',
            }}
          >
            <img
              src={theme.logoPath}
              alt="Home"
              className="h-5 w-auto max-w-[80px] object-contain"
              style={tab === 'home'
                ? (theme.logoOnDark ? { filter: 'brightness(0) invert(1)' } : undefined)
                : { filter: 'brightness(0) invert(0.6)' }
              }
            />
          </button>
          <button
            onClick={() => setTab('away')}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: tab === 'away' ? awayColor : 'transparent',
              color: tab === 'away' ? '#fff' : '#9ca3af',
            }}
          >
            ⛳ Away
          </button>
        </div>

        {/* Home: facility progress bar */}
        {tab === 'home' && (
          <div className="rounded-2xl p-4 shadow-sm mb-4" style={{ backgroundColor: theme.primary }}>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Facility Progress</p>
            <p className="text-white text-2xl font-bold mb-1">{facilityHoles} / {TOTAL_FACILITY_HOLES} holes</p>
            <div className="h-2 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${facilityPct}%` }} />
            </div>
            <p className="text-white/70 text-xs">{facilityPct}% of all {LANDINGS_COURSES.length} courses complete</p>
          </div>
        )}

        {/* Away: context note */}
        {tab === 'away' && awayStats.courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">✈️</div>
            <p className="text-gray-500 text-sm">No away courses yet. Add one from the Away tab.</p>
          </div>
        )}

        {hasData && (
          <div className="space-y-4">

            {/* Totals */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <p className="text-4xl font-bold" style={{ color: tab === 'home' ? theme.primary : awayColor }}>{active.totalBirdies}</p>
                <p className="text-sm text-gray-500 mt-1">Birdies</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <p className="text-4xl font-bold" style={{ color: tab === 'home' ? theme.primaryDark : '#134d2a' }}>{active.totalEagles}</p>
                <p className="text-sm text-gray-500 mt-1">Eagles</p>
              </div>
            </div>

            {/* Per-course breakdown */}
            {active.courses.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-3">By Course</h3>
                <div className="space-y-4">
                  {active.courses.map((c) => {
                    const pct = Math.round((c.birdiedHoles / c.totalHoles) * 100)
                    const barColor = tab === 'home' ? theme.primary : awayColor
                    return (
                      <div key={c.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">{c.name}</span>
                          <span className="text-sm font-bold" style={{ color: barColor }}>{c.birdiedHoles}/{c.totalHoles}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                        </div>
                        {c.eagledHoles > 0 && (
                          <p className="text-xs text-gray-400 mt-1">{c.eagledHoles} eagle{c.eagledHoles !== 1 ? 's' : ''}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Fun facts */}
            {(active.bestMonth || active.firstScore) && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Fun Facts</h3>
                <div className="space-y-3">
                  {active.bestMonth && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🔥</span>
                      <p className="text-sm text-gray-700">
                        Best month: <span className="font-semibold">{active.bestMonth.month}</span> with {active.bestMonth.count} birdie{active.bestMonth.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  {active.firstScore && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl">⭐</span>
                      <p className="text-sm text-gray-700">
                        First birdie: <span className="font-semibold">Hole {active.firstScore.hole} at {active.firstScore.course}</span> on {active.firstScore.date}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <ClubNavigation slug={slug} theme={theme} />
    </div>
  )
}
