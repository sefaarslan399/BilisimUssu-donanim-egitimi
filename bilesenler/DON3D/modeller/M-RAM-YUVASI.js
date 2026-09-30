/* M-RAM-YUVASI — DDR4 DIMM yuvası, iki uçta mandal (açık/kapalı durum).
   Ölçü birimi: cm (gövde ≈ 14,2 × 0,9 × 0,75). Orijin: anakart yüzeyinde, yuvanın ortası.
   Uzun kenar X; RAM −Y yönünde (yukarıdan aşağı) takılır. Yuvadaki çıkıntı RAM çentiğiyle hizalıdır.
   userData.oturma: RAM tam oturduğunda RAM orijininin yerel konumu (Vector3).
   userData.mandal(acik, sure) → Promise: mandalları açar/kapatır. userData.mandalAcik: durum.
   ops.kesit: true → ön duvar yarı saydam, çıkıntı açık renkte (yakın plan anlatım için). */
(function (D) {
  'use strict';
  D.modelTanimla('M-RAM-YUVASI', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-RAM-YUVASI', 'RAM yuvası', 'RAM modülünün takıldığı, iki ucunda mandal olan yuva.');
    var LB = 14.2, HB = 0.9, WB = 0.75, DERIN = 0.55;
    var govdeMat = K.mat(ops.renk || 'plastikSiyah');

    var govde = new THREE.Group();
    K.parca(govde, 'yuva-govde', 'Yuva', 'RAM temasları bu yarığa girer.');
    // Yarıklı gövde: iki yan duvar + taban
    var onDuvarMat = govdeMat;
    if (ops.kesit) {   // kesit görünümü: ön duvar yarı saydam, içteki çıkıntı görünür
      onDuvarMat = govdeMat.clone();
      onDuvarMat.transparent = true; onDuvarMat.opacity = 0.28; onDuvarMat.depthWrite = false;
    }
    var onDuvar = K.kutu(LB, HB, 0.25, onDuvarMat, 0.05);
    K.koy(govde, onDuvar, 0, HB / 2, WB / 2 - 0.125);
    if (ops.kesit) { onDuvar.renderOrder = 4; onDuvar.userData.golgeYok = true; onDuvar.castShadow = false; }
    K.koy(govde, K.kutu(LB, HB, 0.25, govdeMat, 0.05), 0, HB / 2, -WB / 2 + 0.125);
    K.koy(govde, K.kutu(LB, HB - DERIN, WB, govdeMat, 0.03), 0, (HB - DERIN) / 2, 0);
    // Uç blokları
    [-1, 1].forEach(function (sx) { K.koy(govde, K.kutu(0.35, HB, WB, govdeMat, 0.05), sx * (LB / 2 - 0.175), HB / 2, 0); });
    // Yarığın içi (koyu) ve çentik çıkıntısı
    var ic = K.kutu(LB - 0.7, 0.02, WB - 0.5, K.mat('#050506'));
    K.koy(govde, ic, 0, HB - DERIN + 0.01, 0);
    var centikX = (D.RAM_OLCU && D.RAM_OLCU.centikX) || 0.51;
    var cikinti = K.kutu(0.13, 0.36, WB - 0.5, ops.kesit ? K.mat('plastikAcik') : govdeMat);
    K.koy(govde, cikinti, centikX, HB - DERIN + 0.18, 0);
    K.parca(cikinti, 'cikinti', 'Yuvadaki çıkıntı', 'RAM\'in çentiği bu çıkıntıya denk gelmelidir.');
    g.add(govde);

    // Mandallar: alt uçtan dönen, üstte kanca
    var mandallar = [];
    [-1, 1].forEach(function (sx) {
      var piv = new THREE.Group();
      piv.position.set(sx * (LB / 2 + 0.05), 0.15, 0);
      var govdeM = K.kutu(0.32, 2.3, 0.85, K.mat(ops.mandalRenk || 'plastikAcik'), 0.08);
      govdeM.position.set(sx * 0.2, 1.15, 0);
      var kanca = K.kutu(0.5, 0.22, 0.85, K.mat(ops.mandalRenk || 'plastikAcik'), 0.06);
      kanca.position.set(-sx * 0.35, 2.15, 0);                 // RAM ucundaki girintiye oturur
      var tirnak = K.kutu(0.25, 0.55, 0.6, K.mat(ops.mandalRenk || 'plastikAcik'), 0.05);
      tirnak.position.set(sx * 0.45, 1.95, 0);
      piv.add(govdeM, kanca, tirnak);
      K.parca(piv, sx < 0 ? 'mandal-sol' : 'mandal-sag', 'Mandal', 'RAM\'i yerinde tutar. Açmak için dışa doğru bastırılır.');
      piv.userData.yon = sx;
      g.add(piv);
      mandallar.push(piv);
    });
    var ACI = 0.62;
    function uygula(e) { mandallar.forEach(function (m) { m.rotation.z = -m.userData.yon * ACI * e; }); }
    g.userData.mandalAcik = !!ops.acik;
    uygula(ops.acik ? 1 : 0);
    g.userData.mandal = function (acik, sure) {
      var bas = g.userData.mandalAcik ? 1 : 0, son = acik ? 1 : 0;
      g.userData.mandalAcik = !!acik;
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.35 : sure, anahtar: 'mandal', hedef: g, ease: acik ? 'easeOutCubic' : 'easeOutBack',
        guncelle: function (e) { uygula(bas + (son - bas) * e); } });
    };
    g.userData.oturma = new THREE.Vector3(0, HB - DERIN + 0.02, 0);
    g.userData.centikX = centikX;
    return g;
  });
})(window.DON3D);
