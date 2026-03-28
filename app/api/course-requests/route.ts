import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendAdminCourseRequestNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { user_id, course_name, location } = await request.json()

  if (!user_id || !course_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('course_requests')
    .insert({ user_id, course_name, location: location || '' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: user } = await admin
    .from('users')
    .select('name, email')
    .eq('id', user_id)
    .single()

  if (user) {
    await sendAdminCourseRequestNotification({
      courseName: course_name,
      location: location || '',
      userName: user.name,
      userEmail: user.email,
    }).catch(() => { /* non-fatal */ })
  }

  return NextResponse.json({ ok: true })
}
