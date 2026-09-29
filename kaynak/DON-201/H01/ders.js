/* DON-201 H01 — Donanım, Yazılım ve Bilgisayarın Dört İşi · ders betiği */
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
    '<path d="M4 6h10v8H4z"/><path d="M7 18h4"/><path d="M16 9l4 3-4 3"/>',
    '<circle cx="12" cy="12" r="8"/><path d="M12 4v4M20 12h-4M12 20v-4M4 12h4"/>',
    '<rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'
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

  /* ─────────── Isınma: tahmin et → sonra izle ─────────── */
  var TAHMINLER = ['Doğrudan ekrana gider.', 'Önce kasaya, sonra ekrana gider.', 'Önce internete, sonra ekrana gider.'];
  document.querySelectorAll('.tahmin-sec').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tahmin-sec').forEach(function (x) { x.classList.remove('secili'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('secili');
      b.setAttribute('aria-pressed', 'true');
      tahmin = +b.dataset.tahmin;
      document.getElementById('tahmin-geri').textContent = '📌 Tahminini aldık. Adım 3–5’te harfin yolculuğunu izleyip kontrol edeceğiz.';
    });
  });

  /* ─────────── Ekran içerikleri (marka-nötr) ─────────── */
  function pencere(ctx, w, h, baslik, renk) {
    ctx.fillStyle = '#cfd8e3'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff'; K.yuvarlakDikdortgen(ctx, 12, 10, w - 24, h - 34, 8); ctx.fill();
    ctx.fillStyle = renk || '#e2e8f0'; K.yuvarlakDikdortgen(ctx, 12, 10, w - 24, 24, 8); ctx.fill();
    ctx.fillRect(12, 26, w - 24, 8);
    ['#ef4444', '#f59e0b', '#10b981'].forEach(function (c, i) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(28 + i * 16, 22, 5, 0, 7); ctx.fill(); });
    ctx.fillStyle = renk ? '#fff' : '#475569'; ctx.font = '700 13px Inter, Arial, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText(baslik, 84, 22);
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fillRect(0, h - 20, w, 20);
  }
  function editorCiz(metin) {
    return function (ctx, w, h) {
      pencere(ctx, w, h, 'belge.txt');
      ctx.fillStyle = '#0f172a'; ctx.font = '800 72px Inter, Arial, sans-serif'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(metin, 44, 130);
      var x = 44 + ctx.measureText(metin).width + 6;
      ctx.fillStyle = '#0ea5e9'; ctx.fillRect(x, 74, 5, 66);
    };
  }
  var UYGULAMALAR = [
    { ad: 'Oyun', ciz: function (ctx, w, h) {
      pencere(ctx, w, h, 'Oyun', '#8b5cf6');
      var g = ctx.createLinearGradient(0, 34, 0, h - 24); g.addColorStop(0, '#7dd3fc'); g.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = g; ctx.fillRect(12, 34, w - 24, h - 58);
      ctx.fillStyle = '#16a34a'; ctx.fillRect(12, h - 64, w - 24, 40);
      ctx.fillStyle = '#b45309'; [[120, 150, 90], [280, 110, 110], [400, 170, 70]].forEach(function (p) { ctx.fillRect(p[0], p[1], p[2], 16); });
      ctx.fillStyle = '#facc15'; [[160, 132], [320, 92], [350, 92], [430, 152]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 8, 0, 7); ctx.fill(); });
      ctx.fillStyle = '#ef4444'; ctx.fillRect(60, h - 104, 30, 40);
      ctx.fillStyle = '#fff'; ctx.fillRect(66, h - 96, 7, 7); ctx.fillRect(78, h - 96, 7, 7);
      ctx.fillStyle = '#0f172a'; ctx.font = '800 16px Inter, Arial, sans-serif'; ctx.fillText('Puan: 120', w - 120, 50);
    } },
    { ad: 'Harita', ciz: function (ctx, w, h) {
      pencere(ctx, w, h, 'Harita', '#10b981');
      ctx.fillStyle = '#ecfdf5'; ctx.fillRect(12, 34, w - 24, h - 58);
      ctx.fillStyle = '#bbf7d0'; ctx.fillRect(40, 60, 120, 80);
      ctx.fillStyle = '#bae6fd'; ctx.beginPath(); ctx.moveTo(12, 200); ctx.bezierCurveTo(160, 160, 300, 250, w - 12, 190); ctx.lineTo(w - 12, 220); ctx.bezierCurveTo(300, 280, 160, 190, 12, 230); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 10;
      [[12, 150, w - 12, 120], [220, 34, 260, h - 24], [380, 34, 330, h - 24]].forEach(function (l) { ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke(); });
      ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 5; ctx.setLineDash([10, 6]);
      ctx.beginPath(); ctx.moveTo(90, 145); ctx.lineTo(240, 128); ctx.lineTo(360, 110); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(360, 88, 14, Math.PI, 0); ctx.lineTo(360, 116); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(360, 88, 5, 0, 7); ctx.fill();
    } },
    { ad: 'Resim', ciz: function (ctx, w, h) {
      pencere(ctx, w, h, 'Resim programı', '#ec4899');
      ctx.fillStyle = '#f1f5f9'; ctx.fillRect(12, 34, 56, h - 58);
      ['#ef4444', '#f59e0b', '#facc15', '#10b981', '#0ea5e9', '#8b5cf6'].forEach(function (c, i) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(40, 56 + i * 32, 11, 0, 7); ctx.fill(); });
      ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.arc(420, 80, 30, 0, 7); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(420, 80, 22, 0, 7); ctx.fill();
      ctx.fillStyle = '#0ea5e9'; ctx.fillRect(160, 130, 120, 90);
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(145, 132); ctx.lineTo(220, 72); ctx.lineTo(295, 132); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(205, 170, 30, 50);
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(90, 250); ctx.bezierCurveTo(200, 225, 330, 262, 480, 240); ctx.stroke();
    } },
    { ad: 'Yazı', ciz: function (ctx, w, h) {
      pencere(ctx, w, h, 'Yazı programı', '#0ea5e9');
      ctx.fillStyle = '#0f172a'; ctx.font = '800 24px Inter, Arial, sans-serif'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('Bilgisayarın dört işi', 40, 76);
      ctx.fillStyle = '#94a3b8';
      [300, 380, 340, 260, 360, 220].forEach(function (lw, i) { ctx.fillRect(40, 100 + i * 24, lw, 10); });
    } }
  ];

  /* ─────────── Masa düzeni: kasa, monitör, klavye, fare + kablolar ─────────── */
  var YON_MASA = [-0.5, 0.62, 1.3];
  function dunya(o) { o.updateWorldMatrix(true, false); return o.getWorldPosition(new V3()); }
  function merkez(o) { o.updateWorldMatrix(true, true); return new THREE.Box3().setFromObject(o).getCenter(new V3()); }

  function masaKur(s) {
    var kasa = s.ekle('M-MASAUSTU', { konum: [-47, 0, -9], donus: [0, 0.32, 0] });
    var mon = s.ekle('M-MONITOR', { konum: [0, 0, -6] });
    var kla = s.ekle('M-KLAVYE', { konum: [0, 0, 20] });
    var fare = s.ekle('M-FARE', { konum: [27, 0, 21], donus: [0, -0.12, 0] });
    s.kok.updateMatrixWorld(true);
    function kw(x, y, z) { return kasa.localToWorld(new V3(x, y, z)); }
    var kc = dunya(kla.getObjectByName('kablo-cikis'));
    var klavyeYol = [kc, new V3(kc.x, 0.5, kc.z - 5), new V3(-12, 0.5, -3), new V3(-26, 0.5, -20),
      kw(-2, 0.5, -30), kw(-2, 18, -27), kw(-2, 35, -24), dunya(kasa.getObjectByName('kablo-giris'))];
    var mg = dunya(mon.getObjectByName('giris-noktasi'));
    var monYol = [mg, new V3(mg.x, mg.y - 5, mg.z - 5), new V3(mg.x, 0.5, -17), new V3(-22, 0.5, -26),
      kw(-2.5, 0.5, -31), kw(-2.5, 12, -27), dunya(kasa.getObjectByName('goruntu-cikis'))];
    var k1 = K.kablo(klavyeYol, 0.28); k1.name = 'klavye-kablosu'; s.kok.add(k1);
    var k2 = K.kablo(monYol, 0.36); k2.name = 'goruntu-kablosu'; s.kok.add(k2);
    return { kasa: kasa, mon: mon, kla: kla, fare: fare, klavyeYol: klavyeYol, monYol: monYol, kw: kw };
  }

  /* ─────────── Kapak: dönen kasa ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    D.sahne(kap, { modeller: ['M-MASAUSTU'], arkaPlan: 'seffaf', etiket: kap.getAttribute('aria-label'),
      kamera: { yon: [-0.95, 0.45, 1.1], pay: 0.95 }, turSuresi: 8 });
  });

  /* ─────────── Adım 1: Donanım — parçalar sırayla parlar (A-VURGU), E-DONDUR, E-BILGI ─────────── */
  D.tembel('#s4-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), kamera: { yon: YON_MASA }, turSuresi: 26 });
    var m = masaKur(s);
    s.yerlestir();
    D.dondur(s, { ipucu: 'Sürükle: döndür · Dokun: bilgi' });
    D.bilgi(s, ['M-MASAUSTU', 'M-MONITOR', 'M-KLAVYE', 'M-FARE']);
    var durdu = false;
    s.tiklaninca(function () { durdu = true; });
    var sira = [m.kasa, m.mon, m.kla, m.fare];
    (function dongu() {
      if (durdu) return;
      D.siraylaVurgula(sira, { bekle: 1.5 }).then(function () {
        if (!durdu) D.bekle(1.2, s).then(dongu);
      });
    })();
  });

  /* ─────────── Adım 2: Yazılım — A-KATMAN ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [-0.28, 0.28, 1.3], pay: 0.78 } });
    var mon = s.ekle('M-MONITOR');
    s.ekle('M-KLAVYE', { konum: [0, 0, 20] });
    s.ekle('M-FARE', { konum: [27, 0, 21], donus: [0, -0.12, 0] });
    s.yerlestir();
    D.dondur(s, { ipucu: false });
    mon.getObjectByName('ekran').userData.vurguHaric = true;
    var kat = D.katman(s, mon.userData.ekran.mesh, { ayrik: 7, katmanlar: UYGULAMALAR.map(function (u) {
      return { ad: 'Yazılım: ' + u.ad, ciz: u.ciz };
    }) });
    s.etiket(mon.getObjectByName('ayak'), 'Donanım: aynı monitör', { yer: 'merkez', ofset: [0, 3, 0] });
    var dugmeler = [], elle = false;
    function sec(i) {
      dugmeler.forEach(function (b, j) { b.classList.toggle('don3d-dugme--secili', i === j); b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      return kat.sec(i);
    }
    UYGULAMALAR.forEach(function (u, i) {
      dugmeler.push(s.dugme(u.ad, null, function () { elle = true; sec(i); }, { yer: 'alt-orta', aciklama: 'Yazılım: ' + u.ad }));
    });
    var i = 0;
    (function dongu() {
      if (elle) return;
      sec(i % UYGULAMALAR.length).then(function () { return D.bekle(3.2, s); }).then(function () { i++; if (!elle && i < 8) dongu(); });
    })();
  });

  /* ─────────── Adım 3–6: harfin yolculuğu — A-AKIS ─────────── */
  var ASAMALAR = ['Girdi', 'İşlem', 'Çıktı', 'Depolama'];
  function yolculuk(kap, asama) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: YON_MASA } });
    var m = masaKur(s);
    s.yerlestir();
    D.dondur(s, { ipucu: false });
    var ekran = m.mon.userData.ekran;
    ekran.mesh.userData.vurguHaric = true;
    ekran.ciz(editorCiz(''));

    // Aşama şeridi
    var serit = D.div('asama-serit', s.arayuz);
    serit.setAttribute('aria-hidden', 'true');
    var cipler = ASAMALAR.map(function (ad, i) {
      if (i) { var o = document.createElement('span'); o.className = 'asama-ok'; o.textContent = '→'; serit.appendChild(o); }
      var c = document.createElement('span');
      c.className = 'asama';
      c.innerHTML = '<b>' + (i + 1) + '</b> ' + ad;
      serit.appendChild(c);
      return c;
    });
    function cipDurum(i, d) {
      cipler[i].classList.toggle('asama--aktif', d === 'aktif');
      cipler[i].classList.toggle('asama--bitti', d === 'bitti');
    }

    var tusA = m.kla.getObjectByName('tus-A');
    var islemci = m.kasa.getObjectByName('islemci');
    var ekk = m.kasa.getObjectByName('ekran-karti');
    var ssd = m.kasa.getObjectByName('depolama');
    var diskIsigi = m.kasa.getObjectByName('disk-isigi');
    var cpu = dunya(islemci);
    var yollar = [
      [merkez(tusA).add(new V3(0, 0.8, 0))].concat(m.klavyeYol.slice(1)),
      [dunya(m.kasa.getObjectByName('kablo-giris')), m.kw(-2, 38, -17), cpu],
      [cpu, merkez(ekk), dunya(m.kasa.getObjectByName('goruntu-cikis'))].concat(m.monYol.slice().reverse().slice(1), [merkez(ekran.mesh)]),
      [cpu, m.kw(-1, 20, 2), merkez(ssd)]
    ];
    var kasaGorunum = { theta: -0.95, phi: 1.12, yakinlik: 0.55, hedef: m.kw(0, 24, 0) };
    var genelGorunum = null;
    var notEl = null;

    function asamaOynat(i, hizli) {
      var hiz = hizli ? 160 : 34;
      var vurguBekle = hizli ? 0.15 : 1.3;
      cipDurum(i, 'aktif');
      var once = Promise.resolve();
      if (!hizli && (i === 1 || i === 3)) once = s.kameraGit(kasaGorunum, 1);
      if (!hizli && (i === 0 || i === 2) && genelGorunum) once = s.kameraGit(genelGorunum, 0.9);
      if (i === 0) once = once.then(function () { return D.bas(tusA); });
      return once.then(function () {
        return D.akis(s, yollar[i], { etiket: 'A', hiz: hiz, parcacik: hizli ? 6 : 14 });
      }).then(function () {
        if (i === 0) return D.vurgula(tusA, { etiket: 'Girdi: A tuşu', sure: 0.4 }).then(function () { return D.bekle(vurguBekle, s); }).then(function () { return D.vurguKaldir(tusA); });
        if (i === 1) return D.vurgula(islemci, { etiket: 'İşlem: “A yazılacak” kararı' }).then(function () { return D.bekle(vurguBekle, s); }).then(function () { return D.vurguKaldir(islemci); });
        if (i === 2) {
          ekran.ciz(editorCiz('A'));
          var et = s.etiket(ekran.mesh, 'Çıktı: ekranda A', { tur: 'vurgu' });
          return D.bekle(vurguBekle + 0.3, s).then(function () { et.kaldir(); });
        }
        D.yanipSon(diskIsigi, { kez: 4, sure: 1.2 });
        return D.vurgula(ssd, { etiket: 'Depolama: A kaydedildi' }).then(function () { return D.bekle(vurguBekle + 0.4, s); }).then(function () { return D.vurguKaldir(ssd); });
      }).then(function () { cipDurum(i, 'bitti'); });
    }

    var calisiyor = false, adimSira = 0;
    var oynatBtn = s.dugme('Oynat', 'oynat', function () { oynat(); }, { yer: 'alt-sol', sinif: 'don3d-dugme--birincil', aciklama: 'Harfin yolculuğunu oynat' });
    var adimBtn = AZ ? s.dugme('Adım adım', 'adim', function () { adim(); }, { yer: 'alt-sol', aciklama: 'Bir sonraki işi göster' }) : null;

    function hazirla() {
      ekran.ciz(editorCiz(''));
      cipler.forEach(function (c, i) { cipDurum(i, null); });
      if (notEl) { notEl.remove(); notEl = null; }
      if (!genelGorunum) genelGorunum = { theta: s.orb.theta, phi: s.orb.phi, yakinlik: s.orb.yakinlik, hedef: s.orb.hedef.clone() };
    }
    function bitir() {
      calisiyor = false;
      oynatBtn.querySelector('span').textContent = 'Tekrar oynat';
      if (asama === 3 && tahmin != null) {
        notEl = D.div('don3d-ipucu', s.arayuz);
        notEl.style.bottom = '56px';
        notEl.textContent = 'Tahminin: “' + TAHMINLER[tahmin] + '” ' + (tahmin === 1 ? 'Doğru tahmin!' : 'Gördün: harf önce kasaya gitti.');
      }
    }
    function oynat() {
      if (calisiyor) return;
      calisiyor = true; adimSira = 0;
      hazirla();
      var zincir = Promise.resolve();
      for (var i = 0; i < asama; i++) {
        (function (i) { zincir = zincir.then(function () { return asamaOynat(i, i < asama - 1); }); })(i);
      }
      zincir.then(bitir, function (e) { console.error(e); calisiyor = false; });
    }
    function adim() {
      if (calisiyor) return;
      if (adimSira === 0) hazirla();
      if (adimSira >= asama) { adimSira = 0; hazirla(); }
      calisiyor = true;
      asamaOynat(adimSira, false).then(function () {
        calisiyor = false; adimSira++;
        if (adimSira >= asama) bitir();
      });
    }
    // Slayt açılınca bir kez kendiliğinden oynar (hareket azaltmada öğrenci başlatır)
    if (!AZ) D.bekle(0.6, s).then(oynat);
    return s;
  }
  [['#s6-3d', 1], ['#s7-3d', 2], ['#s8-3d', 3], ['#s9-3d', 4]].forEach(function (x) {
    D.tembel(x[0], function (kap) { yolculuk(kap, x[1]); });
  });

  /* ─────────── Etkinlik 1: Donanım mı, yazılım mı? — E-SINIFLA ─────────── */
  var S_EL = '<svg viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-2a2 2 0 0 0-4 0"/></svg>';
  var S_KOD = '<svg viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 8 4 12 8 16"/><polyline points="16 8 20 12 16 16"/><line x1="14" y1="5" x2="10" y2="19"/></svg>';
  D.tembel('#sinifla-1', function (kap) {
    D.sinifla(kap, {
      kutular: [
        { id: 'd', ad: 'Donanım', aciklama: 'Elimle dokunabilirim.', simge: S_EL },
        { id: 'y', ad: 'Yazılım', aciklama: 'Dokunamam; ekranda çalışır.', simge: S_KOD }
      ],
      ogeler: [
        { id: 'klavye', ad: 'Klavye', model: 'M-KLAVYE', kutu: 'd', ipucu: 'Klavyeye elinle dokunabilirsin.' },
        { id: 'oyun', ad: 'Oyun', svg: '<!--@dahil:app-oyun.svg-->', kutu: 'y', ipucu: 'Oyun bir programdır; ona elinle dokunamazsın.' },
        { id: 'monitor', ad: 'Monitör', model: 'M-MONITOR', kutu: 'd', ipucu: 'Monitör, masada duran bir parçadır.' },
        { id: 'harita', ad: 'Harita uygulaması', svg: '<!--@dahil:app-harita.svg-->', kutu: 'y', ipucu: 'Uygulamalar ekranda çalışan programlardır.' },
        { id: 'fare', ad: 'Fare', model: 'M-FARE', kutu: 'd', ipucu: 'Fareyi eline alıp hareket ettirirsin.' },
        { id: 'resim', ad: 'Resim programı', svg: '<!--@dahil:app-resim.svg-->', kutu: 'y', ipucu: 'Program, donanıma ne yapacağını söyler.' },
        { id: 'kasa', ad: 'Kasa', model: 'M-MASAUSTU', yon: [-0.9, 0.45, 1.1], kutu: 'd', ipucu: 'Kasanın içinde dokunulabilen parçalar var.' },
        { id: 'tarayici', ad: 'Web tarayıcısı', svg: '<!--@dahil:app-tarayici.svg-->', kutu: 'y', ipucu: 'Tarayıcı, internet sayfalarını açan bir programdır.' }
      ],
      bitisMetni: 'Harika! Donanımı yazılımdan ayırdın.'
    });
  });

  /* ─────────── Etkinlik 2: Dört iş kutusu — E-SINIFLA ─────────── */
  function simge(yol) { return '<svg viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + yol + '</svg>'; }
  D.tembel('#sinifla-2', function (kap) {
    D.sinifla(kap, {
      kutular: [
        { id: 'g', ad: 'Girdi', aciklama: 'Bilgi verir.', simge: simge('<path d="M12 3v11M8 10l4 4 4-4"/><path d="M4 17v3h16v-3"/>') },
        { id: 'i', ad: 'İşlem', aciklama: 'Karar verir.', simge: simge('<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>') },
        { id: 'c', ad: 'Çıktı', aciklama: 'Sonucu gösterir.', simge: simge('<path d="M12 14V3M8 7l4-4 4 4"/><path d="M4 17v3h16v-3"/>') },
        { id: 'd', ad: 'Depolama', aciklama: 'Saklar.', simge: simge('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>') }
      ],
      ogeler: [
        { id: 'mikrofon', ad: 'Mikrofon', svg: '<!--@dahil:is-mikrofon.svg-->', kutu: 'g', ipucu: 'Mikrofon sesini bilgisayara verir.' },
        { id: 'yazici', ad: 'Yazıcı', svg: '<!--@dahil:is-yazici.svg-->', kutu: 'c', ipucu: 'Yazıcı sonucu kâğıda basar.' },
        { id: 'islemci', ad: 'Bilgisayarın işlemcisi', svg: '<!--@dahil:is-islemci.svg-->', kutu: 'i', ipucu: 'İşlemci bilgiyi işler ve karar verir.' },
        { id: 'usb', ad: 'USB bellek', svg: '<!--@dahil:is-usb.svg-->', kutu: 'd', ipucu: 'USB bellek dosyaları saklar.' },
        { id: 'camasir', ad: 'Çamaşır makinesi düğmesi', svg: '<!--@dahil:is-camasir.svg-->', kutu: 'g', ipucu: 'Düğmeyle makineye hangi programı istediğini söylersin.' },
        { id: 'hoparlor', ad: 'Hoparlör', svg: '<!--@dahil:is-hoparlor.svg-->', kutu: 'c', ipucu: 'Hoparlör sesi dışarı verir.' },
        { id: 'telcip', ad: 'Telefonun işlemci çipi', svg: '<!--@dahil:is-telefon-cip.svg-->', kutu: 'i', ipucu: 'Telefonun içindeki çip de işlem yapar.' },
        { id: 'telhafiza', ad: 'Telefonun hafızası', svg: '<!--@dahil:is-telefon-hafiza.svg-->', kutu: 'd', ipucu: 'Fotoğrafların telefon hafızasında saklanır.' }
      ],
      bitisMetni: 'Süper! Dört işi her cihazda buldun.'
    });
  });
})();
