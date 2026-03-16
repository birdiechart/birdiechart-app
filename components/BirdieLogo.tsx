interface BirdieLogoProps {
  className?: string
  iconOnly?: boolean
}

export default function BirdieLogo({ className = '', iconOnly = false }: BirdieLogoProps) {
  if (iconOnly) {
    return (
      <svg viewBox="24 2 92 92" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g transform="translate(32, 10)">
          <rect x="0" y="0" width="24" height="24" rx="4" fill="#1D6B3B"/>
          <rect x="29" y="0" width="24" height="24" rx="4" fill="#1D6B3B"/>
          <rect x="58" y="0" width="24" height="24" rx="4" fill="#D3EAD8"/>
          <rect x="0" y="29" width="24" height="24" rx="4" fill="#1D6B3B"/>
          <rect x="29" y="29" width="24" height="24" rx="4" fill="#D3EAD8"/>
          <rect x="58" y="29" width="24" height="24" rx="4" fill="#D3EAD8"/>
          <rect x="0" y="58" width="24" height="24" rx="4" fill="#D3EAD8"/>
          <rect x="29" y="58" width="24" height="24" rx="4" fill="#D3EAD8"/>
          <rect x="58" y="58" width="24" height="24" rx="4" fill="#D3EAD8"/>
          <path d="M4 12 L9 18 L21 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M33 12 L38 18 L50 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M4 41 L9 47 L21 35" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </g>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 620 120" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="translate(32, 10)">
        <rect x="0" y="0" width="24" height="24" rx="4" fill="#1D6B3B"/>
        <rect x="29" y="0" width="24" height="24" rx="4" fill="#1D6B3B"/>
        <rect x="58" y="0" width="24" height="24" rx="4" fill="#D3EAD8"/>
        <rect x="0" y="29" width="24" height="24" rx="4" fill="#1D6B3B"/>
        <rect x="29" y="29" width="24" height="24" rx="4" fill="#D3EAD8"/>
        <rect x="58" y="29" width="24" height="24" rx="4" fill="#D3EAD8"/>
        <rect x="0" y="58" width="24" height="24" rx="4" fill="#D3EAD8"/>
        <rect x="29" y="58" width="24" height="24" rx="4" fill="#D3EAD8"/>
        <rect x="58" y="58" width="24" height="24" rx="4" fill="#D3EAD8"/>
        <path d="M4 12 L9 18 L21 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M33 12 L38 18 L50 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 41 L9 47 L21 35" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <text x="96" y="52" fontFamily="var(--font-playfair), serif" fontSize="50" fontWeight="700" fill="#1D6B3B">Birdie Chart</text>
        <text x="98" y="72" fontFamily="var(--font-dm-sans), sans-serif" fontSize="11" fontWeight="500" fill="#888780" letterSpacing="0.1em">ONE BIRDIE AT A TIME.</text>
      </g>
    </svg>
  )
}
