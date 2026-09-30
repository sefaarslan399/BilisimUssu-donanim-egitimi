/* Ortak ders betiği (DON-201/DON-301): hedef simgeleri, Derinleş bonus sorusu, ısınma tahmini.
   Derse özel betikten önce çalışır. window.DERS üzerinden kullanılır. */
(function () {
  'use strict';
  var D = window.DON3D;
  D.baslat({ kalite: 'otomatik' });
  var DERS = window.DERS = { tahmin: null, AZ: D.azHareket() };

  /* Hedefler: kazanım başına küçük simge (ders tanımındaki hedef_simgeler) */
  DERS.hedefSimgeleri = function (liste) {
    document.querySelectorAll('#s2-goals .goal-check').forEach(function (el, i) {
      el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        ((liste && liste[i]) || '<polyline points="20 6 9 17 4 12"/>') + '</svg>';
    });
  };

  /* Quiz: son soru Derinleş bonusu, puanı düşürmez */
  (function () {
    if (typeof LESSON === 'undefined' || !LESSON.quiz || LESSON.quiz.length < 5) return;
    var CEKIRDEK = LESSON.quiz.length - 1;
    var bonusDogru = false;
    function baslikDuzelt() {
      quizTotal = CEKIRDEK;
      var sc = document.querySelector('.quiz-score');
      if (sc) sc.innerHTML = sc.innerHTML.replace(/\/\s*\d+\s*$/, '/ ' + CEKIRDEK);
      var son = document.querySelector('.quiz-wrap[data-qi="' + CEKIRDEK + '"] .quiz-q');
      if (son) son.innerHTML = son.innerHTML.replace('Derinleş (bonus):', '<span class="bonus">Derinleş · Bonus</span>');
      var tot = document.getElementById('qc-tot');
      if (tot) tot.textContent = CEKIRDEK + ' + 1';
    }
    var asilBuild = window.buildQuiz, asilAns = window.quizAns;
    window.buildQuiz = function () { bonusDogru = false; asilBuild(); baslikDuzelt(); };
    window.quizAns = function (qi, oi, el, q, qb) {
      asilAns(qi, oi, el, q, qb);
      if (qi === CEKIRDEK && oi === q.correct) { score = score - 1; bonusDogru = true; }
      quizTotal = CEKIRDEK;
      document.getElementById('done-score').textContent = score + '/' + CEKIRDEK + (bonusDogru ? ' +1' : '');
      var v = document.getElementById('qsc-val');
      if (v) v.textContent = score;
      lmsUpdate();
    };
    baslikDuzelt();
  })();

  /* Isınma: tahmin seçilir, ilgili adımda hatırlatılır (DERS.tahminNotu) */
  DERS.tahminKur = function (mesaj) {
    document.querySelectorAll('.tahmin-sec').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.tahmin-sec').forEach(function (x) { x.classList.remove('secili'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('secili'); b.setAttribute('aria-pressed', 'true');
        DERS.tahmin = +b.dataset.tahmin;
        var g = document.getElementById('tahmin-geri');
        if (g) g.textContent = '📌 ' + (mesaj || 'Tahminini aldık. Derste birlikte göreceğiz.');
      });
    });
  };
  /* Tahmine göre kısa geri bildirim metni: dogru = doğru seçeneğin indeksi */
  DERS.tahminNotu = function (dogru, dogruMetin, yanlisMetin) {
    var b = document.querySelector('.tahmin-sec[data-tahmin="' + DERS.tahmin + '"]');
    var sen = b ? b.textContent.replace(/^[A-D]/, '').trim() : null;
    if (DERS.tahmin == null) return dogruMetin;
    return 'Tahminin: “' + sen + '” ' + (DERS.tahmin === dogru ? 'Doğru! ' + dogruMetin : yanlisMetin || dogruMetin);
  };

  /* Slayt etkinleşince bir kez çalıştır (2D animasyonları için) */
  DERS.slaytAcilinca = function (id, fn, herSeferinde) {
    var s = document.getElementById(id);
    if (!s) return;
    var calisti = false;
    function bak() {
      if (s.classList.contains('active') && (herSeferinde || !calisti)) { calisti = true; fn(s); }
    }
    new MutationObserver(bak).observe(s, { attributes: true, attributeFilter: ['class'] });
    bak();
  };

  /* Küçük yardımcılar */
  DERS.dugme = function (ebeveyn, metin, fn, sinif) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = metin;
    if (sinif) b.className = sinif;
    b.addEventListener('click', fn);
    ebeveyn.appendChild(b);
    return b;
  };
  DERS.konfeti = function () { if (!DERS.AZ && typeof window.confetti === 'function') window.confetti(); };
})();

/* Etkinlik ilerleme çubuğu bağlayıcısı: onIlerleme(dogru, toplam) */
window.DERS.ilerlemeBagla = function (id) {
  var el = document.getElementById(id);
  return function (dogru, toplam) {
    if (!el) return;
    el.querySelector('.etk-ilerleme-sayi b').textContent = dogru;
    el.querySelector('.etk-ilerleme-bar span').style.width = Math.round(dogru / toplam * 100) + '%';
    el.classList.toggle('etk-ilerleme--bitti', dogru === toplam);
  };
};

/* 3D sahneye durum mesajı: m = DERS.sahneMesaj(s); m('metin', 'dogru'|'yanlis'|'') */
window.DERS.sahneMesaj = function (s) {
  var el = window.DON3D.div('sahne-mesaj', s.arayuz);
  el.setAttribute('aria-live', 'polite');
  return function (metin, tur) { el.textContent = metin || ''; el.className = 'sahne-mesaj' + (tur ? ' ' + tur : ''); };
};
