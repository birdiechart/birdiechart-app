'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Club } from '@/lib/types'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<'clubs' | 'users'>('clubs')
  const [clubs, setClubs] = useState<Club[]>([])
  const [users, setUsers] = useState<{ id: string; name: string; email: string; home_course: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(false)

  // Club creation state
  const [newClub, setNewClub] = useState({
    name: '',
    slug: '',
    primary_color: '#1D6B3B',
    leaderboard_enabled: true,
  })
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState('')

  function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    fetch('/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.json()).then((d) => {
      if (d.ok) setAuthed(true)
      else setAuthError('Incorrect password')
    })
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    const supabase = createClient()
    Promise.all([
      supabase.from('clubs').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('id, name, email, home_course, created_at').order('created_at', { ascending: false }),
    ]).then(([{ data: c }, { data: u }]) => {
      setClubs(c || [])
      setUsers(u || [])
      setLoading(false)
    })
  }, [authed])

  async function createClub(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateMsg('')
    const supabase = createClient()
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error } = await supabase.from('clubs').insert({
      name: newClub.name,
      slug: newClub.slug.toLowerCase().replace(/\s+/g, '-'),
      primary_color: newClub.primary_color,
      leaderboard_enabled: newClub.leaderboard_enabled,
      signup_code: code,
      courses: [],
    })

    if (error) {
      setCreateMsg('Error: ' + error.message)
    } else {
      setCreateMsg(`Club created! Signup code: ${code}`)
      setNewClub({ name: '', slug: '', primary_color: '#1D6B3B', leaderboard_enabled: true })
      const { data } = await supabase.from('clubs').select('*').order('created_at', { ascending: false })
      setClubs(data || [])
    }
    setCreating(false)
  }

  function exportCSV() {
    const header = 'Name,Email,Home Course,Joined\n'
    const rows = users.map((u) =>
      `"${u.name}","${u.email}","${u.home_course}","${new Date(u.created_at).toLocaleDateString()}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'birdie-chart-members.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
            Admin
          </h1>
          <p className="text-sm text-gray-400 mb-6">Birdie Chart dashboard</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
            />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: '#1D6B3B' }}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            Birdie Chart Admin
          </h1>
          <div className="flex gap-4 mt-4">
            {(['clubs', 'users'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 rounded-full text-sm font-medium capitalize"
                style={{
                  backgroundColor: activeTab === tab ? '#1D6B3B' : '#f3f4f6',
                  color: activeTab === tab ? 'white' : '#374151',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading && <p className="text-gray-400 text-sm">Loading...</p>}

        {activeTab === 'clubs' && !loading && (
          <div className="space-y-6">
            {/* Create club */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Create New Club</h2>
              <form onSubmit={createClub} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Club name"
                  value={newClub.name}
                  onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="URL slug (e.g. the-landings)"
                  value={newClub.slug}
                  onChange={(e) => setNewClub({ ...newClub, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Primary color:</label>
                  <input
                    type="color"
                    value={newClub.primary_color}
                    onChange={(e) => setNewClub({ ...newClub, primary_color: e.target.value })}
                    className="h-9 w-16 rounded cursor-pointer border border-gray-200"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newClub.leaderboard_enabled}
                    onChange={(e) => setNewClub({ ...newClub, leaderboard_enabled: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable leaderboard</span>
                </label>
                {createMsg && (
                  <p className={`text-sm ${createMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                    {createMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                  style={{ backgroundColor: '#1D6B3B' }}
                >
                  {creating ? 'Creating...' : 'Create Club'}
                </button>
              </form>
            </div>

            {/* Club list */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Clubs ({clubs.length})</h2>
              <div className="space-y-3">
                {clubs.map((club) => (
                  <div key={club.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{club.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">/join/{club.slug} &middot; Code: {club.signup_code}</p>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: club.primary_color }}
                      />
                    </div>
                    <div className="mt-2 flex gap-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${club.leaderboard_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {club.leaderboard_enabled ? 'Leaderboard on' : 'Leaderboard off'}
                      </span>
                    </div>
                  </div>
                ))}
                {clubs.length === 0 && <p className="text-sm text-gray-400">No clubs yet</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && !loading && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Members ({users.length})</h2>
              <button
                onClick={exportCSV}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: '#1D6B3B' }}
              >
                Export CSV
              </button>
            </div>
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email} &middot; {u.home_course}</p>
                    </div>
                    <p className="text-[10px] text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p className="text-sm text-gray-400">No users yet</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
