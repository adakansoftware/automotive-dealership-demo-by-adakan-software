# Mimari Denetim Raporu — Atelier Motors Galeri Platformu

Tarih: 2026-11-04
Denetlenen sürüm: v0.app çıktısı, commit yok (git deposu yok).
Doğrulama ortamı: Windows 11, Node v24.13.1, pnpm 12.3.4 (corepack), Next.js 16.4.3 (Turbopack).

## 1. Mevcut Mimari

| Katman | Durum |
|---|---|
| Framework | Next.js 16.4.3, App Router, statik çıktı (tüm rotalar `○/●` statik) |
| Stil | Tek dosya `app/globals.css` (~24 satır sıkıştırılmış, custom sınıflar, Tailwind v4 import edilmiş ama app kodu Tailwind sınıfı kullanmıyor) |
| Veri | `data/vehicles.ts` — 6 araçlık statik dizi, tip tanımı aynı dosyada |
| Bileşenler | `components/site.tsx` — tek dosyada Header, Footer, VehicleCard, InquiryBar, SelectField (hepsi `'use client'`) |
| UI kütüphanesi | `components/ui/button.tsx` (shadcn/base-ui) — **kullanılmıyor**, dead code |
| Yardımcılar | `lib/utils.ts` (`cn`) — kullanılmıyor, dead code |
| Rotalar | `/`, `/araclar`, `/araclar/[slug]` (SSG), `/hakkimizda`, `/iletisim` |

Her sayfa kendi `<Header/>` ve `<Footer/>`'ını manuel render ediyor; root layout (`app/layout.tsx`) sadece `<html>/<body>` + Vercel Analytics taşıyor. Header tüm sayfalarda `'use client'` olduğu için her rota Header'ın istemci paketini içeriyor.

## 2. Mevcut İşlevler (doğrulanmış)

- Tüm rotalar HTTP 200 döndürüyor; bilinmeyen slug 404 döndürüyor (production smoke testi, `next start`).
- `tsc --noEmit` temiz. `next build` başarılı, 12 statik sayfa üretiliyor.
- Ana sayfa: hero (CSS background Unsplash görseli), öne çıkan araçlar (3 adet), hakkımızda özeti.
- `/araclar`: marka / kasa / yakıt filtreleri + fiyat-yıl sıralaması (istemci state'i, URL senkronu YOK).
- `/araclar/[slug]`: tek görsel, 4 özellik (yıl/km/yakıt/vites), InquiryBar (WhatsApp + tel + iletişim linki), "benzer" 3 araç (ilgisiz — sadece ilk 3 diğer araç).
- `/iletisim`: demo form, `onSubmit` yalnızca `setSent(true)`; hiçbir doğrulama/teslim yok (kendisi bunu belirtiyor — dürüst).
- Mobil menü: basit aç/kapa, `<800px` breakpoint.

## 3. Kritik / Yüksek Bulgular

### CRITICAL

| # | Bulgu | Kanıt |
|---|---|---|
| C1 | `next.config.mjs` → `typescript.ignoreBuildErrors: true` — tip hataları build'i engellemez. (Şu an tsc temiz; kapatma gereksiz ve riskli.) | `next.config.mjs:3-5` |
| C2 | İletişim formu hiçbir doğrulama/teslim katmanına sahip değil; yalnızca `required` HTML özniteliği. Spam koruması yok. Sunucu tarafı mimarisi yok. | `app/iletisim/page.tsx` |
| C3 | Site kimliği ve iletişim bilgileri tamamen yer tutucu ("Atelier Motors", `+90 212 000 00 00`, `hello@ateliermotors.com`, `wa.me/902120000000`) ve en az 4 dosyaya dağınık/hardcoded. Gerçek müşteri bilgileri değil; merkezi yapılandırma yok. | `components/site.tsx:21,25`, `app/iletisim/page.tsx`, `app/layout.tsx:6` |
| C4 | Git deposu yok. Sürüm kontrolü, geri alma noktası, değişiklik takibi mevcut değil. | kök dizin |

### HIGH

| # | Bulgu | Kanıt |
|---|---|---|
| H1 | Sayfa bazlı metadata yok: `/araclar`, `/hakkimizda`, `/iletisim` root title'ı miras alıyor; detay sayfası `generateMetadata` içermiyor — her araç sayfası aynı başlığı taşıyor (smoke testinde doğrulandı). | `app/araclar/[slug]/page.tsx` |
| H2 | Sitemap, robots.txt, canonical URL, Open Graph, Twitter card, yapısal veri (JSON-LD) — hiçbiri yok. | tüm `app/` |
| H3 | Filtre durumu URL'e yazılmıyor: paylaşılamaz, geri/ileri tuşları filtreleri kaybeder, sayfa yenilenince sıfırlanır. | `app/araclar/page.tsx` |
| H4 | Sıralama `<select>`'inde ham değerler ("price-asc", "price-desc", "year") Türkçe etiket olmadan kullanıcıya gösteriliyor; kilometre ve "en yeni listing" sıralaması yok. | `app/araclar/page.tsx`, `components/site.tsx:27` |
| H5 | Görseller ham `<img>` + Unsplash hotlink; `next/image` kullanılmıyor, `images.unoptimized: true`, lazy-loading yok, `width/height` yok (aspect-ratio kutuları CLS'yi kısmen engelliyor). | `components/site.tsx:23`, `next.config.mjs:6-8` |
| H6 | Veri hatası: `audi-rs6-avant` ile `range-rover-sport-p400` aynı görsel URL'ini kullanıyor (Range Rover fotoğrafı Audi kartında). | `data/vehicles.ts:22-23` |
| H7 | Tek görselli veri modeli: galeri/thumbnail/tam ekran görüntüleyici imkânsız; araç durumu (satılık/satıldı/rezerve), motor, güç, ekipman alanları yok. | `data/vehicles.ts:1-16` |
| H8 | Custom `not-found.tsx`, `error.tsx`, `loading.tsx` yok — varsayılan Next 404 sayfası marka dilini taşımıyor. | `app/` |
| H9 | Mobil menü erişilebilirlik açığı: `aria-expanded` yok, Escape ile kapanmıyor, odak yönetimi yok, açıkken arka plan kaydırması kilitlenmiyor, sayfa değişiminde menü state'i Header istemci state'inde kalıyor (yeni sayfada sıfırlanır — kabul edilebilir ama kaba). | `components/site.tsx:8-19` |

### MEDIUM

| # | Bulgu | Kanıt |
|---|---|---|
| M1 | Header/Footer her sayfada manuel render ediliyor; root layout'a taşınmalı. `/araclar` tüm sayfayı istemcide render ediyor — filtre paneli sunucu bileşeni olabilir, JS paketini küçültür. | tüm sayfalar |
| M2 | `Vehicle` tipi `data/vehicles.ts` içinde; veri erişim soyutlaması yok — frontend statik diziye doğrudan bağımlı (ileride DB'ye geçişi zorlaştırır). | `data/vehicles.ts` |
| M3 | Detay sayfası özellik tablosu zayıf tiplenmiş (`[label, value]` dizisi + `as string` cast). Renk ve kasa veride var ama gösterilmiyor. | `app/araclar/[slug]/page.tsx` |
| M4 | Benzer araçlar algoritması yok — `vehicles.filter(v => v.slug !== ...).slice(0,3)`. | `app/araclar/[slug]/page.tsx` |
| M5 | `html { scroll-behavior: smooth }` `prefers-reduced-motion` tercihini yok sayıyor. Hover animasyonları da motion tercihini dinlemiyor. | `app/globals.css:7` |
| M6 | Kullanılmayan bağımlılıklar: `shadcn` (runtime dep olarak yanlış — CLI aracı), `@base-ui/react`, `class-variance-authority`, `tailwind-merge`, `tw-animate-css`, `clsx` app kodunda kullanılmıyor; `components/ui/button.tsx` ve `lib/utils.ts` dead code. | `package.json`, `components/ui/button.tsx` |
| M7 | `metadataBase` tanımsız — OG/resolved URL'ler bozulur; `generator: 'v0.app'` meta etiketi üretilen sayfada çıkıyor. | `app/layout.tsx:5-26` |
| M8 | Fiyat/km formatı VehicleCard ve detay sayfasında iki kez elle yazılmış — ortak formatter yok. | `components/site.tsx:23`, `app/araclar/[slug]/page.tsx` |
| M9 | `detail-hero` için metadata içinde `robots` yönergeleri, `alternates.canonical` yok. | tüm sayfalar |
| M10 | WhatsApp mesajı araç slug/URL içermiyor; kullanıcı hangi araçtan geldi belirsiz olabilir ("hakkında bilgi almak istiyorum" — model adı var, yeterli olabilir ama slug eklemek lead takibini kolaylaştırır). | `components/site.tsx:25` |

### LOW

| # | Bulgu | Kanıt |
|---|---|---|
| L1 | `hero-index` "01 / 03" statik dekorasyon; scroll-cue işlevsiz. | `app/page.tsx` |
| L2 | `viewport.colorScheme: 'light dark'` — site yalnızca koyu tema; beyaz tema için tasarım yok (UA stilindeki form kontrolleri açık renkte açılabilir). | `app/layout.tsx:28-34` |
| L3 | Footer telif yılı hardcoded "2025". | `components/site.tsx:21` |
| L4 | Sıralama state'i filtre state'iyle aynı panelde; UX olarak ayrık olmalı. | `app/araclar/page.tsx` |
| L5 | Boş sonuç durumu mevcut ama "filtreleri temizle" aksiyonu sunmuyor. | `app/araclar/page.tsx` |
| L6 | `filter` sonrası `sort` yeni dizi üzerinde — orijinal veri mutasyona uğramıyor (doğru); yine de `[...list].sort` ile niyet açıkça belirtilmeli. | `app/araclar/page.tsx` |
| L7 | Tel/WhatsApp linklerinde `rel` ve güvenlik tamam (`noreferrer` var). Bulunamayan açık XSS/injection riski yok — `dangerouslySetInnerHTML` kullanılmıyor, form verisi hiçbir yere gönderilmiyor. | genel |

## 4. Güvenlik Değerlendirmesi

- XSS/injection: mevcut kod yüzeyinde risk düşük. Form verisi hiçbir hedefe gitmiyor.
- Sır sızıntısı: `.env` kullanılmıyor, sır yok. `NODE_ENV` dışında environment değişkeni yok.
- Dış bağlantılar: WhatsApp `noreferrer` ile güvenli.
- Bağımlılık güvenlik taraması henüz çalıştırılmadı (audit script yok; Stage 3'te `pnpm audit` çalıştırılacak).
- Gelecekte admin/API eklendiğinde: yetkilendirme, rate limit, sunucu tarafı doğrulama mimarisi gerekli (bkz. plan).

## 5. Performans Değerlendirmesi

- `unoptimized: true` + ham `<img>`: LCP görselleri optimize edilmiyor (Unsplash `w=1600`/`w=2400` tam boyda iniyor).
- Tüm sayfalar statik üretildiğinden TTFB iyi; sorun istemci JS'i ve görsel ağırlığı.
- `/araclar` tamamen istemci bileşeni — sayfa metni/filtre paneli sunucuda render edilebilir.
- Font: sistem fontu (Arial/Georgia) — harici font yükü yok, avantaj.
- Ölçüm: Lighthouse koşulmadı; skor iddiası yok.

## 6. Önerilen Mimari

- `app/layout.tsx` → Header/Footer'ı taşı (Header istemci, geri kalan sunucu).
- `components/site.tsx` → `components/layout/header.tsx`, `footer.tsx`; `components/vehicles/vehicle-card.tsx`, `inquiry-bar.tsx`; `components/ui/select-field.tsx`.
- `lib/vehicles.ts` → veri erişim katmanı (`getVehicles`, `getVehicleBySlug`, `getFeaturedVehicles`, `getRelatedVehicles`); statik dizi implementation detail olur.
- `lib/format.ts` → `formatPrice`, `formatMileage` (Intl.NumberFormat('tr-TR'), tek kaynak).
- `lib/validation.ts` → iletişim formu şema doğrulaması (zod önerisi; kurulum öncesi onay).
- `data/site-config.ts` → marka adı, telefon, WhatsApp, e-posta, adres, çalışma saatleri (C3'ün tek çözüm noktası).
- `types/vehicle.ts` → `Vehicle`, `VehicleStatus`, `VehicleCondition`, `VehicleImage`.
- SEO: `app/sitemap.ts`, `app/robots.ts`, sayfa bazlı `metadata`/`generateMetadata`, `metadataBase`, JSON-LD (`AutoDealer`, `Vehicle` — yalnızca gerçek verilerle).
- Test: Vitest + unit testler (filtreleme, sıralama, format, slug, related-vehicles) — kurulum öncesi onay.

## 7. Önceliklendirilmiş Uygulama Planı

(Ayrıntılar `docs/IMPLEMENTATION_PLAN.md` dosyasında.)

1. **Stabilizasyon**: git init + ilk commit (C4), `ignoreBuildErrors` kaldır (C1), `pnpm audit`, H6 görsel düzeltmesi, C3 site yapılandırmasının merkezileştirilmesi.
2. **Mimari**: layout'a Header/Footer, dosya ayrımı, veri erişim katmanı, formatter'lar, dead code temizliği (M1-M3, M6, M8).
3. **Çekirdek deneyim**: URL senkronlu gelişmiş filtreleme + sıralama (H3, H4), detay sayfası metadata + tam özellikler + galeri altyapısı (H1, H7, M3), benzer araçlar algoritması (M4), custom 404/error/loading (H8).
4. **SEO**: sitemap, robots, OG, JSON-LD (H2, M7, M9).
5. **Cila**: erişilebilirlik (H9, M5), responsive kontrol, performans (next/image — H5), iletişim formu doğrulama + sunucu action mimarisi (C2).
6. **Gelecek sistem tasarımı**: DB şeması, admin, kimlik doğrulama — yalnızca doküman.

## 8. Doğrulanmayan Noktalar

- Lighthouse/Core Web Vitals ölçümü yapılmadı.
- `pnpm audit` henüz çalıştırılmadı.
- Görsel regresyon karşılaştırması için ekran görüntüsü temeli yok.
- 375/430/768/1024/1440/1920px manuel responsive denetimi henüz yapılmadı (görsel olarak kod incelendi; Stage 6'da yapılacak).
