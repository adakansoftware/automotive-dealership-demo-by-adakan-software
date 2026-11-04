# Uygulama Planı — Atelier Motors Galeri Platformu

Sürüm: 1.0 (Stage 1-2 sonrası)
Bağımlılıklar ve tamamlama kriterleriyle önceliklendirilmiş görev listesi.
Bulgu kodları `docs/ARCHITECTURE_AUDIT.md` ile eşleşir.

## FAZ 1 — Stabilizasyon (onay gerektirir: hayır, düşük riskli)

| Görev | Bulgu | Tamamlama kriteri |
|---|---|---|
| git init + remote + ilk commit | C4 | ✅ Tamamlandı (7f023a6, origin/main) |
| `next.config.mjs` içinde `typescript.ignoreBuildErrors` kaldır | C1 | Build `tsc` doğrulamasıyla geçer; `tsc --noEmit` temiz |
| `pnpm audit` çalıştır, bulguları raporla | Güvenlik | Bulgular dokümante edilir; kritik varsa yama planı |
| `audi-rs6-avant` yanlış görsel düzelt | H6 | RS6 kartı Audi görseli taşır |
| `data/site-config.ts` oluştur; marka/telefon/WhatsApp/e-posta/adres tek kaynaktan | C3 | `site.tsx` ve `iletisim` sayfası hardcoded bilgi içermez |
| Footer telif yılı dinamik | L3 | `new Date().getFullYear()` |

## FAZ 2 — Mimari İyileştirme (onay gerektirir: evet)

| Görev | Bulgu | Tamamlama kriteri |
|---|---|---|
| Header/Footer root layout'a taşın | M1 | Hiçbir sayfa manuel Header/Footer render etmez; görsel kimlik değişmez |
| `components/site.tsx` parçala: `layout/header.tsx`, `layout/footer.tsx`, `vehicles/vehicle-card.tsx`, `vehicles/inquiry-bar.tsx`, `ui/select-field.tsx` | M1 | Dosya başına tek sorumluluk; import'lar güncel |
| `lib/vehicles.ts` veri erişim katmanı: `getVehicles`, `getVehicleBySlug`, `getFeaturedVehicles`, `getRelatedVehicles` | M2 | Sayfalar `data/vehicles.ts` dizisine doğrudan erişmez |
| `lib/format.ts`: `formatPrice`, `formatMileage` | M8 | Fiyat/km formatı tek yerden |
| `types/vehicle.ts`: `Vehicle`, `VehicleStatus`, `VehicleCondition` | M3, H7 | Strict tipler; `any` yok; detay özellik tablosu tip güvenli |
| Dead code temizle: `components/ui/button.tsx`, `lib/utils.ts`, kullanılmayan bağımlılıklar (`shadcn`, `@base-ui/react`, `cva`, `tailwind-merge`, `tw-animate-css`, `clsx`) | M6 | Build geçer, görsel değişiklik yok. Not: shadcn CLI ileride gerekirse devDependency olarak geri eklenir |
| `/araclar` sunucu/istemci sınırı: filtre paneli istemci, liste sunucu render | M1 | İstemci JS boyutu küçülür; filtre davranışı aynı |

## FAZ 3 — Çekirdek Deneyim (onay gerektirir: evet)

| Görev | Bulgu | Tamamlama kriteri |
|---|---|---|
| Gelişmiş filtreleme: marka→model bağımlı, fiyat/yıl/km aralığı, yakıt, vites, kasa, durum | H3, H7 | Filtreler birlikte çalışır; geçersiz kombinasyonlar güvenli |
| Filtre/sıralama durumu URL search params senkronu | H3 | Paylaşılan URL aynı sonucu verir; geri/ileri çalışır; reset var; sonuç sayısı doğru |
| Sıralama: en yeni, fiyat artan/azalan, km artan, yıl azalan + Türkçe etiketler | H4 | Ham değer kullanıcıya görünmez |
| Detay sayfası: `generateMetadata` (başlık, açıklama, OG) | H1 | Her araç sayfası kendi başlığını taşır |
| Detay sayfası: tam özellik tablosu (yalnızca mevcut veri) + araç durumu etiketi | M3, H7 | Eksik veri uydurulmaz |
| Galeri altyapısı: `VehicleImage[]` (çoklu görsel), thumbnail, klavye navigasyonu, tam ekran görüntüleyici | H7 | Tek görselli araçlar sorunsuz düşer |
| Benzer araçlar: marka + kasa + fiyat aralığı puanlaması | M4 | Açıklanabilir, AI'sız |
| Custom `not-found.tsx`, `error.tsx`, `loading.tsx` | H8 | Marka dilinde; `araclar/[slug]` geçersiz slug custom 404 |
| WhatsApp mesajına araç slug'u ekle | M10 | Mesaj hangi araçtan geldiğini içerir |

## FAZ 4 — SEO (onay gerektirir: evet)

| Görev | Bulgu | Tamamlama kriteri |
|---|---|---|
| `app/sitemap.ts`, `app/robots.ts` | H2 | Statik rotalar + tüm araç slug'ları sitemap'te |
| Sayfa bazlı `metadata` + `metadataBase` + canonical | H1, M7, M9 | Her sayfa uygun title/description/canonical |
| OG + Twitter card görselleri | H2 | Twitter card doğrulaması için meta etiketler mevcut |
| JSON-LD: `AutoDealer` (yalnızca gerçek veriler), `Vehicle` (fiyat/durum gerçek) | H2 | Uydurma rating/review/adres yok; `site-config` verilerle |
| `robots: noindex` admin rotaları için plan | H2 | Dokümante (admin henüz yok) |

## FAZ 5 — Cila (onay gerektirir: evet)

| Görev | Bulgu | Tamamlama kriteri |
|---|---|---|
| `next/image` + `unoptimized: false`; Unsplash `remotePatterns` izinli | H5 | LCP görselleri optimize; CLS yok |
| Mobil menü erişilebilirlik: `aria-expanded`, Escape, odak yönetimi, scroll kilidi | H9 | Klavye ile menü açılır/kapanır/gezinilir |
| `prefers-reduced-motion` desteği | M5 | Animasyonlar motion tercihini dinler |
| İletişim formu: istemci + sunucu doğrulama, hata erişilebilirliği, rate limit mimarisi (server action, gerçek gönderim sağlayıcısı onaya bağlı) | C2 | Demo/gerçek teslim açıkça ayrıştırılır; sır yok |
| Responsive denetim 375/430/768/1024/1440/1920 | — | Yatay taşma yok; dokümante edilmiş kontrol |
| KVKK metni yer tutucu planı | — | Hukuki uyum iddiası yok |

## FAZ 6 — Gelecek Sistem Tasarımı (yalnızca doküman; DB/admin/auth kurulumu onay gerektirir)

- PostgreSQL şema tasarımı: `vehicles`, `vehicle_images`, `vehicle_specs`, `inquiries`, `admin_users`, `site_config` + migration stratejisi.
- Admin paneli mimarisi: araç CRUD, durum yönetimi, sorgu yönetimi; NextAuth/benzeri yaklaşım karşılaştırması.
- Ortam değişkenleri listesi (`.env.example`), dağıtım ön koşulları.
- Kimlik doğrulama yaklaşımı, rate limit, audit log tasarımı.

## Test Stratejisi (kurulum onaya bağlı)

- Vitest + unit testler: filtreleme, sıralama, format, slug, benzer araçlar, form doğrulama.
- `package.json` script'leri: `typecheck`, `test`, `audit`.
- Her faz sonunda: `tsc --noEmit` + `next build` + mevcut testler.

## Durum Takibi

- FAZ 1 (Stabilizasyon): ✅ tamamlandı.
  - git init + remote: 7f023a6.
  - `typescript.ignoreBuildErrors` kaldırıldı; `tsc --noEmit` temiz.
  - `pnpm audit`: 88 bulgu (1 critical: proxy-addr, tamamı `shadcn` bağımlılık zinciri üzerinden). Çözüm: FAZ 2'de `shadcn` kaldırma — çalışma zamanı kodu etkilemiyor.
  - `audi-rs6-avant` görseli düzeltildi: yerel `/vehicles/rs6-4935644.jpg` (Range Rover ile ortak Unsplash URL'i kaldırıldı; dikey görseller `public/vehicles/` altında FAZ 3 galeri için saklandı).
  - `data/site-config.ts` oluşturuldu; `site.tsx` + `iletisim` hardcoded bilgi içermez.
  - Footer telif yılı dinamik.
  - Doğrulama: `tsc --noEmit` temiz, `next build` temiz (12 rota).
- FAZ 2 (Mimari İyileştirme): ✅ tamamlandı.
  - Header/Footer root layout'a taşındı; hiçbir sayfa manuel render etmiyor (M1).
  - `components/site.tsx` parçalandı: `layout/header.tsx`, `layout/footer.tsx`, `vehicles/vehicle-card.tsx`, `vehicles/inquiry-bar.tsx`, `vehicles/inventory-filters.tsx`, `ui/select-field.tsx` (M1).
  - `lib/vehicles.ts`: `getVehicles`, `getVehicleBySlug`, `getFeaturedVehicles`, `getRelatedVehicles` (marka+kasa+fiyat puanlaması), `filterVehicles`, `sortVehicles` (M2). Sayfalar `data/vehicles` dizisine doğrudan erişmiyor.
  - `lib/format.ts`: `formatPrice`, `formatMileage` (M8).
  - `types/vehicle.ts`: `Vehicle`, `VehicleStatus`, `VehicleCondition` + yakıt/vites/kasa literal union tipleri; `any` yok (M3, H7).
  - Dead code: `components/ui/button.tsx`, `lib/utils.ts`, `components/site.tsx` silindi; `shadcn`, `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` kaldırıldı; `globals.css` import'ları temizlendi (M6). shadcn ileride gerekirse devDependency olarak geri eklenir.
  - `/araclar` sunucu/istemci sınırı: filtre paneli istemci (`inventory-filters.tsx`), liste + sayı + boş durum sunucu render; filtre/sıralama URL search params üzerinden (M1, H3'in temeli atıldı — FAZ 3'te geliştirilecek).
  - Audit: 88 bulgudan 4'e düştü (kalan 4: `next` iç bağımlılık zinciri — browserslist, source-map-js, baseline-browser-mapping; yerel müdahale edilemez, upstream sürüm bekler). `postcss` 8.5.32'ye güncellendi.
  - Doğrulama: `tsc --noEmit` temiz, `next build` temiz; üretim sunucusunda tüm rotalar 200, geçersiz slug 404, `?brand=Audi` filtresi sunucu tarafında doğru sonuç veriyor.
- FAZ 3 (Çekirdek Deneyim): ✅ tamamlandı.
  - Gelişmiş filtreleme: marka→model bağımlı (marka değişince model sıfırlanır), fiyat/yıl/km aralıkları, yakıt, vites, kasa, durum; tümü URL search params üzerinden sunucu tarafında uygulanır; geçersiz/bozuk parametreler güvenli (sayısal olmayan değer yok sayılır) (H3, H7). Sayısal aralık girişleri blur/Enter'da commit edilir.
  - Filtre/sıralama URL senkronu: paylaşılan URL aynı sonucu verir; geri/ileri çalışır; "Filtreleri temizle" tüm parametreleri siler; sonuç sayısı sunucudan doğru (H3).
  - Sıralama: En Yeni, fiyat artan/azalan, km artan — Türkçe etiketli SelectField; ham `price-asc` değeri kullanıcıya görünmez (H4).
  - Detay sayfası `generateMetadata`: sayfa başlığı + açıklama + OG görseli her araçta (H1). Not: `metadataBase` FAZ 4'te.
  - Detay sayfası tam özellik tablosu ("Araç künyesi"): yalnızca mevcut veri (durum/sıfat yoksa satır da yok) + durum etiketi (Satışta/Rezerve rozeti) (M3, H7).
  - Galeri altyapısı: `VehicleImage[]` tipi, `getVehicleImages` (tek görselli araçlara otomatik düşer), thumbnail şeridi, ok tuşları + Escape klavye navigasyonu, tam ekran görüntüleyici (scroll kilidi dahil) (H7). RS6 üç yerel görselle demo.
  - Benzer araçlar: FAZ 2'de `getRelatedVehicles` (marka+kasa+fiyat puanlaması) olarak yapılmıştı (M4).
  - Custom `not-found.tsx` (root + `araclar/[slug]`), `error.tsx` (reset + ana sayfa), `loading.tsx` — marka dilinde (H8).
  - WhatsApp mesajına araç slug'u: `(ata-{slug})` biçiminde (M10).
  - Doğrulama: `tsc --noEmit` temiz, `next build` temiz; üretim sunucusunda filtre kombinasyonları, geçersiz parametreler, custom 404, metadata, durum rozeti, galeri, WhatsApp slug'u test edildi.
  - Not: `status` alanı demo verisidir (Range Rover Sport "Rezerve" örnek); gerçek envanter FAZ 6'de DB'den gelir.
- FAZ 4 (SEO): ✅ tamamlandı.
  - `app/sitemap.ts`: 4 statik rota + 6 araç slug'ı; `app/robots.ts`: tüm botlara izin + sitemap referansı (H2).
  - `metadataBase` site-config'ten (`url` alanı — yer tutucu `https://ateliermotors.example`, gerçek alan adı bekleniyor); title template (`%s — Atelier Motors`); her sayfada canonical + sayfa bazlı metadata; iletişim sayfası server/client bölündü (form `components/contact/contact-form.tsx`) (H1, M7, M9).
  - OG + Twitter card: tüm sayfalarda; detayda `summary_large_image` + araç görseli (H2).
  - JSON-LD: anasayfada `AutoDealer` (yalnızca site-config verileri — uydurma rating/review yok), detayda `Car` (fiyat TRY, durum `InStock`/`LimitedAvailability`/`SoldOut` eşlemesi, km, yalnızca mevcut alanlar) (H2).
  - Admin noindex planı: admin rotaları henüz yok; FAZ 6'de eklenecekleri zaman `robots.ts` `disallow` + sayfa bazlı `robots: { index: false }` uygulanacak (dokümante).
  - Doğrulama: `tsc --noEmit` + `next build` temiz; smoke test — sitemap 10 URL, robots.txt, canonical/OG/Twitter etiketleri, JSON-LD tipleri, iletişim başlığı.
- FAZ 5 (Cila): ✅ tamamlandı.
  - `next/image` + `unoptimized: false`; Unsplash `remotePatterns` izinli; kart/galeri/thumbnail `fill` + `sizes` ile optimize (srcset + `/_next/image` doğrulandı); CSS arka plan görselleri (hero/split/about) bilinçli olarak bırak — koddaki kısıt notu (H5).
  - Mobil menü erişilebilirlik: `aria-expanded` + `aria-controls`, Escape kapatma + toggle'a odak dönüşü, menü açıkken ilk linke odak, scroll kilidi, menü linkleri menüyü kapatır (H9).
  - `prefers-reduced-motion`: animasyon/geçiş/scroll davranışı kapanır (M5).
  - İletişim formu: server action (`app/iletisim/actions.ts`) + `useActionState`; istemci (native required/pattern) + sunucu doğrulama; hata erişilebilirliği (`aria-invalid`, `aria-describedby`, `role="alert"`); rate limit mimarisi (in-memory demo, 10 dk/5 istek — üretim Redis/DB dokümante); demo/gerçek gönderim açıkça ayrıştırılmış; sır yok. Not: `'use server'` dosyasından sabit export edilemez — başlangıç durumu `inquiry-state.ts`'de (C2).
  - Responsive denetim: kod seviyesi 375–1920 + manuel kontrol listesi `docs/RESPONSIVE_AUDIT.md`'de; KVKK yer tutucu planı aynı dosyada (hukuki uyum iddiası yok).
  - Doğrulama: `tsc --noEmit` + `next build` temiz; smoke — srcset/`/_next/image` 200, `aria-expanded`, server action form POST.
- FAZ 6+: bekliyor — onay sonrası uygulanır (yalnızca doküman).
