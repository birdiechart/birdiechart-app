import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  // Verify webhook secret to prevent unauthorized calls
  const secret = request.headers.get('x-webhook-secret')
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json()

  // Supabase sends the new row as payload.record
  const user = payload.record
  if (!user?.email || !user?.name) {
    return NextResponse.json({ ok: true }) // nothing to do
  }

  await sendWelcomeEmail({
    userEmail: user.email,
    userName: user.name,
  }).catch(() => { /* non-fatal */ })

  return NextResponse.json({ ok: true })
}
