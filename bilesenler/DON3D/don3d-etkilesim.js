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


  /* ─── E-TAK: parçayı yuvaya sürükle; doğru yönde oturur, yanlışta geri döner ve ipucu verir ─── */
  /**
   * DON3D.tak(sahne, parca, hedef, {
   *   dogruYon: function (parca) → bool,   // yön doğru mu? (ör. RAM çentiği çıkıntıyla hizalı mı)
   *   tolerans: 1.2 (cm), yukseklik: 4, yuva: M-RAM-YUVASI grubu,
   *   cevirEksen: 'y', onDogru, onYanlis(neden), onUzak
   * })
   * hedef: parça ile aynı ebeveyn koordinatında oturma noktası (Vector3).
   * Sürükleme yatay düzlemde yapılır. "Çevir" ve "Yuvaya götür" düğmeleri dokunmatik ve klavye içindir.
   */
  D.tak = function (sahne, parca, hedef, ops) {
    ops = ops || {};
    var kap = sahne.kap;
    var tol = ops.tolerans == null ? 1.2 : ops.tolerans;
    var yuk = ops.yukseklik == null ? 4 : ops.yukseklik;
    var baslangic = parca.position.clone();
    var baslangicRot = parca.rotation.clone();
    var mesgul = false, bitti = false;
    var isin = new THREE.Raycaster(), duzlem = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    var ofset = new THREE.Vector3(), surukle = null;

    // Hedef işareti: yuvanın üstünde yarı saydam kılavuz
    var isaret = new THREE.Mesh(new THREE.BoxGeometry(ops.isaretBoyut ? ops.isaretBoyut[0] : 13.4, 0.06, ops.isaretBoyut ? ops.isaretBoyut[1] : 0.9),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(D.vurguRengi(kap)), transparent: true, opacity: 0, depthWrite: false }));
    isaret.material.toneMapped = false;
    isaret.position.set(hedef.x, hedef.y + (ops.isaretY || 0.6), hedef.z);
    isaret.userData.secilmez = true; isaret.raycast = function () {};
    parca.parent.add(isaret);
    function isaretGoster(g) { isaret.material.opacity = g ? 0.45 : 0; }

    function ndc(e) {
      var r = kap.getBoundingClientRect();
      return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    }
    function parcayaDegdi(e) {
      isin.setFromCamera(ndc(e), sahne.kamera);
      return isin.intersectObject(parca, true).length > 0;
    }
    function duzlemNoktasi(e) {
      isin.setFromCamera(ndc(e), sahne.kamera);
      var p = new THREE.Vector3();
      var yerel = parca.parent;
      yerel.updateWorldMatrix(true, false);
      var dunyaY = new THREE.Vector3(0, parca.position.y, 0).applyMatrix4(yerel.matrixWorld).y;
      duzlem.constant = -dunyaY;
      if (!isin.ray.intersectPlane(duzlem, p)) return null;
      return yerel.worldToLocal(p);
    }
    kap.addEventListener('pointerdown', function (e) {
      if (mesgul || bitti || e.button > 0 || !parcayaDegdi(e)) return;
      e.stopImmediatePropagation();
      var p = duzlemNoktasi(e);
      if (!p) return;
      surukle = e.pointerId;
      ofset.copy(parca.position).sub(p);
      try { kap.setPointerCapture(e.pointerId); } catch (x) {}
      kap.classList.add('don3d--tasiyor');
      isaretGoster(true);
    }, true);
    kap.addEventListener('pointermove', function (e) {
      if (surukle !== e.pointerId) return;
      e.stopImmediatePropagation();
      var p = duzlemNoktasi(e);
      if (!p) return;
      parca.position.x = p.x + ofset.x;
      parca.position.z = p.z + ofset.z;
      var yakin = Math.hypot(parca.position.x - hedef.x, parca.position.z - hedef.z) < tol;
      isaret.material.opacity = yakin ? 0.8 : 0.35;
      D._donguBaslat();
    }, true);
    function birak(e) {
      if (surukle !== e.pointerId) return;
      e.stopImmediatePropagation();
      surukle = null;
      kap.classList.remove('don3d--tasiyor');
      isaretGoster(false);
      var uzak = Math.hypot(parca.position.x - hedef.x, parca.position.z - hedef.z);
      if (uzak < tol) dene();
      else {
        if (ops.onUzak) ops.onUzak();
        mesgul = true;
        D.git(parca, new THREE.Vector3(parca.position.x, hedef.y + yuk, parca.position.z), 0.3).then(function () { mesgul = false; });
      }
    }
    kap.addEventListener('pointerup', birak, true);
    kap.addEventListener('pointercancel', birak, true);
    ['touchstart', 'touchend', 'touchmove'].forEach(function (ad) {
      kap.addEventListener(ad, function (e) { e.stopPropagation(); }, { passive: true });
    });

    function dene() {
      if (mesgul || bitti) return Promise.resolve(false);
      mesgul = true;
      var dogru = ops.dogruYon ? !!ops.dogruYon(parca) : true;
      return D.takAnim(parca, { hedef: hedef, dogru: dogru, yukseklik: yuk, yuva: ops.yuva, engel: ops.engel }).then(function (oturdu) {
        mesgul = false;
        if (oturdu) {
          bitti = true;
          cevirBtn.disabled = true; takBtn.disabled = true;
          if (ops.onDogru) ops.onDogru();
        } else if (ops.onYanlis) ops.onYanlis('yon');
        return oturdu;
      });
    }
    function cevir() {
      if (mesgul || bitti) return;
      mesgul = true;
      var eksen = ops.cevirEksen || 'y', r0 = parca.rotation[eksen];
      D.tween({ sahne: sahne, sure: 0.6, guncelle: function (e) { parca.rotation[eksen] = r0 + Math.PI * e; } })
        .then(function () { parca.rotation[eksen] = (r0 + Math.PI) % (Math.PI * 2); mesgul = false; if (ops.onCevir) ops.onCevir(); });
    }
    function sifirla() {
      if (mesgul) return;
      bitti = false;
      cevirBtn.disabled = false; takBtn.disabled = false;
      var once = ops.yuva && !ops.yuva.userData.mandalAcik ? ops.yuva.userData.mandal(true) : Promise.resolve();
      mesgul = true;
      once.then(function () { return D.git(parca, baslangic.clone(), 0.6); }).then(function () {
        parca.rotation.copy(baslangicRot);
        mesgul = false;
        if (ops.onSifirla) ops.onSifirla();
      });
    }
    var cevirBtn = sahne.dugme('Çevir', 'dondur', cevir, { yer: 'alt-sol', aciklama: 'Parçayı 180 derece çevir' });
    var takBtn = sahne.dugme('Yuvaya götür', 'oynat', function () {
      if (mesgul || bitti) return;
      D.git(parca, new THREE.Vector3(hedef.x, parca.position.y, hedef.z), 0.5).then(dene);
    }, { yer: 'alt-sol', sinif: 'don3d-dugme--birincil', aciklama: 'Parçayı yuvaya götürüp takmayı dene' });
    sahne.dugme('Baştan', 'tekrar', sifirla, { yer: 'ust-sag', aciklama: 'Etkinliği baştan başlat' });
    return { dene: dene, cevir: cevir, sifirla: sifirla };
  };


  /* ─── E-SAYAC: ampullere tıklayarak sayı/harf oluştur ─── */
  /**
   * DON3D.sayac(sahne, ampulSirasi, { basamaklar: true, harf: false, bitEtiketi: true, kilitli: false,
   *                                   gosterge: true, onDegis(bitler, sayi) })
   * Döner: { ayarla(sayi, sure) → Promise, sayi(), bitler(), gosterge }
   */
  D.sayac = function (sahne, model, ops) {
    ops = ops || {};
    var amp = model.userData.ampuller, n = amp.length;
    var bitEt = [];
    var gosterge = ops.gosterge === false ? null : D.sayacGosterge(sahne.arayuz, { harf: !!ops.harf, bitler: n > 1 ? undefined : false, sayi: n > 1 ? undefined : false });
    if (gosterge && n === 1) gosterge.el.classList.add('dsy-tek');
    amp.forEach(function (a, i) {
      if (ops.bitEtiketi !== false) {
        var t = sahne.etiket(a, '0', { tur: 'bit', yer: 'alt', ofset: [0, -0.4, 4.2] });
        bitEt.push(t);
      }
    });
    function bitler() { return model.userData.durum.slice(); }
    function sayi() { return bitler().reduce(function (s, b) { return s * 2 + (b ? 1 : 0); }, 0); }
    function yenile() {
      var b = bitler();
      bitEt.forEach(function (t, i) {
        var deger = Math.pow(2, n - 1 - i);
        t.metin((b[i] ? '1' : '0') + (ops.basamaklar ? '\n' + deger : ''));
        t.el.classList.toggle('don3d-etiket--bit-acik', !!b[i]);
      });
      if (gosterge && n > 1) gosterge.guncelle(b);
      if (gosterge && n === 1) gosterge.el.textContent = b[0] ? 'Açık = 1' : 'Kapalı = 0';
      if (ops.onDegis) ops.onDegis(b, sayi());
    }
    if (!ops.kilitli) {
      sahne.tiklaninca(function (p) {
        if (!p || !/^ampul-\d+$/.test(p.name)) return;
        var i = p.userData.indeks;
        model.userData.ayarla(i, !model.userData.durum[i]);
        D.ses('klik');
        yenile();
      });
    }
    var api = {
      gosterge: gosterge, bitler: bitler, sayi: sayi, yenile: yenile,
      ayarla: function (deger, sure) {
        var z = [];
        for (var i = 0; i < n; i++) {
          var b = (deger >> (n - 1 - i)) & 1;
          z.push(model.userData.ayarla(i, !!b, sure));
        }
        return Promise.all(z).then(function () { yenile(); });
      }
    };
    yenile();
    return api;
  };

  /* ─── E-TAHMIN: önce tahmin seç, sonra animasyonu izle ve karşılaştır ─── */
  /**
   * DON3D.tahmin(el, {  giris?: 'seçimden önce sahnede duran HTML', soru, secenekler: ['80', '800', …], dogru: indeks, sonra: function () → Promise,
   *                    aciklama, onBitti(dogruMu) })
   * Döner: { sifirla() }
   */
  D.tahmin = function (el, ops) {
    el.innerHTML = '';
    var kok = D.div('dth', el);
    var soru = D.div('dth-soru', kok); soru.textContent = ops.soru;
    var sec = D.div('dth-secenekler', kok);
    sec.setAttribute('role', 'group');
    var sahne = D.div('dth-sahne', kok);
    if (ops.giris) sahne.innerHTML = ops.giris;   // seçimden önce gösterilen soru görseli
    var sonuc = D.div('dth-sonuc', kok);
    sonuc.setAttribute('aria-live', 'polite');
    sonuc.textContent = 'Önce tahminini seç.';
    var dugmeler = ops.secenekler.map(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dth-sec'; b.textContent = t;
      b.addEventListener('click', function () { sec_(i); });
      sec.appendChild(b);
      return b;
    });
    function sec_(i) {
      dugmeler.forEach(function (b) { b.disabled = true; });
      dugmeler[i].classList.add('dth-secili');
      sonuc.className = 'dth-sonuc';
      sonuc.textContent = 'Tahminin: ' + ops.secenekler[i] + '. Şimdi izle…';
      Promise.resolve(ops.sonra ? ops.sonra(sahne) : null).then(function () {
        var dogru = i === ops.dogru;
        dugmeler[ops.dogru].classList.add('dth-dogru');
        if (!dogru) dugmeler[i].classList.add('dth-yanlis');
        sonuc.className = 'dth-sonuc ' + (dogru ? 'dth-sonuc--dogru' : 'dth-sonuc--yanlis');
        sonuc.innerHTML = D.simge(dogru ? 'dogru' : 'yanlis') + '<span></span>';
        sonuc.lastChild.textContent = (dogru ? 'Tahminin doğru! ' : 'Doğrusu: ' + ops.secenekler[ops.dogru] + '. ') + (ops.aciklama || '');
        if (ops.onBitti) ops.onBitti(dogru, i);
      });
    }
    return {
      sifirla: function () { D.tahmin(el, ops); }
    };
  };

  /* ─── E-DOGRU-YANLIS: animasyonlu mini sahneler için doğru/yanlış kararı (2D) ─── */
  /**
   * DON3D.dogruYanlis(el, { sahneler: [{ svg, metin, dogru: bool, aciklama }], onIlerleme(dogruSayisi, toplam), onBitti(dogruSayisi) })
   * Sahne SVG'si ekranda oynar; öğrenci "Doğru" ya da "Yanlış" seçer, açıklama gelir, "Sonraki" ile ilerler.
   */
  D.dogruYanlis = function (el, ops) {
    if (typeof el === 'string') el = document.querySelector(el);
    var i = 0, puan = 0, n = ops.sahneler.length;
    el.innerHTML = '';
    var kok = D.div('dy', el);
    var nokta = D.div('dy-noktalar', kok);
    var kart = D.div('dy-kart', kok);
    var gorsel = D.div('dy-gorsel', kart);
    var metin = D.div('dy-metin', kart);
    var secim = D.div('dy-secim', kok);
    var geri = D.div('dy-geri', kok);
    geri.setAttribute('aria-live', 'polite');
    function dugme(ebeveyn, sinif, html, fn) {
      var b = document.createElement('button'); b.type = 'button'; b.className = sinif; b.innerHTML = html;
      b.addEventListener('click', fn); ebeveyn.appendChild(b); return b;
    }
    var bD = dugme(secim, 'dy-sec dy-sec--d', D.simge('dogru') + '<span>Doğru</span>', function () { cevap(true); });
    var bY = dugme(secim, 'dy-sec dy-sec--y', D.simge('yanlis') + '<span>Yanlış</span>', function () { cevap(false); });
    var noktalar = ops.sahneler.map(function () { return D.div('dy-nokta', nokta); });
    function goster() {
      var sh = ops.sahneler[i];
      gorsel.innerHTML = sh.svg;
      metin.textContent = sh.metin;
      bD.disabled = bY.disabled = false;
      bD.className = 'dy-sec dy-sec--d'; bY.className = 'dy-sec dy-sec--y';
      geri.className = 'dy-geri'; geri.innerHTML = '';
      noktalar.forEach(function (d, k) { d.classList.toggle('simdi', k === i); });
    }
    function cevap(dedi) {
      var sh = ops.sahneler[i], dogru = dedi === sh.dogru;
      bD.disabled = bY.disabled = true;
      (dedi ? bD : bY).classList.add(dogru ? 'dy-sec--iyi' : 'dy-sec--kotu');
      if (dogru) { puan++; D.ses('klik'); } else D.ses('hata');
      noktalar[i].classList.add(dogru ? 'iyi' : 'kotu');
      geri.className = 'dy-geri ' + (dogru ? 'iyi' : 'kotu');
      geri.innerHTML = '<b></b><span></span>';
      geri.firstChild.textContent = (dogru ? '✓ Bildin! ' : '✗ Dikkat! ') + 'Bu davranış ' + (sh.dogru ? 'DOĞRU. ' : 'YANLIŞ. ');
      geri.lastChild.textContent = sh.aciklama;
      if (ops.onIlerleme) ops.onIlerleme(i + 1, n, puan);
      var ileri = document.createElement('button');
      ileri.type = 'button'; ileri.className = 'dy-ileri';
      ileri.textContent = i < n - 1 ? 'Sonraki sahne →' : 'Sonucu gör →';
      ileri.addEventListener('click', function () { i++; if (i < n) goster(); else bitir(); });
      geri.appendChild(ileri);
    }
    function bitir() {
      kart.hidden = true; secim.hidden = true;
      geri.className = 'dy-geri dy-son';
      geri.innerHTML = '<b></b><span></span>';
      geri.firstChild.textContent = puan + ' / ' + n;
      geri.lastChild.textContent = puan === n ? 'Harika! Tüm güvenlik kararlarını doğru verdin.' : 'Yanlış verdiğin kararların açıklamalarını bir kez daha oku.';
      var yeniden = document.createElement('button');
      yeniden.type = 'button'; yeniden.className = 'dy-ileri'; yeniden.textContent = 'Yeniden oyna';
      yeniden.addEventListener('click', function () { D.dogruYanlis(el, ops); });
      geri.appendChild(yeniden);
      if (ops.onBitti) ops.onBitti(puan);
    }
    goster();
  };

  /* ─── E-SINIFLA: öğeleri doğru kutulara sürükle; anında geri bildirim ─── */
  /**
   * DON3D.sinifla(kapsayici, {
   *   ogeler:  [{ id, ad, kutu, model?: 'M-KLAVYE', svg?: '<svg…>', ipucu?: 'yanlışta açıklama', dogruMetin? }],
   *   kutular: [{ id, ad, aciklama?, renk?: '#f59e0b', resim?: '<svg…>' | model?: 'M-…', simge?: '<svg…>' }],
   *   onDogru, onYanlis, onIlerleme(dogru, toplam), onBitti({ dogru, yanlis })
   * })
   * Kartlar sürüklenerek, dokun-seç-dokun-bırak ile ya da klavyeyle (Enter/Boşluk) yerleştirilir.
   * Doğru kart kutuya uçarak küçülür (✓), yanlışta kart sallanır ve ipucu çıkar (✗ + metin).
   */
  D.sinifla = function (kap, ops) {
    if (typeof kap === 'string') kap = document.querySelector(kap);
    var AZ = D.azHareket();
    var kok2 = D.div('don3d-sinifla', null);
    kap.appendChild(kok2);
    var tepsi = D.div('dsn-tepsi', kok2);
    tepsi.setAttribute('role', 'list');
    var bos = D.div('dsn-bos', kok2);
    bos.innerHTML = D.simge('dogru') + '<span>Hepsi yerleşti!</span>';
    var kutularEl = D.div('dsn-kutular', kok2);
    kutularEl.style.setProperty('--dsn-sutun', ops.kutular.length);
    var alt = D.div('dsn-alt', kok2);
    var geri = D.div('dsn-geri', alt);
    geri.setAttribute('aria-live', 'polite');
    var BASLANGIC = ops.baslangicMetni || 'Bir kartı sürükle ya da önce karta, sonra kutuya dokun.';
    geri.textContent = BASLANGIC;
    var sifirBtn = document.createElement('button');
    sifirBtn.type = 'button'; sifirBtn.className = 'dsn-sifirla';
    sifirBtn.innerHTML = D.simge('tekrar') + '<span>Yeniden</span>';
    alt.appendChild(sifirBtn);

    var sayac = { dogru: 0, yanlis: 0 };
    var secili = null;
    var kutuHaritasi = {};

    function resimHtml(o, w, h) {
      var url = o.model ? D.kucukResim(o.model, { w: w, h: h, yon: o.yon }) : null;
      if (url) return '<img src="' + url + '" alt="">';
      return o.resim || o.svg || '';
    }

    ops.kutular.forEach(function (k) {
      var el = D.div('dsn-kutu', kutularEl);
      el.dataset.kutu = k.id;
      if (k.renk) el.style.setProperty('--kutu-renk', k.renk);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', k.ad + ' kutusu');
      var bas = D.div('dsn-kutu-bas', el);
      var r = D.div('dsn-kutu-resim', bas);
      r.innerHTML = resimHtml(k, 120, 90) || k.simge || '';
      var yazi = D.div('dsn-kutu-yazi', bas);
      var ad = document.createElement('span'); ad.className = 'dsn-kutu-ad'; ad.textContent = k.ad; yazi.appendChild(ad);
      if (k.aciklama) { var a = document.createElement('span'); a.className = 'dsn-kutu-aciklama'; a.textContent = k.aciklama; yazi.appendChild(a); }
      var sy = D.div('dsn-kutu-sayac', el);
      sy.textContent = '0';
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
      res.innerHTML = resimHtml(o, 160, 120);
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

    function geriYaz(tur, metin) {
      geri.className = 'dsn-geri' + (tur ? ' dsn-geri--' + tur : '');
      geri.innerHTML = (tur === 'dogru' ? D.simge('dogru') : tur === 'yanlis' ? D.simge('yanlis') : '') + '<span></span>';
      geri.lastChild.textContent = metin;
    }
    function ilerleme() { if (ops.onIlerleme) ops.onIlerleme(sayac.dogru, ops.ogeler.length); }

    function sec(b) {
      if (b.classList.contains('dsn-oge--yerlesti')) return;
      if (secili) secili.classList.remove('dsn-oge--secili');
      secili = secili === b ? null : b;
      kok2.classList.toggle('don3d-sinifla--secim', !!secili);
      if (secili) { secili.classList.add('dsn-oge--secili'); geriYaz('', '“' + b._oge.ad + '” seçildi. Şimdi doğru kutuya dokun.'); }
    }

    function oynat(el, kareler, sure) {
      if (AZ || !el.animate) return;
      try { el.animate(kareler, { duration: sure, easing: 'cubic-bezier(.2,.8,.2,1)' }); } catch (e) {}
    }

    function birak(b, kutuId) {
      var o = b._oge;
      b.classList.remove('dsn-oge--secili');
      kok2.classList.remove('don3d-sinifla--secim');
      secili = null;
      var kutu = kutuHaritasi[kutuId];
      if (o.kutu === kutuId) {
        sayac.dogru++;
        var r0 = b.getBoundingClientRect();
        b.classList.add('dsn-oge--yerlesti');
        b.setAttribute('aria-disabled', 'true');
        b.tabIndex = -1;
        var isaret = D.div('dsn-isaret', b); isaret.innerHTML = D.simge('dogru');
        kutu.querySelector('.dsn-kutu-ic').appendChild(b);
        var r1 = b.getBoundingClientRect();
        // Kart eski yerinden kutuya uçar (FLIP)
        oynat(b, [
          { transform: 'translate(' + (r0.left - r1.left) + 'px,' + (r0.top - r1.top) + 'px) scale(' + (r0.width / Math.max(r1.width, 1)).toFixed(3) + ')', transformOrigin: 'top left' },
          { transform: 'none', transformOrigin: 'top left' }
        ], 480);
        oynat(kutu, [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }], 420);
        var sy = kutu.querySelector('.dsn-kutu-sayac');
        sy.textContent = kutu.querySelectorAll('.dsn-oge').length;
        geriYaz('dogru', 'Doğru! ' + (o.dogruMetin || ''));
        if (ops.onDogru) ops.onDogru(o);
        ilerleme();
        if (sayac.dogru === ops.ogeler.length) bitti();
      } else {
        sayac.yanlis++;
        b.classList.remove('dsn-oge--salla'); void b.offsetWidth; b.classList.add('dsn-oge--salla');
        kutu.classList.remove('dsn-kutu--hata'); void kutu.offsetWidth; kutu.classList.add('dsn-kutu--hata');
        geriYaz('yanlis', 'Tekrar düşün. ' + (o.ipucu || ''));
        if (ops.onYanlis) ops.onYanlis(o, kutuId);
      }
    }

    function bitti() {
      geriYaz('dogru', (ops.bitisMetni || 'Tamamladın!') + (sayac.yanlis ? ' (' + sayac.yanlis + ' hatalı deneme)' : ' Hiç hata yapmadın.'));
      kok2.classList.add('don3d-sinifla--bitti');
      if (!AZ && typeof window.confetti === 'function') { try { window.confetti(); } catch (e) {} }
      if (ops.onBitti) ops.onBitti({ dogru: sayac.dogru, yanlis: sayac.yanlis });
    }

    function sifirla() {
      sayac.dogru = 0; sayac.yanlis = 0; secili = null;
      kok2.classList.remove('don3d-sinifla--bitti', 'don3d-sinifla--secim');
      ogeElleri.forEach(function (b) {
        b.classList.remove('dsn-oge--yerlesti', 'dsn-oge--secili', 'dsn-oge--salla');
        b.removeAttribute('aria-disabled'); b.tabIndex = 0;
        var i = b.querySelector('.dsn-isaret'); if (i) i.remove();
        tepsi.appendChild(b);
      });
      Object.keys(kutuHaritasi).forEach(function (k) { kutuHaritasi[k].querySelector('.dsn-kutu-sayac').textContent = '0'; });
      geriYaz('', BASLANGIC);
      ilerleme();
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
          hayalet._dx = e.clientX - r.left; hayalet._dy = e.clientY - r.top;
          document.body.appendChild(hayalet);
          b.classList.add('dsn-oge--tasiniyor');
          kok2.classList.add('don3d-sinifla--secim');
        }
        if (hayalet) {
          hayalet.style.transform = 'translate(' + (e.clientX - hayalet._dx) + 'px,' + (e.clientY - hayalet._dy) + 'px) rotate(-3deg)';
          ustunde(e.clientX, e.clientY);
        }
      });
      function bitir(e) {
        if (!bas || e.pointerId !== bas.id) return;
        var surukledi = !!hayalet;
        if (hayalet) { hayalet.remove(); hayalet = null; }
        b.classList.remove('dsn-oge--tasiniyor');
        kok2.classList.remove('don3d-sinifla--secim');
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
        if (b.classList.contains('dsn-oge--yerlesti')) return; // kutudaki karta dokunmak kutuya dokunmak sayılır
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
    ilerleme();
    return { sifirla: sifirla, sayac: sayac };
  };
})(typeof window !== 'undefined' ? window : this);
