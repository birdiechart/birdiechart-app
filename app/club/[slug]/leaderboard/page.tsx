'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getClubTheme } from '@/lib/club-themes'
import { LANDINGS_COURSES } from '@/lib/landings-data'
import ClubNavigation from '@/components/ClubNavigation'

const TOTAL_FACILITY_HOLES = LANDINGS_COURSES.length * 18 // 108

interface LeaderboardEntry {
  user_id: string
  name: string
  total_holes: number
  birdies: number
}

export default function ClubLeaderboardPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const theme = getClubTheme(slug)

  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [clubName, setClubName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/club/${slug}/login`); return }
      setCurrentUserId(user.id)

      const { data: club } = await supabase.from('clubs').select('id, name').eq('slug', slug).single()
      if (!club) { router.push('/login'); return }
      setClubName(club.name)

      // Get all club members with names
      const { data: members } = await supabase
        .from('user_clubs')
        .select('user_id, users(id, name)')
        .eq('club_id', club.id)

      if (!members) { setLoading(false); return }

      const memberIds = members.map((m: { user_id: string }) => m.user_id)

      // Get all scores for club members
      const { data: allScores } = await supabase
        .from('hole_scores')
        .select('user_id, course_id, hole_number, score_type')
        .in('user_id', memberIds)

      // Get Landings course IDs
      const { data: landingsCourses } = await supabase
        .from('courses')
        .select('id')
        .eq('is_landings', true)

      const landingsIds = new Set((landingsCourses || []).map((c: { id: string }) => c.id))

      const leaderboard: LeaderboardEntry[] = members.map((m: { user_id: string; users: { id: string; name: string } | { id: string; name: string }[] | null }) => {
        const userData = Array.isArray(m.users) ? m.users[0] : m.users
        const memberScores = (allScores || []).filter((s) => s.user_id === m.user_id && landingsIds.has(s.course_id))

        const uniqueHoles = new Set(
          memberScores
            .filter((s) => s.score_type === 'birdie')
            .map((s) => `${s.course_id}-${s.hole_number}`)
        )

        return {
          user_id: m.user_id,
          name: userData?.name || 'Unknown',
          total_holes: uniqueHoles.size,
          birdies: memberScores.filter((s) => s.score_type === 'birdie').length,
        }
      })

      leaderboard.sort((a, b) => b.total_holes - a.total_holes)
      setEntries(leaderboard)
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

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: theme.primaryLight }}>

      {/* Header */}
      <div style={{ backgroundColor: theme.primary }} className="safe-top">
        <div className="px-4 pt-3 pb-4 flex items-center gap-3">
          <img
            src={theme.logoPath}
            alt={clubName}
            className="h-7 w-auto"
            style={theme.logoOnDark ? { filter: 'brightness(0) invert(1)' } : undefined}
          />
          <div>
            <p className="text-xs font-medium text-white/70">Leaderboard</p>
            <p className="text-sm font-bold text-white">{clubName}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">

        {/* Total holes context */}
        <p className="text-xs text-gray-400 mb-3 text-center">
          Ranked by unique holes birdied across all {LANDINGS_COURSES.length} courses ({TOTAL_FACILITY_HOLES} total)
        </p>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No scores recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => {
              const isMe = entry.user_id === currentUserId
              const pct = Math.round((entry.total_holes / TOTAL_FACILITY_HOLES) * 100)
              return (
                <div
                  key={entry.user_id}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
                  style={{
                    borderWidth: isMe ? 2 : 0,
                    borderStyle: 'solid',
                    borderColor: isMe ? theme.primary : 'transparent',
                  }}
                >
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {idx < 3 ? (
                      <span className="text-xl">{medals[idx]}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                    )}
                  </div>

                  {/* Name & progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
                      {isMe && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white shrink-0"
                          style={{ backgroundColor: theme.primary }}>
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: theme.primary }} />
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{entry.total_holes}/{TOTAL_FACILITY_HOLES}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {entry.birdies} birdie{entry.birdies !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Completion % */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold" style={{ color: theme.primary }}>{pct}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ClubNavigation slug={slug} theme={theme} />
    </div>
  )
}
