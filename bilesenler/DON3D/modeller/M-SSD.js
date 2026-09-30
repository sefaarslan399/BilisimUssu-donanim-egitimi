/* M-SSD — 2,5 inç SATA SSD (katı hal sürücüsü), marka yok.
   Ölçü birimi: cm (10 × 0,7 × 7; 100 × 7 × 69,85 mm). Orijin: alt-orta. Uzun kenar X, genişlik Z, kalınlık Y.
   Konnektörler −X kısa kenarında: 'sata-veri' (7 pin, L anahtarlı dil) ve 'sata-guc' (15 pin, L anahtarlı dil);
   L çıkıntıları iki dilin dış uçlarındadır (DOĞRULA: yön fotoğrafla karşılaştırılmalı; derste konum söylenmez).
   Her iki konnektör grubunun ağzı yerel +Z'ye (dışarı) bakar ve dünya −X'e döndürülmüştür (userData.sataVeri/sataGuc).
   Parçalar: 'ssd-kasa' (alt kasa), 'ssd-kapak' (üst kapak + etiket), 'ssd-kart' (devre kartı),
   'ssd-cip-0..n' (NAND bellek çipleri), 'ssd-denetleyici', 'ssd-onbellek' (DRAM), 'sata-veri', 'sata-guc'.
   ops: { acik: false (true: kapak menteşe gibi açılıp yanda ters yatar, iç görünüm), kapasite: '1 TB', cipSayisi: 4 }
   userData:
     cipler: [Mesh] — her çipin kendi malzemesi var; cipIsik(i, 0..1) ile yakılır (emissive).
     cipIsik(i, guc), hepsiniSondur()
     denetleyici: Mesh, denetleyiciIsik(guc)
     kapakAc(acik: bool, sure) → Promise (kapak kalkar / iner)
     sataVeri, sataGuc: konnektör grupları · olcu: {L, H, W}
   Paylaşılan yardımcı: DON3D.sataKonnektor(K, 'veri'|'guc', { ayna }) → THREE.Group (M-HDD de kullanır). */
(function (D) {
  'use strict';
  var L = 10.0, H = 0.7, W = 6.985;
  var PITCH = 0.127;

  /**
   * SATA aygıt konnektörü (sürücü tarafı): siyah gövde + L biçimli plastik dil + altın temaslar.
   * Yerel eksen: dil boyu X, dil kalınlığı Y, dışarı yönü +Z. Ağız (dil ucu) z = derinlik.
   * tur: 'veri' (7 pin) | 'guc' (15 pin). ops.ayna: L çıkıntısı −X ucunda (varsayılan +X ucunda).
   */
  D.sataKonnektor = function (K, tur, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var pin = tur === 'guc' ? 15 : 7;
    var boy = pin * PITCH + 0.16;                 // dil uzunluğu (veri ≈ 1,05 cm, güç ≈ 2,07 cm)
    var kal = 0.11, der = 0.46;                   // dil kalınlığı, dışarı çıkıntı
    var g = new THREE.Group();
    var siyah = K.mat('#15161a', { roughness: 0.55 });
    // Arka gövde (karta oturan kısım) ve iki yan kılavuz
    K.koy(g, K.kutu(boy + 0.24, 0.52, 0.2, siyah, 0.03), 0, 0.06, 0.1);
    K.koy(g, K.kutu(0.1, 0.52, der, siyah, 0.02), -(boy / 2 + 0.07), 0.06, der / 2 + 0.1);
    K.koy(g, K.kutu(0.1, 0.52, der, siyah, 0.02), boy / 2 + 0.07, 0.06, der / 2 + 0.1);
    // Dil + L çıkıntısı (önden bakınca L harfi)
    var dil = K.kutu(boy, kal, der, siyah, 0.015);
    K.koy(g, dil, 0, 0, der / 2 + 0.1);
    var ucX = (ops.ayna ? -1 : 1) * (boy / 2 - 0.055);
    K.koy(g, K.kutu(0.11, 0.3, der, siyah, 0.015), ucX, 0.13, der / 2 + 0.1);
    // Temaslar: dilin alt yüzünde, 1,27 mm aralıkla (güç ve topraklar uzun, diğerleri kısa)
    var temasGeo = K.geoPaylas('sata-temas', function () { return new THREE.BoxGeometry(0.07, 0.012, 0.34); });
    var konum = [];
    for (var i = 0; i < pin; i++) konum.push([-(pin - 1) / 2 * PITCH + i * PITCH, -kal / 2 - 0.006, der / 2 + 0.12]);
    var temas = K.ornekle(temasGeo, 'altin', konum);
    temas.userData.golgeYok = true;
    g.add(temas);
    g.userData.boy = boy;
    g.userData.pin = pin;
    return g;
  };

  D.modelTanimla('M-SSD', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-SSD', '2,5 inç SATA SSD', 'Veriyi bellek çiplerinde saklar; içinde dönen ya da hareket eden parça yoktur.');

    // Alt kasa (metal, açık gri) — içi boş tepsi: taban + dört duvar
    var kasa = new THREE.Group();
    K.parca(kasa, 'ssd-kasa', 'Kasa', 'Devre kartını korur. Sarsıntıya dayanıklıdır; içinde hareketli parça yoktur.');
    var kasaMat = K.mat('#8d949d', { roughness: 0.38, metalness: 0.75 });
    var tabanH = 0.08, duvar = 0.12, kasaH = H * 0.62;
    K.koy(kasa, K.kutu(L, tabanH, W, kasaMat, 0.04), 0, tabanH / 2, 0);
    K.koy(kasa, K.kutu(L, kasaH, duvar, kasaMat, 0.04), 0, kasaH / 2, W / 2 - duvar / 2);
    K.koy(kasa, K.kutu(L, kasaH, duvar, kasaMat, 0.04), 0, kasaH / 2, -W / 2 + duvar / 2);
    K.koy(kasa, K.kutu(duvar, kasaH, W, kasaMat, 0.04), L / 2 - duvar / 2, kasaH / 2, 0);
    // Konnektör tarafındaki duvar: konnektörlerin önü açık
    K.koy(kasa, K.kutu(duvar, kasaH, 1.0, kasaMat, 0.04), -L / 2 + duvar / 2, kasaH / 2, W / 2 - 0.5);
    K.koy(kasa, K.kutu(duvar, kasaH, 1.2, kasaMat, 0.04), -L / 2 + duvar / 2, kasaH / 2, -W / 2 + 0.6);
    // Yan vida delikleri (her yanda iki) ve alt dört delik
    var delikMat = K.mat('#1b1d21', { roughness: 0.7 });
    [-1, 1].forEach(function (yz) {
      [-L / 2 + 1.4, L / 2 - 1.8].forEach(function (x) {
        var d = K.silindir(0.16, 0.02, delikMat, 16);
        d.rotation.x = Math.PI / 2;
        K.koy(kasa, d, x, H * 0.3, yz * (W / 2 + 0.005));
      });
    });
    g.add(kasa);

    // Devre kartı + çipler
    var kart = new THREE.Group();
    K.parca(kart, 'ssd-kart', 'Devre kartı', 'Bellek çiplerini, denetleyiciyi ve SATA konnektörlerini taşıyan kart.');
    var kartL = 8.4, kartW = 6.2, kartY = tabanH + 0.12;
    var pcbDoku = K.canvasDoku(512, 384, function (ctx, w, h) {
      ctx.fillStyle = '#1b2530'; ctx.fillRect(0, 0, w, h);
      var r = K.rng(81);
      ctx.strokeStyle = 'rgba(150,190,210,0.22)'; ctx.lineWidth = 1.2;
      for (var i = 0; i < 110; i++) {
        var x = r() * w, y = r() * h;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.5) * 60, y); ctx.lineTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 50); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(200,210,220,0.55)';
      for (var k = 0; k < 40; k++) ctx.fillRect(r() * w, r() * h, 6, 3);
    });
    var pcb = K.kutu(kartL, 0.1, kartW, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.6, metalness: 0.05 }), 0.03);
    pcb.userData.secilmez = true;
    K.koy(kart, pcb, 0, 0, 0);
    kart.position.set(-L / 2 + duvar + kartL / 2 + 0.05, kartY, 0);
    g.add(kart);

    var cipSay = ops.cipSayisi || 4;
    var cipler = [];
    var cipGeo = K.yuvarlakKutuGeo(1.45, 0.12, 1.75, 0.03, 1);
    for (var i = 0; i < cipSay; i++) {
      var m = new THREE.MeshStandardMaterial({ color: 0x121316, roughness: 0.5, metalness: 0.1, emissive: new THREE.Color('#22d3ee'), emissiveIntensity: 0 });
      var c = new THREE.Mesh(cipGeo, m);
      K.parca(c, 'ssd-cip-' + i, 'Bellek çipi (NAND)', 'Veri bu çiplerde elektrik yükü olarak saklanır; elektrik gidince silinmez.');
      c.userData.indeks = i;
      var sut = i % 2, sat = Math.floor(i / 2);
      K.koy(kart, c, 0.35 + sat * 1.85, 0.11, (sut ? -1 : 1) * 1.45);
      cipler.push(c);
    }
    var denMat = new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.3, metalness: 0.4, emissive: new THREE.Color('#f59e0b'), emissiveIntensity: 0 });
    var den = new THREE.Mesh(K.yuvarlakKutuGeo(1.35, 0.14, 1.35, 0.04, 1), denMat);
    K.parca(den, 'ssd-denetleyici', 'Denetleyici', 'SSD’nin küçük işlemcisi: veriyi hangi çipe yazacağını seçer, birçok çipi aynı anda kullanır.');
    K.koy(kart, den, -2.35, 0.12, 0.9);
    var ram = K.kutu(0.75, 0.1, 1.25, 'cip', 0.02);
    K.parca(ram, 'ssd-onbellek', 'Önbellek çipi', 'Denetleyicinin kullandığı küçük, hızlı çalışma belleği.');
    K.koy(kart, ram, -2.4, 0.1, -1.1);
    // Küçük parçalar (dirençler, kondansatörler)
    var kucuk = [];
    var rr = K.rng(5);
    for (var k = 0; k < 26; k++) kucuk.push([-3.9 + rr() * 2.2, 0.07, -2.8 + rr() * 5.6]);
    K.koy(kart, K.ornekle(K.geoPaylas('ssd-smd', function () { return new THREE.BoxGeometry(0.12, 0.05, 0.07); }), K.mat('#8a6d4e', { roughness: 0.5 }), kucuk), 0, 0, 0);

    // SATA konnektörleri (kartın ucunda), ağız −X
    var kon = new THREE.Group();
    kon.rotation.y = -Math.PI / 2;               // yerel +Z → dünya −X
    kon.position.set(-L / 2 - 0.06, kartY + 0.1, 0);
    var veri = D.sataKonnektor(K, 'veri', { ayna: true });
    var guc = D.sataKonnektor(K, 'guc');
    // rotation.y = −π/2: yerel X → dünya +Z. Veri dar (7 pin), güç geniş (15 pin); arada 0,24 cm boşluk.
    var zVeri = -0.2 - veri.userData.boy / 2, zGuc = 0.04 + guc.userData.boy / 2;
    veri.position.set(zVeri - 0.25, 0, -0.5);
    guc.position.set(zGuc - 0.25, 0, -0.5);
    K.parca(veri, 'sata-veri', 'SATA veri girişi (7 pin)', 'Verinin anakartla gidip geldiği giriş. L biçimi sayesinde kablo ters takılamaz.');
    K.parca(guc, 'sata-guc', 'SATA güç girişi (15 pin)', 'Güç kaynağından gelen elektriğin girdiği daha geniş giriş; o da L biçimlidir.');
    kon.add(veri, guc);
    g.add(kon);

    // Üst kapak (etiketli). Kapak grubu menteşe gibi +X ucundan kalkar.
    var kapak = new THREE.Group();
    K.parca(kapak, 'ssd-kapak', 'Kapak ve etiket', 'Kapakta kapasite ve tür yazar. SSD’yi açmaya gerek yoktur; burada içini görmek için kaldırıldı.');
    var etiketDoku = K.canvasDoku(512, 360, function (ctx, w, h) {
      ctx.fillStyle = '#2b2f36'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e9ecef'; K.yuvarlakDikdortgen(ctx, 34, 40, w - 68, h - 80, 14); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.textBaseline = 'middle';
      ctx.font = '900 64px Arial, sans-serif'; ctx.fillText('SSD', 64, 110);
      ctx.font = '800 50px Arial, sans-serif'; ctx.fillText(ops.kapasite || '1 TB', 64, 180);
      ctx.font = '700 28px Arial, sans-serif'; ctx.fillStyle = '#374151'; ctx.fillText('2,5 inç · SATA', 64, 236);
      ctx.fillStyle = '#9ca3af'; ctx.fillRect(300, 206, 150, 58);
      ctx.fillStyle = '#e9ecef';
      for (var b = 0; b < 30; b++) ctx.fillRect(304 + b * 5, 210, (b % 3) + 1, 50);
    });
    var kapakH = H - kasaH + 0.02;
    var kapakGovde = K.kutu(L, kapakH, W, K.mat('#2b2f36', { roughness: 0.42, metalness: 0.5 }), 0.05);
    kapakGovde.userData.secilmez = true;
    K.koy(kapak, kapakGovde, -L / 2, kapakH / 2, 0);
    var etiket = K.duzlem(L * 0.82, W * 0.8, new THREE.MeshStandardMaterial({ map: etiketDoku, roughness: 0.6 }));
    etiket.rotation.x = -Math.PI / 2;
    etiket.userData.golgeYok = true;
    K.koy(kapak, etiket, -L / 2, kapakH + 0.003, 0);
    etiket.rotation.set(-Math.PI / 2, 0, 0);
    kapak.position.set(L / 2, kasaH - 0.01, 0);
    g.add(kapak);

    function acikUygula(e) {
      // e: 0 kapalı → 1 açık: kapak +X kenarındaki menteşe gibi 180° döner ve kasanın yanına ters yatar
      kapak.rotation.z = -e * Math.PI;
      kapak.position.y = (kasaH - 0.01) + (kapakH - kasaH + 0.01) * e + Math.sin(e * Math.PI) * 0.6;
    }
    acikUygula(ops.acik ? 1 : 0);
    g.userData.acik = !!ops.acik;
    g.userData.kapakAc = function (acik, sure) {
      var bas = g.userData.acik ? 1 : 0, son = acik ? 1 : 0;
      g.userData.acik = !!acik;
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 0.9 : sure, anahtar: 'kapak', hedef: g, guncelle: function (e) { acikUygula(bas + (son - bas) * e); } });
    };

    g.userData.cipler = cipler;
    g.userData.cipIsik = function (i, guc) { if (cipler[i]) cipler[i].material.emissiveIntensity = 1.1 * guc; };
    g.userData.denetleyici = den;
    g.userData.denetleyiciIsik = function (guc) { denMat.emissiveIntensity = 0.9 * guc; };
    g.userData.hepsiniSondur = function () { cipler.forEach(function (c) { c.material.emissiveIntensity = 0; }); denMat.emissiveIntensity = 0; };
    g.userData.sataVeri = veri;
    g.userData.sataGuc = guc;
    g.userData.olcu = { L: L, H: H, W: W };
    return g;
  });
})(window.DON3D);
