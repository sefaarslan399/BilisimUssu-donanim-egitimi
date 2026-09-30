/* M-FAN — 12 cm kasa fanı (120 × 120 × 25 mm): çerçeve, 4 vida deliği, motor göbeği ve payandalar, 7 eğik kanat.
   Ölçü birimi: cm (12 × 12 × 2,5). Orijin: fanın geometrik merkezi. Dönme ekseni yerel Z.
   Ön yüz (hava girişi) +Z, arka yüz (payandalar, motor, hava çıkışı) −Z: hava +Z'den girer, −Z'den çıkar.
   Parçalar: 'fan-cerceve' (çerçeve + vida delikleri), 'fan-kanatlar' (rotor: göbek + kanatlar), 'fan-motor' (arka göbek ve payandalar),
             'fan-toz' (toz topakları; yalnız toz oranı > 0 iken görünür).
   ops: { hiz: rad/sn (varsayılan 0), tozlu: true → toz kaplı başlar (oran 1), toz: 0–1 başlangıç toz oranı, kablosuz: true → kablo çizilmez }
   userData API:
     rotor                 → THREE.Group, yerel Z ekseninde döner (rotor.rotation.z)
     hiz                   → istenen açısal hız (rad/sn). Okunur/yazılır; baslat() bu değeri kullanır.
     tozOrani              → geçerli toz oranı (0–1), salt okunur
     etkinHiz()            → gerçek dönüş hızı = hiz × (1 − 0,6 × tozOrani)  (toz kanatları ağırlaştırır, fan yavaşlar)
     baslat(sahne?)        → rotoru her karede döndürmeye başlar (sahne verilmezse modelin sahnesi bulunur). Döner: durdur()
     hizAyarla(hiz, sure)  → Promise; hızı yumuşakça değiştirir (ör. 0 → fan durur; sure 0 → anında)
     tozla(oran, sure)     → Promise (sure 0 → anında); toz oranını 0–1 arasına yumuşakça taşır (renk koyulaşır, topaklar büyür, fan yavaşlar).
                              H13 "tozlu fan yavaşlar" animasyonu: fan.userData.tozla(1, 3) ile toz birikir, temizlikte tozla(0, 1). */
(function (D) {
  'use strict';
  D.modelTanimla('M-FAN', function (K, ops) {
    var THREE = K.THREE, V3 = K.V3;
    ops = ops || {};
    var A = 12, DZ = 2.5, RI = 5.72, RV = 0.22, VA = 5.25;   // kenar, derinlik, iç çap yarıçapı, vida deliği, vida aralığı/2
    var g = new THREE.Group();
    K.parca(g, 'M-FAN', 'Fan (12 cm)', 'Kanatlarıyla havayı iterek sıcak havayı parçaların üstünden uzaklaştırır.');

    // Malzemeler (model başına ayrı: toz rengi bunları değiştirir)
    var cerceveMat = new THREE.MeshStandardMaterial({ color: 0x1b1d21, roughness: 0.55, metalness: 0.05 });
    var kanatMat = new THREE.MeshStandardMaterial({ color: 0x24272c, roughness: 0.42, metalness: 0.02, side: THREE.DoubleSide });
    var etiketRenk = ops.etiketRenk || '#e5e7eb';

    // ── Çerçeve: yuvarlak köşeli kare, dairesel hava deliği ve 4 vida deliği (ekstrüzyon)
    var s = new THREE.Shape(), h = A / 2, rk = 0.9;
    s.moveTo(-h + rk, -h); s.lineTo(h - rk, -h); s.quadraticCurveTo(h, -h, h, -h + rk);
    s.lineTo(h, h - rk); s.quadraticCurveTo(h, h, h - rk, h); s.lineTo(-h + rk, h);
    s.quadraticCurveTo(-h, h, -h, h - rk); s.lineTo(-h, -h + rk); s.quadraticCurveTo(-h, -h, -h + rk, -h);
    var delik = new THREE.Path(); delik.absarc(0, 0, RI, 0, Math.PI * 2, true); s.holes.push(delik);
    [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(function (c) {
      var v = new THREE.Path(); v.absarc(c[0] * VA, c[1] * VA, RV, 0, Math.PI * 2, true); s.holes.push(v);
    });
    var cerGeo = new THREE.ExtrudeGeometry(s, { depth: DZ, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 1, curveSegments: 24 });
    cerGeo.translate(0, 0, -DZ / 2);
    var cerceve = new THREE.Mesh(cerGeo, cerceveMat);
    K.parca(cerceve, 'fan-cerceve', 'Fan çerçevesi', 'Fanı kasaya ya da soğutucuya tutturur; köşelerde vida delikleri vardır.');
    g.add(cerceve);
    var onYuz = new THREE.ShapeGeometry(s, 24), uvA = onYuz.attributes.uv;
    for (var ui = 0; ui < uvA.count; ui++) uvA.setXY(ui, uvA.getX(ui) / 3.5, uvA.getY(ui) / 3.5);
    // Köşelerde çerçeve içi basamak (gerçek fanlardaki vida yuvası cebi): ince halka
    var cepGeo = new THREE.RingGeometry(RV + 0.02, 0.62, 20);
    [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(function (c) {
      [1, -1].forEach(function (yz) {
        var r = new THREE.Mesh(cepGeo, K.mat('#101114', { roughness: 0.7 }));
        r.position.set(c[0] * VA, c[1] * VA, yz * (DZ / 2 + 0.065));
        if (yz < 0) r.rotation.y = Math.PI;
        r.userData.secilmez = true; r.userData.golgeYok = true;
        g.add(r);
      });
    });

    // ── Arka: motor göbeği + 4 payanda (−Z tarafında)
    var motor = new THREE.Group();
    K.parca(motor, 'fan-motor', 'Motor ve payandalar', 'Fanın motoru göbekte durur; ince kollar onu çerçeveye bağlar.');
    var gobekArka = K.silindir(2.05, 0.5, cerceveMat, 28);
    gobekArka.rotation.x = Math.PI / 2;
    K.koy(motor, gobekArka, 0, 0, -DZ / 2 + 0.25);
    gobekArka.rotation.x = Math.PI / 2;
    // Arka göbek etiketi (jenerik; marka yok)
    var etDoku = K.canvasDoku(256, 256, function (ctx, w, hh) {
      ctx.fillStyle = '#16181b'; ctx.fillRect(0, 0, w, hh);
      ctx.fillStyle = etiketRenk; ctx.beginPath(); ctx.arc(w / 2, hh / 2, w / 2 - 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '800 30px Arial, sans-serif'; ctx.fillText('DC 12V', w / 2, hh / 2 - 34);
      ctx.font = '700 24px Arial, sans-serif'; ctx.fillText('0.20A', w / 2, hh / 2 + 4);
      ctx.fillText('120 mm', w / 2, hh / 2 + 38);
    });
    var etMat = new THREE.MeshStandardMaterial({ map: etDoku, roughness: 0.6 });
    var et = new THREE.Mesh(new THREE.CircleGeometry(1.85, 28), etMat);
    et.rotation.y = Math.PI;
    et.position.set(0, 0, -DZ / 2 - 0.005);
    et.userData.golgeYok = true;
    motor.add(et);
    for (var p = 0; p < 4; p++) {
      var aci = Math.PI / 4 + p * Math.PI / 2;
      var kol = K.kutu(RI - 1.9, 0.42, 0.34, cerceveMat, 0.08);
      kol.position.set(Math.cos(aci) * (1.9 + (RI - 1.9) / 2), Math.sin(aci) * (1.9 + (RI - 1.9) / 2), -DZ / 2 + 0.2);
      kol.rotation.z = aci;
      motor.add(kol);
    }
    g.add(motor);

    // Kablo (arka alt köşeden çıkan ince siyah kablo)
    if (!ops.kablosuz) {
      var kablo = K.kablo([new V3(-2, -1.4, -DZ / 2 + 0.2), new V3(-3.6, -3.8, -DZ / 2 + 0.2), new V3(-h + 0.4, -h + 0.8, -DZ / 2 + 0.3),
        new V3(-h - 0.6, -h + 0.4, -DZ / 2 + 0.6), new V3(-h - 1.8, -h - 0.2, -DZ / 2 + 1)], 0.12, 'kablo');
      kablo.userData.secilmez = true;
      g.add(kablo);
    }

    // ── Rotor: göbek kapağı + 7 eğik (helis) kanat
    var rotor = new THREE.Group();
    K.parca(rotor, 'fan-kanatlar', 'Fan kanatları', 'Motor kanatları döndürür; eğik kanatlar havayı ön yüzden arka yüze iter.');
    var gobek = K.silindir(1.95, 1.7, kanatMat, 28);
    gobek.rotation.x = Math.PI / 2;
    K.koy(rotor, gobek, 0, 0, 0.25);
    gobek.rotation.x = Math.PI / 2;
    var kapakOn = new THREE.Mesh(new THREE.CircleGeometry(1.95, 28), kanatMat);
    kapakOn.position.z = 1.1; kapakOn.userData.golgeYok = true;
    rotor.add(kapakOn);
    // Kanat: parametrik helis yüzey (ızgara) — kök→uç süpürmeli, açısal konumla eğimli (hava iter)
    var kanatGeo = K.geoPaylas('fan-kanat:v2', function () {
      var rh = 1.8, rt = 5.55, nu = 12, nv = 7, konum = [], indeks = [], uv = [];
      for (var i = 0; i <= nu; i++) {
        var t = i / nu, r = rh + (rt - rh) * t;
        var sup = 0.55 * Math.pow(t, 1.25), gen = 0.72 + 0.2 * t;
        for (var j = 0; j <= nv; j++) {
          var sv0 = j / nv - 0.5, f = sup + sv0 * gen;
          konum.push(Math.cos(f) * r, Math.sin(f) * r, sv0 * gen * 1.55 * (1 - 0.25 * t) + 0.05 * Math.sin(Math.PI * (sv0 + 0.5)));
          uv.push(t, j / nv);
        }
      }
      for (i = 0; i < nu; i++) {
        for (var k = 0; k < nv; k++) {
          var a0 = i * (nv + 1) + k, a1 = a0 + 1, b0 = a0 + nv + 1, b1 = b0 + 1;
          indeks.push(a0, b0, a1, a1, b0, b1);
        }
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(indeks);
      geo.computeVertexNormals();
      return geo;
    });
    // Toz kaplaması: benekli, yarı saydam gri katman (opaklığı toz oranıyla artar)
    var tozDoku = K.canvasDoku(256, 256, function (ctx, w, hh) {
      var r2 = K.rng(21), i, rr;
      ctx.fillStyle = 'rgba(128,124,118,0.62)'; ctx.fillRect(0, 0, w, hh);
      for (i = 0; i < 700; i++) {            // yumuşak, kabarık toz lekeleri
        rr = 3 + r2() * 11;
        var gr = ctx.createRadialGradient(0, 0, 0, 0, 0, rr), x = r2() * w, y = r2() * hh, ton = 150 + Math.floor(r2() * 30);
        gr.addColorStop(0, 'rgba(' + ton + ',' + (ton - 5) + ',' + (ton - 12) + ',' + (0.2 + r2() * 0.3).toFixed(2) + ')');
        gr.addColorStop(1, 'rgba(' + ton + ',' + (ton - 5) + ',' + (ton - 12) + ',0)');
        ctx.save(); ctx.translate(x, y); ctx.fillStyle = gr; ctx.fillRect(-rr, -rr, rr * 2, rr * 2); ctx.restore();
      }
      for (i = 0; i < 260; i++) {            // ince lif ve koyu benekler
        ctx.strokeStyle = 'rgba(95,90,84,' + (0.25 + r2() * 0.3).toFixed(2) + ')'; ctx.lineWidth = 0.8;
        var x0 = r2() * w, y0 = r2() * hh;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + (r2() - 0.5) * 10, y0 + (r2() - 0.5) * 10, x0 + (r2() - 0.5) * 14, y0 + (r2() - 0.5) * 14); ctx.stroke();
      }
    });
    tozDoku.wrapS = tozDoku.wrapT = THREE.RepeatWrapping;
    var kaplamaMat = new THREE.MeshStandardMaterial({ map: tozDoku, transparent: true, opacity: 0, roughness: 1, depthWrite: false, side: THREE.DoubleSide });
    kaplamaMat.polygonOffset = true; kaplamaMat.polygonOffsetFactor = -2; kaplamaMat.polygonOffsetUnits = -2;
    var kaplamalar = [];
    for (var b = 0; b < 7; b++) {
      var kanat = new THREE.Mesh(kanatGeo, kanatMat);
      var kap = new THREE.Mesh(kanatGeo, kaplamaMat);
      kap.position.z = 0.02; kap.userData.secilmez = true; kap.userData.golgeYok = true; kap.raycast = function () {};
      kanat.add(kap); kaplamalar.push(kap);
      kanat.rotation.z = b * Math.PI * 2 / 7;
      kanat.position.z = 0.1;
      rotor.add(kanat);
    }
    var kapakToz = new THREE.Mesh(kapakOn.geometry, kaplamaMat);
    kapakToz.position.z = 1.12; kapakToz.userData.secilmez = true; kapakToz.userData.golgeYok = true; kapakToz.raycast = function () {};
    rotor.add(kapakToz); kaplamalar.push(kapakToz);
    g.add(rotor);

    // ── Toz: kanatlarda ve çerçevede topaklar (InstancedMesh; ölçekleri toz oranıyla büyür)
    var tozMat = new THREE.MeshStandardMaterial({ color: 0x7a746b, roughness: 1, metalness: 0 });
    var tozGeo = K.geoPaylas('fan-toz:v1', function () { return new THREE.IcosahedronGeometry(1, 0); });
    var rng = K.rng(ops.tohum || 7);
    function tozKume(sayi, uret) {
      var tabanlar = [];
      for (var i = 0; i < sayi; i++) tabanlar.push(uret(i));
      var im = new THREE.InstancedMesh(tozGeo, tozMat, sayi);
      im.userData.tabanlar = tabanlar;
      im.userData.secilmez = true;
      im.userData.golgeYok = true;
      im.castShadow = false;
      return im;
    }
    // kanat hücum kenarlarında (rotorla döner)
    var kanatToz = tozKume(84, function (i) {
      var bi = i % 7, t = 0.08 + 0.9 * rng();
      var r = 1.8 + (5.55 - 1.8) * t, f = bi * Math.PI * 2 / 7 + 0.55 * Math.pow(t, 1.25) + (0.36 + 0.1 * t) * (0.55 + 0.45 * rng());
      return { p: new V3(Math.cos(f) * r, Math.sin(f) * r, 0.5 + rng() * 0.25), s: 0.06 + rng() * 0.1 };
    });
    rotor.add(kanatToz);
    // çerçeve iç halkası ve köşeler (sabit)
    var cerToz = tozKume(90, function (i) {
      if (i < 66) {
        var f = rng() * Math.PI * 2, r = RI - 0.05 + rng() * 0.08;
        return { p: new V3(Math.cos(f) * r, Math.sin(f) * r, (rng() - 0.3) * DZ * 0.8), s: 0.07 + rng() * 0.1 };
      }
      var c = [[1, 1], [-1, 1], [-1, -1], [1, -1]][i % 4];
      return { p: new V3(c[0] * (VA + (rng() - 0.5) * 1.2), c[1] * (VA + (rng() - 0.5) * 1.2), DZ / 2 + 0.05), s: 0.08 + rng() * 0.1 };
    });
    K.parca(cerToz, 'fan-toz', 'Toz', 'Biriken toz kanatları ağırlaştırır, fan yavaşlar ve parçalar daha çok ısınır.');
    g.add(cerToz);
    var cerKaplama = new THREE.Mesh(onYuz, kaplamaMat);
    cerKaplama.position.z = DZ / 2 + 0.065; cerKaplama.userData.secilmez = true; cerKaplama.userData.golgeYok = true; cerKaplama.raycast = function () {};
    g.add(cerKaplama); kaplamalar.push(cerKaplama);

    var m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), sv = new V3();
    var temizCer = new THREE.Color(0x1b1d21), temizKanat = new THREE.Color(0x24272c), tozRenk = new THREE.Color(0x857d72);
    function tozUygula(o) {
      g.userData.tozOrani = o;
      [kanatToz, cerToz].forEach(function (im) {
        im.userData.tabanlar.forEach(function (tb, i) {
          var olc = o <= 0.001 ? 0.0001 : tb.s * Math.min(1, o * 1.25);
          q4.setFromEuler(new THREE.Euler(i * 1.3, i * 0.7, i * 2.1));
          sv.set(olc * 1.6, olc * 0.45, olc * 1.1);
          m4.compose(tb.p, q4, sv);
          im.setMatrixAt(i, m4);
        });
        im.instanceMatrix.needsUpdate = true;
        im.visible = o > 0.001;
      });
      cerceveMat.color.copy(temizCer).lerp(tozRenk, o * 0.3);
      kanatMat.color.copy(temizKanat).lerp(tozRenk, o * 0.35);
      kaplamaMat.opacity = Math.min(1, o * 1.1);
      kaplamalar.forEach(function (m) { m.visible = o > 0.001; });
      cerceveMat.roughness = 0.55 + 0.4 * o; kanatMat.roughness = 0.42 + 0.55 * o;
    }

    // ── API
    g.userData.rotor = rotor;
    g.userData.hiz = ops.hiz || 0;
    g.userData.etkinHiz = function () { return g.userData.hiz * (1 - 0.6 * (g.userData.tozOrani || 0)); };
    g.userData.baslat = function (sahne) {
      var sh = sahne || D.sahneBul(g);
      if (!sh) return function () {};
      return sh.herKare(function (dt) {
        rotor.rotation.z -= g.userData.etkinHiz() * dt * (D.azHareket() ? 0.15 : 1);
      });
    };
    g.userData.hizAyarla = function (yeni, sure) {
      var bas = g.userData.hiz;
      if (sure === 0) { g.userData.hiz = yeni; return Promise.resolve(); }
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 1 : sure, anahtar: 'fan-hiz', hedef: g,
        guncelle: function (e) { g.userData.hiz = bas + (yeni - bas) * e; } });
    };
    g.userData.tozla = function (oran, sure) {
      var bas = g.userData.tozOrani || 0;
      oran = Math.max(0, Math.min(1, oran));
      if (sure === 0) { tozUygula(oran); return Promise.resolve(); }
      return D.tween({ sahne: D.sahneBul(g), sure: sure == null ? 1.5 : sure, anahtar: 'fan-toz', hedef: g,
        guncelle: function (e) { tozUygula(bas + (oran - bas) * e); } });
    };
    g.userData.olcu = { A: A, DZ: DZ };
    tozUygula(ops.tozlu ? 1 : (ops.toz || 0));
    return g;
  });
})(window.DON3D);
