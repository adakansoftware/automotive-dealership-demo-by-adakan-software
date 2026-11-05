import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'

import { getDb, isDbConfigured } from '@/db'
import { adminUsers } from '@/drizzle/schema'
import { verifyPassword } from '@/lib/auth-password'

declare module 'next-auth' {
  interface User {
    role?: 'owner' | 'editor'
  }

  interface Session {
    user: {
      id: string
      role: 'owner' | 'editor'
    } & DefaultSession['user']
  }
}

type AdminRole = 'owner' | 'editor'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-posta', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        // Demo modunda (DB yok) yönetici hesabı yoktur — giriş reddedilir.
        if (!isDbConfigured()) return null

        const email =
          typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''
        if (!email || !password) return null

        const db = getDb()
        const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email))
        const user = rows[0]
        if (!user || !user.isActive || !user.passwordHash) return null

        const valid = await verifyPassword(password, user.passwordHash)
        if (!valid) return null

        // Son girişi işaretle (auth dışı yan etki; hata akışı bozmaz).
        await db
          .update(adminUsers)
          .set({ lastLoginAt: new Date() })
          .where(eq(adminUsers.id, user.id))

        return { id: String(user.id), email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role as AdminRole | undefined
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
        session.user.role = (token.role as AdminRole | undefined) ?? 'editor'
      }
      return session
    },
  },
})
