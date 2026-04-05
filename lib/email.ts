import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

export async function sendAdminCourseRequestNotification({
  courseName,
  location,
  userName,
  userEmail,
}: {
  courseName: string
  location: string
  userName: string
  userEmail: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || !process.env.RESEND_API_KEY) return

  await getResend().emails.send({
    from: 'Birdie Chart <hello@birdiechart.golf>',
    to: adminEmail,
    subject: `New course request: ${courseName}`,
    html: `
      <p>A user has requested a new golf course be added to Birdie Chart.</p>
      <table style="border-collapse:collapse;margin-top:12px">
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px">Course</td><td style="padding:4px 0;font-size:14px;font-weight:600">${courseName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px">Location</td><td style="padding:4px 0;font-size:14px">${location || '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px">Requested by</td><td style="padding:4px 0;font-size:14px">${userName} (${userEmail})</td></tr>
      </table>
      <p style="margin-top:16px"><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://birdiechart.app'}/admin" style="color:#1D6B3B">View in admin dashboard →</a></p>
    `,
  })
}

export async function sendUserCourseAddedNotification({
  courseName,
  userEmail,
  userName,
}: {
  courseName: string
  userEmail: string
  userName: string
}) {
  if (!process.env.RESEND_API_KEY) return

  await getResend().emails.send({
    from: 'Birdie Chart <hello@birdiechart.golf>',
    to: userEmail,
    subject: `${courseName} is now on Birdie Chart`,
    html: `
      <p>Hi ${userName},</p>
      <p>Good news — <strong>${courseName}</strong> has been added to Birdie Chart. You can now search for it and start tracking your birdies.</p>
      <p style="margin-top:16px"><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://birdiechart.app'}/courses" style="background:#1D6B3B;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Find the course →</a></p>
      <p style="margin-top:24px;color:#9ca3af;font-size:13px">Happy birdie hunting,<br>The Birdie Chart team</p>
    `,
  })
}
