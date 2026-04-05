import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'


interface BaseLayoutProps {
  preview: string
  children: React.ReactNode
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>Birdie Chart</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              One birdie at a time.
            </Text>
            <Text style={footerMuted}>
              © {new Date().getFullYear()} Birdie Chart. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f4f7f4',
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: 0,
  padding: '32px 0',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  maxWidth: '560px',
  margin: '0 auto',
  overflow: 'hidden',
}

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '28px 40px 20px',
  borderBottom: '1px solid #e8f0e8',
}

const logoText: React.CSSProperties = {
  color: '#1D6B3B',
  fontSize: '22px',
  fontWeight: '700',
  fontFamily: 'Georgia, serif',
  margin: 0,
}

const content: React.CSSProperties = {
  padding: '32px 40px',
}

const divider: React.CSSProperties = {
  borderColor: '#e8f0e8',
  margin: '0 40px',
}

const footer: React.CSSProperties = {
  padding: '20px 40px 28px',
}

const footerText: React.CSSProperties = {
  color: '#1D6B3B',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 4px',
  letterSpacing: '0.05em',
}

const footerMuted: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: 0,
}
