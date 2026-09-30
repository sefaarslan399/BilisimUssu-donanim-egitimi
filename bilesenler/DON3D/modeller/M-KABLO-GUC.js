/* M-KABLO-GUC — güç kaynağı konnektörleri (kablo uçları): 24-pin ATX (20+4), 8-pin EPS (4+4, işlemci),
   6+2 pin PCIe (ekran kartı), SATA güç (15 pin, L ağızlı). Molex yok. Marka/logo yok.
   Ölçü birimi: cm. Mini-Fit tipi konnektörlerde pin aralığı 0,42 cm (4,2 mm); gövde 2 sıra pin.
     24-pin ≈ 5,2 × 1,0 × 1,5 · EPS ≈ 1,8 × 1,0 × 1,5 · PCIe ≈ 1,8 × 1,0 × 1,5 · SATA ≈ 2,2 × 0,6 × 1,1
   ops.tur: 'atx24' | 'eps' | 'pcie' | 'sata' → TEK konnektör; verilmezse dördü yan yana (uçlar yukarı, kilitler öne/+Z).
   ops.kablo: 'renkli' (varsayılan; standart tel renkleri) | 'orgulu' (siyah örgülü teller)
   ops.kabloUzun: kablonun aşağı sarkan boyu (cm, varsayılan 5)
   TEK KONNEKTÖR YÖNÜ (M-KABLO-UCLARI ile aynı mantık; D.fisTak / D.fisKonumla doğrudan kullanılabilir):
     Orijin = fişin UCU (pin kulelerinin ön yüzünün ortası, yuvaya ilk giren nokta). Fiş −Z yönünde girer;
     gövde +Z'de, teller +Z'den çıkıp −Y'ye (aşağı) kıvrılır. Uzun kenar X, pin sıraları Y'dedir.
     Kilit tırnağı +Y yüzündedir → anakarttaki başlığın kilit çıkıntısı port grubunun yerel +Y tarafında olmalı
     (port grubu: ağız yerel (0,0,0), dışarı yönü yerel +Z; bkz. don3d-anim.js A-FIS).
     userData.giris = 1.0 (Mini-Fit) / 0.55 (SATA): başlığa giren boy (cm).
   Pin/tel düzeni (yaklaşık, standart renkler; renk tek başına bilgi taşımaz, derste yazıyla verilir):
     24-pin: kilit tarafı sıra (+Y) pin 13–24: turuncu, mavi(−12 V), siyah, YEŞİL(PS_ON), siyah, siyah, siyah, boş, kırmızı ×3, siyah;
             karşı sıra (−Y) pin 1–12: turuncu ×2, siyah, kırmızı, siyah, kırmızı, siyah, gri(PWR_OK), mor(+5 VSB), sarı ×2, turuncu.
             Ayrılabilir +4 parça (pin 11, 12, 23, 24) +X ucundadır; kilit 20 pinlik bölümün ortasındadır.
     EPS 8-pin: kilit tarafı sıra 4 × sarı (+12 V), karşı sıra 4 × siyah (toprak); kilit ilk 4'lü yarının (−X) ortasında.
     PCIe 6+2: +12 V (3 sarı) kilidin KARŞI sırasında, kilit tarafı siyah; +2 parça +X ucunda; kilit 6'lı bölümün ortasında.
       (EPS ile PCIe'de +12 V sırası kilide göre ters yerdedir, pin kuleleri de farklı biçimlidir: birbirine zorlanmaz.)
     SATA: 15 temas, L biçimli ağız; 5 tel: turuncu (+3,3 V), siyah, kırmızı (+5 V), siyah, sarı (+12 V). Kilit yok (sürtünmeyle tutar).
   Parçalar (K.parca → E-BILGI / A-VURGU): 'kon-atx24', 'kon-eps', 'kon-pcie', 'kon-sata'; her birinde '<ad>-kilit' (kilit tırnağı,
     SATA hariç) ve 'kon-*-ek' (+4 / 4+4 ikinci yarı / +2 ayrılabilir parça, SATA hariç).
   userData (her konnektör): tur, giris, pin (pin sayısı), kilit (Object3D | null), ek (Object3D | null), teller (Group),
     ayir(oran, sure) → Promise: ayrılabilir parçayı oran (0 birleşik – 1 ayrık) kadar +X'e kaydırır (sure 0: anında).
   userData (hepsi): konnektorler { atx24, eps, pcie, sata }, ayir(oran, sure) → hepsine uygular.
   Kullanım: DON-301 H06 (güç kabloları), DON-301 H10 (kasa montajı: E-TAK / A-FIS ile anakarta takma). */
(function (D) {
  'use strict';
  var P = 0.42;             // pin aralığı (Mini-Fit, 4,2 mm)
  var KULE = 0.3;           // pin kulelerinin boyu (ön uç)
  var GOVDE = 1.2;          // gövde boyu (kulelerden sonra)
  var RENK = { Y: '#f2c230', R: '#d63a2f', O: '#ef8a22', B: '#1c1d21', G: '#2f9e50', P: '#7b4db5', GR: '#a0a5ab', BL: '#2e6fd8' };
  var BILGI = {
    atx24: ['24-pin ATX güç (20+4)', 'Anakartı besler: +3,3 V, +5 V, +12 V ve bekleme (+5 VSB) hatları. Kilit tırnağı başlığa tık diye oturur.'],
    eps: ['8-pin EPS (4+4) · işlemci', 'İşlemciye +12 V taşır: 4 sarı (+12 V) ve 4 siyah (toprak) tel. Ekran kartı girişine takılmaz.'],
    pcie: ['6+2 pin PCIe · ekran kartı', 'Ekran kartına +12 V taşır: 6-pin ≈ 75 W, 8-pin ≈ 150 W (yuvadan ek 75 W).'],
    sata: ['SATA güç (15 pin)', 'L biçimli ağız; diske +3,3 V, +5 V ve +12 V taşır. Tek yönde girer.']
  };
  D.KABLO_GUC_BILGI = BILGI;

  function tel(K, noktalar, r, renk) {
    var THREE = K.THREE;
    var egri = new THREE.CatmullRomCurve3(noktalar, false, 'centripetal');
    var m = new THREE.Mesh(new THREE.TubeGeometry(egri, 16, r, 6, false), K.mat(renk, { roughness: 0.48 }));
    m.userData.secilmez = true;
    return m;
  }

  // D biçimli pin kulesi (iki köşesi yuvarlatılmış) — ekstrüzyon, +Z yönünde KULE boyunda
  function kuleGeo(K, d) {
    var THREE = K.THREE;
    return K.geoPaylas('kg-kule-' + d, function () {
      var a = 0.17, r = 0.12, sh = new THREE.Shape();
      if (d) {
        sh.moveTo(-a, -a); sh.lineTo(a, -a); sh.lineTo(a, a - r);
        sh.quadraticCurveTo(a, a, a - r, a); sh.lineTo(-a + r, a); sh.quadraticCurveTo(-a, a, -a, a - r); sh.lineTo(-a, -a);
      } else {
        sh.moveTo(-a, -a); sh.lineTo(a, -a); sh.lineTo(a, a); sh.lineTo(-a, a); sh.lineTo(-a, -a);
      }
      var g = new THREE.ExtrudeGeometry(sh, { depth: KULE, bevelEnabled: false, curveSegments: 3 });
      return g;
    });
  }

  /** Mini-Fit tipi konnektör. dz: [{ sutun, satir(0: −Y, 1: +Y kilit tarafı), renk (null = boş), d (D biçimli kule) }]
      bolum: ayrılabilir parçanın başladığı sütun (null yoksa); kilitSutun: kilit merkezinin sütun konumu (ondalıklı) */
  function miniFit(K, ad, sutunSayi, pinler, bolum, kilitSutun, ops) {
    var THREE = K.THREE, g = new THREE.Group();
    K.parca(g, 'kon-' + ad, BILGI[ad][0], BILGI[ad][1]);
    var govdeMat = K.mat('#1a1b1f', { roughness: 0.62 });
    var W = sutunSayi * P, H = 2 * P;
    function sx(c) { return -W / 2 + P / 2 + c * P; }
    function sy(r) { return r ? P / 2 : -P / 2; }
    var ana = new THREE.Group(), ek = null;
    g.add(ana);
    if (bolum != null) {
      ek = new THREE.Group();
      K.parca(ek, 'kon-' + ad + '-ek', ad === 'atx24' ? '+4 parça' : (ad === 'eps' ? 'İkinci 4’lü yarı' : '+2 parça'),
        ad === 'atx24' ? '20 pinlik eski anakartlarda ayrılır; 24 pinlik girişte takılı kalır.' :
          (ad === 'eps' ? '4 pinlik girişli eski anakartlarda ayrılır.' : '6-pin girişli kartlarda ayrılır; 8-pin girişte birlikte takılır.'));
      g.add(ek);
    }
    // Gövde blokları (ana ve ek ayrı; aralarında ince ayrım çizgisi)
    function blok(ebeveyn, c0, c1) {
      var w = (c1 - c0) * P - 0.03, x = sx(c0) - P / 2 + (c1 - c0) * P / 2;
      K.koy(ebeveyn, K.kutu(w + 0.08, H + 0.12, GOVDE, govdeMat, 0.05, 1), x, 0, KULE + GOVDE / 2);
      // arka yüzdeki kademeli çıkıntı (tel girişleri)
      K.koy(ebeveyn, K.kutu(w + 0.02, H + 0.02, 0.12, K.mat('#232428', { roughness: 0.7 }), 0.03, 1), x, 0, KULE + GOVDE + 0.05);
    }
    var ayrim = bolum == null ? sutunSayi : bolum;
    blok(ana, 0, ayrim);
    if (ek) blok(ek, ayrim, sutunSayi);
    // Pin kuleleri (ön uç) + terminal delikleri
    var delikMat = K.mat('#050506', { roughness: 0.9 }), metal = K.mat('altin');
    pinler.forEach(function (p) {
      var hedef = (ek && p.sutun >= ayrim) ? ek : ana;
      var k = new THREE.Mesh(kuleGeo(K, p.d), govdeMat);
      if (p.satir === 0) k.rotation.z = Math.PI;      // D kulelerin yuvarlak kenarı dışa bakar
      K.koy(hedef, k, sx(p.sutun), sy(p.satir), 0);
      var dl = K.duzlem(0.17, 0.17, delikMat);
      dl.rotation.y = Math.PI;
      K.koy(hedef, dl, sx(p.sutun), sy(p.satir), -0.004);
      if (p.renk) {
        var t = K.kutu(0.07, 0.07, 0.02, metal);
        K.koy(hedef, t, sx(p.sutun), sy(p.satir), -0.012);
      }
    });
    // Kilit tırnağı (+Y yüzünde): ortadan destekli kol, önde tutma penceresi, arkada basma ucu
    var kilit = new THREE.Group();
    K.parca(kilit, 'kon-' + ad + '-kilit', 'Kilit tırnağı', 'Başlıktaki çıkıntıya takılır. Çıkarırken arka ucuna basılır, sonra düz çekilir.');
    var yuz = H / 2 + 0.06;
    K.koy(kilit, K.kutu(0.5, 0.1, 1.05, govdeMat, 0.03, 1), 0, yuz + 0.17, 0.62);            // kol
    K.koy(kilit, K.kutu(0.26, 0.16, 0.2, govdeMat, 0.02, 1), 0, yuz + 0.07, 0.7);            // destek (dayanak)
    K.koy(kilit, K.kutu(0.5, 0.1, 0.08, govdeMat, 0.02, 1), 0, yuz + 0.08, 0.14);            // ön kanca (pencere alt kenarı)
    K.koy(kilit, K.kutu(0.08, 0.14, 0.26, govdeMat, 0.02, 1), -0.21, yuz + 0.1, 0.26);
    K.koy(kilit, K.kutu(0.08, 0.14, 0.26, govdeMat, 0.02, 1), 0.21, yuz + 0.1, 0.26);
    for (var i = 0; i < 3; i++) K.koy(kilit, K.kutu(0.46, 0.04, 0.04, govdeMat), 0, yuz + 0.24, 0.95 + i * 0.09);  // basma ucu tırtılları
    K.koy(kilit, K.kutu(0.5, 0.12, 0.2, govdeMat, 0.03, 1), 0, yuz + 0.22, 1.12);             // basma ucu
    kilit.position.x = sx(0) - P / 2 + kilitSutun * P;
    ana.add(kilit);
    // Teller
    var teller = new THREE.Group();
    teller.userData.secilmez = true;
    var uz = ops.kabloUzun || 5, orgu = ops.kablo === 'orgulu', r = 0.105;
    var zA = KULE + GOVDE + 0.08;
    pinler.forEach(function (p) {
      if (!p.renk) return;
      var x = sx(p.sutun), y = sy(p.satir);
      var yol = [new THREE.Vector3(x, y, zA), new THREE.Vector3(x, y, zA + 1.2),
        new THREE.Vector3(x * 0.72, y * 0.8 - 0.2, zA + 2.5), new THREE.Vector3(x * 0.6, -1.3 + y * 0.5, zA + 3.4),
        new THREE.Vector3(x * 0.58, -uz, zA + 3.75 + y * 0.4)];
      var m = tel(K, yol, r, orgu ? '#18191c' : RENK[p.renk]);
      ((ek && p.sutun >= ayrim) ? ek : teller).add(m);
    });
    ana.add(teller);
    g.userData.tur = ad;
    g.userData.giris = 1.0;
    g.userData.pin = pinler.length;
    g.userData.kilit = kilit;
    g.userData.ek = ek;
    g.userData.teller = teller;
    g.userData.ayir = function (oran, sure) {
      if (!ek) return Promise.resolve();
      var x1 = 0.9 * oran, y1 = 0, x0 = ek.position.x, y0 = ek.position.y;
      if (!sure) { ek.position.set(x1, y1, 0); return Promise.resolve(); }
      return D.tween({ sahne: D.sahneBul(g), sure: sure, anahtar: 'ayir', hedef: ek, guncelle: function (e) {
        ek.position.x = x0 + (x1 - x0) * e; ek.position.y = y0 + (y1 - y0) * e;
      } });
    };
    return g;
  }

  function atx24(K, ops) {
    // sütun 0–11; satır 1 (+Y, kilit tarafı) = pin 13–24, satır 0 (−Y) = pin 1–12
    var alt = ['O', 'O', 'B', 'R', 'B', 'R', 'B', 'GR', 'P', 'Y', 'Y', 'O'];
    var ust = ['O', 'BL', 'B', 'G', 'B', 'B', 'B', null, 'R', 'R', 'R', 'B'];
    var p = [];
    for (var c = 0; c < 12; c++) {
      p.push({ sutun: c, satir: 0, renk: alt[c], d: (c % 3) !== 1 });
      p.push({ sutun: c, satir: 1, renk: ust[c], d: (c % 3) === 1 });
    }
    return miniFit(K, 'atx24', 12, p, 10, 5, ops);
  }
  function eps(K, ops) {
    var p = [];
    for (var c = 0; c < 4; c++) {
      p.push({ sutun: c, satir: 1, renk: 'Y', d: c % 2 === 0 });
      p.push({ sutun: c, satir: 0, renk: 'B', d: c % 2 === 1 });
    }
    return miniFit(K, 'eps', 4, p, 2, 1, ops);
  }
  function pcie(K, ops) {
    var p = [];
    for (var c = 0; c < 4; c++) {
      p.push({ sutun: c, satir: 0, renk: c < 3 ? 'Y' : 'B', d: c === 1 });
      p.push({ sutun: c, satir: 1, renk: 'B', d: c !== 1 });
    }
    return miniFit(K, 'pcie', 4, p, 3, 1.5, ops);
  }

  function sata(K, ops) {
    var THREE = K.THREE, g = new THREE.Group();
    K.parca(g, 'kon-sata', BILGI.sata[0], BILGI.sata[1]);
    var W = 2.2, H = 0.6, L = 1.1;
    var govdeMat = K.mat('#1a1b1f', { roughness: 0.6 });
    K.koy(g, K.kutu(W, H, L, govdeMat, 0.06, 1), 0, 0, L / 2);
    // Ön yüz: L biçimli ağız (uzun yarık + bir uçta kısa dik kol) ve 15 temas
    var doku = K.canvasDoku(512, 140, function (ctx, w, h) {
      ctx.fillStyle = '#1a1b1f'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#050506';
      ctx.fillRect(40, 56, 440, 34);            // uzun yarık
      ctx.fillRect(440, 30, 40, 80);            // L'nin kısa kolu
      ctx.fillStyle = '#d6a24a';
      for (var i = 0; i < 15; i++) ctx.fillRect(58 + i * 25.6, i === 10 ? 64 : 60, 9, i === 10 ? 20 : 26);
    });
    var yuz = K.duzlem(W - 0.08, H - 0.08, new THREE.MeshStandardMaterial({ map: doku, roughness: 0.6 }));
    yuz.rotation.y = Math.PI;
    K.koy(g, yuz, 0, 0, -0.003);
    // üstte kavrama çizgileri
    for (var j = 0; j < 4; j++) K.koy(g, K.kutu(W - 0.5, 0.03, 0.05, govdeMat), 0, H / 2 + 0.01, 0.55 + j * 0.12);
    var teller = new THREE.Group();
    var renk = ['O', 'B', 'R', 'B', 'Y'], uz = ops.kabloUzun || 5, orgu = ops.kablo === 'orgulu';
    renk.forEach(function (rk, i) {
      var x = -0.8 + i * 0.4;
      teller.add(tel(K, [new THREE.Vector3(x, 0, L), new THREE.Vector3(x, 0, L + 1.2), new THREE.Vector3(x * 0.7, -0.3, L + 2.4),
        new THREE.Vector3(x * 0.6, -1.3, L + 3.2), new THREE.Vector3(x * 0.6, -uz, L + 3.5)], 0.1, orgu ? '#18191c' : RENK[rk]));
    });
    g.add(teller);
    g.userData.tur = 'sata';
    g.userData.giris = 0.55;
    g.userData.pin = 15;
    g.userData.kilit = null;
    g.userData.ek = null;
    g.userData.teller = teller;
    g.userData.ayir = function () { return Promise.resolve(); };
    return g;
  }

  var URET = { atx24: atx24, eps: eps, pcie: pcie, sata: sata };

  D.modelTanimla('M-KABLO-GUC', function (K, ops) {
    ops = ops || {};
    if (ops.tur) return URET[ops.tur](K, ops);
    var THREE = K.THREE, g = new THREE.Group();
    K.parca(g, 'M-KABLO-GUC', 'Güç kabloları', 'Güç kaynağından anakarta, işlemciye, ekran kartına ve disklere giden konnektörler.');
    var kon = {}, X = { atx24: -4.6, eps: -0.2, pcie: 2.8, sata: 5.9 };
    ['atx24', 'eps', 'pcie', 'sata'].forEach(function (t) {
      var k = URET[t](K, { kablo: ops.kablo, kabloUzun: ops.kabloUzun || 3.2 });
      k.rotation.x = Math.PI / 2;     // uçlar yukarı, kilit tırnakları öne (+Z)
      K.koy(g, k, X[t], 7.4, 0);
      kon[t] = k;
    });
    g.userData.konnektorler = kon;
    g.userData.ayir = function (oran, sure) {
      return Promise.all(Object.keys(kon).map(function (t) { return kon[t].userData.ayir(oran, sure); }));
    };
    return g;
  });
})(window.DON3D);
