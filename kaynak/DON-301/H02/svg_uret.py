# DON-301 H02 SVG üretici: python3 svg_uret.py  (bu klasörde çalıştırılır)
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#ede9fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


def islemci(x, y, s, kapak='#c7cbd1', kart='#155a34'):
    """Üstten işlemci simgesi: yeşil alt kart + metal kapak (s: kenar)."""
    k = s * 0.12
    g = '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s"/>' % (x, y, s, s, s * 0.05, kart)
    g += '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s" stroke="#9aa0a8" stroke-width="1.2"/>' % (x + k, y + k, s - 2 * k, s - 2 * k, s * 0.06, kapak)
    g += '<path d="M%s %sl%s 0l%s %sz" fill="#e3b04f"/>' % (x + 3, y + s - 3, s * 0.1, -s * 0.1, -s * 0.1)
    return g


# ── Isınma: A 4,2 GHz · B 3,6 GHz — aynı iş, hangisi önce biter?
def kart(x, ad, ghz, alt, renk):
    s = '<rect x="%d" y="34" width="132" height="150" rx="14" fill="#fff" stroke="%s" stroke-width="2"/>' % (x, renk)
    s += T(x + 66, 56, ad, 12, renk, weight=900)
    s += islemci(x + 36, 66, 60)
    s += T(x + 66, 150, ghz, 20, '#0f172a', weight=900)
    s += T(x + 66, 170, alt, 9.5, '#64748b', weight=700)
    return s


w('isinma.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="İşlemci A 4,2 gigahertz, işlemci B 3,6 gigahertz; aynı dönüştürme işini hangisinin önce bitireceği soru işaretiyle soruluyor">' +
  bg('h2is') + kart(20, 'İşlemci A', '4,2 GHz', 'eski tasarım', '#7c3aed') + kart(208, 'İşlemci B', '3,6 GHz', 'yeni tasarım', '#0891b2') +
  '<circle cx="180" cy="110" r="22" fill="#fff" stroke="#f59e0b" stroke-width="3"/><path d="M180 96v14l9 6" stroke="#b45309" stroke-width="3" fill="none" stroke-linecap="round"/>' +
  '<rect x="174" y="82" width="12" height="6" rx="2" fill="#b45309"/>' +
  T(180, 212, 'Aynı video dönüştürme işi', 11, '#334155') + T(180, 229, 'Hangisi önce bitirir?', 11, '#b45309', weight=900) + '</svg>')


# ── WebGL yedekleri
def cip_sema(x, y, W, H):
    s = '<rect x="%s" y="%s" width="%s" height="%s" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>' % (x, y, W, H)
    cw = (W - 30) / 4.0
    for i in range(4):
        cx = x + 6 + i * (cw + 6)
        s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="3" fill="#6d28d9"/>' % (cx, y + 6, cw, H * 0.38)
        s += T(cx + cw / 2, y + 6 + H * 0.24, 'Ç' + str(i + 1), 9, '#ede9fe', weight=900)
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="3" fill="#0891b2"/>' % (x + 6, y + 12 + H * 0.38, W - 12, H * 0.2)
    s += T(x + W / 2, y + 12 + H * 0.38 + H * 0.14, 'Paylaşılan L3 önbellek', 9, '#ecfeff', weight=900)
    yy = y + 18 + H * 0.58
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="3" fill="#b45309"/>' % (x + 6, yy, W * 0.3, H * 0.3)
    s += T(x + 6 + W * 0.15, yy + H * 0.18, 'Bellek den.', 8, '#fff7ed', weight=800)
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="3" fill="#15803d"/>' % (x + 12 + W * 0.3, yy, W * 0.3, H * 0.3)
    s += T(x + 12 + W * 0.45, yy + H * 0.18, 'Grafik', 8, '#f0fdf4', weight=800)
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="3" fill="#475569"/>' % (x + 18 + W * 0.6, yy, W * 0.4 - 24, H * 0.3)
    s += T(x + 18 + W * 0.6 + (W * 0.4 - 24) / 2, yy + H * 0.18, 'G/Ç', 8, '#f1f5f9', weight=800)
    return s


w('yedek-kapak.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="İşlemci: metal kapak yukarı kaldırılmış, altında çekirdekleri ve önbelleği olan çip görünüyor">' +
  bg('h2yk') + '<g transform="translate(95 30)">' + islemci(0, 0, 170, kapak='#dfe3e8') + '</g>' +
  '<rect x="120" y="62" width="120" height="84" rx="8" fill="#c7cbd1" opacity=".92" stroke="#9aa0a8"/>' + T(180, 108, 'Metal kapak', 11, '#475569') +
  '<g transform="translate(0 0)">' + cip_sema(128, 150, 104, 70) + '</g></svg>')

w('yedek-cip.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Çipin şematik yerleşimi: dört çekirdek, paylaşılan L3 önbellek, bellek denetleyicisi, grafik birimi ve giriş-çıkış birimi">' +
  bg('h2yc') + cip_sema(40, 26, 280, 170) + T(180, 222, 'Şematik yerleşim · her çekirdekte ALU, kontrol birimi, yazmaçlar, L1/L2', 9.5, '#475569', weight=700) + '</svg>')


# ── Quiz görseli: GETİR bitti, IR = ADD 0B, PC = 02 (yatay, q-gorsel yüksekliği sınırlı)
def hucre(y, adr, ic, vurgu=False):
    s = '<rect x="10" y="%d" width="132" height="21" rx="4" fill="%s" stroke="%s" stroke-width="%s"/>' % (y, '#e0e7ff' if vurgu else '#fff', '#6366f1' if vurgu else '#f59e0b', 2.2 if vurgu else 1.2)
    return s + T(17, y + 15, adr, 11, '#92400e', 'start', 800, M) + T(46, y + 15, ic, 12, '#0f172a', 'start', 900, M)


def yaz(x, y, wd, ad, deger, renk='#0369a1'):
    return ('<rect x="%d" y="%d" width="%d" height="30" rx="7" fill="#fff" stroke="#7dd3fc" stroke-width="1.8"/>' % (x, y, wd) +
            T(x + 8, y + 20, ad, 12, '#475569', 'start', 900) + T(x + wd - 8, y + 21, deger, 14, renk, 'end', 900, M))


w('svg-quiz-pc.svg', '<svg viewBox="0 0 336 96" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bellekte 00 LOAD 0A, 01 ADD 0B, 02 STORE 0C komutları; 01 hücresi yeni getirildi. Yazmaçlar: PC 02, IR ADD 0B. Evre: GETİR bitti.">'
  '<rect width="336" height="96" rx="10" fill="#f8fafc"/><rect x="4" y="4" width="144" height="88" rx="8" fill="#fffbeb" stroke="#b45309" stroke-width="1.5"/>' +
  hucre(9, '00', 'LOAD 0A') + hucre(37, '01', 'ADD 0B', True) + hucre(65, '02', 'STORE 0C') +
  '<path d="M144 47H164" stroke="#6366f1" stroke-width="2.5"/><path d="M164 42l7 5-7 5z" fill="#6366f1"/>' +
  '<rect x="174" y="4" width="158" height="88" rx="8" fill="#f5f3ff" stroke="#6d28d9" stroke-width="1.5"/>' +
  yaz(180, 10, 62, 'PC', '02', '#b45309') + yaz(248, 10, 78, 'IR', 'ADD 0B') +
  '<rect x="180" y="52" width="146" height="30" rx="15" fill="#f59e0b"/>' + T(253, 72, 'GETİR evresi bitti', 12, '#1f1300', weight=900) + '</svg>')


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#ede9fe"/>%s</svg>' % (aria, ic))


oz('oz-1.svg', 'Kontrol birimi, ALU ve yazmaçlar',
   '<rect x="8" y="8" width="64" height="12" rx="3" fill="#7c3aed"/>' + ''.join('<rect x="%d" y="24" width="14" height="10" rx="2" fill="#0ea5e9"/>' % (8 + i * 17) for i in range(4)) +
   '<path d="M20 40h40l-8 13h-8l-4-5-4 5h-8z" fill="#ea580c"/>')
oz('oz-2.svg', 'Getir, çöz, yürüt döngüsü',
   '<circle cx="40" cy="30" r="18" fill="none" stroke="#a78bfa" stroke-width="4"/><path d="M52 16l6 2-3 6" fill="none" stroke="#6d28d9" stroke-width="3" stroke-linecap="round"/>' +
   T(40, 24, 'G', 9, '#6d28d9', fam=M) + T(31, 41, 'Ç', 9, '#6d28d9', fam=M) + T(49, 41, 'Y', 9, '#6d28d9', fam=M))
oz('oz-3.svg', 'IPC çarpı saat hızı',
   '<path d="M8 36h8v-14h8v14h8v-14h8v14h8v-14h8v14h8" fill="none" stroke="#0891b2" stroke-width="2.5"/>' + T(40, 52, 'IPC × GHz', 10, '#0f172a', fam=M))
oz('oz-4.svg', 'Çekirdekler ve iş parçacıkları',
   ''.join('<rect x="%d" y="%d" width="26" height="18" rx="3" fill="#6d28d9"/><rect x="%d" y="%d" width="10" height="4" rx="2" fill="#fde68a"/><rect x="%d" y="%d" width="10" height="4" rx="2" fill="#a5f3fc"/>'
           % (x, y, x + 3, y + 5, x + 13, y + 5) for x, y in [(10, 8), (44, 8), (10, 32), (44, 32)]))
oz('oz-5.svg', 'Önbellek isabeti ve ıskası',
   '<rect x="6" y="14" width="14" height="32" rx="3" fill="#7c3aed"/><rect x="24" y="18" width="10" height="24" rx="2" fill="#4f46e5"/><rect x="38" y="16" width="12" height="28" rx="2" fill="#0891b2"/>'
   '<rect x="56" y="10" width="18" height="40" rx="3" fill="#059669"/>' + T(27, 56, 'isabet', 7, '#065f46') + T(62, 8, 'ıska', 7, '#b91c1c'))
oz('oz-6.svg', 'x86-64 ve ARM',
   ''.join('<rect x="%d" y="14" width="%d" height="10" rx="2" fill="#7c3aed"/>' % (x, ww) for x, ww in [(6, 8), (16, 4), (22, 12), (36, 6)]) +
   ''.join('<rect x="%d" y="36" width="14" height="10" rx="2" fill="#0891b2"/>' % x for x in [6, 22, 38, 54]) +
   T(64, 23, 'x86', 8, '#4c1d95') + T(40, 56, 'ARM · sabit 4 B', 7, '#155e75'))
