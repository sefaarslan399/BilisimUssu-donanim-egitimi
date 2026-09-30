/* DON-201 H03 — Bağlantı Noktaları ve Çevre Birimleri · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var V3 = D.kit.V3;
  DERS.tahminKur('Tahminini aldık. Adım 1’de portlara dokununca göreceğiz.');

  /* ─────────── Ortak: arka panel sahnesi ─────────── */
  function panelSahnesi(kap, ops) {
    ops = ops || {};
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, zemin: false, arkaPlan: ops.arkaPlan,
      kamera: ops.kamera || { yon: [0.2, 0.16, 1], pay: 0.94 } });
    var m = s.ekle('M-ARKA-PANEL', { modelOps: ops.modelOps });
    s.yerlestir();
    if (ops.dondur !== false) D.dondur(s, { ipucu: false, sinir: { minPolar: 1.0, maxPolar: 1.75, minYakin: 0.25, maxYakin: 1.3, yatay: 0.8 } });
    return { s: s, m: m };
  }
  function port(m, ad) { return m.getObjectByName('port-' + ad); }
  function fisEkle(s, tur, ops) {
    var f = D.model('M-KABLO-UCLARI', Object.assign({ tur: tur }, ops || {}));
    s.kok.add(f);
    return f;
  }
  function portOdak(s, p, yakinlik, sure) {
    var h = p.localToWorld(new V3(0, 0, 0));
    return s.kameraGit({ hedef: [h.x, h.y, h.z], yakinlik: yakinlik || 0.32, theta: s._baslangic.theta + 0.25, phi: 1.3 }, sure == null ? 1.1 : sure);
  }

  /* ─────────── Kapak: kablolar takılı arka panel, hafif salınım ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var a = panelSahnesi(kap, { arkaPlan: 'seffaf', dondur: false, kamera: { yon: [0.3, 0.12, 1], pay: 0.86, hedefOfset: [0, -0.6, 0] } });
    [['hdmi', 'hdmi'], ['usba', 'usba3-1'], ['rj45', 'rj45'], ['jak', 'ses-yesil']].forEach(function (x) {
      var f = fisEkle(a.s, x[0]);
      D.fisKonumla(f, port(a.m, x[1]), -f.userData.giris * 0.9);
    });
    var t0 = a.s.orb.theta, z = 0;
    a.s.herKare(function (dt) { if (!AZ) { z += dt; a.s.orb.theta = t0 + Math.sin(z * 0.35) * 0.35; } });
  });

  /* ─────────── Adım 1: portlara dokun, bilgi kartı (E-BILGI) ─────────── */
  D.tembel('#s4-3d', function (kap) {
    var a = panelSahnesi(kap);
    var adlar = a.m.userData.portlar.map(function (p) { return p.name; });
    D.bilgi(a.s, adlar);
    var ilk = true;
    a.s.tiklaninca(function (p) {
      if (!p || !ilk) return;
      ilk = false;
      var not = D.div('don3d-ipucu', a.s.arayuz);
      not.style.bottom = 'auto'; not.style.top = '10px';
      not.textContent = DERS.tahminNotu(1, 'Her portun şekli farklı bir cihaza göre yapılmıştır.', 'Her port farklı bir cihaz ve kablo içindir.');
    });
    if (!AZ) D.siraylaVurgula([port(a.m, 'usba-1'), port(a.m, 'hdmi'), port(a.m, 'rj45'), port(a.m, 'ses-yesil')], { sure: 1.1 });
  });

  /* ─────────── Adım 2: USB-A ters girmez, USB-C iki yönde (A-FIS) ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var a = panelSahnesi(kap, { modelOps: { portlar: ['usba', 'usbc'] }, kamera: { yon: [0.75, 0.42, 1], pay: 1.35 } });
    var pA = a.m.userData.portlar.filter(function (p) { return p.userData.tur === 'usba'; })[0];
    var pC = a.m.userData.portlar.filter(function (p) { return p.userData.tur === 'usbc'; })[0];
    var fA = fisEkle(a.s, 'usba', { kabloUzun: 3 }), fC = fisEkle(a.s, 'usbc', { kabloUzun: 3 });
    D.fisKonumla(fA, pA, 3.5); D.fisKonumla(fC, pC, 3.5);
    var mesaj = DERS.sahneMesaj(a.s), calisiyor = false;
    function usbA() {
      if (calisiyor) return; calisiyor = true;
      mesaj('USB-A ucu ters tutuluyor…', '');
      D.fisTak(fA, pA, { ters: true, cevir: true, bas: 3.5 }).then(function () {
        mesaj('Ters tutunca girmedi. Çevirince yerine oturdu.', 'dogru');
        calisiyor = false;
      });
      D.bekle(1.1, a.s).then(function () { if (calisiyor) mesaj('Girmedi! USB-A tek yönde girer. Çeviriyoruz…', 'yanlis'); });
    }
    function usbC() {
      if (calisiyor) return; calisiyor = true;
      mesaj('USB-C ucu ters tutuluyor…', '');
      D.fisTak(fC, pC, { bas: 3.5 }).then(function () { return D.bekle(0.6, a.s); })
        .then(function () { return D.fisCikar(fC, pC, 3.5); })
        .then(function () { mesaj('Şimdi öbür yüzü üstte…', ''); return D.fisTak(fC, pC, { bas: 3.5, ters: false }); })
        .then(function () { mesaj('USB-C iki yönde de girer.', 'dogru'); calisiyor = false; });
      D.fisKonumla(fC, pC, 3.5, Math.PI);
    }
    a.s.dugme('USB-A dene', 'oynat', usbA, { yer: 'alt-orta', aciklama: 'USB-A ucunu ters tutup takmayı dene' });
    a.s.dugme('USB-C dene', 'oynat', usbC, { yer: 'alt-orta', aciklama: 'USB-C ucunu iki yönde takmayı dene' });
    a.s.dugme('Baştan', 'sifirla', function () {
      if (calisiyor) return;
      D.fisKonumla(fA, pA, 3.5); D.fisKonumla(fC, pC, 3.5); mesaj('');
    }, { yer: 'ust-sag', aciklama: 'Uçları başa al' });
    D.bekle(0.9, a.s).then(usbA);
  });

  /* ─────────── Adım 3: HDMI (A-KAMERA-TUR + A-FIS) ─────────── */
  function portTuru(kapId, adimlar) {
    D.tembel(kapId, function (kap) {
      var a = panelSahnesi(kap);
      var mesaj = DERS.sahneMesaj(a.s), etiketler = [], fisler = [];
      function oynat() {
        etiketler.forEach(function (e) { e.kaldir(); }); etiketler = [];
        fisler.forEach(function (f) { f.parent.remove(f); }); fisler = [];
        mesaj('');
        var z = a.s.kameraGit({ theta: a.s._baslangic.theta, phi: a.s._baslangic.phi, yakinlik: 1, hedef: a.s._baslangic.hedef }, 0.01);
        adimlar.forEach(function (ad) {
          z = z.then(function () {
            var p = port(a.m, ad.port);
            return portOdak(a.s, p, ad.yakinlik).then(function () {
              etiketler.push(a.s.etiket(p, ad.etiket, { tur: 'vurgu', ofset: ad.ofset, yer: ad.yer }));
              mesaj(ad.mesaj, '');
              if (!ad.fis) return D.bekle(1.4, a.s);
              var f = fisEkle(a.s, ad.fis);
              fisler.push(f);
              return D.fisTak(f, p, { bas: 4.5 }).then(function () { return D.bekle(1.2, a.s); });
            });
          });
        });
        z.then(function () { mesaj(adimlar[adimlar.length - 1].son || '', 'dogru'); });
      }
      a.s.dugme('Tekrar oynat', 'tekrar', oynat, { yer: 'alt-orta', aciklama: 'Kamera turunu yeniden oynat' });
      D.bekle(0.6, a.s).then(oynat);
    });
  }
  portTuru('#s6-3d', [
    { port: 'hdmi', etiket: 'HDMI · görüntü + ses', mesaj: 'HDMI: alt köşeleri eğik.', fis: 'hdmi', yakinlik: 0.55 },
    { port: 'dp', etiket: 'DisplayPort · görüntü', mesaj: 'DisplayPort: yalnız bir köşesi eğik.', yakinlik: 0.55, ofset: [0, -1.9, 0], son: 'Monitör kablosu HDMI portuna oturdu.' }
  ]);
  /* ─────────── Adım 4: ses girişleri ─────────── */
  portTuru('#s7-3d', [
    { port: 'ses-yesil', etiket: 'Yeşil · ÇIKIŞ · kulaklık', mesaj: 'Yeşil ÇIKIŞ: hoparlör ya da kulaklık.', yakinlik: 0.5, ofset: [-2.6, 0, 0], yer: 'merkez', fis: 'jak' },
    { port: 'ses-pembe', etiket: 'Pembe · MİK · mikrofon', mesaj: 'Pembe MİK: mikrofon girişi.', yakinlik: 0.5, ofset: [-2.6, 0, 0], yer: 'merkez' },
    { port: 'ses-mavi', etiket: 'Mavi · GİRİŞ · hat', mesaj: 'Mavi GİRİŞ: başka cihazdan ses.', yakinlik: 0.5, ofset: [-2.6, 0, 0], yer: 'merkez', son: 'Kulaklık yeşil ÇIKIŞ’a takıldı.' }
  ]);

  /* ─────────── Adım 5: kablolu, Wi-Fi, Bluetooth (A-DALGA, 2D) ─────────── */
  (function () {
    var kok = document.getElementById('kablosuz');
    if (!kok) return;
    var MOD = {
      kablolu: { ad: 'Kablolu (ağ kablosu)', satir: [['Kablo', 'Gerekir'], ['Menzil', 'Kablo boyu kadar'], ['Bağlantı', 'En sağlam']] },
      wifi: { ad: 'Wi-Fi', satir: [['Kablo', 'Gerekmez'], ['Menzil', 'Ev ya da sınıf boyu'], ['Bağlantı', 'Duvarlar zayıflatır']] },
      bt: { ad: 'Bluetooth', satir: [['Kablo', 'Gerekmez'], ['Menzil', 'Birkaç adım'], ['Bağlantı', 'Yakın cihazlar için']] }
    };
    kok.innerHTML = '<div class="secici" role="group" aria-label="Bağlantı türü"></div>' +
      '<div class="dalga-sahne"><!--@dahil:dalga.svg--></div><div class="dalga-tablo" aria-live="polite"></div>';
    var secici = kok.querySelector('.secici'), svg = kok.querySelector('svg'), tablo = kok.querySelector('.dalga-tablo');
    var dugmeler = {};
    function sec(k) {
      Object.keys(dugmeler).forEach(function (x) { dugmeler[x].setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
      svg.setAttribute('data-mod', k);
      tablo.innerHTML = '<b></b>' + MOD[k].satir.map(function () { return '<div><span></span><strong></strong></div>'; }).join('');
      tablo.firstChild.textContent = MOD[k].ad;
      MOD[k].satir.forEach(function (r, i) {
        var d = tablo.children[i + 1];
        d.firstChild.textContent = r[0]; d.lastChild.textContent = r[1];
      });
    }
    [['kablolu', 'Kablolu'], ['wifi', 'Wi-Fi'], ['bt', 'Bluetooth']].forEach(function (x) {
      dugmeler[x[0]] = DERS.dugme(secici, x[1], function () { sec(x[0]); });
    });
    sec('kablolu');
    var sira = ['kablolu', 'wifi', 'bt'], i = 0, oto = null;
    DERS.slaytAcilinca('s8', function () {
      if (AZ || oto) return;
      oto = setInterval(function () {
        if (!document.getElementById('s8').classList.contains('active')) return;
        i = (i + 1) % 3; sec(sira[i]);
        if (i === 2) { clearInterval(oto); }
      }, 3200);
    });
    secici.addEventListener('click', function () { if (oto) { clearInterval(oto); } oto = 1; });
  })();

  /* ─────────── Adım 6: dizüstü — cihaz seç, portu gör ─────────── */
  D.tembel('#s9-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-0.55, 0.55, 1], pay: 0.72 } });
    var m = s.ekle('M-DIZUSTU');
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.5, maxPolar: 1.45, minYakin: 0.25, maxYakin: 1.3 } });
    var mesaj = DERS.sahneMesaj(s), etiket = null, fis = null, secili = null, dugmeler = [];
    var CIHAZ = [
      ['Monitör', 'hdmi', 'hdmi', 'Monitör → HDMI kablosu → HDMI portu'],
      ['Fare', 'usba-1', 'usba', 'Fare → USB-A ucu → USB-A portu'],
      ['Şarj', 'usbc', 'usbc', 'Şarj aleti → USB-C ucu → USB-C portu'],
      ['Kulaklık', 'ses-yesil', 'jak', 'Kulaklık → ses jakı → ses girişi']
    ];
    function goster(c, b) {
      dugmeler.forEach(function (x) { x.classList.toggle('don3d-dugme--secili', x === b); });
      if (etiket) { etiket.kaldir(); etiket = null; }
      if (fis) { fis.parent.remove(fis); fis = null; }
      if (secili) D.vurguKaldir(secili);
      var p = m.getObjectByName('port-' + c[1]);
      secili = p;
      var h = p.localToWorld(new V3(0, 0, 0));
      var sag = h.x > 0;
      s.kameraGit({ hedef: [h.x, h.y, h.z], theta: sag ? 1.2 : -1.2, phi: 1.15, yakinlik: 0.42 }, 1).then(function () {
        D.vurgula(p, { etiket: false });
        etiket = s.etiket(p, D.PORT_BILGI[p.userData.tur === 'usba' ? 'usba' : c[1].replace(/-\d+$/, '')][0], { tur: 'vurgu' });
        fis = D.model('M-KABLO-UCLARI', { tur: c[2], kabloUzun: 4 });
        s.kok.add(fis);
        return D.fisTak(fis, p, { bas: 5 });
      }).then(function () { mesaj(c[3], 'dogru'); });
    }
    CIHAZ.forEach(function (c) {
      var b = s.dugme(c[0], null, function () { goster(c, b); }, { yer: 'alt-orta', aciklama: c[0] + ' kablosunun takılacağı portu göster' });
      dugmeler.push(b);
    });
    mesaj('Bir cihaz seç.', '');
  });

  /* ─────────── Etkinlik 1: kabloyu doğru porta tak ─────────── */
  var FISLER = [
    { tur: 'hdmi', ad: 'HDMI kablosu', gorev: 0, port: function (p) { return p.userData.tur === 'hdmi'; } },
    { tur: 'usba', ad: 'Klavye (USB-A)', gorev: 1, port: function (p) { return p.userData.tur === 'usba'; } },
    { tur: 'rj45', ad: 'Ağ kablosu', gorev: 2, port: function (p) { return p.userData.tur === 'rj45'; } },
    { tur: 'jak', ad: 'Kulaklık jakı', gorev: 3, port: function (p) { return p.name === 'port-ses-yesil'; } }
  ];
  D.tembel('#s10-3d', function (kap) {
    var a = panelSahnesi(kap, { kamera: { yon: [0.12, 0.12, 1], pay: 0.9 } });
    var mesaj = DERS.sahneMesaj(a.s);
    var tepsi = document.getElementById('fis-tepsi'), gorevler = document.querySelectorAll('#gorevler li');
    var secili = null, fis = null, mesgul = false, dolu = {}, biten = 0, tepsiDugme = {};
    function yuzen() {
      // seçilen fiş panelin önünde, aşağıda bekler
      var P = a.m.userData.olcu;
      fis.quaternion.identity();
      fis.position.set(0, P.H * 0.15, 9);
    }
    function fisSec(f) {
      if (mesgul || f.bitti) return;
      if (fis && !fis.userData.takili) fis.parent.remove(fis);
      secili = f;
      Object.keys(tepsiDugme).forEach(function (k) { tepsiDugme[k].setAttribute('aria-pressed', k === f.tur ? 'true' : 'false'); });
      fis = D.model('M-KABLO-UCLARI', { tur: f.tur, kabloUzun: 5 });
      a.s.kok.add(fis);
      yuzen();
      mesaj(f.ad + ' seçildi. Şimdi doğru porta dokun.', '');
    }
    function neden(f, p) {
      if (f.tur === 'jak' && p.name === 'port-ses-pembe') return 'Pembe giriş mikrofon içindir. Kulaklık yeşil ÇIKIŞ’a takılır.';
      if (f.tur === 'jak' && p.name === 'port-ses-mavi') return 'Mavi giriş ses almak içindir. Kulaklık yeşil ÇIKIŞ’a takılır.';
      if (f.tur === 'hdmi' && p.userData.tur === 'dp') return 'DisplayPort’a benziyor ama köşeleri farklı: HDMI ucu girmez.';
      return D.FIS_BILGI[f.tur][0] + ', ' + (D.PORT_BILGI[p.name.replace('port-', '').replace(/-\d+$/, '')] || [p.userData.etiket])[0] + ' içine girmez: şekli farklı.';
    }
    a.s.tiklaninca(function (p) {
      if (!p || mesgul || !p.name || p.name.indexOf('port-') !== 0) return;
      if (!secili) { mesaj('Önce aşağıdan bir kablo ucu seç.', ''); return; }
      if (dolu[p.name]) { mesaj('Bu port dolu. Başka bir port seç.', 'yanlis'); return; }
      var f = secili, uygun = f.port(p);
      mesgul = true;
      D.fisTak(fis, p, { uygun: uygun, bas: 5, sure: 0.7 }).then(function (takildi) {
        mesgul = false;
        if (!takildi) {
          mesaj('✗ ' + neden(f, p), 'yanlis');
          D.bekle(0.5, a.s).then(function () { if (fis && !fis.userData.takili && secili === f) yuzen(); });
          return;
        }
        fis.userData.takili = true; dolu[p.name] = fis; fis = null;
        f.bitti = true; secili = null; biten++;
        tepsiDugme[f.tur].disabled = true; tepsiDugme[f.tur].setAttribute('aria-pressed', 'false');
        gorevler[f.gorev].classList.add('tamam');
        D.vurgula(p, { etiket: false, sure: 0.3 });
        D.bekle(0.8, a.s).then(function () { D.vurguKaldir(p); });
        if (biten === FISLER.length) { mesaj('✔ Hepsi doğru! Bilgisayar monitöre, klavyeye, internete ve kulaklığa bağlandı.', 'dogru'); DERS.konfeti(); }
        else mesaj('✔ Doğru port! Sıradaki kabloyu seç.', 'dogru');
      });
    });
    FISLER.forEach(function (f) {
      var b = DERS.dugme(tepsi, '', function () { fisSec(f); }, 'fis-sec');
      b.innerHTML = '<span class="fis-simge fis-simge--' + f.tur + '" aria-hidden="true"></span><span></span>';
      b.lastChild.textContent = f.ad;
      b.setAttribute('aria-pressed', 'false');
      tepsiDugme[f.tur] = b;
    });
    a.s.dugme('Baştan', 'sifirla', function () {
      if (mesgul) return;
      Object.keys(dolu).forEach(function (k) { dolu[k].parent.remove(dolu[k]); });
      if (fis) fis.parent.remove(fis);
      dolu = {}; fis = null; secili = null; biten = 0;
      FISLER.forEach(function (f) { f.bitti = false; tepsiDugme[f.tur].disabled = false; tepsiDugme[f.tur].setAttribute('aria-pressed', 'false'); });
      gorevler.forEach(function (li) { li.classList.remove('tamam'); });
      mesaj('Bir kablo ucu seç.', '');
    }, { yer: 'ust-sag', aciklama: 'Etkinliği baştan başlat' });
    mesaj('Bir kablo ucu seç.', '');
  });

  /* ─────────── Etkinlik 2: cihazı portuna yerleştir (E-SINIFLA) ─────────── */
  D.tembel('#sinifla-port', function (kap) {
    D.sinifla(kap, {
      onIlerleme: DERS.ilerlemeBagla('ilerleme-2'),
      kutular: [
        { id: 'usb', ad: 'USB', aciklama: 'Klavye, bellek', renk: '#0ea5e9', resim: '<!--@dahil:oz-2.svg-->' },
        { id: 'hdmi', ad: 'HDMI', aciklama: 'Görüntü + ses', renk: '#f59e0b', resim: '<!--@dahil:oz-3.svg-->' },
        { id: 'ses', ad: 'Ses jakı', aciklama: 'Yeşil / pembe', renk: '#10b981', resim: '<!--@dahil:oz-4.svg-->' },
        { id: 'kablosuz', ad: 'Kablosuz', aciklama: 'Bluetooth', renk: '#8b5cf6', resim: '<!--@dahil:kutu-kablosuz.svg-->' }
      ],
      ogeler: [
        { id: 'klavye', ad: 'Klavye', model: 'M-KLAVYE', kutu: 'usb', ipucu: 'Klavye kablosunun ucu USB-A’dır.' },
        { id: 'monitor', ad: 'Monitör', model: 'M-MONITOR', kutu: 'hdmi', ipucu: 'Monitöre görüntü HDMI kablosuyla gider.' },
        { id: 'kulaklik', ad: 'Kablolu kulaklık', svg: '<!--@dahil:is-kulaklik.svg-->', kutu: 'ses', ipucu: 'Kulaklığın yuvarlak jakı yeşil ÇIKIŞ’a takılır.' },
        { id: 'bt', ad: 'Kablosuz kulaklık', svg: '<!--@dahil:is-kablosuz-kulaklik.svg-->', kutu: 'kablosuz', ipucu: 'Kablosu yok; Bluetooth ile bağlanır.' },
        { id: 'usb', ad: 'USB bellek', svg: '<!--@dahil:is-usb.svg-->', kutu: 'usb', ipucu: 'USB bellek adını takıldığı porttan alır.' },
        { id: 'tv', ad: 'Televizyon', svg: '<!--@dahil:is-televizyon.svg-->', kutu: 'hdmi', ipucu: 'Televizyona görüntü ve ses HDMI ile gider.' },
        { id: 'mikrofon', ad: 'Mikrofon', svg: '<!--@dahil:is-mikrofon.svg-->', kutu: 'ses', ipucu: 'Mikrofon pembe MİK girişine takılır.' },
        { id: 'hoparlor', ad: 'Bluetooth hoparlör', svg: '<!--@dahil:is-bt-hoparlor.svg-->', kutu: 'kablosuz', ipucu: 'Adı üstünde: Bluetooth ile kablosuz bağlanır.' }
      ],
      bitisMetni: 'Harika! Her cihazı doğru bağlantıyla eşleştirdin.'
    });
  });
})();
