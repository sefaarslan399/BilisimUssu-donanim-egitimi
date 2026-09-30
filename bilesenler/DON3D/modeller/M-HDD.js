/* M-HDD — 3,5 inç sabit disk (HDD), kapalı: metal kapak, markasız etiket, alt devre kartı.
   bagimli: M-SSD
   Ölçü birimi: cm (14,7 × 2,61 × 10,16). Orijin: alt-orta. Uzun kenar X (konnektörler −X ucunda), genişlik Z, yükseklik Y.
   Parçalar: 'hdd-ust-kapak' (metal kapak), 'hdd-etiket' (etiket), 'hdd-govde' (döküm gövde), 'hdd-kart' (alttaki devre kartı),
   'sata-veri' (7 pin, L), 'sata-guc' (15 pin, L), 'hdd-vida-delikleri' (yan vida delikleri, her yanda 3).
   Konnektör yardımcısı M-SSD'deki DON3D.sataKonnektor'dur (L çıkıntıları dış uçlarda; DOĞRULA notu M-SSD başlığında).
   ops: { kapasite: '1 TB', hiz: '7200 dev/dk' }
   userData: sataVeri, sataGuc (konnektör grupları; ağız yerel +Z = dünya −X), vidaDelikleri: [Object3D] (yan delik merkezleri,
     dışa bakan yön ±Z), olcu: {L, H, W}.
   Not: Yan delik konumları yaklaşıktır (öndan ≈ 2,9 / 6,0 / 10,2 cm); derste ölçü verilmez. */
(function (D) {
  'use strict';
  var L = 14.7, H = 2.61, W = 10.16;

  D.modelTanimla('M-HDD', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-HDD', 'Sabit disk (HDD)', 'Kapalı bir 3,5 inç sabit disk. İçinde dönen plakalar vardır; kapağı asla açılmaz.');

    // Gövde (alüminyum döküm, yanlarda hafif oluklar)
    var govde = new THREE.Group();
    K.parca(govde, 'hdd-govde', 'Gövde', 'Alüminyum döküm gövde; plakaları ve kafayı tozdan korur.');
    var alu = K.mat('#9ba1a9', { roughness: 0.55, metalness: 0.7 });
    K.koy(govde, K.kutu(L, H - 0.26, W, alu, 0.18, 3), 0, 0.18 + (H - 0.26) / 2, 0);
    // yan oluk şeritleri
    [-1, 1].forEach(function (yz) {
      K.koy(govde, K.kutu(L - 1.2, 0.5, 0.04, K.mat('#8a9098', { roughness: 0.6, metalness: 0.65 }), 0.02), 0, 1.25, yz * (W / 2 + 0.005));
    });
    g.add(govde);

    // Üst kapak: çelik plaka, plaka bölgesinde yuvarlak kabartma, köşe vidaları
    var kapak = new THREE.Group();
    K.parca(kapak, 'hdd-ust-kapak', 'Metal kapak', 'Diski kapalı tutar. Açılırsa içeri toz girer ve plakalar zarar görür.');
    var celik = K.mat('#c3c8ce', { roughness: 0.35, metalness: 0.85 });
    K.koy(kapak, K.kutu(L - 0.1, 0.06, W - 0.1, celik, 0.03), 0, 0.03, 0);
    var kabarti = K.silindir(4.9, 0.03, K.mat('#cdd2d8', { roughness: 0.3, metalness: 0.85 }), 72);
    K.koy(kapak, kabarti, 2.35, 0.075, 0);
    var kv = [[-L / 2 + 0.45, W / 2 - 0.45], [L / 2 - 0.45, W / 2 - 0.45], [-L / 2 + 0.45, -W / 2 + 0.45], [L / 2 - 0.45, -W / 2 + 0.45],
      [0.2, -W / 2 + 0.45], [0.2, W / 2 - 0.45], [2.35, 0], [-3.4, 3.3]];
    K.koy(kapak, K.ornekle(K.geoPaylas('hdd-kapak-vida', function () { return new THREE.CylinderGeometry(0.2, 0.2, 0.07, 14); }),
      K.mat('#4b5563', { metalness: 0.8, roughness: 0.35 }), kv.map(function (x) { return [x[0], 0.09, x[1]]; })), 0, 0, 0);
    kapak.position.y = H - 0.08;
    g.add(kapak);

    // Etiket (markasız): tür, kapasite, dönüş hızı, arayüz, barkod
    var etiketDoku = K.canvasDoku(512, 360, function (ctx, w, h) {
      ctx.fillStyle = '#f3f4f6'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1f2937'; ctx.fillRect(0, 0, w, 58);
      ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.font = '800 32px Arial, sans-serif';
      ctx.fillText('SABİT DİSK · 3,5 inç', 22, 30);
      ctx.fillStyle = '#111827'; ctx.font = '900 70px Arial, sans-serif'; ctx.fillText(ops.kapasite || '1 TB', 22, 118);
      ctx.font = '700 32px Arial, sans-serif'; ctx.fillText(ops.hiz || '7200 dev/dk', 22, 180);
      ctx.fillText('SATA', 22, 224);
      ctx.fillStyle = '#9ca3af'; ctx.fillRect(22, 262, 300, 70);
      ctx.fillStyle = '#f3f4f6';
      for (var b = 0; b < 58; b++) ctx.fillRect(26 + b * 5, 266, (b % 3) + 1, 62);
      ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 3; ctx.strokeRect(350, 250, 130, 90);
      ctx.font = '700 20px Arial, sans-serif'; ctx.fillStyle = '#374151'; ctx.fillText('Açmayın', 368, 295);
    });
    var etiket = K.duzlem(7.4, 5.2, new THREE.MeshStandardMaterial({ map: etiketDoku, roughness: 0.65 }));
    etiket.rotation.x = -Math.PI / 2;
    etiket.userData.golgeYok = true;
    K.parca(etiket, 'hdd-etiket', 'Etiket', 'Kapasite (1 TB), dönüş hızı (dakikada 7200 dönüş) ve bağlantı türü (SATA) yazar.');
    K.koy(kapak, etiket, 1.9, 0.095, 0);
    etiket.rotation.set(-Math.PI / 2, 0, 0);

    // Alt devre kartı (koyu yeşil) + çipler
    var kart = new THREE.Group();
    K.parca(kart, 'hdd-kart', 'Denetleyici kart', 'Diskin altındaki kart: motoru ve kafayı yönetir, veriyi SATA ile anakarta gönderir.');
    K.koy(kart, K.kutu(10.8, 0.12, 9.0, K.mat('#1f4a33', { roughness: 0.6 }), 0.05), 0, 0.06, 0);
    [[-2.2, 0, 1.2, 1.2], [0.6, -1.8, 1.0, 1.0], [0.6, 1.6, 0.9, 1.4], [3.2, 0.2, 1.6, 0.9]].forEach(function (c) {
      K.koy(kart, K.kutu(c[2], 0.06, c[3], 'cip', 0.02), c[0], 0, c[1]);
    });
    kart.position.x = -L / 2 + 5.6;
    g.add(kart);

    // SATA konnektörleri (arka, kart hizasında)
    var kon = new THREE.Group();
    kon.rotation.y = -Math.PI / 2;
    kon.position.set(-L / 2 - 0.02, 0.36, 0);
    var veri = D.sataKonnektor(K, 'veri', { ayna: true });
    var guc = D.sataKonnektor(K, 'guc');
    veri.position.set(-1.6, 0, -0.45);
    guc.position.set(0.55, 0, -0.45);
    K.parca(veri, 'sata-veri', 'SATA veri girişi (7 pin)', 'Verinin anakartla gidip geldiği giriş. L biçimi sayesinde kablo ters takılamaz.');
    K.parca(guc, 'sata-guc', 'SATA güç girişi (15 pin)', 'Güç kaynağından gelen elektriğin girdiği daha geniş giriş; o da L biçimlidir.');
    kon.add(veri, guc);
    g.add(kon);
    // Konnektör çevresindeki gövde oyuğu (koyu)
    K.koy(g, K.kutu(0.1, 0.62, 4.6, K.mat('#2a2d33', { roughness: 0.7 }), 0.02), -L / 2 + 0.02, 0.4, -0.3).userData.secilmez = true;

    // Yan vida delikleri (her yanda 3) — kasa kızağına vidalanır
    var delikGrup = new THREE.Group();
    K.parca(delikGrup, 'hdd-vida-delikleri', 'Vida delikleri', 'Disk bu deliklerden kasadaki yuvaya vidalanır; sarsılmaz.');
    var delikGeo = K.geoPaylas('hdd-yan-delik', function () { var c = new THREE.CylinderGeometry(0.19, 0.19, 0.03, 18); c.rotateX(Math.PI / 2); return c; });
    var delikMat = K.mat('#15171b', { roughness: 0.8 });
    var delikler = [];
    [L / 2 - 2.9, L / 2 - 6.0, L / 2 - 10.2].forEach(function (x) {
      [-1, 1].forEach(function (yz) {
        var d = new THREE.Mesh(delikGeo, delikMat);
        d.position.set(x, 0.75, yz * (W / 2 + 0.012));
        d.userData.yon = yz;
        delikGrup.add(d);
        delikler.push(d);
      });
    });
    g.add(delikGrup);

    g.userData.sataVeri = veri;
    g.userData.sataGuc = guc;
    g.userData.vidaDelikleri = delikler;
    g.userData.olcu = { L: L, H: H, W: W };
    return g;
  });
})(window.DON3D);
