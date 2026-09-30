/* DON-201 H12 — Taşınabilir Cihazlar, Piller ve E-Atık · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 1’de dizüstünün içine bakınca göreceğiz.');

  function sonra(sn, fn) { return setTimeout(fn, AZ ? 10 : sn * 1000); }
  function aktifMi(id) { var s = document.getElementById(id); return !!(s && s.classList.contains('active')); }

  /* ─────────── Kapak: parçalarına ayrılmış dizüstü + katmanlı telefon ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 46,
      kamera: { yon: [0.5, 0.9, 1], pay: 0.92 } });
    var dz = s.ekle('M-DIZUSTU-PATLAT', { konum: [-6, 0, 0], donus: [0, 0.25, 0] });
    s.ekle('M-TELEFON-KATMAN', { konum: [22, 0, 8], donus: [0, -0.5, 0], olcek: 1.25, modelOps: { oran: 0.85 } });
    dz.userData.patlat(0.8, 0);
    D.dondurParca(dz.userData.rotor, { eksen: 'y', hiz: 9 });
    s.yerlestir();
  });

  /* ─────────── Adım 1: dizüstü patlatma + masaüstü karşılıklarıyla eşleştirme (A-PATLAT) ─────────── */
  var ESLER = [
    { parca: 'sogutma', masa: 'Soğutucu ve fan', dizustu: 'fan + ısı borusu', ikon: '<!--@dahil:k-sogutucu.svg-->', renk: '#0ea5e9',
      not: 'Dizüstünde büyük soğutucu yerine ince bir ısı borusu ve küçük bir fan var.' },
    { parca: 'ram', masa: 'RAM', dizustu: 'SO-DIMM, kısa ve yatık', ikon: '<!--@dahil:k-ram.svg-->', renk: '#8b5cf6',
      not: 'Dizüstü RAM’i (SO-DIMM) masaüstü RAM’in kısa hâlidir.' },
    { parca: 'islemci', masa: 'İşlemci', dizustu: 'anakarta lehimli', ikon: '<!--@dahil:k-islemci.svg-->', renk: '#f59e0b',
      not: 'Masaüstünde işlemci sokete takılır; dizüstünde çoğu zaman anakarta lehimlidir.' },
    { parca: 'ssd', masa: 'Disk (SSD)', dizustu: 'M.2 SSD kartı', ikon: '<!--@dahil:k-disk.svg-->', renk: '#10b981',
      not: 'Dizüstünde depolama, sakız paketi boyunda bir M.2 SSD kartıdır.' },
    { parca: 'anakart', masa: 'Anakart', dizustu: 'küçük, ince anakart', ikon: '<!--@dahil:k-anakart.svg-->', renk: '#14b8a6',
      not: 'Anakart her iki bilgisayarda da parçaları birbirine bağlar; dizüstündeki çok daha küçüktür.' },
    { parca: 'pil', masa: 'Güç kaynağı', dizustu: 'pil + şarj aleti', ikon: '<!--@dahil:k-psu.svg-->', renk: '#ef4444',
      not: 'Masaüstü enerjiyi güç kaynağıyla prizden alır. Dizüstü şarj aletiyle pilini doldurur.' }
  ];
  D.tembel('#s4-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [0.2, 1.1, 1], pay: 1.06, hedefOfset: [8.8, 2.5, 0] } });
    var m = s.ekle('M-DIZUSTU-PATLAT');
    var P = m.userData.parcalar;
    m.userData.patlat(1, 0);   // çerçeveleme açık hâle göre yapılır (kapak kalkınca kesilmesin)
    s.yerlestir();
    m.userData.patlat(0, 0);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.35, maxPolar: 1.2, minYakin: 0.5, maxYakin: 1.25 } });
    D.dondurParca(m.userData.rotor, { eksen: 'y', hiz: 11 });
    var mesaj = DERS.sahneMesaj(s);
    // Çizgi uçları için çapa noktaları
    function capa(ebeveyn, x, y, z) { var o = new THREE.Object3D(); o.position.set(x, y, z); ebeveyn.add(o); return o; }
    var CAPA = {
      sogutma: m.userData.rotor, ram: capa(P.ram, -1.5, 0.2, 0), islemci: capa(P.islemci, 0, 0.3, 0.6),
      ssd: capa(P.ssd, 1, 0.2, 0), anakart: capa(P.anakart, -8.5, 0.12, 3), pil: capa(P.pil, -9, 0.62, 0)
    };
    var PARCA = { sogutma: P.sogutma, ram: P.ram, islemci: P.islemci, ssd: P.ssd, anakart: P.anakart, pil: P.pil };
    // Katman: SVG çizgiler + sağda kart sütunu
    var kat = D.div('esles', s.arayuz);
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'esles-cizgi'); svg.setAttribute('aria-hidden', 'true');
    kat.appendChild(svg);
    var sutun = D.div('esles-kartlar', kat);
    var bas = D.div('esles-bas', sutun); bas.textContent = 'Masaüstündeki karşılığı';
    var secili = null;
    ESLER.forEach(function (e, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'esles-kart';
      b.style.setProperty('--es-renk', e.renk);
      b.innerHTML = '<span class="esles-ikon">' + e.ikon + '</span><span class="esles-yazi"><b></b><small></small></span>';
      b.querySelector('b').textContent = e.masa;
      b.querySelector('small').textContent = 'Dizüstü: ' + e.dizustu;
      b.setAttribute('aria-label', e.masa + ' ↔ dizüstünde ' + e.dizustu);
      b.addEventListener('click', function (ev) { ev.stopPropagation(); sec(i); });
      sutun.appendChild(b);
      e.kart = b;
      var yol = document.createElementNS(NS, 'path');
      yol.setAttribute('pathLength', '1'); yol.setAttribute('stroke', e.renk);
      var uc = document.createElementNS(NS, 'circle');
      uc.setAttribute('r', '5'); uc.setAttribute('fill', e.renk);
      svg.appendChild(yol); svg.appendChild(uc);
      e.yol = yol; e.uc = uc;
    });
    function sec(i) {
      if (secili != null) { D.vurguKaldir(PARCA[ESLER[secili].parca]); ESLER[secili].kart.classList.remove('secili'); }
      if (secili === i) { secili = null; mesaj(''); return; }
      secili = i;
      var e = ESLER[i];
      e.kart.classList.add('secili');
      D.vurgula(PARCA[e.parca], { etiket: false, renk: e.renk });
      mesaj(e.not, '');
    }
    s.tiklaninca(function (p) {
      if (!p || !kat.classList.contains('gor')) return;
      for (var i = 0; i < ESLER.length; i++) {
        var o = p;
        while (o) { if (o === PARCA[ESLER[i].parca]) { sec(i); return; } o = o.parent; }
      }
    });
    var v = new V3();
    function cizgiGuncelle() {
      if (!kat.classList.contains('gor') || !s.w) return;
      var kr = kap.getBoundingClientRect();
      ESLER.forEach(function (e) {
        CAPA[e.parca].getWorldPosition(v); v.project(s.kamera);
        var x = (v.x + 1) / 2 * s.w, y = (1 - v.y) / 2 * s.h;
        var r = e.kart.getBoundingClientRect();
        var x2 = r.left - kr.left, y2 = r.top - kr.top + r.height / 2;
        var dx = Math.max(30, (x2 - x) * 0.45);
        e.yol.setAttribute('d', 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' C' + (x + dx).toFixed(1) + ' ' + y.toFixed(1) + ' ' +
          (x2 - dx).toFixed(1) + ' ' + y2.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1));
        e.uc.setAttribute('cx', x.toFixed(1)); e.uc.setAttribute('cy', y.toFixed(1));
      });
    }
    s.herKare(cizgiGuncelle);
    var acik = false, mesgul = false, zaman = [];
    function temizle() { zaman.forEach(clearTimeout); zaman = []; }
    function eslestir() {
      temizle();
      kat.classList.add('gor');
      ESLER.forEach(function (e) { e.kart.classList.remove('gor'); e.yol.classList.remove('gor'); e.uc.classList.remove('gor'); });
      cizgiGuncelle();
      mesaj('Her parça, masaüstündeki karşılığına bağlanıyor…', '');
      ESLER.forEach(function (e, i) {
        zaman.push(sonra(0.25 + i * 0.45, function () { e.kart.classList.add('gor'); e.yol.classList.add('gor'); e.uc.classList.add('gor'); }));
      });
      zaman.push(sonra(0.4 + ESLER.length * 0.45, function () {
        mesaj(DERS.tahminNotu(1, 'Aynı parçalar burada da var, yalnızca küçülmüşler.', 'Masaüstündeki parçalar burada da var; yalnızca küçülmüşler.'), 'dogru');
      }));
    }
    function ac() {
      if (mesgul) return; mesgul = true; temizle();
      mesaj('Alt kapağın vidaları söküldü; kapak kalkıyor…', '');
      m.userData.patlat(1, 2.4).then(function () {
        acik = true; mesgul = false; bAc.querySelector('span').textContent = 'Topla';
        eslestir();
      });
    }
    function topla() {
      if (mesgul) return; mesgul = true; temizle();
      if (secili != null) sec(secili);
      kat.classList.remove('gor');
      ESLER.forEach(function (e) { e.kart.classList.remove('gor'); e.yol.classList.remove('gor'); e.uc.classList.remove('gor'); });
      mesaj('');
      m.userData.patlat(0, 1.8).then(function () { acik = false; mesgul = false; bAc.querySelector('span').textContent = 'Kapağı aç'; });
    }
    var bAc = s.dugme('Kapağı aç', 'oynat', function () { if (acik) topla(); else ac(); }, { yer: 'alt-orta', aciklama: 'Alt kapağı aç ya da parçaları topla' });
    s.dugme('Eşleştir', 'tekrar', function () { if (acik && !mesgul) eslestir(); else if (!acik) ac(); }, { yer: 'alt-orta', aciklama: 'Eşleştirme çizgilerini yeniden göster' });
    mesaj('Tahmin et: Alt kapağın altında hangi parçalar var?', '');
    D.bekle(1.2, s).then(function () { if (!acik && !mesgul) ac(); });
  });

  /* ─────────── Adım 2: telefon katmanları + tek çip (A-PATLAT) ─────────── */
  var KATMAN_ADLARI = [['ekran', 'Ekran'], ['cerceve', 'Çerçeve'], ['anakart', 'Anakart'], ['pil', 'Pil'], ['kamera', 'Kamera'], ['arka-kapak', 'Arka kapak']];
  function katmanEtiketi(s, p, metin, tur) {
    // Katmanın ön kenarına (kameraya yakın kenar) yerleşen etiket
    var kutu = new THREE.Box3().setFromObject(p), b = kutu.getSize(new V3());
    var x = p.name === 'anakart' ? -b.x * 0.28 : 0;   // anakart etiketi sola: çip etiketiyle çakışmasın
    return s.etiket(p, metin, { tur: tur, yer: 'merkez', ofset: [x, b.y / 2, b.z / 2 - 0.4] });
  }
  D.tembel('#s5-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.12, 0.62, 1], pay: 0.92 } });
    var m = s.ekle('M-TELEFON-KATMAN', { modelOps: { oran: 1 } });
    s.yerlestir();
    m.userData.patlat(0, 0);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.35, maxPolar: 1.35, minYakin: 0.25, maxYakin: 1.3 } });
    var mesaj = DERS.sahneMesaj(s), etiketler = [], cipEt = [], mesgul = false;
    function etiketTemizle(l) { l.forEach(function (e) { e.kaldir(); }); l.length = 0; }
    function katmanlar() {
      if (mesgul) return; mesgul = true;
      etiketTemizle(cipEt); etiketTemizle(etiketler);
      mesaj('Telefon katmanlarına ayrılıyor…', '');
      Promise.all([m.userData.cipAc(0, 0.5), s.sifirla()]).then(function () { return m.userData.patlat(1, 2); }).then(function () {
        KATMAN_ADLARI.forEach(function (k, i) {
          sonra(0.15 + i * 0.25, function () { etiketler.push(katmanEtiketi(s, s.parca(k[0]), k[1], 'vurgu')); });
        });
        return D.bekle(AZ ? 0.1 : 1.8, s);
      }).then(function () { mesaj('Her katmanın bir görevi var. Şimdi çipe yaklaş.', ''); mesgul = false; });
    }
    function cip() {
      if (mesgul) return; mesgul = true;
      etiketTemizle(etiketler);
      var p = m.userData.oran < 1 ? m.userData.patlat(1, 1.4) : Promise.resolve();
      p.then(function () {
        var h = s.parca('cip').localToWorld(new V3(0, 0, 0));
        mesaj('Anakarttaki çipe yaklaşıyoruz…', '');
        return s.kameraGit({ hedef: [h.x + 1.2, h.y + 0.4, h.z], yakinlik: 0.3, theta: s._baslangic.theta, phi: 0.72 }, 1.4);
      }).then(function () { return m.userData.cipAc(1, 1); }).then(function () {
        cipEt.push(s.etiket(s.parca('cip-islemci'), 'İşlemci', { tur: 'vurgu', yer: 'merkez' }));
        cipEt.push(s.etiket(s.parca('cip-grafik'), 'Grafik', { tur: 'vurgu', yer: 'merkez' }));
        cipEt.push(s.etiket(s.parca('cip-diger'), 'Diğer birimler', { tur: 'bilgi', yer: 'alt' }));
        cipEt.push(s.etiket(s.parca('cip-bellek'), 'Bellek (RAM)', { tur: 'vurgu' }));
        cipEt.push(s.etiket(s.parca('depolama'), 'Depolama', { tur: 'bilgi' }));
        mesaj('Tek çipte işlemci ve grafik; bellek hemen üstünde.', 'dogru');
        mesgul = false;
      });
    }
    s.dugme('Katmanlar', 'tekrar', katmanlar, { yer: 'alt-orta', aciklama: 'Telefonu katmanlarına ayır' });
    s.dugme('Çipe yaklaş', 'oynat', cip, { yer: 'alt-orta', aciklama: 'Anakarttaki çipe yaklaş ve içini gör' });
    D.bekle(0.8, s).then(function () {
      katmanlar();
      var bekle = setInterval(function () { if (!mesgul) { clearInterval(bekle); sonra(1.2, function () { if (aktifMi('s5')) cip(); }); } }, 200);
    });
  });

  /* ─────────── Adım 3: A-AKIS (2D) — şarj ve kullanımda iyonlar ─────────── */
  (function () {
    var kok = document.getElementById('pil-akis');
    if (!kok) return;
    kok.innerHTML = '<div class="pa-tahmin" role="group" aria-label="Tahmin"><span>Tahmin: şarjda iyonlar hangi uca gider?</span></div>' +
      '<div class="secici" role="group" aria-label="Pil durumu"></div>' +
      '<div class="illu-orta pa-sahne"><!--@dahil:pil-sema.svg--></div><div class="panel-sonuc" aria-live="polite"></div>';
    var svg = kok.querySelector('svg'), sonuc = kok.querySelector('.panel-sonuc'), grup = svg.querySelector('.iyonlar');
    var dolum = svg.querySelector('.dolum'), yuzde = svg.querySelector('.yuzde');
    var NS = 'http://www.w3.org/2000/svg', N = 12, iyonlar = [], calisiyor = false, tahmin = null;
    function slot(taraf, k) {
      var x0 = taraf === 0 ? 88 : 206, c = k % 3, r = Math.floor(k / 3);
      return [x0 + c * 33, 128 + r * 19];
    }
    var dolu = [[], []];   // her uçta 12 yuva: dolu mu?
    for (var j = 0; j < N; j++) { dolu[0].push(false); dolu[1].push(false); }
    function bosYuva(taraf) { for (var k = 0; k < N; k++) if (!dolu[taraf][k]) return k; return 0; }
    function koy(o, x, y) { o.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')'); }
    for (var i = 0; i < N; i++) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'iyon');
      g.innerHTML = '<circle r="7.5" fill="#f59e0b" stroke="#fff" stroke-width="1.5"/><path d="M-3.5 0h7M0 -3.5v7" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
      grup.appendChild(g);
      var o = { el: g, taraf: i < 6 ? 0 : 1 };
      o.yuva = bosYuva(o.taraf); dolu[o.taraf][o.yuva] = true;
      var p = slot(o.taraf, o.yuva); koy(o, p[0], p[1]);
      iyonlar.push(o);
    }
    function yerlestir() {
      var sol = iyonlar.filter(function (o) { return o.taraf === 0; }).length, oran = sol / N;
      dolum.setAttribute('y', (110 + 84 * (1 - oran)).toFixed(1)); dolum.setAttribute('height', (84 * oran).toFixed(1));
      dolum.setAttribute('fill', oran < 0.25 ? '#ef4444' : oran < 0.5 ? '#f59e0b' : '#22c55e');
      yuzde.textContent = '%' + Math.round(oran * 100);
      svg.querySelector('.tel-ekran').setAttribute('opacity', oran === 0 ? '0.25' : '1');
    }
    function tasi(o, hedefTaraf, sure) {
      return new Promise(function (coz) {
        var p0 = slot(o.taraf, o.yuva);
        dolu[o.taraf][o.yuva] = false;
        o.taraf = hedefTaraf; o.yuva = bosYuva(hedefTaraf); dolu[hedefTaraf][o.yuva] = true;
        var p1 = slot(hedefTaraf, o.yuva);
        if (AZ) { koy(o, p1[0], p1[1]); coz(); return; }
        var t0 = performance.now();
        (function adim(t) {
          var e = Math.min(1, (t - t0) / (sure * 1000)), k = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
          koy(o, p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k - Math.sin(e * Math.PI) * 12);
          if (e < 1) requestAnimationFrame(adim); else coz();
        })(t0);
      });
    }
    function mod(k) {
      svg.setAttribute('data-mod', k);
      Object.keys(dugmeler).forEach(function (x) { dugmeler[x].setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
    }
    function oynat(k) {
      if (calisiyor) return; calisiyor = true;
      mod(k);
      var hedef = k === 'sarj' ? 0 : 1;
      var liste = iyonlar.filter(function (o) { return o.taraf !== hedef; });
      sonuc.className = 'panel-sonuc';
      sonuc.textContent = k === 'sarj' ? 'Şarj oluyor: iyonlar − uca taşınıyor…' : 'Telefon çalışıyor: iyonlar + uca dönüyor…';
      svg.classList.add('akiyor');
      var z = Promise.resolve();
      liste.forEach(function (o) { z = z.then(function () { return tasi(o, hedef, 0.45); }).then(yerlestir); });
      z.then(function () {
        svg.classList.remove('akiyor');
        calisiyor = false;
        if (k === 'sarj') {
          var not = tahmin == null ? '' : (tahmin === 0 ? 'Tahminin doğru! ' : 'Doğrusu: − uç. ');
          sonuc.textContent = not + 'Pil doldu: iyonlar − uçta toplandı.';
          sonuc.className = 'panel-sonuc iyi';
        } else {
          sonuc.textContent = 'Pil bitti: iyonlar + uca döndü. Yeniden şarj et.';
          sonuc.className = 'panel-sonuc kotu';
        }
      });
    }
    var tahminEl = kok.querySelector('.pa-tahmin');
    [['− uca', 0], ['+ uca', 1]].forEach(function (x) {
      var b = DERS.dugme(tahminEl, x[0], function () {
        if (calisiyor) return;
        tahmin = x[1];
        tahminEl.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', y === b ? 'true' : 'false'); });
        oynat('sarj');
      });
      b.setAttribute('aria-pressed', 'false');
    });
    var secici = kok.querySelector('.secici'), dugmeler = {};
    [['sarj', 'Şarj et'], ['kullan', 'Kullan']].forEach(function (x) {
      dugmeler[x[0]] = DERS.dugme(secici, x[1], function () { oynat(x[0]); });
    });
    mod('sarj'); yerlestir();
    sonuc.textContent = 'Pil yarı dolu. Tahminini seç ya da “Şarj et”e bas.';
    DERS.slaytAcilinca('s6', function () {
      sonra(7, function () { if (!calisiyor && tahmin == null && aktifMi('s6')) oynat('sarj'); });
    });
  })();

  /* ─────────── Adım 4: A-UYARI — ısınan pil kırmızılaşır ve şişer ─────────── */
  D.tembel('#s7-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.45, 0.85, 1], pay: 1.05, hedefOfset: [1.6, 0, 0] } });
    var pil = s.ekle('M-PIL', { donus: [0, 0.35, 0], olcek: 1.6 });
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.4, maxPolar: 1.35, minYakin: 0.6, maxYakin: 1.3 } });
    var mesaj = DERS.sahneMesaj(s);
    var ter = D.div('termometre', s.arayuz);
    ter.innerHTML = '<div class="tm-cubuk"><span></span></div><div class="tm-yazi"><b>Isı</b><span class="tm-durum">Normal</span></div>';
    var cubuk = ter.querySelector('.tm-cubuk span'), durum = ter.querySelector('.tm-durum');
    var uyari = D.div('pil-uyari', s.arayuz);
    uyari.hidden = true;
    uyari.innerHTML = '<svg viewBox="-16 -16 32 30" aria-hidden="true"><path d="M0 -14 L15 12 H-15 Z" fill="#fbbf24" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/>' +
      '<rect x="-1.8" y="-6" width="3.6" height="10" rx="1.5" fill="#1f2937"/><circle cx="0" cy="7.5" r="2" fill="#1f2937"/></svg>' +
      '<div><b>Şişmiş pil!</b><span>Dokunma, bastırma, delme. Güvendiğin bir yetişkine söyle.</span></div>';
    var et = s.etiket(pil, 'Lityum pil', { tur: 'bilgi', yer: 'alt' }), mesgul = false;
    function isiGoster(t) {
      cubuk.style.height = Math.round(18 + t * 82) + '%';
      cubuk.style.background = t < 0.4 ? '#22c55e' : t < 0.75 ? '#f59e0b' : '#ef4444';
      durum.textContent = t < 0.4 ? 'Normal' : t < 0.75 ? 'Sıcak' : 'Çok sıcak';
      ter.classList.toggle('tm-sicak', t >= 0.75);
    }
    function isit() {
      if (mesgul) return; mesgul = true;
      uyari.hidden = true;
      mesaj('Pil güneşte kaldı ve yastık altında şarj oluyor…', '');
      D.tween({ sahne: s, sure: 3, ease: 'lineer', guncelle: function (e) { pil.userData.isit(e * 0.9); isiGoster(e); } }).then(function () {
        mesaj('Isı yüzünden pilin içinde gaz oluştu: pil şişiyor!', 'yanlis');
        return pil.userData.sisir(1, 2);
      }).then(function () {
        et.metin('Şişmiş pil');
        return D.uyari(pil, { etiket: '⚠ Dokunma!', genlik: 0.35 });
      }).then(function () {
        uyari.hidden = false;
        mesaj('Şişmiş pil yanabilir. Dokunma; bir yetişkine söyle.', 'yanlis');
        mesgul = false;
      });
    }
    function baslat() {
      if (mesgul) return;
      uyari.hidden = true;
      D.vurguKaldir(pil);
      pil.userData.isit(0); pil.userData.sisir(0, 0.01); isiGoster(0);
      et.metin('Lityum pil');
      mesaj('Tahmin et: Pil çok ısınırsa ne olur? Sonra “Isıt”a bas.', '');
    }
    s.dugme('Isıt', 'oynat', isit, { yer: 'alt-orta', aciklama: 'Pili ısıt ve ne olduğunu izle' });
    s.dugme('Serin tut', 'sifirla', baslat, { yer: 'alt-orta', aciklama: 'Pili normal duruma döndür' });
    baslat();
  });

  /* ─────────── Adım 5: e-atığın iki yolu (2D) ─────────── */
  (function () {
    var kok = document.getElementById('eatik');
    if (!kok) return;
    kok.innerHTML = '<div class="secici" role="group" aria-label="Eski telefon nereye gidiyor?"></div><div class="illu-orta ea-sahne"><!--@dahil:e-atik.svg--></div>' +
      '<div class="kv-alt"><button type="button" class="kv-oynat"></button><div class="panel-sonuc" aria-live="polite"></div></div>';
    var svg = kok.querySelector('svg'), sonuc = kok.querySelector('.panel-sonuc'), oynatB = kok.querySelector('.kv-oynat');
    oynatB.innerHTML = D.simge('tekrar') + '<span>Tekrar oynat</span>';
    var dugmeler = {}, secim = 'cop', zaman = [], elle = false;
    var METIN = {
      cop: ['Eski telefon ev çöpüne atıldı…', 'Zararlı maddeler toprağa karışır, değerli metaller boşa gider.', 'kotu'],
      toplama: ['Eski telefon e-atık kutusuna bırakıldı…', 'Tesiste altın, bakır ve alüminyum geri kazanılır.', 'iyi']
    };
    function oyna(k) {
      zaman.forEach(clearTimeout); zaman = [];
      secim = k;
      Object.keys(dugmeler).forEach(function (x) { dugmeler[x].setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
      svg.setAttribute('data-mod', k);
      svg.classList.remove('oyna'); void svg.getBoundingClientRect(); svg.classList.add('oyna');
      sonuc.className = 'panel-sonuc'; sonuc.textContent = METIN[k][0];
      zaman.push(sonra(3.6, function () { sonuc.textContent = METIN[k][1]; sonuc.className = 'panel-sonuc ' + METIN[k][2]; }));
    }
    var secici = kok.querySelector('.secici');
    [['cop', 'Çöpe atılırsa'], ['toplama', 'Toplama noktasına']].forEach(function (x) {
      dugmeler[x[0]] = DERS.dugme(secici, x[1], function () { elle = true; oyna(x[0]); });
    });
    oynatB.addEventListener('click', function () { oyna(secim); });
    svg.setAttribute('data-mod', 'cop');
    dugmeler.cop.setAttribute('aria-pressed', 'true'); dugmeler.toplama.setAttribute('aria-pressed', 'false');
    sonuc.textContent = 'Tahmin et: Çöpe atılan telefona ne olur?';
    DERS.slaytAcilinca('s8', function () {
      sonra(1.2, function () { if (!elle) oyna('cop'); });
      sonra(8.5, function () { if (!elle && aktifMi('s8')) oyna('toplama'); });
    });
  })();

  /* ─────────── Adım 6: elden çıkarmadan önce — yedekle, hesaplardan çık, sıfırla (2D) ─────────── */
  (function () {
    var kok = document.getElementById('sifirla');
    if (!kok) return;
    kok.innerHTML = '<div class="sf"><div class="sf-tel" aria-hidden="true"><div class="sf-ekran"></div></div>' +
      '<div class="sf-adimlar" role="group" aria-label="Elden çıkarma adımları"></div></div>' +
      '<div class="kv-alt"><button type="button" class="kv-oynat"></button><div class="panel-sonuc" aria-live="polite"></div></div>';
    var ekran = kok.querySelector('.sf-ekran'), adimEl = kok.querySelector('.sf-adimlar'), sonuc = kok.querySelector('.panel-sonuc');
    var bastan = kok.querySelector('.kv-oynat');
    bastan.innerHTML = D.simge('sifirla') + '<span>Baştan</span>';
    var FOTO = '<svg viewBox="0 0 20 16" aria-hidden="true"><rect width="20" height="16" rx="2" fill="COL"/><path d="M2 14l5-6 4 4 3-3 4 5z" fill="#fff" opacity=".85"/><circle cx="14" cy="4.5" r="2" fill="#fff" opacity=".9"/></svg>';
    function kisisel() {
      ekran.className = 'sf-ekran sf-kisisel';
      ekran.innerHTML = '<div class="sf-bas">Fotoğraflar</div><div class="sf-foto">' +
        ['#0ea5e9', '#f97316', '#22c55e', '#a855f7', '#ef4444', '#eab308'].map(function (c) { return FOTO.replace('COL', c); }).join('') + '</div>' +
        '<div class="sf-bas">Mesajlar</div><div class="sf-mesaj"><i></i><i></i></div>' +
        '<div class="sf-bas">Hesaplar</div><div class="sf-hesap"><span>E-posta</span><span>Oyun</span></div>';
    }
    var yapilan = 0, mesgul = false, zaman = [];
    var ADIM = [
      { ad: 'Yedekle', alt: 'Dosyaların kopyası', fn: yedekle },
      { ad: 'Hesaplardan çık', alt: 'E-posta, oyun, mağaza', fn: hesap },
      { ad: 'Fabrika ayarlarına sıfırla', alt: 'Her şey silinir', fn: sifir }
    ];
    var butonlar = ADIM.map(function (a, i) {
      var b = DERS.dugme(adimEl, '', function () { if (!mesgul && i === yapilan) a.fn(); }, 'sf-adim');
      b.innerHTML = '<span class="sf-no">' + (i + 1) + '</span><span class="sf-ad"><b></b><small></small></span>';
      b.querySelector('b').textContent = a.ad; b.querySelector('small').textContent = a.alt;
      return b;
    });
    function guncelle() {
      butonlar.forEach(function (b, i) {
        b.disabled = i !== yapilan || mesgul;
        b.classList.toggle('tamam', i < yapilan);
        b.classList.toggle('siradaki', i === yapilan);
      });
    }
    function ilerleme(etiket, sure, bitti) {
      ekran.innerHTML = '<div class="sf-ilerleme"><div class="sf-ib"></div><div class="sf-cubuk"><span></span></div><div class="sf-yuzde">%0</div></div>';
      ekran.querySelector('.sf-ib').innerHTML = etiket;
      var bar = ekran.querySelector('.sf-cubuk span'), yz = ekran.querySelector('.sf-yuzde'), t0 = performance.now();
      (function adim(t) {
        var e = AZ ? 1 : Math.min(1, (t - t0) / (sure * 1000));
        bar.style.width = Math.round(e * 100) + '%'; yz.textContent = '%' + Math.round(e * 100);
        if (e < 1) requestAnimationFrame(adim); else bitti();
      })(t0);
    }
    function yedekle() {
      mesgul = true; guncelle();
      sonuc.className = 'panel-sonuc'; sonuc.textContent = 'Fotoğraflar ve dosyalar yedekleniyor…';
      ilerleme('<svg viewBox="0 0 24 24" class="sf-simge" aria-hidden="true"><path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 18z" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/><path d="M12 15v-5M9.8 12l2.2-2.2 2.2 2.2" stroke="#0284c7" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>Yedekleniyor', 2.2, function () {
        kisisel(); ekran.classList.add('sf-yedekli');
        yapilan = 1; mesgul = false; guncelle();
        sonuc.className = 'panel-sonuc iyi'; sonuc.textContent = '✓ Yedek alındı. Anıların kaybolmaz.';
      });
    }
    function hesap() {
      mesgul = true; guncelle();
      ekran.className = 'sf-ekran';
      ekran.innerHTML = '<div class="sf-bas">Hesaplar</div><ul class="sf-liste"><li>E-posta hesabı</li><li>Oyun hesabı</li><li>Uygulama mağazası</li></ul>';
      sonuc.className = 'panel-sonuc'; sonuc.textContent = 'Hesaplardan tek tek çıkılıyor…';
      var li = ekran.querySelectorAll('li');
      li.forEach(function (l, i) { zaman.push(sonra(0.6 + i * 0.7, function () { l.classList.add('cikildi'); })); });
      zaman.push(sonra(0.8 + li.length * 0.7, function () {
        yapilan = 2; mesgul = false; guncelle();
        sonuc.className = 'panel-sonuc iyi'; sonuc.textContent = '✓ Hesaplardan çıkıldı. Kimse senin adına giriş yapamaz.';
      }));
    }
    function sifir() {
      mesgul = true; guncelle();
      sonuc.className = 'panel-sonuc kotu'; sonuc.textContent = 'Dikkat: sıfırlama her şeyi siler. Yedek hazır, devam.';
      ilerleme('<svg viewBox="0 0 24 24" class="sf-simge" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#dc2626" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18 3v4h-4" stroke="#dc2626" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>Sıfırlanıyor', 2.6, function () {
        ekran.className = 'sf-ekran sf-yeni';
        ekran.innerHTML = '<div class="sf-merhaba">Merhaba</div><div class="sf-dil"><span>Türkçe</span><span>English</span></div><div class="sf-basla">Başla</div>';
        yapilan = 3; mesgul = false; guncelle();
        sonuc.className = 'panel-sonuc iyi'; sonuc.textContent = '✓ Cihaz ilk günkü gibi. Yeni sahibine hazır!';
        DERS.konfeti();
      });
    }
    function sifirlaHepsi() {
      zaman.forEach(clearTimeout); zaman = [];
      yapilan = 0; mesgul = false; kisisel(); guncelle();
      sonuc.className = 'panel-sonuc'; sonuc.textContent = 'Silmeden verirsen bunları yeni sahibi görebilir. 1. adımla başla.';
    }
    bastan.addEventListener('click', sifirlaHepsi);
    sifirlaHepsi();
  })();

  /* ─────────── Etkinlik 1: telefonun katmanlarını bul (E-DONDUR + E-BILGI) ─────────── */
  D.tembel('#s10-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.3, 0.62, 1], pay: 1.0, hedefOfset: [0, -1.4, 0] } });
    var m = s.ekle('M-TELEFON-KATMAN', { modelOps: { oran: 1 } });
    s.yerlestir();
    D.dondur(s, { sinir: { minPolar: 0.3, maxPolar: 1.45, minYakin: 0.3, maxYakin: 1.3 } });
    var mesaj = DERS.sahneMesaj(s), ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var liste = document.querySelectorAll('#katman-gorev li'), bulunan = {}, etiketler = [];
    var ADLAR = ['ekran', 'cerceve', 'pil', 'anakart', 'cip', 'kamera', 'arka-kapak'];
    var ETIKET = { ekran: 'Ekran', cerceve: 'Çerçeve', pil: 'Pil', anakart: 'Anakart', cip: 'Çip', kamera: 'Kamera', 'arka-kapak': 'Arka kapak' };
    D.bilgi(s, ADLAR.concat(['depolama']), { onSecim: function (p) {
      var ad = p.name;
      if (ADLAR.indexOf(ad) < 0) { mesaj('Bu, anakarttaki depolama çipi. Listede değil; aramaya devam et.', ''); return; }
      if (bulunan[ad]) { mesaj(ETIKET[ad] + ' zaten bulundu.', ''); return; }
      bulunan[ad] = true;
      liste.forEach(function (li) { if (li.getAttribute('data-katman') === ad) li.classList.add('tamam'); });
      etiketler.push(ad === 'cip' ? s.etiket(p, '✓ Çip', { tur: 'dogru' }) : katmanEtiketi(s, p, '✓ ' + ETIKET[ad], 'dogru'));
      var n = Object.keys(bulunan).length;
      ilerle(n, ADLAR.length);
      if (n === ADLAR.length) { mesaj('Harika! Yedi katmanın hepsini buldun.', 'dogru'); DERS.konfeti(); }
      else mesaj('✓ ' + ETIKET[ad] + ' bulundu. ' + (ADLAR.length - n) + ' katman kaldı.', 'dogru');
    } });
    var acik = true, bK;
    bK = s.dugme('Birleştir', null, function () {
      acik = !acik;
      m.userData.patlat(acik ? 1 : 0, 1.4);
      bK.querySelector('span').textContent = acik ? 'Birleştir' : 'Ayır';
    }, { yer: 'alt-orta', aciklama: 'Katmanları birleştir ya da ayır' });
    s.dugme('Baştan', 'tekrar', function () {
      bulunan = {}; etiketler.forEach(function (e) { e.kaldir(); }); etiketler = [];
      liste.forEach(function (li) { li.classList.remove('tamam'); });
      ilerle(0, ADLAR.length); mesaj('Bir katmana dokun.', '');
    }, { yer: 'alt-orta', aciklama: 'Etkinliği baştan başlat' });
    mesaj('Bir katmana dokun.', '');
  });

  /* ─────────── Etkinlik 2: e-atığı doğru kutuya at (E-SINIFLA) ─────────── */
  D.tembel('#sinifla-atik', function (kap) {
    D.sinifla(kap, {
      onIlerleme: DERS.ilerlemeBagla('ilerleme-2'),
      kutular: [
        { id: 'eatik', ad: 'Elektronik atık', aciklama: 'Bozuk cihazlar', renk: '#f59e0b', resim: '<!--@dahil:kutu-eatik.svg-->' },
        { id: 'pil', ad: 'Pil toplama', aciklama: 'Tüm piller', renk: '#10b981', resim: '<!--@dahil:kutu-pil.svg-->' },
        { id: 'geri', ad: 'Kâğıt / plastik', aciklama: 'Geri dönüşüm', renk: '#3b82f6', resim: '<!--@dahil:kutu-geri.svg-->' },
        { id: 'cop', ad: 'Çöp', aciklama: 'Geri dönüşmeyen', renk: '#64748b', resim: '<!--@dahil:kutu-cop.svg-->' }
      ],
      ogeler: [
        { id: 'telefon', ad: 'Bozuk telefon', svg: '<!--@dahil:is-telefon.svg-->', kutu: 'eatik', ipucu: 'Telefon, pili içindeyken bütün hâlde e-atığa gider. Pilini sökme.' },
        { id: 'kalem', ad: 'Kalem pil', svg: '<!--@dahil:is-kalem-pil.svg-->', kutu: 'pil', ipucu: 'Biten piller pil toplama kutusuna atılır.' },
        { id: 'karton', ad: 'Karton kutu', svg: '<!--@dahil:is-karton.svg-->', kutu: 'geri', ipucu: 'Karton, kâğıt geri dönüşümüne gider.' },
        { id: 'kulaklik', ad: 'Bozuk kulaklık', svg: '<!--@dahil:is-kulaklik.svg-->', kutu: 'eatik', ipucu: 'Kablolu kulaklık da elektronik bir cihazdır.' },
        { id: 'pecete', ad: 'Kirli peçete', svg: '<!--@dahil:is-pecete.svg-->', kutu: 'cop', ipucu: 'Kirli peçete geri dönüşmez; çöpe atılır.' },
        { id: 'dugme', ad: 'Düğme pil', svg: '<!--@dahil:is-dugme-pil.svg-->', kutu: 'pil', ipucu: 'Küçük de olsa bir pildir. Pil kutusuna atılır.' },
        { id: 'sarj', ad: 'Eski şarj aleti', svg: '<!--@dahil:is-sarj.svg-->', kutu: 'eatik', ipucu: 'Şarj aleti ve kablosu elektronik atıktır.' },
        { id: 'sise', ad: 'Plastik şişe', svg: '<!--@dahil:is-sise.svg-->', kutu: 'geri', ipucu: 'Plastik şişe, plastik geri dönüşümüne gider.' }
      ],
      bitisMetni: 'Harika! Her atık doğru kutuda.'
    });
  });

  /* ─────────── Derinleş: alışkanlıklar pil sağlığını ve cihaz ömrünü değiştirir ─────────── */
  (function () {
    var kok = document.getElementById('pil-saglik');
    if (!kok) return;
    var SATIR = [
      { ad: 'Sıcaklık', kotu: 'Güneşte kalır', iyi: 'Serin yerde', pil: true },
      { ad: 'Şarj', kotu: 'Hep %0’a iner', iyi: '%20’nin altına inmez', pil: true },
      { ad: 'Şarj aleti', kotu: 'Rastgele alet', iyi: 'Uygun alet', pil: true },
      { ad: 'Koruma', kotu: 'Kılıfsız, düşer', iyi: 'Kılıf, tamir', pil: false }
    ];
    kok.innerHTML = '<div class="ps"><div class="ps-satirlar"></div><div class="ps-gosterge">' +
      '<div class="ps-bas">İki yıl sonra (örnek)</div>' +
      '<div class="ps-olcer"><span>Pil sağlığı</span><div class="ps-pil"><i></i></div><b class="ps-pil-yazi"></b></div>' +
      '<div class="ps-olcer"><span>Cihaz ömrü</span><div class="ps-pil ps-omur"><i></i></div><b class="ps-omur-yazi"></b></div>' +
      '</div></div><div class="panel-sonuc" aria-live="polite"></div>';
    var satirlar = kok.querySelector('.ps-satirlar'), sonuc = kok.querySelector('.panel-sonuc');
    var secim = SATIR.map(function () { return false; });
    SATIR.forEach(function (r, i) {
      var sat = D.div('ps-satir', satirlar);
      var ad = document.createElement('span'); ad.className = 'ps-ad'; ad.textContent = r.ad; sat.appendChild(ad);
      var grp = D.div('ps-sec', sat);
      grp.setAttribute('role', 'group'); grp.setAttribute('aria-label', r.ad);
      [[false, r.kotu], [true, r.iyi]].forEach(function (x) {
        var b = DERS.dugme(grp, x[1], function () {
          secim[i] = x[0];
          grp.querySelectorAll('button').forEach(function (y, k) { y.setAttribute('aria-pressed', (k === 1) === x[0] ? 'true' : 'false'); });
          hesapla();
        }, x[0] ? 'ps-iyi' : 'ps-kotu');
        b.setAttribute('aria-pressed', x[0] ? 'false' : 'true');
      });
    });
    var DUZEY = [['Zayıf', 0.3, '#ef4444'], ['Zayıf', 0.4, '#ef4444'], ['Orta', 0.6, '#f59e0b'], ['İyi', 0.8, '#22c55e'], ['Çok iyi', 0.95, '#16a34a']];
    function olcer(sel, yaziSel, d) {
      var i = kok.querySelector(sel + ' i');
      i.style.width = Math.round(d[1] * 100) + '%'; i.style.background = d[2];
      kok.querySelector(yaziSel).textContent = d[0];
    }
    function hesapla() {
      var p = 0, o = 0;
      SATIR.forEach(function (r, i) { if (secim[i]) { o++; if (r.pil) p++; } });
      olcer('.ps-pil:not(.ps-omur)', '.ps-pil-yazi', DUZEY[Math.round(p * 4 / 3)]);
      olcer('.ps-omur', '.ps-omur-yazi', DUZEY[o]);
      sonuc.className = 'panel-sonuc' + (o === 4 ? ' iyi' : o <= 1 ? ' kotu' : '');
      sonuc.textContent = o === 4 ? 'Harika! Pil uzun dayanır, cihaz yıllarca kullanılır.' : o <= 1 ? 'Pil çabuk yıpranır; cihaz erkenden e-atık olur.' : 'İyi alışkanlıkları seçtikçe ölçüler yükselir.';
    }
    hesapla();
  })();
})();
