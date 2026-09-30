/* M-ARKA-PANEL — masaüstü arka paneli: USB-A, USB-C, HDMI, DisplayPort, RJ45 (ağ), 3.5 mm ses (renk + yazılı etiket).
   Ölçü birimi: cm (portlar gerçek boyutta). Panel XY düzleminde, ön yüzü +Z'ye bakar; orijin panel alt-orta.
   ops.portlar: yalnız bu türleri göster (ör. ['usba','usbc']) — küçük prova paneli.
   Her port: ad 'port-<tür>[-n]', userData.tur, userData.agiz (yerel ağız noktası; fiş buraya -Z yönünde girer).
   D.portYap(tur, K) başka modellerde (dizüstü) de kullanılır. */
(function (D) {
  'use strict';
  var BILGI = {
    usba: ['USB-A portu', 'Klavye, fare, USB bellek gibi cihazlar takılır. Tek yönde girer.'],
    usba3: ['USB-A portu (mavi, hızlı)', 'İçi mavi olan USB-A daha hızlıdır. Tek yönde girer.'],
    usbc: ['USB-C portu', 'Küçük, oval port. İki yönde de takılır; veri ve şarj taşır.'],
    hdmi: ['HDMI portu', 'Görüntü ve sesi birlikte monitöre ya da televizyona taşır.'],
    dp: ['DisplayPort', 'Monitöre görüntü taşır. Bir köşesi eğiktir.'],
    rj45: ['Ağ portu (RJ45)', 'Ağ kablosuyla internete kablolu bağlanır. Işıkları bağlantıyı gösterir.'],
    'ses-yesil': ['Ses çıkışı (yeşil)', 'Hoparlör ya da kulaklık takılır.'],
    'ses-pembe': ['Mikrofon girişi (pembe)', 'Mikrofon takılır.'],
    'ses-mavi': ['Hat girişi (mavi)', 'Başka bir cihazdan ses almak için.']
  };
  D.PORT_BILGI = BILGI;

  /* Çerçeve: dört ince kenar + koyu iç boşluk. w×h ağız, d derinlik, t kalınlık. Ağız z=0'da, içeri -Z. */
  function cerceve(K, w, h, d, t, mat, pahAlt, pahSag) {
    var THREE = K.THREE, g = new THREE.Group();
    var m = typeof mat === 'string' ? K.mat(mat) : mat;
    K.koy(g, K.kutu(w + 2 * t, t, d, m), 0, h / 2 + t / 2, -d / 2);
    K.koy(g, K.kutu(w + 2 * t, t, d, m), 0, -h / 2 - t / 2, -d / 2);
    K.koy(g, K.kutu(t, h, d, m), -w / 2 - t / 2, 0, -d / 2);
    K.koy(g, K.kutu(t, h, d, m), w / 2 + t / 2, 0, -d / 2);
    K.koy(g, K.kutu(w, h, 0.04, 'plastikSiyah'), 0, 0, -d + 0.02);
    // Pahlı köşeler (HDMI: iki alt köşe, DP: sağ alt köşe) — üçgen dolgu
    function pah(sx) {
      var s = h * 0.42, sh = new THREE.Shape();
      sh.moveTo(0, 0); sh.lineTo(s, 0); sh.lineTo(0, s); sh.lineTo(0, 0);
      var geo = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false });
      var p = new THREE.Mesh(geo, m);
      p.position.set(sx * w / 2, -h / 2, -d);
      p.scale.x = -sx;
      g.add(p);
    }
    if (pahAlt) { pah(-1); pah(1); }
    if (pahSag) pah(1);
    return g;
  }

  /** Tek port üretir (grup). Ağız z=0, gövde -Z yönünde. */
  D.portYap = function (tur, K) {
    var THREE = K.THREE, g = new THREE.Group();
    var ana = tur.replace(/-\d+$/, '');
    var b = BILGI[ana] || [tur, ''];
    K.parca(g, 'port-' + tur, b[0], b[1]);
    g.userData.tur = ana === 'usba3' ? 'usba' : ana;
    if (ana === 'usba' || ana === 'usba3') {
      g.add(cerceve(K, 1.24, 0.5, 1.2, 0.05, 'aluminyum'));
      // dil (tongue): ağzın ÜST yarısında; fişin plastiği alt yarıda durur
      var dil = K.kutu(1.08, 0.17, 1.0, ana === 'usba3' ? 'usbMavi' : 'plastikSiyah', 0.02);
      K.koy(g, dil, 0, 0.12, -0.6);
      g.userData.dil = dil;
    } else if (ana === 'usbc') {
      var dis = K.kutu(0.96, 0.36, 0.8, 'aluminyum', 0.17, 3);
      K.koy(g, dis, 0, 0, -0.42);
      K.koy(g, K.kutu(0.86, 0.27, 0.05, 'plastikSiyah', 0.12, 2), 0, 0, 0.0);
      K.koy(g, K.kutu(0.66, 0.08, 0.7, 'plastikSiyah', 0.03), 0, 0, -0.35);
    } else if (ana === 'hdmi') {
      g.add(cerceve(K, 1.42, 0.5, 1.0, 0.06, 'aluminyum', true, false));
      K.koy(g, K.kutu(1.0, 0.14, 0.8, 'plastikSiyah', 0.02), 0, 0.05, -0.55);
    } else if (ana === 'dp') {
      g.add(cerceve(K, 1.6, 0.5, 1.0, 0.06, 'aluminyum', false, true));
      K.koy(g, K.kutu(1.2, 0.14, 0.8, 'plastikSiyah', 0.02), 0, 0.05, -0.55);
    } else if (ana === 'rj45') {
      g.add(cerceve(K, 1.2, 1.05, 1.6, 0.12, 'aluminyum'));
      // tırnak girintisi (alt orta)
      K.koy(g, K.kutu(0.5, 0.22, 1.2, 'plastikSiyah'), 0, -0.62, -0.7);
      // iç kontak pinleri (üstte)
      for (var i = 0; i < 8; i++) K.koy(g, K.kutu(0.05, 0.03, 0.5, 'altin'), -0.42 + i * 0.12, 0.42, -0.6);
      var ledY = K.led('#22c55e', 1.6), ledT = K.led('#f59e0b', 1.2);
      K.koy(g, K.kutu(0.24, 0.16, 0.06, ledY, 0.03), -0.46, 0.72, 0.01);
      K.koy(g, K.kutu(0.24, 0.16, 0.06, ledT, 0.03), 0.46, 0.72, 0.01);
      g.userData.ledler = [ledY, ledT];
    } else if (ana.indexOf('ses') === 0) {
      var renk = { 'ses-yesil': '#22c55e', 'ses-pembe': '#f472b6', 'ses-mavi': '#38bdf8' }[ana];
      var halka = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.1, 10, 28), K.mat(renk, { roughness: 0.4 }));
      K.koy(g, halka, 0, 0, 0.02);
      var kuyu = K.silindir(0.3, 1.0, 'plastikSiyah', 20);
      kuyu.rotation.x = Math.PI / 2;
      K.koy(g, kuyu, 0, 0, -0.48);
      var dip = K.silindir(0.18, 0.05, 'aluminyumMat', 16);
      dip.rotation.x = Math.PI / 2;
      K.koy(g, dip, 0, 0, -0.1);
      g.userData.renk = renk;
    }
    g.userData.agiz = new THREE.Vector3(0, 0, 0);
    // Dokunmatik için görünmez, geniş tıklama alanı (küçük portlara parmakla dokunulabilsin)
    var vurus = new THREE.Mesh(K.geoPaylas('port-vurus', function () { return new THREE.BoxGeometry(2.2, 1.3, 0.3); }),
      K.vurusMat || (K.vurusMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })));
    vurus.position.z = 0.15;
    vurus.userData.vurguHaric = true; vurus.userData.golgeYok = true; vurus.castShadow = false;
    g.add(vurus);
    return g;
  };

  /* Panel üzerine basılı küçük simge/yazılar (gerçek arka paneldeki gibi) */
  function yaziDokusu(K, W, H, yazilar) {
    var olcek = 512 / W;
    return K.canvasDoku(512, Math.round(H * olcek), function (ctx, w, h) {
      var gr = ctx.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#3a3f48'); gr.addColorStop(1, '#2c3037');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for (var y = 0; y < h; y += 3) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.fillStyle = '#d7dce3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      yazilar.forEach(function (y) {
        ctx.font = '700 ' + Math.round((y[3] || 0.42) * olcek) + 'px Inter, Arial, sans-serif';
        ctx.fillText(y[0], (y[1] + W / 2) * olcek, (H - y[2]) * olcek);
      });
    });
  }

  D.modelTanimla('M-ARKA-PANEL', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var g = new THREE.Group();
    K.parca(g, 'M-ARKA-PANEL', 'Arka panel', 'Bilgisayarın dış dünyaya bağlandığı portlar burada.');
    // Yerleşim: [tür, x, y] (panel koordinatı, orijin alt-orta)
    var DUZEN = [
      ['usba-1', -8.0, 4.6], ['usba-2', -8.0, 3.2],
      ['hdmi', -5.3, 4.6], ['dp', -5.3, 3.2],
      ['usbc', -2.5, 5.1], ['usba3-1', -2.5, 3.7], ['usba3-2', -2.5, 2.6],
      ['rj45', 0.7, 4.8], ['usba3-3', 0.7, 3.0], ['usba3-4', 0.7, 1.9],
      ['ses-mavi', 4.0, 5.5], ['ses-yesil', 4.0, 4.0], ['ses-pembe', 4.0, 2.5]
    ];
    if (ops.portlar) DUZEN = DUZEN.filter(function (p) { return ops.portlar.indexOf(p[0].replace(/-\d+$/, '').replace('usba3', 'usba')) >= 0; })
      .filter(function (p, i, a) { return a.findIndex(function (q) { return q[0].replace(/-\d+$/, '').replace('usba3', 'usba') === p[0].replace(/-\d+$/, '').replace('usba3', 'usba'); }) === i; });
    var kucuk = !!ops.portlar;
    var W = kucuk ? Math.max(4.5, DUZEN.length * 3.2 + 1.2) : 19, H = kucuk ? 3.4 : 7.4, T = 0.5;
    if (kucuk) DUZEN = DUZEN.map(function (p, i) { return [p[0], (i - (DUZEN.length - 1) / 2) * 3.2, H / 2 + 0.2]; });
    var yazilar = [];
    DUZEN.forEach(function (p) {
      var ad = p[0].replace(/-\d+$/, '');
      var yazi = { usba: 'USB', usba3: 'USB 3', usbc: 'USB-C', hdmi: 'HDMI', dp: 'DP', rj45: 'LAN', 'ses-yesil': 'ÇIKIŞ', 'ses-pembe': 'MİK', 'ses-mavi': 'GİRİŞ' }[ad];
      var dy = ad === 'rj45' ? 1.05 : (ad.indexOf('ses') === 0 ? 0.62 : 0.5);
      if (ad.indexOf('ses') === 0) yazilar.push([yazi, p[1] + 1.25, p[2], 0.36]);
      else if (!(ad === 'usba3' && /-(2|4)$/.test(p[0])) && !(ad === 'usba' && /-2$/.test(p[0]))) yazilar.push([yazi, p[1], p[2] + dy, 0.34]);
    });
    var doku = yaziDokusu(K, W, H, yazilar);
    var yuzMat = new THREE.MeshStandardMaterial({ map: doku, roughness: 0.55, metalness: 0.35 });
    var govde = K.kutu(W, H, T, 'kasa', 0.25);
    K.koy(g, govde, 0, H / 2, -T / 2);
    govde.userData.secilmez = true;
    var yuz = K.duzlem(W - 0.3, H - 0.3, yuzMat);
    K.koy(g, yuz, 0, H / 2, 0.005);
    yuz.userData.secilmez = true;
    var portlar = [];
    DUZEN.forEach(function (p) {
      var port = D.portYap(p[0], K);
      K.koy(g, port, p[1], p[2], 0.02);
      portlar.push(port);
    });
    if (!kucuk) {
      // Havalandırma delikleri ve vida delikleri (gerçekçilik)
      var izgara = K.duzlem(2.2, 6, new THREE.MeshStandardMaterial({ map: K.izgaraDoku('#343841', '#101114'), roughness: 0.6, metalness: 0.4 }));
      K.koy(g, izgara, 7.7, H / 2, 0.01).userData.secilmez = true;
    }
    g.userData.portlar = portlar;
    g.userData.olcu = { W: W, H: H };
    return g;
  });
})(window.DON3D);
