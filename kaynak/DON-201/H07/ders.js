/* DON-201 H07 — RAM · ders betiği (ortak betikten sonra çalışır)
   Derse özel kalıplar: E-SURGU (surguKur), A-MASA / A-GUC-KES / A-YAVASLA (M-MASA-DOLAP API'si ve 2D paneller). */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 3’te elektriği keseceğiz ve birlikte göreceğiz.');
  var TUR = D.MASA_KART_TURLERI;
  function sayi(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }
  function sonra(zaman, sn, fn) { zaman.push(setTimeout(fn, AZ ? 10 : sn * 1000)); }

  /* ─────────── E-SURGU: kademeli parametre sürgüsü (4 / 8 / 16 GB) ───────────
     surguKur(el, { degerler, deger, birim, etiket, onDegis(v) }) → { deger(), ayarla(v), kilitle(bool) } */
  function surguKur(el, o) {
    var d = o.degerler, i0 = Math.max(0, d.indexOf(o.deger));
    var birim = o.birim || 'GB';
    el.classList.add('surgu');
    el.innerHTML = '<div class="surgu-ust"><span class="surgu-ad"></span><b class="surgu-deger"></b></div>' +
      '<input type="range" class="surgu-giris" min="0" step="1">' +
      '<div class="surgu-cizgi" aria-hidden="true"></div>';
    el.querySelector('.surgu-ad').textContent = o.etiket || 'RAM kapasitesi';
    var giris = el.querySelector('input'), deger = el.querySelector('.surgu-deger'), cizgi = el.querySelector('.surgu-cizgi');
    giris.max = d.length - 1; giris.value = i0;
    giris.setAttribute('aria-label', o.etiket || 'RAM kapasitesi');
    d.forEach(function (v, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = v + ' ' + birim; b.tabIndex = -1;
      b.addEventListener('click', function () { if (!giris.disabled) { giris.value = i; degisti(); } });
      cizgi.appendChild(b);
    });
    var son = null;
    function yaz() {
      var v = d[+giris.value];
      deger.textContent = v + ' ' + birim;
      giris.setAttribute('aria-valuetext', v + ' ' + birim);
      el.style.setProperty('--surgu-oran', (+giris.value / (d.length - 1) * 100) + '%');
      Array.prototype.forEach.call(cizgi.children, function (b, i) { b.classList.toggle('secili', i === +giris.value); });
      return v;
    }
    function degisti() { var v = yaz(); if (v !== son) { son = v; if (o.onDegis) o.onDegis(v); } }
    giris.addEventListener('input', degisti);
    ['touchstart', 'touchend', 'touchmove'].forEach(function (ad) { el.addEventListener(ad, function (e) { e.stopPropagation(); }, { passive: true }); });
    giris.addEventListener('keydown', function (e) { e.stopPropagation(); });
    son = yaz();
    return {
      deger: function () { return d[+giris.value]; },
      ayarla: function (v) { var i = d.indexOf(v); if (i >= 0) { giris.value = i; degisti(); } },
      kilitle: function (k) { giris.disabled = !!k; el.classList.toggle('surgu--kilitli', !!k); }
    };
  }

  /* ─────────── Ortak: masa + dolap sahnesi ─────────── */
  function masaSahnesi(kap, ops) {
    ops = ops || {};
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, arkaPlan: ops.arkaPlan,
      kamera: ops.kamera || { yon: [0.45, 0.62, 1], pay: 0.9, hedefOfset: [2, -10, 0] } });
    var m = s.ekle('M-MASA-DOLAP', { modelOps: { masaBoyu: ops.boy || 'orta' } });
    s.yerlestir();
    if (ops.dondur !== false) D.dondur(s, { ipucu: false, sinir: { minPolar: 0.55, maxPolar: 1.3, minYakin: 0.6, maxYakin: 1.3, yatay: 0.9 } });
    return { s: s, m: m, u: m.userData };
  }
  function isaret(ebeveyn, x, y, z) {
    var o = new THREE.Object3D();
    ebeveyn.add(o); o.position.set(x, y, z);
    return o;
  }
  function masaEtiketleri(a, masaMetin, dolapMetin) {
    var O = a.u.olcu;
    var mi = isaret(a.m.getObjectByName('masa'), -O.W * 0.18, 75, O.D / 2);
    var di = isaret(a.m.getObjectByName('dolap'), 0, 104, 0);
    return [a.s.etiket(mi, masaMetin, { tur: 'odak', yer: 'merkez' }), a.s.etiket(di, dolapMetin, { tur: 'dogru', yer: 'merkez' })];
  }
  function adi(tur) { return (TUR[tur] || { ad: tur }).ad; }

  /* ─────────── Kapak: yuvanın üstünde süzülen RAM ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 36,
      kamera: { yon: [0.38, 0.5, 1], pay: 0.92, hedefOfset: [0, 0.4, 0] } });
    var yuva = s.ekle('M-RAM-YUVASI', { modelOps: { acik: true } });
    var ram = s.ekle('M-RAM');
    ram.position.copy(yuva.userData.oturma).add(new V3(0, 2.6, 0));
    s.yerlestir();
    var y0 = ram.position.y, z = 0;
    s.herKare(function (dt) { if (!AZ) { z += dt; ram.position.y = y0 + Math.sin(z * 1.2) * 0.25; } });
  });

  /* ─────────── Adım 1: depolama → RAM → işlemci (2D) ─────────── */
  (function () {
    var kok = document.getElementById('bellek-akis');
    if (!kok) return;
    kok.innerHTML = '<div class="secici" role="group" aria-label="Uygulama seç"></div><div class="illu-orta ba-sahne"><!--@dahil:bellek-akis.svg--></div>' +
      '<div class="panel-sonuc" aria-live="polite"></div>';
    var svg = kok.querySelector('svg'), sonuc = kok.querySelector('.panel-sonuc'), baslik = svg.querySelector('.ba-baslik');
    var secici = kok.querySelector('.secici'), dugmeler = {}, zaman = [];
    var UYG = [['oyun', 'Oyun'], ['muzik', 'Müzik'], ['odev', 'Ödev']];
    function oyna(k, ad) {
      zaman.forEach(clearTimeout); zaman = [];
      Object.keys(dugmeler).forEach(function (x) { dugmeler[x].setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
      svg.style.setProperty('--ba-renk', TUR[k].renk);
      svg.classList.remove('yukle', 'isle'); void svg.getBoundingClientRect(); svg.classList.add('yukle');
      baslik.textContent = ad + ' açılıyor';
      sonuc.textContent = ad + ' depolamadan RAM’e yükleniyor…';
      sonra(zaman, 1.6, function () {
        svg.classList.add('isle');
        baslik.textContent = ad + ' çalışıyor';
        sonuc.textContent = 'İşlemci, ' + ad.toLocaleLowerCase('tr') + ' bilgisini RAM’den çok hızlı alıp veriyor.';
      });
    }
    UYG.forEach(function (x) { dugmeler[x[0]] = DERS.dugme(secici, x[1], function () { oyna(x[0], x[1]); }); dugmeler[x[0]].setAttribute('aria-pressed', 'false'); });
    sonuc.textContent = 'Bir uygulama seç.';
    DERS.slaytAcilinca('s4', function () { sonra(zaman, 0.6, function () { oyna('oyun', 'Oyun'); }); });
  })();

  /* ─────────── Adım 2: A-MASA — açılan uygulama dolaptan masaya ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var a = masaSahnesi(kap);
    masaEtiketleri(a, 'Masa = RAM', 'Dolap = Depolama');
    var mesaj = DERS.sahneMesaj(a.s), mesgul = false, acik = 0, dugmeler = {};
    var UYG = ['tarayici', 'oyun', 'muzik', 'odev'];
    function ac(t) {
      if (mesgul || dugmeler[t].disabled) return;
      mesgul = true; dugmeler[t].disabled = true;
      mesaj(adi(t) + ' açılıyor: dosyası dolaptan çıkıyor…', '');
      a.u.dolaptanMasaya(t).then(function () {
        mesgul = false; acik++;
        mesaj(acik === UYG.length ? 'Dört uygulama açık; hepsinin dosyası masada. İşlemci bunlarla çalışır.' :
          adi(t) + ' açıldı: dosyası artık masada, yani RAM’de.', 'dogru');
      });
    }
    UYG.forEach(function (t) {
      dugmeler[t] = a.s.dugme(adi(t), null, function () { ac(t); }, { yer: 'alt-orta', aciklama: adi(t) + ' uygulamasını aç' });
    });
    a.s.dugme('Baştan', 'sifirla', function () {
      if (mesgul) return;
      a.u.temizle(); acik = 0;
      UYG.forEach(function (t) { dugmeler[t].disabled = false; });
      mesaj('Bir uygulama aç.', '');
    }, { yer: 'ust-sag', aciklama: 'Masayı boşalt, baştan başla' });
    mesaj('Bir uygulama aç.', '');
    D.bekle(0.8, a.s).then(function () { ac('odev'); });
  });

  /* ─────────── Adım 3: A-GUC-KES — elektrik kesilir, masa boşalır ─────────── */
  function isikAyar(s) {
    var b = { h: s.hemi.intensity, a: s.anaIsik.intensity, d: s.dolgu.intensity };
    return function (k, sure) {
      var h0 = s.hemi.intensity, a0 = s.anaIsik.intensity, d0 = s.dolgu.intensity;
      return D.tween({ sahne: s, sure: sure, guncelle: function (e) {
        s.hemi.intensity = h0 + (b.h * k - h0) * e; s.anaIsik.intensity = a0 + (b.a * k - a0) * e; s.dolgu.intensity = d0 + (b.d * k - d0) * e;
      } });
    };
  }
  D.tembel('#s6-3d', function (kap) {
    var a = masaSahnesi(kap);
    masaEtiketleri(a, 'RAM · geçici', 'Depolama · kalıcı');
    var karart = D.div('gk-karart', null);
    a.s.arayuz.insertBefore(karart, a.s.arayuz.firstChild);
    var mesaj = DERS.sahneMesaj(a.s), isik = isikAyar(a.s);
    var mesgul = false, kaydedildi = false, ilk = true, dKaydet, dKes, kayitEtiket = null;
    function kur() {
      if (kayitEtiket) { kayitEtiket.kaldir(); kayitEtiket = null; }
      a.u.temizle();
      ['odev', 'muzik', 'tarayici'].forEach(function (t, i) { a.u.masayaKoy(t, i); });
      kaydedildi = false; dKaydet.disabled = false; dKes.disabled = false;
      mesaj('Ödev, müzik ve tarayıcı açık. Ödev henüz kaydedilmedi.', '');
    }
    function kaydet() {
      if (mesgul || kaydedildi) return;
      mesgul = true; dKaydet.disabled = true; dKes.disabled = true;
      mesaj('Kaydediliyor: ödevin bir kopyası dolaba gidiyor…', '');
      a.u.masadanDolaba(a.u.kopyala(a.u.masadakiler[0]), { cekmece: 1 }).then(function () {
        kaydedildi = true; mesgul = false; dKes.disabled = false;
        mesaj('✔ Ödev kaydedildi: kopyası artık dolapta, yani depolamada.', 'dogru');
      });
    }
    function kes() {
      if (mesgul) return;
      mesgul = true; dKaydet.disabled = true; dKes.disabled = true;
      karart.classList.add('acik');
      mesaj('⚡ Elektrik kesildi!', 'yanlis');
      Promise.all([isik(0.2, 0.4), a.u.gucKes(1.3)])
        .then(function () { return D.bekle(0.9, a.s); })
        .then(function () {
          karart.classList.remove('acik');
          mesaj('Elektrik geldi. Masaya ve dolaba bakalım…', '');
          return Promise.all([isik(1, 0.6), a.u.gucVer()]);
        })
        .then(function () { return a.u.cekmece(1, true, 0.7); })
        .then(function () {
          var kayitli = a.u.cekmeceIcerik[1][0];
          if (kayitli && !kayitEtiket) kayitEtiket = a.s.etiket(kayitli, 'Kaydedilen ödev', { tur: 'dogru' });
          var m = kaydedildi ? 'Masa boşaldı ama kaydettiğin ödev dolapta duruyor.' : 'Masa boşaldı. Ödev kaydedilmediği için kayboldu.';
          if (ilk) {
            m = DERS.tahminNotu(1, m, 'Kaydedilmeyen her şey RAM’deydi ve silindi. Dolap boş kaldı.');
            ilk = false;
          }
          mesaj((kaydedildi ? '✔ ' : '✗ ') + m, kaydedildi ? 'dogru' : 'yanlis');
          mesgul = false;
        });
    }
    dKaydet = a.s.dugme('Ödevi kaydet', null, kaydet, { yer: 'alt-orta', aciklama: 'Ödevi dolaba kaydet' });
    dKes = a.s.dugme('Elektriği kes', null, kes, { yer: 'alt-orta', aciklama: 'Elektriği kes ve sonucu izle' });
    a.s.dugme('Baştan', 'sifirla', function () { if (!mesgul) kur(); }, { yer: 'ust-sag', aciklama: 'Başa al' });
    kur();
  });

  /* ─────────── Adım 4: kapasite (E-SURGU + GB ızgarası, 2D) ─────────── */
  (function () {
    var kok = document.getElementById('kapasite');
    if (!kok) return;
    var UYG = [
      { id: 'sistem', ad: 'İşletim sistemi', gb: 2.5, sabit: true },
      { id: 'tarayici', ad: 'Tarayıcı (10 sekme)', gb: 2 },
      { id: 'oyun', ad: 'Oyun', gb: 4 },
      { id: 'goruntulu', ad: 'Görüntülü ders', gb: 1 },
      { id: 'muzik', ad: 'Müzik', gb: 0.5 },
      { id: 'odev', ad: 'Ödev', gb: 0.5 }
    ];
    var acik = { sistem: true, tarayici: true, muzik: true };
    kok.innerHTML = '<div class="surgu" id="surgu-kapasite"></div><div class="kp-govde"><div class="kp-ram"><div class="kp-not"><i></i>Her kare 0,5 GB · her satır 4 GB</div><div class="kp-izgara" aria-hidden="true"></div>' +
      '<div class="kp-tasan" aria-hidden="true"><span>Sığmayan</span><div class="kp-tasan-hucre"></div></div></div>' +
      '<div class="kp-liste" role="group" aria-label="Uygulamalar"></div></div><div class="panel-sonuc kp-sonuc" aria-live="polite"></div>';
    var izgara = kok.querySelector('.kp-izgara'), tasan = kok.querySelector('.kp-tasan'), tasanHucre = kok.querySelector('.kp-tasan-hucre');
    var liste = kok.querySelector('.kp-liste'), sonuc = kok.querySelector('.kp-sonuc');
    var hucreler = [];
    for (var r = 0; r < 4; r++) {
      var sat = D.div('kp-satir', izgara);
      var e = D.div('kp-satir-ad', sat); e.textContent = (r * 4 + 4) + ' GB';
      for (var c = 0; c < 8; c++) hucreler.push(D.div('kp-hucre', sat));
    }
    var dugmeler = {};
    UYG.forEach(function (u) {
      var b = DERS.dugme(liste, '', function () { if (u.sabit) return; acik[u.id] = !acik[u.id]; ciz(); }, 'kp-uyg');
      b.innerHTML = '<span class="kp-renk"></span><span class="kp-ad"></span><span class="kp-gb"></span>';
      b.querySelector('.kp-renk').style.background = TUR[u.id].renk;
      b.querySelector('.kp-ad').textContent = u.ad;
      b.querySelector('.kp-gb').textContent = sayi(u.gb) + ' GB';
      if (u.sabit) { b.classList.add('kp-uyg--sabit'); b.setAttribute('aria-disabled', 'true'); }
      dugmeler[u.id] = b;
    });
    var surgu = surguKur(document.getElementById('surgu-kapasite'), { degerler: [4, 8, 16], deger: 8, etiket: 'RAM kapasitesi', onDegis: function () { ciz(); } });
    function ciz() {
      var kap = surgu.deger(), n = kap * 2, dolu = 0, parcalar = [];
      UYG.forEach(function (u) {
        dugmeler[u.id].setAttribute('aria-pressed', acik[u.id] ? 'true' : 'false');
        if (!acik[u.id]) return;
        for (var i = 0; i < u.gb * 2; i++) parcalar.push(u);
        dolu += u.gb;
      });
      hucreler.forEach(function (h, i) {
        h.className = 'kp-hucre' + (i >= n ? ' kp-hucre--yok' : '');
        h.style.background = '';
        if (i < n && parcalar[i]) { h.classList.add('kp-hucre--dolu'); h.style.background = TUR[parcalar[i].id].renk; }
      });
      Array.prototype.forEach.call(izgara.children, function (s, i) { s.classList.toggle('kp-satir--yok', i * 8 >= n); });
      var fazla = parcalar.slice(n);
      tasanHucre.innerHTML = '';
      fazla.forEach(function (u) { var h = D.div('kp-hucre kp-hucre--dolu', tasanHucre); h.style.background = TUR[u.id].renk; });
      tasan.classList.toggle('gor', fazla.length > 0);
      if (fazla.length) {
        sonuc.className = 'panel-sonuc kp-sonuc kotu';
        sonuc.textContent = sayi(dolu) + ' GB gerekiyor ama RAM ' + kap + ' GB: ' + sayi(fazla.length / 2) + ' GB sığmadı. Bu dosyalar dolaba gidip gelecek.';
      } else {
        sonuc.className = 'panel-sonuc kp-sonuc iyi';
        sonuc.textContent = 'Hepsi sığdı: ' + sayi(dolu) + ' GB dolu, ' + sayi(kap - dolu) + ' GB boş.';
      }
    }
    ciz();
    DERS.slaytAcilinca('s7', function () {
      var z = [];
      sonra(z, 1.2, function () { if (!acik.oyun) { acik.oyun = true; ciz(); } });
    });
  })();

  /* ─────────── Adım 5: A-YAVASLA — küçük ve büyük masa yarışı (2D) ─────────── */
  (function () {
    var kok = document.getElementById('yavasla');
    if (!kok) return;
    var ISTEK = ['tarayici', 'oyun', 'muzik', 'odev', 'foto', 'tarayici'];
    var SERIT = [{ kap: 2, ad: '4 GB', alt: 'küçük masa' }, { kap: 6, ad: '16 GB', alt: 'büyük masa' }];
    var ADIM = 0.6;
    kok.innerHTML = '<div class="yv"></div><div class="kv-alt"><button type="button" class="kv-oynat"></button><div class="panel-sonuc" aria-live="polite"></div></div>';
    var yv = kok.querySelector('.yv'), oynatB = kok.querySelector('.kv-oynat'), sonuc = kok.querySelector('.panel-sonuc');
    oynatB.innerHTML = D.simge('oynat') + '<span>Oynat</span>';
    var seritler = SERIT.map(function (S) {
      var el = D.div('yv-serit', yv);
      el.innerHTML = '<div class="yv-bas"><b></b><span></span></div><div class="yv-alan"><div class="yv-dolap"><!--@dahil:mini-dolap.svg--><span>Dolap</span></div>' +
        '<div class="yv-masa"></div></div><div class="yv-bekle"><span class="yv-bekle-ad">Bekleme</span><span class="yv-bar"><i></i></span><span class="yv-sayi">0</span><span class="yv-sure">0,0 sn</span></div>';
      el.querySelector('.yv-bas b').textContent = S.ad;
      el.querySelector('.yv-bas span').textContent = S.alt + ' · ' + S.kap + ' dosyalık';
      var dolapImg = el.querySelector('.yv-dolap svg');
      if (dolapImg) dolapImg.setAttribute('aria-hidden', 'true');
      var masa = el.querySelector('.yv-masa');
      masa.style.setProperty('--yv-sutun', S.kap > 2 ? 3 : 2);
      var yuvalar = [];
      for (var i = 0; i < S.kap; i++) yuvalar.push(D.div('yv-yuva', masa));
      return { S: S, el: el, alan: el.querySelector('.yv-alan'), dolap: el.querySelector('.yv-dolap'), yuvalar: yuvalar,
        bar: el.querySelector('.yv-bar i'), sayi: el.querySelector('.yv-sayi'), sure: el.querySelector('.yv-sure'), kartlar: [] };
    });
    var calisiyor = 0, nesil = 0;
    function konum(serit, hedef) {
      var a = serit.alan.getBoundingClientRect(), r = hedef.getBoundingClientRect();
      return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2, w: r.width, h: r.height };
    }
    function kartEl(serit, tur) {
      var k = D.div('yv-kart', serit.alan);
      k.style.setProperty('--kart-renk', TUR[tur].renk);
      k.innerHTML = '<span></span>';
      k.firstChild.textContent = adi(tur);
      var y = konum(serit, serit.yuvalar[0]);
      k.style.width = y.w + 'px'; k.style.height = y.h + 'px';
      return k;
    }
    function tasi(serit, k, hedef, gorun, sure) {
      var p = konum(serit, hedef);
      k.style.transitionDuration = (AZ ? 0 : sure) + 's';
      k.style.transform = 'translate(' + (p.x - p.w / 2) + 'px,' + (p.y - p.h / 2) + 'px) scale(' + (gorun ? 1 : 0.45) + ')';
      k.style.opacity = gorun ? '1' : '0';
      return new Promise(function (coz) { setTimeout(coz, AZ ? 10 : sure * 1000 + 40); });
    }
    function koy(serit, k, hedef) {
      var p = konum(serit, hedef);
      k.style.transitionDuration = '0s';
      k.style.transform = 'translate(' + (p.x - p.w / 2) + 'px,' + (p.y - p.h / 2) + 'px) scale(.45)';
      k.style.opacity = '0';
      void k.offsetWidth;
    }
    function seritSifirla(sr) {
      sr.kartlar.forEach(function (x) { x.el.remove(); }); sr.kartlar = [];
      sr.bekleme = 0; sr.zaman = 0; sr.saat = 0;
      sr.bar.style.width = '0%'; sr.sayi.textContent = '0'; sr.sure.textContent = '0,0 sn';
      sr.el.classList.remove('bitti');
    }
    function yaz(sr) {
      sr.bar.style.width = Math.min(100, sr.bekleme / 5 * 100) + '%';
      sr.sayi.textContent = sr.bekleme;
      sr.sure.textContent = sayi(sr.zaman) + ' sn';
      sr.el.classList.toggle('yavas', sr.bekleme > 0);
    }
    function calistir(sr, n) {
      var z = Promise.resolve();
      ISTEK.forEach(function (tur) {
        z = z.then(function () {
          if (n !== nesil) return;
          sr.saat++;
          var var_ = sr.kartlar.filter(function (x) { return x.tur === tur; })[0];
          if (var_ && var_.masada) {
            var_.son = sr.saat;
            var_.el.classList.remove('yv-kart--nabiz'); void var_.el.offsetWidth; var_.el.classList.add('yv-kart--nabiz');
            sr.zaman += 0.2; yaz(sr);
            return new Promise(function (c) { setTimeout(c, AZ ? 10 : 450); });
          }
          var bos = sr.yuvalar.filter(function (y) { return !sr.kartlar.some(function (x) { return x.masada && x.yuva === y; }); })[0];
          var once = Promise.resolve();
          if (!bos) {
            var eski = sr.kartlar.filter(function (x) { return x.masada; }).sort(function (a, b) { return a.son - b.son; })[0];
            bos = eski.yuva; eski.masada = false; eski.yuva = null;
            sr.bekleme++; sr.zaman += ADIM;
            eski.el.classList.add('yv-kart--gidiyor');
            once = tasi(sr, eski.el, sr.dolap, false, ADIM).then(function () { eski.el.classList.remove('yv-kart--gidiyor'); yaz(sr); });
          }
          return once.then(function () {
            if (n !== nesil) return;
            var k = var_;
            if (k) { sr.bekleme++; } else { k = { tur: tur, el: kartEl(sr, tur) }; sr.kartlar.push(k); }
            k.masada = true; k.yuva = bos; k.son = sr.saat;
            sr.zaman += ADIM;
            koy(sr, k.el, sr.dolap);
            return tasi(sr, k.el, bos, true, ADIM).then(function () { yaz(sr); });
          });
        });
      });
      return z;
    }
    function oyna() {
      nesil++;
      var n = nesil;
      seritler.forEach(seritSifirla);
      sonuc.className = 'panel-sonuc'; sonuc.textContent = 'Aynı beş uygulama açılıyor, sonra tarayıcıya dönülüyor…';
      calisiyor = seritler.length;
      seritler.forEach(function (sr) {
        calistir(sr, n).then(function () {
          if (n !== nesil) return;
          sr.el.classList.add('bitti');
          if (--calisiyor === 0) {
            var k = seritler[0], b = seritler[1];
            sonuc.className = 'panel-sonuc kotu';
            sonuc.textContent = 'Küçük masada ' + k.bekleme + ' kez dolaba gidip gelindi: iş ' + sayi(k.zaman) + ' sn sürdü. Büyük masada ' + sayi(b.zaman) + ' sn.';
          }
        });
      });
    }
    oynatB.addEventListener('click', oyna);
    seritler.forEach(seritSifirla);
    sonuc.textContent = 'Oynat’a bas: iki masaya aynı dosyalar gelecek.';
    DERS.slaytAcilinca('s8', function () { setTimeout(oyna, AZ ? 10 : 700); });
  })();

  /* ─────────── Adım 6: RAM modülü — döner, çentik ve temaslar (A-VURGU, E-DONDUR) ─────────── */
  D.tembel('#s9-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [0.3, 0.3, 1], pay: 0.92, hedefOfset: [0, 0.8, 0] } });
    var R = D.RAM_OLCU;
    var yuva = s.ekle('M-RAM-YUVASI', { modelOps: { acik: true } });
    var ram = s.ekle('M-RAM');
    var OTUR = yuva.userData.oturma.clone(), UST = OTUR.clone().add(new V3(0, 3.4, 0));
    ram.position.copy(UST);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.45, maxPolar: 1.75, minYakin: 0.45, maxYakin: 1.4 } });
    var mesaj = DERS.sahneMesaj(s);
    // Çentik işareti: iki yüzde halka
    var halkaMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(D.vurguRengi(kap)) });
    var centik = new THREE.Group();
    [1, -1].forEach(function (yz) {
      var h = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 8, 28), halkaMat);
      h.position.set(0, 0.26, yz * (R.T / 2 + 0.06));
      h.userData.golgeYok = true; h.castShadow = false;
      centik.add(h);
    });
    K.parca(centik, 'centik-isaret', 'Çentik', 'Ortada değil, biraz yandadır: RAM yuvaya tek yönde girer.');
    centik.position.set(R.centikX, 0, 0);
    centik.visible = false;
    ram.add(centik);
    var temaslar = ram.getObjectByName('temaslar'), cipler = ram.getObjectByName('cipler');
    var donuyor = !AZ, etiket = null, mesgul = false, secili = null;
    s.herKare(function (dt) { if (donuyor) ram.rotation.y += dt * 0.9; });
    kap.addEventListener('pointerdown', function () { donuyor = false; });
    function durdur() {
      donuyor = false;
      var r0 = ram.rotation.y, r1 = Math.round(r0 / (Math.PI * 2)) * Math.PI * 2;
      return D.tween({ sahne: s, sure: 0.6, guncelle: function (e) { ram.rotation.y = r0 + (r1 - r0) * e; } })
        .then(function () { ram.rotation.y = 0; });
    }
    function temizle() {
      if (etiket) { etiket.kaldir(); etiket = null; }
      centik.visible = false;
      if (secili) { D.vurguKaldir(secili); secili = null; }
    }
    function goster(tur) {
      if (mesgul) return Promise.resolve();
      mesgul = true;
      return durdur().then(function () {
        temizle();
        if (tur === 'centik') {
          centik.visible = true;
          etiket = s.etiket(centik, 'Çentik · ortada değil', { tur: 'vurgu', yer: 'alt' });
          mesaj('Çentik, altın temasların arasındaki boşluktur.', '');
          return s.kameraGit({ theta: s._baslangic.theta, phi: 1.3, yakinlik: 0.62, hedef: ram.localToWorld(new V3(R.centikX, 0.5, 0)) }, 0.9);
        }
        secili = tur === 'temaslar' ? temaslar : cipler;
        D.vurgula(secili, { etiket: tur === 'temaslar' ? 'Altın temaslar' : 'Bellek çipleri' });
        mesaj(tur === 'temaslar' ? 'Altın temaslar yuvadaki metal uçlara değer.' : 'Bilgi, çalışırken bu çiplerde tutulur.', '');
        return s.kameraGit({ theta: s._baslangic.theta, phi: 1.25, yakinlik: 0.85, hedef: ram.localToWorld(new V3(0, tur === 'temaslar' ? 0.4 : 1.8, 0)) }, 0.9);
      }).then(function () { mesgul = false; });
    }
    function tak(ters) {
      if (mesgul) return;
      mesgul = true;
      temizle();
      var z = durdur().then(function () {
        return Promise.all([
          s.kameraGit({ theta: s._baslangic.theta, phi: 1.2, yakinlik: 0.95, hedef: s._baslangic.hedef }, 0.7),
          D.git(ram, UST.clone(), 0.5),
          yuva.userData.mandal(true, 0.3)
        ]);
      });
      if (ters) {
        z = z.then(function () { return D.tween({ sahne: s, sure: 0.6, guncelle: function (e) { ram.rotation.y = Math.PI * e; } }); })
          .then(function () { return D.git(ram, OTUR.clone().add(new V3(0, 0.55, 0)), 0.8); })
          .then(function () {
            centik.visible = true;
            etiket = s.etiket(centik, '✗ Ters: çentik uymuyor', { tur: 'hata', yer: 'alt' });
            mesaj('Ters tutunca girmez: çentik yuvadaki çıkıntıya denk gelmiyor.', 'yanlis');
            return D.uyari(ram, { genlik: 0.25 });
          })
          .then(function () { return D.vurguKaldir(ram, 0.5); })
          .then(function () { return D.bekle(1.2, s); })
          .then(function () { return D.git(ram, UST.clone(), 0.6); })
          .then(function () { return D.tween({ sahne: s, sure: 0.6, guncelle: function (e) { ram.rotation.y = Math.PI * (1 - e); } }); });
      } else {
        z = z.then(function () { return D.git(ram, OTUR.clone(), 0.9); })
          .then(function () { D.ses('klik'); return yuva.userData.mandal(false, 0.35); })
          .then(function () {
            centik.visible = true;
            etiket = s.etiket(centik, '✔ Çentik çıkıntıya oturdu', { tur: 'dogru', yer: 'alt' });
            mesaj('Doğru yönde: çentik yuvadaki çıkıntıya oturdu, mandallar kapandı.', 'dogru');
          });
      }
      z.then(function () { mesgul = false; });
    }
    s.dugme('Çentik', null, function () { goster('centik'); }, { yer: 'alt-orta', aciklama: 'Çentiği göster' });
    s.dugme('Temaslar', null, function () { goster('temaslar'); }, { yer: 'alt-orta', aciklama: 'Altın temasları göster' });
    s.dugme('Çipler', null, function () { goster('cipler'); }, { yer: 'alt-orta', aciklama: 'Bellek çiplerini göster' });
    s.dugme('Tak', null, function () { tak(false); }, { yer: 'alt-orta', aciklama: 'RAM’i doğru yönde yuvaya tak' });
    s.dugme('Ters', null, function () { tak(true); }, { yer: 'alt-orta', aciklama: 'RAM’i ters tutup takmayı dene' });
    // Açılış: döner, sonra çentik ve temaslar sırayla vurgulanır
    D.bekle(AZ ? 0.1 : 3.2, s).then(function () { return goster('centik'); })
      .then(function () { return D.bekle(2.2, s); })
      .then(function () { if (!mesgul && !secili && etiket) return goster('temaslar'); });
  });

  /* ─────────── Etkinlik 1: masa büyüklüğü deneyi (E-SURGU + A-YAVASLA, 3D) ─────────── */
  D.tembel('#s10-3d', function (kap) {
    var a = masaSahnesi(kap, { boy: 'buyuk', kamera: { yon: [0.42, 0.72, 1], pay: 0.84, hedefOfset: [0, -12, 4] } });
    var u = a.u, mesaj = DERS.sahneMesaj(a.s);
    var bk = D.div('dn-bekle', a.s.arayuz);
    bk.innerHTML = '<span class="dn-bekle-ad">Dolaba gidiş-geliş</span><span class="dn-bekle-bar"><i></i></span><b>0</b>';
    var bkBar = bk.querySelector('i'), bkSayi = bk.querySelector('b');
    var tablo = document.getElementById('deney-tablo'), ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var denenen = {}, calisiyor = false, nesil = 0, boyutlaniyor = 0;
    var HIZ = 0.45;
    var PARCA = [['tarayici', 2], ['oyun', 3], ['muzik', 1], ['odev', 1], ['goruntulu', 1], ['foto', 1]];
    function bekYaz(n) { bkSayi.textContent = n; bkBar.style.width = Math.min(100, n / 12 * 100) + '%'; bk.classList.toggle('yavas', n > 0); }
    var surgu = surguKur(document.getElementById('surgu-deney'), { degerler: [4, 8, 16], deger: 4, etiket: 'RAM kapasitesi', onDegis: function (v) {
      if (calisiyor) return;
      nesil++; u.temizle(); bekYaz(0);
      boyutlaniyor++; baslat.disabled = true;
      u.boyut(v, 0.8).then(function () { if (--boyutlaniyor === 0 && !calisiyor) baslat.disabled = false; });
      mesaj(v + ' GB RAM seçildi. Deneyi başlat.', '');
    } });
    function calistir() {
      if (calisiyor || boyutlaniyor) return;
      calisiyor = true; nesil++;
      var n = nesil, gb = surgu.deger();
      surgu.kilitle(true); baslat.disabled = true;
      u.temizle(); bekYaz(0);
      var saat = 0, bekleme = 0, parcalar = [];
      var sistem = { tur: 'sistem', kart: u.masayaKoy('sistem', 0), masada: true, sabit: true, son: 0 };
      parcalar.push(sistem);
      var sira = [];
      PARCA.forEach(function (p) { for (var i = 0; i < p[1]; i++) { var x = { tur: p[0], kart: null, masada: false, dolapta: false, son: 0 }; parcalar.push(x); sira.push(x); } });
      var oyunlar = parcalar.filter(function (p) { return p.tur === 'oyun'; });
      var z = Promise.resolve();
      function istek(p, geri) {
        return function () {
          if (n !== nesil) return;
          p.son = ++saat;
          if (geri) mesaj('Oyuna geri dönülüyor…', '');
          else mesaj(adi(p.tur) + ' açılıyor…', '');
          if (p.masada) return D.bas(p.kart, { mesafe: 1.5 });
          var once = Promise.resolve();
          if (u.bosYuva() < 0) {
            var eski = parcalar.filter(function (x) { return x.masada && !x.sabit; }).sort(function (x, y) { return x.son - y.son; })[0];
            eski.masada = false; eski.dolapta = true;
            bekleme++; bekYaz(bekleme);
            mesaj('Masa dolu! ' + adi(eski.tur) + ' dosyası dolaba gidiyor…', 'yanlis');
            once = u.masadanDolaba(eski.kart, { sure: HIZ });
          }
          return once.then(function () {
            if (n !== nesil) return;
            if (p.dolapta) { bekleme++; bekYaz(bekleme); mesaj(adi(p.tur) + ' dosyası dolaptan geri geliyor…', 'yanlis'); return u.dolaptanMasaya(p.kart, { sure: HIZ }); }
            return u.dolaptanMasaya(p.tur, { sure: HIZ }).then(function (k) { p.kart = k; });
          }).then(function () { p.masada = true; p.dolapta = false; });
        };
      }
      sira.forEach(function (p) { z = z.then(istek(p, false)); });
      oyunlar.forEach(function (p) { z = z.then(istek(p, true)); });
      z.then(function () {
        if (n !== nesil) return;
        calisiyor = false; surgu.kilitle(false); baslat.disabled = false;
        var sonucMetin = bekleme === 0 ? 'Akıcı' : bekleme <= 4 ? 'Biraz bekletir' : 'Çok yavaş';
        var tr = tablo.querySelector('tr[data-gb="' + gb + '"]');
        tr.children[1].textContent = bekleme; tr.children[2].textContent = sonucMetin;
        tr.className = bekleme === 0 ? 'iyi' : bekleme <= 4 ? 'orta' : 'kotu';
        denenen[gb] = bekleme;
        var say = Object.keys(denenen).length;
        ilerle(say, 3);
        if (say === 3) {
          mesaj('✔ Masa büyüdükçe gidiş-geliş azaldı: RAM kapasitesi hızı etkiler.', 'dogru');
          DERS.konfeti();
        } else {
          mesaj(gb + ' GB: ' + bekleme + ' gidiş-geliş (' + sonucMetin.toLocaleLowerCase('tr') + '). Şimdi başka bir kapasite dene.', bekleme === 0 ? 'dogru' : '');
        }
      });
    }
    var baslat = a.s.dugme('Deneyi başlat', 'oynat', calistir, { yer: 'alt-orta', aciklama: 'Seçilen RAM ile uygulamaları aç' });
    boyutlaniyor++; baslat.disabled = true;
    u.boyut(4, 0.01).then(function () { boyutlaniyor--; baslat.disabled = false; });
    mesaj('4 GB RAM seçili. Deneyi başlat.', '');
  });

  /* ─────────── Etkinlik 2: elektrik kesilince ne kalır? (E-SINIFLA + A-GUC-KES) ─────────── */
  D.tembel('#sinifla-guc', function (kap) {
    var kesB = document.createElement('button');
    kesB.type = 'button'; kesB.className = 'kv-oynat gk-kes'; kesB.hidden = true;
    kesB.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2" fill="currentColor"/></svg><span>Elektriği kes</span>';
    var api = D.sinifla(kap, {
      onIlerleme: DERS.ilerlemeBagla('ilerleme-2'),
      kutular: [
        { id: 'kaybolur', ad: 'Kaybolur', aciklama: 'RAM’de, kaydedilmemiş', renk: '#ef4444', resim: '<!--@dahil:kutu-kaybolur.svg-->' },
        { id: 'kalir', ad: 'Kalır', aciklama: 'Depolamada kayıtlı', renk: '#10b981', resim: '<!--@dahil:kutu-kalir.svg-->' }
      ],
      ogeler: [
        { id: 'odev1', ad: 'Kaydedilmemiş ödev yazısı', svg: '<!--@dahil:is-odev-kaydedilmemis.svg-->', kutu: 'kaybolur', ipucu: 'Kaydedilmemiş yazı yalnız RAM’dedir.' },
        { id: 'foto', ad: 'Kaydedilmiş fotoğraf', svg: '<!--@dahil:is-foto-kayitli.svg-->', kutu: 'kalir', ipucu: 'Kaydedilen dosya depolamada, yani dolaptadır.' },
        { id: 'hesap', ad: 'Hesap makinesindeki sonuç', svg: '<!--@dahil:is-hesap.svg-->', kutu: 'kaybolur', ipucu: 'Ekrandaki sonuç kaydedilmedi; RAM’de duruyor.' },
        { id: 'oyun', ad: 'Bilgisayara kurulu oyun', svg: '<!--@dahil:is-oyun-kurulu.svg-->', kutu: 'kalir', ipucu: 'Kurulu programlar diskte, kalıcı olarak durur.' },
        { id: 'pano', ad: 'Kopyalanan (panodaki) yazı', svg: '<!--@dahil:is-pano.svg-->', kutu: 'kaybolur', ipucu: 'Kopyaladığın yazı yapıştırılana kadar RAM’de bekler.' },
        { id: 'muzik', ad: 'İndirilmiş müzik dosyası', svg: '<!--@dahil:is-muzik-indirilmis.svg-->', kutu: 'kalir', ipucu: 'İndirilen dosya diske kaydedilir.' },
        { id: 'bolum', ad: 'Oyunda kaydedilmemiş bölüm', svg: '<!--@dahil:is-oyun-ilerleme.svg-->', kutu: 'kaybolur', ipucu: 'Oyun kaydedilmediyse ilerleme RAM’dedir.' },
        { id: 'odev2', ad: 'Kaydedilmiş ödev dosyası', svg: '<!--@dahil:is-odev-kayitli.svg-->', kutu: 'kalir', ipucu: 'Kaydettiğin ödev dolapta, yani depolamadadır.' }
      ],
      bitisMetni: 'Harika! Şimdi elektriği kes ve sonucu izle.',
      onBitti: function () { kesB.hidden = false; }
    });
    var kok = kap.querySelector('.don3d-sinifla'), alt = kap.querySelector('.dsn-alt'), geri = kap.querySelector('.dsn-geri');
    alt.insertBefore(kesB, alt.firstChild);
    kesB.addEventListener('click', function () {
      kesB.hidden = true;
      kok.classList.add('guc-kesik');
      geri.className = 'dsn-geri dsn-geri--yanlis';
      geri.innerHTML = '<span></span>';
      geri.lastChild.textContent = '⚡ Elektrik kesildi…';
      setTimeout(function () {
        kok.classList.add('guc-geldi');
        geri.className = 'dsn-geri dsn-geri--dogru';
        geri.lastChild.textContent = 'Elektrik geldi: RAM’dekiler silindi, kaydedilenler duruyor.';
        DERS.konfeti();
      }, AZ ? 10 : 1600);
    });
    kap.querySelector('.dsn-sifirla').addEventListener('click', function () {
      kesB.hidden = true; kok.classList.remove('guc-kesik', 'guc-geldi');
    });
    return api;
  });

  /* ─────────── Derinleş: Görev Yöneticisi (sade, marka-nötr 2D) ─────────── */
  (function () {
    var kok = document.getElementById('gorev-yon');
    if (!kok) return;
    var TOPLAM = 8;
    var UYG = [
      { id: 'sistem', ad: 'Sistem', gb: 2.4, sabit: true },
      { id: 'tarayici', ad: 'Tarayıcı (12 sekme)', gb: 1.8 },
      { id: 'oyun', ad: 'Oyun', gb: 3.2 },
      { id: 'goruntulu', ad: 'Görüntülü ders', gb: 0.9 },
      { id: 'cizim', ad: 'Çizim', gb: 0.6 },
      { id: 'muzik', ad: 'Müzik', gb: 0.3 }
    ];
    var acik = { sistem: true, tarayici: true, muzik: true };
    kok.innerHTML = '<div class="gy-kisayol"><kbd>Ctrl</kbd><i>+</i><kbd>Shift</kbd><i>+</i><kbd>Esc</kbd><span>Görev Yöneticisi’ni açar</span></div>' +
      '<div class="gy-pencere" role="group" aria-label="Görev Yöneticisi benzetimi"><div class="gy-baslik"><span class="gy-simge" aria-hidden="true"></span>Görev Yöneticisi' +
      '<span class="gy-sekme">Performans</span></div><div class="gy-govde"><div class="gy-sol"><div class="gy-olcu"><span>Bellek</span><b class="gy-deger"></b><em class="gy-yuzde"></em></div>' +
      '<svg class="gy-grafik" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><path class="gy-izgara" d="M0 20H200M0 40H200M0 60H200M50 0V80M100 0V80M150 0V80"/>' +
      '<path class="gy-alan"/><path class="gy-cizgi"/></svg><div class="gy-dolu"><i></i></div></div>' +
      '<div class="gy-liste"><div class="gy-liste-bas"><span>Uygulama</span><span>Bellek</span></div></div></div></div>' +
      '<div class="panel-sonuc gy-sonuc" aria-live="polite"></div>';
    var liste = kok.querySelector('.gy-liste'), deger = kok.querySelector('.gy-deger'), yuzde = kok.querySelector('.gy-yuzde');
    var alan = kok.querySelector('.gy-alan'), cizgi = kok.querySelector('.gy-cizgi'), dolu = kok.querySelector('.gy-dolu i'), sonuc = kok.querySelector('.gy-sonuc');
    var satirlar = {};
    UYG.forEach(function (u) {
      var sat = D.div('gy-satir', liste);
      sat.innerHTML = '<span class="gy-ad"><i></i><span></span></span><span class="gy-mb"></span>';
      sat.querySelector('.gy-ad i').style.background = TUR[u.id].renk;
      sat.querySelector('.gy-ad span').textContent = u.ad;
      var b = null;
      if (!u.sabit) {
        b = DERS.dugme(sat, '', function () { acik[u.id] = !acik[u.id]; guncelle(true); }, 'gy-dugme');
        b.setAttribute('aria-label', u.ad + ' aç ya da kapat');
      } else { D.div('gy-dugme gy-dugme--sabit', sat).textContent = 'Açık'; }
      satirlar[u.id] = { el: sat, mb: sat.querySelector('.gy-mb'), b: b };
    });
    var gecmis = [], hedef = 0, simdi = 0;
    for (var i = 0; i < 40; i++) gecmis.push(0);
    function gerekli() { return UYG.reduce(function (t, u) { return t + (acik[u.id] ? u.gb : 0); }, 0); }
    function guncelle(dugmeden) {
      var g = gerekli();
      hedef = Math.min(g, TOPLAM * 0.97);
      UYG.forEach(function (u) {
        var r = satirlar[u.id];
        r.el.classList.toggle('kapali', !acik[u.id]);
        r.mb.textContent = acik[u.id] ? Math.round(u.gb * 1000).toLocaleString('tr-TR') + ' MB' : '—';
        if (r.b) { r.b.textContent = acik[u.id] ? 'Kapat' : 'Aç'; r.b.setAttribute('aria-pressed', acik[u.id] ? 'true' : 'false'); }
      });
      if (dugmeden && AZ) { simdi = hedef; ciz(); }
      var y = hedef / TOPLAM;
      sonuc.className = 'panel-sonuc gy-sonuc' + (y > 0.9 ? ' kotu' : y > 0.7 ? ' orta' : ' iyi');
      sonuc.textContent = g > TOPLAM ? 'RAM doldu: ' + sayi(g) + ' GB gerekiyor, ' + TOPLAM + ' GB var. Dosyalar diske gidip gelecek; bilgisayar yavaşlar.' :
        y > 0.7 ? 'Bellek dolmaya yaklaşıyor. Kullanmadığın programları kapatabilirsin.' : 'Bellek rahat: yeni programlara yer var.';
    }
    function ciz() {
      var y = simdi / TOPLAM;
      deger.textContent = sayi(simdi) + ' / ' + TOPLAM + ' GB';
      yuzde.textContent = '%' + Math.round(y * 100);
      kok.classList.toggle('gy--dolu', y > 0.9);
      kok.classList.toggle('gy--orta', y > 0.7 && y <= 0.9);
      dolu.style.width = Math.round(y * 100) + '%';
      var n = gecmis.length, d = gecmis.map(function (v, i) { return (i / (n - 1) * 200).toFixed(1) + ' ' + (80 - v / TOPLAM * 76).toFixed(1); });
      cizgi.setAttribute('d', 'M' + d.join(' L'));
      alan.setAttribute('d', 'M0 80 L' + d.join(' L') + ' L200 80 Z');
    }
    var sayac = null;
    function adim() {
      var sl = document.getElementById('s12');
      if (!sl || !sl.classList.contains('active')) { clearInterval(sayac); sayac = null; return; }
      simdi += (hedef - simdi) * 0.35 + (Math.random() - 0.5) * 0.04;
      simdi = Math.max(0, Math.min(TOPLAM * 0.98, simdi));
      gecmis.push(simdi); gecmis.shift();
      ciz();
    }
    guncelle();
    simdi = hedef; gecmis = gecmis.map(function () { return hedef; });
    ciz();
    DERS.slaytAcilinca('s12', function () { if (!sayac) sayac = setInterval(adim, AZ ? 1200 : 500); }, true);
  })();
})();
