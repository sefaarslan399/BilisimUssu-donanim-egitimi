/* M-MASAUSTU — kapalı masaüstü kasa (ATX orta kule), sol yanda cam kapak.
   Ön panelde güç düğmesi, güç ve disk ışıkları, üst-ön USB girişleri.
   İçeride (camdan görünür, basitleştirilmiş): anakart, işlemci soğutucusu, RAM,
   ekran kartı, SSD, güç kaynağı örtüsü (PSU'nun içi modellenmez), arka fan.
   Ölçü birimi: cm (≈ 21 × 45 × 42). Orijin: alt-orta. Ön +Z, cam yan −X. */
(function (D) {
  'use strict';

  function fan(K, cap) {
    var THREE = K.THREE;
    var f = new THREE.Group();
    var cer = cap / 2;
    [[0, cer - 0.4, cap, 0.8], [0, -cer + 0.4, cap, 0.8]].forEach(function (c) {
      K.koy(f, K.kutu(c[2], c[3], 2.4, 'plastikSiyah', 0.2), c[0], c[1], 0);
    });
    [[cer - 0.4, 0], [-cer + 0.4, 0]].forEach(function (c) {
      K.koy(f, K.kutu(0.8, cap, 2.4, 'plastikSiyah', 0.2), c[0], c[1], 0);
    });
    var rotor = new THREE.Group();
    rotor.name = 'rotor';
    var gobek = K.silindir(1.9, 1.6, 'plastikKoyu', 24);
    gobek.rotation.x = Math.PI / 2;
    rotor.add(gobek);
    var kanatGeo = K.yuvarlakKutuGeo(1.8, cer - 2.4, 0.18, 0.08, 1);
    for (var i = 0; i < 7; i++) {
      var piv = new THREE.Group();
      piv.rotation.z = (i / 7) * Math.PI * 2;
      var k = new THREE.Mesh(kanatGeo, K.mat('plastikKoyu'));
      k.position.y = 1.9 + (cer - 2.4) / 2 - 0.3;
      k.rotation.y = 0.45;
      piv.add(k);
      rotor.add(piv);
    }
    f.add(rotor);
    f.userData.rotor = rotor;
    return f;
  }
  D.kitFan = fan;

  D.modelTanimla('M-MASAUSTU', function (K) {
    var THREE = K.THREE;
    var g = new THREE.Group();
    K.parca(g, 'M-MASAUSTU', 'Kasa', 'İşlemci, bellek ve depolama gibi parçaları koruyan kutu.');
    var W = 21, H = 45, Dp = 42;
    var yz = 1.6;               // kasa gövdesi alt yüzü (ayaklar üstü)
    var ym = yz + (H - yz) / 2; // gövde dikey merkez
    var gh = H - yz;            // gövde yüksekliği

    // Ayaklar
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      K.koy(g, K.silindir(1.3, yz, 'kaucuk', 16), p[0] * (W / 2 - 2.2), yz / 2, p[1] * (Dp / 2 - 3));
    });

    // Gövde panelleri
    var ustDoku = K.izgaraDoku('#23262c', '#0b0c0f');
    ustDoku.wrapS = ustDoku.wrapT = THREE.RepeatWrapping;
    ustDoku.repeat.set(2, 4);
    var ustMat = new THREE.MeshStandardMaterial({ map: ustDoku, roughness: 0.5, metalness: 0.45 });
    var govde = new THREE.Group();
    K.parca(govde, 'govde', 'Kasa gövdesi', 'Metal gövde parçaları korur ve ısıyı dağıtır.');
    K.koy(govde, K.kutu(0.6, gh, Dp, 'kasa', 0.25), W / 2 - 0.3, ym, 0);                    // sağ yan
    K.koy(govde, K.kutu(W, 0.6, Dp, ustMat, 0.25), 0, H - 0.3, 0);                          // üst
    K.koy(govde, K.kutu(W, 0.6, Dp, 'kasa', 0.2), 0, yz + 0.3, 0);                          // alt
    K.koy(govde, K.kutu(W, gh, 0.6, 'kasa', 0.2), 0, ym, -Dp / 2 + 0.3);                    // arka
    // Cam yan kapak ve çerçevesi
    var cam = K.kutu(0.4, gh - 1.6, Dp - 2.4, 'cam', 0.2);
    K.koy(govde, cam, -W / 2 + 0.2, ym, 0);
    cam.userData.golgeYok = true;
    cam.renderOrder = 3;
    cam.userData.secilmez = true;
    [[ym + gh / 2 - 0.5, Dp, 1.0], [ym - gh / 2 + 0.5, Dp, 1.0]].forEach(function (c) {
      K.koy(govde, K.kutu(0.7, c[2], c[1], 'kasa', 0.2), -W / 2 + 0.35, c[0], 0);
    });
    [Dp / 2 - 0.6, -Dp / 2 + 0.6].forEach(function (z) {
      K.koy(govde, K.kutu(0.7, gh, 1.2, 'kasa', 0.2), -W / 2 + 0.35, ym, z);
    });
    g.add(govde);

    // Ön panel: plastik çerçeve + ortada delikli hava girişi
    var on = new THREE.Group();
    K.parca(on, 'on-panel', 'Ön panel', 'Hava girişi, düğmeler ve ön girişler buradadır.');
    K.koy(on, K.kutu(W + 0.6, H - 0.4, 1.8, 'plastikSiyah', 0.7), 0, H / 2 + 0.3, Dp / 2 + 0.6);
    var agDoku = K.izgaraDoku('#1a1c21', '#060708');
    agDoku.wrapS = agDoku.wrapT = THREE.RepeatWrapping;
    agDoku.repeat.set(2, 5);
    var ag = K.duzlem(W - 5, H - 11, new THREE.MeshStandardMaterial({ map: agDoku, roughness: 0.7, metalness: 0.2 }));
    K.koy(on, ag, 0, H / 2 - 1.5, Dp / 2 + 1.52);
    g.add(on);

    // Üst-ön: güç düğmesi (halka ışıklı), USB girişleri, ses girişi, disk ışığı
    var yUst = H + 0.02;
    var dugme = new THREE.Group();
    K.parca(dugme, 'guc-dugmesi', 'Güç düğmesi', 'Bilgisayarı açar. Kapatmak için işletim sistemi kullanılır.');
    var dugmeGovde = K.silindir(1.05, 0.5, 'aluminyum', 28);
    K.koy(dugme, dugmeGovde, 0, 0.25, 0);
    var halkaMat = K.led('#bfe3ff', 1.6);
    var halka = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.12, 8, 32), halkaMat);
    halka.rotation.x = -Math.PI / 2;
    K.koy(dugme, halka, 0, 0.08, 0);
    halka.rotation.x = -Math.PI / 2;
    halka.name = 'guc-isigi';
    K.koy(g, dugme, -5.5, yUst, Dp / 2 - 3.2);

    var portlar = new THREE.Group();
    K.parca(portlar, 'on-portlar', 'Ön USB girişleri', 'USB bellek, kulaklık gibi cihazlar buraya takılır.');
    [-1.2, 1.2].forEach(function (x) {
      K.koy(portlar, K.kutu(1.35, 0.1, 0.6, 'cip'), x, 0, 0);
      K.koy(portlar, K.kutu(1.1, 0.12, 0.2, 'usbMavi'), x, 0.01, 0.08);
    });
    K.koy(portlar, K.kutu(0.95, 0.1, 0.38, 'cip', 0.12), 3.3, 0, 0);
    var ses = K.silindir(0.3, 0.1, 'cip', 16); K.koy(portlar, ses, 5.0, 0, 0);
    K.koy(g, portlar, 1.2, yUst, Dp / 2 - 3.2);

    var diskLed = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), K.led('#ffb347', 0.25));
    K.parca(diskLed, 'disk-isigi', 'Disk ışığı', 'Depolama birimi çalışırken yanıp söner.');
    K.koy(g, diskLed, -8, yUst, Dp / 2 - 3.2);

    // ── İç parçalar (camdan görünür) ──
    var ic = new THREE.Group();
    ic.name = 'ic';
    var xTepsi = W / 2 - 1.0;
    // Anakart (sağ yan duvara bağlı, bileşenler −X yönüne bakar)
    var pcbDoku = K.canvasDoku(256, 320, function (ctx, w, h) {
      ctx.fillStyle = '#23272e'; ctx.fillRect(0, 0, w, h);
      var r = K.rng(7);
      ctx.strokeStyle = 'rgba(120,135,150,0.35)'; ctx.lineWidth = 1;
      for (var i = 0; i < 70; i++) {
        var x = r() * w, y = r() * h;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.5) * 80, y); ctx.lineTo(x + (r() - 0.5) * 80, y + (r() - 0.5) * 80); ctx.stroke();
      }
      ctx.fillStyle = '#3a3f48';                                   // genişleme yuvaları
      for (var k = 0; k < 3; k++) ctx.fillRect(w * 0.08, h * (0.55 + k * 0.1), w * 0.62, 7);
      ctx.fillStyle = '#d9dce1'; ctx.fillRect(w * 0.9, h * 0.1, 10, h * 0.28); // 24 pin güç girişi
      ctx.strokeStyle = 'rgba(220,225,232,0.55)'; ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.2, h * 0.08, w * 0.34, w * 0.34);           // soket çerçevesi
    });
    var anakart = K.kutu(0.2, 30.5, 24.4, new THREE.MeshStandardMaterial({ map: pcbDoku, roughness: 0.6, metalness: 0.1 }));
    K.parca(anakart, 'anakart', 'Anakart', 'Tüm parçaları birbirine bağlayan ana devre kartı.');
    K.koy(ic, anakart, xTepsi, 28.5, -8.4);
    // İşlemci + kule soğutucu
    var islemci = new THREE.Group();
    K.parca(islemci, 'islemci', 'İşlemci', 'Gelen bilgiyi işler ve ne yapılacağına karar verir. Soğutucunun altındadır.');
    var yuva = K.kutu(0.4, 5.6, 5.6, 'plastikAcik', 0.1); K.koy(islemci, yuva, 0, 0, 0);
    var kule = K.kutu(12.5, 12, 5.2, 'aluminyumMat', 0.2); K.koy(islemci, kule, -7.2, 1.2, 0);
    var boru = K.silindir(0.35, 11, 'bakir', 12);
    boru.rotation.z = Math.PI / 2;
    K.koy(islemci, boru, -5, -1.6, -1.2); boru.rotation.z = Math.PI / 2;
    var boru2 = K.silindir(0.35, 11, 'bakir', 12);
    K.koy(islemci, boru2, -5, -1.6, 1.2); boru2.rotation.z = Math.PI / 2;
    var sogFan = fan(K, 12);
    sogFan.rotation.y = Math.PI / 2;
    K.koy(islemci, sogFan, -7.2, 1.2, 3.9);
    sogFan.rotation.y = 0;
    islemci.userData.rotor = sogFan.userData.rotor;
    K.koy(ic, islemci, xTepsi - 0.3, 35, -11);
    // RAM (dikey yuvalarda iki modül)
    var ram = new THREE.Group();
    K.parca(ram, 'ram', 'RAM', 'Çalışan programların geçici olarak tutulduğu bellek.');
    [-0.5, 0.5].forEach(function (z) {
      K.koy(ram, K.kutu(3.2, 13.3, 0.4, 'plastikKoyu', 0.1), 0, 0, z);
      K.koy(ram, K.kutu(0.4, 13.3, 0.42, 'aluminyum', 0.1), -1.5, 0, z);
    });
    K.koy(ic, ram, xTepsi - 1.7, 33.5, -3.6);
    // Ekran kartı (yatay)
    var ekk = new THREE.Group();
    K.parca(ekk, 'ekran-karti', 'Ekran kartı', 'Ekranda görünecek görüntüyü hazırlar.');
    K.koy(ekk, K.kutu(12, 3.6, 26, 'plastikKoyu', 0.5), 0, 0, 0);
    K.koy(ekk, K.kutu(11.6, 0.3, 25.6, 'aluminyumMat', 0.1), 0, 1.95, 0);
    [-6.5, 6.5].forEach(function (z) {
      var h = K.silindir(4.6, 0.3, 'plastikSiyah', 28); K.koy(ekk, h, 0, -1.9, z);
      var gb = K.silindir(1.4, 0.35, 'plastikGri', 20); K.koy(ekk, gb, 0, -2.0, z);
    });
    K.koy(ic, ekk, xTepsi - 6.2, 21.5, -7.6);
    // Güç kaynağı örtüsü (PSU içi modellenmez)
    var ortu = K.kutu(W - 1.4, 9.2, Dp - 1.8, 'kasaIc', 0.3);
    K.parca(ortu, 'guc-kaynagi', 'Güç kaynağı (örtünün altında)', 'Prizden gelen elektriği parçalara uygun hâle getirir. İçi asla açılmaz.');
    K.koy(ic, ortu, 0, yz + 0.6 + 4.6, 0);
    // SSD (örtünün üstünde)
    var ssd = new THREE.Group();
    K.parca(ssd, 'depolama', 'Depolama birimi (SSD)', 'Dosyaları ve programları kalıcı olarak saklar.');
    K.koy(ssd, K.kutu(7, 0.7, 10, 'aluminyumMat', 0.2), 0, 0, 0);
    K.koy(ssd, K.kutu(5.6, 0.02, 5, 'plastikBeyaz'), 0, 0.37, 0.8);
    K.koy(ic, ssd, -3.5, yz + 11.3, 11);
    // Arka fan
    var arkaFan = fan(K, 12);
    arkaFan.name = 'arka-fan';
    K.koy(ic, arkaFan, 1.5, 35, -Dp / 2 + 1.9);
    ic.traverse(function (o) { if (o.isMesh) o.userData.golgeYok = true; });
    g.add(ic);
    g.userData.fanlar = [arkaFan.userData.rotor, sogFan.userData.rotor];

    // Arka giriş/çıkış paneli (kablolar için)
    var io = K.kutu(0.3, 4.4, 16, 'aluminyum');
    io.rotation.y = Math.PI / 2;
    K.koy(g, io, 1.3, 40, -Dp / 2 - 0.05);
    io.rotation.y = Math.PI / 2;
    K.parca(io, 'arka-panel', 'Arka giriş paneli', 'Klavye, fare, ağ ve ses kabloları buraya takılır.');
    var giris = new THREE.Object3D(); giris.name = 'kablo-giris';
    K.koy(g, giris, -2, 40, -Dp / 2 - 0.4);
    var cikis = new THREE.Object3D(); cikis.name = 'goruntu-cikis';
    K.koy(g, cikis, -2.5, 21.5, -Dp / 2 - 0.4);
    return g;
  });
})(window.DON3D);
