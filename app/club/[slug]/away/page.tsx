'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getClubTheme } from '@/lib/club-themes'
import { LANDINGS_COURSES } from '@/lib/landings-data'
import { Course, HoleScore, HoleDetail, ScoreType } from '@/lib/types'
import HoleGrid from '@/components/HoleGrid'
import ScorePanel from '@/components/ScorePanel'
import Celebration from '@/components/Celebration'
import CourseSearchSheet from '@/components/CourseSearchSheet'
import BirdieLogo from '@/components/BirdieLogo'
import ClubNavigation from '@/components/ClubNavigation'

const LANDINGS_NAMES = new Set(LANDINGS_COURSES.map((c) => c.name))

export default function ClubAwayPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const theme = getClubTheme(slug)

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [clubName, setClubName] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [activeCourseId, setActiveCourseId] = useState('')
  const [holeDetails, setHoleDetails] = useState<HoleDetail[]>([])
  const [scores, setScores] = useState<HoleScore[]>([])
  const [selectedHole, setSelectedHole] = useState<number | null>(null)
  const [celebratingHole, setCelebratingHole] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationIsEagle, setCelebrationIsEagle] = useState(false)
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/club/${slug}/login`); return }
      setUserId(user.id)

      const { data: club } = await supabase.from('clubs').select('name').eq('slug', slug).single()
      if (club) setClubName(club.name)

      // Load non-Landings courses only
      const { data: userCourses } = await supabase
        .from('user_courses')
        .select('course_id, courses(*)')
        .eq('user_id', user.id)

      const awayCourses = (userCourses || [])
        .map((uc: { course_id: string; courses: Course | Course[] | null }) =>
          Array.isArray(uc.courses) ? uc.courses[0] : uc.courses)
        .filter((c): c is Course => c !== null && !LANDINGS_NAMES.has(c.name))

      setCourses(awayCourses)
      if (awayCourses.length > 0) setActiveCourseId(awayCourses[0].id)
      setLoading(false)
    }
    init()
  }, [slug, router])

  // Load hole details + scores for active course
  useEffect(() => {
    if (!activeCourseId || !userId) return
    const supabase = createClient()
    Promise.all([
      supabase.from('hole_details').select('*').eq('course_id', activeCourseId).order('hole_number'),
      supabase.from('hole_scores').select('*').eq('user_id', userId).eq('course_id', activeCourseId),
    ]).then(([{ data: details }, { data: courseScores }]) => {
      setHoleDetails(details || [])
      setScores(courseScores || [])
    })
  }, [activeCourseId, userId])

  const handleScoreSaved = useCallback((score: ScoreType, isFirstBirdie: boolean, scoredAt: string) => {
    if (selectedHole === null) return
    const newScore: HoleScore = {
      id: crypto.randomUUID(),
      user_id: userId,
      course_id: activeCourseId,
      hole_number: selectedHole,
      score_type: score,
      scored_at: scoredAt,
    }
    setScores((prev) => [...prev, newScore])
    if (isFirstBirdie) {
      setCelebratingHole(selectedHole)
      setCelebrationIsEagle(score === 'eagle')
      setShowCelebration(true)
    }
  }, [userId, activeCourseId, selectedHole])

  const handleCourseAdded = useCallback((course: Course) => {
    setCourses((prev) => prev.find((c) => c.id === course.id) ? prev : [...prev, course])
    setActiveCourseId(course.id)
    setShowAddCourse(false)
  }, [])

  const handleDeleteCourse = useCallback(async (courseId: string) => {
    const supabase = createClient()
    await supabase.from('hole_scores').delete().eq('user_id', userId).eq('course_id', courseId)
    await supabase.from('user_courses').delete().eq('user_id', userId).eq('course_id', courseId)
    setCourses((prev) => {
      const remaining = prev.filter((c) => c.id !== courseId)
      if (activeCourseId === courseId) setActiveCourseId(remaining[0]?.id || '')
      return remaining
    })
    setDeletingCourseId(null)
  }, [userId, activeCourseId])

  if (!theme) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#1D6B3B', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const activeCourse = courses.find((c) => c.id === activeCourseId)

  return (
    <div className="min-h-screen pb-24 bg-gray-50">

      {/* Birdie Chart branded header */}
      <div className="bg-white safe-top" style={{ boxShadow: '0 1px 0 0 #e5e7eb' }}>
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BirdieLogo iconOnly className="w-8 h-8" />
              <div>
                <h1 className="text-base font-bold leading-tight" style={{ color: '#1D6B3B', fontFamily: 'var(--font-playfair)' }}>
                  Away Courses
                </h1>
                <p className="text-[11px] text-gray-400 leading-tight">Playing outside {clubName}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddCourse(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
              style={{ backgroundColor: '#1D6B3B' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="1" x2="6" y2="11"/>
                <line x1="1" y1="6" x2="11" y2="6"/>
              </svg>
              Add Course
            </button>
          </div>

          {/* Course tabs */}
          {courses.length > 0 && (
            <div className="flex gap-2 mt-3 pb-2 overflow-x-auto no-scrollbar">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCourseId(c.id)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: c.id === activeCourseId ? '#1D6B3B' : '#f3f4f6',
                    color: c.id === activeCourseId ? '#fff' : '#6b7280',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="text-5xl mb-4">⛳</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
            No away courses yet
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Add any course you play outside of {clubName} to track your away birdies.
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
          {/* Course header with delete option */}
          {activeCourse && (
            <div className="px-4 pt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{activeCourse.name}</p>
                <p className="text-xs text-gray-400">{activeCourse.location}</p>
              </div>
              <button
                onClick={() => setDeletingCourseId(activeCourse.id)}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors py-1 px-2"
              >
                Remove
              </button>
            </div>
          )}

          <HoleGrid
            holeDetails={holeDetails}
            scores={scores}
            onHoleTap={setSelectedHole}
            celebratingHole={celebratingHole}
          />
        </>
      )}

      {/* Score panel */}
      {selectedHole !== null && userId && (
        <ScorePanel
          courseId={activeCourseId}
          holeNumber={selectedHole}
          holeDetail={holeDetails.find((h) => h.hole_number === selectedHole) || null}
          isLandings={false}
          userId={userId}
          onClose={() => setSelectedHole(null)}
          onScoreSaved={handleScoreSaved}
          onScoreDeleted={(id) => setScores((prev) => prev.filter((s) => s.id !== id))}
          onParSaved={(holeNumber, par) => {
            setHoleDetails((prev) => [...prev, { id: '', course_id: activeCourseId, hole_number: holeNumber, par, yardage: 0 }])
          }}
        />
      )}

      {/* Add course sheet */}
      {showAddCourse && userId && (
        <CourseSearchSheet
          userId={userId}
          onClose={() => setShowAddCourse(false)}
          onCourseAdded={handleCourseAdded}
        />
      )}

      {/* Delete confirmation */}
      {deletingCourseId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDeletingCourseId(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Remove this course?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete all your scores for this course.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingCourseId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={() => handleDeleteCourse(deletingCourseId)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: '#dc2626' }}>Delete</button>
            </div>
          </div>
        </>
      )}

      <Celebration
        show={showCelebration}
        isEagle={celebrationIsEagle}
        onDone={() => { setShowCelebration(false); setCelebratingHole(null) }}
      />

      <ClubNavigation slug={slug} theme={theme} />
    </div>
  )
}
