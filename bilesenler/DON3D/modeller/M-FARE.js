/* M-FARE — kablosuz optik fare. Ölçü birimi: cm (≈ 6,2 × 3,8 × 11,6).
   Orijin: alt-orta. Ön (tuşlar) +Z. */
(function (D) {
  'use strict';
  D.modelTanimla('M-FARE', function (K) {
    var THREE = K.THREE;
    var g = new THREE.Group();
    K.parca(g, 'M-FARE', 'Fare', 'İmleci hareket ettirip tıklamayı sağlayan girdi birimi.');

    // Üst kabuk: yarım küre, tuş ayrım çizgisi dokuda
    var doku = K.canvasDoku(256, 128, function (ctx, w, h) {
      ctx.fillStyle = '#26292f'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#0b0c0e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w * 0.25, 0); ctx.lineTo(w * 0.25, h * 0.62); ctx.stroke();
    });
    var kabukMat = new THREE.MeshStandardMaterial({ map: doku, roughness: 0.42, metalness: 0.05 });
    var kabuk = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), kabukMat);
    kabuk.scale.set(3.1, 3.4, 5.8);
    kabuk.position.y = 0.4;
    g.add(kabuk);
    K.parca(kabuk, 'kabuk', 'Sol ve sağ tuş', 'Tıklama ile seçim yapılır.');

    var taban = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.4, 40), K.mat('plastikSiyah'));
    taban.scale.set(3.1, 1, 5.8);
    taban.position.y = 0.2;
    g.add(taban);

    // Kaydırma tekerleği
    var tekerlek = K.silindir(0.55, 0.7, 'kaucuk', 20);
    tekerlek.rotation.z = Math.PI / 2;
    K.koy(g, tekerlek, 0, 3.3, 2.3);
    tekerlek.rotation.z = Math.PI / 2;
    K.parca(tekerlek, 'tekerlek', 'Kaydırma tekerleği', 'Sayfayı aşağı ve yukarı kaydırır.');
    return g;
  });
})(window.DON3D);
