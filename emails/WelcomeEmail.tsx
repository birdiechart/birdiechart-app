import { Button, Link, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './BaseLayout'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://birdiechart.golf'

interface WelcomeEmailProps {
  userName: string
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <BaseLayout preview="One hole at a time. The challenge starts now.">
      <Text style={p}>Hey {userName},</Text>
      <Text style={p}>It started as a simple game with my kids.</Text>
      <Text style={p}>
        We live on a golf course — six of them actually — and one day we just asked ourselves:
        have we ever birdied every hole out here? Not in one round. Not even in one season. Just... ever?
      </Text>
      <Text style={p}>Turns out we hadn't. And once we started paying attention, we couldn't stop.</Text>
      <Text style={bold}>That's Birdie Chart.</Text>
      <Text style={p}>
        Forget the low round. Forget hitting every fairway. Forget the three putts and the drives
        that found the water. Sometimes everything comes together on one hole — the perfect iron,
        the putt that finally drops — and that moment deserves to be remembered.
      </Text>
      <Text style={p}>
        Don't you want to know you're at least capable of birdying every hole at your favorite course?
        The club you've belonged to for fifteen years. The muni you play every Saturday morning.
        The course you know better than anyone.
      </Text>
      <Text style={p}>Now's your chance to find out.</Text>
      <Text style={p}>
        Here's how it works — it's simple on purpose. After your round, save Birdie Chart to your
        home screen, open it up, and log the birdies you made. You remember them. Every golfer
        remembers their birdies. Just tap the hole, mark it down, and it's yours forever.
      </Text>
      <Text style={p}>
        No GPS. No shot tracking. No phone out on every hole. Just you, your round, and a cold
        drink at the 19th hole while you check off the holes you finally got.
      </Text>
      <Text style={p}>
        You'll know exactly which holes you've conquered and which ones still have your number.
      </Text>
      <Text style={p}>
        It's fun. It's a challenge. And if you want to start fresh every season — go for it.
        Some people treat it like an annual reset. Others are going on year three still chasing
        that one stubborn par three.
      </Text>
      <Text style={p}>Either way, the challenge is waiting.</Text>

      <Button style={button} href={`${APP_URL}/chart`}>
        Go to your Birdie Chart →
      </Button>

      <Text style={p}>One birdie at a time.</Text>
      <Text style={signature}>— Britt<br />Birdie Chart</Text>

      <Text style={ps}>
        <em>
          P.S. If your course isn't in our list yet, hit{' '}
          <Link href={`${APP_URL}/request`} style={link}>Request a Course</Link>
          {' '}and we'll get it added. We want every golfer's home course in here.
        </em>
      </Text>
    </BaseLayout>
  )
}

export default WelcomeEmail

const p: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 16px',
}

const bold: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '1.7',
  fontWeight: '700',
  margin: '0 0 16px',
}

const button: React.CSSProperties = {
  backgroundColor: '#1D6B3B',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  margin: '8px 0 24px',
}

const signature: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 24px',
}

const ps: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const link: React.CSSProperties = {
  color: '#1D6B3B',
}
