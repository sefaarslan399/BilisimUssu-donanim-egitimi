/* M-GPU — harici ekran kartı (2 yuvalık, çift fanlı). Marka ve logo yok.
   bagimli: M-ARKA-PANEL
   Ölçü birimi: cm (≈ 24 uzunluk × 11 yükseklik × 4 kalınlık; 2 genişleme yuvası).
   Orijin: PCIe x16 tarağının alt kenarının ortası, PCB'nin orta düzlemi.
   Yön: uzunluk X (metal kulak/braket −X ucunda, kart +X'e uzanır); yükseklik Y (tarak y = 0'da, alttadır);
        kalınlık Z (soğutucu örtüsü ve fanlar +Z yüzünde, arka plaka −Z yüzünde). Görüntü çıkışları braketten −X yönüne bakar.
        Fanlar +Z'den −Z'ye doğru, yani karta doğru üfler (hava kanatçıklardan kenarlara çıkar).
   Tarak: kısa bölüm (11 temas) brakete yakın, sonra kilit (yön) çentiği, sonra uzun bölüm (71 temas); uzun bölümün ucunda
          yuvanın mandalının tuttuğu küçük kanca çentiği. Her yüzde 82 altın temas.
   Parçalar: 'gpu-ortu' (plastik/metal örtü), 'gpu-fan-1', 'gpu-fan-2' (fanlar; dönen rotorlar), 'gpu-kanatcik' (alüminyum kanatçıklar),
             'gpu-isi-borusu' (bakır ısı boruları), 'gpu-arka-plaka' (metal arka plaka), 'gpu-pcie' (PCIe x16 tarağı, altın temaslar),
             'gpu-guc-girisi' (8 pinli PCIe güç girişi), 'gpu-braket' (metal kulak), 'port-hdmi', 'port-dp-1…3' (görüntü çıkışları; bkz. M-ARKA-PANEL D.portYap),
             'gpu-cip' (grafik işlemcisi, GPU), 'gpu-bellek' (ekran belleği çipleri), 'gpu-pcb' (kart; seçilmez).
             GPU çipi ve bellekler soğutucunun altındadır; yalnız patlat() ile soğutucu ayrılınca görünür.
   ops: { hiz: fan hızı rad/sn (varsayılan 0) }
   userData API:
     olcu                   → { L, H, T, braketX, tarakL, parmakH, pcbUst, fanX: [x1, x2], fanY, fanR, gucX }
     rotorlar               → [rotor1, rotor2] (THREE.Group; yerel Z ekseninde döner)
     hiz                    → istenen açısal hız (rad/sn); baslat() bu değeri kullanır
     baslat(sahne?)         → iki rotoru her karede döndürür. Döner: durdur()
     hizAyarla(hiz, sure)   → Promise; hızı yumuşakça değiştirir (sure 0 → anında)
     sogutucu               → örtü + fanlar + kanatçıklar + ısı boruları grubu (patlatmada birlikte hareket eder)
     arkaPlaka              → arka plaka grubu
     patlatMesafe           → patlatmada soğutucunun +Z yönündeki ayrılma mesafesi (cm, varsayılan 5)
     patlat(oran, sure)     → Promise (sure 0: anında); A-PATLAT: 0 = birleşik, 1 = ayrık (soğutucu +Z, arka plaka −Z yönünde ayrılır;
                               GPU çipi ve bellek çipleri görünür)
     portlar                → [HDMI, DP, DP, DP] port grupları (ağız −X yönüne bakar; userData.agiz yereli D.portYap'taki gibidir)
     gucAgiz                → 8 pinli girişin ağız ortası (model yereli, Vector3); kablo buraya +Y yönünden gelir
     tarakMerkez            → tarak alt kenarının ortası (model yereli = orijin); yuvaya −Y yönünde girer
   Kullanım: DON-201 H09; DON-301 H07, H10. */
(function (D) {
  'use strict';
  D.modelTanimla('M-GPU', function (K, ops) {
    var THREE = K.THREE, V3 = K.V3;
    ops = ops || {};
    // ── Ölçüler
    var L = 24, T = 4.0;
    var FH = 0.82;                    // tarak (parmak) yüksekliği: PCB'nin ana alt kenarı bu yükseklikte
    var PH = 11.0;                    // PCB üst kenarı
    var TL = 8.9, TA = -TL / 2;       // tarak uzunluğu ve sol ucu (orijin tarağın ortası)
    var BX = TA - 2.3;                // braket düzlemi (DOĞRULA: tarak–braket uzaklığı yaklaşık)
    var SX = BX + L;                  // kartın uzak ucu
    var PT = 0.16;                    // PCB kalınlığı
    var ZO0 = 0.62, ZF1 = 2.2, ZO1 = 3.1; // kanatçık yığını z aralığı (ZO0–ZF1) ve ön örtü plakasının iç yüzü (ZO1)
    var FY = (FH + PH) / 2 + 0.1, FR = 4.25;
    var FX = [BX + 6.25, BX + 15.9];
    var g = new THREE.Group();
    K.parca(g, 'M-GPU', 'Ekran kartı', 'Ekranda gördüğün görüntüyü hazırlar. Kendi işlemcisi (GPU), belleği ve soğutucusu vardır.');

    // ── PCB: tarak çıkıntısı, kilit (yön) çentiği ve uçtaki kanca çentiği (ekstrüzyon)
    var s = new THREE.Shape();
    var kx = TA + 0.25 + 1.1;          // kısa bölüm (11 temas) ile uzun bölüm arasındaki çentik
    s.moveTo(BX + 0.1, PH);
    s.lineTo(BX + 0.1, FH);
    s.lineTo(TA, FH); s.lineTo(TA, 0.12); s.lineTo(TA + 0.12, 0);
    s.lineTo(kx, 0); s.lineTo(kx, FH - 0.06); s.lineTo(kx + 0.2, FH - 0.06); s.lineTo(kx + 0.2, 0);
    s.lineTo(-TA - 0.12, 0); s.lineTo(-TA, 0.12);
    s.lineTo(-TA, 0.26); s.lineTo(-TA - 0.34, 0.26); s.lineTo(-TA - 0.34, 0.56); s.lineTo(-TA, 0.56);
    s.lineTo(-TA, FH);
    s.lineTo(SX - 0.3, FH); s.lineTo(SX - 0.3, PH);
    s.lineTo(BX + 0.1, PH);
    var pcbGeo = new THREE.ExtrudeGeometry(s, { depth: PT, bevelEnabled: false });
    pcbGeo.translate(0, 0, -PT / 2);
    var pcbDoku = K.canvasDoku(512, 256, function (ctx, w, h) {   // ince devre yolları (UV = cm)
      ctx.fillStyle = '#1d1f24'; ctx.fillRect(0, 0, w, h);
      var r = K.rng(17);
      ctx.strokeStyle = 'rgba(120,130,145,0.22)'; ctx.lineWidth = 1.2;
      for (var j = 0; j < 90; j++) {
        var x0 = r() * w, y0 = r() * h;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + (r() - 0.5) * 90, y0); ctx.lineTo(x0 + (r() - 0.5) * 90, y0 + (r() - 0.5) * 60); ctx.stroke();
      }
    });
    pcbDoku.wrapS = pcbDoku.wrapT = THREE.RepeatWrapping;
    pcbDoku.repeat.set(1 / L, 1 / 12);
    pcbDoku.offset.set(-BX / L, 0);
    var pcb = new THREE.Mesh(pcbGeo, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.6, metalness: 0.05 }));
    K.parca(pcb, 'gpu-pcb', 'Devre kartı', 'Ekran kartının tüm parçaları bu kartın üzerindedir.');
    pcb.userData.secilmez = true;
    g.add(pcb);

    // ── PCIe x16 tarağı: iki yüzde 82'şer altın temas (11 + 71), InstancedMesh
    var tarak = new THREE.Group();
    K.parca(tarak, 'gpu-pcie', 'PCIe x16 tarağı', 'Anakarttaki uzun PCIe yuvasına girer. Aradaki çentik kartın yalnız doğru yönde girmesini sağlar.');
    var temasGeo = K.geoPaylas('gpu-temas', function () { return new THREE.BoxGeometry(0.07, 0.7, 0.012); });
    var tk = [];
    for (var i = 0; i < 82; i++) {
      var x = i < 11 ? TA + 0.3 + i * 0.1 : kx + 0.2 + 0.05 + (i - 11) * 0.1;
      tk.push([x, 0.43, PT / 2 + 0.006]);
      tk.push([x, 0.43, -PT / 2 - 0.006]);
    }
    tarak.add(K.ornekle(temasGeo, 'altin', tk));
    g.add(tarak);

    // ── Kart üstündeki bileşenler (soğutucunun altında): GPU çipi, bellek, güç düzenleyiciler
    var CX = BX + 10.6, CY = 5.6;
    var cip = new THREE.Group();
    K.parca(cip, 'gpu-cip', 'Grafik işlemcisi (GPU)', 'Ekran kartının kendi işlemcisi. Binlerce küçük çekirdekle görüntüyü hesaplar.');
    K.koy(cip, K.kutu(4.0, 4.0, 0.12, K.mat('#1e4d33', { roughness: 0.6 }), 0.05), CX, CY, PT / 2 + 0.06);
    K.koy(cip, K.kutu(2.1, 2.1, 0.08, K.mat('#6b7280', { roughness: 0.15, metalness: 0.9 }), 0.03), CX, CY, PT / 2 + 0.16);
    g.add(cip);
    var bellek = new THREE.Group();
    K.parca(bellek, 'gpu-bellek', 'Ekran belleği (VRAM)', 'Ekran kartının kendi belleği. Görüntü için gereken dokuları ve kareleri tutar.');
    var bmGeo = K.yuvarlakKutuGeo(1.4, 1.2, 0.1, 0.03, 1);
    var bmKonum = [];
    [-1, 1].forEach(function (yon) {
      [-2.1, 0, 2.1].forEach(function (dy) { bmKonum.push([CX + yon * 3.35, CY + dy, PT / 2 + 0.05]); });
    });
    [-1.1, 1.1].forEach(function (dx) { bmKonum.push([CX + dx, CY + 3.55, PT / 2 + 0.05]); });
    bellek.add(K.ornekle(bmGeo, K.mat('#3a3d44', { roughness: 0.5 }), bmKonum));
    g.add(bellek);
    var bobinGeo = K.yuvarlakKutuGeo(0.7, 0.7, 0.5, 0.06, 1);
    var bobinler = [];
    for (i = 0; i < 6; i++) bobinler.push([BX + 16.4 + (i % 3) * 1.0, 3.0 + Math.floor(i / 3) * 5.4, PT / 2 + 0.25]);
    var bobin = K.ornekle(bobinGeo, K.mat('#3f444c', { roughness: 0.5, metalness: 0.4 }), bobinler);
    bobin.userData.secilmez = true;
    g.add(bobin);

    // ── Arka plaka (metal, −Z yüzü): ince oluklar + vidalar
    var arka = new THREE.Group();
    K.parca(arka, 'gpu-arka-plaka', 'Arka plaka', 'Kartı eğilmeye karşı güçlendirir ve arka yüzü korur.');
    var apDoku = K.canvasDoku(512, 256, function (ctx, w, h) {
      ctx.fillStyle = '#2b2f36'; ctx.fillRect(0, 0, w, h);
      var r = K.rng(31);
      for (var j = 0; j < 220; j++) { ctx.fillStyle = 'rgba(255,255,255,' + (0.015 + r() * 0.03).toFixed(3) + ')'; ctx.fillRect(0, r() * h, w, 1); }
      ctx.fillStyle = '#16181c';
      for (var k = 0; k < 7; k++) { K.yuvarlakDikdortgen(ctx, w * 0.62 + k * 18, h * 0.3, 8, h * 0.4, 4); ctx.fill(); }
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2;
      K.yuvarlakDikdortgen(ctx, 10, 10, w - 20, h - 20, 12); ctx.stroke();
    });
    var apW = L - 0.9, apH = PH - FH - 0.3;
    var ap = K.kutu(apW, apH, 0.16, new THREE.MeshStandardMaterial({ map: apDoku, roughness: 0.4, metalness: 0.75 }), 0.06);
    K.koy(arka, ap, BX + 0.35 + apW / 2, FH + 0.15 + apH / 2, -PT / 2 - 0.12);
    var vidaGeo = K.geoPaylas('gpu-vida', function () { var v = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 12); v.rotateX(Math.PI / 2); return v; });
    var vk = [[CX - 2.6, CY - 2.6], [CX + 2.6, CY - 2.6], [CX - 2.6, CY + 2.6], [CX + 2.6, CY + 2.6], [BX + 1.2, FH + 1.0], [BX + 1.2, PH - 0.9], [SX - 1.3, FH + 1.0], [SX - 1.3, PH - 0.9]]
      .map(function (p) { return [p[0], p[1], -PT / 2 - 0.23]; });
    arka.add(K.ornekle(vidaGeo, 'celik', vk));
    g.add(arka);

    // ── Soğutucu bloğu: kanatçıklar, ısı boruları, taban, örtü, fanlar
    var sog = new THREE.Group();
    sog.name = 'gpu-sogutucu';
    g.add(sog);
    var kanat = new THREE.Group();
    K.parca(kanat, 'gpu-kanatcik', 'Alüminyum kanatçıklar', 'GPU’nun ısısı bu ince kanatçıklara yayılır; fanların havası ısıyı alıp götürür.');
    var fx0 = BX + 1.2, fx1 = SX - 3.4, fy0 = FH + 0.35, fy1 = PH - 0.2;
    var kGeo = K.geoPaylas('gpu-kanat:' + (fy1 - fy0) + ':' + (ZF1 - ZO0), function () { return new THREE.BoxGeometry(0.035, fy1 - fy0, ZF1 - ZO0); });
    var kk = [];
    for (x = fx0; x <= fx1; x += 0.21) kk.push([x, (fy0 + fy1) / 2, (ZO0 + ZF1) / 2]);
    kanat.add(K.ornekle(kGeo, K.mat('#cfd4da', { roughness: 0.32, metalness: 0.85 }), kk));
    // taban plakası (GPU çipine oturur; kanatçıkların altında)
    K.koy(kanat, K.kutu(5.2, 5.2, 0.33, K.mat('#d5d8dc', { roughness: 0.2, metalness: 1 }), 0.05), CX, CY, ZO0 - 0.165);
    sog.add(kanat);
    var borular = new THREE.Group();
    K.parca(borular, 'gpu-isi-borusu', 'Isı boruları', 'Bakır borular ısıyı GPU’dan kanatçıkların her yerine taşır.');
    var boruMat = K.mat('bakir', { roughness: 0.3 });
    [[CY - 1.2, 0.6, 3.4], [CY + 0.2, 0.75, 5.2], [CY + 1.6, 0.9, 7.0]].forEach(function (b, n) {
      var y = b[0], z = b[1], u = b[2];
      var nk = [new V3(fx0 + 0.4 + n * 0.6, y, z), new V3(CX - 2, y, z), new V3(CX + 2, y, z), new V3(CX + u, y + 0.3, z),
        new V3(CX + u + 1.2, PH - 0.4, z + 0.3), new V3(CX + u + 1.0, PH + 0.55, z + 0.5), new V3(CX + u - 0.6, PH + 0.6, z + 0.6),
        new V3(CX + u - 1.4, PH - 0.4, z + 0.7)];
      var boru = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(nk, false, 'centripetal'), 56, 0.26, 8, false), boruMat);
      borular.add(boru);
    });
    sog.add(borular);

    // Örtü: ön plaka (iki fan deliği), üst/alt etekler, uç kapağı; ince metal şeritler
    var ortu = new THREE.Group();
    K.parca(ortu, 'gpu-ortu', 'Soğutucu örtüsü', 'Plastik ve metal örtü; havayı kanatçıkların arasına yönlendirir ve parçaları korur.');
    var ortuDoku = K.canvasDoku(512, 256, function (ctx, w, h) {
      ctx.fillStyle = '#25282e'; ctx.fillRect(0, 0, w, h);
      var r = K.rng(44);
      for (var j = 0; j < 300; j++) { ctx.fillStyle = 'rgba(255,255,255,' + (0.01 + r() * 0.025).toFixed(3) + ')'; ctx.fillRect(r() * w, 0, 1, h); }
      // köşelerde hafif açılı yüzey çizgileri (tasarım ayrıntısı; marka yok)
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(w * 0.455, 0); ctx.lineTo(w * 0.425, h * 0.5); ctx.lineTo(w * 0.455, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.905, 0); ctx.lineTo(w * 0.875, h * 0.5); ctx.lineTo(w * 0.905, h); ctx.stroke();
    });
    var ortuMat = new THREE.MeshStandardMaterial({ map: ortuDoku, roughness: 0.46, metalness: 0.25 });
    var ox0 = BX + 0.95, ox1 = SX - 0.2, oy0 = FH + 0.2, oy1 = PH + 0.2, ork = 0.9;
    var os = new THREE.Shape();
    os.moveTo(ox0 + ork, oy0); os.lineTo(ox1 - ork * 2.2, oy0); os.lineTo(ox1, oy0 + ork * 1.6);
    os.lineTo(ox1, oy1 - ork); os.quadraticCurveTo(ox1, oy1, ox1 - ork, oy1);
    os.lineTo(ox0 + ork, oy1); os.quadraticCurveTo(ox0, oy1, ox0, oy1 - ork);
    os.lineTo(ox0, oy0 + ork); os.quadraticCurveTo(ox0, oy0, ox0 + ork, oy0);
    FX.forEach(function (fx) { var d = new THREE.Path(); d.absarc(fx, FY, FR + 0.12, 0, Math.PI * 2, true); os.holes.push(d); });
    var onGeo = new THREE.ExtrudeGeometry(os, { depth: 0.28, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 1, curveSegments: 36 });
    // UV: x,y düzlemsel (doku örtü boyunca uzasın)
    var uvA = onGeo.attributes.uv, poA = onGeo.attributes.position;
    for (i = 0; i < uvA.count; i++) uvA.setXY(i, (poA.getX(i) - ox0) / (ox1 - ox0), (poA.getY(i) - oy0) / (oy1 - oy0));
    var onPlaka = new THREE.Mesh(onGeo, ortuMat);
    onPlaka.position.z = ZO1;
    ortu.add(onPlaka);
    // etekler (kanatçıkların üst ve alt kenarlarını kısmen örter)
    var etekMat = K.mat('#1d2025', { roughness: 0.5, metalness: 0.2 });
    K.koy(ortu, K.kutu(ox1 - ox0 - 1.6, 0.18, 1.0, etekMat, 0.06), (ox0 + ox1) / 2 - 0.8, oy1 - 0.1, ZO1 - 0.5);
    K.koy(ortu, K.kutu(ox1 - ox0 - 2.4, 0.18, 1.0, etekMat, 0.06), (ox0 + ox1) / 2 - 1.2, oy0 + 0.1, ZO1 - 0.5);
    K.koy(ortu, K.kutu(0.22, oy1 - oy0 - 1.6, ZO1 - 1.2, etekMat, 0.06), ox1 - 0.12, (oy0 + oy1) / 2 + 0.6, (ZO1 + 1.2) / 2);
    // metal vurgu şeritleri ve fan halkaları
    var metal = K.mat('aluminyum', { roughness: 0.28 });
    K.koy(ortu, K.kutu(ox1 - ox0 - 2.2, 0.12, 0.08, metal, 0.03), (ox0 + ox1) / 2 - 0.6, oy1 - 0.42, ZO1 + 0.36);
    var halkaGeo = K.geoPaylas('gpu-halka:' + FR, function () { return new THREE.TorusGeometry(FR + 0.16, 0.07, 6, 56); });
    FX.forEach(function (fx) { K.koy(ortu, new THREE.Mesh(halkaGeo, metal), fx, FY, ZO1 + 0.3); });
    sog.add(ortu);

    // Fanlar: 11 eğik kanat + göbek + arkada 3 payanda
    var kanatMat = new THREE.MeshStandardMaterial({ color: 0x1f2227, roughness: 0.42, metalness: 0.05, side: THREE.DoubleSide });
    var gpuKanatGeo = K.geoPaylas('gpu-fan-kanat:' + FR, function () {
      var rh = 1.25, rt = FR - 0.08, nu = 9, nv = 5, konum = [], indeks = [];
      for (var a = 0; a <= nu; a++) {
        var t = a / nu, r = rh + (rt - rh) * t, sup = 0.5 * Math.pow(t, 1.2), gen = 0.5 + 0.12 * t;
        for (var b = 0; b <= nv; b++) {
          var sv = b / nv - 0.5, f = sup + sv * gen;
          konum.push(Math.cos(f) * r, Math.sin(f) * r, sv * gen * 1.3 * (1 - 0.2 * t));
        }
      }
      for (a = 0; a < nu; a++) {
        for (b = 0; b < nv; b++) {
          var a0 = a * (nv + 1) + b, a1 = a0 + 1, b0 = a0 + nv + 1, b1 = b0 + 1;
          indeks.push(a0, b0, a1, a1, b0, b1);
        }
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
      geo.setIndex(indeks);
      geo.computeVertexNormals();
      return geo;
    });
    var gobekDoku = K.canvasDoku(128, 128, function (ctx, w, h) {
      ctx.fillStyle = '#23262c'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3a3f47'; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8b929c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 16, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#2b2f36'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 14, 0, Math.PI * 2); ctx.fill();
    });
    var gobekKapak = new THREE.MeshStandardMaterial({ map: gobekDoku, roughness: 0.45, metalness: 0.3 });
    var payandaGeo = K.yuvarlakKutuGeo(FR - 1.2, 0.3, 0.2, 0.05, 1);
    var rotorlar = [];
    FX.forEach(function (fx, n) {
      var fan = new THREE.Group();
      K.parca(fan, 'gpu-fan-' + (n + 1), 'Fan ' + (n + 1), 'Serin havayı kanatçıkların arasına üfler; ısınan hava kartın kenarlarından çıkar.');
      var rotor = new THREE.Group();
      var gobek = K.silindir(1.25, 0.8, kanatMat, 28);
      gobek.rotation.x = Math.PI / 2;
      rotor.add(gobek);
      var kap = new THREE.Mesh(K.geoPaylas('gpu-gobek-kapak', function () { return new THREE.CircleGeometry(1.25, 28); }), gobekKapak);
      kap.position.z = 0.41;
      rotor.add(kap);
      for (var b = 0; b < 11; b++) {
        var k = new THREE.Mesh(gpuKanatGeo, kanatMat);
        k.rotation.z = b * Math.PI * 2 / 11;
        rotor.add(k);
      }
      rotor.position.set(fx, FY, ZO1 - 0.3);
      fan.add(rotor);
      rotorlar.push(rotor);
      // motor tabanı ve payandalar (dönmez)
      var taban = K.silindir(1.1, 0.25, etekMat, 20);
      taban.rotation.x = Math.PI / 2;
      K.koy(fan, taban, fx, FY, ZO1 - 0.85);
      taban.rotation.x = Math.PI / 2;
      for (var p = 0; p < 3; p++) {
        var aci = Math.PI / 2 + p * Math.PI * 2 / 3;
        var py = new THREE.Mesh(payandaGeo, etekMat);
        py.position.set(fx + Math.cos(aci) * (0.8 + (FR - 1.2) / 2), FY + Math.sin(aci) * (0.8 + (FR - 1.2) / 2), ZO1 - 0.8);
        py.rotation.z = aci;
        fan.add(py);
      }
      sog.add(fan);
    });

    // ── 8 pinli PCIe güç girişi (üst kenarda, uzak uca yakın; ağız +Y)
    var guc = new THREE.Group();
    K.parca(guc, 'gpu-guc-girisi', '8 pinli güç girişi', 'Güç kaynağından gelen kablo buraya takılır. Güçlü ekran kartı yuvadan aldığından fazla elektrik ister.');
    var GX = SX - 1.9, GZ = PT / 2 + 0.5;
    K.koy(guc, K.kutu(2.1, 1.0, 0.95, 'plastikSiyah', 0.05), 0, 0, 0);
    var pinGeo = K.geoPaylas('gpu-pin-yuva', function () { return new THREE.BoxGeometry(0.34, 0.04, 0.34); });
    var pk = [];
    for (i = 0; i < 8; i++) pk.push([-0.75 + (i % 4) * 0.5, 0.505, i < 4 ? -0.22 : 0.22]);
    guc.add(K.ornekle(pinGeo, K.mat('#050506'), pk));
    K.koy(guc, K.kutu(0.5, 0.35, 0.18, 'plastikSiyah', 0.04), 0, 0.2, 0.55);   // mandal çıkıntısı
    guc.position.set(GX, PH - 0.42, GZ);
    g.add(guc);

    // ── Braket (metal kulak): ana levha, alt dil, üstte dışa kıvrık kulak (iki vida çentiği), görüntü çıkışları
    var braket = new THREE.Group();
    K.parca(braket, 'gpu-braket', 'Metal kulak (braket)', 'Kartı kasanın arkasına vidayla sabitler. Görüntü çıkışları bu levhanın üzerindedir.');
    var bz0 = -0.45, bz1 = T - 0.45, by0 = 0.2, by1 = PH + 0.45;
    var celikMat = K.mat('#b9bec6', { roughness: 0.38, metalness: 0.85 });
    K.koy(braket, K.kutu(0.08, by1 - by0, bz1 - bz0, celikMat), BX - 0.04, (by0 + by1) / 2, (bz0 + bz1) / 2);
    K.koy(braket, K.kutu(0.08, 1.2, 1.0, celikMat), BX - 0.04, by0 - 0.6, 0.55);        // alt dil (kasadaki boşluğa girer)
    var ks = new THREE.Shape(), kd = 1.05;
    ks.moveTo(0, bz0); ks.lineTo(kd, bz0);
    [[0.55, 0.36], [2.6, 0.36]].forEach(function (c) { ks.lineTo(kd, c[0] - c[1] / 2); ks.lineTo(kd - 0.55, c[0] - c[1] / 2); ks.lineTo(kd - 0.55, c[0] + c[1] / 2); ks.lineTo(kd, c[0] + c[1] / 2); });
    ks.lineTo(kd, bz1); ks.lineTo(0, bz1); ks.lineTo(0, bz0);
    var kulakGeo = new THREE.ExtrudeGeometry(ks, { depth: 0.08, bevelEnabled: false });
    var kulak = new THREE.Mesh(kulakGeo, celikMat);
    kulak.rotation.x = Math.PI / 2;           // şekil (x, y) → (x, z); derinlik → −y
    kulak.scale.x = -1;                        // −X yönüne (dışa) kıvrık
    kulak.position.set(BX, by1 + 0.08, 0);
    braket.add(kulak);
    // Braket dış yüzü: havalandırma yarıkları + port ağızları için koyu delikler (doku)
    var PORTLAR = [['dp-1', 1.75], ['dp-2', 3.45], ['hdmi', 5.15], ['dp-3', 6.85]];
    var PZ = PT / 2 + 0.78;
    var bw = bz1 - bz0, bh = by1 - by0;
    var braketDoku = K.canvasDoku(256, 512, function (ctx, w, h) {
      var sx = w / bw, sy = h / bh;
      ctx.fillStyle = '#b9bec6'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0b0c0e';
      PORTLAR.forEach(function (p) {
        var genis = p[0] === 'hdmi' ? 1.42 : 1.6;
        ctx.fillRect((PZ - bz0 - genis / 2 - 0.05) * sx, h - (p[1] - by0 + 0.33) * sy, (genis + 0.1) * sx, 0.66 * sy);
      });
      for (var v = 0; v < 13; v++) {        // havalandırma yarıkları (soğutucu tarafı)
        K.yuvarlakDikdortgen(ctx, (1.95 - bz0) * sx, h - (0.9 + v * 0.78 + 0.5) * sy, 1.35 * sx, 0.46 * sy, 0.2 * sx); ctx.fill();
      }
    });
    var yuz = K.duzlem(bw, bh, new THREE.MeshStandardMaterial({ map: braketDoku, roughness: 0.38, metalness: 0.8 }));
    yuz.rotation.y = -Math.PI / 2;
    yuz.position.set(BX - 0.085, (by0 + by1) / 2, (bz0 + bz1) / 2);
    yuz.userData.secilmez = true;
    braket.add(yuz);
    g.add(braket);
    var portlar = [];
    PORTLAR.forEach(function (p) {
      var port = D.portYap(p[0], K);
      port.rotation.y = -Math.PI / 2;          // ağız −X yönüne bakar; port genişliği Z boyunca
      port.position.set(BX - 0.1, p[1], PZ);
      g.add(port);
      portlar.push(port);
    });

    // ── API
    g.userData.rotorlar = rotorlar;
    g.userData.hiz = ops.hiz || 0;
    g.userData.baslat = function (sahne) {
      var sh = sahne || D.sahneBul(g);
      if (!sh) return function () {};
      return sh.herKare(function (dt) {
        var d = g.userData.hiz * dt * (D.azHareket() ? 0.15 : 1);
        rotorlar[0].rotation.z -= d; rotorlar[1].rotation.z -= d;
      });
    };
    g.userData.hizAyarla = function (yeni, sure) {
      var bas = g.userData.hiz;
      if (sure === 0) { g.userData.hiz = yeni; return Promise.resolve(); }
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 1 : sure, anahtar: 'gpu-fan-hiz', hedef: g,
        guncelle: function (e) { g.userData.hiz = bas + (yeni - bas) * e; } });
    };
    g.userData.sogutucu = sog;
    g.userData.arkaPlaka = arka;
    g.userData.patlatMesafe = 5;
    g.userData.patlatOrani = 0;
    function patlatUygula(o) {
      g.userData.patlatOrani = o;
      sog.position.z = o * g.userData.patlatMesafe;
      arka.position.z = -o * g.userData.patlatMesafe * 0.4;
    }
    g.userData.patlat = function (oran, sure) {
      var bas = g.userData.patlatOrani;
      if (sure === 0) { patlatUygula(oran); return Promise.resolve(); }
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 1 : sure, anahtar: 'gpu-patlat', hedef: g,
        guncelle: function (e) { patlatUygula(bas + (oran - bas) * e); } });
    };
    g.userData.portlar = portlar;
    g.userData.gucAgiz = new V3(GX, PH + 0.08, GZ);
    g.userData.tarakMerkez = new V3(0, 0, 0);
    g.userData.olcu = { L: L, H: PH + 0.45, T: T, braketX: BX, tarakL: TL, parmakH: FH, pcbUst: PH, fanX: FX.slice(), fanY: FY, fanR: FR, gucX: GX };
    return g;
  });
})(window.DON3D);
