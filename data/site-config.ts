export const siteConfig = {
  // Yer tutucu alan adı — gerçek müşteri bilgisi gelince değiştirilecek.
  url: 'https://ateliermotors.example',
  brand: {
    name: 'Atelier Motors',
    wordmarkA: 'ATELIER',
    wordmarkB: 'MOTORS',
    tagline: 'Seçkin otomobiller, kişisel bir deneyim.',
  },
  contact: {
    phone: '+90 212 000 00 00',
    phoneHref: 'tel:+902120000000',
    whatsapp: 'https://wa.me/902120000000',
    email: 'hello@ateliermotors.com',
    address: 'İstanbul, Türkiye',
    location: 'İstanbul · Türkiye',
    hours: 'Pazartesi — Cumartesi · 09:00 — 19:00',
    // schema.org openingHours biçimi (Mo-Sa 09:00-19:00) — AutoDealer JSON-LD'de kullanılır.
    openingHoursSchema: 'Mo-Sa 09:00-19:00',
  },
  company: {
    name: 'Adakan Software',
    role: 'Web Tasarım ve Geliştirme',
  },
} as const

export type SiteConfig = typeof siteConfig
