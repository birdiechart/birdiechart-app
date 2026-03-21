'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [eaglesCountTowardGoal, setEaglesCountTowardGoal] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('eagles_count_toward_goal').eq('id', user.id).single()
      if (profile?.eagles_count_toward_goal != null) setEaglesCountTowardGoal(profile.eagles_count_toward_goal)
      setLoading(false)
    }
    load()
  }, [router])

  async function saveSettings() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('users').update({ eagles_count_toward_goal: eaglesCountTowardGoal }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      router.push('/chart')
      router.refresh()
    }, 800)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white safe-top" style={{ boxShadow: '0 1px 0 0 #e5e7eb' }}>
        <div className="px-4 pt-3 pb-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/chart')}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <h1 className="text-base font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>Settings</h1>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-sm mx-auto">

        {/* Goal tracking */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-1">Goal Tracking</h2>
          <p className="text-xs text-gray-400 mb-4">
            Choose what counts as completing a hole toward your course progress.
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
              style={{ backgroundColor: eaglesCountTowardGoal ? '#1D6B3B' : '#d1d5db' }}
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
          style={{ backgroundColor: saved ? '#16a34a' : '#1D6B3B' }}
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
        </button>

      </div>
    </div>
  )
}
