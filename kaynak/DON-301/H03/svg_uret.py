# DON-301 H03 SVG üretici: python3 svg_uret.py  (bu klasörde çalıştırılır)
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#e0f2fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


def modul(x, y, gen, yuk, centik, renk='#1f5a3a', cip=8, pmic=False, yazi=None, yazi_renk='#fff'):
    """Önden bakış bellek modülü: (x, y) sol üst, centik = merkezden kayma oranı (gen'e göre)."""
    cx = x + gen / 2 + centik * gen
    s = '<g>'
    s += '<path d="M%s %s H%s V%s H%s V%s Z" fill="%s"/>' % (x, y, x + gen, y + yuk, x, y + yuk, renk)
    # yan mandal girintileri
    s += '<circle cx="%s" cy="%s" r="%s" fill="#f8fafc"/><circle cx="%s" cy="%s" r="%s" fill="#f8fafc"/>' % (x, y + yuk * 0.38, yuk * 0.07, x + gen, y + yuk * 0.38, yuk * 0.07)
    # temaslar
    s += '<rect x="%s" y="%s" width="%s" height="%s" fill="#e3b04f"/>' % (x + 2, y + yuk * 0.86, gen - 4, yuk * 0.12)
    # çentik (arka plan rengiyle kesilir)
    s += '<rect x="%s" y="%s" width="%s" height="%s" rx="1.2" fill="#f8fafc"/>' % (cx - 2.2, y + yuk * 0.8, 4.4, yuk * 0.22)
    cg = gen * 0.085
    bosluk = (gen - 12 - cg * cip - (gen * 0.1 if pmic else 0)) / max(cip - 1, 1)
    xx = x + 6
    for i in range(cip):
        s += '<rect x="%.1f" y="%s" width="%.1f" height="%s" rx="1" fill="#16181d"/>' % (xx, y + yuk * 0.2, cg, yuk * 0.44)
        xx += cg + bosluk
        if pmic and i == cip // 2 - 1:
            s += '<rect x="%.1f" y="%s" width="%.1f" height="%.1f" rx="1" fill="#5a5f68"/>' % (xx - bosluk / 2 + gen * 0.03, y + yuk * 0.1, gen * 0.04, yuk * 0.2)
            xx += gen * 0.1
    if yazi:
        s += '<rect x="%s" y="%s" width="%s" height="%s" rx="3" fill="rgba(15,23,42,.72)"/>' % (x + 6, y + yuk * 0.66, len(yazi) * max(7, yuk * 0.17) * 0.56 + 8, max(7, yuk * 0.17) + 4)
        s += T(x + 10, y + yuk * 0.66 + max(7, yuk * 0.17), yazi, max(7, yuk * 0.17), yazi_renk, 'start', 900)
    return s + '</g>'


# ── Kapak yedeği (3D açılamazsa)
w('yedek-kapak.svg', '<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DDR4, DDR5 ve SO-DIMM bellek modülleri">' +
  bg('d3yk', '#1e1b4b', '#312e81') +
  modul(40, 34, 280, 50, 0.038, '#1f5a3a', yazi='DDR4 DIMM') + modul(40, 100, 280, 50, 0.029, '#1d4b54', pmic=True, yazi='DDR5 DIMM') +
  modul(110, 166, 140, 50, 0.05, '#1f5a3a', cip=4, yazi='SO-DIMM') + '</svg>')

# ── Isınma: DDR4 modülü DDR5 yuvasının üzerinde
def yuva(x, y, gen, kx, renk='#111827'):
    return ('<rect x="%s" y="%s" width="%s" height="16" rx="4" fill="%s"/><rect x="%s" y="%s" width="%s" height="5" rx="2" fill="#374151"/>'
            '<rect x="%s" y="%s" width="4" height="9" rx="1" fill="#fbbf24"/>' % (x, y, gen, renk, x + 4, y + 2, gen - 8, kx - 2, y - 3))

w('isinma.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DDR4 bellek modülü, DDR5 yuvasının üzerinde tutuluyor; modülün çentiği ile yuvadaki çıkıntı aynı hizada değil, soru işareti">' +
  bg('d3is') + modul(40, 42, 280, 56, 0.05, '#1f5a3a', yazi='DDR4 · 288 temas') +
  '<path d="M180 108v28" stroke="#64748b" stroke-width="2.5" stroke-dasharray="5 4"/><path d="M173 132l7 9 7-9" fill="#64748b"/>' +
  yuva(40, 168, 280, 180 + 0.015 * 280) + T(180, 204, 'DDR5 yuvası · 288 temas', 11, '#334155') +
  '<circle cx="318" cy="130" r="18" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(318, 138, '?', 20, '#b45309', weight=900) +
  T(180, 226, 'Aynı temas sayısı: takılır mı?', 11, '#b45309') + '</svg>')

# ── Quiz görseli: DDR4 modülü ve DDR5 yuvası; çentik ve çıkıntı hizası
w('svg-quiz-centik.svg', '<svg viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Üstte DDR4 modülü, altta DDR5 yuvası; modülün çentiğinden ve yuvanın çıkıntısından inen kesik çizgiler farklı yerlerden geçiyor">'
  '<rect width="240" height="130" rx="10" fill="#f8fafc"/>' + modul(20, 10, 200, 44, 0.06, '#1f5a3a', yazi='DDR4') +
  yuva(14, 96, 212, 120 + 0.015 * 200) + T(120, 124, 'DDR5 yuvası', 9, '#334155') +
  '<path d="M%s 50V102" stroke="#2563eb" stroke-width="1.6" stroke-dasharray="4 3"/><path d="M%s 50V102" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="1.5 3"/>' % (120 + 0.06 * 200, 120 + 0.015 * 200) +
  T(136, 76, 'çentik', 8, '#2563eb', 'start') + T(119, 88, 'çıkıntı', 8, '#dc2626', 'end') + '</svg>')

# ── 3D yedekleri
w('yedek-ddr.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DDR4 ve DDR5 modülleri alt alta; çentiklerden geçen iki çizgi farklı konumda">' + bg('d3yd') +
  modul(40, 30, 280, 64, 0.05, '#1f5a3a', yazi='DDR4 · 1,2 V') + modul(40, 130, 280, 64, 0.015, '#1d4b54', pmic=True, yazi='DDR5 · 1,1 V · PMIC') +
  '<path d="M%.1f 20V210" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="4 3"/><path d="M%.1f 20V210" stroke="#2563eb" stroke-width="1.6" stroke-dasharray="4 3"/>' % (180 + 0.05 * 280, 180 + 0.015 * 280) +
  T(180, 228, 'Çentikler aynı hizada değil', 11, '#b91c1c') + '</svg>')
w('yedek-sodimm.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Masaüstü DIMM modülü ve yaklaşık yarı boydaki iki SO-DIMM modülü (DDR4 ve DDR5)">' + bg('d3ys') +
  modul(30, 28, 300, 64, 0.038, '#1f5a3a', yazi='DIMM · ≈ 13,3 cm') + modul(30, 130, 150, 64, 0.05, '#1f5a3a', cip=4, yazi='SO-DIMM DDR4') +
  modul(190, 130, 150, 64, 0.018, '#1d4b54', cip=4, yazi='SO-DIMM DDR5') + T(180, 220, 'SO-DIMM ≈ 7 cm · DDR4 260, DDR5 262 temas', 11, '#334155') + '</svg>')


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#e0f2fe"/>%s</svg>' % (aria, ic))


oz('oz-1.svg', 'Bellek hiyerarşisi piramidi', ''.join('<rect x="%d" y="%d" width="%d" height="7" rx="2" fill="%s"/>' % (34 - i * 4, 7 + i * 9, 12 + i * 8, c)
   for i, c in enumerate(['#7c3aed', '#2563eb', '#0ea5e9', '#10b981', '#f59e0b'])))
oz('oz-2.svg', 'Uçucu DRAM hücresi', '<rect x="16" y="14" width="14" height="30" rx="3" fill="none" stroke="#334155" stroke-width="2"/><rect x="18" y="30" width="10" height="12" fill="#0ea5e9"/>'
   '<rect x="50" y="14" width="14" height="30" rx="3" fill="none" stroke="#334155" stroke-width="2"/><path d="M36 29h8" stroke="#b91c1c" stroke-width="2.5"/><path d="M41 25l4 4-4 4" fill="none" stroke="#b91c1c" stroke-width="2"/>' +
   T(57, 54, '0', 8, '#b91c1c', fam=M) + T(23, 54, '1', 8, '#0369a1', fam=M))
oz('oz-3.svg', 'DDR4 ve DDR5 çentik farkı', modul(8, 6, 64, 20, 0.07, '#1f5a3a', cip=4) + modul(8, 32, 64, 20, 0.01, '#1d4b54', cip=4) +
   '<path d="M44.5 4V56M40.6 4V56" stroke="#dc2626" stroke-width="1" stroke-dasharray="2 2"/>')
oz('oz-4.svg', 'MT/s ve CL', T(40, 26, 'CL×2000', 10, '#0369a1', fam=M) + '<path d="M14 32H66" stroke="#334155" stroke-width="1.5"/>' + T(40, 46, 'MT/s', 10, '#7c3aed', fam=M))
oz('oz-5.svg', 'Çift kanal', '<rect x="8" y="16" width="16" height="28" rx="3" fill="#6366f1"/>'
   '<path d="M24 24H70M24 36H70" stroke="#94a3b8" stroke-width="4"/><circle cx="40" cy="24" r="3" fill="#f59e0b"/><circle cx="56" cy="36" r="3" fill="#f59e0b"/>' + T(46, 54, 'A + B', 8, '#334155'))
oz('oz-6.svg', 'DIMM ve SO-DIMM', modul(6, 10, 68, 20, 0.04, '#1f5a3a', cip=6) + modul(6, 34, 34, 20, 0.05, '#1f5a3a', cip=2))
