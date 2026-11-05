import { redirect } from 'next/navigation'

import { auth } from '@/auth'

export type AdminSessionUser = {
  id: string
  email: string
  role: 'owner' | 'editor'
}

/**
 * Sayfa düzeyi auth koruması. Layout'taki redirect akış sırasında sayfa
 * içeriğinin paralel stream edilmesini engellemez — her korumalı sayfa
 * veri okumadan önce bunu çağırır (tasarım dokümanı §2.3).
 */
export async function requireAdminSession(): Promise<AdminSessionUser> {
  const session = await auth()
  if (!session?.user) redirect('/admin/login')
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    role: session.user.role,
  }
}

export async function requireOwnerSession(): Promise<AdminSessionUser> {
  const user = await requireAdminSession()
  if (user.role !== 'owner') redirect('/admin')
  return user
}
