import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendUserCourseAddedNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  const {
    admin_password,
    request_id,
    course_name,
    location,
    holes,
    hole_details,
  } = await request.json()

  if (admin_password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!request_id || !course_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Create the course
  const { data: course, error: courseError } = await admin
    .from('courses')
    .insert({ name: course_name, location: location || '', holes: holes || 18, is_landings: false })
    .select()
    .single()

  if (courseError) {
    return NextResponse.json({ error: courseError.message }, { status: 500 })
  }

  // Insert hole details if provided
  if (hole_details && hole_details.length > 0) {
    await admin.from('hole_details').insert(
      hole_details.map((h: { hole_number: number; par: number; yardage: number }) => ({
        course_id: course.id,
        hole_number: h.hole_number,
        par: h.par,
        yardage: h.yardage,
      }))
    )
  }

  // Mark request as completed
  const { data: req, error: reqError } = await admin
    .from('course_requests')
    .update({ status: 'added', completed_at: new Date().toISOString() })
    .eq('id', request_id)
    .select('user_id')
    .single()

  if (reqError) {
    return NextResponse.json({ error: reqError.message }, { status: 500 })
  }

  // Notify the user
  const { data: user } = await admin
    .from('users')
    .select('name, email')
    .eq('id', req.user_id)
    .single()

  if (user) {
    await sendUserCourseAddedNotification({
      courseName: course_name,
      userEmail: user.email,
      userName: user.name,
    }).catch(() => { /* non-fatal */ })
  }

  return NextResponse.json({ ok: true, course_id: course.id })
}
