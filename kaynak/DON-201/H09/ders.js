/* DON-201 H09 — Güç Kaynağı, Ekran Kartı ve Soğutma · ders betiği (ortak betikten sonra çalışır)
   Derse özel kalıplar (motorda henüz yok): tam bilgisayar kurucusu (açık kasa + M-PSU + M-GPU + soğutucu + fanlar),
   A-AKIS zinciri (priz → güç kaynağı → parçalar, gerilim etiketli), A-HAVA (kasa içi hava parçacıkları + termometre),
   A-PATLAT (tüm bilgisayar), E-SANAL-MONTAJ (çok parçalı sürükle-bırak / dokun-dokun / klavye), 2D karşılaştırma ve boyama yarışı. */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  var SVGNS = 'http://www.w3.org/2000/svg';
  DERS.tahminKur('Tahminini aldık. Adım 1’de enerjinin yolunu birlikte izleyeceğiz.');

  /* ─────────── Yardımcılar ─────────── */
  function bekle(sn) { return new Promise(function (c) { setTimeout(c, AZ ? 0 : sn * 1000); }); }
  function svgEl(ad, ozellik, ebeveyn) {
    var e = document.createElementNS(SVGNS, ad);
    Object.keys(ozellik || {}).forEach(function (k) { e.setAttribute(k, ozellik[k]); });
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function aktif(id) { var s = document.getElementById(id); return !!(s && s.classList.contains('active')); }
  function isiRenk(d) { return new THREE.Color().setHSL((1 - Math.max(0, Math.min(1, d))) * 0.6, 0.85, 0.5).getStyle(); }
  var noktaDokusu = null;
  function noktaDoku() {
    if (noktaDokusu) return noktaDokusu;
    noktaDokusu = K.canvasDoku(64, 64, function (ctx, w, h) {
      var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    return noktaDokusu;
  }
  /** Görünmez çapa (etiket için): ebeveyn yerelinde [x,y,z] */
  function capa(ebeveyn, p) { var o = new THREE.Object3D(); o.position.fromArray(p); ebeveyn.add(o); return o; }

  /* ─────────── Tam bilgisayar: açık kasa + güç kaynağı + ekran kartı + soğutucu + fanlar ───────────
     Kasa ayakta; ölçüler M-MASAUSTU ile aynı (W 21, H 45, Dp 42; ön +Z, açık yan −X, anakart +X duvarında).
     Döner: kasa grubu; kasa.userData.parca (psu, gpu, sog, onFanlar, arkaFan, ssd, anakart, ramlar, kablolar, led),
            kasa.userData.yol (güç kablolarının yolları, kasa yereli). */
  function bilgisayar() {
    var kasa = D.model('M-MASAUSTU-ACIK', { kapakAcik: true });
    var o = kasa.userData.olcu, ic = kasa.getObjectByName('ic');
    ['ekran-karti', 'guc-kaynagi', 'islemci'].forEach(function (ad) { ic.getObjectByName(ad).visible = false; });
    kasa.userData.yuvalar[0].visible = false; kasa.userData.yuvalar[2].visible = false;   // boş RAM yuvaları (üçgen bütçesi)
    kasa.userData.vidalar.forEach(function (v) { v.visible = false; });                   // yan kapak yok: kapak vidaları gerekmez
    var parca = {};
    // Güç kaynağı: alt-arka; arka yüzü (priz girişi, anahtar) kasanın arkasından görünür. İçi modellenmez.
    var psu = D.model('M-PSU', { kablosuz: true });
    psu.position.set(0, o.yz + 0.6, -o.Dp / 2 - 0.1 + 7);
    kasa.add(psu); parca.psu = psu;
    // PCIe x16 yuvası (anakart yüzeyinde) ve ekran kartı (fanlar aşağı, arka plaka yukarı, braket arkada)
    var YUVA_Y = 23.9, YUVA_Z = -13.7;
    var pcie = K.kutu(0.9, 0.78, 9.3, 'plastikSiyah', 0.08);
    K.parca(pcie, 'pcie-yuvasi', 'PCIe x16 yuvası', 'Ekran kartının takıldığı uzun yuva.');
    K.koy(kasa, pcie, o.xTepsi - 0.55, YUVA_Y, YUVA_Z);
    var gpu = D.model('M-GPU');
    gpu.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new V3(0, 0, 1), new V3(-1, 0, 0), new V3(0, -1, 0)));
    gpu.position.set(o.xTepsi - 0.2, YUVA_Y, YUVA_Z);
    kasa.add(gpu); parca.gpu = gpu;
    // İşlemci soğutucusu (soket anakartta; fanı basit kasa fanı)
    var soket = K.kutu(0.5, 5.2, 5.2, 'plastikAcik', 0.1);
    K.koy(kasa, soket, o.xTepsi - 0.3, 35, -11).userData.secilmez = true;
    var sog = D.model('M-SOGUTUCU', { fansiz: true });
    sog.rotation.z = Math.PI / 2;
    sog.position.set(o.xTepsi - 1.0, 35, -11);
    var sogFan = D.kitFan(K, 12);
    K.koy(sog, sogFan, 0, sog.userData.olcu.fanY, sog.userData.olcu.fanZ);
    sog.userData.rotor2 = sogFan.userData.rotor;
    K.parca(sog, 'islemci-sogutucu', 'İşlemci ve soğutucusu', 'İşlemci en çok ısınan parçalardandır. Soğutucu ve fanı onu serin tutar.');
    kasa.add(sog); parca.sog = sog;
    // Ön fanlar (hava girişi)
    parca.onFanlar = [31, 17].map(function (y, i) {
      var f = D.kitFan(K, 12);
      K.parca(f, 'on-fan-' + (i + 1), 'Ön fan (hava girişi)', 'Kasanın önünden serin havayı içeri çeker.');
      K.koy(kasa, f, 0, y, o.Dp / 2 - 1.5);
      return f;
    });
    parca.arkaFan = ic.getObjectByName('arka-fan');
    parca.arkaFan.userData.bilgi = 'Kasanın arkasından sıcak havayı dışarı atar.';
    // Depolama: ön-alt kızak üzerinde
    var ssd = ic.getObjectByName('depolama');
    ssd.position.set(0, o.yz + 1.25, 9.5);
    var kizak = K.kutu(9, 0.3, 12.5, 'kasaIc', 0.1);
    K.koy(ic, kizak, 0, o.yz + 0.75, 9.5).userData.secilmez = true;
    parca.ssd = ssd;
    parca.anakart = ic.getObjectByName('anakart');
    parca.ramlar = kasa.userData.ramlar;
    parca.led = kasa.getObjectByName('guc-isigi');
    // Güç bağlantıları (anakart 24 pin, işlemci 8 pin)
    var b24 = K.kutu(0.8, 5.2, 1.0, 'plastikAcik', 0.08);
    K.koy(kasa, b24, o.xTepsi - 0.5, 36.4, 1.6).userData.secilmez = true;
    var b8 = K.kutu(0.8, 1.0, 2.1, 'plastikAcik', 0.08);
    K.koy(kasa, b8, o.xTepsi - 0.5, 42.4, -17.2).userData.secilmez = true;
    parca.b24 = b24; parca.b8 = b8;
    // Güç kabloları (güç kaynağından parçalara) — A-AKIS yolları da bunlardır (kasa yereli)
    kasa.updateMatrixWorld(true);                                    // kasa henüz sahnede değil: dünya = kasa yereli
    var gucAgiz = gpu.localToWorld(gpu.userData.gucAgiz.clone());
    var P = function (x, y, z) { return new V3(x, y, z); };
    var yol = {
      anakart: [P(2.5, 6.5, -7.2), P(4.5, 8, -1), P(7, 14, 5.2), P(7.6, 26, 5.4), P(7.4, 34, 3.4), P(o.xTepsi - 1.2, 36.4, 1.6)],
      islemci: [P(-3.5, 7.5, -7.2), P(0.5, 13, 5.4), P(4.4, 26, 6.2), P(4.2, 43.4, 2.5), P(3.5, 43.6, -11), P(o.xTepsi - 1.2, 42.4, -17.2)],
      gpu: [P(-1.5, 6.2, -7.2), P(-3.8, 12, 0.5), P(-4.6, 19, 3.8), P(-4, gucAgiz.y, gucAgiz.z), P(gucAgiz.x - 0.4, gucAgiz.y, gucAgiz.z)],
      ssd: [P(0.8, 4.2, -7.2), P(0.8, 3.4, 0), P(0.8, o.yz + 1.4, 3.8)]
    };
    var kablolar = new THREE.Group();
    kablolar.name = 'guc-kablolari';
    Object.keys(yol).forEach(function (k) {
      var kb = K.kablo(yol[k], k === 'anakart' ? 0.5 : 0.32, 'kablo');
      kb.userData.secilmez = true;
      kablolar.add(kb);
    });
    kasa.add(kablolar);
    parca.kablolar = kablolar;
    kasa.userData.parca = parca;
    kasa.userData.yol = yol;
    ledAyarla(kasa, false);
    return kasa;
  }
  function ledAyarla(kasa, acik) {
    var led = kasa.userData.parca.led;
    if (led && led.material) { led.material = led.material.userData.kopya ? led.material : kopyaMat(led.material); led.material.emissiveIntensity = acik ? 1.8 : 0.04; }
  }
  function kopyaMat(m) { var k = m.clone(); k.userData = { kopya: true }; return k; }
  /** Kasadaki tüm fanlar (ekran kartı, soğutucu, ön ve arka fanlar): { ayarla(hiz, sure) → Promise, hiz() } */
  function fanlar(s, kasa) {
    var p = kasa.userData.parca;
    var rotorlar = [p.arkaFan.userData.rotor, p.sog.userData.rotor2].concat(p.onFanlar.map(function (f) { return f.userData.rotor; }));
    var st = { hiz: 0 };
    p.gpu.userData.hiz = 0;
    p.gpu.userData.baslat(s);
    s.herKare(function (dt) {
      var d = st.hiz * dt * (AZ ? 0.15 : 1);
      for (var i = 0; i < rotorlar.length; i++) rotorlar[i].rotation.z -= d;
    });
    return {
      hiz: function () { return st.hiz; },
      ayarla: function (h, sure) {
        var h0 = st.hiz;
        p.gpu.userData.hizAyarla(h * 0.8, sure);
        if (sure === 0) { st.hiz = h; return Promise.resolve(); }
        return D.tween({ sahne: s, sure: sure == null ? 1 : sure, anahtar: 'fanlar', hedef: st, guncelle: function (e) { st.hiz = h0 + (h - h0) * e; } });
      }
    };
  }
  /** Kalıcı enerji çizgisi (A-AKIS bittikten sonra yol üzerinde renkli iz). Döner: mesh */
  function enerjiCizgisi(s, noktalar, renk) {
    var egri = new THREE.CatmullRomCurve3(noktalar, false, 'centripetal');
    var mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(renk), transparent: true, opacity: 0.9, depthWrite: false });
    mat.toneMapped = false;
    var m = new THREE.Mesh(new THREE.TubeGeometry(egri, 64, 0.62, 8, false), mat);
    m.userData.secilmez = true; m.raycast = function () {}; m.renderOrder = 4;
    s.scene.add(m);
    return m;
  }
  function dunyaya(nesne, noktalar) {
    nesne.updateMatrixWorld(true);
    return noktalar.map(function (p) { return nesne.localToWorld(p.clone()); });
  }

  /* ─────────── Kapak: ekran kartı + güç kaynağı + kasa fanı ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 40,
      kamera: { yon: [0.25, 0.32, 1], pay: 0.92 } });
    var gpu = s.ekle('M-GPU', { donus: [0, -0.3, 0] });
    s.ekle('M-PSU', { konum: [-12, 0, 11], donus: [0, 0.75, 0] });
    var fan = s.ekle('M-FAN', { konum: [12, 6.05, -8], donus: [0, -0.5, 0] });
    s.yerlestir();
    gpu.userData.hiz = 5; gpu.userData.baslat(s);
    fan.userData.hiz = 5; fan.userData.baslat(s);
  });

  /* ─────────── Adım 1: A-AKIS — priz → güç kaynağı → parçalar ─────────── */
  D.tembel('#s4-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [-1, 0.46, -0.62], pay: 0.8, hedefOfset: [0, -1, 1] } });
    var kasa = bilgisayar();
    s.ekle(kasa);
    var p = kasa.userData.parca;
    // Duvar ve priz (kasanın sağ-arkasında)
    var duvar = K.duzlem(30, 24, K.mat('#ebe7e1', { roughness: 0.92 }));
    duvar.rotation.y = -Math.PI / 2;
    duvar.position.set(15, 12, -27);
    duvar.userData.secilmez = true; duvar.receiveShadow = true;
    s.kok.add(duvar);
    var supurge = K.kutu(0.8, 1.4, 30, K.mat('#d6d0c8', { roughness: 0.8 }), 0.1);
    supurge.position.set(14.6, 0.7, -27); supurge.userData.secilmez = true;
    s.kok.add(supurge);
    var priz = D.model('M-GUC-FISI', { kabloSon: [0, -1.5, 9] });
    priz.traverse(function (x) { if (x.geometry && x.geometry.type === 'TubeGeometry') x.visible = false; });
    priz.rotation.y = -Math.PI / 2;
    priz.position.set(14.9, 9, -31);
    s.kok.add(priz);
    var girisP = new V3(4.3, 7.53, -21.35);                       // güç kaynağı priz girişi (kasa yereli = dünya)
    var fisKablo = [new V3(9.6, 9, -31), new V3(7.6, 8.2, -28.5), new V3(5.2, 7.6, -24.6), new V3(4.3, 7.53, -22.3), girisP];
    var kb = K.kablo(fisKablo, 0.4, 'kablo'); kb.userData.secilmez = true;
    s.kok.add(kb);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.5, maxPolar: 1.45, minYakin: 0.5, maxYakin: 1.3 } });
    D.bilgi(s, ['M-PSU', 'M-GPU', 'islemci-sogutucu', 'depolama', 'anakart', 'priz', 'fis']);
    var fan = fanlar(s, kasa), mesaj = DERS.sahneMesaj(s);
    var DAGIT = [
      { yol: 'gpu', renk: '#facc15', v: '12 V', ad: 'Ekran kartı · 12 V', hedef: p.gpu, ofset: [-5, 0, 0] },
      { yol: 'islemci', renk: '#facc15', v: '12 V', ad: 'İşlemci · 12 V', hedef: p.b8, ofset: [-6, 2, 2] },
      { yol: 'anakart', renk: '#fb923c', v: '12 · 5 · 3,3 V', ad: 'Anakart · 12, 5, 3,3 V', hedef: p.b24, ofset: [-4, -5, 2] },
      { yol: 'ssd', renk: '#f87171', v: '5 V', ad: 'Disk · 5 V', hedef: p.ssd, ofset: [-3, 0, 2] }
    ];
    var cizgiler = [], etiketler = [], calisiyor = false;
    function temizle() {
      cizgiler.forEach(function (m) { s.scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
      etiketler.forEach(function (e) { e.kaldir(); });
      cizgiler = []; etiketler = [];
    }
    function oynat() {
      if (calisiyor) return;
      calisiyor = true; temizle(); b.disabled = true;
      fan.ayarla(0, 0); ledAyarla(kasa, false);
      mesaj('Prizden 230 V elektrik geliyor…', '');
      D.akis(s, fisKablo, { renk: '#a855f7', hiz: 16, etiket: '230 V', boyut: 5 })
        .then(function () {
          cizgiler.push(enerjiCizgisi(s, fisKablo, '#a855f7'));
          D.vurgula(p.psu, { etiket: false });
          etiketler.push(s.etiket(p.psu, 'Güç kaynağı: çevirir, dağıtır', { tur: 'odak', yer: 'merkez', ofset: [-6, 2, 0] }));
          mesaj('Güç kaynağı 230 V’u 12 V, 5 V ve 3,3 V’a çevirir.', '');
          return D.bekle(1.8, s);
        })
        .then(function () {
          D.vurguKaldir(p.psu);
          return Promise.all(DAGIT.map(function (d) {
            var yolD = dunyaya(kasa, kasa.userData.yol[d.yol]);
            return D.akis(s, yolD, { renk: d.renk, hiz: 26, etiket: d.v, boyut: 5 }).then(function () {
              cizgiler.push(enerjiCizgisi(s, yolD, d.renk));
              etiketler.push(s.etiket(d.hedef, d.ad, { tur: 'vurgu', yer: 'merkez', ofset: d.ofset }));
            });
          }));
        })
        .then(function () {
          fan.ayarla(9, 1.2); ledAyarla(kasa, true);
          mesaj('✔ ' + DERS.tahminNotu(1, 'Güç kaynağı enerjiyi tüm parçalara dağıttı; fanlar döndü.',
            'Her parça enerjisini güç kaynağından alır; fanlar döndü.'), 'dogru');
          calisiyor = false; b.disabled = false;
          b.querySelector('span').textContent = 'Tekrar izle';
        });
    }
    var b = s.dugme('Enerjiyi aç', 'oynat', oynat, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Enerjinin prizden parçalara yolunu göster' });
    mesaj('Fiş prizde. Enerjinin yolunu görmek için düğmeye bas.', '');
    D.bekle(0.9, s).then(oynat);
  });

  /* ─────────── Adım 2: güç kaynağı — dış görünüm, uyarı etiketi, açma girişiminde A-UYARI ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [1, 0.55, 0.62], pay: 0.95, hedefOfset: [0, 0, 1.5] } });
    var psu = s.ekle('M-PSU');
    // Kapak vidaları (dıştan görünen; sökülmez)
    var vidalar = new THREE.Group();
    K.parca(vidalar, 'psu-vida', 'Kapak vidaları', 'Bu vidalar sökülmez. Güç kaynağının kapağı asla açılmaz.');
    [[-6.6, -6.1], [6.6, -6.1], [-6.6, 5.9], [6.6, 5.9]].forEach(function (c) {
      var v = new THREE.Group();
      var bas = K.silindir(0.42, 0.18, 'celik', 16); v.add(bas);
      var yar = K.kutu(0.6, 0.06, 0.1, K.mat('#4b5058')); yar.position.y = 0.1; v.add(yar);
      var yar2 = yar.clone(); yar2.rotation.y = Math.PI / 2; v.add(yar2);
      v.position.set(c[0], 8.6 + 0.09, c[1]);
      vidalar.add(v);
    });
    psu.add(vidalar);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.35, maxPolar: 1.45, minYakin: 0.45, maxYakin: 1.35 } });
    D.bilgi(s, ['psu-etiket', 'psu-fan', 'psu-giris', 'psu-anahtar', 'psu-kablolar', 'psu-vida']);
    var mesaj = DERS.sahneMesaj(s);
    var kilit = null;
    // Kova benzetmesi kartı (güç kaynağının içi GÖSTERİLMEZ; yalnız benzetme)
    var kova = D.div('kova', s.arayuz);
    kova.hidden = true;
    kova.innerHTML = '<div class="kova-bas"><b>Neden tehlikeli?</b><button type="button" class="kova-kapat" aria-label="Kartı kapat">' + D.simge('kapat') + '</button></div>' +
      '<div class="kova-cizim"><!--@dahil:kova.svg--></div>' +
      '<p>Musluğu kapatsan da kova bir süre dolu kalır. Güç kaynağındaki bazı parçalar da fiş çekilince elektriği hemen boşaltmaz.</p>';
    kova.querySelector('.kova-kapat').addEventListener('click', function (e) { e.stopPropagation(); kova.hidden = true; });
    var etiketEt = null;
    function etiketiOku() {
      if (etiketEt) { etiketEt.kaldir(); etiketEt = null; }
      var et = s.parca('psu-etiket');
      D.vurgula(et, { etiket: false });
      s.kameraGit({ theta: Math.PI / 2 - 0.12, phi: 1.3, yakinlik: 0.62 }, 1);
      etiketEt = s.etiket(et, 'TEHLİKE: Yüksek gerilim · Kapağı açmayın', { tur: 'hata', yer: 'alt' });
      mesaj('Etiket uyarıyor: içinde onarılacak parça yoktur.', '');
      D.bekle(3, s).then(function () { D.vurguKaldir(et); });
    }
    function acmayiDene() {
      D.uyari(psu, { genlik: 0.7 });
      if (!kilit) kilit = s.etiket(psu, '🔒 Asla açma', { tur: 'hata' });
      mesaj('⚠ Asla! Fiş çekili olsa bile içinde elektrik saklanır. Bir yetişkine söyle.', 'yanlis');
      kova.hidden = false;
    }
    s.dugme('Etiketi oku', null, etiketiOku, { yer: 'alt-orta', aciklama: 'Kamerayı uyarı etiketine yaklaştır' });
    s.dugme('Kapağı açmayı dene', null, acmayiDene, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Güç kaynağının kapağını açmayı dene' });
    s.tiklaninca(function (x) { if (x && x.name === 'psu-vida') acmayiDene(); });
    mesaj('Bu, güç kaynağının dışı. Bir parçaya dokun.', '');
  });

  /* ─────────── Adım 3: ekran kartı — parçalar (E-DONDUR + E-BILGI), soğutucuyu ayır (A-PATLAT) ─────────── */
  D.tembel('#s6-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [-0.62, 0.34, 1], pay: 0.92, hedefOfset: [0, -0.6, 0] } });
    var gpu = s.ekle('M-GPU');
    gpu.userData.patlatMesafe = 8;
    gpu.userData.patlat(1, 0);
    s.yerlestir();
    gpu.userData.patlat(0, 0);
    gpu.userData.hiz = 4; gpu.userData.baslat(s);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.3, maxPolar: 1.6, minYakin: 0.45, maxYakin: 1.4 } });
    D.bilgi(s, ['gpu-ortu', 'gpu-fan-1', 'gpu-fan-2', 'gpu-kanatcik', 'gpu-isi-borusu', 'gpu-arka-plaka', 'gpu-pcie', 'gpu-guc-girisi',
      'gpu-braket', 'port-hdmi', 'port-dp-1', 'port-dp-2', 'port-dp-3', 'gpu-cip', 'gpu-bellek']);
    var mesaj = DERS.sahneMesaj(s), etk = [], acik = false, mesgul = false;
    function temizle() { etk.forEach(function (e) { e.kaldir(); }); etk = []; }
    function ilkEtiketler() {
      etk.push(s.etiket(s.parca('gpu-pcie'), 'PCIe tarağı', { tur: 'vurgu', yer: 'alt' }));
      etk.push(s.etiket(s.parca('port-hdmi'), 'Görüntü çıkışları', { tur: 'vurgu', yer: 'merkez', ofset: [-1.5, 0, 0] }));
      etk.push(s.etiket(s.parca('gpu-guc-girisi'), 'Güç girişi', { tur: 'vurgu' }));
      etk.push(s.etiket(s.parca('gpu-fan-2'), 'Fanlar', { tur: 'vurgu', yer: 'merkez' }));
    }
    function ayir(ac) {
      if (mesgul || ac === acik) return;
      mesgul = true; temizle();
      if (ac) s.kameraGit({ theta: 1.05, phi: 1.12, yakinlik: 0.95 }, 1.2); else s.sifirla();
      gpu.userData.patlat(ac ? 1 : 0, 1.3).then(function () {
        acik = ac; mesgul = false;
        bA.querySelector('span').textContent = ac ? 'Birleştir' : 'Soğutucuyu ayır';
        if (ac) {
          etk.push(s.etiket(s.parca('gpu-cip'), 'GPU (grafik işlemcisi)', { tur: 'odak', yer: 'merkez' }));
          etk.push(s.etiket(s.parca('gpu-bellek'), 'Ekran belleği', { tur: 'vurgu', yer: 'alt', ofset: [3.3, -2, 0] }));
          mesaj('Soğutucunun altında GPU ve kendi belleği var.', 'dogru');
        } else { ilkEtiketler(); mesaj('Soğutucu, GPU’nun ısısını kanatçıklarla alır.', ''); }
      });
    }
    var bA = s.dugme('Soğutucuyu ayır', null, function () { ayir(!acik); }, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Soğutucuyu karttan ayır ya da geri tak' });
    ilkEtiketler();
    mesaj('Kartı çevir, parçalara dokun.', '');
  });

  /* ─────────── Adım 4: tümleşik ve harici ekran kartı (2D; iş seç → yük göstergesi, dönen küp) ─────────── */
  (function () {
    var kok = document.getElementById('tumlesik');
    if (!kok) return;
    kok.innerHTML = '<div class="tm-sahne illu-orta"><!--@dahil:tumlesik.svg--></div>' +
      '<div class="tm-alt"><div class="secici" role="group" aria-label="İş seç"></div><div class="panel-sonuc" aria-live="polite"></div></div>';
    var svg = kok.querySelector('svg'), sonuc = kok.querySelector('.panel-sonuc'), secici = kok.querySelector('.secici');
    var ISLER = [
      { ad: 'Ödev', t: 0.18, h: 0.08, sonuc: 'Ödev yazmak için ikisi de rahat. Tümleşik kart daha az enerji harcar.' },
      { ad: 'Video', t: 0.34, h: 0.14, sonuc: 'Video izlemek için tümleşik kart yeterli; harici kart gerekmez.' },
      { ad: '3D oyun', t: 1.0, h: 0.52, sonuc: 'Tümleşik kart zorlanır, görüntü takılır. Harici kart rahat; ama çok enerji harcar.' },
      { ad: '3D tasarım', t: 0.95, h: 0.46, sonuc: 'Büyük 3D modeller harici kartla akıcı döner. Tümleşik kart yavaş kalır.' }
    ];
    var paneller = ['t', 'h'].map(function (k) {
      return { bar: svg.querySelector('.tm-bar-' + k), yazi: svg.querySelector('.tm-yuk-' + k), kup: svg.querySelector('.tm-kup-' + k),
        durum: svg.querySelector('.tm-durum-' + k), aci: 0, sonCiz: 0, yuk: 0.1 };
    });
    var dugmeler = [], secili = 0;
    function sec(i) {
      secili = i;
      dugmeler.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      var is = ISLER[i];
      [is.t, is.h].forEach(function (y, k) {
        var pn = paneller[k];
        pn.yuk = y;
        var w = Math.min(1, y) * 118;
        pn.bar.setAttribute('width', w.toFixed(1));
        pn.bar.setAttribute('fill', y >= 0.9 ? '#ef4444' : (y >= 0.5 ? '#f59e0b' : '#10b981'));
        pn.yazi.textContent = y >= 0.9 ? 'Zorlanıyor' : (y >= 0.5 ? 'Çalışıyor' : 'Rahat');
        pn.durum.textContent = y >= 0.9 ? '✗ Görüntü takılır' : '✓ Görüntü akıcı';
        pn.durum.setAttribute('fill', y >= 0.9 ? '#b91c1c' : '#047857');
      });
      sonuc.textContent = is.sonuc;
      sonuc.className = 'panel-sonuc' + (is.t >= 0.9 ? ' kotu' : ' iyi');
    }
    ISLER.forEach(function (is, i) { var b = DERS.dugme(secici, is.ad, function () { sec(i); }); dugmeler.push(b); });
    // Dönen tel küp: akıcı (her kare) ya da takılarak (yük yüksekse seyrek güncellenir)
    var KOSE = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
    var KENAR = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    function kupCiz(pn) {
      var a = pn.aci, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(0.5), sb = Math.sin(0.5);
      var pts = KOSE.map(function (c) {
        var x = c[0] * ca - c[2] * sa, z = c[0] * sa + c[2] * ca, y = c[1];
        var y2 = y * cb - z * sb;
        return [x * 13, y2 * 13];
      });
      pn.kup.setAttribute('d', KENAR.map(function (e) { return 'M' + pts[e[0]][0].toFixed(1) + ' ' + pts[e[0]][1].toFixed(1) + 'L' + pts[e[1]][0].toFixed(1) + ' ' + pts[e[1]][1].toFixed(1); }).join(''));
    }
    var dongu = null, son = 0;
    function kare(z) {
      dongu = null;
      if (!aktif('s7')) return;
      var dt = Math.min(0.05, (z - son) / 1000); son = z;
      paneller.forEach(function (pn) {
        pn.aci += dt * 1.6;
        var aralik = pn.yuk >= 0.9 ? 0.32 : 0;          // takılma: kareler seyrek çizilir
        if (z - pn.sonCiz >= aralik * 1000) { pn.sonCiz = z; kupCiz(pn); }
      });
      dongu = requestAnimationFrame(kare);
    }
    paneller.forEach(kupCiz);
    sec(0);
    DERS.slaytAcilinca('s7', function () { if (!dongu && !AZ) { son = performance.now(); dongu = requestAnimationFrame(kare); } }, true);
  })();

  /* ─────────── Adım 5: A-HAVA — kasa içinde hava parçacıkları; fanları durdur → sıcaklık artar ─────────── */
  function termometre(s) {
    var el = D.div('termo', s.arayuz);
    el.setAttribute('role', 'status');
    el.innerHTML = '<div class="termo-cubuk"><div class="termo-tup"><span class="termo-dolgu"></span></div><div class="termo-ampul"></div></div>' +
      '<div class="termo-yazi"><span class="termo-bas">Kasa içi</span><b class="termo-deger">–</b><span class="termo-durum"></span></div>';
    var dolgu = el.querySelector('.termo-dolgu'), ampul = el.querySelector('.termo-ampul'), deger = el.querySelector('.termo-deger'), durum = el.querySelector('.termo-durum');
    var sonT = null;
    return function (T) {
      var r = Math.round(T);
      if (r === sonT) return;
      sonT = r;
      var oran = Math.max(0.06, Math.min(1, (T - 20) / 40)), renk = isiRenk((T - 28) / 26);
      dolgu.style.height = (oran * 100).toFixed(1) + '%';
      dolgu.style.background = renk; ampul.style.background = renk;
      deger.textContent = '≈ ' + r + ' °C';
      durum.textContent = T >= 48 ? 'Sıcak' : (T >= 40 ? 'Isınıyor' : 'Serin');
      el.setAttribute('data-durum', T >= 48 ? 'cok' : (T >= 40 ? 'sicak' : 'normal'));
    };
  }
  function havaAkisi(s) {
    var P = function (x, y, z) { return new V3(x, y, z); };
    var YOLLAR = [
      { w: 0.24, n: [P(0, 31, 28), P(0, 31, 19.5), P(-2, 33, 8), P(-1.5, 35, -2), P(0, 35, -11), P(1.5, 35, -19), P(1.5, 35, -28)] },
      { w: 0.18, n: [P(3.5, 28.5, 28), P(3.5, 28.5, 19.5), P(-4, 30, 6), P(-3, 32, -8), P(2, 33.5, -19), P(2, 33.5, -28)] },
      { w: 0.2, n: [P(0, 17, 28), P(0, 17, 19.5), P(-3, 17, 6), P(-2, 18.4, -6), P(2, 19.6, -15), P(3, 21.1, -20.6), P(3, 21.1, -28)] },
      { w: 0.2, n: [P(-2.5, 14.5, 28), P(-2.5, 14.5, 19.5), P(-6, 20, 4), P(-5.5, 27, -6), P(0, 32, -17), P(1.5, 34, -19.5), P(1.5, 34, -28)] },
      { w: 0.18, n: [P(-4, 15.5, 12), P(-3, 13, -5), P(0, 11.6, -12), P(0, 8, -16), P(-2.8, 6.5, -21.2), P(-2.8, 6.5, -28)] }
    ].map(function (y) { var e = new THREE.CatmullRomCurve3(y.n, false, 'centripetal'); return { w: y.w, e: e, L: e.getLength() }; });
    var N = AZ ? 40 : 170, konum = new Float32Array(N * 3), renkler = new Float32Array(N * 3), ps = [];
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(konum, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(renkler, 3));
    var mat = new THREE.PointsMaterial({ size: 1.5, map: noktaDoku(), vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, sizeAttenuation: true });
    mat.toneMapped = false;
    var bulut = new THREE.Points(geo, mat);
    bulut.frustumCulled = false; bulut.userData.secilmez = true; bulut.raycast = function () {}; bulut.renderOrder = 6;
    s.scene.add(bulut);
    var soguk = new THREE.Color('#38bdf8'), sicak = new THREE.Color('#f97316'), c = new THREE.Color(), p = new V3();
    function yolSec() { var r = Math.random(), t = 0; for (var i = 0; i < YOLLAR.length; i++) { t += YOLLAR[i].w; if (r <= t) return i; } return 0; }
    for (var i = 0; i < N; i++) ps.push({ y: yolSec(), t: Math.random(), h: 0.8 + Math.random() * 0.4 });
    var st = { hiz: 0, gorunur: false };
    s.herKare(function (dt) {
      bulut.visible = st.gorunur;
      if (!st.gorunur) return;
      for (var i = 0; i < N; i++) {
        var q = ps[i], yl = YOLLAR[q.y];
        q.t += (st.hiz * 16 * q.h + 0.6) * dt / yl.L;
        if (q.t >= 1) { q.y = yolSec(); q.t = 0; }
        yl.e.getPointAt(q.t, p);
        konum[i * 3] = p.x; konum[i * 3 + 1] = p.y; konum[i * 3 + 2] = p.z;
        var k = Math.max(0, Math.min(1, (q.t - (q.y === 4 ? 0.15 : 0.32)) / 0.5));
        c.copy(soguk).lerp(sicak, k);
        renkler[i * 3] = c.r; renkler[i * 3 + 1] = c.g; renkler[i * 3 + 2] = c.b;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    });
    return st;
  }
  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [-1, 0.3, 0.5], pay: 0.84, hedefOfset: [0, 0, 1] } });
    var kasa = bilgisayar();
    s.ekle(kasa);
    s.yerlestir();
    ledAyarla(kasa, true);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.45, maxPolar: 1.5, minYakin: 0.5, maxYakin: 1.3 } });
    var fan = fanlar(s, kasa), hava = havaAkisi(s), termo = termometre(s), mesaj = DERS.sahneMesaj(s);
    var st = { T: 33, fanAcik: false, basladi: false };
    s.herKare(function (dt) {
      var hedef = !st.basladi ? 33 : (st.fanAcik ? 33 : 52);
      var tau = AZ ? 0.15 : (hedef > st.T ? 2.2 : 1.6);
      st.T += (hedef - st.T) * (1 - Math.exp(-dt / tau));
      termo(st.T);
    });
    termo(st.T);
    var capaOn = capa(kasa, [-4, 40, 23]), capaArka = capa(kasa, [-2, 40, -24]);
    var etk = [];
    function etiketle() {
      if (etk.length) return;
      etk.push(s.etiket(capaOn, 'Serin hava girer', { tur: 'odak', yer: 'merkez' }));
      etk.push(s.etiket(capaArka, 'Sıcak hava çıkar', { tur: 'hata', yer: 'merkez' }));
    }
    var bOn, bArka, bFan;
    function tahmin(onden) {
      if (st.basladi) return;
      st.basladi = true; st.fanAcik = true;
      bOn.hidden = true; bArka.hidden = true; bFan.hidden = false;
      hava.gorunur = true; hava.hiz = 1;
      fan.ayarla(9, 1);
      etiketle();
      mesaj(onden ? '✔ Doğru! Serin hava önden girer, ısınıp arkadan çıkar.' : '✗ Aslında serin hava önden girer; ısınan hava arkadan çıkar.', onden ? 'dogru' : 'yanlis');
    }
    bOn = s.dugme('Önden', null, function () { tahmin(true); }, { yer: 'alt-orta', aciklama: 'Tahmin: serin hava önden girer' });
    bArka = s.dugme('Arkadan', null, function () { tahmin(false); }, { yer: 'alt-orta', aciklama: 'Tahmin: serin hava arkadan girer' });
    bFan = s.dugme('Fanları durdur', null, function () {
      st.fanAcik = !st.fanAcik;
      fan.ayarla(st.fanAcik ? 9 : 0, 1.2);
      D.tween({ sahne: s, sure: 1.2, anahtar: 'hava', hedef: hava, guncelle: function (e) { hava.hiz = st.fanAcik ? e : 1 - e; } });
      bFan.querySelector('span').textContent = st.fanAcik ? 'Fanları durdur' : 'Fanları çalıştır';
      mesaj(st.fanAcik ? 'Fanlar çalışıyor: sıcak hava dışarı atılıyor, kasa serinliyor.' : 'Fanlar durdu: sıcak hava içeride kalıyor, kasa ısınıyor.', st.fanAcik ? 'dogru' : 'yanlis');
    }, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Fanları durdur ya da çalıştır' });
    bFan.hidden = true;
    mesaj('Tahmin et: Serin hava kasaya nereden girer?', '');
  });

  /* ─────────── Adım 6: A-PATLAT — tüm bilgisayar ayrışır, sonra yerine döner ─────────── */
  D.tembel('#s9-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [-1, 0.42, 0.66], pay: 0.8 } });
    var kasa = bilgisayar();
    s.ekle(kasa);
    var p = kasa.userData.parca;
    ledAyarla(kasa, true);
    var PAR = [
      { n: p.psu, o: [-19, -1.2, -5], ad: 'Güç kaynağı', ek: { yer: 'merkez', ofset: [0, 6.5, 0] } },
      { n: p.gpu, o: [-21, 0, 3], ad: 'Ekran kartı', ek: { yer: 'merkez', ofset: [0, -5, 4] } },
      { n: p.sog, o: [-17, 6, 1], ad: 'İşlemci soğutucusu', ek: {} },
      { n: p.ramlar[0], o: [0, 12, 0], ad: 'RAM', ek: { yer: 'merkez', ofset: [0, 3, -3] } },
      { n: p.ramlar[1], o: [0, 12, 0] },
      { n: p.ssd, o: [-15, 0, 12], ad: 'Disk (SSD)', ek: { yer: 'merkez', ofset: [0, 3.5, 0] } },
      { n: p.onFanlar[0], o: [0, 0, 11], ad: 'Ön fanlar', ek: { yer: 'merkez', ofset: [0, 8, 0] } },
      { n: p.onFanlar[1], o: [0, 0, 11] },
      { n: p.arkaFan, o: [0, 0, -12], ad: 'Arka fan', ek: { yer: 'merkez', ofset: [0, 8, 0] } }
    ];
    PAR.forEach(function (x) { x.b = x.n.position.clone(); x.o = new V3().fromArray(x.o); });
    var oran = 0;
    function uygula(o) {
      oran = o;
      PAR.forEach(function (x) { x.n.position.copy(x.b).addScaledVector(x.o, o); });
      p.kablolar.visible = o < 0.02;
    }
    uygula(1); s.yerlestir(); uygula(0);
    var fan = fanlar(s, kasa);
    fan.ayarla(6, 0);
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.45, maxPolar: 1.5, minYakin: 0.5, maxYakin: 1.3 } });
    D.bilgi(s, ['M-PSU', 'M-GPU', 'islemci-sogutucu', 'ram-1', 'ram-2', 'depolama', 'on-fan-1', 'on-fan-2', 'arka-fan', 'anakart']);
    var mesaj = DERS.sahneMesaj(s), etk = [], mesgul = false;
    function temizle() { etk.forEach(function (e) { e.kaldir(); }); etk = []; }
    function patlat(ac) {
      if (mesgul || (ac ? oran > 0.99 : oran < 0.01)) return Promise.resolve();
      mesgul = true; temizle();
      var o0 = oran;
      if (!ac) mesaj('Parçalar yerine dönüyor…', '');
      return D.tween({ sahne: s, sure: 1.3, anahtar: 'patlat', hedef: kasa, guncelle: function (e) { uygula(o0 + ((ac ? 1 : 0) - o0) * e); } })
        .then(function () {
          mesgul = false;
          bA.querySelector('span').textContent = ac ? 'Birleştir' : 'Ayır';
          if (ac) {
            PAR.forEach(function (x) { if (x.ad) etk.push(s.etiket(x.n, x.ad, Object.assign({ tur: 'vurgu' }, x.ek))); });
            etk.push(s.etiket(p.anakart, 'Anakart', { tur: 'odak', yer: 'merkez', ofset: [-1, 8, -4] }));
            mesaj('Her parçanın bir görevi var. Bir parçaya dokun.', '');
          } else mesaj('✔ Hepsi yerinde: anakart üzerinden birlikte çalışıyorlar.', 'dogru');
        });
    }
    var bA = s.dugme('Ayır', null, function () { patlat(oran < 0.5); }, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Bilgisayarı parçalarına ayır ya da birleştir' });
    mesaj('Bilgisayar birazdan parçalarına ayrılacak.', '');
    D.bekle(0.9, s).then(function () { return patlat(true); }).then(function () { return D.bekle(4.5, s); })
      .then(function () { if (oran > 0.99 && !mesgul) return patlat(false); });
  });

  /* ─────────── Etkinlik 1: E-SANAL-MONTAJ — parçaları yan yatırılmış kasadaki yerlerine sürükle ─────────── */
  D.tembel('#s10-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false,
      kamera: { yon: [0.06, 1.2, 1], pay: 0.94, hedefOfset: [0, -2, 1] } });
    var kasa = bilgisayar();
    var o = kasa.userData.olcu;
    kasa.rotation.z = -Math.PI / 2;                    // yan yatır: açık yan yukarı, anakart altta, kasanın üstü +X
    kasa.position.set(-o.H / 2, o.W / 2, 0);
    s.ekle(kasa);
    var p = kasa.userData.parca;
    p.kablolar.visible = false;
    p.ramlar[1].visible = false;
    var fan = fanlar(s, kasa);
    var PAR = [
      { id: 'psu', ad: 'Güç kaynağı', n: p.psu, no: 4, tepsi: [8, 0, 31], q: [0, -Math.PI / 2, 0],
        dogru: 'Güç kaynağı alta, arkaya yerleşti. İçi asla açılmaz; yalnız kabloları takılır.',
        ipucu: 'Güç kaynağı kasanın en altına, arkaya yerleşir; priz girişi arkadan görünmeli.' },
      { id: 'gpu', ad: 'Ekran kartı', n: p.gpu, no: 3, tepsi: [-14, 0, 31], q: [-Math.PI / 2, 0, 0],
        dogru: 'Ekran kartı PCIe yuvasına oturdu; görüntü çıkışları arkada.',
        ipucu: 'Ekran kartı anakarttaki uzun PCIe yuvasına takılır.' },
      { id: 'ram', ad: 'RAM', n: p.ramlar[0], no: 1, tepsi: [-16, 0, 43], q: [-Math.PI / 2, 0, 0], yuva: kasa.userData.yuvalar[1],
        dogru: 'RAM yuvasına oturdu; mandallar kapandı.',
        ipucu: 'RAM, işlemcinin yanındaki ince uzun yuvaya takılır.' },
      { id: 'sog', ad: 'İşlemci soğutucusu', n: p.sog, no: 2, tepsi: [24, 0, 31], q: [0, 0, 0],
        dogru: 'Soğutucu işlemcinin üstüne oturdu.',
        ipucu: 'Soğutucu işlemcinin tam üstüne oturur.' },
      { id: 'ssd', ad: 'Disk (SSD)', n: p.ssd, no: 5, tepsi: [2, 0, 43], q: [0, 0, 0],
        dogru: 'Disk ön-alttaki kızağa yerleşti.',
        ipucu: 'Disk, kasanın önündeki alt kızağa yerleşir.' },
      { id: 'fan', ad: 'Kasa fanı', n: p.arkaFan, no: 6, tepsi: [18, 0, 43], q: [-Math.PI / 2, 0, 0],
        dogru: 'Kasa fanı arkaya takıldı: sıcak havayı dışarı atacak.',
        ipucu: 'Bu fan kasanın arka duvarına takılır; sıcak havayı dışarı atar.' }
    ];
    s.kok.updateMatrixWorld(true);
    var kutu = new THREE.Box3(), vc = new V3(), vs = new V3();
    var accent = new THREE.Color(D.vurguRengi(kap));
    var bolgeler = [];
    PAR.forEach(function (x, i) {
      x.i = i;
      x.ebeveyn = x.n.parent;
      x.hPos = x.n.position.clone(); x.hQuat = x.n.quaternion.clone();
      // hedef bölge (dünya): takılı parçanın kutusu, en az 3 cm genişlikte
      kutu.setFromObject(x.n); kutu.getCenter(vc); kutu.getSize(vs);
      vs.x = Math.max(vs.x, 3.2); vs.z = Math.max(vs.z, 3.2); vs.y = Math.max(vs.y, 1.5);
      var bm = new THREE.Mesh(new THREE.BoxGeometry(vs.x, vs.y, vs.z), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, depthWrite: false }));
      bm.material.toneMapped = false;
      bm.position.copy(vc); bm.userData.secilmez = true; bm.userData.bolge = i; bm.renderOrder = 5;
      var hat = new THREE.LineSegments(new THREE.EdgesGeometry(bm.geometry), new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0 }));
      hat.raycast = function () {};
      bm.add(hat);
      s.scene.add(bm);
      bolgeler.push({ m: bm, hat: hat, x: x });
    });
    // parçaları masaya (tepsi) al
    function tepsiPoz(x) {
      x.tQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(x.q[0], x.q[1], x.q[2]));
      x.n.position.set(0, 0, 0); x.n.quaternion.copy(x.tQuat); x.n.updateMatrixWorld(true);
      kutu.setFromObject(x.n); kutu.getCenter(vc);
      x.tPos = new V3(x.tepsi[0] - vc.x, -kutu.min.y + 0.05, x.tepsi[2] - vc.z);
    }
    PAR.forEach(function (x) {
      s.kok.attach(x.n);
      tepsiPoz(x);
      x.n.position.copy(x.tPos);
      x.yerlesti = false;
    });
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.2, maxPolar: 1.25, minYakin: 0.5, maxYakin: 1.3 } });
    var mesaj = DERS.sahneMesaj(s), ilerle = DERS.ilerlemeBagla('ilerleme-1');
    // numara etiketleri (tıklanabilir)
    var noEt = bolgeler.map(function (b) {
      var e = s.etiket(b.m, String(b.x.no), { tur: 'harf', yer: 'merkez' });
      e.el.classList.add('mt-no');
      e.el.setAttribute('role', 'button');
      e.el.setAttribute('aria-label', b.x.no + ' numaralı yer');
      e.el.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
      e.el.addEventListener('click', function (ev) { ev.stopPropagation(); if (secili) dene(secili, b.x.i); });
      e.goster(false);
      return e;
    });
    // sol paneldeki parça düğmeleri
    var tepsiEl = document.getElementById('mt-tepsi'), tepsiB = {};
    PAR.forEach(function (x) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mt-sec';
      b.innerHTML = '<span class="mt-isaret" aria-hidden="true"></span><span>' + x.ad + '</span>';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { if (!x.yerlesti && !mesgul) sec(secili === x ? null : x); });
      if (tepsiEl) tepsiEl.appendChild(b);
      tepsiB[x.id] = b;
    });
    var secili = null, mesgul = false, biten = 0, LIFT = o.W + 4;
    function bolgeGoster(g, vurgu) {
      bolgeler.forEach(function (b, i) {
        var yer = b.x.yerlesti;
        b.m.material.opacity = g && !yer ? (vurgu === i ? 0.38 : 0.13) : 0;
        b.hat.material.opacity = g && !yer ? (vurgu === i ? 1 : 0.7) : 0;
        noEt[i].goster(g && !yer);
      });
      D._donguBaslat();
    }
    function kaldir(x, aninda) {       // parçayı kasanın üst hizasının üstüne kaldır (kasanın üstünden taşınabilsin)
      x.n.updateMatrixWorld(true);
      kutu.setFromObject(x.n);
      var dy = LIFT - kutu.min.y;
      if (aninda) { x.n.position.y += dy; D._donguBaslat(); return Promise.resolve(); }
      return D.git(x.n, x.n.position.clone().add(new V3(0, dy, 0)), 0.3);
    }
    function sec(x, aninda) {
      if (secili && secili !== x && !secili.yerlesti) D.git(secili.n, secili.tPos.clone(), 0.35);
      secili = x;
      Object.keys(tepsiB).forEach(function (k) { tepsiB[k].setAttribute('aria-pressed', x && x.id === k ? 'true' : 'false'); });
      if (!x) { bolgeGoster(false); mesaj('Bir parça seç ya da sürükle.', ''); return; }
      kaldir(x, aninda);
      bolgeGoster(true);
      mesaj('“' + x.ad + '” seçildi. Numaralı yerlerden doğrusuna dokun ya da sürükle.', '');
    }
    function geriGonder(x) { return D.git(x.n, x.tPos.clone(), 0.5); }
    function dene(x, bi) {
      if (mesgul || x.yerlesti) return;
      mesgul = true;
      bolgeGoster(false);
      if (bi !== x.i) {
        D.ses('hata');
        mesaj('✗ ' + x.ipucu, 'yanlis');
        var n = x.n, bas = n.position.clone(), hedef = bolgeler[bi].m.position.clone();
        hedef.y = Math.max(bas.y, hedef.y + 6);
        D.git(n, hedef, 0.45).then(function () {
          var x0 = n.position.x;
          return D.tween({ sahne: s, sure: 0.45, ease: 'lineer', guncelle: function (e) { n.position.x = x0 + Math.sin(e * Math.PI * 6) * 0.9 * (1 - e); } });
        }).then(function () { return geriGonder(x); }).then(function () {
          mesgul = false; secili = null;
          tepsiB[x.id].setAttribute('aria-pressed', 'false');
        });
        return;
      }
      var hedefEb = x.ebeveyn;
      hedefEb.attach(x.n);
      var ustten = x.yuva ? x.hPos.clone().add(new V3(0, 5, 0)) : x.hPos.clone().add(new V3(-9, 0, 0));
      var q0 = x.n.quaternion.clone(), p0 = x.n.position.clone();
      D.tween({ sahne: s, sure: 0.7, guncelle: function (e) { x.n.position.lerpVectors(p0, ustten, e); x.n.quaternion.slerpQuaternions(q0, x.hQuat, e); } })
        .then(function () { return x.yuva ? x.yuva.userData.mandal(true, 0.25) : null; })
        .then(function () { return D.git(x.n, x.hPos.clone(), 0.5, 'easeOutCubic'); })
        .then(function () {
          D.ses('klik');
          return x.yuva ? x.yuva.userData.mandal(false, 0.22) : null;
        })
        .then(function () {
          x.yerlesti = true; mesgul = false; secili = null; biten++;
          var b = tepsiB[x.id];
          b.disabled = true; b.classList.add('tamam'); b.setAttribute('aria-pressed', 'false');
          ilerle(biten, PAR.length);
          if (biten === PAR.length) {
            mesaj('✔ Bütün parçalar yerinde! Şimdi fişi tak ve çalıştır.', 'dogru');
            bCal.hidden = false;
          } else mesaj('✔ ' + x.dogru, 'dogru');
        });
    }
    // Sürükle-bırak (yatay düzlemde) ve dokun-dokun
    var isin = new THREE.Raycaster(), duzlem = new THREE.Plane(new V3(0, 1, 0), 0), surukle = null, basXY = null, suruklendi = false;
    function ndc(e) { var r = kap.getBoundingClientRect(); return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
    function parcaBul(e) {
      isin.setFromCamera(ndc(e), s.kamera);
      var best = null, dist = 1e9;
      PAR.forEach(function (x) {
        if (x.yerlesti) return;
        var h = isin.intersectObject(x.n, true);
        if (h.length && h[0].distance < dist) { dist = h[0].distance; best = x; }
      });
      return best;
    }
    function bolgeBul(e) {
      isin.setFromCamera(ndc(e), s.kamera);
      var h = isin.intersectObjects(bolgeler.filter(function (b) { return !b.x.yerlesti; }).map(function (b) { return b.m; }), false);
      return h.length ? h[0].object.userData.bolge : -1;
    }
    function duzlemNoktasi(e, y) {
      isin.setFromCamera(ndc(e), s.kamera);
      duzlem.constant = -y;
      var q = new V3();
      return isin.ray.intersectPlane(duzlem, q) ? q : null;
    }
    function alttakiBolge(x) {   // parçanın merkezinin altındaki bölge (XZ)
      x.n.updateMatrixWorld(true);
      kutu.setFromObject(x.n); kutu.getCenter(vc);
      var en = -1, enD = 1e9;
      bolgeler.forEach(function (b, i) {
        if (b.x.yerlesti) return;
        var bp = b.m.position, g = b.m.geometry.parameters;
        var dx = Math.abs(vc.x - bp.x) - g.width / 2, dz = Math.abs(vc.z - bp.z) - g.depth / 2;
        var d = Math.max(dx, dz);
        if (d < 2.5 && d < enD) { enD = d; en = i; }
      });
      return en;
    }
    kap.addEventListener('pointerdown', function (e) {
      if (mesgul || e.button > 0) return;
      var x = parcaBul(e);
      if (!x) {
        if (secili) { var bi = bolgeBul(e); if (bi >= 0) { e.stopImmediatePropagation(); dene(secili, bi); } }
        return;
      }
      e.stopImmediatePropagation();
      if (secili !== x) sec(x, true);
      surukle = { id: e.pointerId, x: x };
      basXY = [e.clientX, e.clientY]; suruklendi = false;
      try { kap.setPointerCapture(e.pointerId); } catch (h) {}
      kap.classList.add('don3d--tasiyor');
    }, true);
    kap.addEventListener('pointermove', function (e) {
      if (!surukle || surukle.id !== e.pointerId) return;
      e.stopImmediatePropagation();
      if (!suruklendi && Math.hypot(e.clientX - basXY[0], e.clientY - basXY[1]) < 6) return;
      suruklendi = true;
      var x = surukle.x;
      var q = duzlemNoktasi(e, LIFT);              // parçanın merkezi imlecin altında kalsın
      if (!q) return;
      x.n.updateMatrixWorld(true); kutu.setFromObject(x.n); kutu.getCenter(vc);
      x.n.position.x += q.x - vc.x; x.n.position.z += q.z - vc.z;
      bolgeGoster(true, alttakiBolge(x));
    }, true);
    function birak(e) {
      if (!surukle || surukle.id !== e.pointerId) return;
      e.stopImmediatePropagation();
      var x = surukle.x;
      surukle = null;
      kap.classList.remove('don3d--tasiyor');
      if (!suruklendi) return;                       // yalnız dokunuldu: seçili kalır
      var bi = alttakiBolge(x);
      if (bi >= 0) dene(x, bi);
      else { bolgeGoster(true); mesaj('Parçayı kasadaki numaralı yerlerden birinin üstüne bırak.', ''); }
    }
    kap.addEventListener('pointerup', birak, true);
    kap.addEventListener('pointercancel', birak, true);
    kap.addEventListener('keydown', function (e) {
      if (!secili || mesgul) return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 6) {
        e.preventDefault(); e.stopPropagation();
        var bi = -1;
        bolgeler.forEach(function (b, i) { if (b.x.no === n) bi = i; });
        if (bi >= 0 && !bolgeler[bi].x.yerlesti) dene(secili, bi);
      }
    });
    // Çalıştır: kablolar takılır, enerji akar, fanlar döner
    var cizgiler = [];
    var bCal = s.dugme('Fişi tak ve çalıştır', 'oynat', function () {
      if (mesgul) return;
      mesgul = true; bCal.disabled = true;
      p.kablolar.visible = true;
      mesaj('Kablolar takıldı. Enerji güç kaynağından parçalara akıyor…', '');
      var RENK = { gpu: '#facc15', islemci: '#facc15', anakart: '#fb923c', ssd: '#f87171' };
      Promise.all(Object.keys(RENK).map(function (k) {
        var yolD = dunyaya(kasa, kasa.userData.yol[k]);
        return D.akis(s, yolD, { renk: RENK[k], hiz: 26, boyut: 5 }).then(function () { cizgiler.push(enerjiCizgisi(s, yolD, RENK[k])); });
      })).then(function () {
        fan.ayarla(9, 1.2); ledAyarla(kasa, true);
        mesaj('✔ Bilgisayar çalıştı! Parçalar birlikte çalışıyor.', 'dogru');
        DERS.konfeti();
        mesgul = false;
      });
    }, { yer: 'alt-orta', sinif: 'don3d-dugme--birincil', aciklama: 'Kabloları tak, fişi tak ve bilgisayarı çalıştır' });
    bCal.hidden = true;
    s.dugme('Baştan', 'tekrar', function () {
      if (mesgul) return;
      cizgiler.forEach(function (m) { s.scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
      cizgiler = [];
      fan.ayarla(0, 0); ledAyarla(kasa, false);
      p.kablolar.visible = false;
      PAR.forEach(function (x) {
        s.kok.attach(x.n);
        x.n.quaternion.copy(x.tQuat); x.n.position.copy(x.tPos);
        x.yerlesti = false;
        tepsiB[x.id].disabled = false; tepsiB[x.id].classList.remove('tamam'); tepsiB[x.id].setAttribute('aria-pressed', 'false');
      });
      secili = null; biten = 0; ilerle(0, PAR.length);
      bCal.hidden = true; bCal.disabled = false;
      bolgeGoster(false);
      mesaj('Bir parça seç ya da sürükle.', '');
    }, { yer: 'ust-sag', aciklama: 'Etkinliği baştan başlat' });
    mesaj('Bir parça seç ya da sürükle.', '');
  });

  /* ─────────── Etkinlik 2: tümleşik mi, harici mi? (E-SINIFLA) ─────────── */
  D.tembel('#sinifla-gpu', function (kap) {
    D.sinifla(kap, {
      onIlerleme: DERS.ilerlemeBagla('ilerleme-2'),
      kutular: [
        { id: 'tumlesik', ad: 'Tümleşik yeter', aciklama: 'İşlemcinin içindeki kart', renk: '#0ea5e9', resim: '<!--@dahil:kutu-tumlesik.svg-->' },
        { id: 'harici', ad: 'Harici kart gerekir', aciklama: 'Güçlü, ayrı ekran kartı', renk: '#8b5cf6', resim: '<!--@dahil:kutu-harici.svg-->' }
      ],
      ogeler: [
        { id: 'odev', ad: 'Ödev yazmak', svg: '<!--@dahil:is-odev.svg-->', kutu: 'tumlesik', ipucu: 'Yazı yazmak çok az görüntü gücü ister; tümleşik kart yeter.' },
        { id: 'oyun', ad: 'Yüksek ayarda 3D oyun', svg: '<!--@dahil:is-oyun.svg-->', kutu: 'harici', ipucu: 'Yeni 3D oyunlar saniyede onlarca kare çizer; güçlü harici kart ister.' },
        { id: 'video', ad: 'Film izlemek', svg: '<!--@dahil:is-video.svg-->', kutu: 'tumlesik', ipucu: 'Film izlemek için tümleşik kart yeterlidir.' },
        { id: 'animasyon', ad: '3D animasyon film yapmak', svg: '<!--@dahil:is-animasyon.svg-->', kutu: 'harici', ipucu: '3D animasyonda milyonlarca üçgen hesaplanır; harici kart gerekir.' },
        { id: 'arastirma', ad: 'İnternette araştırma', svg: '<!--@dahil:is-arastirma.svg-->', kutu: 'tumlesik', ipucu: 'Web sayfalarını göstermek için tümleşik kart yeter.' },
        { id: 'vr', ad: 'Sanal gerçeklik gözlüğü', svg: '<!--@dahil:is-vr.svg-->', kutu: 'harici', ipucu: 'Sanal gerçeklik iki göz için ayrı ve çok hızlı görüntü ister; harici kart gerekir.' },
        { id: 'sunum', ad: 'Sunum hazırlamak', svg: '<!--@dahil:is-sunum.svg-->', kutu: 'tumlesik', ipucu: 'Sunum hazırlamak için tümleşik kart yeterlidir.' },
        { id: 'mimari', ad: 'Binanın 3D modelini çizmek', svg: '<!--@dahil:is-mimari.svg-->', kutu: 'harici', ipucu: 'Büyük 3D modelleri akıcı döndürmek güçlü harici kart ister.' }
      ],
      bitisMetni: 'Harika! Hangi işin güçlü bir ekran kartı istediğini ayırt ettin.'
    });
  });

  /* ─────────── Derinleş: boyama yarışı — 4 çekirdek mi, binlerce çekirdek mi? (2D) ─────────── */
  (function () {
    var kok = document.getElementById('boya');
    if (!kok) return;
    kok.innerHTML = '<div class="by-sahne illu-orta"></div><div class="tm-alt"><div class="secici"></div><div class="panel-sonuc" aria-live="polite"></div></div>';
    var sahne = kok.querySelector('.by-sahne'), sonuc = kok.querySelector('.panel-sonuc');
    var svg = svgEl('svg', { viewBox: '0 0 360 220', role: 'img', 'class': 'by', 'aria-label': 'Aynı şekil iki yerde boyanıyor: solda işlemci 4 üçgeni birden, sağda ekran kartı tüm üçgenleri aynı anda boyuyor' }, sahne);
    svg.innerHTML = '<defs><linearGradient id="byBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#faf5ff"/><stop offset="1" stop-color="#ede9fe"/></linearGradient></defs>' +
      '<rect width="360" height="220" rx="16" fill="url(#byBg)"/>' +
      '<rect x="10" y="10" width="164" height="200" rx="12" fill="#fff" stroke="#ddd6fe"/><rect x="186" y="10" width="164" height="200" rx="12" fill="#fff" stroke="#ddd6fe"/>' +
      '<text x="92" y="30" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="900" fill="#1e293b" text-anchor="middle">İşlemci</text>' +
      '<text x="92" y="44" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="700" fill="#64748b" text-anchor="middle">4 büyük çekirdek</text>' +
      '<text x="268" y="30" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="900" fill="#1e293b" text-anchor="middle">Ekran kartı</text>' +
      '<text x="268" y="44" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="700" fill="#64748b" text-anchor="middle">binlerce küçük çekirdek</text>';
    // Çekirdek simgeleri
    var cek = '';
    for (var i = 0; i < 4; i++) cek += '<rect x="' + (64 + i * 14) + '" y="52" width="11" height="11" rx="2" fill="#0ea5e9"/>';
    for (i = 0; i < 48; i++) cek += '<rect x="' + (220 + (i % 16) * 4.3) + '" y="' + (51 + Math.floor(i / 16) * 4.3) + '" width="3.4" height="3.4" rx="0.6" fill="#8b5cf6"/>';
    svg.insertAdjacentHTML('beforeend', cek);
    // Düşük poligonlu dağ + güneş: üçgen ızgarası (her panelde aynı)
    var UCGEN = [], X0 = 31, Y0 = 70, CW = 17.5, RH = 23;
    var tepe = [0.2, 0.55, 0.95, 0.6, 0.35, 0.8, 0.45, 0.15];
    function nokta(c, r) { var h = r === 0 ? tepe[c] : 0; return [X0 + c * CW, Y0 + r * RH + (r === 0 ? (1 - h) * 34 : 0) + (r === 0 ? 0 : 34)]; }
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 7; c++) {
        var a = nokta(c, r), b2 = nokta(c + 1, r), cc = nokta(c, r + 1), d = nokta(c + 1, r + 1);
        UCGEN.push([a, b2, d, r, 0]); UCGEN.push([a, d, cc, r, 1]);
      }
    }
    var RENK = ['#10b981', '#059669', '#65a30d', '#4d7c0f', '#a16207', '#854d0e'];
    var gruplar = [0, 176].map(function (dx) {
      var g = svgEl('g', { transform: 'translate(' + dx + ' 0)' }, svg);
      return UCGEN.map(function (u, k) {
        return svgEl('polygon', { points: u.slice(0, 3).map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '),
          fill: '#f1f5f9', stroke: '#94a3b8', 'stroke-width': 0.6, 'data-renk': RENK[(u[3] * 2 + u[4] + k) % RENK.length] }, g);
      });
    });
    var sayac = [svgEl('text', { x: 92, y: 200, 'font-family': 'Inter,Arial,sans-serif', 'font-size': 11, 'font-weight': 900, fill: '#0f172a', 'text-anchor': 'middle' }, svg),
      svgEl('text', { x: 268, y: 200, 'font-family': 'Inter,Arial,sans-serif', 'font-size': 11, 'font-weight': 900, fill: '#0f172a', 'text-anchor': 'middle' }, svg)];
    var calisiyor = false;
    function sifirla() {
      gruplar.forEach(function (g) { g.forEach(function (pl) { pl.setAttribute('fill', '#f1f5f9'); }); });
      sayac[0].textContent = 'Boyama adımı: 0'; sayac[1].textContent = 'Boyama adımı: 0';
    }
    function oyna() {
      if (calisiyor) return;
      calisiyor = true; sifirla();
      sonuc.className = 'panel-sonuc'; sonuc.textContent = 'Boyama başladı: ' + UCGEN.length + ' üçgen…';
      var adim = 0, TOPLAM = Math.ceil(UCGEN.length / 4);
      gruplar[1].forEach(function (pl) { pl.setAttribute('fill', pl.getAttribute('data-renk')); });
      sayac[1].textContent = '✓ Boyama adımı: 1';
      (function tur() {
        for (var k = adim * 4; k < Math.min(UCGEN.length, adim * 4 + 4); k++) gruplar[0][k].setAttribute('fill', gruplar[0][k].getAttribute('data-renk'));
        adim++;
        sayac[0].textContent = (adim >= TOPLAM ? '✓ ' : '') + 'Boyama adımı: ' + adim;
        if (adim < TOPLAM) { setTimeout(tur, AZ ? 0 : 240); return; }
        calisiyor = false;
        sonuc.className = 'panel-sonuc iyi';
        sonuc.textContent = 'Ekran kartı ' + UCGEN.length + ' üçgeni 1 adımda boyadı; işlemci ' + TOPLAM + ' adımda.';
      })();
    }
    var bt = DERS.dugme(kok.querySelector('.secici'), '', oyna, 'h9-oynat');
    bt.innerHTML = D.simge('oynat') + '<span>Boyamayı başlat</span>';
    sifirla();
    sonuc.textContent = 'Aynı şekil iki yerde boyanacak. Hangisi önce bitirir?';
    DERS.slaytAcilinca('s12', function () { bekle(0.8).then(oyna); });
  })();
})();
