export interface ClubTheme {
  primary: string       // main brand color (used for headers, buttons)
  primaryDark: string   // darker shade
  primaryLight: string  // light tint for backgrounds
  text: string          // text on primary background
  logoPath: string      // path to logo in /public
  logoOnDark: boolean   // true = logo is white/light (needs dark bg)
}

export const CLUB_THEMES: Record<string, ClubTheme> = {
  landings: {
    primary: '#1B3A6B',
    primaryDark: '#112444',
    primaryLight: '#EEF2F8',
    text: '#FFFFFF',
    logoPath: '/landings-logo.svg',
    logoOnDark: true,
  },
}

export function getClubTheme(slug: string): ClubTheme | null {
  return CLUB_THEMES[slug] ?? null
}
