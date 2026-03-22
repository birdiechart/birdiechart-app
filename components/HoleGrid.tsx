'use client'

import { HoleScore, HoleDetail, ScoreType } from '@/lib/types'
import { ClubScoreColors } from '@/lib/club-themes'

interface HoleGridProps {
  holeDetails: HoleDetail[]
  scores: HoleScore[]
  onHoleTap: (holeNumber: number) => void
  celebratingHole?: number | null
  scoreColors?: ClubScoreColors
  fullWidth?: boolean
}

function getBestScore(scores: HoleScore[], holeNumber: number): ScoreType | null {
  const holeScores = scores.filter((s) => s.hole_number === holeNumber)
  if (holeScores.length === 0) return null
  if (holeScores.some((s) => s.score_type === 'eagle')) return 'eagle'
  if (holeScores.some((s) => s.score_type === 'birdie')) return 'birdie'
  if (holeScores.some((s) => s.score_type === 'par')) return 'par'
  return null
}

function getHoleStyle(score: ScoreType | null, custom?: ClubScoreColors): { bg: string; text: string; border: string } {
  if (custom) {
    switch (score) {
      case 'eagle': return custom.eagle
      case 'birdie': return custom.birdie
      case 'par':    return custom.par
      default:       return { bg: '#ffffff', text: '#111827', border: '#e5e7eb' }
    }
  }
  switch (score) {
    case 'eagle':  return { bg: '#134d2a', text: '#ffffff', border: '#0f3d1f' }
    case 'birdie': return { bg: '#1D6B3B', text: '#ffffff', border: '#155c30' }
    case 'par':    return { bg: '#dcfce7', text: '#1D6B3B', border: '#86efac' }
    default:       return { bg: '#ffffff', text: '#111827', border: '#e5e7eb' }
  }
}

function getScoreIcon(score: ScoreType | null, color: string) {
  if (score === 'eagle') return <span className="text-xs md:text-sm mt-0.5 leading-none">🦅</span>
  if (score === 'birdie' || score === 'par') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mt-0.5 md:w-3.5 md:h-3.5">
        <path d="M2 6 L5 9 L10 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return null
}

export default function HoleGrid({ holeDetails, scores, onHoleTap, celebratingHole, scoreColors, fullWidth }: HoleGridProps) {
  const holes = Array.from({ length: 18 }, (_, i) => i + 1)

  return (
    <div className={`grid grid-cols-6 md:grid-cols-9 ${fullWidth ? 'gap-2.5 p-3' : 'gap-2.5 p-4'}`}>
      {holes.map((holeNum) => {
        const detail = holeDetails.find((h) => h.hole_number === holeNum)
        const bestScore = getBestScore(scores, holeNum)
        const style = getHoleStyle(bestScore, scoreColors)
        const isCelebrating = celebratingHole === holeNum

        return (
          <button
            key={holeNum}
            onClick={() => onHoleTap(holeNum)}
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all active:scale-95 ${
              isCelebrating ? 'celebrate' : ''
            }`}
            style={{
              backgroundColor: style.bg,
              borderColor: style.border,
              boxShadow: bestScore === 'eagle' || bestScore === 'birdie'
                ? `0 4px 12px ${scoreColors ? scoreColors.shadow + '40' : 'rgba(29,107,59,0.25)'}`
                : '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <span
              className="text-sm md:text-base font-bold leading-none"
              style={{ color: style.text }}
            >
              {holeNum}
            </span>
            {bestScore && getScoreIcon(bestScore, style.text)}
            {detail && !bestScore && (
              <span
                className="text-[9px] md:text-[11px] mt-0.5 leading-none"
                style={{ color: '#9ca3af' }}
              >
                Par {detail.par}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
