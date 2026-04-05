import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json({ results: [] })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ results: [], error: 'Google Places API key not configured' })
  }

  const lat = request.nextUrl.searchParams.get('lat')
  const lng = request.nextUrl.searchParams.get('lng')

  try {
    const searchQuery = `${query} golf course`
    const url = 'https://places.googleapis.com/v1/places:searchText'
    const body: Record<string, unknown> = {
      textQuery: searchQuery,
      includedType: 'golf_course',
      maxResultCount: 20,
    }
    if (lat && lng) {
      body.locationBias = {
        circle: {
          center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          radius: 80000, // 80km — wide enough to catch nearby courses
        },
      }
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ results: [], error: data.error?.status, error_message: data.error?.message })
    }

    const results = (data.places || []).map((place: {
      id: string
      displayName: { text: string }
      formattedAddress: string
    }) => ({
      place_id: place.id,
      name: place.displayName?.text || '',
      formatted_address: place.formattedAddress || '',
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Places API error:', error)
    return NextResponse.json({ results: [], error: String(error) })
  }
}
