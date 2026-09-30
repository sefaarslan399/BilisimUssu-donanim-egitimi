/* M-USB-BELLEK — taşınabilir depolama: USB bellek (kapaklı, USB-A uçlu), SD kart, microSD kart. Marka yok.
   Ölçü birimi: cm. ops.tur: 'usb' (varsayılan) | 'sd' | 'microsd'
   Ortak düzen (M-KABLO-UCLARI ile uyumlu): orijin, yuvaya İLK giren uç kenarın ortası; gövde +Z yönünde uzanır.
     usb      : 5,8 × 1,8 × 0,85 (USB-A ucu 1,2 cm; ucun plastik dili alt yarıda — DON3D.fisTak ile porta takılabilir).
                ops.kapak: 'takili' (varsayılan) | 'yanda' (çıkarılmış, yanında durur) | 'yok'. ops.kapasite: '32 GB'
                Parçalar: 'usb-govde', 'usb-fis' (USB-A ucu), 'usb-kapak', 'usb-isik' (durum ışığı), 'usb-halka' (anahtarlık deliği).
                userData: giris (porta giren metal boy, cm), kapakAc(acik, sure) → Promise, isik(0..1)
     sd       : 2,4 (X) × 0,21 (Y) × 3,2 (Z), kart düz yatar; etiket +Y yüzünde, temaslar −Y yüzünde, pah +X köşesinde,
                yazma koruma kilidi −X kenarında. Parçalar: 'sd-kart', 'sd-temaslar', 'sd-kilit'. userData.kilit(acik) (kaydırır)
     microsd  : 1,1 × 0,1 × 1,5; +X kenarında basamak. Parçalar: 'microsd-kart', 'microsd-temaslar'.
   userData (hepsi): tur, olcu: { w, h, d } */
(function (D) {
  'use strict';

  function usb(K, ops, g) {
    var THREE = K.THREE;
    var FIS = 1.2, GL = 4.6, GW = 1.8, GH = 0.85;
    K.parca(g, 'M-USB-BELLEK', 'USB bellek', 'Cepte taşınan küçük depolama birimi. İçinde SSD’deki gibi bellek çipi vardır.');
    // USB-A ucu (metal kabuk + alt yarıda plastik dil + 4 temas)
    var fis = new THREE.Group();
    K.parca(fis, 'usb-fis', 'USB-A ucu', 'Bilgisayarın USB portuna takılan metal uç. Yalnız bir yönde girer.');
    K.koy(fis, K.kutu(1.2, 0.04, FIS, 'aluminyum'), 0, 0.21, FIS / 2);
    K.koy(fis, K.kutu(1.2, 0.04, FIS, 'aluminyum'), 0, -0.21, FIS / 2);
    K.koy(fis, K.kutu(0.04, 0.42, FIS, 'aluminyum'), -0.58, 0, FIS / 2);
    K.koy(fis, K.kutu(0.04, 0.42, FIS, 'aluminyum'), 0.58, 0, FIS / 2);
    K.koy(fis, K.kutu(1.08, 0.17, FIS - 0.1, 'plastikBeyaz', 0.02), 0, -0.1, FIS / 2 + 0.05);
    [-0.35, -0.12, 0.12, 0.35].forEach(function (x) { K.koy(fis, K.kutu(0.13, 0.01, 0.5, 'altin'), x, -0.01, 0.35); });
    K.koy(fis, K.kutu(0.18, 0.02, 0.18, 'plastikSiyah'), -0.3, 0.235, 0.45);
    K.koy(fis, K.kutu(0.18, 0.02, 0.18, 'plastikSiyah'), 0.3, 0.235, 0.45);
    g.add(fis);
    // Gövde (plastik, yuvarlatılmış), etiket, ışık, anahtarlık deliği
    var govde = new THREE.Group();
    K.parca(govde, 'usb-govde', 'Gövde', 'İçinde bellek çipi ve küçük bir denetleyici vardır; hareketli parça yoktur.');
    var renk = ops.renk || '#1e3a8a';
    K.koy(govde, K.kutu(GW, GH, GL, K.mat(renk, { roughness: 0.4, metalness: 0.1 }), 0.28, 3), 0, 0, FIS + GL / 2 - 0.05);
    // Uç tarafında metal yaka
    K.koy(govde, K.kutu(1.45, 0.62, 0.25, 'aluminyumMat', 0.06), 0, 0, FIS + 0.05);
    var etDoku = K.canvasDoku(256, 96, function (ctx, w, h) {
      ctx.fillStyle = '#e5e7eb'; K.yuvarlakDikdortgen(ctx, 0, 0, w, h, 18); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.font = '900 46px Arial, sans-serif'; ctx.fillText(ops.kapasite || '32 GB', w / 2, h / 2 + 2);
    });
    var et = K.duzlem(1.25, 0.47, new THREE.MeshStandardMaterial({ map: etDoku, roughness: 0.6, transparent: true }));
    et.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
    et.userData.golgeYok = true;
    K.koy(govde, et, 0, GH / 2 + 0.003, FIS + GL * 0.52);
    et.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
    var isikMat = K.led('#22c55e', 0.2);
    var isik = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), isikMat);
    K.parca(isik, 'usb-isik', 'Durum ışığı', 'Veri okunup yazılırken yanıp söner. Işık yanarken bellek çıkarılmaz.');
    K.koy(govde, isik, 0.5, GH / 2 - 0.02, FIS + GL - 0.75);
    g.add(govde);
    var halka = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 20), K.mat('aluminyum'));
    K.parca(halka, 'usb-halka', 'Anahtarlık deliği', 'Kaybolmasın diye anahtarlığa takılabilir.');
    halka.rotation.x = Math.PI / 2;
    K.koy(g, halka, 0, 0, FIS + GL + 0.05);
    // Kapak
    var kapak = null;
    if (ops.kapak !== 'yok') {
      kapak = new THREE.Group();
      K.parca(kapak, 'usb-kapak', 'Kapak', 'USB ucunu tozdan ve darbeden korur.');
      K.koy(kapak, K.kutu(GW, GH, 1.9, K.mat(renk, { roughness: 0.4, metalness: 0.1 }), 0.28, 3), 0, 0, 0);
      g.add(kapak);
    }
    var TAKILI = new K.V3(0, 0, 0.55), YANDA = new K.V3(GW + 0.9, -0.0, FIS + 0.8);
    var takili = ops.kapak !== 'yanda';
    if (kapak) { kapak.position.copy(takili ? TAKILI : YANDA); if (!takili) kapak.rotation.y = 0.35; }
    g.userData.giris = FIS;
    g.userData.kapakAc = function (acik, sure) {
      if (!kapak) return Promise.resolve();
      var b = kapak.position.clone(), r0 = kapak.rotation.y;
      var h = acik ? YANDA : TAKILI, r1 = acik ? 0.35 : 0;
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.8 : sure, anahtar: 'kapak', hedef: g, guncelle: function (e) {
        kapak.position.lerpVectors(b, h, e);
        kapak.position.z -= Math.sin(e * Math.PI) * 1.2;
        kapak.rotation.y = r0 + (r1 - r0) * e;
      } });
    };
    g.userData.isik = function (v) { isikMat.emissiveIntensity = 0.2 + 3 * v; };
    g.userData.olcu = { w: GW, h: GH, d: FIS + GL };
  }

  function kartSekli(THREE, noktalar) {
    var s = new THREE.Shape();
    noktalar.forEach(function (p, i) { if (i) s.lineTo(p[0], -p[1]); else s.moveTo(p[0], -p[1]); });
    return s;
  }

  function sd(K, ops, g) {
    var THREE = K.THREE;
    var w = 2.4, d = 3.2, h = 0.21, p = 0.4, r = 0.08;
    K.parca(g, 'M-USB-BELLEK', 'SD hafıza kartı', 'Fotoğraf makinesi gibi cihazlarda kullanılan hafıza kartı. İçinde bellek çipi vardır.');
    var s = kartSekli(THREE, [[-w / 2 + r, 0], [w / 2 - p, 0], [w / 2, p], [w / 2, d - r], [w / 2 - r, d], [-w / 2 + r, d], [-w / 2, d - r], [-w / 2, r], [-w / 2 + r, 0]]);
    var geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1 });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0.015, 0);
    var renk = ops.renk || '#1f2937';
    var kart = new THREE.Mesh(geo, K.mat(renk, { roughness: 0.45 }));
    K.parca(kart, 'sd-kart', 'SD kart', 'Parmak ucu kadar küçük; fotoğraf ve videoları saklar.');
    g.add(kart);
    var etDoku = K.canvasDoku(256, 320, function (ctx, cw, ch) {
      ctx.fillStyle = '#e5e7eb'; ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#2563eb'; ctx.fillRect(0, ch * 0.62, cw, ch * 0.38);
      ctx.fillStyle = '#111827'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.font = '900 88px Arial, sans-serif'; ctx.fillText('SD', cw / 2, ch * 0.28);
      ctx.fillStyle = '#fff'; ctx.font = '900 58px Arial, sans-serif'; ctx.fillText(ops.kapasite || '64 GB', cw / 2, ch * 0.81);
    });
    var et = K.duzlem(1.9, 2.3, new THREE.MeshStandardMaterial({ map: etDoku, roughness: 0.6 }));
    et.rotation.x = -Math.PI / 2;
    et.userData.golgeYok = true;
    K.koy(g, et, -0.05, h + 0.034, 1.85);
    et.rotation.set(-Math.PI / 2, 0, 0);
    var temas = new THREE.Group();
    K.parca(temas, 'sd-temaslar', 'Temaslar', 'Karttaki bilgiyi cihaza ileten altın temaslar (kartın arka yüzünde).');
    var tk = [];
    for (var i = 0; i < 9; i++) tk.push([-w / 2 + 0.25 + i * 0.235, -0.002, 0.3]);
    temas.add(K.ornekle(K.geoPaylas('sd-temas', function () { return new THREE.BoxGeometry(0.17, 0.006, 0.42); }), K.mat('altin'), tk));
    g.add(temas);
    var kilit = K.kutu(0.07, 0.12, 0.38, K.mat('#f8fafc', { roughness: 0.5 }), 0.02);
    K.parca(kilit, 'sd-kilit', 'Kilit (yazma koruması)', 'Aşağı kaydırılınca kart kilitlenir: dosyalar silinemez, yenisi yazılamaz.');
    K.koy(g, kilit, -w / 2 - 0.02, h / 2 + 0.015, 0.95);
    g.userData.kilit = function (kilitli) { kilit.position.z = kilitli ? 1.35 : 0.95; };
    g.userData.olcu = { w: w, h: h, d: d };
  }

  function microsd(K, ops, g) {
    var THREE = K.THREE;
    var w = 1.1, d = 1.5, h = 0.1, r = 0.05;
    K.parca(g, 'M-USB-BELLEK', 'microSD kart', 'Tırnak büyüklüğünde hafıza kartı; telefon ve tabletlerde kullanılır.');
    var s = kartSekli(THREE, [[-w / 2 + r, 0], [w / 2 - r, 0], [w / 2, r], [w / 2, 0.62], [w / 2 - 0.09, 0.7], [w / 2 - 0.09, 0.86], [w / 2 - 0.03, 0.9],
      [w / 2 - 0.03, d - r], [w / 2 - 0.03 - r, d], [-w / 2 + r, d], [-w / 2, d - r], [-w / 2, r], [-w / 2 + r, 0]]);
    var geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    var kart = new THREE.Mesh(geo, K.mat(ops.renk || '#111827', { roughness: 0.45 }));
    K.parca(kart, 'microsd-kart', 'microSD kart', 'Çok küçük olduğu için kolay kaybolur; önemli dosyanın tek kopyası burada tutulmamalı.');
    g.add(kart);
    // Tutma çıkıntısı (uçtaki kalınlık)
    K.koy(g, K.kutu(w - 0.06, 0.04, 0.12, K.mat(ops.renk || '#111827', { roughness: 0.45 }), 0.015), -0.015, h + 0.015, d - 0.08);
    var etDoku = K.canvasDoku(256, 256, function (ctx, cw, ch) {
      ctx.fillStyle = '#e5e7eb'; ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(0, ch * 0.6, cw, ch * 0.4);
      ctx.fillStyle = '#111827'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.font = '900 54px Arial, sans-serif'; ctx.fillText('micro', cw / 2, ch * 0.22);
      ctx.font = '900 70px Arial, sans-serif'; ctx.fillText('SD', cw / 2, ch * 0.44);
      ctx.fillStyle = '#fff'; ctx.font = '900 56px Arial, sans-serif'; ctx.fillText(ops.kapasite || '128 GB', cw / 2, ch * 0.8);
    });
    var et = K.duzlem(0.9, 1.1, new THREE.MeshStandardMaterial({ map: etDoku, roughness: 0.6 }));
    et.userData.golgeYok = true;
    K.koy(g, et, -0.03, h + 0.003, 0.75);
    et.rotation.set(-Math.PI / 2, 0, 0);
    var temas = new THREE.Group();
    K.parca(temas, 'microsd-temaslar', 'Temaslar', 'Kartın arka yüzündeki 8 altın temas.');
    var tk = [];
    for (var i = 0; i < 8; i++) tk.push([-w / 2 + 0.14 + i * 0.11, -0.002, 0.22]);
    temas.add(K.ornekle(K.geoPaylas('msd-temas', function () { return new THREE.BoxGeometry(0.08, 0.004, 0.3); }), K.mat('altin'), tk));
    g.add(temas);
    g.userData.olcu = { w: w, h: h, d: d };
  }

  D.modelTanimla('M-USB-BELLEK', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    var tur = ops.tur === 'sd' || ops.tur === 'microsd' ? ops.tur : 'usb';
    if (tur === 'usb') usb(K, ops, g); else if (tur === 'sd') sd(K, ops, g); else microsd(K, ops, g);
    g.userData.tur = tur;
    return g;
  });
})(window.DON3D);
