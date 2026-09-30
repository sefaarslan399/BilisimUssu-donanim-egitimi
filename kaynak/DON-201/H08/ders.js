/* DON-201 H08 — Depolama Birimleri · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var V3 = D.kit.V3;
  DERS.tahminKur('Tahminini aldık. Adım 1’de elektriği kesince göreceğiz.');

  /* ─────────── Ortak yardımcılar ─────────── */
  function merkez(nesne) {
    nesne.updateWorldMatrix(true, true);
    return new D.kit.THREE.Box3().setFromObject(nesne).getCenter(new V3());
  }
  function secilmezYap(nesne) { nesne.traverse(function (o) { o.userData.secilmez = true; }); }
  function parcaMesaji(s, mesaj) {
    s.tiklaninca(function (p) {
      if (!p || !p.userData.bilgi || /^M-/.test(p.name)) return;
      D.vurgula(p, { etiket: false, sure: 0.25 });
      D.bekle(1.2, s).then(function () { D.vurguKaldir(p); });
      mesaj(p.userData.etiket + ': ' + p.userData.bilgi, '');
    });
  }
  var HDD_SIMGE = '<svg viewBox="0 0 40 30" aria-hidden="true"><rect x="1" y="1" width="38" height="28" rx="4" fill="#8a9098"/><circle cx="24" cy="15" r="11" fill="#e8ecf1" stroke="#9aa0a8"/>' +
    '<circle cx="24" cy="15" r="3" fill="#6b7280"/><path d="M6 24 L22 17" stroke="#4b5563" stroke-width="2.4" stroke-linecap="round"/></svg>';
  var SSD_SIMGE = '<svg viewBox="0 0 40 30" aria-hidden="true"><rect x="1" y="1" width="38" height="28" rx="4" fill="#1b2530"/><rect x="5" y="6" width="9" height="9" rx="1.5" fill="#23262b" stroke="#f59e0b"/>' +
    '<rect x="18" y="5" width="8" height="9" rx="1" fill="#0b0c0e"/><rect x="28" y="5" width="8" height="9" rx="1" fill="#0b0c0e"/><rect x="18" y="16" width="8" height="9" rx="1" fill="#0b0c0e"/><rect x="28" y="16" width="8" height="9" rx="1" fill="#0b0c0e"/></svg>';

  function sureYaz(sn) {
    sn = Math.round(sn);
    if (sn < 60) return sn + ' sn';
    var d = Math.floor(sn / 60), k = sn % 60;
    return d + ':' + (k < 10 ? '0' : '') + k + ' dk';
  }

  /* A-YARIS: iki ilerleme çubuğu yarışır. seritler: [{ ad, sure (örnek saniye), simge }]. Promise döner. */
  function yarisKur(el, seritler, ops) {
    ops = ops || {};
    var kok = D.div('yr', el);
    var enUzun = Math.max.apply(null, seritler.map(function (x) { return x.sure; }));
    var satirlar = seritler.map(function (x) {
      var sat = D.div('yr-serit', kok);
      var ad = D.div('yr-ad', sat);
      ad.innerHTML = x.simge + '<b></b>';
      ad.querySelector('b').textContent = x.ad;
      var bar = D.div('yr-bar', sat), dolgu = D.div('yr-dolgu', bar);
      var sure = D.div('yr-sure', sat);
      sure.textContent = '0 sn';
      var rozet = D.div('yr-rozet', sat);
      return { x: x, sat: sat, dolgu: dolgu, sure: sure, rozet: rozet, bitti: false };
    });
    var not = D.div('yr-not', kok);
    not.textContent = ops.not || 'Hızlandırılmış gösterim · süreler örnektir';
    function oynat() {
      satirlar.forEach(function (s) { s.bitti = false; s.sat.classList.remove('yr-bitti'); s.rozet.textContent = ''; s.dolgu.style.width = '0%'; s.sure.textContent = '0 sn'; });
      var T = ops.animSure || 5;
      var sira = 0, esit = seritler.every(function (x) { return x.sure === seritler[0].sure; });
      return D.tween({ sure: T, ease: 'lineer', guncelle: function (e) {
        satirlar.forEach(function (s) {
          var oran = Math.min(1, e * enUzun / s.x.sure);
          s.dolgu.style.width = (oran * 100).toFixed(1) + '%';
          s.sure.textContent = sureYaz(s.x.sure * oran);
          if (oran >= 1 && !s.bitti) {
            s.bitti = true; sira++;
            s.sat.classList.add('yr-bitti');
            s.rozet.textContent = esit ? '✓ Aynı anda' : (sira === 1 ? '✓ 1.' : '2.');
            s.sure.textContent = sureYaz(s.x.sure);
          }
        });
      } });
    }
    return { oynat: oynat, kok: kok };
  }
  var YARIS_GIRIS = '<div class="yr-giris" aria-hidden="true"><div>' + HDD_SIMGE + '<b>HDD</b></div><span>ile</span><div>' + SSD_SIMGE + '<b>SSD</b></div></div>';

  /* ─────────── Kapak: dört depolama birimi ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 46, kamera: { yon: [0.4, 1.05, 1], pay: 0.74 } });
    var hdd = s.ekle('M-HDD-ACIK', { konum: [-6, 0, -3.5], donus: [0, Math.PI + 0.25, 0] });
    var ssd = s.ekle('M-SSD', { konum: [10, 0, -4], donus: [0, -0.4, 0] });
    s.ekle('M-M2', { konum: [-7, 0, 7.5], donus: [0, 0.12, 0] });
    s.ekle('M-USB-BELLEK', { konum: [8.5, 0.425, 4.5], donus: [0, 1.1, 0], modelOps: { kapak: 'yanda' } });
    s.yerlestir();
    var u = hdd.userData;
    s.herKare(function (dt) { u.rotor.rotation.y -= (AZ ? 0.6 : 4) * dt; });
    (function ara() {
      if (AZ) return;
      u.kafaGit(Math.random(), 0.35).then(function () { return D.bekle(0.8, s); }).then(ara);
    })();
    var c = ssd.userData.cipler, i = 0;
    (function yak() {
      if (AZ) return;
      ssd.userData.cipIsik(i % c.length, 1);
      var j = i;
      D.bekle(0.35, s).then(function () { ssd.userData.cipIsik(j % c.length, 0); i++; yak(); });
    })();
  });

  /* ─────────── Adım 1: RAM (masa) ↔ kalıcı depolama (dolap) ─────────── */
  (function () {
    var kok = document.getElementById('kalici');
    if (!kok) return;
    kok.innerHTML = '<div class="illu-orta k1-sahne"><!--@dahil:kalici.svg--></div>' +
      '<div class="secici" role="group" aria-label="Adımlar"></div><div class="panel-sonuc" aria-live="polite"></div>';
    var svg = kok.querySelector('svg'), sonuc = kok.querySelector('.panel-sonuc'), secici = kok.querySelector('.secici');
    var gezgin = svg.querySelector('#k1-gezgin'), gucYazi = svg.querySelector('.k1-guc-yazi');
    var RAM = [60, 124], YUVA = [232, 164];
    var kayitli = false, elektrik = true, mesgul = false, elle = false;
    function koy(g, p) { g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')'); }
    function tasi(g, a, b, sure) {
      g.classList.add('gor');
      return D.tween({ sure: sure, guncelle: function (e) {
        koy(g, [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e - Math.sin(e * Math.PI) * 46]);
      } });
    }
    function yaz(t, tur) { sonuc.textContent = t; sonuc.className = 'panel-sonuc' + (tur ? ' ' + tur : ''); }
    var bKaydet, bKes, bAc;
    function dugmeler() {
      bKaydet.disabled = mesgul || !elektrik || kayitli || svg.classList.contains('odev-yok');
      bKes.disabled = mesgul || !elektrik;
      bAc.disabled = mesgul || elektrik;
    }
    function kaydet() {
      if (bKaydet.disabled) return Promise.resolve();
      mesgul = true; dugmeler();
      yaz('Kaydediliyor: ödevin kopyası dolaba yazılıyor…', '');
      return tasi(gezgin, RAM, YUVA, AZ ? 0.01 : 1.1).then(function () {
        kayitli = true; svg.classList.add('kayitli');
        mesgul = false; dugmeler();
        yaz('Ödev kaydedildi. “Not” ise hâlâ yalnız masada (kaydedilmedi).', 'iyi');
      });
    }
    function kes() {
      if (bKes.disabled) return Promise.resolve();
      elektrik = false;
      svg.classList.add('kapali', 'odev-yok', 'not-yok', 'bos');
      gucYazi.textContent = 'Elektrik yok';
      dugmeler();
      D.ses('hata');
      yaz(kayitli ? 'RAM boşaldı! Kaydedilmeyen not kayboldu. Ödev dolapta duruyor.' : 'RAM boşaldı! Ödev kaydedilmediği için kayboldu.', 'kotu');
      return D.bekle(AZ ? 0.01 : 0.3);
    }
    function ac() {
      if (bAc.disabled) return Promise.resolve();
      elektrik = true; mesgul = true;
      svg.classList.remove('kapali');
      gucYazi.textContent = 'Elektrik var';
      dugmeler();
      if (!kayitli) {
        mesgul = false; dugmeler();
        yaz('Bilgisayar açıldı ama ödev yok: kaydedilmemişti. Baştan dene.', 'kotu');
        return Promise.resolve();
      }
      yaz('Açılışta ödev dolaptan masaya (RAM’e) yükleniyor…', '');
      var kopya = gezgin.cloneNode(true);
      kopya.removeAttribute('id');
      svg.appendChild(kopya);
      return tasi(kopya, YUVA, RAM, AZ ? 0.01 : 1.1).then(function () {
        kopya.remove();
        svg.classList.remove('odev-yok', 'bos');
        mesgul = false; dugmeler();
        yaz(DERS.tahminNotu(1, 'Dosya gece boyunca depolama biriminde durdu.', 'Aslında dosya depolama biriminde durdu; açılınca RAM’e yüklendi.'), 'iyi');
      });
    }
    function bastan() {
      if (mesgul) return;
      kayitli = false; elektrik = true;
      svg.setAttribute('class', 'k1');
      gezgin.classList.remove('gor');
      gucYazi.textContent = 'Elektrik var';
      dugmeler();
      yaz('Masada iki dosya var: Ödev ve Not.', '');
    }
    function elleCagir(fn) { return function () { elle = true; fn(); }; }
    bKaydet = DERS.dugme(secici, '1 · Kaydet', elleCagir(kaydet));
    bKes = DERS.dugme(secici, '2 · Elektriği kes', elleCagir(kes));
    bAc = DERS.dugme(secici, '3 · Aç', elleCagir(ac));
    DERS.dugme(secici, 'Baştan', elleCagir(bastan));
    bastan();
    DERS.slaytAcilinca('s4', function () {
      if (AZ) return;
      var z = D.bekle(1.0);
      [kaydet, kes, ac].forEach(function (f, i) {
        z = z.then(function () { return elle ? null : f(); }).then(function () { return elle ? null : D.bekle(i === 1 ? 2.2 : 1.8); });
      });
    });
  })();

  /* ─────────── Adım 2: HDD — plaka döner, kafa izden ize gider (A-DONUS) ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.42, 1.5, 0.85], pay: 1.0, hedefOfset: [0.3, 0, 0.2] } });
    var h = s.ekle('M-HDD-ACIK', { donus: [0, Math.PI, 0] });   // kol tarafı arkada: kamera kolu duvarın üstünden görür
    s.yerlestir();
    secilmezYap(h.userData.kapak);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.2, maxPolar: 1.25, minYakin: 0.45, maxYakin: 1.3 } });
    var u = h.userData, mesaj = DERS.sahneMesaj(s);
    var hiz = 1, bosta = true, durdu = false, okuyor = false;
    s.herKare(function (dt) { u.rotor.rotation.y -= hiz * (AZ ? 0.6 : 4.2) * dt; });
    var rozet = D.div('hdd-hiz', s.arayuz);
    rozet.innerHTML = '<b>7200 dev/dk</b><span>Gerçekte saniyede 120 tur. Burada yavaşlatıldı.</span>';
    s.etiket(u.kafa, 'Okuma-yazma kafası', { tur: 'vurgu' });
    var capa = new D.kit.THREE.Object3D(), pm = u.olcu.plakaMerkez;
    capa.position.set(pm.x + 2.4, pm.y, pm.z - 2.9);
    h.add(capa);
    s.etiket(capa, 'Plaka', {});
    s.etiket(s.parca('hdd-bobin'), 'Kol motoru', { yer: 'alt', ofset: [0, 0, 0] });
    function ara() {
      if (!bosta || durdu || AZ) return;
      var o = Math.random();
      u.kafaGit(o, 0.3).then(function () { if (bosta && !durdu) u.izGoster(o); return D.bekle(0.75, s); }).then(ara);
    }
    function oku() {
      if (okuyor || durdu) return;
      okuyor = true; bosta = false;
      var parcalar = [[0.88, 'Dosyanın 1. parçası dış izde…'], [0.18, '2. parça iç izde: kafa hızla içeri gidiyor…'], [0.55, '3. parça ortada: kafa yine yer değiştiriyor…']];
      var z = D.bekle(0.35, s);
      parcalar.forEach(function (p) {
        z = z.then(function () {
          mesaj(p[1], '');
          u.izGoster(null);
          return u.kafaGit(p[0], AZ ? 0.01 : 0.45);
        }).then(function () { u.izGoster(p[0]); return D.bekle(AZ ? 0.2 : 1.3, s); });
      });
      z.then(function () {
        mesaj('Kafa her parça için ize gitti, plaka da veriyi kafanın altına getirdi. Bu bekleme HDD’yi yavaşlatır.', 'dogru');
        okuyor = false; bosta = true;
        D.bekle(2.5, s).then(ara);
      });
    }
    var bDur = null;
    function durdurBaslat() {
      if (okuyor) return;
      durdu = !durdu;
      bDur.querySelector('span').textContent = durdu ? 'Çalıştır' : 'Durdur';
      if (durdu) {
        u.izGoster(null);
        var h0 = hiz;
        D.tween({ sahne: s, sure: AZ ? 0.01 : 1.4, guncelle: function (e) { hiz = h0 * (1 - e); } });
        u.park(AZ ? 0.01 : 0.7).then(function () { mesaj('Disk durunca kafa rampaya çekilir; plakaya hiç değmez.', ''); });
      } else {
        D.tween({ sahne: s, sure: AZ ? 0.01 : 1.0, guncelle: function (e) { hiz = e; } }).then(function () {
          mesaj('Plaka yeniden döndü; kafa izden ize gidiyor.', ''); bosta = true; ara();
        });
      }
    }
    s.dugme('Dosya oku', 'oynat', oku, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Bir dosyanın parçalarını okumayı izle' });
    bDur = s.dugme('Durdur', null, durdurBaslat, { yer: 'alt-orta', aciklama: 'Diski durdur ya da çalıştır' });
    parcaMesaji(s, mesaj);
    mesaj('Plaka dönüyor; kafa izden ize gidiyor.', '');
    ara();
  });

  /* ─────────── Adım 3: SSD — hareketli parça yok, çipler sırayla yanar ─────────── */
  D.tembel('#s6-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-0.55, 1.2, 1], pay: 0.95 } });
    var ssd = s.ekle('M-SSD', { konum: [-3, 0, -1.5], modelOps: { acik: true } });
    var m2 = s.ekle('M-M2', { konum: [-5.5, 0, 5.2] });
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.25, maxPolar: 1.35, minYakin: 0.4, maxYakin: 1.3 } });
    var mesaj = DERS.sahneMesaj(s), su = ssd.userData, mu = m2.userData, okuyor = false;
    s.etiket(su.denetleyici, 'Denetleyici', { tur: 'vurgu' });
    s.etiket(su.cipler[1], 'Bellek çipleri', { ofset: [0, 0, 0] });
    s.etiket(m2, 'M.2 SSD', { yer: 'alt', ofset: [0, 0, 1.4] });
    function isikla(api, i, gecikme) {
      return D.bekle(gecikme, s).then(function () {
        return D.tween({ sahne: s, sure: AZ ? 0.05 : 0.55, ease: 'lineer', guncelle: function (e) { api.cipIsik(i, Math.sin(e * Math.PI)); } });
      });
    }
    function oku(tur) {
      if (okuyor) return Promise.resolve();
      okuyor = true;
      mesaj('Denetleyici çalışıyor: veri çiplerden okunuyor…', '');
      su.denetleyiciIsik(1); mu.denetleyiciIsik(1);
      var isler = [];
      for (var t = 0; t < (tur || 2); t++) {
        su.cipler.forEach(function (c, i) { isler.push(isikla(su, i, t * 1.0 + i * 0.16)); });
        mu.cipler.forEach(function (c, i) { isler.push(isikla(mu, i, t * 1.0 + i * 0.22)); });
      }
      return Promise.all(isler).then(function () {
        su.denetleyiciIsik(0); mu.denetleyiciIsik(0);
        okuyor = false;
        mesaj('Çipler birbirini beklemeden okundu. Hiçbir parça dönmedi, hareket etmedi!', 'dogru');
      });
    }
    var fotolar = document.querySelectorAll('#s6 .foto-kart');
    function foto(ad) { fotolar.forEach(function (f) { f.hidden = f.getAttribute('data-foto') !== ad; }); }
    var bSata, bM2;
    function odak(nesne, ad, b) {
      [bSata, bM2].forEach(function (x) { x.classList.toggle('don3d-dugme--secili', x === b); });
      foto(ad);
      var c = merkez(nesne);
      s.kameraGit({ hedef: [c.x, c.y, c.z], yakinlik: ad === 'm2' ? 0.62 : 0.75 }, 0.9).then(function () {
        mesaj(ad === 'm2' ? 'M.2 SSD: kablo gerekmez, anakarttaki M.2 yuvasına takılır.' : '2,5 inç SATA SSD: SATA veri ve güç kablolarıyla bağlanır.', '');
      });
    }
    s.dugme('Oku', 'oynat', function () { oku(2); }, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'SSD’den veri okumayı izle' });
    bSata = s.dugme('SATA SSD', null, function () { odak(ssd, 'sata', bSata); }, { yer: 'alt-orta', aciklama: '2,5 inç SATA SSD’ye yakınlaş' });
    bM2 = s.dugme('M.2 SSD', null, function () { odak(m2, 'm2', bM2); }, { yer: 'alt-orta', aciklama: 'M.2 SSD’ye yakınlaş' });
    parcaMesaji(s, mesaj);
    mesaj('Kapağı kaldırılmış bir SSD: içinde dönen bir şey var mı?', '');
    D.bekle(1.2, s).then(function () { return oku(3); });
  });

  /* ─────────── Adım 4: HDD mi SSD mi? (E-TAHMIN + A-YARIS) ─────────── */
  (function () {
    var kok = document.getElementById('yaris');
    if (!kok) return;
    function kur() {
      D.tahmin(kok, {
        soru: 'Aynı oyun hem HDD’den hem SSD’den açılıyor. Hangisi önce yükler?',
        secenekler: ['HDD', 'SSD', 'Aynı anda'], dogru: 1,
        giris: YARIS_GIRIS,
        sonra: function (sahne) {
          sahne.innerHTML = '';
          var y = yarisKur(sahne, [{ ad: 'HDD', sure: 40, simge: HDD_SIMGE }, { ad: 'SSD', sure: 15, simge: SSD_SIMGE }], { animSure: AZ ? 0.1 : 5 });
          return y.oynat().then(function () {
            var t = D.div('yr-tablo', sahne);
            t.innerHTML = '<div></div><b>HDD</b><b>SSD</b>' +
              '<span>İçinde</span><div>Dönen plaka, kol</div><div>Bellek çipleri</div>' +
              '<span>Oyunu açma</span><div>Daha yavaş</div><div>Daha hızlı</div>' +
              '<span>Sarsıntı</span><div>Hassas</div><div>Dayanıklı</div>' +
              '<span>Aynı fiyata yer</span><div>Daha çok</div><div>Daha az</div>';
            var yeniden = document.createElement('button');
            yeniden.type = 'button'; yeniden.className = 'yr-yeniden';
            yeniden.innerHTML = D.simge('tekrar') + '<span>Yeniden</span>';
            yeniden.addEventListener('click', kur);
            sahne.appendChild(yeniden);
          });
        },
        aciklama: 'SSD’de kafa gidip gelmez; veri çiplerden hemen okunur.'
      });
    }
    kur();
  })();

  /* ─────────── Adım 5: USB bellek, SD, microSD ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.15, 1.1, 1], pay: 0.98 } });
    var usb = s.ekle('M-USB-BELLEK', { konum: [-0.6, 0.425, -1.8], donus: [0, -Math.PI / 2, 0], modelOps: { kapak: 'yanda' } });
    var sd = s.ekle('M-USB-BELLEK', { konum: [2.2, 0, -2.6], modelOps: { tur: 'sd' } });
    var msd = s.ekle('M-USB-BELLEK', { konum: [5.0, 0, -1.8], modelOps: { tur: 'microsd' } });
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.25, maxPolar: 1.3, minYakin: 0.35, maxYakin: 1.3 } });
    var mesaj = DERS.sahneMesaj(s);
    s.etiket(usb, 'USB bellek', { tur: 'vurgu' });
    s.etiket(sd, 'SD kart', { tur: 'vurgu' });
    s.etiket(msd, 'microSD', { tur: 'vurgu', yer: 'alt' });
    var dugmeler = [], mesgul = false;
    var BIRIM = [
      { ad: 'USB bellek', m: usb, y: 0.5, metin: 'USB bellek: bilgisayarın USB portuna takılır. Işığı yanıp sönerken çıkarma; dosya bozulabilir.',
        oyna: function () {
          var u = usb.userData;
          return u.kapakAc(false, 0.6).then(function () { return u.kapakAc(true, 0.6); }).then(function () {
            return D.tween({ sahne: s, sure: AZ ? 0.05 : 1.6, ease: 'lineer', guncelle: function (e, t) { u.isik(t >= 1 ? 0 : (Math.sin(t * Math.PI * 10) > 0 ? 1 : 0)); } });
          });
        } },
      { ad: 'SD kart', m: sd, y: 0.42, metin: 'SD kart: fotoğraf makinesinde kullanılır. Yandaki kilit aşağıdayken kart yazılamaz, silinemez.',
        oyna: function () {
          var u = sd.userData;
          return D.bekle(0.5, s).then(function () { u.kilit(true); D.ses('klik'); return D.bekle(1.2, s); }).then(function () { u.kilit(false); D.ses('klik'); });
        } },
      { ad: 'microSD', m: msd, y: 0.3, metin: 'microSD: telefon, tablet ve oyun konsolunda kullanılır. Tırnak kadar küçük; kolay kaybolur.',
        oyna: function () { return D.bekle(0.4, s); } }
    ];
    BIRIM.forEach(function (b) {
      var btn = s.dugme(b.ad, null, function () {
        if (mesgul) return;
        mesgul = true;
        dugmeler.forEach(function (x) { x.classList.toggle('don3d-dugme--secili', x === btn); });
        var c = merkez(b.m);
        mesaj(b.metin, '');
        s.kameraGit({ hedef: [c.x, c.y, c.z], yakinlik: b.y, theta: s._baslangic.theta, phi: s._baslangic.phi }, 0.9)
          .then(b.oyna).then(function () { mesgul = false; });
      }, { yer: 'alt-orta', aciklama: b.ad + ' birimine yakınlaş' });
      dugmeler.push(btn);
    });
    parcaMesaji(s, mesaj);
    mesaj('Üçü de bellek çipiyle çalışır. Bir birim seç.', '');
  });

  /* ─────────── Adım 6: Bulut ve yedekleme (A-AKIS, 2D) ─────────── */
  (function () {
    var kok = document.getElementById('bulut');
    if (!kok) return;
    kok.innerHTML = '<div class="illu-orta bl-sahne"><!--@dahil:bulut.svg--></div>' +
      '<div class="secici" role="group" aria-label="Yedekleme adımları"></div><div class="panel-sonuc" aria-live="polite"></div>';
    var svg = kok.querySelector('svg'), sonuc = kok.querySelector('.panel-sonuc'), secici = kok.querySelector('.secici');
    var gezgin = svg.querySelector('#bl-gezgin'), kopyaEl = svg.querySelector('.bl-kopya');
    var yolYukle = svg.querySelector('#bl-yol-yukle'), yolGeri = svg.querySelector('#bl-yol-geri');
    var durum = { pc: true, bulut: false, ariza: false }, mesgul = false, elle = false;
    function yaz(t, tur) { sonuc.textContent = t; sonuc.className = 'panel-sonuc' + (tur ? ' ' + tur : ''); }
    function sayac() { kopyaEl.textContent = String((durum.pc ? 1 : 0) + (durum.bulut ? 1 : 0)); }
    function akis(yol) {
      var L = yol.getTotalLength();
      gezgin.classList.add('gor');
      yol.classList.add('aktif');
      return D.tween({ sure: AZ ? 0.01 : 1.6, guncelle: function (e) {
        var p = yol.getPointAtLength(e * L);
        gezgin.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
      } }).then(function () { gezgin.classList.remove('gor'); yol.classList.remove('aktif'); });
    }
    var bY, bA, bG;
    function dugmeler() {
      bY.disabled = mesgul || durum.bulut || !durum.pc;
      bA.disabled = mesgul || durum.ariza;
      bG.disabled = mesgul || !durum.ariza || !durum.bulut;
    }
    function yedekle() {
      if (bY.disabled) return Promise.resolve();
      mesgul = true; dugmeler();
      yaz('Proje dosyası internet üzerinden buluta kopyalanıyor…', '');
      return akis(yolYukle).then(function () {
        durum.bulut = true; svg.classList.add('yedekli'); sayac();
        mesgul = false; dugmeler();
        yaz('Yedek hazır: bir kopya bilgisayarda, bir kopya bulutta.', 'iyi');
      });
    }
    function ariza() {
      if (bA.disabled) return Promise.resolve();
      durum.ariza = true; durum.pc = false;
      svg.classList.add('ariza', 'pc-bos'); sayac(); dugmeler();
      D.ses('hata');
      yaz(durum.bulut ? 'Eyvah, disk bozuldu! Bilgisayardaki kopya gitti ama bulutta bir kopya var.' : 'Disk bozuldu ve yedek yoktu: Proje kayboldu! Baştan başla ve önce yedekle.', 'kotu');
      return D.bekle(AZ ? 0.01 : 0.3);
    }
    function geri() {
      if (bG.disabled) return Promise.resolve();
      mesgul = true; dugmeler();
      svg.classList.remove('ariza');
      yaz('Diski yenilenen bilgisayara dosya buluttan geri yükleniyor…', '');
      return akis(yolGeri).then(function () {
        durum.ariza = false; durum.pc = true;
        svg.classList.remove('pc-bos'); sayac();
        mesgul = false; dugmeler();
        yaz('Proje geri geldi! Yedek sayesinde hiçbir şey kaybolmadı.', 'iyi');
      });
    }
    function bastan() {
      if (mesgul) return;
      durum = { pc: true, bulut: false, ariza: false };
      svg.setAttribute('class', 'bl'); sayac(); dugmeler();
      yaz('Proje dosyası yalnız Deniz’in bilgisayarında.', '');
    }
    function elleCagir(fn) { return function () { elle = true; fn(); }; }
    bY = DERS.dugme(secici, '1 · Yedekle', elleCagir(yedekle));
    bA = DERS.dugme(secici, '2 · Arıza', elleCagir(ariza));
    bG = DERS.dugme(secici, '3 · Geri yükle', elleCagir(geri));
    DERS.dugme(secici, 'Baştan', elleCagir(bastan));
    bastan();
    DERS.slaytAcilinca('s9', function () {
      if (AZ) return;
      var z = D.bekle(1.0);
      [yedekle, ariza, geri].forEach(function (f) {
        z = z.then(function () { return elle ? null : f(); }).then(function () { return elle ? null : D.bekle(2.0); });
      });
    });
  })();

  /* ─────────── Etkinlik 1: Yükleme yarışı (E-TAHMIN turları) ─────────── */
  (function () {
    var kok = document.getElementById('yaris-oyunu');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var liste = document.querySelectorAll('#yaris-turlari li');
    var TURLAR = [
      { soru: 'Bilgisayar açılıyor. Hangisi önce hazır olur?', hdd: 50, ssd: 15, dogru: 1,
        aciklama: 'Açılışta binlerce küçük dosya okunur. SSD onları beklemeden bulur.' },
      { soru: '3 dakikalık bir şarkı çalıyor. Hangisi şarkıyı önce bitirir?', hdd: 180, ssd: 180, dogru: 2,
        aciklama: 'Şarkı her diskte 3 dakika sürer. İki disk de şarkının verisini rahatça yetiştirir.' },
      { soru: '1 GB’lık oyun güncellemesi internetten iniyor. Hangisi önce biter?', hdd: 90, ssd: 90, dogru: 2,
        aciklama: 'Burada hızı internet bağlantısı belirler. İki disk de gelen veriyi rahatça yazar.' },
      { soru: '500 fotoğraf bir klasörden ötekine kopyalanıyor. Hangisi önce biter?', hdd: 60, ssd: 15, dogru: 1,
        aciklama: 'Çok sayıda dosyada HDD’nin kafası sürekli gidip gelir. SSD’de bu bekleme yoktur.' }
    ];
    var dogruSay = 0;
    function isaretle(n) {
      liste.forEach(function (li, i) { li.classList.toggle('tamam', i < n); li.classList.toggle('simdi', i === n); });
      ilerle(n, TURLAR.length);
    }
    function tur(i) {
      isaretle(i);
      kok.innerHTML = '';
      var bo = D.div('bo', kok);
      D.div('bo-baslik', bo).textContent = 'Tur ' + (i + 1) + ' / ' + TURLAR.length;
      var alan = D.div('bo-alan', bo);
      var t = TURLAR[i];
      D.tahmin(alan, {
        soru: t.soru, secenekler: ['HDD önce biter', 'SSD önce biter', 'Aynı anda biter'], dogru: t.dogru, aciklama: t.aciklama,
        giris: YARIS_GIRIS,
        sonra: function (sahne) {
          sahne.innerHTML = '';
          return yarisKur(sahne, [{ ad: 'HDD', sure: t.hdd, simge: HDD_SIMGE }, { ad: 'SSD', sure: t.ssd, simge: SSD_SIMGE }],
            { animSure: AZ ? 0.1 : 4 }).oynat();
        },
        onBitti: function (dogru) {
          if (dogru) dogruSay++;
          isaretle(i + 1);
          liste[i].setAttribute('data-sonuc', dogru ? '✓ doğru tahmin' : '✗');
          var s = document.createElement('button'); s.type = 'button'; s.className = 'bo-sonraki';
          s.textContent = i < TURLAR.length - 1 ? 'Sonraki tur →' : 'Sonucu gör →';
          s.addEventListener('click', function () { if (i < TURLAR.length - 1) tur(i + 1); else bitir(); });
          bo.appendChild(s);
        }
      });
    }
    function bitir() {
      kok.innerHTML = '';
      var bo = D.div('bo', kok), oz = D.div('bo-ozet', bo);
      oz.innerHTML = '<b></b><span></span><p></p>';
      oz.querySelector('b').textContent = dogruSay + ' / ' + TURLAR.length;
      oz.querySelector('span').textContent = dogruSay >= 3 ? 'Harika tahminci!' : 'İyi deneme!';
      oz.querySelector('p').textContent = 'SSD, diskten okuma ve yazma gereken işleri hızlandırır. İnternetin hızını ya da şarkının süresini değiştirmez.';
      var s = document.createElement('button'); s.type = 'button'; s.className = 'bo-sonraki'; s.textContent = 'Yeniden oyna';
      s.addEventListener('click', function () {
        dogruSay = 0;
        liste.forEach(function (li) { li.removeAttribute('data-sonuc'); });
        tur(0);
      });
      oz.appendChild(s);
      if (dogruSay >= 3) DERS.konfeti();
    }
    tur(0);
  })();

  /* ─────────── Etkinlik 2: Yedekleme senaryosu ─────────── */
  (function () {
    var kok = document.getElementById('yedek-senaryo');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var YER_SIMGE = {
      pc: '<svg viewBox="0 0 48 36" aria-hidden="true"><rect x="5" y="2" width="38" height="25" rx="3" fill="#1f2937"/><rect class="ys-ekran" x="8" y="5" width="32" height="19" rx="1.5" fill="#e0f2fe"/><path d="M1 29h46l-3 5H4z" fill="#94a3b8"/></svg>',
      usb: '<svg viewBox="0 0 48 36" aria-hidden="true"><rect x="2" y="13" width="10" height="10" rx="1" fill="#cbd5e1" stroke="#94a3b8"/><rect x="12" y="9" width="32" height="18" rx="6" fill="#1e3a8a"/><circle cx="38" cy="14" r="1.8" fill="#22c55e"/></svg>',
      bulut: '<svg viewBox="0 0 48 36" aria-hidden="true"><path d="M12 30a8 8 0 0 1 0-16 12 12 0 0 1 22 2 7 7 0 0 1 2 14z" fill="#fff" stroke="#60a5fa" stroke-width="2.5"/></svg>'
    };
    var ADIMLAR = [
      { metin: 'Deniz proje ödevini bitirip kaydetti. Dosya yalnız bilgisayarında. Şimdi ne yapmalı?',
        secenek: [['Hiçbir şey; kaydettim, yeter.', 'Kaydetmek dosyayı yalnız bu diske yazar. Disk bozulursa ödev gider.'],
                  ['Ödevin bir kopyasını buluta yükler.', 'Harika! Artık bulutta ikinci bir kopya var.'],
                  ['Ödevi masaüstüne taşır.', 'Masaüstü de aynı diskin içindedir. Bu bir yedek değildir.']],
        dogru: 1, etki: function () { return kopyala('pc', 'bulut'); } },
      { metin: 'Deniz okulda da çalışmak için ödevi USB belleğe almak istiyor. Hangisi doğru?',
        secenek: [['Dosyayı USB belleğe taşır, bilgisayardan siler.', 'Taşıyınca bilgisayarda kopya kalmaz; kopya sayısı artmaz.'],
                  ['Işık yanıp sönerken belleği çekip çıkarır.', 'Işık yanarken dosya yazılıyordur. Çekersen dosya bozulabilir.'],
                  ['Dosyayı kopyalar, bitince belleği güvenle çıkarır.', 'Doğru! Artık üç kopya var.']],
        dogru: 2, etki: function () { return kopyala('pc', 'usb'); } },
      { metin: 'Eyvah! Bilgisayar masadan düştü ve diski bozuldu. Ödev kurtulur mu?',
        once: function () { return boz(); },
        secenek: [['Hayır, ödev tamamen gitti.', 'Yedeklerini hatırla: bulutta ve USB bellekte kopyası var.'],
                  ['Evet, bulutta ve USB bellekte kopyası var.', 'Evet! Yedek tam da bunun için vardı.'],
                  ['Yalnız bozuk disk tamir edilirse.', 'Tamire gerek yok; kopyalar başka yerlerde duruyor.']],
        dogru: 1 },
      { metin: 'Deniz’e yeni bir bilgisayar geldi. Ödevini oraya nasıl getirir?',
        secenek: [['Bulut hesabına girip dosyayı indirir.', 'Dosya buluttan yeni bilgisayara geri geldi.'],
                  ['Bozuk diski yeni bilgisayara takıp dener.', 'Bozuk diskten veri okunamaz. Yedekten geri yükle.'],
                  ['Ödevi baştan yazar.', 'Gerek yok! Yedekten geri yükleyebilir.']],
        dogru: 0, etki: function () { onar(); return kopyala('bulut', 'pc'); } },
      { metin: 'Deniz ödevine yeni bir bölüm ekledi. Yedeği ne zaman yenilemeli?',
        secenek: [['Hiç; eski yedek yeter.', 'Eski yedekte yeni bölüm yok. Disk bozulursa o bölüm gider.'],
                  ['Yalnız yılbaşında.', 'Bir yıl çok uzun; aradaki her değişiklik risk altında kalır.'],
                  ['Önemli bir değişiklikten sonra, düzenli olarak.', 'Doğru! Düzenli yedek, dosyanın son hâlini de korur.']],
        dogru: 2, etki: function () { return guncelle(); } }
    ];
    var yerler = {}, adim = 0, ilkDeneme = 0, hataVar = false;
    kok.innerHTML = '<div class="ys"><div class="ys-yerler"></div><div class="ys-kart"><div class="ys-ust"><span class="ys-adim"></span><span class="ys-kopya"></span></div>' +
      '<div class="ys-metin"></div><div class="ys-secenekler" role="group" aria-label="Seçenekler"></div><div class="ys-geri" aria-live="polite"></div></div></div>';
    var yerEl = kok.querySelector('.ys-yerler'), kart = kok.querySelector('.ys-kart');
    var adimEl = kok.querySelector('.ys-adim'), kopyaEl = kok.querySelector('.ys-kopya'), metinEl = kok.querySelector('.ys-metin');
    var secEl = kok.querySelector('.ys-secenekler'), geriEl = kok.querySelector('.ys-geri');
    [['pc', 'Bilgisayar'], ['usb', 'USB bellek'], ['bulut', 'Bulut']].forEach(function (x) {
      var el = D.div('ys-yer', yerEl);
      el.innerHTML = '<div class="ys-simge">' + YER_SIMGE[x[0]] + '</div><b></b><span class="ys-durum"></span>';
      el.querySelector('b').textContent = x[1];
      yerler[x[0]] = { el: el, var: x[0] === 'pc', bozuk: false };
    });
    function yerYaz() {
      var n = 0;
      Object.keys(yerler).forEach(function (k) {
        var y = yerler[k], d = y.el.querySelector('.ys-durum');
        y.el.classList.toggle('ys-var', y.var && !y.bozuk);
        y.el.classList.toggle('ys-bozuk', y.bozuk);
        d.textContent = y.bozuk ? '✗ Disk bozuk' : (y.var ? '✓ Ödev var' : '— Kopya yok');
        if (y.var && !y.bozuk) n++;
      });
      kopyaEl.textContent = 'Kopya sayısı: ' + n;
    }
    function nabiz(el) { if (!AZ && el.animate) el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 450 }); }
    function kopyala(a, b) {
      var ra = yerler[a].el.getBoundingClientRect(), rb = yerler[b].el.getBoundingClientRect(), rk = kok.getBoundingClientRect();
      var ucan = D.div('ys-ucan', kok);
      ucan.innerHTML = '<svg viewBox="0 0 24 30" aria-hidden="true"><path d="M2 2h13l7 7v19H2z" fill="#fff" stroke="#7c3aed" stroke-width="2"/><rect x="6" y="12" width="11" height="3" fill="#7c3aed"/></svg>';
      var x0 = ra.left - rk.left + ra.width / 2 - 14, y0 = ra.top - rk.top + 10, x1 = rb.left - rk.left + rb.width / 2 - 14, y1 = rb.top - rk.top + 10;
      return D.tween({ sure: AZ ? 0.01 : 0.9, guncelle: function (e) {
        ucan.style.transform = 'translate(' + (x0 + (x1 - x0) * e).toFixed(1) + 'px,' + (y0 + (y1 - y0) * e - Math.sin(e * Math.PI) * 30).toFixed(1) + 'px)';
      } }).then(function () {
        ucan.remove();
        yerler[b].var = true; yerYaz(); nabiz(yerler[b].el);
      });
    }
    function boz() {
      yerler.pc.bozuk = true; yerler.pc.var = false; yerYaz();
      D.ses('hata');
      if (!AZ && yerler.pc.el.animate) yerler.pc.el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 400, iterations: 2 });
      return D.bekle(AZ ? 0.01 : 0.5);
    }
    function onar() { yerler.pc.bozuk = false; yerYaz(); }
    function guncelle() {
      ['bulut', 'usb'].forEach(function (k) { nabiz(yerler[k].el); });
      yerler.bulut.el.querySelector('.ys-durum').textContent = '✓ Güncel yedek';
      yerler.usb.el.querySelector('.ys-durum').textContent = '✓ Güncel yedek';
      return D.bekle(AZ ? 0.01 : 0.4);
    }
    function goster() {
      var a = ADIMLAR[adim];
      hataVar = false;
      ilerle(adim, ADIMLAR.length);
      adimEl.textContent = 'Adım ' + (adim + 1) + ' / ' + ADIMLAR.length;
      metinEl.textContent = a.metin;
      secEl.innerHTML = ''; geriEl.innerHTML = ''; geriEl.className = 'ys-geri';
      var dugmeler = [];
      a.secenek.forEach(function (x, i) {
        var b = DERS.dugme(secEl, '', function () { sec(i, b, dugmeler); }, 'ys-sec');
        b.innerHTML = '<span class="ys-harf">' + 'ABC'[i] + '</span><span></span>';
        b.lastChild.textContent = x[0];
        dugmeler.push(b);
      });
      if (a.once) { dugmeler.forEach(function (b) { b.disabled = true; }); a.once().then(function () { dugmeler.forEach(function (b) { b.disabled = false; }); }); }
    }
    function sec(i, b, dugmeler) {
      var a = ADIMLAR[adim];
      geriEl.innerHTML = '<b></b><span></span>';
      geriEl.lastChild.textContent = a.secenek[i][1];
      if (i !== a.dogru) {
        hataVar = true;
        b.disabled = true; b.classList.add('ys-yanlis');
        geriEl.className = 'ys-geri kotu';
        geriEl.firstChild.textContent = '✗ Tekrar düşün. ';
        D.ses('hata');
        return;
      }
      if (!hataVar) ilkDeneme++;
      dugmeler.forEach(function (x) { x.disabled = true; });
      b.classList.add('ys-dogru');
      geriEl.className = 'ys-geri iyi';
      geriEl.firstChild.textContent = '✓ ';
      D.ses('klik');
      Promise.resolve(a.etki ? a.etki() : null).then(function () {
        var ileri = document.createElement('button');
        ileri.type = 'button'; ileri.className = 'bo-sonraki';
        ileri.textContent = adim < ADIMLAR.length - 1 ? 'Sonraki adım →' : 'Sonucu gör →';
        ileri.addEventListener('click', function () { adim++; if (adim < ADIMLAR.length) goster(); else bitir(); });
        geriEl.appendChild(ileri);
      });
    }
    function bitir() {
      ilerle(ADIMLAR.length, ADIMLAR.length);
      adimEl.textContent = 'Senaryo tamam';
      metinEl.textContent = 'Deniz’in ödevi kurtuldu! Bilgisayarı bozulsa da yedekleri sayesinde hiçbir şey kaybolmadı.';
      secEl.innerHTML = '';
      geriEl.className = 'ys-geri iyi ys-son';
      geriEl.innerHTML = '<b></b><span></span>';
      geriEl.firstChild.textContent = 'İlk denemede doğru: ' + ilkDeneme + ' / ' + ADIMLAR.length;
      geriEl.lastChild.textContent = ' Kural: Önemli dosyanın en az bir kopyası başka bir yerde dursun.';
      var y = document.createElement('button'); y.type = 'button'; y.className = 'bo-sonraki'; y.textContent = 'Yeniden oyna';
      y.addEventListener('click', function () {
        adim = 0; ilkDeneme = 0;
        yerler.pc.var = true; yerler.pc.bozuk = false; yerler.usb.var = false; yerler.bulut.var = false;
        yerYaz(); goster();
      });
      geriEl.appendChild(y);
      DERS.konfeti();
    }
    yerYaz();
    goster();
  })();

  /* ─────────── Derinleş: Dosya Gezgini'nde disk doluluğu ─────────── */
  (function () {
    var kok = document.getElementById('doluluk');
    if (!kok) return;
    var SURUCU = [
      { ad: 'Yerel Disk (C:)', bos: 38, top: 465, kutu: '500 GB', tur: 'SSD' },
      { ad: 'Veri (D:)', bos: 605, top: 931, kutu: '1 TB', tur: 'HDD' }
    ];
    var DISK = '<svg viewBox="0 0 40 28" aria-hidden="true"><rect x="1" y="4" width="38" height="20" rx="3" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/><rect x="4" y="16" width="32" height="5" rx="1.5" fill="#94a3b8"/><circle cx="33" cy="10" r="2" fill="#22c55e"/></svg>';
    kok.innerHTML = '<div class="dg"><div class="dg-pencere"><div class="dg-baslik"><span class="dg-noktalar" aria-hidden="true"><i></i><i></i><i></i></span>Bu Bilgisayar</div>' +
      '<div class="dg-bolum">Aygıtlar ve sürücüler</div><div class="dg-suruculer"></div></div><div class="dg-bilgi" aria-live="polite"></div></div>';
    var liste = kok.querySelector('.dg-suruculer'), bilgi = kok.querySelector('.dg-bilgi');
    var dugmeler = [];
    SURUCU.forEach(function (s) {
      var dolu = s.top - s.bos, yuzde = Math.round(dolu / s.top * 100), az = s.bos / s.top < 0.1;
      var b = DERS.dugme(liste, '', function () { sec(s, b, dolu, yuzde, az); }, 'dg-surucu' + (az ? ' dg-az' : ''));
      b.innerHTML = '<span class="dg-simge">' + DISK + '</span><span class="dg-yazi"><b></b><span class="dg-bar"><span></span></span><small></small></span>';
      b.querySelector('b').textContent = s.ad;
      b.querySelector('small').textContent = s.bos + ' GB boş / ' + s.top + ' GB' + (az ? ' · ⚠ Az yer kaldı' : '');
      b.querySelector('.dg-bar span').setAttribute('data-yuzde', yuzde);
      b.setAttribute('aria-pressed', 'false');
      dugmeler.push(b);
    });
    function sec(s, b, dolu, yuzde, az) {
      dugmeler.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      bilgi.innerHTML = '<b></b><p class="dg-hesap"></p><p></p><p class="dg-not"></p>';
      bilgi.querySelector('b').textContent = s.ad;
      bilgi.querySelector('.dg-hesap').textContent = 'Dolu = ' + s.top + ' − ' + s.bos + ' = ' + dolu + ' GB (%' + yuzde + ')';
      bilgi.children[2].textContent = az ? 'Çubuk kırmızı: yer çok azaldı. Gereksiz dosyaları silmek ya da başka yere taşımak gerekir.' : 'Çubuk mavi: daha bol yer var.';
      bilgi.querySelector('.dg-not').textContent = 'Kutusunda ' + s.kutu + ' yazan ' + s.tur + ', burada ' + s.top + ' GB görünür: bilgisayar 1 GB’ı 1024 × 1024 × 1024 bayt sayar.';
    }
    bilgi.innerHTML = '<p>Bir sürücüye dokun: ne kadarının dolu olduğunu hesaplayalım.</p>';
    DERS.slaytAcilinca('s12', function () {
      kok.querySelectorAll('.dg-bar span').forEach(function (sp) { sp.style.width = sp.getAttribute('data-yuzde') + '%'; });
    });
  })();
})();
