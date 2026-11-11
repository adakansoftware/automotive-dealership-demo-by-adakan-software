import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'

export async function Footer() {
  const siteConfig = await getSiteConfig()
  return (
    <footer className="footer">
      <div>
        <Link href="/" className="wordmark">
          {siteConfig.brand.wordmarkA} <span>{siteConfig.brand.wordmarkB}</span>
        </Link>
        <p className="footer-copy">{siteConfig.brand.tagline}</p>
      </div>
      <div className="footer-links">
        <div>
          <span className="eyebrow">Keşfet</span>
          <Link href="/araclar">Araçlarımız</Link>
          <Link href="/hakkimizda">Hakkımızda</Link>
          <Link href="/iletisim">İletişim</Link>
        </div>
        <div>
          <span className="eyebrow">İletişim</span>
          <a href={siteConfig.contact.phoneHref}>{siteConfig.contact.phone}</a>
          <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
          <span>{siteConfig.contact.address}</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {siteConfig.brand.name}. Tüm hakları saklıdır.
        </span>
        <span className="footer-signature">
          Design by{' '}
          <a
            href="https://www.adakansoftware.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-signature-link"
          >
            Adakan Software
          </a>
        </span>
      </div>
    </footer>
  )
}
