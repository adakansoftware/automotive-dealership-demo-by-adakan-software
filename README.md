# Atelier Motors — Galeri Platformu

Adakan Software tarafından geliştirilen lüks araç galerisi web platformu.
v0 ile üretilen başlangıç noktasından, altı fazlı denetim odaklı bir
yeniden yapılandırmadan geçti; şu an vitrin + yönetim paneli + veri
katmanını içerir.

> **Not:** "Atelier Motors" ve iletişim bilgileri yer tutucudur; gerçek
> müşteri bilgisi dağıtım öncesinde `site_config` üzerinden girilir.

## Özellikler

**Vitrin**
- Lüks koyu tema (ink/carbon/champagne), Georgia serif başlıklar
- Araç listesi: marka→model bağımlı gelişmiş filtreleme (fiyat/yıl/km aralığı,
  yakıt, vites, kasa, durum), sıralama — tümü URL search params üzerinden
  sunucu tarafında (paylaşılan URL aynı sonucu verir)
- Araç detayı: çoklu görsel galerisi (klavye navigasyonu, tam ekran),
  araç künyesi, durum rozeti (Satışta/Rezerve/Satıldı), benzer araçlar
- SEO: sitemap, robots, canonical, OG/Twitter kartları, JSON-LD
  (`AutoDealer` + `Car`), sayfa bazlı metadata
- Erişilebilirlik: klavye ile gezinilebilir mobil menü, `prefers-reduced-motion`
  desteği, form hata erişilebilirliği
- İletişim formu: sunucu action + çift taraflı doğrulama + rate limit

**Yönetim (`/admin`)**
- Auth.js v5 girişi (argon2id, 15 dk/5 deneme limiti)
- Araç CRUD: oluşturma/düzenleme/silme, durum yönetimi, öne çıkarma,
  görsel ve künye satırları
- Sorgu yönetimi (iletişim formundan gelenler), site ayarları (owner rolü),
  denetim izi (audit log, owner rolü)

**Veri katmanı**
- `DATABASE_URL` tanımlıysa PostgreSQL (Drizzle ORM); tanımsızsa demo
  veriyle çalışır — build ve test veritabanı gerektirmez
- Kalıcı rate limit (atomik sayaç, tuzlanmış SHA-256 anahtar; KVKK:
  ham IP saklanmaz)

## Teknolojiler

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict)
- Tailwind CSS v4 (CSS-first) · Lucide ikonları
- Drizzle ORM + PostgreSQL · Auth.js v5 · Vitest
- pnpm (`corepack pnpm`) · Node 24

## Başlarken

```bash
corepack pnpm install
corepack pnpm dev        # http://localhost:3000 — demo modu (DB gerekmez)
```

### Veritabanı ile (yönetim paneli aktif)

1. `.env.example` dosyasını `.env.local` olarak kopyalayın;
   `DATABASE_URL`, `AUTH_SECRET`, `HASH_PEPPER` doldurun
   (`openssl rand -base64 32`).
2. Migration ve tohum:

```bash
corepack pnpm db:generate   # migration SQL üret (şema değişince)
corepack pnpm db:migrate    # uygula
corepack pnpm db:seed       # demo envanter + site yapılandırması + ilk admin
```

İlk yönetici hesabı `ADMIN_INITIAL_EMAIL` / `ADMIN_INITIAL_PASSWORD`
ortam değişkenleriyle tohumlanır, ardından `/admin/login` üzerinden giriş
yapılır.

## Komutlar

| Komut | Açıklama |
|---|---|
| `corepack pnpm dev` | Geliştirme sunucusu |
| `corepack pnpm build` | Üretim derlemesi |
| `corepack pnpm start` | Üretim sunucusu |
| `corepack pnpm typecheck` | `tsc --noEmit` |
| `corepack pnpm test` | Vitest (35 birim testi) |
| `corepack pnpm db:generate` | Drizzle migration üret |
| `corepack pnpm db:migrate` | Migration uygula |
| `corepack pnpm db:seed` | Tohum betiği |

## Yapı

```
app/                    Rotalar (vitrin + (admin)/admin + api/auth)
components/             layout / vehicles / contact / ui / admin
lib/                    vehicles, site-config, rate-limit, audit, admin-auth, format
db/                     Drizzle istemcisi (tembel kurulum)
drizzle/                schema.ts, seed.ts, migrations
types/                  vehicle.ts (enum'lar şemayla birebir)
data/                   Demo veri (DB yoksa kaynak; seed kaynağı)
docs/                   Uygulama planı, mimari denetim, sistem tasarımı
```

## Dokümanlar

- `docs/IMPLEMENTATION_PLAN.md` — faz bazlı görev listesi ve durum takibi
- `docs/ARCHITECTURE_AUDIT.md` — başlangıç denetimi (bulgu kodları)
- `docs/FUTURE_SYSTEM_DESIGN.md` — veri katmanı/auth/admin tasarımı
- `docs/RESPONSIVE_AUDIT.md` — responsive kontrol listesi + KVKK planı

## Dağıtım Ön Koşulları

Gerçek müşteri teslimi öncesi: alan adı + TLS (`site_config.url` güncellenir),
PostgreSQL örneği, SMTP sağlayıcı kararı (form bildirimleri), gerçek
iletişim bilgileri. Ayrıntılar:
`docs/FUTURE_SYSTEM_DESIGN.md` §7.

## Lisans

© Adakan Software. Tüm hakları saklıdır — ticari müşteri projesi.
