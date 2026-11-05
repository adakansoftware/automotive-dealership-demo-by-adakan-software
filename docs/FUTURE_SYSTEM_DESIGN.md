# Gelecek Sistem Tasarımı — Atelier Motors

Sürüm: 1.0 (FAZ 6 — yalnızca tasarım dokümanı)
Durum: **Onay bekliyor.** Bu dokümandaki hiçbir şey uygulanmadı; kod tabanına dokunulmadı.

Bu doküman, mevcut demo (dosya tabanlı veri) sistemden üretim sistemine geçişin
teknik tasarımını tanımlar: PostgreSQL şeması, admin panel mimarisi, kimlik
doğrulama, rate limit ve audit log. Uygulama öncesi müşteri onayı ve gerçek
iş verisi (iletişim bilgileri, alan adı, e-posta sağlayıcısı) gereklidir.

---

## 1. Veritabanı — PostgreSQL

### 1.1 Genel ilkeler

- Tek doğruluk kaynağı DB; `data/vehicles.ts` ve `data/site-config.ts` tohum
  (seed) kaynağına dönüşür, sonra kaldırılır.
- Şema, mevcut TypeScript tipleriyle (`types/vehicle.ts`) birebir eşleşir:
  `status`, `condition`, `fuel`, `transmission`, `body` enum olarak taşınır;
  demo değerdiz alanlar (`status`, `condition`) DB'de `NOT NULL` olur.
- Para birimi: `price` TRY, `BIGINT` (kuruş değil, tam TL — mevcut veri böyle).
- Silme yerine durum geçişi: araç "Satıldı" olur, satır silinmez (geçmiş
  sorguları ve SEO yönlendirmeleri korunur).

### 1.2 Tablolar

```sql
-- Araçlar: katalog çekirdeği
CREATE TABLE vehicles (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,             -- mevcut URL yapısı korunur
  brand         TEXT NOT NULL,
  model         TEXT NOT NULL,
  trim          TEXT NOT NULL DEFAULT '',
  year          INT  NOT NULL CHECK (year BETWEEN 1980 AND 2100),
  price         BIGINT NOT NULL CHECK (price >= 0),
  mileage       INT  NOT NULL CHECK (mileage >= 0),
  fuel          fuel_type NOT NULL,
  transmission  transmission_type NOT NULL,
  body          body_type NOT NULL,
  color         TEXT NOT NULL DEFAULT '',
  status        vehicle_status NOT NULL DEFAULT 'Satışta',
  condition     vehicle_condition NOT NULL DEFAULT 'İkinci El',
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  description   TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE vehicle_status    AS ENUM ('Satışta', 'Rezerve', 'Satıldı');
CREATE TYPE vehicle_condition AS ENUM ('Sıfır', 'İkinci El');
CREATE TYPE fuel_type         AS ENUM ('Benzin', 'Dizel', 'Hibrit', 'Elektrik');
CREATE TYPE transmission_type AS ENUM ('Otomatik', 'Manuel');
CREATE TYPE body_type         AS ENUM ('Sedan', 'Coupe', 'SUV', 'Station Wagon', 'Hatchback');

-- Araç görselleri: 1-N, sıra korunur (galeri thumbnail şeridi)
CREATE TABLE vehicle_images (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_id  BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  is_key      BOOLEAN NOT NULL DEFAULT FALSE,     -- kart/liste anahtar görseli
  UNIQUE (vehicle_id, sort_order)
);
CREATE INDEX vehicle_images_vehicle_idx ON vehicle_images(vehicle_id);

-- Araç künyesi (özellik tablosu): etiket-değer çiftleri, sadece mevcut veri
CREATE TABLE vehicle_specs (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_id  BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,                      -- ör. 'Motor', 'Çekiş'
  value       TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  UNIQUE (vehicle_id, label)
);
CREATE INDEX vehicle_specs_vehicle_idx ON vehicle_specs(vehicle_id);

-- Müşteri sorguları (iletişim formu + WhatsApp takibi)
CREATE TABLE inquiries (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_id  BIGINT REFERENCES vehicles(id) ON DELETE SET NULL, -- genel sorguda NULL
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  source      inquiry_source NOT NULL DEFAULT 'form',  -- form | whatsapp
  status      inquiry_status NOT NULL DEFAULT 'new',   -- new | contacted | closed
  ip_hash     TEXT,          -- KVKK: ham IP değil, tuzlanmış özet
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TYPE inquiry_source AS ENUM ('form', 'whatsapp');
CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'closed');
CREATE INDEX inquiries_status_idx ON inquiries(status, created_at DESC);

-- Admin kullanıcıları (auth yaklaşımına göre — bkz. §3)
CREATE TABLE admin_users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT,            -- NULL ise harici sağlayıcı (OAuth) hesabı
  name          TEXT NOT NULL DEFAULT '',
  role          admin_role NOT NULL DEFAULT 'editor',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);
CREATE TYPE admin_role AS ENUM ('owner', 'editor');

-- Site yapılandırması: siteConfig karşılığı, key-value
CREATE TABLE site_config (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Notlar:

- `slug` değişmez kabul edilir; ileride başlık değişirse
  `vehicle_redirects(old_slug, vehicle_id)` tablosu eklenir (301 için).
- `vehicle_images.is_key` true olan satır, `Vehicle.image` alanına karşılık
  gelir; yoksa ilk sıradaki görsel kullanılır (`getVehicleImages` mantığı).
- `inquiries.ip_hash`: rate limit + spam incelemesi için `SHA-256(ip + PEPPER)`;
  ham IP saklanmaz (KVKK veri minimizasyonu).

### 1.3 Migration stratejisi

- Araç: **Drizzle ORM** (TypeScript-first, `drizzle-kit` migration'ları).
  Neden: strict tip güvenliği mevcut `types/vehicle.ts` ile aynı kaynakta
  yaşar; SQL dosyaları sürüm kontrolünde; Next.js App Router ile iyi entegre.
  Alternatif Prisma — daha ağır runtime, şema dosyası ayrı DSL; kabul
  edilebilir ama önerilmez.
- Migration akışı: `drizzle-kit generate` (SQL dosyası üretir, gözden
  geçirilir) → `drizzle-kit migrate` (commit edilmemiş şema değişikliği
  olmadan uygular). Üretimde migration deploy sırasında otomatik çalışır.
- Seed: `data/vehicles.ts` + `data/site-config.ts` içerikleri
  `drizzle/seed.ts` script'ine taşınır; tek seferlik çalışır.

### 1.4 Veri erişim katmanı geçişi

`lib/vehicles.ts` imzaları korunur (`getVehicles`, `getVehicleBySlug`,
`getFeaturedVehicles`, `getRelatedVehicles`, `filterVehicles`,
`sortVehicles`); içerik `data/vehicles` dizisinden Drizzle sorgusuna
döner. Sayfalar değişmez. Filtre/sıralama DB'ye taşınır (SQL `WHERE`/`ORDER BY`),
`filterVehicles`/`sortVehicles` birim testlerle sabitlenmiş referans davranış
kalır (test kurulumunda yapılıyor).

---

## 2. Admin Paneli

### 2.1 Kapsam

- `/admin` rota grubu (`app/(admin)/admin/...)`), layout'ta auth guard.
- Araç CRUD: liste (filtre + sıralama), oluştur/düzenle (form + görsel sıralama),
  durum yönetimi (Satışta/Rezerve/Satıldı), öne çıkar işareti.
- Sorgu yönetimi: gelen `inquiries` listesi, durum değiştirme (new/contacted/closed).
- Site yapılandırması: `site_config` anahtarlarını düzenleme (yalnızca `owner`).
- Robots: admin rotaları `robots.ts` `Disallow: /admin` + sayfa bazlı
  `robots: { index: false }` (FAZ 4'te dokümante edilen plan).

### 2.2 Teknik seçim

Sunucu bileşenleri + server actions; ayrı admin SPA/framework yok. Neden:
mevcut yığınla aynı, bundle küçük, doğrulama sunucuda. Formlar
`useActionState` + çift taraflı doğrulama (iletişim formundaki desen aynı).

### 2.3 Yetkilendirme

- `owner`: her şey (site config, kullanıcı yönetimi).
- `editor`: araç CRUD + sorgu yönetimi.
- Middleware seviyesinde değil, layout/data katmanında kontrol (server-only).

---

## 3. Kimlik Doğrulama — Karşılaştırma

| Yaklaşım | Artı | Eksi | Değerlendirme |
|---|---|---|---|
| **NextAuth.js (Auth.js) v5** | Next.js native, OAuth + credentials hazır, DB adaptörü çok, topluluk büyük | v5 hâlâ beta belgelenmesi; Türkçe SMS/2FA için ek iş | **Önerilen** — tek-iki admin kullanıcısı için credentials provider + e-posta OAuth yeter |
| Kendi oturum yönetimi (iron-session/jose) | Tam kontrol, bağımlılık yok | Şifre hash'i, CSRF, oturum yenileme, sıfırlama hepsi elle | Güvenlik yüzeyi büyür; önerilmez |
| Üçüncü parti (Clerk, Auth0) | Hızlı kurulum | Ücret/vendor lock-in, KVKK veri aktarımı (AB bölgesi zorunlu) | 1-2 kullanıcılı panel için aşırı |

Seçim: **Auth.js v5, credentials provider** (e-posta + şifre, `argon2id`
hash). Oturum: JWT cookie (HttpOnly, SameSite=Lax, Secure). `admin_users`
tablosu hazır (§1.2). 2FA: ileride TOTP eklenebilir; ilk sürümde zorunlu
değil (düşük kullanıcı sayısı, güçlü şifre politikası + rate limit'li giriş).

---

## 4. Rate Limit (üretim)

Mevcut demo: süreç belleği, IP bazlı, 10 dk/5 istek (`app/iletisim/actions.ts`).
Üretim tasarımı:

- Katman: server action içinde, sayaç **PostgreSQL** tabloda
  (`rate_limits(key, count, reset_at)`) — ek altyapı (Redis) istemeyen
  en basit kalıcı çözüm; trafik profili (galeri, düşük hacim) için yeterli.
  Redis yalnızca trafik büyürse gerekir.
- Anahtar: `SHA-256(ip + PEPPER + form_tipü)`; ham IP loglanmaz.
- Limit: form için mevcut değerler korunur (10 dk/5). Admin girişi için
  ayrı, daha sıkı limit (15 dk/5 başarısız deneme + üstünde hesap kilidi
  bildirimi).
- Temizlik: günlük cron/maintenance job süresi geçmiş satırları siler.

## 5. Audit Log

```sql
CREATE TABLE audit_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,        -- 'vehicle.update', 'inquiry.status', ...
  entity      TEXT NOT NULL,        -- 'vehicle', 'inquiry', 'site_config'
  entity_id   TEXT,
  diff        JSONB,                -- değişen alanlar (eski/yeni)
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON audit_log(created_at DESC);
```

- Yazım: admin server action'ları içinde tek yardımcı fonksiyon
  (`writeAudit(actor, action, entity, diff)`); her mutating action çağırır.
- İçerik: şifre/sır alanı asla loglanmaz; `diff` yalnızca değişen alanları
  taşır.
- Saklama: 1 yıl (rotate job); silme yok, sadece arşiv.

## 6. Ortam Değişkenleri (`.env.example` planı)

```bash
# Veritabanı
DATABASE_URL=postgresql://user:pass@host:5432/atelier_motors

# Kimlik doğrulama
AUTH_SECRET=<32+ bayt rastgele>        # Auth.js oturum imzası
AUTH_TRUST_HOST=true                   # ters vekil arkası

# Hash tuzu (rate limit anahtarı + IP özeti)
HASH_PEPPER=<32+ bayt rastgele>

# E-posta gönderimi (iletişim formu, onay sonrası)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
INQUIRY_NOTIFY_EMAIL=                  # sorgu bildirimlerini alan adres

# Uygulama
NEXT_PUBLIC_SITE_URL=https://<gerçek-alan-adı>   # siteConfig.url karşılığı
NODE_ENV=production
```

Hiçbir sır koda gömülmez; `.env*` `.gitignore`'da (`.env.example` hariç —
anahtarlar boş, açıklamalı).

## 7. Dağıtım Ön Koşulları

1. Gerçek alan adı + DNS; `metadataBase`/`siteConfig.url` güncellenir
   (şu an `https://ateliermotors.example` yer tutucu).
2. PostgreSQL örneği (Vercel Postgres / Neon / self-host — müşteri tercihi).
3. E-posta sağlayıcı kararı (SMTP kimlik bilgileri) — iletişim formunun
   gerçek gönderime geçişi için.
4. `data/site-config.ts` gerçek müşteri bilgileriyle güncellenir
   (telefon, WhatsApp, e-posta, adres).
5. TLS: platform tarafından sonlanır; `AUTH_TRUST_HOST` ters vekil için.
6. Yedekleme: DB günlük yedek + point-in-time recovery (sağlayıcı ayarı).
7. Görseller: Unsplash URL'leri kalıcı değil — admin panel görsel yükleme
   gelene kadar yerel `public/vehicles/` veya object storage (S3/R2)
   tercih edilir; karar müşteriyle.

## 8. Uygulama Sırası (onay sonrası)

1. Vitest kurulumu + mevcut saf fonksiyonların testleri (bu plana dahil —
   test kurulumu ayrı onaylandı).
2. Drizzle + DB kurulum, schema migration, seed.
3. `lib/vehicles.ts` içini DB sorgusuna çevir (imzalar aynı kalır).
4. Auth.js kurulum + `/admin` giriş.
5. Admin araç CRUD + sorgu yönetimi.
6. Rate limit DB'ye taşı + audit log.
7. İletişim formu gerçek gönderim (SMTP) + `inquiries` tablosuna yazma.
8. Site config DB'ye taşı; `robots.ts` admin disallow.
