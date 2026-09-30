/* DON-201 H04 — Güvenli Çalışma · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var K = D.kit, THREE = K.THREE, V3 = K.V3;
  DERS.tahminKur('Tahminini aldık. Adım 2’de fişi çekince göreceğiz.');

  /* ─────────── Kapak: bileklik, RAM, güç kaynağı ─────────── */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 40, kamera: { yon: [0.6, 0.75, 1], pay: 0.72 } });
    s.ekle('M-PSU', { konum: [8, 0, -4], donus: [0, -0.5, 0], modelOps: { kablosuz: true } });
    var r = s.ekle('M-RAM', { konum: [-8, 0.6, 6], donus: [-Math.PI / 2, 0, 0.3] });
    s.ekle('M-ANTISTATIK-BILEKLIK', { konum: [-12, 0.6, -6], modelOps: { klipsX: 12, klipsZ: 6 } });
    s.yerlestir();
    r.position.y = 0.2;
  });

  /* ─────────── Adım 1: tehlike → kural kartları ─────────── */
  (function () {
    var kok = document.getElementById('kural-kartlari');
    if (!kok) return;
    var KART = [
      { svg: '<!--@dahil:tehlike-elektrik.svg-->', tehlike: 'Elektrik çarpabilir', kural: 'Fişi çek', neden: 'Fiş takılıyken kasanın içinde elektrik vardır.' },
      { svg: '<!--@dahil:tehlike-statik.svg-->', tehlike: 'Parça bozulabilir', kural: 'Bileklik tak', neden: 'Vücudundaki statik elektrik çipleri bozabilir.' },
      { svg: '<!--@dahil:tehlike-daginik.svg-->', tehlike: 'Vida kaybolur, el kesilir', kural: 'Düzenli çalış', neden: 'Vidalar kaba, aletler yerine. Masa düzenli olur.' }
    ];
    var izgara = D.div('kk-izgara', kok);
    var sonuc = D.div('panel-sonuc', kok);
    sonuc.setAttribute('aria-live', 'polite');
    var cevrilen = 0;
    KART.forEach(function (k, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'kk-kart';
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="kk-ic"><span class="kk-on"><span class="kk-resim">' + k.svg + '</span><b></b><small>Tehlike · çevir</small></span>' +
        '<span class="kk-arka"><span class="kk-no">' + (i + 1) + '</span><b></b><span></span></span></span>';
      b.querySelector('.kk-on b').textContent = k.tehlike;
      b.querySelector('.kk-arka b').textContent = k.kural;
      b.querySelector('.kk-arka > span:last-child').textContent = k.neden;
      b.addEventListener('click', function () {
        var acik = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', acik ? 'true' : 'false');
        cevrilen += acik ? 1 : -1;
        sonuc.textContent = cevrilen === 3 ? 'Üç tehlike, üç kural: güvenli atölye!' : cevrilen + ' / 3 kural açıldı';
      });
      izgara.appendChild(b);
    });
    sonuc.textContent = '0 / 3 kural açıldı';
  })();

  /* ─────────── Adım 2: A-BOSALT — kapat, fişi çek, düğmeye basılı tut ─────────── */
  D.tembel('#s5-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-1, 0.32, 0.55], pay: 0.74 } });
    var kasa = s.ekle('M-MASAUSTU');
    var fisM = s.ekle('M-GUC-FISI', { konum: [-24, 16, -30], modelOps: { kabloSon: [24, -10, 8.6] } });
    // İç ışıklar: anakart bekleme ışığı (yeşil) ve kasa içi şerit ışık
    var bekleme = K.led('#22c55e', 2.4), serit = K.led('#a78bfa', 1.6);
    var bl = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), bekleme);
    K.parca(bl, 'bekleme-isigi', 'Bekleme ışığı', 'Fiş takılıyken anakartta elektrik olduğunu gösterir.');
    K.koy(kasa, bl, 9.1, 14.2, 3);
    K.koy(kasa, K.kutu(0.4, 0.4, 34, serit), 1, 43.2, 0).userData.secilmez = true;
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.6, maxPolar: 1.45, minYakin: 0.5, maxYakin: 1.3 } });
    var guc = s.parca('guc-isigi').material, dugme = s.parca('guc-dugmesi'), disk = s.parca('disk-isigi').material;
    var fanlar = kasa.userData.fanlar, fanHiz = 1;
    s.herKare(function (dt) { fanlar.forEach(function (r) { r.rotation.z += fanHiz * 14 * dt; }); });
    var mesaj = DERS.sahneMesaj(s), etiket = null;
    function isik(e) { guc.emissiveIntensity = 1.6 * e; serit.emissiveIntensity = 1.6 * e; disk.emissiveIntensity = 0.25 * e; }
    var d1, d2, d3, durum = 0;
    function etkin() { d1.disabled = durum !== 0; d2.disabled = durum !== 1; d3.disabled = durum !== 2; }
    function etiketKoy(n, m, tur) { if (etiket) etiket.kaldir(); etiket = n ? s.etiket(n, m, { tur: tur || 'vurgu' }) : null; }
    function kapat() {
      durum = -1; etkin();
      D.tween({ sahne: s, sure: AZ ? 0.01 : 1.2, guncelle: function (e) { isik(1 - e); fanHiz = 1 - e; } }).then(function () {
        durum = 1; etkin();
        etiketKoy(bl, 'Hâlâ elektrik var', 'hata');
        mesaj('Bilgisayar kapandı ama fiş takılı: yeşil ışık hâlâ yanıyor.', 'yanlis');
      });
    }
    function fisCek() {
      durum = -1; etkin();
      fisM.userData.cek(AZ ? 0.01 : 1).then(function () {
        durum = 2; etkin();
        etiketKoy(fisM.userData.fis, 'Fiş çekildi', 'dogru');
        mesaj('Fiş çekildi. İçeride biraz elektrik kaldı: ışık sönük yanıyor.', '');
        bekleme.emissiveIntensity = 0.9;
      });
    }
    function bosalt() {
      durum = -1; etkin();
      etiketKoy(dugme, '5 saniye basılı tut', 'vurgu');
      var y0 = dugme.position.y;
      dugme.position.y = y0 - 0.25;
      var sayac = 5;
      (function say() {
        mesaj('Güç düğmesine basılı tutuluyor… ' + sayac, '');
        if (sayac-- > 1) { D.bekle(AZ ? 0.05 : 0.55, s).then(say); return; }
        D.tween({ sahne: s, sure: AZ ? 0.01 : 0.9, guncelle: function (e) { bekleme.emissiveIntensity = 0.9 * (1 - e); fanHiz = Math.sin(e * Math.PI) * 0.5; } }).then(function () {
          dugme.position.y = y0; fanHiz = 0; durum = 3; etkin();
          etiketKoy(bl, 'Elektrik boşaldı', 'dogru');
          mesaj(DERS.tahminNotu(1, 'Artık güvenle çalışabilirsin.', 'Önce fiş çekilir, elektrik boşaltılır. Artık güvenle çalışabilirsin.'), 'dogru');
        });
      })();
    }
    function sifirla() {
      if (durum === -1) return;
      fisM.userData.tak(0.01); isik(1); fanHiz = 1; bekleme.emissiveIntensity = 2.4; durum = 0; etkin();
      etiketKoy(null); mesaj('Bilgisayar açık, fiş takılı.', '');
    }
    d1 = s.dugme('Kapat', null, kapat, { yer: 'alt-orta', aciklama: 'Bilgisayarı kapat' });
    d2 = s.dugme('Fişi çek', null, fisCek, { yer: 'alt-orta', aciklama: 'Fişi prizden çek' });
    d3 = s.dugme('5 sn bas', null, bosalt, { yer: 'alt-orta', aciklama: 'Güç düğmesine beş saniye basılı tut' });
    s.dugme('Baştan', 'sifirla', sifirla, { yer: 'ust-sag', aciklama: 'Başa al' });
    sifirla();
  });

  /* ─────────── Adım 3: A-KIVILCIM (2D) ─────────── */
  (function () {
    var kok = document.getElementById('kivilcim');
    if (!kok) return;
    kok.innerHTML = '<div class="secici" role="group" aria-label="Bileklik"></div><div class="illu-orta kv-sahne"><!--@dahil:kivilcim.svg--></div>' +
      '<div class="kv-alt"><button type="button" class="kv-oynat"></button><div class="panel-sonuc" aria-live="polite"></div></div>';
    var svg = kok.querySelector('svg'), sonuc = kok.querySelector('.panel-sonuc'), oynat = kok.querySelector('.kv-oynat');
    oynat.innerHTML = D.simge('oynat') + '<span>Oynat</span>';
    var yuruyen = svg.querySelector('.yuruyen'), artilar = svg.querySelectorAll('.arti');
    var bileklik = false, zaman = [];
    var modlar = {};
    function temizle() { zaman.forEach(clearTimeout); zaman = []; }
    function sifirla() {
      temizle();
      svg.setAttribute('class', 'kv' + (bileklik ? ' bileklikli' : ''));
      yuruyen.style.transition = 'none';
      yuruyen.style.transform = bileklik ? 'translate(215px,0)' : 'translate(20px,0)';
      artilar.forEach(function (a) { a.classList.toggle('gor', bileklik); });
      sonuc.textContent = bileklik ? 'Bileklik takılı ve kasaya bağlı.' : 'Halıda yürümeye hazır.';
      sonuc.className = 'panel-sonuc';
    }
    function sonra(sn, fn) { zaman.push(setTimeout(fn, AZ ? 10 : sn * 1000)); }
    function oyna() {
      sifirla();
      void yuruyen.getBoundingClientRect();
      if (!bileklik) {
        svg.classList.add('yuruyor');
        yuruyen.style.transition = AZ ? 'none' : 'transform 2.6s linear';
        yuruyen.style.transform = 'translate(215px,0)';
        artilar.forEach(function (a, i) { sonra(0.3 + i * 0.35, function () { a.classList.add('gor'); }); });
        sonuc.textContent = 'Yürürken vücut elektrik topluyor…';
        sonra(2.7, function () {
          svg.classList.remove('yuruyor'); svg.classList.add('kivilcim-var');
          artilar.forEach(function (a) { a.classList.remove('gor'); });
          D.ses('hata');
          sonuc.textContent = 'Çat! Kıvılcım atladı; çip bozuldu.'; sonuc.className = 'panel-sonuc kotu';
        });
      } else {
        svg.classList.add('akiyor');
        sonuc.textContent = 'Elektrik kablodan kasaya akıyor…';
        artilar.forEach(function (a, i) { sonra(0.3 + i * 0.28, function () { a.classList.remove('gor'); }); });
        sonra(2.2, function () {
          svg.classList.remove('akiyor'); svg.classList.add('guvenli');
          sonuc.textContent = 'Kıvılcım yok: RAM güvende.'; sonuc.className = 'panel-sonuc iyi';
        });
      }
    }
    var secici = kok.querySelector('.secici');
    [[false, 'Bilekliksiz'], [true, 'Bileklikli']].forEach(function (x) {
      modlar[x[1]] = DERS.dugme(secici, x[1], function () {
        bileklik = x[0];
        Object.keys(modlar).forEach(function (k) { modlar[k].setAttribute('aria-pressed', k === x[1] ? 'true' : 'false'); });
        sifirla();
      });
    });
    modlar.Bilekliksiz.setAttribute('aria-pressed', 'true'); modlar.Bileklikli.setAttribute('aria-pressed', 'false');
    oynat.addEventListener('click', oyna);
    sifirla();
    DERS.slaytAcilinca('s6', function () { sonra(0.6, oyna); });
  })();

  /* ─────────── Adım 4: doğru ve yanlış tutuş + bileklik bağlama ─────────── */
  function parmak(renk) {
    var g = new THREE.Group();
    var m = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 3.2, 6, 12), K.mat(renk || '#e0a77a', { roughness: 0.7 }));
    g.add(m);
    var tirnak = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), K.mat('#f0c7a4', { roughness: 0.4 }));
    tirnak.scale.set(1, 0.4, 1); K.koy(g, tirnak, 0, 1.9, 0.3);
    g.traverse(function (o) { o.userData.secilmez = true; });
    return g;
  }
  D.tembel('#s7-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.12, 0.55, 1], pay: 0.8, hedefOfset: [0, 0.5, 0] } });
    var R = D.RAM_OLCU;
    var ram = s.ekle('M-RAM', { konum: [0, 1.2, 0] });
    var bil = s.ekle('M-ANTISTATIK-BILEKLIK', { konum: [-8, 0.25, 9], olcek: 0.8, modelOps: { klipsX: 11, klipsZ: 3 } });
    var levha = K.kutu(7, 0.8, 4, 'aluminyum', 0.15);
    K.parca(levha, 'kasa-metal', 'Kasanın boyasız metali', 'Klips buraya takılır; elektrik kasaya akar.');
    K.koy(s.kok, levha, 9, 0.4, 9);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.5, maxPolar: 1.4, minYakin: 0.5, maxYakin: 1.4 } });
    var mesaj = DERS.sahneMesaj(s);
    var p1 = parmak(), p2 = parmak();
    s.kok.add(p1); s.kok.add(p2);
    p1.visible = p2.visible = false;
    var etiketler = [], mesgul = false;
    function temizle() {
      etiketler.forEach(function (e) { e.kaldir(); }); etiketler = [];
      D.vurguKaldir(ram.getObjectByName('temaslar'));
    }
    function tut(dogru) {
      if (mesgul) return; mesgul = true; temizle();
      var y = 1.2 + R.H / 2;
      p1.visible = p2.visible = true;
      if (dogru) {
        p1.rotation.set(0, 0, -Math.PI / 2); p2.rotation.set(0, 0, Math.PI / 2);
        p1.position.set(-R.L / 2 - 6, y, 0); p2.position.set(R.L / 2 + 6, y, 0);
        Promise.all([D.git(p1, new V3(-R.L / 2 - 2.3, y, 0), AZ ? 0.01 : 0.8), D.git(p2, new V3(R.L / 2 + 2.3, y, 0), AZ ? 0.01 : 0.8)]).then(function () {
          etiketler.push(s.etiket(p1, '✓ Kısa kenardan', { tur: 'dogru' }));
          mesaj('Doğru: parça kısa kenarlarından tutuldu.', 'dogru'); mesgul = false;
        });
      } else {
        p1.rotation.set(-Math.PI / 2, 0, 0); p2.rotation.set(Math.PI / 2, 0, 0);
        p1.position.set(-2, 1.6, 6); p2.position.set(-2, 1.6, -6);
        Promise.all([D.git(p1, new V3(-2, 1.6, 2.4), AZ ? 0.01 : 0.8), D.git(p2, new V3(-2, 1.6, -2.4), AZ ? 0.01 : 0.8)]).then(function () {
          var t = ram.getObjectByName('temaslar');
          D.vurgula(t, { renk: '#ef4444', etiket: false });
          etiketler.push(s.etiket(t, '✗ Altın temaslara dokunma', { tur: 'hata', yer: 'alt' }));
          D.ses('hata');
          mesaj('Yanlış: parmak yağı ve statik elektrik temasları bozar.', 'yanlis'); mesgul = false;
        });
      }
    }
    var klips = bil.userData.klips, bagli = false;
    function bagla() {
      if (mesgul) return; mesgul = true;
      var hedef = bagli ? bil.userData.klipsKonum.clone() : new V3(19, 0.9, 0);
      var bas = klips.position.clone();
      D.tween({ sahne: s, sure: AZ ? 0.01 : 1, guncelle: function (e) {
        klips.position.lerpVectors(bas, hedef, e);
        klips.position.y += Math.sin(e * Math.PI) * 3;
        bil.userData.kabloGuncelle();
      } }).then(function () {
        bagli = !bagli; mesgul = false;
        temizle();
        if (bagli) { etiketler.push(s.etiket(levha, '✓ Klips boyasız metalde', { tur: 'dogru' })); mesaj('Bileklik bağlandı: vücudundaki elektrik kasaya akar.', 'dogru'); }
        else mesaj('');
        bDugme.querySelector('span').textContent = bagli ? 'Klipsi çıkar' : 'Bilekliği bağla';
      });
    }
    s.dugme('Doğru tutuş', null, function () { tut(true); }, { yer: 'alt-orta', aciklama: 'Doğru tutuşu göster' });
    s.dugme('Yanlış tutuş', null, function () { tut(false); }, { yer: 'alt-orta', aciklama: 'Yanlış tutuşu göster' });
    var bDugme = s.dugme('Bilekliği bağla', null, bagla, { yer: 'alt-orta', aciklama: 'Bilekliğin klipsini kasanın metaline bağla' });
    D.bekle(0.8, s).then(function () { tut(true); });
  });

  /* ─────────── Adım 5: A-UYARI — asla açılmayanlar ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [0.2, 0.5, 1], pay: 0.74 } });
    var psu = s.ekle('M-PSU', { konum: [-17, 0, 0], donus: [0, 0.5, 0], modelOps: { kablosuz: true } });
    var pil = s.ekle('M-PIL', { konum: [0, 0, 3], donus: [-0.35, 0, 0], olcek: 1.7, modelOps: { sismis: true } });
    var crt = s.ekle('M-CRT', { konum: [18, 0, -2], donus: [0, -0.35, 0], olcek: 0.45 });
    pil.userData.isit(0.35);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.6, maxPolar: 1.4, minYakin: 0.5, maxYakin: 1.3 } });
    [psu, pil, crt].forEach(function (m) { s.etiket(m, '🔒 Asla açma', { tur: 'hata' }); });
    D.bilgi(s, ['M-PSU', 'M-PIL', 'M-CRT']);
    var mesaj = DERS.sahneMesaj(s);
    var NEDEN = {
      'M-PSU': 'Güç kaynağında fiş çekilse de tehlikeli elektrik kalabilir.',
      'M-PIL': 'Şişmiş pil yanabilir. Dokunma; bir yetişkine söyle.',
      'M-CRT': 'Tüplü monitörün içinde kapalıyken bile yüksek gerilim kalır.'
    };
    s.tiklaninca(function (p) {
      if (!p || !NEDEN[p.name]) return;
      D.uyari(p, { genlik: 0.8 });
      mesaj('⚠ ' + NEDEN[p.name], 'yanlis');
    });
    mesaj('Bir nesneye dokun.', '');
  });

  /* ─────────── Adım 6: vida düzeni (2D) ─────────── */
  (function () {
    var kok = document.getElementById('vida-duzen');
    if (!kok) return;
    kok.innerHTML = '<div class="illu-orta vd-sahne"><!--@dahil:vida-duzen.svg--></div><div class="kv-alt"><button type="button" class="kv-oynat"></button>' +
      '<div class="panel-sonuc">Kapak vidaları 1 numaralı kaba gider.</div></div>';
    var svg = kok.querySelector('svg'), b = kok.querySelector('.kv-oynat');
    b.innerHTML = D.simge('tekrar') + '<span>Tekrar oynat</span>';
    function oyna() { svg.classList.remove('oyna'); void svg.getBoundingClientRect(); svg.classList.add('oyna'); }
    b.addEventListener('click', oyna);
    DERS.slaytAcilinca('s9', oyna);
  })();

  /* ─────────── Etkinlik 1: E-DOGRU-YANLIS ─────────── */
  D.tembel('#dogru-yanlis', function (kap) {
    var bar = document.getElementById('ilerleme-1');
    D.dogruYanlis(kap, {
      sahneler: [
        { svg: '<!--@dahil:dy-1.svg-->', metin: 'Fişi takılıyken kasa açılıyor.', dogru: false, aciklama: 'Önce fiş çekilir. Fiş takılıyken içeride elektrik vardır.' },
        { svg: '<!--@dahil:dy-2.svg-->', metin: 'RAM kısa kenarlarından tutuluyor.', dogru: true, aciklama: 'Kenardan tutmak altın temasları ve çipleri korur.' },
        { svg: '<!--@dahil:dy-3.svg-->', metin: 'Bilekliğin klipsi kasanın boyasız metaline takılı.', dogru: true, aciklama: 'Böylece vücuttaki statik elektrik kasaya akar.' },
        { svg: '<!--@dahil:dy-4.svg-->', metin: 'Şişmiş pil bastırılarak düzeltilmeye çalışılıyor.', dogru: false, aciklama: 'Şişmiş pile dokunulmaz, bastırılmaz. Bir yetişkine haber verilir.' },
        { svg: '<!--@dahil:dy-5.svg-->', metin: 'Sökülen vidalar etiketli kaba konuyor.', dogru: true, aciklama: 'Vidalar karışmaz, kaybolmaz; toplarken kolay olur.' },
        { svg: '<!--@dahil:dy-6.svg-->', metin: 'Güç kaynağının kapağı tornavidayla açılıyor.', dogru: false, aciklama: 'Güç kaynağının içinde tehlikeli elektrik kalabilir. Asla açılmaz.' }
      ],
      onIlerleme: function (i, n) {
        bar.querySelector('.etk-ilerleme-sayi b').textContent = i;
        bar.querySelector('.etk-ilerleme-bar span').style.width = Math.round(i / n * 100) + '%';
      },
      onBitti: function (puan) { bar.classList.add('etk-ilerleme--bitti'); if (puan >= 5) DERS.konfeti(); }
    });
  });

  /* ─────────── Etkinlik 2: güvenlik sözleşmesi ─────────── */
  (function () {
    var kok = document.getElementById('sozlesme');
    if (!kok) return;
    var KURALLAR = [
      'Fiş çekilmeden kasayı açmam.',
      'Bilekliği takar, klipsi kasanın metaline bağlarım.',
      'Parçaları kenarlarından tutarım.',
      'Güç kaynağını, şişmiş pili ve tüplü monitörü asla açmam.',
      'Vidaları etiketli kaba koyarım.',
      'Bir sorun görürsem öğretmenime ya da güvendiğim bir yetişkine söylerim.'
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    kok.innerHTML = '<div class="sz"><div class="sz-liste" role="group" aria-label="Güvenlik kuralları"></div>' +
      '<div class="sz-imza"><label for="sz-ad">Adın</label><input id="sz-ad" type="text" maxlength="40" autocomplete="off" placeholder="Adını yaz">' +
      '<button type="button" class="sz-imzala" disabled>İmzala</button></div><div class="sz-kart" hidden></div></div>';
    var liste = kok.querySelector('.sz-liste'), ad = kok.querySelector('#sz-ad'), imzala = kok.querySelector('.sz-imzala'), kart = kok.querySelector('.sz-kart');
    var secim = KURALLAR.map(function () { return false; });
    function guncelle() {
      var n = secim.filter(Boolean).length;
      ilerle(n, KURALLAR.length);
      imzala.disabled = !(n === KURALLAR.length && ad.value.trim().length > 1);
    }
    KURALLAR.forEach(function (k, i) {
      var b = DERS.dugme(liste, '', function () {
        secim[i] = !secim[i]; b.setAttribute('aria-pressed', secim[i] ? 'true' : 'false'); guncelle();
      }, 'gk-madde sz-madde');
      b.innerHTML = '<span class="gk-kutu"></span><span></span>';
      b.lastChild.textContent = k;
      b.setAttribute('aria-pressed', 'false');
    });
    ad.addEventListener('input', guncelle);
    imzala.addEventListener('click', function () {
      var tarih = new Date().toLocaleDateString('tr-TR');
      kart.hidden = false;
      kart.innerHTML = '<div class="sz-kart-bas">Atölye Güvenlik Sözleşmesi</div><div class="sz-kart-ad"></div>' +
        '<div class="sz-kart-alt"><span>✓ 6 kuralı kabul etti</span><span></span></div>';
      kart.querySelector('.sz-kart-ad').textContent = ad.value.trim();
      kart.querySelector('.sz-kart-alt span:last-child').textContent = tarih;
      liste.hidden = true;
      imzala.textContent = 'İmzalandı'; imzala.disabled = true; ad.disabled = true;
      DERS.konfeti();
    });
    guncelle();
  })();
})();
