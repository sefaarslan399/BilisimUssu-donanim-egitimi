/* DON-301 H04 — Depolama · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var V3 = D.kit.V3, THREE = D.kit.THREE, K = D.kit;
  DERS.tahminKur('Tahminini aldık. Adım 4’te çentiklere bakacak, Etkinlik 2’de yuvaları sınayacağız.');

  /* ─────────── Ortak yardımcılar ─────────── */
  function el(etiket, sinif, ebeveyn, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function bekle(sn) { return new Promise(function (r) { setTimeout(r, AZ ? 10 : sn * 1000); }); }
  function sayi(n, basamak) {
    var s = (basamak == null ? Math.round(n) : n.toFixed(basamak)).toString();
    var p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return p.join(',');
  }
  function secilmezYap(nesne) { nesne.traverse(function (o) { o.userData.secilmez = true; }); }
  function basili(liste, secili) { liste.forEach(function (b) { b.setAttribute('aria-pressed', b === secili ? 'true' : 'false'); }); }

  /* ─────────── Kapak: HDD, SATA SSD, M ve B+M anahtarlı M.2 ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: false, kamera: { yon: [0.3, 1.05, 1], pay: 0.8 } });
    var hdd = s.ekle('M-HDD-ACIK', { konum: [-6.2, 0, -1], donus: [0, Math.PI + 0.25, 0] });
    s.ekle('M-SSD', { konum: [8.6, 0, -3.4], donus: [0, -0.35, 0] });
    s.ekle(D.model('M-M2', { anahtar: 'M' }), { konum: [4.4, 0, 3.4], donus: [0, 0.12, 0] });
    s.ekle(D.model('M-M2', { anahtar: 'BM', kapasite: '512 GB' }), { konum: [4.4, 0, 6.6], donus: [0, 0.12, 0] });
    s.yerlestir();
    var u = hdd.userData;
    s.herKare(function (dt) { u.rotor.rotation.y -= (AZ ? 0.5 : 3.2) * dt; });
    (function ara() {
      if (AZ) return;
      u.kafaGit(Math.random(), 0.35).then(function () { return D.bekle(0.9, s); }).then(ara);
    })();
    var t0 = s.orb.theta, z = 0;
    s.herKare(function (dt) { if (!AZ) { z += dt; s.orb.theta = t0 + Math.sin(z * 0.3) * 0.3; } });
  });

  /* ─────────── Adım 1: HDD — arama süresi + dönüş gecikmesi (A-DONUS) ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.42, 1.5, 0.85], pay: 1.0, hedefOfset: [0.3, 0, 0.2] } });
    var h = s.ekle('M-HDD-ACIK', { donus: [0, Math.PI, 0] });   // kol tarafı arkada: kamera kolu duvarın üstünden görür
    s.yerlestir();
    secilmezYap(h.userData.kapak);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.2, maxPolar: 1.25, minYakin: 0.45, maxYakin: 1.3 } });
    var u = h.userData, mesaj = DERS.sahneMesaj(s);
    var rpm = 7200, okuyor = false, bosta = true, sonOran = 0.6, birikim = 0;
    var W7200 = 2.4;                                    // görsel açısal hız (rad/sn); oran 5400/7200 korunur
    function w() { return (AZ ? 0.15 : 1) * W7200 * rpm / 7200; }
    s.herKare(function (dt) { var d = w() * dt; u.rotor.rotation.y -= d; birikim += d; });
    function turMs() { return 60000 / rpm; }

    // Hedef sektör: dönen rotorun üstünde küçük yay (derse özel)
    var pm = u.olcu.plakaMerkez;
    var sekMat = new THREE.MeshBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false });
    sekMat.toneMapped = false;
    var sektor = new THREE.Mesh(new THREE.BufferGeometry(), sekMat);
    sektor.rotation.x = -Math.PI / 2;
    sektor.position.y = pm.y + 0.008;
    sektor.visible = false;
    sektor.userData.secilmez = true; sektor.userData.golgeYok = true;
    sektor.raycast = function () {};
    var capa = new THREE.Object3D();
    u.rotor.add(sektor, capa);
    function sektorKur(r, a) {
      sektor.geometry.dispose();
      sektor.geometry = new THREE.RingGeometry(r - 0.16, r + 0.16, 12, 1, a - 0.2, 0.4);
      capa.position.set(r * Math.cos(a), pm.y, -r * Math.sin(a));
      sekMat.color.set(0x4f46e5);
      sektor.visible = true;
    }
    function aciXZ(v, c) { return Math.atan2(v.z - c.z, v.x - c.x); }
    function kalanAci() {
      var c = u.rotor.getWorldPosition(new V3()), k = u.kafa.getWorldPosition(new V3()), a = capa.getWorldPosition(new V3());
      var d = aciXZ(k, c) - aciXZ(a, c);
      d = d % (Math.PI * 2); if (d < 0) d += Math.PI * 2;
      return d;
    }

    // Süre paneli (gerçek ölçek, ms)
    var panel = D.div('hd-panel', s.arayuz);
    panel.innerHTML = '<div class="hd-rpm"><b></b><span></span></div><div class="hd-serit"><i class="hd-ara"></i><i class="hd-don"></i></div>' +
      '<div class="hd-olcek"><span>0</span><span>10 ms</span><span>20 ms</span></div><div class="hd-deger"><span class="hd-a">Arama —</span><span class="hd-d">Dönüş —</span></div>';
    var OLCEK = 25;
    var sAra = panel.querySelector('.hd-ara'), sDon = panel.querySelector('.hd-don');
    var tAra = panel.querySelector('.hd-a'), tDon = panel.querySelector('.hd-d');
    function rpmYaz() {
      panel.querySelector('.hd-rpm b').textContent = rpm + ' dev/dk';
      panel.querySelector('.hd-rpm span').textContent = '1 tur ≈ ' + sayi(turMs(), 2) + ' ms · ort. dönüş ≈ ' + sayi(turMs() / 2, 2) + ' ms';
    }
    function seritYaz(araMs, donMs) {
      sAra.style.width = Math.min(100, araMs / OLCEK * 100).toFixed(1) + '%';
      sDon.style.width = Math.min(100 - Math.min(100, araMs / OLCEK * 100), donMs / OLCEK * 100).toFixed(1) + '%';
      tAra.textContent = araMs > 0 ? 'Arama ≈ ' + sayi(araMs, 1) + ' ms' : 'Arama —';
      tDon.textContent = donMs > 0 ? 'Dönüş ≈ ' + sayi(donMs, 1) + ' ms' : 'Dönüş —';
    }
    rpmYaz(); seritYaz(0, 0);

    var etSektor = null;
    function ara() {
      if (!bosta || okuyor || AZ) return;
      var o = Math.random();
      u.kafaGit(o, 0.3).then(function () { if (bosta && !okuyor) { sonOran = o; u.izGoster(o); } return D.bekle(0.8, s); }).then(ara);
    }
    function sektorOku() {
      if (okuyor) return;
      okuyor = true; bosta = false;
      var hedef;
      do { hedef = 0.08 + Math.random() * 0.88; } while (Math.abs(hedef - sonOran) < 0.25);
      var fark = Math.abs(hedef - sonOran);
      var araMs = 1 + 13 * Math.sqrt(fark);              // yaklaşık: iz-iz ≈ 1 ms, tam kol ≈ 14 ms, üçte bir ≈ 8,5 ms
      var r = u.izYaricap(hedef);
      sektorKur(r, Math.random() * Math.PI * 2);
      if (etSektor) etSektor.kaldir();
      etSektor = s.etiket(capa, 'Hedef sektör', { tur: 'odak', yer: 'merkez', ofset: [0, 0.2, 0] });
      u.izGoster(hedef);
      seritYaz(0, 0);
      mesaj('1 · Arama: kol, kafayı hedef ize taşıyor…', '');
      var seritTw = D.tween({ sahne: s, sure: AZ ? 0.01 : 0.9, guncelle: function (e) { seritYaz(araMs * e, 0); } });
      Promise.all([u.kafaGit(hedef, AZ ? 0.01 : 0.9), seritTw]).then(function () {
        sonOran = hedef;
        var kalan = kalanAci(), bas = birikim;
        mesaj('2 · Dönüş gecikmesi: sektörün kafanın altına gelmesi bekleniyor…', '');
        return new Promise(function (coz) {
          if (AZ) { u.rotor.rotation.y -= kalan; birikim += kalan; }
          var sok = s.herKare(function () {
            var gecen = Math.min(birikim - bas, kalan);
            seritYaz(araMs, gecen / (Math.PI * 2) * turMs());
            if (birikim - bas >= kalan) { sok(); coz(kalan / (Math.PI * 2) * turMs()); }
          });
        });
      }).then(function (donMs) {
        sekMat.color.set(0x10b981);
        if (etSektor) etSektor.metin('✓ Okundu');
        seritYaz(araMs, donMs);
        mesaj('✓ Toplam ≈ ' + sayi(araMs + donMs, 1) + ' ms (arama ' + sayi(araMs, 1) + ' + dönüş ' + sayi(donMs, 1) + '). Bir SSD bu sürede yüzlerce okuma yapar.', 'dogru');
        return D.bekle(AZ ? 0.2 : 2.6, s);
      }).then(function () {
        sektor.visible = false;
        if (etSektor) { etSektor.kaldir(); etSektor = null; }
        okuyor = false; bosta = true;
        ara();
      });
    }
    var bRpm = [];
    function rpmSec(v, b) {
      rpm = v; basili(bRpm, b);
      bRpm.forEach(function (x) { x.classList.toggle('don3d-dugme--secili', x === b); });
      rpmYaz();
      if (!okuyor) mesaj(v + ' dev/dk: bir tur ≈ ' + sayi(turMs(), 1) + ' ms, ortalama dönüş gecikmesi ≈ ' + sayi(turMs() / 2, 1) + ' ms.', '');
    }
    s.dugme('Sektör oku', 'oynat', sektorOku, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Bir sektörü okumayı izle: arama ve dönüş gecikmesini ölç' });
    bRpm.push(s.dugme('5400', null, function () { rpmSec(5400, bRpm[0]); }, { yer: 'alt-orta', aciklama: 'Plaka hızı 5400 devir/dakika' }));
    bRpm.push(s.dugme('7200', null, function () { rpmSec(7200, bRpm[1]); }, { yer: 'alt-orta', aciklama: 'Plaka hızı 7200 devir/dakika' }));
    rpmSec(7200, bRpm[1]);
    s.etiket(u.kafa, 'Okuma-yazma kafası', { tur: 'vurgu' });
    var pl = new THREE.Object3D();
    pl.position.set(pm.x + 2.4, pm.y, pm.z - 2.9);
    h.add(pl);
    s.etiket(pl, 'Plaka · izler', {});
    mesaj('Plaka dönüyor; kafa izden ize gidiyor. “Sektör oku” ile bir okumanın süresini ölç.', '');
    s._h04 = { oku: sektorOku, mesgul: function () { return okuyor; } };
    ara();
  });

  /* ─────────── Adım 2: NAND — sayfa, blok, TRIM, çöp toplama ─────────── */
  (function () {
    var kok = document.getElementById('nand');
    if (!kok) return;
    var BL = 4, SY = 6;
    kok.innerHTML = '<div class="nd">' +
      '<div class="nd-ust"><div class="nd-trim" role="group" aria-label="TRIM"><span>TRIM</span></div>' +
      '<div class="nd-sayac"><span>Fazladan kopyalanan sayfa <b class="nd-kop">0</b></span><span>Boş sayfa <b class="nd-bos">24</b></span></div></div>' +
      '<div class="nd-duzen"><div class="nd-den"><b>Denetleyici</b><span>Mantıksal adres → fiziksel sayfa tablosu</span></div><div class="nd-bloklar"></div></div>' +
      '<div class="nd-lejant"><span><i class="nd-s"></i>Boş</span><span><i class="nd-s v fA">A</i>Geçerli</span><span><i class="nd-s x">✗</i>Geçersiz</span>' +
      '<span><i class="nd-s v fB h">B</i>OS sildi, SSD bilmiyor</span></div>' +
      '<div class="secici nd-adim" role="group" aria-label="Adımlar"></div><div class="panel-sonuc nd-sonuc" aria-live="polite"></div></div>';
    var bloklarEl = kok.querySelector('.nd-bloklar'), sonuc = kok.querySelector('.nd-sonuc');
    var kopEl = kok.querySelector('.nd-kop'), bosEl = kok.querySelector('.nd-bos');
    var bloklar = [], sayfaEl = [];
    for (var b = 0; b < BL; b++) {
      var be = el('div', 'nd-blok', bloklarEl);
      be.innerHTML = '<div class="nd-bb"><b>Blok ' + b + '</b><small>silme: 0</small></div>';
      var sy = el('div', 'nd-sayfalar', be);
      for (var i = 0; i < SY; i++) sayfaEl.push(el('i', 'nd-s', sy));
      bloklar.push(be);
    }
    var P, trim = false, adim = 0, kopya = 0, silme, sonuclar = {}, calis = 0;
    function sifirla() {
      calis++;
      P = sayfaEl.map(function () { return { f: null, d: 'bos', h: false }; });
      silme = [0, 0, 0, 0]; adim = 0; kopya = 0;
      bloklar.forEach(function (x) { x.classList.remove('hedef'); });
      ciz(); dugmeler();
      yaz(trim ? 'TRIM açık. “1 · Yaz” ile başla.' : 'TRIM kapalı. “1 · Yaz” ile başla.', '');
    }
    function ciz() {
      sayfaEl.forEach(function (e, i) {
        var p = P[i];
        e.className = 'nd-s' + (p.d === 'v' ? ' v f' + p.f.charAt(0) : p.d === 'x' ? ' x' : '') + (p.h ? ' h' : '') + (p.yeni ? ' yeni' : '');
        e.textContent = p.d === 'v' ? p.f : p.d === 'x' ? '✗' : '';
        e.setAttribute('aria-label', p.d === 'v' ? 'Geçerli: ' + p.f + (p.h ? ' (silindi, SSD bilmiyor)' : '') : p.d === 'x' ? 'Geçersiz' : 'Boş');
      });
      bloklar.forEach(function (x, j) { x.querySelector('small').textContent = 'silme: ' + silme[j]; });
      kopEl.textContent = kopya;
      bosEl.textContent = P.filter(function (p) { return p.d === 'bos'; }).length;
    }
    function yaz(t, tur) { sonuc.textContent = t; sonuc.className = 'panel-sonuc nd-sonuc' + (tur ? ' ' + tur : ''); }
    function bosSayfa() { for (var i = 0; i < P.length; i++) if (P[i].d === 'bos') return i; return -1; }
    function sirayla(islem, n, id) {
      // islem(k) her sayfa için; animasyonlu
      var k = 0;
      return new Promise(function (coz) {
        (function dongu() {
          if (id !== calis) return;
          if (k >= n) { P.forEach(function (p) { p.yeni = false; }); ciz(); return coz(); }
          islem(k++); ciz();
          if (AZ) dongu(); else setTimeout(dongu, 90);
        })();
      });
    }
    var mesgul = false;
    function calistir(fn) {
      if (mesgul) return;
      mesgul = true; dugmeler();
      var id = calis;
      fn(id).then(function () { if (id !== calis) return; mesgul = false; adim++; dugmeler(); });
    }
    function yazAdim(id) {
      var plan = [];
      ['A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'B', 'C', 'C', 'C', 'C'].forEach(function (f) { plan.push(f); });
      yaz('İşletim sistemi üç dosya yazıyor…', '');
      return sirayla(function (k) { var i = bosSayfa(); P[i] = { f: plan[k], d: 'v', h: false, yeni: true }; }, plan.length, id).then(function () {
        yaz('A, B ve C yazıldı. Denetleyici her sayfanın yerini tabloya işledi.', '');
      });
    }
    function silAdim(id) {
      var idx = [];
      P.forEach(function (p, i) { if (p.f === 'B' && p.d === 'v') idx.push(i); });
      return sirayla(function (k) { var p = P[idx[k]]; if (trim) { p.d = 'x'; p.f = null; } else p.h = true; }, idx.length, id).then(function () {
        yaz(trim ? 'TRIM açık: B’nin sayfaları SSD’ye bildirildi ve geçersiz işaretlendi.' : 'TRIM kapalı: B dosya sisteminde silindi ama SSD bunu bilmiyor; sayfalar hâlâ “geçerli” sanılıyor.', trim ? 'iyi' : 'kotu');
      });
    }
    function guncelleAdim(id) {
      var eski = [];
      P.forEach(function (p, i) { if (p.f === 'A' && p.d === 'v' && eski.length < 3) eski.push(i); });
      return sirayla(function (k) {
        var i = bosSayfa(); P[i] = { f: 'A′', d: 'v', h: false, yeni: true };
        var e = P[eski[k]]; e.d = 'x'; e.f = null;
      }, 3, id).then(function () {
        yaz('Dolu sayfanın üzerine yazılamaz: A’nın yeni hâli (A′) boş sayfalara yazıldı, eski üç sayfa geçersiz oldu.', '');
      });
    }
    function copAdim(id) {
      // Kurban: SSD’nin gözünde en çok geçersiz sayfası olan blok
      var enIyi = -1, enX = -1;
      for (var bb = 0; bb < BL; bb++) {
        var x = 0;
        for (var j = 0; j < SY; j++) if (P[bb * SY + j].d === 'x') x++;
        if (x > enX) { enX = x; enIyi = bb; }
      }
      bloklar[enIyi].classList.add('hedef');
      var gecerli = [];
      for (var k = 0; k < SY; k++) if (P[enIyi * SY + k].d === 'v') gecerli.push(enIyi * SY + k);
      yaz('Çöp toplama: yeni yazmalar için boş blok gerekiyor. Hedef: Blok ' + enIyi + '…', '');
      return bekle(0.9).then(function () {
        return sirayla(function (k) {
          var kay = P[gecerli[k]], i = bosSayfa();
          P[i] = { f: kay.f, d: 'v', h: kay.h, yeni: true };
          kopya++;
        }, gecerli.length, id);
      }).then(function () { return bekle(0.5); }).then(function () {
        if (id !== calis) return;
        for (var j = 0; j < SY; j++) P[enIyi * SY + j] = { f: null, d: 'bos', h: false };
        silme[enIyi]++;
        bloklar[enIyi].classList.remove('hedef');
        ciz();
        var bos = P.filter(function (p) { return p.d === 'bos'; }).length;
        sonuclar[trim ? 'acik' : 'kapali'] = { kopya: kopya, bos: bos };
        var t = trim ? '✓ Blok ' + enIyi + ' tamamen geçersizdi: hiç kopyalamadan silindi. Boş sayfa: ' + bos + '.'
          : 'Blok ' + enIyi + ' içindeki ' + kopya + ' geçerli sayfa önce kopyalandı (fazladan yazma), sonra blok silindi. B’nin eski verisi hâlâ yer kaplıyor. Boş sayfa: ' + bos + '.';
        if (sonuclar.acik && sonuclar.kapali) {
          t += ' Karşılaştır: TRIM kapalı ' + sonuclar.kapali.kopya + ' kopya / ' + sonuclar.kapali.bos + ' boş; açık ' + sonuclar.acik.kopya + ' kopya / ' + sonuclar.acik.bos + ' boş.';
        } else {
          t += ' Şimdi TRIM’i ' + (trim ? 'kapatıp' : 'açıp') + ' aynı adımları tekrarla.';
        }
        yaz(t, trim ? 'iyi' : 'kotu');
      });
    }
    var trimEl = kok.querySelector('.nd-trim');
    var bAcik = DERS.dugme(trimEl, 'Açık', function () { trim = true; basili([bAcik, bKapali], bAcik); sifirla(); });
    var bKapali = DERS.dugme(trimEl, 'Kapalı', function () { trim = false; basili([bAcik, bKapali], bKapali); sifirla(); });
    basili([bAcik, bKapali], bKapali);
    var adimEl = kok.querySelector('.nd-adim');
    var ADIMLAR = [['1 · Yaz', yazAdim], ['2 · B’yi sil', silAdim], ['3 · A’yı güncelle', guncelleAdim], ['4 · Çöp topla', copAdim]];
    var bAdim = ADIMLAR.map(function (a, i) { return DERS.dugme(adimEl, a[0], function () { if (adim === i) calistir(a[1]); }); });
    DERS.dugme(adimEl, 'Baştan', sifirla);
    function dugmeler() { bAdim.forEach(function (b, i) { b.disabled = mesgul || adim !== i; b.setAttribute('aria-pressed', adim === i && !mesgul ? 'true' : 'false'); }); }
    sifirla();
  })();

  /* ─────────── Adım 3: SATA ve NVMe — hatlar ve teorik tavan ─────────── */
  (function () {
    var kok = document.getElementById('arayuz');
    if (!kok) return;
    var AY = [
      { ad: 'SATA III (2,5″)', kisa: 'SATA III', hat: 1, tavan: 0.6, gercek: 0.55, bicim: '25', renk: '#d97706', etiket: 'SATA III · 6 Gb/s · AHCI', hiz: 2.6,
        bas: 'SATA III · 2,5″ SSD', ac: 'Tek hat · 6 Gb/s · 8b/10b kodlama → ≈ 600 MB/s teorik tavan (gerçekte ≈ 550 MB/s). AHCI: 1 kuyruk × 32 komut. Veri ve güç için iki kablo.' },
      { ad: 'M.2 SATA', kisa: 'M.2 SATA', hat: 1, tavan: 0.6, gercek: 0.55, bicim: 'm2', renk: '#d97706', etiket: 'SATA III · 6 Gb/s · AHCI', hiz: 2.6,
        bas: 'M.2 SATA · B+M', ac: 'Kart M.2 ama hat yine SATA: aynı ≈ 600 MB/s tavan ve AHCI. Kablo yok. M.2 görünüşü, hızı belirlemez; protokol belirler.' },
      { ad: 'PCIe 3.0 x4 NVMe', kisa: 'PCIe 3.0 x4', hat: 4, tavan: 3.94, gercek: 3.5, bicim: 'm2', renk: '#4f46e5', etiket: 'PCIe 3.0 · 8 GT/s × 4 · NVMe', hiz: 1.2,
        bas: 'NVMe · PCIe 3.0 x4', ac: '4 hat × 8 GT/s · 128b/130b kodlama → hat başına ≈ 0,98 GB/s, toplam ≈ 3,9 GB/s. NVMe: 65 535’e kadar kuyruk, her birinde 65 536’ya kadar komut.' },
      { ad: 'PCIe 4.0 x4 NVMe', kisa: 'PCIe 4.0 x4', hat: 4, tavan: 7.88, gercek: 7.0, bicim: 'm2', renk: '#7c3aed', etiket: 'PCIe 4.0 · 16 GT/s × 4 · NVMe', hiz: 0.6,
        bas: 'NVMe · PCIe 4.0 x4', ac: '4 hat × 16 GT/s → hat başına ≈ 1,97 GB/s, toplam ≈ 7,9 GB/s. PCIe geriye uyumludur: 4.0 SSD, 3.0 yuvada çalışır ama 3.0 hızında.' }
    ];
    var FF = 'font-family="Inter,Arial,sans-serif"';
    function gbYaz(v) { return v < 1 ? '≈ ' + sayi(v * 1000) + ' MB/s' : '≈ ' + sayi(v, 1) + ' GB/s'; }
    kok.innerHTML = '<div class="ay"><div class="secici ay-sec" role="group" aria-label="Arayüz"></div><div class="ay-sahne"></div>' +
      '<div class="ay-tablo"></div><div class="ay-kart" aria-live="polite"><b></b><span></span></div>' +
      '<div class="ay-not">Teorik tavanlar (kodlama payı düşülmüş). Gerçek sürücüler bunun biraz altında kalır.</div></div>';
    var sahne = kok.querySelector('.ay-sahne'), tablo = kok.querySelector('.ay-tablo'), kart = kok.querySelector('.ay-kart');
    var satirlar = AY.map(function (a) {
      var r = el('div', 'ay-satir', tablo);
      r.innerHTML = '<span class="ay-ad"></span><div class="ay-bar"><i></i><em></em></div><code></code>';
      r.querySelector('.ay-ad').textContent = a.kisa;
      r.querySelector('.ay-bar i').style.width = (a.tavan / 7.88 * 100).toFixed(1) + '%';
      r.querySelector('.ay-bar i').style.background = a.renk;
      r.querySelector('.ay-bar em').style.left = (a.gercek / 7.88 * 100).toFixed(1) + '%';
      r.querySelector('code').textContent = gbYaz(a.tavan);
      return r;
    });
    function svgYap(a) {
      var s = '<svg viewBox="0 0 360 150" role="img" aria-label="' + a.ad + ': ' + a.hat + ' hat, teorik tavan ' + gbYaz(a.tavan) + '">' +
        '<rect width="360" height="150" rx="12" fill="#0f172a"/>';
      // aygıt
      if (a.bicim === '25') {
        s += '<rect x="14" y="30" width="72" height="90" rx="6" fill="#1f2937" stroke="#475569"/><rect x="22" y="44" width="56" height="50" rx="3" fill="#e5e7eb"/>' +
          '<text x="50" y="74" ' + FF + ' font-size="11" font-weight="900" fill="#111827" text-anchor="middle">2,5″ SSD</text>' +
          '<rect x="84" y="62" width="8" height="10" fill="#9ca3af"/><rect x="84" y="80" width="8" height="16" fill="#9ca3af"/>' +
          '<text x="50" y="112" ' + FF + ' font-size="8" font-weight="800" fill="#cbd5e1" text-anchor="middle">veri + güç kablosu</text>';
      } else {
        s += '<rect x="14" y="60" width="78" height="26" rx="3" fill="#1b1d22" stroke="#475569"/><rect x="86" y="62" width="6" height="22" fill="#e3b04f"/>' +
          '<rect x="26" y="65" width="14" height="14" rx="2" fill="#334155"/><rect x="46" y="64" width="16" height="17" rx="2" fill="#111"/><rect x="64" y="64" width="16" height="17" rx="2" fill="#111"/>' +
          '<text x="53" y="104" ' + FF + ' font-size="9" font-weight="900" fill="#e2e8f0" text-anchor="middle">M.2 kart</text>';
      }
      // hedef
      s += '<rect x="268" y="30" width="80" height="90" rx="10" fill="#1e1b4b" stroke="#6366f1"/>' +
        '<text x="308" y="70" ' + FF + ' font-size="10" font-weight="900" fill="#e0e7ff" text-anchor="middle">İşlemci /</text>' +
        '<text x="308" y="84" ' + FF + ' font-size="10" font-weight="900" fill="#e0e7ff" text-anchor="middle">yonga seti</text>';
      var ys = a.hat === 1 ? [75] : [51, 67, 83, 99];
      ys.forEach(function (y) {
        s += '<path d="M96 ' + y + 'H266" stroke="' + a.renk + '" stroke-width="9" stroke-linecap="round" opacity=".28"/>' +
          '<path class="ay-akis" style="animation-duration:' + a.hiz + 's" d="M96 ' + y + 'H266" stroke="' + a.renk + '" stroke-width="5" stroke-dasharray="10 12" stroke-linecap="round"/>';
      });
      s += '<text x="181" y="22" ' + FF + ' font-size="10.5" font-weight="900" fill="#fde68a" text-anchor="middle">' + a.etiket + '</text>' +
        '<text x="181" y="138" ' + FF + ' font-size="10" font-weight="800" fill="#cbd5e1" text-anchor="middle">' + (a.hat === 1 ? '1 hat' : '4 hat (x4)') + ' · teorik ' + gbYaz(a.tavan) + '</text>';
      return s + '</svg>';
    }
    var dg = [];
    function sec(i) {
      var a = AY[i];
      basili(dg, dg[i]);
      satirlar.forEach(function (r, j) { r.classList.toggle('secili', i === j); });
      sahne.innerHTML = svgYap(a);
      kart.firstChild.textContent = a.bas;
      kart.lastChild.textContent = a.ac;
    }
    var secEl = kok.querySelector('.ay-sec');
    AY.forEach(function (a, i) { dg.push(DERS.dugme(secEl, a.kisa, function () { elle = true; sec(i); })); });
    var elle = false;
    sec(0);
    DERS.slaytAcilinca('s7', function () {
      if (AZ || elle) return;
      setTimeout(function () { if (!elle) sec(3); }, 3000);
    });
  })();

  /* ─────────── Adım 4: 3,5″ / 2,5″ / M.2 ve çentikler (A-VURGU) ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.1, 1.45, 1], pay: 0.8 } });
    var hdd = s.ekle('M-HDD', { konum: [-6.8, 0, -1.2] });
    var ssd = s.ekle('M-SSD', { konum: [7.2, 0, -3.0] });
    // M.2 kartlar: konnektör kameraya bakar (z = 9), kart geriye uzanır
    var mM = s.ekle(D.model('M-M2', { anahtar: 'M' }), { konum: [4.6, 0, 9.0], donus: [0, Math.PI / 2, 0] });
    var mB = s.ekle(D.model('M-M2', { anahtar: 'BM', kapasite: '512 GB' }), { konum: [8.4, 0, 9.0], donus: [0, Math.PI / 2, 0] });
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.15, maxPolar: 1.35, minYakin: 0.14, maxYakin: 1.4 } });
    var mesaj = DERS.sahneMesaj(s);
    var genel = [
      s.etiket(hdd, '3,5″ HDD · 101,6 × 147 mm', { ofset: [0, 0.3, 0] }),
      s.etiket(ssd, '2,5″ SATA SSD · 69,85 × 100 mm', { ofset: [0, 0.3, 0] }),
      s.etiket(mM, 'M.2 2280 · 22 × 80 mm', { yer: 'alt', ofset: [1.9, 0, 4.3] })
    ];
    var ek = [], vurgulu = [], cetvel = null, mesgul = false;
    function temizle() {
      ek.forEach(function (e) { e.kaldir(); }); ek = [];
      vurgulu.forEach(function (p) { D.vurguKaldir(p); }); vurgulu = [];
      if (cetvel) cetvel.visible = false;
    }
    function sifirla(sure) {
      temizle();
      genel.forEach(function (e) { e.goster(true); });
      mesaj('');
      var b = s._baslangic;
      return s.kameraGit({ hedef: b.hedef, yakinlik: 1, theta: b.theta, phi: b.phi }, sure == null ? 0.6 : sure);
    }
    function centikler() {
      if (mesgul) return; mesgul = true;
      sifirla(0.3).then(function () {
        genel.forEach(function (e) { e.goster(false); });
        var a = mM.userData.centikler.M.getWorldPosition(new V3()), b = mB.userData.centikler.M.getWorldPosition(new V3());
        return s.kameraGit({ hedef: [(a.x + b.x) / 2 - 0.3, 0, a.z - 0.9], yakinlik: 0.2, theta: 0.05, phi: 0.72 }, AZ ? 0.01 : 1.3);
      }).then(function () {
        [mM, mB].forEach(function (m) { var t = m.getObjectByName('m2-temaslar'); vurgulu.push(t); D.vurgula(t, { etiket: false }); });
        ek.push(s.etiket(mM.userData.centikler.M, 'M', { tur: 'vurgu', yer: 'merkez', ofset: [0, 0.05, 0.25] }));
        ek.push(s.etiket(mB.userData.centikler.M, 'M', { tur: 'vurgu', yer: 'merkez', ofset: [0, 0.05, 0.25] }));
        ek.push(s.etiket(mB.userData.centikler.B, 'B', { tur: 'vurgu', yer: 'merkez', ofset: [0, 0.05, 0.25] }));
        ek.push(s.etiket(mM, 'Tek çentik: M anahtarı', { tur: 'odak', yer: 'merkez', ofset: [0, 0.1, 1.9] }));
        ek.push(s.etiket(mB, 'İki çentik: B+M', { tur: 'odak', yer: 'merkez', ofset: [0, 0.1, 1.9] }));
        mesaj(DERS.tahminNotu(1, 'Isınmadaki kart büyük olasılıkla B+M çentikli bir M.2 SATA’ydı: M yuvasına girer ama yalnız NVMe destekleyen yuvada görünmez.',
          'Isınmadaki kart büyük olasılıkla B+M çentikli bir M.2 SATA’ydı: yuvaya girdi ama yuva yalnız NVMe destekliyordu.'), '');
        mesgul = false;
      });
    }
    function cetvelKur() {
      var g = new THREE.Group(), mat = K.mat('#f8fafc', { roughness: 0.6 }), koyu = K.mat('#0f172a', { roughness: 0.6 });
      K.koy(g, K.kutu(8.0, 0.03, 0.14, mat, 0.01), 4.0, 0.02, 0);
      [0, 4.2, 6.0, 8.0].forEach(function (x) { K.koy(g, K.kutu(0.05, 0.05, 0.42, koyu, 0.01), x, 0.04, 0); });
      var dir = K.mat('altin');
      [4.2, 6.0, 8.0].forEach(function (x) { K.koy(g, K.silindir(0.2, 0.12, dir, 12), x, 0.06, -0.55); });
      g.position.set(0, 0, -2.0);
      secilmezYap(g);
      mM.add(g);
      return g;
    }
    function boylar() {
      if (mesgul) return; mesgul = true;
      sifirla(0.3).then(function () {
        genel.forEach(function (e) { e.goster(false); });
        if (!cetvel) cetvel = cetvelKur();
        cetvel.visible = true;
        var c = mM.localToWorld(new V3(4.0, 0, -1.0));
        return s.kameraGit({ hedef: [c.x, 0, c.z], yakinlik: 0.4, theta: 0.02, phi: 0.5 }, AZ ? 0.01 : 1.3);
      }).then(function () {
        [[4.2, '2242'], [6.0, '2260'], [8.0, '2280']].forEach(function (x) {
          var o = new THREE.Object3D(); o.position.set(x[0], 0.1, -2.6); mM.add(o);
          ek.push(s.etiket(o, x[1], { tur: x[1] === '2280' ? 'vurgu' : '', yer: 'merkez' }));
        });
        var v = mM.userData.vidaYuvasi;
        vurgulu.push(v); D.vurgula(v, { etiket: false });
        ek.push(s.etiket(v, 'Vida yarım ayı: 80 mm', { tur: 'odak', yer: 'merkez', ofset: [0, 0.1, 0.9] }));
        mesaj('Anakartta 42, 60 ve 80 mm’de vida yeri olabilir. Bu kart 80 mm: 2280. Kısa yuvaya uzun kart sığmaz.', '');
        mesgul = false;
      });
    }
    s.dugme('Çentikler', 'oynat', centikler, { yer: 'alt-orta', aciklama: 'M.2 kartların kenar konnektörlerine yakınlaş, çentikleri vurgula' });
    s.dugme('M.2 boyları', 'oynat', boylar, { yer: 'alt-orta', aciklama: '2242, 2260 ve 2280 boylarını ve vida yerlerini göster' });
    s.dugme('Baştan', 'sifirla', function () { if (!mesgul) sifirla(); }, { yer: 'alt-orta', aciklama: 'Sahneyi başa al' });
    s._h04 = { centikler: centikler, boylar: boylar };
  });

  /* ─────────── Adım 5: sıralı ve rastgele okuma (A-KARSILASTIR, 2D) ─────────── */
  (function () {
    var kok = document.getElementById('sirali');
    if (!kok) return;
    var DEG = {
      sirali: { hdd: 200, ssd: 3500, hddT: '≈ 200 MB/s', ssdT: '≈ 3 500 MB/s' },
      rastgele: { hdd: 0.5, ssd: 60, hddT: '≈ 0,5 MB/s · ≈ 120 IOPS', ssdT: '≈ 60 MB/s · ≈ 15 000 IOPS' }
    };
    var CX = 88, CY = 80, R = 66, PX = 182, PY = 150;
    var IZ = [0.42, 0.53, 0.64, 0.75, 0.86, 0.95];
    var svg = '<svg viewBox="0 0 200 160" class="sr-hdd" role="img" aria-label="Üstten sabit disk: plaka döner, kol kafayı izler arasında taşır; okunacak bloklar turuncu, okunanlar yeşil">' +
      '<rect width="200" height="160" rx="10" fill="#f1f5f9"/><circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="#e5e9ef" stroke="#94a3b8" stroke-width="1.5"/>';
    IZ.forEach(function (r) { svg += '<circle cx="' + CX + '" cy="' + CY + '" r="' + (R * r).toFixed(1) + '" fill="none" stroke="#c3cbd5" stroke-width=".8"/>'; });
    svg += '<g class="sr-plaka"></g><circle cx="' + CX + '" cy="' + CY + '" r="' + (R * 0.26) + '" fill="#9aa3ae" stroke="#6b7280"/>' +
      '<g class="sr-kol"><path class="sr-kol-cizgi" stroke="#374151" stroke-width="4.5" stroke-linecap="round" fill="none"/><rect class="sr-kafa" width="7" height="5" rx="1" fill="#111827"/></g>' +
      '<circle cx="' + PX + '" cy="' + PY + '" r="8" fill="#374151"/></svg>';
    kok.innerHTML = '<div class="sr"><div class="sr-ust"><div class="secici sr-kip" role="group" aria-label="Okuma türü"></div><div class="secici sr-oynat"></div></div>' +
      '<div class="sr-iki"><div class="sr-kart"><div class="sr-bas"><b>HDD · 7200 dev/dk</b><span class="sr-sayac" data-d="hdd">0 / 6</span></div>' + svg +
      '<code class="sr-deger" data-d="hdd">—</code></div>' +
      '<div class="sr-kart"><div class="sr-bas"><b>NVMe SSD · 4 kanal</b><span class="sr-sayac" data-d="ssd">0 / 6</span></div><div class="sr-ssd"></div>' +
      '<code class="sr-deger" data-d="ssd">—</code></div></div>' +
      '<div class="sr-tablo"></div><div class="panel-sonuc sr-sonuc" aria-live="polite"></div>' +
      '<div class="sr-not">Yaklaşık değerler · rastgele: 4 KiB, tek kuyruk · animasyon yavaşlatıldı</div></div>';
    var kokSvg = kok.querySelector('.sr-hdd'), plakaG = kok.querySelector('.sr-plaka'), kolCiz = kok.querySelector('.sr-kol-cizgi'), kafa = kok.querySelector('.sr-kafa');
    var ssdEl = kok.querySelector('.sr-ssd'), sonuc = kok.querySelector('.sr-sonuc');
    var hucre = [];      // indeks = kanal × 6 + satır
    for (var c = 0; c < 4; c++) {
      var kolon = el('div', 'sr-kanal', ssdEl);
      el('small', '', kolon, 'Ç' + c);
      for (var r = 0; r < 6; r++) hucre.push(el('i', '', kolon));
    }
    // Log ölçekli karşılaştırma tablosu
    var tablo = kok.querySelector('.sr-tablo');
    var SATIR = [['HDD sıralı', 200, '#64748b'], ['HDD rastgele', 0.5, '#94a3b8'], ['SSD sıralı', 3500, '#4f46e5'], ['SSD rastgele', 60, '#818cf8']];
    var tSatir = SATIR.map(function (x) {
      var rr = el('div', 'sr-satir', tablo);
      rr.innerHTML = '<span></span><div class="sr-bar"><i></i></div><code></code>';
      rr.querySelector('span').textContent = x[0];
      rr.querySelector('i').style.background = x[2];
      rr.dataset.v = x[1];
      return rr;
    });
    var olcek = el('div', 'sr-olcek', tablo);
    ['0,1', '1', '10', '100', '10³', '10⁴ MB/s'].forEach(function (t, i) { var sp = el('span', '', olcek, t); sp.style.left = (i * 20) + '%'; });
    function logG(v) { return Math.max(0, Math.min(1, (Math.log(v) / Math.LN10 + 1) / 5)); }
    function satirGoster(i) {
      var rr = tSatir[i];
      rr.classList.add('gor');
      rr.querySelector('i').style.width = (logG(+rr.dataset.v) * 100).toFixed(1) + '%';
      rr.querySelector('code').textContent = sayi(+rr.dataset.v, +rr.dataset.v < 1 ? 1 : 0) + ' MB/s';
    }

    function kolAci(rOran) {
      // kafa noktası P + L·(cos φ, sin φ) plaka merkezine rOran·R uzaklıkta
      var L = 112, dx = CX - PX, dy = CY - PY, d = Math.sqrt(dx * dx + dy * dy), f0 = Math.atan2(dy, dx);
      var rr = rOran * R, cc = (L * L + d * d - rr * rr) / (2 * L * d);
      return { f: f0 - Math.acos(Math.max(-1, Math.min(1, cc))), L: L };
    }
    var kolF = kolAci(0.64).f, plakaA = 0, bloklar = [], kip = 'sirali', calis = 0, oynuyor = false;
    function kolCiz_() {
      var L = 112, hx = PX + L * Math.cos(kolF), hy = PY + L * Math.sin(kolF);
      kolCiz.setAttribute('d', 'M' + PX + ' ' + PY + 'L' + hx.toFixed(1) + ' ' + hy.toFixed(1));
      kafa.setAttribute('x', (hx - 3.5).toFixed(1)); kafa.setAttribute('y', (hy - 2.5).toFixed(1));
      kafa.setAttribute('transform', 'rotate(' + (kolF * 180 / Math.PI).toFixed(1) + ' ' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ')');
      return { x: hx, y: hy };
    }
    function blokYay(b) {
      var r0 = R * (b.iz - 0.045), r1 = R * (b.iz + 0.045), a0 = b.a - 0.12, a1 = b.a + 0.12;
      function p(r, a) { return (CX + r * Math.cos(a)).toFixed(1) + ' ' + (CY + r * Math.sin(a)).toFixed(1); }
      return 'M' + p(r1, a0) + 'A' + r1.toFixed(1) + ' ' + r1.toFixed(1) + ' 0 0 1 ' + p(r1, a1) + 'L' + p(r0, a1) + 'A' + r0.toFixed(1) + ' ' + r0.toFixed(1) + ' 0 0 0 ' + p(r0, a0) + 'Z';
    }
    function bloklariKur() {
      plakaG.innerHTML = '';
      var kafaN = kolCiz_(), kafaA = Math.atan2(kafaN.y - CY, kafaN.x - CX);
      if (kip === 'sirali') {
        bloklar = [0, 1, 2, 3, 4, 5].map(function (i) { return { iz: 0.64, a: kafaA - 0.35 - i * 0.26 }; });
      } else {
        var RS = [[0.42, 2.2], [0.95, 0.4], [0.53, 4.1], [0.86, 5.6], [0.42, 1.0], [0.75, 3.3]];
        bloklar = RS.map(function (x) { return { iz: x[0], a: x[1] }; });
      }
      bloklar.forEach(function (b, i) {
        b.el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        b.el.setAttribute('d', blokYay(b)); b.el.setAttribute('class', 'sr-blok');
        plakaG.appendChild(b.el);
        b.okundu = false; b.no = i;
      });
      plakaG.setAttribute('transform', 'rotate(' + (plakaA * 180 / Math.PI).toFixed(1) + ' ' + CX + ' ' + CY + ')');
      hucre.forEach(function (h) { h.className = ''; });
      var sira = kip === 'sirali' ? [0, 6, 12, 18, 1, 7] : [13, 2, 22, 7, 17, 9];   // sıralı: kanallara şeritlenir
      sira.forEach(function (k) { hucre[k].className = 'hedef'; });
      return sira;
    }
    function sayac(d, n) { kok.querySelector('.sr-sayac[data-d="' + d + '"]').textContent = n + ' / 6'; }
    function deger(d, t) { kok.querySelector('.sr-deger[data-d="' + d + '"]').textContent = t; }
    var gorulen = {};
    function oynat() {
      if (oynuyor) return;
      oynuyor = true;
      var id = ++calis;
      var sira = bloklariKur();
      sayac('hdd', 0); sayac('ssd', 0); deger('hdd', 'okunuyor…'); deger('ssd', 'okunuyor…');
      sonuc.textContent = '';
      // SSD: sıralı → kanallara paralel; rastgele → tek tek ama hızlı
      var ssdBitti = new Promise(function (coz) {
        var k = 0;
        (function adim() {
          if (id !== calis) return;
          if (k >= sira.length) { deger('ssd', DEG[kip].ssdT); return coz(); }
          var grup = kip === 'sirali' ? 4 : 1;
          for (var g = 0; g < grup && k < sira.length; g++) { hucre[sira[k]].className = 'okundu'; k++; }
          sayac('ssd', k);
          setTimeout(adim, AZ ? 0 : (kip === 'sirali' ? 160 : 150));
        })();
      });
      // HDD: plaka döner (ω), kafa ize gider, blok kafanın altına gelince okunur
      var W = 4.0, sn = 0, hedefI = 0, arama = null;
      var hddBitti = new Promise(function (coz) {
        var son = performance.now();
        (function kare(t) {
          if (id !== calis) return;
          var dt = Math.min(0.05, (t - son) / 1000); son = t;
          if (AZ) dt = 0.05;
          var once = plakaA;
          plakaA += W * dt * (AZ ? 3 : 1);
          plakaG.setAttribute('transform', 'rotate(' + (plakaA * 180 / Math.PI).toFixed(1) + ' ' + CX + ' ' + CY + ')');
          var b = bloklar[hedefI];
          if (b) {
            if (!arama) {
              var hedefF = kolAci(b.iz).f;
              arama = { f0: kolF, f1: hedefF, t: 0, sure: Math.abs(hedefF - kolF) < 0.01 ? 0 : 0.35 };
            }
            if (arama.t < arama.sure) {
              arama.t += dt;
              var e = Math.min(1, arama.t / arama.sure);
              e = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
              kolF = arama.f0 + (arama.f1 - arama.f0) * e;
            } else {
              kolF = arama.f1;
              var kn = kolCiz_(), kafaA = Math.atan2(kn.y - CY, kn.x - CX);
              // blok açısı (dünya) = b.a + plakaA ; bu karede kafa açısını geçtiyse okundu
              var fark = function (x) { var d = (kafaA - (b.a + x)) % (Math.PI * 2); if (d < 0) d += Math.PI * 2; return d; };
              if (fark(plakaA) > fark(once) + 1e-6 || fark(plakaA) < 0.02) {
                b.okundu = true; b.el.setAttribute('class', 'sr-blok okundu');
                hedefI++; arama = null; sayac('hdd', hedefI);
              }
            }
          }
          kolCiz_();
          if (hedefI >= bloklar.length) { deger('hdd', DEG[kip].hddT); return coz(); }
          requestAnimationFrame(kare);
        })(son);
      });
      Promise.all([ssdBitti, hddBitti]).then(function () {
        if (id !== calis) return;
        oynuyor = false;
        gorulen[kip] = true;
        if (kip === 'sirali') { satirGoster(0); satirGoster(2); } else { satirGoster(1); satirGoster(3); }
        if (gorulen.sirali && gorulen.rastgele) {
          sonuc.textContent = 'HDD rastgelede ≈ 400 kat yavaşladı; SSD ≈ 60 kat yavaşladı ama yine HDD’nin rastgele okumasından ≈ 120 kat hızlı.';
        } else if (kip === 'sirali') {
          sonuc.textContent = 'Sıralı okumada kafa yerinde kaldı; bloklar art arda altından geçti. Şimdi “Rastgele”yi dene.';
        } else {
          sonuc.textContent = 'Her blok için kafa ize gitti ve bloğun gelmesini bekledi. Şimdi “Sıralı”yı dene.';
        }
      });
    }
    var bK = [];
    var kipEl = kok.querySelector('.sr-kip');
    bK.push(DERS.dugme(kipEl, 'Sıralı', function () { kip = 'sirali'; basili(bK, bK[0]); calis++; oynuyor = false; bloklariKur(); }));
    bK.push(DERS.dugme(kipEl, 'Rastgele', function () { kip = 'rastgele'; basili(bK, bK[1]); calis++; oynuyor = false; bloklariKur(); }));
    basili(bK, bK[0]);
    DERS.dugme(kok.querySelector('.sr-oynat'), 'Oynat ▶', oynat);
    kolCiz_(); bloklariKur();
    kok._h04 = { oynat: oynat, kip: function (k) { bK[k === 'sirali' ? 0 : 1].click(); }, bitti: function () { return !oynuyor; } };
  })();

  /* ─────────── Adım 6: TBW, SMART, 3-2-1 ─────────── */
  (function () {
    var kok = document.getElementById('dayanik');
    if (!kok) return;
    kok.innerHTML = '<div class="dy"><div class="secici dy-gorunum" role="group" aria-label="Görünüm"></div><div class="dy-ic"></div></div>';
    var ic = kok.querySelector('.dy-ic'), gb = [];
    var TBW = 600;
    function tbwGoster() {
      ic.innerHTML = '<div class="dy-tbw"><div class="dy-kutu"><b>Örnek SSD: 1 TB NVMe</b><span>Dayanım 600 TBW · garanti 5 yıl ya da 600 TB yazma (hangisi önce dolarsa)</span></div>' +
        '<div class="dy-soru">Günde ne kadar veri yazılıyor?</div><div class="secici dy-gun" role="group" aria-label="Günlük yazma"></div>' +
        '<code class="dy-hesap"></code><div class="dy-cizgi"><div class="dy-bar"><i></i><b class="dy-garanti"></b></div><div class="dy-eksen"></div></div><div class="dy-yorum" aria-live="polite"></div></div>';
      var kok2 = ic.firstChild, q = function (x) { return kok2.querySelector(x); };   // görünüm değişse de kendi öğeleri
      var eksen = q('.dy-eksen');
      [0, 10, 20, 30, 40].forEach(function (y) { var sp = el('span', '', eksen, y + ' yıl'); sp.style.left = (y / 40 * 100) + '%'; });
      q('.dy-garanti').style.left = (5 / 40 * 100) + '%';
      var secEl = q('.dy-gun'), bs = [];
      [20, 50, 100, 300].forEach(function (g) {
        var b = DERS.dugme(secEl, g + ' GB', function () { hesap(g, b); });
        bs.push(b);
      });
      function hesap(g, b) {
        basili(bs, b);
        var yil = TBW * 1000 / (g * 365);
        q('.dy-hesap').textContent = '600 000 GB ÷ (' + g + ' GB × 365) ≈ ' + sayi(yil, 1) + ' yıl';
        q('.dy-bar i').style.width = Math.min(100, yil / 40 * 100).toFixed(1) + '%';
        q('.dy-bar i').classList.toggle('uzun', yil > 40);
        q('.dy-yorum').textContent = yil > 10
          ? 'Olağan kullanımda TBW sınırı garanti süresinden çok sonra dolar. Denetleyici yazmaları tüm bloklara yayar (aşınma dengeleme).'
          : 'Çok yoğun yazmada (video kurgusu, sunucu) sınır garanti süresine yaklaşır: daha yüksek TBW’li bir model seçilir, SMART izlenir.';
      }
      hesap(50, bs[1]);
    }
    var RAPOR = {
      ssd: { bas: 'NVMe SSD · 1 TB', durum: ['iyi', '✓ Sağlıklı'], satir: [
        ['Sıcaklık', '41 °C', 1], ['Kullanılan ömür', '%7', 1], ['Kullanılabilir yedek alan', '%100', 1],
        ['Yazılan veri', '42 TB (TBW 600)', 1], ['Ortam ve veri bütünlüğü hataları', '0', 1], ['Açık kalma süresi', '3 150 saat', 1]] },
      hdd: { bas: 'HDD · 2 TB · 7200 dev/dk', durum: ['kotu', '⚠ Dikkat: hemen yedekle, diski değiştir'], satir: [
        ['Sıcaklık', '44 °C', 1], ['Yeniden atanan sektör', '312 (artıyor)', 0], ['Bekleyen sektör', '8', 0],
        ['Düzeltilemeyen hata', '3', 0], ['Açık kalma süresi', '31 400 saat', 1], ['Güç açma sayısı', '2 870', 1]] }
    };
    function smartGoster() {
      ic.innerHTML = '<div class="dy-smart"><div class="secici dy-rapor" role="group" aria-label="Rapor"></div><div class="dy-tablo"></div>' +
        '<div class="dy-karar" aria-live="polite"></div><div class="dy-not">SMART her arızayı önceden haber vermez: sağlıklı görünen disk de aniden bozulabilir.</div></div>';
      var kok2 = ic.firstChild;
      var secEl = kok2.querySelector('.dy-rapor'), bs = [];
      [['ssd', 'SSD raporu'], ['hdd', 'HDD raporu']].forEach(function (x) { var b = DERS.dugme(secEl, x[1], function () { goster(x[0], b); }); bs.push(b); });
      function goster(k, b) {
        basili(bs, b);
        var r = RAPOR[k], t = kok2.querySelector('.dy-tablo');
        t.innerHTML = '<div class="dy-tbas">' + r.bas + '</div>';
        r.satir.forEach(function (x) {
          var s = el('div', 'dy-satir' + (x[2] ? '' : ' kotu'), t);
          s.innerHTML = '<span></span><code></code><b></b>';
          s.firstChild.textContent = x[0]; s.children[1].textContent = x[1]; s.lastChild.textContent = x[2] ? '✓' : '⚠';
        });
        var kr = kok2.querySelector('.dy-karar');
        kr.className = 'dy-karar ' + r.durum[0]; kr.textContent = r.durum[1];
      }
      goster('ssd', bs[0]);
    }
    function yedekGoster() {
      ic.innerHTML = '<div class="dy-321"><div class="dy-rozet"><span><b>3</b> kopya</span><span><b>2</b> farklı ortam</span><span><b>1</b> başka yerde</span></div>' +
        '<div class="dy-kopyalar"></div><div class="secici dy-senaryo" role="group" aria-label="Senaryo"></div><div class="dy-yorum" aria-live="polite"></div></div>';
      var K3 = [['1', 'Asıl kopya', 'Dizüstünün SSD’si', 'Ev'], ['2', 'Yedek', 'Harici disk (farklı ortam)', 'Ev'], ['3', 'Yedek', 'Bulut ya da okul sunucusu', 'Başka yer']];
      var kutu = ic.querySelector('.dy-kopyalar');
      var kk = K3.map(function (x) {
        var d = el('div', 'dy-kopya', kutu);
        d.innerHTML = '<i>' + x[0] + '</i><b></b><span></span><small></small><em>✓</em>';
        d.querySelector('b').textContent = x[1]; d.querySelector('span').textContent = x[2]; d.querySelector('small').textContent = x[3];
        return d;
      });
      var yorum = ic.querySelector('.dy-yorum');
      function durum(kayip, t) {
        kk.forEach(function (d, i) { var yok = kayip.indexOf(i) >= 0; d.classList.toggle('kayip', yok); d.querySelector('em').textContent = yok ? '✗' : '✓'; });
        yorum.textContent = t;
      }
      var secEl = ic.querySelector('.dy-senaryo');
      DERS.dugme(secEl, 'SSD arızası', function () { durum([0], 'SSD bozuldu: harici diskten ve buluttan geri yüklenir. İki yedek, iki şans.'); });
      DERS.dugme(secEl, 'Evde su baskını', function () { durum([0, 1], 'Evdeki iki kopya birlikte gitti; başka yerdeki kopya kurtarır. “1 başka yerde” kuralı bu yüzden var.'); });
      DERS.dugme(secEl, 'Baştan', function () { durum([], 'Bir senaryo seç: hangi kopyalar kalıyor?'); });
      durum([], 'Bir senaryo seç: hangi kopyalar kalıyor?');
    }
    var secEl = kok.querySelector('.dy-gorunum');
    [['TBW', tbwGoster], ['SMART', smartGoster], ['3-2-1', yedekGoster]].forEach(function (x) {
      var b = DERS.dugme(secEl, x[0], function () { basili(gb, b); x[1](); });
      gb.push(b);
    });
    basili(gb, gb[0]); tbwGoster();
  })();

  /* ─────────── Etkinlik 1: disk test sonuçlarını okuma ─────────── */
  (function () {
    var kok = document.getElementById('test-oku');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var HIZ = [
      ['Sıralı okuma', [3450, 550, 210]], ['Sıralı yazma', [3000, 510, 200]],
      ['Rastgele 4K okuma', [62, 45, 0.6]], ['Rastgele 4K yazma', [180, 110, 1.4]]
    ];
    var KAP = ['931,3 GiB', '931,3 GiB', '3 725,3 GiB'];
    var SAGLIK = {
      c: { bas: 'Disk C · sağlık', satir: [['Yeniden atanan sektör', 'geçen hafta 0 → bugün 184', 0], ['Bekleyen sektör', '6', 0], ['Sıcaklık', '43 °C', 1], ['Açık kalma süresi', '26 800 saat', 1]], durum: '⚠ Dikkat' },
      b: { bas: 'Disk B · sağlık', satir: [['Dayanım (TBW)', '360 TB', 1], ['Yazılan veri', '338 TB', 0], ['Kullanılan ömür', '%94', 0], ['Kullanılabilir yedek alan', '%88', 1]], durum: '⚠ Sınıra yakın' }
    };
    var GOREV = [
      { g: 'hiz', vurgu: [2], q: 'Hangisi HDD? Rastgele okumada dönen plaka ne yapar, düşün.', s: ['Disk A', 'Disk B', 'Disk C'], d: 2,
        ac: 'Disk C: rastgele 4K okuma ≈ 0,6 MB/s. Her okuma arama ve dönüş gecikmesi bekliyor; sıralı ≈ 210 MB/s ise HDD için tipik.' },
      { g: 'hiz', vurgu: [0, 1], q: 'Hangi disk SATA III arayüzünün tavanına dayanmış?', s: ['Disk A', 'Disk B', 'Disk C'], d: 1,
        ac: 'Disk B: sıralı okuma 550 MB/s, SATA III’ün ≈ 600 MB/s teorik tavanının hemen altında. Bu bir SATA SSD.' },
      { g: 'hiz', vurgu: [0], q: 'Disk A’nın kutusunda “PCIe 4.0 x4 · 7 000 MB/s” yazıyor ama test 3 450 MB/s gösteriyor. En olası neden?',
        s: ['Takıldığı M.2 yuvası PCIe 3.0 x4 çalışıyor (≈ 3,9 GB/s tavan)', 'SSD bozuk; hemen değiştirilmeli', 'SSD aslında SATA arayüzlü'], d: 0,
        ac: 'PCIe geriye uyumludur: kart çalışır ama yuvanın neslinde. 3 450 MB/s, PCIe 3.0 x4 tavanına yakın; SATA ise 600 MB/s’yi aşamazdı.' },
      { g: 'hiz', vurgu: [2], q: 'İşletim sistemini hangi diske kurarsan açılış en hızlı olur? Hangi satır belirleyici?',
        s: ['Fark etmez: sıralı okumaları yeterince yüksek', 'Disk C: kapasitesi en büyük', 'Disk A: rastgele 4K okuması en yüksek'], d: 2,
        ac: 'Açılış binlerce küçük dosyanın rastgele okunmasıdır. Disk A (62 MB/s) öne çıkar; Disk C (0,6 MB/s) çok yavaş kalır.' },
      { g: 'hiz', vurgu: [4], q: 'Test aracı Disk C’nin kapasitesini 3 725,3 GiB gösteriyor. Kutusunda ne yazar?', s: ['4 TB', '3,7 TB', '4 TiB'], d: 0,
        ac: '4 × 10¹² B ÷ 2³⁰ ≈ 3 725,3 GiB. Üretici ondalık TB, işletim sistemi ikili GiB kullanır (1. hafta).' },
      { g: 'c', q: 'Disk C’de yeniden atanan sektör sayısı bir haftada 0’dan 184’e çıktı. Ne yapmalısın?',
        s: ['Birleştirme (defrag) çalıştırıp kullanmaya devam etmeli', 'Verileri hemen yedekleyip diski değiştirmeyi planlamalı', 'Sayı küçük; bir şey yapmaya gerek yok'], d: 1,
        ac: 'Hızla artan yeniden atanan ve bekleyen sektörler yüzeyin bozulduğunu gösterir. Önce yedek (3-2-1), sonra değişim. Defrag bozuk yüzeyi onarmaz.' },
      { g: 'b', q: 'Disk B’nin raporunda TBW 360 TB, yazılan 338 TB, kullanılan ömür %94. Doğru yorum hangisi?',
        s: ['TBW dolunca disk kendini hemen siler', '“Kullanılan ömür %94” diskin %94’ünün dolu olduğunu gösterir', 'Dayanım sınırına yaklaşıyor: yedeği güncelle, değiştirmeyi planla'], d: 2,
        ac: 'TBW üreticinin güvence verdiği toplam yazmadır; dolunca disk hemen bozulmaz ama hata olasılığı artar ve garanti biter. Kullanılan ömür doluluk değil, aşınmadır.' }
    ];
    kok.innerHTML = '<div class="dt"><div class="dt-tablo"></div><div class="dt-gorev"><span class="dt-no"></span><b></b></div><div class="dt-sec"></div><div class="dt-geri" aria-live="polite"></div></div>';
    var tablo = kok.querySelector('.dt-tablo'), no = kok.querySelector('.dt-no'), soru = kok.querySelector('.dt-gorev b');
    var secK = kok.querySelector('.dt-sec'), geri = kok.querySelector('.dt-geri');
    function logG(v) { return Math.max(0.03, Math.min(1, (Math.log(v) / Math.LN10 + 1) / 4.7)); }
    function hizTablo(vurgu) {
      var h = '<div class="dt-bas"><span>Test (MB/s)</span><span>Disk A</span><span>Disk B</span><span>Disk C</span></div>';
      HIZ.forEach(function (r, i) {
        h += '<div class="dt-satir' + (vurgu && vurgu.indexOf(i) >= 0 ? ' vurgu' : '') + '"><span>' + r[0] + '</span>';
        r[1].forEach(function (v) { h += '<div class="dt-h"><i style="width:' + (logG(v) * 100).toFixed(0) + '%"></i><code>' + sayi(v, v < 10 ? 1 : 0) + '</code></div>'; });
        h += '</div>';
      });
      h += '<div class="dt-satir' + (vurgu && vurgu.indexOf(4) >= 0 ? ' vurgu' : '') + '"><span>Kapasite</span>' + KAP.map(function (k) { return '<div class="dt-h"><code>' + k + '</code></div>'; }).join('') + '</div>';
      tablo.className = 'dt-tablo';
      tablo.innerHTML = h;
    }
    function saglikTablo(k) {
      var r = SAGLIK[k], h = '<div class="dt-sbas"><b>' + r.bas + '</b><span>' + r.durum + '</span></div>';
      r.satir.forEach(function (x) { h += '<div class="dt-ssatir' + (x[2] ? '' : ' kotu') + '"><span>' + x[0] + '</span><code>' + x[1] + '</code><b>' + (x[2] ? '✓' : '⚠') + '</b></div>'; });
      tablo.className = 'dt-tablo saglik';
      tablo.innerHTML = h;
    }
    var i = 0, puan = 0;
    function goster() {
      secK.innerHTML = ''; geri.innerHTML = ''; geri.className = 'dt-geri';
      if (i >= GOREV.length) {
        no.textContent = 'Sonuç';
        soru.textContent = puan + ' / ' + GOREV.length + ' görev ilk denemede doğru';
        hizTablo(null);
        geri.className = 'dt-geri son';
        geri.innerHTML = '<span></span>';
        geri.firstChild.textContent = puan >= 5 ? 'Sıralı–rastgele, arayüz tavanı, kapasite ve sağlık satırlarını doğru yorumluyorsun.' : 'İpucu: önce hangi satırın soruyu yanıtladığını bul; sonra değeri arayüz tavanlarıyla karşılaştır.';
        DERS.dugme(geri, 'Yeniden oyna', function () { i = 0; puan = 0; ilerle(0, GOREV.length); goster(); }, 'dy-ileri');
        if (puan >= 5) DERS.konfeti();
        return;
      }
      var t = GOREV[i], ilk = true;
      if (t.g === 'hiz') hizTablo(null); else saglikTablo(t.g);
      no.textContent = 'Görev ' + (i + 1) + ' / ' + GOREV.length;
      soru.textContent = t.q;
      t.s.forEach(function (m, j) {
        var b = DERS.dugme(secK, m, function () {
          if (j === t.d) {
            secK.querySelectorAll('button').forEach(function (y) { y.disabled = true; });
            b.classList.add('iyi'); D.ses('klik');
            if (ilk) puan++;
            if (t.g === 'hiz') hizTablo(t.vurgu);
            geri.className = 'dt-geri iyi'; geri.innerHTML = '<span></span>';
            geri.firstChild.textContent = '✓ ' + t.ac;
            i++; ilerle(i, GOREV.length);
            DERS.dugme(geri, i < GOREV.length ? 'Sonraki →' : 'Sonuç →', goster, 'dy-ileri');
          } else {
            ilk = false; b.classList.add('kotu'); b.disabled = true; D.ses('hata');
            geri.className = 'dt-geri kotu'; geri.innerHTML = '<span></span>';
            geri.firstChild.textContent = '✗ Bu seçenek tabloyla uyuşmuyor. İlgili satıra tekrar bak.';
          }
        }, 'dt-secenek');
      });
    }
    goster();
    kok._h04 = { dogru: function () { return GOREV[i] ? GOREV[i].d : -1; } };
  })();

  /* ─────────── Etkinlik 2: M.2 uyum denetimi (E-DONDUR, 3D) ─────────── */
  (function () {
    var kok = document.getElementById('m2-uyum');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var SEC = ['Takılır, tam hızında çalışır', 'Takılır ama daha düşük hızda çalışır', 'Takılır ama tanınmaz', 'Fiziksel olarak takılmaz'];
    var GOREV = [
      { kart: 'M', ssd: 'M.2 2280 NVMe · PCIe 4.0 x4', yuva: 'M anahtarı · PCIe 4.0 x4 (NVMe) · 2280', key: 'M', d: 0,
        durum: 'UEFI: NVMe SSD tanındı · bağlantı PCIe 4.0 x4', ac: 'Çentik anahtara denk, protokol ve nesil aynı: SSD kendi tam hızında (≈ 7,9 GB/s tavan) çalışır.' },
      { kart: 'BM', ssd: 'M.2 2280 SATA SSD', yuva: 'M anahtarı · yalnız PCIe (NVMe) · 2280', key: 'M', d: 2,
        durum: 'UEFI: M.2 yuvasında aygıt yok', ac: 'B+M kartın M çentiği yuvaya uyar, kart oturur. Ama yuva SATA sinyali taşımıyor: disk görünmez. Isınmadaki durum buydu.' },
      { kart: 'M', ssd: 'M.2 2280 NVMe · PCIe 3.0 x4', yuva: 'B anahtarı · SATA (eski bir dizüstü)', key: 'B', d: 3,
        durum: 'Kart yuvaya girmedi', ac: 'Kartta yalnız M çentiği var; yuvadaki B anahtarı kartın temas bölgesine çarpar. Zorlanırsa kart ya da yuva kırılır.' },
      { kart: 'M', ssd: 'M.2 2280 NVMe · PCIe 4.0 x4', yuva: 'M anahtarı · PCIe 3.0 x4 (NVMe) · 2280', key: 'M', d: 1,
        durum: 'UEFI: NVMe SSD tanındı · bağlantı PCIe 3.0 x4', ac: 'PCIe geriye uyumludur: SSD çalışır ama yuvanın neslinde; tavan ≈ 7,9 GB/s yerine ≈ 3,9 GB/s olur.' },
      { kart: 'BM', ssd: 'M.2 2280 SATA SSD', yuva: 'M anahtarı · SATA ve PCIe (NVMe) · 2280', key: 'M', d: 0,
        durum: 'UEFI: SATA SSD tanındı · SATA III', ac: 'Yuva iki protokolü de destekliyor: SSD kendi tam hızında çalışır, yani SATA’nın ≈ 600 MB/s tavanında.' }
    ];
    var ssdB = kok.querySelector('.mu-ssd b'), yuvaB = kok.querySelector('.mu-yuva b'), noEl = kok.querySelector('.mu-no');
    var gorevB = kok.querySelector('.mu-gorev b'), secK = kok.querySelector('.mu-sec'), geri = kok.querySelector('.mu-geri');
    var sahne = null;          // 3D sahne API’si (hazır olunca)
    var i = 0, puan = 0, mesgul = false;
    function goster() {
      secK.innerHTML = ''; geri.innerHTML = ''; geri.className = 'mu-geri';
      if (i >= GOREV.length) {
        noEl.textContent = 'Sonuç';
        gorevB.textContent = puan + ' / ' + GOREV.length + ' görev ilk denemede doğru';
        geri.className = 'mu-geri son'; geri.innerHTML = '<span></span>';
        geri.firstChild.textContent = puan >= 4 ? 'Sırayı doğru uyguluyorsun: çentik → protokol → PCIe nesli.' : 'İpucu: önce çentik, sonra SATA / NVMe desteği, en son PCIe nesli.';
        DERS.dugme(geri, 'Yeniden oyna', function () { i = 0; puan = 0; ilerle(0, GOREV.length); goster(); }, 'dy-ileri');
        if (puan >= 4) DERS.konfeti();
        if (sahne) sahne.kur(GOREV[0], true);
        return;
      }
      var t = GOREV[i], ilk = true;
      noEl.textContent = 'Görev ' + (i + 1) + ' / ' + GOREV.length;
      gorevB.textContent = 'Kartın çentiklerini incele. Sonuç ne olur?';
      ssdB.textContent = t.ssd; yuvaB.textContent = t.yuva;
      if (sahne) sahne.kur(t);
      SEC.forEach(function (m, j) {
        var b = DERS.dugme(secK, m, function () {
          if (mesgul) return;
          if (j === t.d) {
            secK.querySelectorAll('button').forEach(function (y) { y.disabled = true; });
            b.classList.add('iyi'); D.ses('klik');
            if (ilk) puan++;
            geri.className = 'mu-geri iyi'; geri.innerHTML = '<span></span>';
            geri.firstChild.textContent = '✓ ' + t.ac;
            mesgul = true;
            var z = sahne ? sahne.tak(t) : Promise.resolve();
            z.then(function () {
              mesgul = false;
              i++; ilerle(i, GOREV.length);
              DERS.dugme(geri, i < GOREV.length ? 'Sonraki →' : 'Sonuç →', goster, 'dy-ileri');
            });
          } else {
            ilk = false; b.classList.add('kotu'); b.disabled = true; D.ses('hata');
            geri.className = 'mu-geri kotu'; geri.innerHTML = '<span></span>';
            geri.firstChild.textContent = j === 3 || t.d === 3 ? '✗ Önce çentiğe bak: kartın çentiği yuvadaki anahtarın yerine denk geliyor mu?' : '✗ Çentik uyuyor; şimdi yuvanın desteklediği protokole ve PCIe nesline bak.';
          }
        }, 'mu-secenek');
      });
    }

    D.tembel('#m2-3d', function (kap) {
      var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-1, 1.35, 0.3], pay: 0.6, hedefOfset: [0, 0, -1.0] } });
      var duzen = new THREE.Group();
      duzen.rotation.y = -Math.PI / 2;                     // kart kameraya doğru uzanır, yuva arkada
      var kM = D.model('M-M2', { anahtar: 'M' }), kB = D.model('M-M2', { anahtar: 'BM', kapasite: '512 GB' });
      duzen.add(kM, kB);
      // Anakart parçası + M.2 yuvası + vida direği (derse özel basit geometri)
      var pcb = K.kutu(11.2, 0.1, 4.2, K.mat('pcb'), 0.05);
      K.koy(duzen, pcb, 4.2, -0.2, 0);
      var yuva = new THREE.Group(), siyah = K.mat('plastikSiyah');
      K.koy(yuva, K.kutu(0.75, 0.12, 2.5, siyah, 0.02), -0.2, -0.09, 0);      // alt dudak
      K.koy(yuva, K.kutu(0.62, 0.2, 2.5, siyah, 0.03), -0.26, 0.2, 0);        // üst dudak
      K.koy(yuva, K.kutu(0.18, 0.44, 2.5, siyah, 0.03), -0.5, 0.07, 0);       // arka duvar
      [-1, 1].forEach(function (y) { K.koy(yuva, K.kutu(0.75, 0.44, 0.14, siyah, 0.03), -0.2, 0.07, y * 1.2); });
      var zM = kM.userData.centikler.M.position.z, zB = kB.userData.centikler.B.position.z;
      var anahtar = {}, isaret = {};
      [['M', zM], ['B', zB]].forEach(function (x) {
        var m = K.kutu(0.2, 0.1, 0.1, K.mat('#4b5563', { roughness: 0.5 }), 0.015);
        K.koy(yuva, m, 0.22, 0.03, x[1]);
        anahtar[x[0]] = m;
        var o = new THREE.Object3D(); o.position.set(0.3, 0.04, x[1]); yuva.add(o); isaret[x[0]] = o;
      });
      duzen.add(yuva);
      K.koy(duzen, K.silindir(0.2, 0.15, K.mat('altin'), 12), 8.0, -0.08, 0);
      secilmezYap(yuva);
      s.ekle(duzen);
      var DISARI = 1.8;
      kM.position.x = DISARI; kB.position.x = DISARI;
      s.yerlestir();
      D.dondur(s, { ipucu: 'Sürükle: döndür · tekerlek: yakınlaş', sinir: { minPolar: 0.15, maxPolar: 1.4, minYakin: 0.18, maxYakin: 1.4 } });
      var mesaj = DERS.sahneMesaj(s);
      var etYuva = s.etiket(yuva, 'Yuva', { tur: 'odak', ofset: [0, 0.3, 0] });
      var hiza = null, kart = kM, etC = [];
      function kur(t, sessiz) {
        if (hiza) { hiza.kaldir(); hiza = null; }
        etC.forEach(function (e) { e.kaldir(); }); etC = [];
        kart = t.kart === 'M' ? kM : kB;
        kM.visible = kart === kM; kB.visible = kart === kB;
        kM.position.x = DISARI; kB.position.x = DISARI;
        anahtar.M.visible = t.key === 'M'; anahtar.B.visible = t.key === 'B';
        etYuva.metin('Yuva: ' + (t.key === 'M' ? 'M' : 'B') + ' anahtarı');
        if (!sessiz) mesaj('Kartı döndür ve çentikleri say. Yuvadaki gri çıkıntı anahtardır.', '');
      }
      function yakinlas() {
        var c = isaret.M.getWorldPosition(new V3());
        return s.kameraGit({ hedef: [c.x * 0.3, 0, c.z + 0.9], yakinlik: 0.4, theta: s._baslangic.theta, phi: 0.72 }, AZ ? 0.01 : 0.9);
      }
      function tak(t) {
        var uyar = t.key === 'M';                       // görevlerde kartta daima M çentiği var
        hiza = D.hiza(s, kart.userData.centikler.M, isaret[t.key], { kalinlik: 0.025, esik: 0.05,
          yanlisMetin: '✗ Çentik anahtara denk gelmiyor', dogruMetin: '✓ Çentik anahtara denk geldi' });
        return yakinlas().then(function () {
          return D.git(kart, new V3(uyar ? 0 : 0.36, 0, 0), AZ ? 0.01 : 1.1);
        }).then(function () {
          if (!uyar) return D.git(kart, new V3(0.75, 0, 0), AZ ? 0.01 : 0.35).then(function () { mesaj('✗ ' + t.durum, 'yanlis'); });
          if (t.d === 2) { mesaj('Kart oturdu · ✗ ' + t.durum, 'yanlis'); return null; }
          mesaj('✓ ' + t.durum, 'dogru');
          return null;
        }).then(function () { return D.bekle(AZ ? 0.05 : 0.6, s); });
      }
      s.dugme('Çentiğe yakınlaş', 'oynat', function () { yakinlas(); }, { yer: 'alt-orta', aciklama: 'Kartın kenar konnektörüne ve yuvaya yakınlaş' });
      s.dugme('Tüm görünüm', 'sifirla', function () { s.sifirla(); }, { yer: 'alt-orta', aciklama: 'Görünümü başa al' });
      sahne = { kur: kur, tak: tak, s: s };
      kur(GOREV[Math.min(i, GOREV.length - 1)]);
      s._h04 = sahne;
    });
    goster();
  })();
})();
