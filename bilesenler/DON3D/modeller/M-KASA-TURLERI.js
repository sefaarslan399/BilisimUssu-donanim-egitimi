/* M-KASA-TURLERI — kasa türleri karşılaştırma seti: masaüstü (kule kasa), dizüstü, tümleşik (all-in-one).
   bagimli: M-MASAUSTU, M-DIZUSTU, M-ARKA-PANEL
   Ölçü birimi: cm (üçü de gerçek boyutta; boy farkı görülsün). Orijin: zemin, dizinin ortası. Ön yüzler +Z.
   Dizilim (soldan sağa): masaüstü · dizüstü · tümleşik. Her biri kendi döner tablasının üstündedir.
   ops.tur: 'hepsi' (varsayılan) | 'masaustu' | 'dizustu' | 'tumlesik' → yalnız o tür (orijinde).
   ops.tabla: false → döner tablalar çizilmez. ops.aralik: tablalar arası boşluk (cm, varsayılan 10).
   Adlandırılmış parçalar: tur-masaustu, tur-dizustu, tur-tumlesik (E-BILGI / A-VURGU);
     tümleşiğin alt parçaları: tumlesik-ekran, tumlesik-govde (parçaların saklandığı arka gövde), tumlesik-ayak, port-* (arka portlar).
   userData.turler: { masaustu, dizustu, tumlesik } → döner tabla grupları (A-KARSILASTIR: rotation.y ile döndürülür)
   userData.ozellik: { tur: { ad, tasinir, ekran, yukseltme } } kısa karşılaştırma metinleri.
   M-TUMLESIK ayrıca kaydedilir: yalnız tümleşik bilgisayar (orijin alt-orta, ekran +Z).
   Görüntüleme seti olduğundan adsız sabit mesh'ler malzemeye göre birleştirilir (DON3D.sabitBirlestir). */
(function (D) {
  'use strict';
  var OZELLIK = {
    masaustu: { ad: 'Masaüstü (kule kasa)', tasinir: 'Hayır, masada durur', ekran: 'Ayrı monitör', yukseltme: 'Kolay: kasa açılır' },
    dizustu: { ad: 'Dizüstü', tasinir: 'Evet, pilli', ekran: 'Kapağın içinde', yukseltme: 'Sınırlı' },
    tumlesik: { ad: 'Tümleşik (all-in-one)', tasinir: 'Zor, prize bağlı', ekran: 'Kasayla tek parça', yukseltme: 'Sınırlı' }
  };
  D.KASA_OZELLIK = OZELLIK;

  /* Aynı düğümdeki, aynı malzemeli adsız sabit mesh'leri tek mesh'te birleştirir (çizim çağrısını azaltır).
     Adlı parçalar, InstancedMesh'ler ve alt öğesi olanlar dokunulmadan kalır. */
  function birlestirYerel(THREE, kok) {
    var dugumler = [];
    kok.traverse(function (o) { if (o.children.length > 1) dugumler.push(o); });
    dugumler.forEach(function (d) {
      var gruplar = {};
      d.children.slice().forEach(function (c) {
        if (!c.isMesh || c.isInstancedMesh || c.name || c.children.length || Array.isArray(c.material)) return;
        var at = c.geometry.attributes;
        if (!at.uv || !at.normal || at.uv.itemSize !== 2) return;
        var ana = c.material.uuid + '|' + JSON.stringify(c.userData) + '|' + c.renderOrder + '|' + c.castShadow;
        (gruplar[ana] = gruplar[ana] || []).push(c);
      });
      Object.keys(gruplar).forEach(function (a) {
        var l = gruplar[a];
        if (l.length < 2) return;
        var poz = [], nor = [], uv = [];
        l.forEach(function (c) {
          c.updateMatrix();
          var gg = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone();
          gg.applyMatrix4(c.matrix);
          poz.push(gg.attributes.position.array); nor.push(gg.attributes.normal.array); uv.push(gg.attributes.uv.array);
          gg.dispose();
          d.remove(c);
        });
        function ekle(parcalar) {
          var n = 0, o = 0;
          parcalar.forEach(function (x) { n += x.length; });
          var out = new Float32Array(n);
          parcalar.forEach(function (x) { out.set(x, o); o += x.length; });
          return out;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(ekle(poz), 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(ekle(nor), 3));
        geo.setAttribute('uv', new THREE.BufferAttribute(ekle(uv), 2));
        geo.computeBoundingBox(); geo.computeBoundingSphere();
        var m = new THREE.Mesh(geo, l[0].material);
        m.userData = Object.assign({}, l[0].userData);
        m.renderOrder = l[0].renderOrder; m.castShadow = l[0].castShadow;
        d.add(m);
      });
    });
  }
  D.sabitBirlestir = D.sabitBirlestir || birlestirYerel;

  /* Tümleşik bilgisayar: 24 inç ekran, arkasında parçaların saklandığı gövde, eğik ayak */
  D.modelTanimla('M-TUMLESIK', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-TUMLESIK', 'Tümleşik bilgisayar', 'Ekran ve bilgisayar tek parçadır; anakart, işlemci ve disk ekranın arkasındaki gövdededir.');
    var EW = 54.2, EH = 36.5, ET = 1.1, cene = 4.2;                        // ekran genişliği, yüksekliği, kalınlığı, alt çene
    var govdeMat = K.mat('#d9dce1', { roughness: 0.38, metalness: 0.55 });
    var koyu = K.mat('#15171b', { roughness: 0.3, metalness: 0.2 });
    var ekranGrup = new THREE.Group();
    ekranGrup.position.set(0, 13.5, 0);
    ekranGrup.rotation.x = -0.08;                                          // hafif geriye eğik
    g.add(ekranGrup);
    // ön çerçeve + panel
    var cerceve = K.kutu(EW, EH, ET, koyu, 0.5, 2);
    K.koy(ekranGrup, cerceve, 0, EH / 2, 0);
    cerceve.userData.secilmez = true;
    K.koy(ekranGrup, K.kutu(EW, cene, ET + 0.05, govdeMat, 0.5, 2), 0, cene / 2, 0.01).userData.secilmez = true;
    var ekranDoku = K.canvasDoku(512, 300, function (ctx, w, h) {
      var gr = ctx.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#22d3ee'); gr.addColorStop(0.55, '#6366f1'); gr.addColorStop(1, '#a855f7');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; K.yuvarlakDikdortgen(ctx, 70, 54, 220, 140, 10); ctx.fill();
      ctx.fillStyle = 'rgba(99,102,241,0.55)'; ctx.fillRect(70, 54, 220, 20);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; K.yuvarlakDikdortgen(ctx, 310, 86, 130, 110, 10); ctx.fill();
      ctx.fillStyle = 'rgba(15,23,42,0.6)'; ctx.fillRect(0, h - 24, w, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      for (var i = 0; i < 6; i++) { K.yuvarlakDikdortgen(ctx, w / 2 - 75 + i * 26, h - 20, 16, 16, 4); ctx.fill(); }
    });
    var panel = K.duzlem(EW - 1.6, EH - cene - 1.4, new THREE.MeshStandardMaterial({ map: ekranDoku, emissive: 0xffffff, emissiveMap: ekranDoku, emissiveIntensity: 0.55, roughness: 0.18 }));
    K.koy(ekranGrup, panel, 0, cene + (EH - cene - 1.4) / 2 + 0.2, ET / 2 + 0.02);
    K.parca(panel, 'tumlesik-ekran', 'Ekran', 'Görüntünün çıktığı yer. Bilgisayar da bu ekranın hemen arkasındadır.');
    panel.userData.golgeYok = true;
    // kamera noktası ve güç ışığı
    var kam = K.silindir(0.35, 0.1, koyu, 16); kam.rotation.x = Math.PI / 2;
    K.koy(ekranGrup, kam, 0, EH - 0.55, ET / 2 + 0.02).userData.secilmez = true;
    K.koy(ekranGrup, K.kutu(0.9, 0.12, 0.12, K.led('#e2e8f0', 1.4), 0.04), EW / 2 - 3, 1.2, ET / 2 + 0.04).userData.secilmez = true;
    // arka gövde (anakart, işlemci, disk, fan burada)
    var govde = new THREE.Group();
    K.parca(govde, 'tumlesik-govde', 'Arka gövde', 'Anakart, işlemci, RAM, disk ve fan ekranın arkasındaki bu gövdeye sığdırılmıştır.');
    var gg = K.kutu(34, 22, 3.4, govdeMat, 1.4, 3);
    K.koy(govde, gg, 0, 0, 0);
    var izgara = K.duzlem(20, 2.2, new THREE.MeshStandardMaterial({ map: K.izgaraDoku('#c9cdd3', '#3a3f48'), roughness: 0.5, metalness: 0.5 }));
    izgara.rotation.y = Math.PI;
    K.koy(govde, izgara, 0, 8.4, -1.71).rotation.y = Math.PI;
    izgara.userData.secilmez = true;
    K.koy(ekranGrup, govde, 0, 14, -ET / 2 - 1.6);
    // arka portlar (−Z yönüne bakar)
    var portlar = [];
    [['usba-1', -9, -7.5], ['usba-2', -6.6, -7.5], ['usbc', -4.4, -7.5], ['rj45', -1.8, -7.3], ['ses-yesil', 1.0, -7.5]].forEach(function (p) {
      var port = D.portYap(p[0], K);
      port.rotation.y = Math.PI;
      K.koy(govde, port, p[1], p[2], -1.72);
      portlar.push(port);
    });
    // güç girişi
    var guc = K.silindir(0.55, 0.3, koyu, 16); guc.rotation.x = Math.PI / 2;
    K.koy(govde, guc, 6, -7.5, -1.8).userData.secilmez = true;
    // ayak: eğik boyun + taban
    var ayak = new THREE.Group();
    K.parca(ayak, 'tumlesik-ayak', 'Ayak', 'Ekranı ve içindeki bilgisayarı taşır; açısı ayarlanabilir.');
    var ayakMat = K.mat('#c3c8cf', { roughness: 0.3, metalness: 0.85 });
    var boyun = K.kutu(13, 22, 1.2, ayakMat, 0.4, 2);
    boyun.rotation.x = 0.2;
    K.koy(ayak, boyun, 0, 11.6, -7.6);
    K.koy(ayak, K.kutu(22, 0.9, 19, ayakMat, 0.45, 2), 0, 0.45, -4.5);
    g.add(ayak);
    g.userData.portlar = portlar;
    g.userData.olcu = { W: EW, H: EH + 13.5 };
    return g;
  });

  D.modelTanimla('M-KASA-TURLERI', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-KASA-TURLERI', 'Kasa türleri', 'Masaüstü, dizüstü ve tümleşik bilgisayarın karşılaştırması.');
    var tabloMat = K.mat('#e5e9ef', { roughness: 0.55, metalness: 0.1 });
    var kenarMat = K.mat('#94a3b8', { roughness: 0.4, metalness: 0.4 });
    var TUR = [
      { ad: 'masaustu', r: 26, uret: function () { var m = D.model('M-MASAUSTU'); m.rotation.y = -0.35; return m; } },
      { ad: 'dizustu', r: 21, uret: function () { var m = D.model('M-DIZUSTU'); m.position.z = 2; return m; } },
      { ad: 'tumlesik', r: 29, uret: function () { var m = D.model('M-TUMLESIK'); m.position.z = 3; return m; } }
    ];
    if (ops.tur && ops.tur !== 'hepsi') TUR = TUR.filter(function (t) { return t.ad === ops.tur; });
    var aralik = ops.aralik == null ? 10 : ops.aralik;
    var toplam = TUR.reduce(function (a, t) { return a + 2 * t.r; }, 0) + aralik * (TUR.length - 1);
    var x = -toplam / 2, turler = {};
    TUR.forEach(function (t) {
      x += t.r;
      var tabla = new THREE.Group();
      var o = OZELLIK[t.ad];
      K.parca(tabla, 'tur-' + t.ad, o.ad, 'Taşınır mı: ' + o.tasinir + '. Ekran: ' + o.ekran + '. Parça ekleme: ' + o.yukseltme + '.');
      var m = t.uret();
      var ic = new THREE.Group();
      ic.add(m);
      tabla.add(ic);
      if (ops.tabla !== false) {
        var disk = K.silindir(t.r, 1.2, tabloMat, 48);
        K.koy(tabla, disk, 0, 0.6, 0);
        disk.userData.secilmez = true;
        var halka = new THREE.Mesh(new THREE.TorusGeometry(t.r, 0.35, 8, 64), kenarMat);
        halka.rotation.x = Math.PI / 2;
        K.koy(tabla, halka, 0, 1.2, 0);
        halka.userData.secilmez = true;
        ic.position.y = 1.2;
      }
      tabla.position.x = TUR.length > 1 ? x : 0;
      g.add(tabla);
      turler[t.ad] = tabla;
      x += t.r + aralik;
    });
    D.sabitBirlestir(THREE, g);
    g.userData.turler = turler;
    g.userData.ozellik = OZELLIK;
    return g;
  });
})(window.DON3D);
