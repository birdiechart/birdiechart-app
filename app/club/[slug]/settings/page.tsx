'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getClubTheme } from '@/lib/club-themes'
import { TEE_OPTIONS, TeeOption } from '@/lib/landings-data'

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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/club/${slug}/login`); return }
      const { data: profile } = await supabase.from('users').select('selected_tee').eq('id', user.id).single()
      if (profile?.selected_tee) setSelectedTee(profile.selected_tee as TeeOption)
      setLoading(false)
    }
    load()
  }, [slug, router])

  async function saveTee() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('users').update({ selected_tee: selectedTee }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!theme || loading) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.primaryLight }}>

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

          <button
            onClick={saveTee}
            disabled={saving || saved}
            className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-all"
            style={{ backgroundColor: saved ? '#16a34a' : theme.primary }}
          >
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Sign out */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
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
        </div>

      </div>
    </div>
  )
}
