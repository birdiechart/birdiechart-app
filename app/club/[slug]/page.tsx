'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getClubTheme } from '@/lib/club-themes'
import { LANDINGS_COURSES, TEE_OPTIONS, TeeOption } from '@/lib/landings-data'
import Link from 'next/link'
import HoleGrid from '@/components/HoleGrid'
import ScorePanel from '@/components/ScorePanel'
import Celebration from '@/components/Celebration'
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
  const [selectedTee, setSelectedTee] = useState<TeeOption>('blue')
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
      setSelectedTee((profile.selected_tee as TeeOption) || 'blue')

      // Load user's courses — filter to Landings courses only
      const { data: userCourses } = await supabase
        .from('user_courses')
        .select('course_id, courses(*)')
        .eq('user_id', authUser.id)

      const courseList = (userCourses || [])
        .map((uc: { course_id: string; courses: Course | Course[] | null }) =>
          Array.isArray(uc.courses) ? uc.courses[0] : uc.courses)
        .filter(Boolean)
        .filter((c: Course) => COURSE_NAMES.includes(c.name)) as Course[]

      setCourses(courseList)
      if (courseList.length > 0) setActiveCourseId(courseList[0].id)

      // Load all scores
      const { data: allScoreData } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('user_id', authUser.id)
      setAllScores(allScoreData || [])

      // Load hole details
      if (courseList.length > 0) {
        const ids = courseList.map((c: Course) => c.id)
        const { data: details } = await supabase
          .from('hole_details')
          .select('*')
          .in('course_id', ids)
          .eq('tee_name', profile.selected_tee || 'blue')
        setHoleDetails(details || [])
      }

      setLoading(false)
    }
    init()
  }, [slug, router])

  // Filter scores to active course
  useEffect(() => {
    setScores(allScores.filter((s) => s.course_id === activeCourseId))
  }, [activeCourseId, allScores])

  const handleScoreSubmit = useCallback(async (hole: number, scoreType: ScoreType) => {
    if (!userId || !activeCourseId) return
    const supabase = createClient()

    // Remove existing score for this hole
    const existing = scores.find((s) => s.hole_number === hole)
    if (existing) {
      await supabase.from('hole_scores').delete().eq('id', existing.id)
    }

    if (scoreType === 'par' || scoreType === 'bogey') {
      setScores((prev) => prev.filter((s) => s.hole_number !== hole))
      setAllScores((prev) => prev.filter((s) => !(s.course_id === activeCourseId && s.hole_number === hole)))
      setSelectedHole(null)
      return
    }

    const { data: newScore } = await supabase
      .from('hole_scores')
      .insert({ user_id: userId, course_id: activeCourseId, hole_number: hole, score_type: scoreType })
      .select()
      .single()

    if (newScore) {
      const isFirstBirdie = !scores.some(
        (s) => s.hole_number === hole && (s.score_type === 'birdie' || s.score_type === 'eagle')
      )
      setScores((prev) => [...prev.filter((s) => s.hole_number !== hole), newScore])
      setAllScores((prev) => [...prev.filter((s) => !(s.course_id === activeCourseId && s.hole_number === hole)), newScore])

      if (isFirstBirdie && (scoreType === 'birdie' || scoreType === 'eagle')) {
        setCelebratingHole(hole)
        setCelebrationIsEagle(scoreType === 'eagle')
        setShowCelebration(true)
        setTimeout(() => setCelebratingHole(null), 1000)
      }
    }
    setSelectedHole(null)
  }, [userId, activeCourseId, scores])

  // Facility-wide progress: unique holes birdied/eagled across all Landings courses
  const facilityCourseIds = courses.map((c) => c.id)
  const facilityBirdiedHoles = new Set(
    allScores
      .filter((s) => facilityCourseIds.includes(s.course_id) &&
        (s.score_type === 'birdie' || s.score_type === 'eagle'))
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
    <div className="min-h-screen pb-6" style={{ backgroundColor: theme.primaryLight }}>

      {/* Club Header */}
      <div style={{ backgroundColor: theme.primary }} className="safe-top">
        <div className="px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-3">
            {/* Logo */}
            <img
              src={`/landings-logo.svg`}
              alt={clubName}
              className="h-7 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
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

          {/* Tee indicator */}
          <div className="flex items-center gap-1.5 pb-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teeColor }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {teeLabel} Tees
            </span>
          </div>
        </div>

        {/* Facility Progress Bar */}
        <div className="px-4 pb-4">
          <div className="rounded-2xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">Facility Progress</span>
              <span className="text-xs font-bold text-white">
                {facilityBirdiedHoles.size}/{TOTAL_FACILITY_HOLES} holes
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${facilityPct}%`, backgroundColor: '#FFFFFF' }}
              />
            </div>
            {/* Per-course mini indicators */}
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {LANDINGS_COURSES.map((lc) => {
                const course = courses.find((c) => c.name === lc.name)
                if (!course) return (
                  <span key={lc.name} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                    {lc.name}
                  </span>
                )
                const courseHoles = new Set(
                  allScores
                    .filter((s) => s.course_id === course.id && (s.score_type === 'birdie' || s.score_type === 'eagle'))
                    .map((s) => s.hole_number)
                )
                const done = courseHoles.size
                const isActive = course.id === activeCourseId
                return (
                  <button
                    key={lc.name}
                    onClick={() => setActiveCourseId(course.id)}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium transition-all"
                    style={{
                      backgroundColor: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                      color: isActive ? theme.primary : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {lc.name} {done}/18
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Course hole grid */}
      <div className="px-4 pt-4">
        {activeCourse && (
          <>
            <HoleGrid
              holeDetails={holeDetails.filter((h) => h.course_id === activeCourseId)}
              scores={scores}
              onHolePress={setSelectedHole}
              celebratingHole={celebratingHole}
            />
          </>
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
      {selectedHole !== null && (
        <ScorePanel
          hole={selectedHole}
          currentScore={scores.find((s) => s.hole_number === selectedHole)?.score_type}
          holeDetail={holeDetails.find((h) => h.course_id === activeCourseId && h.hole_number === selectedHole)}
          onSubmit={handleScoreSubmit}
          onClose={() => setSelectedHole(null)}
        />
      )}

      {showCelebration && (
        <Celebration
          isEagle={celebrationIsEagle}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  )
}
