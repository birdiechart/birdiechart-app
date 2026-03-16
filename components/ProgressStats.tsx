'use client'

import { HoleScore } from '@/lib/types'

interface ProgressStatsProps {
  scores: HoleScore[]
  allScores: HoleScore[]
  courseName: string
  totalHoles: number
  seasonStart: string | null
}

export default function ProgressStats({ scores, allScores, courseName, totalHoles, seasonStart }: ProgressStatsProps) {
  // Per-course: unique holes birdied or better
  const birdiedHoles = new Set(
    scores
      .filter((s) => s.score_type === 'birdie' || s.score_type === 'eagle')
      .map((s) => s.hole_number)
  )
  const courseCompletion = Math.round((birdiedHoles.size / totalHoles) * 100)

  // Overall stats
  const totalEagles = allScores.filter((s) => s.score_type === 'eagle').length
  const totalBirdies = allScores.filter((s) => s.score_type === 'birdie').length
  const totalPars = allScores.filter((s) => s.score_type === 'par').length

  return (
    <div className="px-4 pb-2">
      {/* Course progress */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{courseName}</p>
              {seasonStart && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#1D6B3B' }}>
                  SEASON
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {birdiedHoles.size} of {totalHoles} holes birdied
            </p>
          </div>
          <span
            className="text-2xl font-bold"
            style={{ color: '#1D6B3B', fontFamily: 'var(--font-playfair)' }}
          >
            {courseCompletion}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${courseCompletion}%`,
              backgroundColor: '#1D6B3B',
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold" style={{ color: '#134d2a' }}>{totalEagles}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Eagles</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold" style={{ color: '#1D6B3B' }}>{totalBirdies}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Birdies</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold" style={{ color: '#2563eb' }}>{totalPars}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Pars</p>
        </div>
      </div>
    </div>
  )
}
