// DON3D model önizleme: her modeli ayrı sahnede çizer, ekran görüntüsü alır, üçgen sayısını raporlar.
// Kullanım: node scripts/model_onizle.js [M-KOD ...]   (boşsa tüm modeller)
// Çıktı: build/model/<KOD>.png
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const KOK = path.resolve(__dirname, '..');
const DON3D = path.join(KOK, 'bilesenler/DON3D');
const THREE_JS = path.join(KOK, 'node_modules/three/build/three.min.js');

const kodlar = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(path.join(DON3D, 'modeller')).filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, ''));

const oku = (p) => fs.readFileSync(p, 'utf8');
const modelJs = fs.readdirSync(path.join(DON3D, 'modeller')).filter((f) => f.endsWith('.js'))
  .map((f) => oku(path.join(DON3D, 'modeller', f))).join('\n');

const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
<style>html,body{margin:0;height:100%;background:#fff;font-family:system-ui}
#k{width:960px;height:640px}${oku(path.join(DON3D, 'don3d.css'))}</style></head>
<body><div id="k"></div>
<script>${oku(THREE_JS)}</script>
<script>${oku(path.join(DON3D, 'don3d.js'))}\n${oku(path.join(DON3D, 'don3d-anim.js'))}\n${oku(path.join(DON3D, 'don3d-etkilesim.js'))}\n${modelJs}</script>
<script>
window.goster = function (kod) {
  var k = document.getElementById('k');
  if (window._s) { window._s.yokEt(); k.innerHTML = ''; }
  var s = window._s = DON3D.sahne(k, { modeller: [kod], otomatikDonus: false, kamera: window.YON ? { yon: window.YON } : undefined });
  var ucgen = 0, cizim = 0;
  s.scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var n = o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
    ucgen += n * (o.isInstancedMesh ? o.count : 1); cizim++;
  });
  s.etkinlestir();
  return { ucgen: Math.round(ucgen), cizim: cizim };
};
</script></body></html>`;

(async () => {
  const cikti = path.join(KOK, 'build/model');
  fs.mkdirSync(cikti, { recursive: true });
  const gecici = path.join(cikti, '_onizle.html');
  fs.writeFileSync(gecici, html);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 960, height: 640 } });
  const hatalar = [];
  p.on('pageerror', (e) => hatalar.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') hatalar.push(m.text()); });
  await p.goto('file://' + gecici);
  if (process.env.YON) await p.evaluate((y) => { window.YON = y.split(',').map(Number); }, process.env.YON);
  for (const kod of kodlar) {
    const r = await p.evaluate((k) => window.goster(k), kod);
    await p.waitForTimeout(700);
    await p.screenshot({ path: path.join(cikti, kod + (process.env.YON ? '-yon' : '') + '.png') });
    console.log(kod.padEnd(22) + ' üçgen: ' + String(r.ucgen).padStart(6) + '  çizim: ' + r.cizim + (r.ucgen > 60000 ? '  ⚠ 60 bin bütçesi aşıldı' : ''));
  }
  hatalar.forEach((h) => console.log('HATA: ' + h));
  await b.close();
  process.exit(hatalar.length ? 1 : 0);
})();
