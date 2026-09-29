/* M-MASAUSTU-ACIK — yan kapağı açılabilen masaüstü kasa (okul atölyesindeki eski ofis bilgisayarı gibi).
   bagimli: M-MASAUSTU, M-RAM, M-RAM-YUVASI
   Sol yanda cam yerine çıkarılabilir metal yan kapak; arkada iki kelebek vida.
   İçeride 4 RAM yuvası (2. ve 4. yuvada RAM), anakart, işlemci + soğutucu, ekran kartı,
   SSD, güç kaynağı (örtünün altında, içi modellenmez), kasa fanı.
   ops.kapakAcik: true → yan kapak baştan sökülü (görünmez).
   userData.kapak: yan kapak grubu · userData.vidalar: [vida-1, vida-2]
   userData.yuvalar: RAM yuvaları · userData.ramlar: takılı RAM'ler */
(function (D) {
  'use strict';
  D.modelTanimla('M-MASAUSTU-ACIK', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = D.model('M-MASAUSTU', { acik: true });
    g.name = 'M-MASAUSTU-ACIK';
    K.parca(g, 'M-MASAUSTU-ACIK', 'Kasa', 'Yan kapağı açılınca iç parçalar görünür.');
    var o = g.userData.olcu;

    // Çıkarılabilir yan kapak + arka kelebek vidalar
    var kapak = new THREE.Group();
    K.parca(kapak, 'yan-kapak', 'Yan kapak', 'Arkadaki iki vida sökülünce geriye kaydırılıp çıkarılır.');
    var levha = K.kutu(0.45, o.gh - 1.4, o.Dp - 1.6, 'kasa', 0.15);
    kapak.add(levha);
    var tutamak = K.kutu(0.3, 6, 1.2, 'kasaIc', 0.1);
    K.koy(kapak, tutamak, -0.3, 0, -o.Dp / 2 + 2.6);
    kapak.position.set(-o.W / 2 + 0.22, o.ym, 0);
    g.add(kapak);

    var vidalar = [];
    [o.ym + 13, o.ym - 13].forEach(function (y, i) {
      var v = new THREE.Group();
      var bas = K.silindir(0.55, 0.45, 'celik', 16);
      bas.rotation.x = Math.PI / 2;
      v.add(bas);
      var govde = K.silindir(0.2, 0.8, 'celik', 10);
      govde.rotation.x = Math.PI / 2; govde.position.z = 0.55;
      v.add(govde);
      // tırtıl izleri (kavrama)
      for (var k = 0; k < 8; k++) {
        var t = K.kutu(0.08, 0.12, 0.44, 'celik');
        var a = (k / 8) * Math.PI * 2;
        t.position.set(Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0);
        t.rotation.z = a;
        v.add(t);
      }
      K.parca(v, 'vida-' + (i + 1), 'Kapak vidası', 'Yan kapağı arkadan tutar; saat yönünün tersine çevrilerek sökülür.');
      v.position.set(-o.W / 2 + 0.6, y, -o.Dp / 2 - 0.25);
      v.userData.baslangic = v.position.clone();
      g.add(v);
      vidalar.push(v);
    });

    // RAM yuvaları (anakart yüzeyinde, dikey) ve takılı RAM'ler
    var yuvalar = [], ramlar = [];
    var xYuzey = o.xTepsi - 0.1;
    [-4.9, -3.9, -2.9, -1.9].forEach(function (z, i) {
      var y = D.model('M-RAM-YUVASI', { renk: i % 2 ? 'plastikSiyah' : 'plastikKoyu' });
      y.name = 'ram-yuvasi-' + (i + 1);
      y.userData.etiket = 'RAM yuvası ' + (i + 1);
      y.rotation.z = Math.PI / 2;   // yerel +Y (takma yönünün tersi) → dünya −X
      y.position.set(xYuzey, 33.5, z);
      g.add(y);
      yuvalar.push(y);
      if (i === 1 || i === 3) {
        var r = D.model('M-RAM');
        r.name = 'ram-' + (ramlar.length + 1);
        r.position.copy(y.userData.oturma);
        y.add(r);
        y.userData.ram = r;
        ramlar.push(r);
      }
    });

    if (ops.kapakAcik) kapak.visible = false;
    g.userData.kapak = kapak;
    g.userData.vidalar = vidalar;
    g.userData.yuvalar = yuvalar;
    g.userData.ramlar = ramlar;
    return g;
  });
})(window.DON3D);
