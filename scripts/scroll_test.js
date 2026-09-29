// Bilişim Üssü v9.3 kaydırma/taşma testi — 7 görünüm alanı, iki katman, tıklama sonrası.
// Kullanım: node scripts/scroll_test.js <dosya.html | klasör> [...]
// Çıkış kodu: taşma varsa 1.
//
// ÖNEMLİ: AYAR bölümündeki seçiciler ve gezinme yöntemi, templates/MASTER-v9_3.html'e göre
// İLK KALİBRASYONDA doğrulanmalı ve gerekirse güncellenmelidir.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const AYAR = {
  viewports: [[1106, 652], [1660, 964], [1020, 684], [1280, 650], [1380, 650], [1366, 720], [1200, 720]],
  slaytSecici: '.slide',
  aktifSlaytSecici: '.slide.active',
  layoutSecici: '[class*="layout-"]',
  // Tıklama sonrası test için slayt içindeki etkileşim öğeleri (gezinme düğmeleri hariç tutulur)
  tiklanabilirSecici: 'button, [role="button"], .opt, [data-action]',
  haricTutSecici: '.nav, .nav *, [data-nav], .prev, .next, .reveal-toggle',
  // Sayfadaki slayt geçiş fonksiyonu adları (ilk bulunan kullanılır). Hiçbiri yoksa ArrowRight.
  gecisFonksiyonlari: ['goToSlide', 'goTo', 'showSlide', 'go'],
  esik: 4,
  bekleMs: 250
};

function dosyalariTopla(args) {
  const out = [];
  for (const a of args) {
    if (fs.existsSync(a) && fs.statSync(a).isDirectory()) {
      for (const f of fs.readdirSync(a, { recursive: true })) {
        if (String(f).endsWith('.html')) out.push(path.join(a, String(f)));
      }
    } else out.push(a);
  }
  return out.sort();
}

async function olc(page) {
  return page.evaluate((A) => {
    const sorunlar = [];
    const doc = document.documentElement;
    if (doc.scrollHeight - window.innerHeight > A.esik) sorunlar.push('sayfa dikey kaydırma: ' + (doc.scrollHeight - window.innerHeight) + 'px');
    if (doc.scrollWidth - window.innerWidth > A.esik) sorunlar.push('sayfa yatay kaydırma: ' + (doc.scrollWidth - window.innerWidth) + 'px');
    const slayt = document.querySelector(A.aktifSlaytSecici);
    if (!slayt) { sorunlar.push('aktif slayt bulunamadı (' + A.aktifSlaytSecici + ')'); return sorunlar; }
    const ad = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    // (a) layout alt öğeleri
    slayt.querySelectorAll(A.layoutSecici).forEach((lay) => {
      const lr = lay.getBoundingClientRect();
      Array.from(lay.children).forEach((c) => {
        const cr = c.getBoundingClientRect();
        if (cr.height === 0) return;
        const fark = cr.bottom - lr.bottom;
        if (fark > A.esik) sorunlar.push('(a) ' + ad(c) + ' layout dışına ' + Math.round(fark) + 'px taşıyor');
      });
    });
    // (b) iç öğeler: kaydırılabilir olmayan ama içeriği sığmayan
    slayt.querySelectorAll('*').forEach((el) => {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return;
      const fark = el.scrollHeight - el.clientHeight;
      if (fark <= A.esik || el.clientHeight === 0) return;
      const kaydirilabilir = /(auto|scroll)/.test(st.overflowY);
      if (kaydirilabilir) return; // bilinçli dinamik kapsayıcı
      if (st.overflowY === 'hidden' || st.overflowY === 'clip' || el.matches('.code-body')) {
        sorunlar.push('(b) ' + ad(el) + ' içerik kesiliyor: ' + fark + 'px');
      }
    });
    return sorunlar;
  }, AYAR);
}

async function slaytaGit(page, i, fn) {
  // MASTER v9.3: goTo(n) 1 tabanlıdır (1 = kapak). Diğer adlar 0 tabanlı kabul edilir.
  if (fn) await page.evaluate(([f, n]) => window[f](f === 'goTo' ? n + 1 : n), [fn, i]);
  else await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(AYAR.bekleMs);
}

async function dosyaTest(browser, dosya) {
  const hatalar = [];
  for (const [w, h] of AYAR.viewports) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const jsHatalari = [];
    page.on('pageerror', (e) => jsHatalari.push(e.message));
    await page.goto('file://' + path.resolve(dosya));
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      window.fitSlideContent = function () {};
      document.querySelectorAll('[style*="transform"]').forEach((el) => {
        if (/scale\(/.test(el.style.transform)) el.style.transform = '';
      });
    });
    const sayi = await page.evaluate((s) => document.querySelectorAll(s).length, AYAR.slaytSecici);
    const fn = await page.evaluate((adlar) => adlar.find((a) => typeof window[a] === 'function') || null, AYAR.gecisFonksiyonlari);
    if (fn) await slaytaGit(page, 0, fn);
    for (let i = 0; i < sayi; i++) {
      if (i > 0) await slaytaGit(page, i, fn);
      for (const s of await olc(page)) hatalar.push(w + '×' + h + ' slayt ' + (i + 1) + ': ' + s);
      // tıklama sonrası
      const tiklandi = await page.evaluate((A) => {
        const slayt = document.querySelector(A.aktifSlaytSecici);
        if (!slayt) return 0;
        let n = 0;
        slayt.querySelectorAll(A.tiklanabilirSecici).forEach((b) => {
          if (b.matches(A.haricTutSecici) || b.disabled) return;
          try { b.click(); n++; } catch (e) {}
        });
        return n;
      }, AYAR);
      if (tiklandi) {
        await page.waitForTimeout(AYAR.bekleMs);
        for (const s of await olc(page)) hatalar.push(w + '×' + h + ' slayt ' + (i + 1) + ' [tıklama sonrası]: ' + s);
      }
    }
    const webgl = await page.evaluate(() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } });
    if (!webgl) hatalar.push(w + '×' + h + ' uyarı: test tarayıcısında WebGL yok; 3D sahneler yedek görselle test edildi');
    for (const e of jsHatalari) hatalar.push(w + '×' + h + ' JS hatası: ' + e);
    await page.close();
  }
  return [...new Set(hatalar)];
}

(async () => {
  const dosyalar = dosyalariTopla(process.argv.slice(2));
  if (!dosyalar.length) { console.log('Kullanım: node scripts/scroll_test.js <dosya|klasör>'); process.exit(2); }
  // WebGL'in başsız tarayıcıda çalışması için yazılımsal GL (SwiftShader)
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let toplam = 0;
  for (const d of dosyalar) {
    const h = await dosyaTest(browser, d);
    console.log((h.length ? '[KALDI] ' : '[GEÇTİ] ') + d + ' (' + h.length + ' sorun)');
    h.forEach((x) => console.log('   ' + x));
    toplam += h.length;
  }
  await browser.close();
  process.exit(toplam ? 1 : 0);
})();
