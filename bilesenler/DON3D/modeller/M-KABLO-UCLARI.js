/* M-KABLO-UCLARI — kablo uçları: USB-A, USB-C, HDMI, DisplayPort, RJ45 (ağ), 3.5 mm ses jakı.
   Ölçü birimi: cm. ops.tur verilirse tek fiş; verilmezse hepsi yan yana.
   Tek fiş: orijin fişin UCU (porta ilk giren nokta); fiş -Z yönünde girer, kablo +Z'den çıkıp aşağı kıvrılır.
   userData.tur, userData.giris (porta giren metal boyu, cm). USB-A fişin plastiği alt yarıdadır: ters tutulunca
   portun dili ile çakışır (girmez). */
(function (D) {
  'use strict';
  var ADLAR = {
    usba: ['USB-A kablo ucu', 'Dikdörtgen uç. Yalnız bir yönde girer.'],
    usbc: ['USB-C kablo ucu', 'Oval uç. İki yönde de girer.'],
    hdmi: ['HDMI kablo ucu', 'Alt köşeleri eğik; görüntü ve ses taşır.'],
    dp: ['DisplayPort kablo ucu', 'Bir köşesi eğik; kilit düğmesi vardır.'],
    rj45: ['Ağ kablosu ucu (RJ45)', 'Şeffaf uç ve tırnak; tık sesiyle yerine oturur.'],
    jak: ['3.5 mm ses jakı', 'Yuvarlak, ince uç; kulaklık ve hoparlörde kullanılır.']
  };
  D.FIS_BILGI = ADLAR;

  function fis(K, tur, ops) {
    var THREE = K.THREE, g = new THREE.Group();
    K.parca(g, 'fis-' + tur, ADLAR[tur][0], ADLAR[tur][1]);
    g.userData.tur = tur;
    var govdeRenk = ops.renk || (tur === 'jak' ? '#22c55e' : tur === 'rj45' ? '#3b82f6' : '#1d1f24');
    var govdeMat = K.mat(govdeRenk, { roughness: 0.5 });
    var boy = 0, govdeW = 1.6, govdeH = 0.8;
    if (tur === 'usba') {
      boy = 1.2;
      // metal kabuk (içi boş görünümü: dört kenar)
      K.koy(g, K.kutu(1.2, 0.04, boy, 'aluminyum'), 0, 0.21, boy / 2);
      K.koy(g, K.kutu(1.2, 0.04, boy, 'aluminyum'), 0, -0.21, boy / 2);
      K.koy(g, K.kutu(0.04, 0.42, boy, 'aluminyum'), -0.58, 0, boy / 2);
      K.koy(g, K.kutu(0.04, 0.42, boy, 'aluminyum'), 0.58, 0, boy / 2);
      var plastik = K.kutu(1.08, 0.17, boy - 0.1, ops.usbMavi ? 'usbMavi' : 'plastikBeyaz', 0.02);
      K.koy(g, plastik, 0, -0.1, boy / 2 + 0.05);
      // kilit delikleri (üst yüzde iki küçük kare)
      K.koy(g, K.kutu(0.18, 0.02, 0.18, 'plastikSiyah'), -0.3, 0.235, 0.45);
      K.koy(g, K.kutu(0.18, 0.02, 0.18, 'plastikSiyah'), 0.3, 0.235, 0.45);
      // USB simgesi olan yüz işareti (üst: simge yönü)
      govdeW = 1.6; govdeH = 0.75;
    } else if (tur === 'usbc') {
      boy = 0.66;
      K.koy(g, K.kutu(0.84, 0.26, boy, 'aluminyum', 0.12, 3), 0, 0, boy / 2);
      K.koy(g, K.kutu(0.7, 0.14, 0.05, 'plastikSiyah', 0.06, 2), 0, 0, 0.0);
      govdeW = 1.15; govdeH = 0.55;
    } else if (tur === 'hdmi') {
      boy = 0.95;
      var sh = new THREE.Shape(), w = 1.38, h = 0.44, p = 0.18;
      sh.moveTo(-w / 2, h / 2); sh.lineTo(w / 2, h / 2); sh.lineTo(w / 2, -h / 2 + p); sh.lineTo(w / 2 - p, -h / 2);
      sh.lineTo(-w / 2 + p, -h / 2); sh.lineTo(-w / 2, -h / 2 + p); sh.lineTo(-w / 2, h / 2);
      var m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: boy, bevelEnabled: false }), K.mat('aluminyum'));
      g.add(m);
      govdeW = 2.1; govdeH = 0.95;
    } else if (tur === 'dp') {
      boy = 0.95;
      var sh2 = new THREE.Shape(), w2 = 1.56, h2 = 0.46, p2 = 0.22;
      sh2.moveTo(-w2 / 2, h2 / 2); sh2.lineTo(w2 / 2, h2 / 2); sh2.lineTo(w2 / 2, -h2 / 2 + p2); sh2.lineTo(w2 / 2 - p2, -h2 / 2);
      sh2.lineTo(-w2 / 2, -h2 / 2); sh2.lineTo(-w2 / 2, h2 / 2);
      g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(sh2, { depth: boy, bevelEnabled: false }), K.mat('aluminyum')));
      govdeW = 2.2; govdeH = 1.0;
    } else if (tur === 'rj45') {
      boy = 1.5;
      var seffaf = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.12, transparent: true, opacity: 0.55 });
      K.koy(g, K.kutu(1.14, 0.98, boy, seffaf, 0.06), 0, 0, boy / 2);
      for (var i = 0; i < 8; i++) K.koy(g, K.kutu(0.05, 0.05, 0.5, 'altin'), -0.42 + i * 0.12, 0.45, 0.35);
      // tırnak (alt)
      var tirnak = K.kutu(0.42, 0.08, 1.1, seffaf, 0.03);
      K.koy(g, tirnak, 0, -0.58, 0.8).rotation.x = -0.18;
      // içteki renkli teller
      ['#f97316', '#fb923c', '#22c55e', '#3b82f6', '#60a5fa', '#16a34a', '#a16207', '#ca8a04'].forEach(function (r, j) {
        K.koy(g, K.kutu(0.09, 0.09, 0.8, r), -0.42 + j * 0.12, 0.1, 1.0);
      });
      govdeW = 1.3; govdeH = 1.1;
    } else if (tur === 'jak') {
      boy = 1.45;
      var uc = K.silindir(0.17, boy, 'aluminyum', 18);
      uc.rotation.x = Math.PI / 2;
      K.koy(g, uc, 0, 0, boy / 2);
      var sivri = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), K.mat('aluminyum'));
      K.koy(g, sivri, 0, 0, 0.02);
      [0.35, 0.7, 1.0].forEach(function (z) {
        var h = K.silindir(0.176, 0.07, 'plastikSiyah', 18);
        h.rotation.x = Math.PI / 2;
        K.koy(g, h, 0, 0, z);
      });
      govdeW = 0.75; govdeH = 0.75;
    }
    // Kalıp gövde (tutulan kısım)
    var govdeD = tur === 'jak' ? 1.9 : 2.2;
    var govde = tur === 'jak' ? K.silindir(0.36, govdeD, govdeMat, 20, 0.3) : K.kutu(govdeW, govdeH, govdeD, govdeMat, Math.min(govdeW, govdeH) * 0.2);
    if (tur === 'jak') govde.rotation.x = -Math.PI / 2;
    K.koy(g, govde, 0, 0, boy + govdeD / 2);
    if (tur === 'dp') K.koy(g, K.kutu(0.5, 0.12, 0.7, 'plastikGri', 0.05), 0, govdeH / 2 + 0.04, boy + 0.8);
    if (tur === 'usba') {
      // USB simgesi: üst yüzde kabartma çizgi (yön ipucu)
      K.koy(g, K.kutu(0.5, 0.03, 0.08, 'plastikGri'), 0, govdeH / 2 + 0.01, boy + 1.1);
      K.koy(g, K.kutu(0.06, 0.03, 0.5, 'plastikGri'), 0, govdeH / 2 + 0.01, boy + 1.1);
    }
    // Kablo: gövdeden çıkıp aşağı kıvrılır
    var z0 = boy + govdeD, kr = tur === 'jak' ? 0.17 : 0.26;
    var kablo = K.kablo([new THREE.Vector3(0, 0, z0 - 0.1), new THREE.Vector3(0, 0, z0 + 1.4), new THREE.Vector3(0, -0.8, z0 + 3.0),
      new THREE.Vector3(0, -3.2, z0 + 3.8), new THREE.Vector3(0, -(ops.kabloUzun || 6), z0 + 4.1)], kr,
      tur === 'rj45' ? K.mat('#3b82f6', { roughness: 0.55 }) : 'kablo');
    g.add(kablo);
    kablo.userData.secilmez = true;
    g.userData.giris = boy;
    return g;
  }

  D.modelTanimla('M-KABLO-UCLARI', function (K, ops) {
    ops = ops || {};
    if (ops.tur) return fis(K, ops.tur, ops);
    var THREE = K.THREE, g = new THREE.Group();
    K.parca(g, 'M-KABLO-UCLARI', 'Kablo uçları', 'Her kablonun ucu kendi portuna uyacak şekildedir.');
    ['usba', 'usbc', 'hdmi', 'dp', 'rj45', 'jak'].forEach(function (t, i) {
      var f = fis(K, t, { kabloUzun: 3 });
      f.rotation.x = Math.PI / 2;   // uçlar yukarı bakar
      K.koy(g, f, (i - 2.5) * 3.4, 8, 0);
    });
    return g;
  });
})(window.DON3D);
