/* DON-201 H11 — Atölye 2: Disk Sök–Tak, Toplama ve İlk Açılış · ders betiği (ortak betikten sonra çalışır)
   3D provalar: açık kasa (M-MASAUSTU-ACIK) + derse özel disk kızağı + M-HDD + M-KABLO-SATA (veri ve güç uçları).
   2D: öğretmen onayı kontrol listesi, A-BOOT açılış provası, Derinleş BIOS ekranı (marka-nötr). */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var THREE = window.THREE, V3 = THREE.Vector3, K = D.kit;
  DERS.tahminKur('Tahminini aldık. Adım 3’teki provada birlikte göreceğiz.');

  var VERI_RENK = '#0ea5e9', GUC_RENK = '#f59e0b';

  /* ─────────── Kontrol listeleri (hazırlık güvenliği, Adım 5 öğretmen onayı) ─────────── */
  function kontrolListesi(kokId, ops) {
    var kok = document.getElementById(kokId);
    if (!kok) return;
    var maddeler = Array.prototype.slice.call(kok.querySelectorAll('.gk-madde'));
    var sonuc = kok.querySelector('.gk-sonuc');
    var onay = kok.querySelector('.gk-ogretmen');
    function guncelle() {
      var n = 0, ogrenci = 0;
      maddeler.forEach(function (m) {
        var acik = m.getAttribute('aria-pressed') === 'true';
        if (acik) { n++; if (m !== onay) ogrenci++; }
        if (m.dataset.gk) { var g = kok.querySelector('#' + m.dataset.gk); if (g) g.classList.toggle('tamam', acik); }
      });
      if (onay) {
        var hazir = ogrenci === maddeler.length - 1;
        onay.disabled = !hazir;
        if (!hazir && onay.getAttribute('aria-pressed') === 'true') { onay.setAttribute('aria-pressed', 'false'); n--; var go = kok.querySelector('#' + onay.dataset.gk); if (go) go.classList.remove('tamam'); }
      }
      var tamam = n === maddeler.length;
      sonuc.classList.toggle('hazir', tamam);
      sonuc.textContent = tamam ? '✔ ' + ops.hazir : (onay && ogrenci === maddeler.length - 1 ? ops.ogretmen : ops.bekle + ' (' + n + ' / ' + maddeler.length + ')');
      if (ops.degisti) ops.degisti(tamam);
    }
    maddeler.forEach(function (m) {
      m.setAttribute('aria-pressed', 'false');
      m.addEventListener('click', function () { m.setAttribute('aria-pressed', m.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); guncelle(); });
    });
    guncelle();
  }
  kontrolListesi('guvenlik-kontrol', { hazir: 'Hazırsın! Adım 1’e geçebilirsin.', bekle: 'Üç maddeyi işaretle' });
  kontrolListesi('onay-kontrol', {
    hazir: 'Onay tamam. Fişi öğretmenin takar; açılışa geç.', bekle: 'Önce üç maddeyi kontrol et',
    ogretmen: 'Şimdi öğretmenini çağır: onayı o işaretler.',
    degisti: function (tamam) {
      var r = document.getElementById('onay-rozet');
      if (!r) return;
      r.classList.toggle('fis-rozet--onay', tamam);
      r.querySelector('.rozet-yazi').textContent = tamam ? 'Onaylandı · fişi öğretmen takar' : 'Fiş çekili';
    }
  });

  /* ─────────── Prova oynatıcı: altyazılı adımlar, Oynat/Tekrarla, Adım adım (H10 ile aynı) ─────────── */
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

  function kaldirHepsi(liste) { liste.forEach(function (e) { e.kaldir(); }); liste.length = 0; }
  function dunya(o) { o.updateWorldMatrix(true, false); return o.getWorldPosition(new V3()); }

  /* ─────────── Derse özel sahne: açık kasa + disk kızağı + disk + SATA kabloları ───────────
     Kasa yereli = dünya (kasa orijinde). Disk uzun kenarı Z boyunca, konnektörler arkaya (−Z) bakar;
     vida delikleri açık yana (−X) bakar. Kızak güç kaynağı örtüsünün (üst yüzü y = 11,4) üstünde, önde. */
  var KX = -2.5, KZ = 12.4, TABAN = 11.4, DISK_Y = TABAN + 0.2;
  var HDD0 = new V3(KX, DISK_Y, KZ);

  function kizakYap() {
    var g = new THREE.Group();
    K.parca(g, 'disk-kizagi', 'Disk kızağı', 'Diskin oturduğu metal yuva. Disk yanlarından vidalanır.');
    var celik = K.mat('#a3aab3', { roughness: 0.4, metalness: 0.7 });
    var ic = 5.08 + 0.18;
    K.koy(g, K.kutu(11.0, 0.2, 13.6, celik, 0.05), 0, 0.1, 0.8);
    [-1, 1].forEach(function (yan) {
      K.koy(g, K.kutu(0.14, 4.4, 13.6, celik, 0.04), yan * ic, 2.2, 0.8);
      K.koy(g, K.kutu(0.9, 0.14, 13.6, celik, 0.04), yan * (ic - 0.38), 4.33, 0.8);
    });
    K.koy(g, K.kutu(11.0, 1.2, 0.14, celik, 0.04), 0, 0.7, 7.55);
    // açık yandaki vida yarıkları (koyu)
    var yarik = K.mat('#15171b', { roughness: 0.8 });
    [4.45, -2.85, 1.35].forEach(function (z) { K.koy(g, K.kutu(0.03, 0.5, 1.3, yarik, 0.02), -ic - 0.075, 0.95, z); });
    return g;
  }

  function vidaYap(i) {
    var v = new THREE.Group();
    var bas = K.silindir(0.3, 0.16, 'celik', 18);
    bas.rotation.z = Math.PI / 2; bas.position.x = -0.08;
    v.add(bas);
    var govde = K.silindir(0.13, 0.55, 'celik', 8);
    govde.rotation.z = Math.PI / 2; govde.position.x = 0.27;
    v.add(govde);
    var oyuk = K.mat('#2b2e33');
    K.koy(v, K.kutu(0.02, 0.34, 0.07, oyuk), -0.165, 0, 0);
    K.koy(v, K.kutu(0.02, 0.07, 0.34, oyuk), -0.165, 0, 0);
    K.parca(v, 'disk-vida-' + (i + 1), 'Disk vidası', 'Diski kızağa sabitler. Saat yönünün tersine çevrilerek sökülür.');
    return v;
  }

  function kasaKur(s) {
    var kasa = s.ekle('M-MASAUSTU-ACIK', { modelOps: { kapakAcik: true } });
    var eskiSsd = kasa.getObjectByName('depolama');
    if (eskiSsd) eskiSsd.visible = false;
    var kizak = kizakYap();
    kizak.position.set(KX, TABAN, KZ);
    kasa.add(kizak);
    var hdd = D.model('M-HDD');
    hdd.rotation.y = -Math.PI / 2;
    hdd.position.copy(HDD0);
    kasa.add(hdd);
    kasa.updateWorldMatrix(true, true);
    // Vidalar: açık yana (−X) bakan iki delikte
    var delikler = hdd.userData.vidaDelikleri.filter(function (d) { return d.userData.yon > 0; });
    var vidalar = [delikler[0], delikler[2]].map(function (d, i) {
      var p = kasa.worldToLocal(dunya(d));
      var v = vidaYap(i);
      v.position.set(KX - 5.08 - 0.32, p.y, p.z);
      v.userData.yuva = v.position.clone();
      kasa.add(v);
      return v;
    });
    // Anakarttaki SATA girişleri (dik, açık yana bakar)
    var kartSata = [15.6, 14.3].map(function (y, i) {
      var p = D.sataKonnektor(K, 'veri', { ayna: true });
      p.rotation.y = -Math.PI / 2;
      p.position.set(9.4, y, 3.0);
      K.parca(p, 'anakart-sata-' + (i + 1), 'Anakarttaki SATA ' + (i + 1) + ' girişi', 'Veri kablosunun öbür ucu anakarttaki bu girişe takılır.');
      kasa.add(p);
      return p;
    });
    // Güç kablolarının örtüden çıktığı lastik delik
    var gromet = new THREE.Group();
    K.parca(gromet, 'kablo-deligi', 'Kablo deliği', 'Güç kaynağından gelen kablolar örtüdeki bu delikten çıkar.');
    var halka = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.2, 8, 22), K.mat('kaucuk'));
    halka.rotation.x = Math.PI / 2;
    gromet.add(halka);
    K.koy(gromet, K.silindir(0.62, 0.05, K.mat('#050506'), 18), 0, -0.02, 0);
    gromet.position.set(-6.2, TABAN + 0.05, 0.6);
    kasa.add(gromet);
    // Kablolar
    var veriA = D.model('M-KABLO-SATA', { tur: 'veri' });
    var veriB = D.model('M-KABLO-SATA', { tur: 'veri', kabloYok: true });
    K.parca(veriB, 'sata-veri-anakart-ucu', 'Veri kablosunun anakart ucu', 'Veri kablosunun öbür ucu anakarttaki SATA girişine takılıdır.');
    var guc = D.model('M-KABLO-SATA', { tur: 'guc', tel: 4 });
    kasa.add(veriA, veriB, guc);
    var agV = D.sataAgiz(hdd.userData.sataVeri), agG = D.sataAgiz(hdd.userData.sataGuc), agK = D.sataAgiz(kartSata[0]);
    function takili(f, ag) { D.fisKonumla(f, ag, -f.userData.giris * 0.9); }
    takili(veriB, agK); takili(veriA, agV); takili(guc, agG);
    veriA.userData.kabloBagla(veriB.userData.cikis, { ara: [[1.6, 13.2, 1.2]] });
    guc.userData.kabloBagla(dunya(gromet), { yon: [0, 1, 0], uzun: 1.2 });
    return { kasa: kasa, kizak: kizak, hdd: hdd, vidalar: vidalar, kartSata: kartSata, gromet: gromet,
      veriA: veriA, veriB: veriB, guc: guc, agV: agV, agG: agG, agK: agK, takili: takili };
  }

  /** Fişi porta göre hedef duruma (uzaklık, ters) yumuşakça götürür. */
  function yaklas(fis, ag, u, ters, sure, ease) {
    var p0 = fis.position.clone(), q0 = fis.quaternion.clone();
    D.fisKonumla(fis, ag, u, ters ? Math.PI : 0);
    var p1 = fis.position.clone(), q1 = fis.quaternion.clone();
    fis.position.copy(p0); fis.quaternion.copy(q0);
    return D.tween({ sahne: D.sahneBul(fis), sure: sure == null ? 0.8 : sure, ease: ease, anahtar: 'yaklas', hedef: fis, guncelle: function (e) {
      fis.position.lerpVectors(p0, p1, e);
      fis.quaternion.slerpQuaternions(q0, q1, e);
    } });
  }

  /** Kamera odağını bir bölgeye alır ve bunu açılış (Sıfırla) görünümü yapar. */
  function odak(s, merkez, r, yon) {
    s._merkez.copy(merkez);
    s._r = r;
    if (yon) s.ops.kamera = Object.assign({}, s.ops.kamera, { yon: yon });
    s.kameraSigdir();
  }
  function bak(s, hedef, yakinlik, sure) {
    return s.kameraGit({ hedef: [hedef.x, hedef.y, hedef.z], yakinlik: yakinlik }, sure == null ? 0.9 : sure);
  }
  function gorunumKaydet(s) { return { theta: s.orb.theta, phi: s.orb.phi, yakinlik: s.orb.yakinlik, hedef: s.orb.hedef.clone() }; }
  var DISK_UCU = new V3(-2.0, 12.9, 5.6);
  var YON = [-0.78, 0.52, -0.5];
  var SINIR = { minPolar: 0.55, maxPolar: 1.4, minYakin: 0.35, maxYakin: 1.7, yatay: 0.75 };

  function vurguEtiket(s, nesne, metin, tur, ops) {
    ops = ops || {};
    return s.etiket(nesne, metin, { tur: tur, yer: ops.yer, ofset: ops.ofset });
  }
  function kabloNoktalari(fis, n) {
    var egri = fis.userData.kablo.userData.egri;
    fis.updateWorldMatrix(true, false);
    return egri.getSpacedPoints(n || 28).map(function (p) { return fis.localToWorld(p.clone()); });
  }

  /* ─────────── Kapak: HDD ve SSD, iki kablosu takılı; yavaş döner ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { arkaPlan: 'seffaf', etiket: kap.getAttribute('aria-label'), kamera: { yon: [-0.95, 0.66, 0.62], pay: 0.86 }, turSuresi: 16 });
    var hdd = s.ekle('M-HDD', { konum: [-3, 0, -1.5], donus: [0, -0.35, 0] });
    var ssd = s.ekle('M-SSD', { konum: [10.5, 0, 5], donus: [0, -0.75, 0] });
    function tak(disk, tur, kablo) {
      var u = D.model('M-KABLO-SATA', { tur: tur, tel: 4, kablo: kablo });
      s.kok.add(u);
      s.kok.updateWorldMatrix(true, true);
      D.fisKonumla(u, D.sataAgiz(tur === 'veri' ? disk.userData.sataVeri : disk.userData.sataGuc), -u.userData.giris * 0.9);
      u.userData.kabloCiz();
    }
    tak(hdd, 'veri', [[0, -0.1, 3.4], [-1.2, -0.28, 6.5], [-3.5, -0.3, 9.5]]);
    tak(hdd, 'guc', [[0, -0.05, 3.2], [1.6, -0.25, 6.2], [4.2, -0.28, 8.6]]);
    tak(ssd, 'veri', [[0, -0.2, 3.2], [-1.5, -0.2, 5.8], [-3.2, -0.22, 8.2]]);
    tak(ssd, 'guc', [[0, -0.2, 3.0], [1.4, -0.22, 5.4], [3.4, -0.24, 7.4]]);
    s.yerlestir();
  });

  /* ─────────── Adım 1: diski ve kablolarını bul (A-VURGU: renk + yazı, A-AKIS) ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-1, 0.42, 0.42], pay: 0.88 } });
    var k = kasaKur(s);
    s.yerlestir();
    D.dondur(s, { ipucu: false });
    D.bilgi(s, ['M-HDD', 'sata-veri-ucu', 'sata-guc-ucu', 'disk-kizagi', 'anakart-sata-1', 'sata-veri-anakart-ucu', 'kablo-deligi']);
    var gorunum0 = null, etiketler = [];
    var yakin = { theta: Math.atan2(YON[0], YON[2]), phi: Math.acos(YON[1] / Math.hypot(YON[0], YON[1], YON[2])) };
    function sifirla() {
      kaldirHepsi(etiketler);
      [k.hdd, k.veriA, k.veriB, k.guc].forEach(function (o) { D.vurguKaldir(o, 0); });
      if (!gorunum0) gorunum0 = gorunumKaydet(s); else s.kameraGit(gorunum0, 0.5);
    }
    prova(s, [
      { metin: 'Disk, kasanın önündeki kızakta durur.', calis: function () {
        return s.kameraGit({ theta: yakin.theta, phi: yakin.phi, yakinlik: 0.42, hedef: [-2.2, 13.2, 8.5] }, 1.2).then(function () {
          return D.vurgula(k.hdd, { etiket: false });
        }).then(function () {
          etiketler.push(vurguEtiket(s, k.hdd, 'Disk (HDD) · kızakta', 'vurgu'));
          return D.bekle(1.3, s);
        }).then(function () { kaldirHepsi(etiketler); return D.vurguKaldir(k.hdd); });
      } },
      { metin: 'İnce, yassı kablo: SATA veri kablosu. Ucu dar, 7 pin.', calis: function () {
        return bak(s, new V3(-0.6, 12.8, 4.2), 0.3, 0.9).then(function () {
          return Promise.all([D.vurgula(k.veriA, { renk: VERI_RENK, etiket: false, hat: false }), D.vurgula(k.veriB, { renk: VERI_RENK, etiket: false, hat: false })]);
        }).then(function () {
          etiketler.push(vurguEtiket(s, k.veriA.userData.govde, 'VERİ · dar uç · 7 pin', 'veri'));
          return D.bekle(1.4, s);
        });
      } },
      { metin: 'Renkli telli, geniş uçlu kablo: SATA güç kablosu. 15 pin.', calis: function () {
        return D.vurgula(k.guc, { renk: GUC_RENK, etiket: false, hat: false }).then(function () {
          etiketler.push(vurguEtiket(s, k.guc.userData.govde, 'GÜÇ · geniş uç · 15 pin', 'guc', { yer: 'alt' }));
          return D.bekle(1.4, s);
        });
      } },
      { metin: 'Veri kablosu anakarta gider; güç kablosu güç kaynağından gelir.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit({ theta: Math.atan2(-1, 0.3), phi: 1.28, yakinlik: 0.5, hedef: [2.2, 13.8, 3.6] }, 1.1).then(function () {
          etiketler.push(vurguEtiket(s, k.kartSata[0], 'VERİ → anakarta', 'veri', { ofset: [0, 0.4, 0] }));
          etiketler.push(vurguEtiket(s, k.gromet, 'GÜÇ ← güç kaynağından', 'guc', { yer: 'alt' }));
          return Promise.all([
            D.akis(s, kabloNoktalari(k.veriA), { renk: VERI_RENK, hiz: 9, parcacik: 10, boyut: 4, basBoyut: 0.35, izKalinlik: 0.16 }),
            D.akis(s, kabloNoktalari(k.guc).reverse(), { renk: GUC_RENK, hiz: 7, parcacik: 10, boyut: 4, basBoyut: 0.35, izKalinlik: 0.16 })
          ]);
        }).then(function () { return D.bekle(0.8, s); });
      } }
    ], { sifirla: sifirla });
  });

  /* ─────────── Yakın plan sahnesi (Adım 2, 3, 4 ve etkinlik) ─────────── */
  function yakinSahne(kap, ops) {
    ops = ops || {};
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: YON, pay: 0.9 } });
    var k = kasaKur(s);
    s.yerlestir();
    odak(s, ops.merkez || DISK_UCU, ops.r || 8.5, ops.yon || YON);
    D.dondur(s, { ipucu: false, sinir: Object.assign({}, SINIR, ops.sinir || {}) });
    return { s: s, k: k };
  }
  var PARK_V = new V3(4.6, 13.6, 2.6), PARK_G = new V3(5.4, 12.4, 0.0);
  var DISK_ARKA = HDD0.clone().add(new V3(0, 0, -4.2)), DISK_UST = DISK_ARKA.clone().add(new V3(0, 2.3, 0)), DISK_DIS = DISK_UST.clone().add(new V3(-4.2, 0.6, 0));

  /* ─────────── Adım 2: diski sök ─────────── */
  D.tembel('#s6-3d', function (kap) {
    var a = yakinSahne(kap), s = a.s, k = a.k;
    var gorunum0 = null, etiketler = [];
    function sifirla() {
      kaldirHepsi(etiketler);
      [k.veriA, k.guc].concat(k.vidalar).forEach(function (o) { D.vurguKaldir(o, 0); });
      k.hdd.position.copy(HDD0);
      k.vidalar.forEach(function (v) { v.position.copy(v.userData.yuva); v.rotation.set(0, 0, 0); v.visible = true; });
      k.veriA.userData.mandalBas(false, 0.01);
      k.takili(k.veriA, k.agV); k.takili(k.guc, k.agG);
      if (!gorunum0) gorunum0 = gorunumKaydet(s); else s.kameraGit(gorunum0, 0.5);
    }
    prova(s, [
      { metin: 'Veri kablosunu ucundan tut, mandala bastır.', calis: function () {
        return D.vurgula(k.veriA, { etiket: false, hat: false }).then(function () {
          etiketler.push(vurguEtiket(s, k.veriA.userData.govde, 'Ucundan tut · mandala bas', 'vurgu'));
          return k.veriA.userData.mandalBas(true, 0.35);
        }).then(function () { return D.bekle(0.6, s); });
      } },
      { metin: 'Düz çek; kablodan asılma.', calis: function () {
        return D.fisCikar(k.veriA, k.agV, 2.4).then(function () {
          kaldirHepsi(etiketler);
          k.veriA.userData.mandalBas(false, 0.2);
          return D.vurguKaldir(k.veriA);
        }).then(function () { return D.git(k.veriA, PARK_V, 0.8); });
      } },
      { metin: 'Güç kablosunu da ucundan tutup çek.', calis: function () {
        return D.vurgula(k.guc, { etiket: false, hat: false }).then(function () {
          etiketler.push(vurguEtiket(s, k.guc.userData.govde, 'Ucundan tut', 'vurgu', { yer: 'alt' }));
          return D.fisCikar(k.guc, k.agG, 2.4);
        }).then(function () { kaldirHepsi(etiketler); D.vurguKaldir(k.guc); return D.git(k.guc, PARK_G, 0.8); });
      } },
      { metin: 'Kızaktaki iki vidayı sök, kutuya koy.', calis: function () {
        return Promise.all(k.vidalar.map(function (v) { return D.vurgula(v, { etiket: false }); })).then(function () {
          etiketler.push(vurguEtiket(s, k.vidalar[0], 'Disk vidası', 'vurgu'));
          return Promise.all(k.vidalar.map(function (v) { return D.vida(v, { eksen: 'x', tur: 3, mesafe: 0.9 }); }));
        }).then(function () {
          kaldirHepsi(etiketler);
          k.vidalar.forEach(function (v) { D.vurguKaldir(v, 0); });
          return Promise.all(k.vidalar.map(function (v) { return D.git(v, v.position.clone().add(new V3(-9, 3, 0)), 0.8); }));
        }).then(function () { k.vidalar.forEach(function (v) { v.visible = false; }); });
      } },
      { metin: 'Diski geriye kaydır, iki elinle kaldırıp çıkar.', calis: function () {
        return D.git(k.hdd, DISK_ARKA, 1).then(function () { return D.git(k.hdd, DISK_UST, 0.5); })
          .then(function () { return D.git(k.hdd, DISK_DIS, 1.1); })
          .then(function () { etiketler.push(vurguEtiket(s, k.hdd, 'Disk kızaktan çıktı', 'dogru')); });
      } }
    ], { sifirla: sifirla });
  });

  /* ─────────── Adım 3: diski tak (A-TAK: kızağa kayar; L ters girmez → çevir → klik) ─────────── */
  D.tembel('#s7-3d', function (kap) {
    var a = yakinSahne(kap), s = a.s, k = a.k;
    var gorunum0 = null, etiketler = [], not = null;
    function sifirla() {
      kaldirHepsi(etiketler);
      if (not) { not.remove(); not = null; }
      k.hdd.position.copy(DISK_DIS);
      k.vidalar.forEach(function (v) { v.position.copy(v.userData.yuva).add(new V3(-9, 3, 0)); v.rotation.set(0, 0, 0); v.visible = false; });
      k.veriA.position.copy(PARK_V); k.guc.position.copy(PARK_G);
      D.fisKonumla(k.veriA, k.agV, 3); k.veriA.position.copy(PARK_V);
      D.fisKonumla(k.guc, k.agG, 3); k.guc.position.copy(PARK_G);
      if (!gorunum0) { gorunum0 = gorunumKaydet(s); s.orb.yakinlik = 1.2; } else s.kameraGit({ yakinlik: 1.2, theta: gorunum0.theta, phi: gorunum0.phi, hedef: gorunum0.hedef }, 0.5);
    }
    prova(s, [
      { metin: 'Diski kasaya al: konnektörler arkaya baksın.', calis: function () {
        return D.git(k.hdd, DISK_UST, 1).then(function () {
          s.kameraGit({ yakinlik: 1 }, 1);
          return D.git(k.hdd, DISK_ARKA, 0.6);
        }).then(function () {
          etiketler.push(vurguEtiket(s, k.hdd.userData.sataGuc, 'Konnektörler arkada', 'vurgu'));
          return D.bekle(0.8, s);
        });
      } },
      { metin: 'Diski kızağa kaydır: yerine oturur.', calis: function () {
        kaldirHepsi(etiketler);
        return D.git(k.hdd, HDD0.clone().add(new V3(0, 0, -0.15)), 1).then(function () { return D.git(k.hdd, HDD0, 0.18, 'easeInCubic'); })
          .then(function () { D.ses('klik'); etiketler.push(vurguEtiket(s, k.kizak, 'Kızağa oturdu', 'dogru')); return D.bekle(0.9, s); });
      } },
      { metin: 'Delikleri hizala, vidaları tak.', calis: function () {
        kaldirHepsi(etiketler);
        k.vidalar.forEach(function (v) { v.visible = true; });
        return Promise.all(k.vidalar.map(function (v) { return D.git(v, v.userData.yuva.clone().add(new V3(-0.9, 0, 0)), 0.8); }))
          .then(function () { return Promise.all(k.vidalar.map(function (v) { return D.vida(v, { eksen: 'x', tur: 3, mesafe: 0.9, sok: false }); })); });
      } },
      { metin: 'Veri kablosu: L ucu ters tutulunca girmez!', calis: function () {
        return Promise.all([bak(s, dunya(k.agV).add(new V3(0, 0.3, -1.2)), 0.5, 0.9), yaklas(k.veriA, k.agV, 3, true, 0.9)]).then(function () {
          etiketler.push(vurguEtiket(s, k.hdd.userData.sataVeri, 'Porttaki L', 'veri', { yer: 'alt' }));
          return D.fisTak(k.veriA, k.agV, { ters: true, bas: 3 });
        }).then(function () {
          etiketler.push(vurguEtiket(s, k.veriA.userData.govde, '✗ L ters: girmez', 'hata'));
          return D.bekle(1.2, s);
        });
      } },
      { metin: 'Çevir: iki L aynı yöne baksın. Düz it, klik!', calis: function () {
        kaldirHepsi(etiketler);
        return D.tween({ sahne: s, sure: 0.8, anahtar: 'cevir', hedef: k.veriA, guncelle: function (e) { D.fisKonumla(k.veriA, k.agV, 0.9, Math.PI * (1 - e)); } })
          .then(function () { return D.bekle(0.3, s); })
          .then(function () { return D.fisTak(k.veriA, k.agV, { bas: 0.9, sure: 0.5 }); })
          .then(function () { etiketler.push(vurguEtiket(s, k.veriA.userData.govde, '✓ Klik! Oturdu', 'dogru')); return D.bekle(0.9, s); });
      } },
      { metin: 'Güç kablosunu da L’ye hizala ve tak.', calis: function () {
        kaldirHepsi(etiketler);
        return Promise.all([bak(s, dunya(k.agG).add(new V3(0, 0.3, -1.2)), 0.55, 0.9), yaklas(k.guc, k.agG, 3, false, 0.9)])
          .then(function () { return D.fisTak(k.guc, k.agG, { bas: 3 }); })
          .then(function () {
            etiketler.push(vurguEtiket(s, k.guc.userData.govde, '✓ Güç ucu oturdu', 'dogru', { yer: 'alt' }));
            return s.kameraGit({ yakinlik: 1, hedef: gorunum0.hedef }, 1);
          });
      } }
    ], { sifirla: sifirla, bitti: function () {
      if (DERS.tahmin == null) return;
      not = D.div('don3d-ipucu', s.arayuz);
      not.style.bottom = '64px';
      not.textContent = DERS.tahminNotu(1, 'L ters olunca kablo girmedi; çevrilince oturdu.', 'Gördün: L ters olunca kablo girmedi, çevrilince oturdu.');
    } });
  });

  /* ─────────── Adım 4: kabloları kontrol et ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var a = yakinSahne(kap), s = a.s, k = a.k;
    var gorunum0 = null, etiketler = [];
    var YARIM = -k.guc.userData.giris * 0.9 + 0.34;
    function sifirla() {
      kaldirHepsi(etiketler);
      [k.guc, k.veriA, k.veriB].forEach(function (o) { D.vurguKaldir(o, 0); });
      k.takili(k.veriA, k.agV);
      D.fisKonumla(k.guc, k.agG, YARIM);
      if (!gorunum0) gorunum0 = gorunumKaydet(s); else s.kameraGit(gorunum0, 0.5);
    }
    prova(s, [
      { metin: 'Güç ucuna bak: arada boşluk var mı?', calis: function () {
        var h = dunya(k.agG).add(new V3(0, 0, -0.8));
        return s.kameraGit({ theta: Math.atan2(-1, -0.12), phi: 1.18, yakinlik: 0.55, hedef: [h.x, h.y, h.z] }, 1).then(function () {
          return D.vurgula(k.guc, { renk: '#ef4444', etiket: false, hat: false });
        }).then(function () {
          etiketler.push(vurguEtiket(s, k.guc.userData.govde, '✗ Yarım takılı: boşluk var', 'hata'));
          return D.bekle(1.4, s);
        });
      } },
      { metin: 'Ucundan tutup düz it: klik.', calis: function () {
        kaldirHepsi(etiketler);
        D.vurguKaldir(k.guc);
        return yaklas(k.guc, k.agG, -k.guc.userData.giris * 0.9, false, 0.35, 'easeInCubic').then(function () {
          D.ses('klik');
          etiketler.push(vurguEtiket(s, k.guc.userData.govde, '✓ Tam oturdu', 'dogru'));
          return D.bekle(1, s);
        });
      } },
      { metin: 'Veri ucunu hafifçe çek: mandal tutuyor.', calis: function () {
        kaldirHepsi(etiketler);
        var u0 = -k.veriA.userData.giris * 0.9;
        return bak(s, dunya(k.agV), 0.42, 0.7)
          .then(function () { return yaklas(k.veriA, k.agV, u0 + 0.08, false, 0.25); })
          .then(function () { return yaklas(k.veriA, k.agV, u0, false, 0.2); })
          .then(function () { etiketler.push(vurguEtiket(s, k.veriA.userData.govde, '✓ Mandal tutuyor', 'dogru')); return D.bekle(1, s); });
      } },
      { metin: 'Öbür ucu anakartta: o da tam takılı mı?', calis: function () {
        kaldirHepsi(etiketler);
        var h = dunya(k.agK).add(new V3(-1.2, -0.2, 0.4));
        return s.kameraGit({ theta: Math.atan2(-1, 0.35), phi: 1.33, yakinlik: 0.55, hedef: [h.x, h.y, h.z] }, 1.1).then(function () {
          return D.vurgula(k.veriB, { renk: VERI_RENK, etiket: false, hat: false });
        }).then(function () {
          etiketler.push(vurguEtiket(s, k.veriB.userData.govde, '✓ Anakart ucu takılı', 'dogru'));
          return D.bekle(1.2, s);
        }).then(function () { return D.vurguKaldir(k.veriB); });
      } },
      { metin: 'Kablolar fana ve keskin kenara değmiyor.', calis: function () {
        kaldirHepsi(etiketler);
        return s.kameraGit({ hedef: [1, 13.4, 4], yakinlik: 1.25 }, 1).then(function () {
          etiketler.push(vurguEtiket(s, k.veriA.userData.kablo, '✓ Kablolar serbest', 'dogru', { yer: 'merkez' }));
        });
      } }
    ], { sifirla: sifirla });
  });

  /* ─────────── Etkinlik: E-TAK — kabloları doğru yönde, doğru girişe tak ─────────── */
  D.tembel('#s11-3d', function (kap) {
    var a = yakinSahne(kap, { merkez: new V3(-2.2, 12.7, 3.2), r: 8.2, yon: [-0.95, 0.6, -0.62] }), s = a.s, k = a.k;
    var durum = document.getElementById('etk-durum');
    var msj = durum.querySelector('.etk-mesaj');
    var secDugmeler = document.querySelectorAll('.kablo-sec button');
    var mesaj = DERS.sahneMesaj(s);
    var HAVA = 3.2;
    var UCLAR = {
      veri: { fis: k.veriA, ag: k.agV, ad: 'Veri kablosu', giris: 'veri girişine', ters: true, bitti: false, onunde: k.agV },
      guc: { fis: k.guc, ag: k.agG, ad: 'Güç kablosu', giris: 'güç girişine', ters: true, bitti: false, onunde: k.agG }
    };
    var secili = null, mesgul = false;
    var portEtiket = [
      vurguEtiket(s, k.hdd.userData.sataVeri, 'Veri girişi · dar', 'veri', { yer: 'alt' }),
      vurguEtiket(s, k.hdd.userData.sataGuc, 'Güç girişi · geniş', 'guc', { yer: 'alt' })
    ];
    function yaz(tur, t) { msj.className = 'etk-mesaj' + (tur ? ' ' + tur : ''); msj.textContent = t; mesaj(t, tur); }
    // "Önden bak" kutusu: porttaki L ile seçili kablo ucundaki L yan yana (ters ise uç 180° döner)
    var onden = D.div('onden', s.arayuz);
    onden.setAttribute('aria-live', 'polite');
    function lYol(x, y, w, sol) {
      var k = 4, h = 3.5, u = 10;
      var p = sol ? [[x, y + h], [x + w, y + h], [x + w, y], [x + k, y], [x + k, y - u], [x, y - u]]
        : [[x, y + h], [x + w, y + h], [x + w, y - u], [x + w - k, y - u], [x + w - k, y], [x, y]];
      return p.map(function (q) { return q[0] + ',' + q[1]; }).join(' ');
    }
    function ondenCiz(ad, ters) {
      var veri = ad !== 'guc', w = veri ? 36 : 70, x = (120 - w) / 2, sol = veri;
      onden.innerHTML = '<div class="onden-bas">Önden bak · ' + (veri ? 'veri' : 'güç') + '</div>' +
        '<svg viewBox="0 0 120 92" aria-hidden="true">' +
        '<rect x="' + (x - 8) + '" y="6" width="' + (w + 16) + '" height="26" rx="4" fill="#9ba1a9"/>' +
        '<rect x="' + (x - 3) + '" y="10" width="' + (w + 6) + '" height="18" rx="2" fill="#15161a"/>' +
        '<polygon points="' + lYol(x, 20, w, sol) + '" fill="#8b919c"/>' +
        '<text x="6" y="22" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="800" fill="#334155">Port</text>' +
        '<g class="onden-uc' + (ters ? ' ters' : '') + '"><rect x="' + (x - 7) + '" y="46" width="' + (w + 14) + '" height="26" rx="4" fill="#1b1c21"/>' +
        '<rect x="' + (x - 5) + '" y="48" width="' + (w + 10) + '" height="22" rx="3" fill="#3c4048"/>' +
        '<polygon points="' + lYol(x - 1, 60, w + 2, sol) + '" fill="#050507"/></g>' +
        '<text x="6" y="62" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="800" fill="#334155">Uç</text>' +
        '<text class="onden-durum" x="60" y="88" font-family="Inter,Arial,sans-serif" font-size="8.5" font-weight="900" text-anchor="middle"></text></svg>';
      ondenTers(ters);
    }
    function ondenTers(ters) {
      onden.querySelector('.onden-uc').classList.toggle('ters', ters);
      var t = onden.querySelector('.onden-durum');
      t.textContent = ters ? '✗ L ters' : '✓ L hizalı';
      t.setAttribute('fill', ters ? '#b91c1c' : '#047857');
    }
    function satir(ad, tamam) { durum.querySelector('[data-d="' + ad + '"]').classList.toggle('tamam', !!tamam); }
    function yonMetni(u) { return u.ters ? 'L ucu ters duruyor: önce “Çevir”e bas.' : 'L ucu porttaki L ile aynı yönde. Şimdi ' + u.giris + ' dokun.'; }
    function sec(ad) {
      if (mesgul) return;
      if (secili && secili !== ad) D.vurguKaldir(UCLAR[secili].fis);
      secili = ad;
      secDugmeler.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === ad ? 'true' : 'false'); });
      var u = UCLAR[ad];
      if (u.bitti) { yaz('dogru', '✔ ' + u.ad + ' zaten takılı. Öbür kabloyu seç.'); return; }
      D.vurgula(u.fis, { etiket: false, hat: false, sure: 0.3 });
      ondenCiz(ad, u.ters);
      yaz('', u.ad + ' seçildi. ' + yonMetni(u));
    }
    function baslat() {
      Object.keys(UCLAR).forEach(function (ad) {
        var u = UCLAR[ad];
        u.ters = true; u.bitti = false; u.onunde = u.ag;
        D.vurguKaldir(u.fis, 0);
        D.fisKonumla(u.fis, u.ag, HAVA, Math.PI);
        satir(ad, false);
      });
      secili = null;
      ondenCiz('veri', true);
      secDugmeler.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); b.disabled = false; });
      portEtiket.forEach(function (e) { e.goster(true); });
      yaz('', 'Önce bir kablo seç.');
    }
    function cevir() {
      if (mesgul) return;
      if (!secili) { yaz('', 'Önce bir kablo seç.'); return; }
      var u = UCLAR[secili];
      if (u.bitti) return;
      mesgul = true;
      var a0 = u.ters ? Math.PI : 0, a1 = u.ters ? 0 : Math.PI;
      ondenTers(!u.ters);
      D.tween({ sahne: s, sure: 0.7, anahtar: 'cevir', hedef: u.fis, guncelle: function (e) { D.fisKonumla(u.fis, u.onunde, HAVA, a0 + (a1 - a0) * e); } })
        .then(function () { u.ters = !u.ters; mesgul = false; yaz('', yonMetni(u)); });
    }
    function dene(portTur) {
      if (mesgul) return;
      if (!secili) { yaz('', 'Önce bir kablo seç.'); return; }
      var u = UCLAR[secili], ad = secili;
      if (u.bitti) return;
      var ag = portTur === 'veri' ? k.agV : k.agG;
      if ((portTur === 'veri' ? UCLAR.veri : UCLAR.guc).bitti) { yaz('yanlis', 'Bu giriş dolu. Öbür girişi dene.'); return; }
      var uygun = ad === portTur;
      mesgul = true;
      var once = u.onunde === ag ? Promise.resolve() : yaklas(u.fis, ag, HAVA, u.ters, 0.6);
      once.then(function () {
        u.onunde = ag;
        return D.fisTak(u.fis, ag, { uygun: uygun, ters: u.ters, bas: HAVA, sure: 0.7 });
      }).then(function (oturdu) {
        if (oturdu) {
          u.bitti = true; mesgul = false;
          D.vurguKaldir(u.fis);
          satir(ad, true);
          portEtiket[ad === 'veri' ? 0 : 1].goster(false);
          var ikisi = UCLAR.veri.bitti && UCLAR.guc.bitti;
          if (ikisi) {
            yaz('dogru', '✔ Harika! İki kablo da doğru girişte ve tam oturdu.');
            secDugmeler.forEach(function (b) { b.disabled = true; });
            DERS.konfeti();
          } else yaz('dogru', '✔ Klik! ' + u.ad + ' oturdu. Şimdi öbür kabloyu seç.');
          return;
        }
        if (!uygun) yaz('yanlis', '✗ Girmedi: bu ' + (portTur === 'veri' ? 'dar veri girişi' : 'geniş güç girişi') + '. ' + u.ad + ' ' + u.giris + ' takılır.');
        else yaz('yanlis', '✗ Girmedi: L ters duruyor. “Çevir”e bas, sonra yeniden dene.');
        var geri = uygun ? Promise.resolve() : yaklas(u.fis, u.ag, HAVA, u.ters, 0.5);
        return geri.then(function () { if (!uygun) u.onunde = u.ag; return yaklas(u.fis, u.onunde, HAVA, u.ters, 0.3); }).then(function () { mesgul = false; });
      });
    }
    secDugmeler.forEach(function (b) { b.addEventListener('click', function () { sec(b.dataset.k); }); });
    var portlar = [k.hdd.userData.sataVeri, k.hdd.userData.sataGuc];
    s.tiklaninca(function (p, e) {
      // İşaretçiyle tıklamada önce girişlere bak (önünde duran kablo ucu tıklamayı engellemesin)
      if (e && e.clientX != null) {
        var port = s.secilen(e.clientX, e.clientY, portlar);
        if (port === portlar[0]) { dene('veri'); return; }
        if (port === portlar[1]) { dene('guc'); return; }
      }
      if (!p) return;
      for (var o = p; o; o = o.parent) {
        if (o === k.veriA) { sec('veri'); return; }
        if (o === k.guc) { sec('guc'); return; }
        if (o === k.hdd.userData.sataVeri) { dene('veri'); return; }
        if (o === k.hdd.userData.sataGuc) { dene('guc'); return; }
      }
    });
    s.dugme('Çevir', 'dondur', cevir, { yer: 'alt-sol', aciklama: 'Seçili kablo ucunu kendi ekseninde 180 derece çevir' });
    s.dugme('Tak', 'oynat', function () { if (secili) dene(secili); else yaz('', 'Önce bir kablo seç.'); },
      { yer: 'alt-sol', sinif: 'don3d-dugme--birincil', aciklama: 'Seçili kabloyu kendi girişine takmayı dene' });
    s.dugme('Baştan', 'tekrar', function () {
      if (mesgul) return;
      Object.keys(UCLAR).forEach(function (ad) { D.vurguKaldir(UCLAR[ad].fis, 0); });
      baslat();
    }, { yer: 'ust-sag', aciklama: 'Etkinliği baştan başlat' });
    baslat();
  });

  /* ─────────── Adım 6: A-BOOT — açılış provası (2D) ─────────── */
  (function () {
    var kok = document.getElementById('aboot');
    if (!kok) return;
    var KASA = '<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kasanın önü: güç düğmesi, güç ışığı, disk ışığı ve ön fan">' +
      '<rect x="8" y="6" width="104" height="188" rx="8" fill="#1d2027"/><rect x="14" y="12" width="92" height="176" rx="5" fill="#2a2e36"/>' +
      '<circle class="ab-dugme" cx="60" cy="34" r="11" fill="#c8cdd4" stroke="#6b7280" stroke-width="2"/>' +
      '<path d="M60 27v6M55 30.5a6 6 0 1 0 10 0" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round"/>' +
      '<circle class="ab-led" cx="38" cy="34" r="4"/><text x="38" y="50" font-family="Inter,Arial,sans-serif" font-size="7" font-weight="800" fill="#cbd5e1" text-anchor="middle">GÜÇ</text>' +
      '<circle class="ab-disk-led" cx="82" cy="34" r="4"/><text x="82" y="50" font-family="Inter,Arial,sans-serif" font-size="7" font-weight="800" fill="#cbd5e1" text-anchor="middle">DİSK</text>' +
      '<rect x="22" y="66" width="76" height="110" rx="6" fill="#111317"/>' +
      '<circle cx="60" cy="122" r="32" fill="#0b0c0f" stroke="#3b404a" stroke-width="3"/>' +
      '<g class="ab-fan"><circle cx="60" cy="122" r="7" fill="#3b404a"/>' +
      [0, 72, 144, 216, 288].map(function (a) { return '<path d="M60 122 C58 108 66 98 76 96 C72 106 70 114 60 122z" fill="#4b5563" transform="rotate(' + a + ' 60 122)"/>'; }).join('') +
      '</g><text x="60" y="170" font-family="Inter,Arial,sans-serif" font-size="7" font-weight="800" fill="#94a3b8" text-anchor="middle">FAN</text></svg>';
    kok.innerHTML = '<ol class="ab-zincir"><li class="bitti">Onay</li><li>Güç düğmesi</li><li>Işık ve fan</li><li>Başlangıç</li><li>Sistem bilgisi</li></ol>' +
      '<div class="ab-orta"><div class="ab-kasa">' + KASA + '</div>' +
      '<div class="ab-monitor"><div class="ab-ekran"><div class="ab-ekran-ic"></div></div><div class="ab-ayak"></div></div></div>' +
      '<div class="ab-alt"><div class="secici ab-sec"></div><div class="panel-sonuc ab-sonuc" aria-live="polite"></div></div>';
    var zincir = kok.querySelectorAll('.ab-zincir li'), ekran = kok.querySelector('.ab-ekran-ic'), sonuc = kok.querySelector('.ab-sonuc');
    var svg = kok.querySelector('svg'), sec = kok.querySelector('.ab-sec');
    var calisma = 0;
    function bekle(sn) { return new Promise(function (r) { setTimeout(r, AZ ? 10 : sn * 1000); }); }
    function zincirAyar(aktif, hata) {
      zincir.forEach(function (li, i) { li.className = i < aktif ? 'bitti' : (i === aktif ? (hata ? 'hata' : 'aktif') : ''); });
    }
    function ekranYaz(tur, html) { ekran.className = 'ab-ekran-ic ' + tur; ekran.innerHTML = html; }
    function sifirla() {
      zincirAyar(1);
      svg.classList.remove('acik', 'disk-calisiyor');
      ekranYaz('kapali', '<span>Ekran kapalı</span>');
      sonuc.textContent = '';
    }
    var SATIRLAR = [['İşlemci', '4 çekirdek · 3,2 GHz', ''], ['Bellek (RAM)', '8 GB', 'ram'], ['Depolama', '1 TB sabit disk (HDD)', 'disk']];
    function bilgiEkrani() {
      return '<div class="ab-pencere"><div class="ab-pencere-bas">Sistem bilgisi</div>' + SATIRLAR.map(function (r) {
        return '<div class="ab-satir" data-s="' + r[2] + '"><span>' + r[0] + '</span><b>' + r[1] + '</b><i aria-hidden="true"></i></div>';
      }).join('') + '</div>';
    }
    function oynat(gevsek) {
      var no = ++calisma;
      function sur() { if (no !== calisma) throw 'dur'; }
      sifirla();
      oynatBtn.querySelector('span').textContent = 'Tekrarla';
      bekle(0.4).then(function () {
        sur(); zincirAyar(1); sonuc.textContent = 'Öğretmen izin verdi. Güç düğmesine bir kez basılıyor.';
        svg.classList.add('basiliyor');
        return bekle(0.5);
      }).then(function () {
        sur(); svg.classList.remove('basiliyor');
        zincirAyar(2); svg.classList.add('acik');
        sonuc.textContent = 'Güç ışığı yandı, fan dönmeye başladı.';
        return bekle(1.6);
      }).then(function () {
        sur(); zincirAyar(3); svg.classList.add('disk-calisiyor');
        ekranYaz('baslat', '<div class="ab-baslik">Bilgisayar başlatılıyor…</div><div class="ab-cubuk"><span></span></div>');
        sonuc.textContent = 'Başlangıç ekranı: bilgisayar parçaları yokluyor.';
        return bekle(2.2);
      }).then(function () {
        sur();
        if (gevsek) {
          zincirAyar(3, true); svg.classList.remove('disk-calisiyor');
          ekranYaz('hata', '<div>Açılış diski bulunamadı.</div><div>Disk bağlantısını kontrol edin.</div>');
          sonuc.textContent = '✗ Disk görünmüyor. Öğretmenin kapatıp fişi çeker; sonra disk kablolarını kontrol edersiniz.';
          sonuc.className = 'panel-sonuc ab-sonuc yanlis';
          throw 'dur';
        }
        zincirAyar(4); svg.classList.remove('disk-calisiyor');
        ekranYaz('bilgi', bilgiEkrani());
        sonuc.textContent = 'Sistem bilgisi açıldı. RAM ve disk satırlarına bak.';
        return bekle(1.1);
      }).then(function () {
        sur(); ekran.querySelector('[data-s="ram"]').classList.add('dogru');
        sonuc.textContent = 'Bellek (RAM): 8 GB ✓ göründü.';
        return bekle(1.1);
      }).then(function () {
        sur(); ekran.querySelector('[data-s="disk"]').classList.add('dogru');
        zincirAyar(5);
        sonuc.className = 'panel-sonuc ab-sonuc dogru';
        sonuc.textContent = '✔ Doğrulandı: RAM ve disk sistem bilgisinde görünüyor.';
        D.ses('klik');
      }).catch(function (e) { if (e !== 'dur') console.error(e); });
      sonuc.className = 'panel-sonuc ab-sonuc';
    }
    var oynatBtn = DERS.dugme(sec, '', function () { oynat(false); });
    oynatBtn.innerHTML = D.simge('oynat') + '<span>Açılışı oynat</span>';
    oynatBtn.classList.add('ab-birincil');
    var gevsekBtn = DERS.dugme(sec, '', function () { oynat(true); });
    gevsekBtn.innerHTML = D.simge('adim') + '<span>Kablo gevşek olsaydı?</span>';
    sifirla();
    DERS.slaytAcilinca('s10', function () { if (!AZ) oynat(false); });
  })();

  /* ─────────── Derinleş: BIOS ekranında donanım bilgisini oku (marka-nötr, sade) ─────────── */
  (function () {
    var kok = document.getElementById('bios');
    if (!kok) return;
    function iki(n) { return (n < 10 ? '0' : '') + n; }
    var SATIR = [
      ['saat', 'Sistem saati', ''],
      ['cpu', 'İşlemci', '4 çekirdek · 3,2 GHz'],
      ['ram', 'Bellek (RAM)', '8192 MB'],
      ['sata1', 'SATA 1', '1 TB sabit disk'],
      ['sata2', 'SATA 2', 'Takılı değil'],
      ['sira', 'Açılış sırası', '1. SATA 1 disk']
    ];
    kok.innerHTML = '<div class="bios-ekran"><div class="bios-on"><div class="bios-on-ic">Bilgisayar başlıyor…</div><div class="bios-on-alt">Ayarlar için <b>Del</b> ya da <b>F2</b> tuşuna bas</div></div>' +
      '<div class="bios-ana" hidden><div class="bios-bas"><span>AYAR EKRANI (BIOS)</span><span>Ana sayfa</span></div><div class="bios-satirlar">' +
      SATIR.map(function (r) { return '<div class="bios-satir" data-s="' + r[0] + '"><span>' + r[1] + '</span><b>' + r[2] + '</b></div>'; }).join('') +
      '</div><div class="bios-alt"><span>Esc: Kaydetmeden çık</span><span>F10: Kaydet ve çık</span></div></div></div>' +
      '<div class="secici bios-sec"></div><div class="panel-sonuc bios-sonuc" aria-live="polite">Önce ayar ekranını aç.</div>';
    var on = kok.querySelector('.bios-on'), ana = kok.querySelector('.bios-ana'), sonuc = kok.querySelector('.bios-sonuc'), sec = kok.querySelector('.bios-sec');
    var saat = kok.querySelector('[data-s="saat"] b');
    function saatYaz() { var d = new Date(); saat.textContent = iki(d.getHours()) + ':' + iki(d.getMinutes()) + ':' + iki(d.getSeconds()); }
    saatYaz();
    setInterval(function () { var sl = document.getElementById('s12'); if (sl && sl.classList.contains('active')) saatYaz(); }, 1000);
    function vurgu(ad) { kok.querySelectorAll('.bios-satir').forEach(function (r) { r.classList.toggle('secili', r.dataset.s === ad); }); }
    var tus = DERS.dugme(sec, 'Tuşa bas (Del / F2)', function () {
      on.hidden = true; ana.hidden = false;
      ramB.disabled = false; diskB.disabled = false; tus.disabled = true;
      sonuc.textContent = 'Ayar ekranı açıldı. Şimdi RAM’i ve diski bul.';
    });
    var ramB = DERS.dugme(sec, 'RAM’i bul', function () {
      vurgu('ram'); ramB.setAttribute('aria-pressed', 'true'); diskB.setAttribute('aria-pressed', 'false');
      sonuc.textContent = '8192 MB = 8 GB (1 GB = 1024 MB). RAM görünüyor ✓';
    });
    var diskB = DERS.dugme(sec, 'Diski bul', function () {
      vurgu('sata1'); diskB.setAttribute('aria-pressed', 'true'); ramB.setAttribute('aria-pressed', 'false');
      sonuc.textContent = 'SATA 1: veri kablosunun takılı olduğu giriş. Disk görünüyor ✓';
    });
    ramB.disabled = true; diskB.disabled = true;
  })();
})();
