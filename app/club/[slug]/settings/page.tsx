'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getClubTheme } from '@/lib/club-themes'
import { TEE_OPTIONS, TeeOption } from '@/lib/landings-data'
import ClubNavigation from '@/components/ClubNavigation'

const TEE_DESCRIPTIONS: Record<TeeOption, string> = {
  championship: 'Tournament / scratch players',
  tournament:   'Low-to-mid handicap men',
  club:         'Mid handicap / senior men',
  medal:        'High handicap / forward tees',
  course:       'Forward / senior forward tees',
  island:       'Short / beginner tees',
  skidaway:     'Shortest available tees',
}

export default function ClubSettingsPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const theme = getClubTheme(slug)

  const [selectedTee, setSelectedTee] = useState<TeeOption>('tournament')
  const [eaglesCountTowardGoal, setEaglesCountTowardGoal] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/club/${slug}/login`); return }
      const { data: profile } = await supabase.from('users').select('selected_tee, eagles_count_toward_goal').eq('id', user.id).single()
      if (profile?.selected_tee) setSelectedTee(profile.selected_tee as TeeOption)
      if (profile?.eagles_count_toward_goal != null) setEaglesCountTowardGoal(profile.eagles_count_toward_goal)
      setLoading(false)
    }
    load()
  }, [slug, router])

  async function saveSettings() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('users').update({ selected_tee: selectedTee, eagles_count_toward_goal: eaglesCountTowardGoal }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      router.push(`/club/${slug}`)
      router.refresh()
    }, 800)
  }

  if (!theme || loading) return null

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: theme.primaryLight }}>

      {/* Header */}
      <div style={{ backgroundColor: theme.primary }} className="safe-top">
        <div className="px-4 pt-3 pb-3 flex items-center gap-3">
          <button onClick={() => router.push(`/club/${slug}`)} className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <h1 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Settings</h1>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-sm mx-auto">

        {/* Tee selection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-1">My Tees</h2>
          <p className="text-xs text-gray-400 mb-4">
            Changing your tee updates yardages on your chart going forward.
          </p>
          <div className="space-y-2.5">
            {TEE_OPTIONS.map((tee) => {
              const isSelected = selectedTee === tee.value
              return (
                <button
                  key={tee.value}
                  onClick={() => setSelectedTee(tee.value)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: isSelected ? theme.primary : '#e5e7eb',
                    backgroundColor: isSelected ? theme.primaryLight : '#fff',
                  }}
                >
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: tee.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{tee.label}</p>
                    <p className="text-xs text-gray-400">{TEE_DESCRIPTIONS[tee.value]}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: theme.primary }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

        </div>

        {/* Goal tracking */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
          <h2 className="text-sm font-bold text-gray-900 mb-1">Goal Tracking</h2>
          <p className="text-xs text-gray-400 mb-4">
            Choose what counts as completing a hole toward your facility progress.
          </p>
          <button
            onClick={() => setEaglesCountTowardGoal(!eaglesCountTowardGoal)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all"
            style={{ borderColor: '#e5e7eb' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🦅</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Eagles count toward goal</p>
                <p className="text-xs text-gray-400">Turn off if you only want birdies to count</p>
              </div>
            </div>
            <div
              className="w-11 h-6 rounded-full transition-colors relative shrink-0"
              style={{ backgroundColor: eaglesCountTowardGoal ? theme.primary : '#d1d5db' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: eaglesCountTowardGoal ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </div>
          </button>
        </div>

        {/* Save */}
        <button
          onClick={saveSettings}
          disabled={saving || saved}
          className="w-full mt-4 py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-all"
          style={{ backgroundColor: saved ? '#16a34a' : theme.primary }}
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Info links */}
        <div className="bg-white rounded-2xl shadow-sm mt-4 overflow-hidden divide-y divide-gray-100">
          {[
            { href: `/club/${slug}/faq`, label: 'FAQ' },
            { href: `/newsletter?from=${slug}`, label: 'Newsletter' },
            { href: '/about', label: 'About Birdie Chart' },
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/terms', label: 'Terms of Service' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>{label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* Sign out + Leave club */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mt-4 space-y-3">
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              router.push(`/club/${slug}/login`)
            }}
            className="w-full py-3 rounded-xl text-red-500 font-semibold text-sm border border-red-100 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>

          {!confirmLeave ? (
            <button
              onClick={() => setConfirmLeave(true)}
              className="w-full py-3 rounded-xl text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors"
            >
              Leave Club
            </button>
          ) : (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Leave this club?</p>
              <p className="text-xs text-gray-500 mb-4">
                Your scores and account stay intact — you can rejoin anytime with the member code.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmLeave(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white"
                >
                  Cancel
                </button>
                <button
                  disabled={leaving}
                  onClick={async () => {
                    setLeaving(true)
                    const supabase = createClient()
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) return
                    const { data: club } = await supabase.from('clubs').select('id').eq('slug', slug).single()
                    if (club) {
                      await supabase.from('user_clubs').delete().eq('user_id', user.id).eq('club_id', club.id)
                      await supabase.from('users').update({ club_id: null }).eq('id', user.id)
                    }
                    await supabase.auth.signOut()
                    router.push('/login')
                  }}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold bg-red-500 disabled:opacity-60"
                >
                  {leaving ? 'Leaving...' : 'Yes, Leave'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <ClubNavigation slug={slug} theme={theme} />
    </div>
  )
}
