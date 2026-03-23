import { getClubTheme } from '@/lib/club-themes'
import type { Viewport } from 'next'

export async function generateViewport({ params }: { params: Promise<{ slug: string }> }): Promise<Viewport> {
  const { slug } = await params
  const theme = getClubTheme(slug)
  return {
    themeColor: theme?.primary ?? '#1D6B3B',
  }
}

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return children
}
