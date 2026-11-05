import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth, signOut } from '@/auth'

export const metadata: Metadata = {
  title: 'Yönetim Paneli',
  robots: { index: false, follow: false },
}

const NAV = [
  { href: '/admin', label: 'Genel Bakış' },
  { href: '/admin/vehicles', label: 'Araçlar' },
  { href: '/admin/inquiries', label: 'Sorgular' },
  { href: '/admin/settings', label: 'Site Ayarları', ownerOnly: true },
  { href: '/admin/audit', label: 'Denetim İzi', ownerOnly: true },
]

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Auth koruması layout/data katmanında (tasarım dokümanı §2.3).
  const session = await auth()
  if (!session?.user) redirect('/admin/login')
  const role = session.user.role

  return <div className="admin-shell">
    <aside className="admin-nav">
      <Link href="/admin" className="wordmark">ATELIER <span>ADMIN</span></Link>
      <nav aria-label="Yönetim navigasyonu">
        {NAV.filter((item) => !item.ownerOnly || role === 'owner').map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>
      <div className="admin-nav-footer">
        <span>{session.user.email}</span>
        <form action={async () => {
          'use server'
          await signOut({ redirectTo: '/admin/login' })
        }}>
          <button type="submit" className="text-link">Çıkış yap</button>
        </form>
      </div>
    </aside>
    <main className="admin-content">{children}</main>
  </div>
}
