import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')
  if (!name) return NextResponse.json({ holes: null })

  const apiKey = process.env.GOLF_COURSE_API_KEY
  if (!apiKey) return NextResponse.json({ holes: null })

  try {
    const res = await fetch(
      `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(name)}`,
      { headers: { Authorization: `Key ${apiKey}` } }
    )

    if (!res.ok) return NextResponse.json({ holes: null })

    const data = await res.json()
    const courses = data.courses || []
    if (courses.length === 0) return NextResponse.json({ holes: null })

    // Use the first result, pick the first male tee (or any tee)
    const course = courses[0]
    const tees = course.tees?.male || course.tees?.female || []
    if (tees.length === 0) return NextResponse.json({ holes: null })

    const tee = tees[0]
    const holes = (tee.holes || []).map((h: { par: number; yardage: number; handicap: number }, i: number) => ({
      hole_number: i + 1,
      par: h.par,
      yardage: h.yardage,
      handicap: h.handicap,
    }))

    return NextResponse.json({ holes, tee_name: tee.tee_name })
  } catch (error) {
    console.error('GolfCourseAPI error:', error)
    return NextResponse.json({ holes: null })
  }
}
