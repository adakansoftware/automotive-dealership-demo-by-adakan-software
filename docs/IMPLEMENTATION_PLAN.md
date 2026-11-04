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

- FAZ 1.1 (git): ✅ tamamlandı.
- Diğer tüm görevler: bekliyor — onay sonrası uygulanır.
