/* DON-301 H14 — Proje: Sistem Önerisi ve Montaj Raporu · ders betiği (ortak betikten sonra çalışır)
   KAYNAK: E-UYUMLULUK çekirdeği (katalog, kurallar, güç hesabı, profil denetimi, panel) DON-301 H08 ders.js dosyasından
   DEĞİŞTİRMEDEN kopyalanmıştır (kaynak/DON-301/H08/ders.js). Kural ya da katalog değişecekse önce H08’de değiştirilip bu blok yeniden kopyalanır.
   Provalar (Adım 1–6) marka-nötr 2D animasyonlardır; fiyat yerine göreli "puan" kullanılır. */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;

/* ═══════════════ E-UYUMLULUK ÇEKİRDEĞİ · BAŞLANGIÇ (H08 ve H14’te birebir aynı) ═══════════════ */
  var UYUM = (function () {
    var PAY_HEDEF = 0.30, PAY_ALT = 0.20;              // güç payı: ≥ %30 yeşil, %20–30 sarı, < %20 kırmızı
    var TABAN = { anakart: 40, modul: 5, surucu: 8 };   // W: anakart + fanlar, bellek modülü başına, sürücü başına
    var KATEGORI = [
      { k: 'cpu', ad: 'İşlemci', liste: 'cpu' },
      { k: 'anakart', ad: 'Anakart', liste: 'anakart' },
      { k: 'bellek', ad: 'Bellek', liste: 'bellek' },
      { k: 'depo1', ad: 'Depolama 1', liste: 'depo' },
      { k: 'depo2', ad: 'Depolama 2', liste: 'depo', istege: 'Yok (isteğe bağlı)' },
      { k: 'gpu', ad: 'Ekran kartı', liste: 'gpu' },
      { k: 'sogutucu', ad: 'Soğutucu', liste: 'sogutucu' },
      { k: 'psu', ad: 'Güç kaynağı', liste: 'psu' },
      { k: 'kasa', ad: 'Kasa', liste: 'kasa' }
    ];
    /* Katalog: jenerik, marka-nötr parçalar. puan = göreli bütçe birimi (para değildir). */
    var KATALOG = {
      cpu: [
        { id: 'cpu1', ad: 'Soket A işlemci · 1. nesil · 4 çekirdek · 65 W · grafikli', soket: 'A', nesil: 1, cekirdek: 4, tdp: 65, igpu: true, seviye: 1, puan: 55 },
        { id: 'cpu2', ad: 'Soket A işlemci · 2. nesil · 6 çekirdek · 65 W · grafikli', soket: 'A', nesil: 2, cekirdek: 6, tdp: 65, igpu: true, seviye: 2, puan: 85 },
        { id: 'cpu3', ad: 'Soket A işlemci · 2. nesil · 8 çekirdek · 105 W', soket: 'A', nesil: 2, cekirdek: 8, tdp: 105, igpu: false, seviye: 3, puan: 140 },
        { id: 'cpu4', ad: 'Soket B işlemci · 1. nesil · 6 çekirdek · 65 W · grafikli', soket: 'B', nesil: 1, cekirdek: 6, tdp: 65, igpu: true, seviye: 2, puan: 90 },
        { id: 'cpu5', ad: 'Soket B işlemci · 1. nesil · 12 çekirdek · 125 W', soket: 'B', nesil: 1, cekirdek: 12, tdp: 125, igpu: false, seviye: 4, puan: 210 }
      ],
      anakart: [
        { id: 'mb1', ad: 'Soket A · mATX anakart · DDR4 (4 yuva) · 2× M.2 · 4 SATA · çipset 1. nesil', soket: 'A', cipset: 1, guncelle: [2], ff: 'mATX', ram: 'DDR4', yuva: 4, m2: 2, sata: 4, puan: 45 },
        { id: 'mb2', ad: 'Soket A · ATX anakart · DDR5 (4 yuva) · 3× M.2 · 4 SATA · çipset 2. nesil', soket: 'A', cipset: 2, guncelle: [], ff: 'ATX', ram: 'DDR5', yuva: 4, m2: 3, sata: 4, puan: 80 },
        { id: 'mb3', ad: 'Soket A · ITX anakart · DDR5 (2 yuva) · 1× M.2 · 2 SATA · çipset 2. nesil', soket: 'A', cipset: 2, guncelle: [], ff: 'ITX', ram: 'DDR5', yuva: 2, m2: 1, sata: 2, puan: 85 },
        { id: 'mb4', ad: 'Soket B · ATX anakart · DDR5 (4 yuva) · 2× M.2 · 6 SATA · çipset 1. nesil', soket: 'B', cipset: 1, guncelle: [], ff: 'ATX', ram: 'DDR5', yuva: 4, m2: 2, sata: 6, puan: 90 },
        { id: 'mb5', ad: 'Soket B · mATX anakart · DDR4 (2 yuva) · 1× M.2 · 4 SATA · çipset 1. nesil', soket: 'B', cipset: 1, guncelle: [], ff: 'mATX', ram: 'DDR4', yuva: 2, m2: 1, sata: 4, puan: 50 }
      ],
      bellek: [
        { id: 'ram1', ad: '1× 16 GB DDR4-3200', tur: 'DDR4', modul: 1, gb: 16, puan: 25 },
        { id: 'ram2', ad: '2× 8 GB DDR4-3200', tur: 'DDR4', modul: 2, gb: 16, puan: 28 },
        { id: 'ram3', ad: '2× 16 GB DDR5-5600', tur: 'DDR5', modul: 2, gb: 32, puan: 55 },
        { id: 'ram4', ad: '2× 32 GB DDR5-5600', tur: 'DDR5', modul: 2, gb: 64, puan: 105 },
        { id: 'ram5', ad: '4× 16 GB DDR5-5600', tur: 'DDR5', modul: 4, gb: 64, puan: 110 }
      ],
      depo: [
        { id: 'ssd1', ad: 'M.2 NVMe SSD · 500 GB', arayuz: 'm2', nvme: true, ssd: true, gb: 500, puan: 25 },
        { id: 'ssd2', ad: 'M.2 NVMe SSD · 1 TB', arayuz: 'm2', nvme: true, ssd: true, gb: 1000, puan: 40 },
        { id: 'ssd3', ad: 'M.2 NVMe SSD · 2 TB', arayuz: 'm2', nvme: true, ssd: true, gb: 2000, puan: 70 },
        { id: 'ssd4', ad: '2,5 inç SATA SSD · 1 TB', arayuz: 'sata', nvme: false, ssd: true, gb: 1000, puan: 35 },
        { id: 'hdd1', ad: '3,5 inç SATA HDD · 2 TB', arayuz: 'sata', nvme: false, ssd: false, gb: 2000, puan: 30 }
      ],
      gpu: [
        { id: 'gpu0', ad: 'Yok · işlemcinin tümleşik grafiği kullanılır', yok: true, boy: 0, guc: 0, pin: 0, seviye: 0, puan: 0 },
        { id: 'gpu1', ad: 'Giriş seviyesi ekran kartı · 170 mm · 75 W · ek güç yok', boy: 170, guc: 75, pin: 0, seviye: 1, puan: 60 },
        { id: 'gpu2', ad: 'Orta seviye ekran kartı · 240 mm · 170 W · 1× 8-pin', boy: 240, guc: 170, pin: 1, seviye: 2, puan: 120 },
        { id: 'gpu3', ad: 'Üst seviye ekran kartı · 305 mm · 285 W · 2× 8-pin', boy: 305, guc: 285, pin: 2, seviye: 3, puan: 200 },
        { id: 'gpu4', ad: 'En üst seviye ekran kartı · 336 mm · 350 W · 3× 8-pin', boy: 336, guc: 350, pin: 3, seviye: 4, puan: 280 }
      ],
      sogutucu: [
        { id: 'sog1', ad: 'Alçak profil hava soğutucu · 65 W · 47 mm · yalnız Soket A', w: 65, boy: 47, soket: ['A'], puan: 10 },
        { id: 'sog2', ad: 'Kule hava soğutucu · 150 W · 155 mm · Soket A/B', w: 150, boy: 155, soket: ['A', 'B'], puan: 25 },
        { id: 'sog3', ad: 'Büyük kule hava soğutucu · 200 W · 165 mm · Soket A/B', w: 200, boy: 165, soket: ['A', 'B'], puan: 45 }
      ],
      psu: [
        { id: 'psu1', ad: '450 W güç kaynağı · 1× 8-pin PCIe', w: 450, pin: 1, puan: 30 },
        { id: 'psu2', ad: '550 W güç kaynağı · 2× 8-pin PCIe', w: 550, pin: 2, puan: 40 },
        { id: 'psu3', ad: '650 W güç kaynağı · 2× 8-pin PCIe', w: 650, pin: 2, puan: 50 },
        { id: 'psu4', ad: '850 W güç kaynağı · 4× 8-pin PCIe', w: 850, pin: 4, puan: 75 }
      ],
      kasa: [
        { id: 'kasa1', ad: 'ITX küçük kasa · kart ≤ 200 mm · soğutucu ≤ 60 mm', ff: ['ITX'], gpu: 200, sog: 60, puan: 35 },
        { id: 'kasa2', ad: 'mATX kasa · kart ≤ 280 mm · soğutucu ≤ 150 mm', ff: ['mATX', 'ITX'], gpu: 280, sog: 150, puan: 35 },
        { id: 'kasa3', ad: 'ATX orta kule · kart ≤ 330 mm · soğutucu ≤ 165 mm', ff: ['ATX', 'mATX', 'ITX'], gpu: 330, sog: 165, puan: 50 },
        { id: 'kasa4', ad: 'ATX büyük kule · kart ≤ 400 mm · soğutucu ≤ 180 mm', ff: ['ATX', 'mATX', 'ITX'], gpu: 400, sog: 180, puan: 70 }
      ]
    };
    var PARCA = {};
    Object.keys(KATALOG).forEach(function (l) { KATALOG[l].forEach(function (p) { p.liste = l; PARCA[p.id] = p; }); });

    /* Kullanım profilleri: en az gereksinimler, bütçe (puan) ve bütçe önceliği (1–5) */
    var PROFIL = {
      ofis: { ad: 'Ofis / okul', butce: 320, cekirdek: 4, ram: 16, depo: 500, nvme: false, gpu: 0, gpuUst: 1,
        oncelik: { cpu: 2, gpu: 1, ram: 2, depo: 2 }, ornek: 'Kelime işlemci, tablo, sunum, tarayıcı, görüntülü görüşme', ac: 'Sessiz, ekonomik ve güvenilir; ayrı ekran kartı gerekmez.' },
      tasarim: { ad: 'Grafik tasarım', butce: 620, cekirdek: 6, ram: 32, depo: 1000, nvme: true, gpu: 1, gpuUst: 3,
        oncelik: { cpu: 4, gpu: 3, ram: 5, depo: 4 }, ornek: 'Fotoğraf düzenleme, vektör çizim, sayfa tasarımı', ac: 'Büyük dosyalar ve katmanlar: çok bellek, hızlı depolama, yeterli çekirdek.' },
      oyun: { ad: 'Oyun', butce: 650, cekirdek: 6, ram: 16, depo: 1000, nvme: true, gpu: 2, gpuUst: 4,
        oncelik: { cpu: 3, gpu: 5, ram: 3, depo: 3 }, ornek: 'Güncel 3B oyunlar, yüksek kare hızı', ac: 'Kareleri ekran kartı üretir; bütçenin en büyük payı ekran kartına gider.' },
      yazilim: { ad: 'Yazılım geliştirme', butce: 560, cekirdek: 8, ram: 32, depo: 1000, nvme: true, gpu: 0, gpuUst: 2,
        oncelik: { cpu: 5, gpu: 1, ram: 5, depo: 4 }, ornek: 'Kod düzenleyici, derleme, sanal makine, kapsayıcılar', ac: 'Derleme çekirdek, sanal makineler bellek ister; ekran kartı ikinci planda.' }
    };
    var PROFIL_SIRA = ['ofis', 'tasarim', 'oyun', 'yazilim'];

    function p(secim, k) { return secim && secim[k] ? PARCA[secim[k]] : null; }
    function sonuc(d, kisa, neden) { return { d: d, kisa: kisa, neden: neden }; }
    function bos(ne) { return sonuc('bos', 'seçilmedi', ne + ' seçilince denetlenir.'); }
    function yuzde(x) { return '%' + Math.round(x * 100); }
    function suruculer(s) { return [p(s, 'depo1'), p(s, 'depo2')].filter(Boolean); }

    /* Güç hesabı: işlemci TDP + ekran kartı + diğer (anakart/fan + modül + sürücü); gereken = toplam × 1,3 */
    function guc(s) {
      var c = p(s, 'cpu'), g = p(s, 'gpu'), r = p(s, 'bellek');
      if (!c) return null;
      var diger = TABAN.anakart + (r ? r.modul : 2) * TABAN.modul + Math.max(1, suruculer(s).length) * TABAN.surucu;
      var toplam = c.tdp + (g ? g.guc : 0) + diger;
      var ps = p(s, 'psu');
      return { cpu: c.tdp, gpu: g ? g.guc : 0, diger: diger, toplam: toplam, gereken: Math.round(toplam * (1 + PAY_HEDEF)),
               psu: ps ? ps.w : 0, pay: ps ? ps.w / toplam - 1 : null };
    }

    /* Uyumluluk kuralları: her biri {d: ok|uyari|hata|bos, kisa, neden} döndürür */
    var KURAL = [
      { id: 'soket', ad: 'Soket ve çipset', parca: ['cpu', 'anakart'], f: function (s) {
        var c = p(s, 'cpu'), m = p(s, 'anakart');
        if (!c || !m) return bos('İşlemci ve anakart');
        if (c.soket !== m.soket) return sonuc('hata', 'Soket ' + c.soket + ' ≠ Soket ' + m.soket,
          'İşlemci Soket ' + c.soket + ', anakart Soket ' + m.soket + '. Temas düzeni ve çentikler farklı olduğu için işlemci bu yuvaya oturmaz.');
        if (c.nesil <= m.cipset) return sonuc('ok', 'Soket ' + c.soket + ' = Soket ' + m.soket,
          'İkisi de Soket ' + c.soket + '. Anakartın çipseti ' + c.nesil + '. nesil işlemciyi doğrudan destekliyor.');
        if (m.guncelle.indexOf(c.nesil) >= 0) return sonuc('uyari', 'Soket aynı · UEFI güncellemesi',
          'Soket aynı, ama bu anakartın çipseti ' + c.nesil + '. nesil işlemciyi ancak UEFI (firmware) güncellemesinden sonra tanır. Güncellenmeden sistem açılmayabilir; üreticinin işlemci destek listesi kontrol edilir.');
        return sonuc('hata', 'Çipset desteği yok', 'Soket aynı, ama çipset ' + c.nesil + '. nesil işlemciyi desteklemiyor.');
      } },
      { id: 'bellekTur', ad: 'Bellek türü', parca: ['bellek', 'anakart'], f: function (s) {
        var r = p(s, 'bellek'), m = p(s, 'anakart');
        if (!r || !m) return bos('Bellek ve anakart');
        if (r.tur !== m.ram) return sonuc('hata', r.tur + ' modül · ' + m.ram + ' yuva',
          'Anakart yuvaları ' + m.ram + ', modüller ' + r.tur + '. Çentik yeri ve çalışma gerilimi farklıdır; modül yuvaya girmez.');
        return sonuc('ok', r.tur + ' = ' + m.ram, 'Modüller ve anakart yuvaları aynı nesil (' + r.tur + ').');
      } },
      { id: 'bellekYuva', ad: 'Bellek yuvası', parca: ['bellek', 'anakart'], f: function (s) {
        var r = p(s, 'bellek'), m = p(s, 'anakart');
        if (!r || !m) return bos('Bellek ve anakart');
        if (r.modul > m.yuva) return sonuc('hata', r.modul + ' modül > ' + m.yuva + ' yuva',
          'Kitte ' + r.modul + ' modül var, anakartta ' + m.yuva + ' yuva. Fazla modül takılamaz; aynı kapasite daha az modülle alınır.');
        if (r.modul === 1) return sonuc('uyari', '1 modül · tek kanal',
          'Çalışır ama tek modül tek kanal çalışır; bellek bant genişliği çift kanalın yaklaşık yarısıdır. Aynı kapasite 2 modülle alınmalı.');
        return sonuc('ok', r.modul + ' modül / ' + m.yuva + ' yuva',
          r.modul + ' modül ' + m.yuva + ' yuvaya sığıyor ve çift kanal çalışır; kılavuzdaki önerilen yuvalara takılır.');
      } },
      { id: 'form', ad: 'Form faktörü', parca: ['anakart', 'kasa'], f: function (s) {
        var m = p(s, 'anakart'), k = p(s, 'kasa');
        if (!m || !k) return bos('Anakart ve kasa');
        if (k.ff.indexOf(m.ff) < 0) return sonuc('hata', m.ff + ' kart · ' + k.ff[0] + ' kasa',
          'Kasa en çok ' + k.ff[0] + ' anakart alır; ' + m.ff + ' kart boyutu ve vida delikleri nedeniyle sığmaz (ATX 305 × 244 mm, mATX 244 × 244 mm, ITX 170 × 170 mm).');
        return sonuc('ok', m.ff + ' kart · ' + k.ff[0] + ' kasa', 'Kasa ' + k.ff.join(', ') + ' anakartları taşır; ' + m.ff + ' kart ara vidalara oturur.');
      } },
      { id: 'depolama', ad: 'Depolama arayüzü', parca: ['depo1', 'depo2', 'anakart'], f: function (s) {
        var m = p(s, 'anakart'), d = suruculer(s);
        if (!m || !p(s, 'depo1')) return bos('Anakart ve sistem sürücüsü');
        var m2 = d.filter(function (x) { return x.arayuz === 'm2'; }).length, sa = d.length - m2;
        if (m2 > m.m2) return sonuc('hata', m2 + ' M.2 sürücü > ' + m.m2 + ' M.2 yuvası',
          'Anakartta ' + m.m2 + ' M.2 yuvası var, ' + m2 + ' M.2 NVMe sürücü seçildi. Biri SATA sürücüyle değiştirilmeli ya da daha çok yuvalı anakart seçilmeli.');
        if (sa > m.sata) return sonuc('hata', sa + ' SATA > ' + m.sata + ' port', 'SATA portu yetmiyor.');
        return sonuc('ok', 'M.2 ' + m2 + '/' + m.m2 + ' · SATA ' + sa + '/' + m.sata,
          'M.2 NVMe sürücüler M.2 yuvasına, SATA sürücüler SATA portuna ve güç kaynağının SATA güç kablosuna bağlanır; yuva sayısı yeterli.');
      } },
      { id: 'gpuBoy', ad: 'Ekran kartı uzunluğu', parca: ['gpu', 'kasa'], f: function (s) {
        var g = p(s, 'gpu'), k = p(s, 'kasa');
        if (!g || !k) return bos('Ekran kartı ve kasa');
        if (g.yok) return sonuc('ok', 'Ayrı kart yok', 'Ayrı ekran kartı seçilmedi; uzunluk denetimi gerekmez.');
        if (g.boy > k.gpu) return sonuc('hata', g.boy + ' mm > ' + k.gpu + ' mm',
          'Kart kasanın izin verdiği uzunluktan ' + (g.boy - k.gpu) + ' mm uzun; ön fanlara ya da disk kafesine çarpar.');
        if (k.gpu - g.boy < 10) return sonuc('uyari', g.boy + ' mm · pay ' + (k.gpu - g.boy) + ' mm',
          'Kart sığar ama pay 10 mm’den az; ön fan ve kablolar için yer kalmaz.');
        return sonuc('ok', g.boy + ' mm ≤ ' + k.gpu + ' mm', 'Kart ' + g.boy + ' mm, kasa en çok ' + k.gpu + ' mm alıyor; ' + (k.gpu - g.boy) + ' mm pay var.');
      } },
      { id: 'guc', ad: 'Güç kaynağı gücü', parca: ['psu', 'cpu', 'gpu', 'bellek', 'depo1', 'depo2'], f: function (s) {
        var h = guc(s);
        if (!h || !p(s, 'psu') || !p(s, 'gpu')) return bos('İşlemci, ekran kartı ve güç kaynağı');
        var ac = 'Tahmini tüketim ' + h.toplam + ' W (işlemci ' + h.cpu + ' + ekran kartı ' + h.gpu + ' + diğer ' + h.diger + '). %30 payla en az ' + h.gereken + ' W gerekir; güç kaynağı ' + h.psu + ' W';
        if (h.pay >= PAY_HEDEF) return sonuc('ok', h.psu + ' W · pay ' + yuzde(h.pay), ac + ', pay ' + yuzde(h.pay) + ': yeterli.');
        if (h.pay >= PAY_ALT) return sonuc('uyari', h.psu + ' W · pay ' + yuzde(h.pay) + ' (dar)',
          ac + '. Çalışır ama pay %30’un altında; yük altında ısınma ve fan gürültüsü artar, parça eklemeye yer kalmaz.');
        return sonuc('hata', h.psu + ' W · pay ' + yuzde(Math.max(h.pay, 0)),
          ac + '. Pay %20’nin altında: ekran kartının anlık güç sıçramalarında sistem kapanabilir. En az ' + h.gereken + ' W seçilmeli.');
      } },
      { id: 'konnektor', ad: 'Güç konnektörü', parca: ['gpu', 'psu'], f: function (s) {
        var g = p(s, 'gpu'), ps = p(s, 'psu');
        if (!g || !ps) return bos('Ekran kartı ve güç kaynağı');
        if (g.yok) return sonuc('ok', 'Ek güç gerekmez', 'Ayrı ekran kartı yok; anakart 24-pin ve işlemci 8-pin (EPS) kablosuyla beslenir.');
        if (!g.pin) return sonuc('ok', 'Ek güç gerekmez', 'Kart gücünü (en çok 75 W) PCIe yuvasından alır; ek kablo istemez.');
        if (g.pin > ps.pin) return sonuc('hata', g.pin + '× 8-pin gerekli · ' + ps.pin + ' var',
          'Kart ' + g.pin + ' adet 8 pinli PCIe güç kablosu istiyor, güç kaynağında ' + ps.pin + ' tane var. Dönüştürücüyle çoğaltılmaz; uygun güç kaynağı seçilir.');
        return sonuc('ok', g.pin + '× 8-pin · ' + ps.pin + ' var', 'Kartın istediği ' + g.pin + ' adet 8 pinli PCIe kablo güç kaynağında var (' + ps.pin + ').');
      } },
      { id: 'sogutucu', ad: 'Soğutucu kapasitesi', parca: ['sogutucu', 'cpu'], f: function (s) {
        var c = p(s, 'cpu'), g = p(s, 'sogutucu');
        if (!c || !g) return bos('İşlemci ve soğutucu');
        if (g.soket.indexOf(c.soket) < 0) return sonuc('hata', 'Soket ' + c.soket + ' bağlantısı yok',
          'Soğutucunun montaj parçası yalnız Soket ' + g.soket.join('/') + ' için; Soket ' + c.soket + ' işlemciye bağlanamaz.');
        if (g.w < c.tdp) return sonuc('hata', g.w + ' W < ' + c.tdp + ' W',
          'Soğutucu en çok ' + g.w + ' W ısı uzaklaştırır, işlemcinin TDP’si ' + c.tdp + ' W. İşlemci ısınır ve hızını düşürür (ısıl kısıtlama).');
        return sonuc('ok', g.w + ' W ≥ ' + c.tdp + ' W', 'Soğutucu ' + g.w + ' W’a kadar ısı uzaklaştırır; işlemcinin TDP’si ' + c.tdp + ' W ve montaj parçası Soket ' + c.soket + '’ya uyar.');
      } },
      { id: 'sogBoy', ad: 'Soğutucu yüksekliği', parca: ['sogutucu', 'kasa'], f: function (s) {
        var g = p(s, 'sogutucu'), k = p(s, 'kasa');
        if (!g || !k) return bos('Soğutucu ve kasa');
        if (g.boy > k.sog) return sonuc('hata', g.boy + ' mm > ' + k.sog + ' mm',
          'Soğutucu ' + g.boy + ' mm, kasa en çok ' + k.sog + ' mm yüksekliğe izin veriyor; yan kapak kapanmaz.');
        return sonuc('ok', g.boy + ' mm ≤ ' + k.sog + ' mm', 'Soğutucu ' + g.boy + ' mm; kasanın sınırı ' + k.sog + ' mm, yan kapak kapanır.');
      } },
      { id: 'goruntu', ad: 'Görüntü çıkışı', parca: ['gpu', 'cpu'], f: function (s) {
        var c = p(s, 'cpu'), g = p(s, 'gpu');
        if (!c || !g) return bos('İşlemci ve ekran kartı');
        if (!g.yok) return sonuc('ok', 'Ekran kartından', 'Monitör ekran kartının çıkışına bağlanır.');
        if (!c.igpu) return sonuc('hata', 'Görüntü yok', 'İşlemcide tümleşik grafik yok ve ekran kartı seçilmedi; monitöre görüntü gelmez.');
        return sonuc('ok', 'Tümleşik grafik', 'İşlemcinin tümleşik grafiği kullanılır; monitör anakartın görüntü çıkışına bağlanır.');
      } }
    ];
    var KURAL_AD = {};
    KURAL.forEach(function (k) { KURAL_AD[k.id] = k; });

    function kural(id, s) { var k = KURAL_AD[id], r = k.f(s || {}); r.id = id; r.ad = k.ad; return r; }
    function denetle(s) { return KURAL.map(function (k) { return kural(k.id, s); }); }
    function puan(s) {
      var t = 0;
      KATEGORI.forEach(function (c) { var x = p(s, c.k); if (x) t += x.puan; });
      return t;
    }
    function tamMi(s) { return KATEGORI.every(function (c) { return c.istege || p(s, c.k); }); }

    /* Profil denetimi: ihtiyaç (en az gereksinim), denge (darboğaz), bütçe */
    function profilDenetle(s, pid) {
      var pr = PROFIL[pid], c = p(s, 'cpu'), r = p(s, 'bellek'), g = p(s, 'gpu'), d1 = p(s, 'depo1');
      var m = [], toplamGb = suruculer(s).reduce(function (a, x) { return a + x.gb; }, 0);
      if (c) m.push({ ok: c.cekirdek >= pr.cekirdek, t: 'çekirdek ' + c.cekirdek + (c.cekirdek >= pr.cekirdek ? ' ≥ ' : ' < ') + pr.cekirdek });
      if (r) m.push({ ok: r.gb >= pr.ram, t: 'bellek ' + r.gb + ' GB' + (r.gb >= pr.ram ? ' ≥ ' : ' < ') + pr.ram + ' GB' });
      if (d1) m.push({ ok: toplamGb >= pr.depo && d1.ssd && (!pr.nvme || d1.nvme),
        t: 'depolama ' + (toplamGb >= 1000 ? (toplamGb / 1000) + ' TB' : toplamGb + ' GB') + ', sistem sürücüsü ' + (d1.nvme ? 'NVMe SSD' : d1.ssd ? 'SATA SSD' : 'HDD') +
           ' (gerekli: ' + (pr.depo >= 1000 ? pr.depo / 1000 + ' TB' : pr.depo + ' GB') + (pr.nvme ? ' NVMe' : ' SSD') + ')' });
      if (g) m.push({ ok: g.seviye >= pr.gpu, t: pr.gpu ? 'ekran kartı seviye ' + g.seviye + (g.seviye >= pr.gpu ? ' ≥ ' : ' < ') + pr.gpu : 'ekran kartı gerekmez' });
      var eksik = m.filter(function (x) { return !x.ok; });
      var ihtiyac = (!c || !r || !d1 || !g) ? sonuc('bos', 'parça eksik', 'İşlemci, bellek, sistem sürücüsü ve ekran kartı seçilince denetlenir.')
        : eksik.length ? sonuc('hata', (m.length - eksik.length) + '/' + m.length + ' karşılandı', pr.ad + ' profili için eksik: ' + eksik.map(function (x) { return x.t; }).join('; ') + '.')
        : sonuc('ok', m.length + '/' + m.length + ' karşılandı', pr.ad + ' profilinin en az gereksinimleri karşılanıyor: ' + m.map(function (x) { return x.t; }).join('; ') + '.');
      var u = [];
      if (c && g && !g.yok) {
        if (g.seviye >= 2 && g.seviye - c.seviye >= 2) u.push('İşlemci darboğazı: ekran kartı (seviye ' + g.seviye + ') işlemciden (seviye ' + c.seviye + ') çok güçlü; işlemci kareleri hazırlamaya yetişemez.');
        if (pr.gpu >= 2 && c.seviye - g.seviye >= 2) u.push('Ekran kartı darboğazı: bu profilde kareleri ekran kartı üretir; güçlü işlemci zayıf kartı hızlandıramaz.');
        if (g.seviye > pr.gpuUst) u.push('Ekran kartı bu profil için gereğinden güçlü; puan başka ihtiyaca aktarılmalı.');
      }
      if (r && r.modul === 1) u.push('Tek modül bellek tek kanal çalışır; bant genişliği yarıya iner.');
      if (d1 && !d1.ssd) u.push('Sistem sürücüsü HDD: açılış ve program yükleme yavaş olur.');
      var denge = (!c || !g) ? sonuc('bos', 'parça eksik', 'İşlemci ve ekran kartı seçilince denetlenir.')
        : u.length ? sonuc('uyari', u.length + ' uyarı', u.join(' ')) : sonuc('ok', 'dengeli', 'Belirgin darboğaz yok; parçalar profilin önceliğiyle uyumlu.');
      var t = puan(s);
      var butce = t > pr.butce ? sonuc('hata', t + ' / ' + pr.butce + ' puan', 'Bütçe ' + (t - pr.butce) + ' puan aşıldı; önceliği düşük parçadan başla.')
        : sonuc('ok', t + ' / ' + pr.butce + ' puan', 'Bütçe içinde; ' + (pr.butce - t) + ' puan kaldı.');
      ihtiyac.id = 'ihtiyac'; ihtiyac.ad = 'İhtiyaç'; denge.id = 'denge'; denge.ad = 'Denge (darboğaz)'; butce.id = 'butce'; butce.ad = 'Bütçe';
      return { ihtiyac: ihtiyac, denge: denge, butce: butce };
    }

    /* Rapor yardımcıları: parça gerekçesi, montaj sırası, kontrol listesi */
    function gerekce(k, s, pid) {
      var pr = PROFIL[pid], x = p(s, k), c = p(s, 'cpu'), m = p(s, 'anakart'), ks = p(s, 'kasa'), h = guc(s), g = p(s, 'gpu');
      if (!x) return k === 'depo2' ? 'Ek sürücü yok.' : '—';
      if (k === 'cpu') return x.cekirdek + ' çekirdek (profil en az ' + pr.cekirdek + ' istiyor); Soket ' + x.soket + ' anakartla eşleşiyor, ' + x.tdp + ' W TDP.' + (x.igpu && g && g.yok ? ' Tümleşik grafik görüntüyü karşılıyor.' : '');
      if (k === 'anakart') return 'Soket ' + x.soket + ', ' + x.ram + ' yuvalı, ' + x.ff + '; ' + x.m2 + ' M.2 yuvası ve ' + x.sata + ' SATA portu seçilen sürücülere yetiyor.';
      if (k === 'bellek') return x.gb + ' GB (profil en az ' + pr.ram + ' GB istiyor); ' + (x.modul >= 2 ? x.modul + ' modül çift kanal çalışır.' : 'tek modül: tek kanal, raporda gerekçelendirilmeli.');
      if (k === 'depo1') return 'Sistem sürücüsü ' + (x.nvme ? 'NVMe SSD: hızlı açılış ve dosya yükleme.' : x.ssd ? 'SATA SSD.' : 'HDD: yavaş, önerilmez.');
      if (k === 'depo2') return 'Ek depolama: ' + (x.ssd ? 'hızlı proje alanı.' : 'büyük dosya ve yedek arşivi.');
      if (k === 'gpu') return x.yok ? 'Profil ayrı ekran kartı gerektirmiyor; tümleşik grafik kullanılıyor.' :
        'Seviye ' + x.seviye + ' (profil en az ' + pr.gpu + '); ' + x.boy + ' mm, kasa en çok ' + (ks ? ks.gpu : '?') + ' mm alıyor.';
      if (k === 'sogutucu') return x.w + ' W ≥ işlemci ' + (c ? c.tdp : '?') + ' W; ' + x.boy + ' mm, kasa sınırı ' + (ks ? ks.sog : '?') + ' mm.';
      if (k === 'psu') return x.w + ' W: tüketim ' + h.toplam + ' W × 1,3 = ' + h.gereken + ' W (pay ' + yuzde(h.pay) + '); ' + x.pin + '× 8-pin PCIe' + (g && g.pin ? ', kart ' + g.pin + ' istiyor.' : '.');
      if (k === 'kasa') return x.ff[0] + ' kasa ' + (m ? m.ff : '') + ' anakartı, ' + (g && !g.yok ? g.boy + ' mm kartı ' : '') + 've soğutucuyu alıyor.';
      return '';
    }
    function montaj(s) {
      var c = p(s, 'cpu'), r = p(s, 'bellek'), m = p(s, 'anakart'), g = p(s, 'gpu'), d = suruculer(s);
      var m2 = d.filter(function (x) { return x.arayuz === 'm2'; }).length, sa = d.length - m2, a = [];
      a.push('Hazırlık: fiş çekili, ESD bilekliği takılı; parçalar antistatik yüzeyde, kılavuz açık.');
      a.push('İşlemci: Soket ' + c.soket + '’ya köşe üçgeni hizalı, bastırmadan yerleştir; kolu kapat.');
      a.push('Bellek: ' + r.modul + ' modülü (' + r.tur + ') çentik hizalı, kılavuzdaki önerilen yuvalara tak.');
      if (m2) a.push('M.2 SSD: ' + m2 + ' sürücüyü M.2 yuvasına eğik tak, vidasıyla sabitle.');
      a.push('Soğutucu: termal macunla işlemcinin üstüne sabitle; fan kablosunu CPU_FAN girişine tak.');
      a.push('Kasa: ' + m.ff + ' düzenine göre ara vidaları kontrol et, anakartı yerleştirip vidala.');
      a.push('Güç kaynağı: kasaya vidala; 24-pin anakart ve 8-pin işlemci (EPS) kablolarını tak.');
      if (sa) a.push('SATA sürücü: ' + sa + ' sürücüyü yuvaya vidala; SATA veri ve güç kablolarını bağla.');
      if (g && !g.yok) a.push('Ekran kartı: üstteki PCIe x16 yuvasına tak, kasaya vidala' + (g.pin ? '; ' + g.pin + '× 8-pin PCIe güç kablosunu bağla.' : '.'));
      a.push('Ön panel, fan ve USB kablolarını kılavuza göre bağla; kabloları düzenle.');
      a.push('İlk açılış: POST’u izle, UEFI’de işlemci, bellek ve disklerin tanındığını doğrula.' +
        (kural('soket', s).d === 'uyari' ? ' Önce UEFI güncellemesi yapılmalı.' : ''));
      return a;
    }
    function kontrolListesi(s, pid) {
      var k = denetle(s), pd = profilDenetle(s, pid), h = guc(s);
      return [
        { t: 'Uyumluluk tablosunda kırmızı satır yok', oto: !k.some(function (x) { return x.d === 'hata' || x.d === 'bos'; }) },
        { t: 'Güç payı en az %30', oto: !!(h && h.pay >= PAY_HEDEF) },
        { t: 'Bütçe aşılmadı', oto: pd.butce.d === 'ok' },
        { t: 'Sarı satırların gerekçesi rapora yazıldı' },
        { t: 'Montaj adımlarının tarih-saatli fotoğrafları eklendi' },
        { t: 'UEFI’de bellek ve diskler tanındı (ekran görüntüsü)' },
        { t: 'Aygıt Yöneticisi’nde uyarı yok (ekran görüntüsü)' },
        { t: 'Jüri için üç teknik gerekçe hazır' }
      ];
    }

    /* ─── Panel: parça seçicileri + uyumluluk ışıkları + gerekçe ─── */
    var SIMGE = { ok: '✓', uyari: '!', hata: '✗', bos: '–' };
    var DURUM_AD = { ok: 'uyumlu', uyari: 'dikkat', hata: 'uyumsuz', bos: 'seçim bekleniyor' };
    function e(t, sinif, ata, metin) {
      var x = document.createElement(t);
      if (sinif) x.className = sinif;
      if (metin != null) x.textContent = metin;
      if (ata) ata.appendChild(x);
      return x;
    }
    function isikCiz(el, r) {
      el.className = el.className.replace(/\bd-(ok|uyari|hata|bos)\b/g, '').trim() + ' d-' + r.d;
      var i = el.querySelector('.uy-isik'), k = el.querySelector('.uy-k-kisa');
      if (i) i.textContent = SIMGE[r.d];
      if (k) k.textContent = r.kisa;
      el.setAttribute('aria-label', r.ad + ': ' + DURUM_AD[r.d] + ', ' + r.kisa);
    }
    function panel(kok, ay) {
      ay = ay || {};
      var pid = ay.profil || 'ofis', s = {}, secililer = {}, odakId = null;
      KATEGORI.forEach(function (c) { s[c.k] = (ay.secim && ay.secim[c.k]) || null; });
      kok.innerHTML = '';
      var u = e('div', 'uy', kok);
      var ust = e('div', 'uy-ust', u);
      var prK = e('label', 'uy-profil', ust);
      e('span', '', prK, 'Profil');
      var prSel;
      if (ay.profilSabit) { e('b', 'uy-profil-ad', prK, PROFIL[pid].ad); } else {
        prSel = e('select', '', prK);
        PROFIL_SIRA.forEach(function (id) { var o = e('option', '', prSel, PROFIL[id].ad); o.value = id; });
        prSel.value = pid;
        prSel.addEventListener('change', function () { pid = prSel.value; guncelle('profil'); });
      }
      var bt = e('div', 'uy-butce', ust);
      var btUst = e('div', 'uy-butce-ust', bt);
      e('span', '', btUst, 'Bütçe');
      var btSay = e('b', '', btUst, '');
      var btBar = e('div', 'uy-butce-bar', bt);
      var btDolu = e('span', '', btBar);
      var govde = e('div', 'uy-govde', u);
      var pk = e('div', 'uy-parcalar', govde);
      var pb = e('div', 'uy-p uy-p-bas', pk); e('span', '', pb, 'Parça'); e('span', '', pb, 'Seçim'); e('span', '', pb, 'Puan');
      var selEl = {}, puanEl = {};
      KATEGORI.forEach(function (c) {
        var row = e('label', 'uy-p', pk);
        e('span', 'uy-p-ad', row, c.ad);
        var sel = e('select', '', row);
        sel.setAttribute('aria-label', c.ad);
        var o0 = e('option', '', sel, c.istege || '— seç —'); o0.value = '';
        KATALOG[c.liste].forEach(function (x) { var o = e('option', '', sel, x.ad); o.value = x.id; });
        sel.value = s[c.k] || '';
        sel.addEventListener('change', function () { s[c.k] = sel.value || null; guncelle(c.k); });
        selEl[c.k] = sel; puanEl[c.k] = e('span', 'uy-p-puan', row, '');
      });
      var dk = e('div', 'uy-denetim', govde);
      e('div', 'uy-d-bas', dk, 'Uyumluluk');
      var satir = {};
      function satirYap(id, ad) {
        var b = e('button', 'uy-k', dk); b.type = 'button';
        e('span', 'uy-isik', b); e('span', 'uy-k-ad', b, ad); e('span', 'uy-k-kisa', b);
        b.addEventListener('click', function () { odakId = id; detayYaz(); });
        satir[id] = b;
      }
      KURAL.forEach(function (k) { satirYap(k.id, k.ad); });
      e('div', 'uy-d-bas', dk, 'Profil');
      [['ihtiyac', 'İhtiyaç'], ['denge', 'Denge'], ['butce', 'Bütçe']].forEach(function (x) { satirYap(x[0], x[1]); });
      var detay = e('div', 'uy-detay', u);
      detay.setAttribute('aria-live', 'polite');
      var dIsik = e('span', 'uy-isik', detay), dMetin = e('div', 'uy-detay-m', detay);
      var dBas = e('b', '', dMetin), dNeden = e('span', '', dMetin);
      var son = null;
      function hepsi() {
        var k = denetle(s), pd = profilDenetle(s, pid), m = {};
        k.forEach(function (x) { m[x.id] = x; });
        m.ihtiyac = pd.ihtiyac; m.denge = pd.denge; m.butce = pd.butce;
        return { liste: k, map: m, profil: pd };
      }
      function detayYaz() {
        if (!son || !odakId) return;
        var r = son.map[odakId];
        Object.keys(satir).forEach(function (id) { satir[id].classList.toggle('secili', id === odakId); });
        detay.className = 'uy-detay d-' + r.d;
        dIsik.textContent = SIMGE[r.d];
        dBas.textContent = r.ad + ' · ' + DURUM_AD[r.d];
        dNeden.textContent = r.neden;
      }
      function guncelle(neden) {
        var onceki = son;
        son = hepsi();
        Object.keys(satir).forEach(function (id) {
          var r = son.map[id];
          isikCiz(satir[id], r);
          if (onceki && onceki.map[id].d !== r.d && !AZ) {
            satir[id].classList.remove('yeni'); void satir[id].offsetWidth; satir[id].classList.add('yeni');
          }
        });
        KATEGORI.forEach(function (c) { var x = p(s, c.k); puanEl[c.k].textContent = x ? x.puan : '—'; selEl[c.k].value = s[c.k] || ''; });
        var t = puan(s), pr = PROFIL[pid];
        btSay.textContent = t + ' / ' + pr.butce + ' puan';
        btDolu.style.width = Math.min(100, t / pr.butce * 100) + '%';
        bt.classList.toggle('asti', t > pr.butce);
        if (prSel) prSel.value = pid;
        /* Odak: değişen parçayla ilgili en kötü kural (A-VURGU) */
        if (neden && neden !== 'ilk') {
          var aday = KURAL.filter(function (k) { return neden === 'profil' ? false : k.parca.indexOf(neden) >= 0; }).map(function (k) { return son.map[k.id]; });
          if (neden === 'profil') aday = [son.map.ihtiyac, son.map.butce];
          var sira = { hata: 0, uyari: 1, ok: 2, bos: 3 };
          aday.sort(function (a, b) { return sira[a.d] - sira[b.d]; });
          if (aday.length) odakId = aday[0].id;
        }
        if (!odakId) {
          var ilk = son.liste.filter(function (x) { return x.d === 'hata'; })[0] || son.liste[0];
          odakId = ilk.id;
        }
        detayYaz();
        if (ay.onDegis) ay.onDegis(api.durum(), neden);
      }
      var api = {
        kok: u,
        durum: function () {
          var h = son || hepsi();
          var kirmizi = h.liste.some(function (x) { return x.d === 'hata' || x.d === 'bos'; });
          return { secim: JSON.parse(JSON.stringify(s)), profil: pid, kurallar: h.liste, map: h.map, pd: h.profil,
                   guc: guc(s), puan: puan(s), tam: tamMi(s), uyumlu: tamMi(s) && !kirmizi,
                   gecti: tamMi(s) && !kirmizi && h.profil.ihtiyac.d === 'ok' && h.profil.butce.d === 'ok' };
        },
        secimAyarla: function (yeni, neden) { KATEGORI.forEach(function (c) { if (yeni.hasOwnProperty(c.k)) s[c.k] = yeni[c.k]; }); guncelle(neden || 'ilk'); },
        profilAyarla: function (id) { pid = id; guncelle('profil'); },
        odakla: function (id) { odakId = id; detayYaz(); }
      };
      guncelle('ilk');
      return api;
    }

    return { KATEGORI: KATEGORI, KATALOG: KATALOG, PARCA: PARCA, PROFIL: PROFIL, PROFIL_SIRA: PROFIL_SIRA, KURAL: KURAL,
             PAY_HEDEF: PAY_HEDEF, PAY_ALT: PAY_ALT, TABAN: TABAN, SIMGE: SIMGE, DURUM_AD: DURUM_AD,
             kural: kural, denetle: denetle, guc: guc, puan: puan, tamMi: tamMi, profilDenetle: profilDenetle,
             gerekce: gerekce, montaj: montaj, kontrolListesi: kontrolListesi, isikCiz: isikCiz, panel: panel };
  })();
/* ═══════════════ E-UYUMLULUK ÇEKİRDEĞİ · SON ═══════════════ */

  DERS.tahminKur('Tahminini aldık. Adım 1’deki görüşme provasında iki profili karşılaştıracağız.');

  function el(etiket, sinif, ebeveyn, metin) {
    var x = document.createElement(etiket);
    if (sinif) x.className = sinif;
    if (metin != null) x.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(x);
    return x;
  }
  function ses(ad) { try { if (D && D.ses) D.ses(ad); } catch (x) { /* ses isteğe bağlı */ } }
  var P = UYUM.PARCA;
  /* Örnek proje (tasarım profili): provalarda kullanılır */
  var ORNEK = { cpu: 'cpu2', anakart: 'mb2', bellek: 'ram3', depo1: 'ssd2', depo2: null, gpu: 'gpu1', sogutucu: 'sog2', psu: 'psu2', kasa: 'kasa3' };

  /* ─────────── Prova oynatıcı: Oynat / Adım ▶ / Baştan + alt yazı ─────────── */
  function prova(id, baslik, kur) {
    var kok = document.getElementById(id);
    if (!kok) return;
    var ek = el('div', 'ek', kok), bas = el('div', 'ek-bas', ek);
    el('span', 'ek-nokta', bas); el('span', 'ek-nokta', bas); el('span', 'ek-baslik', bas, baslik);
    var govde = el('div', 'ek-govde', ek);
    var alt = el('div', 'pv-alt', kok), yazi = el('div', 'pv-yazi', alt);
    yazi.setAttribute('aria-live', 'polite');
    var ctl = el('div', 'secici pv-kontrol', alt);
    var api = kur(govde);
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
        if (ileri()) setTimeout(dongu, AZ ? 20 : (api.adimlar[n - 1].sure || 2.6) * 1000);
      })();
    }
    DERS.dugme(ctl, 'Oynat', oynat);
    DERS.dugme(ctl, 'Adım ▶', function () { surum++; if (n >= api.adimlar.length) sifirla(); ileri(); });
    DERS.dugme(ctl, 'Baştan', sifirla);
    sifirla();
    DERS.slaytAcilinca(kok.closest('.slide').id, function () {
      if (AZ) { sifirla(); while (ileri()) { /* son duruma */ } } else setTimeout(oynat, 400);
    });
  }

  /* ─────────── Adım 1: ihtiyaç görüşmesi ─────────── */
  prova('pv-ihtiyac', 'İhtiyaç görüşme formu', function (g) {
    var SAT = [['kim', 'Kullanıcı'], ['is', 'İş ve programlar'], ['sure', 'Kullanım'], ['butce', 'Bütçe'], ['istek', 'Özel istek']];
    var form = el('div', 'ih-form', g), s = {};
    SAT.forEach(function (x) { var r = el('div', 'ih-s', form); el('span', '', r, x[1]); s[x[0]] = el('b', '', r, '—'); });
    var cik = el('div', 'ih-cikti', g);
    var k1 = el('div', 'ih-kol', cik), k2 = el('div', 'ih-kol ih-kol2', cik);
    el('span', 'ih-cb', k1, 'Tasarım · en az gereksinim'); var c1 = el('div', 'ih-cips', k1);
    el('span', 'ih-cb', k2, 'Oyun · aynı bütçe, farklı öncelik'); var c2 = el('div', 'ih-cips', k2);
    function yaz(k, v) { Object.keys(s).forEach(function (x) { s[x].parentNode.classList.remove('simdi'); }); s[k].textContent = v; s[k].parentNode.classList.add('dolu', 'simdi'); }
    function cip(ata, liste) { ata.innerHTML = ''; liste.forEach(function (t, i) { var c = el('span', 'ih-cip', ata, t); c.style.animationDelay = (AZ ? 0 : i * 0.15) + 's'; }); }
    var t = UYUM.PROFIL.tasarim, o = UYUM.PROFIL.oyun;
    return {
      sifirla: function () { Object.keys(s).forEach(function (x) { s[x].textContent = '—'; s[x].parentNode.classList.remove('dolu', 'simdi'); }); c1.innerHTML = ''; c2.innerHTML = ''; k2.classList.remove('gor'); },
      adimlar: [
        { yazi: 'Kim kullanacak? Profil buradan başlar.', fn: function () { yaz('kim', 'Grafik tasarım öğrencisi'); } },
        { yazi: 'Hangi işler yapılacak? Program adı değil, iş türü yazılır.', fn: function () { yaz('is', t.ornek); } },
        { yazi: 'Ne kadar süre, ne yoğunlukta? Uzun kullanım biraz pay ister.', fn: function () { yaz('sure', '4–5 yıl · günde 6 saat'); } },
        { yazi: 'Bütçe ve özel istekler: puan birimiyle.', fn: function () { yaz('butce', t.butce + ' puan'); yaz('istek', 'Sessiz çalışsın, 2 monitör'); } },
        { yazi: 'Görüşmeden sayısal gereksinim çıkar.', sure: 3, fn: function () {
          Object.keys(s).forEach(function (x) { s[x].parentNode.classList.remove('simdi'); });
          cip(c1, ['çekirdek ≥ ' + t.cekirdek, 'bellek ≥ ' + t.ram + ' GB', '1 TB NVMe', 'kart seviye ≥ ' + t.gpu, '2 görüntü çıkışı']);
        } },
        { yazi: 'İkinci profil: aynı bütçede öncelik ekran kartına kayar.', sure: 3, fn: function () {
          k2.classList.add('gor'); cip(c2, ['kart seviye ≥ ' + o.gpu, 'çekirdek ≥ ' + o.cekirdek, 'bellek ≥ ' + o.ram + ' GB', o.butce + ' puan']);
        } }
      ],
      son: function (yazi) {
        if (DERS.tahmin == null) return;
        var n = el('span', 'pv-tahmin', yazi);
        n.textContent = '📌 ' + DERS.tahminNotu(1, 'İki profilin öncelikleri farklı.', 'Aynı bütçe bile farklı parçalara dağılır.');
      }
    };
  });

  /* ─────────── Adım 2: parça listesi ─────────── */
  prova('pv-liste', 'Parça listesi · tasarım profili', function (g) {
    var tb = el('div', 'ls-tablo', g), sat = {};
    var bs = el('div', 'ls-s ls-bas', tb); el('span', '', bs, 'Parça'); el('span', '', bs, 'Seçim'); el('span', '', bs, 'Puan');
    UYUM.KATEGORI.forEach(function (c) {
      if (c.k === 'depo2') return;
      var r = el('div', 'ls-s', tb); el('span', 'ls-ad', r, c.ad); var v = el('span', 'ls-v', r, '—'); var pu = el('b', '', r, '');
      sat[c.k] = { r: r, v: v, p: pu };
    });
    var ger = el('div', 'ls-gerekce', g);
    var bt = el('div', 'ls-butce', g); el('span', '', bt, 'Toplam'); var btB = el('div', 'uy-butce-bar', bt); var btS = el('span', '', btB); var btT = el('b', '', bt, '');
    var s = {};
    function ekle(ks) {
      Object.keys(sat).forEach(function (k) { sat[k].r.classList.remove('simdi'); });
      ks.forEach(function (k) { s[k] = ORNEK[k]; var x = P[ORNEK[k]]; sat[k].v.textContent = x.ad; sat[k].p.textContent = x.puan; sat[k].r.classList.add('dolu', 'simdi'); });
      var son = ks[ks.length - 1];
      ger.innerHTML = '<b></b><span></span>'; ger.firstChild.textContent = 'Gerekçe · ' + UYUM.KATEGORI.filter(function (c) { return c.k === son; })[0].ad + ': ';
      ger.lastChild.textContent = UYUM.gerekce(son, Object.assign({}, ORNEK), 'tasarim');
      var t = UYUM.puan(s); btS.style.width = (t / UYUM.PROFIL.tasarim.butce * 100) + '%'; btT.textContent = t + ' / ' + UYUM.PROFIL.tasarim.butce + ' puan';
    }
    return {
      sifirla: function () { s = {}; Object.keys(sat).forEach(function (k) { sat[k].v.textContent = '—'; sat[k].p.textContent = ''; sat[k].r.classList.remove('dolu', 'simdi'); }); ger.textContent = ''; btS.style.width = '0'; btT.textContent = '0 / ' + UYUM.PROFIL.tasarim.butce + ' puan'; },
      adimlar: [
        { yazi: 'Tasarımda önce bellek ve depolama: en büyük öncelik.', fn: function () { ekle(['bellek', 'depo1']); } },
        { yazi: 'İşlemci ve anakart: 6 çekirdek, aynı soket, DDR5 yuva.', fn: function () { ekle(['cpu', 'anakart']); } },
        { yazi: 'Ekran kartı: profilin istediği seviye yeter; fazlası bütçeyi yer.', fn: function () { ekle(['gpu']); } },
        { yazi: 'Soğutucu, güç kaynağı ve kasa kurallara göre seçilir.', sure: 3, fn: function () { ekle(['sogutucu', 'psu', 'kasa']); } },
        { yazi: 'Toplam bütçenin altında; kalan puan gerekçeyle bir önceliğe aktarılabilir.', fn: function () { Object.keys(sat).forEach(function (k) { sat[k].r.classList.remove('simdi'); }); bt.classList.add('vurgu'); setTimeout(function () { bt.classList.remove('vurgu'); }, 1200); } }
      ]
    };
  });

  /* ─────────── Adım 3: uyumluluk tablosu (E-UYUMLULUK çekirdeğiyle) ─────────── */
  prova('pv-uyum', 'Uyumluluk tablosu · taslak liste', function (g) {
    var TASLAK = Object.assign({}, ORNEK, { kasa: 'kasa2' });
    var s = Object.assign({}, TASLAK);
    var tb = el('div', 'ut', g), sat = {};
    UYUM.KURAL.forEach(function (k) {
      var r = el('div', 'uy-k ut-s', tb); el('span', 'uy-isik', r); el('span', 'uy-k-ad', r, k.ad); el('span', 'uy-k-kisa', r, '');
      sat[k.id] = r;
    });
    var gk = el('div', 'ut-guc', g);
    function goster(ids) { ids.forEach(function (id) { var r = UYUM.kural(id, s); UYUM.isikCiz(sat[id], r); sat[id].classList.add('gor'); }); }
    var ids = UYUM.KURAL.map(function (k) { return k.id; });
    return {
      sifirla: function () { s = Object.assign({}, TASLAK); ids.forEach(function (id) { sat[id].className = 'uy-k ut-s'; sat[id].querySelector('.uy-isik').textContent = ''; sat[id].querySelector('.uy-k-kisa').textContent = ''; }); gk.textContent = ''; gk.className = 'ut-guc'; },
      adimlar: [
        { yazi: 'Taslak liste kurallardan tek tek geçer: işlemci, bellek…', fn: function () { goster(ids.slice(0, 4)); } },
        { yazi: '…depolama, kart uzunluğu, güç ve konnektör…', fn: function () { goster(ids.slice(4, 8)); } },
        { yazi: '…soğutucu ve görüntü çıkışı.', fn: function () { goster(ids.slice(8)); } },
        { yazi: 'Kırmızı satır: ATX anakart mATX kasaya sığmaz. Rapor bu hâliyle teslim edilmez.', sure: 3.2, fn: function () { sat.form.classList.add('yeni', 'secili'); } },
        { yazi: 'Düzeltme: ATX orta kule kasa. Satır yeşile döner; değişiklik rapora not edilir.', sure: 3.2, fn: function () { s.kasa = 'kasa3'; sat.form.classList.remove('yeni'); void sat.form.offsetWidth; goster(ids); sat.form.classList.add('yeni'); } },
        { yazi: 'Güç hesabı ayrı kutuda gösterilir.', sure: 3, fn: function () {
          var h = UYUM.guc(s); sat.form.classList.remove('secili');
          gk.className = 'ut-guc gor'; gk.textContent = 'Güç: ' + h.cpu + ' + ' + h.gpu + ' + ' + h.diger + ' = ' + h.toplam + ' W · × 1,3 = ' + h.gereken + ' W ≤ ' + h.psu + ' W ✓';
        } }
      ]
    };
  });

  /* ─────────── Adım 4: kanıt klasörü ─────────── */
  prova('pv-kanit', 'Kanıt klasörü · montaj ve kurulum', function (g) {
    var FOTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
    var EKRAN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M6 8h8M6 12h5"/></svg>';
    var K = [['Parçalar ve ESD düzeni', FOTO, '10:05 · Ece'], ['İşlemci ve soğutucu', FOTO, '10:18 · Deniz'], ['Bellek ve M.2', FOTO, '10:26 · Mert'],
             ['Kablo düzeni', FOTO, '10:52 · Zeynep'], ['UEFI: bellek ve disk', EKRAN, '11:04 · Deniz'], ['Aygıt Yöneticisi: uyarı yok', EKRAN, '11:40 · Ece']];
    var iz = el('div', 'kn-izgara', g), kutu = [];
    K.forEach(function (x, i) {
      var k = el('div', 'kn-k', iz);
      var r = el('span', 'kn-resim', k); r.innerHTML = x[1];
      el('b', '', k, 'Kanıt ' + (i + 1) + ' · ' + x[0]); el('small', '', k, x[2]);
      kutu.push(k);
    });
    var gun = el('div', 'kn-gunluk', g);
    function ac(a, b) { for (var i = a; i < b; i++) kutu[i].classList.add('dolu'); }
    return {
      sifirla: function () { kutu.forEach(function (k) { k.classList.remove('dolu'); }); gun.textContent = ''; gun.classList.remove('gor'); },
      adimlar: [
        { yazi: 'Hazırlık ve işlemci adımı: grup etiketi ve saat görünür.', fn: function () { ac(0, 2); } },
        { yazi: 'Bellek, M.2 ve kablo düzeni: her adım bir kanıt.', fn: function () { ac(2, 4); } },
        { yazi: 'Kurulum kanıtı: UEFI’de bellek ve disk, uyarısız Aygıt Yöneticisi.', fn: function () { ac(4, 6); } },
        { yazi: 'Montaj günlüğü her kanıtı adım, zaman, kişi ve sonuçla bağlar.', sure: 3, fn: function () { gun.classList.add('gor'); gun.textContent = 'Günlük: Adım 5 · 11:04 · Deniz · UEFI’de 32 GB DDR5 ve 1 TB NVMe görüldü → Kanıt 5'; } }
      ]
    };
  });

  /* ─────────── Adım 5: rapor iskeleti ─────────── */
  prova('pv-rapor', 'Rapor taslağı', function (g) {
    var B = ['Kapak ve içindekiler', '1 · İhtiyaç analizi (2 profil)', '2 · Parça listesi ve gerekçeler', '3 · Uyumluluk tablosu ve güç hesabı', '4 · Montaj sırası', '5 · Kanıtlar (numaralı)', '6 · Sonuç ve öneriler', 'Ek · Kontrol listesi'];
    var d = el('div', 'rt', g), sol = el('div', 'rt-sayfa', d), ol = el('ol', 'rt-liste', sol), li = [];
    B.forEach(function (b) { li.push(el('li', '', ol, b)); });
    var ornek = el('div', 'rt-ornek', d);
    function ac(a, b) { for (var i = a; i < b; i++) li[i].classList.add('dolu'); }
    return {
      sifirla: function () { li.forEach(function (x) { x.classList.remove('dolu'); }); ornek.innerHTML = ''; ornek.classList.remove('gor'); },
      adimlar: [
        { yazi: 'İskelet: kapak, içindekiler, ihtiyaç analizi.', fn: function () { ac(0, 2); } },
        { yazi: 'Öneri: parça listesi, uyumluluk ve güç hesabı.', fn: function () { ac(2, 4); } },
        { yazi: 'Uygulama: montaj sırası ve numaralı kanıtlar.', fn: function () { ac(4, 6); } },
        { yazi: 'Sonuç ve kontrol listesi raporu kapatır.', fn: function () { ac(6, 8); } },
        { yazi: 'Her iddianın yanında kanıt numarası olur.', sure: 3.2, fn: function () {
          ornek.classList.add('gor');
          ornek.innerHTML = '<b>İddia → kanıt</b><span>“Bellek çift kanal çalışıyor.” → Kanıt 5</span><span>“Kart kasaya 25 mm payla sığdı.” → Kanıt 3</span><span>“Aygıtların sürücüleri tam.” → Kanıt 6</span>';
        } }
      ]
    };
  });

  /* ─────────── Adım 6: jüri sunumu akışı ─────────── */
  prova('pv-sunum', 'Jüri sunumu · 5 dakika', function (g) {
    var S = [['İhtiyaç', '#f59e0b'], ['Öneri', '#6366f1'], ['Uyumluluk + güç', '#10b981'], ['Kanıt', '#0ea5e9'], ['Özet', '#a855f7']];
    var z = el('div', 'sn-zaman', g), seg = [];
    S.forEach(function (x, i) { var s = el('span', 'sn-seg', z); s.style.background = x[1]; el('b', '', s, x[0]); el('small', '', s, (i + 1) + '. dk'); seg.push(s); });
    var jr = el('div', 'sn-juri', g), bal = [];
    el('div', 'sn-sahne', jr).innerHTML = '<svg viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sunum sahnesi: perdede uyumluluk tablosu, yanında sunucu öğrenci, karşıda üç kişilik jüri masası">' +
      '<rect x="20" y="8" width="120" height="70" rx="4" fill="#fff" stroke="#94a3b8" stroke-width="2"/>' +
      [0, 1, 2, 3].map(function (i) { return '<circle cx="34" cy="' + (22 + i * 14) + '" r="4" fill="' + (i === 2 ? '#f59e0b' : '#10b981') + '"/><rect x="44" y="' + (20 + i * 14) + '" width="' + (80 - i * 8) + '" height="4" rx="2" fill="#cbd5e1"/>'; }).join('') +
      '<circle cx="160" cy="44" r="9" fill="#fcd34d"/><path d="M148 84 q0 -26 12 -26 q12 0 12 26z" fill="#6366f1"/><path d="M150 64 L138 52" stroke="#6366f1" stroke-width="4" stroke-linecap="round"/>' +
      [220, 248, 276].map(function (x) { return '<circle cx="' + x + '" cy="54" r="8" fill="#c7d2fe"/><path d="M' + (x - 11) + ' 80 q0 -14 11 -14 q11 0 11 14z" fill="#818cf8"/>'; }).join('') +
      '<rect x="200" y="80" width="92" height="9" rx="3" fill="#475569"/><text x="246" y="104" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="800" fill="#475569" text-anchor="middle">jüri</text></svg>';
    ['“Güç payını nasıl hesapladınız?”', '“Neden bu ekran kartı?”', '“Kanıtınız hangi sayfada?”'].forEach(function (q) { bal.push(el('span', 'sn-balon', jr, q)); });
    var ipucu = el('div', 'sn-ipucu', g);
    return {
      sifirla: function () { seg.forEach(function (x) { x.classList.remove('dolu'); }); bal.forEach(function (x) { x.classList.remove('gor'); }); ipucu.textContent = ''; },
      adimlar: [
        { yazi: '1. dakika: kullanıcı ve ihtiyaç; 2. dakika: önerilen sistem.', fn: function () { seg[0].classList.add('dolu'); seg[1].classList.add('dolu'); } },
        { yazi: '3. dakika: uyumluluk tablosu ve güç hesabı.', fn: function () { seg[2].classList.add('dolu'); } },
        { yazi: '4.–5. dakika: kanıtlar ve bir cümlelik özet.', fn: function () { seg[3].classList.add('dolu'); seg[4].classList.add('dolu'); } },
        { yazi: 'Jüri soruları gelir: önceden tahmin edilip hazırlanır.', sure: 3, fn: function () { bal.forEach(function (x, i) { setTimeout(function () { x.classList.add('gor'); }, AZ ? 0 : i * 450); }); } },
        { yazi: 'Güçlü cevap: sayı + kural + kanıt numarası.', fn: function () { ipucu.textContent = '“Tüketim 198 W; × 1,3 = 257 W; 550 W güç kaynağı yeterli (rapor, bölüm 3).”'; } }
      ]
    };
  });

  /* ─────────── Etkinlik 1: E-UYUMLULUK projede — iki profil, otomatik rapor kartı ─────────── */
  (function () {
    var kok = document.getElementById('uy-proje');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var li = document.querySelectorAll('#rp-gorevler li');
    var raporlar = {}, panel = null, rp = null, acBtn = null;
    function ilerleme() {
      var n = Object.keys(raporlar).length;
      if (li[0]) { li[0].classList.toggle('tamam', n >= 1); li[0].classList.toggle('simdi', n < 1); }
      if (li[1]) { li[1].classList.toggle('tamam', n >= 2); li[1].classList.toggle('simdi', n === 1); }
      ilerle(Math.min(n, 2), 2);
    }
    panel = UYUM.panel(kok, { profil: 'ofis', onDegis: function (d) {
      if (acBtn) acBtn.disabled = !d.gecti;
      if (d.gecti && !raporlar[d.profil]) {
        raporlar[d.profil] = true; ilerleme();
        setTimeout(function () { raporAc(); }, AZ ? 0 : 350);
        if (Object.keys(raporlar).length === 2) DERS.konfeti();
        ses('klik');
      }
    } });
    var alt = el('div', 'uy-alt', panel.kok);
    acBtn = DERS.dugme(alt, 'Raporu aç', function () { raporAc(); });
    acBtn.disabled = !panel.durum().gecti;
    rp = el('div', 'rp', panel.kok); rp.hidden = true;
    rp.setAttribute('role', 'dialog'); rp.setAttribute('aria-label', 'Sistem Önerisi ve Montaj Raporu');
    function bolum(ata, baslik) { var b = el('section', 'rp-b', ata); el('h4', '', b, baslik); return b; }
    function raporAc() {
      var d = panel.durum();
      if (!d.gecti) return;
      var pr = UYUM.PROFIL[d.profil], s = d.secim, h = d.guc;
      rp.innerHTML = ''; rp.hidden = false;
      var bas = el('div', 'rp-bas', rp);
      var bb = el('div', 'rp-bas-m', bas);
      el('b', '', bb, 'Sistem Önerisi ve Montaj Raporu');
      el('span', '', bb, 'Profil: ' + pr.ad + ' · ' + d.puan + ' / ' + pr.butce + ' puan · ' + new Date().toLocaleDateString('tr-TR'));
      var dg = el('div', 'rp-dg', bas);
      var mesaj = el('span', 'rp-mesaj', rp);
      DERS.dugme(dg, 'Metni kopyala', function () { kopyala(d, mesaj); });
      var kap = DERS.dugme(dg, 'Listeye dön', function () { rp.hidden = true; try { acBtn.focus(); } catch (x) { /* odak isteğe bağlı */ } });
      var gv = el('div', 'rp-govde', rp);
      var b1 = bolum(gv, '1 · Parça listesi');
      var t = el('table', 'rp-tablo', b1), tb = el('tbody', '', t);
      UYUM.KATEGORI.forEach(function (c) {
        var x = s[c.k] && P[s[c.k]]; if (!x) return;
        var r = el('tr', '', tb); el('th', '', r, c.ad); el('td', '', r, x.ad); el('td', 'rp-puan', r, String(x.puan));
      });
      var rt = el('tr', 'rp-toplam', tb); el('th', '', rt, 'Toplam'); el('td', '', rt, 'Bütçe ' + pr.butce + ' puan'); el('td', 'rp-puan', rt, String(d.puan));
      var b2 = bolum(gv, '2 · Gerekçeler');
      var ul2 = el('ul', '', b2);
      UYUM.KATEGORI.forEach(function (c) { if (!s[c.k]) return; var l = el('li', '', ul2); el('b', '', l, c.ad + ': '); l.appendChild(document.createTextNode(UYUM.gerekce(c.k, s, d.profil))); });
      var b3 = bolum(gv, '3 · Uyumluluk tablosu');
      var ut = el('div', 'rp-uyum', b3);
      d.kurallar.concat([d.map.ihtiyac, d.map.denge, d.map.butce]).forEach(function (r) {
        var x = el('div', 'uy-k rp-k', ut); el('span', 'uy-isik', x); el('span', 'uy-k-ad', x, r.ad); el('span', 'uy-k-kisa', x);
        UYUM.isikCiz(x, r);
        if (r.d === 'uyari') el('span', 'rp-sari', x, 'Gerekçe yaz: ' + r.neden);
      });
      var b4 = bolum(gv, '4 · Güç hesabı');
      el('p', 'rp-guc', b4, 'İşlemci ' + h.cpu + ' W + ekran kartı ' + h.gpu + ' W + diğer ' + h.diger + ' W = ' + h.toplam + ' W. %30 payla gereken: ' + h.toplam + ' × 1,3 = ' + h.gereken + ' W. Seçilen güç kaynağı ' + h.psu + ' W → pay %' + Math.round(h.pay * 100) + '.');
      var b5 = bolum(gv, '5 · Montaj sırası özeti');
      var ol = el('ol', '', b5);
      UYUM.montaj(s).forEach(function (m) { el('li', '', ol, m); });
      var b6 = bolum(gv, '6 · Kontrol listesi');
      var kl = el('ul', 'rp-kontrol', b6);
      UYUM.kontrolListesi(s, d.profil).forEach(function (k, i) {
        var l = el('li', '', kl);
        if (k.oto != null) { el('span', 'rp-oto ' + (k.oto ? 'evet' : 'hayir'), l, k.oto ? '✓' : '!'); el('span', '', l, k.t + ' (otomatik)'); }
        else { var lb = el('label', '', l); var cb = el('input', '', lb); cb.type = 'checkbox'; cb.id = 'rp-k-' + i; el('span', '', lb, k.t); }
      });
      try { kap.focus({ preventScroll: true }); } catch (x) { /* odak isteğe bağlı */ }
    }
    function metin(d) {
      var pr = UYUM.PROFIL[d.profil], s = d.secim, h = d.guc, a = [];
      a.push('SİSTEM ÖNERİSİ VE MONTAJ RAPORU — ' + pr.ad + ' (' + d.puan + ' / ' + pr.butce + ' puan)', '', '1. Parça listesi ve gerekçeler');
      UYUM.KATEGORI.forEach(function (c) { if (s[c.k]) a.push('- ' + c.ad + ': ' + P[s[c.k]].ad + ' (' + P[s[c.k]].puan + ' puan) — ' + UYUM.gerekce(c.k, s, d.profil)); });
      a.push('', '2. Uyumluluk tablosu');
      d.kurallar.forEach(function (r) { a.push('- [' + UYUM.SIMGE[r.d] + '] ' + r.ad + ': ' + r.kisa + ' — ' + r.neden); });
      a.push('', '3. Güç hesabı: ' + h.toplam + ' W × 1,3 = ' + h.gereken + ' W; güç kaynağı ' + h.psu + ' W (pay %' + Math.round(h.pay * 100) + ')', '', '4. Montaj sırası');
      UYUM.montaj(s).forEach(function (m, i) { a.push((i + 1) + '. ' + m); });
      a.push('', '5. Kontrol listesi');
      UYUM.kontrolListesi(s, d.profil).forEach(function (k) { a.push('[' + (k.oto ? 'x' : ' ') + '] ' + k.t); });
      return a.join('\n');
    }
    function kopyala(d, mesaj) {
      var m = metin(d);
      function tamam() { mesaj.textContent = '✓ Rapor metni panoya kopyalandı.'; }
      function olmadi() { mesaj.textContent = 'Kopyalanamadı: rapor kartındaki metni seçip kopyalayabilirsin.'; }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m).then(tamam, olmadi);
        else olmadi();
      } catch (x) { olmadi(); }
    }
    ilerleme();
  })();

  /* ─────────── Etkinlik 2: jüri provası ─────────── */
  (function () {
    var kok = document.getElementById('juri');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var SORU = [
      { q: 'Neden 650 W güç kaynağı? 850 W daha güvenli olmaz mı?', d: 1, s: [
        ['Büyük güç kaynağı her zaman daha iyidir ama bütçemiz yetmedi.', 'Hesap yok: tüketim ve pay söylenmedi. Jüri “ne kadar yeterdi?” diye sorar.'],
        ['Tüketim yaklaşık 408 W; %30 payla 530 W gerekir. 650 W yeterli; 850 W’ın farkı ekran kartına gitti.', 'Sayı + kural + bütçe kararı: en güçlü savunma.'],
        ['Satıcı 650 W’ın yeteceğini söyledi.', 'Başkasının sözü kanıt değildir; hesabı kendin göstermelisin.']] },
      { q: 'Tasarım profili için neden 32 GB bellek?', d: 0, s: [
        ['Profil en az 32 GB istiyor; büyük görüntü dosyaları belleği doldurur. 2 × 16 GB ile çift kanal çalışıyor.', 'İhtiyaç + teknik değer + kanal bilgisi: güçlü savunma.'],
        ['Bellek ne kadar çoksa bilgisayar o kadar hızlı olur.', 'Yanılgı: ihtiyacın üstündeki bellek hız kazandırmaz.'],
        ['64 GB pahalıydı, 16 GB az geldi.', 'Yarım gerekçe: ihtiyacın neden 32 GB olduğunu söylemiyor.']] },
      { q: 'Ekran kartı kasaya sığıyor mu, nereden biliyorsunuz?', d: 2, s: [
        ['Büyük bir kasa seçtik, sığar.', 'Tahmin; ölçü ya da kanıt yok.'],
        ['Zorlayarak da olsa taktık, çalışıyor.', 'Zorlamak parçaya zarar verir; ölçü kanıtı da yok.'],
        ['Kart 305 mm, kasa en çok 330 mm alıyor; 25 mm pay var. Kanıt 3’teki fotoğrafta görülüyor.', 'Ölçü + sınır + kanıt numarası: güçlü savunma.']] },
      { q: 'Tablonuzda soket satırı sarı. Bu işlemci bu anakartta nasıl çalışacak?', d: 1, s: [
        ['Soket aynıysa her işlemci çalışır; sarı önemli değil.', 'Yanılgı: çipset desteği ve firmware sürümü de gerekir.'],
        ['Soket aynı; çipset bu nesli UEFI güncellemesiyle destekliyor. Destek listesini kontrol ettik, güncellemeyi montajdan önce planladık.', 'Riski bilip önlemini planlamak: güçlü savunma.'],
        ['Çalışmazsa işlemciyi değiştiririz.', 'Plan yok; sarı satırın gerekçesi yazılmamış.']] },
      { q: 'Montajı gerçekten siz mi yaptınız? Kanıtınız ne?', d: 2, s: [
        ['Öğretmenimiz gördü.', 'Tanık tek başına rapora girmez; belge gerekir.'],
        ['İnternetteki bir montaj videosunu rapora ekledik.', 'Başkasının montajı senin kanıtın değildir.'],
        ['Her adımın tarih-saatli fotoğrafı ve montaj günlüğü var; UEFI’de bellek ve diskin tanındığı ekran Kanıt 5.', 'Doğrulanabilir, tarihli, numaralı kanıt: güçlü savunma.']] },
      { q: 'Bütçeniz kalsaydı neyi yükseltirdiniz?', d: 0, s: [
        ['Oyun profilinde darboğaz ekran kartında; kalan puanı bir üst karta verir, güç ve kasa satırlarını yeniden denetlerdik.', 'Darboğaz + yan etkilerin denetimi: güçlü savunma.'],
        ['En pahalı işlemciyi alırdık.', 'Profil önceliğine bakmıyor; darboğaz kartta ise işlemci kare hızını pek artırmaz.'],
        ['Kasaya aydınlatma eklerdik.', 'Görünüm tercih olabilir ama ihtiyaç ya da performans gerekçesi değildir.']] }
    ];
    kok.innerHTML = '<div class="jr"><div class="jr-ust"><svg class="jr-svg" viewBox="0 0 120 70" role="img" aria-label="Üç kişilik jüri masası">' +
      '<rect x="4" y="44" width="112" height="10" rx="3" fill="#475569"/>' +
      [24, 60, 96].map(function (x) { return '<circle cx="' + x + '" cy="20" r="9" fill="#c7d2fe"/><path d="M' + (x - 13) + ' 44 q0 -16 13 -16 q13 0 13 16z" fill="#818cf8"/>'; }).join('') +
      '</svg><div class="jr-balon"><small></small><b></b></div></div><div class="jr-sec" role="group" aria-label="Savunma seçenekleri"></div>' +
      '<div class="jr-geri" aria-live="polite"></div><div class="jr-alt"><div class="jr-noktalar"></div><button type="button" class="jr-sonraki">Sonraki soru ▶</button></div></div>';
    var q = function (c) { return kok.querySelector(c); };
    var secK = q('.jr-sec'), geri = q('.jr-geri'), nk = q('.jr-noktalar'), sonraki = q('.jr-sonraki');
    var bulundu = SORU.map(function () { return false; }), i = 0;
    var nokta = SORU.map(function (x, j) { var b = el('button', 'jr-nokta', nk, String(j + 1)); b.type = 'button'; b.setAttribute('aria-label', 'Soru ' + (j + 1)); b.addEventListener('click', function () { goster(j); }); return b; });
    function say() { var n = bulundu.filter(Boolean).length; ilerle(n, SORU.length); if (n === SORU.length && !say.bitti) { say.bitti = true; DERS.konfeti(); geri.className = 'jr-geri tamam'; geri.textContent = '✓ Altı soruda da en güçlü savunmayı buldun. Şimdi aynı soruları grubunla yüksek sesle prova et.'; } }
    function goster(j) {
      i = j;
      var S = SORU[i];
      q('.jr-balon small').textContent = 'Jüri sorusu ' + (i + 1) + ' / ' + SORU.length;
      q('.jr-balon b').textContent = '“' + S.q + '”';
      nokta.forEach(function (b, k) { b.classList.toggle('aktif', k === i); b.classList.toggle('tamam', bulundu[k]); });
      secK.innerHTML = ''; geri.className = 'jr-geri'; geri.textContent = bulundu[i] ? '✓ Bu soruda en güçlü savunmayı buldun.' : 'En güçlü savunmayı seç.';
      S.s.forEach(function (x, k) {
        var b = el('button', 'jr-s', secK); b.type = 'button';
        el('span', 'jr-harf', b, 'ABC'[k]); el('span', '', b, x[0]);
        if (bulundu[i] && k === S.d) b.classList.add('dogru');
        b.addEventListener('click', function () {
          var dogru = k === S.d;
          b.classList.add(dogru ? 'dogru' : 'yanlis');
          geri.className = 'jr-geri ' + (dogru ? 'dogru' : 'yanlis');
          geri.textContent = (dogru ? '✓ ' : '✗ ') + x[1];
          if (dogru) { bulundu[i] = true; nokta[i].classList.add('tamam'); ses('klik'); say(); } else ses('hata');
        });
      });
      sonraki.disabled = false;
    }
    sonraki.addEventListener('click', function () { goster((i + 1) % SORU.length); });
    goster(0); say();
  })();
})();
