import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getSiteConfig } from '@/lib/site-config'

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  return {
    title: 'Hakkımızda',
    description: 'Atelier Motors, otomobil tutkusunu özenli bir hizmet anlayışıyla bir araya getiren seçkin bir showroom deneyimidir.',
    alternates: { canonical: '/hakkimizda' },
    openGraph: {
      title: `Hakkımızda — ${siteConfig.brand.name}`,
      description: 'Atelier Motors, otomobil tutkusunu özenli bir hizmet anlayışıyla bir araya getiren seçkin bir showroom deneyimidir.',
      images: [{ url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1400&q=85' }],
    },
  }
}

export default function About(){return <main><section className="page-hero"><span className="eyebrow">Atelier Motors</span><h1 className="page-title">Otomobil seçmek,<br/>bir duygu meselesi.</h1><p>Biz, bu duyguyu doğru otomobille buluşturmak için buradayız.</p></section><section className="section"><div className="about-grid"><div className="about-image"/><div className="about-copy"><span className="eyebrow">Yaklaşımımız</span><h2 className="page-title">Güven veren<br/>bir deneyim.</h2><p>Atelier Motors, otomobil tutkusunu özenli bir hizmet anlayışıyla bir araya getiren seçkin bir showroom deneyimidir. Her aracı, onu kullanacak kişinin beklentileriyle buluşması için dikkatle seçer ve sunarız.</p><p>Koleksiyonumuza giren her araç titiz bir değerlendirme sürecinden geçer; geçmişini ve mevcut durumunu size baştan sona şeffaf biçimde sunarız. Showroom ziyaretleri aceleye getirilmez — doğru kararı vermeniz için gereken zamanı ve bilgiyi burada bulursunuz.</p><p>İlk karşılaşmadan teslimata kadar sade, şeffaf ve kişisel bir iletişim kurmayı önemsiyoruz.</p><Link href="/iletisim" className="text-link">Bize ulaşın <ArrowUpRight size={16}/></Link></div></div><div className="values">{([['01','Şeffaf iletişim','Fiyat, araç geçmişi ve mevcut durum hakkında baştan sona netlik; hiçbir sorunuz cevapsız kalmaz.'],['02','Özenli araç sunumu','Her araç, listelemeye değer bulduğumuz titiz bir kontrol ve hazırlık sürecinden geçer.'],['03','Kişiye özel ilgi','Beğinizi dinler, kullanım alışkanlıklarınızı anlar ve doğru otomobille eşleşmenize yardımcı oluruz.'],['04','Güven veren hizmet','İlk görüşmeden teslimata kadar tek muhatabınız oluruz; süreç her adımda sizin kontrolünüzde ilerler.']] as const).map(([n,t,d])=><div className="value" key={n}><span className="eyebrow">{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div></section></main>}
