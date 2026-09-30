/* DON-301 H02 — İşlemci · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var THREE = window.THREE, V3 = D.kit.V3;
  DERS.tahminKur('Tahminini aldık. Adım 3’te iki işlemciyi yarıştırıp sınayacağız.');

  function el(etiket, sinif, ebeveyn, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function sayi(n, basamak) {
    var s = (basamak == null ? Math.round(n) : n.toFixed(basamak)).toString();
    var p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return p.join(',');
  }
  function hx(n) { return ('0' + (n >>> 0).toString(16).toUpperCase()).slice(-2); }
  function aktifMi(id) { var s = document.getElementById(id); return !!(s && s.classList.contains('active')); }

  /* ════════════ Basit işlemci modeli (Adım 2 ve Etkinlik 1 ortak) ════════════
     Komutlar: LOAD a · ADD a · SUB a · STORE a · JNZ a · HALT (akümülatörlü öğretim modeli) */
  var OPAC = {
    LOAD: 'belleği oku, ACC’ye yaz', ADD: 'belleği oku, ALU ile ACC’ye ekle', SUB: 'belleği oku, ALU ile ACC’den çıkar',
    STORE: 'ACC’yi belleğe yaz', JNZ: 'Z = 0 ise PC’yi değiştir (atla)', HALT: 'programı durdur'
  };
  var OPKISA = { LOAD: 'oku → ACC', ADD: 'oku, ALU: topla', SUB: 'oku, ALU: çıkar', STORE: 'ACC → belleğe yaz', JNZ: 'Z = 0 ise atla', HALT: 'dur' };
  function komutYaz(h) { return !h ? '—' : (h.op ? h.op + (h.op === 'HALT' ? '' : ' ' + hx(h.arg)) : String(h.v)); }
  function Makine(tanim) { this.tanim = tanim; this.sifirla(); }
  Makine.prototype.sifirla = function () {
    var m = this;
    m.mem = {}; m.sira = [];
    m.tanim.forEach(function (t) { m.mem[t[0]] = t[1] ? { op: t[1], arg: t[2] } : { v: t[2] }; m.sira.push(t[0]); });
    m.pc = m.sira[0]; m.ir = null; m.mar = null; m.mdr = null; m.acc = 0; m.z = 0;
    m.bitti = false; m.hata = null; m.komutSay = 0; m.sayac = {}; m.kuyruk = []; m.evre = -1; m.planPc = null;
  };
  Makine.prototype.veri = function (adr) { var c = this.mem[adr]; return c && c.v != null ? c.v : 0; };
  /* Bir komutun mikro adımları: e = 0 GETİR, 1 ÇÖZ, 2 YÜRÜT; yol = [kaynak, hedef, etiket()] */
  Makine.prototype.komutPlani = function () {
    var m = this, pc = m.pc, h = m.mem[pc], L = [];
    var hm = komutYaz(h);
    L.push({ e: 0, rtl: 'MAR ← PC', ac: 'PC’deki adres (' + hx(pc) + ') MAR’a kopyalanır.', yol: ['pc', 'mar', function () { return hx(pc); }],
      f: function () { m.mar = pc; } });
    L.push({ e: 0, rtl: 'MDR ← Bellek[' + hx(pc) + ']', ac: 'Adres yolu ' + hx(pc) + ' hücresini seçer, kontrol yolu OKU der; içerik veri yoluyla MDR’ye gelir.',
      yol: ['h' + pc, 'mdr', function () { return hm; }], hucre: pc, bellek: 'oku', f: function () { m.mdr = h ? Object.assign({}, h) : null; } });
    L.push({ e: 0, rtl: 'IR ← MDR · PC ← PC + 1', ac: 'Komut IR’ye alınır; PC bir artar ve sıradaki komutu gösterir (' + hx(pc + 1) + ').',
      yol: ['mdr', 'ir', function () { return hm; }], f: function () { m.ir = m.mdr; m.pc = pc + 1; } });
    if (!h || !h.op) {
      L.push({ e: 1, rtl: 'ÇÖZ: geçersiz komut', ac: 'Bu hücrede komut değil veri var; kontrol birimi çözemez ve program durur.',
        yol: ['ir', 'kb', function () { return '?'; }], f: function () { m.bitti = true; m.hata = 'gecersiz'; } });
      return L;
    }
    var a = h.arg, op = h.op;
    L.push({ e: 1, rtl: 'ÇÖZ: ' + op + (op === 'HALT' ? '' : ' · adres ' + hx(a)), ac: 'Kontrol birimi işlem kodunu ayırır: ' + op + ' = ' + OPAC[op] + '.',
      yol: ['ir', 'kb', function () { return op; }], f: function () {} });
    if (op === 'LOAD' || op === 'ADD' || op === 'SUB') {
      L.push({ e: 2, rtl: 'MAR ← ' + hx(a), ac: 'İşlenenin adresi (' + hx(a) + ') MAR’a gider.', yol: ['ir', 'mar', function () { return hx(a); }], f: function () { m.mar = a; } });
      L.push({ e: 2, rtl: 'MDR ← Bellek[' + hx(a) + ']', ac: 'Veri bellekten okunur ve MDR’ye gelir.', hucre: a, bellek: 'oku',
        yol: ['h' + a, 'mdr', function () { return String(m.veri(a)); }], f: function () { m.mdr = { v: m.veri(a) }; } });
      if (op === 'LOAD') {
        L.push({ e: 2, rtl: 'ACC ← MDR', ac: 'Okunan değer ACC’ye yazılır.', yol: ['mdr', 'acc', function () { return String(m.mdr.v); }],
          f: function () { m.acc = m.mdr.v; } });
      } else {
        var isaret = op === 'ADD' ? '+' : '−';
        L.push({ e: 2, rtl: 'ALU: ACC ' + isaret + ' MDR', ac: 'ACC ve MDR, ALU’nun iki girişine gelir; ALU ' + (op === 'ADD' ? 'toplar' : 'çıkarır') + '.',
          yol: ['mdr', 'alu', function () { return m.acc + ' ' + isaret + ' ' + m.mdr.v; }], alu: true, f: function () {} });
        L.push({ e: 2, rtl: 'ACC ← sonuç · Z güncellenir', ac: 'Sonuç ACC’ye yazılır; sonuç 0 ise Z bayrağı 1, değilse 0 olur.',
          yol: ['alu', 'acc', function () { return String(op === 'ADD' ? m.acc + m.mdr.v : m.acc - m.mdr.v); }],
          f: function () { m.acc = op === 'ADD' ? m.acc + m.mdr.v : m.acc - m.mdr.v; m.z = m.acc === 0 ? 1 : 0; } });
      }
    } else if (op === 'STORE') {
      L.push({ e: 2, rtl: 'MAR ← ' + hx(a), ac: 'Yazılacak hücrenin adresi (' + hx(a) + ') MAR’a gider.', yol: ['ir', 'mar', function () { return hx(a); }], f: function () { m.mar = a; } });
      L.push({ e: 2, rtl: 'MDR ← ACC', ac: 'ACC’deki değer MDR’ye kopyalanır.', yol: ['acc', 'mdr', function () { return String(m.acc); }], f: function () { m.mdr = { v: m.acc }; } });
      L.push({ e: 2, rtl: 'Bellek[' + hx(a) + '] ← MDR', ac: 'Kontrol yolu YAZ der; MDR’deki değer veri yoluyla ' + hx(a) + ' hücresine yazılır.', hucre: a, bellek: 'yaz',
        yol: ['mdr', 'h' + a, function () { return String(m.mdr.v); }], f: function () { m.mem[a] = { v: m.mdr.v }; } });
    } else if (op === 'JNZ') {
      var atla = m.z === 0;
      L.push({ e: 2, rtl: atla ? 'Z = 0 → PC ← ' + hx(a) : 'Z = 1 → atlama yok', ac: atla ? 'Son sonuç 0 değil: PC’ye ' + hx(a) + ' yazılır, döngü başa döner.' : 'Son sonuç 0: PC değişmez, sıradaki komuta geçilir.',
        yol: atla ? ['ir', 'pc', function () { return hx(a); }] : ['z', 'kb', function () { return 'Z = 1'; }], f: function () { if (atla) m.pc = a; } });
    } else {
      L.push({ e: 2, rtl: 'HALT', ac: 'Kontrol birimi yeni komut getirmeyi durdurur; program bitti.', yol: null, f: function () { m.bitti = true; } });
    }
    return L;
  };
  Makine.prototype.mikro = function () {
    if (this.bitti) return null;
    if (!this.kuyruk.length) { this.kuyruk = this.komutPlani(); this.planPc = this.pc; }
    var s = this.kuyruk.shift();
    s.f();
    this.evre = s.e;
    if (!this.kuyruk.length && !this.hata) { this.komutSay++; this.sayac[this.planPc] = (this.sayac[this.planPc] || 0) + 1; }
    if (this.komutSay >= 80 && !this.bitti) { this.bitti = true; this.hata = 'sinir'; }
    return s;
  };
  Makine.prototype.siradakiEvre = function () {
    if (this.bitti) return -1;
    return this.kuyruk.length ? this.kuyruk[0].e : 0;
  };
  Makine.prototype.evreAdim = function () {
    var e = this.siradakiEvre(), l = [];
    if (e < 0) return l;
    do { l.push(this.mikro()); } while (!this.bitti && this.kuyruk.length && this.kuyruk[0].e === e);
    return l;
  };
  Makine.prototype.komutAdim = function () {
    var l = [];
    if (this.bitti) return l;
    do { l.push(this.mikro()); } while (!this.bitti && this.kuyruk.length);
    return l;
  };

  /* ════════════ Çekirdek şeması (SVG, Adım 1 ve 2) ════════════ */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var F = 'font-family="Inter,Arial,sans-serif"', MF = 'font-family="JetBrains Mono,Consolas,monospace"';
  var YAZMAC = {
    pc: [18, 84, 'PC', 'sıradaki komutun adresi'], mar: [144, 84, 'MAR', 'bellek adresi'],
    ir: [18, 126, 'IR', 'yürütülen komut'], mdr: [144, 126, 'MDR', 'bellek verisi'],
    acc: [18, 168, 'ACC', 'ara sonuç (akümülatör)'], z: [144, 168, 'Z', 'sıfır bayrağı']
  };
  var MERKEZ = { kb: [137, 49], pc: [74, 101], mar: [200, 101], ir: [74, 143], mdr: [200, 143], acc: [74, 185], z: [200, 185], alu: [137, 238] };
  function hucreY(i) { return 30 + i * 33; }
  function cekirdekSvg(tanim, aria) {
    var s = '<svg viewBox="0 0 400 270" xmlns="' + SVGNS + '" role="img" aria-label="' + aria + '" class="cp">';
    s += '<rect x="6" y="6" width="262" height="258" rx="12" fill="#f5f3ff" stroke="#6d28d9" stroke-width="2"/>';
    s += '<text x="137" y="19" ' + F + ' font-size="9" font-weight="900" fill="#4c1d95" text-anchor="middle">İŞLEMCİ ÇEKİRDEĞİ · basit öğretim modeli</text>';
    // iç yol
    s += '<path d="M137 76V212" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round"/>';
    s += '<g class="cp-blok" data-blok="kb"><rect x="18" y="26" width="238" height="46" rx="8" fill="#fff" stroke="#7c3aed" stroke-width="2"/>' +
      '<text x="28" y="42" ' + F + ' font-size="11" font-weight="900" fill="#4c1d95">Kontrol Birimi</text>' +
      '<text x="28" y="53" ' + F + ' font-size="7.5" font-weight="700" fill="#64748b">komutu çözer · birimlere sinyal gönderir</text>' +
      '<text class="cp-kb" x="28" y="66" ' + MF + ' font-size="8.5" font-weight="800" fill="#6d28d9">hazır</text></g>';
    Object.keys(YAZMAC).forEach(function (k) {
      var r = YAZMAC[k], z = k === 'z';
      s += '<g class="cp-blok" data-blok="' + k + '"><rect x="' + r[0] + '" y="' + r[1] + '" width="112" height="34" rx="7" fill="#fff" stroke="' + (z ? '#16a34a' : '#0ea5e9') + '" stroke-width="1.8"/>' +
        '<text x="' + (r[0] + 8) + '" y="' + (r[1] + 14) + '" ' + F + ' font-size="10.5" font-weight="900" fill="' + (z ? '#166534' : '#075985') + '">' + r[2] + '</text>' +
        '<text x="' + (r[0] + 8) + '" y="' + (r[1] + 27) + '" ' + F + ' font-size="6.8" font-weight="700" fill="#64748b">' + r[3] + '</text>' +
        '<text class="cp-v" data-v="' + k + '" x="' + (r[0] + 104) + '" y="' + (r[1] + 22) + '" ' + MF + ' font-size="12" font-weight="900" fill="#0f172a" text-anchor="end">—</text></g>';
    });
    s += '<g class="cp-blok" data-blok="alu"><path d="M58 214H122L137 227L152 214H216L188 260H86Z" fill="#fff7ed" stroke="#ea580c" stroke-width="2" stroke-linejoin="round"/>' +
      '<text x="137" y="244" ' + F + ' font-size="12" font-weight="900" fill="#9a3412" text-anchor="middle">ALU</text>' +
      '<text x="137" y="255" ' + F + ' font-size="7" font-weight="700" fill="#9a3412" text-anchor="middle">+ − karşılaştır · VE/VEYA</text></g>';
    // yollar (CPU ↔ bellek)
    [['kontrol', 49, '#16a34a', '2 4'], ['adres', 101, '#2563eb', '7 4'], ['veri', 143, '#ea580c', '']].forEach(function (y) {
      s += '<g class="cp-yol" data-yol="' + y[0] + '"><path d="M256 ' + y[1] + 'H290" stroke="' + y[2] + '" stroke-width="' + (y[0] === 'veri' ? 4 : 2.6) + '" ' +
        (y[3] ? 'stroke-dasharray="' + y[3] + '" ' : '') + 'stroke-linecap="round"/>' +
        '<text x="273" y="' + (y[1] - 5) + '" ' + F + ' font-size="7" font-weight="800" fill="' + y[2] + '" text-anchor="middle">' + y[0] + '</text></g>';
    });
    s += '<g class="cp-blok" data-blok="bellek"><rect x="288" y="6" width="106" height="258" rx="10" fill="#fffbeb" stroke="#b45309" stroke-width="2"/>' +
      '<text x="341" y="20" ' + F + ' font-size="9" font-weight="900" fill="#92400e" text-anchor="middle">Ana Bellek (RAM)</text></g>';
    tanim.forEach(function (t, i) {
      var y = hucreY(i), k = !!t[1];
      s += '<g class="cp-hucre" data-adr="' + t[0] + '"><rect x="296" y="' + y + '" width="90" height="27" rx="5" fill="' + (k ? '#eef2ff' : '#fff') + '" stroke="' + (k ? '#a5b4fc' : '#fcd34d') + '" stroke-width="1.4"/>' +
        '<text x="302" y="' + (y + 17) + '" ' + MF + ' font-size="8.5" font-weight="800" fill="#92400e">' + hx(t[0]) + '</text>' +
        '<text class="cp-h" x="322" y="' + (y + 17.5) + '" ' + MF + ' font-size="9.5" font-weight="900" fill="#0f172a">' + komutYaz(t[1] ? { op: t[1], arg: t[2] } : { v: t[2] }) + '</text></g>';
    });
    s += '<g class="cp-paket" opacity="0"><rect x="-32" y="-9" width="64" height="18" rx="9" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>' +
      '<text class="cp-paket-t" x="0" y="3.5" ' + MF + ' font-size="8.5" font-weight="900" fill="#1f1300" text-anchor="middle"></text></g>';
    return s + '</svg>';
  }
  function merkezBul(svg, ad, tanim) {
    if (ad.charAt(0) === 'h') {
      var adr = +ad.slice(1), i = tanim.findIndex(function (t) { return t[0] === adr; });
      return [341, hucreY(Math.max(0, i)) + 13.5];
    }
    return MERKEZ[ad] || [137, 140];
  }

  /* ─────────── Kapak: işlemci, kapak kalkık, çip görünür ─────────── */
  function cipKur(cpu) {
    var K = D.kit, o = cpu.userData.olcu;
    var cip = K.kutu(1.9, 0.06, 1.3, K.mat('#2a3140', { roughness: 0.18, metalness: 0.7 }), 0.012, 1);
    K.parca(cip, 'cip', 'Silisyum çip', 'Transistörlerin bulunduğu silisyum parça. Devre yüzü aşağıya, alt karta bakar; bu yüzden üstten düz görünür.');
    cip.position.set(0, o.T + 0.03, 0);
    cpu.add(cip);
    return cip;
  }
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), arkaPlan: 'seffaf', otomatikDonus: true, turSuresi: 36,
      kamera: { yon: [0.7, 0.8, 1.3], pay: 0.86 } });
    var cpu = s.ekle('M-CPU');
    cipKur(cpu);
    cpu.userData.kapak.position.set(0, 1.9, -2.3);
    cpu.userData.kapak.rotation.x = 0.22;
    s.yerlestir();
  });

  /* ─────────── Adım 1: çekirdeğin içi (tıklanır şema) ─────────── */
  var BILGI = {
    kb: ['Kontrol Birimi', 'IR’deki komutu çözer (işlem kodu + adres) ve yazmaçlara, ALU’ya, belleğe ne yapacaklarını sinyallerle bildirir. Adımları saat sinyaline göre sıralar.'],
    alu: ['ALU · Aritmetik Mantık Birimi', 'Toplama, çıkarma, karşılaştırma ve VE/VEYA gibi mantık işlemlerini yapar. Sonuca göre durum bayraklarını (ör. Z) günceller.'],
    pc: ['PC · Program Sayacı', 'Sıradaki komutun bellekteki adresini tutar. Komut getirilince bir artar; atlama komutu PC’ye yeni bir adres yazar.'],
    ir: ['IR · Komut Yazmacı', 'O anda çözülen ve yürütülen komutu tutar (ör. ADD 0B). Kontrol birimi komutu buradan okur.'],
    mar: ['MAR · Bellek Adres Yazmacı', 'Belleğe gönderilecek adresi tutar; adres yoluna bağlıdır. Okuma da yazma da buradaki adrese yapılır.'],
    mdr: ['MDR · Bellek Veri Yazmacı', 'Bellekten okunan ya da belleğe yazılacak değeri tutar; veri yoluna bağlıdır.'],
    acc: ['ACC · Akümülatör', 'Hesaplamaların ara sonucunu tutan yazmaç. ALU’nun hem bir girişi hem de sonucun yazıldığı yerdir.'],
    z: ['Z · Sıfır Bayrağı', 'Durum yazmacının bir biti: son ALU sonucu 0 ise 1 olur. Koşullu atlama komutları kararını bu bite bakarak verir.'],
    bellek: ['Ana Bellek (RAM)', 'Çekirdeğin dışındadır. Komutlar ve veriler numaralı hücrelerde birlikte durur (1. hafta: depolanmış program).']
  };
  var PROG_A = [[0, 'LOAD', 10], [1, 'ADD', 11], [2, 'STORE', 12], [3, 'HALT'], [10, null, 8], [11, null, 5], [12, null, 0]];
  (function () {
    var kok = document.getElementById('cekirdek-ici');
    if (!kok) return;
    kok.innerHTML = '<div class="illu-orta cp-sahne">' + cekirdekSvg(PROG_A, 'İşlemci çekirdeği şeması: kontrol birimi, PC, MAR, IR, MDR, ACC ve Z yazmaçları, ALU; sağda ana bellek, arada kontrol, adres ve veri yolları') + '</div>' +
      '<div class="vn-kart cp-kart" aria-live="polite"></div><div class="cp-not">Gerçek çekirdeklerde onlarca yazmaç ve birden çok ALU bulunur; MAR/MDR bu dersteki öğretim modelidir.</div>';
    var svg = kok.querySelector('svg'), kart = kok.querySelector('.cp-kart');
    svg.querySelectorAll('.cp-v').forEach(function (t) { t.textContent = { pc: '00', ir: '—', mar: '—', mdr: '—', acc: '0', z: '0' }[t.dataset.v]; });
    var tur = null;
    function sec(ad) {
      svg.querySelectorAll('.cp-blok').forEach(function (b) { b.classList.toggle('secili', b.dataset.blok === ad); });
      svg.querySelectorAll('.cp-yol').forEach(function (y) {
        var ilgili = { mar: ['adres'], mdr: ['veri'], kb: ['kontrol'], bellek: ['adres', 'veri', 'kontrol'] }[ad] || [];
        y.classList.toggle('soluk', ilgili.indexOf(y.dataset.yol) < 0);
      });
      kart.innerHTML = '<b></b><span></span>';
      kart.firstChild.textContent = BILGI[ad][0];
      kart.lastChild.textContent = BILGI[ad][1];
    }
    svg.querySelectorAll('.cp-blok').forEach(function (b) {
      b.setAttribute('tabindex', '0'); b.setAttribute('role', 'button'); b.setAttribute('aria-label', BILGI[b.dataset.blok][0]);
      function git(e) { e.stopPropagation(); if (tur) { clearTimeout(tur); tur = null; } sec(b.dataset.blok); }
      b.addEventListener('click', git);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); git(e); } });
    });
    sec('kb');
    DERS.slaytAcilinca('s5', function () {
      if (AZ) return;
      var sira = ['kb', 'alu', 'pc', 'ir', 'mar', 'mdr', 'acc', 'z', 'kb'], i = 0;
      (function dongu() { if (i < sira.length) { sec(sira[i++]); tur = setTimeout(dongu, 1700); } else tur = null; })();
    });
  })();

  /* ─────────── Adım 2: A-BORU — getir, çöz, yürüt; yazmaçlar canlı değişir ─────────── */
  var EVRE_AD = ['GETİR', 'ÇÖZ', 'YÜRÜT'];
  function evreSerit(ebeveyn) {
    var serit = el('div', 'fd-evreler', ebeveyn), cipler = [];
    EVRE_AD.forEach(function (ad, i) {
      if (i) el('span', 'fd-ok', serit, '▸');
      cipler.push(el('span', 'fd-evre', serit, ad));
    });
    var komut = el('span', 'fd-komut', serit, '');
    return function (e, metin) {
      cipler.forEach(function (c, i) { c.classList.toggle('aktif', i === e); c.classList.toggle('bitti', e > i); });
      komut.textContent = metin || '';
    };
  }
  (function () {
    var kok = document.getElementById('boru');
    if (!kok) return;
    kok.innerHTML = '<div class="fd-ust"></div><div class="illu-orta cp-sahne">' +
      cekirdekSvg(PROG_A, 'Getir–çöz–yürüt animasyonu: komutlar bellekten MDR ve IR’ye gelir, kontrol birimi çözer, ALU yürütür; yazmaç değerleri değişir') + '</div>' +
      '<div class="fd-rtl" aria-live="polite"><code></code><span></span></div><div class="fd-alt"><div class="fd-tahmin" role="group" aria-label="Tahmin: 0C hücresine ne yazılacak"><span>Tahmin 0C =</span></div>' +
      '<div class="secici fd-kontrol"></div></div>';
    var evreGoster = evreSerit(kok.querySelector('.fd-ust'));
    var svg = kok.querySelector('svg'), rtl = kok.querySelector('.fd-rtl code'), ac = kok.querySelector('.fd-rtl span');
    var paket = svg.querySelector('.cp-paket'), paketT = svg.querySelector('.cp-paket-t');
    var m = new Makine(PROG_A), tahmin = null, calisiyor = false, oto = false, kimlik = 0;
    var tg = kok.querySelector('.fd-tahmin'), tdg = [];
    ['5', '8', '13'].forEach(function (x) {
      var b = DERS.dugme(tg, x, function () { tahmin = x; tdg.forEach(function (y) { y.setAttribute('aria-pressed', y === b ? 'true' : 'false'); }); });
      b.setAttribute('aria-pressed', 'false'); tdg.push(b);
    });
    function degerleri() {
      var v = { pc: hx(m.pc), ir: komutYaz(m.ir), mar: m.mar == null ? '—' : hx(m.mar), mdr: m.mdr ? komutYaz(m.mdr) : '—', acc: String(m.acc), z: String(m.z) };
      svg.querySelectorAll('.cp-v').forEach(function (t) {
        var y = v[t.dataset.v];
        if (t.textContent !== y) { t.textContent = y; var g = t.parentNode; g.classList.remove('degisti'); void g.getBoundingClientRect(); g.classList.add('degisti'); }
      });
      svg.querySelectorAll('.cp-hucre').forEach(function (g) { g.querySelector('.cp-h').textContent = komutYaz(m.mem[+g.dataset.adr]); });
    }
    function isaretle(adim) {
      svg.querySelectorAll('.cp-blok').forEach(function (b) { b.classList.remove('secili'); });
      svg.querySelectorAll('.cp-hucre').forEach(function (g) { g.classList.remove('oku', 'yaz', 'pc'); });
      svg.querySelectorAll('.cp-yol').forEach(function (y) { y.classList.remove('akiyor'); y.classList.add('soluk'); });
      var pcH = svg.querySelector('.cp-hucre[data-adr="' + m.pc + '"]');
      if (pcH && !m.bitti) pcH.classList.add('pc');
      if (!adim) return;
      if (adim.yol) adim.yol.slice(0, 2).forEach(function (ad) { var b = svg.querySelector('.cp-blok[data-blok="' + ad + '"]'); if (b) b.classList.add('secili'); });
      if (adim.hucre != null) {
        var h = svg.querySelector('.cp-hucre[data-adr="' + adim.hucre + '"]');
        if (h) h.classList.add(adim.bellek);
        svg.querySelectorAll('.cp-yol').forEach(function (y) { y.classList.remove('soluk'); y.classList.add('akiyor'); });
      }
      if (adim.e === 1) svg.querySelector('.cp-kb').textContent = komutYaz(m.ir) + ' → ' + (OPKISA[m.ir && m.ir.op] || 'geçersiz');
    }
    function tasi(yol, id) {
      return new Promise(function (coz) {
        if (!yol) { coz(); return; }
        var a = merkezBul(svg, yol[0], PROG_A), b = merkezBul(svg, yol[1], PROG_A);
        paketT.textContent = yol[2]();
        paket.setAttribute('opacity', '1');
        if (AZ) { paket.setAttribute('transform', 'translate(' + b[0] + ' ' + b[1] + ')'); setTimeout(coz, 30); return; }
        var t0 = performance.now(), sure = 520;
        (function kare(t) {
          if (id !== kimlik) { coz(); return; }
          var e = Math.min(1, (t - t0) / sure), k = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
          paket.setAttribute('transform', 'translate(' + (a[0] + (b[0] - a[0]) * k).toFixed(1) + ' ' + (a[1] + (b[1] - a[1]) * k).toFixed(1) + ')');
          if (e < 1) requestAnimationFrame(kare); else coz();
        })(t0);
      });
    }
    function sonuc() {
      var s = m.veri(12);
      var t = tahmin == null ? '' : (tahmin === String(s) ? ' Tahminin doğru.' : ' Tahminin ' + tahmin + ' idi.');
      rtl.textContent = 'HALT'; ac.textContent = 'Program bitti: 0C = ' + s + ' (8 + 5). ' + m.komutSay + ' komut, her biri üç evreden geçti.' + t;
      evreGoster(3, 'bitti');
    }
    function adim() {
      if (calisiyor) return Promise.resolve();
      if (m.bitti) { sonuc(); return Promise.resolve(); }
      calisiyor = true;
      var id = kimlik;
      var sonraki = m.kuyruk.length ? m.kuyruk[0] : null;
      if (!sonraki) { m.kuyruk = m.komutPlani(); m.planPc = m.pc; sonraki = m.kuyruk[0]; }
      evreGoster(sonraki.e, 'Komut ' + (m.komutSay + 1) + ' · ' + komutYaz(m.mem[m.planPc]));
      rtl.textContent = sonraki.rtl; ac.textContent = sonraki.ac;
      isaretle(sonraki);
      return tasi(sonraki.yol, id).then(function () {
        if (id !== kimlik) return;
        m.mikro();
        paket.setAttribute('opacity', sonraki.yol ? '0.0' : '0');
        degerleri();
        isaretle(sonraki);
        if (m.bitti) sonuc();
      }).then(function () { calisiyor = false; });
    }
    function sifirla() {
      kimlik++; oto = false; calisiyor = false;
      m.sifirla(); paket.setAttribute('opacity', '0');
      svg.querySelector('.cp-kb').textContent = 'hazır';
      degerleri(); isaretle(null); evreGoster(-1, '');
      rtl.textContent = 'Hazır'; ac.textContent = 'PC = 00: ilk komut 00 adresinde. Önce 0C için tahminini seç, sonra Adım’a bas.';
    }
    function oynat() {
      if (oto) return;
      if (m.bitti) sifirla();
      oto = true;
      var id = kimlik;
      (function dongu() {
        if (!oto || id !== kimlik) return;
        adim().then(function () {
          if (m.bitti || !oto || id !== kimlik) { oto = false; return; }
          setTimeout(dongu, AZ ? 60 : 380);
        });
      })();
    }
    var ctl = kok.querySelector('.fd-kontrol');
    DERS.dugme(ctl, 'Adım ▶', function () { oto = false; adim(); });
    DERS.dugme(ctl, 'Oynat', oynat);
    DERS.dugme(ctl, 'Baştan', sifirla);
    sifirla();
  })();

  /* ─────────── Adım 3: IPC × saat hızı (yarış) ─────────── */
  (function () {
    var kok = document.getElementById('saat');
    if (!kok) return;
    var CPU = [
      { ad: 'İşlemci A', alt: 'eski tasarım', renk: '#7c3aed', ghz: 4.2, ipc: 1.5 },
      { ad: 'İşlemci B', alt: 'yeni tasarım', renk: '#0891b2', ghz: 3.6, ipc: 2.5 }
    ];
    var IS = 18;   // milyar komut
    kok.innerHTML = '<div class="sa-kartlar"></div><div class="sa-yaris"><div class="sa-is">Aynı iş: <b>18 milyar</b> komut</div></div>' +
      '<div class="secici sa-kontrol"></div><div class="sa-mesaj" aria-live="polite"></div>';
    var kartlar = kok.querySelector('.sa-kartlar'), yaris = kok.querySelector('.sa-yaris'), mesaj = kok.querySelector('.sa-mesaj');
    var ilkYaris = true;
    CPU.forEach(function (c, i) {
      var k = el('div', 'sa-kart', kartlar);
      k.style.setProperty('--r', c.renk);
      k.innerHTML = '<div class="sa-bas"><b></b><span></span></div>' +
        '<div class="sa-dalga" aria-hidden="true"><svg viewBox="0 0 200 28" preserveAspectRatio="none"><path d="' + dalgaYolu() + '"/></svg></div>' +
        '<label class="sa-surgu"><span>Saat hızı</span><output></output><input type="range" min="2" max="5.5" step="0.1"></label>' +
        '<label class="sa-surgu"><span>IPC</span><output></output><input type="range" min="0.5" max="4" step="0.1"></label>' +
        '<div class="sa-sonuc"><code></code><span>milyar komut/sn</span></div>';
      k.querySelector('.sa-bas b').textContent = c.ad;
      k.querySelector('.sa-bas span').textContent = c.alt;
      var gir = k.querySelectorAll('input'), cik = k.querySelectorAll('output');
      gir[0].setAttribute('aria-label', c.ad + ' saat hızı (GHz)'); gir[1].setAttribute('aria-label', c.ad + ' IPC');
      c.el = { gir: gir, cik: cik, sonuc: k.querySelector('.sa-sonuc code'), yol: k.querySelector('.sa-dalga path') };
      gir[0].addEventListener('input', function () { c.ghz = +gir[0].value; guncelle(); });
      gir[1].addEventListener('input', function () { c.ipc = +gir[1].value; guncelle(); });
      var s = el('div', 'sa-serit', yaris);
      s.style.setProperty('--r', c.renk);
      s.innerHTML = '<span class="sa-ad"></span><div class="sa-bar"><i></i></div><code class="sa-sure">–</code>';
      s.querySelector('.sa-ad').textContent = c.ad.replace('İşlemci ', '');
      c.serit = { bar: s.querySelector('i'), sure: s.querySelector('.sa-sure') };
    });
    function dalgaYolu() {
      var d = 'M0 22', x = 0;
      while (x < 400) { d += 'H' + (x + 10) + 'V6H' + (x + 20) + 'V22'; x += 20; }
      return d;
    }
    function guncelle() {
      CPU.forEach(function (c) {
        c.el.gir[0].value = c.ghz; c.el.gir[1].value = c.ipc;
        c.el.cik[0].textContent = sayi(c.ghz, 1) + ' GHz';
        c.el.cik[1].textContent = sayi(c.ipc, 1);
        c.hiz = c.ghz * c.ipc;
        c.el.sonuc.textContent = sayi(c.hiz, 1);
        c.el.yol.style.animationDuration = (AZ ? 0 : (2.4 / c.ghz)).toFixed(2) + 's';
        c.serit.bar.style.width = '0%'; c.serit.sure.textContent = '–';
      });
      mesaj.textContent = '';
    }
    var kimlik = 0;
    function yaristir() {
      var id = ++kimlik;
      var sureler = CPU.map(function (c) { return IS / c.hiz; });
      var enUzun = Math.max(sureler[0], sureler[1]), gercek = AZ ? 1 : 2600;
      var t0 = performance.now();
      mesaj.textContent = 'Yarış sürüyor…';
      (function kare(t) {
        if (id !== kimlik) return;
        var gecen = (t - t0) / gercek * enUzun;
        CPU.forEach(function (c, i) {
          var o = Math.min(1, gecen / sureler[i]);
          c.serit.bar.style.width = (o * 100).toFixed(1) + '%';
          c.serit.sure.textContent = o >= 1 ? sayi(sureler[i], 2) + ' sn' : sayi(Math.min(gecen, sureler[i]), 1) + ' sn';
        });
        if (gecen < enUzun) { requestAnimationFrame(kare); return; }
        var h = sureler[0] <= sureler[1] ? 0 : 1, y = 1 - h;
        var fark = Math.abs(sureler[0] - sureler[1]) < 0.005;
        var metin = fark ? 'Berabere: IPC × saat hızı iki işlemcide de eşit (' + sayi(CPU[0].hiz, 1) + ' milyar komut/sn).'
          : CPU[h].ad + ' işi ' + sayi(sureler[h], 2) + ' sn’de, ' + CPU[y].ad + ' ' + sayi(sureler[y], 2) + ' sn’de bitirdi: ' +
            sayi(CPU[h].ghz, 1) + ' × ' + sayi(CPU[h].ipc, 1) + ' = ' + sayi(CPU[h].hiz, 1) + ' milyar komut/sn.';
        if (ilkYaris && CPU[0].ghz === 4.2 && CPU[1].ghz === 3.6 && CPU[0].ipc === 1.5 && CPU[1].ipc === 2.5) {
          ilkYaris = false;
          metin += ' ' + DERS.tahminNotu(2, 'GHz düşük olsa da B her döngüde daha çok komut bitiriyor.', 'Düşük GHz’li B önde: her döngüde daha çok komut bitiriyor.');
        }
        mesaj.textContent = metin;
      })(t0);
    }
    var ctl = kok.querySelector('.sa-kontrol');
    DERS.dugme(ctl, 'Yarıştır', yaristir);
    DERS.dugme(ctl, 'Örnek değerler', function () { kimlik++; CPU[0].ghz = 4.2; CPU[0].ipc = 1.5; CPU[1].ghz = 3.6; CPU[1].ipc = 2.5; guncelle(); });
    el('div', 'sa-not', kok, 'Örnek değerlerdir. Gerçek IPC programa göre değişir; işlemciler aynı iş yüküyle yapılan testlerle karşılaştırılır.');
    guncelle();
    DERS.slaytAcilinca('s7', function () { setTimeout(function () { if (aktifMi('s7')) yaristir(); }, AZ ? 0 : 900); });
  })();

  /* ─────────── Adım 4: 3D — kapak kalkar, çipin şematik kat planı (çekirdek, L3), SMT ─────────── */
  D.tembel('#s8-3d', function (kap) {
    var K = D.kit;
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, zemin: false,
      kamera: { yon: [0.12, 1.45, 1], pay: 1.4, hedefOfset: [1.8, 0, 1.55] } });
    var cpu = s.ekle('M-CPU');
    var o = cpu.userData.olcu, kapak = cpu.userData.kapak;
    var cip = cipKur(cpu);
    // Şematik kat planı (çipin üstünde süzülen katman; gerçek devre yüzü aşağıya dönüktür)
    var plan = new THREE.Group();
    plan.name = 'kat-plani';
    var taban = K.kutu(3.1, 0.03, 2.2, new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, transparent: true, opacity: 0.9 }), 0.05, 1);
    taban.userData.secilmez = true;
    plan.add(taban);
    var cekDoku = K.canvasDoku(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#6d28d9'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.20)'; ctx.fillRect(14, 14, w - 28, h * 0.46);          // yürütme birimleri
      ctx.fillStyle = 'rgba(255,255,255,0.10)'; for (var i = 0; i < 4; i++) ctx.fillRect(22 + i * 56, 24, 44, h * 0.36);
      ctx.fillStyle = 'rgba(253,230,138,0.55)'; ctx.fillRect(14, h * 0.54, w * 0.42, h * 0.18);   // L1
      ctx.fillStyle = 'rgba(165,243,252,0.45)'; ctx.fillRect(14, h * 0.76, w - 28, h * 0.18);     // L2
    });
    var BLOK = [];
    function blok(ad, etiket, bilgi, x, z, w, d, mat) {
      var b = K.kutu(w, 0.05, d, mat, 0.02, 1);
      K.parca(b, ad, etiket, bilgi);
      b.position.set(x, 0.04, z);
      plan.add(b);
      BLOK.push(b);
      return b;
    }
    var cekMat = new THREE.MeshStandardMaterial({ map: cekDoku, roughness: 0.5, metalness: 0.05 });
    var cekirdekler = [-1.11, -0.37, 0.37, 1.11].map(function (x, i) {
      return blok('cekirdek-' + (i + 1), 'Çekirdek ' + (i + 1), 'Kendi kontrol birimi, ALU’ları, yazmaçları ve L1/L2 önbelleği olan bağımsız işlem birimi.', x, -0.6, 0.66, 0.8, cekMat);
    });
    var l3 = blok('l3', 'L3 önbellek (paylaşılan)', 'Tüm çekirdeklerin ortak kullandığı büyük önbellek; tipik olarak onlarca MB.', 0, 0.08, 2.88, 0.44, K.mat('#0891b2', { roughness: 0.5 }));
    blok('bellek-denetleyicisi', 'Bellek denetleyicisi', 'RAM ile konuşan birim; bellek kanallarını yönetir (3. hafta).', -0.98, 0.68, 0.92, 0.64, K.mat('#b45309', { roughness: 0.5 }));
    blok('grafik', 'Tümleşik grafik', 'Görüntü üreten birim; her işlemcide bulunmaz.', 0.1, 0.68, 1.08, 0.64, K.mat('#15803d', { roughness: 0.5 }));
    blok('gc', 'G/Ç birimi', 'PCIe hatları ve anakart yonga seti bağlantısı (5. hafta).', 1.08, 0.68, 0.72, 0.64, K.mat('#475569', { roughness: 0.5 }));
    plan.position.set(0, o.T + 0.1, 0);
    plan.scale.setScalar(0.8);
    plan.visible = false;
    cpu.add(plan);
    s.yerlestir();
    D.dondur(s, { ipucu: false, sinir: { minPolar: 0.2, maxPolar: 1.3, minYakin: 0.5, maxYakin: 1.5 } });
    var mesaj = DERS.sahneMesaj(s);
    var bilgi = D.bilgi(s, BLOK.map(function (b) { return b.name; }).concat(['cip']));
    var etiketler = [];
    function etiketTemizle() { etiketler.forEach(function (e) { e.kaldir(); }); etiketler = []; }
    function vurguTemizle() { BLOK.forEach(function (b) { D.vurguKaldir(b, 0.01); }); }

    // Alt şerit (HTML): çekirdek / SMT zaman çizelgesi
    var serit = D.div('ck-serit', s.arayuz);
    serit.hidden = true;
    serit.setAttribute('aria-live', 'polite');

    var acik = false, planAcik = false, mesgul = false, kimlik = 0;
    function kapakAc(ac) {
      if (ac === acik) return Promise.resolve();
      acik = ac;
      kapakDugme.querySelector('span').textContent = ac ? 'Kapağı kapat' : 'Kapağı kaldır';
      if (!ac) { planGoster(false); serit.hidden = true; }
      var yol = ac ? [new V3(0, 1.4, 0), new V3(4.1, 0.05, -0.6)] : [new V3(0, 1.4, 0), new V3(0, 0, 0)];
      return D.git(kapak, yol[0], AZ ? 0.01 : 0.6).then(function () { return D.git(kapak, yol[1], AZ ? 0.01 : 0.8); }).then(function () {
        if (ac) mesaj('Kapağın altında silisyum çip var. Devre yüzü aşağıya dönük olduğundan üstten düz görünür.', '');
        else mesaj('Kapak kapalı. Kapağı kaldır ve çipi gör.', '');
      });
    }
    function planGoster(g) {
      if (g === planAcik) return Promise.resolve();
      planAcik = g;
      etiketTemizle(); vurguTemizle(); bilgi.kapat();
      if (g) {
        plan.visible = true;
        plan.position.y = o.T + 0.1;
        return D.git(plan, new V3(0, o.T + 0.85, 0), AZ ? 0.01 : 0.8).then(function () {
          etiketler.push(s.etiket(taban, 'Şematik kat planı', { tur: 'bilgi', yer: 'alt' }));
        });
      }
      return D.git(plan, new V3(0, o.T + 0.1, 0), AZ ? 0.01 : 0.5).then(function () { plan.visible = false; });
    }
    function cekirdekGoster() {
      if (mesgul) return;
      mesgul = true;
      var id = ++kimlik;
      kapakAc(true).then(function () { return planGoster(true); }).then(function () {
        if (id !== kimlik) return;
        etiketTemizle(); vurguTemizle(); bilgi.kapat();
        mesaj('', '');
        seritCekirdek();
        var z = Promise.resolve();
        cekirdekler.forEach(function (c, i) {
          z = z.then(function () {
            if (id !== kimlik) return;
            D.vurgula(c, { etiket: false });
            etiketler.push(s.etiket(c, 'Ç' + (i + 1), { tur: 'vurgu', yer: 'merkez' }));
            return D.bekle(AZ ? 0.01 : 0.35, s);
          });
        });
        return z;
      }).then(function () { mesgul = false; }, function () { mesgul = false; });
    }
    function smtGoster() {
      if (mesgul) return;
      mesgul = true;
      var id = ++kimlik;
      kapakAc(true).then(function () { return planGoster(true); }).then(function () {
        if (id !== kimlik) return;
        etiketTemizle(); vurguTemizle(); bilgi.kapat();
        D.vurgula(cekirdekler[0], { etiket: false });
        etiketler.push(s.etiket(cekirdekler[0], 'Ç1 · 2 iş parçacığı', { tur: 'vurgu', yer: 'merkez' }));
        mesaj('', '');
        seritSmt();
      }).then(function () { mesgul = false; }, function () { mesgul = false; });
    }
    function l3Goster() {
      if (mesgul) return;
      mesgul = true;
      var id = ++kimlik;
      kapakAc(true).then(function () { return planGoster(true); }).then(function () {
        if (id !== kimlik) return;
        etiketTemizle(); vurguTemizle(); bilgi.kapat(); serit.hidden = true;
        D.vurgula(l3, { etiket: false });
        etiketler.push(s.etiket(l3, 'L3: çekirdeklerin ortak önbelleği', { tur: 'vurgu', yer: 'merkez' }));
        mesaj('L1 ve L2 çekirdeklerin içinde; L3 hepsinin ortak alanı. Önbelleği Adım 5’te yarıştıracağız.', '');
      }).then(function () { mesgul = false; }, function () { mesgul = false; });
    }

    /* Şerit içerikleri */
    function seritBaslik(b, a) { serit.innerHTML = '<div class="ck-bas"><b></b><span></span></div>'; serit.querySelector('b').textContent = b; serit.querySelector('span').textContent = a; }
    function hucreler(ebeveyn, dizi) {
      dizi.split('').forEach(function (c, i) {
        var h = el('span', 'ck-h ' + (c === 'A' ? 'ia' : (c === 'B' ? 'ib' : 'bos')), ebeveyn, c === '.' ? '' : c);
        h.style.setProperty('--i', i);
        if (c === '.') h.setAttribute('aria-label', 'boş');
      });
    }
    function satir(etiket, dizi, not) {
      var r = el('div', 'ck-satir', serit);
      el('span', 'ck-et', r, etiket);
      hucreler(el('div', 'ck-hucreler', r), dizi);
      if (not) el('span', 'ck-not', r, not);
      return r;
    }
    var cMod = 0;
    function seritCekirdek() {
      serit.hidden = false;
      seritBaslik('Aynı işi 4 parçaya bölebilen program', 'Tek iş parçacığı: 1 çekirdek çalışır · 4 iş parçacığı: 4 çekirdek birlikte');
      var sec = el('div', 'ck-sec', serit.querySelector('.ck-bas'));
      var d1 = DERS.dugme(sec, 'Tek iş parçacığı', function () { cMod = 0; ciz(); });
      var d4 = DERS.dugme(sec, '4 iş parçacığı', function () { cMod = 1; ciz(); });
      var alan = el('div', 'ck-alan', serit);
      function ciz() {
        d1.setAttribute('aria-pressed', cMod === 0 ? 'true' : 'false'); d4.setAttribute('aria-pressed', cMod === 1 ? 'true' : 'false');
        alan.innerHTML = '';
        var hepsi = 'AAAAAAAAAAAAAAAA';
        var satirlar = cMod === 0 ? [hepsi, '', '', ''] : ['AAAA', 'AAAA', 'AAAA', 'AAAA'];
        satirlar.forEach(function (d, i) {
          var r = el('div', 'ck-satir', alan);
          el('span', 'ck-et', r, 'Ç' + (i + 1));
          var hh = el('div', 'ck-hucreler ck-16', r);
          hucreler(hh, (d + '................').slice(0, 16));
          el('span', 'ck-not', r, d ? '' : 'boşta');
        });
        var sonuc = el('div', 'ck-sonuc', alan);
        sonuc.textContent = cMod === 0 ? 'Süre: 16 birim. Diğer çekirdekler bu programa yardım edemez.' : 'Süre: ≈ 4 birim. İş bölünebildiği için çekirdekler birlikte çalışır.';
      }
      ciz();
    }
    function seritSmt() {
      serit.hidden = false;
      seritBaslik('Ç1’in yürütme birimleri, döngü döngü', 'Boş kutu: iş parçacığı bellekten veri bekliyor');
      satir('SMT kapalı', 'AA..A.AA..A.', 'A bekler, birimler boşta');
      satir('SMT açık', 'AABBABAABBAB', 'B boşlukları doldurur');
      var n = el('div', 'ck-sonuc', serit);
      n.textContent = 'Çekirdek sayısı artmaz: aynı birimler paylaşılır. Kazanç iş yüküne göre değişir, iki kat olmaz.';
    }

    var kapakDugme = s.dugme('Kapağı kaldır', null, function () { kimlik++; mesgul = false; kapakAc(!acik); }, { yer: 'alt-orta', aciklama: 'İşlemcinin metal kapağını kaldır ya da kapat' });
    s.dugme('Çekirdekler', null, cekirdekGoster, { yer: 'alt-orta', aciklama: 'Çekirdekleri ve çoklu iş parçacığını göster' });
    s.dugme('SMT', null, smtGoster, { yer: 'alt-orta', aciklama: 'Eşzamanlı çoklu iş parçacığını (SMT) göster' });
    s.dugme('L3', null, l3Goster, { yer: 'alt-orta', aciklama: 'Paylaşılan L3 önbelleği göster' });
    mesaj('Kapak kalkıyor…', '');
    setTimeout(function () { kapakAc(true); }, AZ ? 0 : 700);
  });

  /* ─────────── Adım 5: A-YARIS — önbellek isabeti ve ıskası ─────────── */
  (function () {
    var kok = document.getElementById('onbellek');
    if (!kok) return;
    // İstasyonlar: konum (%), ad, gecikme (yaklaşık, güncel masaüstü; 3. haftadaki değerlerle aynı)
    var IST = [['cek', 0, 'Çekirdek', ''], ['l1', 30, 'L1', '≈ 1 ns'], ['l2', 47, 'L2', '≈ 4 ns'], ['l3', 64, 'L3', '≈ 12 ns'], ['ram', 92, 'RAM', '≈ 80 ns']];
    var NS_MS = 40;   // 1 ns = 40 ms (yavaşlatılmış)
    kok.innerHTML = '<div class="ob-tahmin"><span>Tahmin: ıskada veri, L1 isabetine göre kaç kat geç gelir?</span><div class="secici" role="group" aria-label="Tahmin"></div></div>' +
      '<div class="ob-seritler"></div><div class="secici ob-kontrol"></div><div class="ob-kart" aria-live="polite"></div>';
    var tg = kok.querySelector('.ob-tahmin .secici'), tahmin = null, tdg = [];
    [['≈ 2 kat', 2], ['≈ 10 kat', 10], ['≈ 80 kat', 80]].forEach(function (x) {
      var b = DERS.dugme(tg, x[0], function () { tahmin = x[1]; tdg.forEach(function (y) { y.setAttribute('aria-pressed', y === b ? 'true' : 'false'); }); });
      b.setAttribute('aria-pressed', 'false'); tdg.push(b);
    });
    var seritler = kok.querySelector('.ob-seritler'), kart = kok.querySelector('.ob-kart');
    function seritKur(baslik, alt) {
      var r = el('div', 'ob-serit', seritler);
      r.innerHTML = '<div class="ob-bas"><b></b><span></span></div><div class="ob-yol"><div class="ob-hat"></div></div><div class="ob-sure"><code>0 ns</code><span></span></div>';
      r.querySelector('.ob-bas b').textContent = baslik; r.querySelector('.ob-bas span').textContent = alt;
      var yol = r.querySelector('.ob-yol'), ist = {};
      IST.forEach(function (x) {
        var d = el('div', 'ob-ist ob-' + x[0], yol);
        d.style.left = x[1] + '%';
        d.innerHTML = '<b></b><i class="ob-kopya" aria-hidden="true"></i><small></small>';
        d.querySelector('b').textContent = x[2]; d.querySelector('small').textContent = x[3];
        ist[x[0]] = d;
      });
      var jeton = el('span', 'ob-jeton', yol);
      return { r: r, ist: ist, jeton: jeton, sure: r.querySelector('.ob-sure code'), durum: r.querySelector('.ob-sure span') };
    }
    var S1 = seritKur('İstek 1', 'veri L1’de var'), S2 = seritKur('İstek 2', 'veri yalnız RAM’de');
    function kopyalar(S, liste) { IST.forEach(function (x) { S.ist[x[0]].classList.toggle('var', liste.indexOf(x[0]) >= 0); S.ist[x[0]].classList.remove('iska', 'isabet'); }); }
    // Anahtar kareler: [ns, konum %, olay]
    var ISABET = [[0, 8], [0.5, 30, 'isabet:l1'], [1, 8]];
    var ISKA = [[0, 8], [1, 30, 'iska:l1'], [4, 47, 'iska:l2'], [12, 64, 'iska:l3'], [70, 92, 'isabet:ram'], [74, 64, 'kopya:l3'], [77, 47, 'kopya:l2'], [80, 30, 'kopya:l1'], [80, 8]];
    function oynat(S, kareler, id) {
      var bitis = kareler[kareler.length - 1][0], olaylar = {};
      S.jeton.classList.add('gor');
      return new Promise(function (coz) {
        var t0 = performance.now();
        (function kare(t) {
          if (id !== kimlik) { coz(false); return; }
          var ns = AZ ? bitis : Math.min(bitis, (t - t0) / NS_MS);
          var k = 0;
          while (k < kareler.length - 1 && kareler[k + 1][0] <= ns) k++;
          var a = kareler[k], b = kareler[Math.min(k + 1, kareler.length - 1)];
          var o = b[0] > a[0] ? (ns - a[0]) / (b[0] - a[0]) : 1;
          S.jeton.style.left = (a[1] + (b[1] - a[1]) * Math.min(1, o)).toFixed(2) + '%';
          kareler.forEach(function (x, i) {
            if (x[2] && x[0] <= ns && !olaylar[i]) {
              olaylar[i] = true;
              var p = x[2].split(':');
              if (p[0] === 'kopya') S.ist[p[1]].classList.add('var');
              else S.ist[p[1]].classList.add(p[0]);
            }
          });
          S.sure.textContent = sayi(ns, ns < 10 ? 1 : 0) + ' ns';
          if (ns < bitis) requestAnimationFrame(kare); else { S.jeton.classList.remove('gor'); coz(true); }
        })(t0);
      });
    }
    var kimlik = 0, ikinci = false;
    function baslat() {
      var id = ++kimlik; ikinci = false;
      kopyalar(S1, ['l1', 'l2', 'l3', 'ram']); kopyalar(S2, ['ram']);
      S1.durum.textContent = ''; S2.durum.textContent = '';
      kart.innerHTML = '<b>Yarış sürüyor…</b><span>İstek 2’nin jetonu önbellek katlarını tek tek yokluyor.</span>';
      oynat(S1, ISABET, id).then(function (t) { if (t) S1.durum.textContent = '✓ isabet'; });
      oynat(S2, ISKA, id).then(function (t) {
        if (!t) return;
        S2.durum.textContent = '✗ ıska → RAM';
        var not = tahmin == null ? '' : (tahmin === 80 ? ' Tahminin doğru.' : ' Tahminin ≈ ' + tahmin + ' kattı.');
        kart.innerHTML = '<b></b><span></span>';
        kart.firstChild.textContent = 'Iska, isabetten yaklaşık 80 kat uzun sürdü.' + not;
        kart.lastChild.textContent = 'Veri RAM’den gelirken kopyası L3, L2 ve L1’e yazıldı (önbellek genellikle 64 baytlık satırlarla doldurulur). Şimdi aynı veriyi yeniden iste.';
      });
    }
    function yeniden() {
      var id = ++kimlik; ikinci = true;
      kopyalar(S2, ['l1', 'l2', 'l3', 'ram']);
      S2.durum.textContent = '';
      oynat(S2, ISABET, id).then(function (t) {
        if (!t) return;
        S2.durum.textContent = '✓ isabet';
        kart.innerHTML = '<b></b><span></span><label class="ob-oran"><span>İsabet oranı</span><input type="range" min="50" max="100" step="1" value="95" aria-label="İsabet oranı (yüzde)"><output></output></label>';
        kart.firstChild.textContent = 'İkinci istekte veri L1’de: 1 ns. Programlar yakın zamanda kullandığı veriyi ve komşu adresleri yeniden kullanma eğilimindedir (yerellik).';
        kart.children[1].textContent = 'Yalnız L1 ve RAM düşünülürse ortalama erişim ≈ isabet oranı × 1 ns + ıska oranı × 80 ns:';
        var r = kart.querySelector('input'), c = kart.querySelector('output');
        function hesap() { var p = +r.value / 100; c.textContent = '%' + r.value + ' → ≈ ' + sayi(p * 1 + (1 - p) * 80, 1) + ' ns'; }
        r.addEventListener('input', hesap); hesap();
      });
    }
    function sifirla() {
      kimlik++; ikinci = false;
      kopyalar(S1, ['l1', 'l2', 'l3', 'ram']); kopyalar(S2, ['ram']);
      [S1, S2].forEach(function (S) { S.jeton.style.left = '8%'; S.jeton.classList.remove('gor'); S.sure.textContent = '0 ns'; S.durum.textContent = ''; });
      kart.innerHTML = '<b>Önce tahminini seç, sonra yarışı başlat.</b><span>Dolu kare: o katta verinin bir kopyası var. Süreler yaklaşıktır (1 ns = 40 ms yavaşlatıldı).</span>';
    }
    var ctl = kok.querySelector('.ob-kontrol');
    DERS.dugme(ctl, 'Yarışı başlat', baslat);
    DERS.dugme(ctl, 'Yeniden iste', function () { if (!S2.ist.l1.classList.contains('var')) { baslat(); return; } yeniden(); });
    DERS.dugme(ctl, 'Baştan', sifirla);
    sifirla();
  })();

  /* ─────────── Adım 6: x86-64 ve ARM ─────────── */
  (function () {
    var kok = document.getElementById('mimari');
    if (!kok) return;
    kok.innerHTML = '<div class="secici mi-sekme" role="group" aria-label="Görünüm"></div><div class="mi-govde"></div>';
    var sekme = kok.querySelector('.mi-sekme'), govde = kok.querySelector('.mi-govde'), dg = [], kimlik = 0;
    function kodBlok(dosya, satirlar) {
      return '<div class="code-block mi-kod"><div class="cb-bar"><span class="code-dot cd1"></span><span class="code-dot cd2"></span><span class="code-dot cd3"></span><span class="cb-ad">' + dosya + '</span></div>' +
        '<div class="cb-govde">' + satirlar.map(function (s, i) { return '<div class="cb-satir" data-i="' + i + '"><span class="cb-no">' + (i + 1) + '</span><span class="cb-t">' + s + '</span></div>'; }).join('') + '</div></div>';
    }
    function baytlar(liste) { return '<div class="mi-bayt">' + liste.map(function (b) { return '<span class="' + b[1] + '">' + b[0] + '</span>'; }).join('') + '</div>'; }
    function ayniIs() {
      govde.innerHTML = '<div class="mi-kodlar">' +
        '<div class="mi-sutun x86"><div class="mi-bas"><b>x86-64</b><span>CISC kökenli</span></div>' +
        kodBlok('topla_x86.s', ['<span class="cm">; bellekteki sayaca 5 ekle</span>', '<span class="kw">add</span> <span class="fn">dword ptr</span> [sayac], <span class="nm">5</span>']) +
        '<div class="mi-uop"><span>içeride µop:</span><i>yükle</i><i>topla</i><i>sakla</i></div>' +
        baytlar([['83', 'k'], ['05', 'k'], ['··', 'a'], ['··', 'a'], ['··', 'a'], ['··', 'a'], ['05', 'n']]) +
        '<div class="mi-sayac"><b>1 komut</b> · 7 bayt (uzunluk 1–15 bayt arası değişir)</div></div>' +
        '<div class="mi-sutun arm"><div class="mi-bas"><b>ARM · AArch64</b><span>RISC</span></div>' +
        kodBlok('topla_arm.s', ['<span class="cm">// x0 = sayacın adresi</span>', '<span class="kw">ldr</span> w1, [x0]', '<span class="kw">add</span> w1, w1, <span class="nm">#5</span>', '<span class="kw">str</span> w1, [x0]']) +
        '<div class="mi-uop"><span>her satır:</span><i>yükle</i><i>topla</i><i>sakla</i></div>' +
        baytlar([['B9400001', 'w'], ['11001421', 'w'], ['B9000001', 'w']]) +
        '<div class="mi-sayac"><b>3 komut</b> · 3 × 4 bayt (hep sabit 4 bayt)</div></div></div>' +
        '<div class="mi-not">İki taraf da aynı işi yapar: oku, topla, yaz. Fark, işin komutlara nasıl bölündüğü ve komutların nasıl kodlandığıdır. Komut sayısı tek başına hız ölçüsü değildir.</div>' +
        '<div class="secici mi-oynat"></div>';
      DERS.dugme(govde.querySelector('.mi-oynat'), 'Oynat ▶', oynatKod);
    }
    function oynatKod() {
      var id = ++kimlik;
      var x = govde.querySelectorAll('.x86 .cb-satir'), a = govde.querySelectorAll('.arm .cb-satir');
      var ux = govde.querySelectorAll('.x86 .mi-uop i'), ua = govde.querySelectorAll('.arm .mi-uop i');
      if (!x.length) return;
      var k = 0;
      (function adim() {
        if (id !== kimlik) return;
        x.forEach(function (s, i) { s.classList.toggle('hl', i === 1 && k < 3); });
        a.forEach(function (s, i) { s.classList.toggle('hl', i === k + 1); });
        ux.forEach(function (u, i) { u.classList.toggle('aktif', i === k); u.classList.toggle('bitti', i < k); });
        ua.forEach(function (u, i) { u.classList.toggle('aktif', i === k); u.classList.toggle('bitti', i < k); });
        k++;
        if (k <= 3) setTimeout(adim, AZ ? 30 : 1100);
      })();
    }
    function ozellik() {
      var R = [
        ['Yaklaşım', 'CISC kökenli: güçlü, çok işlevli komutlar', 'RISC: basit, düzenli komutlar'],
        ['Komut uzunluğu', 'Değişken: 1–15 bayt', 'Sabit: 4 bayt'],
        ['Belleğe erişim', 'Aritmetik komut belleği doğrudan kullanabilir', 'Yalnız yükle (LDR) / sakla (STR)'],
        ['Genel amaçlı yazmaç', '16 adet (64 bit)', '31 adet (64 bit)'],
        ['Çözme', 'Değişken uzunluk çözmeyi zorlaştırır; komutlar içeride µop’lara çevrilir', 'Sabit uzunluk çözmeyi kolaylaştırır']
      ];
      govde.innerHTML = '<div class="mi-tablo" role="table" aria-label="x86-64 ve ARM karşılaştırması"><div class="mi-tr bas" role="row"><span role="columnheader"></span><span role="columnheader">x86-64</span><span role="columnheader">ARM (AArch64)</span></div>' +
        R.map(function (r) { return '<div class="mi-tr" role="row"><b role="rowheader">' + r[0] + '</b><span role="cell">' + r[1] + '</span><span role="cell">' + r[2] + '</span></div>'; }).join('') + '</div>' +
        '<div class="mi-not">Günümüzde çizgi bulanıklaştı: x86-64 çekirdekler içeride RISC benzeri µop’larla çalışır, ARM da zamanla güçlü komutlar ekledi.</div>';
      if (!AZ) govde.querySelectorAll('.mi-tr').forEach(function (r, i) { r.style.animationDelay = (i * 0.12) + 's'; r.classList.add('gir'); });
    }
    function kullanim() {
      govde.innerHTML = '<div class="mi-kullan">' +
        '<div class="mi-kk x86"><b>x86-64</b><ul><li>Masaüstü ve dizüstü bilgisayarların çoğu</li><li>Sunucuların çoğu</li><li>Uzun geçmişi olan geniş yazılım arşivi</li></ul></div>' +
        '<div class="mi-kk arm"><b>ARM</b><ul><li>Telefon ve tabletlerin neredeyse tamamı</li><li>Bazı dizüstü ve masaüstü bilgisayarlar</li><li>Giderek artan sayıda sunucu; gömülü sistemler</li></ul></div></div>' +
        '<div class="mi-uyum"><b>Uyumluluk</b><span>Program derlenirken hedef ISA seçilir. x86-64 makine kodu ARM’de doğrudan çalışmaz: ARM için derlenmiş sürüm gerekir ya da bir çeviri (öykünme) katmanı kullanılır; çeviri çoğu zaman bir miktar performans kaybettirir.</span></div>' +
        '<div class="mi-not">Enerji verimliliği yalnız ISA’ya bağlı değildir; çekirdek tasarımı ve üretim teknolojisi de belirleyicidir. Bugün iki mimaride de yüksek performanslı ve verimli işlemciler vardır.</div>';
    }
    var GOR = [['Aynı iş', ayniIs], ['Özellikler', ozellik], ['Kullanım', kullanim]];
    function sec(i) { kimlik++; dg.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); }); GOR[i][1](); }
    GOR.forEach(function (g, i) { dg.push(DERS.dugme(sekme, g[0], function () { sec(i); })); });
    sec(0);
    DERS.slaytAcilinca('s10', function () { setTimeout(function () { if (aktifMi('s10') && govde.querySelector('.mi-kodlar')) oynatKod(); }, AZ ? 0 : 700); });
  })();

  /* ─────────── Etkinlik 1: E-ADIM — getir–çöz–yürüt simülatörü ─────────── */
  (function () {
    var kok = document.getElementById('simulator');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var liste = document.querySelectorAll('#sm-gorevler li');
    var GOREV = [
      { baslik: 'Toplamı tahmin et', metin: 'Program 0A ile 0B’yi toplayıp 0C’ye yazıyor. Önce 0C’ye yazılacak sayıyı tahmin et, sonra Evre ile çalıştır.',
        prog: [[0, 'LOAD', 10], [1, 'ADD', 11], [2, 'STORE', 12], [3, 'HALT'], [10, null, 9], [11, null, 6], [12, null, 0]],
        tahmin: '0C = ?', kontrol: function (m, t) { return t === m.veri(12) ? '' : 'Sonuç ' + m.veri(12) + ', tahminin ' + t + '. Yazmaçları izleyerek nedenini bul; Baştan’a basıp yeni tahminle tekrar dene.'; } },
      { baslik: 'Veriyi değiştir', metin: '0B hücresindeki sayıyı değiştir: program bitince 0C’de 20 olsun. Sonra çalıştır.', duzenle: [11],
        prog: [[0, 'LOAD', 10], [1, 'ADD', 11], [2, 'STORE', 12], [3, 'HALT'], [10, null, 9], [11, null, 6], [12, null, 0]],
        kontrol: function (m) { return m.veri(12) === 20 ? '' : '0C = ' + m.veri(12) + ' oldu. 9 + ? = 20 olmalı; 0B’yi düzelt ve Baştan’a bas.'; } },
      { baslik: 'Komutu değiştir', metin: '01’deki ADD komutunu SUB yap (açılır listeden). 0C’ye ne yazılacağını tahmin et, sonra çalıştır.', komutSec: [1],
        prog: [[0, 'LOAD', 10], [1, 'ADD', 11], [2, 'STORE', 12], [3, 'HALT'], [10, null, 20], [11, null, 6], [12, null, 0]],
        tahmin: '0C = ?', kontrol: function (m, t, tanim) {
          if (tanim[1][1] !== 'SUB') return 'Bu görevde 01’deki komut SUB olmalı. Listeden SUB’ı seç ve Baştan’a bas.';
          return t === m.veri(12) ? '' : 'Sonuç ' + m.veri(12) + ', tahminin ' + t + '. ALU bu kez çıkarma yaptı; yeniden tahmin et.';
        } },
      { baslik: 'Döngü ve koşullu atlama', metin: 'JNZ, Z = 0 iken 01’e atlar. SUB komutu (01) toplam kaç kez yürütülür? Tahmin et, sonra Komut ile ilerle.',
        prog: [[0, 'LOAD', 10], [1, 'SUB', 11], [2, 'STORE', 10], [3, 'JNZ', 1], [4, 'HALT'], [10, null, 3], [11, null, 1]],
        tahmin: 'SUB sayısı = ?', kontrol: function (m, t) { return t === (m.sayac[1] || 0) ? '' : 'SUB ' + (m.sayac[1] || 0) + ' kez yürütüldü, tahminin ' + t + '. 0A’nın 3 → 2 → 1 → 0 değişimini izle.'; } }
    ];
    kok.innerHTML = '<div class="sm">' +
      '<div class="sm-gorev"><div class="sm-gb"><b class="sm-no"></b><span class="sm-metin"></span></div><label class="sm-tahmin"><span></span><input type="text" inputmode="numeric" maxlength="4" aria-label="Tahmin"></label></div>' +
      '<div class="sm-govde"><div class="sm-bellek" role="table" aria-label="Ana bellek"><div class="sm-bas">Ana Bellek</div><div class="sm-hucreler"></div></div>' +
      '<div class="sm-cpu"><div class="fd-ust sm-ust"></div><div class="sm-yazmaclar"></div><div class="sm-log" aria-live="polite"></div></div></div>' +
      '<div class="sm-alt"><div class="secici sm-kontrol"></div><div class="sm-geri" aria-live="polite"></div></div></div>';
    var no = kok.querySelector('.sm-no'), metin = kok.querySelector('.sm-metin'), tEt = kok.querySelector('.sm-tahmin'), tGir = tEt.querySelector('input');
    var hucreKap = kok.querySelector('.sm-hucreler'), yazKap = kok.querySelector('.sm-yazmaclar'), log = kok.querySelector('.sm-log'), geri = kok.querySelector('.sm-geri');
    var evreGoster = evreSerit(kok.querySelector('.sm-ust'));
    var YZ = [['pc', 'PC'], ['ir', 'IR'], ['mar', 'MAR'], ['mdr', 'MDR'], ['acc', 'ACC'], ['z', 'Z']], yzEl = {};
    YZ.forEach(function (y) { var d = el('div', 'sm-yz sm-' + y[0], yazKap); el('span', '', d, y[1]); yzEl[y[0]] = el('b', '', d, '—'); });
    var gi = 0, tamam = 0, tanim, m, oto = null, satirlar = [];
    function yukle(i) {
      gi = i;
      var g = GOREV[i];
      tanim = g.prog.map(function (t) { return t.slice(); });
      no.textContent = 'Görev ' + (i + 1) + ' / 4 · ' + g.baslik;
      metin.textContent = g.metin;
      tEt.hidden = !g.tahmin;
      tEt.querySelector('span').textContent = g.tahmin || '';
      tGir.value = '';
      liste.forEach(function (l, j) { l.classList.toggle('simdi', j === i && !l.classList.contains('tamam')); });
      hucreKur();
      sifirla();
    }
    function hucreKur() {
      var g = GOREV[gi];
      hucreKap.innerHTML = ''; satirlar = [];
      tanim.forEach(function (t, i) {
        var r = el('div', 'sm-hucre ' + (t[1] ? 'komut' : 'veri'), hucreKap);
        r.setAttribute('role', 'row');
        el('code', 'sm-adr', r, hx(t[0]));
        var ic = el('span', 'sm-ic', r);
        if (g.duzenle && g.duzenle.indexOf(t[0]) >= 0) {
          var inp = el('input', 'sm-duz', ic); inp.type = 'text'; inp.inputMode = 'numeric'; inp.maxLength = 3; inp.value = t[2];
          inp.setAttribute('aria-label', hx(t[0]) + ' hücresinin değeri');
          inp.addEventListener('input', function () { var v = parseInt(inp.value, 10); t[2] = isNaN(v) ? 0 : Math.max(-99, Math.min(99, v)); sifirla(true); });
        } else if (g.komutSec && g.komutSec.indexOf(t[0]) >= 0) {
          var se = el('select', 'sm-duz', ic);
          se.setAttribute('aria-label', hx(t[0]) + ' hücresindeki komut');
          ['ADD', 'SUB'].forEach(function (o) { var op = el('option', '', se, o + ' ' + hx(t[2])); op.value = o; });
          se.value = t[1];
          se.addEventListener('change', function () { t[1] = se.value; sifirla(true); });
        } else {
          ic.textContent = komutYaz(t[1] ? { op: t[1], arg: t[2] } : { v: t[2] });
        }
        el('small', 'sm-say', r, '');
        satirlar.push(r);
      });
    }
    function goster(adimlar) {
      var v = { pc: hx(m.pc), ir: komutYaz(m.ir), mar: m.mar == null ? '—' : hx(m.mar), mdr: m.mdr ? komutYaz(m.mdr) : '—', acc: String(m.acc), z: String(m.z) };
      YZ.forEach(function (y) {
        var b = yzEl[y[0]];
        if (b.textContent !== v[y[0]]) { b.textContent = v[y[0]]; b.parentNode.classList.remove('degisti'); void b.offsetWidth; b.parentNode.classList.add('degisti'); }
      });
      var okunan = {}, yazilan = {};
      (adimlar || []).forEach(function (a) { if (a && a.hucre != null) (a.bellek === 'yaz' ? yazilan : okunan)[a.hucre] = true; });
      tanim.forEach(function (t, i) {
        var r = satirlar[i], c = m.mem[t[0]];
        r.classList.toggle('pc', !m.bitti && m.pc === t[0]);
        r.classList.toggle('oku', !!okunan[t[0]]);
        r.classList.toggle('yaz', !!yazilan[t[0]]);
        if (!t[1] && !(GOREV[gi].duzenle && GOREV[gi].duzenle.indexOf(t[0]) >= 0)) r.querySelector('.sm-ic').textContent = komutYaz(c);
        var n = m.sayac[t[0]];
        r.querySelector('.sm-say').textContent = t[1] && n ? '×' + n : '';
      });
      var e = m.bitti ? 3 : m.siradakiEvre();
      evreGoster(e, m.bitti ? 'bitti' : 'Sıradaki: ' + EVRE_AD[e] + ' · ' + (m.kuyruk.length ? komutYaz(m.mem[m.planPc]) : komutYaz(m.mem[m.pc])));
    }
    function logYaz(adimlar) {
      log.innerHTML = '';
      if (!adimlar || !adimlar.length) { el('div', 'sm-log-bos', log, 'Evre ▶: bir evre · Komut ▶▶: bir komut · Sona kadar: HALT’a dek.'); return; }
      var ilk = adimlar[0];
      el('div', 'sm-log-bas', log, EVRE_AD[ilk.e] + (adimlar.length > 1 && adimlar[adimlar.length - 1].e !== ilk.e ? ' … ' + EVRE_AD[adimlar[adimlar.length - 1].e] : ''));
      adimlar.slice(-4).forEach(function (a) { var d = el('div', 'sm-log-s', log); el('code', '', d, a.rtl); el('span', '', d, a.ac); });
    }
    function durdur() { if (oto) { clearInterval(oto); oto = null; } }
    function sifirla(duzenlendi) {
      durdur();
      m = new Makine(tanim);
      geri.className = 'sm-geri'; geri.textContent = duzenlendi ? 'Program değişti; makine başa alındı.' : '';
      goster(); logYaz(null);
    }
    function hazirMi() {
      var g = GOREV[gi];
      if (g.tahmin && !/^-?\d+$/.test(tGir.value.trim())) {
        geri.className = 'sm-geri kotu'; geri.textContent = 'Önce tahminini yaz (bir tam sayı).'; tGir.focus(); return false;
      }
      tGir.disabled = true;
      return true;
    }
    function bitisKontrol() {
      if (!m.bitti) return;
      durdur();
      var g = GOREV[gi];
      tGir.disabled = false;
      if (m.hata === 'sinir') { geri.className = 'sm-geri kotu'; geri.textContent = 'Program 80 komutu aştı: döngü bitmiyor olabilir. Baştan’a bas.'; return; }
      var t = parseInt(tGir.value, 10);
      var sorun = g.kontrol(m, t, tanim);
      if (sorun) { geri.className = 'sm-geri kotu'; geri.textContent = '✗ ' + sorun; D.ses('hata'); return; }
      geri.className = 'sm-geri iyi';
      geri.innerHTML = '<span></span>';
      geri.firstChild.textContent = '✓ ' + ['0C = 15: LOAD 9, ALU 9 + 6, STORE.', '0B = 11 ile 9 + 11 = 20 oldu.', '20 − 6 = 14: aynı program, farklı işlem kodu.',
        'SUB 3 kez yürüdü: 3 → 2 → 1 → 0; Z = 1 olunca JNZ atlamadı ve HALT’a gelindi.'][gi];
      D.ses('klik');
      if (!liste[gi].classList.contains('tamam')) {
        liste[gi].classList.add('tamam'); liste[gi].classList.remove('simdi');
        tamam++; ilerle(tamam, GOREV.length);
        if (tamam === GOREV.length) DERS.konfeti();
      }
      if (gi < GOREV.length - 1) DERS.dugme(geri, 'Sonraki görev →', function () { yukle(gi + 1); }, 'dy-ileri');
      else el('span', 'sm-son', geri, ' Dört görev tamam!');
    }
    function temizle() { if (geri.classList.contains('kotu')) { geri.className = 'sm-geri'; geri.textContent = ''; } }
    function evre() { if (m.bitti) { bitisKontrol(); return; } if (!hazirMi()) return; temizle(); var l = m.evreAdim(); goster(l); logYaz(l); bitisKontrol(); }
    function komut() { if (m.bitti) { bitisKontrol(); return; } if (!hazirMi()) return; temizle(); var l = m.komutAdim(); goster(l); logYaz(l); bitisKontrol(); }
    var ctl = kok.querySelector('.sm-kontrol');
    DERS.dugme(ctl, 'Evre ▶', function () { durdur(); evre(); });
    DERS.dugme(ctl, 'Komut ▶▶', function () { durdur(); komut(); });
    DERS.dugme(ctl, 'Sona kadar', function () {
      if (oto || m.bitti) return;
      if (!hazirMi()) return;
      temizle();
      if (AZ) { while (!m.bitti) { var l = m.evreAdim(); goster(l); logYaz(l); } bitisKontrol(); return; }
      oto = setInterval(function () { var l = m.evreAdim(); goster(l); logYaz(l); if (m.bitti) bitisKontrol(); }, 380);
    });
    DERS.dugme(ctl, 'Baştan', function () { tGir.disabled = false; sifirla(); });
    tGir.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); evre(); } });
    yukle(0);
  })();

  /* ─────────── Etkinlik 2: performans kararları ─────────── */
  (function () {
    var kok = document.getElementById('kararlar');
    if (!kok) return;
    var SEN = [
      { g: '<!--@dahil:oz-3.svg-->', k: 'IPC × saat hızı',
        s: 'Tek iş parçacıklı bir işte iki çekirdek karşılaştırılıyor: A 5,0 GHz ve IPC 1,2; B 4,0 GHz ve IPC 2,0. Hangisi daha hızlı?',
        se: ['A: saat hızı daha yüksek', 'B: saniyede daha çok komut bitirir', 'Eşit: ikisi de 4 GHz’in üstünde'], dg: 1,
        ac: 'A: 5,0 × 1,2 = 6 milyar komut/sn; B: 4,0 × 2,0 = 8 milyar komut/sn. B yaklaşık %33 daha hızlı.' },
      { g: '<!--@dahil:oz-4.svg-->', k: 'Çekirdek sayısı',
        s: 'Mert’in tablo programındaki makro tek iş parçacığıyla çalışıyor ve 10 sn sürüyor. Aynı çekirdek tasarımına sahip 4 çekirdekliden 8 çekirdekliye geçerse süre ne olur?',
        se: ['Yaklaşık 10 sn kalır', 'Yaklaşık 5 sn olur', 'Yaklaşık 2,5 sn olur'], dg: 0,
        ac: 'Tek iş parçacığı tek çekirdekte yürür; ek çekirdekler bu işe yardım edemez. Çekirdek başına performans aynıysa süre de aynı kalır.' },
      { g: '<!--@dahil:oz-4.svg-->', k: 'SMT',
        s: 'Paralel bir işte 4 çekirdek / 8 iş parçacıklı bir işlemci, SMT’si olmayan 4 çekirdek / 4 iş parçacıklı eşine göre nasıl sonuç verir?',
        se: ['Tam iki kat hızlı olur', 'Daha yavaş olur; iş parçacıkları çakışır', 'Genellikle biraz daha hızlıdır; kazanç iş yüküne bağlıdır'], dg: 2,
        ac: 'SMT, bir iş parçacığı beklerken boşta kalan birimleri diğerine verir. Ek çekirdek yoktur; kazanç iş yüküne göre değişir ve iki kat olmaz.' },
      { g: '<!--@dahil:oz-5.svg-->', k: 'Önbellek',
        s: 'Program P, 1 MB’lık bir diziyi tekrar tekrar sırayla okuyor. Program R, 8 GB’lık veride rastgele adreslere atlıyor. Hangisi daha çok önbellek ıskası yaşar?',
        se: ['P: sürekli aynı diziyi okuduğu için', 'R: veri önbelleğe sığmaz ve erişim dağınıktır', 'İkisi aynı: önbellek boyutu fark etmez'], dg: 1,
        ac: '1 MB’lık dizi L2/L3’e sığar; sırayla okununca komşu veriler aynı satırla gelir. 8 GB önbelleğe sığmaz ve rastgele erişim yerelliği bozar: istekler çoğunlukla RAM’e gider.' },
      { g: '<!--@dahil:oz-6.svg-->', k: 'Komut kümesi',
        s: 'Bir ekip uygulamasını hem masaüstü bilgisayarlar (x86-64) hem de telefonlar (ARM) için yayımlayacak. Ne yapmaları gerekir?',
        se: ['Her mimari için ayrı derleme yapmak (ya da çeviri katmanına güvenmek)', 'Tek bir x86-64 dosyası yeterli; her yerde çalışır', 'Yalnız saat hızına göre ayar yapmak'], dg: 0,
        ac: 'Makine kodu ISA’ya özeldir. Kaynak kod ortak olabilir ama x86-64 ve ARM için ayrı derlenir.' }
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var i = 0, puan = 0;
    kok.innerHTML = '<div class="pk"></div>';
    var pk = kok.querySelector('.pk');
    function goster() {
      pk.innerHTML = '';
      if (i >= SEN.length) {
        var son = el('div', 'pk-son', pk);
        son.innerHTML = '<b></b><span></span>';
        son.firstChild.textContent = puan + ' / ' + SEN.length;
        son.lastChild.textContent = puan >= 4 ? 'Performansı tek bir sayıya bağlamadan yorumlayabiliyorsun.' : 'İpucu: önce işin türünü, sonra IPC × saat hızını ve verinin önbelleğe sığıp sığmadığını düşün.';
        DERS.dugme(son, 'Yeniden oyna', function () { i = 0; puan = 0; ilerle(0, SEN.length); goster(); }, 'dy-ileri');
        if (puan >= 4) DERS.konfeti();
        return;
      }
      var t = SEN[i];
      var kart = el('div', 'pk-kart', pk);
      kart.innerHTML = '<div class="pk-ust"><div class="pk-resim">' + t.g + '</div><div><small></small><b></b></div></div>';
      kart.querySelector('small').textContent = 'Senaryo ' + (i + 1) + ' / ' + SEN.length + ' · ' + t.k;
      kart.querySelector('b').textContent = t.s;
      var sec = el('div', 'pk-secenek', pk);
      var geri = el('div', 'pk-geri', pk);
      geri.setAttribute('aria-live', 'polite');
      t.se.forEach(function (x, j) {
        var b = DERS.dugme(sec, '', function () {
          sec.querySelectorAll('button').forEach(function (y) { y.disabled = true; });
          var ok = j === t.dg;
          b.classList.add(ok ? 'iyi' : 'kotu');
          if (!ok) sec.children[t.dg].classList.add('iyi');
          if (ok) { puan++; D.ses('klik'); } else D.ses('hata');
          geri.className = 'pk-geri ' + (ok ? 'iyi' : 'kotu');
          geri.innerHTML = '<span></span>';
          geri.firstChild.textContent = (ok ? '✓ Doğru. ' : '✗ Değil. ') + t.ac;
          i++; ilerle(i, SEN.length);
          DERS.dugme(geri, i < SEN.length ? 'Sonraki →' : 'Sonucu gör →', goster, 'dy-ileri');
        }, 'pk-sec');
        b.innerHTML = '<span class="pk-harf">' + 'ABC'.charAt(j) + '</span><span></span>';
        b.lastChild.textContent = x;
      });
    }
    goster();
  })();
})();
