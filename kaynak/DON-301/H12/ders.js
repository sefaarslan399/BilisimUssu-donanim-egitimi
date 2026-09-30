/* DON-301 H12 — İşletim Sistemi Kurulumu · ders betiği (ortak betikten sonra çalışır)
   Provalar (Adım 1–6) marka-nötr 2D ekran simülasyonlarıdır; E-KURULUM ve Kurulum Kararları etkinlikleri burada yazılır. */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  DERS.tahminKur('Tahminini aldık. Adım 2’deki karşılaştırmada göreceğiz.');

  function el(etiket, sinif, ebeveyn, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function ses(ad) { try { D.ses(ad); } catch (e) { /* ses yoksa sessiz */ } }
  /* Sayı sayacı: el içindeki metni/genişliği zamanla ilerletir; el._sy artınca durur */
  function sayac(hedef, bas, son, ms, yaz, bitince) {
    hedef._sy = (hedef._sy || 0) + 1;
    var id = hedef._sy, t0 = null;
    if (AZ || ms <= 0) { yaz(son); if (bitince) bitince(); return; }
    function kare(t) {
      if (hedef._sy !== id) return;
      if (t0 == null) t0 = t;
      var k = Math.min(1, (t - t0) / ms);
      yaz(bas + (son - bas) * k);
      if (k < 1) requestAnimationFrame(kare); else if (bitince) bitince();
    }
    requestAnimationFrame(kare);
  }
  function durdur(hedef) { hedef._sy = (hedef._sy || 0) + 1; }
  function ekranKur(ebeveyn, baslik) {
    var ek = el('div', 'ek', ebeveyn);
    var bas = el('div', 'ek-bas', ek);
    el('span', 'ek-nokta', bas); el('span', 'ek-nokta', bas);
    var b = el('span', 'ek-baslik', bas, baslik);
    var govde = el('div', 'ek-govde', ek);
    return { ek: ek, baslik: b, govde: govde };
  }
  function pencere(ekran, sinif) {
    var p = el('div', 'pv-pencere' + (sinif ? ' ' + sinif : ''), ekran);
    p.hidden = true;
    p.setAttribute('role', 'dialog');
    return p;
  }

  /* ─────────── Prova oynatıcı: Oynat / Adım ▶ / Baştan + alt yazı ─────────── */
  function prova(id, baslik, kur) {
    var kok = document.getElementById(id);
    if (!kok) return;
    var e = ekranKur(kok, baslik);
    var alt = el('div', 'pv-alt', kok);
    var yazi = el('div', 'pv-yazi', alt);
    yazi.setAttribute('aria-live', 'polite');
    var ctl = el('div', 'secici pv-kontrol', alt);
    var api = kur(e.govde, e.ek, e.baslik);
    var n = 0, surum = 0;
    function goster(i) {
      yazi.innerHTML = '<b></b><span></span>';
      yazi.firstChild.textContent = (i + 1) + '/' + api.adimlar.length;
      yazi.lastChild.textContent = api.adimlar[i].yazi;
    }
    function ileri() {
      if (n >= api.adimlar.length) return false;
      goster(n); api.adimlar[n].fn(); n++;
      if (n === api.adimlar.length && api.son) api.son(yazi);
      return true;
    }
    function sifirla() { surum++; n = 0; api.sifirla(); yazi.textContent = 'Oynat’a bas ya da adım adım ilerle.'; }
    function oynat() {
      sifirla();
      var s = surum;
      (function dongu() {
        if (s !== surum) return;
        if (ileri()) setTimeout(dongu, AZ ? 20 : (api.adimlar[n - 1].sure || 2.4) * 1000);
      })();
    }
    DERS.dugme(ctl, 'Oynat', oynat);
    DERS.dugme(ctl, 'Adım ▶', function () { surum++; if (n >= api.adimlar.length) { sifirla(); } ileri(); });
    DERS.dugme(ctl, 'Baştan', sifirla);
    sifirla();
    var slayt = kok.closest('.slide');
    DERS.slaytAcilinca(slayt.id, function () {
      if (AZ) { sifirla(); while (ileri()) { /* son duruma */ } } else setTimeout(oynat, 400);
    });
  }

  /* ─────────── Adım 1: önyüklenebilir USB ─────────── */
  prova('pv-usb', 'USB hazırlama aracı', function (g, ek) {
    g.innerHTML =
      '<div class="usb-duzen"><div class="pv-form">' +
      [['aygit', 'Aygıt'], ['iso', 'Kalıp dosyası (ISO)'], ['sema', 'Bölüm şeması'], ['hedef', 'Hedef sistem']].map(function (r) {
        return '<div class="pv-satir" data-k="' + r[0] + '"><span>' + r[1] + '</span><b>—</b></div>';
      }).join('') +
      '</div><div class="usb-gorsel"><svg viewBox="0 0 220 70" role="img" aria-label="ISO kalıp dosyası USB belleğe yazılıyor">' +
      '<circle cx="30" cy="32" r="22" fill="#fff" stroke="#8b5cf6" stroke-width="3"/><circle cx="30" cy="32" r="5" fill="#8b5cf6"/>' +
      '<text x="30" y="66" font-size="10" font-weight="800" fill="#4c1d95" text-anchor="middle" font-family="Inter,Arial,sans-serif">ISO</text>' +
      '<path class="usb-ok" d="M62 32h40" stroke="#94a3b8" stroke-width="3" stroke-dasharray="6 5"/><path d="M98 25l8 7-8 7" fill="none" stroke="#94a3b8" stroke-width="3"/>' +
      '<rect x="116" y="22" width="18" height="20" rx="2" fill="#cbd5e1"/><rect x="132" y="12" width="80" height="40" rx="8" fill="#334155"/>' +
      '<rect x="142" y="24" width="60" height="16" rx="4" fill="#1e293b"/><rect class="usb-dolum" x="142" y="24" width="0" height="16" rx="4" fill="#a78bfa"/>' +
      '<text class="usb-yuzde" x="172" y="66" font-size="10" font-weight="800" fill="#334155" text-anchor="middle" font-family="JetBrains Mono,Consolas,monospace">%0</text>' +
      '</svg></div><div class="pv-durum">Durum: hazır değil</div></div>';
    var p = pencere(ek, 'uyari');
    p.innerHTML = '<div class="pv-pencere-bas">⚠ Uyarı</div><p>USB bellek (E:) üzerindeki <b>tüm veriler silinecek</b>. Devam edilsin mi?</p><div class="pv-pencere-dg"><span>İptal</span><span class="secili">Tamam</span></div>';
    var satir = {};
    g.querySelectorAll('.pv-satir').forEach(function (r) { satir[r.dataset.k] = r; });
    var dolum = g.querySelector('.usb-dolum'), yuzde = g.querySelector('.usb-yuzde'), durum = g.querySelector('.pv-durum'), ok = g.querySelector('.usb-ok');
    function yaz(k, v) {
      Object.keys(satir).forEach(function (x) { satir[x].classList.remove('simdi'); });
      if (!k) return;
      satir[k].querySelector('b').textContent = v; satir[k].classList.add('dolu', 'simdi');
    }
    function yuz(v) { dolum.setAttribute('width', (60 * v / 100).toFixed(1)); yuzde.textContent = '%' + Math.round(v); }
    return {
      sifirla: function () {
        durdur(dolum);
        Object.keys(satir).forEach(function (k) { satir[k].classList.remove('dolu', 'simdi'); satir[k].querySelector('b').textContent = '—'; });
        p.hidden = true; yuz(0); ok.classList.remove('akiyor'); durum.className = 'pv-durum'; durum.textContent = 'Durum: hazır değil';
      },
      adimlar: [
        { yazi: 'USB belleği tak; aygıt listesinde onu boyutundan tanı.', fn: function () { yaz('aygit', 'USB bellek (E:) · 16 GB'); } },
        { yazi: 'Öğretmenin verdiği ISO kalıp dosyasını seç.', fn: function () { yaz('iso', 'kurulum.iso · 5,8 GB'); } },
        { yazi: 'UEFI’li bilgisayar için bölüm şeması GPT, hedef sistem UEFI.', fn: function () { yaz('sema', 'GPT'); yaz('hedef', 'UEFI'); satir.sema.classList.add('simdi'); } },
        { yazi: 'Uyarı: USB’deki tüm veriler silinecek. Yedek varsa “Tamam”.', sure: 2.8, fn: function () { yaz(null); p.hidden = false; } },
        { yazi: 'Kalıp USB’ye yazılıyor. Dosyayı sürükleyip kopyalamak USB’yi önyüklenebilir yapmaz.', sure: 3.4, fn: function () {
          p.hidden = true; ok.classList.add('akiyor'); durum.className = 'pv-durum calisiyor'; durum.textContent = 'Durum: yazılıyor…';
          sayac(dolum, 0, 100, 2600, yuz);
        } },
        { yazi: 'Hazır: USB artık açılışta önyükleme menüsünde görünür.', fn: function () {
          durdur(dolum); yuz(100); ok.classList.remove('akiyor'); durum.className = 'pv-durum tamam'; durum.textContent = '✓ Hazır: önyüklenebilir USB';
        } }
      ]
    };
  });

  /* ─────────── Adım 2: GPT ve MBR karşılaştırması (A-KARSILASTIR) ─────────── */
  prova('pv-gpt', 'Aynı disk, iki bölüm tablosu', function (g) {
    g.innerHTML =
      '<div class="secici gp-sec" role="group" aria-label="Disk boyutu"></div>' +
      '<div class="gp-satir" data-t="mbr"><div class="gp-ad"><b>MBR</b><span>Ana Önyükleme Kaydı</span></div><div class="gp-bar"></div><div class="gp-not"></div></div>' +
      '<div class="gp-satir" data-t="gpt"><div class="gp-ad"><b>GPT</b><span>GUID Bölüm Tablosu</span></div><div class="gp-bar"></div><div class="gp-not"></div></div>' +
      '<table class="gp-tablo"><thead><tr><th></th><th>MBR</th><th>GPT</th></tr></thead><tbody>' +
      '<tr><th>Disk sınırı</th><td>≈ 2 TiB</td><td>8 ZiB (pratikte sınırsız)</td></tr>' +
      '<tr><th>Bölüm sayısı</th><td>4 birincil</td><td>128 (varsayılan)</td></tr>' +
      '<tr><th>Tablo yedeği</th><td>Yok</td><td>Diskin sonunda + CRC</td></tr>' +
      '<tr><th>Önyükleme</th><td>Eski BIOS (Legacy)</td><td>UEFI</td></tr></tbody></table>';
    var TB = 4, faz = 0;
    var sec = g.querySelector('.gp-sec'), satirlar = g.querySelectorAll('.gp-tablo tbody tr');
    var mbr = g.querySelector('[data-t="mbr"]'), gpt = g.querySelector('[data-t="gpt"]');
    var dg = [];
    [[4, '4 TB disk'], [1, '1 TB disk']].forEach(function (x) {
      dg.push(DERS.dugme(sec, x[1], function () { TB = x[0]; ciz(); }));
    });
    function seg(bar, sol, gen, sinif, metin) {
      var s = el('div', 'gp-seg ' + sinif, bar);
      s.style.left = sol + '%'; s.style.width = gen + '%';
      if (metin) el('span', '', s, metin);
      return s;
    }
    function ciz() {
      dg.forEach(function (b, i) { b.setAttribute('aria-pressed', (i === 0) === (TB === 4) ? 'true' : 'false'); });
      var gib = TB === 4 ? 3726 : 931.5, sinir = TB === 4 ? 2048 / gib * 100 : 100;
      [mbr, gpt].forEach(function (s) { s.querySelector('.gp-bar').innerHTML = ''; s.querySelector('.gp-not').textContent = ''; s.classList.toggle('gor', faz >= 1); });
      var mb = mbr.querySelector('.gp-bar'), gb = gpt.querySelector('.gp-bar');
      if (faz >= 1) {
        seg(mb, 0, 3, 'baslik', '');
        seg(gb, 0, 3, 'baslik', ''); seg(gb, 97, 3, 'yedek' + (faz >= 4 ? ' vurgu' : ''), '');
        mbr.querySelector('.gp-not').textContent = 'Disk: ' + String(gib).replace('.', ',') + ' GB (işletim sisteminde)';
        gpt.querySelector('.gp-not').textContent = 'Başta tablo, sonda yedeği';
      }
      if (faz >= 2 && TB === 4) {
        seg(mb, sinir, 100 - sinir, 'kullanilamaz', 'Kullanılamaz · 1678 GB');
        var c = el('div', 'gp-sinir', mb); c.style.left = sinir + '%'; el('span', '', c, '2 TiB');
        mbr.querySelector('.gp-not').textContent = '2³² × 512 B = 2 TiB sınırı: yalnız 2048 GB kullanılır';
      } else if (faz >= 2) {
        mbr.querySelector('.gp-not').textContent = '1 TB < 2 TiB: bu diskte tüm alan kullanılabilir';
      }
      if (faz >= 3) {
        var bas = 3, w = (sinir - 3) / 4;
        for (var i = 0; i < 4; i++) seg(mb, bas + i * w, w, 'bolum b' + i, String(i + 1));
        [[3, 5, 'efi', 'EFI'], [8, 45, 'bolum b0', 'Sistem'], [53, 22, 'bolum b1', 'Veri 1'], [75, 22, 'bolum b2', 'Veri 2']].forEach(function (x) { seg(gb, x[0], x[1], x[2], x[3]); });
        mbr.querySelector('.gp-not').textContent += ' · en çok 4 birincil bölüm';
        gpt.querySelector('.gp-not').textContent = 'Tüm alan kullanılır · 128 bölüme kadar';
      }
      if (faz >= 4) gpt.querySelector('.gp-not').textContent += ' · yedek tablo + CRC';
      satirlar.forEach(function (r, j) { r.classList.toggle('gor', faz >= j + 2); });
    }
    return {
      sifirla: function () { faz = 0; ciz(); },
      adimlar: [
        { yazi: 'Aynı 4 TB disk (işletim sisteminde ≈ 3726 GB): üstte MBR, altta GPT ile bölümlenecek.', fn: function () { TB = 4; faz = 1; ciz(); } },
        { yazi: 'MBR 32 bitlik sektör adresi kullanır: 2³² × 512 B = 2 TiB. Fazlası kullanılamaz.', sure: 2.8, fn: function () { faz = 2; ciz(); } },
        { yazi: 'MBR en çok 4 birincil bölüm tutar; GPT varsayılan olarak 128.', fn: function () { faz = 3; ciz(); } },
        { yazi: 'GPT tablonun yedeğini diskin sonunda tutar ve CRC ile bozulmayı fark eder.', fn: function () { faz = 4; ciz(); } },
        { yazi: 'Önyükleme: eski BIOS → MBR, UEFI → GPT. Yeni bilgisayarda karar: GPT.', fn: function () { faz = 5; ciz(); } }
      ],
      son: function (yazi) {
        var m = el('span', 'pv-tahmin', yazi);
        m.textContent = ' ' + DERS.tahminNotu(1, 'MBR ile 4 TB diskin yalnız 2 TiB’ı kullanılır.', 'Aslında MBR ile 4 TB diskin yalnız 2 TiB’ı kullanılır; kalanı boş kalır.');
      }
    };
  });

  /* ─────────── Adım 3: bölümleme ve biçimlendirme ─────────── */
  prova('pv-bolum', 'Kurulum · disk bölümleri', function (g, ek) {
    g.innerHTML =
      '<div class="bl-disk" data-d="0"><div class="bl-ad"><b>Disk 0</b><span>SSD · 223,6 GB</span></div><div class="bl-bar"></div></div>' +
      '<div class="bl-disk" data-d="1"><div class="bl-ad"><b>Disk 1</b><span>HDD · 931,5 GB</span></div><div class="bl-bar"><div class="bl-seg arsiv" style="left:0;width:100%"><span>ARŞİV · NTFS · dolu 612 GB</span></div></div><span class="bl-kilit">🔒 dokunma</span></div>' +
      '<div class="bl-tanim"><div data-t="b"><b>Bölümleme</b><span>Diski ayrı alanlara ayırır: nerede başlar, nerede biter.</span></div>' +
      '<div data-t="f"><b>Biçimlendirme</b><span>Bölüme dosya sistemi yazar; içindeki eski veriyi siler.</span></div></div>' +
      '<div class="bl-dipnot">Bazı işletim sistemleri küçük bir kurtarma bölümü de ekler.</div>';
    var p = pencere(ek, 'uyari');
    p.innerHTML = '<div class="pv-pencere-bas">⚠ Bölüm silinecek</div><p>Disk 0’daki bölümlerde bulunan <b>tüm veriler kalıcı olarak silinecek</b>. Yedek alındı mı?</p><div class="pv-pencere-dg"><span>Hayır</span><span class="secili">Evet, sil</span></div>';
    var d0 = g.querySelector('[data-d="0"]'), d1 = g.querySelector('[data-d="1"]'), bar = d0.querySelector('.bl-bar');
    var tanim = g.querySelectorAll('.bl-tanim > div');
    function seg(sol, gen, sinif, metin, fs) {
      var s = el('div', 'bl-seg ' + sinif, bar);
      s.style.left = sol + '%'; s.style.width = gen + '%';
      el('span', '', s, metin);
      if (fs) el('small', 'bl-fs', s, fs);
      return s;
    }
    function eski() { bar.innerHTML = ''; seg(0, 6, 'efi', 'EFI'); seg(6, 88, 'eski', 'Eski sistem · 223,0 GB'); seg(94, 6, 'kurt', 'K'); }
    return {
      sifirla: function () {
        eski(); p.hidden = true; d0.classList.remove('secili'); d1.classList.remove('kilitli');
        tanim.forEach(function (t) { t.classList.remove('vurgu'); });
      },
      adimlar: [
        { yazi: 'Disk listesini oku: kurulum Disk 0’a (SSD). Disk 1 arşiv diskidir; dokunulmaz.', fn: function () { d0.classList.add('secili'); d1.classList.add('kilitli'); } },
        { yazi: 'Yedek alındı mı? Evet. Disk 0’ın eski bölümleri siliniyor; bu geri alınamaz.', sure: 3, fn: function () {
          p.hidden = false;
          setTimeout(function () { bar.querySelectorAll('.bl-seg').forEach(function (s) { s.classList.add('siliniyor'); }); }, AZ ? 0 : 1400);
        } },
        { yazi: 'Disk 0 artık tek parça ayrılmamış alan: 223,6 GB.', fn: function () { p.hidden = true; bar.innerHTML = ''; seg(0, 100, 'bos', 'Ayrılmamış alan · 223,6 GB'); } },
        { yazi: 'Ayrılmamış alanı seçince kurulum UEFI için gereken bölümleri kendisi oluşturur.', fn: function () {
          bar.innerHTML = ''; seg(0, 11, 'efi yeni', 'EFI'); seg(11, 89, 'sistem yeni', 'Sistem · 223,3 GB'); tanim[0].classList.add('vurgu');
        } },
        { yazi: 'Biçimlendirme: EFI bölümüne FAT32, sistem bölümüne NTFS ya da ext4 yazılır.', fn: function () {
          tanim[0].classList.remove('vurgu'); tanim[1].classList.add('vurgu');
          var s = bar.querySelectorAll('.bl-seg');
          el('small', 'bl-fs', s[0], 'FAT32'); el('small', 'bl-fs', s[1], 'NTFS / ext4');
          s.forEach(function (x) { x.classList.add('bicimli'); });
        } },
        { yazi: 'Bölümleme alanı ayırır; biçimlendirme o alana dosya sistemi yazar ve eskisini siler.', fn: function () { tanim.forEach(function (t) { t.classList.add('vurgu'); }); } }
      ]
    };
  });

  /* ─────────── Adım 4: kurulum ─────────── */
  prova('pv-kurulum', 'Önyükleme menüsü', function (g, ek, baslik) {
    var ASAMA = ['Dosyalar kopyalanıyor', 'Kurulum dosyaları hazırlanıyor', 'Özellikler yükleniyor', 'Tamamlanıyor'];
    function menu() {
      baslik.textContent = 'Önyükleme menüsü';
      g.innerHTML = '<ul class="ks-menu">' + ['Disk 0: SSD 240 GB', 'UEFI: USB bellek 16 GB', 'USB bellek 16 GB (eski mod)', 'Ağdan önyükleme (IPv4)'].map(function (x, i) {
        return '<li' + (i === 0 ? ' class="secili"' : '') + '>' + x + '</li>'; }).join('') +
        '</ul><div class="ks-not">Tuş, üreticiye göre değişir: <code>F8</code> · <code>F11</code> · <code>F12</code> · <code>Esc</code></div>';
    }
    function form(bas, satirlar, dugme) {
      baslik.textContent = bas;
      g.innerHTML = '<div class="pv-form">' + satirlar.map(function (r) { return '<div class="pv-satir dolu"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('') + '</div>' +
        (dugme ? '<div class="ks-dugme"><span>' + dugme + '</span></div>' : '');
    }
    var zam = null;
    return {
      sifirla: function () { if (zam) clearTimeout(zam); durdur(g); menu(); },
      adimlar: [
        { yazi: 'Açılışta önyükleme menüsü tuşuna bas; “UEFI: USB” satırını seç.', sure: 2.6, fn: function () {
          menu(); zam = setTimeout(function () { var li = g.querySelectorAll('.ks-menu li'); if (li.length) { li[0].classList.remove('secili'); li[1].classList.add('secili'); } }, AZ ? 0 : 900);
          if (AZ) { var li = g.querySelectorAll('.ks-menu li'); li[0].classList.remove('secili'); li[1].classList.add('secili'); }
        } },
        { yazi: 'Dil, saat biçimi ve klavye düzenini seç: Türkçe Q.', fn: function () {
          form('Kurulum · dil ve bölge', [['Dil', 'Türkçe'], ['Saat ve para biçimi', 'Türkçe (Türkiye)'], ['Klavye düzeni', 'Türkçe Q']], 'İleri');
        } },
        { yazi: 'Kurulum yeri: Disk 0’daki ayrılmamış alan (Adım 3’te hazırlandı).', fn: function () {
          form('Kurulum · kurulum yeri', [['Disk 0 · Ayrılmamış alan', '223,6 GB ✓'], ['Disk 1 · ARŞİV', '931,5 GB · seçilmedi']], 'İleri');
        } },
        { yazi: 'Dosyalar kopyalanıyor, özellikler yükleniyor. Bu sırada bilgisayar kapatılmaz.', sure: 4, fn: function () {
          baslik.textContent = 'Kurulum · ilerleme';
          g.innerHTML = '<ol class="ks-asama">' + ASAMA.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ol><div class="ks-bar"><span></span></div><div class="ks-yuzde">%0</div>';
          var li = g.querySelectorAll('.ks-asama li'), b = g.querySelector('.ks-bar span'), y = g.querySelector('.ks-yuzde');
          sayac(g, 0, 100, 3200, function (v) {
            b.style.width = v + '%'; y.textContent = '%' + Math.round(v);
            li.forEach(function (l, i) { l.className = v >= (i + 1) * 25 ? 'tamam' : (v >= i * 25 ? 'simdi' : ''); });
          });
        } },
        { yazi: 'İlk yeniden başlatmada USB’yi çıkar; yoksa kurulum yeniden başlayabilir.', fn: function () {
          durdur(g); baslik.textContent = 'Yeniden başlatılıyor…';
          g.innerHTML = '<div class="ks-usb"><svg viewBox="0 0 160 60" role="img" aria-label="USB bellek bilgisayardan çıkarılıyor"><rect x="4" y="14" width="40" height="32" rx="4" fill="#cbd5e1"/><path d="M44 30h10" stroke="#64748b" stroke-width="3"/>' +
            '<g class="ks-usb-cik"><rect x="58" y="22" width="16" height="16" rx="2" fill="#cbd5e1"/><rect x="72" y="14" width="60" height="32" rx="7" fill="#7c3aed"/></g><path d="M140 30h14M148 24l6 6-6 6" stroke="#16a34a" stroke-width="3" fill="none"/></svg>' +
            '<b>USB’yi çıkar</b><span>Sistem şimdi Disk 0’dan açılacak.</span></div>';
        } },
        { yazi: 'Sistem diskten açıldı: sıra kullanıcı hesabında.', fn: function () {
          form('İlk açılış · kullanıcı hesabı', [['Kullanıcı adı', 'ogrenci'], ['Parola', '••••••••'], ['Bilgisayar adı', 'LAB-07']], 'Hesabı oluştur');
        } }
      ]
    };
  });

  /* ─────────── Adım 5: Aygıt Yöneticisi ─────────── */
  prova('pv-aygit', 'Aygıt Yöneticisi', function (g, ek) {
    g.innerHTML =
      '<div class="ay-sayac"></div><ul class="ay-agac">' +
      '<li class="ay-grup"><b>Disk sürücüleri</b><ul><li class="ay-ok">SSD 240 GB</li></ul></li>' +
      '<li class="ay-grup" data-g="ekran"><b>Ekran bağdaştırıcıları</b><ul><li class="ay-genel" data-a="ekran">Temel Görüntü Bağdaştırıcısı <em>genel sürücü</em></li></ul></li>' +
      '<li class="ay-grup" data-g="ag" hidden><b>Ağ bağdaştırıcıları</b><ul></ul></li>' +
      '<li class="ay-grup" data-g="ses" hidden><b>Ses, video ve oyun denetleyicileri</b><ul></ul></li>' +
      '<li class="ay-grup" data-g="diger"><b>Diğer aygıtlar</b><ul><li class="ay-eksik" data-a="ag">Ağ Denetleyicisi <em>sürücü yok</em></li><li class="ay-eksik" data-a="ses">Çoklu Ortam Ses Denetleyicisi <em>sürücü yok</em></li></ul></li>' +
      '<li class="ay-grup"><b>Klavyeler</b><ul><li class="ay-ok">Standart klavye</li></ul></li></ul>';
    var menu = el('div', 'ay-menu', ek); menu.hidden = true;
    menu.innerHTML = '<span class="secili">Sürücüyü güncelleştir</span><span>Aygıtı devre dışı bırak</span><span>Özellikler</span>';
    var p = pencere(ek, '');
    p.innerHTML = '<div class="pv-pencere-bas">Sürücüyü güncelleştir</div><p>Sürücüleri bilgisayarımda ara:</p><code>E:\\Suruculer\\Ag</code><div class="pv-pencere-dg"><span class="secili">İleri</span></div>';
    var sayacEl = g.querySelector('.ay-sayac');
    var ILK = g.innerHTML;
    function durum() {
      var n = g.querySelectorAll('.ay-eksik').length, genel = g.querySelectorAll('.ay-genel').length;
      sayacEl.className = 'ay-sayac' + (n + genel ? '' : ' tamam');
      sayacEl.textContent = n ? '⚠ ' + n + ' aygıtın sürücüsü eksik' : (genel ? 'Eksik yok · 1 aygıt genel sürücüde' : '✓ Tüm aygıtlar üretici sürücüsüyle çalışıyor');
    }
    function tasi(a, grup, ad) {
      var eski = g.querySelector('[data-a="' + a + '"]');
      if (eski) eski.remove();
      var gr = g.querySelector('[data-g="' + grup + '"]'); gr.hidden = false;
      var li = el('li', 'ay-ok yeni', gr.querySelector('ul'), ad);
      el('em', '', li, 'çalışıyor');
      if (!g.querySelector('[data-g="diger"] li')) g.querySelector('[data-g="diger"]').hidden = true;
      durum();
      return li;
    }
    function vurgu(sec) { g.querySelectorAll('.vurgu').forEach(function (x) { x.classList.remove('vurgu'); }); if (sec) { var e = g.querySelector(sec); if (e) e.classList.add('vurgu'); } }
    return {
      sifirla: function () { g.innerHTML = ILK; sayacEl = g.querySelector('.ay-sayac'); menu.hidden = true; p.hidden = true; durum(); },
      adimlar: [
        { yazi: 'Sarı ünlem (⚠) sürücüsü eksik aygıtı gösterir: “Diğer aygıtlar” altına bak.', fn: function () { vurgu('[data-g="diger"]'); } },
        { yazi: 'Önce ağ: “Ağ Denetleyicisi” → sağ tık → “Sürücüyü güncelleştir”.', fn: function () { vurgu('[data-a="ag"]'); menu.hidden = false; } },
        { yazi: '“Sürücüleri bilgisayarımda ara” → USB’deki sürücü klasörünü göster.', fn: function () { menu.hidden = true; p.hidden = false; } },
        { yazi: 'Kuruldu: aygıt gerçek adıyla “Ağ bağdaştırıcıları” altına geçti.', fn: function () { p.hidden = true; vurgu(null); tasi('ag', 'ag', 'Gigabit Ethernet Denetleyicisi ').classList.add('vurgu'); } },
        { yazi: 'Ağ çalışınca ses sürücüsü güncellemeyle kurulur.', fn: function () { vurgu(null); tasi('ses', 'ses', 'Yüksek Tanımlı Ses Aygıtı ').classList.add('vurgu'); } },
        { yazi: '“Temel Görüntü Bağdaştırıcısı” genel sürücüdür: çalışır ama sınırlıdır; üretici sürücüsünü kur.', fn: function () {
          vurgu(null); tasi('ekran', 'ekran', 'Ekran kartı (üretici sürücüsü) ').classList.add('vurgu');
        } }
      ]
    };
  });

  /* ─────────── Adım 6: güncellemeler ve ilk ayarlar ─────────── */
  prova('pv-guncel', 'Güncellemeler ve ilk ayarlar', function (g) {
    var GUN = ['Güvenlik güncellemesi', 'Sürücü güncellemesi', 'Uygulama güncellemeleri'];
    var AYAR = ['Bilgisayar adı: LAB-07', 'Saat dilimi: (UTC+03:00) İstanbul', 'Yerel hesap + güçlü parola', 'Ekran çözünürlüğü: önerilen', 'Gizlilik ayarları gözden geçirildi', 'Kayıt formu dolduruldu'];
    g.innerHTML = '<div class="gn-duzen"><div class="gn-sol"><div class="gn-bas">Güncellemeler</div><ul class="gn-liste">' +
      GUN.map(function (x) { return '<li><span>' + x + '</span><i><s></s></i><em>—</em></li>'; }).join('') +
      '</ul><div class="gn-durum">Denetlenmedi</div></div><div class="gn-sag"><div class="gn-bas">İlk ayarlar</div><ul class="gn-ayar">' +
      AYAR.map(function (x) { return '<li><span class="gn-kutu"></span>' + x + '</li>'; }).join('') + '</ul></div></div>';
    var li = g.querySelectorAll('.gn-liste li'), ay = g.querySelectorAll('.gn-ayar li'), dur = g.querySelector('.gn-durum');
    function isaretle(a, b) { for (var i = a; i <= b; i++) ay[i].classList.add('tamam'); }
    return {
      sifirla: function () {
        li.forEach(function (l) { durdur(l); l.className = ''; l.querySelector('s').style.width = '0'; l.querySelector('em').textContent = '—'; });
        ay.forEach(function (a) { a.classList.remove('tamam'); }); dur.className = 'gn-durum'; dur.textContent = 'Denetlenmedi';
      },
      adimlar: [
        { yazi: 'Güncellemeleri denetle: 3 güncelleme bulundu.', fn: function () { li.forEach(function (l) { l.className = 'gor'; l.querySelector('em').textContent = 'Bekliyor'; }); dur.textContent = '3 güncelleme var'; } },
        { yazi: 'İndir ve yükle; bu sırada bilgisayarı kapatma.', sure: 3.2, fn: function () {
          li.forEach(function (l, i) {
            l.className = 'gor';
            sayac(l, 0, 100, 1400 + i * 500, function (v) { l.querySelector('s').style.width = v + '%'; l.querySelector('em').textContent = v < 100 ? '%' + Math.round(v) : 'Yüklendi'; },
              function () { l.className = 'gor tamam'; });
          });
          dur.textContent = 'Yükleniyor…';
        } },
        { yazi: 'Yeniden başlat ve tekrar denetle: “Sistem güncel”.', fn: function () {
          li.forEach(function (l) { durdur(l); l.className = 'gor tamam'; l.querySelector('s').style.width = '100%'; l.querySelector('em').textContent = 'Yüklendi'; });
          dur.className = 'gn-durum tamam'; dur.textContent = '✓ Sistem güncel';
        } },
        { yazi: 'Bilgisayar adı masa etiketine göre; saat dilimi İstanbul (UTC+03:00).', fn: function () { isaretle(0, 1); } },
        { yazi: 'Yerel hesap güçlü parolayla; ekran çözünürlüğü “önerilen”.', fn: function () { isaretle(2, 3); } },
        { yazi: 'Gizlilik ayarlarını gözden geçir; kayıt formunu doldur.', fn: function () { isaretle(4, 5); } }
      ]
    };
  });

  /* ─────────── Etkinlik 1: E-KURULUM kurulum adımları simülatörü ─────────── */
  (function () {
    var kok = document.getElementById('kurulum-sim');
    if (!kok) return;
    var ASAMA = ['Önyükleme', 'Dil', 'Disk', 'Kurulum', 'Hesap', 'Sürücü'];
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var riskEl = document.querySelector('#ku-risk b');
    var ku = el('div', 'ku', kok);
    var serit = el('ol', 'ku-serit', ku);
    serit.setAttribute('aria-label', 'Kurulum aşamaları');
    var lis = ASAMA.map(function (a, i) { var l = el('li', '', serit); el('b', '', l, String(i + 1)); el('span', '', l, a); return l; });
    var e = ekranKur(ku, '');
    e.ek.classList.add('ku-ekran');
    var govde = e.govde;
    var geri = el('div', 'ku-geri', ku);
    geri.setAttribute('aria-live', 'polite');
    var pen = pencere(e.ek, 'uyari');
    var asama = 0, tamam = 0, risk = 0, disk = null, secili = null;

    function mesaj(metin, tur) { geri.className = 'ku-geri' + (tur ? ' ' + tur : ''); geri.innerHTML = ''; el('span', '', geri, metin); }
    function riskArt() { risk++; if (riskEl) riskEl.textContent = risk; var k = document.getElementById('ku-risk'); if (k) k.classList.add('var'); }
    function seritCiz() {
      lis.forEach(function (l, i) {
        l.className = i < tamam ? 'tamam' : (i === asama ? 'simdi' : '');
        l.setAttribute('aria-label', (i + 1) + '. ' + ASAMA[i] + (i < tamam ? ': tamamlandı' : (i === asama ? ': şu anki aşama' : '')));
      });
    }
    function bitir(metin) {
      tamam = Math.max(tamam, asama + 1); ilerle(tamam, 6); seritCiz(); ses('klik');
      mesaj(metin, 'iyi');
      if (asama < 5) DERS.dugme(geri, 'Sonraki aşama →', function () { asama++; ac(); }, 'dy-ileri ku-devam');
      else setTimeout(final, AZ ? 0 : 700);
    }
    function yanlis(metin, riskli) { ses('hata'); if (riskli) riskArt(); mesaj(metin, 'kotu'); }
    function pencereAc(bas, html, dugmeler) {
      pen.innerHTML = '';
      el('div', 'pv-pencere-bas', pen, bas);
      var p = el('p', '', pen); p.innerHTML = html;
      var dg = el('div', 'pv-pencere-dg', pen);
      dugmeler.forEach(function (d) { DERS.dugme(dg, d[0], function () { pen.hidden = true; d[1](); }, d[2] || ''); });
      pen.hidden = false;
      var ilk = dg.querySelector('button'); if (ilk) ilk.focus();
    }
    function ac() {
      pen.hidden = true; seritCiz(); mesaj('', '');
      govde.innerHTML = '';
      [onyukleme, dil, diskSec, kurulum, hesap, surucu][asama]();
    }

    /* 1 · Önyükleme menüsü */
    function onyukleme() {
      e.baslik.textContent = 'Önyükleme menüsü';
      el('p', 'ku-yon', govde).innerHTML = 'Bilgisayar açılırken önyükleme menüsü tuşuna bastın. Kurulumu <b>UEFI modunda, USB’den</b> başlat.';
      var liste = el('div', 'ku-liste', govde);
      [['Disk 0: SSD 240 GB', 'Bu disk boş; üzerinde başlatılacak bir sistem yok. Kurulum USB’den başlar.'],
       ['USB bellek 16 GB (eski mod)', 'Bu satır eski (CSM/Legacy) modu başlatır. Disk GPT olacağı için “UEFI:” ile başlayanı seç.'],
       ['UEFI: USB bellek 16 GB', null],
       ['Ağdan önyükleme (IPv4)', 'Bu, ağ üzerinden kurulum içindir; bu derste USB kullanılıyor.']].forEach(function (s) {
        var b = DERS.dugme(liste, s[0], function () {
          if (s[1]) { b.classList.add('kotu'); yanlis('✗ ' + s[1]); return; }
          liste.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
          b.classList.add('iyi');
          bitir('✓ Kurulum ortamı UEFI modunda açıldı.');
        }, 'ku-secenek');
      });
    }
    /* 2 · Dil ve klavye */
    function dil() {
      e.baslik.textContent = 'Kurulum · dil ve bölge';
      var f = el('div', 'ku-form', govde);
      var ALAN = [['Dil', ['English', 'Türkçe', 'Deutsch']], ['Saat ve para biçimi', ['English (United States)', 'Türkçe (Türkiye)']], ['Klavye düzeni', ['ABD', 'Türkçe F', 'Türkçe Q']]];
      var sel = ALAN.map(function (a) {
        var l = el('label', 'ku-alan', f); el('span', '', l, a[0]);
        var s = el('select', '', l); a[1].forEach(function (o) { el('option', '', s, o).value = o; });
        return s;
      });
      var dg = el('div', 'ku-dugmeler', govde);
      DERS.dugme(dg, 'İleri', function () {
        if (sel[0].value !== 'Türkçe') return yanlis('✗ Arayüz dilini Türkçe seç.');
        if (sel[1].value !== 'Türkçe (Türkiye)') return yanlis('✗ Tarih, saat ve para biçimi için “Türkçe (Türkiye)” seç.');
        if (sel[2].value === 'Türkçe F') return yanlis('✗ Klavyenin üst harf sırası Q W E R T Y ise düzen “Türkçe Q” olur.');
        if (sel[2].value !== 'Türkçe Q') return yanlis('✗ ABD düzeninde ğ, ü, ş, ı, ö, ç yanlış yazılır; “Türkçe Q” seç.');
        sel.forEach(function (s) { s.disabled = true; });
        bitir('✓ Dil Türkçe, biçim Türkiye, klavye Türkçe Q.');
      }, 'ku-ana');
    }
    /* 3 · Disk seçimi (riskli adım: onay + uyarı) */
    function diskSec() {
      e.baslik.textContent = 'Kurulum · kurulum yeri';
      el('p', 'ku-yon', govde).innerHTML = 'Görev: Disk 0’a (SSD) temiz kurulum. Disk 0’daki eski sistemin yedeği alındı. <b>ARŞİV</b> öğrenci yedeklerini tutar.';
      disk = [
        { id: 'd0p1', d: 0, ad: 'Disk 0 · Bölüm 1', tur: 'EFI sistem', boyut: '100 MB' },
        { id: 'd0p2', d: 0, ad: 'Disk 0 · Bölüm 2', tur: 'Eski sistem', boyut: '223,0 GB' },
        { id: 'd0p3', d: 0, ad: 'Disk 0 · Bölüm 3', tur: 'Kurtarma', boyut: '0,5 GB' },
        { id: 'd1p1', d: 1, ad: 'Disk 1 · Bölüm 1', tur: 'ARŞİV (dolu 612 GB)', boyut: '931,5 GB' }
      ];
      secili = null;
      var tablo = el('div', 'ku-tablo', govde);
      tablo.setAttribute('role', 'listbox'); tablo.setAttribute('aria-label', 'Diskler ve bölümler');
      var dg = el('div', 'ku-dugmeler', govde);
      function ciz() {
        tablo.innerHTML = '<div class="ku-tbas"><span>Ad</span><span>Tür</span><span>Boyut</span></div>';
        disk.forEach(function (p) {
          var b = el('button', 'ku-bolum' + (p.d === 1 ? ' arsiv' : '') + (p.bos ? ' bos' : ''), tablo);
          b.type = 'button'; b.dataset.id = p.id;
          b.setAttribute('role', 'option'); b.setAttribute('aria-selected', secili === p ? 'true' : 'false');
          el('span', '', b, p.ad); el('span', '', b, p.tur); el('span', '', b, p.boyut);
          b.addEventListener('click', function () { secili = p; ciz(); });
        });
      }
      function sil() {
        var p = secili;
        if (!p) return yanlis('✗ Önce listeden bir bölüm seç.');
        if (p.bos) return mesaj('Ayrılmamış alan zaten boş; silinecek bölüm yok.', '');
        pencereAc('⚠ Bölüm silinecek', '<b>' + p.ad + ' · ' + p.tur + ' · ' + p.boyut + '</b><br>Bu bölümdeki tüm veriler kalıcı olarak silinecek. Yedeğin var mı?', [
          ['Vazgeç', function () {
            if (p.d === 1) { ses('klik'); mesaj('✓ Doğru karar: ARŞİV diskini korudun. Kurulum yeri Disk 0.', 'iyi'); }
            else mesaj('Silme iptal edildi.', '');
          }],
          ['Sil', function () {
            if (p.d === 1) {
              yanlis('✗ Veri kaybı! ARŞİV öğrencilerin yedeklerini tutuyordu. Simülatör geri aldı; gerçekte geri alınamazdı.', true);
              return;
            }
            disk.splice(disk.indexOf(p), 1); secili = null;
            var kalan = disk.filter(function (x) { return x.d === 0; }).length;
            if (!kalan) disk.unshift({ id: 'd0u', d: 0, ad: 'Disk 0 · Ayrılmamış alan', tur: '—', boyut: '223,6 GB', bos: true });
            ses('klik');
            mesaj(kalan ? 'Bölüm silindi. Disk 0’da ' + kalan + ' bölüm kaldı.' : 'Disk 0 artık tek parça ayrılmamış alan. Onu seçip “İleri”ye bas.', '');
            ciz();
          }, 'tehlike']
        ]);
      }
      function ileri() {
        var p = secili;
        if (!p) return yanlis('✗ Önce kurulum yerini seç.');
        if (p.d === 1) return yanlis('✗ ARŞİV diskine kurulum yapılmaz; üzerindeki veriler silinirdi. Kurulum yeri Disk 0.', true);
        if (!p.bos) return yanlis('✗ Bu bölümde eski sistemden kalanlar var. Disk 0’ın bölümlerini silip ayrılmamış alanı seç.');
        pencereAc('Bölüm stili', 'Bu bilgisayar <b>UEFI modunda</b> açıldı. Disk 0 hangi bölüm stiliyle hazırlansın?', [
          ['GPT', function () {
            tablo.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
            dg.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
            bitir('✓ Disk 0 GPT ile hazırlanıyor: EFI sistem bölümü ve sistem bölümü oluşturulacak.');
          }],
          ['MBR', function () { yanlis('✗ UEFI modunda sistem diski GPT olmalı; MBR seçilirse kurulum bu modda devam etmez.'); }]
        ]);
      }
      DERS.dugme(dg, 'Sil', sil, 'tehlike');
      DERS.dugme(dg, 'İleri', ileri, 'ku-ana');
      ciz();
    }
    /* 4 · Kurulum ilerlemesi + yeniden başlatma */
    function kurulum() {
      e.baslik.textContent = 'Kurulum · ilerleme';
      var A = ['Dosyalar kopyalanıyor', 'Kurulum dosyaları hazırlanıyor', 'Özellikler yükleniyor', 'Tamamlanıyor'];
      govde.innerHTML = '<ol class="ks-asama">' + A.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ol><div class="ks-bar"><span></span></div><div class="ks-yuzde">%0</div>';
      var li = govde.querySelectorAll('.ks-asama li'), b = govde.querySelector('.ks-bar span'), y = govde.querySelector('.ks-yuzde');
      mesaj('Kurulum sürüyor; bilgisayarı kapatma, USB’yi çekme.', '');
      sayac(govde, 0, 100, 3600, function (v) {
        b.style.width = v + '%'; y.textContent = '%' + Math.round(v);
        li.forEach(function (l, i) { l.className = v >= (i + 1) * 25 ? 'tamam' : (v >= i * 25 ? 'simdi' : ''); });
      }, function () {
        e.baslik.textContent = 'Yeniden başlatma';
        var s = el('div', 'ku-soru', govde);
        el('p', 'ku-yon', s).innerHTML = 'Kurulum ilk yeniden başlatmaya geldi. USB hâlâ takılı ve önyükleme sırasında <b>ilk sırada</b>. Ne yaparsın?';
        var l = el('div', 'ku-liste', s);
        [['USB’den yeniden başlat', false], ['USB’yi çıkar, diskten başlat', true]].forEach(function (x) {
          var bt = DERS.dugme(l, x[0], function () {
            if (!x[1]) { bt.classList.add('kotu'); return yanlis('✗ Kurulum ortamı yeniden açılır, adımlar baştan başlar. USB’yi çıkar ya da menüden Disk 0’ı seç.'); }
            l.querySelectorAll('button').forEach(function (z) { z.disabled = true; }); bt.classList.add('iyi');
            bitir('✓ Sistem Disk 0’dan açıldı; kurulum son ayarlara geçti.');
          }, 'ku-secenek');
        });
        mesaj('', '');
      });
    }
    /* 5 · Kullanıcı hesabı */
    function hesap() {
      e.baslik.textContent = 'İlk açılış · kullanıcı hesabı';
      var f = el('div', 'ku-form', govde);
      var alan = [['Kullanıcı adı', 'text'], ['Parola', 'password'], ['Parola (tekrar)', 'password']].map(function (a) {
        var l = el('label', 'ku-alan', f); el('span', '', l, a[0]);
        var i = el('input', '', l); i.type = a[1]; i.autocomplete = 'off'; return i;
      });
      var kural = el('ul', 'ku-kural', govde);
      var K = [['Kullanıcı adı boşluksuz', function (a, p1) { return /^\S{2,}$/.test(a); }],
               ['Parola en az 8 karakter', function (a, p1) { return p1.length >= 8; }],
               ['Harf ve rakam içeriyor', function (a, p1) { return /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(p1) && /\d/.test(p1); }],
               ['İki parola aynı', function (a, p1, p2) { return p1.length > 0 && p1 === p2; }]];
      var kl = K.map(function (k) { return el('li', '', kural, k[0]); });
      function denetle() {
        var ok = true;
        K.forEach(function (k, i) {
          var v = k[1](alan[0].value, alan[1].value, alan[2].value);
          kl[i].className = v ? 'tamam' : ''; kl[i].setAttribute('aria-label', k[0] + (v ? ': sağlandı' : ': sağlanmadı'));
          if (!v) ok = false;
        });
        return ok;
      }
      alan.forEach(function (a) { a.addEventListener('input', denetle); });
      denetle();
      var dg = el('div', 'ku-dugmeler', govde);
      DERS.dugme(dg, 'Hesabı oluştur', function () {
        if (!denetle()) return yanlis('✗ İşaretlenmemiş kuralları sağla.');
        alan.forEach(function (a) { a.disabled = true; });
        bitir('✓ Hesap oluşturuldu. Parolanı kimseyle paylaşma.');
      }, 'ku-ana');
    }
    /* 6 · Sürücüler ve güncellemeler */
    function surucu() {
      e.baslik.textContent = 'Aygıt Yöneticisi';
      el('p', 'ku-yon', govde).innerHTML = 'Sürücüsü eksik aygıtları bul ve USB’deki sürücü klasöründen kur. Sonra güncellemeleri denetle.';
      var agac = el('ul', 'ay-agac ku-agac', govde);
      var AYGIT = [
        { grup: 'Disk sürücüleri', ad: 'SSD 240 GB', ok: true },
        { grup: 'Diğer aygıtlar', ad: 'Ağ Denetleyicisi', ok: false, yeniGrup: 'Ağ bağdaştırıcıları', yeniAd: 'Gigabit Ethernet Denetleyicisi', yol: 'E:\\Suruculer\\Ag' },
        { grup: 'Diğer aygıtlar', ad: 'Çoklu Ortam Ses Denetleyicisi', ok: false, yeniGrup: 'Ses, video ve oyun denetleyicileri', yeniAd: 'Yüksek Tanımlı Ses Aygıtı', yol: 'E:\\Suruculer\\Ses' },
        { grup: 'Klavyeler', ad: 'Standart klavye', ok: true }
      ];
      var agKuruldu = false;
      var dg = el('div', 'ku-dugmeler', govde);
      var gun = DERS.dugme(dg, 'Güncellemeleri denetle', function () {
        if (AYGIT.some(function (a) { return !a.ok; })) return yanlis('✗ Önce sarı ünlemli aygıtların sürücülerini kur.');
        gun.disabled = true;
        mesaj('Güncellemeler indiriliyor ve yükleniyor…', '');
        var bar = el('div', 'ks-bar', govde); var s = el('span', '', bar);
        sayac(bar, 0, 100, 1800, function (v) { s.style.width = v + '%'; }, function () { bitir('✓ Sürücüler tamam, sistem güncel.'); });
      }, 'ku-ana');
      function ciz() {
        agac.innerHTML = '';
        var gruplar = [];
        AYGIT.forEach(function (a) { var gr = a.ok && a.yeniGrup ? a.yeniGrup : a.grup; if (gruplar.indexOf(gr) < 0) gruplar.push(gr); });
        gruplar.forEach(function (gr) {
          var g = el('li', 'ay-grup', agac); el('b', '', g, gr);
          var u = el('ul', '', g);
          AYGIT.forEach(function (a) {
            if ((a.ok && a.yeniGrup ? a.yeniGrup : a.grup) !== gr) return;
            var li = el('li', '', u);
            var b = el('button', a.ok ? 'ay-ok' : 'ay-eksik', li, a.ok && a.yeniAd ? a.yeniAd + ' ' : a.ad + ' ');
            b.type = 'button';
            el('em', '', b, a.ok ? 'çalışıyor' : 'sürücü yok');
            b.addEventListener('click', function () {
              if (a.ok) return mesaj('Bu aygıtın sürücüsü yüklü ve çalışıyor.', '');
              var ipucu = (!agKuruldu && a.yeniGrup.indexOf('Ağ') !== 0) ? '<br><small>İpucu: gerçek kurulumda önce ağ sürücüsü kurulur; diğerleri güncellemeyle de gelir.</small>' : '';
              pencereAc('Sürücüyü güncelleştir', '<b>' + a.ad + '</b><br>Sürücüleri bilgisayarımda ara: <code>' + a.yol + '</code>' + ipucu, [
                ['Kur', function () {
                  a.ok = true; if (a.yeniGrup.indexOf('Ağ') === 0) agKuruldu = true;
                  ses('klik'); mesaj('✓ ' + a.yeniAd + ' kuruldu; aygıt “' + a.yeniGrup + '” altına geçti.', 'iyi'); ciz();
                }],
                ['Vazgeç', function () {}]
              ]);
            });
          });
        });
      }
      ciz();
    }
    function final() {
      e.baslik.textContent = 'Kurulum tamamlandı';
      govde.innerHTML = '';
      var k = el('div', 'ku-final', govde);
      el('b', 'ku-final-bas', k, '✓ İşletim sistemi kuruldu');
      var ul = el('ul', '', k);
      ['UEFI: USB’den önyükleme', 'Türkçe · Türkçe Q klavye', 'Disk 0 · GPT · ayrılmamış alana kurulum', 'USB çıkarıldı, diskten açıldı', 'Yerel hesap + güçlü parola', '2 sürücü kuruldu · sistem güncel'].forEach(function (x) { el('li', '', ul, x); });
      el('p', 'ku-final-risk', k, risk ? 'Riskli adımda ' + risk + ' hata: gerçek kurulumda disk adını ve boyutunu iki kez oku.' : 'Riskli adımların hepsinde doğru karar verdin.');
      mesaj('Tebrikler! Kurulum adımlarının tamamını bitirdin.', 'iyi');
      DERS.dugme(geri, 'Baştan başla', function () { asama = 0; tamam = 0; risk = 0; if (riskEl) riskEl.textContent = '0'; var r = document.getElementById('ku-risk'); if (r) r.classList.remove('var'); ilerle(0, 6); ac(); }, 'dy-ileri ku-devam');
      if (!risk) DERS.konfeti();
    }
    ac();
  })();

  /* ─────────── Etkinlik 2: kurulum kararları ─────────── */
  (function () {
    var kok = document.getElementById('kararlar');
    if (!kok) return;
    var TUR = [
      { svg: '<!--@dahil:kr-1.svg-->', soru: 'Kurulum kalıp dosyası (ISO) 5,8 GB. Elindeki USB bellek 4 GB. Önyüklenebilir USB hazırlanabilir mi?',
        sec: ['Evet, sıkıştırılınca sığar', 'Hayır; en az 8 GB’lık USB gerekir'], dogru: 1,
        ac: 'Kalıbın içeriği USB’ye bire bir yazılır; 5,8 GB veri 4 GB’a sığmaz. Kurulum USB’si için 8 GB ve üstü kullanılır.' },
      { svg: '<!--@dahil:kr-2.svg-->', soru: 'Anakart UEFI modunda ve Secure Boot açık kalacak. Yeni 1 TB SSD’ye kurulum yapılacak. Bölüm stili ne olmalı?',
        sec: ['GPT', 'MBR'], dogru: 0,
        ac: 'Secure Boot yalnız UEFI modunda çalışır; UEFI modunda sistem diski GPT ile hazırlanır.' },
      { svg: '<!--@dahil:kr-3.svg-->', soru: '4 TB’lık veri diskinin tamamı tek bölüm olarak kullanılacak. Bölüm stili ne olmalı?',
        sec: ['MBR', 'GPT'], dogru: 1,
        ac: 'MBR en çok 2 TiB adresler; bu diskin ≈ 1678 GB’ı boş kalırdı. GPT tüm alanı kullanır.' },
      { svg: '<!--@dahil:kr-4.svg-->', soru: 'Yalnız eski BIOS (Legacy) destekleyen bir bilgisayara 500 GB sistem diski takılacak. Bölüm stili ne olmalı?',
        sec: ['GPT', 'MBR'], dogru: 1,
        ac: 'UEFI’si olmayan anakart, çoğu işletim sisteminde GPT diskten açılamaz. 500 GB, 2 TiB sınırının altında olduğu için MBR uygundur.' },
      { svg: '<!--@dahil:kr-5.svg-->', soru: 'Görev: SSD’ye temiz kurulum. Kurulum ekranında iki disk görünüyor. Hangi bölümleri silersin?',
        sec: ['Disk 0’ın (SSD) bölümlerini', 'Disk 1’in (ARŞİV) bölümlerini', 'İki diskin tüm bölümlerini'], dogru: 0,
        ac: 'Yalnız kurulum diski temizlenir. ARŞİV’deki veri silinirse geri gelmez; disk boyutu ve adı iki kez okunur.' },
      { svg: '<!--@dahil:kr-6.svg-->', soru: 'Kurulum bitti ama ağ bağlantısı yok. Aygıt Yöneticisi’nde “Ağ Denetleyicisi” sarı ünlemle görünüyor. Ne yaparsın?',
        sec: ['İşletim sistemini yeniden kurarım', 'Sürücüsünü USB’deki sürücü klasöründen kurarım', 'Ağ kartını yenisiyle değiştiririm'], dogru: 1,
        ac: 'Sarı ünlem, donanımın bozuk değil sürücüsünün eksik olduğunu gösterir. Önce ağ sürücüsü kurulur; diğerleri güncellemeyle gelir.' }
    ];
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var i = 0, puan = 0;
    var kr = el('div', 'kr', kok);
    function goster() {
      kr.innerHTML = '';
      if (i >= TUR.length) {
        var s = el('div', 'kr-son', kr);
        el('b', '', s, puan + ' / ' + TUR.length);
        el('span', '', s, puan >= 5 ? 'Kurulum kararlarında güvenilir bir teknisyensin.' : 'İpucu: önce önyükleme moduna, disk boyutuna ve disk adına bak.');
        DERS.dugme(s, 'Yeniden oyna', function () { i = 0; puan = 0; ilerle(0, TUR.length); goster(); }, 'dy-ileri');
        if (puan >= 5) DERS.konfeti();
        return;
      }
      var t = TUR[i];
      var kart = el('div', 'kr-kart', kr);
      var ust = el('div', 'kr-ust', kart);
      el('span', 'kr-no', ust, 'Kart ' + (i + 1) + ' / ' + TUR.length);
      var r = el('div', 'kr-resim', kart); r.innerHTML = t.svg;
      el('div', 'kr-soru', kart, t.soru);
      var sec = el('div', 'kr-secenek' + (t.sec.length > 2 ? ' uc' : ''), kart);
      var geri = el('div', 'kr-geri', kart); geri.setAttribute('aria-live', 'polite');
      t.sec.forEach(function (m, j) {
        var b = DERS.dugme(sec, m, function () {
          var dogru = j === t.dogru;
          sec.querySelectorAll('button').forEach(function (x, k) { x.disabled = true; if (k === t.dogru) x.classList.add('iyi'); });
          if (!dogru) b.classList.add('kotu');
          if (dogru) { puan++; ses('klik'); } else ses('hata');
          geri.className = 'kr-geri ' + (dogru ? 'iyi' : 'kotu');
          geri.innerHTML = '<span></span>';
          geri.firstChild.textContent = (dogru ? '✓ Doğru. ' : '✗ Değil. ') + t.ac;
          i++; ilerle(i, TUR.length);
          DERS.dugme(geri, i < TUR.length ? 'Sonraki kart →' : 'Sonucu gör →', goster, 'dy-ileri');
        }, 'kr-btn');
      });
    }
    goster();
  })();
})();
