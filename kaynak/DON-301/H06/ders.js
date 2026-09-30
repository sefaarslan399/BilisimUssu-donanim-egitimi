/* DON-301 H06 — Güç Kaynağı ve Soğutma · ders betiği (ortak betikten sonra çalışır)
   Derse özel kalıplar: A-AKIS 2D (AC → DC), güç bütçesi (A-SAYAC/A-DOLUM benzeri), 80 PLUS verim eğrisi,
   A-VURGU + döndürme (konnektörler), A-ISI + termometre (TDP), A-HAVA 2D kasa hava akışı + ısı haritası (E-SURGU),
   E-HESAP güç hesaplayıcı. Güç kaynağının içi hiçbir görselde gösterilmez (kapalı kutu). Değerler yaklaşık/örnektir. */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 2’de güç bütçesini hesaplayarak kontrol edeceğiz.');

  /* ─────────── Yardımcılar ─────────── */
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
  function secGrup(ebeveyn, secenekler, fn, ops) {
    ops = ops || {};
    var g = el('div', 'secici' + (ops.sinif ? ' ' + ops.sinif : ''), ebeveyn);
    g.setAttribute('role', 'group');
    if (ops.aria) g.setAttribute('aria-label', ops.aria);
    var dg = secenekler.map(function (s, i) {
      var b = DERS.dugme(g, s, function () { sec(i); fn(i); });
      b.setAttribute('aria-pressed', 'false');
      return b;
    });
    function sec(i) { dg.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); }); }
    if (ops.baslangic != null) sec(ops.baslangic);
    return { el: g, dugmeler: dg, sec: sec };
  }

  /* 80 PLUS (115 V iç test koşulları): %20, %50, %100 yükte en az verim */
  var SERT = [
    { ad: '80 PLUS', v: [80, 80, 80], renk: '#94a3b8' },
    { ad: 'Bronze', v: [82, 85, 82], renk: '#b45309' },
    { ad: 'Silver', v: [85, 88, 85], renk: '#64748b' },
    { ad: 'Gold', v: [87, 90, 87], renk: '#ca8a04' },
    { ad: 'Platinum', v: [90, 92, 89], renk: '#0891b2' },
    { ad: 'Titanium', v: [92, 94, 90], renk: '#7c3aed' }
  ];
  function sertBul(ad) { return SERT.filter(function (s) { return s.ad === ad; })[0]; }
  /** Yük yüzdesine göre yaklaşık verim (%) — test noktaları arasında doğrusal; %20 altı hafifçe düşer. */
  function verimAt(s, yuk) {
    var v = s.v;
    if (yuk <= 20) return v[0] - (20 - Math.max(yuk, 5)) * 0.3;
    if (yuk <= 50) return v[0] + (v[1] - v[0]) * (yuk - 20) / 30;
    return v[1] + (v[2] - v[1]) * (Math.min(yuk, 100) - 50) / 50;
  }
  var STANDART = [300, 450, 550, 650, 750, 850, 1000, 1200];
  function standartUst(w) { for (var i = 0; i < STANDART.length; i++) if (STANDART[i] >= w - 0.01) return STANDART[i]; return 1600; }

  /* ─────────── Kapak: güç kaynağı + konnektörler + soğutucu, hafif salınım ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, zemin: false, arkaPlan: 'seffaf',
      kamera: { yon: [0.35, 0.42, 1], pay: 0.86 } });
    s.ekle('M-PSU', { konum: [-9.5, 0, -3], donus: [0, 0.35, 0] });
    s.ekle('M-KABLO-GUC', { konum: [3.2, -1.2, 7], olcek: 1.25 });
    var cpu = s.ekle('M-CPU', { konum: [15, 0, -2], olcek: 1.0 });
    var sog = s.ekle('M-SOGUTUCU', { konum: [15, cpu.userData.olcu.kapakY, -2], donus: [0, -0.5, 0] });
    s.yerlestir();
    sog.userData.fan.userData.hiz = 6; sog.userData.fan.userData.baslat(s);
    var t0 = s.orb.theta, z = 0;
    s.herKare(function (dt) { if (!AZ) { z += dt; s.orb.theta = t0 + Math.sin(z * 0.3) * 0.3; } });
  });

  /* ─────────── Adım 1: AC → DC (A-AKIS 2D) + etiket okuma ─────────── */
  (function () {
    var kok = document.getElementById('acdc');
    if (!kok) return;
    var HAT = [
      { v: '+12 V', renk: '#eab308', tel: 'sarı', y: 62, hedef: 'İşlemci · ekran kartı · fanlar', a: 45, bilgi: 'En çok gücü taşıyan hat: işlemci (EPS), ekran kartı (PCIe), fanlar ve HDD motoru.' },
      { v: '+5 V', renk: '#dc2626', tel: 'kırmızı', y: 92, hedef: 'USB · SATA diskler', a: 20, bilgi: 'USB aygıtları ve SATA disklerin elektroniği.' },
      { v: '+3,3 V', renk: '#ea580c', tel: 'turuncu', y: 122, hedef: 'M.2 SSD · anakart', a: 20, bilgi: 'M.2 SSD’ler ve anakart üzerindeki bazı devreler.' }
    ];
    var foto = kok.querySelector('.foto-kart');
    kok.innerHTML = '<div class="ac-gorunum"></div><div class="ac-sahne"></div><div class="ac-kart" aria-live="polite"></div><div class="secici ac-kontrol"></div>';
    var sahne = kok.querySelector('.ac-sahne'), kart = kok.querySelector('.ac-kart');
    var svg = '<svg viewBox="0 0 360 206" class="ac-svg" role="img" aria-label="Prizden gelen 230 V AC dalgası kapalı güç kaynağına girer; çıkışta +12 V, +5 V ve +3,3 V sabit DC hatlar bileşenlere gider">' +
      // priz
      '<rect x="8" y="62" width="36" height="50" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/><circle cx="20" cy="87" r="3.4" fill="#334155"/><circle cx="32" cy="87" r="3.4" fill="#334155"/>' +
      '<text x="26" y="128" class="ac-t" text-anchor="middle">Priz</text><text x="26" y="141" class="ac-k" text-anchor="middle">230 V AC</text><text x="26" y="153" class="ac-k" text-anchor="middle">50 Hz</text>' +
      '<path class="ac-dalga" d="" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>' +
      // kapalı güç kaynağı (içi gösterilmez)
      '<g class="ac-psu"><rect x="98" y="40" width="76" height="96" rx="9" fill="#1f2328"/><rect x="103" y="45" width="66" height="86" rx="6" fill="#2b3037"/>' +
      '<circle cx="136" cy="80" r="22" fill="#101215" stroke="#4b5563" stroke-width="1.5"/><circle cx="136" cy="80" r="14" fill="none" stroke="#4b5563"/><circle cx="136" cy="80" r="7" fill="none" stroke="#4b5563"/>' +
      '<path d="M114 80H158M136 58V102" stroke="#4b5563"/>' +
      '<path d="M136 108l9 16h-18z" fill="#facc15" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/><path d="M137 113l-3 5h3l-2 4" fill="none" stroke="#111" stroke-width="1.3" stroke-linecap="round"/>' +
      '<text x="136" y="32" class="ac-t" text-anchor="middle">Güç kaynağı (PSU)</text><text x="136" y="150" class="ac-uyari" text-anchor="middle">Kapalı kutu · içi açılmaz</text></g>';
    HAT.forEach(function (h, i) {
      var y = 56 + i * 32;
      svg += '<g class="ac-hat" data-i="' + i + '"><path d="M174 ' + y + 'H196" stroke="' + h.renk + '" stroke-width="4"/>' +
        '<path class="ac-akis" d="M174 ' + y + 'H196" stroke="#fff" stroke-width="2" stroke-dasharray="3 9"/>' +
        '<rect x="196" y="' + (y - 14) + '" width="160" height="28" rx="7" fill="#f8fafc" stroke="' + h.renk + '" stroke-width="1.8"/>' +
        '<text x="203" y="' + (y - 2) + '" class="ac-v" fill="' + h.renk + '">' + h.v + ' DC</text>' +
        '<text x="203" y="' + (y + 10) + '" class="ac-k">' + h.hedef + '</text></g>';
    });
    // gerilim–zaman grafikleri (giriş AC, çıkış DC)
    svg += '<g class="ac-grafik"><rect x="4" y="164" width="170" height="38" rx="6" fill="#f1f5f9"/><path d="M8 186H170" stroke="#cbd5e1"/>' +
      '<path class="ac-mini" d="" fill="none" stroke="#0284c7" stroke-width="2"/><text x="10" y="176" class="ac-k">giriş: yön değiştirir</text>' +
      '<rect x="186" y="164" width="170" height="38" rx="6" fill="#f1f5f9"/><path d="M190 198H352" stroke="#cbd5e1"/>' +
      '<path d="M190 182H352" stroke="#eab308" stroke-width="2"/><path d="M190 189H352" stroke="#dc2626" stroke-width="2"/><path d="M190 193H352" stroke="#ea580c" stroke-width="2"/>' +
      '<text x="192" y="176" class="ac-k">çıkış: sabit (DC)</text></g></svg>';
    var etiketHtml = '<div class="ac-etiket" role="table" aria-label="Güç kaynağı etiketi: DC çıkış değerleri">' +
      '<div class="ac-e-bas"><b>GÜÇ KAYNAĞI · 550 W</b><span>AC giriş: 200–240 V ~ 50/60 Hz</span></div>' +
      '<div class="ac-e-satir ac-e-baslik" role="row"><span>DC çıkış</span><span>+3,3 V</span><span>+5 V</span><span>+12 V</span><span>−12 V</span><span>+5 VSB</span></div>' +
      '<div class="ac-e-satir" role="row"><span>En çok akım</span><button type="button" data-h="2">20 A</button><button type="button" data-h="1">20 A</button><button type="button" data-h="0">45 A</button><span>0,3 A</span><span>2,5 A</span></div>' +
      '<div class="ac-e-satir" role="row"><span>En çok güç</span><span class="ac-e-bir">120 W (+3,3 V ve +5 V birlikte)</span><span class="ac-e-12">540 W</span><span>3,6 W</span><span>12,5 W</span></div>' +
      '<div class="ac-e-alt"><span>Toplam sürekli güç: <b>550 W</b></span></div></div>';
    sahne.innerHTML = svg + etiketHtml;
    var svgEl = sahne.querySelector('svg'), etk = sahne.querySelector('.ac-etiket');
    if (foto) etk.querySelector('.ac-e-alt').appendChild(foto);
    var dalga = svgEl.querySelector('.ac-dalga'), mini = svgEl.querySelector('.ac-mini'), hatlar = svgEl.querySelectorAll('.ac-hat');
    var faz = 0, dongu = null, son = 0;
    function dalgaCiz() {
      var d = '', m = '';
      for (var x = 0; x <= 46; x += 2) d += (x ? 'L' : 'M') + (49 + x) + ' ' + (87 + Math.sin((x / 18) * Math.PI * 2 - faz) * 15).toFixed(1);
      for (x = 0; x <= 160; x += 2) m += (x ? 'L' : 'M') + (10 + x) + ' ' + (189 + Math.sin((x / 32) * Math.PI * 2 - faz) * 8).toFixed(1);
      dalga.setAttribute('d', d); mini.setAttribute('d', m);
    }
    function calis() {
      if (dongu) return;
      son = performance.now();
      (function kare(t) {
        if (!aktifMi('s5')) { dongu = null; return; }
        faz += Math.min(0.1, (t - son) / 1000) * (AZ ? 0.6 : 5); son = t;
        dalgaCiz();
        dongu = requestAnimationFrame(kare);
      })(son);
    }
    dalgaCiz();
    function hatGoster(i) {
      hatlar.forEach(function (h, j) { h.classList.toggle('soluk', i != null && i !== j); });
      if (i == null) { kart.innerHTML = '<b>AC → DC</b><span>Prizden gelen AC, güç kaynağında üç sabit DC hatta dönüşür. Bir hatta dokun.</span>'; kart.style.borderLeftColor = ''; return; }
      var h = HAT[i];
      kart.innerHTML = '<b></b><span></span>';
      kart.firstChild.textContent = h.v + ' hattı (' + h.tel + ' tel)';
      kart.lastChild.textContent = h.bilgi;
      kart.style.borderLeftColor = h.renk;
    }
    hatlar.forEach(function (h) {
      h.setAttribute('tabindex', '0'); h.setAttribute('role', 'button');
      h.addEventListener('click', function () { hatGoster(+h.dataset.i); });
      h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hatGoster(+h.dataset.i); } });
    });
    etk.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.h, h = HAT[i];
        etk.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        kart.innerHTML = '<b></b><span></span>';
        var v = [12, 5, 3.3][i], a = h.a, wv = v * a;
        kart.firstChild.textContent = h.v + ': ' + sayi(v, v % 1 ? 1 : 0) + ' V × ' + a + ' A = ' + sayi(wv, 0) + ' W';
        kart.lastChild.textContent = i === 0 ? 'Güç kaynağının neredeyse tüm gücü +12 V hattından verilebilir; işlemci ve ekran kartı buradan beslenir.'
          : '+3,3 V ve +5 V birlikte en çok 120 W verebilir; bu hatların yükü günümüz sistemlerinde küçüktür.';
        kart.style.borderLeftColor = h.renk;
      });
    });
    var gor = secGrup(kok.querySelector('.ac-gorunum'), ['Dönüşüm', 'Etiketi oku'], function (i) {
      sahne.classList.toggle('etiket-acik', i === 1);
      if (i === 1) { kart.innerHTML = '<b>Etiket</b><span>Bir hattın akım değerine dokun: güç = gerilim × akım.</span>'; kart.style.borderLeftColor = ''; }
      else hatGoster(null);
    }, { baslangic: 0, aria: 'Görünüm' });
    var oynuyor = false;
    function oynat() {
      if (oynuyor) return;
      oynuyor = true;
      gor.sec(0); sahne.classList.remove('etiket-acik');
      svgEl.classList.add('akis-yok');
      hatlar.forEach(function (h) { h.classList.add('gizli'); });
      kart.innerHTML = '<b>1 · AC girer</b><span>230 V, 50 Hz: gerilim saniyede 50 kez yön değiştirir (tepe değeri ≈ 325 V).</span>';
      var z = bekle(1.8).then(function () {
        svgEl.classList.add('psu-parla');
        kart.innerHTML = '<b>2 · Dönüştürülür</b><span>Kapalı kutunun içinde doğrultma, filtreleme ve anahtarlamalı dönüştürme yapılır; gerilim düşürülür ve sabitlenir.</span>';
        return bekle(2.2);
      });
      HAT.forEach(function (h, i) {
        z = z.then(function () {
          svgEl.classList.remove('psu-parla'); svgEl.classList.remove('akis-yok');
          hatlar[i].classList.remove('gizli');
          hatGoster(i);
          return bekle(1.8);
        });
      });
      z.then(function () { hatGoster(null); oynuyor = false; });
    }
    var ctl = kok.querySelector('.ac-kontrol');
    DERS.dugme(ctl, 'Oynat ▶', oynat);
    DERS.dugme(ctl, 'Baştan', function () { if (oynuyor) return; hatlar.forEach(function (h) { h.classList.remove('gizli', 'soluk'); }); svgEl.classList.remove('akis-yok'); hatGoster(null); });
    hatGoster(null);
    DERS.slaytAcilinca('s5', calis, true);
    DERS.slaytAcilinca('s5', function () { setTimeout(oynat, AZ ? 0 : 500); });
  })();

  /* ─────────── Adım 2: güç bütçesi (topla → pay → yuvarla) ─────────── */
  (function () {
    var kok = document.getElementById('guc-hesap');
    if (!kok) return;
    var PARCA = [
      { ad: 'İşlemci', w: 125, renk: '#4f46e5' },
      { ad: 'Ekran kartı', w: 220, renk: '#0e7490' },
      { ad: 'Anakart', w: 40, renk: '#15803d' },
      { ad: 'RAM (2)', w: 10, renk: '#65a30d' },
      { ad: 'NVMe SSD', w: 6, renk: '#ca8a04' },
      { ad: 'Fanlar (3)', w: 9, renk: '#ea580c' },
      { ad: 'USB · çevre', w: 10, renk: '#b45309' }
    ];
    var TOPLAM = PARCA.reduce(function (a, p) { return a + p.w; }, 0), OLCEK = 720;
    kok.innerHTML = '<div class="gh-bar-kap"><div class="gh-bar"></div><div class="gh-isaretler"></div></div>' +
      '<div class="gh-liste"></div><div class="gh-hesap" aria-live="polite"></div><div class="gh-psu"></div>' +
      '<div class="secici gh-kontrol"></div><div class="panel-sonuc gh-sonuc" aria-live="polite"></div>';
    var bar = kok.querySelector('.gh-bar'), liste = kok.querySelector('.gh-liste'), hesap = kok.querySelector('.gh-hesap');
    var psuEl = kok.querySelector('.gh-psu'), sonuc = kok.querySelector('.gh-sonuc'), isaret = kok.querySelector('.gh-isaretler');
    var seg = PARCA.map(function (p) {
      var s = el('i', 'gh-seg', bar);
      s.style.background = p.renk; s.style.width = '0%';
      s.title = p.ad + ' ' + p.w + ' W';
      var c = el('div', 'gh-cip', liste);
      c.innerHTML = '<span class="gh-nokta"></span><span></span><b></b>';
      c.firstChild.style.background = p.renk;
      c.children[1].textContent = p.ad; c.children[2].textContent = p.w + ' W';
      return { s: s, c: c };
    });
    var pay = el('i', 'gh-seg gh-pay', bar); pay.style.width = '0%';
    [0, 200, 400, 600].forEach(function (w) { var t = el('span', '', isaret, w + ' W'); t.style.left = (w / OLCEK * 100) + '%'; });
    var PSU = [450, 550, 1200];
    var kartlar = PSU.map(function (w) {
      var k = el('button', 'gh-kart', psuEl);
      k.type = 'button';
      k.innerHTML = '<b>' + w + ' W</b><span class="gh-yuk"><i></i></span><small></small>';
      k.addEventListener('click', function () { psuSec(w); });
      return k;
    });
    function psuSec(w) {
      var yuk = TOPLAM / w * 100;
      kartlar.forEach(function (k, i) {
        var wi = PSU[i], y = TOPLAM / wi * 100;
        k.setAttribute('aria-pressed', wi === w ? 'true' : 'false');
        k.querySelector('i').style.width = Math.min(100, y).toFixed(0) + '%';
        k.querySelector('.gh-yuk').className = 'gh-yuk ' + (y > 85 ? 'kotu' : (y < 45 ? 'uyari' : 'iyi'));
        k.querySelector('small').textContent = '%' + sayi(y, 0) + ' yük · ' + (y > 85 ? '✗ sınırda' : (y < 45 ? '△ gereksiz büyük' : '✓ uygun'));
      });
      sonuc.textContent = w === 450 ? '450 W: tam yükte %' + sayi(yuk, 0) + ' — anlık sıçramalara pay kalmaz.'
        : (w === 550 ? '550 W: %' + sayi(yuk, 0) + ' yük — yaklaşık %25–30 pay, verimli ve sessiz.'
          : '1200 W: %' + sayi(yuk, 0) + ' yük — çalışır ama pahalı; düşük yükte verim düşer.');
    }
    var calis = 0, gorulen = false;
    function sifirla() {
      calis++;
      seg.forEach(function (x) { x.s.style.width = '0%'; x.c.classList.remove('gor'); });
      pay.style.width = '0%';
      hesap.innerHTML = '<span>Toplam</span><code>0 W</code>';
      kartlar.forEach(function (k) { k.disabled = true; k.setAttribute('aria-pressed', 'false'); k.querySelector('i').style.width = '0%'; k.querySelector('small').textContent = ''; });
      sonuc.textContent = 'Oynat’a bas: bileşenler bütçeye eklenecek.';
    }
    function oynat() {
      var id = ++calis;
      sifirla(); calis = id;
      var top = 0, z = Promise.resolve();
      PARCA.forEach(function (p, i) {
        z = z.then(function () {
          if (id !== calis) return;
          top += p.w;
          seg[i].s.style.width = (p.w / OLCEK * 100).toFixed(2) + '%';
          seg[i].c.classList.add('gor');
          hesap.innerHTML = '<span>Toplam</span><code>' + top + ' W</code>';
          return bekle(i < 2 ? 0.9 : 0.45);
        });
      });
      z.then(function () {
        if (id !== calis) return;
        var hedef = TOPLAM * 1.25;
        pay.style.width = ((hedef - TOPLAM) / OLCEK * 100).toFixed(2) + '%';
        hesap.innerHTML = '<span>Toplam</span><code>' + TOPLAM + ' W</code><span>× 1,25 (pay)</span><code>' + sayi(hedef, 0) + ' W</code><span>bir üst değer</span><code class="gh-oneri">' + standartUst(hedef) + ' W</code>';
        return bekle(1.2);
      }).then(function () {
        if (id !== calis) return;
        kartlar.forEach(function (k) { k.disabled = false; });
        psuSec(550);
        if (!gorulen) {
          gorulen = true;
          sonuc.textContent = DERS.tahminNotu(1, '550 W yaklaşık %25 pay bırakır.', 'Doğrusu 550 W: 450 W sınırda kalır, 1200 W gereksiz büyüktür.');
        }
      });
    }
    var ctl = kok.querySelector('.gh-kontrol');
    DERS.dugme(ctl, 'Oynat ▶', oynat);
    DERS.dugme(ctl, 'Baştan', sifirla);
    sifirla();
    DERS.slaytAcilinca('s6', function () { setTimeout(oynat, AZ ? 0 : 500); });
  })();

  /* ─────────── Adım 3: 80 PLUS verim eğrisi + enerji akışı ─────────── */
  (function () {
    var kok = document.getElementById('verim');
    if (!kok) return;
    var PSU_W = 550, YUK = [20, 50, 100];
    kok.innerHTML = '<div class="vr-sert"></div><div class="vr-orta"><div class="vr-grafik"></div><div class="vr-akis"></div></div>' +
      '<div class="vr-alt"><span class="vr-et">550 W güç kaynağında DC yük:</span><div class="vr-yuk"></div></div>' +
      '<div class="panel-sonuc vr-sonuc" aria-live="polite"></div><div class="vr-not">Sertifika değerleri 115 V test koşullarındaki en düşük verimdir; 230 V şebekede verim genellikle 2–3 puan daha yüksektir.</div>';
    // grafik
    var X0 = 30, X1 = 222, Y0 = 164, Y1 = 12, VMIN = 78, VMAX = 96;
    function gx(y) { return X0 + (y / 100) * (X1 - X0); }
    function gy(v) { return Y0 - (v - VMIN) / (VMAX - VMIN) * (Y0 - Y1); }
    var g = '<svg viewBox="0 0 262 192" role="img" aria-label="80 PLUS sertifikalarının yüzde 20, 50 ve 100 yükteki en düşük verim eğrileri">';
    for (var v = 78; v <= 96; v += 2) g += '<path d="M' + X0 + ' ' + gy(v) + 'H' + X1 + '" stroke="#e2e8f0"/>' + (v % 4 === 2 ? '<text x="' + (X0 - 4) + '" y="' + (gy(v) + 3) + '" class="vr-ek" text-anchor="end">%' + v + '</text>' : '');
    [0, 20, 50, 100].forEach(function (y) { g += '<text x="' + gx(y) + '" y="' + (Y0 + 14) + '" class="vr-ek" text-anchor="middle">%' + y + '</text>'; });
    g += '<text x="' + ((X0 + X1) / 2) + '" y="191" class="vr-ek" text-anchor="middle">yük</text>';
    SERT.forEach(function (s, i) {
      var d = YUK.map(function (y, k) { return (k ? 'L' : 'M') + gx(y).toFixed(1) + ' ' + gy(s.v[k]).toFixed(1); }).join(' ');
      g += '<g class="vr-seri" data-i="' + i + '"><path d="' + d + '" fill="none" stroke="' + s.renk + '" stroke-width="2.5"/>' +
        YUK.map(function (y, k) { return '<circle cx="' + gx(y).toFixed(1) + '" cy="' + gy(s.v[k]).toFixed(1) + '" r="3" fill="' + s.renk + '"/>'; }).join('') +
        '<text x="' + gx(50).toFixed(1) + '" y="' + (gy(s.v[1]) - 9).toFixed(1) + '" class="vr-ad" text-anchor="middle" fill="' + s.renk + '">' + s.ad + '</text></g>';
    });
    g += '<g class="vr-imlec"><path class="vr-imlec-cizgi" d="" stroke="#0f172a" stroke-dasharray="3 3"/><circle class="vr-imlec-nokta" r="5.5" fill="none" stroke="#0f172a" stroke-width="2"/></g></svg>';
    kok.querySelector('.vr-grafik').innerHTML = g;
    var svg = kok.querySelector('.vr-grafik svg'), akis = kok.querySelector('.vr-akis'), sonuc = kok.querySelector('.vr-sonuc');
    akis.innerHTML = '<div class="vr-a-bas">Enerji akışı</div><div class="vr-a-satir"><span>Prizden</span><div class="vr-a-bar"><i class="vr-priz"></i></div><code class="vr-priz-d"></code></div>' +
      '<div class="vr-a-satir"><span>DC çıkış</span><div class="vr-a-bar"><i class="vr-dc"></i></div><code class="vr-dc-d"></code></div>' +
      '<div class="vr-a-satir"><span>Isı kaybı</span><div class="vr-a-bar"><i class="vr-isi"></i></div><code class="vr-isi-d"></code></div>' +
      '<div class="vr-a-verim"><span>Verim</span><b class="vr-verim-d"></b></div>';
    var sec = { s: 3, y: 1 };
    function guncelle() {
      var s = SERT[sec.s], yuk = YUK[sec.y], dc = PSU_W * yuk / 100, ver = s.v[sec.y], priz = dc / (ver / 100), isi = priz - dc;
      svg.querySelectorAll('.vr-seri').forEach(function (e) { e.classList.toggle('soluk', +e.dataset.i !== sec.s); });
      var x = gx(yuk), y = gy(ver);
      svg.querySelector('.vr-imlec-cizgi').setAttribute('d', 'M' + x + ' ' + Y0 + 'V' + y);
      var n = svg.querySelector('.vr-imlec-nokta'); n.setAttribute('cx', x); n.setAttribute('cy', y);
      var enb = PSU_W / 0.8;
      akis.querySelector('.vr-priz').style.width = (priz / enb * 100).toFixed(1) + '%';
      akis.querySelector('.vr-dc').style.width = (dc / enb * 100).toFixed(1) + '%';
      akis.querySelector('.vr-isi').style.width = (isi / enb * 100).toFixed(1) + '%';
      akis.querySelector('.vr-priz-d').textContent = sayi(priz, 0) + ' W';
      akis.querySelector('.vr-dc-d').textContent = sayi(dc, 0) + ' W';
      akis.querySelector('.vr-isi-d').textContent = sayi(isi, 0) + ' W';
      akis.querySelector('.vr-verim-d').textContent = '%' + ver;
      var br = SERT[1], brIsi = dc / (br.v[sec.y] / 100) - dc;
      sonuc.textContent = s.ad + ', %' + yuk + ' yük: ' + sayi(dc, 0) + ' W ÷ ' + sayi(ver / 100, 2) + ' ≈ ' + sayi(priz, 0) + ' W prizden; ' + sayi(isi, 0) + ' W ısı' +
        (sec.s > 1 ? ' (Bronze’a göre ' + sayi(brIsi - isi, 0) + ' W daha az).' : '.');
    }
    secGrup(kok.querySelector('.vr-sert'), SERT.map(function (s) { return s.ad; }), function (i) { sec.s = i; guncelle(); }, { baslangic: 3, aria: 'Sertifika' });
    secGrup(kok.querySelector('.vr-yuk'), YUK.map(function (y) { return '%' + y + ' · ' + (PSU_W * y / 100) + ' W'; }), function (i) { sec.y = i; guncelle(); }, { baslangic: 1, aria: 'Yük' });
    guncelle();
  })();

  /* ─────────── Adım 4: güç konnektörleri (A-VURGU + döndürme) ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [0.3, 0.42, 1], pay: 0.9, hedefOfset: [0.8, 0.6, 0] } });
    var m = s.ekle('M-KABLO-GUC');
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.35, maxPolar: 1.7, minYakin: 0.3, maxYakin: 1.4 } });
    var kon = m.userData.konnektorler, mesaj = DERS.sahneMesaj(s);
    var ADLAR = ['atx24', 'eps', 'pcie', 'sata'];
    var DETAY = {
      atx24: ['24-pin ATX (20+4) · anakart', '24-pin (20+4): anakartı besler. +3,3 V, +5 V, +12 V, bekleme +5 VSB; yeşil tel açma sinyali (PS_ON).'],
      eps: ['8-pin EPS (4+4) · işlemci', '8-pin EPS: işlemciye yalnız +12 V taşır. Kilit tarafında 4 sarı (+12 V), karşısında 4 siyah (toprak).'],
      pcie: ['6+2 pin PCIe · ekran kartı', '6+2 PCIe: ekran kartına +12 V. 6-pin ≈ 75 W, 8-pin ≈ 150 W; kart yuvadan da 75 W alır.'],
      sata: ['SATA güç · 15 pin', 'SATA güç: 15 pin, L ağız; diske +3,3 V, +5 V, +12 V. Tek yönde girer.']
    };
    var aktif = null, etk = [], jeton = 0, ayrik = false;
    function temizle() {
      etk.forEach(function (e) { e.kaldir(); }); etk = [];
      ADLAR.forEach(function (t) { D.vurguKaldir(kon[t], 0.2); });
    }
    function donder(t, aci, sure) {
      var k = kon[t], r0 = k.rotation.x;
      return D.tween({ sahne: s, sure: AZ ? 0.01 : sure, anahtar: 'don', hedef: k, guncelle: function (e) { k.rotation.x = r0 + (aci - r0) * e; } });
    }
    function sec(t, ic) {
      var my = ic ? jeton : ++jeton;
      temizle();
      aktif = t;
      var p = [];
      ADLAR.forEach(function (x) { if (x !== t && Math.abs(kon[x].rotation.x - Math.PI / 2) > 0.01) p.push(donder(x, Math.PI / 2, 0.5)); });
      var hedef = kon[t].getWorldPosition(new V3());
      p.push(s.kameraGit({ hedef: [hedef.x, hedef.y - 0.6, hedef.z], yakinlik: t === 'atx24' ? 0.72 : 0.6, theta: s._baslangic.theta, phi: 1.2 }, AZ ? 0.01 : 0.9));
      D.vurgula(kon[t], { etiket: DETAY[t][0] });
      mesaj(DETAY[t][1], '');
      return Promise.all(p).then(function () {
        if (my !== jeton) return;
        return donder(t, Math.PI, 1.0);                  // pin yüzü kameraya döner
      }).then(function () {
        if (my !== jeton) return;
        etk.push(s.etiket(kon[t], 'Pin yüzü: ' + kon[t].userData.pin + ' pin', { tur: 'odak', yer: 'alt', ofset: [0, -0.2, 0] }));
        return D.bekle(1.4, s);
      }).then(function () {
        if (my !== jeton) return;
        return donder(t, Math.PI / 2, 0.9);              // geri: kilit ve tel renkleri görünür
      });
    }
    function karsilastir() {
      var my = ++jeton;
      temizle(); aktif = null;
      var p = ADLAR.map(function (x) { return donder(x, Math.PI / 2, 0.4); });
      var a = kon.eps.getWorldPosition(new V3()), b = kon.pcie.getWorldPosition(new V3());
      p.push(s.kameraGit({ hedef: [(a.x + b.x) / 2, a.y - 1.6, a.z], yakinlik: 0.72, theta: s._baslangic.theta - 0.05, phi: 1.25 }, AZ ? 0.01 : 0.9));
      Promise.all(p).then(function () {
        if (my !== jeton) return;
        D.vurgula(kon.eps, { etiket: false }); D.vurgula(kon.pcie, { etiket: false, renk: '#ef4444' });
        etk.push(s.etiket(kon.eps, 'EPS: +12 V (sarı) kilit tarafında', { tur: 'vurgu' }));
        etk.push(s.etiket(kon.pcie, 'PCIe: +12 V kilidin karşısında', { tur: 'hata', yer: 'alt', ofset: [0, -0.4, 0] }));
        mesaj('Benzer görünürler ama +12 V sırası ve pin biçimleri terstir. Yanlış yuvaya zorlamak kısa devreye yol açabilir.', 'yanlis');
        return D.uyari(kon.pcie, { etiket: false, genlik: 0.15 });
      });
    }
    ADLAR.forEach(function (t, i) {
      s.dugme(['24-pin', 'EPS', 'PCIe', 'SATA'][i], null, function () { sec(t); }, { yer: 'alt-orta', aciklama: DETAY[t][0] + ' konnektörünü göster' });
    });
    s.dugme('EPS ≠ PCIe', null, karsilastir, { yer: 'alt-orta', aciklama: 'EPS ve PCIe 8-pin konnektörlerini karşılaştır' });
    var ayB = s.dugme('Ayır', null, function () {
      ayrik = !ayrik;
      m.userData.ayir(ayrik ? 1 : 0, AZ ? 0.01 : 0.7);
      ayB.querySelector('span').textContent = ayrik ? 'Birleştir' : 'Ayır';
      mesaj(ayrik ? '20+4, 4+4 ve 6+2 parçalar ayrıldı: eski ya da küçük girişlere uyum için.' : 'Parçalar birleşti: tam konnektör olarak takılır.', '');
    }, { yer: 'alt-orta', aciklama: 'Ayrılabilir parçaları (20+4, 4+4, 6+2) ayır ya da birleştir' });
    s.tiklaninca(function (p) {
      if (!p) return;
      var o = p;
      while (o && ADLAR.indexOf((o.name || '').replace('kon-', '')) < 0) o = o.parent;
      if (o) sec(o.name.replace('kon-', ''));
    });
    mesaj('Bir konnektör seç ya da üzerine dokun.', '');
    // Slayt ilk açılınca kısa tur: her konnektör sırayla döner (A-VURGU)
    var turYapildi = false;
    (function () {
      if (turYapildi) return;
      turYapildi = true;
      var my = ++jeton, z = D.bekle(0.6, s);
      ADLAR.forEach(function (t) {
        z = z.then(function () { if (my === jeton) return sec(t, true); }).then(function () { if (my === jeton) return D.bekle(0.4, s); });
      });
      z.then(function () {
        if (my !== jeton) return;
        temizle();
        s.kameraGit({ hedef: s._baslangic.hedef, yakinlik: 1, theta: s._baslangic.theta, phi: s._baslangic.phi }, AZ ? 0.01 : 0.8);
        mesaj('Bir konnektör seç ya da üzerine dokun.', '');
      });
    })();
    s._h06 = { sec: sec, karsilastir: karsilastir, kon: kon };
  });

  /* ─────────── Adım 5: TDP ve soğutucu (A-ISI + termometre + A-AKIS ısı yolu) ─────────── */
  function isiRenk(d) { return new THREE.Color().setHSL((1 - Math.max(0, Math.min(1, d))) * 0.6, 0.85, 0.5).getStyle(); }
  function termometre(ebeveyn) {
    var e = el('div', 'termo', ebeveyn);
    e.setAttribute('role', 'status');
    e.innerHTML = '<div class="termo-cubuk"><div class="termo-tup"><span class="termo-dolgu"></span></div><div class="termo-ampul"></div></div>' +
      '<div class="termo-yazi"><b class="termo-deger">–</b><span class="termo-durum"></span></div>';
    var dolgu = e.querySelector('.termo-dolgu'), ampul = e.querySelector('.termo-ampul'), deger = e.querySelector('.termo-deger'), durum = e.querySelector('.termo-durum');
    var son = null;
    return function (T) {
      var r = Math.round(T);
      if (r === son) return;
      son = r;
      var renk = isiRenk((T - 40) / 50);
      dolgu.style.height = (Math.max(0.06, Math.min(1, (T - 25) / 75)) * 100).toFixed(1) + '%';
      dolgu.style.background = renk; ampul.style.background = renk;
      deger.textContent = 'İşlemci ' + r + ' °C';
      durum.textContent = T >= 90 ? 'Yavaşlıyor' : (T >= 80 ? 'Sınırda' : 'Normal');
      e.setAttribute('data-durum', T >= 90 ? 'cok' : (T >= 80 ? 'sicak' : 'normal'));
    };
  }
  var SOGUTUCU = [
    { ad: 'Pasif (fansız)', kap: 35, aralik: '≤ 35 W' },
    { ad: 'Alçak (kutu)', kap: 95, aralik: '≈ 65–95 W' },
    { ad: 'Kule (tek fan)', kap: 200, aralik: '≈ 150–200 W' },
    { ad: 'Sıvı 240 mm', kap: 250, aralik: '≈ 200–250 W' },
    { ad: 'Sıvı 360 mm', kap: 300, aralik: '≈ 250–300 W' }
  ];
  D.tembel('#s9-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [0.75, 0.4, 1], pay: 1.3, hedefOfset: [3.2, 1.2, -2.4] } });
    var cpu = s.ekle('M-CPU');
    var sog = s.ekle('M-SOGUTUCU', { konum: [0, cpu.userData.olcu.kapakY, 0] });
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.4, maxPolar: 1.55, minYakin: 0.5, maxYakin: 1.4 } });
    var fan = sog.userData.fan;
    fan.userData.hiz = 7; fan.userData.baslat(s);
    var mesaj = DERS.sahneMesaj(s);
    var panel = D.div('tdp-panel', s.arayuz);
    panel.innerHTML = '<div class="tdp-bas">İşlemci TDP</div><div class="tdp-sec"></div>' +
      '<div class="tdp-tablo" role="list" aria-label="Soğutucu türleri ve yaklaşık kapasiteleri"></div><div class="tdp-not">Altı çizili: sahnedeki kule. Değerler yaklaşıktır.</div>';
    var tablo = panel.querySelector('.tdp-tablo');
    var satir = SOGUTUCU.map(function (x, i) {
      var r = el('div', 'tdp-satir' + (i === 2 ? ' bu' : ''), tablo);
      r.setAttribute('role', 'listitem');
      r.innerHTML = '<span class="tdp-i"></span><b></b><code></code>';
      r.children[1].textContent = x.ad;
      r.children[2].textContent = x.aralik;
      return r;
    });
    var termo = termometre(s.arayuz);
    var st = { tdp: 125, T: 50 };
    function hedefT() { return 25 + 8 + st.tdp * 0.24; }      // oda + kasa ısınması + TDP × ısıl direnç (kule, yaklaşık)
    function tdpSec(w) {
      st.tdp = w;
      var uygunIlk = -1;
      SOGUTUCU.forEach(function (x, i) {
        var ok = x.kap >= w;
        if (ok && uygunIlk < 0) uygunIlk = i;
        satir[i].classList.toggle('ok', ok); satir[i].classList.toggle('yok', !ok);
        satir[i].firstChild.textContent = ok ? '✓' : '✗';
      });
      satir.forEach(function (r, i) { r.classList.toggle('oneri', i === uygunIlk); });
      if (w <= 95) mesaj(w + ' W: alçak soğutucu yeter; bu kule rahatça soğutur.', 'dogru');
      else if (w <= 200) mesaj(w + ' W: alçak soğutucu yetmez; kule tipi ya da sıvı soğutucu gerekir.', 'dogru');
      else mesaj(w + ' W: bu kule yetersiz kalır, işlemci ısınıp yavaşlar. 360 mm sıvı soğutucu önerilir.', 'yanlis');
    }
    secGrup(panel.querySelector('.tdp-sec'), ['65 W', '125 W', '170 W', '250 W'], function (i) { tdpSec([65, 125, 170, 250][i]); }, { baslangic: 1 });
    s.herKare(function (dt) {
      var h = hedefT();
      st.T += (h - st.T) * (1 - Math.exp(-dt / (AZ ? 0.1 : 1.1)));
      termo(st.T);
      cpu.userData.isit((st.T - 40) / 50);
      fan.userData.hiz = 4 + Math.min(1, st.tdp / 200) * 6;
    });
    termo(st.T);
    // A-AKIS: ısı yolu — işlemci → macun → taban → ısı borusu → kanatçıklar → fanın ittiği hava (−Z)
    var O = sog.userData.olcu, ky = cpu.userData.olcu.kapakY, akiyor = false;
    function isiYolu() {
      if (akiyor) return;
      akiyor = true;
      var y0 = sog.position.y;
      var yol = [[0, ky * 0.5, 0.4], [0, y0 + 0.05, 0.4], [0, y0 + O.tabanY + 0.3, 0.3], [1.2, y0 + O.tabanY + 0.9, 0.2],
        [1.4, y0 + (O.kanatAlt + O.kanatUst) / 2, 0.1], [1.4, y0 + O.kanatUst - 1, -1.2], [1.4, y0 + O.kanatUst - 1, -6], [1.4, y0 + O.kanatUst - 0.5, -11]];
      mesaj('Isı yolu: işlemci → macun → taban → ısı boruları → kanatçıklar → hava.', '');
      D.akis(s, yol, { renk: '#ef4444', hiz: 9, parcacik: 16, boyut: 4, basBoyut: 0.45, izKalinlik: 0.18 }).then(function () { akiyor = false; });
    }
    s.dugme('Isı yolu', 'oynat', isiYolu, { yer: 'alt-orta', aciklama: 'Isının işlemciden havaya geçtiği yolu göster' });
    tdpSec(125);
    s._h06 = { tdpSec: tdpSec, st: st };
  });

  /* ─────────── A-HAVA: kasa hava akışı (2D kanvas) — basitleştirilmiş model, değerler örnektir ───────────
     Sıcaklık: oda 25 °C; kasa havası ΔT ≈ 1,757 × P / Q (P: W, Q: CFM; havanın ısı sığası),
     Q = min(giriş, çıkış) + 0,35 × |fark| + 25 (doğal akış). İşlemci = hava + düzen cezası + TDP × 0,24; ekran kartı = hava + ceza + P × 0,17. */
  var FANLAR = [
    { ad: 'on1', etiket: 'Ön üst', kenar: 'sol', u0: 0.16, u1: 0.38 },
    { ad: 'on2', etiket: 'Ön alt', kenar: 'sol', u0: 0.46, u1: 0.68 },
    { ad: 'arka', etiket: 'Arka', kenar: 'sag', u0: 0.1, u1: 0.32 },
    { ad: 'ust', etiket: 'Üst', kenar: 'ust', u0: 0.5, u1: 0.72 }
  ];
  var CFM = 50, PCPU = 125, PGPU = 220, TA = 25;
  function havaHesap(ayar) {
    var gir = 0, cik = 0;
    FANLAR.forEach(function (f) { var d = ayar[f.ad]; if (d.yon > 0) gir += d.hiz * CFM; if (d.yon < 0) cik += d.hiz * CFM; });
    var Q = Math.min(gir, cik) + 0.35 * Math.abs(gir - cik) + 25;
    var Tk = TA + 1.757 * (PCPU + PGPU) / Q;
    var ar = ayar.arka, us = ayar.ust, o2 = ayar.on2, pc = 0, pg = 0;
    if (ar.yon < 0) pc += 3 * (1 - ar.hiz);
    else if (ar.yon > 0) pc += 2 + 7 * ar.hiz;
    else pc += (us.yon < 0 && us.hiz > 0.3) ? 2 : 4;
    if (!(ar.yon < 0 && ar.hiz > 0) && !(us.yon < 0 && us.hiz > 0)) pc += 3;
    if (o2.yon > 0) pg += 3 * (1 - o2.hiz); else pg += 4;
    var basinc = cik === 0 && gir === 0 ? 'yok' : (gir >= cik * 1.1 ? 'pozitif' : (cik >= gir * 1.1 ? 'negatif' : 'dengeli'));
    var enHiz = 0;
    FANLAR.forEach(function (f) { if (ayar[f.ad].yon !== 0) enHiz = Math.max(enHiz, ayar[f.ad].hiz); });
    return { gir: gir, cik: cik, Q: Q, Tk: Tk, pc: pc, pg: pg, cpu: Tk + pc + PCPU * 0.24, gpu: Tk + pg + PGPU * 0.17, basinc: basinc, enHiz: enHiz };
  }
  function ayarKopya(a) { var b = {}; Object.keys(a).forEach(function (k) { b[k] = { yon: a[k].yon, hiz: a[k].hiz }; }); return b; }

  /** Hava akışı simülatörü: kok içine kanvas + ölçüm satırı kurar. Döner { ayarla(ayar), olc(), otur() , ayar } */
  function havaSim(kok, slaytId) {
    var GX = 48, GY = 36;
    kok.classList.add('hv');
    kok.innerHTML = '<div class="hv-sahne"><canvas role="img" aria-label="Kasa yan kesiti: fanlar, işlemci soğutucusu, ekran kartı; hava parçacıkları ve sıcaklık haritası"></canvas>' +
      '<div class="hv-lejant" aria-hidden="true"><span>25 °C</span><i></i><span>45 °C ve üstü</span></div></div>' +
      '<div class="hv-olcum" aria-live="polite"><div class="hv-o"><span>İşlemci</span><b class="hv-cpu">–</b></div><div class="hv-o"><span>Ekran kartı</span><b class="hv-gpu">–</b></div>' +
      '<div class="hv-o"><span>Giriş / Çıkış</span><b class="hv-akis">–</b></div><div class="hv-o hv-basinc"><span>Basınç</span><b class="hv-bas">–</b></div></div>';
    var cv = kok.querySelector('canvas'), ctx = cv.getContext('2d');
    var cpuEl = kok.querySelector('.hv-cpu'), gpuEl = kok.querySelector('.hv-gpu'), akisEl = kok.querySelector('.hv-akis'), basEl = kok.querySelector('.hv-bas'), basKutu = kok.querySelector('.hv-basinc');
    var harita = document.createElement('canvas'); harita.width = GX; harita.height = GY;
    var hctx = harita.getContext('2d'), img = hctx.createImageData(GX, GY);
    var alan = new Float32Array(GX * GY), hedefAlan = new Float32Array(GX * GY);
    var ayar = null, sonuc = null, gosterilen = { cpu: 40, gpu: 40 }, donme = {}, parc = [], w = 0, h = 0, dpr = 1;
    // Kasa iç bölgesi (normalize: x 0 ön → 1 arka, y 0 üst → 1 alt)
    var PSU_Y = 0.8, GPU_Y = 0.555, GPU_X = [0.26, 0.84], SOG = [0.58, 0.74, 0.17, 0.43];
    function kasa() { var p = Math.min(w, h) * 0.05, lx = p + 26, ty = p + 24; return { x: lx, y: ty, w: w - lx - p - 26, h: h - ty - p }; }
    function hedefHesapla() {
      var r = sonuc, strat = (ayar.arka.yon < 0 || ayar.ust.yon < 0) ? 3 : 7;
      var cdx = ayar.arka.yon < 0 ? 1 : (ayar.arka.yon > 0 ? -0.6 : 0.2), cdy = ayar.arka.yon > 0 ? -0.8 : -0.5;
      var cAmp = 7 + r.pc * 1.6, gAmp = 8 + r.pg * 1.6;
      for (var j = 0; j < GY; j++) for (var i = 0; i < GX; i++) {
        var x = (i + 0.5) / GX, y = (j + 0.5) / GY, T = r.Tk + strat * (0.5 - y) * 0.9;
        // işlemci soğutucusundan çıkan sıcak hava bulutu
        var cx = (SOG[0] + SOG[1]) / 2 + cdx * 0.1, cy = (SOG[2] + SOG[3]) / 2 + cdy * 0.05;
        var dx = x - cx, dy = y - cy, a = dx * cdx + dy * cdy, l = dx * -cdy + dy * cdx;
        T += cAmp * Math.exp(-(Math.pow(a / 0.2, 2) + Math.pow(l / 0.1, 2)));
        // ekran kartının ısısı: kartın altında ve arkasında yükselir
        var gx = 0.62, gy = GPU_Y + 0.08, ex = x - gx, ey = y - gy;
        T += gAmp * Math.exp(-(Math.pow(ex / 0.22, 2) + Math.pow(ey / 0.1, 2)));
        if (y < GPU_Y && x > 0.4) T += gAmp * 0.35 * Math.exp(-Math.pow((x - 0.66) / 0.2, 2)) * Math.exp(-Math.pow((GPU_Y - y) / 0.25, 2)) * (ayar.on2.yon > 0 ? 0.5 : 1);
        // giriş fanlarının soğuk hava konileri
        FANLAR.forEach(function (f) {
          var d = ayar[f.ad];
          if (d.yon <= 0 || !d.hiz) return;
          var boy, yan, gen = (f.u1 - f.u0) / 2, m = (f.u0 + f.u1) / 2;
          if (f.kenar === 'sol') { boy = x; yan = y - m; } else if (f.kenar === 'sag') { boy = 1 - x; yan = y - m; } else { boy = y; yan = x - m; }
          var k = d.hiz * Math.exp(-boy / 0.32) * Math.exp(-Math.pow(yan / (gen + boy * 0.35), 2));
          T -= (T - TA) * 0.85 * k;
        });
        hedefAlan[j * GX + i] = y > PSU_Y ? r.Tk : T;
      }
    }
    function ayarla(a, anindaMi) {
      ayar = ayarKopya(a);
      sonuc = havaHesap(ayar);
      hedefHesapla();
      if (anindaMi || AZ) { alan.set(hedefAlan); gosterilen.cpu = sonuc.cpu; gosterilen.gpu = sonuc.gpu; }
      yaz();
    }
    function yaz() {
      cpuEl.textContent = Math.round(gosterilen.cpu) + ' °C' + (gosterilen.cpu >= 85 ? ' ▲' : '');
      gpuEl.textContent = Math.round(gosterilen.gpu) + ' °C' + (gosterilen.gpu >= 85 ? ' ▲' : '');
      cpuEl.parentNode.setAttribute('data-d', gosterilen.cpu >= 85 ? 'cok' : (gosterilen.cpu >= 70 ? 'sicak' : 'normal'));
      gpuEl.parentNode.setAttribute('data-d', gosterilen.gpu >= 85 ? 'cok' : (gosterilen.gpu >= 75 ? 'sicak' : 'normal'));
      akisEl.textContent = Math.round(sonuc.gir) + ' / ' + Math.round(sonuc.cik) + ' CFM';
      basEl.textContent = { pozitif: '+ Pozitif', negatif: '− Negatif', dengeli: '= Dengeli', yok: 'Fan yok' }[sonuc.basinc];
      basKutu.setAttribute('data-b', sonuc.basinc);
    }
    function renk(T) {
      var d = Math.max(0, Math.min(1, (T - TA) / 20));
      var c = new THREE.Color().setHSL((1 - d) * 0.62, 0.9, 0.52 + (1 - d) * 0.06);
      return [c.r * 255, c.g * 255, c.b * 255];
    }
    function boyut() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (Math.round(r.width) === w && Math.round(r.height) === h) return;
      w = Math.round(r.width); h = Math.round(r.height);
      cv.width = Math.max(1, w * dpr); cv.height = Math.max(1, h * dpr);
    }
    // Hız alanı (parçacıklar için; görsel amaçlı): fan jetleri + çıkışa çekim + kaldırma + soğutucu fanı
    function hiz(x, y) {
      var u = 0, v = 0;
      FANLAR.forEach(function (f) {
        var d = ayar[f.ad];
        if (!d.yon || !d.hiz) return;
        var m = (f.u0 + f.u1) / 2, fx, fy, nx, ny;
        if (f.kenar === 'sol') { fx = 0; fy = m; nx = 1; ny = 0; } else if (f.kenar === 'sag') { fx = 1; fy = m; nx = -1; ny = 0; } else { fx = m; fy = 0; nx = 0; ny = 1; }
        var dx = x - fx, dy = y - fy, r = Math.sqrt(dx * dx + dy * dy) + 0.03;
        if (d.yon > 0) {
          var boy = dx * nx + dy * ny, yan = Math.abs(dx * ny - dy * nx);
          var k = d.hiz * 0.9 * Math.exp(-boy / 0.45) * Math.exp(-Math.pow(yan / (0.14 + boy * 0.4), 2));
          u += nx * k; v += ny * k;
        } else {
          var c = d.hiz * 0.16 / (r + 0.08);
          u -= dx / r * c; v -= dy / r * c;
        }
      });
      if (x > SOG[0] - 0.04 && x < SOG[1] && y > SOG[2] && y < SOG[3]) u += 0.35;     // soğutucu fanı önden arkaya iter
      v -= 0.06;                                                                         // sıcak hava yükselir
      if (y > GPU_Y - 0.03 && y < GPU_Y + 0.03 && x > GPU_X[0] && x < GPU_X[1]) v += (y < GPU_Y ? -0.6 : 0.6);
      return [u, v];
    }
    function dogur(p) {
      // giriş fanları (akışa göre) ya da negatif basınçta aralıklardan
      var adaylar = [];
      FANLAR.forEach(function (f) { var d = ayar[f.ad]; if (d.yon > 0 && d.hiz) adaylar.push([f, d.hiz]); });
      var toplam = adaylar.reduce(function (s, a) { return s + a[1]; }, 0);
      var negatif = sonuc.basinc === 'negatif';
      if ((negatif && Math.random() < 0.35) || !toplam) {
        // aralık: arka genişleme yuvası kapakları ya da ön alt aralık
        if (Math.random() < 0.5) { p.x = 0.99; p.y = 0.6 + Math.random() * 0.15; } else { p.x = 0.01; p.y = 0.72 + Math.random() * 0.06; }
        p.toz = negatif; p.hiz = toplam ? 1 : 0.4;
      } else {
        var r = Math.random() * toplam, s = 0, f = adaylar[0][0];
        for (var i = 0; i < adaylar.length; i++) { s += adaylar[i][1]; if (r <= s) { f = adaylar[i][0]; break; } }
        var m = f.u0 + Math.random() * (f.u1 - f.u0);
        if (f.kenar === 'sol') { p.x = 0.01; p.y = m; } else if (f.kenar === 'sag') { p.x = 0.99; p.y = m; } else { p.x = m; p.y = 0.01; }
        p.toz = false; p.hiz = 1;
      }
      p.yas = 0; p.omur = 4 + Math.random() * 4;
    }
    for (var i = 0; i < (AZ ? 40 : 170); i++) parc.push({ x: -1, y: -1, yas: 99, omur: 0 });
    function adim(dt) {
      // alan ve ölçümler hedefe yaklaşır (ısı haritası yavaşça değişir)
      var k = 1 - Math.exp(-dt / 1.3);
      for (var n = 0; n < alan.length; n++) alan[n] += (hedefAlan[n] - alan[n]) * k;
      gosterilen.cpu += (sonuc.cpu - gosterilen.cpu) * k; gosterilen.gpu += (sonuc.gpu - gosterilen.gpu) * k;
      FANLAR.forEach(function (f) { donme[f.ad] = (donme[f.ad] || 0) + ayar[f.ad].hiz * (ayar[f.ad].yon ? 1 : 0) * dt * 14 * (ayar[f.ad].yon < 0 ? -1 : 1); });
      var akisVar = sonuc.gir + sonuc.cik > 0;
      parc.forEach(function (p) {
        p.yas += dt;
        if (p.yas > p.omur || p.x < 0 || p.x > 1 || p.y < 0 || p.y > PSU_Y) {
          if (Math.random() < (akisVar ? 0.5 : 0.08)) dogur(p); else { p.x = -1; p.yas = 0; p.omur = 0.3; }
          return;
        }
        var v = hiz(p.x, p.y), sp = akisVar ? 0.55 : 0.25;
        p.x += v[0] * dt * sp * (AZ ? 0.3 : 1); p.y += v[1] * dt * sp * (AZ ? 0.3 : 1);
        if (p.y > GPU_Y - 0.012 && p.y < GPU_Y + 0.012 && p.x > GPU_X[0] && p.x < GPU_X[1]) p.x += 0.02;
        // çıkış fanına ulaşınca ya da pozitif basınçta aralıktan çıkınca kaybolur
        if (p.x >= 1 || p.x <= 0 || p.y <= 0) p.yas = p.omur + 1;
      });
      yaz();
    }
    function ciz() {
      boyut();
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var b = kasa();
      // ısı haritası
      for (var n = 0; n < alan.length; n++) { var c = renk(alan[n]); img.data[n * 4] = c[0]; img.data[n * 4 + 1] = c[1]; img.data[n * 4 + 2] = c[2]; img.data[n * 4 + 3] = 150; }
      hctx.putImageData(img, 0, 0);
      ctx.save();
      K.yuvarlakDikdortgen(ctx, b.x, b.y, b.w, b.h, 10); ctx.clip();
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(harita, b.x, b.y, b.w, b.h);
      ctx.restore();
      function X(x) { return b.x + x * b.w; }
      function Y(y) { return b.y + y * b.h; }
      // PSU bölmesi (kapalı; içi gösterilmez)
      ctx.fillStyle = '#334155'; ctx.fillRect(X(0), Y(PSU_Y), b.w, b.h * (1 - PSU_Y));
      ctx.fillStyle = '#1f2328'; K.yuvarlakDikdortgen(ctx, X(0.6), Y(PSU_Y + 0.04), b.w * 0.37, b.h * 0.13, 5); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '800 ' + Math.max(10, Math.round(b.h * 0.042)) + 'px Inter, Arial, sans-serif'; ctx.textBaseline = 'middle';
      ctx.fillText('Güç kaynağı · kendi hava yolu', X(0.03), Y(PSU_Y + 0.1));
      // ekran kartı
      ctx.fillStyle = '#111827'; ctx.fillRect(X(GPU_X[0]), Y(GPU_Y - 0.018), b.w * (GPU_X[1] - GPU_X[0]), b.h * 0.036);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(X(GPU_X[0] + 0.05), Y(GPU_Y + 0.018), b.w * 0.5, b.h * 0.02);
      ctx.fillStyle = '#0f172a'; ctx.fillText('Ekran kartı', X(GPU_X[0] + 0.02), Y(GPU_Y - 0.05));
      // işlemci soğutucusu (kanatçıklar + fan)
      ctx.fillStyle = 'rgba(203,213,225,0.95)';
      for (var k = 0; k < 9; k++) ctx.fillRect(X(SOG[0] + 0.02), Y(SOG[2]) + k * (b.h * (SOG[3] - SOG[2]) / 9), b.w * (SOG[1] - SOG[0] - 0.02), Math.max(1.5, b.h * 0.008));
      ctx.fillStyle = '#1f2328'; ctx.fillRect(X(SOG[0] - 0.01), Y(SOG[2] + 0.02), b.w * 0.022, b.h * (SOG[3] - SOG[2] - 0.04));
      ctx.fillStyle = '#c47a4c'; ctx.fillRect(X(SOG[0] + 0.03), Y(SOG[3]), b.w * (SOG[1] - SOG[0] - 0.05), b.h * 0.02);
      ctx.fillStyle = '#0f172a'; ctx.fillText('İşlemci soğutucusu', X(SOG[0] - 0.06), Y(SOG[3] + 0.05));
      // parçacıklar
      parc.forEach(function (p) {
        if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > PSU_Y) return;
        var j = Math.min(GY - 1, Math.floor(p.y * GY)), i = Math.min(GX - 1, Math.floor(p.x * GX)), T = alan[j * GX + i];
        ctx.fillStyle = p.toz ? 'rgba(87,83,78,0.9)' : (T > 34 ? 'rgba(194,65,12,0.85)' : 'rgba(3,105,161,0.8)');
        ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.toz ? 2.4 : 2, 0, Math.PI * 2); ctx.fill();
      });
      // kasa çerçevesi
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 3; K.yuvarlakDikdortgen(ctx, b.x, b.y, b.w, b.h, 10); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '800 ' + Math.max(10, Math.round(b.h * 0.042)) + 'px Inter, Arial, sans-serif';
      ctx.save(); ctx.translate(b.x - 16, Y(0.88)); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('ÖN', 0, 0); ctx.restore();
      ctx.save(); ctx.translate(b.x + b.w + 16, Y(0.45)); ctx.rotate(Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('ARKA', 0, 0); ctx.restore();
      // fanlar
      FANLAR.forEach(function (f) {
        var d = ayar[f.ad], yat = f.kenar === 'ust', m = (f.u0 + f.u1) / 2, boy = (f.u1 - f.u0);
        var cx = yat ? X(m) : (f.kenar === 'sol' ? b.x : b.x + b.w), cy = yat ? b.y : Y(m);
        var L = (yat ? b.w : b.h) * boy, t = 12;
        ctx.save(); ctx.translate(cx, cy); if (yat) ctx.rotate(Math.PI / 2);
        ctx.fillStyle = d.yon ? '#1f2328' : '#64748b';
        K.yuvarlakDikdortgen(ctx, -t / 2, -L / 2, t, L, 4); ctx.fill();
        // dönen kanat izi
        ctx.strokeStyle = d.yon ? '#94a3b8' : '#cbd5e1'; ctx.lineWidth = 2;
        for (var q = 0; q < 3; q++) { var a = (donme[f.ad] || 0) + q * 2.094, yy = Math.sin(a) * L * 0.42; ctx.beginPath(); ctx.moveTo(-t / 2 + 2, yy); ctx.lineTo(t / 2 - 2, yy); ctx.stroke(); }
        // yön oku: giriş → kasanın içine doğru (mavi), çıkış → dışarı doğru (kırmızı); ok kasanın dışında çizilir
        if (d.yon && d.hiz) {
          var ic = f.kenar === 'sag' ? -1 : 1, x0 = -ic * (t / 2 + 20), x1 = -ic * (t / 2 + 3);
          var ucx = d.yon > 0 ? x1 : x0, yonx = d.yon > 0 ? ic : -ic;
          ctx.fillStyle = d.yon > 0 ? '#0284c7' : '#dc2626'; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ucx + yonx * 3, 0); ctx.lineTo(ucx - yonx * 5, -6); ctx.lineTo(ucx - yonx * 5, 6); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        // etiket
        ctx.fillStyle = '#0f172a'; ctx.font = '800 ' + Math.max(10, Math.round(b.h * 0.04)) + 'px Inter, Arial, sans-serif';
        ctx.textAlign = yat ? 'center' : (f.kenar === 'sol' ? 'left' : 'right');
        var yazi = f.etiket + ' · ' + (d.yon > 0 ? 'giriş %' : (d.yon < 0 ? 'çıkış %' : 'kapalı')) + (d.yon ? Math.round(d.hiz * 100) : '');
        if (yat) ctx.fillText(yazi, cx, b.y + 20);
        else ctx.fillText(yazi, f.kenar === 'sol' ? b.x + 10 : b.x + b.w - 10, Y(f.u0) - 8);
        ctx.textAlign = 'left';
      });
    }
    var dongu = null, son = 0;
    function calis() {
      if (dongu) return;
      son = performance.now();
      (function kare(t) {
        if (!aktifMi(slaytId)) { dongu = null; return; }
        var dt = Math.max(0, Math.min(0.1, (t - son) / 1000)); son = t;
        adim(dt); ciz();
        dongu = requestAnimationFrame(kare);
      })(son);
    }
    DERS.slaytAcilinca(slaytId, calis, true);
    return {
      ayarla: ayarla,
      sonuc: function () { return sonuc; },
      gosterilen: gosterilen,
      oturdu: function () { return Math.abs(gosterilen.cpu - sonuc.cpu) < 0.6 && Math.abs(gosterilen.gpu - sonuc.gpu) < 0.6; },
      ayar: function () { return ayarKopya(ayar); }
    };
  }
  var DUZEN = {
    oneri: { on1: { yon: 1, hiz: 1 }, on2: { yon: 1, hiz: 1 }, arka: { yon: -1, hiz: 1 }, ust: { yon: -1, hiz: 0.8 } },
    ters: { on1: { yon: 1, hiz: 1 }, on2: { yon: 1, hiz: 1 }, arka: { yon: 1, hiz: 1 }, ust: { yon: -1, hiz: 1 } },
    cikis: { on1: { yon: 0, hiz: 0 }, on2: { yon: 0, hiz: 0 }, arka: { yon: -1, hiz: 1 }, ust: { yon: -1, hiz: 1 } },
    fansiz: { on1: { yon: 0, hiz: 0 }, on2: { yon: 0, hiz: 0 }, arka: { yon: 0, hiz: 0 }, ust: { yon: 0, hiz: 0 } }
  };

  /* ─────────── Adım 6: kasa hava akışı (A-HAVA) — hazır düzenler ─────────── */
  (function () {
    var kok = document.getElementById('hava');
    if (!kok) return;
    var ic = el('div', 'hv-kok', kok), sim = havaSim(ic, 's10');
    var kart = el('div', 'hv-kart', kok);
    kart.setAttribute('aria-live', 'polite');
    var ACIK = {
      oneri: ['Önerilen düzen', 'Ön fanlar soğuk havayı alır, arka ve üst fanlar sıcak havayı atar. Giriş biraz fazla: hafif pozitif basınç.'],
      ters: ['Arka fan ters', 'Arka fan dışarı atması gerekirken içeri üflüyor: soğutucunun attığı sıcak hava geri itilir, işlemci ısınır.'],
      cikis: ['Yalnız çıkış', 'Yalnız çıkış fanları: negatif basınç. Hava filtresiz aralıklardan emilir; toz (gri noktalar) birikir.'],
      fansiz: ['Fansız', 'Kasa fanı yok: sıcak hava yalnız doğal yükselmeyle çıkar; kasa ve parçalar çok ısınır.']
    };
    var AD = ['oneri', 'ters', 'cikis', 'fansiz'];
    function sec(i) {
      sim.ayarla(DUZEN[AD[i]]);
      kart.innerHTML = '<b></b><span></span>';
      kart.firstChild.textContent = ACIK[AD[i]][0];
      kart.lastChild.textContent = ACIK[AD[i]][1];
    }
    var g = secGrup(kok, AD.map(function (a) { return ACIK[a][0]; }), sec, { baslangic: 0, aria: 'Fan düzeni', sinif: 'hv-duzen' });
    kok.insertBefore(g.el, ic);
    sim.ayarla(DUZEN.oneri, true);
    sec(0);
    DERS.slaytAcilinca('s10', function () { g.sec(0); sim.ayarla(DUZEN.oneri, true); sec(0); });
  })();

  /* ─────────── Etkinlik 2: fan yönü ve hızı (E-SURGU) — görevler ─────────── */
  (function () {
    var kok = document.getElementById('hava-gorev');
    if (!kok) return;
    kok.innerHTML = '<div class="hg"><div class="hg-sim"></div><div class="hg-fanlar"></div><div class="hg-alt"><div class="hg-mesaj" aria-live="polite"></div></div></div>';
    var sim = havaSim(kok.querySelector('.hg-sim'), 's12');
    var ayar = ayarKopya(DUZEN.ters);
    var gorevler = document.querySelectorAll('#gorevler-2 li'), ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var tamam = [false, false, false, false], mesajEl = kok.querySelector('.hg-mesaj');
    function mesaj(t, tur) { mesajEl.textContent = t; mesajEl.className = 'hg-mesaj' + (tur ? ' ' + tur : ''); }
    var fanKok = kok.querySelector('.hg-fanlar'), kontroller = {};
    FANLAR.forEach(function (f) {
      var r = el('div', 'hg-fan', fanKok);
      el('b', 'hg-ad', r, f.etiket);
      var yon = secGrup(r, ['Giriş', 'Çıkış', 'Kapalı'], function (i) {
        ayar[f.ad].yon = [1, -1, 0][i];
        if (ayar[f.ad].yon && !ayar[f.ad].hiz) { ayar[f.ad].hiz = 0.6; surgu.value = 60; deger.textContent = '%60'; }
        guncelle();
      }, { aria: f.etiket + ' fan yönü', sinif: 'hg-yon' });
      var surgu = el('input', 'hg-surgu', r);
      surgu.type = 'range'; surgu.min = 0; surgu.max = 100; surgu.step = 10;
      surgu.setAttribute('aria-label', f.etiket + ' fan hızı (yüzde)');
      var deger = el('span', 'hg-deger', r);
      surgu.addEventListener('input', function () {
        ayar[f.ad].hiz = surgu.value / 100; deger.textContent = '%' + surgu.value;
        if (!ayar[f.ad].hiz && ayar[f.ad].yon) { ayar[f.ad].yon = 0; yon.sec(2); }
        guncelle();
      });
      kontroller[f.ad] = { yon: yon, surgu: surgu, deger: deger };
    });
    function kontrolleriYaz() {
      FANLAR.forEach(function (f) {
        var d = ayar[f.ad], k = kontroller[f.ad];
        k.yon.sec(d.yon > 0 ? 0 : (d.yon < 0 ? 1 : 2));
        k.surgu.value = Math.round(d.hiz * 100); k.deger.textContent = '%' + Math.round(d.hiz * 100);
      });
    }
    function gorevBitir(i, metin) {
      if (tamam[i]) return;
      tamam[i] = true;
      gorevler[i].classList.add('tamam');
      var n = tamam.filter(Boolean).length;
      ilerle(n, 4);
      mesaj('✔ ' + metin, 'dogru');
      D.ses('klik');
      if (n === 4) { DERS.konfeti(); setTimeout(function () { mesaj('✔ Tüm görevler tamam: ön giriş, arka/üst çıkış, hafif pozitif basınç ve makul fan hızı en iyi dengedir.', 'dogru'); }, AZ ? 0 : 2600); }
    }
    var bekleyen = null;
    function guncelle() {
      sim.ayarla(ayar);
      var r = sim.sonuc();
      if (r.basinc === 'pozitif' && r.cik > 0) gorevBitir(1, 'Pozitif basınç: giriş ' + Math.round(r.gir) + ' CFM > çıkış ' + Math.round(r.cik) + ' CFM. Hava filtreli girişlerden girer.');
      else if (r.basinc === 'negatif') gorevBitir(2, 'Negatif basınç: çıkış ' + Math.round(r.cik) + ' CFM > giriş ' + Math.round(r.gir) + ' CFM. Hava filtresiz aralıklardan emilir; toz birikir.');
      else mesaj(r.basinc === 'yok' ? 'Fan yok: yalnız doğal akış var.' : 'Basınç: ' + r.basinc + '. Sıcaklıklar durulunca görevlere bak.', '');
      bekleyen = true;
    }
    // Sıcaklığa bağlı görevler, değerler durulunca denetlenir
    (function denetle() {
      setTimeout(denetle, 500);
      if (!aktifMi('s12') || !bekleyen || !sim.oturdu()) return;
      bekleyen = false;
      var r = sim.sonuc(), a = ayar;
      if (a.arka.yon < 0 && a.arka.hiz >= 0.3 && r.cpu < 64) gorevBitir(0, 'Arka fan artık dışarı atıyor: işlemci ' + Math.round(r.cpu) + ' °C.');
      var sessiz = FANLAR.every(function (f) { return !a[f.ad].yon || a[f.ad].hiz <= 0.6; });
      if (sessiz && r.gir + r.cik > 0 && r.cpu < 65) gorevBitir(3, 'Sessiz ve serin: en hızlı fan %' + Math.round(r.enHiz * 100) + ', işlemci ' + Math.round(r.cpu) + ' °C.');
      else if (sessiz && r.cpu >= 65 && r.gir + r.cik > 0) mesaj('Fanlar sessiz ama işlemci ' + Math.round(r.cpu) + ' °C. Fan yönlerini kontrol et.', 'yanlis');
    })();
    var sifir = DERS.dugme(kok.querySelector('.hg-alt'), 'Başa al', function () { ayar = ayarKopya(DUZEN.ters); kontrolleriYaz(); sim.ayarla(ayar, true); mesaj('Başlangıç: arka fan ters takılmış (içeri üflüyor).', ''); }, 'hg-sifirla');
    void sifir;
    kontrolleriYaz();
    sim.ayarla(ayar, true);
    mesaj('Başlangıç: arka fan ters takılmış (içeri üflüyor). İşlemci sıcaklığını izle.', '');
    kok._h06 = { sim: sim, ayar: function () { return ayar; } };
  })();

  /* ─────────── Etkinlik 1: E-HESAP güç hesaplayıcı + görevler ─────────── */
  (function () {
    var kok = document.getElementById('hesaplayici');
    if (!kok) return;
    var SEC = {
      cpu: { ad: 'İşlemci (TDP)', s: [['65 W', 65], ['125 W', 125], ['170 W', 170]] },
      gpu: { ad: 'Ekran kartı', s: [['Tümleşik', 0], ['75 W', 75], ['220 W', 220], ['320 W', 320]] },
      ram: { ad: 'RAM', s: [['2 modül', 8], ['4 modül', 16]] },
      disk: { ad: 'Depolama', s: [['NVMe', 7], ['NVMe + HDD', 16]] },
      fan: { ad: 'Kasa fanı', s: [['2', 6], ['4', 12]] },
      pay: { ad: 'Pay', s: [['%20', 0.2], ['%25', 0.25], ['%30', 0.3]] },
      sert: { ad: '80 PLUS', s: [['Bronze', 'Bronze'], ['Gold', 'Gold'], ['Platinum', 'Platinum']] }
    };
    var SABIT = { anakart: 40, usb: 10 };
    var durum = { cpu: 1, gpu: 2, ram: 0, disk: 0, fan: 0, pay: 1, sert: 1 };
    function hesap(d) {
      var v = function (k) { return SEC[k].s[d[k]][1]; };
      var hdd = d.disk === 1 ? 9 : 0;
      var top = v('cpu') + v('gpu') + v('ram') + v('disk') + v('fan') + SABIT.anakart + SABIT.usb;
      var hedef = top * (1 + v('pay')), oneri = standartUst(hedef), yuk = top / oneri * 100;
      var s = sertBul(v('sert')), ver = verimAt(s, yuk), priz = top / (ver / 100);
      var r12 = v('cpu') + v('gpu') + v('fan') + v('ram') + hdd / 2 + SABIT.anakart * 0.5;
      var r5 = SABIT.usb + hdd / 2 + SABIT.anakart * 0.25, r33 = 7 + SABIT.anakart * 0.25;
      return { top: top, hedef: hedef, oneri: oneri, yuk: yuk, ver: ver, priz: priz, isi: priz - top, pay: v('pay'), sert: v('sert'), r12: r12, r5: r5, r33: r33 };
    }
    kok.innerHTML = '<div class="hs"><div class="hs-gorev" aria-live="polite"></div><div class="hs-govde"><div class="hs-girdi"></div><div class="hs-cikti"></div></div></div>';
    var gorevEl = kok.querySelector('.hs-gorev'), girdi = kok.querySelector('.hs-girdi'), cikti = kok.querySelector('.hs-cikti');
    var gruplar = {};
    Object.keys(SEC).forEach(function (k) {
      var r = el('div', 'hs-satir', girdi);
      el('span', 'hs-et', r, SEC[k].ad);
      gruplar[k] = secGrup(r, SEC[k].s.map(function (x) { return x[0]; }), function (i) { durum[k] = i; ciz(); }, { baslangic: durum[k], aria: SEC[k].ad });
    });
    el('div', 'hs-sabit', girdi, 'Sabit: anakart ≈ 40 W, USB ve çevre birimleri ≈ 10 W');
    cikti.innerHTML = '<div class="hs-top"><span>Toplam (tam yük)</span><b class="hs-toplam"></b></div>' +
      '<div class="hs-formul"></div>' +
      '<div class="hs-oneri"><span>Önerilen güç kaynağı</span><b></b></div>' +
      '<div class="hs-yuk"><span class="hs-yuk-yazi"></span><div class="hs-yuk-bar"><i></i></div></div>' +
      '<div class="hs-ikili"><div><span>Prizden</span><b class="hs-priz"></b></div><div><span>Isı kaybı</span><b class="hs-isi"></b></div></div>' +
      '<div class="hs-raylar"><span>Hatlara göre (yaklaşık)</span><div class="hs-ray-bar"><i class="r12"></i><i class="r5"></i><i class="r33"></i></div>' +
      '<div class="hs-ray-lejant"><span><i class="r12"></i>+12 V</span><span><i class="r5"></i>+5 V</span><span><i class="r33"></i>+3,3 V</span></div></div>';
    function ciz() {
      var r = hesap(durum);
      cikti.querySelector('.hs-toplam').textContent = r.top + ' W';
      cikti.querySelector('.hs-formul').textContent = r.top + ' W × ' + sayi(1 + r.pay, 2) + ' = ' + sayi(r.hedef, 0) + ' W → bir üst değer';
      cikti.querySelector('.hs-oneri b').textContent = r.oneri + ' W';
      cikti.querySelector('.hs-yuk-yazi').textContent = 'Tam yükte %' + sayi(r.yuk, 0) + ' yük · ' + r.sert + ' verim ≈ %' + sayi(r.ver, 1);
      cikti.querySelector('.hs-yuk-bar i').style.width = Math.min(100, r.yuk).toFixed(0) + '%';
      cikti.querySelector('.hs-priz').textContent = sayi(r.priz, 0) + ' W';
      cikti.querySelector('.hs-isi').textContent = sayi(r.isi, 0) + ' W';
      var t = r.r12 + r.r5 + r.r33;
      cikti.querySelector('.hs-ray-bar .r12').style.width = (r.r12 / t * 100).toFixed(1) + '%';
      cikti.querySelector('.hs-ray-bar .r5').style.width = (r.r5 / t * 100).toFixed(1) + '%';
      cikti.querySelector('.hs-ray-bar .r33').style.width = (r.r33 / t * 100).toFixed(1) + '%';
      cikti.querySelector('.hs-ray-lejant span:first-child').lastChild.textContent = '+12 V %' + sayi(r.r12 / t * 100, 0);
    }
    // Görevler (cevaplar aynı formüllerle hesaplanır)
    var oyun = { cpu: 1, gpu: 2, ram: 0, disk: 0, fan: 1, pay: 1 };
    function sistem(o, ek) { return Object.assign({ cpu: 0, gpu: 0, ram: 0, disk: 0, fan: 0, pay: 1, sert: 1 }, o, ek || {}); }
    var g3b = hesap(sistem(oyun, { sert: 0 })), g3g = hesap(sistem(oyun, { sert: 1 })), fark = g3b.isi - g3g.isi;
    var GOREV = [
      { bas: 'Ofis bilgisayarı', soru: '65 W işlemci, tümleşik grafik, 2 RAM, NVMe, 2 fan. %25 payla önerilen güç kaynağı hangisi?',
        sec: ['300 W', '550 W', '850 W'], dogru: hesap(sistem({ cpu: 0, gpu: 0 })).oneri + ' W',
        ipucu: 'Toplamı bul (≈ 136 W), 1,25 ile çarp, bir üst standart değeri seç.' },
      { bas: 'Oyun bilgisayarı', soru: '125 W işlemci, 220 W ekran kartı, 2 RAM, NVMe, 4 fan. %25 payla önerilen güç kaynağı hangisi?',
        sec: ['450 W', '550 W', '750 W'], dogru: hesap(sistem(oyun)).oneri + ' W',
        ipucu: 'Toplam ≈ ' + hesap(sistem(oyun)).top + ' W; 450 W pay bırakmaz.' },
      { bas: 'Verim karşılaştırması', soru: 'Aynı oyun bilgisayarı tam yükte. Bronze yerine Gold seçilirse ısı kaybı yaklaşık kaç W azalır?',
        sec: ['≈ ' + Math.round(fark / 3) + ' W', '≈ ' + Math.round(fark) + ' W', '≈ ' + Math.round(fark * 2.2) + ' W'], dogru: '≈ ' + Math.round(fark) + ' W',
        ipucu: 'Önce Bronze, sonra Gold seçip “Isı kaybı” değerlerinin farkını al.' },
      { bas: 'İş istasyonu', soru: '170 W işlemci, 320 W ekran kartı, 4 RAM, NVMe + HDD, 4 fan. %30 payla önerilen güç kaynağı hangisi?',
        sec: ['750 W', '850 W', '1200 W'], dogru: hesap(sistem({ cpu: 2, gpu: 3, ram: 1, disk: 1, fan: 1, pay: 2 })).oneri + ' W',
        ipucu: 'Payı %30 yap: ' + hesap(sistem({ cpu: 2, gpu: 3, ram: 1, disk: 1, fan: 1, pay: 2 })).top + ' W × 1,30 = ? W.' }
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-1'), gi = 0, cozulen = 0;
    function gorevGoster() {
      gorevEl.innerHTML = '';
      if (gi >= GOREV.length) {
        gorevEl.className = 'hs-gorev son';
        el('b', '', gorevEl, '✔ Dört görev tamam');
        el('span', '', gorevEl, 'Güç = toplam × (1 + pay) → bir üst değer; prizden çekilen = DC yük ÷ verim.');
        DERS.dugme(gorevEl, 'Yeniden', function () { gi = 0; cozulen = 0; ilerle(0, 4); gorevGoster(); }, 'dy-ileri');
        return;
      }
      var g = GOREV[gi];
      gorevEl.className = 'hs-gorev';
      el('span', 'hs-no', gorevEl, 'Görev ' + (gi + 1) + ' / ' + GOREV.length + ' · ' + g.bas);
      el('b', 'hs-soru', gorevEl, g.soru);
      var sc = el('div', 'hs-secenek', gorevEl), geri = el('div', 'hs-geri', gorevEl);
      g.sec.forEach(function (m) {
        var b = DERS.dugme(sc, m, function () {
          if (m === g.dogru) {
            sc.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
            b.classList.add('iyi');
            geri.className = 'hs-geri iyi'; geri.textContent = '✓ Doğru. ';
            cozulen++; ilerle(cozulen, GOREV.length); D.ses('klik');
            if (cozulen === GOREV.length) DERS.konfeti();
            DERS.dugme(geri, gi + 1 < GOREV.length ? 'Sonraki görev →' : 'Bitir →', function () { gi++; gorevGoster(); }, 'dy-ileri');
          } else {
            b.classList.add('kotu'); b.disabled = true;
            geri.className = 'hs-geri kotu'; geri.textContent = '✗ Tekrar dene. İpucu: ' + g.ipucu;
            D.ses('hata');
          }
        });
        b.className = 'hs-sec';
      });
    }
    ciz();
    gorevGoster();
    kok._h06 = { GOREV: GOREV, hesap: hesap };
  })();
})();
