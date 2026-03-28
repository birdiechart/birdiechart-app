import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

function checkAdminPassword(request: NextRequest) {
  const pw = request.headers.get('x-admin-password')
  return pw === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!checkAdminPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('course_requests')
    .select('*, users(name, email)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ requests: data || [] })
}
