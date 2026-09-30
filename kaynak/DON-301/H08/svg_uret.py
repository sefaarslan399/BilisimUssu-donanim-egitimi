# DON-301 H08 SVG üretici: python3 svg_uret.py
# Marka-nötr çizimler: logo, marka adı ya da gerçek ürün kopyası yoktur. Fiyat yerine göreli "puan".
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#e0e7ff', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


def isik(x, y, d, r=6):
    """Uyumluluk ışığı: renk + simge (renk tek başına bilgi taşımaz)."""
    renk = {'ok': '#10b981', 'uy': '#f59e0b', 'no': '#ef4444'}[d]
    s = '<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (x, y, r, renk)
    if d == 'ok':
        s += '<path d="M%s %s l%s %s l%s %s" fill="none" stroke="#fff" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"/>' % (
            x - r * .45, y, r * .3, r * .35, r * .55, -r * .7, r * .3)
    elif d == 'uy':
        s += '<path d="M%s %s v%s M%s %s v.5" stroke="#fff" stroke-width="%s" stroke-linecap="round"/>' % (x, y - r * .5, r * .55, x, y + r * .5, r * .3)
    else:
        s += '<path d="M%s %s l%s %s M%s %s l%s %s" stroke="#fff" stroke-width="%s" stroke-linecap="round"/>' % (
            x - r * .4, y - r * .4, r * .8, r * .8, x + r * .4, y - r * .4, -r * .8, r * .8, r * .3)
    return s


def cpu(x, y, s=40, yazi='CPU', renk='#cbd5e1'):
    g = '<rect x="%s" y="%s" width="%s" height="%s" rx="4" fill="#475569"/>' % (x, y, s, s)
    g += '<rect x="%s" y="%s" width="%s" height="%s" rx="3" fill="%s"/>' % (x + s * .18, y + s * .18, s * .64, s * .64, renk)
    g += '<path d="M%s %s l%s 0 l%s %s z" fill="#fbbf24"/>' % (x + 3, y + s - 3, s * .16, -s * .16, s * .16)
    return g + T(x + s / 2, y + s / 2 + 3.5, yazi, s * .2, '#334155')


def ram(x, y, gen=70, yuk=16, centik=0.029, renk='#1d4b54'):
    cx = x + gen / 2 + centik * gen
    s = '<rect x="%s" y="%s" width="%s" height="%s" rx="1.5" fill="%s"/>' % (x, y, gen, yuk, renk)
    for i in range(6):
        s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1" fill="#0f172a"/>' % (x + 4 + i * (gen - 8) / 6, y + yuk * .2, (gen - 8) / 6 - 2, yuk * .42)
    s += '<rect x="%s" y="%s" width="%s" height="%s" fill="#e3b04f"/>' % (x + 1, y + yuk * .8, gen - 2, yuk * .2)
    s += '<rect x="%.1f" y="%.1f" width="3" height="%.1f" fill="#f8fafc"/>' % (cx - 1.5, y + yuk * .72, yuk * .3)
    return s


# ── Kapak: parçalar ortadaki uyumluluk panosuna bağlanır (tam alan, taşan arka plan)
k = ('<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" role="img" '
     'aria-label="İşlemci, anakart, bellek, ekran kartı, güç kaynağı ve kasa; ortadaki uyumluluk panosunda her kural için yeşil onay ya da sarı uyarı ışığı" class="kapak-uy">'
     '<defs><linearGradient id="u8kBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#134e4a"/></linearGradient></defs>'
     '<rect x="-600" y="-600" width="1560" height="1440" fill="url(#u8kBg)"/>'
     '<g stroke="#818cf8" stroke-opacity=".10">' + ''.join('<path d="M%d -600V840"/>' % x for x in range(-600, 960, 20)) +
     ''.join('<path d="M-600 %dH960"/>' % y for y in range(-600, 840, 20)) + '</g>')
# bağlantı çizgileri (parça → pano)
for x1, y1 in [(52, 44), (52, 120), (52, 196), (308, 44), (308, 120), (308, 196)]:
    x2 = 118 if x1 < 180 else 242
    k += '<path class="ku-hat" d="M%d %d C%d %d %d %d %d %d" fill="none" stroke="#a5b4fc" stroke-width="1.6" stroke-dasharray="4 5"/>' % (
        x1 + (26 if x1 < 180 else -26), y1, (x1 + x2) / 2, y1, (x1 + x2) / 2, 120, x2, 120)
# sol parçalar
k += '<g>' + cpu(30, 22, 44, 'CPU') + T(52, 80, 'Soket A', 8, '#c7d2fe', weight=700) + '</g>'
k += ('<rect x="20" y="98" width="64" height="46" rx="4" fill="#14532d" stroke="#22c55e" stroke-opacity=".5"/>'
      '<rect x="28" y="106" width="18" height="18" rx="2" fill="#1f2937" stroke="#94a3b8"/>' +
      ''.join('<rect x="%d" y="104" width="3" height="34" rx="1" fill="#0f172a" stroke="#64748b" stroke-width=".6"/>' % (54 + i * 6) for i in range(4)) +
      T(52, 156, 'Anakart · ATX', 8, '#c7d2fe', weight=700))
k += ram(16, 180, 72, 18) + T(52, 214, 'DDR5 · 2 modül', 8, '#c7d2fe', weight=700)
# sağ parçalar
k += ('<rect x="274" y="30" width="72" height="26" rx="4" fill="#334155"/><circle cx="296" cy="43" r="9" fill="#1e293b" stroke="#64748b"/>'
      '<circle cx="322" cy="43" r="9" fill="#1e293b" stroke="#64748b"/><rect x="276" y="56" width="30" height="4" fill="#e3b04f"/>' + T(310, 72, 'Ekran kartı · 305 mm', 8, '#c7d2fe', weight=700))
k += ('<rect x="282" y="98" width="52" height="40" rx="4" fill="#1f2937" stroke="#64748b"/><circle cx="308" cy="118" r="13" fill="#0f172a" stroke="#475569"/>'
      '<path d="M308 108v20M298 118h20" stroke="#475569" stroke-width="2"/>' + T(308, 152, 'Güç kaynağı · 650 W', 8, '#c7d2fe', weight=700))
k += ('<rect x="286" y="170" width="44" height="50" rx="4" fill="none" stroke="#a5b4fc" stroke-width="1.6"/><rect x="292" y="176" width="32" height="6" rx="1" fill="#475569"/>'
      '<circle cx="308" cy="204" r="7" fill="none" stroke="#64748b"/>' + T(308, 234, 'Kasa', 8, '#c7d2fe', weight=700))
# pano
k += '<rect x="118" y="40" width="124" height="160" rx="12" fill="#0b1220" stroke="#6366f1" stroke-width="2"/>'
k += '<rect x="118" y="40" width="124" height="22" rx="12" fill="#312e81"/><rect x="118" y="54" width="124" height="8" fill="#312e81"/>'
k += T(180, 55, 'UYUMLULUK DENETİMİ', 8.5, '#e0e7ff', weight=900)
kurallar = [('Soket', 'ok'), ('Bellek türü', 'ok'), ('Form faktörü', 'ok'), ('GPU uzunluğu', 'ok'), ('Güç payı', 'uy'), ('Soğutucu', 'ok')]
for i, (ad, d) in enumerate(kurallar):
    y = 78 + i * 20
    k += '<g class="ku-s ku-s%d">' % i + isik(134, y, d, 6) + T(146, y + 3, ad, 8.5, '#e2e8f0', 'start', 700) + '</g>'
k += T(180, 216, 'Parça seç · denetle · gerekçelendir', 9, '#c7d2fe', weight=700)
k += '</svg>'
w('kapak.svg', k)

# ── Isınma: tek tek güçlü parçalar ama birbirine uymuyor
s = ('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Masada güçlü parçalar: 12 çekirdekli Soket B işlemci, Soket A anakart, üst seviye ekran kartı ve 850 W güç kaynağı; işlemci ile anakart arasında soru işareti">' + bg('u8is'))
s += '<rect x="12" y="176" width="336" height="10" rx="4" fill="#cbd5e1"/>'
s += cpu(30, 118, 50, 'CPU') + T(55, 104, 'Soket B', 10, '#4338ca') + T(55, 196 + 10, '12 çekirdek', 9, '#334155', weight=700)
s += ('<rect x="112" y="92" width="100" height="80" rx="6" fill="#14532d" stroke="#166534" stroke-width="2"/>'
      '<rect x="124" y="104" width="30" height="30" rx="3" fill="#1f2937" stroke="#94a3b8"/>' + T(139, 123, 'A', 12, '#e2e8f0') +
      ''.join('<rect x="%d" y="100" width="5" height="58" rx="1.5" fill="#0f172a" stroke="#64748b" stroke-width=".8"/>' % (168 + i * 9) for i in range(4)) +
      T(162, 84, 'Anakart · Soket A', 10, '#4338ca') + T(162, 206, 'ATX · DDR5', 9, '#334155', weight=700))
s += ('<rect x="226" y="120" width="112" height="34" rx="5" fill="#334155"/><circle cx="256" cy="137" r="12" fill="#1e293b" stroke="#64748b"/>'
      '<circle cx="306" cy="137" r="12" fill="#1e293b" stroke="#64748b"/><rect x="228" y="154" width="44" height="5" fill="#e3b04f"/>' +
      T(282, 110, 'Üst seviye ekran kartı', 9.5, '#4338ca') + T(282, 206, '850 W güç kaynağı', 9, '#334155', weight=700))
s += '<path d="M82 142 H108" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4 3"/>'
s += '<circle cx="95" cy="70" r="20" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(95, 78, '?', 22, '#b45309', weight=900)
s += '<path d="M95 90 V128" stroke="#f59e0b" stroke-width="2"/>'
s += T(236, 40, 'Hepsi güçlü parçalar…', 12, '#334155', weight=800) + T(236, 58, 'ama bilgisayar toplanamıyor.', 11, '#b45309', weight=800)
s += T(180, 228, 'Sorun parçaların gücünde mi, uyumunda mı?', 10, '#475569', weight=700) + '</svg>'
w('isinma.svg', s)

# ── Quiz görseli: 305 mm ekran kartı, en çok 280 mm alan kasa
q = ('<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kasa yan kesiti: ekran kartı için en çok 280 milimetre yer var; takılmak istenen kart 305 milimetre ve ön fanlara 25 milimetre taşıyor">'
     '<rect width="240" height="120" rx="10" fill="#f8fafc"/>'
     '<rect x="14" y="14" width="212" height="92" rx="6" fill="#fff" stroke="#334155" stroke-width="2"/>'
     '<rect x="198" y="18" width="24" height="84" rx="3" fill="#e2e8f0"/>' + T(210, 64, 'fan', 8, '#475569') +
     '<path d="M20 44 H198" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4 3"/>' + T(109, 38, 'en çok 280 mm', 9, '#0369a1') +
     '<rect x="20" y="56" width="203" height="20" rx="3" fill="#475569" opacity=".92"/><rect x="198" y="56" width="25" height="20" fill="#ef4444" opacity=".85"/>' +
     T(108, 70, 'ekran kartı · 305 mm', 9, '#fff') + T(210, 92, '+25 mm', 9, '#b91c1c') + '</svg>')
w('svg-quiz-boy.svg', q)


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#e0e7ff"/>%s</svg>' % (aria, ic))


oz('oz-1.svg', 'İhtiyaç profili: dört önceliğin çubukları',
   ''.join('<rect x="%d" y="%d" width="10" height="%d" rx="2" fill="%s"/>' % (14 + i * 15, 48 - h, h, c) for i, (h, c) in enumerate([(22, '#6366f1'), (34, '#f59e0b'), (18, '#10b981'), (26, '#0ea5e9')])) +
   '<path d="M10 49h60" stroke="#334155" stroke-width="1.5"/>')
oz('oz-2.svg', 'Soket ve çipset uyumu',
   cpu(12, 14, 30, 'A') + '<path d="M46 29h8" stroke="#334155" stroke-width="2"/>' +
   '<rect x="56" y="14" width="16" height="30" rx="2" fill="#14532d"/>' + T(64, 33, 'A', 9, '#fff') + isik(64, 52, 'ok', 5))
oz('oz-3.svg', 'RAM nesli: DDR4 ve DDR5 çentiği farklı',
   ram(8, 12, 64, 14, 0.038, '#1f5a3a') + ram(8, 34, 64, 14, 0.029) + T(40, 58, 'DDR4 ≠ DDR5', 7, '#4338ca'))
oz('oz-4.svg', 'Boyut uyumu: kasa ve ekran kartı uzunluğu',
   '<rect x="8" y="10" width="64" height="40" rx="4" fill="#fff" stroke="#334155" stroke-width="2"/>'
   '<rect x="12" y="30" width="50" height="8" rx="2" fill="#475569"/><path d="M12 22h56" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3 2"/>' + isik(66, 44, 'ok', 5))
oz('oz-5.svg', 'Güç hesabı ve pay',
   '<rect x="8" y="20" width="30" height="14" fill="#6366f1"/><rect x="38" y="20" width="16" height="14" fill="#f59e0b"/><rect x="54" y="20" width="8" height="14" fill="#94a3b8"/>'
   '<path d="M68 14v26" stroke="#10b981" stroke-width="2.5"/>' + T(40, 50, '× 1,3', 9, '#334155', fam=M))
oz('oz-6.svg', 'Darboğaz ve bütçe',
   '<path d="M10 16h24l6 10h0l6-10h24" fill="none" stroke="#334155" stroke-width="2"/><path d="M10 40h24l6-10 6 10h24" fill="none" stroke="#334155" stroke-width="2"/>'
   '<rect x="37" y="24" width="6" height="8" fill="#ef4444"/>' + T(40, 54, 'dar = yavaş', 7, '#b91c1c'))
