/* M-KABLO-SATA — SATA kablo uçları (kablo tarafı, dişi, marka yok):
     SATA veri ucu (7 pin, yassı şerit kablo; kilit mandallı ya da mandalsız; düz ya da 90° açılı; kırmızı ya da koyu)
     SATA güç ucu (15 pin, siyah gövde, 4 ya da 5 telli demet; düz ya da 90° açılı).
   bagimli: M-SSD
   Ölçü birimi: cm. Ağız kesiti, sürücüdeki portun (DON3D.sataKonnektor, M-SSD) dil + L kolu ölçülerinden türetilir
   (+0,02 cm boşluk); böylece iki parça birebir eşleşir. L yuvası ters tutulursa (fişin kendi ekseninde 180°) portun L koluna çarpar.
   Tek uç (ops.tur = 'veri' | 'guc'):
     ORİJİN = ucun AĞZI (porta ilk giren yüz), dil yuvasının kesit merkezi. Gövde +Z yönündedir; uç −Z yönünde takılır.
     Yerel X: dil boyu (genişlik), yerel Y: dil kalınlığı; L'nin kısa kolu +Y'ye uzanır (ayna: kol −X ucunda, değilse +X ucunda).
     Bu düzen D.fisTak/D.fisKonumla (don3d-anim.js, A-FIS) ile aynıdır: port işaretinin yerel +Z'si dışarı bakar,
     fişin gövdesi +Z'dedir. Port işareti için D.sataAgiz(portGrubu) kullanılır (dil ucunda, yerel +Z dışarı):
       D.fisTak(uc, D.sataAgiz(hdd.userData.sataVeri), { ters: false })   // oturur, 'klik'
       D.fisTak(uc, D.sataAgiz(...), { ters: true })                      // L ters: girmez, geri döner
     Takılı konum: D.fisKonumla(uc, agiz, -uc.userData.giris * 0.9) — uç, portun arka gövdesine dayanır.
     Varsayılan ayna: veri true, güç false (M-SSD/M-HDD portlarıyla eşleşir; L kolları iki konnektörün dış uçlarında).
   Gösterim (ops.tur yok): düz mandallı kırmızı veri ucu, 90° koyu veri ucu ve 5 telli güç ucu, ağızları okura dönük.
   ops: { tur, aci: 0 | 90, aciYon: -1 (kablo −Y'ye) | 1, mandal: true (yalnız veri), renk: 'kirmizi' | 'koyu' | '#hex',
          tel: 4 | 5 (yalnız güç), ayna, kablo: [[x,y,z], …] (yerel, çıkıştan sonraki noktalar), kabloUzun: 6, kabloYok: false }
   Parçalar: 'sata-veri-ucu' | 'sata-guc-ucu' (grup), 'sata-uc-agiz' (L ağızlı ön gövde), 'sata-uc-govde', 'sata-mandal', 'sata-kablo'.
   userData:
     tur, pin, ayna, giris (porta giren derinlik, cm), agizKesit {genislik, yukseklik}, govde, mandal (Group | null),
     cikis (Object3D: kablonun gövdeden çıktığı nokta; yerel +Z = çıkış yönü), kablo (Mesh | Group),
     kabloBagla(hedef, { ara: [dünya noktaları], yon: Vector3 (hedef Vector3 ise, kablonun hedeften çıkış yönü), uzun: 1.6 })
       → kablonun uzak ucunu dünyada sabitler; uç hareket ettikçe kablo her karede yeniden çizilir (hedef başka bir ucun
         userData.cikis nesnesi olabilir: iki uçlu veri kablosu). kabloCiz(): elle yeniden çizer.
     mandalBas(basili: bool, sure) → Promise (mandalın arka dili bastırılır, ön kancası kalkar).
   Ek yardımcı: DON3D.sataAgiz(port) (aşağıda). Üçgen bütçesi: uç başına ≈ 2 000 (kablo dahil; gösterim ≈ 6 000).
   Not (DOĞRULA): Mandalın hangi geniş yüzde olduğu ve güç tellerinin sırası (sarı 12 V L kolu tarafında) üreticiye göre
   değişebilir; derste tel sırası ve mandal yüzü öğretilmez. */
(function (D) {
  'use strict';
  var RENK = { kirmizi: '#c3242a', koyu: '#2a2d34' };
  var TELLER = [['sari', '#e8b10c'], ['siyah', '#17181b'], ['kirmizi', '#d0282b'], ['siyah', '#17181b'], ['turuncu', '#f07d1c']];
  var P = 0.127;          // pin aralığı (1,27 mm)
  var BOS = 0.02;         // ağız boşluğu

  /** Port (sürücü tarafı) ölçüleri: dil, L kolu ve arka gövde kutuları (port yerelinde). */
  function portOlcu(K, tur, ayna) {
    var THREE = K.THREE;
    var ref = D.sataKonnektor(K, tur, { ayna: ayna });
    function kutu(o) {
      o.geometry.computeBoundingBox();
      return o.geometry.boundingBox.clone().translate(o.position);
    }
    var c = ref.children;
    var boy = ref.userData.boy;
    var sonuc = null;
    if (c.length >= 5 && c[3].isMesh && c[4].isMesh && !c[3].isInstancedMesh) {
      var dil = kutu(c[3]), kol = kutu(c[4]), govde = kutu(c[0]);
      if (Math.abs((dil.max.x - dil.min.x) - boy) < 0.01) sonuc = { dil: dil, kol: kol, govdeZ: govde.max.z };
    }
    if (!sonuc) {   // yedek: M-SSD'deki sabitler
      var kal = 0.11, der = 0.46, ux = (ayna ? -1 : 1) * (boy / 2 - 0.055);
      sonuc = {
        dil: new THREE.Box3(new THREE.Vector3(-boy / 2, -kal / 2, 0.1), new THREE.Vector3(boy / 2, kal / 2, der + 0.1)),
        kol: new THREE.Box3(new THREE.Vector3(ux - 0.055, -0.02, 0.1), new THREE.Vector3(ux + 0.055, 0.28, der + 0.1)),
        govdeZ: 0.2
      };
    }
    sonuc.boy = boy;
    sonuc.pin = ref.userData.pin;
    return sonuc;
  }

  /** L ağız çokgeni (XY). Anahtar kolu s = +1 ise +X ucunda. */
  function agizYolu(THREE, o, s) {
    var a = Math.max(Math.abs(o.dil.min.x), Math.abs(o.dil.max.x)) + BOS;
    var yb = o.dil.min.y - BOS, yd = o.dil.max.y + BOS, yk = o.kol.max.y + BOS;
    var kx = (s > 0 ? o.kol.min.x : -o.kol.max.x) - BOS;       // kolun iç kenarı (+X yönüne göre)
    var noktalar = [[-a, yb], [a, yb], [a, yk], [kx, yk], [kx, yd], [-a, yd]];
    var yol = new THREE.Path();
    noktalar.forEach(function (p, i) {
      var x = p[0] * s, y = p[1];
      if (i === 0) yol.moveTo(x, y); else yol.lineTo(x, y);
    });
    yol.closePath();
    return { yol: yol, a: a, yb: yb, yd: yd, yk: yk };
  }

  function yuvarlakDikdortgen(THREE, x0, y0, x1, y1, r) {
    var sh = new THREE.Shape();
    sh.moveTo(x0 + r, y0);
    sh.lineTo(x1 - r, y0); sh.quadraticCurveTo(x1, y0, x1, y0 + r);
    sh.lineTo(x1, y1 - r); sh.quadraticCurveTo(x1, y1, x1 - r, y1);
    sh.lineTo(x0 + r, y1); sh.quadraticCurveTo(x0, y1, x0, y1 - r);
    sh.lineTo(x0, y0 + r); sh.quadraticCurveTo(x0, y0, x0 + r, y0);
    return sh;
  }

  /**
   * Yassı şerit (veri kablosu) geometrisi: eğri boyunca w × t dikdörtgen kesit, paralel taşımalı çerçeve.
   * W0: başlangıçtaki genişlik yönü, Wson: bitişte istenen genişlik yönü (varsa kesit yavaşça döner).
   */
  function seritGeo(THREE, egri, W0, Wson, w, t, seg) {
    var V3 = THREE.Vector3;
    var n = seg + 1, P = [], T = [], W = [];
    var w0 = W0.clone();
    for (var i = 0; i < n; i++) {
      var u = i / seg;
      var p = egri.getPointAt(u), tg = egri.getTangentAt(u).normalize();
      w0.sub(tg.clone().multiplyScalar(w0.dot(tg)));
      if (w0.lengthSq() < 1e-6) w0 = new V3(1, 0, 0).cross(tg).lengthSq() > 1e-4 ? new V3(0, 1, 0).cross(tg) : new V3(0, 0, 1).cross(tg);
      w0.normalize();
      P.push(p); T.push(tg); W.push(w0.clone());
    }
    if (Wson) {
      var tS = T[n - 1], ws = Wson.clone().sub(tS.clone().multiplyScalar(Wson.dot(tS)));
      if (ws.lengthSq() > 1e-6) {
        ws.normalize();
        var we = W[n - 1];
        var aci = Math.atan2(new V3().crossVectors(we, ws).dot(tS), we.dot(ws));
        if (aci > Math.PI / 2) aci -= Math.PI; else if (aci < -Math.PI / 2) aci += Math.PI;   // şerit simetrik: en kısa dönüş
        var q = new THREE.Quaternion();
        for (var j = 1; j < n; j++) {
          var k = j / (n - 1);
          q.setFromAxisAngle(T[j], aci * k * k * (3 - 2 * k));
          W[j].applyQuaternion(q);
        }
      }
    }
    var konum = [], normal = [], indeks = [];
    // 4 yüz: +N (üst), −N (alt), +W, −W — düz gölgelendirme için yüz başına ayrı köşeler
    var YUZ = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    YUZ.forEach(function (yz, f) {
      var taban = konum.length / 3;
      for (var i = 0; i < n; i++) {
        var Nv = new V3().crossVectors(T[i], W[i]).normalize();
        var nrm = yz[0] ? Nv.clone().multiplyScalar(yz[0]) : W[i].clone().multiplyScalar(yz[1]);
        var kenar = yz[0] ? W[i] : Nv;                                  // yüz boyunca uzanan eksen
        var yari = yz[0] ? w / 2 : t / 2;
        var merkez = P[i].clone().add(nrm.clone().multiplyScalar(yz[0] ? t / 2 : w / 2));
        var a = merkez.clone().add(kenar.clone().multiplyScalar(yari)), b = merkez.clone().sub(kenar.clone().multiplyScalar(yari));
        konum.push(a.x, a.y, a.z, b.x, b.y, b.z);
        normal.push(nrm.x, nrm.y, nrm.z, nrm.x, nrm.y, nrm.z);
      }
      for (var s = 0; s < n - 1; s++) {
        var i0 = taban + s * 2, i1 = i0 + 1, i2 = i0 + 2, i3 = i0 + 3;
        if (f === 0 || f === 3) indeks.push(i0, i2, i1, i1, i2, i3); else indeks.push(i0, i1, i2, i1, i3, i2);
      }
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
    g.setIndex(indeks);
    g.computeBoundingSphere();
    return { geo: g, noktalar: P, W: W };
  }

  function uc(K, tur, ops) {
    var THREE = K.THREE, V3 = THREE.Vector3;
    var veri = tur !== 'guc';
    var ayna = ops.ayna == null ? veri : !!ops.ayna;
    var s = ayna ? -1 : 1;
    var aci = ops.aci === 90 ? 90 : 0, aciYon = ops.aciYon === 1 ? 1 : -1;
    var o = portOlcu(K, veri ? 'veri' : 'guc', ayna);
    var g = new THREE.Group();
    if (veri) K.parca(g, 'sata-veri-ucu', 'SATA veri kablosu ucu (7 pin)', 'Diskle anakart arasında veriyi taşır. Dar, L biçimli uç yalnız tek yönde girer.');
    else K.parca(g, 'sata-guc-ucu', 'SATA güç kablosu ucu (15 pin)', 'Güç kaynağından diske elektrik getirir. Geniş, L biçimli uç yalnız tek yönde girer.');

    var ag = agizYolu(THREE, o, s);
    var duvar = 0.19;
    var x0 = -ag.a - duvar, x1 = ag.a + duvar, y0 = ag.yb - 0.17, y1 = ag.yk + 0.1;
    var gW = x1 - x0, gH = y1 - y0, yM = (y0 + y1) / 2;
    var siyah = K.mat('#17181c', { roughness: 0.58 });
    var yuvaIc = K.mat('#0a0a0c', { roughness: 0.9 });

    // Ağız bölümü: L delikli dış kesitin Z boyunca uzatılmışı (öndeki L açıklık gerçekten boş)
    var dAgiz = 0.56;
    var dis = yuvarlakDikdortgen(THREE, x0, y0, x1, y1, 0.08);
    dis.holes.push(ag.yol);
    var agizGeo = K.geoPaylas(['sata-agiz', tur, s].join(':'), function () {
      return new THREE.ExtrudeGeometry(dis, { depth: dAgiz, bevelEnabled: false, curveSegments: 3 });
    });
    var agiz = new THREE.Mesh(agizGeo, siyah);
    K.parca(agiz, 'sata-uc-agiz', 'L biçimli ağız', 'Ağız L harfi gibidir: portun L biçimli diline yalnız doğru yönde geçer.');
    g.add(agiz);
    // Ön yüz: biraz açık gri plaka (L boşluğu koyu kalır; yön uzaktan da okunur)
    var onYuz = new THREE.Mesh(K.geoPaylas(['sata-onyuz', tur, s].join(':'), function () {
      var sh = yuvarlakDikdortgen(THREE, x0 + 0.015, y0 + 0.015, x1 - 0.015, y1 - 0.015, 0.07);
      sh.holes.push(agizYolu(THREE, o, s).yol);
      return new THREE.ShapeGeometry(sh, 3);
    }), K.mat('#3c4048', { roughness: 0.62 }));
    onYuz.rotation.y = Math.PI;                      // ShapeGeometry +Z'ye bakar; ön yüz −Z'ye baksın
    onYuz.scale.x = -1;                              // döndürme X'i aynaladı; geri al
    onYuz.position.z = -0.004;
    onYuz.userData.golgeYok = true;
    agiz.add(onYuz);
    // Yuvanın içi: koyu taban + altın yaylı temaslar (dilin alt yüzüne değer)
    var icTaban = K.kutu(ag.a * 2 - 0.01, 0.01, dAgiz - 0.08, yuvaIc);
    icTaban.userData.golgeYok = true;
    K.koy(g, icTaban, 0, ag.yb + 0.006, dAgiz / 2 + 0.04);
    var temasGeo = K.geoPaylas('sata-dişi-temas', function () { return new THREE.BoxGeometry(0.06, 0.02, 0.3); });
    var temasKonum = [];
    for (var i = 0; i < o.pin; i++) temasKonum.push([-(o.pin - 1) / 2 * P + i * P, ag.yb + 0.018, 0.3]);
    var temas = K.ornekle(temasGeo, 'altin', temasKonum);
    temas.userData.golgeYok = true; temas.userData.secilmez = true;
    g.add(temas);

    // Arka gövde (kablonun girdiği kısım)
    var govde = new THREE.Group();
    K.parca(govde, 'sata-uc-govde', veri ? 'Veri ucu gövdesi' : 'Güç ucu gövdesi', 'Kablo buradan tutulur; kablodan çekilmez.');
    var gov1 = veri ? (aci ? 0.55 : 0.95) : (aci ? 0.6 : 0.8);
    var arka = K.kutu(gW, gH, gov1 + 0.08, siyah, 0.07);
    K.koy(govde, arka, 0, yM, dAgiz + gov1 / 2 - 0.04);
    var cikis = new THREE.Object3D();
    cikis.name = 'sata-kablo-cikis';
    var zSon = dAgiz + gov1;
    if (aci) {
      // 90°: gövde aşağı (ya da yukarı) döner; kablo ±Y yönünde çıkar
      var dirsekH = veri ? 0.95 : 0.9;
      var dirsek = K.kutu(gW, dirsekH + 0.1, gov1 + 0.02, siyah, 0.07);
      var yD = aciYon < 0 ? y0 - dirsekH / 2 + 0.02 : y1 + dirsekH / 2 - 0.02;
      K.koy(govde, dirsek, 0, yD, dAgiz + gov1 / 2 - 0.02);
      var ag2 = K.kutu(veri ? 1.05 : gW - 0.25, 0.3, veri ? 0.34 : 0.4, siyah, 0.06);
      var yA = aciYon < 0 ? y0 - dirsekH - 0.1 : y1 + dirsekH + 0.1;
      K.koy(govde, ag2, 0, yA, dAgiz + gov1 / 2);
      cikis.position.set(0, aciYon < 0 ? yA - 0.12 : yA + 0.12, dAgiz + gov1 / 2);
      cikis.rotation.x = aciYon < 0 ? Math.PI / 2 : -Math.PI / 2;     // yerel +Z → ∓Y
    } else {
      var bot = K.kutu(veri ? 1.08 : gW - 0.3, veri ? 0.34 : 0.42, 0.38, siyah, 0.07);   // kablo koruyucu (bot)
      K.koy(govde, bot, 0, veri ? yM - 0.04 : yM, zSon + 0.15);
      cikis.position.set(0, veri ? yM - 0.04 : yM, zSon + 0.3);
    }
    // Tutma yivleri (iki yanda)
    [-1, 1].forEach(function (yan) {
      for (var k = 0; k < 3; k++) {
        K.koy(govde, K.kutu(0.02, gH * 0.55, 0.06, K.mat('#232429', { roughness: 0.7 })), yan * (gW / 2 + 0.005), yM, dAgiz + 0.18 + k * 0.14);
      }
    });
    g.add(govde);
    g.add(cikis);

    // Kilit mandalı (veri): metal şerit + ön kanca + arka bastırma dili; pivot ortada
    var mandal = null;
    if (veri && ops.mandal !== false) {
      mandal = new THREE.Group();
      K.parca(mandal, 'sata-mandal', 'Kilit mandalı', 'Uç yerine oturunca porta tutunur. Çıkarırken arka dile bastırılır.');
      var celik = K.mat('#b7bcc3', { roughness: 0.3, metalness: 0.85 });
      var pz = dAgiz + 0.28, uz = aci ? dAgiz + gov1 - 0.05 : dAgiz + gov1 - 0.02;
      K.koy(mandal, K.kutu(0.42, 0.028, uz - 0.1, celik, 0.01), 0, 0.014, (0.1 + uz) / 2 - pz);
      K.koy(mandal, K.kutu(0.3, 0.07, 0.05, celik, 0.01), 0, -0.02, 0.12 - pz);                 // ön kanca
      K.koy(mandal, K.kutu(0.46, 0.09, 0.3, K.mat('#1d1e22', { roughness: 0.6 }), 0.03), 0, 0.06, uz - 0.12 - pz);   // bastırma dili
      for (var r = 0; r < 3; r++) K.koy(mandal, K.kutu(0.46, 0.02, 0.03, K.mat('#2c2e34'), 0), 0, 0.11, uz - 0.22 + r * 0.09 - pz);
      mandal.position.set(0, y1 + 0.005, pz);
      g.add(mandal);
    }

    // Kablo
    var kablo;
    if (veri) {
      var renk = RENK[ops.renk] || ops.renk || RENK.kirmizi;
      kablo = new THREE.Mesh(new THREE.BufferGeometry(), K.mat(renk, { roughness: 0.52 }));
      K.parca(kablo, 'sata-kablo', 'SATA veri kablosu', 'İnce, yassı kablo. İçinde 7 tel vardır: veri gider ve gelir.');
    } else {
      kablo = new THREE.Group();
      K.parca(kablo, 'sata-kablo', 'SATA güç kablosu', 'Renkli teller güç kaynağından gelir: sarı, kırmızı ve siyah (toprak).');
      var telSay = ops.tel === 5 ? 5 : 4;
      for (var t = 0; t < telSay; t++) {
        var tel = new THREE.Mesh(new THREE.BufferGeometry(), K.mat(TELLER[t][1], { roughness: 0.48 }));
        tel.userData.tel = TELLER[t][0];
        kablo.add(tel);
      }
    }
    g.add(kablo);
    if (ops.kabloYok) kablo.visible = false;

    // Kablo çizimi (uç yerelinde). Bağlıysa uzak uç dünyada sabit kalır.
    var bag = null, izleyici = null, sonMatris = null;
    function yerel(v) { return g.worldToLocal(v.clone()); }
    function noktalar() {
      var S = cikis.position.clone();
      var d = new V3(0, 0, 1).applyQuaternion(cikis.quaternion);
      var dizi = [S, S.clone().add(d.clone().multiplyScalar(0.9))];
      if (bag) {
        g.updateWorldMatrix(true, false);
        var H, hd;
        if (bag.hedef.isObject3D) {
          bag.hedef.updateWorldMatrix(true, false);
          H = bag.hedef.getWorldPosition(new V3());
          hd = new V3(0, 0, 1).applyQuaternion(bag.hedef.getWorldQuaternion(new THREE.Quaternion()));
        } else {
          H = bag.hedef.clone();
          hd = (bag.yon || new V3(0, 1, 0)).clone().normalize();
        }
        dizi.push(S.clone().add(d.clone().multiplyScalar(1.9)));
        (bag.ara || []).forEach(function (a) { dizi.push(yerel(a)); });
        dizi.push(yerel(H.clone().add(hd.clone().multiplyScalar(bag.uzun * 1.8))));
        dizi.push(yerel(H.clone().add(hd.clone().multiplyScalar(bag.uzun))));
        dizi.push(yerel(H));
        return { dizi: dizi, sonW: bag.hedef.isObject3D ? new V3(1, 0, 0).applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion()).invert()
          .multiply(bag.hedef.getWorldQuaternion(new THREE.Quaternion()))) : null };
      }
      if (ops.kablo) {
        ops.kablo.forEach(function (p) { dizi.push(new V3().fromArray(p)); });
        return { dizi: dizi, sonW: null };
      }
      var uzun = ops.kabloUzun || 6;
      var asagi = Math.abs(d.y) > 0.7 ? new V3(0, 0, 1) : new V3(0, -1, 0);
      dizi.push(S.clone().add(d.clone().multiplyScalar(2.2)).add(asagi.clone().multiplyScalar(0.5)));
      dizi.push(S.clone().add(d.clone().multiplyScalar(3.4)).add(asagi.clone().multiplyScalar(uzun * 0.45)));
      dizi.push(S.clone().add(d.clone().multiplyScalar(3.9)).add(asagi.clone().multiplyScalar(uzun)));
      return { dizi: dizi, sonW: null };
    }
    function kabloCiz() {
      if (ops.kabloYok) return;
      var n = noktalar();
      var egri = new THREE.CatmullRomCurve3(n.dizi, false, 'centripetal');
      var uzunluk = egri.getLength();
      var seg = Math.max(24, Math.min(90, Math.round(uzunluk * 2.2)));
      var W0 = new V3(1, 0, 0);
      if (veri) {
        var sg = seritGeo(THREE, egri, W0, n.sonW, 0.82, 0.13, seg);
        if (kablo.geometry) kablo.geometry.dispose();
        kablo.geometry = sg.geo;
        kablo.userData.egri = egri;
      } else {
        var cer = seritGeo(THREE, egri, W0, n.sonW, 0.1, 0.1, Math.max(16, Math.round(seg * 0.6)));
        cer.geo.dispose();
        var telSay = kablo.children.length, ara = 0.25;
        kablo.children.forEach(function (tel, j) {
          var ofs = ((telSay - 1) / 2 - j) * ara * s;       // ilk tel (sarı) L kolu tarafında
          var pts = cer.noktalar.map(function (p, i) { return p.clone().add(cer.W[i].clone().multiplyScalar(ofs)); });
          var e = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
          if (tel.geometry) tel.geometry.dispose();
          tel.geometry = new THREE.TubeGeometry(e, pts.length + 8, 0.095, 7, false);
        });
        kablo.userData.egri = egri;
      }
    }
    function izle() {
      if (izleyici) return true;
      var sh = D.sahneBul(g);
      if (!sh) return false;
      izleyici = sh.herKare(function () {
        if (!bag || !g.visible) return;
        g.updateWorldMatrix(true, false);
        var m = g.matrixWorld.elements, h = bag.hedef.isObject3D ? (bag.hedef.updateWorldMatrix(true, false), bag.hedef.matrixWorld.elements) : null;
        var imza = m.join(',') + (h ? '|' + h.join(',') : '');
        if (imza !== sonMatris) { sonMatris = imza; kabloCiz(); }
      });
      return true;
    }
    kabloCiz();

    g.userData.tur = veri ? 'veri' : 'guc';
    g.userData.pin = o.pin;
    g.userData.ayna = ayna;
    g.userData.giris = Math.max(0.2, (o.dil.max.z - o.govdeZ) / 0.9);
    g.userData.agizKesit = { genislik: gW, yukseklik: gH };
    g.userData.govde = govde;
    g.userData.mandal = mandal;
    g.userData.cikis = cikis;
    g.userData.kablo = kablo;
    g.userData.kabloCiz = kabloCiz;
    g.userData.kabloBagla = function (hedef, bops) {
      bops = bops || {};
      bag = { hedef: hedef.isObject3D ? hedef : new V3().copy(hedef), ara: (bops.ara || []).map(function (a) { return a.isVector3 ? a.clone() : new V3().fromArray(a); }),
        yon: bops.yon ? (bops.yon.isVector3 ? bops.yon.clone() : new V3().fromArray(bops.yon)) : null, uzun: bops.uzun == null ? 1.6 : bops.uzun };
      sonMatris = null;
      kabloCiz();
      if (!izle()) D.bekle(0.05).then(izle);
      return g;
    };
    g.userData.mandalBas = function (basili, sure) {
      if (!mandal) return Promise.resolve();
      var r0 = mandal.rotation.x, r1 = basili ? 0.16 : 0;
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.25 : sure, anahtar: 'mandal', hedef: mandal,
        guncelle: function (e) { mandal.rotation.x = r0 + (r1 - r0) * e; } });
    };
    return g;
  }

  /** Sürücü/anakart portunun (DON3D.sataKonnektor grubu) ağız işareti: dil ucunda, yerel +Z dışarı. D.fisTak ile kullanılır. */
  D.sataAgiz = function (port) {
    if (port.userData.agiz) return port.userData.agiz;
    var zMax = 0;
    port.children.forEach(function (c) {
      if (!c.isMesh || c.isInstancedMesh || !c.geometry) return;
      c.geometry.computeBoundingBox();
      zMax = Math.max(zMax, c.position.z + c.geometry.boundingBox.max.z);
    });
    var o = new D.kit.THREE.Object3D();
    o.name = (port.name || 'sata') + '-agiz';
    o.position.set(0, 0, zMax || 0.56);
    port.add(o);
    port.userData.agiz = o;
    return o;
  };

  D.modelTanimla('M-KABLO-SATA', function (K, ops) {
    ops = ops || {};
    if (ops.tur) return uc(K, ops.tur, ops);
    var THREE = K.THREE, g = new THREE.Group();
    K.parca(g, 'M-KABLO-SATA', 'SATA kabloları', 'Diske iki kablo takılır: dar veri kablosu ve geniş güç kablosu. İkisi de L biçimlidir.');
    var liste = [
      { tur: 'veri', mandal: true, x: -3.6 },
      { tur: 'veri', aci: 90, renk: 'koyu', mandal: false, x: -0.6 },
      { tur: 'guc', tel: 5, x: 3.4 }
    ];
    liste.forEach(function (l) {
      var u = uc(K, l.tur, { mandal: l.mandal, aci: l.aci, renk: l.renk, tel: l.tel, kabloUzun: 5 });
      u.rotation.set(-0.12, Math.PI, 0);   // ağız okura (+Z) dönük
      K.koy(g, u, l.x, 5.4, 0);
      u.rotation.set(-0.12, Math.PI, 0);
    });
    return g;
  });
})(window.DON3D);
