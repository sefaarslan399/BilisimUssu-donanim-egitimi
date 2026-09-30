/* DON-301 H07 — Ekran Kartı ve Bağlantı Standartları · ders betiği (ortak betikten sonra çalışır)
   Derse özel kalıplar: A-YARIS (CPU–GPU boyama yarışı, 2D kanvas), iGPU/dGPU mimari şeması (A-AKIS 2D),
   VRAM (M-GPU patlatma + A-AKIS 3D + VRAM doluluk paneli), HDMI/DP (M-GPU braketi + M-KABLO-UCLARI, A-FIS),
   USB-C pin şeması (moda göre çalışan pinler, fişi çevirme), A-KARSILASTIR (60/144 Hz ağır çekim) + bant hesaplayıcı,
   E-SINIFLA (kablo–senaryo) ve bağlantı planı görevi. Bant genişliği değerleri yaklaşık/örnektir (8 bit renk, ≈ %5 boşluk süresi). */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 6’da gereken bant genişliğini hesaplayarak kontrol edeceğiz.');

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
  function sure(sn) {
    if (sn < 60) return '≈ ' + Math.round(sn) + ' sn';
    var d = Math.floor(sn / 60), k = Math.round(sn - d * 60);
    if (d >= 10) return '≈ ' + Math.round(sn / 60) + ' dk';
    return '≈ ' + d + ' dk' + (k ? ' ' + k + ' sn' : '');
  }

  /* Bant genişliği (Gbit/s): genişlik × yükseklik × Hz × 24 bit × 1,05 (boşluk süresi, yaklaşık) */
  function gereken(w, h, hz) { return w * h * hz * 24 * 1.05 / 1e9; }
  /* Bağlantıların taşıyabildiği veri hızı (kodlama sonrası, yaklaşık) */
  var BAGLANTI = [
    { ad: 'HDMI 1.4', g: 8.16, tur: 'hdmi' },
    { ad: 'HDMI 2.0', g: 14.4, tur: 'hdmi' },
    { ad: 'DP 1.2', g: 17.28, tur: 'dp' },
    { ad: 'DP 1.4', g: 25.92, tur: 'dp' },
    { ad: 'HDMI 2.1', g: 42.67, tur: 'hdmi' },
    { ad: 'DP 2.1', g: 77.37, tur: 'dp' }
  ];

  /* Fiş yüzü simgeleri (SVG) — svg_uret.py’deki çizimlerin JS karşılığı */
  var FIS_SVG = {
    hdmi: '<svg viewBox="0 0 64 30" aria-hidden="true"><path d="M6 7h52v11l-5 5H11l-5-5z" fill="#1f2937" stroke="#64748b" stroke-width="1.5"/><rect x="13" y="11" width="38" height="4" rx="1" fill="#d6a24a"/></svg>',
    dp: '<svg viewBox="0 0 64 30" aria-hidden="true"><path d="M5 7h54v10l-7 6H5z" fill="#1f2937" stroke="#64748b" stroke-width="1.5"/><rect x="11" y="11" width="38" height="4" rx="1" fill="#d6a24a"/></svg>',
    usbc: '<svg viewBox="0 0 64 30" aria-hidden="true"><rect x="14" y="8" width="36" height="13" rx="6.5" fill="#1f2937" stroke="#64748b" stroke-width="1.5"/><rect x="21" y="13" width="22" height="3" rx="1" fill="#d6a24a"/></svg>',
    usba: '<svg viewBox="0 0 64 30" aria-hidden="true"><rect x="9" y="6" width="46" height="18" rx="1.5" fill="#e5e7eb" stroke="#64748b" stroke-width="1.5"/><rect x="12" y="9" width="40" height="12" fill="#111827"/><rect x="13" y="10" width="38" height="5" rx="1" fill="#2563eb"/></svg>'
  };

  /* ─────────── Kapak: ekran kartı + HDMI, DP, USB-C kablo uçları ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, zemin: false, arkaPlan: 'seffaf',
      kamera: { yon: [0.42, 0.38, 1], pay: 0.84 } });
    var gpu = s.ekle('M-GPU', { donus: [0, 0.12, 0] });
    ['hdmi', 'dp', 'usbc'].forEach(function (t, i) {
      var f = s.ekle('M-KABLO-UCLARI', { modelOps: { tur: t, kabloUzun: 5 }, konum: [-3 + i * 5.2, 1.2, 8.5], olcek: 1.7 });
      f.rotation.set(Math.PI / 2 - 0.25, 0, 0.1 * (i - 1));
    });
    s.yerlestir();
    gpu.userData.hiz = 5; gpu.userData.baslat(s);
    var t0 = s.orb.theta, z = 0;
    s.herKare(function (dt) { if (!AZ) { z += dt; s.orb.theta = t0 + Math.sin(z * 0.3) * 0.28; } });
  });

  /* ─────────── Adım 1: A-YARIS — CPU 8 güçlü çekirdek, GPU 432 basit çekirdek ─────────── */
  (function () {
    var kok = document.getElementById('yaris');
    if (!kok) return;
    var SUT = 48, SAT = 27, N = SUT * SAT, CPU_C = 8, GPU_C = 432, ZINCIR = 16;
    var TARAF = [
      { ad: 'CPU', alt: '8 güçlü çekirdek · ≈ 5 GHz', cek: CPU_C, carpan: 1, renk: '#4f46e5' },
      { ad: 'GPU', alt: '432 basit çekirdek (gerçekte binlerce) · ≈ 2,5 GHz', cek: GPU_C, carpan: 2, renk: '#0e7490' }
    ];
    kok.innerHTML = '<div class="yr-ust"></div><div class="yr-ikili"></div><div class="panel-sonuc yr-sonuc" aria-live="polite"></div>';
    var ikili = kok.querySelector('.yr-ikili'), sonuc = kok.querySelector('.yr-sonuc');
    TARAF.forEach(function (t) {
      var k = el('div', 'yr-kart', ikili);
      k.innerHTML = '<div class="yr-bas"><b></b><span></span></div><canvas class="yr-tuval" role="img"></canvas><div class="yr-sayac"><span>Süre</span><code>0 birim</code></div>';
      k.querySelector('b').textContent = t.ad;
      k.querySelector('.yr-bas span').textContent = t.alt;
      t.tuval = k.querySelector('canvas');
      t.tuval.setAttribute('aria-label', t.ad + ' paneli: aynı resim ızgarası ve çekirdekler');
      t.sayac = k.querySelector('code');
    });
    // Resim: gökyüzü, güneş, dağlar, çayır (her karo bağımsız hesaplanır)
    function renk(c, r) {
      var x = (c + 0.5) / SUT, y = (r + 0.5) / SAT;
      var dag = 0.55 + 0.12 * Math.sin(x * 7.5) + 0.07 * Math.sin(x * 17 + 1);
      if (y > 0.82) return 'hsl(' + (100 + 20 * Math.sin(x * 9)) + ',55%,' + (38 + 6 * Math.sin(x * 23)) + '%)';
      if (y > dag) return 'hsl(' + (215 + 10 * x) + ',22%,' + (30 + (y - dag) * 40) + '%)';
      var gx = x - 0.76, gy = y - 0.26;
      if (gx * gx * 3.2 + gy * gy < 0.012) return '#fbbf24';
      return 'hsl(' + (205 - y * 30) + ',80%,' + (58 + y * 22) + '%)';
    }
    var RENK = [];
    for (var r = 0; r < SAT; r++) for (var c = 0; c < SUT; c++) RENK.push(renk(c, r));
    var mod = 0, calisma = 0, durum = null;
    function boyutla(t) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = t.tuval.clientWidth, h = t.tuval.clientHeight;
      if (!w || !h) return false;
      if (t.tuval.width !== Math.round(w * dpr)) { t.tuval.width = Math.round(w * dpr); t.tuval.height = Math.round(h * dpr); }
      t.dpr = dpr; t.w = w; t.h = h;
      return true;
    }
    function ciz(t, bitti, aktifler) {
      if (!boyutla(t)) return;
      var g = t.tuval.getContext('2d');
      g.setTransform(t.dpr, 0, 0, t.dpr, 0, 0);
      g.clearRect(0, 0, t.w, t.h);
      var serit = Math.max(14, Math.min(t.h * 0.16, 40)), alanH = t.h - serit - 8, cw = Math.min(t.w / SUT, alanH / SAT), iw = cw * SUT, ih = cw * SAT, x0 = (t.w - iw) / 2, y0 = Math.max(2, (alanH - ih) / 2);
      if (mod === 0) {
        for (var i = 0; i < N; i++) {
          var cx = x0 + (i % SUT) * cw, cy = y0 + Math.floor(i / SUT) * cw;
          if (i < bitti) { g.fillStyle = RENK[i]; g.globalAlpha = 1; }
          else { g.fillStyle = RENK[i]; g.globalAlpha = 0.13; }
          g.fillRect(cx, cy, cw - 0.4, cw - 0.4);
        }
        g.globalAlpha = 1;
        if (aktifler) {                                   // şu an boyanan karolar
          g.strokeStyle = '#f43f5e'; g.lineWidth = 1.4;
          for (var a = aktifler[0]; a < aktifler[1] && a < N; a++) g.strokeRect(x0 + (a % SUT) * cw, y0 + Math.floor(a / SUT) * cw, cw - 0.4, cw - 0.4);
        }
      } else {                                            // sıralı iş: 16 halkalı zincir
        var yar = Math.min(iw / (ZINCIR * 2.2), ih / 5), yy = y0 + ih / 2;
        g.strokeStyle = '#94a3b8'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x0 + yar * 1.2, yy); g.lineTo(x0 + iw - yar * 1.2, yy); g.stroke();
        for (var z = 0; z < ZINCIR; z++) {
          var zx = x0 + yar * 1.2 + z * (iw - yar * 2.4) / (ZINCIR - 1);
          g.beginPath(); g.arc(zx, yy, yar, 0, Math.PI * 2);
          g.fillStyle = z < bitti ? t.renk : '#e2e8f0'; g.fill();
          if (aktifler && z === bitti) { g.strokeStyle = '#f43f5e'; g.lineWidth = 2.5; g.stroke(); }
        }
        g.fillStyle = '#475569'; g.font = '700 ' + Math.max(10, Math.round(cw * 1.6)) + 'px Inter, Arial, sans-serif'; g.textAlign = 'center';
        g.fillText('her adım bir öncekinin sonucunu bekler', t.w / 2, yy + yar + Math.max(14, cw * 3));
      }
      // çekirdek şeridi
      var sy = y0 + ih + 6, sh = serit, calisan = mod === 0 ? (aktifler ? t.cek : 0) : (aktifler ? 1 : 0);
      if (t.cek === CPU_C) {
        var bw = Math.min(iw / 8 - 6, sh * 1.6);
        for (var k = 0; k < 8; k++) { g.fillStyle = k < calisan ? t.renk : '#cbd5e1'; g.fillRect(t.w / 2 - 4 * (bw + 6) + k * (bw + 6) + 3, sy, bw, sh); }
      } else {
        var sut = 72, satir = 6, kw = iw / sut, kh = sh / satir;
        for (var q = 0; q < GPU_C; q++) {
          g.fillStyle = q < calisan ? t.renk : '#cbd5e1';
          g.fillRect(x0 + (q % sut) * kw, sy + Math.floor(q / sut) * kh, kw - 0.8, kh - 0.8);
        }
      }
    }
    function toplamBirim(t) { return mod === 0 ? Math.ceil(N / t.cek) * t.carpan : ZINCIR * t.carpan; }
    function sifirla() {
      calisma++; durum = null;
      TARAF.forEach(function (t) { t.sayac.textContent = '0 birim'; t.sayac.parentNode.classList.remove('bitti'); ciz(t, 0, null); });
      sonuc.className = 'panel-sonuc yr-sonuc';
      sonuc.textContent = mod === 0 ? 'Tahmin et: aynı resmi hangisi önce bitirir? Sonra Başlat’a bas.' : 'Sıralı işte tahminin değişir mi? Başlat’a bas.';
    }
    function baslat() {
      sifirla();
      var id = calisma, BIRIM = mod === 0 ? (AZ ? 1 : 36) : (AZ ? 1 : 150), t0 = performance.now();
      durum = { id: id };
      sonuc.textContent = mod === 0 ? 'Boyama sürüyor: ' + sayi(N) + ' karo…' : 'Zincir işleniyor: ' + ZINCIR + ' adım…';
      (function kare(an) {
        if (id !== calisma) return;
        var gecen = (an - t0) / BIRIM, hepsi = true;
        TARAF.forEach(function (t) {
          var top = toplamBirim(t), b = Math.min(gecen, top), tur = Math.floor(b / t.carpan);
          var bitti = mod === 0 ? Math.min(N, tur * t.cek) : Math.min(ZINCIR, tur);
          var bitmedi = b < top;
          if (bitmedi) hepsi = false;
          ciz(t, bitti, bitmedi ? (mod === 0 ? [bitti, bitti + t.cek] : true) : null);
          t.sayac.textContent = (bitmedi ? Math.floor(b) : top) + ' birim';
          t.sayac.parentNode.classList.toggle('bitti', !bitmedi);
        });
        if (!hepsi) { requestAnimationFrame(kare); return; }
        var c = toplamBirim(TARAF[0]), gp = toplamBirim(TARAF[1]);
        sonuc.className = 'panel-sonuc yr-sonuc iyi';
        sonuc.textContent = mod === 0
          ? 'GPU ' + gp + ' birimde, CPU ' + c + ' birimde bitirdi: ≈ ' + Math.round(c / gp) + ' kat. Bağımsız karolar aynı anda boyandı.'
          : 'Bu kez CPU ' + c + ', GPU ' + gp + ' birim: sıralı işte çekirdek sayısı işe yaramaz, hızlı tek çekirdek kazanır.';
      })(t0);
    }
    var ust = kok.querySelector('.yr-ust');
    secGrup(ust, ['Görüntü (paralel)', 'Sıralı iş'], function (i) { mod = i; sifirla(); }, { baslangic: 0, aria: 'İş türü' });
    var ctl = el('div', 'secici yr-kontrol', ust);
    DERS.dugme(ctl, 'Başlat ▶', baslat);
    DERS.dugme(ctl, 'Baştan', sifirla);
    DERS.slaytAcilinca('s5', function () { setTimeout(sifirla, 60); }, true);
    window.addEventListener('resize', function () { if (aktifMi('s5') && !durum) sifirla(); });
    kok._h07 = { baslat: baslat, mod: function (i) { mod = i; sifirla(); } };
  })();

  /* ─────────── Adım 2: iGPU / dGPU mimari şeması (A-AKIS 2D) + “Kablo nereye?” ─────────── */
  (function () {
    var kok = document.getElementById('mimari');
    if (!kok) return;
    var T = function (x, y, t, cls, anchor) { return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'mm-t') + '" text-anchor="' + (anchor || 'middle') + '">' + t + '</text>'; };
    var svg = '<svg viewBox="0 0 380 222" class="mm-svg" role="img" aria-label="Solda tümleşik grafik: işlemcinin içindeki grafik birimi sistem RAM’ini paylaşır, görüntü anakart çıkışından verilir. Sağda harici ekran kartı: GPU çipi kendi VRAM çipleriyle çok hızlı veri alışverişi yapar, işlemciye PCIe x16 ile bağlanır, görüntü kartın braketindeki çıkışlardan verilir.">' +
      // sol: iGPU
      '<g class="mm-yari mm-sol"><rect x="6" y="6" width="180" height="150" rx="12" class="mm-zemin"/>' + T(96, 24, 'Tümleşik (iGPU)', 'mm-bas') +
      '<rect x="16" y="34" width="104" height="62" rx="6" fill="#475569"/>' + T(68, 46, 'İşlemci', 'mm-k mm-beyaz') +
      '<rect x="22" y="52" width="46" height="38" rx="4" fill="#94a3b8"/>' + T(45, 75, 'Çekirdek', 'mm-k') +
      '<rect x="72" y="52" width="42" height="38" rx="4" fill="#22d3ee"/>' + T(93, 75, 'iGPU', 'mm-k') +
      '<path d="M93 90V120" class="mm-hat" stroke="#0891b2"/><path d="M93 90V120" class="mm-akis mm-yavas"/>' +
      '<rect x="16" y="120" width="104" height="26" rx="3" fill="#15803d"/>' +
      [0, 1, 2, 3, 4].map(function (i) { return '<rect x="' + (22 + i * 19) + '" y="124" width="14" height="10" rx="1" fill="#14532d"/>'; }).join('') +
      T(68, 143, 'Sistem RAM · paylaşılan', 'mm-k mm-beyaz') + T(98, 109, '≈ 90 GB/s', 'mm-hiz', 'start') +
      '<path d="M120 64H134" class="mm-hat" stroke="#64748b"/>' +
      '<rect x="134" y="46" width="44" height="34" rx="5" fill="#e2e8f0" stroke="#94a3b8" class="mm-port-mb"/>' +
      '<path d="M141 57h30v7l-3 3h-24l-3-3z" fill="#1f2937"/>' + T(156, 92, 'Anakart', 'mm-k') + T(156, 102, 'çıkışı', 'mm-k') + '</g>' +
      // sağ: dGPU
      '<g class="mm-yari mm-sag"><rect x="194" y="6" width="180" height="150" rx="12" class="mm-zemin"/>' + T(284, 24, 'Harici (dGPU)', 'mm-bas') +
      '<rect x="206" y="34" width="160" height="78" rx="8" fill="#1f2328"/>' +
      '<rect x="206" y="34" width="10" height="78" rx="2" fill="#cbd5e1" class="mm-port-gpu"/>' +
      [0, 1, 2, 3].map(function (i) { return '<rect x="208" y="' + (42 + i * 17) + '" width="6" height="11" rx="1.5" fill="#1f2937"/>'; }).join('') +
      '<rect x="264" y="50" width="42" height="42" rx="4" fill="#1e4d33"/><rect x="272" y="58" width="26" height="26" rx="2" fill="#9ca3af"/>' + T(285, 75, 'GPU', 'mm-k') +
      [48, 65, 82].map(function (y) {
        return '<path d="M248 ' + (y + 6) + 'H264" class="mm-hat" stroke="#38bdf8"/><path d="M248 ' + (y + 6) + 'H264" class="mm-akis mm-hizli"/>' +
          '<path d="M306 ' + (y + 6) + 'H322" class="mm-hat" stroke="#38bdf8"/><path d="M306 ' + (y + 6) + 'H322" class="mm-akis mm-hizli"/>' +
          '<rect x="234" y="' + y + '" width="14" height="12" rx="1.5" fill="#3a3d44" stroke="#64748b"/><rect x="322" y="' + y + '" width="14" height="12" rx="1.5" fill="#3a3d44" stroke="#64748b"/>';
      }).join('') +
      T(285, 105, 'VRAM ≈ 500+ GB/s', 'mm-hiz mm-acik') +
      '<rect x="340" y="28" width="20" height="8" rx="2" fill="#facc15" stroke="#111"/>' + T(350, 48, '8-pin', 'mm-k mm-beyaz') +
      '<rect x="236" y="112" width="96" height="6" fill="#d6a24a"/>' +
      '<path d="M284 118V138" class="mm-hat" stroke="#64748b"/><path d="M284 118V138" class="mm-akis mm-orta"/>' + T(290, 131, 'PCIe x16 ≈ 32 GB/s', 'mm-hiz', 'start') +
      '<rect x="250" y="138" width="68" height="15" rx="4" fill="#475569"/>' + T(284, 149, 'İşlemci', 'mm-k mm-beyaz') + '</g>' +
      // alt: monitör ve kablo yolları
      '<path class="mm-kablo mm-kablo-mb" d="M190 172C190 140 156 132 156 82"/><path class="mm-kablo mm-kablo-gpu" d="M190 172C190 140 211 128 211 104"/>' +
      '<g class="mm-mon"><rect x="160" y="170" width="60" height="38" rx="4" fill="#1f2937"/><rect x="164" y="174" width="52" height="28" rx="2" class="mm-ekran" fill="#334155"/>' +
      '<text x="190" y="192" class="mm-ekran-yazi" text-anchor="middle">?</text><rect x="184" y="208" width="12" height="6" fill="#334155"/><rect x="176" y="213" width="28" height="4" rx="2" fill="#334155"/></g>' +
      T(96, 186, 'Görüntü: anakarttan', 'mm-k mm-gri') + T(284, 186, 'Görüntü: kartın braketinden', 'mm-k mm-gri') +
      '</svg>';
    kok.innerHTML = '<div class="mm-ust"></div><div class="mm-sahne">' + svg + '</div>' +
      '<div class="mm-tablo" role="table" aria-label="Tümleşik ve harici grafik karşılaştırması">' +
      '<div role="row" class="mm-satir mm-tb"><span></span><span>Tümleşik (iGPU)</span><span>Harici (dGPU)</span></div>' +
      '<div role="row" class="mm-satir"><span>Bellek</span><span>Sistem RAM’ini paylaşır</span><span>Kendi VRAM’i (8–24 GB)</span></div>' +
      '<div role="row" class="mm-satir"><span>Bant</span><span>≈ 90 GB/s, işlemciyle ortak</span><span>≈ 300–1000 GB/s</span></div>' +
      '<div role="row" class="mm-satir"><span>Güç</span><span>İşlemcinin güç payından</span><span>≈ 75–450 W, kendi soğutucusu</span></div></div>' +
      '<div class="mm-kart" aria-live="polite"></div>';
    var svgEl = kok.querySelector('svg'), kart = kok.querySelector('.mm-kart'), ekranY = svgEl.querySelector('.mm-ekran-yazi'), ekran = svgEl.querySelector('.mm-ekran');
    var kMb = svgEl.querySelector('.mm-kablo-mb'), kGpu = svgEl.querySelector('.mm-kablo-gpu');
    function kartYaz(b, m, tur) {
      kart.innerHTML = '<b></b><span></span>';
      kart.firstChild.textContent = b; kart.lastChild.textContent = m;
      kart.className = 'mm-kart' + (tur ? ' ' + tur : '');
    }
    function odak(i) {
      svgEl.classList.toggle('odak-sol', i === 0); svgEl.classList.toggle('odak-sag', i === 1);
      var satirlar = kok.querySelectorAll('.mm-satir');
      satirlar.forEach(function (s) { s.classList.toggle('odak-sol', i === 0); s.classList.toggle('odak-sag', i === 1); });
      if (i === 0) kartYaz('iGPU yolu', 'Grafik birimi işlemcinin içinde; dokular ve kareler sistem RAM’inde durur. Bu bant işlemciyle paylaşıldığı için ağır 3D işlerde darboğaz olur. Az güç harcar; ofis, video ve hafif oyun için yeterlidir.');
      else if (i === 1) kartYaz('dGPU yolu', 'GPU kendi VRAM çipleriyle çok geniş bir yoldan konuşur. İşlemciyle PCIe x16 üzerinden haberleşir; güç yuvadan (75 W) ve 8-pin girişlerden (her biri 150 W) gelir.');
    }
    var mesgul = false;
    function kablo(yol, ac) { yol.classList.toggle('acik', ac); }
    function kabloTesti() {
      if (mesgul) return;
      mesgul = true; odak(-1);
      kablo(kMb, false); kablo(kGpu, false);
      ekranY.textContent = '?'; ekran.setAttribute('fill', '#334155');
      kartYaz('Kablo nereye?', 'Bilgisayarda harici ekran kartı takılı. Önce monitör kablosunu anakart çıkışına takalım…');
      bekle(0.9).then(function () {
        kablo(kMb, true);
        return bekle(1.1);
      }).then(function () {
        ekranY.textContent = 'Sinyal yok'; ekran.setAttribute('fill', '#7f1d1d');
        svgEl.classList.add('mm-hata-mb');
        kartYaz('✗ Anakart çıkışı: görüntü yok', 'Anakart çıkışları tümleşik grafiğe bağlıdır. Harici kart takılıyken tümleşik grafik genellikle devre dışıdır; bazı işlemcilerde hiç yoktur.', 'kotu');
        return bekle(2.4);
      }).then(function () {
        svgEl.classList.remove('mm-hata-mb');
        kablo(kMb, false);
        return bekle(0.5);
      }).then(function () {
        kablo(kGpu, true);
        return bekle(1.1);
      }).then(function () {
        ekranY.textContent = 'Görüntü ✓'; ekran.setAttribute('fill', '#065f46');
        kartYaz('✓ Ekran kartı çıkışı: görüntü var', 'Harici kart varken monitör kablosu kartın braketindeki HDMI ya da DisplayPort çıkışına takılır. Montajdan sonra “görüntü yok” şikâyetinin en sık nedeni budur.', 'iyi');
        mesgul = false;
      });
    }
    var sec = secGrup(kok.querySelector('.mm-ust'), ['iGPU yolu', 'dGPU yolu', 'Kablo nereye?'], function (i) {
      if (i < 2) { if (mesgul) return; kablo(kMb, false); kablo(kGpu, false); ekranY.textContent = '?'; ekran.setAttribute('fill', '#334155'); odak(i); }
      else kabloTesti();
    }, { aria: 'Görünüm' });
    kartYaz('İki yol', 'Solda grafik birimi işlemcinin içinde, sağda ayrı bir kartta. Veri yollarındaki akış hızlarını karşılaştır.');
    DERS.slaytAcilinca('s6', function () {
      if (AZ) return;
      bekle(0.8).then(function () { if (!mesgul) { sec.sec(0); odak(0); } return bekle(3.2); })
        .then(function () { if (!mesgul) { sec.sec(1); odak(1); } });
    });
    kok._h07 = { kabloTesti: kabloTesti, odak: odak };
  })();

  /* ─────────── Adım 3: VRAM — soğutucuyu ayır, veri yolları, VRAM doluluğu ─────────── */
  D.tembel('#s7-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [0.3, 0.5, 1], pay: 1.0, hedefOfset: [5.5, -0.8, 0] } });
    var gpu = s.ekle('M-GPU');
    s.yerlestir();
    gpu.userData.patlatMesafe = 3;
    gpu.userData.hiz = 4; gpu.userData.baslat(s);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.25, maxPolar: 1.65, minYakin: 0.4, maxYakin: 1.4 } });
    D.bilgi(s, ['gpu-cip', 'gpu-bellek', 'gpu-pcie', 'gpu-guc-girisi', 'gpu-ortu', 'gpu-fan-1', 'gpu-fan-2', 'gpu-kanatcik', 'gpu-isi-borusu', 'gpu-arka-plaka', 'gpu-braket']);
    var mesaj = DERS.sahneMesaj(s), sog = gpu.userData.sogutucu, O = gpu.userData.olcu;
    var CX = O.braketX + 10.6, CY = 5.6;
    var BELLEK = [];
    [-1, 1].forEach(function (yon) { [-2.1, 0, 2.1].forEach(function (dy) { BELLEK.push([CX + yon * 3.35, CY + dy]); }); });
    [-1.1, 1.1].forEach(function (dx) { BELLEK.push([CX + dx, CY + 3.55]); });
    var acik = false, mesgul = false, etk = [];
    function temizle() { etk.forEach(function (e) { e.kaldir(); }); etk = []; }
    function kaldir(y, sure) {
      var y0 = sog.position.y;
      return D.tween({ sahne: s, sure: AZ ? 0.01 : sure, anahtar: 'sog-y', hedef: sog, guncelle: function (e) { sog.position.y = y0 + (y - y0) * e; } });
    }
    function ayir(ac) {
      if (mesgul || ac === acik) return Promise.resolve();
      mesgul = true; temizle();
      var z;
      if (ac) {
        z = gpu.userData.patlat(1, AZ ? 0 : 0.6).then(function () { return kaldir(15, 0.9); }).then(function () {
          return s.kameraGit({ hedef: gpu.localToWorld(new V3(CX, CY, 0)), theta: s._baslangic.theta * 0.4, phi: 0.78, yakinlik: 0.62 }, AZ ? 0.01 : 0.9);
        });
      } else {
        z = kaldir(0, 0.8).then(function () { return gpu.userData.patlat(0, AZ ? 0 : 0.6); }).then(function () { return s.sifirla(); });
      }
      return z.then(function () {
        acik = ac; mesgul = false;
        bA.querySelector('span').textContent = ac ? 'Birleştir' : 'Soğutucuyu ayır';
        if (ac) {
          etk.push(s.etiket(s.parca('gpu-cip'), 'GPU çipi', { tur: 'odak', yer: 'merkez' }));
          etk.push(s.etiket(s.parca('gpu-bellek'), '8 VRAM çipi × 32 bit = 256 bit', { tur: 'vurgu', yer: 'alt', ofset: [0, -0.4, 0] }));
          mesaj('GPU çipinin çevresinde 8 bellek çipi var; her biri 32 bitlik yolla bağlı.', 'dogru');
        } else mesaj('Soğutucu, GPU ve VRAM’in ısısını ısı borularıyla kanatçıklara taşır.', '');
      });
    }
    function veriYolu() {
      var p = acik ? Promise.resolve() : ayir(true);
      return p.then(function () {
        mesaj('Her çip GPU’ya kendi 32 bitlik yoluyla veri yollar: 8 × 32 = 256 bit, hepsi aynı anda.', 'dogru');
        var cip = gpu.localToWorld(new V3(CX, CY, 0.5));
        return Promise.all(BELLEK.map(function (b) {
          var bas = gpu.localToWorld(new V3(b[0], b[1], 0.45));
          return D.akis(s, [bas, bas.clone().lerp(cip, 0.5).add(new V3(0, 0, 0.3)), cip], { renk: '#38bdf8', hiz: 4, parcacik: 8, boyut: 2.2, basBoyut: 0.22, izKalinlik: 0.08 });
        }));
      });
    }
    var bA = s.dugme('Soğutucuyu ayır', null, function () { ayir(!acik); }, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Soğutucuyu karttan ayır ya da geri tak' });
    s.dugme('Veri yolu', 'oynat', veriYolu, { yer: 'alt-orta', aciklama: 'VRAM çiplerinden GPU’ya veri akışını göster' });

    // VRAM doluluk paneli (örnek oyun, 3840 × 2160)
    var PAR = [
      { ad: 'Kareler', gb: [0.3, 0.3, 0.3], renk: '#f59e0b' },
      { ad: 'Modeller', gb: [2.0, 2.0, 2.0], renk: '#6366f1' },
      { ad: 'Dokular', gb: [2.5, 4.5, 7.5], renk: '#0891b2' },
      { ad: 'Diğer', gb: [0.8, 0.8, 0.8], renk: '#94a3b8' }
    ];
    var panel = D.div('vr-panel', s.arayuz);
    panel.innerHTML = '<div class="vr-bas">VRAM kullanımı <small>(örnek oyun, 4K)</small></div>' +
      '<div class="vr-et">Doku kalitesi</div><div class="vr-doku"></div><div class="vr-et">Kartın VRAM’i</div><div class="vr-kap"></div>' +
      '<div class="vr-bar" aria-hidden="true"></div><div class="vr-lejant"></div><div class="vr-durum" aria-live="polite"></div>';
    var bar = panel.querySelector('.vr-bar'), durumEl = panel.querySelector('.vr-durum'), lej = panel.querySelector('.vr-lejant');
    var seg = PAR.map(function (p) {
      var i = el('i', '', bar); i.style.background = p.renk;
      var l = el('span', '', lej); l.innerHTML = '<i></i>'; l.firstChild.style.background = p.renk; l.appendChild(document.createTextNode(p.ad));
      return i;
    });
    var tasma = el('i', 'vr-tasma', bar), sinir = el('b', 'vr-sinir', bar);
    var st = { d: 1, k: 0 }, KAP = [8, 12], OLCEK = 13;
    function guncelle(sesli) {
      var top = 0;
      PAR.forEach(function (p, i) { var v = p.gb[st.d]; top += v; seg[i].style.width = (v / OLCEK * 100).toFixed(1) + '%'; });
      var kapGB = KAP[st.k], fazla = Math.max(0, top - kapGB);
      tasma.style.left = (kapGB / OLCEK * 100) + '%'; tasma.style.width = (fazla / OLCEK * 100).toFixed(1) + '%';
      sinir.style.left = (kapGB / OLCEK * 100) + '%';
      panel.classList.toggle('tasti', fazla > 0);
      if (fazla > 0) {
        durumEl.textContent = '✗ ' + sayi(top, 1) + ' GB > ' + kapGB + ' GB: ' + sayi(fazla, 1) + ' GB sistem RAM’inde';
        mesaj('VRAM taştı: sığmayan veriler PCIe (≈ 32 GB/s) üzerinden gelir; VRAM’in 640 GB/s’ine göre ≈ 20 kat yavaş. Kareler gecikir, oyun takılır.', 'yanlis');
        if (sesli) D.uyari(s.parca('gpu-bellek'), { etiket: false, genlik: 0.12 });
      } else {
        durumEl.textContent = '✓ ' + sayi(top, 1) + ' GB / ' + kapGB + ' GB (%' + Math.round(top / kapGB * 100) + ')';
        mesaj(st.d === 2 ? 'Ultra dokular ' + kapGB + ' GB’a sığıyor: kare süreleri düzenli.' : 'Doku kalitesi arttıkça VRAM kullanımı en çok bu ayarla büyür.', 'dogru');
        D.vurguKaldir(s.parca('gpu-bellek'), 0.2);
      }
    }
    secGrup(panel.querySelector('.vr-doku'), ['Düşük', 'Yüksek', 'Ultra'], function (i) { st.d = i; guncelle(true); }, { baslangic: 1, aria: 'Doku kalitesi' });
    secGrup(panel.querySelector('.vr-kap'), ['8 GB', '12 GB'], function (i) { st.k = i; guncelle(true); }, { baslangic: 0, aria: 'Kartın VRAM kapasitesi' });
    guncelle(false);
    mesaj('Kartı döndür; bir parçaya dokun ya da soğutucuyu ayır.', '');
    s._h07 = { ayir: ayir, veriYolu: veriYolu, st: st, guncelle: guncelle };
  });

  /* ─────────── Adım 4: HDMI ve DisplayPort — braket, fiş takma (A-FIS), sürüm tablosu ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [-1, 0.32, 0.55], pay: 0.5 } });
    var gpu = s.ekle('M-GPU');
    var port = { hdmi: s.parca('port-hdmi'), dp: s.parca('port-dp-2') };
    var fis = {
      hdmi: s.ekle('M-KABLO-UCLARI', { modelOps: { tur: 'hdmi', kabloUzun: 4 } }),
      dp: s.ekle('M-KABLO-UCLARI', { modelOps: { tur: 'dp', kabloUzun: 4 } })
    };
    gpu.updateWorldMatrix(true, true);
    D.fisKonumla(fis.hdmi, port.hdmi, 6);
    D.fisKonumla(fis.dp, port.dp, 6);
    s.yerlestir();
    var bk = new THREE.Box3().setFromObject(s.parca('gpu-braket')), bm = bk.getCenter(new V3());
    s.ops.kamera.hedefOfset = [bm.x - s._merkez.x - 2.2, bm.y - s._merkez.y + 1.2, bm.z - s._merkez.z];
    s.kameraSigdir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.35, maxPolar: 1.6, minYakin: 0.4, maxYakin: 1.8 } });
    var mesaj = DERS.sahneMesaj(s);
    var BILGI = {
      hdmi: ['HDMI fişi: iki alt köşe eğik', 'HDMI: görüntü + ses; TV ve projeksiyonun ortak girişi. ARC/eARC ile TV sesini ses sistemine yollar; kilidi yoktur, sürtünmeyle tutar.'],
      dp: ['DisplayPort fişi: tek köşe eğik, kilitli', 'DisplayPort: görüntü + ses; monitörlerde yaygın. Kilit mandalı fişi tutar (çıkarırken düğmeye bas). MST ile monitörler zincirlenir.']
    };
    var takili = null, mesgul = false, etk = [];
    function temizle() { etk.forEach(function (e) { e.kaldir(); }); etk = []; ['hdmi', 'dp'].forEach(function (t) { D.vurguKaldir(port[t], 0.2); D.vurguKaldir(fis[t], 0.2); }); }
    function tak(t) {
      if (mesgul) return Promise.resolve();
      mesgul = true; temizle();
      var z = Promise.resolve();
      if (takili && takili !== t) { var eski = takili; z = D.fisCikar(fis[eski], port[eski], 6); }
      tabloOdak(t);
      return z.then(function () {
        D.vurgula(port[t], { etiket: false });
        etk.push(s.etiket(fis[t], BILGI[t][0], { tur: 'odak', yer: 'alt', ofset: [0, -0.3, 0] }));
        mesaj(BILGI[t][1], '');
        return takili === t ? D.fisCikar(fis[t], port[t], 6).then(function () { return D.fisTak(fis[t], port[t], { bas: 6 }); }) : D.fisTak(fis[t], port[t], { bas: 6 });
      }).then(function () {
        takili = t; mesgul = false;
        mesaj((t === 'hdmi' ? 'HDMI takıldı. ' : 'DisplayPort takıldı. ') + 'Asıl sınır: port, kablo ve monitör girişinin ortak sürümü.', 'dogru');
      });
    }
    function karsilastir() {
      if (mesgul) return;
      mesgul = true; temizle();
      var p = [];
      ['hdmi', 'dp'].forEach(function (t) { if (takili === t) p.push(D.fisCikar(fis[t], port[t], 6)); });
      takili = null;
      Promise.all(p).then(function () {
        tabloOdak(null);
        D.vurgula(fis.hdmi, { etiket: false }); D.vurgula(fis.dp, { etiket: false, renk: '#8b5cf6' });
        etk.push(s.etiket(fis.hdmi, 'HDMI: 19 pin, 2 köşe eğik', { tur: 'vurgu', yer: 'alt', ofset: [0, -0.3, 0] }));
        etk.push(s.etiket(fis.dp, 'DP: 20 pin, 1 köşe eğik + kilit', { tur: 'vurgu', yer: 'alt', ofset: [0, -0.3, 0] }));
        mesaj('Fiş biçimleri farklıdır; birine diğeri girmez. Birbirine dönüştürücüyle bağlanabilirler.', '');
        mesgul = false;
      });
    }
    s.dugme('HDMI', null, function () { tak('hdmi'); }, { yer: 'alt-orta', aciklama: 'HDMI fişini ekran kartının HDMI çıkışına tak' });
    s.dugme('DisplayPort', null, function () { tak('dp'); }, { yer: 'alt-orta', aciklama: 'DisplayPort fişini ekran kartının DisplayPort çıkışına tak' });
    s.dugme('Karşılaştır', null, karsilastir, { yer: 'alt-orta', aciklama: 'HDMI ve DisplayPort fişlerini karşılaştır' });
    // Sürüm tablosu
    var SURUM = [
      ['hdmi', 'HDMI 1.4', '8,2', '4K 30 Hz'], ['hdmi', 'HDMI 2.0', '14,4', '4K 60 Hz'], ['hdmi', 'HDMI 2.1', '42,7', '4K 144 Hz'],
      ['dp', 'DP 1.2', '17,3', '4K 60 Hz'], ['dp', 'DP 1.4', '25,9', '4K 120 Hz'], ['dp', 'DP 2.1', '77,4', '4K 240 Hz']
    ];
    var panel = D.div('sr-panel', s.arayuz);
    panel.innerHTML = '<div class="sr-bas">Sürümler <small>veri hızı · en çok (8 bit)</small></div><div class="sr-tablo" role="table" aria-label="HDMI ve DisplayPort sürümlerinin veri hızları ve en yüksek görüntü ayarları"></div><div class="sr-not">Gbit/s; sıkıştırmasız (DSC’siz) yaklaşık değerler.</div>';
    var tablo = panel.querySelector('.sr-tablo');
    var satirlar = SURUM.map(function (r) {
      var e = el('div', 'sr-satir sr-' + r[0], tablo);
      e.setAttribute('role', 'row');
      e.innerHTML = '<b></b><code></code><span></span>';
      e.children[0].textContent = r[1]; e.children[1].textContent = r[2]; e.children[2].textContent = r[3];
      return e;
    });
    function tabloOdak(t) { satirlar.forEach(function (e, i) { e.classList.toggle('soluk', t != null && SURUM[i][0] !== t); }); }
    mesaj('Braketteki çıkışlar: 1 HDMI + 3 DisplayPort. Bir fiş seç.', '');
    s._h07 = { tak: tak, karsilastir: karsilastir };
  });

  /* ─────────── Adım 5: USB-C pin şeması + USB hızları ─────────── */
  (function () {
    var kok = document.getElementById('usbc');
    if (!kok) return;
    // Soket (port) ön görünüşü: üst sıra A1→A12, alt sıra B12→B1 (180° simetri)
    var A = ['GND', 'TX1+', 'TX1−', 'VBUS', 'CC1', 'D+', 'D−', 'SBU1', 'VBUS', 'RX2−', 'RX2+', 'GND'];
    var B = ['GND', 'RX1+', 'RX1−', 'VBUS', 'SBU2', 'D−', 'D+', 'CC2', 'VBUS', 'TX2−', 'TX2+', 'GND'];
    var ANO = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12'];
    var BNO = ['B12', 'B11', 'B10', 'B9', 'B8', 'B7', 'B6', 'B5', 'B4', 'B3', 'B2', 'B1'];
    function grup(ad) {
      if (ad === 'GND') return 'gnd';
      if (ad === 'VBUS') return 'vbus';
      if (/^CC/.test(ad)) return 'cc';
      if (/^D[+−]/.test(ad)) return 'd';
      if (/^SBU/.test(ad)) return 'sbu';
      return 'ss';
    }
    var MOD = [
      { ad: 'USB 2.0', eski: 'Hi-Speed', hiz: '480 Mbit/s', mb: 40, fis: 'USB-A, USB-C, micro-B', not: 'Yalnız D+/D− çifti kullanılır. İki sırada da bulunduğu için yön fark etmez.' },
      { ad: '5 Gbps', eski: 'USB 3.0 = 3.1 Gen 1 = 3.2 Gen 1', hiz: '5 Gbit/s', mb: 450, fis: 'USB-A (içi çoğunlukla mavi), USB-C', not: 'Bir gönderme (TX) ve bir alma (RX) çifti eklenir; fişin yönüne göre 1. ya da 2. çiftler seçilir.', ss: 1 },
      { ad: '10 Gbps', eski: 'USB 3.1 Gen 2 = 3.2 Gen 2', hiz: '10 Gbit/s', mb: 1000, fis: 'USB-A, USB-C', not: 'Aynı iki çift, iki kat hızlı sinyal.', ss: 1 },
      { ad: '20 Gbps', eski: 'USB 3.2 Gen 2×2', hiz: '20 Gbit/s', mb: 2000, fis: 'Yalnız USB-C', not: 'Dört hızlı çiftin hepsi birlikte çalışır.', ss: 2 },
      { ad: 'USB4', eski: 'USB4 (40 Gbps) · USB4 v2 (80 Gbps)', hiz: '40–80 Gbit/s', mb: 3000, fis: 'Yalnız USB-C', not: 'Dört çift; içinden veri, görüntü ve PCIe tünellenebilir. Tam hız için 40 Gbit/s işaretli kablo gerekir.', ss: 2 },
      { ad: 'DP Alt Mode', eski: 'DisplayPort Alternatif Modu', hiz: '4 hat DP (DP 1.4: ≈ 25,9 Gbit/s)', fis: 'Yalnız USB-C', not: 'Hızlı çiftler DisplayPort hattına dönüşür, SBU pinleri AUX kanalı olur; USB 2.0 çalışmaya devam eder. Port ve kablo desteklemelidir.', ss: 3 },
      { ad: 'Güç (PD)', eski: 'USB Power Delivery', hiz: '5 V 3 A = 15 W → 48 V 5 A = 240 W', fis: 'USB-C', not: 'CC hattında cihaz ile şarj aleti pazarlık eder: 5, 9, 15, 20 V (EPR ile 28, 36, 48 V). 3 A üstü için e-marker çipli 5 A kablo gerekir.', pd: true }
    ];
    kok.innerHTML = '<div class="uc-ust"></div><div class="uc-orta"><div class="uc-sahne"></div><div class="uc-kart" aria-live="polite"></div></div>' +
      '<div class="uc-yaris" role="list" aria-label="50 GB kopyalama süreleri"></div>';
    var sahne = kok.querySelector('.uc-sahne'), kart = kok.querySelector('.uc-kart'), yaris = kok.querySelector('.uc-yaris');
    var PX = 44, PW = 20, PG = 23.2;
    var s = '<svg viewBox="0 0 360 170" class="uc-svg" role="img" aria-label="USB-C portunun ön görünüşü: ortadaki dilin üstünde A1–A12, altında B12–B1 pinleri; seçilen standartta çalışan pinler renkli ve adlıdır">' +
      '<rect x="14" y="30" width="332" height="100" rx="50" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>' +
      '<rect x="22" y="38" width="316" height="84" rx="42" fill="#0f172a"/>' +
      '<rect x="36" y="60" width="288" height="40" rx="6" fill="#334155"/>' +
      '<text x="24" y="20" class="uc-e" text-anchor="start">Port (soket) önden · A üstte</text>' +
      '<g class="uc-fis"><rect x="276" y="4" width="60" height="20" rx="10" fill="#fff" stroke="#64748b" stroke-width="1.5"/><rect class="uc-fis-ust" x="284" y="7" width="44" height="4" rx="2" fill="#f59e0b"/><text x="306" y="21" class="uc-e" text-anchor="middle">fiş</text></g>';
    for (var i = 0; i < 12; i++) {
      var x = PX + i * PG;
      s += '<g class="uc-pin" data-sira="A" data-i="' + i + '"><rect x="' + x + '" y="62" width="' + PW + '" height="16" rx="2"/><text x="' + (x + PW / 2) + '" y="73" text-anchor="middle"></text></g>';
      s += '<g class="uc-pin" data-sira="B" data-i="' + i + '"><rect x="' + x + '" y="82" width="' + PW + '" height="16" rx="2"/><text x="' + (x + PW / 2) + '" y="93" text-anchor="middle"></text></g>';
      s += '<text x="' + (x + PW / 2) + '" y="' + 54 + '" class="uc-no" text-anchor="middle">' + ANO[i] + '</text>';
      s += '<text x="' + (x + PW / 2) + '" y="' + 112 + '" class="uc-no" text-anchor="middle">' + BNO[i] + '</text>';
    }
    var LEJ = [['gnd', 'Toprak'], ['vbus', 'Güç (VBUS)'], ['cc', 'Yapılandırma (CC)'], ['d', 'USB 2.0 (D+/D−)'], ['ss', 'Hızlı çift (TX/RX)'], ['sbu', 'Yan bant (SBU)']];
    LEJ.forEach(function (l, j) {
      var lx = 22 + (j % 3) * 112, ly = 138 + Math.floor(j / 3) * 15;
      s += '<g class="uc-lej uc-g-' + l[0] + '"><rect x="' + lx + '" y="' + ly + '" width="9" height="9" rx="2"/><text x="' + (lx + 13) + '" y="' + (ly + 8) + '" class="uc-e" text-anchor="start">' + l[1] + '</text></g>';
    });
    s += '</svg>';
    sahne.innerHTML = s;
    var svgEl = sahne.querySelector('svg'), pinler = svgEl.querySelectorAll('.uc-pin'), fisEl = svgEl.querySelector('.uc-fis-ust');
    var st = { m: 0, ters: false };
    function aktif(ad, m) {
      var g = grup(ad), ters = st.ters;
      if (m.pd) return g === 'vbus' || g === 'gnd' || ad === (ters ? 'CC2' : 'CC1');
      if (g === 'gnd' || g === 'vbus' || g === 'd') return true;
      if (g === 'cc') return ad === (ters ? 'CC2' : 'CC1');
      if (g === 'sbu') return m.ss === 3;
      if (!m.ss) return false;
      if (m.ss >= 2) return true;
      return ters ? /[TR]X2/.test(ad) : /[TR]X1/.test(ad);
    }
    function ciz() {
      var m = MOD[st.m];
      pinler.forEach(function (p) {
        var ad = (p.dataset.sira === 'A' ? A : B)[+p.dataset.i], on = aktif(ad, m), g = grup(ad);
        var yazi = ad;
        if (on && m.ss === 3 && g === 'ss') yazi = 'DP';
        if (on && m.ss === 3 && g === 'sbu') yazi = 'AUX';
        p.setAttribute('class', 'uc-pin uc-g-' + g + (on ? ' on' : '') + (on && m.ss === 3 && (g === 'ss' || g === 'sbu') ? ' dp' : ''));
        p.querySelector('text').textContent = yazi;
      });
      kart.innerHTML = '<b></b><span class="uc-eski"></span><dl><dt>Hız</dt><dd class="uc-hiz"></dd><dt>Konnektör</dt><dd class="uc-fisler"></dd></dl><p></p>';
      kart.querySelector('b').textContent = m.ad;
      kart.querySelector('.uc-eski').textContent = m.eski;
      kart.querySelector('.uc-hiz').textContent = m.hiz + (m.mb ? ' · gerçekte ≈ ' + sayi(m.mb) + ' MB/s' : '');
      kart.querySelector('.uc-fisler').textContent = m.fis;
      kart.querySelector('p').textContent = m.not;
      yaris.querySelectorAll('.uc-y').forEach(function (y, j) { y.classList.toggle('secili', j === st.m); });
    }
    MOD.forEach(function (m) {
      if (!m.mb) return;
      var y = el('div', 'uc-y', yaris);
      y.setAttribute('role', 'listitem');
      y.innerHTML = '<span class="uc-y-ad"></span><span class="uc-y-bar"><i></i></span><code></code>';
      y.children[0].textContent = m.ad;
      y.querySelector('i').style.width = Math.max(1.2, m.mb / 3000 * 100).toFixed(1) + '%';
      y.querySelector('code').textContent = '50 GB ' + sure(50000 / m.mb);
    });
    var gr = secGrup(kok.querySelector('.uc-ust'), MOD.map(function (m) { return m.ad; }), function (i) { st.m = i; ciz(); }, { baslangic: 0, aria: 'USB standardı ya da modu' });
    var sonuc = el('div', 'panel-sonuc uc-sonuc', kok);
    sonuc.setAttribute('aria-live', 'polite');
    var donuyor = false;
    function cevir() {
      if (donuyor) return;
      donuyor = true;
      svgEl.classList.add('ceviriyor');
      bekle(0.6).then(function () {
        st.ters = !st.ters;
        fisEl.setAttribute('y', st.ters ? '17' : '7');
        svgEl.classList.remove('ceviriyor');
        ciz();
        var m = MOD[st.m];
        sonuc.textContent = st.ters
          ? 'Fiş ters: CC2 algılandı.' + (m.ss === 1 ? ' Hızlı veri artık TX2/RX2 çiftlerinden geçer.' : '') + ' USB 2.0 pinleri iki sırada da olduğu için etkilenmez.'
          : 'Fiş düz: CC1 algılandı.' + (m.ss === 1 ? ' Hızlı veri TX1/RX1 çiftlerinden geçer.' : '');
        donuyor = false;
      });
    }
    DERS.dugme(el('div', 'secici uc-kontrol', kok.querySelector('.uc-ust')), 'Fişi çevir ⟲', cevir);
    ciz();
    sonuc.textContent = 'Bir standart seç: renkli pinler çalışanlardır, gri pinler boşta.';
    kok._h07 = { sec: function (i) { gr.sec(i); st.m = i; ciz(); }, cevir: cevir };
  })();

  /* ─────────── Adım 6: A-KARSILASTIR 60/144 Hz + bant genişliği hesaplayıcı ─────────── */
  (function () {
    var kok = document.getElementById('yenileme');
    if (!kok) return;
    var COZ = [[1920, 1080, '1920 × 1080'], [2560, 1440, '2560 × 1440'], [3840, 2160, '3840 × 2160']], HZ = [60, 120, 144, 165, 240];
    kok.innerHTML = '<div class="yn-ikili"></div><div class="yn-hesap"><div class="yn-sec"></div><div class="yn-ozet" aria-live="polite"></div><div class="yn-baglar" role="list" aria-label="Bağlantıların veri hızı ve seçilen ayar için yeterliliği"></div></div>' +
      '<div class="panel-sonuc yn-sonuc" aria-live="polite"></div>';
    var ikili = kok.querySelector('.yn-ikili'), ozet = kok.querySelector('.yn-ozet'), baglar = kok.querySelector('.yn-baglar'), sonuc = kok.querySelector('.yn-sonuc');
    var PAN = [60, 144].map(function (hz) {
      var k = el('div', 'yn-kart', ikili);
      k.innerHTML = '<div class="yn-bas"><b>' + hz + ' Hz</b><span>kare ' + sayi(1000 / hz, 1) + ' ms</span></div><canvas role="img"></canvas>';
      var c = k.querySelector('canvas');
      c.setAttribute('aria-label', hz + ' Hz ağır çekim: top soldan sağa gider; saniyede ' + hz + ' kez güncellenen konumlar ve iz');
      return { hz: hz, c: c };
    });
    el('div', 'yn-not', ikili, 'Ağır çekim (1/10 hız): ekranın 60 Hz olsa da farkı görebilmen için.');
    var t = 0, son = 0, dongu = null, YAVAS = 0.1, GIDIS = 1.2;         // top 1,2 sn’de (gerçek zaman) karşıya gider
    function ciz() {
      PAN.forEach(function (p) {
        var c = p.c, dpr = Math.min(window.devicePixelRatio || 1, 2), w = c.clientWidth, h = c.clientHeight;
        if (!w || !h) return;
        if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
        var g = c.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.fillStyle = '#0f172a'; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(148,163,184,.25)'; g.lineWidth = 1;
        for (var x = 0; x < w; x += w / 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
        var r = Math.min(h * 0.3, 22), yol = w - 2 * r - 8;
        var kare = Math.floor(t * p.hz), n = Math.round(GIDIS * p.hz);
        for (var k = 5; k >= 0; k--) {                                 // son 6 karenin konumu (iz)
          var f = kare - k; if (f < 0) continue;
          var u = (f % n) / n, cx = 4 + r + u * yol;
          g.globalAlpha = k === 0 ? 1 : 0.28 - k * 0.04;
          g.fillStyle = p.hz === 60 ? '#f59e0b' : '#818cf8';
          g.beginPath(); g.arc(cx, h / 2, r, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = 1;
        g.fillStyle = '#cbd5e1'; g.font = '700 11px Inter, Arial, sans-serif'; g.textAlign = 'left';
        g.fillText('kare ' + (kare % n + 1) + ' / ' + n, 8, h - 8);
      });
    }
    function calis() {
      if (dongu) return;
      son = performance.now();
      (function kare(an) {
        if (!aktifMi('s10')) { dongu = null; return; }
        t += Math.min(0.1, (an - son) / 1000) * (AZ ? 0 : YAVAS); son = an;
        ciz();
        dongu = requestAnimationFrame(kare);
      })(son);
    }
    var st = { c: 1, h: 2 };
    var rows = BAGLANTI.map(function (b) {
      var e = el('div', 'yn-bag yn-' + b.tur, baglar);
      e.setAttribute('role', 'listitem');
      e.innerHTML = '<span class="yn-ad"></span><span class="yn-bar"><i></i><b class="yn-imlec"></b></span><code></code><span class="yn-i"></span>';
      e.querySelector('.yn-ad').textContent = b.ad;
      e.querySelector('i').style.width = (b.g / 80 * 100).toFixed(1) + '%';
      e.querySelector('code').textContent = sayi(b.g, 1);
      return e;
    });
    function hesapla() {
      var c = COZ[st.c], hz = HZ[st.h], g = gereken(c[0], c[1], hz);
      ozet.innerHTML = '<span>Gereken ≈ <b></b> Gbit/s</span><span>Saniyede <b></b> milyon piksel</span><span>Kare süresi <b></b> ms</span>';
      var bs = ozet.querySelectorAll('b');
      bs[0].textContent = sayi(g, 1); bs[1].textContent = sayi(c[0] * c[1] * hz / 1e6); bs[2].textContent = sayi(1000 / hz, 1);
      rows.forEach(function (e, i) {
        var ok = BAGLANTI[i].g >= g;
        e.classList.toggle('ok', ok); e.classList.toggle('yok', !ok);
        e.querySelector('.yn-imlec').style.left = Math.min(100, g / 80 * 100).toFixed(1) + '%';
        e.querySelector('.yn-i').textContent = ok ? '✓ yeter' : '✗ yetmez';
      });
      return g;
    }
    var sec = el('div', 'yn-sec-ic', kok.querySelector('.yn-sec'));
    secGrup(sec, COZ.map(function (c) { return c[2]; }), function (i) { st.c = i; hesapla(); sonuc.textContent = ''; }, { baslangic: st.c, aria: 'Çözünürlük' });
    secGrup(sec, HZ.map(function (h) { return h + ' Hz'; }), function (i) { st.h = i; hesapla(); sonuc.textContent = ''; }, { baslangic: st.h, aria: 'Yenileme hızı' });
    hesapla();
    ciz();
    var notVerildi = false;
    DERS.slaytAcilinca('s10', function () {
      calis();
      if (notVerildi) return;
      notVerildi = true;
      bekle(1.2).then(function () {
        if (st.c !== 1 || st.h !== 2) return;
        sonuc.textContent = DERS.tahminNotu(1, '2560 × 1440, 144 Hz ≈ 13,4 Gbit/s ister; eski HDMI 1.4 ≈ 8,2 Gbit/s taşır. Ekran kartı suçsuz: kablo/port sürümü darboğaz.',
          'Doğrusu: kablo ve port sürümü. 2560 × 1440, 144 Hz ≈ 13,4 Gbit/s ister; HDMI 1.4 yalnız ≈ 8,2 Gbit/s taşır.');
      });
    }, true);
    kok._h07 = { st: st, hesapla: hesapla };
  })();

  /* ─────────── Etkinlik 1: E-SINIFLA — senaryo → bağlantı ─────────── */
  function ikon(ic) { return '<svg viewBox="0 0 48 36" aria-hidden="true">' + ic + '</svg>'; }
  var IKON = {
    proj: ikon('<rect x="6" y="14" width="30" height="14" rx="3" fill="#475569"/><circle cx="14" cy="21" r="5" fill="#0f172a" stroke="#94a3b8"/><path d="M19 17L44 6V32L19 25z" fill="#fde68a" opacity=".7"/>'),
    tv: ikon('<rect x="4" y="4" width="40" height="24" rx="2" fill="#1f2937"/><rect x="7" y="7" width="34" height="18" fill="#0e7490"/><path d="M16 32h16M24 28v4" stroke="#334155" stroke-width="2.5"/><path d="M36 30h6" stroke="#f59e0b" stroke-width="2"/>'),
    mon: ikon('<rect x="6" y="4" width="36" height="22" rx="2" fill="#1f2937"/><rect x="9" y="7" width="30" height="16" fill="#4338ca"/><text x="24" y="19" font-family="Inter,Arial" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">165</text><path d="M18 32h12M24 26v6" stroke="#334155" stroke-width="2.5"/>'),
    zincir: ikon('<rect x="2" y="6" width="20" height="14" rx="1.5" fill="#1f2937"/><rect x="26" y="6" width="20" height="14" rx="1.5" fill="#1f2937"/><rect x="4" y="8" width="16" height="10" fill="#6366f1"/><rect x="28" y="8" width="16" height="10" fill="#6366f1"/><path d="M12 20v8h24v-8" fill="none" stroke="#f59e0b" stroke-width="2"/>'),
    lap: ikon('<rect x="9" y="5" width="30" height="19" rx="2" fill="#1f2937"/><rect x="11" y="7" width="26" height="15" fill="#0891b2"/><path d="M4 26h40l-3 4H7z" fill="#94a3b8"/><rect x="40" y="18" width="6" height="3" rx="1.5" fill="#7c3aed"/>'),
    tablet: ikon('<rect x="4" y="6" width="22" height="26" rx="3" fill="#1f2937"/><rect x="6" y="8" width="18" height="21" fill="#0891b2"/><path d="M26 19h6" stroke="#7c3aed" stroke-width="2.5"/><rect x="32" y="10" width="14" height="18" rx="1.5" fill="#1f2937"/><rect x="34" y="12" width="10" height="14" fill="#0891b2"/>'),
    ssd: ikon('<rect x="8" y="8" width="32" height="20" rx="4" fill="#334155"/><text x="24" y="21" font-family="Inter,Arial" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">SSD</text><rect x="40" y="15" width="6" height="6" rx="2" fill="#15803d"/>'),
    klavye: ikon('<rect x="2" y="14" width="32" height="16" rx="2" fill="#475569"/>' + [0, 1, 2].map(function (r) { return [0, 1, 2, 3, 4, 5].map(function (c) { return '<rect x="' + (4 + c * 5) + '" y="' + (16 + r * 4.5) + '" width="4" height="3.3" rx=".6" fill="#e2e8f0"/>'; }).join(''); }).join('') + '<rect x="36" y="8" width="6" height="18" rx="3" fill="#1f2937"/><circle cx="39" cy="11" r="2.4" fill="#94a3b8"/>')
  };
  D.tembel('#kablo-sinifla', function (kap) {
    D.sinifla(kap, {
      onIlerleme: DERS.ilerlemeBagla('ilerleme-1'),
      kutular: [
        { id: 'hdmi', ad: 'HDMI', aciklama: 'TV, projeksiyon', renk: '#0e7490', resim: FIS_SVG.hdmi },
        { id: 'dp', ad: 'DisplayPort', aciklama: 'Monitör, yüksek Hz', renk: '#4f46e5', resim: FIS_SVG.dp },
        { id: 'usbc', ad: 'USB-C + güç', aciklama: 'Alt Mode + PD', renk: '#7c3aed', resim: FIS_SVG.usbc },
        { id: 'usb', ad: 'USB veri', aciklama: 'Depolama, çevre birimi', renk: '#15803d', resim: FIS_SVG.usba }
      ],
      ogeler: [
        { id: 'proj', ad: 'Projeksiyonun yalnız HDMI girişi var', svg: IKON.proj, kutu: 'hdmi', ipucu: 'Projeksiyon ve televizyonların ortak girişi HDMI’dir.' },
        { id: 'tv', ad: 'TV’ye görüntü; ses eARC ile ses sistemine', svg: IKON.tv, kutu: 'hdmi', ipucu: 'ARC/eARC ve CEC HDMI’ye özgü özelliklerdir.' },
        { id: 'mon', ad: '2560 × 1440, 165 Hz monitör (HDMI 2.0, DP 1.4)', svg: IKON.mon, kutu: 'dp', ipucu: 'HDMI 2.0 bu çözünürlükte ≈ 144 Hz’de kalır; DP 1.4 ≈ 25,9 Gbit/s ile 165 Hz’i taşır.' },
        { id: 'zincir', ad: 'İki monitörü zincirleme bağlamak', svg: IKON.zincir, kutu: 'dp', ipucu: 'Monitörleri zincirleme (MST) DisplayPort’un özelliğidir.' },
        { id: 'lap', ad: 'USB-C’li dizüstü: tek kabloyla monitör + şarj', svg: IKON.lap, kutu: 'usbc', ipucu: 'Görüntü DP Alt Mode, şarj USB PD ile aynı USB-C kablodan geçer.' },
        { id: 'tablet', ad: 'Tabletten taşınabilir USB-C ekrana görüntü', svg: IKON.tablet, kutu: 'usbc', ipucu: 'Destekleyen cihazlarda USB-C, DP Alt Mode ile görüntü taşır.' },
        { id: 'ssd', ad: 'Harici SSD’ye 50 GB yedek (10 Gbit/s)', svg: IKON.ssd, kutu: 'usb', ipucu: 'Depolama bir veri işidir: 10 Gbit/s USB port ve kablo gerekir.' },
        { id: 'klavye', ad: 'USB klavye ve fare', svg: IKON.klavye, kutu: 'usb', ipucu: 'Klavye ve fare çok az veri ister; USB 2.0 bile yeter.' }
      ],
      bitisMetni: 'Tamam! Görüntü için HDMI/DP, tek kabloda görüntü + güç için USB-C, veri için USB hızını seçtin.'
    });
  });

  /* ─────────── Etkinlik 2: Bağlantı planı (port + kablo → sonuç) ─────────── */
  (function () {
    var kok = document.getElementById('baglanti-plan');
    if (!kok) return;
    var UYMAZ = { ekran: 'Fiş uymuyor', m: 'Kablonun bu ucu seçtiğin porta girmez. Port ile kablo ucunun türü aynı olmalı.' };
    var GOREV = [
      { kisa: 'Monitör', kaynak: 'Bilgisayar (harici ekran kartı takılı)', hedef: 'Oyun monitörü', giris: 'Girişler: HDMI 2.0, DP 1.4', ayar: '2560 × 1440 · 165 Hz', simge: 'mon',
        portlar: [['mb', 'Anakart HDMI', 'hdmi'], ['ghdmi', 'Ekran kartı HDMI 2.1', 'hdmi'], ['gdp', 'Ekran kartı DP 1.4', 'dp']],
        kablolar: [['h18', 'HDMI kablo (18 Gbit/s)', 'hdmi'], ['dp', 'DisplayPort kablo (DP 1.4)', 'dp']],
        sonuc: function (p, k) {
          if (p === 'mb') return { ekran: 'Sinyal yok', m: 'Anakart çıkışı tümleşik grafiğe bağlı; harici kart takılıyken görüntü ekran kartından alınır.' };
          if (p === 'ghdmi') return { ekran: '2560 × 1440 · 144 Hz', m: 'Monitörün HDMI 2.0 girişi ≈ 14,4 Gbit/s taşır; 165 Hz için ≈ ' + sayi(gereken(2560, 1440, 165), 1) + ' Gbit/s gerekir. Bağlantı en yavaş halkaya iner.' };
          return { ekran: '2560 × 1440 · 165 Hz', ok: true, m: 'DP 1.4 ≈ 25,9 Gbit/s taşır; gereken ≈ ' + sayi(gereken(2560, 1440, 165), 1) + ' Gbit/s.' };
        } },
      { kisa: 'TV', kaynak: 'Bilgisayar (harici ekran kartı takılı)', hedef: 'Televizyon', giris: 'Giriş: HDMI 2.1 (DisplayPort yok)', ayar: '3840 × 2160 · 120 Hz', simge: 'tv',
        portlar: [['ghdmi', 'Ekran kartı HDMI 2.1', 'hdmi'], ['gdp', 'Ekran kartı DP 1.4', 'dp']],
        kablolar: [['h18', 'HDMI kablo (18 Gbit/s, eski)', 'hdmi'], ['h48', 'HDMI kablo (48 Gbit/s)', 'hdmi'], ['dp', 'DisplayPort kablo', 'dp']],
        sonuc: function (p, k) {
          if (k === 'dp') return { ekran: 'Giriş yok', m: 'Televizyonda DisplayPort girişi yok; TV’ye HDMI ile bağlanılır.' };
          if (k === 'h18') return { ekran: '3840 × 2160 · 60 Hz', m: 'Eski kablo ≈ 18 Gbit/s (≈ 14,4 veri) taşır; 4K 120 Hz için ≈ ' + sayi(gereken(3840, 2160, 120), 1) + ' Gbit/s gerekir. 48 Gbit/s (Ultra High Speed) kablo şart.' };
          return { ekran: '3840 × 2160 · 120 Hz', ok: true, m: 'Port, kablo ve TV girişi HDMI 2.1: ≈ 42,7 Gbit/s taşır.' };
        } },
      { kisa: 'Dizüstü', kaynak: 'Dizüstü bilgisayar', hedef: 'USB-C girişli monitör', giris: 'Giriş: USB-C (DP Alt Mode, 65 W şarj verir)', ayar: 'Tek kablo: görüntü + şarj', simge: 'lap',
        portlar: [['lc', 'USB-C (USB4 · DP Alt Mode · PD)', 'usbc'], ['la', 'USB-A 5 Gbps', 'usba']],
        kablolar: [['c2', 'USB-C ↔ USB-C şarj kablosu (USB 2.0, 60 W)', 'usbc'], ['c40', 'USB-C ↔ USB-C tam özellikli (40 Gbit/s, 100 W)', 'usbc'], ['ac', 'USB-A → USB-C kablo', 'usba']],
        sonuc: function (p, k) {
          if (p === 'la') return { ekran: 'Görüntü yok', m: 'USB-A görüntü (Alt Mode) ve PD şarj taşımaz; yalnız veri ve düşük güç verir.' };
          if (k === 'c2') return { ekran: 'Şarj ✓ · Görüntü yok', m: 'Bu kabloda yalnız USB 2.0 telleri var; DP Alt Mode için hızlı hat çiftleri gerekir. Şarj 3 A kabloyla en çok 60 W.' };
          return { ekran: 'Görüntü ✓ · 65 W şarj ✓', ok: true, m: 'Tam özellikli kablo dört hızlı çifti ve 5 A akımı taşır: görüntü + şarj tek kablodan.' };
        } },
      { kisa: 'SSD', kaynak: 'Bilgisayar', hedef: 'Harici SSD', giris: 'Giriş: USB-C, 10 Gbit/s', ayar: '50 GB en kısa sürede', simge: 'ssd',
        portlar: [['on2', 'Ön panel USB-A (USB 2.0)', 'usba'], ['a5', 'Arka USB-A 5 Gbps (mavi)', 'usba'], ['c10', 'Arka USB-C 10 Gbps', 'usbc']],
        kablolar: [['ac5', 'USB-A → USB-C (5 Gbit/s)', 'usba'], ['cc10', 'USB-C ↔ USB-C (10 Gbit/s)', 'usbc']],
        sonuc: function (p, k) {
          if (p === 'on2') return { ekran: '50 GB ' + sure(50000 / 40), m: 'Port USB 2.0: ≈ 40 MB/s. Zincirin en yavaş halkası ön panel portu.' };
          if (p === 'a5') return { ekran: '50 GB ' + sure(50000 / 450), m: '5 Gbit/s ≈ 450 MB/s. SSD 10 Gbit/s destekliyor; port ve kablo onu yavaşlatıyor.' };
          return { ekran: '50 GB ' + sure(50000 / 1000), ok: true, m: 'Port, kablo ve SSD 10 Gbit/s: ≈ 1000 MB/s.' };
        } }
    ];
    kok.innerHTML = '<div class="bp"><div class="bp-sekme secici" role="group" aria-label="Görevler"></div>' +
      '<div class="bp-govde"><div class="bp-sutun"><div class="bp-bas">1 · Port <small class="bp-kaynak"></small></div><div class="bp-portlar"></div></div>' +
      '<div class="bp-sutun"><div class="bp-bas">2 · Kablo</div><div class="bp-kablolar"></div></div>' +
      '<div class="bp-sutun bp-hedef"><div class="bp-bas">3 · <span class="bp-hedef-ad"></span></div><div class="bp-cihaz"><div class="bp-simge"></div><div class="bp-ekran"><b>—</b><small></small></div></div><div class="bp-giris"></div></div></div>' +
      '<div class="bp-alt"><div class="bp-bagla"></div><div class="bp-geri" aria-live="polite"></div></div></div>';
    var sekme = kok.querySelector('.bp-sekme'), pEl = kok.querySelector('.bp-portlar'), kEl = kok.querySelector('.bp-kablolar');
    var ekranB = kok.querySelector('.bp-ekran b'), ekranS = kok.querySelector('.bp-ekran small'), ekranK = kok.querySelector('.bp-ekran'), geri = kok.querySelector('.bp-geri');
    var liste = document.querySelectorAll('#gorevler-2 li'), ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var tamam = [false, false, false, false], gi = 0, secim = { p: null, k: null };
    var sekmeler = GOREV.map(function (g, i) {
      var b = DERS.dugme(sekme, g.kisa, function () { goster(i); });
      b.setAttribute('aria-pressed', 'false');
      return b;
    });
    function secenekler(kap, dizi, anahtar) {
      kap.innerHTML = '';
      dizi.forEach(function (x) {
        var b = el('button', 'bp-sec', kap);
        b.type = 'button';
        b.innerHTML = '<span class="bp-fis">' + FIS_SVG[x[2]] + '</span><span></span>';
        b.lastChild.textContent = x[1];
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          secim[anahtar] = x;
          kap.querySelectorAll('.bp-sec').forEach(function (y) { y.setAttribute('aria-pressed', y === b ? 'true' : 'false'); });
          baglaB.disabled = !(secim.p && secim.k);
        });
      });
    }
    function goster(i) {
      gi = i; secim = { p: null, k: null };
      var g = GOREV[i];
      sekmeler.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      liste.forEach(function (li, j) { li.classList.toggle('simdi', i === j && !tamam[j]); });
      kok.querySelector('.bp-kaynak').textContent = g.kaynak;
      kok.querySelector('.bp-hedef-ad').textContent = g.hedef;
      kok.querySelector('.bp-giris').textContent = g.giris + ' · Hedef: ' + g.ayar;
      kok.querySelector('.bp-simge').innerHTML = IKON[g.simge];
      secenekler(pEl, g.portlar, 'p'); secenekler(kEl, g.kablolar, 'k');
      ekranB.textContent = tamam[i] ? '✓ ' + g.ayar : '—'; ekranS.textContent = tamam[i] ? 'Görev tamam' : 'Bağlantı bekleniyor';
      ekranK.className = 'bp-ekran' + (tamam[i] ? ' iyi' : '');
      geri.className = 'bp-geri'; geri.textContent = 'Port ve kablo seç, sonra Bağla’ya bas.';
      baglaB.disabled = true;
    }
    function bagla() {
      var g = GOREV[gi], p = secim.p, k = secim.k;
      if (!p || !k) return;
      var r = p[2] !== k[2] ? UYMAZ : g.sonuc(p[0], k[0]);
      ekranK.className = 'bp-ekran bagliyor';
      ekranB.textContent = '…'; ekranS.textContent = 'Bağlanıyor';
      baglaB.disabled = true;
      bekle(0.6).then(function () {
        baglaB.disabled = false;
        ekranB.textContent = r.ekran; ekranS.textContent = r.ok ? 'Hedefe ulaşıldı' : 'Hedef: ' + g.ayar;
        ekranK.className = 'bp-ekran ' + (r.ok ? 'iyi' : 'kotu');
        geri.className = 'bp-geri ' + (r.ok ? 'iyi' : 'kotu');
        geri.textContent = (r.ok ? '✓ ' : '✗ ') + r.m;
        if (r.ok) {
          D.ses('klik');
          if (!tamam[gi]) {
            tamam[gi] = true;
            liste[gi].classList.add('tamam'); liste[gi].classList.remove('simdi');
            sekmeler[gi].classList.add('bp-tamam');
            var n = tamam.filter(Boolean).length;
            ilerle(n, 4);
            if (n === 4) { DERS.konfeti(); geri.textContent += ' Dört bağlantı tamam!'; }
          }
        } else D.ses('hata');
      });
    }
    var baglaB = DERS.dugme(kok.querySelector('.bp-bagla'), 'Bağla', bagla, 'bp-bagla-d');
    goster(0);
    kok._h07 = { GOREV: GOREV, goster: goster, sec: function (pi, ki) { pEl.children[pi].click(); kEl.children[ki].click(); }, bagla: bagla };
  })();
})();
