'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Course, HoleScore, HoleDetail, ScoreType, UserProfile } from '@/lib/types'
import Navigation from '@/components/Navigation'
import CourseSwitcher from '@/components/CourseSwitcher'
import HoleGrid from '@/components/HoleGrid'
import ScorePanel from '@/components/ScorePanel'
import ProgressStats from '@/components/ProgressStats'
import Celebration from '@/components/Celebration'
import CourseSearchSheet from '@/components/CourseSearchSheet'
import { useRouter } from 'next/navigation'

export default function ChartPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [activeCourseId, setActiveCourseId] = useState<string>('')
  const [holeDetails, setHoleDetails] = useState<HoleDetail[]>([])
  const [scores, setScores] = useState<HoleScore[]>([])
  const [allScores, setAllScores] = useState<HoleScore[]>([])
  const [selectedHole, setSelectedHole] = useState<number | null>(null)
  const [celebratingHole, setCelebratingHole] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationIsEagle, setCelebrationIsEagle] = useState(false)
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)
  const [hasClub, setHasClub] = useState(false)
  const [loading, setLoading] = useState(true)
  const [seasonStartMap, setSeasonStartMap] = useState<Map<string, string | null>>(new Map())
  const [showNewSeasonModal, setShowNewSeasonModal] = useState(false)
  const [startingNewSeason, setStartingNewSeason] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser(profile)
        setHasClub(!!profile.club_id)
      }

      // Load user's courses
      const { data: userCourses } = await supabase
        .from('user_courses')
        .select('course_id, courses(*)')
        .eq('user_id', authUser.id)
        .order('added_at', { ascending: true })

      if (userCourses && userCourses.length > 0) {
        const courseList = userCourses
          .map((uc: { course_id: string; courses: Course | Course[] | null }) => Array.isArray(uc.courses) ? uc.courses[0] : uc.courses)
          .filter(Boolean) as Course[]
        setCourses(courseList)
        setActiveCourseId(courseList[0].id)

        // Load season_start separately — column may not exist yet
        const { data: seasonData } = await supabase
          .from('user_courses')
          .select('course_id, season_start')
          .eq('user_id', authUser.id)
        if (seasonData) {
          const sMap = new Map<string, string | null>()
          for (const uc of seasonData) {
            sMap.set(uc.course_id, uc.season_start || null)
          }
          setSeasonStartMap(sMap)
        }
      }

      // Load all scores
      const { data: allScoreData } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('user_id', authUser.id)
      setAllScores(allScoreData || [])

      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    if (!activeCourseId || !user) return
    async function loadCourseData() {
      const supabase = createClient()

      const [{ data: details }, { data: courseScores }] = await Promise.all([
        supabase
          .from('hole_details')
          .select('*')
          .eq('course_id', activeCourseId)
          .order('hole_number'),
        supabase
          .from('hole_scores')
          .select('*')
          .eq('user_id', user!.id)
          .eq('course_id', activeCourseId),
      ])

      setHoleDetails(details || [])
      setScores(courseScores || [])
    }
    loadCourseData()
  }, [activeCourseId, user?.id])

  const handleScoreSaved = useCallback((score: ScoreType, isFirstBirdie: boolean, scoredAt: string) => {
    if (selectedHole === null || !user) return
    const hole = selectedHole

    // Optimistically update state immediately so grid and stats reflect the new score
    const newScore: HoleScore = {
      id: crypto.randomUUID(),
      user_id: user.id,
      course_id: activeCourseId,
      hole_number: hole,
      score_type: score,
      scored_at: scoredAt,
    }
    setScores((prev) => [...prev, newScore])
    setAllScores((prev) => [...prev, newScore])

    if (isFirstBirdie) {
      setCelebratingHole(hole)
      setCelebrationIsEagle(score === 'eagle')
      setShowCelebration(true)
    }
  }, [selectedHole, user?.id, activeCourseId])

  const handleDeleteCourse = useCallback(async (courseId: string) => {
    if (!user) return
    const supabase = createClient()
    await supabase.from('hole_scores').delete().eq('user_id', user.id).eq('course_id', courseId)
    await supabase.from('user_courses').delete().eq('user_id', user.id).eq('course_id', courseId)
    setCourses((prev) => {
      const remaining = prev.filter((c) => c.id !== courseId)
      if (activeCourseId === courseId) setActiveCourseId(remaining[0]?.id || '')
      return remaining
    })
    setDeletingCourseId(null)
  }, [user, activeCourseId])

  const handleCourseAdded = useCallback((course: Course) => {
    setCourses((prev) => {
      if (prev.find((c) => c.id === course.id)) return prev
      return [...prev, course]
    })
    setActiveCourseId(course.id)
    setShowAddCourse(false)
  }, [])

  const handleNewSeason = useCallback(async () => {
    if (!user || !activeCourseId) return
    setStartingNewSeason(true)
    const eod = new Date()
    eod.setUTCHours(23, 59, 59, 999)
    const seasonCutoff = eod.toISOString()
    const supabase = createClient()
    await Promise.all([
      supabase
        .from('user_courses')
        .update({ season_start: seasonCutoff })
        .eq('user_id', user.id)
        .eq('course_id', activeCourseId),
      supabase
        .from('season_history')
        .insert({ user_id: user.id, course_id: activeCourseId, ended_at: seasonCutoff }),
    ])
    setSeasonStartMap((prev) => new Map(prev).set(activeCourseId, seasonCutoff))
    setShowNewSeasonModal(false)
    setStartingNewSeason(false)
  }, [user, activeCourseId])

  const activeCourse = courses.find((c) => c.id === activeCourseId)
  const activeSeasonStart = seasonStartMap.get(activeCourseId) ?? null
  const displayScores = activeSeasonStart
    ? scores.filter((s) => s.scored_at >= activeSeasonStart)
    : scores
  const displayAllScores = allScores.filter((s) => {
    const ss = seasonStartMap.get(s.course_id) ?? null
    return !ss || s.scored_at >= ss
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: '#1D6B3B', borderTopColor: 'transparent' }} />
          <p className="text-sm text-gray-400">Loading your chart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm safe-top">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <h1
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Birdie Chart
            </h1>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Sign out
            </button>
          </div>
          {user && (
            <p className="text-xs text-gray-400">Hey, {user.name.split(' ')[0]}</p>
          )}
        </div>

        {/* Course switcher */}
        {courses.length > 0 ? (
          <CourseSwitcher
            courses={courses}
            activeCourseId={activeCourseId}
            onSelect={setActiveCourseId}
            onAddCourse={() => setShowAddCourse(true)}
            onDeleteCourse={(id) => setDeletingCourseId(id)}
          />
        ) : (
          <div className="px-4 pb-3">
            <button
              onClick={() => setShowAddCourse(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 font-medium"
            >
              + Add your first course
            </button>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="text-5xl mb-4">⛳</div>
          <h2
            className="text-xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            No courses yet
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Add your home course or any course you play to start tracking your birdies.
          </p>
          <button
            onClick={() => setShowAddCourse(true)}
            className="px-6 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: '#1D6B3B' }}
          >
            Add a Course
          </button>
        </div>
      ) : (
        <>
          {/* Progress stats */}
          <div className="pt-3">
            <ProgressStats
              scores={displayScores}
              allScores={displayAllScores}
              courseName={activeCourse?.name || ''}
              totalHoles={activeCourse?.holes || 18}
              seasonStart={activeSeasonStart}
            />
            <div className="px-4 pb-1 flex justify-end">
              <button
                onClick={() => setShowNewSeasonModal(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.5 6A4.5 4.5 0 1 1 6 1.5"/>
                  <polyline points="9.5,1 10.5,1 10.5,2.5" strokeLinejoin="round"/>
                </svg>
                {activeSeasonStart ? 'New season' : 'Start new season'}
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#134d2a' }} />
              <span className="text-[10px] text-gray-500">Eagle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1D6B3B' }} />
              <span className="text-[10px] text-gray-500">Birdie</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dcfce7' }} />
              <span className="text-[10px] text-gray-500">Par</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-gray-200 bg-white" />
              <span className="text-[10px] text-gray-500">Not played</span>
            </div>
          </div>

          {/* Hole grid */}
          <HoleGrid
            holeDetails={holeDetails}
            scores={displayScores}
            onHoleTap={setSelectedHole}
            celebratingHole={celebratingHole}
          />
        </>
      )}

      {/* Score panel */}
      {selectedHole !== null && user && (
        <ScorePanel
          courseId={activeCourseId}
          holeNumber={selectedHole}
          holeDetail={holeDetails.find((h) => h.hole_number === selectedHole) || null}
          isLandings={activeCourse?.is_landings ?? false}
          userId={user.id}
          onClose={() => setSelectedHole(null)}
          onScoreSaved={handleScoreSaved}
          onParSaved={(holeNumber, par) => {
            setHoleDetails((prev) => [
              ...prev,
              { id: '', course_id: activeCourseId, hole_number: holeNumber, par, yardage: 0 },
            ])
          }}
        />
      )}

      {/* Add course sheet */}
      {showAddCourse && user && (
        <CourseSearchSheet
          userId={user.id}
          onClose={() => setShowAddCourse(false)}
          onCourseAdded={handleCourseAdded}
        />
      )}

      {/* Delete course confirmation */}
      {deletingCourseId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDeletingCourseId(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Remove this course?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete all your scores for this course. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingCourseId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCourse(deletingCourseId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: '#dc2626' }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* New season confirmation */}
      {showNewSeasonModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowNewSeasonModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Start a new season?
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              Your birdie chart for <span className="font-semibold text-gray-700">{activeCourse?.name}</span> will reset so you can try to complete every hole again.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              All your scores are saved forever in Stats — nothing gets deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewSeasonModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleNewSeason}
                disabled={startingNewSeason}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: '#1D6B3B' }}
              >
                {startingNewSeason ? 'Starting...' : 'Start Season'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Celebration overlay */}
      <Celebration
        show={showCelebration}
        onDone={() => {
          setShowCelebration(false)
          setCelebratingHole(null)
        }}
        isEagle={celebrationIsEagle}
      />

      <Navigation showLeaderboard={hasClub} />
    </div>
  )
}
