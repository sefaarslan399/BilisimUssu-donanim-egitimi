/* M-DIZUSTU — dizüstü bilgisayar; yan portlar görünür.  bagimli: M-ARKA-PANEL
   Ölçü birimi: cm. Orijin: gövde alt-orta. Ekran menteşesi arka kenarda (z = -D/2).
   Sol yan (−X): USB-C, HDMI, USB-A · Sağ yan (+X): USB-A, ses jakı (yeşil).
   ops.kapakAci: ekranın açılma açısı (derece, varsayılan 108). userData.kapak (menteşe grubu). */
(function (D) {
  'use strict';
  D.modelTanimla('M-DIZUSTU', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var W = 32, Dz = 22, H = 1.7;
    var g = new THREE.Group();
    K.parca(g, 'M-DIZUSTU', 'Dizüstü bilgisayar', 'Taşınabilir bilgisayar. Portları yanlarındadır.');
    var gMat = K.mat('#aeb4bd', { roughness: 0.4, metalness: 0.7 });
    var govde = K.kutu(W, H, Dz, gMat, 0.55, 3);
    K.koy(g, govde, 0, H / 2, 0);
    govde.userData.secilmez = true;
    // Klavye yüzeyi (canvas dokusu)
    var klavye = K.canvasDoku(512, 200, function (ctx, w, h) {
      ctx.fillStyle = '#9aa1ab'; ctx.fillRect(0, 0, w, h);
      var sat = [14, 14, 13, 12, 11], y = 8;
      sat.forEach(function (n, r) {
        var tw = (w - 16) / 14.6, x = 8 + (14 - n) * tw * 0.25;
        for (var i = 0; i < n; i++) {
          var gen = (r === 4 && i === 5) ? tw * 4 : tw * 0.88;
          ctx.fillStyle = '#23262c';
          K.yuvarlakDikdortgen(ctx, x, y, gen, 30, 4); ctx.fill();
          x += gen + tw * 0.12;
        }
        y += 38;
      });
    });
    var deck = K.duzlem(W - 3, 11.5, new THREE.MeshStandardMaterial({ map: klavye, roughness: 0.6, metalness: 0.2 }));
    K.koy(g, deck, 0, H + 0.01, -3.2, -Math.PI / 2).userData.secilmez = true;
    var tp = K.kutu(10, 0.02, 6, K.mat('#9ca3ad', { roughness: 0.3, metalness: 0.6 }), 0.01);
    K.koy(g, tp, 0, H + 0.01, 6.6).userData.secilmez = true;
    // Kapak + ekran
    var kapak = new THREE.Group();
    kapak.position.set(0, H, -Dz / 2 + 0.3);
    g.add(kapak);
    var kapakGovde = K.kutu(W, 0.6, Dz - 0.6, gMat, 0.28, 3);
    K.koy(kapak, kapakGovde, 0, 0.3, (Dz - 0.6) / 2).userData.secilmez = true;
    var ekranDoku = K.canvasDoku(512, 320, function (ctx, w, h) {
      var gr = ctx.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#0ea5e9'); gr.addColorStop(1, '#6366f1');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      K.yuvarlakDikdortgen(ctx, 60, 60, 230, 150, 10); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      K.yuvarlakDikdortgen(ctx, 310, 90, 140, 120, 10); ctx.fill();
      ctx.fillStyle = 'rgba(15,23,42,0.55)'; ctx.fillRect(0, h - 26, w, 26);
    });
    var ekran = K.duzlem(W - 2.4, Dz - 3.4, new THREE.MeshStandardMaterial({ map: ekranDoku, emissive: 0xffffff, emissiveMap: ekranDoku, emissiveIntensity: 0.55, roughness: 0.2 }));
    K.koy(kapak, ekran, 0, -0.01, (Dz - 0.6) / 2 + 0.2, Math.PI / 2);
    ekran.userData.secilmez = true;
    kapak.rotation.x = -THREE.MathUtils.degToRad(ops.kapakAci == null ? 108 : ops.kapakAci);
    g.userData.kapak = kapak;
    // Yan portlar
    var SOL = [['usbc', 7], ['hdmi', 3.6], ['usba-1', 0]], SAG = [['usba-2', 2], ['ses-yesil', -2.4]];
    var portlar = [];
    SOL.forEach(function (p) {
      var port = D.portYap(p[0], K);
      K.koy(g, port, -W / 2 + 0.02, H / 2, p[1]);
      port.rotation.y = -Math.PI / 2;
      portlar.push(port);
    });
    SAG.forEach(function (p) {
      var port = D.portYap(p[0], K);
      K.koy(g, port, W / 2 - 0.02, H / 2, p[1]);
      port.rotation.y = Math.PI / 2;
      portlar.push(port);
    });
    // Güç ışığı
    K.koy(g, K.kutu(0.5, 0.12, 0.2, K.led('#22c55e', 1.5), 0.05), -W / 2 + 3, H * 0.55, Dz / 2 + 0.01);
    g.userData.portlar = portlar;
    return g;
  });
})(window.DON3D);
