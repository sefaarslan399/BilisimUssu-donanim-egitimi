/* M-RAM — DDR4 DIMM masaüstü bellek modülü (8 GB, tek yüz çipli).
   Ölçü birimi: cm (≈ 13,34 × 3,13 × 0,12 PCB). Orijin: temas kenarının ortası (alt).
   Uzun kenar X, yükseklik Y, kalınlık Z. Çipler +Z yüzünde, etiket −Z yüzünde.
   Çentik merkezden kaydırılmıştır; yalnız bir yönde yuvaya girer.
   DOĞRULA: çentiğin milimetrik konumu yaklaşık modellendi (merkezden ≈ 0,5 cm); derste ölçü verilmez.
   userData.centikX: çentiğin yerel X konumu (yuvadaki çıkıntıyla eşleşir). */
(function (D) {
  'use strict';
  var L = 13.335, H = 3.125, T = 0.12;
  var CENTIK_X = 0.51, CENTIK_G = 0.16, CENTIK_Y = 0.42;
  D.RAM_OLCU = { L: L, H: H, T: T, centikX: CENTIK_X };

  D.modelTanimla('M-RAM', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-RAM', 'RAM (DDR4)', 'Çalışan programları ve açık dosyaları geçici olarak tutan bellek modülü.');

    // PCB dış hattı: köşe pahları, alt çentik, uçlarda mandal girintileri
    var s = new THREE.Shape();
    var x0 = -L / 2, x1 = L / 2, p = 0.12, cx = CENTIK_X;
    s.moveTo(x0 + p, 0);
    s.lineTo(cx - CENTIK_G / 2, 0);
    s.lineTo(cx - CENTIK_G / 2, CENTIK_Y - CENTIK_G / 2);
    s.absarc(cx, CENTIK_Y - CENTIK_G / 2, CENTIK_G / 2, Math.PI, 0, true);
    s.lineTo(cx + CENTIK_G / 2, 0);
    s.lineTo(x1 - p, 0);
    s.lineTo(x1, p);
    s.lineTo(x1, 1.75);
    s.absarc(x1, 1.95, 0.2, -Math.PI / 2, Math.PI / 2, true);
    s.lineTo(x1, H);
    s.lineTo(x0, H);
    s.lineTo(x0, 2.15);
    s.absarc(x0, 1.95, 0.2, Math.PI / 2, -Math.PI / 2, true);
    s.lineTo(x0, p);
    s.closePath();
    var pcbGeo = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false, curveSegments: 8 });
    pcbGeo.translate(0, 0, -T / 2);
    var renk = ops.renk || '#1f5a3a';
    var pcbDoku = K.canvasDoku(512, 128, function (ctx, w, h) {
      ctx.fillStyle = renk; ctx.fillRect(0, 0, w, h);
      var r = K.rng(11);
      ctx.strokeStyle = 'rgba(160,210,170,0.28)'; ctx.lineWidth = 1;
      for (var i = 0; i < 90; i++) {
        var x = r() * w, y = h * 0.12 + r() * h * 0.7;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + (r() - 0.5) * 30); ctx.lineTo(x + (r() - 0.5) * 50, y + (r() - 0.5) * 30); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(220,225,230,0.5)';                 // ince baskı çerçeveleri
      for (var k = 0; k < 8; k++) ctx.fillRect(w * (0.08 + k * 0.113), h * 0.3, 1, h * 0.35);
    });
    pcbDoku.repeat.set(1 / L, 1 / H);
    pcbDoku.offset.set(0.5, 0);
    var pcb = new THREE.Mesh(pcbGeo, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.6, metalness: 0.05 }));
    K.parca(pcb, 'pcb', 'Devre kartı', 'Çiplerin ve temasların üzerinde durduğu kart.');
    g.add(pcb);

    // Altın temaslar (iki yüz, çentikte boşluk)
    var temasDoku = K.canvasDoku(512, 16, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#fff';
      for (var x = 1; x < w; x += 3.6) ctx.fillRect(x, 0, 2.3, h);
    });
    temasDoku.colorSpace = THREE.NoColorSpace;
    var temasMat = new THREE.MeshStandardMaterial({ color: 0xf2c257, metalness: 0.65, roughness: 0.3, emissive: 0x3a2400, alphaMap: temasDoku, transparent: false, alphaTest: 0.5, side: THREE.DoubleSide });
    var temaslar = new THREE.Group();
    K.parca(temaslar, 'temaslar', 'Altın temaslar', 'Yuvadaki metal uçlara değerek bilgiyi taşır.');
    var parcalar = [[x0 + p, cx - CENTIK_G / 2 - 0.05], [cx + CENTIK_G / 2 + 0.05, x1 - p]];
    parcalar.forEach(function (pp) {
      var gen = pp[1] - pp[0];
      [1, -1].forEach(function (yz) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(gen, 0.3), temasMat);
        m.position.set((pp[0] + pp[1]) / 2, 0.17, yz * (T / 2 + 0.002));
        if (yz < 0) m.rotation.y = Math.PI;
        m.userData.golgeYok = true;
        temaslar.add(m);
      });
    });
    g.add(temaslar);

    // Bellek çipleri (+Z yüzü)
    var cipler = [];
    for (var i = 0; i < 8; i++) cipler.push([-5.2 + i * 1.486, 1.85, T / 2 + 0.05]);
    var cipGeo = K.yuvarlakKutuGeo(0.78, 1.1, 0.1, 0.02, 1);
    var cipOrnek = K.ornekle(cipGeo, K.mat('cip'), cipler);
    K.parca(cipOrnek, 'cipler', 'Bellek çipleri', 'Bilginin geçici olarak tutulduğu yongalar.');
    g.add(cipOrnek);

    // Etiket (−Z yüzü): kapasite ve tür (marka yok)
    var etiketDoku = K.canvasDoku(512, 160, function (ctx, w, h) {
      ctx.fillStyle = '#f4f5f7'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#111827'; ctx.textBaseline = 'middle';
      ctx.font = '800 58px Arial, sans-serif'; ctx.fillText(ops.kapasite || '8GB', 22, 48);
      ctx.font = '700 34px Arial, sans-serif'; ctx.fillText('1Rx8 ' + (ops.tur || 'PC4-3200AA'), 22, 108);
      ctx.fillStyle = '#9ca3af'; ctx.fillRect(360, 20, 130, 60);
      ctx.fillStyle = '#f4f5f7';
      for (var b = 0; b < 26; b++) ctx.fillRect(365 + b * 5, 24, (b % 3) + 1, 52);
    });
    var etiket = K.duzlem(5.6, 1.75, new THREE.MeshStandardMaterial({ map: etiketDoku, roughness: 0.7 }));
    etiket.rotation.y = Math.PI;
    K.koy(g, etiket, 0.3, 1.9, -T / 2 - 0.004);
    etiket.rotation.y = Math.PI;
    K.parca(etiket, 'etiket', 'Etiket', 'Kapasite (ör. 8GB) ve bellek türü (PC4 = DDR4) yazar.');
    etiket.userData.golgeYok = true;

    var centik = new THREE.Object3D(); centik.name = 'centik';
    K.koy(g, centik, CENTIK_X, 0, 0);
    g.userData.centikX = CENTIK_X;
    g.userData.olcu = { L: L, H: H, T: T };
    return g;
  });
})(window.DON3D);
