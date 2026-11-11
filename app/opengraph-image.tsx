import { ImageResponse } from 'next/og'

import { getSiteConfig } from '@/lib/site-config'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Varsayılan sosyal kart — site kimliğiyle (ink/champagne) dinamik üretilir. */
export default async function OpengraphImage() {
  const siteConfig = await getSiteConfig()
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#090a0b',
          color: '#f3f0e9',
        }}
      >
        <div style={{ display: 'flex', fontSize: 20, letterSpacing: '0.35em', color: '#b9a88b', textTransform: 'uppercase' }}>
          {siteConfig.contact.location}
        </div>
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 600, letterSpacing: '0.12em', marginTop: 28 }}>
          {siteConfig.brand.wordmarkA}
          <span style={{ color: '#b9a88b', marginLeft: 24 }}>{siteConfig.brand.wordmarkB}</span>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#a8aaac', marginTop: 36 }}>
          {siteConfig.brand.tagline}
        </div>
        <div style={{ display: 'flex', width: 72, height: 2, backgroundColor: '#b9a88b', marginTop: 48 }} />
      </div>
    ),
    size,
  )
}
