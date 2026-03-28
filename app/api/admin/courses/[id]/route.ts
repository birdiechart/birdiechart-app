import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin_password, name, location, holes, hole_details } = await request.json()
  const { id } = await params

  if (admin_password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { error: courseError } = await admin
    .from('courses')
    .update({ name, location, holes })
    .eq('id', id)

  if (courseError) {
    return NextResponse.json({ error: courseError.message }, { status: 500 })
  }

  if (hole_details && hole_details.length > 0) {
    // Delete existing hole details and re-insert
    await admin.from('hole_details').delete().eq('course_id', id)
    await admin.from('hole_details').insert(
      hole_details.map((h: { hole_number: number; par: number; yardage: number }) => ({
        course_id: id,
        hole_number: h.hole_number,
        par: h.par,
        yardage: h.yardage,
      }))
    )
  }

  return NextResponse.json({ ok: true })
}
