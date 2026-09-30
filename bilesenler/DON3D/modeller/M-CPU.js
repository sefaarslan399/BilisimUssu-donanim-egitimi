/* M-CPU — masaüstü işlemci, LGA (temas pedli) tip. Marka ve logo yok; kapakta sade, okunmaz lazer gravür çizgileri.
   Ölçü birimi: cm (3,75 × 3,75 alt kart; toplam yükseklik ≈ 0,44). Orijin: alt kartın alt yüzünün ortası.
   Yön: kapak +Y (üst), temas pedleri −Y (alt). Köşe üçgeni üst yüzde sol-ön köşede (−X, +Z); yan kenarlarda iki hizalama çentiği (−Z tarafına yakın).
   Parçalar: 'kapak' (metal ısı dağıtıcı kapak), 'ucgen' (altın köşe üçgeni), 'temas-yuzeyi' (alt yüz: ~1100 altın ped + orta bölgede küçük kondansatörler),
             'alt-kart' (yeşil alt kart).
   userData API:
     olcu            → { W, T: alt kart kalınlığı, H: toplam yükseklik, kapakY: kapağın üst yüzünün Y'si }
     kapak           → kapak grubu (soğutucu buraya oturur: M-SOGUTUCU orijini kapakY yüksekliğine konur)
     isit(deger)     → A-ISI: 0 = mavi (serin), 0,5 = yeşil-sarı, 1 = kırmızı (çok sıcak); null → normal metal renk.
                        Renk tek başına bilgi taşımaz: derste termometre değeri/yazısı eşlik etmelidir.
   Kullanım: DON-201 H06; DON-301 H02, H09. */
(function (D) {
  'use strict';
  D.modelTanimla('M-CPU', function (K, ops) {
    var THREE = K.THREE, V3 = K.V3;
    ops = ops || {};
    var W = 3.75, T = 0.12, FL = 3.3, FT = 0.07, UST = 2.9, UT = 0.25;
    var kapakY = T + FT + UT;
    var g = new THREE.Group();
    K.parca(g, 'M-CPU', 'İşlemci', 'Programların komutlarını sırayla işleyen parça. Anakarttaki yuvasına takılır.');

    // ── Alt kart: yan kenarlarda iki yarım daire hizalama çentiği (ekstrüzyon, +Y yönünde)
    var h = W / 2, rc = 0.1, cz = h - 0.85;
    var s = new THREE.Shape();
    s.moveTo(-h, -h); s.lineTo(h, -h);
    s.lineTo(h, cz - rc); s.absarc(h, cz, rc, -Math.PI / 2, Math.PI / 2, true); s.lineTo(h, h);
    s.lineTo(-h, h);
    s.lineTo(-h, cz + rc); s.absarc(-h, cz, rc, Math.PI / 2, -Math.PI / 2, true); s.lineTo(-h, -h);
    var kartGeo = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false, curveSegments: 10 });
    kartGeo.rotateX(-Math.PI / 2);      // şekil y → −Z, derinlik → +Y (0..T)
    var kartDoku = K.canvasDoku(512, 512, function (ctx, w, hh) {
      ctx.fillStyle = '#155a34'; ctx.fillRect(0, 0, w, hh);
      var r = K.rng(5);
      ctx.strokeStyle = 'rgba(150,215,165,0.22)'; ctx.lineWidth = 1.2;
      for (var i = 0; i < 70; i++) {
        var x = r() * w, y = r() * hh;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.5) * 90, y); ctx.lineTo(x + (r() - 0.5) * 90, y + (r() - 0.5) * 60); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(235,240,235,0.55)';          // ince baskı: küçük kutucuklar (okunmaz)
      for (var k = 0; k < 14; k++) ctx.fillRect(40 + k * 12, hh - 40, 7, 10);
    });
    kartDoku.repeat.set(1 / W, 1 / W); kartDoku.offset.set(0.5, 0.5);
    var kartMat = new THREE.MeshStandardMaterial({ map: kartDoku, roughness: 0.55, metalness: 0.05 });
    var kart = new THREE.Mesh(kartGeo, kartMat);
    K.parca(kart, 'alt-kart', 'Alt kart', 'İşlemci çipini taşıyan yeşil kart. Çipi alttaki temas pedlerine bağlar.');
    g.add(kart);

    // Üst yüzde küçük kondansatörler (arka kenar boyunca)
    var kondUst = [];
    for (var ki = 0; ki < 9; ki++) kondUst.push([-1.2 + ki * 0.3, T + 0.02, -h + 0.13]);
    var kondGeo = K.yuvarlakKutuGeo(0.12, 0.04, 0.06, 0.01, 1);
    var kUst = K.ornekle(kondGeo, K.mat('#8a7658', { roughness: 0.5 }), kondUst);
    kUst.userData.secilmez = true;
    g.add(kUst);

    // ── Köşe üçgeni (altın; sol-ön köşe)
    var us = new THREE.Shape(), a = 0.27;
    us.moveTo(0, 0); us.lineTo(a, 0); us.lineTo(0, a); us.closePath();
    var ucGeo = new THREE.ShapeGeometry(us);
    ucGeo.rotateX(-Math.PI / 2);
    var ucgen = new THREE.Mesh(ucGeo, K.mat('altin'));
    ucgen.position.set(-h + 0.05, T + 0.004, h - 0.05);
    ucgen.userData.golgeYok = true;
    K.parca(ucgen, 'ucgen', 'Köşe üçgeni', 'Takarken bu köşe, yuvadaki üçgen işaretiyle aynı köşeye gelir.');
    g.add(ucgen);

    // ── Kapak (nikel kaplı bakır ısı dağıtıcı): alt flanş + üst blok + gravür
    var kapak = new THREE.Group();
    K.parca(kapak, 'kapak', 'Metal kapak', 'İçindeki çipi korur ve ısıyı soğutucuya iletir. Soğutucu bu yüzeye oturur.');
    var kapakMat = new THREE.MeshStandardMaterial({ color: 0xc7cbd1, roughness: 0.3, metalness: 0.9 });
    var flans = K.kutu(FL, FT, FL, kapakMat, 0.12, 3);
    K.koy(kapak, flans, 0, T + FT / 2, 0);
    var blok = K.kutu(UST, UT, UST, kapakMat, 0.1, 3);
    K.koy(kapak, blok, 0, T + FT + UT / 2 - 0.001, 0);
    // Gravür: okunmaz metin çizgileri ve küçük kare kod (marka yok)
    var gravurDoku = K.canvasDoku(512, 512, function (ctx, w, hh) {
      ctx.clearRect(0, 0, w, hh);
      ctx.fillStyle = 'rgba(70,76,86,0.55)';
      var r = K.rng(9), satirlar = [[70, 150, 250], [110, 210, 200], [150, 210, 320], [190, 210, 160]];
      satirlar.forEach(function (sa) {
        var x = 80;
        while (x < 80 + sa[2]) { var gw = 6 + Math.floor(r() * 16); ctx.fillRect(x, sa[1], gw, 16); x += gw + 5; }
      });
      ctx.fillRect(80, 290, 180, 12);
      for (var y = 0; y < 10; y++) for (var x2 = 0; x2 < 10; x2++) if (r() > 0.5 || x2 === 0 || y === 9) ctx.fillRect(340 + x2 * 9, 330 + y * 9, 9, 9);
      ctx.strokeStyle = 'rgba(70,76,86,0.45)'; ctx.lineWidth = 3; ctx.strokeRect(22, 22, w - 44, hh - 44);
    });
    var gravurMat = new THREE.MeshStandardMaterial({ map: gravurDoku, transparent: true, roughness: 0.4, metalness: 0.6, depthWrite: false });
    var gravur = K.duzlem(UST - 0.2, UST - 0.2, gravurMat);
    gravur.rotation.x = -Math.PI / 2;
    K.koy(kapak, gravur, 0, kapakY + 0.002, 0);
    gravur.rotation.x = -Math.PI / 2;
    gravur.userData.golgeYok = true; gravur.userData.secilmez = true;
    g.add(kapak);

    // ── Temas yüzeyi (alt): altın pedler (InstancedMesh) + orta bölgede kondansatörler
    var temas = new THREE.Group();
    K.parca(temas, 'temas-yuzeyi', 'Temas yüzeyi', 'Alt yüzdeki yüzlerce altın ped, yuvadaki ince metal uçlara değerek elektrik ve bilgi taşır.');
    var pedler = [], adim = 0.1, n = 35, bas = -(n - 1) * adim / 2;
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        var x = bas + i * adim, z = bas + j * adim;
        if (Math.abs(x) < 0.56 && Math.abs(z) < 0.56) continue;        // orta boş bölge
        if (Math.abs(x) > 1.62 && Math.abs(z) > 1.62) continue;        // köşeler
        pedler.push([x, -0.002, z]);
      }
    }
    var pedGeo = K.geoPaylas('cpu-ped:v2', function () { var c = new THREE.CircleGeometry(0.03, 6); c.rotateX(Math.PI / 2); return c; });
    var pedIm = K.ornekle(pedGeo, K.mat('altin', { roughness: 0.25 }), pedler);
    pedIm.userData.golgeYok = true;
    temas.add(pedIm);
    var kondAlt = [], rk = K.rng(3);
    for (var c = 0; c < 22; c++) kondAlt.push([(rk() - 0.5) * 0.9, -0.022, (rk() - 0.5) * 0.9]);
    var kAlt = K.ornekle(kondGeo, K.mat('#8a7658', { roughness: 0.5 }), kondAlt);
    temas.add(kAlt);
    g.add(temas);
    g.userData.pedSayisi = pedler.length;

    // ── A-ISI: ısı haritası rengi (mavi → yeşil → sarı → kırmızı)
    var normal = new THREE.Color(0xc7cbd1), renk = new THREE.Color();
    g.userData.isit = function (deger) {
      if (deger == null) {
        kapakMat.color.copy(normal); kapakMat.emissive.setRGB(0, 0, 0); kapakMat.emissiveIntensity = 1;
        gravurMat.emissive.setRGB(0, 0, 0);
        return;
      }
      var d = Math.max(0, Math.min(1, deger));
      renk.setHSL((1 - d) * 0.6, 0.85, 0.5);
      kapakMat.color.copy(normal).lerp(renk, 0.55);
      kapakMat.emissive.copy(renk); kapakMat.emissiveIntensity = 0.28 + 0.5 * d;
      gravurMat.emissive.copy(renk).multiplyScalar(0.3);
    };
    g.userData.kapak = kapak;
    g.userData.olcu = { W: W, T: T, H: kapakY, kapakY: kapakY };
    return g;
  });
})(window.DON3D);
