import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/contact-form'
import { getSiteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Bir otomobil hakkında bilgi almak veya sizi tanımak için bize ulaşın.',
  alternates: { canonical: '/iletisim' },
  openGraph: {
    title: 'İletişim — Atelier Motors',
    description: 'Bir otomobil hakkında bilgi almak veya sizi tanımak için bize ulaşın.',
  },
}

export default async function Contact() {
  const siteConfig = await getSiteConfig()
  return <main>
    <section className="page-hero"><span className="eyebrow">İletişim</span><h1 className="page-title">Sizi showroom’umuza<br/>bekliyoruz.</h1><p>Bir otomobil hakkında bilgi almak veya sizi tanımak için bize ulaşın.</p></section>
    <section className="section"><div className="contact-grid">
      <div className="contact-copy"><span className="eyebrow">Bize ulaşın</span><h2 className="page-title">Her sorunuz<br/>için buradayız.</h2><div className="contact-details"><div><span>Telefon</span><strong>{siteConfig.contact.phone}</strong></div><div><span>E-posta</span><strong>{siteConfig.contact.email}</strong></div><div><span>Showroom</span><strong>{siteConfig.contact.address}</strong></div><div><span>Çalışma saatleri</span><strong>{siteConfig.contact.hours}</strong></div></div></div>
      <ContactForm/>
    </div></section>
  </main>
}
