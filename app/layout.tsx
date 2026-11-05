import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getSiteConfig } from '@/lib/site-config'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.brand.name} — Seçkin Otomobiller`,
      template: `%s — ${siteConfig.brand.name}`,
    },
    description: 'Özenle seçilmiş otomobiller ve kişisel bir showroom deneyimi.',
    openGraph: {
      siteName: siteConfig.brand.name,
      type: 'website',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
    },
    icons: {
      icon: [
        {
          url: '/icon-light-32x32.png',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: '/icon-dark-32x32.png',
          media: '(prefers-color-scheme: dark)',
        },
        {
          url: '/icon.svg',
          type: 'image/svg+xml',
        },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteConfig = await getSiteConfig()
  return (
    <html lang="tr">
      <body className="antialiased">
        <Header
          brandName={siteConfig.brand.name}
          wordmarkA={siteConfig.brand.wordmarkA}
          wordmarkB={siteConfig.brand.wordmarkB}
          location={siteConfig.contact.location}
        />
        {children}
        <Footer/>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
