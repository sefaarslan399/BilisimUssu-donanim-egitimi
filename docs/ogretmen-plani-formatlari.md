# Öğretmen Planı Formatları

Her haftanın planı, JSON'daki `tur` alanına göre iki formattan biriyle üretilir. Biçim, renk ve bölüm sırası için referans PDF'ler taklit edilir:

- **Format K:** `referans/ogretmen-plani/FORMAT-K_elektronik-203-h04.pdf`
- **Format U:** `referans/ogretmen-plani/FORMAT-U_PRJ-208-B4.pdf` (ortaokul) ve `FORMAT-U_PRJ-114-E8.pdf` (yapı örneği)

**Ortak kurallar:**
- Süre 35 dk.
- Slaytlardaki cümleler plana birebir geçmez.
- Öğretmen konuşmaları tırnak içindedir.
- Quiz doğru cevap dağılımı A/C/B/D.
- "Ders", "kurs" değil.
- Kazanımlar JSON'daki K1–K4'ün birebir aynısıdır.

---

## Format K — Kavram dersi (tür `K`)

Başlık bandı: "ÖĞRETMEN DERS PLANI", ders başlığı ve sağda "N. Hafta".

**1. Genel Bilgiler** (tablo)

| Alan | Kaynak |
|---|---|
| Dersin Adı | JSON `ders_adi_plan` |
| Sınıf / Seviye | Ortaokul / Lise |
| Ünite / Konu | `<lms_adi> - <ünite adı> — <hafta başlığı>` |
| Öğrenme Alanı | JSON `ogrenme_alani` |
| Süre | 1 ders saati (35 dk) |
| Yöntem ve Teknikler | Anlatım, gösteri, soru-cevap, 3D model inceleme, animasyonla modelleme (+ haftaya özgü) |
| Araç-Gereç ve Kaynaklar | Etkileşimli ders (LMS), projeksiyon veya bilgisayar + JSON `materyal` |
| Kavramlar / Terimler | JSON `adimlar` (6 adım adı) |

**2. Kazanımlar:** K1–K4.

**3. Ders İşlenişi**
- **Giriş (5 dk):** Dikkat çekme ve güdüleme. O haftanın 3D modeli ya da animasyonu gösterilerek bir soru sorulur.
- **Gelişme (25 dk):** Tablo `Adım | Konu | Öğretmen Notu`, 6 satır.
  - Her notta öğretmen konuşması tırnak içinde verilir.
  - Her notun sonunda "Öğrencilere … söyletin/gösterttirin" yer alır.
  - Her notta **slayttaki animasyonun ne zaman oynatılacağı** belirtilir, ör. "Animasyonu oynatın, plaka dönerken sorun: …".
- **Değerlendirme ve Kapanış (5 dk).**

**4. Ölçme ve Değerlendirme:** 4 soru, A–D seçenekli. Her sorunun altında tek cümlelik açıklama; en altta cevap anahtarı.

**5. Açık Uçlu / Biçimlendirici Değerlendirme:** 3 kavram sorusu ("kendi cümlelerinle açıkla + günlük hayattan örnek") ve 1 öz değerlendirme sorusu.

**6. Öğretmen Notları ve Ödev**
- Ödev ya da sınıf dışı etkinlik.
- Öğretmen notları; ortaokulda Derinleş kullanımı ve yaş bandı uyarlaması.
- Süre tablosu.
- İmza alanı (Ders Öğretmeni / Okul Müdürü).

---

## Format U — Uygulama dersi (tür `U`)

Üst rozet: "ÖĞRETMEN UYGULAMA PLANI · <KOD>". Altında başlık, bir cümlelik alt başlık ve rozet satırı (Seviye · Süre: 1 ders · Grup · Donanım · Zorluk).

- **Hikâye / Senaryo:** Kısa senaryo ve **Görev** cümlesi. Ardından "Öğrenci bu derste ne yapıyor?" paragrafı.
- **1. Ders Künyesi:**
  - Ders kodu
  - Seviye / sınıf
  - Süre / grup
  - Donanım / platform
  - Kazanımlar (K1–K4)
  - Ön koşul
  - Değerlendirme
  - Öğrenci dersi slayt sayısı (LMS v9.3) + 4 soruluk bilgi testi
- **2. Öğretmen İçin Kavramsal Arka Plan:**
  - 4–6 kavram kartı.
  - **Nasıl çalışır?** 3 kartlı akış diyagramı ve açıklama paragrafı. Donanımda bu kartlar parça → bağlantı → sonuç biçiminde olur, ör. "RAM → yuva → sistem görür".
- **3. Ön Hazırlık:**
  - Kontrol listesi.
  - Malzemeler tablosu (Malzeme | Adet | Not; ekip başına).
- **4. Dakika Dakika Ders Akışı:**
  - Zaman çizelgesi görseli.
  - Tablo: Aşama/süre | Öğretmen ne yapar/söyler | Öğrenci ne yapar | ✔ Kontrol noktası | Slayt.
  - Öğrenci dersindeki slayt listesi.
- **5. Adım Adım Yönlendirme (Öğretmen Scripti):** JSON'daki 6 adımın her biri için dört kutu:
  - **GÖSTER:** Önce 3D provayı oynatın, sonra gerçek parçada gösterin.
  - **SOR**
  - **✔ KONTROL**
  - **⚠ SIK HATA**
- **6. Yapım Sırası ve Kontrol Tablosu:** Kod yerine "Parça | Yuva/Bağlantı | Doğru yön işareti | Not" tablosu ve fotoğraflı sıra.
- **7. Yönlendirici (Sokratik) Sorular:** 5–6 soru.
- **8. Sık Hatalar ve Anında Müdahale:**
  - Tablo: Belirti | Olası neden | Öğretmen müdahalesi.
  - "Öğrencinin derste gördüğü sorun giderme" tablosu.
- **9. Farklılaştırma:** Hızlı bitiren için, zorlanan için, grup yönetimi (roller ve rol değişimi).
- **10. Değerlendirme:**
  - Gözlem kontrol listesi.
  - Ürün rubriği (Başlangıç 1 / Gelişiyor 2 / Yeterli 3).
  - Bilgi testi cevap anahtarı (soru, doğru cevap, açıklama).
- **11. Kapanış ve Genişletme:** Toparlama, ödev ve sonraki derse köprü.
- **Güvenlik kutusu:** JSON `guvenlik` alanı + donanıma özgü maddeler.
- **Bitirme:** Donanımda "çalışan sistem ve belgeleme". Ne gösterilir, nasıl sunulur.
- **Referans Kaynaklar.**

## Format K+U

Format K iskeleti kullanılır. Gelişme tablosunda uygulama adımları için Format U'nun GÖSTER, SOR, KONTROL ve SIK HATA kutuları eklenir. Güvenlik kutusu zorunludur.
