/* DON-301 H13 — Sorun Giderme, Bakım ve Veri Güvenliği · ders betiği (ortak betikten sonra çalışır)
   Derse özel 2D animasyonlar (A-BOOT sistem durumu paneli dahil), 3D bakım provası (M-MASAUSTU-ACIK + M-FAN)
   ve E-TESHIS teşhis simülatörü. Marka-nötr: logo ve marka adı yok. Güç kaynağının içi hiçbir yerde gösterilmez. */
(function () {
  'use strict';
  var D = window.DON3D, DERS = window.DERS, AZ = DERS.AZ;
  var THREE = window.THREE, V3 = THREE.Vector3, K = D.kit;
  DERS.tahminKur('Tahminini aldık. Adım 1’de yöntemle, Adım 3’te sıcaklık verisiyle sınayacağız.');

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
  function basin(b, ac) { b.setAttribute('aria-pressed', ac ? 'true' : 'false'); }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function tarihMetni() {
    var d = new Date(), iki = function (n) { return (n < 10 ? '0' : '') + n; };
    return iki(d.getDate()) + '.' + iki(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  /* ═══════════ Ortak: sistem durumu paneli (A-BOOT) — kasa, hata ışıkları, monitör ═══════════ */
  var ISIK = ['CPU', 'DRAM', 'VGA', 'BOOT'];
  function durumPanel(kap, ops) {
    ops = ops || {};
    var F = 'font-family="Inter,Arial,sans-serif"', MO = 'font-family="JetBrains Mono,Consolas,monospace"';
    var fanKol = [0, 120, 240].map(function (a) {
      return '<path d="M50 84 l0 -21" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" transform="rotate(' + a + ' 50 84)"/>';
    }).join('');
    var svg = '<svg viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sistem durumu: kasa (güç ışığı, fan), anakart hata ışıkları (CPU, DRAM, VGA, BOOT) ve monitör">' +
      // kasa
      '<rect x="8" y="8" width="84" height="134" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>' +
      '<circle class="dp-guc" cx="50" cy="24" r="7" fill="#0f172a" stroke="#475569" stroke-width="3"/>' +
      '<text x="50" y="44" ' + F + ' font-size="8" font-weight="800" fill="#94a3b8" text-anchor="middle">GÜÇ</text>' +
      '<circle cx="50" cy="84" r="27" fill="#0f172a" stroke="#64748b" stroke-width="2"/>' +
      '<g class="dp-fan"><circle cx="50" cy="84" r="24" fill="transparent"/>' + fanKol + '</g><circle cx="50" cy="84" r="5" fill="#cbd5e1"/>' +
      '<text class="dp-fan-yazi" x="50" y="130" ' + F + ' font-size="8.5" font-weight="800" fill="#94a3b8" text-anchor="middle">fan duruyor</text>' +
      // anakart
      '<rect x="102" y="14" width="108" height="122" rx="8" fill="#14532d" stroke="#166534" stroke-width="2"/>' +
      '<text x="156" y="30" ' + F + ' font-size="8" font-weight="800" fill="#bbf7d0" text-anchor="middle">HATA IŞIKLARI</text>' +
      ISIK.map(function (a, i) {
        var y = 50 + i * 22;
        return '<g class="dp-led" data-l="' + i + '"><circle class="dp-halo" cx="126" cy="' + y + '" r="9"/><circle class="dp-lamba" cx="126" cy="' + y + '" r="6"/>' +
          '<text x="140" y="' + (y + 3.5) + '" ' + MO + ' font-size="10" font-weight="800" fill="#e2e8f0">' + a + '</text></g>';
      }).join('') +
      // monitör
      '<rect x="220" y="10" width="132" height="92" rx="7" fill="#0f172a"/>' +
      '<rect class="dp-ekran" x="226" y="16" width="120" height="78" rx="3" fill="#020617"/>' +
      '<text class="dp-sat" x="232" y="36" ' + MO + ' font-size="8.5" font-weight="700" fill="#cbd5e1"></text>' +
      '<text class="dp-sat" x="232" y="52" ' + MO + ' font-size="8.5" font-weight="700" fill="#cbd5e1"></text>' +
      '<text class="dp-sat" x="232" y="68" ' + MO + ' font-size="8.5" font-weight="700" fill="#cbd5e1"></text>' +
      '<text class="dp-sat" x="232" y="84" ' + MO + ' font-size="8.5" font-weight="700" fill="#cbd5e1"></text>' +
      '<circle class="dp-mled" cx="344" cy="98" r="2.5" fill="#22c55e"/>' +
      '<rect x="278" y="102" width="16" height="10" fill="#1e293b"/><rect x="262" y="112" width="48" height="5" rx="2" fill="#1e293b"/>' +
      '<rect class="dp-olcum-k" x="220" y="122" width="132" height="22" rx="6" fill="#fff" stroke="#cbd5e1"/>' +
      '<text class="dp-olcum" x="286" y="137" ' + MO + ' font-size="9" font-weight="800" fill="#334155" text-anchor="middle"></text>' +
      '</svg>';
    kap.innerHTML = svg;
    var guc = kap.querySelector('.dp-guc'), fanG = kap.querySelector('.dp-fan'), fanY = kap.querySelector('.dp-fan-yazi'),
      ledler = kap.querySelectorAll('.dp-led'), ekranR = kap.querySelector('.dp-ekran'), satirlar = kap.querySelectorAll('.dp-sat'),
      mled = kap.querySelector('.dp-mled'), olcum = kap.querySelector('.dp-olcum'), olcumK = kap.querySelector('.dp-olcum-k');
    var api = { no: 0 };
    api.guc = function (ac, fanMetni) {
      guc.setAttribute('class', 'dp-guc' + (ac ? ' acik' : ''));
      fanG.setAttribute('class', 'dp-fan' + (ac ? ' donuyor' : ''));
      fanY.textContent = fanMetni || (ac ? 'fan dönüyor' : 'fan duruyor');
    };
    api.fanYavas = function (y) { fanG.setAttribute('class', 'dp-fan' + (y ? ' donuyor yavas' : ' donuyor')); };
    api.led = function (i, durum) { ledler[i].setAttribute('class', 'dp-led' + (durum ? ' ' + durum : '')); };
    api.ledSondur = function () { for (var i = 0; i < 4; i++) api.led(i, ''); };
    api.ekran = function (sat, tur) {
      sat = sat || [];
      ekranR.setAttribute('class', 'dp-ekran' + (tur ? ' ' + tur : ''));
      mled.setAttribute('class', 'dp-mled' + (tur === 'kapali' ? ' sonuk' : ''));
      satirlar.forEach(function (t, i) {
        t.textContent = sat[i] || '';
        t.setAttribute('class', 'dp-sat' + (tur === 'uyari' && i >= sat.length - 2 ? ' uyari' : '') + (tur === 'is' ? ' is' : ''));
      });
      if (tur === 'bos' && !sat.length) satirlar[1].textContent = '      Sinyal yok';
    };
    api.olcum = function (m) { olcum.textContent = m || ''; olcumK.setAttribute('class', 'dp-olcum-k' + (m ? '' : ' gizli')); };
    api.sifirla = function () { api.no++; api.guc(false); api.ledSondur(); api.ekran([], 'bos'); api.olcum(ops.olcum || ''); };
    /* A-BOOT: güç → POST ışıkları sırayla → görüntü → işletim sistemi. Promise; yeni çağrı eskisini keser. */
    api.boot = function (son) {
      var no = ++api.no;
      function sur() { if (no !== api.no) throw 'iptal'; }
      api.guc(false); api.ledSondur(); api.ekran([], 'bos');
      var z = bekle(0.3).then(function () { sur(); api.guc(true); return bekle(0.6); });
      ISIK.forEach(function (a, i) {
        z = z.then(function () { sur(); api.led(i, 'yanik'); return bekle(0.45); }).then(function () {
          sur(); api.led(i, '');
          if (i === 2) api.ekran(['POST ✓', 'İşlemci ✓  Bellek ✓', 'Ekran kartı ✓'], 'post');
        });
      });
      return z.then(function () { sur(); api.ekran(['POST ✓', 'Disk ✓ → önyükleyici', 'yükleniyor…'], 'post'); return bekle(0.7); })
        .then(function () { sur(); api.ekran(['', son || '  İşletim sistemi açıldı'], 'is'); ses('klik'); return true; })
        .catch(function (e) { if (e !== 'iptal') throw e; return false; });
    };
    api.sifirla();
    return api;
  }

  /* ═══════════ Adım 1: sorun giderme döngüsü ═══════════ */
  (function () {
    var kok = document.getElementById('yontem');
    if (!kok) return;
    var ASAMA = [
      { ad: 'Belirtiyi topla', kisa: 'Belirti', metin: 'Laboratuvardaki 7 numaralı bilgisayar açılmıyor. Güç düğmesine basınca hiçbir ışık yanmıyor, fan dönmüyor. Dün akşam temizlik yapılmış, masalar taşınmış.',
        not: 'Sorular: Ne oluyor? Ne zamandan beri? En son ne değişti? Hata iletisi ya da ışık var mı?' },
      { ad: 'Olası nedenleri sırala', kisa: 'Hipotez', metin: 'Olasılığa ve test kolaylığına göre sırala:',
        tablo: [['Fiş ya da uzatma çıkmış', '1 dk', 'ücretsiz'], ['Güç kaynağının arka anahtarı kapalı', '1 dk', 'ücretsiz'], ['Ön panel düğme kablosu çıkmış', '6 dk', 'ücretsiz'],
          ['Güç kaynağı arızalı', '20 dk', '₺₺'], ['Anakart arızalı', '60 dk', '₺₺₺']] },
      { ad: 'En ucuz testten başla', kisa: 'Test', metin: 'Prizi masa lambasıyla dene: lamba yanıyor, priz sağlam. İlk hipotez çürüdü → listedeki sıradaki nedene geç: arka anahtar 0 konumunda!',
        not: 'Pahalı ya da uzun testler (parça değiştirmek, yeniden kurmak) listenin sonundadır.', tahmin: true },
      { ad: 'Tek değişkeni değiştir', kisa: 'Değiştir', metin: 'Yalnız anahtarı I konumuna al ve yeniden dene. Aynı anda kabloyu da değiştirseydin, hangisinin sorunu çözdüğünü bilemezdin.',
        not: 'Çözülmezse değişikliği geri al ve sıradaki hipoteze geç.' },
      { ad: 'Doğrula', kisa: 'Doğrula', metin: 'Bilgisayar açıldı; POST tamam, işletim sistemi geldi. Ağ, ses ve USB girişleri de denendi: sistem tam çalışıyor.',
        not: 'Önlem: temizlik ekibine anahtarın yeri gösterildi.' },
      { ad: 'Belgele', kisa: 'Kayıt', metin: 'Kayıt: tarih · belirti · yapılan testler · bulunan neden · çözüm · süre. Aynı arıza tekrar ederse ilk bakılacak yer bu kayıttır.',
        not: 'Kayıt, ekipteki herkesin aynı hatayı tekrar incelemesini önler.' }
    ];
    var R = 88, CX = 120, CY = 112;
    var dugum = ASAMA.map(function (a, i) {
      var t = -Math.PI / 2 + i * Math.PI / 3;
      return { x: CX + R * Math.cos(t), y: CY + R * Math.sin(t) };
    });
    var svg = '<svg viewBox="0 0 240 224" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sorun giderme döngüsü: belirti, hipotez, test, değiştir, doğrula, kayıt; test hipotezi çürütürse hipotez aşamasına dönülür">' +
      '<defs><marker id="ymOk" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#a5b4fc"/></marker>' +
      '<marker id="ymOk2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#f59e0b"/></marker></defs>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="#c7d2fe" stroke-width="3"/>' +
      dugum.map(function (d, i) {
        var n = dugum[(i + 1) % 6], ax = (d.x + n.x) / 2, ay = (d.y + n.y) / 2;
        var dx = ax - CX, dy = ay - CY, l = Math.sqrt(dx * dx + dy * dy), px = CX + dx / l * R, py = CY + dy / l * R;
        var ux = -dy / l, uy = dx / l;
        return '<path d="M' + (px - ux * 6).toFixed(1) + ' ' + (py - uy * 6).toFixed(1) + ' L' + (px + ux * 4).toFixed(1) + ' ' + (py + uy * 4).toFixed(1) + '" stroke="#a5b4fc" stroke-width="3" marker-end="url(#ymOk)"/>';
      }).join('') +
      '<path class="ym-geri" d="M' + (dugum[2].x - 16).toFixed(1) + ' ' + (dugum[2].y - 6).toFixed(1) + ' Q' + CX + ' ' + (CY - 6) + ' ' + (dugum[1].x - 18).toFixed(1) + ' ' + (dugum[1].y + 12).toFixed(1) + '" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="5 4" marker-end="url(#ymOk2)"/>' +
      '<text x="' + (CX + 10) + '" y="' + (CY + 14) + '" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="800" fill="#b45309" text-anchor="middle">çürüdü → sıradaki</text>' +
      '<text class="ym-orta" x="' + CX + '" y="' + (CY + 34) + '" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="800" fill="#4338ca" text-anchor="middle">Vaka: açılmıyor</text>' +
      dugum.map(function (d, i) {
        return '<g class="ym-dugum" data-i="' + i + '" tabindex="0" role="button" aria-label="' + (i + 1) + '. aşama: ' + ASAMA[i].ad + '">' +
          '<circle cx="' + d.x.toFixed(1) + '" cy="' + d.y.toFixed(1) + '" r="21"/>' +
          '<text x="' + d.x.toFixed(1) + '" y="' + (d.y - 2).toFixed(1) + '" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="900" text-anchor="middle">' + (i + 1) + '</text>' +
          '<text class="ym-k" x="' + d.x.toFixed(1) + '" y="' + (d.y + 10).toFixed(1) + '" font-family="Inter,Arial,sans-serif" font-size="7.5" font-weight="800" text-anchor="middle">' + ASAMA[i].kisa + '</text></g>';
      }).join('') + '</svg>';
    kok.innerHTML = '<div class="ym"><div class="ym-halka">' + svg + '</div><div class="ym-sag"><div class="ym-kart" aria-live="polite"></div>' +
      '<div class="secici ym-kontrol"></div></div></div>';
    var kart = kok.querySelector('.ym-kart'), dug = kok.querySelectorAll('.ym-dugum'), ctl = kok.querySelector('.ym-kontrol');
    var aktif = 0, oto = 0;
    function goster(i) {
      aktif = i;
      dug.forEach(function (g, j) { g.setAttribute('class', 'ym-dugum' + (j === i ? ' aktif' : (j < i ? ' bitti' : ''))); });
      var a = ASAMA[i];
      kart.innerHTML = '';
      var bas = el('div', 'ym-bas', kart);
      el('span', 'ym-no', bas, String(i + 1)); el('b', '', bas, a.ad);
      el('p', 'ym-metin', kart, a.metin);
      if (a.tablo) {
        var t = el('div', 'ym-tablo', kart);
        var h = el('div', 'ym-satir ym-th', t); el('span', '', h, 'Olası neden'); el('span', '', h, '⏱ Süre'); el('span', '', h, 'Maliyet');
        a.tablo.forEach(function (r, j) {
          var s = el('div', 'ym-satir' + (j < 2 ? ' ucuz' : ''), t);
          el('span', '', s, (j + 1) + '. ' + r[0]); el('span', '', s, r[1]); el('span', '', s, r[2]);
        });
      }
      if (a.not) el('p', 'ym-not', kart, a.not);
      if (a.tahmin && DERS.tahmin != null) {
        el('p', 'ym-tahmin', kart, DERS.tahminNotu(1, 'Isınmadaki vakada da ilk test ucuz olandır: sıcaklığa ve fanlara bakmak.',
          'Isınmadaki vakada parça değiştirmek ya da yeniden kurmak en pahalı testlerdir; önce sıcaklık ve fanlara bakılır.').replace(/^Tahminin:/, 'Isınma tahminin:'));
      }
      kok.querySelector('.ym-geri').setAttribute('class', 'ym-geri' + (i === 2 ? ' parla' : ''));
    }
    dug.forEach(function (g, i) {
      g.addEventListener('click', function () { oto++; goster(i); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); oto++; goster(i); } });
    });
    DERS.dugme(ctl, '◀', function () { oto++; goster((aktif + 5) % 6); }).setAttribute('aria-label', 'Önceki aşama');
    var oynatB = DERS.dugme(ctl, 'Oynat ▶', function () { oynat(); });
    DERS.dugme(ctl, '▶', function () { oto++; goster((aktif + 1) % 6); }).setAttribute('aria-label', 'Sonraki aşama');
    function oynat() {
      var no = ++oto, i = 0;
      basin(oynatB, true);
      (function dongu() {
        if (no !== oto || !slaytAktif('s5')) { basin(oynatB, false); return; }
        goster(i++);
        if (i < 6) setTimeout(dongu, AZ ? 400 : 3600); else basin(oynatB, false);
      })();
    }
    goster(0);
    DERS.slaytAcilinca('s5', function () { if (!AZ) setTimeout(oynat, 600); });
  })();

  /* ═══════════ Adım 2: açılmıyor / görüntü yok — teşhis ağacı + A-BOOT ═══════════ */
  (function () {
    var kok = document.getElementById('aciliyor');
    if (!kok) return;
    kok.innerHTML = '<div class="ac"><div class="ac-durum"></div><ol class="ac-yol" aria-label="Verilen cevaplar"></ol>' +
      '<div class="ac-dugum" aria-live="polite"><div class="ac-soru"></div><div class="secici ac-sec"></div></div>' +
      '<div class="panel-sonuc ac-sonuc" aria-live="polite"></div></div>';
    var dp = durumPanel(kok.querySelector('.ac-durum'));
    var yolK = kok.querySelector('.ac-yol'), soruK = kok.querySelector('.ac-soru'), secK = kok.querySelector('.ac-sec'), sonuc = kok.querySelector('.ac-sonuc');
    function olu() { dp.guc(false); dp.ledSondur(); dp.ekran([], 'bos'); }
    function canli() { dp.guc(true); dp.ledSondur(); dp.ekran([], 'bos'); }
    var A = {
      n0: { soru: 'Güç düğmesine bastın. Güç ışığı yanıyor ya da fanlar dönüyor mu?', sec: [
        ['Hayır, hiç tepki yok', 'n1', 'Güç: yok', olu, 'Güç yolunu izle: en ucuz testten başla.'],
        ['Evet, fanlar dönüyor', 'n3', 'Güç: var', canli, 'Güç geliyor. Sorun POST’ta ya da görüntü yolunda.']] },
      n1: { soru: 'Aynı prize bir lamba ya da telefon şarj aleti tak. Priz çalışıyor mu?', sec: [
        ['Hayır, priz ölü', 'priz', 'Priz: ölü', olu], ['Evet, priz sağlam', 'n2', 'Priz: sağlam', olu, 'Hipotez çürüdü → sıradaki neden: kablo ve anahtar.']] },
      n2: { soru: 'Güç kablosu güç kaynağına tam oturmuş ve arka anahtar I konumunda mı?', sec: [
        ['Hayır', 'anahtar', 'Kablo/anahtar: sorunlu', olu], ['Evet, ikisi de doğru', 'ic', 'Kablo/anahtar: doğru', olu, 'Dış güç yolu sağlam; sıradaki testler kasa içinde.']] },
      n3: { soru: 'Anakartta yanık kalan bir hata ışığı var mı?', sec: [
        ['Evet', 'n4', 'Hata ışığı: var', canli], ['Hayır, hepsi sönüyor', 'n5', 'Hata ışığı: yok', canli, 'POST tamamlanıyor; görüntü yoluna bak.']] },
      n4: { soru: 'Hangi ışık yanık kalıyor?', sec: ISIK.map(function (a, i) {
        return [a, 'led' + i, 'Işık: ' + a, function () {
          canli(); dp.led(i, 'hata');
          if (i === 3) dp.ekran(['POST ✓', 'Önyüklenebilir aygıt', 'bulunamadı.'], 'uyari');
        }];
      }) },
      n5: { soru: 'Monitörün güç ışığı yanıyor ve doğru giriş (kaynak) seçili mi?', sec: [
        ['Hayır', 'monitor', 'Monitör: kapalı/yanlış giriş', function () { canli(); dp.ekran([], 'kapali'); }],
        ['Evet', 'n6', 'Monitör: açık, giriş doğru', canli, 'Monitör hazır; kabloyu izle.']] },
      n6: { soru: 'Görüntü kablosu ekran kartının çıkışına mı takılı?', sec: [
        ['Hayır, anakartın çıkışında', 'cikis', 'Kablo: anakart çıkışında', canli], ['Evet', 'kablo', 'Kablo: ekran kartında', canli]] }
    };
    var Y = {
      priz: { neden: 'Priz ya da uzatma enerjisiz.', yap: 'Bilgisayarı çalışan bir prize tak; uzatmanın anahtarını kontrol et.', onar: 'Çalışan prize tak' },
      anahtar: { neden: 'Güç kablosu gevşek ya da güç kaynağı anahtarı 0 konumunda.', yap: 'Kabloyu sonuna kadar oturt, anahtarı I konumuna al. Yalnız bu değişikliği yap.', onar: 'Kabloyu oturt, anahtarı aç' },
      ic: { neden: 'Sorun kasa içindeki güç yolunda.', yap: 'Fiş çekili: ön panel düğme kablosunu, 24-pin ve 8-pin EPS konnektörlerini kontrol et. Sonra sağlam bir güç kaynağıyla değiştirme testi yapılır. Güç kaynağı asla açılmaz.', onar: 'Ön panel kablosunu tak' },
      led0: { neden: 'POST işlemci aşamasında takıldı.', yap: 'Fiş çekili: 8-pin EPS kablosunu, soğutucu montajını ve işlemcinin oturmasını kontrol et.', onar: 'EPS kablosunu oturt' },
      led1: { neden: 'POST bellek aşamasında takıldı.', yap: 'Fiş çekili: bellekleri çıkarıp yeniden tak (mandallar klik). Tek modülle, kılavuzdaki önerilen yuvada dene.', onar: 'Belleği yeniden oturt' },
      led2: { neden: 'POST görüntü aşamasında takıldı.', yap: 'Ekran kartının yuvaya oturmasını ve ek güç kablosunu kontrol et; monitör kablosunun doğru çıkışta olduğuna bak.', onar: 'Ekran kartını oturt' },
      led3: { neden: 'POST bitti ama önyüklenebilir disk yok.', yap: 'UEFI’de disk listede mi? Fiş çekili: SATA/M.2 bağlantısını, sonra önyükleme sırasını kontrol et.', onar: 'Disk kablosunu oturt' },
      monitor: { neden: 'Monitör kapalı ya da yanlış giriş seçili.', yap: 'Monitörü aç, giriş (kaynak) düğmesiyle kablonun takılı olduğu girişi seç.', onar: 'Monitörü aç, girişi seç' },
      cikis: { neden: 'Kablo anakartın çıkışında; ekran kartı takılıyken bu çıkış çoğunlukla devre dışıdır.', yap: 'Kabloyu ekran kartının çıkışına tak.', onar: 'Kabloyu ekran kartına tak' },
      kablo: { neden: 'Kablo ya da monitör arızalı olabilir.', yap: 'Tek değişken: önce kabloyu sağlam bir kabloyla değiştir; olmazsa monitörü başka bir bilgisayarda dene.', onar: 'Sağlam kabloyla dene' }
    };
    var gecmis = [];
    function yolCiz() {
      yolK.innerHTML = '';
      gecmis.forEach(function (g, i) { var li = el('li', '', yolK, g); li.style.animationDelay = (AZ ? 0 : 0.05 * i) + 's'; });
    }
    function dugumGoster(ad) {
      secK.innerHTML = '';
      if (A[ad]) {
        var d = A[ad];
        soruK.innerHTML = '<span class="ac-rozet">Test</span><span></span>';
        soruK.lastChild.textContent = d.soru;
        d.sec.forEach(function (s) {
          DERS.dugme(secK, s[0], function () {
            dp.no++;
            gecmis.push(s[2]); yolCiz();
            if (s[3]) s[3]();
            sonuc.textContent = s[4] || '';
            dugumGoster(s[1]);
          });
        });
      } else {
        var y = Y[ad];
        soruK.innerHTML = '<span class="ac-rozet neden">Olası neden</span><span class="ac-neden"></span><span class="ac-yap"></span>';
        soruK.children[1].textContent = y.neden;
        soruK.children[2].textContent = y.yap;
        sonuc.textContent = 'Onarımı uygula ve açılışı yeniden dene (doğrula).';
        var ob = DERS.dugme(secK, y.onar + ' ▶', function () {
          ob.disabled = true;
          sonuc.textContent = 'Yeniden deneniyor: güç → POST ışıkları → görüntü…';
          dp.boot().then(function (tamam) {
            if (!tamam) return;
            sonuc.textContent = '✓ Doğrulandı: sistem açıldı. Son adım: belirtiyi, testleri ve çözümü kayda geçir.';
          });
        }, 'ac-onar');
      }
      if (ad !== 'n0') DERS.dugme(secK, 'Baştan', baslat, 'ac-bastan');
    }
    function baslat() {
      dp.sifirla(); gecmis = []; yolCiz();
      sonuc.textContent = 'Belirti: bilgisayar açılmıyor ya da ekranda görüntü yok.';
      dugumGoster('n0');
    }
    baslat();
    DERS.slaytAcilinca('s6', function () {
      if (AZ) return;
      sonuc.textContent = 'Önce sağlam bir açılışı izle: güç → POST ışıkları → görüntü.';
      dp.boot('Sağlam açılış böyle görünür').then(function (tamam) {
        if (!tamam) return;
        setTimeout(function () { if (!gecmis.length) { dp.sifirla(); sonuc.textContent = 'Şimdi arızalı bilgisayar: ilk testi seç.'; } }, 1600);
      });
    });
  })();

  /* ═══════════ Adım 3: ısınma (grafik) ve yavaşlama (SMART) ═══════════ */
  (function () {
    var kok = document.getElementById('isi');
    if (!kok) return;
    kok.innerHTML = '<div class="ii"><div class="secici ii-vaka" role="group" aria-label="Vaka"></div>' +
      '<div class="ii-govde"><div class="ii-grafik"></div><div class="ii-smart" hidden></div></div>' +
      '<div class="secici ii-test" role="group" aria-label="Testler"></div><div class="panel-sonuc ii-sonuc" aria-live="polite"></div></div>';
    var vakaK = kok.querySelector('.ii-vaka'), grafikK = kok.querySelector('.ii-grafik'), smartK = kok.querySelector('.ii-smart'),
      testK = kok.querySelector('.ii-test'), sonuc = kok.querySelector('.ii-sonuc');
    // Grafik: üstte sıcaklık (20–110 °C), altta saat hızı (0–5 GHz); x 0–30 dk
    var GX0 = 34, GX1 = 302, TY0 = 100, TY1 = 10, FY0 = 152, FY1 = 118;
    function gx(t) { return GX0 + (GX1 - GX0) * t / 30; }
    function gyT(c) { return TY0 - (TY0 - TY1) * (c - 20) / 90; }
    function gyF(f) { return FY0 - (FY0 - FY1) * f / 5; }
    var eks = '';
    [20, 50, 80, 110].forEach(function (c) { eks += '<path d="M' + GX0 + ' ' + gyT(c) + 'H' + GX1 + '" stroke="#e2e8f0"/><text x="' + (GX0 - 4) + '" y="' + (gyT(c) + 3) + '" class="ii-eks" text-anchor="end">' + c + '</text>'; });
    [0, 5].forEach(function (f) { eks += '<path d="M' + GX0 + ' ' + gyF(f) + 'H' + GX1 + '" stroke="#e2e8f0"/><text x="' + (GX0 - 4) + '" y="' + (gyF(f) + 3) + '" class="ii-eks f" text-anchor="end">' + f + '</text>'; });
    [0, 10, 20, 30].forEach(function (t) { eks += '<text x="' + gx(t) + '" y="' + (FY0 + 12) + '" class="ii-eks" text-anchor="middle">' + t + (t === 30 ? ' dk' : '') + '</text>'; });
    grafikK.innerHTML = '<div class="ii-okuma"><span class="ii-o t"><small>İşlemci</small><b>45 °C</b></span><span class="ii-o f"><small>Saat hızı</small><b>4,2 GHz</b></span>' +
      '<span class="ii-o fan"><small>İşlemci fanı</small><b>—</b></span><span class="ii-o d"><small>Durum</small><b>Boşta</b></span></div>' +
      '<div class="ii-cizim"><svg viewBox="0 0 320 168" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zamana göre işlemci sıcaklığı (üstte, düz çizgi, °C) ve saat hızı (altta, kesik çizgi, GHz) grafiği">' +
      '<rect class="ii-kisma-bant" x="' + GX0 + '" y="' + gyT(110) + '" width="' + (GX1 - GX0) + '" height="' + (gyT(95) - gyT(110)) + '"/>' + eks +
      '<text x="' + (GX0 + 4) + '" y="' + (gyT(95) - 3) + '" class="ii-bant-yazi">ısıl kısma bölgesi (sınır işlemciye göre değişir)</text>' +
      '<text x="' + (GX0 + 2) + '" y="' + (TY1 - 2) + '" class="ii-eks b">°C · sıcaklık</text><text x="' + (GX0 + 2) + '" y="' + (FY1 - 3) + '" class="ii-eks b f">GHz · saat hızı</text>' +
      '<polyline class="ii-cizgi-f" points=""/><polyline class="ii-cizgi-t" points=""/>' +
      '<g class="ii-kapandi" opacity="0"><circle r="5"/><text class="ii-kapandi-yazi" x="-6" y="16" text-anchor="end">kapandı</text></g></svg>' +
      '<div class="ii-bulgu" hidden></div></div>';
    var cT = grafikK.querySelector('.ii-cizgi-t'), cF = grafikK.querySelector('.ii-cizgi-f'), kapandi = grafikK.querySelector('.ii-kapandi'),
      oT = grafikK.querySelector('.ii-o.t b'), oF = grafikK.querySelector('.ii-o.f b'), oFan = grafikK.querySelector('.ii-o.fan b'),
      oD = grafikK.querySelector('.ii-o.d b'), oDK = grafikK.querySelector('.ii-o.d'), bulgu = grafikK.querySelector('.ii-bulgu');
    var temiz = false, simNo = 0, vaka = 'isi';
    function veri(t) {
      if (t < 2) return { c: 45, f: 4.2 };
      var u = t - 2;
      if (temiz) return { c: 45 + 27 * (1 - Math.exp(-u / 3.2)), f: 4.2 };
      var c = 45 + 60 * (1 - Math.exp(-u / 7.5));
      var f = c < 95 ? 4.2 : Math.max(2.2, 4.2 - (c - 95) * 0.36);
      return { c: c, f: f };
    }
    function virgul(x, n) { return x.toFixed(n).replace('.', ','); }
    function yuk() {
      var no = ++simNo, pT = [], pF = [], t = 0, adim = 0.25;
      bulgu.hidden = true; kapandi.setAttribute('opacity', '0');
      oDK.className = 'ii-o d';
      return new Promise(function (coz) {
        (function kare() {
          if (no !== simNo) return coz(false);
          var n = AZ ? 200 : 2;
          for (var k = 0; k < n && t <= 30; k++) {
            var v = veri(t);
            pT.push(gx(t).toFixed(1) + ',' + gyT(Math.min(v.c, 110)).toFixed(1));
            pF.push(gx(t).toFixed(1) + ',' + gyF(v.f).toFixed(1));
            oT.textContent = Math.round(v.c) + ' °C'; oF.textContent = virgul(v.f, 1) + ' GHz';
            var durum = t < 2 ? 'Boşta' : (v.c >= 95 ? 'Isıl kısma' : 'Yükte');
            oD.textContent = durum; oDK.className = 'ii-o d' + (v.c >= 95 ? ' uyari' : '');
            if (!temiz && v.c >= 100) {
              cT.setAttribute('points', pT.join(' ')); cF.setAttribute('points', pF.join(' '));
              kapandi.setAttribute('transform', 'translate(' + gx(t).toFixed(1) + ' ' + gyT(100).toFixed(1) + ')');
              kapandi.setAttribute('opacity', '1');
              oD.textContent = 'Koruma: kapandı'; oDK.className = 'ii-o d hata'; oF.textContent = '—';
              return coz('kapandi');
            }
            t += adim;
          }
          cT.setAttribute('points', pT.join(' ')); cF.setAttribute('points', pF.join(' '));
          if (t > 30) return coz('bitti');
          requestAnimationFrame(kare);
        })();
      });
    }
    var TEST = {
      isi: [
        ['Yük altında izle', function () {
          sonuc.textContent = temiz ? 'Temizlik sonrası yük testi…' : 'Oyun başlatıldı; sıcaklık ve saat hızı izleniyor…';
          return yuk().then(function (r) {
            if (r === 'kapandi') {
              var m = 'Sıcaklık 95 °C’yi geçti, saat hızı düştü (ısıl kısma); 100 °C’de işlemci korumak için sistemi kapattı.';
              if (DERS.tahmin != null) m += ' ' + DERS.tahminNotu(1, 'İlk test buydu.', 'Kanıt ısınmayı gösteriyor.').replace(/^Tahminin:/, 'Isınma tahminin:');
              sonuc.textContent = m;
            } else if (r === 'bitti') sonuc.textContent = '✓ Yükte 72 °C’de dengelendi, saat hızı 4,2 GHz’de kaldı: tek değişiklik (temizlik) sorunu çözdü. Kayda geçir.';
          });
        }],
        ['Fan hızını oku', function () {
          oFan.textContent = temiz ? '1 450 dev/dk' : '450 dev/dk';
          sonuc.textContent = temiz ? 'Fan yükte hızlanıyor: hava akışı normal.' : 'İşlemci fanı yükte bile 450 dev/dk: benzer sistemlerde yükte bundan çok daha hızlı döner. Hava akışı zayıf.';
          return Promise.resolve();
        }],
        ['Fiş çekili: soğutucuya bak', function () {
          bulgu.hidden = false;
          bulgu.className = 'ii-bulgu' + (temiz ? ' temiz' : '');
          bulgu.innerHTML = '<svg viewBox="0 0 90 60" aria-hidden="true"><rect x="4" y="8" width="54" height="44" rx="4" fill="#94a3b8"/>' +
            [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<rect x="' + (8 + i * 6) + '" y="10" width="3" height="40" fill="#64748b"/>'; }).join('') +
            (temiz ? '' : '<path d="M4 14 q10 -8 20 0 t20 0 t14 0 v10 h-54z" fill="#a8a29e"/><ellipse cx="20" cy="40" rx="8" ry="3" fill="#a8a29e"/><ellipse cx="44" cy="34" rx="7" ry="3" fill="#a8a29e"/>') +
            '<circle cx="74" cy="30" r="13" fill="#1f2937"/>' + (temiz ? '' : '<circle cx="70" cy="27" r="3" fill="#a8a29e"/><circle cx="78" cy="34" r="2.5" fill="#a8a29e"/>') + '</svg>' +
            '<span>' + (temiz ? 'Kanatçıklar ve fan temiz.' : 'Kanatçıklar tozla tıkalı, fan kanatlarında toz topakları.') + '</span>';
          sonuc.textContent = temiz ? 'Soğutucu temiz görünüyor.' : 'Bulgu: toz, hava akışını kesmiş. Hipotez güçlendi: aşırı ısınma.';
          return Promise.resolve();
        }],
        ['Temizle, yeniden sına', function () {
          temiz = true; bulgu.hidden = true;
          oFan.textContent = '—';
          sonuc.textContent = 'Tek değişiklik: fiş çekili, fan sabitken soğutucu temizlendi. Şimdi yeniden yük testi…';
          return bekle(1.2).then(function () { return TEST.isi[0][1](); });
        }]
      ],
      disk: [
        ['Disk etkinliğini izle', function () {
          var bar = smartK.querySelector('.ii-disk-bar span'), m = smartK.querySelector('.ii-disk-m');
          bar.style.width = degisti ? '12%' : '100%';
          m.textContent = degisti ? 'Disk %12 · yanıt 2 ms' : 'Disk %100 · yanıt 1 800 ms';
          sonuc.textContent = degisti ? 'Yeni diskle etkinlik normal.' : 'İşlemci ve bellek rahat; disk sürekli %100 ve çok geç yanıt veriyor.';
          return Promise.resolve();
        }],
        ['SMART değerlerini oku', function () {
          var satirlar = smartK.querySelectorAll('.ii-sm-satir:not(.bas)'), z = Promise.resolve();
          satirlar.forEach(function (r, i) {
            z = z.then(function () {
              var s = SMART[i], v = degisti ? s[4] : s[2], d = degisti ? 'iyi' : s[3];
              r.children[2].textContent = v;
              r.children[3].textContent = d === 'uyari' ? '⚠ dikkat' : '✓ iyi';
              r.className = 'ii-sm-satir ' + d;
              return bekle(0.25);
            });
          });
          return z.then(function () {
            var g = smartK.querySelector('.ii-sm-genel');
            g.className = 'ii-sm-genel ' + (degisti ? 'iyi' : 'uyari');
            g.textContent = degisti ? 'Genel durum: İYİ (yeni disk)' : 'Genel durum: DİKKAT — disk arızalanıyor';
            sonuc.textContent = degisti ? 'Yeni diskin sayaçları temiz.' : 'Yeniden atanmış ve bekleyen sektörler artıyor: disk yüzeyi bozuluyor. İlk iş: YEDEK.';
          });
        }],
        ['Yedekle (3-2-1)', function () {
          var y = smartK.querySelector('.ii-yedek');
          y.className = 'ii-yedek calisiyor';
          sonuc.textContent = 'Önce en değerli dosyalar kopyalanıyor: harici disk + okul sunucusu…';
          return bekle(1.6).then(function () {
            yedekli = true; y.className = 'ii-yedek tamam';
            sonuc.textContent = '✓ Yedek tamam: 3 kopya (bilgisayar, harici disk, sunucu), 2 ortam, 1 kopya başka yerde.';
          });
        }],
        ['Diski değiştir', function () {
          if (!yedekli) {
            sonuc.textContent = '⚠ Dur! Önce yedek al: arızalanan diskteki her okuma son okuma olabilir.';
            ses('hata');
            return Promise.resolve();
          }
          degisti = true;
          sonuc.textContent = '✓ Yeni disk takıldı, yedek geri yüklendi. Doğrula: SMART’ı ve disk etkinliğini yeniden oku.';
          smartK.querySelector('.ii-disk-bar span').style.width = '12%';
          smartK.querySelector('.ii-disk-m').textContent = 'Disk %12 · yanıt 2 ms';
          return Promise.resolve();
        }]
      ]
    };
    // SMART: [ID, öznitelik, ham değer, durum, yeni disk değeri]
    var SMART = [
      ['5', 'Yeniden atanmış sektör', '312 ↑', 'uyari', '0'],
      ['197', 'Bekleyen sektör', '24 ↑', 'uyari', '0'],
      ['198', 'Düzeltilemeyen sektör', '8', 'uyari', '0'],
      ['199', 'Arabirim (kablo) CRC hatası', '0', 'iyi', '0'],
      ['194', 'Sıcaklık', '38 °C', 'iyi', '34 °C'],
      ['9', 'Çalışma süresi', '31 540 sa', 'iyi', '12 sa']
    ];
    var yedekli = false, degisti = false;
    smartK.innerHTML = '<div class="ii-disk"><span>Disk etkinliği</span><div class="ii-disk-bar"><span></span></div><b class="ii-disk-m">—</b></div>' +
      '<div class="ii-sm"><div class="ii-sm-satir bas"><span>ID</span><span>SMART özniteliği</span><span>Ham değer</span><span>Durum</span></div>' +
      SMART.map(function (s) { return '<div class="ii-sm-satir"><span>' + s[0] + '</span><span>' + s[1] + '</span><span>—</span><span>—</span></div>'; }).join('') +
      '</div><div class="ii-alt"><div class="ii-sm-genel">Genel durum: okunmadı</div>' +
      '<div class="ii-yedek"><span>3 kopya</span><span>2 ortam</span><span>1 dışarıda</span></div></div>';
    var mesgul = false;
    function testCiz() {
      testK.innerHTML = '';
      TEST[vaka].forEach(function (t) {
        DERS.dugme(testK, t[0], function () {
          if (mesgul) return;
          mesgul = true; simNo++;
          Promise.resolve(t[1]()).then(function () { mesgul = false; }, function () { mesgul = false; });
        });
      });
      DERS.dugme(testK, 'Baştan', function () { simNo++; mesgul = false; vakaSec(vaka); }, 'ii-bastan');
    }
    var vakaD = {};
    function vakaSec(v) {
      vaka = v; simNo++; mesgul = false;
      Object.keys(vakaD).forEach(function (k) { basin(vakaD[k], k === v); });
      grafikK.hidden = v !== 'isi'; smartK.hidden = v !== 'disk';
      if (v === 'isi') {
        temiz = false; cT.setAttribute('points', ''); cF.setAttribute('points', ''); kapandi.setAttribute('opacity', '0');
        bulgu.hidden = true; oT.textContent = '45 °C'; oF.textContent = '4,2 GHz'; oFan.textContent = '—'; oD.textContent = 'Boşta'; oDK.className = 'ii-o d';
        sonuc.textContent = 'Belirti: oyunda yaklaşık 20 dakika sonra kendiliğinden kapanıyor. Bir test seç.';
      } else {
        yedekli = false; degisti = false;
        smartK.querySelector('.ii-disk-bar span').style.width = '0';
        smartK.querySelector('.ii-disk-m').textContent = '—';
        smartK.querySelectorAll('.ii-sm-satir:not(.bas)').forEach(function (r) { r.className = 'ii-sm-satir'; r.children[2].textContent = '—'; r.children[3].textContent = '—'; });
        var g = smartK.querySelector('.ii-sm-genel'); g.className = 'ii-sm-genel'; g.textContent = 'Genel durum: okunmadı';
        smartK.querySelector('.ii-yedek').className = 'ii-yedek';
        sonuc.textContent = 'Belirti: haftalardır giderek yavaşlıyor, dosyalar geç açılıyor. Bir test seç.';
      }
      testCiz();
    }
    vakaD.isi = DERS.dugme(vakaK, 'Kendiliğinden kapanıyor', function () { vakaSec('isi'); });
    vakaD.disk = DERS.dugme(vakaK, 'Çok yavaşladı', function () { vakaSec('disk'); });
    vakaSec('isi');
    DERS.slaytAcilinca('s7', function () {
      if (AZ || vaka !== 'isi') return;
      setTimeout(function () { if (slaytAktif('s7') && !mesgul && !cT.getAttribute('points')) { mesgul = true; TEST.isi[0][1]().then(function () { mesgul = false; }); } }, 700);
    });
  })();

  /* ═══════════ Adım 4: 3D önleyici bakım provası ═══════════ */
  function prova(s, adimlar, ops) {
    ops = ops || {};
    var alt = D.div('u-altyazi', s.arayuz);
    alt.setAttribute('aria-live', 'polite');
    var calisiyor = false, sira = 0;
    var btn = s.dugme('Oynat', 'oynat', function () { oynat(); }, { yer: 'alt-sol', sinif: 'don3d-dugme--birincil', aciklama: 'Provayı oynat' });
    if (AZ) s.dugme('Adım adım', 'adim', function () { adim(); }, { yer: 'alt-sol', aciklama: 'Provanın bir sonraki adımını göster' });
    function yaz(i) { alt.textContent = (i + 1) + '. ' + adimlar[i].metin; }
    function bitir() {
      calisiyor = false;
      btn.querySelector('span').textContent = 'Tekrarla';
      if (ops.bitti) ops.bitti();
    }
    function oynat() {
      if (calisiyor) return;
      calisiyor = true; sira = 0;
      if (ops.basla) ops.basla();
      if (ops.sifirla) ops.sifirla();
      var z = Promise.resolve();
      adimlar.forEach(function (a, i) {
        z = z.then(function () { yaz(i); return D.bekle(0.5, s); })
          .then(function () { return a.calis(); })
          .then(function () { return D.bekle(0.8, s); });
      });
      z.then(bitir, function (e) { console.error(e); calisiyor = false; });
    }
    function adim() {
      if (calisiyor) return;
      if (sira === 0 || sira >= adimlar.length) { sira = 0; if (ops.basla) ops.basla(); if (ops.sifirla) ops.sifirla(); }
      calisiyor = true;
      yaz(sira);
      adimlar[sira].calis().then(function () {
        calisiyor = false; sira++;
        if (sira >= adimlar.length) bitir();
      });
    }
    return { oynat: oynat, adim: adim, calisiyor: function () { return calisiyor; } };
  }

  /* Kapak: yan kapağı açık kasa, fanlar döner */
  D.tembel('#kapak-3d', function (kap) {
    var s = D.sahne(kap, { arkaPlan: 'seffaf', etiket: kap.getAttribute('aria-label'),
      kamera: { yon: [-1, 0.42, 0.55], pay: 0.95 }, turSuresi: 14 });
    var kasa = s.ekle('M-MASAUSTU-ACIK', { modelOps: { kapakAcik: true } });
    s.yerlestir();
    var rotorlar = kasa.userData.fanlar || [];
    s.herKare(function (dt) { rotorlar.forEach(function (r) { r.rotation.z -= dt * (AZ ? 1 : 9); }); });
  });

  D.tembel('#s8-3d', function (kap) {
    var s = D.sahne(kap, { etiket: kap.getAttribute('aria-label'), otomatikDonus: false, kamera: { yon: [-1, 0.45, 0.62], pay: 0.86 } });
    var kasa = s.ekle('M-MASAUSTU-ACIK', { modelOps: { kapakAcik: true } });
    kasa.updateMatrixWorld(true);
    // Kasanın arka fanı yerine tozlanabilen 12 cm M-FAN (aynı konum ve yön: ön yüz kasa içine bakar, hava arkadan çıkar)
    var arka = kasa.getObjectByName('arka-fan');
    var fanPos = arka.getWorldPosition(new V3());
    arka.visible = false;
    var fan = s.ekle('M-FAN', { konum: fanPos.toArray(), modelOps: { kablosuz: true } });
    var fu = fan.userData;
    // İşlemci soğutucusu: toz katmanı (dönen soğutucu fanı modelden gelir)
    var islemci = kasa.getObjectByName('islemci');
    var cpuRotor = islemci.userData.rotor;
    var sogKutu = new THREE.Box3().setFromObject(islemci), sb = sogKutu.getSize(new V3()), sm = sogKutu.getCenter(new V3());
    var tozMat = new THREE.MeshStandardMaterial({ color: 0x6b6259, roughness: 1, transparent: true, opacity: 0 });
    var toz = new THREE.Group();
    var ustToz = K.kutu(sb.x * 0.62, 0.35, sb.z * 0.8, tozMat, 0.15);
    ustToz.position.set(sm.x - sb.x * 0.12, sogKutu.max.y + 0.1, sm.z);
    toz.add(ustToz);
    var rr = K.rng(13);
    for (var i = 0; i < 14; i++) {
      var b = new THREE.Mesh(new THREE.SphereGeometry(0.55 + rr() * 0.5, 7, 5), tozMat);
      b.scale.set(1.5, 0.5, 1.1);
      b.position.set(sm.x - sb.x * 0.4 + rr() * sb.x * 0.7, sogKutu.min.y + 1 + rr() * (sb.y - 2), sogKutu.max.z + 0.25);
      toz.add(b);
    }
    toz.traverse(function (o) { o.userData.secilmez = true; o.userData.golgeYok = true; });
    s.kok.add(toz);
    // Plastik sabitleme çubuğu
    var cubuk = K.silindir(0.3, 11, K.mat('#f59e0b', { roughness: 0.5 }), 12);
    cubuk.rotation.z = Math.PI / 2;
    K.parca(cubuk, 'sabitleme-cubugu', 'Plastik çubuk', 'Püskürtme sırasında fan kanatlarını tutar; fan serbestçe dönüp aşırı hızlanmaz.');
    var cubukHedef = fanPos.clone().add(new V3(-2.2, 3.4, 1.7)), cubukDis = cubukHedef.clone().add(new V3(-16, 0, 0));
    cubuk.position.copy(cubukDis); cubuk.visible = false;
    s.kok.add(cubuk);
    // Basınçlı hava kutusu (etiketsiz, marka yok) — dik durur, pipet fana bakar
    var kutu = new THREE.Group();
    K.parca(kutu, 'hava-kutusu', 'Basınçlı hava kutusu', 'Dik tutulur; kısa püskürtmeler yapılır. Ters tutulursa soğuk sıvı püskürtebilir.');
    var govdeMat = K.mat('#3b82f6', { roughness: 0.35, metalness: 0.3 });
    K.koy(kutu, K.silindir(2.3, 13, govdeMat, 24), 0, 6.5, 0);
    var etDoku = K.canvasDoku(256, 128, function (ctx, w, h) {
      ctx.fillStyle = '#eff6ff'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1e3a8a'; ctx.font = '800 30px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BASINÇLI HAVA', w / 2, h / 2 - 16); ctx.font = '700 20px Arial, sans-serif'; ctx.fillText('dik tut', w / 2, h / 2 + 22);
    });
    var etiket = new THREE.Mesh(new THREE.CylinderGeometry(2.33, 2.33, 4.4, 24, 1, true), new THREE.MeshStandardMaterial({ map: etDoku, roughness: 0.5 }));
    etiket.position.y = 7; etiket.rotation.y = -Math.PI * 0.35;
    kutu.add(etiket);
    K.koy(kutu, K.silindir(1.6, 0.9, K.mat('aluminyum'), 20), 0, 13.4, 0);
    K.koy(kutu, K.kutu(1.4, 1.2, 1.4, K.mat('plastikSiyah'), 0.2), 0, 14.4, 0);
    var kutuPos = new V3(fanPos.x - 17, fanPos.y - 16.5, fanPos.z + 9);
    kutu.position.copy(kutuPos);
    var nozul = kutuPos.clone().add(new V3(0, 14.6, 0));
    var hedefNokta = fanPos.clone().add(new V3(0, 0, 1.8));
    var yon = hedefNokta.clone().sub(nozul).normalize();
    var pipetL = 8;
    var pipet = K.silindir(0.16, pipetL, K.mat('#ef4444'), 8);
    pipet.quaternion.setFromUnitVectors(new V3(0, 1, 0), yon);
    pipet.position.copy(yon.clone().multiplyScalar(pipetL / 2).add(new V3(0, 14.6, 0)));
    kutu.add(pipet);
    var pipetUc = nozul.clone().add(yon.clone().multiplyScalar(pipetL));
    var huzmeL = pipetUc.distanceTo(hedefNokta);
    var huzme = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 0.2, huzmeL, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xbfdbfe, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    huzme.quaternion.setFromUnitVectors(new V3(0, 1, 0), yon.clone().negate());
    huzme.position.copy(pipetUc.clone().add(hedefNokta).multiplyScalar(0.5));
    huzme.userData.secilmez = true; huzme.userData.golgeYok = true;
    s.kok.add(huzme);
    kutu.visible = false;
    kutu.traverse(function (o) { o.userData.golgeYok = true; });
    s.kok.add(kutu);
    // Toz parçacıkları (püskürtmede fanın arkasından dışarı uçar)
    var parcaGeo = new THREE.SphereGeometry(0.28, 6, 4), parcaMat = new THREE.MeshStandardMaterial({ color: 0x8a8178, roughness: 1, transparent: true, opacity: 0.9 });
    var parcaciklar = [];
    for (var p = 0; p < 36; p++) {
      var m = new THREE.Mesh(parcaGeo, parcaMat);
      m.visible = false; m.userData.secilmez = true; m.userData.golgeYok = true;
      s.kok.add(m); parcaciklar.push({ m: m, v: new V3(), omur: 0 });
    }
    function puskurt() {
      parcaciklar.forEach(function (q) {
        var a = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 4;
        q.m.position.set(fanPos.x + Math.cos(a) * r, fanPos.y + Math.sin(a) * r, fanPos.z - 0.8);
        q.v.set((Math.random() - 0.5) * 6, (Math.random() - 0.3) * 5, -(8 + Math.random() * 10));
        q.omur = 0.9 + Math.random() * 0.6; q.m.visible = true;
      });
    }
    s.herKare(function (dt) {
      parcaciklar.forEach(function (q) {
        if (!q.m.visible) return;
        q.omur -= dt;
        if (q.omur <= 0) { q.m.visible = false; return; }
        q.m.position.addScaledVector(q.v, dt);
        q.v.y -= 6 * dt;
      });
    });
    // Fanlar: M-FAN kendi döngüsüyle, soğutucu fanı burada
    fu.hiz = 10; fu.baslat(s);
    var cpuW = 10;
    s.herKare(function (dt) { if (cpuRotor) cpuRotor.rotation.z -= cpuW * (1 - 0.6 * tozMat.opacity) * dt * (AZ ? 0.15 : 1); });
    s.yerlestir();
    D.dondur(s, { ipucu: false });
    // Arayüz: sıcaklık, fiş durumu, tahmin
    var olcum = D.div('bk3-olcum', s.arayuz);
    olcum.innerHTML = '<span class="bk3-t"><small>İşlemci</small><b>46 °C</b></span><span class="bk3-f"><small>Kasa fanı</small><b>1 400 dev/dk</b></span>';
    var tB = olcum.querySelector('.bk3-t b'), fB = olcum.querySelector('.bk3-f b'), tK = olcum.querySelector('.bk3-t');
    var gucK = D.div('bk3-guc', s.arayuz);
    function gucYaz(fisli) {
      gucK.className = 'bk3-guc' + (fisli ? '' : ' cekili');
      gucK.innerHTML = fisli ? '<span class="bk3-nokta"></span>Fiş takılı · çalışıyor'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/><path d="M3 3l18 18"/></svg>Fiş çekili';
    }
    gucYaz(true);
    var sicaklik = 46;
    function sicaklikGit(hedef, sure) {
      var bas = sicaklik;
      return D.tween({ sahne: s, sure: sure, anahtar: 'isi', hedef: olcum, guncelle: function (e) {
        sicaklik = bas + (hedef - bas) * e;
        tB.textContent = Math.round(sicaklik) + ' °C';
        tK.className = 'bk3-t' + (sicaklik >= 75 ? ' sicak' : '');
      } });
    }
    function fanYaz() { fB.textContent = fu.hiz < 0.5 ? 'duruyor' : (Math.round(fu.etkinHiz() * 140 / 10) * 10).toLocaleString('tr-TR') + ' dev/dk'; }
    s.herKare(fanYaz);
    var tahminK = D.div('bk3-tahmin', s.arayuz);
    tahminK.innerHTML = '<b>Tahmin: püskürtürken fan sabitlenmezse ne olur?</b><div class="bk3-sec"></div>';
    var tahmin = null;
    [['Daha iyi temizlenir', 0], ['Aşırı hızlanıp zarar görebilir', 1]].forEach(function (x) {
      DERS.dugme(tahminK.querySelector('.bk3-sec'), x[0], function () { tahmin = x[1]; tahminK.hidden = true; pr.oynat(); });
    });
    var sonucK = D.div('bk3-sonuc', s.arayuz);
    sonucK.setAttribute('aria-live', 'polite');
    var gorunum0 = null, etiketler = [];
    function kaldirHepsi() { etiketler.forEach(function (e) { e.kaldir(); }); etiketler.length = 0; }
    function sifirla() {
      kaldirHepsi();
      fu.tozla(0, 0); tozMat.opacity = 0; fu.hiz = 10; cpuW = 10;
      cubuk.visible = false; cubuk.position.copy(cubukDis);
      kutu.visible = false; kutu.scale.setScalar(1); huzme.material.opacity = 0;
      parcaciklar.forEach(function (q) { q.m.visible = false; });
      sicaklik = 46; tB.textContent = '46 °C'; tK.className = 'bk3-t';
      gucYaz(true); sonucK.textContent = '';
      var gd = kasa.getObjectByName('guc-dugmesi'); if (gd) D.vurguKaldir(gd, 0);
      if (!gorunum0) gorunum0 = { theta: s.orb.theta, phi: s.orb.phi, yakinlik: s.orb.yakinlik, hedef: s.orb.hedef.clone() };
      else s.kameraGit(gorunum0, 0.6);
    }
    var yakin = { theta: Math.atan2(-1, 0.55), phi: 1.25, yakinlik: 0.5, hedef: fanPos.clone().add(new V3(-4, -3, 3)) };
    var pr = prova(s, [
      { metin: 'Aylar içinde toz birikir: fan yavaşlar, sıcaklık yükselir.', calis: function () {
        etiketler.push(s.etiket(fan, 'Tozlu fan', { tur: 'vurgu' }));
        return Promise.all([fu.tozla(1, 2.6), sicaklikGit(84, 2.6),
          D.tween({ sahne: s, sure: 2.6, guncelle: function (e) { tozMat.opacity = 0.92 * e; } })]).then(function () { return D.bekle(0.6, s); });
      } },
      { metin: 'Bakımdan önce: kapat, fişi çek, güç düğmesine basıp kalan enerjiyi boşalt.', calis: function () {
        kaldirHepsi();
        var gd = kasa.getObjectByName('guc-dugmesi');
        gucYaz(false);
        return Promise.all([fu.hizAyarla(0, 1.4), D.tween({ sahne: s, sure: 1.4, guncelle: function (e) { cpuW = 10 * (1 - e); } }),
          gd ? D.vurgula(gd, { etiket: 'Güç düğmesi: birkaç saniye bas' }) : Promise.resolve()])
          .then(function () { return D.bekle(1.2, s); }).then(function () { return gd ? D.vurguKaldir(gd) : null; });
      } },
      { metin: 'Fanı sabitle: plastik bir çubuk kanatları tutar.', calis: function () {
        cubuk.visible = true;
        return s.kameraGit(yakin, 1.1).then(function () { return D.git(cubuk, cubukHedef, 1); }).then(function () {
          etiketler.push(s.etiket(cubuk, 'Fan sabit', { tur: 'vurgu' }));
          if (tahmin != null) {
            sonucK.className = 'bk3-sonuc ' + (tahmin === 1 ? 'dogru' : 'yanlis');
            sonucK.textContent = (tahmin === 1 ? '✓ Tahminin doğru: ' : '✗ Tahminin “daha iyi temizlenir” idi. ') +
              'Hava akımı serbest fanı normalden hızlı döndürebilir; yatak zarar görebilir.';
          } else {
            sonucK.className = 'bk3-sonuc';
            sonucK.textContent = 'Serbest fan hava akımıyla aşırı hızlanabilir; yatak zarar görebilir.';
          }
          return D.bekle(1.4, s);
        });
      } },
      { metin: 'Kutu dik, kısa püskürtmeler: toz fanın arkasından dışarı atılır.', calis: function () {
        kaldirHepsi();
        kutu.visible = true; kutu.scale.setScalar(0.01);
        etiketler.push(s.etiket(kutu, 'Dik tut · kısa püskürt', { tur: 'vurgu', yer: 'alt' }));
        var z = s.kameraGit({ theta: Math.atan2(-1, 0.75), phi: 1.25, yakinlik: 0.95, hedef: fanPos.clone().add(new V3(-10, -9, 5)) }, 0.9)
          .then(function () { return D.tween({ sahne: s, sure: 0.5, guncelle: function (e) { kutu.scale.setScalar(0.01 + 0.99 * e); } }); });
        [0.62, 0.28, 0].forEach(function (hedefToz) {
          z = z.then(function () {
            puskurt(); ses('klik');
            return Promise.all([
              D.tween({ sahne: s, sure: 0.55, ease: 'lineer', guncelle: function (e) { huzme.material.opacity = 0.55 * Math.sin(e * Math.PI); } }),
              fu.tozla(hedefToz, 0.55),
              D.tween({ sahne: s, sure: 0.55, guncelle: function () { tozMat.opacity = Math.max(0, Math.min(tozMat.opacity, hedefToz * 1.3)); } })
            ]);
          }).then(function () { return D.bekle(0.45, s); });
        });
        return z;
      } },
      { metin: 'Çubuğu çıkar, kasayı kapat, fişi tak: fan tam hızda, sıcaklık düştü.', calis: function () {
        kaldirHepsi(); sonucK.textContent = '';
        return D.git(cubuk, cubukDis, 0.8).then(function () {
          cubuk.visible = false; kutu.visible = false; tozMat.opacity = 0;
          gucYaz(true);
          return Promise.all([s.kameraGit(gorunum0, 1), fu.hizAyarla(10, 1.2),
            D.tween({ sahne: s, sure: 1.2, guncelle: function (e) { cpuW = 10 * e; } }), sicaklikGit(46, 2.4)]);
        }).then(function () {
          sonucK.className = 'bk3-sonuc dogru';
          sonucK.textContent = '✓ Bakım kaydına yaz: tarih, temizlenen parçalar, önceki ve sonraki sıcaklık.';
        });
      } }
    ], { sifirla: sifirla, basla: function () { tahminK.hidden = true; } });
    sifirla();
  });

  /* ═══════════ Adım 5: 3-2-1 yedek ve güvenli silme ═══════════ */
  (function () {
    var kok = document.getElementById('silme');
    if (!kok) return;
    var DOSYA = [{ h: 'A', ad: 'proje-raporu.docx', n: 10 }, { h: 'B', ad: 'fotograflar/ (84 dosya)', n: 14 }, { h: 'C', ad: 'notlar.txt', n: 4 }];
    var HUCRE = 48, YEDEK_ALAN = 8;
    // Dosya bloklarının disk üzerindeki (dağınık) yerleri — belirleyici
    var yerler = [], rng = K.rng(21), bos = [];
    for (var i = 0; i < HUCRE; i++) bos.push(i);
    DOSYA.forEach(function (d, j) {
      for (var k = 0; k < d.n; k++) { var r = Math.floor(rng() * bos.length); yerler[bos.splice(r, 1)[0]] = j; }
    });
    kok.innerHTML = '<div class="sl">' +
      '<div class="sl-yedek"><button type="button" class="sl-yedek-d">Önce yedek al (3-2-1)</button>' +
      '<div class="sl-kopya" data-k="0"><b>1</b><span>Asıl kopya<small>bilgisayar</small></span></div>' +
      '<div class="sl-kopya" data-k="1"><b>2</b><span>Harici disk<small>farklı ortam</small></span></div>' +
      '<div class="sl-kopya" data-k="2"><b>3</b><span>Okul sunucusu<small>başka yerde</small></span></div></div>' +
      '<div class="secici sl-tur" role="group" aria-label="Disk türü"></div>' +
      '<div class="sl-orta"><div class="sl-tablo"><div class="sl-tb">Dosya tablosu</div><ul></ul></div>' +
      '<div class="sl-disk"><div class="sl-izgara" role="img" aria-label="Disk blokları"></div><div class="sl-ya-bas">SSD yedek alanı (işletim sistemi göremez)</div><div class="sl-izgara ya"></div></div></div>' +
      '<div class="secici sl-yontem" role="group" aria-label="Silme yöntemi"></div>' +
      '<div class="sl-alt"><div class="sl-kurtar"><span>Kurtarma aracı</span><b>—</b></div><div class="panel-sonuc sl-sonuc" aria-live="polite"></div></div></div>';
    var izg = kok.querySelector('.sl-izgara:not(.ya)'), izgYa = kok.querySelector('.sl-izgara.ya'), yaBas = kok.querySelector('.sl-ya-bas'),
      liste = kok.querySelector('.sl-tablo ul'), kurtarB = kok.querySelector('.sl-kurtar b'), kurtarK = kok.querySelector('.sl-kurtar'),
      sonuc = kok.querySelector('.sl-sonuc'), turK = kok.querySelector('.sl-tur'), yontemK = kok.querySelector('.sl-yontem'),
      yedekD = kok.querySelector('.sl-yedek-d'), kopyalar = kok.querySelectorAll('.sl-kopya');
    var hucreler = [], yaHucre = [];
    for (i = 0; i < HUCRE; i++) hucreler.push(el('span', 'sl-h', izg));
    for (i = 0; i < YEDEK_ALAN; i++) yaHucre.push(el('span', 'sl-h', izgYa));
    var durum, yaDurum, tur = 'hdd', yedekli = false, mesgul = false, tablo;
    // hücre durumu: [dosya, hal] hal: 'dolu' | 'serbest' (silinmiş ama veri duruyor) | 'sifir' | 'bozuk'
    function hucreCiz(h, d) {
      if (!d) { h.className = 'sl-h'; h.textContent = ''; return; }
      if (d.hal === 'sifir') { h.className = 'sl-h sifir'; h.textContent = '0'; return; }
      if (d.hal === 'bozuk') { h.className = 'sl-h bozuk'; h.textContent = '#'; return; }
      h.className = 'sl-h f' + d.f + (d.hal === 'serbest' ? ' serbest' : '') + (tur === 'sifreli' ? ' kilit' : '');
      h.textContent = DOSYA[d.f].h;
    }
    function ciz() {
      hucreler.forEach(function (h, j) { hucreCiz(h, durum[j]); });
      yaHucre.forEach(function (h, j) { hucreCiz(h, yaDurum[j]); });
      izgYa.hidden = yaBas.hidden = tur === 'hdd';
      liste.innerHTML = '';
      if (tablo === 'bos') el('li', 'sl-bos', liste, 'Yeni, boş tablo');
      else DOSYA.forEach(function (d, j) {
        var li = el('li', 'f' + j + (tablo === 'silindi' ? ' silindi' : ''), liste);
        el('b', '', li, d.h); el('span', '', li, d.ad);
      });
      var bulunan = {};
      durum.concat(tur === 'hdd' ? [] : yaDurum).forEach(function (d) { if (d && (d.hal === 'dolu' || d.hal === 'serbest')) bulunan[d.f] = true; });
      var n = Object.keys(bulunan).length;
      var sadeceYa = n && !durum.some(function (d) { return d && (d.hal === 'dolu' || d.hal === 'serbest'); });
      kurtarB.textContent = n === 0 ? '0 / 3 dosya · kurtarılamaz' : (sadeceYa ? 'parçalar okunabilir (yedek alandan)' : n + ' / 3 dosya bulunabilir');
      kurtarK.className = 'sl-kurtar ' + (n === 0 ? 'guvenli' : (sadeceYa ? 'kismi' : 'riskli'));
    }
    function baslat() {
      durum = []; yaDurum = [];
      for (var j = 0; j < HUCRE; j++) durum.push(yerler[j] != null ? { f: yerler[j], hal: 'dolu' } : null);
      // SSD aşınma dengeleme: yedek alanda A ve B’nin eski kopyaları
      for (j = 0; j < YEDEK_ALAN; j++) yaDurum.push(j < 5 ? { f: j < 3 ? 0 : 1, hal: 'serbest' } : null);
      tablo = 'dolu'; ciz();
      yontemK.querySelectorAll('button').forEach(function (b) { b.disabled = b.dataset.y === 'anahtar' && tur !== 'sifreli'; });
    }
    function animHucreler(liste2, fn, sure) {
      var adim = AZ ? 0 : sure / Math.max(1, liste2.length);
      return new Promise(function (coz) {
        var j = 0;
        (function k() {
          var n = AZ ? liste2.length : Math.max(1, Math.round(liste2.length / 16));
          for (var q = 0; q < n && j < liste2.length; q++, j++) fn(liste2[j]);
          ciz();
          if (j < liste2.length) setTimeout(k, adim * 1000 * n); else coz();
        })();
      });
    }
    var YONTEM = [
      ['sil', 'Sil ve çöp kutusunu boşalt', function () {
        tablo = 'silindi';
        durum.forEach(function (d) { if (d) d.hal = 'serbest'; });
        ciz();
        sonuc.textContent = tur === 'hdd' ? 'Yalnız tablodaki kayıtlar silindi; bloklar “boş” işaretlendi ama veri duruyor. Kurtarma aracı dosyaları buluyor.'
          : 'SSD’de TRIM ile bloklar zamanla temizlenebilir; ama ne zaman olacağı garanti değildir. Kurtarma aracı şimdilik dosyaları buluyor.';
        return Promise.resolve();
      }],
      ['hizli', 'Hızlı biçimlendir', function () {
        tablo = 'bos';
        durum.forEach(function (d) { if (d) d.hal = 'serbest'; });
        ciz();
        sonuc.textContent = 'Yeni ve boş bir tablo yazıldı; veri bloklarına dokunulmadı. Kurtarma aracı dosyaları hâlâ buluyor.';
        return Promise.resolve();
      }],
      ['yaz', 'Tüm diskin üzerine yaz', function () {
        tablo = 'bos';
        sonuc.textContent = 'Görünen tüm bloklara sıfır yazılıyor…';
        var idx = durum.map(function (d, j) { return j; });
        return animHucreler(idx, function (j) { durum[j] = { hal: 'sifir' }; }, 2.2).then(function () {
          sonuc.textContent = tur === 'hdd' ? '✓ HDD’de her blok yeniden yazıldı: veri kurtarılamaz. Uzun sürer ama güvenilirdir.'
            : '⚠ SSD’de işletim sistemi yedek alanı göremez: eski kopyaların parçaları orada kaldı. SSD için güvenli silme komutu gerekir.';
        });
      }],
      ['guvenli', 'Güvenli silme komutu', function () {
        tablo = 'bos';
        sonuc.textContent = 'Disk denetleyicisi kendi silme komutunu çalıştırıyor (yedek alan dahil)…';
        var idx = durum.map(function (d, j) { return j; });
        return animHucreler(idx, function (j) { durum[j] = { hal: 'sifir' }; }, 1.4).then(function () {
          yaDurum = yaDurum.map(function () { return { hal: 'sifir' }; }); ciz();
          sonuc.textContent = tur === 'hdd' ? '✓ Destekleyen HDD’de de çalışır: tüm yüzey silindi. Silinemeyen arızalı disk yetkili firmada fiziksel olarak imha edilir.'
            : '✓ Denetleyici yedek alan dahil tüm hücreleri sildi: veri kurtarılamaz.';
        });
      }],
      ['anahtar', 'Şifreleme anahtarını yok et', function () {
        tablo = 'bos';
        durum = durum.map(function (d) { return d ? { hal: 'bozuk' } : null; });
        yaDurum = yaDurum.map(function (d) { return d ? { hal: 'bozuk' } : null; });
        ciz();
        sonuc.textContent = '✓ Kriptografik silme: veri baştan şifreliydi; anahtar yok edilince bloklar anlamsız bayt yığınıdır. Saniyeler sürer.';
        return Promise.resolve();
      }]
    ];
    YONTEM.forEach(function (y) {
      var b = DERS.dugme(yontemK, y[1], function () {
        if (mesgul) return;
        if (!yedekli) { sonuc.textContent = '⚠ Önce yedek! Silmeden önce saklanacak veriler 3-2-1 kuralıyla kopyalanır.'; yedekD.classList.add('dikkat'); ses('hata'); return; }
        if (tablo !== 'dolu' && y[0] !== 'sil' && y[0] !== 'hizli' && durum.every(function (d) { return !d || d.hal === 'sifir' || d.hal === 'bozuk'; })) baslat();
        mesgul = true;
        y[2]().then(function () { mesgul = false; });
      });
      b.dataset.y = y[0];
    });
    DERS.dugme(yontemK, 'Baştan', function () { if (!mesgul) { baslat(); sonuc.textContent = 'Disk eski hâline döndü. Başka bir yöntem dene.'; } }, 'sl-bastan');
    var turD = {};
    [['hdd', 'HDD'], ['ssd', 'SSD'], ['sifreli', 'Şifreli SSD']].forEach(function (t) {
      turD[t[0]] = DERS.dugme(turK, t[1], function () {
        if (mesgul) return;
        tur = t[0];
        Object.keys(turD).forEach(function (k) { basin(turD[k], k === tur); });
        baslat();
        sonuc.textContent = tur === 'hdd' ? 'HDD: veri manyetik plakada, her blok yerinde yeniden yazılabilir.'
          : (tur === 'ssd' ? 'SSD: denetleyici yazmaları hücrelere dağıtır; işletim sisteminin göremediği bir yedek alan vardır.'
            : 'Şifreli SSD: her blok bir anahtarla şifreli yazılır; anahtar olmadan okunamaz.');
      });
    });
    yedekD.addEventListener('click', function () {
      if (yedekli || mesgul) return;
      mesgul = true; yedekD.classList.remove('dikkat');
      sonuc.textContent = 'Saklanacak dosyalar kopyalanıyor…';
      var z = Promise.resolve();
      kopyalar.forEach(function (k) { z = z.then(function () { k.classList.add('tamam'); return bekle(0.45); }); });
      z.then(function () {
        yedekli = true; mesgul = false; yedekD.textContent = '✓ Yedek hazır (3-2-1)'; yedekD.classList.add('tamam');
        sonuc.textContent = '3 kopya, 2 farklı ortam, 1 kopya başka yerde. Şimdi bir silme yöntemi seç.';
      });
    });
    basin(turD.hdd, true);
    baslat();
    sonuc.textContent = 'Bu disk bağışlanacak. Önce yedek al, sonra silme yöntemlerini dene.';
  })();

  /* ═══════════ Adım 6: e-atık yolculuğu ═══════════ */
  (function () {
    var kok = document.getElementById('eatik');
    if (!kok) return;
    var N = {
      eski: [8, 90, 76, 40, 'Eski bilgisayar', ''],
      sil: [98, 90, 78, 40, 'Veriyi güvenle sil', 'önce yedek'],
      yeniden: [196, 10, 156, 40, 'Yeniden kullan · bağışla', 'çalışıyorsa'],
      topla: [196, 90, 72, 40, 'Toplama noktası', 'belediye · satıcı'],
      tesis: [282, 90, 70, 40, 'Lisanslı tesis', 'söküm · ayırma'],
      metal: [196, 170, 72, 40, 'Metaller', 'altın · bakır · Al'],
      zarar: [282, 170, 70, 40, 'Zararlılar', 'kurşun · cıva'],
      cop: [8, 170, 76, 40, 'Çöp kutusu', 'yanlış yol'],
      kirli: [98, 170, 84, 40, 'Toprak ve su', 'kirlenir']
    };
    function orta(k) { var n = N[k]; return [n[0] + n[2] / 2, n[1] + n[3] / 2]; }
    function dinlen(k) { var n = N[k]; return [n[0] + n[2] - 10, n[1] - 1]; }
    var BAG = [['eski', 'sil'], ['sil', 'yeniden'], ['sil', 'topla'], ['topla', 'tesis'], ['tesis', 'metal'], ['tesis', 'zarar'], ['eski', 'cop'], ['cop', 'kirli']];
    function yolNok(a, b) {
      var A = N[a], B = N[b], p = orta(a), q = orta(b);
      if (A[1] === B[1]) return [[A[0] + A[2], p[1]], [B[0], q[1]]];
      if (A[0] === B[0] || Math.abs(p[0] - q[0]) < 4) return [[p[0], A[1] + (B[1] > A[1] ? A[3] : 0)], [q[0], B[1] + (B[1] > A[1] ? 0 : B[3])]];
      var x = B[0] - 10;
      if (B[1] < A[1]) return [[A[0] + A[2], p[1]], [x, p[1]], [x, q[1]], [B[0], q[1]]];
      if (a === 'tesis') return [[p[0], A[1] + A[3]], [p[0], A[1] + A[3] + 8], [q[0] - (b === 'metal' ? 0 : 0), A[1] + A[3] + 8], [q[0], B[1]]];
      return [[p[0], A[1] + A[3]], [q[0], B[1]]];
    }
    var svg = '<svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="E-atık akışı: eski bilgisayar, veriyi güvenle sil; çalışıyorsa yeniden kullan, çalışmıyorsa toplama noktası ve lisanslı tesis; metaller geri kazanılır, zararlılar ayrıştırılır. Yanlış yol: çöp, toprak ve su kirliliği">' +
      '<defs><marker id="eaOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#94a3b8"/></marker></defs>';
    BAG.forEach(function (b) {
      var p = yolNok(b[0], b[1]);
      svg += '<polyline class="ea-bag" data-b="' + b[0] + '-' + b[1] + '" points="' + p.map(function (x) { return x.join(','); }).join(' ') + '" fill="none" marker-end="url(#eaOk)"/>';
    });
    Object.keys(N).forEach(function (k) {
      var n = N[k];
      svg += '<g class="ea-d' + (k === 'cop' || k === 'kirli' ? ' kotu' : '') + '" data-k="' + k + '"><rect x="' + n[0] + '" y="' + n[1] + '" width="' + n[2] + '" height="' + n[3] + '" rx="8"/>' +
        '<text x="' + (n[0] + n[2] / 2) + '" y="' + (n[1] + (n[5] ? 17 : 24)) + '" class="ea-ad">' + n[4] + '</text>' +
        (n[5] ? '<text x="' + (n[0] + n[2] / 2) + '" y="' + (n[1] + 30) + '" class="ea-alt">' + n[5] + '</text>' : '') + '</g>';
    });
    svg += '<g class="ea-pil" opacity="0"><rect x="230" y="136" width="46" height="18" rx="4"/><text x="253" y="148.5">pil ayrı</text></g>';
    svg += '<g class="ea-jeton"><rect x="-8" y="-6" width="16" height="11" rx="2"/><rect x="-6" y="-4" width="12" height="7" rx="1" fill="#c7d2fe"/></g><g class="ea-jeton2" opacity="0"><circle r="5"/></g></svg>';
    kok.innerHTML = '<div class="ea"><div class="ea-cizim">' + svg + '</div><div class="ea-kart" aria-live="polite"></div>' +
      '<div class="secici ea-sec" role="group" aria-label="Cihazın durumu"></div></div>';
    var jeton = kok.querySelector('.ea-jeton'), jeton2 = kok.querySelector('.ea-jeton2'), kart = kok.querySelector('.ea-kart'), pil = kok.querySelector('.ea-pil');
    var BILGI = {
      eski: 'Okul, beş yıllık bir bilgisayarı değiştiriyor.',
      sil: 'Önce saklanacak veriler 3-2-1 ile yedeklenir; sonra disk türüne uygun yöntemle güvenle silinir.',
      yeniden: 'Çalışan cihaz yeniden kullanılır ya da bağışlanır: en çevreci seçenek ömrü uzatmaktır.',
      topla: 'Belediyenin e-atık noktası ya da satıcının geri alım kutusu. Pil çıkarılıp ayrı toplanır.',
      tesis: 'Lisanslı tesiste cihaz sökülür, malzemeler türüne göre ayrılır.',
      metal: 'Devre kartlarındaki altın ve bakır, kasadaki alüminyum ve çelik geri kazanılır.',
      zarar: 'Lehimdeki kurşun ve bazı eski ekranlardaki cıva gibi zararlı maddeler güvenle ayrıştırılır.',
      cop: 'Yanlış yol: e-atık evsel çöpe atılmaz.',
      kirli: 'Çöpte parçalanan cihazdan zararlı maddeler toprağa ve suya karışabilir; değerli metaller de kaybolur.'
    };
    var YOLLAR = { calisiyor: ['eski', 'sil', 'yeniden'], calismiyor: ['eski', 'sil', 'topla', 'tesis', 'metal'], cop: ['eski', 'cop', 'kirli'] };
    var no = 0;
    function temizle() {
      kok.querySelectorAll('.ea-d').forEach(function (g) { g.setAttribute('class', g.getAttribute('class').replace(/ (aktif|gecti)/g, '')); });
      kok.querySelectorAll('.ea-bag').forEach(function (p) { p.setAttribute('class', 'ea-bag'); });
      pil.setAttribute('opacity', '0'); jeton2.setAttribute('opacity', '0');
    }
    function durak(k, sinif) { var g = kok.querySelector('.ea-d[data-k="' + k + '"]'); g.setAttribute('class', g.getAttribute('class').replace(/ (aktif|gecti)/g, '') + ' ' + sinif); }
    function kay(j, noktalar, sure, benimNo) {
      return new Promise(function (coz) {
        var uz = [0], L = 0;
        for (var i = 1; i < noktalar.length; i++) { L += Math.hypot(noktalar[i][0] - noktalar[i - 1][0], noktalar[i][1] - noktalar[i - 1][1]); uz.push(L); }
        var t0 = null;
        function yer(d) {
          for (var i = 1; i < uz.length; i++) if (d <= uz[i]) {
            var e = (d - uz[i - 1]) / Math.max(0.001, uz[i] - uz[i - 1]);
            return [noktalar[i - 1][0] + (noktalar[i][0] - noktalar[i - 1][0]) * e, noktalar[i - 1][1] + (noktalar[i][1] - noktalar[i - 1][1]) * e];
          }
          return noktalar[noktalar.length - 1];
        }
        (function k(ts) {
          if (benimNo !== no) return coz(false);
          if (t0 == null) t0 = ts;
          var e = AZ ? 1 : Math.min(1, (ts - t0) / (sure * 1000));
          var p = yer(L * e);
          j.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')');
          if (e < 1) requestAnimationFrame(k); else coz(true);
        })(performance.now());
      });
    }
    function oynat(ad) {
      var benimNo = ++no, yol = YOLLAR[ad];
      Object.keys(secD).forEach(function (k) { basin(secD[k], k === ad); });
      temizle();
      jeton.setAttribute('class', 'ea-jeton' + (ad === 'cop' ? ' kotu' : ''));
      var p0 = dinlen('eski');
      jeton.setAttribute('transform', 'translate(' + p0[0] + ' ' + p0[1] + ')');
      durak('eski', 'aktif'); kart.textContent = BILGI.eski;
      var z = bekle(0.9);
      yol.slice(1).forEach(function (k, i) {
        var once = yol[i];
        z = z.then(function (devam) {
          if (benimNo !== no) return false;
          durak(once, 'gecti');
          kok.querySelector('.ea-bag[data-b="' + once + '-' + k + '"]').setAttribute('class', 'ea-bag aktif' + (ad === 'cop' ? ' kotu' : ''));
          var pts = yolNok(once, k).map(function (x) { return x.slice(); });
          pts.unshift(dinlen(once)); pts.push(dinlen(k));
          return kay(jeton, pts, 1.0, benimNo).then(function (ok) {
            if (!ok) return false;
            durak(k, 'aktif'); kart.textContent = BILGI[k];
            if (k === 'topla') pil.setAttribute('opacity', '1');
            if (k === 'metal') {
              // ikinci jeton zararlılara
              jeton2.setAttribute('opacity', '1');
              var q = yolNok('tesis', 'zarar'); q.unshift(dinlen('tesis')); q.push(dinlen('zarar'));
              kok.querySelector('.ea-bag[data-b="tesis-zarar"]').setAttribute('class', 'ea-bag aktif');
              return kay(jeton2, q, 0.8, benimNo).then(function () {
                if (benimNo !== no) return false;
                durak('zarar', 'aktif');
                kart.textContent = BILGI.metal + ' ' + BILGI.zarar;
                return bekle(0.4);
              });
            }
            return bekle(1.4);
          });
        });
      });
      z.then(function () { if (benimNo === no && ad === 'cop') ses('hata'); });
    }
    var secK = kok.querySelector('.ea-sec'), secD = {};
    [['calisiyor', 'Çalışıyor'], ['calismiyor', 'Çalışmıyor'], ['cop', 'Çöpe atılırsa']].forEach(function (x) {
      secD[x[0]] = DERS.dugme(secK, x[1], function () { oynat(x[0]); }, x[0] === 'cop' ? 'ea-kotu-d' : '');
    });
    var p0 = dinlen('eski');
    jeton.setAttribute('transform', 'translate(' + p0[0] + ' ' + p0[1] + ')');
    kart.textContent = 'Cihazın durumunu seç: yolculuk ona göre değişir.';
    DERS.slaytAcilinca('s10', function () { if (!AZ) setTimeout(function () { if (slaytAktif('s10')) oynat('calismiyor'); }, 600); });
  })();

  /* ═══════════ Etkinlik 1: E-TESHIS teşhis simülatörü ═══════════ */
  (function () {
    var kok = document.getElementById('teshis');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-1');
    var gorevLi = document.querySelectorAll('#ts-gorevler li');
    function olu(dp) { dp.guc(false); dp.ledSondur(); dp.ekran([], 'bos'); }
    function canli(dp) { dp.guc(true); dp.ledSondur(); dp.ekran([], 'bos'); }
    // Vaka tanımları. Test: [id, ad, süre dk, maliyet (₺ sayısı), sonuç, eler[], destek[], durum fn]
    // Onarım: {ad, sure, maliyet, parca, cozer, gereksiz, sonuc, gerek, on}
    var VAKA = [
      { ad: 'Hiç tepki yok', neden: 'h2',
        belirti: 'Güç düğmesine basınca hiçbir ışık yanmıyor, fan dönmüyor. Sabah temizlikten sonra masa yerinden oynatılmış.',
        bas: function (dp) { olu(dp); dp.olcum(''); },
        hip: [['h1', 'Priz ya da uzatma enerjisiz'], ['h2', 'Güç kablosu gevşek / arka anahtar kapalı'], ['h3', 'Ön panel düğme kablosu çıkmış'], ['h4', 'Güç kaynağı arızalı'], ['h5', 'Anakart arızalı']],
        test: [
          ['t1', 'Prizi başka bir cihazla dene', 1, 0, 'Masa lambası aynı prizde yanıyor: priz ve uzatma sağlam.', ['h1'], []],
          ['t2', 'Güç kablosunu ve arka anahtarı kontrol et', 1, 0, 'Kablo güç kaynağına yarım oturmuş, arka anahtar 0 konumunda.', [], ['h2']],
          ['t3', 'Fiş çekili: ön panel kablosuna bak', 6, 0, 'Ön panel düğme kablosu anakart başlığında doğru takılı.', ['h3'], []],
          ['t4', 'Sağlam bir güç kaynağıyla değiştirerek dene', 20, 2, 'Yedek güç kaynağıyla açıldı. Ama yeni kaynağın kablosu ve anahtarı da değişti: bu, tek değişkenli bir test değil!', ['h5'], ['h2', 'h4']]
        ],
        onar: [
          { ad: 'Kabloyu oturt, anahtarı I’ya al', sure: 1, maliyet: 0, cozer: true, sonuc: 'Tek değişiklik: sistem açıldı.' },
          { ad: 'Güç kaynağını yenisiyle değiştir', sure: 25, maliyet: 2, parca: true, cozer: true, gereksiz: true, sonuc: 'Sistem açıldı; ama sağlam güç kaynağı gereksiz yere değişti. Asıl neden gevşek kablo ve kapalı anahtardı.' },
          { ad: 'Anakartı değiştir', sure: 60, maliyet: 3, parca: true, gereksiz: true, sonuc: 'Değişmedi: güç hâlâ gelmiyor. Sağlam anakart gereksiz yere söküldü.' }
        ] },
      { ad: 'Fan dönüyor, görüntü yok', neden: 'h2',
        belirti: 'Açılınca fanlar dönüyor, güç ışığı yanıyor; monitörde “Sinyal yok” yazıyor. Dün bilgisayara bellek eklenmiş.',
        bas: function (dp) { canli(dp); dp.led(1, 'hata'); dp.olcum(''); },
        hip: [['h1', 'Monitör kablosu ya da girişi'], ['h2', 'Yeni bellek tam oturmamış'], ['h3', 'Ekran kartı arızalı'], ['h4', 'Güç kaynağı yetersiz'], ['h5', 'İşlemci arızalı']],
        test: [
          ['t1', 'Anakarttaki hata ışığını oku', 1, 0, 'DRAM ışığı yanık kalıyor: POST bellek aşamasında takılıyor (işlemci aşaması geçildi, görüntü aşamasına gelinmedi).', ['h1', 'h3', 'h5'], ['h2']],
          ['t2', 'Monitör kablosunu ve girişini kontrol et', 2, 0, 'Kablo ekran kartında, giriş doğru; monitör başka bilgisayarda çalışıyor.', ['h1'], []],
          ['t3', 'Fiş çekili: yeni modülü çıkar, eskiyle dene', 6, 0, 'Yalnız eski bellekle açıldı: sorun yeni modülde ya da takılışında.', ['h3', 'h4', 'h5'], ['h2'], function (dp) { dp.boot('Eski bellekle açıldı'); }],
          ['t4', 'Güç kaynağı çıkışlarını ölç (öğretmen)', 15, 1, 'Ölçülen gerilimler normal aralıkta.', ['h4'], []]
        ],
        onar: [
          { ad: 'Fiş çekili: yeni belleği yuvaya tam oturt', sure: 5, maliyet: 0, cozer: true, sonuc: 'Mandallar klik sesiyle kapandı; iki modülle POST tamamlandı.' },
          { ad: 'Ekran kartını değiştir', sure: 20, maliyet: 3, parca: true, gereksiz: true, sonuc: 'Değişmedi: DRAM ışığı hâlâ yanık. Ekran kartı gereksiz yere değişti.' },
          { ad: 'Yeni bir bellek modülü satın al', sure: 30, maliyet: 2, parca: true, cozer: true, gereksiz: true, sonuc: 'Açıldı; ama eski modül de doğru oturtulunca çalışıyordu. Gereksiz harcama.' }
        ] },
      { ad: 'Yükte kendiliğinden kapanma', neden: 'h1',
        belirti: 'Oyun ya da video işleme başladıktan 15–20 dakika sonra bilgisayar kendiliğinden kapanıyor. Boştayken sorun yok.',
        bas: function (dp) { canli(dp); dp.ekran(['', '  Masaüstü (boşta)'], 'is'); dp.olcum('CPU — °C · fan —'); },
        hip: [['h1', 'Aşırı ısınma (toz, fan)'], ['h2', 'Güç kaynağı yükte yetersiz'], ['h3', 'İşletim sistemi / sürücü hatası'], ['h4', 'Bellek hatası']],
        test: [
          ['t1', 'Yük altında sıcaklığı izle', 20, 0, 'İşlemci 97 °C’ye çıktı, saat hızı düştü; kapanma anında 100 °C.', [], ['h1'], function (dp) { dp.olcum('CPU 100 °C · kapandı'); dp.guc(false); dp.ekran([], 'bos'); }],
          ['t2', 'Fan hızlarını oku', 2, 0, 'İşlemci fanı yükte bile 450 dev/dk; hızlanmıyor.', [], ['h1'], function (dp) { dp.olcum('CPU fanı 450 dev/dk'); dp.fanYavas(true); }],
          ['t3', 'Bellek testi çalıştır', 30, 0, 'Bellek testi hatasız tamamlandı.', ['h4'], []],
          ['t4', 'Olay günlüğüne bak', 5, 0, 'Kapanmadan önce yazılım hatası yok; kayıt “beklenmedik kapanma” diyor.', ['h3'], []]
        ],
        onar: [
          { ad: 'Fiş çekili: fanı sabitleyip soğutucuyu temizle', sure: 15, maliyet: 1, cozer: true, sonuc: 'Yükte 72 °C, bir saat boyunca kapanma yok.', durum: function (dp) { dp.olcum('CPU 72 °C · fan 1 450 dev/dk'); } },
          { ad: 'Güç kaynağını değiştir', sure: 25, maliyet: 2, parca: true, gereksiz: true, sonuc: 'Yine kapandı: sıcaklık hâlâ 100 °C. Güç kaynağı gereksiz yere değişti.' },
          { ad: 'İşletim sistemini yeniden kur', sure: 60, maliyet: 0, sonuc: 'Kurulum bir saat sürdü; sorun sürüyor. Üstelik veriler risk altına girdi.' }
        ] },
      { ad: 'Önyüklenebilir aygıt yok', neden: 'h2',
        belirti: 'POST tamamlanıyor, ekranda “Önyüklenebilir aygıt bulunamadı” iletisi çıkıyor. Kasa geçen hafta başka sınıfa taşındı.',
        bas: function (dp) { canli(dp); dp.led(3, 'hata'); dp.ekran(['POST ✓', 'Önyüklenebilir aygıt', 'bulunamadı.'], 'uyari'); dp.olcum(''); },
        hip: [['h1', 'Önyükleme sırası / modu değişmiş'], ['h2', 'Disk veri ya da güç kablosu gevşek'], ['h3', 'Disk arızalı'], ['h4', 'İşletim sistemi dosyaları bozuk']],
        test: [
          ['t1', 'UEFI’de disk listede görünüyor mu?', 3, 0, 'Disk listede yok: firmware diski hiç görmüyor. Sıra ya da işletim sistemi dosyaları bu belirtiyi açıklamaz.', ['h1', 'h4'], ['h2', 'h3'], function (dp) { dp.ekran(['UEFI · Depolama', '— aygıt yok —'], 'post'); }],
          ['t2', 'Fiş çekili: SATA veri ve güç kablolarına bak', 6, 0, 'SATA veri kablosu disk ucunda gevşemiş.', [], ['h2']],
          ['t3', 'Diski başka bir bilgisayarda dene', 20, 0, 'Disk diğer bilgisayarda görünüyor; SMART durumu iyi.', ['h3'], ['h2']]
        ],
        onar: [
          { ad: 'Kabloyu yerine oturt', sure: 3, maliyet: 0, cozer: true, sonuc: 'Disk UEFI’de göründü; sistem açıldı.' },
          { ad: 'Yeni disk tak, sistemi yeniden kur', sure: 90, maliyet: 2, parca: true, cozer: true, gereksiz: true, sonuc: 'Açıldı; ama eski diskteki dosyalar ortada yok ve sağlam disk gereksiz yere değişti.' },
          { ad: 'Önyükleme sırasını sıfırla', sure: 3, maliyet: 0, sonuc: 'Değişmedi: firmware diski görmüyorsa sıra işe yaramaz.' }
        ] },
      { ad: 'Yavaşlama ve disk uyarısı', neden: 'h1',
        belirti: 'Bilgisayar haftalardır giderek yavaşlıyor; dosyalar geç açılıyor, bazen “disk sorunu” uyarısı çıkıyor. Diskte beş yıllık proje dosyaları var.',
        bas: function (dp) { canli(dp); dp.ekran(['', '  ⚠ Disk sorunu', '  algılandı'], 'uyari'); dp.olcum(''); },
        hip: [['h1', 'Disk arızalanıyor'], ['h2', 'Disk dolu'], ['h3', 'Zararlı yazılım / arka plan işi'], ['h4', 'Bellek yetersiz']],
        test: [
          ['t1', 'Görev yöneticisinde kaynakları izle', 3, 0, 'Disk %100, bellek %45, işlemci %10.', ['h4'], ['h1', 'h3'], function (dp) { dp.olcum('Disk %100 · RAM %45'); }],
          ['t2', 'SMART değerlerini oku', 2, 0, 'Yeniden atanmış sektör 312 ve artıyor, bekleyen sektör 24: DİKKAT.', [], ['h1'], function (dp) { dp.olcum('SMART: DİKKAT'); }],
          ['t3', 'Boş alanı kontrol et', 1, 0, 'Diskte %40 boş alan var.', ['h2'], []],
          ['t4', 'Güvenlik taraması yap', 25, 0, 'Tehdit bulunmadı.', ['h3'], []]
        ],
        onar: [
          { ad: 'Verileri yedekle (3-2-1)', sure: 30, maliyet: 1, on: true, sonuc: 'Yedek tamam: harici disk + okul sunucusu. Sorun sürüyor ama veri güvende.' },
          { ad: 'Diski değiştir, yedekten geri yükle', sure: 60, maliyet: 2, parca: true, cozer: true, gerek: 0, sonuc: 'Yeni disk takıldı, yedek geri yüklendi; açılış ve dosyalar hızlı.' },
          { ad: 'Disk birleştirme (defrag) çalıştır', sure: 45, maliyet: 0, sonuc: 'Arızalanan diski saatlerce zorladı; yavaşlık sürdü, bekleyen sektör sayısı arttı.' }
        ] }
    ];
    kok.innerHTML = '<div class="ts">' +
      '<div class="ts-bas"><b class="ts-vaka"></b><span class="ts-sayac"></span></div>' +
      '<div class="ts-ust"><div class="ts-durum"></div><div class="ts-belirti"><span class="ts-etk">Belirti</span><p></p></div></div>' +
      '<div class="ts-hip"><span class="ts-etk">Olası nedenler</span><div class="ts-cipler"></div></div>' +
      '<div class="ts-orta"><div class="ts-kol"><span class="ts-etk">Testler</span><div class="ts-testler"></div></div>' +
      '<div class="ts-kol"><span class="ts-etk">Onarım</span><div class="ts-onarlar"></div></div></div>' +
      '<div class="ts-log" aria-live="polite"></div>' +
      '<div class="ts-rapor" hidden></div></div>';
    var dp = durumPanel(kok.querySelector('.ts-durum'));
    var vakaB = kok.querySelector('.ts-vaka'), sayac = kok.querySelector('.ts-sayac'), belirti = kok.querySelector('.ts-belirti p'),
      cipK = kok.querySelector('.ts-cipler'), testK = kok.querySelector('.ts-testler'), onarK = kok.querySelector('.ts-onarlar'),
      log = kok.querySelector('.ts-log'), rapor = kok.querySelector('.ts-rapor');
    var vi = 0, st, sonuclar = [];
    function maliyetMetni(m) { return m ? new Array(m + 1).join('₺') : 'ücretsiz'; }
    function puan() { return Math.max(0, 100 - st.testSure - 5 * st.testMal - 25 * st.gereksiz - 10 * st.etkisiz); }
    function sayacYaz() {
      sayac.innerHTML = '<span>⏱ ' + st.sure + ' dk</span><span>' + (st.mal ? maliyetMetni(st.mal) : '₺ 0') + '</span><b>Puan ' + puan() + '</b>';
    }
    function logYaz(metin, tur) {
      var p = el('p', 'ts-l' + (tur ? ' ' + tur : ''), null, metin);
      log.insertBefore(p, log.firstChild);
      while (log.children.length > 6) log.removeChild(log.lastChild);
    }
    var cipler = {};
    function cipCiz() {
      var v = VAKA[vi];
      cipK.innerHTML = ''; cipler = {};
      v.hip.forEach(function (h) {
        var b = el('button', 'ts-cip', cipK);
        b.type = 'button';
        el('span', 'ts-cip-i', b, '');
        el('span', '', b, h[1]);
        b.addEventListener('click', function () {
          if (st.testSayisi || st.bitti) return;
          st.ilk = h[0];
          Object.keys(cipler).forEach(function (k) { cipler[k].classList.toggle('yildiz', k === h[0]); basin(cipler[k], k === h[0]); });
          testK.querySelectorAll('button').forEach(function (x) { x.disabled = false; });
          logYaz('Hipotezin: “' + h[1] + '”. Şimdi en ucuz testten başla.', 'bilgi');
        });
        basin(b, false);
        cipler[h[0]] = b;
      });
    }
    function testCiz() {
      var v = VAKA[vi];
      testK.innerHTML = '';
      v.test.forEach(function (t) {
        var b = el('button', 'ts-d', testK);
        b.type = 'button'; b.disabled = true;
        el('b', '', b, t[1]); el('small', '', b, '⏱ ' + t[2] + ' dk · ' + maliyetMetni(t[3]));
        b.addEventListener('click', function () {
          if (st.bitti || st.yapilan[t[0]]) return;
          st.yapilan[t[0]] = true; st.testSayisi++;
          st.sure += t[2]; st.testSure += t[2]; st.mal += t[3]; st.testMal += t[3];
          b.classList.add('yapildi'); b.disabled = true;
          t[5].forEach(function (h) { cipler[h].classList.add('elendi'); cipler[h].classList.remove('destek'); cipler[h].title = 'Elendi: ' + t[1]; });
          t[6].forEach(function (h) { if (!cipler[h].classList.contains('elendi')) cipler[h].classList.add('destek'); });
          if (t[7]) t[7](dp);
          logYaz('Test: ' + t[1] + ' → ' + t[4], 'test');
          onarK.querySelectorAll('button').forEach(function (x) { x.disabled = false; });
          sayacYaz();
        });
      });
    }
    function onarCiz() {
      var v = VAKA[vi];
      onarK.innerHTML = '';
      v.onar.forEach(function (o, j) {
        var b = el('button', 'ts-d onar' + (o.parca ? ' parca' : ''), onarK);
        b.type = 'button'; b.disabled = true;
        el('b', '', b, o.ad); el('small', '', b, (o.parca ? 'parça değişimi · ' : '') + '⏱ ' + o.sure + ' dk · ' + maliyetMetni(o.maliyet));
        b.addEventListener('click', function () {
          if (st.bitti || st.onarildi[j]) return;
          if (o.gerek != null && !st.onarildi[o.gerek]) {
            st.etkisiz++; sayacYaz();
            logYaz('⚠ Dur! Önce yedek al: arızalanan diskten veri kopyalanmadan disk değişirse beş yıllık proje kaybolabilir.', 'uyari');
            ses('hata');
            return;
          }
          st.onarildi[j] = true; b.disabled = true; b.classList.add('yapildi');
          st.sure += o.sure; st.mal += o.maliyet;
          if (o.gereksiz) st.gereksiz++;
          if (!o.cozer && !o.on) st.etkisiz++;
          sayacYaz();
          if (o.on) { logYaz('Hazırlık: ' + o.sonuc, 'iyi'); return; }
          if (!o.cozer) { logYaz('Onarım: ' + o.ad + ' → ' + o.sonuc, 'kotu'); ses('hata'); return; }
          st.bitti = true;
          testK.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
          onarK.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
          logYaz('Onarım: ' + o.ad + ' → ' + o.sonuc, o.gereksiz ? 'uyari' : 'iyi');
          dp.boot(vi === 4 ? 'Açıldı · disk sağlıklı' : 'Sistem açıldı').then(function () {
            if (o.durum) o.durum(dp);
            var ilkDogru = st.ilk === v.neden;
            var nedenAd = v.hip.filter(function (h) { return h[0] === v.neden; })[0][1];
            sonuclar[vi] = { ad: v.ad, neden: nedenAd, test: st.testSayisi, sure: st.sure, mal: st.mal, gereksiz: st.gereksiz, puan: puan(), ilk: ilkDogru };
            cipler[v.neden].classList.add('dogru');
            logYaz('Vaka çözüldü · neden: ' + nedenAd + ' · ilk hipotezin ' + (ilkDogru ? 'doğruydu' : 'farklıydı') + ' · puan ' + puan() + '. Belgele ve sonraki vakaya geç.', 'son');
            gorevLi[vi].className = 'tamam';
            var n = sonuclar.filter(Boolean).length;
            ilerle(n, VAKA.length);
            ses('klik');
            var d = el('button', 'ts-sonraki', null, n === VAKA.length ? 'Raporu gör ▶' : 'Sonraki vaka ▶');
            d.type = 'button';
            log.insertBefore(d, log.firstChild);
            d.addEventListener('click', function () { if (n === VAKA.length) raporGoster(); else vakaAc(sonrakiBos()); });
            d.focus();
          });
        });
      });
    }
    function sonrakiBos() { for (var j = 1; j <= VAKA.length; j++) { var k = (vi + j) % VAKA.length; if (!sonuclar[k]) return k; } return vi; }
    function vakaAc(i) {
      vi = i;
      var v = VAKA[i];
      st = { ilk: null, yapilan: {}, onarildi: {}, testSayisi: 0, sure: 0, mal: 0, testSure: 0, testMal: 0, gereksiz: 0, etkisiz: 0, bitti: false };
      dp.no++;
      vakaB.textContent = 'Vaka ' + (i + 1) + ' / ' + VAKA.length + ' · ' + v.ad;
      belirti.textContent = v.belirti;
      v.bas(dp);
      cipCiz(); testCiz(); onarCiz(); sayacYaz();
      log.innerHTML = '';
      logYaz('Belirtiyi oku ve olası nedenlerden en olasısını işaretle (★).', 'bilgi');
      gorevLi.forEach(function (li, j) { if (!sonuclar[j]) li.className = j === i ? 'simdi' : ''; });
      rapor.hidden = true;
    }
    function raporGoster() {
      var top = 0, sure = 0, gereksiz = 0;
      var satir = sonuclar.map(function (r, j) {
        top += r.puan; sure += r.sure; gereksiz += r.gereksiz;
        return '<tr><td>' + (j + 1) + '</td><td>' + r.ad + '</td><td>' + r.neden + '</td><td>' + r.test + '</td><td>' + r.sure + ' dk</td><td>' +
          (r.gereksiz ? '<span class="ts-r-kotu">' + r.gereksiz + '</span>' : '0') + '</td><td><b>' + r.puan + '</b></td></tr>';
      }).join('');
      var ort = Math.round(top / sonuclar.length);
      rapor.innerHTML = '<div class="ts-r-bas"><b>Teşhis raporu</b><span>' + tarihMetni() + '</span></div>' +
        '<div class="ts-r-tablo"><table><thead><tr><th>#</th><th>Vaka</th><th>Bulunan neden</th><th>Test</th><th>Süre</th><th>Gereksiz parça</th><th>Puan</th></tr></thead><tbody>' + satir + '</tbody></table></div>' +
        '<div class="ts-r-ozet"><span>Ortalama puan <b>' + ort + '</b></span><span>Toplam süre <b>' + sure + ' dk</b></span><span>Gereksiz parça <b>' + gereksiz + '</b></span></div>' +
        '<p class="ts-r-not">' + (gereksiz ? 'Gereksiz parça değişimi hem para hem zaman kaybıdır: önce ucuz testlerle kanıt topla.' : 'Hiç gereksiz parça değiştirmedin: yöntemli çalıştın.') +
        ' Raporundaki bir vakayı belirti → hipotez → test → sonuç sırasıyla defterine yaz.</p>';
      var d = el('button', 'ts-sonraki', rapor, 'Yeniden başla');
      d.type = 'button';
      d.addEventListener('click', function () { sonuclar = []; ilerle(0, VAKA.length); gorevLi.forEach(function (li) { li.className = ''; }); vakaAc(0); });
      rapor.hidden = false;
      DERS.konfeti();
    }
    ilerle(0, VAKA.length);
    vakaAc(0);
  })();

  /* ═══════════ Etkinlik 2: bakım ve yedek kartı (gerçek sistem) ═══════════ */
  (function () {
    var kok = document.getElementById('bakim-kart');
    if (!kok) return;
    var ilerle = DERS.ilerlemeBagla('ilerleme-2');
    var liste = kok.querySelector('.bk-satirlar'), sonuc = kok.querySelector('.bk-sonuc');
    kok.querySelector('.bk-tarih').innerHTML = '<small>Kayıt tarihi</small><b>' + tarihMetni() + '</b>';
    var SATIR = [
      { ad: 'Güvenlik', alt: 'Kapat · fiş · düğme', sec: [['Fiş çekili, düğmeye basıldı', 'ok']] },
      { ad: 'Toz filtresi, ızgaralar', alt: 'Ön ve alt giriş', sec: [['Temiz'], ['Az tozlu'], ['Çok tozlu', 'not']] },
      { ad: 'Fanlar', alt: 'Fiş çekili, elle yavaşça çevir', sec: [['Serbest dönüyor'], ['Takılıyor / ses', 'not']] },
      { ad: 'Kablolar ve hava yolu', alt: 'Kasa içi', sec: [['Düzenli'], ['Hava yolunu kapatıyor', 'not']] },
      { ad: 'İşlemci sıcaklığı', alt: 'Boşta · UEFI ya da izleme', yazi: 'ör. 42 °C' },
      { ad: 'Disk sağlığı', alt: 'SMART durumu', sec: [['İyi'], ['Dikkat', 'not'], ['Kötü', 'not']] },
      { ad: '3-2-1 yedek', alt: 'Kendi dosyaların', ikili: [[['3 kopya var'], ['Eksik', 'not']], [['1’i başka yerde'], ['Yok', 'not']]] }
    ];
    var dolu = SATIR.map(function () { return false; }), notlar = SATIR.map(function () { return false; }), bitti = false;
    function guncelle() {
      var n = dolu.filter(Boolean).length;
      ilerle(n, SATIR.length);
      if (n === SATIR.length) {
        var nt = SATIR.filter(function (s, i) { return notlar[i]; }).map(function (s) { return s.ad; });
        sonuc.className = 'bk-sonuc ' + (nt.length ? 'not' : 'tamam');
        sonuc.textContent = nt.length ? '✓ Kart tamam. Öğretmenine bildir ve kayda geçir: ' + nt.join(', ') + '.' : '✓ Kart tamam: sistem bakımlı, yedek planın hazır. Kartı öğretmenine göster.';
        if (!bitti) { bitti = true; DERS.konfeti(); ses('klik'); }
      }
    }
    SATIR.forEach(function (s, i) {
      var r = el('div', 'bk-satir', liste);
      var b = el('div', 'bk-bas', r); el('b', '', b, (i + 1) + '. ' + s.ad); el('small', '', b, s.alt);
      var g = el('div', 'bk-giris', r);
      function isaretle(not) {
        dolu[i] = true; notlar[i] = !!not; r.classList.add('dolu'); r.classList.toggle('notlu', !!not);
        if (not) { sonuc.className = 'bk-sonuc not'; sonuc.textContent = 'Not al: ' + s.ad + ' bakım gerektiriyor. Tek başına müdahale etme; öğretmenine bildir.'; }
        guncelle();
      }
      function grup(secenekler, cb) {
        var k = el('div', 'secici bk-grup', g);
        secenekler.forEach(function (x) {
          var d = DERS.dugme(k, x[0], function () {
            k.querySelectorAll('button').forEach(function (y) { basin(y, y === d); });
            cb(x[1] === 'not');
          });
          basin(d, false);
        });
      }
      if (s.sec) grup(s.sec, isaretle);
      else if (s.yazi) {
        var inp = el('input', 'bk-yazi', g); inp.type = 'text'; inp.placeholder = s.yazi; inp.setAttribute('aria-label', s.ad);
        inp.addEventListener('input', function () {
          var v = parseInt(inp.value, 10);
          if (inp.value.trim().length >= 2) {
            var not = !isNaN(v) && v >= 70;
            if (not) { sonuc.className = 'bk-sonuc not'; sonuc.textContent = 'Boşta ' + v + ' °C yüksek: soğutucu ve fanlar kontrol edilmeli.'; }
            dolu[i] = true; notlar[i] = not; r.classList.add('dolu'); r.classList.toggle('notlu', not); guncelle();
          } else { dolu[i] = false; r.classList.remove('dolu'); guncelle(); }
        });
      } else if (s.ikili) {
        var iki = [null, null];
        s.ikili.forEach(function (gr, j) { grup(gr, function (not) { iki[j] = not; if (iki[0] !== null && iki[1] !== null) isaretle(iki[0] || iki[1]); }); });
      }
    });
    sonuc.textContent = 'Satırları gerçek bilgisayarda gördüğüne göre doldur.';
    guncelle();
  })();
})();
