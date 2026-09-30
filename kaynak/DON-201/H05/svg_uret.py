# -*- coding: utf-8 -*-
# DON-201 H05 — SVG sahneleri üretir (python3 svg_uret.py). f-string kullanılmaz.
F = 'font-family="Inter,Arial,sans-serif"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def bg(id_, a='#f0f9ff', b='#dbeafe', W=360, H=240, r=18):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/>'
            '<stop offset="1" stop-color="%s"/></linearGradient></defs><rect width="%d" height="%d" rx="%d" fill="url(#%s)"/>') % (id_, a, b, W, H, r, id_)


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, F, size, weight, fill, anchor, t)


def svg(ad, aria, ic, W=360, H=240, sinif=''):
    w(ad, '<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"%s>%s</svg>' % (
        W, H, aria, (' class="%s"' % sinif) if sinif else '', ic))


# ── Anakart üstten görünüm (3D modelle aynı yerleşim; cm → px) ──
def kart(ox, oy, k, vurgu=None, akis=False, sade=False):
    def X(x): return ox + (x + 12.2) * k
    def Y(z): return oy + (z + 15.25) * k

    def r(x0, z0, x1, z1, fill, rx=0.15, ek=''):
        return '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="%s"%s/>' % (X(x0), Y(z0), (x1 - x0) * k, (z1 - z0) * k, rx * k, fill, ek)
    s = r(-12.2, -15.25, 12.2, 15.25, '#1f2d28', 0.4)
    # bakır yollar
    yol = '#4b7666'
    for i in range(6):
        s += '<path d="M%.1f %.1f H%.1f" stroke="%s" stroke-width="%.1f"/>' % (X(-0.6), Y(-10.2 + i * 0.5), X(1.9), yol, 0.12 * k)
    for i in range(5):
        s += '<path d="M%.1f %.1f V%.1f" stroke="%s" stroke-width="%.1f"/>' % (X(-4.4 + i * 0.4), Y(-4.6), Y(0.5), yol, 0.12 * k)
    for i in range(4):
        s += '<path d="M%.1f %.1f H%.1f" stroke="%s" stroke-width="%.1f"/>' % (X(6.9), Y(8.0 + i * 0.4), X(11.0), yol, 0.12 * k)
    s += '<path d="M%.1f %.1f L%.1f %.1f V%.1f L%.1f %.1f" fill="none" stroke="%s" stroke-width="%.1f"/>' % (X(-1.0), Y(-5.1), X(1.1), Y(-3.0), Y(4.4), X(2.3), Y(5.6), yol, 0.14 * k)
    # arka panel örtüsü + port uçları
    s += r(-11.1, -15.0, -8.9, -1.6, '#2c3037', 0.3)
    for z in (-13.9, -11.7, -9.4, -6.8, -3.6):
        s += r(-12.6, z - 0.9, -11.1, z + 0.9, '#9aa3ad', 0.1)
    # VRM soğutucuları
    s += r(-8.8, -13.75, 0.6, -12.05, '#4b525c', 0.2) + r(-8.85, -11.9, -7.15, -4.0, '#4b525c', 0.2)
    if not sade:
        for i in range(10):
            s += '<path d="M%.1f %.1f V%.1f" stroke="#6b7480" stroke-width="%.1f"/>' % (X(-8.3 + i * 0.95), Y(-13.6), Y(-12.2), 0.1 * k)
    # EPS, 24-pin, fan
    s += r(-7.35, -15.0, -5.25, -14.0, '#101114', 0.1) + r(10.08, -8.65, 11.12, -3.35, '#101114', 0.1) + r(-0.15, -14.55, 0.95, -14.05, '#e9eaec', 0.05)
    # soket
    s += r(-6.2, -11.4, -0.4, -4.6, '#c3c9d0', 0.3) + r(-5.6, -10.6, -1.0, -5.4, '#2a2d33', 0.2) + r(-5.2, -10.15, -1.4, -5.85, '#c99a3f', 0.1)
    s += '<path d="M%.1f %.1f h%.1f L%.1f %.1f z" fill="#f3c85a"/>' % (X(-5.55), Y(-10.55), 0.7 * k, X(-5.55), Y(-9.85))
    # RAM yuvaları
    for i, x in enumerate((2.3, 3.3, 4.3, 5.3)):
        s += r(x - 0.38, -14.5, x + 0.38, -0.3, '#4a4f58' if i % 2 == 0 else '#17181b', 0.1)
        s += r(x - 0.42, -14.9, x + 0.42, -14.3, '#d7dbe0', 0.1) + r(x - 0.42, -0.5, x + 0.42, 0.1, '#d7dbe0', 0.1)
    # PCIe
    for z, x1, zirh in ((0.9, -1.4, True), (2.9, -7.8, False), (7.0, -1.4, False), (9.0, -7.8, False)):
        s += r(-10.3, z - 0.38, x1, z + 0.38, '#b8bec6' if zirh else '#0f1012', 0.1)
    # M.2
    for z in (-2.2, 4.95):
        s += r(-9.05, z - 1.15, -8.15, z + 1.15, '#0f1012', 0.1) + '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#c9a44c"/>' % (X(-0.15), Y(z), 0.3 * k)
    # çipset, SATA, CMOS, başlıklar
    s += r(2.3, 5.1, 6.9, 9.7, '#4b525c', 0.4) + r(2.9, 5.7, 6.3, 9.1, '#aab1ba', 0.3)
    s += r(11.0, 7.95, 12.1, 9.25, '#101114', 0.1) + r(11.0, 9.95, 12.1, 11.25, '#101114', 0.1)
    s += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#cfd4da" stroke="#111" stroke-width="%.1f"/>' % (X(-2.4), Y(12.0), 1.0 * k, 0.15 * k)
    for bx in (8.6, 5.4, -9.6):
        s += r(bx - 0.6, 14.05, bx + 0.6, 14.55, '#e3b04f', 0.05)
    s += r(10.2, 1.15, 11.2, 3.45, '#1e3a8a', 0.1)
    if akis:
        for d, renk in ((('M%.1f %.1f H%.1f' % (X(-1.0), Y(-8.6), X(5.7))), '#38bdf8'),
                        (('M%.1f %.1f V%.1f H%.1f' % (X(-4.0), Y(-5.3), Y(0.9), X(-9.6))), '#f59e0b'),
                        (('M%.1f %.1f H%.1f' % (X(6.9), Y(8.6), X(11.3))), '#22c55e')):
            s += '<path class="isik" d="%s" fill="none" stroke="%s" stroke-width="%.1f" stroke-linecap="round" stroke-dasharray="%.1f %.1f"/>' % (d, renk, 0.45 * k, 1.2 * k, 1.0 * k)
    if vurgu:
        x0, z0, x1, z1 = vurgu
        s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="none" stroke="#f59e0b" stroke-width="%.1f"/>' % (
            X(x0) - 3, Y(z0) - 3, (x1 - x0) * k + 6, (z1 - z0) * k + 6, 4, max(2.5, 0.35 * k))
    return s


def kule(x, y, s=1.0):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="46" height="100" rx="6" fill="#1f2229"/>'
            '<rect x="4" y="5" width="38" height="90" rx="4" fill="#2c3038"/><circle cx="23" cy="16" r="4.5" fill="#1d2027" stroke="#7dd3fc" stroke-width="1.5"/>'
            '<rect x="10" y="28" width="26" height="3" rx="1.5" fill="#3a3f48"/><rect x="10" y="34" width="26" height="3" rx="1.5" fill="#3a3f48"/>'
            '<rect x="-2" y="98" width="10" height="4" rx="2" fill="#111"/><rect x="38" y="98" width="10" height="4" rx="2" fill="#111"/></g>') % (x, y, s)


def dizustu(x, y, s=1.0):
    return ('<g transform="translate(%s %s) scale(%s)"><path d="M10 0h70a4 4 0 0 1 4 4v48H6V4a4 4 0 0 1 4-4z" fill="#9ca3af"/>'
            '<rect x="11" y="5" width="68" height="43" rx="2" fill="url(#ekrangr)"/>'
            '<path d="M0 54h90l-6 8H6z" fill="#b8bec6"/><rect x="34" y="55.5" width="22" height="3" rx="1.5" fill="#9ca3af"/></g>') % (x, y, s)


def tumlesik(x, y, s=1.0):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="104" height="66" rx="4" fill="#111318"/>'
            '<rect x="4" y="4" width="96" height="50" rx="2" fill="url(#ekrangr)"/><rect x="0" y="56" width="104" height="10" rx="3" fill="#d4d8de"/>'
            '<path d="M44 66h16l6 22H38z" fill="#c3c8cf"/><rect x="28" y="86" width="48" height="5" rx="2.5" fill="#c3c8cf"/></g>') % (x, y, s)


EKRAN_GR = ('<linearGradient id="ekrangr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/>'
            '<stop offset=".6" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/></linearGradient>')


def ram(x, y, s=1.0, rot=0):
    g = '<g transform="translate(%s %s) rotate(%s) scale(%s)"><rect x="0" y="0" width="120" height="30" rx="2" fill="#1f5a3a"/>' % (x, y, rot, s)
    g += ''.join('<rect x="%d" y="5" width="12" height="12" rx="1" fill="#17181c"/>' % (8 + i * 14) for i in range(8))
    g += '<rect x="4" y="23" width="112" height="7" fill="#e3b04f"/><rect x="60" y="23" width="4" height="7" fill="#1f5a3a"/></g>'
    return g


def cpu(x, y, s=1.0):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="44" height="44" rx="3" fill="#1f5a3a"/>'
            '<rect x="7" y="7" width="30" height="30" rx="4" fill="#cbd2da" stroke="#94a3b8"/><path d="M2 2h7L2 9z" fill="#f3c85a"/></g>') % (x, y, s)


def ssd(x, y, s=1.0):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="80" height="22" rx="2" fill="#1f5a3a"/>'
            '<rect x="0" y="3" width="6" height="16" fill="#e3b04f"/><rect x="12" y="5" width="16" height="12" rx="1" fill="#17181c"/>'
            '<rect x="34" y="5" width="16" height="12" rx="1" fill="#17181c"/><rect x="54" y="6" width="16" height="10" rx="1" fill="#f1f5f9"/>'
            '<path d="M80 7a4 4 0 0 0 0 8z" fill="#dbeafe"/></g>') % (x, y, s)


def ekrankarti(x, y, s=1.0):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="110" height="34" rx="4" fill="#2a2d33"/>'
            '<circle cx="30" cy="17" r="13" fill="#15171b" stroke="#4b5059" stroke-width="2"/><circle cx="76" cy="17" r="13" fill="#15171b" stroke="#4b5059" stroke-width="2"/>'
            '<rect x="12" y="34" width="70" height="5" fill="#e3b04f"/><rect x="104" y="-4" width="6" height="42" fill="#9ca3af"/></g>') % (x, y, s)


def soru(x, y, r=13):
    return '<g><circle cx="%s" cy="%s" r="%s" fill="#fff" stroke="#f59e0b" stroke-width="2.5"/>%s</g>' % (x, y, r, T(x, y + r * 0.42, '?', int(r * 1.2), '#b45309', weight=900))


# ── Isınma
svg('isinma.svg', 'İşlemci, RAM, SSD ve ekran kartı ortada boş bir kartın çevresinde; aralarında soru işaretleri var',
    bg('h5is') + '<defs>' + EKRAN_GR + '</defs>' +
    '<rect x="120" y="56" width="120" height="140" rx="8" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="7 5"/>' +
    T(180, 132, 'Nasıl?', 16, '#64748b', weight=900) +
    cpu(34, 30, 1.0) + T(56, 90, 'İşlemci', 11) + ram(236, 28, 0.85) + T(287, 70, 'RAM', 11) +
    ssd(24, 170, 1.0) + T(64, 206, 'SSD', 11) + ekrankarti(232, 164, 0.95) + T(286, 214, 'Ekran kartı', 11) +
    '<g stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="5 5" fill="none"><path d="M82 60 Q120 70 130 90"/><path d="M234 50 Q220 70 228 90"/><path d="M104 180 Q116 176 124 170"/><path d="M232 178 Q240 170 236 160"/></g>' +
    soru(108, 76) + soru(252, 108) + soru(112, 176) + soru(246, 146))

# ── Yedek çizimler
svg('yedek-anakart.svg', 'Anakartın üstten görünümü: işlemci soketi, RAM yuvaları, PCIe ve M.2 yuvaları, çipset, SATA portları ve arka panel',
    bg('h5ya') + kart(118, 8, 7.4) +
    T(96, 70, 'Soket', 10, anchor='end') + T(96, 110, 'Arka panel', 10, anchor='end') + T(96, 136, 'PCIe x16', 10, anchor='end') +
    T(308, 60, 'RAM', 10, anchor='start') + T(308, 196, 'SATA', 10, anchor='start') + T(308, 178, 'Çipset', 10, anchor='start'))
svg('yedek-kasalar.svg', 'Masaüstü kule kasa, dizüstü ve tümleşik bilgisayar yan yana',
    bg('h5yk') + '<defs>' + EKRAN_GR + '</defs><rect x="0" y="176" width="360" height="64" fill="#e2e8f0"/>' +
    kule(40, 74, 1.0) + dizustu(118, 112, 1.0) + tumlesik(228, 84, 1.0) +
    T(63, 200, 'Masaüstü', 12) + T(163, 200, 'Dizüstü', 12) + T(280, 200, 'Tümleşik', 12))

# ── Quiz görseli: PCIe x16 işaretli
w('svg-quiz-pcie.svg', '<svg viewBox="0 0 170 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Anakart çizimi; alt yarıdaki uzun yatay yuva turuncu çerçeveyle işaretli">'
  '<rect width="170" height="130" rx="10" fill="#eef7fe"/>' + kart(35, 5, 3.95, vurgu=(-10.3, 0.52, -1.4, 1.28), sade=True) +
  '<path d="M150 70 L120 70" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/><path d="M120 70 l7 -5 v10z" fill="#f59e0b"/>' +
  '<circle cx="156" cy="70" r="9" fill="#fff" stroke="#f59e0b" stroke-width="2"/>' + T(156, 74.5, '?', 12, '#b45309', weight=900) + '</svg>')

# ── Derinleş: çipset şeması (JS/CSS ile akış canlanır)
d = bg('h5dr', '#f5f3ff', '#ede9fe')


def kutu(x, y, ww, hh, renk, baslik, alt='', koyu=False):
    g = '<rect x="%s" y="%s" width="%s" height="%s" rx="10" fill="%s" stroke="%s" stroke-width="2"/>' % (x, y, ww, hh, renk, '#1e293b' if koyu else '#cbd5e1')
    g += T(x + ww / 2.0, y + (hh / 2.0 + (0 if alt else 4)), baslik, 12, '#fff' if koyu else '#1e293b', weight=900)
    if alt:
        g += T(x + ww / 2.0, y + hh / 2.0 + 13, alt, 9, '#cbd5e1' if koyu else '#64748b', weight=700)
    return g


d += ('<g class="yol-dogrudan" fill="none" stroke-linecap="round">'
      '<path d="M140 62 H84" stroke="#bfdbfe" stroke-width="10"/><path d="M220 62 H276" stroke="#bfdbfe" stroke-width="10"/><path d="M180 38 V22 H250" stroke="#bfdbfe" stroke-width="7"/>'
      '<path class="akis a1" d="M140 62 H84" stroke="#2563eb" stroke-width="4" stroke-dasharray="6 10"/><path class="akis a2" d="M220 62 H276" stroke="#2563eb" stroke-width="4" stroke-dasharray="6 10"/>'
      '<path class="akis a3" d="M180 38 V22 H250" stroke="#2563eb" stroke-width="3" stroke-dasharray="6 10"/></g>'
      '<g class="yol-cipset" fill="none" stroke-linecap="round">'
      '<path d="M180 88 V130" stroke="#bbf7d0" stroke-width="8"/>'
      '<path d="M150 150 H112 V184 H66" stroke="#bbf7d0" stroke-width="5"/><path d="M160 164 V200 H130" stroke="#bbf7d0" stroke-width="5"/>'
      '<path d="M200 164 V200 H232" stroke="#bbf7d0" stroke-width="5"/><path d="M210 150 H250 V184 H296" stroke="#bbf7d0" stroke-width="5"/>'
      '<path class="akis b0" d="M180 88 V130" stroke="#16a34a" stroke-width="3.5" stroke-dasharray="5 9"/>'
      '<path class="akis b1" d="M150 150 H112 V184 H66" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="5 9"/><path class="akis b2" d="M160 164 V200 H130" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="5 9"/>'
      '<path class="akis b3" d="M200 164 V200 H232" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="5 9"/><path class="akis b4" d="M210 150 H250 V184 H296" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="5 9"/></g>')
d += kutu(140, 38, 80, 50, '#1e293b', 'İşlemci', koyu=True)
d += kutu(14, 44, 70, 36, '#fff', 'RAM', 'doğrudan') + kutu(276, 44, 72, 36, '#fff', 'Ekran kartı', 'PCIe x16')
d += kutu(250, 8, 76, 28, '#fff', 'M.2 SSD')
d += '<g class="cipset-kutu">' + kutu(142, 130, 76, 34, '#047857', 'Çipset', koyu=True) + '</g>'
d += kutu(14, 170, 52, 30, '#fff', 'SATA') + kutu(84, 186, 46, 30, '#fff', 'USB') + kutu(232, 186, 46, 30, '#fff', 'Ağ') + kutu(296, 170, 50, 30, '#fff', 'Ses')
d += ('<g><rect x="12" y="12" width="12" height="5" rx="2" fill="#2563eb"/>' + T(28, 17, 'Doğrudan işlemciye', 9, '#1e3a8a', 'start') +
      '<rect x="12" y="24" width="12" height="5" rx="2" fill="#16a34a"/>' + T(28, 29, 'Çipset üzerinden', 9, '#065f46', 'start') + '</g>')
svg('cipset.svg', 'Şema: RAM, ekran kartı ve M.2 SSD işlemciye doğrudan bağlı; SATA, USB, ağ ve ses çipset üzerinden işlemciye bağlı', d, sinif='cs')

# ── Özet kartları
svg('oz-1.svg', 'Masaüstü, dizüstü ve tümleşik bilgisayar', bg('h5o1') + '<defs>' + EKRAN_GR + '</defs><rect x="0" y="180" width="360" height="60" fill="#e2e8f0"/>' +
    kule(36, 78, 1.0) + dizustu(116, 116, 1.0) + tumlesik(226, 90, 1.0))
svg('oz-2.svg', 'Anakartın yollarında ışık akıyor', bg('h5o2') + kart(118, 8, 7.4, akis=True))
oz3 = bg('h5o3') + '<rect x="70" y="30" width="220" height="180" rx="16" fill="#1f2d28"/>'
oz3 += '<rect x="100" y="50" width="160" height="140" rx="10" fill="#c3c9d0"/><rect x="116" y="64" width="128" height="112" rx="6" fill="#2a2d33"/>'
oz3 += ''.join('<circle cx="%d" cy="%d" r="2" fill="#e4b75a"/>' % (130 + i * 10, 76 + j * 10) for i in range(11) for j in range(9))
oz3 += '<path d="M118 66h26L118 92z" fill="#f3c85a" stroke="#b45309" stroke-width="1.5"/><path d="M268 180 L300 70" stroke="#aab1ba" stroke-width="6" stroke-linecap="round"/>'
oz3 += '<rect x="292" y="56" width="18" height="12" rx="4" fill="#2a2d33"/>' + '<rect x="20" y="96" width="74" height="24" rx="12" fill="#fff" stroke="#f59e0b" stroke-width="2"/>' + T(57, 112, 'Yön işareti', 10, '#b45309')
svg('oz-3.svg', 'İşlemci soketi: pimler ve köşedeki üçgen yön işareti', oz3)
oz4 = bg('h5o4') + '<rect x="40" y="26" width="280" height="190" rx="14" fill="#1f2d28"/>'
for i in range(4):
    x = 90 + i * 52
    oz4 += '<rect x="%d" y="50" width="16" height="150" rx="3" fill="%s"/>' % (x, '#4a4f58' if i % 2 == 0 else '#17181b')
    oz4 += '<rect x="%d" y="40" width="20" height="14" rx="3" fill="#e5e7eb"/><rect x="%d" y="196" width="20" height="14" rx="3" fill="#e5e7eb"/>' % (x - 2, x - 2)
    oz4 += T(x + 8, 225, str(i + 1), 11, '#334155')
oz4 += ram(148, 60, 1.2, 90).replace('<g transform="translate(148 60) rotate(90) scale(1.2)">', '<g transform="translate(166 58) rotate(90) scale(1.18)">')
svg('oz-4.svg', 'Dört RAM yuvası; birine RAM takılı, mandallar kapalı', oz4)
oz5 = bg('h5o5') + '<rect x="18" y="26" width="324" height="190" rx="14" fill="#1f2d28"/>'
oz5 += '<rect x="40" y="60" width="200" height="16" rx="3" fill="#b8bec6"/>' + T(140, 50, 'PCIe x16 · ekran kartı', 11, '#e2e8f0')
oz5 += '<rect x="40" y="100" width="56" height="16" rx="3" fill="#0f1012"/>' + T(68, 134, 'PCIe x1', 10, '#e2e8f0')
oz5 += '<rect x="120" y="150" width="20" height="44" rx="3" fill="#0f1012"/>' + ssd(138, 160, 1.9).replace('scale(1.9)', 'scale(1.9)') + '<circle cx="296" cy="181" r="6" fill="#c9a44c"/><circle cx="296" cy="181" r="3" fill="#cbd5e1"/>'
oz5 += T(230, 210, 'M.2 SSD · vidayla', 10, '#e2e8f0')
svg('oz-5.svg', 'PCIe x16 ve x1 yuvaları; M.2 yuvasına vidalanmış SSD', oz5)
oz6 = bg('h5o6') + '<rect x="30" y="50" width="300" height="140" rx="12" fill="#2c3037"/>'
for i, (x, y, t) in enumerate(((60, 80, 'usb'), (60, 116, 'usb'), (110, 80, 'hdmi'), (110, 116, 'dp'), (165, 70, 'usbc'), (165, 100, 'usb3'), (165, 130, 'usb3'), (220, 76, 'rj45'), (220, 130, 'usb3'))):
    if t == 'rj45':
        oz6 += '<rect x="%d" y="%d" width="36" height="34" rx="2" fill="#cbd5e1"/><rect x="%d" y="%d" width="30" height="24" fill="#0f172a"/>' % (x, y, x + 3, y + 4)
    elif t == 'usbc':
        oz6 += '<rect x="%d" y="%d" width="30" height="12" rx="6" fill="#cbd5e1"/><rect x="%d" y="%d" width="24" height="7" rx="3.5" fill="#0f172a"/>' % (x + 3, y, x + 6, y + 2.5)
    elif t in ('hdmi', 'dp'):
        oz6 += '<path d="M%d %d h40 v10 l-5 7 h-30 l-5 -7z" fill="#cbd5e1"/><path d="M%d %d h34 v8 l-4 5 h-26 l-4 -5z" fill="#0f172a"/>' % (x, y, x + 3, y + 2)
    else:
        oz6 += '<rect x="%d" y="%d" width="36" height="17" rx="2" fill="#cbd5e1"/><rect x="%d" y="%d" width="30" height="11" fill="#0f172a"/><rect x="%d" y="%d" width="26" height="4" fill="%s"/>' % (
            x, y, x + 3, y + 3, x + 5, y + 4, '#1f5fd1' if t == 'usb3' else '#475569')
for i, c in enumerate(('#38bdf8', '#22c55e', '#f472b6')):
    oz6 += '<circle cx="290" cy="%d" r="11" fill="none" stroke="%s" stroke-width="5"/><circle cx="290" cy="%d" r="5" fill="#0f172a"/>' % (80 + i * 38, c, 80 + i * 38)
svg('oz-6.svg', 'Anakartın arka paneli: USB, HDMI, DisplayPort, ağ ve ses portları', oz6)

# ── Etkinlik 2: dedektif kartı simgeleri (120 × 80)
IK = '<rect width="120" height="80" rx="12" fill="#eef6f3"/>'
w('ga-soket.svg', '<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + IK +
  '<rect x="30" y="10" width="60" height="60" rx="6" fill="#c3c9d0"/><rect x="38" y="18" width="44" height="44" rx="3" fill="#2a2d33"/>' +
  ''.join('<circle cx="%d" cy="%d" r="1.4" fill="#e4b75a"/>' % (44 + i * 6, 24 + j * 6) for i in range(6) for j in range(6)) +
  '<path d="M39 19h11L39 30z" fill="#f3c85a"/><path d="M92 62 L104 22" stroke="#9aa3ad" stroke-width="4" stroke-linecap="round"/></svg>')
w('ga-ram.svg', '<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + IK +
  ''.join('<rect x="%d" y="12" width="9" height="56" rx="2" fill="%s"/><rect x="%d" y="8" width="11" height="7" rx="2" fill="#e5e7eb"/><rect x="%d" y="65" width="11" height="7" rx="2" fill="#e5e7eb"/>' % (
      30 + i * 17, '#4a4f58' if i % 2 == 0 else '#17181b', 29 + i * 17, 29 + i * 17) for i in range(4)) + '</svg>')
w('ga-pcie.svg', '<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + IK +
  '<rect x="12" y="20" width="96" height="10" rx="2" fill="#b8bec6"/><rect x="12" y="44" width="30" height="10" rx="2" fill="#17181b"/><rect x="104" y="17" width="8" height="16" rx="2" fill="#5b616b"/>' +
  '<rect x="30" y="23" width="2" height="4" fill="#1f2229"/>' + T(80, 55, 'x16 · x1', 10, '#334155') + '</svg>')
w('ga-m2.svg', '<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + IK +
  '<rect x="10" y="26" width="10" height="28" rx="2" fill="#17181b"/>' + ssd(18, 29, 1.0) + '<circle cx="104" cy="40" r="5" fill="#c9a44c"/><path d="M101 40h6M104 37v6" stroke="#475569" stroke-width="1.5"/></svg>')
w('ga-sata.svg', '<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + IK +
  ''.join('<rect x="%d" y="%d" width="40" height="22" rx="3" fill="#131417"/><path d="M%d %d h32 v12 h-26 v-5 h-6z" fill="#020203"/><rect x="%d" y="%d" width="22" height="3" fill="#d9a843"/>' % (
      x, y, x + 4, y + 5, x + 12, y + 9) for x, y in ((16, 14), (16, 44), (64, 14), (64, 44))) + '</svg>')
w('ga-usb.svg', '<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + IK +
  '<rect x="18" y="12" width="84" height="56" rx="6" fill="#2c3037"/>' +
  ''.join('<rect x="%d" y="%d" width="26" height="12" rx="1.5" fill="#cbd5e1"/><rect x="%d" y="%d" width="22" height="8" fill="#0f172a"/><rect x="%d" y="%d" width="18" height="3" fill="%s"/>' % (
      x, y, x + 2, y + 2, x + 4, y + 3, '#1f5fd1' if i > 1 else '#475569') for i, (x, y) in enumerate(((28, 20), (28, 40), (66, 20), (66, 40)))) + '</svg>')
print('SVG dosyaları yazıldı.')
