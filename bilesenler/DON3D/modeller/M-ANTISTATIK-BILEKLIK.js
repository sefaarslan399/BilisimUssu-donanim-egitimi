/* M-ANTISTATIK-BILEKLIK — antistatik bileklik: bileğe sarılan bant, metal temas düğmesi, sarmal kablo, timsah (krokodil) klips.
   Ölçü birimi: cm. Orijin: bant merkezi (bant XZ düzleminde yatar). Klips +X yönünde, kablonun ucunda.
   userData.klips (klips grubu, yerel konumu klipsKonum), userData.kabloGuncelle(hedefV3): kabloyu klipse yeniden çizer. */
(function (D) {
  'use strict';
  D.modelTanimla('M-ANTISTATIK-BILEKLIK', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-ANTISTATIK-BILEKLIK', 'Antistatik bileklik', 'Vücuttaki statik elektriği kablo yoluyla kasaya aktarır.');
    // Bant
    var bant = new THREE.Group();
    K.parca(bant, 'bileklik-bant', 'Bileklik bandı', 'Bileğe sıkıca, deriye değecek şekilde takılır.');
    var bantMesh = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.5, 12, 40), K.mat('#2563eb', { roughness: 0.8 }));
    bantMesh.rotation.x = Math.PI / 2;
    bantMesh.scale.set(1, 1, 0.35);
    bant.add(bantMesh);
    // iletken iplik çizgileri
    var cizgi = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.52, 6, 40, Math.PI * 2), K.mat('#1e3a8a', { roughness: 0.6, wireframe: true }));
    cizgi.rotation.x = Math.PI / 2; cizgi.scale.set(1, 1, 0.36);
    bant.add(cizgi);
    // Metal düğme (kablonun takıldığı yer)
    var dugme = K.silindir(0.75, 0.5, 'aluminyum', 20);
    dugme.rotation.z = Math.PI / 2;
    K.koy(bant, dugme, 3.55, 0, 0);
    g.add(bant);
    // Klips
    var klips = new THREE.Group();
    K.parca(klips, 'bileklik-klips', 'Krokodil klips', 'Kasanın boyasız metal bir yerine takılır.');
    var ceneMat = K.mat('#dc2626', { roughness: 0.5 });
    var ust = K.kutu(3.4, 0.5, 1.0, ceneMat, 0.2); K.koy(klips, ust, 1.7, 0.35, 0).rotation.z = -0.08;
    var alt = K.kutu(3.4, 0.5, 1.0, ceneMat, 0.2); K.koy(klips, alt, 1.7, -0.35, 0).rotation.z = 0.08;
    [0.4, 1.0].forEach(function (x) { K.koy(klips, K.kutu(0.12, 0.3, 0.9, 'aluminyum'), 3.3 - x * 0.1, 0.05 - x * 0.02, 0); });
    K.koy(klips, K.kutu(1.0, 0.5, 0.9, 'aluminyum'), 3.55, 0, 0);
    var klipsKonum = new THREE.Vector3(ops.klipsX || 14, 0, ops.klipsZ || 4);
    klips.position.copy(klipsKonum);
    g.add(klips);
    // Sarmal kablo
    var kablo = null;
    function kabloCiz(hedef) {
      if (kablo) { g.remove(kablo); kablo.geometry.dispose(); }
      var bas = new THREE.Vector3(4.1, 0, 0), son = hedef.clone();
      var pts = [], n = 90, tur = 11;
      for (var i = 0; i <= n; i++) {
        var t = i / n, p = bas.clone().lerp(son, t);
        var a = t * tur * Math.PI * 2, r = 0.45 * Math.sin(Math.PI * Math.min(1, t * 1.2));
        p.y += Math.sin(a) * r - Math.sin(Math.PI * t) * 1.2; p.z += Math.cos(a) * r;
        pts.push(p);
      }
      kablo = K.kablo(pts, 0.12, K.mat('#1f2937', { roughness: 0.5 }));
      kablo.userData.secilmez = true;
      g.add(kablo);
    }
    kabloCiz(klipsKonum);
    g.userData.klips = klips;
    g.userData.klipsKonum = klipsKonum;
    g.userData.kabloGuncelle = function (hedef) { kabloCiz(hedef || klips.position); };
    return g;
  });
})(window.DON3D);
