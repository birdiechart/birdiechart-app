import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  if (!query || query.length < 2) return NextResponse.json({ suggestions: [] })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ suggestions: [] })

  const lat = request.nextUrl.searchParams.get('lat')
  const lng = request.nextUrl.searchParams.get('lng')

  try {
    const body: Record<string, unknown> = {
      input: query,
      includedPrimaryTypes: ['golf_course'],
    }
    if (lat && lng) {
      body.locationBias = {
        circle: {
          center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          radius: 80000,
        },
      }
    }
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    const suggestions = (data.suggestions || []).slice(0, 6).map((s: {
      placePrediction: {
        placeId: string
        text: { text: string }
        structuredFormat: {
          mainText: { text: string }
          secondaryText: { text: string }
        }
      }
    }) => ({
      place_id: s.placePrediction?.placeId,
      name: s.placePrediction?.structuredFormat?.mainText?.text || s.placePrediction?.text?.text || '',
      address: s.placePrediction?.structuredFormat?.secondaryText?.text || '',
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}
