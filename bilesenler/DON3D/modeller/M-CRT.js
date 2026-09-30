/* M-CRT — eski tüplü (CRT) monitör. İçinde çok yüksek gerilim saklanır; asla açılmaz ve kullanılmaz.
   Ölçü birimi: cm (≈ 38 × 36 × 40). Orijin: alt-orta, ekran +Z. */
(function (D) {
  'use strict';
  D.modelTanimla('M-CRT', function (K) {
    var THREE = K.THREE;
    var g = new THREE.Group();
    K.parca(g, 'M-CRT', 'Tüplü (CRT) monitör', 'Eski monitör. Kapandıktan sonra bile içinde tehlikeli elektrik kalır. Açılmaz.');
    var bej = K.mat('#d8d2c2', { roughness: 0.55 });
    K.koy(g, K.kutu(14, 2, 14, bej, 0.8), 0, 1, 0);            // ayak
    K.koy(g, K.kutu(10, 4, 10, bej, 1.5), 0, 3.5, -2);
    K.koy(g, K.kutu(38, 34, 16, bej, 2.2, 3), 0, 22, 8);       // ön çerçeve
    var arka = K.silindir(10, 22, bej, 24, 16);                 // konik arka gövde
    arka.rotation.x = Math.PI / 2;
    K.koy(g, arka, 0, 22, -10);
    arka.rotation.x = Math.PI / 2;
    // Hafif bombeli cam ekran
    var ekranMat = new THREE.MeshStandardMaterial({ color: 0x1b2a26, roughness: 0.15, metalness: 0.2, emissive: 0x0b1512 });
    var ekran = K.kutu(30, 24.5, 1.4, ekranMat, 0.7, 3);
    K.koy(g, ekran, 0, 22.5, 16.1);
    K.koy(g, K.kutu(33, 28, 0.6, K.mat('#bdb6a4', { roughness: 0.6 }), 0.8), 0, 22.5, 15.9);
    ekran.userData.secilmez = true;
    K.koy(g, K.kutu(4, 1.2, 0.6, 'plastikGri', 0.2), 12, 7.2, 16.1);
    K.koy(g, new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), K.led('#22c55e', 1.2)), 8, 7.2, 16.2);
    return g;
  });
})(window.DON3D);
