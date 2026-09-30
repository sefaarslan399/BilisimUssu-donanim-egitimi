/* M-AMPUL-SIRASI — deney panosu üzerinde ampul sırası (varsayılan 8), her ampulün önünde anahtar.
   Ölçü birimi: cm. Orijin: pano alt-orta. Ampuller X boyunca; soldaki ampul en büyük basamaktır (128).
   ops.adet: ampul sayısı (1–8).
   userData.ampuller: ampul grupları (ad 'ampul-0' … soldan sağa), her biri tıklanabilir.
   userData.ayarla(i, acik, sure) → Promise · userData.durum: [bool…] */
(function (D) {
  'use strict';
  var haleDokusu = null;
  function haleDoku(THREE) {
    if (haleDokusu) return haleDokusu;
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,214,120,0.95)'); g.addColorStop(0.4, 'rgba(255,190,80,0.45)'); g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    haleDokusu = new THREE.CanvasTexture(c);
    haleDokusu.colorSpace = THREE.SRGBColorSpace;
    return haleDokusu;
  }

  D.modelTanimla('M-AMPUL-SIRASI', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var n = Math.max(1, Math.min(8, ops.adet || 8));
    var ARA = 7.4;
    var g = new THREE.Group();
    K.parca(g, 'M-AMPUL-SIRASI', 'Ampul sırası', 'Her ampul bir bittir: yanıyorsa 1, sönükse 0.');
    var W = n * ARA + 2, Dz = 13;
    var pano = K.kutu(W, 2.2, Dz, 'plastikKoyu', 0.6);
    K.koy(g, pano, 0, 1.1, 0);
    pano.userData.secilmez = true;
    // Ön şerit (anahtarların durduğu açık gri bant)
    var serit = K.kutu(W - 1.2, 0.2, 3.6, 'plastikGri', 0.1);
    K.koy(g, serit, 0, 2.25, Dz / 2 - 2.4);
    serit.userData.secilmez = true;

    var camMat = new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.32, depthWrite: false });
    var ampuller = [], durum = [];
    for (var i = 0; i < n; i++) {
      var x = (i - (n - 1) / 2) * ARA;
      var a = new THREE.Group();
      K.parca(a, 'ampul-' + i, 'Ampul ' + (i + 1), 'Dokun: yak ya da söndür.');
      a.userData.indeks = i;
      // Duy (seramik) ve vida gövdesi
      K.koy(a, K.silindir(1.55, 1.4, 'plastikBeyaz', 24), 0, 0.7, 0);
      var vida = K.silindir(1.0, 1.7, 'aluminyumMat', 20);
      K.koy(a, vida, 0, 2.2, 0);
      for (var r = 0; r < 3; r++) K.koy(a, new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.07, 6, 20), K.mat('aluminyum')), 0, 1.6 + r * 0.45, 0).rotation.x = Math.PI / 2;
      // Cam: boyun + küre
      var boyun = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 0.98, 1.4, 24, 1, true), camMat);
      K.koy(a, boyun, 0, 3.7, 0);
      var kure = new THREE.Mesh(new THREE.SphereGeometry(2.25, 28, 20), camMat);
      K.koy(a, kure, 0, 6.0, 0);
      kure.userData.golgeYok = true; boyun.userData.golgeYok = true;
      kure.renderOrder = 2; boyun.renderOrder = 2;
      // Flaman (ışıyan tel) ve taşıyıcı teller
      var flamanMat = new THREE.MeshStandardMaterial({ color: 0x3a3530, emissive: new THREE.Color('#ffb347'), emissiveIntensity: 0, roughness: 0.5 });
      var flaman = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 6, 16, Math.PI), flamanMat);
      K.koy(a, flaman, 0, 5.9, 0);
      [-0.55, 0.55].forEach(function (tx) { K.koy(a, K.silindir(0.04, 2.6, 'celik', 6), tx, 4.6, 0); });
      // Işık halesi (yanınca görünür)
      var hale = new THREE.Sprite(new THREE.SpriteMaterial({ map: haleDoku(THREE), transparent: true, opacity: 0, depthWrite: false }));
      hale.material.toneMapped = false;
      hale.scale.set(9, 9, 1);
      hale.position.set(0, 6, 0);
      hale.userData.secilmez = true; hale.raycast = function () {};
      a.add(hale);
      // Anahtar (öne doğru)
      var anahtar = new THREE.Group();
      var yuva = K.kutu(2.0, 0.5, 1.6, 'plastikSiyah', 0.15);
      anahtar.add(yuva);
      var kol = K.kutu(1.4, 0.45, 0.9, K.mat('plastikBeyaz'), 0.12);
      kol.position.y = 0.4;
      anahtar.add(kol);
      anahtar.position.set(0, 2.45, Dz / 2 - 2.4 - 1.1);
      a.add(anahtar);
      a.userData.kol = kol; a.userData.flaman = flamanMat; a.userData.hale = hale; a.userData.cam = kure;
      a.position.set(x, 2.2, -1.2);
      // anahtar pano üstünde, ampulün önünde
      anahtar.position.set(0, 0.25, Dz / 2 - 2.4 + 1.2);
      g.add(a);
      ampuller.push(a); durum.push(false);
      kol.rotation.x = -0.35;
    }
    var camAcikMat = camMat.clone();
    camAcikMat.emissive = new THREE.Color('#ffd27a'); camAcikMat.emissiveIntensity = 0.55; camAcikMat.opacity = 0.5;

    function uygula(i, e) {
      var a = ampuller[i];
      a.userData.flaman.emissiveIntensity = 3.2 * e;
      a.userData.hale.material.opacity = 0.85 * e;
      a.userData.cam.material = e > 0.5 ? camAcikMat : camMat;
      a.userData.kol.rotation.x = -0.35 + 0.7 * e;
    }
    g.userData.ampuller = ampuller;
    g.userData.durum = durum;
    g.userData.ayarla = function (i, acik, sure) {
      var bas = durum[i] ? 1 : 0, son = acik ? 1 : 0;
      durum[i] = !!acik;
      if (bas === son) { uygula(i, son); return Promise.resolve(); }
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.25 : sure, anahtar: 'ampul', hedef: ampuller[i], ease: 'easeOutCubic',
        guncelle: function (e) { uygula(i, bas + (son - bas) * e); } });
    };
    ampuller.forEach(function (a, i) { uygula(i, 0); });
    return g;
  });
})(window.DON3D);
