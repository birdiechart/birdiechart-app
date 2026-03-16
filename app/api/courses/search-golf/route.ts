import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json({ results: [] })

  const apiKey = process.env.GOLF_COURSE_API_KEY
  if (!apiKey) return NextResponse.json({ results: [] })

  try {
    const res = await fetch(
      `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Key ${apiKey}` } }
    )

    if (!res.ok) return NextResponse.json({ results: [] })

    const data = await res.json()
    const courses = (data.courses || []).slice(0, 30)

    const results = courses.map((c: {
      id: number
      course_name: string
      club_name?: string
      location?: { address?: string; city?: string; state?: string }
      tees?: {
        male?: Array<{ holes?: Array<{ par: number; yardage: number }> }>
        female?: Array<{ holes?: Array<{ par: number; yardage: number }> }>
      }
    }) => {
      const loc = c.location
      const address = [loc?.address, loc?.city, loc?.state].filter(Boolean).join(', ')

      const tees = c.tees?.male || c.tees?.female || []
      const tee = tees[0]
      const holes = tee
        ? (tee.holes || []).map((h, i) => ({
            hole_number: i + 1,
            par: h.par,
            yardage: h.yardage,
          }))
        : []

      return {
        golfapi_id: c.id,
        name: c.course_name,
        club_name: c.club_name || '',
        formatted_address: address,
        holes,
        total_holes: holes.length || 18,
      }
    })

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
