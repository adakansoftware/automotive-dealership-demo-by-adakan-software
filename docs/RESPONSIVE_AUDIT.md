# Responsive Denetim — Atelier Motors

FAZ 5 kapsamında kod seviyesinde denetim. Görsel doğrulama için tarayıcıda
manuel kontrol önerilir (aşağıdaki kontrol listesi).

## Kırılımlar (globals.css)

- `800px`: masaüstü/mobil geçişi — nav ve CTA gizlenir, menü toggle açılır,
  tüm grid'ler tek kolona düşer (intro, about, contact, vehicle-grid, footer,
  inventory, detail-layout, spec-table 2 kolon, values 2 kolon).
- `480px`: küçük telefon — hero başlık küçülür, filter-panel tek kolon,
  vehicle-meta dikey, spec-table tek kolon, values tek kolon.

## Kod seviyesi bulgular

| Genişlik | Durum | Not |
|---|---|---|
| 375 | OK | Grid'ler tek kolon; `clamp()` padding'ler dar ekrana ölçeklenir |
| 430 | OK | 375 ile aynı kırılım |
| 768 | OK | 800px altı — mobil düzen aktif |
| 1024 | OK | Masaüstü düzen; vehicle-grid 3 kolon |
| 1440 | OK | `clamp()` üst sınırları devreye girer |
| 1920 | OK | İçerik `max-width` sınırsız ancak grid + clamp ile dengeli; yatay taşma riski yok |

- Yatay taşma riski: `min-width:0` vehicle-card'da mevcut; uzun kelime riski
  taşıyan tek alan araç adı (Georgia serif) — mevcut demo veride sorun yok.
- Galeri tam ekran: `max-width:92vw / max-height:86vh` — tüm genişliklerde sığar.
- Filtre aralık girişleri: 480px altında dikey istiflenir.

## Manuel görsel kontrol listesi (tarayıcıda)

- [ ] 375 / 430: menü toggle görünür ve açılır; sekmeler taşmaz
- [ ] 768: inventory filtre paneli 2 kolon, liste tek kolon
- [ ] 1024+: filtre paneli sol kolon (240px), 3 kartlı grid
- [ ] Detay sayfası: galeri + bilgi dikey istif, spec-table 2 kolon
- [ ] Tam ekran galeri: görsel ekran içinde kalır, kapatma erişilebilir
- [ ] İletişim formu: hata mesajları alanları aşağı iter, taşma yok

## KVKK Yer Tutucu Planı

Bu demo, hukuki uyum iddiası taşımaz. Gerçek iletişim formu devreye
alınmadan önce:

1. KVKK aydınlatma metni hukuk danışmanınca hazırlanacak (yer tutucu
   metin kodda yok — bilinçli karar).
2. Form altına açık rıza onay kutusu eklenir (zorunlu, sunucu tarafında
   doğrulanır).
3. Sorgu verileri FAZ 6 veritabanında saklanır; saklama süresi ve silme
   prosedürü metinde tanımlanır.
4. `inquiries` tablosu şeması (FAZ 6) rıza tarihi alanı içerir.
