/* ════════════════════════════════════════════════════════════════════
   DON3D — Etkileşim kalıpları (E-*).
   Renk tek başına bilgi taşımaz: doğru/yanlış için simge + metin kullanılır.
   ════════════════════════════════════════════════════════════════════ */
(function (kok) {
  'use strict';
  var THREE = kok.THREE, D = kok.DON3D;
  if (!THREE || !D) return;

  /* ─── E-DONDUR: sürükle-döndür, tekerlek/iki parmak yakınlaştır, klavye, Sıfırla ─── */
  /**
   * DON3D.dondur(sahne, { sinir: {minPolar, maxPolar, minYakin, maxYakin}, sifirlaDugmesi: true, ipucu })
   */
  D.dondur = function (sahne, ops) {
    ops = ops || {};
    sahne.girdiAcik = true;
    if (ops.sinir) Object.assign(sahne.sinir, ops.sinir);
    sahne.kap.classList.add('don3d--dondur');
    if (ops.sifirlaDugmesi !== false) {
      sahne.dugme('', 'sifirla', function () { sahne.sifirla(); }, { aciklama: 'Görünümü sıfırla (R)', yer: 'ust-sag' });
    }
    if (ops.ipucu !== false) {
      var ip = D.div('don3d-ipucu', sahne.arayuz);
      ip.innerHTML = D.simge('dondur') + '<span>' + (ops.ipucu || 'Sürükle: döndür') + '</span>';
      var kaldir = function () { ip.classList.add('don3d-ipucu--gizli'); };
      sahne.kap.addEventListener('pointerdown', kaldir, { once: true });
      sahne.kap.addEventListener('keydown', kaldir, { once: true });
    }
    return sahne;
  };

  /* ─── E-BILGI: parçaya tıkla → bilgi kartı ─── */
  /**
   * DON3D.bilgi(sahne, parcaAdlari | null, { kart: true, onSecim })
   * parcaAdlari null ise userData.etiket taşıyan tüm parçalar seçilebilir.
   */
  D.bilgi = function (sahne, parcaAdlari, ops) {
    ops = ops || {};
    var kart = D.div('don3d-kart', sahne.arayuz);
    kart.setAttribute('role', 'status');
    kart.setAttribute('aria-live', 'polite');
    kart.hidden = true;
    var secili = null;
    if (parcaAdlari) sahne._secimFiltresi = parcaAdlari;
    function kapat() {
      kart.hidden = true;
      if (secili) { D.vurguKaldir(secili); secili = null; }
    }
    sahne.tiklaninca(function (p) {
      if (p && parcaAdlari && parcaAdlari.indexOf(p.name) < 0) p = null;
      if (secili && secili !== p) D.vurguKaldir(secili);
      if (!p) { kapat(); return; }
      secili = p;
      D.vurgula(p, { etiket: false });
      if (ops.kart !== false) {
        kart.innerHTML = '';
        var b = document.createElement('div'); b.className = 'don3d-kart-baslik'; b.textContent = p.userData.etiket;
        var t = document.createElement('div'); t.className = 'don3d-kart-metin'; t.textContent = p.userData.bilgi || '';
        var k = document.createElement('button'); k.type = 'button'; k.className = 'don3d-kart-kapat';
        k.setAttribute('aria-label', 'Kartı kapat'); k.innerHTML = D.simge('kapat');
        k.addEventListener('click', function (e) { e.stopPropagation(); kapat(); });
        kart.appendChild(k); kart.appendChild(b); kart.appendChild(t);
        kart.hidden = false;
      }
      if (ops.onSecim) ops.onSecim(p);
    });
    return { kapat: kapat };
  };

  /* ─── E-SINIFLA: öğeleri doğru kutulara sürükle; anında geri bildirim ─── */
  /**
   * DON3D.sinifla(kapsayici, {
   *   ogeler:  [{ id, ad, kutu, model?: 'M-KLAVYE', svg?: '<svg…>', ipucu?: 'yanlışta gösterilecek açıklama' }],
   *   kutular: [{ id, ad, aciklama?, simge?: '<svg…>' }],
   *   onDogru, onYanlis, onBitti({ dogru, yanlis })
   * })
   * Sürükle-bırak, dokun-seç-dokun-bırak ve klavye (Enter/Boşluk) ile çalışır.
   */
  D.sinifla = function (kap, ops) {
    if (typeof kap === 'string') kap = document.querySelector(kap);
    var kok2 = D.div('don3d-sinifla', null);
    kap.appendChild(kok2);
    var tepsi = D.div('dsn-tepsi', kok2);
    tepsi.setAttribute('role', 'list');
    var kutularEl = D.div('dsn-kutular', kok2);
    kutularEl.style.setProperty('--dsn-sutun', ops.kutular.length);
    var alt = D.div('dsn-alt', kok2);
    var geri = D.div('dsn-geri', alt);
    geri.setAttribute('aria-live', 'polite');
    geri.textContent = ops.baslangicMetni || 'Bir öğeyi sürükle ya da önce öğeye, sonra kutuya dokun.';
    var sifirBtn = document.createElement('button');
    sifirBtn.type = 'button'; sifirBtn.className = 'dsn-sifirla';
    sifirBtn.innerHTML = D.simge('tekrar') + '<span>Yeniden</span>';
    alt.appendChild(sifirBtn);

    var sayac = { dogru: 0, yanlis: 0 };
    var secili = null;
    var kutuHaritasi = {};

    ops.kutular.forEach(function (k) {
      var el = D.div('dsn-kutu', kutularEl);
      el.dataset.kutu = k.id;
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', k.ad + ' kutusu');
      var bas = D.div('dsn-kutu-bas', el);
      bas.innerHTML = (k.simge ? '<span class="dsn-kutu-simge">' + k.simge + '</span>' : '') +
        '<span class="dsn-kutu-ad"></span>';
      bas.querySelector('.dsn-kutu-ad').textContent = k.ad;
      if (k.aciklama) { var a = D.div('dsn-kutu-aciklama', bas); a.textContent = k.aciklama; }
      D.div('dsn-kutu-ic', el);
      el.addEventListener('click', function () { if (secili) birak(secili, k.id); });
      el.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && secili) { e.preventDefault(); e.stopPropagation(); birak(secili, k.id); }
      });
      kutuHaritasi[k.id] = el;
    });

    var ogeElleri = ops.ogeler.map(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dsn-oge';
      b.dataset.oge = o.id;
      b.setAttribute('role', 'listitem');
      var res = D.div('dsn-resim', b);
      var url = o.model ? D.kucukResim(o.model, { w: 120, h: 90, yon: o.yon }) : null;
      if (url) { var img = document.createElement('img'); img.src = url; img.alt = ''; res.appendChild(img); }
      else if (o.svg) res.innerHTML = o.svg;
      var ad = document.createElement('span'); ad.className = 'dsn-ad'; ad.textContent = o.ad;
      b.appendChild(ad);
      b._oge = o;
      tepsi.appendChild(b);
      suruklemeBagla(b);
      b.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); sec(b); }
      });
      return b;
    });

    function sec(b) {
      if (b.classList.contains('dsn-oge--yerlesti')) return;
      if (secili) secili.classList.remove('dsn-oge--secili');
      secili = secili === b ? null : b;
      if (secili) {
        secili.classList.add('dsn-oge--secili');
        geri.className = 'dsn-geri';
        geri.textContent = '“' + b._oge.ad + '” seçildi. Şimdi doğru kutuya dokun.';
      }
    }

    function birak(b, kutuId) {
      var o = b._oge;
      b.classList.remove('dsn-oge--secili');
      secili = null;
      if (o.kutu === kutuId) {
        sayac.dogru++;
        b.classList.add('dsn-oge--yerlesti');
        b.setAttribute('aria-disabled', 'true');
        b.tabIndex = -1;
        var isaret = D.div('dsn-isaret', b); isaret.innerHTML = D.simge('dogru');
        kutuHaritasi[kutuId].querySelector('.dsn-kutu-ic').appendChild(b);
        geri.className = 'dsn-geri dsn-geri--dogru';
        geri.innerHTML = D.simge('dogru') + '<span></span>';
        geri.lastChild.textContent = 'Doğru! ' + (o.dogruMetin || '');
        if (ops.onDogru) ops.onDogru(o);
        if (sayac.dogru === ops.ogeler.length) bitti();
      } else {
        sayac.yanlis++;
        b.classList.remove('dsn-oge--salla'); void b.offsetWidth; b.classList.add('dsn-oge--salla');
        geri.className = 'dsn-geri dsn-geri--yanlis';
        geri.innerHTML = D.simge('yanlis') + '<span></span>';
        geri.lastChild.textContent = 'Tekrar düşün. ' + (o.ipucu || '');
        if (ops.onYanlis) ops.onYanlis(o, kutuId);
      }
    }

    function bitti() {
      geri.className = 'dsn-geri dsn-geri--dogru';
      geri.innerHTML = D.simge('dogru') + '<span></span>';
      geri.lastChild.textContent = (ops.bitisMetni || 'Tamamladın!') +
        (sayac.yanlis ? ' (' + sayac.yanlis + ' deneme hatası)' : ' Hiç hata yapmadın.');
      kok2.classList.add('don3d-sinifla--bitti');
      if (ops.onBitti) ops.onBitti({ dogru: sayac.dogru, yanlis: sayac.yanlis });
    }

    function sifirla() {
      sayac.dogru = 0; sayac.yanlis = 0; secili = null;
      kok2.classList.remove('don3d-sinifla--bitti');
      ogeElleri.forEach(function (b) {
        b.classList.remove('dsn-oge--yerlesti', 'dsn-oge--secili', 'dsn-oge--salla');
        b.removeAttribute('aria-disabled'); b.tabIndex = 0;
        var i = b.querySelector('.dsn-isaret'); if (i) i.remove();
        tepsi.appendChild(b);
      });
      geri.className = 'dsn-geri';
      geri.textContent = ops.baslangicMetni || 'Bir öğeyi sürükle ya da önce öğeye, sonra kutuya dokun.';
    }
    sifirBtn.addEventListener('click', sifirla);

    function suruklemeBagla(b) {
      var bas = null, hayalet = null;
      b.addEventListener('pointerdown', function (e) {
        if (b.classList.contains('dsn-oge--yerlesti') || e.button > 0) return;
        bas = { x: e.clientX, y: e.clientY, id: e.pointerId };
        try { b.setPointerCapture(e.pointerId); } catch (x) {}
      });
      b.addEventListener('pointermove', function (e) {
        if (!bas || e.pointerId !== bas.id) return;
        if (!hayalet && Math.hypot(e.clientX - bas.x, e.clientY - bas.y) > 8) {
          hayalet = b.cloneNode(true);
          hayalet.classList.add('dsn-hayalet');
          var r = b.getBoundingClientRect();
          hayalet.style.width = r.width + 'px';
          document.body.appendChild(hayalet);
          b.classList.add('dsn-oge--tasiniyor');
        }
        if (hayalet) {
          hayalet.style.transform = 'translate(' + (e.clientX - 30) + 'px,' + (e.clientY - 30) + 'px)';
          ustunde(e.clientX, e.clientY);
        }
      });
      function bitir(e) {
        if (!bas || e.pointerId !== bas.id) return;
        var surukledi = !!hayalet;
        if (hayalet) { hayalet.remove(); hayalet = null; }
        b.classList.remove('dsn-oge--tasiniyor');
        ustunde(-1, -1);
        bas = null;
        if (surukledi && e.type === 'pointerup') {
          var k = kutuAltinda(e.clientX, e.clientY);
          if (k) birak(b, k);
          b._surukledi = true;
        }
      }
      b.addEventListener('pointerup', bitir);
      b.addEventListener('pointercancel', bitir);
      b.addEventListener('click', function (e) {
        if (b._surukledi) { b._surukledi = false; return; }
        e.stopPropagation();
        sec(b);
      });
      // MASTER swipe ile slayt geçişini engelle
      ['touchstart', 'touchend'].forEach(function (ad) {
        b.addEventListener(ad, function (e) { e.stopPropagation(); }, { passive: true });
      });
    }
    function kutuAltinda(x, y) {
      var id = null;
      Object.keys(kutuHaritasi).forEach(function (k) {
        var r = kutuHaritasi[k].getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) id = k;
      });
      return id;
    }
    function ustunde(x, y) {
      var id = kutuAltinda(x, y);
      Object.keys(kutuHaritasi).forEach(function (k) { kutuHaritasi[k].classList.toggle('dsn-kutu--ustunde', k === id); });
    }
    return { sifirla: sifirla, sayac: sayac };
  };
})(typeof window !== 'undefined' ? window : this);
