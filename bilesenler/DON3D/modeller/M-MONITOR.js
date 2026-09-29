/* M-MONITOR — 24" monitör (16:9), ayak, arka görüntü girişleri görünür.
   Ölçü birimi: cm. Orijin: ayağın alt-orta noktası, ekran +Z'ye bakar.
   userData.ekran: { mesh, doku, ciz(fn(ctx,w,h)), masaustu() } */
(function (D) {
  'use strict';
  function masaustuCiz(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#1e3a8a'); g.addColorStop(0.55, '#0e7490'); g.addColorStop(1, '#0f766e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // yumuşak tepeler (jenerik duvar kâğıdı)
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.moveTo(0, h * 0.72);
    ctx.bezierCurveTo(w * 0.3, h * 0.52, w * 0.55, h * 0.86, w, h * 0.6);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    // görev çubuğu
    ctx.fillStyle = 'rgba(15,23,42,0.82)'; ctx.fillRect(0, h - 22, w, 22);
    var renkler = ['#38bdf8', '#f59e0b', '#10b981', '#a78bfa', '#f472b6'];
    for (var i = 0; i < 5; i++) {
      ctx.fillStyle = renkler[i];
      D.kit.yuvarlakDikdortgen(ctx, w / 2 - 70 + i * 30, h - 18, 20, 14, 3); ctx.fill();
    }
    // masaüstü simgeleri
    for (var j = 0; j < 4; j++) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      D.kit.yuvarlakDikdortgen(ctx, 14, 14 + j * 42, 26, 26, 5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(12, 43 + j * 42, 30, 3);
    }
  }
  D.ekranMasaustu = masaustuCiz;

  D.modelTanimla('M-MONITOR', function (K) {
    var THREE = K.THREE;
    var g = new THREE.Group();
    K.parca(g, 'M-MONITOR', 'Monitör', 'Görüntüyü gösteren çıktı birimi.');
    var W = 54.4, H = 32.6, yMerkez = 28;

    // Ayak ve boyun
    var ayak = K.kutu(22, 1.0, 17, 'plastikKoyu', 0.45);
    K.koy(g, ayak, 0, 0.5, -3);
    var boyun = K.kutu(5, 19, 2.2, 'plastikKoyu', 0.6);
    K.koy(g, boyun, 0, 10.5, -6.2);
    K.parca(ayak, 'ayak', 'Ayak', 'Monitörü masada dengede tutar.');

    // Panel gövdesi ve arka kapak
    var panel = K.kutu(W, H, 1.6, 'plastikSiyah', 0.5);
    K.koy(g, panel, 0, yMerkez, -2);
    var arka = K.kutu(30, 20, 3.2, 'plastikSiyah', 1.3);
    K.koy(g, arka, 0, yMerkez - 1.5, -3.8);

    // Ekran yüzeyi (ışık yayan canvas dokusu)
    var doku = K.canvasDoku(512, 288, masaustuCiz);
    var ekranMat = new THREE.MeshStandardMaterial({
      color: 0x050608, emissive: 0xffffff, emissiveMap: doku, emissiveIntensity: 0.95, roughness: 0.2, metalness: 0
    });
    var ekran = K.duzlem(W - 1.6, H - 2.6, ekranMat);
    K.koy(g, ekran, 0, yMerkez + 0.5, -1.18);
    K.parca(ekran, 'ekran', 'Ekran', 'Görüntünün oluştuğu yüzey.');
    ekran.userData.golgeYok = true;

    // Alt çerçeve: güç düğmesi ve güç ışığı
    var led = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), K.led('#e2f3ff', 1.6));
    K.koy(g, led, W / 2 - 3, yMerkez - H / 2 + 0.55, -1.15);
    K.parca(led, 'guc-isigi');

    // Arka görüntü girişleri (alt yüzeye bakar)
    var girisler = new THREE.Group();
    K.parca(girisler, 'girisler', 'Görüntü girişleri', 'HDMI ve DisplayPort kabloları buraya takılır.');
    var yAlt = yMerkez - 1.5 - 10 + 0.02;
    var hdmi = K.kutu(1.5, 0.12, 0.6, 'cip'); K.koy(girisler, hdmi, -4, yAlt, -3.8);
    var dp = K.kutu(1.7, 0.12, 0.7, 'cip'); K.koy(girisler, dp, -1.6, yAlt, -3.8);
    var guc = K.kutu(1.2, 0.12, 0.9, 'cip'); K.koy(girisler, guc, 5, yAlt, -3.8);
    g.add(girisler);
    var girisNoktasi = new THREE.Object3D(); girisNoktasi.name = 'giris-noktasi';
    K.koy(g, girisNoktasi, -3, yAlt - 0.3, -3.8);

    g.userData.ekran = {
      mesh: ekran, doku: doku,
      ciz: function (fn) { doku.userData.ciz(fn); },
      masaustu: function () { doku.userData.ciz(masaustuCiz); ekranMat.emissiveMap = doku; ekranMat.needsUpdate = true; }
    };
    return g;
  });
})(window.DON3D);
