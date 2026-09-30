/* DON-201 H14 — Proje: Bilgisayar Kimlik Kartı · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 1’de ekranda birlikte göreceğiz.');

  /* ═══════════ Yardımcılar ═══════════ */
  function el(etiket, sinif, ebeveyn, html) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (html != null) e.innerHTML = html;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function yazi(e, t) { e.textContent = t; return e; }
  /* Sıralı zamanlayıcı: yeniden oynatınca eskisi iptal olur. adimlar: [[saniye, fn], …] */
  function zamanlayici() {
    var no = 0;
    return {
      oynat: function (adimlar) {
        no++;
        var bu = no, t = 0;
        adimlar.forEach(function (a) {
          t += a[0];
          setTimeout(function () { if (bu === no) a[1](); }, AZ ? 10 : Math.round(t * 1000));
        });
      },
      durdur: function () { no++; }
    };
  }
  function oynatDugmesi(kok, fn) {
    var alt = el('div', 'kv-alt', kok);
    var b = el('button', 'kv-oynat', alt);
    b.type = 'button';
    b.innerHTML = D.simge('oynat') + '<span>Oynat</span>';
    b.addEventListener('click', fn);
    var sonuc = el('div', 'panel-sonuc', alt);
    sonuc.setAttribute('aria-live', 'polite');
    return { dugme: b, sonuc: sonuc, bitti: function () { b.innerHTML = D.simge('tekrar') + '<span>Tekrarla</span>'; } };
  }
  function secici(kok, etiket, secenekler, fn) {
    var s = el('div', 'secici', kok);
    s.setAttribute('role', 'group');
    s.setAttribute('aria-label', etiket);
    var dugmeler = secenekler.map(function (x, i) {
      var b = DERS.dugme(s, x, function () { sec(i); fn(i); });
      b.setAttribute('aria-pressed', 'false');
      return b;
    });
    function sec(i) { dugmeler.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); }); }
    return { sec: sec, dugmeler: dugmeler };
  }
  function sayiMetin(n) { return String(n).replace('.', ','); }

  /* ═══════════ Ortak kural motoru: “Ne için uygun?” ═══════════
     Öğrenci düzeyinde, abartısız basit kurallar. Değer eksikse sonuç null. */
  var ISLER = [
    { id: 'odev', ad: 'Ödev ve ofis', kisa: 'Ödev',
      simge: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h7M9 17h5"/>', ipucu: 'RAM’e bak.', eksik: 'önce RAM’i gir.' },
    { id: 'cizim', ad: 'Çizim ve fotoğraf', kisa: 'Çizim',
      simge: '<path d="M4 20l4-1 10-10-3-3L5 16z"/><path d="M13 7l3 3"/><circle cx="18" cy="18" r="2.5"/>', ipucu: 'RAM’e, çekirdeğe ve depolama türüne bak.', eksik: 'önce RAM, çekirdek ve depolama türünü gir.' },
    { id: 'oyun', ad: 'Oyun', kisa: 'Oyun',
      simge: '<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="15.5" cy="11.5" r="1"/><circle cx="17.5" cy="14" r="1"/>', ipucu: 'Önce ekran kartına, sonra RAM’e bak.', eksik: 'önce RAM, çekirdek ve ekran kartını gir.' },
    { id: 'kod', ad: 'Programlama', kisa: 'Kodlama',
      simge: '<polyline points="8 7 3 12 8 17"/><polyline points="16 7 21 12 16 17"/><path d="M13.5 5l-3 14"/>', ipucu: 'RAM’e bak.', eksik: 'önce RAM’i gir.' }
  ];
  var SEVIYE = [
    { ad: 'Zorlanır', isaret: '✗', sinif: 'rz-z' },
    { ad: 'İdare eder', isaret: '~', sinif: 'rz-i' },
    { ad: 'Uygun', isaret: '✓', sinif: 'rz-u' }
  ];
  function isSimge(is) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + is.simge + '</svg>';
  }
  function degerlendir(d) {
    var r = {}, ram = d.ram, cek = d.cekirdek;
    // Ödev ve ofis: RAM belirleyici
    if (!ram) r.odev = null;
    else if (ram <= 2) r.odev = { s: 0, neden: 'RAM çok az; tarayıcı ve belge birlikte zor açılır.' };
    else if (ram < 8) r.odev = { s: 1, neden: ram + ' GB RAM ile belge yazılır ama çok sekme açınca yavaşlar.' };
    else r.odev = { s: 2, neden: ram + ' GB RAM belge, sunum ve tarayıcıya yeter.' };
    // Çizim ve fotoğraf: RAM + çekirdek + depolama türü
    if (!ram || !cek || !d.disk) r.cizim = null;
    else if (ram < 8) r.cizim = { s: 0, neden: 'çizim ve fotoğraf programları için 8 GB RAM önerilir.' };
    else if (d.disk === 'HDD') r.cizim = { s: 1, neden: 'RAM yeterli ama HDD büyük dosyaları yavaş açar.' };
    else if (cek < 4) r.cizim = { s: 1, neden: 'RAM yeterli ama 2 çekirdek büyük resimlerde yavaş kalır.' };
    else r.cizim = { s: 2, neden: ram + ' GB RAM, ' + cek + ' çekirdek ve SSD büyük dosyaları rahat açar.' };
    // Oyun: ekran kartı + RAM + çekirdek
    if (!ram || !cek || !d.gpu) r.oyun = null;
    else if (d.gpu === 'harici') {
      if (ram < 8) r.oyun = { s: 0, neden: 'RAM az; ekran kartı olsa da oyunlar takılır.' };
      else if (ram < 16) r.oyun = { s: 1, neden: 'harici ekran kartı var ama yeni oyunlar çoğunlukla 16 GB RAM ister.' };
      else if (cek < 4) r.oyun = { s: 1, neden: 'harici ekran kartı var ama 2 çekirdek yeni oyunlarda yetmez.' };
      else r.oyun = { s: 2, neden: 'harici ekran kartı ve ' + ram + ' GB RAM çoğu oyunu akıcı çalıştırır.' };
    } else {
      if (ram < 8) r.oyun = { s: 0, neden: 'tümleşik ekran kartı ve az RAM ile oyunlar takılır.' };
      else r.oyun = { s: 1, neden: 'basit oyunlar çalışır; 3D oyunlar için harici ekran kartı gerekir.' };
    }
    // Programlama: RAM belirleyici
    if (!ram) r.kod = null;
    else if (ram <= 2) r.kod = { s: 0, neden: 'RAM çok az; kod editörü ile tarayıcı birlikte zor açılır.' };
    else if (ram < 8) r.kod = { s: 1, neden: 'blok kodlama ve basit Python olur; çok program açınca yavaşlar.' };
    else r.kod = { s: 2, neden: ram + ' GB RAM kod editörünü ve tarayıcıyı birlikte rahat açar.' };
    return r;
  }
  function rozet(sonuc) {
    if (!sonuc) return '<span class="rz rz-bos">? Değer eksik</span>';
    var v = SEVIYE[sonuc.s];
    return '<span class="rz ' + v.sinif + '"><b aria-hidden="true">' + v.isaret + '</b> ' + v.ad + '</span>';
  }

  /* Örnek bilgisayarlar (prova, Etkinlik 2, Derinleş) */
  var ORNEK = {
    sinif: { ad: 'Sınıf-3 Bilgisayarı', islemci: '2,40 GHz', cekirdek: 4, ram: 8, disk: 'SSD', boyut: 238, gpu: 'harici', isletim: '64 bit', usb: 9, goruntu: 2, ag: 1, ses: 5 },
    A: { ad: 'Bilgisayar A', islemci: '2,00 GHz', cekirdek: 2, ram: 4, disk: 'HDD', boyut: 500, gpu: 'tumlesik', isletim: '64 bit', usb: 6, goruntu: 1, ag: 1, ses: 3 },
    B: { ad: 'Bilgisayar B', islemci: '2,60 GHz', cekirdek: 4, ram: 8, disk: 'SSD', boyut: 256, gpu: 'tumlesik', isletim: '64 bit', usb: 8, goruntu: 2, ag: 1, ses: 3 },
    C: { ad: 'Bilgisayar C', islemci: '3,20 GHz', cekirdek: 6, ram: 16, disk: 'SSD', boyut: 512, gpu: 'harici', isletim: '64 bit', usb: 10, goruntu: 3, ag: 1, ses: 5 }
  };
  function diskMetin(d) {
    if (!d.disk) return '—';
    if (!d.boyut) return d.disk;
    return d.disk + ' · ' + (d.boyut >= 1000 ? sayiMetin(Math.round(d.boyut / 100) / 10) + ' TB' : d.boyut + ' GB');
  }
  function gpuMetin(d) { return d.gpu === 'harici' ? 'Harici ekran kartı' : (d.gpu === 'tumlesik' ? 'Tümleşik (işlemcide)' : '—'); }
  function portToplam(d) { return (d.usb || 0) + (d.goruntu || 0) + (d.ag || 0) + (d.ses || 0); }
  function portMetin(d) { return 'USB ' + (d.usb || 0) + ' · Görüntü ' + (d.goruntu || 0) + ' · Ağ ' + (d.ag || 0) + ' · Ses ' + (d.ses || 0); }

  /* Kasa modelini kart değerlerine göre ayarlar: HDD daha kalın (3,5"), tümleşikte ekran kartı yok. */
  function kasaUyarla(kasa, d) {
    var gk = kasa.getObjectByName('ekran-karti'), dp = kasa.getObjectByName('depolama');
    if (gk) gk.visible = d.gpu !== 'tumlesik';
    if (dp) {
      if (dp.userData.y0 == null) dp.userData.y0 = dp.position.y;
      if (d.disk === 'HDD') { dp.scale.set(1.45, 3.7, 1.47); dp.position.y = dp.userData.y0 + 0.95; }
      else { dp.scale.set(1, 1, 1); dp.position.y = dp.userData.y0; }
    }
  }
  /* Karttaki değerlerin 3D parçadaki etiket metinleri */
  function parcaEtiketleri(d) {
    return [
      ['islemci', d.cekirdek ? 'İşlemci · ' + (d.cekirdek >= 8 ? '8+' : d.cekirdek) + ' çekirdek' : (d.islemci ? 'İşlemci' : null)],
      ['ram', d.ram ? 'RAM · ' + d.ram + ' GB' : null],
      ['depolama', d.disk ? diskMetin(d) : null],
      ['ekran-karti', d.gpu === 'harici' ? 'Ekran kartı · harici' : null],
      ['arka-panel', d.port ? 'Portlar · ' + portToplam(d) : null]
    ];
  }
  var ETIKET_YER = {
    'islemci': { yer: 'merkez', ofset: [0, 3, -3] },
    'ram': { yer: 'merkez', ofset: [-2, -3.5, 3] },
    'depolama': { yer: 'alt', ofset: [0, -1.5, 0] },
    'ekran-karti': { yer: 'merkez', ofset: [-4, -1, 6] },
    'arka-panel': { yer: 'ust', ofset: [0, 3, -2] }
  };
  function fanlariDondur(s, kasa) {
    var f = kasa.userData.fanlar || [];
    if (AZ) return;
    s.herKare(function (dt) { f.forEach(function (r) { r.rotation.z += 9 * dt; }); });
  }

  /* 3D prova yardımcısı: altyazı + Oynat/Tekrarla (hareket azaltmada Adım adım) */
  function prova(s, adimlar, ops) {
    ops = ops || {};
    var alt = D.div('u-altyazi', s.arayuz);
    alt.setAttribute('aria-live', 'polite');
    var calisiyor = false, sira = 0;
    var btn = s.dugme('Oynat', 'oynat', function () { oynat(); }, { yer: 'alt-sol', sinif: 'don3d-dugme--birincil', aciklama: 'Provayı oynat' });
    if (AZ) s.dugme('Adım adım', 'adim', function () { adim(); }, { yer: 'alt-sol', aciklama: 'Provanın sonraki adımını göster' });
    function yaz(i) { alt.textContent = (i + 1) + '. ' + adimlar[i].metin; }
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
        z = z.then(function () { yaz(i); return D.bekle(0.4, s); })
          .then(function () { return a.calis(); })
          .then(function () { return D.bekle(0.6, s); });
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
    if (!AZ) D.bekle(0.6, s).then(oynat);
    return { oynat: oynat };
  }

  /* ═══════════ Kapak: dönen kasa ═══════════ */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 34,
      kamera: { yon: [-0.9, 0.42, 1], pay: 1.08 } });
    var kasa = s.ekle('M-MASAUSTU');
    s.yerlestir();
    fanlariDondur(s, kasa);
  });

  /* ═══════════ Adım 1: sistem bilgisi ekranları (2D, marka-nötr) ═══════════ */
  (function () {
    var kok = document.getElementById('p-sistem');
    if (!kok) return;
    kok.classList.add('ss');
    var MODLAR = ['Hakkında', 'Görev Yöneticisi', 'dxdiag'];
    var sec = secici(kok, 'Hangi ekran?', MODLAR, function (i) { mod = i; kur(); oyna(); });
    var pencere = el('div', 'ss-pencere', kok);
    var bar = el('div', 'ss-bar', pencere, '<span class="ss-nokta"></span><span class="ss-nokta"></span><span class="ss-nokta"></span><b></b><span class="ss-yol"></span>');
    var ic = el('div', 'ss-ic', pencere);
    var imlec = el('div', 'ss-imlec', pencere, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l15 11-7 1-4 7z" fill="#0f172a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>');
    var alt = oynatDugmesi(kok, function () { oyna(); });
    var z = zamanlayici(), mod = 0;
    var menu, icerik;

    function baslik(t, yol) { bar.querySelector('b').textContent = t; bar.querySelector('.ss-yol').textContent = yol || ''; }
    function imlecGit(hedef) {
      var p = pencere.getBoundingClientRect(), r = hedef.getBoundingClientRect();
      imlec.style.opacity = '1';
      imlec.style.transform = 'translate(' + Math.round(r.left - p.left + Math.min(r.width * 0.72, 150)) + 'px,' + Math.round(r.top - p.top + r.height * 0.55) + 'px)';
    }
    function tikla(hedef) {
      hedef.classList.remove('ss-tik'); void hedef.offsetWidth; hedef.classList.add('ss-tik');
    }
    function satirlar(liste) {
      return '<dl class="ss-satirlar">' + liste.map(function (x, i) {
        return '<div class="ss-satir" data-i="' + i + '"><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd><span class="ss-not"></span></div>';
      }).join('') + '</dl>';
    }
    function vurgula(i, not) {
      var sat = icerik.querySelector('.ss-satir[data-i="' + i + '"]');
      if (!sat) return;
      sat.classList.add('vurgu');
      sat.querySelector('.ss-not').textContent = not;
    }
    function menuKur(ogeler) {
      menu.innerHTML = ogeler.map(function (m) { return '<div class="ss-oge"><i></i><span>' + m + '</span></div>'; }).join('');
      return menu.querySelectorAll('.ss-oge');
    }
    function kur() {
      z.durdur();
      sec.sec(mod);
      ic.innerHTML = '<div class="ss-menu"></div><div class="ss-icerik"></div>';
      menu = ic.querySelector('.ss-menu'); icerik = ic.querySelector('.ss-icerik');
      imlec.style.transition = 'none'; imlec.style.opacity = '0'; imlec.style.transform = 'translate(40px,40px)';
      void imlec.offsetWidth; imlec.style.transition = '';
      alt.sonuc.className = 'panel-sonuc';
      if (mod === 0) {
        baslik('Ayarlar', '');
        menuKur(['Sistem', 'Bluetooth ve cihazlar', 'Ağ ve internet', 'Kişiselleştirme', 'Uygulamalar']);
        icerik.innerHTML = '<div class="ss-bas">Ana sayfa</div><div class="ss-bos"></div><div class="ss-bos k"></div><div class="ss-bos"></div>';
        alt.sonuc.textContent = 'Başlat › Ayarlar açık.';
      } else if (mod === 1) {
        baslik('Görev Yöneticisi', '› Performans');
        menuKur(['CPU', 'Bellek', 'Disk 0 (C:)', 'Ağ', 'GPU 0']);
        icerik.innerHTML = '<div class="ss-bas">Performans</div><div class="ss-grafik"></div>';
        alt.sonuc.textContent = 'Ctrl + Shift + Esc ile açılır.';
      } else {
        baslik('Çalıştır', '');
        menu.style.display = 'none';
        icerik.innerHTML = '<div class="ss-calistir"><span>Aç:</span><span class="ss-kutu"><b class="ss-yaz"></b><i class="ss-imlec-cizgi"></i></span><span class="ss-tamam">Tamam</span></div>';
        alt.sonuc.textContent = 'Win + R tuşlarına bas.';
      }
    }
    function oyna() {
      kur();
      alt.bitti();
      var o;
      if (mod === 0) {
        o = [
          [0.5, function () { imlecGit(menu.children[0]); }],
          [0.8, function () {
            tikla(menu.children[0]); menu.children[0].classList.add('secili');
            icerik.innerHTML = '<div class="ss-bas">Sistem</div><div class="ss-liste">' + ['Ekran', 'Ses', 'Bildirimler', 'Depolama', 'Hakkında'].map(function (x) {
              return '<div class="ss-oge2">' + x + '<span>›</span></div>'; }).join('') + '</div>';
            baslik('Ayarlar', '› Sistem');
            alt.sonuc.textContent = '1. Sistem’e gir.';
          }],
          [0.9, function () { imlecGit(icerik.querySelectorAll('.ss-oge2')[4]); }],
          [0.8, function () {
            tikla(icerik.querySelectorAll('.ss-oge2')[4]);
            baslik('Ayarlar', '› Sistem › Hakkında');
            icerik.innerHTML = '<div class="ss-bas">Hakkında</div><div class="ss-alt">Cihaz belirtimleri</div>' + satirlar([
              ['Cihaz adı', 'SINIF3-PC'], ['İşlemci', 'Model adı · 2,40 GHz'], ['Yüklü RAM', '8,00 GB'], ['Sistem türü', '64 bit işletim sistemi']]);
            alt.sonuc.textContent = '2. Hakkında sayfası açıldı.';
          }],
          [1.0, function () { imlecGit(icerik.querySelector('.ss-satir[data-i="1"]')); vurgula(1, 'İşlemci'); alt.sonuc.textContent = '3. İşlemcinin adı ve hızı.'; }],
          [1.4, function () { imlecGit(icerik.querySelector('.ss-satir[data-i="2"]')); vurgula(2, 'RAM · 8 GB'); alt.sonuc.textContent = '4. Yüklü RAM: 8 GB.'; }],
          [1.4, function () { vurgula(3, '64 bit'); }],
          [1.0, function () {
            alt.sonuc.className = 'panel-sonuc iyi';
            alt.sonuc.textContent = DERS.tahminNotu(1, 'Kasayı açmadan ekrandan okudun.', 'En kolay yol ekrandan okumak; kasayı açmaya gerek yok.');
          }]
        ];
      } else if (mod === 1) {
        var ogeler = menu.children;
        o = [
          [0.5, function () { imlecGit(ogeler[0]); }],
          [0.7, function () {
            tikla(ogeler[0]); ogeler[0].classList.add('secili');
            icerik.innerHTML = '<div class="ss-bas">CPU</div>' + satirlar([['Hız', '2,40 GHz'], ['Çekirdekler', '4'], ['Mantıksal işlemciler', '8']]);
            vurgula(1, '4 çekirdek'); alt.sonuc.textContent = 'CPU: çekirdek sayısı burada.';
          }],
          [1.6, function () { imlecGit(ogeler[2]); }],
          [0.7, function () {
            tikla(ogeler[2]); ogeler[0].classList.remove('secili'); ogeler[2].classList.add('secili');
            icerik.innerHTML = '<div class="ss-bas">Disk 0 (C:)</div>' + satirlar([['Tür', 'SSD'], ['Kapasite', '238 GB'], ['Etkin süre', '%2']]);
            vurgula(0, 'SSD'); vurgula(1, '238 GB'); alt.sonuc.textContent = 'Disk: türü ve kapasitesi.';
          }],
          [1.6, function () { imlecGit(ogeler[4]); }],
          [0.7, function () {
            tikla(ogeler[4]); ogeler[2].classList.remove('secili'); ogeler[4].classList.add('secili');
            icerik.innerHTML = '<div class="ss-bas">GPU 0</div>' + satirlar([['Ad', 'Model adı'], ['Kullanım', '%3']]);
            vurgula(0, 'Ekran kartı');
            alt.sonuc.className = 'panel-sonuc iyi';
            alt.sonuc.textContent = 'GPU 0: ekran kartının adı. Emin değilsen öğretmenine sor.';
          }]
        ];
      } else {
        var yaz = icerik.querySelector('.ss-yaz'), metin = 'dxdiag';
        o = [[0.5, function () { alt.sonuc.textContent = 'dxdiag yaz, Enter’a bas.'; }]];
        metin.split('').forEach(function (h, i) { o.push([0.18, function () { yaz.textContent = metin.slice(0, i + 1); }]); });
        o.push([0.6, function () { var t = icerik.querySelector('.ss-tamam'); imlecGit(t); }]);
        o.push([0.7, function () {
          tikla(icerik.querySelector('.ss-tamam'));
          menu.style.display = '';
          baslik('Tanılama aracı (dxdiag)', '');
          menuKur(['Sistem', 'Ekran', 'Ses']);
          menu.children[0].classList.add('secili');
          icerik.innerHTML = '<div class="ss-bas">Sistem bilgileri</div>' + satirlar([['İşletim sistemi', '64 bit'], ['İşlemci', 'Model adı · 2,40 GHz'], ['Bellek', '8192 MB RAM']]);
          vurgula(2, '8192 MB = 8 GB'); alt.sonuc.textContent = 'Bellek MB ile yazılır: 8192 MB = 8 GB.';
        }]);
        o.push([2.0, function () { imlecGit(menu.children[1]); }]);
        o.push([0.7, function () {
          tikla(menu.children[1]); menu.children[0].classList.remove('secili'); menu.children[1].classList.add('secili');
          icerik.innerHTML = '<div class="ss-bas">Ekran</div>' + satirlar([['Aygıt adı', 'Model adı'], ['Ekran belleği', '4096 MB']]);
          vurgula(0, 'Ekran kartı');
          alt.sonuc.className = 'panel-sonuc iyi';
          alt.sonuc.textContent = 'Ekran sekmesinde ekran kartının adı yazar.';
        }]);
      }
      z.oynat(o);
    }
    kur();
    DERS.slaytAcilinca('s4', function () { oyna(); });
  })();

  /* ═══════════ Adım 2: tabloyu doldur (2D) ═══════════ */
  (function () {
    var kok = document.getElementById('p-tablo');
    if (!kok) return;
    kok.classList.add('tb');
    var KAYNAK = [['hk', 'Hakkında'], ['gy', 'Görev Yöneticisi'], ['ap', 'Arka panel']];
    var SATIR = [
      ['İşlemci', '2,40 GHz · ', '4 çekirdek', 'gy'],
      ['RAM', '8 ', 'GB', 'hk'],
      ['Depolama', 'SSD · 238 ', 'GB', 'gy'],
      ['Ekran kartı', 'Harici', '', 'gy'],
      ['İşletim sistemi', '64 ', 'bit', 'hk'],
      ['Portlar', 'Adım 3’te sayılacak', '', 'ap']
    ];
    var kay = el('div', 'tb-kaynak', kok);
    KAYNAK.forEach(function (k) { var c = el('span', 'tb-cip', kay); c.dataset.k = k[0]; c.textContent = k[1]; });
    var tablo = el('table', 'tb-tablo', kok, '<thead><tr><th>Özellik</th><th>Değer</th></tr></thead><tbody></tbody>');
    var govde = tablo.querySelector('tbody');
    SATIR.forEach(function (x) { el('tr', '', govde, '<th scope="row">' + x[0] + '</th><td><span class="tb-deger"></span><span class="tb-isaret"></span></td>'); });
    var alt = oynatDugmesi(kok, function () { oyna(); });
    var z = zamanlayici();
    function sifirla() {
      z.durdur();
      govde.querySelectorAll('tr').forEach(function (tr) { tr.className = ''; tr.querySelector('.tb-deger').innerHTML = ''; tr.querySelector('.tb-isaret').textContent = ''; });
      kay.querySelectorAll('.tb-cip').forEach(function (c) { c.classList.remove('aktif'); });
      alt.sonuc.className = 'panel-sonuc'; alt.sonuc.textContent = 'Değerleri ekrandan tabloya taşı.';
    }
    function cip(k) { kay.querySelectorAll('.tb-cip').forEach(function (c) { c.classList.toggle('aktif', c.dataset.k === k); }); }
    function oyna() {
      sifirla();
      alt.bitti();
      var o = [];
      SATIR.forEach(function (x, i) {
        var tr = govde.children[i], d = tr.querySelector('.tb-deger'), is = tr.querySelector('.tb-isaret');
        o.push([0.5, function () { cip(x[3]); tr.className = 'simdi'; }]);
        if (i === 1) {
          // Yaygın hata: birimsiz sayı
          o.push([0.5, function () { d.textContent = '8'; }]);
          o.push([0.6, function () { tr.className = 'hata'; is.textContent = '✗ Birim yok'; alt.sonuc.className = 'panel-sonuc kotu'; alt.sonuc.textContent = '“8” ne? 8 GB mı, 8 çekirdek mi?'; }]);
          o.push([1.6, function () { d.innerHTML = '8 <mark>GB</mark>'; tr.className = 'tamam'; is.textContent = '✓'; alt.sonuc.className = 'panel-sonuc'; alt.sonuc.textContent = 'Birim eklendi: 8 GB.'; }]);
          return;
        }
        o.push([0.6, function () {
          d.innerHTML = x[1] + (x[2] ? '<mark>' + x[2] + '</mark>' : '');
          tr.className = 'tamam'; is.textContent = x[3] === 'ap' ? '…' : '✓';
        }]);
      });
      o.push([0.8, function () {
        cip('');
        alt.sonuc.className = 'panel-sonuc iyi';
        alt.sonuc.textContent = '238 GB görünmesi normal: sistem 1024’lük birim kullanır.';
      }]);
      z.oynat(o);
    }
    sifirla();
    DERS.slaytAcilinca('s5', function () { oyna(); });
  })();

  /* ═══════════ Adım 3: portları say (3D arka panel) ═══════════ */
  D.tembel('#s6-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.22, 0.28, 1], pay: 1.02, hedefOfset: [0, -0.8, 0] } });
    s.ekle('M-ARKA-PANEL');
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.9, maxPolar: 1.5, minYakin: 0.55, maxYakin: 1.3, yatay: 0.9 } });
    var GRUP = [
      ['USB', ['port-usba-1', 'port-usba-2', 'port-usbc', 'port-usba3-1', 'port-usba3-2', 'port-usba3-3', 'port-usba3-4'], 'USB portlarını say: A ve C türü.'],
      ['Görüntü', ['port-hdmi', 'port-dp'], 'Görüntü portları: HDMI ve DisplayPort.'],
      ['Ağ', ['port-rj45'], 'Ağ portu (RJ45).'],
      ['Ses', ['port-ses-mavi', 'port-ses-yesil', 'port-ses-pembe'], 'Ses girişleri: yuvarlak jaklar.']
    ];
    var serit = D.div('sayac-serit', s.arayuz);
    var cipler = GRUP.map(function (g) {
      var c = D.div('sayac-cip', serit);
      c.innerHTML = '<span>' + g[0] + '</span><b>0</b>';
      return c;
    });
    var topl = D.div('sayac-cip toplam', serit);
    topl.innerHTML = '<span>Toplam</span><b>0</b>';
    var sayilar = [0, 0, 0, 0], etiketler = [];
    function yaz() {
      cipler.forEach(function (c, i) { c.querySelector('b').textContent = sayilar[i]; });
      topl.querySelector('b').textContent = sayilar.reduce(function (a, b) { return a + b; }, 0);
    }
    function sifirla() {
      etiketler.forEach(function (e) { e.kaldir(); }); etiketler = [];
      GRUP.forEach(function (g) { g[1].forEach(function (ad) { var p = s.parca(ad); if (p) D.vurguKaldir(p, 0); }); });
      cipler.forEach(function (c) { c.classList.remove('aktif', 'bitti'); });
      topl.classList.remove('bitti');
      sayilar = [0, 0, 0, 0]; yaz();
      var on = serit.querySelector('.sayac-on'); if (on) on.remove();
    }
    var adimlar = GRUP.map(function (g, gi) {
      return { metin: g[2], calis: function () {
        cipler[gi].classList.add('aktif');
        var zincir = Promise.resolve();
        g[1].forEach(function (ad) {
          zincir = zincir.then(function () {
            var p = s.parca(ad);
            if (!p) return;
            sayilar[gi]++; yaz();
            etiketler.push(s.etiket(p, String(sayilar[gi]), { tur: 'vurgu', yer: 'merkez', ofset: [0, 0.9, 0] }));
            return D.vurgula(p, { etiket: false, sure: 0.2 }).then(function () { return D.bekle(0.3, s); });
          });
        });
        return zincir.then(function () {
          cipler[gi].classList.remove('aktif'); cipler[gi].classList.add('bitti');
          return D.bekle(0.4, s);
        });
      } };
    });
    adimlar.push({ metin: 'Ön paneli de ekle: 2 USB ve 2 ses girişi.', calis: function () {
      var on = D.div('sayac-on', serit);
      on.textContent = '+ Ön panel: 2 USB, 2 ses';
      sayilar[0] += 2; sayilar[3] += 2; yaz();
      topl.classList.add('bitti');
      return D.bekle(1.2, s);
    } });
    prova(s, adimlar, { sifirla: sifirla });
    yaz();
  });

  /* ═══════════ Adım 4: ne için uygun? (2D kural gösterimi) ═══════════ */
  (function () {
    var kok = document.getElementById('p-uygun');
    if (!kok) return;
    kok.classList.add('uy');
    var PROFIL = ['A', 'B', 'C'];
    var sec = secici(kok, 'Örnek bilgisayar', PROFIL.map(function (p) { return 'Bilgisayar ' + p; }), function (i) { secili = i; oyna(); });
    var ozet = el('div', 'uy-degerler', kok);
    var liste = el('div', 'uy-isler', kok);
    ISLER.forEach(function (is) {
      el('div', 'uy-is', liste, '<span class="uy-simge">' + isSimge(is) + '</span><span class="uy-ad">' + is.ad + '</span><span class="uy-rz"></span><span class="uy-neden"></span>');
    });
    var alt = oynatDugmesi(kok, function () { oyna(); });
    var z = zamanlayici(), secili = 0;
    function oyna() {
      var d = ORNEK[PROFIL[secili]], r = degerlendir(d);
      sec.sec(secili);
      alt.bitti();
      ozet.innerHTML = '<span><small>RAM</small><b>' + d.ram + ' GB</b></span><span><small>Depolama</small><b>' + d.disk + '</b></span>' +
        '<span><small>Çekirdek</small><b>' + d.cekirdek + '</b></span><span><small>Ekran kartı</small><b>' + (d.gpu === 'harici' ? 'Harici' : 'Tümleşik') + '</b></span>';
      var satir = liste.children;
      for (var i = 0; i < satir.length; i++) { satir[i].classList.remove('gor'); satir[i].querySelector('.uy-rz').innerHTML = ''; satir[i].querySelector('.uy-neden').textContent = ''; }
      alt.sonuc.className = 'panel-sonuc';
      alt.sonuc.textContent = 'Üç değere bak: RAM, depolama türü, ekran kartı.';
      var o = [];
      ISLER.forEach(function (is, i) {
        o.push([0.9, function () {
          satir[i].classList.add('gor');
          satir[i].querySelector('.uy-rz').innerHTML = rozet(r[is.id]);
          satir[i].querySelector('.uy-neden').textContent = 'çünkü ' + r[is.id].neden;
        }]);
      });
      o.push([0.8, function () {
        var en = ISLER.filter(function (is) { return r[is.id].s === 2; }).map(function (is) { return is.kisa.toLowerCase(); });
        alt.sonuc.className = 'panel-sonuc iyi';
        alt.sonuc.textContent = en.length ? 'Bilgisayar ' + PROFIL[secili] + ': ' + en.join(', ') + ' için uygun.' : 'Bilgisayar ' + PROFIL[secili] + ' hiçbir işte tam uygun değil.';
      }]);
      z.oynat(o);
    }
    sec.sec(0);
    DERS.slaytAcilinca('s7', function () { oyna(); });
  })();

  /* ═══════════ Adım 5: A-VURGU — model etiketlenir, kart yüzüne yerleşir ═══════════ */
  var KAMERA_KASA = [-1, 0.42, 0.62];
  function kartResmi(d, w, h) {
    // Etiketli modelin küçük resmi + parçaların resimdeki konumları (numaralı işaretler için)
    var m = D.model('M-MASAUSTU');
    kasaUyarla(m, d);
    var url = D.kucukResim(m, { w: w, h: h, yon: KAMERA_KASA });
    var noktalar = [];
    if (url) {
      m.updateWorldMatrix(true, true);
      var kutu = new THREE.Box3().setFromObject(m);
      var merkez = kutu.getCenter(new V3()), r = kutu.getSize(new V3()).length() / 2;
      var cam = new THREE.PerspectiveCamera(30, w / h, r / 20, r * 20);
      var yon = new V3().fromArray(KAMERA_KASA).normalize();
      var f = Math.min(THREE.MathUtils.degToRad(30), 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(15)) * w / h));
      cam.position.copy(merkez).addScaledVector(yon, (r / Math.sin(f / 2)) * 0.9);
      cam.lookAt(merkez); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      parcaEtiketleri(d).forEach(function (x) {
        var p = m.getObjectByName(x[0]);
        if (!p || !x[1] || !p.visible) { noktalar.push(null); return; }
        var v = new THREE.Box3().setFromObject(p).getCenter(new V3()).project(cam);
        noktalar.push([(v.x + 1) / 2 * 100, (1 - v.y) / 2 * 100]);
      });
    }
    m.traverse(function (o) {
      if (o.geometry && !o.geometry.userData.paylasimli) o.geometry.dispose();
      if (o.material && !o.material.userData.paylasimli) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
    if (m.parent) m.parent.remove(m);
    return { url: url, noktalar: noktalar };
  }
  function kartHtml(d, resim, sinif) {
    var r = degerlendir(d), et = parcaEtiketleri(d);
    var pinler = '';
    if (resim && resim.url) {
      resim.noktalar.forEach(function (n, i) {
        if (n) pinler += '<span class="kr-pin" style="left:' + n[0].toFixed(1) + '%;top:' + n[1].toFixed(1) + '%">' + (i + 1) + '</span>';
      });
    }
    var satirlar = et.map(function (x, i) { return x[1] ? '<li><span class="kr-no">' + (i + 1) + '</span>' + x[1] + '</li>' : ''; }).join('');
    return '<div class="kr ' + (sinif || '') + '"><div class="kr-ust"><span>BİLGİSAYAR KİMLİK KARTI</span><b></b></div>' +
      '<div class="kr-govde"><div class="kr-resim">' + (resim && resim.url ? '<img alt="Etiketli kasa modeli" src="' + resim.url + '">' + pinler : '<!--@dahil:yedek-kasa.svg-->') + '</div>' +
      '<ol class="kr-liste">' + satirlar + '</ol></div>' +
      '<div class="kr-isler">' + ISLER.map(function (is) { return '<span class="kr-is"><i>' + is.kisa + '</i>' + rozet(r[is.id]) + '</span>'; }).join('') + '</div></div>';
  }

  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: KAMERA_KASA, pay: 1.02, hedefOfset: [0, -1, 0] } });
    var kasa = s.ekle('M-MASAUSTU');
    var d = Object.assign({ port: true }, ORNEK.sinif);
    kasaUyarla(kasa, d);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.7, maxPolar: 1.4, minYakin: 0.6, maxYakin: 1.3 } });
    fanlariDondur(s, kasa);
    var sahneEl = kap.parentNode;
    var ortu = el('div', 'kart-yerles', sahneEl);
    ortu.setAttribute('aria-live', 'polite');
    var etiketler = [];
    function sifirla() {
      etiketler.forEach(function (e) { e.kaldir(); }); etiketler = [];
      parcaEtiketleri(d).forEach(function (x) { var p = kasa.getObjectByName(x[0]); if (p) D.vurguKaldir(p, 0); });
      ortu.className = 'kart-yerles'; ortu.innerHTML = '';
      kap.classList.remove('soluk');
    }
    var adimlar = parcaEtiketleri(d).map(function (x, i) {
      var ADLAR = ['İşlemci', 'RAM', 'Depolama', 'Ekran kartı', 'Portlar'];
      return { metin: ADLAR[i] + ': değeri etikete yaz.', calis: function () {
        var p = kasa.getObjectByName(x[0]);
        return D.vurgula(p, { etiket: false, sure: 0.35 }).then(function () {
          var y = ETIKET_YER[x[0]];
          etiketler.push(s.etiket(p, (i + 1) + ' · ' + x[1], { tur: 'vurgu', yer: y.yer, ofset: y.ofset }));
          return D.bekle(0.7, s);
        }).then(function () { return D.vurguKaldir(p); });
      } };
    });
    adimlar.push({ metin: 'Etiketli model kartın yüzüne yerleşiyor.', calis: function () {
      var resim = kartResmi(d, 260, 280);
      ortu.innerHTML = kartHtml(d, resim);
      ortu.querySelector('.kr-ust b').textContent = d.ad;
      kap.classList.add('soluk');
      void ortu.offsetWidth;
      ortu.classList.add('acik');
      var li = ortu.querySelectorAll('.kr-liste li, .kr-is');
      var zincir = D.bekle(0.5, s);
      Array.prototype.forEach.call(li, function (x) {
        zincir = zincir.then(function () { x.classList.add('gor'); return D.bekle(0.22, s); });
      });
      return zincir.then(function () { return D.bekle(1, s); });
    } });
    prova(s, adimlar, { sifirla: sifirla });
  });

  /* ═══════════ Adım 6: sun (2D sunum provası) ═══════════ */
  (function () {
    var kok = document.getElementById('p-sun');
    if (!kok) return;
    kok.classList.add('sn');
    var PLAN = [
      ['Adı ve türü', 'Bu, Sınıf-3 Bilgisayarı. Masaüstü bir bilgisayar.'],
      ['Değerler', '4 çekirdekli işlemcisi, 8 GB RAM’i ve 238 GB SSD’si var.'],
      ['Portlar', '9 USB, 2 görüntü, 1 ağ ve 5 ses girişi var.'],
      ['Ne için uygun?', 'Ödev ve programlama için uygun, çünkü RAM’i yeterli ve SSD’si hızlı.']
    ];
    var govde = el('div', 'sn-govde', kok);
    var sahne = el('div', 'sn-sahne', govde, '<!--@dahil:sunum.svg--><div class="sn-balon" aria-live="polite"></div>');
    var yan = el('div', 'sn-yan', govde);
    var saat = el('div', 'sn-saat', yan, '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" fill="none" stroke="#e2e8f0" stroke-width="5"/>' +
      '<circle class="sn-halka" cx="22" cy="22" r="19" fill="none" stroke="#0ea5e9" stroke-width="5" stroke-linecap="round" transform="rotate(-90 22 22)" stroke-dasharray="119.4" stroke-dashoffset="0"/></svg><b>60</b><small>sn</small>');
    var ol = el('ol', 'gorevler sn-plan', yan);
    PLAN.forEach(function (p) { el('li', '', ol, '<span class="g-isaret"></span><span>' + p[0] + '</span>'); });
    var balon = sahne.querySelector('.sn-balon');
    var halka = saat.querySelector('.sn-halka'), saniye = saat.querySelector('b');
    var alt = oynatDugmesi(kok, function () { oyna(); });
    var z = zamanlayici();
    function sifirla() {
      z.durdur();
      Array.prototype.forEach.call(ol.children, function (li) { li.className = ''; });
      balon.textContent = ''; balon.classList.remove('gor');
      halka.style.strokeDashoffset = '0'; saniye.textContent = '60';
      alt.sonuc.className = 'panel-sonuc'; alt.sonuc.textContent = 'Dört bölüm, bir dakika.';
    }
    function oyna() {
      sifirla();
      alt.bitti();
      var o = [];
      PLAN.forEach(function (p, i) {
        o.push([i ? 2.6 : 0.5, function () {
          if (i) ol.children[i - 1].className = 'tamam';
          ol.children[i].className = 'simdi';
          balon.textContent = '“' + p[1] + '”'; balon.classList.add('gor');
          var kalan = 60 - (i + 1) * 15;
          saniye.textContent = String(kalan);
          halka.style.strokeDashoffset = String((119.4 * (60 - kalan) / 60).toFixed(1));
        }]);
      });
      o.push([2.8, function () {
        ol.children[3].className = 'tamam';
        alt.sonuc.className = 'panel-sonuc iyi';
        alt.sonuc.textContent = 'Sunum “çünkü” ile bitti: gerekçe hazır.';
      }]);
      z.oynat(o);
    }
    sifirla();
    DERS.slaytAcilinca('s9', function () { oyna(); });
  })();

  /* ═══════════ Etkinlik 1: E-KIMLIK-KARTI (değer gir → kart ve etiketli mini model) ═══════════ */
  var KART = { ad: '', islemci: '', cekirdek: null, ram: null, disk: null, boyut: null, gpu: null, isletim: '', usb: 0, goruntu: 0, ag: 0, ses: 0, port: false };
  var ALANLAR = ['islemci', 'cekirdek', 'ram', 'disk', 'boyut', 'gpu', 'isletim', 'port'];
  function doluSayisi() {
    return ALANLAR.filter(function (a) { return !!KART[a] && String(KART[a]).trim() !== ''; }).length;
  }
  (function () {
    var form = document.getElementById('kart-form'), kartEl = document.getElementById('kk-kart');
    if (!form || !kartEl) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var liste = document.getElementById('kk-liste'), isler = document.getElementById('kk-isler');
    var neden = document.getElementById('kk-neden'), indir = document.getElementById('kk-indir');
    var adEl = kartEl.querySelector('.kk-ad');
    var bitti = false, seciliIs = null, mini = null;

    /* Form: üç grup */
    var GRUPLAR = [
      { ad: 'İşlemci ve RAM', kisa: 'İşlemci', alanlar: ['islemci', 'cekirdek', 'ram'], satirlar: [
        { tur: 'metin', alan: 'ad', etiket: 'Kart adı', ph: 'ör. Sınıf-3 Bilgisayarı', max: 24 },
        { tur: 'metin', alan: 'islemci', etiket: 'İşlemci', ph: 'ör. 2,40 GHz', max: 24 },
        { tur: 'sec', alan: 'cekirdek', etiket: 'Çekirdek', secenek: [[2, '2'], [4, '4'], [6, '6'], [8, '8+']] },
        { tur: 'sec', alan: 'ram', etiket: 'RAM (GB)', secenek: [[2, '2'], [4, '4'], [8, '8'], [16, '16'], [32, '32']] }] },
      { ad: 'Depolama ve Görüntü', kisa: 'Depolama', alanlar: ['disk', 'boyut', 'gpu', 'isletim'], satirlar: [
        { tur: 'sec', alan: 'disk', etiket: 'Depolama', secenek: [['SSD', 'SSD'], ['HDD', 'HDD']] },
        { tur: 'sayi', alan: 'boyut', etiket: 'Boyut (GB)', ph: 'ör. 238' },
        { tur: 'sec', alan: 'gpu', etiket: 'Ekran kartı', secenek: [['tumlesik', 'Tümleşik'], ['harici', 'Harici']] },
        { tur: 'metin', alan: 'isletim', etiket: 'İşletim sis.', ph: 'ör. 64 bit', max: 24 }] },
      { ad: 'Portlar', kisa: 'Portlar', alanlar: ['port'], satirlar: [
        { tur: 'adim', alan: 'usb', etiket: 'USB' }, { tur: 'adim', alan: 'goruntu', etiket: 'Görüntü' },
        { tur: 'adim', alan: 'ag', etiket: 'Ağ' }, { tur: 'adim', alan: 'ses', etiket: 'Ses' }] }
    ];
    var ust = el('div', 'kf-gruplar', form);
    ust.setAttribute('role', 'group'); ust.setAttribute('aria-label', 'Form bölümleri');
    var grupEl = [], grupDugme = [], kontroller = {};
    GRUPLAR.forEach(function (g, gi) {
      var b = DERS.dugme(ust, '', function () { grupAc(gi); }, 'kf-grup-dugme');
      b.innerHTML = '<span class="kf-no">' + (gi + 1) + '</span><span>' + g.kisa + '</span>';
      b.setAttribute('aria-label', (gi + 1) + '. bölüm: ' + g.ad);
      grupDugme.push(b);
      var ge = el('div', 'kf-grup', form);
      ge.setAttribute('role', 'group'); ge.setAttribute('aria-label', g.ad);
      g.satirlar.forEach(function (st) {
        var id = 'kf-' + st.alan;
        var sat = el('div', 'kf-satir', ge);
        var lab = el('label', 'kf-etiket', sat); lab.textContent = st.etiket;
        if (st.tur === 'metin' || st.tur === 'sayi') {
          var inp = el('input', 'kf-giris', sat);
          inp.id = id; lab.setAttribute('for', id);
          inp.type = st.tur === 'sayi' ? 'number' : 'text';
          if (st.tur === 'sayi') { inp.min = '1'; inp.max = '9999'; inp.inputMode = 'numeric'; }
          else inp.maxLength = st.max;
          inp.placeholder = st.ph; inp.autocomplete = 'off';
          inp.addEventListener('input', function () {
            var v = inp.value.trim();
            if (st.tur === 'sayi') { var n = parseInt(v, 10); KART[st.alan] = n > 0 && n < 100000 ? n : null; }
            else KART[st.alan] = v;
            degisti(st.alan);
          });
          kontroller[st.alan] = { ayarla: function (v) { inp.value = v == null ? '' : v; } };
        } else if (st.tur === 'sec') {
          var grp = el('div', 'kf-sec', sat);
          grp.setAttribute('role', 'group'); grp.setAttribute('aria-label', st.etiket);
          lab.id = id;
          var dg = st.secenek.map(function (x) {
            var b2 = DERS.dugme(grp, x[1], function () {
              KART[st.alan] = x[0];
              dg.forEach(function (y) { y.setAttribute('aria-pressed', y === b2 ? 'true' : 'false'); });
              degisti(st.alan);
            });
            b2.setAttribute('aria-pressed', 'false');
            return b2;
          });
          kontroller[st.alan] = { ayarla: function (v) { dg.forEach(function (y, i) { y.setAttribute('aria-pressed', st.secenek[i][0] === v ? 'true' : 'false'); }); } };
        } else {
          var ad = el('div', 'kf-adim', sat);
          ad.setAttribute('role', 'group'); ad.setAttribute('aria-label', st.etiket + ' portu sayısı');
          var eksi = DERS.dugme(ad, '−', function () { degis(-1); });
          eksi.setAttribute('aria-label', st.etiket + ' azalt');
          var deger = el('output', 'kf-deger', ad); deger.textContent = '0';
          var arti = DERS.dugme(ad, '+', function () { degis(1); });
          arti.setAttribute('aria-label', st.etiket + ' artır');
          var degis = function (fark) {
            KART[st.alan] = Math.max(0, Math.min(20, (KART[st.alan] || 0) + fark));
            deger.textContent = KART[st.alan];
            KART.port = true;
            degisti(st.alan);
          };
          kontroller[st.alan] = { ayarla: function (v) { deger.textContent = v || 0; } };
        }
      });
      grupEl.push(ge);
    });
    var ornekB = DERS.dugme(form, 'Örnekle doldur', function () { ornekDoldur(); }, 'kf-ornek');
    ornekB.setAttribute('aria-label', 'Formu örnek değerlerle doldur (öğretmen gösterimi)');
    function grupAc(gi) {
      grupEl.forEach(function (g, i) { g.hidden = i !== gi; });
      grupDugme.forEach(function (b, i) { b.setAttribute('aria-pressed', i === gi ? 'true' : 'false'); });
    }
    grupAc(0);

    /* Kart listesi ve işler */
    var SATIRLAR = [['İşlemci', function (d) { return d.islemci || '—'; }], ['Çekirdek', function (d) { return d.cekirdek ? (d.cekirdek >= 8 ? '8+' : d.cekirdek) : '—'; }],
      ['RAM', function (d) { return d.ram ? d.ram + ' GB' : '—'; }], ['Depolama', diskMetin], ['Ekran kartı', gpuMetin],
      ['İşletim sis.', function (d) { return d.isletim || '—'; }], ['Portlar', function (d) { return d.port ? portMetin(d) : '—'; }]];
    var satirEl = SATIRLAR.map(function (x) {
      var sat = el('div', 'kk-satir', liste);
      yazi(el('dt', '', sat), x[0]);
      return el('dd', '', sat);
    });
    var isDugme = ISLER.map(function (is) {
      var b = DERS.dugme(isler, '', function () { seciliIs = is.id; isleriYaz(); }, 'kk-is');
      b.setAttribute('aria-pressed', 'false');
      return b;
    });
    function isleriYaz() {
      var r = degerlendir(KART);
      ISLER.forEach(function (is, i) {
        isDugme[i].innerHTML = '<span class="kk-is-ad">' + isSimge(is) + is.kisa + '</span>' + rozet(r[is.id]);
        isDugme[i].setAttribute('aria-pressed', seciliIs === is.id ? 'true' : 'false');
      });
      if (seciliIs) {
        var is = ISLER.filter(function (x) { return x.id === seciliIs; })[0], sonuc = r[seciliIs];
        neden.className = 'kk-neden';
        neden.textContent = sonuc ? is.ad + ': ' + SEVIYE[sonuc.s].ad + ', çünkü ' + sonuc.neden : is.ad + ': ' + is.eksik;
      } else if (!bitti) {
        neden.className = 'kk-neden bos';
        neden.textContent = 'Bir işe dokun: gerekçesini gör.';
      }
    }
    function kartYaz() {
      adEl.textContent = KART.ad || 'Bilgisayarım';
      SATIRLAR.forEach(function (x, i) {
        var t = x[1](KART);
        satirEl[i].textContent = t;
        satirEl[i].parentNode.classList.toggle('dolu', t !== '—');
      });
      isleriYaz();
    }

    /* Mini 3D model: girilen değerler parçalarda etiket olur (A-VURGU) */
    D.tembel('#kart-3d', function (kap) {
      var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: false,
        kamera: { yon: KAMERA_KASA, pay: 0.9, hedefOfset: [0, -1.5, 0] } });
      var kasa = s.ekle('M-MASAUSTU');
      s.yerlestir();
      D.dondur(s, { ipucu: false, sifirlaDugmesi: false, sinir: { minPolar: 0.8, maxPolar: 1.35, minYakin: 0.8, maxYakin: 1.2, yatay: 0.7 } });
      fanlariDondur(s, kasa);
      var etiket = {};
      mini = {
        guncelle: function (alan) {
          kasaUyarla(kasa, KART);
          var HANGI = { islemci: 'islemci', cekirdek: 'islemci', ram: 'ram', disk: 'depolama', boyut: 'depolama', gpu: 'ekran-karti',
            usb: 'arka-panel', goruntu: 'arka-panel', ag: 'arka-panel', ses: 'arka-panel' };
          parcaEtiketleri(KART).forEach(function (x, i) {
            var p = kasa.getObjectByName(x[0]);
            if (!p) return;
            if (!x[1] || !p.visible) { if (etiket[x[0]]) { etiket[x[0]].kaldir(); delete etiket[x[0]]; } return; }
            var metin = (i + 1) + ' · ' + x[1];
            if (!etiket[x[0]]) { var y = ETIKET_YER[x[0]]; etiket[x[0]] = s.etiket(p, metin, { yer: y.yer, ofset: y.ofset }); }
            else etiket[x[0]].metin(metin);
          });
          var parca = alan && HANGI[alan] ? kasa.getObjectByName(HANGI[alan]) : null;
          if (parca && parca.visible) {
            D.vurgula(parca, { etiket: false, sure: 0.3 });
            clearTimeout(parca.userData._kkZaman);
            parca.userData._kkZaman = setTimeout(function () { D.vurguKaldir(parca); }, AZ ? 50 : 1100);
          }
        }
      };
      mini.guncelle();
    });

    function degisti(alan) {
      kartYaz();
      if (mini) mini.guncelle(alan);
      var n = doluSayisi();
      ilerle(n, ALANLAR.length);
      GRUPLAR.forEach(function (g, i) {
        var tamam = g.alanlar.every(function (a) { return !!KART[a] && String(KART[a]).trim() !== ''; });
        grupDugme[i].classList.toggle('tamam', tamam);
      });
      if (n === ALANLAR.length && !bitti) {
        bitti = true;
        indir.disabled = false;
        kartEl.classList.add('hazir');
        neden.className = 'kk-neden hazir';
        neden.textContent = '✓ Kart hazır! Bir işe dokunup gerekçesini oku.';
        DERS.konfeti();
      }
    }
    function ornekDoldur() {
      Object.keys(ORNEK.sinif).forEach(function (k) { KART[k] = ORNEK.sinif[k]; });
      KART.port = true;
      Object.keys(kontroller).forEach(function (k) { kontroller[k].ayarla(KART[k]); });
      degisti(null);
    }

    /* Kartı PNG olarak indir (canvas; emoji yok) */
    function yuvarlak(ctx, x, y, w, h, r) { K.yuvarlakDikdortgen(ctx, x, y, w, h, r); }
    function pngUret() {
      var W = 960, H = 600, c = document.createElement('canvas');
      c.width = W; c.height = H;
      var ctx = c.getContext('2d');
      var font = getComputedStyle(document.body).fontFamily || 'Arial, sans-serif';
      var ana = D.cssDeger('--brand', document.body) || '#0ea5e9';
      ctx.fillStyle = '#eef6fc'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff'; yuvarlak(ctx, 20, 20, W - 40, H - 40, 28); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = ana; ctx.stroke();
      ctx.fillStyle = ana; yuvarlak(ctx, 20, 20, W - 40, 86, 28); ctx.fill(); ctx.fillRect(20, 80, W - 40, 26);
      ctx.fillStyle = '#fff'; ctx.font = '800 18px ' + font; ctx.fillText('BİLGİSAYAR KİMLİK KARTI', 52, 56);
      ctx.font = '900 32px ' + font; ctx.fillText(KART.ad || 'Bilgisayarım', 52, 94);
      var resim = kartResmi(KART, 300, 330);
      function devam(img) {
        if (img) ctx.drawImage(img, 44, 128, 300, 330);
        else { ctx.fillStyle = '#30343c'; yuvarlak(ctx, 120, 150, 150, 280, 14); ctx.fill(); }
        ctx.font = '800 17px ' + font;
        resim.noktalar.forEach(function (n, i) {
          if (!n) return;
          var x = 44 + n[0] * 3, y = 128 + n[1] * 3.3;
          ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#1f1300'; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), x, y + 6); ctx.textAlign = 'left';
        });
        ctx.fillStyle = '#64748b'; ctx.font = '700 13px ' + font;
        ctx.fillText('1 İşlemci · 2 RAM · 3 Depolama · 4 Ekran kartı · 5 Portlar', 52, 468);
        var y0 = 150;
        SATIRLAR.forEach(function (x) {
          ctx.fillStyle = '#64748b'; ctx.font = '700 17px ' + font; ctx.fillText(x[0], 380, y0);
          ctx.fillStyle = '#0f172a'; ctx.font = '800 21px ' + font; ctx.fillText(String(x[1](KART)), 540, y0);
          y0 += 44;
        });
        var r = degerlendir(KART), RENK = [['#fee2e2', '#991b1b'], ['#fef3c7', '#92400e'], ['#d1fae5', '#065f46']];
        ctx.fillStyle = '#334155'; ctx.font = '800 17px ' + font; ctx.fillText('Uygun olduğu işler', 52, 492);
        ISLER.forEach(function (is, i) {
          var x = 52 + i * 218, sonuc = r[is.id], rk = sonuc ? RENK[sonuc.s] : ['#f1f5f9', '#475569'];
          ctx.fillStyle = rk[0]; yuvarlak(ctx, x, 506, 206, 44, 22); ctx.fill();
          ctx.fillStyle = rk[1]; ctx.font = '800 17px ' + font;
          ctx.fillText(is.kisa + ': ' + (sonuc ? SEVIYE[sonuc.s].isaret + ' ' + SEVIYE[sonuc.s].ad : '?'), x + 16, 534);
        });
        ctx.fillStyle = '#94a3b8'; ctx.font = '700 13px ' + font;
        ctx.fillText('Bilişim Üssü · Donanım 201 · Hafta 14 · ' + new Date().toLocaleDateString('tr-TR'), 52, 572);
        var a = document.createElement('a');
        a.download = 'bilgisayar-kimlik-karti.png';
        a.href = c.toDataURL('image/png');
        document.body.appendChild(a); a.click(); a.remove();
      }
      if (resim.url) { var img = new Image(); img.onload = function () { devam(img); }; img.onerror = function () { devam(null); }; img.src = resim.url; }
      else devam(null);
    }
    indir.addEventListener('click', function () { try { pngUret(); } catch (e) { console.error(e); } });
    kartYaz();
    ilerle(0, ALANLAR.length);
  })();

  /* ═══════════ Etkinlik 2: Uygun mu? (kural uygulama) ═══════════ */
  (function () {
    var kok = document.getElementById('uygun-mu');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var TURLAR = [['A', 'odev', 1], ['B', 'oyun', 1], ['C', 'oyun', 2], ['A', 'cizim', 0], ['B', 'kod', 2], ['A', 'oyun', 0]];
    kok.innerHTML = '<div class="um"><div class="um-ust"><span class="um-tur"></span></div>' +
      '<div class="um-govde"><div class="um-kart"></div><div class="um-is"></div></div>' +
      '<div class="um-secenekler" role="group" aria-label="Kararın"></div><div class="um-geri" aria-live="polite"></div></div>';
    var turEl = kok.querySelector('.um-tur'), kartEl = kok.querySelector('.um-kart'), isEl = kok.querySelector('.um-is');
    var secEl = kok.querySelector('.um-secenekler'), geri = kok.querySelector('.um-geri');
    var tur = 0, ilkDeneme = true, ilkDogru = 0, kilit = false;
    var dugmeler = [2, 1, 0].map(function (sv) {
      var v = SEVIYE[sv];
      var b = DERS.dugme(secEl, '', function () { cevap(sv, b); }, 'um-sec ' + v.sinif);
      b.innerHTML = '<b aria-hidden="true">' + v.isaret + '</b><span>' + v.ad + '</span>';
      return b;
    });
    var sonraki = DERS.dugme(secEl, 'Sonraki →', function () {
      if (tur < 0) { tur = 0; ilkDogru = 0; ilerle(0, TURLAR.length); } else tur++;
      goster();
    }, 'um-sonraki');
    function kartCiz(d) {
      return '<div class="um-kart-ust">KİMLİK KARTI · <b>' + d.ad + '</b></div><div class="um-kart-ic"><div class="um-kasa"><!--@dahil:kasa-mini.svg--></div><dl>' +
        '<div><dt>Çekirdek</dt><dd>' + d.cekirdek + '</dd></div><div><dt>RAM</dt><dd>' + d.ram + ' GB</dd></div>' +
        '<div><dt>Depolama</dt><dd>' + diskMetin(d) + '</dd></div><div><dt>Ekran kartı</dt><dd>' + (d.gpu === 'harici' ? 'Harici' : 'Tümleşik') + '</dd></div></dl></div>';
    }
    function goster() {
      if (tur >= TURLAR.length) { bitir(); return; }
      var t = TURLAR[tur], d = ORNEK[t[0]], is = ISLER.filter(function (x) { return x.id === t[1]; })[0];
      turEl.textContent = 'Kart ' + (tur + 1) + ' / ' + TURLAR.length;
      kartEl.innerHTML = kartCiz(d);
      isEl.innerHTML = '<span class="um-is-simge">' + isSimge(is) + '</span><small>İş</small><b>' + is.ad + '</b><span>Bu bilgisayar bu iş için…</span>';
      kok.querySelector('.um').className = 'um';
      dugmeler.forEach(function (b) { b.disabled = false; b.classList.remove('secildi'); });
      sonraki.hidden = true;
      geri.className = 'um-geri'; geri.textContent = '';
      ilkDeneme = true; kilit = false;
    }
    function cevap(sv, b) {
      if (kilit) return;
      var t = TURLAR[tur], d = ORNEK[t[0]], r = degerlendir(d)[t[1]];
      var is = ISLER.filter(function (x) { return x.id === t[1]; })[0];
      if (sv === t[2]) {
        kilit = true;
        if (ilkDeneme) ilkDogru++;
        b.classList.add('secildi');
        dugmeler.forEach(function (x) { x.disabled = x !== b; });
        geri.className = 'um-geri dogru';
        geri.textContent = '✓ Doğru: ' + SEVIYE[sv].ad + ', çünkü ' + r.neden;
        kok.querySelector('.um').className = 'um dogru';
        ilerle(tur + 1, TURLAR.length);
        sonraki.hidden = false;
        sonraki.textContent = tur + 1 < TURLAR.length ? 'Sonraki →' : 'Bitir';
        D.ses('dogru');
      } else {
        ilkDeneme = false;
        b.disabled = true;
        geri.className = 'um-geri yanlis';
        geri.textContent = '✗ Bir daha düşün. ' + is.ipucu;
        D.ses('hata');
      }
    }
    function bitir() {
      turEl.textContent = 'Tamamlandı';
      kartEl.innerHTML = '<div class="um-son"><b>' + ilkDogru + ' / ' + TURLAR.length + '</b><span>ilk denemede doğru karar</span></div>';
      isEl.innerHTML = '<span class="um-is-simge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg></span><b>Kural</b><span>Önce RAM, sonra depolama türü ve ekran kartı.</span>';
      dugmeler.forEach(function (b) { b.disabled = true; });
      sonraki.textContent = 'Baştan'; sonraki.hidden = false;
      tur = -1;
      geri.className = 'um-geri dogru';
      geri.textContent = 'Gerekçen hep bir değere dayansın: RAM, depolama ya da ekran kartı.';
      if (ilkDogru >= 4) DERS.konfeti();
    }
    goster();
  })();

  /* ═══════════ Derinleş: yükseltme önerisi (2D) ═══════════ */
  (function () {
    var kok = document.getElementById('yukseltme');
    if (!kok) return;
    kok.classList.add('yk');
    var kaynak = 0, acik = { ram: false, ssd: false, gpu: false };
    var sec = secici(kok, 'Hangi bilgisayar?', ['Senin kartın', 'Bilgisayar A'], function (i) { kaynak = i; acik = { ram: false, ssd: false, gpu: false }; ciz(); });
    var degerEl = el('div', 'yk-degerler', kok);
    var yuk = el('div', 'yk-yukselt', kok);
    yuk.setAttribute('role', 'group'); yuk.setAttribute('aria-label', 'Yükseltmeler');
    var tablo = el('div', 'yk-tablo', kok);
    var kazanc = el('div', 'yk-kazanc', kok);
    kazanc.setAttribute('aria-live', 'polite');
    var KAZANC = {
      ram: 'RAM: daha çok program ve sekme aynı anda açık kalır; bekleme azalır.',
      ssd: 'SSD: açılış ve program yükleme belirgin biçimde hızlanır.',
      gpu: 'Ekran kartı: 3D oyunlar ve görüntü işleri akıcılaşır. Kasada yer ve yeterli güç kaynağı gerekir.'
    };
    var UP = [
      ['ram', function (d) { return d.ram >= 32 ? null : 'RAM ' + d.ram + ' → ' + d.ram * 2 + ' GB'; }],
      ['ssd', function (d) { return d.disk === 'SSD' ? null : 'HDD yerine SSD'; }],
      ['gpu', function (d) { return d.gpu === 'harici' ? null : 'Harici ekran kartı'; }]
    ];
    var ubtn = UP.map(function (u) {
      var b = DERS.dugme(yuk, '', function () { acik[u[0]] = !acik[u[0]]; ciz(); }, 'yk-dugme');
      b.setAttribute('aria-pressed', 'false');
      return b;
    });
    function temel() {
      var tam = KART.ram && KART.cekirdek && KART.disk && KART.gpu;
      sec.dugmeler[0].disabled = !tam;
      if (!tam && kaynak === 0) kaynak = 1;
      sec.sec(kaynak);
      return kaynak === 0 ? KART : ORNEK.A;
    }
    function ciz() {
      var d0 = temel();
      var d1 = Object.assign({}, d0);
      if (acik.ram && d0.ram < 32) d1.ram = d0.ram * 2;
      if (acik.ssd) d1.disk = 'SSD';
      if (acik.gpu) d1.gpu = 'harici';
      degerEl.innerHTML = '<span><small>RAM</small><b>' + d1.ram + ' GB</b></span><span><small>Depolama</small><b>' + d1.disk + '</b></span>' +
        '<span><small>Çekirdek</small><b>' + d1.cekirdek + '</b></span><span><small>Ekran kartı</small><b>' + (d1.gpu === 'harici' ? 'Harici' : 'Tümleşik') + '</b></span>';
      UP.forEach(function (u, i) {
        var t = u[1](d0), b = ubtn[i];
        b.disabled = !t;
        if (!t) acik[u[0]] = false;
        b.innerHTML = '<span class="yk-arti">' + (acik[u[0]] ? '✓' : '+') + '</span><span>' + (t || (u[0] === 'ram' ? 'RAM en üstte' : u[0] === 'ssd' ? 'Zaten SSD' : 'Zaten harici')) + '</span>';
        b.setAttribute('aria-pressed', acik[u[0]] ? 'true' : 'false');
      });
      var r0 = degerlendir(d0), r1 = degerlendir(d1);
      tablo.innerHTML = '<div class="yk-bas"><span>İş</span><span>Önce</span><span></span><span>Sonra</span></div>' + ISLER.map(function (is) {
        var a = r0[is.id], b = r1[is.id], art = a && b && b.s > a.s;
        return '<div class="yk-satir' + (art ? ' artti' : '') + '"><span class="yk-is">' + isSimge(is) + is.kisa + '</span>' + rozet(a) +
          '<span class="yk-ok" aria-hidden="true">→</span>' + rozet(b) + (art ? '<span class="yk-yukari">▲ arttı</span>' : '') + '</div>';
      }).join('');
      var secilen = Object.keys(acik).filter(function (k) { return acik[k]; });
      var degisen = ISLER.some(function (is) { return r0[is.id] && r1[is.id] && r1[is.id].s > r0[is.id].s; });
      kazanc.innerHTML = secilen.length ? secilen.map(function (k) { return '<p>' + KAZANC[k] + '</p>'; }).join('') +
        (degisen ? '' : '<p class="yk-ipucu">Rozetler değişmedi: bu işleri yavaşlatan başka bir parça var.</p>') :
        '<p class="yk-ipucu">Bir yükseltme seç: hangi işin sonucu değişiyor?</p>';
    }
    DERS.slaytAcilinca('s12', function () { ciz(); }, true);
    ciz();
  })();
})();
