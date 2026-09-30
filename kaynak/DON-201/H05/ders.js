/* DON-201 H05 — Anakart · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 2’de anakartın yollarında göreceğiz.');

  function sn(x) { return AZ ? 0.01 : x; }
  function merkez(liste) {
    var b = new THREE.Box3();
    liste.forEach(function (n) { b.expandByObject(n); });
    return b.getCenter(new V3());
  }
  /* A-AKIS: anakart ölçeğine uygun parçacık boyutları */
  var AKIS = { hiz: 11, boyut: 1.3, basBoyut: 0.5, izKalinlik: 0.2, parcacik: 12 };
  function akis(s, yol, renk, etiket) {
    return D.akis(s, yol, Object.assign({}, AKIS, { renk: renk, etiket: etiket }));
  }

  /* ─────────── Ortak: anakart sahnesi ─────────── */
  function kartSahnesi(kap, ops) {
    ops = ops || {};
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: !!ops.oto, turSuresi: ops.turSuresi || 40, arkaPlan: ops.arkaPlan,
      kamera: ops.kamera || { yon: [0.4, 1.2, 1], pay: 0.92 } });
    var m = s.ekle('M-ANAKART', { modelOps: ops.modelOps });
    s.yerlestir();
    if (ops.dondur !== false) D.dondur(s, { ipucu: false, sinir: { minPolar: 0.12, maxPolar: 1.42, minYakin: 0.2, maxYakin: 1.3 } });
    return { s: s, m: m };
  }
  /* Derse özel basit işlemci (M-CPU 6. haftada): alt kart + metal kapak + köşe üçgeni */
  function islemciTak(m) {
    var g = new THREE.Group();
    K.parca(g, 'islemci', 'İşlemci', 'Komutları işleyen çip; sokete oturur.');
    K.koy(g, K.kutu(3.6, 0.12, 4.2, K.mat('#1f5a3a', { roughness: 0.5 }), 0.05, 1), 0, 0.06, 0);
    K.koy(g, K.kutu(3.0, 0.28, 3.4, K.mat('#c9ced6', { roughness: 0.32, metalness: 0.9 }), 0.22, 1), 0, 0.26, 0);
    var u = new THREE.Shape(); u.moveTo(0, 0); u.lineTo(0.5, 0); u.lineTo(0, 0.5); u.lineTo(0, 0);
    var ucgen = new THREE.Mesh(new THREE.ShapeGeometry(u), K.mat('#f3c85a', { metalness: 0.6, roughness: 0.3 }));
    ucgen.rotation.x = Math.PI / 2;
    K.koy(g, ucgen, -1.72, 0.125, -2.02);
    ucgen.rotation.set(Math.PI / 2, 0, 0);
    m.userData.kapakGoster(false);
    K.koy(m.userData.soket.grup, g, 0, 0.31, 0);
    return g;
  }
  function ramTak(m, sira) {
    return sira.map(function (i) {
      var y = m.userData.yuvalar[i], r = D.model('M-RAM');
      r.position.copy(y.userData.oturma);
      y.add(r);
      return r;
    });
  }

  /* ─────────── Kapak: dönen anakart, yollarında ışık ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var a = kartSahnesi(kap, { arkaPlan: 'seffaf', oto: true, turSuresi: 48, dondur: false, kamera: { yon: [0.55, 0.9, 1], pay: 0.72 } });
    islemciTak(a.m); ramTak(a.m, [1, 3]);
    if (AZ) return;
    var sira = [['soket-ram', '#38bdf8'], ['soket-pcie', '#f59e0b'], ['cipset-sata', '#22c55e'], ['soket-cipset', '#a78bfa']], i = 0;
    (function dongu() {
      var y = sira[i % sira.length];
      akis(a.s, a.m.userData.yol(y[0]), y[1]).then(function () { i++; return D.bekle(0.3, a.s); }).then(dongu);
    })();
  });

  /* ─────────── Adım 1: kasa türleri yan yana döner (A-KARSILASTIR) ─────────── */
  D.tembel('#s4-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.08, 0.45, 1], pay: 0.98, hedefOfset: [0, -3, 0] } });
    var m = s.ekle('M-KASA-TURLERI');
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.7, maxPolar: 1.5, minYakin: 0.35, maxYakin: 1.25 } });
    var turler = m.userData.turler, oz = m.userData.ozellik;
    var AD = { masaustu: 'Masaüstü', dizustu: 'Dizüstü', tumlesik: 'Tümleşik' };
    Object.keys(turler).forEach(function (k) { s.etiket(turler[k], AD[k], { yer: 'alt' }); });
    var mesaj = DERS.sahneMesaj(s), tablo = document.getElementById('kt-tablo'), dugmeler = {};
    s.herKare(function (dt) { if (!AZ) Object.keys(turler).forEach(function (k) { turler[k].rotation.y += dt * 0.45; }); });
    function sec(k) {
      Object.keys(dugmeler).forEach(function (x) { dugmeler[x].classList.toggle('don3d-dugme--secili', x === k); });
      if (tablo) tablo.querySelectorAll('tbody tr').forEach(function (tr) { tr.classList.toggle('secili', tr.getAttribute('data-tur') === k); });
      var b = s._baslangic;
      if (k === 'hepsi') {
        s.kameraGit({ theta: b.theta, phi: b.phi, yakinlik: 1, hedef: b.hedef }, sn(0.9));
        mesaj('Üçü yan yana dönüyor. Boylarını karşılaştır.', '');
        return;
      }
      var c = merkez([turler[k]]);
      s.kameraGit({ hedef: [c.x, c.y, c.z], yakinlik: 0.52, theta: b.theta, phi: 1.22 }, sn(0.9));
      var o = oz[k];
      mesaj(o.ad + ' · Taşınır mı: ' + o.tasinir + ' · Ekran: ' + o.ekran + ' · Parça ekleme: ' + o.yukseltme, '');
    }
    [['hepsi', 'Hepsi'], ['masaustu', 'Masaüstü'], ['dizustu', 'Dizüstü'], ['tumlesik', 'Tümleşik']].forEach(function (x) {
      dugmeler[x[0]] = s.dugme(x[1], null, function () { sec(x[0]); }, { yer: 'alt-orta', aciklama: x[1] + ' görünümü' });
    });
    s._secimFiltresi = ['tur-masaustu', 'tur-dizustu', 'tur-tumlesik'];
    s.tiklaninca(function (p) { if (p) sec(p.name.replace('tur-', '')); });
    if (tablo) tablo.querySelectorAll('tbody tr').forEach(function (tr) {
      tr.tabIndex = 0;
      tr.addEventListener('click', function () { sec(tr.getAttribute('data-tur')); });
      tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sec(tr.getAttribute('data-tur')); } });
    });
    sec('hepsi');
  });

  /* ─────────── Adım 2: parçaların yolları (A-AKIS) ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var a = kartSahnesi(kap, { kamera: { yon: [0.22, 1.7, 1], pay: 0.94, hedefOfset: [-3, 0, 0] } });
    var s = a.s, m = a.m;
    var cpu = islemciTak(m);
    ramTak(m, [1, 3]);
    var mesaj = DERS.sahneMesaj(s), etiketler = [], dugmeler = {}, jeton = 0, ilkTur = true;
    function ters(ad) { return m.userData.yol(ad).reverse(); }
    var YOL = {
      ram: { ad: 'İşlemci ↔ RAM', renk: '#0ea5e9', yol: function () { return m.userData.yol('soket-ram'); },
        uclar: [[cpu, 'İşlemci'], [m.getObjectByName('ram-yuvalari'), 'RAM']], metin: 'İşlemci, çalıştığı bilgileri RAM’den alır ve RAM’e yazar.' },
      pcie: { ad: 'İşlemci ↔ Ekran kartı', renk: '#f59e0b', yol: function () { return m.userData.yol('soket-pcie'); },
        uclar: [[cpu, 'İşlemci'], [m.getObjectByName('pcie-x16-1'), 'PCIe x16']], metin: 'Görüntü bilgisi işlemciden ekran kartı yuvasına gider.' },
      disk: { ad: 'Disk ↔ İşlemci', renk: '#22c55e', yol: function () { return ters('cipset-sata').concat(ters('soket-cipset').slice(1)); },
        uclar: [[m.getObjectByName('sata'), 'SATA (disk)'], [cpu, 'İşlemci']], metin: 'Diskteki dosyalar SATA portundan yola çıkar, işlemciye ulaşır.' }
    };
    function temizle() { etiketler.forEach(function (e) { e.kaldir(); }); etiketler = []; }
    function oynat(k, j) {
      var y = YOL[k];
      Object.keys(dugmeler).forEach(function (x) { dugmeler[x].classList.toggle('don3d-dugme--secili', x === k); });
      temizle();
      y.uclar.forEach(function (u, i) { etiketler.push(s.etiket(u[0], u[1], { tur: 'vurgu', ofset: i ? [0, 0.6, 0] : [0, 0.4, 0] })); });
      mesaj(y.ad + ': ' + y.metin, '');
      var yol = y.yol();
      return akis(s, yol, y.renk, 'veri').then(function () {
        if (j !== jeton) return;
        return akis(s, yol.slice().reverse(), y.renk, 'veri');
      });
    }
    function tek(k) { jeton++; var j = jeton; oynat(k, j); }
    function hepsi() {
      jeton++;
      var j = jeton;
      oynat('ram', j)
        .then(function () { if (j === jeton) return oynat('pcie', j); })
        .then(function () { if (j === jeton) return oynat('disk', j); })
        .then(function () {
          if (j !== jeton) return;
          temizle();
          Object.keys(dugmeler).forEach(function (x) { dugmeler[x].classList.remove('don3d-dugme--secili'); });
          mesaj(ilkTur ? DERS.tahminNotu(1, 'Parçalar anakartın bakır yollarıyla haberleşir.', 'Parçalar kabloyla değil, anakartın bakır yollarıyla haberleşir.')
            : 'Anakart, bütün parçaları bakır yollarla birbirine bağlar.', 'dogru');
          ilkTur = false;
        });
    }
    [['ram', 'RAM'], ['pcie', 'PCIe'], ['disk', 'Disk']].forEach(function (x) {
      dugmeler[x[0]] = s.dugme(x[1], null, function () { tek(x[0]); }, { yer: 'alt-orta', aciklama: YOL[x[0]].ad + ' yolunu oynat' });
    });
    s.dugme('Hepsi', 'tekrar', hepsi, { yer: 'alt-orta', aciklama: 'Üç yolu sırayla oynat' });
    D.bekle(0.8, s).then(hepsi);
  });

  /* ─────────── Adım 3–6: kamera turu (A-KAMERA-TUR), durak durak ─────────── */
  var DURAK = [
    { ad: 'Soket', parca: ['soket'], yakinlik: 0.3, theta: 0.35, phi: 0.8 },
    { ad: 'RAM', parca: ['ram-yuvalari'], yakinlik: 0.4, theta: 0.95, phi: 0.92 },
    { ad: 'PCIe / M.2', parca: ['pcie-x16-1', 'pcie-x1-1', 'm2-1', 'm2-2'], yakinlik: 0.42, theta: 0.3, phi: 0.72 },
    { ad: 'Arka panel', parca: ['arka-panel'], yakinlik: 0.44, theta: -1.45, phi: 1.2 }
  ];
  function turSahnesi(sec, no, kur) {
    D.tembel(sec, function (kap) {
      var a = kartSahnesi(kap);
      var s = a.s, m = a.m;
      kap.classList.add('tur-sahne');
      var serit = D.div('asama-serit tur-serit', s.arayuz);
      serit.setAttribute('aria-label', 'Kamera turu: ' + (no + 1) + '. durak');
      DURAK.forEach(function (d, i) {
        if (i) { var ok = document.createElement('span'); ok.className = 'asama-ok'; ok.textContent = '→'; ok.setAttribute('aria-hidden', 'true'); serit.appendChild(ok); }
        var e = document.createElement('span');
        e.className = 'asama' + (i < no ? ' asama--bitti' : (i === no ? ' asama--aktif' : ''));
        e.innerHTML = '<b>' + (i + 1) + '</b>';
        e.appendChild(document.createTextNode(' ' + d.ad));
        serit.appendChild(e);
      });
      function gorunum(d) {
        var c = merkez(d.parca.map(function (n) { return m.getObjectByName(n); }));
        return { hedef: [c.x, c.y, c.z], yakinlik: d.yakinlik, theta: d.theta, phi: d.phi };
      }
      function git() {
        var b = s._baslangic;
        s.kameraGit(no > 0 ? gorunum(DURAK[no - 1]) : { hedef: b.hedef, yakinlik: 1, theta: b.theta, phi: b.phi }, 0.01);
        return D.bekle(sn(0.5), s).then(function () { return s.kameraGit(gorunum(DURAK[no]), sn(1.6)); });
      }
      kur({ s: s, m: m, git: git, mesaj: DERS.sahneMesaj(s) });
    });
  }

  /* Adım 3: işlemci soketi — kol kalkar, plaka açılır, pimler ve üçgen görünür */
  turSahnesi('#s6-3d', 0, function (t) {
    var s = t.s, m = t.m, so = m.userData.soket, mesaj = t.mesaj;
    var acik = false, mesgul = false, etiketler = [];
    D.bilgi(s, ['soket-kapak', 'soket-kol', 'soket-plaka', 'soket-ucgen', 'soket-pimler']);
    function temizle() { etiketler.forEach(function (e) { e.kaldir(); }); etiketler = []; }
    var bAc;
    function ac() {
      if (mesgul) return;
      mesgul = true; temizle();
      D.vurguKaldir(so.grup);
      if (!acik) {
        mesaj('Kilit kolu kalkıyor, yük plakası açılıyor…', '');
        m.userData.soketAc(true, sn(0.7)).then(function () {
          acik = true; mesgul = false;
          bAc.querySelector('span').textContent = 'Soketi kapat';
          etiketler.push(s.etiket(so.pimler, 'Pimler · dokunma!', { tur: 'hata', yer: 'merkez' }));
          D.vurgula(so.ucgen, { etiket: 'Köşe üçgeni · yön işareti' });
          mesaj('Kapağın altında yüzlerce ince pim var. Üçgen, işlemcinin takılış yönünü gösterir.', 'dogru');
        });
      } else {
        D.vurguKaldir(so.ucgen);
        m.userData.soketAc(false, sn(0.6)).then(function () {
          acik = false; mesgul = false;
          bAc.querySelector('span').textContent = 'Kolu kaldır';
          mesaj('Soket kapandı. Koruma kapağı pimleri korur.', '');
        });
      }
    }
    bAc = s.dugme('Kolu kaldır', 'oynat', ac, { yer: 'alt-orta', aciklama: 'Kilit kolunu kaldırıp soketi aç ya da kapat' });
    s.dugme('Turu tekrarla', 'tekrar', function () { if (!mesgul) t.git(); }, { yer: 'alt-orta', aciklama: 'Kamerayı yeniden bu durağa getir' });
    t.git().then(function () {
      D.vurgula(so.grup, { etiket: 'İşlemci soketi' });
      mesaj('Tahmin et: koruma kapağının altında ne var?', '');
    });
  });

  /* Adım 4: RAM yuvaları — mandallar açılır, RAM takılır, mandallar kilitlenir */
  turSahnesi('#s7-3d', 1, function (t) {
    var s = t.s, m = t.m, mesaj = t.mesaj, yuvalar = m.userData.yuvalar;
    var mesgul = false, ram = null, acik = false;
    yuvalar.forEach(function (y, i) { s.etiket(y, String(i + 1), { tur: 'harf', ofset: [0, 0.2, 6.6] }); });
    var bMandal, bTak;
    function mandallar(ac) {
      acik = ac;
      bMandal.querySelector('span').textContent = ac ? 'Mandalları kapat' : 'Mandalları aç';
      return Promise.all(yuvalar.map(function (y) { return y.userData.mandal(ac, sn(0.35)); }));
    }
    function mandalDugme() {
      if (mesgul || ram) return;
      mesgul = true;
      mandallar(!acik).then(function () {
        mesgul = false;
        mesaj(acik ? 'Mandallar açıldı: yuvalar RAM’e hazır.' : 'Mandallar kapandı.', '');
      });
    }
    function tak() {
      if (mesgul) return;
      mesgul = true;
      if (ram) {                        // çıkar
        var y0 = yuvalar[1];
        D.cikarAnim(ram, { yuva: y0, yukseklik: 5 }).then(function () {
          y0.remove(ram); ram = null; mesgul = false; acik = y0.userData.mandalAcik;
          bTak.querySelector('span').textContent = 'RAM tak';
          return mandallar(false);
        }).then(function () { mesaj('RAM çıkarıldı; mandallar yine kapalı.', ''); });
        return;
      }
      var y = yuvalar[1];
      ram = D.model('M-RAM');
      ram.position.copy(y.userData.oturma).add(new V3(0, 6, 0));
      y.add(ram);
      mesaj('RAM, 2. yuvanın üstüne getiriliyor…', '');
      D.takAnim(ram, { hedef: y.userData.oturma.clone(), dogru: true, yukseklik: 4, yuva: y }).then(function () {
        mesgul = false;
        bTak.querySelector('span').textContent = 'RAM’i çıkar';
        mesaj('Klik! RAM yerine oturdu, mandallar kendiliğinden kilitlendi.', 'dogru');
      });
    }
    bMandal = s.dugme('Mandalları aç', null, mandalDugme, { yer: 'alt-orta', aciklama: 'Dört yuvanın mandallarını aç ya da kapat' });
    bTak = s.dugme('RAM tak', 'oynat', tak, { yer: 'alt-orta', aciklama: 'İkinci yuvaya RAM tak ya da çıkar' });
    t.git().then(function () { mesaj('Dört RAM yuvası. Tahmin et: uçlarındaki mandallar ne işe yarar?', ''); });
  });

  /* Adım 5: PCIe x16, PCIe x1 ve M.2 — M.2 SSD eğik takılır, bastırılır, vidalanır */
  function m2Ssd() {
    var g = new THREE.Group();
    K.parca(g, 'm2-ssd', 'M.2 SSD', 'Sakız büyüklüğünde hızlı depolama birimi.');
    K.koy(g, K.kutu(8.0, 0.08, 2.2, K.mat('#1f5a3a', { roughness: 0.55 }), 0.03, 1), 4.0, 0.04, 0);
    K.koy(g, K.kutu(0.38, 0.09, 1.9, 'altin'), 0.2, 0.04, 0);
    K.koy(g, K.kutu(1.5, 0.12, 1.5, 'cip', 0.04, 1), 2.1, 0.12, 0);
    K.koy(g, K.kutu(1.5, 0.12, 1.5, 'cip', 0.04, 1), 4.0, 0.12, 0);
    K.koy(g, K.kutu(1.0, 0.1, 1.0, 'cip', 0.04, 1), 5.8, 0.11, 0);
    K.koy(g, K.kutu(1.6, 0.02, 1.2, K.mat('#e5e7eb', { roughness: 0.7 }), 0.02, 1), 3.1, 0.19, 0);
    return g;
  }
  turSahnesi('#s8-3d', 2, function (t) {
    var s = t.s, m = t.m, mesaj = t.mesaj;
    var m2 = m.getObjectByName('m2-1'), vidaBas = m2.userData.vida.userData.bas;
    var ssd = null, secili = null, etiket = null, dugmeler = {}, mesgul = false;
    var SEC = {
      x16: { parca: 'pcie-x16-1', etiket: 'PCIe x16 · ekran kartı', yakinlik: 0.34, theta: 0.25, phi: 0.82,
        mesaj: 'En uzun yuva PCIe x16: ekran kartı buraya takılır. Ucundaki mandal kartı tutar.' },
      x1: { parca: 'pcie-x1-1', etiket: 'PCIe x1 · küçük kartlar', yakinlik: 0.3, theta: 0.35, phi: 0.82,
        mesaj: 'Kısa PCIe x1 yuvası: ağ ya da ses kartı gibi küçük kartlar içindir.' },
      m2: { parca: 'm2-1', etiket: 'M.2 yuvası', yakinlik: 0.34, theta: 0.3, phi: 0.78,
        mesaj: 'M.2 SSD önce eğik takılır, sonra bastırılır ve ucundan vidalanır.' }
    };
    function ssdOynat() {
      var o = m2.userData.oturma;
      if (!ssd) { ssd = m2Ssd(); m2.add(ssd); }
      ssd.position.set(o.x + 1.6, o.y + 1.2, o.z);
      ssd.rotation.set(0, 0, 0.34);
      vidaBas.position.y = 2.4; vidaBas.visible = true;
      return D.git(ssd, new V3(o.x, o.y, o.z), sn(0.9))
        .then(function () {
          mesaj('SSD eğik olarak yuvaya girdi. Şimdi aşağı bastırılıyor…', '');
          return D.tween({ sahne: s, sure: sn(0.7), guncelle: function (e) { ssd.rotation.z = 0.34 * (1 - e); } });
        })
        .then(function () {
          mesaj('Vida, SSD’nin ucunu ayağa sabitliyor…', '');
          var r0 = vidaBas.rotation.y;
          return D.tween({ sahne: s, sure: sn(1.1), guncelle: function (e) { vidaBas.position.y = 2.4 - (2.4 - 0.43) * e; vidaBas.rotation.y = r0 + e * Math.PI * 6; } });
        })
        .then(function () { D.ses('klik'); mesaj('M.2 SSD takıldı: eğik gir, bastır, vidala.', 'dogru'); });
    }
    function sec(k) {
      if (mesgul) return;
      var o = SEC[k], p = m.getObjectByName(o.parca);
      Object.keys(dugmeler).forEach(function (x) { dugmeler[x].classList.toggle('don3d-dugme--secili', x === k); });
      if (etiket) { etiket.kaldir(); etiket = null; }
      if (secili) D.vurguKaldir(secili);
      secili = p;
      var c = merkez([p]);
      mesgul = true;
      s.kameraGit({ hedef: [c.x, c.y, c.z], yakinlik: o.yakinlik, theta: o.theta, phi: o.phi }, sn(1)).then(function () {
        D.vurgula(p, { etiket: false });
        etiket = s.etiket(p, o.etiket, { tur: 'vurgu' });
        mesaj(o.mesaj, '');
        if (k === 'm2') return ssdOynat();
      }).then(function () { mesgul = false; });
    }
    [['x16', 'PCIe x16'], ['x1', 'PCIe x1'], ['m2', 'M.2']].forEach(function (x) {
      dugmeler[x[0]] = s.dugme(x[1], null, function () { sec(x[0]); }, { yer: 'alt-orta', aciklama: x[1] + ' yuvasını göster' });
    });
    t.git().then(function () { sec('x16'); });
  });

  /* Adım 6: arka panel — portlara dokun (E-BILGI) */
  turSahnesi('#s9-3d', 3, function (t) {
    var s = t.s, m = t.m, mesaj = t.mesaj;
    var portlar = m.userData.portlar;
    D.bilgi(s, portlar.map(function (p) { return p.name; }));
    function port(ad) { return m.getObjectByName('port-' + ad); }
    s.dugme('Turu tekrarla', 'tekrar', function () { t.git(); }, { yer: 'alt-orta', aciklama: 'Kamerayı yeniden bu durağa getir' });
    t.git().then(function () {
      mesaj('Bir porta dokun: adını ve görevini gör.', '');
      if (!AZ) D.siraylaVurgula([port('usba-1'), port('hdmi'), port('rj45'), port('ses-yesil')], { bekle: 0.9 });
    });
  });

  /* ─────────── Etkinlik 1: E-AV — sorulan parçayı 3D anakartta bul ─────────── */
  var SORULAR = [
    { ad: 'İşlemci soketi', dogru: ['soket'], ipucu: 'En büyük kare yuva; yanında metal bir kol var.', bilgi: 'İşlemci buraya oturur.' },
    { ad: 'RAM yuvası', dogru: ['ram-yuvalari'], ipucu: 'Soketin yanında yan yana dizilmiş dört uzun yuva.', bilgi: 'RAM modülleri buraya dik takılır.' },
    { ad: 'PCIe x16 yuvası', dogru: ['pcie-x16-1', 'pcie-x16-2'], ipucu: 'Yatay duran en uzun yuva; ucunda mandalı var.', bilgi: 'Ekran kartı buraya takılır.' },
    { ad: 'M.2 yuvası', dogru: ['m2-1', 'm2-2'], ipucu: 'Küçük bir konnektör; birkaç santim ötesinde vida ayağı var.', bilgi: 'M.2 SSD buraya yatık takılır.' },
    { ad: 'Çipset soğutucusu', dogru: ['cipset'], ipucu: 'Yassı, kare bir metal blok; üstü çizgili.', bilgi: 'Altındaki çipset, diskleri ve USB’leri işlemciye bağlar.' },
    { ad: '24-pin güç girişi', dogru: ['atx24'], ipucu: 'Kenarda, iki sıra delikli uzun siyah blok.', bilgi: 'Güç kaynağının en büyük kablosu buraya takılır.' },
    { ad: 'SATA portları', dogru: ['sata'], ipucu: 'Kenara bakan, L biçimli küçük ağızlar.', bilgi: 'Disklerin veri kablosu buraya takılır.' },
    { ad: 'Arka panel portları', dogru: ['arka-panel'], ipucu: 'USB, HDMI ve ses girişlerinin sıralandığı kenar.', bilgi: 'Kasanın arkasından dışarı bakar.' }
  ];
  D.tembel('#s10-3d', function (kap) {
    var a = kartSahnesi(kap, { kamera: { yon: [0.3, 1.35, 1], pay: 0.92, hedefOfset: [0, 0, -1.5] } });
    var s = a.s, m = a.m, n = SORULAR.length;
    kap.classList.add('av-sahne');
    s._secimFiltresi = m.userData.parcalar.slice();    // yalnız ana parçalar seçilir (MOTOR ÖNERİSİ: D.av)
    var kart = D.div('av-soru', s.arayuz);
    kart.setAttribute('aria-live', 'polite');
    kart.innerHTML = '<span class="av-no"></span><span class="av-metin"><small>Bul ve dokun</small><b></b></span><span class="av-sure" title="Geçen süre">0:00</span>';
    var noEl = kart.querySelector('.av-no'), adEl = kart.querySelector('.av-metin b'), sureEl = kart.querySelector('.av-sure'), altEl = kart.querySelector('.av-metin small');
    var mesaj = DERS.sahneMesaj(s), ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var liste = document.getElementById('av-liste'), maddeler = [];
    if (liste) {
      liste.innerHTML = '';
      SORULAR.forEach(function (q) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="g-isaret"></span><span></span>';
        li.lastChild.textContent = q.ad;
        liste.appendChild(li);
        maddeler.push(li);
      });
    }
    var i = 0, yanlis = 0, toplamYanlis = 0, sure = 0, bitti = false, mesgul = false, yardim = null, bYeniden = null;
    function sureYaz(t) { var d = Math.floor(t / 60), sn2 = Math.floor(t % 60); return d + ':' + (sn2 < 10 ? '0' : '') + sn2; }
    s.herKare(function (dt) { if (!bitti) { sure += dt; sureEl.textContent = sureYaz(sure); } });
    function goster() {
      var q = SORULAR[i];
      noEl.textContent = (i + 1) + '/' + n;
      adEl.textContent = q.ad;
      altEl.textContent = 'Bul ve dokun';
      maddeler.forEach(function (li, k) { li.classList.toggle('simdi', k === i); });
      yanlis = 0;
    }
    function ileri() {
      i++;
      if (i < n) { goster(); mesaj('Sıradaki parçayı bul.', ''); return; }
      bitti = true;
      kart.classList.add('av-soru--bitti');
      noEl.textContent = '✓';
      adEl.textContent = 'Hepsini buldun!';
      altEl.textContent = 'Süre ' + sureYaz(sure);
      mesaj('✔ Harika! ' + n + ' parçanın hepsini buldun. Süre: ' + sureYaz(sure) + ' · Yanlış dokunuş: ' + toplamYanlis, 'dogru');
      DERS.konfeti();
      if (bYeniden) bYeniden.hidden = false;
    }
    s.tiklaninca(function (p) {
      if (bitti || mesgul) return;
      var q = SORULAR[i];
      if (!p) { mesaj('Bir parçaya dokun. Anakartı sürükleyerek döndürebilirsin.', ''); return; }
      if (q.dogru.indexOf(p.name) >= 0) {
        mesgul = true;
        D.ses('klik');
        if (yardim) { D.vurguKaldir(yardim); yardim = null; }
        D.vurgula(p, { renk: '#10b981', etiket: '✓ ' + q.ad });
        if (maddeler[i]) maddeler[i].classList.add('tamam');
        ilerle(i + 1, n);
        mesaj('✔ Doğru! ' + q.bilgi, 'dogru');
        D.bekle(sn(1.3), s).then(function () { D.vurguKaldir(p); mesgul = false; ileri(); });
        return;
      }
      yanlis++; toplamYanlis++;
      D.ses('hata');
      if (p !== yardim) {
        D.vurgula(p, { renk: '#ef4444', etiket: '✗ ' + p.userData.etiket });
        D.bekle(sn(1.1), s).then(function () { if (p !== yardim) D.vurguKaldir(p); });
      }
      if (yanlis >= 3) {
        if (!yardim) {
          yardim = m.getObjectByName(q.dogru[0]);
          D.vurgula(yardim, { etiket: 'Burada → dokun' });
        }
        mesaj('İşte burada! Parlayan parçaya dokun.', 'yanlis');
      } else if (yanlis === 2) {
        altEl.textContent = 'İpucu: ' + q.ipucu;
        mesaj('✗ Bu: ' + p.userData.etiket + '. İpucu: ' + q.ipucu, 'yanlis');
      } else {
        mesaj('✗ Bu: ' + p.userData.etiket + '. Bir daha dene.', 'yanlis');
      }
    });
    function yeniden() {
      if (mesgul) return;
      if (yardim) { D.vurguKaldir(yardim); yardim = null; }
      i = 0; toplamYanlis = 0; sure = 0; bitti = false;
      kart.classList.remove('av-soru--bitti');
      maddeler.forEach(function (li) { li.classList.remove('tamam', 'simdi'); });
      ilerle(0, n);
      if (bYeniden) bYeniden.hidden = true;
      s.sifirla();
      goster();
      mesaj('Parça avı başladı!', '');
    }
    s.dugme('İpucu', null, function () {
      if (bitti) return;
      altEl.textContent = 'İpucu: ' + SORULAR[i].ipucu;
      mesaj('İpucu: ' + SORULAR[i].ipucu, '');
    }, { yer: 'alt-orta', aciklama: 'Aranan parça için ipucu göster' });
    bYeniden = s.dugme('Yeniden oyna', 'tekrar', yeniden, { yer: 'alt-orta', aciklama: 'Parça avını baştan başlat' });
    bYeniden.hidden = true;
    goster();
    mesaj('Anakartı döndür, yakınlaştır; sorulan parçaya dokun.', '');
  });

  /* ─────────── Etkinlik 2: gerçek anakartta bul (dedektif kartları + kimlik kartı) ─────────── */
  (function () {
    var kok = document.getElementById('gercek-anakart');
    if (!kok) return;
    var KART = [
      { id: 'soket', ad: 'İşlemci soketi', ipucu: 'En büyük kare yuva, metal kollu.', svg: '<!--@dahil:ga-soket.svg-->', say: false },
      { id: 'ram', ad: 'RAM yuvaları', ipucu: 'Soketin yanında, uzun ve mandallı.', svg: '<!--@dahil:ga-ram.svg-->', say: true, birim: 'RAM yuvası' },
      { id: 'pcie', ad: 'PCIe yuvaları', ipucu: 'Yatay yuvalar; biri en uzun.', svg: '<!--@dahil:ga-pcie.svg-->', say: true, birim: 'PCIe yuvası' },
      { id: 'm2', ad: 'M.2 yuvaları', ipucu: 'Küçük ağız ve vida ayağı.', svg: '<!--@dahil:ga-m2.svg-->', say: true, birim: 'M.2 yuvası' },
      { id: 'sata', ad: 'SATA portları', ipucu: 'Kenarda, L biçimli ağızlar.', svg: '<!--@dahil:ga-sata.svg-->', say: true, birim: 'SATA portu' },
      { id: 'usb', ad: 'Arka USB’ler', ipucu: 'Arka kenarda, dikdörtgen portlar.', svg: '<!--@dahil:ga-usb.svg-->', say: true, birim: 'arka USB portu' }
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    kok.innerHTML = '<div class="ga"><div class="ga-izgara" role="group" aria-label="Gerçek anakartta aranacak parçalar"></div>' +
      '<div class="ga-kimlik" hidden></div><div class="ga-son"><span class="ga-durum" aria-live="polite"></span>' +
      '<button type="button" class="ga-olustur" disabled>Kimlik kartını oluştur</button></div></div>';
    var izgara = kok.querySelector('.ga-izgara'), kimlik = kok.querySelector('.ga-kimlik'), durum = kok.querySelector('.ga-durum'), olustur = kok.querySelector('.ga-olustur');
    var durumlar = {};
    function guncelle() {
      var n = KART.filter(function (k) { return durumlar[k.id].bulundu; }).length;
      ilerle(n, KART.length);
      olustur.disabled = n < KART.length;
      durum.textContent = n < KART.length ? (n + ' / ' + KART.length + ' parça bulundu') : 'Hepsi bulundu! Sayıları kontrol et.';
    }
    KART.forEach(function (k) {
      var d = durumlar[k.id] = { bulundu: false, sayi: 0 };
      var el = document.createElement('div');
      el.className = 'ga-kart';
      el.innerHTML = '<div class="ga-ust"><span class="ga-resim">' + k.svg + '</span><span class="ga-yazi"><b></b><small></small></span></div>' +
        '<div class="ga-alt"><button type="button" class="ga-bul" aria-pressed="false"></button>' +
        (k.say ? '<span class="ga-say" hidden><button type="button" class="ga-eksi" aria-label="' + k.birim + ' sayısını azalt">−</button>' +
          '<output aria-label="' + k.birim + ' sayısı">0</output><button type="button" class="ga-arti" aria-label="' + k.birim + ' sayısını artır">+</button></span>' : '') + '</div>';
      el.querySelector('.ga-yazi b').textContent = k.ad;
      el.querySelector('.ga-yazi small').textContent = k.ipucu;
      var bul = el.querySelector('.ga-bul'), say = el.querySelector('.ga-say'), cikti = el.querySelector('output');
      function yaz() {
        bul.textContent = d.bulundu ? '✓ Buldum' : 'Buldum';
        bul.setAttribute('aria-pressed', d.bulundu ? 'true' : 'false');
        el.classList.toggle('tamam', d.bulundu);
        if (say) { say.hidden = !d.bulundu; cikti.textContent = d.sayi; }
      }
      bul.addEventListener('click', function () { d.bulundu = !d.bulundu; if (d.bulundu) D.ses('klik'); yaz(); guncelle(); });
      if (say) {
        el.querySelector('.ga-eksi').addEventListener('click', function () { d.sayi = Math.max(0, d.sayi - 1); yaz(); });
        el.querySelector('.ga-arti').addEventListener('click', function () { d.sayi = Math.min(12, d.sayi + 1); yaz(); });
      }
      yaz();
      izgara.appendChild(el);
    });
    olustur.addEventListener('click', function () {
      var satirlar = KART.map(function (k) {
        var d = durumlar[k.id];
        return '<li><span></span><b>' + (k.say ? d.sayi : '✓') + '</b></li>';
      }).join('');
      kimlik.innerHTML = '<div class="ga-kimlik-bas">Anakart Kimlik Kartı</div><ul>' + satirlar + '</ul>' +
        '<button type="button" class="ga-duzenle">Kartları düzenle</button>';
      kimlik.querySelectorAll('li span').forEach(function (sp, i) {
        var k = KART[i];
        sp.textContent = k.say ? k.birim.charAt(0).toUpperCase() + k.birim.slice(1) : 'İşlemci soketi bulundu';
      });
      kimlik.querySelector('.ga-duzenle').addEventListener('click', function () { kimlik.hidden = true; izgara.hidden = false; olustur.hidden = false; });
      izgara.hidden = true; kimlik.hidden = false; olustur.hidden = true;
      durum.textContent = 'Kimlik kartın hazır!';
      DERS.konfeti();
    });
    guncelle();
  })();

  /* ─────────── Derinleş: çipsetin görevi (2D şema, akış) ─────────── */
  (function () {
    var kok = document.getElementById('cipset');
    if (!kok) return;
    kok.innerHTML = '<div class="secici" role="group" aria-label="Yol türü"></div><div class="illu-orta cs-sahne"><!--@dahil:cipset.svg--></div>' +
      '<div class="panel-sonuc cs-sonuc" aria-live="polite"></div>';
    var svg = kok.querySelector('svg'), sonuc = kok.querySelector('.cs-sonuc'), secici = kok.querySelector('.secici'), dugmeler = {};
    var MOD = {
      hepsi: 'İki tür yol var: doğrudan yollar ve çipset üzerinden giden yollar.',
      dogrudan: 'Çoğu anakartta RAM, ekran kartı ve bir M.2 SSD işlemciye doğrudan bağlanır.',
      cipset: 'SATA diskler, bazı USB’ler, ağ ve ses önce çipsete gelir; çipset hepsini tek yoldan işlemciye iletir.'
    };
    function sec(k) {
      Object.keys(dugmeler).forEach(function (x) { dugmeler[x].setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
      svg.setAttribute('data-mod', k);
      sonuc.textContent = MOD[k];
    }
    [['hepsi', 'Hepsi'], ['dogrudan', 'Doğrudan yollar'], ['cipset', 'Çipset yolları']].forEach(function (x) {
      dugmeler[x[0]] = DERS.dugme(secici, x[1], function () { sec(x[0]); });
    });
    sec('hepsi');
  })();
})();
