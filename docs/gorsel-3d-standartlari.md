# Görsel ve 3D Standartları (DON3D)

Donanım dersleri, özellikle **DON-201 (ortaokul)**, görsel olarak zengin olmak zorundadır: öğrenci parçayı döndürür, içini görür, yerine takar, çalışırken izler. Metinle anlatılıp görselle desteklenen değil, **görselle öğretilip metinle özetlenen** dersler hedeflenir.

## 1. Kademe bazında zorunlu minimumlar

| | DON-201 (ortaokul) | DON-301 (lise) |
|---|---|---|
| Etkileşimli 3D sahne | **Her derste en az 1** (JSON `sahne3d`) | JSON'da `sahne3d` olan haftalarda |
| Animasyon | **6 adımın her birinde** animasyon ya da canlı sahne illüstrasyonu; JSON'daki animasyonların tümü | JSON'daki animasyonların tümü |
| Yalnız metin slaytı | **Yasak** (kapak, hedefler ve quiz hariç her slaytta görsel) | Kavram başına en az 1 görsel |
| Gerçek fotoğraf | JSON `foto` listesindekiler; U haftalarında her yapım adımı | Aynı |
| Ton | Canlı, yaş-nötr, "oyuncak gibi" değil "gerçek ama anlaşılır" | Teknik, temiz, etiketli |

3D, gerçek fotoğrafın **yerine geçmez**. Parçayı tanıtmak için gerçek fotoğraf, nasıl çalıştığını ve nasıl takıldığını göstermek için 3D ve animasyon kullanılır. Fotoğraf yoksa `data-foto-gerekli="açıklama"` yer tutucusu konur ve `DURUM.md` Not sütununa `FOTO-GEREKLİ:` yazılır.

## 2. Teknoloji

- **Three.js, UMD derlemesi:** `three@0.158.0` sürümündeki `build/three.min.js`. UMD derlemesi r160'ta kaldırıldığı için bu sürüme sabitlenir. `scripts/kurulum.sh` dosyanın varlığını doğrular.
- **Tek dosya kuralı:** three.min.js ve `bilesenler/DON3D/don3d.js`, derleme sırasında HTML'e **satır içi** gömülür. CDN kullanılmaz. Hedef ders boyutu ≤ 1,5 MB.
- **Modeller prosedüreldir:** Three.js geometrileriyle (Box, Cylinder, Extrude, Shape) kodda üretilir. GLB/GLTF dosyası, harici doku ve lisanslı model kullanılmaz.
- **Dokular:** Gerekirse ≤ 512 px canvas ile üretilir (PCB deseni, etiket). Canvas `fillText` içinde emoji yasaktır.
- **Model adları:** Marka ve logo içermez. Etiketlerde "8 GB DDR4" gibi jenerik değerler kullanılır.

## 3. DON3D motoru (bir kez yazılır, tüm derslerde kullanılır)

`bilesenler/DON3D/` altında `/3d-motor-uret` komutuyla üretilir ve demo sayfasıyla onaylanır. **Motor onaylanmadan hiçbir DON-201 dersi üretilmez.**

### Dosyalar

```
bilesenler/DON3D/
  don3d.js           motor çekirdeği + etkileşim + animasyon kalıpları
  modeller/*.js      her M-* modeli için üretici fonksiyon (katalogdaki kodla aynı adda)
  don3d.css          etiket, bilgi kartı, kontrol düğmeleri, yedek görsel
  demo.html          MASTER üzerinde tüm modeller ve kalıpların vitrin sayfası
  README.md          API ve gömme talimatı
```

### Temel API (uyulması zorunlu imzalar)

```js
DON3D.baslat({ kalite: 'otomatik' })           // tek WebGLRenderer oluşturur
DON3D.sahne(kapsayiciEl, { modeller: ['M-RAM'], kamera: {...}, arkaPlan: 'gradyan' }) -> sahne
DON3D.model('M-RAM') -> THREE.Group            // alt parçalar name + userData {etiket, bilgi}
sahne.etkinlestir() / sahne.duraklat()          // slayt aktif/pasif olunca MASTER olayına bağlanır
sahne.yokEt()

// Etkileşimler (E-*)
DON3D.dondur(sahne, { sinir, sifirlaDugmesi: true })              // E-DONDUR
DON3D.bilgi(sahne, parcaAdlari, { kart: true })                   // E-BILGI
DON3D.tak(sahne, parca, hedef, { dogruYon, tolerans, onDogru, onYanlis }) // E-TAK
DON3D.av(sahne, soruListesi, { onBitti })                         // E-AV

// Animasyon kalıpları (A-*) — hepsi Promise döner, zincirlenebilir
DON3D.vurgula(parca, { renk, etiket })            // A-VURGU
DON3D.patlat(grup, { oran, sure })                // A-PATLAT (ve geri)
DON3D.kameraTur(sahne, duraklar)                  // A-KAMERA-TUR (adım başına bir durak)
DON3D.akis(sahne, yol, { parcacik, renk, hiz })   // A-AKIS
DON3D.dondurParca(parca, { eksen, hiz })          // A-DONUS
DON3D.isi(parca, deger0_1)                        // A-ISI (mavi → kırmızı)
DON3D.hava(sahne, { giris, cikis, yogunluk })     // A-HAVA
```

2D animasyonlar (A-KIVILCIM, A-BORU, A-HESAP, A-SAYAC gibi) SVG/CSS/canvas ile `DON3D.anim2d` altında yazılır. Tümü aynı zamanlama ve yavaşlatma eğrilerini kullanır.

### Zorunlu teknik kurallar

1. **Tek WebGLRenderer:** Tarayıcılar WebGL bağlam sayısını sınırlar. Motor tek renderer oluşturur ve canvas'ı aktif slayta taşır. Derste `new THREE.WebGLRenderer` en fazla **1 kez** geçer (`validate.py` denetler).
2. **Yaşam döngüsü:** Yalnızca aktif slaytın sahnesi render edilir. Slayt pasifken ya da sekme gizliyken (`visibilitychange`) `requestAnimationFrame` durur.
3. **Performans bütçesi** (okul bilgisayarı / tümleşik GPU hedefi):
   - Sahne başına ≤ 60 bin üçgen
   - `pixelRatio = min(devicePixelRatio, 1.5)`
   - Gölge en fazla 1 ışıkta, 1024 px
   - Hedef ≥ 30 fps
   - `kalite: 'otomatik'`: fps < 24 olursa gölge ve antialias kapanır
4. **Yedek görsel:** WebGL yoksa ya da bağlam kaybolursa (`webglcontextlost`), sahne kapsayıcısındaki `data-yedek` içeriği (SVG ya da görsel + açıklama) gösterilir. Ders asla boş alan bırakmaz.
5. **Hareket azaltma:** `prefers-reduced-motion: reduce` durumunda otomatik dönüş kapanır, animasyonlar "Adım adım" düğmesiyle ilerler, parçacık yoğunluğu azalır.
6. **Etiketler HTML katmanıdır:** Etiketler 3D konumdan ekrana izdüşümle yerleştirilen HTML öğeleridir; canvas içine metin yazılmaz. Bu, keskin görüntü, erişilebilirlik ve emoji kuralı için gereklidir.
7. **Erişilebilirlik:**
   - Tüm 3D kontroller klavyeyle de kullanılabilir (oklar: döndür, +/−: yakınlaştır, R: sıfırla, Tab: parçalar arasında gezin).
   - Renk tek başına bilgi taşımaz: doğru/yanlış için simge + metin, portlar için renk + etiket.
8. **Taşma:** 3D kapsayıcı slayt düzeninde sabit oranlıdır (`aspect-ratio`, `max-height: clamp(...)`). `scroll_test.js`, 7 görünüm alanında sıfır taşma bekler.
9. **Bellek:** Slayttan çıkıldığında geometri ve materyaller yeniden kullanılır; ders sonunda `yokEt()` ile `dispose` edilir.

## 4. Görsel dil

- **Aydınlatma:** Yumuşak stüdyo ışığı (1 ana yönlü ışık + hemisfer ışık). `MeshStandardMaterial`; metal parçalarda `metalness 0.6–0.9`, PCB'de mat.
- **Arka plan:** MASTER kademe rengine uygun yumuşak gradyan. Zemin gölgesi (contact shadow benzeri) parçayı "masaya" oturtur.
- **Gerçekçi renkler:** PCB yeşil/siyah, altın temaslar, alüminyum soğutucu, siyah plastik. Oyuncak görünümü (aşırı parlak, bebeksi oranlar) kullanılmaz.
- **Vurgu rengi:** MASTER vurgu rengi; parlama + dış hat + HTML etiket üçlüsü.
- **Kamera:** Açılışta 3/4 perspektif; otomatik dönüş yavaş (≈ 8 sn/tur) ve kullanıcı dokununca durur.
- **Hareket:** Animasyonlar 0,4–1,2 sn; `easeInOutCubic`. Aynı anda en fazla bir ana animasyon ve bir arka plan hareketi.
- **Karakter (ortaokul):** 2D sahnelerde 12–13 yaş görünümlü, yaş-nötr öğrenci karakterleri kullanılır; 3D sahnelerde karakter yoktur (el/parmak izi yeterli).

## 5. Ders içi yerleşim (DON-201)

| Slayt | Görsel |
|---|---|
| Kapak | O haftanın ana 3D modeli yavaşça döner |
| Hedefler | Kazanım başına küçük ikon (programatik) |
| Adım 1–6 | Her adımda JSON'daki animasyon/sahne; adım metni ≤ 3 kısa cümle |
| Etkinlik | JSON `etkilesim` (3D ya da 2D) |
| Derinleş | Aynı sahnenin "ileri" görünümü (ör. RAM etiketi okuma yakınlaştırması) |
| Quiz | En az 1 soru görselli (ör. "Bu parça hangisi?" 3D küçük sahne ya da fotoğraf) |
| Özet | 6 adımın küçük resimli tekrarı |

U (uygulama) haftalarında her yapım adımı **iki panellidir**: solda 3D prova (oynat/tekrarla), sağda gerçek fotoğraf ve kısa talimat.

## 6. Güvenlik görselleri

- Güç kaynağının içi, pilin içi ve tüplü monitörün içi **hiçbir görselde açık gösterilmez**.
- Tehlikeli nesnelerde A-UYARI kalıbı kullanılır.
- Atölye adımlarında fiş çekili durum her görselde görünür (priz simgesi üzeri çizili).
