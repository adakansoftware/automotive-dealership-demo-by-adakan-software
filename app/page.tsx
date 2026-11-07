import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { getFeaturedVehicles } from '@/lib/vehicles'
import { getSiteConfig } from '@/lib/site-config'

const OG_IMAGE = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90'

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  return {
    alternates: { canonical: '/' },
    openGraph: {
      title: `${siteConfig.brand.name} — Seçkin Otomobiller`,
      description: 'Özenle seçilmiş otomobiller ve kişisel bir showroom deneyimi.',
      url: siteConfig.url,
      images: [{ url: OG_IMAGE }],
    },
    twitter: { images: [OG_IMAGE] },
  }
}

export default async function Home() {
  const siteConfig = await getSiteConfig()
  const featuredVehicles = await getFeaturedVehicles()
  const dealerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: siteConfig.brand.name,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: { '@type': 'PostalAddress', addressLocality: siteConfig.contact.address, addressCountry: 'TR' },
    image: OG_IMAGE,
    priceRange: '$$$$',
    openingHours: siteConfig.contact.openingHoursSchema ?? 'Mo-Sa 09:00-19:00',
  }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd) }}/><main><section className="hero"><div className="hero-content"><span className="eyebrow">Otomobil tutkusunun yeni adresi</span><h1>Her yolculuk,<br/>bir ayrıcalık.</h1><p>Özenle seçilmiş otomobiller, güven veren hizmet anlayışı ve beklentilerinizin ötesinde bir deneyim.</p><div className="hero-actions"><Link href="/araclar" className="button primary">Araçları keşfet <ArrowUpRight size={16}/></Link><Link href="/iletisim" className="button">Bize ulaşın <ArrowUpRight size={16}/></Link></div></div><div className="scroll-cue">Keşfet</div><div className="hero-index"><strong>01</strong> / 03</div></section><section className="section"><div className="intro"><div><span className="eyebrow">Farkı hisset</span><h2>Bir otomobilden<br/>çok daha fazlası.</h2></div><p className="intro-copy">Her otomobil farklı bir hikâye taşır. Biz, sizin hikâyenize eşlik edecek doğru otomobili bulmanızı kolaylaştırmak için buradayız. Koleksiyonumuz sürekli yeniden değerlendirilir; burada gördüğünüz her araç, gösterime değer bulduğumuz bir araçtır.</p></div><div className="split-image"/></section><section className="section dark"><div className="section-head"><div><span className="eyebrow">Küratörün seçimi</span><h2>Özenle seçilenler</h2></div><Link href="/araclar" className="text-link">Tüm araçları gör <ArrowUpRight size={16}/></Link></div><div className="vehicle-grid">{featuredVehicles.map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle}/>)}</div></section><section className="section"><div className="intro"><div><span className="eyebrow">Size özel</span><h2>Doğru otomobil,<br/>doğru his.</h2></div><div className="intro-copy"><p>Showroom deneyimimizi dijital dünyaya taşıyor, her adımda size zaman ve güven kazandırıyoruz. Aracı önceden tanıyın, sorularınızı önceden sorun; showroom'a geldiğinizde yalnızca karar vermeniz kalır.</p><Link href="/hakkimizda" className="text-link">Hikâyemizi keşfedin <ArrowUpRight size={16}/></Link></div></div></section></main></> }
