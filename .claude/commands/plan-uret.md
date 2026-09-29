---
description: Tek haftanın öğretmen planını (HTML + PDF) JSON'daki türe göre Format K ya da U ile üretir. Örnek: /plan-uret DON-201 10
argument-hint: <DERS-KODU> <HAFTA>
---

Hedef: $ARGUMENTS

1. `docs/ogretmen-plani-formatlari.md` dosyasını oku. JSON `tur` alanına göre referans PDF'i aç ve görsel düzenini inceleyerek taklit et:
   - K → `FORMAT-K_…pdf`
   - U → `FORMAT-U_PRJ-208…pdf`
   - K+U → K iskeleti + U kutuları
2. Öğrenci dersi (`icerik/…`) yoksa DUR. Varsa slayt listesini, animasyonların hangi slaytta olduğunu ve quizi çıkar.
3. Planı yaz:
   - Slayt cümlelerini birebir kullanma.
   - Öğretmen konuşmaları tırnak içinde olsun.
   - Her adımda animasyonun **ne zaman oynatılacağını ve oynarken ne sorulacağını** yaz.
   - Format U'da her adım için GÖSTER (önce 3D prova, sonra gerçek parça), SOR, ✔ KONTROL ve ⚠ SIK HATA kutularını doldur.
   - Güvenlik kutusu JSON `guvenlik` alanından gelir.
4. Toplam süre 35 dk olmalı. Ortaokulda yaş bandı uyarlaması ve Derinleş kullanımı notlarını ekle.
5. İçeriği `kaynak/<KOD>/H<NN>/plan.json` dosyasına yaz (örnek: `kaynak/DON-201/H01/plan.json`), sonra `python3 scripts/plan_derle.py <KOD> <HAFTA>` çalıştır: `ogretmen-plani/<KOD>/<KOD>-H<NN>.html` (A4 yazdırma CSS'i) ve WeasyPrint ile PDF üretilir. Genel bilgiler ve kazanımlar müfredattan, Bilgi Testi dersin `lesson.js` dosyasından okunur. PDF'in ilk iki sayfasını görüntüye çevirip referans PDF ile görsel olarak karşılaştır.
6. `python3 scripts/validate.py --plan-karsilastir <plan.html> <ders.html>` çalıştır; birebir ortak ifade kalmayana kadar düzelt.
7. `DURUM.md` Plan sütununu güncelle, commit at.
