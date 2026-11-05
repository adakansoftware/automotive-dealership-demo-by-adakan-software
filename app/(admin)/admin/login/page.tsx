import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Yönetim Girişi',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  // Zaten oturum açmışsa panele dön.
  const session = await auth()
  if (session?.user) redirect('/admin')

  return <main className="admin-login">
    <section className="admin-login-card">
      <span className="eyebrow">Atelier Motors</span>
      <h1>Yönetim Paneli</h1>
      <p>Devam etmek için yönetici hesabınızla giriş yapın.</p>
      <LoginForm/>
    </section>
  </main>
}
