'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { siteConfig } from '@/data/site-config'

export function Header() {
  const [open, setOpen] = useState(false)
  return <header className="site-header">
    <Link href="/" className="wordmark" onClick={() => setOpen(false)}>{siteConfig.brand.wordmarkA} <span>{siteConfig.brand.wordmarkB}</span></Link>
    <nav className="desktop-nav" aria-label="Ana navigasyon">
      <Link href="/araclar">Araçlarımız</Link><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim</Link>
    </nav>
    <Link href="/iletisim" className="header-cta">Bize Ulaşın <ArrowUpRight size={15}/></Link>
    <button className="menu-toggle" aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    {open && <div className="mobile-menu"><span className="eyebrow">{siteConfig.brand.name}</span><Link href="/">Ana Sayfa</Link><Link href="/araclar">Araçlarımız</Link><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim</Link><div className="mobile-menu-footer">{siteConfig.contact.location}</div></div>}
  </header>
}
