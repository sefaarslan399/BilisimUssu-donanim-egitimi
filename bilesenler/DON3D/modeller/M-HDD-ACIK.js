/* M-HDD-ACIK — 3,5 inç sabit disk (HDD), iç yapısı şeffaf kapaktan görünür.
   bagimli: M-SSD
   Ölçü birimi: cm (14,7 × 2,61 × 10,16). Orijin: alt-orta. Uzun kenar X (konnektörler −X ucunda), genişlik Z, yükseklik Y.
   Plaka: 95 mm çap (3,5 inç disklerde olduğu gibi), merkez X = +2,35. Kol mili (pivot): X = −3,4, Z = +3,3.
   Parçalar: 'hdd-plaka' (plakalar, rotor içinde), 'hdd-mil' (mil motoru göbeği), 'hdd-kafa' (okuma-yazma kafası),
   'hdd-kol' (kafa kolu / aktüatör), 'hdd-bobin' (kol motoru: mıknatıs + bobin), 'hdd-rampa' (park rampası),
   'hdd-kapak' (şeffaf kapak), 'hdd-govde' (döküm gövde), 'hdd-kart' (alttaki devre kartı), 'sata-veri', 'sata-guc'.
   ops: { plaka: 2 (1–4), kapak: true (false → kapak çizilmez) }
   userData:
     rotor: THREE.Group — plakalar + göbek; Y ekseninde döndürülür (ör. DON3D.dondurParca(rotor, { eksen: 'y' })).
     kafaGit(oran, sure) → Promise — kafayı bir ize götürür: oran 0 = en iç iz, 1 = en dış iz.
     park(sure) → Promise — kafayı plakanın dışındaki rampaya çeker.
     izYaricap(oran) → cm · izGoster(oran | null) — üst plakada vurgulu iz halkası (null: gizle).
     kafa, kol, plakalar[], kapak, olcu: {L, H, W, plakaMerkez: Vector3, plakaR}
   Gerçekte: kapak metaldir ve disk asla açılmaz (toz plakayı çizer). Plaka 5400 ya da 7200 dev/dk döner; derste yavaşlatılır. */
(function (D) {
  'use strict';
  var L = 14.7, H = 2.61, W = 10.16;
  var CX = 2.35, PR = 4.75;                    // plaka merkezi (X) ve yarıçapı
  var PX = -3.4, PZ = 3.3, KOL = 5.0;          // kol mili konumu ve kafa uzaklığı
  var IC = 1.8, DIS = 4.5, PARK = 4.78;        // iz yarıçapları (cm)

  function aciBul(r) {
    // Kafa P + KOL·(cos θ, sin θ) noktası, plaka merkezine r uzaklıkta olsun (XZ düzlemi)
    var dx = CX - PX, dz = 0 - PZ, d = Math.sqrt(dx * dx + dz * dz);
    var f0 = Math.atan2(dz, dx);
    var c = (KOL * KOL + d * d - r * r) / (2 * KOL * d);
    return f0 + Math.acos(Math.max(-1, Math.min(1, c)));
  }

  function yuvarlakSekil(s, w, h, r, yol) {
    var x = -w / 2, y = -h / 2;
    yol = yol || s;
    yol.moveTo(x + r, y); yol.lineTo(x + w - r, y); yol.quadraticCurveTo(x + w, y, x + w, y + r);
    yol.lineTo(x + w, y + h - r); yol.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    yol.lineTo(x + r, y + h); yol.quadraticCurveTo(x, y + h, x, y + h - r);
    yol.lineTo(x, y + r); yol.quadraticCurveTo(x, y, x + r, y);
    return yol;
  }

  D.modelTanimla('M-HDD-ACIK', function (K, ops) {
    var THREE = K.THREE, V3 = K.V3;
    ops = ops || {};
    var n = Math.max(1, Math.min(4, ops.plaka || 2));
    var g = new THREE.Group();
    K.parca(g, 'M-HDD-ACIK', 'Sabit disk (HDD)', 'Veriyi dönen plakalara manyetik olarak yazar. İçinde hareketli parçalar vardır.');

    var alu = K.mat('#9ba1a9', { roughness: 0.55, metalness: 0.7 });
    var aluKoyu = K.mat('#868c95', { roughness: 0.55, metalness: 0.7 });

    /* Alt devre kartı */
    var kart = new THREE.Group();
    K.parca(kart, 'hdd-kart', 'Denetleyici kart', 'Diskin altındaki kart: motoru ve kafayı yönetir, veriyi SATA ile anakarta gönderir.');
    K.koy(kart, K.kutu(13.6, 0.12, 9.4, K.mat('#1f4a33', { roughness: 0.6 }), 0.05), 0, 0.06, 0);
    g.add(kart);

    /* Döküm gövde: taban + çevre duvarı + plaka kalkanı */
    var govde = new THREE.Group();
    K.parca(govde, 'hdd-govde', 'Gövde', 'Alüminyum döküm gövde. Parçaları taşır; içini tozdan korur.');
    K.koy(govde, K.kutu(L, 0.42, W, alu, 0.12), 0, 0.15 + 0.21, 0);
    var dis = new THREE.Shape();
    yuvarlakSekil(dis, L, W, 0.35);
    var ic = new THREE.Path();
    yuvarlakSekil(null, L - 0.5, W - 0.5, 0.25, ic);
    dis.holes.push(ic);
    var duvarH = H - 0.06 - 0.57;
    var duvarGeo = new THREE.ExtrudeGeometry(dis, { depth: duvarH, bevelEnabled: false, curveSegments: 6 });
    duvarGeo.rotateX(-Math.PI / 2);
    var duvar = new THREE.Mesh(duvarGeo, alu);
    duvar.position.y = 0.57;
    govde.add(duvar);
    // Plaka kalkanı: plakayı saran kavisli duvar (kol tarafı açık)
    var ks = new THREE.Shape();
    var a0 = -105 * Math.PI / 180, a1 = 165 * Math.PI / 180;
    ks.absarc(0, 0, PR + 0.34, a0, a1, false);
    ks.absarc(0, 0, PR + 0.16, a1, a0, true);
    var kalkanGeo = new THREE.ExtrudeGeometry(ks, { depth: 1.25, bevelEnabled: false, curveSegments: 48 });
    kalkanGeo.rotateX(-Math.PI / 2);
    var kalkan = new THREE.Mesh(kalkanGeo, aluKoyu);
    kalkan.position.set(CX, 0.57, 0);
    govde.add(kalkan);
    // Hava filtresi (beyaz) ve kol yatağı tabanı
    K.koy(govde, K.kutu(0.9, 0.9, 0.3, K.mat('#eef0f2', { roughness: 0.9 }), 0.06), 6.4, 1.05, -4.2).rotation.y = 0.5;
    K.koy(govde, K.silindir(0.85, 0.3, aluKoyu, 28), PX, 0.72, PZ);
    g.add(govde);

    /* Rotor: plakalar + göbek + sıkıştırma kapağı */
    var rotor = new THREE.Group();
    rotor.position.set(CX, 0, 0);
    var plakaDoku = K.canvasDoku(512, 512, function (ctx, w, h) {
      var cx = w / 2, cy = h / 2;
      ctx.fillStyle = '#e7eaee'; ctx.fillRect(0, 0, w, h);
      for (var r = 60; r < w / 2; r += 3) {
        ctx.strokeStyle = 'rgba(120,130,145,' + (0.05 + ((r * 7) % 11) / 160).toFixed(3) + ')';
        ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      // Hafif parlak kama: dönüşün gözle görülmesine yardım eder
      var gr = ctx.createRadialGradient(cx, cy, 40, cx, cy, w / 2);
      gr.addColorStop(0, 'rgba(255,255,255,0.0)'); gr.addColorStop(1, 'rgba(255,255,255,0.4)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, w / 2, -0.35, 0.05); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(70,80,95,0.10)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, w / 2, 2.6, 3.1); ctx.closePath(); ctx.fill();
    });
    var plakaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: plakaDoku, metalness: 0.88, roughness: 0.16 });
    var plakaGrup = new THREE.Group();
    K.parca(plakaGrup, 'hdd-plaka', 'Plaka', 'Verinin manyetik olarak yazıldığı ayna gibi parlak disk. Dakikada 5400 ya da 7200 kez döner.');
    var plakalar = [];
    var ARALIK = 0.4, Y0 = 0.95, KAL = 0.127;
    for (var i = 0; i < n; i++) {
      var p = new THREE.Mesh(K.geoPaylas('hdd-plaka', function () { return new THREE.CylinderGeometry(PR, PR, KAL, 96, 1); }), plakaMat);
      p.position.y = Y0 + i * ARALIK;
      plakaGrup.add(p);
      plakalar.push(p);
    }
    rotor.add(plakaGrup);
    var ustY = Y0 + (n - 1) * ARALIK + KAL / 2;
    var gobek = new THREE.Group();
    K.parca(gobek, 'hdd-mil', 'Mil motoru', 'Plakaları sabit hızla döndüren motorun göbeği.');
    var gobekH = ustY - 0.57 + 0.05;
    K.koy(gobek, K.silindir(1.25, gobekH, K.mat('celik'), 40), 0, 0.57 + gobekH / 2, 0);
    var kelepce = K.silindir(1.55, 0.08, K.mat('#c9ced5', { roughness: 0.25, metalness: 0.95 }), 48);
    K.koy(gobek, kelepce, 0, ustY + 0.1, 0);
    var vidalar = [];
    for (var v = 0; v < 6; v++) {
      var a = v / 6 * Math.PI * 2;
      vidalar.push([Math.cos(a) * 0.95, ustY + 0.17, Math.sin(a) * 0.95]);
    }
    K.koy(gobek, K.ornekle(K.geoPaylas('hdd-vida-k', function () { return new THREE.CylinderGeometry(0.14, 0.14, 0.07, 12); }), K.mat('#6b7280', { metalness: 0.8, roughness: 0.35 }), vidalar), 0, 0, 0);
    K.koy(gobek, K.silindir(0.3, 0.1, K.mat('#4b5563', { metalness: 0.7, roughness: 0.4 }), 16), 0, ustY + 0.18, 0);
    rotor.add(gobek);
    g.add(rotor);

    /* İz vurgusu (üst plakada halka; sabit, dönmez) */
    var izMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#f59e0b'), transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide });
    izMat.toneMapped = false;
    var iz = new THREE.Mesh(new THREE.RingGeometry(0.975, 1.025, 96), izMat);
    iz.rotation.x = -Math.PI / 2;
    iz.position.set(CX, ustY + 0.004, 0);
    iz.visible = false;
    iz.userData.secilmez = true; iz.userData.golgeYok = true;
    iz.raycast = function () {};
    g.add(iz);

    /* Kafa kolu (aktüatör): mil + her plaka yüzeyi için kol + süspansiyon + kafa, arkada bobin */
    var kol = new THREE.Group();
    K.parca(kol, 'hdd-kol', 'Kafa kolu (aktüatör)', 'Kafayı plakanın içi ile dışı arasında çok hızlı gidip getirir.');
    kol.position.set(PX, 0, PZ);
    var kolMat = K.mat('#a7adb5', { roughness: 0.32, metalness: 0.85 });
    var susMat = K.mat('#d7dbe0', { roughness: 0.22, metalness: 0.95 });
    var kolSekil = new THREE.Shape();
    kolSekil.moveTo(0, -0.62); kolSekil.lineTo(3.55, -0.24); kolSekil.lineTo(3.55, 0.24); kolSekil.lineTo(0, 0.62); kolSekil.closePath();
    var kolDelik = new THREE.Path(); kolDelik.moveTo(1.2, -0.2); kolDelik.lineTo(2.5, -0.12); kolDelik.lineTo(2.5, 0.12); kolDelik.lineTo(1.2, 0.2); kolDelik.closePath();
    kolSekil.holes.push(kolDelik);
    var kolGeo = new THREE.ExtrudeGeometry(kolSekil, { depth: 0.09, bevelEnabled: false });
    kolGeo.rotateX(-Math.PI / 2);
    var susSekil = new THREE.Shape();
    susSekil.moveTo(3.3, -0.2); susSekil.lineTo(4.95, -0.06); susSekil.lineTo(4.95, 0.06); susSekil.lineTo(3.3, 0.2); susSekil.closePath();
    var susGeo = new THREE.ExtrudeGeometry(susSekil, { depth: 0.025, bevelEnabled: false });
    susGeo.rotateX(-Math.PI / 2);
    var kafaGeo = K.yuvarlakKutuGeo(0.16, 0.05, 0.13, 0.015, 1);
    var kafalar = [];
    // Yüzeyler: her plakanın üstü ve altı. Kollar plakaların arasında.
    for (var k = 0; k <= n; k++) {
      var y = Y0 + (k - 0.5) * ARALIK;
      var km = new THREE.Mesh(kolGeo, kolMat);
      km.position.y = y - 0.045;
      kol.add(km);
      [k > 0 ? -1 : 0, k < n ? 1 : 0].forEach(function (yon) {
        if (!yon) return;
        var sm = new THREE.Mesh(susGeo, susMat);
        sm.position.y = y + yon * 0.05 - 0.0125;
        kol.add(sm);
        var kf = new THREE.Mesh(kafaGeo, K.mat('#2f3136', { roughness: 0.35, metalness: 0.3 }));
        kf.position.set(KOL, y + yon * 0.086, 0);
        kol.add(kf);
        kafalar.push(kf);
      });
    }
    var eblokH = n * ARALIK + 0.2;
    var eblok = K.silindir(0.55, eblokH, K.mat('#8c929a', { roughness: 0.35, metalness: 0.85 }), 28);
    eblok.position.y = Y0 + (n - 1) * ARALIK / 2;
    kol.add(eblok);
    K.koy(kol, K.silindir(0.32, 0.12, K.mat('#5b616a', { metalness: 0.8, roughness: 0.3 }), 16), 0, eblok.position.y + eblokH / 2 + 0.06, 0);
    // Bobin (kolun arka ucunda, mıknatısların arasında)
    var bobinSekil = new THREE.Shape();
    bobinSekil.moveTo(-0.5, -0.5); bobinSekil.lineTo(-2.1, -1.0); bobinSekil.quadraticCurveTo(-2.45, 0, -2.1, 1.0); bobinSekil.lineTo(-0.5, 0.5); bobinSekil.closePath();
    var bobinDelik = new THREE.Path();
    bobinDelik.moveTo(-0.9, -0.3); bobinDelik.lineTo(-1.85, -0.62); bobinDelik.quadraticCurveTo(-2.05, 0, -1.85, 0.62); bobinDelik.lineTo(-0.9, 0.3); bobinDelik.closePath();
    bobinSekil.holes.push(bobinDelik);
    var bobinGeo = new THREE.ExtrudeGeometry(bobinSekil, { depth: 0.22, bevelEnabled: false, curveSegments: 8 });
    bobinGeo.rotateX(-Math.PI / 2);
    var bobin = new THREE.Mesh(bobinGeo, K.mat('#9a5b2c', { roughness: 0.45, metalness: 0.5 }));
    bobin.position.y = Y0 + (n - 1) * ARALIK / 2 - 0.11;
    kol.add(bobin);
    g.add(kol);
    var kafa = kafalar[kafalar.length - 1];      // üst plakanın üstündeki kafa
    K.parca(kafa, 'hdd-kafa', 'Okuma-yazma kafası', 'Plakaya değmez; saç telinden çok daha ince bir hava boşluğuyla üstünde süzülerek veriyi okur ve yazar.');

    // Kol motoru mıknatısı (sabit; bobinin üstünde, parlak nikel)
    var mikSekil = new THREE.Shape();
    mikSekil.absarc(0, 0, 2.7, 2.62, 3.75, false);
    mikSekil.absarc(0, 0, 0.85, 3.75, 2.62, true);
    var mikGeo = new THREE.ExtrudeGeometry(mikSekil, { depth: 0.2, bevelEnabled: false, curveSegments: 20 });
    mikGeo.rotateX(-Math.PI / 2);
    var mik = new THREE.Mesh(mikGeo, K.mat('#c3c8ce', { roughness: 0.2, metalness: 0.95 }));
    K.parca(mik, 'hdd-bobin', 'Kol motoru', 'Mıknatıs ile bobin kolu döndürür; kafa bir izden ötekine milisaniyeler içinde gider.');
    mik.position.set(PX, Y0 + (n - 0.5) * ARALIK + 0.1, PZ);
    g.add(mik);
    // Park rampası (plakanın dış kenarında)
    var aPark = aciBul(PARK);
    var rampa = K.kutu(0.55, 0.28, 0.5, K.mat('#2a2d33', { roughness: 0.6 }), 0.06);
    K.parca(rampa, 'hdd-rampa', 'Park rampası', 'Disk dururken kafa buraya çekilir; böylece plakaya değmez.');
    K.koy(g, rampa, PX + Math.cos(aPark) * (KOL + 0.45), ustY - 0.05, PZ + Math.sin(aPark) * (KOL + 0.45));
    rampa.rotation.y = -aPark;
    // Esnek kablo (amber şerit): koldan konnektöre
    var flex = K.kutu(2.6, 0.5, 0.03, K.mat('#c47f1a', { roughness: 0.5, metalness: 0.2 }), 0.01);
    K.koy(g, flex, PX - 1.55, 1.05, PZ + 0.35);
    flex.userData.secilmez = true;
    K.koy(g, K.kutu(0.6, 0.7, 1.1, K.mat('#2b2e33', { roughness: 0.5 }), 0.06), -6.4, 1.0, PZ + 0.1).userData.secilmez = true;

    /* SATA konnektörleri (arka, kart hizasında) */
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

    /* Şeffaf kapak + köşe vidaları */
    var kapak = new THREE.Group();
    K.parca(kapak, 'hdd-kapak', 'Kapak (burada şeffaf)', 'Gerçek disklerde kapak metaldir ve açılmaz: içine giren tek toz tanesi bile plakayı çizebilir.');
    if (ops.kapak !== false) {
      var ks2 = new THREE.Shape();
      yuvarlakSekil(ks2, L, W, 0.35);
      var kapakGeo = new THREE.ExtrudeGeometry(ks2, { depth: 0.06, bevelEnabled: false, curveSegments: 6 });
      kapakGeo.rotateX(-Math.PI / 2);
      var kapakMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false });
      var kc = new THREE.Mesh(kapakGeo, kapakMat);
      kc.renderOrder = 3;
      kc.userData.golgeYok = true;
      kc.castShadow = false;
      kapak.add(kc);
      var kv = [[-L / 2 + 0.45, W / 2 - 0.45], [L / 2 - 0.45, W / 2 - 0.45], [-L / 2 + 0.45, -W / 2 + 0.45], [L / 2 - 0.45, -W / 2 + 0.45], [0.2, -W / 2 + 0.45], [0.2, W / 2 - 0.45]];
      K.koy(kapak, K.ornekle(K.geoPaylas('hdd-kapak-vida', function () { return new THREE.CylinderGeometry(0.2, 0.2, 0.07, 14); }), K.mat('#4b5563', { metalness: 0.8, roughness: 0.35 }),
        kv.map(function (x) { return [x[0], 0.09, x[1]]; })), 0, 0, 0);
      kapak.position.y = H - 0.06;
      g.add(kapak);
    }
    g.traverse(function (o) { if (o.isMesh && o.material && o.material.transparent && o.material.opacity < 0.5) o.userData.golgeYok = true; });

    /* API */
    var aci = aciBul(PARK);
    function uygula(a) { aci = a; kol.rotation.y = -a; }
    uygula(aciBul(IC + (DIS - IC) * 0.6));
    g.userData.rotor = rotor;
    g.userData.kol = kol;
    g.userData.kafa = kafa;
    g.userData.plakalar = plakalar;
    g.userData.kapak = kapak;
    g.userData.izYaricap = function (oran) { return IC + (DIS - IC) * Math.max(0, Math.min(1, oran)); };
    function kolTween(hedef, sure) {
      var a0 = aci;
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.35 : sure, anahtar: 'kafa', hedef: g, ease: 'easeInOutCubic',
        guncelle: function (e) { uygula(a0 + (hedef - a0) * e); } });
    }
    g.userData.kafaGit = function (oran, sure) { return kolTween(aciBul(g.userData.izYaricap(oran)), sure); };
    g.userData.park = function (sure) { return kolTween(aciBul(PARK), sure == null ? 0.6 : sure); };
    g.userData.izGoster = function (oran) {
      if (oran == null) { iz.visible = false; return; }
      var r = g.userData.izYaricap(oran);
      iz.scale.set(r, r, 1);
      iz.visible = true;
    };
    g.userData.olcu = { L: L, H: H, W: W, plakaMerkez: new V3(CX, ustY, 0), plakaR: PR };
    return g;
  });
})(window.DON3D);
