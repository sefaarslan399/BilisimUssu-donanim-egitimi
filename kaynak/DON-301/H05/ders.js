/* DON-301 H05 — Anakart · ders betiği (ortak betikten sonra çalışır)
   Derse özel kalıplar: A-KARSILASTIR (ölçekli 2D form faktörü + kasa uyumu; M-ANAKART-FORM modeli yerine),
   A-TAK (işlemci sokete: doğru/ters), 2D çipset şeması + bağlantı paylaşımı (A-AKIS), A-KAMERA-TUR (kılavuz satırı → yuva),
   A-FIS (24-pin ve EPS başlıklara), E-BILGI (arka panel ve başlıklar), E-AV (kılavuzdaki bağlantıyı 3D’de bul), kılavuz okuma paneli.
   Kılavuz sayfaları marka-nötr örnektir; değerler M-ANAKART modelinin yerleşimiyle tutarlıdır. */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 1’de üç kartı üst üste koyup kasalara yerleştirerek kontrol edeceğiz.');

  /* ─────────── Yardımcılar ─────────── */
  function el(etiket, sinif, ebeveyn, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function sn(x) { return AZ ? 0.01 : x; }
  function bekle(x) { return new Promise(function (r) { setTimeout(r, AZ ? 10 : x * 1000); }); }
  function sayi(n, b) { return (b == null ? String(Math.round(n)) : n.toFixed(b)).replace('.', ','); }
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
  function merkez(liste) {
    var b = new THREE.Box3();
    liste.forEach(function (n) { if (n) b.expandByObject(n); });
    return b.getCenter(new V3());
  }
  function dunya(o) { o.updateWorldMatrix(true, false); return o.getWorldPosition(new V3()); }
  /* Kamerayı bir noktaya odaklar; Sıfırla da bu görünüme döner (H09 ile aynı yöntem) */
  function odak(s, nokta, yon, pay) {
    s.ops.kamera = { yon: yon, pay: pay, hedefOfset: nokta.clone().sub(s._merkez).toArray() };
    s.kameraSigdir();
  }
  var AKIS = { hiz: 11, boyut: 1.3, basBoyut: 0.5, izKalinlik: 0.2, parcacik: 12 };
  function akis(s, yol, renk) { return D.akis(s, yol, Object.assign({}, AKIS, { renk: renk })); }

  /* ─────────── Ortak: anakart sahnesi ve takılı parçalar ─────────── */
  var CPU_DOGRU = -Math.PI / 2;        // M-CPU üçgeni (−X,+Z) → soketteki üçgen (−X,−Z)
  var SOKET_Y = 0.31;                  // işlemcinin soket grubundaki oturma yüksekliği
  function kartSahnesi(kap, ops) {
    ops = ops || {};
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: !!ops.oto, turSuresi: ops.turSuresi || 40, arkaPlan: ops.arkaPlan,
      kamera: ops.kamera || { yon: [0.4, 1.2, 1], pay: 0.92 } });
    var m = s.ekle('M-ANAKART');
    s.yerlestir();
    if (ops.dondur !== false) D.dondur(s, { ipucu: false, sinir: { minPolar: 0.12, maxPolar: 1.42, minYakin: 0.2, maxYakin: 1.4 } });
    return { s: s, m: m };
  }
  function cpuYap() {
    var c = D.model('M-CPU');
    var alt = c.getObjectByName('temas-yuzeyi');
    if (alt) alt.visible = false;
    return c;
  }
  function cpuTak(m) {
    m.userData.kapakGoster(false);
    var c = cpuYap();
    c.position.set(0, SOKET_Y, 0); c.rotation.y = CPU_DOGRU;
    m.userData.soket.grup.add(c);
    return c;
  }
  function ramTak(m, sira) {
    return sira.map(function (i) {
      var y = m.userData.yuvalar[i], r = D.model('M-RAM');
      r.position.copy(y.userData.oturma); y.add(r);
      return r;
    });
  }
  function m2Tak(m, i) {
    var y = m.userData.m2[i], ssd = D.model('M-M2');
    ssd.position.copy(y.userData.oturma); y.add(ssd);
    return ssd;
  }
  /* Kılavuzdaki (serigrafi) adlar */
  var KILAVUZ_AD = {
    'soket': 'CPU (soket)', 'ram-yuvalari': 'DIMM (RAM yuvaları)', 'ram-yuvasi-1': 'DIMM_A1', 'ram-yuvasi-2': 'DIMM_A2', 'ram-yuvasi-3': 'DIMM_B1',
    'ram-yuvasi-4': 'DIMM_B2', 'pcie-x16-1': 'PCIE_1', 'pcie-x1-1': 'PCIE_2', 'pcie-x16-2': 'PCIE_3', 'pcie-x1-2': 'PCIE_4', 'm2-1': 'M.2_1', 'm2-2': 'M.2_2',
    'cipset': 'Çipset', 'vrm': 'VRM', 'atx24': 'ATX_PWR', 'eps8': 'CPU_PWR', 'sata': 'SATA', 'on-panel': 'F_PANEL · F_USB · F_AUDIO',
    'usb-baslik': 'USB3', 'fan-baslik': 'CPU_FAN', 'cmos-pili': 'BAT', 'arka-panel': 'Arka panel'
  };
  /* F_PANEL örnek pim şeması (HTML; renk + yazı) */
  function fpanelSema(ebeveyn, baslik) {
    var e = el('div', 'fp-sema', ebeveyn);
    e.innerHTML = '<div class="fp-bas"></div><div class="fp-izgara" role="table" aria-label="F_PANEL örnek pim düzeni: üst sıra PLED artı, PLED eksi, PWR, PWR, boş; alt sıra HDD artı, HDD eksi, RST, RST, boş">' +
      [['PLED+', 'led'], ['PLED−', 'led'], ['PWR', 'dg'], ['PWR', 'dg'], ['—', 'yok'], ['HDD+', 'hdd'], ['HDD−', 'hdd'], ['RST', 'rst'], ['RST', 'rst'], ['NC', 'nc']]
        .map(function (p) { return '<span class="fp-pim fp-' + p[1] + '">' + p[0] + '</span>'; }).join('') +
      '</div><div class="fp-not">+ / − yalnız LED’lerde önemli; düğmelerde (PWR, RST) yön yok. Düzen karta göre değişir: kılavuza bak.</div>';
    e.querySelector('.fp-bas').textContent = baslik || 'F_PANEL · örnek düzen';
    return e;
  }

  /* ─────────── Kapak: işlemci, RAM ve SSD takılı anakart; yollarda veri akışı ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var a = kartSahnesi(kap, { arkaPlan: 'seffaf', oto: true, turSuresi: 48, dondur: false, kamera: { yon: [0.55, 0.9, 1], pay: 0.72 } });
    cpuTak(a.m); ramTak(a.m, [1, 3]); m2Tak(a.m, 0);
    if (AZ) return;
    var sira = [['soket-ram', '#38bdf8'], ['soket-pcie', '#f59e0b'], ['soket-cipset', '#a78bfa'], ['cipset-sata', '#22c55e'], ['guc', '#eab308']], i = 0;
    (function dongu() {
      var y = sira[i % sira.length];
      akis(a.s, a.m.userData.yol(y[0]), y[1]).then(function () { i++; return D.bekle(0.3, a.s); }).then(dongu);
    })();
  });

  /* ─────────── Adım 1: form faktörleri (A-KARSILASTIR, ölçekli 2D) + kasa uyumu ─────────── */
  (function () {
    var kok = document.getElementById('form');
    if (!kok) return;
    var S = 7, VW = 560, VH = 262, UST = 30;
    var DELIK = [[0.65, 0.85], [11.3, 0.85], [23.1, 0.85], [0.65, 14.95], [11.3, 14.95], [23.1, 14.95], [0.65, 28.85], [11.3, 28.85], [23.1, 28.85]];
    var KART = [
      { k: 'atx', ad: 'ATX', w: 24.4, h: 30.5, renk: '#15803d', yuva: 7, ram: 4, yan: 20, olcu: '30,5 × 24,4 cm' },
      { k: 'matx', ad: 'mATX', w: 24.4, h: 24.4, renk: '#2563eb', yuva: 4, ram: 4, yan: 20 + 24.4 * S + 26, olcu: '24,4 × 24,4 cm' },
      { k: 'itx', ad: 'Mini-ITX', w: 17, h: 17, renk: '#ea580c', yuva: 1, ram: 2, yan: 20 + 2 * (24.4 * S + 26), olcu: '17 × 17 cm' }
    ];
    var UST_X = (VW - 24.4 * S) / 2;
    function kartSvg(c) {
      var W = c.w * S, H = c.h * S, g = '';
      g += '<rect class="fk-pcb" width="' + W + '" height="' + H + '" rx="6" fill="' + c.renk + '" fill-opacity="0.2" stroke="' + c.renk + '" stroke-width="2.4"/>';
      g += '<rect x="0" y="' + (0.65 * S) + '" width="' + (2.4 * S) + '" height="' + (12.4 * S) + '" rx="2" fill="#475569"/>';
      g += '<rect x="' + (6.1 * S) + '" y="' + (4.1 * S) + '" width="' + (5.6 * S) + '" height="' + (6.3 * S) + '" rx="3" fill="#94a3b8"/><rect x="' + (6.6 * S) + '" y="' + (4.6 * S) + '" width="' + (4.6 * S) + '" height="' + (5.3 * S) + '" rx="2" fill="#334155"/>';
      for (var r = 0; r < c.ram; r++) {
        var rx = (c.ram === 4 ? 14.5 + r : 13.2 + r * 1.1) * S;
        g += '<rect x="' + rx + '" y="' + (0.9 * S) + '" width="' + (0.75 * S) + '" height="' + (13.8 * S) + '" rx="1.5" fill="' + (r % 2 ? '#111827' : '#4b5563') + '"/>';
      }
      for (var i = 0; i < c.yuva; i++) {
        var y = (c.k === 'itx' ? 15.3 : 16.15 + i * 2.032) * S, uz = (i % 2 === 0 ? 8.9 : 2.5) * S;
        g += '<rect x="' + (1.9 * S) + '" y="' + y + '" width="' + uz + '" height="' + (0.75 * S) + '" rx="1.5" fill="#0f172a"/>';
      }
      DELIK.forEach(function (d) {
        if (d[0] < c.w && d[1] < c.h) g += '<circle class="fk-delik" cx="' + (d[0] * S) + '" cy="' + (d[1] * S) + '" r="4.2" fill="#e2e8f0" stroke="#334155" stroke-width="1.6"/>';
      });
      g += '<g class="fk-ic"><text class="fk-ad" x="' + (W - 8) + '" y="' + (H - 22) + '" text-anchor="end" fill="' + c.renk + '">' + c.ad + '</text>';
      g += '<text class="fk-olcu" x="' + (W - 8) + '" y="' + (H - 8) + '" text-anchor="end">' + c.olcu + ' · ' + c.yuva + ' yuva</text></g>';
      var dx = 24.4 * S + 14;                         // üst üste modunda etiketler yığının sağında
      g += '<g class="fk-dis"><path d="M' + W + ' ' + H + 'H' + (dx - 4) + '" stroke="' + c.renk + '" stroke-width="1.5" stroke-dasharray="3 3"/>' +
        '<circle cx="' + W + '" cy="' + H + '" r="3" fill="' + c.renk + '"/>' +
        '<text class="fk-ad" x="' + dx + '" y="' + (H - 16) + '" fill="' + c.renk + '">' + c.ad + '</text>' +
        '<text class="fk-olcu" x="' + dx + '" y="' + (H - 2) + '">' + c.olcu + '</text>' +
        '<g class="fk-rozet" transform="translate(' + (dx + 88) + ' ' + (H - 21) + ')"><rect x="0" y="-12" width="66" height="20" rx="10"/><text x="33" y="2.5" text-anchor="middle"></text></g></g>';
      return g;
    }
    var svg = '<svg class="fk-svg" viewBox="0 0 ' + VW + ' ' + VH + '" role="img" aria-label="ATX, mATX ve Mini-ITX anakartlar gerçek oranlarında; üst üste modunda arka panel köşesine hizalanır, ortak vida delikleri görünür">' +
      '<rect class="fk-kasa" x="0" y="0" width="0" height="0" rx="8"/><text class="fk-kasa-yazi" x="0" y="0"></text>';
    KART.forEach(function (c) { svg += '<g class="fk-kart" data-k="' + c.k + '">' + kartSvg(c) + '</g>'; });
    svg += '</svg>';
    kok.innerHTML = '<div class="fk-kontrol"><div class="fk-mod"></div><div class="fk-kasa-sec"></div></div><div class="fk-sahne">' + svg + '</div>' +
      '<div class="fk-bilgi" role="group" aria-label="Form faktörü özellikleri"></div><div class="panel-sonuc fk-sonuc" aria-live="polite"></div>';
    var svgEl = kok.querySelector('svg'), sonuc = kok.querySelector('.fk-sonuc'), kasaRect = svgEl.querySelector('.fk-kasa'), kasaYazi = svgEl.querySelector('.fk-kasa-yazi');
    var gler = {}; svgEl.querySelectorAll('.fk-kart').forEach(function (g) { gler[g.getAttribute('data-k')] = g; });
    var bilgi = kok.querySelector('.fk-bilgi'), cipler = {};
    KART.forEach(function (c) {
      var b = el('button', 'fk-cip', bilgi);
      b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<i></i><b></b><span></span>';
      b.firstChild.style.background = c.renk;
      b.children[1].textContent = c.ad;
      b.children[2].textContent = c.olcu + ' · ' + c.yuva + ' yuva · ' + c.ram + ' RAM';
      b.addEventListener('click', function () { vurgula(c.k); });
      cipler[c.k] = b;
    });
    var durum = { mod: 'yan', kasa: null, vurgu: null }, gorulen = false;
    function yerlestir() {
      KART.forEach(function (c) {
        var x = durum.mod === 'yan' ? c.yan : UST_X, y = UST;
        gler[c.k].style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      svgEl.classList.toggle('ust-uste', durum.mod === 'ust');
    }
    function vurgula(k) {
      durum.vurgu = durum.vurgu === k ? null : k;
      KART.forEach(function (c) {
        gler[c.k].classList.toggle('soluk', !!durum.vurgu && durum.vurgu !== c.k);
        cipler[c.k].setAttribute('aria-pressed', durum.vurgu === c.k ? 'true' : 'false');
      });
      if (!durum.vurgu) { sonuc.textContent = 'Bir form faktörüne dokun ya da bir kasa seç.'; return; }
      var c = KART.filter(function (x) { return x.k === k; })[0];
      sonuc.textContent = c.ad + ': ' + c.olcu + ', en çok ' + c.yuva + ' genişleme yuvası, genellikle ' + c.ram + ' RAM yuvası.' + (k === 'itx' ? ' Küçük kasalar için.' : '');
    }
    var KASA = [
      { k: 'atx', ad: 'ATX kasa', w: 24.4, h: 30.5, alir: ['atx', 'matx', 'itx'] },
      { k: 'matx', ad: 'mATX kasa', w: 24.4, h: 24.4, alir: ['matx', 'itx'] },
      { k: 'itx', ad: 'Mini-ITX kasa', w: 17, h: 17, alir: ['itx'] }
    ];
    function kasaSec(i) {
      var kasa = KASA[i];
      durum.kasa = kasa; durum.mod = 'ust'; modGrup.sec(1); yerlestir();
      kasaRect.setAttribute('x', UST_X - 6); kasaRect.setAttribute('y', UST - 6);
      kasaRect.setAttribute('width', kasa.w * S + 12); kasaRect.setAttribute('height', kasa.h * S + 12);
      kasaYazi.setAttribute('x', UST_X - 12); kasaYazi.setAttribute('y', UST + 14); kasaYazi.setAttribute('text-anchor', 'end');
      kasaYazi.textContent = kasa.ad + ' sınırı';
      svgEl.classList.add('kasa-acik');
      KART.forEach(function (c) {
        var ok = kasa.alir.indexOf(c.k) >= 0, rz = gler[c.k].querySelector('.fk-rozet');
        rz.classList.toggle('ok', ok); rz.classList.toggle('yok', !ok);
        rz.querySelector('text').textContent = ok ? '✓ sığar' : '✗ sığmaz';
      });
      var metin = kasa.ad + ': ' + kasa.alir.map(function (k) { return KART.filter(function (c) { return c.k === k; })[0].ad; }).join(', ') + ' takılabilir. Küçük kart, büyük kasadaki vida ayaklarının bir bölümünü kullanır.';
      if (kasa.k === 'itx' && !gorulen) {
        gorulen = true;
        metin = DERS.tahminNotu(1, 'ATX kart Mini-ITX kasanın sınırını hem enine hem boyuna aşar.', 'Doğrusu: sığmaz. Mini-ITX kasa en çok 17 × 17 cm kart alır; ATX 30,5 × 24,4 cm’dir.');
      }
      sonuc.textContent = metin;
    }
    function modSec(i) {
      durum.mod = i ? 'ust' : 'yan';
      if (!i) { svgEl.classList.remove('kasa-acik'); kasaGrup.sec(-1); durum.kasa = null; }
      yerlestir();
      sonuc.textContent = i ? 'Üç kart arka panel köşesine hizalandı: açık renkli vida delikleri ortak. Küçük kart, büyüğün deliklerinin bir alt kümesini kullanır.'
        : 'Gerçek oranlarda yan yana: ATX en uzun, Mini-ITX kare ve en küçük.';
    }
    var modGrup = secGrup(kok.querySelector('.fk-mod'), ['Yan yana', 'Üst üste'], modSec, { baslangic: 0, aria: 'Görünüm' });
    var kasaGrup = secGrup(kok.querySelector('.fk-kasa-sec'), KASA.map(function (k) { return k.ad; }), kasaSec, { aria: 'Kasa seç' });
    yerlestir();
    sonuc.textContent = 'Gerçek oranlarda yan yana: ATX en uzun, Mini-ITX kare ve en küçük.';
    var calisti = false;
    DERS.slaytAcilinca('s5', function () {
      if (calisti) return;
      calisti = true;
      bekle(1.4).then(function () { modGrup.sec(1); modSec(1); return bekle(2.6); })
        .then(function () { if (!durum.kasa) { kasaGrup.sec(2); kasaSec(2); } });
    });
    kok._h05 = { kasaSec: kasaSec, modSec: modSec };
  })();

  /* ─────────── Adım 2: soket — kol, yük plakası, işlemci (A-TAK: ters girmez, doğru oturur) ─────────── */
  D.tembel('#s6-3d', function (kap) {
    var a = kartSahnesi(kap);
    var s = a.s, m = a.m, so = m.userData.soket;
    odak(s, dunya(so.grup).add(new V3(0.6, 0.4, 0.4)), [0.35, 0.95, 1], 0.3);
    var mesaj = DERS.sahneMesaj(s), etiketler = [];
    var acik = false, takili = false, mesgul = false, cpu = null;
    D.bilgi(s, ['soket-kol', 'soket-plaka', 'soket-kapak', 'soket-ucgen', 'soket-pimler', 'vrm']);
    function temizle() { etiketler.forEach(function (e) { e.kaldir(); }); etiketler = []; D.vurguKaldir(so.ucgen); if (cpu) D.vurguKaldir(cpu); }
    function cpuHazir(aci) {
      if (!cpu) { cpu = cpuYap(); so.grup.add(cpu); }
      cpu.visible = true;
      cpu.rotation.set(0, aci, 0);
      cpu.position.set(0, SOKET_Y + 4, 0);
      return cpu;
    }
    var bAc;
    function acKapa() {
      if (mesgul) return;
      mesgul = true; temizle();
      if (!acik) {
        mesaj('Kilit kolu yana çekilip kalkıyor, yük plakası açılıyor…', '');
        m.userData.soketAc(true, sn(0.7)).then(function () {
          acik = true; mesgul = false; bAc.querySelector('span').textContent = 'Soketi kapat';
          etiketler.push(s.etiket(so.pimler, 'LGA: yaylı pimler sokette', { tur: 'hata', yer: 'merkez' }));
          D.vurgula(so.ucgen, { etiket: 'Köşe üçgeni' });
          mesaj('Pimler sokette (LGA). İşlemcinin altında yalnız düz pedler var. Tahmin et: işlemci ters tutulursa ne olur?', '');
        });
        return;
      }
      if (takili) m.userData.kapakGoster(false);
      m.userData.soketAc(false, sn(0.6)).then(function () {
        acik = false; mesgul = false; bAc.querySelector('span').textContent = 'Soketi aç';
        mesaj(takili ? 'Yük plakası işlemciyi eşit bastırdı; koruma kapağı çıktı. Kapağı sakla: işlemcisiz kartı korur.' : 'Soket kapalı; koruma kapağı pimleri korur.', takili ? 'dogru' : '');
        if (takili) D.ses('klik');
      });
    }
    function tersDene() {
      if (mesgul) return;
      if (!acik) { mesaj('Önce soketi aç.', 'yanlis'); return; }
      if (takili) { mesaj('İşlemci zaten takılı. “Baştan” ile yeniden dene.', ''); return; }
      mesgul = true; temizle();
      var c = cpuHazir(CPU_DOGRU + Math.PI);
      etiketler.push(s.etiket(c, 'Üçgen karşı köşede', { tur: 'hata' }));
      mesaj('İşlemci 180° ters tutuldu, yuvaya indiriliyor…', '');
      D.git(c, new V3(0, SOKET_Y + 0.55, 0), sn(0.9)).then(function () {
        D.ses('hata');
        return D.uyari(c, { etiket: false, genlik: 0.12 });
      }).then(function () {
        mesaj('Oturmadı: kenar çentikleri soketin çıkıntılarına denk gelmiyor. Zorlanırsa pimler eğilir; bu hasar kart değişimi demektir.', 'yanlis');
        return D.git(c, new V3(0, SOKET_Y + 4, 0), sn(0.7));
      }).then(function () { c.visible = false; temizle(); mesgul = false; });
    }
    function dogruTak() {
      if (mesgul) return;
      if (!acik) { mesaj('Önce soketi aç.', 'yanlis'); return; }
      if (takili) { mesaj('İşlemci takılı. Şimdi soketi kapat.', ''); return; }
      mesgul = true; temizle();
      var c = cpuHazir(CPU_DOGRU);
      D.vurgula(so.ucgen, { etiket: false });
      etiketler.push(s.etiket(c, 'Üçgen · aynı köşe', { tur: 'vurgu' }));
      mesaj('Üçgenler aynı köşede; işlemci kenarlarından tutulup düz indiriliyor…', '');
      D.git(c, new V3(0, SOKET_Y + 0.6, 0), sn(0.9)).then(function () {
        return D.git(c, new V3(0, SOKET_Y, 0), sn(0.5));
      }).then(function () {
        D.ses('klik'); takili = true; mesgul = false; temizle();
        mesaj('İşlemci kendi ağırlığıyla oturdu; bastırılmadı. Şimdi “Soketi kapat”: plaka ve kol kilitlenir.', 'dogru');
      });
    }
    function bastan() {
      if (mesgul) return;
      temizle(); takili = false;
      if (cpu) cpu.visible = false;
      m.userData.kapakGoster(true);
      if (acik) { mesgul = true; m.userData.soketAc(false, sn(0.4)).then(function () { acik = false; mesgul = false; bAc.querySelector('span').textContent = 'Soketi aç'; }); }
      mesaj('Baştan: soket kapalı, koruma kapağı takılı.', '');
    }
    bAc = s.dugme('Soketi aç', 'oynat', acKapa, { yer: 'alt-orta', aciklama: 'Kilit kolunu kaldırıp soketi aç ya da kapat' });
    s.dugme('Ters dene', null, tersDene, { yer: 'alt-orta', aciklama: 'İşlemciyi 180 derece ters takmayı dene' });
    s.dugme('Doğru tak', null, dogruTak, { yer: 'alt-orta', aciklama: 'İşlemciyi köşe üçgenini hizalayarak tak' });
    s.dugme('Baştan', 'tekrar', bastan, { yer: 'alt-orta', aciklama: 'Soketi başlangıç durumuna getir' });
    mesaj('Soket kapalı; koruma kapağı pimleri korur. “Soketi aç” ile başla.', '');
    s._h05 = { acKapa: acKapa, tersDene: tersDene, dogruTak: dogruTak, durum: function () { return { acik: acik, takili: takili, mesgul: mesgul }; } };
  });

  /* ─────────── Adım 3: çipset şeması (2D, A-AKIS) + bağlantı paylaşımı ─────────── */
  (function () {
    var kok = document.getElementById('cipset');
    if (!kok) return;
    var LINK = 3.9;                                   // örnek: PCIe 3.0 x4 genişliğinde çipset bağlantısı ≈ 3,9 GB/s
    function kutu(x, y, w, h, renk, bas, alt, sinif) {
      return '<g class="' + (sinif || '') + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + renk + '"/>' +
        '<text x="' + (x + w / 2) + '" y="' + (y + (alt ? h / 2 - 2 : h / 2 + 4)) + '" class="cs-b" text-anchor="middle">' + bas + '</text>' +
        (alt ? '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 10) + '" class="cs-k" text-anchor="middle">' + alt + '</text>' : '') + '</g>';
    }
    function yol(d, sinif, kal, etiket, ex, ey) {
      return '<g class="' + sinif + '"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="' + kal + '" stroke-linecap="round"/>' +
        '<path class="cs-akis" d="' + d + '" fill="none" stroke="#fff" stroke-width="' + Math.max(1.5, kal / 3) + '" stroke-dasharray="3 11" stroke-linecap="round"/>' +
        (etiket ? '<text x="' + ex + '" y="' + ey + '" class="cs-y" text-anchor="middle">' + etiket + '</text>' : '') + '</g>';
    }
    var ALT = [['SATA ×4', 'disk, SSD'], ['M.2_2', 'x4 / SATA'], ['PCIE_2–4', 'x1, x4'], ['USB', 'ön + arka'], ['Ağ', 'Ethernet'], ['Ses', 'codec']];
    var svg = '<svg class="cs-svg" viewBox="0 0 400 252" role="img" aria-label="Blok şema: RAM, PCIE_1 x16 ve M.2_1 doğrudan işlemciye bağlı; SATA, M.2_2, ek PCIe yuvaları, USB, ağ ve ses çipsete bağlı; çipset işlemciye tek bir bağlantıyla bağlanır">';
    svg += yol('M106 40H140', 'yol-d', 7, 'bellek', 123, 31) + yol('M260 40H294', 'yol-d', 8, 'x16', 277, 31) + yol('M248 66C258 84 272 92 294 92', 'yol-d', 5, 'x4', 262, 94);
    svg += yol('M200 66V134', 'yol-c cs-link', 9, '', 0, 0);
    ALT.forEach(function (a, i) {
      var cx = 12 + i * 64 + 29;
      svg += yol('M200 170C200 186 ' + cx + ' 184 ' + cx + ' 204', 'yol-c', 3.5, '', 0, 0);
    });
    svg += kutu(14, 18, 92, 44, '#0f766e', 'RAM (DDR4)', 'çift kanal', 'kut-d');
    svg += kutu(140, 14, 120, 52, '#4f46e5', 'İşlemci', 'PCIe · bellek denetimi', 'kut-cpu');
    svg += kutu(294, 18, 92, 44, '#b45309', 'PCIE_1', 'ekran kartı', 'kut-d');
    svg += kutu(294, 74, 92, 36, '#be185d', 'M.2_1', 'NVMe SSD', 'kut-d');
    svg += '<g class="cs-link-yazi"><rect x="30" y="84" width="156" height="34" rx="8" fill="#fff" stroke="#94a3b8"/><path d="M186 101H196" stroke="#94a3b8"/>' +
      '<text x="108" y="98" class="cs-k2" text-anchor="middle">çipset bağlantısı (tek yol)</text><text x="108" y="111" class="cs-k2 cs-hiz" text-anchor="middle">örnek: PCIe 3.0 x4 ≈ 3,9 GB/s</text></g>';
    svg += kutu(150, 134, 100, 36, '#475569', 'Çipset', 'yonga seti', 'kut-c');
    ALT.forEach(function (a, i) { svg += kutu(12 + i * 64, 204, 58, 40, '#64748b', a[0], a[1], 'kut-c kut-alt'); });
    svg += '</svg>';
    var CIHAZ = [
      { ad: 'M.2_2 SSD kopyalama', gb: 3.5, renk: '#be185d' },
      { ad: 'USB 3 harici disk', gb: 1.1, renk: '#0e7490' },
      { ad: 'SATA SSD', gb: 0.55, renk: '#65a30d' },
      { ad: '2,5 Gb/s ağ', gb: 0.3, renk: '#b45309' }
    ];
    kok.innerHTML = '<div class="cs-mod"></div><div class="cs-sahne">' + svg + '</div><div class="cs-pay" hidden><div class="cs-cihaz"></div>' +
      '<div class="cs-bar-kap"><div class="cs-bar"></div><i class="cs-sinir"></i><span class="cs-sinir-yazi">3,9 GB/s sınır</span></div></div>' +
      '<div class="panel-sonuc cs-sonuc" aria-live="polite"></div>';
    var svgEl = kok.querySelector('svg'), pay = kok.querySelector('.cs-pay'), bar = kok.querySelector('.cs-bar'), sonuc = kok.querySelector('.cs-sonuc');
    var OLCEK = 6, acik = [true, false, false, false];
    var seg = CIHAZ.map(function (c) { var s = el('i', 'cs-seg', bar); s.style.background = c.renk; return s; });
    var cipGrup = kok.querySelector('.cs-cihaz');
    var cipler = CIHAZ.map(function (c, i) {
      var b = el('button', 'cs-cip', cipGrup);
      b.type = 'button';
      b.innerHTML = '<i></i><span></span><b></b>';
      b.firstChild.style.background = c.renk; b.children[1].textContent = c.ad; b.children[2].textContent = '≈ ' + sayi(c.gb, c.gb < 1 ? 2 : 1) + ' GB/s';
      b.addEventListener('click', function () { acik[i] = !acik[i]; payCiz(); });
      return b;
    });
    kok.querySelector('.cs-sinir').style.left = (LINK / OLCEK * 100) + '%';
    kok.querySelector('.cs-sinir-yazi').style.left = (LINK / OLCEK * 100) + '%';
    function payCiz() {
      var top = 0;
      CIHAZ.forEach(function (c, i) {
        cipler[i].setAttribute('aria-pressed', acik[i] ? 'true' : 'false');
        seg[i].style.width = acik[i] ? (c.gb / OLCEK * 100) + '%' : '0%';
        if (acik[i]) top += c.gb;
      });
      var dar = top > LINK;
      bar.classList.toggle('dolu', dar);
      svgEl.classList.toggle('darbogaz', dar);
      sonuc.textContent = dar ? 'Toplam ≈ ' + sayi(top, 1) + ' GB/s > 3,9 GB/s: çipset bağlantısı doldu, aygıtlar sırayla bekler (darboğaz). M.2_1 işlemciye doğrudan bağlı olduğu için bu yolu paylaşmaz.'
        : 'Toplam ≈ ' + sayi(top, 1) + ' GB/s: tek yola sığıyor. Aygıt ekle: ne zaman sınır aşılır?';
    }
    var MOD = [
      ['Hepsi', 'hepsi', 'Mavi yollar doğrudan işlemciye, gri yollar önce çipsete gider. Çipset hepsini tek bir bağlantıyla işlemciye taşır.'],
      ['Doğrudan', 'dogrudan', 'Doğrudan: RAM (bellek denetleyicisi işlemcide), ekran kartı yuvası (x16) ve M.2_1 (x4). En hızlı ve gecikmesi en az yollar.'],
      ['Çipset', 'cipset', 'Çipset: SATA, M.2_2, ek PCIe yuvaları, USB, ağ ve ses. Hepsi aynı çipset bağlantısını paylaşır.'],
      ['Paylaşım', 'paylasim', '']
    ];
    secGrup(kok.querySelector('.cs-mod'), MOD.map(function (x) { return x[0]; }), function (i) {
      svgEl.setAttribute('data-mod', MOD[i][1]);
      pay.hidden = i !== 3;
      if (i === 3) payCiz(); else { svgEl.classList.remove('darbogaz'); sonuc.textContent = MOD[i][2]; }
    }, { baslangic: 0, aria: 'Yol türü' });
    svgEl.setAttribute('data-mod', 'hepsi');
    sonuc.textContent = MOD[0][2];
    kok._h05 = { acik: acik, payCiz: payCiz };
  })();

  /* ─────────── Adım 4: kılavuz satırı → yuva (A-KAMERA-TUR) + M.2 SSD takılışı ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var a = kartSahnesi(kap);
    var s = a.s, m = a.m;
    var bolge = merkez(['pcie-x16-1', 'pcie-x16-2', 'm2-1', 'm2-2'].map(function (n) { return m.getObjectByName(n); }));
    odak(s, bolge.add(new V3(1.5, 0, 0)), [0.3, 1.35, 1], 0.52);
    var mesaj = DERS.sahneMesaj(s), tablo = document.getElementById('kt-tablo');
    var etiketler = [], secili = [], jeton = 0, ssdler = {};
    var SEC = {
      p1: { parca: ['pcie-x16-1'], etiket: ['PCIE_1 · 4.0 x16 · işlemci'], theta: 0.3, phi: 0.8, yakin: 0.62,
        mesaj: 'PCIE_1: 16 hattın hepsi işlemciden gelir. Ekran kartı için önerilen yuva budur; metal zırh ağır kartı taşır.' },
      p2: { parca: ['pcie-x1-1', 'pcie-x1-2'], etiket: ['PCIE_2 · 3.0 x1', 'PCIE_4 · 3.0 x1'], theta: 0.3, phi: 0.8, yakin: 0.62,
        mesaj: 'PCIE_2 ve PCIE_4: tek hatlı, çipsete bağlı. Ağ, ses ya da yakalama kartı gibi küçük kartlar içindir.' },
      p3: { parca: ['pcie-x16-2'], etiket: ['PCIE_3 · boy x16 · hat x4'], theta: 0.3, phi: 0.8, yakin: 0.62,
        mesaj: 'PCIE_3 x16 boyunda ama yalnız 4 hat bağlı: x16 kart takılır, x4 hızında çalışır. Yuvanın boyu hızını göstermez.' },
      m1: { parca: ['m2-1'], etiket: ['M.2_1 · PCIe 4.0 x4 · işlemci'], theta: 0.35, phi: 0.72, yakin: 0.5, ssd: 0,
        mesaj: 'M.2_1 işlemciye bağlı: NVMe SSD için en hızlı yuva. SSD eğik girer, bastırılır ve ucundan vidalanır.' },
      m2: { parca: ['m2-2'], etiket: ['M.2_2 · PCIe 3.0 x4 / SATA'], theta: 0.35, phi: 0.72, yakin: 0.5, ssd: 1, sata: true,
        mesaj: 'M.2_2 çipsete bağlı. Kılavuza göre bu yuva kullanılınca SATA_3 ve SATA_4 devre dışı kalır (hat paylaşımı).' }
    };
    function temizle() {
      etiketler.forEach(function (e) { e.kaldir(); }); etiketler = [];
      secili.forEach(function (p) { D.vurguKaldir(p); }); secili = [];
    }
    function ssdTak(i, j) {
      var y = m.userData.m2[i], o = y.userData.oturma, vb = y.userData.vida.userData.bas;
      var ssd = ssdler[i];
      if (!ssd) { ssd = ssdler[i] = D.model('M-M2'); y.add(ssd); }
      ssd.visible = true;
      ssd.position.set(o.x + 1.4, o.y + 1.0, o.z); ssd.rotation.set(0, 0, 0.34);
      vb.position.y = 2.4;
      return D.git(ssd, new V3(o.x, o.y, o.z), sn(0.8)).then(function () {
        if (j !== jeton) return;
        return D.tween({ sahne: s, sure: sn(0.6), guncelle: function (e) { ssd.rotation.z = 0.34 * (1 - e); } });
      }).then(function () {
        if (j !== jeton) return;
        var r0 = vb.rotation.y;
        return D.tween({ sahne: s, sure: sn(1.0), guncelle: function (e) { vb.position.y = 2.4 - (2.4 - 0.43) * e; vb.rotation.y = r0 + e * Math.PI * 6; } });
      }).then(function () { if (j === jeton) D.ses('klik'); });
    }
    function sec(k) {
      var o = SEC[k], j = ++jeton;
      if (tablo) tablo.querySelectorAll('tbody tr').forEach(function (tr) { tr.classList.toggle('secili', tr.getAttribute('data-k') === k); });
      temizle();
      var ps = o.parca.map(function (n) { return m.getObjectByName(n); });
      var c = merkez(ps);
      mesaj(o.mesaj, '');
      s.kameraGit({ hedef: [c.x, c.y, c.z], yakinlik: o.yakin, theta: o.theta, phi: o.phi }, sn(0.9)).then(function () {
        if (j !== jeton) return;
        ps.forEach(function (p, i) {
          D.vurgula(p, { etiket: false }); secili.push(p);
          etiketler.push(s.etiket(p, o.etiket[i], { tur: 'vurgu' }));
        });
        if (o.sata) {
          var sa = m.getObjectByName('sata');
          D.vurgula(sa, { etiket: false, renk: '#ef4444' }); secili.push(sa);
          etiketler.push(s.etiket(sa, 'SATA_3 · SATA_4 kapanır', { tur: 'hata' }));
        }
        if (o.ssd != null) return ssdTak(o.ssd, j);
      });
    }
    if (tablo) tablo.querySelectorAll('tbody tr').forEach(function (tr) {
      tr.tabIndex = 0; tr.setAttribute('role', 'button');
      tr.addEventListener('click', function () { sec(tr.getAttribute('data-k')); });
      tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sec(tr.getAttribute('data-k')); } });
    });
    s.dugme('Genel görünüm', 'tekrar', function () {
      jeton++; temizle();
      if (tablo) tablo.querySelectorAll('tbody tr').forEach(function (tr) { tr.classList.remove('secili'); });
      s.sifirla(); mesaj('Soldaki kılavuz satırına dokun.', '');
    }, { yer: 'alt-orta', aciklama: 'Kamerayı genel görünüme döndür' });
    mesaj('Soldaki kılavuz satırına dokun: kamera o yuvaya gider.', '');
    bekle(0.6).then(function () { if (!jeton) sec('p1'); });
    s._h05 = { sec: sec };
  });

  /* ─────────── Adım 5: 24-pin ATX ve 8-pin EPS başlıklara (A-FIS) + güç akışı ─────────── */
  function portYap(baslik, xEks, yEks) {
    var p = new THREE.Object3D();
    var zEks = new V3(0, 1, 0);
    p.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xEks, yEks, zEks));
    p.position.set(0, 1.25, 0);
    baslik.add(p);
    return p;
  }
  D.tembel('#s9-3d', function (kap) {
    var a = kartSahnesi(kap);
    var s = a.s, m = a.m;
    cpuTak(m); ramTak(m, [1, 3]);
    var eps8 = m.getObjectByName('eps8'), atx24 = m.getObjectByName('atx24');
    odak(s, merkez([eps8, atx24, m.userData.soket.grup]).add(new V3(0, 0, 1.5)), [0.25, 1.25, 1], 0.6);
    // Başlık ağızları: yerel +Z yukarı (fiş −Y dünya yönünde iner), yerel +Y kilit tarafı
    var portlar = {
      eps: portYap(eps8, new V3(-1, 0, 0), new V3(0, 0, 1)),        // EPS başlığının kilidi +Z tarafında
      atx: portYap(atx24, new V3(0, 0, -1), new V3(-1, 0, 0))       // 24-pin başlığının kilidi −X (kartın içi) tarafında
    };
    var fisler = {
      eps: D.model('M-KABLO-GUC', { tur: 'eps', kabloUzun: 5 }),
      atx: D.model('M-KABLO-GUC', { tur: 'atx24', kabloUzun: 5 })
    };
    Object.keys(fisler).forEach(function (k) { m.add(fisler[k]); fisler[k].visible = false; });
    var takili = { eps: false, atx: false }, mesgul = false, etiketler = [];
    var mesaj = DERS.sahneMesaj(s), dugme = {};
    function temizle() { etiketler.forEach(function (e) { e.kaldir(); }); etiketler = []; }
    var AD = { eps: '8-pin EPS · CPU_PWR', atx: '24-pin ATX · ATX_PWR' };
    function tak(k) {
      if (mesgul) return;
      mesgul = true; temizle();
      var f = fisler[k], p = portlar[k];
      if (takili[k]) {
        D.fisCikar(f, p, 5).then(function () { f.visible = false; takili[k] = false; mesgul = false; yaz(); mesaj(AD[k] + ' çıkarıldı: önce kilit tırnağına bas, sonra düz çek.', ''); });
        return;
      }
      f.visible = true;
      D.vurgula(k === 'eps' ? eps8 : atx24, { etiket: false });
      etiketler.push(s.etiket(k === 'eps' ? eps8 : atx24, AD[k], { tur: 'vurgu', yer: 'alt' }));
      mesaj(AD[k] + ': kilit tırnağı başlıktaki çıkıntıya bakacak biçimde hizalandı…', '');
      D.fisTak(f, p, { bas: 5 }).then(function () {
        D.vurguKaldir(k === 'eps' ? eps8 : atx24);
        takili[k] = true; yaz();
        if (k === 'eps') {
          mesaj('Tık! EPS oturdu. +12 V → VRM → soket: VRM gerilimi işlemcinin istediği 1 V dolayına indirir.', 'dogru');
          D.vurgula(m.getObjectByName('vrm'), { etiket: 'VRM' });
          return akis(s, m.userData.yol('guc'), '#eab308').then(function () { D.vurguKaldir(m.getObjectByName('vrm')); });
        }
        mesaj('Tık! 24-pin oturdu. Anakartın tamamı, çipset, RAM ve yuvalar bu girişten beslenir.', 'dogru');
        return akis(s, m.userData.yol('atx'), '#f97316');
      }).then(function () { mesgul = false; temizle(); });
    }
    function tersDene() {
      if (mesgul) return;
      var k = !takili.eps ? 'eps' : (!takili.atx ? 'atx' : null);
      if (!k) { mesaj('İki konnektör de takılı. Birini çıkarıp ters dene.', ''); return; }
      mesgul = true; temizle();
      var f = fisler[k];
      f.visible = true;
      etiketler.push(s.etiket(k === 'eps' ? eps8 : atx24, 'Kilit ters tarafta', { tur: 'hata', yer: 'alt' }));
      mesaj(AD[k] + ' 180° ters tutuldu…', '');
      D.fisTak(f, portlar[k], { ters: true, bas: 5 }).then(function () {
        mesaj('Girmedi: kilit tırnağı ve pim kulelerinin biçimi yalnız tek yöne izin verir. Zorlanmaz; çevrilip yeniden hizalanır.', 'yanlis');
        return D.bekle(0.9, s);
      }).then(function () { f.visible = false; mesgul = false; temizle(); });
    }
    function gucVer() {
      if (mesgul) return;
      if (!takili.atx) { mesaj(takili.eps ? 'Ana güç (24-pin) yok: anakart ve fanlar çalışmaz. EPS tek başına yetmez.' : 'Hiçbir güç kablosu takılı değil: anakart güç almıyor.', 'yanlis'); return; }
      if (!takili.eps) { mesaj('Fanlar dönüyor ama işlemci beslenmiyor: açılış testi (POST) geçmez, ekran gelmez. EPS’i tak.', 'yanlis'); return; }
      mesaj('✔ İki giriş de takılı: işlemci ve anakart besleniyor, açılış testi (POST) başlayabilir.', 'dogru');
      D.ses('klik');
      akis(s, m.userData.yol('guc'), '#eab308'); akis(s, m.userData.yol('atx'), '#f97316');
    }
    function yaz() {
      dugme.eps.querySelector('span').textContent = takili.eps ? 'EPS çıkar' : 'EPS tak';
      dugme.atx.querySelector('span').textContent = takili.atx ? '24-pin çıkar' : '24-pin tak';
    }
    dugme.eps = s.dugme('EPS tak', null, function () { tak('eps'); }, { yer: 'alt-orta', aciklama: '8-pin EPS konnektörünü CPU_PWR girişine tak ya da çıkar' });
    dugme.atx = s.dugme('24-pin tak', null, function () { tak('atx'); }, { yer: 'alt-orta', aciklama: '24-pin ATX konnektörünü ATX_PWR girişine tak ya da çıkar' });
    s.dugme('Ters dene', null, tersDene, { yer: 'alt-orta', aciklama: 'Konnektörü ters yönde takmayı dene' });
    s.dugme('Güç ver', 'oynat', gucVer, { yer: 'alt-orta', aciklama: 'Güç düğmesine bas: hangi girişler takılıysa sonucu gör' });
    etiketler.push(s.etiket(eps8, 'CPU_PWR (8-pin EPS)', { tur: 'vurgu', yer: 'alt' }));
    etiketler.push(s.etiket(atx24, 'ATX_PWR (24-pin)', { tur: 'vurgu', yer: 'alt' }));
    mesaj('Tahmin et: yalnız 24-pin takılıysa “Güç ver” ne olur? Önce dene, sonra EPS’i tak.', '');
    s._h05 = { tak: tak, tersDene: tersDene, gucVer: gucVer, takili: takili, mesgul: function () { return mesgul; } };
  });

  /* ─────────── Adım 6: arka panel ve ön panel başlıkları (A-KAMERA-TUR + E-BILGI) ─────────── */
  D.tembel('#s10-3d', function (kap) {
    var a = kartSahnesi(kap);
    var s = a.s, m = a.m, T = m.userData.olcu.T;
    var mesaj = DERS.sahneMesaj(s);
    D.bilgi(s, m.userData.portlar.map(function (p) { return p.name; }).concat(['on-panel', 'usb-baslik', 'fan-baslik']));
    // Ön panel başlıklarının tek tek gösterimi için işaret halkaları (on-panel tek parça olduğundan)
    function halka(x, z, w, d) {
      var h = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, 1.0, d)), new THREE.LineBasicMaterial({ color: 0xf59e0b }));
      h.position.set(x, T + 0.5, z); h.visible = false; h.userData.secilmez = true;
      m.add(h);
      return h;
    }
    var HALKA = { fpanel: halka(8.6, 14.3, 1.9, 1.2), fusb: halka(5.4, 14.3, 1.9, 1.2), fses: halka(-9.6, 14.3, 1.9, 1.2) };
    var sema = fpanelSema(s.arayuz);
    sema.hidden = true;
    var etiketler = [], vurgular = [], dugmeler = {}, jeton = 0;
    function temizle() {
      etiketler.forEach(function (e) { e.kaldir(); }); etiketler = [];
      vurgular.forEach(function (p) { D.vurguKaldir(p); }); vurgular = [];
      Object.keys(HALKA).forEach(function (k) { HALKA[k].visible = false; });
      sema.hidden = true;
    }
    var DURAK = {
      arka: { hedef: function () { return merkez([m.getObjectByName('arka-panel')]); }, yakin: 0.5, theta: -1.45, phi: 1.15,
        metin: 'Arka panel: USB 2.0 ve USB 3, USB-C, HDMI, DisplayPort, ağ (RJ45) ve ses. Porta dokun: adı ve görevi açılır.',
        kur: function () { if (!AZ) D.siraylaVurgula(['usba-1', 'usbc', 'hdmi', 'dp', 'rj45', 'ses-yesil'].map(function (n) { return m.getObjectByName('port-' + n); }), { bekle: 0.8 }); } },
      fpanel: { hedef: function () { return m.localToWorld(new V3(8.6, 0, 14.3)); }, yakin: 0.3, theta: 0.2, phi: 0.75,
        metin: 'F_PANEL: kasanın güç ve sıfırlama düğmeleri ile güç ve disk LED’leri. Pim şemasını oku; LED’de + ucu işaretli pime gelir.',
        kur: function () { HALKA.fpanel.visible = true; etiketler.push(s.etiket(HALKA.fpanel, 'F_PANEL', { tur: 'vurgu' })); sema.hidden = false; } },
      usb: { hedef: function () { return m.localToWorld(new V3(8.5, 0, 8.5)); }, yakin: 0.55, theta: 0.5, phi: 0.8,
        metin: 'USB3 (19 pin, mavi) ön paneldeki hızlı USB’ler; F_USB (9 pin) ön USB 2.0 içindir. Her ikisinde de eksik pim yönü belirler.',
        kur: function () {
          var u = m.getObjectByName('usb-baslik'); D.vurgula(u, { etiket: false }); vurgular.push(u);
          etiketler.push(s.etiket(u, 'USB3 · 19 pin', { tur: 'vurgu' }));
          HALKA.fusb.visible = true; etiketler.push(s.etiket(HALKA.fusb, 'F_USB · 9 pin', { tur: 'vurgu' }));
        } },
      ses: { hedef: function () { return m.localToWorld(new V3(-9.6, 0, 13.6)); }, yakin: 0.3, theta: 0.2, phi: 0.75,
        metin: 'F_AUDIO: ön paneldeki kulaklık ve mikrofon girişleri. Ses bölümü kartın sol alt köşesindedir.',
        kur: function () { HALKA.fses.visible = true; etiketler.push(s.etiket(HALKA.fses, 'F_AUDIO', { tur: 'vurgu' })); } },
      fan: { hedef: function () { return merkez([m.getObjectByName('fan-baslik')]); }, yakin: 0.3, theta: 0.35, phi: 0.75,
        metin: 'CPU_FAN (4 pin): işlemci soğutucusunun fanı buraya takılır. Dördüncü pin (PWM) fan hızını ayarlar; takılmazsa kart uyarı verir.',
        kur: function () { var f = m.getObjectByName('fan-baslik'); D.vurgula(f, { etiket: false }); vurgular.push(f); etiketler.push(s.etiket(f, 'CPU_FAN · 4 pin', { tur: 'vurgu' })); } }
    };
    function git(k) {
      var d = DURAK[k], j = ++jeton;
      Object.keys(dugmeler).forEach(function (x) { dugmeler[x].classList.toggle('don3d-dugme--secili', x === k); });
      temizle();
      mesaj(d.metin, '');
      var c = d.hedef();
      s.kameraGit({ hedef: [c.x, c.y, c.z], yakinlik: d.yakin, theta: d.theta, phi: d.phi }, sn(1.1)).then(function () { if (j === jeton) d.kur(); });
    }
    [['arka', 'Arka panel'], ['fpanel', 'F_PANEL'], ['usb', 'USB'], ['ses', 'F_AUDIO'], ['fan', 'CPU_FAN']].forEach(function (x) {
      dugmeler[x[0]] = s.dugme(x[1], null, function () { git(x[0]); }, { yer: 'alt-orta', aciklama: x[1] + ' bölgesine git' });
    });
    mesaj('Bir düğme seç: kamera o bölgeye gider.', '');
    bekle(0.6).then(function () { if (!jeton) git('arka'); });
    s._h05 = { git: git };
  });

  /* ─────────── Etkinlik 1: E-AV — kılavuzdaki bağlantıyı 3D anakartta bul ─────────── */
  var SORULAR = [
    { kod: 'CPU_PWR', ac: '8-pin 12 V işlemci güç girişi', sayfa: 's. 14', dogru: ['eps8'], ipucu: 'Soketin üstünde, kartın üst kenarında 2 × 4 delikli siyah blok.', bilgi: 'EPS (4+4) kablosu buraya takılır.' },
    { kod: 'ATX_PWR', ac: '24-pin ana güç girişi', sayfa: 's. 14', dogru: ['atx24'], ipucu: 'Sağ kenarda, RAM yuvalarının yanında uzun siyah blok.', bilgi: 'Anakartın tamamı buradan beslenir.' },
    { kod: 'DIMM_A2', ac: 'Tek modülde önerilen RAM yuvası', sayfa: 's. 9', dogru: ['ram-yuvasi-2'], ipucu: 'Sokete en yakın yuva DIMM_A1; A2 onun hemen yanındaki.', bilgi: 'İki modülde A2 ve B2 kullanılır.' },
    { kod: 'PCIE_1', ac: 'İşlemciye bağlı PCIe 4.0 x16', sayfa: 's. 11', dogru: ['pcie-x16-1'], ipucu: 'Sokete en yakın, metal zırhlı uzun yuva.', bilgi: 'Ekran kartı için önerilen yuva.' },
    { kod: 'M.2_2', ac: 'Çipsete bağlı ikinci M.2 yuvası', sayfa: 's. 12', dogru: ['m2-2'], ipucu: 'İki uzun PCIe yuvasının arasında; ucunda vida ayağı var.', bilgi: 'Kullanılınca SATA_3 ve SATA_4 kapanır.' },
    { kod: 'F_PANEL', ac: 'Ön panel düğme ve LED başlığı', sayfa: 's. 16', dogru: ['on-panel'], ipucu: 'Kartın alt kenarında, sağ tarafta küçük pim grubu.', bilgi: 'Güç, sıfırlama ve LED kabloları.' },
    { kod: 'USB3', ac: 'Ön USB 3 başlığı (19 pin)', sayfa: 's. 16', dogru: ['usb-baslik'], ipucu: 'Sağ kenarda, 24-pin’in altında mavi blok.', bilgi: 'Kasanın ön USB 3 kablosu.' },
    { kod: 'BAT', ac: 'CMOS pili (CR2032)', sayfa: 's. 17', dogru: ['cmos-pili'], ipucu: 'Alt yarıda, madeni para büyüklüğünde yuvarlak pil.', bilgi: 'Kapalıyken saati ve ayarları korur.' }
  ];
  D.tembel('#s11-3d', function (kap) {
    var a = kartSahnesi(kap, { kamera: { yon: [0.3, 1.35, 1], pay: 0.92, hedefOfset: [0, 0, -1.5] } });
    var s = a.s, m = a.m, n = SORULAR.length;
    kap.classList.add('av-sahne');
    s._secimFiltresi = m.userData.parcalar.concat(['ram-yuvasi-1', 'ram-yuvasi-2', 'ram-yuvasi-3', 'ram-yuvasi-4']);
    var kart = D.div('av-soru', s.arayuz);
    kart.setAttribute('aria-live', 'polite');
    kart.innerHTML = '<span class="av-no"></span><span class="av-metin"><small></small><b><code class="av-kod"></code> <span class="av-ac"></span></b></span>';
    var noEl = kart.querySelector('.av-no'), kodEl = kart.querySelector('.av-kod'), acEl = kart.querySelector('.av-ac'), altEl = kart.querySelector('.av-metin small');
    var semaEl = D.div('av-sema', s.arayuz);
    semaEl.innerHTML = '<div class="av-sema-bas">Kılavuz · yerleşim şeması</div><div class="av-sema-ic"><!--@dahil:yedek-anakart.svg--></div>';
    semaEl.hidden = true;
    var mesaj = DERS.sahneMesaj(s), ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var liste = document.getElementById('av-liste'), maddeler = [];
    if (liste) {
      liste.innerHTML = '';
      SORULAR.forEach(function (q) {
        var li = el('li', '', liste);
        li.innerHTML = '<span class="g-isaret"></span><span></span>';
        li.lastChild.textContent = q.kod;
        maddeler.push(li);
      });
    }
    var i = 0, yanlis = 0, toplamYanlis = 0, bitti = false, mesgul = false, yardim = null, bYeniden = null;
    function goster() {
      var q = SORULAR[i];
      noEl.textContent = (i + 1) + '/' + n;
      kodEl.textContent = q.kod; acEl.textContent = '· ' + q.ac;
      altEl.textContent = 'Kılavuz ' + q.sayfa + ' · Bul ve dokun';
      maddeler.forEach(function (li, k) { li.classList.toggle('simdi', k === i); });
      yanlis = 0;
    }
    function ileri() {
      i++;
      if (i < n) { goster(); mesaj('Sıradaki kılavuz satırı.', ''); return; }
      bitti = true;
      kart.classList.add('av-soru--bitti');
      noEl.textContent = '✓'; kodEl.textContent = ''; acEl.textContent = 'Hepsini buldun!';
      altEl.textContent = 'Yanlış dokunuş: ' + toplamYanlis;
      mesaj('✔ Sekiz bağlantının hepsini kılavuzdan okuyup kartta buldun. Yanlış dokunuş: ' + toplamYanlis, 'dogru');
      DERS.konfeti();
      if (bYeniden) bYeniden.hidden = false;
    }
    s.tiklaninca(function (p, e) {
      if (bitti || mesgul) return;
      var q = SORULAR[i];
      // RAM bölgesinin ortak vuruş kutusu tek yuvayı örter: tıklanan noktadaki yuvayı ayrıca bul
      if (p && p.name === 'ram-yuvalari' && e) { var y = s.secilen(e.clientX, e.clientY, m.userData.yuvalar); if (y) p = y; }
      if (!p) { mesaj('Bir parçaya dokun. Kartı sürükleyerek döndürebilirsin.', ''); return; }
      var ad = KILAVUZ_AD[p.name] || p.userData.etiket;
      if (q.dogru.indexOf(p.name) >= 0) {
        mesgul = true; D.ses('klik');
        if (yardim) { D.vurguKaldir(yardim); yardim = null; }
        D.vurgula(p, { renk: '#10b981', etiket: '✓ ' + q.kod });
        if (maddeler[i]) maddeler[i].classList.add('tamam');
        ilerle(i + 1, n);
        mesaj('✔ Doğru: ' + q.kod + '. ' + q.bilgi, 'dogru');
        D.bekle(sn(1.3), s).then(function () { D.vurguKaldir(p); mesgul = false; ileri(); });
        return;
      }
      yanlis++; toplamYanlis++;
      D.ses('hata');
      if (p !== yardim) {
        D.vurgula(p, { renk: '#ef4444', etiket: '✗ ' + ad });
        D.bekle(sn(1.1), s).then(function () { if (p !== yardim) D.vurguKaldir(p); });
      }
      if (yanlis >= 3) {
        if (!yardim) { yardim = m.getObjectByName(q.dogru[0]); D.vurgula(yardim, { etiket: 'Burada → dokun' }); }
        mesaj('İşte burada! Parlayan bağlantıya dokun.', 'yanlis');
      } else if (yanlis === 2) {
        altEl.textContent = 'İpucu: ' + q.ipucu;
        mesaj('✗ Bu: ' + ad + '. İpucu: ' + q.ipucu, 'yanlis');
      } else {
        mesaj('✗ Bu: ' + ad + '. Kılavuzdaki adı yeniden oku.', 'yanlis');
      }
    });
    function yeniden() {
      if (mesgul) return;
      if (yardim) { D.vurguKaldir(yardim); yardim = null; }
      i = 0; toplamYanlis = 0; bitti = false;
      kart.classList.remove('av-soru--bitti');
      maddeler.forEach(function (li) { li.classList.remove('tamam', 'simdi'); });
      ilerle(0, n);
      if (bYeniden) bYeniden.hidden = true;
      s.sifirla(); goster();
      mesaj('Kılavuz avı yeniden başladı.', '');
    }
    var bSema = s.dugme('Şema', null, function () {
      semaEl.hidden = !semaEl.hidden;
      bSema.classList.toggle('don3d-dugme--secili', !semaEl.hidden);
    }, { yer: 'alt-orta', aciklama: 'Kılavuzun yerleşim şemasını aç ya da kapat' });
    s.dugme('İpucu', null, function () {
      if (bitti) return;
      altEl.textContent = 'İpucu: ' + SORULAR[i].ipucu;
      mesaj('İpucu: ' + SORULAR[i].ipucu, '');
    }, { yer: 'alt-orta', aciklama: 'Aranan bağlantı için ipucu göster' });
    bYeniden = s.dugme('Yeniden', 'tekrar', yeniden, { yer: 'alt-orta', aciklama: 'Kılavuz avını baştan başlat' });
    bYeniden.hidden = true;
    goster();
    mesaj('Kılavuz satırını oku; bağlantıyı kartta bul ve dokun.', '');
    s._h05 = { SORULAR: SORULAR, durum: function () { return { i: i, bitti: bitti, mesgul: mesgul }; } };
  });

  /* ─────────── Etkinlik 2: kılavuz okuma (marka-nötr örnek kılavuz) ─────────── */
  (function () {
    var kok = document.getElementById('kilavuz');
    if (!kok) return;
    var foto = kok.querySelector('.foto-kart');
    function tablo(satirlar, bas) {
      return '<table class="kl-tablo">' + (bas ? '<thead><tr>' + bas.map(function (b) { return '<th>' + b + '</th>'; }).join('') + '</tr></thead>' : '') +
        '<tbody>' + satirlar.map(function (r) { return '<tr>' + r.map(function (c, i) { return (i ? '<td>' : '<th>') + c + (i ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    }
    var SEKME = [
      { ad: 'Özellikler', bas: '1-1 Özellikler', html: tablo([
        ['Form faktörü', 'ATX, 30,5 × 24,4 cm'],
        ['İşlemci', 'LGA soket; desteklenen işlemciler için destek listesine bakın'],
        ['Çipset', 'Orta seviye çipset'],
        ['Bellek', '4 × DDR4 DIMM, çift kanal, en çok 128 GB'],
        ['Depolama', '2 × M.2 (M anahtar, 2242/2260/2280), 4 × SATA 6 Gb/s'],
        ['Arka panel', '2 × USB 2.0, 4 × USB 3, 1 × USB-C, HDMI, DisplayPort, RJ45, 3 × ses']]) },
      { ad: 'Yuvalar', bas: '1-4 Genişleme ve depolama yuvaları', html: tablo([
        ['PCIE_1', 'x16 / x16', 'PCIe 4.0', 'İşlemci'],
        ['PCIE_2, PCIE_4', 'x1 / x1', 'PCIe 3.0', 'Çipset'],
        ['PCIE_3', 'x16 / x4', 'PCIe 3.0', 'Çipset'],
        ['M.2_1', 'M anahtar · x4', 'PCIe 4.0', 'İşlemci'],
        ['M.2_2', 'M anahtar · x4 / SATA', 'PCIe 3.0', 'Çipset']], ['Yuva', 'Boy / hat', 'Nesil', 'Kaynak']) +
        '<ol class="kl-not"><li>İki bellek modülü takılacaksa DIMM_A2 ve DIMM_B2 yuvalarını kullanın.</li>' +
        '<li>M.2_2 yuvası kullanıldığında SATA_3 ve SATA_4 devre dışı kalır.</li>' +
        '<li>Ekran kartını PCIE_1 yuvasına takın.</li></ol>' },
      { ad: 'Başlıklar', bas: '1-6 İç bağlantılar', html: tablo([
        ['ATX_PWR', '24-pin ana güç girişi'], ['CPU_PWR', '8-pin 12 V işlemci güç girişi'], ['CPU_FAN', '4-pin işlemci fanı (PWM)'],
        ['F_USB / USB3', 'Ön USB 2.0 (9 pin) / ön USB 3 (19 pin)'], ['F_AUDIO', 'Ön panel ses'], ['BAT', 'CMOS pili, CR2032']]) + '<div class="kl-fp"></div>' }
    ];
    kok.innerHTML = '<div class="kl"><div class="kl-kitap"><div class="kl-ust"><b>Anakart Kılavuzu</b><span>Bölüm 1 · Donanım</span></div>' +
      '<div class="kl-sekme"></div><div class="kl-sayfa" tabindex="0" aria-live="polite"></div></div>' +
      '<div class="kl-sag"><div class="kl-gorev" aria-live="polite"></div><div class="kl-alt"></div></div></div>';
    var sayfa = kok.querySelector('.kl-sayfa'), gorevEl = kok.querySelector('.kl-gorev');
    if (foto) kok.querySelector('.kl-alt').appendChild(foto);
    function sekmeGoster(i) {
      sayfa.innerHTML = '<div class="kl-bas"></div>' + SEKME[i].html;
      sayfa.firstChild.textContent = SEKME[i].bas;
      var fp = sayfa.querySelector('.kl-fp');
      if (fp) fpanelSema(fp, 'F_PANEL pin düzeni');
    }
    var sekmeler = secGrup(kok.querySelector('.kl-sekme'), SEKME.map(function (x) { return x.ad; }), sekmeGoster, { baslangic: 0, aria: 'Kılavuz sekmeleri' });
    sekmeGoster(0);
    var GOREV = [
      { bas: 'Form faktörü', soru: 'Bu kart hangi form faktöründe; hangi kasaya takılabilir?',
        sec: ['Mini-ITX · her kasaya', 'ATX · ATX ya da daha büyük kasaya', 'mATX · yalnız mATX kasaya'], dogru: 1, ipucu: 'Özellikler sekmesinde ölçüye bak: 30,5 × 24,4 cm hangi standart?' },
      { bas: 'Bellek', soru: 'Ece iki RAM modülü takacak. Kılavuz hangi yuvaları öneriyor?',
        sec: ['DIMM_A1 + DIMM_A2', 'DIMM_B1 + DIMM_B2', 'DIMM_A2 + DIMM_B2'], dogru: 2, ipucu: 'Yuvalar sekmesinin altındaki notlara bak.' },
      { bas: 'Ekran kartı', soru: 'Ekran kartı hangi yuvaya takılmalı?',
        sec: ['PCIE_1', 'PCIE_3', 'PCIE_2'], dogru: 0, ipucu: 'İşlemciye bağlı ve 16 hattın hepsini kullanan yuvayı bul.' },
      { bas: 'Hat paylaşımı', soru: 'Deniz M.2_2’ye SSD taktı; dört SATA portunda da disk var. Hangi diskler görünmez?',
        sec: ['Hiçbiri; hepsi çalışır', 'SATA_1 ve SATA_2', 'SATA_3 ve SATA_4'], dogru: 2, ipucu: 'Yuvalar sekmesindeki notlarda M.2_2 geçiyor.' },
      { bas: 'Ön panel', soru: 'Bilgisayar çalışıyor ama kasanın güç LED’i yanmıyor; PLED kablosu takılı. Ne denenmeli?',
        sec: ['Güç düğmesi (PWR) kablosunu ters çevirmek', 'PLED kablosunu çevirip + ucunu PLED+ pimine takmak', 'CMOS pilini değiştirmek'], dogru: 1,
        ipucu: 'Başlıklar sekmesindeki F_PANEL şemasında + ve − işaretlerine bak.' }
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-2'), gi = 0, cozulen = 0;
    function gorevGoster() {
      gorevEl.innerHTML = '';
      if (gi >= GOREV.length) {
        gorevEl.className = 'kl-gorev son';
        el('b', '', gorevEl, '✔ Beş görev tamam');
        el('span', '', gorevEl, 'Kılavuz; ölçüyü, yuva hatlarını, paylaşımları ve pin düzenini söyler. Takmadan önce oku.');
        DERS.dugme(gorevEl, 'Yeniden', function () { gi = 0; cozulen = 0; ilerle(0, GOREV.length); gorevGoster(); }, 'kl-ileri');
        return;
      }
      var g = GOREV[gi];
      gorevEl.className = 'kl-gorev';
      el('span', 'kl-no', gorevEl, 'Görev ' + (gi + 1) + ' / ' + GOREV.length + ' · ' + g.bas);
      el('b', 'kl-soru', gorevEl, g.soru);
      var sc = el('div', 'kl-secenek', gorevEl), geri = el('div', 'kl-geri', gorevEl);
      g.sec.forEach(function (m, idx) {
        var b = DERS.dugme(sc, m, function () {
          if (idx === g.dogru) {
            sc.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
            b.classList.add('iyi');
            geri.className = 'kl-geri iyi'; geri.textContent = '✓ Doğru. ';
            cozulen++; ilerle(cozulen, GOREV.length); D.ses('klik');
            if (cozulen === GOREV.length) DERS.konfeti();
            DERS.dugme(geri, gi + 1 < GOREV.length ? 'Sonraki görev →' : 'Bitir →', function () { gi++; gorevGoster(); }, 'kl-ileri');
          } else {
            b.classList.add('kotu'); b.disabled = true;
            geri.className = 'kl-geri kotu'; geri.textContent = '✗ Tekrar dene. İpucu: ' + g.ipucu;
            D.ses('hata');
          }
        }, 'kl-sec');
      });
    }
    gorevGoster();
    kok._h05 = { GOREV: GOREV, sekme: function (i) { sekmeler.sec(i); sekmeGoster(i); } };
  })();
})();
