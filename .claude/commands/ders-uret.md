---
description: Tek haftanın öğrenci dersini (HTML) üretir. Örnek: /ders-uret DON-201 1
argument-hint: <DERS-KODU> <HAFTA>
---

Hedef: $ARGUMENTS

1. `CLAUDE.md`, `docs/uretim-standartlari.md` ve `docs/gorsel-3d-standartlari.md` dosyalarını oku.
2. Ön koşulları denetle:
   - `templates/MASTER-v9_3.html` var mı?
   - `DURUM.md`'de DON3D motoru `✓` mi?
   - İstenen hafta kalibrasyon haftası değilse o dersin kalibrasyon haftaları `✓` mi?
   - Biri eksikse DUR ve bildir.
3. `mufredat/mufredat.json`'dan haftanın kaydını ve önceki haftayı (ısınma köprüsü) oku.
4. Slayt planı çıkar: her adım için hangi animasyon, 3D sahne ya da fotoğraf. JSON'daki **tüm** `animasyonlar`, `etkilesim` ve `sahne3d` öğeleri kullanılmalı. DON-201'de yalnız metin içeren içerik slaytı olmamalı.
5. MASTER'ı kopyala.
   - three.min.js ve DON3D'den yalnızca gereken modelleri `data-kutuphane` script etiketleriyle satır içi göm.
   - Dersi `icerik/<KOD>/<KOD>-H<NN>.html` olarak üret. Derleme scripti gerekiyorsa `build/` altında Python ile yaz (f-string kullanma).
6. Gerçek fotoğraf gerekiyorsa `assets/foto/` klasörüne bak. Yoksa `data-foto-gerekli` yer tutucusu koy ve `DURUM.md` Not sütununa `FOTO-GEREKLİ: …` yaz.
7. Pedagojik öz denetim:
   - Her kazanım bir adım, bir etkinlik ve bir quiz sorusuyla karşılanıyor mu?
   - Adım metinleri kısa mı (ortaokul ≤ 3 cümle, ≤ 15 kelime/cümle)?
   - Tahmin et → izle kurgusu var mı?
   - Derinleş slaytı var mı?
   - Renk tek başına bilgi taşıyor mu?
8. Kalite döngüsü (`CLAUDE.md` §5): validate → scroll_test → ekran_goruntusu (görüntüleri aç ve bak) → düzelt.
9. `DURUM.md` güncelle (kalibrasyon haftasıysa `K`), commit at. Rapor: slayt sayısı, kullanılan modeller/animasyonlar, dosya boyutu, doğrulama sonuçları, eksik fotoğraflar.
