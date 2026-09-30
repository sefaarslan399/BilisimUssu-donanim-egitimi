/* M-M2 — M.2 2280 SSD (22 × 80 mm), marka yok.
   Ölçü birimi: cm (8,0 × 0,08 PCB × 2,2). Orijin: kenar konnektörünün ortası, kartın alt yüzü.
   Kart +X yönünde uzanır (konnektör x = 0, vida yarım ayı x = 8,0); genişlik Z, kalınlık Y; çipler +Y (üst) yüzde.
   Kenar konnektörü: 75 pin konumu, her yüzde 0,5 mm aralık (üst yüz tek, alt yüz çift numaralı pinler).
   Üstten bakınca, konnektör aşağıda iken: 1. pin solda (−Z). M anahtarı = 59–66. pinler (çentik sağda, z ≈ +0,61 cm;
   sağında 5 temas kalır). B anahtarı = 12–19. pinler (çentik solda, z ≈ −0,56 cm; solunda 6 temas kalır).
   DOĞRULA: çentik genişliği/derinliği yaklaşık modellendi (≈ 1,3 × 3,8 mm); derste ölçü verilmez.
   ops: { anahtar: 'M' (varsayılan) | 'BM' (B+M, iki çentik), kapasite: '1 TB' }
   Parçalar: 'm2-kart', 'm2-temaslar' (kenar konnektörü), 'm2-centik-m' / 'm2-centik-b' (çentik işaretleri, boş nesne),
   'm2-denetleyici', 'm2-onbellek', 'm2-cip-0..1' (NAND), 'm2-vida-yuvasi' (yarım ay), 'm2-etiket'.
   userData: anahtar, cipler [Mesh] + cipIsik(i, 0..1), denetleyici + denetleyiciIsik(0..1), hepsiniSondur(),
     centikler: { M: Object3D, B?: Object3D } (çentik ağzının merkezi), vidaYuvasi: Object3D, olcu: { L, W, T } */
(function (D) {
  'use strict';
  var L = 8.0, W = 2.2, T = 0.08;
  var ADIM = 0.025;                         // ardışık pin konumu (üst/alt yüz dönüşümlü)
  function pinZ(n) { return -0.925 + (n - 1) * ADIM; }
  var CENTIK = { M: { bas: 59, son: 66 }, B: { bas: 12, son: 19 } };
  var CG = 0.13, CD = 0.38;                 // çentik genişliği, derinliği

  D.modelTanimla('M-M2', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var anahtar = ops.anahtar === 'BM' ? 'BM' : 'M';
    var centikler = anahtar === 'BM' ? ['B', 'M'] : ['M'];
    var g = new THREE.Group();
    K.parca(g, 'M-M2', 'M.2 SSD (2280)', 'Anakarttaki M.2 yuvasına doğrudan takılan ince, çubuk biçimli SSD. Kablo gerekmez.');

    // Kart dış hattı (dünya x,z → şekil x, −z)
    var s = new THREE.Shape();
    function P(x, z, ilk) { if (ilk) s.moveTo(x, -z); else s.lineTo(x, -z); }
    var r = 0.08;
    P(0, -W / 2 + r, true);
    centikler.forEach(function (a) {
      var zc = (pinZ(CENTIK[a].bas) + pinZ(CENTIK[a].son)) / 2;
      CENTIK[a].z = zc;
      P(0, zc - CG / 2); P(CD - CG / 2, zc - CG / 2);
      for (var i = 1; i < 6; i++) { var t = -Math.PI / 2 + i / 6 * Math.PI; P(CD - CG / 2 + Math.cos(t) * CG / 2, zc + Math.sin(t) * CG / 2); }
      P(CD - CG / 2, zc + CG / 2); P(0, zc + CG / 2);
    });
    P(0, W / 2 - r); P(r, W / 2);
    P(L - r, W / 2); P(L, W / 2 - r);
    var yr = 0.175;
    P(L, yr);
    for (var k = 1; k < 10; k++) { var a2 = Math.PI / 2 + k / 10 * Math.PI; P(L + Math.cos(a2) * yr, Math.sin(a2) * yr); }
    P(L, -yr);
    P(L, -W / 2 + r); P(L - r, -W / 2); P(r, -W / 2);
    var pcbDoku = K.canvasDoku(512, 160, function (ctx, w, h) {
      ctx.fillStyle = '#16181c'; ctx.fillRect(0, 0, w, h);
      var rr = K.rng(28);
      ctx.strokeStyle = 'rgba(120,140,160,0.22)'; ctx.lineWidth = 1;
      for (var i = 0; i < 70; i++) {
        var x = rr() * w, y = rr() * h;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rr() - 0.5) * 70, y); ctx.lineTo(x + (rr() - 0.5) * 70, y + (rr() - 0.5) * 40); ctx.stroke();
      }
    });
    pcbDoku.repeat.set(1 / L, 1 / W);
    pcbDoku.offset.set(0, 0.5);
    var kartGeo = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false, curveSegments: 6 });
    kartGeo.rotateX(-Math.PI / 2);
    var kart = new THREE.Mesh(kartGeo, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.55, metalness: 0.08 }));
    K.parca(kart, 'm2-kart', 'Kart', '22 mm eninde, 80 mm boyunda devre kartı: 2280 adı bu ölçülerden gelir.');
    g.add(kart);

    // Altın temaslar (üst: tek, alt: çift numaralı pinler; çentik pinleri yok)
    var temaslar = new THREE.Group();
    K.parca(temaslar, 'm2-temaslar', 'Kenar konnektörü', 'Yuvaya giren altın temaslar. Çentik, kartın yalnız doğru yuvaya ve doğru yönde girmesini sağlar.');
    var ustK = [], altK = [];
    for (var n = 1; n <= 75; n++) {
      var bosluk = centikler.some(function (a) { return n >= CENTIK[a].bas && n <= CENTIK[a].son; });
      if (bosluk) continue;
      if (n % 2) ustK.push([0.14, T + 0.002, pinZ(n)]); else altK.push([0.14, -0.002, pinZ(n)]);
    }
    var temasGeo = K.geoPaylas('m2-temas', function () { return new THREE.BoxGeometry(0.24, 0.004, 0.034); });
    var temasMat = K.mat('altin');
    temaslar.add(K.ornekle(temasGeo, temasMat, ustK), K.ornekle(temasGeo, temasMat, altK));
    temaslar.children.forEach(function (c) { c.userData.golgeYok = true; });
    g.add(temaslar);
    var centikNesne = {};
    centikler.forEach(function (a) {
      var o = new THREE.Object3D();
      K.parca(o, 'm2-centik-' + a.toLowerCase(), a + ' anahtarı (çentik)', a === 'M' ? 'M anahtarlı çentik: kart yalnız M anahtarlı yuvaya girer.' : 'B anahtarlı çentik: B+M kart iki tür yuvaya da girebilir.');
      o.position.set(0, T / 2, CENTIK[a].z);
      g.add(o);
      centikNesne[a] = o;
    });

    // Bileşenler (üst yüz)
    var denMat = new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.3, metalness: 0.45, emissive: new THREE.Color('#f59e0b'), emissiveIntensity: 0 });
    var den = new THREE.Mesh(K.yuvarlakKutuGeo(1.15, 0.12, 1.15, 0.03, 1), denMat);
    K.parca(den, 'm2-denetleyici', 'Denetleyici', 'SSD’nin küçük işlemcisi: veriyi bellek çiplerine dağıtır ve okur.');
    K.koy(g, den, 1.45, T + 0.06, 0);
    var onb = K.kutu(0.8, 0.1, 1.1, 'cip', 0.02);
    K.parca(onb, 'm2-onbellek', 'Önbellek çipi', 'Denetleyicinin kullandığı küçük, hızlı çalışma belleği.');
    K.koy(g, onb, 2.75, T + 0.05, 0);
    var cipler = [];
    [4.2, 6.05].forEach(function (x, i) {
      var m = new THREE.MeshStandardMaterial({ color: 0x121316, roughness: 0.5, metalness: 0.1, emissive: new THREE.Color('#22d3ee'), emissiveIntensity: 0 });
      var c = new THREE.Mesh(K.yuvarlakKutuGeo(1.55, 0.12, 1.3, 0.03, 1), m);
      K.parca(c, 'm2-cip-' + i, 'Bellek çipi (NAND)', 'Veri bu çiplerde elektrik yükü olarak saklanır; elektrik gidince silinmez.');
      K.koy(g, c, x, T + 0.06, 0);
      cipler.push(c);
    });
    // Küçük bileşenler
    var kucuk = [], rr = K.rng(9);
    for (var j = 0; j < 22; j++) kucuk.push([0.55 + rr() * 6.9, T + 0.025, (rr() < 0.5 ? -1 : 1) * (0.78 + rr() * 0.22)]);
    K.koy(g, K.ornekle(K.geoPaylas('m2-smd', function () { return new THREE.BoxGeometry(0.1, 0.05, 0.06); }), K.mat('#8a6d4e', { roughness: 0.5 }), kucuk), 0, 0, 0);

    // Vida yarım ayı: uçtaki yarım daire + altın halka
    var vida = new THREE.Group();
    K.parca(vida, 'm2-vida-yuvasi', 'Vida yuvası (yarım ay)', 'Kart yuvaya eğik takılır, sonra bastırılıp bu yarım aydan tek vidayla sabitlenir.');
    var halka = new THREE.Mesh(new THREE.RingGeometry(yr, yr + 0.11, 20, 1, Math.PI / 2, Math.PI), K.mat('altin'));
    halka.rotation.x = -Math.PI / 2;
    halka.position.y = T + 0.002;
    halka.userData.golgeYok = true;
    vida.add(halka);
    vida.position.set(L, 0, 0);
    g.add(vida);

    // Etiket (markasız)
    var etDoku = K.canvasDoku(256, 128, function (ctx, w, h) {
      ctx.fillStyle = '#e5e7eb'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#111827'; ctx.textBaseline = 'middle';
      ctx.font = '800 40px Arial, sans-serif'; ctx.fillText('M.2 2280', 14, 38);
      ctx.font = '900 42px Arial, sans-serif'; ctx.fillText(ops.kapasite || '1 TB', 14, 92);
    });
    var et = K.duzlem(1.25, 0.62, new THREE.MeshStandardMaterial({ map: etDoku, roughness: 0.6 }));
    et.rotation.x = -Math.PI / 2;
    et.userData.golgeYok = true;
    K.parca(et, 'm2-etiket', 'Etiket', 'Boy (2280) ve kapasite yazar.');
    K.koy(g, et, 7.25, T + 0.003, 0);
    et.rotation.set(-Math.PI / 2, 0, Math.PI / 2);

    g.userData.anahtar = anahtar;
    g.userData.cipler = cipler;
    g.userData.cipIsik = function (i, guc) { if (cipler[i]) cipler[i].material.emissiveIntensity = 1.1 * guc; };
    g.userData.denetleyici = den;
    g.userData.denetleyiciIsik = function (guc) { denMat.emissiveIntensity = 0.9 * guc; };
    g.userData.hepsiniSondur = function () { cipler.forEach(function (c) { c.material.emissiveIntensity = 0; }); denMat.emissiveIntensity = 0; };
    g.userData.centikler = centikNesne;
    g.userData.vidaYuvasi = vida;
    g.userData.olcu = { L: L, W: W, T: T };
    return g;
  });
})(window.DON3D);
