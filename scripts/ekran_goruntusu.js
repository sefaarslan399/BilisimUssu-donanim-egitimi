// Her slaytın ekran görüntüsünü alır — görsel öz denetim için.
// Kullanım: node scripts/ekran_goruntusu.js <ders.html> [cikti_klasoru] [genislik] [yukseklik]
// Çıktı: <cikti_klasoru>/<ders>-sNN.png  (varsayılan: build/ekran/)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const dosya = process.argv[2];
  if (!dosya) { console.log('Kullanım: node scripts/ekran_goruntusu.js <ders.html> [klasör] [w] [h]'); process.exit(2); }
  const klasor = process.argv[3] || 'build/ekran';
  const w = parseInt(process.argv[4] || '1280', 10), h = parseInt(process.argv[5] || '720', 10);
  fs.mkdirSync(klasor, { recursive: true });
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('file://' + path.resolve(dosya));
  await p.waitForTimeout(1200);
  const sayi = await p.evaluate(() => document.querySelectorAll('.slide').length);
  const fn = await p.evaluate(() => ['goToSlide', 'goTo', 'showSlide', 'go'].find((a) => typeof window[a] === 'function') || null);
  const ad = path.basename(dosya, '.html');
  for (let i = 0; i < sayi; i++) {
    // MASTER v9.3: goTo(n) 1 tabanlıdır (1 = kapak).
    if (i > 0) { if (fn) await p.evaluate(([f, n]) => window[f](f === 'goTo' ? n + 1 : n), [fn, i]); else await p.keyboard.press('ArrowRight'); }
    await p.waitForTimeout(900); // animasyonun ortasını yakala
    await p.screenshot({ path: path.join(klasor, ad + '-s' + String(i + 1).padStart(2, '0') + '.png') });
  }
  console.log(sayi + ' slayt kaydedildi: ' + klasor);
  await b.close();
})();
