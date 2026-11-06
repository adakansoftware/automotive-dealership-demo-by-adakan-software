# Müşteri Onboarding Rehberi

Bu repo bir galeri/demo şablonudur: kod, şema ve altyapı sabittir; her yeni
müşteri için içerik ve marka kimliği uyarlanır. Aşağıdaki adımlar sırayla
uygulanır.

## 0. Ön koşullar

- Müşteri bilgisi: galeri adı, telefon, WhatsApp, e-posta, adres, çalışma
  saatleri, logo/renk tercihleri
- Müşteri stoğu: araç listesi (marka, model, yıl, fiyat, km...) + fotoğraflar
- Alan adı (varsa; yoksa Vercel alt alan adıyla başlanır)

## 1. Yeni repo

GitHub'da bu repodan **Use this template** ile müşteriye ayrı repo aç.
Şablon repo asla müşteri verisiyle kirletilmez.

## 2. Marka kimliği

| Ne | Nerede |
|----|--------|
| İsim, wordmark, slogan, iletişim, adres, saatler | `data/site-config.ts` |
| Renk paleti (ink/carbon/champagne değişkenleri) | `app/globals.css` başındaki `:root` bloğu |
| Sayfa metinleri (hero, hakkımızda vb.) | `app/page.tsx`, `app/hakkimizda/` |
| Footer imza | `app/layout.tsx` ve footer bileşeni |

Renk değişkenleri: `--ink` (zemin), `--carbon`, `--graphite`, `--line`,
`--muted`, `--stone`, `--ivory` (metin), `--champagne` (vurgu). Yalnızca
değerler değişir; sınıf yapısı ve tipografi korunur.

## 3. İçerik

- `data/vehicles.ts` → müşterinin gerçek stoğu. Şema `types/vehicle.ts`'teki
  `Vehicle` arayüzüyle birebir uyumlu olmalı (slug, brand, model, trim, year,
  price, mileage, fuel, transmission, body, color, image, images, specs,
  featured, status, condition, description).
- Fotoğraflar iki şekilde yüklenebilir:
  - Harici URL (Unsplash vb.) — `image` / `images[].url` alanlarına tam URL
  - Lokal dosya — `public/vehicles/` altına kopyala, `/vehicles/dosya.jpg`
    biçiminde referans ver (örn. RS 6 Avant)
- Türkçe metinlerde kesme işaretine dikkat: tek tırnaklı stringlerde
  `'...'un'` sözdizimi hataya yol açar; çift tırnak kullan.

## 4. Veritabanı

```bash
# Yeni Neon projesi oluştur, bağlantı adresini .env.local'a yaz
corepack pnpm db:migrate   # migration 0000 (şema) uygulanır
corepack pnpm db:seed      # envanter + site_config + ilk admin
```

- `db:seed` idempotent: tekrar çalıştırmada araçları upsert eder, görsel ve
  künye satırlarını tazeler, mevcut admin hesabına dokunmaz.
- İlk admin: `ADMIN_INITIAL_EMAIL` + `ADMIN_INITIAL_PASSWORD` env'leri seed
  sırasında okunur (role: owner).

## 5. Ortam değişkenleri

`.env.example` referanstır. Müşteri başına yeni değerler:

| Değişken | Not |
|----------|-----|
| `DATABASE_URL` | Müşterinin Neon bağlantısı |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` |
| `HASH_PEPPER` | 32+ bayt rastgele — rate limit/IP özeti tuzu |
| `ADMIN_INITIAL_EMAIL` / `ADMIN_INITIAL_PASSWORD` | Yalnız seed'de okunur |
| `NEXT_PUBLIC_SITE_URL` | Gerçek alan adı (siteConfig.url karşılığı) |
| `SMTP_*`, `INQUIRY_NOTIFY_EMAIL` | Bildirim e-postası için (opsiyonel) |

## 6. Deploy

1. Vercel'de yeni proje, müşteri reposunu bağla (push = otomatik deploy).
2. Üstteki env'leri Production/Preview/Development ortamlarına gir.
3. Alan adını bağla; `data/site-config.ts`'teki `url` ve
   `app/layout.tsx`'teki `metadataBase` gerçek domaine güncelle
   (sitemap, robots ve OG görselleri bunlara bağlı).
4. Search Console doğrulaması + harita gönderimi.

## 7. Test ve doğrulama

```bash
corepack pnpm typecheck
corepack pnpm test
```

- Envantere bağlı tek test bloğu: `lib/vehicles.test.ts` > `getRelatedVehicles`
  — gerçek demo stoğu üzerinde puanlama doğrular. Yeni stokta beklentiyi
  güncelle (marka eşleşmesi +3, kasa +2, fiyat ±%20 bandı +2; eşitlikte yıl).
- Canlıda kontrol: vitrin sayısı, filtre kombinasyonları, detay künyesi,
  admin girişi, araç oluşturma/silme.

## Sonrası

Her şey panelden yönetilir — kod dokunulmaz:

- Araç ekle/düzenle/sil: `/admin` (görseller `url | açıklama`, künye
  `etiket | değer` satırlarıyla)
- Statü: Satışta / Rezerve / Satıldı
- Her mutasyon audit log'a yazılır; iletişim formu `inquiries` tablosuna düşer.
