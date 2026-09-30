# DON-301 H01 SVG üretici: python3 svg_uret.py
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'
def w(ad, s): open(ad, 'w').write(s.strip() + '\n')
def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)
def bg(i, a='#f8fafc', b='#e0f2fe', W=360, H=240):
    return '<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i)

# ── Von Neumann şeması (Adım 2 ve 4'te ortak; JS sınıflarla vurgular/anime eder)
def vn(aria):
    s = '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s" class="vn">' % aria
    s += '<rect width="360" height="240" rx="16" fill="#f8fafc"/>'
    # CPU
    s += ('<g class="vn-blok" data-blok="cpu"><rect x="16" y="14" width="160" height="116" rx="10" fill="#e0f2fe" stroke="#0369a1" stroke-width="2"/>' + T(96, 30, 'CPU · Merkezi İşlem Birimi', 10, '#075985') + '</g>')
    s += ('<g class="vn-blok" data-blok="kontrol"><rect x="26" y="38" width="140" height="26" rx="6" fill="#fff" stroke="#0ea5e9" stroke-width="1.5"/>' + T(96, 55, 'Kontrol Birimi', 10, '#0369a1') + '</g>')
    s += ('<g class="vn-blok" data-blok="alu"><rect x="26" y="70" width="64" height="50" rx="6" fill="#fff" stroke="#0ea5e9" stroke-width="1.5"/>' + T(58, 92, 'ALU', 12, '#0369a1') + T(58, 107, '+ − < =', 9, '#64748b') + '</g>')
    s += ('<g class="vn-blok" data-blok="yazmac"><rect x="96" y="70" width="70" height="50" rx="6" fill="#fff" stroke="#0ea5e9" stroke-width="1.5"/>' + T(131, 84, 'Yazmaçlar', 9, '#0369a1') +
          '<g %s font-size="8" fill="#334155"><text x="102" y="97">PC  <tspan class="vn-pc">00</tspan></text><text x="102" y="107">IR  <tspan class="vn-ir">—</tspan></text><text x="102" y="117">ACC <tspan class="vn-acc">0</tspan></text></g></g>' % M)
    # Bellek
    s += ('<g class="vn-blok" data-blok="bellek"><rect x="200" y="14" width="144" height="116" rx="10" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>' + T(272, 30, 'Ana Bellek (RAM)', 10, '#92400e'))
    for i in range(4):
        y = 40 + i * 21
        s += '<rect class="vn-hucre h%d" x="212" y="%d" width="120" height="17" rx="3" fill="#fff" stroke="#f59e0b"/>' % (i, y)
        s += '<text x="218" y="%d" %s font-size="8" fill="#92400e">%s</text>' % (y + 12, M, ['0C', '0D', '0E', '0F'][i])
    s += '<text class="vn-deger" x="270" y="52" %s font-size="8.5" fill="#0f172a">7</text></g>' % M
    # G/Ç
    s += ('<g class="vn-blok" data-blok="gc"><rect x="120" y="190" width="120" height="38" rx="9" fill="#ecfdf5" stroke="#047857" stroke-width="2"/>' + T(180, 207, 'G/Ç Birimleri', 10, '#065f46') + T(180, 220, 'klavye · ekran · disk', 8, '#047857', weight=600) + '</g>')
    # Yollar: adres (kesik uzun), veri (kalın düz), kontrol (noktalı)
    yol = [('adres', 146, '#2563eb', '8 5', 2.4), ('veri', 158, '#ea580c', '', 4), ('kontrol', 170, '#16a34a', '2 4', 2.4)]
    for ad, y, renk, dash, sw in yol:
        d = 'M96 130 V%d H272 V130 M180 %d V190' % (y, y)
        s += '<g class="vn-yol" data-yol="%s"><path d="%s" fill="none" stroke="%s" stroke-width="%s" %s stroke-linecap="round"/>' % (ad, d, renk, sw, ('stroke-dasharray="%s"' % dash) if dash else '')
        s += '<path class="vn-akis" d="M96 130 V%d H272 V130" fill="none" stroke="%s" stroke-width="%s" stroke-dasharray="3 14" stroke-linecap="round" opacity="0"/></g>' % (y, renk, sw + 2)
    s += ('<g %s font-size="8" font-weight="800"><text x="300" y="%d" fill="#2563eb">Adres</text><text x="300" y="%d" fill="#ea580c">Veri</text><text x="300" y="%d" fill="#16a34a">Kontrol</text></g>' % (F, 149, 161, 173))
    s += '<g class="vn-rozet"><rect x="198" y="136" width="94" height="14" rx="7" fill="#0f172a"/><text class="vn-rozet-metin" x="245" y="146" %s font-size="8" font-weight="800" fill="#fff" text-anchor="middle"></text></g>' % F
    return s + '</svg>'
w('vn.svg', vn('Von Neumann modeli: CPU (kontrol birimi, ALU, yazmaçlar), ana bellek ve G/Ç birimleri adres, veri ve kontrol yollarıyla bağlı'))

# ── Kapak
w('kapak.svg', '<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Von Neumann mimarisi şeması: işlemci, bellek ve giriş-çıkış birimleri yollarla bağlı" class="kapak-vn">' +
  '<defs><linearGradient id="d3kBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c4a6e"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient></defs><rect x="-600" y="-600" width="1560" height="1440" fill="url(#d3kBg)"/>'
  '<g stroke="#38bdf8" stroke-opacity=".12">' + ''.join('<path d="M%d -600V840"/>' % x for x in range(-600, 960, 20)) + ''.join('<path d="M-600 %dH960"/>' % y for y in range(-600, 840, 20)) + '</g>'
  '<rect x="30" y="40" width="120" height="90" rx="12" fill="#0ea5e9" fill-opacity=".18" stroke="#7dd3fc" stroke-width="2"/>' + T(90, 80, 'CPU', 22, '#e0f2fe', weight=900) + T(90, 102, 'KB · ALU · Yazmaç', 10, '#bae6fd', weight=700) +
  '<rect x="210" y="40" width="120" height="90" rx="12" fill="#f59e0b" fill-opacity=".18" stroke="#fcd34d" stroke-width="2"/>' + T(270, 80, 'BELLEK', 20, '#fef3c7', weight=900) + T(270, 102, 'komut + veri', 10, '#fde68a', weight=700) +
  '<rect x="125" y="176" width="110" height="44" rx="10" fill="#10b981" fill-opacity=".18" stroke="#6ee7b7" stroke-width="2"/>' + T(180, 203, 'G/Ç', 16, '#d1fae5', weight=900) +
  '<g fill="none" stroke-width="3" stroke-linecap="round"><path class="kv-y1" d="M90 130V150H270V130M180 150V176" stroke="#60a5fa" stroke-dasharray="10 6"/><path class="kv-y2" d="M90 130V158H270V130" stroke="#fb923c"/><path class="kv-y3" d="M90 130V166H270V130M180 166V176" stroke="#4ade80" stroke-dasharray="2 5"/></g>'
  '<g %s font-size="11" fill="#e0f2fe" font-weight="700"><text x="30" y="26">10¹² B ÷ 2³⁰ = 931,3 GiB</text></g></svg>' % M)

# ── Isınma: kutu 1 TB, ekran 931 GB
w('isinma.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kutusunda 1 TB yazan disk ve ekranda 931 GB görünen kapasite; aradaki fark soru işaretiyle gösteriliyor">' + bg('d3is') +
  '<rect x="26" y="52" width="120" height="140" rx="10" fill="#1e293b"/><rect x="36" y="62" width="100" height="120" rx="6" fill="#334155"/><circle cx="86" cy="112" r="34" fill="#475569" stroke="#94a3b8" stroke-width="2"/><circle cx="86" cy="112" r="6" fill="#cbd5e1"/>'
  '<rect x="44" y="160" width="84" height="18" rx="4" fill="#fff"/>' + T(86, 173, '1 TB', 13, '#0f172a', weight=900) +
  '<rect x="190" y="52" width="150" height="104" rx="8" fill="#0f172a"/><rect x="198" y="60" width="134" height="88" rx="4" fill="#f8fafc"/>' +
  T(206, 80, 'Yerel Disk', 10, '#334155', 'start') + '<rect x="206" y="92" width="118" height="14" rx="7" fill="#e2e8f0"/><rect x="206" y="92" width="30" height="14" rx="7" fill="#0ea5e9"/>' +
  T(206, 124, '931 GB', 18, '#0f172a', 'start', 900) + T(206, 139, 'toplam', 9, '#64748b', 'start', 600) + '<rect x="250" y="156" width="30" height="12" fill="#1e293b"/><rect x="232" y="168" width="66" height="6" rx="3" fill="#1e293b"/>' +
  '<path d="M150 112H186" stroke="#94a3b8" stroke-width="3" stroke-dasharray="6 4"/><circle cx="168" cy="200" r="20" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(168, 208, '?', 22, '#b45309', weight=900) + T(168, 234, '69 GB nereye gitti?', 11, '#b45309') + '</svg>')

# ── Quiz görseli: yol
w('svg-quiz-yol.svg', '<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CPU ile bellek arasında, CPU’dan belleğe tek yönlü okla gösterilen ve soru işaretiyle etiketlenen yol">'
  '<rect width="220" height="110" rx="10" fill="#f8fafc"/><rect x="10" y="20" width="60" height="60" rx="8" fill="#e0f2fe" stroke="#0369a1" stroke-width="2"/>' + T(40, 55, 'CPU', 12, '#075985') +
  '<rect x="150" y="20" width="60" height="60" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>' + T(180, 55, 'Bellek', 11, '#92400e') +
  '<path d="M72 50H140" stroke="#334155" stroke-width="3"/><path d="M140 44l8 6-8 6z" fill="#334155"/><circle cx="108" cy="36" r="10" fill="#fff" stroke="#f59e0b" stroke-width="2"/>' + T(108, 40, '?', 12, '#b45309', weight=900) +
  T(110, 72, '0x0C', 10, '#334155', fam=M) + '</svg>')

# ── Özet simgeleri 80×60
def oz(ad, aria, ic): w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#e0f2fe"/>%s</svg>' % (aria, ic))
oz('oz-1.svg', 'Sistem katmanları', ''.join('<rect x="%d" y="%d" width="%d" height="9" rx="3" fill="%s"/>' % (12 + i * 3, 10 + i * 11, 56 - i * 6, c) for i, c in enumerate(['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'])))
oz('oz-2.svg', 'Von Neumann', '<rect x="8" y="10" width="26" height="20" rx="4" fill="#0ea5e9"/><rect x="46" y="10" width="26" height="20" rx="4" fill="#f59e0b"/><rect x="27" y="40" width="26" height="12" rx="4" fill="#10b981"/><path d="M21 30v5h38v-5M40 35v5" stroke="#334155" stroke-width="2" fill="none"/>')
oz('oz-3.svg', 'Depolanmış program', ''.join('<rect x="22" y="%d" width="36" height="9" rx="2" fill="%s"/>' % (8 + i * 11, '#6366f1' if i < 2 else '#f59e0b') for i in range(4)) + T(12, 22, 'K', 8, '#4338ca') + T(12, 44, 'V', 8, '#b45309'))
oz('oz-4.svg', 'Yollar', '<path d="M10 18H70" stroke="#2563eb" stroke-width="3" stroke-dasharray="7 4"/><path d="M10 30H70" stroke="#ea580c" stroke-width="4"/><path d="M10 42H70" stroke="#16a34a" stroke-width="3" stroke-dasharray="2 4" stroke-linecap="round"/>')
oz('oz-5.svg', 'Önekler', T(24, 26, '10³', 13, '#0369a1', fam=M) + T(56, 26, '2¹⁰', 13, '#7c3aed', fam=M) + T(24, 46, 'KB', 10, '#334155') + T(56, 46, 'KiB', 10, '#334155'))
oz('oz-6.svg', '931 GiB', '<rect x="12" y="16" width="56" height="12" rx="6" fill="#cbd5e1"/><rect x="12" y="16" width="52" height="12" rx="6" fill="#0ea5e9"/>' + T(40, 46, '931,3 GiB', 11, '#0f172a', fam=M))
