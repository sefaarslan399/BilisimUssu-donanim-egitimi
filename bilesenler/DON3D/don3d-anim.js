/* ════════════════════════════════════════════════════════════════════
   DON3D — Animasyon kalıpları (A-*). Hepsi Promise döner, zincirlenebilir.
   Zamanlama: 0,4–1,2 sn, easeInOutCubic. prefers-reduced-motion'da süreler kısalır.
   ════════════════════════════════════════════════════════════════════ */
(function (kok) {
  'use strict';
  var THREE = kok.THREE, D = kok.DON3D;
  if (!THREE || !D) return;
  var V3 = THREE.Vector3;

  /* ─── A-VURGU: parça parlar + dış hat + HTML etiket ─── */
  var cizgiMat = {};
  function cizgiMalzeme(renk) {
    if (!cizgiMat[renk]) {
      cizgiMat[renk] = new THREE.LineBasicMaterial({ color: new THREE.Color(renk), transparent: true, opacity: 0.95, depthTest: true });
      cizgiMat[renk].userData.paylasimli = true;
    }
    return cizgiMat[renk];
  }

  /**
   * DON3D.vurgula(parca, { renk, etiket, sure, hat })
   * etiket: metin | false (varsayılan: parca.userData.etiket)
   */
  D.vurgula = function (parca, ops) {
    ops = ops || {};
    var s = D.sahneBul(parca);
    var renk = ops.renk || D.vurguRengi(s ? s.kap : null);
    var k = parca.userData._vurgu;
    if (!k) {
      k = { mats: [], hatlar: [], etiket: null };
      parca.traverse(function (o) {
        if (!o.isMesh || o.userData.vurguHaric || !o.material || !o.material.isMeshStandardMaterial) return;
        var eski = o.material, yeni = eski.clone();
        yeni.userData = {};
        yeni.emissive = new THREE.Color(renk);
        yeni.emissiveIntensity = 0;
        o.material = yeni;
        k.mats.push([o, eski, yeni]);
        if (ops.hat !== false && !o.isInstancedMesh && o.geometry.attributes.position.count < 6000) {
          var h = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 40), cizgiMalzeme(renk));
          h.userData.secilmez = true;
          h.raycast = function () {};
          o.add(h);
          k.hatlar.push(h);
        }
      });
      parca.userData._vurgu = k;
    }
    if (k.etiket) { k.etiket.kaldir(); k.etiket = null; }
    var metin = ops.etiket === false ? null : (ops.etiket || parca.userData.etiket);
    if (s && metin) k.etiket = s.etiket(parca, metin, { tur: 'vurgu' });
    return D.tween({ sahne: s, sure: ops.sure == null ? 0.6 : ops.sure, anahtar: 'vurgu', hedef: parca, guncelle: function (e) {
      k.mats.forEach(function (x) { x[2].emissiveIntensity = 0.22 * e; });
    } });
  };

  /** Vurguyu kaldırır (malzemeler geri yüklenir). */
  D.vurguKaldir = function (parca, sure) {
    var k = parca.userData._vurgu;
    if (!k) return Promise.resolve();
    var s = D.sahneBul(parca);
    if (k.etiket) { k.etiket.kaldir(); k.etiket = null; }
    var basla = k.mats.length ? k.mats[0][2].emissiveIntensity : 0;
    return D.tween({ sahne: s, sure: sure == null ? 0.35 : sure, anahtar: 'vurgu', hedef: parca, guncelle: function (e) {
      k.mats.forEach(function (x) { x[2].emissiveIntensity = basla * (1 - e); });
    } }).then(function () {
      if (parca.userData._vurgu !== k) return;
      k.mats.forEach(function (x) { x[0].material = x[1]; x[2].dispose(); });
      k.hatlar.forEach(function (h) { if (h.parent) h.parent.remove(h); h.geometry.dispose(); });
      delete parca.userData._vurgu;
    });
  };

  /** Parçaları sırayla vurgular: her biri 'bekle' sn parlar. */
  D.siraylaVurgula = function (parcalar, ops) {
    ops = ops || {};
    var bekle = ops.bekle == null ? 1.4 : ops.bekle;
    var zincir = Promise.resolve();
    parcalar.forEach(function (p) {
      zincir = zincir.then(function () { return D.vurgula(p, ops); })
        .then(function () { return D.bekle(bekle, D.sahneBul(p)); })
        .then(function () { if (!ops.birak) return D.vurguKaldir(p); });
    });
    return zincir;
  };

  /* ─── A-KATMAN: katman belirir/kaybolur (ör. yazılım katmanı) ─── */
  /**
   * DON3D.katman(sahne, yuzeyMesh, { ayrik: cm, katmanlar: [{ ad, ciz(ctx,w,h) }], etiketOn })
   * Döner: { sec(i) → Promise, gizle() → Promise, aktif }
   * Seçilen katman ekran yüzeyine uygulanır; aynı görüntü yarı saydam bir katman olarak
   * yüzeyin önünde belirir (yazılım = donanımın üstünde çalışan katman).
   */
  D.katman = function (sahne, yuzey, ops) {
    ops = ops || {};
    yuzey.geometry.computeBoundingBox();
    var bb = yuzey.geometry.boundingBox;
    var w = bb.max.x - bb.min.x, h = bb.max.y - bb.min.y;
    var doku = D.kit.canvasDoku(512, Math.round(512 * h / w), function () {});
    var katMat = new THREE.MeshBasicMaterial({ map: doku, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    katMat.toneMapped = false;
    var plaka = new THREE.Mesh(new THREE.PlaneGeometry(w, h), katMat);
    plaka.userData.secilmez = true;
    plaka.renderOrder = 5;
    var cerceve = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)),
      new THREE.LineBasicMaterial({ color: new THREE.Color(D.cssDeger('--brand', sahne.kap) || '#0ea5e9'), transparent: true, opacity: 0 }));
    plaka.add(cerceve);
    yuzey.add(plaka);
    var ayrik = ops.ayrik == null ? 9 : ops.ayrik;
    var ekranMat = yuzey.material;
    var etiket = null;
    var api = { aktif: -1, plaka: plaka, doku: doku };

    function ciz(i) {
      var k = ops.katmanlar[i];
      doku.userData.ciz(function (ctx, cw, ch) { ctx.clearRect(0, 0, cw, ch); k.ciz(ctx, cw, ch); });
      if (ekranMat.emissiveMap !== undefined) {
        ekranMat.emissiveMap = doku; ekranMat.map = doku; ekranMat.needsUpdate = true;
      }
    }
    api.sec = function (i) {
      var onceki = api.aktif;
      api.aktif = i;
      var geri = onceki < 0 ? Promise.resolve() : D.tween({ sahne: sahne, sure: 0.35, anahtar: 'katman', hedef: plaka, guncelle: function (e) {
        katMat.opacity = 0.88 * (1 - e); cerceve.material.opacity = 1 - e; plaka.position.z = ayrik * (1 - e);
      } });
      return geri.then(function () {
        ciz(i);
        if (etiket) etiket.kaldir();
        if (ops.katmanlar[i].ad) etiket = sahne.etiket(plaka, ops.katmanlar[i].ad, { tur: 'vurgu', ofset: [0, 1.5, 0] });
        return D.tween({ sahne: sahne, sure: 0.8, anahtar: 'katman', hedef: plaka, ease: 'easeOutCubic', guncelle: function (e) {
          katMat.opacity = 0.88 * e; cerceve.material.opacity = e; plaka.position.z = ayrik * e;
        } });
      });
    };
    api.gizle = function () {
      if (etiket) { etiket.kaldir(); etiket = null; }
      api.aktif = -1;
      return D.tween({ sahne: sahne, sure: 0.4, anahtar: 'katman', hedef: plaka, guncelle: function (e) {
        katMat.opacity = 0.88 * (1 - e); cerceve.material.opacity = 1 - e; plaka.position.z = ayrik * (1 - e);
      } });
    };
    return api;
  };

  /* ─── A-AKIS: parçacıkların bir yol boyunca akışı ─── */
  var parcacikDokusu = null;
  function parcacikDoku() {
    if (parcacikDokusu) return parcacikDokusu;
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    parcacikDokusu = new THREE.CanvasTexture(c);
    return parcacikDokusu;
  }

  function noktaya(p) {
    if (p.isVector3) return p.clone();
    if (p.isObject3D) { p.updateWorldMatrix(true, false); return p.getWorldPosition(new V3()); }
    return new V3().fromArray(p);
  }

  /**
   * DON3D.akis(sahne, yol, { renk, hiz (cm/sn), parcacik (iz uzunluğu), boyut, etiket, kalici })
   * yol: Vector3 | Object3D | [x,y,z] dizisi (dünya koordinatı). Promise döner.
   * etiket: parçacık başını izleyen HTML etiket metni (ör. harf).
   */
  D.akis = function (sahne, yol, ops) {
    ops = ops || {};
    var noktalar = yol.map(noktaya);
    var egri = new THREE.CatmullRomCurve3(noktalar, false, 'centripetal');
    var uzunluk = egri.getLength();
    var n = D.azHareket() ? 3 : (ops.parcacik || 14);
    var konum = new Float32Array(n * 3);
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(konum, 3));
    var renk = new THREE.Color(ops.renk || D.vurguRengi(sahne.kap));
    var mat = new THREE.PointsMaterial({
      color: renk, size: ops.boyut || 6, map: parcacikDoku(), transparent: true, opacity: 1,
      depthTest: false, depthWrite: false, blending: THREE.NormalBlending, sizeAttenuation: true
    });
    mat.toneMapped = false;
    var noktaBulutu = new THREE.Points(geo, mat);
    noktaBulutu.renderOrder = 10;
    noktaBulutu.frustumCulled = false;
    noktaBulutu.userData.secilmez = true;
    sahne.scene.add(noktaBulutu);
    // Baş: parlak küre + beyaz çekirdek (açık arka planda da görünür)
    var bas = new THREE.Mesh(new THREE.SphereGeometry(ops.basBoyut || 1.3, 16, 12),
      new THREE.MeshBasicMaterial({ color: renk, depthTest: false, depthWrite: false, transparent: true }));
    bas.material.toneMapped = false;
    var cekirdek = new THREE.Mesh(new THREE.SphereGeometry((ops.basBoyut || 1.3) * 0.5, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, depthWrite: false, transparent: true }));
    bas.add(cekirdek);
    bas.renderOrder = 11; cekirdek.renderOrder = 12;
    bas.userData.secilmez = true; bas.raycast = function () {}; cekirdek.raycast = function () {};
    sahne.scene.add(bas);
    // İz: yol boyunca büyüyen parlak şerit (yolun okunmasını kolaylaştırır)
    var izGeo = null, izMat = null, iz = null, izBolum = Math.max(32, Math.round(uzunluk / 1.5)), izRadyal = 6;
    if (ops.iz !== false) {
      izGeo = new THREE.TubeGeometry(egri, izBolum, ops.izKalinlik || 0.6, izRadyal, false);
      izMat = new THREE.MeshBasicMaterial({ color: renk, transparent: true, opacity: 0.7, depthTest: false, depthWrite: false });
      izMat.toneMapped = false;
      iz = new THREE.Mesh(izGeo, izMat);
      iz.renderOrder = 9; iz.frustumCulled = false; iz.userData.secilmez = true;
      iz.raycast = function () {};
      izGeo.setDrawRange(0, 0);
      sahne.scene.add(iz);
    }
    var etiket = ops.etiket ? sahne.etiket(bas, ops.etiket, { tur: 'harf', yer: 'merkez' }) : null;
    var aralik = Math.min(0.018, 2.2 / Math.max(uzunluk, 1));
    var sure = ops.sure || uzunluk / (ops.hiz || 45);

    function yerlestir(t) {
      var p = new V3();
      for (var i = 0; i < n; i++) {
        var ti = t - i * aralik;
        if (ti < 0) ti = 0;
        egri.getPointAt(Math.min(ti, 1), p);
        konum[i * 3] = p.x; konum[i * 3 + 1] = p.y; konum[i * 3 + 2] = p.z;
      }
      geo.attributes.position.needsUpdate = true;
      egri.getPointAt(Math.min(t, 1), bas.position);
      if (izGeo) izGeo.setDrawRange(0, Math.floor(Math.min(t, 1) * izBolum) * izRadyal * 6);
    }
    yerlestir(0);
    return D.tween({ sahne: sahne, sure: sure, ease: 'easeInOutCubic', guncelle: function (e) { yerlestir(e); } })
      .then(function () {
        if (ops.kalici) return;
        return D.tween({ sahne: sahne, sure: 0.35, guncelle: function (e) {
          yerlestir(1 + e * n * aralik);
          mat.opacity = 1 - e;
          if (izMat) izMat.opacity = 0.7 * (1 - e);
          bas.material.opacity = 1 - e; cekirdek.material.opacity = 1 - e;
        } });
      })
      .then(function () {
        if (etiket) etiket.kaldir();
        if (!ops.kalici) {
          sahne.scene.remove(noktaBulutu); sahne.scene.remove(bas);
          geo.dispose(); mat.dispose();
          if (iz) { sahne.scene.remove(iz); izGeo.dispose(); izMat.dispose(); }
          bas.geometry.dispose(); bas.material.dispose(); cekirdek.geometry.dispose(); cekirdek.material.dispose();
        }
        return egri;
      });
  };

  /* ─── Yardımcı: kısa "bas" (tuşa basma) ve nabız hareketi ─── */
  /** Parçayı eksen boyunca itip geri bırakır (ör. tuşa basma). */
  D.bas = function (parca, ops) {
    ops = ops || {};
    var s = D.sahneBul(parca);
    var eksen = ops.eksen || 'y', mesafe = ops.mesafe == null ? -0.35 : ops.mesafe;
    var y0 = parca.position[eksen];
    return D.tween({ sahne: s, sure: 0.16, ease: 'easeOutCubic', guncelle: function (e) { parca.position[eksen] = y0 + mesafe * e; } })
      .then(function () {
        return D.tween({ sahne: s, sure: 0.22, ease: 'easeOutCubic', guncelle: function (e) { parca.position[eksen] = y0 + mesafe * (1 - e); } });
      });
  };

  /** LED yanıp söner (malzeme emissiveIntensity). */
  D.yanipSon = function (mesh, ops) {
    ops = ops || {};
    var s = D.sahneBul(mesh);
    var m = mesh.material, k0 = m.emissiveIntensity, tepe = ops.tepe || 4, kez = ops.kez || 3;
    return D.tween({ sahne: s, sure: ops.sure || 0.9, ease: 'lineer', guncelle: function (e, t) {
      m.emissiveIntensity = t >= 1 ? k0 : (Math.sin(t * Math.PI * 2 * kez) > 0 ? tepe : k0 * 0.3);
    } });
  };


  /* ─── Ses: kısa "klik" ve yumuşak "hata" (MASTER ses ayarına uyar) ─── */
  D.ses = function (tur) {
    try {
      if (typeof soundEnabled !== 'undefined' && !soundEnabled) return; // eslint-disable-line no-undef
      var AC = kok.AudioContext || kok.webkitAudioContext;
      if (!AC) return;
      var ctx = D._sesCtx || (D._sesCtx = new AC());
      var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      if (tur === 'klik') {
        o.type = 'square'; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.03);
        g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        o.start(t); o.stop(t + 0.06);
      } else {
        o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.18);
        g.gain.setValueAtTime(0.07, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t); o.stop(t + 0.24);
      }
      o.connect(g); g.connect(ctx.destination);
    } catch (e) {}
  };

  /* ─── Yardımcı: konum tweeni (ebeveyn koordinatında) ─── */
  function git(parca, hedef, sure, ease) {
    var s = D.sahneBul(parca), b = parca.position.clone();
    return D.tween({ sahne: s, sure: sure, ease: ease || 'easeInOutCubic', anahtar: 'konum', hedef: parca,
      guncelle: function (e) { parca.position.lerpVectors(b, hedef, e); } });
  }
  D.git = git;

  /** Parçayı ofset kadar kaydırır: DON3D.kaydir(parca, [x,y,z], sure) */
  D.kaydir = function (parca, ofset, sure) {
    return git(parca, parca.position.clone().add(new V3().fromArray(ofset)), sure == null ? 0.8 : sure);
  };

  /** Vidayı kendi ekseni etrafında çevirip dışarı alır (sökme) ya da geri takar. */
  D.vida = function (vida, ops) {
    ops = ops || {};
    var s = D.sahneBul(vida);
    var eksen = ops.eksen || 'z', tur = ops.tur == null ? 3 : ops.tur, yon = ops.sok === false ? 1 : -1;
    var mesafe = ops.mesafe == null ? 0.9 : ops.mesafe;
    var p0 = vida.position[eksen], r0 = vida.rotation[eksen];
    return D.tween({ sahne: s, sure: ops.sure == null ? 1 : ops.sure, ease: 'easeInOutCubic', anahtar: 'vida', hedef: vida, guncelle: function (e) {
      vida.rotation[eksen] = r0 + yon * tur * Math.PI * 2 * e;
      vida.position[eksen] = p0 + (ops.sok === false ? 1 : -1) * mesafe * e * (ops.isaret || 1);
    } });
  };

  /* ─── A-TAK: parçanın hizalanıp yuvaya oturması; yanlış yönde girmez; klik ─── */
  /**
   * DON3D.takAnim(parca, { hedef: Vector3 (ebeveyn koordinatında oturma noktası), dogru: bool,
   *                        yukseklik: 4, engel: 0.35, yuva: M-RAM-YUVASI grubu (mandallar için) })
   * Promise<bool> döner: true = oturdu.
   */
  D.takAnim = function (parca, ops) {
    var s = D.sahneBul(parca);
    var h = ops.hedef, yuk = ops.yukseklik == null ? 4 : ops.yukseklik;
    var ust = new V3(h.x, h.y + yuk, h.z);
    var once = parca.position.distanceTo(ust) > 0.05 ? git(parca, ust, 0.6) : Promise.resolve();
    if (ops.yuva && !ops.yuva.userData.mandalAcik) once = once.then(function () { return ops.yuva.userData.mandal(true); });
    return once.then(function () {
      if (ops.dogru) {
        return git(parca, new V3(h.x, h.y + 0.12, h.z), 0.7, 'easeOutCubic')
          .then(function () { return git(parca, h.clone(), 0.18, 'easeInCubic'); })
          .then(function () {
            D.ses('klik');
            return ops.yuva ? ops.yuva.userData.mandal(false, 0.22) : null;
          })
          .then(function () { return true; });
      }
      var engel = ops.engel == null ? 0.35 : ops.engel;
      var dur = new V3(h.x, h.y + engel, h.z);
      return git(parca, dur, 0.6, 'easeOutCubic')
        .then(function () {
          D.ses('hata');
          var x0 = parca.position.x;
          return D.tween({ sahne: s, sure: 0.4, ease: 'lineer', guncelle: function (e) { parca.position.x = x0 + Math.sin(e * Math.PI * 6) * 0.08 * (1 - e); } });
        })
        .then(function () { return git(parca, ust, 0.5); })
        .then(function () { return false; });
    });
  };

  /** A-TAK tersi: mandalları açar, parça yuvadan yükselir. Promise. */
  D.cikarAnim = function (parca, ops) {
    ops = ops || {};
    var yuk = ops.yukseklik == null ? 4 : ops.yukseklik;
    var p = parca.position.clone();
    var once = ops.yuva ? ops.yuva.userData.mandal(true, 0.35) : Promise.resolve();
    return once
      .then(function () { return git(parca, new V3(p.x, p.y + 0.3, p.z), 0.25, 'easeOutCubic'); })
      .then(function () { return git(parca, new V3(p.x, p.y + yuk, p.z), 0.8); });
  };

  /* ─── A-DONUS: dönen parça (fan, HDD plakası) ─── */
  /** Parçayı sürekli döndürür. Döner: durdur() */
  D.dondurParca = function (parca, ops) {
    ops = ops || {};
    var s = D.sahneBul(parca);
    if (!s) return function () {};
    var eksen = ops.eksen || 'z', hiz = ops.hiz == null ? Math.PI * 2 : ops.hiz;
    if (D.azHareket()) hiz *= 0.15;
    return s.herKare(function (dt) { parca.rotation[eksen] += hiz * dt; });
  };
})(typeof window !== 'undefined' ? window : this);
