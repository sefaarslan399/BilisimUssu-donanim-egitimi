/* M-TELEFON-KATMAN — akıllı telefonun katmanları (patlatma görünümü). Gerçek telefon sökülmez; model yalnız incelemek içindir.
   Ölçü birimi: cm (15,2 × 0,85 × 7,2). Orijin: arka kapağın alt yüzünün ortası. Yön: telefon ekranı yukarıda (+Y), yatay yatar;
   uzun kenar X ekseninde: üst kenar (kameralar) −X, alt kenar (şarj girişi) +X. Önden (+Z) bakınca katmanlar ayrı ayrı görünür.
   Katmanlar (aşağıdan yukarı): arka kapak → kamera modülü → anakart + çip (üst bölge) ve pil (alt bölge) → çerçeve → ekran.
   Parça adları (E-DONDUR / E-BILGI etiketleri): arka-kapak, kamera, anakart, cip, pil, cerceve, ekran;
     çip ayrıntısı: cip-bellek (çipin üstüne istiflenmiş bellek), cip-islemci, cip-grafik, cip-diger (çipin içi, şema) ve depolama (flash çip).
   userData.patlat(oran 0–1, sure) → Promise: katmanlar merdiven gibi yukarı ve geriye (−Z) ayrışır; 0'da birleşir.
   userData.cipAc(oran 0–1, sure) → Promise: çipin üstündeki bellek kalkar, çipin içindeki bölümler (şema) görünür.
   userData.katmanlar: { arkaKapak, kamera, anakart, cip, pil, cerceve, ekran } · userData.olcu: { W, L, H }
   ops.oran: başlangıç patlatma oranı. ops.ekranAcik: false → ekran kapalı (koyu). */
(function (D) {
  'use strict';

  function yuvarlakSekil(THREE, w, l, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -l / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + l - r); s.quadraticCurveTo(x + w, y + l, x + w - r, y + l);
    s.lineTo(x + r, y + l); s.quadraticCurveTo(x, y + l, x, y + l - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  /* XZ düzleminde yuvarlak köşeli plaka (Y: 0..h). delik: [w, l, r] → çerçeve (halka). */
  function plaka(K, w, l, h, r, mat, delik) {
    var THREE = K.THREE;
    var s = yuvarlakSekil(THREE, w, l, r);
    if (delik) s.holes.push(yuvarlakSekil(THREE, delik[0], delik[1], delik[2]));
    var geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 8 });
    geo.rotateX(-Math.PI / 2);
    return new THREE.Mesh(geo, typeof mat === 'string' ? K.mat(mat) : mat);
  }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  D.modelTanimla('M-TELEFON-KATMAN', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var W = 7.2, L = 15.2, H = 0.85, R = 0.95;
    var g = new THREE.Group();
    K.parca(g, 'M-TELEFON-KATMAN', 'Telefonun katmanları', 'Telefon ince katmanlardan oluşur. Gerçek telefon sökülmez; yalnız modelde incelenir.');
    var rng = K.rng(7);
    // İç gövde: telefon kendi ekseninde (uzun kenar yerel Z) kurulur, sonra yatay çevrilir (yerel Z → dünya X).
    var govde = new THREE.Group();
    govde.rotation.y = Math.PI / 2;
    g.add(govde);

    /* ── Arka kapak (cam) + kamera penceresi ── */
    var arka = new THREE.Group();
    K.parca(arka, 'arka-kapak', 'Arka kapak', 'Telefonun arkasını kapatan cam ya da plastik yüzey. Kamera penceresi buradadır.');
    arka.add(plaka(K, W, L, 0.1, R, K.mat('#34405a', { roughness: 0.18, metalness: 0.3 })));
    var pencere = plaka(K, 2.9, 2.9, 0.04, 0.55, K.mat('#1a1d24', { roughness: 0.1, metalness: 0.4 }));
    K.koy(arka, pencere, -1.75, 0.1, -L / 2 + 2.05);
    [[-2.35, -L / 2 + 1.45], [-2.35, -L / 2 + 2.65], [-1.15, -L / 2 + 1.45]].forEach(function (p) {
      var hk = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.5, 24), K.mat('#8b94a3', { roughness: 0.3, metalness: 0.8 }));
      hk.rotation.x = -Math.PI / 2;
      K.koy(arka, hk, p[0], 0.145, p[1]).userData.secilmez = true;
    });
    govde.add(arka);

    /* ── Kamera modülü (merceklerle) ── */
    var kamera = new THREE.Group();
    K.parca(kamera, 'kamera', 'Kamera modülü', 'Mercek ışığı toplar, altındaki sensör görüntüye çevirir. Anakarta küçük bir kabloyla bağlanır.');
    kamera.position.set(-1.75, 0.12, -L / 2 + 2.05);
    K.koy(kamera, K.kutu(2.6, 0.34, 2.6, K.mat('#1c1e23', { roughness: 0.45, metalness: 0.3 }), 0.12), 0, 0.17, 0);
    var mercekMat = K.mat('#0b1020', { roughness: 0.05, metalness: 0.6 });
    [[-0.6, -0.6], [-0.6, 0.6], [0.6, -0.6]].forEach(function (p) {
      K.koy(kamera, K.silindir(0.46, 0.22, K.mat('#a7afbb', { roughness: 0.3, metalness: 0.85 }), 24), p[0], 0.4, p[1]);
      K.koy(kamera, K.silindir(0.34, 0.03, mercekMat, 24), p[0], 0.52, p[1]);
    });
    K.koy(kamera, K.kutu(0.7, 0.05, 1.9, K.mat('#c47a23', { roughness: 0.4, metalness: 0.3 })), 1.55, 0.05, 0.4);
    govde.add(kamera);

    /* ── Anakart (üst bölge) + çip (bellek istifli) + depolama çipi ── */
    var anakart = new THREE.Group();
    K.parca(anakart, 'anakart', 'Anakart', 'Telefonun bütün parçaları bu küçük karta bağlanır. Masaüstündeki anakartın küçültülmüş hâlidir.');
    anakart.position.set(0, 0.52, -L / 2 + 3.35);
    var pcbDoku = K.canvasDoku(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#1e4a33'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(170,220,180,0.2)'; ctx.lineWidth = 1.2;
      for (var i = 0; i < 40; i++) { var y = rng() * h, x = rng() * w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30 + rng() * 50, y); ctx.stroke(); }
    });
    K.koy(anakart, K.kutu(6.3, 0.08, 5.6, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.6 }), 0.03), 0, 0, 0);
    var smd = [];
    for (var i = 0; i < 46; i++) {
      var x = -2.9 + rng() * 5.8, z = -2.5 + rng() * 5;
      if (Math.abs(x + 1.0) < 1.3 && Math.abs(z - 0.2) < 1.3) continue;
      if (Math.abs(x - 1.3) < 0.9 && Math.abs(z + 1.6) < 0.8) continue;
      if (Math.abs(x - 1.6) < 1.1 && Math.abs(z - 1.7) < 0.8) continue;
      smd.push([x, 0.06, z]);
    }
    anakart.add(K.ornekle(new THREE.BoxGeometry(0.18, 0.05, 0.1), K.mat('#2b2d33', { roughness: 0.5 }), smd));
    // Metal koruma kapağı (kalkan) ve bağlantı soketleri
    K.koy(anakart, K.kutu(1.8, 0.14, 1.2, K.mat('#b9c0ca', { roughness: 0.35, metalness: 0.85 }), 0.04), 1.6, 0.11, 1.7);
    K.koy(anakart, K.kutu(0.45, 0.16, 0.9, 'plastikSiyah', 0.04), 2.6, 0.12, -0.2);
    K.koy(anakart, K.kutu(0.9, 0.16, 0.45, 'plastikSiyah', 0.04), -2.2, 0.12, 2.4);
    // Depolama (flash) çipi
    var depo = K.kutu(1.4, 0.12, 1.2, 'cip', 0.04);
    K.parca(depo, 'depolama', 'Depolama çipi', 'Fotoğraf ve uygulamalar burada kalıcı olarak saklanır. Masaüstündeki SSD’nin karşılığıdır.');
    K.koy(anakart, depo, 1.3, 0.1, -1.6);
    // Çip: alt katman işlemci+grafik (yonga üstünde sistem), üstte istiflenmiş bellek
    var cip = new THREE.Group();
    K.parca(cip, 'cip', 'Çip (tek çipte birçok parça)', 'İşlemci ve grafik birimi aynı çipin içindedir. Bellek de çoğu zaman bu çipin üstüne istiflenir.');
    cip.position.set(-1.0, 0.04, 0.2);
    K.koy(cip, K.kutu(2.2, 0.1, 2.2, K.mat('#2f5140', { roughness: 0.5 }), 0.03), 0, 0.05, 0);
    var kalipDoku = K.canvasDoku(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#2c3440'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(14, 14, 110, 110);    // işlemci çekirdekleri
      ctx.fillStyle = '#60a5fa';
      for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) ctx.fillRect(24 + a * 52, 24 + b * 52, 42, 42);
      ctx.fillStyle = '#16a34a'; ctx.fillRect(132, 14, 110, 110);   // grafik
      ctx.fillStyle = '#22c55e';
      for (var c = 0; c < 4; c++) ctx.fillRect(140 + c * 25, 22, 19, 94);
      ctx.fillStyle = '#a16207'; ctx.fillRect(14, 132, 228, 110);   // diğer birimler
      ctx.fillStyle = '#ca8a04';
      for (var d = 0; d < 6; d++) ctx.fillRect(22 + d * 37, 142, 28, 90);
    });
    var kalip = K.kutu(1.7, 0.06, 1.7, new THREE.MeshStandardMaterial({ map: kalipDoku, roughness: 0.3, metalness: 0.3 }));
    K.koy(cip, kalip, 0, 0.13, 0);
    kalip.userData.secilmez = true;
    // Çipin içi (şema) için adlandırılmış bölgeler: etiket çapaları
    var bolgeMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    var bIslemci = K.kutu(0.72, 0.02, 0.72, bolgeMat);
    K.parca(bIslemci, 'cip-islemci', 'İşlemci', 'Hesapları yapan beyin. Birkaç çekirdekten oluşur.');
    K.koy(cip, bIslemci, -0.42, 0.17, -0.42);
    var bGrafik = K.kutu(0.72, 0.02, 0.72, bolgeMat);
    K.parca(bGrafik, 'cip-grafik', 'Grafik', 'Ekrandaki görüntüyü, oyunları ve videoları çizer. Masaüstünde ekran kartının işini yapar.');
    K.koy(cip, bGrafik, 0.42, 0.17, -0.42);
    var bDiger = K.kutu(1.5, 0.02, 0.62, bolgeMat);
    K.parca(bDiger, 'cip-diger', 'Diğer birimler', 'Kamera görüntüsünü ve sesi işleyen küçük birimler de bu çipin içindedir.');
    K.koy(cip, bDiger, 0, 0.17, 0.42);
    var bellek = new THREE.Group();
    K.parca(bellek, 'cip-bellek', 'Bellek (RAM)', 'Açık uygulamaları geçici olarak tutar. Yer kazanmak için çipin üstüne istiflenir.');
    bellek.position.y = 0.16;
    K.koy(bellek, K.kutu(2.1, 0.12, 2.1, K.mat('#15171b', { roughness: 0.35, metalness: 0.1 }), 0.03), 0, 0.06, 0);
    var nokta = K.silindir(0.08, 0.01, K.mat('#6b7280'), 12);
    K.koy(bellek, nokta, -0.8, 0.125, 0.8).userData.secilmez = true;
    cip.add(bellek);
    anakart.add(cip);
    govde.add(anakart);

    /* ── Pil (alt bölge) ── */
    var pil = new THREE.Group();
    K.parca(pil, 'pil', 'Pil', 'Lityum iyon pil telefona enerji verir. Gerçek telefonda pil sökülmez; şişerse dokunulmaz.');
    pil.position.set(0, 0.14, 3.15);
    K.koy(pil, K.kutu(6.0, 0.46, 8.0, K.mat('#9aa7b8', { roughness: 0.3, metalness: 0.75 }), 0.14), 0, 0.23, 0);
    var pilEt = K.canvasDoku(256, 320, function (ctx, w, h) {
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '800 32px Inter, Arial, sans-serif';
      ctx.fillText('Li-ion', w / 2, 74); ctx.font = '700 22px Inter, Arial, sans-serif';
      ctx.fillText('3.85 V', w / 2, 124); ctx.fillText('4000 mAh', w / 2, 156);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(24, 204, w - 48, 80);
      ctx.font = '700 18px Inter, Arial, sans-serif'; ctx.fillText('Delme · Ezme', w / 2, 236); ctx.fillText('Ateşe atma', w / 2, 266);
    });
    var pe = K.duzlem(5.0, 6.6, new THREE.MeshStandardMaterial({ map: pilEt, roughness: 0.5 }));
    K.koy(pil, pe, 0, 0.465, 0.2, -Math.PI / 2).userData.secilmez = true;
    K.koy(pil, K.kutu(1.0, 0.06, 1.3, K.mat('#c47a23', { roughness: 0.4, metalness: 0.3 })), 1.6, 0.4, -4.4);
    govde.add(pil);

    /* ── Çerçeve (orta kasa: metal halka + yan düğmeler) ── */
    var cerceve = new THREE.Group();
    K.parca(cerceve, 'cerceve', 'Çerçeve', 'Telefonun metal iskeleti. Parçaları tutar, düğmeler ve şarj girişi buradadır.');
    cerceve.position.y = 0.1;
    var alu = K.mat('#b8bec8', { roughness: 0.3, metalness: 0.9 });
    cerceve.add(plaka(K, W, L, 0.62, R, alu, [W - 0.36, L - 0.36, R - 0.18]));
    [[W / 2 + 0.03, -3.4, 1.5], [W / 2 + 0.03, -1.2, 1.0], [-W / 2 - 0.03, -2.6, 1.9]].forEach(function (b) {
      K.koy(cerceve, K.kutu(0.1, 0.22, b[2], alu, 0.04), b[0], 0.31, b[1]);
    });
    K.koy(cerceve, K.kutu(0.9, 0.26, 0.08, K.mat('#15171b'), 0.08), 0, 0.31, L / 2 + 0.01);
    for (var hp = 0; hp < 5; hp++) K.koy(cerceve, K.silindir(0.06, 0.04, K.mat('#15171b'), 8), 1.3 + hp * 0.26, 0.31, L / 2 + 0.01, Math.PI / 2);
    govde.add(cerceve);

    /* ── Ekran (cam + panel, ana ekran görüntüsü) ── */
    var ekran = new THREE.Group();
    K.parca(ekran, 'ekran', 'Ekran', 'Dokunmatik cam ve görüntü paneli. Dokunuşu algılar ve görüntüyü gösterir.');
    ekran.position.y = 0.72;
    ekran.add(plaka(K, W - 0.05, L - 0.05, 0.12, R - 0.02, K.mat('#0d0f13', { roughness: 0.08, metalness: 0.3 })));
    var ekranDoku = K.canvasDoku(256, 512, function (ctx, w, h) {
      var gr = ctx.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#1e3a8a'); gr.addColorStop(0.55, '#6d28d9'); gr.addColorStop(1, '#0ea5e9');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(22, 18, 40, 8); ctx.fillRect(w - 60, 18, 38, 8);
      var renk = ['#f97316', '#22c55e', '#eab308', '#3b82f6', '#ef4444', '#14b8a6', '#a855f7', '#f43f5e', '#84cc16', '#06b6d4', '#f59e0b', '#8b5cf6'];
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        ctx.fillStyle = renk[(r * 4 + c) % renk.length];
        K.yuvarlakDikdortgen(ctx, 22 + c * 56, 70 + r * 72, 44, 44, 11); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(28 + c * 56, 122 + r * 72, 32, 5);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; K.yuvarlakDikdortgen(ctx, 14, h - 86, w - 28, 70, 22); ctx.fill();
      for (var dk = 0; dk < 4; dk++) { ctx.fillStyle = renk[dk * 2]; K.yuvarlakDikdortgen(ctx, 28 + dk * 56, h - 74, 44, 44, 11); ctx.fill(); }
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(w / 2, 22, 8, 0, Math.PI * 2); ctx.fill();
    });
    var acik = ops.ekranAcik !== false;
    var panel = K.duzlem(W - 0.45, L - 0.45, new THREE.MeshStandardMaterial({ map: ekranDoku, emissive: acik ? 0xffffff : 0x000000,
      emissiveMap: ekranDoku, emissiveIntensity: acik ? 0.6 : 0, roughness: 0.15, color: acik ? 0xffffff : 0x333333 }));
    K.koy(ekran, panel, 0, 0.125, 0, -Math.PI / 2).userData.secilmez = true;
    govde.add(ekran);

    /* ── Patlatma: katmanlar merdiven gibi yukarı ve geriye ayrışır ── */
    var ARA_Y = 2.2, ARA_X = 4.0, SAPMA = 0.35;   // yerel +X = dünya −Z (geriye)
    var katmanlar = [
      { nesne: kamera, seviye: 1 }, { nesne: anakart, seviye: 2 }, { nesne: pil, seviye: 2 },
      { nesne: cerceve, seviye: 3 }, { nesne: ekran, seviye: 4 }
    ];
    katmanlar.forEach(function (k) { k.p0 = k.nesne.position.clone(); k.oran = 0; });
    function koy(k, o) {
      k.oran = o;
      k.nesne.position.set(k.p0.x + ARA_X * k.seviye * o, k.p0.y + ARA_Y * k.seviye * o, k.p0.z);
    }
    g.userData.oran = 0;
    g.userData.patlat = function (oran, sure) {
      oran = oran == null ? 1 : oran;
      var acilis = oran >= g.userData.oran;
      g.userData.oran = oran;
      var bas = katmanlar.map(function (k) { return k.oran; });
      if (sure === 0) { katmanlar.forEach(function (k) { koy(k, oran); }); return Promise.resolve(); }
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 1.6 : sure, ease: 'lineer', anahtar: 'patlat', hedef: g,
        guncelle: function (e) {
          katmanlar.forEach(function (k, i) {
            var sira = (k.seviye - 1) / 3;
            var gec = (acilis ? 1 - sira : sira) * SAPMA;
            var t = Math.min(1, Math.max(0, (e - gec) / (1 - SAPMA)));
            koy(k, bas[i] + (oran - bas[i]) * ease(t));
          });
        } });
    };
    var cipOran = 0;
    g.userData.cipAc = function (oran, sure) {
      var b0 = cipOran; cipOran = oran;
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.9 : sure, anahtar: 'cip', hedef: g,
        guncelle: function (e) {
          var o = b0 + (oran - b0) * e;
          bellek.position.y = 0.16 + o * 0.9;
          bellek.position.z = o * 2.5;
        } });
    };
    g.userData.katmanlar = { arkaKapak: arka, kamera: kamera, anakart: anakart, cip: cip, pil: pil, cerceve: cerceve, ekran: ekran };
    g.userData.olcu = { W: W, L: L, H: H };
    if (ops.oran) g.userData.patlat(ops.oran, 0);
    return g;
  });
})(window.DON3D);
