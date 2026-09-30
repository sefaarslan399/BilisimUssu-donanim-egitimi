/* DON-301 H03 — Bellek Hiyerarşisi ve RAM · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var V3 = D.kit.V3;
  DERS.tahminKur('Tahminini aldık. Adım 3’te iki modülü üst üste koyup yuvada deneyeceğiz.');
  function el(etiket, sinif, ebeveyn, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function bekle(sn) { return new Promise(function (r) { setTimeout(r, AZ ? 10 : sn * 1000); }); }
  function sayi(n, basamak) {
    var s = (basamak == null ? Math.round(n) : n.toFixed(basamak)).toString();
    var p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return p.join(',');
  }
  function aktifMi(id) { var s = document.getElementById(id); return !!(s && s.classList.contains('active')); }

  /* Bellek katmanları (yaklaşık, güncel masaüstü; 1 ns = 1 sn insan ölçeği) */
  var KAT = [
    { ad: 'Yazmaç', yer: 'Çekirdeğin içinde', ns: 0.3, gercek: '≈ 0,3 ns', insan: '≈ 0,3 sn', kap: 'Yüzlerce bayt', renk: '#7c3aed' },
    { ad: 'L1 önbellek', yer: 'Çekirdek başına', ns: 1, gercek: '≈ 1 ns', insan: '≈ 1 sn', kap: 'Onlarca KB', renk: '#4f46e5' },
    { ad: 'L2 önbellek', yer: 'Çekirdek başına', ns: 4, gercek: '≈ 3–5 ns', insan: '≈ 4 sn', kap: 'Yüzlerce KB – birkaç MB', renk: '#2563eb' },
    { ad: 'L3 önbellek', yer: 'Çekirdekler paylaşır', ns: 12, gercek: '≈ 10–20 ns', insan: '≈ 12 sn', kap: 'Onlarca MB', renk: '#0891b2' },
    { ad: 'RAM (DRAM)', yer: 'Anakart yuvalarında', ns: 80, gercek: '≈ 60–100 ns', insan: '≈ 80 sn (1,3 dk)', kap: '8–64 GB', renk: '#059669' },
    { ad: 'SSD (NVMe)', yer: 'Kalıcı depolama', ns: 8e4, gercek: '≈ 50–100 µs', insan: '≈ 22 saat (1 gün)', kap: '0,5–4 TB', renk: '#d97706' },
    { ad: 'HDD', yer: 'Kalıcı depolama', ns: 5e6, gercek: '≈ 5–10 ms', insan: '≈ 58 gün (2 ay)', kap: '1–20 TB', renk: '#b45309' }
  ];
  // İnsan ölçeği süresini okunur yazar (saniye cinsinden)
  function insanYaz(sn) {
    if (sn < 60) return sayi(sn, sn < 10 ? 1 : 0) + ' sn';
    if (sn < 3600) return sayi(sn / 60, 1) + ' dk';
    if (sn < 86400) return sayi(sn / 3600, 1) + ' saat';
    return sayi(sn / 86400, 0) + ' gün';
  }
  var LOG0 = -1, LOG1 = 7;   // ölçek çubuğu: 0,1 sn … 10⁷ sn
  function logOran(sn) { return Math.max(0, Math.min(1, (Math.log(sn) / Math.LN10 - LOG0) / (LOG1 - LOG0))); }
  var OLCEK_ISARET = [[1, '1 sn'], [60, '1 dk'], [3600, '1 saat'], [86400, '1 gün'], [2592000, '1 ay']];
  function olcekCubugu(ebeveyn) {
    var c = el('div', 'hy-olcek', ebeveyn);
    var bar = el('div', 'hy-olcek-bar', c);
    var dolgu = el('i', '', bar);
    OLCEK_ISARET.forEach(function (m) {
      var t = el('span', 'hy-isaret', c, m[1]);
      t.style.left = (logOran(m[0]) * 100).toFixed(1) + '%';
    });
    return dolgu;
  }

  /* ─────────── Kapak: üç modül, hafif salınım ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, zemin: false, arkaPlan: 'seffaf',
      kamera: { yon: [0.4, 0.28, 1], pay: 0.98 } });
    s.ekle('M-RAM', { konum: [0, 4.3, -0.6] });
    s.ekle('M-RAM-DDR5', { konum: [0, 0.6, 0] });
    s.ekle(D.model('M-SODIMM', { tur: 'DDR5' }), { konum: [0, -3.2, 0.6] });
    s.yerlestir();
    var t0 = s.orb.theta, z = 0;
    s.herKare(function (dt) { if (!AZ) { z += dt; s.orb.theta = t0 + Math.sin(z * 0.35) * 0.38; } });
  });

  /* ─────────── Adım 1: hiyerarşi piramidi + insan ölçeği (A-OLCEK) ─────────── */
  (function () {
    var kok = document.getElementById('hiyerarsi');
    if (!kok) return;
    kok.innerHTML = '<div class="hy"><div class="hy-sol"><div class="hy-ok ust">▲ Daha hızlı · bayt başına daha pahalı</div><div class="hy-piramit" role="group" aria-label="Bellek katmanları"></div>' +
      '<div class="hy-ok alt">▼ Daha büyük kapasite · daha ucuz</div></div><div class="hy-kart" aria-live="polite"></div></div><div class="secici hy-kontrol"></div>';
    var pir = kok.querySelector('.hy-piramit'), kart = kok.querySelector('.hy-kart');
    var dugmeler = KAT.map(function (k, i) {
      var b = el('button', 'hy-kat', pir);
      b.type = 'button';
      b.style.setProperty('--r', k.renk);
      b.style.setProperty('--w', (40 + i * 10) + '%');
      b.innerHTML = '<b></b><span></span>';
      b.firstChild.textContent = k.ad; b.lastChild.textContent = k.gercek;
      b.addEventListener('click', function () { sec(i, true); });
      return b;
    });
    var tahmin = null, calis = 0;
    function tahminKarti() {
      kart.innerHTML = '<div class="hy-bas"><b>Tahmin et</b><span>1 ns = 1 sn olsaydı RAM’den veri gelmesi ne kadar sürerdi?</span></div><div class="hy-tahmin"></div>';
      var t = kart.querySelector('.hy-tahmin');
      [['Yaklaşık 1 saniye', 0], ['1–2 dakika', 1], ['Yaklaşık 1 gün', 2]].forEach(function (x) {
        var b = DERS.dugme(t, x[0], function () {
          tahmin = x[1];
          t.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', y === b ? 'true' : 'false'); });
        });
        b.setAttribute('aria-pressed', 'false');
      });
      el('div', 'hy-ipucu', kart, 'Bir seçenek işaretle, sonra Oynat’a bas.');
    }
    function sec(i, animasyon) {
      var k = KAT[i], id = ++calis;
      dugmeler.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      kart.innerHTML = '<div class="hy-bas"><b></b><span></span></div><div class="hy-satirlar">' +
        '<div><span>Gerçek erişim (yaklaşık)</span><code class="hy-gercek"></code></div>' +
        '<div class="hy-vurgu"><span>İnsan ölçeği (1 ns = 1 sn)</span><code class="hy-insan"></code></div>' +
        '<div><span>Tipik kapasite</span><code class="hy-kap"></code></div></div>';
      kart.style.setProperty('--r', k.renk);
      kart.querySelector('.hy-bas b').textContent = k.ad;
      kart.querySelector('.hy-bas span').textContent = k.yer;
      kart.querySelector('.hy-gercek').textContent = k.gercek;
      kart.querySelector('.hy-kap').textContent = k.kap;
      var insan = kart.querySelector('.hy-insan');
      var dolgu = olcekCubugu(kart);
      var not = el('div', 'hy-ipucu', kart);
      var hedef = k.ns;            // saniye (insan ölçeği)
      function bitir() {
        insan.textContent = k.insan;
        dolgu.style.width = (logOran(hedef) * 100).toFixed(1) + '%';
        if (i === 4 && tahmin != null) not.textContent = tahmin === 1 ? 'Tahminin doğru: RAM, L1’e göre yaklaşık 80 kat yavaş.' : 'Tahminin tutmadı: RAM’den veri yaklaşık 80 sn sürer, L1’in 80 katı.';
        else if (i === 6) not.textContent = 'HDD, L1 önbellekten milyonlarca kat yavaştır; önbelleğin nedeni budur.';
      }
      if (!animasyon || AZ) { bitir(); return Promise.resolve(); }
      var bas = performance.now(), sure = 1100;
      return new Promise(function (coz) {
        (function kare(t) {
          if (id !== calis) return coz();
          var e = Math.min(1, (t - bas) / sure);
          var v = Math.pow(10, LOG0 + (Math.log(hedef) / Math.LN10 - LOG0) * e);
          insan.textContent = insanYaz(v);
          dolgu.style.width = (logOran(v) * 100).toFixed(1) + '%';
          if (e < 1) requestAnimationFrame(kare); else { bitir(); coz(); }
        })(bas);
      });
    }
    var oynuyor = false;
    function oynat() {
      if (oynuyor) return;
      oynuyor = true;
      var z = Promise.resolve();
      KAT.forEach(function (k, i) { z = z.then(function () { return sec(i, true); }).then(function () { return bekle(i === 4 ? 1.6 : 0.7); }); });
      z.then(function () { oynuyor = false; });
    }
    var ctl = kok.querySelector('.hy-kontrol');
    DERS.dugme(ctl, 'Oynat ▶', oynat);
    DERS.dugme(ctl, 'Baştan', function () { calis++; oynuyor = false; dugmeler.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); tahminKarti(); });
    tahminKarti();
  })();

  /* ─────────── Adım 2: DRAM hücreleri — sızıntı, tazeleme, güç kesilince kayıp ─────────── */
  (function () {
    var kok = document.getElementById('ucucu');
    if (!kok) return;
    var BIT = [1, 0, 1, 1, 0, 0, 1, 0];
    kok.innerHTML = '<div class="uc"><div class="uc-ust"><span class="uc-guc">Güç: AÇIK</span><span class="uc-durum" aria-live="polite">Tazeleme çalışıyor</span></div>' +
      '<div class="uc-hucreler"></div><div class="uc-bayt"><span>Satırdaki bayt</span><code></code></div>' +
      '<div class="uc-karsi"><b>SSD (NAND flash) farkı</b><span>Yük yalıtılmış hücrede hapsedilir; güç olmadan da korunur. SSD <strong>kalıcıdır</strong>, RAM <strong>uçucudur</strong>.</span></div>' +
      '<div class="uc-not">Gerçekte yük milisaniyeler içinde sızar; burada gözle izlenebilsin diye yavaşlatıldı.</div></div>' +
      '<div class="secici uc-kontrol"></div>';
    var alan = kok.querySelector('.uc-hucreler'), baytEl = kok.querySelector('.uc-bayt code');
    var gucEl = kok.querySelector('.uc-guc'), durumEl = kok.querySelector('.uc-durum');
    var hucre = BIT.map(function (b, i) {
      var h = el('div', 'uc-hucre', alan);
      h.innerHTML = '<div class="uc-kap"><i></i><span class="uc-esik"></span></div><b class="uc-bit"></b><small>C' + i + '</small>';
      return { el: h, dolgu: h.querySelector('i'), bit: h.querySelector('.uc-bit'), yuk: b ? 1 : 0, okunan: b };
    });
    var guc = true, kayip = false, tarama = 0, son = 0, dongu = null;
    var SIZINTI = 0.3, TARAMA_ARALIK = 0.16;
    function ciz() {
      hucre.forEach(function (h, i) {
        h.dolgu.style.height = (h.yuk * 100).toFixed(0) + '%';
        h.el.classList.toggle('dusuk', h.yuk > 0 && h.yuk < 0.5);
        h.el.classList.toggle('tarama', guc && i === Math.floor(tarama) % hucre.length);
        h.bit.textContent = kayip ? '0' : (h.yuk >= 0.5 ? '1' : (h.okunan && !guc ? '?' : '0'));
      });
      baytEl.textContent = hucre.map(function (h) { return kayip ? '0' : (h.yuk >= 0.5 ? '1' : (h.okunan && !guc ? '?' : '0')); }).join('');
    }
    function adim(dt) {
      hucre.forEach(function (h) { h.yuk = Math.max(0, h.yuk - SIZINTI * dt * (h.yuk > 0 ? 1 : 0)); });
      if (guc) {
        var onceki = Math.floor(tarama);
        tarama += dt / TARAMA_ARALIK;
        if (Math.floor(tarama) !== onceki) {
          var h = hucre[Math.floor(tarama) % hucre.length];
          h.yuk = h.yuk >= 0.5 ? 1 : 0;          // tazeleme: oku ve yeniden yaz
        }
      }
    }
    function calistir() {
      if (dongu) return;
      son = performance.now();
      (function kare(t) {
        if (!aktifMi('s6')) { dongu = null; return; }
        var dt = Math.max(0, Math.min(0.1, (t - son) / 1000)); son = Math.max(son, t);
        adim(dt); ciz();
        dongu = requestAnimationFrame(kare);
      })(son);
    }
    function sifirla() {
      guc = true; kayip = false; tarama = 0;
      hucre.forEach(function (h, i) { h.yuk = BIT[i]; h.okunan = BIT[i]; });
      gucEl.textContent = 'Güç: AÇIK'; gucEl.className = 'uc-guc';
      durumEl.textContent = 'Tazeleme çalışıyor: yük azalınca denetleyici yeniden doldurur.';
      dG.disabled = false; dA.disabled = true;
      ciz();
    }
    var ctl = kok.querySelector('.uc-kontrol');
    var dG = DERS.dugme(ctl, 'Gücü kes', function () {
      guc = false; gucEl.textContent = 'Güç: KESİK'; gucEl.className = 'uc-guc kesik';
      durumEl.textContent = 'Tazeleme durdu: yükler sızıyor…';
      dG.disabled = true; dA.disabled = false;
      if (AZ) { hucre.forEach(function (h) { h.yuk = 0; }); ciz(); }
    });
    var dA = DERS.dugme(ctl, 'Gücü aç', function () {
      guc = true; kayip = true;
      hucre.forEach(function (h) { h.yuk = 0; });
      gucEl.textContent = 'Güç: AÇIK'; gucEl.className = 'uc-guc';
      durumEl.textContent = 'Veri kayboldu: tüm hücreler 0 okunuyor. RAM uçucudur.';
      dA.disabled = true;
      ciz();
    });
    DERS.dugme(ctl, 'Baştan', sifirla);
    sifirla();
    DERS.slaytAcilinca('s6', calistir, true);
  })();

  /* ─────────── Adım 3: DDR4 ve DDR5 — çakıştır (A-KARŞILAŞTIR) + yuvada dene (A-TAK) ─────────── */
  D.tembel('#s7-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, zemin: false,
      kamera: { yon: [0.12, 0.2, 1], pay: 0.92 } });
    var Y4 = 4.4, YY = -5.4;
    var d4 = s.ekle('M-RAM', { konum: [0, Y4, 0] });
    var d5 = s.ekle('M-RAM-DDR5', { konum: [0, 0, 0] });
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.8, maxPolar: 1.95, minYakin: 0.12, maxYakin: 1.5, yatay: 1.0 } });
    var mesaj = DERS.sahneMesaj(s);
    var yuva = null;
    var pcb4 = d4.getObjectByName('pcb');
    pcb4.material.transparent = true;
    var et4 = s.etiket(d4, 'DDR4 · 288 temas · 1,2 V', { ofset: [0, 0.2, 0] });
    var et5 = s.etiket(d5, 'DDR5 · 288 temas · 1,1 V · PMIC', { yer: 'alt', ofset: [0, -0.2, 0] });
    var hiza = null;
    function hizaKur(a, b, ops) { if (hiza) hiza.kaldir(); hiza = D.hiza(s, a, b, Object.assign({ kalinlik: 0.03 }, ops)); }
    function karsilastirHiza() {
      hizaKur(d4.getObjectByName('centik'), d5.getObjectByName('centik'),
        { yanlisMetin: '✗ Çentikler aynı hizada değil', dogruMetin: '✓ Aynı hizada' });
    }
    karsilastirHiza();
    var mesgul = false, ceti = [];
    function saydam(o) { pcb4.material.opacity = o; pcb4.material.depthWrite = o >= 1; }
    function cakistir() {
      if (mesgul) return; mesgul = true;
      mesaj('');
      ceti.forEach(function (e) { e.kaldir(); }); ceti = [];
      var z = Promise.resolve();
      if (yuva) z = baslangic(true);
      z.then(function () {
        karsilastirHiza();
        return D.tween({ sahne: s, sure: AZ ? 0.01 : 0.5, guncelle: function (e) { saydam(1 - 0.5 * e); } });
      }).then(function () { return D.git(d4, new V3(0, 0, 0.25), AZ ? 0.01 : 1.1); })
        .then(function () {
          var c = d5.getObjectByName('centik').getWorldPosition(new V3());
          return s.kameraGit({ hedef: [c.x, 0.7, 0], yakinlik: 0.24, theta: s._baslangic.theta, phi: 1.5 }, AZ ? 0.01 : 1.2);
        })
        .then(function () {
          et5.goster(false);
          ceti.push(s.etiket(d4.getObjectByName('centik'), 'DDR4 çentiği', { tur: 'vurgu', yer: 'merkez', ofset: [0.25, 0.75, 0.3] }));
          ceti.push(s.etiket(d5.getObjectByName('centik'), 'DDR5 çentiği', { tur: 'odak', yer: 'merkez', ofset: [-0.25, -0.35, 0.3] }));
          mesaj('Üst üste: iki çentik farklı yerde, çizgiler ayrı.', 'yanlis');
          mesgul = false;
        });
    }
    function yuvayaDene() {
      if (mesgul) return; mesgul = true;
      mesaj('');
      var z = baslangic(true);
      z = z.then(function () {
        if (!yuva) {
          yuva = s.ekle(D.model('M-RAM-YUVASI', { kesit: true }), { konum: [0, YY, 0] });
          yuva.name = 'yuva';
        }
        yuva.visible = true;
        et5.goster(false);
        hizaKur(d5.getObjectByName('centik'), yuva.getObjectByName('cikinti'),
          { yanlisMetin: '✗ Çentik çıkıntıya denk gelmiyor', dogruMetin: '✓ Çentik çıkıntıya denk geldi' });
        return s.kameraGit({ hedef: [0, -1.8, 0], yakinlik: 0.95, theta: s._baslangic.theta + 0.15, phi: 1.3 }, AZ ? 0.01 : 1);
      });
      var hedef = new V3(0, YY, 0).add(yuva ? yuva.userData.oturma : new V3(0, 0.37, 0));
      z.then(function () {
        hedef = new V3(0, YY, 0).add(yuva.userData.oturma);
        return D.takAnim(d5, { hedef: hedef, dogru: false, yukseklik: 2.6, yuva: yuva });
      }).then(function () {
        mesaj(DERS.tahminNotu(1, 'DDR5 bu yuvaya girmez: çentik çıkıntıya denk gelmiyor.', 'Aslında girmez: çentik çıkıntıya denk gelmiyor.'), 'yanlis');
        return bekle(2.2);
      }).then(function () {
        return D.git(d5, new V3(0, d5.position.y, -3), AZ ? 0.01 : 0.7);
      }).then(function () {
        hizaKur(d4.getObjectByName('centik'), yuva.getObjectByName('cikinti'),
          { yanlisMetin: '✗ Çentik çıkıntıya denk gelmiyor', dogruMetin: '✓ DDR4 çentiği çıkıntıya denk geldi' });
        mesaj('Şimdi DDR4 kendi yuvasında…', '');
        return D.takAnim(d4, { hedef: hedef, dogru: true, yukseklik: 2.6, yuva: yuva });
      }).then(function () {
        mesaj('✓ DDR4 kendi yuvasına oturdu. Her nesil yalnız kendi yuvasına girer.', 'dogru');
        mesgul = false;
      });
    }
    function baslangic(sessiz) {
      if (hiza) { hiza.kaldir(); hiza = null; }
      ceti.forEach(function (e) { e.kaldir(); }); ceti = [];
      var p = [];
      if (yuva) {
        if (yuva.userData.mandalAcik === false) p.push(yuva.userData.mandal(true, 0.01));
        yuva.visible = false;
      }
      d4.position.set(0, Y4, 0); d5.position.set(0, 0, 0);
      saydam(1);
      et5.goster(true);
      if (!sessiz) { mesaj(''); karsilastirHiza(); }
      p.push(s.kameraGit({ hedef: s._baslangic.hedef, yakinlik: 1, theta: s._baslangic.theta, phi: s._baslangic.phi }, AZ ? 0.01 : 0.6));
      return Promise.all(p);
    }
    s.dugme('Çakıştır', 'oynat', cakistir, { yer: 'alt-orta', aciklama: 'DDR4 modülünü DDR5 modülünün üzerine getir ve çentiklere yakınlaş' });
    s.dugme('Yuvaya dene', 'oynat', yuvayaDene, { yer: 'alt-orta', aciklama: 'DDR5 modülünü DDR4 yuvasına takmayı dene' });
    s.dugme('Baştan', 'sifirla', function () { if (!mesgul) baslangic(false); }, { yer: 'alt-orta', aciklama: 'Sahneyi başa al' });
    s._h03 = { d4: d4, d5: d5, cakistir: cakistir, yuvayaDene: yuvayaDene, mesgul: function () { return mesgul; } };
  });

  /* ─────────── Adım 4: MT/s ve CL — gerçek gecikme ve bant genişliği ─────────── */
  (function () {
    var kok = document.getElementById('mtcl');
    if (!kok) return;
    var MOD = [
      { ad: 'DDR4-2666 CL19', mt: 2666, cl: 19, bl: 8 },
      { ad: 'DDR4-3200 CL16', mt: 3200, cl: 16, bl: 8 },
      { ad: 'DDR5-4800 CL40', mt: 4800, cl: 40, bl: 16 },
      { ad: 'DDR5-6000 CL30', mt: 6000, cl: 30, bl: 16 }
    ];
    MOD.forEach(function (m) { m.per = 2000 / m.mt; m.ns = m.cl * m.per; m.bw = m.mt * 8 / 1000; });
    var OLCEK = 22;   // ns
    kok.innerHTML = '<div class="secici mc-sec" role="group" aria-label="Bellek modülü"></div>' +
      '<div class="mc-zaman"><div class="mc-bas"><b></b><span></span></div><div class="mc-serit"><div class="mc-ticks"></div><div class="mc-veri">veri</div></div>' +
      '<div class="mc-eksen"></div></div><div class="mc-tablo"></div><div class="panel-sonuc mc-sonuc" aria-live="polite"></div>' +
      '<div class="mc-not">Bant genişliği = MT/s × 8 B (64 bitlik tek modül). Değerler teoriktir.</div>';
    var sec = kok.querySelector('.mc-sec'), ticks = kok.querySelector('.mc-ticks'), veri = kok.querySelector('.mc-veri');
    var bas = kok.querySelector('.mc-bas'), sonuc = kok.querySelector('.mc-sonuc'), tablo = kok.querySelector('.mc-tablo');
    var eksen = kok.querySelector('.mc-eksen');
    [0, 5, 10, 15, 20].forEach(function (n) { var t = el('span', '', eksen, n + ' ns'); t.style.left = (n / OLCEK * 100) + '%'; });
    var satirlar = MOD.map(function (m) {
      var r = el('div', 'mc-satir', tablo);
      r.innerHTML = '<span class="mc-ad"></span><div class="mc-bar gec"><i></i><code></code></div><div class="mc-bar bw"><i></i><code></code></div>';
      r.querySelector('.mc-ad').textContent = m.ad;
      r.querySelector('.gec i').style.width = (m.ns / 18 * 100).toFixed(1) + '%';
      r.querySelector('.gec code').textContent = sayi(m.ns, 1) + ' ns';
      r.querySelector('.bw i').style.width = (m.bw / 48 * 100).toFixed(1) + '%';
      r.querySelector('.bw code').textContent = sayi(m.bw, 1) + ' GB/s';
      return r;
    });
    var bs = el('div', 'mc-satir mc-baslik', null);
    bs.innerHTML = '<span>Modül</span><span>Gerçek gecikme ↓ iyi</span><span>Bant genişliği ↑ iyi</span>';
    tablo.insertBefore(bs, tablo.firstChild);
    var gorulen = {}, dg = [], id = 0;
    function goster(i) {
      var m = MOD[i], my = ++id;
      gorulen[i] = true;
      dg.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      satirlar.forEach(function (r, j) { r.classList.toggle('secili', i === j); });
      bas.firstChild.textContent = m.ad;
      bas.lastChild.textContent = 'Saat ' + sayi(m.mt / 2) + ' MHz · 1 döngü = ' + sayi(m.per, 3) + ' ns · CL ' + m.cl + ' döngü';
      ticks.innerHTML = '';
      var hucre = [];
      for (var k = 0; k < m.cl; k++) {
        var h = el('i', '', ticks);
        h.style.left = (k * m.per / OLCEK * 100).toFixed(2) + '%';
        h.style.width = (m.per / OLCEK * 100).toFixed(2) + '%';
        hucre.push(h);
      }
      veri.style.left = (m.ns / OLCEK * 100).toFixed(2) + '%';
      veri.style.width = (m.bl / 2 * m.per / OLCEK * 100).toFixed(2) + '%';
      veri.classList.remove('gor');
      sonuc.textContent = '';
      var n = 0, adimSure = AZ ? 0 : 1400 / m.cl;
      (function dongu() {
        if (my !== id) return;
        if (n < hucre.length) { hucre[n++].classList.add('dolu'); if (adimSure) setTimeout(dongu, adimSure); else dongu(); return; }
        veri.classList.add('gor');
        sonuc.textContent = m.cl + ' × ' + sayi(m.per, 3) + ' ns ≈ ' + sayi(m.ns, 1) + ' ns gecikme · ' + sayi(m.bw, 1) + ' GB/s';
        if (gorulen[1] && gorulen[2] && (i === 1 || i === 2)) {
          sonuc.textContent += ' — DDR4-3200 CL16 daha çabuk cevap verir (10 ns); DDR5-4800 ise saniyede daha çok veri taşır.';
        } else if (i === 3) {
          sonuc.textContent += ' — CL30 büyük görünür ama gecikme DDR4-3200 CL16 ile aynı: 10 ns.';
        }
      })();
    }
    MOD.forEach(function (m, i) { var b = DERS.dugme(sec, m.ad.replace(' ', ' · '), function () { goster(i); }); b.setAttribute('aria-pressed', 'false'); dg.push(b); });
    goster(1);
    DERS.slaytAcilinca('s8', function () { goster(1); });
  })();

  /* ─────────── Adım 5: tek ve çift kanal (A-AKIS, 2D) ─────────── */
  (function () {
    var kok = document.getElementById('kanal');
    if (!kok) return;
    var DUZEN = {
      tek: { ad: 'Tek modül', yuva: { A2: '16 GB' }, kanal: ['A'], bw: 25.6,
        ac: '1 × 16 GB (A2): yalnız A kanalı çalışır. Teorik bant genişliği 25,6 GB/s (DDR4-3200).' },
      cift: { ad: 'Çift kanal', yuva: { A2: '8 GB', B2: '8 GB' }, kanal: ['A', 'B'], bw: 51.2,
        ac: '2 × 8 GB (A2 + B2): iki kanal aynı anda veri taşır. Teorik bant genişliği 51,2 GB/s.' },
      ayni: { ad: 'Aynı kanal', yuva: { A1: '8 GB', A2: '8 GB' }, kanal: ['A'], bw: 25.6,
        ac: '2 × 8 GB (A1 + A2): kapasite 16 GB ama iki modül aynı kanalı paylaşır; bant genişliği artmaz.' }
    };
    var F = 'font-family="Inter,Arial,sans-serif"';
    var YUVA = { A1: 46, A2: 82, B1: 138, B2: 174 };
    var svg = '<svg viewBox="0 0 360 220" class="kn-svg" role="img" aria-label="İşlemcideki bellek denetleyicisinden A ve B kanallarına giden veri yolları ve dört RAM yuvası">' +
      '<rect width="360" height="220" rx="14" fill="#f8fafc"/>' +
      '<rect x="14" y="44" width="96" height="132" rx="12" fill="#e0e7ff" stroke="#4f46e5" stroke-width="2"/>' +
      '<text x="62" y="92" ' + F + ' font-size="13" font-weight="900" fill="#3730a3" text-anchor="middle">İşlemci</text>' +
      '<rect x="24" y="104" width="76" height="46" rx="8" fill="#fff" stroke="#6366f1"/>' +
      '<text x="62" y="123" ' + F + ' font-size="8.5" font-weight="800" fill="#4338ca" text-anchor="middle">Bellek</text>' +
      '<text x="62" y="136" ' + F + ' font-size="8.5" font-weight="800" fill="#4338ca" text-anchor="middle">denetleyicisi</text>';
    [['A', 64, '#0284c7'], ['B', 156, '#c2410c']].forEach(function (k) {
      var y1 = YUVA[k[0] + '1'], y2 = YUVA[k[0] + '2'];
      var d = 'M100 ' + k[1] + ' H170 V' + y1 + ' H214 M170 ' + y1 + ' V' + y2 + ' H214';
      svg += '<g class="kn-kanal" data-kanal="' + k[0] + '"><path d="' + d + '" fill="none" stroke="' + k[2] + '" stroke-width="7" stroke-linejoin="round" opacity=".25"/>' +
        '<path class="kn-akis" d="M100 ' + k[1] + ' H170 V' + y2 + ' H214" fill="none" stroke="' + k[2] + '" stroke-width="5" stroke-dasharray="6 12" stroke-linecap="round"/>' +
        '<text x="134" y="' + (k[1] - 8) + '" ' + F + ' font-size="10" font-weight="900" fill="' + k[2] + '" text-anchor="middle">Kanal ' + k[0] + '</text></g>';
    });
    Object.keys(YUVA).forEach(function (a) {
      var y = YUVA[a];
      svg += '<g class="kn-yuva" data-yuva="' + a + '"><rect x="214" y="' + (y - 11) + '" width="132" height="22" rx="5" fill="#1f2937"/>' +
        '<rect class="kn-modul" x="220" y="' + (y - 8) + '" width="120" height="16" rx="2" fill="#1f5a3a"/>' +
        '<g class="kn-cipler">' + [0, 1, 2, 3, 4, 5].map(function (c) { return '<rect x="' + (228 + c * 18) + '" y="' + (y - 6) + '" width="10" height="9" rx="1" fill="#111"/>'; }).join('') + '</g>' +
        '<rect class="kn-temas" x="222" y="' + (y + 5) + '" width="116" height="3" fill="#e3b04f"/>' +
        '<text class="kn-ad" x="208" y="' + (y - 6) + '" ' + F + ' font-size="10" font-weight="900" fill="#334155" text-anchor="end">' + a + '</text>' +
        '<text class="kn-kap" x="280" y="' + (y + 4) + '" ' + F + ' font-size="9" font-weight="900" fill="#fff" text-anchor="middle"></text></g>';
    });
    svg += '</svg>';
    kok.innerHTML = '<div class="kn-sahne">' + svg + '</div><div class="kn-olcu"><span>Teorik bant genişliği</span><div class="kn-bar"><i></i></div><code>0 GB/s</code></div>' +
      '<div class="secici kn-sec" role="group" aria-label="Yerleşim"></div><div class="vn-kart kn-kart" aria-live="polite"><b></b><span></span></div>';
    var s = kok.querySelector('svg'), dolgu = kok.querySelector('.kn-bar i'), deger = kok.querySelector('.kn-olcu code');
    var kart = kok.querySelector('.kn-kart'), dg = {};
    function uygula(ad) {
      var d = DUZEN[ad];
      Object.keys(dg).forEach(function (k) { dg[k].setAttribute('aria-pressed', k === ad ? 'true' : 'false'); });
      s.querySelectorAll('.kn-yuva').forEach(function (g) {
        var kap = d.yuva[g.dataset.yuva];
        g.classList.toggle('dolu', !!kap);
        g.querySelector('.kn-kap').textContent = kap || '';
      });
      s.querySelectorAll('.kn-kanal').forEach(function (g) {
        var akt = d.kanal.indexOf(g.dataset.kanal) >= 0;
        g.classList.toggle('aktif', akt);
      });
      dolgu.style.width = (d.bw / 51.2 * 100).toFixed(0) + '%';
      deger.textContent = sayi(d.bw, 1) + ' GB/s';
      kart.firstChild.textContent = d.ad + (d.kanal.length === 2 ? ' · 2 kanal etkin' : ' · 1 kanal etkin');
      kart.lastChild.textContent = d.ac;
    }
    var sec = kok.querySelector('.kn-sec');
    [['tek', 'Tek modül'], ['cift', 'Çift kanal'], ['ayni', 'Aynı kanal']].forEach(function (x) {
      dg[x[0]] = DERS.dugme(sec, x[1], function () { uygula(x[0]); });
    });
    uygula('tek');
    DERS.slaytAcilinca('s9', function () {
      if (AZ) return;
      setTimeout(function () { uygula('cift'); }, 2600);
    });
  })();

  /* ─────────── Adım 6: DIMM ve SO-DIMM (3D) ─────────── */
  D.tembel('#s10-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, zemin: false,
      kamera: { yon: [0.22, 0.32, 1], pay: 0.92 } });
    var dimm = s.ekle('M-RAM', { konum: [0, 4.3, 0] });
    var so4 = s.ekle(D.model('M-SODIMM', { tur: 'DDR4' }), { konum: [-3.75, 0, 0] });
    var so5 = s.ekle(D.model('M-SODIMM', { tur: 'DDR5' }), { konum: [3.75, 0, 0] });
    so4.name = 'sodimm-ddr4'; so5.name = 'sodimm-ddr5';
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.8, maxPolar: 1.95, minYakin: 0.15, maxYakin: 1.5 } });
    var mesaj = DERS.sahneMesaj(s);
    var etD = s.etiket(dimm, 'DIMM · ≈ 13,3 cm · 288 temas', { ofset: [0, 0.2, 0] });
    var et4 = s.etiket(so4, 'SO-DIMM DDR4 · 260 temas', { yer: 'alt', ofset: [0, -0.2, 0] });
    var et5 = s.etiket(so5, 'SO-DIMM DDR5 · 262 temas', { yer: 'alt', ofset: [0, -0.2, 0] });
    var P4 = so4.position.clone(), P5 = so5.position.clone(), PD = dimm.position.clone();
    var hiza = null, mesgul = false;
    function sifirla(sure) {
      if (hiza) { hiza.kaldir(); hiza = null; }
      so4.position.copy(P4); so5.position.copy(P5); dimm.position.copy(PD);
      [etD, et4, et5].forEach(function (e) { e.goster(true); });
      mesaj('');
      return s.kameraGit({ hedef: s._baslangic.hedef, yakinlik: 1, theta: s._baslangic.theta, phi: s._baslangic.phi }, sure == null ? 0.6 : sure);
    }
    function boy() {
      if (mesgul) return; mesgul = true;
      sifirla(0.4).then(function () {
        return D.git(so4, new V3(-(13.335 - 6.96) / 2, PD.y - 0.7, 0.4), AZ ? 0.01 : 1.1);
      }).then(function () {
        mesaj('SO-DIMM, DIMM’in yaklaşık yarısı uzunluğunda: ≈ 7 cm ve ≈ 13,3 cm.', '');
        mesgul = false;
      });
    }
    function nesiller() {
      if (mesgul) return; mesgul = true;
      sifirla(0.4).then(function () {
        etD.goster(false); et5.goster(false);
        return D.git(so5, new V3(P4.x, -3.6, 0), AZ ? 0.01 : 1.1);
      }).then(function () {
        hiza = D.hiza(s, so4.getObjectByName('centik'), so5.getObjectByName('centik'),
          { kalinlik: 0.025, yanlisMetin: '✗ SO-DIMM çentikleri de farklı', dogruMetin: '✓ Aynı hizada' });
        var c = so5.getObjectByName('centik').getWorldPosition(new V3());
        return s.kameraGit({ hedef: [c.x, -1.8, 0], yakinlik: 0.55, theta: s._baslangic.theta, phi: 1.45 }, AZ ? 0.01 : 1.1);
      }).then(function () {
        mesaj('DDR4 ve DDR5 SO-DIMM de birbirinin yuvasına girmez.', 'yanlis');
        mesgul = false;
      });
    }
    s.dugme('Boyları kıyasla', 'oynat', boy, { yer: 'alt-orta', aciklama: 'SO-DIMM modülünü DIMM modülünün önüne getir' });
    s.dugme('SO-DIMM nesilleri', 'oynat', nesiller, { yer: 'alt-orta', aciklama: 'DDR4 ve DDR5 SO-DIMM çentiklerini karşılaştır' });
    s.dugme('Baştan', 'sifirla', function () { if (!mesgul) sifirla(); }, { yer: 'alt-orta', aciklama: 'Sahneyi başa al' });
    s._h03 = { boy: boy, nesiller: nesiller };
  });

  /* ─────────── Etkinlik 1: insan ölçeğinde hiyerarşi görevi ─────────── */
  (function () {
    var kok = document.getElementById('olcek-gorev');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var SORU = [
      ['İşlemci aradığı veriyi L1’de bulamadı, L2’de buldu. İnsan ölçeğinde yaklaşık ne kadar bekler?', ['≈ 4 saniye', '≈ 1,3 dakika', '≈ 1 gün'], 0,
        'L2 yaklaşık 4 ns: bu ölçekte 4 saniye.'],
      ['Veri hiçbir önbellekte yok, RAM’den gelecek. İnsan ölçeğinde bekleme ne kadardır?', ['≈ 12 saniye', '≈ 2 ay', '≈ 1,3 dakika'], 2,
        'RAM yaklaşık 80 ns: bu ölçekte 80 saniye, yani 1,3 dakika.'],
      ['Program ilk kez HDD’den açılıyor; rastgele bir okuma yapılıyor. İnsan ölçeğinde?', ['≈ 22 saat', '≈ 58 gün (2 ay)', '≈ 80 saniye'], 1,
        'HDD yaklaşık 5 ms: bu ölçekte 5 milyon saniye, yaklaşık 58 gün.']
    ];
    kok.innerHTML = '<div class="og"><div class="og-merdiven" aria-live="polite"></div><div class="og-alt"></div><div class="og-geri" aria-live="polite"></div></div>';
    var merdiven = kok.querySelector('.og-merdiven'), alt = kok.querySelector('.og-alt'), geri = kok.querySelector('.og-geri');
    var yerler = KAT.map(function (k, i) {
      var r = el('div', 'og-yer', merdiven);
      r.innerHTML = '<span class="og-no">' + (i + 1) + '</span><b>?</b><div class="og-bar"><i></i></div><code></code>';
      return r;
    });
    el('div', 'og-uc', merdiven, '1 = en hızlı · 7 = en yavaş');
    var sira = 0, dogru = 0, soruNo = 0;
    function kartlariKur() {
      alt.innerHTML = '';
      alt.className = 'og-alt og-kartlar';
      var karisik = [4, 1, 6, 0, 3, 5, 2];
      karisik.forEach(function (i) {
        var b = DERS.dugme(alt, KAT[i].ad, function () { sec(i, b); }, 'og-kart');
        b.style.setProperty('--r', KAT[i].renk);
      });
    }
    function sec(i, b) {
      if (b.disabled) return;
      if (i === sira) {
        var r = yerler[sira], k = KAT[i];
        r.classList.add('dolu'); r.style.setProperty('--r', k.renk);
        r.querySelector('b').textContent = k.ad;
        r.querySelector('code').textContent = k.insan;
        r.querySelector('.og-bar i').style.width = (logOran(k.ns) * 100).toFixed(1) + '%';
        b.disabled = true; b.classList.add('yerlesti');
        geri.className = 'og-geri iyi'; geri.textContent = '✓ ' + k.ad + ': ' + k.gercek + ' → insan ölçeğinde ' + k.insan + '.';
        D.ses('klik');
        sira++; dogru++; ilerle(dogru, 10);
        if (sira === KAT.length) setTimeout(soruGoster, AZ ? 10 : 900);
      } else {
        b.classList.remove('salla'); void b.offsetWidth; b.classList.add('salla');
        D.ses('hata');
        geri.className = 'og-geri kotu';
        geri.textContent = '✗ ' + KAT[i].ad + ' sırada değil: ' + (i > sira ? 'bundan daha hızlı bir katman var.' : 'bu katman zaten yerleşti.');
      }
    }
    function soruGoster() {
      if (soruNo >= SORU.length) return bitir();
      var q = SORU[soruNo];
      alt.className = 'og-alt og-soru';
      alt.innerHTML = '<div class="og-s"><span>Görev ' + (soruNo + 1) + ' / 3</span><b></b></div><div class="og-sec"></div>';
      alt.querySelector('.og-s b').textContent = q[0];
      geri.className = 'og-geri'; geri.textContent = '';
      var kutu = alt.querySelector('.og-sec');
      q[1].forEach(function (m, j) {
        var b = DERS.dugme(kutu, m, function () {
          if (j === q[2]) {
            kutu.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
            b.classList.add('iyi'); D.ses('klik');
            geri.className = 'og-geri iyi'; geri.textContent = '✓ ' + q[3];
            dogru++; ilerle(dogru, 10); soruNo++;
            DERS.dugme(geri, soruNo < SORU.length ? 'Sonraki görev →' : 'Sonucu gör →', soruGoster, 'dy-ileri');
          } else {
            b.classList.add('kotu'); b.disabled = true; D.ses('hata');
            geri.className = 'og-geri kotu'; geri.textContent = '✗ Merdivendeki sürelere tekrar bak.';
          }
        }, 'og-secenek');
      });
    }
    function bitir() {
      alt.className = 'og-alt og-son';
      alt.innerHTML = '<b>Tamamlandı</b><span>RAM’e gitmek önbelleğe göre onlarca kat, diske gitmek milyonlarca kat daha uzun sürer. İşlemci bu yüzden sık kullanılan veriyi önbellekte tutar.</span>';
      geri.className = 'og-geri'; geri.textContent = '';
      DERS.dugme(alt, 'Yeniden oyna', function () {
        sira = 0; dogru = 0; soruNo = 0; ilerle(0, 10);
        yerler.forEach(function (r) { r.classList.remove('dolu'); r.querySelector('b').textContent = '?'; r.querySelector('code').textContent = ''; r.querySelector('.og-bar i').style.width = '0'; });
        kartlariKur();
      }, 'dy-ileri');
      DERS.konfeti();
    }
    kartlariKur();
  })();

  /* ─────────── Etkinlik 2: doğru belleği seç ─────────── */
  (function () {
    var kok = document.getElementById('bellek-sec');
    if (!kok) return;
    var F = 'font-family="Inter,Arial,sans-serif"';
    // Modül çizimi: tip 'dimm' | 'sodimm', gen 'DDR4' | 'DDR5'
    function modulSvg(tip, gen) {
      var dimm = tip === 'dimm', w = dimm ? 150 : 76, x = (160 - w) / 2, renk = gen === 'DDR5' ? '#1d4b54' : '#1f5a3a';
      var cx = 80 + (gen === 'DDR5' ? 0.015 : 0.05) * w * (dimm ? 1 : 1.2);
      var cip = dimm ? 8 : 4, s = '';
      for (var i = 0; i < cip; i++) {
        var cxp = x + 6 + i * ((w - 12 - 10) / (cip - 1));
        if (gen === 'DDR5' && dimm && i >= 4) cxp += 0;
        s += '<rect x="' + cxp.toFixed(1) + '" y="18" width="10" height="16" rx="1" fill="#111"/>';
      }
      if (gen === 'DDR5') s += '<rect x="' + (80 - 4) + '" y="10" width="8" height="6" rx="1" fill="#6b7280"/>';
      return '<svg viewBox="0 0 160 60" aria-hidden="true"><rect x="' + x + '" y="6" width="' + w + '" height="40" rx="2" fill="' + renk + '"/>' + s +
        '<rect x="' + (x + 3) + '" y="38" width="' + (w - 6) + '" height="7" fill="#e3b04f"/>' +
        '<rect x="' + (cx - 2) + '" y="37" width="4" height="10" rx="1" fill="#fff"/>' +
        '<text x="80" y="57" ' + F + ' font-size="9" font-weight="900" fill="#475569" text-anchor="middle">' + (dimm ? 'DIMM' : 'SO-DIMM') + ' · ' + gen + '</text></svg>';
    }
    function yuvaSvg(dolu) {
      var s = '<svg viewBox="0 0 160 60" aria-hidden="true">';
      ['A1', 'A2', 'B1', 'B2'].forEach(function (a, i) {
        var x = 18 + i * 34 + (i > 1 ? 8 : 0);
        s += '<rect x="' + x + '" y="6" width="14" height="40" rx="3" fill="#1f2937"/>';
        if (dolu.indexOf(a) >= 0) s += '<rect x="' + (x + 3) + '" y="9" width="8" height="34" rx="1" fill="#1f5a3a"/>';
        s += '<text x="' + (x + 7) + '" y="57" ' + F + ' font-size="9" font-weight="900" fill="' + (a[0] === 'A' ? '#0284c7' : '#c2410c') + '" text-anchor="middle">' + a + '</text>';
      });
      return s + '</svg>';
    }
    var TUR = [
      { q: 'Ece’nin masaüstü anakartında DDR5 DIMM yuvaları var. Hangisi takılır?',
        s: [[modulSvg('dimm', 'DDR4'), 'DDR4-3200 CL16', '16 GB DIMM'], [modulSvg('dimm', 'DDR5'), 'DDR5-5600 CL36', '16 GB DIMM'], [modulSvg('sodimm', 'DDR5'), 'DDR5-5600 CL40', '16 GB SO-DIMM']],
        d: 1, ac: 'DDR5 DIMM: hem boy hem çentik uyar. DDR4’ün çentiği farklı, SO-DIMM ise kısa ve dizüstü yuvası içindir.' },
      { q: 'Deniz’in dizüstü bilgisayarında DDR4 SO-DIMM yuvası var. Hangisi takılır?',
        s: [[modulSvg('sodimm', 'DDR5'), 'DDR5-4800 CL40', '8 GB SO-DIMM'], [modulSvg('dimm', 'DDR4'), 'DDR4-3200 CL22', '8 GB DIMM'], [modulSvg('sodimm', 'DDR4'), 'DDR4-3200 CL22', '8 GB SO-DIMM']],
        d: 2, ac: 'DDR4 SO-DIMM (260 temas) uyar. DDR5 SO-DIMM’in çentiği farklıdır; DIMM ise dizüstü yuvasına sığmaz.' },
      { q: 'Aynı anakarta uyan üç DDR4 modülünden gerçek gecikmesi en düşük olan hangisi?',
        s: [[modulSvg('dimm', 'DDR4'), 'DDR4-3600 CL16', '16 GB DIMM'], [modulSvg('dimm', 'DDR4'), 'DDR4-3200 CL22', '16 GB DIMM'], [modulSvg('dimm', 'DDR4'), 'DDR4-2666 CL16', '16 GB DIMM']],
        d: 0, ac: '16 × 2000 ÷ 3600 ≈ 8,9 ns; 22 × 2000 ÷ 3200 = 13,75 ns; 16 × 2000 ÷ 2666 ≈ 12 ns.' },
      { q: '16 GB bellek isteniyor. Anakart çift kanal destekliyor, kılavuz A2 ve B2 yuvalarını öneriyor. En iyi seçim hangisi?',
        s: [[yuvaSvg(['A2']), '1 × 16 GB', 'A2 yuvasına'], [yuvaSvg(['A1', 'A2']), '2 × 8 GB', 'A1 + A2 yuvalarına'], [yuvaSvg(['A2', 'B2']), '2 × 8 GB', 'A2 + B2 yuvalarına']],
        d: 2, ac: 'A2 + B2: iki modül farklı kanallarda, çift kanal etkin. A1 + A2 aynı kanalı paylaşır; tek modül tek kanaldır.' },
      { q: 'Uyumlu üç DDR5 modülden teorik bant genişliği en yüksek olan hangisi?',
        s: [[modulSvg('dimm', 'DDR5'), 'DDR5-4800 CL40', '16 GB DIMM'], [modulSvg('dimm', 'DDR5'), 'DDR5-6000 CL30', '16 GB DIMM'], [modulSvg('dimm', 'DDR5'), 'DDR5-5200 CL40', '16 GB DIMM']],
        d: 1, ac: 'Bant genişliği = MT/s × 8 B: 6000 × 8 = 48 GB/s; 4800 → 38,4 GB/s; 5200 → 41,6 GB/s.' }
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var i = 0, puan = 0;
    kok.innerHTML = '<div class="bs"><div class="bs-gorev"><span class="bs-no"></span><b></b></div><div class="bs-kartlar"></div><div class="bs-geri" aria-live="polite"></div></div>';
    var no = kok.querySelector('.bs-no'), soru = kok.querySelector('.bs-gorev b'), kartlar = kok.querySelector('.bs-kartlar'), geri = kok.querySelector('.bs-geri');
    function goster() {
      kartlar.innerHTML = ''; geri.innerHTML = ''; geri.className = 'bs-geri';
      if (i >= TUR.length) {
        no.textContent = 'Sonuç';
        soru.textContent = puan + ' / ' + TUR.length + ' görev ilk denemede doğru';
        geri.className = 'bs-geri son';
        geri.innerHTML = '<span></span>';
        geri.firstChild.textContent = puan >= 4 ? 'Biçim, nesil, gecikme ve kanal yerleşimini doğru okuyorsun.' : 'İpucu: önce biçim ve nesle, sonra CL × 2000 ÷ MT/s hesabına bak.';
        DERS.dugme(geri, 'Yeniden oyna', function () { i = 0; puan = 0; ilerle(0, TUR.length); goster(); }, 'dy-ileri');
        if (puan >= 4) DERS.konfeti();
        return;
      }
      var t = TUR[i], ilk = true;
      no.textContent = 'Görev ' + (i + 1) + ' / ' + TUR.length;
      soru.textContent = t.q;
      t.s.forEach(function (x, j) {
        var b = el('button', 'bs-kart', kartlar);
        b.type = 'button';
        b.innerHTML = '<span class="bs-resim">' + x[0] + '</span><b></b><small></small>';
        b.querySelector('b').textContent = x[1];
        b.querySelector('small').textContent = x[2];
        b.addEventListener('click', function () {
          if (j === t.d) {
            kartlar.querySelectorAll('button').forEach(function (y) { y.disabled = true; });
            b.classList.add('iyi'); D.ses('klik');
            if (ilk) puan++;
            geri.className = 'bs-geri iyi'; geri.innerHTML = '<span></span>';
            geri.firstChild.textContent = '✓ Doğru. ' + t.ac;
            i++; ilerle(i, TUR.length);
            DERS.dugme(geri, i < TUR.length ? 'Sonraki görev →' : 'Sonucu gör →', goster, 'dy-ileri');
          } else {
            ilk = false; b.classList.add('kotu'); b.disabled = true; D.ses('hata');
            geri.className = 'bs-geri kotu'; geri.innerHTML = '<span></span>';
            geri.firstChild.textContent = '✗ Bu seçenek uymaz. Tekrar dene: biçim, nesil ve değerleri karşılaştır.';
          }
        });
      });
    }
    goster();
  })();
})();
