'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface Club {
  id: string
  name: string
  slug: string
  primary_color: string
  leaderboard_enabled: boolean
  signup_code: string
  created_at: string
  member_count?: number
}

interface User {
  id: string
  name: string
  email: string
  home_course: string
  created_at: string
  club_id: string | null
}

type Tab = 'overview' | 'clubs' | 'users'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [clubs, setClubs] = useState<Club[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [totalScores, setTotalScores] = useState(0)
  const [filterClub, setFilterClub] = useState<string>('all')

  // Club creation
  const [newClub, setNewClub] = useState({ name: '', slug: '', primary_color: '#1D6B3B', leaderboard_enabled: true })
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState('')
  const [createdCode, setCreatedCode] = useState('')

  // Club editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState({ name: '', primary_color: '', leaderboard_enabled: true, signup_code: '' })
  const [saving, setSaving] = useState(false)

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

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [{ data: clubData }, { data: userData }, { data: scoreData }, { data: memberData }] = await Promise.all([
      supabase.from('clubs').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('id, name, email, home_course, created_at, club_id').order('created_at', { ascending: false }),
      supabase.from('hole_scores').select('id', { count: 'exact', head: true }),
      supabase.from('user_clubs').select('club_id'),
    ])

    // Count members per club
    const memberCounts: Record<string, number> = {}
    for (const row of (memberData || [])) {
      memberCounts[row.club_id] = (memberCounts[row.club_id] || 0) + 1
    }

    setClubs((clubData || []).map((c: Club) => ({ ...c, member_count: memberCounts[c.id] || 0 })))
    setUsers(userData || [])
    setTotalScores((scoreData as unknown as { count: number })?.count || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) loadData()
  }, [authed, loadData])

  async function createClub(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateMsg('')
    setCreatedCode('')
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
      setCreatedCode(code)
      setCreateMsg('success')
      setNewClub({ name: '', slug: '', primary_color: '#1D6B3B', leaderboard_enabled: true })
      loadData()
    }
    setCreating(false)
  }

  async function saveEdit(clubId: string) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('clubs').update({
      name: editFields.name,
      primary_color: editFields.primary_color,
      leaderboard_enabled: editFields.leaderboard_enabled,
      signup_code: editFields.signup_code,
    }).eq('id', clubId)
    setEditingId(null)
    setSaving(false)
    loadData()
  }

  async function regenCode(clubId: string) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const supabase = createClient()
    await supabase.from('clubs').update({ signup_code: code }).eq('id', clubId)
    loadData()
  }

  function exportCSV() {
    const filtered = filterClub === 'all' ? users : users.filter((u) => u.club_id === filterClub)
    const header = 'Name,Email,Home Course,Joined\n'
    const rows = filtered.map((u) =>
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

  const filteredUsers = filterClub === 'all' ? users : users.filter((u) => u.club_id === filterClub)
  const newThisWeek = users.filter((u) => {
    const d = new Date(u.created_at)
    const week = new Date()
    week.setDate(week.getDate() - 7)
    return d > week
  }).length

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>Admin</h1>
          <p className="text-sm text-gray-400 mb-6">Birdie Chart dashboard</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: '#1D6B3B' }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>Birdie Chart Admin</h1>
          <button onClick={loadData} className="text-xs text-gray-400 hover:text-gray-600">Refresh</button>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2">
          {(['overview', 'clubs', 'users'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full text-sm font-medium capitalize"
              style={{ backgroundColor: activeTab === tab ? '#1D6B3B' : '#f3f4f6', color: activeTab === tab ? 'white' : '#374151' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading && <p className="text-gray-400 text-sm">Loading...</p>}

        {/* OVERVIEW */}
        {activeTab === 'overview' && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Members', value: users.length },
              { label: 'New This Week', value: newThisWeek },
              { label: 'White-Label Clubs', value: clubs.length },
              { label: 'Total Scores Logged', value: totalScores.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-sm">Clubs at a Glance</h2>
              <div className="space-y-2">
                {clubs.map((club) => (
                  <div key={club.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: club.primary_color }} />
                      <span className="text-sm font-medium text-gray-900">{club.name}</span>
                      <span className="text-xs text-gray-400">{club.slug}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-700">{club.member_count} members</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${club.leaderboard_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {club.leaderboard_enabled ? 'Leaderboard on' : 'off'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CLUBS */}
        {activeTab === 'clubs' && !loading && (
          <div className="space-y-4">
            {/* Club list */}
            {clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-2xl p-5 shadow-sm">
                {editingId === club.id ? (
                  <div className="space-y-3">
                    <input
                      value={editFields.name}
                      onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                      placeholder="Club name"
                    />
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600">Color:</label>
                      <input
                        type="color"
                        value={editFields.primary_color}
                        onChange={(e) => setEditFields({ ...editFields, primary_color: e.target.value })}
                        className="h-8 w-12 rounded border border-gray-200 cursor-pointer"
                      />
                      <label className="text-sm text-gray-600 ml-4">Signup code:</label>
                      <input
                        value={editFields.signup_code}
                        onChange={(e) => setEditFields({ ...editFields, signup_code: e.target.value.toUpperCase() })}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-mono w-32"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFields.leaderboard_enabled}
                        onChange={(e) => setEditFields({ ...editFields, leaderboard_enabled: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700">Leaderboard enabled</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(club.id)}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                        style={{ backgroundColor: '#1D6B3B' }}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-600">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: club.primary_color }} />
                        <div>
                          <p className="font-bold text-gray-900">{club.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            /{club.slug} · Code: <span className="font-mono font-semibold">{club.signup_code}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-gray-700">{club.member_count} members</span>
                        <button
                          onClick={() => { setEditingId(club.id); setEditFields({ name: club.name, primary_color: club.primary_color, leaderboard_enabled: club.leaderboard_enabled, signup_code: club.signup_code }) }}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => regenCode(club.id)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200"
                        >
                          New Code
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${club.leaderboard_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {club.leaderboard_enabled ? 'Leaderboard on' : 'Leaderboard off'}
                      </span>
                      <span className="text-[10px] text-gray-400 px-2 py-0.5 rounded-full bg-gray-50">
                        Created {new Date(club.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Create club */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Create New Club</h2>
              <form onSubmit={createClub} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Club name (e.g. The Landings Golf Club)"
                  value={newClub.name}
                  onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="URL slug (e.g. landings)"
                  value={newClub.slug}
                  onChange={(e) => setNewClub({ ...newClub, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none"
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

                {createMsg === 'success' && createdCode && (
                  <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                    <p className="text-sm font-bold text-green-800 mb-1">Club created!</p>
                    <p className="text-sm text-green-700">Signup code: <span className="font-mono font-bold">{createdCode}</span></p>
                    <div className="mt-3 pt-3 border-t border-green-100">
                      <p className="text-xs font-semibold text-green-800 mb-1">Still needed in code:</p>
                      <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
                        <li>Add entry to <code className="bg-green-100 px-1 rounded">lib/club-themes.ts</code> with slug, colors, logo path</li>
                        <li>Add logo file to <code className="bg-green-100 px-1 rounded">/public/</code></li>
                        <li>Add subdomain DNS record in Namecheap</li>
                        <li>Add subdomain in Vercel domains</li>
                        <li>Add subdomain to Supabase Auth redirect URLs</li>
                      </ol>
                    </div>
                  </div>
                )}
                {createMsg && createMsg !== 'success' && (
                  <p className="text-sm text-red-500">{createMsg}</p>
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
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && !loading && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-gray-900">Members ({filteredUsers.length})</h2>
                <select
                  value={filterClub}
                  onChange={(e) => setFilterClub(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none"
                >
                  <option value="all">All clubs</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="">No club (main app)</option>
                </select>
              </div>
              <button
                onClick={exportCSV}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: '#1D6B3B' }}
              >
                Export CSV
              </button>
            </div>
            <div className="space-y-2">
              {filteredUsers.map((u) => {
                const club = clubs.find((c) => c.id === u.club_id)
                return (
                  <div key={u.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900">{u.name}</p>
                          {club && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: club.primary_color }}>
                              {club.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                      </div>
                      <p className="text-[10px] text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )
              })}
              {filteredUsers.length === 0 && <p className="text-sm text-gray-400">No members found</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
