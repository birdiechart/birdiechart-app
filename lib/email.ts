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
    from: 'Birdie Chart <team@birdiechart.golf>',
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
    from: 'Birdie Chart <team@birdiechart.golf>',
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

export async function sendWelcomeEmail({
  userEmail,
  userName,
}: {
  userEmail: string
  userName: string
}) {
  if (!process.env.RESEND_API_KEY) return

  await getResend().emails.send({
    from: 'Birdie Chart <team@birdiechart.golf>',
    to: userEmail,
    subject: 'Can you birdie every hole at your course?',
    html: `
      <div style="display:none;max-height:0;overflow:hidden;color:#ffffff;font-size:1px">One hole at a time. The challenge starts now.</div>
      <p>Hey ${userName},</p>
      <p>It started as a simple game with my kids.</p>
      <p>We live on a golf course — six of them actually — and one day we just asked ourselves: have we ever birdied every hole out here? Not in one round. Not even in one season. Just... ever?</p>
      <p>Turns out we hadn't. And once we started paying attention, we couldn't stop.</p>
      <p><strong>That's Birdie Chart.</strong></p>
      <p>Forget the low round. Forget hitting every fairway. Forget the three putts and the drives that found the water. Sometimes everything comes together on one hole — the perfect iron, the putt that finally drops — and that moment deserves to be remembered.</p>
      <p>Don't you want to know you're at least capable of birdying every hole at your favorite course? The club you've belonged to for fifteen years. The muni you play every Saturday morning. The course you know better than anyone.</p>
      <p>Now's your chance to find out.</p>
      <p>Here's how it works — it's simple on purpose. After your round, save Birdie Chart to your home screen, open it up, and log the birdies you made. You remember them. Every golfer remembers their birdies. Just tap the hole, mark it down, and it's yours forever.</p>
      <p>No GPS. No shot tracking. No phone out on every hole. Just you, your round, and a cold drink at the 19th hole while you check off the holes you finally got.</p>
      <p>You'll know exactly which holes you've conquered and which ones still have your number.</p>
      <p>It's fun. It's a challenge. And if you want to start fresh every season — go for it. Some people treat it like an annual reset. Others are going on year three still chasing that one stubborn par three.</p>
      <p>Either way, the challenge is waiting.</p>
      <p style="margin-top:24px"><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://birdiechart.golf'}/chart" style="background:#1D6B3B;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Go to your Birdie Chart →</a></p>
      <p style="margin-top:24px">One birdie at a time.</p>
      <p>— Britt<br>Birdie Chart</p>
      <p style="margin-top:16px"><em>P.S. If your course isn't in our list yet, hit <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://birdiechart.golf'}/courses" style="color:#1D6B3B">Request a Course</a> and we'll get it added. We want every golfer's home course in here.</em></p>
    `,
  })
}
