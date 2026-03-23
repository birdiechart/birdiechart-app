'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getClubTheme, getClubScoreColors } from '@/lib/club-themes'
import { LANDINGS_COURSES, TEE_OPTIONS, TeeOption } from '@/lib/landings-data'
import Link from 'next/link'
import HoleGrid from '@/components/HoleGrid'
import ScorePanel from '@/components/ScorePanel'
import Celebration from '@/components/Celebration'
import ClubNavigation from '@/components/ClubNavigation'
import { Course, HoleScore, HoleDetail, ScoreType } from '@/lib/types'

const COURSE_NAMES = LANDINGS_COURSES.map((c) => c.name)
const TOTAL_FACILITY_HOLES = LANDINGS_COURSES.length * 18 // 108

export default function ClubChartPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const theme = getClubTheme(slug)

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [selectedTee, setSelectedTee] = useState<TeeOption>('tournament')
  const [courses, setCourses] = useState<Course[]>([])
  const [activeCourseId, setActiveCourseId] = useState('')
  const [holeDetails, setHoleDetails] = useState<HoleDetail[]>([])
  const [scores, setScores] = useState<HoleScore[]>([])
  const [allScores, setAllScores] = useState<HoleScore[]>([])
  const [selectedHole, setSelectedHole] = useState<number | null>(null)
  const [celebratingHole, setCelebratingHole] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationIsEagle, setCelebrationIsEagle] = useState(false)
  const [clubName, setClubName] = useState('')
  const [clubId, setClubId] = useState('')
  const [eaglesCountTowardGoal, setEaglesCountTowardGoal] = useState(true)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push(`/club/${slug}/login`); return }

      // Load club
      const { data: club } = await supabase
        .from('clubs')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!club) { router.push('/login'); return }
      setClubName(club.name)
      setClubId(club.id)

      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!profile) { router.push(`/club/${slug}/login`); return }
      setUserId(authUser.id)
      setUserName(profile.name?.split(' ')[0] || '')
      setSelectedTee((profile.selected_tee as TeeOption) || 'tournament')
      if (profile.eagles_count_toward_goal != null) setEaglesCountTowardGoal(profile.eagles_count_toward_goal)

      // Load user's courses — filter to Landings courses only
      const { data: userCourses } = await supabase
        .from('user_courses')
        .select('course_id, courses(*)')
        .eq('user_id', authUser.id)

      const courseList = (userCourses || [])
        .map((uc: { course_id: string; courses: Course | Course[] | null }) =>
          Array.isArray(uc.courses) ? uc.courses[0] : uc.courses)
        .filter((c): c is Course => c !== null)
        .filter((c: Course) => COURSE_NAMES.includes(c.name))

      setCourses(courseList)
      if (courseList.length > 0) setActiveCourseId(courseList[0].id)

      // Load all scores
      const { data: allScoreData } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('user_id', authUser.id)
      setAllScores(allScoreData || [])

      setLoading(false)
    }
    init()
  }, [slug, router])

  // Reload hole details when tee or courses change
  useEffect(() => {
    if (courses.length === 0 || !selectedTee) return
    const supabase = createClient()
    const ids = courses.map((c) => c.id)
    supabase
      .from('hole_details')
      .select('*')
      .in('course_id', ids)
      .eq('tee_name', selectedTee)
      .then(({ data }) => setHoleDetails(data || []))
  }, [selectedTee, courses])

  // Filter scores to active course
  useEffect(() => {
    setScores(allScores.filter((s) => s.course_id === activeCourseId))
  }, [activeCourseId, allScores])

  const handleScoreSaved = useCallback((score: ScoreType, isFirstBirdie: boolean, scoredAt: string) => {
    if (selectedHole === null) return
    const hole = selectedHole
    const newScore: HoleScore = {
      id: crypto.randomUUID(),
      user_id: userId,
      course_id: activeCourseId,
      hole_number: hole,
      score_type: score,
      scored_at: scoredAt,
    }
    setScores((prev) => [...prev.filter((s) => s.hole_number !== hole), newScore])
    setAllScores((prev) => [...prev.filter((s) => !(s.course_id === activeCourseId && s.hole_number === hole)), newScore])
    if (isFirstBirdie) {
      setCelebratingHole(hole)
      setCelebrationIsEagle(score === 'eagle')
      setShowCelebration(true)
      setTimeout(() => setCelebratingHole(null), 1000)
    }
  }, [userId, activeCourseId, selectedHole])

  // Facility-wide progress: unique holes birdied/eagled across all Landings courses
  const facilityCourseIds = courses.map((c) => c.id)
  const facilityBirdiedHoles = new Set(
    allScores
      .filter((s) => facilityCourseIds.includes(s.course_id) &&
        (s.score_type === 'birdie' || (eaglesCountTowardGoal && s.score_type === 'eagle')))
      .map((s) => `${s.course_id}-${s.hole_number}`)
  )
  const facilityPct = Math.round((facilityBirdiedHoles.size / TOTAL_FACILITY_HOLES) * 100)

  const activeCourse = courses.find((c) => c.id === activeCourseId)
  const teeLabel = TEE_OPTIONS.find((t) => t.value === selectedTee)?.label || 'Blue'
  const teeColor = TEE_OPTIONS.find((t) => t.value === selectedTee)?.color || '#1B3A6B'

  if (!theme) {
    return <div className="p-8 text-center text-gray-500">Club not found.</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: theme.primary, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 flex flex-col" style={{ backgroundColor: theme.primaryLight }}>

      {/* Club Header — compact */}
      <div style={{ backgroundColor: theme.primary }} className="safe-top">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <img
              src={theme.logoPath}
              alt={clubName}
              className="h-7 w-auto"
              style={theme.logoOnDark ? { filter: 'brightness(0) invert(1)' } : undefined}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Hey, {userName}
              </span>
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.push(`/club/${slug}/login`)
                }}
                className="text-xs px-2.5 py-1 rounded-full border"
                style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }}
              >
                Sign out
              </button>
              <button
                onClick={() => router.push(`/club/${slug}/settings`)}
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                aria-label="Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course selector + progress — slim strip below header */}
      <div className="bg-white" style={{ boxShadow: '0 1px 0 0 #e5e7eb' }}>
        {/* Course tabs */}
        <div className="flex gap-2 px-3 pt-2 pb-1 overflow-x-auto no-scrollbar">
          {LANDINGS_COURSES.map((lc) => {
            const course = courses.find((c) => c.name === lc.name)
            if (!course) return (
              <span key={lc.name} className="shrink-0 text-[11px] px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#f3f4f6', color: '#d1d5db' }}>
                {lc.name}
              </span>
            )
            const courseHoles = new Set(
              allScores
                .filter((s) => s.course_id === course.id &&
                  (s.score_type === 'birdie' || (eaglesCountTowardGoal && s.score_type === 'eagle')))
                .map((s) => s.hole_number)
            )
            const done = courseHoles.size
            const isActive = course.id === activeCourseId
            return (
              <button
                key={lc.name}
                onClick={() => setActiveCourseId(course.id)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all"
                style={{
                  backgroundColor: isActive ? theme.primary : '#f3f4f6',
                  color: isActive ? '#fff' : '#6b7280',
                }}
              >
                {lc.name} {done}/18
              </button>
            )
          })}
        </div>

        {/* Facility progress bar */}
        <div className="px-3 pb-2 pt-1 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${facilityPct}%`, backgroundColor: theme.primary }}
            />
          </div>
          <span className="text-[10px] font-semibold shrink-0" style={{ color: theme.primary }}>
            {facilityBirdiedHoles.size}/{TOTAL_FACILITY_HOLES}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: teeColor }} />
            <span className="text-[10px]" style={{ color: '#9ca3af' }}>{teeLabel}</span>
          </div>
        </div>
      </div>

      {/* Course hole grid — fills remaining space */}
      <div className="flex-1 h-full">
        {activeCourse && (
          <HoleGrid
            holeDetails={holeDetails.filter((h) => h.course_id === activeCourseId)}
            scores={scores}
            onHoleTap={setSelectedHole}
            celebratingHole={celebratingHole}
            scoreColors={getClubScoreColors(theme)}
            fullWidth
          />
        )}

        {courses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: theme.primary }}>
              No courses loaded. Contact your club administrator.
            </p>
          </div>
        )}
      </div>

      {/* Score panel */}
      {selectedHole !== null && userId && (
        <ScorePanel
          courseId={activeCourseId}
          holeNumber={selectedHole}
          holeDetail={holeDetails.find((h) => h.course_id === activeCourseId && h.hole_number === selectedHole) || null}
          isLandings={true}
          userId={userId}
          onClose={() => setSelectedHole(null)}
          onScoreSaved={handleScoreSaved}
          onScoreDeleted={(id) => {
            setScores((prev) => prev.filter((s) => s.id !== id))
            setAllScores((prev) => prev.filter((s) => s.id !== id))
          }}
        />
      )}

      <Celebration
        show={showCelebration}
        isEagle={celebrationIsEagle}
        onDone={() => setShowCelebration(false)}
      />

      <ClubNavigation slug={slug} theme={theme} />
    </div>
  )
}
