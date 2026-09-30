/* M-DIZUSTU-PATLAT — dizüstü bilgisayarın patlatma görünümü (servis konumu: kapak kapalı, ters çevrilmiş).
   Ölçü birimi: cm (32 × 22 gövde, M-DIZUSTU ile aynı ölçü ve renk). Orijin: masaya değen alt yüzün ortası.
   Yön: +Y yukarı (dizüstünün ALT kapağı yukarı bakar), −Z menteşe/arka kenar (fan havayı buradan atar).
   Katmanlar (aşağıdan yukarı): ekran (kapalı kapak) → klavye kasası (tepsi) → pil, anakart (tümleşik işlemci),
   hoparlörler → RAM (SO-DIMM), SSD (M.2) → fan + ısı borusu → alt kapak (vidalı).
   Parça adları: ekran, klavye-kasasi, pil, anakart, islemci, ram, ssd, sogutma, hoparlor-sol, hoparlor-sag, alt-kapak
   userData.patlat(oran 0–1, sure) → Promise: parçalar katmanlı ayrışır (oran 1) ve yerine döner (oran 0).
     Açılırken önce alt kapak, sonra soğutma, bellek/SSD, en son anakart ve pil kalkar; kapanırken tersi.
   userData.parcalar: { altKapak, sogutma, ram, ssd, anakart, islemci, pil, klavyeKasasi, ekran }
   userData.rotor: fan pervanesi (Y ekseninde döndürülür) · userData.olcu: { W, Dz }
   ops.oran: başlangıç patlatma oranı (varsayılan 0). */
(function (D) {
  'use strict';

  /* Yuvarlak köşeli dikdörtgen (XY) şekli; delik için de kullanılır. */
  function yuvarlakSekil(THREE, w, l, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -l / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + l - r); s.quadraticCurveTo(x + w, y + l, x + w - r, y + l);
    s.lineTo(x + r, y + l); s.quadraticCurveTo(x, y + l, x, y + l - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  /* XZ düzleminde yuvarlak köşeli plaka (Y: 0..h). delik: [w, l, r] → çerçeve. */
  function plaka(K, w, l, h, r, mat, delik) {
    var THREE = K.THREE;
    var s = yuvarlakSekil(THREE, w, l, r);
    if (delik) s.holes.push(yuvarlakSekil(THREE, delik[0], delik[1], delik[2]));
    var geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 6 });
    geo.rotateX(-Math.PI / 2);
    return new THREE.Mesh(geo, typeof mat === 'string' ? K.mat(mat) : mat);
  }

  /* Katmanlı patlatma: katmanlar [{ nesne, ofset:[x,y,z], don:[rx,ry,rz], sira: 0..1 }] */
  function patlatKur(D, g, katmanlar) {
    var THREE = D.kit.THREE, SAPMA = 0.4;
    katmanlar.forEach(function (k) {
      k.p0 = k.nesne.position.clone(); k.r0 = k.nesne.rotation.clone();
      k.ofsetV = new THREE.Vector3().fromArray(k.ofset); k.oran = 0;
    });
    function koy(k, o) {
      k.oran = o;
      k.nesne.position.copy(k.p0).addScaledVector(k.ofsetV, o);
      if (k.don) k.nesne.rotation.set(k.r0.x + k.don[0] * o, k.r0.y + k.don[1] * o, k.r0.z + k.don[2] * o);
    }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    g.userData.oran = 0;
    g.userData.patlat = function (oran, sure) {
      oran = oran == null ? 1 : oran;
      var acilis = oran >= g.userData.oran;
      g.userData.oran = oran;
      var bas = katmanlar.map(function (k) { return k.oran; });
      if (sure === 0) { katmanlar.forEach(function (k) { koy(k, oran); }); return Promise.resolve(); }
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 1.6 : sure, ease: 'lineer', anahtar: 'patlat', hedef: g,
        guncelle: function (e) {
          katmanlar.forEach(function (k, i) {
            var gec = (acilis ? k.sira : 1 - k.sira) * SAPMA;
            var t = Math.min(1, Math.max(0, (e - gec) / (1 - SAPMA)));
            koy(k, bas[i] + (oran - bas[i]) * ease(t));
          });
        } });
    };
  }

  D.modelTanimla('M-DIZUSTU-PATLAT', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var W = 32, Dz = 22;
    var g = new THREE.Group();
    K.parca(g, 'M-DIZUSTU-PATLAT', 'Dizüstünün içi', 'Alt kapak kalkınca pil, anakart, RAM, SSD ve fan görünür.');
    var gMat = K.mat('#aeb4bd', { roughness: 0.4, metalness: 0.7 });
    var rng = K.rng(12);

    /* ── Ekran (kapalı kapak, masaya yatık) ── */
    var ekran = new THREE.Group();
    K.parca(ekran, 'ekran', 'Ekran (kapalı)', 'Dizüstü kapağı kapatılıp ters çevrildi; ekran altta, masaya bakıyor.');
    ekran.add(plaka(K, W - 0.2, Dz - 0.2, 0.58, 1.1, gMat));
    g.add(ekran);

    /* ── Klavye kasası (tepsi): taban + yan duvarlar + yan portlar ── */
    var kasa = new THREE.Group();
    K.parca(kasa, 'klavye-kasasi', 'Klavye kasası', 'Klavye ve dokunmatik yüzey bu kasadadır. Masaüstünde klavye ayrı bir cihazdır.');
    kasa.position.y = 0.6;
    K.koy(kasa, plaka(K, W - 0.5, Dz - 0.5, 0.15, 0.9, 'kasaIc'), 0, 0, 0);
    K.koy(kasa, plaka(K, W, Dz, 1.15, 1.2, gMat, [W - 0.6, Dz - 0.6, 0.9]), 0, 0, 0);
    // Yan portlar (M-DIZUSTU ile aynı sıra): sol USB-C, HDMI, USB-A · sağ USB-A, ses jakı
    var portMat = K.mat('#15171b', { roughness: 0.6 });
    [[-1, 7, 0.9, 0.3], [-1, 3.6, 1.5, 0.45], [-1, 0, 1.25, 0.5], [1, 2, 1.25, 0.5], [1, -2.4, 0.4, 0.4]].forEach(function (p) {
      K.koy(kasa, K.kutu(0.06, p[3], p[2], portMat, Math.min(p[3], p[2]) * 0.3), p[0] * (W / 2 + 0.01), 0.62, p[1]);
    });
    // Arka kenarda fan çıkış ızgarası
    K.koy(kasa, K.kutu(6.2, 0.55, 0.06, portMat, 0.1), 10.5, 0.65, -Dz / 2 - 0.01);
    g.add(kasa);
    var ic = 0.75; // tepsi tabanının üst yüzü

    /* ── Pil (ön yarı) ── */
    var pil = new THREE.Group();
    K.parca(pil, 'pil', 'Pil', 'Dizüstü prizden uzaktayken enerjiyi pilden alır. Masaüstünde pil yoktur; güç kaynağı prizden besler.');
    pil.position.set(0, ic, 5.3);
    K.koy(pil, K.kutu(25, 0.62, 8.4, K.mat('#1f2126', { roughness: 0.55 }), 0.18), 0, 0.31, 0);
    var pilEtiket = K.canvasDoku(512, 176, function (ctx, w, h) {
      ctx.fillStyle = '#2a2d33'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#8b929c'; ctx.lineWidth = 3; ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.fillStyle = '#e5e7eb'; ctx.font = '800 38px Inter, Arial, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('Li-ion', 34, 62);
      ctx.font = '700 24px Inter, Arial, sans-serif';
      ctx.fillText('11,55 V   54 Wh', 34, 102);
      ctx.fillStyle = '#fbbf24'; ctx.font = '700 20px Inter, Arial, sans-serif';
      ctx.fillText('Delme · Ezme · Ateşe atma', 34, 142);
      // uyarı üçgeni (çizim)
      ctx.beginPath(); ctx.moveTo(430, 40); ctx.lineTo(480, 128); ctx.lineTo(380, 128); ctx.closePath();
      ctx.fillStyle = '#fbbf24'; ctx.fill();
      ctx.fillStyle = '#1f2126'; ctx.fillRect(426, 70, 8, 34); ctx.fillRect(426, 110, 8, 8);
    });
    var pe = K.duzlem(14, 4.8, new THREE.MeshStandardMaterial({ map: pilEtiket, roughness: 0.5 }));
    K.koy(pil, pe, -3, 0.625, 0.4, -Math.PI / 2).userData.secilmez = true;
    // Pil kablosu (anakarta)
    K.koy(pil, K.kutu(1.4, 0.08, 3.2, K.mat('#1b1c20'), 0.03), 6.5, 0.5, -5.3);
    K.koy(pil, K.kutu(1.6, 0.3, 0.7, 'plastikAcik', 0.05), 6.5, 0.55, -6.9);
    g.add(pil);

    /* ── Hoparlörler (ön köşeler) ── */
    [-1, 1].forEach(function (y) {
      var h = K.kutu(2.3, 0.5, 4.4, K.mat('#26282d', { roughness: 0.7 }), 0.2);
      K.parca(h, y < 0 ? 'hoparlor-sol' : 'hoparlor-sag', 'Hoparlör', 'Küçük hoparlörler kasanın içindedir.');
      K.koy(g, h, y * 14.2, ic + 0.25, 5.8);
    });

    /* ── Anakart (arka yarı) + tümleşik işlemci ── */
    var anakart = new THREE.Group();
    K.parca(anakart, 'anakart', 'Anakart', 'Tüm parçaları birbirine bağlar. Masaüstündekinden çok daha küçük ve incedir.');
    anakart.position.set(-4, ic + 0.2, -5.7);
    var pcbDoku = K.canvasDoku(512, 200, function (ctx, w, h) {
      ctx.fillStyle = '#1d4d34'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(160,210,170,0.18)'; ctx.lineWidth = 1.5;
      for (var i = 0; i < 60; i++) {
        var y0 = rng() * h, x0 = rng() * w;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + 40 + rng() * 80, y0); ctx.lineTo(x0 + 60 + rng() * 80, y0 + (rng() - 0.5) * 40); ctx.stroke();
      }
    });
    var pcb = K.kutu(22, 0.1, 8.8, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.62, metalness: 0.05 }));
    anakart.add(pcb);
    // küçük bileşenler (dirençler, kondansatörler)
    var smd = [];
    for (var i = 0; i < 90; i++) {
      var x = -10.6 + rng() * 21.2, z = -4.1 + rng() * 8.2;
      if (Math.abs(x - 3) < 2.2 && Math.abs(z - 0.2) < 1.6) continue;       // işlemci
      if (Math.abs(x + 6) < 4 && Math.abs(z - 0.1) < 2) continue;           // RAM
      if (x > -2 && x < 9.6 && z > 1.6) continue;                           // SSD
      smd.push([x, 0.08, z]);
    }
    anakart.add(K.ornekle(new THREE.BoxGeometry(0.28, 0.07, 0.16), K.mat('#2b2d33', { roughness: 0.5 }), smd));
    var buyuk = [[-9.2, -3], [8.6, -3.2], [9.6, 0.4], [-2.4, -3.3]];
    buyuk.forEach(function (b) { K.koy(anakart, K.kutu(1.1, 0.12, 1.1, 'cip', 0.04), b[0], 0.11, b[1]); });
    // İşlemci: taban + kalıp (anakarta lehimli)
    var islemci = new THREE.Group();
    K.parca(islemci, 'islemci', 'İşlemci (tümleşik)', 'Anakarta lehimlidir, sökülemez. Grafik birimi de çoğu zaman aynı çipin içindedir.');
    islemci.position.set(3, 0.05, 0.2);
    K.koy(islemci, K.kutu(3.2, 0.1, 2.6, K.mat('#2f5140', { roughness: 0.5 }), 0.03), 0, 0.05, 0);
    K.koy(islemci, K.kutu(1.5, 0.09, 1.1, K.mat('#2a2f3a', { roughness: 0.18, metalness: 0.5 }), 0.02), -0.3, 0.14, 0);
    K.koy(islemci, K.kutu(0.7, 0.09, 0.9, K.mat('#2a2f3a', { roughness: 0.18, metalness: 0.5 }), 0.02), 0.95, 0.14, 0);
    anakart.add(islemci);
    // RAM yuvası (siyah, yatay) ve SSD soketi + vida direği
    K.koy(anakart, K.kutu(7.4, 0.55, 0.75, 'plastikSiyah', 0.08), -6, 0.3, -1.45);
    K.koy(anakart, K.kutu(0.7, 0.4, 2.4, 'plastikSiyah', 0.06), -1.3, 0.23, 2.8);
    K.koy(anakart, K.silindir(0.3, 0.35, 'celik', 12), 6.9, 0.2, 2.8);
    g.add(anakart);

    /* ── RAM (SO-DIMM, yatık) ── */
    var ram = new THREE.Group();
    K.parca(ram, 'ram', 'RAM (SO-DIMM)', 'Masaüstü RAM’in kısa hâlidir ve yatık durur. Bazı ince dizüstülerde RAM anakarta lehimlidir.');
    ram.position.set(-10, ic + 0.62, -5.5);
    var ramDoku = K.canvasDoku(256, 112, function (ctx, w, h) {
      ctx.fillStyle = '#1f5a3a'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e3b04f'; ctx.fillRect(4, 0, w - 8, 12);
      ctx.fillStyle = '#1f5a3a';
      for (var x = 8; x < w - 8; x += 4) ctx.fillRect(x, 0, 1, 12);
      ctx.fillStyle = '#1f5a3a'; ctx.fillRect(98, 0, 6, 12);
    });
    K.koy(ram, K.kutu(6.97, 0.08, 3.0, new THREE.MeshStandardMaterial({ map: ramDoku, roughness: 0.55 })), 0, 0, 0);
    [-2.5, -0.85, 0.85, 2.5].forEach(function (x) { K.koy(ram, K.kutu(1.25, 0.1, 1.0, 'cip', 0.03), x, 0.09, 0.35); });
    var ramEt = K.canvasDoku(128, 32, function (ctx, w, h) { ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#334155'; ctx.font = '700 16px Inter, Arial, sans-serif'; ctx.fillText('8 GB DDR4', 10, 22); });
    var re = K.duzlem(3.2, 0.7, new THREE.MeshStandardMaterial({ map: ramEt, roughness: 0.6 }));
    K.koy(ram, re, 0, 0.145, 1.1, -Math.PI / 2).userData.secilmez = true;
    g.add(ram);

    /* ── SSD (M.2 2280) ── */
    var ssd = new THREE.Group();
    K.parca(ssd, 'ssd', 'SSD (M.2)', 'Dosyaları kalıcı olarak saklar. Bir sakız paketi boyunda, ince bir karttır.');
    ssd.position.set(0.9, ic + 0.55, -2.9);
    K.koy(ssd, K.kutu(8.0, 0.08, 2.2, K.mat('#1d1f24', { roughness: 0.6 })), 0, 0, 0);
    K.koy(ssd, K.kutu(0.5, 0.085, 1.9, 'altin'), -3.8, 0, 0);
    [-1.6, 1.3].forEach(function (x) { K.koy(ssd, K.kutu(1.9, 0.12, 1.5, 'cip', 0.03), x, 0.1, 0); });
    K.koy(ssd, K.kutu(0.9, 0.1, 0.9, 'cip', 0.03), 3.1, 0.09, 0);
    var ssdEt = K.canvasDoku(256, 64, function (ctx, w, h) {
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1e293b'; ctx.font = '800 26px Inter, Arial, sans-serif'; ctx.fillText('SSD  512 GB', 14, 30);
      ctx.font = '600 18px Inter, Arial, sans-serif'; ctx.fillText('M.2 2280 · NVMe', 14, 54);
    });
    var se = K.duzlem(4.6, 1.3, new THREE.MeshStandardMaterial({ map: ssdEt, roughness: 0.6 }));
    K.koy(ssd, se, -0.2, 0.172, 0, -Math.PI / 2).userData.secilmez = true;
    g.add(ssd);

    /* ── Soğutma: bakır plaka + ısı borusu + ızgara + fan ── */
    var sog = new THREE.Group();
    K.parca(sog, 'sogutma', 'Fan ve ısı borusu', 'Isı borusu işlemcinin ısısını fana taşır; fan sıcak havayı dışarı atar.');
    sog.position.set(0, ic, 0);
    g.add(sog);
    var cpuX = anakart.position.x + 3, cpuZ = anakart.position.z + 0.2, cpuY = 0.2 + 0.05 + 0.25;
    K.koy(sog, K.kutu(2.4, 0.16, 2.2, 'bakir', 0.04), cpuX, cpuY + 0.08, cpuZ);
    // Baskı plakası (siyah, çarpı biçimli) + 4 vida
    var baski = K.mat('#1b1d22', { roughness: 0.45, metalness: 0.5 });
    [0.6, -0.6].forEach(function (a) {
      var kol = K.kutu(5.2, 0.08, 0.5, baski, 0.03);
      kol.rotation.y = a;
      K.koy(sog, kol, cpuX, cpuY + 0.2, cpuZ);
    });
    [[2.1, 1.4], [-2.1, 1.4], [2.1, -1.4], [-2.1, -1.4]].forEach(function (v) {
      K.koy(sog, K.silindir(0.24, 0.14, 'celik', 12), cpuX + v[0], cpuY + 0.25, cpuZ + v[1]);
    });
    // Fan: gövde, üst kapak halkası ve pervane
    var fanX = 10.4, fanZ = -4.8, fanY = 0.35;
    var fanMat = K.mat('#23252a', { roughness: 0.5, metalness: 0.2 });
    var govdeGeo = new THREE.CylinderGeometry(3.1, 3.1, 0.62, 40, 1, true, 0.35, Math.PI * 2 - 0.7);
    var fanGovde = new THREE.Mesh(govdeGeo, new THREE.MeshStandardMaterial({ color: 0x23252a, roughness: 0.5, metalness: 0.2, side: THREE.DoubleSide }));
    K.koy(sog, fanGovde, fanX, fanY, fanZ);
    K.koy(sog, K.silindir(3.1, 0.05, fanMat, 40), fanX, fanY - 0.3, fanZ);
    var halka = new THREE.Mesh(new THREE.RingGeometry(1.75, 3.1, 40), new THREE.MeshStandardMaterial({ color: 0x2c2f35, roughness: 0.45, metalness: 0.3, side: THREE.DoubleSide }));
    halka.rotation.x = -Math.PI / 2;
    K.koy(sog, halka, fanX, fanY + 0.31, fanZ);
    var rotor = new THREE.Group();
    rotor.position.set(fanX, fanY - 0.02, fanZ);
    rotor.add(K.silindir(0.85, 0.5, K.mat('#3a3d44', { roughness: 0.4 }), 24));
    var kanatGeo = new THREE.BoxGeometry(1.9, 0.44, 0.06);
    var kanatlar = [];
    for (var k = 0; k < 26; k++) {
      var a = (k / 26) * Math.PI * 2;
      kanatlar.push([Math.cos(a) * 1.85, 0, Math.sin(a) * 1.85]);
    }
    var kim = new THREE.InstancedMesh(kanatGeo, K.mat('#30333a', { roughness: 0.45 }), kanatlar.length);
    var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1);
    kanatlar.forEach(function (p, j) {
      q.setFromEuler(new THREE.Euler(0, -(j / 26) * Math.PI * 2 + 0.5, 0));
      m4.compose(new THREE.Vector3(p[0], p[1], p[2]), q, s1);
      kim.setMatrixAt(j, m4);
    });
    kim.instanceMatrix.needsUpdate = true;
    kim.computeBoundingSphere();
    rotor.add(kim);
    sog.add(rotor);
    // Soğutucu kanatçıklar (fan çıkışında, arka kenar)
    var kanatcik = [];
    for (var f = 0; f < 30; f++) kanatcik.push([7.4 + f * 0.21, fanY, -Dz / 2 + 1.25]);
    sog.add(K.ornekle(new THREE.BoxGeometry(0.05, 0.6, 1.5), K.mat('bakir', { roughness: 0.4 }), kanatcik));
    // Isı borusu (yassı bakır): işlemciden kanatçıklara
    var boruG = new THREE.Group();
    boruG.position.y = cpuY + 0.28;
    boruG.scale.y = 0.45;
    boruG.add(K.kablo([new THREE.Vector3(cpuX - 0.8, 0, cpuZ), new THREE.Vector3(cpuX + 1.6, 0, cpuZ - 0.6),
      new THREE.Vector3(cpuX + 3.4, 0, -Dz / 2 + 1.35), new THREE.Vector3(7.4, 0, -Dz / 2 + 1.25), new THREE.Vector3(13.6, 0, -Dz / 2 + 1.25)], 0.34, 'bakir'));
    sog.add(boruG);

    /* ── Alt kapak: plaka, havalandırma, lastik ayaklar, vidalar ── */
    var altKapak = new THREE.Group();
    K.parca(altKapak, 'alt-kapak', 'Alt kapak', 'Vidaları sökülünce kalkar. Delikleri fana serin hava sağlar.');
    altKapak.position.y = 0.6 + 1.15;
    altKapak.add(plaka(K, W, Dz, 0.22, 1.2, gMat));
    var izgaraDoku = K.canvasDoku(512, 160, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#1a1c21';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 22; c++) {
        K.yuvarlakDikdortgen(ctx, 10 + c * 22.6, 12 + r * 36, 14, 26, 7); ctx.fill();
      }
    });
    var izgara = K.duzlem(15, 4.6, new THREE.MeshStandardMaterial({ map: izgaraDoku, transparent: true, roughness: 0.6 }));
    K.koy(altKapak, izgara, 5, 0.225, -6.2, -Math.PI / 2).userData.secilmez = true;
    [-8.6, 8.6].forEach(function (z) { K.koy(altKapak, K.kutu(25, 0.3, 0.9, 'kaucuk', 0.14), 0, 0.3, z); });
    [[-15, -10], [-5, -10.2], [5, -10.2], [15, -10], [-15.2, 0], [15.2, 0], [-15, 10], [-5, 10.2], [5, 10.2], [15, 10]].forEach(function (v) {
      K.koy(altKapak, K.silindir(0.3, 0.06, 'celik', 14), v[0], 0.25, v[1]);
    });
    // İç yüzde havalandırma delikleri
    var izgaraIc = K.duzlem(15, 4.6, izgara.material);
    K.koy(altKapak, izgaraIc, 5, -0.01, -6.2, Math.PI / 2).userData.secilmez = true;
    g.add(altKapak);

    /* ── Patlatma ── */
    patlatKur(D, g, [
      { nesne: altKapak, ofset: [0, 12.2, -17.5], don: [1.3, 0, 0], sira: 0 },
      { nesne: sog, ofset: [0, 6, 0], sira: 0.3 },
      { nesne: ram, ofset: [0, 3.8, 0], sira: 0.55 },
      { nesne: ssd, ofset: [0, 3.8, 0], sira: 0.55 },
      { nesne: anakart, ofset: [0, 1.7, 0], sira: 0.8 },
      { nesne: pil, ofset: [0, 1.4, 2.2], sira: 0.8 }
    ]);
    g.userData.parcalar = { altKapak: altKapak, sogutma: sog, ram: ram, ssd: ssd, anakart: anakart, islemci: islemci,
      pil: pil, klavyeKasasi: kasa, ekran: ekran };
    g.userData.rotor = rotor;
    g.userData.olcu = { W: W, Dz: Dz };
    if (ops.oran) g.userData.patlat(ops.oran, 0);
    return g;
  });
})(window.DON3D);
