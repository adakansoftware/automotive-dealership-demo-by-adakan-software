import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function NotFound() {
  return <main className="status-page">
    <span className="eyebrow">Hata 404</span>
    <h1 className="page-title">Aradığınız sayfa<br/>burada değil.</h1>
    <p className="intro-copy">Sayfa taşınmış, kaldırılmış ya da adres hatalı yazılmış olabilir. Ana sayfadan koleksiyonumuza devam edebilirsiniz.</p>
    <div className="status-actions"><Link href="/" className="button primary">Ana sayfa <ArrowUpRight size={16}/></Link><Link href="/araclar" className="button">Araçları gör <ArrowUpRight size={16}/></Link></div>
  </main>
}
