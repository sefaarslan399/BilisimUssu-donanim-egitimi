/* M-PIL — lityum iyon pil hücresi (telefon/dizüstü tipi yassı hücre); normal ve şişmiş durumlar.
   Ölçü birimi: cm (6 × 0.5 × 8). Orijin: alt-orta. ops.sismis: true → şişmiş başlar.
   userData.sisir(oran 0–1, sure) → Promise: şişkinliği ve kırmızılaşmayı ayarlar. userData.isit(oran) : renk. */
(function (D) {
  'use strict';
  D.modelTanimla('M-PIL', function (K, ops) {
    var THREE = K.THREE;
    ops = ops || {};
    var W = 6, T = 0.5, L = 8;
    var g = new THREE.Group();
    K.parca(g, 'M-PIL', ops.sismis ? 'Şişmiş pil' : 'Lityum pil', ops.sismis ?
      'Şişmiş pil tehlikelidir: dokunma, bastırma, delme. Bir yetişkine haber ver.' : 'Telefon ve dizüstünde enerjiyi depolayan pil.');
    var kaplamaMat = new THREE.MeshStandardMaterial({ color: 0x9aa7b8, roughness: 0.3, metalness: 0.75 });
    var govde = K.kutu(W, T, L, kaplamaMat, 0.18, 3);
    K.koy(g, govde, 0, T / 2, 0);
    // Şişkinlik: üstte basık elipsoit
    var sis = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), kaplamaMat);
    sis.scale.set(W / 2 - 0.2, 0.01, L / 2 - 0.3);
    K.koy(g, sis, 0, T - 0.02, 0);
    // Etiket
    var etiketDoku = K.canvasDoku(256, 320, function (ctx, w, h) {
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff'; ctx.font = '800 30px Inter, Arial, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Li-ion', w / 2, 70); ctx.font = '700 22px Inter, Arial, sans-serif';
      ctx.fillText('3.85 V', w / 2, 120); ctx.fillText('4000 mAh', w / 2, 152);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(24, 200, w - 48, 80);
      ctx.font = '700 18px Inter, Arial, sans-serif'; ctx.fillText('Delme · Ezme', w / 2, 232); ctx.fillText('Ateşe atma', w / 2, 262);
    });
    var etiket = K.duzlem(W - 1, L - 1.6, new THREE.MeshStandardMaterial({ map: etiketDoku, roughness: 0.5 }));
    etiket.rotation.x = -Math.PI / 2;
    K.koy(g, etiket, 0, T + 0.005, -0.3).userData.secilmez = true;
    etiket.rotation.x = -Math.PI / 2;
    // Koruma devresi ve bağlantı şeridi
    K.koy(g, K.kutu(W - 0.6, T * 0.8, 0.9, 'pcb', 0.08), 0, T * 0.45, L / 2 + 0.35);
    K.koy(g, K.kutu(1.0, 0.06, 2.4, K.mat('#c47a23', { roughness: 0.4, metalness: 0.3 })), 1.2, T * 0.5, L / 2 + 1.6);
    K.koy(g, K.kutu(1.1, 0.3, 0.7, 'plastikSiyah', 0.05), 1.2, T * 0.55, L / 2 + 2.9);
    var normalRenk = new THREE.Color(0x9aa7b8), sicakRenk = new THREE.Color(0xef4444);
    function uygula(e) {
      sis.scale.y = 0.01 + e * 1.5;
      etiket.position.y = T + 0.005 + e * 1.5 * 0.92;
      etiket.scale.set(1 - e * 0.12, 1 - e * 0.12, 1);
    }
    g.userData.sisir = function (oran, sure) {
      var bas = g.userData.oran || 0; g.userData.oran = oran;
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 1.5 : sure, anahtar: 'sisir', hedef: g,
        guncelle: function (e) { uygula(bas + (oran - bas) * e); } });
    };
    g.userData.isit = function (oran) {
      kaplamaMat.color.copy(normalRenk).lerp(sicakRenk, oran);
      kaplamaMat.emissive = kaplamaMat.emissive || new THREE.Color();
      kaplamaMat.emissive.set(0xff3b1f); kaplamaMat.emissiveIntensity = oran * 0.35;
    };
    g.userData.oran = ops.sismis ? 1 : 0;
    uygula(g.userData.oran);
    return g;
  });
})(window.DON3D);
