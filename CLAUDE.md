# CLAUDE.md — Bilişim Üssü Bilgisayar Donanımı Programı

Bu repo iki dersin (2 × 14 hafta) etkileşimli HTML derslerini ve öğretmen planlarını üretir. **DON-201 görsel olarak zengin olmalıdır: 3D sahneler ve animasyonlar dersin taşıyıcısıdır.**

| Kod | LMS adı | Kademe | Sınıf / Yaş | Görsel seviye |
|---|---|---|---|---|
| DON-201 | Donanım 201 | Ortaokul | 5–8 / 10–15 | YÜKSEK: her derste 3D + her adımda animasyon |
| DON-301 | Donanım 301 | Lise | 9 / 14–16 | ORTA: teknik animasyon, gerekli haftalarda 3D |

## 1. Doğruluk kaynakları (öncelik sırası)

1. `mufredat/mufredat.json`: tür (K/U/K+U), 4 kazanım, 6 adım, etkinlik, görsel spesifikasyon (`sahne3d`, `animasyonlar`, `etkilesim`, `foto`), Derinleş, güvenlik. **İçerik buradan sapmaz.** Değişiklik gerekiyorsa JSON düzenlenir, `python3 scripts/render_mufredat.py` çalıştırılır ve gerekçe commit mesajına yazılır.
2. `templates/MASTER-v9_3.html`: ders iskeleti. **Salt okunur.** Yoksa üretime başlama; dur ve bildir.
3. `docs/gorsel-3d-standartlari.md`: 3D motor, performans, görsel dil ve zorunlu minimumlar.
4. `docs/ogretmen-plani-formatlari.md` ve `referans/ogretmen-plani/*.pdf`: plan formatları K ve U.
5. `docs/uretim-standartlari.md`: v9.3 kuralları, pedagojik kurallar ve 10–15 yaş kuralları.
6. `referans/ders/`: onaylı örnek dersler (ton, yoğunluk).

## 2. Üretim sırası (zorunlu)

1. **DON3D motoru:** `/3d-motor-uret`. Motor, tüm M-* modelleri, A-* animasyon kalıpları ve E-* etkileşimleri `bilesenler/DON3D/` altında üretilir. `demo.html` vitrini ile PR açılır ve Kadir onaylayana kadar **ders üretilmez**.
2. **Kalibrasyon:** `/ders-uret DON-201 1` + `/plan-uret DON-201 1` (Format K) ve `/ders-uret DON-201 10` + `/plan-uret DON-201 10` (Format U). İki formatın ilk örnekleri onaylanmadan seri üretim yapılmaz.
3. **Seri üretim:** `/seri-uret DON-201 2-14`.
4. **DON-301:** Aynı döngü (H1 Format K, H9 Format U kalibrasyonu).

Durumlar `DURUM.md`'de tutulur: `K` kalibrasyon, `✓` tamam, `R` revizyon.

## 3. Ders HTML yapısı

- **Kapak:** Haftanın ana 3D modeli döner.
- **Hedefler:** K1–K4 öğrenci diliyle.
- **Isınma:** Bir tahmin sorusu ya da önceki haftaya köprü.
- **Adım 1–6:** JSON `adimlar` sırasıyla, her adım bir slayt (yoğunsa ikiye bölünür).
  - Her adım slaytında JSON'daki ilgili animasyon ya da 3D sahne bulunur. Her adımın 3D olması gerekmez; 3D işe yaradığı yerde kullanılır, diğerleri 2D animasyon/illüstrasyon olabilir.
  - Tür U ise her slayt iki panellidir: 3D prova + gerçek fotoğraf ve talimat.
- **Etkinlik:** JSON `etkilesim`. Tam sayfa değil: solda yönerge + ipucu + ilerleme, sağda görsel etkinlik paneli (`docs/gorsel-3d-standartlari.md` §5).
- **Derinleş:** Yalnızca DON-201, JSON `derinles`.
- **Quiz:** 4 soru (DON-201'de + 1 Derinleş bonus). En az 1 görselli soru. Doğru cevap dağılımı A/C/B/D.
- **Özet:** Küçük resimli 6 adım.

Dosya adları: `icerik/DON-201/DON-201-H01.html`, `ogretmen-plani/DON-201/DON-201-H01.html` ve `.pdf`.

## 4. 3D'yi derse gömme

- `node_modules/three/build/three.min.js` dosyası `<script data-kutuphane="three">` içinde, DON3D ise `<script data-kutuphane="don3d">` içinde satır içi gömülür. **CDN yok.**
- Derste yalnızca o haftanın kullandığı modeller gömülür (boyut ≤ 1,5 MB).
- Tek `WebGLRenderer` kullanılır. Pasif slaytta render durur. `data-yedek` yedek görseli ve `prefers-reduced-motion` desteği zorunludur (`validate.py` denetler).

## 5. Kalite döngüsü (her ders)

1. `python3 scripts/validate.py <dosya>`: sıfır hata.
2. `node scripts/scroll_test.js <dosya>`: 7 görünüm alanında sıfır taşma, JS hatası yok.
3. `node scripts/ekran_goruntusu.js <dosya>`: slayt görüntülerini **aç ve bak.** Aşağıdakilerden biri varsa düzelt:
   - Yalnız metin içeren içerik slaytı
   - Boş ya da siyah 3D alanı
   - Okunmayan etiket
   - Oyuncak gibi görünen model
   - Taşan kod veya metin
4. `DURUM.md` güncellenir, sonra commit atılır: `DON-201 H01: <Başlık> — ders`.

## 6. Teknik doğruluk

Parça adları, konnektörler, yuva yönleri ve güvenlik adımları **gerçekle birebir** olmalıdır. Örnekler:
- DDR4 ve DDR5 çentik konumu farklıdır.
- SATA konnektörü L şeklindedir.
- İşlemci köşe üçgeni soketteki işaretle hizalanır.
- M.2 M anahtarı ile B+M anahtarı farklıdır.
- 1 TB = 10¹² B ≈ 931,3 GiB.

Emin olunmayan bilgi derse konmaz; `DURUM.md` Not sütununa `DOĞRULA:` notu düşülür.

## 7. Asla yapma

- MASTER'ı ya da `referans/` klasörünü düzenleme.
- Güç kaynağı, pil veya tüplü monitörün içini görselde açık gösterme.
- Marka adı veya logo kullanma.
- Harici dosya, CDN veya GLB model kullanma.
- DON-201'de yalnız metin içeren içerik slaytı bırakma.
- Yasak kelimeleri kullanma (`docs/uretim-standartlari.md`). Özellikle kurulum ekranları için "sihirbaz" değil **"kurulum adımları"** denir.
- Doğrulamadan geçmeyen dosyayı commit etme; motor ve kalibrasyon onayı olmadan seri üretime geçme.
