'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { HoleScore, ScoreType, HoleDetail } from '@/lib/types'

interface ScorePanelProps {
  courseId: string
  holeNumber: number
  holeDetail: HoleDetail | null
  isLandings: boolean
  userId: string
  onClose: () => void
  onScoreSaved: (score: ScoreType, isFirstBirdie: boolean, scoredAt: string) => void
  onScoreDeleted?: (scoreId: string) => void
  onParSaved?: (holeNumber: number, par: number) => void
}

const SCORE_OPTIONS: { type: ScoreType; label: string; desc: string; color: string; bg: string }[] = [
  { type: 'eagle', label: 'Eagle', desc: '2 under par', color: '#134d2a', bg: '#d1fae5' },
  { type: 'birdie', label: 'Birdie', desc: '1 under par', color: '#1D6B3B', bg: '#dcfce7' },
  { type: 'par', label: 'Par', desc: 'Even', color: '#2563eb', bg: '#dbeafe' },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ScorePanel({
  courseId,
  holeNumber,
  holeDetail,
  isLandings,
  userId,
  onClose,
  onScoreSaved,
  onScoreDeleted,
  onParSaved,
}: ScorePanelProps) {
  const [selected, setSelected] = useState<ScoreType | null>(null)
  const [selectedPar, setSelectedPar] = useState<number | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [history, setHistory] = useState<HoleScore[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const needsPar = !holeDetail

  useEffect(() => {
    async function fetchHistory() {
      const supabase = createClient()
      const { data } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('hole_number', holeNumber)
        .order('scored_at', { ascending: false })
      setHistory(data || [])
      setLoading(false)
    }
    fetchHistory()
  }, [courseId, holeNumber, userId])

  const firstBirdieId = history
    .slice()
    .reverse()
    .find((s) => s.score_type === 'birdie' || s.score_type === 'eagle')?.id

  async function handleSave() {
    if (!selected) return
    if (needsPar && !selectedPar) return
    setSaving(true)
    const supabase = createClient()

    // Save par if this hole didn't have it
    if (needsPar && selectedPar) {
      await supabase.from('hole_details').insert({
        course_id: courseId,
        hole_number: holeNumber,
        par: selectedPar,
        yardage: 0,
      })
      onParSaved?.(holeNumber, selectedPar)
    }

    const hadBirdieBefore = history.some(
      (s) => s.score_type === 'birdie' || s.score_type === 'eagle'
    )
    const isFirstBirdie =
      !hadBirdieBefore && (selected === 'birdie' || selected === 'eagle')

    // Use end-of-day local time so scores always fall after the season_start
    // cutoff (which is end-of-day UTC on the day the season was reset).
    const scored_at = new Date(date + 'T23:59:59').toISOString()

    const { error } = await supabase.from('hole_scores').insert({
      user_id: userId,
      course_id: courseId,
      hole_number: holeNumber,
      score_type: selected,
      scored_at,
    })

    if (error) {
      alert('Could not save score: ' + error.message)
      setSaving(false)
      return
    }

    onScoreSaved(selected, isFirstBirdie, scored_at)
    onClose()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('hole_scores').delete().eq('id', id)
    setHistory((prev) => prev.filter((s) => s.id !== id))
    setConfirmDeleteId(null)
    onScoreDeleted?.(id)
  }

return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 sheet-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl slide-up max-w-lg mx-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                Hole {holeNumber}
              </h2>
              {holeDetail && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Par {holeDetail.par}{isLandings ? ` · ${holeDetail.yardage} yds` : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13"/>
                <line x1="13" y1="1" x2="1" y2="13"/>
              </svg>
            </button>
          </div>

          {/* Score buttons */}
          <div className="flex flex-col gap-3 mb-5">
            {/* Birdie - full width */}
            {SCORE_OPTIONS.filter((o) => o.type === 'birdie').map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelected(opt.type)}
                className="w-full flex flex-col items-center justify-center py-3.5 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: selected === opt.type ? opt.color : '#e5e7eb',
                  backgroundColor: selected === opt.type ? opt.bg : 'white',
                }}
              >
                <span className="font-bold text-base" style={{ color: opt.color }}>{opt.label}</span>
                <span className="text-xs text-gray-400 mt-0.5">{opt.desc}</span>
              </button>
            ))}
            {/* Eagle + Par - side by side */}
            <div className="flex gap-3">
              {SCORE_OPTIONS.filter((o) => o.type !== 'birdie').map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setSelected(opt.type)}
                  className="flex-1 flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: selected === opt.type ? opt.color : '#e5e7eb',
                    backgroundColor: selected === opt.type ? opt.bg : 'white',
                  }}
                >
                  <span className="font-bold text-base" style={{ color: opt.color }}>{opt.label}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Par picker — only shown when course has no par data */}
          {needsPar && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                What&apos;s the par for this hole?
              </label>
              <div className="flex gap-3">
                {[3, 4, 5].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPar(p)}
                    className="flex-1 py-3 rounded-2xl border-2 font-bold text-lg transition-all"
                    style={{
                      borderColor: selectedPar === p ? '#1D6B3B' : '#e5e7eb',
                      backgroundColor: selectedPar === p ? '#dcfce7' : 'white',
                      color: selectedPar === p ? '#1D6B3B' : '#9ca3af',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date picker */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Date Played
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 bg-gray-50"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!selected || saving || (needsPar && !selectedPar)}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-opacity disabled:opacity-40 mb-6"
            style={{ backgroundColor: '#1D6B3B' }}
          >
            {saving ? 'Saving...' : 'Save Score'}
          </button>

          {/* History */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Score History
            </h3>
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
            ) : (() => {
              const birdieHistory = history
                .filter((s) => s.score_type === 'birdie' || s.score_type === 'eagle')
                .sort((a, b) => new Date(b.scored_at).getTime() - new Date(a.scored_at).getTime())
              const firstBirdieEntry = [...birdieHistory].reverse()[0]

              return birdieHistory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No scores yet on this hole</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {birdieHistory.map((score) => {
                    const isFirst = score.id === firstBirdieEntry?.id
                    const opt = SCORE_OPTIONS.find((o) => o.type === score.score_type)
                    const confirming = confirmDeleteId === score.id
                    return (
                      <div key={score.id}>
                        <div
                          className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                          style={{ backgroundColor: opt?.bg || '#dcfce7' }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm" style={{ color: opt?.color }}>
                              {opt?.label}
                            </span>
                            {isFirst && (
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: score.score_type === 'eagle' ? '#134d2a' : '#1D6B3B' }}
                              >
                                {score.score_type === 'eagle' ? 'First eagle!' : 'First birdie!'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{formatDate(score.scored_at)}</span>
                            <button
                              onClick={() => setConfirmDeleteId(confirming ? null : score.id)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="1" y1="1" x2="9" y2="9"/>
                                <line x1="9" y1="1" x2="1" y2="9"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        {confirming && (
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-red-50 border border-red-100 mt-1">
                            <span className="text-xs text-red-600 font-medium">Delete this score?</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs text-gray-400 font-medium px-2 py-1"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(score.id)}
                                className="text-xs text-white font-semibold px-3 py-1 rounded-lg"
                                style={{ backgroundColor: '#dc2626' }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </>
  )
}
