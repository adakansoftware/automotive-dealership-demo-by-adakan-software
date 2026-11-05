'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

/** Marka kimliği sunucudan props olarak geçilir (client bileşen DB okuyamaz). */
export interface HeaderProps {
  brandName: string
  wordmarkA: string
  wordmarkB: string
  location: string
}

export function Header({ brandName, wordmarkA, wordmarkB, location }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const closeMenu = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    menuRef.current?.querySelector('a')?.focus()
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open])

  return <header className="site-header">
    <Link href="/" className="wordmark" onClick={closeMenu}>{wordmarkA} <span>{wordmarkB}</span></Link>
    <nav className="desktop-nav" aria-label="Ana navigasyon">
      <Link href="/araclar">Araçlarımız</Link><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim</Link>
    </nav>
    <Link href="/iletisim" className="header-cta">Bize Ulaşın <ArrowUpRight size={15}/></Link>
    <button ref={toggleRef} className="menu-toggle" aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    {open && <nav id="mobile-menu" ref={menuRef} className="mobile-menu" aria-label="Mobil navigasyon"><span className="eyebrow">{brandName}</span><Link href="/" onClick={closeMenu}>Ana Sayfa</Link><Link href="/araclar" onClick={closeMenu}>Araçlarımız</Link><Link href="/hakkimizda" onClick={closeMenu}>Hakkımızda</Link><Link href="/iletisim" onClick={closeMenu}>İletişim</Link><div className="mobile-menu-footer">{location}</div></nav>}
  </header>
}
