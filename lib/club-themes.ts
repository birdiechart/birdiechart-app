export interface ClubTheme {
  primary: string       // main brand color (used for headers, buttons)
  primaryDark: string   // darker shade
  primaryLight: string  // light tint for backgrounds
  text: string          // text on primary background
  logoPath: string      // path to logo in /public
  logoOnDark: boolean   // true = logo is white/light (needs dark bg)
  clubName: string
  teeNames?: string[]
}

export const CLUB_THEMES: Record<string, ClubTheme> = {
  landings: {
    primary: '#1B3A6B',
    primaryDark: '#112444',
    primaryLight: '#EEF2F8',
    text: '#FFFFFF',
    logoPath: '/landings-logo.svg',
    logoOnDark: true,
    clubName: 'The Landings',
    teeNames: ['championship', 'tournament', 'club', 'medal'],
  },
}

export function getClubTheme(slug: string): ClubTheme | null {
  return CLUB_THEMES[slug] ?? null
}

export interface ClubScoreColors {
  eagle: { bg: string; text: string; border: string }
  birdie: { bg: string; text: string; border: string }
  par: { bg: string; text: string; border: string }
  shadow: string
}

function blendHex(a: string, b: string, ratio: number): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ]
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const r = Math.round(r1 + (r2 - r1) * ratio)
  const g = Math.round(g1 + (g2 - g1) * ratio)
  const bl = Math.round(b1 + (b2 - b1) * ratio)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

export function getClubScoreColors(theme: ClubTheme): ClubScoreColors {
  const parBorder = blendHex(theme.primaryLight, theme.primary, 0.25)
  return {
    eagle: { bg: theme.primaryDark, text: '#ffffff', border: theme.primaryDark },
    birdie: { bg: theme.primary,     text: '#ffffff', border: theme.primaryDark },
    par:    { bg: theme.primaryLight, text: theme.primary, border: parBorder },
    shadow: theme.primary,
  }
}
