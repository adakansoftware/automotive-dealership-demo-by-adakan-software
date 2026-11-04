'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, ChevronDown, Menu, X, Phone, MessageCircle } from 'lucide-react'
import type { Vehicle } from '@/data/vehicles'

export function Header() {
  const [open, setOpen] = useState(false)
  return <header className="site-header">
    <Link href="/" className="wordmark" onClick={() => setOpen(false)}>ATELIER <span>MOTORS</span></Link>
    <nav className="desktop-nav" aria-label="Ana navigasyon">
      <Link href="/araclar">Araçlarımız</Link><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim</Link>
    </nav>
    <Link href="/iletisim" className="header-cta">Bize Ulaşın <ArrowUpRight size={15}/></Link>
    <button className="menu-toggle" aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    {open && <div className="mobile-menu"><span className="eyebrow">ATELIER MOTORS</span><Link href="/">Ana Sayfa</Link><Link href="/araclar">Araçlarımız</Link><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim</Link><div className="mobile-menu-footer">İstanbul · Türkiye</div></div>}
  </header>
}

export function Footer() { return <footer className="footer"><div><Link href="/" className="wordmark">ATELIER <span>MOTORS</span></Link><p className="footer-copy">Seçkin otomobiller, kişisel bir deneyim.</p></div><div className="footer-links"><div><span className="eyebrow">Keşfet</span><Link href="/araclar">Araçlarımız</Link><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim</Link></div><div><span className="eyebrow">İletişim</span><span>+90 212 000 00 00</span><span>hello@ateliermotors.com</span><span>İstanbul, Türkiye</span></div></div><div className="footer-bottom"><span>© 2025 Atelier Motors</span><span>Web Tasarım ve Geliştirme: Adakan Software</span></div></footer> }

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) { return <Link href={`/araclar/${vehicle.slug}`} className="vehicle-card"><div className="vehicle-image"><img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} /><span className="card-arrow"><ArrowUpRight size={17}/></span></div><div className="vehicle-meta"><div><span className="eyebrow">{vehicle.brand}</span><h3>{vehicle.model}</h3><p>{vehicle.trim}</p></div><strong>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(vehicle.price)}</strong></div><div className="vehicle-specs"><span>{vehicle.year}</span><span>{vehicle.mileage.toLocaleString('tr-TR')} km</span><span>{vehicle.transmission}</span></div></Link> }

export function InquiryBar({ vehicle }: { vehicle: Vehicle }) { const text = encodeURIComponent(`Merhaba, ${vehicle.brand} ${vehicle.model} hakkında bilgi almak istiyorum.`); return <div className="inquiry-bar"><a href={`https://wa.me/902120000000?text=${text}`} target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp ile Bilgi Al</a><a href="tel:+902120000000"><Phone size={17}/> Hemen Ara</a><Link href="/iletisim">İletişime Geç <ArrowUpRight size={17}/></Link></div> }

export function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v:string)=>void; options: string[] }) { return <label className="filter-field"><span>{label}</span><div><select value={value} onChange={(e) => onChange(e.target.value)}><option value="">Tümü</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={15}/></div></label> }
