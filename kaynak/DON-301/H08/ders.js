/* DON-301 H08 — Uyumluluk ve Sistem Toplama · ders betiği (ortak betikten sonra çalışır)
   E-UYUMLULUK çekirdeği (katalog, kurallar, güç hesabı, profil denetimi, panel) bu dosyada yazılır;
   DON-301 H14 ders.js aynı bloğu değiştirmeden kopyalar. Marka-nötr katalog; fiyat yerine göreli "puan". */
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

  DERS.tahminKur('Tahminini aldık. Adım 2’de ilk uyumluluk kuralıyla kontrol edeceğiz.');

  function el(etiket, sinif, ebeveyn, metin) {
    var x = document.createElement(etiket);
    if (sinif) x.className = sinif;
    if (metin != null) x.textContent = metin;
    if (ebeveyn) ebeveyn.appendChild(x);
    return x;
  }
  function ses(ad) { try { if (D && D.ses) D.ses(ad); } catch (x) { /* ses isteğe bağlı */ } }
  function slaytAktif(id) { var s = document.getElementById(id); return !!(s && s.classList.contains('active')); }
  function slaytId(kok) { var s = kok.closest('.slide'); return s ? s.id : ''; }
  var P = UYUM.PARCA;

  /* Seçici (hap düğmeler): secenekler [[deger, metin], …] */
  function secici(ata, etiket, secenekler, fn) {
    var sat = el('div', 'mk-sec', ata);
    el('span', 'mk-sec-ad', sat, etiket);
    var g = el('div', 'secici', sat);
    g.setAttribute('role', 'group'); g.setAttribute('aria-label', etiket);
    var d = {};
    secenekler.forEach(function (x) {
      d[x[0]] = DERS.dugme(g, x[1], function () { fn(x[0], true); });
      d[x[0]].setAttribute('aria-pressed', 'false');
    });
    return function (deger) { Object.keys(d).forEach(function (k) { d[k].setAttribute('aria-pressed', k === deger ? 'true' : 'false'); }); };
  }
  /* Işık grubu (A-VURGU): kural satırları + en önemli gerekçe */
  function isikGrubu(ata, idler) {
    var kap = el('div', 'mk-isiklar', ata), sat = {};
    idler.forEach(function (id) {
      var r = el('div', 'uy-k mk-k', kap);
      el('span', 'uy-isik', r); el('span', 'uy-k-ad', r, id); el('span', 'uy-k-kisa', r);
      sat[id] = r;
    });
    var gk = el('div', 'uy-detay mk-detay', ata);
    gk.setAttribute('aria-live', 'polite');
    var gi = el('span', 'uy-isik', gk), gm = el('div', 'uy-detay-m', gk), gb = el('b', '', gm), gn = el('span', '', gm);
    var eski = {};
    return function (sonuclar) {
      var sira = { hata: 0, uyari: 1, ok: 2, bos: 3 }, en = null;
      sonuclar.forEach(function (r) {
        var s = sat[r.id];
        s.querySelector('.uy-k-ad').textContent = r.ad;
        UYUM.isikCiz(s, r);
        if (eski[r.id] && eski[r.id] !== r.d && !AZ) { s.classList.remove('yeni'); void s.offsetWidth; s.classList.add('yeni'); }
        eski[r.id] = r.d;
        if (!en || sira[r.d] < sira[en.d]) en = r;
      });
      gk.className = 'uy-detay mk-detay d-' + en.d;
      gi.textContent = UYUM.SIMGE[en.d];
      gb.textContent = en.ad + ' · ' + UYUM.DURUM_AD[en.d];
      gn.textContent = en.neden;
      return en;
    };
  }
  /* Otomatik oynatma: slayt açılınca senaryoları sırayla uygular; kullanıcı dokununca durur */
  function otoOynat(kok, senaryolar, uygula, sure) {
    var id = slaytId(kok), kullanici = false;
    kok.addEventListener('pointerdown', function () { kullanici = true; }, true);
    kok.addEventListener('keydown', function () { kullanici = true; }, true);
    DERS.slaytAcilinca(id, function () {
      if (AZ) return;
      var i = 0;
      (function dongu() {
        if (kullanici || !slaytAktif(id) || i >= senaryolar.length) return;
        uygula(senaryolar[i++]);
        setTimeout(dongu, (sure || 2.8) * 1000);
      })();
    });
  }

  /* ─────────── Adım 1: ihtiyaç profili ─────────── */
  (function () {
    var kok = document.getElementById('profil');
    if (!kok) return;
    var ONC = [['cpu', 'İşlemci'], ['gpu', 'Ekran kartı'], ['ram', 'Bellek'], ['depo', 'Depolama']];
    var SOZ = ['', 'düşük', 'az', 'orta', 'yüksek', 'çok yüksek'];
    var sec = secici(kok, 'Profil', UYUM.PROFIL_SIRA.map(function (id) { return [id, UYUM.PROFIL[id].ad]; }), function (id) { goster(id); });
    var kart = el('div', 'pr-kart', kok);
    var bas = el('div', 'pr-bas', kart), ad = el('b', '', bas), ac = el('span', '', bas);
    var orn = el('div', 'pr-orn', kart);
    var govde = el('div', 'pr-govde', kart);
    var sol = el('div', 'pr-onc', govde);
    el('div', 'pr-alt-bas', sol, 'Bütçe önceliği');
    var bar = {};
    ONC.forEach(function (o) {
      var r = el('div', 'pr-bar', sol);
      el('span', 'pr-bar-ad', r, o[1]);
      var b = el('span', 'pr-bar-iz', r);
      for (var i = 0; i < 5; i++) el('i', '', b);
      bar[o[0]] = { b: b, s: el('span', 'pr-bar-soz', r) };
    });
    var sag = el('div', 'pr-gerek', govde);
    el('div', 'pr-alt-bas', sag, 'En az gereksinim');
    var ul = el('ul', '', sag);
    var butce = el('div', 'pr-butce', sag);
    function goster(id) {
      var p = UYUM.PROFIL[id];
      sec(id);
      ad.textContent = p.ad; ac.textContent = p.ac;
      orn.textContent = 'Örnek iş: ' + p.ornek;
      ONC.forEach(function (o) {
        var n = p.oncelik[o[0]];
        bar[o[0]].b.querySelectorAll('i').forEach(function (x, i) { x.className = i < n ? 'dolu' : ''; x.style.transitionDelay = (AZ ? 0 : i * 0.06) + 's'; });
        bar[o[0]].s.textContent = n + '/5 · ' + SOZ[n];
      });
      ul.innerHTML = '';
      [['Çekirdek', '≥ ' + p.cekirdek], ['Bellek', '≥ ' + p.ram + ' GB'], ['Depolama', (p.depo >= 1000 ? p.depo / 1000 + ' TB' : p.depo + ' GB') + (p.nvme ? ' NVMe SSD' : ' SSD')],
        ['Ekran kartı', p.gpu ? 'seviye ≥ ' + p.gpu : 'gerekmez (tümleşik)']].forEach(function (x) {
        var li = el('li', '', ul); el('span', '', li, x[0]); el('b', '', li, x[1]);
      });
      butce.innerHTML = '';
      el('span', '', butce, 'Bütçe'); el('b', '', butce, p.butce + ' puan');
    }
    goster('ofis');
    otoOynat(kok, ['oyun', 'yazilim', 'tasarim', 'ofis'], goster, 2.6);
  })();

  /* ─────────── Adım 2: soket ve çipset ─────────── */
  (function () {
    var kok = document.getElementById('soket');
    if (!kok) return;
    var s = { cpu: 'cpu1', anakart: 'mb1' };
    var svg = '<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Solda işlemci, sağda anakart soketi ve çipset. İşlemci sokete doğru hareket eder; soket aynıysa oturur, farklıysa oturmaz.">' +
      '<rect x="0" y="0" width="320" height="160" rx="10" fill="#f8fafc"/>' +
      '<rect x="168" y="8" width="144" height="144" rx="8" fill="#14532d" stroke="#166534" stroke-width="2"/>' +
      '<g stroke="#22c55e" stroke-opacity=".18">' + [30, 60, 90, 120].map(function (y) { return '<path d="M172 ' + y + 'H308"/>'; }).join('') + '</g>' +
      '<rect x="200" y="36" width="76" height="76" rx="4" fill="#1f2937" stroke="#94a3b8" stroke-width="2"/>' +
      '<g class="sk-pad" fill="#b45309">' + (function () { var t = ''; for (var i = 0; i < 7; i++) for (var j = 0; j < 7; j++) t += '<circle cx="' + (213 + i * 8.3) + '" cy="' + (49 + j * 8.3) + '" r="1.6"/>'; return t; })() + '</g>' +
      '<rect class="sk-dil sk-dil1" x="203" y="50" width="5" height="8" fill="#fbbf24"/><rect class="sk-dil sk-dil2" x="268" y="50" width="5" height="8" fill="#fbbf24"/>' +
      '<text class="sk-soket" x="238" y="126" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="800" fill="#dcfce7" text-anchor="middle">Soket A</text>' +
      '<rect x="258" y="128" width="46" height="20" rx="3" fill="#1f2937" stroke="#64748b"/>' +
      '<text class="sk-cipset" x="281" y="141.5" font-family="Inter,Arial,sans-serif" font-size="7.5" font-weight="800" fill="#e2e8f0" text-anchor="middle">çipset 1.n</text>' +
      '<g class="sk-guncel" opacity="0"><rect x="176" y="128" width="76" height="20" rx="10" fill="#f59e0b"/><text x="214" y="141.5" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="900" fill="#1f1300" text-anchor="middle">! UEFI güncelle</text></g>' +
      '<g class="sk-cpu">' +
      '<rect x="30" y="44" width="60" height="60" rx="3" fill="#475569"/><rect x="40" y="54" width="40" height="40" rx="3" fill="#cbd5e1"/>' +
      '<rect class="sk-cent sk-cent1" x="28" y="52" width="5" height="10" fill="#f8fafc"/><rect class="sk-cent sk-cent2" x="87" y="52" width="5" height="10" fill="#f8fafc"/>' +
      '<path d="M33 101 l8 0 l-8 -8z" fill="#fbbf24"/>' +
      '<text class="sk-cpu-ad" x="60" y="72" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="900" fill="#334155" text-anchor="middle">Soket A</text>' +
      '<text class="sk-cpu-nesil" x="60" y="84" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="700" fill="#475569" text-anchor="middle">1. nesil</text>' +
      '<text x="60" y="30" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="800" fill="#475569" text-anchor="middle">işlemci (alttan temaslı)</text></g>' +
      '<g class="sk-carpi" opacity="0"><circle cx="238" cy="24" r="10" fill="#ef4444"/><path d="M233 19l10 10M243 19l-10 10" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>' +
      '</svg>';
    var cizim = el('div', 'mk-cizim', kok); cizim.innerHTML = svg;
    var q = function (c) { return cizim.querySelector(c); };
    var secC = secici(kok, 'İşlemci', [['cpu1', 'Soket A · 1. nesil'], ['cpu2', 'Soket A · 2. nesil'], ['cpu4', 'Soket B · 1. nesil']], function (v) { s.cpu = v; uygula(); });
    var secM = secici(kok, 'Anakart', [['mb1', 'Soket A · çipset 1. nesil'], ['mb2', 'Soket A · çipset 2. nesil'], ['mb4', 'Soket B · çipset 1. nesil']], function (v) { s.anakart = v; uygula(); });
    var th = el('div', 'mk-tahmin', kok);
    var isik = isikGrubu(kok, ['soket']);
    var tahminGosterildi = false;
    function dil(tur, a, b) { var y = tur === 'A' ? 50 : 88; a.setAttribute('y', y); b.setAttribute('y', y); }
    function uygula() {
      var c = P[s.cpu], m = P[s.anakart];
      secC(s.cpu); secM(s.anakart);
      q('.sk-cpu-ad').textContent = 'Soket ' + c.soket; q('.sk-cpu-nesil').textContent = c.nesil + '. nesil';
      q('.sk-soket').textContent = 'Soket ' + m.soket; q('.sk-cipset').textContent = 'çipset ' + m.cipset + '.n';
      dil(c.soket, q('.sk-cent1'), q('.sk-cent2'));
      dil(m.soket, q('.sk-dil1'), q('.sk-dil2'));
      var r = UYUM.kural('soket', s);
      var g = q('.sk-cpu');
      g.style.transition = AZ ? 'none' : 'transform .8s cubic-bezier(.4,0,.2,1)';
      g.style.transform = 'translate(0px, 0px)';
      q('.sk-carpi').setAttribute('opacity', 0); q('.sk-guncel').setAttribute('opacity', 0);
      isik([{ id: 'soket', ad: 'Soket ve çipset', d: 'bos', kisa: 'denetleniyor…', neden: 'İşlemci sokete götürülüyor…' }]);
      setTimeout(function () {
        g.style.transform = r.d === 'hata' ? 'translate(178px, -18px)' : 'translate(178px, 0px)';
        setTimeout(function () {
          if (r.d === 'hata') { q('.sk-carpi').setAttribute('opacity', 1); g.classList.remove('sallan'); void g.getBoundingClientRect(); if (!AZ) g.classList.add('sallan'); ses('hata'); }
          if (r.d === 'uyari') q('.sk-guncel').setAttribute('opacity', 1);
          isik([r]);
          if (r.d === 'hata' && !tahminGosterildi && DERS.tahmin != null) {
            tahminGosterildi = true;
            th.textContent = '📌 ' + DERS.tahminNotu(1, 'Parçalar güçlü ama birbirine uymuyor: burada soket farkı var.', 'Sorun güçte değil; işlemci ile anakartın soketi farklı.');
          }
        }, AZ ? 10 : 850);
      }, AZ ? 10 : 120);
    }
    uygula();
    otoOynat(kok, [['cpu4', 'mb1'], ['cpu2', 'mb1'], ['cpu2', 'mb2']], function (x) { s.cpu = x[0]; s.anakart = x[1]; uygula(); }, 3);
  })();

  /* ─────────── Adım 3: RAM nesli ve yuva sayısı ─────────── */
  (function () {
    var kok = document.getElementById('bellek');
    if (!kok) return;
    var s = { anakart: 'mb2', bellek: 'ram3' };
    var OFS = { DDR4: 0.055, DDR5: 0.02 };  // şematik çentik kayması (gerçekte fark birkaç mm)
    var svg = '<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Önden bakış: bellek modülü yuvanın üstünde. Modülün çentiği yuvadaki çıkıntıyla hizalıysa modül yuvaya iner. Altta anakartın yuvaları ve takılan modüller.">' +
      '<rect width="320" height="170" rx="10" fill="#f8fafc"/>' +
      '<g class="bl-modul"><rect class="bl-pcb" x="40" y="12" width="240" height="46" rx="2" fill="#1d4b54"/>' +
      (function () { var t = ''; for (var i = 0; i < 8; i++) t += '<rect x="' + (48 + i * 29) + '" y="20" width="22" height="20" rx="1.5" fill="#0f172a"/>'; return t; })() +
      '<rect x="41" y="50" width="238" height="8" fill="#e3b04f"/><rect class="bl-centik" x="0" y="47" width="6" height="12" fill="#f8fafc"/>' +
      '<text class="bl-ad" x="160" y="10" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="800" fill="#334155" text-anchor="middle"></text></g>' +
      '<path class="bl-cizgi1" d="M0 0" stroke="#6366f1" stroke-width="1.2" stroke-dasharray="3 3"/><path class="bl-cizgi2" d="M0 0" stroke="#b45309" stroke-width="1.2" stroke-dasharray="3 3"/>' +
      '<rect x="36" y="100" width="248" height="16" rx="3" fill="#1f2937"/><rect class="bl-dil" x="0" y="98" width="4" height="10" fill="#fbbf24"/>' +
      '<text class="bl-yuva-ad" x="160" y="128" font-family="Inter,Arial,sans-serif" font-size="8.5" font-weight="800" fill="#475569" text-anchor="middle"></text>' +
      '<g class="bl-harita"></g>' +
      '<g class="bl-carpi" opacity="0"><circle cx="300" cy="76" r="10" fill="#ef4444"/><path d="M295 71l10 10M305 71l-10 10" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>' +
      '<text x="316" y="166" font-family="Inter,Arial,sans-serif" font-size="7" font-weight="700" fill="#94a3b8" text-anchor="end">şematik · çentik farkı birkaç mm</text></svg>';
    var cizim = el('div', 'mk-cizim', kok); cizim.innerHTML = svg;
    var q = function (c) { return cizim.querySelector(c); };
    var secM = secici(kok, 'Anakart', [['mb1', 'DDR4 · 4 yuva'], ['mb2', 'DDR5 · 4 yuva'], ['mb3', 'DDR5 · 2 yuva (ITX)']], function (v) { s.anakart = v; uygula(); });
    var secB = secici(kok, 'Bellek', [['ram2', '2× 8 GB DDR4'], ['ram1', '1× 16 GB DDR4'], ['ram3', '2× 16 GB DDR5'], ['ram5', '4× 16 GB DDR5']], function (v) { s.bellek = v; uygula(); });
    var isik = isikGrubu(kok, ['bellekTur', 'bellekYuva']);
    function uygula() {
      var m = P[s.anakart], r = P[s.bellek];
      secM(s.anakart); secB(s.bellek);
      var nx = 160 + OFS[r.tur] * 240, kx = 160 + OFS[m.ram] * 248;
      q('.bl-centik').setAttribute('x', nx - 3); q('.bl-dil').setAttribute('x', kx - 2);
      q('.bl-pcb').setAttribute('fill', r.tur === 'DDR5' ? '#1d4b54' : '#1f5a3a');
      q('.bl-ad').textContent = r.ad + ' · modül';
      q('.bl-yuva-ad').textContent = m.ram + ' yuvası · anakartta ' + m.yuva + ' yuva';
      var tur = UYUM.kural('bellekTur', s), yuva = UYUM.kural('bellekYuva', s);
      var g = q('.bl-modul');
      g.style.transition = AZ ? 'none' : 'transform .8s cubic-bezier(.4,0,.2,1)';
      g.style.transform = 'translate(0px, 0px)';
      q('.bl-carpi').setAttribute('opacity', 0);
      q('.bl-cizgi1').setAttribute('d', 'M' + nx + ' 60 V98'); q('.bl-cizgi2').setAttribute('d', 'M' + kx + ' 60 V98');
      /* yuva haritası: önerilen yuvalar (2 modül → A2/B2; 1 modül → A2; ITX: A1/B1) */
      var h = q('.bl-harita'), ad = m.yuva === 4 ? ['A1', 'A2', 'B1', 'B2'] : ['A1', 'B1'];
      var dolu = m.yuva === 4 ? (r.modul === 1 ? [1] : r.modul === 2 ? [1, 3] : [0, 1, 2, 3]) : (r.modul === 1 ? [0] : [0, 1]);
      var t = '<text x="40" y="146" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="800" fill="#475569">Yuvalar:</text>';
      ad.forEach(function (a, i) {
        var x = 84 + i * 40, d = tur.d !== 'hata' && dolu.indexOf(i) >= 0;
        t += '<rect x="' + x + '" y="136" width="34" height="14" rx="3" fill="' + (d ? '#6366f1' : '#e2e8f0') + '" stroke="#94a3b8"/>' +
          '<text x="' + (x + 17) + '" y="146" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="800" fill="' + (d ? '#fff' : '#64748b') + '" text-anchor="middle">' + a + '</text>';
      });
      var fazla = r.modul - m.yuva;
      if (fazla > 0 && tur.d !== 'hata') for (var i = 0; i < fazla; i++) t += '<rect x="' + (170 + i * 40) + '" y="136" width="34" height="14" rx="3" fill="#fee2e2" stroke="#ef4444" stroke-dasharray="3 2"/><text x="' + (187 + i * 40) + '" y="146" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="900" fill="#b91c1c" text-anchor="middle">✗ yer yok</text>';
      h.innerHTML = t;
      isik([{ id: 'bellekTur', ad: 'Bellek türü', d: 'bos', kisa: 'denetleniyor…', neden: 'Modül yuvaya indiriliyor…' }, { id: 'bellekYuva', ad: 'Bellek yuvası', d: 'bos', kisa: '…', neden: '' }]);
      setTimeout(function () {
        g.style.transform = tur.d === 'hata' ? 'translate(0px, 30px)' : 'translate(0px, 46px)';
        setTimeout(function () {
          if (tur.d === 'hata') { q('.bl-carpi').setAttribute('opacity', 1); ses('hata'); }
          isik([tur, yuva]);
        }, AZ ? 10 : 850);
      }, AZ ? 10 : 120);
    }
    uygula();
    otoOynat(kok, [['mb2', 'ram2'], ['mb3', 'ram5'], ['mb1', 'ram1'], ['mb1', 'ram2']], function (x) { s.anakart = x[0]; s.bellek = x[1]; uygula(); }, 3);
  })();

  /* ─────────── Adım 4: boyut uyumu (form faktörü, kart uzunluğu, soğutucu yüksekliği) ─────────── */
  (function () {
    var kok = document.getElementById('boyut');
    if (!kok) return;
    var s = { kasa: 'kasa3', anakart: 'mb2', gpu: 'gpu3', sogutucu: 'sog2' };
    var K = 0.5, KS = 0.34;
    var cizim = el('div', 'mk-cizim', kok);
    var secK = secici(kok, 'Kasa', [['kasa1', 'ITX küçük'], ['kasa2', 'mATX'], ['kasa3', 'ATX orta kule']], function (v) { s.kasa = v; uygula(); });
    var secA = secici(kok, 'Anakart', [['mb2', 'ATX'], ['mb1', 'mATX'], ['mb3', 'ITX']], function (v) { s.anakart = v; uygula(); });
    var secG = secici(kok, 'Kart', [['gpu1', '170 mm'], ['gpu2', '240 mm'], ['gpu3', '305 mm']], function (v) { s.gpu = v; uygula(); });
    var secS = secici(kok, 'Soğutucu', [['sog1', '47 mm'], ['sog2', '155 mm'], ['sog3', '165 mm']], function (v) { s.sogutucu = v; uygula(); });
    var isik = isikGrubu(kok, ['form', 'gpuBoy', 'sogBoy']);
    var FF = { ATX: [244, 305], mATX: [244, 244], ITX: [170, 170] };
    var YUK = { kasa1: 104, kasa2: 136, kasa3: 160, kasa4: 170 };
    function T(x, y, t, boy, renk, hiza) { return '<text x="' + x + '" y="' + y + '" font-family="Inter,Arial,sans-serif" font-size="' + (boy || 8) + '" font-weight="800" fill="' + (renk || '#475569') + '" text-anchor="' + (hiza || 'middle') + '">' + t + '</text>'; }
    function uygula() {
      var k = P[s.kasa], m = P[s.anakart], g = P[s.gpu], c = P[s.sogutucu];
      secK(s.kasa); secA(s.anakart); secG(s.gpu); secS(s.sogutucu);
      var ic = k.gpu * K, cw = ic + 26, ch = YUK[s.kasa], cx = 8, cy = 172 - ch;
      var bw = FF[m.ff][0] * K * 0.5, bh = FF[m.ff][1] * K;   // derinlik yönü sıkıştırılmış (şematik)
      var t = '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Solda kasanın yandan görünüşü: anakart, ekran kartı ve kasanın izin verdiği en büyük kart uzunluğu. Sağda önden görünüş: soğutucu yüksekliği ve yan kapak sınırı.">';
      t += '<rect width="320" height="180" rx="10" fill="#f8fafc"/>';
      t += '<rect x="' + cx + '" y="' + cy + '" width="' + cw + '" height="' + ch + '" rx="6" fill="#fff" stroke="#334155" stroke-width="2"/>';
      t += '<rect x="' + (cx + ic + 6) + '" y="' + (cy + 4) + '" width="16" height="' + (ch - 8) + '" rx="3" fill="#e2e8f0"/>' + T(cx + ic + 14, cy + ch / 2 + 3, 'fan', 7, '#64748b');
      var bx = cx + 5, by = cy + 5;
      var formHata = k.ff.indexOf(m.ff) < 0;
      t += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + Math.min(bh, 176 - by) + '" rx="3" fill="' + (formHata ? '#fecaca' : '#bbf7d0') + '" stroke="' + (formHata ? '#ef4444' : '#16a34a') + '" stroke-width="1.5"' + (formHata ? ' stroke-dasharray="4 3"' : '') + '/>';
      t += T(bx + bw / 2, by + 12, m.ff, 8.5, formHata ? '#b91c1c' : '#166534');
      if (formHata) t += T(bx + bw / 2, by + 24, 'sığmaz', 8, '#b91c1c');
      var gy = by + Math.min(bh, ch - 10) * 0.55, gl = g.boy * K;
      var lim = cx + 5 + ic;
      t += '<path d="M' + lim + ' ' + (cy + 2) + ' V' + (cy + ch - 2) + '" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4 3"/>';
      t += T(lim - 3, cy + 11, 'en çok ' + k.gpu + ' mm', 7.5, '#0369a1', 'end');
      var g1 = Math.min(gl, ic);
      t += '<g class="bo-kart"><rect x="' + (cx + 5) + '" y="' + gy + '" width="' + g1 + '" height="12" rx="2" fill="#475569"/>';
      if (gl > ic) t += '<rect x="' + lim + '" y="' + gy + '" width="' + (gl - ic) + '" height="12" fill="#ef4444"/>';
      t += T(cx + 5 + g1 / 2, gy + 9, 'kart ' + g.boy + ' mm', 7.5, '#fff') + '</g>';
      /* önden görünüş: soğutucu */
      var fx = 244, fy = 30, fw = k.sog * KS + 8, fh = 140;
      t += T(fx + 30, 18, 'önden', 8, '#475569');
      t += '<rect x="' + fx + '" y="' + fy + '" width="' + fw + '" height="' + fh + '" rx="4" fill="#fff" stroke="#334155" stroke-width="2"/>';
      t += '<rect x="' + (fx + 3) + '" y="' + (fy + 6) + '" width="4" height="' + (fh - 12) + '" fill="#16a34a"/>';
      var sh = c.boy * KS, sh1 = Math.min(sh, k.sog * KS);
      t += '<rect x="' + (fx + 7) + '" y="' + (fy + 30) + '" width="' + sh1 + '" height="44" rx="2" fill="#94a3b8"/>';
      if (sh > k.sog * KS) t += '<rect x="' + (fx + 7 + k.sog * KS) + '" y="' + (fy + 30) + '" width="' + (sh - k.sog * KS) + '" height="44" fill="#ef4444"/>';
      t += '<path d="M' + (fx + 7 + k.sog * KS) + ' ' + (fy + 4) + ' V' + (fy + fh - 4) + '" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4 3"/>';
      t += T(fx + fw / 2, fy + 94, c.boy + ' mm', 8, '#334155') + T(fx + fw / 2, fy + 106, 'sınır ' + k.sog, 7.5, '#0369a1');
      t += '</svg>';
      cizim.innerHTML = t;
      var kart = cizim.querySelector('.bo-kart');
      if (!AZ) { kart.style.transform = 'translate(-40px, 0px)'; kart.style.opacity = '0'; void kart.getBoundingClientRect(); kart.style.transition = 'transform .7s ease-out, opacity .3s'; kart.style.transform = 'translate(0px, 0px)'; kart.style.opacity = '1'; }
      isik([UYUM.kural('form', s), UYUM.kural('gpuBoy', s), UYUM.kural('sogBoy', s)]);
    }
    uygula();
    otoOynat(kok, [['kasa2', 'mb2', 'gpu3', 'sog2'], ['kasa2', 'mb1', 'gpu3', 'sog2'], ['kasa2', 'mb1', 'gpu2', 'sog2'], ['kasa2', 'mb1', 'gpu2', 'sog1']],
      function (x) { s.kasa = x[0]; s.anakart = x[1]; s.gpu = x[2]; s.sogutucu = x[3]; uygula(); }, 3);
  })();

  /* ─────────── Adım 5: güç ve konnektör ─────────── */
  (function () {
    var kok = document.getElementById('guc');
    if (!kok) return;
    var s = { cpu: 'cpu2', gpu: 'gpu3', psu: 'psu2', bellek: 'ram3', depo1: 'ssd2' };
    var MAKS = 900;
    var cizim = el('div', 'gc', kok);
    cizim.innerHTML = '<div class="gc-olcek"><div class="gc-bar"><span class="gc-s gc-cpu"></span><span class="gc-s gc-gpu"></span><span class="gc-s gc-diger"></span></div>' +
      '<div class="gc-isaret gc-gerek"><i></i><b></b></div><div class="gc-isaret gc-psu"><i></i><b></b></div></div>' +
      '<div class="gc-ayrac"><span><i class="gc-cpu"></i>İşlemci</span><span><i class="gc-gpu"></i>Ekran kartı</span><span><i class="gc-diger"></i>Diğer</span><span><i class="gc-cz"></i>Gereken (× 1,3)</span></div>' +
      '<div class="gc-hesap"></div>' +
      '<div class="gc-pin"><div><span>Kart istiyor</span><span class="gc-pin-k"></span></div><div><span>Güç kaynağında</span><span class="gc-pin-p"></span></div></div>';
    var q = function (c) { return cizim.querySelector(c); };
    var th = el('div', 'mk-tahmin th-sor', kok);
    th.innerHTML = '<span>Tahmin: 65 W işlemci + 285 W kart için 550 W yeter mi?</span>';
    var thG = el('div', 'secici', th), tahmin = null, thS = el('b', 'th-sonuc', th, '');
    [['e', 'Yeter'], ['h', 'Yetmez']].forEach(function (x) {
      var b = DERS.dugme(thG, x[1], function () {
        tahmin = x[0];
        thG.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', y === b ? 'true' : 'false'); });
        s.cpu = 'cpu2'; s.gpu = 'gpu3'; s.psu = 'psu2'; uygula(true);
      });
      b.setAttribute('aria-pressed', 'false');
    });
    var secC = secici(kok, 'İşlemci', [['cpu2', '65 W'], ['cpu3', '105 W'], ['cpu5', '125 W']], function (v) { s.cpu = v; uygula(); });
    var secG = secici(kok, 'Kart', [['gpu0', 'yok'], ['gpu1', '75 W'], ['gpu2', '170 W'], ['gpu3', '285 W'], ['gpu4', '350 W']], function (v) { s.gpu = v; uygula(); });
    var secP = secici(kok, 'Güç kaynağı', [['psu1', '450 W'], ['psu2', '550 W'], ['psu3', '650 W'], ['psu4', '850 W']], function (v) { s.psu = v; uygula(); });
    var isik = isikGrubu(kok, ['guc', 'konnektor']);
    function pin(ata, n, dolu) {
      ata.innerHTML = '';
      if (!n) { el('em', '', ata, dolu ? 'ek kablo yok' : '—'); return; }
      for (var i = 0; i < n; i++) { var x = el('i', 'gc-fis' + (dolu ? ' dolu' : ''), ata); x.textContent = '8'; }
    }
    function uygula(tahminle) {
      secC(s.cpu); secG(s.gpu); secP(s.psu);
      var h = UYUM.guc(s), g = P[s.gpu], ps = P[s.psu];
      function w(x) { return (x / MAKS * 100) + '%'; }
      q('.gc-cpu').style.width = w(h.cpu); q('.gc-gpu').style.width = w(h.gpu); q('.gc-diger').style.width = w(h.diger);
      q('.gc-gerek').style.left = w(h.gereken); q('.gc-gerek b').textContent = 'gereken ' + h.gereken + ' W';
      q('.gc-psu').style.left = w(h.psu); q('.gc-psu b').textContent = 'güç kaynağı ' + h.psu + ' W';
      q('.gc-hesap').textContent = h.cpu + ' + ' + h.gpu + ' + ' + h.diger + ' = ' + h.toplam + ' W  ·  × 1,3 = ' + h.gereken + ' W  ·  pay %' + Math.round(h.pay * 100);
      pin(q('.gc-pin-k'), g.pin, true); pin(q('.gc-pin-p'), ps.pin, false);
      var r = isik([UYUM.kural('guc', s), UYUM.kural('konnektor', s)]);
      if (tahminle && tahmin) {
        thS.textContent = (tahmin === 'e' ? '✓ Doğru: ' : '✗ Aslında yeter: ') + '408 × 1,3 = 530 W ≤ 550 W ve 2× 8-pin var.';
      }
      return r;
    }
    uygula();
    otoOynat(kok, [['cpu2', 'gpu3', 'psu1'], ['cpu2', 'gpu3', 'psu2'], ['cpu3', 'gpu3', 'psu2'], ['cpu3', 'gpu3', 'psu3']],
      function (x) { s.cpu = x[0]; s.gpu = x[1]; s.psu = x[2]; uygula(); }, 3);
  })();

  /* ─────────── Adım 6: darboğaz ve bütçe ─────────── */
  (function () {
    var kok = document.getElementById('denge');
    if (!kok) return;
    var LISTE = {
      a: { ad: 'A · Dengeli', s: { cpu: 'cpu2', anakart: 'mb2', bellek: 'ram3', depo1: 'ssd2', gpu: 'gpu3', sogutucu: 'sog2', psu: 'psu3', kasa: 'kasa3' } },
      b: { ad: 'B · İşlemciye yüklenmiş', s: { cpu: 'cpu5', anakart: 'mb4', bellek: 'ram3', depo1: 'ssd2', gpu: 'gpu1', sogutucu: 'sog2', psu: 'psu2', kasa: 'kasa3' } },
      c: { ad: 'C · Karta yüklenmiş', s: { cpu: 'cpu1', anakart: 'mb1', bellek: 'ram2', depo1: 'ssd1', gpu: 'gpu4', sogutucu: 'sog1', psu: 'psu4', kasa: 'kasa4' } }
    };
    var RENK = { cpu: '#6366f1', anakart: '#16a34a', bellek: '#0ea5e9', depo1: '#14b8a6', gpu: '#f59e0b', sogutucu: '#94a3b8', psu: '#a855f7', kasa: '#64748b' };
    var AD = { cpu: 'İşlemci', anakart: 'Anakart', bellek: 'Bellek', depo1: 'Depolama', gpu: 'Ekran kartı', sogutucu: 'Soğutucu', psu: 'Güç k.', kasa: 'Kasa' };
    var sec = secici(kok, 'Oyun listesi', [['a', 'A · Dengeli'], ['b', 'B · İşlemci ağır'], ['c', 'C · Kart ağır']], function (v) { goster(v); });
    var kap = el('div', 'dn', kok);
    kap.innerHTML = '<div class="dn-butce"><div class="dn-b-ust"><span>Bütçe dağılımı · oyun profili</span><b></b></div><div class="dn-b-bar"></div><div class="dn-sinir"><i></i><span>650</span></div></div>' +
      '<div class="dn-ayrac"></div>' +
      '<div class="dn-boru"></div>' +
      '<div class="dn-seviye"><div class="dn-sv"><span>İşlemci</span><div class="dn-kutu" data-k="cpu"></div></div><div class="dn-sv"><span>Ekran kartı</span><div class="dn-kutu" data-k="gpu"></div></div></div>';
    var q = function (c) { return kap.querySelector(c); };
    var ayr = q('.dn-ayrac');
    Object.keys(AD).forEach(function (k) { var x = el('span', '', ayr, AD[k]); var i = el('i', '', null); i.style.background = RENK[k]; x.insertBefore(i, x.firstChild); });
    var isik = isikGrubu(kok, ['ihtiyac', 'denge', 'butce']);
    function goster(id) {
      var L = LISTE[id], s = L.s, pd = UYUM.profilDenetle(s, 'oyun'), t = UYUM.puan(s);
      sec(id);
      q('.dn-b-ust b').textContent = t + ' / 650 puan';
      var bar = q('.dn-b-bar'); bar.innerHTML = '';
      var olcek = 800;
      Object.keys(AD).forEach(function (k) {
        var x = P[s[k]], seg = el('span', '', bar);
        seg.style.width = (x.puan / olcek * 100) + '%'; seg.style.background = RENK[k];
        seg.title = AD[k] + ': ' + x.puan;
        if (k === 'gpu' || k === 'cpu') seg.textContent = x.puan;
      });
      q('.dn-sinir').style.left = (650 / olcek * 100) + '%';
      [['cpu', P[s.cpu].seviye], ['gpu', P[s.gpu].seviye]].forEach(function (v) {
        var k = q('.dn-kutu[data-k="' + v[0] + '"]'); k.innerHTML = '';
        for (var i = 1; i <= 4; i++) { var b = el('i', i <= v[1] ? 'dolu' : '', k); b.style.transitionDelay = (AZ ? 0 : i * 0.08) + 's'; }
        el('b', '', k, 'seviye ' + v[1]);
      });
      /* boru benzetmesi: akış en dar borudan geçebildiği kadardır */
      var cs = P[s.cpu].seviye, gs = P[s.gpu].seviye, dar = Math.min(cs, gs), H = function (n) { return 8 + n * 11; };
      var y0 = 40, bt = '<svg viewBox="0 0 320 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Boru benzetmesi: işlemci borusu seviye ' + cs + ', ekran kartı borusu seviye ' + gs + '; akış en dar borudan geçebildiği kadardır.">';
      function boru(x, w, n, renk, ad, darMi) {
        return '<rect x="' + x + '" y="' + (y0 - H(n) / 2) + '" width="' + w + '" height="' + H(n) + '" rx="4" fill="' + renk + '" opacity=".9"' + (darMi ? ' stroke="#ef4444" stroke-width="2.5"' : '') + '/>' +
          '<text x="' + (x + w / 2) + '" y="' + (y0 + 3.5) + '" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="800" fill="#fff" text-anchor="middle">' + ad + '</text>';
      }
      bt += boru(8, 110, cs, '#6366f1', 'İşlemci', cs < gs) + boru(122, 110, gs, '#f59e0b', 'Ekran kartı', gs < cs);
      bt += '<path d="M236 ' + y0 + 'H300" stroke="#10b981" stroke-width="' + H(dar) * 0.8 + '" stroke-opacity=".35"/><path d="M288 ' + (y0 - 8) + 'l12 8-12 8" fill="none" stroke="#047857" stroke-width="2.5"/>';
      bt += '<text x="268" y="' + (y0 + 26) + '" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="800" fill="#047857" text-anchor="middle">sonuç ∝ en dar</text>';
      if (cs !== gs && Math.abs(cs - gs) >= 2) bt += '<text x="' + (cs < gs ? 63 : 177) + '" y="12" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="900" fill="#b91c1c" text-anchor="middle">✗ darboğaz</text>';
      q('.dn-boru').innerHTML = bt + '</svg>';
      isik([pd.ihtiyac, pd.denge, pd.butce]);
    }
    goster('a');
    otoOynat(kok, ['b', 'c', 'a'], goster, 3.4);
  })();

  /* ─────────── Etkinlik 1: E-UYUMLULUK — Deniz’in listesini düzelt ─────────── */
  (function () {
    var kok = document.getElementById('uy-duzelt');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var li = document.querySelectorAll('#uy1-gorevler li');
    var BASLA = { cpu: 'cpu4', anakart: 'mb2', bellek: 'ram2', depo1: 'ssd2', depo2: null, gpu: 'gpu4', sogutucu: 'sog3', psu: 'psu1', kasa: 'kasa2' };
    var bitti = false;
    function yok(m, ids) { return ids.every(function (id) { return m[id].d !== 'hata' && m[id].d !== 'bos'; }); }
    var panel = UYUM.panel(kok, { profil: 'oyun', profilSabit: true, secim: BASLA, onDegis: function (d) {
      var m = d.map;
      var g = [yok(m, ['soket']), yok(m, ['bellekTur', 'bellekYuva']), yok(m, ['form', 'gpuBoy', 'sogBoy']), yok(m, ['guc', 'konnektor']),
               m.denge.d === 'ok' && m.butce.d === 'ok' && m.ihtiyac.d === 'ok'];
      var n = 0, simdi = -1;
      g.forEach(function (x, i) { if (x) n++; else if (simdi < 0) simdi = i; if (li[i]) { li[i].classList.toggle('tamam', x); li[i].classList.toggle('simdi', i === simdi); } });
      ilerle(n, 5);
      if (n === 5 && d.uyumlu) {
        sonucGoster();
        if (!bitti) { bitti = true; DERS.konfeti(); ses('klik'); }
      } else if (ek) ek.hidden = true;
    } });
    var ek = el('div', 'uy-sonuc', panel.kok); ek.hidden = true; var kapali = false;
    ek.setAttribute('role', 'status');
    function sonucGoster() {
      if (!panel || kapali) return;
      var d = panel.durum();
      ek.hidden = false; ek.innerHTML = '';
      el('b', '', ek, '✓ Deniz’in listesi uyumlu');
      var sari = d.kurallar.filter(function (x) { return x.d === 'uyari'; });
      el('span', '', ek, d.puan + ' puan · güç payı %' + Math.round(d.guc.pay * 100) + (sari.length ? ' · sarı: ' + sari.map(function (x) { return x.ad; }).join(', ') + ' (gerekçesini söyle)' : ' · sarı ışık yok'));
      var b = DERS.dugme(ek, 'Kapat', function () { ek.hidden = true; kapali = true; });
      b.className = 'uy-sonuc-kapat';
    }
    DERS.dugme(el('div', 'uy-alt', panel.kok), 'Baştan başlat', function () { bitti = false; kapali = false; ek.hidden = true; panel.secimAyarla(BASLA); });
  })();

  /* ─────────── Etkinlik 2: E-UYUMLULUK — profile göre parça listesi ─────────── */
  (function () {
    var kok = document.getElementById('uy-liste');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var sat = document.querySelectorAll('#uy2-durum .etk-durum-satir');
    var tamamlanan = {};
    var panel = UYUM.panel(kok, { profil: 'ofis', onDegis: function (d) {
      var m = d.map;
      var k = [d.uyumlu, m.ihtiyac.d === 'ok', m.denge.d === 'ok', d.tam && m.butce.d === 'ok'];
      var n = 0;
      k.forEach(function (x, i) { if (x) n++; if (sat[i]) sat[i].classList.toggle('tamam', x); });
      ilerle(n, 4);
      if (n === 4) { if (!tamamlanan[d.profil + JSON.stringify(d.secim)]) { tamamlanan[d.profil + JSON.stringify(d.secim)] = 1; listeGoster(d); DERS.konfeti(); ses('klik'); } }
      else if (ek) ek.hidden = true;
    } });
    var ek = el('div', 'uy-sonuc uy-liste-kart', panel.kok); ek.hidden = true;
    ek.setAttribute('role', 'status');
    function listeGoster(d) {
      ek.hidden = false; ek.innerHTML = '';
      el('b', '', ek, '✓ Parça listen hazır · ' + UYUM.PROFIL[d.profil].ad + ' · ' + d.puan + ' puan');
      var ol = el('ol', '', ek);
      UYUM.KATEGORI.forEach(function (c) { var x = d.secim[c.k] && P[d.secim[c.k]]; if (x) el('li', '', ol, x.ad); });
      el('span', '', ek, 'Defterine geçir; her parçanın güncel fiyatını iki kaynaktan bulup yanına yaz.');
      DERS.dugme(ek, 'Kapat', function () { ek.hidden = true; }).className = 'uy-sonuc-kapat';
    }
  })();
})();
