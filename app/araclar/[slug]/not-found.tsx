import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function VehicleNotFound() {
  return <main className="status-page">
    <span className="eyebrow">Hata 404</span>
    <h1 className="page-title">Bu araç<br/>koleksiyonumuzda yok.</h1>
    <p className="intro-copy">Araç satılmış ya da adres hatalı olabilir. Güncel koleksiyonumuzdaki diğer seçkin otomobillere göz atın.</p>
    <div className="status-actions"><Link href="/araclar" className="button primary">Koleksiyonu gör <ArrowUpRight size={16}/></Link><Link href="/iletisim" className="button">Bize ulaşın <ArrowUpRight size={16}/></Link></div>
  </main>
}
