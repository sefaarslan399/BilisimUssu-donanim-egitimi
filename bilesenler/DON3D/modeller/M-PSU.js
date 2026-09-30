/* M-PSU — ATX güç kaynağı, YALNIZ DIŞ GÖRÜNÜM (içi asla modellenmez), uyarı etiketi.
   Ölçü birimi: cm (15 × 8.6 × 14). Orijin: alt-orta. Arka yüz (priz girişi, anahtar) −Z, kablolar +Z yönünden çıkar.
   Parçalar: 'psu-etiket' (uyarı etiketi), 'psu-fan' (fan ızgarası, üst), 'psu-giris' (priz girişi), 'psu-anahtar' (açma-kapama),
   'psu-kablolar' (kablo demeti). ops.kablosuz: kablo demeti çizilmez. */
(function (D) {
  'use strict';
  D.modelTanimla('M-PSU', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var W = 15, H = 8.6, Dz = 14;
    var g = new THREE.Group();
    K.parca(g, 'M-PSU', 'Güç kaynağı', 'Prizden gelen elektriği parçalara uygun hâle getirir. İçi asla açılmaz.');
    var govde = K.kutu(W, H, Dz, K.mat('#1e2126', { roughness: 0.42, metalness: 0.55 }), 0.35, 3);
    K.koy(g, govde, 0, H / 2, 0);
    govde.userData.secilmez = true;

    // Üst: fan ızgarası
    var fan = new THREE.Group();
    K.parca(fan, 'psu-fan', 'Fan ızgarası', 'Güç kaynağı ısınır; fan içindeki sıcak havayı dışarı atar.');
    var izgaraDoku = K.canvasDoku(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#0d0e11'; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#4b5059'; ctx.lineWidth = 5;
      for (var r = 24; r < w / 2; r += 20) { ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2); ctx.stroke(); }
      for (var a = 0; a < 4; a++) { ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(a * Math.PI / 4); ctx.fillStyle = '#4b5059'; ctx.fillRect(-w / 2 + 6, -3, w - 12, 6); ctx.restore(); }
      ctx.fillStyle = '#2d3138'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 26, 0, Math.PI * 2); ctx.fill();
    });
    var izgara = new THREE.Mesh(new THREE.CircleGeometry(5.6, 48), new THREE.MeshStandardMaterial({ map: izgaraDoku, roughness: 0.5, metalness: 0.5, transparent: true }));
    izgara.rotation.x = -Math.PI / 2;
    K.koy(fan, izgara, 0, 0, 0);
    K.koy(g, fan, 0, H + 0.01, 0.4);

    // Yan: uyarı etiketi (canvas; emoji yok, işaret çizilir)
    var etiketDoku = K.canvasDoku(512, 300, function (ctx, w, h) {
      ctx.fillStyle = '#f4f5f7'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, 54);
      ctx.fillStyle = '#fff'; ctx.font = '800 30px Inter, Arial, sans-serif'; ctx.textBaseline = 'middle';
      ctx.fillText('GÜÇ KAYNAĞI · 550 W', 20, 28);
      // uyarı üçgeni + şimşek
      ctx.save(); ctx.translate(92, 170);
      ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(0, -78); ctx.lineTo(74, 56); ctx.lineTo(-74, 56); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(8, -44); ctx.lineTo(-18, 10); ctx.lineTo(2, 10); ctx.lineTo(-10, 46); ctx.lineTo(22, -6); ctx.lineTo(2, -6); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#b91c1c'; ctx.font = '900 34px Inter, Arial, sans-serif';
      ctx.fillText('TEHLİKE!', 190, 110);
      ctx.fillStyle = '#111'; ctx.font = '700 25px Inter, Arial, sans-serif';
      ctx.fillText('Yüksek gerilim.', 190, 152);
      ctx.fillText('Kapağı açmayın.', 190, 186);
      ctx.fillText('İçinde onarılacak', 190, 220);
      ctx.fillText('parça yoktur.', 190, 250);
    });
    var etiket = K.duzlem(9.6, 5.6, new THREE.MeshStandardMaterial({ map: etiketDoku, roughness: 0.6 }));
    K.parca(etiket, 'psu-etiket', 'Uyarı etiketi', 'Tehlike: yüksek gerilim. Güç kaynağının kapağı asla açılmaz.');
    etiket.rotation.y = Math.PI / 2;
    K.koy(g, etiket, W / 2 + 0.01, H / 2, 0);
    etiket.rotation.y = Math.PI / 2;

    // Arka: bal peteği havalandırma + priz girişi + anahtar
    var petek = K.duzlem(8.4, 6.6, new THREE.MeshStandardMaterial({ map: K.izgaraDoku('#23262c', '#060708'), roughness: 0.5, metalness: 0.5 }));
    petek.rotation.y = Math.PI;
    K.koy(g, petek, -2.8, H / 2, -Dz / 2 - 0.01).userData.secilmez = true;
    petek.rotation.y = Math.PI;
    var giris = new THREE.Group();
    K.parca(giris, 'psu-giris', 'Güç kablosu girişi', 'Prizden gelen güç kablosu buraya takılır. Çalışmadan önce fiş prizden çekilir.');
    K.koy(giris, K.kutu(2.8, 2.2, 0.3, 'plastikSiyah', 0.2), 0, 0, 0);
    [-0.6, 0, 0.6].forEach(function (x, i) { K.koy(giris, K.kutu(0.25, 0.55, 0.32, 'aluminyum'), x, i === 1 ? 0.35 : -0.2, -0.02); });
    K.koy(g, giris, 4.3, H * 0.62, -Dz / 2 - 0.12);
    var anahtar = new THREE.Group();
    K.parca(anahtar, 'psu-anahtar', 'Açma–kapama anahtarı', 'Güç kaynağını tamamen kapatır: I açık, O kapalı.');
    K.koy(anahtar, K.kutu(1.4, 1.9, 0.3, 'plastikSiyah', 0.15), 0, 0, 0);
    var kol = K.kutu(1.0, 1.5, 0.3, 'plastikKoyu', 0.12);
    K.koy(anahtar, kol, 0, 0, -0.22).rotation.x = 0.18;
    K.koy(g, anahtar, 4.3, H * 0.26, -Dz / 2 - 0.12);
    g.userData.anahtarKol = kol;

    // Ön: kablo demeti (örgülü, siyah)
    if (!ops.kablosuz) {
      var kablolar = new THREE.Group();
      K.parca(kablolar, 'psu-kablolar', 'Güç kabloları', 'Anakarta, işlemciye, ekran kartına ve disklere elektrik taşır.');
      for (var i = 0; i < 6; i++) {
        var x = -4.5 + i * 1.8, y = H * 0.35 + (i % 2) * 1.2;
        kablolar.add(K.kablo([new THREE.Vector3(x, y, Dz / 2 - 0.2), new THREE.Vector3(x, y, Dz / 2 + 3), new THREE.Vector3(x * 1.2, y - 2, Dz / 2 + 7),
          new THREE.Vector3(x * 1.5, 0.4, Dz / 2 + 9 + i * 0.6)], 0.45, 'kablo'));
      }
      g.add(kablolar);
    }
    return g;
  });
})(window.DON3D);
