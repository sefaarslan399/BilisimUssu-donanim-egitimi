---
description: Kalibrasyonu onaylanmış dersin haftalarını sırayla üretir. Örnek: /seri-uret DON-201 2-9
argument-hint: <DERS-KODU> <BAŞLANGIÇ-BİTİŞ>
---

Hedef: $ARGUMENTS

1. Ön koşullar: DON3D motoru `✓` olmalı ve dersin iki kalibrasyon haftası (K ve U formatı) hem HTML hem Plan için `✓` olmalı. Değilse DUR.
2. Kalibrasyon derslerini ve planlarını referans al; görsel dil, slayt yapısı, ton ve yoğunluk bunlarla tutarlı olmalı.
3. Aralıktaki her hafta için sırayla `/ders-uret`, ardından `/plan-uret` adımlarını uygula. Her hafta ayrı commit.
4. Bir haftada kalite döngüsü 3 denemede geçmezse `R` işaretle, Not sütununa sorunu yaz ve sonrakine geç.
5. Motorda eksik model/kalıp gerekiyorsa derse gömülü geçici kod yazma. Önce `bilesenler/DON3D`'ye ekle, demo'ya koy, sonra kullan.
6. Bitiş raporu: tamamlanan haftalar, `R` olanlar, `FOTO-GEREKLİ` ve `DOĞRULA` listeleri, motora eklenenler.
