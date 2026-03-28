'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { CourseRequest } from '@/lib/types'

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

interface AdminCourse {
  id: string
  name: string
  location: string
  holes: number
  is_landings: boolean
  created_at: string
  hole_details: { id: string; hole_number: number; par: number; yardage: number }[]
}

interface HoleInput {
  hole_number: number
  par: number
  yardage: number
}

type Tab = 'overview' | 'clubs' | 'users' | 'requests' | 'courses'

function defaultHoles(count: number): HoleInput[] {
  return Array.from({ length: count }, (_, i) => ({ hole_number: i + 1, par: 4, yardage: 380 }))
}

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

  // Requests
  const [requests, setRequests] = useState<CourseRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [addForms, setAddForms] = useState<Record<string, { course_name: string; location: string; holes: number; hole_details: HoleInput[] }>>({})
  const [completingRequest, setCompletingRequest] = useState<string | null>(null)
  const [completeMsg, setCompleteMsg] = useState<Record<string, string>>({})

  // Courses
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [editForms, setEditForms] = useState<Record<string, { name: string; location: string; holes: number; hole_details: HoleInput[] }>>({})
  const [savingCourse, setSavingCourse] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<Record<string, string>>({})

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
    const memberCounts: Record<string, number> = {}
    for (const row of (memberData || [])) {
      memberCounts[row.club_id] = (memberCounts[row.club_id] || 0) + 1
    }
    setClubs((clubData || []).map((c: Club) => ({ ...c, member_count: memberCounts[c.id] || 0 })))
    setUsers(userData || [])
    setTotalScores((scoreData as unknown as { count: number })?.count || 0)
    setLoading(false)
  }, [])

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true)
    const res = await fetch('/api/admin/requests', { headers: { 'x-admin-password': password } })
    const data = await res.json()
    setRequests(data.requests || [])
    setLoadingRequests(false)
  }, [password])

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true)
    const res = await fetch('/api/admin/courses', { headers: { 'x-admin-password': password } })
    const data = await res.json()
    setCourses(data.courses || [])
    setLoadingCourses(false)
  }, [password])

  useEffect(() => {
    if (!authed) return
    if (activeTab === 'overview' || activeTab === 'clubs' || activeTab === 'users') loadData()
    if (activeTab === 'requests') loadRequests()
    if (activeTab === 'courses') loadCourses()
  }, [authed, activeTab, loadData, loadRequests, loadCourses])

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
    if (error) { setCreateMsg('Error: ' + error.message) } else {
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

  function openAddForm(req: CourseRequest) {
    if (expandedRequest === req.id) { setExpandedRequest(null); return }
    setExpandedRequest(req.id)
    if (!addForms[req.id]) {
      setAddForms(prev => ({ ...prev, [req.id]: { course_name: req.course_name, location: req.location, holes: 18, hole_details: defaultHoles(18) } }))
    }
  }

  function updateAddForm(id: string, patch: Partial<{ course_name: string; location: string; holes: number; hole_details: HoleInput[] }>) {
    setAddForms(prev => {
      const existing = prev[id]
      const updated = { ...existing, ...patch }
      if (patch.holes && patch.holes !== existing.holes) {
        updated.hole_details = defaultHoles(patch.holes).map(h => existing.hole_details.find(e => e.hole_number === h.hole_number) || h)
      }
      return { ...prev, [id]: updated }
    })
  }

  function updateAddHole(reqId: string, holeNum: number, field: 'par' | 'yardage', value: number) {
    setAddForms(prev => ({
      ...prev,
      [reqId]: { ...prev[reqId], hole_details: prev[reqId].hole_details.map(h => h.hole_number === holeNum ? { ...h, [field]: value } : h) },
    }))
  }

  async function completeRequest(reqId: string) {
    const form = addForms[reqId]
    if (!form) return
    setCompletingRequest(reqId)
    setCompleteMsg(prev => ({ ...prev, [reqId]: '' }))
    const res = await fetch('/api/admin/requests/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_password: password, request_id: reqId, course_name: form.course_name, location: form.location, holes: form.holes, hole_details: form.hole_details }),
    })
    const data = await res.json()
    if (data.ok) {
      setCompleteMsg(prev => ({ ...prev, [reqId]: 'Course added and user notified!' }))
      setExpandedRequest(null)
      await loadRequests()
    } else {
      setCompleteMsg(prev => ({ ...prev, [reqId]: 'Error: ' + (data.error || 'Unknown error') }))
    }
    setCompletingRequest(null)
  }

  function openEditCourse(course: AdminCourse) {
    if (editingCourse === course.id) { setEditingCourse(null); return }
    setEditingCourse(course.id)
    const sortedHoles = [...course.hole_details].sort((a, b) => a.hole_number - b.hole_number)
    setEditForms(prev => ({
      ...prev,
      [course.id]: {
        name: course.name, location: course.location, holes: course.holes,
        hole_details: sortedHoles.length > 0 ? sortedHoles.map(h => ({ hole_number: h.hole_number, par: h.par, yardage: h.yardage })) : defaultHoles(course.holes),
      },
    }))
  }

  function updateEditForm(id: string, patch: Partial<{ name: string; location: string; holes: number; hole_details: HoleInput[] }>) {
    setEditForms(prev => {
      const existing = prev[id]
      const updated = { ...existing, ...patch }
      if (patch.holes && patch.holes !== existing.holes) {
        updated.hole_details = defaultHoles(patch.holes).map(h => existing.hole_details.find(e => e.hole_number === h.hole_number) || h)
      }
      return { ...prev, [id]: updated }
    })
  }

  function updateEditHole(courseId: string, holeNum: number, field: 'par' | 'yardage', value: number) {
    setEditForms(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], hole_details: prev[courseId].hole_details.map(h => h.hole_number === holeNum ? { ...h, [field]: value } : h) },
    }))
  }

  async function saveCourse(courseId: string) {
    const form = editForms[courseId]
    if (!form) return
    setSavingCourse(courseId)
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_password: password, name: form.name, location: form.location, holes: form.holes, hole_details: form.hole_details }),
    })
    const data = await res.json()
    if (data.ok) { setSaveMsg(prev => ({ ...prev, [courseId]: 'Saved!' })); setEditingCourse(null); await loadCourses() }
    else { setSaveMsg(prev => ({ ...prev, [courseId]: 'Error: ' + (data.error || 'Unknown') })) }
    setSavingCourse(null)
  }

  const filteredUsers = filterClub === 'all' ? users : users.filter((u) => u.club_id === filterClub)
  const newThisWeek = users.filter((u) => { const d = new Date(u.created_at); const week = new Date(); week.setDate(week.getDate() - 7); return d > week }).length
  const pendingCount = requests.filter(r => r.status === 'pending').length

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>Admin</h1>
          <p className="text-sm text-gray-400 mb-6">Birdie Chart dashboard</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: '#1D6B3B' }}>Enter</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>Birdie Chart Admin</h1>
          <button onClick={loadData} className="text-xs text-gray-400 hover:text-gray-600">Refresh</button>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 flex-wrap">
          {(['overview', 'clubs', 'users', 'requests', 'courses'] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full text-sm font-medium capitalize relative"
              style={{ backgroundColor: activeTab === tab ? '#1D6B3B' : '#f3f4f6', color: activeTab === tab ? 'white' : '#374151' }}>
              {tab}
              {tab === 'requests' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{pendingCount}</span>
              )}
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
            {clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-2xl p-5 shadow-sm">
                {editingId === club.id ? (
                  <div className="space-y-3">
                    <input value={editFields.name} onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Club name" />
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600">Color:</label>
                      <input type="color" value={editFields.primary_color} onChange={(e) => setEditFields({ ...editFields, primary_color: e.target.value })}
                        className="h-8 w-12 rounded border border-gray-200 cursor-pointer" />
                      <label className="text-sm text-gray-600 ml-4">Signup code:</label>
                      <input value={editFields.signup_code} onChange={(e) => setEditFields({ ...editFields, signup_code: e.target.value.toUpperCase() })}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-mono w-32" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editFields.leaderboard_enabled} onChange={(e) => setEditFields({ ...editFields, leaderboard_enabled: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm text-gray-700">Leaderboard enabled</span>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(club.id)} disabled={saving}
                        className="px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: '#1D6B3B' }}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-600">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: club.primary_color }} />
                        <div>
                          <p className="font-bold text-gray-900">{club.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">/{club.slug} · Code: <span className="font-mono font-semibold">{club.signup_code}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-gray-700">{club.member_count} members</span>
                        <button onClick={() => { setEditingId(club.id); setEditFields({ name: club.name, primary_color: club.primary_color, leaderboard_enabled: club.leaderboard_enabled, signup_code: club.signup_code }) }}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200">Edit</button>
                        <button onClick={() => regenCode(club.id)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200">New Code</button>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${club.leaderboard_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {club.leaderboard_enabled ? 'Leaderboard on' : 'Leaderboard off'}
                      </span>
                      <span className="text-[10px] text-gray-400 px-2 py-0.5 rounded-full bg-gray-50">Created {new Date(club.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Create New Club</h2>
              <form onSubmit={createClub} className="space-y-3">
                <input type="text" required placeholder="Club name (e.g. The Landings Golf Club)" value={newClub.name}
                  onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
                <input type="text" required placeholder="URL slug (e.g. landings)" value={newClub.slug}
                  onChange={(e) => setNewClub({ ...newClub, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none" />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Primary color:</label>
                  <input type="color" value={newClub.primary_color} onChange={(e) => setNewClub({ ...newClub, primary_color: e.target.value })}
                    className="h-9 w-16 rounded cursor-pointer border border-gray-200" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newClub.leaderboard_enabled} onChange={(e) => setNewClub({ ...newClub, leaderboard_enabled: e.target.checked })} className="w-4 h-4 rounded" />
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
                {createMsg && createMsg !== 'success' && <p className="text-sm text-red-500">{createMsg}</p>}
                <button type="submit" disabled={creating}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: '#1D6B3B' }}>
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
                <select value={filterClub} onChange={(e) => setFilterClub(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none">
                  <option value="all">All clubs</option>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="">No club (main app)</option>
                </select>
              </div>
              <button onClick={exportCSV} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: '#1D6B3B' }}>Export CSV</button>
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
                          {club && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: club.primary_color }}>{club.name}</span>}
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

        {/* REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {loadingRequests && <p className="text-gray-400 text-sm">Loading...</p>}
            {!loadingRequests && requests.length === 0 && <p className="text-sm text-gray-400">No course requests yet</p>}
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900">{req.course_name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{req.status}</span>
                      </div>
                      {req.location && <p className="text-sm text-gray-500 mt-0.5">{req.location}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Requested by <span className="font-medium text-gray-600">{req.users?.name}</span> ({req.users?.email})
                        &nbsp;·&nbsp;{new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {req.status === 'pending' && (
                      <button onClick={() => openAddForm(req)}
                        className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: expandedRequest === req.id ? '#374151' : '#1D6B3B' }}>
                        {expandedRequest === req.id ? 'Cancel' : 'Add Course'}
                      </button>
                    )}
                  </div>
                  {completeMsg[req.id] && (
                    <p className={`mt-2 text-sm ${completeMsg[req.id].startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{completeMsg[req.id]}</p>
                  )}
                </div>
                {expandedRequest === req.id && addForms[req.id] && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Add Course Details</h3>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Course name</label>
                        <input type="text" value={addForms[req.id].course_name} onChange={(e) => updateAddForm(req.id, { course_name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
                        <input type="text" value={addForms[req.id].location} onChange={(e) => updateAddForm(req.id, { location: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">Number of holes</label>
                        <div className="flex gap-2">
                          {[9, 18].map(n => (
                            <button key={n} type="button" onClick={() => updateAddForm(req.id, { holes: n })}
                              className="px-5 py-2 rounded-xl border-2 text-sm font-bold transition-colors"
                              style={{ borderColor: addForms[req.id].holes === n ? '#1D6B3B' : '#e5e7eb', color: addForms[req.id].holes === n ? '#1D6B3B' : '#6b7280', backgroundColor: addForms[req.id].holes === n ? '#f0fdf4' : 'white' }}>
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Hole Details</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr><th className="text-xs text-gray-400 font-medium pb-2 pr-3 w-12 text-left">Hole</th><th className="text-xs text-gray-400 font-medium pb-2 pr-3 w-24 text-left">Par</th><th className="text-xs text-gray-400 font-medium pb-2 text-left">Yardage</th></tr>
                        </thead>
                        <tbody>
                          {addForms[req.id].hole_details.map((h) => (
                            <tr key={h.hole_number}>
                              <td className="pr-3 py-0.5"><span className="text-xs font-semibold text-gray-500 w-6 inline-block">{h.hole_number}</span></td>
                              <td className="pr-3 py-0.5"><input type="number" min={3} max={5} value={h.par} onChange={(e) => updateAddHole(req.id, h.hole_number, 'par', parseInt(e.target.value) || 4)} className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:outline-none bg-white" /></td>
                              <td className="py-0.5"><input type="number" min={50} max={700} value={h.yardage} onChange={(e) => updateAddHole(req.id, h.hole_number, 'yardage', parseInt(e.target.value) || 380)} className="w-24 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:outline-none bg-white" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={() => completeRequest(req.id)} disabled={completingRequest === req.id}
                      className="mt-5 w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ backgroundColor: '#1D6B3B' }}>
                      {completingRequest === req.id ? 'Adding course...' : 'Add Course & Notify User'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* COURSES */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {loadingCourses && <p className="text-gray-400 text-sm">Loading...</p>}
            {!loadingCourses && courses.length === 0 && <p className="text-sm text-gray-400">No courses in the database</p>}
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{course.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{course.location || 'No location'} · {course.holes} holes{course.is_landings ? ' · Landings' : ''}</p>
                    </div>
                    <button onClick={() => openEditCourse(course)}
                      className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600"
                      style={editingCourse === course.id ? { backgroundColor: '#374151', color: 'white', borderColor: '#374151' } : {}}>
                      {editingCourse === course.id ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  {saveMsg[course.id] && (
                    <p className={`mt-2 text-sm ${saveMsg[course.id].startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{saveMsg[course.id]}</p>
                  )}
                </div>
                {editingCourse === course.id && editForms[course.id] && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4 bg-gray-50">
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Course name</label>
                        <input type="text" value={editForms[course.id].name} onChange={(e) => updateEditForm(course.id, { name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
                        <input type="text" value={editForms[course.id].location} onChange={(e) => updateEditForm(course.id, { location: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">Number of holes</label>
                        <div className="flex gap-2">
                          {[9, 18].map(n => (
                            <button key={n} type="button" onClick={() => updateEditForm(course.id, { holes: n })}
                              className="px-5 py-2 rounded-xl border-2 text-sm font-bold transition-colors"
                              style={{ borderColor: editForms[course.id].holes === n ? '#1D6B3B' : '#e5e7eb', color: editForms[course.id].holes === n ? '#1D6B3B' : '#6b7280', backgroundColor: editForms[course.id].holes === n ? '#f0fdf4' : 'white' }}>
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {editForms[course.id].hole_details.length > 0 && (
                      <>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Hole Details</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr><th className="text-xs text-gray-400 font-medium pb-2 pr-3 w-12 text-left">Hole</th><th className="text-xs text-gray-400 font-medium pb-2 pr-3 w-24 text-left">Par</th><th className="text-xs text-gray-400 font-medium pb-2 text-left">Yardage</th></tr>
                            </thead>
                            <tbody>
                              {editForms[course.id].hole_details.map((h) => (
                                <tr key={h.hole_number}>
                                  <td className="pr-3 py-0.5"><span className="text-xs font-semibold text-gray-500 w-6 inline-block">{h.hole_number}</span></td>
                                  <td className="pr-3 py-0.5"><input type="number" min={3} max={5} value={h.par} onChange={(e) => updateEditHole(course.id, h.hole_number, 'par', parseInt(e.target.value) || 4)} className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:outline-none bg-white" /></td>
                                  <td className="py-0.5"><input type="number" min={50} max={700} value={h.yardage} onChange={(e) => updateEditHole(course.id, h.hole_number, 'yardage', parseInt(e.target.value) || 380)} className="w-24 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:outline-none bg-white" /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                    <button onClick={() => saveCourse(course.id)} disabled={savingCourse === course.id}
                      className="mt-5 w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ backgroundColor: '#1D6B3B' }}>
                      {savingCourse === course.id ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
