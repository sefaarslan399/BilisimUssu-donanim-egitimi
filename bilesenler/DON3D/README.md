# DON3D — Donanım 3D Motoru

Three.js r158 UMD (`node_modules/three/build/three.min.js`) üzerinde çalışan, derse **satır içi** gömülen 3D motoru.
Spesifikasyon: `docs/gorsel-3d-standartlari.md` §3 · Kodlar: `docs/gorsel-katalog.md`.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `don3d.js` | Çekirdek: tek `WebGLRenderer`, sahne yaşam döngüsü, otomatik kalite, yedek görsel, hareket azaltma, HTML etiket katmanı, klavye, tween, **kit** (malzeme/geometri/doku) |
| `don3d-anim.js` | Animasyon kalıpları (A-*) |
| `don3d-etkilesim.js` | Etkileşim kalıpları (E-*) |
| `don3d.css` | Etiket, bilgi kartı, düğmeler, yedek görsel, sınıflama |
| `modeller/M-*.js` | Her model için prosedürel üretici (`DON3D.modelTanimla`) |

Derleyici (`scripts/derle.py`) üç motor dosyasını ve dersin `ders.json → modeller` listesindeki modelleri
`<script data-kutuphane="don3d">` içine gömer. Model dosyasının ilk satırlarında `bagimli: M-A, M-B` yazıyorsa bağımlılıklar da eklenir.

## Yazılanlar (H01 kalibrasyonu)

- **Modeller:** M-MASAUSTU, M-MONITOR, M-KLAVYE (Türkçe Q), M-FARE
- **Animasyonlar:** A-VURGU (`vurgula`, `vurguKaldir`, `siraylaVurgula`), A-KATMAN (`katman`), A-AKIS (`akis`), A-DONUS (`dondurParca`); yardımcılar `bas`, `yanipSon`
- **Etkileşimler:** E-DONDUR (`dondur`), E-BILGI (`bilgi`), E-SINIFLA (`sinifla`)

Diğer katalog kodları kullanıldıkları haftada eklenir (`/model-uret`).

## API

```js
DON3D.baslat({ kalite: 'otomatik' })                 // 'otomatik' | 'yuksek' | 'dusuk'
var s = DON3D.sahne(kapEl, { modeller: ['M-RAM'], kamera: { yon: [x,y,z], pay, fov }, arkaPlan: 'gradyan' | 'seffaf',
                             otomatikDonus: true, turSuresi: 8, etiket: 'erişilebilir ad' })
DON3D.tembel(kapEl, function (kap) { ... })          // sahneyi slayt ilk açıldığında kurar
DON3D.model('M-RAM') -> THREE.Group                  // alt parçalar name + userData {etiket, bilgi}
s.ekle(kod, { konum, donus, olcek }); s.yerlestir(); s.parca(ad); s.etiket(nesne, metin, { tur, yer, ofset })
s.kameraGit({ theta, phi, yakinlik, hedef }, sure); s.sifirla(); s.dugme(metin, simge, fn, { yer, sinif })
s.etkinlestir() / s.duraklat() / s.yokEt()           // MASTER'da .slide.active değişimine kendiliğinden bağlanır

DON3D.dondur(s, { sinir, sifirlaDugmesi: true })     // E-DONDUR
DON3D.bilgi(s, ['M-KLAVYE'], { kart: true })         // E-BILGI
DON3D.sinifla(kapEl, { ogeler, kutular, onBitti })   // E-SINIFLA (sürükle, dokun-dokun, klavye)
DON3D.vurgula(parca, { renk, etiket })               // A-VURGU   (hepsi Promise)
DON3D.katman(s, ekranMesh, { katmanlar })            // A-KATMAN
DON3D.akis(s, yol, { renk, hiz, etiket })            // A-AKIS
DON3D.dondurParca(parca, { eksen, hiz })             // A-DONUS
DON3D.kucukResim('M-FARE', { w, h }) -> dataURL      // modelin küçük resmi (etkinlik kartları için)
```

## Kurallar (özet)

- Derste `new THREE.WebGLRenderer` bir kez geçer. Yalnız aktif slaytın sahnesi çizilir; sekme gizlenince döngü durur.
- `pixelRatio ≤ 1,5`, tek gölgeli ışık (1024 px), fps < 24 sürerse gölge ve antialias kapanır.
- WebGL yoksa ya da bağlam kaybolursa kapsayıcıdaki `[data-yedek]` içeriği gösterilir.
- `prefers-reduced-motion`: otomatik dönüş kapanır, süreler kısalır, derste "Adım adım" düğmesi çıkar.
- Etiketler HTML katmanıdır. Canvas'a yalnız yüzey dokusu çizilir (tuş yazısı, ekran görüntüsü); emoji yok.
- Klavye: oklar döndür, +/− yakınlaştır, R sıfırla, Tab parçalar arasında gez, Enter seç.

## Araçlar

- `node scripts/model_onizle.js [M-KOD ...]` → `build/model/<KOD>.png` + üçgen sayısı (sahne başına ≤ 60 bin)
- `python3 scripts/derle.py DON-201 1` → `icerik/DON-201/DON-201-H01.html`
