/* DON-201 H10 — Atölye 1: Kasayı Açma ve RAM Sök–Tak · ders betiği */
(function () {
  'use strict';
  var D = window.DON3D, THREE = window.THREE;
  var V3 = THREE.Vector3;
  var K = D.kit;
  D.baslat({ kalite: 'otomatik' });
  var AZ = D.azHareket();
  var tahmin = null;

  /* ─────────── Hedefler: kazanım başına küçük simge ─────────── */
  var HEDEF_SIMGE = [
    '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/>',
    '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    '<rect x="3" y="14" width="18" height="6" rx="1"/><path d="M12 11V3M8 7l4-4 4 4"/>',
    '<rect x="3" y="14" width="18" height="6" rx="1"/><path d="M12 3v8M8 7l4 4 4-4"/>'
  ];
  document.querySelectorAll('#s2-goals .goal-check').forEach(function (el, i) {
    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (HEDEF_SIMGE[i] || '<polyline points="20 6 9 17 4 12"/>') + '</svg>';
  });

  /* ─────────── Quiz: son soru Derinleş bonusu, puanı düşürmez ─────────── */
  var CEKIRDEK = LESSON.quiz.length - 1;
  var bonusDogru = false;
  function quizBasligiDuzelt() {
    quizTotal = CEKIRDEK;
    var sc = document.querySelector('.quiz-score');
    if (sc) sc.innerHTML = sc.innerHTML.replace(/\/\s*\d+\s*$/, '/ ' + CEKIRDEK);
    var son = document.querySelector('.quiz-wrap[data-qi="' + CEKIRDEK + '"] .quiz-q');
    if (son) son.innerHTML = son.innerHTML.replace('Derinleş (bonus):', '<span class="bonus">Derinleş · Bonus</span>');
    var tot = document.getElementById('qc-tot');
    if (tot) tot.textContent = CEKIRDEK + ' + 1';
  }
  var asilBuildQuiz = window.buildQuiz, asilQuizAns = window.quizAns;
  window.buildQuiz = function () { bonusDogru = false; asilBuildQuiz(); quizBasligiDuzelt(); };
  window.quizAns = function (qi, oi, el, q, qb) {
    asilQuizAns(qi, oi, el, q, qb);
    if (qi === CEKIRDEK && oi === q.correct) { score = score - 1; bonusDogru = true; }
    quizTotal = CEKIRDEK;
    document.getElementById('done-score').textContent = score + '/' + CEKIRDEK + (bonusDogru ? ' +1' : '');
    var v = document.getElementById('qsc-val');
    if (v) v.textContent = score;
    lmsUpdate();
  };
  quizBasligiDuzelt();

  /* ─────────── Isınma: tahmin et → Adım 5'te izle ─────────── */
  var TAHMINLER = ['Yine de girer ve çalışır.', 'Girmez, bir yere takılır.', 'Girer ama bilgisayar yavaşlar.'];
  document.querySelectorAll('.tahmin-sec').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tahmin-sec').forEach(function (x) { x.classList.remove('secili'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('secili'); b.setAttribute('aria-pressed', 'true');
      tahmin = +b.dataset.tahmin;
      document.getElementById('tahmin-geri').textContent = '📌 Tahminini aldık. Adım 5’teki provada birlikte göreceğiz.';
    });
  });

  /* ─────────── Kontrol listeleri (Adım 1 güvenlik, Adım 6 belgeleme) ─────────── */
  function kontrolListesi(kokId, hazirMetin, bekleMetin) {
    var kok = document.getElementById(kokId);
    if (!kok) return;
    var maddeler = kok.querySelectorAll('.gk-madde');
    var sonuc = kok.querySelector('.gk-sonuc');
    function guncelle() {
      var n = 0;
      maddeler.forEach(function (m) {
        var acik = m.getAttribute('aria-pressed') === 'true';
        if (acik) n++;
        if (m.dataset.gk) { var g = kok.querySelector('#' + m.dataset.gk); if (g) g.classList.toggle('tamam', acik); }
      });
      var hazir = n === maddeler.length;
      sonuc.classList.toggle('hazir', hazir);
      sonuc.textContent = hazir ? '✔ ' + hazirMetin : bekleMetin + ' (' + n + ' / ' + maddeler.length + ')';
    }
    maddeler.forEach(function (m) {
      m.setAttribute('aria-pressed', 'false');
      m.addEventListener('click', function () { m.setAttribute('aria-pressed', m.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); guncelle(); });
    });
    guncelle();
  }
  kontrolListesi('guvenlik-kontrol', 'Hazırsın! Şimdi kapağı açabilirsin.', 'Üç maddeyi işaretle');
  kontrolListesi('belgele', 'Belgeleme tamam! Öğretmenine göster.', 'Üç fotoğrafı işaretle');

  /* ─────────── Prova oynatıcı: altyazılı adımlar, Oynat/Tekrarla, Adım adım ─────────── */
  function prova(s, adimlar, ops) {
    ops = ops || {};
    var alt = D.div('u-altyazi', s.arayuz);
    alt.setAttribute('aria-live', 'polite');
    var calisiyor = false, sira = 0;
    var btn = s.dugme('Oynat', 'oynat', function () { oynat(); }, { yer: 'alt-sol', sinif: 'don3d-dugme--birincil', aciklama: 'Provayı oynat' });
    if (AZ) s.dugme('Adım adım', 'adim', function () { adim(); }, { yer: 'alt-sol', aciklama: 'Provanın bir sonraki adımını göster' });
    function yaz(i) { alt.textContent = (i + 1) + '. ' + adimlar[i].metin; }
    function bitir() {
      calisiyor = false;
      btn.querySelector('span').textContent = 'Tekrarla';
      if (ops.bitti) ops.bitti();
    }
    function oynat() {
      if (calisiyor) return;
      calisiyor = true; sira = 0;
      if (ops.sifirla) ops.sifirla();
      var z = Promise.resolve();
      adimlar.forEach(function (a, i) {
        z = z.then(function () { yaz(i); return D.bekle(0.5, s); })
          .then(function () { return a.calis(); })
          .then(function () { return D.bekle(0.7, s); });
      });
      z.then(bitir, function (e) { console.error(e); calisiyor = false; });
    }
    function adim() {
      if (calisiyor) return;
      if (sira === 0 || sira >= adimlar.length) { sira = 0; if (ops.sifirla) ops.sifirla(); }
      calisiyor = true;
      yaz(sira);
      adimlar[sira].calis().then(function () {
        calisiyor = false; sira++;
        if (sira >= adimlar.length) bitir();
      });
    }
    if (!AZ) D.bekle(0.6, s).then(oynat);
    return { oynat: oynat };
  }

  function dunya(o) { o.updateWorldMatrix(true, false); return o.getWorldPosition(new V3()); }
  function kaldirHepsi(liste) { liste.forEach(function (e) { e.kaldir(); }); liste.length = 0; }

  /* ─────────── Kapak: yan kapağı açık, dönen kasa ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { arkaPlan: 'seffaf', etiket: kap.getAttribute('aria-label'),
      kamera: { yon: [-1, 0.42, 0.55], pay: 0.95 }, turSuresi: 10 });
    s.ekle('M-MASAUSTU-ACIK', { modelOps: { kapakAcik: true } });
    s.yerlestir();
  });

  /* ─────────── Adım 2: yan kapağı aç (vidalar → kutu, kapak kayar ve çıkar) ─────────── */
  D.tembel('#s6-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-0.95, 0.5, -0.85], pay: 0.9 } });
    var kasa = s.ekle('M-MASAUSTU-ACIK');
    // Parça kutusu (vidalar buraya)
    var kutu = new THREE.Group();
    K.koy(kutu, K.kutu(14, 0.4, 10, K.mat('#3b82f6'), 0.2), 0, 0.2, 0);
    [[0, 1.6, 4.8, 14, 3, 0.4], [0, 1.6, -4.8, 14, 3, 0.4], [6.8, 1.6, 0, 0.4, 3, 10], [-6.8, 1.6, 0, 0.4, 3, 10]].forEach(function (d) {
      K.koy(kutu, K.kutu(d[3], d[4], d[5], K.mat('#3b82f6'), 0.1), d[0], d[1], d[2]);
    });
    K.parca(kutu, 'parca-kutusu', 'Parça kutusu', 'Sökülen vidalar ve küçük parçalar burada durur.');
    kutu.position.set(-24, 0, -30);
    s.kok.add(kutu);
    s.yerlestir();
    D.dondur(s, { ipucu: false });
    var o = kasa.userData, kapak = o.kapak, vidalar = o.vidalar;
    var kapak0 = kapak.position.clone(), kapakR0 = kapak.rotation.clone();
    var gorunum0 = null, etiketler = [];
    function sifirla() {
      kaldirHepsi(etiketler);
      vidalar.forEach(function (v) { v.position.copy(v.userData.baslangic); v.rotation.set(0, 0, 0); v.visible = true; D.vurguKaldir(v, 0); });
      kapak.position.copy(kapak0); kapak.rotation.copy(kapakR0);
      if (!gorunum0) gorunum0 = { theta: s.orb.theta, phi: s.orb.phi, yakinlik: s.orb.yakinlik, hedef: s.orb.hedef.clone() };
      else s.kameraGit(gorunum0, 0.5);
    }
    var kutuUst = new V3(-24, 3.5, -30);
    prova(s, [
      { metin: 'Kasanın arkasındaki iki vidayı bul.', calis: function () {
        return Promise.all(vidalar.map(function (v) { return D.vurgula(v, { etiket: false }); })).then(function () {
          etiketler.push(s.etiket(vidalar[0], 'Kapak vidası', { tur: 'vurgu' }));
          return D.bekle(1, s);
        });
      } },
      { metin: 'Vidaları saat yönünün tersine çevirip sök, kutuya koy.', calis: function () {
        kaldirHepsi(etiketler);
        return Promise.all(vidalar.map(function (v) { return D.vurguKaldir(v); }))
          .then(function () { return Promise.all(vidalar.map(function (v) { return D.vida(v, { eksen: 'z', tur: 3, mesafe: 1.2 }); })); })
          .then(function () {
            return Promise.all(vidalar.map(function (v, i) {
              return D.git(v, kutuUst.clone().add(new V3(i * 2 - 1, 0, 0)), 0.9).then(function () { return D.git(v, new V3(-24 + i * 2 - 1, 0.9, -30), 0.3); });
            }));
          });
      } },
      { metin: 'Kapağı arkaya doğru kaydır.', calis: function () {
        etiketler.push(s.etiket(kapak, 'Geriye kaydır', { tur: 'vurgu' }));
        return D.kaydir(kapak, [0, 0, -3], 0.9);
      } },
      { metin: 'Kapağı dışa çek ve masaya yatır.', calis: function () {
        kaldirHepsi(etiketler);
        var p0 = kapak.position.clone(), p1 = new V3(-37, 0.35, p0.z + 8);
        return D.git(kapak, new V3(p0.x - 6, p0.y, p0.z), 0.6).then(function () {
          var q0 = kapak.position.clone();
          return D.tween({ sahne: s, sure: 1, guncelle: function (e) {
            kapak.position.lerpVectors(q0, p1, e);
            kapak.rotation.z = (Math.PI / 2) * e;
          } });
        }).then(function () {
          return s.kameraGit({ theta: Math.atan2(-1, 0.3), phi: 1.2, yakinlik: 0.8, hedef: [0, 24, 0] }, 1);
        });
      } }
    ], { sifirla: sifirla });
  });

  /* ─────────── Adım 3: parçaları bul ve etiketle ─────────── */
  var PARCALAR = [
    ['islemci', 'İşlemci'], ['ram-1', 'RAM'], ['ekran-karti', 'Ekran kartı'],
    ['guc-kaynagi', 'Güç kaynağı'], ['depolama', 'SSD'], ['arka-fan', 'Fan'], ['anakart', 'Anakart']
  ];
  D.tembel('#s7-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-1, 0.38, 0.32], pay: 0.72 } });
    var kasa = s.ekle('M-MASAUSTU-ACIK', { modelOps: { kapakAcik: true } });
    s.yerlestir();
    D.dondur(s, { ipucu: false });
    D.bilgi(s, PARCALAR.map(function (p) { return p[0]; }));
    var etiketler = [];
    function sifirla() {
      kaldirHepsi(etiketler);
      PARCALAR.forEach(function (p) { var o = kasa.getObjectByName(p[0]); if (o) D.vurguKaldir(o, 0); });
    }
    prova(s, PARCALAR.map(function (p) {
      return { metin: p[1] + ': bul ve etiketle.', calis: function () {
        var o = kasa.getObjectByName(p[0]);
        return D.vurgula(o, { etiket: false, sure: 0.4 }).then(function () {
          etiketler.push(s.etiket(o, p[1], { tur: 'kagit', yer: p[0] === 'anakart' ? 'merkez' : 'ust' }));
          return D.bekle(0.8, s);
        }).then(function () { return D.vurguKaldir(o); });
      } };
    }), { sifirla: sifirla });
  });

  /* ─────────── Yakın plan: anakart parçası + iki RAM yuvası ─────────── */
  function kartKur(s, ops) {
    var pcbDoku = K.canvasDoku(512, 192, function (ctx, w, h) {
      ctx.fillStyle = '#23272e'; ctx.fillRect(0, 0, w, h);
      var r = K.rng(5);
      ctx.strokeStyle = 'rgba(140,155,170,0.35)'; ctx.lineWidth = 1.2;
      for (var i = 0; i < 60; i++) { var x = r() * w, y = r() * h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.5) * 90, y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(230,232,236,0.7)'; ctx.font = '700 14px Arial, sans-serif';
      ctx.fillText('DIMM_A1', 30, 70); ctx.fillText('DIMM_A2', 30, 120);
    });
    var kart = K.kutu(19, 0.16, 7, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.6 }));
    kart.position.set(0, -0.08, -0.5);
    kart.userData.secilmez = true;
    s.kok.add(kart);
    var yA = s.ekle('M-RAM-YUVASI', { modelOps: { acik: !!ops.acik, kesit: true } });
    var yB = s.ekle('M-RAM-YUVASI', { konum: [0, 0, -1.3], modelOps: { renk: 'plastikKoyu' } });
    var ramB = D.model('M-RAM'); ramB.position.copy(yB.userData.oturma); yB.add(ramB);
    ramB.userData.secilmez = true;
    var ram = s.ekle('M-RAM');
    return { yA: yA, yB: yB, ram: ram, oturma: yA.position.clone().add(yA.userData.oturma) };
  }
  var YAKIN = { yon: [0.42, 0.62, 1], pay: 0.62, hedefOfset: [0, 0.8, 0] };

  /* ─────────── Adım 4: RAM'i çıkar ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: YAKIN });
    var k = kartKur(s, {});
    var ram = k.ram;
    ram.position.copy(k.oturma);
    s.yerlestir();
    D.dondur(s, { ipucu: false });
    var etiketler = [];
    var mandallar = [k.yA.getObjectByName('mandal-sol'), k.yA.getObjectByName('mandal-sag')];
    function sifirla() {
      kaldirHepsi(etiketler);
      mandallar.forEach(function (m) { D.vurguKaldir(m, 0); });
      k.yA.userData.mandal(false, 0.01);
      ram.position.copy(k.oturma); ram.rotation.set(0, 0, 0);
    }
    prova(s, [
      { metin: 'RAM\'in iki ucundaki mandalları bul.', calis: function () {
        return Promise.all(mandallar.map(function (m) { return D.vurgula(m, { etiket: false }); })).then(function () {
          mandallar.forEach(function (m) { etiketler.push(s.etiket(m, 'Mandal', { tur: 'vurgu' })); });
          return D.bekle(1, s);
        });
      } },
      { metin: 'İki mandalı aynı anda dışa doğru bastır.', calis: function () {
        kaldirHepsi(etiketler);
        mandallar.forEach(function (m) { D.vurguKaldir(m); });
        return k.yA.userData.mandal(true, 0.5).then(function () { return D.git(ram, k.oturma.clone().add(new V3(0, 0.3, 0)), 0.3, 'easeOutCubic'); });
      } },
      { metin: 'RAM\'i kenarlarından tut, düz yukarı çek.', calis: function () {
        return D.git(ram, k.oturma.clone().add(new V3(0, 4.5, 0)), 0.9).then(function () {
          etiketler.push(s.etiket(ram.getObjectByName('temaslar'), 'Altın temaslara dokunma', { tur: 'vurgu', yer: 'merkez' }));
          return D.bekle(1.2, s);
        });
      } },
      { metin: 'RAM\'i temaslarına dokunmadan kenara yatır.', calis: function () {
        kaldirHepsi(etiketler);
        var p0 = ram.position.clone(), p1 = new V3(0, 0.3, 5.2), r0 = ram.rotation.x;
        return D.tween({ sahne: s, sure: 1.1, guncelle: function (e) {
          ram.position.lerpVectors(p0, p1, e);
          ram.rotation.x = r0 - (Math.PI / 2) * e;
        } });
      } }
    ], { sifirla: sifirla });
  });

  /* ─────────── Adım 5: RAM'i tak (A-TAK: ters girmez → çevir → klik) ─────────── */
  D.tembel('#s9-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: YAKIN });
    var k = kartKur(s, { acik: true });
    var ram = k.ram;
    var ust = k.oturma.clone().add(new V3(0, 4, 0));
    ram.position.copy(ust);
    s.yerlestir();
    D.dondur(s, { ipucu: false });
    var etiketler = [], not = null, hiza = null;
    function hizaKaldir() { if (hiza) { hiza.kaldir(); hiza = null; } }
    function sifirla() {
      kaldirHepsi(etiketler);
      hizaKaldir();
      if (not) { not.remove(); not = null; }
      k.yA.userData.mandal(true, 0.01);
      ram.position.copy(ust); ram.rotation.set(0, Math.PI, 0);
    }
    prova(s, [
      { metin: 'Çentiğe ve yuvadaki çıkıntıya bak: aynı hizada mı?', calis: function () {
        etiketler.push(s.etiket(k.yA.getObjectByName('cikinti'), 'Çıkıntı', { tur: 'vurgu', yer: 'alt', ofset: [0, -0.6, 0] }));
        hiza = D.hiza(s, ram.getObjectByName('centik'), k.yA.getObjectByName('cikinti'));
        return D.bekle(1.8, s);
      } },
      { metin: 'Çentik çıkıntıya denk gelmiyor; bu yüzden RAM oturmuyor.', calis: function () {
        return D.takAnim(ram, { hedef: k.oturma, dogru: false, yukseklik: 4, yuva: k.yA, engel: 0.6 });
      } },
      { metin: 'RAM\'i çevir: çentik çıkıntıyla aynı hizaya gelsin.', calis: function () {
        var r0 = ram.rotation.y;
        return D.tween({ sahne: s, sure: 0.9, guncelle: function (e) { ram.rotation.y = r0 + Math.PI * e; } })
          .then(function () { ram.rotation.y = 0; return D.bekle(1.2, s); });
      } },
      { metin: 'Çentik çıkıntıya denk geldi: iki ucundan eşit bastır, klik!', calis: function () {
        return D.takAnim(ram, { hedef: k.oturma, dogru: true, yukseklik: 4, yuva: k.yA }).then(function () {
          hizaKaldir();
          kaldirHepsi(etiketler);
          etiketler.push(s.etiket(ram, 'Klik! RAM yerine oturdu', { tur: 'vurgu' }));
        });
      } }
    ], { sifirla: sifirla, bitti: function () {
      if (tahmin == null) return;
      not = D.div('don3d-ipucu', s.arayuz);
      not.style.bottom = '104px';
      not.textContent = 'Tahminin: “' + TAHMINLER[tahmin] + '” ' + (tahmin === 1 ? 'Doğru tahmin! Çentik çıkıntıya denk gelmeyince RAM oturmadı.' : 'Gördün: çentik çıkıntıya denk gelmeyince RAM oturmadı.');
    } });
  });

  /* ─────────── Etkinlik: E-TAK — RAM'i doğru yönde tak ─────────── */
  D.tembel('#s11-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.3, 0.9, 1], pay: 0.85 } });
    var k = kartKur(s, { acik: true });
    var ram = k.ram;
    ram.position.set(0, k.oturma.y + 4, 5.5);
    ram.rotation.set(0, Math.PI, 0);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.3, maxPolar: 1.25 } });
    var durum = document.getElementById('etk-durum');
    var mesaj = durum.querySelector('.etk-mesaj');
    function satir(ad, tamam) { durum.querySelector('[data-d="' + ad + '"]').classList.toggle('tamam', !!tamam); }
    function mesajYaz(tur, t) { mesaj.className = 'etk-mesaj' + (tur ? ' ' + tur : ''); mesaj.textContent = t; }
    function yonDogru() { return Math.abs(Math.cos(ram.rotation.y) - 1) < 0.05; }
    var hiza = D.hiza(s, ram.getObjectByName('centik'), k.yA.getObjectByName('cikinti'));
    var etCikinti = s.etiket(k.yA.getObjectByName('cikinti'), 'Çıkıntı', { tur: 'vurgu', yer: 'alt', ofset: [0, -0.6, 0] });
    var hataSay = 0;
    D.tak(s, ram, k.oturma, {
      dogruYon: yonDogru, tolerans: 1.6, yukseklik: 4, yuva: k.yA, isaretBoyut: [13.4, 0.9], isaretY: 0.6, engel: 0.6,
      onCevir: function () {
        satir('yon', yonDogru());
        mesajYaz('', yonDogru() ? '✓ Çentik çıkıntıya denk geldi. Şimdi yuvaya götür.' : 'Çentik yine çıkıntıya denk gelmiyor. Bir kez daha çevir.');
      },
      onYanlis: function () {
        hataSay++;
        mesajYaz('yanlis', '✗ Oturmadı: çentik çıkıntıya denk gelmiyor. “Çevir” ile RAM\'i döndür.');
      },
      onUzak: function () { mesajYaz('', 'RAM\'i yuvanın tam üstüne bırak; turuncu kılavuzu takip et.'); },
      onDogru: function () {
        hiza.goster(false); etCikinti.goster(false);
        satir('yon', true); satir('otur', true);
        setTimeout(function () { satir('klik', true); }, 250);
        mesajYaz('dogru', '✔ Harika! RAM oturdu, mandallar kapandı.' + (hataSay ? ' Denemeden öğrendin.' : ' İlk denemede başardın.'));
        if (!AZ && typeof window.confetti === 'function') window.confetti();
      },
      onSifirla: function () {
        hiza.goster(true); etCikinti.goster(true);
        satir('yon', false); satir('otur', false); satir('klik', false);
        hataSay = 0;
        mesajYaz('', 'Hazır olduğunda RAM\'i sürükle ya da “Yuvaya götür”e bas.');
      }
    });
  });
})();
