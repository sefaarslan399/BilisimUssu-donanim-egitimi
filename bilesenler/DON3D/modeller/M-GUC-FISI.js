/* M-GUC-FISI — duvar prizi + topraklı fiş + güç kablosu (bilgisayarın güç kaynağına giden).
   Ölçü birimi: cm. Priz XY düzleminde, önü +Z; orijin priz merkezi. Kablo fişten −X yönünde uzanır.
   ops.kabloSon: [x,y,z] kablonun diğer ucu (priz yereline göre; varsayılan [-30,-10,20]).
   userData.fis (fiş grubu), userData.cek(sure) → Promise: fişi prizden çeker; userData.tak(sure). */
(function (D) {
  'use strict';
  D.modelTanimla('M-GUC-FISI', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-GUC-FISI', 'Priz ve fiş', 'Bilgisayarın elektriği buradan gelir.');
    var priz = new THREE.Group();
    K.parca(priz, 'priz', 'Duvar prizi', 'Elektrik buradan gelir. Çalışmadan önce fiş buradan çekilir.');
    K.koy(priz, K.kutu(8, 8, 1, 'plastikBeyaz', 0.8, 3), 0, 0, 0.5);
    var yuva = K.silindir(2.9, 0.6, K.mat('#d7dade'), 32); yuva.rotation.x = Math.PI / 2;
    K.koy(priz, yuva, 0, 0, 0.8);
    [-1.0, 1.0].forEach(function (x) { var d = K.silindir(0.3, 0.4, 'plastikSiyah', 12); d.rotation.x = Math.PI / 2; K.koy(priz, d, x, 0, 1.05); });
    g.add(priz);
    var fis = new THREE.Group();
    K.parca(fis, 'fis', 'Fiş', 'Tutup çekilir; kablodan asılarak çekilmez.');
    var fg = K.silindir(2.6, 2.4, 'plastikSiyah', 28, 2.2); fg.rotation.x = Math.PI / 2;
    K.koy(fis, fg, 0, 0, 1.2);
    var tut = K.kutu(2.4, 3.4, 3.2, 'plastikSiyah', 0.8); K.koy(fis, tut, 0, 0, 3.6);
    g.add(fis);
    var TAKILI_Z = 1.1, CEKILI_Z = 9;
    fis.position.z = TAKILI_Z;
    var son = new THREE.Vector3().fromArray(ops.kabloSon || [-30, -10, 20]);
    var kablo = null;
    function kabloCiz() {
      if (kablo) { g.remove(kablo); kablo.geometry.dispose(); }
      var b = new THREE.Vector3(0, 0, fis.position.z + 5);
      kablo = K.kablo([b, b.clone().add(new THREE.Vector3(0, -1, 4)), new THREE.Vector3(son.x * 0.4, son.y - 4, (b.z + son.z) / 2 + 6), son], 0.4, 'kablo');
      kablo.userData.secilmez = true;
      g.add(kablo);
    }
    kabloCiz();
    function git(z, sure) {
      var z0 = fis.position.z;
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.8 : sure, anahtar: 'fis', hedef: fis, ease: 'easeInOutCubic',
        guncelle: function (e) { fis.position.z = z0 + (z - z0) * e; kabloCiz(); } });
    }
    g.userData.fis = fis;
    g.userData.cek = function (sure) { return git(CEKILI_Z, sure); };
    g.userData.tak = function (sure) { return git(TAKILI_Z, sure); };
    return g;
  });
})(window.DON3D);
