/* DON-201 H06 — İşlemci · ders betiği (ortak betikten sonra çalışır)
   Derse özel kalıplar (motorda henüz yok): A-KUYRUK (2D), A-YARIS (2D), E-SURGU (2D), A-ISI + termometre (3D üstü HTML),
   E-TAK-CIKAR (soğutucu kaldır/tak), sıcak hava parçacıkları, mikroskop görünümü. */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  var SVGNS = 'http://www.w3.org/2000/svg';
  DERS.tahminKur('Tahminini aldık. Adım 5’te soğutucuyu kaldırınca göreceğiz.');

  /* ─────────── 2D yardımcılar ─────────── */
  /** requestAnimationFrame ile basit tween: fn(e 0–1). Promise döner. AZ: anında biter. */
  function anim(sure, fn, ease) {
    return new Promise(function (coz) {
      if (AZ || !sure) { fn(1); coz(); return; }
      var t0 = performance.now();
      (function kare(t) {
        var x = Math.min(1, (t - t0) / (sure * 1000));
        fn(ease === 'lineer' ? x : D.ease.easeInOutCubic(x));
        if (x < 1) requestAnimationFrame(kare); else coz();
      })(t0);
    });
  }
  function bekle(sn) { return new Promise(function (c) { setTimeout(c, AZ ? 0 : sn * 1000); }); }
  function svgEl(ad, ozellik, ebeveyn) {
    var e = document.createElementNS(SVGNS, ad);
    Object.keys(ozellik || {}).forEach(function (k) { e.setAttribute(k, ozellik[k]); });
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function yaz(e, t) { e.textContent = t; return e; }
  function virgul(x, b) { return x.toFixed(b == null ? 1 : b).replace('.', ','); }
  function aktif(id) { var s = document.getElementById(id); return !!(s && s.classList.contains('active')); }
  /** Sıcaklık → renk (mavi → turuncu → kırmızı) */
  function isiRenk(d) {
    return new THREE.Color().setHSL((1 - Math.max(0, Math.min(1, d))) * 0.6, 0.85, 0.5).getStyle();
  }
  /** Sıcaklık (°C) → 0–1 ısı değeri (45 °C altı mavi, 90 °C üstü kırmızı) */
  function isiDeger(T) { return (T - 45) / 45; }
  /** Rengi beyazla karıştırır (oran: beyaz payı) */
  function acik(rgb, oran) {
    var v = rgb.match(/\d+/g).map(Number);
    return 'rgb(' + v.map(function (x) { return Math.round(x + (255 - x) * oran); }).join(',') + ')';
  }
  function durumYazi(T) { return T >= 90 ? 'Çok sıcak' : (T >= 72 ? 'Sıcak' : 'Normal'); }

  /* ─────────── Kapak: işlemci + soğutucu + kasa fanı ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 40,
      kamera: { yon: [0.9, 0.5, 1.2], pay: 0.84 } });
    var cpu = s.ekle('M-CPU');
    var sog = s.ekle('M-SOGUTUCU', { konum: [0, cpu.userData.olcu.kapakY, 0] });
    var fan = s.ekle('M-FAN', { konum: [11, 6.2, -9], donus: [0, -0.45, 0] });
    s.ekle('M-CPU', { konum: [8.5, 0, 7], donus: [0, -0.4, 0], olcek: 1.4 });
    s.yerlestir();
    sog.userData.fan.userData.hiz = 7; sog.userData.fan.userData.baslat(s);
    fan.userData.hiz = 5; fan.userData.baslat(s);
  });

  /* ─────────── Adım 1: işlemcinin görevi — parçalar, üst/alt yüz (E-DONDUR + E-BILGI) ─────────── */
  D.tembel('#s4-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.45, 0.95, 1], pay: 1.12, hedefOfset: [0.35, 0, 0.1] } });
    var pivot = new THREE.Group();
    var cpu = D.model('M-CPU');
    var yc = cpu.userData.olcu.H / 2;
    cpu.position.y = -yc;
    pivot.add(cpu);
    pivot.position.y = yc;
    s.ekle(pivot);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.25, maxPolar: 1.35, minYakin: 0.45, maxYakin: 1.5 } });
    D.bilgi(s, ['kapak', 'ucgen', 'temas-yuzeyi', 'alt-kart']);
    var mesaj = function () {}, altta = false, mesgul = false, etk = [];
    function etiketTemizle() { etk.forEach(function (e) { e.kaldir(); }); etk = []; }
    function cevir(alt) {
      if (mesgul || alt === altta) return Promise.resolve();
      mesgul = true; etiketTemizle();
      var r0 = pivot.rotation.x, r1 = alt ? Math.PI : 0;
      return D.tween({ sahne: s, sure: 1.1, guncelle: function (e) {
        pivot.rotation.x = r0 + (r1 - r0) * e;
        pivot.position.y = yc + Math.sin(e * Math.PI) * 2.2;
      } }).then(function () {
        altta = alt; mesgul = false;
        ust.classList.toggle('don3d-dugme--secili', !alt); altB.classList.toggle('don3d-dugme--secili', alt);
        if (alt) {
          etk.push(s.etiket(s.parca('temas-yuzeyi'), 'Temas pedleri', { tur: 'vurgu' }));
          mesaj('Alt yüz: yüzlerce altın ped, yuvadaki metal uçlara değer.', '');
        } else {
          etk.push(s.etiket(s.parca('kapak'), 'Metal kapak', { tur: 'vurgu' }));
          etk.push(s.etiket(s.parca('ucgen'), 'Köşe üçgeni', { tur: 'vurgu', yer: 'alt' }));
          mesaj('Üst yüz: metal kapak ve köşe üçgeni.', '');
        }
      });
    }
    var ust = s.dugme('Üst yüz', null, function () { cevir(false); }, { yer: 'alt-sag', aciklama: 'İşlemcinin üst yüzünü göster' });
    var altB = s.dugme('Alt yüz', null, function () { cevir(true); }, { yer: 'alt-sag', aciklama: 'İşlemciyi çevir, alt yüzünü göster' });
    ust.classList.add('don3d-dugme--secili');
    etk.push(s.etiket(s.parca('kapak'), 'Metal kapak', { tur: 'vurgu' }));
    etk.push(s.etiket(s.parca('ucgen'), 'Köşe üçgeni', { tur: 'vurgu', yer: 'alt' }));
    mesaj('Bir parçaya dokun ya da işlemciyi çevir.', '');
  });

  /* ─────────── Adım 2: A-KUYRUK — komut kartları konveyörde, sırayla işlenir (2D) ─────────── */
  (function () {
    var kok = document.getElementById('kuyruk');
    if (!kok) return;
    kok.innerHTML = '<div class="ky-sahne illu-orta"></div><div class="ky-alt"><div class="secici" role="group" aria-label="Kuyruk denetimleri"></div>' +
      '<div class="panel-sonuc" aria-live="polite"></div></div>';
    var sahne = kok.querySelector('.ky-sahne'), sonuc = kok.querySelector('.panel-sonuc'), secici = kok.querySelector('.secici');
    var svg = svgEl('svg', { viewBox: '0 0 360 230', role: 'img', 'aria-label': 'Komut kartları bantla işlemciye giriyor; işlemci her kartı sırayla işliyor, sonuç ekranda görünüyor', 'class': 'ky' }, sahne);
    svg.innerHTML =
      '<defs><linearGradient id="kyBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8fbff"/><stop offset="1" stop-color="#e0f2fe"/></linearGradient></defs>' +
      '<rect width="360" height="230" rx="16" fill="url(#kyBg)"/>' +
      // monitör
      '<rect x="18" y="12" width="118" height="74" rx="7" fill="#1f2937"/><rect x="24" y="18" width="106" height="58" rx="4" fill="#0f172a"/>' +
      '<rect x="68" y="86" width="18" height="10" fill="#374151"/><rect x="54" y="95" width="46" height="5" rx="2.5" fill="#374151"/>' +
      '<text class="ky-ekran" x="77" y="58" font-family="Inter,Arial,sans-serif" font-size="26" font-weight="900" fill="#34d399" text-anchor="middle">_</text>' +
      '<text x="77" y="30" font-family="Inter,Arial,sans-serif" font-size="8.5" font-weight="700" fill="#94a3b8" text-anchor="middle">EKRAN</text>' +
      '<path d="M136 50 C 200 50, 230 40, 292 92" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="5 4"/>' +
      // bant
      '<rect x="2" y="160" width="252" height="18" rx="9" fill="#334155"/>' +
      '<line class="ky-bant" x1="10" y1="162.5" x2="246" y2="162.5" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="8 8"/>' +
      '<circle cx="11" cy="169" r="6" fill="#64748b"/><circle cx="245" cy="169" r="6" fill="#64748b"/>' +
      '<rect x="20" y="178" width="6" height="30" fill="#64748b"/><rect x="226" y="178" width="6" height="30" fill="#64748b"/>' +
      // işlemci
      '<g class="ky-cpu"><rect x="250" y="92" width="104" height="104" rx="6" fill="#155a34"/>' +
      '<rect x="258" y="100" width="88" height="88" rx="7" fill="#c7cbd1" stroke="#9aa0a8"/>' +
      '<text x="302" y="113" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="900" fill="#475569" text-anchor="middle">İŞLEMCİ</text>' +
      '<rect class="ky-yuva" x="273" y="118" width="58" height="42" rx="7" fill="#e2e8f0" stroke="#94a3b8" stroke-dasharray="3 3"/>' +
      '<text class="ky-sonuc" x="302" y="178" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">Sonuç: –</text></g>';
    var ekran = svg.querySelector('.ky-ekran'), sonucYazi = svg.querySelector('.ky-sonuc'), yuva = svg.querySelector('.ky-yuva');
    var KOMUT = [
      { ust: 'Sayıyı al', alt: '7', f: function () { return 7; }, uzun: '7 sayısını al' },
      { ust: 'Ekle', alt: '+ 3', f: function (v) { return v + 3; }, uzun: '3 ekle' },
      { ust: 'Çarp', alt: '× 2', f: function (v) { return v * 2; }, uzun: '2 ile çarp' },
      { ust: 'Ekrana', alt: 'yaz', f: function (v) { return v; }, uzun: 'Sonucu ekrana yaz', ekran: true }
    ];
    var SLOT = [186, 126, 66, 6], KY = 116, IY = [274, 118];
    var sira, kartlar, i, deger, mesgul = false, degisik = false, bitti = false;
    function kartYap(k, no) {
      var g = svgEl('g', { 'class': 'ky-kart' }, svg);
      g.innerHTML = '<rect width="56" height="42" rx="7" fill="#fff" stroke="#0ea5e9" stroke-width="2"/>' +
        '<circle cx="2" cy="2" r="8" fill="#0ea5e9" stroke="#fff" stroke-width="1.5"/><text x="2" y="5.5" font-family="Inter,Arial,sans-serif" font-size="9.5" font-weight="900" fill="#fff" text-anchor="middle">' + no + '</text>' +
        '<text x="30" y="18" font-family="Inter,Arial,sans-serif" font-size="8.5" font-weight="800" fill="#475569" text-anchor="middle">' + k.ust + '</text>' +
        '<text x="28" y="34" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">' + k.alt + '</text>';
      return g;
    }
    function yer(g, x, y, olcek, op) {
      g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' + (olcek ? ' scale(' + olcek + ')' : ''));
      if (op != null) g.setAttribute('opacity', op);
    }
    function kur() {
      (kartlar || []).forEach(function (g) { g.remove(); });
      sira = degisik ? [KOMUT[0], KOMUT[2], KOMUT[1], KOMUT[3]] : KOMUT.slice();
      kartlar = sira.map(function (k, n) { var g = kartYap(k, n + 1); yer(g, SLOT[n], KY); return g; });
      i = 0; deger = null; bitti = false;
      yaz(ekran, '_'); yaz(sonucYazi, 'Sonuç: –');
      sonuc.textContent = degisik ? 'Sıra değişti: önce çarp, sonra ekle.' : '4 komut sırada bekliyor.';
      sonuc.className = 'panel-sonuc';
    }
    function adim() {
      if (mesgul || bitti) return Promise.resolve();
      mesgul = true;
      var g = kartlar[i], k = sira[i], n = i;
      svg.classList.add('calisiyor');
      var x0 = SLOT[0];
      var kaydir = anim(0.8, function (e) {
        yer(g, x0 + (IY[0] - x0) * e, KY + (IY[1] - KY) * e);
        for (var j = n + 1; j < kartlar.length; j++) yer(kartlar[j], SLOT[j - n] + (SLOT[j - n - 1] - SLOT[j - n]) * e, KY);
      });
      return kaydir.then(function () {
        svg.classList.remove('calisiyor');
        yuva.classList.add('isliyor');
        sonuc.textContent = (n + 1) + '. komut işleniyor: ' + k.uzun + '…';
        return bekle(0.55);
      }).then(function () {
        deger = k.f(deger);
        yaz(sonucYazi, 'Sonuç: ' + deger);
        if (k.ekran) yaz(ekran, String(deger));
        yuva.classList.remove('isliyor');
        sonuc.textContent = (n + 1) + '. komut: ' + k.uzun + ' → ' + (k.ekran ? 'ekranda ' : 'sonuç ') + deger;
        return anim(0.4, function (e) { yer(g, IY[0], IY[1] - 30 * e, null, 1 - e); });
      }).then(function () {
        g.setAttribute('visibility', 'hidden');
        i++; mesgul = false;
        if (i >= sira.length) {
          bitti = true;
          sonuc.textContent = degisik ? 'Sıra değişince sonuç da değişti: 17. İşlemci sıraya uyar.' : 'Bitti: ekranda 20. Şimdi sırayı değiştirip dene.';
          sonuc.className = 'panel-sonuc iyi';
        }
      });
    }
    function oynat() {
      if (mesgul) return;
      if (bitti) kur();
      (function dongu() { if (!bitti) adim().then(function () { return bekle(0.35); }).then(function () { if (!bitti) dongu(); }); })();
    }
    DERS.dugme(secici, 'Oynat', oynat);
    DERS.dugme(secici, 'Adım adım', function () { if (bitti && !mesgul) kur(); adim(); });
    var dg = DERS.dugme(secici, 'Sırayı değiştir', function () {
      if (mesgul) return;
      degisik = !degisik; dg.setAttribute('aria-pressed', degisik ? 'true' : 'false'); kur();
    });
    dg.setAttribute('aria-pressed', 'false');
    DERS.dugme(secici, 'Baştan', function () { if (!mesgul) kur(); });
    kur();
    DERS.slaytAcilinca('s5', function () { bekle(0.6).then(oynat); });
  })();

  /* ─────────── A-YARIS: 1 çekirdek ile 4 çekirdek aynı iş yığınını işler (2D, yeniden kullanılır) ─────────── */
  function yarisSahnesi(kap) {
    var svg = svgEl('svg', { viewBox: '0 0 360 232', role: 'img', 'class': 'yr', 'aria-label': 'Yarış: üstte 1 çekirdekli işlemci, altta 4 çekirdekli işlemci aynı işleri yapıyor; süre sayaçları' }, kap);
    svg.innerHTML = '<defs><linearGradient id="yrBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbeb"/><stop offset="1" stop-color="#fef3c7"/></linearGradient></defs>' +
      '<rect width="360" height="232" rx="16" fill="url(#yrBg)"/><line x1="12" y1="116" x2="348" y2="116" stroke="#fcd34d" stroke-width="2" stroke-dasharray="6 5"/>';
    var SERIT = [{ y: 4, cekirdek: 1, ad: '1 çekirdek' }, { y: 120, cekirdek: 4, ad: '4 çekirdek' }];
    var serit = SERIT.map(function (sr) {
      var g = svgEl('g', { transform: 'translate(0 ' + sr.y + ')' }, svg);
      g.innerHTML = '<text x="14" y="20" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="900" fill="#92400e">' + sr.ad + '</text>' +
        '<rect x="8" y="28" width="98" height="76" rx="10" fill="#fff" stroke="#fde68a" stroke-width="1.5"/>' +
        '<text x="57" y="100" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="800" fill="#b45309" text-anchor="middle">BEKLEYEN İŞLER</text>' +
        '<rect x="232" y="28" width="98" height="76" rx="10" fill="#fff" stroke="#bbf7d0" stroke-width="1.5"/>' +
        '<text x="281" y="100" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="800" fill="#047857" text-anchor="middle">BİTEN İŞLER</text>' +
        '<rect x="128" y="24" width="84" height="84" rx="8" fill="#155a34"/><rect x="133" y="29" width="74" height="74" rx="6" fill="#c7cbd1"/>';
      var cekirdekler = [];
      var boy = sr.cekirdek === 1 ? 56 : 32, bas = sr.cekirdek === 1 ? [142, 38] : [137, 33];
      for (var c = 0; c < sr.cekirdek; c++) {
        var cx = bas[0] + (c % 2) * 34, cy = bas[1] + Math.floor(c / 2) * 34;
        var cg = svgEl('g', { transform: 'translate(' + cx + ' ' + cy + ')' }, g);
        cg.innerHTML = '<rect class="yr-cekirdek" width="' + boy + '" height="' + boy + '" rx="5" fill="#e2e8f0" stroke="#64748b" stroke-width="1.2"/>' +
          '<rect class="yr-ilerleme" x="1" width="' + (boy - 2) + '" y="' + (boy - 1) + '" height="0" rx="4" fill="#fcd34d"/>' +
          '<g transform="translate(' + boy / 2 + ' ' + (boy * 0.3) + ') scale(' + (boy / 44) + ')"><path d="M-8 2c-5 0-7-6-3-9 0-6 7-8 11-4 4-4 11-2 11 4 4 3 2 9-3 9z" fill="#fff" stroke="#94a3b8" stroke-width="1.2"/>' +
          '<rect x="-7" y="2" width="14" height="6" rx="1.5" fill="#fff" stroke="#94a3b8" stroke-width="1.2"/></g>' +
          '';
        cekirdekler.push({ g: cg, x: cx, y: cy, boy: boy, kutu: cg.querySelector('.yr-cekirdek'), bar: cg.querySelector('.yr-ilerleme') });
      }
      var sure = svgEl('text', { x: 346, y: 20, 'font-family': 'Inter,Arial,sans-serif', 'font-size': 12.5, 'font-weight': 900, fill: '#0f172a', 'text-anchor': 'end' }, g);
      var bosta = svgEl('text', { x: 178, y: 19, 'font-family': 'Inter,Arial,sans-serif', 'font-size': 8, 'font-weight': 800, fill: '#64748b', 'text-anchor': 'middle' }, g);
      return { g: g, sr: sr, cekirdekler: cekirdekler, sure: sure, bosta: bosta, isler: [] };
    });
    function tabak(buyuk) {
      var t = document.createElementNS(SVGNS, 'g');
      t.innerHTML = buyuk ?
        '<ellipse cx="0" cy="3" rx="17" ry="6" fill="#94a3b8"/><rect x="-15" y="-12" width="30" height="16" rx="4" fill="#64748b"/><rect x="-18" y="-14" width="36" height="4" rx="2" fill="#475569"/><path d="M-6 -18c0-4 4-4 4-8M3 -18c0-4 4-4 4-8" stroke="#94a3b8" stroke-width="1.5" fill="none"/>' :
        '<circle r="9" fill="#fff" stroke="#cbd5e1" stroke-width="1.4"/><circle r="5" fill="#fb923c"/><circle cx="-2" cy="-1.5" r="1.6" fill="#16a34a"/>';
      return t;
    }
    var durum = null;
    function kur(n, buyuk) {
      serit.forEach(function (sv) {
        sv.isler.forEach(function (o) { o.remove(); });
        sv.isler = [];
        for (var j = 0; j < n; j++) { var t = tabak(buyuk); sv.g.appendChild(t); sv.isler.push(t); }
        sv.bosta.textContent = '';
      });
      durum = { n: n, buyuk: buyuk, d: buyuk ? 4 : 1 };
      ciz(0);
    }
    function yiginYer(j, n, buyuk) {
      if (buyuk) return [57, 58];
      var kol = n > 8 ? 6 : 4, sat = Math.ceil(n / kol), aralikX = 88 / kol, aralikY = sat > 2 ? 20 : 24;
      return [13 + aralikX / 2 + (j % kol) * aralikX, 44 + Math.floor(j / kol) * aralikY];
    }
    function bitenYer(j, n, buyuk) { var p = yiginYer(j, n, buyuk); return [p[0] + 224, p[1]]; }
    /** t: simülasyon saniyesi; her şerit deterministik çizilir. Döner: şerit bitiş süreleri */
    function ciz(t) {
      var n = durum.n, d = durum.d, buyuk = durum.buyuk, UC = 0.18;
      return serit.map(function (sv) {
        var c = sv.sr.cekirdek, toplam = Math.ceil(n / c) * d;
        sv.cekirdekler.forEach(function (ck) { ck.kutu.setAttribute('stroke', '#64748b'); ck.bar.setAttribute('height', 0); ck.bar.setAttribute('y', ck.boy - 1); });
        sv.isler.forEach(function (tb, j) {
          var ck = sv.cekirdekler[j % c], bas = Math.floor(j / c) * d, son = bas + d;
          var y0 = yiginYer(j, n, buyuk), y1 = [ck.x + ck.boy / 2, ck.y + ck.boy * 0.68], y2 = bitenYer(j, n, buyuk), p, e;
          if (t < bas - UC) p = y0;
          else if (t < bas) { e = (t - bas + UC) / UC; p = [y0[0] + (y1[0] - y0[0]) * e, y0[1] + (y1[1] - y0[1]) * e]; }
          else if (t < son) {
            p = y1; e = (t - bas) / d;
            ck.kutu.setAttribute('stroke', '#d97706');
            ck.bar.setAttribute('height', ((ck.boy - 2) * e).toFixed(1)); ck.bar.setAttribute('y', (ck.boy - 1 - (ck.boy - 2) * e).toFixed(1));
          } else if (t < son + UC) { e = (t - son) / UC; p = [y1[0] + (y2[0] - y1[0]) * e, y1[1] + (y2[1] - y1[1]) * e]; }
          else p = y2;
          var olc = buyuk ? (c > 1 ? 0.62 : 1) : (c > 1 && t >= bas && t < son ? 0.7 : (n > 8 ? 0.8 : 1));
          if (buyuk && (t < bas - UC || t >= son + UC)) olc = 0.9;
          tb.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ') scale(' + olc + ')');
        });
        var gecen = Math.min(t, toplam);
        sv.sure.textContent = (t >= toplam && t > 0 ? '✓ ' : '') + 'Süre: ' + virgul(gecen) + ' sn';
        sv.sure.setAttribute('fill', t >= toplam && t > 0 ? '#047857' : '#0f172a');
        if (buyuk && c > 1) sv.bosta.textContent = t > 0 && t < toplam ? '3 çekirdek boşta' : '';
        return toplam;
      });
    }
    /** Yarışı oynatır: gercekSn = 1 simülasyon saniyesinin gerçek süresi. Promise → [t1, t4] */
    function oynat(gercekSn) {
      var sonlar = ciz(0), bitis = Math.max(sonlar[0], sonlar[1]) + 0.2;
      if (AZ) { ciz(bitis); return Promise.resolve(sonlar); }
      return new Promise(function (coz) {
        var t0 = performance.now();
        (function kare(z) {
          var t = (z - t0) / 1000 / gercekSn;
          ciz(Math.min(t, bitis));
          if (t < bitis) requestAnimationFrame(kare); else coz(sonlar);
        })(t0);
      });
    }
    return { kur: kur, oynat: oynat, ciz: ciz };
  }

  /* ─────────── Adım 3: A-YARIS (8 iş) ─────────── */
  (function () {
    var kok = document.getElementById('yaris');
    if (!kok) return;
    kok.innerHTML = '<div class="yr-sahne illu-orta"></div><div class="ky-alt"><div class="secici"></div><div class="panel-sonuc" aria-live="polite"></div></div>';
    var y = yarisSahnesi(kok.querySelector('.yr-sahne')), sonuc = kok.querySelector('.panel-sonuc'), calisiyor = false;
    y.kur(8, false);
    sonuc.textContent = 'Aynı 8 iş, iki işlemci. Hangisi önce bitirir?';
    function oyna() {
      if (calisiyor) return; calisiyor = true;
      y.kur(8, false); sonuc.className = 'panel-sonuc'; sonuc.textContent = 'Yarış başladı…';
      y.oynat(0.55).then(function (t) {
        calisiyor = false;
        sonuc.className = 'panel-sonuc iyi';
        sonuc.textContent = '4 çekirdek ' + virgul(t[1], 0) + ' sn, 1 çekirdek ' + virgul(t[0], 0) + ' sn: işler paylaşıldı.';
      });
    }
    var b = DERS.dugme(kok.querySelector('.secici'), '', oyna, 'h6-oynat');
    b.innerHTML = D.simge('oynat') + '<span>Yarışı başlat</span>';
    DERS.slaytAcilinca('s6', function () { bekle(0.6).then(oyna); });
  })();

  /* ─────────── Adım 4: E-SURGU — saat hızı; bant hızlanır, ısı yükselir (2D) ─────────── */
  (function () {
    var kok = document.getElementById('ghz');
    if (!kok) return;
    kok.innerHTML = '<div class="ghz-sahne illu-orta"></div>' +
      '<div class="ghz-kontrol"><label for="ghz-surgu">Saat hızı</label><input type="range" id="ghz-surgu" min="1" max="5" step="0.5" value="2" aria-valuetext="2,0 GHz">' +
      '<output for="ghz-surgu">2,0 GHz</output></div><div class="panel-sonuc" aria-live="polite"></div>';
    var svg = svgEl('svg', { viewBox: '0 0 360 200', role: 'img', 'class': 'ghz', 'aria-label': 'Saat vuruşları, komut bandı, işlemci ve termometre; saat hızı arttıkça bant hızlanır ve sıcaklık yükselir' }, kok.querySelector('.ghz-sahne'));
    svg.innerHTML = '<defs><linearGradient id="ghBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8fbff"/><stop offset="1" stop-color="#e0f2fe"/></linearGradient>' +
      '<clipPath id="ghKes"><rect x="16" y="22" width="150" height="46" rx="5"/></clipPath><clipPath id="ghBant"><rect x="0" y="120" width="228" height="40"/></clipPath></defs>' +
      '<rect width="360" height="200" rx="16" fill="url(#ghBg)"/>' +
      '<rect x="12" y="10" width="158" height="62" rx="9" fill="#0f172a"/><text x="20" y="20" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="800" fill="#94a3b8">SAAT VURUŞLARI</text>' +
      '<g clip-path="url(#ghKes)"><path class="gh-dalga" fill="none" stroke="#34d399" stroke-width="2.4" stroke-linejoin="round"/></g>' +
      '<rect x="0" y="152" width="232" height="14" rx="7" fill="#334155"/>' +
      '<g class="gh-bloklar" clip-path="url(#ghBant)"></g>' +
      '<rect x="226" y="90" width="92" height="92" rx="7" fill="#155a34"/><rect class="gh-kapak" x="233" y="97" width="78" height="78" rx="7" fill="#c7cbd1" stroke="#9aa0a8"/>' +
      '<text x="272" y="124" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="900" fill="#1f2937" text-anchor="middle">İŞLEMCİ</text>' +
      '<circle class="gh-led" cx="272" cy="146" r="7" fill="#fef08a" stroke="#ca8a04"/>' +
      '<text class="gh-sayac" x="272" y="168" font-family="Inter,Arial,sans-serif" font-size="8.5" font-weight="800" fill="#1f2937" text-anchor="middle"></text>' +
      '<g transform="translate(340 16)"><rect x="-7" y="0" width="14" height="136" rx="7" fill="#fff" stroke="#94a3b8" stroke-width="2"/>' +
      '<circle cy="146" r="12" fill="#fff" stroke="#94a3b8" stroke-width="2"/><circle class="gh-ampul" cy="146" r="8.5"/>' +
      '<rect class="gh-dolgu" x="-3.5" width="7" rx="3.5"/></g>' +
      '<text class="gh-derece" x="356" y="194" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="900" fill="#0f172a" text-anchor="end"></text>' +
      '<text x="190" y="36" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="800" fill="#475569">Her vuruşta işlemci</text>' +
      '<text x="190" y="49" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="800" fill="#475569">bir adım ilerler.</text>';
    var surgu = kok.querySelector('input'), cikti = kok.querySelector('output'), sonuc = kok.querySelector('.panel-sonuc');
    var dalga = svg.querySelector('.gh-dalga'), bloklarG = svg.querySelector('.gh-bloklar'), kapak = svg.querySelector('.gh-kapak');
    var led = svg.querySelector('.gh-led'), sayac = svg.querySelector('.gh-sayac'), dolgu = svg.querySelector('.gh-dolgu'), ampul = svg.querySelector('.gh-ampul'), derece = svg.querySelector('.gh-derece');
    var ghz = 2, T = hedefT(2), faz = 0, ledFaz = 0, konum = 0, islenen = 0, dongu = null, son = 0;
    var bloklar = [];
    for (var b = 0; b < 11; b++) {
      var r = svgEl('rect', { width: 18, height: 18, rx: 3.5, y: 132, fill: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'][b % 4] }, bloklarG);
      bloklar.push(r);
    }
    function hedefT(g) { return 38 + (g - 1) * 11; }
    function dalgaCiz() {
      var per = 150 / (ghz * 2), d = 'M' + (16 - (faz % per)) + ' 58', x = 16 - (faz % per);
      while (x < 170) { d += ' h' + (per / 2) + ' v-24 h' + (per / 2) + ' v24'; x += per; }
      dalga.setAttribute('d', d);
    }
    function isiCiz() {
      var d = (T - 30) / 60, h = 124 * Math.max(0.08, Math.min(1, d));
      dolgu.setAttribute('y', 138 - h); dolgu.setAttribute('height', h + 6);
      var rk = isiRenk(isiDeger(T));
      dolgu.setAttribute('fill', rk); ampul.setAttribute('fill', rk); kapak.setAttribute('fill', acik(rk, 0.45));
      derece.textContent = '≈ ' + Math.round(T) + ' °C';
    }
    function yaziGuncelle() {
      cikti.textContent = virgul(ghz) + ' GHz';
      surgu.setAttribute('aria-valuetext', virgul(ghz) + ' GHz');
      sonuc.textContent = virgul(ghz) + ' GHz = saniyede ' + virgul(ghz) + ' milyar vuruş · Isı ≈ ' + Math.round(hedefT(ghz)) + ' °C (' + (hedefT(ghz) >= 72 ? 'sıcak' : (hedefT(ghz) >= 55 ? 'ılık' : 'serin')) + ')';
    }
    function ciz() {
      dalgaCiz(); isiCiz();
      var aralik = 25;
      bloklar.forEach(function (r, k) {
        var x = ((konum + k * aralik) % (aralik * bloklar.length)) - 24;
        r.setAttribute('x', x.toFixed(1));
      });
      sayac.textContent = 'İşlenen: ' + islenen;
    }
    function kare(z) {
      dongu = null;
      if (!aktif('s7')) return;
      var dt = Math.min(0.05, (z - son) / 1000); son = z;
      faz += dt * 18 * ghz;
      var once = Math.floor((konum + 24) / 25);
      konum += dt * 16 * ghz;
      islenen += Math.max(0, Math.floor((konum + 24) / 25) - once);
      T += (hedefT(ghz) - T) * (1 - Math.exp(-dt / 0.8));
      ledFaz += dt * Math.min(2.5, ghz * 0.5) * Math.PI * 2;
      led.setAttribute('opacity', (0.65 + 0.35 * Math.sin(ledFaz)).toFixed(2));
      ciz();
      dongu = requestAnimationFrame(kare);
    }
    function basla() { if (!dongu && !AZ) { son = performance.now(); dongu = requestAnimationFrame(kare); } }
    surgu.addEventListener('input', function () {
      ghz = +surgu.value; yaziGuncelle();
      if (AZ) { T = hedefT(ghz); ciz(); }
    });
    yaziGuncelle(); ciz();
    DERS.slaytAcilinca('s7', basla, true);
  })();

  /* ─────────── Isı sahnesi: anakart parçası + işlemci + soğutucu (Adım 5 ve Etkinlik 2) ─────────── */
  function termometre(s) {
    var el = D.div('termo', s.arayuz);
    el.setAttribute('role', 'status');
    el.innerHTML = '<div class="termo-cubuk"><div class="termo-tup"><span class="termo-dolgu"></span></div><div class="termo-ampul"></div></div>' +
      '<div class="termo-yazi"><b class="termo-deger">–</b><span class="termo-durum"></span></div>';
    var dolgu = el.querySelector('.termo-dolgu'), ampul = el.querySelector('.termo-ampul'), deger = el.querySelector('.termo-deger'), durum = el.querySelector('.termo-durum');
    var sonT = null;
    return function (T) {
      var r = Math.round(T);
      if (r === sonT) return;
      sonT = r;
      var oran = Math.max(0.06, Math.min(1, (T - 25) / 80)), renk = isiRenk(isiDeger(T));
      dolgu.style.height = (oran * 100).toFixed(1) + '%';
      dolgu.style.background = renk; ampul.style.background = renk;
      deger.textContent = r + ' °C';
      durum.textContent = durumYazi(T);
      el.setAttribute('data-durum', T >= 90 ? 'cok' : (T >= 72 ? 'sicak' : 'normal'));
    };
  }

  var parcacikDoku = null;
  function parcacikDokusu() {
    if (parcacikDoku) return parcacikDoku;
    parcacikDoku = K.canvasDoku(64, 64, function (ctx, w, h) {
      var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    return parcacikDoku;
  }
  /** Sıcak hava parçacıkları: mod 'fan' (kanatçıklardan arkaya), 'dogal' (kanatçıklardan yukarı), 'cpu' (işlemciden yukarı), null (yok). */
  function sicakHava(s, cpu, sog) {
    var N = AZ ? 24 : 110, konum = new Float32Array(N * 3), omur = new Float32Array(N), hiz = [];
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(konum, 3));
    var mat = new THREE.PointsMaterial({ color: 0xff7a1a, size: 2, map: parcacikDokusu(), transparent: true, opacity: 0.8, depthWrite: false, sizeAttenuation: true });
    mat.toneMapped = false;
    var bulut = new THREE.Points(geo, mat);
    bulut.frustumCulled = false; bulut.userData.secilmez = true; bulut.raycast = function () {};
    s.scene.add(bulut);
    var O = sog.userData.olcu, mod = null, yogun = 0;
    function dogur(i) {
      var p = sog.position, c = cpu.position;
      var x, y, z, v;
      if (mod === 'fan') { x = p.x + (Math.random() - 0.5) * O.FW * 0.9; y = p.y + O.kanatAlt + Math.random() * (O.kanatUst - O.kanatAlt); z = p.z - O.FD / 2; v = [0, 1.2, -9 - Math.random() * 4]; }
      else if (mod === 'dogal') { x = p.x + (Math.random() - 0.5) * O.FW * 0.8; y = p.y + O.kanatUst; z = p.z + (Math.random() - 0.5) * O.FD; v = [0, 2.5 + Math.random() * 1.5, 0]; }
      else { x = c.x + (Math.random() - 0.5) * 2.6; y = c.y + 0.5; z = c.z + (Math.random() - 0.5) * 2.6; v = [(Math.random() - 0.5) * 0.6, 3 + Math.random() * 2, (Math.random() - 0.5) * 0.6]; }
      konum[i * 3] = x; konum[i * 3 + 1] = y; konum[i * 3 + 2] = z; hiz[i] = v; omur[i] = Math.random();
    }
    for (var i = 0; i < N; i++) { hiz[i] = [0, 0, 0]; konum[i * 3 + 1] = -999; omur[i] = 1; }
    s.herKare(function (dt) {
      if (!mod || yogun <= 0.02) { bulut.visible = false; return; }
      bulut.visible = true;
      mat.opacity = Math.min(0.85, yogun);
      mat.size = mod === 'cpu' ? 1.6 : 2.4;
      for (var i = 0; i < N; i++) {
        omur[i] += dt * (mod === 'fan' ? 0.9 : 0.6) * (AZ ? 0.2 : 1);
        if (omur[i] >= 1) { if (Math.random() < yogun) dogur(i); else { konum[i * 3 + 1] = -999; omur[i] = Math.random() * 0.5; } continue; }
        konum[i * 3] += hiz[i][0] * dt * (AZ ? 0.2 : 1); konum[i * 3 + 1] += hiz[i][1] * dt * (AZ ? 0.2 : 1); konum[i * 3 + 2] += hiz[i][2] * dt * (AZ ? 0.2 : 1);
      }
      geo.attributes.position.needsUpdate = true;
    });
    return function (m, y) { mod = m; yogun = y; };
  }

  function isiSahnesi(kap, ops) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [0.62, 0.5, 1], pay: ops.pay || 0.9, hedefOfset: ops.hedefOfset || [0, 0, 0] } });
    // Anakart parçası: yeşil kart, soket çerçevesi, iki RAM yuvası
    var kart = new THREE.Group();
    K.parca(kart, 'anakart', 'Anakart', 'İşlemci anakarttaki yuvasına (sokete) takılır.');
    var pcb = K.kutu(16, 0.3, 15, 'pcb', 0.1);
    K.koy(kart, pcb, 0, 0.15, 0);
    var CX = -2.6;
    [[0, 2.35, 5, 0.3], [0, -2.35, 5, 0.3], [2.35, 0, 0.3, 4.4], [-2.35, 0, 0.3, 4.4]].forEach(function (c) {
      K.koy(kart, K.kutu(c[2], 0.35, c[3], 'plastikKoyu', 0.05), CX + c[0], 0.47, c[1]);
    });
    K.koy(kart, K.kutu(0.3, 0.2, 5.4, 'celik', 0.05), CX + 2.9, 0.42, 0);
    [4.3, 5.4].forEach(function (x) {
      K.koy(kart, K.kutu(0.75, 0.75, 13, 'plastikSiyah', 0.08), x, 0.67, 0);
      K.koy(kart, K.kutu(0.2, 0.2, 12.4, K.mat('#475569'), 0.02), x, 1.05, 0);
    });
    kart.traverse(function (o) { if (o.isMesh) o.userData.secilmez = true; });
    s.ekle(kart);
    var cpu = s.ekle('M-CPU', { konum: [CX, 0.3, 0] });
    var takili = new V3(CX, 0.3 + cpu.userData.olcu.kapakY, 0), kenar = new V3(CX + 17.5, 0, 1.5);
    var sog = s.ekle('M-SOGUTUCU', { konum: [kenar.x, kenar.y, kenar.z] });
    s.yerlestir();
    sog.position.copy(takili);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.45, maxPolar: 1.4, minYakin: 0.55, maxYakin: 1.35 } });
    var fan = sog.userData.fan;
    fan.userData.hiz = 8; fan.userData.baslat(s);
    var termo = termometre(s), hava = sicakHava(s, cpu, sog);
    var st = { takili: true, macun: true, fan: true, T: 58, hareket: false };
    function hedef() {
      if (!st.takili) return 100;
      if (!st.macun && !st.fan) return 96;
      if (!st.macun) return 87;
      if (!st.fan) return 84;
      return 58;
    }
    s.herKare(function (dt) {
      var h = st.hareket ? Math.max(st.T, 70) : hedef();
      var tau = AZ ? 0.15 : (h > st.T ? 1.3 : 1.6);
      st.T += (h - st.T) * (1 - Math.exp(-dt / tau));
      termo(st.T);
      cpu.userData.isit(isiDeger(st.T));
      var y = (st.T - 45) / 50;
      if (!st.takili && !st.hareket) hava('cpu', y);
      else if (st.takili && !st.hareket) hava(st.fan ? 'fan' : 'dogal', st.fan ? y : y * 0.7);
      else hava(null, 0);
      if (ops.onKare) ops.onKare(st);
    });
    termo(st.T);
    /** E-TAK-CIKAR: soğutucuyu kaldırıp kenara koyar ya da geri takar. Promise */
    function sogutucu(tak) {
      if (st.hareket || tak === st.takili) return Promise.resolve();
      st.hareket = true;
      var a = sog.position.clone(), yuk = 9;
      var yol = tak ? [a, new V3(a.x, takili.y + yuk, a.z), new V3(takili.x, takili.y + yuk, takili.z), takili]
        : [a, new V3(a.x, a.y + yuk, a.z), new V3(kenar.x, a.y + yuk, kenar.z), kenar];
      if (!tak) st.takili = false;
      var z = Promise.resolve();
      [0.6, 0.9, 0.6].forEach(function (sure, k) { z = z.then(function () { return D.git(sog, yol[k + 1], sure); }); });
      return z.then(function () { st.hareket = false; if (tak) st.takili = true; D.ses('klik'); });
    }
    return { s: s, cpu: cpu, sog: sog, st: st, sogutucu: sogutucu, fan: fan };
  }

  /* ─────────── Adım 5: A-ISI + E-TAK-CIKAR — soğutucuyu kaldır/tak ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var mesaj, uyarildi = false;
    var a = isiSahnesi(kap, { hedefOfset: [-3.4, 1.6, 2.1], onKare: function (st) {
      if (!st.takili && !st.hareket && st.T >= 95 && !uyarildi) {
        uyarildi = true;
        mesaj(DERS.tahminNotu(1, 'Çok sıcak! İşlemci kendini korumak için yavaşladı.', 'Çok sıcak! İşlemci kendini korumak için yavaşladı. Soğutucu şart.'), 'yanlis');
      }
    } });
    mesaj = DERS.sahneMesaj(a.s);
    var b = a.s.dugme('Soğutucuyu kaldır', null, function () {
      if (a.st.hareket) return;
      var tak = !a.st.takili;
      b.disabled = true;
      mesaj(tak ? 'Soğutucu takılıyor…' : 'Soğutucu kaldırılıyor…', '');
      a.sogutucu(tak).then(function () {
        b.disabled = false;
        b.querySelector('span').textContent = a.st.takili ? 'Soğutucuyu kaldır' : 'Geri tak';
        if (a.st.takili) { uyarildi = false; mesaj('Soğutucu takıldı: ısı alınıyor, sıcaklık düşüyor.', 'dogru'); }
        else mesaj('Soğutucu yok: ısı işlemcide birikiyor…', '');
      });
    }, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Soğutucuyu kaldır ya da geri tak' });
    mesaj('Oyun açık. Soğutucu işlemcinin ısısını alıyor.', '');
  });

  /* ─────────── Adım 6: A-PATLAT — soğutucu, termal macun, işlemci + mikroskop görünümü ─────────── */
  function mikroskop(ebeveyn) {
    var el = D.div('mikro', ebeveyn);
    el.hidden = true;
    el.innerHTML = '<div class="mikro-bas"><b>Mikroskopla yakından</b><button type="button" class="mikro-kapat" aria-label="Mikroskop görünümünü kapat">' + D.simge('kapat') + '</button></div>' +
      '<div class="mikro-cizim"></div><div class="secici mikro-secici" role="group" aria-label="Macun durumu"></div><div class="mikro-not" aria-live="polite"></div>';
    var cizim = el.querySelector('.mikro-cizim'), not = el.querySelector('.mikro-not'), sec = el.querySelector('.mikro-secici');
    // pürüzlü yüzeyler
    var ust, alt, r = K.rng(8), noktalar = [];
    for (var x = 0; x <= 200; x += 10) noktalar.push([x, 48 + (r() - 0.5) * 12]);
    var altN = [];
    for (x = 0; x <= 200; x += 10) altN.push([x, 70 + (r() - 0.5) * 12]);
    var dokunma = [30, 110, 170];
    dokunma.forEach(function (d) { var k = d / 10; noktalar[k][1] = 60; altN[k][1] = 60; });
    ust = 'M0 0 H200 ' + noktalar.slice().reverse().map(function (p) { return 'L' + p[0] + ' ' + p[1].toFixed(1); }).join(' ') + ' Z';
    alt = 'M0 120 H200 ' + altN.slice().reverse().map(function (p) { return 'L' + p[0] + ' ' + p[1].toFixed(1); }).join(' ') + ' Z';
    var bosluk = 'M' + noktalar.map(function (p) { return p[0] + ' ' + p[1].toFixed(1); }).join(' L') + ' L' + altN.slice().reverse().map(function (p) { return p[0] + ' ' + p[1].toFixed(1); }).join(' L') + ' Z';
    var oklar = '';
    [30, 55, 80, 110, 140, 170].forEach(function (x) {
      var sinif = dokunma.indexOf(x) >= 0 ? '' : ' ok-macun';
      oklar += '<g class="mk-ok' + sinif + '"><line x1="' + x + '" y1="100" x2="' + x + '" y2="26" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/><path d="M' + (x - 5) + ' 30 l5 -8 5 8z" fill="#ef4444"/></g>';
    });
    cizim.innerHTML = '<svg viewBox="0 0 200 120" role="img" aria-label="Mikroskop görünümü: soğutucu tabanı ile işlemci kapağı arasında pürüzler ve boşluklar">' +
      '<rect width="200" height="120" fill="#f8fafc"/><path class="mk-bosluk" d="' + bosluk + '"/>' +
      '<path d="' + ust + '" fill="#b8bfc8"/><path d="' + alt + '" fill="#9aa1aa"/>' + oklar +
      '<text x="6" y="14" font-family="Inter,Arial,sans-serif" font-size="9.5" font-weight="800" fill="#1f2937">Soğutucu tabanı</text>' +
      '<text x="6" y="113" font-family="Inter,Arial,sans-serif" font-size="9.5" font-weight="800" fill="#1f2937">İşlemci kapağı</text>' +
      '<text class="mk-etiket" x="143" y="66" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="900" text-anchor="middle"></text></svg>';
    var svg = cizim.querySelector('svg'), etk = svg.querySelector('.mk-etiket'), dugmeler = {};
    function durum(macunlu) {
      svg.setAttribute('class', macunlu ? 'mk macunlu' : 'mk');
      etk.textContent = macunlu ? 'termal macun' : 'hava boşluğu';
      not.textContent = macunlu ? 'Macun boşlukları doldurdu: ısı her yerden geçiyor.' : 'Hava ısıyı iyi iletmez: ısı yalnız değen noktalardan geçiyor.';
      not.className = 'mikro-not ' + (macunlu ? 'iyi' : 'kotu');
      Object.keys(dugmeler).forEach(function (k) { dugmeler[k].setAttribute('aria-pressed', (k === 'var') === macunlu ? 'true' : 'false'); });
    }
    dugmeler.yok = DERS.dugme(sec, 'Macunsuz', function () { durum(false); });
    dugmeler['var'] = DERS.dugme(sec, 'Macunlu', function () { durum(true); });
    el.querySelector('.mikro-kapat').addEventListener('click', function (e) { e.stopPropagation(); el.hidden = true; });
    durum(false);
    return { el: el, durum: durum };
  }

  D.tembel('#s9-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-0.75, 0.3, 1], pay: 1.05, hedefOfset: [3, 0, 2.3] } });
    var cpu = s.ekle('M-CPU');
    var sog = s.ekle('M-SOGUTUCU', { konum: [0, cpu.userData.olcu.kapakY, 0] });
    sog.userData.patlatMesafe = 6;
    sog.userData.patlat(1, 0);
    s.yerlestir();
    sog.userData.patlat(0, 0);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.5, maxPolar: 1.6, minYakin: 0.5, maxYakin: 1.35 } });
    var fan = sog.userData.fan;
    fan.userData.hiz = 6; fan.userData.baslat(s);
    var mesaj = DERS.sahneMesaj(s), etiketler = [], acik = false, mesgul = false;
    var mk = mikroskop(s.arayuz);
    function etiketle() {
      etiketler.push(s.etiket(sog.getObjectByName('taban'), 'Soğutucu tabanı', { tur: 'vurgu', yer: 'merkez', ofset: [-4.2, 0, -3] }));
      etiketler.push(s.etiket(sog.userData.macun, 'Termal macun', { tur: 'vurgu', yer: 'merkez', ofset: [-3.4, 0, -2.4] }));
      etiketler.push(s.etiket(cpu, 'İşlemci', { tur: 'vurgu', yer: 'merkez', ofset: [-3.4, 0, -2.4] }));
    }
    function ayir(ac) {
      if (mesgul || ac === acik) return;
      mesgul = true;
      etiketler.forEach(function (e) { e.kaldir(); }); etiketler = [];
      sog.userData.patlat(ac ? 1 : 0, 1.2).then(function () {
        acik = ac; mesgul = false;
        ayB.querySelector('span').textContent = ac ? 'Birleştir' : 'Ayır';
        if (ac) { etiketle(); mesaj('Üç katman: soğutucu, ince macun, işlemci.', ''); }
        else mesaj('Birleşince macun, iki metalin arasında kalır.', 'dogru');
      });
    }
    var ayB = s.dugme('Ayır', null, function () { ayir(!acik); }, { yer: 'alt-orta', aciklama: 'Katmanları ayır ya da birleştir' });
    s.dugme('Mikroskop', null, function () { mk.el.hidden = !mk.el.hidden; }, { yer: 'alt-orta', aciklama: 'Mikroskop görünümünü aç ya da kapat' });
    mesaj('Katmanları ayırmak için düğmeye bas.', '');
    D.bekle(0.7, s).then(function () { ayir(true); }).then(function () { return D.bekle(1.6, s); }).then(function () { if (mk.el.hidden) mk.el.hidden = false; });
  });

  /* ─────────── Etkinlik 1: Çekirdek yarışı (tahmin et → izle) ─────────── */
  (function () {
    var kok = document.getElementById('yaris-etk');
    if (!kok) return;
    var TUR = [
      { n: 8, buyuk: false, bas: 'Tur 1 · 8 küçük iş', soru: 'Hangisi önce bitirir?', sec: ['1 çekirdek', '4 çekirdek', 'Aynı anda'], dogru: 1,
        aciklama: '4 çekirdek işleri paylaştı: 2 sn’de bitti. 1 çekirdek 8 sn sürdü.' },
      { n: 1, buyuk: true, bas: 'Tur 2 · 1 büyük iş (bölünemez)', soru: 'Hangisi önce bitirir?', sec: ['1 çekirdek', '4 çekirdek', 'Aynı anda'], dogru: 2,
        aciklama: 'Bölünemeyen işi tek çekirdek yapar; öbür üçü boşta kalır. İkisi de 4 sn.' },
      { n: 12, buyuk: false, bas: 'Tur 3 · 12 küçük iş', soru: '1 çekirdek 12 sn’de bitirir. 4 çekirdek kaç sn’de bitirir?', sec: ['3 sn', '6 sn', '12 sn'], dogru: 0,
        aciklama: '12 iş 4 çekirdeğe bölündü: her çekirdeğe 3 iş, toplam 3 sn.' }
    ];
    kok.innerHTML = '<div class="ye"><div class="ye-bas"><b class="ye-tur"></b><span class="ye-soru"></span></div>' +
      '<div class="secici ye-secenek" role="group" aria-label="Tahmin"></div><div class="ye-sahne illu-orta"></div>' +
      '<div class="ye-alt"><div class="panel-sonuc" aria-live="polite"></div><button type="button" class="h6-oynat ye-sonraki" hidden></button></div></div>';
    var yr = yarisSahnesi(kok.querySelector('.ye-sahne'));
    var turEl = kok.querySelector('.ye-tur'), soruEl = kok.querySelector('.ye-soru'), secEl = kok.querySelector('.ye-secenek');
    var sonuc = kok.querySelector('.panel-sonuc'), sonraki = kok.querySelector('.ye-sonraki');
    var gorevler = document.querySelectorAll('#gorevler-1 li'), ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var tur = 0, dogruSay = 0, kilit = false;
    sonraki.innerHTML = '<span>Sonraki tur</span>';
    function turKur(k) {
      var t = TUR[k];
      tur = k; kilit = false;
      turEl.textContent = t.bas; soruEl.textContent = t.soru;
      secEl.innerHTML = '';
      t.sec.forEach(function (m, i) {
        var b = DERS.dugme(secEl, m, function () { tahmin(i, b); });
        b.setAttribute('aria-pressed', 'false');
      });
      gorevler.forEach(function (li, i) { li.classList.toggle('simdi', i === k); });
      yr.kur(t.n, t.buyuk);
      sonuc.className = 'panel-sonuc'; sonuc.textContent = 'Önce tahminini seç.';
      sonraki.hidden = true;
    }
    function tahmin(i, b) {
      if (kilit) return; kilit = true;
      var t = TUR[tur];
      b.setAttribute('aria-pressed', 'true');
      secEl.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
      sonuc.textContent = 'Tahminin: ' + t.sec[i] + '. Yarış başladı…';
      yr.oynat(0.5).then(function () {
        var dogru = i === t.dogru;
        if (dogru) dogruSay++;
        ilerle(dogruSay, TUR.length);
        var dogruB = secEl.querySelectorAll('button')[t.dogru];
        dogruB.classList.add('ye-dogru'); dogruB.textContent = '✓ ' + dogruB.textContent;
        if (!dogru) { b.classList.add('ye-yanlis'); b.textContent = '✗ ' + b.textContent; }
        gorevler[tur].classList.remove('simdi'); gorevler[tur].classList.add('tamam');
        sonuc.className = 'panel-sonuc ' + (dogru ? 'iyi' : 'kotu');
        sonuc.textContent = (dogru ? '✔ Doğru! ' : '✗ Tahminin tutmadı. ') + t.aciklama;
        if (tur < TUR.length - 1) { sonraki.hidden = false; }
        else {
          sonraki.hidden = false; sonraki.querySelector('span').textContent = 'Baştan oyna';
          if (dogruSay >= 2) DERS.konfeti();
          sonuc.textContent += ' Toplam: ' + dogruSay + ' / 3 doğru tahmin.';
        }
      });
    }
    sonraki.addEventListener('click', function () {
      if (tur < TUR.length - 1) turKur(tur + 1);
      else {
        dogruSay = 0; ilerle(0, TUR.length);
        gorevler.forEach(function (li) { li.classList.remove('tamam'); });
        sonraki.querySelector('span').textContent = 'Sonraki tur';
        turKur(0);
      }
    });
    turKur(0);
  })();

  /* ─────────── Etkinlik 2: ısı deneyi (E-TAK-CIKAR + A-ISI) ─────────── */
  D.tembel('#s11-3d', function (kap) {
    var gorevler = document.querySelectorAll('#gorevler-2 li'), ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var tamam = [false, false, false, false], mesaj = null, bSog, bMac, bFan, sonDurum = '';
    function gorevBitir(i, metin) {
      if (tamam[i]) return;
      tamam[i] = true;
      gorevler[i].classList.add('tamam');
      var n = tamam.filter(Boolean).length;
      ilerle(n, 4);
      mesaj('✔ ' + metin, 'dogru');
      if (n === 4) {
        DERS.konfeti();
        D.bekle(2.2, a.s).then(function () { mesaj('✔ Deney tamam: soğutucu ısıyı alır, macun boşlukları doldurur, fan ısıyı uzaklaştırır.', 'dogru'); });
      }
    }
    var a = isiSahnesi(kap, { hedefOfset: [-1.6, 0.6, 1], onKare: function (st) {
      if (st.hareket || !mesaj) return;
      var T = st.T;
      if (!st.takili && T >= 92) gorevBitir(0, 'Soğutucu yokken işlemci ' + Math.round(T) + ' °C’ye çıktı ve yavaşladı.');
      if (st.takili && !st.macun && st.fan && Math.abs(T - 87) < 1.5) gorevBitir(1, 'Macun yok: soğutucu takılı olsa da ' + Math.round(T) + ' °C. Boşluklarda hava kaldı.');
      if (st.takili && st.macun && st.fan && T <= 61 && (tamam[0] || tamam[1])) gorevBitir(2, 'Macun + soğutucu + fan: ' + Math.round(T) + ' °C. Normal!');
      if (st.takili && st.macun && !st.fan && T >= 81) gorevBitir(3, 'Fan durunca ısı uzaklaşamadı: ' + Math.round(T) + ' °C.');
      var d = (st.takili ? 'T' : 'K') + (st.macun ? 'M' : '-') + (st.fan ? 'F' : '-');
      if (d !== sonDurum) sonDurum = d;
    } });
    mesaj = DERS.sahneMesaj(a.s);
    function etiketle() {
      bSog.querySelector('span').textContent = a.st.takili ? 'Soğutucuyu kaldır' : 'Soğutucuyu tak';
      bMac.querySelector('span').textContent = a.st.macun ? 'Macunu sil' : 'Macun sür';
      bFan.querySelector('span').textContent = a.st.fan ? 'Fanı durdur' : 'Fanı çalıştır';
      bMac.disabled = a.st.takili || a.st.hareket;
      bSog.disabled = a.st.hareket;
    }
    bSog = a.s.dugme('Soğutucuyu kaldır', null, function () {
      if (a.st.hareket) return;
      var p = a.sogutucu(!a.st.takili); etiketle();
      mesaj(a.st.takili ? 'Soğutucu takılıyor…' : 'Soğutucu kaldırılıyor…', '');
      p.then(function () { etiketle(); mesaj(a.st.takili ? (a.st.macun ? 'Soğutucu macunla takıldı.' : 'Soğutucu macunsuz takıldı.') : 'Soğutucu kenarda. Macunu şimdi değiştirebilirsin.', ''); });
    }, { yer: 'alt-orta', aciklama: 'Soğutucuyu kaldır ya da tak' });
    bMac = a.s.dugme('Macunu sil', null, function () {
      if (a.st.takili || a.st.hareket) return;
      a.st.macun = !a.st.macun;
      a.sog.userData.macunAyarla(a.st.macun, 0.6);
      etiketle();
      mesaj(a.st.macun ? 'İnce bir kat termal macun sürüldü.' : 'Macun silindi.', '');
    }, { yer: 'alt-orta', aciklama: 'Termal macunu sil ya da sür' });
    bFan = a.s.dugme('Fanı durdur', null, function () {
      a.st.fan = !a.st.fan;
      a.fan.userData.hizAyarla(a.st.fan ? 8 : 0, 1.2);
      etiketle();
      mesaj(a.st.fan ? 'Fan çalışıyor.' : 'Fan durdu.', '');
    }, { yer: 'alt-orta', aciklama: 'Fanı durdur ya da çalıştır' });
    etiketle();
    mesaj('Deneye başla: önce soğutucuyu kaldır.', '');
  });
})();
