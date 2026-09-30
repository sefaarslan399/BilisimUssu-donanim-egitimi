/* DON-201 H13 — Basit Sorun Giderme ve Bakım · ders betiği (ortak betikten sonra çalışır)
   Derse özel kalıplar (motorda henüz yok):
   - A-BOOT (3D, ortaokul sade): güç → fanlar → açılış denetimi → yükleme → masaüstü (Adım 2), görüntü yolu (Adım 3)
   - A-TOZ (3D): M-FAN tozla() + termometre + fan hızı paneli (Adım 5), güvenli temizlik sırası (Adım 6)
   - E-TESHIS (2D masa sahnesi + kontrol düğmeleri): "en basitten başla" sırası yıldızla ödüllendirilir (Adım 4, Etkinlik 1)
   - 2D: basit/zor yarışı (Adım 1), temizlik sırası + gözlem + bakım kartı (Etkinlik 2), bip desenleri (Derinleş) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 2’de bilgisayarı birlikte canlandıracağız.');

  /* ─────────── Küçük yardımcılar ─────────── */
  function el(etiket, sinif, ebeveyn, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function bekle(sn) { return new Promise(function (r) { setTimeout(r, AZ ? 10 : sn * 1000); }); }
  function aktif(id) { var s = document.getElementById(id); return !!(s && s.classList.contains('active')); }
  function isiRenk(T) {
    var d = Math.max(0, Math.min(1, (T - 40) / 50));
    return new THREE.Color().setHSL((1 - d) * 0.6, 0.85, 0.5).getStyle();
  }
  function durumYazi(T) { return T >= 85 ? 'Çok sıcak' : (T >= 68 ? 'Sıcak' : (T < 36 ? 'Kapalı' : 'Normal')); }
  /** Tek etiket yöneticisi: yeni etiket eskisini kaldırır. */
  function etiketci(s) {
    var e = null;
    return function (n, metin, tur, ops) {
      if (e) { e.kaldir(); e = null; }
      if (n) { ops = ops || {}; ops.tur = tur || 'vurgu'; e = s.etiket(n, metin, ops); }
      return e;
    };
  }
  /** Sahne düğmesinin yazısını değiştirir. */
  function dugmeYaz(b, metin) { var sp = b.querySelector('span'); if (sp) sp.textContent = metin; }
  function dunya(o) { o.updateWorldMatrix(true, false); return o.getWorldPosition(new V3()); }

  /* ─────────── Monitör ekranı (canvas dokusu) ─────────── */
  function ekranCiz(mon, tur, ek) {
    mon.userData.ekran.ciz(function (ctx, w, h) {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (tur === 'sinyal') {
        ctx.fillStyle = '#1f2937'; K.yuvarlakDikdortgen(ctx, w / 2 - 110, h / 2 - 34, 220, 68, 10); ctx.fill();
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#e5e7eb'; ctx.font = '800 26px Inter, Arial, sans-serif'; ctx.fillText('Sinyal yok', w / 2, h / 2 - 8);
        ctx.fillStyle = '#94a3b8'; ctx.font = '600 16px Inter, Arial, sans-serif'; ctx.fillText('HDMI 1', w / 2, h / 2 + 20);
      } else if (tur === 'giris') {
        ctx.fillStyle = '#111827'; K.yuvarlakDikdortgen(ctx, 26, 22, 200, 150, 10); ctx.fill();
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();
        ctx.textAlign = 'left'; ctx.fillStyle = '#e5e7eb'; ctx.font = '800 20px Inter, Arial, sans-serif'; ctx.fillText('Giriş seçimi', 44, 46);
        ['HDMI 1', 'HDMI 2', 'DisplayPort'].forEach(function (a, i) {
          var y = 82 + i * 30;
          if (i === 0) { ctx.fillStyle = '#0ea5e9'; K.yuvarlakDikdortgen(ctx, 38, y - 13, 176, 26, 6); ctx.fill(); }
          ctx.fillStyle = i === 0 ? '#fff' : '#9ca3af'; ctx.font = (i === 0 ? '800 ' : '600 ') + '17px Inter, Arial, sans-serif';
          ctx.fillText(a + (i === 0 ? '  (seçili)' : ''), 50, y + 1);
        });
      } else if (tur === 'denetim') {
        ctx.fillStyle = '#e5e7eb'; ctx.font = '800 24px Inter, Arial, sans-serif'; ctx.fillText('Açılış denetimi', w / 2, h / 2 - 50);
        var sat = ['İşlemci', 'Bellek', 'Depolama', 'Ekran'];
        ctx.font = '600 16px Inter, Arial, sans-serif'; ctx.textAlign = 'left';
        sat.forEach(function (a, i) {
          if (ek < (i + 1) / (sat.length + 1)) return;
          ctx.fillStyle = '#cbd5e1'; ctx.fillText(a, w / 2 - 90, h / 2 - 12 + i * 22);
          ctx.fillStyle = '#4ade80'; ctx.fillText('tamam', w / 2 + 40, h / 2 - 12 + i * 22);
        });
        ctx.fillStyle = '#334155'; K.yuvarlakDikdortgen(ctx, w / 2 - 120, h - 40, 240, 10, 5); ctx.fill();
        ctx.fillStyle = '#a78bfa'; K.yuvarlakDikdortgen(ctx, w / 2 - 120, h - 40, Math.max(10, 240 * ek), 10, 5); ctx.fill();
      } else if (tur === 'yukleniyor') {
        for (var i = 0; i < 8; i++) {
          var a = ek * Math.PI * 2 + i * Math.PI / 4;
          ctx.globalAlpha = 0.25 + 0.75 * (i / 7);
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a) * 30, h / 2 - 14 + Math.sin(a) * 30, 6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.fillStyle = '#cbd5e1'; ctx.font = '700 18px Inter, Arial, sans-serif'; ctx.fillText('Açılıyor…', w / 2, h / 2 + 44);
      }
    });
  }

  /* ─────────── Kapak: kasa, monitör, tozlu fan ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 40,
      kamera: { yon: [-0.5, 0.42, 1], pay: 0.8 } });
    var kasa = s.ekle('M-MASAUSTU', { konum: [-34, 0, -6], donus: [0, 0.42, 0] });
    s.ekle('M-MONITOR', { konum: [8, 0, -10], donus: [0, -0.1, 0] });
    var fan = s.ekle('M-FAN', { konum: [30, 6.1, 12], donus: [0, -0.55, 0], modelOps: { toz: 0.75, hiz: 5, kablosuz: true } });
    s.yerlestir();
    fan.userData.baslat(s);
    s.herKare(function (dt) { kasa.userData.fanlar.forEach(function (r) { r.rotation.z += 12 * dt * (AZ ? 0.15 : 1); }); });
  });

  /* ─────────── Adım 1: önce basit — iki şerit yarışı + kontrol merdiveni (2D) ─────────── */
  (function () {
    var kok = document.getElementById('basit');
    if (!kok) return;
    var BASAMAK = [
      ['Takılı mı?', 'fiş, kablo', 'kolay'],
      ['Açık mı?', 'düğme, ışık, ses', 'kolay'],
      ['Yeniden başlat', 'kapat ve aç', 'orta'],
      ['Yetişkine söyle', 'kasa içi yetişkin işi', 'zor']
    ];
    kok.innerHTML = '<div class="ya-sahne"><!--@dahil:basit.svg--></div>' +
      '<div class="merdiven-bas"><b>Kontrol sırası</b><span>kolay → zor</span></div><ol class="merdiven"></ol>' +
      '<div class="kv-alt"><button type="button" class="h13-oynat"></button><div class="panel-sonuc" aria-live="polite"></div></div>';
    var svg = kok.querySelector('svg'), liste = kok.querySelector('.merdiven'), sonuc = kok.querySelector('.panel-sonuc'), oynat = kok.querySelector('.h13-oynat');
    var basamaklar = BASAMAK.map(function (b, i) {
      var li = el('li', 'bs bs-' + (i + 1), liste);
      el('span', 'bs-no', li, String(i + 1));
      var m = el('span', 'bs-metin', li);
      el('b', '', m, b[0]); el('small', '', m, b[1]);
      el('em', 'bs-zor zor-' + b[2], li, b[2]);
      return li;
    });
    var sure1 = svg.querySelector('.ya-sure-1'), sure2 = svg.querySelector('.ya-sure-2');
    var no = 0;
    function sifirla() {
      no++;
      svg.querySelectorAll('.ya-cip').forEach(function (c) { c.classList.remove('aktif', 'bitti'); });
      svg.querySelectorAll('.ya-sonuc').forEach(function (c) { c.classList.remove('gor'); });
      basamaklar.forEach(function (b) { b.classList.remove('yan'); });
      sure1.textContent = '0 sn'; sure2.textContent = '0 sn';
      sonuc.textContent = ''; sonuc.className = 'panel-sonuc';
    }
    function sayac(t, bas, son, sure, bicim, n) {
      return new Promise(function (coz) {
        if (AZ) { t.textContent = bicim(son); coz(); return; }
        var t0 = performance.now();
        (function kare(z) {
          if (n !== no) { coz(); return; }
          var x = Math.min(1, (z - t0) / (sure * 1000));
          t.textContent = bicim(bas + (son - bas) * x);
          if (x < 1) requestAnimationFrame(kare); else coz();
        })(t0);
      });
    }
    function snBicim(v) { return Math.round(v) + ' sn'; }
    function dkBicim(v) {
      var dk = Math.floor(v / 60), sn = Math.round(v % 60);
      return dk ? (dk + ' dk' + (sn ? ' ' + sn + ' sn' : '')) : (sn + ' sn');
    }
    function cip(ad) { return svg.querySelector('.' + ad); }
    function oyna() {
      sifirla();
      var n = no;
      sonuc.textContent = 'Aynı arıza, iki farklı yol…';
      var ece = Promise.resolve().then(function () { cip('c1-1').classList.add('aktif'); return sayac(sure1, 0, 10, 1.2, snBicim, n); })
        .then(function () { if (n !== no) return; cip('c1-1').classList.remove('aktif'); cip('c1-1').classList.add('bitti'); svg.querySelector('.ya-sonuc-1').classList.add('gor'); D.ses('klik'); });
      var ADIM = [300, 600, 300, 10], toplam = 0, deniz = Promise.resolve();
      ADIM.forEach(function (sn, i) {
        deniz = deniz.then(function () {
          if (n !== no) return;
          var c = cip('c2-' + (i + 1)); c.classList.add('aktif');
          var bas = toplam; toplam += sn;
          return sayac(sure2, bas, toplam, i === 3 ? 0.8 : 1.3, dkBicim, n).then(function () { if (n !== no) return; c.classList.remove('aktif'); c.classList.add('bitti'); });
        });
      });
      Promise.all([ece, deniz]).then(function () {
        if (n !== no) return;
        svg.querySelector('.ya-sonuc-2').classList.add('gor');
        sonuc.textContent = 'Ece 10 saniyede, Deniz 20 dakikada buldu. Önce basit olanı dene!';
        sonuc.className = 'panel-sonuc iyi';
        var z = Promise.resolve();
        basamaklar.forEach(function (b) { z = z.then(function () { if (n === no) b.classList.add('yan'); return bekle(0.35); }); });
      });
    }
    oynat.innerHTML = D.simge('tekrar') + '<span>Oynat</span>';
    oynat.addEventListener('click', oyna);
    sifirla();
    DERS.slaytAcilinca('s4', function () { setTimeout(oyna, AZ ? 10 : 600); });
  })();

  /* ─────────── Adım 2: A-BOOT — açılmıyor (fiş → güç düğmesi) ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-0.3, 0.4, 1], pay: 0.86, hedefOfset: [0, -2, 0] } });
    var kasa = s.ekle('M-MASAUSTU', { konum: [-30, 0, 2], donus: [0, 0.5, 0] });
    var mon = s.ekle('M-MONITOR', { konum: [22, 0, -6], donus: [0, -0.3, 0] });
    s.kok.updateMatrixWorld(true);
    var PRIZ = new V3(-58, 10, -8);
    var arka = kasa.localToWorld(new V3(-2, 6, -21.5));
    var fisM = s.ekle('M-GUC-FISI', { konum: PRIZ.toArray(), modelOps: { kabloSon: [arka.x - PRIZ.x, arka.y - PRIZ.y, arka.z - PRIZ.z] } });
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.6, maxPolar: 1.45, minYakin: 0.5, maxYakin: 1.3 } });
    var dugme = kasa.getObjectByName('guc-dugmesi'), halka = kasa.getObjectByName('guc-isigi').material;
    var disk = kasa.getObjectByName('disk-isigi').material, fanlar = kasa.userData.fanlar, fanHiz = 0;
    s.herKare(function (dt) { fanlar.forEach(function (r) { r.rotation.z += fanHiz * 14 * dt * (AZ ? 0.15 : 1); }); });
    var mesaj = DERS.sahneMesaj(s), etiket = etiketci(s);
    var st = { fis: false, isik: false, acik: false, mesgul: false };
    function isik(e) { halka.emissiveIntensity = 1.6 * e; disk.emissiveIntensity = 0.25 * e; }
    var b1, b2, b3;
    function yazilar() {
      dugmeYaz(b1, (st.isik ? '✓ ' : '1 · ') + 'Güç ışığı');
      dugmeYaz(b2, (st.fis ? '✓ ' : '2 · ') + 'Fiş');
      dugmeYaz(b3, (st.acik ? '✓ ' : '3 · ') + 'Güç düğmesi');
    }
    function isikKontrol() {
      if (st.mesgul) return;
      st.isik = true; yazilar();
      D.vurgula(dugme, { etiket: false, sure: 0.3 });
      if (st.acik) { etiket(dugme, 'Işık yanıyor', 'dogru'); mesaj('Güç ışığı yanıyor: bilgisayar açık.', 'dogru'); }
      else { etiket(dugme, 'Işık sönük', 'hata'); mesaj('Güç ışığı sönük. Kasaya elektrik gelmiyor olabilir.', 'yanlis'); }
      D.bekle(1.4, s).then(function () { D.vurguKaldir(dugme); });
    }
    function fisKontrol() {
      if (st.mesgul) return;
      if (st.fis) { etiket(fisM.userData.fis, 'Fiş takılı', 'dogru'); mesaj('Fiş prize takılı.', 'dogru'); return; }
      st.mesgul = true;
      etiket(fisM.userData.fis, 'Fiş çıkmış!', 'hata');
      mesaj('Buldun: fiş prizden çıkmış. Takılıyor…', 'yanlis');
      D.bekle(1.1, s).then(function () { return fisM.userData.tak(1); }).then(function () {
        D.ses('klik');
        st.fis = true; st.mesgul = false; yazilar();
        etiket(fisM.userData.fis, 'Fiş takıldı', 'dogru');
        mesaj('Fiş takıldı. Şimdi güç düğmesine bas.', 'dogru');
      });
    }
    function dugmeBas() {
      if (st.mesgul) return;
      if (st.acik) { mesaj('Bilgisayar zaten açık.', 'dogru'); return; }
      D.bas(dugme, { mesafe: -0.3 });
      etiket(dugme, 'Güç düğmesi', 'vurgu');
      if (!st.fis) {
        D.ses('hata');
        mesaj('Düğmeye bastın, hiçbir şey olmadı. Elektrik geliyor mu?', 'yanlis');
        return;
      }
      st.mesgul = true;
      mesaj('Elektrik geldi: güç ışığı yandı, fanlar dönüyor.', '');
      D.tween({ sahne: s, sure: 0.9, guncelle: function (e) { isik(e); fanHiz = e; } })
        .then(function () { return D.bekle(0.7, s); })
        .then(function () {
          etiket(null);
          mesaj('Açılış denetimi: parçalar kontrol ediliyor…', '');
          return D.tween({ sahne: s, sure: 2.2, ease: 'lineer', guncelle: function (e) { ekranCiz(mon, 'denetim', e); } });
        })
        .then(function () {
          D.ses('klik');
          mesaj('Denetim tamam. Bazı bilgisayarlar burada tek kısa bip sesi çıkarır.', '');
          return D.bekle(1.4, s);
        })
        .then(function () {
          mesaj('İşletim sistemi yükleniyor…', '');
          D.yanipSon(kasa.getObjectByName('disk-isigi'), { tepe: 3, kez: 6, sure: 2 });
          return D.tween({ sahne: s, sure: 2, ease: 'lineer', guncelle: function (e) { ekranCiz(mon, 'yukleniyor', e * 2); } });
        })
        .then(function () {
          mon.userData.ekran.masaustu();
          st.acik = true; st.mesgul = false; yazilar();
          etiket(mon.getObjectByName('ekran'), 'Bilgisayar açıldı', 'dogru', { yer: 'merkez' });
          mesaj(DERS.tahminNotu(1, 'Bilgisayar açıldı. Sorun basitti: fiş.', 'Bilgisayar açıldı. Sorun basitti: fiş çıkmıştı.'), 'dogru');
        });
    }
    function sifirla() {
      if (st.mesgul) return;
      st.fis = false; st.isik = false; st.acik = false;
      isik(0); fanHiz = 0; ekranCiz(mon, 'kapali');
      fisM.userData.cek(0.01);
      etiket(null); yazilar();
      mesaj('Ece düğmeye bastı: ışık yok, ekran karanlık.', '');
    }
    b1 = s.dugme('1 · Güç ışığı', null, isikKontrol, { yer: 'alt-orta', aciklama: 'Kontrol 1: güç ışığına bak' });
    b2 = s.dugme('2 · Fiş', null, fisKontrol, { yer: 'alt-orta', aciklama: 'Kontrol 2: fişi ve prizi kontrol et' });
    b3 = s.dugme('3 · Güç düğmesi', null, dugmeBas, { yer: 'alt-orta', aciklama: 'Kontrol 3: güç düğmesine bas' });
    s.dugme('Baştan', 'sifirla', sifirla, { yer: 'ust-sag', aciklama: 'Senaryoyu başa al' });
    s.tiklaninca(function (p) {
      if (!p) return;
      if (p.name === 'fis' || p.name === 'priz' || p.name === 'M-GUC-FISI') fisKontrol();
      else if (p.name === 'guc-dugmesi') dugmeBas();
    });
    sifirla();
  });

  /* ─────────── Adım 3: A-BOOT — görüntü yok (monitör ışığı → giriş → kablo) ─────────── */
  D.tembel('#s6-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-0.45, 0.4, 1.3], pay: 0.72, hedefOfset: [-2, -1, 0] } });
    var kasa = s.ekle('M-MASAUSTU', { konum: [-54, 0, -12], donus: [0, 0.36, 0] });
    var mon = s.ekle('M-MONITOR', { konum: [0, 0, -6] });
    var fis = s.ekle('M-KABLO-UCLARI', { modelOps: { tur: 'hdmi', kabloUzun: 1 } });
    fis.rotation.x = Math.PI / 2;                 // fiş yukarı (monitörün alt yüzündeki girişe) girer
    s.kok.updateMatrixWorld(true);
    var ALT = 28 - 1.5 - 10 + 0.02;               // M-MONITOR: arka çıkıntının alt yüzü (girişler)
    var agiz = mon.localToWorld(new V3(-4, ALT, -3.8));
    var GIRIS = 0.95, GEVSEK = 1.4;
    var takili = new V3(agiz.x, agiz.y + GIRIS, agiz.z), gevsek = new V3(agiz.x, agiz.y + GIRIS - GEVSEK, agiz.z);
    fis.position.copy(gevsek);
    function kw(x, y, z) { return kasa.localToWorld(new V3(x, y, z)); }
    var hedef = dunya(kasa.getObjectByName('goruntu-cikis'));
    var kablo = null;
    function kabloCiz() {
      if (kablo) { s.kok.remove(kablo); kablo.geometry.dispose(); }
      var u = fis.position.clone().add(new V3(0, -(0.95 + 2.2 + 4.1), -1));
      kablo = K.kablo([u, new V3(u.x - 0.5, 3, u.z - 3), new V3(u.x - 3, 0.5, -16), new V3(-22, 0.5, -26),
        kw(-2.5, 0.5, -31), kw(-2.5, 12, -27), hedef], 0.36);
      kablo.userData.secilmez = true;
      s.kok.add(kablo);
    }
    kabloCiz();
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.55, maxPolar: 1.5, minYakin: 0.4, maxYakin: 1.3 } });
    var monLed = mon.getObjectByName('guc-isigi'), halka = kasa.getObjectByName('guc-isigi').material;
    halka.emissiveIntensity = 1.6;
    var fanlar = kasa.userData.fanlar;
    s.herKare(function (dt) { fanlar.forEach(function (r) { r.rotation.z += 14 * dt * (AZ ? 0.15 : 1); }); });
    var mesaj = DERS.sahneMesaj(s), etiket = etiketci(s);
    var st = { led: false, giris: false, kablo: false, mesgul: false };
    var b1, b2, b3;
    function yazilar() {
      dugmeYaz(b1, (st.led ? '✓ ' : '1 · ') + 'Monitör ışığı');
      dugmeYaz(b2, (st.giris ? '✓ ' : '2 · ') + 'Giriş');
      dugmeYaz(b3, (st.kablo ? '✓ ' : '3 · ') + 'Kablo');
    }
    function ledKontrol() {
      if (st.mesgul) return;
      st.led = true; yazilar();
      etiket(monLed, 'Işık yanıyor', 'dogru');
      D.yanipSon(monLed, { tepe: 4, kez: 2, sure: 0.8 });
      mesaj(st.kablo ? 'Monitör açık ve görüntü var.' : 'Monitör açık: ışığı yanıyor. Ekranda “Sinyal yok” yazıyor.', 'dogru');
    }
    function girisKontrol() {
      if (st.mesgul) return;
      st.giris = true; yazilar();
      etiket(null);
      if (st.kablo) { mesaj('Giriş doğru: HDMI 1.', 'dogru'); return; }
      st.mesgul = true;
      ekranCiz(mon, 'giris');
      mesaj('Kablo HDMI 1’e takılı, seçili giriş de HDMI 1. Giriş doğru.', 'dogru');
      D.bekle(2.6, s).then(function () { if (!st.kablo) ekranCiz(mon, 'sinyal'); st.mesgul = false; });
    }
    function kabloKontrol() {
      if (st.mesgul) return;
      if (st.kablo) { etiket(fis, 'Tam oturmuş', 'dogru'); mesaj('Kablo iki uçta da tam takılı.', 'dogru'); return; }
      st.mesgul = true;
      mesaj('Kablonun monitördeki ucuna bakalım…', '');
      s.kameraGit({ theta: Math.PI + 0.6, phi: 1.3, yakinlik: 0.34, hedef: [agiz.x, agiz.y - 3, agiz.z] }, 1.2)
        .then(function () {
          etiket(fis, 'Gevşek!', 'hata', { yer: 'alt' });
          mesaj('Buldun: kablo girişe tam oturmamış.', 'yanlis');
          return D.bekle(1.2, s);
        })
        .then(function () {
          var bas = fis.position.clone();
          return D.tween({ sahne: s, sure: 0.8, guncelle: function (e) { fis.position.lerpVectors(bas, takili, e); kabloCiz(); } });
        })
        .then(function () {
          D.ses('klik');
          etiket(fis, 'Tam oturdu', 'dogru', { yer: 'alt' });
          return D.bekle(1.0, s);
        })
        .then(function () { return s.sifirla(); })
        .then(function () {
          mon.userData.ekran.masaustu();
          st.kablo = true; st.mesgul = false; yazilar();
          etiket(mon.getObjectByName('ekran'), 'Görüntü geldi', 'dogru', { yer: 'merkez' });
          mesaj('Kablo gevşekmiş. Tam takınca görüntü geldi!', 'dogru');
        });
    }
    function sifirla() {
      if (st.mesgul) return;
      st.led = false; st.giris = false; st.kablo = false;
      fis.position.copy(gevsek); kabloCiz();
      ekranCiz(mon, 'sinyal');
      etiket(null); yazilar(); s.sifirla();
      mesaj('Kasa çalışıyor, fanlar dönüyor. Ama ekranda görüntü yok.', '');
    }
    b1 = s.dugme('1 · Monitör ışığı', null, ledKontrol, { yer: 'alt-orta', aciklama: 'Kontrol 1: monitörün ışığına bak' });
    b2 = s.dugme('2 · Giriş', null, girisKontrol, { yer: 'alt-orta', aciklama: 'Kontrol 2: monitörde seçili girişe bak' });
    b3 = s.dugme('3 · Kablo', null, kabloKontrol, { yer: 'alt-orta', aciklama: 'Kontrol 3: görüntü kablosunun ucuna bak' });
    s.dugme('Baştan', 'sifirla', sifirla, { yer: 'ust-sag', aciklama: 'Senaryoyu başa al' });
    s.tiklaninca(function (p) {
      if (!p) return;
      if (p.name === 'fis-hdmi' || p.name === 'girisler') kabloKontrol();
    });
    sifirla();
  });

  /* ─────────── 2D masa sahnesi: durum sınıfları (Adım 4 ve Etkinlik 1) ─────────── */
  var DURUMLAR = ['fis-cikik', 'kasa-acik', 'mon-acik', 'hop-acik', 'ses-kapali', 'hop-kablo-cikik', 'alici-cikik', 'pil-bitik'];
  function masaDurum(svg, durum) {
    DURUMLAR.forEach(function (d) { svg.classList.toggle(d, !!durum[d]); });
    var sesVar = durum['kasa-acik'] && durum['hop-acik'] && !durum['hop-kablo-cikik'] && !durum['ses-kapali'];
    var fareVar = durum['kasa-acik'] && durum['mon-acik'] && !durum['alici-cikik'] && !durum['pil-bitik'];
    svg.classList.toggle('ses-var', !!sesVar);
    svg.classList.toggle('fare-calisiyor', !!fareVar);
  }
  function durumOku(metin) { var d = {}; (metin || '').split(' ').forEach(function (x) { if (x) d[x] = true; }); return d; }
  function halkalar(svg, liste) {
    svg.querySelectorAll('.hl').forEach(function (h) { h.classList.remove('gor'); });
    (liste || []).forEach(function (a) { var h = svg.querySelector('.hl-' + a); if (h) h.classList.add('gor'); });
  }
  /** Kontrol düğmesi: numara, ad, zorluk, sonuç. */
  function kontrolDugmesi(ebeveyn, no, ad, zor) {
    var b = el('button', 'kn', ebeveyn);
    b.type = 'button';
    el('span', 'kn-no', b, no);
    var m = el('span', 'kn-metin', b);
    el('b', 'kn-ad', m, ad);
    el('small', 'kn-zor zor-' + zor, m, zor);
    el('span', 'kn-sonuc', b, '');
    return b;
  }
  function kontrolSonuc(b, tur) {
    b.classList.remove('ok', 'sorun', 'ilgisiz', 'uyari');
    if (tur) b.classList.add(tur);
    b.querySelector('.kn-sonuc').textContent = { ok: '✓ Sorun yok', sorun: '! Sorun buradaydı', ilgisiz: '– İlgisiz', uyari: '✋ Dur' }[tur] || '';
  }

  /* ─────────── Adım 4: ses yok, fare çalışmıyor (2D) ─────────── */
  (function () {
    var kok = document.getElementById('ses-fare');
    if (!kok) return;
    var SENARYO = {
      ses: { ad: 'Ses yok', durum: 'kasa-acik mon-acik', bas: 'Video oynuyor ama ses gelmiyor. Kontrollere 1’den başla.',
        k: [
          { ad: 'Ses düzeyi', zor: 'kolay', hl: ['ses'], sonuc: 'ok', metin: 'Ses düzeyi açık, sessizde değil.' },
          { ad: 'Hoparlör düğmesi', zor: 'kolay', hl: ['hop-dugme'], sonuc: 'sorun', duzelt: { 'hop-acik': true }, metin: 'Hoparlör kapalıymış! Açınca ses geldi.' },
          { ad: 'Kablo ve giriş', zor: 'orta', hl: ['kablo'], sonuc: 'ok', metin: 'Kablo yeşil ses çıkışına takılı.' }
        ] },
      fare: { ad: 'Fare çalışmıyor', durum: 'kasa-acik mon-acik hop-acik pil-bitik', bas: 'Kablosuz fare kıpırdamıyor. Kontrollere 1’den başla.',
        k: [
          { ad: 'Pil ve düğme', zor: 'kolay', hl: ['fare'], sonuc: 'sorun', duzelt: { 'pil-bitik': false }, metin: 'Pil bitmiş! Yeni pil takınca imleç hareket etti.' },
          { ad: 'Alıcı takılı mı?', zor: 'orta', hl: ['alici'], sonuc: 'ok', metin: 'Fare alıcısı kasaya takılı.' },
          { ad: 'Başka USB girişi', zor: 'orta', hl: ['usb'], sonuc: 'ok', metin: 'Alıcı başka girişte de aynı: sorun burada değil.', sonraMetin: 'Fare çalışıyor; bu kontrole gerek kalmadı.' }
        ] }
    };
    kok.innerHTML = '<div class="secici sf-sec" role="group" aria-label="Arıza türü"></div><div class="masa-sahne"><!--@dahil:masa-a.svg--></div>' +
      '<div class="kn-liste kn-3" role="group" aria-label="Kontrol noktaları"></div><div class="panel-sonuc sf-sonuc" aria-live="polite"></div>';
    var svg = kok.querySelector('svg'), liste = kok.querySelector('.kn-liste'), sonuc = kok.querySelector('.sf-sonuc'), sec = kok.querySelector('.sf-sec');
    var aktifSen = null, durum = {}, bakilan = [], cozuldu = false, secDugme = {};
    function yukle(ad) {
      aktifSen = SENARYO[ad]; durum = durumOku(aktifSen.durum); bakilan = []; cozuldu = false;
      Object.keys(secDugme).forEach(function (k) { secDugme[k].setAttribute('aria-pressed', k === ad ? 'true' : 'false'); });
      masaDurum(svg, durum); halkalar(svg, []);
      liste.innerHTML = '';
      aktifSen.k.forEach(function (k, i) {
        var b = kontrolDugmesi(liste, String(i + 1), k.ad, k.zor);
        b.addEventListener('click', function () { kontrol(i, b); });
      });
      sonuc.textContent = aktifSen.bas; sonuc.className = 'panel-sonuc sf-sonuc';
    }
    function kontrol(i, b) {
      var k = aktifSen.k[i];
      halkalar(svg, k.hl);
      var atlanan = !cozuldu && i > 0 && bakilan.indexOf(0) < 0;
      if (bakilan.indexOf(i) < 0) bakilan.push(i);
      if (k.sonuc === 'sorun' && !cozuldu) {
        cozuldu = true;
        kontrolSonuc(b, 'sorun');
        Object.keys(k.duzelt).forEach(function (x) { durum[x] = k.duzelt[x]; });
        masaDurum(svg, durum);
        D.ses('klik');
        sonuc.textContent = k.metin + (atlanan ? ' (İpucu: 1. kontrol daha kolaydı; önce onu dene.)' : '');
        sonuc.className = 'panel-sonuc sf-sonuc iyi';
        return;
      }
      if (k.sonuc === 'sorun') { sonuc.textContent = 'Bu sorun çözüldü: ' + k.metin; sonuc.className = 'panel-sonuc sf-sonuc iyi'; return; }
      kontrolSonuc(b, 'ok');
      sonuc.textContent = (cozuldu && k.sonraMetin ? k.sonraMetin : k.metin) + (cozuldu ? '' : ' Sıradaki kontrole geç.') +
        (atlanan ? ' (İpucu: 1. kontrol daha kolaydı.)' : '');
      sonuc.className = 'panel-sonuc sf-sonuc';
    }
    [['ses', 'Ses yok'], ['fare', 'Fare çalışmıyor']].forEach(function (x) { secDugme[x[0]] = DERS.dugme(sec, x[1], function () { yukle(x[0]); }); });
    yukle('ses');
  })();

  /* ─────────── Isı paneli: termometre + fan hızı + durum satırları (Adım 5–6) ─────────── */
  function termometre(s) {
    var e = D.div('termo', s.arayuz);
    e.setAttribute('role', 'status');
    e.innerHTML = '<div class="termo-cubuk"><div class="termo-tup"><span class="termo-dolgu"></span></div><div class="termo-ampul"></div></div>' +
      '<div class="termo-yazi"><small>İşlemci</small><b class="termo-deger">–</b><span class="termo-durum"></span></div>';
    var dolgu = e.querySelector('.termo-dolgu'), ampul = e.querySelector('.termo-ampul'), deger = e.querySelector('.termo-deger'), durum = e.querySelector('.termo-durum');
    var son = null;
    return function (T) {
      var r = Math.round(T);
      if (r === son) return;
      son = r;
      var renk = isiRenk(T);
      dolgu.style.height = (Math.max(0.06, Math.min(1, (T - 20) / 80)) * 100).toFixed(1) + '%';
      dolgu.style.background = renk; ampul.style.background = renk;
      deger.textContent = r + ' °C';
      durum.textContent = durumYazi(T);
      e.setAttribute('data-durum', T >= 85 ? 'cok' : (T >= 68 ? 'sicak' : 'normal'));
    };
  }
  function durumPaneli(s, satirlar) {
    var e = D.div('toz-panel', s.arayuz);
    e.setAttribute('role', 'status');
    var api = {};
    satirlar.forEach(function (x) {
      var r = el('div', 'tp-satir tp-' + x[0], e);
      el('span', 'tp-bas', r, x[1]);
      var d = el('b', 'tp-deger', r, '–');
      var bar = null;
      if (x[2]) { bar = el('span', 'tp-bar', r); el('i', '', bar); }
      api[x[0]] = function (metin, sinif, oran) {
        d.textContent = metin; r.className = 'tp-satir tp-' + x[0] + (sinif ? ' ' + sinif : '');
        if (bar && oran != null) bar.firstChild.style.width = Math.round(Math.max(0, Math.min(1, oran)) * 100) + '%';
      };
    });
    return api;
  }
  var HIZ0 = 9, TUR0 = 1200;
  function turYaz(fan) { var t = Math.round(fan.userData.etkinHiz() / HIZ0 * TUR0 / 10) * 10; return t; }
  /** Kasanın arka duvarı (içten) + fan: A-TOZ sahnelerinin ortak zemini. */
  function fanDuvari(s, toz) {
    var duvar = new THREE.Group();
    var d = K.izgaraDoku('#8a919c', '#23262c');
    d.wrapS = d.wrapT = THREE.RepeatWrapping; d.repeat.set(2.2, 2.2);
    K.koy(duvar, K.kutu(20, 20, 0.5, K.mat('#7b828d', { roughness: 0.45, metalness: 0.55 }), 0.4), 0, 0, -1.65);
    var izgara = K.duzlem(11.4, 11.4, new THREE.MeshStandardMaterial({ map: d, roughness: 0.6, metalness: 0.4 }));
    K.koy(duvar, izgara, 0, 0, -1.38);
    [[-5.25, -5.25], [5.25, -5.25], [-5.25, 5.25], [5.25, 5.25]].forEach(function (c) {
      var v = K.silindir(0.35, 0.3, 'celik', 12); v.rotation.x = Math.PI / 2; K.koy(duvar, v, c[0], c[1], 1.4);
    });
    duvar.traverse(function (o) { o.userData.secilmez = true; });
    s.ekle(duvar);
    var fan = s.ekle('M-FAN', { modelOps: { toz: toz, hiz: HIZ0, kablosuz: true } });
    return fan;
  }

  /* ─────────── Adım 5: A-TOZ — aylar geçer, toz birikir ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.5, 0.32, 1], pay: 0.95, hedefOfset: [2.2, 1, 0] } });
    var fan = fanDuvari(s, 0);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.6, maxPolar: 1.5, minYakin: 0.55, maxYakin: 1.3 } });
    fan.userData.baslat(s);
    var termo = termometre(s), panel = durumPaneli(s, [['zaman', 'Zaman'], ['fan', 'Fan (dakikada)', true], ['pc', 'Bilgisayar']]);
    var mesaj = DERS.sahneMesaj(s);
    var st = { T: 50, mesgul: false, ay: 0 };
    s.herKare(function (dt) {
      var toz = fan.userData.tozOrani || 0;
      var h = 50 + 38 * Math.pow(toz, 1.3);
      st.T += (h - st.T) * (1 - Math.exp(-dt / (AZ ? 0.05 : 0.8)));
      termo(st.T);
      var tur = turYaz(fan);
      panel.fan(tur + ' tur', tur < 800 ? 'kotu' : '', tur / TUR0);
      panel.pc(st.T >= 84 ? 'Yavaşladı' : (st.T >= 68 ? 'Isınıyor' : 'Hızlı'), st.T >= 84 ? 'kotu' : (st.T >= 68 ? 'orta' : 'iyi'));
    });
    var b;
    function aylar() {
      if (st.mesgul) return;
      if (fan.userData.tozOrani > 0.99) { sifirla(); return; }
      st.mesgul = true; b.disabled = true;
      mesaj('Aylar geçiyor… Fana ve hava deliklerine toz birikiyor.', '');
      D.tween({ sahne: s, sure: 6, ease: 'lineer', guncelle: function (e) { var ay = Math.round(e * 12); if (ay !== st.ay) { st.ay = ay; panel.zaman(ay + ' ay', ay >= 9 ? 'kotu' : ''); } } });
      fan.userData.tozla(1, 6).then(function () { return D.bekle(1.6, s); }).then(function () {
        st.mesgul = false; b.disabled = false; dugmeYaz(b, 'Baştan');
        mesaj('Fan zorlanıyor, sıcaklık yükseldi. Bilgisayar kendini korumak için yavaşladı.', 'yanlis');
      });
    }
    function sifirla() {
      if (st.mesgul) return;
      fan.userData.tozla(0, 0); st.T = 50; st.ay = 0; panel.zaman('0 ay', '');
      dugmeYaz(b, 'Aylar geçsin');
      mesaj('Temiz fan: hava rahat akıyor, sıcaklık normal.', '');
    }
    b = s.dugme('Aylar geçsin', 'oynat', aylar, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Zamanı ilerlet: toz birikir' });
    sifirla();
  });

  /* ─────────── Adım 6: güvenli toz temizliği (fiş → tut → kısa kısa hava → fiş) ─────────── */
  function parmak() {
    var g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 3.2, 6, 12), K.mat('#d9a07a', { roughness: 0.7 })));
    var tirnak = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), K.mat('#f0c7a4', { roughness: 0.4 }));
    tirnak.scale.set(1, 0.4, 1); K.koy(g, tirnak, 0, 1.9, 0.3);
    g.traverse(function (o) { o.userData.secilmez = true; });
    return g;
  }
  function spreyKutusu() {
    var g = new THREE.Group();
    var etiketDoku = K.canvasDoku(256, 128, function (ctx, w, h) {
      ctx.fillStyle = '#2563eb'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#eff6ff'; ctx.fillRect(0, 30, w, 68);
      ctx.fillStyle = '#1e3a8a'; ctx.font = '800 24px Inter, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BASINÇLI HAVA', w / 4, 64); ctx.fillText('BASINÇLI HAVA', w * 3 / 4, 64);
    });
    var govde = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 11, 28), new THREE.MeshStandardMaterial({ map: etiketDoku, roughness: 0.35, metalness: 0.3 }));
    K.koy(g, govde, 0, 5.5, 0);
    var omuz = new THREE.Mesh(new THREE.SphereGeometry(2.3, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), K.mat('aluminyum'));
    K.koy(g, omuz, 0, 11, 0);
    K.koy(g, K.silindir(0.9, 1.2, 'plastikSiyah', 16), 0, 13, 0);
    var pipet = K.silindir(0.16, 7, K.mat('#dc2626', { roughness: 0.5 }), 10);
    pipet.rotation.x = Math.PI / 2; K.koy(g, pipet, 0, 13.2, -3.6);
    g.traverse(function (o) { o.userData.secilmez = true; });
    g.userData.uc = new V3(0, 13.2, -7.1);
    return g;
  }
  function parcacikDokusu() {
    return K.canvasDoku(64, 64, function (ctx) {
      var gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, 64, 64);
    });
  }
  /** Hava püskürmesi (beyaz) ve uçuşan toz (gri) parçacıkları. */
  function puskurt(s) {
    var N = AZ ? 20 : 90, doku = parcacikDokusu(), sistemler = {};
    ['hava', 'toz'].forEach(function (ad) {
      var konum = new Float32Array(N * 3), geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(konum, 3));
      var mat = new THREE.PointsMaterial({ color: ad === 'hava' ? 0xeaf6ff : 0x9ca3af, size: ad === 'hava' ? 1.3 : 0.9, map: doku, transparent: true,
        opacity: 0.85, depthWrite: false, sizeAttenuation: true });
      var p = new THREE.Points(geo, mat);
      p.frustumCulled = false; p.userData.secilmez = true; p.raycast = function () {}; p.visible = false;
      s.scene.add(p);
      var hiz = [], omur = new Float32Array(N);
      for (var i = 0; i < N; i++) { hiz.push([0, 0, 0]); konum[i * 3 + 1] = -999; omur[i] = 1; }
      sistemler[ad] = { p: p, konum: konum, hiz: hiz, omur: omur, geo: geo, acik: false };
    });
    var kaynak = new V3(), hedef = new V3();
    s.herKare(function (dt) {
      Object.keys(sistemler).forEach(function (ad) {
        var x = sistemler[ad], canli = 0;
        for (var i = 0; i < N; i++) {
          if (x.omur[i] >= 1) {
            if (x.acik && Math.random() < 0.35) {
              x.omur[i] = 0;
              if (ad === 'hava') {
                x.konum[i * 3] = kaynak.x; x.konum[i * 3 + 1] = kaynak.y; x.konum[i * 3 + 2] = kaynak.z;
                var yon = hedef.clone().sub(kaynak).normalize().multiplyScalar(14);
                x.hiz[i] = [yon.x + (Math.random() - 0.5) * 3, yon.y + (Math.random() - 0.5) * 3, yon.z + (Math.random() - 0.5) * 2];
              } else {
                var a = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 4.5;
                x.konum[i * 3] = Math.cos(a) * r; x.konum[i * 3 + 1] = Math.sin(a) * r; x.konum[i * 3 + 2] = 1.2;
                x.hiz[i] = [Math.cos(a) * (3 + Math.random() * 4), Math.sin(a) * (3 + Math.random() * 4) + 1, 2 + Math.random() * 3];
              }
            } else { x.konum[i * 3 + 1] = -999; continue; }
          }
          x.omur[i] += dt * (ad === 'hava' ? 2.2 : 0.9);
          x.konum[i * 3] += x.hiz[i][0] * dt; x.konum[i * 3 + 1] += x.hiz[i][1] * dt; x.konum[i * 3 + 2] += x.hiz[i][2] * dt;
          if (ad === 'toz') x.hiz[i][1] -= 3 * dt;
          canli++;
        }
        x.p.visible = canli > 0;
        x.geo.attributes.position.needsUpdate = true;
      });
    });
    return {
      hava: function (acik, bas, son) { sistemler.hava.acik = acik; if (bas) kaynak.copy(bas); if (son) hedef.copy(son); },
      toz: function (acik) { sistemler.toz.acik = acik; }
    };
  }

  D.tembel('#s9-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-0.42, 0.34, 1], pay: 0.86, hedefOfset: [-1, 1, 0] } });
    var fan = fanDuvari(s, 1);
    var PRIZ = new V3(-21, -4, -1.4);
    var fisM = s.ekle('M-GUC-FISI', { konum: PRIZ.toArray(), modelOps: { kabloSon: [8, -6, -0.6] } });
    var sprey = spreyKutusu();
    var SP_DIS = new V3(15, -11, 17), SP_IC = new V3(4.2, -9.2, 11.2);
    sprey.position.copy(SP_DIS);
    s.ekle(sprey);
    var el1 = parmak();
    var PY = new V3(1, 1.1, 0.9).normalize(), UC = new V3(3.3, 3.5, 1.45);   // parmak yönü (uçtan geriye) ve kanada değen uç
    el1.scale.setScalar(1.5);
    el1.quaternion.setFromUnitVectors(new V3(0, 1, 0), PY.clone().negate());
    var P_IC = UC.clone().addScaledVector(PY, 3.3), P_DIS = UC.clone().addScaledVector(PY, 13);
    el1.position.copy(P_DIS); el1.visible = false;
    s.kok.add(el1);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.6, maxPolar: 1.5, minYakin: 0.55, maxYakin: 1.3 } });
    fan.userData.baslat(s);
    var termo = termometre(s), panel = durumPaneli(s, [['fis', 'Fiş'], ['fan', 'Fan (dakikada)', true], ['toz', 'Toz']]);
    var mesaj = DERS.sahneMesaj(s), etiket = etiketci(s), pf = puskurt(s);
    var st = { fis: true, tut: false, temiz: false, mesgul: false, T: 86 };
    s.herKare(function (dt) {
      var toz = fan.userData.tozOrani || 0;
      var h = st.fis ? 50 + 38 * Math.pow(toz, 1.3) : 28;
      st.T += (h - st.T) * (1 - Math.exp(-dt / (AZ ? 0.05 : (st.fis ? 0.8 : 2.2))));
      termo(st.T);
      var tur = turYaz(fan);
      panel.fan(st.tut ? 'tutuluyor' : (tur + ' tur'), (tur > TUR0 * 1.2 ? 'kotu' : (tur < 800 && st.fis ? 'kotu' : '')), Math.min(1, tur / TUR0));
      panel.toz(toz > 0.6 ? 'çok' : (toz > 0.05 ? 'azalıyor' : 'temiz'), toz > 0.6 ? 'kotu' : (toz > 0.05 ? 'orta' : 'iyi'));
    });
    function uyariGecici(p, g) {
      D.uyari(p, { genlik: g }).then(function () { return D.bekle(1.2, s); }).then(function () { D.vurguKaldir(p); });
    }
    var b1, b2, b3;
    function yazilar() {
      dugmeYaz(b1, st.temiz && !st.fis ? '4 · Fişi tak' : (st.fis ? (st.temiz ? '✓ Fiş takılı' : '1 · Fişi çek') : '✓ Fiş çekili'));
      dugmeYaz(b2, (st.tut ? '✓ ' : '2 · ') + 'Fanı tut');
      dugmeYaz(b3, (st.temiz ? '✓ ' : '3 · ') + 'Hava sık');
      panel.fis(st.fis ? 'takılı' : 'çekili', st.fis ? 'orta' : 'iyi');
    }
    function fisDugmesi() {
      if (st.mesgul) return;
      if (st.fis && st.temiz) { mesaj('Temizlik bitti. Fan normal hızında.', 'dogru'); return; }
      st.mesgul = true;
      if (st.fis) {
        etiket(fisM.userData.fis, 'Fiş çekiliyor', 'vurgu');
        fisM.userData.cek(1).then(function () {
          st.fis = false; yazilar();
          etiket(fisM.userData.fis, 'Fiş çekili', 'dogru');
          mesaj('Fiş çekildi: fan durdu. Artık güvenle çalışabilirsin.', 'dogru');
          return fan.userData.hizAyarla(0, 1.6);
        }).then(function () { st.mesgul = false; });
        return;
      }
      if (!st.temiz) { st.mesgul = false; mesaj('Önce temizliği bitir: fanı tut ve hava sık.', ''); return; }
      etiket(fisM.userData.fis, 'Fiş takılıyor', 'vurgu');
      fisM.userData.tak(1).then(function () {
        D.ses('klik');
        st.fis = true; yazilar();
        etiket(fan, 'Temiz fan', 'dogru');
        mesaj('Temiz fan normal hızında dönüyor. Sıcaklık düşüyor.', 'dogru');
        return fan.userData.hizAyarla(HIZ0, 1.6);
      }).then(function () { st.mesgul = false; });
    }
    function fisUyarisi() {
      uyariGecici(fisM.userData.fis, 0.8);
      etiket(fisM.userData.fis, 'Önce fişi çek!', 'hata');
      mesaj('Dur! Fiş takılıyken fana dokunulmaz, hava sıkılmaz. Önce fişi çek.', 'yanlis');
    }
    function tut() {
      if (st.mesgul) return;
      if (st.fis) { fisUyarisi(); return; }
      if (st.tut) { mesaj('Fanı zaten tutuyorsun.', ''); return; }
      st.mesgul = true;
      el1.visible = true; el1.position.copy(P_DIS);
      D.git(el1, P_IC, 1.0).then(function () {
        st.tut = true; st.mesgul = false; yazilar();
        etiket(el1, 'Fan tutuluyor', 'dogru');
        mesaj('Parmağınla bir kanadı tuttun: fan artık serbest dönemez.', 'dogru');
      });
    }
    function hava() {
      if (st.mesgul) return;
      if (st.fis) { fisUyarisi(); return; }
      if (st.temiz) { mesaj('Fan zaten temiz.', 'dogru'); return; }
      st.mesgul = true;
      var uc = function () { return sprey.localToWorld(sprey.userData.uc.clone()); };
      D.git(sprey, SP_IC, 0.9).then(function () {
        var bas = uc(), son = new V3(3.5, 3.5, 1.2);
        if (!st.tut) {
          pf.hava(true, bas, son);
          mesaj('Fan tutulmadı: hava onu hızla döndürüyor!', 'yanlis');
          return fan.userData.hizAyarla(34, 0.6).then(function () { return D.bekle(0.6, s); }).then(function () {
            pf.hava(false);
            uyariGecici(fan, 0.5);
            etiket(fan, 'Fan serbest dönmemeli', 'hata');
            mesaj('Dur! Serbest dönen fan zarar görebilir. Önce fanı tut, sonra sık.', 'yanlis');
            return fan.userData.hizAyarla(0, 1.4);
          }).then(function () { return D.git(sprey, SP_DIS, 0.7); }).then(function () { st.mesgul = false; });
        }
        etiket(null);
        mesaj('Kısa kısa sık: toz uçuyor. Kutuyu dik tut.', '');
        var z = Promise.resolve();
        [0, 1, 2].forEach(function (k) {
          z = z.then(function () {
            pf.hava(true, bas, son); pf.toz(true); D.ses('klik');
            fan.userData.tozla(Math.max(0, 1 - (k + 1) / 3), 0.8);
            return D.bekle(0.8, s);
          }).then(function () { pf.hava(false); pf.toz(false); return D.bekle(0.45, s); });
        });
        return z.then(function () {
          st.temiz = true;
          return Promise.all([D.git(sprey, SP_DIS, 0.8), D.git(el1, P_DIS, 0.8)]);
        }).then(function () {
          el1.visible = false; st.tut = false; st.mesgul = false; yazilar();
          etiket(fan, 'Toz gitti', 'dogru');
          mesaj('Toz gitti! Şimdi fişi tak ve fanı izle.', 'dogru');
        });
      });
    }
    function sifirla() {
      if (st.mesgul) return;
      st.fis = true; st.tut = false; st.temiz = false; st.T = 86;
      fisM.userData.tak(0.01); fan.userData.tozla(1, 0); fan.userData.hizAyarla(HIZ0, 0);
      sprey.position.copy(SP_DIS); el1.visible = false; el1.position.copy(P_DIS);
      etiket(null); yazilar();
      mesaj('Tozlu fan zorlanıyor, bilgisayar sıcak. Temizlik zamanı!', '');
    }
    b1 = s.dugme('1 · Fişi çek', null, fisDugmesi, { yer: 'alt-orta', aciklama: 'Fişi çek ya da tak' });
    b2 = s.dugme('2 · Fanı tut', null, tut, { yer: 'alt-orta', aciklama: 'Fanı parmakla tut' });
    b3 = s.dugme('3 · Hava sık', null, hava, { yer: 'alt-orta', aciklama: 'Basınçlı havayı kısa kısa sık' });
    s.dugme('Baştan', 'sifirla', sifirla, { yer: 'ust-sag', aciklama: 'Temizliği başa al' });
    s.tiklaninca(function (p) { if (p && (p.name === 'fis' || p.name === 'priz')) fisDugmesi(); });
    sifirla();
  });

  /* ─────────── Etkinlik 1: E-TESHIS — arıza teşhis oyunu ─────────── */
  (function () {
    var kok = document.getElementById('teshis');
    if (!kok) return;
    var KONTROL = [
      { id: 'fis', ad: 'Priz ve fiş', zor: 1, hl: ['fis'] },
      { id: 'dugme', ad: 'Güç düğmeleri', zor: 1, hl: ['kasa-dugme', 'mon-dugme', 'hop-dugme'] },
      { id: 'ses', ad: 'Ses düzeyi', zor: 1, hl: ['ses'] },
      { id: 'pil', ad: 'Fare pili', zor: 1, hl: ['fare'] },
      { id: 'kablo', ad: 'Kablolar ve alıcı', zor: 2, hl: ['kablo', 'alici'] },
      { id: 'kasa', ad: 'Kasayı aç', zor: 3, hl: ['kasa'] }
    ];
    var ZOR = ['', 'kolay', 'orta', 'zor'];
    var VAKA = [
      { ad: 'Açılmıyor', belirti: 'Düğmeye basınca hiçbir ışık yanmıyor, fan sesi yok.', durum: 'fis-cikik',
        sonuc: { fis: ['sorun', 'Fiş prizden çıkmış! Taktın; bilgisayar açıldı.'], dugme: ['ok', 'Düğmeye bastın ama tepki yok. Elektrik geliyor mu?'], kablo: ['ok', 'Arkadaki kablolar takılı.'] },
        duzelt: { 'fis-cikik': false, 'kasa-acik': true, 'mon-acik': true, 'hop-acik': true } },
      { ad: 'Görüntü yok', belirti: 'Kasanın ışığı yanıyor, fan dönüyor. Ekran tamamen karanlık.', durum: 'kasa-acik hop-acik',
        sonuc: { fis: ['ok', 'Fişler prize takılı.'], dugme: ['sorun', 'Monitör kapalıymış! Düğmesine basınca görüntü geldi.'], kablo: ['ok', 'Görüntü kablosu iki uçta da takılı.'] },
        duzelt: { 'mon-acik': true } },
      { ad: 'Ses yok', belirti: 'Video oynuyor ama hoparlörden hiç ses gelmiyor.', durum: 'kasa-acik mon-acik hop-acik hop-kablo-cikik',
        sonuc: { ses: ['ok', 'Ses düzeyi açık, sessizde değil.'], dugme: ['ok', 'Hoparlör açık; ışığı yanıyor.'], kablo: ['sorun', 'Hoparlör kablosu çıkmış! Yeşil ses çıkışına taktın; ses geldi.'] },
        duzelt: { 'hop-kablo-cikik': false } },
      { ad: 'Fare çalışmıyor', belirti: 'Kablosuz fare hareket ediyor ama imleç kıpırdamıyor.', durum: 'kasa-acik mon-acik hop-acik alici-cikik',
        sonuc: { pil: ['ok', 'Fare açık, pili dolu.'], kablo: ['sorun', 'Fare alıcısı kasadan çıkmış! Taktın; imleç hareket etti.'] },
        duzelt: { 'alici-cikik': false } }
    ];
    kok.innerHTML = '<div class="ts"><div class="ts-bas"><span class="ts-vaka"></span><span class="ts-belirti"></span></div>' +
      '<div class="masa-sahne ts-sahne"><!--@dahil:masa-b.svg--></div>' +
      '<div class="kn-liste kn-6" role="group" aria-label="Kontrol noktaları"></div>' +
      '<div class="ts-alt"><div class="panel-sonuc ts-sonuc" aria-live="polite"></div><button type="button" class="h13-oynat ts-ileri" hidden></button></div></div>';
    var svg = kok.querySelector('svg'), liste = kok.querySelector('.kn-liste'), sonuc = kok.querySelector('.ts-sonuc'), ileri = kok.querySelector('.ts-ileri');
    var vakaEl = kok.querySelector('.ts-vaka'), belirtiEl = kok.querySelector('.ts-belirti');
    var gorevler = document.querySelectorAll('#gorevler-1 li'), ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var dugmeler = {};
    KONTROL.forEach(function (k, i) {
      var b = kontrolDugmesi(liste, String(i + 1), k.ad, ZOR[k.zor]);
      b.addEventListener('click', function () { kontrol(k, b); });
      dugmeler[k.id] = b;
    });
    var v = 0, durum = {}, bakilan = {}, yildiz = true, bitti = false, cozulen = 0, yildizlar = 0, atlananMetin = '';
    function vakaYukle(i) {
      v = i; var x = VAKA[i];
      durum = durumOku(x.durum); bakilan = {}; yildiz = true; bitti = false; atlananMetin = '';
      masaDurum(svg, durum); halkalar(svg, []);
      KONTROL.forEach(function (k) { var b = dugmeler[k.id]; kontrolSonuc(b, null); b.disabled = false; });
      vakaEl.textContent = 'Vaka ' + (i + 1) + ' / ' + VAKA.length + ' · ' + x.ad;
      belirtiEl.textContent = x.belirti;
      sonuc.textContent = 'Belirtiye bak. En kolay ilgili kontrolden başla.'; sonuc.className = 'panel-sonuc ts-sonuc';
      ileri.hidden = true;
      gorevler.forEach(function (li, j) { li.classList.toggle('simdi', j === i); });
    }
    function kontrol(k, b) {
      if (bitti) return;
      var x = VAKA[v];
      halkalar(svg, k.hl);
      if (k.id === 'kasa') {
        yildiz = false;
        kontrolSonuc(b, 'uyari');
        b.classList.remove('salla'); void b.offsetWidth; b.classList.add('salla');
        D.ses('hata');
        sonuc.textContent = 'Dur! Kasayı açmak en son çaredir ve yetişkin işidir. Önce basit kontrolleri yap.';
        sonuc.className = 'panel-sonuc ts-sonuc kotu';
        return;
      }
      var r = x.sonuc[k.id];
      if (!r) {
        kontrolSonuc(b, 'ilgisiz');
        sonuc.textContent = 'Bu kontrol bu belirtiyle ilgili değil. Belirtiyi yeniden oku.';
        sonuc.className = 'panel-sonuc ts-sonuc';
        return;
      }
      // Daha kolay, ilgili ve bakılmamış bir kontrol var mı?
      if (!bakilan[k.id]) {
        var atlanan = KONTROL.filter(function (y) { return x.sonuc[y.id] && y.zor < k.zor && !bakilan[y.id]; });
        if (atlanan.length) { yildiz = false; atlananMetin = atlanan.map(function (y) { return y.ad; }).join(', '); }
      }
      bakilan[k.id] = true;
      if (r[0] === 'ok') {
        kontrolSonuc(b, 'ok');
        sonuc.textContent = r[1] + (atlananMetin && yildiz === false ? ' Daha kolay bir kontrol atladın: ' + atlananMetin + '.' : '');
        sonuc.className = 'panel-sonuc ts-sonuc';
        return;
      }
      // Arıza bulundu: sistem canlanır
      bitti = true; cozulen++;
      if (yildiz) yildizlar++;
      kontrolSonuc(b, 'sorun');
      Object.keys(x.duzelt).forEach(function (d) { durum[d] = x.duzelt[d]; });
      masaDurum(svg, durum);
      D.ses('klik');
      KONTROL.forEach(function (y) { dugmeler[y.id].disabled = true; });
      sonuc.textContent = r[1] + (yildiz ? ' ★ En basitten başladın!' : ' ☆ Yıldız yok: ' + (atlananMetin ? 'önce şuna bakmalıydın: ' + atlananMetin + '.' : 'kasayı açmaya kalkma.'));
      sonuc.className = 'panel-sonuc ts-sonuc iyi';
      var li = gorevler[v];
      if (li) { li.classList.remove('simdi'); li.classList.add('tamam'); var y = li.querySelector('.yildiz'); if (y) y.textContent = yildiz ? '★' : '☆'; }
      ilerle(cozulen, VAKA.length);
      ileri.hidden = false;
      ileri.innerHTML = '<span>' + (v < VAKA.length - 1 ? 'Sonraki vaka →' : 'Sonucu gör') + '</span>';
      ileri.focus({ preventScroll: true });
    }
    ileri.addEventListener('click', function () {
      if (v < VAKA.length - 1) { vakaYukle(v + 1); return; }
      ileri.hidden = true;
      vakaEl.textContent = 'Tüm vakalar çözüldü';
      belirtiEl.textContent = VAKA.length + ' arızanın hepsini buldun. Yıldızın: ' + yildizlar + ' / ' + VAKA.length + '.';
      sonuc.textContent = yildizlar === VAKA.length ? 'Harika: her seferinde en basitten başladın!' : 'Tekrar oyna ve her vakada en kolay kontrolden başla.';
      sonuc.className = 'panel-sonuc ts-sonuc iyi';
      var yeniden = DERS.dugme(kok.querySelector('.ts-alt'), 'Yeniden oyna', function () {
        yeniden.remove(); cozulen = 0; yildizlar = 0; ilerle(0, VAKA.length);
        gorevler.forEach(function (li) { li.classList.remove('tamam', 'simdi'); var y = li.querySelector('.yildiz'); if (y) y.textContent = ''; });
        vakaYukle(0);
      }, 'h13-oynat');
      DERS.konfeti();
    });
    vakaYukle(0);
  })();

  /* ─────────── Etkinlik 2: temizlik sırası + gözlem + bakım kartı ─────────── */
  (function () {
    var kok = document.getElementById('gozlem');
    if (!kok) return;
    var ADIMLAR = [
      ['<!--@dahil:ad-1.svg-->', 'Bilgisayarı kapat, fişi çek.'],
      ['<!--@dahil:ad-2.svg-->', 'Kapağı bir yetişkin açar.'],
      ['<!--@dahil:ad-3.svg-->', 'Fanı parmağınla tut.'],
      ['<!--@dahil:ad-4.svg-->', 'Basınçlı havayı kısa kısa sık.'],
      ['<!--@dahil:ad-5.svg-->', 'Kapağı kapat, fişi tak.'],
      ['<!--@dahil:ad-6.svg-->', 'Açıp sıcaklığa ve fana bak.']
    ];
    var IPUCU = ['İlk adım her zaman güvenlik adımıdır.', 'Kasanın içine ulaşmak için ne gerekir?', 'Hava sıkmadan önce fan ne yapılmalı?',
      'Fan tutuldu; şimdi temizlik.', 'Temizlik bitti; kasayı toparla.', 'Son olarak sonucu kontrol et.'];
    var KARISIK = [3, 0, 5, 2, 4, 1];
    var SORU = [
      ['Toz en çok nerede birikmişti?', ['Fan kanatlarında', 'Hava deliklerinde', 'Soğutucuda']],
      ['Öğretmen fanı tuttu mu?', ['Evet, tuttu', 'Hayır, tutmadı']],
      ['Temizlikten sonra ne değişti?', ['Fan rahatladı', 'Sıcaklık düştü', 'Fark görmedim']]
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-2'), gorevler = document.querySelectorAll('#gorevler-2 li');
    kok.innerHTML = '<div class="gz"><div class="gz-bas"></div><div class="gz-govde"></div><div class="panel-sonuc gz-sonuc" aria-live="polite"></div></div>';
    var bas = kok.querySelector('.gz-bas'), govde = kok.querySelector('.gz-govde'), sonuc = kok.querySelector('.gz-sonuc');
    var sira = 0, cevap = {};
    function gorev(i) { gorevler.forEach(function (li, j) { li.classList.toggle('tamam', j < i); li.classList.toggle('simdi', j === i); }); }
    function toplam() { return sira + Object.keys(cevap).length; }
    function asama1() {
      gorev(0);
      bas.textContent = 'Temizlik adımlarına doğru sırayla dokun (1’den 6’ya).';
      govde.innerHTML = '<div class="gz-izgara" role="group" aria-label="Temizlik adımları"></div>';
      var iz = govde.firstChild;
      KARISIK.forEach(function (i) {
        var b = el('button', 'gz-kart', iz); b.type = 'button';
        b.innerHTML = '<span class="gz-resim">' + ADIMLAR[i][0] + '</span><span class="gz-metin"></span><span class="gz-no"></span>';
        b.querySelector('.gz-metin').textContent = ADIMLAR[i][1];
        b.addEventListener('click', function () {
          if (b.classList.contains('dogru')) return;
          if (i === sira) {
            b.classList.add('dogru'); b.disabled = true; b.querySelector('.gz-no').textContent = String(i + 1);
            sira++; ilerle(toplam(), 9); D.ses('klik');
            sonuc.textContent = sira < 6 ? '✓ ' + (i + 1) + '. adım doğru.' : '✓ Sıra tamam! Şimdi öğretmeninin gösterisini izle.';
            sonuc.className = 'panel-sonuc gz-sonuc iyi';
            if (sira === 6) setTimeout(asama2, AZ ? 10 : 1300);
          } else {
            b.classList.remove('salla'); void b.offsetWidth; b.classList.add('salla');
            sonuc.textContent = '✗ Sırası henüz gelmedi. İpucu: ' + IPUCU[sira];
            sonuc.className = 'panel-sonuc gz-sonuc kotu';
          }
        });
      });
    }
    function asama2() {
      gorev(1);
      bas.textContent = 'Öğretmeninin gösterisini izle. Gördüklerini işaretle.';
      govde.innerHTML = '<div class="gz-sorular"></div>';
      var kap = govde.firstChild;
      SORU.forEach(function (q, i) {
        var d = el('div', 'gz-soru', kap);
        el('b', '', d, (i + 1) + '. ' + q[0]);
        var sec = el('div', 'secici', d); sec.setAttribute('role', 'group'); sec.setAttribute('aria-label', q[0]);
        q[1].forEach(function (m, j) {
          var b = DERS.dugme(sec, m, function () {
            cevap[i] = j;
            sec.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
            ilerle(toplam(), 9);
            if (i === 1 && j === 1) { sonuc.textContent = 'Bunu öğretmenine sor: fan hava sıkılırken tutulmalıdır.'; sonuc.className = 'panel-sonuc gz-sonuc kotu'; }
            else { sonuc.textContent = 'Gözlemin kaydedildi.'; sonuc.className = 'panel-sonuc gz-sonuc iyi'; }
            if (Object.keys(cevap).length === SORU.length) {
              var k = DERS.dugme(kap, 'Bakım kartımı oluştur', asama3, 'h13-oynat gz-kart-dugme');
              if (kap.querySelectorAll('.gz-kart-dugme').length > 1) k.remove();
            }
          });
          b.setAttribute('aria-pressed', 'false');
        });
      });
      sonuc.textContent = ''; sonuc.className = 'panel-sonuc gz-sonuc';
    }
    function asama3() {
      gorev(3);
      bas.textContent = 'Bakım kartın hazır. Evdeki bilgisayarın için de kullan.';
      var gozlem = SORU.map(function (q, i) { return q[1][cevap[i]]; });
      govde.innerHTML = '<div class="bk"><div class="bk-bas">Bakım Kartım</div><ul class="bk-liste"></ul><div class="bk-gozlem"></div></div>';
      var ul = govde.querySelector('.bk-liste');
      [['Her gün', 'Hava deliklerinin önünü açık tut.'], ['Her hafta', 'Fiş çekiliyken klavyeyi ve ekranı kuru, yumuşak bezle sil.'],
        ['Birkaç ayda bir', 'Bir yetişkinle toz temizliği yap: fiş çekili, fan tutulur.'], ['Sorun görürsen', 'Güvendiğin bir yetişkine söyle.']].forEach(function (x) {
        var li = el('li', '', ul); el('b', '', li, x[0]); el('span', '', li, x[1]);
      });
      govde.querySelector('.bk-gozlem').textContent = 'Gözlemim: toz ' + gozlem[0].toLocaleLowerCase('tr') + ' vardı · ' + gozlem[2] + '.';
      sonuc.textContent = '✓ Etkinlik tamam!'; sonuc.className = 'panel-sonuc gz-sonuc iyi';
      DERS.konfeti();
    }
    asama1();
  })();

  /* ─────────── Derinleş: bip desenleri (2D + WebAudio) ─────────── */
  (function () {
    var kok = document.getElementById('bip');
    if (!kok) return;
    var DESEN = [
      { ad: 'Tek kısa bip', d: [0.12], metin: 'Birçok bilgisayarda: denetim tamam, açılış sürüyor.' },
      { ad: 'Tekrarlanan bipler', d: [0.6, 0.12, 0.12], metin: 'Bir parçada sorun olabilir. Sayısını ve uzunluğunu not et.' },
      { ad: 'Hiç bip yok', d: [], metin: 'Birçok yeni kasada bip hoparlörü yoktur. Ekrana ve ışıklara bak.' }
    ];
    kok.innerHTML = '<div class="bip-ust"><!--@dahil:bip.svg--></div><div class="bip-kartlar"></div>' +
      '<div class="bip-not"><span>📖</span><span>Aynı bip dizisi farklı üreticilerde farklı anlama gelir. <strong>Kılavuza bak.</strong></span></div>';
    var svg = kok.querySelector('svg'), kartlar = kok.querySelector('.bip-kartlar'), calan = 0;
    function sesCal(sure, bas) {
      try {
        if (typeof soundEnabled !== 'undefined' && !soundEnabled) return; // eslint-disable-line no-undef
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        var ctx = D._sesCtx || (D._sesCtx = new AC());
        var t = ctx.currentTime + bas, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'square'; o.frequency.setValueAtTime(1000, t);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.045, t + 0.01);
        g.gain.setValueAtTime(0.045, t + sure - 0.02); g.gain.linearRampToValueAtTime(0.0001, t + sure);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + sure + 0.02);
      } catch (e) { /* ses isteğe bağlı */ }
    }
    DESEN.forEach(function (x) {
      var k = el('div', 'bip-kart', kartlar);
      el('b', 'bip-ad', k, x.ad);
      var n = el('div', 'bip-desen', k);
      n.setAttribute('aria-label', x.d.length ? x.d.map(function (s) { return s > 0.3 ? 'uzun' : 'kısa'; }).join(', ') : 'ses yok');
      if (!x.d.length) el('span', 'bip-yok', n, 'sessiz');
      x.d.forEach(function (s) { el('i', s > 0.3 ? 'uzun' : 'kisa', n); });
      el('span', 'bip-metin', k, x.metin);
      var b = DERS.dugme(k, 'Dinle', function () {
        var no = ++calan, t = 0;
        var noktalar = n.querySelectorAll('i');
        svg.classList.remove('caliyor');
        x.d.forEach(function (s, i) {
          sesCal(s, t);
          (function (bas, sure, nokta) {
            setTimeout(function () { if (no !== calan) return; nokta.classList.add('yan'); svg.classList.add('caliyor'); }, AZ ? 0 : bas * 1000);
            setTimeout(function () { nokta.classList.remove('yan'); svg.classList.remove('caliyor'); }, AZ ? 200 : (bas + sure) * 1000);
          })(t, s, noktalar[i]);
          t += s + 0.25;
        });
        if (!x.d.length) { n.classList.add('yan'); setTimeout(function () { n.classList.remove('yan'); }, 900); }
      }, 'bip-dinle');
      b.setAttribute('aria-label', x.ad + ': dinle');
    });
  })();
})();
