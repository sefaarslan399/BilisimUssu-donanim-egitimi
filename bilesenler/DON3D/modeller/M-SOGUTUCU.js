/* M-SOGUTUCU — kule tipi hava soğutucu (işlemci için): taban plakası, 4 bakır ısı borusu, alüminyum kanatçık yığını,
   üst kapak, montaj köprüsü ve önüne takılı 12 cm fan; altında ayrı TERMAL MACUN katmanı.
   bagimli: M-FAN
   Ölçü birimi: cm (≈ 12,6 × 15,4 × 7,6 fan dahil). Orijin: termal macunun alt yüzü, ortası (= işlemci kapağının üst yüzüne oturan nokta).
   Yön: kanatçıklar yatay, yukarı (+Y) doğru dizilir; fan +Z yüzünde, havayı +Z'den −Z'ye kanatçıkların arasından iter.
   Parçalar: 'termal-macun' (ince gri katman; görünür olsun diye gerçekten biraz kalın çizilir), 'taban' (işlemciye oturan plaka),
             'isi-borusu' (4 bakır boru), 'kanatcik' (alüminyum kanatçık yığını), 'M-FAN' (fan; bkz. M-FAN.js).
   ops: { fansiz: true → fan eklenmez, macunsuz: true → macun gizli başlar, fanHiz: rad/sn (varsayılan 0) }
   userData API:
     govde                  → soğutucunun macun dışındaki tüm parçaları (kaldırılınca birlikte hareket eder)
     macun                  → termal macun mesh'i
     fan, rotor             → M-FAN örneği ve onun dönen rotoru (fan.userData.baslat / hizAyarla / tozla kullanılabilir)
     patlatMesafe           → patlatmada gövdenin yükselme mesafesi (cm, varsayılan 7)
     patlat(oran, sure)     → Promise (sure 0: anında uygular, yerlestir() öncesi çerçeve için); A-PATLAT: oran 0 = birleşik, 1 = ayrık (gövde patlatMesafe, macun %40'ı kadar yükselir;
                               işlemci ayrı modeldir, yerinde kalır → soğutucu–macun–işlemci ayrışır)
     macunAyarla(var, sure) → Promise (sure 0: anında); macunu sürülmüş/silinmiş gösterir (ölçekle belirir ya da kaybolur)
     olcu                   → { H: toplam yükseklik, macunH, tabanY, kanatAlt, kanatUst, fanZ } */
(function (D) {
  'use strict';
  D.modelTanimla('M-SOGUTUCU', function (K, ops) {
    var THREE = K.THREE, V3 = K.V3;
    ops = ops || {};
    var MH = 0.06, TY = MH, TABAN = 0.5, BLOK = 0.95;
    var FW = 12.4, FD = 5.0, FT = 0.05, FA = 0.25, FN = 46, KALT = 3.3;
    var KUST = KALT + (FN - 1) * FA, KAPAK = 0.35;
    var g = new THREE.Group();
    K.parca(g, 'M-SOGUTUCU', 'Soğutucu', 'İşlemcinin ısısını alır, kanatçıklara taşır; fan bu ısıyı havayla uzaklaştırır.');

    // ── Termal macun (işlemci kapağı boyutunda ince katman)
    var macunDoku = K.canvasDoku(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#9ea3a9'; ctx.fillRect(0, 0, w, h);
      var r = K.rng(4);
      for (var i = 0; i < 40; i++) {                 // yayılma izleri
        ctx.strokeStyle = 'rgba(' + (r() > 0.5 ? '190,195,200' : '120,125,132') + ',0.35)'; ctx.lineWidth = 2 + r() * 4;
        ctx.beginPath(); ctx.arc(w / 2 + (r() - 0.5) * 30, h / 2 + (r() - 0.5) * 30, 10 + r() * 120, r() * 6, r() * 6 + 1.2); ctx.stroke();
      }
    });
    var macunMat = new THREE.MeshStandardMaterial({ map: macunDoku, roughness: 0.75, metalness: 0.15 });
    var macun = K.kutu(2.9, MH, 2.9, macunMat, 0.03, 2);
    K.parca(macun, 'termal-macun', 'Termal macun', 'İşlemci ile soğutucu arasındaki mikroskobik boşlukları doldurur; ısı kolayca geçer. İnce bir katman yeter.');
    macun.position.y = MH / 2;
    g.add(macun);

    var govde = new THREE.Group();
    govde.name = 'sogutucu-govde';
    g.add(govde);

    // ── Taban plakası (nikel kaplı bakır, parlak) + alüminyum blok + montaj köprüsü
    var taban = new THREE.Group();
    K.parca(taban, 'taban', 'Taban plakası', 'İşlemcinin metal kapağına oturur ve ısıyı alır.');
    K.koy(taban, K.kutu(4.0, TABAN, 4.0, K.mat('#d5d8dc', { roughness: 0.18, metalness: 1 }), 0.08, 2), 0, TY + TABAN / 2, 0);
    K.koy(taban, K.kutu(4.2, BLOK, 3.5, 'aluminyumMat', 0.12, 2), 0, TY + TABAN + BLOK / 2, 0);
    var kopru = K.kutu(9.6, 0.22, 1.3, K.mat('#5b6068', { roughness: 0.4, metalness: 0.85 }), 0.08, 2);
    K.koy(taban, kopru, 0, TY + TABAN + BLOK + 0.11, 0);
    [-4.4, 4.4].forEach(function (x) {
      var vida = K.silindir(0.28, 0.9, 'celik', 16);
      K.koy(taban, vida, x, TY + TABAN + BLOK + 0.2, 0);
      var bas = K.silindir(0.42, 0.25, 'celik', 20);
      K.koy(taban, bas, x, TY + TABAN + BLOK + 0.7, 0);
      var yay = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 6, 16), K.mat('celik'));
      yay.rotation.x = Math.PI / 2;
      [0.3, 0.45].forEach(function (dy) { var y2 = yay.clone(); K.koy(taban, y2, x, TY + TABAN + BLOK + dy, 0); y2.rotation.x = Math.PI / 2; });
    });
    govde.add(taban);

    // ── Isı boruları: 4 U biçimli bakır boru (tabandan kanatçıkların içinden yukarı)
    var borular = new THREE.Group();
    K.parca(borular, 'isi-borusu', 'Isı boruları', 'Bakır borular ısıyı tabandan kanatçıklara hızla taşır.');
    var boruMat = K.mat('bakir', { roughness: 0.3 });
    var yb = TY + 0.3, ust = KUST + KAPAK + 0.25;
    [[1.1, -0.9], [2.4, -0.3], [3.6, 0.3], [4.8, 0.9]].forEach(function (b) {
      var L = b[0], z = b[1];
      var nk = [new V3(-L, ust, z), new V3(-L, KALT - 0.2, z), new V3(-(L + 1.5) / 2, 1.55, z), new V3(-1.3, yb, z),
        new V3(1.3, yb, z), new V3((L + 1.5) / 2, 1.55, z), new V3(L, KALT - 0.2, z), new V3(L, ust, z)];
      var egri = new THREE.CatmullRomCurve3(nk, false, 'centripetal');
      var boru = new THREE.Mesh(new THREE.TubeGeometry(egri, 72, 0.3, 10, false), boruMat);
      borular.add(boru);
      [-L, L].forEach(function (x) {
        var tapa = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), K.mat('#d5d8dc', { roughness: 0.2, metalness: 1 }));
        K.koy(borular, tapa, x, ust, z);
      });
    });
    govde.add(borular);

    // ── Kanatçık yığını (InstancedMesh) + üst kapak
    var kanatcik = new THREE.Group();
    K.parca(kanatcik, 'kanatcik', 'Alüminyum kanatçıklar', 'Isıyı geniş bir yüzeye yayar; fanın havası bu ısıyı alıp götürür.');
    var kl = [];
    for (var i = 0; i < FN; i++) kl.push([0, KALT + i * FA, 0]);
    var fGeo = K.geoPaylas('sog-kanat:' + FW + ':' + FD, function () {
      // Hafif dalgalı ön kenar (gerçek kanatçıklardaki gibi) — ince kutu
      return new THREE.BoxGeometry(FW, FT, FD);
    });
    var kanatIm = K.ornekle(fGeo, K.mat('#cfd4da', { roughness: 0.32, metalness: 0.85 }), kl);
    kanatcik.add(kanatIm);
    var kapakDoku = K.canvasDoku(512, 256, function (ctx, w, h) {
      ctx.fillStyle = '#2b2f36'; ctx.fillRect(0, 0, w, h);
      var r = K.rng(12);
      for (var j = 0; j < 260; j++) { ctx.fillStyle = 'rgba(255,255,255,' + (0.02 + r() * 0.04).toFixed(3) + ')'; ctx.fillRect(0, r() * h, w, 1); }
    });
    var ustKapak = K.kutu(FW + 0.2, KAPAK, FD + 0.2, new THREE.MeshStandardMaterial({ map: kapakDoku, roughness: 0.35, metalness: 0.7 }), 0.12, 2);
    K.koy(kanatcik, ustKapak, 0, KUST + KAPAK / 2 + 0.05, 0);
    govde.add(kanatcik);

    // ── Fan (M-FAN) + tel klipsler
    var fanZ = FD / 2 + 1.3;
    var fanY = (KALT + KUST) / 2;
    var fan = null;
    if (!ops.fansiz) {
      fan = D.model('M-FAN', { kablosuz: true, hiz: ops.fanHiz || 0 });
      K.koy(govde, fan, 0, fanY, fanZ);
      [fanY + 5.9, fanY - 5.9].forEach(function (y) {
        var klips = K.kablo([new V3(-5.6, y, fanZ + 1.3), new V3(-5.9, y, fanZ - 1.6), new V3(-6.1, y, 0.8),
          new V3(-6.1, y, -0.8)], 0.05, 'celik');
        klips.userData.secilmez = true;
        govde.add(klips);
        var k2 = klips.clone(); k2.scale.x = -1; govde.add(k2);
      });
    }

    // ── API
    var toplamH = KUST + KAPAK + 0.3;
    g.userData.govde = govde;
    g.userData.macun = macun;
    g.userData.fan = fan;
    g.userData.rotor = fan ? fan.userData.rotor : null;
    g.userData.patlatMesafe = 7;
    g.userData.patlatOrani = 0;
    function patlatUygula(o) {
      g.userData.patlatOrani = o;
      govde.position.y = o * g.userData.patlatMesafe;
      macun.position.y = MH / 2 + o * g.userData.patlatMesafe * 0.4;
    }
    g.userData.patlat = function (oran, sure) {
      var bas = g.userData.patlatOrani;
      if (sure === 0) { patlatUygula(oran); return Promise.resolve(); }
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 1 : sure, anahtar: 'patlat', hedef: g,
        guncelle: function (e) { patlatUygula(bas + (oran - bas) * e); } });
    };
    g.userData.macunAyarla = function (var_, sure) {
      var bas = macun.visible ? macun.scale.x : 0, hedef = var_ ? 1 : 0;
      if (sure === 0) { macun.visible = !!var_; macun.scale.set(var_ ? 1 : 0.001, 1, var_ ? 1 : 0.001); return Promise.resolve(); }
      macun.visible = true;
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.6 : sure, anahtar: 'macun', hedef: g,
        guncelle: function (e) { var k = Math.max(0.001, bas + (hedef - bas) * e); macun.scale.set(k, 1, k); } })
        .then(function () { macun.visible = !!var_; });
    };
    if (ops.macunsuz) { macun.visible = false; macun.scale.set(0.001, 1, 0.001); }
    g.userData.olcu = { H: toplamH, macunH: MH, tabanY: TY, kanatAlt: KALT, kanatUst: KUST, fanZ: fanZ, fanY: fanY, FW: FW, FD: FD };
    return g;
  });
})(window.DON3D);
