/* DON-301 H11 — BIOS/UEFI ve Önyükleme · ders betiği (ortak betikten sonra çalışır)
   Derse özel 2D animasyonlar (A-BOOT dahil) ve E-UEFI simülatörü. Marka-nötr: logo ve marka adı yok. */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  DERS.tahminKur('Tahminini aldık. Adım 2’de POST ışıklarıyla kontrol edeceğiz.');

  function el(etiket, sinif, ebeveyn, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(e);
    return e;
  }
  function bekle(sn) { return new Promise(function (r) { setTimeout(r, AZ ? 10 : sn * 1000); }); }
  function ses(ad) { try { if (D && D.ses) D.ses(ad); } catch (e) { /* ses isteğe bağlı */ } }
  function slaytAktif(id) { var s = document.getElementById(id); return !!(s && s.classList.contains('active')); }
  function iki(n) { return (n < 10 ? '0' : '') + n; }
  function saatMetni() { var d = new Date(); return iki(d.getHours()) + ':' + iki(d.getMinutes()) + ':' + iki(d.getSeconds()); }
  function tarihMetni() {
    var d = new Date(), g = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return g[d.getDay()] + ' ' + iki(d.getDate()) + '.' + iki(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  /* ─────────── Adım 1: BIOS ve UEFI karşılaştırması ─────────── */
  (function () {
    var kok = document.getElementById('firmware');
    if (!kok) return;
    var SATIR = [
      ['Dönem', '1980’ler – 2010’lar', 'Günümüz standardı', 'BIOS ilk kişisel bilgisayarlardan beri kullanıldı. 2010’lardan bu yana anakartlar UEFI ile gelir; günlük dilde UEFI’ye de hâlâ “BIOS” denir.'],
      ['İşlemci modu', '16-bit gerçek mod', '32/64-bit', 'BIOS kodu işlemcinin 16-bit gerçek modunda, 1 MB’lık adres alanında çalışır. UEFI 32 ya da 64-bit çalışır; sürücü ve küçük uygulamalar yükleyebilir.'],
      ['Önyükleme', 'MBR’deki kod', 'ESP’deki .efi dosyası', 'BIOS diskin ilk 512 baytını (MBR) belleğe alıp içindeki kodu çalıştırır. UEFI, FAT32 biçimli EFI sistem bölümündeki (ESP) önyükleyici dosyasını açar; önyükleme girdileri firmware’in NVRAM’inde tutulur.'],
      ['Disk düzeni', 'MBR', 'GPT (tipik)', 'MBR en çok 4 birincil bölüm tutar; 512 baytlık sektörlerle 2 TiB’a kadar adresler. GPT en az 128 bölüm girdisi tutar, 64-bit adres kullanır ve diskin sonunda yedek tablo saklar.'],
      ['Arayüz', 'Metin, klavye', 'Çoğunlukla grafik, fare', 'Grafik arayüz UEFI için zorunlu değildir; ama çoğu anakart fare destekli grafik ekran sunar.'],
      ['Güvenlik', 'İmza denetimi yok', 'Secure Boot', 'UEFI, önyükleyicinin dijital imzasını denetleyebilir (Secure Boot). BIOS’ta böyle bir denetim yoktur.']
    ];
    var MOD = {
      bios: { yol: ['Güç', 'POST', 'MBR · 1. sektör', 'Önyükleme kodu', 'İşletim sistemi'], disk: 'mbr', not: 'BIOS: diskin ilk sektöründeki kod çalışır.' },
      uefi: { yol: ['Güç', 'POST', 'GPT → ESP', '.efi önyükleyici', 'İşletim sistemi'], disk: 'gpt', not: 'UEFI: ESP’deki imzalı .efi dosyası yüklenir; Secure Boot kullanılabilir.' },
      csm: { yol: ['Güç', 'POST', 'CSM katmanı', 'MBR · 1. sektör', 'İşletim sistemi'], disk: 'mbr', not: 'UEFI + CSM: BIOS gibi (Legacy) önyükler; bu modda Secure Boot çalışmaz.' }
    };
    var DISK = {
      mbr: { bolum: [['MBR', '512 B', 'y'], ['Bölüm 1', '', ''], ['Bölüm 2', '', ''], ['Bölüm 3', '', ''], ['Bölüm 4', '', '']], not: 'MBR: en çok 4 birincil bölüm · 2 TiB sınırı' },
      gpt: { bolum: [['K-MBR', 'koruyucu', 'y'], ['GPT', 'başlık+tablo', 'y'], ['ESP', 'FAT32', 'e'], ['İS', '', ''], ['Veri', '', ''], ['Yedek', 'GPT', 'y']], not: 'GPT: 128+ bölüm girdisi · yedek tablo · çok büyük diskler' }
    };
    kok.innerHTML = '<div class="fw"><div class="secici fw-sec" role="group" aria-label="Firmware türü"></div><div class="fw-tablo"></div>' +
      '<div class="fw-alt"><div class="fw-yol" aria-label="Önyükleme yolu"></div><div class="fw-disk"><div class="fw-bar"></div><div class="fw-disk-not"></div></div></div>' +
      '<div class="fw-kart" aria-live="polite"></div></div>';
    var secK = kok.querySelector('.fw-sec'), tablo = kok.querySelector('.fw-tablo'), yolK = kok.querySelector('.fw-yol'),
      bar = kok.querySelector('.fw-bar'), diskNot = kok.querySelector('.fw-disk-not'), kart = kok.querySelector('.fw-kart');
    var bas = el('div', 'fw-satir fw-bas', tablo);
    el('span', '', bas, ''); el('b', 'fw-b bios', bas, 'BIOS (Legacy)'); el('b', 'fw-b uefi', bas, 'UEFI');
    var satirlar = SATIR.map(function (s, i) {
      var r = el('button', 'fw-satir', tablo); r.type = 'button';
      el('span', 'fw-ad', r, s[0]); el('span', 'fw-h bios', r, s[1]); el('span', 'fw-h uefi', r, s[2]);
      r.addEventListener('click', function () { satirSec(i); });
      return r;
    });
    function satirSec(i) {
      satirlar.forEach(function (r, j) { r.classList.toggle('secili', i === j); });
      kart.innerHTML = '<b></b><span></span>';
      kart.firstChild.textContent = SATIR[i][0];
      kart.lastChild.textContent = SATIR[i][3];
    }
    var dugmeler = {};
    [['bios', 'BIOS'], ['uefi', 'UEFI'], ['csm', 'UEFI + CSM']].forEach(function (m) {
      dugmeler[m[0]] = DERS.dugme(secK, m[1], function () { modSec(m[0]); });
    });
    var aktifMod = null;
    function modSec(ad) {
      Object.keys(dugmeler).forEach(function (k) { dugmeler[k].setAttribute('aria-pressed', k === ad ? 'true' : 'false'); });
      if (ad === aktifMod) return;
      aktifMod = ad;
      tablo.className = 'fw-tablo vurgu-' + (ad === 'bios' ? 'bios' : 'uefi');
      var m = MOD[ad];
      yolK.innerHTML = '';
      m.yol.forEach(function (a, i) {
        if (i) el('span', 'fw-ok', yolK, '→');
        var c = el('span', 'fw-adim' + (ad === 'csm' && i === 2 ? ' csm' : ''), yolK, a);
        c.style.animationDelay = (AZ ? 0 : i * 0.18) + 's';
      });
      var n = el('div', 'fw-yol-not', yolK, m.not);
      n.style.animationDelay = (AZ ? 0 : 1) + 's';
      var d = DISK[m.disk];
      bar.innerHTML = '';
      d.bolum.forEach(function (b) {
        var p = el('span', 'fw-bol ' + b[2], bar);
        el('b', '', p, b[0]); if (b[1]) el('small', '', p, b[1]);
      });
      diskNot.textContent = d.not;
    }
    modSec('bios'); satirSec(2);
    DERS.slaytAcilinca('s5', function () {
      if (AZ) return;
      var sira = [['uefi', 3], ['uefi', 5], ['csm', 2], ['uefi', 2]], i = 0;
      (function dongu() { if (i < sira.length && slaytAktif('s5')) { modSec(sira[i][0]); satirSec(sira[i][1]); i++; setTimeout(dongu, 2600); } })();
    });
  })();

  /* ─────────── Adım 2: A-BOOT — POST ve hata ışıkları ─────────── */
  (function () {
    var kok = document.getElementById('aboot');
    if (!kok) return;
    var ISIK = ['CPU', 'DRAM', 'VGA', 'BOOT'];
    var SEN = {
      normal: { ad: 'Sorunsuz', takil: -1 },
      cpu: { ad: 'CPU gücü yok', takil: 0, sonuc: 'Takıldı: CPU. İşlemci güç kablosu (EPS 8-pin), işlemcinin sokete oturması ve soğutucu montajı kontrol edilir.' },
      dram: { ad: 'RAM oturmamış', takil: 1, sonuc: 'Takıldı: DRAM. Modüller yuvaya tam oturmalı, mandallar kapanmalı; kılavuzdaki önerilen yuvalar kullanılmalı.' },
      vga: { ad: 'Görüntü kartı', takil: 2, sonuc: 'Takıldı: VGA. Ekran kartı yuvaya oturmuş mu, ek güç kablosu takılı mı, monitör kablosu doğru çıkışta mı?' },
      boot: { ad: 'Disk yok', takil: 3, sonuc: 'Takıldı: BOOT. POST bitti ama önyüklenebilir aygıt yok: disk bağlantısı, önyükleme sırası ve modu (UEFI/Legacy) kontrol edilir.' }
    };
    var AS = ['Güç', 'POST', 'UEFI', 'Önyükleyici', 'İS'];
    var P = 'class="ab-p" fill="#1f2937" stroke="#94a3b8" stroke-width="1.5"';
    var svg = '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Anakart: işlemci soketi, bellek yuvaları, ekran kartı yuvası, M.2 ve SATA bağlantıları; sağ üstte CPU, DRAM, VGA ve BOOT hata ışıkları">' +
      '<rect x="2" y="2" width="316" height="196" rx="10" fill="#14532d" stroke="#166534" stroke-width="2"/>' +
      '<g stroke="#22c55e" stroke-opacity=".18">' + [30, 60, 90, 120, 150, 180].map(function (y) { return '<path d="M6 ' + y + 'H314"/>'; }).join('') + '</g>' +
      '<g class="ab-parca" data-p="0"><rect x="28" y="24" width="78" height="78" rx="6" ' + P + '/><rect x="42" y="38" width="50" height="50" rx="3" fill="#374151"/><text x="67" y="68" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="800" fill="#e5e7eb" text-anchor="middle">CPU</text></g>' +
      '<rect x="112" y="16" width="16" height="10" rx="2" fill="#1f2937" stroke="#64748b"/><text x="120" y="12" font-family="Inter,Arial,sans-serif" font-size="7" font-weight="700" fill="#bbf7d0" text-anchor="middle">EPS</text>' +
      '<g class="ab-parca" data-p="1">' + [140, 152, 164, 176].map(function (x) { return '<rect x="' + x + '" y="18" width="7" height="100" rx="2" ' + P + '/>'; }).join('') +
      '<text x="162" y="130" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="800" fill="#e5e7eb" text-anchor="middle">RAM</text></g>' +
      '<g class="ab-parca" data-p="2"><rect x="24" y="140" width="160" height="12" rx="3" ' + P + '/><text x="104" y="167" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="800" fill="#e5e7eb" text-anchor="middle">PCIe x16 · ekran kartı</text></g>' +
      '<g class="ab-parca" data-p="3"><rect x="196" y="160" width="84" height="14" rx="3" ' + P + '/><text x="238" y="190" font-family="Inter,Arial,sans-serif" font-size="8.5" font-weight="800" fill="#e5e7eb" text-anchor="middle">M.2 · SATA (disk)</text>' +
      '<rect x="290" y="126" width="18" height="10" rx="2" ' + P + '/><rect x="290" y="142" width="18" height="10" rx="2" ' + P + '/></g>' +
      '<rect x="292" y="20" width="16" height="84" rx="3" fill="#1f2937" stroke="#64748b"/><text x="300" y="116" font-family="Inter,Arial,sans-serif" font-size="7" font-weight="700" fill="#bbf7d0" text-anchor="middle">24-pin</text>' +
      '<rect x="206" y="20" width="76" height="104" rx="8" fill="#0f172a" fill-opacity=".55" stroke="#4ade80" stroke-opacity=".4"/>' +
      '<text x="244" y="34" font-family="Inter,Arial,sans-serif" font-size="7.5" font-weight="800" fill="#bbf7d0" text-anchor="middle">HATA IŞIKLARI</text>' +
      ISIK.map(function (a, i) {
        var y = 52 + i * 21;
        return '<g class="ab-led" data-l="' + i + '"><circle class="ab-halo" cx="222" cy="' + y + '" r="9"/><circle class="ab-lamba" cx="222" cy="' + y + '" r="6"/>' +
          '<text x="236" y="' + (y + 3.5) + '" font-family="JetBrains Mono,Consolas,monospace" font-size="9" font-weight="800" fill="#e2e8f0">' + a + '</text></g>';
      }).join('') + '</svg>';
    kok.innerHTML = '<ol class="ab-zincir">' + AS.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ol>' +
      '<div class="ab-orta"><div class="ab-kart">' + svg + '</div><div class="ab-sag"><div class="ab-ekran"><div class="ab-ekran-ic"></div></div><div class="ab-bip" aria-live="polite"></div></div></div>' +
      '<div class="secici ab-sen" role="group" aria-label="Senaryo"></div>' +
      '<div class="ab-tahmin" hidden><span>Tahmin: hangi ışıkta takılır?</span><div class="secici"></div></div>' +
      '<div class="panel-sonuc ab-sonuc" aria-live="polite"></div>';
    var zincir = kok.querySelectorAll('.ab-zincir li'), ledler = kok.querySelectorAll('.ab-led'), parcalar = kok.querySelectorAll('.ab-parca'),
      ekran = kok.querySelector('.ab-ekran-ic'), bip = kok.querySelector('.ab-bip'), sonuc = kok.querySelector('.ab-sonuc'),
      tahminK = kok.querySelector('.ab-tahmin'), senK = kok.querySelector('.ab-sen');
    var calisiyor = 0, tahmin = null;
    function zincirAyar(aktif, hata) {
      zincir.forEach(function (li, i) {
        li.className = i < aktif ? 'bitti' : (i === aktif ? (hata ? 'hata' : 'aktif') : '');
      });
    }
    function ledAyar(i, durum) { ledler[i].setAttribute('class', 'ab-led' + (durum ? ' ' + durum : '')); }
    function parcaAyar(i, durum) { parcalar.forEach(function (p, j) { p.setAttribute('class', 'ab-parca' + (j === i && durum ? ' ' + durum : '')); }); }
    function ekranYaz(satirlar, tur) {
      ekran.className = 'ab-ekran-ic' + (tur ? ' ' + tur : '');
      ekran.innerHTML = '';
      satirlar.forEach(function (s) { el('div', '', ekran, s); });
    }
    function sifirla() {
      zincirAyar(-1); for (var i = 0; i < 4; i++) ledAyar(i, ''); parcaAyar(-1);
      ekranYaz(['Sinyal yok'], 'bos'); bip.textContent = '';
    }
    var ONAY = ['İşlemci ✓ 8 çekirdek', 'Bellek ✓ 32 GB', 'Ekran kartı ✓ PCIe x16', 'Depolama ✓ NVMe SSD'];
    function oynat(ad) {
      var no = ++calisiyor, sen = SEN[ad];
      function surmu() { return no === calisiyor; }
      sifirla(); sonuc.textContent = '';
      senK.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.s === ad ? 'true' : 'false'); });
      var z = Promise.resolve().then(function () { zincirAyar(0); sonuc.textContent = 'Güç kaynağı “güç iyi” sinyali verdi; işlemci firmware’i çalıştırıyor.'; return bekle(1.1); })
        .then(function () { if (!surmu()) throw 0; zincirAyar(1); });
      ISIK.forEach(function (a, i) {
        z = z.then(function () {
          if (!surmu()) throw 0;
          ledAyar(i, 'yanik'); parcaAyar(i, 'vurgu'); sonuc.textContent = 'POST: ' + a + ' denetleniyor…';
          return bekle(1.0);
        }).then(function () {
          if (!surmu()) throw 0;
          if (sen.takil === i) throw 'takil';
          ledAyar(i, ''); parcaAyar(-1);
          if (i >= 2) ekranYaz(ONAY.slice(0, i + 1));
        });
      });
      z.then(function () {
        if (!surmu()) return;
        bip.textContent = '♪ Birçok sistemde tek kısa bip: POST tamam';
        zincirAyar(2); sonuc.textContent = 'UEFI: ayarlar yüklendi, önyükleme sırasındaki ilk aygıta bakılıyor.';
        ekranYaz(ONAY.concat(['UEFI’ye girmek için ekrandaki tuş (ör. Del / F2)']));
        return bekle(1.4).then(function () {
          if (!surmu()) return;
          zincirAyar(3); ekranYaz(['NVMe SSD → ESP', '.efi önyükleyici yükleniyor…'], 'yukle'); sonuc.textContent = 'Önyükleyici bulundu ve belleğe yüklendi.';
          return bekle(1.4);
        }).then(function () {
          if (!surmu()) return;
          zincirAyar(5); ekranYaz(['İşletim sistemi başlıyor'], 'is');
          sonuc.textContent = 'Zincir tamam: Güç → POST → UEFI → Önyükleyici → İS. Şimdi bir arıza seç.';
          ses('klik');
        });
      }).catch(function (x) {
        if (x !== 'takil' || !surmu()) return;
        var i = sen.takil;
        ledAyar(i, 'hata'); parcaAyar(i, 'hata');
        if (i === 3) {
          zincirAyar(3, true);
          ekranYaz(ONAY.slice(0, 3).concat(['Önyüklenebilir aygıt bulunamadı.', 'Aygıtı takın ya da UEFI’ye girin.']), 'uyari');
          bip.textContent = 'Ekranda uyarı iletisi (POST tamamlandı)';
        } else {
          zincirAyar(1, true);
          ekranYaz(['Sinyal yok'], 'bos');
          bip.textContent = '♪ Hoparlör takılıysa uyarı bip dizisi: anlamı kılavuzda';
        }
        var on = '';
        if (tahmin != null) on = (tahmin === i ? '✓ Işık tahminin doğru. ' : '✗ Işık tahminin ' + ISIK[tahmin] + ' idi. ');
        var metin = on + sen.sonuc;
        if (ad === 'dram' && DERS.tahmin != null) metin += ' ' + DERS.tahminNotu(1, 'Isınmadaki ekran buydu.', 'Isınmadaki ekranın nedeni buydu.').replace(/^Tahminin:/, 'Isınma tahminin:');
        sonuc.textContent = metin;
        ses('hata');
      });
    }
    var tahminDugmeleri = [], bekleyen = null;
    ISIK.forEach(function (a, i) {
      tahminDugmeleri.push(DERS.dugme(tahminK.querySelector('.secici'), a, function () {
        tahmin = i; tahminK.hidden = true; if (bekleyen) oynat(bekleyen);
      }));
    });
    Object.keys(SEN).forEach(function (k) {
      var b = DERS.dugme(senK, SEN[k].ad, function () {
        calisiyor++; tahmin = null;
        if (k === 'normal') { tahminK.hidden = true; oynat(k); return; }
        bekleyen = k; sifirla();
        senK.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        tahminK.hidden = false; sonuc.textContent = 'Önce tahmin et: bu arızada hangi ışık yanık kalır?';
        tahminDugmeleri[0].focus();
      });
      b.dataset.s = k;
    });
    sifirla();
    sonuc.textContent = 'Bir senaryo seç ya da “Sorunsuz” açılışı izle.';
    DERS.slaytAcilinca('s6', function () { setTimeout(function () { if (slaytAktif('s6')) oynat('normal'); }, AZ ? 0 : 500); });
  })();

  /* ─────────── Adım 3: UEFI ana ekranı (donanım bilgisi) ─────────── */
  (function () {
    var kok = document.getElementById('uefi-ana');
    if (!kok) return;
    var ekranK = kok.querySelector('.u3-ekran'), kart = kok.querySelector('.u3-kart');
    var S = [
      ['Firmware sürümü', function () { return '1.20 · 14.03.2026'; }, 'Güncelleme gerekip gerekmediğini gösterir. Güncellemeyi öğretmen ya da BT sorumlusu yapar: işlem sırasında elektrik kesilirse anakart açılmaz hâle gelebilir.'],
      ['İşlemci', function () { return '8 çekirdek · 3,8 GHz'; }, 'Takılan işlemci doğru tanınmalı. Tanınmıyorsa firmware sürümü bu işlemciyi desteklemiyor olabilir.'],
      ['İşlemci sıcaklığı', function () { return (40 + Math.round(Math.random() * 3)) + ' °C'; }, 'Boştayken hızla yükselen sıcaklık; soğutucunun oturmadığını ya da fan kablosunun takılmadığını düşündürür.'],
      ['Toplam bellek', function () { return '32 GB (2 × 16 GB)'; }, 'Taktığın toplamı görmelisin. Eksik görünüyorsa bir modül tam oturmamış olabilir.'],
      ['Bellek hızı', function () { return '4800 MT/s'; }, 'Etiketteki hızdan düşükse bellek profili (XMP/EXPO) kapalıdır. Ayrıntı Adım 5’te.'],
      ['Depolama', function () { return 'NVMe SSD 512 GB'; }, 'Disk burada yoksa işletim sistemi kurulamaz: M.2 yuvası ya da SATA veri ve güç kabloları kontrol edilir.'],
      ['Sistem saati', function () { return tarihMetni() + ' · ' + saatMetni(); }, 'Saat, fiş çekiliyken anakarttaki düğme pil ile çalışır. Her açılışta saat sıfırlanıyorsa pil bitmiş olabilir.']
    ];
    ekranK.innerHTML = '<div class="u3-ust"><span>UEFI Ayarları · Ana</span><span class="u3-saat"></span></div><div class="u3-liste"></div>';
    var liste = ekranK.querySelector('.u3-liste'), saatEl = ekranK.querySelector('.u3-saat');
    var satirlar = S.map(function (s, i) {
      var r = el('button', 'u3-satir', liste); r.type = 'button';
      el('span', '', r, s[0]); el('b', '', r, s[1]());
      r.addEventListener('click', function () { sec(i); });
      return r;
    });
    function sec(i) {
      satirlar.forEach(function (r, j) { r.classList.toggle('secili', i === j); });
      kart.innerHTML = '<b></b><span></span>';
      kart.firstChild.textContent = 'Neden bakarız? · ' + S[i][0];
      kart.lastChild.textContent = S[i][2];
    }
    function tazele() {
      saatEl.textContent = saatMetni();
      satirlar[6].lastChild.textContent = S[6][1]();
      if (Math.random() < 0.25) satirlar[2].lastChild.textContent = S[2][1]();
    }
    tazele(); sec(3);
    setInterval(function () { if (slaytAktif('s7')) tazele(); }, 1000);
    DERS.slaytAcilinca('s7', function () {
      if (AZ) return;
      var sira = [0, 1, 3, 4, 5, 6], i = 0;
      (function dongu() { if (i < sira.length && slaytAktif('s7')) { sec(sira[i++]); setTimeout(dongu, 2200); } })();
    });
  })();

  /* ─────────── Adım 4: önyükleme sırası ve mod ─────────── */
  (function () {
    var kok = document.getElementById('bootsira');
    if (!kok) return;
    var AYG = {
      nvme: { ad: 'NVMe SSD 512 GB', alt: 'GPT · ESP’de .efi önyükleyici', uefi: true, legacy: false, sonuc: 'Kurulu işletim sistemi açılır.' },
      usb: { ad: 'USB bellek 16 GB', alt: 'Kurulum belleği · \\EFI\\BOOT\\BOOTX64.EFI + MBR kodu', uefi: true, legacy: true, sonuc: 'Kurulum ekranı açılır.' },
      hdd: { ad: 'SATA HDD 1 TB', alt: 'MBR · eski (Legacy) kurulum', uefi: false, legacy: true, sonuc: 'Eski sistem Legacy modda açılır.' }
    };
    var sira = ['nvme', 'usb', 'hdd'], mod = 'uefi', calisiyor = false;
    kok.innerHTML = '<div class="bs"><div class="bs-ust"><span>Önyükleme modu</span><div class="secici bs-mod" role="group" aria-label="Önyükleme modu"></div></div>' +
      '<ol class="bs-liste"></ol><div class="bs-alt"><div class="secici bs-kontrol"></div><div class="panel-sonuc bs-sonuc" aria-live="polite"></div></div></div>';
    var liste = kok.querySelector('.bs-liste'), sonuc = kok.querySelector('.bs-sonuc'), modK = kok.querySelector('.bs-mod');
    var modD = {
      uefi: DERS.dugme(modK, 'Yalnız UEFI', function () { modSec('uefi'); }),
      legacy: DERS.dugme(modK, 'Legacy (CSM)', function () { modSec('legacy'); })
    };
    function modSec(m) {
      if (calisiyor) return;
      mod = m;
      Object.keys(modD).forEach(function (k) { modD[k].setAttribute('aria-pressed', k === m ? 'true' : 'false'); });
      ciz();
      sonuc.textContent = m === 'uefi' ? 'UEFI modu: her aygıtta .efi önyükleyici aranır.' : 'Legacy (CSM) modu: her aygıtta MBR’deki önyükleme kodu aranır. Secure Boot bu modda çalışmaz.';
    }
    function tasi(i, yon) {
      if (calisiyor) return;
      var j = i + yon; if (j < 0 || j >= sira.length) return;
      var t = sira[i]; sira[i] = sira[j]; sira[j] = t; ciz();
      liste.children[j].classList.add('tasindi');
      sonuc.textContent = AYG[sira[0]].ad + ' artık 1. sırada.';
    }
    function ciz() {
      liste.innerHTML = '';
      sira.forEach(function (k, i) {
        var a = AYG[k], li = el('li', 'bs-aygit', liste);
        li.dataset.k = k;
        el('span', 'bs-no', li, String(i + 1));
        var m = el('div', 'bs-metin', li);
        el('b', '', m, a.ad); el('small', '', m, a.alt);
        var r = el('div', 'bs-rozet', m);
        el('span', 'bs-r ' + (a.uefi ? 'var' : 'yok') + (mod === 'uefi' ? ' ilgili' : ''), r, (a.uefi ? '✓' : '✗') + ' UEFI önyükleyici');
        el('span', 'bs-r ' + (a.legacy ? 'var' : 'yok') + (mod === 'legacy' ? ' ilgili' : ''), r, (a.legacy ? '✓' : '✗') + ' MBR kodu');
        var dd = el('div', 'bs-tasi', li);
        var y = DERS.dugme(dd, '▲', function () { tasi(i, -1); }); y.setAttribute('aria-label', a.ad + ' yukarı'); y.disabled = i === 0;
        var s = DERS.dugme(dd, '▼', function () { tasi(i, 1); }); s.setAttribute('aria-label', a.ad + ' aşağı'); s.disabled = i === sira.length - 1;
        el('span', 'bs-durum', li, '');
      });
    }
    function dene() {
      if (calisiyor) return; calisiyor = true;
      ciz();
      var lis = liste.children, z = Promise.resolve(), bulundu = false;
      sira.forEach(function (k, i) {
        z = z.then(function () {
          if (bulundu) return;
          lis[i].classList.add('deneniyor'); lis[i].querySelector('.bs-durum').textContent = 'deneniyor…';
          sonuc.textContent = (i + 1) + '. aygıt deneniyor: ' + AYG[k].ad;
          return bekle(1.1).then(function () {
            var a = AYG[k], tamam = mod === 'uefi' ? a.uefi : a.legacy;
            lis[i].classList.remove('deneniyor');
            lis[i].classList.add(tamam ? 'acildi' : 'atlandi');
            lis[i].querySelector('.bs-durum').textContent = tamam ? '✓ açılıyor' : '✗ atlandı';
            if (tamam) { bulundu = true; sonuc.textContent = '✓ ' + a.ad + ': ' + a.sonuc; ses('klik'); }
            else sonuc.textContent = '✗ ' + a.ad + ': ' + (mod === 'uefi' ? 'UEFI önyükleyici yok, sıradakine geçiliyor.' : 'MBR önyükleme kodu yok, sıradakine geçiliyor.');
            return bekle(0.6);
          });
        });
      });
      z.then(function () {
        if (!bulundu) sonuc.textContent = 'Hiçbir aygıtta geçerli önyükleyici yok: “önyüklenebilir aygıt bulunamadı”.';
        calisiyor = false;
      });
    }
    var ctl = kok.querySelector('.bs-kontrol');
    DERS.dugme(ctl, 'Açılışı dene ▶', dene);
    DERS.dugme(ctl, 'Baştan', function () { if (calisiyor) return; sira = ['nvme', 'usb', 'hdd']; modSec('uefi'); });
    modSec('uefi');
    sonuc.textContent = 'Kurulum için USB belleği öne al, sonra “Açılışı dene”. Legacy modunu da dene.';
    DERS.slaytAcilinca('s8', function () { setTimeout(function () { if (slaytAktif('s8')) dene(); }, AZ ? 0 : 500); });
  })();

  /* ─────────── Adım 5: XMP/EXPO bellek profili ─────────── */
  (function () {
    var kok = document.getElementById('xmp');
    if (!kok) return;
    var PR = [
      { ad: 'JEDEC (varsayılan)', mts: 4800, cl: 40, v: '1,10 V' },
      { ad: 'XMP/EXPO Profil 1', mts: 6000, cl: 30, v: '1,35 V' }
    ];
    var ram = '<svg viewBox="0 0 300 70" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DDR5 bellek modülü: bellek yongaları, etiket ve profilleri saklayan SPD yongası">' +
      '<rect x="4" y="6" width="292" height="50" rx="3" fill="#166534"/>' +
      [14, 48, 82, 170, 204, 238].map(function (x) { return '<rect x="' + x + '" y="14" width="28" height="22" rx="2" fill="#0f172a"/>'; }).join('') +
      '<rect x="118" y="12" width="46" height="26" rx="2" fill="#f8fafc"/><text x="141" y="23" font-family="JetBrains Mono,Consolas,monospace" font-size="7" font-weight="800" fill="#0f172a" text-anchor="middle">DDR5-6000</text>' +
      '<text x="141" y="33" font-family="JetBrains Mono,Consolas,monospace" font-size="6.5" font-weight="700" fill="#334155" text-anchor="middle">16 GB</text>' +
      '<g class="xm-spd"><rect x="272" y="40" width="14" height="10" rx="1.5" fill="#0f172a" stroke="#facc15" stroke-width="1.5"/><text x="262" y="49" font-family="Inter,Arial,sans-serif" font-size="7" font-weight="800" fill="#fef08a" text-anchor="end">SPD</text></g>' +
      '<rect x="4" y="56" width="292" height="8" fill="#eab308"/><rect x="150" y="54" width="6" height="12" fill="#e0f2fe"/></svg>';
    kok.innerHTML = '<div class="xm"><div class="xm-ram">' + ram + '</div><div class="xm-profiller"></div><div class="secici xm-sec" role="group" aria-label="Bellek profili"></div>' +
      '<div class="xm-olcum"></div><div class="panel-sonuc xm-sonuc" aria-live="polite"></div></div>';
    var prK = kok.querySelector('.xm-profiller'), olcum = kok.querySelector('.xm-olcum'), sonuc = kok.querySelector('.xm-sonuc'), secK = kok.querySelector('.xm-sec');
    var kartlar = PR.map(function (p) {
      var k = el('div', 'xm-profil', prK);
      el('b', '', k, p.ad);
      el('span', '', k, p.mts + ' MT/s · CL' + p.cl + ' · ' + p.v);
      return k;
    });
    var OL = [
      ['Veri aktarımı', function (p) { return p.mts; }, ' MT/s', 6000, 0],
      ['Bellek saati', function (p) { return p.mts / 2; }, ' MHz', 3000, 0],
      ['Tepe bant genişliği (modül)', function (p) { return p.mts * 8 / 1000; }, ' GB/s', 48, 1],
      ['CAS gecikmesi (düşük = iyi)', function (p) { return p.cl / (p.mts / 2) * 1000; }, ' ns', 20, 1]
    ];
    var satir = OL.map(function (o) {
      var r = el('div', 'xm-satir', olcum);
      el('span', 'xm-ad', r, o[0]);
      var b = el('div', 'xm-bar', r); el('i', '', b);
      el('code', '', r, '');
      return r;
    });
    var simdi = null, anim = 0;
    function yaz(p, oran) {
      OL.forEach(function (o, i) {
        var hedef = o[1](p), onceki = simdi ? o[1](simdi) : hedef, v = onceki + (hedef - onceki) * oran;
        satir[i].querySelector('i').style.width = Math.min(100, v / o[3] * 100).toFixed(1) + '%';
        satir[i].querySelector('code').textContent = v.toFixed(o[4]).replace('.', ',') + o[2];
      });
    }
    var dg = [];
    function sec(i) {
      dg.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      kartlar.forEach(function (k, j) { k.classList.toggle('secili', i === j); });
      kok.querySelector('.xm-spd').setAttribute('class', 'xm-spd' + (i ? ' parla' : ''));
      var p = PR[i], no = ++anim, t0 = null, sure = AZ ? 1 : 900;
      function adim(t) {
        if (no !== anim) return;
        if (t0 == null) t0 = t;
        var o = Math.min(1, (t - t0) / sure);
        yaz(p, 1 - Math.pow(1 - o, 3));
        if (o < 1) requestAnimationFrame(adim); else simdi = p;
      }
      requestAnimationFrame(adim);
      sonuc.textContent = i ? 'Profil 1: 6000 MT/s. Bant genişliği %25 arttı, gecikme 16,7 ns’den 10 ns’ye indi.' : 'Profil kapalı: bellek güvenli JEDEC hızında (4800 MT/s) çalışıyor.';
    }
    dg.push(DERS.dugme(secK, 'Profil kapalı', function () { sec(0); }));
    dg.push(DERS.dugme(secK, 'Profil 1 (XMP/EXPO)', function () { sec(1); }));
    simdi = PR[0]; yaz(PR[0], 1); sec(0);
    sonuc.textContent = 'DDR: her saat vuruşunda 2 aktarım. Tahminini yap, sonra profili aç.';
    DERS.slaytAcilinca('s9', function () { setTimeout(function () { if (slaytAktif('s9')) sec(1); }, AZ ? 0 : 2200); });
  })();

  /* ─────────── Adım 6: Secure Boot ve TPM ─────────── */
  (function () {
    var kok = document.getElementById('guvenli');
    if (!kok) return;
    var SEN = [
      { ad: 'İmzalı önyükleyici', sb: true, imzali: true },
      { ad: 'Değiştirilmiş · SB açık', sb: true, imzali: false },
      { ad: 'Değiştirilmiş · SB kapalı', sb: false, imzali: false }
    ];
    var IK = {
      fw: '<svg class="sg-ik" viewBox="0 0 48 48" aria-hidden="true"><rect x="11" y="11" width="26" height="26" rx="4" fill="#312e81"/>' +
        [16, 22, 28].map(function (v) { return '<path d="M' + v + ' 5v6M' + v + ' 37v6M5 ' + v + 'h6M37 ' + v + 'h6" stroke="#64748b" stroke-width="2.5"/>'; }).join('') +
        '<circle cx="21" cy="24" r="4.5" fill="none" stroke="#fde68a" stroke-width="2.5"/><path d="M25 24h7M29 24v4" stroke="#fde68a" stroke-width="2.5"/></svg>',
      bl: '<svg class="sg-ik" viewBox="0 0 48 48" aria-hidden="true"><path d="M12 5h17l8 8v30H12z" fill="#fff" stroke="#475569" stroke-width="2"/><path d="M29 5v8h8" fill="none" stroke="#475569" stroke-width="2"/>' +
        '<path d="M17 18h14M17 23h14M17 28h8" stroke="#94a3b8" stroke-width="2"/><circle cx="31" cy="36" r="7" fill="#6366f1"/><path d="M28 36l2 2 4-4" stroke="#fff" stroke-width="2" fill="none"/></svg>',
      is: '<svg class="sg-ik" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="8" width="38" height="26" rx="3" fill="#0f172a"/><rect x="9" y="12" width="30" height="18" rx="1.5" fill="#4f46e5"/>' +
        '<path d="M20 34h8v5h-8zM15 40h18" stroke="#475569" stroke-width="2.5" fill="#475569"/></svg>'
    };
    kok.innerHTML = '<div class="sg"><div class="sg-zincir">' +
      '<div class="sg-kutu" data-k="fw">' + IK.fw + '<b>Firmware</b><small>güvenilir anahtarlar (db)</small><span class="sg-d"></span></div><span class="sg-ok">→</span>' +
      '<div class="sg-kutu" data-k="bl">' + IK.bl + '<b>Önyükleyici</b><small class="sg-imza">dijital imza</small><span class="sg-d"></span></div><span class="sg-ok">→</span>' +
      '<div class="sg-kutu" data-k="is">' + IK.is + '<b>İşletim sistemi</b><small>şifreli disk</small><span class="sg-d"></span></div></div>' +
      '<div class="sg-tpm"><div class="sg-cip"><b>TPM</b><small>çip ya da firmware TPM</small></div><div class="sg-olcum"><span>Açılış ölçümleri</span><code class="sg-pcr">—</code></div>' +
      '<div class="sg-anahtar"><span>Disk anahtarı</span><b class="sg-ak">bekliyor</b></div></div>' +
      '<div class="secici sg-sec" role="group" aria-label="Senaryo"></div><div class="panel-sonuc sg-sonuc" aria-live="polite"></div></div>';
    var kutu = {}; kok.querySelectorAll('.sg-kutu').forEach(function (k) { kutu[k.dataset.k] = k; });
    var pcr = kok.querySelector('.sg-pcr'), ak = kok.querySelector('.sg-ak'), sonuc = kok.querySelector('.sg-sonuc'),
      imza = kok.querySelector('.sg-imza'), olcumK = kok.querySelector('.sg-olcum'), anahtarK = kok.querySelector('.sg-anahtar'), secK = kok.querySelector('.sg-sec');
    var no = 0, dg = [];
    function durum(k, sinif, metin) { kutu[k].className = 'sg-kutu' + (sinif ? ' ' + sinif : ''); kutu[k].querySelector('.sg-d').textContent = metin || ''; }
    function sifirla() {
      ['fw', 'bl', 'is'].forEach(function (k) { durum(k, '', ''); });
      pcr.textContent = '—'; ak.textContent = 'bekliyor'; olcumK.className = 'sg-olcum'; anahtarK.className = 'sg-anahtar';
    }
    function oynat(i) {
      var n = ++no, s = SEN[i];
      function sur() { if (n !== no) throw 0; }
      dg.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      sifirla();
      imza.textContent = s.imzali ? 'imza: geçerli' : 'dosya değiştirilmiş';
      Promise.resolve().then(function () {
        durum('fw', 'aktif', 'çalışıyor'); pcr.textContent = 'ölçüm 1: firmware'; olcumK.className = 'sg-olcum aktif';
        sonuc.textContent = 'Firmware çalıştı; TPM her aşamanın özetini (ölçüm) kaydediyor.';
        return bekle(1.3);
      }).then(function () {
        sur(); durum('fw', 'tamam', '✓'); durum('bl', 'aktif', s.sb ? 'imza denetleniyor…' : 'denetim yok');
        pcr.textContent = 'ölçüm 2: önyükleyici';
        sonuc.textContent = s.sb ? 'Secure Boot: önyükleyicinin imzası db’deki anahtarlarla karşılaştırılıyor.' : 'Secure Boot kapalı: imza hiç denetlenmiyor.';
        return bekle(1.4);
      }).then(function () {
        sur();
        if (s.sb && !s.imzali) {
          durum('bl', 'hata', '✗ imza geçersiz'); durum('is', 'kapali', 'başlatılmadı');
          sonuc.textContent = '✗ Secure Boot önyüklemeyi durdurdu: değiştirilmiş önyükleyici çalıştırılmadı. Sistem korundu.';
          ses('hata'); throw 0;
        }
        durum('bl', s.sb ? 'tamam' : 'uyari', s.sb ? '✓ imza geçerli' : '! çalıştı (denetimsiz)');
        return bekle(1.2);
      }).then(function () {
        sur();
        var ayni = s.imzali;
        olcumK.className = 'sg-olcum ' + (ayni ? 'tamam' : 'hata');
        pcr.textContent = ayni ? 'ölçümler beklenenle aynı ✓' : 'ölçümler farklı ✗';
        anahtarK.className = 'sg-anahtar ' + (ayni ? 'tamam' : 'hata');
        ak.textContent = ayni ? 'verildi' : 'verilmedi';
        if (ayni) {
          durum('is', 'tamam', '✓ açıldı');
          sonuc.textContent = '✓ İmza geçerli, ölçümler tutarlı: TPM disk anahtarını verdi ve sistem açıldı.';
          ses('klik');
        } else {
          durum('is', 'uyari', 'kurtarma anahtarı istendi');
          sonuc.textContent = '! Önyükleyici çalıştı ama TPM zincirdeki değişikliği fark etti: disk anahtarını vermedi, kurtarma anahtarı istendi. Disk şifreli değilse değişiklik fark edilmezdi.';
        }
      }).catch(function () { /* senaryo durdu ya da değişti */ });
    }
    SEN.forEach(function (s, i) { dg.push(DERS.dugme(secK, s.ad, function () { oynat(i); })); });
    sifirla(); sonuc.textContent = 'Bir senaryo seç ve zinciri izle.';
    DERS.slaytAcilinca('s10', function () { setTimeout(function () { if (slaytAktif('s10')) oynat(0); }, AZ ? 0 : 500); });
  })();

  /* ─────────── Etkinlik 1: E-UEFI — marka-nötr UEFI simülatörü ─────────── */
  (function () {
    var kok = document.getElementById('uefi-sim');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var gorevLi = document.querySelectorAll('#uf-gorevler li');
    var VARSAYILAN = { xmp: 0, fan: 0, csm: 0, hizli: 0, sira: ['nvme', 'usb', 'pxe'], sb: 1, tpm: 1 };
    function kopya(o) { return JSON.parse(JSON.stringify(o)); }
    var S = kopya(VARSAYILAN), kayitli = kopya(VARSAYILAN);
    var G = { saat: false, csm: false, sbOku: false, tpmOku: false, kaydet: false };
    var AYGIT = { nvme: 'NVMe SSD 512 GB (İS önyükleyicisi)', usb: 'USB bellek 16 GB (UEFI)', pxe: 'Ağ önyüklemesi (PXE)' };
    var KISA = { nvme: 'NVMe SSD', usb: 'USB bellek', pxe: 'Ağ (PXE)' };
    var SEKME = [['ana', 'Ana', 'Main'], ['gel', 'Gelişmiş', 'Advanced'], ['boot', 'Önyükleme', 'Boot'], ['guv', 'Güvenlik', 'Security'], ['cik', 'Çıkış', 'Exit']];
    var ETIKET = {
      xmp: ['Kapalı (JEDEC 4800 MT/s)', 'Profil 1 · DDR5-6000 · 1,35 V'], fan: ['Otomatik', 'Sessiz', 'Tam hız'],
      csm: ['Kapalı', 'Açık'], hizli: ['Kapalı', 'Açık'], sb: ['Devre dışı', 'Etkin'], tpm: ['Devre dışı', 'Etkin']
    };
    var AD = { xmp: 'Bellek profili (XMP/EXPO)', fan: 'Fan denetimi', csm: 'CSM (Legacy desteği)', hizli: 'Hızlı önyükleme', sb: 'Secure Boot', tpm: 'TPM 2.0' };
    var UYARI = {
      csm1: 'Uyarı: CSM açılınca Legacy önyükleme mümkün olur ama Secure Boot bu modda çalışmaz. UEFI ile kurulu sistem için gerekmez; “Kapalı”ya geri al.',
      hizli1: 'Uyarı: Hızlı önyüklemede USB aygıtları geç başlatılabilir; açılışta UEFI’ye girmek zorlaşır. Derste kapalı kalsın.',
      sb0: 'Uyarı: Secure Boot kapatılırsa imzasız ya da değiştirilmiş önyükleyiciler de çalışır. Okul bilgisayarında kapatılmaz; “Etkin”e geri al.',
      tpm0: 'Uyarı: TPM kapatılırsa ona bağlı disk şifrelemesi kurtarma anahtarı ister; bazı işletim sistemlerinin kurulum koşulu da karşılanmaz. “Etkin”e geri al.'
    };
    function satirlar(sekme) {
      if (sekme === 'ana') return [
        { ad: 'Firmware sürümü', d: '1.20 · 14.03.2026', t: 'bilgi', y: 'Anakart firmware’inin sürümü ve tarihi. Güncelleme derste yapılmaz.' },
        { ad: 'İşlemci', d: '8 çekirdek · 3,8 GHz', t: 'bilgi', y: 'Takılı işlemcinin tanındığını gösterir.' },
        { ad: 'Toplam bellek', d: '32 GB (2 × 16 GB)', t: 'bilgi', y: 'Takılı modüllerin toplamı. Eksikse bir modül oturmamış olabilir.' },
        { ad: 'Bellek hızı', d: '4800 MT/s' + (S.xmp ? ' → 6000 (yeniden başlatınca)' : ''), t: 'bilgi', y: 'Şu anki çalışma hızı. Profil değişikliği kaydedilip yeniden başlatılınca uygulanır.' },
        { ad: 'Depolama', d: 'NVMe SSD 512 GB · USB 16 GB', t: 'bilgi', y: 'Firmware’in gördüğü diskler. Önyükleme sırasında seçilebilirler.' },
        { ad: 'Sistem tarihi', d: tarihMetni(), t: 'bilgi', y: 'Tarih ve saat, fiş çekiliyken anakarttaki düğme pil ile korunur.' },
        { ad: 'Sistem saati', d: saatMetni(), t: 'bilgi', k: 'saat', y: 'Canlı sistem saati (ss:dd:sn). Her açılışta sıfırlanıyorsa düğme pil bitmiş olabilir.' }
      ];
      if (sekme === 'gel') return [
        { ad: AD.xmp, a: 'xmp', t: 'secim', y: 'SPD yongasındaki test edilmiş hız profili. Profil 1: DDR5-6000, CL30, 1,35 V. Kararsızlık olursa kapatılır.' },
        { ad: 'Bellek frekansı', d: 'Otomatik', t: 'kilit', y: 'Elle frekans ayarı bu derste kilitli.', m: 'Elle bellek frekansı ayarı bu derste yapılmaz; profil kullanılır.' },
        { ad: 'CPU çekirdek voltajı', d: 'Otomatik', t: 'kilit', y: 'Voltaj ayarları kilitli.', m: 'Voltaj ayarları derste değiştirilmez: yanlış voltaj işlemciye kalıcı zarar verebilir.' },
        { ad: AD.fan, a: 'fan', t: 'secim', y: 'Fanların sıcaklığa göre hızlanıp yavaşlaması. Otomatik çoğu sistem için uygundur.' }
      ];
      if (sekme === 'boot') return [
        { ad: AD.csm, a: 'csm', t: 'secim', k: 'csm', y: 'Kapalı: yalnız UEFI önyükleme (Secure Boot kullanılabilir). Açık: eski MBR/Legacy önyükleme de mümkün.' },
        { ad: AD.hizli, a: 'hizli', t: 'secim', y: 'Açılışta bazı denetimleri atlar. Açıkken UEFI’ye girmek zorlaşabilir.' },
        { ad: 'Önyükleme seçeneği #1', s: 0, t: 'sira', y: 'Firmware önce bu aygıtı dener. Enter ile listeden aygıt seç; seçilen aygıt yer değiştirir.' },
        { ad: 'Önyükleme seçeneği #2', s: 1, t: 'sira', y: 'Birinci aygıtta geçerli önyükleyici yoksa bu denenir.' },
        { ad: 'Önyükleme seçeneği #3', s: 2, t: 'sira', y: 'Son seçenek. Ağ önyüklemesi (PXE) kurumsal ağlarda kullanılır.' }
      ];
      if (sekme === 'guv') return [
        { ad: AD.sb, a: 'sb', t: 'secim', k: 'sb', y: 'Durum: ' + (S.sb ? 'Etkin' : 'Devre dışı') + ' · Mod: Standart. Önyükleyicinin imzasını db anahtarlarıyla denetler.' },
        { ad: 'Secure Boot anahtarları', d: 'Fabrika anahtarları', t: 'kilit', y: 'PK, KEK, db ve dbx anahtar listeleri.', m: 'Anahtar yönetimi bu derste kilitli; fabrika anahtarları kullanılır.' },
        { ad: AD.tpm, a: 'tpm', t: 'secim', k: 'tpm', y: 'Firmware TPM. Anahtarları saklar ve açılışı ölçer. Durum: ' + (S.tpm ? 'Etkin' : 'Devre dışı') + '.' },
        { ad: 'TPM’i temizle', d: '▸', t: 'kilit', y: 'TPM içindeki anahtarları siler.', m: 'TPM temizlenirse anahtarlar silinir; TPM’e bağlı şifreli verilere kurtarma anahtarı olmadan erişilemez. Derste yapılmaz.' },
        { ad: 'Yönetici parolası', d: 'Ayarlanmadı', t: 'kilit', y: 'UEFI’ye girişi parolayla korur.', m: 'Okul bilgisayarlarında UEFI parolasını yalnız BT sorumlusu belirler.' }
      ];
      return [
        { ad: 'Değişiklikleri kaydet ve çık', d: 'F10', t: 'eylem', e: 'kaydet', y: 'Değişiklik listesini gösterir; onaylanınca kaydeder ve yeniden başlatır.' },
        { ad: 'Kaydetmeden çık', d: '▸', t: 'eylem', e: 'atla', y: 'Değişiklikleri atar ve yeniden başlatır. Gerçek sistemdeki keşif turunda bunu kullanacaksın.' },
        { ad: 'Değişiklikleri geri al', d: '▸', t: 'eylem', e: 'geri', y: 'Kaydedilmemiş değişiklikleri son kaydedilen duruma döndürür.' },
        { ad: 'Varsayılan ayarları yükle', d: '▸', t: 'eylem', e: 'varsay', y: 'Tüm ayarları fabrika değerine döndürür.' }
      ];
    }
    function deger(r) {
      if (r.a) return ETIKET[r.a][S[r.a]];
      if (r.t === 'sira') return KISA[S.sira[r.s]];
      return r.d;
    }

    kok.innerHTML = '<div class="uf" tabindex="0" role="group" aria-roledescription="UEFI simülatörü" aria-label="UEFI ayar simülatörü. Sekme için sol ve sağ ok, satır için yukarı ve aşağı ok, seçmek için Enter, kaydedip çıkmak için F10.">' +
      '<div class="uf-ust"><span class="uf-ad">UEFI Ayarları</span><span class="uf-mod">Simülatör · marka-nötr</span><span class="uf-saat"></span></div>' +
      '<div class="uf-sekmeler" role="tablist"></div>' +
      '<div class="uf-govde"><div class="uf-liste" role="listbox"></div><div class="uf-yardim"><b class="uf-y-bas"></b><p class="uf-y-metin"></p></div></div>' +
      '<div class="uf-mesaj" aria-live="polite"></div>' +
      '<div class="uf-alt"><span class="uf-ipucu">← → sekme · ↑ ↓ satır</span></div>' +
      '<div class="uf-perde" hidden><div class="uf-pencere" role="dialog" aria-modal="true"><b class="uf-p-bas"></b><div class="uf-p-metin"></div><div class="uf-p-sec"></div></div></div>' +
      '<div class="uf-yeniden" hidden></div></div>';
    var kap = kok.querySelector('.uf'), sekmeK = kok.querySelector('.uf-sekmeler'), listeK = kok.querySelector('.uf-liste'),
      yBas = kok.querySelector('.uf-y-bas'), yMetin = kok.querySelector('.uf-y-metin'), mesajK = kok.querySelector('.uf-mesaj'),
      perde = kok.querySelector('.uf-perde'), pBas = kok.querySelector('.uf-p-bas'), pMetin = kok.querySelector('.uf-p-metin'), pSec = kok.querySelector('.uf-p-sec'),
      saatK = kok.querySelector('.uf-saat'), yenidenK = kok.querySelector('.uf-yeniden'), altK = kok.querySelector('.uf-alt');
    var sekme = 0, secili = 0, satirVeri = [], pencere = null;
    function odak() { try { kap.focus({ preventScroll: true }); } catch (e) { kap.focus(); } }
    var sekmeD = SEKME.map(function (s, i) {
      var b = el('button', 'uf-sekme', sekmeK); b.type = 'button'; b.setAttribute('role', 'tab'); b.tabIndex = -1;
      el('b', '', b, s[1]); el('small', '', b, s[2]);
      b.addEventListener('click', function () { sekmeSec(i); odak(); });
      return b;
    });
    [['Enter', 'Seç', function () { etkinlestir(); }], ['Esc', 'Geri', function () { kapat(); }], ['F10', 'Kaydet ve çık', function () { eylem('kaydet'); }]].forEach(function (t) {
      var b = el('button', 'uf-tus', altK); b.type = 'button';
      el('kbd', '', b, t[0]); el('span', '', b, t[1]);
      b.addEventListener('click', function () { t[2](); odak(); });
    });
    function mesaj(m, tur) { mesajK.textContent = m || ''; mesajK.className = 'uf-mesaj' + (tur ? ' ' + tur : ''); }
    function sekmeSec(i) {
      if (pencere || G.kaydet) return;
      sekme = (i + SEKME.length) % SEKME.length; secili = 0; ciz();
    }
    function ciz() {
      sekmeD.forEach(function (b, i) { b.setAttribute('aria-selected', i === sekme ? 'true' : 'false'); b.classList.toggle('aktif', i === sekme); });
      satirVeri = satirlar(SEKME[sekme][0]);
      if (secili >= satirVeri.length) secili = satirVeri.length - 1;
      listeK.innerHTML = '';
      satirVeri.forEach(function (r, i) {
        var d = el('div', 'uf-satir ' + r.t + (i === secili ? ' secili' : ''), listeK);
        d.id = 'uf-r-' + i; d.setAttribute('role', 'option'); d.setAttribute('aria-selected', i === secili ? 'true' : 'false');
        el('span', 'uf-s-ad', d, r.ad);
        var v = el('span', 'uf-s-d', d, deger(r));
        if (r.k === 'saat') v.classList.add('uf-canli');
        if ((r.a === 'csm' && S.csm) || (r.a === 'sb' && !S.sb) || (r.a === 'tpm' && !S.tpm) || (r.a === 'hizli' && S.hizli)) d.classList.add('riskli');
        if (r.a && S[r.a] !== kayitli[r.a]) d.classList.add('degisti');
        if (r.t === 'sira' && S.sira[r.s] !== kayitli.sira[r.s]) d.classList.add('degisti');
        d.addEventListener('click', function () { secili = i; ciz(); etkinlestir(); odak(); });
      });
      kap.setAttribute('aria-activedescendant', 'uf-r-' + secili);
      var r = satirVeri[secili];
      yBas.textContent = r.ad;
      yMetin.textContent = r.y + (r.t === 'kilit' ? ' (Kilitli)' : '');
    }
    function gorevler() {
      var durum = [G.saat, G.csm && !S.csm, S.xmp === 1, S.sira[0] === 'usb', G.sbOku && G.tpmOku && S.sb === 1 && S.tpm === 1, G.kaydet];
      var n = 0, simdi = -1;
      durum.forEach(function (d, i) {
        if (d) n++; else if (simdi < 0) simdi = i;
        if (gorevLi[i]) { gorevLi[i].classList.toggle('tamam', d); gorevLi[i].classList.toggle('simdi', i === simdi); }
      });
      ilerle(n, 6);
      return n;
    }
    function etkinlestir() {
      if (pencere || G.kaydet) { if (pencere) pencereSec(); return; }
      var r = satirVeri[secili];
      if (r.t === 'bilgi') {
        if (r.k === 'saat') { G.saat = true; mesaj('✓ Sistem saati: ' + saatMetni() + ' · ' + tarihMetni(), 'ok'); ses('klik'); }
        else mesaj(r.ad + ': ' + deger(r), 'bilgi');
      } else if (r.t === 'kilit') { mesaj('🔒 ' + r.m, 'uyari'); ses('hata'); }
      else if (r.t === 'secim') {
        if (r.k === 'sb') G.sbOku = true;
        if (r.k === 'tpm') G.tpmOku = true;
        if (r.k === 'sb' || r.k === 'tpm') mesaj(r.ad + ' durumu: ' + deger(r) + (G.sbOku && G.tpmOku ? ' · İki durumu da okudun.' : ''), 'bilgi');
        ac(r.ad, '', ETIKET[r.a].map(function (m, i) { return [m, i]; }), S[r.a], function (v) { ayarla(r, v); });
      } else if (r.t === 'sira') {
        var sec = ['nvme', 'usb', 'pxe'];
        ac(r.ad, 'Aygıt seç:', sec.map(function (k) { return [AYGIT[k], k]; }), S.sira[r.s], function (k) { siraAyarla(r.s, k); });
      } else if (r.t === 'eylem') eylem(r.e);
      gorevler();
    }
    function ayarla(r, v) {
      S[r.a] = v;
      var anahtar = r.a + v;
      if (UYARI[anahtar]) { mesaj(UYARI[anahtar], 'uyari'); ses('hata'); }
      else if (r.a === 'csm') { G.csm = true; mesaj('✓ CSM kapalı: sistem yalnız UEFI modunda önyükler.', 'ok'); ses('klik'); }
      else if (r.a === 'xmp') mesaj(v ? '✓ Profil 1 seçildi. Ana sekmesinde hedef hızı gör; kaydedip yeniden başlatınca uygulanır.' : 'Profil kapalı: bellek JEDEC hızında kalır.', v ? 'ok' : 'bilgi');
      else if (r.a === 'sb' || r.a === 'tpm') mesaj('✓ ' + r.ad + ': Etkin', 'ok');
      else mesaj(r.ad + ': ' + ETIKET[r.a][v], 'bilgi');
      ciz(); gorevler();
    }
    function siraAyarla(i, k) {
      var j = S.sira.indexOf(k);
      S.sira[j] = S.sira[i]; S.sira[i] = k;
      mesaj(S.sira[0] === 'usb' ? '✓ USB bellek 1. sırada: bir sonraki açılış USB’den denenecek.' : 'Önyükleme sırası: ' + S.sira.map(function (x, n) { return (n + 1) + '. ' + KISA[x]; }).join(' · '), S.sira[0] === 'usb' ? 'ok' : 'bilgi');
      ciz(); gorevler();
    }
    function ac(bas, metin, secenekler, simdiki, fn) {
      pencere = { sec: secenekler, i: Math.max(0, secenekler.findIndex(function (s) { return s[1] === simdiki; })), fn: fn };
      pBas.textContent = bas; pMetin.textContent = metin || '';
      pSec.innerHTML = '';
      secenekler.forEach(function (s, i) {
        var b = el('button', 'uf-p-s' + (s[1] === simdiki ? ' mevcut' : ''), pSec, s[0]); b.type = 'button'; b.tabIndex = -1;
        b.addEventListener('click', function () { pencere.i = i; pencereSec(); odak(); });
      });
      perde.hidden = false; pencereCiz();
    }
    function pencereCiz() { pSec.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('secili', i === pencere.i); }); }
    function pencereSec() { var p = pencere; if (!p) return; kapat(); p.fn(p.sec[p.i][1]); }
    function kapat() { if (!pencere) return; pencere = null; perde.hidden = true; }
    function degisiklikler() {
      var d = [];
      ['xmp', 'fan', 'csm', 'hizli', 'sb', 'tpm'].forEach(function (a) { if (S[a] !== kayitli[a]) d.push(AD[a] + ': ' + ETIKET[a][kayitli[a]] + ' → ' + ETIKET[a][S[a]]); });
      if (S.sira.join() !== kayitli.sira.join()) d.push('Önyükleme sırası: ' + S.sira.map(function (x, n) { return (n + 1) + '. ' + KISA[x]; }).join(', '));
      return d;
    }
    function eylem(e) {
      if (G.kaydet) return;
      kapat();
      if (e === 'kaydet') {
        var d = degisiklikler();
        ac('Kaydet ve çık', d.length ? 'Değişiklikler:\n• ' + d.join('\n• ') + '\nKaydedilip yeniden başlatılsın mı?' : 'Kaydedilecek değişiklik yok. Yine de çıkılsın mı?',
          [['Evet', 1], ['Hayır', 0]], 1, function (v) { if (v) kaydet(); else mesaj('Kaydetme iptal edildi.', 'bilgi'); });
      } else if (e === 'atla') {
        ac('Kaydetmeden çık', 'Kaydedilmemiş değişiklikler atılacak. Emin misin?', [['Evet', 1], ['Hayır', 0]], 0, function (v) {
          if (!v) return;
          S = kopya(kayitli); ciz(); gorevler();
          mesaj('Değişiklikler atıldı. Gerçek sistemde keşif turunu bu seçenekle bitireceksin; burada görevlere devam et.', 'bilgi');
        });
      } else if (e === 'geri') { S = kopya(kayitli); ciz(); gorevler(); mesaj('Kaydedilmemiş değişiklikler geri alındı.', 'bilgi'); }
      else if (e === 'varsay') {
        ac('Varsayılan ayarları yükle', 'Tüm ayarlar fabrika değerine döner: bellek profili kapanır, önyükleme sırası sıfırlanır. Emin misin?', [['Evet', 1], ['Hayır', 0]], 0, function (v) {
          if (!v) return;
          S = kopya(VARSAYILAN); ciz(); gorevler(); mesaj('Varsayılanlar yüklendi (henüz kaydedilmedi).', 'uyari');
        });
      }
    }
    function kaydet() {
      var risk = [];
      if (S.csm) risk.push('CSM açık'); if (!S.sb) risk.push('Secure Boot kapalı'); if (!S.tpm) risk.push('TPM kapalı'); if (S.hizli) risk.push('Hızlı önyükleme açık');
      if (risk.length) { mesaj('Kaydedilmedi: önce riskli ayarları geri al (' + risk.join(', ') + ').', 'uyari'); ses('hata'); return; }
      if (!(S.xmp === 1 && S.sira[0] === 'usb')) { mesaj('Önce 3. ve 4. görevleri tamamla: Profil 1 ve USB 1. sırada olmalı.', 'uyari'); return; }
      G.kaydet = true; kayitli = kopya(S); gorevler();
      yenidenK.hidden = false; yenidenK.innerHTML = '';
      var satir = ['Ayarlar kaydedildi. Yeniden başlatılıyor…', 'POST ✓ CPU · DRAM · VGA · BOOT', 'Bellek: 6000 MT/s (Profil 1)', 'Önyükleme #1: USB bellek (UEFI)', '→ Kurulum ekranı açılıyor'];
      var z = Promise.resolve();
      satir.forEach(function (m) { z = z.then(function () { el('div', 'uf-y-satir', yenidenK, m); return bekle(0.7); }); });
      z.then(function () {
        var b = el('button', 'uf-bastan', yenidenK, 'Simülatörü baştan başlat'); b.type = 'button';
        b.addEventListener('click', function () {
          S = kopya(VARSAYILAN); kayitli = kopya(VARSAYILAN); G = { saat: false, csm: false, sbOku: false, tpmOku: false, kaydet: false };
          yenidenK.hidden = true; sekme = 0; secili = 0; ciz(); gorevler(); mesaj(''); odak();
        });
        var n = gorevler();
        mesaj(n === 6 ? '✓ Tüm görevler tamam! Sıra gerçek sistemde.' : 'Kaydedildi. Eksik görevler için simülatörü baştan başlatabilirsin.', n === 6 ? 'ok' : 'bilgi');
        if (n === 6) DERS.konfeti();
        ses('klik');
      });
    }
    kap.addEventListener('keydown', function (e) {
      var k = e.key, islendi = true;
      if (pencere) {
        if (k === 'ArrowUp') pencere.i = (pencere.i + pencere.sec.length - 1) % pencere.sec.length;
        else if (k === 'ArrowDown') pencere.i = (pencere.i + 1) % pencere.sec.length;
        else if (k === 'Enter' || k === ' ') pencereSec();
        else if (k === 'Escape') kapat();
        else if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'F10') { /* pencere açıkken yok say */ }
        else islendi = false;
        if (pencere) pencereCiz();
      } else if (G.kaydet) {
        islendi = k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown' || k === 'F10';
      } else if (k === 'ArrowLeft') sekmeSec(sekme - 1);
      else if (k === 'ArrowRight') sekmeSec(sekme + 1);
      else if (k === 'ArrowUp') { secili = (secili + satirVeri.length - 1) % satirVeri.length; ciz(); }
      else if (k === 'ArrowDown') { secili = (secili + 1) % satirVeri.length; ciz(); }
      else if (k === 'Home') { secili = 0; ciz(); }
      else if (k === 'End') { secili = satirVeri.length - 1; ciz(); }
      else if (k === 'Enter' || k === ' ') etkinlestir();
      else if (k === 'F10') eylem('kaydet');
      else if (k === 'Escape') mesaj('');
      else islendi = false;
      if (islendi) { e.preventDefault(); e.stopPropagation(); }
    });
    kap.addEventListener('mousedown', function (e) { if (e.target === kap) odak(); });
    setInterval(function () {
      if (!slaytAktif('s11')) return;
      saatK.textContent = saatMetni();
      var c = listeK.querySelector('.uf-canli'); if (c) c.textContent = saatMetni();
    }, 1000);
    saatK.textContent = saatMetni();
    ciz(); gorevler();
    mesaj('Simülatöre dokun ya da Tab ile odaklan; sonra görev listesini izle.', 'bilgi');
    DERS.slaytAcilinca('s11', function () { odak(); }, true);
  })();

  /* ─────────── Etkinlik 2: gerçek sistemde UEFI keşif kartı ─────────── */
  (function () {
    var kok = document.getElementById('kesif');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var liste = kok.querySelector('.ks-satirlar'), sonuc = kok.querySelector('.ks-sonuc');
    var SATIR = [
      { ad: 'Açılış (POST)', alt: 'Yanık kalan ışık', sec: [['Hiçbiri, sorunsuz', 'ok'], ['CPU'], ['DRAM'], ['VGA'], ['BOOT']] },
      { ad: 'UEFI giriş tuşu', alt: 'Ekranda yazan', sec: [['Del'], ['F2'], ['Başka']] },
      { ad: 'Firmware sürümü', alt: 'Ana ekran', yazi: 'ör. 1.20' },
      { ad: 'Bellek', alt: 'Toplam ve hız', yazi: 'ör. 16 GB · 3200 MT/s' },
      { ad: 'Önyükleme modu', alt: 'CSM durumu', sec: [['UEFI (CSM kapalı)'], ['Legacy (CSM açık)', 'not']] },
      { ad: 'Secure Boot · TPM', alt: 'Güvenlik', ikili: [[['SB açık'], ['SB kapalı', 'not']], [['TPM açık'], ['TPM kapalı', 'not']]] },
      { ad: 'Çıkış', alt: 'Ayar değişmedi', sec: [['Kaydetmeden çıktım']] }
    ];
    var dolu = SATIR.map(function () { return false; }), bitti = false;
    function guncelle() {
      var n = dolu.filter(Boolean).length;
      ilerle(n, SATIR.length);
      if (n === SATIR.length && !bitti) {
        bitti = true;
        sonuc.className = 'ks-sonuc tamam';
        sonuc.textContent = '✓ Keşif kartı tamam. Kartını öğretmenine göster ve simülatördeki ekranla karşılaştır.';
        DERS.konfeti(); ses('klik');
      }
    }
    SATIR.forEach(function (s, i) {
      var r = el('div', 'ks-satir', liste);
      var b = el('div', 'ks-bas', r); el('b', '', b, (i + 1) + '. ' + s.ad); el('small', '', b, s.alt);
      var g = el('div', 'ks-giris', r);
      function isaretle(not) {
        dolu[i] = true; r.classList.add('dolu');
        if (not) { sonuc.className = 'ks-sonuc not'; sonuc.textContent = 'Not al: ' + s.ad + ' beklenenden farklı. Ayarı değiştirme; öğretmenine bildir.'; }
        guncelle();
      }
      function grup(secenekler, cb) {
        var k = el('div', 'secici ks-grup', g);
        secenekler.forEach(function (x) {
          var d = DERS.dugme(k, x[0], function () {
            k.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', y === d ? 'true' : 'false'); });
            cb(x[1] === 'not');
          });
          d.setAttribute('aria-pressed', 'false');
        });
      }
      if (s.sec) grup(s.sec, isaretle);
      else if (s.yazi) {
        var inp = el('input', 'ks-yazi', g); inp.type = 'text'; inp.placeholder = s.yazi; inp.setAttribute('aria-label', s.ad);
        inp.addEventListener('input', function () {
          if (inp.value.trim().length >= 2) { if (!dolu[i]) isaretle(false); }
          else { dolu[i] = false; r.classList.remove('dolu'); guncelle(); }
        });
      } else if (s.ikili) {
        var iki2 = [null, null];
        s.ikili.forEach(function (gr, j) { grup(gr, function (not) { iki2[j] = not; if (iki2[0] !== null && iki2[1] !== null) isaretle(iki2[0] || iki2[1]); }); });
      }
    });
    sonuc.textContent = 'Satırları gerçek ekranda gördüğüne göre doldur.';
    guncelle();
  })();
})();
