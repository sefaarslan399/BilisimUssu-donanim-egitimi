---
description: DON3D 3D motorunu, model kütüphanesini, animasyon ve etkileşim kalıplarını üretir. Ders üretiminden önce bir kez çalıştırılır.
argument-hint: [bolum: cekirdek | modeller | animasyonlar | etkilesimler | hepsi]
---

Hedef: $ARGUMENTS (boşsa: hepsi)

1. `CLAUDE.md`, `docs/gorsel-3d-standartlari.md`, `docs/gorsel-katalog.md` dosyalarını ve `templates/MASTER-v9_3.html`'i oku. MASTER'ın slayt geçiş olayını, CSS değişkenlerini ve kademe renklerini çıkar.
2. **Çekirdek** (`bilesenler/DON3D/don3d.js`):
   - Tek WebGLRenderer
   - Sahne yaşam döngüsü (MASTER slayt olayına bağlı `etkinlestir`/`duraklat`, `visibilitychange`)
   - Otomatik kalite
   - `webglcontextlost` yedeği
   - `prefers-reduced-motion`
   - HTML etiket katmanı
   - Klavye kontrolleri
   - Standarttaki API imzalarına birebir uy.
3. **Modeller** (`bilesenler/DON3D/modeller/M-*.js`): Katalogdaki her M-* kodu için prosedürel üretici yaz.
   - Alt parçalar adlandırılır (`name`) ve `userData.etiket`/`userData.bilgi` taşır.
   - Oranlar gerçek parçaya sadık olur (ör. DIMM ≈ 133 × 31 mm; 3.5" HDD ≈ 147 × 102 × 26 mm).
   - Sahne başına 60 bin üçgen bütçesi aşılmaz.
   - M-PSU'nun içi modellenmez.
4. **Animasyonlar** (A-*) ve **etkileşimler** (E-*): Katalogdaki her kod için fonksiyon yaz. 2D olanlar `DON3D.anim2d` altında.
5. **demo.html:** MASTER kopyası üzerinde vitrin.
   - Her slaytta bir model grubu ve ilgili kalıplar oynatılabilir olsun.
   - En az şunlar bulunsun: M-MASAUSTU-ACIK + A-PATLAT, M-RAM + M-RAM-YUVASI + E-TAK, M-HDD-ACIK + A-DONUS, M-CPU + M-SOGUTUCU + A-ISI, M-ANAKART + A-KAMERA-TUR.
6. Kalite:
   - `validate.py` ve `scroll_test.js` (demo.html) çalıştır.
   - `ekran_goruntusu.js` ile her slaytın görüntüsünü al, **bak** ve modellerin gerçekçi, okunur ve oyuncak görünümsüz olduğunu kontrol et.
   - Chromium'da (SwiftShader) fps ölç; ≥ 30 hedefini raporla.
7. `DURUM.md` motor tablosunu güncelle, commit at ve PR aç. Rapor: model sayısı, üçgen sayıları, fps, boyut (KB), ekran görüntüsü listesi.
