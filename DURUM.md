# Üretim Durumu

Durum: `—` başlanmadı · `K` kalibrasyon (onay bekliyor) · `✓` tamam · `R` revizyon

## DON3D Görsel Motoru

| Bileşen | Durum | Not |
|---|---|---|
| Motor çekirdeği (renderer, sahne yaşam döngüsü, yedek görsel) | K | Tek renderer, slayt yaşam döngüsü, otomatik kalite, `data-yedek`, hareket azaltma, HTML etiket, klavye. H01 ile birlikte onay bekliyor. |
| Etkileşimler (E-DONDUR, E-BILGI, E-TAK) | K | Yazıldı: E-DONDUR, E-BILGI, E-SINIFLA, E-TAK, E-SAYAC (ampullerle bit/sayı/harf), E-TAHMIN (tahmin et–izle). |
| Animasyon kalıpları | K | Yazıldı: A-VURGU, A-KATMAN, A-AKIS, A-DONUS, A-TAK (tak/çıkar, vida, kaydır, hiza), A-SAYAC (bit göstergesi), A-DOLUM (bellek dolumu), A-OLCEK (bin kat ölçek), A-FIS (kablo ucunu porta takma), A-KAMERA-TUR, A-DALGA (2D), A-UYARI. E-DOGRU-YANLIS eklendi. |
| Model kütüphanesi | K | Yazıldı: M-MASAUSTU, M-MASAUSTU-ACIK, M-MONITOR, M-KLAVYE, M-FARE, M-RAM, M-RAM-YUVASI, M-AMPUL-SIRASI, M-ARKA-PANEL, M-KABLO-UCLARI, M-DIZUSTU, M-PSU, M-ANTISTATIK-BILEKLIK, M-PIL, M-CRT, M-GUC-FISI, M-CPU, M-FAN (tozlu API), M-SOGUTUCU, M-RAM-DDR5, M-SODIMM. |

## DON-201 – Bilgisayar Donanımı

| Hafta | Başlık | Tür | HTML | Plan | Not |
|---|---|---|---|---|---|
| H01 | Donanım, Yazılım ve Bilgisayarın Dört İşi | K | ✓ | ✓ | Format K kalibrasyonu onaylandı. |
| H02 | Bit ve Byte | K | ✓ | ✓ | 15 slayt, 874 KB. 3D: kapak, Adım 1, 3, 4, Etkinlik 1 (ampul sırası); 2D: bit desenleri, KB–TB ölçeği, bellek dolumu, bellek tahmin oyunu. Fotoğraf gerekmiyor. |
| H03 | Bağlantı Noktaları ve Çevre Birimleri | K | K | K | 15 slayt. 3D: arka panel (port bilgisi, USB-A/C takma, HDMI ve ses kamera turu, kablo takma etkinliği), dizüstü yan portlar. FOTO-GEREKLİ: DON-201-H03-arka-panel.jpg, DON-201-H03-dizustu-portlar.jpg. |
| H04 | Güvenli Çalışma | K+U | K | K | 15 slayt. 3D: elektrik boşaltma (kasa+priz), tutuş ve bileklik, asla açılmayanlar (güç kaynağı, şişmiş pil, tüplü monitör); 2D: kural kartları, statik kıvılcım, vida düzeni, doğru/yanlış sahneleri, güvenlik sözleşmesi. Plan Format K+U. FOTO-GEREKLİ: DON-201-H04-bileklik-el.jpg, DON-201-H04-psu-etiket.jpg. |
| H05 | Anakart | K | — | — | |
| H06 | İşlemci | K | K | K | 15 slayt. 3D: işlemci üst/alt yüz, soğutucu kaldır-tak ısı deneyi (A-ISI), patlatma + mikroskop (termal macun); 2D: komut kuyruğu (A-KUYRUK), çekirdek yarışı (A-YARIS), saat hızı sürgüsü. FOTO-GEREKLİ: DON-201-H06-islemci-ust-alt.jpg, DON-201-H06-sogutucu-fan.jpg. DOĞRULA: termometre değerleri temsilî; işlemci çentik konumları yaklaşık. |
| H07 | RAM | K | — | — | |
| H08 | Depolama Birimleri | K | — | — | |
| H09 | Güç Kaynağı, Ekran Kartı ve Soğutma | K | — | — | |
| H10 | Atölye 1: Kasayı Açma ve RAM Sök–Tak | U | ✓ | ✓ | Format U kalibrasyonu onaylandı. 15 slayt, 883 KB. FOTO-GEREKLİ: DON-201-H10-1-guvenlik.jpg, -2-yan-kapak.jpg, -3-parcalar.jpg, -4-ram-cikar.jpg, -5-ram-tak.jpg, -6-belgele.jpg (assets/foto/). DOĞRULA: DDR4 çentiğinin milimetrik konumu modelde yaklaşık (derste ölçü verilmedi). |
| H11 | Atölye 2: Disk Sök–Tak, Toplama ve İlk Açılış | U | — | — | |
| H12 | Taşınabilir Cihazlar, Piller ve E-Atık | K | — | — | |
| H13 | Basit Sorun Giderme ve Bakım | K+U | — | — | |
| H14 | Proje: Bilgisayar Kimlik Kartı | U | K | K | 15 slayt. Uygulama provaları: sistem bilgisi ekranları (2D), tablo, port sayma (3D arka panel), uygunluk yorumu, kart hazırlama (3D kasa, A-VURGU), sunum; E-KIMLIK-KARTI (canlı kart + etiketli mini model + PNG indirme), uygunluk kararı, yükseltme önerisi (Derinleş). FOTO-GEREKLİ: DON-201-H14-1…6 (6). DOĞRULA: Türkçe Windows satır adları sadeleştirildi; uygunluk eşikleri basitleştirilmiş. |

## DON-301 – Bilgisayar Donanımı ve Sistem Kurulumu

| Hafta | Başlık | Tür | HTML | Plan | Not |
|---|---|---|---|---|---|
| H01 | Bilgisayar Mimarisine Giriş | K | K | K | Lise kalibrasyonu (Format K). 15 slayt; terim kartı slaytı, 3D yok (müfredatta sahne3d yok): katman diyagramı, Von Neumann şeması, bellek tablosu simülasyonu, yol animasyonu (OKU/YAZ), önek karşılaştırıcı, 931 GiB hesabı, kapasite dönüştürücü, karşılaştırma oyunu. |
| H02 | İşlemci | K | — | — | |
| H03 | Bellek Hiyerarşisi ve RAM | K | K | K | 15 slayt. 3D: DDR4/DDR5 çentik karşılaştırması + yuvaya deneme, DIMM ve SO-DIMM; 2D: hiyerarşi ve insan ölçeği, DRAM tazeleme/uçuculuk, MT/s ve CL, tek/çift kanal. FOTO-GEREKLİ: DON-301-H03-ddr4-ddr5.jpg. DOĞRULA: DDR5 DIMM ve SO-DIMM çentik konumları ikincil kaynaktan (derste mm verilmiyor); M-RAM çentiği 5,1 mm (kaynak 5,575 mm diyor). |
| H04 | Depolama | K | — | — | |
| H05 | Anakart | K | — | — | |
| H06 | Güç Kaynağı ve Soğutma | K | — | — | |
| H07 | Ekran Kartı ve Bağlantı Standartları | K | — | — | |
| H08 | Uyumluluk ve Sistem Toplama | K+U | — | — | |
| H09 | Montaj 1: Tezgâhta | U | — | — | |
| H10 | Montaj 2: Kasada ve İlk POST | U | — | — | |
| H11 | BIOS/UEFI ve Önyükleme | K+U | K | K | 15 slayt, 2D: önyükleme zinciri, POST hata ışıkları (A-BOOT, derse özel), UEFI ana ekranı, önyükleme sırası, XMP/EXPO, Secure Boot/TPM, E-UEFI simülatörü, UEFI keşif kartı. FOTO-GEREKLİ: DON-301-H11-uefi-ana-ekran.jpg, DON-301-H11-uefi-onyukleme.jpg. DOĞRULA: bip kodu ve hata ışığı sırası anlatımı genel (kılavuza yönlendiriliyor); örnek DDR5 değerleri temsilî. |
| H12 | İşletim Sistemi Kurulumu | U | K | K | 16 slayt (ek: Hazırlık ve Güvenlik), 2D uygulama provaları: önyüklenebilir USB, GPT/MBR, bölümleme, kurulum, Aygıt Yöneticisi, güncellemeler; E-KURULUM simülatörü, kurulum kararları. FOTO-GEREKLİ: DON-301-H12-1-usb.jpg … -6-guncel.jpg (6). DOĞRULA: BIOS-only anakart + GPT genellemesi "çoğu" ile sınırlandı. |
| H13 | Sorun Giderme, Bakım ve Veri Güvenliği | K+U | — | — | |
| H14 | Proje: Sistem Önerisi ve Montaj Raporu | U | — | — | |
