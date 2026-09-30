/* ════════════════════════════════════════════════════════════════════
   DON3D — Bilişim Üssü donanım dersleri 3D motoru
   Three.js r158 UMD (global THREE) üzerinde çalışır. Derse satır içi gömülür.
   Spesifikasyon: docs/gorsel-3d-standartlari.md §3

   Bu dosya: çekirdek (tek renderer, sahne yaşam döngüsü, otomatik kalite,
   yedek görsel, hareket azaltma, HTML etiket katmanı, klavye) + kit
   (malzeme, geometri, doku yardımcıları) + zamanlama (tween).
   Animasyon kalıpları: don3d-anim.js · Etkileşimler: don3d-etkilesim.js
   Modeller: modeller/M-*.js → DON3D.modelTanimla(kod, uretici)
   ════════════════════════════════════════════════════════════════════ */
(function (kok) {
  'use strict';
  var THREE = kok.THREE;
  var D = kok.DON3D = kok.DON3D || {};
  D.surum = '0.1.0';
  if (!THREE) { console.error('[DON3D] THREE bulunamadı'); return; }

  var V3 = THREE.Vector3;
  var sahneler = [];
  var R = {
    hazir: false, webgl: true, renderer: null, kayip: false,
    kalite: 'otomatik', dusuk: false, env: null,
    fps: { kare: 0, sure: 0, dusukSay: 0 }
  };
  D._R = R;
  D._sahneler = sahneler;

  /* ─────────────── Genel yardımcılar ─────────────── */
  function div(sinif, ebeveyn) {
    var e = document.createElement('div');
    if (sinif) e.className = sinif;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function kisit(v, a, b) { return v < a ? a : (v > b ? b : v); }
  D.kisit = kisit;
  D.div = div;

  var EASE = {
    lineer: function (t) { return t; },
    easeInOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    easeOutCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    easeInCubic: function (t) { return t * t * t; },
    easeOutBack: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  D.ease = EASE;

  var hareketSorgu = kok.matchMedia ? kok.matchMedia('(prefers-reduced-motion: reduce)') : null;
  /** prefers-reduced-motion: reduce etkin mi? */
  D.azHareket = function () { return !!(D.hareketiAzalt || (hareketSorgu && hareketSorgu.matches)); };

  function cssDeger(ad, el) {
    try { return getComputedStyle(el || document.body).getPropertyValue(ad).trim(); } catch (e) { return ''; }
  }
  D.cssDeger = cssDeger;
  /** MASTER vurgu rengi (--accent) */
  D.vurguRengi = function (el) { return cssDeger('--accent', el) || '#f59e0b'; };

  /* ─────────────── Model kaydı ─────────────── */
  var modelTanimlari = D._modelTanimlari = D._modelTanimlari || {};
  /** Model üreticisini kaydeder. uretici(kit, ops) → THREE.Group */
  D.modelTanimla = function (kod, uretici) { modelTanimlari[kod] = uretici; };
  /** Modeli üretir: alt parçalar name + userData {etiket, bilgi} taşır. */
  D.model = function (kod, ops) {
    var f = modelTanimlari[kod];
    if (!f) throw new Error('[DON3D] Tanımsız model: ' + kod);
    var g = f(D.kit, ops || {});
    if (!g.name) g.name = kod;
    g.userData.kod = kod;
    g.traverse(function (o) {
      if (o.isMesh && o.userData.golgeYok !== true) { o.castShadow = true; }
    });
    return g;
  };

  /* ─────────────── Renderer (tek) ─────────────── */
  function webglVarMi() {
    try {
      var c = document.createElement('canvas');
      return !!(kok.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  function rendererKur(aa) {
    var eski = R.renderer;
    if (eski) {
      if (R.env) { R.env.dispose(); R.env = null; }
      eski.dispose();
      if (eski.domElement.parentNode) eski.domElement.parentNode.removeChild(eski.domElement);
      R.renderer = null;
    }
    var r;
    try {
      // Derste tek WebGLRenderer kuralı: tüm sahneler bu nesneyi paylaşır.
      r = new THREE.WebGLRenderer({ antialias: aa, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      R.webgl = false;
      sahneler.forEach(function (s) { s._yedekGoster(true); });
      return;
    }
    R.renderer = r;
    r.setPixelRatio(Math.min(kok.devicePixelRatio || 1, R.dusuk ? 1 : 1.5));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.15;
    r.shadowMap.enabled = !R.dusuk;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.domElement.className = 'don3d-canvas';
    r.domElement.setAttribute('aria-hidden', 'true');
    r.domElement.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      R.kayip = true;
      sahneler.forEach(function (s) { s._yedekGoster(true); });
    });
    r.domElement.addEventListener('webglcontextrestored', function () {
      R.kayip = false;
      R.env = null;
      sahneler.forEach(function (s) { s._yedekGoster(false); s._ortamAyarla(); });
      donguBaslat();
    });
    sahneler.forEach(function (s) { s._ortamAyarla(); s._golgeAyarla(); });
  }

  /** Motoru başlatır. kalite: 'otomatik' | 'yuksek' | 'dusuk' */
  D.baslat = function (ops) {
    if (R.hazir) return D;
    ops = ops || {};
    R.hazir = true;
    R.kalite = ops.kalite || 'otomatik';
    R.dusuk = R.kalite === 'dusuk';
    R.webgl = webglVarMi();
    if (R.webgl) rendererKur(!R.dusuk);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) donguDurdur(); else donguBaslat();
    });
    if (hareketSorgu && hareketSorgu.addEventListener) {
      hareketSorgu.addEventListener('change', function () {
        sahneler.forEach(function (s) { if (D.azHareket()) s.otoDonus = false; });
      });
    }
    return D;
  };

  /** Prosedürel stüdyo ortam haritası (metal yüzeyler için yansıma). */
  function ortamHaritasi() {
    if (R.env || !R.renderer) return R.env;
    var pm = new THREE.PMREMGenerator(R.renderer);
    var s = new THREE.Scene();
    var oda = new THREE.Mesh(new THREE.BoxGeometry(12, 7, 12),
      new THREE.MeshBasicMaterial({ color: 0x5d636d, side: THREE.BackSide }));
    oda.position.y = 2.5;
    s.add(oda);
    var zem = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: 0x2a2d33 }));
    zem.rotation.x = -Math.PI / 2; zem.position.y = -0.99;
    s.add(zem);
    function panel(w, h, renk, k, x, y, z, rx, ry) {
      var m = new THREE.MeshBasicMaterial({ color: new THREE.Color(renk).multiplyScalar(k), side: THREE.DoubleSide });
      m.toneMapped = false;
      var p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      p.position.set(x, y, z); p.rotation.set(rx, ry, 0);
      s.add(p);
    }
    panel(7, 4, 0xffffff, 4.5, 0, 5.9, 0, Math.PI / 2, 0);
    panel(4, 3, 0xffe7cc, 3.0, -5.9, 2.2, 1.5, 0, Math.PI / 2);
    panel(4, 3, 0xd6e6ff, 2.2, 5.9, 2.2, -1.5, 0, -Math.PI / 2);
    panel(6, 1.2, 0xffffff, 1.6, 0, 1.8, -5.9, 0, 0);
    R.env = pm.fromScene(s, 0.035).texture;
    pm.dispose();
    s.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    return R.env;
  }

  /* ─────────────── Zamanlama (tween) ─────────────── */
  var genelTweenler = [];
  function sahneBul(nesne) {
    var o = nesne;
    while (o) {
      if (o.userData && o.userData.sahne) return o.userData.sahne;
      o = o.parent;
    }
    return null;
  }
  D.sahneBul = sahneBul;

  /** Süreyi hareket azaltma tercihine göre ayarlar. */
  D.sure = function (sn) { return D.azHareket() ? Math.min(sn, 0.12) : sn; };

  /**
   * ops: { sure (sn), ease, guncelle(e, t), sahne, anahtar, hedef }
   * Aynı hedef+anahtar ile yeni tween başlarsa eskisi tamamlanmış sayılır.
   * Promise döner (zincirlenebilir).
   */
  D.tween = function (ops) {
    return new Promise(function (coz) {
      var s = ops.sahne || null;
      var liste = s ? s._tweenler : genelTweenler;
      if (ops.anahtar && ops.hedef) {
        for (var i = liste.length - 1; i >= 0; i--) {
          var x = liste[i];
          if (x.anahtar === ops.anahtar && x.hedef === ops.hedef) { liste.splice(i, 1); x.coz(); }
        }
      }
      var sure = D.sure(ops.sure == null ? 0.8 : ops.sure);
      liste.push({
        t: 0, sure: sure, gecikme: ops.gecikme || 0,
        ease: typeof ops.ease === 'function' ? ops.ease : (EASE[ops.ease] || EASE.easeInOutCubic),
        guncelle: ops.guncelle || function () {}, coz: coz,
        anahtar: ops.anahtar, hedef: ops.hedef
      });
      donguBaslat();
    });
  };
  /** Bekleme (sahne aktifken ilerler). */
  D.bekle = function (sn, sahne) { return D.tween({ sure: sn, sahne: sahne, ease: 'lineer' }); };

  function tweenIlerlet(liste, dt) {
    for (var i = 0; i < liste.length; i++) {
      var tw = liste[i];
      if (tw.gecikme > 0) { tw.gecikme -= dt; continue; }
      tw.t += dt;
      var t = tw.sure <= 0 ? 1 : kisit(tw.t / tw.sure, 0, 1);
      try { tw.guncelle(tw.ease(t), t); } catch (e) { console.error('[DON3D] tween', e); t = 1; }
      if (t >= 1) { liste.splice(i, 1); i--; tw.coz(); }
    }
  }

  /* ─────────────── Döngü ─────────────── */
  var dongu = null, sonZaman = 0;
  function donguBaslat() {
    if (dongu || document.hidden) return;
    sonZaman = performance.now();
    dongu = requestAnimationFrame(kare);
  }
  function donguDurdur() {
    if (dongu) cancelAnimationFrame(dongu);
    dongu = null;
  }
  D._donguBaslat = donguBaslat;

  function fpsIzle(dt) {
    if (R.kalite !== 'otomatik' || R.dusuk) return;
    var f = R.fps;
    f.kare++; f.sure += dt;
    if (f.sure >= 2) {
      var fps = f.kare / f.sure;
      f.kare = 0; f.sure = 0;
      if (fps < 24) f.dusukSay++; else f.dusukSay = 0;
      if (f.dusukSay >= 2) {
        // Otomatik kalite: gölge ve antialias kapanır, piksel oranı 1.
        R.dusuk = true;
        console.warn('[DON3D] Düşük fps (' + fps.toFixed(1) + '): düşük kaliteye geçildi');
        rendererKur(false);
      }
    }
  }

  function kare(t) {
    dongu = null;
    var dt = Math.min(0.1, Math.max(0, (t - sonZaman) / 1000));
    sonZaman = t;
    tweenIlerlet(genelTweenler, dt);
    var aktifler = [];
    for (var i = 0; i < sahneler.length; i++) {
      var s = sahneler[i];
      if (s.aktif && !s.yok) {
        s._kare(dt, t / 1000);
        if (s.w > 0 && s.h > 0) aktifler.push(s);
      }
    }
    if (aktifler.length && R.renderer && !R.kayip) {
      fpsIzle(dt);
      render(aktifler);
    }
    var devam = genelTweenler.length > 0;
    for (var j = 0; j < sahneler.length; j++) if (sahneler[j].aktif && !sahneler[j].yok) devam = true;
    if (devam) donguBaslat();
  }

  function render(aktifler) {
    var r = R.renderer;
    var ana = aktifler[0];
    // Birden fazla aktif sahne (nadir): ikincil sahneler kopya canvas'a çizilir.
    for (var i = 1; i < aktifler.length; i++) {
      var s = aktifler[i];
      r.setSize(s.w, s.h, false);
      r.render(s.scene, s.kamera);
      var kp = s._kopyaCanvas();
      var ctx = kp.getContext('2d');
      ctx.clearRect(0, 0, kp.width, kp.height);
      ctx.drawImage(r.domElement, 0, 0, kp.width, kp.height);
    }
    if (r.domElement.parentNode !== ana.yuzey) {
      ana.yuzey.appendChild(r.domElement);
      if (ana._kopya) ana._kopya.style.display = 'none';
    }
    r.setSize(ana.w, ana.h, false);
    r.render(ana.scene, ana.kamera);
    ana._etiketleriGuncelle();
    for (var k = 1; k < aktifler.length; k++) aktifler[k]._etiketleriGuncelle();
  }

  /* ─────────────── Sahne ─────────────── */
  function gradyanDoku(ust, alt) {
    var c = document.createElement('canvas');
    c.width = 4; c.height = 256;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, ust); g.addColorStop(1, alt);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256);
    var tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }
  var temasDokusu = null;
  function temasDoku() {
    if (temasDokusu) return temasDokusu;
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(15,23,42,0.55)');
    g.addColorStop(0.55, 'rgba(15,23,42,0.18)');
    g.addColorStop(1, 'rgba(15,23,42,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    temasDokusu = new THREE.CanvasTexture(c);
    return temasDokusu;
  }

  function Sahne(kap, ops) {
    ops = ops || {};
    var s = this;
    s.kap = kap; s.ops = ops;
    s.scene = new THREE.Scene();
    var k = ops.kamera || {};
    s.kamera = new THREE.PerspectiveCamera(k.fov || 30, 1.5, 1, 6000);
    s.kok = new THREE.Group();
    s.kok.name = 'kok';
    s.kok.userData.sahne = s;
    s.scene.add(s.kok);
    s.modeller = {};
    s._kareler = []; s._tweenler = []; s._etiketler = []; s._tikDinleyiciler = [];
    s.aktif = false; s.w = 0; s.h = 0; s.yok = false;
    s.otoDonus = ops.otomatikDonus !== false && !D.azHareket();
    s.donusHizi = (Math.PI * 2) / (ops.turSuresi || 8);
    s.orb = { hedef: new V3(), theta: 0.6, phi: 1.1, yakinlik: 1, uzaklik: 100 };
    s.sinir = { minPolar: 0.25, maxPolar: 1.45, minYakin: 0.45, maxYakin: 1.8 };
    s.kullaniciDokundu = false;

    // DOM
    kap.classList.add('don3d');
    if (!kap.hasAttribute('tabindex')) kap.setAttribute('tabindex', '0');
    if (!kap.hasAttribute('role')) kap.setAttribute('role', 'img');
    if (ops.etiket && !kap.hasAttribute('aria-label')) kap.setAttribute('aria-label', ops.etiket);
    s.yuzey = div('don3d-yuzey', kap);
    s.katman = div('don3d-katman', kap);
    kap.setAttribute('data-bilincli-kirpma', '');   // 3D görüntü alanı: dışarı taşan etiketler bilerek kırpılır
    s.arayuz = div('don3d-arayuz', kap);
    s.yedekEl = kap.querySelector('[data-yedek]');

    // Işıklar: 1 ana yönlü (gölgeli) + hemisfer + zayıf dolgu
    s.hemi = new THREE.HemisphereLight(0xf3f7ff, 0x9a8f84, 1.1);
    s.anaIsik = new THREE.DirectionalLight(0xfff4e6, 2.6);
    s.anaIsik.castShadow = true;
    s.anaIsik.shadow.mapSize.set(1024, 1024);
    s.anaIsik.shadow.bias = -0.0004;
    s.anaIsik.shadow.normalBias = 0.02;
    s.dolgu = new THREE.DirectionalLight(0xdbe8ff, 0.7);
    s.scene.add(s.hemi, s.anaIsik, s.anaIsik.target, s.dolgu);

    // Arka plan
    if (ops.arkaPlan === 'seffaf') {
      s.scene.background = null;
    } else {
      var ust = cssDeger('--brand-lt', kap) || '#e0f2fe';
      s.scene.background = gradyanDoku('#ffffff', ust);
    }

    // Zemin: gölge alıcı + temas gölgesi
    s.zemin = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.13 }));
    s.zemin.rotation.x = -Math.PI / 2;
    s.zemin.receiveShadow = true;
    s.zemin.userData.secilmez = true;
    s.temas = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: temasDoku(), transparent: true, depthWrite: false, opacity: 0.8 }));
    s.temas.rotation.x = -Math.PI / 2;
    s.temas.userData.secilmez = true;
    s.temas.renderOrder = -1;
    if (ops.zemin !== false) s.scene.add(s.zemin, s.temas);

    (ops.modeller || []).forEach(function (kod) { s.ekle(kod); });
    if ((ops.modeller || []).length > 1 && ops.yerlesim !== 'serbest') s.sirala();
    s.yerlestir();

    s._ortamAyarla();
    s._golgeAyarla();
    s._olaylar();
    if (!R.webgl || R.kayip) s._yedekGoster(true);

    if (kok.ResizeObserver) {
      s._ro = new ResizeObserver(function () { s._boyut(); });
      s._ro.observe(kap);
    }
    s._boyut();
    sahneler.push(s);
    slaytBagla(s);
  }
  D.Sahne = Sahne;
  var SP = Sahne.prototype;

  /** Modeli (kod ya da THREE.Object3D) sahneye ekler. */
  SP.ekle = function (kod, ops) {
    ops = ops || {};
    var m = typeof kod === 'string' ? D.model(kod, ops.modelOps) : kod;
    if (ops.konum) m.position.fromArray(ops.konum);
    if (ops.donus) m.rotation.set(ops.donus[0] || 0, ops.donus[1] || 0, ops.donus[2] || 0);
    if (ops.olcek) m.scale.setScalar(ops.olcek);
    this.kok.add(m);
    var ad = typeof kod === 'string' ? kod : (m.userData.kod || m.name);
    if (ad) this.modeller[ad] = m;
    return m;
  };

  /** Birden fazla modeli yan yana dizer. */
  SP.sirala = function (bosluk) {
    var x = 0, kutu = new THREE.Box3(), boyut = new V3(), ogeler = this.kok.children;
    bosluk = bosluk == null ? 6 : bosluk;
    var toplam = 0, genislikler = [];
    ogeler.forEach(function (m) { kutu.setFromObject(m); kutu.getSize(boyut); genislikler.push(boyut.x); toplam += boyut.x; });
    toplam += bosluk * (ogeler.length - 1);
    x = -toplam / 2;
    ogeler.forEach(function (m, i) {
      kutu.setFromObject(m);
      var merkez = kutu.getCenter(new V3());
      m.position.x += x + genislikler[i] / 2 - merkez.x;
      x += genislikler[i] + bosluk;
    });
  };

  /** Adı verilen alt parçayı bulur (tüm modellerde). */
  SP.parca = function (ad) { return this.kok.getObjectByName(ad) || null; };

  /** Zemin, ışık ve kamerayı içeriğe göre yerleştirir. */
  SP.yerlestir = function () {
    var kutu = new THREE.Box3().setFromObject(this.kok);
    if (kutu.isEmpty()) kutu.set(new V3(-10, 0, -10), new V3(10, 10, 10));
    var merkez = kutu.getCenter(new V3()), boyut = kutu.getSize(new V3());
    var r = Math.max(boyut.length() / 2, 1);
    this._kutu = kutu; this._r = r; this._merkez = merkez;
    var zy = kutu.min.y;
    this.zemin.position.set(merkez.x, zy, merkez.z);
    this.zemin.scale.set(r * 8, r * 8, 1);
    this.temas.position.set(merkez.x, zy + 0.02, merkez.z);
    this.temas.scale.set(boyut.x * 1.5 + r * 0.3, boyut.z * 1.5 + r * 0.3, 1);
    var ai = this.anaIsik;
    ai.position.set(merkez.x + r * 0.7, merkez.y + r * 3.2, merkez.z + r * 1.1);
    ai.target.position.copy(merkez);
    var sc = ai.shadow.camera;
    sc.left = -r * 1.3; sc.right = r * 1.3; sc.top = r * 1.3; sc.bottom = -r * 1.3;
    sc.near = r * 0.5; sc.far = r * 6;
    sc.updateProjectionMatrix();
    this.dolgu.position.set(merkez.x - r * 2, merkez.y + r, merkez.z - r * 1.5);
    this.kamera.near = Math.max(0.5, r / 40);
    this.kamera.far = r * 40;
    this.kameraSigdir();
  };

  /** Kamerayı açılış görünümüne (3/4 perspektif) ayarlar. */
  SP.kameraSigdir = function () {
    var k = this.ops.kamera || {};
    var yon = new V3().fromArray(k.yon || [0.95, 0.62, 1.5]).normalize();
    this.orb.hedef.copy(this._merkez);
    if (k.hedefOfset) this.orb.hedef.add(new V3().fromArray(k.hedefOfset));
    this.orb.theta = Math.atan2(yon.x, yon.z);
    this.orb.phi = Math.acos(kisit(yon.y, -1, 1));
    this.orb.yakinlik = 1;
    this._baslangic = { hedef: this.orb.hedef.clone(), theta: this.orb.theta, phi: this.orb.phi, yakinlik: 1 };
    this._kameraUygula();
  };

  SP._sigmaUzakligi = function () {
    var k = this.ops.kamera || {};
    var fov = THREE.MathUtils.degToRad(this.kamera.fov);
    var asp = this.w > 0 && this.h > 0 ? this.w / this.h : 1.4;
    var yatayFov = 2 * Math.atan(Math.tan(fov / 2) * asp);
    var f = Math.min(fov, yatayFov);
    return (this._r / Math.sin(f / 2)) * (k.pay || 0.92);
  };

  SP._kameraUygula = function () {
    var o = this.orb;
    o.uzaklik = this._sigmaUzakligi() * o.yakinlik;
    var sp = new THREE.Spherical(o.uzaklik, o.phi, o.theta);
    this.kamera.position.setFromSpherical(sp).add(o.hedef);
    this.kamera.lookAt(o.hedef);
  };

  /** Görünümü başlangıca döndürür (Sıfırla). */
  SP.sifirla = function () {
    var s = this, b = s._baslangic, o = s.orb;
    var t0 = o.theta, p0 = o.phi, y0 = o.yakinlik, h0 = o.hedef.clone();
    // en kısa açı
    var dt = ((b.theta - t0 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    s.kullaniciDokundu = false;
    s.otoDonus = s.ops.otomatikDonus !== false && !D.azHareket();
    return D.tween({ sahne: s, sure: 0.7, anahtar: 'kamera', hedef: s, guncelle: function (e) {
      o.theta = t0 + dt * e; o.phi = p0 + (b.phi - p0) * e; o.yakinlik = y0 + (b.yakinlik - y0) * e;
      o.hedef.lerpVectors(h0, b.hedef, e);
    } });
  };

  /** Kamerayı verilen duruma yumuşakça götürür: {theta, phi, yakinlik, hedef:[x,y,z]} */
  SP.kameraGit = function (d, sure) {
    var s = this, o = s.orb;
    var t0 = o.theta, p0 = o.phi, y0 = o.yakinlik, h0 = o.hedef.clone();
    var t1 = d.theta == null ? t0 : d.theta, p1 = d.phi == null ? p0 : d.phi;
    var y1 = d.yakinlik == null ? y0 : d.yakinlik;
    var h1 = d.hedef ? (d.hedef.isVector3 ? d.hedef.clone() : new V3().fromArray(d.hedef)) : h0;
    var fark = ((t1 - t0 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    s.otoDonus = false;
    return D.tween({ sahne: s, sure: sure == null ? 1 : sure, anahtar: 'kamera', hedef: s, guncelle: function (e) {
      o.theta = t0 + fark * e; o.phi = p0 + (p1 - p0) * e; o.yakinlik = y0 + (y1 - y0) * e;
      o.hedef.lerpVectors(h0, h1, e);
    } });
  };

  SP._kare = function (dt, zaman) {
    if (this.otoDonus && !this.kullaniciDokundu) this.orb.theta += this.donusHizi * dt;
    tweenIlerlet(this._tweenler, dt);
    for (var i = 0; i < this._kareler.length; i++) {
      try { this._kareler[i](dt, zaman); } catch (e) { console.error('[DON3D] kare', e); }
    }
    this._kameraUygula();
  };

  /** Yatay dönüş sınırı (sinir.yatay: açılış açısından ± radyan; yalnız önden bakılan modeller için). */
  SP._thetaKisit = function (th) {
    var y = this.sinir.yatay;
    if (y == null || !this._baslangic) return th;
    var b = this._baslangic.theta;
    return kisit(th, b - y, b + y);
  };

  /** Her karede çağrılacak fonksiyon ekler (yalnız sahne aktifken). */
  SP.herKare = function (fn) {
    var l = this._kareler;
    l.push(fn);
    return function () { var i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); };
  };

  SP._boyut = function () {
    var w = Math.round(this.kap.clientWidth), h = Math.round(this.kap.clientHeight);
    if (w === this.w && h === this.h) return;
    this.w = w; this.h = h;
    if (w > 0 && h > 0) {
      this.kamera.aspect = w / h;
      this.kamera.updateProjectionMatrix();
      this._kameraUygula();
      if (this._kopya) { this._kopya.width = w; this._kopya.height = h; }
      if (this.aktif) donguBaslat();
    }
  };

  SP._kopyaCanvas = function () {
    if (!this._kopya) {
      this._kopya = document.createElement('canvas');
      this._kopya.className = 'don3d-canvas';
      this.yuzey.appendChild(this._kopya);
    }
    this._kopya.style.display = '';
    if (this._kopya.width !== this.w) this._kopya.width = this.w;
    if (this._kopya.height !== this.h) this._kopya.height = this.h;
    return this._kopya;
  };

  SP._ortamAyarla = function () {
    if (R.renderer && !R.kayip) this.scene.environment = ortamHaritasi();
  };
  SP._golgeAyarla = function () {
    var acik = !R.dusuk;
    this.anaIsik.castShadow = acik;
    this.zemin.visible = acik;
  };

  SP._yedekGoster = function (goster) {
    this.kap.classList.toggle('don3d--yedek', !!goster);
    if (!this.yedekEl) {
      if (!goster) return;
      this.yedekEl = div('don3d-yedek-varsayilan', this.kap);
      this.yedekEl.setAttribute('data-yedek', '');
      this.yedekEl.textContent = this.ops.etiket || '3D görünüm bu cihazda açılamadı.';
    }
    if (goster) this.yedekEl.removeAttribute('hidden'); else this.yedekEl.setAttribute('hidden', '');
  };

  /** Slayt aktif olunca çağrılır (MASTER slayt olayına bağlı). */
  SP.etkinlestir = function () {
    if (this.yok || this.aktif) return;
    this.aktif = true;
    this._boyut();
    this.kap.dispatchEvent(new CustomEvent('don3d:etkin', { detail: this }));
    donguBaslat();
  };
  /** Slayt pasif olunca render durur. */
  SP.duraklat = function () {
    if (!this.aktif) return;
    this.aktif = false;
    this.kap.dispatchEvent(new CustomEvent('don3d:pasif', { detail: this }));
  };

  /** Sahneyi ve kaynaklarını serbest bırakır. */
  SP.yokEt = function () {
    this.duraklat();
    this.yok = true;
    if (this._ro) this._ro.disconnect();
    if (this._mo) this._mo.disconnect();
    var i = sahneler.indexOf(this);
    if (i >= 0) sahneler.splice(i, 1);
    this.scene.traverse(function (o) {
      if (o.geometry && !o.geometry.userData.paylasimli) o.geometry.dispose();
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
          if (!m.userData.paylasimli) m.dispose();
        });
      }
    });
    if (R.renderer && R.renderer.domElement.parentNode === this.yuzey) this.yuzey.removeChild(R.renderer.domElement);
    this.katman.innerHTML = ''; this.arayuz.innerHTML = '';
  };

  /* ─── Etiket katmanı (HTML; canvas içine metin yazılmaz) ─── */
  /**
   * nesne üzerinde HTML etiket. ops: { tur: 'bilgi'|'vurgu'|'harf', yer: 'ust'|'merkez', ofset:[x,y,z] }
   * Döner: { el, metin(str), goster(bool), kaldir() }
   */
  SP.etiket = function (nesne, metin, ops) {
    ops = ops || {};
    var s = this;
    var e = div('don3d-etiket' + (ops.tur ? ' don3d-etiket--' + ops.tur : '') + (ops.yer === 'alt' ? ' don3d-etiket--alt' : ''), s.katman);
    var m = document.createElement('span');
    m.className = 'don3d-etiket-metin';
    m.textContent = metin || '';
    e.appendChild(m);
    // Çapa: nesnenin kutusunun üst-orta noktası (yerel koordinatta saklanır)
    nesne.updateWorldMatrix(true, true);
    var kutu = new THREE.Box3().setFromObject(nesne);
    var nokta = kutu.isEmpty() ? nesne.getWorldPosition(new V3()) : kutu.getCenter(new V3());
    if (ops.yer === 'alt' && !kutu.isEmpty()) nokta.y = kutu.min.y;
    else if (ops.yer !== 'merkez' && !kutu.isEmpty()) nokta.y = kutu.max.y;
    if (ops.ofset) nokta.add(new V3().fromArray(ops.ofset));
    var yerel = nesne.worldToLocal(nokta.clone());
    var et = {
      el: e, nesne: nesne, yerel: yerel, gorunur: true,
      metin: function (t) { m.textContent = t; },
      goster: function (g) { et.gorunur = g; e.style.display = g ? '' : 'none'; },
      kaldir: function () {
        var i = s._etiketler.indexOf(et);
        if (i >= 0) s._etiketler.splice(i, 1);
        if (e.parentNode) e.parentNode.removeChild(e);
      }
    };
    s._etiketler.push(et);
    return et;
  };

  var _gecici = new V3();
  SP._etiketleriGuncelle = function () {
    var w = this.w, h = this.h;
    for (var i = 0; i < this._etiketler.length; i++) {
      var et = this._etiketler[i];
      if (!et.gorunur) continue;
      _gecici.copy(et.yerel);
      et.nesne.localToWorld(_gecici);
      _gecici.project(this.kamera);
      var gizli = _gecici.z > 1 || !et.nesne.visible;
      if (gizli) { et.el.style.opacity = '0'; continue; }
      var x = (_gecici.x * 0.5 + 0.5) * w, y = (-_gecici.y * 0.5 + 0.5) * h;
      if (x < -20 || x > w + 20 || y < -20 || y > h + 20) { et.el.style.opacity = '0'; et.el.style.transform = 'translate(0,0)'; continue; }
      et.el.style.opacity = '';
      et.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    }
  };

  /* ─── Seçim (raycast) ─── */
  var isin = new THREE.Raycaster();
  /** Ekran koordinatındaki etiketli parçayı döndürür. */
  SP.secilen = function (istemciX, istemciY, adaylar) {
    var r = this.kap.getBoundingClientRect();
    var ndc = new THREE.Vector2(((istemciX - r.left) / r.width) * 2 - 1, -((istemciY - r.top) / r.height) * 2 + 1);
    isin.setFromCamera(ndc, this.kamera);
    var kesisim = isin.intersectObjects(adaylar || this.kok.children, true);
    for (var i = 0; i < kesisim.length; i++) {
      var o = kesisim[i].object;
      if (!o.visible || o.userData.secilmez) continue;
      while (o && o !== this.kok) {
        if (o.userData && o.userData.etiket && !o.userData.secilmez &&
            (!this._secimFiltresi || this._secimFiltresi.indexOf(o.name) >= 0)) return o;
        o = o.parent;
      }
    }
    return null;
  };
  /** Parçaya tıklama dinleyicisi: fn(parca | null, olay) */
  SP.tiklaninca = function (fn) { this._tikDinleyiciler.push(fn); };

  /** Sahnedeki etiketli parçaların listesi (klavye ile gezinme için). */
  SP.parcalar = function () {
    var l = [], f = this._secimFiltresi;
    this.kok.traverse(function (o) {
      if (o.userData && o.userData.etiket && !o.userData.secilmez && (!f || f.indexOf(o.name) >= 0)) l.push(o);
    });
    return l;
  };

  /* ─── Girdi olayları ─── */
  SP._olaylar = function () {
    var s = this, kap = s.kap;
    var isaretciler = {}, surukle = null, kistirma = null, basla = null;
    // MASTER'ın belge düzeyindeki kaydırma (swipe) ile slayt geçişini engelle
    ['touchstart', 'touchend', 'touchmove'].forEach(function (ad) {
      kap.addEventListener(ad, function (e) { if (s.girdiAcik) e.stopPropagation(); }, { passive: true });
    });
    kap.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button, input, select, .don3d-arayuz *')) return;
      isaretciler[e.pointerId] = { x: e.clientX, y: e.clientY };
      basla = { x: e.clientX, y: e.clientY, t: performance.now() };
      var ids = Object.keys(isaretciler);
      if (s.girdiAcik) {
        try { kap.setPointerCapture(e.pointerId); } catch (x) {}
        if (ids.length === 1) surukle = { x: e.clientX, y: e.clientY };
        if (ids.length === 2) {
          var a = isaretciler[ids[0]], b = isaretciler[ids[1]];
          kistirma = { d: Math.hypot(a.x - b.x, a.y - b.y), y: s.orb.yakinlik };
          surukle = null;
        }
      }
    });
    kap.addEventListener('pointermove', function (e) {
      if (!isaretciler[e.pointerId]) return;
      isaretciler[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (!s.girdiAcik) return;
      if (kistirma) {
        var ids = Object.keys(isaretciler);
        if (ids.length < 2) return;
        var a = isaretciler[ids[0]], b = isaretciler[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        s.orb.yakinlik = kisit(kistirma.y * (kistirma.d / Math.max(d, 1)), s.sinir.minYakin, s.sinir.maxYakin);
        s._dokun();
      } else if (surukle) {
        var dx = e.clientX - surukle.x, dy = e.clientY - surukle.y;
        surukle.x = e.clientX; surukle.y = e.clientY;
        if (Math.abs(dx) + Math.abs(dy) > 0) {
          s.orb.theta = s._thetaKisit(s.orb.theta - dx * 0.009);
          s.orb.phi = kisit(s.orb.phi - dy * 0.007, s.sinir.minPolar, s.sinir.maxPolar);
          s._dokun();
        }
      }
    });
    function bitir(e) {
      if (!isaretciler[e.pointerId]) return;
      delete isaretciler[e.pointerId];
      if (Object.keys(isaretciler).length < 2) kistirma = null;
      if (Object.keys(isaretciler).length === 0) surukle = null;
      if (e.type === 'pointerup' && basla && Math.hypot(e.clientX - basla.x, e.clientY - basla.y) < 8 &&
          performance.now() - basla.t < 600 && s._tikDinleyiciler.length) {
        var p = s.secilen(e.clientX, e.clientY);
        s._tikDinleyiciler.forEach(function (fn) { fn(p, e); });
      }
    }
    kap.addEventListener('pointerup', bitir);
    kap.addEventListener('pointercancel', bitir);
    kap.addEventListener('wheel', function (e) {
      if (!s.girdiAcik) return;
      e.preventDefault();
      s.orb.yakinlik = kisit(s.orb.yakinlik * Math.exp(e.deltaY * 0.0012), s.sinir.minYakin, s.sinir.maxYakin);
      s._dokun();
    }, { passive: false });
    // Klavye: oklar döndür, +/− yakınlaştır, R sıfırla, Tab parçalar arasında gezin
    kap.addEventListener('keydown', function (e) {
      if (e.target !== kap) return;
      var ele = true;
      if (s.girdiAcik && e.key === 'ArrowLeft') { s.orb.theta = s._thetaKisit(s.orb.theta + 0.2); s._dokun(); }
      else if (s.girdiAcik && e.key === 'ArrowRight') { s.orb.theta = s._thetaKisit(s.orb.theta - 0.2); s._dokun(); }
      else if (s.girdiAcik && e.key === 'ArrowUp') { s.orb.phi = kisit(s.orb.phi - 0.12, s.sinir.minPolar, s.sinir.maxPolar); s._dokun(); }
      else if (s.girdiAcik && e.key === 'ArrowDown') { s.orb.phi = kisit(s.orb.phi + 0.12, s.sinir.minPolar, s.sinir.maxPolar); s._dokun(); }
      else if (s.girdiAcik && (e.key === '+' || e.key === '=')) { s.orb.yakinlik = kisit(s.orb.yakinlik * 0.88, s.sinir.minYakin, s.sinir.maxYakin); s._dokun(); }
      else if (s.girdiAcik && (e.key === '-' || e.key === '_')) { s.orb.yakinlik = kisit(s.orb.yakinlik * 1.14, s.sinir.minYakin, s.sinir.maxYakin); s._dokun(); }
      else if (s.girdiAcik && (e.key === 'r' || e.key === 'R')) { s.sifirla(); }
      else if (e.key === 'Tab' && s._tikDinleyiciler.length) { ele = s._klavyeGez(e.shiftKey ? -1 : 1); }
      else if ((e.key === 'Enter' || e.key === ' ') && s._klavyeSecili) {
        var p = s._klavyeSecili;
        s._tikDinleyiciler.forEach(function (fn) { fn(p, e); });
      }
      else ele = false;
      if (ele) { e.preventDefault(); e.stopPropagation(); }
    });
    kap.addEventListener('blur', function () { s._klavyeGezTemizle(); });
  };

  SP._dokun = function () { this.kullaniciDokundu = true; this.otoDonus = false; donguBaslat(); };

  SP._klavyeGez = function (yon) {
    var l = this.parcalar();
    if (!l.length) return false;
    var i = this._klavyeIndeks == null ? (yon > 0 ? -1 : l.length) : this._klavyeIndeks;
    i += yon;
    if (i < 0 || i >= l.length) { this._klavyeGezTemizle(); return false; }
    this._klavyeIndeks = i;
    this._klavyeSecili = l[i];
    if (this._klavyeEtiket) this._klavyeEtiket.kaldir();
    this._klavyeEtiket = this.etiket(l[i], l[i].userData.etiket, { tur: 'odak' });
    this.kap.setAttribute('aria-label', (this.ops.etiket ? this.ops.etiket + ' — ' : '') + l[i].userData.etiket);
    return true;
  };
  SP._klavyeGezTemizle = function () {
    this._klavyeIndeks = null; this._klavyeSecili = null;
    if (this._klavyeEtiket) { this._klavyeEtiket.kaldir(); this._klavyeEtiket = null; }
  };

  /** Arayüz düğmesi ekler (sahnenin üst köşesi). */
  SP.dugme = function (metin, simge, fn, ops) {
    ops = ops || {};
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'don3d-dugme' + (ops.sinif ? ' ' + ops.sinif : '');
    b.setAttribute('aria-label', ops.aciklama || metin);
    b.innerHTML = (simge ? D.simge(simge) : '') + (metin ? '<span>' + metin + '</span>' : '');
    b.addEventListener('click', function (e) { e.stopPropagation(); fn(e); });
    var yer = ops.yer || 'ust-sag';
    var grup = this.arayuz.querySelector('.don3d-arayuz-' + yer);
    if (!grup) grup = div('don3d-arayuz-grup don3d-arayuz-' + yer, this.arayuz);
    grup.appendChild(b);
    return b;
  };

  var SIMGELER = {
    sifirla: '<path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 3 3 9 9 9"/>',
    oynat: '<polygon points="7 4 20 12 7 20 7 4"/>',
    adim: '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>',
    tekrar: '<polyline points="1 4 1 10 7 10"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>',
    dondur: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/><polyline points="21 3 21 9 15 9"/>',
    kapat: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    dogru: '<polyline points="20 6 9 17 4 12"/>',
    yanlis: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
  };
  D.simge = function (ad) {
    return '<svg class="don3d-simge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (SIMGELER[ad] || '') + '</svg>';
  };

  /* ─── Slayt bağlama: MASTER .slide.active değişimini izler ─── */
  function slaytBagla(s) {
    var slayt = s.kap.closest('.slide');
    function durum() {
      if (s.yok) return;
      var ak = slayt ? slayt.classList.contains('active') : s._gorunur;
      if (ak) s.etkinlestir(); else s.duraklat();
    }
    if (slayt) {
      s._mo = new MutationObserver(durum);
      s._mo.observe(slayt, { attributes: true, attributeFilter: ['class'] });
    } else if (kok.IntersectionObserver) {
      s._gorunur = false;
      var io = new IntersectionObserver(function (l) { s._gorunur = l[0].isIntersecting; durum(); });
      io.observe(s.kap);
    } else {
      s._gorunur = true;
    }
    durum();
  }

  /**
   * Sahneyi slayt ilk kez aktif olunca oluşturur (açılış hızını korur).
   * fn(kap) sahneyi kurar. Slayt zaten aktifse hemen çalışır.
   */
  D.tembel = function (kap, fn) {
    if (typeof kap === 'string') kap = document.querySelector(kap);
    if (!kap) return;
    var slayt = kap.closest('.slide');
    var kuruldu = false;
    function dene() {
      if (kuruldu) return;
      if (!slayt || slayt.classList.contains('active')) {
        kuruldu = true;
        if (mo) mo.disconnect();
        try { fn(kap); } catch (e) { console.error('[DON3D] sahne kurulamadı', e); }
      }
    }
    var mo = slayt ? new MutationObserver(dene) : null;
    if (mo) mo.observe(slayt, { attributes: true, attributeFilter: ['class'] });
    dene();
  };

  /** Yeni sahne: DON3D.sahne(kapsayiciEl, { modeller, kamera, arkaPlan }) */
  D.sahne = function (kap, ops) {
    if (!R.hazir) D.baslat();
    if (typeof kap === 'string') kap = document.querySelector(kap);
    return new Sahne(kap, ops);
  };

  /**
   * Modelin küçük resmini üretir (dataURL, şeffaf arka plan). WebGL yoksa null.
   * kaynak: model kodu ya da THREE.Object3D. ops: { w, h, yon:[x,y,z] }
   */
  D.kucukResim = function (kaynak, ops) {
    ops = ops || {};
    if (!R.hazir) D.baslat();
    if (!R.renderer || R.kayip) return null;
    var w = ops.w || 160, h = ops.h || 120;
    var sc = new THREE.Scene();
    sc.environment = ortamHaritasi();
    sc.add(new THREE.HemisphereLight(0xf3f7ff, 0x9a8f84, 1.2));
    var di = new THREE.DirectionalLight(0xfff4e6, 2.4);
    di.position.set(2, 4, 3);
    sc.add(di);
    var m = typeof kaynak === 'string' ? D.model(kaynak, ops.modelOps) : kaynak;
    sc.add(m);
    var kutu = new THREE.Box3().setFromObject(m);
    var merkez = kutu.getCenter(new V3()), r = kutu.getSize(new V3()).length() / 2;
    var cam = new THREE.PerspectiveCamera(30, w / h, r / 20, r * 20);
    var yon = new V3().fromArray(ops.yon || [0.9, 0.6, 1.5]).normalize();
    var f = Math.min(THREE.MathUtils.degToRad(30), 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(15)) * w / h));
    cam.position.copy(merkez).addScaledVector(yon, (r / Math.sin(f / 2)) * 0.9);
    cam.lookAt(merkez);
    var r3 = R.renderer, eskiEbeveyn = r3.domElement.parentNode;
    var pr = r3.getPixelRatio();
    r3.setPixelRatio(1);
    r3.setSize(w * 2, h * 2, false);
    r3.setClearColor(0x000000, 0);
    r3.render(sc, cam);
    var url = r3.domElement.toDataURL('image/png');
    r3.setPixelRatio(pr);
    if (eskiEbeveyn) donguBaslat();
    if (typeof kaynak === 'string') {
      m.traverse(function (o) { if (o.geometry && !o.geometry.userData.paylasimli) o.geometry.dispose(); });
    }
    return url;
  };

  /* ════════════════════ KİT: malzeme, geometri, doku ════════════════════ */
  var K = D.kit = {};
  K.THREE = THREE;
  K.V3 = V3;

  var matOnbellek = {};
  var MAT = {
    pcb:          { color: 0x1f5a3a, roughness: 0.62, metalness: 0.05 },
    pcbSiyah:     { color: 0x1d1f24, roughness: 0.6, metalness: 0.05 },
    altin:        { color: 0xe3b04f, roughness: 0.28, metalness: 1 },
    aluminyum:    { color: 0xc8cdd4, roughness: 0.34, metalness: 0.9 },
    aluminyumMat: { color: 0xa9afb8, roughness: 0.55, metalness: 0.8 },
    celik:        { color: 0x8f969f, roughness: 0.42, metalness: 0.85 },
    bakir:        { color: 0xc47a4c, roughness: 0.35, metalness: 0.95 },
    lehim:        { color: 0xbfc4cb, roughness: 0.3, metalness: 0.95 },
    kasa:         { color: 0x30343c, roughness: 0.45, metalness: 0.5 },
    kasaIc:       { color: 0x3b404a, roughness: 0.6, metalness: 0.35 },
    plastikSiyah: { color: 0x17181b, roughness: 0.5, metalness: 0.0 },
    plastikKoyu:  { color: 0x2a2d33, roughness: 0.46, metalness: 0.0 },
    plastikGri:   { color: 0x6c727b, roughness: 0.5, metalness: 0.0 },
    plastikAcik:  { color: 0xc9ccd1, roughness: 0.45, metalness: 0.0 },
    plastikBeyaz: { color: 0xe9eaec, roughness: 0.42, metalness: 0.0 },
    tus:          { color: 0x222429, roughness: 0.62, metalness: 0.0 },
    cip:          { color: 0x17181c, roughness: 0.38, metalness: 0.15 },
    kaucuk:       { color: 0x111214, roughness: 0.92, metalness: 0.0 },
    kablo:        { color: 0x1b1c20, roughness: 0.55, metalness: 0.0 },
    termal:       { color: 0x9da2a8, roughness: 0.85, metalness: 0.1 },
    usbMavi:      { color: 0x1f5fd1, roughness: 0.5, metalness: 0.0 },
    cam:          { color: 0x1c2027, roughness: 0.06, metalness: 0.2, transparent: true, opacity: 0.32, depthWrite: false },
    ekranKapali:  { color: 0x0b0d10, roughness: 0.18, metalness: 0.3 }
  };
  /** Paylaşımlı malzeme (önbellekli). Bilinmeyen ad → hex renk kabul edilir. */
  K.mat = function (ad, ek) {
    var anahtar = ad + (ek ? JSON.stringify(ek) : '');
    if (matOnbellek[anahtar]) return matOnbellek[anahtar];
    var tanim = MAT[ad] ? Object.assign({}, MAT[ad]) : { color: ad, roughness: 0.5, metalness: 0 };
    if (ek) Object.assign(tanim, ek);
    var m = new THREE.MeshStandardMaterial(tanim);
    m.userData.paylasimli = true;
    matOnbellek[anahtar] = m;
    return m;
  };
  /** Işık yayan (LED) malzeme — kopyalanır, parça başına ayrı. */
  K.led = function (renk, guc) {
    return new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(renk), emissiveIntensity: guc == null ? 2 : guc, roughness: 0.3 });
  };

  var geoOnbellek = {};
  function geoPaylas(anahtar, uret) {
    if (!geoOnbellek[anahtar]) { geoOnbellek[anahtar] = uret(); geoOnbellek[anahtar].userData.paylasimli = true; }
    return geoOnbellek[anahtar];
  }
  K.geoPaylas = geoPaylas;

  /** Yuvarlatılmış kutu geometrisi (tüm kenarlar), düzlemsel UV. */
  K.yuvarlakKutuGeo = function (w, h, d, r, seg) {
    seg = seg == null ? 2 : seg;
    r = Math.min(r, w / 2, h / 2, d / 2);
    return geoPaylas(['yk', w, h, d, r, seg].join(':'), function () {
      if (r <= 0.0001 || seg === 0) return new THREE.BoxGeometry(w, h, d);
      var n = seg * 2 + 1;
      var g = new THREE.BoxGeometry(1, 1, 1, n, n, n).toNonIndexed();
      var pos = g.attributes.position.array, nor = g.attributes.normal.array, uv = g.attributes.uv.array;
      var kutu = new V3(w / 2 - r, h / 2 - r, d / 2 - r), p = new V3(), nn = new V3();
      var yuzBoy = pos.length / 6, yarim = 0.5 / n;
      for (var i = 0, j = 0; i < pos.length; i += 3, j += 2) {
        p.fromArray(pos, i);
        nn.set(p.x - Math.sign(p.x) * yarim, p.y - Math.sign(p.y) * yarim, p.z - Math.sign(p.z) * yarim).normalize();
        var x = kutu.x * Math.sign(p.x) + nn.x * r, y = kutu.y * Math.sign(p.y) + nn.y * r, z = kutu.z * Math.sign(p.z) + nn.z * r;
        pos[i] = x; pos[i + 1] = y; pos[i + 2] = z;
        nor[i] = nn.x; nor[i + 1] = nn.y; nor[i + 2] = nn.z;
        var yuz = Math.floor(i / yuzBoy);
        if (yuz === 0) { uv[j] = 0.5 - z / d; uv[j + 1] = 0.5 + y / h; }
        else if (yuz === 1) { uv[j] = 0.5 + z / d; uv[j + 1] = 0.5 + y / h; }
        else if (yuz === 2) { uv[j] = 0.5 + x / w; uv[j + 1] = 0.5 - z / d; }
        else if (yuz === 3) { uv[j] = 0.5 + x / w; uv[j + 1] = 0.5 + z / d; }
        else if (yuz === 4) { uv[j] = 0.5 + x / w; uv[j + 1] = 0.5 + y / h; }
        else { uv[j] = 0.5 - x / w; uv[j + 1] = 0.5 + y / h; }
      }
      g.computeBoundingBox(); g.computeBoundingSphere();
      return g;
    });
  };

  /** Kutu mesh'i. r > 0 ise kenarlar yuvarlatılır. */
  K.kutu = function (w, h, d, mat, r, seg) {
    var m = new THREE.Mesh(r ? K.yuvarlakKutuGeo(w, h, d, r, seg) : geoPaylas(['k', w, h, d].join(':'), function () {
      return new THREE.BoxGeometry(w, h, d);
    }), typeof mat === 'string' ? K.mat(mat) : mat);
    return m;
  };

  /** Silindir mesh'i (Y ekseninde). */
  K.silindir = function (ru, h, mat, seg, ra) {
    seg = seg || 24;
    ra = ra == null ? ru : ra;
    var g = geoPaylas(['s', ru, ra, h, seg].join(':'), function () { return new THREE.CylinderGeometry(ru, ra, h, seg); });
    return new THREE.Mesh(g, typeof mat === 'string' ? K.mat(mat) : mat);
  };

  /** Düzlem mesh'i (XY düzleminde, +Z'ye bakar). */
  K.duzlem = function (w, h, mat) {
    var g = geoPaylas(['d', w, h].join(':'), function () { return new THREE.PlaneGeometry(w, h); });
    return new THREE.Mesh(g, typeof mat === 'string' ? K.mat(mat) : mat);
  };

  /** Kablo: noktalar (Vector3 dizisi) boyunca tüp. */
  K.kablo = function (noktalar, r, mat) {
    var egri = new THREE.CatmullRomCurve3(noktalar, false, 'centripetal');
    var m = new THREE.Mesh(new THREE.TubeGeometry(egri, Math.max(24, noktalar.length * 12), r || 0.3, 8, false),
      typeof mat === 'string' ? K.mat(mat) : (mat || K.mat('kablo')));
    m.userData.egri = egri;
    return m;
  };

  /** Tekrarlanan parçalar için InstancedMesh. konumlar: [[x,y,z], ...] */
  K.ornekle = function (geo, mat, konumlar, donus) {
    var im = new THREE.InstancedMesh(geo, typeof mat === 'string' ? K.mat(mat) : mat, konumlar.length);
    var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new V3(1, 1, 1);
    if (donus) q.setFromEuler(new THREE.Euler(donus[0], donus[1], donus[2]));
    for (var i = 0; i < konumlar.length; i++) {
      var k = konumlar[i];
      var olcek = k[3] ? new V3(k[3], 1, 1) : s1;
      m4.compose(new V3(k[0], k[1], k[2]), q, olcek);
      im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
    return im;
  };

  /** Parçayı adlandırır ve bilgi ekler (etiket/bilgi E-BILGI, A-VURGU, E-AV için). */
  K.parca = function (nesne, ad, etiket, bilgi) {
    nesne.name = ad;
    if (etiket) nesne.userData.etiket = etiket;
    if (bilgi) nesne.userData.bilgi = bilgi;
    return nesne;
  };

  /** Konumla ekle: ebeveyn.add(nesne) + position.set(x, y, z) */
  K.koy = function (ebeveyn, nesne, x, y, z, rx, ry, rz) {
    nesne.position.set(x || 0, y || 0, z || 0);
    if (rx || ry || rz) nesne.rotation.set(rx || 0, ry || 0, rz || 0);
    ebeveyn.add(nesne);
    return nesne;
  };

  /** Belirleyici rastgele sayı üreteci. */
  K.rng = function (tohum) {
    var a = tohum || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /** Canvas dokusu (≤ 512 px). ciz(ctx, w, h). Emoji kullanılmaz. */
  K.canvasDoku = function (w, h, ciz) {
    var c = document.createElement('canvas');
    c.width = Math.min(w, 512); c.height = Math.min(h, 512);
    var ctx = c.getContext('2d');
    ciz(ctx, c.width, c.height);
    var tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = 4;
    tx.userData.ciz = function (fn) { fn(ctx, c.width, c.height); tx.needsUpdate = true; };
    return tx;
  };

  /** Yuvarlak köşeli dikdörtgen yolu (canvas). */
  K.yuvarlakDikdortgen = function (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  /** Havalandırma ızgarası dokusu (delikli metal). */
  K.izgaraDoku = function (renk, delik) {
    return K.canvasDoku(256, 256, function (ctx, w, h) {
      ctx.fillStyle = renk || '#2a2d33'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = delik || '#0c0d10';
      for (var y = 0; y < h; y += 12) {
        for (var x = (y / 12) % 2 ? 6 : 0; x < w; x += 12) {
          ctx.beginPath(); ctx.arc(x + 3, y + 3, 3.4, 0, Math.PI * 2); ctx.fill();
        }
      }
    });
  };
})(typeof window !== 'undefined' ? window : this);
