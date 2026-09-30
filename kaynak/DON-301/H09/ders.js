/* DON-301 H09 — Montaj 1: Tezgâhta · ders betiği (ortak betikten sonra çalışır)
   Adım 1–6: iki panelli atölye slaytlarında 3D provalar (anakart kutusunun üstünde, kasa dışında, güç yok).
   Etkinlik 1: E-MONTAJ (derse özel 3D montaj simülatörü). Etkinlik 2: kontrolcü kartları (2D). */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var THREE = window.THREE, K = D.kit, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 3’teki provada macunun nasıl yayıldığını göreceğiz.');

  var KUTU_H = 4;                       // anakart kutusunun yüksekliği (cm)
  var CPU_DOGRU = -Math.PI / 2;         // M-CPU üçgeni (−X,+Z) → soketteki üçgen (−X,−Z)
  var SOKET_Y = 0.31;                   // işlemcinin soket içindeki oturma yüksekliği (soket grubu yerel)

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

  /* ─────────── Ortak 3D yardımcıları ─────────── */
  var kartonMat = null;
  function kutuYap() {
    if (!kartonMat) kartonMat = K.mat('#b98a55', { roughness: 0.86 });
    var g = new THREE.Group();
    K.koy(g, K.kutu(27.5, KUTU_H, 34, kartonMat, 0.25, 2), 0, KUTU_H / 2, 0);
    K.koy(g, K.kutu(9, 1.6, 0.06, 'plastikBeyaz'), 6, KUTU_H / 2, 17.02);
    K.koy(g, K.kutu(0.06, 1.2, 7, 'plastikBeyaz'), 13.77, KUTU_H / 2, -9);
    g.traverse(function (o) { o.userData.secilmez = true; });
    return g;
  }
  /* Anakart kutusu + üstünde anakart (kasa dışı tezgâh düzeni) */
  function tezgah(s, taban) {
    taban = taban || 0;
    var kutu = kutuYap();
    kutu.position.y = taban;
    s.kok.add(kutu);
    var m = s.ekle('M-ANAKART', { konum: [0, taban + KUTU_H, 0] });
    var sp = m.userData.soket.grup.position.clone();
    return { m: m, kutu: kutu, soketPos: sp, cpuYer: sp.clone().add(new V3(0, SOKET_Y, 0)) };
  }
  /* Kamerayı sahnede belirli bir noktaya odaklar (Sıfırla da bu görünüme döner) */
  function odak(s, dunyaNokta, yon, pay) {
    s.ops.kamera = { yon: yon, pay: pay, hedefOfset: dunyaNokta.clone().sub(s._merkez).toArray() };
    s.kameraSigdir();
  }
  function dunya(o) { o.updateWorldMatrix(true, false); return o.getWorldPosition(new V3()); }
  function cpuYap() {
    var c = D.model('M-CPU');
    var alt = c.getObjectByName('temas-yuzeyi');
    if (alt) alt.visible = false;                  // alt yüz takılıyken görünmez; üçgen bütçesi için gizli
    return c;
  }
  function cpuH(c) { return c.userData.olcu.kapakY; }
  function sogutucuYap() {
    var g = D.model('M-SOGUTUCU');
    g.userData.macunAyarla(false, 0);              // modelin hazır macun katmanı yerine derse özel damla kullanılır
    g.rotation.y = Math.PI / 2;                    // fan anakartın önüne (+X), hava arka panele (−X) doğru
    return g;
  }
  function damlaYap() {
    var d = new THREE.Mesh(K.geoPaylas('h09-damla', function () { return new THREE.SphereGeometry(1, 20, 12); }), K.mat('termal'));
    K.parca(d, 'macun-damlasi', 'Termal macun', 'Pirinç tanesi kadar macun; soğutucunun baskısıyla ince bir katmana yayılır.');
    d.scale.set(0.001, 0.001, 0.001);
    d.visible = false;
    return d;
  }
  var DAMLA = [0.3, 0.16, 0.3], YAYIK = [1.32, 0.035, 1.32];
  function damlaAyarla(d, olcek, sure) {
    var b = d.scale.clone();
    d.visible = true;
    return D.tween({ sahne: D.sahneBul(d), sure: sure == null ? 0.6 : sure, hedef: d, anahtar: 'damla', guncelle: function (e) {
      d.scale.set(b.x + (olcek[0] - b.x) * e, b.y + (olcek[1] - b.y) * e, b.z + (olcek[2] - b.z) * e);
    } });
  }
  /* Fan kablosu: fanın alt köşesinden CPU_FAN başlığına (anakart yerel koordinatı) */
  function fanKablosu(m, sogYer, sog) {
    var o = sog.userData.olcu;
    var bas = sogYer.clone().add(new V3(o.fanZ + 0.9, o.fanY - 5.4, -5.3));
    m.updateWorldMatrix(true, true);
    var h = m.worldToLocal(dunya(m.getObjectByName('fan-baslik')));
    var g = new THREE.Group();
    var kablo = K.kablo([bas, bas.clone().add(new V3(0.4, -1.4, -0.8)), h.clone().add(new V3(0.3, 1.8, 0.9)), h.clone().add(new V3(0, 0.95, 0.05))], 0.11,
      K.mat('#111214', { roughness: 0.6 }));
    g.add(kablo);
    K.koy(g, K.kutu(1.12, 0.45, 0.5, K.mat('#f1f2f4', { roughness: 0.5 }), 0.05), h.x, h.y + 0.72, h.z + 0.05);
    g.traverse(function (x) { x.userData.secilmez = true; });
    g.userData.kablo = kablo;
    return g;
  }
  function kabloBuyut(g, sure) {
    var k = g.userData.kablo, n = k.geometry.index ? k.geometry.index.count : k.geometry.attributes.position.count;
    g.visible = true;
    return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.9 : sure, guncelle: function (e) { k.geometry.setDrawRange(0, Math.max(3, Math.floor(n * e / 3) * 3)); } })
      .then(function () { k.geometry.setDrawRange(0, Infinity); });
  }
  /* Koruma kapağı: yük plakası kapanırken soketten çıkar (sakla) ve sıfırlanınca yerine döner */
  function kapakYonetici(m) {
    var kp = m.userData.soket.kapak, ebeveyn = kp.parent, p0 = kp.position.clone(), r0 = kp.rotation.clone();
    return {
      cikar: function (sure) {
        m.attach(kp);
        var b = kp.position.clone(), q0 = kp.quaternion.clone(), q1 = new THREE.Quaternion();
        var ust = b.clone().add(new V3(1.2, 2.6, 1.6));
        return D.tween({ sahne: D.sahneBul(m), sure: sn(sure == null ? 1 : sure), guncelle: function (e) {
          kp.position.lerpVectors(b, ust, e);
          kp.quaternion.slerpQuaternions(q0, q1, e);
        } }).then(function () { return D.bekle(0.5, D.sahneBul(m)); }).then(function () { kp.visible = false; });
      },
      geri: function () { ebeveyn.add(kp); kp.position.copy(p0); kp.rotation.copy(r0); kp.visible = true; }
    };
  }
  /* Montajı tamamlanmış kart (kapak ve Adım 6 için) */
  function montajKur(t) {
    var m = t.m;
    m.userData.kapakGoster(false);
    var c = cpuYap(); c.position.copy(t.cpuYer); c.rotation.y = CPU_DOGRU; m.add(c);
    var sogYer = t.cpuYer.clone().add(new V3(0, cpuH(c), 0));
    var sog = sogutucuYap(); sog.position.copy(sogYer); m.add(sog);
    var fk = fanKablosu(m, sogYer, sog); m.add(fk);
    var ramlar = [1, 3].map(function (i) {
      var y = m.userData.yuvalar[i], r = D.model('M-RAM');
      r.position.copy(y.userData.oturma); y.add(r); return r;
    });
    var yuva = m.userData.m2[0], ssd = D.model('M-M2');
    ssd.position.copy(yuva.userData.oturma); yuva.add(ssd);
    return { cpu: c, sog: sog, fanKablo: fk, ramlar: ramlar, ssd: ssd };
  }

  /* 3D prova oynatıcı: altyazı + Oynat/Tekrarla (hareket azaltmada Adım adım) */
  function prova(s, adimlar, ops) {
    ops = ops || {};
    var alt = D.div('u-altyazi', s.arayuz);
    alt.setAttribute('aria-live', 'polite');
    var calisiyor = false, sira = 0, surum = 0;
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
      calisiyor = true; sira = 0; surum++;
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
      sonuc.textContent = hazir ? '✔ Tezgâh hazır: montaja başlayabilirsiniz.' : 'Kontrolcü okur, uygulayan işaretler (' + n + ' / ' + maddeler.length + ')';
      if (hazir) DERS.konfeti();
    }
    maddeler.forEach(function (m) {
      m.addEventListener('click', function () { m.setAttribute('aria-pressed', m.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); guncelle(); });
    });
    guncelle();
  })();

  /* ═══════════ Kapak: montajı bitmiş kart, kutusunun üstünde döner ═══════════ */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 40,
      kamera: { yon: [0.75, 0.95, 1], pay: 0.74 } });
    var t = tezgah(s);
    montajKur(t);
    s.yerlestir();
  });

  /* ═══════════ Adım 1: ESD ve çalışma alanı ═══════════ */
  D.tembel('#s6-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.45, 1.15, 1], pay: 0.92, hedefOfset: [-2, 0, 0] } });
    var MAT_H = 0.3;
    var mat = new THREE.Group();
    K.koy(mat, K.kutu(50, MAT_H, 42, K.mat('#6f8fae', { roughness: 0.92 }), 0.4, 2), 6, MAT_H / 2, 1.5);
    K.parca(mat, 'esd-mat', 'Antistatik mat', 'Yüzeyindeki statik yükü topraklama hattına yavaşça akıtır.');
    var dugme = new THREE.Group();
    K.koy(dugme, K.silindir(0.7, 0.4, 'aluminyum', 20), 0, 0.2, 0);
    K.koy(dugme, K.silindir(0.35, 0.3, 'celik', 16), 0, 0.5, 0);
    K.parca(dugme, 'topraklama-dugmesi', 'Topraklama düğmesi', 'Bilekliğin klipsi buraya bağlanır; hat binanın topraklamasına gider.');
    K.koy(mat, dugme, 26.5, MAT_H, 17.5);
    var hat = K.kablo([new V3(27.1, MAT_H + 0.3, 17.2), new V3(29, MAT_H + 0.2, 13), new V3(29.6, MAT_H + 0.15, 2), new V3(31.8, 0.15, -6)], 0.14, K.mat('#15803d', { roughness: 0.6 }));
    hat.userData.secilmez = true; mat.add(hat);
    var hatUc = new THREE.Object3D(); hatUc.position.set(29.4, 0.3, 7); mat.add(hatUc);
    s.kok.add(mat);
    var t = tezgah(s, MAT_H), m = t.m;
    var bil = s.ekle('M-ANTISTATIK-BILEKLIK', { konum: [19.5, MAT_H + 0.55, 6], donus: [0, 0.35, 0], modelOps: { klipsX: 3, klipsZ: -3 } });
    var klips = bil.userData.klips, k0 = klips.position.clone(), kr0 = klips.rotation.clone();
    // Poşet (yarı saydam, metalik): anakart başta poşetin içinde, kutunun üstünde havada
    var posetMat = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.55, roughness: 0.35, transparent: true, opacity: 0.55, depthWrite: false });
    var poset = K.kutu(26.5, 4.6, 32.5, posetMat, 0.6, 2);
    poset.userData.secilmez = true;
    s.kok.add(poset);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.3, maxPolar: 1.35, minYakin: 0.5, maxYakin: 1.4 } });
    var kartY = MAT_H + KUTU_H, havada = 7;
    function klipsHedef() {                              // topraklama düğmesinin bileklik yerel koordinatı
      bil.updateWorldMatrix(true, false);
      return bil.worldToLocal(dunya(dugme).add(new V3(-3.4, 0.7, 0)));
    }
    var etiketler = [];
    function sifirla() {
      kaldirHepsi(etiketler);
      [mat, m.getObjectByName('atx24'), m.getObjectByName('eps8'), m.getObjectByName('soket-kapak')].forEach(function (p) { if (p) D.vurguKaldir(p, 0); });
      klips.position.copy(k0); klips.rotation.copy(kr0); bil.userData.kabloGuncelle();
      m.position.y = kartY + havada; poset.position.set(0, kartY + havada + 1.9, 0); poset.visible = true; posetMat.opacity = 0.55;
    }
    prova(s, [
      { metin: 'Antistatik mat masada; yeşil hattı binanın topraklamasına gider.', calis: function () {
        etiketler.push(s.etiket(hatUc, 'Topraklama hattı', { tur: 'vurgu' }));
        return D.vurgula(mat, { etiket: 'Antistatik mat' }).then(function () { return D.bekle(1.2, s); }).then(function () { return D.vurguKaldir(mat); });
      } },
      { metin: 'Bilekliği deriye değecek şekilde tak; klipsi matın topraklama düğmesine bağla.', calis: function () {
        var b = klips.position.clone(), h = klipsHedef(), sayac = 0;
        return D.tween({ sahne: s, sure: sn(1.3), guncelle: function (e) {
          klips.position.lerpVectors(b, h, e);
          klips.position.y += Math.sin(e * Math.PI) * 3;
          if (++sayac % 3 === 0 || e >= 1) bil.userData.kabloGuncelle();
        } }).then(function () {
          bil.userData.kabloGuncelle(); ses('klik');
          etiketler.push(s.etiket(dugme, '✓ Klips topraklamada', { tur: 'dogru' }));
        });
      } },
      { metin: 'Anakartı poşetinden çıkar; kenarlarından tutup kutusunun üstüne yatır.', calis: function () {
        var p0 = poset.position.clone();
        return D.tween({ sahne: s, sure: sn(0.9), guncelle: function (e) {
          posetMat.opacity = 0.55 * (1 - e); poset.position.set(p0.x - 30 * e, p0.y + 2 * e, p0.z);
        } }).then(function () {
          poset.visible = false;
          return D.git(m, new V3(0, kartY, 0), sn(1.1), 'easeOutCubic');
        }).then(function () { etiketler.push(s.etiket(t.kutu, 'Anakart kutusu', { tur: 'kagit', yer: 'alt' })); });
      } },
      { metin: 'Tezgâhta güç yok: 24-pin ve 8-pin girişleri bu derste boş kalır.', calis: function () {
        kaldirHepsi(etiketler);
        return Promise.all([D.vurgula(m.getObjectByName('atx24'), { etiket: '24-pin boş' }), D.vurgula(m.getObjectByName('eps8'), { etiket: '8-pin boş' })])
          .then(function () { return D.bekle(1.6, s); })
          .then(function () { return Promise.all([D.vurguKaldir(m.getObjectByName('atx24')), D.vurguKaldir(m.getObjectByName('eps8'))]); });
      } },
      { metin: 'Soketin koruma kapağı işlemci takılana kadar yerinde kalır; pimlere dokunma.', calis: function () {
        return D.vurgula(m.getObjectByName('soket-kapak'), { etiket: 'Koruma kapağı yerinde' }).then(function () { return D.bekle(1.4, s); });
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Adım 2: işlemciyi tak (A-TAK) ═══════════ */
  D.tembel('#s7-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false });
    var t = tezgah(s), m = t.m, so = m.userData.soket;
    var cpu = cpuYap(); m.add(cpu);
    var kapak = kapakYonetici(m);
    s.yerlestir();
    odak(s, dunya(so.grup).add(new V3(0.6, 1.2, 0.2)), [0.35, 1.3, 1], 0.3);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.25, maxPolar: 1.3, minYakin: 0.45, maxYakin: 2.2 } });
    var etiketler = [];
    var ust = t.cpuYer.clone().add(new V3(0, 3.2, 0));
    function sifirla() {
      kaldirHepsi(etiketler);
      [so.ucgen, so.pimler, cpu.getObjectByName('ucgen')].forEach(function (p) { D.vurguKaldir(p, 0); });
      kapak.geri();
      m.userData.soketAc(false, 0.01);
      cpu.visible = false; cpu.position.copy(ust); cpu.rotation.set(0, CPU_DOGRU + Math.PI, 0);
    }
    prova(s, [
      { metin: 'Kilit kolunu hafifçe bastırıp kancadan kurtar ve kaldır; yük plakası açılır.', calis: function () {
        etiketler.push(s.etiket(so.kol, 'Kilit kolu', { tur: 'vurgu' }));
        return D.bekle(0.8, s).then(function () { return m.userData.soketAc(true, sn(0.8)); })
          .then(function () { kaldirHepsi(etiketler); etiketler.push(s.etiket(so.plaka, 'Yük plakası açık', { tur: 'vurgu' })); });
      } },
      { metin: 'Pimlere dokunma. Soketin köşesindeki üçgeni bul: yön işareti.', calis: function () {
        kaldirHepsi(etiketler);
        etiketler.push(s.etiket(so.pimler, 'Pimler · dokunma', { tur: 'hata', yer: 'merkez' }));
        return D.vurgula(so.ucgen, { etiket: 'Soket üçgeni' });
      } },
      { metin: 'İşlemci ters tutulmuş: iki üçgen farklı köşede. Bırakırsan oturmaz, bastırırsan pimler eğilir.', calis: function () {
        kaldirHepsi(etiketler);
        cpu.visible = true;
        var u = cpu.getObjectByName('ucgen');
        D.vurgula(u, { etiket: false });
        etiketler.push(s.etiket(u, '✗ İşlemci üçgeni', { tur: 'hata' }));
        return D.takAnim(cpu, { hedef: t.cpuYer, dogru: false, yukseklik: 3.2, engel: 0.7 });
      } },
      { metin: 'İşlemciyi çevir: üçgeni soketteki üçgenle aynı köşeye gelsin.', calis: function () {
        kaldirHepsi(etiketler);
        var r0 = cpu.rotation.y;
        return D.tween({ sahne: s, sure: sn(1), guncelle: function (e) { cpu.rotation.y = r0 - Math.PI * e; } }).then(function () {
          cpu.rotation.y = CPU_DOGRU;
          etiketler.push(s.etiket(cpu.getObjectByName('ucgen'), '✓ Üçgenler aynı köşede', { tur: 'dogru' }));
          return D.bekle(0.8, s);
        });
      } },
      { metin: 'Kenarlarından tutup düz indir ve bırak: sıfır kuvvet, bastırma yok.', calis: function () {
        return D.takAnim(cpu, { hedef: t.cpuYer, dogru: true, yukseklik: 3.2 }).then(function () {
          kaldirHepsi(etiketler); D.vurguKaldir(cpu.getObjectByName('ucgen')); D.vurguKaldir(so.ucgen);
          etiketler.push(s.etiket(cpu, 'Kendi ağırlığıyla oturdu', { tur: 'dogru' }));
        });
      } },
      { metin: 'Plakayı kapat, kolu indirip kancaya tak. Çıkan koruma kapağını sakla.', calis: function () {
        kaldirHepsi(etiketler);
        return Promise.all([m.userData.soketAc(false, sn(0.8)), D.bekle(0.35, s).then(function () { return kapak.cikar(1); })]).then(function () {
          ses('klik');
          etiketler.push(s.etiket(so.kol, '✓ Kol kancada · kapak saklandı', { tur: 'dogru' }));
        });
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Adım 3: termal macun ve soğutucu ═══════════ */
  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false });
    var t = tezgah(s), m = t.m;
    m.userData.kapakGoster(false);
    var cpu = cpuYap(); cpu.position.copy(t.cpuYer); cpu.rotation.y = CPU_DOGRU; m.add(cpu);
    var kapakUst = t.cpuYer.clone().add(new V3(0, cpuH(cpu), 0));
    var damla = damlaYap(); damla.position.copy(kapakUst); m.add(damla);
    // Soğutucu bir tutucunun içinde: tutucu eğilince taban öğrenciye döner
    var tutucu = new THREE.Group(); m.add(tutucu);
    var sog = sogutucuYap(); tutucu.add(sog);
    var film = new THREE.Group();
    var filmMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.55, roughness: 0.2, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false });
    K.koy(film, new THREE.Mesh(new THREE.PlaneGeometry(4.1, 4.1), filmMat), 0, 0, 0, Math.PI / 2);
    K.koy(film, new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), filmMat), 2.4, 0, 1.6, Math.PI / 2, 0, 0.5);
    K.parca(film, 'koruyucu-film', 'Koruyucu film', 'Tabanı taşımada korur; ısıyı iletmez. Takmadan önce soyulur.');
    film.position.y = 0.03;
    sog.add(film);
    // Şırınga
    var sir = new THREE.Group();
    K.koy(sir, K.silindir(0.45, 5, K.mat('#f1f5f9', { roughness: 0.3, transparent: true, opacity: 0.85 }), 16), 0, 3.3, 0);
    K.koy(sir, K.silindir(0.36, 3.2, K.mat('termal'), 16), 0, 2.7, 0);
    K.koy(sir, K.silindir(0.14, 0.9, 'plastikAcik', 12, 0.28), 0, 0.45, 0);
    K.koy(sir, K.silindir(0.7, 0.2, 'plastikGri', 16), 0, 5.9, 0);
    sir.traverse(function (x) { x.userData.secilmez = true; });
    m.add(sir);
    var fk = null;
    s.yerlestir();
    var odakN = dunya(cpu).add(new V3(1.5, 3.2, 0));
    odak(s, odakN, [0.55, 0.75, 1.05], 0.5);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.3, maxPolar: 1.45, minYakin: 0.4, maxYakin: 1.8 } });
    var sogYer = kapakUst.clone(), havada = kapakUst.clone().add(new V3(0, 7.5, 0));
    var EGIK = -1.75;
    var vidaIsaret = [-4.4, 4.4].map(function (z) { var o = new THREE.Object3D(); o.position.copy(sogYer).add(new V3(0, 2.3, z)); m.add(o); return o; });
    var etiketler = [], not = null;
    function sifirla() {
      kaldirHepsi(etiketler);
      if (not) { not.remove(); not = null; }
      tutucu.position.copy(havada).add(new V3(4, 2.5, 3)); tutucu.rotation.set(EGIK, 0, 0);
      sog.position.set(0, 0, 0);
      film.visible = true; filmMat.opacity = 0.55; film.position.set(0, 0.03, 0);
      damla.visible = false; damla.scale.set(0.001, 0.001, 0.001);
      sir.visible = false; sir.position.copy(kapakUst).add(new V3(0, 6, 0));
      if (fk) { m.remove(fk); fk = null; }
      D.vurguKaldir(sog, 0);
    }
    prova(s, [
      { metin: 'Soğutucunun tabanına bak: koruyucu film hâlâ yapışık. Önce filmi soy.', calis: function () {
        etiketler.push(s.etiket(film, 'Koruyucu film', { tur: 'hata', yer: 'merkez' }));
        return D.bekle(1.2, s).then(function () {
          var b = film.position.clone();
          return D.tween({ sahne: s, sure: sn(1), guncelle: function (e) { film.position.set(b.x + 5 * e, b.y - 1.5 * e, b.z + 3 * e); filmMat.opacity = 0.55 * (1 - e); } });
        }).then(function () { film.visible = false; kaldirHepsi(etiketler); etiketler.push(s.etiket(sog.getObjectByName('taban'), '✓ Taban açık', { tur: 'dogru', yer: 'merkez' })); });
      } },
      { metin: 'Kapağın ortasına pirinç tanesi kadar macun koy; yayma.', calis: function () {
        kaldirHepsi(etiketler);
        var r0 = tutucu.rotation.x, p0 = tutucu.position.clone();
        sir.visible = true;
        return D.tween({ sahne: s, sure: sn(0.9), guncelle: function (e) { tutucu.rotation.x = r0 * (1 - e); tutucu.position.lerpVectors(p0, havada, e); } })
          .then(function () { return D.git(sir, kapakUst.clone().add(new V3(0, 0.55, 0)), sn(0.7)); })
          .then(function () { return damlaAyarla(damla, DAMLA, sn(0.8)); })
          .then(function () { return D.git(sir, kapakUst.clone().add(new V3(0, 7, 4)), sn(0.6)); })
          .then(function () { sir.visible = false; etiketler.push(s.etiket(damla, 'Pirinç tanesi kadar', { tur: 'vurgu' })); return D.bekle(0.6, s); });
      } },
      { metin: 'Soğutucuyu düz indir: baskı macunu ince bir katmana yayar.', calis: function () {
        kaldirHepsi(etiketler);
        var b = tutucu.position.clone();
        return D.tween({ sahne: s, sure: sn(1.4), ease: 'easeInOutCubic', guncelle: function (e) {
          tutucu.position.lerpVectors(b, sogYer, e);
          var k = Math.max(0, (e - 0.8) / 0.2);
          if (k > 0) damla.scale.set(DAMLA[0] + (YAYIK[0] - DAMLA[0]) * k, DAMLA[1] + (YAYIK[1] - DAMLA[1]) * k, DAMLA[2] + (YAYIK[2] - DAMLA[2]) * k);
        } }).then(function () { ses('klik'); });
      } },
      { metin: 'Kesit gibi bak: macun ince ve kenara taşmamış. Görevi mikroskobik boşlukları doldurmak.', calis: function () {
        return D.git(sog, new V3(0, 3.2, 0), sn(0.8)).then(function () {
          etiketler.push(s.etiket(damla, 'İnce katman', { tur: 'dogru' }));
          return D.bekle(1.6, s);
        }).then(function () { kaldirHepsi(etiketler); return D.git(sog, new V3(0, 0, 0), sn(0.7)); });
      } },
      { metin: 'İki vidayı dönüşümlü, birkaç turda sık: 1 → 2 → 1 → 2. Soğutucu eğilmesin.', calis: function () {
        var z = Promise.resolve();
        [0, 1, 0, 1].forEach(function (i, n) {
          z = z.then(function () {
            kaldirHepsi(etiketler);
            etiketler.push(s.etiket(vidaIsaret[i], String(i + 1), { tur: 'harf' }));
            ses('klik');
            return D.bekle(n < 3 ? 0.55 : 0.8, s);
          });
        });
        return z;
      } },
      { metin: 'Fan kablosunu anakarttaki CPU_FAN başlığına tak.', calis: function () {
        kaldirHepsi(etiketler);
        fk = fanKablosu(m, sogYer, sog); m.add(fk);
        return kabloBuyut(fk, sn(1)).then(function () {
          ses('klik');
          etiketler.push(s.etiket(m.getObjectByName('fan-baslik'), 'CPU_FAN', { tur: 'dogru' }));
        });
      } }
    ], { sifirla: sifirla, bitti: function () {
      if (DERS.tahmin == null) return;
      not = D.div('don3d-ipucu h09-not', s.arayuz);
      not.textContent = DERS.tahminNotu(1, 'Pirinç tanesi kadar macun baskıyla ince bir katmana yayıldı.',
        'Gördün: pirinç tanesi kadar macun ince bir katmana yayıldı. Fazlası taşar; hiç olmazsa hava boşlukları kalır.');
    } });
  });

  /* ═══════════ Adım 4: RAM, çift kanal yuvaları (A-VURGU + A-TAK) ═══════════ */
  var YUVA_AD = ['A1', 'A2', 'B1', 'B2'];
  function yuvaEtiketleri(s, m, liste) {
    m.userData.yuvalar.forEach(function (y, i) { liste.push(s.etiket(y, YUVA_AD[i], { tur: 'harf', ofset: [0, 0.3, 8.2] })); });
  }
  D.tembel('#s9-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false });
    var t = tezgah(s), m = t.m, yuvalar = m.userData.yuvalar;
    s.yerlestir();
    odak(s, dunya(m.getObjectByName('ram-yuvalari')).add(new V3(-1.2, 1.5, 1.5)), [0.3, 1.2, 1.05], 0.4);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.2, maxPolar: 1.35, minYakin: 0.45, maxYakin: 1.8 } });
    var kilavuz = D.div('h09-kilavuz', s.arayuz);
    kilavuz.innerHTML = '<b>Kılavuz · bellek yerleşimi</b><table><tr><th>Modül</th><th>Yuva</th></tr><tr><td>1</td><td>A2</td></tr>' +
      '<tr class="h09-satir"><td>2</td><td>A2 + B2</td></tr><tr><td>4</td><td>Hepsi</td></tr></table>';
    var kanalA = new THREE.Object3D(), kanalB = new THREE.Object3D();
    [[kanalA, 0, 1], [kanalB, 2, 3]].forEach(function (x) {
      m.updateWorldMatrix(true, true);
      var p = m.worldToLocal(dunya(yuvalar[x[1]]).add(dunya(yuvalar[x[2]])).multiplyScalar(0.5));
      x[0].position.copy(p).add(new V3(0, 0.8, -8.4)); m.add(x[0]);
    });
    var ramlar = [1, 3].map(function (i) { var r = D.model('M-RAM'); yuvalar[i].add(r); return r; });
    var etiketler = [], harfler = [];
    yuvaEtiketleri(s, m, harfler);
    function sifirla() {
      kaldirHepsi(etiketler);
      kilavuz.classList.remove('acik');
      yuvalar.forEach(function (y) { D.vurguKaldir(y, 0); y.userData.mandal(false, 0.01); });
      ramlar.forEach(function (r, k) { r.visible = false; r.position.copy(yuvalar[k ? 3 : 1].userData.oturma).add(new V3(0, 5, 0)); });
    }
    prova(s, [
      { metin: 'Dört yuva, iki kanal: sokete en yakından A1, A2, B1, B2.', calis: function () {
        etiketler.push(s.etiket(kanalA, 'Kanal A', { tur: 'kagit' }));
        etiketler.push(s.etiket(kanalB, 'Kanal B', { tur: 'kagit' }));
        return D.bekle(1.4, s);
      } },
      { metin: 'Kılavuzun bellek tablosu: iki modül için A2 ve B2. Bu yuvalar parlıyor.', calis: function () {
        kilavuz.classList.add('acik');
        return Promise.all([D.vurgula(yuvalar[1], { etiket: false }), D.vurgula(yuvalar[3], { etiket: false })]).then(function () { return D.bekle(1.4, s); });
      } },
      { metin: 'Neden? A2 A kanalında, B2 B kanalında: iki kanal aynı anda veri taşır.', calis: function () {
        return D.bekle(1.8, s);
      } },
      { metin: 'Mandalları aç, çentiği çıkıntıya hizala; modülü A2’ye iki ucundan eşit bastır: klik.', calis: function () {
        var r = ramlar[0]; r.visible = true;
        etiketler.push(s.etiket(r.getObjectByName('centik') || r, 'Çentik ↔ çıkıntı', { tur: 'vurgu', yer: 'alt' }));
        return D.takAnim(r, { hedef: yuvalar[1].userData.oturma.clone(), dogru: true, yukseklik: 5, yuva: yuvalar[1] }).then(function () {
          etiketler.pop().kaldir();
        });
      } },
      { metin: 'İkinci modül B2’ye: klik. Mandallar kendiliğinden kapanır.', calis: function () {
        var r = ramlar[1]; r.visible = true;
        return D.takAnim(r, { hedef: yuvalar[3].userData.oturma.clone(), dogru: true, yukseklik: 5, yuva: yuvalar[3] });
      } },
      { metin: 'Çift kanal hazır: A2 (Kanal A) + B2 (Kanal B). Modüller düz, mandallar kapalı.', calis: function () {
        return Promise.all([D.vurguKaldir(yuvalar[1]), D.vurguKaldir(yuvalar[3])]).then(function () {
          etiketler.push(s.etiket(ramlar[0], '✓ A2', { tur: 'dogru' }));
          etiketler.push(s.etiket(ramlar[1], '✓ B2', { tur: 'dogru' }));
        });
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Adım 5: M.2 SSD ═══════════ */
  D.tembel('#s10-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false });
    var t = tezgah(s), m = t.m, yuva = m.userData.m2[0], vida = yuva.userData.vida, vbas = vida.userData.bas;
    var ssd = D.model('M-M2'); yuva.add(ssd);
    var anahtar = new THREE.Object3D(); anahtar.position.set(0.44, 0.35, 0.48); yuva.add(anahtar);
    s.yerlestir();
    odak(s, dunya(yuva).add(new V3(4.2, 0.6, 0.2)), [0.25, 0.95, 1.1], 0.3);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.3, maxPolar: 1.45, minYakin: 0.45, maxYakin: 2 } });
    var AC = 0.52, otur = yuva.userData.oturma.clone();
    var yon = new V3(Math.cos(AC), Math.sin(AC), 0);
    var vb0 = vbas.position.clone();
    var etiketler = [];
    function sifirla() {
      kaldirHepsi(etiketler);
      D.vurguKaldir(yuva, 0);
      ssd.visible = false; ssd.rotation.set(0, 0, AC); ssd.position.copy(otur).addScaledVector(yon, 3);
      vbas.position.copy(vb0); vbas.rotation.set(0, 0, 0); vbas.visible = true;
    }
    prova(s, [
      { metin: 'Kılavuzdaki M.2_1 yuvasını ve ucundaki vida ayağını bul.', calis: function () {
        etiketler.push(s.etiket(vida, 'Vida ayağı', { tur: 'vurgu' }));
        return D.vurgula(yuva, { etiket: 'M.2_1 yuvası' }).then(function () { return D.bekle(1, s); });
      } },
      { metin: 'Küçük vidayı saat yönünün tersine çevirip çıkar.', calis: function () {
        kaldirHepsi(etiketler); D.vurguKaldir(yuva);
        return D.tween({ sahne: s, sure: sn(1), guncelle: function (e) { vbas.rotation.y = -6 * e; vbas.position.y = vb0.y + 1.4 * e; } })
          .then(function () { return D.git(vbas, vb0.clone().add(new V3(2.2, 1.4, 2.6)), sn(0.5)); });
      } },
      { metin: 'Anahtar çentiği yuvadaki çıkıntıya denk gelsin; SSD’yi ~30° açıyla sok.', calis: function () {
        ssd.visible = true;
        etiketler.push(s.etiket(anahtar, 'Çıkıntı ↔ M anahtarı', { tur: 'vurgu', yer: 'alt' }));
        return D.git(ssd, otur.clone(), sn(1.1), 'easeOutCubic').then(function () { ses('klik'); });
      } },
      { metin: 'Bırakınca SSD’nin ucu yukarıda kalır; bu normaldir, henüz sabit değil.', calis: function () {
        kaldirHepsi(etiketler);
        etiketler.push(s.etiket(ssd.getObjectByName('m2-vida-yuvasi') || ssd, 'Uç havada', { tur: 'hata' }));
        return D.bekle(1.4, s);
      } },
      { metin: 'Ucu vida ayağına bastır ve vidayı tak; elle sıkı, zorlamadan.', calis: function () {
        kaldirHepsi(etiketler);
        return D.tween({ sahne: s, sure: sn(0.8), guncelle: function (e) { ssd.rotation.z = AC * (1 - e); } })
          .then(function () { return D.git(vbas, vb0.clone().add(new V3(0, 1.4, 0)), sn(0.5)); })
          .then(function () { return D.tween({ sahne: s, sure: sn(1), guncelle: function (e) { vbas.rotation.y = -6 * (1 - e); vbas.position.y = vb0.y + 1.4 * (1 - e); } }); })
          .then(function () { ses('klik'); etiketler.push(s.etiket(vida, '✓ Düz ve vidalı', { tur: 'dogru' })); });
      } }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Adım 6: kontrol turu ═══════════ */
  D.tembel('#s11-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.5, 1.15, 1], pay: 0.62 } });
    var t = tezgah(s), m = t.m;
    var a = montajKur(t);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.2, maxPolar: 1.35, minYakin: 0.35, maxYakin: 1.4 } });
    var serit = D.div('h09-serit', s.arayuz);
    var MADDE = ['Kol', 'Soğutucu', 'Fan', 'RAM', 'M.2', 'Kart üstü'];
    var cipler = MADDE.map(function (x) { var c = el('span', 'h09-cip', serit, x); return c; });
    var etiketler = [];
    var bas = null;
    function durak(nesne, yakinlik, metin, tur) {
      return function () {
        kaldirHepsi(etiketler);
        var h = dunya(nesne);
        return s.kameraGit({ hedef: h, yakinlik: yakinlik }, sn(0.9)).then(function () {
          etiketler.push(s.etiket(nesne, metin, { tur: tur || 'dogru' }));
          return D.vurgula(nesne, { etiket: false, sure: 0.4 });
        }).then(function () { return D.bekle(0.9, s); }).then(function () { return D.vurguKaldir(nesne); });
      };
    }
    function cip(i, f) { return function () { cipler[i].classList.add('simdi'); return f().then(function () { cipler[i].classList.remove('simdi'); cipler[i].classList.add('tamam'); }); }; }
    function sifirla() {
      kaldirHepsi(etiketler);
      cipler.forEach(function (c) { c.classList.remove('simdi', 'tamam'); });
      if (!bas) bas = { theta: s.orb.theta, phi: s.orb.phi, yakinlik: s.orb.yakinlik, hedef: s.orb.hedef.clone() };
      else s.kameraGit(bas, 0.01);
    }
    prova(s, [
      { metin: 'Kilit kolu kancada mı? Yük plakası kapalı, işlemci yerinde.', calis: cip(0, durak(m.getObjectByName('soket-kol'), 0.42, '✓ Kol kancada')) },
      { metin: 'Soğutucu düz ve sallanmıyor mu? İki vida da sıkı.', calis: cip(1, durak(a.sog.getObjectByName('taban'), 0.62, '✓ Sallanmıyor')) },
      { metin: 'Fan kablosu CPU_FAN başlığında mı?', calis: cip(2, durak(m.getObjectByName('fan-baslik'), 0.42, '✓ CPU_FAN')) },
      { metin: 'RAM kılavuzdaki A2 ve B2’de mi, dört mandal kapalı mı?', calis: cip(3, durak(m.getObjectByName('ram-yuvalari'), 0.55, '✓ A2 + B2, mandallar kapalı')) },
      { metin: 'M.2 SSD düz ve vidalı mı?', calis: cip(4, durak(m.getObjectByName('m2-1'), 0.45, '✓ Vidalı')) },
      { metin: 'Kartın üstünde unutulmuş vida ya da macun artığı yok. Güç verilmeyecek: kart H10’da kasaya.', bekle: 1.4, calis: cip(5, function () {
        kaldirHepsi(etiketler);
        return s.kameraGit(bas, sn(1)).then(function () { etiketler.push(s.etiket(t.kutu, '✓ Kasaya hazır · güç yok', { tur: 'dogru', yer: 'alt' })); });
      }) }
    ], { sifirla: sifirla });
  });

  /* ═══════════ Etkinlik 1: E-MONTAJ — 3D montaj simülatörü ═══════════ */
  (function () {
    var tepsi = document.getElementById('em-tepsi');
    if (!tepsi) return;
    var mesajEl = document.getElementById('em-mesaj'), hataEl = document.getElementById('em-hata'), sureEl = document.getElementById('em-sure');
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var ASAMA = ['esd', 'cpu', 'kol', 'macun', 'sog', 'fan', 'ram', 'm2'];
    var ASAMA_AD = { esd: 'ESD bilekliği', cpu: 'İşlemci', kol: 'Kilit kolu', macun: 'Termal macun', sog: 'Soğutucu', fan: 'Fan kablosu', ram: 'RAM çift kanal', m2: 'M.2 vidası' };
    var HATA_AD = {
      esd: 'ESD önlemi almadan parçaya dokunma', soket: 'Soket kapalıyken işlemci', ters: 'Ters işlemci (üçgen hizasız)',
      'macun-once': 'İşlemciden önce macun', 'macun-kol': 'Kol kilitlenmeden macun', 'sog-once': 'İşlemciden önce soğutucu',
      'sog-kol': 'Kol açıkken soğutucu', macunsuz: 'Macunsuz soğutucu', 'fan-once': 'Soğutucudan önce fan kablosu',
      'ram-yuva': 'Kılavuz dışı RAM yuvası', eksik: 'Eksik adımla bitirme'
    };
    var KARTLAR = [
      ['sog', 'Soğutucu', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 3-5 4-4M14 12c4 0 5 3 4 4M12 14c0 4-3 5-4 4M10 12c-4 0-5-3-4-4"/>'],
      ['ram', 'RAM × 2', '<rect x="2" y="7" width="20" height="9" rx="1"/><path d="M5 16v3M8 16v3M11 16v3M15 16v3M18 16v3"/>'],
      ['bileklik', 'Bileklik', '<ellipse cx="8" cy="9" rx="5" ry="3.2"/><path d="M13 9.5c4 1 6 4 7 9"/><path d="M18 18.5h4"/>'],
      ['cpu', 'İşlemci', '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><path d="M6 18l4-4"/>'],
      ['m2', 'M.2 SSD', '<rect x="2" y="9" width="20" height="6" rx="1"/><path d="M5 9v6M19 12h.01"/>'],
      ['kol', 'Soket kolu', '<rect x="4" y="8" width="12" height="12" rx="1.5"/><path d="M19 21V5a2 2 0 0 0-2-2h-3"/>'],
      ['macun', 'Termal macun', '<path d="M9 2h6v4H9z"/><path d="M8 6h8v10l-4 6-4-6z"/>'],
      ['fan', 'Fan kablosu', '<path d="M4 4c6 0 6 8 12 8"/><rect x="15" y="10" width="6" height="5" rx="1"/><path d="M17 15v3M19 15v3"/>']
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
    var bitirBtn = el('button', 'em-kart em-bitir', tepsi, 'Montajı bitir ve raporla');
    bitirBtn.type = 'button';
    bitirBtn.addEventListener('click', function () { if (api) api.bitir(); });
    function mesaj(t, tur) { mesajEl.textContent = t; mesajEl.className = 'em-mesaj' + (tur ? ' ' + tur : ''); }

    var api = null;
    D.tembel('#s12-3d', function (kap) {
      var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false });
      var t = tezgah(s), m = t.m, so = m.userData.soket, yuvalar = m.userData.yuvalar;
      var cpu = cpuYap(); cpu.visible = false; m.add(cpu);
      var sogYer = t.cpuYer.clone().add(new V3(0, cpuH(cpu), 0));
      var damla = damlaYap(); damla.position.copy(sogYer); m.add(damla);
      var sog = sogutucuYap(); sog.visible = false; m.add(sog);
      var fk = fanKablosu(m, sogYer, sog); fk.visible = false; m.add(fk);
      var ramlar = [D.model('M-RAM'), D.model('M-RAM')];
      ramlar.forEach(function (r) { r.visible = false; });
      var m2y = m.userData.m2[0], vbas = m2y.userData.vida.userData.bas, vb0 = vbas.position.clone();
      var ssd = D.model('M-M2'); ssd.visible = false; m2y.add(ssd);
      var kapak = kapakYonetici(m);
      s.yerlestir();
      odak(s, m.localToWorld(new V3(-1.2, 1.5, -6.2)), [0.3, 1.3, 1], 0.44);
      D.dondur(s, { ipucu: false, sinir: { minPolar: 0.15, maxPolar: 1.35, minYakin: 0.4, maxYakin: 2.2 } });
      s._secimFiltresi = ['soket', 'ram-yuvasi-1', 'ram-yuvasi-2', 'ram-yuvasi-3', 'ram-yuvasi-4', 'm2-1'];
      var esdRozet = D.div('h09-esd', s.arayuz);
      var secim = D.div('h09-secim', s.arayuz);
      secim.setAttribute('role', 'group');
      var rapor = D.div('h09-rapor', s.arayuz); rapor.hidden = true;
      var kilavuz = D.div('h09-kilavuz em', s.arayuz);
      kilavuz.innerHTML = '<b>Kılavuz · bellek yerleşimi</b><table><tr><th>Modül</th><th>Yuva</th></tr><tr><td>1</td><td>A2</td></tr>' +
        '<tr><td>2</td><td>A2 + B2</td></tr><tr><td>4</td><td>Hepsi</td></tr></table>';
      var AC = 0.52, m2yon = new V3(Math.cos(AC), Math.sin(AC), 0), m2otur = m2y.userData.oturma.clone();
      var st, etiketler = [], harfler = [], zamanlayici = null, t0 = null, mesgul = false, mod = null, cpuQ = 2;

      function sureYaz() {
        if (t0 == null) { sureEl.textContent = '00:00'; return; }
        var x = Math.floor((Date.now() - t0) / 1000);
        sureEl.textContent = ('0' + Math.floor(x / 60)).slice(-2) + ':' + ('0' + (x % 60)).slice(-2);
      }
      function zamanBaslat() {
        if (t0 != null) return;
        t0 = Date.now();
        zamanlayici = setInterval(sureYaz, 1000);
      }
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
      function secimKapat() { secim.innerHTML = ''; mod = null; kaldirHepsi(harfler); kilavuz.classList.remove('acik'); }
      function secimDugme(metin, fn, sinif) {
        var b = el('button', 'don3d-dugme' + (sinif ? ' ' + sinif : ''), secim, metin);
        b.type = 'button';
        b.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
        return b;
      }
      function mesgulYap(p) { mesgul = true; return Promise.resolve(p).then(function (x) { mesgul = false; return x; }, function (e) { mesgul = false; console.error(e); }); }

      function sifirla() {
        kaldirHepsi(etiketler); secimKapat();
        rapor.hidden = true; rapor.innerHTML = '';
        if (zamanlayici) clearInterval(zamanlayici);
        zamanlayici = null; t0 = null; sureYaz();
        st = { esd: false, soketAcik: false, tamam: {}, ram: [], m2Takili: false, hatalar: [], hataSay: 0, bitti: false };
        hataEl.textContent = '0'; hataEl.parentNode.classList.remove('var');
        esdRozet.className = 'h09-esd'; esdRozet.textContent = 'ESD: bileklik takılı değil';
        kapak.geri(); m.userData.soketAc(false, 0.01);
        cpu.visible = false; cpu.userData.isit(null); cpuQ = 2;
        [so.ucgen, cpu.getObjectByName('ucgen')].forEach(function (p) { D.vurguKaldir(p, 0); });
        damla.visible = false; damla.scale.set(0.001, 0.001, 0.001);
        sog.visible = false; fk.visible = false;
        ramlar.forEach(function (r) { if (r.parent) r.parent.remove(r); r.visible = false; });
        yuvalar.forEach(function (y) { y.userData.mandal(false, 0.01); });
        ssd.visible = false; vbas.position.copy(vb0); vbas.rotation.set(0, 0, 0);
        tepsi.querySelectorAll('button').forEach(function (b) { b.disabled = false; b.classList.remove('bitti', 'secili'); });
        ilerlemeYaz();
        mesaj('Önce güvenlik: tepsideki ilk doğru kart hangisi?', '');
      }

      /* — Kartlar — */
      function kart(ad) {
        if (mesgul || st.bitti) return;
        zamanBaslat();
        if (mod === 'cpu' && !st.tamam.cpu) {           // havada bekleyen işlemci tepsiye geri konur
          cpu.visible = false; D.vurguKaldir(so.ucgen, 0); D.vurguKaldir(cpu.getObjectByName('ucgen'), 0);
        }
        secimKapat(); kaldirHepsi(etiketler);
        tepsi.querySelectorAll('.em-kart').forEach(function (b) { b.classList.toggle('secili', b.dataset.kart === ad); });
        if (ad !== 'bileklik' && !st.esd) {
          return hata('esd', '✗ ESD yok: önce bilekliği tak, klipsi topraklama noktasına bağla. Hissetmediğin küçük bir boşalma bile parçaya zarar verebilir.');
        }
        ({ bileklik: bileklik, kol: kol, cpu: islemci, macun: macun, sog: sogutucu, fan: fan, ram: ram, m2: m2 })[ad]();
      }
      function bileklik() {
        if (st.esd) return mesaj('Bileklik zaten bağlı.', '');
        st.esd = true; tamamla('esd'); ses('klik');
        esdRozet.className = 'h09-esd tamam'; esdRozet.textContent = '✓ ESD: bileklik topraklamada';
        mesaj('✓ Bileklik bağlı: vücudundaki yük topraklamaya akar. Şimdi parçalara dokunabilirsin.', 'dogru');
      }
      function kol() {
        if (st.tamam.sog) return mesaj('Soğutucu takılı; kol kilitli kalmalı. Açmak için önce soğutucu sökülür.', '');
        if (st.tamam.kol) return mesaj('Kol zaten kancada, işlemci yerinde. Yeniden açmaya gerek yok.', '');
        if (!st.soketAcik) {
          return mesgulYap(m.userData.soketAc(true, sn(0.7)).then(function () {
            st.soketAcik = true;
            etiketler.push(s.etiket(so.pimler, 'Pimler · dokunma', { tur: 'hata', yer: 'merkez' }));
            mesaj('Kol kalktı, yük plakası açıldı. Pimlere dokunma; sırada işlemci.', '');
          }));
        }
        if (!st.tamam.cpu) {
          return mesgulYap(m.userData.soketAc(false, sn(0.6)).then(function () {
            st.soketAcik = false;
            mesaj('Soket kapandı; içine işlemci konmadı. İşlemci için kolu yeniden kaldırman gerekecek.', '');
          }));
        }
        return mesgulYap(Promise.all([m.userData.soketAc(false, sn(0.8)), D.bekle(0.35, s).then(function () { return kapak.cikar(0.9); })]).then(function () {
          st.soketAcik = false; tamamla('kol'); ses('klik');
          etiketler.push(s.etiket(so.kol, '✓ Kol kancada', { tur: 'dogru' }));
          mesaj('✓ Plaka kapandı, kol kancada. Koruma kapağı çıktı: kutusunda sakla.', 'dogru');
        }));
      }
      function islemci() {
        if (st.tamam.cpu) return mesaj('İşlemci zaten yerinde.', '');
        if (!st.soketAcik) return hata('soket', '✗ Soket kapalı: işlemci koruma kapağının üstüne konmaz. Önce kilit kolunu kaldırıp yük plakasını aç.');
        mod = 'cpu';
        cpu.visible = true;
        cpu.position.copy(t.cpuYer).add(new V3(0, 3.2, 0));
        cpu.rotation.y = CPU_DOGRU + cpuQ * Math.PI / 2;
        D.vurgula(so.ucgen, { etiket: false }); D.vurgula(cpu.getObjectByName('ucgen'), { etiket: false });
        etiketler.push(s.etiket(so.ucgen, 'Soket üçgeni', { tur: 'vurgu', yer: 'alt' }));
        etiketler.push(s.etiket(cpu.getObjectByName('ucgen'), 'İşlemci üçgeni', { tur: 'vurgu', ofset: [0, 0.9, 0] }));
        secimDugme('Döndür 90°', function () {
          if (mesgul) return;
          var r0 = cpu.rotation.y; cpuQ = (cpuQ + 1) % 4;
          mesgulYap(D.tween({ sahne: s, sure: sn(0.45), guncelle: function (e) { cpu.rotation.y = r0 + (Math.PI / 2) * e; } }));
        });
        secimDugme('Sokete bırak', function () { cpuBirak(); }, 'don3d-dugme--birincil');
        mesaj('İşlemciyi kenarlarından tuttun. Üçgenleri aynı köşeye getir (Döndür), sonra bırak ya da sokete dokun.', '');
      }
      function cpuBirak() {
        if (mesgul || mod !== 'cpu') return;
        if (cpuQ !== 0) {
          return mesgulYap(D.takAnim(cpu, { hedef: t.cpuYer, dogru: false, yukseklik: 3.2, engel: 0.7 }).then(function () {
            hata('ters', '✗ Ters işlemci: köşe üçgenleri farklı köşede, işlemci oturmadı. Zorlarsan soket pimleri eğilir. Döndür ve yeniden dene.');
          }));
        }
        secimKapat();
        mesgulYap(D.takAnim(cpu, { hedef: t.cpuYer, dogru: true, yukseklik: 3.2 }).then(function () {
          kaldirHepsi(etiketler); D.vurguKaldir(so.ucgen); D.vurguKaldir(cpu.getObjectByName('ucgen'));
          tamamla('cpu');
          mesaj('✓ İşlemci kendi ağırlığıyla oturdu; bastırmadın. Şimdi yük plakasını kapatıp kolu kilitle.', 'dogru');
        }));
      }
      function macun() {
        if (st.tamam.macun) return mesaj('Macun zaten var; fazlası kenardan taşar.', '');
        if (!st.tamam.cpu) return hata('macun-once', '✗ Macun işlemcinin metal kapağına konur; soket boşken sürülürse pimlere bulaşır. Önce işlemciyi tak.');
        if (!st.tamam.kol) return hata('macun-kol', '✗ Önce yük plakasını kapatıp kolu kilitle; macun ondan sonra kapağın ortasına konur.');
        return mesgulYap(damlaAyarla(damla, DAMLA, sn(0.7)).then(function () {
          tamamla('macun');
          etiketler.push(s.etiket(damla, 'Pirinç tanesi kadar', { tur: 'vurgu' }));
          mesaj('✓ Kapağın ortasında pirinç tanesi kadar macun. Yayma: soğutucunun baskısı yayacak.', 'dogru');
        }));
      }
      function sogutucu() {
        if (st.tamam.sog) return mesaj('Soğutucu zaten takılı.', '');
        var ust = sogYer.clone().add(new V3(0, 9, 0));
        sog.visible = true; sog.position.copy(ust);
        if (!st.tamam.cpu) {
          return mesgulYap(D.git(sog, sogYer.clone().add(new V3(0, 1.6, 0)), sn(0.8)).then(function () {
            return D.uyari(sog, { genlik: 0.4 });
          }).then(function () { return D.git(sog, ust, sn(0.5)); }).then(function () {
            D.vurguKaldir(sog, 0); sog.visible = false;
            hata('sog-once', '✗ Soğutucu işlemciden önce takılmaz: tabanı işlemcinin metal kapağına oturmalı. Soğutucu geri alındı; önce işlemci.');
          }));
        }
        if (!st.tamam.kol) {
          return mesgulYap(D.git(sog, sogYer.clone().add(new V3(0, 2.4, 0)), sn(0.7)).then(function () { return D.git(sog, ust, sn(0.4)); }).then(function () {
            sog.visible = false;
            hata('sog-kol', '✗ Yük plakası açık, kol kilitli değil: soğutucu takılmaz. Önce plakayı kapatıp kolu kancaya tak.');
          }));
        }
        if (!st.tamam.macun) {
          return mesgulYap(D.git(sog, sogYer.clone(), sn(1)).then(function () { return D.bekle(0.3, s); }).then(function () {
            return D.git(sog, ust, sn(0.7));
          }).then(function () {
            sog.visible = false;
            cpu.userData.isit(1);
            etiketler.push(s.etiket(cpu, 'Aşırı ısınma riski', { tur: 'hata' }));
            hata('macunsuz', '✗ Macunsuz soğutucu: kapak ile taban arasında mikroskobik hava boşlukları kalır; hava ısıyı iletmez, işlemci ısınıp kendini yavaşlatır. Soğutucu geri alındı; önce macun.');
            return D.bekle(1.6, s);
          }).then(function () { cpu.userData.isit(null); kaldirHepsi(etiketler); }));
        }
        return mesgulYap(D.tween({ sahne: s, sure: sn(1.3), guncelle: function (e) {
          sog.position.lerpVectors(ust, sogYer, e);
          var k = Math.max(0, (e - 0.8) / 0.2);
          damla.scale.set(DAMLA[0] + (YAYIK[0] - DAMLA[0]) * k, DAMLA[1] + (YAYIK[1] - DAMLA[1]) * k, DAMLA[2] + (YAYIK[2] - DAMLA[2]) * k);
        } }).then(function () {
          ses('klik'); tamamla('sog'); kaldirHepsi(etiketler);
          mesaj('✓ Soğutucu düz oturdu, macun ince bir katmana yayıldı; iki vida dönüşümlü sıkıldı. Sırada fan kablosu.', 'dogru');
        }));
      }
      function fan() {
        if (st.tamam.fan) return mesaj('Fan kablosu zaten takılı.', '');
        if (!st.tamam.sog) return hata('fan-once', '✗ Fan kablosu soğutucunun fanından gelir; önce soğutucuyu tak.');
        return mesgulYap(kabloBuyut(fk, sn(0.9)).then(function () {
          ses('klik'); tamamla('fan');
          etiketler.push(s.etiket(m.getObjectByName('fan-baslik'), 'CPU_FAN', { tur: 'dogru' }));
          mesaj('✓ Fan kablosu CPU_FAN başlığında: anakart bu fanın dönüşünü izler.', 'dogru');
        }));
      }
      function ram() {
        if (st.tamam.ram) return mesaj('İki modül de kılavuzdaki yuvalarda.', '');
        mod = 'ram';
        yuvaEtiketleri(s, m, harfler);
        YUVA_AD.forEach(function (a, i) {
          var b = secimDugme(a, function () { ramTak(i); });
          if (st.ram.indexOf(i) >= 0) b.disabled = true;
        });
        secimDugme('Kılavuz', function () { kilavuz.classList.toggle('acik'); });
        mesaj((st.ram.length ? 'Birinci modül yerinde. ' : '') + 'Modülün takılacağı yuvayı seç (3D’de yuvaya da dokunabilirsin). Emin değilsen kılavuza bak.', '');
      }
      function ramTak(i) {
        if (mesgul || mod !== 'ram') return;
        if (st.ram.indexOf(i) >= 0) return mesaj(YUVA_AD[i] + ' dolu; başka yuva seç.', '');
        var r = ramlar[st.ram.length], y = yuvalar[i];
        y.add(r); r.visible = true;
        r.position.copy(y.userData.oturma).add(new V3(0, 5, 0));
        secim.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        mesgulYap(D.takAnim(r, { hedef: y.userData.oturma.clone(), dogru: true, yukseklik: 5, yuva: y }).then(function () {
          if (i === 1 || i === 3) {
            st.ram.push(i);
            if (st.ram.length === 2) {
              tamamla('ram'); secimKapat();
              mesaj('✓ Çift kanal: A2 (Kanal A) + B2 (Kanal B). Mandallar kapalı.', 'dogru');
            } else {
              mesaj('✓ ' + YUVA_AD[i] + ' kılavuzdaki yuva. İkinci modülün yuvasını seç.', 'dogru');
              secim.querySelectorAll('button').forEach(function (b, k) { b.disabled = k < 4 && st.ram.indexOf(k) >= 0; });
            }
            return;
          }
          var ayni = st.ram.filter(function (k) { return Math.floor(k / 2) === Math.floor(i / 2); })[0];
          var kanal = i < 2 ? 'A' : 'B';
          hata('ram-yuva', '✗ ' + YUVA_AD[i] + ' kılavuzdaki yuva değil: bu anakartta iki modül A2 ve B2’ye takılır. ' +
            (ayni != null ? YUVA_AD[i] + ' ile ' + YUVA_AD[ayni] + ' aynı kanalda (' + kanal + '); iki modül tek kanalda kalırdı. '
                          : 'A1 ve B1 dört modül takılınca dolar. ') + 'Modül geri alındı.');
          D.vurgula(y, { renk: '#ef4444', etiket: false, sure: 0.3 });
          return D.bekle(0.6, s).then(function () { return D.cikarAnim(r, { yuva: y, yukseklik: 5 }); }).then(function () {
            y.remove(r); r.visible = false; D.vurguKaldir(y); return y.userData.mandal(false, 0.2);
          }).then(function () {
            secim.querySelectorAll('button').forEach(function (b, k) { b.disabled = k < 4 && st.ram.indexOf(k) >= 0; });
          });
        }));
      }
      function m2() {
        if (st.tamam.m2) return mesaj('M.2 SSD zaten düz ve vidalı.', '');
        if (st.m2Takili) {
          mod = 'm2';
          secimDugme('Bastır ve vidala', m2Vidala, 'don3d-dugme--birincil');
          return mesaj('SSD yuvada ama ucu havada. Ucu vida ayağına bastırıp vidala.', '');
        }
        ssd.visible = true; ssd.rotation.set(0, 0, AC); ssd.position.copy(m2otur).addScaledVector(m2yon, 3);
        return mesgulYap(D.tween({ sahne: s, sure: sn(0.7), guncelle: function (e) { vbas.rotation.y = -6 * e; vbas.position.y = vb0.y + 1.4 * e; } })
          .then(function () { return D.git(vbas, vb0.clone().add(new V3(2.2, 1.4, 2.6)), sn(0.4)); })
          .then(function () { return D.git(ssd, m2otur.clone(), sn(0.9), 'easeOutCubic'); })
          .then(function () {
            ses('klik'); st.m2Takili = true; mod = 'm2';
            etiketler.push(s.etiket(ssd.getObjectByName('m2-vida-yuvasi') || ssd, 'Uç havada', { tur: 'hata' }));
            secimDugme('Bastır ve vidala', m2Vidala, 'don3d-dugme--birincil');
            mesaj('SSD anahtarı çıkıntıya denk geldi, açıyla girdi. Ucu yukarıda kalması normal: bastırıp vidala.', '');
          }));
      }
      function m2Vidala() {
        if (mesgul || mod !== 'm2') return;
        secimKapat(); kaldirHepsi(etiketler);
        mesgulYap(D.tween({ sahne: s, sure: sn(0.6), guncelle: function (e) { ssd.rotation.z = AC * (1 - e); } })
          .then(function () { return D.git(vbas, vb0.clone().add(new V3(0, 1.4, 0)), sn(0.4)); })
          .then(function () { return D.tween({ sahne: s, sure: sn(0.7), guncelle: function (e) { vbas.rotation.y = -6 * (1 - e); vbas.position.y = vb0.y + 1.4 * (1 - e); } }); })
          .then(function () {
            ses('klik'); tamamla('m2');
            mesaj('✓ M.2 SSD düz ve vidalı.', 'dogru');
          }));
      }
      function bitir() {
        if (mesgul || st.bitti) return;
        zamanBaslat(); secimKapat();
        var eksik = ASAMA.filter(function (a) { return !st.tamam[a]; });
        if (eksik.length) {
          return hata('eksik', '✗ Montaj bitmedi. Eksik: ' + eksik.map(function (a) { return ASAMA_AD[a]; }).join(', ') +
            (st.m2Takili && !st.tamam.m2 ? '. M.2 SSD vidasız kalırsa ucu havada kalır.' : '.'));
        }
        st.bitti = true;
        if (zamanlayici) clearInterval(zamanlayici);
        sureYaz();
        tepsi.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        var sayim = {};
        st.hatalar.forEach(function (h) { sayim[h] = (sayim[h] || 0) + 1; });
        rapor.innerHTML = '';
        el('b', 'h09-rapor-bas', rapor, 'Montaj raporu');
        var ozet = el('div', 'h09-rapor-ozet', rapor);
        el('span', '', ozet, 'Süre ' + sureEl.textContent);
        el('span', st.hataSay ? 'var' : 'yok', ozet, 'Hata ' + st.hataSay);
        var ul = el('ul', '', rapor);
        if (!st.hataSay) el('li', 'iyi', ul, 'Tüm adımlar doğru sırayla, ilk denemede yapıldı.');
        Object.keys(sayim).forEach(function (h) { el('li', '', ul, HATA_AD[h] + (sayim[h] > 1 ? ' × ' + sayim[h] : '')); });
        el('p', 'h09-rapor-sira', rapor, 'Doğru sıra: ESD → soket aç → işlemci → kolu kilitle → macun → soğutucu → fan kablosu → RAM A2 + B2 → M.2 vidalı. (RAM ve M.2 işlemciden sonra her an takılabilir.)');
        var dg = el('button', 'don3d-dugme don3d-dugme--birincil', rapor, 'Baştan başla');
        dg.type = 'button';
        dg.addEventListener('click', function () { sifirla(); });
        rapor.hidden = false;
        mesaj(st.hataSay ? 'Montaj tamam. Rapordaki hataları gerçek tezgâhta yapmamak için kontrolcüne okut.' : '✓ Kusursuz montaj! Kart kasaya hazır.', st.hataSay ? '' : 'dogru');
        if (!st.hataSay) DERS.konfeti();
      }
      s.tiklaninca(function (p) {
        if (!p || mesgul) return;
        if (mod === 'cpu' && p.name === 'soket') cpuBirak();
        else if (mod === 'ram' && p.name.indexOf('ram-yuvasi-') === 0) ramTak(+p.name.slice(-1) - 1);
        else if (mod === 'm2' && p.name === 'm2-1') m2Vidala();
      });
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
      { svg: '<!--@dahil:kr-1.svg-->', soru: 'Uygulayan macunu sürdü ve “bol olsun, daha iyi soğutur” dedi. Kararın?',
        sec: ['Onayla: çok macun daha iyi soğutur', 'Düzelt: sil, ortaya pirinç tanesi kadar koy', 'Düzelt: taşanı soketin içine doğru it'], dogru: 1,
        ac: 'Fazla macun ısı iletimini artırmaz; kenardan taşar, soketi ve pimleri kirletir. İzopropil alkollü tüy bırakmayan bezle silinir, ortaya pirinç tanesi kadar konur.' },
      { svg: '<!--@dahil:kr-2.svg-->', soru: 'Soğutucu takılmak üzere. Tabanına baktın. Kararın?',
        sec: ['Düzelt: filmi soy, sonra tak', 'Onayla: film tabanı çizilmekten korur', 'Düzelt: filmin üstüne macun sür'], dogru: 0,
        ac: 'Koruyucu film ısıyı iletmez; taban kapağa tam temas etmez ve sıcaklık hızla yükselir. Film takmadan önce soyulur.' },
      { svg: '<!--@dahil:kr-3.svg-->', soru: 'İşlemci takıldı, plaka kapatıldı. Kararın?',
        sec: ['Düzelt: kolu açıp işlemciyi bastır', 'Düzelt: işlemciyi 90° çevir', 'Onayla: üçgenler aynı köşede, kol kancada'], dogru: 2,
        ac: 'Üçgenler aynı köşede ve kol kancada: montaj doğru. İşlemci asla bastırılarak oturtulmaz; baskıyı yük plakası verir.' },
      { svg: '<!--@dahil:kr-4.svg-->', soru: 'İki 8 GB modül takıldı. Kılavuz “2 modül: A2, B2” diyor. Kararın?',
        sec: ['Onayla: yan yana en düzenli yerleşim', 'Düzelt: modülleri A2 ve B2’ye taşı', 'Düzelt: modülleri B1 ve B2’ye taşı'], dogru: 1,
        ac: 'A1 ile A2 aynı kanalda; B1 ile B2 de öyle. Her iki durumda da sistem tek kanalda çalışır. Kılavuzdaki A2 + B2 iki kanalı birlikte kullanır.' },
      { svg: '<!--@dahil:kr-5.svg-->', soru: 'M.2 SSD yuvaya sokuldu, uygulayan elini çekti. Kararın?',
        sec: ['Onayla: açılışta kendiliğinden iner', 'Düzelt: SSD’yi ters çevirip yeniden tak', 'Düzelt: ucunu ayağa bastır, vidayı tak'], dogru: 2,
        ac: 'M.2 SSD açıyla girer ve bırakılınca kalkar; bu normaldir. Ucu vida ayağına bastırılıp vidayla (ya da mandalla) sabitlenmezse temas bozulur.' },
      { svg: '<!--@dahil:kr-6.svg-->', soru: 'İki modül takıldı, mandallar kapandı. Kılavuz “2 modül: A2, B2” diyor. Kararın?',
        sec: ['Düzelt: modülleri A1 ve B1’e taşı', 'Onayla: A2 ve B2 dolu, mandallar kapalı', 'Düzelt: iki modülü de B kanalına al'], dogru: 1,
        ac: 'Kılavuzdaki çift kanal düzeni: A2 (Kanal A) + B2 (Kanal B). Kapalı mandallar modüllerin tam oturduğunu gösterir.' }
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var i = 0, puan = 0;
    var kr = el('div', 'kr', kok);
    function goster() {
      kr.innerHTML = '';
      if (i >= TUR.length) {
        var s = el('div', 'kr-son', kr);
        el('b', '', s, puan + ' / ' + TUR.length);
        el('span', '', s, puan >= 5 ? 'Güvenilir bir kontrolcüsün: gerçek tezgâhta da aynı gözle bak.' : 'İpucu: üçgen, macun miktarı, kanal ve M.2 vidası. Kartları yeniden dene.');
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
