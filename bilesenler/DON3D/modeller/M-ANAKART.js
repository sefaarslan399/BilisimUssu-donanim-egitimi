/* M-ANAKART — ATX anakart (30,5 × 24,4 cm), masada yatay yatar; bileşenler +Y yönündedir.
   bagimli: M-RAM-YUVASI, M-ARKA-PANEL
   Ölçü birimi: cm (gerçek oranlar). Orijin: kartın alt yüzünün ortası; PCB kalınlığı 0,16 (üst yüz y = 0,16).
   Yön: X = 24,4 cm genişlik (arka kenar −X: arka panel portları −X'e bakar; ön kenar +X: 24-pin, SATA),
        Z = 30,5 cm boy (üst kenar −Z: işlemci soketi, 8-pin EPS; alt kenar +Z: ön panel başlıkları).
   Adlandırılmış parçalar (K.parca → E-BILGI, E-AV, A-VURGU):
     soket (alt parçalar: soket-kapak, soket-ucgen, soket-kol, soket-plaka, soket-pimler)
     ram-yuvalari (ram-yuvasi-1…4; 1 = sokete en yakın; her biri M-RAM-YUVASI, mandallı)
     pcie-x16-1, pcie-x1-1, pcie-x16-2, pcie-x1-2 · m2-1, m2-2 (m2-N-vida: vida ayağı)
     cipset (soğutucusuyla) · vrm (VRM soğutucuları) · atx24 · eps8 · sata (sata-1…4)
     on-panel (ön panel, ön USB 2 ve ses başlıkları) · usb-baslik (ön USB 3) · fan-baslik · cmos-pili
     arka-panel (G/Ç örtüsü + port-*: D.portYap ile USB-A, USB 3, USB-C, HDMI, DP, RJ45, ses)
   Bakır yollar, baskı yazıları ve vida delikleri PCB üstündeki canvas dokusudur (marka/logo yok).
   userData:
     olcu {W, L, T} · parcalar: ana parça adları (E-BILGI / E-AV süzgeci için)
     yuvalar: RAM yuvası grupları (M-RAM-YUVASI API: oturma, mandal(acik, sure)); RAM yuva içine eklenir: yuva.add(ram)
     pcie: yuva grupları (userData.tur 'x16'|'x1', uzunluk, oturma: kartın dişlerinin oturduğu yerel nokta)
     m2: M.2 grupları (userData.oturma: konnektör ağzı (yerel), userData.vida: vida ayağı grubu, uzunluk 8 = 2280)
     portlar: arka panel portları (D.portYap) · soket: { grup, plaka, kol, kapak, ucgen, pimler }
     yollar: { ad: [Vector3 yerel] } · yol(ad) → dünya koordinatında Vector3 dizisi (DON3D.akis için)
       yol adları: soket-ram, soket-pcie, soket-m2, soket-cipset, cipset-sata, cipset-m2, cipset-pcie, cipset-usb, guc, atx
     soketAc(acik, sure) → Promise: kilit kolu kalkar, ardından yük plakası (koruma kapağıyla birlikte) açılır; tersi kapatır.
     kapakGoster(bool): koruma kapağını gösterir/gizler (işlemci takılı görünüm için).
   Çizim çağrısını azaltmak için adsız sabit mesh'ler malzemeye göre birleştirilir (DON3D.sabitBirlestir).
   ops.kapaksiz: true → koruma kapağı baştan gizli. */
(function (D) {
  'use strict';
  var W = 24.4, L = 30.5, T = 0.16;
  var PXCM = 512 / L;                         // doku: 1 cm = 16,8 piksel

  /* Yerleşim (kart koordinatı, cm): [x, z] merkezler */
  var P = {
    soket: [-3.3, -8.0],
    ramX: [2.3, 3.3, 4.3, 5.3], ramZ: -7.4,
    pcie: [['pcie-x16-1', 'x16', 0.9, true], ['pcie-x1-1', 'x1', 2.9], ['pcie-x16-2', 'x16', 7.0], ['pcie-x1-2', 'x1', 9.0]],
    pcieX0: -10.3,
    m2: [['m2-1', -2.2, 'M.2_1'], ['m2-2', 4.95, 'M.2_2']], m2X0: -8.6,
    cipset: [4.6, 7.4], atx: [10.6, -6.0], eps: [-6.3, -14.5], usb3: [10.7, 2.3], fan: [0.4, -14.3],
    sata: [11.55, [8.6, 10.6]], cmos: [-2.4, 12.0],
    fpanel: [8.6, 14.3], fusb: [5.4, 14.3], fses: [-9.6, 14.3],
    delikler: [[-11.55, -14.4], [-0.9, -14.4], [10.9, -14.4], [-11.55, -0.3], [-0.9, -0.3], [10.9, -0.3], [-11.55, 13.6], [-0.9, 13.6], [10.9, 13.6]]
  };

  var onbellek = {};
  function cx(x) { return (x + W / 2) * PXCM; }
  function cz(z) { return (z + L / 2) * PXCM; }

  /* ── PCB üst yüz dokusu: bakır yollar, via'lar, baskı yazıları, vida delikleri ── */
  function pcbDokusu(K) {
    if (onbellek.pcb) return onbellek.pcb;
    var doku = K.canvasDoku(Math.round(W * PXCM), 512, function (ctx, w, h) {
      ctx.fillStyle = '#1b2723'; ctx.fillRect(0, 0, w, h);
      // güç bölgeleri (hafif farklı ton)
      ctx.fillStyle = '#1f2d28';
      ctx.fillRect(cx(-9.2), cz(-15), cx(1.2) - cx(-9.2), cz(-10.8) - cz(-15));
      ctx.fillRect(cx(-9.2), cz(-10.8), cx(-6.2) - cx(-9.2), cz(-3.6) - cz(-10.8));
      var r = K.rng(5);
      function yol(noktalar, renk, kal) {
        ctx.strokeStyle = renk; ctx.lineWidth = kal; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.beginPath();
        noktalar.forEach(function (p, i) { if (i) ctx.lineTo(cx(p[0]), cz(p[1])); else ctx.moveTo(cx(p[0]), cz(p[1])); });
        ctx.stroke();
      }
      // demet: n paralel yol, ofset (dx, dz) adımıyla
      function demet(noktalar, n, dx, dz, renk, kal) {
        for (var i = 0; i < n; i++) {
          yol(noktalar.map(function (p) { return [p[0] + dx * i, p[1] + dz * i]; }), renk || '#2f4a40', kal || 1.3);
        }
      }
      var BAKIR = '#42685a', BAKIR2 = '#39594d';
      // soket → RAM (geniş veri yolu)
      demet([[-0.8, -10.4], [1.4, -10.4], [1.9, -10.9]], 16, 0, 0.4, BAKIR);
      demet([[-0.8, -10.2], [5.6, -10.2]], 1, 0, 0, BAKIR);
      for (var ri = 0; ri < 4; ri++) demet([[1.95 + ri, -13.6], [1.95 + ri, -1.2]], 2, 0.2, 0, BAKIR2, 1);
      // soket → PCIe x16 ve M.2_1
      demet([[-5.2, -5.0], [-5.2, -3.6], [-6.4, -2.4], [-6.4, 0.5]], 6, 0.3, 0, BAKIR);
      demet([[-3.4, -5.0], [-3.4, 0.5]], 7, 0.3, 0, BAKIR);
      // soket → çipset
      demet([[-1.0, -5.1], [1.1, -3.0], [1.1, 4.4], [2.2, 5.5]], 4, 0.25, 0, BAKIR);
      // çipset → SATA, M.2_2, PCIe, ön panel, arka panel
      demet([[6.9, 7.9], [9.2, 7.9], [10.2, 8.9], [11.0, 8.9]], 5, 0, 0.3, BAKIR);
      demet([[2.3, 5.6], [0.9, 4.3], [-0.6, 4.3]], 4, 0, 0.25, BAKIR);
      demet([[2.3, 8.2], [1.3, 9.4], [-1.4, 9.4]], 3, 0, 0.25, BAKIR);
      demet([[5.0, 9.7], [5.0, 13.6]], 3, 0.3, 0, BAKIR);
      demet([[6.9, 9.3], [8.2, 10.6], [8.2, 13.6]], 3, 0.3, 0, BAKIR);
      demet([[2.3, 9.8], [-8.3, 9.8], [-8.6, 9.5], [-8.6, -1.0], [-8.9, -1.3]], 3, 0, 0.25, BAKIR2);
      demet([[1.6, 12.0], [-1.2, 12.0]], 2, 0, 0.3, BAKIR2);
      demet([[-8.6, 11.0], [-10.8, 11.0], [-10.8, 13.4]], 3, 0, 0.3, BAKIR2);
      // 24-pin → kart
      demet([[10.2, -8.4], [8.2, -8.4], [7.2, -7.4], [7.2, -1.0]], 5, 0, 0.5, BAKIR2, 1.6);
      // rastgele kısa yollar (dolgu)
      for (var k = 0; k < 150; k++) {
        var x = -11 + r() * 22, z = -14.5 + r() * 29, u = 0.6 + r() * 2.2;
        var yon = r() > 0.5;
        yol([[x, z], yon ? [x + u, z] : [x, z + u], yon ? [x + u + 0.4, z + 0.4] : [x + 0.4, z + u + 0.4]], 'rgba(58,90,77,0.55)', 1);
      }
      // via'lar
      ctx.fillStyle = '#8f9a96';
      for (var v = 0; v < 140; v++) { ctx.beginPath(); ctx.arc(r() * w, r() * h, 1.1, 0, Math.PI * 2); ctx.fill(); }
      // vida delikleri (gümüş halka)
      P.delikler.forEach(function (d) {
        ctx.fillStyle = '#c9ced4'; ctx.beginPath(); ctx.arc(cx(d[0]), cz(d[1]), 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0c0f0e'; ctx.beginPath(); ctx.arc(cx(d[0]), cz(d[1]), 3.2, 0, Math.PI * 2); ctx.fill();
      });
      // soğutucu montaj delikleri (soket çevresi)
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
        var x = P.soket[0] + s[0] * 3.9, z = P.soket[1] + s[1] * 3.9;
        ctx.fillStyle = '#b7bdc4'; ctx.beginPath(); ctx.arc(cx(x), cz(z), 4.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0c0f0e'; ctx.beginPath(); ctx.arc(cx(x), cz(z), 2.2, 0, Math.PI * 2); ctx.fill();
      });
      // M.2 ek vida delikleri (2242, 2260)
      P.m2.forEach(function (m) {
        [4.65, 6.45].forEach(function (dx) {
          ctx.fillStyle = '#b7bdc4'; ctx.beginPath(); ctx.arc(cx(P.m2X0 + dx), cz(m[1]), 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#0c0f0e'; ctx.beginPath(); ctx.arc(cx(P.m2X0 + dx), cz(m[1]), 1.4, 0, Math.PI * 2); ctx.fill();
        });
      });
      // baskı çerçeveleri ve yazılar (beyaz serigrafi)
      ctx.strokeStyle = 'rgba(232,236,240,0.75)'; ctx.lineWidth = 1;
      function cerceve(x0, z0, x1, z1) { ctx.strokeRect(cx(x0), cz(z0), cx(x1) - cx(x0), cz(z1) - cz(z0)); }
      cerceve(P.soket[0] - 3.1, P.soket[1] - 3.3, P.soket[0] + 3.3, P.soket[1] + 3.3);
      cerceve(1.7, -14.9, 5.9, 0.1);
      cerceve(P.cmos[0] - 1.35, P.cmos[1] - 1.35, P.cmos[0] + 1.35, P.cmos[1] + 1.35);
      ctx.fillStyle = 'rgba(236,240,244,0.9)'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      function yazi(t, x, z, boy, aci) {
        ctx.save(); ctx.translate(cx(x), cz(z)); if (aci) ctx.rotate(aci);
        ctx.font = '700 ' + (boy || 9) + 'px Arial, sans-serif'; ctx.fillText(t, 0, 0); ctx.restore();
      }
      yazi('CPU', P.soket[0] - 2.9, P.soket[1] + 3.75, 10);
      ['DIMM_A1', 'DIMM_A2', 'DIMM_B1', 'DIMM_B2'].forEach(function (t, i) { yazi(t, P.ramX[i] + 0.52, -0.25, 7, -Math.PI / 2); });
      yazi('PCIE_1', -10.2, 0.05, 8); yazi('PCIE_2', -10.2, 2.05, 8); yazi('PCIE_3', -10.2, 6.15, 8); yazi('PCIE_4', -10.2, 8.15, 8);
      yazi('M.2_1  2242  2260  2280', -7.4, -0.75, 8); yazi('M.2_2  2242  2260  2280', -7.4, 6.35, 8);
      yazi('SATA', 9.6, 7.3, 9); yazi('ATX_PWR', 9.2, -9.4, 8, -Math.PI / 2 + Math.PI); yazi('CPU_PWR', -7.7, -13.55, 8);
      yazi('CPU_FAN', -0.4, -15.0, 7); yazi('F_PANEL', 7.6, 13.35, 8); yazi('F_USB', 4.7, 13.35, 8); yazi('F_AUDIO', -10.6, 13.35, 8);
      yazi('USB3', 9.3, 1.1, 8); yazi('BAT', P.cmos[0] - 1.3, P.cmos[1] + 1.75, 8);
      // ön panel başlığı renkli eşleme kutuları (yazıyla)
      [['PWR', '#22c55e'], ['RST', '#3b82f6'], ['HDD', '#f59e0b'], ['LED', '#ef4444']].forEach(function (b, i) {
        ctx.fillStyle = b[1]; ctx.fillRect(cx(7.6 + i * 0.62), cz(15.0), 9, 4);
        ctx.fillStyle = 'rgba(236,240,244,0.9)'; yazi(b[0], 7.6 + i * 0.62, 14.85, 5);
      });
      // kenar çizgisi
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 3; ctx.strokeRect(1, 1, w - 2, h - 2);
    });
    var mat = new K.THREE.MeshStandardMaterial({ map: doku, roughness: 0.62, metalness: 0.08 });
    mat.userData.paylasimli = true;
    onbellek.pcb = mat;
    return mat;
  }

  /* Pim yuvası dokusu (başlıkların üst yüzü): sutun × satir kare delik */
  function baslikDokusu(K, sutun, satir, renk) {
    var ad = 'b' + sutun + 'x' + satir + (renk || '');
    if (onbellek[ad]) return onbellek[ad];
    var doku = K.canvasDoku(sutun * 32, satir * 32, function (ctx, w, h) {
      ctx.fillStyle = renk || '#16171a'; ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < sutun; i++) for (var j = 0; j < satir; j++) {
        ctx.fillStyle = '#3a3d44'; ctx.fillRect(i * 32 + 5, j * 32 + 5, 22, 22);
        ctx.fillStyle = '#050506';
        if ((i + j) % 3 === 0) { ctx.beginPath(); ctx.moveTo(i * 32 + 8, j * 32 + 8); ctx.lineTo(i * 32 + 24, j * 32 + 8); ctx.lineTo(i * 32 + 24, j * 32 + 18); ctx.lineTo(i * 32 + 16, j * 32 + 24); ctx.lineTo(i * 32 + 8, j * 32 + 24); ctx.closePath(); ctx.fill(); }
        else ctx.fillRect(i * 32 + 8, j * 32 + 8, 16, 16);
      }
    });
    var mat = new K.THREE.MeshStandardMaterial({ map: doku, roughness: 0.55 });
    mat.userData.paylasimli = true;
    onbellek[ad] = mat;
    return mat;
  }

  /* Görünmez, geniş tıklama alanı (küçük parçalara parmakla dokunulabilsin) */
  function vurus(K, grup, w, h, d, x, y, z) {
    var THREE = K.THREE;
    var m = new THREE.Mesh(K.geoPaylas('ak-vurus', function () { return new THREE.BoxGeometry(1, 1, 1); }),
      K.vurusMat || (K.vurusMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })));
    m.scale.set(w, h, d);
    m.position.set(x || 0, y || h / 2, z || 0);
    m.userData.vurguHaric = true; m.userData.golgeYok = true; m.castShadow = false;
    grup.add(m);
    return m;
  }

  /* Alüminyum soğutucu: taban + kanatçıklar. uzun: 'x' | 'z' */
  function sogutucu(K, uz, yuk, gen, uzun, mat) {
    var THREE = K.THREE, g = new THREE.Group();
    var w = uzun === 'x' ? uz : gen, d = uzun === 'x' ? gen : uz;
    K.koy(g, K.kutu(w, yuk * 0.42, d, mat, 0.12, 1), 0, yuk * 0.21, 0);
    var n = Math.floor(uz / 0.42), kon = [];
    for (var i = 0; i < n; i++) {
      var t = -uz / 2 + 0.25 + i * (uz - 0.5) / (n - 1);
      kon.push(uzun === 'x' ? [t, yuk * 0.7, 0] : [0, yuk * 0.7, t]);
    }
    var kg = K.geoPaylas('ak-kanat-' + uzun + gen + yuk, function () {
      return uzun === 'x' ? new THREE.BoxGeometry(0.16, yuk * 0.58, gen) : new THREE.BoxGeometry(gen, yuk * 0.58, 0.16);
    });
    g.add(K.ornekle(kg, mat, kon));
    // üst kapak şeridi (parlak kenar)
    K.koy(g, K.kutu(uzun === 'x' ? uz : 0.5, 0.12, uzun === 'x' ? 0.5 : uz, K.mat('aluminyum'), 0.05, 1),
      uzun === 'x' ? 0 : gen / 2 - 0.25, yuk + 0.02, uzun === 'x' ? gen / 2 - 0.25 : 0);
    return g;
  }

  /* Aynı düğümdeki, aynı malzemeli adsız sabit mesh'leri tek mesh'te birleştirir (çizim çağrısını azaltır).
     Adlı parçalar, InstancedMesh'ler ve alt öğesi olanlar dokunulmadan kalır. */
  function birlestir(THREE, kok) {
    var dugumler = [];
    kok.traverse(function (o) { if (o.children.length > 1) dugumler.push(o); });
    dugumler.forEach(function (d) {
      var gruplar = {};
      d.children.slice().forEach(function (c) {
        if (!c.isMesh || c.isInstancedMesh || c.name || c.children.length || Array.isArray(c.material)) return;
        var at = c.geometry.attributes;
        if (!at.uv || !at.normal || at.uv.itemSize !== 2) return;
        var ana = c.material.uuid + '|' + JSON.stringify(c.userData) + '|' + c.renderOrder + '|' + c.castShadow;
        (gruplar[ana] = gruplar[ana] || []).push(c);
      });
      Object.keys(gruplar).forEach(function (a) {
        var l = gruplar[a];
        if (l.length < 2) return;
        var poz = [], nor = [], uv = [];
        l.forEach(function (c) {
          c.updateMatrix();
          var gg = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone();
          gg.applyMatrix4(c.matrix);
          poz.push(gg.attributes.position.array); nor.push(gg.attributes.normal.array); uv.push(gg.attributes.uv.array);
          gg.dispose();
          d.remove(c);
        });
        function ekle(parcalar) {
          var n = 0, o = 0;
          parcalar.forEach(function (x) { n += x.length; });
          var out = new Float32Array(n);
          parcalar.forEach(function (x) { out.set(x, o); o += x.length; });
          return out;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(ekle(poz), 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(ekle(nor), 3));
        geo.setAttribute('uv', new THREE.BufferAttribute(ekle(uv), 2));
        geo.computeBoundingBox(); geo.computeBoundingSphere();
        var m = new THREE.Mesh(geo, l[0].material);
        m.userData = Object.assign({}, l[0].userData);
        m.renderOrder = l[0].renderOrder; m.castShadow = l[0].castShadow;
        d.add(m);
      });
    });
  }
  D.sabitBirlestir = D.sabitBirlestir || birlestir;   // M-KASA-TURLERI de aynı yardımcıyı taşır

  D.modelTanimla('M-ANAKART', function (K, ops) {
    var THREE = K.THREE, V3 = K.V3;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-ANAKART', 'Anakart', 'Bilgisayarın bütün parçalarını birbirine bağlayan ana devre kartı.');
    var parcalar = [];
    function ana(nesne, ad, etiket, bilgi) { K.parca(nesne, ad, etiket, bilgi); parcalar.push(ad); return nesne; }

    /* PCB */
    var pcb = K.kutu(W, T, L, K.mat('#17211e', { roughness: 0.6 }), 0.06, 1);
    K.koy(g, pcb, 0, T / 2, 0);
    pcb.userData.secilmez = true;
    var ust = K.duzlem(W, L, pcbDokusu(K));
    K.koy(g, ust, 0, T + 0.004, 0, -Math.PI / 2);
    ust.userData.secilmez = true; ust.receiveShadow = true; ust.userData.golgeYok = true;

    var sogMat = K.mat('#3d434c', { roughness: 0.42, metalness: 0.75 });

    /* ─── İşlemci soketi (LGA): taban, pimler, köşe üçgeni, yük plakası, koruma kapağı, kilit kolu ─── */
    var soket = new THREE.Group();
    ana(soket, 'soket', 'İşlemci soketi', 'İşlemcinin oturduğu kare yuva. Köşedeki üçgen, işlemcinin hangi yönde takılacağını gösterir.');
    var SW = 4.6, SD = 5.2;
    K.koy(soket, K.kutu(SW, 0.3, SD, 'plastikKoyu', 0.06, 1), 0, 0.15, 0);
    // metal destek çerçevesi
    [[0, -SD / 2 - 0.35, SW + 1.2, 0.5], [0, SD / 2 + 0.35, SW + 1.2, 0.5]].forEach(function (b) {
      K.koy(soket, K.kutu(b[2], 0.14, b[3], 'celik', 0.04, 1), b[0], 0.07, b[1]);
    });
    [-1, 1].forEach(function (sx) { K.koy(soket, K.kutu(0.45, 0.14, SD + 1.2, 'celik', 0.04, 1), sx * (SW / 2 + 0.35), 0.07, 0); });
    // pimler: doku
    var pimDoku = onbellek.pim || (onbellek.pim = K.canvasDoku(256, 288, function (ctx, w, h) {
      ctx.fillStyle = '#2b2419'; ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 40; i++) for (var j = 0; j < 45; j++) {
        if (i > 13 && i < 26 && j > 15 && j < 29) continue;         // ortadaki boşluk (gerçek LGA gibi)
        ctx.fillStyle = (i + j) % 2 ? '#e4b75a' : '#c99a3f';
        ctx.fillRect(4 + i * 6.2, 4 + j * 6.3, 3, 3);
      }
      ctx.fillStyle = '#3a3226'; ctx.fillRect(4 + 14 * 6.2, 4 + 16 * 6.3, 12 * 6.2, 13 * 6.3);
    }));
    var pimler = K.duzlem(3.8, 4.3, new THREE.MeshStandardMaterial({ map: pimDoku, roughness: 0.35, metalness: 0.6 }));
    K.koy(soket, pimler, 0, 0.305, 0, -Math.PI / 2);
    K.parca(pimler, 'soket-pimler', 'Soket pimleri', 'Çok ince, yaylı metal uçlar. İşlemcinin altındaki temaslara değer; parmakla dokunulmaz.');
    pimler.userData.golgeYok = true;
    // köşe üçgeni (yön işareti)
    var ucSekil = new THREE.Shape();
    ucSekil.moveTo(0, 0); ucSekil.lineTo(0.62, 0); ucSekil.lineTo(0, 0.62); ucSekil.lineTo(0, 0);
    var ucgen = new THREE.Mesh(new THREE.ExtrudeGeometry(ucSekil, { depth: 0.05, bevelEnabled: false }), K.mat('#f3c85a', { roughness: 0.35, metalness: 0.5 }));
    ucgen.rotation.x = Math.PI / 2;
    K.koy(soket, ucgen, -SW / 2 + 0.08, 0.36, -SD / 2 + 0.08);
    ucgen.rotation.set(Math.PI / 2, 0, 0);
    K.parca(ucgen, 'soket-ucgen', 'Köşe üçgeni', 'Yön işareti. İşlemcinin köşesindeki üçgen bu köşeye gelecek biçimde takılır.');
    // yük plakası (menteşe üst kenarda) + koruma kapağı
    var plakaPiv = new THREE.Group();
    plakaPiv.position.set(0, 0.36, -SD / 2 - 0.2);
    soket.add(plakaPiv);
    var plaka = new THREE.Group();
    K.parca(plaka, 'soket-plaka', 'Yük plakası', 'İşlemciyi sokete bastırarak sabit tutan metal çerçeve.');
    plaka.position.z = SD / 2 + 0.2;
    plakaPiv.add(plaka);
    var PW = SW + 0.2, PD = SD + 0.4, bar = 0.55;
    [[0, -PD / 2 + bar / 2, PW, bar], [0, PD / 2 - bar / 2, PW, bar]].forEach(function (b) { K.koy(plaka, K.kutu(b[2], 0.07, b[3], 'aluminyum', 0.02, 1), b[0], 0.035, b[1]); });
    [-1, 1].forEach(function (sx) { K.koy(plaka, K.kutu(bar, 0.07, PD - 2 * bar, 'aluminyum', 0.02, 1), sx * (PW / 2 - bar / 2), 0.035, 0); });
    K.koy(plaka, K.kutu(1.4, 0.07, 0.5, 'aluminyum', 0.02, 1), 0, 0.035, PD / 2 + 0.2);      // ön dil (kolun bastığı yer)
    var kapak = new THREE.Group();
    K.parca(kapak, 'soket-kapak', 'Koruma kapağı', 'Pimleri toza ve darbeye karşı korur. İşlemci takılınca çıkarılır ve saklanır.');
    K.koy(kapak, K.kutu(PW - 0.3, 0.2, PD - 0.3, 'plastikSiyah', 0.08, 1), 0, 0.17, 0);
    K.koy(kapak, K.kutu(PW - 1.4, 0.06, PD - 1.4, K.mat('#26282d', { roughness: 0.3 }), 0.05, 1), 0, 0.29, 0);
    K.koy(kapak, K.kutu(0.9, 0.1, 0.5, 'plastikSiyah', 0.04, 1), 0, 0.12, PD / 2 - 0.05);  // tırnak
    plaka.add(kapak);
    if (ops.kapaksiz) kapak.visible = false;
    // kilit kolu: ekseni ön kenarda (X yönünde), kol +X yanında uzanır
    var kolPiv = new THREE.Group();
    kolPiv.position.set(0, 0.28, SD / 2 + 0.55);
    soket.add(kolPiv);
    var kol = new THREE.Group();
    K.parca(kol, 'soket-kol', 'Kilit kolu', 'Kaldırınca yük plakası açılır; indirince işlemci sıkıca tutulur.');
    kolPiv.add(kol);
    var eksen = K.silindir(0.07, SW + 0.9, 'aluminyum', 10);
    eksen.rotation.z = Math.PI / 2; K.koy(kol, eksen, 0.2, 0, 0);
    var kolGovde = K.silindir(0.085, SD + 1.1, 'aluminyum', 10);
    kolGovde.rotation.x = Math.PI / 2; K.koy(kol, kolGovde, SW / 2 + 0.65, 0, -(SD + 1.1) / 2);
    var tutamak = K.silindir(0.13, 0.7, K.mat('#2a2d33', { roughness: 0.5 }), 10);
    tutamak.rotation.z = Math.PI / 2; K.koy(kol, tutamak, SW / 2 + 0.95, 0, -(SD + 1.1));
    K.koy(soket, K.kutu(0.4, 0.3, 0.4, 'celik', 0.05, 1), SW / 2 + 0.65, 0.15, -SD / 2 - 0.55);   // kol tutucu kanca
    vurus(K, soket, SW + 2.2, 0.9, SD + 1.8, 0.3, 0.45, 0.1);
    K.koy(g, soket, P.soket[0], T, P.soket[1]);

    function soketAc(acik, sure) {
      sure = sure == null ? 0.7 : sure;
      var s = D.sahneBul(g);
      var k0 = kolPiv.rotation.x, p0 = plakaPiv.rotation.x;
      var kolAcik = 1.75, plakaAcik = -1.95;
      if (acik) {
        return D.tween({ sahne: s, sure: sure, anahtar: 'soket', hedef: kol, guncelle: function (e) { kolPiv.rotation.x = k0 + (kolAcik - k0) * e; } })
          .then(function () { return D.tween({ sahne: s, sure: sure * 1.2, anahtar: 'soket', hedef: plaka, guncelle: function (e) { plakaPiv.rotation.x = p0 + (plakaAcik - p0) * e; } }); });
      }
      var pp = plakaPiv.rotation.x, kk = kolPiv.rotation.x;
      return D.tween({ sahne: s, sure: sure * 1.2, anahtar: 'soket', hedef: plaka, guncelle: function (e) { plakaPiv.rotation.x = pp * (1 - e); } })
        .then(function () { return D.tween({ sahne: s, sure: sure, anahtar: 'soket', hedef: kol, ease: 'easeOutBack', guncelle: function (e) { kolPiv.rotation.x = kk * (1 - e); } }); });
    }

    /* ─── VRM soğutucuları + bobinler + kondansatörler ─── */
    var vrm = new THREE.Group();
    ana(vrm, 'vrm', 'VRM soğutucuları', 'Altlarındaki parçalar işlemciye giden elektriği düzenler; soğutucular onları serin tutar.');
    var vUst = sogutucu(K, 9.4, 1.9, 1.7, 'x', sogMat);
    K.koy(vrm, vUst, -4.1, 0, -12.9);
    var vSol = sogutucu(K, 7.9, 1.9, 1.7, 'z', sogMat);
    K.koy(vrm, vSol, -8.0, 0, -7.95);
    var bobin = [], kond = [];
    for (var bi = 0; bi < 8; bi++) bobin.push([-7.2 + bi * 0.95, 0.275, -11.5]);
    for (var bj = 0; bj < 7; bj++) bobin.push([-6.7, 0.275, -10.6 + bj * 0.95]);
    for (var ki = 0; ki < 6; ki++) kond.push([-5.9 + ki * 1.1, 0.35, -10.7]);
    vrm.add(K.ornekle(K.geoPaylas('ak-bobin', function () { return new THREE.BoxGeometry(0.72, 0.55, 0.72); }), K.mat('#3b3f46', { roughness: 0.5, metalness: 0.4 }), bobin));
    var kondGeo = K.geoPaylas('ak-kond', function () { return new THREE.CylinderGeometry(0.25, 0.25, 0.7, 12); });
    vrm.add(K.ornekle(kondGeo, K.mat('#8a8f99', { roughness: 0.35, metalness: 0.8 }), kond));
    K.koy(g, vrm, 0, T, 0);

    /* ─── 8-pin EPS (işlemci güç girişi) ─── */
    function guGirisi(ad, etiket, bilgi, sutun, satir, gx, gz, x, z) {
      var gg = new THREE.Group();
      ana(gg, ad, etiket, bilgi);
      K.koy(gg, K.kutu(gx, 1.25, gz, 'plastikSiyah', 0.05, 1), 0, 0.625, 0);
      var yuz = K.duzlem(gx - 0.12, gz - 0.12, baslikDokusu(K, sutun, satir));
      K.koy(gg, yuz, 0, 1.253, 0, -Math.PI / 2);
      // kilit tırnağı
      K.koy(gg, K.kutu(gx < gz ? 0.22 : 0.6, 0.5, gx < gz ? 0.6 : 0.22, 'plastikSiyah', 0.03, 1),
        gx < gz ? -gx / 2 - 0.1 : 0, 0.8, gx < gz ? 0 : gz / 2 + 0.1);
      vurus(K, gg, gx + 0.6, 1.5, gz + 0.6);
      K.koy(g, gg, x, T, z);
      return gg;
    }
    guGirisi('eps8', '8-pin işlemci güç girişi (EPS)', 'Güç kaynağından işlemciye ayrı bir elektrik yolu getirir.', 4, 2, 2.1, 1.0, P.eps[0], P.eps[1]);
    guGirisi('atx24', '24-pin ATX güç girişi', 'Güç kaynağının en büyük kablosu buraya takılır; anakartın tamamını besler.', 2, 12, 1.05, 5.3, P.atx[0], P.atx[1]);

    /* ─── RAM yuvaları (M-RAM-YUVASI, mandallı) ─── */
    var ramGrup = new THREE.Group();
    ana(ramGrup, 'ram-yuvalari', 'RAM yuvaları', 'RAM modülleri bu uzun yuvalara dik takılır. Uçlarındaki mandallar RAM’i yerinde tutar.');
    var yuvalar = [];
    P.ramX.forEach(function (x, i) {
      var y = D.model('M-RAM-YUVASI', { renk: i % 2 ? 'plastikSiyah' : '#4a4f58' });
      y.name = 'ram-yuvasi-' + (i + 1);
      y.userData.etiket = 'RAM yuvası ' + (i + 1);
      y.rotation.y = Math.PI / 2;           // uzun kenar Z boyunca
      y.position.set(x, 0, 0);
      ramGrup.add(y);
      yuvalar.push(y);
    });
    vurus(K, ramGrup, 4.4, 2.6, 15.2, 3.8, 1.3, 0);
    K.koy(g, ramGrup, 0, T, P.ramZ);

    /* ─── PCIe yuvaları ─── */
    var pcie = [];
    P.pcie.forEach(function (p) {
      var ad = p[0], tur = p[1], zirh = !!p[3];
      var len = tur === 'x16' ? 8.9 : 2.5, h = 1.1, wz = 0.75;
      var s = new THREE.Group();
      ana(s, ad, tur === 'x16' ? 'PCIe x16 yuvası' + (ad === 'pcie-x16-2' ? ' (ikinci)' : '') : 'PCIe x1 yuvası',
        tur === 'x16' ? 'En uzun genişleme yuvası. Ekran kartı buraya takılır.' : 'Kısa genişleme yuvası. Ağ ya da ses kartı gibi küçük kartlar takılır.');
      var duvar = zirh ? K.mat('aluminyum') : K.mat('plastikSiyah');
      [-1, 1].forEach(function (sz) { K.koy(s, K.kutu(len, h, 0.2, duvar, 0.05, 1), 0, h / 2, sz * (wz / 2 - 0.1)); });
      K.koy(s, K.kutu(len, 0.36, wz, 'plastikSiyah'), 0, 0.18, 0);
      [-1, 1].forEach(function (sx) { K.koy(s, K.kutu(0.25, h, wz, duvar, 0.05, 1), sx * (len / 2 - 0.125), h / 2, 0); });
      K.koy(s, K.kutu(0.2, h - 0.15, wz - 0.3, 'plastikSiyah'), -len / 2 + 1.17, (h - 0.15) / 2, 0);   // anahtar bölmesi
      K.koy(s, K.kutu(len - 0.5, 0.02, 0.3, K.mat('#050506')), 0, 0.37, 0);
      if (tur === 'x16') K.koy(s, K.kutu(0.55, 1.3, 0.85, K.mat('#5b616b', { roughness: 0.45 }), 0.08, 1), len / 2 + 0.3, 0.65, 0);   // tutucu mandal
      vurus(K, s, len + 0.8, 1.5, 1.4);
      s.userData.tur = tur; s.userData.uzunluk = len; s.userData.oturma = new V3(0, 0.38, 0);
      K.koy(g, s, P.pcieX0 + len / 2, T, p[2]);
      pcie.push(s);
    });

    /* ─── M.2 yuvaları (konnektör + vida ayağı) ─── */
    var m2 = [];
    var pirinc = K.mat('#c9a44c', { roughness: 0.35, metalness: 0.9 });
    P.m2.forEach(function (m, i) {
      var s = new THREE.Group();
      ana(s, m[0], 'M.2 yuvası', 'Sakız büyüklüğündeki M.2 SSD buraya yatık takılır, sonra ucu vidayla sabitlenir.');
      K.koy(s, K.kutu(0.9, 0.55, 2.3, 'plastikSiyah', 0.05, 1), 0, 0.275, 0);
      K.koy(s, K.kutu(0.04, 0.16, 1.9, K.mat('#050506')), 0.44, 0.3, 0);          // ağız
      K.koy(s, K.kutu(0.05, 0.18, 0.12, 'plastikSiyah'), 0.44, 0.3, 0.48);          // anahtar çıkıntısı
      var vida = new THREE.Group();
      K.parca(vida, m[0] + '-vida', 'M.2 vida ayağı', 'SSD’nin ucu bu ayağın üstüne yatar ve küçük bir vidayla sabitlenir.');
      var ayak = K.silindir(0.28, 0.3, pirinc, 6);
      K.koy(vida, ayak, 0, 0.15, 0);
      var vbas = new THREE.Group();
      K.koy(vbas, K.silindir(0.3, 0.12, 'celik', 16), 0, 0, 0);
      K.koy(vbas, K.kutu(0.4, 0.03, 0.07, K.mat('#2a2d33')), 0, 0.06, 0);
      K.koy(vbas, K.kutu(0.07, 0.03, 0.4, K.mat('#2a2d33')), 0, 0.06, 0);
      vbas.name = m[0] + '-vida-bas';
      K.koy(vida, vbas, 0, 0.43, 0);
      vida.userData.bas = vbas;
      K.koy(s, vida, 0.45 + 8.0, 0, 0);
      vurus(K, s, 9.2, 0.7, 2.5, 4.2, 0.35, 0);
      s.userData.oturma = new V3(0.45, 0.3, 0);
      s.userData.vida = vida; s.userData.uzunluk = 8;
      K.koy(g, s, P.m2X0, T, m[1]);
      m2.push(s);
    });

    /* ─── Çipset + soğutucusu ─── */
    var cipset = new THREE.Group();
    ana(cipset, 'cipset', 'Çipset (soğutucusu)', 'Diskleri, USB’leri ve ağı işlemciye bağlayan yardımcı çip. Üstündeki soğutucu onu serin tutar.');
    K.koy(cipset, K.kutu(4.6, 0.8, 4.6, sogMat, 0.3, 2), 0, 0.4, 0);
    K.koy(cipset, K.kutu(3.4, 0.06, 3.4, K.mat('#aab1ba', { roughness: 0.3, metalness: 0.9 }), 0.25, 1), 0, 0.82, 0);
    var cizgi = [];
    for (var ci = 0; ci < 6; ci++) cizgi.push([-1.2 + ci * 0.48, 0.86, 0]);
    cipset.add(K.ornekle(K.geoPaylas('ak-cizgi', function () { return new THREE.BoxGeometry(0.08, 0.03, 2.8); }), sogMat, cizgi));
    K.koy(g, cipset, P.cipset[0], T, P.cipset[1]);

    /* ─── SATA portları (2 × 2, yana bakan, L ağızlı) ─── */
    var sata = new THREE.Group();
    ana(sata, 'sata', 'SATA portları', 'Disk ve SSD’lerin veri kablosu buraya takılır. Ağzı L biçimlidir; kablo tek yönde girer.');
    var sataDoku = onbellek.sata || (onbellek.sata = K.canvasDoku(128, 64, function (ctx, w, h) {
      ctx.fillStyle = '#131417'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#020203';
      ctx.beginPath(); ctx.moveTo(10, 14); ctx.lineTo(118, 14); ctx.lineTo(118, 50); ctx.lineTo(28, 50); ctx.lineTo(28, 38); ctx.lineTo(10, 38); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#34363c'; ctx.fillRect(32, 24, 80, 10);
      ctx.fillStyle = '#d9a843'; for (var i = 0; i < 7; i++) ctx.fillRect(36 + i * 11, 26, 5, 6);
    }));
    var sataMat = new THREE.MeshStandardMaterial({ map: sataDoku, roughness: 0.5 });
    var sataNo = 0;
    P.sata[1].forEach(function (z) {
      K.koy(sata, K.kutu(1.1, 1.5, 1.3, 'plastikSiyah', 0.05, 1), 0, 0.75, z);
      [1.1, 0.4].forEach(function (y) {
        sataNo++;
        var yz = K.duzlem(1.18, 0.6, sataMat);
        K.koy(sata, yz, 0.556, y, z, 0, Math.PI / 2, 0);
        K.parca(yz, 'sata-' + sataNo, 'SATA portu ' + sataNo, 'Bir diskin veri kablosu takılır.');
        yz.userData.golgeYok = true;
      });
    });
    vurus(K, sata, 1.6, 1.9, 4.2, 0, 0.95, (P.sata[1][0] + P.sata[1][1]) / 2);
    K.koy(g, sata, P.sata[0], T, 0);

    /* ─── Başlıklar: ön panel (F_PANEL), ön USB 2, ön ses; ön USB 3; işlemci fanı ─── */
    var altin = K.mat('altin');
    var pimGeo = K.geoPaylas('ak-pim', function () { return new THREE.BoxGeometry(0.064, 0.6, 0.064); });
    var onPanel = new THREE.Group();
    ana(onPanel, 'on-panel', 'Ön panel başlıkları', 'Kasanın önündeki güç düğmesi, ışıklar, USB ve ses girişlerinin kabloları bu iğnelere takılır.');
    var pimKon = [];
    [P.fpanel, P.fusb, P.fses].forEach(function (b) {
      K.koy(onPanel, K.kutu(1.25, 0.25, 0.55, 'plastikSiyah'), b[0], 0.125, b[1]);
      for (var i = 0; i < 5; i++) for (var j = 0; j < 2; j++) {
        if (i === 4 && j === 0) continue;                 // eksik pim (yön anahtarı)
        pimKon.push([b[0] - 0.5 + i * 0.25, 0.4, b[1] - 0.125 + j * 0.25]);
      }
      vurus(K, onPanel, 1.9, 1.0, 1.2, b[0], 0.5, b[1]);
    });
    onPanel.add(K.ornekle(pimGeo, altin, pimKon));
    K.koy(g, onPanel, 0, T, 0);

    var usb3 = new THREE.Group();
    ana(usb3, 'usb-baslik', 'Ön USB 3 başlığı', 'Kasanın önündeki hızlı USB girişlerinin kablosu buraya takılır.');
    K.koy(usb3, K.kutu(1.0, 0.85, 2.3, K.mat('#1e3a8a', { roughness: 0.5 }), 0.05, 1), 0, 0.425, 0);
    var u3y = K.duzlem(0.8, 2.1, baslikDokusu(K, 2, 10, '#1e3a8a'));
    K.koy(usb3, u3y, 0, 0.853, 0, -Math.PI / 2);
    vurus(K, usb3, 1.5, 1.2, 2.8);
    K.koy(g, usb3, P.usb3[0], T, P.usb3[1]);

    var fan = new THREE.Group();
    ana(fan, 'fan-baslik', 'İşlemci fanı başlığı', 'İşlemci soğutucusunun fan kablosu buraya takılır.');
    K.koy(fan, K.kutu(1.1, 0.25, 0.5, 'plastikBeyaz'), 0, 0.125, 0);
    K.koy(fan, K.kutu(1.1, 0.6, 0.08, 'plastikBeyaz'), 0, 0.3, -0.22);
    var fanPim = [];
    for (var fi = 0; fi < 4; fi++) fanPim.push([-0.375 + fi * 0.25, 0.4, 0.05]);
    fan.add(K.ornekle(pimGeo, altin, fanPim));
    vurus(K, fan, 1.6, 1.0, 1.1);
    K.koy(g, fan, P.fan[0], T, P.fan[1]);

    /* ─── CMOS pili (CR2032 düğme pil, yuvasında) ─── */
    var cmos = new THREE.Group();
    ana(cmos, 'cmos-pili', 'CMOS pili', 'Düğme pil. Bilgisayar kapalıyken saatin ve ayarların silinmemesini sağlar.');
    K.koy(cmos, K.silindir(1.18, 0.2, 'plastikSiyah', 28), 0, 0.1, 0);
    var pilDoku = onbellek.pil || (onbellek.pil = K.canvasDoku(128, 128, function (ctx, w, h) {
      var gr = ctx.createRadialGradient(w * 0.4, h * 0.35, 4, w / 2, h / 2, w / 2);
      gr.addColorStop(0, '#f3f5f7'); gr.addColorStop(1, '#a9afb7');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#4b5563'; ctx.font = '800 40px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+', w / 2, h * 0.34); ctx.font = '700 20px Arial, sans-serif'; ctx.fillText('CR2032', w / 2, h * 0.62); ctx.fillText('3V', w / 2, h * 0.8);
    }));
    var pilUst = new THREE.MeshStandardMaterial({ map: pilDoku, roughness: 0.3, metalness: 0.85 });
    var pil = new THREE.Mesh(K.geoPaylas('ak-pil', function () { return new THREE.CylinderGeometry(1.0, 1.0, 0.32, 36); }), K.mat('lehim'));
    K.koy(cmos, pil, 0, 0.36, 0);
    var pilYuz = new THREE.Mesh(K.geoPaylas('ak-pil-yuz', function () { return new THREE.CircleGeometry(0.98, 36); }), pilUst);
    K.koy(cmos, pilYuz, 0, 0.524, 0, -Math.PI / 2);
    K.koy(cmos, K.kutu(0.5, 0.06, 1.2, 'celik', 0.02, 1), 0.9, 0.55, 0);
    vurus(K, cmos, 2.6, 0.9, 2.6);
    K.koy(g, cmos, P.cmos[0], T, P.cmos[1]);

    /* ─── Arka panel (G/Ç): örtü + portlar (−X yönüne bakar) ─── */
    var arka = new THREE.Group();
    ana(arka, 'arka-panel', 'Arka panel portları', 'Anakartın kasanın arkasından dışarı bakan portları: USB, görüntü, ağ ve ses.');
    var ortu = K.kutu(2.2, 3.9, 13.4, K.mat('#2c3037', { roughness: 0.4, metalness: 0.45 }), 0.3, 2);
    K.koy(arka, ortu, -10.0, 1.95, -8.3);
    K.koy(arka, K.kutu(1.6, 0.05, 12.2, K.mat('#9aa3ad', { roughness: 0.3, metalness: 0.9 }), 0.02, 1), -10.0, 3.91, -8.3);
    var DUZEN = [
      ['usba-1', -13.9, 1.0], ['usba-2', -13.9, 2.0],
      ['dp', -11.7, 1.0], ['hdmi', -11.7, 2.0],
      ['usba3-1', -9.4, 0.9], ['usba3-2', -9.4, 1.8], ['usbc', -9.4, 2.7],
      ['usba3-3', -6.8, 0.9], ['usba3-4', -6.8, 1.8], ['rj45', -6.8, 3.0],
      ['ses-pembe', -3.6, 1.0], ['ses-yesil', -3.6, 2.0], ['ses-mavi', -3.6, 3.0]
    ];
    var portlar = [];
    var yuva = K.mat('#23262c', { roughness: 0.45, metalness: 0.5 });
    [[-13.9, 1.5, 2.2], [-11.7, 1.5, 2.2], [-9.4, 1.8, 2.8], [-6.8, 2.0, 3.4], [-3.6, 2.0, 3.2]].forEach(function (st) {
      K.koy(arka, K.kutu(1.2, st[2], 1.9, yuva, 0.06, 1), -11.45, st[1], st[0]);       // port bloğunun gövdesi (ağızlar önünde)
    });
    DUZEN.forEach(function (p) {
      var port = D.portYap(p[0], K);
      port.rotation.y = -Math.PI / 2;
      K.koy(arka, port, -12.55, p[2], p[1]);
      portlar.push(port);
    });
    K.koy(g, arka, 0, T, 0);

    /* ─── Küçük yüzey parçaları (çipler, kondansatörler) ─── */
    var bos = [[-12, -15.2, -8.8, -1.4], [-9, -14, 1.2, -3.5], [-6.3, -11.5, 0.2, -4.4], [1.6, -15.2, 6.2, 0.4], [9.8, -9, 11.6, -2.8],
      [-10.6, 0.2, 0, 1.6], [-10.6, 2.3, -7.6, 3.5], [-10.4, 3.6, -0.4, 6.3], [-10.6, 6.3, -1.2, 7.7], [-10.6, 8.3, -7.6, 9.6],
      [2.0, 4.8, 7.2, 10.0], [10.6, 7.6, 12.2, 11.6], [-4, 10.6, -0.8, 13.6], [3.8, 13.6, 9.6, 15.2], [-10.6, 13.6, -8.6, 15.2],
      [9.8, 1.0, 11.6, 3.7], [-1.2, -15.2, 1.4, -13.6], [-7.6, -15.2, -5.0, -13.8], [-9.1, -3.4, 0.4, -1.0], [-9.1, 3.6, 0.4, 6.3],
      [-10.5, -1.0, -9.5, -0.1], [-11.2, 10.8, -7.8, 12.4], [6.8, 11.4, 8.4, 13.0], [2.8, 12.1, 3.6, 12.7]];
    function dolu(x, z) { return bos.some(function (b) { return x > b[0] - 0.2 && x < b[2] + 0.2 && z > b[1] - 0.2 && z < b[3] + 0.2; }); }
    var rr = K.rng(21), smd = [], smd2 = [];
    for (var n = 0; n < 900 && smd.length + smd2.length < 110; n++) {
      var x = -11.6 + rr() * 23.2, z = -14.8 + rr() * 29.6;
      if (dolu(x, z)) continue;
      (rr() > 0.55 ? smd2 : smd).push([x, T + 0.04, z]);
    }
    var smdGeo = K.geoPaylas('ak-smd', function () { return new THREE.BoxGeometry(0.2, 0.08, 0.11); });
    var s1 = K.ornekle(smdGeo, K.mat('#15161a', { roughness: 0.5 }), smd); s1.userData.secilmez = true; g.add(s1);
    var s2 = K.ornekle(smdGeo, K.mat('#a47c55', { roughness: 0.55 }), smd2); s2.userData.secilmez = true; g.add(s2);
    [[7.6, 12.2, 1.4, 1.4], [3.2, 12.4, 0.6, 0.5], [-9.4, 11.4, 0.7, 0.7], [-10.0, -0.55, 0.8, 0.8]].forEach(function (c) {
      var m = K.kutu(c[2], 0.12, c[3], 'cip'); m.userData.secilmez = true; K.koy(g, m, c[0], T + 0.06, c[1]);
    });
    var sesKond = K.ornekle(K.geoPaylas('ak-seskond', function () { return new THREE.CylinderGeometry(0.28, 0.28, 0.7, 12); }),
      K.mat('#c9a227', { roughness: 0.4, metalness: 0.3 }), [[-10.8, T + 0.35, 11.2], [-10.8, T + 0.35, 12.0], [-8.2, T + 0.35, 11.2], [-8.2, T + 0.35, 12.0]]);
    sesKond.userData.secilmez = true; g.add(sesKond);

    /* ─── Veri ve enerji yolları (A-AKIS) ─── */
    var Y = T + 0.45;
    function v(l) { return l.map(function (p) { return new V3(p[0], p.length > 2 ? p[2] : Y, p[1]); }); }
    var yollar = {
      'soket-ram': v([[-1.0, -8.6], [0.9, -8.6], [1.6, -9.3], [5.7, -9.3]]),
      'soket-pcie': v([[-4.0, -5.3], [-4.0, 0.1], [-4.8, 0.9], [-9.6, 0.9]]),
      'soket-m2': v([[-5.4, -5.3], [-5.4, -3.0], [-6.2, -2.2], [-8.4, -2.2]]),
      'soket-cipset': v([[-1.2, -5.4], [1.1, -3.1], [1.1, 4.3], [2.3, 5.5], [4.0, 6.8]]),
      'cipset-sata': v([[5.4, 8.0], [9.2, 8.0], [10.2, 9.0], [11.4, 9.0]]),
      'cipset-m2': v([[3.2, 5.8], [0.9, 4.95], [-8.4, 4.95]]),
      'cipset-pcie': v([[3.0, 8.4], [1.6, 9.0], [-8.8, 9.0]]),
      'cipset-usb': v([[3.0, 9.8], [-8.3, 9.8], [-8.6, 9.5], [-8.6, -0.6], [-10.0, -2.0], [-10.0, -8.8], [-12.3, -9.4]]),
      'guc': v([[-6.3, -14.4], [-6.3, -13.3], [-5.0, -11.9], [-3.3, -11.3], [-3.3, -8.0]]),
      'atx': v([[10.6, -6.0], [8.2, -6.0], [7.2, -5.0], [7.2, 3.8], [5.4, 5.6]])
    };

    g.userData.olcu = { W: W, L: L, T: T };
    g.userData.parcalar = parcalar;
    g.userData.yuvalar = yuvalar;
    g.userData.pcie = pcie;
    g.userData.m2 = m2;
    g.userData.portlar = portlar;
    g.userData.soket = { grup: soket, plaka: plaka, kol: kol, kapak: kapak, ucgen: ucgen, pimler: pimler };
    g.userData.yollar = yollar;
    g.userData.yol = function (ad) {
      g.updateWorldMatrix(true, false);
      return (yollar[ad] || []).map(function (p) { return g.localToWorld(p.clone()); });
    };
    g.userData.soketAc = soketAc;
    g.userData.kapakGoster = function (gorunur) { kapak.visible = !!gorunur; };
    birlestir(THREE, g);
    return g;
  });
})(window.DON3D);
