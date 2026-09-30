/* M-RAM-DDR5 — DDR5 DIMM masaüstü bellek modülü (16 GB, tek yüz çipli, modül üstünde PMIC).
   Ölçü birimi: cm (≈ 13,335 × 3,125 × 0,12 PCB; 288 temas, 0,85 mm aralık). Orijin: temas kenarının ortası (alt).
   Uzun kenar X, yükseklik Y, kalınlık Z. Çipler +Z yüzünde, etiket −Z yüzünde (M-RAM ile aynı yön).
   Çentik: DDR4'ten farklı yerdedir; M-RAM ile aynı tarafta (+X) ama merkeze daha yakın.
   Kaynak: bağlayıcı üreticisi tablosu (JEDEC MO-329'a atıfla) — anahtar konumu merkez çizgisinden DDR4 5,575 mm, DDR5 3,875 mm.
   DOĞRULA: çentik tarafı ve milimetrik konum ikincil kaynaktan; derste mm değeri verilmez.
   Parçalar: pcb, temaslar, cipler, pmic (güç yönetim çipi + bobinler), spd (SPD hub), etiket; çapa: centik.
   ops: { kapasite: '16GB', tur: '1Rx8 PC5-4800B', renk: PCB rengi }
   userData.centikX: çentiğin yerel X konumu; userData.olcu {L,H,T}. D.RAM5_OLCU aynı değerleri taşır. */
(function (D) {
  'use strict';
  var L = 13.335, H = 3.125, T = 0.12;
  var CENTIK_X = 0.3875, CENTIK_G = 0.16, CENTIK_Y = 0.42;
  D.RAM5_OLCU = { L: L, H: H, T: T, centikX: CENTIK_X };

  D.modelTanimla('M-RAM-DDR5', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-RAM-DDR5', 'RAM (DDR5)', 'DDR5 masaüstü bellek modülü: 288 temaslı, 1,1 V; güç yönetim çipi modülün üzerindedir.');

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
    var renk = ops.renk || '#1d4b54';
    var pcbDoku = K.canvasDoku(512, 128, function (ctx, w, h) {
      ctx.fillStyle = renk; ctx.fillRect(0, 0, w, h);
      var r = K.rng(29);
      ctx.strokeStyle = 'rgba(150,215,220,0.24)'; ctx.lineWidth = 1;
      for (var i = 0; i < 110; i++) {
        var x = r() * w, y = h * 0.12 + r() * h * 0.7;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + (r() - 0.5) * 26); ctx.lineTo(x + (r() - 0.5) * 44, y + (r() - 0.5) * 26); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(225,230,235,0.5)';                 // ince baskı çerçeveleri (iki çip grubu)
      for (var k = 0; k < 4; k++) { ctx.fillRect(w * (0.07 + k * 0.1), h * 0.3, 1, h * 0.35); ctx.fillRect(w * (0.6 + k * 0.1), h * 0.3, 1, h * 0.35); }
      ctx.strokeStyle = 'rgba(225,230,235,0.45)';              // PMIC bölgesi çerçevesi
      ctx.strokeRect(w * 0.455, h * 0.1, w * 0.1, h * 0.45);
    });
    pcbDoku.repeat.set(1 / L, 1 / H);
    pcbDoku.offset.set(0.5, 0);
    var pcb = new THREE.Mesh(pcbGeo, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.6, metalness: 0.05 }));
    K.parca(pcb, 'pcb', 'Devre kartı', 'Çiplerin, güç yönetim devresinin ve temasların üzerinde durduğu kart.');
    g.add(pcb);

    // Altın temaslar (iki yüz, çentikte boşluk)
    var temasDoku = K.canvasDoku(512, 16, function (ctx, w) {
      ctx.clearRect(0, 0, w, 16); ctx.fillStyle = '#fff';
      for (var x = 1; x < w; x += 3.6) ctx.fillRect(x, 0, 2.3, 16);
    });
    temasDoku.colorSpace = THREE.NoColorSpace;
    var temasMat = new THREE.MeshStandardMaterial({ color: 0xf2c257, metalness: 0.65, roughness: 0.3, emissive: 0x3a2400, alphaMap: temasDoku, alphaTest: 0.5, side: THREE.DoubleSide });
    var temaslar = new THREE.Group();
    K.parca(temaslar, 'temaslar', 'Altın temaslar', '288 temas (her yüzde 144); DDR4 ile sayı aynı, çentik yeri farklı.');
    [[x0 + p, cx - CENTIK_G / 2 - 0.05], [cx + CENTIK_G / 2 + 0.05, x1 - p]].forEach(function (pp) {
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

    // Bellek çipleri (+Z yüzü): iki alt kanal için 4 + 4, ortada güç bölgesi
    var cipler = [];
    for (var i = 0; i < 4; i++) { cipler.push([-5.75 + i * 1.3, 1.8, T / 2 + 0.05]); cipler.push([1.85 + i * 1.3, 1.8, T / 2 + 0.05]); }
    var cipGeo = K.yuvarlakKutuGeo(0.82, 1.08, 0.1, 0.02, 1);
    var cipOrnek = K.ornekle(cipGeo, K.mat('cip'), cipler);
    K.parca(cipOrnek, 'cipler', 'Bellek çipleri', 'DRAM yongaları; DDR5’te modül iki bağımsız 32 bitlik alt kanala ayrılır.');
    g.add(cipOrnek);

    // PMIC bölgesi (üst orta): güç yönetim çipi + bobinler + kondansatörler
    var pmic = new THREE.Group();
    K.parca(pmic, 'pmic', 'PMIC (güç yönetim çipi)', 'DDR5’te gerilim düzenleme modülün üzerindedir: anakarttan gelen gerilimi çiplerin ihtiyacına çevirir.');
    K.koy(pmic, K.kutu(0.42, 0.42, 0.07, K.mat('cip'), 0.015), 0.02, 2.55, T / 2 + 0.035);
    var bobinMat = K.mat('#5a5f68', { roughness: 0.5, metalness: 0.3 });
    var bobinGeo = K.yuvarlakKutuGeo(0.3, 0.3, 0.16, 0.03, 1);
    var bobinler = K.ornekle(bobinGeo, bobinMat, [[-0.44, 2.72, T / 2 + 0.08], [-0.44, 2.3, T / 2 + 0.08], [0.47, 2.72, T / 2 + 0.08], [0.47, 2.3, T / 2 + 0.08]]);
    pmic.add(bobinler);
    var kondMat = K.mat('#b78a52', { roughness: 0.45, metalness: 0.1 });
    var kondGeo = K.yuvarlakKutuGeo(0.1, 0.05, 0.05, 0.01, 0);
    var kondKonum = [];
    for (var c = 0; c < 6; c++) kondKonum.push([-0.3 + c * 0.12, 2.05, T / 2 + 0.03]);
    pmic.add(K.ornekle(kondGeo, kondMat, kondKonum));
    g.add(pmic);

    // SPD hub (modül bilgisini tutan küçük çip) — alt orta
    var spd = K.kutu(0.3, 0.22, 0.05, K.mat('cip'), 0.01);
    K.parca(spd, 'spd', 'SPD hub', 'Modülün hız, gecikme ve kapasite bilgisini tutan küçük çip; anakart bunu okuyarak ayar yapar.');
    K.koy(g, spd, 0.02, 1.25, T / 2 + 0.03);

    // Etiket (−Z yüzü): kapasite ve tür (marka yok)
    var etiketDoku = K.canvasDoku(512, 160, function (ctx, w, h) {
      ctx.fillStyle = '#f4f5f7'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#111827'; ctx.textBaseline = 'middle';
      ctx.font = '800 58px Arial, sans-serif'; ctx.fillText(ops.kapasite || '16GB', 22, 48);
      ctx.font = '700 34px Arial, sans-serif'; ctx.fillText(ops.tur || '1Rx8 PC5-4800B', 22, 108);
      ctx.fillStyle = '#9ca3af'; ctx.fillRect(360, 20, 130, 60);
      ctx.fillStyle = '#f4f5f7';
      for (var b = 0; b < 26; b++) ctx.fillRect(365 + b * 5, 24, (b % 4) + 1, 52);
    });
    var etiket = K.duzlem(5.6, 1.75, new THREE.MeshStandardMaterial({ map: etiketDoku, roughness: 0.7 }));
    K.koy(g, etiket, 0.3, 1.9, -T / 2 - 0.004);
    etiket.rotation.y = Math.PI;
    K.parca(etiket, 'etiket', 'Etiket', 'Kapasite (ör. 16GB) ve tür/hız (PC5-4800 = DDR5, 4800 MT/s) yazar.');
    etiket.userData.golgeYok = true;

    var centik = new THREE.Object3D(); centik.name = 'centik';
    K.koy(g, centik, CENTIK_X, 0, 0);
    g.userData.centikX = CENTIK_X;
    g.userData.olcu = { L: L, H: H, T: T };
    return g;
  });
})(window.DON3D);
