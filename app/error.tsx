'use client'

import Link from 'next/link'
import { ArrowUpRight, RotateCcw } from 'lucide-react'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="status-page">
    <span className="eyebrow">Beklenmeyen bir hata</span>
    <h1 className="page-title">Bir aksilik<br/>oluştu.</h1>
    <p className="intro-copy">Sayfayı görüntülerken bir sorun yaşandı. Lütfen tekrar deneyin; sorun sürerse <Link href="/iletisim" className="text-link">bize ulaşın</Link>.</p>
    <div className="status-actions"><button className="button primary" onClick={reset}>Tekrar dene <RotateCcw size={16}/></button><Link href="/" className="button">Ana sayfa <ArrowUpRight size={16}/></Link></div>
  </main>
}
