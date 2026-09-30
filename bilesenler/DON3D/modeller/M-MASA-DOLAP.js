/* M-MASA-DOLAP — RAM benzetmesi: çalışma masası (RAM) + dosya dolabı (depolama) + dosya kartları.
   Ölçü birimi: cm. Orijin: zemin, masanın ortası. Masanın önü +Z; dolap masanın sağında (+X), önleri hizalı.
   Masa: yükseklik 75, meşe kaplama üst tabla, koyu metal ayaklar, üstünde sümen (kart yuvaları basılı), masa lambası, kalemlik.
     ops.masaBoyu: 'kucuk' (80 × 55, 4 yuva = 4 GB) · 'orta' (120 × 65, 8 yuva = 8 GB, varsayılan) · 'buyuk' (160 × 80, 16 yuva = 16 GB).
     4 / 8 / 16 sayıları da kabul edilir.
   Dolap: 46 × 55 × 102, üç çekmece (üstten: 0 Programlar, 1 Belgeler, 2 Medya); içlerinde askılı dosyalar.
   Kart: 22 × 16 × 0,4 dosya kartı; üst yüzünde uygulama simgesi ve adı (canvas, emoji yok).
     Türler: tarayici, oyun, muzik, odev, foto, goruntulu, cizim, video, sistem (D.MASA_KART_TURLERI).
   Parçalar: 'masa' (Çalışma masası), 'dolap' (Dosya dolabı), 'cekmece-0..2', 'lamba', 'sumen', kartlar 'kart-<tür>'.
   userData API (hepsi Promise döner, süreler sn; hareket azaltmada kısalır):
     boy, kapasite (4|8|16), yuvalar [Vector3], masadakiler [kart|null], olcu {W, D, H}
     kartYap(tur) → kart (sahneye eklenmez)
     dolaptanMasaya(tur|kart, {yuva, cekmece, sure}) → Promise<kart|null>  masada boş yuva yoksa null.
        Tür verilirse dolaptan yeni kart (kopya) çıkar; dolaptaki bir kart verilirse o kart masaya taşınır.
     masadanDolaba(kart, {cekmece, sure}) → Promise<kart>  kart çekmeceye girer ve orada kalır.
     masayaKoy(tur, yuva) → kart | null: animasyonsuz yerleştirir (başlangıç durumu için).
     kopyala(kart) → aynı yerde yeni kart (ör. "kaydet": kopya dolaba gider).
     cekmece(i, acik, sure) → Promise · lamba(acik, sure) → Promise
     gucKes(sure) → Promise<kaybolanSayisi>: lamba söner, masadaki kartlar solup kaybolur; dolaptakiler kalır.
     gucVer(sure) → Promise: lamba yanar.
     boyut(boy, sure) → Promise: masa büyür/küçülür; kartlar yeni yuvalara kayar (sığmayanlar solar).
     bosYuva() → indeks | −1 · temizle(): tüm kartları kaldırır, çekmeceleri kapatır. */
(function (D) {
  'use strict';
  var BOYLAR = {
    kucuk: { W: 80, D: 55, sutun: 2, satir: 2, gb: 4 },
    orta: { W: 120, D: 65, sutun: 4, satir: 2, gb: 8 },
    buyuk: { W: 160, D: 80, sutun: 4, satir: 4, gb: 16 }
  };
  var GB_BOY = { 4: 'kucuk', 8: 'orta', 16: 'buyuk' };
  var KW = 22, KD = 16, KT = 0.4, ARA = 3;
  var MH = 75, UST_K = 3, SUMEN_K = 0.3;
  var DW = 46, DD = 55, DH = 102, CEK_H = 31, CEK_ACIK = 30;
  var TUR = {
    tarayici: { ad: 'Tarayıcı', renk: '#2563eb', cekmece: 0 },
    oyun: { ad: 'Oyun', renk: '#7c3aed', cekmece: 0 },
    goruntulu: { ad: 'Görüntülü ders', renk: '#0891b2', cekmece: 0 },
    cizim: { ad: 'Çizim', renk: '#ea580c', cekmece: 0 },
    sistem: { ad: 'İşletim sistemi', renk: '#475569', cekmece: 0 },
    odev: { ad: 'Ödev', renk: '#d97706', cekmece: 1 },
    muzik: { ad: 'Müzik', renk: '#db2777', cekmece: 2 },
    foto: { ad: 'Fotoğraf', renk: '#059669', cekmece: 2 },
    video: { ad: 'Video', renk: '#dc2626', cekmece: 2 }
  };
  D.MASA_KART_TURLERI = TUR;

  /* Uygulama simgeleri (canvas yolu; emoji yok) */
  function simgeCiz(ctx, tur, x, y, r, renk) {
    ctx.save(); ctx.translate(x, y);
    ctx.strokeStyle = renk; ctx.fillStyle = renk; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var P = Math.PI;
    if (tur === 'tarayici') {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, P * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.45, r, 0, 0, P * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(-r * 0.86, -r * 0.5); ctx.lineTo(r * 0.86, -r * 0.5);
      ctx.moveTo(-r * 0.86, r * 0.5); ctx.lineTo(r * 0.86, r * 0.5); ctx.stroke();
    } else if (tur === 'oyun') {
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 0.45); ctx.lineTo(r * 0.6, -r * 0.45);
      ctx.quadraticCurveTo(r * 1.05, -r * 0.45, r * 1.1, r * 0.2); ctx.quadraticCurveTo(r * 1.15, r * 0.75, r * 0.75, r * 0.7);
      ctx.lineTo(r * 0.35, r * 0.3); ctx.lineTo(-r * 0.35, r * 0.3); ctx.lineTo(-r * 0.75, r * 0.7);
      ctx.quadraticCurveTo(-r * 1.15, r * 0.75, -r * 1.1, r * 0.2); ctx.quadraticCurveTo(-r * 1.05, -r * 0.45, -r * 0.6, -r * 0.45);
      ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(-r * 0.72, -r * 0.1, r * 0.4, r * 0.12); ctx.fillRect(-r * 0.58, -r * 0.24, r * 0.12, r * 0.4);
      ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.12, r * 0.09, 0, P * 2); ctx.arc(r * 0.65, r * 0.06, r * 0.09, 0, P * 2); ctx.fill();
    } else if (tur === 'muzik') {
      ctx.beginPath(); ctx.ellipse(-r * 0.45, r * 0.55, r * 0.3, r * 0.22, -0.4, 0, P * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r * 0.55, r * 0.35, r * 0.3, r * 0.22, -0.4, 0, P * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-r * 0.2, r * 0.5); ctx.lineTo(-r * 0.2, -r * 0.7); ctx.lineTo(r * 0.8, -r * 0.9); ctx.lineTo(r * 0.8, r * 0.3); ctx.stroke();
    } else if (tur === 'odev') {
      ctx.strokeRect(-r * 0.7, -r, r * 1.4, r * 2);
      ctx.lineWidth = r * 0.1;
      for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-r * 0.45, -r * 0.55 + i * r * 0.38); ctx.lineTo(r * (i === 3 ? 0.1 : 0.45), -r * 0.55 + i * r * 0.38); ctx.stroke(); }
    } else if (tur === 'foto') {
      ctx.strokeRect(-r, -r * 0.75, r * 2, r * 1.5);
      ctx.beginPath(); ctx.moveTo(-r * 0.85, r * 0.6); ctx.lineTo(-r * 0.25, -r * 0.1); ctx.lineTo(r * 0.15, r * 0.3); ctx.lineTo(r * 0.45, 0); ctx.lineTo(r * 0.85, r * 0.6); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.5, -r * 0.4, r * 0.16, 0, P * 2); ctx.fill();
    } else if (tur === 'goruntulu') {
      K_yuvarlak(ctx, -r, -r * 0.55, r * 1.35, r * 1.1, r * 0.2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.1); ctx.lineTo(r, -r * 0.45); ctx.lineTo(r, r * 0.45); ctx.lineTo(r * 0.45, r * 0.1); ctx.closePath(); ctx.fill();
    } else if (tur === 'cizim') {
      ctx.beginPath(); ctx.moveTo(-r * 0.8, r * 0.8); ctx.lineTo(r * 0.55, -r * 0.55); ctx.stroke();
      ctx.lineWidth = r * 0.34; ctx.beginPath(); ctx.moveTo(r * 0.35, -r * 0.35); ctx.lineTo(r * 0.75, -r * 0.75); ctx.stroke();
      ctx.beginPath(); ctx.arc(-r * 0.8, r * 0.8, r * 0.16, 0, P * 2); ctx.fill();
    } else if (tur === 'video') {
      K_yuvarlak(ctx, -r, -r * 0.72, r * 2, r * 1.44, r * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.4); ctx.lineTo(r * 0.5, 0); ctx.lineTo(-r * 0.3, r * 0.4); ctx.closePath(); ctx.fill();
    } else {                                   // sistem: dişli
      ctx.beginPath();
      for (var k = 0; k < 16; k++) { var a = k / 16 * P * 2, rr = k % 2 ? r * 0.72 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, P * 2); ctx.fill();
    }
    ctx.restore();
  }
  function K_yuvarlak(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  D.modelTanimla('M-MASA-DOLAP', function (K, ops) {
    var THREE = K.THREE, V3 = K.V3;
    ops = ops || {};
    var boy = GB_BOY[ops.masaBoyu] || (BOYLAR[ops.masaBoyu] ? ops.masaBoyu : 'orta');
    var B = BOYLAR[boy];
    var g = new THREE.Group();
    K.parca(g, 'M-MASA-DOLAP', 'Masa ve dolap', 'Benzetme: masa RAM’dir, dolap depolamadır.');

    function tw(sure, fn, ease) { return D.tween({ sahne: D.sahneBul(g), sure: sure, guncelle: fn, ease: ease }); }

    /* ── Masa ── */
    var masa = new THREE.Group();
    K.parca(masa, 'masa', 'Çalışma masası', 'Benzetmede RAM: açık dosyalar çalışırken masada durur.');
    g.add(masa);
    var ahsap = K.canvasDoku(512, 256, function (ctx, w, h) {
      var gr = ctx.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#c89464'); gr.addColorStop(0.5, '#d4a373'); gr.addColorStop(1, '#c08a5a');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      var r = K.rng(7);
      for (var i = 0; i < 70; i++) {
        var y = r() * h, a = 0.05 + r() * 0.12;
        ctx.strokeStyle = 'rgba(' + (r() > 0.5 ? '120,74,40,' : '236,196,150,') + a + ')';
        ctx.lineWidth = 0.6 + r() * 1.8;
        ctx.beginPath(); ctx.moveTo(0, y);
        for (var x = 0; x <= w; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.011 + i) * (2 + r() * 3));
        ctx.stroke();
      }
    });
    var ustMat = new THREE.MeshStandardMaterial({ map: ahsap, roughness: 0.55, metalness: 0 });
    var kenarMat = K.mat('#6b4a2f', { roughness: 0.5 });
    var ayakMat = K.mat('#3a3d44', { roughness: 0.38, metalness: 0.7 });
    var ust = K.kutu(B.W, UST_K, B.D, ustMat, 0.6);
    ust.position.set(0, MH - UST_K / 2, 0);
    masa.add(ust);
    var ayaklar = [];
    for (var a = 0; a < 4; a++) {
      var ay = K.kutu(4, MH - UST_K, 4, ayakMat, 0.8);
      ayaklar.push(ay); masa.add(ay);
    }
    var cerceve = K.kutu(1, 6, 2, ayakMat, 0.3);           // arka kuşak (ölçeklenir)
    masa.add(cerceve);
    var onPanel = K.kutu(1, 26, 1.2, kenarMat, 0.3);      // arka etek paneli
    masa.add(onPanel);
    function masaDuzen(W, Dz, olcekle) {
      if (olcekle) {                                      // animasyon sırasında: üst tabla ölçeklenir
        ust.scale.set(W / olcekle.W, 1, Dz / olcekle.D);
      } else {
        ust.geometry = K.yuvarlakKutuGeo(W, UST_K, Dz, 0.6, 2); ust.scale.set(1, 1, 1);
      }
      var ax = W / 2 - 5, az = Dz / 2 - 5;
      [[-ax, -az], [ax, -az], [-ax, az], [ax, az]].forEach(function (p, i) { ayaklar[i].position.set(p[0], (MH - UST_K) / 2, p[1]); });
      cerceve.scale.set(W - 10, 1, 1); cerceve.position.set(0, MH - UST_K - 3, -az);
      onPanel.scale.set(W - 14, 1, 1); onPanel.position.set(0, MH - UST_K - 17, -az + 1.5);
    }

    /* Sümen: kart yuvaları basılı (kapasiteyi gösterir) */
    var sumenDokular = {};
    function sumenDoku(b) {
      if (sumenDokular[b]) return sumenDokular[b];
      var S = BOYLAR[b], gw = S.sutun * KW + (S.sutun - 1) * ARA + 6, gd = S.satir * KD + (S.satir - 1) * ARA + 6;
      var px = 512, py = Math.round(512 * gd / gw);
      sumenDokular[b] = K.canvasDoku(px, py, function (ctx, w, h) {
        ctx.fillStyle = '#2f4a3f'; ctx.fillRect(0, 0, w, h);
        var o = w / gw;
        ctx.strokeStyle = 'rgba(214,236,222,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([7, 6]);
        for (var i = 0; i < S.sutun; i++) {
          for (var j = 0; j < S.satir; j++) {
            K_yuvarlak(ctx, (3 + i * (KW + ARA)) * o + 1, (3 + j * (KD + ARA)) * o + 1, KW * o - 2, KD * o - 2, 6); ctx.stroke();
          }
        }
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(214,236,222,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(3, 3, w - 6, h - 6);
      });
      return sumenDokular[b];
    }
    var sumenMat = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
    var sumen = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sumenMat);
    sumen.rotation.x = -Math.PI / 2;
    K.parca(sumen, 'sumen', 'Sümen', 'Kesikli çizgiler masaya kaç dosya sığdığını gösterir.');
    sumen.userData.golgeYok = true;
    masa.add(sumen);

    var yuvalar = [], masadakiler = [], gridMerkez = new V3();
    function yuvaHesap(b, W, Dz) {
      var S = BOYLAR[b];
      var gw = S.sutun * KW + (S.sutun - 1) * ARA, gd = S.satir * KD + (S.satir - 1) * ARA;
      var cx = 4, cz = Dz / 2 - 4 - gd / 2;
      var l = [];
      for (var j = 0; j < S.satir; j++) {
        for (var i = 0; i < S.sutun; i++) {
          l.push(new V3(cx - gw / 2 + KW / 2 + i * (KW + ARA), MH + SUMEN_K + KT / 2, cz - gd / 2 + KD / 2 + j * (KD + ARA)));
        }
      }
      return { l: l, cx: cx, cz: cz, gw: gw + 6, gd: gd + 6 };
    }
    function sumenKur(b, W, Dz) {
      var y = yuvaHesap(b, W, Dz);
      sumen.scale.set(y.gw, y.gd, 1);
      sumen.position.set(y.cx, MH + 0.02, y.cz);
      sumenMat.map = sumenDoku(b); sumenMat.needsUpdate = true;
      gridMerkez.set(y.cx, MH, y.cz);
      return y.l;
    }

    /* Lamba (elektrik göstergesi) ve kalemlik */
    var lamba = new THREE.Group();
    K.parca(lamba, 'lamba', 'Masa lambası', 'Elektrik varken yanar.');
    var lMat = K.mat('#2f3a4a', { roughness: 0.35, metalness: 0.55 });
    K.koy(lamba, K.silindir(7, 1.6, lMat, 28), 0, 0.8, 0);
    var kol1 = K.silindir(0.7, 30, lMat, 10); K.koy(lamba, kol1, 0, 15, 0, 0, 0, -0.35).position.x = 5.1;
    var eklem = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 10), lMat); K.koy(lamba, eklem, 10.3, 29, 0);
    var kol2 = K.silindir(0.7, 20, lMat, 10); K.koy(lamba, kol2, 4, 35.5, 0, 0, 0, 1.0);
    var bas = new THREE.Group(); K.koy(lamba, bas, -4.6, 40, 0, 0, 0, 0.55);
    var sapka = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 6.5, 8, 28, 1, true), K.mat('#2f3a4a', { roughness: 0.35, metalness: 0.55, side: THREE.DoubleSide }));
    K.koy(bas, sapka, 0, -3, 0);
    K.koy(bas, K.silindir(2.6, 1.4, lMat, 20), 0, 1.4, 0);
    var ampulMat = K.led('#ffd49a', 2.2);
    var ampul = new THREE.Mesh(new THREE.SphereGeometry(2.3, 16, 12), ampulMat);
    K.koy(bas, ampul, 0, -5, 0);
    ampul.userData.golgeYok = true;
    masa.add(lamba);
    var kalemlik = new THREE.Group();
    K.koy(kalemlik, K.silindir(4, 10, K.mat('#c2410c', { roughness: 0.6 }), 24), 0, 5, 0);
    [['#2563eb', -1.4, 0.6, 0.18], ['#fbbf24', 1.2, -0.8, -0.16], ['#16a34a', 0.2, 1.4, 0.08]].forEach(function (k) {
      K.koy(kalemlik, K.silindir(0.45, 16, K.mat(k[0], { roughness: 0.5 }), 8), k[1], 9, k[2], k[3], 0, k[3] * 0.8);
    });
    masa.add(kalemlik);
    function aksesuarDuzen(W, Dz) {
      lamba.position.set(-W / 2 + 12, MH, -Dz / 2 + 11);
      kalemlik.position.set(W / 2 - 10, MH, -Dz / 2 + 9);
    }

    /* ── Dosya dolabı ── */
    var dolap = new THREE.Group();
    K.parca(dolap, 'dolap', 'Dosya dolabı', 'Benzetmede depolama: dosyalar kalıcı olarak burada saklanır.');
    g.add(dolap);
    var dMat = K.mat('#cfc8ba', { roughness: 0.48, metalness: 0.35 });
    var dIc = K.mat('#b9b2a4', { roughness: 0.7, metalness: 0.2 });
    var t = 1.4;
    K.koy(dolap, K.kutu(DW, t, DD, dMat, 0.5), 0, DH - t / 2, 0);                  // üst
    K.koy(dolap, K.kutu(t, DH - 4, DD, dMat, 0.4), -DW / 2 + t / 2, (DH - 4) / 2 + 4, 0);
    K.koy(dolap, K.kutu(t, DH - 4, DD, dMat, 0.4), DW / 2 - t / 2, (DH - 4) / 2 + 4, 0);
    K.koy(dolap, K.kutu(DW, DH - 4, t, dIc), 0, (DH - 4) / 2 + 4, -DD / 2 + t / 2);
    K.koy(dolap, K.kutu(DW - 2, 4, DD - 2, K.mat('#26282d', { roughness: 0.8 }), 0.3), 0, 2, 0);  // kaide
    var cekmeceler = [], cekmeceIcerik = [[], [], []];
    var ETIKET = ['PROGRAMLAR', 'BELGELER', 'MEDYA'];
    var kolMat = K.mat('aluminyum');
    for (var c = 0; c < 3; c++) {
      var ck = new THREE.Group();
      K.parca(ck, 'cekmece-' + c, 'Çekmece: ' + ['Programlar', 'Belgeler', 'Medya'][c], 'Kaydedilen dosyalar çekmecede kalır.');
      var y0 = 4 + (2 - c) * (CEK_H + 1.3) + CEK_H / 2 + 0.6;
      ck.position.set(0, y0, 0);
      ck.userData.kapaliZ = 0;
      // ön panel
      K.koy(ck, K.kutu(DW - 3.2, CEK_H + 1.1, 1.6, dMat, 0.5), 0, 0, DD / 2 - 0.8);
      // kulp (çubuk + iki ayak)
      K.koy(ck, K.kutu(16, 1.4, 1.4, kolMat, 0.6), 0, CEK_H * 0.18, DD / 2 + 2.6);
      K.koy(ck, K.kutu(1.2, 1.2, 2.2, kolMat, 0.4), -7, CEK_H * 0.18, DD / 2 + 1.1);
      K.koy(ck, K.kutu(1.2, 1.2, 2.2, kolMat, 0.4), 7, CEK_H * 0.18, DD / 2 + 1.1);
      // etiket çerçevesi
      (function (i) {
        var et = K.canvasDoku(256, 72, function (ctx, w, h) {
          ctx.fillStyle = '#9ca3af'; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#fbfaf7'; ctx.fillRect(6, 6, w - 12, h - 12);
          ctx.fillStyle = '#1f2937'; ctx.font = '800 30px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(ETIKET[i], w / 2, h / 2 + 1);
        });
        var em = K.duzlem(11, 3.1, new THREE.MeshStandardMaterial({ map: et, roughness: 0.6 }));
        em.userData.golgeYok = true;
        K.koy(ck, em, 0, CEK_H * 0.36, DD / 2 + 0.02);
      })(c);
      // gövde: taban, yanlar, arka (üstü açık)
      var ih = CEK_H - 4, iw = DW - 6, idp = DD - 6;
      K.koy(ck, K.kutu(iw, 0.8, idp, dIc), 0, -CEK_H / 2 + 1, -1.5);
      K.koy(ck, K.kutu(0.8, ih, idp, dIc), -iw / 2, -CEK_H / 2 + 1 + ih / 2, -1.5);
      K.koy(ck, K.kutu(0.8, ih, idp, dIc), iw / 2, -CEK_H / 2 + 1 + ih / 2, -1.5);
      K.koy(ck, K.kutu(iw, ih, 0.8, dIc), 0, -CEK_H / 2 + 1 + ih / 2, -1.5 - idp / 2);
      // askılı dosyalar (dolaptaki kalıcı dosyalar)
      if (ops.bos !== true) {
        var renkler = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];
        var dh = ih - 10, kraft = K.mat('#d9b77e', { roughness: 0.8 });
        for (var f = 0; f < 6; f++) {
          var fz = -1.5 - idp / 2 + 4 + f * 2.4;
          K.koy(ck, K.kutu(iw - 3, dh, 0.3, kraft), 0, -CEK_H / 2 + 1.4 + dh / 2, fz);
          var sekme = K.kutu(6, 2.4, 0.34, K.mat(renkler[(f + c * 2) % 6], { roughness: 0.6 }));
          K.koy(ck, sekme, -12 + ((f + c) % 4) * 7.5, -CEK_H / 2 + 1.4 + dh + 1.1, fz);
        }
      }
      ck.userData.icTaban = -CEK_H / 2 + 1.4;
      ck.userData.icOn = -1.5 + idp / 2;
      cekmeceler.push(ck);
      dolap.add(ck);
    }
    function dolapDuzen(W, Dz) { dolap.position.set(W / 2 + 6 + DW / 2, 0, Dz / 2 - DD / 2); }

    /* ── Kartlar ── */
    var dokuOnbellek = {};
    function kartDoku(tur) {
      if (dokuOnbellek[tur]) return dokuOnbellek[tur];
      var T = TUR[tur] || TUR.odev;
      dokuOnbellek[tur] = K.canvasDoku(352, 256, function (ctx, w, h) {
        ctx.fillStyle = '#fbfaf6'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = T.renk; ctx.fillRect(0, 0, w, 74);
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, 0, w, 74);
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        var ad = T.ad, px = 34;
        do { ctx.font = '800 ' + px + 'px Arial, sans-serif'; px -= 2; } while (ctx.measureText(ad).width > w - 34 && px > 20);
        ctx.fillText(ad, 18, 39);
        simgeCiz(ctx, tur, 86, 164, 50, T.renk);
        ctx.fillStyle = '#d6d3cc';
        for (var i = 0; i < 4; i++) ctx.fillRect(170, 118 + i * 26, i === 3 ? 90 : 150, 9);
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
      });
      return dokuOnbellek[tur];
    }
    var kartGeo = K.yuvarlakKutuGeo(KW, KT, KD, 0.18, 1);
    var kagitGeo = new THREE.PlaneGeometry(KW - 0.8, KD - 0.8);
    kagitGeo.rotateX(-Math.PI / 2);
    kagitGeo.userData.paylasimli = true;
    function kartYap(tur) {
      var T = TUR[tur] || TUR.odev;
      var k = new THREE.Group();
      K.parca(k, 'kart-' + tur, T.ad + ' dosyası', 'Açık bir dosya ya da uygulama.');
      var gm = new THREE.MeshStandardMaterial({ color: T.renk, roughness: 0.55 });
      var km = new THREE.MeshStandardMaterial({ map: kartDoku(tur), roughness: 0.7 });
      k.add(new THREE.Mesh(kartGeo, gm));
      var kg = new THREE.Mesh(kagitGeo, km);
      kg.position.y = KT / 2 + 0.03;
      kg.userData.golgeYok = true;
      k.add(kg);
      k.userData.tur = tur;
      k.userData.kartMat = [gm, km];
      k.traverse(function (o) { if (o.isMesh && o !== kg) o.castShadow = true; });
      return k;
    }
    function saydam(k, a) {
      k.userData.kartMat.forEach(function (m) { m.transparent = a < 1; m.opacity = a; m.depthWrite = a > 0.6; });
    }

    /* Uçuş: kartı hedef ebeveyn yerel konumuna yay çizerek taşır */
    var _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new V3(1, 1, 1);
    function ucus(k, ebeveyn, konum, quat, sure, tepe) {
      g.updateWorldMatrix(true, true);
      g.attach(k);
      var p0 = k.position.clone(), q0 = k.quaternion.clone();
      ebeveyn.updateWorldMatrix(true, false);
      _m.compose(konum, quat, _s).premultiply(ebeveyn.matrixWorld).premultiply(new THREE.Matrix4().copy(g.matrixWorld).invert());
      var p1 = new V3(), q1 = new THREE.Quaternion(), s1 = new V3();
      _m.decompose(p1, q1, s1);
      var yuk = tepe == null ? 22 : tepe;
      return tw(sure == null ? 0.9 : sure, function (e) {
        k.position.lerpVectors(p0, p1, e); k.position.y += Math.sin(e * Math.PI) * yuk;
        k.quaternion.copy(q0).slerp(q1, e);
      }).then(function () {
        ebeveyn.attach(k);
        k.position.copy(konum); k.quaternion.copy(quat);
        return k;
      });
    }
    var DUZ = new THREE.Quaternion();
    var DIK = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    function cekmeceKonum(i, n) {
      var ck = cekmeceler[i];
      return new V3(((n % 3) - 1) * 4, ck.userData.icTaban + KD / 2 + 5, ck.userData.icOn - 11 - (n % 8) * 1.4);
    }

    function cekmece(i, acik, sure) {
      var ck = cekmeceler[i], z0 = ck.position.z, z1 = acik ? CEK_ACIK : 0;
      if (Math.abs(z0 - z1) < 0.01) return Promise.resolve();
      return tw(sure == null ? 0.5 : sure, function (e) { ck.position.z = z0 + (z1 - z0) * e; });
    }
    function bosYuva() {
      for (var i = 0; i < yuvalar.length; i++) if (!masadakiler[i]) return i;
      return -1;
    }
    function dolaptanMasaya(x, o) {
      o = o || {};
      var i = o.yuva != null ? o.yuva : bosYuva();
      if (i < 0 || i >= yuvalar.length || masadakiler[i]) return Promise.resolve(null);
      var k, ci;
      if (typeof x === 'string') {
        k = kartYap(x);
        ci = o.cekmece != null ? o.cekmece : (TUR[x] || TUR.odev).cekmece;
        cekmeceler[ci].add(k);
        k.position.copy(cekmeceKonum(ci, 4)); k.quaternion.copy(DIK);
      } else {
        k = x;
        ci = k.userData.cekmece != null ? k.userData.cekmece : (TUR[k.userData.tur] || TUR.odev).cekmece;
        var l = cekmeceIcerik[ci], j = l.indexOf(k);
        if (j >= 0) l.splice(j, 1);
      }
      masadakiler[i] = k;
      k.userData.yuva = i; k.userData.cekmece = null;
      k.visible = true; saydam(k, 1);
      var hiz = o.sure == null ? 1 : o.sure / 0.9;
      return cekmece(ci, true, 0.4 * hiz)
        .then(function () { return tw(0.3 * hiz, (function (y0) { return function (e) { k.position.y = y0 + e * 12; }; })(k.position.y)); })
        .then(function () {
          var kapan = D.bekle(0.35 * hiz, D.sahneBul(g)).then(function () { return cekmece(ci, false, 0.4 * hiz); });
          return Promise.all([ucus(k, g, yuvalar[i], DUZ, 0.9 * hiz, 26), kapan]);
        })
        .then(function () { return k; });
    }
    function masadanDolaba(k, o) {
      o = o || {};
      var ci = o.cekmece != null ? o.cekmece : (TUR[k.userData.tur] || TUR.odev).cekmece;
      var i = masadakiler.indexOf(k);
      if (i >= 0) masadakiler[i] = null;
      k.userData.yuva = null;
      var l = cekmeceIcerik[ci];
      l.push(k);
      var n = l.length - 1;
      var hiz = o.sure == null ? 1 : o.sure / 0.9;
      return cekmece(ci, true, 0.4 * hiz)
        .then(function () {
          var hedef = cekmeceKonum(ci, n); hedef.y += 12;
          return ucus(k, cekmeceler[ci], hedef, DIK, 0.9 * hiz, 20);
        })
        .then(function () { return tw(0.3 * hiz, (function (y0) { return function (e) { k.position.y = y0 - e * 12; }; })(k.position.y)); })
        .then(function () { k.userData.cekmece = ci; return cekmece(ci, false, 0.4 * hiz); })
        .then(function () { return k; });
    }
    function masayaKoy(tur, i) {
      if (i == null) i = bosYuva();
      if (i < 0 || i >= yuvalar.length || masadakiler[i]) return null;
      var k = kartYap(tur);
      g.add(k); k.position.copy(yuvalar[i]);
      masadakiler[i] = k; k.userData.yuva = i;
      return k;
    }
    function kopyala(k) {
      var y = kartYap(k.userData.tur);
      k.parent.add(y);
      y.position.copy(k.position); y.quaternion.copy(k.quaternion);
      return y;
    }
    function lambaAyar(acik, sure) {
      var a0 = ampulMat.emissiveIntensity, a1 = acik ? 2.2 : 0;
      return tw(sure == null ? 0.3 : sure, function (e) { ampulMat.emissiveIntensity = a0 + (a1 - a0) * e; }, 'lineer');
    }
    function kartKaldir(k) { if (k.parent) k.parent.remove(k); k.userData.kartMat.forEach(function (m) { m.dispose(); }); }
    function sol(kartlar, sure) {
      if (!kartlar.length) return Promise.resolve();
      var y0 = kartlar.map(function (k) { return k.position.y; });
      return tw(sure, function (e) {
        kartlar.forEach(function (k, i) { saydam(k, 1 - e); k.position.y = y0[i] + e * 4; });
      }, 'easeInCubic').then(function () { kartlar.forEach(kartKaldir); });
    }
    function gucKes(sure) {
      sure = sure == null ? 1.1 : sure;
      var kaybolan = masadakiler.filter(Boolean);
      for (var i = 0; i < masadakiler.length; i++) masadakiler[i] = null;
      return Promise.all([lambaAyar(false, 0.15), sol(kaybolan, sure)]).then(function () { return kaybolan.length; });
    }
    function gucVer(sure) { return lambaAyar(true, sure == null ? 0.4 : sure); }
    function temizle() {
      masadakiler.forEach(function (k) { if (k) kartKaldir(k); });
      for (var i = 0; i < masadakiler.length; i++) masadakiler[i] = null;
      cekmeceIcerik.forEach(function (l) { l.forEach(kartKaldir); l.length = 0; });
      cekmeceler.forEach(function (ck) { ck.position.z = 0; });
      ampulMat.emissiveIntensity = 2.2;
    }

    function kur(b) {
      var S = BOYLAR[b];
      masaDuzen(S.W, S.D); aksesuarDuzen(S.W, S.D); dolapDuzen(S.W, S.D);
      yuvalar = sumenKur(b, S.W, S.D);
      g.userData.yuvalar = yuvalar;
      g.userData.olcu = { W: S.W, D: S.D, H: MH };
      g.userData.boy = b; g.userData.kapasite = S.gb;
      while (masadakiler.length < yuvalar.length) masadakiler.push(null);
    }
    function boyut(b2, sure) {
      b2 = GB_BOY[b2] || b2;
      if (!BOYLAR[b2] || b2 === g.userData.boy) return Promise.resolve();
      sure = sure == null ? 1 : sure;
      var S0 = BOYLAR[g.userData.boy], S1 = BOYLAR[b2];
      var kartlar = masadakiler.filter(Boolean);
      var tasan = kartlar.slice(S1.sutun * S1.satir);
      kartlar = kartlar.slice(0, S1.sutun * S1.satir);
      var p0 = kartlar.map(function (k) { return k.position.clone(); });
      var yeniYuva = yuvaHesap(b2, S1.W, S1.D).l;
      sumen.visible = false;
      return Promise.all([sol(tasan, 0.4), tw(sure, function (e) {
        var W = S0.W + (S1.W - S0.W) * e, Dz = S0.D + (S1.D - S0.D) * e;
        masaDuzen(W, Dz, { W: S0.W, D: S0.D }); aksesuarDuzen(W, Dz); dolapDuzen(W, Dz);
        kartlar.forEach(function (k, i) { k.position.lerpVectors(p0[i], yeniYuva[i], e); });
      })]).then(function () {
        masadakiler.length = 0;
        kur(b2);
        for (var i = 0; i < masadakiler.length; i++) masadakiler[i] = kartlar[i] || null;
        kartlar.forEach(function (k, i) { k.userData.yuva = i; k.position.copy(yuvalar[i]); });
        sumen.visible = true;
      });
    }

    kur(boy);
    g.userData.masadakiler = masadakiler;
    g.userData.cekmeceler = cekmeceler;
    g.userData.cekmeceIcerik = cekmeceIcerik;
    g.userData.lambaParca = lamba;
    g.userData.kartYap = kartYap;
    g.userData.dolaptanMasaya = dolaptanMasaya;
    g.userData.masadanDolaba = masadanDolaba;
    g.userData.kopyala = kopyala;
    g.userData.masayaKoy = masayaKoy;
    g.userData.cekmece = cekmece;
    g.userData.lamba = lambaAyar;
    g.userData.gucKes = gucKes;
    g.userData.gucVer = gucVer;
    g.userData.boyut = boyut;
    g.userData.bosYuva = bosYuva;
    g.userData.temizle = temizle;
    g.userData.kartBoyu = { W: KW, D: KD, T: KT };
    return g;
  });
})(window.DON3D);
