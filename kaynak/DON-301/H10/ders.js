/* DON-301 H10 — Montaj 2: Kasada ve İlk POST · ders betiği (ortak betikten sonra çalışır)
   Adım 1–6: iki panelli atölye slaytlarında 3D provalar. Kasa (M-MASAUSTU-ACIK) sol yanı yukarıda yatırılmıştır:
   anakart tepsisi zemindedir, anakart (M-ANAKART) doğal yatay konumunda mesafe vidalarının üstüne oturur.
   Etkinlik 1: E-MONTAJ (kasa aşaması; ön panelde E-TAK pin seçimi). Etkinlik 2: kontrolcü kartları (2D).
   Güç kaynağı yalnız dıştan gösterilir (M-PSU); içi hiçbir yerde açılmaz. */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var THREE = window.THREE, K = D.kit, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 2’deki provada kartın altına birlikte bakacağız.');

  /* ─────────── Yerleşim (dünya koordinatı, cm) ───────────
     Kasa yan yatık: kasanın üstü +X, önü +Z, arkası −Z; açık yan +Y'ye bakar, tepsi iç yüzü y = TEPSI. */
  var KX = -22.5, KY = 10.5, TEPSI = 0.6, AYAK_H = 0.65, T = 0.16;
  var KART = new V3(6, TEPSI + AYAK_H, -7.9);         // M-ANAKART orijini (alt yüz ortası); rotation.y = −π/2
  var ARKA = -20.4;                                    // arka panelin iç yüzü
  var DELIK = [[-11.55, -14.4], [-0.9, -14.4], [10.9, -14.4], [-11.55, -0.3], [-0.9, -0.3], [10.9, -0.3],
    [-11.55, 13.6], [-0.9, 13.6], [10.9, 13.6]];       // M-ANAKART vida delikleri (kart x, z)
  var FAZLA = [4.6, 6.6];                              // kartta delik olmayan yer: fazla ayak
  var VIDA_SIRA = [0, 8, 2, 6, 1, 7, 3, 5, 4];         // önce çapraz köşeler
  var PSU_YER = new V3(-11.7, 9.6, -13.4);
  var CIKIS = { g24: new V3(-15, 6.5, -6.2), eps: new V3(-15, 9.6, -6.2), pcie: new V3(-15, 12.6, -6.2), sata: new V3(-18, 4.6, -6.2) };
  var GROMET = { A: new V3(-10.3, 0, -2), B: new V3(12, 0, 5.6), C: new V3(21.5, 0, -11.2), D: new V3(-7.4, 0, 6.4), E: new V3(19.6, 0, 18.6) };
  var ON_UST = new V3(20.2, 3, 20.4);                  // ön panel kablolarının kasa önünden çıktığı yer
  var SSD_YER = new V3(-15, TEPSI + 0.02, 11);
  var CPU_DOGRU = -Math.PI / 2, SOKET_Y = 0.31;        // H09 ile aynı (M-CPU üçgeni soket üçgenine)

  function el(etiket, sinif, ebeveyn, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function ses(ad) { try { D.ses(ad); } catch (e) { /* ses yoksa sessiz */ } }
  function kaldirHepsi(liste) { liste.forEach(function (e) { e.kaldir(); }); liste.length = 0; }
  function sn(x) { return AZ ? 0.01 : x; }
  function v(x, y, z) { return new V3(x, y, z); }
  function dunya(o) { o.updateWorldMatrix(true, false); return o.getWorldPosition(new V3()); }
  function kartDunya(x, z, y) { return new V3(KART.x - z, y == null ? KART.y : y, KART.z + x); }
  function secilmez(o) { o.traverse(function (x) { x.userData.secilmez = true; }); return o; }

  /* Kamera: yön vektörüyle bir noktaya bakış (kameraGit biçimi) */
  function bakis(hedef, yon, yakinlik) {
    var y = new V3().fromArray(yon).normalize();
    return { theta: Math.atan2(y.x, y.z), phi: Math.acos(y.y), yakinlik: yakinlik, hedef: hedef.clone() };
  }
  function odak(s, nokta, yon, pay) {
    s.ops.kamera = { yon: yon, pay: pay, hedefOfset: nokta.clone().sub(s._merkez).toArray() };
    s.kameraSigdir();
  }
  function baslangic(s) { var b = s._baslangic; return { theta: b.theta, phi: b.phi, yakinlik: b.yakinlik, hedef: b.hedef.clone() }; }

  /* ─────────── Küçük parçalar ─────────── */
  var PIRINC = null;
  function ayakYap() {
    if (!PIRINC) PIRINC = K.mat('#c9a44c', { roughness: 0.35, metalness: 0.8 });
    var g = new THREE.Group();
    var m = K.silindir(0.3, AYAK_H, PIRINC, 6);
    m.position.y = AYAK_H / 2;
    g.add(m);
    K.koy(g, K.silindir(0.12, 0.02, K.mat('#3a2f16'), 10), 0, AYAK_H + 0.005, 0);
    K.parca(g, 'mesafe-vidasi', 'Mesafe vidası', 'Anakartı tepsiden birkaç milimetre yukarıda tutar; yalnız kartta delik olan yere takılır.');
    return g;
  }
  function vidaYap(r) {
    r = r || 0.32;
    var g = new THREE.Group();
    K.koy(g, K.silindir(r, 0.16, 'celik', 16), 0, 0.08, 0);
    var oyuk = K.mat('#2b2e33');
    K.koy(g, K.kutu(r * 1.1, 0.03, 0.07, oyuk), 0, 0.165, 0);
    K.koy(g, K.kutu(0.07, 0.03, r * 1.1, oyuk), 0, 0.165, 0);
    return secilmez(g);
  }
  /* Vida takma: yukarıdan dönerek iner (ebeveyn koordinatında) */
  function vidala(vd, hedef, sure) {
    vd.visible = true;
    var ust = hedef.clone().add(v(0, 1.6, 0));
    vd.position.copy(ust);
    return D.tween({ sahne: D.sahneBul(vd), sure: sn(sure == null ? 0.55 : sure), guncelle: function (e) {
      vd.position.lerpVectors(ust, hedef, e); vd.rotation.y = e * Math.PI * 4;
    } }).then(function () { ses('klik'); });
  }
  function sok(vd, sure) {
    var p0 = vd.position.clone(), p1 = p0.clone().add(v(0, 1.4, 0));
    return D.tween({ sahne: D.sahneBul(vd), sure: sn(sure == null ? 0.55 : sure), guncelle: function (e) {
      vd.position.lerpVectors(p0, p1, e); vd.rotation.y = -e * Math.PI * 4;
    } }).then(function () { vd.visible = false; vd.position.copy(p0); });
  }
  function gromet(r) {
    var g = new THREE.Group();
    K.koy(g, K.silindir(r, 0.03, K.mat('#050506', { roughness: 0.9 }), 20), 0, 0.015, 0);
    var h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.14, 8, 24), K.mat('kaucuk'));
    h.rotation.x = Math.PI / 2; h.position.y = 0.05;
    g.add(h);
    K.parca(g, 'kablo-deligi', 'Lastik kablo deliği', 'Kablolar tepsinin arkasından bu deliklerle çıkar.');
    return g;
  }

  /* G/Ç plakası: port delikleri anakartın arka portlarıyla aynı düzende (ses girişleri alt uçta) */
  var IO_W = 15.9, IO_H = 4.45, IO_MERKEZ = v(14.3, KART.y + T + 2.05, ARKA + 0.05);
  function ioYap() {
    var g = new THREE.Group();
    var doku = K.canvasDoku(512, 144, function (ctx, w, h) {
      ctx.fillStyle = '#c3c8cf'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#9aa1ab'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, w - 4, h - 4);
      function px(x) { return (x - (IO_MERKEZ.x - IO_W / 2)) / IO_W * w; }
      function py(y) { return (IO_MERKEZ.y + IO_H / 2 - y) / IO_H * h; }
      function delik(zm, ym, gw, gh) {                 // kart koordinatı (z, y) → dünya (x = 6 − z, y)
        var x = KART.x - zm, y = KART.y + T + ym;
        ctx.fillStyle = '#16181c';
        ctx.fillRect(px(x) - gw / IO_W * w / 2, py(y) - gh / IO_H * h / 2, gw / IO_W * w, gh / IO_H * h);
      }
      [[-13.9, 1.0], [-13.9, 2.0], [-9.4, 0.9], [-9.4, 1.8], [-6.8, 0.9], [-6.8, 1.8]].forEach(function (p) { delik(p[0], p[1], 1.5, 0.75); });
      delik(-11.7, 1.0, 1.8, 0.7); delik(-11.7, 2.0, 1.7, 0.7); delik(-9.4, 2.7, 1.0, 0.45); delik(-6.8, 3.0, 1.7, 1.45);
      ctx.fillStyle = '#16181c';
      [1.0, 2.0, 3.0].forEach(function (y) { ctx.beginPath(); ctx.arc(px(KART.x + 3.6), py(KART.y + T + y), 0.42 / IO_H * h, 0, Math.PI * 2); ctx.fill(); });
    });
    var govde = K.kutu(IO_W, IO_H, 0.08, K.mat('aluminyum'), 0.04);
    g.add(govde);
    var yuz = K.duzlem(IO_W - 0.04, IO_H - 0.04, new THREE.MeshStandardMaterial({ map: doku, roughness: 0.4, metalness: 0.6 }));
    yuz.position.z = 0.045;
    g.add(yuz);
    K.parca(g, 'io-plakasi', 'G/Ç plakası', 'Arka portların çevresini kapatır; kasaya içeriden bastırılır.');
    return g;
  }

  /* H09'dan hazır kart: işlemci, soğutucu, iki RAM (A2 + B2), M.2 SSD */
  function montajKur(m) {
    m.userData.kapakGoster(false);
    var yer = m.userData.soket.grup.position.clone().add(v(0, SOKET_Y, 0));
    var c = D.model('M-CPU');
    var alt = c.getObjectByName('temas-yuzeyi'); if (alt) alt.visible = false;
    c.position.copy(yer); c.rotation.y = CPU_DOGRU; m.add(c);
    var sog = D.model('M-SOGUTUCU');
    sog.rotation.y = Math.PI / 2;
    sog.position.copy(yer).add(v(0, c.userData.olcu.kapakY, 0));
    m.add(sog);
    [1, 3].forEach(function (i) { var y = m.userData.yuvalar[i], r = D.model('M-RAM'); r.position.copy(y.userData.oturma); y.add(r); });
    var yuva = m.userData.m2[0], ssd = D.model('M-M2');
    ssd.position.copy(yuva.userData.oturma); yuva.add(ssd);
    return { sog: sog };
  }

  function port(ebeveyn, x, y, z, rx, ry, rz) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0);
    ebeveyn.add(o);
    return o;
  }
  function fisYap(tur) {
    var f = D.model('M-KABLO-GUC', { tur: tur, kablo: 'orgulu', kabloUzun: 1.2 });
    return f;
  }
  function takili(f, ag) { D.fisKonumla(f, ag, -f.userData.giris * 0.9); }
  /* Fişin tel ucunun dünya noktası (kablo demeti buradan başlar) */
  function fisUcu(f) {
    f.updateWorldMatrix(true, true);
    var b = new THREE.Box3().setFromObject(f), c = b.getCenter(new V3());
    return v(c.x, b.max.y - 0.3, c.z);
  }
  var DEMET = null;
  function demet(noktalar, r) {
    if (!DEMET) DEMET = K.mat('#16181b', { roughness: 0.75 });
    var k = K.kablo(noktalar, r || 0.3, DEMET);
    secilmez(k);
    return k;
  }
  function kabloBuyut(k, sure) {
    var n = k.geometry.index ? k.geometry.index.count : k.geometry.attributes.position.count;
    k.visible = true;
    return D.tween({ sahne: D.sahneBul(k), sure: sn(sure == null ? 0.9 : sure), guncelle: function (e) {
      k.geometry.setDrawRange(0, Math.max(3, Math.floor(n * e / 3) * 3));
    } }).then(function () { k.geometry.setDrawRange(0, Infinity); });
  }
  function kabloBag(k, t, r) {                         // kablo bağı: demetin t noktasında halka
    var e = k.userData.egri, p = e.getPointAt(t), tg = e.getTangentAt(t);
    var h = new THREE.Mesh(new THREE.TorusGeometry(r + 0.06, 0.07, 6, 18), K.mat('plastikBeyaz'));
    h.position.copy(p);
    h.quaternion.setFromUnitVectors(v(0, 0, 1), tg.normalize());
    return secilmez(h);
  }

  /* ═══════════ Tam sistem: her şey son yerinde kurulur; sahneler gizler/taşır ═══════════ */
  function sistem(s, ops) {
    ops = ops || {};
    var kok = new THREE.Group();
    s.kok.add(kok);
    var S = { kok: kok };
    // Kasa
    var kasa = D.model('M-MASAUSTU-ACIK', { kapakAcik: !ops.kapak });
    ['ic', 'arka-panel'].forEach(function (a) { var o = kasa.getObjectByName(a); if (o) o.visible = false; });
    kasa.userData.yuvalar.forEach(function (y) { y.visible = false; });
    kasa.rotation.z = -Math.PI / 2; kasa.position.set(KX, KY, 0);
    kok.add(kasa);
    S.kasa = kasa; S.kapak = kasa.userData.kapak; S.kelebek = kasa.userData.vidalar;
    S.gucIsigi = kasa.getObjectByName('guc-isigi');
    // Arka açıklıklar (içeriden ve dışarıdan koyu), G/Ç plakası
    var koyu = K.mat('#07080a', { roughness: 0.9 });
    K.koy(kok, K.duzlem(IO_W, IO_H, koyu), IO_MERKEZ.x, IO_MERKEZ.y, ARKA + 0.02);
    K.koy(kok, K.duzlem(IO_W, IO_H, koyu), IO_MERKEZ.x, IO_MERKEZ.y, -21.02, 0, Math.PI, 0);
    S.io = ioYap(); S.io.position.copy(IO_MERKEZ); kok.add(S.io);
    // Tepsi: lastik kablo delikleri
    S.grometler = {};
    Object.keys(GROMET).forEach(function (a) {
      var g = gromet(a === 'C' ? 0.34 : 0.62);
      g.position.copy(GROMET[a]).setY(TEPSI + 0.005);
      kok.add(g); S.grometler[a] = g;
    });
    // Ayaklar
    S.ayaklar = DELIK.map(function (d) { var a = ayakYap(); a.position.copy(kartDunya(d[0], d[1], TEPSI)); kok.add(a); return a; });
    S.fazla = ayakYap(); S.fazla.position.copy(kartDunya(FAZLA[0], FAZLA[1], TEPSI)); kok.add(S.fazla); S.fazla.visible = false;
    // Anakart + H09 parçaları + vidalar
    var m = D.model('M-ANAKART');
    m.rotation.y = -Math.PI / 2; m.position.copy(KART);
    kok.add(m);
    S.m = m;
    S.parca = montajKur(m);
    S.kartVida = DELIK.map(function (d) { var vd = vidaYap(); vd.position.set(d[0], T, d[1]); m.add(vd); return vd; });
    S.vidaYeri = DELIK.map(function (d) { return v(d[0], T, d[1]); });
    // Ön panel fiş bloğu (başlığın üstünde)
    var fp = new THREE.Group();
    K.koy(fp, K.kutu(1.2, 0.62, 0.52, K.mat('#1f2937'), 0.05), 0, 0.31, 0);
    [['#f59e0b', -0.37, 0.13], ['#22c55e', -0.37, -0.13], ['#3b82f6', 0.13, 0.13], ['#ef4444', 0.13, -0.13]].forEach(function (c) {
      K.koy(fp, K.kutu(0.46, 0.06, 0.22, K.mat(c[0])), c[1], 0.64, c[2]);
    });
    K.parca(fp, 'on-panel-fisleri', 'Ön panel fişleri', 'Güç ve sıfırlama düğmesi, güç ve disk ışığı kabloları.');
    fp.position.set(8.6, T + 0.35, 14.3);
    m.add(fp); S.fpBlok = fp;
    // Güç kaynağı (fanı aşağıda: kasanın altındaki filtreli deliğe bakar)
    var psu = D.model('M-PSU', { kablosuz: true });
    psu.rotation.z = Math.PI / 2; psu.position.copy(PSU_YER);
    kok.add(psu); S.psu = psu;
    S.psuVida = [[-19.4, 3.4], [-19.4, 15.8], [-12.6, 3.4], [-12.6, 15.8]].map(function (p) {
      var vd = vidaYap(0.3); vd.rotation.x = -Math.PI / 2; vd.position.set(p[0], p[1], -21.02); kok.add(vd); return vd;
    });
    // Ekran kartı (ilk PCIe x16 yuvasında)
    var slot = m.userData.pcie[0];
    var gpu = D.model('M-GPU');
    gpu.position.copy(slot.userData.oturma);
    slot.add(gpu);
    S.gpu = gpu; S.slot = slot; S.gpuYer = slot.userData.oturma.clone();
    kok.updateMatrixWorld(true);
    // Genişleme yuvası kapakları: ekran kartının braketiyle hizalı 7 yuva
    var bk = new THREE.Box3().setFromObject(gpu.getObjectByName('gpu-braket'));
    var ust = bk.max.y, alt = Math.max(bk.min.y, TEPSI + 0.9), boy = ust - alt;
    var ray = K.kutu(16, 0.35, 1.3, 'kasa', 0.08);
    K.koy(kok, ray, bk.max.x - 7.4, ust + 0.25, ARKA + 0.65);
    S.kapaklar = []; S.kapakVida = [];
    for (var i = 0; i < 7; i++) {
      var x = bk.max.x - 1.016 - i * 2.032;
      K.koy(kok, K.duzlem(1.6, boy - 0.4, koyu), x, alt + boy / 2, ARKA + 0.03);
      var kp = new THREE.Group();
      K.koy(kp, K.kutu(1.85, boy, 0.08, 'kasaIc', 0.03), 0, 0, 0);
      K.koy(kp, K.kutu(1.85, 0.08, 1.2, 'kasaIc', 0.03), 0, boy / 2 - 0.04, 0.6);
      [-0.35, 0.35].forEach(function (yy) { K.koy(kp, K.kutu(1.2, 0.5, 0.02, K.mat('#2a2e35')), 0, yy * boy, 0.05); });
      K.parca(kp, 'yuva-kapagi', 'Genişleme yuvası kapağı', 'Kartın braketi bu açıklığa gelir; kart takılmadan önce sökülür.');
      kp.position.set(x, alt + boy / 2, ARKA + 0.07);
      kok.add(kp); S.kapaklar.push(kp);
      var kv = vidaYap(0.3); kv.position.set(x, ust + 0.43, ARKA + 0.62); kok.add(kv); S.kapakVida.push(kv);
    }
    S.kapakYer = S.kapaklar.map(function (k) { return k.position.clone(); });
    // Fişler ve portlar
    S.p24 = port(m, 10.6, T + 1.25, -6.0, -Math.PI / 2, 0, Math.PI / 2);
    S.pEps = port(m, -6.3, T + 1.25, -14.5, -Math.PI / 2, 0, Math.PI);
    var ga = gpu.userData.gucAgiz;
    S.pPcie = port(gpu, ga.x, ga.y, ga.z, -Math.PI / 2, 0, 0);
    S.k24 = fisYap('atx24'); S.kEps = fisYap('eps'); S.kPcie = fisYap('pcie');
    kok.add(S.k24, S.kEps, S.kPcie);
    kok.updateMatrixWorld(true);
    takili(S.k24, S.p24); takili(S.kEps, S.pEps); takili(S.kPcie, S.pPcie);
    // SSD + SATA
    var ssd = D.model('M-SSD');
    ssd.rotation.y = Math.PI; ssd.position.copy(SSD_YER);
    kok.add(ssd); S.ssd = ssd;
    var sp = D.sataKonnektor(K, 'veri', { ayna: true });
    sp.rotation.y = Math.PI / 2; sp.position.set(12.2, T + 0.45, 8.6); sp.visible = false;
    m.add(sp);
    S.veriA = D.model('M-KABLO-SATA', { tur: 'veri' });
    S.veriB = D.model('M-KABLO-SATA', { tur: 'veri', kabloYok: true });
    S.gucS = D.model('M-KABLO-SATA', { tur: 'guc', tel: 4 });
    kok.add(S.veriA, S.veriB, S.gucS);
    kok.updateMatrixWorld(true);
    S.agV = D.sataAgiz(ssd.userData.sataVeri); S.agG = D.sataAgiz(ssd.userData.sataGuc); S.agK = D.sataAgiz(sp);
    takili(S.veriB, S.agK); takili(S.veriA, S.agV); takili(S.gucS, S.agG);
    S.veriA.userData.kabloBagla(S.veriB.userData.cikis, { ara: [[-6.5, TEPSI + 0.25, 7.2]] });
    S.sataGucDuzenli = function () { S.gucS.userData.kabloBagla(GROMET.D.clone().setY(-0.2), { yon: [0, 1, 0], ara: [[-8.6, TEPSI + 0.6, 8.2]] }); };
    S.sataGucDaginik = function () { S.gucS.userData.kabloBagla(CIKIS.sata.clone(), { yon: [0, 0, 1], ara: [[-9, 6.5, 6], [-14, 7.5, 0]] }); };
    S.sataGucDaginik();
    // Kablo demetleri: dağınık (kartın üstünden) ve düzenli (tepsinin arkasından; tepsi içinde gizli kalır)
    var y0 = 0.2;
    function yol(f) { var u = fisUcu(f); return [u, u.clone().add(v(0, 1.3, 0))]; }
    var u24 = yol(S.k24), uE = yol(S.kEps), uP = yol(S.kPcie);
    var hFp = kartDunya(8.6, 14.3, KART.y + T + 1.0);
    S.kablo = {
      g24: {
        daginik: demet(u24.concat([v(8, 8.5, 0), v(-3, 10.5, -3.5), v(-11.5, 9, -5.4), CIKIS.g24]), 0.42),
        duzenli: demet(u24.concat([v(12, 2.4, 5.2), v(12, y0, 5.6), v(4, y0, 3.5), v(-6, y0, 0), GROMET.A.clone().setY(y0), v(-10.3, 1.8, -3), v(-12.8, 4.8, -5.4), CIKIS.g24]), 0.42)
      },
      eps: {
        daginik: demet(uE.concat([v(19.5, 12, -15), v(12, 19, -13), v(-2, 16.5, -8.5), v(-11.5, 11, -6), CIKIS.eps]), 0.26),
        duzenli: demet(uE.concat([v(21.3, 2.2, -12.6), v(21.5, y0, -11.2), v(10, y0, -7), GROMET.A.clone().setY(y0), v(-10.3, 1.8, -3.2), v(-13, 7, -5.5), CIKIS.eps]), 0.26)
      },
      pcie: {
        daginik: demet(uP.concat([uP[1].clone().add(v(-2, 2.5, -3)), v(-6, 16, -5), v(-12, 14, -5.8), CIKIS.pcie]), 0.26),
        duzenli: demet(uP.concat([uP[1].clone().add(v(0, 0, 3)), v(-6.5, 8, 7.2), v(-7.4, 1.6, 6.6), GROMET.D.clone().setY(y0), v(-9, y0, 2), GROMET.A.clone().setY(y0), v(-10.3, 2, -3.4), v(-13, 10, -5.6), CIKIS.pcie]), 0.26)
      },
      fp: {
        daginik: demet([hFp, hFp.clone().add(v(0, 1, 0)), v(-4, 7, 9), v(9, 8, 17), v(18, 5.5, 20), ON_UST], 0.16),
        duzenli: demet([hFp, hFp.clone().add(v(0.4, 0.9, 1.8)), v(-7.4, 1.5, 6.1), GROMET.D.clone().setY(y0), v(5, y0, 14), GROMET.E.clone().setY(y0), v(19.8, 1.6, 19.3), ON_UST], 0.16)
      }
    };
    Object.keys(S.kablo).forEach(function (a) { kok.add(S.kablo[a].daginik, S.kablo[a].duzenli); });
    S.baglar = new THREE.Group();
    [[S.kablo.g24.duzenli, 0.12, 0.42], [S.kablo.eps.duzenli, 0.1, 0.26], [S.kablo.pcie.duzenli, 0.22, 0.26], [S.kablo.fp.duzenli, 0.1, 0.16], [S.kablo.g24.duzenli, 0.86, 0.42]]
      .forEach(function (b) { S.baglar.add(kabloBag(b[0], b[1], b[2])); });
    kok.add(S.baglar);
    /* Kablo görünümü: mod 'daginik' | 'duzenli'; takili: hangi kablolar bağlı */
    S.kablolar = function (mod, takiliMi) {
      Object.keys(S.kablo).forEach(function (a) {
        var t = takiliMi ? !!takiliMi[a] : true;
        S.kablo[a].daginik.visible = t && mod === 'daginik';
        S.kablo[a].duzenli.visible = t && mod === 'duzenli';
      });
      S.baglar.visible = mod === 'duzenli';
      if (mod === 'duzenli') S.sataGucDuzenli(); else S.sataGucDaginik();
    };
    S.kablolar(ops.kablo || 'duzenli');
    /* Bir grup parçayı gizle/göster */
    S.goster = function (adlar, g) {
      adlar.forEach(function (a) {
        ({
          io: [S.io], ayak: S.ayaklar, kart: [m], vida: S.kartVida, psu: [S.psu], psuVida: S.psuVida,
          gpu: [gpu], k24: [S.k24], eps: [S.kEps], pcie: [S.kPcie], ssd: [ssd], sata: [S.veriA, S.veriB, S.gucS], fp: [S.fpBlok],
          kapaklar: S.kapaklar, kapakVida: S.kapakVida
        })[a].forEach(function (o) { o.visible = g; });
      });
    };
    S.fanlar = function (acik) {
      var f = S.parca.sog.userData.fan;
      if (S._durdur) { S._durdur.forEach(function (d) { d(); }); S._durdur = null; }
      if (!acik) return;
      f.userData.hiz = 14; gpu.userData.hiz = 11;
      S._durdur = [f.userData.baslat(s), gpu.userData.baslat(s)];
    };
    S.isik = function (g) { if (S.gucIsigi) S.gucIsigi.material.emissiveIntensity = g; };
    S.isik(0.05);
    return S;
  }

  /* 3D prova oynatıcı: altyazı + Oynat/Tekrarla (hareket azaltmada Adım adım) */
  function prova(s, adimlar, ops) {
    ops = ops || {};
    var alt = D.div('u-altyazi', s.arayuz);
    alt.setAttribute('aria-live', 'polite');
    var calisiyor = false, sira = 0;
    var btn = s.dugme('Oynat', 'oynat', function () { oynat(); }, { yer: 'alt-sol', sinif: 'don3d-dugme--birincil', aciklama: 'Provayı oynat' });
    if (AZ) s.dugme('Adım adım', 'adim', function () { adim(); }, { yer: 'alt-sol', aciklama: 'Provanın sonraki adımını göster' });
    function yaz(i) { alt.textContent = (i + 1) + '/' + adimlar.length + ' · ' + adimlar[i].metin; }
    function bitir() {
      calisiyor = false;
      btn.innerHTML = D.simge('tekrar') + '<span>Tekrarla</span>';
      if (ops.bitti) ops.bitti();
    }
    function oynat() {
      if (calisiyor) return;
      calisiyor = true; sira = 0;
      if (ops.sifirla) ops.sifirla();
      var z = Promise.resolve();
      adimlar.forEach(function (a, i) {
        z = z.then(function () { yaz(i); return D.bekle(0.45, s); })
          .then(function () { return a.calis(); })
          .then(function () { return D.bekle(a.bekle == null ? 0.9 : a.bekle, s); });
      });
      z.then(bitir, function (e) { console.error(e); calisiyor = false; });
    }
    function adim() {
      if (calisiyor) return;
      if (sira === 0 || sira >= adimlar.length) { sira = 0; if (ops.sifirla) ops.sifirla(); }
      calisiyor = true;
      yaz(sira);
      Promise.resolve(adimlar[sira].calis()).then(function () {
        calisiyor = false; sira++;
        if (sira >= adimlar.length) bitir();
      });
    }
    if (ops.sifirla) ops.sifirla();
    if (!AZ) D.bekle(0.6, s).then(oynat);
    else alt.textContent = 'Adım adım düğmesiyle ilerle.';
    return { oynat: oynat };
  }

  /* POST ekranı (A-BOOT): monitör + anakart hata ışıkları; Promise döner */
  function monitorYap(s) {
    var mon = D.div('h10-monitor', s.arayuz);
    mon.hidden = true;
    mon.innerHTML = '<div class="h10-ekran" aria-live="polite"></div><div class="h10-ledler"><span>CPU</span><span>DRAM</span><span>VGA</span><span>BOOT</span></div>';
    var ekran = mon.querySelector('.h10-ekran'), ledler = mon.querySelectorAll('.h10-ledler span');
    function yaz(satirlar, sinif) {
      ekran.className = 'h10-ekran' + (sinif ? ' ' + sinif : '');
      ekran.innerHTML = '';
      satirlar.forEach(function (t) { el('div', '', ekran, t); });
    }
    return {
      el: mon,
      sifirla: function () { mon.hidden = true; yaz([]); ledler.forEach(function (l) { l.className = ''; }); },
      sinyalYok: function () { mon.hidden = false; yaz(['Sinyal yok'], 'bos'); },
      oynat: function () {
        mon.hidden = false; yaz(['…'], 'bos');
        var ONAY = ['İşlemci ✓ 8 çekirdek', 'Bellek ✓ 2 × 16 GB · çift kanal', 'Ekran kartı ✓ PCIe x16', 'Depolama ✓ M.2 NVMe · SATA SSD'];
        var z = Promise.resolve();
        [0, 1, 2, 3].forEach(function (i) {
          z = z.then(function () { ledler[i].className = 'yanik'; return D.bekle(sn(0.55), s); })
            .then(function () { ledler[i].className = 'gecti'; if (i >= 2) yaz(ONAY.slice(0, i + 1)); });
        });
        return z.then(function () {
          ses('klik');
          yaz(ONAY.concat(['Tek kısa bip (birçok sistemde): POST tamam', 'UEFI’ye girmek için Del ya da F2']), 'tamam');
          return D.bekle(sn(0.6), s);
        });
      }
    };
  }

  /* ═══════════ Hazırlık: güvenlik kontrol listesi ═══════════ */
  (function () {
    var kok = document.getElementById('guvenlik-listesi');
    if (!kok) return;
    var maddeler = kok.querySelectorAll('.gk2-madde'), sonuc = kok.querySelector('.gk2-sonuc');
    function guncelle() {
      var n = 0;
      maddeler.forEach(function (m) { if (m.getAttribute('aria-pressed') === 'true') n++; });
      var hazir = n === maddeler.length;
      sonuc.classList.toggle('hazir', hazir);
      sonuc.textContent = hazir ? '✔ Kasa hazır: montaja başlayabilirsiniz. Fiş çekili kalacak.' : 'Kontrolcü okur, uygulayan işaretler (' + n + ' / ' + maddeler.length + ')';
      if (hazir) DERS.konfeti();
    }
    maddeler.forEach(function (m) {
      m.addEventListener('click', function () { m.setAttribute('aria-pressed', m.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); guncelle(); });
    });
    guncelle();
  })();

  /* ═══════════ Kapak: montajı bitmiş kasa, kablolar düzenli, yavaş döner ═══════════ */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 44,
      kamera: { yon: [0.55, 1.05, 1], pay: 0.86 } });
    var S = sistem(s, { kablo: 'duzenli' });
    S.goster(['kapaklar'], false);
    S.kapaklar.slice(2).forEach(function (k) { k.visible = true; });
    S.isik(1.6);
    s.yerlestir();
    S.fanlar(true);
  });

  /* Sahne kurulumu: tam sistem + görünüm */
  function sahneKur(kap, ops) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: ops.kamera || { yon: [0.3, 1.25, 0.95], pay: 0.88 } });
    var S = sistem(s, ops);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.15, maxPolar: 1.45, minYakin: 0.2, maxYakin: 1.6 } });
    return { s: s, S: S };
  }

  /* ═══════════ Adım 1: kasa ve G/Ç plakası ═══════════ */
  D.tembel('#s6-3d', function (kap) {
    var o = sahneKur(kap, { kapak: true }), s = o.s, S = o.S;
    S.goster(['kart', 'psu', 'psuVida', 'k24', 'eps', 'pcie', 'ssd', 'sata', 'ayak'], false);
    S.kablolar('yok');
    var kapak = S.kapak, k0 = kapak.position.clone();
    var cerceve = new THREE.Object3D(); cerceve.position.set(21.6, 20.2, 19.6); S.kok.add(cerceve);
    var tepsi = new THREE.Object3D(); tepsi.position.set(6, TEPSI, -4); S.kok.add(tepsi);
    var bas = baslangic(s);
    var ARKADAN = bakis(v(1, 17, -21), [0.3, 0.75, -1], 0.42);
    var IO_YAKIN = bakis(IO_MERKEZ.clone().add(v(0, 1, 0)), [0.25, 0.9, 1], 0.36);
    var etiketler = [];
    function sifirla() {
      kaldirHepsi(etiketler);
      kapak.visible = true; kapak.position.copy(k0);
      S.kelebek.forEach(function (vd) { vd.visible = true; vd.position.copy(vd.userData.baslangic); vd.rotation.z = 0; });
      S.io.visible = false; S.io.position.copy(IO_MERKEZ).add(v(0, 9, 10)); S.io.rotation.set(0, 0, Math.PI);
      D.vurguKaldir(S.io, 0);
      s.kameraGit(bas, 0.01);
    }
    prova(s, [
      { metin: 'Fiş çekili. Kasa sol yanı yukarıda yatıyor; arkadaki iki kelebek vidayı sök.', calis: function () {
        return s.kameraGit(ARKADAN, sn(1)).then(function () {
          S.kelebek.forEach(function (vd) { etiketler.push(s.etiket(vd, 'Kelebek vida', { tur: 'vurgu' })); });
          return Promise.all(S.kelebek.map(function (vd) { return D.vida(vd, { eksen: 'z', mesafe: 1.4, sure: sn(1) }); }));
        }).then(function () { kaldirHepsi(etiketler); S.kelebek.forEach(function (vd) { vd.visible = false; }); });
      } },
      { metin: 'Yan kapağı geriye kaydır, kaldır ve kutuya koy.', calis: function () {
        return s.kameraGit(bas, sn(1)).then(function () { return D.git(kapak, k0.clone().add(v(0, 0, -3.2)), sn(0.7)); })
          .then(function () { return D.git(kapak, k0.clone().add(v(-16, 0, -3.2)), sn(0.8)); })
          .then(function () { kapak.visible = false; etiketler.push(s.etiket(tepsi, 'Anakart tepsisi', { tur: 'kagit', yer: 'merkez' })); });
      } },
      { metin: 'Bilekliğin klipsini kasanın boyasız metal çerçevesine bağla.', calis: function () {
        etiketler.push(s.etiket(cerceve, 'Klips: boyasız metal çerçeve', { tur: 'dogru' }));
        ses('klik');
        return D.bekle(1.2, s);
      } },
      { metin: 'G/Ç plakası ters tutulmuş: ses delikleri kartın ses girişleriyle ters uçta.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit(IO_YAKIN, sn(1)).then(function () {
          S.io.visible = true;
          return D.git(S.io, IO_MERKEZ.clone().add(v(0, 0.3, 2.2)), sn(0.9));
        }).then(function () {
          ses('hata');
          etiketler.push(s.etiket(S.io, '✗ Ters: delikler portlarla eşleşmez', { tur: 'hata' }));
          return D.bekle(1.2, s);
        });
      } },
      { metin: 'Plakayı çevir; açıklığa içeriden bastır: dört kenar klik.', calis: function () {
        kaldirHepsi(etiketler);
        return D.tween({ sahne: s, sure: sn(0.9), guncelle: function (e) { S.io.rotation.z = Math.PI * (1 - e); } })
          .then(function () { return D.git(S.io, IO_MERKEZ.clone(), sn(0.6), 'easeInCubic'); })
          .then(function () { ses('klik'); etiketler.push(s.etiket(S.io, '✓ Plaka yerinde', { tur: 'dogru' })); });
      } },
      { metin: 'Kasa hazır: tepsi boş, yuva kapakları yerinde. Sırada ayaklar ve anakart.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit(bas, sn(1)).then(function () {
          etiketler.push(s.etiket(S.kapaklar[3], 'Yuva kapakları', { tur: 'bilgi' }));
          etiketler.push(s.etiket(tepsi, 'Anakart tepsisi', { tur: 'kagit', yer: 'merkez' }));
        });
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Adım 2: mesafe vidaları ve anakart ═══════════ */
  D.tembel('#s7-3d', function (kap) {
    var o = sahneKur(kap, {}), s = o.s, S = o.S, m = S.m;
    S.goster(['psu', 'psuVida', 'k24', 'eps', 'pcie', 'ssd', 'sata', 'gpu', 'fp'], false);
    S.kablolar('yok');
    // Kartın izi: yarı saydam dikdörtgen + delik halkaları
    var iz = new THREE.Group();
    var izMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
    var pl = new THREE.Mesh(new THREE.PlaneGeometry(30.5, 24.4), izMat); pl.rotation.x = -Math.PI / 2; iz.add(pl);
    var halkaMat = new THREE.MeshBasicMaterial({ color: 0x6d28d9 });
    DELIK.forEach(function (d) {
      var h = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 6, 20), halkaMat);
      h.rotation.x = Math.PI / 2; h.position.copy(kartDunya(d[0], d[1], 0)).sub(v(KART.x, 0, KART.z)); iz.add(h);
    });
    iz.position.set(KART.x, KART.y + 0.02, KART.z);
    S.kok.add(secilmez(iz));
    // Kartı arka kenarından eğmek için eksen
    var piv = new THREE.Group();
    piv.position.set(KART.x, KART.y, -20.1);
    S.kok.add(piv);
    piv.attach(m);
    var PIV0 = piv.position.clone();
    var not = null, bas = baslangic(s);
    var ARKADAN = bakis(v(12, 4, -21), [0.3, 0.6, -1], 0.42);
    var etiketler = [];
    function sifirla() {
      kaldirHepsi(etiketler);
      if (not) { not.remove(); not = null; }
      iz.visible = true;
      S.ayaklar.forEach(function (a) { a.visible = true; a.scale.set(1, 1, 1); });
      S.fazla.visible = true; S.fazla.position.y = TEPSI; S.fazla.rotation.y = 0; D.vurguKaldir(S.fazla, 0);
      m.visible = false; piv.position.copy(PIV0).add(v(0, 10, 4)); piv.rotation.x = -0.42;
      S.kartVida.forEach(function (vd) { vd.visible = false; });
      D.vurguKaldir(m.getObjectByName('arka-panel'), 0);
      s.kameraGit(bas, 0.01);
    }
    prova(s, [
      { metin: 'Tepside fabrikadan takılı 10 ayak var; kartta 9 vida deliği (mor halkalar).', calis: function () {
        etiketler.push(s.etiket(iz, 'Kartın izi · 9 delik', { tur: 'vurgu', yer: 'merkez' }));
        return D.bekle(1.4, s);
      } },
      { metin: 'Bu ayağın üstünde delik yok: kartın altındaki lehim noktalarına değer, kısa devre yapar.', calis: function () {
        kaldirHepsi(etiketler);
        etiketler.push(s.etiket(S.fazla, '✗ Delik yok', { tur: 'hata' }));
        return D.uyari(S.fazla, { genlik: 0.3 }).then(function () { return D.bekle(0.8, s); });
      } },
      { metin: 'Fazla ayağı sök: ayak sayısı = delik sayısı.', calis: function () {
        var y0 = S.fazla.position.y;
        return D.tween({ sahne: s, sure: sn(0.9), guncelle: function (e) { S.fazla.rotation.y = -e * 10; S.fazla.position.y = y0 + e * 2.5; } }).then(function () {
          S.fazla.visible = false; D.vurguKaldir(S.fazla, 0); kaldirHepsi(etiketler);
          not = D.div('h10-not don3d-ipucu', s.arayuz);
          not.textContent = DERS.tahminNotu(1, 'Ayaksız kartın lehim noktaları tepsiye değer; mesafe vidaları kartı birkaç milimetre yukarıda tutar.',
            'Aslında olmaz: lehim noktaları metale değer, kısa devre olur. Ayaklar kartı yukarıda tutar.');
        });
      } },
      { metin: 'Kartı kenarlarından tut; önce arka portları G/Ç plakasına eğik sok.', calis: function () {
        m.visible = true;
        return D.git(piv, PIV0.clone().add(v(0, 1.4, 0)), sn(1.2), 'easeOutCubic').then(function () { return D.bekle(0.3, s); });
      } },
      { metin: 'Ayakların üstüne düz indir: her delik bir ayağın tam üstünde.', calis: function () {
        if (not) { not.remove(); not = null; }
        var p0 = piv.position.clone(), r0 = piv.rotation.x;
        return D.tween({ sahne: s, sure: sn(1.1), guncelle: function (e) { piv.rotation.x = r0 * (1 - e); piv.position.lerpVectors(p0, PIV0, e); } })
          .then(function () { iz.visible = false; ses('klik'); etiketler.push(s.etiket(m, '✓ Delikler ayaklarda', { tur: 'dogru', yer: 'merkez' })); });
      } },
      { metin: 'Vidalar: önce çapraz köşeler, sonra ortadakiler. Elle sıkı, zorlama yok.', calis: function () {
        kaldirHepsi(etiketler);
        var z = Promise.resolve();
        VIDA_SIRA.forEach(function (i, n) {
          z = z.then(function () {
            var et = s.etiket(S.kartVida[i], String(n + 1), { tur: 'harf' });
            etiketler.push(et);
            return vidala(S.kartVida[i], S.vidaYeri[i], 0.4);
          });
        });
        return z;
      } },
      { metin: 'Arkadan bak: portlar plakadan dışarı bakıyor, tırnaklar portların içine girmemiş.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit(ARKADAN, sn(1.1)).then(function () {
          return D.vurgula(m.getObjectByName('arka-panel'), { etiket: '✓ Portlar plakada' });
        }).then(function () { return D.bekle(1.2, s); });
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Adım 3: güç kaynağı, 24-pin ve 8-pin ═══════════ */
  D.tembel('#s8-3d', function (kap) {
    var o = sahneKur(kap, { kablo: 'daginik' }), s = o.s, S = o.S;
    S.goster(['ssd', 'sata', 'gpu', 'fp'], false);
    S.kapaklar.forEach(function (k) { k.visible = true; });
    var bas = baslangic(s);
    var ARKADAN = bakis(v(-16, 9, -21), [0.45, 0.55, -1], 0.4);
    var K24 = bakis(dunya(S.p24).add(v(-1, 1, 0)), [0.25, 1, 0.8], 0.3);
    var KEPS = bakis(dunya(S.pEps).add(v(-2, 1, 0)), [0.2, 1.3, 0.15], 0.34);
    var etiketler = [];
    var PSU_UST = PSU_YER.clone().add(v(0, 17, 0));
    function sifirla() {
      kaldirHepsi(etiketler);
      S.psu.position.copy(PSU_UST); S.psu.visible = true;
      S.goster(['psuVida', 'k24', 'eps', 'pcie'], false);
      S.kablolar('daginik', {});
      D.vurguKaldir(S.kPcie, 0);
      s.kameraGit(bas, 0.01);
    }
    prova(s, [
      { metin: 'Güç kaynağı alt arka bölmeye iner; altta filtreli delik var: fanı aşağı bakar.', calis: function () {
        return D.git(S.psu, PSU_YER.clone(), sn(1.4), 'easeOutCubic').then(function () {
          ses('klik');
          etiketler.push(s.etiket(S.psu, 'Güç kaynağı · fan aşağıda', { tur: 'vurgu' }));
          etiketler.push(s.etiket(S.psu.getObjectByName('psu-etiket'), 'Kapağı asla açılmaz', { tur: 'hata', yer: 'merkez' }));
          return D.bekle(1, s);
        });
      } },
      { metin: 'Arkadan dört vidayla sabitle.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit(ARKADAN, sn(1)).then(function () {
          var z = Promise.resolve();
          S.psuVida.forEach(function (vd) {
            z = z.then(function () {
              vd.visible = true; var p1 = vd.position.clone(), p0 = p1.clone().add(v(0, 0, -1.4));
              vd.position.copy(p0);
              return D.tween({ sahne: s, sure: sn(0.4), guncelle: function (e) { vd.position.lerpVectors(p0, p1, e); vd.rotation.y = e * 8; } })
                .then(function () { ses('klik'); });
            });
          });
          return z;
        }).then(function () { etiketler.push(s.etiket(S.psuVida[1], '✓ 4 vida', { tur: 'dogru' })); return D.bekle(0.6, s); });
      } },
      { metin: '24-pin fişi kartın ön kenarındaki girişe düz bastır: kilit tırnağı klik.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit(K24, sn(1)).then(function () {
          S.k24.visible = true;
          return D.fisTak(S.k24, S.p24, { bas: 5, sure: 0.9 });
        }).then(function () {
          etiketler.push(s.etiket(S.k24, '✓ 24-pin', { tur: 'dogru' }));
          return kabloBuyut(S.kablo.g24.daginik, 1);
        });
      } },
      { metin: 'Benzer görünen PCIe 6+2 fişi işlemci girişine (EPS) girmez: pin biçimi ve +12 V sırası farklı.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit(KEPS, sn(1)).then(function () {
          S.kPcie.visible = true;
          etiketler.push(s.etiket(S.m.getObjectByName('eps8'), 'EPS · CPU', { tur: 'vurgu', yer: 'alt' }));
          return D.fisTak(S.kPcie, S.pEps, { uygun: false, bas: 4 });
        }).then(function () {
          etiketler.push(s.etiket(S.kPcie, '✗ PCIe 6+2 burada değil', { tur: 'hata' }));
          return D.bekle(1.2, s);
        }).then(function () { S.kPcie.visible = false; });
      } },
      { metin: 'CPU yazan 8-pin (4+4) fişi EPS girişine tak: klik.', calis: function () {
        kaldirHepsi(etiketler);
        S.kEps.visible = true;
        return D.fisTak(S.kEps, S.pEps, { bas: 4, sure: 0.9 }).then(function () {
          etiketler.push(s.etiket(S.kEps, '✓ CPU 8-pin', { tur: 'dogru' }));
          return kabloBuyut(S.kablo.eps.daginik, 1);
        });
      } },
      { metin: 'İki ana güç kablosu takılı. Kartın üstünden geçen kablolar Adım 6’da toplanacak.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit(bas, sn(1)).then(function () {
          etiketler.push(s.etiket(S.kablo.eps.daginik, 'Şimdilik dağınık', { tur: 'bilgi', yer: 'merkez' }));
        });
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Adım 4: ön panel kabloları (başlık büyütülür, A-TAK) ═══════════ */
  var FP_P = 1.1;
  function fpX(i) { return (i - 2) * FP_P; }
  function fpZ(j) { return j === 1 ? FP_P / 2 : -FP_P / 2; }            // j = 1: tek numaralı sıra (öne)
  var FP_FIS = [
    { ad: 'HDD LED', i: 0, j: 1, renk: '#f59e0b', kutup: true },
    { ad: 'Güç ışığı (PLED)', i: 0, j: 0, renk: '#22c55e', kutup: true },
    { ad: 'RESET SW', i: 2, j: 1, renk: '#3b82f6', kutup: false },
    { ad: 'PWR SW', i: 2, j: 0, renk: '#ef4444', kutup: false }
  ];
  function buyukBaslik() {
    var g = new THREE.Group();
    K.koy(g, K.kutu(5 * FP_P + 0.5, 0.45, 2 * FP_P + 0.5, 'plastikSiyah', 0.08), 0, 0.225, 0);
    var pimler = {};
    for (var i = 0; i < 5; i++) for (var j = 0; j < 2; j++) {
      if (i === 4 && j === 0) continue;                                   // 10. pim yok (yön anahtarı)
      var p = K.kutu(0.24, 1.5, 0.24, 'altin', 0.03);
      K.koy(g, p, fpX(i), 1.2, fpZ(j));
      pimler[j === 1 ? 2 * i + 1 : 2 * i + 2] = p;
    }
    K.parca(g, 'fpanel-buyuk', 'Ön panel başlığı (büyütülmüş)', 'Üst sıra 2-4-6-8, alt sıra 1-3-5-7-9; 10. pim yoktur.');
    var fisler = FP_FIS.map(function (f) {
      var h = new THREE.Group(), mat = K.mat(f.renk, { roughness: 0.5 });
      K.koy(h, K.kutu(FP_P + 0.95, 1.25, 0.95, K.mat('#1f2329'), 0.1), 0, 0, 0);
      K.koy(h, K.kutu(FP_P + 0.97, 0.3, 0.97, mat, 0.08), 0, 0.5, 0);
      [-FP_P / 2, FP_P / 2].forEach(function (x, k) { K.koy(h, K.silindir(0.11, 2.4, k === 0 ? mat : K.mat(f.kutup ? '#f8fafc' : f.renk), 10), x, 1.8, 0); });
      if (f.kutup) K.koy(h, K.kutu(0.34, 0.06, 0.34, 'plastikBeyaz'), -FP_P / 2, 0.66, 0.2);   // + işareti tarafı (−X)
      K.parca(h, 'fp-fis', f.ad, f.kutup ? 'Kutuplu: + uç + pine gelir.' : 'Kutupsuz: yönü fark etmez.');
      h.userData.hedef = v(fpX(f.i) + FP_P / 2, 1.08, fpZ(f.j));
      g.add(h);
      return h;
    });
    g.userData.fisler = fisler; g.userData.pimler = pimler;
    return g;
  }

  D.tembel('#s9-3d', function (kap) {
    var o = sahneKur(kap, { kablo: 'daginik' }), s = o.s, S = o.S;
    S.goster(['ssd', 'sata', 'gpu', 'pcie', 'fp'], false);
    S.kapaklar.forEach(function (k) { k.visible = true; });
    S.kablolar('daginik', { g24: true, eps: true });
    var gercek = S.m.getObjectByName('on-panel');
    var h0 = kartDunya(8.6, 14.3, KART.y + T + 0.5);
    var B = buyukBaslik(), BY = v(-5.2, 8.6, 4.2);
    B.position.copy(BY); S.kok.add(B);
    var isinMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.22, depthWrite: false });
    var isin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 2.2, 1, 16, 1, true), isinMat);
    var fark = BY.clone().sub(h0);
    isin.scale.set(1, fark.length(), 1);
    isin.position.copy(h0).addScaledVector(fark, 0.5);
    isin.quaternion.setFromUnitVectors(v(0, 1, 0), fark.clone().normalize());
    S.kok.add(secilmez(isin));
    var kil = D.div('h10-kilavuz', s.arayuz);
    kil.innerHTML = '<b>Kılavuz · F_PANEL</b><table><tr><td>2 PLED+</td><td>4 PLED−</td><td>6 PWR</td><td>8 PWR</td><td>10 —</td></tr>' +
      '<tr><td>1 HDD+</td><td>3 HDD−</td><td>5 RST</td><td>7 RST</td><td>9 NC</td></tr></table>';
    odak(s, BY.clone().add(v(0, 0.4, 0)), [0.05, 1.05, 0.95], 0.21);
    var bas = baslangic(s);
    var UZAK = bakis(h0.clone().add(v(1, 2, 3)), [0.25, 1.2, 1], 3.2);
    var etiketler = [];
    function sifirla() {
      kaldirHepsi(etiketler);
      kil.classList.remove('acik');
      B.scale.setScalar(0.01); isin.visible = false;
      B.userData.fisler.forEach(function (f, k) {
        f.position.set(-3.6 + k * 2.4, 5.5, 3.2); f.rotation.set(0, k === 1 ? Math.PI : 0, 0); f.visible = false;
      });
      S.fpBlok.visible = false; S.kablo.fp.daginik.visible = false;
      D.vurguKaldir(gercek, 0);
      s.kameraGit(UZAK, 0.01);
    }
    function tak(k, dogru) {
      var f = B.userData.fisler[k];
      f.visible = true;
      return D.takAnim(f, { hedef: f.userData.hedef, dogru: dogru, yukseklik: 3.2 });
    }
    prova(s, [
      { metin: 'Kartın alt kenarında ön panel başlığı (F_PANEL): pimler 2,54 mm aralıklı, büyüterek bakalım.', calis: function () {
        return D.vurgula(gercek, { etiket: 'F_PANEL' }).then(function () {
          isin.visible = true;
          return Promise.all([s.kameraGit(bas, sn(1.3)), D.tween({ sahne: s, sure: sn(1.1), guncelle: function (e) { B.scale.setScalar(0.01 + e * 0.99); } })]);
        }).then(function () { D.vurguKaldir(gercek); });
      } },
      { metin: 'Kılavuz şeması: üst sıra 2-4-6-8, alt sıra 1-3-5-7-9; 10. pim yok (yön anahtarı).', calis: function () {
        kil.classList.add('acik');
        etiketler.push(s.etiket(B.userData.pimler[1], '1', { tur: 'harf', yer: 'alt', ofset: [0, 0, 0.9] }));
        etiketler.push(s.etiket(B.userData.pimler[2], '2', { tur: 'harf', ofset: [0, 0.3, -0.4] }));
        return D.bekle(1.6, s);
      } },
      { metin: 'HDD LED: + uç 1’e, − uç 3’e.', calis: function () {
        return tak(0, true).then(function () { etiketler.push(s.etiket(B.userData.fisler[0], '✓ HDD LED', { tur: 'dogru' })); });
      } },
      { metin: 'Güç ışığı (PLED) ters tutulmuş: + uç − pinde. Işık yanmaz ama zarar vermez: çevir.', calis: function () {
        var f = B.userData.fisler[1];
        return tak(1, true).then(function () {
          var et = s.etiket(f, '✗ + uç 4’te (−)', { tur: 'hata' });
          etiketler.push(et);
          ses('hata');
          return D.bekle(1.2, s).then(function () { et.kaldir(); return D.cikarAnim(f, { yukseklik: 2.2 }); });
        }).then(function () {
          return D.tween({ sahne: s, sure: sn(0.7), guncelle: function (e) { f.rotation.y = Math.PI * (1 - e); } });
        }).then(function () { return tak(1, true); }).then(function () { etiketler.push(s.etiket(f, '✓ PLED + uç 2’de', { tur: 'dogru' })); });
      } },
      { metin: 'RESET SW 5–7’ye, PWR SW 6–8’e: kutupsuz, yönü fark etmez.', calis: function () {
        return tak(2, true).then(function () { return tak(3, true); }).then(function () {
          etiketler.push(s.etiket(B.userData.fisler[2], 'RESET SW', { tur: 'dogru', yer: 'alt', ofset: [0, 0, 0.8] }));
          etiketler.push(s.etiket(B.userData.fisler[3], 'PWR SW', { tur: 'dogru' }));
        });
      } },
      { metin: 'Dört fiş şemadaki yerinde; kabloları kasanın önündeki düğme ve ışıklara gider.', calis: function () {
        kaldirHepsi(etiketler);
        kil.classList.remove('acik');
        return s.kameraGit(UZAK, sn(1.2)).then(function () {
          S.fpBlok.visible = true;
          return kabloBuyut(S.kablo.fp.daginik, 1);
        }).then(function () { etiketler.push(s.etiket(S.fpBlok, '✓ Ön panel', { tur: 'dogru' })); });
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Adım 5: ekran kartı, SSD ve SATA ═══════════ */
  D.tembel('#s10-3d', function (kap) {
    var o = sahneKur(kap, { kablo: 'daginik' }), s = o.s, S = o.S;
    S.kablolar('daginik', { g24: true, eps: true, fp: true });
    var kvYer = S.kapakVida.map(function (k) { return k.position.clone(); });
    var gpu = S.gpu, bas = baslangic(s);
    var KART_Y = bakis(dunya(gpu).add(v(0, 4, -3)), [0.2, 0.95, 1], 0.5);
    var SSD_Y = bakis(SSD_YER.clone().add(v(4, 0, -2)), [0.15, 1.3, 0.35], 0.42);
    var etiketler = [];
    function sifirla() {
      kaldirHepsi(etiketler);
      S.kapaklar.forEach(function (k, i) { k.visible = true; k.position.copy(S.kapakYer[i]); });
      S.kapakVida.forEach(function (k, i) { k.visible = true; k.position.copy(kvYer[i]); });
      gpu.visible = false; gpu.position.copy(S.gpuYer).add(v(0, 9, 0));
      S.goster(['pcie', 'ssd', 'sata'], false);
      S.kablo.pcie.daginik.visible = false;
      S.ssd.position.copy(SSD_YER).add(v(0, 9, 0));
      s.kameraGit(bas, 0.01);
    }
    prova(s, [
      { metin: 'Kartın kaplayacağı iki yuva kapağını sök (arka panelde, PCIe x16 hizasında).', calis: function () {
        return s.kameraGit(KART_Y, sn(1)).then(function () {
          return Promise.all([sok(S.kapakVida[0]), sok(S.kapakVida[1])]);
        }).then(function () {
          return Promise.all([0, 1].map(function (i) { return D.git(S.kapaklar[i], S.kapakYer[i].clone().add(v(0, 13, 1)), sn(0.8)); }));
        }).then(function () { S.kapaklar[0].visible = S.kapaklar[1].visible = false; });
      } },
      { metin: 'Yuvanın mandalını aç; kartı kenarından tutup ilk x16 yuvasına düz bastır: klik.', calis: function () {
        gpu.visible = true;
        etiketler.push(s.etiket(S.slot, 'PCIe x16 · 1. yuva', { tur: 'vurgu', yer: 'alt' }));
        return D.takAnim(gpu, { hedef: S.gpuYer.clone(), dogru: true, yukseklik: 6 }).then(function () {
          kaldirHepsi(etiketler); etiketler.push(s.etiket(gpu, '✓ Yuvada', { tur: 'dogru' }));
        });
      } },
      { metin: 'Braketi iki vidayla kasaya sabitle: kart sarkmaz, yuvadan çıkmaz.', calis: function () {
        return vidala(S.kapakVida[0], kvYer[0]).then(function () { return vidala(S.kapakVida[1], kvYer[1]); })
          .then(function () { etiketler.push(s.etiket(S.kapakVida[0], '✓ Braket vidalı', { tur: 'dogru' })); });
      } },
      { metin: '6+2 pin ek güç fişini kartın girişine tak: klik.', calis: function () {
        kaldirHepsi(etiketler);
        S.kPcie.visible = true;
        return D.fisTak(S.kPcie, S.pPcie, { bas: 4, sure: 0.9 }).then(function () {
          etiketler.push(s.etiket(S.kPcie, '✓ 6+2 pin', { tur: 'dogru' }));
          return kabloBuyut(S.kablo.pcie.daginik, 1);
        });
      } },
      { metin: '2,5 inç SSD yerine; kızağına ya da tepsideki yuvasına vidala.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit(SSD_Y, sn(1)).then(function () {
          S.ssd.visible = true;
          return D.git(S.ssd, SSD_YER.clone(), sn(1), 'easeOutCubic');
        }).then(function () { ses('klik'); etiketler.push(s.etiket(S.ssd, '2,5 inç SSD', { tur: 'vurgu' })); });
      } },
      { metin: 'SATA veri kablosu SSD’den anakarta, SATA güç kablosu güç kaynağından SSD’ye.', calis: function () {
        kaldirHepsi(etiketler);
        S.goster(['sata'], true);
        return D.fisTak(S.veriA, S.agV, { bas: 3 }).then(function () { return D.fisTak(S.gucS, S.agG, { bas: 3 }); }).then(function () {
          etiketler.push(s.etiket(S.veriB, '✓ Veri → anakart', { tur: 'dogru' }));
          etiketler.push(s.etiket(S.gucS, '✓ Güç', { tur: 'dogru' }));
        });
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Adım 6: kablo düzeni ve ilk açılış (A-BOOT) ═══════════ */
  D.tembel('#s11-3d', function (kap) {
    var o = sahneKur(kap, { kablo: 'daginik' }), s = o.s, S = o.S;
    S.kapaklar[0].visible = S.kapaklar[1].visible = false;
    var bas = baslangic(s);
    var serit = D.div('h10-serit', s.arayuz);
    var MADDE = ['24-pin', 'CPU 8-pin', 'Ek güç', 'SATA', 'Ön panel', 'Kart üstü'];
    var cipler = MADDE.map(function (x) { return el('span', 'h10-cip', serit, x); });
    var mon = monitorYap(s);
    var rozet = kap.parentNode.querySelector('.fis-rozet span');
    var rozetMetin = rozet ? rozet.textContent : '';
    var etiketler = [];
    var DAGINIK = ['g24', 'eps', 'pcie', 'fp'];
    function sifirla() {
      kaldirHepsi(etiketler);
      cipler.forEach(function (c) { c.classList.remove('simdi', 'tamam'); });
      S.kablolar('daginik');
      DAGINIK.forEach(function (a) { D.vurguKaldir(S.kablo[a].daginik, 0); });
      S.fanlar(false); S.isik(0.05); mon.sifirla();
      if (rozet) rozet.textContent = rozetMetin;
      s.kameraGit(bas, 0.01);
    }
    function kontrol(i, nesne, metin) {
      return function () {
        cipler[i].classList.add('simdi');
        var et = s.etiket(nesne, metin, { tur: 'dogru' });
        return D.vurgula(nesne, { etiket: false, sure: 0.3 }).then(function () { return D.bekle(0.7, s); }).then(function () {
          D.vurguKaldir(nesne); et.kaldir();
          cipler[i].classList.remove('simdi'); cipler[i].classList.add('tamam');
        });
      };
    }
    prova(s, [
      { metin: 'Kablolar kartın ve soğutucunun üstünden geçiyor: hava akışını keser, fana takılabilir.', calis: function () {
        etiketler.push(s.etiket(S.kablo.eps.daginik, '✗ Havada', { tur: 'hata', yer: 'merkez' }));
        return Promise.all(DAGINIK.map(function (a) { return D.vurgula(S.kablo[a].daginik, { renk: '#ef4444', etiket: false, sure: 0.3 }); }))
          .then(function () { return D.bekle(1.2, s); });
      } },
      { metin: 'Tepsinin arkasından geçir: lastik deliklerden çıkar, bağlarla topla.', calis: function () {
        kaldirHepsi(etiketler);
        DAGINIK.forEach(function (a) { D.vurguKaldir(S.kablo[a].daginik, 0); S.kablo[a].daginik.visible = false; });
        S.sataGucDuzenli();
        return Promise.all(DAGINIK.map(function (a) { return kabloBuyut(S.kablo[a].duzenli, 1.2); })).then(function () {
          S.baglar.visible = true; ses('klik');
          etiketler.push(s.etiket(S.grometler.B, '✓ Tepsinin arkasından', { tur: 'dogru' }));
        });
      } },
      { metin: 'Kontrol turu: 24-pin, CPU 8-pin, ek güç, SATA, ön panel; kartın üstünde vida ya da bağ artığı yok.', bekle: 0.4, calis: function () {
        kaldirHepsi(etiketler);
        return [kontrol(0, S.k24, '✓ 24-pin'), kontrol(1, S.kEps, '✓ CPU 8-pin'), kontrol(2, S.kPcie, '✓ 6+2'), kontrol(3, S.veriA, '✓ SATA'),
          kontrol(4, S.fpBlok, '✓ Ön panel'), kontrol(5, S.parca.sog, '✓ Temiz')].reduce(function (z, f) { return z.then(f); }, Promise.resolve());
      } },
      { metin: 'Öğretmen onay verdi: monitör kablosu ekran kartına, fiş prize, anahtar I konumuna.', calis: function () {
        if (rozet) rozet.textContent = 'Öğretmen onayı · güç var';
        etiketler.push(s.etiket(S.gpu.getObjectByName('gpu-braket'), 'Monitör → ekran kartı', { tur: 'vurgu' }));
        return D.bekle(1.4, s);
      } },
      { metin: 'Güç düğmesine bas: güç ışığı yanar, fanlar döner; POST denetimi başlar.', calis: function () {
        kaldirHepsi(etiketler);
        S.isik(1.6); S.fanlar(true); ses('klik');
        return mon.oynat();
      } },
      { metin: 'POST geçti: donanım listesi ve UEFI’ye giriş iletisi. Sonucu forma yaz; UEFI ayarları H11’de.', bekle: 1.6, calis: function () {
        etiketler.push(s.etiket(S.parca.sog, 'Fan dönüyor', { tur: 'bilgi' }));
        return D.bekle(1, s);
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Etkinlik 1: E-MONTAJ — kasa aşaması (ön panelde E-TAK pin seçimi) ═══════════ */
  (function () {
    var tepsi = document.getElementById('em-tepsi');
    if (!tepsi) return;
    var mesajEl = document.getElementById('em-mesaj'), hataEl = document.getElementById('em-hata'), sureEl = document.getElementById('em-sure');
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var ASAMA = ['esd', 'io', 'ayak', 'anakart', 'psu', 'guc', 'onpanel', 'gpu', 'ssd'];
    var ASAMA_AD = { esd: 'ESD bilekliği', io: 'G/Ç plakası', ayak: 'Mesafe vidaları', anakart: 'Anakart', psu: 'Güç kaynağı', guc: '24 + 8-pin',
      onpanel: 'Ön panel', gpu: 'Ekran kartı ve ek gücü', ssd: 'SSD ve SATA' };
    var HATA_AD = {
      esd: 'ESD önlemi almadan parçaya dokunma', 'io-yok': 'G/Ç plakasından önce anakart', ayaksiz: 'Mesafe vidası olmadan anakart',
      'ayak-fazla': 'Deliğe denk gelmeyen fazla ayak', 'guc-psu': 'Güç kaynağı yokken güç kablosu', 'guc-kart': 'Anakart yokken güç kablosu',
      'eps-pcie': 'EPS girişine PCIe 6+2 fişi', 'onpanel-kart': 'Anakart yokken ön panel', 'onpanel-pin': 'Şemaya uymayan ön panel pini',
      'led-ters': 'Işık kablosu ters (+ uç − pinde)', 'gpu-kart': 'Anakart yokken ekran kartı', 'gpu-x1': 'Ekran kartı x1 yuvasında',
      monitor: 'Monitör anakart çıkışında', eksik: 'Eksik adımla ilk açılış'
    };
    var KARTLAR = [
      ['gpu', 'Ekran kartı', '<rect x="2" y="6" width="18" height="10" rx="1.5"/><circle cx="8" cy="11" r="2.8"/><circle cx="15" cy="11" r="2.8"/><path d="M4 16v3h9v-3"/>'],
      ['ayak', 'Mesafe vidaları', '<path d="M8 3h8l2 4-2 4H8L6 7z"/><path d="M10 11v10M14 11v10M10 15h4M10 18h4"/>'],
      ['bileklik', 'Bileklik', '<ellipse cx="8" cy="9" rx="5" ry="3.2"/><path d="M13 9.5c4 1 6 4 7 9"/><path d="M18 18.5h4"/>'],
      ['psu', 'Güç kaynağı', '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="9" cy="12" r="3.5"/><path d="M16 10h3M16 14h3"/>'],
      ['onpanel', 'Ön panel', '<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M7 14h.01M10 14h.01M13 14h.01M16 14h.01M19 14h.01"/>'],
      ['anakart', 'Anakart', '<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="6" y="6" width="6" height="6" rx="1"/><path d="M15 6v10M18 6v10M6 16h6"/>'],
      ['ssd', 'SSD + SATA', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/>'],
      ['io', 'G/Ç plakası', '<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M5 11h3M10 11h3M5 13h3M16 11v2M19 11v2"/>'],
      ['guc', '24 + 8-pin', '<path d="M4 20c0-6 4-8 8-8h2"/><rect x="14" y="8" width="7" height="8" rx="1"/><path d="M16 10v4M19 10v4"/>']
    ];
    var dugmeler = {};
    KARTLAR.forEach(function (k) {
      var b = el('button', 'em-kart', tepsi);
      b.type = 'button'; b.dataset.kart = k[0];
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + k[2] + '</svg><span></span>';
      b.lastChild.textContent = k[1];
      b.addEventListener('click', function () { if (api) api.kart(k[0]); });
      dugmeler[k[0]] = b;
    });
    var bitirBtn = el('button', 'em-kart em-bitir', tepsi, 'Öğretmen onayı: ilk açılış');
    bitirBtn.type = 'button';
    bitirBtn.addEventListener('click', function () { if (api) api.bitir(); });
    function mesaj(t, tur) { mesajEl.textContent = t; mesajEl.className = 'em-mesaj' + (tur ? ' ' + tur : ''); }

    var api = null;
    D.tembel('#s12-3d', function (kap) {
      var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.3, 1.25, 0.95], pay: 0.86 } });
      var S = sistem(s, { kablo: 'daginik' }), m = S.m, gpu = S.gpu;
      s.yerlestir();
      D.dondur(s, { ipucu: false, sinir: { minPolar: 0.15, maxPolar: 1.45, minYakin: 0.25, maxYakin: 1.6 } });
      var kvYer = S.kapakVida.map(function (k) { return k.position.clone(); });
      var x1 = m.getObjectByName('pcie-x1-1');
      var x1Fark = x1 ? x1.position.clone().sub(S.slot.position) : v(0, 0, 2);
      var esdRozet = D.div('h10-esd', s.arayuz);
      var secim = D.div('h10-secim', s.arayuz);
      secim.setAttribute('role', 'group');
      var rapor = D.div('h10-rapor', s.arayuz); rapor.hidden = true;
      var mon = monitorYap(s);
      // Ön panel pin panosu (E-TAK)
      var pano = D.div('h10-pano', s.arayuz); pano.hidden = true;
      pano.innerHTML = '<div class="h10-pano-bas"><b>F_PANEL</b><button type="button" class="h10-kil-dugme">Kılavuz</button></div>' +
        '<div class="h10-kil"><table><tr><td>2 PLED+</td><td>4 PLED−</td><td>6 PWR</td><td>8 PWR</td><td>10 —</td></tr><tr><td>1 HDD+</td><td>3 HDD−</td><td>5 RST</td><td>7 RST</td><td>9 NC</td></tr></table></div>' +
        '<div class="h10-fisler" role="group" aria-label="Kasa kabloları"></div><div class="h10-pinler" role="group" aria-label="Başlık pinleri"></div>';
      pano.querySelector('.h10-kil-dugme').addEventListener('click', function () { pano.classList.toggle('kil-acik'); });
      var fislerEl = pano.querySelector('.h10-fisler'), pinlerEl = pano.querySelector('.h10-pinler');
      var FIS = [
        { k: 'hdd', ad: 'HDD LED (+/−)', pin: [1, 3], arti: 1 }, { k: 'pled', ad: 'PLED (+/−)', pin: [2, 4], arti: 2 },
        { k: 'rst', ad: 'RESET SW', pin: [5, 7] }, { k: 'pwr', ad: 'PWR SW', pin: [6, 8] }
      ];
      var fisBtn = {}, pinBtn = {};
      FIS.forEach(function (f) {
        var b = el('button', 'h10-fis h10-fis-' + f.k, fislerEl, f.ad); b.type = 'button';
        b.addEventListener('click', function () { fisSec(f.k); });
        fisBtn[f.k] = b;
      });
      [[2, 4, 6, 8, 10], [1, 3, 5, 7, 9]].forEach(function (sira) {
        sira.forEach(function (n) {
          var b = el('button', 'h10-pin', pinlerEl, String(n)); b.type = 'button';
          if (n === 10) { b.disabled = true; b.classList.add('yok'); b.textContent = '·'; b.setAttribute('aria-label', '10: pim yok'); }
          b.addEventListener('click', function () { pinSec(n); });
          pinBtn[n] = b;
        });
      });
      var st, etiketler = [], zamanlayici = null, t0 = null, mesgul = false, fisSecili = null;

      function sureYaz() {
        if (t0 == null) { sureEl.textContent = '00:00'; return; }
        var x = Math.floor((Date.now() - t0) / 1000);
        sureEl.textContent = ('0' + Math.floor(x / 60)).slice(-2) + ':' + ('0' + (x % 60)).slice(-2);
      }
      function zamanBaslat() { if (t0 != null) return; t0 = Date.now(); zamanlayici = setInterval(sureYaz, 1000); }
      function ilerlemeYaz() {
        var n = ASAMA.filter(function (a) { return st.tamam[a]; }).length;
        ilerle(n, ASAMA.length);
        ASAMA.forEach(function (a) { var b = dugmeler[a === 'esd' ? 'bileklik' : a]; if (b) b.classList.toggle('bitti', !!st.tamam[a]); });
      }
      function tamamla(a) { st.tamam[a] = true; ilerlemeYaz(); }
      function hata(tur, metin) {
        st.hatalar.push(tur); st.hataSay++;
        hataEl.textContent = st.hataSay;
        hataEl.parentNode.classList.add('var');
        mesaj(metin, 'yanlis'); ses('hata');
      }
      function secimKapat() { secim.innerHTML = ''; }
      function secimDugme(metin, fn, sinif) {
        var b = el('button', 'don3d-dugme' + (sinif ? ' ' + sinif : ''), secim, metin);
        b.type = 'button';
        b.addEventListener('click', function (e) { e.stopPropagation(); if (!mesgul) fn(); });
        return b;
      }
      function mesgulYap(p) { mesgul = true; return Promise.resolve(p).then(function (x) { mesgul = false; return x; }, function (e) { mesgul = false; console.error(e); }); }

      function sifirla() {
        kaldirHepsi(etiketler); secimKapat();
        rapor.hidden = true; rapor.innerHTML = ''; pano.hidden = true; pano.classList.remove('kil-acik');
        if (zamanlayici) clearInterval(zamanlayici);
        zamanlayici = null; t0 = null; sureYaz();
        st = { tamam: {}, gpuTakili: false, pcie: false, fp: {}, hatalar: [], hataSay: 0, bitti: false };
        hataEl.textContent = '0'; hataEl.parentNode.classList.remove('var');
        esdRozet.className = 'h10-esd'; esdRozet.textContent = 'ESD: bileklik takılı değil';
        S.goster(['io', 'ayak', 'kart', 'vida', 'psu', 'psuVida', 'gpu', 'k24', 'eps', 'pcie', 'ssd', 'sata', 'fp'], false);
        S.fazla.visible = false;
        S.kablolar('daginik', {});
        S.kapaklar.forEach(function (k, i) { k.visible = true; k.position.copy(S.kapakYer[i]); });
        S.kapakVida.forEach(function (k, i) { k.visible = true; k.position.copy(kvYer[i]); });
        S.fanlar(false); S.isik(0.05); mon.sifirla();
        fisSecili = null;
        Object.keys(fisBtn).forEach(function (k) { fisBtn[k].disabled = false; fisBtn[k].classList.remove('secili', 'bitti'); });
        Object.keys(pinBtn).forEach(function (n) { pinBtn[n].classList.remove('dolu', 'h10-fis-hdd', 'h10-fis-pled', 'h10-fis-rst', 'h10-fis-pwr'); });
        tepsi.querySelectorAll('button').forEach(function (b) { b.disabled = false; b.classList.remove('bitti', 'secili'); });
        ilerlemeYaz();
        mesaj('Önce güvenlik: tepsideki ilk doğru kart hangisi? (Fiş çekili.)', '');
      }

      /* — Kartlar — */
      function kart(ad) {
        if (mesgul || st.bitti) return;
        zamanBaslat();
        secimKapat(); kaldirHepsi(etiketler);
        if (ad !== 'onpanel') pano.hidden = true;
        tepsi.querySelectorAll('.em-kart').forEach(function (b) { b.classList.toggle('secili', b.dataset.kart === ad); });
        if (ad !== 'bileklik' && !st.tamam.esd) {
          return hata('esd', '✗ ESD yok: önce bilekliği tak, klipsi kasanın boyasız metaline bağla. Hissetmediğin bir boşalma bile karta zarar verebilir.');
        }
        ({ bileklik: bileklik, io: io, ayak: ayak, anakart: anakart, psu: psu, guc: guc, onpanel: onpanel, gpu: gpuKart, ssd: ssd })[ad]();
      }
      function bileklik() {
        if (st.tamam.esd) return mesaj('Bileklik zaten bağlı.', '');
        tamamla('esd'); ses('klik');
        esdRozet.className = 'h10-esd tamam'; esdRozet.textContent = '✓ ESD: klips kasanın metalinde';
        mesaj('✓ Bileklik kasanın boyasız metaline bağlı: sen ve kasa aynı potansiyeldesin. Şimdi parçalara dokunabilirsin.', 'dogru');
      }
      function io() {
        if (st.tamam.io) return mesaj('G/Ç plakası zaten yerinde.', '');
        S.io.visible = true; S.io.rotation.set(0, 0, 0); S.io.position.copy(IO_MERKEZ).add(v(0, 8, 8));
        return mesgulYap(D.git(S.io, IO_MERKEZ.clone(), sn(1), 'easeOutCubic').then(function () {
          ses('klik'); tamamla('io');
          etiketler.push(s.etiket(S.io, '✓ G/Ç plakası', { tur: 'dogru' }));
          mesaj('✓ Plaka içeriden bastırıldı, delikleri kartın portlarıyla aynı düzende. Kart takıldıktan sonra plaka araya giremezdi.', 'dogru');
        }));
      }
      function ayakCik(liste) {
        return Promise.all(liste.map(function (a, i) {
          a.visible = true; a.scale.set(1, 0.01, 1);
          return D.bekle(sn(i * 0.08), s).then(function () {
            return D.tween({ sahne: s, sure: sn(0.4), guncelle: function (e) { a.scale.y = 0.01 + e * 0.99; a.rotation.y = e * 6; } });
          });
        }));
      }
      function ayak() {
        if (st.tamam.ayak) return mesaj('Ayaklar yerinde: dokuz delik, dokuz ayak.', '');
        secimDugme('Kartın deliklerine göre (9)', function () {
          secimKapat();
          mesgulYap(ayakCik(S.ayaklar).then(function () {
            ses('klik'); tamamla('ayak');
            mesaj('✓ Dokuz delik, dokuz ayak: kart tepsiden birkaç milimetre yukarıda duracak.', 'dogru');
          }));
        }, 'don3d-dugme--birincil');
        secimDugme('Tepsideki bütün yuvalara (10)', function () {
          secimKapat();
          mesgulYap(ayakCik(S.ayaklar.concat([S.fazla])).then(function () {
            etiketler.push(s.etiket(S.fazla, '✗ Delik yok', { tur: 'hata' }));
            hata('ayak-fazla', '✗ Onuncu ayağın üstünde kartta delik yok: kartın alt yüzündeki lehim noktalarına değer ve kısa devre yapar. Ayaklar geri alındı; delik sayısı kadar tak.');
            return D.uyari(S.fazla, { genlik: 0.3 });
          }).then(function () { return D.bekle(1.2, s); }).then(function () {
            kaldirHepsi(etiketler); D.vurguKaldir(S.fazla, 0);
            S.ayaklar.concat([S.fazla]).forEach(function (a) { a.visible = false; });
          }));
        });
        mesaj('Tepside 10 ayak yuvası var, kartta 9 vida deliği. Kaç ayak takılır?', '');
      }
      function anakart() {
        if (st.tamam.anakart) return mesaj('Anakart zaten vidalı.', '');
        if (!st.tamam.io) return hata('io-yok', '✗ Önce G/Ç plakası: kart takılınca plaka içeriden bastırılamaz. Kart geri alındı.');
        if (!st.tamam.ayak) return hata('ayaksiz', '✗ Ayak yok: kartın lehim noktaları metal tepsiye değer, kısa devre olur. Kart geri alındı; önce mesafe vidaları.');
        m.visible = true; m.position.copy(KART).add(v(0, 10, 3));
        return mesgulYap(D.git(m, KART.clone().add(v(0, 1.2, -0.3)), sn(1)).then(function () { return D.git(m, KART.clone(), sn(0.5), 'easeInCubic'); })
          .then(function () {
            ses('klik');
            return Promise.all(S.kartVida.map(function (vd, i) { return D.bekle(sn(VIDA_SIRA.indexOf(i) * 0.12), s).then(function () { return vidala(vd, S.vidaYeri[i], 0.35); }); }));
          }).then(function () {
            tamamla('anakart');
            mesaj('✓ Portlar plakaya girdi, delikler ayaklarda; dokuz vida çapraz sırayla takıldı.', 'dogru');
          }));
      }
      function psu() {
        if (st.tamam.psu) return mesaj('Güç kaynağı zaten yerinde.', '');
        S.psu.visible = true; S.psu.position.copy(PSU_YER).add(v(0, 16, 0));
        return mesgulYap(D.git(S.psu, PSU_YER.clone(), sn(1.1), 'easeOutCubic').then(function () {
          ses('klik'); S.goster(['psuVida'], true); tamamla('psu');
          mesaj('✓ Güç kaynağı alt bölmede, fanı aşağıdaki filtreli deliğe bakıyor; arkadan dört vidayla sabit. Fiş hâlâ çekili.', 'dogru');
        }));
      }
      function pcieTak() {
        S.kPcie.visible = true;
        return D.fisTak(S.kPcie, S.pPcie, { bas: 4 }).then(function () {
          st.pcie = true; S.kablolar('daginik', kabloDurum());
          return kabloBuyut(S.kablo.pcie.daginik, 0.8);
        }).then(function () { tamamla('gpu'); });
      }
      function kabloDurum() { return { g24: st.tamam.guc, eps: st.tamam.guc, pcie: st.pcie, fp: st.tamam.onpanel }; }
      function guc() {
        if (st.tamam.guc) return mesaj('24-pin ve 8-pin zaten takılı.', '');
        if (!st.tamam.psu) return hata('guc-psu', '✗ Kablolar güç kaynağından gelir: önce güç kaynağını yerine tak.');
        if (!st.tamam.anakart) return hata('guc-kart', '✗ Kabloların takılacağı anakart henüz kasada değil.');
        mesaj('24-pin fişi hazır. İşlemci girişine (EPS, kartın üst kenarı) hangi fişi takarsın?', '');
        secimDugme('CPU 8-pin (4+4)', function () {
          secimKapat();
          S.k24.visible = true; S.kEps.visible = true;
          mesgulYap(D.fisTak(S.k24, S.p24, { bas: 5 }).then(function () { return D.fisTak(S.kEps, S.pEps, { bas: 4 }); }).then(function () {
            tamamla('guc'); S.kablolar('daginik', kabloDurum());
            return Promise.all([kabloBuyut(S.kablo.g24.daginik, 0.8), kabloBuyut(S.kablo.eps.daginik, 0.8)]);
          }).then(function () {
            mesaj('✓ 24-pin kartın ön kenarında, CPU 8-pin üst kenarda; iki tırnak da oturdu.' + (st.gpuTakili && !st.pcie ? ' Ekran kartının 6+2 ek gücü de takılıyor.' : ''), 'dogru');
            if (st.gpuTakili && !st.pcie) return pcieTak();
          }));
        }, 'don3d-dugme--birincil');
        secimDugme('PCIe 6+2', function () {
          secimKapat();
          S.kPcie.visible = true;
          mesgulYap(D.fisTak(S.kPcie, S.pEps, { uygun: false, bas: 4 }).then(function () {
            hata('eps-pcie', '✗ PCIe 6+2 fişi EPS girişine girmez: pin biçimleri ve +12 V sırası farklı. Zorlanırsa kısa devre olur. İşlemciye CPU yazan 4+4 fiş takılır.');
            S.kPcie.visible = st.pcie;
            if (st.pcie) takili(S.kPcie, S.pPcie);
          }));
        });
      }
      /* Ön panel: E-TAK pin seçimi */
      function onpanel() {
        if (st.tamam.onpanel) return mesaj('Ön panel kabloları zaten takılı.', '');
        if (!st.tamam.anakart) return hata('onpanel-kart', '✗ Ön panel pinleri anakartın üstünde: önce anakartı kasaya vidala.');
        pano.hidden = false;
        mesaj('Bir kablo seç, sonra takılacağı pine dokun. Işık kablolarında + ucun pinini seç. Emin değilsen Kılavuz’u aç.', '');
      }
      function fisSec(k) {
        if (mesgul || st.fp[k]) return;
        fisSecili = k;
        Object.keys(fisBtn).forEach(function (x) { fisBtn[x].classList.toggle('secili', x === k); });
        var f = FIS.filter(function (x) { return x.k === k; })[0];
        mesaj(f.ad + ' seçildi: ' + (f.arti ? '+ ucunun takılacağı pine dokun.' : 'takılacağı iki pinden birine dokun (kutupsuz).'), '');
      }
      function pinSec(n) {
        if (mesgul) return;
        if (!fisSecili) return mesaj('Önce soldaki listeden bir kablo seç.', '');
        var f = FIS.filter(function (x) { return x.k === fisSecili; })[0];
        var dolu = Object.keys(st.fp).some(function (k) { return FIS.filter(function (x) { return x.k === k; })[0].pin.indexOf(n) >= 0; });
        if (dolu) return mesaj('Bu pin dolu; başka pin seç.', '');
        if (f.pin.indexOf(n) < 0) {
          return hata('onpanel-pin', '✗ ' + n + '. pin ' + f.ad + ' için değil. Kılavuzdaki şemaya bak: kablolar yalnız kendi pin çiftine takılır.');
        }
        if (f.arti && n !== f.arti) {
          return hata('led-ters', '✗ ' + n + '. pin eksi (−): ışık kablosu ters olur, ışık yanmaz (zarar vermez). + uç ' + f.arti + '. pine gelmeli.');
        }
        st.fp[f.k] = true;
        f.pin.forEach(function (p) { pinBtn[p].classList.add('dolu', 'h10-fis-' + f.k); });
        fisBtn[f.k].classList.remove('secili'); fisBtn[f.k].classList.add('bitti'); fisBtn[f.k].disabled = true;
        fisSecili = null; ses('klik');
        if (Object.keys(st.fp).length < 4) return mesaj('✓ ' + f.ad + ' ' + f.pin.join('–') + ' pinlerinde. Sıradaki kablo?', 'dogru');
        pano.hidden = true;
        S.fpBlok.visible = true; tamamla('onpanel'); S.kablolar('daginik', kabloDurum());
        mesgulYap(kabloBuyut(S.kablo.fp.daginik, 0.8).then(function () {
          etiketler.push(s.etiket(S.fpBlok, '✓ F_PANEL', { tur: 'dogru' }));
          mesaj('✓ Dört kablo şemadaki pinlerde: ışıklarda + uçlar doğru, düğmeler kendi çiftinde.', 'dogru');
        }));
      }
      function gpuKart() {
        if (st.tamam.gpu || st.gpuTakili) return mesaj(st.pcie ? 'Ekran kartı ve ek gücü takılı.' : 'Kart yuvada; 6+2 ek güç 24 + 8-pin kartıyla birlikte takılacak.', '');
        if (!st.tamam.anakart) return hata('gpu-kart', '✗ Ekran kartı anakarttaki PCIe yuvasına takılır: önce anakart.');
        mesaj('Kart hangi yuvaya?', '');
        secimDugme('İlk PCIe x16 yuvası', function () {
          secimKapat();
          mesgulYap(Promise.all([sok(S.kapakVida[0], 0.4), sok(S.kapakVida[1], 0.4)]).then(function () {
            return Promise.all([0, 1].map(function (i) { return D.git(S.kapaklar[i], S.kapakYer[i].clone().add(v(0, 13, 1)), sn(0.6)); }));
          }).then(function () {
            S.kapaklar[0].visible = S.kapaklar[1].visible = false;
            gpu.visible = true; gpu.position.copy(S.gpuYer).add(v(0, 7, 0));
            return D.takAnim(gpu, { hedef: S.gpuYer.clone(), dogru: true, yukseklik: 6 });
          }).then(function () { return vidala(S.kapakVida[0], kvYer[0], 0.4); }).then(function () { return vidala(S.kapakVida[1], kvYer[1], 0.4); })
            .then(function () {
              st.gpuTakili = true;
              if (st.tamam.guc) {
                mesaj('✓ Kart x16 yuvasında, braket vidalı. 6+2 ek güç takılıyor…', 'dogru');
                return pcieTak().then(function () { mesaj('✓ Ekran kartı yuvada, braketi vidalı, 6+2 ek gücü takılı.', 'dogru'); });
              }
              mesaj('✓ Kart x16 yuvasında, braket vidalı. Ek güç (6+2) güç kabloları takılınca bağlanacak.', 'dogru');
            }));
        }, 'don3d-dugme--birincil');
        secimDugme('Alttaki kısa x1 yuvası', function () {
          secimKapat();
          gpu.visible = true; gpu.position.copy(S.gpuYer).add(x1Fark).add(v(0, 6, 0));
          mesgulYap(D.git(gpu, S.gpuYer.clone().add(x1Fark).add(v(0, 1.2, 0)), sn(0.7)).then(function () { return D.uyari(gpu, { genlik: 0.25 }); })
            .then(function () {
              hata('gpu-x1', '✗ x16 kartın uzun tarağı kısa x1 yuvasına girmez; zorlamak yuvayı kırar. Ekran kartı işlemciye bağlı ilk x16 yuvasına takılır.');
              return D.bekle(0.8, s);
            }).then(function () { D.vurguKaldir(gpu, 0); gpu.visible = false; }));
        });
      }
      function ssd() {
        if (st.tamam.ssd) return mesaj('SSD ve iki kablosu zaten takılı.', '');
        if (!st.tamam.anakart || !st.tamam.psu) return mesaj('SSD’nin veri kablosu anakarta, güç kablosu güç kaynağına gider: önce ikisi de kasada olsun.', '');
        S.ssd.visible = true; S.ssd.position.copy(SSD_YER).add(v(0, 8, 0));
        return mesgulYap(D.git(S.ssd, SSD_YER.clone(), sn(0.8), 'easeOutCubic').then(function () {
          S.goster(['sata'], true);
          return D.fisTak(S.veriA, S.agV, { bas: 3 });
        }).then(function () { return D.fisTak(S.gucS, S.agG, { bas: 3 }); }).then(function () {
          tamamla('ssd');
          mesaj('✓ SSD yerinde; SATA veri kablosu anakarta, SATA güç kablosu güç kaynağına bağlı.', 'dogru');
        }));
      }
      function bitir() {
        if (mesgul || st.bitti) return;
        zamanBaslat(); secimKapat(); pano.hidden = true;
        var eksik = ASAMA.filter(function (a) { return !st.tamam[a]; });
        if (eksik.length) {
          return hata('eksik', '✗ Öğretmen onay vermedi. Eksik: ' + eksik.map(function (a) { return ASAMA_AD[a]; }).join(', ') + '. Fiş eksik bağlantıyla takılmaz.');
        }
        mesaj('Öğretmen onay verdi. Monitör kablosunu nereye takarsın?', '');
        monitorSor();
      }
      function monitorSor() {
        secimDugme('Ekran kartının çıkışı', function () { secimKapat(); ilkAcilis(); }, 'don3d-dugme--birincil');
        secimDugme('Anakartın HDMI çıkışı', function () {
          secimKapat();
          mon.sinyalYok();
          hata('monitor', '✗ Sinyal yok: ekran kartı takılıyken görüntü çoğu sistemde kartın çıkışlarından gelir; anakart çıkışı devre dışı kalır. Kabloyu ekran kartına tak.');
          mesgulYap(D.bekle(1.6, s).then(function () { mon.sifirla(); })).then(monitorSor);
        });
      }
      function ilkAcilis() {
        st.bitti = true;
        if (zamanlayici) clearInterval(zamanlayici);
        sureYaz();
        tepsi.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        S.isik(1.6); S.fanlar(true); ses('klik');
        mesaj('Güç düğmesine basıldı: fanlar dönüyor, POST denetimi başladı…', '');
        mesgulYap(mon.oynat().then(function () { return D.bekle(0.8, s); }).then(function () {
          var sayim = {};
          st.hatalar.forEach(function (h) { sayim[h] = (sayim[h] || 0) + 1; });
          rapor.innerHTML = '';
          el('b', 'h10-rapor-bas', rapor, 'Montaj raporu · POST geçti');
          var ozet = el('div', 'h10-rapor-ozet', rapor);
          el('span', '', ozet, 'Süre ' + sureEl.textContent);
          el('span', st.hataSay ? 'var' : 'yok', ozet, 'Hata ' + st.hataSay);
          var ul = el('ul', '', rapor);
          if (!st.hataSay) el('li', 'iyi', ul, 'Bütün adımlar doğru sırayla, ilk denemede yapıldı.');
          Object.keys(sayim).forEach(function (h) { el('li', '', ul, HATA_AD[h] + (sayim[h] > 1 ? ' × ' + sayim[h] : '')); });
          el('p', 'h10-rapor-sira', rapor, 'Doğru sıra: ESD → G/Ç plakası → ayaklar → anakart → güç kaynağı → 24 + 8-pin → ön panel → ekran kartı + 6+2 → SSD → öğretmen onayı → monitör ekran kartına → POST. (Güç kaynağı anakarttan önce de takılabilir.)');
          var dg = el('button', 'don3d-dugme don3d-dugme--birincil', rapor, 'Baştan başla');
          dg.type = 'button';
          dg.addEventListener('click', function () { sifirla(); });
          rapor.hidden = false;
          mesaj(st.hataSay ? 'POST geçti. Rapordaki hataları gerçek kasada yapmamak için kontrolcüne okut.' : '✓ Kusursuz montaj ve ilk POST!', st.hataSay ? '' : 'dogru');
          if (!st.hataSay) DERS.konfeti();
        }));
      }
      s.dugme('Baştan', 'tekrar', function () { if (!mesgul) sifirla(); }, { yer: 'ust-sag', aciklama: 'Montajı baştan başlat' });
      sifirla();
      api = { kart: kart, bitir: bitir };
    });
  })();

  /* ═══════════ Etkinlik 2: kontrolcü kartları ═══════════ */
  (function () {
    var kok = document.getElementById('kontrolcu');
    if (!kok) return;
    var TUR = [
      { svg: '<!--@dahil:kr-1.svg-->', soru: 'Kart tepsiye yatırılmak üzere. Tepsideki ayaklara baktın (kırmızı olan dahil). Kararın?',
        sec: ['Onayla: fazla ayak kartı daha iyi taşır', 'Düzelt: deliğe denk gelmeyen ayağı sök', 'Düzelt: o ayağa da vida tak'], dogru: 1,
        ac: 'Deliği olmayan yerdeki ayak kartın alt yüzündeki lehim noktalarına değer ve kısa devre yapabilir. Ayak sayısı kartın delik sayısına eşit olmalı.' },
      { svg: '<!--@dahil:kr-2.svg-->', soru: 'Kart vidalandı. Arkadan baktığında G/Ç plakasında bunu gördün. Kararın?',
        sec: ['Düzelt: kartı gevşet, tırnağı porttan çıkarıp yeniden oturt', 'Onayla: tırnak portu sabitler', 'Düzelt: USB fişini tırnakla birlikte bastır'], dogru: 0,
        ac: 'Porta giren tırnak USB’nin temaslarına değer; port çalışmaz ya da kısa devre olur. Kart gevşetilir, tırnak düzeltilip kart yeniden oturtulur.' },
      { svg: '<!--@dahil:kr-3.svg-->', soru: 'Uygulayan işlemci girişine bir fiş zorluyor, “8 pin, 8 pin” diyor. Kararın?',
        sec: ['Onayla: ikisi de 8 pin, fark etmez', 'Düzelt: fişi 180° çevirip tak', 'Düzelt: CPU yazan 4+4 fişi tak'], dogru: 2,
        ac: 'EPS ile PCIe 6+2 fişlerinin pin biçimi ve +12 V sırası farklıdır; zorlanırsa kısa devre olabilir. İşlemci girişine CPU yazan 4+4 fiş takılır.' },
      { svg: '<!--@dahil:kr-4.svg-->', soru: 'Ön panelde dört fiş takılı. Kılavuza göre 2 = PLED+, 4 = PLED−. Kararın?',
        sec: ['Düzelt: PLED fişini çevir, + uç 2’ye', 'Onayla: ışık kablosunun yönü fark etmez', 'Düzelt: PWR SW fişini de çevir'], dogru: 0,
        ac: 'Işık kablolarında yön önemlidir; ters takılırsa ışık yanmaz (zarar vermez). Düğme kabloları kutupsuzdur, onların yönü fark etmez.' },
      { svg: '<!--@dahil:kr-5.svg-->', soru: 'İlk açılış yapıldı, fanlar dönüyor ama monitör “sinyal yok” diyor. Kararın?',
        sec: ['Onayla: HDMI her yerde aynıdır, beklemek yeter', 'Düzelt: kabloyu ekran kartının çıkışına tak', 'Düzelt: ikinci bir monitör kablosu ekle'], dogru: 1,
        ac: 'Ekran kartı takılıyken görüntü çoğu sistemde kartın çıkışlarından gelir; anakart çıkışı devre dışı kalır. Kablo kapatılıp ekran kartına takılır.' },
      { svg: '<!--@dahil:kr-6.svg-->', soru: 'Güç fişleri takıldı, ekran kartı vidalandı. Kararın?',
        sec: ['Düzelt: 24-pin’i çıkarıp yeniden tak', 'Düzelt: ek güç fişini çıkar', 'Onayla: tırnaklar oturmuş, kart vidalı'], dogru: 2,
        ac: 'Üç güç fişi de tırnağıyla oturmuş, kart braketinden vidalı: montaj doğru. Sırada kablo düzeni ve öğretmen onayı var.' }
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var i = 0, puan = 0;
    var kr = el('div', 'kr', kok);
    function goster() {
      kr.innerHTML = '';
      if (i >= TUR.length) {
        var s = el('div', 'kr-son', kr);
        el('b', '', s, puan + ' / ' + TUR.length);
        el('span', '', s, puan >= 5 ? 'Güvenilir bir kontrolcüsün: gerçek kasada da aynı gözle bak.' : 'İpucu: ayak sayısı, fişin türü, + uç ve monitör çıkışı. Kartları yeniden dene.');
        DERS.dugme(s, 'Yeniden oyna', function () { i = 0; puan = 0; ilerle(0, TUR.length); goster(); }, 'dy-ileri');
        if (puan >= 5) DERS.konfeti();
        return;
      }
      var t = TUR[i];
      var kart = el('div', 'kr-kart', kr);
      var ust = el('div', 'kr-ust', kart);
      el('span', 'kr-no', ust, 'Kart ' + (i + 1) + ' / ' + TUR.length);
      var r = el('div', 'kr-resim', kart); r.innerHTML = t.svg;
      el('div', 'kr-soru', kart, t.soru);
      var sec = el('div', 'kr-secenek uc', kart);
      var geri = el('div', 'kr-geri', kart); geri.setAttribute('aria-live', 'polite');
      t.sec.forEach(function (m, j) {
        var b = DERS.dugme(sec, m, function () {
          var dogru = j === t.dogru;
          sec.querySelectorAll('button').forEach(function (x, k) { x.disabled = true; if (k === t.dogru) x.classList.add('iyi'); });
          if (!dogru) b.classList.add('kotu');
          if (dogru) { puan++; ses('klik'); } else ses('hata');
          geri.className = 'kr-geri ' + (dogru ? 'iyi' : 'kotu');
          geri.innerHTML = '<span></span>';
          geri.firstChild.textContent = (dogru ? '✓ Doğru. ' : '✗ Değil. ') + t.ac;
          i++; ilerle(i, TUR.length);
          DERS.dugme(geri, i < TUR.length ? 'Sonraki kart →' : 'Sonucu gör →', goster, 'dy-ileri');
        }, 'kr-btn');
      });
    }
    goster();
  })();
})();
