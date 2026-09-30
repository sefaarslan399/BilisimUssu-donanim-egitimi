/* DON-301 H01 — Bilgisayar Mimarisine Giriş · ders betiği (ortak betikten sonra çalışır) */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  DERS.tahminKur('Tahminini aldık. Adım 6’da hesapla kontrol edeceğiz.');
  function el(etiket, sinif, ebeveyn, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function bekle(sn) { return new Promise(function (r) { setTimeout(r, AZ ? 10 : sn * 1000); }); }
  function sayi(n, basamak) {
    var s = (basamak == null ? Math.round(n) : n.toFixed(basamak)).toString();
    var p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return p.join(',');
  }

  /* ─────────── Adım 1: sistem katmanları ─────────── */
  (function () {
    var kok = document.getElementById('katmanlar');
    if (!kok) return;
    var K = [
      { ad: 'Kullanıcı', renk: '#6366f1', ac: 'İstekte bulunur, sonucu kullanır. Sistemin amacı onun işini görmektir.' },
      { ad: 'Uygulama yazılımı', renk: '#8b5cf6', ac: 'Tarayıcı, kelime işlemci, oyun: kullanıcının işini yapar.' },
      { ad: 'İşletim sistemi', renk: '#0ea5e9', ac: 'Donanımı yönetir; uygulamalara bellek, işlemci zamanı ve dosya hizmeti verir.' },
      { ad: 'Donanım', renk: '#f59e0b', ac: 'CPU, bellek, depolama, G/Ç birimleri. Mimari bu katmanın düzenidir.' }
    ];
    var yigin = el('div', 'kt-yigin', kok), bilgi = el('div', 'kt-bilgi', kok);
    bilgi.setAttribute('aria-live', 'polite');
    var veri = el('div', 'kt-veri', kok);
    veri.innerHTML = '<span class="kt-nokta"></span><span>Veri: tüm katmanlar arasında akar</span>';
    var dugmeler = K.map(function (k, i) {
      var b = el('button', 'kt-katman', yigin);
      b.type = 'button';
      b.style.setProperty('--r', k.renk);
      b.style.setProperty('--i', i);
      b.innerHTML = '<b></b><span></span>';
      b.firstChild.textContent = k.ad;
      b.lastChild.textContent = ['en üst', '', '', 'en alt'][i];
      b.addEventListener('click', function () { sec(i); });
      return b;
    });
    function sec(i) {
      dugmeler.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      bilgi.innerHTML = '<b></b><span></span>';
      bilgi.firstChild.textContent = K[i].ad;
      bilgi.lastChild.textContent = K[i].ac;
      bilgi.style.borderColor = K[i].renk;
    }
    sec(3);
    DERS.slaytAcilinca('s5', function () {
      if (AZ) return;
      var i = 0;
      (function dongu() { if (i < 4) { sec(i++); setTimeout(dongu, 1300); } else sec(3); })();
    });
  })();

  /* ─────────── Adım 2: Von Neumann blokları ─────────── */
  var BLOK = {
    cpu: ['CPU', 'Komutları getirir, çözer, yürütür. Kontrol birimi + ALU + yazmaçlar.', ['adres', 'veri', 'kontrol']],
    kontrol: ['Kontrol Birimi', 'Komutu çözer, hangi birimin ne yapacağını kontrol yolu ile bildirir.', ['kontrol']],
    alu: ['ALU', 'Aritmetik (toplama, çıkarma) ve mantık (karşılaştırma) işlemlerini yapar.', []],
    yazmac: ['Yazmaçlar', 'CPU içindeki çok hızlı hücreler. PC: sıradaki komutun adresi, IR: o anki komut, ACC: ara sonuç.', []],
    bellek: ['Ana Bellek', 'Komutlar ve veriler numaralı hücrelerde birlikte durur (depolanmış program).', ['adres', 'veri', 'kontrol']],
    gc: ['G/Ç Birimleri', 'Klavye, ekran, disk gibi birimler; aynı yollar üzerinden CPU ile haberleşir.', ['adres', 'veri', 'kontrol']]
  };
  (function () {
    var kok = document.getElementById('von-neumann');
    if (!kok) return;
    kok.innerHTML = '<div class="illu-orta vn-sahne"><!--@dahil:vn.svg--></div><div class="vn-kart" aria-live="polite"></div>';
    var svg = kok.querySelector('svg'), kart = kok.querySelector('.vn-kart');
    function sec(ad) {
      svg.querySelectorAll('.vn-blok').forEach(function (b) { b.classList.toggle('secili', b.dataset.blok === ad); });
      svg.querySelectorAll('.vn-yol').forEach(function (y) { y.classList.toggle('soluk', BLOK[ad][2].indexOf(y.dataset.yol) < 0); });
      kart.innerHTML = '<b></b><span></span>';
      kart.firstChild.textContent = BLOK[ad][0];
      kart.lastChild.textContent = BLOK[ad][1];
    }
    svg.querySelectorAll('.vn-blok').forEach(function (b) {
      b.setAttribute('tabindex', '0'); b.setAttribute('role', 'button');
      b.addEventListener('click', function (e) { e.stopPropagation(); sec(b.dataset.blok); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sec(b.dataset.blok); } });
    });
    sec('cpu');
    DERS.slaytAcilinca('s6', function () {
      if (AZ) return;
      var sira = ['kontrol', 'alu', 'yazmac', 'bellek', 'gc', 'cpu'], i = 0;
      (function dongu() { if (i < sira.length) { sec(sira[i++]); setTimeout(dongu, 1500); } })();
    });
  })();

  /* ─────────── Adım 3: depolanmış program — bellek tablosu ─────────── */
  (function () {
    var kok = document.getElementById('bellek-tablo');
    if (!kok) return;
    var HUCRE = [
      ['00', 'LOAD 0C', 'k', 'ACC ← bellek[0C]'], ['01', 'ADD 0D', 'k', 'ACC ← ACC + bellek[0D]'], ['02', 'STORE 0E', 'k', 'bellek[0E] ← ACC'], ['03', 'HALT', 'k', 'Programı durdur'],
      ['0C', '7', 'v', 'veri'], ['0D', '5', 'v', 'veri'], ['0E', '0', 'v', 'sonuç buraya'], ['0F', '0', 'v', 'boş']
    ];
    kok.innerHTML = '<div class="bt-duzen"><div class="bt-bellek"><div class="bt-bas">Ana Bellek</div></div><div class="bt-cpu"><div class="bt-bas">CPU</div>' +
      '<div class="bt-yaz"><span>PC</span><b class="bt-pc">00</b></div><div class="bt-yaz"><span>IR</span><b class="bt-ir">—</b></div><div class="bt-yaz"><span>ACC</span><b class="bt-acc">0</b></div>' +
      '<div class="bt-evre" aria-live="polite">Hazır</div></div></div><div class="secici bt-kontrol"></div>';
    var bel = kok.querySelector('.bt-bellek');
    var satir = HUCRE.map(function (h) {
      var r = el('div', 'bt-hucre ' + (h[2] === 'k' ? 'komut' : 'veri'), bel);
      r.innerHTML = '<code></code><span></span><small></small>';
      r.children[0].textContent = h[0]; r.children[1].textContent = h[1]; r.children[2].textContent = h[2] === 'k' ? 'komut' : 'veri';
      return r;
    });
    var pcE = kok.querySelector('.bt-pc'), irE = kok.querySelector('.bt-ir'), accE = kok.querySelector('.bt-acc'), evre = kok.querySelector('.bt-evre');
    var pc = 0, acc = 0, mem = { '0C': 7, '0D': 5, '0E': 0 }, faz = 0, bitti = false;
    function isaretle(i, sinif) { satir.forEach(function (r) { r.classList.remove('getir', 'oku', 'yaz'); }); if (i >= 0) satir[i].classList.add(sinif); }
    function adr(a) { return HUCRE.findIndex(function (h) { return h[0] === a; }); }
    function adim() {
      if (bitti) return;
      var h = HUCRE[pc];
      if (faz === 0) { isaretle(pc, 'getir'); irE.textContent = h[1]; evre.textContent = 'GETİR: bellek[' + h[0] + '] → IR (bu bir komut)'; faz = 1; return; }
      var p = h[1].split(' '), a = p[1];
      if (p[0] === 'LOAD') { acc = mem[a]; isaretle(adr(a), 'oku'); evre.textContent = 'ÇÖZ + YÜRÜT: bellek[' + a + '] okunur (bu bir veri) → ACC = ' + acc; }
      else if (p[0] === 'ADD') { acc += mem[a]; isaretle(adr(a), 'oku'); evre.textContent = 'ÇÖZ + YÜRÜT: ALU toplar → ACC = ' + acc; }
      else if (p[0] === 'STORE') { mem[a] = acc; satir[adr(a)].children[1].textContent = String(acc); isaretle(adr(a), 'yaz'); evre.textContent = 'ÇÖZ + YÜRÜT: ACC belleğe yazılır → bellek[' + a + '] = ' + acc; }
      else { isaretle(-1); evre.textContent = 'HALT: program bitti. Komut ve veri aynı bellekteydi.'; bitti = true; }
      accE.textContent = acc;
      pc++; pcE.textContent = ('0' + pc).slice(-2); faz = 0;
    }
    function sifirla() {
      pc = 0; acc = 0; faz = 0; bitti = false; mem = { '0C': 7, '0D': 5, '0E': 0 };
      satir[6].children[1].textContent = '0';
      pcE.textContent = '00'; irE.textContent = '—'; accE.textContent = '0'; evre.textContent = 'Hazır'; isaretle(-1);
    }
    var oto = null;
    var ctl = kok.querySelector('.bt-kontrol');
    DERS.dugme(ctl, 'Adım ▶', function () { if (oto) { clearInterval(oto); oto = null; } adim(); });
    DERS.dugme(ctl, 'Oynat', function () {
      if (oto) return; sifirla();
      oto = setInterval(function () { adim(); if (bitti) { clearInterval(oto); oto = null; } }, AZ ? 50 : 1100);
    });
    DERS.dugme(ctl, 'Baştan', function () { if (oto) { clearInterval(oto); oto = null; } sifirla(); });
  })();

  /* ─────────── Adım 4: yollar — OKU / YAZ (A-AKIS 2D) ─────────── */
  (function () {
    var kok = document.getElementById('yollar');
    if (!kok) return;
    kok.innerHTML = '<div class="illu-orta vn-sahne"><!--@dahil:vn.svg--></div><div class="secici yol-kontrol"></div><div class="vn-kart yol-adim" aria-live="polite"></div>';
    var svg = kok.querySelector('svg'), metin = kok.querySelector('.yol-adim'), rozet = svg.querySelector('.vn-rozet-metin');
    svg.querySelector('.vn-deger').textContent = '7';
    var calisiyor = false;
    function akit(yol, yon) {
      svg.querySelectorAll('.vn-yol').forEach(function (y) {
        var aktif = y.dataset.yol === yol;
        y.classList.toggle('soluk', yol && !aktif);
        var a = y.querySelector('.vn-akis');
        a.setAttribute('class', 'vn-akis' + (aktif ? (yon === 'ters' ? ' akiyor ters' : ' akiyor') : ''));
      });
    }
    function hucre(on) { svg.querySelector('.vn-hucre.h0').classList.toggle('vurgu', on); }
    function oynat(islem) {
      if (calisiyor) return; calisiyor = true;
      var oku = islem === 'oku';
      var adimlar = [
        ['adres', 'ileri', '1 · Adres yolu: CPU, 0C adresini belleğe gönderir (tek yön).', 'ADRES 0x0C'],
        ['kontrol', 'ileri', '2 · Kontrol yolu: ' + (oku ? 'OKU' : 'YAZ') + ' sinyali gider.', oku ? 'OKU' : 'YAZ'],
        ['veri', oku ? 'ters' : 'ileri', oku ? '3 · Veri yolu: 0C hücresindeki 7 değeri CPU’ya gelir.' : '3 · Veri yolu: CPU’daki 12 değeri 0C hücresine yazılır.', oku ? 'VERİ 7 →CPU' : 'VERİ 12 →RAM']
      ];
      var z = Promise.resolve();
      adimlar.forEach(function (a, i) {
        z = z.then(function () {
          akit(a[0], a[1]); metin.textContent = a[2]; rozet.textContent = a[3]; svg.classList.add('rozetli'); hucre(true);
          if (i === 2 && !oku) svg.querySelector('.vn-deger').textContent = '12';
          return bekle(2.2);
        });
      });
      z.then(function () {
        akit(null); hucre(false); rozet.textContent = ''; svg.classList.remove('rozetli');
        metin.textContent = oku ? 'Okuma bitti: adres → kontrol (OKU) → veri belleğe değil, CPU’ya aktı.' : 'Yazma bitti: veri bu kez CPU’dan belleğe aktı.';
        calisiyor = false;
      });
    }
    var ctl = kok.querySelector('.yol-kontrol');
    DERS.dugme(ctl, 'OKU işlemi', function () { svg.querySelector('.vn-deger').textContent = '7'; oynat('oku'); });
    DERS.dugme(ctl, 'YAZ işlemi', function () { oynat('yaz'); });
    metin.textContent = 'Bir işlem seç: yolların hangi sırayla ve hangi yönde çalıştığını izle.';
    DERS.slaytAcilinca('s8', function () { setTimeout(function () { oynat('oku'); }, AZ ? 0 : 600); });
  })();

  /* ─────────── Adım 5: önekler ─────────── */
  (function () {
    var kok = document.getElementById('onekler');
    if (!kok) return;
    var ON = [['K', 'kilo', 'kibi', 1], ['M', 'mega', 'mebi', 2], ['G', 'giga', 'gibi', 3], ['T', 'tera', 'tebi', 4]];
    kok.innerHTML = '<div class="secici on-sec" role="group" aria-label="Önek"></div><div class="on-kart"></div>';
    var sec = kok.querySelector('.on-sec'), kart = kok.querySelector('.on-kart'), dg = [];
    function goster(i) {
      dg.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      var o = ON[i], on = Math.pow(1000, o[3]), ik = Math.pow(1024, o[3]), fark = (ik / on - 1) * 100;
      kart.innerHTML =
        '<div class="on-satir"><div class="on-ad"><b>1 ' + o[0] + 'B</b><span>' + o[1] + 'bayt · SI</span></div><div class="on-bar"><i style="width:' + (100 / (1 + fark / 100)).toFixed(1) + '%"></i></div>' +
        '<code>10<sup>' + (3 * o[3]) + '</sup> = ' + sayi(on) + ' B</code></div>' +
        '<div class="on-satir iec"><div class="on-ad"><b>1 ' + o[0] + 'iB</b><span>' + o[2] + 'bayt · IEC</span></div><div class="on-bar"><i style="width:100%"></i></div>' +
        '<code>2<sup>' + (10 * o[3]) + '</sup> = ' + sayi(ik) + ' B</code></div>' +
        '<div class="on-fark">İkili değer <b>%' + sayi(fark, 1) + '</b> daha büyük</div>';
    }
    ON.forEach(function (o, i) { dg.push(DERS.dugme(sec, o[0] + 'B / ' + o[0] + 'iB', function () { goster(i); })); });
    goster(0);
    DERS.slaytAcilinca('s9', function () {
      if (AZ) return;
      var i = 0;
      (function dongu() { if (i < 4) { goster(i++); setTimeout(dongu, 1500); } })();
    });
  })();

  /* ─────────── Adım 6: kayıp 69 GB (A-HESAP) ─────────── */
  (function () {
    var kok = document.getElementById('hesap');
    if (!kok) return;
    var ADIM = [
      ['Üretici', '1 TB = 10¹² B', '1 000 000 000 000 B'],
      ['÷ 1024', 'KiB', '976 562 500 KiB'],
      ['÷ 1024', 'MiB', '953 674,3 MiB'],
      ['÷ 1024', 'GiB', '931,3 GiB'],
      ['Fark', '1000 − 931,3', '≈ 68,7 → “kayıp” 69 GB']
    ];
    kok.innerHTML = '<div class="hs-liste"></div><div class="secici hs-kontrol"></div><div class="panel-sonuc hs-sonuc" aria-live="polite"></div>';
    var liste = kok.querySelector('.hs-liste'), sonuc = kok.querySelector('.hs-sonuc'), n = 0;
    var satirlar = ADIM.map(function (a, i) {
      var r = el('div', 'hs-satir' + (i === ADIM.length - 1 ? ' son' : ''), liste);
      r.innerHTML = '<span class="hs-op"></span><span class="hs-ac"></span><code class="hs-deger"></code>';
      r.children[0].textContent = a[0]; r.children[1].textContent = a[1]; r.children[2].textContent = a[2];
      return r;
    });
    function goster() {
      satirlar.forEach(function (r, i) { r.classList.toggle('gor', i < n); r.classList.toggle('simdi', i === n - 1); });
      if (n === ADIM.length) sonuc.textContent = DERS.tahminNotu(2, 'Kayıp yok: aynı bayt sayısı iki farklı birimle okunuyor.', 'Aslında kayıp yok: aynı bayt sayısı iki farklı birimle okunuyor.');
      else sonuc.textContent = n === 0 ? 'Sonraki adıma bas.' : '';
    }
    var ctl = kok.querySelector('.hs-kontrol');
    DERS.dugme(ctl, 'Sonraki adım ▶', function () { if (n < ADIM.length) { n++; goster(); } });
    DERS.dugme(ctl, 'Baştan', function () { n = 0; goster(); });
    goster();
    DERS.slaytAcilinca('s10', function () {
      if (AZ || n) return;
      (function dongu() { if (n < ADIM.length) { n++; goster(); setTimeout(dongu, 1200); } })();
    });
  })();

  /* ─────────── Etkinlik 1: E-HESAP kapasite dönüştürücü + görevler ─────────── */
  (function () {
    var kok = document.getElementById('donusturucu');
    if (!kok) return;
    var BIRIM = { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: Math.pow(1024, 2), GiB: Math.pow(1024, 3), TiB: Math.pow(1024, 4) };
    var GOREV = [['500 GB disk', 500e9], ['256 GB SSD', 256e9], ['2 TB disk', 2e12], ['64 GB USB bellek', 64e9]];
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    kok.innerHTML = '<div class="dn"><div class="dn-giris"><input type="number" min="0" step="any" value="1" aria-label="Değer"><select aria-label="Birim"></select></div>' +
      '<div class="dn-tablo"></div><div class="dn-gorevler"></div></div>';
    var giris = kok.querySelector('input'), birim = kok.querySelector('select'), tablo = kok.querySelector('.dn-tablo'), gv = kok.querySelector('.dn-gorevler');
    Object.keys(BIRIM).forEach(function (b) { var o = el('option', '', birim, b); o.value = b; });
    birim.value = 'TB';
    function hesapla() {
      var bayt = (parseFloat(String(giris.value).replace(',', '.')) || 0) * BIRIM[birim.value];
      tablo.innerHTML = '';
      [['B', 'bayt'], ['GB', 'ondalık'], ['GiB', 'ikili'], ['TB', 'ondalık'], ['TiB', 'ikili']].forEach(function (x) {
        var d = el('div', 'dn-hucre ' + (x[0].indexOf('i') > 0 ? 'iec' : ''), tablo);
        var v = bayt / BIRIM[x[0]];
        el('code', '', d, v >= 1e6 && x[0] === 'B' ? sayi(v) : sayi(v, v < 10 ? 3 : 1));
        el('span', '', d, x[0] + ' · ' + x[1]);
      });
    }
    giris.addEventListener('input', hesapla); birim.addEventListener('change', hesapla);
    hesapla();
    var dogru = 0;
    GOREV.forEach(function (g) {
      var hedef = g[1] / BIRIM.GiB;
      var r = el('div', 'dn-gorev', gv);
      el('span', 'dn-ad', r, g[0] + ' →');
      var inp = el('input', '', r); inp.type = 'text'; inp.inputMode = 'decimal'; inp.setAttribute('aria-label', g[0] + ' kaç GiB'); inp.placeholder = '? GiB';
      var d = el('button', 'dn-kontrol', r, 'Kontrol'); d.type = 'button';
      var s = el('span', 'dn-sonuc', r);
      d.addEventListener('click', function () {
        var v = parseFloat(inp.value.replace(/\s/g, '').replace(',', '.'));
        if (Math.abs(v - hedef) <= 0.15 && !r.classList.contains('tamam')) {
          r.classList.add('tamam'); r.classList.remove('yanlis'); s.textContent = '✓ ' + sayi(hedef, 1) + ' GiB'; inp.disabled = true; d.disabled = true;
          ilerle(++dogru, GOREV.length); if (dogru === GOREV.length) DERS.konfeti();
        } else if (!r.classList.contains('tamam')) {
          r.classList.add('yanlis'); s.textContent = '✗ Tekrar dene: bayta çevir, 2³⁰’a böl.';
        }
      });
    });
  })();

  /* ─────────── Etkinlik 2: hangisi daha büyük? ─────────── */
  (function () {
    var kok = document.getElementById('karsilastir');
    if (!kok) return;
    var TUR = [
      ['1 GB', '1 GiB', 'sag', '1 GiB = 1 073 741 824 B; 1 GB = 1 000 000 000 B.'],
      ['1024 KiB', '1 MiB', 'esit', '1 MiB tam olarak 1024 KiB’tır.'],
      ['1 GiB', '1000 MB', 'sol', '1 GiB ≈ 1073,7 MB eder; 1000 MB’tan büyüktür.'],
      ['500 GB', '466 GiB', 'sag', '466 GiB ≈ 500,4 GB; çok az farkla daha büyük.'],
      ['1000 GiB', '1 TB', 'sol', '1000 GiB ≈ 1,074 TB eder.'],
      ['2048 MiB', '2 GiB', 'esit', '2 GiB = 2 × 1024 MiB = 2048 MiB.']
    ];
    var bar = document.getElementById('ilerleme-2');
    var i = 0, puan = 0;
    kok.innerHTML = '<div class="kr"><div class="kr-kartlar"></div><div class="kr-geri" aria-live="polite"></div></div>';
    var kartlar = kok.querySelector('.kr-kartlar'), geri = kok.querySelector('.kr-geri');
    function ilerle() {
      bar.querySelector('.etk-ilerleme-sayi b').textContent = i;
      bar.querySelector('.etk-ilerleme-bar span').style.width = Math.round(i / TUR.length * 100) + '%';
    }
    function goster() {
      kartlar.innerHTML = ''; geri.innerHTML = ''; geri.className = 'kr-geri';
      if (i >= TUR.length) {
        bar.classList.add('etk-ilerleme--bitti');
        geri.className = 'kr-geri son';
        geri.innerHTML = '<b>' + puan + ' / ' + TUR.length + '</b><span>' + (puan >= 5 ? 'Birim dönüşümlerinde ustasın.' : 'İpucu: önce ikisini de bayta çevir.') + '</span>';
        DERS.dugme(geri, 'Yeniden oyna', function () { i = 0; puan = 0; bar.classList.remove('etk-ilerleme--bitti'); ilerle(); goster(); }, 'dy-ileri');
        if (puan >= 5) DERS.konfeti();
        return;
      }
      var t = TUR[i];
      [[t[0], 'sol'], ['Eşit', 'esit'], [t[1], 'sag']].forEach(function (x) {
        var b = DERS.dugme(kartlar, x[0], function () { cevap(x[1], b); }, 'kr-kart' + (x[1] === 'esit' ? ' esit' : ''));
      });
    }
    function cevap(sec, b) {
      var t = TUR[i], dogruMu = sec === t[2];
      kartlar.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
      b.classList.add(dogruMu ? 'iyi' : 'kotu');
      if (dogruMu) { puan++; D.ses('klik'); } else D.ses('hata');
      geri.className = 'kr-geri ' + (dogruMu ? 'iyi' : 'kotu');
      geri.innerHTML = '<span></span>';
      geri.firstChild.textContent = (dogruMu ? '✓ Doğru. ' : '✗ Değil. ') + t[3];
      i++; ilerle();
      DERS.dugme(geri, i < TUR.length ? 'Sonraki tur →' : 'Sonucu gör →', goster, 'dy-ileri');
    }
    goster();
  })();
})();
