'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import { Club, LeaderboardEntry } from '@/lib/types'

export default function LeaderboardPage() {
  const router = useRouter()
  const [club, setClub] = useState<Club | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)

      // Get user's club
      const { data: profile } = await supabase
        .from('users')
        .select('club_id')
        .eq('id', user.id)
        .single()

      if (!profile?.club_id) {
        router.push('/chart')
        return
      }

      const { data: clubData } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', profile.club_id)
        .single()

      if (!clubData?.leaderboard_enabled) {
        router.push('/chart')
        return
      }

      setClub(clubData)

      // Get all club members
      const { data: members } = await supabase
        .from('user_clubs')
        .select('user_id, users(id, name)')
        .eq('club_id', profile.club_id)

      if (!members) { setLoading(false); return }

      // Get scores for each member
      const memberIds = members.map((m: { user_id: string }) => m.user_id)
      const { data: allScores } = await supabase
        .from('hole_scores')
        .select('user_id, course_id, hole_number, score_type')
        .in('user_id', memberIds)

      // Calculate leaderboard
      const leaderboard: LeaderboardEntry[] = members.map((m: { user_id: string; users: { id: string; name: string } | { id: string; name: string }[] | null }) => {
        const userData = Array.isArray(m.users) ? m.users[0] : m.users
        const memberScores = (allScores || []).filter((s) => s.user_id === m.user_id)
        const eagles = memberScores.filter((s) => s.score_type === 'eagle').length
        const birdies = memberScores.filter((s) => s.score_type === 'birdie').length

        // Unique holes birdied
        const birdiedHoles = new Set(
          memberScores
            .filter((s) => s.score_type === 'birdie' || s.score_type === 'eagle')
            .map((s) => `${s.course_id}-${s.hole_number}`)
        )

        return {
          user_id: m.user_id,
          name: userData?.name || 'Unknown',
          birdie_count: birdies,
          eagle_count: eagles,
          total_holes: birdiedHoles.size,
          completion_pct: Math.round((birdiedHoles.size / 18) * 100),
        }
      })

      leaderboard.sort((a, b) => b.total_holes - a.total_holes)
      setEntries(leaderboard)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#1D6B3B', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            {club?.logo_url && (
              <img src={club.logo_url} alt={club.name} className="w-10 h-10 rounded-xl object-cover" />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                {club?.name}
              </h1>
              <p className="text-xs text-gray-400">Leaderboard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No members have recorded scores yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => {
              const isMe = entry.user_id === currentUserId
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div
                  key={entry.user_id}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
                  style={{
                    borderWidth: isMe ? 2 : 0,
                    borderStyle: 'solid',
                    borderColor: isMe ? '#1D6B3B' : 'transparent',
                  }}
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {idx < 3 ? (
                      <span className="text-xl">{medals[idx]}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                    )}
                  </div>

                  {/* Name & stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
                      {isMe && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#1D6B3B' }}>
                          You
                        </span>
                      )}
                    </div>
                    {/* Mini progress bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${entry.completion_pct}%`, backgroundColor: '#1D6B3B' }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{entry.total_holes} holes</span>
                    </div>
                  </div>

                  {/* Score counts */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold" style={{ color: '#1D6B3B' }}>{entry.birdie_count + entry.eagle_count}</p>
                    <p className="text-[10px] text-gray-400">birdies+</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Navigation showLeaderboard={true} />
    </div>
  )
}
