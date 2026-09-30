/* DON-201 H02 — Bit ve Byte · ders betiği */
(function () {
  'use strict';
  var D = window.DON3D;
  D.baslat({ kalite: 'otomatik' });
  var AZ = D.azHareket();
  var tahmin = null;

  /* ─────────── Hedefler: kazanım başına küçük simge ─────────── */
  var HEDEF_SIMGE = [
    '<rect x="7" y="4" width="10" height="16" rx="3"/><path d="M12 9v6"/>',
    '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7v10M10 7v10M14 7v10M18 7v10"/>',
    '<rect x="3" y="14" width="4" height="6"/><rect x="9" y="10" width="4" height="10"/><rect x="15" y="5" width="4" height="15"/>',
    '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 7"/>'
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

  /* ─────────── Isınma: tahmin et → Adım 1'de gör ─────────── */
  var TAHMINLER = ['Küçük bir harf resmi olarak.', 'Açık–kapalı elektrik sinyalleri olarak.', 'Sesli bir mesaj olarak.'];
  document.querySelectorAll('.tahmin-sec').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tahmin-sec').forEach(function (x) { x.classList.remove('secili'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('secili'); b.setAttribute('aria-pressed', 'true');
      tahmin = +b.dataset.tahmin;
      document.getElementById('tahmin-geri').textContent = '📌 Tahminini aldık. Adım 1’de ampulle birlikte göreceğiz.';
    });
  });

  /* ─────────── Ortak: ampul sahnesi ─────────── */
  function ampulSahnesi(kap, ops) {
    ops = ops || {};
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, arkaPlan: ops.arkaPlan,
      kamera: ops.kamera || { yon: [0.1, 0.55, 1], pay: 0.92, hedefOfset: [0, -1, 0] } });
    var m = s.ekle('M-AMPUL-SIRASI', { modelOps: { adet: ops.adet || 8 } });
    s.yerlestir();
    if (ops.dondur !== false) D.dondur(s, { ipucu: false, sinir: { minPolar: 0.5, maxPolar: 1.35, minYakin: 0.6, maxYakin: 1.4 } });
    return { s: s, m: m };
  }

  /* Kapak: ampuller B, Y, T, E harflerini sırayla yazar */
  D.tembel('#kapak-3d', function (kap) {
    var a = ampulSahnesi(kap, { arkaPlan: 'seffaf', dondur: false, kamera: { yon: [0.28, 0.6, 1], pay: 1.08, hedefOfset: [0, -1, 0] } });
    var sy = D.sayac(a.s, a.m, { kilitli: true, harf: true, bitEtiketi: false });
    var harfler = [66, 89, 84, 69], i = 0;
    (function dongu() {
      sy.ayarla(harfler[i % harfler.length], 0.3).then(function () { return D.bekle(1.6, a.s); }).then(function () { i++; dongu(); });
    })();
  });

  /* Adım 1: tek ampul */
  D.tembel('#s4-3d', function (kap) {
    var a = ampulSahnesi(kap, { adet: 1, kamera: { yon: [0.3, 0.45, 1], pay: 0.9, hedefOfset: [0, 0.5, 0] } });
    var ilk = true;
    D.sayac(a.s, a.m, { bitEtiketi: false,
      onDegis: function (b) {
        if (!ilk || !b[0]) return;
        ilk = false;
        var not = D.div('don3d-ipucu', a.s.arayuz);
        not.style.bottom = '12px';
        not.textContent = tahmin == null ? 'Kablodaki harf de böyle açık–kapalı sinyallerle gider.' :
          'Tahminin: “' + TAHMINLER[tahmin] + '” ' + (tahmin === 1 ? 'Doğru! Harf 1 ve 0 sinyalleriyle gider.' : 'Harf aslında 1 ve 0 sinyalleriyle gider.');
      }
    });
    var ip = D.div('don3d-ipucu', a.s.arayuz);
    ip.innerHTML = D.simge('oynat') + '<span>Ampule dokun</span>';
    a.s.kap.addEventListener('pointerdown', function () { ip.classList.add('don3d-ipucu--gizli'); }, { once: true });
  });

  /* Adım 2: bit sayısı → olası desenler (2D) */
  (function () {
    var kok = document.getElementById('bit-kombin');
    if (!kok) return;
    var secici = D.div('bk-secici', kok);
    var izgara = D.div('bk-izgara', kok);
    var sonuc = D.div('bk-sonuc', kok);
    sonuc.setAttribute('aria-live', 'polite');
    var dugmeler = [1, 2, 3].map(function (n) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = n + ' bit';
      b.addEventListener('click', function () { goster(n); });
      secici.appendChild(b);
      return b;
    });
    function goster(n) {
      dugmeler.forEach(function (b, i) { b.setAttribute('aria-pressed', i + 1 === n ? 'true' : 'false'); });
      izgara.innerHTML = '';
      var adet = Math.pow(2, n);
      for (var d = 0; d < adet; d++) {
        var k = D.div('bk-desen', izgara);
        k.style.animationDelay = (AZ ? 0 : d * 0.06) + 's';
        var amp = D.div('bk-ampuller', k), kod = '';
        for (var j = n - 1; j >= 0; j--) {
          var b = (d >> j) & 1;
          D.div('bk-ampul' + (b ? ' acik' : ''), amp);
          kod += b;
        }
        D.div('bk-kod', k).textContent = kod;
      }
      sonuc.textContent = n + ' bit → ' + adet + ' farklı desen';
    }
    goster(2);
  })();

  /* Adım 3: byte — 8 ampul, basamak değerleri */
  D.tembel('#s6-3d', function (kap) {
    var a = ampulSahnesi(kap);
    D.sayac(a.s, a.m, { basamaklar: true });
  });

  /* Adım 4: harfler sayıdır */
  D.tembel('#s7-3d', function (kap) {
    var a = ampulSahnesi(kap);
    var sy = D.sayac(a.s, a.m, { basamaklar: true, harf: true });
    var dugmeler = [];
    [['A', 65], ['B', 66], ['C', 67]].forEach(function (h) {
      dugmeler.push(a.s.dugme(h[0] + ' yaz', null, function () { elle = true; sec(h[1]); }, { yer: 'alt-orta', aciklama: h[0] + ' harfini ampullerle yaz' }));
    });
    var elle = false;
    function sec(n) {
      dugmeler.forEach(function (b, i) { b.classList.toggle('don3d-dugme--secili', 65 + i === n); });
      return sy.ayarla(n, 0.3);
    }
    if (!AZ) {
      var i = 0;
      (function dongu() {
        if (elle || i > 2) return;
        D.bekle(i ? 1.8 : 0.6, a.s).then(function () { if (!elle) return sec(65 + i); }).then(function () { i++; dongu(); });
      })();
    }
  });

  /* Adım 5: A-OLCEK — byte → KB → MB → GB → TB */
  (function () {
    var kok = document.getElementById('olcek');
    if (!kok) return;
    var BASAMAK = [
      { ad: '1 byte', ornek: 'bir harf' }, { ad: '1 KB', ornek: 'yarım sayfa yazı' }, { ad: '1 MB', ornek: 'kalın bir roman' },
      { ad: '1 GB', ornek: 'yaklaşık 250 fotoğraf' }, { ad: '1 TB', ornek: 'yaklaşık 500 film' }
    ];
    var merdiven = D.div('olcek-merdiven', kok);
    var etiketler = ['byte', 'KB', 'MB', 'GB', 'TB'].map(function (t) { var e = document.createElement('span'); e.textContent = t; merdiven.appendChild(e); return e; });
    var alan = D.div('', kok); alan.style.flex = '1'; alan.style.minHeight = '0';
    var ol = D.olcek(alan, { basamaklar: BASAMAK, carpan: 1000 });
    var kontrol = D.div('olcek-kontrol', kok);
    function isaretle() { etiketler.forEach(function (e, i) { e.classList.toggle('aktif', i === ol.indeks); }); }
    function btn(t, sinif, fn, aciklama) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = t; if (sinif) b.className = sinif;
      b.setAttribute('aria-label', aciklama || t);
      b.addEventListener('click', function () { fn().then(isaretle); isaretle(); }); kontrol.appendChild(b); return b;
    }
    btn('◀', '', function () { return ol.git(ol.indeks - 1); }, 'Önceki birim');
    btn('▶ Oynat', 'birincil', function () { return ol.git(0).then(function () { return ol.oynat(); }); }, 'Tüm birimleri oynat');
    btn('▶', '', function () { return ol.git(ol.indeks + 1); }, 'Sonraki birim');
    isaretle();
    // slayt açılınca bir kez kendiliğinden oynar
    var slayt = document.getElementById('s8'), oynadi = false;
    new MutationObserver(function () {
      if (!oynadi && slayt.classList.contains('active') && !AZ) {
        oynadi = true;
        setTimeout(function () { ol.git(0).then(function () { var z = Promise.resolve(); [1, 2, 3, 4].forEach(function (k) { z = z.then(function () { return ol.git(k); }).then(function () { isaretle(); return D.bekle(1.2); }); }); }); }, 500);
      }
    }).observe(slayt, { attributes: true, attributeFilter: ['class'] });
  })();

  /* Adım 6: E-TAHMIN + A-DOLUM — 32 GB belleğe kaç fotoğraf? */
  var SIMGE = {
    foto: '<!--@dahil:simge-foto.svg-->', muzik: '<!--@dahil:simge-muzik.svg-->',
    film: '<!--@dahil:simge-film.svg-->', kitap: '<!--@dahil:simge-kitap.svg-->'
  };
  var DEPO_SVG = '<svg viewBox="0 0 40 48" aria-hidden="true"><path d="M4 4h22l10 10v30H4z" fill="#334155"/><path d="M8 8h16l8 8v24H8z" fill="#475569"/>' +
    '<g fill="#f2c257"><rect x="10" y="4" width="3" height="7"/><rect x="15" y="4" width="3" height="7"/><rect x="20" y="4" width="3" height="7"/></g></svg>';
  /* Seçimden önce: [depo] ÷ [dosya] = ? */
  function bolmeGiris(kapasite, depoAd, boyut, simge, ogeAd) {
    function oge(sinif, gorsel, b, s) {
      return '<div class="h2-bol-oge ' + sinif + '">' + gorsel + '<b>' + b + '</b><span>' + s + '</span></div>';
    }
    return '<div class="h2-bol" aria-hidden="true">' + oge('h2-bol-depo', DEPO_SVG, kapasite, depoAd) +
      '<div class="h2-bol-isaret">÷</div>' + oge('', simge, boyut, '1 ' + ogeAd) +
      '<div class="h2-bol-isaret">=</div>' + oge('h2-bol-soru', '<i>?</i>', 'kaç', ogeAd) + '</div>';
  }
  (function () {
    var kok = document.getElementById('foto-tahmin');
    if (!kok) return;
    D.tahmin(kok, {
      soru: '32 GB belleğe 4 MB’lık fotoğraftan kaç tane sığar?',
      secenekler: ['80', '800', '8000', '80 000'], dogru: 2,
      giris: bolmeGiris('32 GB', 'bellek', '4 MB', SIMGE.foto, 'fotoğraf'),
      sonra: function (sahne) { return D.dolum(sahne, { kapasite: 32000, ogeBoyut: 4, birim: 'MB', ogeAd: 'fotoğraf', simge: SIMGE.foto }); },
      aciklama: '32 GB = 32 000 MB; 32 000 ÷ 4 = 8000 fotoğraf.'
    });
  })();

  /* Etkinlik 1: görevlerle harf yaz (E-SAYAC) */
  D.tembel('#s10-3d', function (kap) {
    var a = ampulSahnesi(kap);
    var GOREV = [
      function (n) { return n === 5; }, function (n) { return n === 255; },
      function (n) { return n === 65; }, function (n) { return n >= 65 && n <= 90; }
    ];
    var liste = document.querySelectorAll('#gorevler li'), sira = 0;
    function isaretle() {
      liste.forEach(function (li, i) { li.classList.toggle('tamam', i < sira); li.classList.toggle('simdi', i === sira); });
    }
    isaretle();
    var sy = D.sayac(a.s, a.m, { basamaklar: true, harf: true, onDegis: function (b, n) {
      if (sira >= GOREV.length || !GOREV[sira](n)) return;
      sira++;
      isaretle();
      if (sira === GOREV.length) {
        var not = D.div('don3d-ipucu', a.s.arayuz); not.style.bottom = '64px';
        not.textContent = '✔ Tüm görevler tamam! ' + (D.harfKodu(n) || '') + ' harfini ampullerle yazdın.';
        if (!AZ && typeof window.confetti === 'function') window.confetti();
      }
    } });
    a.s.dugme('Hepsini söndür', 'sifirla', function () { sy.ayarla(0, 0.2); }, { yer: 'alt-sol', aciklama: 'Tüm ampulleri söndür' });
  });

  /* Etkinlik 2: bellek tahmin oyunu — önce birimleri sırala, sonra 3 tahmin turu */
  (function () {
    var kok = document.getElementById('bellek-oyunu');
    if (!kok) return;
    var ilerleme = document.getElementById('ilerleme-2');
    var dogruSay = 0;
    var TURLAR = [
      { soru: '8 GB telefon hafızasına 4 MB’lık şarkıdan kaç tane sığar?', secenekler: ['20', '200', '2000', '20 000'], dogru: 2,
        kapasite: 8000, oge: 4, birim: 'MB', ad: 'şarkı', simge: SIMGE.muzik, giris: ['8 GB', 'telefon', '4 MB'], aciklama: '8 GB = 8000 MB; 8000 ÷ 4 = 2000 şarkı.' },
      { soru: '1 TB diske 2 GB’lık filmden kaç tane sığar?', secenekler: ['50', '500', '5', '5000'], dogru: 1,
        kapasite: 1000, oge: 2, birim: 'GB', ad: 'film', simge: SIMGE.film, giris: ['1 TB', 'disk', '2 GB'], aciklama: '1 TB = 1000 GB; 1000 ÷ 2 = 500 film.' },
      { soru: '16 GB USB belleğe 2 MB’lık e-kitaptan kaç tane sığar?', secenekler: ['80', '800', '80 000', '8000'], dogru: 3,
        kapasite: 16000, oge: 2, birim: 'MB', ad: 'e-kitap', simge: SIMGE.kitap, giris: ['16 GB', 'USB bellek', '2 MB'], aciklama: '16 GB = 16 000 MB; 16 000 ÷ 2 = 8000 e-kitap.' }
    ];
    function tur(n) {
      ilerleme.querySelector('.etk-ilerleme-sayi b').textContent = Math.min(n, 4);
      ilerleme.querySelector('.etk-ilerleme-bar span').style.width = ((n - 1) / 4 * 100) + '%';
    }
    function siralama() {
      tur(1);
      kok.innerHTML = '';
      var bo = D.div('bo', kok);
      D.div('bo-baslik', bo).textContent = 'Tur 1: Birimlere küçükten büyüğe doğru dokun.';
      var sira = D.div('bo-sira', bo);
      var kartlar = D.div('bo-kartlar', bo);
      var geri = D.div('dth-sonuc', bo); geri.setAttribute('aria-live', 'polite');
      geri.textContent = 'En küçük birimle başla.';
      var DOGRU = ['byte', 'KB', 'MB', 'GB', 'TB'], adim = 0, hata = 0;
      ['GB', 'byte', 'TB', 'KB', 'MB'].forEach(function (t) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'bo-kart'; b.textContent = t;
        b.addEventListener('click', function () {
          if (t === DOGRU[adim]) {
            b.disabled = true; adim++;
            var e = document.createElement('span'); e.textContent = t; sira.appendChild(e);
            geri.className = 'dth-sonuc dth-sonuc--dogru'; geri.textContent = adim < 5 ? '✓ Doğru. Sıradaki daha büyük birim hangisi?' : '✓ Sıralama tamam!';
            if (adim === 5) {
              if (!hata) dogruSay++;
              var s = document.createElement('button'); s.type = 'button'; s.className = 'bo-sonraki'; s.textContent = 'Tahmin turlarına geç →';
              s.addEventListener('click', function () { tahminTuru(0); });
              bo.appendChild(s);
            }
          } else {
            hata++;
            geri.className = 'dth-sonuc dth-sonuc--yanlis';
            geri.textContent = '✗ Henüz değil. ' + t + ', ' + DOGRU[adim] + '’dan büyüktür.';
          }
        });
        kartlar.appendChild(b);
      });
    }
    function tahminTuru(i) {
      tur(i + 2);
      var t = TURLAR[i];
      kok.innerHTML = '';
      var bo = D.div('bo', kok);
      D.div('bo-baslik', bo).textContent = 'Tur ' + (i + 2) + ': Tahmin et';
      var alan = D.div('', bo); alan.style.flex = '1'; alan.style.minHeight = '0';
      D.tahmin(alan, {
        soru: t.soru, secenekler: t.secenekler, dogru: t.dogru, aciklama: t.aciklama,
        giris: bolmeGiris(t.giris[0], t.giris[1], t.giris[2], t.simge, t.ad),
        sonra: function (sahne) { return D.dolum(sahne, { kapasite: t.kapasite, ogeBoyut: t.oge, birim: t.birim, ogeAd: t.ad, simge: t.simge, sure: 1.8 }); },
        onBitti: function (dogru) {
          if (dogru) dogruSay++;
          var s = document.createElement('button'); s.type = 'button'; s.className = 'bo-sonraki';
          s.textContent = i < TURLAR.length - 1 ? 'Sonraki tur →' : 'Sonucu gör →';
          s.addEventListener('click', function () { if (i < TURLAR.length - 1) tahminTuru(i + 1); else bitir(); });
          bo.appendChild(s);
        }
      });
    }
    function bitir() {
      ilerleme.querySelector('.etk-ilerleme-bar span').style.width = '100%';
      ilerleme.classList.add('etk-ilerleme--bitti');
      kok.innerHTML = '';
      var bo = D.div('bo', kok), oz = D.div('bo-ozet', bo);
      oz.innerHTML = '<b></b><span></span>';
      oz.firstChild.textContent = dogruSay + ' / 4';
      oz.lastChild.textContent = dogruSay >= 3 ? 'Harika tahminci! Birimi aynı yapıp böldün.' : 'İpucu: önce GB’ı MB’a çevir (× 1000), sonra dosya boyutuna böl.';
      var s = document.createElement('button'); s.type = 'button'; s.className = 'bo-sonraki'; s.textContent = 'Yeniden oyna';
      s.addEventListener('click', function () { dogruSay = 0; ilerleme.classList.remove('etk-ilerleme--bitti'); siralama(); });
      oz.appendChild(s);
      if (!AZ && dogruSay >= 3 && typeof window.confetti === 'function') window.confetti();
    }
    siralama();
  })();
})();
