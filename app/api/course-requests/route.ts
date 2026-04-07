import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendAdminCourseRequestNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { user_id, course_name, location, email: directEmail } = await request.json()

  if (!course_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('course_requests')
    .insert({ user_id: user_id || null, course_name, location: location || '' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get contact info — either from the users table (logged-in) or directly from the request
  let userName = 'Guest'
  let userEmail = directEmail || ''

  if (user_id) {
    const { data: user } = await admin
      .from('users')
      .select('name, email')
      .eq('id', user_id)
      .single()
    if (user) { userName = user.name; userEmail = user.email }
  }

  await sendAdminCourseRequestNotification({
    courseName: course_name,
    location: location || '',
    userName,
    userEmail,
  }).catch(() => { /* non-fatal */ })

  return NextResponse.json({ ok: true })
}
