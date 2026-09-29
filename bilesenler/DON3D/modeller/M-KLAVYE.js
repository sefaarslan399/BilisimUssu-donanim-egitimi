/* M-KLAVYE — Türkçe Q düzenli, sayısal tuş takımı olmayan (TKL) kablolu klavye.
   Ölçü birimi: cm. Orijin: alt-orta. Arka (kablo çıkışı) −Z, kullanıcı tarafı +Z.
   'tus-A' ayrı parçadır (basma animasyonu için). 'kablo-cikis' kablo çapasıdır. */
(function (D) {
  'use strict';
  var U = 1.9;          // tuş aralığı (1u)
  var KAP = 1.72;       // tuş başlığı
  var SATIRLAR = [
    // [z, [ [genişlik(u), yazı] ... ]]  — boşluk için yazı null, gen. negatif
    [-5.0, [[1, 'Esc'], [-1], [1, 'F1'], [1, 'F2'], [1, 'F3'], [1, 'F4'], [-0.5], [1, 'F5'], [1, 'F6'], [1, 'F7'], [1, 'F8'], [-0.5], [1, 'F9'], [1, 'F10'], [1, 'F11'], [1, 'F12']]],
    [-2.9, [[1, '"'], [1, '1'], [1, '2'], [1, '3'], [1, '4'], [1, '5'], [1, '6'], [1, '7'], [1, '8'], [1, '9'], [1, '0'], [1, '*'], [1, '-'], [2, 'Sil']]],
    [-1.0, [[1.5, 'Tab'], [1, 'Q'], [1, 'W'], [1, 'E'], [1, 'R'], [1, 'T'], [1, 'Y'], [1, 'U'], [1, 'I'], [1, 'O'], [1, 'P'], [1, 'Ğ'], [1, 'Ü'], [1.5, 'Enter']]],
    [0.9, [[1.75, 'Caps'], [1, 'A'], [1, 'S'], [1, 'D'], [1, 'F'], [1, 'G'], [1, 'H'], [1, 'J'], [1, 'K'], [1, 'L'], [1, 'Ş'], [1, 'İ'], [1, ','], [1.25, '']]],
    [2.8, [[1.25, 'Shift'], [1, '<'], [1, 'Z'], [1, 'X'], [1, 'C'], [1, 'V'], [1, 'B'], [1, 'N'], [1, 'M'], [1, 'Ö'], [1, 'Ç'], [1, '.'], [2.75, 'Shift']]],
    [4.7, [[1.25, 'Ctrl'], [1.25, ''], [1.25, 'Alt'], [6.25, ''], [1.25, 'AltGr'], [1.25, 'Fn'], [1.25, ''], [1.25, 'Ctrl']]]
  ];
  var GEZINTI = [
    [-5.0, [[1, ''], [1, ''], [1, '']]],
    [-2.9, [[1, 'Ins'], [1, 'Home'], [1, 'PgUp']]],
    [-1.0, [[1, 'Del'], [1, 'End'], [1, 'PgDn']]],
    [2.8, [[-1], [1, '↑']]],
    [4.7, [[1, '←'], [1, '↓'], [1, '→']]]
  ];

  D.modelTanimla('M-KLAVYE', function (K) {
    var THREE = K.THREE;
    var g = new THREE.Group();
    K.parca(g, 'M-KLAVYE', 'Klavye', 'Harf, rakam ve komut girmeyi sağlayan girdi birimi.');
    var BW = 36.6, BD = 13.2, BH = 2.0;
    var govde = K.kutu(BW, BH, BD, 'plastikKoyu', 0.55);
    K.koy(g, govde, 0, BH / 2, 0);
    var ust = BH + 0.42;
    var x0 = -BW / 2 + 0.75;

    var tuslar = [], yazilar = [], tusA = null, tusAYazi = null;
    function satir(liste, xBas) {
      liste.forEach(function (sat) {
        var z = sat[0], x = xBas;
        sat[1].forEach(function (t) {
          var gen = t[0];
          if (gen < 0) { x += -gen * U; return; }
          var cx = x + gen * U / 2;
          if (t[1] === 'A') { tusA = [cx, z]; tusAYazi = 'A'; }
          else { tuslar.push([cx, ust, z, (gen * U - (U - KAP)) / KAP]); if (t[1]) yazilar.push([cx, z, t[1], gen]); }
          x += gen * U;
        });
      });
    }
    satir(SATIRLAR, x0);
    satir(GEZINTI, x0 + 15.5 * U);

    var tusGeo = K.yuvarlakKutuGeo(KAP, 0.8, KAP, 0.26, 1);
    var tusMat = K.mat('tus');
    var ornek = K.ornekle(tusGeo, tusMat, tuslar);
    ornek.name = 'tuslar';
    g.add(ornek);

    // Tuş yazıları: tek saydam doku (canvas ≤ 512 px)
    var doku = K.canvasDoku(512, 186, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#d7dbe1';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      yazilar.forEach(function (y) {
        var px = (y[0] / BW + 0.5) * w, pz = (y[1] / BD + 0.5) * h;
        var kisa = y[2].length === 1;
        ctx.font = (kisa ? '700 13px' : '600 8px') + ' Inter, Arial, sans-serif';
        ctx.fillText(y[2], px, pz);
      });
    });
    var yaziMat = new THREE.MeshBasicMaterial({ map: doku, transparent: true, depthWrite: false });
    var yaziDuzlem = new THREE.Mesh(new THREE.PlaneGeometry(BW, BD), yaziMat);
    yaziDuzlem.rotation.x = -Math.PI / 2;
    yaziDuzlem.position.y = ust + 0.41;
    yaziDuzlem.userData.golgeYok = true;
    yaziDuzlem.userData.vurguHaric = true;
    yaziDuzlem.raycast = function () {};
    g.add(yaziDuzlem);

    // A tuşu (ayrı parça + kendi yazısı)
    var a = new THREE.Group();
    K.parca(a, 'tus-A', 'A tuşu', 'Basınca bilgisayara “A” harfi gönderilir.');
    var aKap = new THREE.Mesh(tusGeo, K.mat('tus'));
    a.add(aKap);
    var aDoku = K.canvasDoku(64, 64, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#eef1f5';
      ctx.font = '800 40px Inter, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(tusAYazi, w / 2, h / 2 + 2);
    });
    var aYazi = new THREE.Mesh(new THREE.PlaneGeometry(KAP * 0.8, KAP * 0.8),
      new THREE.MeshBasicMaterial({ map: aDoku, transparent: true, depthWrite: false }));
    aYazi.rotation.x = -Math.PI / 2; aYazi.position.y = 0.41;
    aYazi.userData.vurguHaric = true; aYazi.userData.golgeYok = true;
    a.add(aYazi);
    K.koy(g, a, tusA[0], ust, tusA[1]);

    // Durum ışıkları
    for (var i = 0; i < 3; i++) {
      var l = K.kutu(0.5, 0.1, 0.2, i === 1 ? K.led('#7dd3fc', 1.2) : 'plastikSiyah');
      K.koy(g, l, BW / 2 - 4.6 + i * 1.2, BH + 0.05, -BD / 2 + 0.7);
    }
    // Arka ayaklar (hafif eğim)
    [-1, 1].forEach(function (sx) { K.koy(g, K.kutu(4, 0.6, 1.2, 'kaucuk', 0.2), sx * (BW / 2 - 4), 0.1, -BD / 2 + 1.2); });

    var cikis = new THREE.Object3D(); cikis.name = 'kablo-cikis';
    K.koy(g, cikis, 0, 1.0, -BD / 2 - 0.2);
    var kablo = K.kutu(1.2, 0.8, 0.8, 'plastikSiyah', 0.25);
    K.koy(g, kablo, 0, 1.0, -BD / 2 - 0.2);
    return g;
  });
})(window.DON3D);
