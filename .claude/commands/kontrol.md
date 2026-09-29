---
description: Üretilmiş dersleri toplu denetler (düzeltmez, raporlar). Örnek: /kontrol DON-201
argument-hint: <DERS-KODU | hepsi>
---

Hedef: $ARGUMENTS

1. İlgili `icerik/` dosyalarında `validate.py` ve `scroll_test.js` çalıştır.
2. JSON uyumu:
   - Her kazanım ve 6 adım derste var mı?
   - JSON'daki tüm `sahne3d`, `animasyonlar` ve `etkilesim` öğeleri kullanılmış mı?
3. Görsel denetim: `ekran_goruntusu.js` ile görüntü al. Şunları işaretle:
   - Yalnız metin slaytları
   - Boş 3D alanları
   - Okunaksız etiketler
4. Her ders için plan var mı, türüne uygun formatta mı (K/U)?
5. `DURUM.md` ile dosya sistemi tutarlı mı?
6. Dosya bazında hata/uyarı tablosuyla rapor ver.
