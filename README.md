# Bilişim Üssü — Bilgisayar Donanımı (DON-201 / DON-301)

2 ders × 14 hafta = **28 etkileşimli ders + 28 öğretmen planı**. Claude Code ile bulutta, GitHub'a bağlı üretilir. DON-201 (ortaokul) 3D ve animasyon ağırlıklıdır.

## Klasörler

```
CLAUDE.md                       Claude Code ana talimatları
DURUM.md                        Motor + 28 hafta takip tablosu
mufredat/mufredat.json          TEK DOĞRULUK KAYNAĞI (tür, kazanım, 6 adım, görsel spesifikasyon)
mufredat/DON-*.md               Okunabilir müfredat (JSON'dan üretilir)
docs/gorsel-3d-standartlari.md  DON3D motoru, performans, görsel dil, zorunlu minimumlar
docs/gorsel-katalog.md          33 model, 26 animasyon, 19 etkileşim kalıbı ve kullanıldığı haftalar
docs/ogretmen-plani-formatlari.md  Format K (kavram) ve Format U (uygulama)
docs/uretim-standartlari.md     v9.3 + pedagojik + 10–15 yaş kuralları
referans/ogretmen-plani/        Gönderdiğin 3 plan PDF'i (format referansı)
bilesenler/DON3D/               3D motor (ilk iş olarak üretilecek)
kaynak/<KOD>/H<NN>/             Ders kaynakları (slaytlar, ders betiği, stil, SVG) → scripts/derle.py ile icerik/ altına derlenir
ogretmen-plani/<KOD>/            Öğretmen planları (HTML + PDF) → scripts/plan_derle.py
assets/font/                    Carlito (OFL) — plan PDF'leri için, referans planlarla aynı font
scripts/                        derle.py, plan_derle.py, validate.py, scroll_test.js, ekran_goruntusu.js, model_onizle.js, render_mufredat.py, kurulum.sh
.claude/commands/               /3d-motor-uret /ders-uret /plan-uret /seri-uret /kontrol /model-uret
```

## Kurulum

1. Bu klasörü yeni bir private GitHub reposuna yükle.
2. `templates/MASTER-v9_3.html` dosyasını ekle.
3. `referans/ders/` klasörüne 1 ortaokul ve 1 lise v9.3 dersi ekle. Varsa 3D oyun kütüphanesinden bir örnek de koy.
4. Push et. Claude Code (web) ortam kurulum komutu: `bash scripts/kurulum.sh`

## Üretim sırası

| # | Claude Code'a yaz | Senin işin |
|---|---|---|
| 1 | `/3d-motor-uret` | `demo.html` vitrinini aç; modelleri, animasyonları ve akıcılığı onayla ya da düzeltme iste |
| 2 | `/ders-uret DON-201 1` + `/plan-uret DON-201 1` | Format K kalibrasyonu: onayla |
| 3 | `/ders-uret DON-201 10` + `/plan-uret DON-201 10` | Format U kalibrasyonu; fotoğrafları `assets/foto/` klasörüne ekle |
| 4 | "DON-201 kalibrasyon onaylandı, H01 ve H10'u ✓ yap" | |
| 5 | `/seri-uret DON-201 2-9`, sonra `11-14` | Ünite ünite PR incele |
| 6 | DON-301 için aynı döngü (kalibrasyon H1 ve H9) | |

Motor bir kez doğru kurulursa 28 dersin görsel kalitesi tutarlı olur. Bu yüzden 1. adımda zaman harcamaya değer.

## Senin hazırlayacakların

- **Gerçek fotoğraflar:**
  - DON-201 H10–H11 ve DON-301 H9–H10'daki her yapım adımı
  - JSON `foto` listesindeki parçalar (anakart, RAM, HDD içi, M.2, işlemci vb.)
  - Claude Code eksikleri `DURUM.md`'de `FOTO-GEREKLİ` olarak listeler.
- **UEFI ve kurulum ekran görüntüleri:** DON-301 H11–H12 için `assets/ekran/` klasörüne.

## Müfredatı değiştirmek

`mufredat/mufredat.json` dosyasını düzenle, ardından `python3 scripts/render_mufredat.py` çalıştır ve commit at. Script şunları denetler:
- Her haftada 4 kazanım ve 6 adım var mı
- Gözlenemeyen fiil kullanılmış mı
- Katalog kodları geçerli mi
- DON-201'in her haftasında 3D sahne ve animasyon var mı
