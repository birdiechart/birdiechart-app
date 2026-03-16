'use client'

import { useEffect, useState } from 'react'

interface CelebrationProps {
  show: boolean
  onDone: () => void
  isEagle?: boolean
}

export default function Celebration({ show, onDone, isEagle = false }: CelebrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const t = setTimeout(() => {
        setVisible(false)
        onDone()
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [show, onDone])

  if (!visible) return null

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    color: ['#1D6B3B', '#FFD700', '#ffffff', '#6dbf8a', '#134d2a'][Math.floor(Math.random() * 5)],
    size: `${6 + Math.random() * 8}px`,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Confetti */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle absolute top-0 rounded-sm"
          style={{
            left: p.left,
            animationDelay: p.delay,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
          }}
        />
      ))}

      {/* Center badge */}
      <div
        className="celebrate bg-white rounded-3xl shadow-2xl px-8 py-6 flex flex-col items-center gap-2 border-4"
        style={{ borderColor: '#1D6B3B' }}
      >
        <span className="text-4xl">{isEagle ? '🦅' : '🐦'}</span>
        <p className="text-2xl font-bold" style={{ color: '#1D6B3B', fontFamily: 'var(--font-playfair)' }}>
          {isEagle ? 'Eagle!' : 'Birdie!'}
        </p>
        <p className="text-gray-500 text-sm font-medium">
          {isEagle ? 'Outstanding shot!' : 'First birdie on this hole!'}
        </p>
      </div>
    </div>
  )
}
