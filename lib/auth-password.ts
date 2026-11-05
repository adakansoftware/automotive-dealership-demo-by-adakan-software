import { hash, verify } from '@node-rs/argon2'

/** argon2id (varsayılan) — SHA-256 değil, bellek zorluklu modern hash. */
export async function hashPassword(password: string): Promise<string> {
  return hash(password)
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return verify(passwordHash, password)
}
