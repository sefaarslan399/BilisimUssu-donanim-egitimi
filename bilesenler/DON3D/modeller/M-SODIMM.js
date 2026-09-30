/* M-SODIMM — dizüstü SO-DIMM bellek modülü (DDR4 ya da DDR5).
   Ölçü birimi: cm (≈ 6,96 × 3,0 × 0,12 PCB; DDR4 260 temas, DDR5 262 temas, 0,5 mm aralık).
   Orijin: temas kenarının ortası (alt). Uzun kenar X, yükseklik Y, kalınlık Z. Çipler +Z, etiket −Z (M-RAM ile aynı yön).
   ops.tur: 'DDR4' (varsayılan) | 'DDR5' — çentik konumu ve DDR5'te PMIC farkı.
   Çentik: merkez çizgisinden DDR4 ≈ 3,5 mm, DDR5 ≈ 1,25 mm (bağlayıcı üreticisi tablosu); ikisi de +X tarafında modellendi.
   DOĞRULA: çentik tarafı ikincil kaynaktan; derste mm değeri verilmez.
   Parçalar: pcb, temaslar, cipler, pmic (yalnız DDR5), etiket; çapa: centik.
   ops: { tur, kapasite, etiketTur, renk }
   userData.centikX, userData.tur, userData.olcu {L,H,T}. D.SODIMM_OLCU = { L, H, T, centikX: { DDR4, DDR5 } } */
(function (D) {
  'use strict';
  var L = 6.96, H = 3.0, T = 0.12;
  var CENTIK = { DDR4: 0.35, DDR5: 0.125 }, CENTIK_G = 0.14, CENTIK_Y = 0.36;
  D.SODIMM_OLCU = { L: L, H: H, T: T, centikX: CENTIK };

  D.modelTanimla('M-SODIMM', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var tur = ops.tur === 'DDR5' ? 'DDR5' : 'DDR4';
    var d5 = tur === 'DDR5';
    var g = new THREE.Group();
    K.parca(g, 'M-SODIMM', 'SO-DIMM (' + tur + ')', 'Dizüstü ve mini bilgisayarlarda kullanılan küçük bellek modülü: ' +
      (d5 ? '262 temas, 1,1 V, modül üstünde PMIC.' : '260 temas, 1,2 V.'));

    var x0 = -L / 2, x1 = L / 2, p = 0.1, cx = CENTIK[tur];
    var s = new THREE.Shape();
    s.moveTo(x0 + p, 0);
    s.lineTo(cx - CENTIK_G / 2, 0);
    s.lineTo(cx - CENTIK_G / 2, CENTIK_Y - CENTIK_G / 2);
    s.absarc(cx, CENTIK_Y - CENTIK_G / 2, CENTIK_G / 2, Math.PI, 0, true);
    s.lineTo(cx + CENTIK_G / 2, 0);
    s.lineTo(x1 - p, 0);
    s.lineTo(x1, p);
    s.lineTo(x1, 1.85);
    s.absarc(x1, 2.05, 0.2, -Math.PI / 2, Math.PI / 2, true);   // yan mandal girintisi
    s.lineTo(x1, H - 0.1);
    s.lineTo(x1 - 0.1, H);
    s.lineTo(x0 + 0.1, H);
    s.lineTo(x0, H - 0.1);
    s.lineTo(x0, 2.25);
    s.absarc(x0, 2.05, 0.2, Math.PI / 2, -Math.PI / 2, true);
    s.lineTo(x0, p);
    s.closePath();
    var pcbGeo = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false, curveSegments: 8 });
    pcbGeo.translate(0, 0, -T / 2);
    var renk = ops.renk || (d5 ? '#1d4b54' : '#1f5a3a');
    var pcbDoku = K.canvasDoku(256, 128, function (ctx, w, h) {
      ctx.fillStyle = renk; ctx.fillRect(0, 0, w, h);
      var r = K.rng(d5 ? 41 : 17);
      ctx.strokeStyle = 'rgba(160,215,200,0.26)'; ctx.lineWidth = 1;
      for (var i = 0; i < 60; i++) {
        var x = r() * w, y = h * 0.12 + r() * h * 0.7;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + (r() - 0.5) * 24); ctx.lineTo(x + (r() - 0.5) * 36, y + (r() - 0.5) * 24); ctx.stroke();
      }
    });
    pcbDoku.repeat.set(1 / L, 1 / H);
    pcbDoku.offset.set(0.5, 0);
    var pcb = new THREE.Mesh(pcbGeo, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.6, metalness: 0.05 }));
    K.parca(pcb, 'pcb', 'Devre kartı', 'Çiplerin ve temasların üzerinde durduğu kart; DIMM’in yaklaşık yarısı uzunluğunda.');
    g.add(pcb);

    // Altın temaslar (0,5 mm aralık: DIMM'den daha sık)
    var temasDoku = K.canvasDoku(512, 16, function (ctx, w) {
      ctx.clearRect(0, 0, w, 16); ctx.fillStyle = '#fff';
      for (var x = 1; x < w; x += 3.9) ctx.fillRect(x, 0, 2.4, 16);
    });
    temasDoku.colorSpace = THREE.NoColorSpace;
    var temasMat = new THREE.MeshStandardMaterial({ color: 0xf2c257, metalness: 0.65, roughness: 0.3, emissive: 0x3a2400, alphaMap: temasDoku, alphaTest: 0.5, side: THREE.DoubleSide });
    var temaslar = new THREE.Group();
    K.parca(temaslar, 'temaslar', 'Altın temaslar', (d5 ? '262' : '260') + ' temas; çentik yeri nesle göre değişir.');
    [[x0 + p, cx - CENTIK_G / 2 - 0.04], [cx + CENTIK_G / 2 + 0.04, x1 - p]].forEach(function (pp) {
      var gen = pp[1] - pp[0];
      [1, -1].forEach(function (yz) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(gen, 0.26), temasMat);
        m.position.set((pp[0] + pp[1]) / 2, 0.15, yz * (T / 2 + 0.002));
        if (yz < 0) m.rotation.y = Math.PI;
        m.userData.golgeYok = true;
        temaslar.add(m);
      });
    });
    g.add(temaslar);

    // Bellek çipleri (+Z yüzü)
    var cipler = d5
      ? [[-2.55, 1.75, T / 2 + 0.05], [-1.45, 1.75, T / 2 + 0.05], [1.45, 1.75, T / 2 + 0.05], [2.55, 1.75, T / 2 + 0.05]]
      : [[-2.55, 1.75, T / 2 + 0.05], [-0.85, 1.75, T / 2 + 0.05], [0.85, 1.75, T / 2 + 0.05], [2.55, 1.75, T / 2 + 0.05]];
    var cipOrnek = K.ornekle(K.yuvarlakKutuGeo(0.82, 1.08, 0.1, 0.02, 1), K.mat('cip'), cipler);
    K.parca(cipOrnek, 'cipler', 'Bellek çipleri', 'DRAM yongaları; kapasiteye göre bir ya da iki yüzde bulunur.');
    g.add(cipOrnek);

    if (d5) {
      var pmic = new THREE.Group();
      K.parca(pmic, 'pmic', 'PMIC (güç yönetim çipi)', 'DDR5 SO-DIMM’de de gerilim düzenleme modülün üzerindedir.');
      K.koy(pmic, K.kutu(0.36, 0.36, 0.07, K.mat('cip'), 0.015), 0, 2.35, T / 2 + 0.035);
      var bobinGeo = K.yuvarlakKutuGeo(0.26, 0.26, 0.15, 0.03, 1);
      pmic.add(K.ornekle(bobinGeo, K.mat('#5a5f68', { roughness: 0.5, metalness: 0.3 }), [[-0.36, 1.9, T / 2 + 0.075], [0.36, 1.9, T / 2 + 0.075], [-0.36, 1.45, T / 2 + 0.075], [0.36, 1.45, T / 2 + 0.075]]));
      g.add(pmic);
    }

    // Etiket (−Z yüzü): kapasite ve tür (marka yok)
    var etiketDoku = K.canvasDoku(512, 200, function (ctx, w, h) {
      ctx.fillStyle = '#f4f5f7'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#111827'; ctx.textBaseline = 'middle';
      ctx.font = '800 70px Arial, sans-serif'; ctx.fillText(ops.kapasite || (d5 ? '16GB' : '8GB'), 24, 60);
      ctx.font = '700 40px Arial, sans-serif'; ctx.fillText(ops.etiketTur || (d5 ? '1Rx8 PC5-4800B' : '1Rx8 PC4-3200AA'), 24, 138);
      ctx.fillStyle = '#9ca3af'; ctx.fillRect(360, 24, 130, 64);
      ctx.fillStyle = '#f4f5f7';
      for (var b = 0; b < 26; b++) ctx.fillRect(365 + b * 5, 28, (b % 3) + 1, 56);
    });
    var etiket = K.duzlem(4.6, 1.8, new THREE.MeshStandardMaterial({ map: etiketDoku, roughness: 0.7 }));
    K.koy(g, etiket, 0, 1.85, -T / 2 - 0.004);
    etiket.rotation.y = Math.PI;
    K.parca(etiket, 'etiket', 'Etiket', 'Kapasite ve tür/hız yazar (PC4 = DDR4, PC5 = DDR5).');
    etiket.userData.golgeYok = true;

    var centik = new THREE.Object3D(); centik.name = 'centik';
    K.koy(g, centik, cx, 0, 0);
    g.userData.centikX = cx;
    g.userData.tur = tur;
    g.userData.olcu = { L: L, H: H, T: T };
    return g;
  });
})(window.DON3D);
